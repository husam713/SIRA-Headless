import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { getWordPressSiteConfig } from "@/config/wordpress";
import { resolveSiteFromHostname } from "@/lib/host/resolve-site";

// The trusted server-side leg of the contact form.
//
// The browser never talks to WordPress. It posts here; this route validates
// again, then forwards to sira-core's `/sira/v1/contact` endpoint on the tenant
// the request actually came from. That keeps the CMS hostname out of client
// code, keeps the WordPress origin off the public form surface, and means the
// same validation runs whatever the client does.
//
// 2C4-B08 (forms architecture) was resolved by the owner in favour of the
// site's own wp_mail path rather than a third-party form service.

const MAX = Object.freeze({
  name: 120,
  email: 200,
  phone: 40,
  service: 80,
  message: 4000,
});

// Requests per window, per client address. Deliberately generous: this exists
// to blunt scripted abuse, not to police a person filling the form twice.
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

// Process-local, which is the honest scope for it: a serverless deployment may
// run several instances, so this is a speed bump in front of the CMS endpoint's
// own per-IP limit rather than the only defence.
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);

  if (entry === undefined || now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count += 1;

  // Opportunistic sweep; the map would otherwise grow for the process lifetime.
  if (attempts.size > 5000) {
    for (const [k, v] of attempts) {
      if (now > v.resetAt) attempts.delete(k);
    }
  }

  return entry.count > RATE_LIMIT;
}

function clean(value: unknown, max: number, multiline = false): string {
  if (typeof value !== "string") return "";

  const stripped = value
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/gu, "")
    .replace(multiline ? /\r\n?/gu : /\s+/gu, multiline ? "\n" : " ");

  return stripped.trim().slice(0, max);
}

// Deliberately not a "clever" address regex: one @, something either side, a
// dot in the domain, no whitespace and no comma. WordPress's is_email() is the
// authority downstream; this only rejects the obviously wrong before a network
// call.
const EMAIL = /^[^\s@,]+@[^\s@,]+\.[^\s@,]{2,}$/u;

export async function POST(request: Request): Promise<NextResponse> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host") ?? "";
  const resolution = resolveSiteFromHostname(host);

  if (resolution === null) {
    return NextResponse.json({ status: "error", code: "unknown_site" }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ status: "error", code: "bad_request" }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null) {
    return NextResponse.json({ status: "error", code: "bad_request" }, { status: 400 });
  }

  const body = payload as Record<string, unknown>;

  // Honeypot. Answered as success so a bot learns nothing from the response.
  if (clean(body["company_website"], 100) !== "") {
    return NextResponse.json({ status: "received" }, { status: 202 });
  }

  const client =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    requestHeaders.get("x-real-ip") ??
    "unknown";

  if (rateLimited(`${resolution.site.key}:${client}`)) {
    return NextResponse.json({ status: "error", code: "rate_limited" }, { status: 429 });
  }

  const name = clean(body["name"], MAX.name);
  const email = clean(body["email"], MAX.email);
  const phone = clean(body["phone"], MAX.phone);
  const service = clean(body["service"], MAX.service);
  const message = clean(body["message"], MAX.message, true);

  const fields: Record<string, string> = {};
  if (name === "") fields["name"] = "required";
  if (email === "" || !EMAIL.test(email)) fields["email"] = "invalid";
  if (message.length < 10) fields["message"] = "too_short";

  if (Object.keys(fields).length > 0) {
    return NextResponse.json({ status: "invalid", fields }, { status: 422 });
  }

  // The CMS endpoint sits beside the GraphQL endpoint this tenant is already
  // configured with, so the hostname is never written down twice.
  let endpoint: URL;
  try {
    const config = getWordPressSiteConfig(resolution.site.key);
    endpoint = new URL("/wp-json/sira/v1/contact", config.graphqlEndpoint);
  } catch {
    return NextResponse.json({ status: "error", code: "not_configured" }, { status: 503 });
  }

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, email, phone, service, message }),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });

    if (upstream.status === 201 || upstream.status === 202) {
      return NextResponse.json({ status: "received" }, { status: 201 });
    }

    if (upstream.status === 422) {
      const detail = (await upstream.json().catch(() => ({}))) as {
        fields?: Record<string, string>;
      };
      return NextResponse.json(
        { status: "invalid", fields: detail.fields ?? {} },
        { status: 422 },
      );
    }

    if (upstream.status === 429) {
      return NextResponse.json({ status: "error", code: "rate_limited" }, { status: 429 });
    }

    // Never surface the upstream body: it is a CMS response and may name the
    // origin or its plugins.
    console.warn("SIRA contact upstream rejected the submission.", {
      siteKey: resolution.site.key,
      upstreamStatus: upstream.status,
    });
    return NextResponse.json({ status: "error", code: "delivery_failed" }, { status: 502 });
  } catch (error) {
    console.warn("SIRA contact upstream unreachable.", {
      siteKey: resolution.site.key,
      errorName: error instanceof Error ? error.name : "UnknownContactError",
    });
    return NextResponse.json({ status: "error", code: "unreachable" }, { status: 502 });
  }
}

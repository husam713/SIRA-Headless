import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { recentRevalidationEvents } from "@/lib/revalidation/dedupe";
import { planEdgePurge } from "@/lib/revalidation/purge";
import {
  mapRevalidationTags,
  readRevalidationGranularity,
} from "@/lib/revalidation/tag-map";
import {
  RevalidationRejectedError,
  verifyRevalidationRequest,
} from "@/lib/revalidation/verify";

/**
 * The receiving end of the WordPress revalidation webhook.
 *
 * `sira-core` queues an event on every publish, update, trash, menu, term,
 * media and brand change, signs it, and POSTs it here with three retries. This
 * handler verifies it (`lib/revalidation/verify.ts`), translates its tags to
 * the ones the app's fetches carry (`tag-map.ts`), and expires them. The next
 * request for anything that read those tags refetches; nothing else moves,
 * and no other tenant is touched.
 *
 * Contract details that matter:
 *
 * - The sender retries every non-2xx. So a bad signature is 401 (it will be
 *   retried three times and then logged on the WordPress side — correct,
 *   because a misconfigured secret should be noticed), but a purge that could
 *   not complete downstream is still 200: a retry storm cannot fix it and the
 *   Data Cache TTL is the backstop.
 * - `trailingSlash: true` means the configured URL must end in
 *   `/api/revalidate/`; the sender follows no redirects.
 * - `revalidateTag(..., { expire: 0 })`: the next request is fresh, rather
 *   than served stale once while a background refresh runs — an editor who
 *   just published expects the very next reload to show it.
 * - Expiry here reaches THIS process's cache. With more than one Cloud Run
 *   instance the others keep their copies until their TTL; the single-instance
 *   interim and the CDN purge are the documented answers to that.
 */

export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" } as const;

interface RevalidationLog {
  readonly severity: "INFO" | "WARNING" | "ERROR";
  readonly event: "revalidation";
  readonly outcome: string;
  readonly eventId?: string;
  readonly siteKey?: string;
  readonly blogId?: number;
  readonly source?: string;
  readonly operation?: string;
  readonly postType?: string | null;
  readonly postId?: number | null;
  readonly tagsApplied?: readonly string[];
  readonly tagsDropped?: readonly string[];
  /** What an edge purge would cover; logged until a CDN purge client exists. */
  readonly edgePurge?: { readonly wholeHost: boolean; readonly urls: readonly string[] } | null;
  readonly durationMs: number;
}

function log(entry: RevalidationLog): void {
  console.log(JSON.stringify(entry));
}

export async function POST(request: NextRequest): Promise<Response> {
  const startedAt = performance.now();
  const durationMs = (): number => Math.round(performance.now() - startedAt);

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    log({ severity: "WARNING", event: "revalidation", outcome: "unreadable-body", durationMs: durationMs() });
    return NextResponse.json({ accepted: false, reason: "unreadable-body" }, { status: 400, headers: NO_STORE });
  }

  let event;
  try {
    event = verifyRevalidationRequest({ headers: request.headers, rawBody });
  } catch (error) {
    if (error instanceof RevalidationRejectedError) {
      log({ severity: "WARNING", event: "revalidation", outcome: error.reason, durationMs: durationMs() });
      return NextResponse.json(
        { accepted: false, reason: error.reason },
        { status: error.status, headers: NO_STORE },
      );
    }
    throw error;
  }

  if (recentRevalidationEvents.remember(event.eventId)) {
    log({
      severity: "INFO", event: "revalidation", outcome: "duplicate",
      eventId: event.eventId, siteKey: event.siteKey, blogId: event.blogId, durationMs: durationMs(),
    });
    return NextResponse.json(
      { accepted: true, duplicate: true, eventId: event.eventId, siteKey: event.siteKey },
      { headers: NO_STORE },
    );
  }

  const granularity = readRevalidationGranularity();
  const { tags, dropped } = mapRevalidationTags(
    event.siteKey,
    event.blogId,
    event.tags,
    granularity,
  );
  const purge = planEdgePurge(event.siteKey, event.paths, event.tags, granularity);

  try {
    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
    }
  } catch (error) {
    log({
      severity: "ERROR", event: "revalidation", outcome: "expire-failed",
      eventId: event.eventId, siteKey: event.siteKey, blogId: event.blogId,
      tagsApplied: tags, durationMs: durationMs(),
    });
    throw error;
  }

  log({
    severity: "INFO", event: "revalidation", outcome: "accepted",
    eventId: event.eventId, siteKey: event.siteKey, blogId: event.blogId,
    source: event.source, operation: event.operation, postType: event.postType, postId: event.postId,
    tagsApplied: tags, tagsDropped: dropped,
    edgePurge: purge === null ? null : { wholeHost: purge.wholeHost, urls: purge.urls },
    durationMs: durationMs(),
  });

  return NextResponse.json(
    { accepted: true, duplicate: false, eventId: event.eventId, siteKey: event.siteKey, tags, edgePurge: purge },
    { headers: NO_STORE },
  );
}

export function GET(): Response {
  return new NextResponse("Method Not Allowed", {
    status: 405,
    headers: { ...NO_STORE, Allow: "POST" },
  });
}

import type { NextRequest } from "next/server";
import { normalizeHostname } from "@/lib/host/normalize-host";

type HostRequest = Pick<NextRequest, "headers" | "nextUrl">;

function normalizeHostSource(value: string): string | null {
  if (
    value.length === 0 ||
    value !== value.trim() ||
    /[\u0000-\u001f\u007f]/u.test(value)
  ) {
    return null;
  }

  try {
    return normalizeHostname(value);
  } catch {
    return null;
  }
}

/**
 * Select the runtime request hostname without trusting forwarding headers.
 *
 * Direct Host is authoritative when present because the repository does not
 * establish a trusted reverse-proxy forwarding boundary. The framework URL is
 * only a fallback for synthetic/framework requests where Host is absent. Site
 * selection still requires a separate allowlisted registry match.
 */
export function getEffectiveRequestHostname(
  request: HostRequest,
): string | null {
  const directHost = request.headers.get("host");

  if (directHost !== null) {
    return normalizeHostSource(directHost);
  }

  return normalizeHostSource(request.nextUrl.hostname);
}

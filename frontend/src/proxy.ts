import { NextResponse, type NextRequest } from "next/server";
import {
  getInternalSitePath,
  isInternalSitePath,
  resolveSiteFromHostname,
} from "@/lib/host/resolve-site";
import { getEffectiveRequestHostname } from "@/lib/host/effective-host";

const UNTRUSTED_INTERNAL_HEADERS = [
  "x-sira-site-key",
  "x-sira-blog-id",
  "x-sira-brand-key",
] as const;

const NO_INDEX_HEADER = "noindex, nofollow, noarchive";

function rejectUnknownHostname(): NextResponse {
  return new NextResponse("Misdirected Request", {
    status: 421,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": NO_INDEX_HEADER,
    },
  });
}

function rejectInternalPath(): NextResponse {
  return new NextResponse("Not Found", {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": NO_INDEX_HEADER,
    },
  });
}

export function proxy(request: NextRequest): NextResponse {
  const pathname = request.nextUrl.pathname;

  if (isInternalSitePath(pathname)) {
    return rejectInternalPath();
  }

  const effectiveHostname = getEffectiveRequestHostname(request);
  const resolution =
    effectiveHostname === null
      ? null
      : resolveSiteFromHostname(effectiveHostname);

  if (resolution === null) {
    return rejectUnknownHostname();
  }

  if (resolution.shouldRedirectToCanonical) {
    const canonicalUrl = request.nextUrl.clone();
    canonicalUrl.protocol = "https:";
    canonicalUrl.hostname = resolution.site.canonicalHostname;
    canonicalUrl.port = "";

    return NextResponse.redirect(canonicalUrl, 308);
  }

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = getInternalSitePath(resolution.site.key, pathname);

  const requestHeaders = new Headers(request.headers);

  for (const headerName of UNTRUSTED_INTERNAL_HEADERS) {
    requestHeaders.delete(headerName);
  }

  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  });

  if (resolution.hostnameRole === "deployment") {
    response.headers.set("X-Robots-Tag", NO_INDEX_HEADER);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api(?:/|$)|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml|json|woff2?)$).*)",
  ],
};

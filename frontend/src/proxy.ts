import { NextResponse, type NextRequest } from "next/server";
import {
  getInternalSitePath,
  isInternalSitePath,
  resolveSiteFromHostname,
} from "@/lib/host/resolve-site";
import { getEffectiveRequestHostname } from "@/lib/host/effective-host";
import { LOCALE_HEADER, PATH_HEADER, splitLocalePath } from "@/lib/i18n/locale";

const UNTRUSTED_INTERNAL_HEADERS = [
  "x-sira-site-key",
  "x-sira-blog-id",
  "x-sira-brand-key",
  LOCALE_HEADER,
  PATH_HEADER,
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

  // Checked against the locale-stripped path as well, so `/ar/digital` cannot
  // reach an internal route that `/digital` is rejected for.
  if (
    isInternalSitePath(pathname) ||
    isInternalSitePath(splitLocalePath(pathname).path)
  ) {
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

  // ADR-034. The locale lives in the URL, and it is spent here: the prefix is
  // taken off the path before the rewrite, and the resolved locale continues as
  // a request header instead. That keeps one route tree serving both languages
  // rather than a duplicate of every route under /ar.
  //
  // A prefix naming a locale this site does not support is left in the path, so
  // it reaches the router as an ordinary segment and 404s. Silently serving the
  // default locale would give every unsupported prefix a duplicate of the whole
  // site at a second set of URLs.
  const requested = splitLocalePath(pathname);
  const locale =
    requested.locale !== null &&
    resolution.site.localeRoutesApproved &&
    resolution.site.supportedLocales.includes(requested.locale)
      ? requested.locale
      : null;
  const localelessPath = locale === null ? pathname : requested.path;

  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = getInternalSitePath(
    resolution.site.key,
    localelessPath,
  );

  const requestHeaders = new Headers(request.headers);

  for (const headerName of UNTRUSTED_INTERNAL_HEADERS) {
    requestHeaders.delete(headerName);
  }

  if (locale !== null) {
    requestHeaders.set(LOCALE_HEADER, locale);
  }

  requestHeaders.set(PATH_HEADER, localelessPath);

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

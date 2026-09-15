import type { Metadata } from "next";
import type { ResolvedBrand } from "@/lib/brand";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import type { SiteDiscoveryContext } from "@/lib/seo/discovery";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { localeHref } from "@/lib/i18n/locale";
import type { LocaleCode } from "@/types/site";

function getDescription(brand: ResolvedBrand): string | undefined {
  return brand.description ?? brand.tagline ?? undefined;
}

export interface SiteMetadataOptions {
  readonly forceNoIndex?: boolean;
  /** The language this response is in. Defaults to the site's own default. */
  readonly locale?: LocaleCode;
  /**
   * The locale-less request path, used to build the `hreflang` set.
   *
   * Passing it is what makes the alternates point at the same page in the other
   * language rather than at that language's homepage — which is the failure
   * mode search engines treat as a missing translation.
   */
  readonly path?: string;
}

/**
 * The `hreflang` set for a page that exists in more than one language.
 *
 * `x-default` points at the site's default locale, which is the honest answer
 * for a Saudi company whose English site is the one a search engine should fall
 * back to when it has no better signal.
 */
function buildLanguageAlternates(
  context: SiteDiscoveryContext,
  path: string,
): Record<string, string> | undefined {
  const site = getSiteDefinition(context.site.key);

  // Declared intent is not an approved route. Emitting `hreflang` for a tenant
  // whose `/ar` pages do not exist advertises URLs that 404.
  if (site === null || !site.localeRoutesApproved) return undefined;
  if (site.supportedLocales.length < 2) return undefined;

  const alternates: Record<string, string> = {};

  for (const locale of site.supportedLocales) {
    alternates[locale] = buildCanonicalUrl(
      context.site.key,
      localeHref(site, locale, path),
    ).toString();
  }

  alternates["x-default"] = buildCanonicalUrl(
    context.site.key,
    localeHref(site, site.defaultLocale, path),
  ).toString();

  return alternates;
}

export function buildSiteMetadata(
  context: SiteDiscoveryContext,
  brand: ResolvedBrand,
  pathname = "/",
  options: SiteMetadataOptions = {},
): Metadata {
  const site = getSiteDefinition(context.site.key);
  const locale = options.locale ?? site?.defaultLocale ?? "en";
  const localizedPath =
    site === null ? pathname : localeHref(site, locale, pathname);
  const canonicalUrl = buildCanonicalUrl(context.site.key, localizedPath);
  const metadataBase = buildCanonicalUrl(context.site.key, "/");
  const description = getDescription(brand);
  const isIndexable =
    context.isProductionCanonical && options.forceNoIndex !== true;
  const languages = buildLanguageAlternates(context, options.path ?? pathname);

  return {
    metadataBase,
    title: {
      default: brand.name,
      template: `%s | ${brand.name}`,
    },
    ...(description === undefined ? {} : { description }),
    alternates: {
      canonical: canonicalUrl,
      ...(languages === undefined ? {} : { languages }),
    },
    robots: {
      index: isIndexable,
      follow: isIndexable,
      nocache: !isIndexable,
      googleBot: {
        index: isIndexable,
        follow: isIndexable,
        noimageindex: !isIndexable,
      },
    },
    openGraph: {
      type: "website",
      siteName: brand.name,
      title: brand.name,
      url: canonicalUrl,
      locale: locale === "ar" ? "ar_SA" : "en_SA",
      ...(description === undefined ? {} : { description }),
    },
    twitter: {
      card: "summary",
      title: brand.name,
      ...(description === undefined ? {} : { description }),
    },
  };
}

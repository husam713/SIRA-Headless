import "server-only";

import { notFound } from "next/navigation";

import type { ProjectCardData } from "@/components/atlas/project-card";
import type { PageHeroImage } from "@/components/atlas/page-hero";
import { getBrand, type ResolvedBrand } from "@/lib/brand";
import { getContentPageForLocale, type ContentPage } from "@/lib/content/get-content-page";
import { getHomepageForRequest } from "@/lib/homepage";
import { resolveAccentForBusinessUnitSlug } from "@/lib/homepage/business-unit-accent";
import type {
  Homepage,
  HomepageContactSection,
  HomepageMedia,
} from "@/lib/homepage/types";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { CHROME, localeHref, localeUri, localizeUnitLabel, type Chrome } from "@/lib/i18n/locale";
import { getRequestLocale, type RequestLocale } from "@/lib/i18n/request-locale";
import type { ProjectArchiveItem } from "@/lib/projects/types";
import { isAtlasTenant } from "@/lib/atlas/routes";
import type { LocaleCode, SiteDefinition } from "@/types/site";

// What every Atlas inner page needs before it can render: the tenant, the
// language, its brand, the CMS page carrying its heading block, and the
// homepage — whose contact chapter is the closing invitation and whose hero
// photograph is the closing's ground. The homepage query is request-cached
// and already awaited by the layout, so reading it again here costs nothing.

export interface AtlasPageContext {
  readonly site: SiteDefinition;
  readonly request: RequestLocale;
  readonly chrome: Chrome;
  readonly brand: ResolvedBrand;
  readonly page: ContentPage | null;
  readonly homepage: Homepage | null;
  /** The homepage contact chapter — the closing's copy. */
  readonly closing: HomepageContactSection | null;
  /** The tenant's hero photograph — the closing's ground. */
  readonly closingImage: HomepageMedia | null;
  readonly href: (path: string) => string;
}

function heroMedia(homepage: Homepage | null): HomepageMedia | null {
  if (homepage === null || homepage.hero === null) return null;

  if (homepage.variant === "group") {
    const slides = homepage.hero.slides;
    // The last slide rather than the first: the page opened on the first.
    const slide = slides[slides.length - 1] ?? null;
    return slide?.image ?? null;
  }

  if (homepage.variant === "branch") return homepage.hero.image;

  return null;
}

/**
 * Resolves the page for an Atlas route. `pageUris` are the CMS URIs the route's
 * heading block may live at, tried in order — a route whose path collides with
 * a post type's archive slug (`/projects/`, `/services/`) keeps its page at a
 * different slug, and this is where that mapping lives.
 */
export async function resolveAtlasPage(
  params: Promise<{ readonly siteKey: string }>,
  pageUris: readonly string[],
): Promise<AtlasPageContext> {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null || !isAtlasTenant(site.key)) notFound();

  const request = await getRequestLocale(site);
  const [brand, homepageResolution, ...pages] = await Promise.all([
    getBrand(site.key),
    getHomepageForRequest(site.key, localeUri(request.locale, site, "/")),
    ...pageUris.map((uri) =>
      getContentPageForLocale(site.key, localeUri(request.locale, site, uri), uri),
    ),
  ]);

  const page = pages.find((candidate) => candidate !== null) ?? null;
  const homepage = homepageResolution.status === "ready" ? homepageResolution.homepage : null;

  return {
    site,
    request,
    chrome: CHROME[request.locale],
    brand,
    page,
    homepage,
    closing: homepage?.contact ?? null,
    closingImage: heroMedia(homepage),
    href: (path) => localeHref(site, request.locale, path),
  };
}

/** The page's featured image as the hero wants it, or null. */
export function pageHeroImage(page: ContentPage | null): PageHeroImage | null {
  const image = page?.featuredImage ?? null;
  return image === null
    ? null
    : {
        sourceUrl: image.sourceUrl,
        altText: image.altText,
        width: image.width,
        height: image.height,
      };
}

/**
 * An archive item as the card renders it, with the company's accent. The
 * item's href is already the public path for its language (a translation's
 * is `/ar/projects/…/`), so it is not prefixed again here.
 */
export function toProjectCard(item: ProjectArchiveItem, locale: LocaleCode = "en"): ProjectCardData {
  const accent = item.unit === null ? null : resolveAccentForBusinessUnitSlug(item.unit.slug);

  return {
    databaseId: item.databaseId,
    title: item.title,
    href: item.href,
    excerpt: item.excerpt,
    featuredImage: item.featuredImage,
    status: item.status,
    location: item.location,
    year: item.year,
    unitLabel: localizeUnitLabel(locale, item.unit?.slug ?? null, item.unit?.name ?? accent?.label ?? item.companyTitle),
    unitSlug: item.unit?.slug ?? null,
    accentColor: accent?.color ?? null,
  };
}

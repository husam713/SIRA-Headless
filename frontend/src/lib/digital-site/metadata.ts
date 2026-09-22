import "server-only";

import type { Metadata } from "next";

import { getDigitalSiteContent } from "@/content/digital-site";
import { createFallbackBrand } from "@/lib/brand";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import type { LocaleCode, SiteDefinition } from "@/types/site";

export type DigitalPageKey = "home" | "services" | "about" | "contact";

/** A page whose words come from the CMS (privacy, terms). */
export interface DigitalCustomPage {
  readonly title: string;
  readonly description: string | null;
}

interface DigitalMetadataOptions {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
  /** The locale-less request path, for canonical and `hreflang`. */
  readonly path: string;
  readonly hostname: string;
  readonly page: DigitalPageKey | DigitalCustomPage;
  readonly forceNoIndex?: boolean;
}

/**
 * Metadata for a Digital route. Canonical, `hreflang`, robots and the
 * indexing switch are the platform's (`buildSiteMetadata`); the words are the
 * site's own, in the reader's language, and the icon and share image are the
 * Digital identity's rather than the group's.
 */
export function buildDigitalMetadata(options: DigitalMetadataOptions): Metadata {
  const { site, locale, path, hostname, page } = options;
  const content = getDigitalSiteContent(locale);
  const meta =
    typeof page === "string"
      ? content.meta[page]
      : { title: page.title, description: page.description ?? content.meta.home.description };
  const discovery = resolveSiteDiscoveryContext(site.key, hostname);
  const base = buildSiteMetadata(discovery, createFallbackBrand(site.key), path, {
    locale,
    path,
    ...(options.forceNoIndex === undefined ? {} : { forceNoIndex: options.forceNoIndex }),
  });
  const shareImage = `/digital/share-${locale}.png`;

  return {
    ...base,
    title: {
      absolute: page === "home" ? meta.title : `${meta.title} · ${content.meta.siteName}`,
    },
    description: meta.description,
    icons: {
      icon: [{ url: "/digital/icon.svg", type: "image/svg+xml" }],
    },
    openGraph: {
      ...base.openGraph,
      siteName: content.meta.siteName,
      title: meta.title,
      description: meta.description,
      images: [{ url: shareImage, width: 1200, height: 630, alt: content.meta.siteName }],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [shareImage],
    },
  };
}

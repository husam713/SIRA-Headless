import type { Metadata } from "next";
import type { ResolvedBrand } from "@/lib/brand";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import type { SiteDiscoveryContext } from "@/lib/seo/discovery";

function getDescription(brand: ResolvedBrand): string | undefined {
  return brand.description ?? brand.tagline ?? undefined;
}

export function buildSiteMetadata(
  context: SiteDiscoveryContext,
  brand: ResolvedBrand,
  pathname = "/",
): Metadata {
  const canonicalUrl = buildCanonicalUrl(context.site.key, pathname);
  const metadataBase = buildCanonicalUrl(context.site.key, "/");
  const description = getDescription(brand);
  const isIndexable = context.isProductionCanonical;

  return {
    metadataBase,
    title: {
      default: brand.name,
      template: `%s | ${brand.name}`,
    },
    ...(description === undefined ? {} : { description }),
    alternates: {
      canonical: canonicalUrl,
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
      ...(description === undefined ? {} : { description }),
    },
    twitter: {
      card: "summary",
      title: brand.name,
      ...(description === undefined ? {} : { description }),
    },
  };
}

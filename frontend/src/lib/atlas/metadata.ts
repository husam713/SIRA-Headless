import type { Metadata } from "next";

import type { PageHeroImage } from "@/components/atlas/page-hero";
import { splitHighlight } from "@/lib/atlas/highlight";

// The metadata an Atlas page adds on top of the site's.
//
// The tenant layout already sets the `%s | Brand` title template, so a route
// passes its own title only — a route that appends the brand itself is
// branded twice. The heading's highlight marks are editorial, not a title.
// The same title, description and photograph go to Open Graph and Twitter,
// which `buildSiteMetadata` otherwise fills with the brand alone.

interface AtlasPageMetadataOptions {
  readonly base: Metadata;
  readonly title: string;
  readonly description?: string | null | undefined;
  readonly image?:
    | PageHeroImage
    | { readonly sourceUrl: string; readonly altText?: string | null }
    | null
    | undefined;
}

export function atlasPageMetadata({
  base,
  title,
  description,
  image,
}: AtlasPageMetadataOptions): Metadata {
  const plainTitle = splitHighlight(title).text;
  const plainDescription =
    description === undefined || description === null || description === ""
      ? undefined
      : description;
  const images =
    image === undefined || image === null
      ? undefined
      : [{ url: image.sourceUrl, ...(image.altText ? { alt: image.altText } : {}) }];

  return {
    ...base,
    title: plainTitle,
    ...(plainDescription === undefined ? {} : { description: plainDescription }),
    openGraph: {
      ...base.openGraph,
      title: plainTitle,
      ...(plainDescription === undefined ? {} : { description: plainDescription }),
      ...(images === undefined ? {} : { images }),
    },
    twitter: {
      ...base.twitter,
      card: images === undefined ? "summary" : "summary_large_image",
      title: plainTitle,
      ...(plainDescription === undefined ? {} : { description: plainDescription }),
      ...(images === undefined ? {} : { images: images.map((entry) => entry.url) }),
    },
  };
}

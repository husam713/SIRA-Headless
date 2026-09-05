// Which editorial permalinks this app actually serves.
//
// The four bases are WordPress's own, kept rather than folded under an
// invented prefix, so a content node's `uri` is directly linkable. This module
// is the single place that says so: the [section]/[slug] route validates
// against it, and every caller that wants to link an item checks against it
// too, which is what stops a section linking to a URL nothing renders.

export const EDITORIAL_SECTIONS: readonly string[] = Object.freeze([
  "news",
  "insights",
  "articles",
  "press-releases",
]);

/**
 * The href if this app serves it, or null.
 *
 * Returning null rather than throwing lets a caller fall back to rendering the
 * item unlinked — which is the right outcome for a content type that has no
 * detail route, and was the state every editorial section was stuck in before
 * the article route existed.
 */
export function editorialArticleHref(href: string): string | null {
  if (!href.startsWith("/") || href.startsWith("//")) return null;

  const [, section, slug, ...rest] = href.split("/");

  if (
    section === undefined ||
    slug === undefined ||
    slug === "" ||
    !EDITORIAL_SECTIONS.includes(section)
  ) {
    return null;
  }

  // WordPress emits a trailing slash, so the split leaves one empty segment.
  // Anything deeper is not a permalink this route can resolve.
  return rest.length === 0 || (rest.length === 1 && rest[0] === "") ? href : null;
}

const MAX_CACHE_TAGS = 128;
const MAX_CACHE_TAG_LENGTH = 256;
const CACHE_TAG_PATTERN = /^[a-z0-9][a-z0-9:_-]*$/;

export class CacheTagError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "CacheTagError";
  }
}

export function normalizeCacheTags(
  tags: readonly string[],
): readonly string[] {
  const normalized = Array.from(
    new Set(tags.map((tag) => tag.trim().toLowerCase())),
  );

  if (normalized.length > MAX_CACHE_TAGS) {
    throw new CacheTagError(
      `A request may contain at most ${MAX_CACHE_TAGS} cache tags.`,
    );
  }

  for (const tag of normalized) {
    if (tag.length === 0 || tag.length > MAX_CACHE_TAG_LENGTH) {
      throw new CacheTagError(
        `Cache tag length must be between 1 and ${MAX_CACHE_TAG_LENGTH}.`,
      );
    }

    if (!CACHE_TAG_PATTERN.test(tag)) {
      throw new CacheTagError(`Invalid cache tag: ${tag}.`);
    }
  }

  return Object.freeze(normalized);
}

const SLUG_PATTERN = /^[a-z0-9][a-z0-9_-]*$/iu;

/**
 * The tag the WordPress revalidation webhook emits for one record:
 * `slug:<post_type>:<slug>`. Returns null for a slug the tag grammar cannot
 * carry (percent-encoded Arabic, dots, anything odd) rather than throwing —
 * a request must never fail because its entity tag could not be spelled; it
 * simply falls back to the type-wide tags.
 */
export function entityCacheTag(postType: string, slug: string | undefined): string | null {
  if (slug === undefined || slug.length === 0 || slug.length > 200) return null;
  if (!SLUG_PATTERN.test(slug)) return null;
  return `slug:${postType}:${slug.toLowerCase()}`;
}

/**
 * A caller's tag, made the tenant's own: `homepage` on blog 2 is stored as
 * `site:2:homepage`. Six tenants share one Data Cache and one tag namespace,
 * so an unscoped `homepage` would let one company's publish expire every
 * company's front page — which is exactly what an outage drill showed before
 * this existed. `site:<id>` and `brand:<key>` are already per tenant and pass
 * through unchanged.
 */
export function scopeCacheTag(blogId: number, tag: string): string {
  const normalized = tag.trim().toLowerCase();
  if (normalized.startsWith("site:") || normalized.startsWith("brand:")) return normalized;
  return `site:${blogId}:${normalized}`;
}

export function siteCacheTags(
  blogId: number,
  siteKey: string,
): readonly string[] {
  return normalizeCacheTags([
    `site:${blogId}`,
    `brand:${siteKey}`,
  ]);
}

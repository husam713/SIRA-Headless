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

export function siteCacheTags(
  blogId: number,
  siteKey: string,
): readonly string[] {
  return normalizeCacheTags([
    `site:${blogId}`,
    `brand:${siteKey}`,
  ]);
}

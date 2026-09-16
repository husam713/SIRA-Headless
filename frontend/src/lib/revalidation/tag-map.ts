import { normalizeCacheTags, scopeCacheTag, siteCacheTags } from "@/lib/cache/tags";
import type { SiteKey } from "@/types/site";

/**
 * From the WordPress sender's tag vocabulary to the tags this app declares on
 * its fetches (`src/lib/*\/get-*.ts`). Most tags pass straight through — the
 * sender was written against the same names. The rest translate, and a few
 * have no consumer here and are dropped rather than invented.
 *
 * Two granularities:
 *
 * - `coarse` (default): always includes the tenant's own `site:<blogId>` tag,
 *   so one event expires everything that tenant has cached. Content changes
 *   rarely and the dependency graph is broad (the footer reads the homepage,
 *   the related strip reads the feed, every page reads brand and menus), so a
 *   tenant-wide refresh — a handful of GraphQL calls on the next visits — is
 *   cheaper than a missed dependency.
 * - `fine`: only the mapped tags. For when the entity tags have proven
 *   themselves and the coarse flush is the thing being measured.
 *
 * Other tenants are never touched: every mapped tag is scoped to the event's
 * own blog (`site:<id>:homepage`), matching what the published client stores.
 */

export type RevalidationGranularity = "coarse" | "fine";

const PASS_THROUGH_PREFIXES = [
  "site:",
  "brand:",
  "post-type:",
  "archive:",
  "slug:",
  "taxonomy:",
] as const;

const PASS_THROUGH_EXACT = new Set(["homepage", "navigation", "brand", "layout"]);

const EXACT_TRANSLATIONS: Readonly<Record<string, readonly string[]>> =
  Object.freeze({
    brand: ["brand-identity"],
    layout: ["brand-identity"],
  });

const PREFIX_TRANSLATIONS: ReadonlyArray<readonly [string, readonly string[]]> =
  Object.freeze([
    // Pages carry the content routes: about, services, work, industries,
    // contact and the legal pages. All are tagged `content-page`; the index
    // routes are tagged by their own names.
    ["post-type:page", ["content-page", "services", "work", "industries", "team"]],
    ["archive:page", ["content-page"]],
    ["post-type:sira_service", ["services"]],
    ["archive:sira_service", ["services"]],
    ["post-type:sira_industry", ["industries"]],
    ["taxonomy:sira_industry", ["industries"]],
    ["post-type:sira_leadership", ["team"]],
    ["post-type:sira_executive", ["team"]],
    // A menu event names the menu id, which the navigation query does not
    // know; the location-level tag is what every menu fetch carries.
    ["menu:", ["navigation"]],
    // Term events already come with the `taxonomy:*` tag beside them.
    ["term:", []],
    // No fetch is tagged by numeric id or attachment; the slug tag beside it
    // is the entity key this app uses.
    ["post:", []],
    ["media:", []],
  ]);

function translate(tag: string): readonly string[] {
  const exact = EXACT_TRANSLATIONS[tag];
  const out: string[] = [];

  if (exact !== undefined) out.push(...exact);
  if (PASS_THROUGH_EXACT.has(tag)) out.push(tag);

  for (const [prefix, targets] of PREFIX_TRANSLATIONS) {
    if (tag === prefix || tag.startsWith(prefix)) {
      out.push(...targets);
      return Object.freeze(out);
    }
  }

  if (PASS_THROUGH_PREFIXES.some((prefix) => tag.startsWith(prefix))) {
    out.push(tag);
  }

  return Object.freeze(out);
}

export interface MappedRevalidation {
  readonly tags: readonly string[];
  readonly dropped: readonly string[];
}

export function mapRevalidationTags(
  siteKey: SiteKey,
  blogId: number,
  incoming: readonly string[],
  granularity: RevalidationGranularity,
): MappedRevalidation {
  const mapped = new Set<string>();
  const dropped: string[] = [];

  if (granularity === "coarse") {
    for (const tag of siteCacheTags(blogId, siteKey)) mapped.add(tag);
  }

  for (const raw of incoming) {
    const tag = raw.trim().toLowerCase();
    if (tag.length === 0) continue;

    // Tenant isolation: a payload may only expire its own tenant's tags.
    if (tag.startsWith("site:") && tag !== `site:${blogId}`) {
      dropped.push(tag);
      continue;
    }
    if (tag.startsWith("brand:") && tag !== `brand:${siteKey}`) {
      dropped.push(tag);
      continue;
    }

    const targets = translate(tag);
    if (targets.length === 0) {
      dropped.push(tag);
      continue;
    }
    for (const target of targets) mapped.add(scopeCacheTag(blogId, target));
  }

  let tags: readonly string[];
  try {
    tags = normalizeCacheTags([...mapped]);
  } catch {
    // A tag the grammar refuses came from the wire; keep the safe ones.
    tags = normalizeCacheTags(
      [...mapped].filter((tag) => /^[a-z0-9][a-z0-9:_-]*$/u.test(tag)).slice(0, 128),
    );
  }

  return Object.freeze({ tags, dropped: Object.freeze(dropped) });
}

export function readRevalidationGranularity(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): RevalidationGranularity {
  return environment["SIRA_REVALIDATION_GRANULARITY"] === "fine" ? "fine" : "coarse";
}

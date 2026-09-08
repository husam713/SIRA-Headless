import "server-only";

import { cache } from "react";
import { fetchPublishedGraphQL, SiraGraphQLError } from "@/lib/graphql";
import {
  SIRA_CONTENT_PAGE_QUERY,
  SIRA_INDUSTRY_INDEX_QUERY,
  SIRA_SERVICE_INDEX_QUERY,
  SIRA_WORK_INDEX_QUERY,
} from "@/queries/content-page";
import type { LocaleCode, SiteKey } from "@/types/site";

/**
 * A CMS page rendered as prose, and the service index behind /services.
 *
 * Both normalize the same way every other SIRA contract does: the transport is
 * tolerated, the shape is checked, and anything that fails becomes a null
 * result the route turns into a 404 rather than a thrown page. Editorial HTML
 * is sanitised here rather than at the component, so a component cannot forget.
 */

/**
 * The heading block at the top of a page, authored in the CMS.
 *
 * Every field is optional and a page that sets none of them yields `null` here,
 * so a route can fall back to whatever it rendered before this existed.
 */
export interface PageIntro {
  readonly eyebrow: string | null;
  readonly heading: string | null;
  readonly standfirst: string | null;
  readonly ctaLabel: string | null;
  readonly ctaHeading: string | null;
}

export interface ContentPage {
  readonly databaseId: number;
  readonly uri: string;
  readonly title: string;
  readonly html: string | null;
  readonly modified: string | null;
  readonly intro: PageIntro | null;
}

export interface ServiceEntry {
  readonly databaseId: number;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string | null;
  readonly html: string | null;
  /** Declared by the CMS. `null` predates the field; see `recordLocale`. */
  readonly locale: LocaleCode | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function plainText(value: unknown, maximumLength: number): string | null {
  if (typeof value !== "string") return null;

  const normalized = value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]*>/gu, " ")
    .replace(/&nbsp;/giu, " ")
    .replace(/&#8217;/gu, "’")
    .replace(/&amp;/gu, "&")
    .replace(/\s+/gu, " ")
    .trim();

  return normalized === "" ? null : normalized.slice(0, maximumLength);
}

/**
 * Editorial HTML, with anything executable removed.
 *
 * WordPress is a trusted author here, not an arbitrary one, so this is a
 * defence in depth rather than the only line: it strips script and style
 * elements, inline event handlers, and `javascript:` targets. It deliberately
 * does not attempt to be a full sanitiser — the trust boundary is the CMS.
 */
function editorialHtml(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const cleaned = value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/giu, "")
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/giu, "")
    .replace(/\son[a-z]+\s*=\s*'[^']*'/giu, "")
    .replace(/javascript:/giu, "")
    .trim();

  return cleaned === "" ? null : cleaned;
}

function normalizeContentPage(data: unknown): ContentPage | null {
  if (!isRecord(data) || !isRecord(data["page"])) return null;

  const page = data["page"];
  const databaseId = Number(page["databaseId"]);
  const title = plainText(page["title"], 200);

  if (!Number.isSafeInteger(databaseId) || databaseId <= 0 || title === null) {
    return null;
  }

  return Object.freeze({
    databaseId,
    uri: typeof page["uri"] === "string" ? page["uri"] : "/",
    title,
    html: editorialHtml(page["content"]),
    modified: typeof page["modified"] === "string" ? page["modified"] : null,
    intro: normalizeIntro(page["pageIntro"]),
  });
}

function normalizeIntro(value: unknown): PageIntro | null {
  if (!isRecord(value)) return null;

  const intro = Object.freeze({
    eyebrow: plainText(value["eyebrow"], 80),
    heading: plainText(value["heading"], 200),
    standfirst: plainText(value["standfirst"], 400),
    ctaLabel: plainText(value["ctaLabel"], 80),
    ctaHeading: plainText(value["ctaHeading"], 200),
  });

  return Object.values(intro).every((field) => field === null) ? null : intro;
}

function normalizeServiceIndex(data: unknown): readonly ServiceEntry[] {
  if (!isRecord(data) || !isRecord(data["siraServices"])) return Object.freeze([]);

  const nodes = data["siraServices"]["nodes"];

  if (!Array.isArray(nodes)) return Object.freeze([]);

  const entries = nodes
    .filter(isRecord)
    .map((node): ServiceEntry | null => {
      const databaseId = Number(node["databaseId"]);
      const title = plainText(node["title"], 200);
      const slug = typeof node["slug"] === "string" ? node["slug"] : null;

      if (
        !Number.isSafeInteger(databaseId) ||
        databaseId <= 0 ||
        title === null ||
        slug === null
      ) {
        return null;
      }

      return Object.freeze({
        databaseId,
        slug,
        title,
        excerpt: plainText(node["excerpt"], 400),
        html: editorialHtml(node["content"]),
        locale: normalizeLocale(node["siraLocale"]),
      });
    })
    .filter((entry): entry is ServiceEntry => entry !== null);

  return Object.freeze(entries);
}

function logFailure(what: string, siteKey: SiteKey, error: unknown): void {
  console.warn(`SIRA ${what} query failed.`, {
    siteKey,
    errorName:
      error instanceof SiraGraphQLError || error instanceof Error
        ? error.name
        : "UnknownContentResolutionError",
  });
}

async function resolveContentPage(
  siteKey: SiteKey,
  uri: string,
): Promise<ContentPage | null> {
  try {
    return normalizeContentPage(
      await fetchPublishedGraphQL(
        siteKey,
        SIRA_CONTENT_PAGE_QUERY,
        { uri, asPreview: false },
        { tags: ["content-page"] },
      ),
    );
  } catch (error) {
    logFailure("content page", siteKey, error);
    return null;
  }
}

async function resolveServiceIndex(
  siteKey: SiteKey,
): Promise<readonly ServiceEntry[]> {
  try {
    return normalizeServiceIndex(
      await fetchPublishedGraphQL(
        siteKey,
        SIRA_SERVICE_INDEX_QUERY,
        {},
        { tags: ["services"] },
      ),
    );
  } catch (error) {
    logFailure("service index", siteKey, error);
    return Object.freeze([]);
  }
}

/**
 * One piece of Digital's work.
 *
 * Reuses `sira_project`, which already exists network-wide, rather than adding
 * a Digital-only post type for the same idea.
 */
export interface WorkEntry {
  readonly databaseId: number;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string | null;
  readonly html: string | null;
  readonly locale: LocaleCode | null;
}

/**
 * One industry.
 *
 * The narrative is stored in the taxonomy term's description as three
 * pipe-separated parts — summary, bottleneck, opportunity — because a term has
 * one description field and inventing a parallel CPT for a classification
 * would have been the wrong shape. Anything that does not split into three
 * parts degrades to a summary alone rather than being dropped.
 */
export interface IndustryEntry {
  readonly databaseId: number;
  readonly slug: string;
  readonly name: string;
  readonly summary: string | null;
  readonly bottleneck: string | null;
  readonly opportunity: string | null;
  readonly locale: LocaleCode | null;
}

function normalizeWorkIndex(data: unknown): readonly WorkEntry[] {
  if (!isRecord(data) || !isRecord(data["siraProjects"])) return Object.freeze([]);

  const nodes = data["siraProjects"]["nodes"];

  if (!Array.isArray(nodes)) return Object.freeze([]);

  return Object.freeze(
    nodes
      .filter(isRecord)
      .map((node): WorkEntry | null => {
        const databaseId = Number(node["databaseId"]);
        const title = plainText(node["title"], 200);
        const slug = typeof node["slug"] === "string" ? node["slug"] : null;

        if (!Number.isSafeInteger(databaseId) || databaseId <= 0 || title === null || slug === null) {
          return null;
        }

        return Object.freeze({
          databaseId,
          slug,
          title,
          excerpt: plainText(node["excerpt"], 400),
          html: editorialHtml(node["content"]),
          locale: normalizeLocale(node["siraLocale"]),
        });
      })
      .filter((entry): entry is WorkEntry => entry !== null),
  );
}

function normalizeIndustryIndex(data: unknown): readonly IndustryEntry[] {
  if (!isRecord(data) || !isRecord(data["siraIndustries"])) return Object.freeze([]);

  const nodes = data["siraIndustries"]["nodes"];

  if (!Array.isArray(nodes)) return Object.freeze([]);

  return Object.freeze(
    nodes
      .filter(isRecord)
      .map((node): IndustryEntry | null => {
        const databaseId = Number(node["databaseId"]);
        const name = plainText(node["name"], 120);
        const slug = typeof node["slug"] === "string" ? node["slug"] : null;

        if (!Number.isSafeInteger(databaseId) || databaseId <= 0 || name === null || slug === null) {
          return null;
        }

        const parts = (typeof node["description"] === "string" ? node["description"] : "")
          .split("|")
          .map((part) => plainText(part, 600));

        return Object.freeze({
          databaseId,
          slug,
          name,
          summary: parts[0] ?? null,
          bottleneck: parts[1] ?? null,
          opportunity: parts[2] ?? null,
          locale: normalizeLocale(node["siraLocale"]),
        });
      })
      .filter((entry): entry is IndustryEntry => entry !== null),
  );
}

async function resolveWorkIndex(siteKey: SiteKey): Promise<readonly WorkEntry[]> {
  try {
    return normalizeWorkIndex(
      await fetchPublishedGraphQL(siteKey, SIRA_WORK_INDEX_QUERY, {}, { tags: ["work"] }),
    );
  } catch (error) {
    logFailure("work index", siteKey, error);
    return Object.freeze([]);
  }
}

async function resolveIndustryIndex(
  siteKey: SiteKey,
): Promise<readonly IndustryEntry[]> {
  try {
    return normalizeIndustryIndex(
      await fetchPublishedGraphQL(
        siteKey,
        SIRA_INDUSTRY_INDEX_QUERY,
        {},
        { tags: ["industries"] },
      ),
    );
  } catch (error) {
    logFailure("industry index", siteKey, error);
    return Object.freeze([]);
  }
}

export const getContentPage = cache(resolveContentPage);
export const getWorkIndex = cache(resolveWorkIndex);
export const getIndustryIndex = cache(resolveIndustryIndex);
export const getServiceIndex = cache(resolveServiceIndex);

/**
 * Which language a record is written in.
 *
 * ADR-034 puts a translation behind a slug prefix: `/ar/about/` is the Arabic
 * page, `ar-invoice-capture` is the Arabic service. One convention for pages
 * and for custom post types, visible in the WordPress admin, requiring neither
 * a second site nor a translation plugin nor a schema change.
 *
 * The trade-off is that the index queries fetch both languages and discard one
 * here. At this scale — tens of records, one request, already cached — that is
 * cheaper than the taxonomy and `taxQuery` machinery the alternative needs, and
 * it is reversible: if the record count ever justifies filtering server-side,
 * only this function and the queries change.
 */
const ARABIC_SLUG_PREFIX = "ar-";

/**
 * Which language a record is written in.
 *
 * The explicit `sira_locale` field is the source of truth. An earlier design
 * inferred this from the slug prefix alone and that was wrong for an ordinary
 * reason: slugs are editor-editable, so renaming a record would have moved it
 * between languages silently, and nothing in WordPress would have said so.
 *
 * The slug prefix survives only as a fallback for records created before the
 * field existed. It is a migration aid, not the contract — which is why it is
 * consulted second and never overrides an explicit value.
 */
export function recordLocale(record: {
  readonly slug: string;
  readonly locale: LocaleCode | null;
}): LocaleCode {
  if (record.locale !== null) return record.locale;

  return record.slug.startsWith(ARABIC_SLUG_PREFIX) ? "ar" : "en";
}

/** The slug without its language marker, so anchors match across languages. */
export function neutralSlug(slug: string): string {
  return slug.startsWith(ARABIC_SLUG_PREFIX)
    ? slug.slice(ARABIC_SLUG_PREFIX.length)
    : slug;
}

/** Reads the explicit locale off a record, tolerating its absence. */
function normalizeLocale(value: unknown): LocaleCode | null {
  if (!isRecord(value)) return null;

  const code = value["code"];

  return code === "en" || code === "ar" ? code : null;
}

function forLocale<
  T extends { readonly slug: string; readonly locale: LocaleCode | null },
>(entries: readonly T[], locale: LocaleCode): readonly T[] {
  const selected = entries.filter((entry) => recordLocale(entry) === locale);

  // An untranslated index is shown in the language it does exist in rather than
  // as an empty page. A missing translation is a content gap; an empty section
  // reads as a broken build.
  return Object.freeze(selected.length === 0 ? entries : selected);
}

export async function getServiceIndexForLocale(
  siteKey: SiteKey,
  locale: LocaleCode,
): Promise<readonly ServiceEntry[]> {
  return forLocale(await getServiceIndex(siteKey), locale);
}

export async function getWorkIndexForLocale(
  siteKey: SiteKey,
  locale: LocaleCode,
): Promise<readonly WorkEntry[]> {
  return forLocale(await getWorkIndex(siteKey), locale);
}

export async function getIndustryIndexForLocale(
  siteKey: SiteKey,
  locale: LocaleCode,
): Promise<readonly IndustryEntry[]> {
  return forLocale(await getIndustryIndex(siteKey), locale);
}

/**
 * A page in the requested language, falling back to the default-locale copy.
 *
 * Showing the English page under an Arabic URL is wrong, but showing nothing is
 * worse: the route would 404 or lose its only `<h1>`. The fallback keeps the
 * page usable and keeps the gap visible to whoever is translating.
 */
export async function getContentPageForLocale(
  siteKey: SiteKey,
  localizedUri: string,
  defaultUri: string,
): Promise<ContentPage | null> {
  const localized = await getContentPage(siteKey, localizedUri);

  if (localized !== null || localizedUri === defaultUri) return localized;

  return getContentPage(siteKey, defaultUri);
}

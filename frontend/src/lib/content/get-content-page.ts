import "server-only";

import { cache } from "react";
import { fetchPublishedGraphQL, SiraGraphQLError } from "@/lib/graphql";
import {
  SIRA_CONTENT_PAGE_QUERY,
  SIRA_INDUSTRY_INDEX_QUERY,
  SIRA_SERVICE_INDEX_QUERY,
  SIRA_WORK_INDEX_QUERY,
} from "@/queries/content-page";
import type { SiteKey } from "@/types/site";

/**
 * A CMS page rendered as prose, and the service index behind /services.
 *
 * Both normalize the same way every other SIRA contract does: the transport is
 * tolerated, the shape is checked, and anything that fails becomes a null
 * result the route turns into a 404 rather than a thrown page. Editorial HTML
 * is sanitised here rather than at the component, so a component cannot forget.
 */

export interface ContentPage {
  readonly databaseId: number;
  readonly uri: string;
  readonly title: string;
  readonly html: string | null;
  readonly modified: string | null;
}

export interface ServiceEntry {
  readonly databaseId: number;
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string | null;
  readonly html: string | null;
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
  });
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

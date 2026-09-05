import type {
  EditorialArticle,
  EditorialSingleResolution,
  InvalidEditorialSingleReason,
} from "@/lib/editorial/editorial-single-types";
import { parseRichText } from "@/lib/editorial/rich-text";
import type {
  EditorialContentTypeName,
  EditorialImage,
  EditorialKind,
  EditorialTypename,
} from "@/lib/editorial/types";
import type { SiraEditorialSingleQueryData } from "@/queries/editorial-single";
import type { SiteKey } from "@/types/site";

// The same four content types the feed accepts, resolved from one nodeByUri
// call so a single route can serve every editorial permalink WordPress owns:
// /news/, /insights/, /articles/ and /press-releases/.

interface EditorialTypeContract {
  readonly contentTypeName: EditorialContentTypeName;
  readonly kind: EditorialKind;
}

const EDITORIAL_TYPES: Readonly<
  Record<EditorialTypename, EditorialTypeContract>
> = Object.freeze({
  SiraNewsItem: Object.freeze({ contentTypeName: "sira_news", kind: "news" }),
  SiraInsight: Object.freeze({ contentTypeName: "sira_insight", kind: "insight" }),
  SiraArticle: Object.freeze({ contentTypeName: "sira_article", kind: "article" }),
  SiraPressRelease: Object.freeze({
    contentTypeName: "sira_press_release",
    kind: "press-release",
  }),
});

// A rendered post body is large but bounded. Anything past this is treated as
// a fault rather than parsed, so a runaway document cannot pin the renderer.
const MAX_CONTENT_LENGTH = 2_000_000;

function invalid(
  siteKey: SiteKey,
  reason: InvalidEditorialSingleReason,
): EditorialSingleResolution {
  return Object.freeze({ status: "invalid", siteKey, reason });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePlainText(value: unknown, maximumLength: number): string | null {
  if (typeof value !== "string") return null;
  const plain = value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return plain === "" ? null : plain.slice(0, maximumLength);
}

/** Same locator rules as the feed: site-relative, no scheme, no control bytes. */
function normalizeLocator(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (
    href === "" ||
    !href.startsWith("/") ||
    href.startsWith("//") ||
    href.includes("\\") ||
    /[\u0000-\u001F\u007F]/u.test(href)
  ) {
    return null;
  }
  return href;
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : value;
}

function normalizeFeaturedImage(value: unknown): EditorialImage | null {
  if (!isRecord(value)) return null;
  const node = value["node"];
  if (!isRecord(node)) return null;

  // A restricted media item is not public even when its post is.
  if (node["isRestricted"] !== false && node["isRestricted"] !== null) return null;

  const sourceUrl = node["sourceUrl"];
  const databaseId = node["databaseId"];
  if (typeof sourceUrl !== "string" || sourceUrl.trim() === "") return null;
  if (!Number.isSafeInteger(databaseId) || Number(databaseId) <= 0) return null;

  const details = isRecord(node["mediaDetails"]) ? node["mediaDetails"] : {};
  const dimension = (raw: unknown): number | null =>
    Number.isSafeInteger(raw) && Number(raw) > 0 ? Number(raw) : null;

  return Object.freeze({
    databaseId: Number(databaseId),
    sourceUrl: sourceUrl.trim(),
    altText: normalizePlainText(node["altText"], 300),
    width: dimension(details["width"]),
    height: dimension(details["height"]),
  });
}

/**
 * Normalize one editorial node addressed by URI.
 *
 * `expectedUri` is checked against what came back, so a CMS-side redirect
 * cannot quietly serve one article at another article's URL.
 */
export function normalizeEditorialSingle(
  siteKey: SiteKey,
  expectedUri: string,
  data: SiraEditorialSingleQueryData,
): EditorialSingleResolution {
  const normalizedExpectedUri = normalizeLocator(expectedUri);
  if (normalizedExpectedUri === null) return invalid(siteKey, "invalid-request");

  if (!isRecord(data)) return invalid(siteKey, "invalid-node");

  const rawNode = data["nodeByUri"];
  if (rawNode === null || rawNode === undefined) {
    return Object.freeze({ status: "not-found", siteKey, uri: normalizedExpectedUri });
  }
  if (!isRecord(rawNode)) return invalid(siteKey, "invalid-node");

  // `nodeByUri` is typed as the union of every node kind the schema can
  // resolve, and most of them carry none of the fields below. Reading it as a
  // plain record is the point of this function: every field is checked before
  // it is used, so the schema's shape is a hint here rather than a guarantee.
  const node = rawNode as Record<string, unknown>;

  const typename = node["__typename"];
  if (typeof typename !== "string" || !Object.hasOwn(EDITORIAL_TYPES, typename)) {
    // A URI that resolves to a page, a project or anything else is not this
    // route's business — it is a miss, not a fault.
    return Object.freeze({ status: "not-found", siteKey, uri: normalizedExpectedUri });
  }

  if (node["isRestricted"] !== false && node["isRestricted"] !== null) {
    return invalid(siteKey, "restricted-node");
  }

  const contract = EDITORIAL_TYPES[typename as EditorialTypename];
  const databaseId = node["databaseId"];
  const title = normalizePlainText(node["title"], 240);
  const uri = normalizeLocator(node["uri"]);

  if (
    !Number.isSafeInteger(databaseId) ||
    Number(databaseId) <= 0 ||
    title === null ||
    uri === null ||
    node["contentTypeName"] !== contract.contentTypeName
  ) {
    return invalid(siteKey, "invalid-node");
  }

  if (uri !== normalizedExpectedUri) return invalid(siteKey, "locator-mismatch");

  const content = node["content"];
  if (content !== null && content !== undefined && typeof content !== "string") {
    return invalid(siteKey, "invalid-node");
  }
  if (typeof content === "string" && content.length > MAX_CONTENT_LENGTH) {
    return invalid(siteKey, "content-too-large");
  }

  const article: EditorialArticle = Object.freeze({
    databaseId: Number(databaseId),
    typename: typename as EditorialTypename,
    contentTypeName: contract.contentTypeName,
    kind: contract.kind,
    title,
    excerpt: normalizePlainText(node["excerpt"], 400),
    href: uri,
    publishedAt: normalizeDate(node["date"]),
    modifiedAt: normalizeDate(node["modified"]),
    featuredImage: normalizeFeaturedImage(node["featuredImage"]),
    body: typeof content === "string" ? parseRichText(content) : Object.freeze([]),
  });

  return Object.freeze({ status: "ready", siteKey, article });
}

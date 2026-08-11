import type {
  EditorialContentTypeName,
  EditorialDiagnostic,
  EditorialDiagnosticCode,
  EditorialFeedResolution,
  EditorialImage,
  EditorialItem,
  EditorialKind,
  EditorialPageInfo,
  EditorialTypename,
  InvalidEditorialFeedReason,
} from "@/lib/editorial/types";
import type { SiraEditorialFeedQueryData } from "@/queries/editorial-feed";
import type { SiteKey } from "@/types/site";

type EditorialNode = NonNullable<
  SiraEditorialFeedQueryData["contentNodes"]
>["nodes"][number];
type SupportedEditorialNode = Extract<
  EditorialNode,
  { readonly __typename: EditorialTypename }
>;

interface EditorialTypeContract {
  readonly contentTypeName: EditorialContentTypeName;
  readonly kind: EditorialKind;
}

const EDITORIAL_TYPES: Readonly<
  Record<EditorialTypename, EditorialTypeContract>
> = Object.freeze({
  SiraNewsItem: Object.freeze({
    contentTypeName: "sira_news",
    kind: "news",
  }),
  SiraInsight: Object.freeze({
    contentTypeName: "sira_insight",
    kind: "insight",
  }),
  SiraArticle: Object.freeze({
    contentTypeName: "sira_article",
    kind: "article",
  }),
  SiraPressRelease: Object.freeze({
    contentTypeName: "sira_press_release",
    kind: "press-release",
  }),
});

const EMPTY_DIAGNOSTICS: readonly EditorialDiagnostic[] = Object.freeze([]);

function diagnostic(
  code: EditorialDiagnosticCode,
  nodeDatabaseId: number | null,
): EditorialDiagnostic {
  return Object.freeze({ code, nodeDatabaseId });
}

function freezeDiagnostics(
  diagnostics: EditorialDiagnostic[],
): readonly EditorialDiagnostic[] {
  return Object.freeze([...diagnostics]);
}

function invalid(
  siteKey: SiteKey,
  reason: InvalidEditorialFeedReason,
  diagnostics: readonly EditorialDiagnostic[] = EMPTY_DIAGNOSTICS,
): EditorialFeedResolution {
  return Object.freeze({
    status: "invalid",
    siteKey,
    reason,
    diagnostics,
  });
}

function normalizePlainText(
  value: string | null,
  maximumLength: number,
): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const plainText = value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]*>/gu, " ")
    .replace(/[<>]/gu, " ")
    .replace(/&nbsp;/giu, " ")
    .replace(/\s+/gu, " ")
    .trim();

  return plainText === "" ? null : plainText.slice(0, maximumLength);
}

function normalizePublicHref(value: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const href = value.trim();

  if (
    href === "" ||
    href.startsWith("//") ||
    href.includes("\\") ||
    /[\u0000-\u001f\u007f]/u.test(href)
  ) {
    return null;
  }

  if (href.startsWith("/")) {
    return href;
  }

  try {
    const url = new URL(href);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username !== "" ||
      url.password !== ""
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function normalizeDate(value: string | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const date = value.trim();

  if (
    date === "" ||
    date.length > 64 ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/u.test(date) ||
    !Number.isFinite(Date.parse(date))
  ) {
    return null;
  }

  return date;
}

function normalizeDimension(value: number | null): number | null {
  return value !== null && Number.isSafeInteger(value) && value > 0
    ? value
    : null;
}

function normalizeFeaturedImage(
  value: SupportedEditorialNode["featuredImage"],
): EditorialImage | null {
  if (value === null) {
    return null;
  }

  const image = value.node;
  const sourceUrl = normalizePublicHref(image.sourceUrl);

  if (
    !Number.isSafeInteger(image.databaseId) ||
    image.databaseId <= 0 ||
    sourceUrl === null
  ) {
    return null;
  }

  return Object.freeze({
    databaseId: image.databaseId,
    sourceUrl,
    altText: normalizePlainText(image.altText, 300),
    width: normalizeDimension(image.mediaDetails?.width ?? null),
    height: normalizeDimension(image.mediaDetails?.height ?? null),
  });
}

function isSupportedEditorialNode(
  node: EditorialNode,
): node is SupportedEditorialNode {
  return Object.hasOwn(EDITORIAL_TYPES, node.__typename);
}

function normalizeNode(
  node: EditorialNode,
  diagnostics: EditorialDiagnostic[],
): EditorialItem | null {
  const nodeDatabaseId = Number.isSafeInteger(node.databaseId)
    ? node.databaseId
    : null;

  if (nodeDatabaseId === null || nodeDatabaseId <= 0) {
    diagnostics.push(
      diagnostic("invalid-node-identity", nodeDatabaseId),
    );
    return null;
  }

  if (node.isRestricted === true) {
    diagnostics.push(diagnostic("restricted-node", nodeDatabaseId));
    return null;
  }

  if (!isSupportedEditorialNode(node)) {
    diagnostics.push(
      diagnostic("unsupported-node-type", nodeDatabaseId),
    );
    return null;
  }

  const contract = EDITORIAL_TYPES[node.__typename];

  if (node.contentTypeName !== contract.contentTypeName) {
    diagnostics.push(
      diagnostic("content-type-mismatch", nodeDatabaseId),
    );
    return null;
  }

  const title = normalizePlainText(node.title, 240);

  if (title === null) {
    diagnostics.push(diagnostic("invalid-title", nodeDatabaseId));
    return null;
  }

  const href = normalizePublicHref(node.uri);

  if (href === null) {
    diagnostics.push(diagnostic("unsafe-uri", nodeDatabaseId));
    return null;
  }

  const publishedAt = normalizeDate(node.date);
  const modifiedAt = normalizeDate(node.modified);

  if (node.date !== null && publishedAt === null) {
    diagnostics.push(
      diagnostic("invalid-publication-date", nodeDatabaseId),
    );
  }

  if (node.modified !== null && modifiedAt === null) {
    diagnostics.push(
      diagnostic("invalid-modified-date", nodeDatabaseId),
    );
  }

  const featuredImage = normalizeFeaturedImage(node.featuredImage);

  if (node.featuredImage !== null && featuredImage === null) {
    diagnostics.push(
      diagnostic("invalid-featured-image", nodeDatabaseId),
    );
  }

  return Object.freeze({
    databaseId: nodeDatabaseId,
    typename: node.__typename,
    contentTypeName: contract.contentTypeName,
    kind: contract.kind,
    title,
    excerpt: normalizePlainText(node.excerpt, 1200),
    href,
    publishedAt,
    modifiedAt,
    featuredImage,
  });
}

function normalizePageInfo(
  value: NonNullable<SiraEditorialFeedQueryData["contentNodes"]>["pageInfo"],
): EditorialPageInfo | null {
  if (typeof value.hasNextPage !== "boolean") {
    return null;
  }

  const endCursor = value.endCursor;

  if (
    endCursor !== null &&
    (typeof endCursor !== "string" ||
      endCursor.trim() === "" ||
      endCursor.length > 4096)
  ) {
    return null;
  }

  if (value.hasNextPage && endCursor === null) {
    return null;
  }

  return Object.freeze({
    hasNextPage: value.hasNextPage,
    endCursor,
  });
}

export function normalizeEditorialFeed(
  siteKey: SiteKey,
  data: SiraEditorialFeedQueryData,
): EditorialFeedResolution {
  if (
    typeof data !== "object" ||
    data === null ||
    !("contentNodes" in data) ||
    data.contentNodes === null
  ) {
    return invalid(siteKey, "invalid-connection");
  }

  const pageInfo = normalizePageInfo(data.contentNodes.pageInfo);

  if (pageInfo === null) {
    return invalid(siteKey, "invalid-page-info");
  }

  if (data.contentNodes.nodes.length === 0) {
    return Object.freeze({ status: "empty", siteKey, pageInfo });
  }

  const databaseIds = new Set<number>();

  for (const node of data.contentNodes.nodes) {
    if (
      Number.isSafeInteger(node.databaseId) &&
      databaseIds.has(node.databaseId)
    ) {
      return invalid(siteKey, "duplicate-node-identity");
    }

    databaseIds.add(node.databaseId);
  }

  const diagnostics: EditorialDiagnostic[] = [];
  const items = data.contentNodes.nodes.flatMap((node) => {
    const item = normalizeNode(node, diagnostics);
    return item === null ? [] : [item];
  });
  const frozenDiagnostics = freezeDiagnostics(diagnostics);

  if (items.length === 0) {
    return invalid(siteKey, "no-valid-items", frozenDiagnostics);
  }

  return Object.freeze({
    status: "ready",
    siteKey,
    page: Object.freeze({
      items: Object.freeze(items),
      pageInfo,
      diagnostics: frozenDiagnostics,
    }),
  });
}

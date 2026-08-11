import type {
  InvalidProjectArchiveReason,
  ProjectArchiveDiagnostic,
  ProjectArchiveDiagnosticCode,
  ProjectArchiveImage,
  ProjectArchiveItem,
  ProjectArchivePageInfo,
  ProjectArchiveResolution,
} from "@/lib/projects/types";
import type { SiraProjectsQueryData } from "@/queries/projects";
import type { SiteKey } from "@/types/site";

const EMPTY_DIAGNOSTICS: readonly ProjectArchiveDiagnostic[] =
  Object.freeze([]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function diagnostic(
  code: ProjectArchiveDiagnosticCode,
  projectDatabaseId: number | null,
): ProjectArchiveDiagnostic {
  return Object.freeze({ code, projectDatabaseId });
}

function freezeDiagnostics(
  diagnostics: ProjectArchiveDiagnostic[],
): readonly ProjectArchiveDiagnostic[] {
  return Object.freeze([...diagnostics]);
}

function invalid(
  siteKey: SiteKey,
  reason: InvalidProjectArchiveReason,
  diagnostics: readonly ProjectArchiveDiagnostic[] = EMPTY_DIAGNOSTICS,
): ProjectArchiveResolution {
  return Object.freeze({ status: "invalid", siteKey, reason, diagnostics });
}

function normalizePlainText(
  value: unknown,
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

function normalizePublicHref(value: unknown): string | null {
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

function normalizeDimension(value: unknown): number | null {
  return Number.isSafeInteger(value) && Number(value) > 0
    ? Number(value)
    : null;
}

function normalizeFeaturedImage(value: unknown): ProjectArchiveImage | null {
  if (!isRecord(value) || !isRecord(value["node"])) {
    return null;
  }

  const image = value["node"];
  const databaseId = image["databaseId"];
  const sourceUrl = normalizePublicHref(image["sourceUrl"]);

  if (
    !Number.isSafeInteger(databaseId) ||
    Number(databaseId) <= 0 ||
    sourceUrl === null
  ) {
    return null;
  }

  const mediaDetails = isRecord(image["mediaDetails"])
    ? image["mediaDetails"]
    : null;

  return Object.freeze({
    databaseId: Number(databaseId),
    sourceUrl,
    altText: normalizePlainText(image["altText"], 300),
    width: normalizeDimension(mediaDetails?.["width"] ?? null),
    height: normalizeDimension(mediaDetails?.["height"] ?? null),
  });
}

function normalizeProject(
  value: unknown,
  diagnostics: ProjectArchiveDiagnostic[],
): ProjectArchiveItem | null {
  if (!isRecord(value)) {
    diagnostics.push(diagnostic("invalid-project-identity", null));
    return null;
  }

  const rawDatabaseId = value["databaseId"];
  const databaseId = Number.isSafeInteger(rawDatabaseId)
    ? Number(rawDatabaseId)
    : null;

  if (databaseId === null || databaseId <= 0) {
    diagnostics.push(diagnostic("invalid-project-identity", databaseId));
    return null;
  }

  const restriction = value["isRestricted"];

  if (restriction === true) {
    diagnostics.push(diagnostic("restricted-project", databaseId));
    return null;
  }

  if (restriction !== false && restriction !== null) {
    diagnostics.push(
      diagnostic("invalid-restriction-signal", databaseId),
    );
    return null;
  }

  const title = normalizePlainText(value["title"], 240);

  if (title === null) {
    diagnostics.push(diagnostic("invalid-title", databaseId));
    return null;
  }

  const href = normalizePublicHref(value["uri"]);

  if (href === null) {
    diagnostics.push(diagnostic("unsafe-uri", databaseId));
    return null;
  }

  const rawFeaturedImage = value["featuredImage"];
  const featuredImage =
    rawFeaturedImage === null
      ? null
      : normalizeFeaturedImage(rawFeaturedImage);

  if (rawFeaturedImage !== null && featuredImage === null) {
    diagnostics.push(diagnostic("invalid-featured-image", databaseId));
  }

  const rawDetails = value["projectDetails"];
  const projectDetails = isRecord(rawDetails) ? rawDetails : null;

  if (rawDetails !== null && projectDetails === null) {
    diagnostics.push(diagnostic("invalid-project-details", databaseId));
  }

  return Object.freeze({
    databaseId,
    title,
    href,
    excerpt: normalizePlainText(value["excerpt"], 1200),
    featuredImage,
    subtitle: normalizePlainText(projectDetails?.["subtitle"], 300),
    location: normalizePlainText(projectDetails?.["location"], 300),
    status: normalizePlainText(projectDetails?.["status"], 120),
  });
}

function normalizePageInfo(value: unknown): ProjectArchivePageInfo | null {
  if (!isRecord(value) || typeof value["hasNextPage"] !== "boolean") {
    return null;
  }

  const endCursor = value["endCursor"];

  if (
    endCursor !== null &&
    (typeof endCursor !== "string" ||
      endCursor.trim() === "" ||
      endCursor.length > 4096 ||
      /[\u0000-\u001f\u007f]/u.test(endCursor))
  ) {
    return null;
  }

  if (value["hasNextPage"] && endCursor === null) {
    return null;
  }

  return Object.freeze({
    hasNextPage: value["hasNextPage"],
    endCursor,
  });
}

export function normalizeProjectArchive(
  siteKey: SiteKey,
  data: SiraProjectsQueryData,
): ProjectArchiveResolution {
  if (!isRecord(data) || !isRecord(data["siraProjects"])) {
    return invalid(siteKey, "invalid-connection");
  }

  const connection = data["siraProjects"];

  if (!Array.isArray(connection["nodes"])) {
    return invalid(siteKey, "invalid-connection");
  }

  const pageInfo = normalizePageInfo(connection["pageInfo"]);

  if (pageInfo === null) {
    return invalid(siteKey, "invalid-page-info");
  }

  if (connection["nodes"].length === 0) {
    return Object.freeze({ status: "empty", siteKey, pageInfo });
  }

  const databaseIds = new Set<number>();

  for (const node of connection["nodes"]) {
    if (!isRecord(node) || !Number.isSafeInteger(node["databaseId"])) {
      continue;
    }

    const databaseId = Number(node["databaseId"]);

    if (databaseId > 0 && databaseIds.has(databaseId)) {
      return invalid(siteKey, "duplicate-project-identity");
    }

    if (databaseId > 0) {
      databaseIds.add(databaseId);
    }
  }

  const diagnostics: ProjectArchiveDiagnostic[] = [];
  const items: ProjectArchiveItem[] = [];

  for (const node of connection["nodes"]) {
    const item = normalizeProject(node, diagnostics);

    if (item !== null) {
      items.push(item);
    }
  }

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

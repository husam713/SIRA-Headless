import type {
  InvalidProjectSingleReason,
  ProjectSingleDiagnostic,
  ProjectSingleDiagnosticCode,
  ProjectSingleImage,
  ProjectSingleRelatedCompany,
  ProjectSingleResolution,
  ProjectSingleStatistic,
} from "@/lib/projects/project-single-types";
import type { SiraProjectSingleQueryData } from "@/queries/project-single";
import type { SiteKey } from "@/types/site";

const EMPTY_DIAGNOSTICS: readonly ProjectSingleDiagnostic[] =
  Object.freeze([]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function diagnostic(
  code: ProjectSingleDiagnosticCode,
  databaseId: number | null,
): ProjectSingleDiagnostic {
  return Object.freeze({ code, databaseId });
}

function invalid(
  siteKey: SiteKey,
  reason: InvalidProjectSingleReason,
  diagnostics: readonly ProjectSingleDiagnostic[] = EMPTY_DIAGNOSTICS,
): ProjectSingleResolution {
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

export function normalizeProjectLocator(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const uri = value.trim();

  if (
    uri.length < 2 ||
    uri.length > 2048 ||
    !uri.startsWith("/") ||
    uri.startsWith("//") ||
    uri.includes("\\") ||
    uri.includes("?") ||
    uri.includes("#") ||
    /\s/u.test(uri) ||
    /[\u0000-\u001f\u007f]/u.test(uri) ||
    /%(?:0[0-9a-f]|1[0-9a-f]|7f)/iu.test(uri)
  ) {
    return null;
  }

  return uri;
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

function normalizeImage(
  value: unknown,
  diagnostics: ProjectSingleDiagnostic[],
  invalidCode: ProjectSingleDiagnosticCode,
  restrictedCode: ProjectSingleDiagnosticCode,
): ProjectSingleImage | null {
  if (!isRecord(value)) {
    diagnostics.push(diagnostic(invalidCode, null));
    return null;
  }

  const rawDatabaseId = value["databaseId"];
  const databaseId = Number.isSafeInteger(rawDatabaseId)
    ? Number(rawDatabaseId)
    : null;

  if (value["isRestricted"] === true) {
    diagnostics.push(diagnostic(restrictedCode, databaseId));
    return null;
  }

  const sourceUrl = normalizePublicHref(value["sourceUrl"]);

  if (
    databaseId === null ||
    databaseId <= 0 ||
    (value["isRestricted"] !== false &&
      value["isRestricted"] !== null) ||
    sourceUrl === null
  ) {
    diagnostics.push(diagnostic(invalidCode, databaseId));
    return null;
  }

  const mediaDetails = isRecord(value["mediaDetails"])
    ? value["mediaDetails"]
    : null;

  return Object.freeze({
    databaseId,
    sourceUrl,
    altText: normalizePlainText(value["altText"], 300),
    width: normalizeDimension(mediaDetails?.["width"] ?? null),
    height: normalizeDimension(mediaDetails?.["height"] ?? null),
  });
}

type ConnectionState = "complete" | "truncated" | "invalid";

function connectionState(value: unknown): ConnectionState {
  if (!isRecord(value) || typeof value["hasNextPage"] !== "boolean") {
    return "invalid";
  }

  const endCursor = value["endCursor"];

  if (
    endCursor !== null &&
    (typeof endCursor !== "string" ||
      endCursor.trim() === "" ||
      endCursor.length > 4096 ||
      /[\u0000-\u001f\u007f]/u.test(endCursor))
  ) {
    return "invalid";
  }

  if (value["hasNextPage"] && endCursor === null) {
    return "invalid";
  }

  return value["hasNextPage"] ? "truncated" : "complete";
}

type NormalizedCollection<T> =
  | Readonly<{ status: "ready"; items: readonly T[] }>
  | Readonly<{ status: "invalid"; reason: InvalidProjectSingleReason }>;

function normalizeGallery(
  value: unknown,
  diagnostics: ProjectSingleDiagnostic[],
): NormalizedCollection<ProjectSingleImage> {
  if (value === null) {
    return Object.freeze({ status: "ready", items: Object.freeze([]) });
  }

  if (!isRecord(value) || !Array.isArray(value["nodes"])) {
    return Object.freeze({ status: "invalid", reason: "invalid-gallery" });
  }

  const state = connectionState(value["pageInfo"]);

  if (state !== "complete") {
    return Object.freeze({
      status: "invalid",
      reason: state === "truncated" ? "truncated-gallery" : "invalid-gallery",
    });
  }

  const identities = new Set<number>();
  const images: ProjectSingleImage[] = [];

  for (const node of value["nodes"]) {
    if (isRecord(node) && Number.isSafeInteger(node["databaseId"])) {
      const databaseId = Number(node["databaseId"]);

      if (databaseId > 0 && identities.has(databaseId)) {
        return Object.freeze({
          status: "invalid",
          reason: "duplicate-gallery-identity",
        });
      }

      if (databaseId > 0) {
        identities.add(databaseId);
      }
    }

    const image = normalizeImage(
      node,
      diagnostics,
      "invalid-gallery-image",
      "restricted-gallery-image",
    );

    if (image !== null) {
      images.push(image);
    }
  }

  return Object.freeze({ status: "ready", items: Object.freeze(images) });
}

function normalizeStatistics(
  value: unknown,
  diagnostics: ProjectSingleDiagnostic[],
): NormalizedCollection<ProjectSingleStatistic> {
  if (value === null) {
    return Object.freeze({ status: "ready", items: Object.freeze([]) });
  }

  if (!Array.isArray(value) || value.length > 100) {
    return Object.freeze({ status: "invalid", reason: "invalid-statistics" });
  }

  const statistics: ProjectSingleStatistic[] = [];

  for (const entry of value) {
    const label = isRecord(entry)
      ? normalizePlainText(entry["label"], 200)
      : null;
    const statisticValue = isRecord(entry)
      ? normalizePlainText(entry["value"], 200)
      : null;

    if (label === null || statisticValue === null) {
      diagnostics.push(diagnostic("invalid-statistic", null));
      continue;
    }

    statistics.push(Object.freeze({ label, value: statisticValue }));
  }

  return Object.freeze({
    status: "ready",
    items: Object.freeze(statistics),
  });
}

function normalizeRelatedCompanies(
  value: unknown,
  diagnostics: ProjectSingleDiagnostic[],
): NormalizedCollection<ProjectSingleRelatedCompany> {
  if (value === null) {
    return Object.freeze({ status: "ready", items: Object.freeze([]) });
  }

  if (!isRecord(value) || !Array.isArray(value["nodes"])) {
    return Object.freeze({
      status: "invalid",
      reason: "invalid-related-companies",
    });
  }

  const state = connectionState(value["pageInfo"]);

  if (state !== "complete") {
    return Object.freeze({
      status: "invalid",
      reason:
        state === "truncated"
          ? "truncated-related-companies"
          : "invalid-related-companies",
    });
  }

  const identities = new Set<number>();
  const companies: ProjectSingleRelatedCompany[] = [];

  for (const node of value["nodes"]) {
    if (!isRecord(node)) {
      diagnostics.push(diagnostic("invalid-related-company", null));
      continue;
    }

    const rawDatabaseId = node["databaseId"];
    const databaseId = Number.isSafeInteger(rawDatabaseId)
      ? Number(rawDatabaseId)
      : null;

    if (databaseId !== null && databaseId > 0) {
      if (identities.has(databaseId)) {
        return Object.freeze({
          status: "invalid",
          reason: "duplicate-related-company-identity",
        });
      }

      identities.add(databaseId);
    }

    if (node["isRestricted"] === true) {
      diagnostics.push(diagnostic("restricted-related-company", databaseId));
      continue;
    }

    if (node["__typename"] !== "SiraCompany") {
      diagnostics.push(diagnostic("unsupported-related-node", databaseId));
      continue;
    }

    const title = normalizePlainText(node["title"], 240);
    const href = normalizePublicHref(node["uri"]);

    if (
      databaseId === null ||
      databaseId <= 0 ||
      (node["isRestricted"] !== false && node["isRestricted"] !== null) ||
      title === null ||
      href === null
    ) {
      diagnostics.push(diagnostic("invalid-related-company", databaseId));
      continue;
    }

    companies.push(Object.freeze({ databaseId, title, href }));
  }

  return Object.freeze({ status: "ready", items: Object.freeze(companies) });
}

export function normalizeProjectSingle(
  siteKey: SiteKey,
  expectedUri: string,
  data: SiraProjectSingleQueryData,
): ProjectSingleResolution {
  const normalizedExpectedUri = normalizeProjectLocator(expectedUri);

  if (normalizedExpectedUri === null) {
    return invalid(siteKey, "invalid-locator");
  }

  if (!isRecord(data) || !("siraProject" in data)) {
    return invalid(siteKey, "invalid-project");
  }

  if (data["siraProject"] === null) {
    return Object.freeze({ status: "not-found", siteKey });
  }

  if (!isRecord(data["siraProject"])) {
    return invalid(siteKey, "invalid-project");
  }

  const project = data["siraProject"];

  if (project["isRestricted"] === true) {
    return Object.freeze({ status: "not-found", siteKey });
  }

  const rawDatabaseId = project["databaseId"];
  const databaseId = Number.isSafeInteger(rawDatabaseId)
    ? Number(rawDatabaseId)
    : null;
  const title = normalizePlainText(project["title"], 240);
  const uri = normalizeProjectLocator(project["uri"]);
  const content = project["content"];

  if (
    databaseId === null ||
    databaseId <= 0 ||
    title === null ||
    uri === null ||
    (project["isRestricted"] !== false &&
      project["isRestricted"] !== null) ||
    (content !== null && typeof content !== "string") ||
    (typeof content === "string" && content.length > 2_000_000)
  ) {
    return invalid(siteKey, "invalid-project");
  }

  if (uri !== normalizedExpectedUri) {
    return invalid(siteKey, "locator-mismatch");
  }

  const diagnostics: ProjectSingleDiagnostic[] = [];
  const rawFeaturedImage = project["featuredImage"];
  const featuredImage =
    rawFeaturedImage === null ||
    !isRecord(rawFeaturedImage) ||
    !("node" in rawFeaturedImage)
      ? null
      : normalizeImage(
          rawFeaturedImage["node"],
          diagnostics,
          "invalid-featured-image",
          "restricted-featured-image",
        );

  if (
    rawFeaturedImage !== null &&
    (!isRecord(rawFeaturedImage) || !("node" in rawFeaturedImage))
  ) {
    diagnostics.push(diagnostic("invalid-featured-image", null));
  }

  const rawDetails = project["projectDetails"];

  if (rawDetails !== null && !isRecord(rawDetails)) {
    return invalid(siteKey, "invalid-project");
  }

  const details = isRecord(rawDetails) ? rawDetails : null;
  const gallery = normalizeGallery(details?.["gallery"] ?? null, diagnostics);

  if (gallery.status === "invalid") {
    return invalid(siteKey, gallery.reason);
  }

  const statistics = normalizeStatistics(
    details?.["statistics"] ?? null,
    diagnostics,
  );

  if (statistics.status === "invalid") {
    return invalid(siteKey, statistics.reason);
  }

  const relatedCompanies = normalizeRelatedCompanies(
    details?.["relatedCompany"] ?? null,
    diagnostics,
  );

  if (relatedCompanies.status === "invalid") {
    return invalid(siteKey, relatedCompanies.reason);
  }

  return Object.freeze({
    status: "ready",
    siteKey,
    project: Object.freeze({
      databaseId,
      title,
      href: uri,
      excerpt: normalizePlainText(project["excerpt"], 1200),
      content,
      featuredImage,
      subtitle: normalizePlainText(details?.["subtitle"], 300),
      location: normalizePlainText(details?.["location"], 300),
      status: normalizePlainText(details?.["status"], 120),
      gallery: gallery.items,
      statistics: statistics.items,
      relatedCompanies: relatedCompanies.items,
      diagnostics: Object.freeze(diagnostics),
    }),
  });
}

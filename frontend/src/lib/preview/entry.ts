import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { isSiteKey } from "@/config/sites";
import { getWordPressPreviewAuthorization, type WordPressEnvironment } from "@/config/wordpress";
import { getEffectiveRequestHostname } from "@/lib/host/effective-host";
import { isInternalSitePath, resolveSiteFromHostname } from "@/lib/host/resolve-site";
import type { SiteKey } from "@/types/site";

export const PREVIEW_ENTRY_VERSION = 1 as const;
export const PREVIEW_ENTRY_PURPOSE = "sira-editor-preview" as const;
export const PREVIEW_ENTRY_MAX_LIFETIME_SECONDS = 300;
export const PREVIEW_ENTRY_CLOCK_SKEW_SECONDS = 30;
export const PREVIEW_ENTRY_SECRET_ENV = "SIRA_PREVIEW_ENTRY_SECRET";

export interface PreviewEntryPayload {
  readonly version: 1;
  readonly purpose: typeof PREVIEW_ENTRY_PURPOSE;
  readonly siteKey: SiteKey;
  readonly contentType: "homepage";
  readonly contentId: "/";
  readonly destination: string;
  readonly issuedAt: number;
  readonly expiresAt: number;
}

export interface PreviewEntryAuthorization {
  readonly payload: PreviewEntryPayload;
  readonly hostname: string;
}

type HostRequest = Parameters<typeof getEffectiveRequestHostname>[0];

export class PreviewEntryError extends Error {
  public constructor(message = "Invalid preview request.") {
    super(message);
    this.name = "PreviewEntryError";
  }
}

function getPreviewEntrySecret(
  environment: WordPressEnvironment = process.env,
): string {
  const value = environment[PREVIEW_ENTRY_SECRET_ENV];

  if (
    value === undefined ||
    value.length < 32 ||
    value.length > 512 ||
    value !== value.trim() ||
    /[\u0000-\u001f\u007f]/u.test(value)
  ) {
    throw new PreviewEntryError("Preview entry signing is not configured.");
  }

  return value;
}

export function validateSafeInternalDestination(value: string): string {
  if (
    value.length === 0 ||
    value.length > 2048 ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("?") ||
    value.includes("#") ||
    /[\u0000-\u001f\u007f]/u.test(value)
  ) {
    throw new PreviewEntryError();
  }

  let decoded: string;

  try {
    decoded = decodeURIComponent(value);
  } catch {
    throw new PreviewEntryError();
  }

  if (
    decoded !== value ||
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    /[\u0000-\u001f\u007f]/u.test(decoded) ||
    /(^|\/)\.{1,2}(\/|$)/u.test(decoded) ||
    /\/{2,}/u.test(decoded)
  ) {
    throw new PreviewEntryError();
  }

  if (
    decoded === "/api" ||
    decoded.startsWith("/api/") ||
    decoded === "/_next" ||
    decoded.startsWith("/_next/") ||
    isInternalSitePath(decoded)
  ) {
    throw new PreviewEntryError();
  }

  return decoded;
}

function canonicalizePreviewEntry(payload: PreviewEntryPayload): string {
  return [
    String(payload.version),
    payload.purpose,
    payload.siteKey,
    payload.contentType,
    payload.contentId,
    payload.destination,
    String(payload.issuedAt),
    String(payload.expiresAt),
  ].join("\n");
}

function signCanonicalPayload(payload: PreviewEntryPayload, secret: string): string {
  return createHmac("sha256", secret)
    .update(canonicalizePreviewEntry(payload), "utf8")
    .digest("base64url");
}

function parseInteger(value: string | null): number {
  if (value === null || !/^\d{1,12}$/u.test(value)) {
    throw new PreviewEntryError();
  }

  const parsed = Number(value);

  if (!Number.isSafeInteger(parsed)) {
    throw new PreviewEntryError();
  }

  return parsed;
}

function parsePayload(searchParams: URLSearchParams): PreviewEntryPayload {
  const version = parseInteger(searchParams.get("v"));
  const purpose = searchParams.get("purpose");
  const siteKey = searchParams.get("siteKey");
  const contentType = searchParams.get("contentType");
  const contentId = searchParams.get("contentId");
  const destination = validateSafeInternalDestination(
    searchParams.get("destination") ?? "",
  );
  const issuedAt = parseInteger(searchParams.get("issuedAt"));
  const expiresAt = parseInteger(searchParams.get("expiresAt"));

  if (
    version !== PREVIEW_ENTRY_VERSION ||
    purpose !== PREVIEW_ENTRY_PURPOSE ||
    siteKey === null ||
    !isSiteKey(siteKey) ||
    contentType !== "homepage" ||
    contentId !== "/" ||
    destination !== "/"
  ) {
    throw new PreviewEntryError();
  }

  return Object.freeze({
    version: PREVIEW_ENTRY_VERSION,
    purpose: PREVIEW_ENTRY_PURPOSE,
    siteKey,
    contentType: "homepage",
    contentId: "/",
    destination,
    issuedAt,
    expiresAt,
  });
}

function validateLifetime(payload: PreviewEntryPayload, nowSeconds: number): void {
  if (
    payload.expiresAt <= payload.issuedAt ||
    payload.expiresAt - payload.issuedAt > PREVIEW_ENTRY_MAX_LIFETIME_SECONDS ||
    payload.issuedAt > nowSeconds + PREVIEW_ENTRY_CLOCK_SKEW_SECONDS ||
    payload.expiresAt < nowSeconds
  ) {
    throw new PreviewEntryError();
  }
}

export function signPreviewEntryPayload(
  payload: PreviewEntryPayload,
  environment: WordPressEnvironment = process.env,
): string {
  validateSafeInternalDestination(payload.destination);
  const secret = getPreviewEntrySecret(environment);
  return signCanonicalPayload(payload, secret);
}

export function buildPreviewEntrySearchParams(
  payload: PreviewEntryPayload,
  environment: WordPressEnvironment = process.env,
): URLSearchParams {
  const signature = signPreviewEntryPayload(payload, environment);
  return new URLSearchParams({
    v: String(payload.version),
    purpose: payload.purpose,
    siteKey: payload.siteKey,
    contentType: payload.contentType,
    contentId: payload.contentId,
    destination: payload.destination,
    issuedAt: String(payload.issuedAt),
    expiresAt: String(payload.expiresAt),
    signature,
  });
}

export function verifyPreviewEntrySearchParams(
  searchParams: URLSearchParams,
  nowSeconds = Math.floor(Date.now() / 1000),
  environment: WordPressEnvironment = process.env,
): PreviewEntryPayload {
  const payload = parsePayload(searchParams);
  validateLifetime(payload, nowSeconds);

  const suppliedSignature = searchParams.get("signature");
  if (suppliedSignature === null || !/^[A-Za-z0-9_-]{43}$/u.test(suppliedSignature)) {
    throw new PreviewEntryError();
  }

  const expectedSignature = signCanonicalPayload(
    payload,
    getPreviewEntrySecret(environment),
  );
  const supplied = Buffer.from(suppliedSignature, "ascii");
  const expected = Buffer.from(expectedSignature, "ascii");

  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    throw new PreviewEntryError();
  }

  return payload;
}

export function authorizePreviewEntryRequest(
  request: HostRequest,
  searchParams: URLSearchParams,
  nowSeconds = Math.floor(Date.now() / 1000),
  environment: WordPressEnvironment = process.env,
): PreviewEntryAuthorization {
  const payload = verifyPreviewEntrySearchParams(
    searchParams,
    nowSeconds,
    environment,
  );
  const hostname = getEffectiveRequestHostname(request);
  const resolution =
    hostname === null ? null : resolveSiteFromHostname(hostname);

  if (
    resolution === null ||
    resolution.site.key !== payload.siteKey ||
    resolution.hostnameRole === "redirect-alias"
  ) {
    throw new PreviewEntryError();
  }

  void getWordPressPreviewAuthorization(payload.siteKey, environment);

  return Object.freeze({ payload, hostname });
}

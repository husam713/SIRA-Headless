import { describe, expect, it } from "vitest";
import {
  buildPreviewEntrySearchParams,
  PREVIEW_ENTRY_PURPOSE,
  PreviewEntryError,
  signPreviewEntryPayload,
  validateSafeInternalDestination,
  verifyPreviewEntrySearchParams,
  type PreviewEntryPayload,
} from "@/lib/preview/entry";

const environment = {
  SIRA_PREVIEW_ENTRY_SECRET:
    "test-only-preview-entry-secret-000000000000000000000001",
};

function payload(overrides: Partial<PreviewEntryPayload> = {}): PreviewEntryPayload {
  return {
    version: 1,
    purpose: PREVIEW_ENTRY_PURPOSE,
    siteKey: "group",
    contentType: "homepage",
    contentId: "/",
    destination: "/",
    issuedAt: 1_700_000_000,
    expiresAt: 1_700_000_300,
    ...overrides,
  };
}

describe("preview entry signing", () => {
  it("accepts a valid signed payload", () => {
    const params = buildPreviewEntrySearchParams(payload(), environment);

    expect(
      verifyPreviewEntrySearchParams(params, 1_700_000_100, environment),
    ).toEqual(payload());
  });

  it("rejects invalid signatures and modified payloads", () => {
    const params = buildPreviewEntrySearchParams(payload(), environment);
    params.set("signature", "A".repeat(43));

    expect(() =>
      verifyPreviewEntrySearchParams(params, 1_700_000_100, environment),
    ).toThrow(PreviewEntryError);

    const tampered = buildPreviewEntrySearchParams(payload(), environment);
    tampered.set("siteKey", "healthcare");
    expect(() =>
      verifyPreviewEntrySearchParams(tampered, 1_700_000_100, environment),
    ).toThrow(PreviewEntryError);
  });

  it("rejects expired and implausibly future payloads", () => {
    const expired = buildPreviewEntrySearchParams(payload(), environment);
    expect(() =>
      verifyPreviewEntrySearchParams(expired, 1_700_000_301, environment),
    ).toThrow(PreviewEntryError);

    const future = buildPreviewEntrySearchParams(
      payload({ issuedAt: 1_700_000_100, expiresAt: 1_700_000_200 }),
      environment,
    );
    expect(() =>
      verifyPreviewEntrySearchParams(future, 1_700_000_000, environment),
    ).toThrow(PreviewEntryError);
  });

  it("rejects wrong purpose, unknown SiteKey, malformed values, and unsupported content", () => {
    for (const [key, value] of [
      ["purpose", "other-purpose"],
      ["siteKey", "unknown"],
      ["contentType", "project"],
      ["contentId", "42"],
      ["v", "2"],
    ] as const) {
      const params = buildPreviewEntrySearchParams(payload(), environment);
      params.set(key, value);
      expect(() =>
        verifyPreviewEntrySearchParams(params, 1_700_000_100, environment),
      ).toThrow(PreviewEntryError);
    }

    const malformed = new URLSearchParams({ v: "not-a-number" });
    expect(() =>
      verifyPreviewEntrySearchParams(malformed, 1_700_000_100, environment),
    ).toThrow(PreviewEntryError);
  });

  it("produces deterministic signatures", () => {
    expect(signPreviewEntryPayload(payload(), environment)).toBe(
      signPreviewEntryPayload(payload(), environment),
    );
  });
});

describe("safe preview destinations", () => {
  it("accepts normalized internal paths", () => {
    expect(validateSafeInternalDestination("/")).toBe("/");
    expect(validateSafeInternalDestination("/about")).toBe("/about");
  });

  it.each([
    "https://evil.example/",
    "//evil.example/",
    "/\\evil.example",
    "/%5Cevil",
    "/%2F%2Fevil.example",
    "/bad%ZZ",
    "/foo\nbar",
    "/api/preview",
    "/_next/static/x",
    "/group",
    "/consulting/private",
    "/a/../b",
    "/a//b",
  ])("rejects unsafe destination %s", (value) => {
    expect(() => validateSafeInternalDestination(value)).toThrow(
      PreviewEntryError,
    );
  });
});

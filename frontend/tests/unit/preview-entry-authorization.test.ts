import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import {
  authorizePreviewEntryRequest,
  buildPreviewEntrySearchParams,
  PREVIEW_ENTRY_PURPOSE,
  PreviewEntryError,
  type PreviewEntryPayload,
} from "@/lib/preview/entry";

const baseEnvironment = {
  SIRA_PREVIEW_ENTRY_SECRET:
    "test-only-preview-entry-secret-000000000000000000000001",
  SIRA_WP_GROUP_PREVIEW_USERNAME: "group-preview-editor",
  SIRA_WP_GROUP_PREVIEW_APPLICATION_PASSWORD:
    "group-test-application-password-0001",
};

function signed(siteKey: PreviewEntryPayload["siteKey"] = "group") {
  return buildPreviewEntrySearchParams(
    {
      version: 1,
      purpose: PREVIEW_ENTRY_PURPOSE,
      siteKey,
      contentType: "homepage",
      contentId: "/",
      destination: "/",
      issuedAt: 1_700_000_000,
      expiresAt: 1_700_000_300,
    },
    baseEnvironment,
  );
}

function request(host: string): NextRequest {
  return new NextRequest(`https://${host}/api/preview`, {
    headers: { host },
  });
}

describe("preview entry tenant authorization", () => {
  it("accepts the canonical tenant host", () => {
    expect(
      authorizePreviewEntryRequest(
        request("siratrgroup.com"),
        signed(),
        1_700_000_100,
        baseEnvironment,
      ).payload.siteKey,
    ).toBe("group");
  });

  it("accepts an explicitly allowlisted deployment host for the same tenant", () => {
    const previous = process.env["SIRA_EXTRA_HOSTS_JSON"];
    process.env["SIRA_EXTRA_HOSTS_JSON"] = JSON.stringify({
      group: ["group-preview.example.test"],
    });

    try {
      expect(
        authorizePreviewEntryRequest(
          request("group-preview.example.test"),
          signed(),
          1_700_000_100,
          baseEnvironment,
        ).payload.siteKey,
      ).toBe("group");
    } finally {
      if (previous === undefined) {
        delete process.env["SIRA_EXTRA_HOSTS_JSON"];
      } else {
        process.env["SIRA_EXTRA_HOSTS_JSON"] = previous;
      }
    }
  });

  it("rejects redirect aliases, unknown hosts, and tenant mismatch", () => {
    for (const host of [
      "www.siratrgroup.com",
      "unknown.example.test",
      "healthcare.siratrgroup.com",
    ]) {
      expect(() =>
        authorizePreviewEntryRequest(
          request(host),
          signed(),
          1_700_000_100,
          baseEnvironment,
        ),
      ).toThrow(PreviewEntryError);
    }
  });

  it("fails closed when the selected tenant preview credential is missing", () => {
    expect(() =>
      authorizePreviewEntryRequest(
        request("siratrgroup.com"),
        signed(),
        1_700_000_100,
        {
          SIRA_PREVIEW_ENTRY_SECRET:
            baseEnvironment.SIRA_PREVIEW_ENTRY_SECRET,
          SIRA_WP_GROUP_PREVIEW_USERNAME: "group-preview-editor",
        },
      ),
    ).toThrow();
  });

  it("does not fall back to another tenant credential", () => {
    const healthcareParams = buildPreviewEntrySearchParams(
      {
        version: 1,
        purpose: PREVIEW_ENTRY_PURPOSE,
        siteKey: "healthcare",
        contentType: "homepage",
        contentId: "/",
        destination: "/",
        issuedAt: 1_700_000_000,
        expiresAt: 1_700_000_300,
      },
      baseEnvironment,
    );

    expect(() =>
      authorizePreviewEntryRequest(
        request("healthcare.siratrgroup.com"),
        healthcareParams,
        1_700_000_100,
        baseEnvironment,
      ),
    ).toThrow();
  });
});

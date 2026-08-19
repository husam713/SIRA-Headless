import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import type { WordPressEnvironment } from "@/config/wordpress";
import {
  getWordPressPreviewAuthorization,
  WordPressConfigurationError,
} from "@/config/wordpress";

const fakeEnvironment = {
  SIRA_WP_GROUP_PREVIEW_USERNAME: "group-preview-editor",
  SIRA_WP_GROUP_PREVIEW_APPLICATION_PASSWORD:
    "group-test-application-password-0001",
  SIRA_WP_HEALTHCARE_PREVIEW_USERNAME: "healthcare-preview-editor",
  SIRA_WP_HEALTHCARE_PREVIEW_APPLICATION_PASSWORD:
    "healthcare-test-application-password-0001",
} satisfies WordPressEnvironment;

function decodeBasicAuthorization(value: string): string {
  expect(value.startsWith("Basic ")).toBe(true);

  return Buffer.from(value.slice("Basic ".length), "base64").toString("utf8");
}

describe("WordPress preview authentication configuration", () => {
  it("selects the tenant-specific preview credential", () => {
    expect(
      decodeBasicAuthorization(
        getWordPressPreviewAuthorization("healthcare", fakeEnvironment),
      ),
    ).toBe(
      "healthcare-preview-editor:healthcare-test-application-password-0001",
    );
  });

  it("fails closed when the preview username is missing", () => {
    expect(() =>
      getWordPressPreviewAuthorization("group", {
        SIRA_WP_GROUP_PREVIEW_APPLICATION_PASSWORD:
          "group-test-application-password-0001",
      }),
    ).toThrow(WordPressConfigurationError);
  });

  it("fails closed when the Application Password is missing", () => {
    expect(() =>
      getWordPressPreviewAuthorization("group", {
        SIRA_WP_GROUP_PREVIEW_USERNAME: "group-preview-editor",
      }),
    ).toThrow(WordPressConfigurationError);
  });

  it("rejects malformed username and password values", () => {
    expect(() =>
      getWordPressPreviewAuthorization("group", {
        ...fakeEnvironment,
        SIRA_WP_GROUP_PREVIEW_USERNAME: "bad:user",
      }),
    ).toThrow(WordPressConfigurationError);

    expect(() =>
      getWordPressPreviewAuthorization("group", {
        ...fakeEnvironment,
        SIRA_WP_GROUP_PREVIEW_APPLICATION_PASSWORD: "too-short",
      }),
    ).toThrow(WordPressConfigurationError);

    expect(() =>
      getWordPressPreviewAuthorization("group", {
        ...fakeEnvironment,
        SIRA_WP_GROUP_PREVIEW_APPLICATION_PASSWORD:
          "group-test-application-password-0001\n",
      }),
    ).toThrow(WordPressConfigurationError);
  });

  it("does not silently fall back to another tenant's preview credential", () => {
    expect(() =>
      getWordPressPreviewAuthorization("consulting", fakeEnvironment),
    ).toThrow(WordPressConfigurationError);
  });

  it("generates HTTP Basic authentication rather than Bearer authentication", () => {
    const authorization = getWordPressPreviewAuthorization(
      "group",
      fakeEnvironment,
    );

    expect(authorization.startsWith("Basic ")).toBe(true);
    expect(authorization.startsWith("Bearer ")).toBe(false);
  });
});

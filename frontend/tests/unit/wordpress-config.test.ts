import { describe, expect, it } from "vitest";
import type { WordPressEnvironment } from "@/config/wordpress";
import {
  getGraphQLRevalidateSeconds,
  getGraphQLTimeoutMs,
  getWordPressSiteConfig,
  WordPressConfigurationError,
} from "@/config/wordpress";

const validEnvironment = {
  SIRA_WP_GROUP_GRAPHQL_URL: "https://cms.example.test/graphql",
  SIRA_WP_GROUP_BLOG_ID: "1",
  SIRA_WP_CONSULTING_GRAPHQL_URL:
    "https://cms.example.test/consulting/graphql",
  SIRA_WP_CONSULTING_BLOG_ID: "2",
  SIRA_WP_HEALTHCARE_GRAPHQL_URL:
    "https://cms.example.test/healthcare/graphql",
  SIRA_WP_HEALTHCARE_BLOG_ID: "3",
  SIRA_WP_LIFESTYLE_GRAPHQL_URL:
    "https://cms.example.test/lifestyle/graphql",
  SIRA_WP_LIFESTYLE_BLOG_ID: "4",
  SIRA_WP_REALESTATE_GRAPHQL_URL:
    "https://cms.example.test/realestate/graphql",
  SIRA_WP_REALESTATE_BLOG_ID: "5",
} satisfies WordPressEnvironment;

describe("WordPress server configuration", () => {
  it("resolves a site-aware endpoint and blog ID", () => {
    const config = getWordPressSiteConfig("consulting", validEnvironment);

    expect(config.siteKey).toBe("consulting");
    expect(config.blogId).toBe(2);
    expect(config.graphqlEndpoint.toString()).toBe(
      "https://cms.example.test/consulting/graphql",
    );
  });

  it("keeps every canonical site key aligned to its own GraphQL mapping", () => {
    for (const [siteKey, blogId, path] of [
      ["group", 1, "/graphql"],
      ["consulting", 2, "/consulting/graphql"],
      ["healthcare", 3, "/healthcare/graphql"],
      ["lifestyle", 4, "/lifestyle/graphql"],
      ["realestate", 5, "/realestate/graphql"],
    ] as const) {
      const config = getWordPressSiteConfig(siteKey, validEnvironment);
      expect(config).toMatchObject({ siteKey, blogId });
      expect(config.graphqlEndpoint.pathname).toBe(path);
    }
  });

  it("rejects credentials embedded in endpoint URLs", () => {
    expect(() =>
      getWordPressSiteConfig("group", {
        ...validEnvironment,
        SIRA_WP_GROUP_GRAPHQL_URL:
          "https://user:secret@cms.example.test/graphql",
      }),
    ).toThrow(WordPressConfigurationError);
  });

  it("rejects non-local HTTP endpoints", () => {
    expect(() =>
      getWordPressSiteConfig("group", {
        ...validEnvironment,
        SIRA_WP_GROUP_GRAPHQL_URL: "http://cms.example.test/graphql",
      }),
    ).toThrow(WordPressConfigurationError);
  });

  it("permits local HTTP endpoints", () => {
    const config = getWordPressSiteConfig("group", {
      ...validEnvironment,
      SIRA_WP_GROUP_GRAPHQL_URL: "http://wordpress.localhost/graphql",
    });

    expect(config.graphqlEndpoint.protocol).toBe("http:");
  });

  it("validates timeout and revalidation limits", () => {
    expect(
      getGraphQLTimeoutMs({ SIRA_GRAPHQL_TIMEOUT_MS: "9000" }),
    ).toBe(9000);
    expect(
      getGraphQLRevalidateSeconds({
        SIRA_GRAPHQL_REVALIDATE_SECONDS: "1800",
      }),
    ).toBe(1800);

    expect(() =>
      getGraphQLTimeoutMs({ SIRA_GRAPHQL_TIMEOUT_MS: "100" }),
    ).toThrow(WordPressConfigurationError);

    expect(() =>
      getGraphQLRevalidateSeconds({
        SIRA_GRAPHQL_REVALIDATE_SECONDS: "5",
      }),
    ).toThrow(WordPressConfigurationError);
  });
});

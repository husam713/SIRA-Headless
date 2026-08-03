import { describe, expect, it } from "vitest";
import {
  getGraphQLRevalidateSeconds,
  getGraphQLTimeoutMs,
  getWordPressSiteConfig,
  WordPressConfigurationError,
} from "@/config/wordpress";

const validEnvironment: NodeJS.ProcessEnv = {
  SIRA_WP_GROUP_GRAPHQL_URL: "https://cms.example.test/graphql",
  SIRA_WP_GROUP_BLOG_ID: "1",
  SIRA_WP_CONSULTING_GRAPHQL_URL:
    "https://cms.example.test/consulting/graphql",
  SIRA_WP_CONSULTING_BLOG_ID: "2",
};

describe("WordPress server configuration", () => {
  it("resolves a site-aware endpoint and blog ID", () => {
    const config = getWordPressSiteConfig("consulting", validEnvironment);

    expect(config.siteKey).toBe("consulting");
    expect(config.blogId).toBe(2);
    expect(config.graphqlEndpoint.toString()).toBe(
      "https://cms.example.test/consulting/graphql",
    );
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

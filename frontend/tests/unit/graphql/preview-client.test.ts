import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchPreviewGraphQL } from "@/lib/graphql/preview-client";
import { fetchPublishedGraphQL } from "@/lib/graphql/published-client";
import { defineGraphQLOperation } from "@/lib/graphql/operation";

const operation = defineGraphQLOperation<
  { __typename: string },
  Record<string, never>
>("PreviewAuthProbe", "query PreviewAuthProbe { __typename }");

function configureGroupEnvironment(): void {
  vi.stubEnv("SIRA_WP_GROUP_GRAPHQL_URL", "https://cms.example.test/graphql");
  vi.stubEnv("SIRA_WP_GROUP_BLOG_ID", "1");
  vi.stubEnv("SIRA_WP_GROUP_PREVIEW_USERNAME", "group-preview-editor");
  vi.stubEnv(
    "SIRA_WP_GROUP_PREVIEW_APPLICATION_PASSWORD",
    "group-test-application-password-0001",
  );
}

function successResponse(): Response {
  return new Response(
    JSON.stringify({ data: { __typename: "RootQuery" } }),
    {
      status: 200,
      headers: { "content-type": "application/json" },
    },
  );
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("preview GraphQL transport", () => {
  it("uses server-side Basic authentication, no-store, and redirect rejection", async () => {
    configureGroupEnvironment();

    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      const authorization = headers.get("authorization");

      expect(authorization?.startsWith("Basic ")).toBe(true);
      expect(authorization?.startsWith("Bearer ")).toBe(false);
      expect(init?.cache).toBe("no-store");
      expect(init?.redirect).toBe("error");

      return successResponse();
    });

    await expect(
      fetchPreviewGraphQL("group", operation, {}, { fetchImpl }),
    ).resolves.toEqual({ __typename: "RootQuery" });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("fails closed before network access when the tenant preview credential is incomplete", async () => {
    configureGroupEnvironment();
    vi.stubEnv("SIRA_WP_GROUP_PREVIEW_APPLICATION_PASSWORD", "");
    const fetchImpl = vi.fn(async () => successResponse());

    await expect(
      fetchPreviewGraphQL("group", operation, {}, { fetchImpl }),
    ).rejects.toThrow();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("keeps the published GraphQL transport anonymous", async () => {
    configureGroupEnvironment();

    const fetchImpl = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);

      expect(headers.has("authorization")).toBe(false);
      expect(init?.cache).toBe("force-cache");
      expect(init?.redirect).toBe("error");

      return successResponse();
    });

    await expect(
      fetchPublishedGraphQL("group", operation, {}, { fetchImpl }),
    ).resolves.toEqual({ __typename: "RootQuery" });
  });
});

import { describe, expect, it, vi } from "vitest";
import type { WordPressSiteConfig } from "@/config/wordpress";
import {
  GraphQLHttpError,
  GraphQLProtocolError,
  GraphQLResponseError,
} from "@/lib/graphql/errors";
import {
  executeGraphQL,
  executeGraphQLTolerant,
} from "@/lib/graphql/client";
import { defineGraphQLOperation } from "@/lib/graphql/operation";

// Covers the opt-in tolerant executor only. The fail-closed contract for the
// default executor lives in client.test.ts and is deliberately untouched: this
// suite exists to prove the new path is additive, not a relaxation of it.

interface TestData {
  readonly hello: string;
}

type TestVariables = Record<string, never>;

const operation = defineGraphQLOperation<TestData, TestVariables>(
  "Hello",
  "query Hello { hello }",
);

const site: WordPressSiteConfig = {
  siteKey: "group",
  blogId: 1,
  graphqlEndpoint: new URL("https://cms.example.test/graphql"),
};

describe("executeGraphQLTolerant", () => {
  it("returns partial data with its errors instead of throwing", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        data: { hello: "partial" },
        errors: [
          {
            message: "Resolver failure",
            path: ["page", "groupHomepage", "hero"],
            extensions: { code: "INTERNAL_SERVER_ERROR" },
          },
        ],
      }),
    );

    const result = await executeGraphQLTolerant(site, operation, {}, {
      cache: "no-store",
      timeoutMs: 1000,
      fetchImpl,
    });

    expect(result.data).toEqual({ hello: "partial" });
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]?.path).toEqual(["page", "groupHomepage", "hero"]);
    expect(result.errors[0]?.code).toBe("INTERNAL_SERVER_ERROR");
    expect(result.operationName).toBe("Hello");
    expect(result.requestId).toEqual(expect.any(String));
  });

  it("reuses the existing graphql-error trace outcome for a tolerated result", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        data: { hello: "partial" },
        errors: [{ message: "Resolver failure" }],
      }),
    );
    const trace = vi.fn();

    await executeGraphQLTolerant(site, operation, {}, {
      cache: "no-store",
      timeoutMs: 1000,
      fetchImpl,
      trace,
    });

    expect(trace).toHaveBeenCalledWith(
      expect.objectContaining({
        siteKey: "group",
        endpointHostname: "cms.example.test",
        operationName: "Hello",
        outcome: "graphql-error",
        httpStatus: 200,
      }),
    );
  });

  it("fails closed when data is null even though errors are present", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        data: null,
        errors: [{ message: "Resolver failure" }],
      }),
    );

    await expect(
      executeGraphQLTolerant(site, operation, {}, {
        cache: "no-store",
        timeoutMs: 1000,
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(GraphQLResponseError);
  });

  it("still fails closed on HTTP errors", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ errors: [{ message: "nope" }] }, { status: 500 }),
    );

    await expect(
      executeGraphQLTolerant(site, operation, {}, {
        cache: "no-store",
        timeoutMs: 1000,
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(GraphQLHttpError);
  });

  it("still fails closed on malformed responses", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("not json", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    await expect(
      executeGraphQLTolerant(site, operation, {}, {
        cache: "no-store",
        timeoutMs: 1000,
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(GraphQLProtocolError);
  });

  it("returns clean data with an empty error list when nothing failed", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ data: { hello: "world" } }),
    );

    const result = await executeGraphQLTolerant(site, operation, {}, {
      cache: "force-cache",
      timeoutMs: 1000,
      fetchImpl,
    });

    expect(result.data).toEqual({ hello: "world" });
    expect(result.errors).toEqual([]);
  });

  it("leaves the default executor fail-closed on the same payload", async () => {
    const payload = {
      data: { hello: "partial" },
      errors: [{ message: "Resolver failure" }],
    };

    await expect(
      executeGraphQL(site, operation, {}, {
        cache: "no-store",
        timeoutMs: 1000,
        fetchImpl: vi
          .fn<typeof fetch>()
          .mockResolvedValue(Response.json(payload)),
      }),
    ).rejects.toBeInstanceOf(GraphQLResponseError);

    const tolerated = await executeGraphQLTolerant(site, operation, {}, {
      cache: "no-store",
      timeoutMs: 1000,
      fetchImpl: vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json(payload)),
    });

    expect(tolerated.data).toEqual({ hello: "partial" });
  });
});

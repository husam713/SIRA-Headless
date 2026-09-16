import { describe, expect, it, vi } from "vitest";
import type { WordPressSiteConfig } from "@/config/wordpress";
import {
  GraphQLAbortError,
  GraphQLHttpError,
  GraphQLNetworkError,
  GraphQLProtocolError,
  GraphQLResponseError,
} from "@/lib/graphql/errors";
import { executeGraphQL } from "@/lib/graphql/client";
import { defineGraphQLOperation } from "@/lib/graphql/operation";

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

describe("executeGraphQL", () => {
  it("returns data and emits redacted trace metadata", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ data: { hello: "world" } }),
    );
    const trace = vi.fn();

    const result = await executeGraphQL(site, operation, {}, {
      cache: "force-cache",
      timeoutMs: 1000,
      revalidate: 3600,
      tags: ["site:1"],
      fetchImpl,
      trace,
    });

    expect(result).toEqual({ hello: "world" });
    expect(trace).toHaveBeenCalledWith(
      expect.objectContaining({
        siteKey: "group",
        endpointHostname: "cms.example.test",
        operationName: "Hello",
        outcome: "success",
        httpStatus: 200,
      }),
    );

    const [, init] = fetchImpl.mock.calls[0] ?? [];
    const headers = new Headers(init?.headers);

    expect(headers.get("authorization")).toBeNull();
    expect(headers.get("x-sira-site-key")).toBe("group");
  });

  // Next hashes every request header into the fetch Data Cache key. A
  // per-call id on a cached request therefore defeats the cache: every render
  // wrote a new entry and read none. The two calls below must produce
  // byte-identical requests, or the cache is silently off again.
  it("sends byte-identical cached requests across calls (no per-call header)", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockImplementation(async () =>
      Response.json({ data: { hello: "world" } }),
    );
    const options = {
      cache: "force-cache" as const,
      timeoutMs: 1000,
      revalidate: 3600,
      tags: ["site:1"],
      fetchImpl,
    };

    await executeGraphQL(site, operation, {}, options);
    await executeGraphQL(site, operation, {}, options);

    const first = fetchImpl.mock.calls[0]?.[1];
    const second = fetchImpl.mock.calls[1]?.[1];
    const firstHeaders = Object.fromEntries(new Headers(first?.headers));
    const secondHeaders = Object.fromEntries(new Headers(second?.headers));

    expect(firstHeaders).toEqual(secondHeaders);
    expect(firstHeaders["x-sira-request-id"]).toBeUndefined();
    expect(first?.body).toBe(second?.body);
  });

  it("still identifies uncached preview requests by request id", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ data: { hello: "world" } }),
    );
    const trace = vi.fn();

    await executeGraphQL(site, operation, {}, {
      cache: "no-store",
      timeoutMs: 1000,
      fetchImpl,
      trace,
    });

    const [, init] = fetchImpl.mock.calls[0] ?? [];
    const requestId = new Headers(init?.headers).get("x-sira-request-id");

    expect(requestId).toMatch(/^[0-9a-f-]{36}$/u);
    expect(trace).toHaveBeenCalledWith(expect.objectContaining({ requestId }));
  });

  it("fails closed when GraphQL returns partial data with errors", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({
        data: { hello: "partial" },
        errors: [{ message: "Resolver failure" }],
      }),
    );

    await expect(
      executeGraphQL(site, operation, {}, {
        cache: "no-store",
        timeoutMs: 1000,
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(GraphQLResponseError);
  });

  it("throws an HTTP error without exposing the response body", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json(
        {
          errors: [
            {
              message: "secret internal response",
            },
          ],
        },
        { status: 503 },
      ),
    );

    await expect(
      executeGraphQL(site, operation, {}, {
        cache: "no-store",
        timeoutMs: 1000,
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(GraphQLHttpError);
  });

  it("rejects malformed JSON responses", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("<html>not json</html>", {
        status: 200,
        headers: {
          "content-type": "text/html",
        },
      }),
    );

    await expect(
      executeGraphQL(site, operation, {}, {
        cache: "no-store",
        timeoutMs: 1000,
        fetchImpl,
      }),
    ).rejects.toBeInstanceOf(GraphQLProtocolError);
  });

  it("distinguishes caller cancellation from a timeout", async () => {
    const controller = new AbortController();
    const fetchImpl = vi.fn<typeof fetch>().mockImplementation(
      async (_input, init) =>
        await new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        }),
    );

    const request = executeGraphQL(site, operation, {}, {
      cache: "no-store",
      timeoutMs: 5000,
      fetchImpl,
      signal: controller.signal,
    });

    controller.abort();

    await expect(request).rejects.toBeInstanceOf(GraphQLAbortError);
  });

  it("serializes variable keys deterministically", async () => {
    interface Variables {
      readonly z: number;
      readonly a: {
        readonly y: number;
        readonly b: number;
      };
    }

    const variableOperation = defineGraphQLOperation<
      TestData,
      Variables
    >("HelloWithVariables", "query HelloWithVariables { hello }");

    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      Response.json({ data: { hello: "world" } }),
    );

    await executeGraphQL(
      site,
      variableOperation,
      {
        z: 1,
        a: {
          y: 2,
          b: 3,
        },
      },
      {
        cache: "force-cache",
        timeoutMs: 1000,
        fetchImpl,
      },
    );

    const [, init] = fetchImpl.mock.calls[0] ?? [];

    expect(init?.body).toBe(
      '{"operationName":"HelloWithVariables","query":"query HelloWithVariables { hello }","variables":{"a":{"b":3,"y":2},"z":1}}',
    );
  });

  it("retries a network failure once when asked, and not an HTTP error", async () => {
    const flaky = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(Response.json({ data: { hello: "second try" } }));
    const sleep = vi.fn(async () => undefined);

    const result = await executeGraphQL(site, operation, {}, {
      cache: "force-cache",
      timeoutMs: 1000,
      fetchImpl: flaky,
      retries: 1,
      sleep,
    });

    expect(result).toEqual({ hello: "second try" });
    expect(flaky).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledTimes(1);

    const failing = vi.fn<typeof fetch>().mockResolvedValue(
      new Response("nope", { status: 502 }),
    );

    await expect(
      executeGraphQL(site, operation, {}, {
        cache: "force-cache",
        timeoutMs: 1000,
        fetchImpl: failing,
        retries: 1,
        sleep,
      }),
    ).rejects.toBeInstanceOf(GraphQLHttpError);
    expect(failing).toHaveBeenCalledTimes(1);

    const alwaysDown = vi
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError("fetch failed"));

    await expect(
      executeGraphQL(site, operation, {}, {
        cache: "force-cache",
        timeoutMs: 1000,
        fetchImpl: alwaysDown,
        retries: 1,
        sleep,
      }),
    ).rejects.toBeInstanceOf(GraphQLNetworkError);
    expect(alwaysDown).toHaveBeenCalledTimes(2);
  });
});

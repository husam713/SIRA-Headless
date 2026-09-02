import "server-only";

import { randomUUID } from "node:crypto";
import type { WordPressSiteConfig } from "@/config/wordpress";
import {
  GraphQLAbortError,
  GraphQLHttpError,
  GraphQLNetworkError,
  GraphQLProtocolError,
  GraphQLResponseError,
  GraphQLTimeoutError,
} from "@/lib/graphql/errors";
import type { GraphQLErrorSummary } from "@/lib/graphql/errors";
import type {
  GraphQLOperation,
  GraphQLVariables,
} from "@/lib/graphql/operation";
import { parseGraphQLResponse } from "@/lib/graphql/response";
import {
  discardGraphQLTrace,
  type GraphQLTraceOutcome,
  type GraphQLTraceSink,
} from "@/lib/graphql/tracing";

interface NextFetchOptions {
  revalidate?: number | false;
  tags?: string[];
}

interface NextFetchRequestInit extends RequestInit {
  next?: NextFetchOptions;
}

export interface GraphQLExecutionOptions {
  readonly cache: RequestCache;
  readonly timeoutMs: number;
  readonly revalidate?: number | false;
  readonly tags?: readonly string[];
  readonly authorization?: string;
  readonly signal?: AbortSignal;
  readonly trace?: GraphQLTraceSink;
  readonly fetchImpl?: typeof fetch;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableValue(child)]),
    );
  }

  return value;
}

function isAbortError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "AbortError" || error.name === "TimeoutError")
  );
}

/**
 * A tolerated partial-data result: WPGraphQL returned usable `data` alongside
 * field errors. Only `executeGraphQLTolerant` can produce one with a non-empty
 * `errors` list; the default executor still fails closed on any error.
 *
 * `errors` is `GraphQLErrorSummary[]`, and a summary **does** carry a GraphQL
 * `message` — bounded to 500 characters by `parseGraphQLResponse`, but still
 * originating from WordPress and capable of exposing schema, database, or
 * plugin internals. A length bound is not redaction.
 *
 * This whole result is therefore **server-only**. Callers must not log,
 * serialize, or expose the complete error object, and must not pass it into a
 * rendered payload. A caller crossing a browser, RSC, or logging boundary
 * projects only the approved safe fields — `path` and `code` — and drops the
 * rest. `operationName` and `requestId` travel with the result so a caller can
 * correlate a failure without re-deriving them; both are safe to log.
 *
 * `src/lib/homepage/get-homepage.ts` is the reference consumer: it logs
 * `path` and `code` only, and its diagnostics carry neither message nor
 * endpoint into the page.
 */
export interface TolerantGraphQLResult<TResult> {
  readonly data: TResult;
  readonly errors: readonly GraphQLErrorSummary[];
  readonly operationName: string;
  readonly requestId: string;
}

const NO_ERRORS: readonly GraphQLErrorSummary[] = Object.freeze([]);

async function executeGraphQLCore<
  TResult,
  TVariables extends GraphQLVariables,
>(
  site: WordPressSiteConfig,
  operation: GraphQLOperation<TResult, TVariables>,
  variables: TVariables,
  options: GraphQLExecutionOptions,
  toleratePartialData: boolean,
): Promise<TolerantGraphQLResult<TResult>> {
  const requestId = randomUUID();
  const trace = options.trace ?? discardGraphQLTrace;
  const fetchImpl = options.fetchImpl ?? fetch;
  const startedAt = performance.now();
  const controller = new AbortController();
  let timedOut = false;

  const timeoutHandle = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs);

  const externalAbortHandler = (): void => {
    controller.abort(options.signal?.reason);
  };

  if (options.signal !== undefined) {
    if (options.signal.aborted) {
      externalAbortHandler();
    } else {
      options.signal.addEventListener("abort", externalAbortHandler, {
        once: true,
      });
    }
  }

  const emitTrace = (
    outcome: GraphQLTraceOutcome,
    httpStatus: number | null,
  ): void => {
    trace(
      Object.freeze({
        requestId,
        siteKey: site.siteKey,
        endpointHostname: site.graphqlEndpoint.hostname,
        operationName: operation.operationName,
        durationMs: Math.round(performance.now() - startedAt),
        outcome,
        httpStatus,
      }),
    );
  };

  try {
    const headers = new Headers({
      accept: "application/graphql-response+json, application/json;q=0.9",
      "content-type": "application/json",
      "x-sira-operation-name": operation.operationName,
      "x-sira-request-id": requestId,
      "x-sira-site-key": site.siteKey,
    });

    if (options.authorization !== undefined) {
      headers.set("authorization", options.authorization);
    }

    const nextOptions: NextFetchOptions = {};

    if (options.revalidate !== undefined) {
      Object.assign(nextOptions, { revalidate: options.revalidate });
    }

    if (options.tags !== undefined && options.tags.length > 0) {
      Object.assign(nextOptions, { tags: Array.from(options.tags) });
    }

    const requestInit: NextFetchRequestInit = {
      method: "POST",
      headers,
      body: JSON.stringify(
        stableValue({
          operationName: operation.operationName,
          query: operation.source,
          variables,
        }),
      ),
      cache: options.cache,
      redirect: "error",
      signal: controller.signal,
    };

    if (Object.keys(nextOptions).length > 0) {
      Object.assign(requestInit, { next: nextOptions });
    }

    const response = await fetchImpl(
      site.graphqlEndpoint,
      requestInit,
    );

    if (!response.ok) {
      emitTrace("http-error", response.status);
      throw new GraphQLHttpError(response.status, {
        siteKey: site.siteKey,
        operationName: operation.operationName,
        requestId,
      });
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch (error) {
      emitTrace("protocol-error", response.status);
      throw new GraphQLProtocolError(
        {
          siteKey: site.siteKey,
          operationName: operation.operationName,
          requestId,
        },
        { cause: error },
      );
    }

    const parsed = parseGraphQLResponse<TResult>(payload);

    if (parsed === null) {
      emitTrace("protocol-error", response.status);
      throw new GraphQLProtocolError({
        siteKey: site.siteKey,
        operationName: operation.operationName,
        requestId,
      });
    }

    if (parsed.errors.length > 0) {
      // The existing `graphql-error` trace outcome covers both branches: an
      // error did occur either way. The tracing contract is unchanged.
      emitTrace("graphql-error", response.status);

      // Fail closed unless the caller opted in AND the payload is usable.
      // Null data plus errors stays fatal even for a tolerant caller: there is
      // nothing to render, so degrading would only hide the failure.
      if (!toleratePartialData || parsed.data === null) {
        throw new GraphQLResponseError(parsed.errors, {
          siteKey: site.siteKey,
          operationName: operation.operationName,
          requestId,
        });
      }

      return Object.freeze({
        data: parsed.data,
        errors: parsed.errors,
        operationName: operation.operationName,
        requestId,
      });
    }

    if (parsed.data === null) {
      emitTrace("protocol-error", response.status);
      throw new GraphQLProtocolError({
        siteKey: site.siteKey,
        operationName: operation.operationName,
        requestId,
      });
    }

    emitTrace("success", response.status);

    return Object.freeze({
      data: parsed.data,
      errors: NO_ERRORS,
      operationName: operation.operationName,
      requestId,
    });
  } catch (error) {
    if (
      error instanceof GraphQLHttpError ||
      error instanceof GraphQLResponseError ||
      error instanceof GraphQLProtocolError
    ) {
      throw error;
    }

    if (timedOut) {
      emitTrace("timeout", null);
      throw new GraphQLTimeoutError(
        {
          siteKey: site.siteKey,
          operationName: operation.operationName,
          requestId,
        },
        { cause: error },
      );
    }

    if (controller.signal.aborted || isAbortError(error)) {
      emitTrace("network-error", null);
      throw new GraphQLAbortError(
        {
          siteKey: site.siteKey,
          operationName: operation.operationName,
          requestId,
        },
        { cause: error },
      );
    }

    emitTrace("network-error", null);
    throw new GraphQLNetworkError(
      {
        siteKey: site.siteKey,
        operationName: operation.operationName,
        requestId,
      },
      { cause: error },
    );
  } finally {
    clearTimeout(timeoutHandle);

    if (options.signal !== undefined) {
      options.signal.removeEventListener("abort", externalAbortHandler);
    }
  }
}

/**
 * The default executor, and the only one every non-homepage caller uses. Its
 * contract is unchanged: any GraphQL error, HTTP error, protocol error,
 * timeout, or abort throws, including partial data accompanied by errors.
 */
export async function executeGraphQL<
  TResult,
  TVariables extends GraphQLVariables,
>(
  site: WordPressSiteConfig,
  operation: GraphQLOperation<TResult, TVariables>,
  variables: TVariables,
  options: GraphQLExecutionOptions,
): Promise<TResult> {
  const result = await executeGraphQLCore(
    site,
    operation,
    variables,
    options,
    false,
  );

  return result.data;
}

/**
 * Opt-in executor for callers that can render a partial payload. It differs
 * from `executeGraphQL` in exactly one case: non-null `data` accompanied by
 * GraphQL errors is returned instead of thrown, so the caller can render what
 * resolved and record the rest as diagnostics. Every other failure still
 * throws. Only the homepage opts in.
 */
export async function executeGraphQLTolerant<
  TResult,
  TVariables extends GraphQLVariables,
>(
  site: WordPressSiteConfig,
  operation: GraphQLOperation<TResult, TVariables>,
  variables: TVariables,
  options: GraphQLExecutionOptions,
): Promise<TolerantGraphQLResult<TResult>> {
  return executeGraphQLCore(site, operation, variables, options, true);
}

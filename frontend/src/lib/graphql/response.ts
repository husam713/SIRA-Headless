import type { GraphQLErrorSummary } from "@/lib/graphql/errors";

interface ParsedGraphQLResponse<TResult> {
  readonly data: TResult | null;
  readonly errors: readonly GraphQLErrorSummary[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePath(value: unknown): readonly (string | number)[] | null {
  if (
    !Array.isArray(value) ||
    !value.every(
      (segment) =>
        typeof segment === "string" || typeof segment === "number",
    )
  ) {
    return null;
  }

  return Object.freeze([...value]);
}

function parseError(value: unknown): GraphQLErrorSummary | null {
  if (!isRecord(value) || typeof value["message"] !== "string") {
    return null;
  }

  let code: string | null = null;
  const extensions = value["extensions"];

  if (isRecord(extensions) && typeof extensions["code"] === "string") {
    code = extensions["code"].slice(0, 100);
  }

  return Object.freeze({
    message: value["message"].slice(0, 500),
    path: parsePath(value["path"]),
    code,
  });
}

export function parseGraphQLResponse<TResult>(
  payload: unknown,
): ParsedGraphQLResponse<TResult> | null {
  if (!isRecord(payload)) {
    return null;
  }

  const parsedErrors: GraphQLErrorSummary[] = [];

  if ("errors" in payload) {
    if (!Array.isArray(payload["errors"])) {
      return null;
    }

    for (const rawError of payload["errors"]) {
      const parsed = parseError(rawError);

      if (parsed === null) {
        return null;
      }

      parsedErrors.push(parsed);
    }
  }

  const data = "data" in payload ? (payload["data"] as TResult | null) : null;

  if (data === null && parsedErrors.length === 0) {
    return null;
  }

  return Object.freeze({
    data,
    errors: Object.freeze(parsedErrors),
  });
}

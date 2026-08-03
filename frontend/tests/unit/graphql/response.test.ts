import { describe, expect, it } from "vitest";
import { parseGraphQLResponse } from "@/lib/graphql/response";

describe("parseGraphQLResponse", () => {
  it("returns typed data without retaining unknown envelope fields", () => {
    const parsed = parseGraphQLResponse<{ readonly value: string }>({
      data: { value: "ok" },
      extensions: { debug: "ignored" },
    });

    expect(parsed).toEqual({
      data: { value: "ok" },
      errors: [],
    });
  });

  it("sanitizes GraphQL errors", () => {
    const parsed = parseGraphQLResponse({
      data: null,
      errors: [
        {
          message: "Forbidden",
          path: ["siraInvestors", 0],
          extensions: {
            code: "FORBIDDEN",
            stack: "must not be retained",
          },
        },
      ],
    });

    expect(parsed?.errors).toEqual([
      {
        message: "Forbidden",
        path: ["siraInvestors", 0],
        code: "FORBIDDEN",
      },
    ]);
  });

  it.each([
    null,
    [],
    {},
    { errors: "not-an-array" },
    { data: null, errors: [] },
  ])("rejects malformed response %j", (payload) => {
    expect(parseGraphQLResponse(payload)).toBeNull();
  });
});

import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { getEffectiveRequestHostname } from "@/lib/host/effective-host";

function runtimeRequest(
  host: string,
  headers: Readonly<Record<string, string>> = {},
): NextRequest {
  return new NextRequest("http://localhost:3000/", {
    headers: {
      host,
      ...headers,
    },
  });
}

describe("effective runtime hostname", () => {
  it.each([
    ["SIRATRGroup.com:443", "siratrgroup.com"],
    ["healthcare.siratrgroup.com:8443", "healthcare.siratrgroup.com"],
    ["group.localhost:3000", "group.localhost"],
    ["www.siratrgroup.com", "www.siratrgroup.com"],
  ] as const)("prefers and normalizes direct Host %s", (host, expected) => {
    expect(getEffectiveRequestHostname(runtimeRequest(host))).toBe(expected);
  });

  it("uses the framework hostname only when Host is absent", () => {
    const request = new NextRequest("https://siratrgroup.com/");

    expect(getEffectiveRequestHostname(request)).toBe("siratrgroup.com");
  });

  it("does not trust forwarding headers over direct Host", () => {
    const request = runtimeRequest("unknown.localhost", {
      "x-forwarded-host": "siratrgroup.com",
      forwarded: "host=siratrgroup.com;proto=https",
    });

    expect(getEffectiveRequestHostname(request)).toBe("unknown.localhost");
  });

  it.each([
    "siratrgroup.com,attacker.example",
    "siratrgroup.com/path",
    "user:password@siratrgroup.com",
    "[::1]:3000",
    "bad host",
  ])("rejects an ambiguous or malformed direct Host: %s", (host) => {
    const request = new NextRequest("https://siratrgroup.com/", {
      headers: { host },
    });

    expect(getEffectiveRequestHostname(request)).toBeNull();
  });

  it("fails closed at the framework boundary for control characters", () => {
    expect(
      () =>
        new NextRequest("https://siratrgroup.com/", {
          headers: { host: "\u0000siratrgroup.com" },
        }),
    ).toThrow(TypeError);
  });
});

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("hostname proxy boundary", () => {
  it("redirects only permanent redirect aliases to the production canonical host", () => {
    const response = proxy(
      new NextRequest("https://www.siratrgroup.com/projects/example?ref=test"),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://siratrgroup.com/projects/example?ref=test",
    );
  });

  it("serves an allowlisted deployment host without redirecting it to production", () => {
    vi.stubEnv(
      "SIRA_EXTRA_HOSTS_JSON",
      JSON.stringify({ group: ["group.localhost"] }),
    );

    const response = proxy(
      new NextRequest("http://group.localhost:3000/projects/example"),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://group.localhost:3000/group/projects/example",
    );
  });

  it("rejects unknown hostnames instead of selecting a tenant", () => {
    const response = proxy(new NextRequest("https://attacker.example/"));

    expect(response.status).toBe(421);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("keeps internal tenant paths inaccessible on deployment hosts", () => {
    vi.stubEnv(
      "SIRA_EXTRA_HOSTS_JSON",
      JSON.stringify({ group: ["group.localhost"] }),
    );

    const response = proxy(
      new NextRequest("http://group.localhost:3000/group/projects/example"),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});

import { NextRequest } from "next/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { proxy } from "@/proxy";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("hostname proxy boundary", () => {
  it("resolves a production Host when the framework URL is localhost", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/", {
        headers: { host: "siratrgroup.com" },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "http://localhost:3000/group",
    );
  });

  it("redirects a runtime alias Host to the HTTPS production canonical URL", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/projects/example?ref=test", {
        headers: { host: "www.siratrgroup.com" },
      }),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://siratrgroup.com/projects/example?ref=test",
    );
  });

  it("does not let a forwarded host override an unknown direct Host", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/", {
        headers: {
          host: "unknown.localhost",
          "x-forwarded-host": "siratrgroup.com",
        },
      }),
    );

    expect(response.status).toBe(421);
  });

  it("redirects only permanent redirect aliases to the production canonical host", () => {
    const response = proxy(
      new NextRequest("https://www.siratrgroup.com/projects/example?ref=test"),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://siratrgroup.com/projects/example?ref=test",
    );
  });

  it("serves an allowlisted deployment host without redirecting it to production and marks it noindex", () => {
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
    expect(response.headers.get("x-robots-tag")).toBe(
      "noindex, nofollow, noarchive",
    );
  });

  it("rejects unknown hostnames instead of selecting a tenant", () => {
    const response = proxy(new NextRequest("https://attacker.example/"));

    expect(response.status).toBe(421);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-robots-tag")).toBe(
      "noindex, nofollow, noarchive",
    );
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
    expect(response.headers.get("x-robots-tag")).toBe(
      "noindex, nofollow, noarchive",
    );
  });

  it("sets no Cache-Control of its own until the edge cache is configured", () => {
    const response = proxy(
      new NextRequest("http://localhost:3000/", { headers: { host: "siratrgroup.com" } }),
    );

    expect(response.headers.get("cache-control")).toBeNull();
  });

  it("stamps published pages with the edge policy and previews with private, no-store", () => {
    vi.stubEnv("SIRA_EDGE_CACHE_SMAXAGE_SECONDS", "300");

    const published = proxy(
      new NextRequest("http://localhost:3000/services/", { headers: { host: "siratrgroup.com" } }),
    );
    expect(published.headers.get("cache-control")).toBe(
      "public, max-age=0, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400",
    );

    const preview = proxy(
      new NextRequest("http://localhost:3000/services/", {
        headers: { host: "siratrgroup.com", cookie: "__prerender_bypass=abc" },
      }),
    );
    expect(preview.headers.get("cache-control")).toBe("private, no-store");

    const rejected = proxy(
      new NextRequest("http://localhost:3000/", { headers: { host: "unknown.example" } }),
    );
    expect(rejected.headers.get("cache-control")).toBe("no-store");
  });

  it("refuses an edge lifetime outside the allowed range", () => {
    vi.stubEnv("SIRA_EDGE_CACHE_SMAXAGE_SECONDS", "5");

    expect(() =>
      proxy(new NextRequest("http://localhost:3000/", { headers: { host: "siratrgroup.com" } })),
    ).toThrow(/SIRA_EDGE_CACHE_SMAXAGE_SECONDS/u);
  });
});

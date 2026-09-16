import { describe, expect, it } from "vitest";
import {
  parseRevalidationEvent,
  resolveSiteKeyForBlog,
  RevalidationRejectedError,
  signRevalidationBody,
  verifyRevalidationRequest,
} from "@/lib/revalidation/verify";

// A deployment configuring three of the six tenants, like a staging service.
const environment = {
  SIRA_NEXT_REVALIDATION_SECRET: "0123456789abcdef0123456789abcdef-test-secret",
  SIRA_WP_GROUP_GRAPHQL_URL: "https://cms.example.test/graphql",
  SIRA_WP_GROUP_BLOG_ID: "1",
  SIRA_WP_CONSULTING_GRAPHQL_URL: "https://cms-consulting.example.test/graphql",
  SIRA_WP_CONSULTING_BLOG_ID: "2",
  SIRA_WP_DIGITAL_GRAPHQL_URL: "https://cms-digital.example.test/graphql",
  SIRA_WP_DIGITAL_BLOG_ID: "6",
};

// The sender's schema-v1 payload, as `RevalidationWebhook::build_payload`
// shapes it.
const payload = {
  schemaVersion: 1,
  eventId: "6f1a2b3c-0000-4000-8000-000000000001",
  occurredAt: "2026-09-16T10:00:00Z",
  sentAt: "2026-09-16T10:00:05Z",
  site: { blogId: 2, networkId: 1, brandKey: "consulting", hostname: "consulting.example.test", wordpressUrl: "https://cms-consulting.example.test" },
  source: "post",
  operation: "publish",
  postType: "sira_project",
  postId: 123,
  slug: "sira-prime",
  status: "publish",
  previousStatus: "draft",
  taxonomy: null,
  termIds: [],
  menuId: null,
  paths: ["/", "/projects/", "/projects/sira-prime/"],
  tags: ["site:2", "brand:consulting", "post-type:sira_project", "post:sira_project:123", "archive:sira_project", "slug:sira_project:sira-prime", "homepage"],
};

const NOW = 1_789_000_000;

function signed(body: string, timestamp = String(NOW), secret = environment.SIRA_NEXT_REVALIDATION_SECRET): Headers {
  return new Headers({
    "x-sira-event-id": payload.eventId,
    "x-sira-timestamp": timestamp,
    "x-sira-signature": `v1=${signRevalidationBody(timestamp, body, secret)}`,
  });
}

describe("verifyRevalidationRequest", () => {
  const rawBody = JSON.stringify(payload);

  it("accepts a correctly signed, fresh, well-formed event for a configured tenant", () => {
    const event = verifyRevalidationRequest({ headers: signed(rawBody), rawBody, nowSeconds: NOW + 10, environment });

    expect(event).toMatchObject({
      eventId: payload.eventId,
      siteKey: "consulting",
      blogId: 2,
      source: "post",
      operation: "publish",
      postType: "sira_project",
      postId: 123,
      slug: "sira-prime",
    });
    expect(event.tags).toContain("slug:sira_project:sira-prime");
    expect(event.paths).toEqual(payload.paths);
  });

  it("signs exactly what the sender signs: timestamp, a dot, the raw body", () => {
    // hash_hmac('sha256', "<unix>.<rawBody>", secret) in RevalidationWebhook.php;
    // known answer computed independently for key "k", message "1.{}".
    expect(signRevalidationBody("1", "{}", "k")).toBe(
      "3dd49b2593d0f9a349e9e71c4bde3e2b862c2be4003fe9b4ba81332029310158",
    );
    expect(signRevalidationBody("1", "{}", "k")).not.toBe(signRevalidationBody("2", "{}", "k"));
    expect(signRevalidationBody("1", "{}", "k")).not.toBe(signRevalidationBody("1", "{ }", "k"));
  });

  it("rejects a body that was re-serialised after signing", () => {
    const reserialised = JSON.stringify(JSON.parse(rawBody), null, 2);

    expect(() =>
      verifyRevalidationRequest({ headers: signed(rawBody), rawBody: reserialised, nowSeconds: NOW, environment }),
    ).toThrow(RevalidationRejectedError);
  });

  it("rejects a wrong secret, a stale timestamp and a future timestamp", () => {
    expect(() =>
      verifyRevalidationRequest({ headers: signed(rawBody, String(NOW), "another-secret-of-at-least-32-characters"), rawBody, nowSeconds: NOW, environment }),
    ).toThrow(/bad-signature/u);
    expect(() =>
      verifyRevalidationRequest({ headers: signed(rawBody, String(NOW - 400)), rawBody, nowSeconds: NOW, environment }),
    ).toThrow(/stale-timestamp/u);
    expect(() =>
      verifyRevalidationRequest({ headers: signed(rawBody, String(NOW + 120)), rawBody, nowSeconds: NOW, environment }),
    ).toThrow(/stale-timestamp/u);
  });

  it("rejects missing or malformed headers before touching the body", () => {
    const headers = new Headers({ "x-sira-timestamp": String(NOW), "x-sira-signature": "v1=deadbeef" });

    expect(() => verifyRevalidationRequest({ headers, rawBody, nowSeconds: NOW, environment })).toThrow(/missing-headers/u);
  });

  it("refuses when the secret is not configured", () => {
    const withoutSecret = Object.fromEntries(
      Object.entries(environment).filter(([key]) => key !== "SIRA_NEXT_REVALIDATION_SECRET"),
    );

    const error = (() => {
      try {
        verifyRevalidationRequest({ headers: signed(rawBody), rawBody, nowSeconds: NOW, environment: withoutSecret });
        return null;
      } catch (thrown) {
        return thrown;
      }
    })();

    expect(error).toBeInstanceOf(RevalidationRejectedError);
    expect((error as RevalidationRejectedError).status).toBe(503);
  });

  it("refuses an oversized body", () => {
    const big = JSON.stringify({ ...payload, tags: Array.from({ length: 5000 }, (_, i) => `tag:${i}`.repeat(4)) });

    expect(() =>
      verifyRevalidationRequest({ headers: signed(big), rawBody: big, nowSeconds: NOW, environment }),
    ).toThrow(/body-too-large/u);
  });
});

describe("parseRevalidationEvent", () => {
  it("maps the blog id through this deployment's configuration, not the payload's brand key", () => {
    expect(resolveSiteKeyForBlog(6, environment)).toBe("digital");
    expect(resolveSiteKeyForBlog(3, environment)).toBeNull(); // healthcare not configured here

    const mismatched = JSON.stringify({ ...payload, site: { ...payload.site, blogId: 2, brandKey: "healthcare" } });
    expect(() => parseRevalidationEvent(mismatched, payload.eventId, environment)).toThrow(/unknown-site/u);

    const unconfigured = JSON.stringify({ ...payload, site: { ...payload.site, blogId: 3, brandKey: "healthcare" } });
    expect(() => parseRevalidationEvent(unconfigured, payload.eventId, environment)).toThrow(/unknown-site/u);
  });

  it("rejects the wrong schema version and non-object bodies", () => {
    expect(() => parseRevalidationEvent(JSON.stringify({ ...payload, schemaVersion: 2 }), payload.eventId, environment)).toThrow(/malformed-payload/u);
    expect(() => parseRevalidationEvent("[]", payload.eventId, environment)).toThrow(/malformed-payload/u);
    expect(() => parseRevalidationEvent("not json", payload.eventId, environment)).toThrow(/malformed-payload/u);
  });

  it("tolerates optional fields being absent or null", () => {
    const minimal = JSON.stringify({ schemaVersion: 1, site: { blogId: 1 }, tags: ["site:1"] });
    const event = parseRevalidationEvent(minimal, payload.eventId, environment);

    expect(event.siteKey).toBe("group");
    expect(event.postType).toBeNull();
    expect(event.paths).toEqual([]);
    expect(event.source).toBe("unknown");
  });
});

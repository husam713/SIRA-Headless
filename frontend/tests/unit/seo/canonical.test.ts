import { describe, expect, it } from "vitest";
import { buildCanonicalUrl } from "@/lib/seo/canonical";

const CANONICAL_HOSTS = {
  group: "siratrgroup.com",
  consulting: "consulting.siratrgroup.com",
  healthcare: "healthcare.siratrgroup.com",
  lifestyle: "lifestyle.siratrgroup.com",
  realestate: "realestate.siratrgroup.com",
} as const;

describe("canonical URL ownership", () => {
  it.each(Object.entries(CANONICAL_HOSTS))(
    "builds %s URLs from the approved production host %s",
    (siteKey, hostname) => {
      expect(
        buildCanonicalUrl(
          siteKey as keyof typeof CANONICAL_HOSTS,
          "/projects/example",
        ).toString(),
      ).toBe(`https://${hostname}/projects/example`);
    },
  );

  it("preserves the trusted tenant when paths are identical", () => {
    expect(buildCanonicalUrl("group", "/projects/foo").hostname).toBe(
      "siratrgroup.com",
    );
    expect(buildCanonicalUrl("healthcare", "/projects/foo").hostname).toBe(
      "healthcare.siratrgroup.com",
    );
  });

  it.each([
    "https://attacker.example/path",
    "//attacker.example/path",
    "/path?redirect=https://attacker.example",
    "/path#fragment",
    "/path\\evil",
  ])("rejects non-path canonical input: %s", (pathname) => {
    expect(() => buildCanonicalUrl("group", pathname)).toThrow(TypeError);
  });
});

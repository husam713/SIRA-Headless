import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// The enquiry form is the one interaction the whole site exists to produce, and
// the path it posts to is the kind of detail that breaks quietly: a POST to a
// path that redirects still works, so nothing fails and nobody notices the
// extra round trip — until an intermediary drops the body on the redirect.
//
// `next.config.ts` sets `trailingSlash: true`, so `/api/contact` answers 308 and
// `/api/contact/` answers directly. These two files have to agree, and the only
// way to keep them agreeing is to assert it.

const form = readFileSync(
  new URL("../../src/components/homepage/contact-form.tsx", import.meta.url),
  "utf8",
);
const config = readFileSync(
  new URL("../../next.config.ts", import.meta.url),
  "utf8",
);

describe("the contact form's endpoint", () => {
  it("posts to the path this application serves without a redirect", () => {
    expect(form).toContain('fetch("/api/contact/"');
  });

  it("does not post to the path that 308s", () => {
    expect(form).not.toMatch(/fetch\("\/api\/contact"/u);
  });

  it("still matches the trailing-slash setting it was written for", () => {
    // If this ever flips to false, the assertion above becomes wrong rather
    // than merely unnecessary — so fail here instead of silently reintroducing
    // a redirect on every submission.
    expect(config).toMatch(/trailingSlash:\s*true/u);
  });
});

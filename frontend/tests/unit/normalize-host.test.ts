import { describe, expect, it } from "vitest";
import {
  InvalidHostnameError,
  normalizeHostname,
} from "@/lib/host/normalize-host";

describe("normalizeHostname", () => {
  it("normalizes case, a port, and a trailing dot", () => {
    expect(
      normalizeHostname("Consulting.SiraTRGroup.com.:443"),
    ).toBe("consulting.siratrgroup.com");
  });

  it("accepts an absolute URL only when it contains no path", () => {
    expect(
      normalizeHostname("https://healthcare.siratrgroup.com"),
    ).toBe("healthcare.siratrgroup.com");
  });

  it.each([
    "",
    "consulting.siratrgroup.com/path",
    "user:password@consulting.siratrgroup.com",
    "bad host.siratrgroup.com",
    "https://consulting.siratrgroup.com/?tenant=group",
  ])("rejects unsafe input: %s", (value) => {
    expect(() => normalizeHostname(value)).toThrow(InvalidHostnameError);
  });
});

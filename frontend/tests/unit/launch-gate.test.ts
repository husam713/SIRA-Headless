import { describe, expect, it } from "vitest";
import {
  buildProbeScript,
  evaluateTenants,
  formatRow,
  parseTenantRows,
  type TenantSeedRow,
} from "../../../tools/verify-no-seed-content.mjs";

// The launch gate is the last thing standing between seeded placeholder content
// and a public launch, and until now it was the one part of the system that was
// only ever exercised in production — where it silently reported PASS while
// every seeded SIRA Digital record was still live.
//
// It had two independent defects, and both are covered here:
//
//   1. it checked four editorial post types by name, so pages, services and
//      projects were invisible to it;
//   2. it read post meta only, so seeded taxonomy TERMS were invisible too.
//
// The third case below is the one that made the failure dangerous rather than
// merely incomplete: an unreadable count used to become a zero, which reads as
// "clean". A gate that cannot tell must say so.

function rows(raw: string): TenantSeedRow[] {
  return parseTenantRows(raw);
}

/** The single row a one-line fixture produces. */
function row(raw: string): TenantSeedRow {
  const [first] = rows(raw);

  if (first === undefined) throw new Error(`No tenant row parsed from: ${raw}`);

  return first;
}

describe("ADR-030 launch gate", () => {
  describe("the probe it sends to WordPress", () => {
    const script = buildProbeScript("/srv/wp", "_sira_seed");

    it("enumerates post types rather than naming four of them", () => {
      // The old script hard-coded
      // `--post_type=sira_news,sira_insight,sira_article,sira_press_release`,
      // which is exactly why Digital's pages and CPTs passed unseen.
      expect(script).toContain("wp post-type list --field=name");
      expect(script).not.toContain("sira_news,sira_insight");
    });

    it("counts taxonomy terms, not just post meta", () => {
      expect(script).toContain("wp taxonomy list --field=name");
      expect(script).toContain("wp term list");
    });

    it("asks every tenant, and asks about the marker and the indexing switch", () => {
      expect(script).toContain("wp site list --field=url");
      expect(script).toContain("--meta_key=_sira_seed");
      expect(script).toContain("blog_public");
    });

    it("marks a failed count rather than letting it default to zero", () => {
      expect(script).toContain("POSTS=ERR");
      expect(script).toContain("TERMS=ERR");
    });
  });

  describe("the verdict", () => {
    it("passes a tenant that is clean and indexable", () => {
      const { failures, indeterminate } = evaluateTenants(
        rows("SIRA Group\t1\t0\t0"),
      );

      expect(failures).toEqual([]);
      expect(indeterminate).toEqual([]);
    });

    it("blocks on seeded posts", () => {
      const { failures } = evaluateTenants(rows("SIRA Digital\t1\t18\t0"));

      expect(failures).toHaveLength(1);
      expect(failures[0]).toContain("SIRA Digital");
      expect(failures[0]).toContain("18 placeholder record(s)");
    });

    it("blocks on seeded taxonomy terms alone", () => {
      // The regression that mattered: Digital's eight industry terms carry the
      // marker in TERM meta, and nothing else about the tenant is dirty.
      const { failures } = evaluateTenants(rows("SIRA Digital\t1\t0\t8"));

      expect(failures).toHaveLength(1);
      expect(failures[0]).toContain("8 placeholder record(s)");
      expect(failures[0]).toContain("8 term(s)");
    });

    it("counts posts and terms together", () => {
      const { failures } = evaluateTenants(rows("SIRA Digital\t1\t18\t8"));

      expect(failures[0]).toContain("26 placeholder record(s)");
      expect(failures[0]).toContain("18 post(s)");
      expect(failures[0]).toContain("8 term(s)");
    });

    it("blocks a clean tenant that would launch unindexed", () => {
      const { failures } = evaluateTenants(rows("SIRA Digital\t0\t0\t0"));

      expect(failures).toHaveLength(1);
      expect(failures[0]).toContain("blog_public=0");
    });

    it("reports both problems on one tenant", () => {
      expect(evaluateTenants(rows("SIRA Digital\t0\t3\t1")).failures).toHaveLength(2);
    });

    it("refuses to call an unreadable count clean", () => {
      // Previously `ERR` parsed to NaN or 0 and the tenant reported as clean.
      // Not knowing must be its own outcome, distinct from knowing there is
      // nothing there.
      const unreadablePosts = evaluateTenants(rows("SIRA Digital\t1\tERR\t0"));
      const unreadableTerms = evaluateTenants(rows("SIRA Digital\t1\t0\tERR"));

      expect(unreadablePosts.failures).toEqual([]);
      expect(unreadablePosts.indeterminate).toHaveLength(1);
      expect(unreadablePosts.indeterminate[0]).toContain("UNKNOWN");
      expect(unreadableTerms.indeterminate).toHaveLength(1);
    });

    it("judges every tenant in the network, not just the first", () => {
      const { failures } = evaluateTenants(
        rows(
          [
            "SIRA Group\t1\t0\t0",
            "SIRA Consulting\t1\t0\t0",
            "SIRA Digital\t1\t0\t8",
          ].join("\n"),
        ),
      );

      expect(failures).toHaveLength(1);
      expect(failures[0]).toContain("SIRA Digital");
    });
  });

  describe("what it prints", () => {
    it("distinguishes clean, seeded and unreadable", () => {
      expect(formatRow(row("SIRA Group\t1\t0\t0"))).toContain("clean");
      expect(formatRow(row("SIRA Digital\t1\t2\t8"))).toContain("10 SEEDED");
      expect(formatRow(row("SIRA Digital\t1\tERR\t0"))).toContain("UNREADABLE");
      expect(formatRow(row("SIRA Digital\t0\t0\t0"))).toContain("NOINDEX");
    });
  });

  describe("parsing", () => {
    it("ignores blank lines and trims the transport's stray whitespace", () => {
      expect(rows("\nSIRA Group\t1\t0\t0\n\n")).toHaveLength(1);
    });

    it("treats a malformed row as unreadable rather than as zero", () => {
      const malformed = row("SIRA Group\t1");

      expect(malformed.seededPosts).toBeNull();
      expect(malformed.seededTerms).toBeNull();
    });
  });
});

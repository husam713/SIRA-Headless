#!/usr/bin/env node
/**
 * Launch gate for ADR-030 and ADR-034.
 *
 * Placeholder content and the indexing switch that protects it are a matched
 * pair, and both are easy to forget. This fails while either is still in its
 * pre-launch state:
 *
 *   1. any record carrying `_sira_seed=1` still exists, on any tenant;
 *   2. `blog_public` is still `0`, which would launch the real site invisible
 *      to search engines.
 *
 * A marker someone has to notice is weaker than a check that stops the launch,
 * which is why this exists rather than a `[DRAFT]` prefix in every headline.
 *
 * WHY THIS ENUMERATES RATHER THAN LISTS. It used to check four editorial post
 * types by name and post meta only. SIRA Digital then seeded pages, services,
 * projects and taxonomy TERMS — none of which that list covered — so the gate
 * reported PASS while every seeded Digital record was still live. A launch gate
 * whose coverage has to be extended by hand every time a content type is added
 * is a gate that is wrong by default. It now asks WordPress what types and
 * taxonomies exist and checks all of them, so a type nobody has invented yet is
 * covered the day it is registered.
 *
 * An unreadable count is reported as `ERR` and exits 2 (could not determine)
 * rather than defaulting to zero. A gate that silently reads "no seed content"
 * because a query failed is worse than no gate at all.
 *
 * Usage:
 *   node tools/verify-no-seed-content.mjs
 *
 * Exit codes: 0 clear to launch, 1 blocked, 2 could not determine.
 */

import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const WP_ROOT = "~/domains/siratrgroup.com/public_html";
const MARKER = "_sira_seed";

/**
 * The remote probe.
 *
 * Post types are counted in one query per tenant; taxonomies are summed one at
 * a time, because `wp term list` takes a single taxonomy. Every count captures
 * its command's exit status, so a failed query becomes `ERR` rather than a
 * zero that would read as "clean".
 */
export function buildProbeScript(wpRoot = WP_ROOT, marker = MARKER) {
  return `cd ${wpRoot}
for u in $(wp site list --field=url); do
  NAME=$(wp option get blogname --url="$u")
  PUB=$(wp option get blog_public --url="$u")

  TYPES=$(wp post-type list --field=name --url="$u" 2>/dev/null | paste -sd, -)
  if [ -z "$TYPES" ]; then
    POSTS=ERR
  else
    POSTS=$(wp post list --post_type="$TYPES" --post_status=any \\
      --meta_key=${marker} --meta_value=1 --format=count --url="$u" 2>/dev/null) \\
      || POSTS=ERR
  fi

  TAXONOMIES=$(wp taxonomy list --field=name --url="$u" 2>/dev/null)
  if [ -z "$TAXONOMIES" ]; then
    TERMS=ERR
  else
    TERMS=0
    for t in $TAXONOMIES; do
      C=$(wp term list "$t" --meta_key=${marker} --meta_value=1 \\
        --format=count --url="$u" 2>/dev/null) || C=ERR
      case "$C" in
        ''|*[!0-9]*) TERMS=ERR ;;
        *) if [ "$TERMS" != ERR ]; then TERMS=$((TERMS + C)); fi ;;
      esac
    done
  fi

  printf '%s\\t%s\\t%s\\t%s\\n' "$NAME" "$PUB" "$POSTS" "$TERMS"
done`;
}

function ssh(script) {
  return execFileSync("ssh", ["-o", "BatchMode=yes", "sira", "bash -s"], {
    input: script,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
}

/** `null` means the count could not be read, which is not the same as zero. */
function readCount(value) {
  return /^\d+$/u.test(value ?? "") ? Number(value) : null;
}

export function parseTenantRows(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, blogPublic, posts, terms] = line.split("\t");
      return {
        name: name ?? "",
        blogPublic: blogPublic ?? "",
        seededPosts: readCount(posts),
        seededTerms: readCount(terms),
      };
    });
}

/**
 * Turns tenant rows into a verdict.
 *
 * Split out from the I/O so the launch gate's own logic is testable without a
 * live CMS — this gate is the last thing standing between seeded placeholder
 * content and a public launch, and it should not be the one part of the system
 * that is only ever exercised in production.
 */
export function evaluateTenants(rows) {
  const failures = [];
  const indeterminate = [];

  for (const row of rows) {
    if (row.seededPosts === null || row.seededTerms === null) {
      indeterminate.push(
        `${row.name}: seed count unreadable, so this tenant's launch readiness is UNKNOWN`,
      );
      continue;
    }

    const seeded = row.seededPosts + row.seededTerms;

    if (seeded > 0) {
      failures.push(
        `${row.name}: ${seeded} placeholder record(s) still present ` +
          `(${row.seededPosts} post(s), ${row.seededTerms} term(s)) ` +
          `— remove them with the seeder that created them, ` +
          `\`--remove\` on tools/seed/digital-seed.php or ` +
          `tools/seed-newsroom-content.mjs`,
      );
    }

    if (row.blogPublic !== "1") {
      failures.push(
        `${row.name}: blog_public=${row.blogPublic}; the live site would not ` +
          `be indexed — set it to 1 once the placeholders are gone`,
      );
    }
  }

  return { failures, indeterminate };
}

export function formatRow(row) {
  const seedState =
    row.seededPosts === null || row.seededTerms === null
      ? "UNREADABLE"
      : row.seededPosts + row.seededTerms === 0
        ? "clean"
        : `${row.seededPosts + row.seededTerms} SEEDED`;
  const indexState = row.blogPublic === "1" ? "indexable" : "NOINDEX";

  return `  ${row.name.padEnd(18)} ${seedState.padEnd(12)} ${indexState}`;
}

function main() {
  let raw;

  try {
    raw = ssh(buildProbeScript());
  } catch (error) {
    console.error(
      "Could not reach the CMS over the `sira` SSH alias, so launch readiness " +
        "is UNKNOWN rather than clear.",
    );
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
    return;
  }

  const rows = parseTenantRows(raw);

  console.log("ADR-030 launch gate");
  for (const row of rows) console.log(formatRow(row));

  if (rows.length === 0) {
    console.error("\nNo tenants reported. Refusing to call this clear.");
    process.exitCode = 2;
    return;
  }

  const { failures, indeterminate } = evaluateTenants(rows);

  if (indeterminate.length > 0) {
    console.error("\nCOULD NOT DETERMINE:");
    for (const line of indeterminate) console.error("  - " + line);
    process.exitCode = 2;
    return;
  }

  if (failures.length > 0) {
    console.error("\nBLOCKED:");
    for (const failure of failures) console.error("  - " + failure);
    process.exitCode = 1;
    return;
  }

  console.log("\nPASS: no placeholder records, indexing enabled on every tenant.");
}

// Only run the probe when this file is the entry point, so the pure helpers
// above can be imported by tests without opening an SSH connection.
if (
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main();
}

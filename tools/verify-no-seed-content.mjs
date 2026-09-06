#!/usr/bin/env node
/**
 * Launch gate for ADR-030.
 *
 * Placeholder editorial and the indexing switch that protects it are a matched
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
 * Usage:
 *   node tools/verify-no-seed-content.mjs
 *
 * Exit codes: 0 clear to launch, 1 blocked, 2 could not determine.
 */

import { execFileSync } from "node:child_process";

const WP_ROOT = "~/domains/siratrgroup.com/public_html";
const MARKER = "_sira_seed";
const TYPES = "sira_news,sira_insight,sira_article,sira_press_release";

function ssh(script) {
  return execFileSync("ssh", ["-o", "BatchMode=yes", "sira", "bash -s"], {
    input: script,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  });
}

function main() {
  let raw;
  try {
    raw = ssh(`cd ${WP_ROOT}
for u in $(wp site list --field=url); do
  NAME=$(wp option get blogname --url="$u")
  PUB=$(wp option get blog_public --url="$u")
  N=$(wp post list --post_type=${TYPES} --post_status=any \\
        --meta_key=${MARKER} --meta_value=1 --format=count --url="$u" 2>/dev/null)
  printf '%s\\t%s\\t%s\\n' "$NAME" "$PUB" "$N"
done`);
  } catch (error) {
    console.error(
      "Could not reach the CMS over the `sira` SSH alias, so launch readiness " +
        "is UNKNOWN rather than clear.",
    );
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 2;
    return;
  }

  const rows = raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [name, blogPublic, seeded] = line.split("\t");
      return { name, blogPublic, seeded: Number(seeded) };
    });

  const failures = [];

  console.log("ADR-030 launch gate");
  for (const row of rows) {
    const seedState = row.seeded === 0 ? "clean" : `${row.seeded} SEEDED`;
    const indexState = row.blogPublic === "1" ? "indexable" : "NOINDEX";
    console.log(
      `  ${row.name.padEnd(18)} ${seedState.padEnd(12)} ${indexState}`,
    );

    if (row.seeded > 0) {
      failures.push(
        `${row.name}: ${row.seeded} placeholder record(s) still present ` +
          `— run \`node tools/seed-newsroom-content.mjs --remove\``,
      );
    }
    if (row.blogPublic !== "1") {
      failures.push(
        `${row.name}: blog_public=${row.blogPublic}; the live site would not ` +
          `be indexed — set it to 1 once the placeholders are gone`,
      );
    }
  }

  if (rows.length === 0) {
    console.error("\nNo tenants reported. Refusing to call this clear.");
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

main();

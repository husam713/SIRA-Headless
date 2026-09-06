#!/usr/bin/env node
/**
 * Seed clearly-marked placeholder editorial into the SIRA WordPress Multisite.
 *
 * Authorized by ADR-030 as CREATE-ONLY. It never edits or deletes a record it
 * did not create: `--remove` deletes only posts carrying `_sira_seed=1`, and a
 * re-run skips anything already seeded rather than duplicating it.
 *
 * The content is invented. See tools/seed/README.md, which also lists the
 * entries whose claims an editor must REWRITE rather than polish.
 *
 * Usage:
 *   node tools/seed-newsroom-content.mjs --dry-run     # print the plan
 *   node tools/seed-newsroom-content.mjs               # create
 *   node tools/seed-newsroom-content.mjs --remove      # delete every _sira_seed record
 *
 * Requires the `sira` SSH alias and WP-CLI on the remote host.
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SEED = JSON.parse(
  readFileSync(new URL("./seed/newsroom-seed.json", import.meta.url), "utf8"),
);
const BODIES = JSON.parse(
  readFileSync(new URL("./seed/newsroom-bodies.json", import.meta.url), "utf8"),
);

const WP_ROOT = "~/domains/siratrgroup.com/public_html";
const MARKER = "_sira_seed";
const TYPE_LIST = "sira_news,sira_insight,sira_article,sira_press_release";

const POST_TYPE = Object.freeze({
  news: "sira_news",
  insight: "sira_insight",
  article: "sira_article",
  "press-release": "sira_press_release",
});

// ADR-014. `real-estate` is the CMS term; `realestate` is the site key. The two
// are deliberately not derivable from one another.
const TENANT_DESK = Object.freeze({
  group: null,
  consulting: "consulting",
  healthcare: "healthcare",
  lifestyle: "lifestyle",
  realestate: "real-estate",
});

function ssh(script) {
  return execFileSync("ssh", ["-o", "BatchMode=yes", "sira", "bash -s"], {
    input: script,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

/** Single-quote for POSIX sh, so no editorial copy can ever reach the shell. */
function q(value) {
  return `'${String(value).replaceAll("'", `'\\''`)}'`;
}

function tenants() {
  const raw = ssh(`cd ${WP_ROOT}
for u in $(wp site list --field=url); do
  printf '%s\\t%s\\n' "$u" "$(wp option get blogname --url=$u)"
done`);

  return raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [url, blogname] = line.split("\t");
      const key = blogname.replace(/^SIRA\s+/iu, "").toLowerCase();
      return { url, blogname, key: key === "" ? "group" : key };
    })
    .filter((tenant) => Object.hasOwn(TENANT_DESK, tenant.key));
}

/**
 * Which entries belong on which tenant.
 *
 * Group carries the whole network's record, because its feed is unfiltered. A
 * branch carries only the entries filed to its own desk, because its feed is
 * resolved through that desk's term connection.
 */
function entriesFor(tenantKey) {
  const desk = TENANT_DESK[tenantKey];
  if (desk === null) return SEED.entries;
  return SEED.entries.filter((entry) => entry.desks.includes(desk));
}

function planLines() {
  const lines = [];
  for (const key of Object.keys(TENANT_DESK)) {
    const entries = entriesFor(key);
    const withBody = entries.filter((e) => BODIES[e.key] !== undefined).length;
    lines.push(
      `  ${key.padEnd(11)} ${String(entries.length).padStart(2)} entries` +
        ` (${withBody} with a full body)`,
    );
  }
  return lines;
}

function seedScript(tenant) {
  const entries = entriesFor(tenant.key);
  const desk = TENANT_DESK[tenant.key];
  const parts = [`cd ${WP_ROOT}`, `URL=${q(tenant.url)}`, `CREATED=0`, `SKIPPED=0`];

  for (const entry of entries) {
    const type = POST_TYPE[entry.kind];
    const body = BODIES[entry.key] ?? "";
    // On Group an entry is filed to its own desks; on a branch it is filed to
    // that branch's desk, which is what its feed resolves through.
    const terms =
      desk === null
        ? entry.desks.filter((d) => d !== "group")
        : [desk];
    const date =
      entry.publishedAt === null
        ? null
        : entry.publishedAt.replace("T", " ").slice(0, 19);

    // Composed as a flat argument list rather than a backslash-continued
    // block: the single entry with no publication date emitted a continuation
    // followed by a blank line, which silently split `wp post create` in two.
    const createArgs = [
      "wp post create --porcelain",
      `--post_type=${type}`,
      "--post_status=publish",
      `--post_title=${q(entry.title)}`,
      `--post_excerpt=${q(entry.excerpt ?? "")}`,
      `--post_content=${q(body)}`,
      ...(date === null
        ? []
        : [`--post_date=${q(date)}`, `--post_date_gmt=${q(date)}`]),
      `--url="$URL"`,
    ].join(" ");

    // Two skip conditions, not one. The seed key stops a re-run duplicating its
    // own work; the TITLE check stops it duplicating the CMS's. The demo record
    // was written from the same reference material the existing records came
    // from, so several entries collide with real content by design — and a
    // newsroom that lists the same partnership twice is worse than one that
    // lists it once.
    parts.push(`
EXISTING=$(wp post list --post_type=${type} --post_status=any --meta_key=${MARKER}_key --meta_value=${q(entry.key)} --field=ID --url="$URL" 2>/dev/null | head -1)
COLLIDES=$(wp post list --post_type=${TYPE_LIST} --post_status=any --field=post_title --url="$URL" 2>/dev/null | grep -Fxc ${q(entry.title)} || true)
if [ -n "$EXISTING" ] || [ "$COLLIDES" != "0" ]; then
  SKIPPED=$((SKIPPED+1))
else
  ID=$(${createArgs})
  wp post meta update "$ID" ${MARKER} 1 --url="$URL" >/dev/null
  wp post meta update "$ID" ${MARKER}_key ${q(entry.key)} --url="$URL" >/dev/null
  ${
    terms.length === 0
      ? ""
      : `wp post term set "$ID" sira_business_unit ${terms
          .map((t) => q(t))
          .join(" ")} --by=slug --url="$URL" >/dev/null`
  }
  CREATED=$((CREATED+1))
fi`);
  }

  parts.push(`echo "${tenant.key}: created=$CREATED skipped=$SKIPPED"`);
  return parts.join("\n");
}

/**
 * Titles compared the way a reader would compare them.
 *
 * The CMS holds curly apostrophes ("Nairobi’s") where the seed payload holds
 * straight ones, so a byte-exact comparison reported two records as distinct
 * that are plainly the same story. Case, punctuation and whitespace are all
 * normalised away before matching.
 */
function titleKey(title) {
  return title
    .normalize("NFKD")
    .replace(/[‘’ʼ′]/gu, "'")
    .replace(/[“”]/gu, '"')
    .replace(/[‐-―]/gu, "-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, " ")
    .trim();
}

/**
 * Remove seeded records that duplicate something the CMS already had.
 *
 * Two phases on purpose: the inventory is read first and the decision is made
 * here, so the delete list is computed against normalised titles and only ever
 * contains ids that carry the marker. A real record cannot be selected.
 */
function dedupe(dryRun) {
  const raw = ssh(`cd ${WP_ROOT}
for u in $(wp site list --field=url); do
  for id in $(wp post list --post_type=${TYPE_LIST} --post_status=any --field=ID --url="$u" 2>/dev/null); do
    SEED=$(wp post meta get "$id" ${MARKER} --url="$u" 2>/dev/null || echo 0)
    printf '%s\t%s\t%s\t%s\n' "$u" "$id" "$SEED" "$(wp post get "$id" --field=post_title --url="$u")"
  done
done`);

  const rows = raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [url, id, seed, ...rest] = line.split("\t");
      return { url, id, seeded: seed === "1", title: rest.join("\t") };
    });

  const doomed = [];
  const byTenant = new Map();
  for (const row of rows) {
    if (!byTenant.has(row.url)) byTenant.set(row.url, []);
    byTenant.get(row.url).push(row);
  }

  for (const [url, tenantRows] of byTenant) {
    const seen = new Map();
    // Real records claim their title first, so a collision always resolves
    // against the seeded copy regardless of the order WP-CLI returned them in.
    for (const row of [...tenantRows].sort((a, b) => Number(a.seeded) - Number(b.seeded))) {
      const key = titleKey(row.title);
      if (seen.has(key)) {
        if (row.seeded) doomed.push({ ...row, duplicateOf: seen.get(key) });
      } else {
        seen.set(key, row.title);
      }
    }
  }

  if (doomed.length === 0) {
    console.log("No seeded record duplicates an existing title.");
    return;
  }

  for (const row of doomed) {
    console.log(`  remove seeded #${row.id}: ${row.title}`);
    console.log(`      duplicate of: ${row.duplicateOf}`);
  }

  if (dryRun) {
    console.log("\n--dry-run: nothing was deleted.");
    return;
  }

  const script = [`cd ${WP_ROOT}`]
    .concat(
      doomed.map(
        (row) => `wp post delete ${row.id} --force --url='${row.url}' >/dev/null`,
      ),
    )
    .concat([`echo "deleted=${doomed.length}"`])
    .join("\n");

  console.log(ssh(script).trim());
}

function removeScript() {
  return `cd ${WP_ROOT}
TOTAL=0
for u in $(wp site list --field=url); do
  IDS=$(wp post list --post_type=sira_news,sira_insight,sira_article,sira_press_release \\
    --post_status=any --meta_key=${MARKER} --meta_value=1 --field=ID --url="$u" 2>/dev/null | tr '\\n' ' ')
  if [ -n "$IDS" ]; then
    # force=true: skip the trash, so a "removed" record is actually gone and the
    # launch gate cannot pass while copies sit in wp_posts with status 'trash'.
    wp post delete $IDS --force --url="$u" >/dev/null
    N=$(echo $IDS | wc -w)
    TOTAL=$((TOTAL+N))
    echo "  $(wp option get blogname --url=$u): deleted $N"
  else
    echo "  $(wp option get blogname --url=$u): none"
  fi
done
echo "total_deleted=$TOTAL"`;
}

function main() {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const remove = argv.includes("--remove");
  const dedupeMode = argv.includes("--dedupe");

  if (dedupeMode) {
    console.log("Seeded records duplicating an existing title:");
    dedupe(dryRun);
    return;
  }

  if (remove) {
    console.log("Removing every record marked " + MARKER + "=1 ...");
    console.log(ssh(removeScript()).trim());
    return;
  }

  console.log("Placeholder editorial seed (ADR-030). INVENTED CONTENT.");
  console.log("Plan:");
  for (const line of planLines()) console.log(line);

  if (dryRun) {
    console.log("\n--dry-run: nothing was written.");
    return;
  }

  // The indexing gate is a precondition, not a follow-up: placeholder content
  // must never be creatable on a tenant that is inviting crawlers in.
  const publicFlags = ssh(`cd ${WP_ROOT}
for u in $(wp site list --field=url); do printf '%s ' "$(wp option get blog_public --url=$u)"; done`)
    .trim()
    .split(/\s+/u);

  if (publicFlags.some((flag) => flag !== "0")) {
    console.error(
      "\nREFUSED: blog_public is not 0 on every tenant (" +
        publicFlags.join(",") +
        ").\n" +
        "Placeholder content must not be created while WordPress invites indexing.\n" +
        "  ssh sira \"cd " +
        WP_ROOT +
        " && for u in \\$(wp site list --field=url); do wp option update blog_public 0 --url=\\$u; done\"",
    );
    process.exitCode = 1;
    return;
  }

  console.log("\nblog_public=0 on all tenants. Writing ...");
  for (const tenant of tenants()) {
    console.log("  " + ssh(seedScript(tenant)).trim());
  }
}

main();

export { entriesFor, TENANT_DESK, POST_TYPE, fileURLToPath };

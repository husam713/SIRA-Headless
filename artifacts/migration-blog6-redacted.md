# CMS hostname relocation — first tenant checkpoint (redacted)

Redacted record. Hostnames, database identifiers, filesystem paths, and
numeric site identifiers are omitted deliberately; this file is safe to commit.
Notation: `<old-host>` / `<new-host>` for the tenant's previous and current
backend hostnames, `<T>` for a site identifier, `wp_<T>_*` for that site's
per-site tables.

## Scope of this pass

One tenant only — the pre-launch tenant, which was not publicly launched and
had search-engine visibility disabled. The network's main site was explicitly
out of scope: no change to the network identity row, no change to the
network-domain constant, no configuration-file edit of any kind.

## Outcome

`PASS`. The tenant's backend now answers on `<new-host>`. Its previous
hostname is no longer recognised by the CMS and returns the platform's
"unknown site" signup redirect, which is the expected pre-DNS-cutover state.

Changes applied, in order:

1. Scoped string replacement across the tenant's own tables, HTTPS form of the
   old host to the HTTPS form of the new host — 302 replacements.
2. The same, HTTP form of the old host to the HTTPS form of the new host — 4
   replacements.
3. The tenant's routing row, updated through the platform's multisite API so
   that its hooks and cache invalidation ran. Never a bare `UPDATE`.
4. Cache flush.

Totals matched the dry run exactly (306), and matched an independent SQL row
count taken before the write (306).

## GUID asymmetry — deliberate, do not generalise

The pre-launch tenant's `guid` column **was rewritten** (172 rows). This was
safe only because that tenant had never been public: no feed subscriber could
hold the old GUIDs, so no duplicate-item risk existed.

**The four live tenants will NOT have `guid` rewritten.** Their relocations run
with `--skip-columns=guid`, and their post-move acceptance criterion is
therefore different: zero old-host occurrences in that tenant's tables
*outside* `guid`, with `guid` deliberately retaining the old host string.

Do not carry the pre-launch tenant's GUID decision forward as a default. It is
a per-tenant judgement.

## Transferable finding: the tool silently skips unregistered tables

The CLI's search-replace command only accepts tables registered with the CMS
core unless widened with the "all tables with prefix" flag. Passing other table
names does **not** raise an error — they are silently dropped from the run.

For this tenant that meant 12 of its 22 tables were never scanned by the first
dry run, including the SEO plugin's indexable table. Those tables held 129
references to the old host. Had the migration proceeded on that first dry run,
the tenant would have moved while still advertising its old hostname in
canonical URLs, Open Graph URLs, and sitemap entries — and a verification that
only inspected the tables the tool had scanned would have reported success.

Every remaining tenant relocation must use the widening flag. Reconcile the
dry-run replacement count against an independent SQL row count before writing;
agreement of those two numbers is what makes the dry run trustworthy.

## Environment constraints discovered

- `proc_open` is disabled, so every CLI subcommand that shells out to the
  database client binaries fails. Database export and import through the CLI
  are unavailable; the client binaries must be invoked directly.
- This had already produced silent damage: four of the eight existing backup
  archives were 20-byte empty files — valid archives containing zero tables —
  created by piping a failed export into a compressor without checking its exit
  status. They were dated as though they were genuine restore points. They have
  been quarantined into a `.failed/` subdirectory.
- Backups now write to an uncompressed file first so the exporter's exit status
  is unambiguous, then compress. Verification requires: exporter exit 0,
  archive integrity check passes, table count equal to live, and the exporter's
  completion marker present.
- The database account holds privileges on exactly one schema and cannot create
  another, so an isolated restore rehearsal requires a scratch schema created
  through the hosting control panel.

## Incident during reconnaissance

A read-only diagnostic loop opened one database client connection per column
per table, exhausting the account's connection ceiling for roughly a minute.
Live sites may have shown database connection errors in that window. No write
was attempted; all checks afterwards were clean. Database work is now batched
into single connections, and any step requiring many queries is flagged in
advance.

## Verification performed

- Zero old-host occurrences remaining in the tenant's tables, confirmed twice:
  by dry run with the widening flag, and by direct SQL across every affected
  column.
- Routing row shows the new host; the other tenants' rows unchanged.
- The new host serves the tenant rather than the signup redirect; response
  headers, REST payloads, and sitemap entries all emit the new host.
- The network's main site and all other tenants still return HTTP 200.
- Network administration loads.
- Sitemap entries confirmed on the new host.

One criterion could not be checked as written: the tenant returns a zero-byte
HTML body, so it has no document head to inspect for canonical or Open Graph
tags. This is pre-existing — the identical response was recorded on the old
host before any change — and is expected for this tenant's headless
configuration, where the CMS serves APIs and a separate frontend renders. The
machine-readable interfaces return complete data on the new host. Accepted by
the owner as cleared.

---

# Subsequent tenant relocations

Same notation as above. Tenants are identified by relocation order, never by
hostname or site identifier. Every tenant below is a live tenant, unlike the
first, so all of them run with `guid` rewriting disabled.

## Standing procedure for a live tenant

1. Fresh attribution pass over the newest verified dump, computed per tenant.
   Findings are never carried forward between tenants — cross-tenant references
   exist here, and each tenant's residue profile differs.
2. TLS and vhost check on the destination hostname. A signup-redirect response
   with a valid certificate chain is the correct pre-move answer.
3. Fresh verified dump immediately before writing: exporter exit 0, archive
   integrity pass, table count equal to live, completion marker present.
4. Four scoped replacement passes — plain and JSON-escaped, each in HTTP and
   HTTPS form — with `guid` skipped and the audit-log table excluded.
5. Reconcile every dry-run count against SQL row counts. The verification query
   is generated *from* the dry-run output rather than by naming columns by hand.
6. Routing row updated through the multisite API. Never a bare `UPDATE`.
7. Post-write: all four forms return zero, tenant key resolves correctly, brand
   query returns that tenant's own identity rather than a network fallback, and
   every other tenant's routing row is confirmed unchanged.

## Second relocated tenant

| Check | Result |
| --- | --- |
| Replacements applied | 64 + 20 + 0 + 6 = 90, matching dry run exactly |
| Dry run vs SQL ground truth | Exact match on every table/column pair |
| All four forms post-write | 0 |
| `guid` retained deliberately | 81 rows keep the old host; 0 rows hold the new one |
| SEO permalinks migrated | 64 new, 0 old |
| Escaped image-meta JSON migrated | 6 new, 0 old |
| Audit log preserved | Old host survives in one record; 0 records mention the new host |
| Routing row | Only this tenant's row changed |
| Site URL options | Both moved, and upgraded from HTTP to HTTPS |
| Destination host serves the tenant | HTTP 200, no signup redirect |
| Previous host | Signup redirect — expected until DNS cutover |
| Other tenants, network root, network admin | All unaffected |
| Tenant key resolution | Correct tenant key |
| Brand query | Own name, key and palette; no network fallback |

Notable: this tenant introduced JSON-escaped references, where a URL is stored
with escaped separators inside a JSON payload. Scheme-anchored replacement of
the plain form cannot match them. They were handled by two additional passes
against the escaped form. Escaped-form passes are order-independent and safe;
an unanchored bare-hostname replacement is **not**, because the new hostname
contains the old one as a substring and a second pass would double the prefix.

Audit-log records were deliberately excluded from replacement. Rewriting them
would make historical records assert a hostname that did not exist when the
operation they describe was performed. The acceptance criterion was amended to
match, rather than the history being altered to satisfy the criterion.

## Third relocated tenant

| Check | Result |
| --- | --- |
| Replacements applied | 57 + 10 + 0 + 1 = 68, matching dry run exactly |
| Dry run vs SQL ground truth | Exact match on all ten table/column pairs |
| All four forms post-write | 0 |
| `guid` retained deliberately | 59 rows keep the old host; 0 rows hold the new one |
| SEO permalinks migrated | 56 new, 0 old |
| Escaped image-meta JSON migrated | 1 new, 0 old |
| Builder template whitelist | Brought current, serialization-safe, all sibling entries mapped |
| Routing row | Only this tenant's row changed |
| Site URL options | Both moved to the destination host over HTTPS |
| Destination host serves the tenant | HTTP 200, no signup redirect |
| Other tenants, network root, network admin | All unaffected |
| Tenant key resolution | Correct tenant key |
| Brand query | Own name, key and palette; no network fallback |

Notable: this tenant had **no** escaped references of the HTTPS form and only a
single escaped HTTP one — a different profile from the previous tenant, which
is why attribution is recomputed per tenant rather than assumed.

A page-builder plugin stores a cross-site template whitelist as a newline
separated hostname list inside a serialized settings array. This tenant's copy
was brought current in the same pass, through the options API so serialization
is handled by the platform, with the other ten keys in that array confirmed
intact on readback. The network main site holds its own copy of the same
setting; it is **deferred**, along with the rest of the main-site relocation.

### Methodology note carried forward

In a database dump, a stored backslash is written doubled. An attribution scan
searching the dump for the escaped form must therefore double its own
backslashes, while the replacement command must search for the single-backslash
form as actually stored. These two needles are not interchangeable, and a
mismatch silently reports zero. Dry-run output reconciled against SQL row
counts is the authoritative check; the attribution scan is a discovery aid.

## Fourth relocated tenant

| Check | Result |
| --- | --- |
| Replacements applied | 44 + 8 + 0 + 0 = 52, matching dry run exactly |
| Dry run vs SQL ground truth | Exact match on all six table/column pairs |
| All four forms post-write | 0 |
| `guid` retained deliberately | 26 rows keep the old host; 0 rows hold the new one |
| SEO permalinks migrated | 46 new, 0 old |
| Escaped forms | None present in this tenant |
| Builder template whitelist | Not present in this tenant's options |
| Routing row | Only this tenant's row changed |
| Site URL options | Both moved to the destination host over HTTPS |
| Destination host serves the tenant | HTTP 200, no signup redirect |
| Other tenants, network root, network admin | All unaffected |
| Tenant key resolution | Correct tenant key |
| Brand query | Own name, key and palette; no network fallback |

## Fifth relocated tenant

| Check | Result |
| --- | --- |
| Replacements applied | 44 + 7 + 0 + 0 = 51, matching dry run exactly |
| Dry run vs SQL ground truth | Exact match on all six table/column pairs |
| All four forms post-write | 0 |
| `guid` retained deliberately | 25 rows keep the old host; 0 rows hold the new one |
| SEO permalinks migrated | 45 new, 0 old |
| Escaped forms | None present in this tenant |
| Builder template whitelist | Not present in this tenant's options |
| Routing row | Only this tenant's row changed |
| Site URL options | Both moved to the destination host over HTTPS |
| Destination host serves the tenant | HTTP 200, no signup redirect |
| Other tenants, network root, network admin | All unaffected |
| Tenant key resolution | Correct tenant key |
| Brand query | Own name, key and palette; no network fallback |

## Branch-tenant phase complete

All five branch tenants now answer on their destination hostnames. Every
previous hostname returns the platform's unknown-site signup redirect, which is
the expected state until DNS is repointed at the separate frontend. The network
main site was not touched in any pass: its routing row, its network-domain
constant, the network identity row, and its own copy of the builder whitelist
are all unchanged and remain deferred to a separately authorised exercise.

Aggregate: 306 + 90 + 68 + 52 + 51 = 567 replacements across five tenants.
Every tenant's dry run reconciled exactly against SQL row counts before its
write, and every tenant's post-write scan returned zero across all four string
forms.

Each tenant produced a different residue profile. Escaped JSON references
appeared in two tenants and were absent in three. The builder whitelist existed
in one branch tenant and the main site, not in the others. Per-tenant
attribution is therefore mandatory; carrying one tenant's findings to the next
would have missed real references in some tenants and invented work in others.

### Deferred items

- The network main site's relocation in full, including its network-domain
  constant and network identity row.
- The main site's copy of the builder template whitelist. It still lists
  previous tenant hostnames, which no longer resolve to those tenants. It was
  left untouched because it belongs to the deferred main-site scope, but it is
  now stale and should be brought current in that pass.
- All previous tenant hostnames remain parked, resolving to the platform's
  unknown-site response, pending the DNS cutover to the separate frontend.

---

# Stale configuration — documented, not repaired

Owner decision: these are left exactly as they are. The page builder that owns
this setting is recorded in the engineering operating rules as **not a
production headless dependency**, so maintaining its cross-site whitelist would
be chasing deprecated tooling. Documented here so a later reader does not
rediscover them as if they were unknown.

## Builder template whitelist

Option key `bricks_global_settings`, a serialized array. Within it, the key
`myTemplatesWhitelist` holds a newline-separated list of bare hostnames. The
builder's cross-site "my templates" feature reads it to decide which sibling
hostnames a site may pull shared templates from.

| Site | Option present | `myTemplatesWhitelist` | Entries | Stale entries |
| --- | --- | --- | --- | --- |
| Network main site | yes, 15 keys | yes | 3 | **3** |
| Second relocated tenant | yes, 3 keys | no | — | — |
| Third relocated tenant | yes, 11 keys | yes | 4 | 0 |
| Fourth relocated tenant | yes, 3 keys | no | — | — |
| Fifth relocated tenant | yes, 3 keys | no | — | — |
| First relocated tenant | option absent | — | — | — |

The main site's three entries all name previous tenant hostnames, none of which
resolves to those tenants any more. That copy belongs to the deferred main-site
scope and was never touched.

The third relocated tenant's copy was brought current during its own pass, under
an explicit instruction given before this decision was taken. Its four entries
all point at destination hostnames and none is stale. It was left in that
updated state rather than reverted, because reverting would itself be a write
and no further writes to these options are authorised.

## Known-stale historical provenance

One row in the shared user-meta table, `umeta_id 153`, holds a `source_domain`
value naming a tenant's previous hostname. It records which site that user
originally registered from. It is historical provenance, it does not
self-regenerate, and nothing in the relocation depends on it. Left as-is by
owner decision.

Five further shared user-meta rows hold per-tenant SEO plugin admin
notifications that embed previous hostnames. Those are transient interface
notices that the plugin regenerates on its own. Also left as-is.

---

# Frontend / DNS follow-up

What the CMS-side relocation deliberately does **not** do. None of the
following is addressed by any pass recorded above, and the tenants are not
reachable by their intended public audience until these are handled.

## (a) Frontend endpoint configuration still points at the previous hostnames

The frontend reads one GraphQL endpoint per tenant from environment variables
following the pattern `SIRA_WP_<TENANT>_GRAPHQL_URL`, declared in the frontend
environment example, its WordPress config module, the source-of-truth register,
and a topology contract test. Every one of them still names a **previous**
hostname. Each must move to its tenant's destination hostname over HTTPS before
the frontend can resolve content. The relocation changed the CMS; it did not and
could not change the deployment's environment.

Note that these variables are per tenant and include an entry for the network
main site, whose relocation has not happened. That entry must not be moved yet.

## (b) Previous hostnames stay parked until DNS moves

Every previous tenant hostname now answers with the platform's unknown-site
signup redirect, because the CMS no longer recognises it. DNS still points those
names at the CMS origin. Until each name is repointed at the frontend
deployment, a visitor arriving on an old hostname gets that redirect rather than
a site. This is the expected intermediate state, not a defect, but it is a real
user-visible condition for as long as it lasts.

The pre-launch tenant's previous CMS hostname is a Group subdomain that, under
the current recorded topology decision (ADR-035), is also its active pre-launch
public frontend hostname. Relocating the CMS off it is what that tenant's move
was for: it resolves the recorded collision and leaves that subdomain parked for
the frontend exactly like the other four. The tenant's eventual Saudi apex is a
later, configuration-only cutover and is not part of this scope.

[Corrected 2026-09-10 during repository reconciliation (ADR-036 / SOT-003): the
original wording here described this tenant under the superseded ADR-033
separate-apex premise.]

## (c) Platform egress reachability to the destination hosts is UNVERIFIED

A recorded decision (ADR-032) establishes that the host's CDN challenges
requests from datacenter and VPN address space, returning 403 for the **entire
origin** rather than for any particular path — the block follows the client
network, not the endpoint. That decision explicitly leaves one thing unproven:
whether a server-side fetch from the frontend's own hosting platform passes the
challenge, since that platform's egress is also datacenter address space.

Everything verified in this record was measured **from the origin itself over
SSH**, where no CDN challenge applies. That means the destination hostnames are
proven to serve their tenants, and proven to answer with valid certificates, but
are **not** proven to be reachable from the frontend's egress.

This session produced incidental corroboration of the underlying condition: the
operator's first connection attempts to the origin failed entirely while
egressing through a commercial VPN exit, and succeeded immediately once that
tunnel was disabled — the same client-network class ADR-032 describes.

**Required before the frontend depends on these hosts:** one server-side fetch
from the deployment platform's egress against one destination hostname,
confirming a non-403 response. Until that runs, treat platform reachability as
`UNKNOWN` — neither broken nor working.

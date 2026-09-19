# Main-site relocation — plan (redacted, not authorised to execute)

Redacted to the same convention as the relocation record: no hostnames, no
database identifiers, no filesystem paths, no numeric site identifiers.
Notation: `<apex>` is the network's public apex domain, `<cms-apex>` its
intended backend hostname, `<TENANT>` a tenant placeholder.

**Status: NOT STARTED.** Reconnaissance and the restore rehearsal are complete.
Execution is blocked on two owner items recorded below. This document is a plan,
not an authorisation, and the main-site window is a separately authorised
exercise.

## Why this tenant is not like the other five

The five branch tenants each had a hostname that appeared nowhere else. The
apex appears **inside every other hostname in the estate**, inside every staff
email address, and inside a filesystem directory name. Of roughly 8,085
occurrences of the apex string:

| Class | Count | Treatment |
| --- | --- | --- |
| Apex URLs over HTTPS | 7,096 | the migration target, split below |
| Part of a longer hostname | 828 | must never match |
| Email addresses | 103 | must never match |
| JSON-escaped apex URLs | ~30 | target, needs escaped passes |
| Filesystem paths naming the domain directory | ~22 | must never match |
| Apex URLs over HTTP | 3 | target |

Scheme-anchored replacement is safe: the destination hostname is not a
substring of any anchored form. **An unanchored bare-hostname replacement would
corrupt 828 hostnames, 103 email addresses, and every stored file path.** It is
prohibited on this tenant under any circumstances.

## The unresolved policy decision

The 7,096 anchored apex URLs are two populations wanting opposite handling:

| Population | Count | Argument |
| --- | --- | --- |
| Media and asset URLs | 6,024 | Assets are served by the CMS, so they follow the CMS to the new backend hostname. |
| Builder and field-plugin internal URLs | ~70 | CMS-internal; follow the CMS. |
| Administration URLs | 2 | Follow the CMS. |
| **Editorial permalinks** | **~1,000** | After cutover the apex serves the separate frontend. These already point where a visitor should land. Rewriting them aims public content at the CMS instead. |
| Bare apex root URLs | 22 | Split: the site-URL and home options must move; links must not. |

A single blanket pass is wrong in one direction or the other. This must be
settled before the window opens. It does not arise for the branch tenants
because their volumes were trivial and their old hostnames are being parked.

## Preconditions — none of these are satisfied by CMS-side work

1. **The destination hostname must exist with valid TLS.** It currently
   resolves but presents no usable certificate; a TLS handshake fails outright.
   Every branch tenant passed this gate before its write. This one does not yet.
2. **The frontend must be deployed and reading the tenants' backend endpoints.**
3. **Platform egress reachability must be tested from the frontend's own
   platform.** A recorded decision establishes that the host's CDN challenges
   datacenter and VPN address space, returning failures for the entire origin
   rather than any one path, and explicitly leaves untested whether a
   server-side fetch from the deployment platform passes. The chosen platform is
   datacenter egress, which is exactly the challenged class. One server-side
   fetch settles it. Until it runs, treat reachability as UNKNOWN.
4. **Apex DNS time-to-live lowered in advance**, so the cutover is not held
   hostage by cached records.
5. **The policy decision above, settled.**

## Restore rehearsal — COMPLETE, PASS

The newest verified dump was restored into an isolated scratch schema. Seven
independent row counts matched the live database exactly, including the largest
content and metadata tables, the network tables, and one tenant's tables.

**A full restore takes about four seconds.** That number matters: it is the
real cost of the rollback, and it is what makes a tight cutover window
defensible rather than optimistic.

## Sequence for the window

Steps 1 and 2 are routing-neutral and may run ahead of the window. Step 3 must
execute as one scripted sequence, because from the moment the configuration
constant and the identity rows disagree, the network bootstraps inconsistently.

1. Fresh verified dump — exporter exit zero, archive integrity, table count
   equal to live, completion marker. This is the rollback point.
2. Asset and CMS-internal replacement passes, scheme-anchored, in plain and
   JSON-escaped form, over both schemes, with the audit-log table excluded and
   the editorial-permalink policy applied as decided.
3. Identity set, in one tight sequence:
   - the network identity row's domain,
   - the main site's routing row,
   - the main site's site-URL and home options,
   - the network's own site-URL metadata value,
   - the network-domain constant in the configuration file, edited in place
     with a backup taken first.
   The path constant stays as it is. **The cookie-domain constant needs no
   edit** — it is already derived from the request host rather than hardcoded.
4. Verify on the new backend hostname before touching DNS.
5. Repoint apex DNS at the frontend.

## Rollback

Restore the pre-write dump over the live schema and revert the configuration
file from its backup. The dump carries drop-and-create for every table, so it is
a full replace rather than a merge. Measured restore time is about four seconds.

Because it is a whole-database restore, it also reverts anything the other five
tenants wrote after the dump was taken. Their exposure is the length of the
window, which is why the window is kept short and why the dump is taken
immediately before the write rather than reused from an earlier pass.

## Residual risk, stated plainly

The database half of this plan rehearses cleanly against the scratch schema.
The configuration-file half **cannot** be fully rehearsed without a second
virtual host pointing at the scratch schema. Its effect is well understood and
it is a single-line change with a file backup taken first, but it will not have
been executed end to end before the real run, and this document does not claim
otherwise.

## Acceptance criteria

- Zero anchored apex occurrences remaining in the categories chosen to move,
  across all four string forms.
- Email addresses, longer hostnames, and stored filesystem paths all unchanged,
  verified by count before and after.
- Network identity row, main-site routing row, and site-URL options all naming
  the new backend hostname.
- Every branch tenant's routing row unchanged.
- Network administration loads; each branch tenant still resolves and serves.
- Tenant key resolution and the brand query answer correctly for the main site.
- The apex serves the frontend, not the CMS, once DNS has moved.

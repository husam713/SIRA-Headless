# SIRA Engineering Handoff

Use this file when opening a new ChatGPT/Codex session or handing the project to another engineer.

## Read first

1. `/AGENTS.md`
2. `/docs/AI-ENGINEERING-OS.md`
3. `/docs/AI-ENGINEERING-OPERATING-PROTOCOL.md`
4. `/project-state.json`
5. `/docs/PROJECT-STATE.md`
6. `/docs/SOURCE-OF-TRUTH.md`
7. relevant entries in `/docs/DECISIONS.md`
8. `/docs/adr/ADR-025-GROUP-STAGING-FIRST.md`
9. `/docs/SIRA-EDITORIAL-ARCHITECTURE-SPEC.md`

Then reconcile them against Git before editing.

## Repository

- Repository: `husam713/SIRA-Headless`
- Canonical integration/default branch: `main`
- Current repository HEAD: verify from Git; do not infer it from a recorded state snapshot
- PR `#31` reconciliation starting baseline: `aaa88631c862d213f890d2991aa63fd26ce925e3`
- PR `#31` accepted candidate: `daf7479114f4faba3fa736ee957e03a8d207d49e`
- PR `#31` merge / state verified-through coordinate: `85b749da5a7769a48e67b22685db904607e0a388`
- PR `#31` reconciliation status: OWNER ACCEPTED / MERGED
- Latest accepted architecture milestone: Step 4 Responsive Composition Architecture / ADR-029, owner accepted after implementation on 2026-09-02 through the PR `#48` comment
- Preceding canonical architecture decision: Step 4 Editorial Architecture / ADR-028 through PR `#30`; ADR-029 implements ADR-028 §4 and §10 and does not supersede it
- AI Engineering OS Governance Foundation: PR `#33`, owner authorized, implementation completed, independently verified, merged, post-merge verified, canonical
- Governance Foundation candidate / merge provenance: `4c695a0e3c9950b5ec6ede35ca836c5532814cc1` / `009bbfdb64cb38b2ddacbb1e7b8884eb614c47aa`
- Acceptance-Gates current-state maintenance: PR `#34`, closed / post-merge verified / canonical
- Acceptance-Gates candidate / merge provenance: `3ca656a3eaa84fc076d1cd6fe4677a2e461cca68` / `86581d46b07a7b971cd2de44b476e1ac0b25bfee`
- Historical SOT-001 state-reconciliation merge: `e20858b055e556065e96623205fa0d5774ad81d6`
- Latest accepted CMS mutation-readiness milestone: Step 2C.5B
- Latest approved tag: `step-2c3b-approved`
- SOT-001 backend source conflict: CLOSED through PR #18/#19 reconciliation

All recorded merge SHAs above are historical/provenance coordinates. Discover
current HEAD from Git.

## AI Engineering OS execution model

There is one logical mutation-capable role:

`IMPLEMENTATION`

It uses one execution profile:

- `LOCAL`
- `CLOUD_GITHUB`

Program Control selects the least-complex profile that can satisfy the task's
required evidence, validation, security, and mutation requirements. Do not ask
the owner to choose an environment when those requirements already determine
the profile.

`LOCAL` is used when task correctness materially depends on local-only
filesystem/working-tree/protected evidence, local generation/debugging,
browser/runtime testing, or local dev-environment interaction.

`CLOUD_GITHUB` is sufficient when required implementation/evidence is fully
repository/GitHub-visible. A cloud implementation agent must classify local-only
facts as `REPORT_ONLY` or `NOT_VERIFIED_BY_THIS_AGENT` and must never fabricate
local state.

Execution profile does not change Task Packet authority, independent-review
requirements, owner gates, or Canonicality.

## Current state

Step 2C.5B is owner accepted and merged. Its CMS mutation track is NO LONGER `BLOCKED_BY_BACKUP_EVIDENCE`: on 2026-09-05 the owner authorized a backup and Batch A (ADR-030, ADR-031), on 2026-09-06 a verified full multisite backup was taken before any write, and Batch A executed. `cmsMutationAuthorization` is now `OWNER_AUTHORIZED_BOUNDED` and `batchAMutationAuthorized` is true. RB-001 evidence exists; **RB-009 restore evidence does not** — the dump has never been restored. Taxonomy deletion, destructive database operations, Step 2C.5C, staging, deployment, DNS and cutover all remain NOT AUTHORIZED. See the live CMS state section below.

The repository/frontend track has accepted Step 3A, Step 3B, Step 3C.1,
Step 3C.2, and Step 3D.1. Step 3D.2 is NOT STARTED, Step 3D.3 remains gated
by `2C4-B09`, `PREVIEW-AUTH-001` remains DEFERRED, and full Step 3D closure
must not be claimed.

The Homepage Production Data Contract, Step 4 Exact Design Fidelity Charter,
and ADR-028 Editorial Architecture are recorded as owner accepted and merged.

Step 4 visual implementation is IN PROGRESS. It is not NOT STARTED. Git
evidence on `main`: Group homepage sections merged through PRs `#36`, `#38`,
`#40`, `#41`; the shared site header/mobile-menu/footer shell and the branch
homepage merged through PR `#44` at `1078155c`; the shared responsive layout
primitives merged through PRs `#47` and `#48` at `4f8c8d87`; and CMS/menu
enablement merged through PRs `#49`, `#50`, `#51`, `#52`, `#53`; durable-state
reconciliation and the alignment harness gate merged through PR `#55` at
`70bd8618`; and the `CLAUDE.md` bootstrap adapter through PR `#56` at
`dddf9b30`, with `main` at `dddf9b30` when this was reconciled. ADR-029, which
governs the responsive foundation, is owner accepted as of 2026-09-02 through
the PR `#48` comment; acceptance was recorded after implementation and merge,
covers the architecture decision only, and grants no downstream authority.
Prototype and production UI implementation are AUTHORIZED: `project-state.json` records
`authorization.prototypeImplementationAuthorized` and
`authorization.productionUiImplementationAuthorized` as `true`.

Newsroom visual/route work is IMPLEMENTED on the unmerged branch
`feat/newsroom-ledger`, and is NOT merged and NOT owner-accepted. The `/news`
archive, the `[section]/[slug]` article route, the shared `NewsroomPage`, the
desk registry, the live-capture and placeholder-seeding tooling, and the
ADR-030 launch gate all exist there. The earlier statement that no newsroom
route, component or query exists under `frontend/src` is stale.

Acceptance evidence. It differs per pull request and must not be generalized.
For PRs `#44`, `#46`, `#47`, and `#49` through `#53` the merge commit is the
only acceptance-relevant artifact; the threads were inspected on 2026-09-02 and
carry no owner-acceptance artifact. PR `#48` carries an owner comment accepting
the ADR-029 architecture decision only, which explicitly does not accept every
PR `#47`/`#48` implementation detail and does not establish L-O QA completion.
PRs `#55` and `#56` carry owner-acceptance comments at their exact reviewed
candidate heads. Where this file or `docs/PROJECT-STATE.md` states owner
acceptance without such an artifact, that is asserted by a durable document and
is not independently verified. A merge is not by itself evidence of owner
acceptance.

The AI Engineering OS Governance Foundation is already canonical. Preserve its
owner authorization as the authorization dimension, while representing its
lifecycle separately as implementation completed, independent verification
passed, merged, post-merge verified, and canonical. Validator/CI enforcement
and AI Engineering OS product/runtime work remain NOT AUTHORIZED.

## New owner decision — SIRA Digital is a first-class company (ADR-033)

The canonical public production topology is planned to span **two apexes**. SIRA
Digital will trade on `sirahdigital.sa`, a separate Saudi domain. **Read the
2026-09-08 owner decision below before acting on that**: pre-launch, Digital's
active public hostname is `digital.siratrgroup.com`, and `sirahdigital.sa` is
reserved rather than live.

Either way Digital is a first-class tenant of this same platform: the same
WordPress Multisite network, the same
Next.js application, the same GraphQL contract, the same contact pipeline, the
same site registry. It is **not** a separate codebase and **not** a separate
CMS.

If you find `sirahdigital.sa` in the registry, it is authorized — do not report
it as topology drift. As of 2026-09-08 it is the *future* canonical hostname
rather than the active one, and the registry has not yet been updated to say so.
That mismatch is a known, recorded gap, not drift either.

Implementation lives on the unmerged branch `feat/sirahdigital-sa`. The site
key is `digital`, the Business Unit slug is `digital`, and Digital is the only
company set on a dark ground — which took no fork of the shell, because `paper`
is the page ground and `ink` is the text on it.

**The WordPress site IS now provisioned.** This reverses what this file said
before 2026-09-08. The owner's Phase 2 implementation prompt required Digital to
exist as a real site inside the existing Multisite network rather than be
simulated at the registry level, which widened ADR-033's authorization boundary
to include live site creation. Blog 6 was created with `wp site create`, moved
onto `sirahdigital.sa` (path `/`) with `update_blog_details()`, and set to
`blog_public 0` / Asia-Riyadh / week-starts-Sunday to match the other five
tenants. A verified 7.2 MB / 134-table recovery point was taken before the first
write. `docs/DIGITAL-TENANT-PROVISIONING.md` records the investigation that
preceded it, including the finding that `COOKIE_DOMAIN` resolves to the request
host, so a mapped domain needed no wp-config change at all.

Provisioning the WordPress site did NOT register the domain, change DNS, or
authorize deployment. Those remain protected.

Two things are open and must not be assumed finished:

- **The trading-name spelling.** `SIRA Digital` follows the established
  `SIRA <Company>` convention; the domain spells it `sirahdigital`. No prior
  canonical name existed in this repository. Owner confirmation needed.
- **The brand mark.** Digital uses the shared white SIRA mark, which is correct
  for a GROUP company on a dark ground. A Digital-specific mark is an owner
  deliverable.

## New owner decision — Digital launches on a pre-launch subdomain (2026-09-08)

Digital now has **two hostnames with different lifecycles**, and they must not be
collapsed into one:

| Role | Hostname | Status |
| --- | --- | --- |
| Active public frontend, pre-launch | `digital.siratrgroup.com` | **Current** |
| WordPress CMS origin | `digital.siratrgroup.com` | **Current**, moved 2026-09-08 |
| Future public canonical, Saudi | `sirahdigital.sa` | Reserved, **not active** |

**OPEN — that hostname is claimed twice.** WordPress answers on
`digital.siratrgroup.com`, and so should the pre-launch public frontend. One
hostname cannot serve both. Nothing is broken today because no deployment is
authorized; it must be resolved before the frontend is deployed there. At the
ADR-035 cutover the frontend takes `sirahdigital.sa` and the conflict ends.

`sirahdigital.sa` remains the intended canonical domain. It is **not** the active
public frontend hostname yet, and nothing should treat it as live.

**Do not delete or lose the existing Digital WordPress site.** It is blog 6 on
the existing network and it currently carries `wp_blogs.domain =
sirahdigital.sa`. That row is the site's identity; losing it loses the tenant and
its seeded content.

This supersedes the hostname half of ADR-033 for the pre-launch phase. ADR-033's
premise — that Digital is the first company whose canonical hostname is not a
`siratrgroup.com` subdomain — remains true at launch but is **not** true today.
An amending or superseding ADR must be authored to record the phased hostname
strategy; that is a durable decision and has not been written yet.

**Implemented on 2026-09-08 as ADR-035.** `SiteDefinition` gained
`plannedCanonicalHostname` and `plannedAliases`, so a domain a company owns but
has not launched on is modelled as the NEXT address rather than as another
spelling of the current one. `digital.siratrgroup.com` is canonical;
`sirahdigital.sa` and `www.sirahdigital.sa` are registered now as redirect
aliases, so the day DNS points at us they land on Digital instead of being
rejected as unknown hosts.

The cutover is configuration only:

```
SIRA_CANONICAL_HOSTNAMES_JSON={"digital":"sirahdigital.sa"}
```

That promotes the planned hostname to canonical, carries `www.sirahdigital.sa`
with it, and demotes `digital.siratrgroup.com` to a redirect alias so no indexed
URL is orphaned. No rebuild, no content migration, no second deployment. A
promotion target must be a hostname the site already declares, so a typo fails
loudly instead of silently repointing a company.

The public frontend hostname and the WordPress CMS origin remain independent:
the CMS origin is `SIRA_WP_<TENANT>_GRAPHQL_URL`, never derived from the public
hostname. WordPress stays on Hostinger and the public hostname does not expose
`/wp-admin`. `tests/contract/digital-tenant-topology.test.ts` asserts that
separation so a later change cannot quietly couple them.

Still NOT authorized by this: domain registration, public DNS, the WordPress
CMS-domain migration, and deployment.

## Phase 2 — SIRA Digital implementation: resumable state

Verified against the working tree on 2026-09-08 by reading Git and the files
themselves. Do not infer any line of this section from a previous conversation.

### Coordinates

- Branch: `feat/sirahdigital-sa`
- HEAD: this continuity commit. Rediscover it from Git rather than trusting a
  SHA written here.
- Pushed. Draft PR `#65` is current, retitled, and its body carries the full
  validation table.
- **Last safe implementation point: the branch head.** Every gate is green.
- Depends on `feat/newsroom-ledger`. Keep that dependency explicit; do not ship
  Newsroom changes as part of Digital.

### Completed and committed

| Commit | What it landed |
| --- | --- |
| `9b4a7020` | Phase 1 reference-forensics evidence under `artifacts/reference-forensics/` |
| `9adc1e6e` | `digital` site key, registry entry, WordPress env keys, brand preset |
| `1be43843` | Digital brand in `sira-core`; tenant-aware contact recipient routing |
| `bd890b68` | Two-apex topology governance, ADR-033 |
| `c04dfd26` | Digital homepage composition and the CSS motion layer |
| `c4dca911` | `group_sira_digital_homepage` ACF field group |
| `17c5468b` | Computed `onDeep` foreground token, fixing dark-ground contrast |
| `900f8cc4` | Real WordPress tenant (blog 6); live schema captured from six tenants |
| `8bd5822e` | Seed content; homepage rendering from the real CMS |
| `c72a4f0d` | Public routes: services, work, industries, contact, calculator |

### CMS / WordPress state

- Digital is **blog 6**, domain `digital.siratrgroup.com`, path `/`,
  `blog_public 0`. It was created on `sirahdigital.sa` and MOVED on 2026-09-08
  by owner decision, with `update_blog_details()` after a verified 7.59 MB /
  155-table backup. No occurrence of the old hostname remains anywhere in the
  database. **Do not delete or lose this site.**
- Seeded pre-launch content exists on it: a front page, 4 pages
  (about / contact / privacy / terms), 8 `sira_service`, 5 `sira_project`,
  8 `sira_industry` terms, 3 menus. Seeder: `tools/seed/digital-seed.php` with
  `tools/seed/digital-seed.json`; `--remove` reverses it.
- Every seeded post carries post meta `_sira_seed=1`; every seeded industry term
  carries **term meta** `_sira_seed=1`.
- **DEFECT — the launch gate does not see any of it.**
  `tools/verify-no-seed-content.mjs` counts only
  `--post_type=sira_news,sira_insight,sira_article,sira_press_release` and reads
  **post meta only**. Digital's seeded records are `page`, `sira_service`,
  `sira_project`, and `sira_industry` *terms*, so the verifier will report PASS
  while all of them are still live. Verified by reading that file, lines 25-47.
  Found during this checkpoint and deliberately NOT repaired here.
- The backend is DEPLOYED and current: `NavMenus.php` (six menu locations) and
  `PresentationFields.php` (page intro, record locale, localized homepage
  location) are installed on the origin with timestamped rollback copies beside
  them, and were linted before and after install.

### GraphQL / schema / codegen state

- Versioned artifacts in `frontend/schema/` were captured live from all six
  tenants at `900f8cc4`. Branch-peer hash
  `f0efececd3b9fb30f773bb5c334b9f37f41a521838f7a78b334f8097691405f1`.
- Recaptured after the ADR-034 backend deployment. `MenuLocationEnum` now carries
  `PRIMARY_AR`, `FOOTER_AR` and `LEGAL_AR`; `PageIntro` and `SiraLocale` are live
  types. Branch peers exact, Group a structural superset, 165 Group-only types.
- Note for a future reader: wpgraphql-acf 2.x derives the GraphQL type name from
  `graphql_field_name`, NOT from `graphql_type_name`. `pageIntro` produces
  `PageIntro`, not the `SiraPageIntro` a declaration might suggest.
- Offline schema refresh is driven by `SIRA_SCHEMA_INTROSPECTION_DIR`, not by a
  `--offline` flag; the flag is accepted and ignored.

### Route implementation state

Committed at `c72a4f0d` and working against live CMS data: `/` (Digital homepage
variant), `/services` (anchored long page, sticky index at `lg+`), `/work`
(numbered register from `sira_project`), `/industries` (bottleneck/opportunity
pairs from `sira_industry`), `/contact` (hero + `ContactForm` +
`ImpactCalculator`), and `/[section]` (generic CMS prose route).

Measured in a real browser at 1440 against live WordPress: `work` 4722px /
5.25 screens / 0 overflow; `industries` 3022px / 3.36 screens / 0 overflow.

### Contact and calculator state

- Contact reuses the existing pipeline unchanged: browser → trusted Next.js route
  → WordPress → validation → private storage → authenticated delivery. No second
  enquiry backend was created. Tenant identity and recipient routing resolve from
  the request host in `backend/mu-plugins/sira-contact-endpoint.php`.
- The calculator is ours: `frontend/src/lib/calculator/model.ts`, a pure,
  deterministic SAR model with an explicit realisation fraction, a coverage
  ceiling, range outputs, and published assumptions. Nothing was copied or
  reverse-engineered from the reference.

### Localization / Arabic / RTL state — DONE

`2C4-B09` is RESOLVED for `digital` by ADR-034 (owner decision, 2026-09-08) and
remains UNRESOLVED for the other five tenants. Both governing documents were
amended in place with a scoped carve-out rather than left to contradict the code.

- **Locale is explicit metadata.** `sira_locale` on pages, services, projects and
  industry terms, with `sira_translation_of` pairing a translation to its
  original. The `ar-` slug prefix survives only as a fallback for records created
  before the field existed; it is not the contract.
- **Approval is per tenant.** `localeRoutesApproved` is `true` for `digital`
  alone. The proxy refuses `/ar` on the other five, and they publish no
  `hreflang`.
- **Both languages are seeded and live** on blog 6: a homepage, four standalone
  pages, three index pages, 8 services, 5 work entries, 8 industry terms and
  three menus per language.
- **Arabic type rules are language-scoped, not per class.** Tracking and casing
  are neutralised wherever the document language is Arabic, with `lang="en"`
  islands keeping their own treatment.

### Interrupted work — none of this pass's, but the tree is NOT clean

Every gate is green and this pass left nothing half-done. The previous
checkpoint's twelve typecheck errors, half-converted contact route and missing
`contact-copy.ts` are all resolved.

**Correction to the previous checkpoint.** It recorded the working tree as
clean. It was not, and still is not — two things predate this pass, were NOT
touched by it, and are NOT verified by it:

- `backend/src/Integrations/PresentationFields.php` carries an uncommitted
  +56-line change adding `homepage_location()` in place of
  `front_page_location()` on three field groups, so a localized homepage page
  can be edited as well as resolved. It looks deliberate and correct on reading,
  but it is PHP, this pass was frontend-only, and no PHP gate was run against it.
- `.github/workflows/backend-ci.yml` is untracked.

Both are somebody else's in-flight work. Decide on them before the next commit,
and do not sweep them in with `git add -A`.

### Validation actually run

All at the current branch head unless stated.

| Check | Result |
| --- | --- |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm test:run` | PASS — 613 tests, 61 files |
| `pnpm build` | PASS |
| `php -l`, complete backend | PASS — 34 files, 0 failures |
| `validate-static.php` | PASS — 169 passed, 0 failed, 34 not run |
| Live GraphQL, six tenants | PASS — branch peers exact, Group structural superset |
| Real browser, EN + AR, 390/768/1024/1280/1440/1920 | PASS — 0 horizontal overflow at every width, both directions |
| `hreflang` / canonical / robots | PASS — en, ar and x-default emitted; canonical follows the active host |
| `POST /api/contact/` with an empty body | PASS — 422 with per-field errors, no record created |

`validate-static.php`'s 34 "not run" are its in-process syntax sweep, which this
host disables by disabling every process function. `php -l` was run separately
and is recorded above. That is the documented split, not a skipped check.

### Validation added by the final fidelity pass (2026-09-08)

All at the pass's head, in Chromium against the live CMS unless stated.

| Check | Result |
| --- | --- |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS — after `rm -rf .next`; see the note below |
| `pnpm test:run` | PASS — 614 tests, 61 files |
| `pnpm build` | PASS |
| `pnpm verify:layout` | PASS — 75/75, LTR and RTL, 375-1920 |
| Header height vs its token, 6 viewports x 2 languages | PASS — 80px everywhere, token 80px |
| Anchor landing, `/services` `/work` `/industries` | PASS — 112px = header + 32px, was 192px |
| Scroll-spy, EN + AR, normal + reduced motion | PASS — exactly one entry active at every position |
| Motion audit, 5 routes | PASS — 0 elements left below opacity 1; 1 infinite animation (the marquee) |
| Reduced motion, 5 routes | PASS — 0 animations of any kind; homepage 5352 -> 3784px (-29%) |
| Horizontal overflow, 74 captures | PASS — 0 on every one |

**`pnpm typecheck` needs a clean `.next`.** `tsconfig.json` includes both
`.next/types/**` and `.next/dev/types/**`, so once `next dev` and `next build`
have both run in the same tree, tsc reports four duplicate-identifier errors from
the generated files. It is not a source error and it is not new; CI never runs
`next dev`, so CI never sees it. `rm -rf frontend/.next` before typechecking
locally. Recorded, not repaired — it is outside this pass's scope.

### Validation still pending

- `verify-no-seed-content.mjs` has not been run against the live CMS since it was
  repaired. It is expected to BLOCK — Digital's seeded content is deliberately
  still there — and that is now the correct answer rather than a false PASS.
- A real enquiry has not been submitted end to end on Digital. The route's
  validation path is verified; the delivery leg is inherited unchanged from the
  existing pipeline and was verified before this workstream.

### Deferred quality items — CLOSED by the final fidelity pass (2026-09-08)

All five are addressed. Every number below was measured in a real browser
against the live CMS, before and after; the full record with method, per-route
tables and the residual-gap analysis is
`artifacts/reference-forensics/sirahdigital-in/FIDELITY-PASS.md`.

- **`/services` density.** 12.73 screens at 1440 against the reference's 8.4 →
  **7.70**. At and above `xl` the page is now shorter than the reference at
  every width. Below `xl` it remains 13-31% longer, and that residue is content
  shape rather than layout: our service record carries six authored fields where
  the reference carries about three, and per authored block we are already
  denser than the reference. Shortening it further is an editorial decision and
  was NOT taken.
- **Header height.** It rendered 67px at `>=lg` and 77px below it while
  `--layout-header-offset` declared 80px. The header now carries
  `min-block-size: var(--layout-header-offset)` and measures **80px at every
  width in both languages**, so the token and the box cannot disagree again.
  The earlier "61px" reading came from a capture taken before the mobile menu's
  44px touch target landed; 67/77 are the measured values at the branch head.
  This is shared chrome — the other five tenants gain 13px at `>=lg`, 3px below.
- **A second, related defect found and fixed.** `html` already carries
  `scroll-padding-block-start: var(--layout-header-offset)`, and `/services`,
  `/work` and `/industries` each ALSO asked their anchor targets for
  `calc(header + 2rem)`. Scroll margin adds to scroll padding, so every anchored
  block landed 192px down the page. Now 112px: the header plus 32px.
- **Contact hero gap.** Closed by a wider form track, type that uses the measure
  it is given, and details footed to the column so they baseline with the form.
  No business fact was invented to fill it.
- **Calculator chip contrast.** Already fixed and already committed at
  `impact-calculator.tsx` — the unselected chip is `border-brand-ink-faint/60`,
  not the 10% hairline. The note above that it existed "in the uncommitted tree
  only" was wrong. No change was needed.
- **Forensic-artifact pruning.** Non-destructive. The Phase 1 measurement dumps
  are primary evidence of a third-party site on the day it was measured and
  cannot be re-derived, so they are kept and marked `linguist-generated` in a new
  root `.gitattributes`, which collapses them in the pull-request diff instead of
  deleting them. `.gitignore` now also excludes the 63MB of evidence zips, the
  17MB of Step 4 responsive-QA PNGs, and the chat transcript sitting in the
  repository root — none of which should ever reach a commit.

### Unresolved blockers

1. **Trading-name spelling** (`SIRA Digital` vs `SIRAH DIGITAL`) and the
   **Digital brand mark** — owner deliverables.
2. **Legal review** of the PDPL-aware privacy and terms drafts. They are marked
   in the content itself as drafts requiring review and claim no certification,
   audit or regulatory approval.
3. **`digital.siratrgroup.com` is claimed by both WordPress and the intended
   pre-launch frontend.** See the hostname table above. It must be resolved
   before the frontend is deployed there. Neither Digital hostname has a vhost
   of its own in the hosting panel — owner action. DNS for both already resolves
   to the origin.
4. RB-009 restore rehearsal and the ADR-032 CDN 403 remain open from before this
   workstream.

Resolved since the last checkpoint: `2C4-B09` (ADR-034), the hostname contract
(ADR-035), and the launch gate's coverage of Digital content.

### Recommended resume point for a fresh session

1. Boot per `CLAUDE.md` and `templates/ai/BOOT-PROTOCOL.md`. Rediscover HEAD.
2. Core implementation and the final visual-fidelity / motion-refinement /
   interaction-polish pass are both complete, and every gate is green. There is
   no engineering work queued behind them. What is left is owner decisions and
   the launch gates listed under "Unresolved blockers".
3. The three fidelity items deliberately NOT taken are recorded in
   `artifacts/reference-forensics/sirahdigital-in/FIDELITY-PASS.md` §7. All three
   are changes to SHARED chrome — the header pill morph, the full-screen closing
   CTA, the primary-button lift — so each is a cross-tenant art-direction
   decision for the owner, not a Digital fidelity correction. Do not take them on
   your own authority.
4. `pnpm typecheck` needs `rm -rf frontend/.next` first if a dev server has run.
   See the note above; it is a tsconfig artefact, not a source error.
5. Do not re-seed. The CMS already holds both languages; `--remove` on
   `tools/seed/digital-seed.php` is the only reversal and it deletes everything
   carrying the marker.
6. Do not merge or deploy. The Digital WordPress site must not be deleted.
7. Leave `backend/src/Integrations/PresentationFields.php` and
   `.github/workflows/backend-ci.yml` alone until their owner decides — see
   "Interrupted work" above.

### The ONE OWNER CHECKPOINT — REACHED AND ANSWERED (2026-09-08)

It was emitted at the start of the session that ran the fidelity pass, and the
owner answered **`ok`**. Per its own terms that means effort was already at MAX
and the pass proceeded immediately, without asking again.

It is a model-effort checkpoint only. It is **not** design, implementation or
architecture approval, and the fidelity pass it released is still unaccepted
work on an unmerged branch.

**It is now spent. Do not re-emit it.** It gated one transition, that transition
has happened, and a future session asking the question again would be asking the
owner to re-authorize something already authorized. It is preserved below as the
historical record of what was asked.

The question that was asked:

```
Ready for FINAL VISUAL FIDELITY / MOTION REFINEMENT.
Switch Claude effort to MAX now?
Reply: OK or NO OK.
```

Its terms were: do not begin the pass before the reply; `OK` means effort is
already MAX, so continue immediately without asking again; `NO OK` means
continue at the current setting, also without asking again.

## Phase 3 — About, services, sectors and the calculator: resumable state

Verified against the working tree and the live CMS on 2026-09-09. Do not infer
any line of this section from a previous conversation.

### Coordinates

- Branch: `feat/digital-about-and-catalogue`, cut from `feat/sirahdigital-sa`.
- Depends on `feat/sirahdigital-sa`, which depends on `feat/newsroom-ledger`.
  Keep that chain explicit; do not ship Newsroom or Phase 2 changes as part of
  this.
- **Not pushed. No pull request opened yet.**
- HEAD: rediscover from Git rather than trusting a SHA written here.
- Last safe point: the branch head. Every gate is green.

### What the owner authorized

Three answers given at the start of this workstream, and one instruction:

1. **Provenance.** `sirahdigital.in` is the owner's own company, not a third
   party. The Saudi entity gets its own team, figures and product line; layout
   and section order are matched. `REPORT.md` §9 was written on the opposite
   premise and **still needs amending on the record** — that is outstanding.
2. **Scope.** `/about`, `/services`, `/products`, and home/contact refinements.
3. **CMS extension authorized** — new ACF groups deployed to the live origin and
   content seeded onto blog 6.
4. Later: *"same final look except the header, same motion where we can, decide
   the rest yourself."* The shared header was deliberately left untouched.

Sixteen reference pages were then saved to `.local-reference/Digital/`. They are
reference-only per `AGENTS.md` — read, never a runtime dependency, never
committed.

### Commits on this branch, oldest first

| Commit | What it landed |
| --- | --- |
| `1a4af351` | The in-flight `homepage_location()` fix, committed on `feat/sirahdigital-sa` before branching |
| `90051dbb` | `sira_product` CPT, the About field group, locale coverage for products and people |
| `695aff63` | Removed a redundant profile group — `personDetails.role` already existed |
| `b5144cc6` | Schema recapture after that deployment |
| `7c112b1c` | Pinned Digital's field groups to the Digital tenant |
| `3b0d6ee5` | Service and sector field groups |
| `d802d30c` | Schema recapture after those |
| `9b24bb6c` | The About page composition |
| `72861da4` | Services rebuild and the twelve sector pages |
| `29146ab2` | The seed: ten services, twelve sectors, About, five people, both languages |
| `09050de9` | Calculator: before/after, capacity, twelve-month projection, where-to-start |

### Backend state — DEPLOYED

`PostTypes.php` and `PresentationFields.php` are installed on the origin with
timestamped `.bak-*` copies beside them. The last deployment is
`.bak-20260909T021006Z`; the file checksum on the origin matches the committed
blob exactly, so drift is a plain `sha256sum` comparison from now on.

Registered and live on blog 6 only:

- `group_sira_digital_about` on the About page in both languages (page 11 and
  page 80, resolved by path at registration time);
- `group_sira_digital_service` on `sira_service`;
- `group_sira_digital_industry` on the `sira_industry` taxonomy;
- `sira_product` — the 29th CPT, network-wide like every other, empty everywhere
  but Digital. **The `/products` route was NOT built**: no products page was
  among the sixteen saved, and building one would have meant inventing a product
  line. The type is deployed and harmless; the route is outstanding work.

`is_digital_site()` resolves the tenant through `BrandManager::infer_brand_key()`
— from the site's own host, deliberately not a blog id, so the ADR-035 move to
`sirahdigital.sa` does not silently break it.

**Reported, not repaired:** `group_sira_group_homepage` and
`group_sira_branch_homepage` are still offered to all six tenants, so every
tenant's front page shows all the variant groups it does not use. That predates
this work and scoping it changes what the other five companies see, which is
outside what was authorized here.

### CMS content state

Seeded on blog 6 in both languages, against a verified **7.84 MB / 155-table**
recovery point taken immediately beforehand
(`sira-backups/sira-multisite-db-20260909T050404Z.sql.gz`, sha256
`63a54cb1…`, mode 600 in a 700 directory outside the web root).

- 10 services per language, replacing 8 placeholders.
- 12 sectors per language, 84 workflow steps each language, 5 carrying a
  headline figure and 7 deliberately carrying none.
- The About composition and 5 team members per language.

**Nothing was deleted.** Two renamed sectors were repurposed in place so their
term ids survived (`hospitality` → `hospitality-travel`,
`retail-and-distribution` → `retail-ecommerce`, plus their `ar-` counterparts).
The seven superseded services in each language were set to **draft**, which takes
them out of the published query while leaving them inspectable and one status
change from returning. Their ids are 4–10 and 68–74.

A destructive `--remove` and reseed was attempted first and correctly refused by
the tooling. The non-destructive path above is what ran.

### Frontend state

New routes: `/about` and `/industries/[slug]`. Both are in the build's route
table. `/services` and `/industries` were rebuilt; `/contact` gained the extended
calculator.

New components under `components/digital/`: about hero, stat band, team grid,
statement, process, workflow. New CSS lives in the digital layer of
`styles/globals.css` — stat band, ghost word, process grid, social circles, back
link, sector card, workflow serpentine, projection chart.

The team grid ships **without per-person links**. The reference puts profiles at
root-level paths, which the Phase 1 audit flags as certain to collide with
content namespaces, and that template is not among the sixteen saved pages.

### Validation actually run — all at the branch head

| Check | Result |
| --- | --- |
| `pnpm lint` | PASS |
| `pnpm typecheck` | PASS |
| `pnpm build` | PASS |
| `pnpm test:run` | PASS — 618 tests, 61 files |
| `php -l`, whole backend | PASS — 34 files, 0 failures |
| `validate-static.php` | PASS — 183 passed, 0 failed, 34 not run |
| Schema, six tenants | PASS — branch peers exact, Group a superset, 165 Group-only types |
| GraphQL field resolution | PASS — About, services and sectors populated in both languages |

`pnpm typecheck` needs `rm -rf frontend/.next` **followed by a build** if the
generated route types are stale. Deleting `.next` alone leaves `next-env.d.ts`
pointing at types that no longer exist.

### NOT yet done — the real remaining work

1. **No browser QA pass.** Nothing has been rendered in a real browser against
   the live CMS. No screenshots, no density tables, no horizontal-overflow
   sweep, no RTL or reduced-motion run. Every previous increment on this project
   carried that evidence and this one does not yet. **This is the first thing
   to do.** The tooling exists: `tools/graphql-ssh-proxy.mjs` for the transport
   (ADR-032 means direct fetches from a developer machine get a bot challenge),
   and `pnpm verify:layout`.
2. `pnpm verify:layout` has not been run since the new pages landed.
3. `node tools/verify-no-seed-content.mjs` has not been re-run. It is expected to
   BLOCK — the seeded content is deliberately still there — and that is the
   correct answer, not a failure.
4. Home and contact refinements beyond the calculator were not taken.
5. `/products` — see above.
6. Nothing is pushed and no PR exists.

### Owner deliverables that block launch, not development

1. The five team members' real names, roles, one-liners and **portraits**. The
   grid renders a monogram from initials where a photograph is missing; no stock
   face is ever generated.
2. Whether the Saudi entity leads with a named founder, and their portrait.
3. The four stat-band figures for the Saudi entity.
4. Social profile URLs. The section renders without them today rather than
   linking to the `.in` profiles.
5. The KSA product line, if `/products` is wanted.
6. **Trading-name spelling** — `SIRA Digital` is implemented; the reference and
   the domain both spell it `SIRAH DIGITAL`. "Same company" is strong evidence
   for the latter. Not changed silently; needs an explicit answer and an ADR.
7. `REPORT.md` §9 amendment recording the corrected provenance.

## New owner decision — Group staging first

The replacement public Group frontend for `siratrgroup.com` must be developed, integrated, QA'd, and owner-accepted on staging before production cutover.

Until a real staging hostname is human-confirmed, use only the placeholder `GROUP_STAGING_HOST`.

The accepted deployment model is the same Git commit and same Next.js application/site identity for staging and later production, with environment-specific hostname/configuration. Do not create a separate React implementation for staging.

The existing public Group site remains live during replacement development and remains the immediate rollback target through an owner-approved stabilization period. Do not destroy or uninstall it as a launch prerequisite.

This decision changes only Group public frontend implementation/cutover strategy. It does not rebuild WordPress Multisite, create a new database, redesign the four branch tenants, or authorize a separate staging CMS copy.

## Branch sites remain unchanged

Consulting, Healthcare, Lifestyle, and Real Estate remain independent WordPress Multisite tenants using the established shared React/Next.js implementation architecture. Group staging does not merge their pages, menus, content, media, SEO state, cache state, or editorial authority.

## Do not restart

Do not restart or redesign without newer repository evidence:

- WordPress Multisite architecture;
- `sira-core` backend ownership;
- WPGraphQL primary API;
- generated frontend contracts;
- Next.js App Router multi-brand foundation;
- hostname/site registry;
- tenant isolation;
- caching/revalidation architecture;
- Step 2C.3A/2C.3B schema compatibility/adoption;
- Step 2C.3C typed frontend contracts;
- Step 2C.3D content-readiness audit;
- Step 2C.4 production design/data-contract audit;
- Step 2C.5A/2C.5B historical CMS readiness evidence.

Historical Step 2C.5A/2C.5B artifacts remain historical and must not be rewritten to pretend the new staging decision existed when they were created.

## Non-durable terminology

Do not treat the following as project phases or as approved scope.

- **"Phase 3.5"** — Not a durable project phase. It appears only in the body
  text of GitHub pull request `#48`, written by the implementing agent, and is
  marked there "blocked on owner decision". It appears nowhere in this
  repository. Individual behaviors proposed under that label require
  traceability to an approved charter requirement or an explicit owner
  decision.
- **"Step 4 Phase 1-4"** — these labels exist only in commit subjects and two
  source comments. There is no Phase 0, and the numbering does not map onto any
  approved plan. The approved sequence is the A-to-O list in
  `docs/STEP-4-EXACT-DESIGN-FIDELITY-IMPLEMENTATION.md` section 20.

A behavior proposed in a pull request description has not been approved by
being merged alongside other work.

## Durable terminology — Layer C

**"Layer C" is durable architecture terminology, not a phase label.** It is
defined by the canonical ADR-028 editorial architecture specification:

- `docs/SIRA-EDITORIAL-ARCHITECTURE-SPEC.md` — "Layer C — Progressive premium
  enhancement";
- `docs/STEP-4-DESIGN-DIRECTION-RECONCILIATION.md` — the same definition, and
  the constraint below.

It means progressive premium enhancement.

Layer C must never be required for navigation, comprehension, accessibility,
forms, or core CTA behavior.

The existence of the Layer C category does not authorize implementing a
specific effect. Every specific effect still requires an approved Task Packet
or explicit owner-authorized scope.

## Acceptance evidence

Acceptance evidence is per pull request. Do not generalize it, and do not infer
owner acceptance from a merge, from GitHub state, from previous agent text, or
from the presence of an implementation in the repository.

- **No acceptance artifact — PRs `#44`, `#46`, `#47`, `#49`, `#50`, `#51`,
  `#52`, `#53`.** Threads inspected 2026-09-02. The merge commit is the only
  acceptance-relevant artifact. The owner comments on `#47`, `#49`, `#50`, and
  `#51` are supersession and findings-response notes, not acceptance.
- **Architecture acceptance only — PR `#48`.** An owner comment accepts the
  ADR-029 architecture decision. It explicitly does not accept every PR
  `#47`/`#48` implementation detail and does not establish responsive, RTL,
  reduced-motion, accessibility, or visual-regression (L-O) completion.
- **Candidate acceptance — PRs `#55`, `#56`.** Owner-acceptance comments at the
  exact reviewed candidate heads `ebece6d6` and `92538d93`.

A `recordedReviews` count of 0 states only that no formal GitHub Review object
was submitted. It does not establish absence of owner-acceptance evidence: pull
request conversation comments are durable acceptance evidence, as `#48`, `#55`,
and `#56` show. Review-object count and acceptance evidence are separate facts
and must be evaluated separately for each pull request.

This list is exact. Pull request `#45` is an unrelated open draft and is not
part of it.

## Architecture locks

- Consulting is the canonical branch GraphQL schema.
- Group may remain a structural superset.
- Frontend/shared GraphQL uses `ProjectDetails`.
- Use native WPGraphQL menus; do not create `siraNavigation`.
- Use native content connections; do not create `siraEditorialFeed` without a new evidence-backed ADR.
- Server Components by default.
- No Bricks or `.dc.html` runtime in production.
- Missing CMS data must not be hidden with frontend hardcoding.

Known separate observation: reconciled backend source declares `SiraProjectDetails` while the accepted frontend/live GraphQL schema exposes `ProjectDetails`; the mechanism remains UNKNOWN and must not be speculatively changed.

## RB-001 / RB-009 interpretation

Historical RB-001/RB-009 controls remain truthful evidence for direct production CMS/database mutation. They do not block repository engineering, Next.js implementation, Group frontend staging development, or staging QA.

Before final Group cutover, establish appropriate recovery controls for the actual cutover, including preservation of the legacy Group environment and an appropriate final recovery point where applicable. Do not mark historical RB requirements complete unless they actually occurred.

## Live CMS state as of 2026-09-08

Read this before touching the CMS or judging a rendered page.

- **There are now six tenants, not five.** SIRA Digital is blog 6, provisioned
  2026-09-08, carrying its own seeded pre-launch content. **Do not delete or lose
  it.** The five-tenant counts below predate it and were not re-measured during
  the 2026-09-08 continuity checkpoint. See the Phase 2 section above for what is
  on blog 6 and for the launch-gate coverage defect that hides it.

- **Placeholder editorial is live in WordPress.** 37 records across the five
  tenants carry post meta `_sira_seed=1`. They are invented and were authorized
  by ADR-030 for design review. `tools/seed/README.md` lists the entries whose
  claims an editor must REWRITE rather than polish, because they fabricate
  specifics about named third parties.
- **`blog_public` is `0` on all five tenants**, which keeps that content out of
  search results. It MUST return to `1` at launch or the real site will not be
  indexed.
- `node tools/verify-no-seed-content.mjs` gates both of the above and exits
  non-zero while either is outstanding. Run it before any launch.
- **Batch A executed on 2026-09-06** against a verified RB-001 backup
  (ADR-031). Branch-local terms `consulting`, `real-estate` and `lifestyle`
  were created; `healthcare` already existed. Group's taxonomy was untouched.
- **RB-009 is still open.** The backup has never been restored, so
  recoverability is inferred, not proven.
- **The Hostinger CDN challenges the GraphQL endpoint (ADR-032).** A
  server-side fetch from an unrecognised IP gets HTTP 403 and a JavaScript
  bot-challenge, not data. This is a launch blocker for the headless
  architecture and needs hPanel action. Live captures are therefore taken over
  SSH by `tools/capture-live-feed.mjs` and replayed in
  `tests/harness/compose-live-newsroom.test.ts`.

## Protected actions

Do not without explicit owner authorization:

- merge into `main`;
- provision external staging infrastructure;
- change production DNS/routing;
- replace `siratrgroup.com`;
- deploy production;
- destroy the legacy Group site;
- perform CMS/database mutations or destructive cleanup;
- delete taxonomy terms;
- rotate production secrets;
- register or point `sirahdigital.sa`, or create a hosting-panel vhost for
  either Digital hostname. Creating the Digital WordPress site is no longer on
  this list: the owner's Phase 2 prompt authorized it and it was done on
  2026-09-08 (blog 6), and the owner separately authorized moving its CMS origin
  to `digital.siratrgroup.com`. DNS, vhosts and deployment remain protected.

## Current next gate

PR `#31` reconciliation, PR `#33` AI Engineering OS Governance Foundation, and
PR `#34` Acceptance-Gates maintenance are accepted canonical governance
history. Their completion does not grant authority for a subsequent task.
Program Control or the owner must issue a new bounded authorization for any
later implementation or protected transition.

AI Engineering OS validator/CI enforcement, AI Engineering OS product/runtime
work, WordPress mutation, external staging, deployment, DNS, and production
cutover remain NOT AUTHORIZED. Prototype and production UI implementation are
no longer in this list: they are authorized, and Step 4 visual implementation
is in progress (see Current state). Owner acceptance of ADR-029 does not change
this list: it authorizes no subsequent task, and TP-STEP4-R1, Newsroom work, and
CB-2 each still require separate bounded authorization.

The AI Engineering OS validator/CI boundary in
`docs/AI-ENGINEERING-OS.md` concerns validators for the governance contracts
themselves. It does not cover frontend build, test, or layout-verification
tooling in `frontend/scripts`, which is ordinary frontend CI.

## Handoff completion format

Return:

- role and execution profile;
- branch;
- baseline;
- commit SHA;
- files changed;
- validations actually run and their results;
- local evidence limitations when using `CLOUD_GITHUB`;
- warnings/deferred checks;
- rollback point;
- unresolved source conflicts;
- next proposed stage;
- `CURRENT PROJECT STATE`.

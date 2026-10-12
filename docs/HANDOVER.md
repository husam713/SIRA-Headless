# SIRA Headless — handover

**As of:** 2026-10-12 · `main` @ `2cb12ca9` (merge of PR #80) · this is a
snapshot; HEAD comes from Git.

This is the entry point for whoever takes the project over. It says what is
live, how to run, ship and roll it back, and what is still open. Detail lives in
the documents it links; it does not restate them.

## What is delivered

One Next.js 16 App Router app (`frontend/`) serves six SIRA brands from one
WordPress Multisite through WPGraphQL. WordPress keeps content and editorial
workflow (`backend/` — the `sira-core` plugin and mu-plugins); the frontend
owns presentation, routing, SEO and the contact pipeline.

| Brand | Public host | Served by (verified 2026-10-12) |
|---|---|---|
| Group | `siratrgroup.com` (`www` redirects) | Cloud Run `sira-frontend` |
| Consulting, Healthcare, Lifestyle, Real Estate | `<brand>.siratrgroup.com` | Cloud Run `sira-frontend` |
| Digital | `digital.siratrgroup.com` | still the WordPress host — the new Digital site is PR #81, not merged |

Each brand renders in English and Arabic (ADR-037), with the Atlas design, the
newsroom "The SIRA Record", and live CMS content. CMS origins are
`cms-<tenant>.siratrgroup.com` (ADR-036, ADR-038).

## Production, verified 2026-10-12

- Cloud Run `sira-frontend`, region `europe-west1`, revision `00009-dvr`
  (2026-09-19), image `nextjs:2cb12ca9` — **production serves exactly `main`**.
- Apex DNS has moved: `siratrgroup.com` answers from Google Frontend with 200.
- **Search indexing is OFF** (`SIRA_SEARCH_INDEXING=off`): every host serves
  `noindex`, `Disallow: /` and an empty sitemap. This is deliberate until the
  owner's final content review — see "Open items".
- Release tags (rollback points): `release/2026-09-19-production` (live,
  `2cb12ca9`) and `release/2026-09-18-production` (the first Cloud Run release,
  `ed781fdc`).

## Repository map

| Path | What |
|---|---|
| `frontend/` | the Next.js app — `src/app` routes, `src/components`, `src/lib`, `src/config` (site + endpoint registries), `src/queries` (GraphQL), `tests/` (Vitest: unit, contract, harness) |
| `frontend/src/generated/`, `frontend/schema/` | generated GraphQL contracts — regenerate, never hand-edit |
| `backend/` | `sira-core` WordPress plugin + mu-plugins (PHP 8.3, WPCS) |
| `tools/` | SSH-based read-only CMS tooling, content seeder, launch gate |
| `docs/` | `STATE.md` (current state, one page), `DECISIONS.md` (ADRs), `tasks/` (task records), history |
| `artifacts/` | evidence (screenshots, audits, forensics) — provenance, not code |

Rules for working in each area: `AGENTS.md`, and `.claude/rules/*.md` per path.

## Run it locally

Node `>=22.13 <25`, pnpm `11.17.0`.

```sh
cd frontend
cp .env.example .env.local   # fill the SIRA_WP_* endpoints and blog IDs
pnpm install --frozen-lockfile
pnpm dev                     # http://localhost:3000
pnpm check:source            # lint + typecheck + tests + build — what CI runs
```

Tenants are chosen by hostname (`src/config/`); `SIRA_EXTRA_HOSTS_JSON` maps
extra hosts such as preview domains to a tenant.

## Ship a change

1. Branch from `main`, open a PR from `.github/pull_request_template.md`.
2. CI (`.github/workflows/frontend-ci.yml`, `backend-ci.yml`) must pass; the
   `main` ruleset requires a PR and the `frontend` check, and forbids
   force-push and deletion.
3. Merge, then build and deploy: Cloud Build builds `frontend/Dockerfile`
   (context `frontend/`) into Artifact Registry `.../sira/nextjs:<sha>`, and the
   image is deployed to the Cloud Run service `sira-frontend`. Environment
   variables live on the service, never in the repository. Production deploys
   are an owner decision each time.

## Roll back

- **Frontend:** route Cloud Run traffic back to the previous revision
  (`gcloud run services update-traffic sira-frontend --region europe-west1
  --to-revisions <revision>=100`), or redeploy the image of a `release/*` tag.
- **CMS:** the pre-relocation database dump and `wp-config.php` backup are
  named in ADR-038. The legacy Bricks site still travels with blog 1 at
  `cms-group`, and the sunrise mapping keeps the apex answering from the origin.

## Open items (owner decisions)

1. **PR #81 — the new SIRA Digital site "Masar"** (ADR-039, PROPOSED). Green,
   mergeable, reviewed screenshots in the PR. Merge it to accept the direction;
   then deploy and point `digital.siratrgroup.com` at Cloud Run. After that, the
   retired ADR-033 composition (`components/digital/*`, the `.digital-*` CSS
   block, the `digitalHomepage` branch in `page.tsx`) can be deleted.
2. **Turn search indexing on** after the final content review: set
   `SIRA_SEARCH_INDEXING=on` on the Cloud Run service — no code deploy.
3. **Editorial claims to confirm** before indexing: the list in
   `docs/tasks/atlas-launch-2026-09-18.md` ("Claims an editor must confirm").
4. **Digital CMS content:** blog 6 still holds 94 placeholder records
   (`node tools/verify-no-seed-content.mjs`); blogs 1–5 are clean.
5. **Brand gates:** the SIRA/SIRAH spelling and the Digital brand mark.
6. **RB-009:** a database restore has never been rehearsed; recoverability is
   inferred, not proven.
7. `PREVIEW-AUTH-001` (authenticated draft preview) is deferred.

## Branches, tags and the archive

- `main` is the only long-lived branch. `step-*` branches and
  `step-*-approved` tags are immutable rollback history (GitHub rulesets).
- Every branch or stash whose work never reached `main` was preserved as an
  `archive/<branch>` tag on 2026-10-12 before the branches were removed.
  Revive one with `git switch -c <name> archive/<branch>`.
- `release/<date>-production` tags mark what production served.

## Access the next owner needs (never in this repository)

GitHub admin on `husam713/SIRA-Headless`; the Google Cloud project (Cloud Run,
Cloud Build, Artifact Registry); WordPress Network Admin at
`cms-group.siratrgroup.com/wp-admin/network/`; SSH to the CMS host (used by
`tools/`); DNS for `siratrgroup.com`; the WPGraphQL Application Password used
by the frontend.

# SIRA Headless Platform

Six SIRA brands served by one Next.js 16 app from one WordPress Multisite
through WPGraphQL.

**Start here:** [`docs/HANDOVER.md`](docs/HANDOVER.md) — what is live, how to
run, ship and roll back, and what is still open. Current state on one page:
[`docs/STATE.md`](docs/STATE.md). Engineering rules: [`AGENTS.md`](AGENTS.md).

## Structure

- `frontend/` — Next.js multi-brand application (Cloud Run)
- `backend/` — WordPress `sira-core` plugin and mu-plugins
- `tools/` — read-only CMS inventory, seeding and launch tooling
- `docs/` — state, decisions (ADRs), task records and history

## Production domains

- siratrgroup.com
- consulting.siratrgroup.com
- healthcare.siratrgroup.com
- lifestyle.siratrgroup.com
- realestate.siratrgroup.com
- digital.siratrgroup.com (pre-launch; `sirahdigital.sa` planned)

Do not commit credentials, access tokens, WordPress passwords, or production data.

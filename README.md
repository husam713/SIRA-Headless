# SIRA Headless Platform

Six SIRA brands served by one Next.js 16 app from one WordPress Multisite
through WPGraphQL.

**Start here**

| Document | For |
|---|---|
| [`docs/HANDOVER.md`](docs/HANDOVER.md) | engineers — architecture, run, ship, deploy, roll back, operate |
| [`docs/HANDOVER-MANAGEMENT.md`](docs/HANDOVER-MANAGEMENT.md) | management — what was delivered, status, decisions needed |
| [`docs/DIGITAL-HANDOVER.md`](docs/DIGITAL-HANDOVER.md) | SIRA Digital — launch plan and how to continue |
| [`docs/STATE.md`](docs/STATE.md) | current state on one page |
| [`AGENTS.md`](AGENTS.md) | engineering rules |

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

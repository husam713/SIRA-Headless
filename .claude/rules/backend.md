---
paths:
  - "backend/**"
---

# Backend (`backend/`) — `sira-core` WordPress network plugin + mu-plugins, PHP 8.3, WPCS

## Validate

- `php -l <file>` for every changed PHP file.
- `phpcs --standard=backend/phpcs.xml.dist <files>` (WordPress, WordPress-Docs, WordPress-Extra, PHPCompatibility 8.3+). Backend CI runs the same on PRs touching `backend/**`.
- `backend/tools/validation/*.test.mjs` run with `node --test`; the `validate-*.php` scripts need a WordPress runtime (`wp eval-file`) and are not runnable here — say `NOT RUN`, not `PASS`.

## Boundaries (ADR-002, ADR-008)

- The backend owns the content model, brand data, ACF field groups, visibility, and the signed revalidation webhook. It never owns public page layout; Bricks/shortcode rendering was removed in v1.1.0.
- `mu-plugins/` are standalone (contact endpoint, contact store, M365 mailer); they do not depend on `sira-core` loading order.
- A schema-affecting change here (new CPT, taxonomy, ACF field, GraphQL field) is incomplete until `frontend/schema` is refreshed and `pnpm check:graphql` passes on the frontend side. Say so in the PR.

## Production WordPress is out of reach from this repo

- Nothing here deploys. Releases are zipped (`backend/*.zip`, gitignored) and installed by the owner — a protected operation.
- Never run `wp db`, `wp search-replace`, `wp site delete`, `wp post delete`, `wp term delete`, or change `blog_public` against the live multisite. Read-only inspection over SSH goes through the scripts in `tools/` (`capture-live-feed.mjs`, `capture-schema-introspection.mjs`, `graphql-ssh-proxy.mjs`).
- Placeholder editorial content is governed by ADR-030 and `tools/verify-no-seed-content.mjs`; creating more of it needs an owner instruction.

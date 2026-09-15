---
paths:
  - "frontend/**"
---

# Frontend (`frontend/`) — Next.js 16 App Router, React 19, TypeScript strict, Tailwind 4, Vitest

Run every command from `frontend/`. Toolchain: pnpm 11.17, Node 22.

## Validate before you say a change works

| Scope of change | Run |
|---|---|
| any file | `pnpm lint` and `pnpm typecheck` |
| a module | `pnpm vitest run tests/unit/<area>` (and `tests/contract` if a contract test names the area) |
| before opening a PR | `pnpm check:source` (lint + typecheck + all tests + build) |
| brand tokens / `src/lib/brand` / `public/brands` | `pnpm check:brand` |
| layout primitives (`src/components/layout`) or homepage sections | CI runs `verify:layout` and `verify:fixtures` (needs a build + Chromium); run locally only if you have both |
| preview / Draft Mode (`src/app/api/preview`, `src/lib/preview`) | `pnpm test:runtime-preview` |

Report `PASS` only for a command that actually ran. `frontend/prototypes/**` is excluded from lint/tsc and is never production code.

## Rules that are not negotiable (see `docs/DECISIONS.md`)

- Server Components by default; a Client Component only where interaction requires it.
- Hostnames resolve through the allowlisted registry in `src/config/sites.ts`; GraphQL endpoints come from `src/config/wordpress.ts` (server-only). Never hard-code a tenant hostname or endpoint elsewhere.
- Missing CMS content is rendered as missing (section omitted, page still renders). Never paper over it with hard-coded copy.
- The project ACF type is `ProjectDetails`. Do not introduce `SiraProjectDetails`.
- Use native WPGraphQL menus and content connections; no `siraNavigation`, no `siraEditorialFeed`.
- Bricks and `.dc.html` runtime code never ship; `.local-reference/**` is a design reference only.
- Contract tests under `tests/contract/` encode durable-state assertions. If one fails, read it and understand why before changing either side.

## Say so in the PR ("Architecture decisions") when you touch

`src/proxy.ts`, `src/config/*`, `src/lib/graphql/*`, `src/lib/preview/*`, `src/lib/host/*`, `next.config.ts`, `src/app/(sites)/[siteKey]/layout.tsx`, or anything a `tests/contract/*` file asserts on. Proceed; do not stop — just record it.

# Step 2A — Scaffold and hostname architecture

## Objective

Create the first Next.js frontend baseline without querying WordPress.

## Affected files

All files in this package are new. No WordPress or SIRA Core file is modified.

## Key decisions

1. Canonical root domain: `siratrgroup.com`.
2. One Next.js application for all SIRA brands.
3. Next.js Proxy validates and rewrites hostnames to an internal site-key route.
4. Unknown hostnames return HTTP 421.
5. Direct public access to an internal site-key path returns HTTP 404.
6. `www.siratrgroup.com` redirects permanently to `siratrgroup.com`.
7. Proxy performs no network requests.
8. Server Components are used by default.
9. Tailwind classes reference stable CSS variables.
10. Staging/local aliases come from `SIRA_EXTRA_HOSTS_JSON`.

## Acceptance checks

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test:run`
- `pnpm build`
- five production brands resolve correctly
- www canonicalization works
- unknown hosts are rejected
- internal tenant paths are rejected
- duplicate aliases fail registry construction
- no secret or WordPress credential is present
- no Bricks markup or runtime dependency exists

## Rollback

Revert the Step 2A frontend commit or remove the undeployed frontend project.
No WordPress data or plugin code is changed.

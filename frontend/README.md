# SIRA Web

Headless Next.js frontend for the SIRA Enterprise WordPress Multisite platform.

## Current approved scope

### Step 2A

- strict multi-brand hostname registry
- canonical `siratrgroup.com` domains
- internal site-key rewrites through `src/proxy.ts`
- Server Component route foundation

### Step 2B

- server-only WordPress GraphQL endpoint registry
- typed published and preview transports
- cache tags, timeouts, safe tracing, typed errors
- live schema introspection and GraphQL Code Generator workflow

### Step 2C

- `siraBrand` server resolution with site-key mismatch protection
- five WordPress-owned identity tokens
- approved frontend-owned semantic color tokens
- Newsreader, Archivo, and Noto Kufi Arabic through `next/font`
- exact local SIRA logo and branch-mark fallback assets
- server-rendered CSS variables without a client-side theme flash
- English LTR and Arabic RTL font/direction foundation
- explicit exclusion of prototype runtime files and markup

## Canonical domains

- `siratrgroup.com`
- `www.siratrgroup.com` redirects to `siratrgroup.com`
- `consulting.siratrgroup.com`
- `healthcare.siratrgroup.com`
- `lifestyle.siratrgroup.com`
- `realestate.siratrgroup.com`

## Install

```bash
corepack enable
pnpm install
cp .env.example .env.local
```

Replace the WordPress `.invalid` placeholders before live GraphQL validation.

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test:run
pnpm build
```

Step 2C focused validation:

```bash
pnpm test:brand
pnpm check:brand
```

Live schema and generated operation validation:

```bash
pnpm schema:fetch
pnpm schema:check
pnpm codegen
pnpm check:graphql
```

## Brand ownership boundary

WordPress owns only:

- primary
- secondary
- accent
- paper
- ink

The frontend owns semantic surfaces, contrast foreground selection, typography,
spacing, shadows, borders, deep surfaces, tints, and approved local fallback
assets.

## Prototype boundary

The `.dc.html` files and associated JavaScript are visual references only.
They are not included in this repository and are not runtime dependencies.

## Rollback

Restore the Step 2B package or reverse the Step 2C patch. WordPress, database
content, DNS, and Bricks are not changed.

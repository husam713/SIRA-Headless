# Step 4 art-direction prototype

**NON-PRODUCTION VISUAL PROTOTYPE**

**ART-DIRECTION VALIDATION ONLY**

**NOT AUTHORIZED FOR PRODUCTION MERGE**

This directory is an isolated local Next App Router workspace. It is outside
the production `src/app` tree, introduces no public production route, and uses
only the repository's existing Next.js, React, TypeScript, and font tooling.

The composition tests the six authorized chapters: shell, Group hero,
editorial introduction and impact, asymmetric portfolio, Latest Updates, and
closing/footer direction. All editorial copy, metrics, dates, and architectural
illustrations are deterministic `PROTOTYPE_FIXTURE_ONLY` content. They do not
represent approved CMS records or production claims.

Run from `frontend/`:

```text
pnpm exec next dev prototypes/step-4-art-direction --hostname 127.0.0.1 --port 32162
```

The workspace intentionally does not change GraphQL contracts, production
media configuration, application routes, CMS state, or dependencies.

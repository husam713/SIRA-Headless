# Step 3C.2 — Preview Entry Signing + Draft Mode Entry / Exit

## Status

Repository/frontend implementation authorized from `main@ceea65c865d0bcaa107d11dc5a0a55f84d392f06`.

ADR-026 (`SIRA_EDITOR_PREVIEW_AUTH`) remains authoritative. This increment implements only the `PREVIEW_ENTRY` domain and connects Draft Mode to the already accepted `EDITOR_PREVIEW_API` transport.

## Security-domain separation

- `PUBLIC_CONTENT`: anonymous WPGraphQL, published-only, existing shared-cache behavior.
- `EDITOR_PREVIEW_API`: tenant-scoped WordPress Application Password / HTTP Basic, server-only, `no-store`.
- `PREVIEW_ENTRY`: dedicated HMAC-signed authorization implemented here.
- `REVALIDATION`: existing independent HMAC; never reused for Preview Entry.
- `INVESTOR_PORTAL_AUTH`: future independent user identity/session architecture; out of scope.

## Preview Entry protocol

Algorithm: HMAC-SHA256.

Dedicated server environment key: `SIRA_PREVIEW_ENTRY_SECRET`.

Canonical signing input is UTF-8 text with exactly eight newline-separated fields in this order:

1. version (`1`)
2. purpose (`sira-editor-preview`)
3. tenant `SiteKey`
4. content type
5. content identity
6. safe internal destination
7. issued-at Unix seconds
8. expiry Unix seconds

The signature is unpadded base64url HMAC-SHA256.

Step 3C.2 supports exactly one evidence-backed content contract:

- `contentType = homepage`
- `contentId = /`
- `destination = /`

This matches the checked-in `SiraHomepage` query and current App Router homepage route. Unsupported content types or identities fail closed rather than creating a generic authenticated GraphQL proxy.

Maximum signed lifetime: 300 seconds.

Allowed future issued-at skew: 30 seconds.

There is no persistent nonce/replay store in the current architecture. A valid URL can therefore be replayed during its short validity window if disclosed. Residual replay risk is bounded by the short expiry and by signing tenant, content identity, content type, destination, purpose, and version. Adding persistent single-use nonce storage requires a separate evidence-backed infrastructure decision.

## Destination policy

The shared validator accepts normalized internal pathnames only. Step 3C.2 does not accept destination query strings or fragments.

It rejects absolute/protocol-relative URLs, encoded path transformations, backslashes, control characters, dot-segments, duplicate slashes, `/api`, `/_next`, and internal tenant rewrite paths such as `/group` or `/healthcare/...`.

The preview entry content contract further narrows the current accepted destination to `/`.

## Host and tenant policy

Because `/api/*` is intentionally excluded from the proxy matcher, the Preview Entry route validates the direct request host independently using the existing effective-host and allowlisted site registry.

Accepted:
- canonical host for the signed tenant;
- explicitly allowlisted `deployment` host for the signed tenant.

Rejected:
- unknown host;
- a host belonging to another tenant;
- `redirect-alias` hosts for Preview Entry.

No staging hostname is invented. `GROUP_STAGING_HOST` remains symbolic until human-confirmed.

## Draft Mode data flow

Normal request:

`Draft Mode disabled -> getHomepage() -> published GraphQL -> anonymous -> force-cache + public tags`

Preview request:

`signed entry -> tenant/credential validation -> Draft Mode enabled -> getPreviewHomepage() -> tenant Application Password / Basic -> no-store`

Draft Mode is not enabled until signature, time, content contract, destination, host/tenant binding, and presence of the selected tenant preview credential all validate.

No client-controlled flag selects preview data.

## Exit and editor UI

`/api/preview/exit` validates a safe internal destination before disabling Draft Mode, then redirects internally.

The tenant layout renders a minimal accessible `Preview Mode` indicator and `Exit Preview` action only when Draft Mode is active.

Draft Mode metadata forces `noindex`, `nofollow`, and `nocache` while preserving the ordinary production canonical URL. Preview API routes are not emitted by the sitemap.

## WordPress -> Next Preview Link status

Repository inspection still finds no `sira-core` Preview Link signer/integration.

Backend signing/link code is intentionally **not implemented in Step 3C.2** because activation requires environment-specific secret distribution plus a confirmed frontend Preview Entry origin. No live WordPress or backend deployment is authorized here.

Future activation gate:
1. create a dedicated Preview Entry secret outside Git;
2. configure the same environment-specific secret in `sira-core` signer and Next.js verifier;
3. use distinct staging and production secret values;
4. configure the approved frontend Preview Entry origin in server-side WordPress configuration;
5. implement/activate the `sira-core` editor Preview Link signer under a separately reviewed backend increment;
6. never log, render, or expose the secret itself.

Secret rotation requires overlapping operational coordination: update both server-side ends within a controlled window, invalidate old signed URLs by removing the old secret, and keep the value out of browser code, logs, and Git.

## Live credential / content evidence

Step 3C.1 classifications remain unchanged:

- historical Application Password authentication: `HISTORICAL_HUMAN_AUTHENTICATION_EVIDENCE`
- active preview credential: `NONE`
- live unpublished Draft/Private retrieval: `NOT_YET_VERIFIED`

This repository increment uses fake/local credentials only for automated runtime verification and creates no WordPress credential.

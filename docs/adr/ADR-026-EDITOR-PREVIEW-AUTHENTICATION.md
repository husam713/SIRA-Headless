# ADR-026 — Editor Preview Authentication Domains

- **Status:** Approved by owner for Step 3C.1
- **Decision ID:** `SIRA_EDITOR_PREVIEW_AUTH`
- **Scope:** Authentication architecture for SIRA editor draft preview only.

## Decision

SIRA uses five deliberately independent authentication/security domains:

1. **PUBLIC_CONTENT** — Next.js Server -> WPGraphQL remains anonymous and may retrieve published content only through the existing public caching architecture.
2. **EDITOR_PREVIEW_API** — Next.js Server -> WPGraphQL unpublished-content preview uses a server-only WordPress Application Password with HTTP Basic Authentication. Credentials are tenant-scoped configuration and must never enter browser code, URLs, logs, tracing, or Git history.
3. **PREVIEW_ENTRY** — WordPress Editor -> Next.js Draft Mode will use a dedicated signed preview-entry authorization mechanism. Its secret is independent from WordPress Application Password credentials and from revalidation.
4. **REVALIDATION** — the existing HMAC revalidation architecture remains independent and must not be reused for preview authentication or preview-entry authorization.
5. **INVESTOR_PORTAL_AUTH** — future end-user authentication/session architecture. This ADR makes no identity-provider, JWT, token, or session decision for Investor Portal users.

## Editor preview API authentication

The selected server-to-server mechanism is WordPress Application Password + HTTP Basic Authentication:

`Authorization: Basic base64(username:application-password)`

The frontend must resolve preview credentials by trusted `SiteKey`; one hardcoded network-wide super-admin credential is not part of this architecture. HTTPS remains mandatory outside safe local development through the existing WordPress endpoint validation.

The previous Bearer-oriented preview transport was only a scaffold and was never an approved or active authentication mechanism. Step 3C.1 supersedes that scaffold with Application Password semantics.

## Preview-entry contract for Step 3C.2

Draft Mode is not enabled by this ADR. The future signed preview-entry request must bind, at minimum:

- protocol/version;
- tenant `SiteKey`;
- content identity;
- content type where required;
- safe internal destination;
- issued-at and/or expiry;
- explicit preview purpose/audience.

The future verifier must run server-side, use timing-safe signature comparison, reject expired/tampered requests, reject tenant mismatch, reject malformed content identity, and reject external redirect destinations.

A dedicated preview-entry secret is required. It must not be the WordPress Application Password, an Investor Portal credential, or the revalidation HMAC secret.

## Historical human authentication evidence

Owner-recorded evidence is classified as `HISTORICAL_HUMAN_AUTHENTICATION_EVIDENCE`: a WordPress Application Password was previously created, used for an authenticated API test that returned valid JSON, and then revoked/deleted after the test.

This demonstrates historical API authentication with an Application Password, but it does **not** prove that the tested object was Draft/Private or that unpublished-content preview currently works.

Current classifications:

- API authentication mechanism: `SELECTED / HISTORICALLY DEMONSTRATED`
- current active preview credential: `NONE`
- live unpublished-content proof: `NOT_YET_VERIFIED`

No production Application Password is created, stored, or activated by Step 3C.1.

## Investor Portal guard

Editor Preview authentication is service/machine authentication. It does not authenticate Investor Portal users and does not constrain the future Investor Portal to or away from JWT.

A future Investor Portal may independently use secure server-side sessions, an identity provider, JWT/token-based identity, or another separately approved end-user architecture. Preview credentials and Investor Portal credentials must never be reused across domains.

## Consequences

- Public WPGraphQL remains anonymous.
- Preview WPGraphQL remains server-only and `no-store`.
- Tenant preview credentials are separately configurable.
- No JWT dependency or WordPress authentication plugin is added by this decision.
- Draft Mode entry/exit remains Step 3C.2 and is not enabled here.
- Revalidation remains unchanged.
- Historical Step 2C evidence and business `executionBaseline` / `executionHead` remain unchanged.

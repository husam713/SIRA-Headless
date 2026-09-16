# Platform delivery: caching, revalidation and the edge

How a page gets from WordPress to a visitor, what is cached where, what
invalidates it, and what has to be true on each side. Written with the
implementation in `feat/platform-performance`; the architecture discovery that
produced it is the owner's plan file of 2026-09-16.

## The chain

```
WordPress publish ─► sira-core RevalidationWebhook (queue → cron → HMAC POST, 3 retries)
                          │
                          ▼
   POST https://<frontend host>/api/revalidate/   (trailing slash — the sender follows no redirects)
                          │ verify · map tags · revalidateTag(…, {expire: 0})
                          ▼
   Next.js Data Cache (.next/cache on the Cloud Run instance; SWR; tagged)
                          ▲ force-cache, revalidate = SIRA_GRAPHQL_REVALIDATE_SECONDS (TTL is the backstop)
   Page render (dynamic SSR, Server Components) ─► proxy stamps Cache-Control when SIRA_EDGE_CACHE_SMAXAGE_SECONDS is set
                          ▼
   CDN (when one exists)  ─► browser
```

## What each layer holds

| Layer | Holds | Expired by | Backstop |
|---|---|---|---|
| Data Cache (per instance) | every published GraphQL response, keyed by the exact request | the receiver, by tag | `SIRA_GRAPHQL_REVALIDATE_SECONDS` |
| React `cache()` | one request's duplicate calls | end of request | — |
| Edge (CDN) | published HTML for `s-maxage` | purge (not wired yet) / TTL | `stale-while-revalidate`, `stale-if-error` |
| Browser | static assets only | build hash | — |

The Data Cache only works when the bytes of a request are identical between
calls: Next hashes the URL, body **and every header** into the key. The
GraphQL client therefore sends no per-call header on cached requests (the
request id rides along only on `no-store` preview calls). Do not add one.

## Tags

Every published fetch carries `site:<blogId>` and `brand:<siteKey>` (tenant
isolation), plus what it reads:

| Fetch | Tags |
|---|---|
| brand | `brand-identity`, `brand`, `layout` |
| navigation | `navigation` |
| homepage | `homepage` |
| editorial feed | `archive:sira_news`, `archive:sira_insight`, `archive:sira_article`, `archive:sira_press_release` (+ `taxonomy:sira_business_unit`) |
| editorial single | the four archives + `slug:<post_type>:<slug>` |
| project archive / single | `archive:sira_project` / `post-type:sira_project` + `slug:sira_project:<slug>` |
| content page | `content-page`, `post-type:page`, `slug:page:<slug>` |
| service / work / industry indexes | `services` / `work` / `industries` |
| Digital about | `content-page`, `team` |

The WordPress sender emits the same vocabulary (`backend/src/Revalidation/
RevalidationWebhook.php`). `src/lib/revalidation/tag-map.ts` passes matching
tags through, translates the few that differ (`brand`/`layout` →
`brand-identity`, `menu:<id>` → `navigation`, `post-type:page` → the content
routes), and drops the ones nothing reads (`post:<type>:<id>`, `media:<id>`).

`SIRA_REVALIDATION_GRANULARITY=coarse` (default) also expires the whole tenant
on every event. Content changes rarely and the footer, header and related
strips read across pages; a tenant-wide refill is cheaper than a stale
dependency. `fine` expires only the named tags.

## The receiver — `POST /api/revalidate/`

Verification order (cheapest first): body ≤ 64 KB → `X-Sira-Event-Id`,
`X-Sira-Timestamp`, `X-Sira-Signature: v1=<hex>` present and well-formed →
timestamp within 300 s (+30 s skew) → HMAC-SHA256 over `"<timestamp>.<raw body>"`
with `SIRA_NEXT_REVALIDATION_SECRET`, timing-safe → JSON with `schemaVersion: 1`
→ `site.blogId` resolved through **this deployment's** `SIRA_WP_*_BLOG_ID`
values, and `site.brandKey` must agree.

| Response | Meaning | Sender behaviour |
|---|---|---|
| 200 `{accepted:true, tags:[…]}` | expired | done |
| 200 `{accepted:true, duplicate:true}` | seen this event id in the last 10 min | done |
| 401 | bad signature / stale / malformed headers | retried ×3, then logged on the WordPress side — a wrong secret is meant to be noticed |
| 403 | blog id not configured here, or brand key disagrees | retried ×3 |
| 413 / 422 | too large / malformed body | retried ×3 |
| 503 | secret not configured on this deployment | retried ×3 |

Each request writes one JSON log line (`event: "revalidation"`) with the event
id, tenant, operation, tags applied and dropped, and duration — never the
secret, the signature or a WordPress message.

Dedupe is per process and deliberately so: expiring a tag twice is harmless,
and a duplicate landing on another Cloud Run instance expires that instance's
cache too, which is the wanted outcome.

## Status codes and the edge — measured, not assumed

Drilled with one tenant's origin pointed at an unreachable host:

| Route | Result |
|---|---|
| homepage | 200, sections degraded (by design) |
| `/services/` (content page) | **500** via `ContentUnavailableError` — was 404 before |
| article | 500 |
| missing slug | 404 |

Two consequences shaped the implementation:

1. **The segment-level `loading.tsx` was removed.** With it, the shell
   streamed first and every later failure arrived as HTTP 200 with the error
   boundary inside — a soft error a crawler indexes and a CDN keeps. Without
   it, the route renders before the status line is written and the codes above
   hold. Client-side navigations still prefetch; the old page stays visible
   until the new one is ready.
2. **The proxy's `Cache-Control` is written before the status is known and
   Next does not remove it on error renders** (verified: a 500 and a 404 both
   carried the public policy). The edge configuration therefore has to be the
   guard: never cache 5xx (the default on Cloud CDN and Cloudflare) and give
   404 a short negative-caching TTL (Cloud CDN: cache policy `negative caching`;
   Cloudflare: cache rule on status 404). Do not enable
   `SIRA_EDGE_CACHE_SMAXAGE_SECONDS` in front of an edge that has not been
   configured this way.

## Multiple instances

`revalidateTag` reaches the process that received the event. Other instances
keep their copies until the TTL. Until a shared cache or a CDN purge exists,
run Cloud Run with `--min-instances=1 --max-instances=1 --no-cpu-throttling
--cpu-boost` and set `SIRA_GRAPHQL_REVALIDATE_SECONDS=86400`; with more
instances, lower the TTL to 60–300.

## Failure behaviour

- A warm instance keeps serving during a WordPress outage: expired entries are
  served stale and refreshed in the background; a failed refresh keeps the
  stale copy.
- A transport failure on a content page throws `ContentUnavailableError` to
  the route's error boundary — never a 404, which a cache or a crawler would
  keep.
- Published GraphQL calls retry once on a network error or timeout, with a
  150–300 ms jittered pause; HTTP and GraphQL errors are not retried.
- The homepage degrades per section (HTTP 200); brand falls back to the local
  preset; a failed navigation query omits the menu.

## Observability

`SIRA_GRAPHQL_TRACE=on` (default in production) writes one JSON line per
GraphQL call: `{"event":"graphql", operationName, siteKey, endpointHostname,
durationMs, outcome, httpStatus, requestId}`. A Data Cache hit reports
single-digit `durationMs`; a network call reports hundreds. Cloud Logging:

```
jsonPayload.event="graphql"
```

## What has to be done outside this repository

| System | Location | Action | Expected value |
|---|---|---|---|
| WordPress | `wp-config.php` | define `SIRA_NEXT_REVALIDATION_URL` | `https://<frontend host>/api/revalidate/` |
| WordPress | `wp-config.php` | define `SIRA_NEXT_REVALIDATION_SECRET` | 32–512 chars; the same value as the Cloud Run env var; not the preview-entry secret |
| WordPress | `wp-config.php` | define `SIRA_NEXT_SITE_HOSTS` | JSON of blog id → public hostname |
| Hostinger | hPanel → Cron | run `wp cron event run --due-now` (or `wp-cron.php`) every minute, `DISABLE_WP_CRON` true | queued events delivered within a minute |
| Cloud Run | service env | `SIRA_NEXT_REVALIDATION_SECRET`, `SIRA_GRAPHQL_TRACE=on`, `SIRA_GRAPHQL_REVALIDATE_SECONDS=86400` | — |
| Cloud Run | service flags | `--min-instances=1 --max-instances=1 --no-cpu-throttling --cpu-boost` | until a shared cache or CDN purge exists |
| Hostinger CDN | — | verify one server-side POST from the Cloud Run region to each `cms-*` `/graphql` and the Group endpoint is not challenged (ADR-032) | HTTP 200 with data |

Validation after the human steps: publish a test post → `revalidation` log
line with `outcome: "accepted"` → the public page is fresh on the next request.

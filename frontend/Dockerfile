# syntax=docker/dockerfile:1.7
#
# SIRA frontend — container image for Cloud Run.
#
# Build context is this directory (frontend/), not the repo root:
#   docker build -t sira-web frontend/
#
# The app is a self-contained pnpm package: there is no workspace root, so the
# context deliberately excludes everything above frontend/.

ARG NODE_VERSION=22.13.0

# ---------------------------------------------------------------------------
# base — pinned Node, pnpm via corepack (version comes from packageManager)
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS base
ENV PNPM_HOME=/pnpm \
    PATH=/pnpm:$PATH \
    NEXT_TELEMETRY_DISABLED=1
# pnpm is installed directly rather than through corepack. The corepack bundled
# with Node 22.13.0 verifies npm registry signatures against keys that have
# since rotated, and dies with "Cannot find matching keyid" while resolving
# pnpm's latest version — before it ever reads the packageManager field.
# This version MUST be kept in sync with "packageManager" in package.json.
RUN npm install --global pnpm@11.17.0 && pnpm --version
WORKDIR /app

# ---------------------------------------------------------------------------
# deps — install once, cached on the lockfile
# ---------------------------------------------------------------------------
FROM base AS deps
# pnpm-workspace.yaml carries onlyBuiltDependencies and MUST be copied here:
# without it pnpm refuses the install with ERR_PNPM_IGNORED_BUILDS.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# No BuildKit cache mount here on purpose. Cloud Build's legacy builder has no
# BuildKit, and `--mount=type=cache` fails outright there with
# "the --mount option requires BuildKit". A cache mount would only speed up
# repeat local builds anyway — Cloud Build starts from a cold store each time.
RUN pnpm install --frozen-lockfile

# ---------------------------------------------------------------------------
# build — next build, producing .next/standalone
# ---------------------------------------------------------------------------
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Per-tenant CMS coordinates. Not secrets — hostnames and numeric blog ids.
#
# The build does NOT contact the CMS. Every route under (sites)/[siteKey] calls
# headers() and draftMode() in its shared layout, so the whole segment is
# server-rendered on demand: `next build` reports every route as ƒ (Dynamic)
# and resolves no GraphQL. Verified by building with all six endpoints pointed
# at an unreachable host — the build succeeded unchanged.
#
# These args are therefore a safety margin, not a requirement: they give any
# build-time config validation real values, and they cost nothing. ADR-032's
# CDN-challenge risk applies to the RUNTIME egress (Cloud Run), not to the
# builder. Runtime values come from Cloud Run's environment, not from here.
ARG SIRA_WP_GROUP_GRAPHQL_URL
ARG SIRA_WP_CONSULTING_GRAPHQL_URL
ARG SIRA_WP_HEALTHCARE_GRAPHQL_URL
ARG SIRA_WP_REALESTATE_GRAPHQL_URL
ARG SIRA_WP_LIFESTYLE_GRAPHQL_URL
ARG SIRA_WP_DIGITAL_GRAPHQL_URL
ARG SIRA_WP_GROUP_BLOG_ID
ARG SIRA_WP_CONSULTING_BLOG_ID
ARG SIRA_WP_HEALTHCARE_BLOG_ID
ARG SIRA_WP_REALESTATE_BLOG_ID
ARG SIRA_WP_LIFESTYLE_BLOG_ID
ARG SIRA_WP_DIGITAL_BLOG_ID
ARG SIRA_GRAPHQL_REVALIDATE_SECONDS
ARG SIRA_GRAPHQL_TIMEOUT_MS
ARG SIRA_EXTRA_HOSTS_JSON

ENV SIRA_WP_GROUP_GRAPHQL_URL=${SIRA_WP_GROUP_GRAPHQL_URL} \
    SIRA_WP_CONSULTING_GRAPHQL_URL=${SIRA_WP_CONSULTING_GRAPHQL_URL} \
    SIRA_WP_HEALTHCARE_GRAPHQL_URL=${SIRA_WP_HEALTHCARE_GRAPHQL_URL} \
    SIRA_WP_REALESTATE_GRAPHQL_URL=${SIRA_WP_REALESTATE_GRAPHQL_URL} \
    SIRA_WP_LIFESTYLE_GRAPHQL_URL=${SIRA_WP_LIFESTYLE_GRAPHQL_URL} \
    SIRA_WP_DIGITAL_GRAPHQL_URL=${SIRA_WP_DIGITAL_GRAPHQL_URL} \
    SIRA_WP_GROUP_BLOG_ID=${SIRA_WP_GROUP_BLOG_ID} \
    SIRA_WP_CONSULTING_BLOG_ID=${SIRA_WP_CONSULTING_BLOG_ID} \
    SIRA_WP_HEALTHCARE_BLOG_ID=${SIRA_WP_HEALTHCARE_BLOG_ID} \
    SIRA_WP_REALESTATE_BLOG_ID=${SIRA_WP_REALESTATE_BLOG_ID} \
    SIRA_WP_LIFESTYLE_BLOG_ID=${SIRA_WP_LIFESTYLE_BLOG_ID} \
    SIRA_WP_DIGITAL_BLOG_ID=${SIRA_WP_DIGITAL_BLOG_ID} \
    SIRA_GRAPHQL_REVALIDATE_SECONDS=${SIRA_GRAPHQL_REVALIDATE_SECONDS} \
    SIRA_GRAPHQL_TIMEOUT_MS=${SIRA_GRAPHQL_TIMEOUT_MS} \
    SIRA_EXTRA_HOSTS_JSON=${SIRA_EXTRA_HOSTS_JSON} \
    NODE_ENV=production

RUN pnpm build

# Fail loudly here rather than at container start: `output: "standalone"` in
# next.config.ts is what produces this directory, and without it the runtime
# stage below would copy nothing and the image would start into a crash loop.
RUN test -f .next/standalone/server.js \
    || (echo "ERROR: .next/standalone/server.js missing — is output:'standalone' set in next.config.ts?" && exit 1)

# ---------------------------------------------------------------------------
# runtime — only the standalone server, its static assets and public/
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm-slim AS runtime
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=8080 \
    HOSTNAME=0.0.0.0
WORKDIR /app

# Runtime CMS coordinates are supplied by Cloud Run (`--set-env-vars`), not
# baked in. The values above are only needed to get through `next build`;
# anything rendered per-request reads them from the environment at run time.

COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

# Incremental cache is written under .next/cache at run time. It must be
# writable by the unprivileged user or revalidation fails silently on every
# request. Ephemeral per instance on Cloud Run, which is expected.
RUN mkdir -p .next/cache && chown -R node:node .next

USER node
EXPOSE 8080

# server.js honours PORT and HOSTNAME, which is exactly Cloud Run's contract.
CMD ["node", "server.js"]

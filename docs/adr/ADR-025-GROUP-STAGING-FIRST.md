# ADR-025 — Group Staging-First Frontend Launch Strategy

- **Status:** Approved owner decision
- **Date:** 2026-08-18
- **Scope:** Current public Group website only (`siratrgroup.com`)

## Decision

The replacement Group public frontend must be developed, integrated, validated, and owner-accepted on staging before production cutover.

Until a real staging hostname is human-confirmed, repository documentation and configuration planning must use only:

`GROUP_STAGING_HOST`

The accepted model is:

same accepted Git commit
→ same Next.js application
→ same Group site identity
→ environment-specific hostname/configuration
→ staging acceptance
→ separately authorized production cutover to `siratrgroup.com`

A separate React implementation for staging is prohibited.

## Legacy Group site

The current public Group site remains live while the replacement is built. It must remain available as the immediate rollback target through an owner-approved stabilization period after cutover.

Do not destroy, uninstall, or convert the legacy Group environment as a prerequisite for launch. A later archive/staging conversion may be considered only after stabilization and separate approval.

## CMS scope

This decision is not authorization to:

- create a new WordPress Multisite network;
- create a new database for all five tenants;
- rebuild branch sites;
- restart content modeling or GraphQL architecture;
- assume a separate staging CMS copy.

The existing SIRA CMS architecture remains authoritative. If a separate staging CMS later becomes technically necessary, it requires evidence and a separate owner decision.

## Branch sites

Consulting, Healthcare, Lifestyle, and Real Estate remain under the established independent-tenant architecture. They may share React/Next.js implementation architecture but do not share tenant-local content, menus, media, SEO state, cache state, or editorial authority.

## Production safety

This ADR does not authorize:

- DNS changes;
- production routing changes;
- production deployment;
- replacement of `siratrgroup.com`;
- external staging provisioning;
- CMS/database mutation;
- taxonomy deletion;
- destruction of the legacy Group site.

Each remains separately gated.

## RB-001 / RB-009

Historical RB-001/RB-009 evidence remains historical and truthful. Those controls were introduced for direct production CMS/database mutation and do not block repository engineering, Next.js implementation, Group staging development, or staging QA.

Final Group cutover must define recovery controls appropriate to the actual cutover, including preservation of the legacy Group site and a final recovery point where applicable. Historical RB controls must not be marked complete unless they actually occurred.

## Roadmap interpretation

Step 2C.5B remains the accepted CMS mutation-readiness milestone and its mutation track remains blocked by backup evidence.

The repository/frontend track may proceed independently without production WordPress mutation. The next existing-roadmap engineering stage is Step 3 — Preview / SEO / Discovery. Step 4 production component implementation follows its normal gate and targets Group staging first.

## Rationale

This preserves continuity and production safety while allowing frontend progress. It prevents development directly against the currently public legacy Group frontend, avoids duplicating staging/production React implementations, preserves rollback, and does not misuse a frontend staging decision as justification to rebuild the CMS or branch architecture.

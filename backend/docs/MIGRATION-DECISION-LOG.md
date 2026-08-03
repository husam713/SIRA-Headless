# SIRA Migration Decision Log — Backend Step 1

| ID | Decision | Status | Reason |
|---|---|---|---|
| D-001 | Keep WordPress Multisite as the editorial CMS | Approved | Preserves site separation, users, editorial workflows and content ownership |
| D-002 | Keep `sira-core` as the network business/content plugin | Approved | Centralizes content types, taxonomies, fields, brand logic and integrations |
| D-003 | Use WPGraphQL as the primary frontend API | Approved | Provides a typed, reusable contract for one Next.js application |
| D-004 | Use WPGraphQL for ACF for supported content fields | Approved | Avoids duplicate custom resolvers for relationships, repeaters and media |
| D-005 | Use a custom `siraBrand` resolver | Approved | Brand output requires multisite precedence and a curated public allowlist |
| D-006 | Retain legacy `_sira_*` meta without public exposure | Approved | Avoids destructive migration while ACF-key collisions are inventoried |
| D-007 | Make investor records non-public | Approved | Reduces exposure of likely sensitive relationship data |
| D-008 | Remove Bricks services and layout shortcodes from active plugin code | Approved | Presentation moves to Next.js |
| D-009 | Keep `[sira_contact_form]` temporarily | Approved with deprecation | Prevents production breakage until headless forms are operational |
| D-010 | Disable WordPress Organization JSON-LD by default | Approved | Prevents duplicate schema and backend-host canonical output |
| D-011 | Retain brand REST route temporarily | Approved with deprecation | Supports unknown legacy consumers during migration |
| D-012 | Use HMAC-signed queued revalidation events | Approved | Protects the Next.js invalidation endpoint and avoids editor blocking |
| D-013 | Keep Bricks themes deployable during rollback window | Approved | Enables frontend rollback without database rollback |
| D-014 | Do not expose direct document files yet | Approved | File access policy is unresolved |
| D-015 | Require staging runtime acceptance before Step 2 | Approved | Static source checks cannot prove WordPress, Multisite or GraphQL runtime behavior |

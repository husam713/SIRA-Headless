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

| D-016 | Store homepage composition on the configured front-page Page | Approved | Preserves revisions, preview, SEO and per-site editorial ownership |
| D-017 | Use fixed Group and Branch ACF groups instead of Flexible Content | Approved | Preserves the approved design and avoids a generic page-builder contract |
| D-018 | Use one shared Branch homepage contract for four branch sites | Approved | Prevents duplicated fields, queries and React implementations |
| D-019 | Attach Business Unit taxonomy to Company | Approved | Reuses the canonical branch classification instead of adding a duplicate branch field |
| D-020 | Add Company, Investment, Testimonial and Partner presentation groups | Approved | Supplies demonstrated fields required by the approved designs |
| D-021 | Keep nested WPGraphQL-for-ACF type names provisional until live inventory | Approved | Prevents fabricated schema and premature Code Generator output |
| D-022 | Defer object-level Investment and Testimonial visibility to Step 2C.2C | Approved with deployment block | Field registration is source-verifiable, but safe anonymous object visibility requires runtime validation |
| D-023 | Defer navigation and editorial-feed decisions until live schema inventory | Approved | Avoids unnecessary custom GraphQL services |


## Step 2C.2C — Model-layer presentation privacy

**Decision:** Gate public Investment and Testimonial nodes with
`graphql_data_is_private`.

**Reason:** WPGraphQL objects can enter the graph through singular fields,
connections, search, global nodes, and relationships. The model layer is the
central authorization boundary for model-backed objects.

**Public approval:** Only the exact ACF enabled value is accepted.

**Editorial access:** A request user must pass the object-specific
`edit_post` capability to view an unapproved record.

**Rejected alternatives:**

- resolver-by-resolver checks;
- response post-processing;
- hiding only the ACF approval field;
- treating any authenticated account as an editor;
- globally changing either post type to `publicly_queryable=false`.


## Step 2C.2F — Curated typed banners

**Decision:** Add `SiraBrand.announcement` and `SiraBrand.emergency` as custom,
curated GraphQL objects while retaining the two legacy string fields.

**Reason:** Raw ACF options would bypass multisite precedence, sanitization and
schedule rules. A custom stable object provides a public contract independent
of generated WPGraphQL-for-ACF nested type names.

**Scheduling:** WordPress site times are normalized to UTC; invalid or inactive
typed banners return null.

**Backward compatibility:** Legacy strings create typed fallback payloads only
when the corresponding typed message is empty.

**Dismissal:** The public revision hash supports frontend dismissal without
storing visitor state in WordPress.

**Deferred:** live schema validation, cache-boundary timing, navigation,
editorial feed and frontend code generation.

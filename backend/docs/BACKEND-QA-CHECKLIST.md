# SIRA Backend Step 1 QA Checklist

## Static

- [ ] All PHP files pass `php -l`.
- [ ] Exactly 28 post types and 10 taxonomies are defined.
- [ ] GraphQL names are valid and unique.
- [ ] Plugin header and version constant match.
- [ ] No hardcoded secrets are present.
- [ ] No active Bricks class, function, hook or layout shortcode remains.
- [ ] Only `[sira_contact_form]` remains, marked as temporary.

## WordPress and Multisite

- [ ] Plugin activates normally.
- [ ] Plugin network-activates across all sites.
- [ ] New sites initialize brand settings.
- [ ] CPT and taxonomy rewrite slugs are unchanged.
- [ ] Investor archive is disabled.
- [ ] Brand settings appear under SIRA Content.
- [ ] Starter importer creates structured records only.
- [ ] WordPress Organization schema is absent by default.

## GraphQL

- [ ] WPGraphQL schema builds without errors.
- [ ] All 28 content types appear.
- [ ] All 10 taxonomies and expected connections appear.
- [ ] Project, person and document ACF groups appear.
- [ ] Person email is absent.
- [ ] Direct document file is absent.
- [ ] `siraBrand` succeeds on every site.
- [ ] No analytics ID or raw options are exposed.
- [ ] Published public records are anonymous-readable.
- [ ] Draft, private and investor records are anonymous-inaccessible.
- [ ] Authorized editors can preview permitted unpublished records.

## Revalidation

- [ ] New-to-publish creates a publish event.
- [ ] Update, unpublish, trash, restore and delete create correct operations.
- [ ] Autosaves and revisions are skipped.
- [ ] Taxonomy, menu, brand, ACF option and media events are generated.
- [ ] Event body contains no content or secret.
- [ ] HMAC signature verifies.
- [ ] 2xx removes the queue item.
- [ ] 5xx retains and retries the queue item.
- [ ] Logs contain no secret or request body.
- [ ] Real server cron runs reliably.

## Security

- [ ] WordPress admin uses least privilege and MFA.
- [ ] GraphQL endpoint rate limiting is configured.
- [ ] Preview authentication is not yet exposed publicly.
- [ ] Backend frontend is noindex or otherwise isolated.
- [ ] Sensitive forms do not write to public CPTs.
- [ ] File access policy is approved before gated files are published.

## Acceptance

Step 1 is accepted only when every required check above passes on staging and
the results are recorded in the release decision log.

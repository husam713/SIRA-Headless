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

## Step 2C.2B presentation contract

- [ ] `Page.siraHomepage` exists.
- [ ] `SiraHomepage` exposes `variant`, `groupHomepage`, and `branchHomepage`.
- [ ] Nested ACF-generated type names are recorded from live introspection
      before frontend code generation.
- [ ] Group front page uses the Group variant.
- [ ] Four branch front pages use the Branch variant.
- [ ] Business Unit taxonomy connects to Company.
- [ ] `SiraCompany.companyDetails` exists.
- [ ] `SiraInvestment.investmentDetails` exists.
- [ ] `SiraTestimonial.testimonialDetails` exists.
- [ ] Testimonial consent timestamp is absent from GraphQL.
- [ ] `SiraPartner.partnerDetails` exists.
- [ ] Homepage relationships preserve editor order.
- [ ] All five Multisite schemas remain compatible.
- [ ] Step 2C.2C visibility safeguards pass before public deployment.



## Step 2C.2C presentation privacy

- [ ] Approved published Investment is visible anonymously.
- [ ] Unapproved published Investment is null through its singular root field.
- [ ] Unapproved Investment is null through `contentNode`.
- [ ] Unapproved Investment is null through Relay `node`.
- [ ] Unapproved Investment is absent from collections and search.
- [ ] Unapproved Investment is absent from homepage relationships.
- [ ] Consent-approved published Testimonial is visible anonymously.
- [ ] Unapproved Testimonial is absent through every equivalent path.
- [ ] Subscriber cannot access either unapproved object.
- [ ] Author who can edit the fixture retains access.
- [ ] Administrator retains access.
- [ ] Approval does not expose drafts or private posts.
- [ ] Runtime fixtures are removed after validation.


## Step 2C.2F typed banners

- [ ] Raw typed banner ACF options are absent from GraphQL.
- [ ] Legacy banner strings remain queryable.
- [ ] Active typed announcement is returned.
- [ ] Active typed emergency is returned.
- [ ] Future banner returns null.
- [ ] Ended banner returns null.
- [ ] Invalid schedule returns null.
- [ ] Start is inclusive and end is exclusive.
- [ ] WordPress timezone is normalized to UTC.
- [ ] Announcement default severity is INFO.
- [ ] Emergency default severity is URGENT.
- [ ] Unsafe links are omitted.
- [ ] Dismissible is false unless explicitly enabled.
- [ ] Revision key changes when public content changes.
- [ ] Investment/Testimonial privacy regression tests still pass.

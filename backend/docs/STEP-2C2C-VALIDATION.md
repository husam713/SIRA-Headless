# Step 2C.2C validation report

## Completed locally

- PHP syntax checks for every plugin PHP file.
- Existing Step 1/Step 2C.2B static acceptance checks.
- Focused plain-PHP Investment and Testimonial privacy tests.
- Plugin registration check.
- Approval meta-key allowlist check.
- Strict approval-value tests.
- Anonymous denial tests.
- editor capability tests.
- authenticated non-editor denial tests.
- unrelated post-type regression test.
- patch dry-run and application comparison.
- ZIP integrity and manifest checks.

## Deferred

- WordPress activation.
- Multisite network activation.
- installed WPGraphQL filter execution.
- anonymous GraphQL single-node queries.
- generic `contentNode` and Relay `node` queries.
- root collections.
- cross-type search.
- homepage ACF relationships.
- Administrator, Author, and Subscriber runtime behavior.
- five-site schema comparison.
- schema fetch and GraphQL Code Generator.
- production acceptance.

## Runtime command

Run only on isolated staging:

```bash
SIRA_VALIDATION_ALLOW_MUTATIONS=1 \
wp eval-file \
wp-content/plugins/sira-core/tools/validation/validate-presentation-privacy.php
```

The script refuses production unless
`SIRA_VALIDATION_ALLOW_PRODUCTION=1` is also explicitly set.

## Acceptance expectation

Anonymous:

- approved Investment visible;
- unapproved Investment absent from every tested path;
- consent-approved Testimonial visible;
- unapproved Testimonial absent from every tested path.

Authenticated Subscriber:

- unapproved records remain absent.

Authenticated Author who can edit the fixtures:

- unapproved records are visible.

Authenticated Administrator:

- unapproved records are visible.

All fixtures must be deleted after the test.

# Step 2C.2F static validation report

## Completed locally

- PHP syntax for all plugin PHP files.
- Existing cumulative static audit.
- Existing Step 2C.2C Investment/Testimonial privacy tests.
- Typed banner ACF definition checks.
- Typed GraphQL schema source checks.
- active schedule test.
- before-start and end-boundary tests.
- invalid date and invalid range tests.
- WordPress timezone to UTC conversion test.
- legacy fallback tests.
- strict severity tests.
- safe and unsafe link tests.
- dismissible behavior.
- revision-key stability/change behavior.
- patch dry-run and exact application comparison.
- cumulative ZIP integrity.
- changed-files and full manifests.

## Deferred

- plugin activation;
- Multisite network activation;
- ACF options-page rendering;
- saving banner fields through ACF;
- live WPGraphQL type registration;
- five-site schema comparison;
- live legacy fallback queries;
- live schedule-boundary behavior;
- frontend cache timing at start/end boundaries;
- schema fetch;
- schema check;
- GraphQL Code Generator;
- frontend adoption;
- production acceptance.

## Installed checks to run later

```bash
wp eval-file \
  wp-content/plugins/sira-core/tools/validation/validate-runtime.php
```

Run the `SiraTypedBanners` operation from:

```text
tools/validation/graphql-validation.graphql
```

against all five sites with:

1. no banner;
2. legacy text only;
3. active typed banner;
4. future typed banner;
5. expired typed banner;
6. malformed schedule;
7. internal link;
8. external link;
9. dismissible enabled.

Then run the previously deferred schema and codegen workflow.

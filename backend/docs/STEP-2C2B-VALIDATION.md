# Step 2C.2B validation report

## Scope

Source-verified validation of the PHP-registered homepage and entity
presentation contract.

Live WordPress, WPGraphQL, WPGraphQL-for-ACF schema generation, data values,
schema hashes, menu behavior, newsroom behavior, privacy behavior, and GraphQL
Code Generator output remain deferred.

## Completed checks

- 22 PHP files passed `php -l`.
- `tools/validation/validate-static.php` passed:
  - 156 checks passed;
  - 0 checks failed.
- `tools/validation/static-audit.sh` passed.
- Exactly five new top-level presentation field groups are defined.
- Exactly 170 nested ACF field definitions are source-controlled.
- Every ACF group and field key is non-empty and unique.
- No nested `graphql_type_name` is hardcoded.
- The five approved top-level GraphQL field-group type names are unique.
- `SiraHomepage` contains:
  - `variant`;
  - `groupHomepage`;
  - `branchHomepage`.
- Business Unit taxonomy includes Company.
- No Flexible Content field is introduced.
- No Bricks or `.dc.html` runtime term is introduced.
- No stale `siragroup.com` reference remains.
- No hardcoded secret pattern was detected.
- Testimonial consent timestamp is configured with
  `show_in_graphql => false`.
- Investment public-display and Testimonial consent flags default to false.
- Plugin header and version constant are synchronized at `1.3.0`.

## Deferred checks

- plugin activation and network activation;
- ACF admin rendering on the configured front page;
- exact nested WPGraphQL-for-ACF type names;
- GraphQL schema equality across all five sites;
- actual front-page variant and field values;
- relationship ordering and media resolution;
- Business Unit term slugs and Company connections;
- object-level Investment privacy;
- object-level Testimonial consent privacy;
- anonymous and authenticated query behavior;
- preview behavior;
- revalidation tags;
- frontend GraphQL Code Generator output;
- PHPCS/WPCS;
- production deployment.

## Deployment block

This intermediate package must not be publicly deployed without Step 2C.2C.
The new Investment and Testimonial flags are fields, not complete object-level
privacy controls.

## Validation commands after installation

```bash
bash wp-content/plugins/sira-core/tools/validation/static-audit.sh

wp eval-file \
  wp-content/plugins/sira-core/tools/validation/validate-runtime.php
```

Then run the presentation operations in:

```text
tools/validation/graphql-validation.graphql
```

against every Multisite GraphQL endpoint.

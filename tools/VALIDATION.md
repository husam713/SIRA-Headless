# Step 2C.2A validation

## Static package checks

```bash
node --check scripts/graphql-inventory.mjs
php -l scripts/wp-inventory.php
bash -n scripts/run-staging-inventory.sh
```

## Runtime safety checks

1. Run first on staging.
2. Confirm no database write queries appear in a query monitor or database log.
3. Confirm the authorization header is absent from all output files.
4. Confirm no post content, form submission, user email, or secret option value
   appears in the output.
5. Compare `network-comparison.json` with the WP-CLI site inventory.
6. Review hostnames and menu names before sharing output outside the project.

## Acceptance rules

- all five endpoints inventoried;
- all five WordPress sites inventoried;
- schema hashes compared;
- brand keys compared;
- front pages identified;
- active theme/menu locations identified;
- ACF group mappings identified;
- Business Unit terms identified;
- native menu viability decided;
- native editorial-feed viability decided;
- privacy-field coverage recorded;
- no mutation or data update performed.

# SIRA Core Step 1 Upgrade and Rollback

## Upgrade scope

The cumulative package includes Steps 1A through 1G:

- GraphQL registration for 28 post types and 10 taxonomies;
- typed ACF content groups;
- curated multisite-aware `siraBrand`;
- removal of active Bricks integrations and layout shortcodes;
- temporary legacy contact-form compatibility;
- signed queued Next.js revalidation;
- validation scripts and backend documentation.

## Pre-deployment

1. Back up the database and `wp-content/plugins/sira-core`.
2. Retain the Bricks parent theme, SIRA Bricks child theme and last deployable
   Bricks frontend release.
3. Inventory pages containing:
   - `[sira_home]`
   - `[sira_branch_home]`
   - `[sira_newsroom]`
   - `[sira_contact_form]`
4. Record installed versions and network status of WordPress, ACF Pro,
   WPGraphQL and WPGraphQL for ACF.
5. Deploy only to staging first.

## Install

```bash
wp plugin deactivate sira-core --network

mv wp-content/plugins/sira-core    wp-content/plugins/sira-core.pre-headless

unzip sira-core-step1-complete.zip -d wp-content/plugins

wp plugin activate sira-core --network
```

Flush rewrite rules because Step 1A removes the investor archive:

```bash
wp site list --field=url | while read -r site_url; do
  wp --url="$site_url" rewrite flush --hard
done
```

## Validation sequence

```bash
php wp-content/plugins/sira-core/tools/validation/validate-static.php

wp eval-file   wp-content/plugins/sira-core/tools/validation/validate-runtime.php

SIRA_VALIDATION_ALLOW_MUTATIONS=1 wp eval-file   wp-content/plugins/sira-core/tools/validation/validate-security.php

SIRA_VALIDATION_ALLOW_MUTATIONS=1 wp eval-file   wp-content/plugins/sira-core/tools/validation/validate-revalidation.php
```

Run PHPCS in the project development environment:

```bash
vendor/bin/phpcs   --standard=WordPress   wp-content/plugins/sira-core
```

## Rollback

Do not roll back the database after editors have created new content unless a
separate content-reconciliation plan has been approved.

Code rollback:

```bash
wp plugin deactivate sira-core --network

rm -rf wp-content/plugins/sira-core

mv wp-content/plugins/sira-core.pre-headless    wp-content/plugins/sira-core

wp plugin activate sira-core --network
```

Flush rewrite rules on every site after restoring the previous plugin.

Remove Step 1F queue data only when the old plugin cannot consume it:

```bash
wp site list --field=url | while read -r site_url; do
  wp --url="$site_url" option delete sira_revalidation_queue_v1
  wp --url="$site_url" option delete sira_revalidation_queue_lock_v1
  wp --url="$site_url" cron event delete     sira_revalidation_deliver_event --all
done
```

## Rollback boundaries

Code rollback restores the previous plugin behavior. It does not remove:

- content created after deployment;
- terms or media created after deployment;
- ACF values;
- editor changes;
- external webhook deliveries already accepted by Next.js.

Keep the previous Bricks frontend deployable until the headless release has
passed acceptance and the rollback window has expired.

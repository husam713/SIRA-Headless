# SIRA Digital — WordPress tenant provisioning

Companion to ADR-033. This answers the question the owner asked before any
alternative CMS could be considered: **can the existing WordPress Multisite
network serve `sirahdigital.sa`, a mapped external domain on a different TLD?**

## Finding

**Yes. There is no architectural blocker.** A separate WordPress installation is
not required and must not be created.

### Evidence

| Claim | Class | Basis |
| --- | --- | --- |
| WordPress core maps an arbitrary per-site domain without a mapping plugin | CONFIRMED | Core behaviour since WordPress 4.5. Each site's domain and path live in `wp_blogs`; `ms_load_current_site_and_network()` resolves a request by domain and path, and never by a shared parent domain. `sunrise.php` and WPMU domain mapping are pre-4.5 requirements and do not apply. |
| This network runs a WordPress recent enough for that | CONFIRMED | `backend/sira-core.php` declares `Requires at least: 6.6` and is the network-activated plugin (`Network: true`). The network therefore runs 6.6 or later. |
| A different TLD is not a special case | CONFIRMED | Core stores a hostname, not a suffix. `sirahdigital.sa` is the same kind of value as `consulting.siratrgroup.com`. |
| `sira-core` is already tenant-agnostic | CONFIRMED | It reads `get_current_blog_id()`, `home_url()` and per-site options throughout, and `BrandManager::infer_brand_key()` keys off the site's own host. Nothing in it assumes a `siratrgroup.com` suffix. Verified by reading `backend/src/`. |
| The frontend resolves the tenant by whole hostname | CONFIRMED | `frontend/src/config/sites.ts` and `frontend/src/lib/host/resolve-site.ts`. Asserted by `tests/unit/site-registry.test.ts`. |
| WPGraphQL exposes a per-site endpoint at the site's own domain | STRONGLY INFERRED | WPGraphQL registers its route per site; the existing four branch tenants already each have their own endpoint. Not independently re-verified for a mapped domain here. |

### What is UNKNOWN and needs a human to look

None of these is a blocker. Each is a configuration fact this session cannot
observe, because the CMS is not reachable from here (no credentials, and
ADR-032 records that this client's egress is challenged by the host's CDN).

1. **Whether the network is a subdomain or subdirectory install.** Either works.
   In a subdirectory network the new site is created at a path and then has its
   `domain` set to `sirahdigital.sa` and its `path` set to `/`. In a subdomain
   network the domain is set directly. `docs/SOURCE-OF-TRUTH.md` records the
   WordPress origin as UNKNOWN, and this repository holds no `wp-config.php`.
2. **Whether `COOKIE_DOMAIN` is defined in `wp-config.php`.** This is the one
   setting that genuinely breaks a mapped domain: if it is pinned to the network
   domain, login and preview cookies will not be set on `sirahdigital.sa`. Left
   undefined, core derives it per site, which is correct. **Check this first.**
3. **Whether the hosting panel can terminate TLS for `sirahdigital.sa` against
   the same document root.** Required, and normal.
4. **`.sa` registration eligibility.** A second-level `.sa` domain is
   administered by SaudiNIC through accredited registrars and carries
   eligibility requirements — typically a Saudi commercial registration or
   trademark matching the name. This is a business prerequisite, not an
   engineering one, and it sits ahead of everything below.
5. **Whether the deployment platform's egress reaches WPGraphQL.** Open for the
   whole estate, not for Digital specifically — see ADR-032
   `openGates.platformEgressReachabilityUnverified`.

## External admin action

Not available to the engineering agent. Requires WordPress Network Admin and
hosting-panel access.

- **SYSTEM:** WordPress Multisite network administration, and the hosting
  control panel that serves it.

- **LOCATION:**
  1. `wp-config.php` — inspect only.
  2. Network Admin → Sites → Add New.
  3. Network Admin → Sites → the new site → Settings.
  4. Hosting panel → Domains → add `sirahdigital.sa` to the same document root,
     with TLS.
  5. Network Admin → Sites → the new site → Users, and Plugins.

- **ACTION:**
  1. Confirm whether `COOKIE_DOMAIN` is defined. If it is pinned to the network
     domain, that is the blocker to resolve before anything else. Do not change
     it without a recovery point.
  2. Create the site. Site title `SIRA Digital`. Admin email as the owner
     directs.
  3. Set the site's `domain` to `sirahdigital.sa` and `path` to `/`, and set
     `siteurl` and `home` to `https://sirahdigital.sa`.
  4. Add the domain in the hosting panel against the same document root and
     issue a certificate.
  5. Confirm `sira-core` is active for the new site (it is network-activated),
     and set its brand key to `digital`.
  6. Create the `digital` term in `sira_business_unit` on the new site, matching
     the ADR-014 / ADR-033 mapping. Group's taxonomy is not touched.
  7. Set the site's `sira_contact_recipient` option to the Digital enquiry
     inbox, or add the site to `SIRA_CONTACT_RECIPIENTS` in `wp-config.php`.
  8. Record the new site's blog id.

- **EXPECTED VALUE:** a site on the existing network whose `wp_blogs.domain` is
  `sirahdigital.sa` and whose `path` is `/`; `blog_public` set the same way as
  the other pre-launch tenants (`0` until launch — see the launch gate in
  `project-state.json`); brand key `digital`; a `digital` Business Unit term.

- **SECURITY NOTE:** Do not paste the blog id, the endpoint URL, credentials or
  the enquiry inbox address into a pull request, CI log, or evidence artifact.
  They belong in the deployment environment. Application Passwords for preview
  are per site and must be created fresh for Digital rather than reused from
  another tenant. Take a network database backup before step 1 if
  `COOKIE_DOMAIN` has to change; RB-009 restore evidence is still open.

- **VALIDATION:** after the action, and before any deploy:
  1. `https://sirahdigital.sa/` serves WordPress, not the network's main site;
  2. `https://sirahdigital.sa/graphql` answers a trivial query from the origin;
  3. logging in on `sirahdigital.sa` works — this is the `COOKIE_DOMAIN` check;
  4. the other five tenants are unaffected;
  5. set `SIRA_WP_DIGITAL_GRAPHQL_URL` and `SIRA_WP_DIGITAL_BLOG_ID` in the
     deployment environment, then confirm the Digital brand resolves from
     WordPress rather than from the frontend fallback. Until then the frontend
     logs `SIRA brand fallback activated { siteKey: 'digital' }` and renders the
     preset — which is the designed behaviour, not a failure.

## Until then

Nothing in this repository is blocked by the site not existing. A production
build with no Digital environment configured prerenders the whole estate and
degrades that one tenant to its brand preset. The tenant can be built, reviewed
and tested before the CMS site is created.

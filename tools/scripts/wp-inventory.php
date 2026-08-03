<?php
/**
 * SIRA Step 2C.2A read-only WordPress runtime inventory.
 *
 * Run:
 * wp eval-file scripts/wp-inventory.php --path=/path/to/wordpress
 *
 * @package Sira\Inventory
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
	fwrite(STDERR, "WordPress must be loaded through WP-CLI.\n");
	exit(1);
}

/**
 * Return a URL without credentials, query, or fragment.
 */
function sira_inventory_safe_url(string $url): string {
	$parts = wp_parse_url($url);

	if (!is_array($parts) || empty($parts['host'])) {
		return '';
	}

	$scheme = isset($parts['scheme']) ? $parts['scheme'] . '://' : '';
	$port   = isset($parts['port']) ? ':' . (int) $parts['port'] : '';
	$path   = isset($parts['path']) ? $parts['path'] : '/';

	return $scheme . strtolower((string) $parts['host']) . $port . $path;
}

/**
 * Get version/status information for selected plugins.
 *
 * @return array<string,array<string,mixed>>
 */
function sira_inventory_plugins(): array {
	if (!function_exists('get_plugins')) {
		require_once ABSPATH . 'wp-admin/includes/plugin.php';
	}

	$plugins = get_plugins();
	$wanted  = array(
		'sira-core',
		'wp-graphql',
		'wpgraphql-acf',
		'advanced-custom-fields',
		'advanced-custom-fields-pro',
	);

	$result = array();

	foreach ($plugins as $plugin_file => $data) {
		foreach ($wanted as $needle) {
			if (false === stripos($plugin_file, $needle)) {
				continue;
			}

			$result[$plugin_file] = array(
				'name'           => isset($data['Name']) ? (string) $data['Name'] : '',
				'version'        => isset($data['Version']) ? (string) $data['Version'] : '',
				'active_site'    => is_plugin_active($plugin_file),
				'active_network' => is_plugin_active_for_network($plugin_file),
			);
			break;
		}
	}

	ksort($result);

	return $result;
}

/**
 * Inventory registered post types.
 *
 * @return array<string,array<string,mixed>>
 */
function sira_inventory_post_types(): array {
	$result = array();

	foreach (get_post_types(array(), 'objects') as $name => $object) {
		if ('page' !== $name && 0 !== strpos($name, 'sira_')) {
			continue;
		}

		$rewrite_slug = null;

		if (is_array($object->rewrite) && isset($object->rewrite['slug'])) {
			$rewrite_slug = (string) $object->rewrite['slug'];
		}

		$result[$name] = array(
			'label'               => (string) $object->label,
			'public'              => (bool) $object->public,
			'publicly_queryable'  => (bool) $object->publicly_queryable,
			'has_archive'         => $object->has_archive,
			'show_in_graphql'     => !empty($object->show_in_graphql),
			'graphql_single_name' => isset($object->graphql_single_name)
				? (string) $object->graphql_single_name
				: null,
			'graphql_plural_name' => isset($object->graphql_plural_name)
				? (string) $object->graphql_plural_name
				: null,
			'rewrite_slug'        => $rewrite_slug,
			'supports'            => array_values(
				array_keys(
					(array) get_all_post_type_supports($name)
				)
			),
		);
	}

	ksort($result);

	return $result;
}

/**
 * Inventory registered taxonomies.
 *
 * @return array<string,array<string,mixed>>
 */
function sira_inventory_taxonomies(): array {
	$result = array();

	foreach (get_taxonomies(array(), 'objects') as $name => $object) {
		if (0 !== strpos($name, 'sira_')) {
			continue;
		}

		$rewrite_slug = null;

		if (is_array($object->rewrite) && isset($object->rewrite['slug'])) {
			$rewrite_slug = (string) $object->rewrite['slug'];
		}

		$result[$name] = array(
			'label'               => (string) $object->label,
			'hierarchical'        => (bool) $object->hierarchical,
			'public'              => (bool) $object->public,
			'show_in_graphql'     => !empty($object->show_in_graphql),
			'graphql_single_name' => isset($object->graphql_single_name)
				? (string) $object->graphql_single_name
				: null,
			'graphql_plural_name' => isset($object->graphql_plural_name)
				? (string) $object->graphql_plural_name
				: null,
			'object_types'        => array_values((array) $object->object_type),
			'rewrite_slug'        => $rewrite_slug,
		);
	}

	ksort($result);

	return $result;
}

/**
 * Inventory ACF groups and top-level fields without values.
 *
 * @return array<int,array<string,mixed>>
 */
function sira_inventory_acf_groups(): array {
	if (!function_exists('acf_get_field_groups')) {
		return array();
	}

	$result = array();

	foreach (acf_get_field_groups() as $group) {
		$key = isset($group['key']) ? (string) $group['key'] : '';

		$fields = array();

		if (function_exists('acf_get_fields')) {
			foreach ((array) acf_get_fields($group) as $field) {
				$fields[] = array(
					'key'                   => isset($field['key']) ? (string) $field['key'] : '',
					'name'                  => isset($field['name']) ? (string) $field['name'] : '',
					'type'                  => isset($field['type']) ? (string) $field['type'] : '',
					'show_in_graphql'       => !empty($field['show_in_graphql']),
					'graphql_field_name'    => isset($field['graphql_field_name'])
						? (string) $field['graphql_field_name']
						: null,
				);
			}
		}

		$result[] = array(
			'key'                     => $key,
			'title'                   => isset($group['title']) ? (string) $group['title'] : '',
			'active'                  => !isset($group['active']) || (bool) $group['active'],
			'show_in_graphql'         => !empty($group['show_in_graphql']),
			'graphql_field_name'      => isset($group['graphql_field_name'])
				? (string) $group['graphql_field_name']
				: null,
			'graphql_type_name'       => isset($group['graphql_type_name'])
				? (string) $group['graphql_type_name']
				: null,
			'graphql_types'           => isset($group['graphql_types'])
				? array_values((array) $group['graphql_types'])
				: array(),
			'map_types_from_location' => !empty(
				$group['map_graphql_types_from_location_rules']
			),
			'location'                => isset($group['location'])
				? $group['location']
				: array(),
			'fields'                  => $fields,
		);
	}

	usort(
		$result,
		static fn(array $left, array $right): int =>
			strcmp((string) $left['key'], (string) $right['key'])
	);

	return $result;
}

/**
 * Inventory menu registration, assignments, and counts.
 *
 * @return array<string,mixed>
 */
function sira_inventory_menus(): array {
	$registered_locations = get_registered_nav_menus();
	$assignments          = get_nav_menu_locations();
	$menus                = array();

	foreach (wp_get_nav_menus() as $menu) {
		$locations = array();

		foreach ($assignments as $location => $term_id) {
			if ((int) $term_id === (int) $menu->term_id) {
				$locations[] = (string) $location;
			}
		}

		$items = wp_get_nav_menu_items($menu->term_id);

		$menus[] = array(
			'term_id'     => (int) $menu->term_id,
			'name'        => (string) $menu->name,
			'slug'        => (string) $menu->slug,
			'item_count'  => is_array($items) ? count($items) : 0,
			'locations'   => $locations,
		);
	}

	usort(
		$menus,
		static fn(array $left, array $right): int =>
			strcmp((string) $left['slug'], (string) $right['slug'])
	);

	return array(
		'registered_locations' => $registered_locations,
		'assignments'          => $assignments,
		'menus'                => $menus,
	);
}

/**
 * Inventory Business Unit terms.
 *
 * @return array<int,array<string,mixed>>
 */
function sira_inventory_business_units(): array {
	if (!taxonomy_exists('sira_business_unit')) {
		return array();
	}

	$terms = get_terms(
		array(
			'taxonomy'   => 'sira_business_unit',
			'hide_empty' => false,
		)
	);

	if (is_wp_error($terms)) {
		return array(
			array(
				'error' => $terms->get_error_code(),
			),
		);
	}

	return array_map(
		static fn(WP_Term $term): array => array(
			'term_id' => (int) $term->term_id,
			'name'    => (string) $term->name,
			'slug'    => (string) $term->slug,
			'count'   => (int) $term->count,
		),
		$terms
	);
}

/**
 * Return post counts by status for SIRA post types and Page.
 *
 * @return array<string,array<string,int>>
 */
function sira_inventory_post_counts(): array {
	$result = array();

	foreach (get_post_types(array(), 'names') as $post_type) {
		if ('page' !== $post_type && 0 !== strpos($post_type, 'sira_')) {
			continue;
		}

		$counts = wp_count_posts($post_type);
		$row    = array();

		foreach ((array) $counts as $status => $count) {
			if ((int) $count > 0) {
				$row[(string) $status] = (int) $count;
			}
		}

		$result[$post_type] = $row;
	}

	ksort($result);

	return $result;
}

/**
 * Count records for a meta key grouped by a small allowlist of boolean values.
 *
 * @return array<string,int>
 */
function sira_inventory_boolean_meta_coverage(
	string $post_type,
	string $meta_key
): array {
	global $wpdb;

	$sql = $wpdb->prepare(
		"SELECT
			CASE
				WHEN pm.meta_value IN ('1','true','yes','on') THEN 'true'
				WHEN pm.meta_value IN ('0','false','no','off','') THEN 'false'
				ELSE 'other'
			END AS normalized_value,
			COUNT(DISTINCT p.ID) AS record_count
		FROM {$wpdb->posts} p
		LEFT JOIN {$wpdb->postmeta} pm
			ON pm.post_id = p.ID
			AND pm.meta_key = %s
		WHERE p.post_type = %s
		GROUP BY normalized_value",
		$meta_key,
		$post_type
	);

	$result = array(
		'true'    => 0,
		'false'   => 0,
		'other'   => 0,
		'missing' => 0,
	);

	foreach ((array) $wpdb->get_results($sql, ARRAY_A) as $row) {
		$key = isset($row['normalized_value'])
			? (string) $row['normalized_value']
			: 'other';

		if (isset($result[$key])) {
			$result[$key] = (int) $row['record_count'];
		}
	}

	$total = (int) $wpdb->get_var(
		$wpdb->prepare(
			"SELECT COUNT(ID)
			FROM {$wpdb->posts}
			WHERE post_type = %s",
			$post_type
		)
	);

	$covered = $result['true'] + $result['false'] + $result['other'];
	$result['missing'] = max(0, $total - $covered);

	return $result;
}

/**
 * Inventory SIRA-prefixed front-page meta keys without values.
 *
 * @return array<int,array<string,mixed>>
 */
function sira_inventory_front_page_meta(int $front_page_id): array {
	global $wpdb;

	if ($front_page_id <= 0) {
		return array();
	}

	$rows = $wpdb->get_results(
		$wpdb->prepare(
			"SELECT meta_key, COUNT(*) AS row_count
			FROM {$wpdb->postmeta}
			WHERE post_id = %d
			AND (
				meta_key LIKE 'sira\\_%%'
				OR meta_key LIKE '\\_sira\\_%%'
			)
			GROUP BY meta_key
			ORDER BY meta_key ASC",
			$front_page_id
		),
		ARRAY_A
	);

	return array_map(
		static fn(array $row): array => array(
			'meta_key'  => (string) $row['meta_key'],
			'row_count' => (int) $row['row_count'],
		),
		(array) $rows
	);
}

/**
 * Inventory one Multisite site.
 *
 * @return array<string,mixed>
 */
function sira_inventory_site(int $blog_id): array {
	switch_to_blog($blog_id);

	try {
		$front_page_id = (int) get_option('page_on_front');
		$front_page    = $front_page_id > 0
			? get_post($front_page_id)
			: null;
		$theme         = wp_get_theme();

		return array(
			'blog_id' => $blog_id,
			'urls'    => array(
				'home' => sira_inventory_safe_url(home_url('/')),
				'site' => sira_inventory_safe_url(site_url('/')),
			),
			'front_page' => array(
				'show_on_front' => (string) get_option('show_on_front'),
				'page_id'       => $front_page_id,
				'exists'        => $front_page instanceof WP_Post,
				'title'         => $front_page instanceof WP_Post
					? (string) $front_page->post_title
					: null,
				'status'        => $front_page instanceof WP_Post
					? (string) $front_page->post_status
					: null,
				'post_type'     => $front_page instanceof WP_Post
					? (string) $front_page->post_type
					: null,
				'sira_meta_keys' => sira_inventory_front_page_meta(
					$front_page_id
				),
			),
			'theme' => array(
				'name'       => $theme->get('Name'),
				'version'    => $theme->get('Version'),
				'stylesheet' => $theme->get_stylesheet(),
				'template'   => $theme->get_template(),
			),
			'post_types'           => sira_inventory_post_types(),
			'taxonomies'           => sira_inventory_taxonomies(),
			'acf_groups'           => sira_inventory_acf_groups(),
			'menus'                => sira_inventory_menus(),
			'business_units'       => sira_inventory_business_units(),
			'post_counts'          => sira_inventory_post_counts(),
			'privacy_field_coverage' => array(
				'investment_public_display' =>
					sira_inventory_boolean_meta_coverage(
						'sira_investment',
						'sira_investment_public_display'
					),
				'testimonial_consent_approved' =>
					sira_inventory_boolean_meta_coverage(
						'sira_testimonial',
						'sira_testimonial_consent_approved'
					),
			),
		);
	} finally {
		restore_current_blog();
	}
}

$sites = is_multisite()
	? get_sites(array('number' => 0))
	: array((object) array('blog_id' => get_current_blog_id()));

$output = array(
	'generated_at' => gmdate(DATE_ATOM),
	'network'      => array(
		'is_multisite' => is_multisite(),
		'site_count'   => count($sites),
	),
	'plugins'      => sira_inventory_plugins(),
	'sites'        => array(),
);

foreach ($sites as $site) {
	$output['sites'][] = sira_inventory_site((int) $site->blog_id);
}

echo wp_json_encode(
	$output,
	JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES
);
echo PHP_EOL;

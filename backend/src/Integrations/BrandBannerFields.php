<?php
/**
 * ACF fields for the typed public brand-banner contract.
 */

declare(strict_types=1);

namespace Sira\Core\Integrations;

/**
 * Keep the two banner definitions inspectable and version controlled.
 */
final class BrandBannerFields {
	/**
	 * @return array<int,array<string,mixed>>
	 */
	public static function definitions(): array {
		return array(
			self::banner(
				'announcement',
				'Announcement Banner',
				'info'
			),
			self::banner(
				'emergency',
				'Emergency Banner',
				'urgent'
			),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function banner(
		string $channel,
		string $label,
		string $default_severity
	): array {
		return array(
			'key'               => "field_sira_{$channel}_banner_config",
			'label'             => $label,
			'name'              => "sira_{$channel}_banner_config",
			'type'              => 'group',
			'layout'            => 'block',
			'show_in_graphql'   => false,
			'instructions'      => 'Leave Message empty to use the legacy text fallback. Times use the WordPress site timezone.',
			'sub_fields'        => array(
				array(
					'key'             => "field_sira_{$channel}_banner_message",
					'label'           => 'Message',
					'name'            => 'message',
					'type'            => 'textarea',
					'rows'            => 3,
					'new_lines'       => '',
					'show_in_graphql' => false,
				),
				array(
					'key'             => "field_sira_{$channel}_banner_severity",
					'label'           => 'Severity',
					'name'            => 'severity',
					'type'            => 'radio',
					'choices'         => array(
						'info'      => 'Information',
						'important' => 'Important',
						'urgent'    => 'Urgent',
					),
					'default_value'   => $default_severity,
					'layout'          => 'horizontal',
					'return_format'   => 'value',
					'show_in_graphql' => false,
				),
				array(
					'key'             => "field_sira_{$channel}_banner_link",
					'label'           => 'Optional Link',
					'name'            => 'link',
					'type'            => 'link',
					'return_format'   => 'array',
					'show_in_graphql' => false,
				),
				array(
					'key'             => "field_sira_{$channel}_banner_starts_at",
					'label'           => 'Starts At',
					'name'            => 'starts_at',
					'type'            => 'date_time_picker',
					'display_format'  => 'Y-m-d H:i',
					'return_format'   => 'Y-m-d H:i:s',
					'first_day'       => 1,
					'show_in_graphql' => false,
				),
				array(
					'key'             => "field_sira_{$channel}_banner_ends_at",
					'label'           => 'Ends At',
					'name'            => 'ends_at',
					'type'            => 'date_time_picker',
					'display_format'  => 'Y-m-d H:i',
					'return_format'   => 'Y-m-d H:i:s',
					'first_day'       => 1,
					'show_in_graphql' => false,
				),
				array(
					'key'             => "field_sira_{$channel}_banner_dismissible",
					'label'           => 'Dismissible',
					'name'            => 'dismissible',
					'type'            => 'true_false',
					'ui'              => 1,
					'default_value'   => 0,
					'show_in_graphql' => false,
				),
			),
		);
	}
}

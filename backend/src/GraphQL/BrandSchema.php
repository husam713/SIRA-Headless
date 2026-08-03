<?php
/**
 * Public WPGraphQL brand schema.
 */

declare(strict_types=1);

namespace Sira\Core\GraphQL;

use Sira\Core\Brand\BrandManager;

final class BrandSchema {
	public function hooks(): void {
		add_action( 'graphql_register_types', array( $this, 'register' ) );
	}

	public function register(): void {
		if (
			! function_exists( 'register_graphql_object_type' )
			|| ! function_exists( 'register_graphql_field' )
		) {
			return;
		}

		$this->register_media_type();
		$this->register_value_type();
		$this->register_office_type();
		$this->register_social_profiles_type();
		$this->register_brand_type();

		register_graphql_field(
			'RootQuery',
			'siraBrand',
			array(
				'type'        => array( 'non_null' => 'SiraBrand' ),
				'description' => __(
					'The effective public SIRA brand for the current WordPress Multisite site.',
					'sira-core'
				),
				'resolve'     => fn(): array => $this->resolve_brand(),
			)
		);
	}

	private function register_media_type(): void {
		register_graphql_object_type(
			'SiraBrandMedia',
			array(
				'description' => __(
					'A public SIRA brand image and its WordPress media node.',
					'sira-core'
				),
				'fields'      => array(
					'databaseId' => array(
						'type'        => array( 'non_null' => 'Int' ),
						'description' => __(
							'The WordPress attachment database ID.',
							'sira-core'
						),
					),
					'sourceUrl'  => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __(
							'The public source URL for the original attachment.',
							'sira-core'
						),
					),
					'altText'    => array(
						'type'        => 'String',
						'description' => __(
							'The attachment alternative text.',
							'sira-core'
						),
					),
					'width'      => array(
						'type'        => 'Int',
						'description' => __(
							'The original image width in pixels when available.',
							'sira-core'
						),
					),
					'height'     => array(
						'type'        => 'Int',
						'description' => __(
							'The original image height in pixels when available.',
							'sira-core'
						),
					),
					'mediaItem'  => array(
						'type'        => 'MediaItem',
						'description' => __(
							'The typed WPGraphQL media node.',
							'sira-core'
						),
						'resolve'     => static function (
							array $source,
							array $args,
							mixed $context
						): mixed {
							unset( $args );

							$attachment_id = absint( $source['databaseId'] ?? 0 );

							if (
								0 === $attachment_id
								|| ! is_object( $context )
								|| ! method_exists( $context, 'get_loader' )
							) {
								return null;
							}

							return $context
								->get_loader( 'post' )
								->load_deferred( $attachment_id );
						},
					),
				),
			)
		);
	}

	private function register_value_type(): void {
		register_graphql_object_type(
			'SiraBrandValue',
			array(
				'description' => __(
					'An approved public organizational value.',
					'sira-core'
				),
				'fields'      => array(
					'title'       => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'The value title.', 'sira-core' ),
					),
					'description' => array(
						'type'        => 'String',
						'description' => __(
							'The public description of the value.',
							'sira-core'
						),
					),
				),
			)
		);
	}

	private function register_office_type(): void {
		register_graphql_object_type(
			'SiraBrandOffice',
			array(
				'description' => __(
					'An approved public office location for the current brand.',
					'sira-core'
				),
				'fields'      => array(
					'name'    => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'The public office name.', 'sira-core' ),
					),
					'address' => array(
						'type'        => 'String',
						'description' => __( 'The public office address.', 'sira-core' ),
					),
					'phone'   => array(
						'type'        => 'String',
						'description' => __( 'The public office phone number.', 'sira-core' ),
					),
					'email'   => array(
						'type'        => 'String',
						'description' => __( 'The public office email address.', 'sira-core' ),
					),
				),
			)
		);
	}

	private function register_social_profiles_type(): void {
		register_graphql_object_type(
			'SiraBrandSocialProfiles',
			array(
				'description' => __(
					'Approved public social profiles for the current brand.',
					'sira-core'
				),
				'fields'      => array(
					'linkedin' => array(
						'type'        => 'String',
						'description' => __( 'The LinkedIn profile URL.', 'sira-core' ),
					),
					'instagram' => array(
						'type'        => 'String',
						'description' => __( 'The Instagram profile URL.', 'sira-core' ),
					),
					'x'        => array(
						'type'        => 'String',
						'description' => __( 'The X profile URL.', 'sira-core' ),
					),
					'youtube'  => array(
						'type'        => 'String',
						'description' => __( 'The YouTube profile URL.', 'sira-core' ),
					),
				),
			)
		);
	}

	private function register_brand_type(): void {
		register_graphql_object_type(
			'SiraBrand',
			array(
				'description' => __(
					'The effective public brand identity for a SIRA WordPress site.',
					'sira-core'
				),
				'fields'      => array(
					'name'               => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'The public brand name.', 'sira-core' ),
					),
					'key'                => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'The stable brand key.', 'sira-core' ),
					),
					'tagline'            => array(
						'type'        => 'String',
						'description' => __( 'The public brand tagline.', 'sira-core' ),
					),
					'primaryColor'       => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'The primary brand color.', 'sira-core' ),
					),
					'secondaryColor'     => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'The secondary brand color.', 'sira-core' ),
					),
					'accentColor'        => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'The accent brand color.', 'sira-core' ),
					),
					'paperColor'         => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'The light surface brand color.', 'sira-core' ),
					),
					'inkColor'           => array(
						'type'        => array( 'non_null' => 'String' ),
						'description' => __( 'The primary text brand color.', 'sira-core' ),
					),
					'logo'               => array(
						'type'        => 'SiraBrandMedia',
						'description' => __( 'The public brand logo.', 'sira-core' ),
					),
					'mark'               => array(
						'type'        => 'SiraBrandMedia',
						'description' => __( 'The public brand mark.', 'sira-core' ),
					),
					'email'              => array(
						'type'        => 'String',
						'description' => __( 'The approved public contact email.', 'sira-core' ),
					),
					'phone'              => array(
						'type'        => 'String',
						'description' => __( 'The approved public contact phone.', 'sira-core' ),
					),
					'address'            => array(
						'type'        => 'String',
						'description' => __( 'The approved public contact address.', 'sira-core' ),
					),
					'description'        => array(
						'type'        => 'String',
						'description' => __( 'The public brand description.', 'sira-core' ),
					),
					'mission'            => array(
						'type'        => 'String',
						'description' => __( 'The public mission statement.', 'sira-core' ),
					),
					'vision'             => array(
						'type'        => 'String',
						'description' => __( 'The public vision statement.', 'sira-core' ),
					),
					'values'             => array(
						'type'        => array( 'list_of' => 'SiraBrandValue' ),
						'description' => __( 'The approved public brand values.', 'sira-core' ),
					),
					'officeLocations'    => array(
						'type'        => array( 'list_of' => 'SiraBrandOffice' ),
						'description' => __( 'The approved public office locations.', 'sira-core' ),
					),
					'socialProfiles'     => array(
						'type'        => 'SiraBrandSocialProfiles',
						'description' => __( 'The approved public social profiles.', 'sira-core' ),
					),
					'announcementBanner' => array(
						'type'        => 'String',
						'description' => __( 'The public announcement banner text.', 'sira-core' ),
					),
					'emergencyBanner'    => array(
						'type'        => 'String',
						'description' => __( 'The public emergency banner text.', 'sira-core' ),
					),
				),
			)
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private function resolve_brand(): array {
		$brand = BrandManager::instance()->get_public();

		return array(
			'name'               => (string) $brand['brand_name'],
			'key'                => (string) $brand['brand_key'],
			'tagline'            => $brand['tagline'],
			'primaryColor'       => (string) $brand['primary_color'],
			'secondaryColor'     => (string) $brand['secondary_color'],
			'accentColor'        => (string) $brand['accent_color'],
			'paperColor'         => (string) $brand['paper_color'],
			'inkColor'           => (string) $brand['ink_color'],
			'logo'               => $this->attachment_payload(
				absint( $brand['logo_id'] )
			),
			'mark'               => $this->attachment_payload(
				absint( $brand['mark_id'] )
			),
			'email'              => $brand['email'],
			'phone'              => $brand['phone'],
			'address'            => $brand['address'],
			'description'        => $brand['description'],
			'mission'            => $brand['mission'],
			'vision'             => $brand['vision'],
			'values'             => $brand['values'],
			'officeLocations'    => $brand['office_locations'],
			'socialProfiles'     => $brand['social_profiles'],
			'announcementBanner' => $brand['announcement_banner'],
			'emergencyBanner'    => $brand['emergency_banner'],
		);
	}

	/**
	 * @return array<string,mixed>|null
	 */
	private function attachment_payload( int $attachment_id ): ?array {
		if (
			0 === $attachment_id
			|| 'attachment' !== get_post_type( $attachment_id )
		) {
			return null;
		}

		$source_url = wp_get_attachment_url( $attachment_id );

		if ( ! is_string( $source_url ) || '' === $source_url ) {
			return null;
		}

		$metadata = wp_get_attachment_metadata( $attachment_id );
		$width    = is_array( $metadata ) ? absint( $metadata['width'] ?? 0 ) : 0;
		$height   = is_array( $metadata ) ? absint( $metadata['height'] ?? 0 ) : 0;
		$alt_text = sanitize_text_field(
			(string) get_post_meta(
				$attachment_id,
				'_wp_attachment_image_alt',
				true
			)
		);

		return array(
			'databaseId' => $attachment_id,
			'sourceUrl'  => esc_url_raw( $source_url ),
			'altText'    => '' !== $alt_text ? $alt_text : null,
			'width'      => 0 < $width ? $width : null,
			'height'     => 0 < $height ? $height : null,
		);
	}
}

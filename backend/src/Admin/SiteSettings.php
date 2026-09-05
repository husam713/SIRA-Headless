<?php
/**
 * Per-site brand settings.
 */

declare(strict_types=1);

namespace Sira\Core\Admin;

use Sira\Core\Brand\BrandManager;

final class SiteSettings {
	public function hooks(): void {
		add_action( 'admin_menu', array( $this, 'menu' ), 20 );
		add_action( 'admin_init', array( $this, 'register' ) );

		// This screen renders the *effective* brand, which BrandManager resolves
		// with the ACF options last. It used to save to `sira_brand_options`
		// alone, so every field ACF had a value for reverted on reload: the edit
		// was stored, and then never read. Mirroring the save into the ACF
		// options makes the screen write to the store it reads from.
		add_action( 'add_option_sira_brand_options', array( $this, 'mirror_added' ), 5, 2 );
		add_action( 'update_option_sira_brand_options', array( $this, 'mirror_updated' ), 5, 2 );
	}

	/**
	 * @param string $option Option name.
	 * @param mixed  $value  Saved value.
	 */
	public function mirror_added( string $option, mixed $value ): void {
		unset( $option );
		$this->mirror_to_acf( $value );
	}

	/**
	 * @param mixed $old_value Previous value.
	 * @param mixed $value     Saved value.
	 */
	public function mirror_updated( mixed $old_value, mixed $value ): void {
		unset( $old_value );
		$this->mirror_to_acf( $value );
	}

	/**
	 * Write the saved brand values into the ACF option fields that outrank them.
	 *
	 * Only keys the form actually submitted are mirrored, so the ACF-only
	 * fields — values, office locations and the two typed banners — are left
	 * alone. Empty values are mirrored too: clearing a field here has to clear
	 * it there, or the ACF value would win and the clear would be ignored.
	 *
	 * @param mixed $value Saved option value.
	 */
	private function mirror_to_acf( mixed $value ): void {
		if ( ! is_array( $value ) || ! function_exists( 'update_field' ) ) {
			return;
		}

		foreach ( BrandManager::acf_field_map() as $key => $field ) {
			if ( ! array_key_exists( $key, $value ) ) {
				continue;
			}

			// Attachment IDs are per-site, so a stale one carried in from
			// another site or an older install points at nothing here. Writing
			// it would replace a working image with a reference that resolves
			// to false, which is worse than leaving the field alone.
			if (
				in_array( $key, array( 'logo_id', 'mark_id' ), true )
				&& 0 !== (int) $value[ $key ]
				&& ! wp_get_attachment_url( (int) $value[ $key ] )
			) {
				continue;
			}

			update_field( $field[1], $value[ $key ], 'option' );
		}

		BrandManager::instance()->clear_cache();
	}

	public function menu(): void {
		add_submenu_page(
			'sira-content',
			__( 'SIRA Brand', 'sira-core' ),
			__( 'Brand Settings', 'sira-core' ),
			'manage_options',
			'sira-brand',
			array( $this, 'render' )
		);
	}

	public function register(): void {
		register_setting(
			'sira_brand_group',
			'sira_brand_options',
			array(
				'type'              => 'array',
				'sanitize_callback' => array( BrandManager::class, 'sanitize' ),
				'default'           => array(),
			)
		);
	}

	public function render(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$values = BrandManager::instance()->get();
		$fields = array(
			'brand_name'     => 'Brand name',
			'brand_key'      => 'Brand key',
			'tagline'        => 'Tagline',
			'email'          => 'Email',
			'phone'          => 'Phone',
			'address'        => 'Address',
			'primary_color'  => 'Primary color',
			'secondary_color'=> 'Secondary color',
			'accent_color'   => 'Accent color',
			'paper_color'    => 'Paper color',
			'ink_color'      => 'Ink color',
			'logo_id'        => 'Logo attachment ID',
			'mark_id'        => 'Mark attachment ID',
			'linkedin_url'   => 'LinkedIn URL',
			'instagram_url'  => 'Instagram URL',
			'x_url'          => 'X URL',
			'youtube_url'    => 'YouTube URL',
			'analytics_id'   => 'Analytics ID',
			'announcement_bar' => 'Legacy announcement text fallback',
			'emergency_banner' => 'Legacy emergency text fallback',
		);
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'SIRA Brand', 'sira-core' ); ?></h1>
			<p>
				<?php
				esc_html_e(
					'These values override network defaults for this site. Approved public values are exposed through the SIRA brand API and GraphQL schema.',
					'sira-core'
				);
				?>
			</p>
			<p>
				<?php
				esc_html_e(
					'Use SIRA Options for typed, scheduled announcement and emergency banners. The legacy text fields below remain backward-compatible fallbacks.',
					'sira-core'
				);
				?>
			</p>
			<p>
				<?php
				esc_html_e(
					'This screen and SIRA Options edit the same stored values. Saving here updates both, so whichever screen you open next shows what you last saved.',
					'sira-core'
				);
				?>
			</p>
			<form method="post" action="options.php">
				<?php settings_fields( 'sira_brand_group' ); ?>
				<table class="form-table" role="presentation">
					<?php foreach ( $fields as $key => $label ) : ?>
						<?php
						$type = 'text';

						if ( str_contains( $key, 'color' ) ) {
							$type = 'color';
						} elseif ( str_contains( $key, 'url' ) ) {
							$type = 'url';
						} elseif ( str_contains( $key, 'email' ) ) {
							$type = 'email';
						}
						?>
						<tr>
							<th scope="row">
								<label for="sira-<?php echo esc_attr( $key ); ?>">
									<?php echo esc_html( $label ); ?>
								</label>
							</th>
							<td>
								<input
									class="regular-text"
									id="sira-<?php echo esc_attr( $key ); ?>"
									type="<?php echo esc_attr( $type ); ?>"
									name="sira_brand_options[<?php echo esc_attr( $key ); ?>]"
									value="<?php echo esc_attr( (string) ( $values[ $key ] ?? '' ) ); ?>"
								>
							</td>
						</tr>
					<?php endforeach; ?>

					<?php
					foreach (
						array(
							'description' => 'Description',
							'mission'     => 'Mission',
							'vision'      => 'Vision',
						) as $key => $label
					) :
						?>
						<tr>
							<th scope="row">
								<label for="sira-<?php echo esc_attr( $key ); ?>">
									<?php echo esc_html( $label ); ?>
								</label>
							</th>
							<td>
								<textarea
									class="large-text"
									rows="5"
									id="sira-<?php echo esc_attr( $key ); ?>"
									name="sira_brand_options[<?php echo esc_attr( $key ); ?>]"
								><?php echo esc_textarea( (string) ( $values[ $key ] ?? '' ) ); ?></textarea>
							</td>
						</tr>
					<?php endforeach; ?>
				</table>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}
}

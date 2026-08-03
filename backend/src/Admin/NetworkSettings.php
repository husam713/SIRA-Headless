<?php
/**
 * Network defaults.
 */

declare(strict_types=1);

namespace Sira\Core\Admin;

use Sira\Core\Brand\BrandManager;

final class NetworkSettings {
	public function hooks(): void {
		add_action( 'network_admin_menu', array( $this, 'menu' ) );
		add_action(
			'network_admin_edit_sira_network_settings',
			array( $this, 'save' )
		);
		add_action( 'wp_initialize_site', array( $this, 'initialize_site' ), 20 );
	}

	public function menu(): void {
		add_submenu_page(
			'settings.php',
			__( 'SIRA Platform', 'sira-core' ),
			__( 'SIRA Platform', 'sira-core' ),
			'manage_network_options',
			'sira-platform',
			array( $this, 'render' )
		);
	}

	public function render(): void {
		if ( ! current_user_can( 'manage_network_options' ) ) {
			return;
		}

		$values = get_site_option(
			'sira_network_defaults',
			BrandManager::instance()->defaults()
		);
		$values = is_array( $values ) ? $values : array();
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'SIRA Platform Network Defaults', 'sira-core' ); ?></h1>
			<form method="post" action="edit.php?action=sira_network_settings">
				<?php wp_nonce_field( 'sira_network_settings' ); ?>
				<table class="form-table" role="presentation">
					<tr>
						<th scope="row">
							<label for="sira-network-email">
								<?php esc_html_e( 'Default contact email', 'sira-core' ); ?>
							</label>
						</th>
						<td>
							<input
								class="regular-text"
								type="email"
								id="sira-network-email"
								name="email"
								value="<?php echo esc_attr( (string) ( $values['email'] ?? '' ) ); ?>"
							>
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="sira-network-phone">
								<?php esc_html_e( 'Default phone', 'sira-core' ); ?>
							</label>
						</th>
						<td>
							<input
								class="regular-text"
								id="sira-network-phone"
								name="phone"
								value="<?php echo esc_attr( (string) ( $values['phone'] ?? '' ) ); ?>"
							>
						</td>
					</tr>
					<tr>
						<th scope="row">
							<label for="sira-network-address">
								<?php esc_html_e( 'Default address', 'sira-core' ); ?>
							</label>
						</th>
						<td>
							<input
								class="large-text"
								id="sira-network-address"
								name="address"
								value="<?php echo esc_attr( (string) ( $values['address'] ?? '' ) ); ?>"
							>
						</td>
					</tr>
				</table>
				<?php submit_button(); ?>
			</form>
		</div>
		<?php
	}

	public function save(): void {
		if ( ! current_user_can( 'manage_network_options' ) ) {
			wp_die( esc_html__( 'Access denied.', 'sira-core' ) );
		}

		check_admin_referer( 'sira_network_settings' );

		$current = get_site_option( 'sira_network_defaults', array() );
		$current = is_array( $current ) ? $current : array();

		$current['email'] = sanitize_email(
			wp_unslash( $_POST['email'] ?? '' )
		);
		$current['phone'] = sanitize_text_field(
			wp_unslash( $_POST['phone'] ?? '' )
		);
		$current['address'] = sanitize_text_field(
			wp_unslash( $_POST['address'] ?? '' )
		);

		update_site_option( 'sira_network_defaults', $current );

		wp_safe_redirect(
			add_query_arg(
				'updated',
				'true',
				network_admin_url( 'settings.php?page=sira-platform' )
			)
		);
		exit;
	}

	public function initialize_site( \WP_Site $site ): void {
		switch_to_blog( (int) $site->blog_id );

		try {
			if ( false === get_option( 'sira_brand_options', false ) ) {
				update_option(
					'sira_brand_options',
					BrandManager::instance()->defaults()
				);
			}
		} finally {
			restore_current_blog();
		}
	}
}

<?php
/**
 * Temporary legacy contact-form compatibility bridge.
 *
 * @deprecated Replace with the approved headless forms service before removal.
 */

declare(strict_types=1);

namespace Sira\Core\Forms;

use Sira\Core\Brand\BrandManager;

final class LegacyContactForm {
	public function hooks(): void {
		add_shortcode( 'sira_contact_form', array( $this, 'render' ) );
		add_action( 'admin_post_nopriv_sira_contact', array( $this, 'handle' ) );
		add_action( 'admin_post_sira_contact', array( $this, 'handle' ) );
	}

	public function render(): string {
		$status = sanitize_key( wp_unslash( $_GET['sira_contact'] ?? '' ) );

		ob_start();

		if ( 'sent' === $status ) {
			?>
			<div class="sira-notice" role="status">
				<?php esc_html_e( 'Thank you. Your message has been sent.', 'sira-core' ); ?>
			</div>
			<?php
		}
		?>
		<form class="sira-form" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" method="post">
			<?php wp_nonce_field( 'sira_contact', 'sira_contact_nonce' ); ?>
			<input type="hidden" name="action" value="sira_contact">
			<input
				type="text"
				name="website"
				value=""
				tabindex="-1"
				autocomplete="off"
				class="u-visually-hidden"
				aria-hidden="true"
			>
			<div class="sira-form__row">
				<div class="sira-field">
					<label for="sira-name"><?php esc_html_e( 'Full name', 'sira-core' ); ?></label>
					<input id="sira-name" name="name" required autocomplete="name">
				</div>
				<div class="sira-field">
					<label for="sira-email"><?php esc_html_e( 'Email', 'sira-core' ); ?></label>
					<input id="sira-email" type="email" name="email" required autocomplete="email">
				</div>
			</div>
			<div class="sira-field">
				<label for="sira-message"><?php esc_html_e( 'Message', 'sira-core' ); ?></label>
				<textarea id="sira-message" name="message" required></textarea>
			</div>
			<button class="sira-button" type="submit">
				<?php esc_html_e( 'Send message', 'sira-core' ); ?>
			</button>
		</form>
		<?php

		return (string) ob_get_clean();
	}

	public function handle(): void {
		$redirect = wp_get_referer() ?: home_url( '/' );

		if (
			! isset( $_POST['sira_contact_nonce'] )
			|| ! wp_verify_nonce(
				sanitize_text_field( wp_unslash( $_POST['sira_contact_nonce'] ) ),
				'sira_contact'
			)
		) {
			wp_die( esc_html__( 'Invalid request.', 'sira-core' ) );
		}

		if ( ! empty( $_POST['website'] ) ) {
			wp_safe_redirect( $redirect );
			exit;
		}

		$name    = sanitize_text_field( wp_unslash( $_POST['name'] ?? '' ) );
		$email   = sanitize_email( wp_unslash( $_POST['email'] ?? '' ) );
		$message = sanitize_textarea_field( wp_unslash( $_POST['message'] ?? '' ) );

		if ( '' === $name || ! is_email( $email ) || '' === $message ) {
			wp_die( esc_html__( 'Please complete all required fields.', 'sira-core' ) );
		}

		$rate_limit_key = 'sira_contact_' . md5(
			(string) ( $_SERVER['REMOTE_ADDR'] ?? 'unknown' )
		);

		if ( get_transient( $rate_limit_key ) ) {
			wp_die( esc_html__( 'Please wait before sending another message.', 'sira-core' ) );
		}

		set_transient( $rate_limit_key, 1, MINUTE_IN_SECONDS );

		$brand     = BrandManager::instance()->get();
		$recipient = sanitize_email(
			(string) ( $brand['email'] ?? get_option( 'admin_email' ) )
		);

		if ( ! is_email( $recipient ) ) {
			$recipient = sanitize_email( (string) get_option( 'admin_email' ) );
		}

		$sent = wp_mail(
			$recipient,
			sprintf(
				/* translators: %s: sender name. */
				__( 'Website enquiry from %s', 'sira-core' ),
				$name
			),
			$message,
			array( 'Reply-To: ' . $name . ' <' . $email . '>' )
		);

		$result = $sent ? 'sent' : 'failed';

		wp_safe_redirect(
			add_query_arg(
				'sira_contact',
				$result,
				$redirect
			)
		);
		exit;
	}
}

<?php
/**
 * Optional structured starter-content importer.
 */

declare(strict_types=1);

namespace Sira\Core\Admin;

final class DemoImporter {
	public function hooks(): void {
		add_action( 'admin_menu', array( $this, 'register_menu' ), 20 );
		add_action( 'admin_post_sira_import_demo', array( $this, 'import' ) );
	}

	public function register_menu(): void {
		add_submenu_page(
			'sira-content',
			__( 'SIRA Setup', 'sira-core' ),
			__( 'Setup', 'sira-core' ),
			'manage_options',
			'sira-setup',
			array( $this, 'render' )
		);
	}

	public function render(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'SIRA Starter Setup', 'sira-core' ); ?></h1>
			<p>
				<?php
				esc_html_e(
					'Creates structured starter companies, projects, and news items. It does not create pages, assign theme templates, download third-party images, or overwrite existing posts.',
					'sira-core'
				);
				?>
			</p>
			<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
				<input type="hidden" name="action" value="sira_import_demo">
				<?php
				wp_nonce_field( 'sira_import_demo' );
				submit_button(
					__( 'Create starter content', 'sira-core' ),
					'primary',
					'submit',
					false
				);
				?>
			</form>
		</div>
		<?php
	}

	public function import(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'Access denied.', 'sira-core' ) );
		}

		check_admin_referer( 'sira_import_demo' );

		$companies = array(
			array(
				'title'   => 'SIRA Real Estate',
				'excerpt' => 'Residential and mixed-use development across Türkiye and growth markets.',
				'key'     => 'realestate',
			),
			array(
				'title'   => 'SIRA Healthcare',
				'excerpt' => 'Diagnostic and healthcare infrastructure across East Africa.',
				'key'     => 'healthcare',
			),
			array(
				'title'   => 'SIRA Lifestyle',
				'excerpt' => 'Hospitality, branded residences and experience-led destinations.',
				'key'     => 'lifestyle',
			),
			array(
				'title'   => 'SIRA Consulting',
				'excerpt' => 'Market entry, investment structuring and execution support.',
				'key'     => 'consulting',
			),
		);

		$company_ids = array();

		foreach ( $companies as $company ) {
			$id = $this->insert(
				'sira_company',
				$company['title'],
				$company['excerpt']
			);

			if ( 0 < $id ) {
				$company_ids[ $company['key'] ] = $id;
			}
		}

		$projects = array(
			array(
				'title'    => 'Sira Prime',
				'excerpt'  => 'Flagship villa development with pre-sales underway.',
				'location' => 'Istanbul, Türkiye',
				'status'   => 'Under Development',
				'company'  => 'realestate',
			),
			array(
				'title'    => 'Rosina Diagnostic Center',
				'excerpt'  => 'Advanced imaging and molecular diagnostics platform.',
				'location' => 'Nairobi, Kenya',
				'status'   => 'Operational',
				'company'  => 'healthcare',
			),
			array(
				'title'    => 'Hospitality Platform',
				'excerpt'  => 'Founding-partner opportunity in the group’s lifestyle division.',
				'location' => 'MEA Region',
				'status'   => 'Early Stage',
				'company'  => 'lifestyle',
			),
		);

		foreach ( $projects as $project ) {
			$id = $this->insert(
				'sira_project',
				$project['title'],
				$project['excerpt']
			);

			if ( 0 < $id ) {
				$this->update_project_fields(
					$id,
					$project['location'],
					$project['status'],
					(int) ( $company_ids[ $project['company'] ] ?? 0 )
				);
			}
		}

		$news_items = array(
			array(
				'SIRA GROUP Signs Strategic Partnership with OVAN Group',
				'A joint venture to accelerate residential delivery in Istanbul.',
			),
			array(
				'Rosina Diagnostic Center Adds PET-CT Molecular Imaging Wing',
				'The Nairobi facility expands into early-stage cancer diagnostics.',
			),
			array(
				'SIRA GROUP Expands Portfolio into Hospitality & Lifestyle',
				'SIRA Lifestyle launches as the group’s newest division.',
			),
			array(
				'What We Look for in a Strategic Partner',
				'The criteria SIRA applies before entering a new market or venture.',
			),
		);

		foreach ( $news_items as $news_item ) {
			$this->insert( 'sira_news', $news_item[0], $news_item[1] );
		}

		update_option( 'sira_demo_imported', current_time( 'mysql' ) );

		wp_safe_redirect(
			add_query_arg(
				array(
					'page'     => 'sira-setup',
					'imported' => '1',
				),
				admin_url( 'admin.php' )
			)
		);
		exit;
	}

	private function insert( string $post_type, string $title, string $excerpt ): int {
		$existing = get_page_by_title( $title, OBJECT, $post_type );

		if ( $existing instanceof \WP_Post ) {
			return (int) $existing->ID;
		}

		$post_id = wp_insert_post(
			array(
				'post_type'    => $post_type,
				'post_status'  => 'publish',
				'post_title'   => $title,
				'post_excerpt' => $excerpt,
				'post_content' => $excerpt,
			),
			true
		);

		return is_wp_error( $post_id ) ? 0 : (int) $post_id;
	}

	private function update_project_fields(
		int $post_id,
		string $location,
		string $status,
		int $company_id
	): void {
		if ( function_exists( 'update_field' ) ) {
			update_field( 'field_project_location', $location, $post_id );
			update_field( 'field_project_status', $status, $post_id );

			if ( 0 < $company_id ) {
				update_field(
					'field_project_company',
					array( $company_id ),
					$post_id
				);
			}

			return;
		}

		/*
		 * Use the public ACF field names, not the underscored ACF reference
		 * keys. Once ACF is enabled it can associate these values with the
		 * registered field definitions.
		 */
		update_post_meta( $post_id, 'sira_location', $location );
		update_post_meta( $post_id, 'sira_status', $status );

		if ( 0 < $company_id ) {
			update_post_meta(
				$post_id,
				'sira_related_company',
				array( $company_id )
			);
		}
	}
}

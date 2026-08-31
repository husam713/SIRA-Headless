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

		$front_page_id = $this->front_page_id();

		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'SIRA Starter Setup', 'sira-core' ); ?></h1>
			<p>
				<?php
				esc_html_e(
					'Creates structured starter companies, projects, services, articles, testimonials, partners, investments, and an investor one-pager record — then fills in the Group Homepage fields on your existing static front page so the frontend has something to render. It does not create pages, assign theme templates, download third-party images, or overwrite existing posts.',
					'sira-core'
				);
				?>
			</p>

			<?php if ( isset( $_GET['imported'] ) ) : // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- read-only display flag, no state change. ?>
				<div class="notice notice-success is-dismissible">
					<p><?php esc_html_e( 'Starter content created.', 'sira-core' ); ?></p>
				</div>
			<?php endif; ?>

			<?php if ( 0 >= $front_page_id ) : ?>
				<div class="notice notice-warning">
					<p>
						<?php
						esc_html_e(
							'No static front page is configured (Settings → Reading → “Your homepage displays” → A static page). The starter content will still be created, but the Group Homepage fields cannot be filled in until a front page is set.',
							'sira-core'
						);
						?>
					</p>
				</div>
			<?php endif; ?>

			<p>
				<?php
				esc_html_e(
					'This is placeholder copy for testing the page, not verified business content — replace figures, dates, and quotes with real ones before this goes live to visitors.',
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

		$company_ids     = $this->import_companies();
		$project_ids     = $this->import_projects( $company_ids );
		$news_ids        = $this->import_news();
		$service_ids     = $this->import_services();
		$article_ids     = $this->import_articles();
		$testimonial_ids = $this->import_testimonials();
		$partner_ids     = $this->import_partners();
		$investment_ids  = $this->import_investments( $company_ids, $project_ids );
		$one_pager_id    = $this->import_one_pager();

		$this->populate_homepage(
			$company_ids,
			$project_ids,
			$news_ids,
			$service_ids,
			$article_ids,
			$testimonial_ids,
			$partner_ids,
			$investment_ids,
			$one_pager_id
		);

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

	// ── Companies / Projects / News (unchanged from the original starter kit) ──

	/**
	 * @return array<string,int> Company key => post ID.
	 */
	private function import_companies(): array {
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

		$ids = array();

		foreach ( $companies as $company ) {
			$id = $this->insert( 'sira_company', $company['title'], $company['excerpt'] );

			if ( 0 < $id ) {
				$ids[ $company['key'] ] = $id;
				$this->set_acf( $id, 'field_sira_company_operating_status', 'active' );
				$this->set_acf( $id, 'field_sira_company_short_descriptor', $company['excerpt'] );
			}
		}

		return $ids;
	}

	/**
	 * @param array<string,int> $company_ids Company key => post ID.
	 * @return array<int,int> Numerically indexed project post IDs, in creation order.
	 */
	private function import_projects( array $company_ids ): array {
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

		$ids = array();

		foreach ( $projects as $project ) {
			$id = $this->insert( 'sira_project', $project['title'], $project['excerpt'] );

			if ( 0 < $id ) {
				$ids[] = $id;
				$this->update_project_fields(
					$id,
					$project['location'],
					$project['status'],
					(int) ( $company_ids[ $project['company'] ] ?? 0 )
				);
			}
		}

		return $ids;
	}

	/**
	 * @return array<int,int> News post IDs, in creation order.
	 */
	private function import_news(): array {
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
		);

		$ids = array();

		foreach ( $news_items as $news_item ) {
			$id = $this->insert( 'sira_news', $news_item[0], $news_item[1] );

			if ( 0 < $id ) {
				$ids[] = $id;
			}
		}

		return $ids;
	}

	// ── New starter content: services, articles, testimonials, partners, investments, one-pager ──

	/**
	 * @return array<int,int> Service post IDs. sira_service carries no dedicated
	 *         ACF group (STEP-4-HOMEPAGE-DATA-CONTRACT.md) — title/excerpt only.
	 */
	private function import_services(): array {
		$services = array(
			array(
				'Real Estate Development & Consulting',
				'Full-cycle development and advisory for residential and hospitality projects, from planning through post-development support.',
			),
			array(
				'Medical Investment & Smart Diagnostics',
				'Strategic partnership and operation of advanced diagnostic centers powered by intelligent management systems.',
			),
			array(
				'Hospitality & Energy Ventures',
				'Emerging investments in hospitality and energy infrastructure, extending our footprint into new markets.',
			),
		);

		$ids = array();

		foreach ( $services as $service ) {
			$id = $this->insert( 'sira_service', $service[0], $service[1] );

			if ( 0 < $id ) {
				$ids[] = $id;
			}
		}

		return $ids;
	}

	/**
	 * @return array<int,int> Article post IDs, for the Insights relationship.
	 */
	private function import_articles(): array {
		$articles = array(
			array(
				'Why Istanbul Is Becoming Africa’s Investment Bridge',
				'How geography and policy are turning Turkish capital toward East African healthcare and housing.',
			),
			array(
				'Inside Nairobi’s Diagnostic Imaging Boom',
				'Demand for advanced radiology is reshaping how healthcare investors think about East Africa.',
			),
			array(
				'What We Look for in a Strategic Partner',
				'A look at the criteria SIRA GROUP applies before entering a new market or venture.',
			),
		);

		$ids = array();

		foreach ( $articles as $article ) {
			$id = $this->insert( 'sira_article', $article[0], $article[1] );

			if ( 0 < $id ) {
				$ids[] = $id;
			}
		}

		return $ids;
	}

	/**
	 * @return array<int,int> Testimonial post IDs. Consent Approved is switched
	 *         on so the frontend's public-visibility guard actually shows them —
	 *         see normalize-homepage.ts's consentApproved check.
	 */
	private function import_testimonials(): array {
		$testimonials = array(
			array(
				'name'    => 'Mehmet Aydın',
				'quote'   => 'SIRA GROUP brought European rigor and local insight to every stage of delivery. A rare, dependable development partner.',
				'role'    => 'Managing Director',
				'org'     => 'OVAN Group',
			),
			array(
				'name'    => 'Dr. Amina Njoroge',
				'quote'   => 'Their investment made advanced diagnostics accessible in Nairobi. The impact on patient care has been immediate.',
				'role'    => 'Medical Director',
				'org'     => 'Rosina Diagnostic Center',
			),
		);

		$ids = array();

		foreach ( $testimonials as $testimonial ) {
			$id = $this->insert( 'sira_testimonial', $testimonial['name'], $testimonial['quote'] );

			if ( 0 < $id ) {
				$ids[] = $id;
				$this->set_acf( $id, 'field_sira_testimonial_role', $testimonial['role'] );
				$this->set_acf( $id, 'field_sira_testimonial_organization', $testimonial['org'] );
				$this->set_acf( $id, 'field_sira_testimonial_consent', 1 );
			}
		}

		return $ids;
	}

	/**
	 * @return array<int,int> Partner post IDs. Logo upload is not automated —
	 *         each post is created with no featured image, so it will not
	 *         render on the frontend (GroupPartners skips items with no
	 *         featuredImage) until a logo is attached manually.
	 *
	 *         Only the two named real partners from the design reference are
	 *         created — its third slot was itself an unnamed placeholder
	 *         ("Partner"), so it is not reproduced here. Add a real third
	 *         partner yourself if you have one.
	 */
	private function import_partners(): array {
		$partners = array( 'OVAN Group', 'Rafeef' );
		$ids      = array();

		foreach ( $partners as $partner ) {
			$id = $this->insert( 'sira_partner', $partner, '' );

			if ( 0 < $id ) {
				$ids[] = $id;
			}
		}

		return $ids;
	}

	/**
	 * @param array<string,int> $company_ids Company key => post ID.
	 * @param array<int,int>    $project_ids Project post IDs, in creation order.
	 * @return array<int,int> Investment post IDs. Public Display Approved is
	 *         switched on so the frontend's public-visibility guard shows
	 *         them — see normalize-homepage.ts's publicDisplay check.
	 */
	private function import_investments( array $company_ids, array $project_ids ): array {
		$investments = array(
			array(
				'title'   => 'Sira Prime — Residential',
				'excerpt' => 'Equity participation in a flagship villa development with pre-sales underway.',
				'ticket'  => '$2M – $10M',
				'company' => 'realestate',
				'project' => $project_ids[0] ?? 0,
			),
			array(
				'title'   => 'Diagnostic Network Expansion',
				'excerpt' => 'Scaling a cash-flow-positive diagnostic platform into new East African cities.',
				'ticket'  => '$1M – $5M',
				'company' => 'healthcare',
				'project' => $project_ids[1] ?? 0,
			),
			array(
				'title'   => 'Hospitality Platform',
				'excerpt' => 'Founding-partner opportunity in the group’s newest hospitality division.',
				'ticket'  => 'By invitation',
				'company' => 'lifestyle',
				'project' => $project_ids[2] ?? 0,
			),
		);

		$ids = array();

		foreach ( $investments as $investment ) {
			$id = $this->insert( 'sira_investment', $investment['title'], $investment['excerpt'] );

			if ( 0 < $id ) {
				$ids[] = $id;
				$this->set_acf( $id, 'field_sira_investment_public_display', 1 );
				$this->set_acf( $id, 'field_sira_investment_ticket_size', $investment['ticket'] );

				$company_id = (int) ( $company_ids[ $investment['company'] ] ?? 0 );
				if ( 0 < $company_id ) {
					$this->set_acf( $id, 'field_sira_investment_related_company', array( $company_id ) );
				}

				$project_id = (int) $investment['project'];
				if ( 0 < $project_id ) {
					$this->set_acf( $id, 'field_sira_investment_related_project', array( $project_id ) );
				}
			}
		}

		return $ids;
	}

	/**
	 * @return int The one-pager document post ID, or 0. The file itself is
	 *         not attached here — upload it manually on the post; its ACF
	 *         file field is deliberately excluded from GraphQL regardless
	 *         (see AcfIntegration::register_document_group), so the frontend
	 *         only ever reads this post's title.
	 */
	private function import_one_pager(): int {
		$id = $this->insert( 'sira_document', 'SIRA GROUP Investor One-Pager', '' );

		if ( 0 < $id ) {
			$this->set_acf( $id, 'field_doc_version', '1.0' );
			$this->set_acf( $id, 'field_doc_date', gmdate( 'Y-m-d' ) );
		}

		return $id;
	}

	// ── Group Homepage fields ──

	/**
	 * @param array<string,int> $company_ids     Company key => post ID.
	 * @param array<int,int>    $project_ids     Project post IDs.
	 * @param array<int,int>    $news_ids        News post IDs.
	 * @param array<int,int>    $service_ids     Service post IDs.
	 * @param array<int,int>    $article_ids     Article post IDs.
	 * @param array<int,int>    $testimonial_ids Testimonial post IDs.
	 * @param array<int,int>    $partner_ids     Partner post IDs.
	 * @param array<int,int>    $investment_ids  Investment post IDs.
	 * @param int                $one_pager_id    One-pager document post ID.
	 */
	private function populate_homepage(
		array $company_ids,
		array $project_ids,
		array $news_ids,
		array $service_ids,
		array $article_ids,
		array $testimonial_ids,
		array $partner_ids,
		array $investment_ids,
		int $one_pager_id
	): void {
		if ( ! function_exists( 'update_field' ) ) {
			return;
		}

		$front_page_id = $this->front_page_id();

		if ( 0 >= $front_page_id ) {
			return;
		}

		$page_id = $front_page_id;

		$this->set_acf( $page_id, 'field_sira_homepage_variant', 'group' );

		// Hero.
		$this->set_acf( $page_id, 'field_sira_group_hero_heading_before', 'Shaping a ' );
		$this->set_acf( $page_id, 'field_sira_group_hero_heading_highlight', 'Smarter' );
		$this->set_acf( $page_id, 'field_sira_group_hero_heading_after', ' Future' );
		$this->set_acf(
			$page_id,
			'field_sira_group_hero_description',
			'A multinational investment and development group building smart, sustainable ventures across real estate, healthcare and lifestyle in Africa, Europe and the Middle East.'
		);
		$this->set_acf( $page_id, 'field_sira_group_hero_primary_cta', $this->link( 'Explore Our Projects', '/#projects' ) );
		$this->set_acf( $page_id, 'field_sira_group_hero_secondary_cta', $this->link( 'Discuss Partnership', '/#contact' ) );

		$real_estate_term = $this->business_unit_term_id( 'real-estate', 'Real Estate' );
		$healthcare_term  = $this->business_unit_term_id( 'healthcare', 'Healthcare' );
		$lifestyle_term   = $this->business_unit_term_id( 'lifestyle', 'Lifestyle' );

		$this->set_acf(
			$page_id,
			'field_sira_group_hero_slides',
			array(
				array(
					'related_project'      => 0 < ( $project_ids[0] ?? 0 ) ? array( $project_ids[0] ) : array(),
					'related_company'      => 0 < ( $company_ids['realestate'] ?? 0 ) ? array( $company_ids['realestate'] ) : array(),
					'image_override'       => '',
					'mobile_image_override' => '',
					'business_unit'        => $real_estate_term,
					'eyebrow_override'     => 'SIRA REAL ESTATE',
					'location_override'    => 'ISTANBUL, TÜRKIYE',
					'title_override'       => 'Sira Prime',
					'description_override' => '',
					'primary_cta_override' => array(),
					'secondary_cta_override' => array(),
					'image_alt_override'   => 'Sira Prime',
				),
				array(
					'related_project'      => 0 < ( $project_ids[1] ?? 0 ) ? array( $project_ids[1] ) : array(),
					'related_company'      => 0 < ( $company_ids['healthcare'] ?? 0 ) ? array( $company_ids['healthcare'] ) : array(),
					'image_override'       => '',
					'mobile_image_override' => '',
					'business_unit'        => $healthcare_term,
					'eyebrow_override'     => 'SIRA HEALTHCARE',
					'location_override'    => 'NAIROBI, KENYA',
					'title_override'       => 'Rosina Diagnostic Center',
					'description_override' => '',
					'primary_cta_override' => array(),
					'secondary_cta_override' => array(),
					'image_alt_override'   => 'Rosina Diagnostic Center',
				),
				array(
					'related_project'      => 0 < ( $project_ids[2] ?? 0 ) ? array( $project_ids[2] ) : array(),
					'related_company'      => 0 < ( $company_ids['lifestyle'] ?? 0 ) ? array( $company_ids['lifestyle'] ) : array(),
					'image_override'       => '',
					'mobile_image_override' => '',
					'business_unit'        => $lifestyle_term,
					'eyebrow_override'     => 'SIRA LIFESTYLE',
					'location_override'    => 'COMING SOON',
					'title_override'       => 'Hospitality Ventures',
					'description_override' => '',
					'primary_cta_override' => array(),
					'secondary_cta_override' => array(),
					'image_alt_override'   => 'Hospitality Ventures',
				),
			)
		);
		// No image_override/mobile_image_override set above: uploading media
		// isn't automated here, so hero slides render their solid-color
		// fallback background until a real photo is attached to each row.

		// Ticker.
		$this->set_acf( $page_id, 'field_sira_group_ticker_enabled', 1 );
		$this->set_acf(
			$page_id,
			'field_sira_group_ticker_items',
			array(
				array( 'label' => 'Real Estate — Istanbul', 'link' => array(), 'business_unit' => $real_estate_term ),
				array( 'label' => 'Healthcare — Nairobi', 'link' => array(), 'business_unit' => $healthcare_term ),
				array( 'label' => 'Lifestyle — MEA', 'link' => array(), 'business_unit' => $lifestyle_term ),
				array( 'label' => 'Consulting — Advisory', 'link' => array(), 'business_unit' => $this->business_unit_term_id( 'consulting', 'Consulting' ) ),
				array( 'label' => 'Istanbul · Paris HQ', 'link' => array(), 'business_unit' => 0 ),
			)
		);

		// Latest Updates (section header only — the news items are related here).
		$this->set_acf( $page_id, 'field_sira_group_latest_updates_eyebrow', 'Latest Updates' );
		$this->set_acf( $page_id, 'field_sira_latest_updates_source_mode', 'curated' );
		$this->set_acf( $page_id, 'field_sira_latest_updates_items', $news_ids );
		$this->set_acf( $page_id, 'field_sira_latest_updates_limit', 3 );

		// Companies.
		$this->set_acf( $page_id, 'field_sira_companies_eyebrow', 'Our Companies' );
		$this->set_acf( $page_id, 'field_sira_companies_heading', 'One Group, a Growing Portfolio of Companies' );
		$this->set_acf(
			$page_id,
			'field_sira_companies_description',
			'SIRA GROUP operates as a house of specialized companies, each focused on a distinct market — with new divisions launching as the group expands.'
		);
		$this->set_acf( $page_id, 'field_sira_companies_items', array_values( $company_ids ) );

		// About.
		$this->set_acf( $page_id, 'field_sira_about_eyebrow', 'About SIRA GROUP' );
		$this->set_acf( $page_id, 'field_sira_about_heading', 'Bridging Continents Through Smart Investment' );
		$this->set_acf(
			$page_id,
			'field_sira_about_description',
			'Headquartered between Istanbul and Paris, SIRA GROUP invests in and operates ventures across real estate, healthcare, hospitality and energy — building infrastructure for the next generation of growth in Africa and the Middle East.'
		);
		$this->set_acf(
			$page_id,
			'field_sira_group_about_metrics',
			array(
				array( 'value' => '10+', 'label' => 'Years of Experience', 'supporting_text' => '' ),
				array( 'value' => '5+', 'label' => 'Countries', 'supporting_text' => '' ),
				array( 'value' => '20+', 'label' => 'Projects Delivered', 'supporting_text' => '' ),
				array( 'value' => '4', 'label' => 'Strategic Partners', 'supporting_text' => '' ),
			)
		);

		// Investor Relations.
		$this->set_acf( $page_id, 'field_sira_investor_eyebrow', 'Investor Relations' );
		$this->set_acf( $page_id, 'field_sira_investor_heading', 'Invest Alongside SIRA GROUP' );
		$this->set_acf(
			$page_id,
			'field_sira_investor_description',
			'We partner with institutional and private investors seeking exposure to high-growth real estate and healthcare across Africa, Europe and the Middle East.'
		);
		$this->set_acf(
			$page_id,
			'field_sira_group_investor_metrics',
			array(
				array( 'value' => '$120M+', 'label' => 'Assets Under Development', 'supporting_text' => '+18% YoY' ),
				array( 'value' => '14–18%', 'label' => 'Projected IRR', 'supporting_text' => 'Target' ),
				array( 'value' => '30K+', 'label' => 'Annual Patient Scans', 'supporting_text' => '+42% YoY' ),
				array( 'value' => '5+', 'label' => 'Markets Across 3 Continents', 'supporting_text' => 'Active' ),
			)
		);
		$this->set_acf( $page_id, 'field_sira_group_investor_items', $investment_ids );
		$this->set_acf( $page_id, 'field_sira_group_investor_one_pager', 0 < $one_pager_id ? array( $one_pager_id ) : array() );
		$this->set_acf( $page_id, 'field_sira_group_investor_form_heading', 'Request the Investor Pack' );
		$this->set_acf(
			$page_id,
			'field_sira_group_investor_form_description',
			'Tell us a little about your mandate and we’ll share our deck and arrange an introductory call.'
		);

		// Services.
		$this->set_acf( $page_id, 'field_sira_services_eyebrow', 'What We Do' );
		$this->set_acf( $page_id, 'field_sira_services_heading', 'Our Core Services' );
		$this->set_acf( $page_id, 'field_sira_services_items', $service_ids );

		// Projects.
		$this->set_acf( $page_id, 'field_sira_projects_eyebrow', 'Global Footprint' );
		$this->set_acf( $page_id, 'field_sira_projects_heading', 'Our Projects' );
		$this->set_acf( $page_id, 'field_sira_projects_items', $project_ids );

		// Insights.
		$this->set_acf( $page_id, 'field_sira_group_insights_eyebrow', 'News & Perspectives' );
		$this->set_acf( $page_id, 'field_sira_group_insights_heading', 'Insights' );
		$this->set_acf( $page_id, 'field_sira_insights_source_mode', 'curated' );
		$this->set_acf( $page_id, 'field_sira_insights_items', $article_ids );
		$this->set_acf( $page_id, 'field_sira_insights_limit', 3 );

		// Testimonials.
		$this->set_acf( $page_id, 'field_sira_testimonials_eyebrow', 'In Their Words' );
		$this->set_acf( $page_id, 'field_sira_testimonials_heading', 'Trusted by Partners Across Our Markets' );
		$this->set_acf( $page_id, 'field_sira_testimonials_items', $testimonial_ids );

		// Partners.
		$this->set_acf( $page_id, 'field_sira_partners_eyebrow', 'Our Partners' );
		$this->set_acf( $page_id, 'field_sira_partners_heading', 'Strategic Partners' );
		$this->set_acf(
			$page_id,
			'field_sira_partners_description',
			'We believe that strong partnerships are the foundation of sustainable growth.'
		);
		$this->set_acf( $page_id, 'field_sira_partners_items', $partner_ids );

		// Contact.
		$this->set_acf( $page_id, 'field_sira_group_contact_eyebrow', 'Partnership' );
		$this->set_acf( $page_id, 'field_sira_group_contact_heading', 'Ready to Partner With Us?' );
		$this->set_acf(
			$page_id,
			'field_sira_group_contact_description',
			'We welcome investment inquiries, partnership opportunities, and professional collaboration across our markets.'
		);
		$this->set_acf( $page_id, 'field_sira_group_contact_form_variant', 'partnership' );
	}

	// ── Shared helpers ──

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

	/**
	 * Thin wrapper over ACF's update_field(), addressed by field KEY (not
	 * name) so it works regardless of the field's position inside a group —
	 * same pattern as the existing update_project_fields() above. A no-op
	 * when ACF isn't active, matching the "must continue to boot when
	 * optional integrations are unavailable" rule in backend/README.md.
	 *
	 * @param mixed $value Value.
	 */
	private function set_acf( int $post_id, string $field_key, $value ): void {
		if ( ! function_exists( 'update_field' ) ) {
			return;
		}

		update_field( $field_key, $value, $post_id );
	}

	/**
	 * @return array{title:string,url:string,target:string} ACF link-field shape.
	 */
	private function link( string $label, string $url ): array {
		return array(
			'title'  => $label,
			'url'    => $url,
			'target' => '',
		);
	}

	/**
	 * Look up a sira_business_unit term by slug, creating it if the taxonomy
	 * is registered but the term doesn't exist yet. Returns 0 (rather than
	 * failing) if the taxonomy itself isn't registered — the frontend
	 * already falls back to the Group accent color when no business unit
	 * resolves, so this is a safe degrade, not a hard requirement.
	 */
	private function business_unit_term_id( string $slug, string $name ): int {
		if ( ! taxonomy_exists( 'sira_business_unit' ) ) {
			return 0;
		}

		$term = get_term_by( 'slug', $slug, 'sira_business_unit' );

		if ( $term instanceof \WP_Term ) {
			return (int) $term->term_id;
		}

		$created = wp_insert_term( $name, 'sira_business_unit', array( 'slug' => $slug ) );

		return is_wp_error( $created ) ? 0 : (int) $created['term_id'];
	}

	/**
	 * The post ID of the site's configured static front page, or 0 if
	 * "Settings → Reading" isn't set to a static page. This is the only
	 * location the `group_sira_homepage` ACF field group attaches to
	 * (see PresentationFields::homepage_group()) — this importer does not
	 * create or assign a front page itself.
	 */
	private function front_page_id(): int {
		if ( 'page' !== get_option( 'show_on_front' ) ) {
			return 0;
		}

		return (int) get_option( 'page_on_front' );
	}
}

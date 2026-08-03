<?php
/**
 * Declarative enterprise content types.
 */

declare(strict_types=1);

namespace Sira\Core\Content;

final class PostTypes {
	public function hooks(): void {
		add_action( 'init', array( $this, 'register' ), 6 );
		add_action( 'admin_menu', array( $this, 'admin_menu' ), 5 );
	}

	public function admin_menu(): void {
		add_menu_page(
			__( 'SIRA Content', 'sira-core' ),
			__( 'SIRA Content', 'sira-core' ),
			'edit_posts',
			'sira-content',
			static function (): void {
				wp_safe_redirect( admin_url( 'edit.php?post_type=sira_company' ) );
				exit;
			},
			'dashicons-building',
			20
		);
	}

	/** @return array<string,array<string,mixed>> */
	public static function definitions(): array {
		return array(
			'sira_company' => array(
				'singular'            => 'Company',
				'plural'              => 'Companies',
				'slug'                => 'companies',
				'icon'                => 'dashicons-building',
				'supports'            => array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'page-attributes' ),
				'graphql_single_name' => 'SiraCompany',
				'graphql_plural_name' => 'SiraCompanies',
			),
			'sira_project' => array(
				'singular'            => 'Project',
				'plural'              => 'Projects',
				'slug'                => 'projects',
				'icon'                => 'dashicons-portfolio',
				'graphql_single_name' => 'SiraProject',
				'graphql_plural_name' => 'SiraProjects',
			),
			'sira_investment' => array(
				'singular'            => 'Investment',
				'plural'              => 'Investments',
				'slug'                => 'investments',
				'icon'                => 'dashicons-chart-line',
				'graphql_single_name' => 'SiraInvestment',
				'graphql_plural_name' => 'SiraInvestments',
			),
			'sira_portfolio' => array(
				'singular'            => 'Portfolio Item',
				'plural'              => 'Portfolio',
				'slug'                => 'portfolio',
				'icon'                => 'dashicons-grid-view',
				'graphql_single_name' => 'SiraPortfolioItem',
				'graphql_plural_name' => 'SiraPortfolioItems',
			),
			'sira_news' => array(
				'singular'            => 'News Item',
				'plural'              => 'News',
				'slug'                => 'news',
				'icon'                => 'dashicons-megaphone',
				'graphql_single_name' => 'SiraNewsItem',
				'graphql_plural_name' => 'SiraNewsItems',
			),
			'sira_insight' => array(
				'singular'            => 'Insight',
				'plural'              => 'Insights',
				'slug'                => 'insights',
				'icon'                => 'dashicons-lightbulb',
				'graphql_single_name' => 'SiraInsight',
				'graphql_plural_name' => 'SiraInsights',
			),
			'sira_article' => array(
				'singular'            => 'Article',
				'plural'              => 'Articles',
				'slug'                => 'articles',
				'icon'                => 'dashicons-media-document',
				'graphql_single_name' => 'SiraArticle',
				'graphql_plural_name' => 'SiraArticles',
			),
			'sira_event' => array(
				'singular'            => 'Event',
				'plural'              => 'Events',
				'slug'                => 'events',
				'icon'                => 'dashicons-calendar-alt',
				'graphql_single_name' => 'SiraEvent',
				'graphql_plural_name' => 'SiraEvents',
			),
			'sira_leadership' => array(
				'singular'            => 'Leader',
				'plural'              => 'Leadership',
				'slug'                => 'leadership',
				'icon'                => 'dashicons-groups',
				'supports'            => array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'page-attributes' ),
				'graphql_single_name' => 'SiraLeadershipProfile',
				'graphql_plural_name' => 'SiraLeadershipProfiles',
			),
			'sira_executive' => array(
				'singular'            => 'Executive',
				'plural'              => 'Executives',
				'slug'                => 'executives',
				'icon'                => 'dashicons-businessperson',
				'graphql_single_name' => 'SiraExecutive',
				'graphql_plural_name' => 'SiraExecutives',
			),
			'sira_board_member' => array(
				'singular'            => 'Board Member',
				'plural'              => 'Board Members',
				'slug'                => 'board',
				'icon'                => 'dashicons-groups',
				'graphql_single_name' => 'SiraBoardMember',
				'graphql_plural_name' => 'SiraBoardMembers',
			),
			'sira_partner' => array(
				'singular'            => 'Partner',
				'plural'              => 'Partners',
				'slug'                => 'partners',
				'icon'                => 'dashicons-networking',
				'graphql_single_name' => 'SiraPartner',
				'graphql_plural_name' => 'SiraPartners',
			),
			'sira_investor' => array(
				'singular'            => 'Investor',
				'plural'              => 'Investors',
				'slug'                => 'investors',
				'icon'                => 'dashicons-money-alt',
				'graphql_single_name' => 'SiraInvestor',
				'graphql_plural_name' => 'SiraInvestors',
				'publicly_queryable'  => false,
				'has_archive'         => false,
			),
			'sira_download' => array(
				'singular'            => 'Download',
				'plural'              => 'Downloads',
				'slug'                => 'downloads',
				'icon'                => 'dashicons-download',
				'graphql_single_name' => 'SiraDownload',
				'graphql_plural_name' => 'SiraDownloads',
			),
			'sira_media_item' => array(
				'singular'            => 'Media Item',
				'plural'              => 'Media Library',
				'slug'                => 'media',
				'icon'                => 'dashicons-format-image',
				'graphql_single_name' => 'SiraMediaItem',
				'graphql_plural_name' => 'SiraMediaItems',
			),
			'sira_case_study' => array(
				'singular'            => 'Case Study',
				'plural'              => 'Case Studies',
				'slug'                => 'case-studies',
				'icon'                => 'dashicons-analytics',
				'graphql_single_name' => 'SiraCaseStudy',
				'graphql_plural_name' => 'SiraCaseStudies',
			),
			'sira_service' => array(
				'singular'            => 'Service',
				'plural'              => 'Services',
				'slug'                => 'services',
				'icon'                => 'dashicons-admin-tools',
				'graphql_single_name' => 'SiraService',
				'graphql_plural_name' => 'SiraServices',
			),
			'sira_office' => array(
				'singular'            => 'Office',
				'plural'              => 'Offices',
				'slug'                => 'offices',
				'icon'                => 'dashicons-location-alt',
				'graphql_single_name' => 'SiraOffice',
				'graphql_plural_name' => 'SiraOffices',
			),
			'sira_testimonial' => array(
				'singular'            => 'Testimonial',
				'plural'              => 'Testimonials',
				'slug'                => 'testimonials',
				'icon'                => 'dashicons-format-quote',
				'graphql_single_name' => 'SiraTestimonial',
				'graphql_plural_name' => 'SiraTestimonials',
			),
			'sira_career' => array(
				'singular'            => 'Career Area',
				'plural'              => 'Careers',
				'slug'                => 'careers',
				'icon'                => 'dashicons-id',
				'graphql_single_name' => 'SiraCareerArea',
				'graphql_plural_name' => 'SiraCareerAreas',
			),
			'sira_job' => array(
				'singular'            => 'Job',
				'plural'              => 'Jobs',
				'slug'                => 'jobs',
				'icon'                => 'dashicons-clipboard',
				'graphql_single_name' => 'SiraJob',
				'graphql_plural_name' => 'SiraJobs',
			),
			'sira_csr' => array(
				'singular'            => 'CSR Initiative',
				'plural'              => 'CSR',
				'slug'                => 'csr',
				'icon'                => 'dashicons-heart',
				'graphql_single_name' => 'SiraCsrInitiative',
				'graphql_plural_name' => 'SiraCsrInitiatives',
			),
			'sira_award' => array(
				'singular'            => 'Award',
				'plural'              => 'Awards',
				'slug'                => 'awards',
				'icon'                => 'dashicons-awards',
				'graphql_single_name' => 'SiraAward',
				'graphql_plural_name' => 'SiraAwards',
			),
			'sira_faq' => array(
				'singular'            => 'FAQ',
				'plural'              => 'FAQs',
				'slug'                => 'faqs',
				'icon'                => 'dashicons-editor-help',
				'graphql_single_name' => 'SiraFaq',
				'graphql_plural_name' => 'SiraFaqs',
			),
			'sira_resource' => array(
				'singular'            => 'Resource',
				'plural'              => 'Resources',
				'slug'                => 'resources',
				'icon'                => 'dashicons-book-alt',
				'graphql_single_name' => 'SiraResource',
				'graphql_plural_name' => 'SiraResources',
			),
			'sira_document' => array(
				'singular'            => 'Document',
				'plural'              => 'Documents',
				'slug'                => 'documents',
				'icon'                => 'dashicons-media-text',
				'graphql_single_name' => 'SiraDocument',
				'graphql_plural_name' => 'SiraDocuments',
			),
			'sira_press_release' => array(
				'singular'            => 'Press Release',
				'plural'              => 'Press Releases',
				'slug'                => 'press-releases',
				'icon'                => 'dashicons-media-default',
				'graphql_single_name' => 'SiraPressRelease',
				'graphql_plural_name' => 'SiraPressReleases',
			),
			'sira_whitepaper' => array(
				'singular'            => 'Whitepaper',
				'plural'              => 'Whitepapers',
				'slug'                => 'whitepapers',
				'icon'                => 'dashicons-welcome-write-blog',
				'graphql_single_name' => 'SiraWhitepaper',
				'graphql_plural_name' => 'SiraWhitepapers',
			),
		);
	}

	public function register(): void {
		$definitions = apply_filters( 'sira_post_type_definitions', self::definitions() );

		foreach ( $definitions as $post_type => $config ) {
			$singular            = (string) $config['singular'];
			$plural              = (string) $config['plural'];
			$supports            = $config['supports'] ?? array( 'title', 'editor', 'excerpt', 'thumbnail', 'revisions', 'author' );
			$publicly_queryable  = (bool) ( $config['publicly_queryable'] ?? true );
			$exclude_from_search = (bool) ( $config['exclude_from_search'] ?? ! $publicly_queryable );
			$show_in_nav_menus   = (bool) ( $config['show_in_nav_menus'] ?? $publicly_queryable );

			register_post_type(
				$post_type,
				array(
					'labels' => array(
						'name'          => __( $plural, 'sira-core' ),
						'singular_name' => __( $singular, 'sira-core' ),
						'add_new_item'  => sprintf( __( 'Add New %s', 'sira-core' ), $singular ),
						'edit_item'     => sprintf( __( 'Edit %s', 'sira-core' ), $singular ),
						'view_item'     => sprintf( __( 'View %s', 'sira-core' ), $singular ),
						'search_items'  => sprintf( __( 'Search %s', 'sira-core' ), $plural ),
					),
					'public'                => true,
					'publicly_queryable'    => $publicly_queryable,
					'exclude_from_search'   => $exclude_from_search,
					'show_in_nav_menus'     => $show_in_nav_menus,
					'show_in_rest'          => true,
					'show_in_graphql'       => true,
					'graphql_single_name'   => (string) $config['graphql_single_name'],
					'graphql_plural_name'   => (string) $config['graphql_plural_name'],
					'has_archive'           => $config['has_archive'] ?? true,
					'rewrite'               => array(
						'slug'       => (string) $config['slug'],
						'with_front' => false,
					),
					'menu_icon'             => (string) ( $config['icon'] ?? 'dashicons-admin-post' ),
					'show_in_menu'          => 'sira-content',
					'supports'              => $supports,
					'map_meta_cap'          => true,
					'menu_position'         => 20,
					'template'              => array(),
				)
			);
		}
	}
}

<?php
/**
 * Shared enterprise taxonomies.
 */

declare(strict_types=1);

namespace Sira\Core\Content;

final class Taxonomies {
	public function hooks(): void {
		add_action( 'init', array( $this, 'register' ), 7 );
	}

	/**
	 * Return the SIRA taxonomy registration definitions.
	 *
	 * @return array<string,array<string,mixed>>
	 */
	public static function definitions(): array {
		return array(
			'sira_industry' => array(
				'singular'             => 'Industry',
				'plural'               => 'Industries',
				'slug'                 => 'industry',
				'types'                => array(
					'sira_company',
					'sira_project',
					'sira_investment',
					'sira_case_study',
				),
				'graphql_single_name'  => 'SiraIndustry',
				'graphql_plural_name'  => 'SiraIndustries',
			),
			'sira_country' => array(
				'singular'             => 'Country',
				'plural'               => 'Countries',
				'slug'                 => 'country',
				'types'                => array(
					'sira_company',
					'sira_project',
					'sira_investment',
					'sira_office',
					'sira_event',
				),
				'graphql_single_name'  => 'SiraCountry',
				'graphql_plural_name'  => 'SiraCountries',
			),
			'sira_business_unit' => array(
				'singular'             => 'Business Unit',
				'plural'               => 'Business Units',
				'slug'                 => 'business-unit',
				'types'                => array(
					'sira_company',
					'sira_project',
					'sira_news',
					'sira_insight',
					'sira_article',
					'sira_service',
					'sira_job',
					'sira_press_release',
				),
				'graphql_single_name'  => 'SiraBusinessUnit',
				'graphql_plural_name'  => 'SiraBusinessUnits',
			),
			'sira_investment_stage' => array(
				'singular'             => 'Investment Stage',
				'plural'               => 'Investment Stages',
				'slug'                 => 'investment-stage',
				'types'                => array(
					'sira_investment',
					'sira_portfolio',
				),
				'graphql_single_name'  => 'SiraInvestmentStage',
				'graphql_plural_name'  => 'SiraInvestmentStages',
			),
			'sira_sector' => array(
				'singular'             => 'Sector',
				'plural'               => 'Sectors',
				'slug'                 => 'sector',
				'types'                => array(
					'sira_project',
					'sira_investment',
					'sira_portfolio',
					'sira_insight',
				),
				'graphql_single_name'  => 'SiraSector',
				'graphql_plural_name'  => 'SiraSectors',
			),
			'sira_project_status' => array(
				'singular'             => 'Project Status',
				'plural'               => 'Project Statuses',
				'slug'                 => 'project-status',
				'types'                => array(
					'sira_project',
				),
				'graphql_single_name'  => 'SiraProjectStatus',
				'graphql_plural_name'  => 'SiraProjectStatuses',
			),
			'sira_office_region' => array(
				'singular'             => 'Office Region',
				'plural'               => 'Office Regions',
				'slug'                 => 'office-region',
				'types'                => array(
					'sira_office',
				),
				'graphql_single_name'  => 'SiraOfficeRegion',
				'graphql_plural_name'  => 'SiraOfficeRegions',
			),
			'sira_department' => array(
				'singular'             => 'Department',
				'plural'               => 'Departments',
				'slug'                 => 'department',
				'types'                => array(
					'sira_job',
					'sira_career',
					'sira_leadership',
					'sira_executive',
				),
				'graphql_single_name'  => 'SiraDepartment',
				'graphql_plural_name'  => 'SiraDepartments',
			),
			'sira_region' => array(
				'singular'             => 'Region',
				'plural'               => 'Regions',
				'slug'                 => 'region',
				'types'                => array(
					'sira_company',
					'sira_project',
					'sira_investment',
					'sira_event',
					'sira_office',
				),
				'graphql_single_name'  => 'SiraRegion',
				'graphql_plural_name'  => 'SiraRegions',
			),
			'sira_resource_category' => array(
				'singular'             => 'Resource Category',
				'plural'               => 'Resource Categories',
				'slug'                 => 'resource-category',
				'types'                => array(
					'sira_download',
					'sira_document',
					'sira_whitepaper',
					'sira_resource',
				),
				'graphql_single_name'  => 'SiraResourceCategory',
				'graphql_plural_name'  => 'SiraResourceCategories',
			),
		);
	}

	public function register(): void {
		$definitions = apply_filters( 'sira_taxonomy_definitions', self::definitions() );

		foreach ( $definitions as $taxonomy => $config ) {
			register_taxonomy(
				$taxonomy,
				(array) $config['types'],
				array(
					'labels'               => array(
						'name'          => __( (string) $config['plural'], 'sira-core' ),
						'singular_name' => __( (string) $config['singular'], 'sira-core' ),
					),
					'public'               => true,
					'hierarchical'         => true,
					'show_in_rest'         => true,
					'show_in_graphql'      => true,
					'graphql_single_name'  => (string) $config['graphql_single_name'],
					'graphql_plural_name'  => (string) $config['graphql_plural_name'],
					'show_admin_column'    => true,
					'rewrite'              => array(
						'slug'       => (string) $config['slug'],
						'with_front' => false,
					),
				)
			);
		}
	}
}

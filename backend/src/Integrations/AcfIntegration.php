<?php
/**
 * Optional ACF Pro integration, version-controlled in PHP.
 */

declare(strict_types=1);

namespace Sira\Core\Integrations;

final class AcfIntegration {
	public function hooks(): void {
		add_action( 'acf/init', array( $this, 'register' ) );
	}

	public function register(): void {
		if (
			! function_exists( 'acf_add_options_page' )
			|| ! function_exists( 'acf_add_local_field_group' )
		) {
			return;
		}

		acf_add_options_page(
			array(
				'page_title'      => 'SIRA Global Options',
				'menu_title'      => 'SIRA Options',
				'menu_slug'       => 'sira-acf-options',
				'capability'      => 'manage_options',
				'redirect'        => false,
				'position'        => 59,
				/*
				 * Brand options are intentionally not exposed as a generic
				 * ACF options-page query. Step 1D exposes a curated siraBrand
				 * field containing only approved public values.
				 */
				'show_in_graphql' => false,
			)
		);

		$this->register_brand_group();
		$this->register_content_groups();
	}

	private function register_brand_group(): void {
		acf_add_local_field_group(
			array(
				'key'             => 'group_sira_brand',
				'title'           => 'SIRA Brand & Global Contacts',
				/*
				 * Do not expose raw options directly. BrandManager applies
				 * multisite precedence and Step 1D will expose a curated,
				 * typed public schema.
				 */
				'show_in_graphql' => false,
				'fields'          => array_merge(
					array(
					array(
						'key'   => 'field_sira_brand_name',
						'label' => 'Brand Name',
						'name'  => 'sira_brand_name',
						'type'  => 'text',
					),
					array(
						'key'     => 'field_sira_brand_key',
						'label'   => 'Brand Key',
						'name'    => 'sira_brand_key',
						'type'    => 'select',
						'choices' => array(
							'group'      => 'Group',
							'realestate' => 'Real Estate',
							'healthcare' => 'Healthcare',
							'lifestyle'  => 'Lifestyle',
							'consulting' => 'Consulting',
						),
					),
					array(
						'key'           => 'field_sira_brand_logo',
						'label'         => 'Logo',
						'name'          => 'sira_brand_logo',
						'type'          => 'image',
						'return_format' => 'array',
						'preview_size'  => 'medium',
					),
					array(
						'key'           => 'field_sira_brand_mark',
						'label'         => 'Brand Mark',
						'name'          => 'sira_brand_mark',
						'type'          => 'image',
						'return_format' => 'array',
						'preview_size'  => 'thumbnail',
					),
					array(
						'key'   => 'field_sira_primary_color',
						'label' => 'Primary Color',
						'name'  => 'sira_primary_color',
						'type'  => 'color_picker',
					),
					array(
						'key'   => 'field_sira_secondary_color',
						'label' => 'Secondary Color',
						'name'  => 'sira_secondary_color',
						'type'  => 'color_picker',
					),
					array(
						'key'   => 'field_sira_accent_color',
						'label' => 'Accent Color',
						'name'  => 'sira_accent_color',
						'type'  => 'color_picker',
					),
					array(
						'key'   => 'field_sira_brand_email',
						'label' => 'Email',
						'name'  => 'sira_brand_email',
						'type'  => 'email',
					),
					array(
						'key'   => 'field_sira_brand_phone',
						'label' => 'Phone',
						'name'  => 'sira_brand_phone',
						'type'  => 'text',
					),
					array(
						'key'   => 'field_sira_brand_address',
						'label' => 'Address',
						'name'  => 'sira_brand_address',
						'type'  => 'textarea',
						'rows'  => 3,
					),
					array(
						'key'          => 'field_sira_brand_description',
						'label'        => 'Description',
						'name'         => 'sira_brand_description',
						'type'         => 'wysiwyg',
						'tabs'         => 'visual',
						'toolbar'      => 'basic',
						'media_upload' => false,
					),
					array(
						'key'   => 'field_sira_brand_mission',
						'label' => 'Mission',
						'name'  => 'sira_brand_mission',
						'type'  => 'textarea',
					),
					array(
						'key'   => 'field_sira_brand_vision',
						'label' => 'Vision',
						'name'  => 'sira_brand_vision',
						'type'  => 'textarea',
					),
					array(
						'key'          => 'field_sira_brand_values',
						'label'        => 'Values',
						'name'         => 'sira_brand_values',
						'type'         => 'repeater',
						'layout'       => 'table',
						'button_label' => 'Add value',
						'sub_fields'   => array(
							array(
								'key'   => 'field_sira_value_title',
								'label' => 'Value',
								'name'  => 'title',
								'type'  => 'text',
							),
							array(
								'key'   => 'field_sira_value_copy',
								'label' => 'Description',
								'name'  => 'copy',
								'type'  => 'textarea',
								'rows'  => 2,
							),
						),
					),
					array(
						'key'          => 'field_sira_office_locations',
						'label'        => 'Office Locations',
						'name'         => 'sira_office_locations',
						'type'         => 'repeater',
						'layout'       => 'block',
						'button_label' => 'Add office',
						'sub_fields'   => array(
							array(
								'key'   => 'field_sira_office_name',
								'label' => 'Office',
								'name'  => 'name',
								'type'  => 'text',
							),
							array(
								'key'   => 'field_sira_office_address',
								'label' => 'Address',
								'name'  => 'address',
								'type'  => 'textarea',
								'rows'  => 2,
							),
							array(
								'key'   => 'field_sira_office_phone',
								'label' => 'Phone',
								'name'  => 'phone',
								'type'  => 'text',
							),
							array(
								'key'   => 'field_sira_office_email',
								'label' => 'Email',
								'name'  => 'email',
								'type'  => 'email',
							),
						),
					),
					),
					BrandBannerFields::definitions()
				),
				'location'        => array(
					array(
						array(
							'param'    => 'options_page',
							'operator' => '==',
							'value'    => 'sira-acf-options',
						),
					),
				),
				'active'          => true,
			)
		);
	}

	private function register_content_groups(): void {
		$this->register_project_group();
		$this->register_people_group();
		$this->register_document_group();
		( new PresentationFields() )->register();
	}

	private function register_project_group(): void {
		acf_add_local_field_group(
			array(
				'key'                                  => 'group_sira_project',
				'title'                                => 'Project Details',
				'show_in_graphql'                      => true,
				'graphql_field_name'                   => 'projectDetails',
				'graphql_type_name'                    => 'SiraProjectDetails',
				'map_graphql_types_from_location_rules' => false,
				'graphql_types'                        => array( 'SiraProject' ),
				'fields'                               => array(
					array(
						'key'                 => 'field_project_subtitle',
						'label'               => 'Subtitle',
						'name'                => 'sira_subtitle',
						'type'                => 'text',
						'show_in_graphql'     => true,
						'graphql_field_name'  => 'subtitle',
						'graphql_description' => 'A concise public subtitle for the project.',
					),
					array(
						'key'                 => 'field_project_location',
						'label'               => 'Location',
						'name'                => 'sira_location',
						'type'                => 'text',
						'show_in_graphql'     => true,
						'graphql_field_name'  => 'location',
						'graphql_description' => 'The approved public location label for the project.',
					),
					array(
						'key'                 => 'field_project_status',
						'label'               => 'Status',
						'name'                => 'sira_status',
						'type'                => 'text',
						'show_in_graphql'     => true,
						'graphql_field_name'  => 'status',
						'graphql_description' => 'The approved public project status label.',
					),
					array(
						'key'                 => 'field_project_company',
						'label'               => 'Company',
						'name'                => 'sira_related_company',
						'type'                => 'relationship',
						'post_type'           => array( 'sira_company' ),
						'return_format'       => 'id',
						'max'                 => 1,
						'show_in_graphql'     => true,
						'graphql_field_name'  => 'relatedCompany',
						'graphql_description' => 'The SIRA company associated with this project.',
					),
					array(
						'key'                 => 'field_project_gallery',
						'label'               => 'Gallery',
						'name'                => 'sira_gallery',
						'type'                => 'gallery',
						'return_format'       => 'array',
						'preview_size'        => 'medium',
						'show_in_graphql'     => true,
						'graphql_field_name'  => 'gallery',
						'graphql_description' => 'Approved project gallery media.',
					),
					array(
						'key'                 => 'field_project_stats',
						'label'               => 'Statistics',
						'name'                => 'sira_statistics',
						'type'                => 'repeater',
						'layout'              => 'table',
						'show_in_graphql'     => true,
						'graphql_field_name'  => 'statistics',
						'graphql_description' => 'Approved public project statistics.',
						'sub_fields'          => array(
							array(
								'key'                 => 'field_project_stat_value',
								'label'               => 'Value',
								'name'                => 'value',
								'type'                => 'text',
								'show_in_graphql'     => true,
								'graphql_field_name'  => 'value',
								'graphql_description' => 'The formatted statistic value.',
							),
							array(
								'key'                 => 'field_project_stat_label',
								'label'               => 'Label',
								'name'                => 'label',
								'type'                => 'text',
								'show_in_graphql'     => true,
								'graphql_field_name'  => 'label',
								'graphql_description' => 'The statistic label.',
							),
						),
					),
				),
				'location'                             => array(
					array(
						array(
							'param'    => 'post_type',
							'operator' => '==',
							'value'    => 'sira_project',
						),
					),
				),
				'active'                               => true,
			)
		);
	}

	private function register_people_group(): void {
		acf_add_local_field_group(
			array(
				'key'                                  => 'group_sira_people',
				'title'                                => 'Person Details',
				'show_in_graphql'                      => true,
				'graphql_field_name'                   => 'personDetails',
				'graphql_type_name'                    => 'SiraPersonDetails',
				'map_graphql_types_from_location_rules' => false,
				'graphql_types'                        => array(
					'SiraLeadershipProfile',
					'SiraExecutive',
					'SiraBoardMember',
				),
				'fields'                               => array(
					array(
						'key'                 => 'field_person_role',
						'label'               => 'Role / Title',
						'name'                => 'sira_role',
						'type'                => 'text',
						'show_in_graphql'     => true,
						'graphql_field_name'  => 'role',
						'graphql_description' => 'The approved public role or title.',
					),
					array(
						'key'                 => 'field_person_email',
						'label'               => 'Email',
						'name'                => 'sira_email',
						'type'                => 'email',
						/*
						 * Personal email is not a public content field. A later
						 * approved contact policy may expose a separate,
						 * capability-protected field.
						 */
						'show_in_graphql'     => false,
						'graphql_field_name'  => 'email',
					),
					array(
						'key'                 => 'field_person_linkedin',
						'label'               => 'LinkedIn',
						'name'                => 'sira_linkedin',
						'type'                => 'url',
						'show_in_graphql'     => true,
						'graphql_field_name'  => 'linkedin',
						'graphql_description' => 'An approved public LinkedIn profile URL.',
					),
					array(
						'key'                 => 'field_person_company',
						'label'               => 'Company',
						'name'                => 'sira_company',
						'type'                => 'relationship',
						'post_type'           => array( 'sira_company' ),
						'return_format'       => 'id',
						'max'                 => 1,
						'show_in_graphql'     => true,
						'graphql_field_name'  => 'company',
						'graphql_description' => 'The SIRA company associated with this person.',
					),
				),
				'location'                             => array(
					array(
						array(
							'param'    => 'post_type',
							'operator' => '==',
							'value'    => 'sira_leadership',
						),
					),
					array(
						array(
							'param'    => 'post_type',
							'operator' => '==',
							'value'    => 'sira_executive',
						),
					),
					array(
						array(
							'param'    => 'post_type',
							'operator' => '==',
							'value'    => 'sira_board_member',
						),
					),
				),
				'active'                               => true,
			)
		);
	}

	private function register_document_group(): void {
		acf_add_local_field_group(
			array(
				'key'                                  => 'group_sira_document',
				'title'                                => 'Document Details',
				'show_in_graphql'                      => true,
				'graphql_field_name'                   => 'documentDetails',
				'graphql_type_name'                    => 'SiraDocumentDetails',
				'map_graphql_types_from_location_rules' => false,
				'graphql_types'                        => array(
					'SiraDocument',
					'SiraDownload',
					'SiraWhitepaper',
				),
				'fields'                               => array(
					array(
						'key'           => 'field_doc_file',
						'label'         => 'File',
						'name'          => 'sira_file',
						'type'          => 'file',
						'return_format' => 'array',
						/*
						 * Direct files remain hidden until the document access
						 * and gating policy is approved. Page metadata can be
						 * public without making the attachment URL public.
						 */
						'show_in_graphql'    => false,
						'graphql_field_name' => 'file',
					),
					array(
						'key'                 => 'field_doc_version',
						'label'               => 'Version',
						'name'                => 'sira_version',
						'type'                => 'text',
						'show_in_graphql'     => true,
						'graphql_field_name'  => 'version',
						'graphql_description' => 'The approved public document version label.',
					),
					array(
						'key'                 => 'field_doc_date',
						'label'               => 'Publication Date',
						'name'                => 'sira_publication_date',
						'type'                => 'date_picker',
						'return_format'       => 'Y-m-d',
						'show_in_graphql'     => true,
						'graphql_field_name'  => 'publicationDate',
						'graphql_description' => 'The document publication date in YYYY-MM-DD format.',
					),
				),
				'location'                             => array(
					array(
						array(
							'param'    => 'post_type',
							'operator' => '==',
							'value'    => 'sira_document',
						),
					),
					array(
						array(
							'param'    => 'post_type',
							'operator' => '==',
							'value'    => 'sira_download',
						),
					),
					array(
						array(
							'param'    => 'post_type',
							'operator' => '==',
							'value'    => 'sira_whitepaper',
						),
					),
				),
				'active'                               => true,
			)
		);
	}
}

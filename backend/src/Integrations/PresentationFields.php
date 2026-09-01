<?php
/**
 * Structured homepage and presentation field groups.
 *
 * The field definitions are kept separate from AcfIntegration so the
 * presentation contract can be inspected and validated without booting
 * WordPress or ACF.
 */

declare(strict_types=1);

namespace Sira\Core\Integrations;

final class PresentationFields {
	/**
	 * Register every source-controlled presentation field group.
	 */
	public function register(): void {
		if ( ! function_exists( 'acf_add_local_field_group' ) ) {
			return;
		}

		foreach ( self::definitions() as $definition ) {
			acf_add_local_field_group( $definition );
		}
	}

	/**
	 * Return the complete source-controlled presentation field definitions.
	 *
	 * Nested WPGraphQL-for-ACF type names are intentionally not declared here.
	 * The live schema inventory must record the generated nested names before
	 * frontend GraphQL Code Generator output is finalized.
	 *
	 * @return array<string,array<string,mixed>>
	 */
	public static function definitions(): array {
		return array(
			'group_sira_homepage'           => self::homepage_group(),
			'group_sira_group_homepage'     => self::group_homepage_group(),
			'group_sira_branch_homepage'    => self::branch_homepage_group(),
			'group_sira_company_details'    => self::company_group(),
			'group_sira_investment_details' => self::investment_group(),
			'group_sira_testimonial_details' => self::testimonial_group(),
			'group_sira_partner_details'    => self::partner_group(),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function homepage_group(): array {
		return array(
			'key'                                  => 'group_sira_homepage',
			'title'                                => 'SIRA Homepage',
			'show_in_graphql'                      => true,
			'graphql_field_name'                   => 'siraHomepage',
			'graphql_type_name'                    => 'SiraHomepage',
			'map_graphql_types_from_location_rules' => false,
			'graphql_types'                        => array( 'Page' ),
			'fields'                               => array(
				self::radio(
					'field_sira_homepage_variant',
					'Homepage Variant',
					'sira_homepage_variant',
					'variant',
					array(
						'group'  => 'Group homepage',
						'branch' => 'Branch homepage',
					),
					'group',
					array(
						'instructions' => 'Choose the fixed approved homepage architecture for this site. The frontend validates this value against the trusted site key.',
						'required'     => 1,
						'layout'       => 'horizontal',
					)
				),
			),
			'location'                             => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'page',
					),
					array(
						'param'    => 'page_type',
						'operator' => '==',
						'value'    => 'front_page',
					),
				),
			),
			'menu_order'                           => 10,
			'position'                             => 'acf_after_title',
			'style'                                => 'default',
			'label_placement'                      => 'top',
			'instruction_placement'                => 'label',
			'active'                               => true,
		);
	}

	/**
	 * Group homepage sections, registered as their own field group.
	 *
	 * These sections were previously nested inside `sira_group_homepage`, an ACF
	 * group *field*. ACF prefixes a group field's children with the parent name,
	 * so that structure reads `sira_group_homepage_hero_heading_before` — while
	 * every row actually stored on the front page is `hero_heading_before`. Live
	 * evidence: the Group front page holds 440 meta rows and not one carries a
	 * `sira_group_homepage` prefix, so every nested field resolved to null and
	 * the frontend fell back to its not-ready page.
	 *
	 * A field *group* adds no storage prefix, so registering the sections this
	 * way makes the existing content readable again without re-authoring it, and
	 * keeps Group and Branch in separate GraphQL types — which the nesting was
	 * providing, since both variants name their sections `hero`.
	 *
	 * @return array<string,mixed>
	 */
	private static function group_homepage_group(): array {
		return array(
			'key'                                  => 'group_sira_group_homepage',
			'title'                                => 'SIRA Homepage — Group Sections',
			'show_in_graphql'                      => true,
			'graphql_field_name'                   => 'groupHomepage',
			'graphql_type_name'                    => 'SiraGroupHomepage',
			'map_graphql_types_from_location_rules' => false,
			'graphql_types'                        => array( 'Page' ),
			'fields'                               => self::group_homepage_fields(),
			'location'                             => self::front_page_location(),
			'menu_order'                           => 11,
			'position'                             => 'normal',
			'style'                                => 'default',
			'label_placement'                      => 'top',
			'instruction_placement'                => 'label',
			'active'                               => true,
		);
	}

	/**
	 * Branch homepage sections, registered as their own field group.
	 *
	 * Same correction as {@see self::group_homepage_group()}. Branch front pages
	 * store `branch_hero_*`, `branch_statistics_*`, and `branch_focus_areas_*`,
	 * never `sira_branch_homepage_*`, so `statistics` and `focusAreas` were both
	 * resolving to null on all four branch sites.
	 *
	 * @return array<string,mixed>
	 */
	private static function branch_homepage_group(): array {
		return array(
			'key'                                  => 'group_sira_branch_homepage',
			'title'                                => 'SIRA Homepage — Branch Sections',
			'show_in_graphql'                      => true,
			'graphql_field_name'                   => 'branchHomepage',
			'graphql_type_name'                    => 'SiraBranchHomepage',
			'map_graphql_types_from_location_rules' => false,
			'graphql_types'                        => array( 'Page' ),
			'fields'                               => self::branch_homepage_fields(),
			'location'                             => self::front_page_location(),
			'menu_order'                           => 12,
			'position'                             => 'normal',
			'style'                                => 'default',
			'label_placement'                      => 'top',
			'instruction_placement'                => 'label',
			'active'                               => true,
		);
	}

	/**
	 * Shared location rule: the site's front page only.
	 *
	 * @return array<int,array<int,array<string,string>>>
	 */
	private static function front_page_location(): array {
		return array(
			array(
				array(
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'page',
				),
				array(
					'param'    => 'page_type',
					'operator' => '==',
					'value'    => 'front_page',
				),
			),
		);
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	private static function group_homepage_fields(): array {
		return array(
			self::group_field(
				'field_sira_group_home_hero',
				'Hero',
				'hero',
				'hero',
				array(
					self::text(
						'field_sira_group_hero_heading_before',
						'Heading Before Highlight',
						'heading_before',
						'headingBefore'
					),
					self::text(
						'field_sira_group_hero_heading_highlight',
						'Highlighted Heading',
						'heading_highlight',
						'headingHighlight'
					),
					self::text(
						'field_sira_group_hero_heading_after',
						'Heading After Highlight',
						'heading_after',
						'headingAfter'
					),
					self::textarea(
						'field_sira_group_hero_description',
						'Description',
						'description',
						'description',
						array( 'rows' => 4 )
					),
					self::link_field(
						'field_sira_group_hero_primary_cta',
						'Primary CTA',
						'primary_cta',
						'primaryCta'
					),
					self::link_field(
						'field_sira_group_hero_secondary_cta',
						'Secondary CTA',
						'secondary_cta',
						'secondaryCta'
					),
					self::repeater(
						'field_sira_group_hero_slides',
						'Hero Slides',
						'slides',
						'slides',
						self::group_hero_slide_fields(),
						array(
							'layout'       => 'block',
							'button_label' => 'Add hero slide',
							'min'          => 1,
							'max'          => 8,
						)
					),
				)
			),
			self::group_field(
				'field_sira_group_home_ticker',
				'Announcement Ticker',
				'ticker',
				'ticker',
				array(
					self::true_false(
						'field_sira_group_ticker_enabled',
						'Enabled',
						'enabled',
						'enabled',
						array( 'default_value' => 1 )
					),
					self::repeater(
						'field_sira_group_ticker_items',
						'Ticker Items',
						'items',
						'items',
						array(
							self::text(
								'field_sira_group_ticker_item_label',
								'Label',
								'label',
								'label',
								array( 'required' => 1 )
							),
							self::link_field(
								'field_sira_group_ticker_item_link',
								'Link',
								'link',
								'link'
							),
							self::taxonomy(
								'field_sira_group_ticker_business_unit',
								'Business Unit',
								'business_unit',
								'businessUnit'
							),
						),
						array(
							'layout'       => 'row',
							'button_label' => 'Add ticker item',
							'max'          => 12,
						)
					),
				)
			),
			self::editorial_section(
				'latest_updates',
				'Latest Updates',
				'latestUpdates'
			),
			self::relationship_section(
				'companies',
				'Company Portfolio',
				'companies',
				array( 'sira_company' ),
				'selectedCompanies',
				12
			),
			self::group_field(
				'field_sira_group_home_about',
				'About & Metrics',
				'about',
				'about',
				array_merge(
					self::section_header_sub_fields( 'group_about' ),
					array(
						self::wysiwyg(
							'field_sira_group_about_body',
							'Body',
							'body',
							'body'
						),
						self::repeater(
							'field_sira_group_about_metrics',
							'Metrics',
							'metrics',
							'metrics',
							self::metric_fields( 'group_about_metric' ),
							array(
								'layout'       => 'table',
								'button_label' => 'Add metric',
								'max'          => 8,
							)
						),
					)
				)
			),
			self::group_field(
				'field_sira_group_home_investor',
				'Investor Section',
				'investor',
				'investor',
				array_merge(
					self::section_header_sub_fields( 'group_investor' ),
					array(
						self::wysiwyg(
							'field_sira_group_investor_body',
							'Body',
							'body',
							'body'
						),
						self::repeater(
							'field_sira_group_investor_metrics',
							'Investor Metrics',
							'metrics',
							'metrics',
							self::metric_fields( 'group_investor_metric' ),
							array(
								'layout'       => 'table',
								'button_label' => 'Add investor metric',
								'max'          => 8,
							)
						),
						self::relationship(
							'field_sira_group_investor_items',
							'Selected Public Investments',
							'selected_investments',
							'selectedInvestments',
							array( 'sira_investment' ),
							array( 'max' => 6 )
						),
						self::relationship(
							'field_sira_group_investor_one_pager',
							'One-pager Document',
							'one_pager_document',
							'onePagerDocument',
							array(
								'sira_document',
								'sira_download',
								'sira_whitepaper',
							),
							array( 'max' => 1 )
						),
						self::text(
							'field_sira_group_investor_form_heading',
							'Form Heading',
							'form_heading',
							'formHeading'
						),
						self::textarea(
							'field_sira_group_investor_form_description',
							'Form Description',
							'form_description',
							'formDescription',
							array( 'rows' => 3 )
						),
					)
				)
			),
			self::relationship_section(
				'services',
				'Services',
				'services',
				array( 'sira_service' ),
				'selectedServices',
				12
			),
			self::relationship_section(
				'projects',
				'Projects',
				'projects',
				array( 'sira_project' ),
				'selectedProjects',
				12
			),
			self::editorial_section(
				'insights',
				'Insights & News',
				'insights'
			),
			self::relationship_section(
				'testimonials',
				'Testimonials',
				'testimonials',
				array( 'sira_testimonial' ),
				'selectedTestimonials',
				8
			),
			self::relationship_section(
				'partners',
				'Partners',
				'partners',
				array( 'sira_partner' ),
				'selectedPartners',
				24
			),
			self::contact_section(
				'group',
				'Group Contact'
			),
		);
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	private static function group_hero_slide_fields(): array {
		return array(
			self::relationship(
				'field_sira_group_slide_project',
				'Related Project',
				'related_project',
				'relatedProject',
				array( 'sira_project' ),
				array( 'max' => 1 )
			),
			self::relationship(
				'field_sira_group_slide_company',
				'Related Company',
				'related_company',
				'relatedCompany',
				array( 'sira_company' ),
				array( 'max' => 1 )
			),
			self::image(
				'field_sira_group_slide_image',
				'Image Override',
				'image_override',
				'imageOverride'
			),
			self::image(
				'field_sira_group_slide_mobile_image',
				'Mobile Image Override',
				'mobile_image_override',
				'mobileImageOverride'
			),
			self::taxonomy(
				'field_sira_group_slide_business_unit',
				'Business Unit',
				'business_unit',
				'businessUnit',
				array( 'required' => 1 )
			),
			self::text(
				'field_sira_group_slide_eyebrow',
				'Eyebrow Override',
				'eyebrow_override',
				'eyebrowOverride'
			),
			self::text(
				'field_sira_group_slide_location',
				'Location Override',
				'location_override',
				'locationOverride'
			),
			self::text(
				'field_sira_group_slide_title',
				'Title Override',
				'title_override',
				'titleOverride'
			),
			self::textarea(
				'field_sira_group_slide_description',
				'Description Override',
				'description_override',
				'descriptionOverride',
				array( 'rows' => 3 )
			),
			self::link_field(
				'field_sira_group_slide_primary_cta',
				'Primary CTA Override',
				'primary_cta_override',
				'primaryCtaOverride'
			),
			self::link_field(
				'field_sira_group_slide_secondary_cta',
				'Secondary CTA Override',
				'secondary_cta_override',
				'secondaryCtaOverride'
			),
			self::text(
				'field_sira_group_slide_alt',
				'Image Alt Override',
				'image_alt_override',
				'imageAltOverride'
			),
		);
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	private static function branch_homepage_fields(): array {
		return array(
			self::group_field(
				'field_sira_branch_home_hero',
				'Hero',
				'hero',
				'hero',
				array(
					self::text(
						'field_sira_branch_hero_eyebrow',
						'Eyebrow',
						'eyebrow',
						'eyebrow'
					),
					self::text(
						'field_sira_branch_hero_region',
						'Region',
						'region',
						'region'
					),
					self::text(
						'field_sira_branch_hero_heading_before',
						'Heading Before Highlight',
						'heading_before',
						'headingBefore',
						array( 'required' => 1 )
					),
					self::text(
						'field_sira_branch_hero_heading_highlight',
						'Highlighted Heading',
						'heading_highlight',
						'headingHighlight',
						array( 'required' => 1 )
					),
					self::text(
						'field_sira_branch_hero_heading_after',
						'Heading After Highlight',
						'heading_after',
						'headingAfter'
					),
					self::textarea(
						'field_sira_branch_hero_description',
						'Description',
						'description',
						'description',
						array(
							'rows'     => 4,
							'required' => 1,
						)
					),
					self::image(
						'field_sira_branch_hero_image',
						'Hero Image',
						'image',
						'image',
						array( 'required' => 1 )
					),
					self::image(
						'field_sira_branch_hero_mobile_image',
						'Mobile Hero Image',
						'mobile_image',
						'mobileImage'
					),
					self::text(
						'field_sira_branch_hero_alt',
						'Image Alt Override',
						'image_alt',
						'imageAlt'
					),
					self::link_field(
						'field_sira_branch_hero_primary_cta',
						'Primary CTA',
						'primary_cta',
						'primaryCta'
					),
					self::link_field(
						'field_sira_branch_hero_secondary_cta',
						'Secondary CTA',
						'secondary_cta',
						'secondaryCta'
					),
				)
			),
			self::repeater(
				'field_sira_branch_statistics',
				'Statistics',
				'statistics',
				'statistics',
				self::metric_fields( 'branch_statistic' ),
				array(
					'layout'       => 'table',
					'button_label' => 'Add statistic',
					'max'          => 8,
				)
			),
			self::group_field(
				'field_sira_branch_overview',
				'Overview',
				'overview',
				'overview',
				array_merge(
					self::section_header_sub_fields( 'branch_overview' ),
					array(
						self::wysiwyg(
							'field_sira_branch_overview_body',
							'Body',
							'body',
							'body'
						),
					)
				)
			),
			self::repeater(
				'field_sira_branch_focus_areas',
				'Focus Areas',
				'focus_areas',
				'focusAreas',
				array(
					self::text(
						'field_sira_branch_focus_title',
						'Title',
						'title',
						'title',
						array( 'required' => 1 )
					),
					self::textarea(
						'field_sira_branch_focus_description',
						'Description',
						'description',
						'description',
						array(
							'rows'     => 3,
							'required' => 1,
						)
					),
				),
				array(
					'layout'       => 'block',
					'button_label' => 'Add focus area',
					'max'          => 12,
				)
			),
			self::relationship_section(
				'branch_projects',
				'Projects',
				'projects',
				array( 'sira_project' ),
				'selectedProjects',
				12
			),
			self::editorial_section(
				'branch_insights',
				'Insights & News',
				'insights'
			),
			self::contact_section(
				'branch',
				'Branch Contact'
			),
			self::group_field(
				'field_sira_branch_footer',
				'Footer',
				'footer',
				'footer',
				array(
					self::text(
						'field_sira_branch_footer_tagline',
						'Tagline Override',
						'tagline_override',
						'taglineOverride'
					),
					self::text(
						'field_sira_branch_footer_group_label',
						'Group Link Label Override',
						'group_link_label_override',
						'groupLinkLabelOverride'
					),
				)
			),
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function company_group(): array {
		return self::content_group(
			'group_sira_company_details',
			'Company Details',
			'companyDetails',
			'SiraCompanyDetails',
			'SiraCompany',
			'sira_company',
			array(
				self::radio(
					'field_sira_company_operating_status',
					'Operating Status',
					'sira_company_operating_status',
					'operatingStatus',
					array(
						'active'     => 'Active',
						'comingSoon' => 'Coming Soon',
						'inactive'   => 'Inactive',
					),
					'active',
					array(
						'required' => 1,
						'layout'   => 'horizontal',
					)
				),
				self::url(
					'field_sira_company_external_url',
					'External Website URL',
					'sira_company_external_url',
					'externalWebsiteUrl'
				),
				self::text(
					'field_sira_company_short_descriptor',
					'Short Descriptor',
					'sira_company_short_descriptor',
					'shortDescriptor',
					array(
						'maxlength' => 180,
					)
				),
				self::image(
					'field_sira_company_card_image',
					'Card Image Override',
					'sira_company_card_image',
					'cardImageOverride'
				),
			)
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function investment_group(): array {
		return self::content_group(
			'group_sira_investment_details',
			'Public Investment Details',
			'investmentDetails',
			'SiraInvestmentDetails',
			'SiraInvestment',
			'sira_investment',
			array(
				self::true_false(
					'field_sira_investment_public_display',
					'Public Display Approved',
					'sira_investment_public_display',
					'publicDisplay',
					array(
						'default_value' => 0,
						'instructions'  => 'Anonymous GraphQL access requires this approval. Authorized editors with permission to edit the record retain preview access.',
					)
				),
				self::text(
					'field_sira_investment_ticket_size',
					'Ticket Size Label',
					'sira_investment_ticket_size',
					'ticketSizeLabel'
				),
				self::relationship(
					'field_sira_investment_related_company',
					'Related Company',
					'sira_investment_related_company',
					'relatedCompany',
					array( 'sira_company' ),
					array( 'max' => 1 )
				),
				self::relationship(
					'field_sira_investment_related_project',
					'Related Project',
					'sira_investment_related_project',
					'relatedProject',
					array( 'sira_project' ),
					array( 'max' => 1 )
				),
				self::relationship(
					'field_sira_investment_one_pager',
					'One-pager Document',
					'sira_investment_one_pager',
					'onePagerDocument',
					array(
						'sira_document',
						'sira_download',
						'sira_whitepaper',
					),
					array( 'max' => 1 )
				),
			)
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function testimonial_group(): array {
		return self::content_group(
			'group_sira_testimonial_details',
			'Testimonial Details',
			'testimonialDetails',
			'SiraTestimonialDetails',
			'SiraTestimonial',
			'sira_testimonial',
			array(
				self::text(
					'field_sira_testimonial_role',
					'Role',
					'sira_testimonial_role',
					'role'
				),
				self::text(
					'field_sira_testimonial_organization',
					'Organization',
					'sira_testimonial_organization',
					'organization'
				),
				self::true_false(
					'field_sira_testimonial_consent',
					'Public Consent Approved',
					'sira_testimonial_consent_approved',
					'consentApproved',
					array(
						'default_value' => 0,
						'instructions'  => 'Anonymous GraphQL access requires this approval. Authorized editors with permission to edit the record retain preview access.',
					)
				),
				array(
					'key'                   => 'field_sira_testimonial_consent_recorded',
					'label'                 => 'Consent Recorded At',
					'name'                  => 'sira_testimonial_consent_recorded_at',
					'type'                  => 'date_time_picker',
					'display_format'        => 'Y-m-d H:i',
					'return_format'         => 'Y-m-d\TH:i:sP',
					'first_day'             => 1,
					'show_in_graphql'       => false,
					'graphql_field_name'    => 'consentRecordedAt',
					'instructions'          => 'Operational evidence only. Not exposed through the public GraphQL schema.',
				),
				self::url(
					'field_sira_testimonial_source_url',
					'Source URL',
					'sira_testimonial_source_url',
					'sourceUrl'
				),
			)
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function partner_group(): array {
		return self::content_group(
			'group_sira_partner_details',
			'Partner Details',
			'partnerDetails',
			'SiraPartnerDetails',
			'SiraPartner',
			'sira_partner',
			array(
				self::url(
					'field_sira_partner_website_url',
					'Website URL',
					'sira_partner_website_url',
					'websiteUrl'
				),
				self::text(
					'field_sira_partner_relationship_label',
					'Relationship Label',
					'sira_partner_relationship_label',
					'relationshipLabel'
				),
				self::text(
					'field_sira_partner_logo_alt',
					'Logo Alt Override',
					'sira_partner_logo_alt_override',
					'logoAltOverride',
					array(
						'maxlength'    => 300,
						'instructions' => 'Use only when the Media Library alternative text is unsuitable for this approved public context.',
					)
				),
			)
		);
	}

	/**
	 * @param array<int,array<string,mixed>> $fields Fields.
	 * @return array<string,mixed>
	 */
	private static function content_group(
		string $key,
		string $title,
		string $graphql_field_name,
		string $graphql_type_name,
		string $graphql_parent_type,
		string $post_type,
		array $fields
	): array {
		return array(
			'key'                                  => $key,
			'title'                                => $title,
			'show_in_graphql'                      => true,
			'graphql_field_name'                   => $graphql_field_name,
			'graphql_type_name'                    => $graphql_type_name,
			'map_graphql_types_from_location_rules' => false,
			'graphql_types'                        => array( $graphql_parent_type ),
			'fields'                               => $fields,
			'location'                             => array(
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => $post_type,
					),
				),
			),
			'position'                             => 'normal',
			'style'                                => 'default',
			'label_placement'                      => 'top',
			'instruction_placement'                => 'label',
			'active'                               => true,
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function editorial_section(
		string $key_suffix,
		string $label,
		string $graphql_field_name
	): array {
		$prefix = 'group_' . $key_suffix;

		return self::group_field(
			'field_sira_' . $key_suffix,
			$label,
			$key_suffix,
			$graphql_field_name,
			array_merge(
				self::section_header_sub_fields( $prefix ),
				array(
					self::radio(
						'field_sira_' . $key_suffix . '_source_mode',
						'Source Mode',
						'source_mode',
						'sourceMode',
						array(
							'latest'  => 'Latest published items',
							'curated' => 'Curated selection',
						),
						'latest',
						array(
							'required' => 1,
							'layout'   => 'horizontal',
						)
					),
					self::relationship(
						'field_sira_' . $key_suffix . '_items',
						'Selected Editorial Items',
						'selected_items',
						'selectedItems',
						array(
							'sira_news',
							'sira_insight',
							'sira_article',
							'sira_press_release',
						),
						array(
							'max'               => 12,
							'conditional_logic' => array(
								array(
									array(
										'field'    => 'field_sira_' . $key_suffix . '_source_mode',
										'operator' => '==',
										'value'    => 'curated',
									),
								),
							),
						)
					),
					self::number(
						'field_sira_' . $key_suffix . '_limit',
						'Item Limit',
						'item_limit',
						'itemLimit',
						array(
							'default_value' => 3,
							'min'           => 1,
							'max'           => 12,
							'step'          => 1,
						)
					),
				)
			)
		);
	}

	/**
	 * @param array<int,string> $post_types Post types.
	 * @return array<string,mixed>
	 */
	private static function relationship_section(
		string $key_suffix,
		string $label,
		string $graphql_field_name,
		array $post_types,
		string $relationship_graphql_field,
		int $maximum
	): array {
		return self::group_field(
			'field_sira_' . $key_suffix,
			$label,
			$key_suffix,
			$graphql_field_name,
			array_merge(
				self::section_header_sub_fields( $key_suffix ),
				array(
					self::relationship(
						'field_sira_' . $key_suffix . '_items',
						'Selected Items',
						'selected_items',
						$relationship_graphql_field,
						$post_types,
						array( 'max' => $maximum )
					),
				)
			)
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function contact_section(
		string $context,
		string $label
	): array {
		return self::group_field(
			'field_sira_' . $context . '_contact',
			$label,
			'contact',
			'contact',
			array(
				self::text(
					'field_sira_' . $context . '_contact_eyebrow',
					'Eyebrow',
					'eyebrow',
					'eyebrow'
				),
				self::text(
					'field_sira_' . $context . '_contact_heading',
					'Heading',
					'heading',
					'heading'
				),
				self::textarea(
					'field_sira_' . $context . '_contact_description',
					'Description',
					'description',
					'description',
					array( 'rows' => 4 )
				),
				self::radio(
					'field_sira_' . $context . '_contact_form_variant',
					'Form Variant',
					'form_variant',
					'formVariant',
					array(
						'contact'     => 'General contact',
						'partnership' => 'Partnership enquiry',
						'investor'    => 'Investor enquiry',
					),
					'contact',
					array( 'layout' => 'horizontal' )
				),
				self::text(
					'field_sira_' . $context . '_contact_form_context',
					'Form Context',
					'form_context',
					'formContext',
					array(
						'maxlength'    => 100,
						'instructions' => 'A non-secret routing context validated against the future frontend form registry.',
					)
				),
			)
		);
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	private static function section_header_sub_fields( string $prefix ): array {
		return array(
			self::text(
				'field_sira_' . $prefix . '_eyebrow',
				'Eyebrow',
				'eyebrow',
				'eyebrow'
			),
			self::text(
				'field_sira_' . $prefix . '_heading',
				'Heading',
				'heading',
				'heading'
			),
			self::textarea(
				'field_sira_' . $prefix . '_description',
				'Description',
				'description',
				'description',
				array( 'rows' => 3 )
			),
			self::link_field(
				'field_sira_' . $prefix . '_link',
				'Section Link',
				'link',
				'link'
			),
		);
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	private static function metric_fields( string $prefix ): array {
		return array(
			self::text(
				'field_sira_' . $prefix . '_value',
				'Value',
				'value',
				'value',
				array( 'required' => 1 )
			),
			self::text(
				'field_sira_' . $prefix . '_label',
				'Label',
				'label',
				'label',
				array( 'required' => 1 )
			),
			self::text(
				'field_sira_' . $prefix . '_supporting_text',
				'Supporting Text',
				'supporting_text',
				'supportingText'
			),
		);
	}

	/**
	 * @param array<int,array<string,mixed>> $sub_fields Sub-fields.
	 * @param array<string,mixed>            $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function group_field(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		array $sub_fields,
		array $extra = array()
	): array {
		return array_merge(
			array(
				'key'                  => $key,
				'label'                => $label,
				'name'                 => $name,
				'type'                 => 'group',
				'layout'               => 'block',
				'show_in_graphql'      => true,
				'graphql_field_name'   => $graphql_field_name,
				'sub_fields'           => $sub_fields,
			),
			$extra
		);
	}

	/**
	 * @param array<int,array<string,mixed>> $sub_fields Sub-fields.
	 * @param array<string,mixed>            $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function repeater(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		array $sub_fields,
		array $extra = array()
	): array {
		return array_merge(
			array(
				'key'                  => $key,
				'label'                => $label,
				'name'                 => $name,
				'type'                 => 'repeater',
				'layout'               => 'table',
				'button_label'         => 'Add row',
				'show_in_graphql'      => true,
				'graphql_field_name'   => $graphql_field_name,
				'sub_fields'           => $sub_fields,
			),
			$extra
		);
	}

	/**
	 * @param array<string,string> $choices Choices.
	 * @param array<string,mixed>  $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function radio(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		array $choices,
		string $default_value,
		array $extra = array()
	): array {
		return self::field(
			$key,
			$label,
			$name,
			'radio',
			$graphql_field_name,
			array_merge(
				array(
					'choices'       => $choices,
					'default_value' => $default_value,
					'return_format' => 'value',
					'allow_null'    => 0,
					'other_choice'  => 0,
					'save_other_choice' => 0,
				),
				$extra
			)
		);
	}

	/**
	 * @param array<string,mixed> $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function text(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		array $extra = array()
	): array {
		return self::field(
			$key,
			$label,
			$name,
			'text',
			$graphql_field_name,
			$extra
		);
	}

	/**
	 * @param array<string,mixed> $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function textarea(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		array $extra = array()
	): array {
		return self::field(
			$key,
			$label,
			$name,
			'textarea',
			$graphql_field_name,
			array_merge(
				array(
					'rows'      => 3,
					'new_lines' => 'wpautop',
				),
				$extra
			)
		);
	}

	/**
	 * @return array<string,mixed>
	 */
	private static function wysiwyg(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name
	): array {
		return self::field(
			$key,
			$label,
			$name,
			'wysiwyg',
			$graphql_field_name,
			array(
				'tabs'         => 'visual',
				'toolbar'      => 'basic',
				'media_upload' => false,
			)
		);
	}

	/**
	 * @param array<string,mixed> $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function link_field(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		array $extra = array()
	): array {
		return self::field(
			$key,
			$label,
			$name,
			'link',
			$graphql_field_name,
			array_merge(
				array( 'return_format' => 'array' ),
				$extra
			)
		);
	}

	/**
	 * @param array<string,mixed> $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function image(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		array $extra = array()
	): array {
		return self::field(
			$key,
			$label,
			$name,
			'image',
			$graphql_field_name,
			array_merge(
				array(
					'return_format' => 'id',
					'preview_size'  => 'medium',
					'library'       => 'all',
				),
				$extra
			)
		);
	}

	/**
	 * @param array<int,string>   $post_types Post types.
	 * @param array<string,mixed> $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function relationship(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		array $post_types,
		array $extra = array()
	): array {
		return self::field(
			$key,
			$label,
			$name,
			'relationship',
			$graphql_field_name,
			array_merge(
				array(
					'post_type'     => $post_types,
					'filters'       => array(
						'search',
						'post_type',
						'taxonomy',
					),
					'return_format' => 'id',
					'min'           => 0,
					'max'           => 0,
				),
				$extra
			)
		);
	}

	/**
	 * @param array<string,mixed> $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function taxonomy(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		array $extra = array()
	): array {
		return self::field(
			$key,
			$label,
			$name,
			'taxonomy',
			$graphql_field_name,
			array_merge(
				array(
					'taxonomy'      => 'sira_business_unit',
					'field_type'    => 'select',
					'allow_null'    => 1,
					'add_term'      => 0,
					'save_terms'    => 0,
					'load_terms'    => 0,
					'return_format' => 'id',
					'multiple'      => 0,
				),
				$extra
			)
		);
	}

	/**
	 * @param array<string,mixed> $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function true_false(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		array $extra = array()
	): array {
		return self::field(
			$key,
			$label,
			$name,
			'true_false',
			$graphql_field_name,
			array_merge(
				array(
					'ui'            => 1,
					'default_value' => 0,
				),
				$extra
			)
		);
	}

	/**
	 * @param array<string,mixed> $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function number(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		array $extra = array()
	): array {
		return self::field(
			$key,
			$label,
			$name,
			'number',
			$graphql_field_name,
			$extra
		);
	}

	/**
	 * @param array<string,mixed> $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function url(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		array $extra = array()
	): array {
		return self::field(
			$key,
			$label,
			$name,
			'url',
			$graphql_field_name,
			$extra
		);
	}

	/**
	 * @param array<string,mixed> $extra Extra ACF settings.
	 * @return array<string,mixed>
	 */
	private static function field(
		string $key,
		string $label,
		string $name,
		string $type,
		string $graphql_field_name,
		array $extra = array()
	): array {
		return array_merge(
			array(
				'key'                 => $key,
				'label'               => $label,
				'name'                => $name,
				'type'                => $type,
				'show_in_graphql'     => true,
				'graphql_field_name'  => $graphql_field_name,
			),
			$extra
		);
	}
}

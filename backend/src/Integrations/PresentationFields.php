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
	 * Every Homepage section (hero, ticker, about, ... contact, footer) is
	 * its own STANDALONE top-level field group here, each independently
	 * targeting `Page` — see the note on group_homepage_section_groups()
	 * for why: WPGraphQL for ACF cannot resolve text/textarea/link/wysiwyg/
	 * relationship fields that live inside a `group`-type field nested
	 * inside another field group's own `fields` array, confirmed
	 * empirically through two separate live deploys. A field group's OWN
	 * top-level `fields` (like `group_sira_company_details`'s
	 * `shortDescriptor`) resolves fine — it's specifically a `group` field
	 * NESTED one level inside that breaks it.
	 *
	 * @return array<string,array<string,mixed>>
	 */
	public static function definitions(): array {
		return array_merge(
			array(
				'group_sira_homepage_variant' => self::homepage_variant_group(),
			),
			self::group_homepage_section_groups(),
			self::branch_homepage_section_groups(),
			array(
				'group_sira_company_details'    => self::company_group(),
				'group_sira_investment_details' => self::investment_group(),
				'group_sira_testimonial_details' => self::testimonial_group(),
				'group_sira_partner_details'    => self::partner_group(),
			)
		);
	}

	/**
	 * The only field that ever lived directly on `siraHomepage` and still
	 * does — everything else moved out into its own standalone field group
	 * (see definitions()).
	 *
	 * @return array<string,mixed>
	 */
	private static function homepage_variant_group(): array {
		return array(
			'key'                                  => 'group_sira_homepage_variant',
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
			'location'                             => self::front_page_location(),
			'menu_order'                           => 10,
			'position'                             => 'acf_after_title',
			'style'                                => 'default',
			'label_placement'                      => 'top',
			'instruction_placement'                => 'label',
			'active'                               => true,
		);
	}

	/**
	 * Every non-repeater ACF sub-field nested (at any depth) under a given
	 * top-level field group shares ONE flat postmeta namespace — ACF's
	 * `group` field type does NOT prefix its sub-fields' storage by the
	 * parent group's name (unlike `repeater`, which prefixes by
	 * `{repeater_name}_{row}_{sub_field_name}`). Two sub-fields anywhere
	 * that share the same raw `name` silently overwrite each other's stored
	 * value the moment both are populated — the GraphQL field name is
	 * unaffected and stays exactly what the frontend already expects; only
	 * the raw storage name needs to be unique. Every helper below therefore
	 * takes a $prefix/$key_suffix and folds it into the storage name, the
	 * same way it already folds into the field KEY.
	 *
	 * IMPORTANT — two separate, empirically-confirmed WPGraphQL for ACF
	 * limitations shape this whole file:
	 *
	 * 1. A `group`-type field NESTED inside another field group's `fields`
	 *    array (i.e. not the field group's own direct field) breaks
	 *    resolution for every text/textarea/link/wysiwyg/relationship
	 *    sub-field inside it — they all resolve to null over GraphQL no
	 *    matter how deep, while radio/true_false/number fields at the same
	 *    position resolve fine. A field group's OWN top-level fields (like
	 *    `group_sira_company_details`'s `shortDescriptor`) are NOT nested
	 *    this way and resolve correctly. This is why every Homepage section
	 *    below (hero, ticker, about, ... contact, footer) is registered as
	 *    its OWN standalone top-level field group targeting `Page` directly
	 *    (see group_homepage_section_groups()/branch_homepage_section_groups()),
	 *    instead of being nested `group` fields inside one big
	 *    `group_sira_homepage` field group as earlier versions of this file
	 *    had it.
	 *
	 * 2. `repeater`-type fields do not resolve at all over GraphQL in this
	 *    setup — confirmed null even as a field group's own direct
	 *    top-level field (zero nesting), unlike every other field type.
	 *    Hero slides, ticker items, and the metrics/statistics repeaters
	 *    are therefore a KNOWN, currently-unresolved gap: their definitions
	 *    are kept here (correct data model, correct storage) so admin entry
	 *    and the ACF field registry stay intact, but the frontend cannot
	 *    read them via GraphQL yet. Flagging this explicitly rather than
	 *    silently dropping the fields — a follow-up fix (a different field
	 *    type, or a raw-postmeta read path) is needed separately.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	private static function group_homepage_section_groups(): array {
		return array(
			'group_sira_group_hero' => self::homepage_section_group(
				'group_sira_group_hero',
				'Group Homepage — Hero',
				'groupHero',
				'SiraGroupHeroSection',
				array(
					self::text(
						'field_sira_group_hero_heading_before',
						'Heading Before Highlight',
						'hero_heading_before',
						'headingBefore'
					),
					self::text(
						'field_sira_group_hero_heading_highlight',
						'Highlighted Heading',
						'hero_heading_highlight',
						'headingHighlight'
					),
					self::text(
						'field_sira_group_hero_heading_after',
						'Heading After Highlight',
						'hero_heading_after',
						'headingAfter'
					),
					self::textarea(
						'field_sira_group_hero_description',
						'Description',
						'hero_description',
						'description',
						array( 'rows' => 4 )
					),
					self::link_field(
						'field_sira_group_hero_primary_cta',
						'Primary CTA',
						'hero_primary_cta',
						'primaryCta'
					),
					self::link_field(
						'field_sira_group_hero_secondary_cta',
						'Secondary CTA',
						'hero_secondary_cta',
						'secondaryCta'
					),
					// NOTE: repeater, does not resolve over GraphQL yet — see
					// the class-level doc comment on this method, point 2.
					self::repeater(
						'field_sira_group_hero_slides',
						'Hero Slides',
						'hero_slides',
						'slides',
						'SiraGroupHeroSlide',
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
			'group_sira_group_ticker' => self::homepage_section_group(
				'group_sira_group_ticker',
				'Group Homepage — Announcement Ticker',
				'ticker',
				'SiraGroupTickerSection',
				array(
					self::true_false(
						'field_sira_group_ticker_enabled',
						'Enabled',
						'ticker_enabled',
						'enabled',
						array( 'default_value' => 1 )
					),
					// NOTE: repeater, does not resolve over GraphQL yet.
					self::repeater(
						'field_sira_group_ticker_items',
						'Ticker Items',
						'ticker_items',
						'items',
						'SiraGroupTickerItem',
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
			'group_sira_group_latest_updates' => self::homepage_section_group(
				'group_sira_group_latest_updates',
				'Group Homepage — Latest Updates',
				'latestUpdates',
				'SiraGroupLatestUpdatesSection',
				self::editorial_section_fields( 'latest_updates', 'group_latest_updates' )
			),
			'group_sira_group_companies' => self::homepage_section_group(
				'group_sira_group_companies',
				'Group Homepage — Company Portfolio',
				'companies',
				'SiraGroupCompaniesSection',
				self::relationship_section_fields( 'companies', array( 'sira_company' ), 'selectedCompanies', 12 )
			),
			'group_sira_group_about' => self::homepage_section_group(
				'group_sira_group_about',
				'Group Homepage — About & Metrics',
				'about',
				'SiraGroupAboutSection',
				array_merge(
					self::section_header_sub_fields( 'about' ),
					array(
						self::wysiwyg(
							'field_sira_group_about_body',
							'Body',
							'about_body',
							'body'
						),
						// NOTE: repeater, does not resolve over GraphQL yet.
						self::repeater(
							'field_sira_group_about_metrics',
							'Metrics',
							'about_metrics',
							'metrics',
							'SiraGroupAboutMetric',
							self::metric_fields( 'about_metric' ),
							array(
								'layout'       => 'table',
								'button_label' => 'Add metric',
								'max'          => 8,
							)
						),
					)
				)
			),
			'group_sira_group_investor' => self::homepage_section_group(
				'group_sira_group_investor',
				'Group Homepage — Investor Section',
				'investor',
				'SiraGroupInvestorSection',
				array_merge(
					self::section_header_sub_fields( 'investor' ),
					array(
						self::wysiwyg(
							'field_sira_group_investor_body',
							'Body',
							'investor_body',
							'body'
						),
						// NOTE: repeater, does not resolve over GraphQL yet.
						self::repeater(
							'field_sira_group_investor_metrics',
							'Investor Metrics',
							'investor_metrics',
							'metrics',
							'SiraGroupInvestorMetric',
							self::metric_fields( 'investor_metric' ),
							array(
								'layout'       => 'table',
								'button_label' => 'Add investor metric',
								'max'          => 8,
							)
						),
						self::relationship(
							'field_sira_group_investor_items',
							'Selected Public Investments',
							'investor_selected_investments',
							'selectedInvestments',
							array( 'sira_investment' ),
							array( 'max' => 6 )
						),
						self::relationship(
							'field_sira_group_investor_one_pager',
							'One-pager Document',
							'investor_one_pager_document',
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
							'investor_form_heading',
							'formHeading'
						),
						self::textarea(
							'field_sira_group_investor_form_description',
							'Form Description',
							'investor_form_description',
							'formDescription',
							array( 'rows' => 3 )
						),
					)
				)
			),
			'group_sira_group_services' => self::homepage_section_group(
				'group_sira_group_services',
				'Group Homepage — Services',
				'services',
				'SiraGroupServicesSection',
				self::relationship_section_fields( 'services', array( 'sira_service' ), 'selectedServices', 12 )
			),
			'group_sira_group_projects' => self::homepage_section_group(
				'group_sira_group_projects',
				'Group Homepage — Projects',
				'groupProjects',
				'SiraGroupProjectsSection',
				self::relationship_section_fields( 'projects', array( 'sira_project' ), 'selectedProjects', 12 )
			),
			'group_sira_group_insights' => self::homepage_section_group(
				'group_sira_group_insights',
				'Group Homepage — Insights & News',
				'groupInsights',
				'SiraGroupInsightsSection',
				self::editorial_section_fields( 'insights', 'group_insights' )
			),
			'group_sira_group_testimonials' => self::homepage_section_group(
				'group_sira_group_testimonials',
				'Group Homepage — Testimonials',
				'testimonials',
				'SiraGroupTestimonialsSection',
				self::relationship_section_fields( 'testimonials', array( 'sira_testimonial' ), 'selectedTestimonials', 8 )
			),
			'group_sira_group_partners' => self::homepage_section_group(
				'group_sira_group_partners',
				'Group Homepage — Partners',
				'partners',
				'SiraGroupPartnersSection',
				self::relationship_section_fields( 'partners', array( 'sira_partner' ), 'selectedPartners', 24 )
			),
			'group_sira_group_contact' => self::homepage_section_group(
				'group_sira_group_contact',
				'Group Homepage — Contact',
				'groupContact',
				'SiraGroupContactSection',
				self::contact_section_fields( 'group' )
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
	private static function branch_homepage_section_groups(): array {
		return array(
			'group_sira_branch_hero' => self::homepage_section_group(
				'group_sira_branch_hero',
				'Branch Homepage — Hero',
				'branchHero',
				'SiraBranchHeroSection',
				array(
					self::text(
						'field_sira_branch_hero_eyebrow',
						'Eyebrow',
						'branch_hero_eyebrow',
						'eyebrow'
					),
					self::text(
						'field_sira_branch_hero_region',
						'Region',
						'branch_hero_region',
						'region'
					),
					self::text(
						'field_sira_branch_hero_heading_before',
						'Heading Before Highlight',
						'branch_hero_heading_before',
						'headingBefore',
						array( 'required' => 1 )
					),
					self::text(
						'field_sira_branch_hero_heading_highlight',
						'Highlighted Heading',
						'branch_hero_heading_highlight',
						'headingHighlight',
						array( 'required' => 1 )
					),
					self::text(
						'field_sira_branch_hero_heading_after',
						'Heading After Highlight',
						'branch_hero_heading_after',
						'headingAfter'
					),
					self::textarea(
						'field_sira_branch_hero_description',
						'Description',
						'branch_hero_description',
						'description',
						array(
							'rows'     => 4,
							'required' => 1,
						)
					),
					self::image(
						'field_sira_branch_hero_image',
						'Hero Image',
						'branch_hero_image',
						'image',
						array( 'required' => 1 )
					),
					self::image(
						'field_sira_branch_hero_mobile_image',
						'Mobile Hero Image',
						'branch_hero_mobile_image',
						'mobileImage'
					),
					self::text(
						'field_sira_branch_hero_alt',
						'Image Alt Override',
						'branch_hero_image_alt',
						'imageAlt'
					),
					self::link_field(
						'field_sira_branch_hero_primary_cta',
						'Primary CTA',
						'branch_hero_primary_cta',
						'primaryCta'
					),
					self::link_field(
						'field_sira_branch_hero_secondary_cta',
						'Secondary CTA',
						'branch_hero_secondary_cta',
						'secondaryCta'
					),
				)
			),
			'group_sira_branch_statistics' => self::homepage_section_group(
				'group_sira_branch_statistics',
				'Branch Homepage — Statistics',
				'statistics',
				'SiraBranchStatisticsSection',
				array(
					// NOTE: repeater, does not resolve over GraphQL yet.
					self::repeater(
						'field_sira_branch_statistics',
						'Statistics',
						'branch_statistics',
						'statistics',
						'SiraBranchStatistic',
						self::metric_fields( 'branch_statistic' ),
						array(
							'layout'       => 'table',
							'button_label' => 'Add statistic',
							'max'          => 8,
						)
					),
				)
			),
			'group_sira_branch_overview' => self::homepage_section_group(
				'group_sira_branch_overview',
				'Branch Homepage — Overview',
				'overview',
				'SiraBranchOverviewSection',
				array_merge(
					self::section_header_sub_fields( 'branch_overview' ),
					array(
						self::wysiwyg(
							'field_sira_branch_overview_body',
							'Body',
							'branch_overview_body',
							'body'
						),
					)
				)
			),
			'group_sira_branch_focus_areas' => self::homepage_section_group(
				'group_sira_branch_focus_areas',
				'Branch Homepage — Focus Areas',
				'focusAreas',
				'SiraBranchFocusAreasSection',
				array(
					// NOTE: repeater, does not resolve over GraphQL yet.
					self::repeater(
						'field_sira_branch_focus_areas',
						'Focus Areas',
						'branch_focus_areas',
						'focusAreas',
						'SiraBranchFocusArea',
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
				)
			),
			'group_sira_branch_projects' => self::homepage_section_group(
				'group_sira_branch_projects',
				'Branch Homepage — Projects',
				'branchProjects',
				'SiraBranchProjectsSection',
				self::relationship_section_fields( 'branch_projects', array( 'sira_project' ), 'selectedProjects', 12 )
			),
			'group_sira_branch_insights' => self::homepage_section_group(
				'group_sira_branch_insights',
				'Branch Homepage — Insights & News',
				'branchInsights',
				'SiraBranchInsightsSection',
				self::editorial_section_fields( 'branch_insights', 'branch_insights' )
			),
			'group_sira_branch_contact' => self::homepage_section_group(
				'group_sira_branch_contact',
				'Branch Homepage — Contact',
				'branchContact',
				'SiraBranchContactSection',
				self::contact_section_fields( 'branch' )
			),
			'group_sira_branch_footer' => self::homepage_section_group(
				'group_sira_branch_footer',
				'Branch Homepage — Footer',
				'footer',
				'SiraBranchFooterSection',
				array(
					self::text(
						'field_sira_branch_footer_tagline',
						'Tagline Override',
						'branch_footer_tagline',
						'taglineOverride'
					),
					self::text(
						'field_sira_branch_footer_group_label',
						'Group Link Label Override',
						'branch_footer_group_link_label',
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
	 * Shared front-page location rule used by every Homepage section field
	 * group (and the variant selector itself).
	 *
	 * @return array<int,array<int,array<string,mixed>>>
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
	 * Wraps a Homepage section's own fields into a standalone, top-level
	 * ACF field group targeting `Page` directly — see the class-level doc
	 * comment on group_homepage_section_groups() for why every section is
	 * its own field group instead of being nested inside one big wrapper.
	 *
	 * Deliberately has no `conditional_logic`: that's a per-FIELD setting
	 * in ACF, not a field-group-level one, and since resolving the
	 * blank-homepage bug matters far more than wp-admin polish right now,
	 * every section's edit-screen metabox is simply always visible
	 * regardless of the selected variant. Revisit once the frontend is
	 * confirmed working end to end.
	 *
	 * @param array<int,array<string,mixed>> $fields Fields.
	 * @return array<string,mixed>
	 */
	private static function homepage_section_group(
		string $key,
		string $title,
		string $graphql_field_name,
		string $graphql_type_name,
		array $fields
	): array {
		return array(
			'key'                                  => $key,
			'title'                                => $title,
			'show_in_graphql'                      => true,
			'graphql_field_name'                   => $graphql_field_name,
			'graphql_type_name'                    => $graphql_type_name,
			'map_graphql_types_from_location_rules' => false,
			'graphql_types'                        => array( 'Page' ),
			'fields'                               => $fields,
			'location'                             => self::front_page_location(),
			'position'                             => 'normal',
			'style'                                => 'default',
			'label_placement'                      => 'top',
			'instruction_placement'                => 'label',
			'active'                               => true,
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
	 * $prefix and $key_suffix must be globally unique across every call
	 * site in this file — see the note on group_homepage_section_groups()
	 * above for why (flat postmeta namespace).
	 *
	 * @return array<int,array<string,mixed>>
	 */
	private static function editorial_section_fields( string $key_suffix, string $prefix ): array {
		return array_merge(
			self::section_header_sub_fields( $prefix ),
			array(
				self::radio(
					'field_sira_' . $key_suffix . '_source_mode',
					'Source Mode',
					$key_suffix . '_source_mode',
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
					$key_suffix . '_selected_items',
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
					$key_suffix . '_item_limit',
					'itemLimit',
					array(
						'default_value' => 3,
						'min'           => 1,
						'max'           => 12,
						'step'          => 1,
					)
				),
			)
		);
	}

	/**
	 * $key_suffix must be globally unique across every call site in this
	 * file — see the note on group_homepage_section_groups() above for why.
	 *
	 * @param array<int,string> $post_types Post types.
	 * @return array<int,array<string,mixed>>
	 */
	private static function relationship_section_fields(
		string $key_suffix,
		array $post_types,
		string $relationship_graphql_field,
		int $maximum
	): array {
		return array_merge(
			self::section_header_sub_fields( $key_suffix ),
			array(
				self::relationship(
					'field_sira_' . $key_suffix . '_items',
					'Selected Items',
					$key_suffix . '_selected_items',
					$relationship_graphql_field,
					$post_types,
					array( 'max' => $maximum )
				),
			)
		);
	}

	/**
	 * $context must be globally unique across every call site in this file
	 * — see the note on group_homepage_section_groups() above for why.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	private static function contact_section_fields( string $context ): array {
		return array(
			self::text(
				'field_sira_' . $context . '_contact_eyebrow',
				'Eyebrow',
				$context . '_contact_eyebrow',
				'eyebrow'
			),
			self::text(
				'field_sira_' . $context . '_contact_heading',
				'Heading',
				$context . '_contact_heading',
				'heading'
			),
			self::textarea(
				'field_sira_' . $context . '_contact_description',
				'Description',
				$context . '_contact_description',
				'description',
				array( 'rows' => 4 )
			),
			self::radio(
				'field_sira_' . $context . '_contact_form_variant',
				'Form Variant',
				$context . '_contact_form_variant',
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
				$context . '_contact_form_context',
				'formContext',
				array(
					'maxlength'    => 100,
					'instructions' => 'A non-secret routing context validated against the future frontend form registry.',
				)
			),
		);
	}

	/**
	 * $prefix must be globally unique across every call site in this file —
	 * see the note on group_homepage_section_groups() above for why.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	private static function section_header_sub_fields( string $prefix ): array {
		return array(
			self::text(
				'field_sira_' . $prefix . '_eyebrow',
				'Eyebrow',
				$prefix . '_eyebrow',
				'eyebrow'
			),
			self::text(
				'field_sira_' . $prefix . '_heading',
				'Heading',
				$prefix . '_heading',
				'heading'
			),
			self::textarea(
				'field_sira_' . $prefix . '_description',
				'Description',
				$prefix . '_description',
				'description',
				array( 'rows' => 3 )
			),
			self::link_field(
				'field_sira_' . $prefix . '_link',
				'Section Link',
				$prefix . '_link',
				'link'
			),
		);
	}

	/**
	 * $prefix must be globally unique across every call site in this file so
	 * each sub-field's ACF KEY is unique — but unlike section_header_sub_fields()
	 * etc., the raw storage NAME here is deliberately left bare ('value',
	 * 'label', 'supporting_text'). These sub-fields only ever live inside a
	 * repeater, and repeaters already namespace their row storage by their
	 * own name (the name passed to self::repeater() at each call site, which
	 * independently must be unique), so prefixing the sub-field names too
	 * would be redundant. It also has to stay bare: the starter importer
	 * writes repeater rows as plain ['value' => ..., 'label' => ...,
	 * 'supporting_text' => ...] arrays keyed by these raw names.
	 *
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
	private static function repeater(
		string $key,
		string $label,
		string $name,
		string $graphql_field_name,
		string $graphql_type_name,
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
				'graphql_type_name'    => $graphql_type_name,
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

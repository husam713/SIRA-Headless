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
			'group_sira_digital_homepage'   => self::digital_homepage_group(),
			'group_sira_digital_about'      => self::digital_about_group(),
			'group_sira_company_details'    => self::company_group(),
			'group_sira_investment_details' => self::investment_group(),
			'group_sira_testimonial_details' => self::testimonial_group(),
			'group_sira_partner_details'    => self::partner_group(),
			'group_sira_profile'            => self::profile_group(),
			'group_sira_page_intro'         => self::page_intro_group(),
			'group_sira_locale'             => self::locale_group(),
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
						'group'   => 'Group homepage',
						'branch'  => 'Branch homepage',
						'digital' => 'Digital homepage',
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
			'location'                             => self::homepage_location(),
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
			'location'                             => self::homepage_location(),
			'menu_order'                           => 12,
			'position'                             => 'normal',
			'style'                                => 'default',
			'label_placement'                      => 'top',
			'instruction_placement'                => 'label',
			'active'                               => true,
		);
	}

	/**
	 * Digital homepage sections, registered as their own field group (ADR-033).
	 *
	 * SIRA Digital does not share the branch composition, so it does not share
	 * the branch field group either. Reusing `branchHomepage` would have forced
	 * an editor on the Digital site to fill in a hero image, a region and a
	 * statistics repeater that its page never renders, and would have left the
	 * capability rail, the reach band and the wordmark with nowhere to live.
	 *
	 * Storage names carry a `digital_` prefix for the same reason the branch
	 * ones carry `branch_`: a front page can in principle hold more than one of
	 * these groups, and ACF stores sub-fields under the parent's name.
	 *
	 * @return array<string,mixed>
	 */
	private static function digital_homepage_group(): array {
		return array(
			'key'                                  => 'group_sira_digital_homepage',
			'title'                                => 'SIRA Homepage — Digital Sections',
			'show_in_graphql'                      => true,
			'graphql_field_name'                   => 'digitalHomepage',
			'graphql_type_name'                    => 'SiraDigitalHomepage',
			'map_graphql_types_from_location_rules' => false,
			'graphql_types'                        => array( 'Page' ),
			'fields'                               => self::digital_homepage_fields(),
			'location'                             => self::homepage_location(),
			'menu_order'                           => 13,
			'position'                             => 'normal',
			'style'                                => 'default',
			'label_placement'                      => 'top',
			'instruction_placement'                => 'label',
			'active'                               => true,
		);
	}

	/**
	 * SIRA Digital's About composition.
	 *
	 * A group of its own rather than more fields on the homepage group, because
	 * the two pages answer different questions and an editor should not scroll
	 * past a hero they are not editing to reach a stat band they are.
	 *
	 * Located on the About page in EACH language, so the Arabic copy is authored
	 * in Arabic rather than translated at render time — the same reasoning, and
	 * the same mechanism, as the localized homepage.
	 *
	 * Every section is optional, and the route omits any section whose data is
	 * absent. That is what lets the page ship before the owner has supplied the
	 * real team, figures and portraits, without any of it being faked in React.
	 *
	 * `graphql_type_name` is declared as what wpgraphql-acf 2.x actually
	 * produces. It derives the type from `graphql_field_name`, so `digitalAbout`
	 * yields `DigitalAbout` — NOT the `SiraDigitalAbout` a declaration might
	 * suggest. Declaring the real name keeps the next reader from searching the
	 * schema for a type that is not in it.
	 *
	 * @return array<string,mixed>
	 */
	private static function digital_about_group(): array {
		return array(
			'key'                                  => 'group_sira_digital_about',
			'title'                                => 'SIRA About — Digital Sections',
			'show_in_graphql'                      => true,
			'graphql_field_name'                   => 'digitalAbout',
			'graphql_type_name'                    => 'DigitalAbout',
			'map_graphql_types_from_location_rules' => false,
			'graphql_types'                        => array( 'Page' ),
			'fields'                               => self::digital_about_fields(),
			'location'                             => self::about_location(),
			'menu_order'                           => 14,
			'position'                             => 'normal',
			'style'                                => 'default',
			'label_placement'                      => 'top',
			'instruction_placement'                => 'label',
			'active'                               => true,
		);
	}

	/**
	 * Which language a record is written in, and which record it translates.
	 *
	 * ADR-034. The locale is stored EXPLICITLY rather than inferred from a slug
	 * naming convention. A convention was the first design and it was wrong for a
	 * specific, ordinary reason: slugs are editor-editable, so renaming a record
	 * would silently move it between languages, and nothing in WordPress would
	 * warn anybody. Routing still uses the `/ar/` URL prefix — that is a URL
	 * decision — but what a record IS comes from this field.
	 *
	 * `translation_of` points from the translation to the original, so exactly one
	 * record owns the link and there is no pair to keep symmetric. It is optional:
	 * a page that exists only in Arabic is a real editorial state, not an error.
	 *
	 * Registered network-wide because every site in the registry declares Arabic
	 * as a supported locale. A tenant that has not translated anything simply
	 * leaves every record at the default, which costs it nothing.
	 *
	 * @return array<string,mixed>
	 */
	private static function locale_group(): array {
		return array(
			'key'                                  => 'group_sira_locale',
			'title'                                => 'SIRA Language',
			'show_in_graphql'                      => true,
			'graphql_field_name'                   => 'siraLocale',
			// wpgraphql-acf 2.x derives the GraphQL type name from
			// `graphql_field_name`, not from this key, so the live type is
			// `SiraLocale`. Declared to match what is actually produced rather than
			// to what would be nice, because a name that only exists in this file
			// sends the next person looking for a type that is not there.
			'graphql_type_name'                    => 'SiraLocale',
			'map_graphql_types_from_location_rules' => false,
			'graphql_types'                        => array(
				'Page',
				'SiraService',
				'SiraProject',
				'SiraIndustry',
				'SiraProduct',
				'SiraLeadershipProfile',
			),
			'fields'                               => array(
				self::radio(
					'field_sira_locale_code',
					'Language',
					'sira_locale',
					'code',
					array(
						'en' => 'English',
						'ar' => 'Arabic',
					),
					'en',
					array( 'layout' => 'horizontal' )
				),
				self::field(
					'field_sira_locale_translation_of',
					'Translation Of',
					'sira_translation_of',
					'post_object',
					'translationOf',
					array(
						'post_type'         => array( 'page', 'sira_service', 'sira_project', 'sira_product', 'sira_leadership' ),
						'return_format'     => 'id',
						'multiple'          => 0,
						'allow_null'        => 1,
						'instructions'      => 'The record in the default language that this one translates. Leave empty when this record has no counterpart.',
						'conditional_logic' => array(
							array(
								array(
									'field'    => 'field_sira_locale_code',
									'operator' => '!=',
									'value'    => 'en',
								),
							),
						),
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
				),
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'sira_service',
					),
				),
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'sira_project',
					),
				),
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'sira_product',
					),
				),
				array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'sira_leadership',
					),
				),
				array(
					array(
						'param'    => 'taxonomy',
						'operator' => '==',
						'value'    => 'sira_industry',
					),
				),
			),
			'menu_order'                           => 20,
			'position'                             => 'side',
			'style'                                => 'default',
			'label_placement'                      => 'top',
			'instruction_placement'                => 'label',
			'active'                               => true,
		);
	}

	/**
	 * The heading block at the top of a standalone page.
	 *
	 * Index pages — services, work, industries, contact — used to carry their
	 * eyebrow, headline and standfirst as literal strings inside React. That made
	 * the most prominent copy on each page the one part an editor could not
	 * change, and it made a second language a code change rather than a content
	 * change. Both problems have the same fix, so this group exists once, for
	 * every page, on every site in the network.
	 *
	 * Every field is optional. A page that sets none of them renders exactly as
	 * it did before, which is what keeps this safe to add network-wide.
	 *
	 * @return array<string,mixed>
	 */
	private static function page_intro_group(): array {
		return self::content_group(
			'group_sira_page_intro',
			'SIRA Page Intro',
			'pageIntro',
			'PageIntro',
			'Page',
			'page',
			array(
				self::text(
					'field_sira_page_intro_eyebrow',
					'Eyebrow',
					'eyebrow',
					'eyebrow'
				),
				self::text(
					'field_sira_page_intro_heading',
					'Heading',
					'heading',
					'heading'
				),
				self::textarea(
					'field_sira_page_intro_standfirst',
					'Standfirst',
					'standfirst',
					'standfirst',
					array( 'new_lines' => '' )
				),
				self::text(
					'field_sira_page_intro_cta_label',
					'Closing Call To Action Label',
					'cta_label',
					'ctaLabel'
				),
				self::text(
					'field_sira_page_intro_cta_heading',
					'Closing Call To Action Heading',
					'cta_heading',
					'ctaHeading'
				),
			)
		);
	}

	/**
	 * @return array<int,array<string,mixed>>
	 */
	private static function digital_homepage_fields(): array {
		return array(
			self::group_field(
				'field_sira_digital_home_hero',
				'Hero',
				'digital_hero',
				'hero',
				array(
					self::text(
						'field_sira_digital_hero_eyebrow',
						'Eyebrow',
						'eyebrow',
						'eyebrow'
					),
					self::text(
						'field_sira_digital_hero_heading_before',
						'Heading Before Highlight',
						'heading_before',
						'headingBefore'
					),
					self::text(
						'field_sira_digital_hero_heading_highlight',
						'Highlighted Heading',
						'heading_highlight',
						'headingHighlight'
					),
					self::text(
						'field_sira_digital_hero_heading_after',
						'Heading After Highlight',
						'heading_after',
						'headingAfter'
					),
					self::textarea(
						'field_sira_digital_hero_description',
						'Description',
						'description',
						'description',
						array( 'rows' => 3 )
					),
					self::link_field(
						'field_sira_digital_hero_primary_cta',
						'Primary Call To Action',
						'primary_cta',
						'primaryCta'
					),
					self::link_field(
						'field_sira_digital_hero_secondary_cta',
						'Secondary Call To Action',
						'secondary_cta',
						'secondaryCta'
					),
				)
			),
			self::text(
				'field_sira_digital_capabilities_eyebrow',
				'Capabilities Eyebrow',
				'digital_capabilities_eyebrow',
				'capabilitiesEyebrow'
			),
			self::repeater(
				'field_sira_digital_capabilities',
				'Capabilities',
				'digital_capabilities',
				'capabilities',
				array(
					self::text(
						'field_sira_digital_capability_title',
						'Title',
						'title',
						'title'
					),
					self::textarea(
						'field_sira_digital_capability_summary',
						'Summary',
						'summary',
						'summary',
						array( 'rows' => 3 )
					),
					self::link_field(
						'field_sira_digital_capability_link',
						'Link',
						'link',
						'link'
					),
				),
				// Twelve is the cap the frontend normalizer enforces. Stating it
				// here too means an editor is stopped at the point of authoring
				// rather than silently losing rows at render.
				array( 'max' => 12 )
			),
			self::group_field(
				'field_sira_digital_home_marquee',
				'Reach Band',
				'digital_marquee',
				'marquee',
				array_merge(
					self::section_header_sub_fields( 'digital_marquee' ),
					array(
						self::wysiwyg(
							'field_sira_digital_marquee_body',
							'Body',
							'body',
							'body'
						),
						self::repeater(
							'field_sira_digital_marquee_items',
							'Items',
							'items',
							'items',
							array(
								self::text(
									'field_sira_digital_marquee_item_label',
									'Label',
									'label',
									'label'
								),
							),
							array( 'max' => 40 )
						),
					)
				)
			),
			self::group_field(
				'field_sira_digital_home_wordmark',
				'Kinetic Wordmark',
				'digital_wordmark',
				'wordmark',
				array(
					self::text(
						'field_sira_digital_wordmark_word',
						'Word',
						'word',
						'word',
						// The band renders nothing without this, so an editor who
						// opens the group is told so rather than finding an empty
						// two-screen gap on the page.
						array(
							'instructions' => 'The band renders only when this is set.',
							'maxlength'    => 40,
						)
					),
					self::textarea(
						'field_sira_digital_wordmark_lockup',
						'Supporting Line',
						'lockup',
						'lockup',
						array( 'rows' => 2 )
					),
					self::link_field(
						'field_sira_digital_wordmark_link',
						'Link',
						'link',
						'link'
					),
				)
			),
			self::editorial_section(
				'digital_insights',
				'Insights',
				'insights'
			),
			self::contact_section( 'digital_home', 'Contact', 'digital_contact' ),
		);
	}

	/**
	 * The About composition's sections.
	 *
	 * Measured against the reference audit: hero, a four-figure band, the team,
	 * a statement carrying the quote, the three-stage method, then insights and
	 * the closing ask. The narrative runs person → numbers → people → philosophy
	 * → method → proof → ask, and the field order here is that order, so an
	 * editor scrolls the admin in the same sequence a reader scrolls the page.
	 *
	 * @return array<int,array<string,mixed>>
	 */
	private static function digital_about_fields(): array {
		return array(
			self::group_field(
				'field_sira_digital_about_hero',
				'Hero',
				'digital_about_hero',
				'hero',
				array(
					self::text(
						'field_sira_digital_about_hero_eyebrow',
						'Eyebrow',
						'eyebrow',
						'eyebrow'
					),
					self::text(
						'field_sira_digital_about_hero_heading_before',
						'Heading Before Highlight',
						'heading_before',
						'headingBefore'
					),
					self::text(
						'field_sira_digital_about_hero_heading_highlight',
						'Highlighted Heading',
						'heading_highlight',
						'headingHighlight'
					),
					self::text(
						'field_sira_digital_about_hero_heading_after',
						'Heading After Highlight',
						'heading_after',
						'headingAfter'
					),
					self::textarea(
						'field_sira_digital_about_hero_description',
						'Description',
						'description',
						'description',
						array( 'rows' => 3 )
					),
					self::link_field(
						'field_sira_digital_about_hero_primary_cta',
						'Primary Call To Action',
						'primary_cta',
						'primaryCta'
					),
					self::link_field(
						'field_sira_digital_about_hero_secondary_cta',
						'Secondary Call To Action',
						'secondary_cta',
						'secondaryCta'
					),
					self::image(
						'field_sira_digital_about_hero_portrait',
						'Portrait',
						'portrait',
						'portrait',
						array( 'instructions' => 'Optional. The hero renders without it rather than reserving an empty frame.' )
					),
				)
			),
			self::repeater(
				'field_sira_digital_about_stats',
				'Statistics',
				'digital_about_stats',
				'stats',
				array(
					self::text(
						'field_sira_digital_about_stat_value',
						'Value',
						'value',
						'value',
						array( 'maxlength' => 12 )
					),
					self::text(
						'field_sira_digital_about_stat_label',
						'Label',
						'label',
						'label'
					),
				),
				// Four is the measured width of the band. Eight is the cap the
				// frontend normalizer enforces, stated here too so an editor is
				// stopped while authoring rather than losing rows at render.
				array(
					'max'          => 8,
					'instructions' => 'Every figure here is a business claim a reader will take as fact.',
				)
			),
			self::group_field(
				'field_sira_digital_about_team',
				'Team',
				'digital_about_team',
				'team',
				array(
					self::text(
						'field_sira_digital_about_team_eyebrow',
						'Eyebrow',
						'eyebrow',
						'eyebrow'
					),
					self::text(
						'field_sira_digital_about_team_heading',
						'Heading',
						'heading',
						'heading'
					),
					self::textarea(
						'field_sira_digital_about_team_standfirst',
						'Standfirst',
						'standfirst',
						'standfirst',
						array( 'rows' => 2 )
					),
				),
				// The people themselves are Leader records, not rows here: a
				// person has a portrait, a locale and a body, and belongs in the
				// admin under their own name rather than inside a page's fields.
				array( 'instructions' => 'The heading for the team section. The people are edited under SIRA Content → Leadership.' )
			),
			self::group_field(
				'field_sira_digital_about_statement',
				'Statement',
				'digital_about_statement',
				'statement',
				array(
					self::text(
						'field_sira_digital_about_statement_ghost_word',
						'Background Word',
						'ghost_word',
						'ghostWord',
						array(
							'maxlength'    => 16,
							'instructions' => 'Set oversized behind the section. Decorative, and hidden from assistive technology.',
						)
					),
					self::wysiwyg(
						'field_sira_digital_about_statement_body',
						'Body',
						'body',
						'body'
					),
					self::textarea(
						'field_sira_digital_about_statement_quote',
						'Quote',
						'quote',
						'quote',
						array( 'rows' => 3 )
					),
					self::text(
						'field_sira_digital_about_statement_attribution_name',
						'Attribution Name',
						'attribution_name',
						'attributionName'
					),
					self::text(
						'field_sira_digital_about_statement_attribution_role',
						'Attribution Role',
						'attribution_role',
						'attributionRole'
					),
					self::repeater(
						'field_sira_digital_about_statement_socials',
						'Social Links',
						'socials',
						'socials',
						array(
							self::text(
								'field_sira_digital_about_social_network',
								'Network',
								'network',
								'network',
								array( 'instructions' => 'Used as the link’s accessible name.' )
							),
							self::url(
								'field_sira_digital_about_social_url',
								'URL',
								'url',
								'url'
							),
						),
						array( 'max' => 8 )
					),
				)
			),
			self::group_field(
				'field_sira_digital_about_process',
				'How We Work',
				'digital_about_process',
				'process',
				array(
					self::text(
						'field_sira_digital_about_process_eyebrow',
						'Eyebrow',
						'eyebrow',
						'eyebrow'
					),
					self::text(
						'field_sira_digital_about_process_heading',
						'Heading',
						'heading',
						'heading'
					),
					self::textarea(
						'field_sira_digital_about_process_standfirst',
						'Standfirst',
						'standfirst',
						'standfirst',
						array( 'rows' => 2 )
					),
					self::repeater(
						'field_sira_digital_about_process_steps',
						'Stages',
						'steps',
						'steps',
						array(
							self::text(
								'field_sira_digital_about_process_step_title',
								'Title',
								'title',
								'title'
							),
							self::textarea(
								'field_sira_digital_about_process_step_body',
								'Body',
								'body',
								'body',
								array( 'rows' => 3 )
							),
						),
						array( 'max' => 6 )
					),
				)
			),
			self::editorial_section(
				'digital_about_insights',
				'Insights',
				'insights'
			),
		);
	}

	/**
	 * Where the homepage section groups appear.
	 *
	 * The front page, plus each localized homepage.
	 *
	 * ADR-034 gives a locale its own page in the same site, so the Arabic
	 * homepage is an ordinary page at `/ar/` rather than the site's front page —
	 * and a `page_type == front_page` rule alone would therefore have left an
	 * editor with no way to fill in the Arabic hero, capabilities, marquee or
	 * wordmark. The fields would still have RESOLVED over GraphQL, because the
	 * type mapping is declared rather than derived from these rules, which is the
	 * worst version of the problem: content that renders but cannot be edited.
	 *
	 * @return array<int,array<int,array<string,mixed>>>
	 */
	private static function homepage_location(): array {
		return self::pages_by_path_location( array( 'ar' ), self::front_page_location() );
	}

	/**
	 * Where the About composition appears: the About page in each language.
	 *
	 * `/ar/about/` is a child of the `ar` page rather than a record on a separate
	 * site, so the Arabic copy is addressed by its nested path. Both languages
	 * resolve the same way, which is what stops a second language from needing a
	 * second rule written by hand.
	 *
	 * @return array<int,array<int,array<string,mixed>>>
	 */
	private static function about_location(): array {
		return self::pages_by_path_location( array( 'about', 'ar/about' ) );
	}

	/**
	 * Location rules addressing specific pages by path.
	 *
	 * The pages are looked up at registration time. Guarded because
	 * `definitions()` is also read by the static validator with no WordPress
	 * loaded, where the lookup is simply skipped.
	 *
	 * A path that resolves to nothing is skipped rather than fatal: a tenant that
	 * has not created that page yet is an ordinary editorial state, not an error.
	 * When NOTHING resolves the result is a rule that deliberately cannot match
	 * any post, rather than an empty rule set — an empty `location` is ambiguous
	 * enough between ACF versions that it is not worth relying on, and a group
	 * that accidentally attached itself to every page would be a far worse
	 * failure than one that attaches to none.
	 *
	 * @param array<int,string>                        $paths Page paths.
	 * @param array<int,array<int,array<string,mixed>>> $rules Rules to extend.
	 * @return array<int,array<int,array<string,mixed>>>
	 */
	private static function pages_by_path_location( array $paths, array $rules = array() ): array {
		if ( function_exists( 'get_page_by_path' ) ) {
			foreach ( $paths as $path ) {
				$page = get_page_by_path( $path );

				if ( ! $page instanceof \WP_Post ) {
					continue;
				}

				$rules[] = array(
					array(
						'param'    => 'post_type',
						'operator' => '==',
						'value'    => 'page',
					),
					array(
						'param'    => 'page',
						'operator' => '==',
						'value'    => (string) $page->ID,
					),
				);
			}
		}

		return array() === $rules ? self::unmatchable_location() : $rules;
	}

	/**
	 * A rule set that matches nothing.
	 *
	 * `0` is not a valid post ID, so this is never satisfied. See
	 * `pages_by_path_location()` for why a group that attaches to nothing is
	 * preferable to one whose rule set is empty.
	 *
	 * @return array<int,array<int,array<string,string>>>
	 */
	private static function unmatchable_location(): array {
		return array(
			array(
				array(
					'param'    => 'post_type',
					'operator' => '==',
					'value'    => 'page',
				),
				array(
					'param'    => 'page',
					'operator' => '==',
					'value'    => '0',
				),
			),
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
				'branch_hero',
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
				'branch_statistics',
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
				'branch_overview',
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
				'branch_focus_areas',
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
				'Branch Contact',
				'branch_contact'
			),
			self::group_field(
				'field_sira_branch_footer',
				'Footer',
				'branch_footer',
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
	 * What a Leader record carries beyond title, excerpt and portrait.
	 *
	 * The team grid needs a role line under the name, and optionally a link to
	 * that person's work. Everything else it renders — the name, the one-line
	 * description, the portrait — is already native WordPress, so only the two
	 * genuinely missing fields are added here.
	 *
	 * Registered network-wide on `sira_leadership`, which every site already has.
	 * A tenant that publishes no Leader records is unaffected.
	 *
	 * @return array<string,mixed>
	 */
	private static function profile_group(): array {
		return self::content_group(
			'group_sira_profile',
			'SIRA Profile',
			'siraProfile',
			'SiraProfile',
			'SiraLeadershipProfile',
			'sira_leadership',
			array(
				self::text(
					'field_sira_profile_role',
					'Role',
					'role',
					'role',
					array( 'instructions' => 'The line under the name. Kept short: it sets beside four others.' )
				),
				self::link_field(
					'field_sira_profile_link',
					'Link',
					'link',
					'link',
					array( 'instructions' => 'Optional. Without it the card renders as text rather than as a dead link.' )
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
		string $label,
		string $name = 'contact'
	): array {
		return self::group_field(
			'field_sira_' . $context . '_contact',
			$label,
			$name,
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

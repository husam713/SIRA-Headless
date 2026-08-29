/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
/** Designated areas where navigation menus can be displayed. Represents the named regions in the interface where menus can be assigned. */
export type MenuLocationEnum =
  /** Put the menu in the footer location */
  | 'FOOTER'
  /** Put the menu in the languages location */
  | 'LANGUAGES'
  /** Put the menu in the legal location */
  | 'LEGAL'
  /** Put the menu in the primary location */
  | 'PRIMARY'
  /** Put the menu in the utility location */
  | 'UTILITY';

/** The semantic severity of a public SIRA banner. */
export type SiraBrandBannerSeverity =
  /** Important information requiring attention. */
  | 'IMPORTANT'
  /** General information. */
  | 'INFO'
  /** Urgent or emergency information. */
  | 'URGENT';

export type SiraBrandQueryVariables = Exact<{ [key: string]: never; }>;


export type SiraBrandQuery = { readonly siraBrand: { readonly name: string, readonly key: string, readonly tagline: string | null, readonly primaryColor: string, readonly secondaryColor: string, readonly accentColor: string, readonly paperColor: string, readonly inkColor: string, readonly email: string | null, readonly phone: string | null, readonly address: string | null, readonly description: string | null, readonly mission: string | null, readonly vision: string | null, readonly announcementBanner: string | null, readonly emergencyBanner: string | null, readonly logo: { readonly databaseId: number, readonly sourceUrl: string, readonly altText: string | null, readonly width: number | null, readonly height: number | null, readonly mediaItem: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null } | null } | null, readonly mark: { readonly databaseId: number, readonly sourceUrl: string, readonly altText: string | null, readonly width: number | null, readonly height: number | null, readonly mediaItem: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null } | null } | null, readonly values: ReadonlyArray<{ readonly title: string, readonly description: string | null } | null> | null, readonly officeLocations: ReadonlyArray<{ readonly name: string, readonly address: string | null, readonly phone: string | null, readonly email: string | null } | null> | null, readonly socialProfiles: { readonly linkedin: string | null, readonly instagram: string | null, readonly x: string | null, readonly youtube: string | null } | null, readonly announcement: { readonly message: string, readonly severity: SiraBrandBannerSeverity, readonly startsAt: string | null, readonly endsAt: string | null, readonly dismissible: boolean, readonly revisionKey: string, readonly link: { readonly label: string, readonly url: string, readonly target: string | null } | null } | null, readonly emergency: { readonly message: string, readonly severity: SiraBrandBannerSeverity, readonly startsAt: string | null, readonly endsAt: string | null, readonly dismissible: boolean, readonly revisionKey: string, readonly link: { readonly label: string, readonly url: string, readonly target: string | null } | null } | null } };

export type SiraEditorialFeedQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
}>;


export type SiraEditorialFeedQuery = { readonly contentNodes: { readonly pageInfo: { readonly hasNextPage: boolean, readonly endCursor: string | null }, readonly nodes: ReadonlyArray<
      | { readonly __typename: 'MediaItem', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'Page', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'Post', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraArticle', readonly title: string | null, readonly excerpt: string | null, readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
      | { readonly __typename: 'SiraAward', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraBoardMember', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraCareerArea', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraCaseStudy', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraCompany', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraCsrInitiative', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraDocument', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraDownload', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraEvent', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraExecutive', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraFaq', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraInsight', readonly title: string | null, readonly excerpt: string | null, readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
      | { readonly __typename: 'SiraInvestment', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraInvestor', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraJob', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraLeadershipProfile', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraMediaItem', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraNewsItem', readonly title: string | null, readonly excerpt: string | null, readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
      | { readonly __typename: 'SiraOffice', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraPartner', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraPortfolioItem', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraPressRelease', readonly title: string | null, readonly excerpt: string | null, readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
      | { readonly __typename: 'SiraProject', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraResource', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraService', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraTestimonial', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      | { readonly __typename: 'SiraWhitepaper', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
    > } | null };

export type SiraBusinessUnitEditorialFeedQueryVariables = Exact<{
  businessUnit: string | number;
  first: number;
  after?: string | null | undefined;
}>;


export type SiraBusinessUnitEditorialFeedQuery = { readonly siraBusinessUnit: { readonly contentNodes: { readonly pageInfo: { readonly hasNextPage: boolean, readonly endCursor: string | null }, readonly nodes: ReadonlyArray<
        | { readonly __typename: 'MediaItem', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'Page', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'Post', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraArticle', readonly title: string | null, readonly excerpt: string | null, readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
        | { readonly __typename: 'SiraAward', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraBoardMember', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraCareerArea', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraCaseStudy', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraCompany', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraCsrInitiative', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraDocument', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraDownload', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraEvent', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraExecutive', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraFaq', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraInsight', readonly title: string | null, readonly excerpt: string | null, readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
        | { readonly __typename: 'SiraInvestment', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraInvestor', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraJob', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraLeadershipProfile', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraMediaItem', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraNewsItem', readonly title: string | null, readonly excerpt: string | null, readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
        | { readonly __typename: 'SiraOffice', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraPartner', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraPortfolioItem', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraPressRelease', readonly title: string | null, readonly excerpt: string | null, readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
        | { readonly __typename: 'SiraProject', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraResource', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraService', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraTestimonial', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
        | { readonly __typename: 'SiraWhitepaper', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly uri: string | null, readonly isRestricted: boolean | null }
      > } | null } | null };

export type HomepageLinkFragment = { readonly title: string | null, readonly url: string | null, readonly target: string | null };

export type HomepageMediaFragment = { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null };

export type HomepageFeaturedImageFragment = { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } };

export type HomepageProjectNodeFragment = { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly projectDetails: { readonly subtitle: string | null, readonly location: string | null, readonly status: string | null } | null };

export type HomepageCompanyNodeFragment = { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly companyDetails: { readonly shortDescriptor: string | null, readonly operatingStatus: string | null, readonly externalWebsiteUrl: string | null, readonly cardImageOverride: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null } | null, readonly businessUnit: { readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly name: string | null, readonly slug: string | null }>, readonly pageInfo: { readonly hasNextPage: boolean } } | null };

type HomepageEditorialNode_MediaItem_Fragment = { readonly __typename: 'MediaItem' };

type HomepageEditorialNode_Page_Fragment = { readonly __typename: 'Page' };

type HomepageEditorialNode_Post_Fragment = { readonly __typename: 'Post' };

type HomepageEditorialNode_SiraArticle_Fragment = { readonly __typename: 'SiraArticle', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null };

type HomepageEditorialNode_SiraAward_Fragment = { readonly __typename: 'SiraAward' };

type HomepageEditorialNode_SiraBoardMember_Fragment = { readonly __typename: 'SiraBoardMember' };

type HomepageEditorialNode_SiraCareerArea_Fragment = { readonly __typename: 'SiraCareerArea' };

type HomepageEditorialNode_SiraCaseStudy_Fragment = { readonly __typename: 'SiraCaseStudy' };

type HomepageEditorialNode_SiraCompany_Fragment = { readonly __typename: 'SiraCompany' };

type HomepageEditorialNode_SiraCsrInitiative_Fragment = { readonly __typename: 'SiraCsrInitiative' };

type HomepageEditorialNode_SiraDocument_Fragment = { readonly __typename: 'SiraDocument' };

type HomepageEditorialNode_SiraDownload_Fragment = { readonly __typename: 'SiraDownload' };

type HomepageEditorialNode_SiraEvent_Fragment = { readonly __typename: 'SiraEvent' };

type HomepageEditorialNode_SiraExecutive_Fragment = { readonly __typename: 'SiraExecutive' };

type HomepageEditorialNode_SiraFaq_Fragment = { readonly __typename: 'SiraFaq' };

type HomepageEditorialNode_SiraInsight_Fragment = { readonly __typename: 'SiraInsight', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null };

type HomepageEditorialNode_SiraInvestment_Fragment = { readonly __typename: 'SiraInvestment' };

type HomepageEditorialNode_SiraInvestor_Fragment = { readonly __typename: 'SiraInvestor' };

type HomepageEditorialNode_SiraJob_Fragment = { readonly __typename: 'SiraJob' };

type HomepageEditorialNode_SiraLeadershipProfile_Fragment = { readonly __typename: 'SiraLeadershipProfile' };

type HomepageEditorialNode_SiraMediaItem_Fragment = { readonly __typename: 'SiraMediaItem' };

type HomepageEditorialNode_SiraNewsItem_Fragment = { readonly __typename: 'SiraNewsItem', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null };

type HomepageEditorialNode_SiraOffice_Fragment = { readonly __typename: 'SiraOffice' };

type HomepageEditorialNode_SiraPartner_Fragment = { readonly __typename: 'SiraPartner' };

type HomepageEditorialNode_SiraPortfolioItem_Fragment = { readonly __typename: 'SiraPortfolioItem' };

type HomepageEditorialNode_SiraPressRelease_Fragment = { readonly __typename: 'SiraPressRelease', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null };

type HomepageEditorialNode_SiraProject_Fragment = { readonly __typename: 'SiraProject' };

type HomepageEditorialNode_SiraResource_Fragment = { readonly __typename: 'SiraResource' };

type HomepageEditorialNode_SiraService_Fragment = { readonly __typename: 'SiraService' };

type HomepageEditorialNode_SiraTestimonial_Fragment = { readonly __typename: 'SiraTestimonial' };

type HomepageEditorialNode_SiraWhitepaper_Fragment = { readonly __typename: 'SiraWhitepaper' };

export type HomepageEditorialNodeFragment =
  | HomepageEditorialNode_MediaItem_Fragment
  | HomepageEditorialNode_Page_Fragment
  | HomepageEditorialNode_Post_Fragment
  | HomepageEditorialNode_SiraArticle_Fragment
  | HomepageEditorialNode_SiraAward_Fragment
  | HomepageEditorialNode_SiraBoardMember_Fragment
  | HomepageEditorialNode_SiraCareerArea_Fragment
  | HomepageEditorialNode_SiraCaseStudy_Fragment
  | HomepageEditorialNode_SiraCompany_Fragment
  | HomepageEditorialNode_SiraCsrInitiative_Fragment
  | HomepageEditorialNode_SiraDocument_Fragment
  | HomepageEditorialNode_SiraDownload_Fragment
  | HomepageEditorialNode_SiraEvent_Fragment
  | HomepageEditorialNode_SiraExecutive_Fragment
  | HomepageEditorialNode_SiraFaq_Fragment
  | HomepageEditorialNode_SiraInsight_Fragment
  | HomepageEditorialNode_SiraInvestment_Fragment
  | HomepageEditorialNode_SiraInvestor_Fragment
  | HomepageEditorialNode_SiraJob_Fragment
  | HomepageEditorialNode_SiraLeadershipProfile_Fragment
  | HomepageEditorialNode_SiraMediaItem_Fragment
  | HomepageEditorialNode_SiraNewsItem_Fragment
  | HomepageEditorialNode_SiraOffice_Fragment
  | HomepageEditorialNode_SiraPartner_Fragment
  | HomepageEditorialNode_SiraPortfolioItem_Fragment
  | HomepageEditorialNode_SiraPressRelease_Fragment
  | HomepageEditorialNode_SiraProject_Fragment
  | HomepageEditorialNode_SiraResource_Fragment
  | HomepageEditorialNode_SiraService_Fragment
  | HomepageEditorialNode_SiraTestimonial_Fragment
  | HomepageEditorialNode_SiraWhitepaper_Fragment
;

export type HomepageInvestmentNodeFragment = { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly investmentDetails: { readonly publicDisplay: boolean | null, readonly ticketSizeLabel: string | null, readonly relatedCompany: { readonly nodes: ReadonlyArray<
        | { readonly businessUnit: { readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly name: string | null, readonly slug: string | null }>, readonly pageInfo: { readonly hasNextPage: boolean } } | null }
        | Record<PropertyKey, never>
      >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null };

export type HomepageServiceNodeFragment = { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null };

export type HomepageTestimonialNodeFragment = { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly testimonialDetails: { readonly consentApproved: boolean | null, readonly role: string | null, readonly organization: string | null, readonly sourceUrl: string | null } | null };

export type HomepagePartnerNodeFragment = { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly partnerDetails: { readonly logoAltOverride: string | null, readonly relationshipLabel: string | null, readonly websiteUrl: string | null } | null };

type HomepageDocumentNode_MediaItem_Fragment = { readonly __typename: 'MediaItem' };

type HomepageDocumentNode_Page_Fragment = { readonly __typename: 'Page' };

type HomepageDocumentNode_Post_Fragment = { readonly __typename: 'Post' };

type HomepageDocumentNode_SiraArticle_Fragment = { readonly __typename: 'SiraArticle' };

type HomepageDocumentNode_SiraAward_Fragment = { readonly __typename: 'SiraAward' };

type HomepageDocumentNode_SiraBoardMember_Fragment = { readonly __typename: 'SiraBoardMember' };

type HomepageDocumentNode_SiraCareerArea_Fragment = { readonly __typename: 'SiraCareerArea' };

type HomepageDocumentNode_SiraCaseStudy_Fragment = { readonly __typename: 'SiraCaseStudy' };

type HomepageDocumentNode_SiraCompany_Fragment = { readonly __typename: 'SiraCompany' };

type HomepageDocumentNode_SiraCsrInitiative_Fragment = { readonly __typename: 'SiraCsrInitiative' };

type HomepageDocumentNode_SiraDocument_Fragment = { readonly __typename: 'SiraDocument', readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly documentDetails: { readonly publicationDate: string | null, readonly version: string | null } | null };

type HomepageDocumentNode_SiraDownload_Fragment = { readonly __typename: 'SiraDownload', readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly documentDetails: { readonly publicationDate: string | null, readonly version: string | null } | null };

type HomepageDocumentNode_SiraEvent_Fragment = { readonly __typename: 'SiraEvent' };

type HomepageDocumentNode_SiraExecutive_Fragment = { readonly __typename: 'SiraExecutive' };

type HomepageDocumentNode_SiraFaq_Fragment = { readonly __typename: 'SiraFaq' };

type HomepageDocumentNode_SiraInsight_Fragment = { readonly __typename: 'SiraInsight' };

type HomepageDocumentNode_SiraInvestment_Fragment = { readonly __typename: 'SiraInvestment' };

type HomepageDocumentNode_SiraInvestor_Fragment = { readonly __typename: 'SiraInvestor' };

type HomepageDocumentNode_SiraJob_Fragment = { readonly __typename: 'SiraJob' };

type HomepageDocumentNode_SiraLeadershipProfile_Fragment = { readonly __typename: 'SiraLeadershipProfile' };

type HomepageDocumentNode_SiraMediaItem_Fragment = { readonly __typename: 'SiraMediaItem' };

type HomepageDocumentNode_SiraNewsItem_Fragment = { readonly __typename: 'SiraNewsItem' };

type HomepageDocumentNode_SiraOffice_Fragment = { readonly __typename: 'SiraOffice' };

type HomepageDocumentNode_SiraPartner_Fragment = { readonly __typename: 'SiraPartner' };

type HomepageDocumentNode_SiraPortfolioItem_Fragment = { readonly __typename: 'SiraPortfolioItem' };

type HomepageDocumentNode_SiraPressRelease_Fragment = { readonly __typename: 'SiraPressRelease' };

type HomepageDocumentNode_SiraProject_Fragment = { readonly __typename: 'SiraProject' };

type HomepageDocumentNode_SiraResource_Fragment = { readonly __typename: 'SiraResource' };

type HomepageDocumentNode_SiraService_Fragment = { readonly __typename: 'SiraService' };

type HomepageDocumentNode_SiraTestimonial_Fragment = { readonly __typename: 'SiraTestimonial' };

type HomepageDocumentNode_SiraWhitepaper_Fragment = { readonly __typename: 'SiraWhitepaper', readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly documentDetails: { readonly publicationDate: string | null, readonly version: string | null } | null };

export type HomepageDocumentNodeFragment =
  | HomepageDocumentNode_MediaItem_Fragment
  | HomepageDocumentNode_Page_Fragment
  | HomepageDocumentNode_Post_Fragment
  | HomepageDocumentNode_SiraArticle_Fragment
  | HomepageDocumentNode_SiraAward_Fragment
  | HomepageDocumentNode_SiraBoardMember_Fragment
  | HomepageDocumentNode_SiraCareerArea_Fragment
  | HomepageDocumentNode_SiraCaseStudy_Fragment
  | HomepageDocumentNode_SiraCompany_Fragment
  | HomepageDocumentNode_SiraCsrInitiative_Fragment
  | HomepageDocumentNode_SiraDocument_Fragment
  | HomepageDocumentNode_SiraDownload_Fragment
  | HomepageDocumentNode_SiraEvent_Fragment
  | HomepageDocumentNode_SiraExecutive_Fragment
  | HomepageDocumentNode_SiraFaq_Fragment
  | HomepageDocumentNode_SiraInsight_Fragment
  | HomepageDocumentNode_SiraInvestment_Fragment
  | HomepageDocumentNode_SiraInvestor_Fragment
  | HomepageDocumentNode_SiraJob_Fragment
  | HomepageDocumentNode_SiraLeadershipProfile_Fragment
  | HomepageDocumentNode_SiraMediaItem_Fragment
  | HomepageDocumentNode_SiraNewsItem_Fragment
  | HomepageDocumentNode_SiraOffice_Fragment
  | HomepageDocumentNode_SiraPartner_Fragment
  | HomepageDocumentNode_SiraPortfolioItem_Fragment
  | HomepageDocumentNode_SiraPressRelease_Fragment
  | HomepageDocumentNode_SiraProject_Fragment
  | HomepageDocumentNode_SiraResource_Fragment
  | HomepageDocumentNode_SiraService_Fragment
  | HomepageDocumentNode_SiraTestimonial_Fragment
  | HomepageDocumentNode_SiraWhitepaper_Fragment
;

export type SiraHomepageQueryVariables = Exact<{
  asPreview?: boolean | null | undefined;
}>;


export type SiraHomepageQuery = { readonly page: { readonly databaseId: number, readonly uri: string | null, readonly title: string | null, readonly siraHomepage: { readonly variant: string | null } | null, readonly groupHero: { readonly headingBefore: string | null, readonly headingHighlight: string | null, readonly headingAfter: string | null, readonly description: string | null, readonly primaryCta: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly secondaryCta: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly slides: ReadonlyArray<{ readonly titleOverride: string | null, readonly eyebrowOverride: string | null, readonly descriptionOverride: string | null, readonly locationOverride: string | null, readonly imageAltOverride: string | null, readonly imageOverride: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly mobileImageOverride: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly primaryCtaOverride: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly secondaryCtaOverride: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly businessUnit: { readonly nodes: ReadonlyArray<
            | { readonly databaseId: number, readonly name: string | null, readonly slug: string | null }
            | Record<PropertyKey, never>
          >, readonly pageInfo: { readonly hasNextPage: boolean } } | null, readonly relatedProject: { readonly nodes: ReadonlyArray<
            | { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly projectDetails: { readonly subtitle: string | null, readonly location: string | null, readonly status: string | null } | null }
            | Record<PropertyKey, never>
          >, readonly pageInfo: { readonly hasNextPage: boolean } } | null, readonly relatedCompany: { readonly nodes: ReadonlyArray<
            | { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly companyDetails: { readonly shortDescriptor: string | null, readonly operatingStatus: string | null, readonly externalWebsiteUrl: string | null, readonly cardImageOverride: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null } | null, readonly businessUnit: { readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly name: string | null, readonly slug: string | null }>, readonly pageInfo: { readonly hasNextPage: boolean } } | null }
            | Record<PropertyKey, never>
          >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null> | null } | null, readonly ticker: { readonly enabled: boolean | null, readonly items: ReadonlyArray<{ readonly label: string | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly businessUnit: { readonly nodes: ReadonlyArray<
            | { readonly databaseId: number, readonly name: string | null, readonly slug: string | null }
            | Record<PropertyKey, never>
          >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null> | null } | null, readonly latestUpdates: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly sourceMode: string | null, readonly itemLimit: number | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly selectedItems: { readonly nodes: ReadonlyArray<
          | { readonly __typename: 'MediaItem' }
          | { readonly __typename: 'Page' }
          | { readonly __typename: 'Post' }
          | { readonly __typename: 'SiraArticle', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | { readonly __typename: 'SiraAward' }
          | { readonly __typename: 'SiraBoardMember' }
          | { readonly __typename: 'SiraCareerArea' }
          | { readonly __typename: 'SiraCaseStudy' }
          | { readonly __typename: 'SiraCompany' }
          | { readonly __typename: 'SiraCsrInitiative' }
          | { readonly __typename: 'SiraDocument' }
          | { readonly __typename: 'SiraDownload' }
          | { readonly __typename: 'SiraEvent' }
          | { readonly __typename: 'SiraExecutive' }
          | { readonly __typename: 'SiraFaq' }
          | { readonly __typename: 'SiraInsight', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | { readonly __typename: 'SiraInvestment' }
          | { readonly __typename: 'SiraInvestor' }
          | { readonly __typename: 'SiraJob' }
          | { readonly __typename: 'SiraLeadershipProfile' }
          | { readonly __typename: 'SiraMediaItem' }
          | { readonly __typename: 'SiraNewsItem', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | { readonly __typename: 'SiraOffice' }
          | { readonly __typename: 'SiraPartner' }
          | { readonly __typename: 'SiraPortfolioItem' }
          | { readonly __typename: 'SiraPressRelease', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | { readonly __typename: 'SiraProject' }
          | { readonly __typename: 'SiraResource' }
          | { readonly __typename: 'SiraService' }
          | { readonly __typename: 'SiraTestimonial' }
          | { readonly __typename: 'SiraWhitepaper' }
        >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null, readonly companies: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly selectedCompanies: { readonly nodes: ReadonlyArray<
          | { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly companyDetails: { readonly shortDescriptor: string | null, readonly operatingStatus: string | null, readonly externalWebsiteUrl: string | null, readonly cardImageOverride: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null } | null, readonly businessUnit: { readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly name: string | null, readonly slug: string | null }>, readonly pageInfo: { readonly hasNextPage: boolean } } | null }
          | Record<PropertyKey, never>
        >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null, readonly about: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly body: string | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly metrics: ReadonlyArray<{ readonly value: string | null, readonly label: string | null, readonly supportingText: string | null } | null> | null } | null, readonly investor: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly body: string | null, readonly formHeading: string | null, readonly formDescription: string | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly metrics: ReadonlyArray<{ readonly value: string | null, readonly label: string | null, readonly supportingText: string | null } | null> | null, readonly selectedInvestments: { readonly nodes: ReadonlyArray<
          | { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly investmentDetails: { readonly publicDisplay: boolean | null, readonly ticketSizeLabel: string | null, readonly relatedCompany: { readonly nodes: ReadonlyArray<
                  | { readonly businessUnit: { readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly name: string | null, readonly slug: string | null }>, readonly pageInfo: { readonly hasNextPage: boolean } } | null }
                  | Record<PropertyKey, never>
                >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null }
          | Record<PropertyKey, never>
        >, readonly pageInfo: { readonly hasNextPage: boolean } } | null, readonly onePagerDocument: { readonly nodes: ReadonlyArray<
          | { readonly __typename: 'MediaItem' }
          | { readonly __typename: 'Page' }
          | { readonly __typename: 'Post' }
          | { readonly __typename: 'SiraArticle' }
          | { readonly __typename: 'SiraAward' }
          | { readonly __typename: 'SiraBoardMember' }
          | { readonly __typename: 'SiraCareerArea' }
          | { readonly __typename: 'SiraCaseStudy' }
          | { readonly __typename: 'SiraCompany' }
          | { readonly __typename: 'SiraCsrInitiative' }
          | { readonly __typename: 'SiraDocument', readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly documentDetails: { readonly publicationDate: string | null, readonly version: string | null } | null }
          | { readonly __typename: 'SiraDownload', readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly documentDetails: { readonly publicationDate: string | null, readonly version: string | null } | null }
          | { readonly __typename: 'SiraEvent' }
          | { readonly __typename: 'SiraExecutive' }
          | { readonly __typename: 'SiraFaq' }
          | { readonly __typename: 'SiraInsight' }
          | { readonly __typename: 'SiraInvestment' }
          | { readonly __typename: 'SiraInvestor' }
          | { readonly __typename: 'SiraJob' }
          | { readonly __typename: 'SiraLeadershipProfile' }
          | { readonly __typename: 'SiraMediaItem' }
          | { readonly __typename: 'SiraNewsItem' }
          | { readonly __typename: 'SiraOffice' }
          | { readonly __typename: 'SiraPartner' }
          | { readonly __typename: 'SiraPortfolioItem' }
          | { readonly __typename: 'SiraPressRelease' }
          | { readonly __typename: 'SiraProject' }
          | { readonly __typename: 'SiraResource' }
          | { readonly __typename: 'SiraService' }
          | { readonly __typename: 'SiraTestimonial' }
          | { readonly __typename: 'SiraWhitepaper', readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly isRestricted: boolean | null, readonly documentDetails: { readonly publicationDate: string | null, readonly version: string | null } | null }
        >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null, readonly services: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly selectedServices: { readonly nodes: ReadonlyArray<
          | { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | Record<PropertyKey, never>
        >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null, readonly groupProjects: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly selectedProjects: { readonly nodes: ReadonlyArray<
          | { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly projectDetails: { readonly subtitle: string | null, readonly location: string | null, readonly status: string | null } | null }
          | Record<PropertyKey, never>
        >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null, readonly groupInsights: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly sourceMode: string | null, readonly itemLimit: number | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly selectedItems: { readonly nodes: ReadonlyArray<
          | { readonly __typename: 'MediaItem' }
          | { readonly __typename: 'Page' }
          | { readonly __typename: 'Post' }
          | { readonly __typename: 'SiraArticle', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | { readonly __typename: 'SiraAward' }
          | { readonly __typename: 'SiraBoardMember' }
          | { readonly __typename: 'SiraCareerArea' }
          | { readonly __typename: 'SiraCaseStudy' }
          | { readonly __typename: 'SiraCompany' }
          | { readonly __typename: 'SiraCsrInitiative' }
          | { readonly __typename: 'SiraDocument' }
          | { readonly __typename: 'SiraDownload' }
          | { readonly __typename: 'SiraEvent' }
          | { readonly __typename: 'SiraExecutive' }
          | { readonly __typename: 'SiraFaq' }
          | { readonly __typename: 'SiraInsight', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | { readonly __typename: 'SiraInvestment' }
          | { readonly __typename: 'SiraInvestor' }
          | { readonly __typename: 'SiraJob' }
          | { readonly __typename: 'SiraLeadershipProfile' }
          | { readonly __typename: 'SiraMediaItem' }
          | { readonly __typename: 'SiraNewsItem', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | { readonly __typename: 'SiraOffice' }
          | { readonly __typename: 'SiraPartner' }
          | { readonly __typename: 'SiraPortfolioItem' }
          | { readonly __typename: 'SiraPressRelease', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | { readonly __typename: 'SiraProject' }
          | { readonly __typename: 'SiraResource' }
          | { readonly __typename: 'SiraService' }
          | { readonly __typename: 'SiraTestimonial' }
          | { readonly __typename: 'SiraWhitepaper' }
        >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null, readonly testimonials: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly selectedTestimonials: { readonly nodes: ReadonlyArray<
          | { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly testimonialDetails: { readonly consentApproved: boolean | null, readonly role: string | null, readonly organization: string | null, readonly sourceUrl: string | null } | null }
          | Record<PropertyKey, never>
        >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null, readonly partners: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly selectedPartners: { readonly nodes: ReadonlyArray<
          | { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly partnerDetails: { readonly logoAltOverride: string | null, readonly relationshipLabel: string | null, readonly websiteUrl: string | null } | null }
          | Record<PropertyKey, never>
        >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null, readonly groupContact: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly formVariant: string | null, readonly formContext: string | null } | null, readonly branchHero: { readonly eyebrow: string | null, readonly headingBefore: string | null, readonly headingHighlight: string | null, readonly headingAfter: string | null, readonly description: string | null, readonly region: string | null, readonly imageAlt: string | null, readonly image: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly mobileImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly primaryCta: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly secondaryCta: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null } | null, readonly statistics: { readonly statistics: ReadonlyArray<{ readonly value: string | null, readonly label: string | null, readonly supportingText: string | null } | null> | null } | null, readonly overview: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly body: string | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null } | null, readonly focusAreas: { readonly focusAreas: ReadonlyArray<{ readonly title: string | null, readonly description: string | null } | null> | null } | null, readonly branchProjects: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly selectedProjects: { readonly nodes: ReadonlyArray<
          | { readonly databaseId: number, readonly contentTypeName: string, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly projectDetails: { readonly subtitle: string | null, readonly location: string | null, readonly status: string | null } | null }
          | Record<PropertyKey, never>
        >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null, readonly branchInsights: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly sourceMode: string | null, readonly itemLimit: number | null, readonly link: { readonly title: string | null, readonly url: string | null, readonly target: string | null } | null, readonly selectedItems: { readonly nodes: ReadonlyArray<
          | { readonly __typename: 'MediaItem' }
          | { readonly __typename: 'Page' }
          | { readonly __typename: 'Post' }
          | { readonly __typename: 'SiraArticle', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | { readonly __typename: 'SiraAward' }
          | { readonly __typename: 'SiraBoardMember' }
          | { readonly __typename: 'SiraCareerArea' }
          | { readonly __typename: 'SiraCaseStudy' }
          | { readonly __typename: 'SiraCompany' }
          | { readonly __typename: 'SiraCsrInitiative' }
          | { readonly __typename: 'SiraDocument' }
          | { readonly __typename: 'SiraDownload' }
          | { readonly __typename: 'SiraEvent' }
          | { readonly __typename: 'SiraExecutive' }
          | { readonly __typename: 'SiraFaq' }
          | { readonly __typename: 'SiraInsight', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | { readonly __typename: 'SiraInvestment' }
          | { readonly __typename: 'SiraInvestor' }
          | { readonly __typename: 'SiraJob' }
          | { readonly __typename: 'SiraLeadershipProfile' }
          | { readonly __typename: 'SiraMediaItem' }
          | { readonly __typename: 'SiraNewsItem', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | { readonly __typename: 'SiraOffice' }
          | { readonly __typename: 'SiraPartner' }
          | { readonly __typename: 'SiraPortfolioItem' }
          | { readonly __typename: 'SiraPressRelease', readonly databaseId: number, readonly contentTypeName: string, readonly date: string | null, readonly modified: string | null, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null }
          | { readonly __typename: 'SiraProject' }
          | { readonly __typename: 'SiraResource' }
          | { readonly __typename: 'SiraService' }
          | { readonly __typename: 'SiraTestimonial' }
          | { readonly __typename: 'SiraWhitepaper' }
        >, readonly pageInfo: { readonly hasNextPage: boolean } } | null } | null, readonly branchContact: { readonly eyebrow: string | null, readonly heading: string | null, readonly description: string | null, readonly formVariant: string | null, readonly formContext: string | null } | null, readonly footer: { readonly taglineOverride: string | null, readonly groupLinkLabelOverride: string | null } | null } | null };

export type SiraNavigationQueryVariables = Exact<{ [key: string]: never; }>;


export type SiraNavigationQuery = { readonly primary: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly locations: ReadonlyArray<MenuLocationEnum | null> | null, readonly menuItems: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly label: string | null, readonly order: number | null, readonly parentDatabaseId: number | null, readonly path: string | null, readonly target: string | null, readonly url: string | null }> } | null }> } | null, readonly footer: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly locations: ReadonlyArray<MenuLocationEnum | null> | null, readonly menuItems: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly label: string | null, readonly order: number | null, readonly parentDatabaseId: number | null, readonly path: string | null, readonly target: string | null, readonly url: string | null }> } | null }> } | null, readonly legal: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly locations: ReadonlyArray<MenuLocationEnum | null> | null, readonly menuItems: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly label: string | null, readonly order: number | null, readonly parentDatabaseId: number | null, readonly path: string | null, readonly target: string | null, readonly url: string | null }> } | null }> } | null };

export type SiraNavigationMenuCollectionFragment = { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly locations: ReadonlyArray<MenuLocationEnum | null> | null, readonly menuItems: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly label: string | null, readonly order: number | null, readonly parentDatabaseId: number | null, readonly path: string | null, readonly target: string | null, readonly url: string | null }> } | null }> };

export type SiraProjectSingleQueryVariables = Exact<{
  uri: string | number;
}>;


export type SiraProjectSingleQuery = { readonly siraProject: { readonly databaseId: number, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly content: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly projectDetails: { readonly subtitle: string | null, readonly location: string | null, readonly status: string | null, readonly gallery: { readonly pageInfo: { readonly hasNextPage: boolean, readonly endCursor: string | null }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly isRestricted: boolean | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null }> } | null, readonly statistics: ReadonlyArray<{ readonly label: string | null, readonly value: string | null } | null> | null, readonly relatedCompany: { readonly pageInfo: { readonly hasNextPage: boolean, readonly endCursor: string | null }, readonly nodes: ReadonlyArray<
          | { readonly __typename: 'MediaItem', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'Page', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'Post', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraArticle', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraAward', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraBoardMember', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraCareerArea', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraCaseStudy', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraCompany', readonly title: string | null, readonly uri: string | null, readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraCsrInitiative', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraDocument', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraDownload', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraEvent', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraExecutive', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraFaq', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraInsight', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraInvestment', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraInvestor', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraJob', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraLeadershipProfile', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraMediaItem', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraNewsItem', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraOffice', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraPartner', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraPortfolioItem', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraPressRelease', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraProject', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraResource', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraService', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraTestimonial', readonly databaseId: number, readonly isRestricted: boolean | null }
          | { readonly __typename: 'SiraWhitepaper', readonly databaseId: number, readonly isRestricted: boolean | null }
        > } | null } | null } | null };

export type SiraProjectsQueryVariables = Exact<{
  first: number;
  after?: string | null | undefined;
}>;


export type SiraProjectsQuery = { readonly siraProjects: { readonly pageInfo: { readonly hasNextPage: boolean, readonly endCursor: string | null }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly title: string | null, readonly uri: string | null, readonly excerpt: string | null, readonly isRestricted: boolean | null, readonly featuredImage: { readonly node: { readonly databaseId: number, readonly sourceUrl: string | null, readonly altText: string | null, readonly mediaDetails: { readonly width: number | null, readonly height: number | null } | null } } | null, readonly projectDetails: { readonly subtitle: string | null, readonly location: string | null, readonly status: string | null } | null }> } | null };

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}
export const HomepageLinkFragmentDoc = new TypedDocumentString(`
    fragment HomepageLink on AcfLink {
  title
  url
  target
}
    `, {"fragmentName":"HomepageLink"}) as unknown as TypedDocumentString<HomepageLinkFragment, unknown>;
export const HomepageMediaFragmentDoc = new TypedDocumentString(`
    fragment HomepageMedia on MediaItem {
  databaseId
  sourceUrl
  altText
  isRestricted
  mediaDetails {
    width
    height
  }
}
    `, {"fragmentName":"HomepageMedia"}) as unknown as TypedDocumentString<HomepageMediaFragment, unknown>;
export const HomepageFeaturedImageFragmentDoc = new TypedDocumentString(`
    fragment HomepageFeaturedImage on NodeWithFeaturedImageToMediaItemConnectionEdge {
  node {
    ...HomepageMedia
  }
}
    fragment HomepageMedia on MediaItem {
  databaseId
  sourceUrl
  altText
  isRestricted
  mediaDetails {
    width
    height
  }
}`, {"fragmentName":"HomepageFeaturedImage"}) as unknown as TypedDocumentString<HomepageFeaturedImageFragment, unknown>;
export const HomepageProjectNodeFragmentDoc = new TypedDocumentString(`
    fragment HomepageProjectNode on SiraProject {
  databaseId
  contentTypeName
  title
  uri
  excerpt
  isRestricted
  featuredImage {
    ...HomepageFeaturedImage
  }
  projectDetails {
    subtitle
    location
    status
  }
}
    fragment HomepageMedia on MediaItem {
  databaseId
  sourceUrl
  altText
  isRestricted
  mediaDetails {
    width
    height
  }
}
fragment HomepageFeaturedImage on NodeWithFeaturedImageToMediaItemConnectionEdge {
  node {
    ...HomepageMedia
  }
}`, {"fragmentName":"HomepageProjectNode"}) as unknown as TypedDocumentString<HomepageProjectNodeFragment, unknown>;
export const HomepageCompanyNodeFragmentDoc = new TypedDocumentString(`
    fragment HomepageCompanyNode on SiraCompany {
  databaseId
  contentTypeName
  title
  uri
  excerpt
  isRestricted
  featuredImage {
    ...HomepageFeaturedImage
  }
  companyDetails {
    shortDescriptor
    operatingStatus
    externalWebsiteUrl
    cardImageOverride {
      node {
        ...HomepageMedia
      }
    }
  }
  businessUnit: siraBusinessUnits(first: 1) {
    nodes {
      ... on SiraBusinessUnit {
        databaseId
        name
        slug
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}
    fragment HomepageMedia on MediaItem {
  databaseId
  sourceUrl
  altText
  isRestricted
  mediaDetails {
    width
    height
  }
}
fragment HomepageFeaturedImage on NodeWithFeaturedImageToMediaItemConnectionEdge {
  node {
    ...HomepageMedia
  }
}`, {"fragmentName":"HomepageCompanyNode"}) as unknown as TypedDocumentString<HomepageCompanyNodeFragment, unknown>;
export const HomepageEditorialNodeFragmentDoc = new TypedDocumentString(`
    fragment HomepageEditorialNode on ContentNode {
  __typename
  ... on SiraArticle {
    databaseId
    contentTypeName
    date
    modified
    title
    uri
    excerpt
    isRestricted
    featuredImage {
      ...HomepageFeaturedImage
    }
  }
  ... on SiraInsight {
    databaseId
    contentTypeName
    date
    modified
    title
    uri
    excerpt
    isRestricted
    featuredImage {
      ...HomepageFeaturedImage
    }
  }
  ... on SiraNewsItem {
    databaseId
    contentTypeName
    date
    modified
    title
    uri
    excerpt
    isRestricted
    featuredImage {
      ...HomepageFeaturedImage
    }
  }
  ... on SiraPressRelease {
    databaseId
    contentTypeName
    date
    modified
    title
    uri
    excerpt
    isRestricted
    featuredImage {
      ...HomepageFeaturedImage
    }
  }
}
    fragment HomepageMedia on MediaItem {
  databaseId
  sourceUrl
  altText
  isRestricted
  mediaDetails {
    width
    height
  }
}
fragment HomepageFeaturedImage on NodeWithFeaturedImageToMediaItemConnectionEdge {
  node {
    ...HomepageMedia
  }
}`, {"fragmentName":"HomepageEditorialNode"}) as unknown as TypedDocumentString<HomepageEditorialNodeFragment, unknown>;
export const HomepageInvestmentNodeFragmentDoc = new TypedDocumentString(`
    fragment HomepageInvestmentNode on SiraInvestment {
  databaseId
  contentTypeName
  title
  uri
  excerpt
  isRestricted
  featuredImage {
    ...HomepageFeaturedImage
  }
  investmentDetails {
    publicDisplay
    ticketSizeLabel
    relatedCompany(first: 1) {
      nodes {
        ... on SiraCompany {
          businessUnit: siraBusinessUnits(first: 1) {
            nodes {
              ... on SiraBusinessUnit {
                databaseId
                name
                slug
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
}
    fragment HomepageMedia on MediaItem {
  databaseId
  sourceUrl
  altText
  isRestricted
  mediaDetails {
    width
    height
  }
}
fragment HomepageFeaturedImage on NodeWithFeaturedImageToMediaItemConnectionEdge {
  node {
    ...HomepageMedia
  }
}`, {"fragmentName":"HomepageInvestmentNode"}) as unknown as TypedDocumentString<HomepageInvestmentNodeFragment, unknown>;
export const HomepageServiceNodeFragmentDoc = new TypedDocumentString(`
    fragment HomepageServiceNode on SiraService {
  databaseId
  contentTypeName
  title
  uri
  excerpt
  isRestricted
  featuredImage {
    ...HomepageFeaturedImage
  }
}
    fragment HomepageMedia on MediaItem {
  databaseId
  sourceUrl
  altText
  isRestricted
  mediaDetails {
    width
    height
  }
}
fragment HomepageFeaturedImage on NodeWithFeaturedImageToMediaItemConnectionEdge {
  node {
    ...HomepageMedia
  }
}`, {"fragmentName":"HomepageServiceNode"}) as unknown as TypedDocumentString<HomepageServiceNodeFragment, unknown>;
export const HomepageTestimonialNodeFragmentDoc = new TypedDocumentString(`
    fragment HomepageTestimonialNode on SiraTestimonial {
  databaseId
  contentTypeName
  title
  uri
  excerpt
  isRestricted
  featuredImage {
    ...HomepageFeaturedImage
  }
  testimonialDetails {
    consentApproved
    role
    organization
    sourceUrl
  }
}
    fragment HomepageMedia on MediaItem {
  databaseId
  sourceUrl
  altText
  isRestricted
  mediaDetails {
    width
    height
  }
}
fragment HomepageFeaturedImage on NodeWithFeaturedImageToMediaItemConnectionEdge {
  node {
    ...HomepageMedia
  }
}`, {"fragmentName":"HomepageTestimonialNode"}) as unknown as TypedDocumentString<HomepageTestimonialNodeFragment, unknown>;
export const HomepagePartnerNodeFragmentDoc = new TypedDocumentString(`
    fragment HomepagePartnerNode on SiraPartner {
  databaseId
  contentTypeName
  title
  uri
  excerpt
  isRestricted
  featuredImage {
    ...HomepageFeaturedImage
  }
  partnerDetails {
    logoAltOverride
    relationshipLabel
    websiteUrl
  }
}
    fragment HomepageMedia on MediaItem {
  databaseId
  sourceUrl
  altText
  isRestricted
  mediaDetails {
    width
    height
  }
}
fragment HomepageFeaturedImage on NodeWithFeaturedImageToMediaItemConnectionEdge {
  node {
    ...HomepageMedia
  }
}`, {"fragmentName":"HomepagePartnerNode"}) as unknown as TypedDocumentString<HomepagePartnerNodeFragment, unknown>;
export const HomepageDocumentNodeFragmentDoc = new TypedDocumentString(`
    fragment HomepageDocumentNode on ContentNode {
  __typename
  ... on SiraDocument {
    databaseId
    contentTypeName
    title
    uri
    isRestricted
    documentDetails {
      publicationDate
      version
    }
  }
  ... on SiraDownload {
    databaseId
    contentTypeName
    title
    uri
    isRestricted
    documentDetails {
      publicationDate
      version
    }
  }
  ... on SiraWhitepaper {
    databaseId
    contentTypeName
    title
    uri
    isRestricted
    documentDetails {
      publicationDate
      version
    }
  }
}
    `, {"fragmentName":"HomepageDocumentNode"}) as unknown as TypedDocumentString<HomepageDocumentNodeFragment, unknown>;
export const SiraNavigationMenuCollectionFragmentDoc = new TypedDocumentString(`
    fragment SiraNavigationMenuCollection on RootQueryToMenuConnection {
  pageInfo {
    hasNextPage
  }
  nodes {
    databaseId
    isRestricted
    locations
    menuItems(first: 200) {
      pageInfo {
        hasNextPage
      }
      nodes {
        databaseId
        isRestricted
        label
        order
        parentDatabaseId
        path
        target
        url
      }
    }
  }
}
    `, {"fragmentName":"SiraNavigationMenuCollection"}) as unknown as TypedDocumentString<SiraNavigationMenuCollectionFragment, unknown>;
export const SiraBrandDocument = new TypedDocumentString(`
    query SiraBrand {
  siraBrand {
    name
    key
    tagline
    primaryColor
    secondaryColor
    accentColor
    paperColor
    inkColor
    logo {
      databaseId
      sourceUrl
      altText
      width
      height
      mediaItem {
        databaseId
        sourceUrl
        altText
      }
    }
    mark {
      databaseId
      sourceUrl
      altText
      width
      height
      mediaItem {
        databaseId
        sourceUrl
        altText
      }
    }
    email
    phone
    address
    description
    mission
    vision
    values {
      title
      description
    }
    officeLocations {
      name
      address
      phone
      email
    }
    socialProfiles {
      linkedin
      instagram
      x
      youtube
    }
    announcementBanner
    emergencyBanner
    announcement {
      message
      severity
      link {
        label
        url
        target
      }
      startsAt
      endsAt
      dismissible
      revisionKey
    }
    emergency {
      message
      severity
      link {
        label
        url
        target
      }
      startsAt
      endsAt
      dismissible
      revisionKey
    }
  }
}
    `) as unknown as TypedDocumentString<SiraBrandQuery, SiraBrandQueryVariables>;
export const SiraEditorialFeedDocument = new TypedDocumentString(`
    query SiraEditorialFeed($first: Int!, $after: String) {
  contentNodes(
    first: $first
    after: $after
    where: {contentTypes: [SIRA_NEWS, SIRA_INSIGHT, SIRA_ARTICLE, SIRA_PRESS_RELEASE], orderby: [{field: DATE, order: DESC}]}
  ) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      __typename
      databaseId
      contentTypeName
      date
      modified
      uri
      isRestricted
      ... on SiraNewsItem {
        title
        excerpt
        featuredImage {
          node {
            databaseId
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
      ... on SiraInsight {
        title
        excerpt
        featuredImage {
          node {
            databaseId
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
      ... on SiraArticle {
        title
        excerpt
        featuredImage {
          node {
            databaseId
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
      ... on SiraPressRelease {
        title
        excerpt
        featuredImage {
          node {
            databaseId
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SiraEditorialFeedQuery, SiraEditorialFeedQueryVariables>;
export const SiraBusinessUnitEditorialFeedDocument = new TypedDocumentString(`
    query SiraBusinessUnitEditorialFeed($businessUnit: ID!, $first: Int!, $after: String) {
  siraBusinessUnit(id: $businessUnit, idType: SLUG) {
    contentNodes(
      first: $first
      after: $after
      where: {contentTypes: [SIRA_NEWS, SIRA_INSIGHT, SIRA_ARTICLE, SIRA_PRESS_RELEASE], orderby: [{field: DATE, order: DESC}]}
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        __typename
        databaseId
        contentTypeName
        date
        modified
        uri
        isRestricted
        ... on SiraNewsItem {
          title
          excerpt
          featuredImage {
            node {
              databaseId
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
        }
        ... on SiraInsight {
          title
          excerpt
          featuredImage {
            node {
              databaseId
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
        }
        ... on SiraArticle {
          title
          excerpt
          featuredImage {
            node {
              databaseId
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
        }
        ... on SiraPressRelease {
          title
          excerpt
          featuredImage {
            node {
              databaseId
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SiraBusinessUnitEditorialFeedQuery, SiraBusinessUnitEditorialFeedQueryVariables>;
export const SiraHomepageDocument = new TypedDocumentString(`
    query SiraHomepage($asPreview: Boolean = false) {
  page(id: "/", idType: URI, asPreview: $asPreview) {
    databaseId
    uri
    title
    siraHomepage {
      variant
    }
    groupHero {
      headingBefore
      headingHighlight
      headingAfter
      description
      primaryCta {
        ...HomepageLink
      }
      secondaryCta {
        ...HomepageLink
      }
      slides {
        titleOverride
        eyebrowOverride
        descriptionOverride
        locationOverride
        imageAltOverride
        imageOverride {
          node {
            ...HomepageMedia
          }
        }
        mobileImageOverride {
          node {
            ...HomepageMedia
          }
        }
        primaryCtaOverride {
          ...HomepageLink
        }
        secondaryCtaOverride {
          ...HomepageLink
        }
        businessUnit(first: 1) {
          nodes {
            ... on SiraBusinessUnit {
              databaseId
              name
              slug
            }
          }
          pageInfo {
            hasNextPage
          }
        }
        relatedProject(first: 1) {
          nodes {
            ...HomepageProjectNode
          }
          pageInfo {
            hasNextPage
          }
        }
        relatedCompany(first: 1) {
          nodes {
            ...HomepageCompanyNode
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    }
    ticker {
      enabled
      items {
        label
        link {
          ...HomepageLink
        }
        businessUnit(first: 1) {
          nodes {
            ... on SiraBusinessUnit {
              databaseId
              name
              slug
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    }
    latestUpdates {
      eyebrow
      heading
      description
      sourceMode
      itemLimit
      link {
        ...HomepageLink
      }
      selectedItems(first: 12) {
        nodes {
          ...HomepageEditorialNode
        }
        pageInfo {
          hasNextPage
        }
      }
    }
    companies {
      eyebrow
      heading
      description
      link {
        ...HomepageLink
      }
      selectedCompanies(first: 12) {
        nodes {
          ...HomepageCompanyNode
        }
        pageInfo {
          hasNextPage
        }
      }
    }
    about {
      eyebrow
      heading
      description
      body
      link {
        ...HomepageLink
      }
      metrics {
        value
        label
        supportingText
      }
    }
    investor {
      eyebrow
      heading
      description
      body
      link {
        ...HomepageLink
      }
      metrics {
        value
        label
        supportingText
      }
      formHeading
      formDescription
      selectedInvestments(first: 6) {
        nodes {
          ...HomepageInvestmentNode
        }
        pageInfo {
          hasNextPage
        }
      }
      onePagerDocument(first: 1) {
        nodes {
          ...HomepageDocumentNode
        }
        pageInfo {
          hasNextPage
        }
      }
    }
    services {
      eyebrow
      heading
      description
      link {
        ...HomepageLink
      }
      selectedServices(first: 12) {
        nodes {
          ...HomepageServiceNode
        }
        pageInfo {
          hasNextPage
        }
      }
    }
    groupProjects {
      eyebrow
      heading
      description
      link {
        ...HomepageLink
      }
      selectedProjects(first: 12) {
        nodes {
          ...HomepageProjectNode
        }
        pageInfo {
          hasNextPage
        }
      }
    }
    groupInsights {
      eyebrow
      heading
      description
      sourceMode
      itemLimit
      link {
        ...HomepageLink
      }
      selectedItems(first: 12) {
        nodes {
          ...HomepageEditorialNode
        }
        pageInfo {
          hasNextPage
        }
      }
    }
    testimonials {
      eyebrow
      heading
      description
      link {
        ...HomepageLink
      }
      selectedTestimonials(first: 8) {
        nodes {
          ...HomepageTestimonialNode
        }
        pageInfo {
          hasNextPage
        }
      }
    }
    partners {
      eyebrow
      heading
      description
      link {
        ...HomepageLink
      }
      selectedPartners(first: 24) {
        nodes {
          ...HomepagePartnerNode
        }
        pageInfo {
          hasNextPage
        }
      }
    }
    groupContact {
      eyebrow
      heading
      description
      formVariant
      formContext
    }
    branchHero {
      eyebrow
      headingBefore
      headingHighlight
      headingAfter
      description
      region
      imageAlt
      image {
        node {
          ...HomepageMedia
        }
      }
      mobileImage {
        node {
          ...HomepageMedia
        }
      }
      primaryCta {
        ...HomepageLink
      }
      secondaryCta {
        ...HomepageLink
      }
    }
    statistics {
      statistics {
        value
        label
        supportingText
      }
    }
    overview {
      eyebrow
      heading
      description
      body
      link {
        ...HomepageLink
      }
    }
    focusAreas {
      focusAreas {
        title
        description
      }
    }
    branchProjects {
      eyebrow
      heading
      description
      link {
        ...HomepageLink
      }
      selectedProjects(first: 12) {
        nodes {
          ...HomepageProjectNode
        }
        pageInfo {
          hasNextPage
        }
      }
    }
    branchInsights {
      eyebrow
      heading
      description
      sourceMode
      itemLimit
      link {
        ...HomepageLink
      }
      selectedItems(first: 12) {
        nodes {
          ...HomepageEditorialNode
        }
        pageInfo {
          hasNextPage
        }
      }
    }
    branchContact {
      eyebrow
      heading
      description
      formVariant
      formContext
    }
    footer {
      taglineOverride
      groupLinkLabelOverride
    }
  }
}
    fragment HomepageLink on AcfLink {
  title
  url
  target
}
fragment HomepageMedia on MediaItem {
  databaseId
  sourceUrl
  altText
  isRestricted
  mediaDetails {
    width
    height
  }
}
fragment HomepageFeaturedImage on NodeWithFeaturedImageToMediaItemConnectionEdge {
  node {
    ...HomepageMedia
  }
}
fragment HomepageProjectNode on SiraProject {
  databaseId
  contentTypeName
  title
  uri
  excerpt
  isRestricted
  featuredImage {
    ...HomepageFeaturedImage
  }
  projectDetails {
    subtitle
    location
    status
  }
}
fragment HomepageCompanyNode on SiraCompany {
  databaseId
  contentTypeName
  title
  uri
  excerpt
  isRestricted
  featuredImage {
    ...HomepageFeaturedImage
  }
  companyDetails {
    shortDescriptor
    operatingStatus
    externalWebsiteUrl
    cardImageOverride {
      node {
        ...HomepageMedia
      }
    }
  }
  businessUnit: siraBusinessUnits(first: 1) {
    nodes {
      ... on SiraBusinessUnit {
        databaseId
        name
        slug
      }
    }
    pageInfo {
      hasNextPage
    }
  }
}
fragment HomepageEditorialNode on ContentNode {
  __typename
  ... on SiraArticle {
    databaseId
    contentTypeName
    date
    modified
    title
    uri
    excerpt
    isRestricted
    featuredImage {
      ...HomepageFeaturedImage
    }
  }
  ... on SiraInsight {
    databaseId
    contentTypeName
    date
    modified
    title
    uri
    excerpt
    isRestricted
    featuredImage {
      ...HomepageFeaturedImage
    }
  }
  ... on SiraNewsItem {
    databaseId
    contentTypeName
    date
    modified
    title
    uri
    excerpt
    isRestricted
    featuredImage {
      ...HomepageFeaturedImage
    }
  }
  ... on SiraPressRelease {
    databaseId
    contentTypeName
    date
    modified
    title
    uri
    excerpt
    isRestricted
    featuredImage {
      ...HomepageFeaturedImage
    }
  }
}
fragment HomepageInvestmentNode on SiraInvestment {
  databaseId
  contentTypeName
  title
  uri
  excerpt
  isRestricted
  featuredImage {
    ...HomepageFeaturedImage
  }
  investmentDetails {
    publicDisplay
    ticketSizeLabel
    relatedCompany(first: 1) {
      nodes {
        ... on SiraCompany {
          businessUnit: siraBusinessUnits(first: 1) {
            nodes {
              ... on SiraBusinessUnit {
                databaseId
                name
                slug
              }
            }
            pageInfo {
              hasNextPage
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
}
fragment HomepageServiceNode on SiraService {
  databaseId
  contentTypeName
  title
  uri
  excerpt
  isRestricted
  featuredImage {
    ...HomepageFeaturedImage
  }
}
fragment HomepageTestimonialNode on SiraTestimonial {
  databaseId
  contentTypeName
  title
  uri
  excerpt
  isRestricted
  featuredImage {
    ...HomepageFeaturedImage
  }
  testimonialDetails {
    consentApproved
    role
    organization
    sourceUrl
  }
}
fragment HomepagePartnerNode on SiraPartner {
  databaseId
  contentTypeName
  title
  uri
  excerpt
  isRestricted
  featuredImage {
    ...HomepageFeaturedImage
  }
  partnerDetails {
    logoAltOverride
    relationshipLabel
    websiteUrl
  }
}
fragment HomepageDocumentNode on ContentNode {
  __typename
  ... on SiraDocument {
    databaseId
    contentTypeName
    title
    uri
    isRestricted
    documentDetails {
      publicationDate
      version
    }
  }
  ... on SiraDownload {
    databaseId
    contentTypeName
    title
    uri
    isRestricted
    documentDetails {
      publicationDate
      version
    }
  }
  ... on SiraWhitepaper {
    databaseId
    contentTypeName
    title
    uri
    isRestricted
    documentDetails {
      publicationDate
      version
    }
  }
}`) as unknown as TypedDocumentString<SiraHomepageQuery, SiraHomepageQueryVariables>;
export const SiraNavigationDocument = new TypedDocumentString(`
    query SiraNavigation {
  primary: menus(first: 2, where: {location: PRIMARY}) {
    ...SiraNavigationMenuCollection
  }
  footer: menus(first: 2, where: {location: FOOTER}) {
    ...SiraNavigationMenuCollection
  }
  legal: menus(first: 2, where: {location: LEGAL}) {
    ...SiraNavigationMenuCollection
  }
}
    fragment SiraNavigationMenuCollection on RootQueryToMenuConnection {
  pageInfo {
    hasNextPage
  }
  nodes {
    databaseId
    isRestricted
    locations
    menuItems(first: 200) {
      pageInfo {
        hasNextPage
      }
      nodes {
        databaseId
        isRestricted
        label
        order
        parentDatabaseId
        path
        target
        url
      }
    }
  }
}`) as unknown as TypedDocumentString<SiraNavigationQuery, SiraNavigationQueryVariables>;
export const SiraProjectSingleDocument = new TypedDocumentString(`
    query SiraProjectSingle($uri: ID!) {
  siraProject(id: $uri, idType: URI, asPreview: false) {
    databaseId
    title
    uri
    excerpt
    content(format: RENDERED)
    isRestricted
    featuredImage {
      node {
        databaseId
        sourceUrl
        altText
        isRestricted
        mediaDetails {
          width
          height
        }
      }
    }
    projectDetails {
      subtitle
      location
      status
      gallery(first: 50) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          databaseId
          sourceUrl
          altText
          isRestricted
          mediaDetails {
            width
            height
          }
        }
      }
      statistics {
        label
        value
      }
      relatedCompany(first: 10) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          __typename
          databaseId
          isRestricted
          ... on SiraCompany {
            title
            uri
          }
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SiraProjectSingleQuery, SiraProjectSingleQueryVariables>;
export const SiraProjectsDocument = new TypedDocumentString(`
    query SiraProjects($first: Int!, $after: String) {
  siraProjects(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      databaseId
      title
      uri
      excerpt
      isRestricted
      featuredImage {
        node {
          databaseId
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      projectDetails {
        subtitle
        location
        status
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SiraProjectsQuery, SiraProjectsQueryVariables>;
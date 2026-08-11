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

export type SiraHomepageQueryVariables = Exact<{
  asPreview?: boolean | null | undefined;
}>;


export type SiraHomepageQuery = { readonly page: { readonly databaseId: number, readonly uri: string | null, readonly title: string | null, readonly siraHomepage: { readonly variant: string | null, readonly groupHomepage: { readonly hero: { readonly headingBefore: string | null, readonly headingHighlight: string | null, readonly headingAfter: string | null, readonly description: string | null } | null } | null, readonly branchHomepage: { readonly hero: { readonly eyebrow: string | null, readonly headingBefore: string | null, readonly headingHighlight: string | null, readonly headingAfter: string | null, readonly description: string | null, readonly region: string | null } | null } | null } | null } | null };

export type SiraNavigationQueryVariables = Exact<{ [key: string]: never; }>;


export type SiraNavigationQuery = { readonly primary: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly locations: ReadonlyArray<MenuLocationEnum | null> | null, readonly menuItems: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly label: string | null, readonly order: number | null, readonly parentDatabaseId: number | null, readonly path: string | null, readonly target: string | null, readonly url: string | null }> } | null }> } | null, readonly footer: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly locations: ReadonlyArray<MenuLocationEnum | null> | null, readonly menuItems: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly label: string | null, readonly order: number | null, readonly parentDatabaseId: number | null, readonly path: string | null, readonly target: string | null, readonly url: string | null }> } | null }> } | null, readonly legal: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly locations: ReadonlyArray<MenuLocationEnum | null> | null, readonly menuItems: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly label: string | null, readonly order: number | null, readonly parentDatabaseId: number | null, readonly path: string | null, readonly target: string | null, readonly url: string | null }> } | null }> } | null };

export type SiraNavigationMenuCollectionFragment = { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly locations: ReadonlyArray<MenuLocationEnum | null> | null, readonly menuItems: { readonly pageInfo: { readonly hasNextPage: boolean }, readonly nodes: ReadonlyArray<{ readonly databaseId: number, readonly isRestricted: boolean | null, readonly label: string | null, readonly order: number | null, readonly parentDatabaseId: number | null, readonly path: string | null, readonly target: string | null, readonly url: string | null }> } | null }> };

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
      groupHomepage {
        hero {
          headingBefore
          headingHighlight
          headingAfter
          description
        }
      }
      branchHomepage {
        hero {
          eyebrow
          headingBefore
          headingHighlight
          headingAfter
          description
          region
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<SiraHomepageQuery, SiraHomepageQueryVariables>;
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
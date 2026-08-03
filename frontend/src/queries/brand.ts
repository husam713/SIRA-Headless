import {
  defineGraphQLOperation,
  type GraphQLOperation,
} from "@/lib/graphql/operation";

export interface BrandMedia {
  readonly databaseId: number;
  readonly sourceUrl: string;
  readonly altText: string | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly mediaItem: {
    readonly databaseId: number;
    readonly sourceUrl: string | null;
    readonly altText: string | null;
  } | null;
}

export interface SiraBrandQueryData {
  readonly siraBrand: {
    readonly name: string;
    readonly key: string;
    readonly tagline: string | null;
    readonly primaryColor: string;
    readonly secondaryColor: string;
    readonly accentColor: string;
    readonly paperColor: string;
    readonly inkColor: string;
    readonly logo: BrandMedia | null;
    readonly mark: BrandMedia | null;
    readonly email: string | null;
    readonly phone: string | null;
    readonly address: string | null;
    readonly description: string | null;
    readonly mission: string | null;
    readonly vision: string | null;
    readonly values:
      | readonly ({
          readonly title: string;
          readonly description: string | null;
        } | null)[]
      | null;
    readonly officeLocations:
      | readonly ({
          readonly name: string;
          readonly address: string | null;
          readonly phone: string | null;
          readonly email: string | null;
        } | null)[]
      | null;
    readonly socialProfiles: {
      readonly linkedin: string | null;
      readonly instagram: string | null;
      readonly x: string | null;
      readonly youtube: string | null;
    } | null;
    readonly announcementBanner: string | null;
    readonly emergencyBanner: string | null;
  };
}

export type SiraBrandQueryVariables = Record<string, never>;

const source = /* GraphQL */ `
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
    }
  }
`;

export const SIRA_BRAND_QUERY: GraphQLOperation<
  SiraBrandQueryData,
  SiraBrandQueryVariables
> = defineGraphQLOperation<
  SiraBrandQueryData,
  SiraBrandQueryVariables
>("SiraBrand", source);

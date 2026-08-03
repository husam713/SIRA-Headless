import {
  defineGraphQLOperation,
  type GraphQLOperation,
} from "@/lib/graphql/operation";

export interface SiraProjectsQueryVariables {
  readonly first: number;
  readonly after?: string | null;
}

export interface SiraProjectsQueryData {
  readonly siraProjects: {
    readonly pageInfo: {
      readonly hasNextPage: boolean;
      readonly endCursor: string | null;
    };
    readonly nodes: readonly {
      readonly databaseId: number;
      readonly title: string | null;
      readonly slug: string | null;
      readonly uri: string | null;
      readonly excerpt: string | null;
      readonly featuredImage: {
        readonly node: {
          readonly databaseId: number;
          readonly sourceUrl: string | null;
          readonly altText: string | null;
          readonly mediaDetails: {
            readonly width: number | null;
            readonly height: number | null;
          } | null;
        } | null;
      } | null;
      readonly projectDetails: {
        readonly subtitle: string | null;
        readonly location: string | null;
        readonly status: string | null;
        readonly relatedCompany: {
          readonly nodes: readonly {
            readonly databaseId: number;
            readonly title: string | null;
            readonly slug: string | null;
            readonly uri: string | null;
          }[];
        } | null;
        readonly gallery: {
          readonly nodes: readonly {
            readonly databaseId: number;
            readonly sourceUrl: string | null;
            readonly altText: string | null;
            readonly mediaDetails: {
              readonly width: number | null;
              readonly height: number | null;
            } | null;
          }[];
        } | null;
        readonly statistics:
          | readonly ({
              readonly value: string | null;
              readonly label: string | null;
            } | null)[]
          | null;
      } | null;
    }[];
  } | null;
}

const source = /* GraphQL */ `
  query SiraProjects($first: Int!, $after: String) {
    siraProjects(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }

      nodes {
        databaseId
        title
        slug
        uri
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

        projectDetails {
          subtitle
          location
          status

          relatedCompany {
            nodes {
              ... on SiraCompany {
                databaseId
                title
                slug
                uri
              }
            }
          }

          gallery {
            nodes {
              databaseId
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }

          statistics {
            value
            label
          }
        }
      }
    }
  }
`;

export const SIRA_PROJECTS_QUERY: GraphQLOperation<
  SiraProjectsQueryData,
  SiraProjectsQueryVariables
> = defineGraphQLOperation<
  SiraProjectsQueryData,
  SiraProjectsQueryVariables
>("SiraProjects", source);

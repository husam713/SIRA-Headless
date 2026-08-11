import {
  SiraHomepageDocument,
  type SiraHomepageQuery,
  type SiraHomepageQueryVariables as GeneratedSiraHomepageQueryVariables,
} from "@/generated/graphql/graphql";
import {
  defineGraphQLOperation,
  type GraphQLOperation,
} from "@/lib/graphql/operation";

export type SiraHomepageQueryData = SiraHomepageQuery;
export type SiraHomepageQueryVariables =
  GeneratedSiraHomepageQueryVariables;

export const SIRA_HOMEPAGE_QUERY: GraphQLOperation<
  SiraHomepageQueryData,
  SiraHomepageQueryVariables
> = defineGraphQLOperation<
  SiraHomepageQueryData,
  SiraHomepageQueryVariables
>("SiraHomepage", SiraHomepageDocument.toString());

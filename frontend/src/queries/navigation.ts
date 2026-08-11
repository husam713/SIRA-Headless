import {
  SiraNavigationDocument,
  type SiraNavigationQuery,
  type SiraNavigationQueryVariables as GeneratedSiraNavigationQueryVariables,
} from "@/generated/graphql/graphql";
import {
  defineGraphQLOperation,
  type GraphQLOperation,
} from "@/lib/graphql/operation";

export type SiraNavigationQueryData = SiraNavigationQuery;
export type SiraNavigationQueryVariables =
  GeneratedSiraNavigationQueryVariables;

export const SIRA_NAVIGATION_QUERY: GraphQLOperation<
  SiraNavigationQueryData,
  SiraNavigationQueryVariables
> = defineGraphQLOperation<
  SiraNavigationQueryData,
  SiraNavigationQueryVariables
>("SiraNavigation", SiraNavigationDocument.toString());

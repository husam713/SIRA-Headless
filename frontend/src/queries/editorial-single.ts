import {
  SiraEditorialSingleDocument,
  type SiraEditorialSingleQuery,
  type SiraEditorialSingleQueryVariables as GeneratedSiraEditorialSingleQueryVariables,
} from "@/generated/graphql/graphql";
import {
  defineGraphQLOperation,
  type GraphQLOperation,
} from "@/lib/graphql/operation";

export type SiraEditorialSingleQueryData = SiraEditorialSingleQuery;
export type SiraEditorialSingleQueryVariables =
  GeneratedSiraEditorialSingleQueryVariables;

export const SIRA_EDITORIAL_SINGLE_QUERY: GraphQLOperation<
  SiraEditorialSingleQueryData,
  SiraEditorialSingleQueryVariables
> = defineGraphQLOperation<
  SiraEditorialSingleQueryData,
  SiraEditorialSingleQueryVariables
>("SiraEditorialSingle", SiraEditorialSingleDocument.toString());

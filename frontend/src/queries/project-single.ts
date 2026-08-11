import {
  SiraProjectSingleDocument,
  type SiraProjectSingleQuery,
  type SiraProjectSingleQueryVariables as GeneratedSiraProjectSingleQueryVariables,
} from "@/generated/graphql/graphql";
import {
  defineGraphQLOperation,
  type GraphQLOperation,
} from "@/lib/graphql/operation";

export type SiraProjectSingleQueryData = SiraProjectSingleQuery;
export type SiraProjectSingleQueryVariables =
  GeneratedSiraProjectSingleQueryVariables;

export const SIRA_PROJECT_SINGLE_QUERY: GraphQLOperation<
  SiraProjectSingleQueryData,
  SiraProjectSingleQueryVariables
> = defineGraphQLOperation<
  SiraProjectSingleQueryData,
  SiraProjectSingleQueryVariables
>("SiraProjectSingle", SiraProjectSingleDocument.toString());

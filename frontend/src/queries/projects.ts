import {
  SiraProjectsDocument,
  type SiraProjectsQuery,
  type SiraProjectsQueryVariables as GeneratedSiraProjectsQueryVariables,
} from "@/generated/graphql/graphql";
import {
  defineGraphQLOperation,
  type GraphQLOperation,
} from "@/lib/graphql/operation";

export type SiraProjectsQueryData = SiraProjectsQuery;
export type SiraProjectsQueryVariables =
  GeneratedSiraProjectsQueryVariables;

export const SIRA_PROJECTS_QUERY: GraphQLOperation<
  SiraProjectsQueryData,
  SiraProjectsQueryVariables
> = defineGraphQLOperation<
  SiraProjectsQueryData,
  SiraProjectsQueryVariables
>("SiraProjects", SiraProjectsDocument.toString());

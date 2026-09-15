import {
  SiraContentPageDocument,
  SiraIndustryIndexDocument,
  SiraServiceIndexDocument,
  SiraWorkIndexDocument,
  type SiraContentPageQuery,
  type SiraContentPageQueryVariables as GeneratedContentPageVariables,
  type SiraIndustryIndexQuery,
  type SiraIndustryIndexQueryVariables as GeneratedIndustryIndexVariables,
  type SiraServiceIndexQuery,
  type SiraServiceIndexQueryVariables as GeneratedServiceIndexVariables,
  type SiraWorkIndexQuery,
  type SiraWorkIndexQueryVariables as GeneratedWorkIndexVariables,
} from "@/generated/graphql/graphql";
import {
  defineGraphQLOperation,
  type GraphQLOperation,
} from "@/lib/graphql/operation";

export type SiraContentPageQueryData = SiraContentPageQuery;
export type SiraContentPageQueryVariables = GeneratedContentPageVariables;

export const SIRA_CONTENT_PAGE_QUERY: GraphQLOperation<
  SiraContentPageQueryData,
  SiraContentPageQueryVariables
> = defineGraphQLOperation<
  SiraContentPageQueryData,
  SiraContentPageQueryVariables
>("SiraContentPage", SiraContentPageDocument.toString());

export type SiraServiceIndexQueryData = SiraServiceIndexQuery;
export type SiraServiceIndexQueryVariables = GeneratedServiceIndexVariables;

export const SIRA_SERVICE_INDEX_QUERY: GraphQLOperation<
  SiraServiceIndexQueryData,
  SiraServiceIndexQueryVariables
> = defineGraphQLOperation<
  SiraServiceIndexQueryData,
  SiraServiceIndexQueryVariables
>("SiraServiceIndex", SiraServiceIndexDocument.toString());

export type SiraWorkIndexQueryData = SiraWorkIndexQuery;
export type SiraWorkIndexQueryVariables = GeneratedWorkIndexVariables;

export const SIRA_WORK_INDEX_QUERY: GraphQLOperation<
  SiraWorkIndexQueryData,
  SiraWorkIndexQueryVariables
> = defineGraphQLOperation<SiraWorkIndexQueryData, SiraWorkIndexQueryVariables>(
  "SiraWorkIndex",
  SiraWorkIndexDocument.toString(),
);

export type SiraIndustryIndexQueryData = SiraIndustryIndexQuery;
export type SiraIndustryIndexQueryVariables = GeneratedIndustryIndexVariables;

export const SIRA_INDUSTRY_INDEX_QUERY: GraphQLOperation<
  SiraIndustryIndexQueryData,
  SiraIndustryIndexQueryVariables
> = defineGraphQLOperation<
  SiraIndustryIndexQueryData,
  SiraIndustryIndexQueryVariables
>("SiraIndustryIndex", SiraIndustryIndexDocument.toString());

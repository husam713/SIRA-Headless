import {
  SiraBusinessUnitEditorialFeedDocument,
  type SiraBusinessUnitEditorialFeedQuery,
  type SiraBusinessUnitEditorialFeedQueryVariables as GeneratedSiraBusinessUnitEditorialFeedQueryVariables,
  SiraEditorialFeedDocument,
  type SiraEditorialFeedQuery,
  type SiraEditorialFeedQueryVariables as GeneratedSiraEditorialFeedQueryVariables,
} from "@/generated/graphql/graphql";
import {
  defineGraphQLOperation,
  type GraphQLOperation,
} from "@/lib/graphql/operation";

export type SiraEditorialFeedQueryData = SiraEditorialFeedQuery;
export type SiraEditorialFeedQueryVariables =
  GeneratedSiraEditorialFeedQueryVariables;
export type SiraBusinessUnitEditorialFeedQueryData =
  SiraBusinessUnitEditorialFeedQuery;
export type SiraBusinessUnitEditorialFeedQueryVariables =
  GeneratedSiraBusinessUnitEditorialFeedQueryVariables;

export const SIRA_EDITORIAL_FEED_QUERY: GraphQLOperation<
  SiraEditorialFeedQueryData,
  SiraEditorialFeedQueryVariables
> = defineGraphQLOperation<
  SiraEditorialFeedQueryData,
  SiraEditorialFeedQueryVariables
>("SiraEditorialFeed", SiraEditorialFeedDocument.toString());

export const SIRA_BUSINESS_UNIT_EDITORIAL_FEED_QUERY: GraphQLOperation<
  SiraBusinessUnitEditorialFeedQueryData,
  SiraBusinessUnitEditorialFeedQueryVariables
> = defineGraphQLOperation<
  SiraBusinessUnitEditorialFeedQueryData,
  SiraBusinessUnitEditorialFeedQueryVariables
>(
  "SiraBusinessUnitEditorialFeed",
  SiraBusinessUnitEditorialFeedDocument.toString(),
);

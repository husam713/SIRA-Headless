import {
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

export const SIRA_EDITORIAL_FEED_QUERY: GraphQLOperation<
  SiraEditorialFeedQueryData,
  SiraEditorialFeedQueryVariables
> = defineGraphQLOperation<
  SiraEditorialFeedQueryData,
  SiraEditorialFeedQueryVariables
>("SiraEditorialFeed", SiraEditorialFeedDocument.toString());

import {
  defineGraphQLOperation,
  type GraphQLOperation,
} from "@/lib/graphql/operation";
import {
  SiraBrandDocument,
  type SiraBrandQuery,
  type SiraBrandQueryVariables as GeneratedSiraBrandQueryVariables,
} from "@/generated/graphql/graphql";

export type SiraBrandQueryData = SiraBrandQuery;
export type SiraBrandQueryVariables = GeneratedSiraBrandQueryVariables;
export type BrandMedia = NonNullable<
  SiraBrandQueryData["siraBrand"]["logo"]
>;
export type SiraBrandBanner = NonNullable<
  SiraBrandQueryData["siraBrand"]["announcement"]
>;
export type SiraBrandBannerLink = NonNullable<SiraBrandBanner["link"]>;
export type SiraBrandBannerSeverity = SiraBrandBanner["severity"];

export const SIRA_BRAND_QUERY: GraphQLOperation<
  SiraBrandQueryData,
  SiraBrandQueryVariables
> = defineGraphQLOperation<
  SiraBrandQueryData,
  SiraBrandQueryVariables
>("SiraBrand", SiraBrandDocument.toString());

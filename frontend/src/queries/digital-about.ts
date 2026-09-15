import {
  SiraDigitalAboutDocument,
  SiraIndustryDetailDocument,
  type SiraDigitalAboutQuery,
  type SiraDigitalAboutQueryVariables as GeneratedDigitalAboutVariables,
  type SiraIndustryDetailQuery,
  type SiraIndustryDetailQueryVariables as GeneratedIndustryDetailVariables,
} from "@/generated/graphql/graphql";
import {
  defineGraphQLOperation,
  type GraphQLOperation,
} from "@/lib/graphql/operation";

export type SiraDigitalAboutQueryData = SiraDigitalAboutQuery;
export type SiraDigitalAboutQueryVariables = GeneratedDigitalAboutVariables;

export const SIRA_DIGITAL_ABOUT_QUERY: GraphQLOperation<
  SiraDigitalAboutQueryData,
  SiraDigitalAboutQueryVariables
> = defineGraphQLOperation<
  SiraDigitalAboutQueryData,
  SiraDigitalAboutQueryVariables
>("SiraDigitalAbout", SiraDigitalAboutDocument.toString());

export type SiraIndustryDetailQueryData = SiraIndustryDetailQuery;
export type SiraIndustryDetailQueryVariables = GeneratedIndustryDetailVariables;

export const SIRA_INDUSTRY_DETAIL_QUERY: GraphQLOperation<
  SiraIndustryDetailQueryData,
  SiraIndustryDetailQueryVariables
> = defineGraphQLOperation<
  SiraIndustryDetailQueryData,
  SiraIndustryDetailQueryVariables
>("SiraIndustryDetail", SiraIndustryDetailDocument.toString());

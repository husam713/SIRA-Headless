/* eslint-disable */
import * as types from './graphql';



/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "query SiraBrand {\n  siraBrand {\n    name\n    key\n    tagline\n    primaryColor\n    secondaryColor\n    accentColor\n    paperColor\n    inkColor\n    logo {\n      databaseId\n      sourceUrl\n      altText\n      width\n      height\n      mediaItem {\n        databaseId\n        sourceUrl\n        altText\n      }\n    }\n    mark {\n      databaseId\n      sourceUrl\n      altText\n      width\n      height\n      mediaItem {\n        databaseId\n        sourceUrl\n        altText\n      }\n    }\n    email\n    phone\n    address\n    description\n    mission\n    vision\n    values {\n      title\n      description\n    }\n    officeLocations {\n      name\n      address\n      phone\n      email\n    }\n    socialProfiles {\n      linkedin\n      instagram\n      x\n      youtube\n    }\n    announcementBanner\n    emergencyBanner\n  }\n}": typeof types.SiraBrandDocument,
    "query SiraProjects($first: Int!, $after: String) {\n  siraProjects(first: $first, after: $after) {\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    nodes {\n      databaseId\n      title\n      slug\n      uri\n      excerpt\n      featuredImage {\n        node {\n          databaseId\n          sourceUrl\n          altText\n          mediaDetails {\n            width\n            height\n          }\n        }\n      }\n      projectDetails {\n        subtitle\n        location\n        status\n        relatedCompany {\n          nodes {\n            ... on SiraCompany {\n              databaseId\n              title\n              slug\n              uri\n            }\n          }\n        }\n        gallery {\n          nodes {\n            databaseId\n            sourceUrl\n            altText\n            mediaDetails {\n              width\n              height\n            }\n          }\n        }\n        statistics {\n          value\n          label\n        }\n      }\n    }\n  }\n}": typeof types.SiraProjectsDocument,
};
const documents: Documents = {
    "query SiraBrand {\n  siraBrand {\n    name\n    key\n    tagline\n    primaryColor\n    secondaryColor\n    accentColor\n    paperColor\n    inkColor\n    logo {\n      databaseId\n      sourceUrl\n      altText\n      width\n      height\n      mediaItem {\n        databaseId\n        sourceUrl\n        altText\n      }\n    }\n    mark {\n      databaseId\n      sourceUrl\n      altText\n      width\n      height\n      mediaItem {\n        databaseId\n        sourceUrl\n        altText\n      }\n    }\n    email\n    phone\n    address\n    description\n    mission\n    vision\n    values {\n      title\n      description\n    }\n    officeLocations {\n      name\n      address\n      phone\n      email\n    }\n    socialProfiles {\n      linkedin\n      instagram\n      x\n      youtube\n    }\n    announcementBanner\n    emergencyBanner\n  }\n}": types.SiraBrandDocument,
    "query SiraProjects($first: Int!, $after: String) {\n  siraProjects(first: $first, after: $after) {\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    nodes {\n      databaseId\n      title\n      slug\n      uri\n      excerpt\n      featuredImage {\n        node {\n          databaseId\n          sourceUrl\n          altText\n          mediaDetails {\n            width\n            height\n          }\n        }\n      }\n      projectDetails {\n        subtitle\n        location\n        status\n        relatedCompany {\n          nodes {\n            ... on SiraCompany {\n              databaseId\n              title\n              slug\n              uri\n            }\n          }\n        }\n        gallery {\n          nodes {\n            databaseId\n            sourceUrl\n            altText\n            mediaDetails {\n              width\n              height\n            }\n          }\n        }\n        statistics {\n          value\n          label\n        }\n      }\n    }\n  }\n}": types.SiraProjectsDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query SiraBrand {\n  siraBrand {\n    name\n    key\n    tagline\n    primaryColor\n    secondaryColor\n    accentColor\n    paperColor\n    inkColor\n    logo {\n      databaseId\n      sourceUrl\n      altText\n      width\n      height\n      mediaItem {\n        databaseId\n        sourceUrl\n        altText\n      }\n    }\n    mark {\n      databaseId\n      sourceUrl\n      altText\n      width\n      height\n      mediaItem {\n        databaseId\n        sourceUrl\n        altText\n      }\n    }\n    email\n    phone\n    address\n    description\n    mission\n    vision\n    values {\n      title\n      description\n    }\n    officeLocations {\n      name\n      address\n      phone\n      email\n    }\n    socialProfiles {\n      linkedin\n      instagram\n      x\n      youtube\n    }\n    announcementBanner\n    emergencyBanner\n  }\n}"): typeof import('./graphql').SiraBrandDocument;
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query SiraProjects($first: Int!, $after: String) {\n  siraProjects(first: $first, after: $after) {\n    pageInfo {\n      hasNextPage\n      endCursor\n    }\n    nodes {\n      databaseId\n      title\n      slug\n      uri\n      excerpt\n      featuredImage {\n        node {\n          databaseId\n          sourceUrl\n          altText\n          mediaDetails {\n            width\n            height\n          }\n        }\n      }\n      projectDetails {\n        subtitle\n        location\n        status\n        relatedCompany {\n          nodes {\n            ... on SiraCompany {\n              databaseId\n              title\n              slug\n              uri\n            }\n          }\n        }\n        gallery {\n          nodes {\n            databaseId\n            sourceUrl\n            altText\n            mediaDetails {\n              width\n              height\n            }\n          }\n        }\n        statistics {\n          value\n          label\n        }\n      }\n    }\n  }\n}"): typeof import('./graphql').SiraProjectsDocument;


export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

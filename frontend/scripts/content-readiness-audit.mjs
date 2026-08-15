import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

const SITE_CONFIG = Object.freeze({
  group: Object.freeze({
    name: "Group",
    endpointKey: "SIRA_WP_GROUP_GRAPHQL_URL",
    businessUnit: null,
  }),
  consulting: Object.freeze({
    name: "Consulting",
    endpointKey: "SIRA_WP_CONSULTING_GRAPHQL_URL",
    businessUnit: "consulting",
  }),
  healthcare: Object.freeze({
    name: "Healthcare",
    endpointKey: "SIRA_WP_HEALTHCARE_GRAPHQL_URL",
    businessUnit: "healthcare",
  }),
  lifestyle: Object.freeze({
    name: "Lifestyle",
    endpointKey: "SIRA_WP_LIFESTYLE_GRAPHQL_URL",
    businessUnit: "lifestyle",
  }),
  realestate: Object.freeze({
    name: "Real Estate",
    endpointKey: "SIRA_WP_REALESTATE_GRAPHQL_URL",
    businessUnit: "real-estate",
  }),
});

const ACCEPTED_EDITORIAL_TYPES = Object.freeze([
  "SiraNewsItem",
  "SiraInsight",
  "SiraArticle",
  "SiraPressRelease",
]);

const MATRIX_AREAS = Object.freeze([
  "frontPage",
  "primaryMenu",
  "footerMenu",
  "legalMenu",
  "businessUnit",
  "editorial",
  "projects",
  "brand",
  "announcement",
  "emergency",
  "media",
]);

const READINESS_CLASSIFICATIONS = Object.freeze([
  "READY",
  "MISSING_CONTENT",
  "MISSING_CONFIGURATION",
  "DATA_CORRECTION_REQUIRED",
  "EDITORIAL_ACTION",
  "OWNER_DECISION",
  "BLOCKED",
]);

const CONTENT_AUTHORITY_STATES = Object.freeze([
  "APPROVED_LAUNCH_CONTENT",
  "UNAPPROVED_EXISTING_CONTENT",
  "NO_CONTENT",
  "NOT_APPLICABLE",
]);

const CONTENT_AUTHORITY_AREAS = MATRIX_AREAS;

// Approved canonical identity evidence mirrors frontend/src/lib/brand/fallbacks.ts.
const CANONICAL_BRAND_IDENTITIES = Object.freeze({
  group: Object.freeze({
    key: "group",
    name: "SIRA GROUP",
    tagline: "Shaping a smarter future.",
    colors: Object.freeze({
      primary: "#cca34b",
      secondary: "#172232",
      accent: "#cca34b",
      paper: "#f7f4ed",
      ink: "#20242b",
    }),
  }),
  consulting: Object.freeze({
    key: "consulting",
    name: "SIRA Consulting",
    tagline: "Strategy for new markets.",
    colors: Object.freeze({
      primary: "#8b5aae",
      secondary: "#2b1f36",
      accent: "#8b5aae",
      paper: "#f8f4fa",
      ink: "#29232d",
    }),
  }),
  healthcare: Object.freeze({
    key: "healthcare",
    name: "SIRA Healthcare",
    tagline: "Advancing diagnostic and healthcare infrastructure.",
    colors: Object.freeze({
      primary: "#2c6dad",
      secondary: "#12283f",
      accent: "#2c6dad",
      paper: "#f3f7fb",
      ink: "#1f2932",
    }),
  }),
  lifestyle: Object.freeze({
    key: "lifestyle",
    name: "SIRA Lifestyle",
    tagline: "Creating destination-led hospitality and lifestyle experiences.",
    colors: Object.freeze({
      primary: "#2e8c72",
      secondary: "#12382f",
      accent: "#2e8c72",
      paper: "#f2f8f5",
      ink: "#1f2b27",
    }),
  }),
  realestate: Object.freeze({
    key: "realestate",
    name: "SIRA Real Estate",
    tagline: "Building enduring places across markets.",
    colors: Object.freeze({
      primary: "#b0733c",
      secondary: "#2b1b14",
      accent: "#b0733c",
      paper: "#faf5ef",
      ink: "#25201d",
    }),
  }),
});

const REQUIRED_BUSINESS_UNIT_SLUGS = Object.freeze([
  "consulting",
  "healthcare",
  "lifestyle",
  "real-estate",
]);

const MENU_AREAS = Object.freeze({
  primaryMenu: "primary",
  footerMenu: "footer",
  legalMenu: "legal",
});

const QUERY = String.raw`
  query SiraContentReadinessAudit($businessUnit: ID!) {
    readingSettings {
      showOnFront
      pageOnFront
    }
    frontPage: page(id: "/", idType: URI, asPreview: false) {
      databaseId
      uri
      title
      status
      isFrontPage
      siraHomepage {
        variant
        groupHomepage {
          hero {
            headingBefore
            headingHighlight
            headingAfter
            description
          }
        }
        branchHomepage {
          hero {
            eyebrow
            headingBefore
            headingHighlight
            headingAfter
            description
            region
          }
        }
      }
    }
    primary: menus(first: 2, where: { location: PRIMARY }) {
      pageInfo { hasNextPage }
      nodes {
        databaseId
        name
        slug
        isRestricted
        locations
        menuItems(first: 200) {
          pageInfo { hasNextPage }
          nodes {
            databaseId
            isRestricted
            label
            order
            parentDatabaseId
            target
            url
          }
        }
      }
    }
    footer: menus(first: 2, where: { location: FOOTER }) {
      pageInfo { hasNextPage }
      nodes {
        databaseId
        name
        slug
        isRestricted
        locations
        menuItems(first: 200) {
          pageInfo { hasNextPage }
          nodes {
            databaseId
            isRestricted
            label
            order
            parentDatabaseId
            target
            url
          }
        }
      }
    }
    legal: menus(first: 2, where: { location: LEGAL }) {
      pageInfo { hasNextPage }
      nodes {
        databaseId
        name
        slug
        isRestricted
        locations
        menuItems(first: 200) {
          pageInfo { hasNextPage }
          nodes {
            databaseId
            isRestricted
            label
            order
            parentDatabaseId
            target
            url
          }
        }
      }
    }
    businessUnits: siraBusinessUnits(first: 100, where: { hideEmpty: false }) {
      pageInfo { hasNextPage }
      nodes {
        databaseId
        name
        slug
        count
        acceptedEditorial: contentNodes(
          first: 100
          where: {
            contentTypes: [SIRA_NEWS, SIRA_INSIGHT, SIRA_ARTICLE, SIRA_PRESS_RELEASE]
            orderby: [{ field: DATE, order: DESC }]
          }
        ) {
          pageInfo { hasNextPage }
          nodes { ...SiraEditorialAuditNode }
        }
      }
    }
    branchBusinessUnit: siraBusinessUnit(id: $businessUnit, idType: SLUG) {
      databaseId
      name
      slug
      count
      contentNodes(
        first: 100
        where: {
          contentTypes: [SIRA_NEWS, SIRA_INSIGHT, SIRA_ARTICLE, SIRA_PRESS_RELEASE]
          orderby: [{ field: DATE, order: DESC }]
        }
      ) {
        pageInfo { hasNextPage }
        nodes { ...SiraEditorialAuditNode }
      }
    }
    editorial: contentNodes(
      first: 100
      where: {
        contentTypes: [SIRA_NEWS, SIRA_INSIGHT, SIRA_ARTICLE, SIRA_PRESS_RELEASE]
        orderby: [{ field: DATE, order: DESC }]
      }
    ) {
      pageInfo { hasNextPage }
      nodes { ...SiraEditorialAuditNode }
    }
    projects: siraProjects(first: 100) {
      pageInfo { hasNextPage }
      nodes {
        databaseId
        title
        uri
        excerpt
        content(format: RENDERED)
        status
        isRestricted
        featuredImage {
          node {
            databaseId
            sourceUrl
            altText
            isRestricted
            mediaDetails { width height }
          }
        }
        projectDetails {
          subtitle
          location
          status
          gallery(first: 50) {
            pageInfo { hasNextPage }
            nodes {
              databaseId
              sourceUrl
              altText
              isRestricted
              mediaDetails { width height }
            }
          }
          statistics { label value }
          relatedCompany(first: 10) {
            pageInfo { hasNextPage }
            nodes {
              __typename
              databaseId
              isRestricted
              ... on SiraCompany { title uri }
            }
          }
        }
      }
    }
    brand: siraBrand {
      key
      name
      tagline
      primaryColor
      secondaryColor
      accentColor
      paperColor
      inkColor
      logo { databaseId sourceUrl altText width height }
      mark { databaseId sourceUrl altText width height }
      email
      phone
      address
      description
      mission
      vision
      announcement {
        message
        severity
        link { label url target }
        startsAt
        endsAt
        dismissible
        revisionKey
      }
      emergency {
        message
        severity
        link { label url target }
        startsAt
        endsAt
        dismissible
        revisionKey
      }
    }
  }

  fragment SiraEditorialAuditNode on ContentNode {
    __typename
    databaseId
    contentTypeName
    date
    uri
    isRestricted
    ... on SiraNewsItem {
      title
      excerpt
      featuredImage { node { databaseId sourceUrl altText mediaDetails { width height } } }
    }
    ... on SiraInsight {
      title
      excerpt
      featuredImage { node { databaseId sourceUrl altText mediaDetails { width height } } }
    }
    ... on SiraArticle {
      title
      excerpt
      featuredImage { node { databaseId sourceUrl altText mediaDetails { width height } } }
    }
    ... on SiraPressRelease {
      title
      excerpt
      featuredImage { node { databaseId sourceUrl altText mediaDetails { width height } } }
    }
  }
`;

function isNonEmpty(value) {
  return typeof value === "string" && value.trim() !== "";
}

function isSafeUrl(value) {
  if (!isNonEmpty(value) || /[\u0000-\u001f\u007f]/u.test(value)) return false;
  if (value.startsWith("/")) return !value.startsWith("//");
  try {
    const parsed = new URL(value);
    return (
      (parsed.protocol === "http:" || parsed.protocol === "https:") &&
      parsed.username === "" &&
      parsed.password === ""
    );
  } catch {
    return false;
  }
}

function mediaSummary(media) {
  if (!media) return { populated: false };
  const dimensions = media.mediaDetails ?? media;
  return {
    populated: true,
    databaseId: media.databaseId,
    safeSourceUrl: isSafeUrl(media.sourceUrl),
    hasAltText: isNonEmpty(media.altText),
    width: dimensions.width ?? null,
    height: dimensions.height ?? null,
    restricted: media.isRestricted === true,
  };
}

function menuSummary(connection) {
  const menus = connection?.nodes ?? [];
  return {
    assignedCount: menus.length,
    truncated: connection?.pageInfo?.hasNextPage === true,
    menus: menus.map((menu) => {
      const items = menu.menuItems?.nodes ?? [];
      const ids = new Set(items.map((item) => item.databaseId));
      return {
        databaseId: menu.databaseId,
        name: menu.name,
        slug: menu.slug,
        restricted: menu.isRestricted === true,
        locations: menu.locations ?? [],
        itemCount: items.length,
        truncated: menu.menuItems?.pageInfo?.hasNextPage === true,
        unsafeUrlCount: items.filter((item) => !isSafeUrl(item.url)).length,
        restrictedItemCount: items.filter((item) => item.isRestricted === true).length,
        duplicateIdentityCount: items.length - ids.size,
        orphanCount: items.filter(
          (item) => item.parentDatabaseId && !ids.has(item.parentDatabaseId),
        ).length,
      };
    }),
  };
}

function editorialSummary(connection) {
  const nodes = connection?.nodes ?? [];
  const byType = Object.fromEntries(ACCEPTED_EDITORIAL_TYPES.map((type) => [type, 0]));
  for (const node of nodes) {
    if (Object.hasOwn(byType, node.__typename)) byType[node.__typename] += 1;
  }
  return {
    returnedCount: nodes.length,
    truncated: connection?.pageInfo?.hasNextPage === true,
    byType,
    missingTitleCount: nodes.filter((node) => !isNonEmpty(node.title)).length,
    unsafeUriCount: nodes.filter((node) => !isSafeUrl(node.uri)).length,
    missingDateCount: nodes.filter((node) => !isNonEmpty(node.date)).length,
    missingExcerptCount: nodes.filter((node) => !isNonEmpty(node.excerpt)).length,
    restrictedCount: nodes.filter((node) => node.isRestricted === true).length,
    featuredMedia: {
      populatedCount: nodes.filter((node) => node.featuredImage?.node).length,
      missingAltCount: nodes.filter(
        (node) => node.featuredImage?.node && !isNonEmpty(node.featuredImage.node.altText),
      ).length,
      unsafeUrlCount: nodes.filter(
        (node) => node.featuredImage?.node && !isSafeUrl(node.featuredImage.node.sourceUrl),
      ).length,
      invalidDimensionsCount: nodes.filter((node) => {
        const media = node.featuredImage?.node;
        return media && (!(media.mediaDetails?.width > 0) || !(media.mediaDetails?.height > 0));
      }).length,
    },
  };
}

function projectSummary(connection) {
  const nodes = connection?.nodes ?? [];
  return {
    returnedPublishedCount: nodes.length,
    truncated: connection?.pageInfo?.hasNextPage === true,
    restrictedCount: nodes.filter((node) => node.isRestricted === true).length,
    missingTitleCount: nodes.filter((node) => !isNonEmpty(node.title)).length,
    unsafeUriCount: nodes.filter((node) => !isSafeUrl(node.uri)).length,
    missingExcerptCount: nodes.filter((node) => !isNonEmpty(node.excerpt)).length,
    missingFeaturedImageCount: nodes.filter((node) => !node.featuredImage?.node).length,
    missingFeaturedAltCount: nodes.filter(
      (node) => node.featuredImage?.node && !isNonEmpty(node.featuredImage.node.altText),
    ).length,
    missingSubtitleCount: nodes.filter((node) => !isNonEmpty(node.projectDetails?.subtitle)).length,
    missingLocationCount: nodes.filter((node) => !isNonEmpty(node.projectDetails?.location)).length,
    missingStatusCount: nodes.filter((node) => !isNonEmpty(node.projectDetails?.status)).length,
    missingRenderedContentCount: nodes.filter((node) => !isNonEmpty(node.content)).length,
    gallery: {
      populatedProjectCount: nodes.filter((node) => (node.projectDetails?.gallery?.nodes?.length ?? 0) > 0).length,
      truncatedProjectCount: nodes.filter((node) => node.projectDetails?.gallery?.pageInfo?.hasNextPage === true).length,
      unsafeMediaCount: nodes.flatMap((node) => node.projectDetails?.gallery?.nodes ?? []).filter((media) => !isSafeUrl(media.sourceUrl)).length,
      missingAltCount: nodes.flatMap((node) => node.projectDetails?.gallery?.nodes ?? []).filter((media) => !isNonEmpty(media.altText)).length,
      restrictedMediaCount: nodes.flatMap((node) => node.projectDetails?.gallery?.nodes ?? []).filter((media) => media.isRestricted === true).length,
    },
    statistics: {
      populatedProjectCount: nodes.filter((node) => (node.projectDetails?.statistics?.length ?? 0) > 0).length,
      malformedEntryCount: nodes.flatMap((node) => node.projectDetails?.statistics ?? []).filter((stat) => !isNonEmpty(stat.label) || !isNonEmpty(stat.value)).length,
    },
    relatedCompanies: {
      populatedProjectCount: nodes.filter((node) => (node.projectDetails?.relatedCompany?.nodes?.length ?? 0) > 0).length,
      truncatedProjectCount: nodes.filter((node) => node.projectDetails?.relatedCompany?.pageInfo?.hasNextPage === true).length,
      restrictedCount: nodes.flatMap((node) => node.projectDetails?.relatedCompany?.nodes ?? []).filter((company) => company.isRestricted === true).length,
      malformedCount: nodes.flatMap((node) => node.projectDetails?.relatedCompany?.nodes ?? []).filter((company) => !(company.databaseId > 0) || !isNonEmpty(company.title) || !isSafeUrl(company.uri)).length,
    },
  };
}

function bannerSummary(banner, auditedAt) {
  if (!banner) return { state: "null" };
  const startsAt = banner.startsAt ? Date.parse(banner.startsAt) : null;
  const endsAt = banner.endsAt ? Date.parse(banner.endsAt) : null;
  const at = Date.parse(auditedAt);
  const validDates = (startsAt === null || Number.isFinite(startsAt)) && (endsAt === null || Number.isFinite(endsAt));
  let schedule = "active";
  if (!validDates || (startsAt !== null && endsAt !== null && startsAt >= endsAt)) schedule = "malformed";
  else if (startsAt !== null && at < startsAt) schedule = "scheduled";
  else if (endsAt !== null && at > endsAt) schedule = "expired";
  return {
    state: "populated",
    messagePresent: isNonEmpty(banner.message),
    severity: banner.severity,
    linkPresent: banner.link !== null,
    linkSafe: banner.link ? isSafeUrl(banner.link.url) : null,
    target: banner.link?.target ?? null,
    startsAt: banner.startsAt,
    endsAt: banner.endsAt,
    dismissible: banner.dismissible,
    revisionKeyPresent: isNonEmpty(banner.revisionKey),
    schedule,
  };
}

function brandSummary(brand, auditedAt) {
  return {
    key: brand?.key ?? null,
    name: brand?.name ?? null,
    tagline: brand?.tagline ?? null,
    colors: {
      primary: brand?.primaryColor ?? null,
      secondary: brand?.secondaryColor ?? null,
      accent: brand?.accentColor ?? null,
      paper: brand?.paperColor ?? null,
      ink: brand?.inkColor ?? null,
    },
    logo: mediaSummary(brand?.logo),
    mark: mediaSummary(brand?.mark),
    publicIdentityPresence: {
      email: isNonEmpty(brand?.email),
      phone: isNonEmpty(brand?.phone),
      address: isNonEmpty(brand?.address),
      description: isNonEmpty(brand?.description),
      mission: isNonEmpty(brand?.mission),
      vision: isNonEmpty(brand?.vision),
    },
    announcement: bannerSummary(brand?.announcement, auditedAt),
    emergency: bannerSummary(brand?.emergency, auditedAt),
  };
}

function homepageSummary(data, siteKey) {
  const page = data.frontPage;
  const expectedVariant = siteKey === "group" ? "group" : "branch";
  const hero = expectedVariant === "group" ? page?.siraHomepage?.groupHomepage?.hero : page?.siraHomepage?.branchHomepage?.hero;
  return {
    showOnFront: data.readingSettings?.showOnFront ?? null,
    pageOnFront: data.readingSettings?.pageOnFront ?? null,
    resolvesRootUri: page !== null,
    databaseId: page?.databaseId ?? null,
    uri: page?.uri ?? null,
    title: page?.title ?? null,
    status: page?.status ?? null,
    isFrontPage: page?.isFrontPage ?? false,
    variant: page?.siraHomepage?.variant ?? null,
    expectedVariant,
    heroFieldPopulation: hero
      ? Object.fromEntries(Object.entries(hero).map(([key, value]) => [key, isNonEmpty(value)]))
      : null,
  };
}

function hasRequiredHomepageContent(homepage) {
  const population = homepage.heroFieldPopulation;
  if (population === null) return false;
  const hasHeading =
    population.headingBefore === true ||
    population.headingHighlight === true ||
    population.headingAfter === true;
  return homepage.expectedVariant === "group"
    ? hasHeading && population.description === true
    : hasHeading &&
        population.description === true &&
        population.eyebrow === true &&
        population.region === true;
}

function classifyHomepage(homepage) {
  const configured =
    homepage.showOnFront === "page" &&
    Number.isSafeInteger(homepage.pageOnFront) &&
    homepage.pageOnFront > 0 &&
    homepage.resolvesRootUri === true &&
    homepage.databaseId === homepage.pageOnFront &&
    homepage.uri === "/" &&
    homepage.status === "publish" &&
    homepage.isFrontPage === true &&
    homepage.variant === homepage.expectedVariant;

  if (!configured) return "MISSING_CONFIGURATION";
  return hasRequiredHomepageContent(homepage) ? "READY" : "MISSING_CONTENT";
}

function classifyMenu(menu, expectedLocation) {
  if (menu.assignedCount === 0) return "MISSING_CONFIGURATION";
  if (menu.assignedCount !== 1 || menu.truncated || menu.menus.length !== 1) {
    return "DATA_CORRECTION_REQUIRED";
  }

  const assigned = menu.menus[0];
  const usable =
    assigned &&
    Number.isSafeInteger(assigned.databaseId) &&
    assigned.databaseId > 0 &&
    isNonEmpty(assigned.name) &&
    isNonEmpty(assigned.slug) &&
    assigned.restricted === false &&
    assigned.locations.includes(expectedLocation) &&
    assigned.itemCount > 0 &&
    assigned.truncated === false &&
    assigned.unsafeUrlCount === 0 &&
    assigned.restrictedItemCount === 0 &&
    assigned.duplicateIdentityCount === 0 &&
    assigned.orphanCount === 0;
  return usable ? "READY" : "DATA_CORRECTION_REQUIRED";
}

function classifyBusinessUnit(siteKey, businessUnit) {
  if (siteKey === "group") {
    const terms = businessUnit.availableTerms;
    return businessUnit.expectedSlug === null &&
      businessUnit.term === null &&
      businessUnit.availableTermsTruncated === false &&
      REQUIRED_BUSINESS_UNIT_SLUGS.every(
        (slug) => {
          const matches = terms.filter((term) => term.slug === slug);
          return (
            matches.length === 1 &&
            Number.isSafeInteger(matches[0].databaseId) &&
            matches[0].databaseId > 0 &&
            matches[0].acceptedEditorialAssignments.truncated === false
          );
        },
      )
      ? "READY"
      : "DATA_CORRECTION_REQUIRED";
  }

  if (businessUnit.term === null) return "MISSING_CONFIGURATION";
  return businessUnit.expectedSlug === SITE_CONFIG[siteKey]?.businessUnit &&
    businessUnit.term.slug === businessUnit.expectedSlug &&
    Number.isSafeInteger(businessUnit.term.databaseId) &&
    businessUnit.term.databaseId > 0
    ? "READY"
    : "DATA_CORRECTION_REQUIRED";
}

function hasEditorialAnomalies(editorial) {
  return (
    editorial.truncated ||
    editorial.missingTitleCount > 0 ||
    editorial.unsafeUriCount > 0 ||
    editorial.missingDateCount > 0 ||
    editorial.missingExcerptCount > 0 ||
    editorial.restrictedCount > 0 ||
    editorial.featuredMedia.unsafeUrlCount > 0 ||
    editorial.featuredMedia.invalidDimensionsCount > 0
  );
}

function classifyEditorial(siteKey, editorial, businessUnitClassification) {
  if (siteKey === "group") {
    if (editorial.groupRootUnfiltered !== true) return "DATA_CORRECTION_REQUIRED";
    if (hasEditorialAnomalies(editorial.root)) return "DATA_CORRECTION_REQUIRED";
    return editorial.root.returnedCount > 0 ? "READY" : "OWNER_DECISION";
  }

  if (businessUnitClassification !== "READY") {
    return editorial.root.returnedCount === 0
      ? "OWNER_DECISION"
      : "MISSING_CONFIGURATION";
  }
  if (editorial.branchFiltered === null) return "DATA_CORRECTION_REQUIRED";
  if (hasEditorialAnomalies(editorial.branchFiltered)) {
    return "DATA_CORRECTION_REQUIRED";
  }
  return editorial.branchFiltered.returnedCount > 0 ? "READY" : "OWNER_DECISION";
}

function hasProjectStructuralAnomalies(projects) {
  return (
    projects.truncated ||
    projects.restrictedCount > 0 ||
    projects.missingTitleCount > 0 ||
    projects.unsafeUriCount > 0 ||
    projects.missingExcerptCount > 0 ||
    projects.missingLocationCount > 0 ||
    projects.missingStatusCount > 0 ||
    projects.missingRenderedContentCount > 0 ||
    projects.gallery.truncatedProjectCount > 0 ||
    projects.gallery.unsafeMediaCount > 0 ||
    projects.gallery.restrictedMediaCount > 0 ||
    projects.statistics.malformedEntryCount > 0 ||
    projects.relatedCompanies.truncatedProjectCount > 0 ||
    projects.relatedCompanies.restrictedCount > 0 ||
    projects.relatedCompanies.malformedCount > 0
  );
}

function classifyProjects(projects) {
  if (projects.returnedPublishedCount === 0) return "OWNER_DECISION";
  if (hasProjectStructuralAnomalies(projects)) {
    return "DATA_CORRECTION_REQUIRED";
  }
  return projects.missingFeaturedImageCount > 0 ||
    projects.missingFeaturedAltCount > 0 ||
    projects.missingSubtitleCount > 0 ||
    projects.gallery.missingAltCount > 0
    ? "EDITORIAL_ACTION"
    : "READY";
}

function classifyBrand(siteKey, brand) {
  const expected = CANONICAL_BRAND_IDENTITIES[siteKey];
  if (!expected) return "BLOCKED";
  return brand.key === expected.key &&
    brand.name === expected.name &&
    brand.tagline === expected.tagline &&
    Object.entries(expected.colors).every(
      ([name, value]) => brand.colors[name]?.toLowerCase() === value,
    )
    ? "READY"
    : "DATA_CORRECTION_REQUIRED";
}

function classifyBanner(banner) {
  if (banner.state === "null") return "READY";
  const structurallyValid =
    banner.state === "populated" &&
    banner.messagePresent === true &&
    ["IMPORTANT", "INFO", "URGENT"].includes(banner.severity) &&
    typeof banner.dismissible === "boolean" &&
    banner.revisionKeyPresent === true &&
    (!banner.linkPresent || banner.linkSafe === true) &&
    [null, "_self", "_blank"].includes(banner.target) &&
    banner.schedule !== "malformed";
  if (!structurallyValid) return "DATA_CORRECTION_REQUIRED";
  return banner.schedule === "expired" ? "EDITORIAL_ACTION" : "READY";
}

function hasMediaProblem(media) {
  return (
    media.populated === true &&
    (media.safeSourceUrl !== true ||
      media.hasAltText !== true ||
      !(media.width > 0) ||
      !(media.height > 0) ||
      media.restricted === true)
  );
}

function classifyMedia(site) {
  const projectMediaProblem =
    site.projects.returnedPublishedCount > 0 &&
    (site.projects.missingFeaturedImageCount > 0 ||
      site.projects.missingFeaturedAltCount > 0 ||
      site.projects.gallery.unsafeMediaCount > 0 ||
      site.projects.gallery.missingAltCount > 0 ||
      site.projects.gallery.restrictedMediaCount > 0);
  const editorialMediaProblem =
    site.editorial.root.featuredMedia.missingAltCount > 0 ||
    site.editorial.root.featuredMedia.unsafeUrlCount > 0 ||
    site.editorial.root.featuredMedia.invalidDimensionsCount > 0;
  return hasMediaProblem(site.brand.logo) ||
    hasMediaProblem(site.brand.mark) ||
    projectMediaProblem ||
    editorialMediaProblem
    ? "EDITORIAL_ACTION"
    : "READY";
}

export function classifySite(siteKey, site) {
  if (!site.inspected) {
    return Object.fromEntries(MATRIX_AREAS.map((area) => [area, "BLOCKED"]));
  }
  const businessUnit = classifyBusinessUnit(siteKey, site.businessUnit);
  return {
    frontPage: classifyHomepage(site.homepage),
    primaryMenu: classifyMenu(site.menus.primary, "PRIMARY"),
    footerMenu: classifyMenu(site.menus.footer, "FOOTER"),
    legalMenu: classifyMenu(site.menus.legal, "LEGAL"),
    businessUnit,
    editorial: classifyEditorial(siteKey, site.editorial, businessUnit),
    projects: classifyProjects(site.projects),
    brand: classifyBrand(siteKey, site.brand),
    announcement: classifyBanner(site.brand.announcement),
    emergency: classifyBanner(site.brand.emergency),
    media: classifyMedia(site),
  };
}

export function classifyContentAuthority(siteKey, site) {
  if (!site.inspected) {
    return Object.fromEntries(
      CONTENT_AUTHORITY_AREAS.map((area) => [area, "NOT_APPLICABLE"]),
    );
  }

  const homepageExists = site.homepage.resolvesRootUri === true;
  const editorialCount = siteKey === "group"
    ? site.editorial.root.returnedCount
    : (site.editorial.branchFiltered?.returnedCount ?? site.editorial.root.returnedCount);
  const projectCount = site.projects.returnedPublishedCount;

  return {
    frontPage: homepageExists
      ? "UNAPPROVED_EXISTING_CONTENT"
      : "NO_CONTENT",
    primaryMenu: site.menus.primary.assignedCount > 0
      ? "UNAPPROVED_EXISTING_CONTENT"
      : "NO_CONTENT",
    footerMenu: site.menus.footer.assignedCount > 0
      ? "UNAPPROVED_EXISTING_CONTENT"
      : "NO_CONTENT",
    legalMenu: site.menus.legal.assignedCount > 0
      ? "UNAPPROVED_EXISTING_CONTENT"
      : "NO_CONTENT",
    businessUnit: "NOT_APPLICABLE",
    editorial: editorialCount > 0
      ? "UNAPPROVED_EXISTING_CONTENT"
      : "NO_CONTENT",
    projects: projectCount > 0
      ? "UNAPPROVED_EXISTING_CONTENT"
      : "NO_CONTENT",
    // Repository canonical brand identity is approved authority and is evaluated
    // independently from unapproved editorial/business records.
    brand: classifyBrand(siteKey, site.brand) === "READY"
      ? "APPROVED_LAUNCH_CONTENT"
      : "UNAPPROVED_EXISTING_CONTENT",
    announcement: site.brand.announcement.state === "null"
      ? "NO_CONTENT"
      : "UNAPPROVED_EXISTING_CONTENT",
    emergency: site.brand.emergency.state === "null"
      ? "NO_CONTENT"
      : "UNAPPROVED_EXISTING_CONTENT",
    media: "NOT_APPLICABLE",
  };
}

function canAuthorityOverride(classification) {
  return ["READY", "MISSING_CONTENT", "OWNER_DECISION", "EDITORIAL_ACTION"].includes(
    classification,
  );
}

export function applyLaunchAuthority(
  technicalMatrix,
  contentAuthority,
) {
  const launchMatrix = { ...technicalMatrix };
  if (
    canAuthorityOverride(technicalMatrix.frontPage) &&
    contentAuthority.frontPage !== "APPROVED_LAUNCH_CONTENT"
  ) {
    launchMatrix.frontPage = "EDITORIAL_ACTION";
  }
  for (const area of ["primaryMenu", "footerMenu", "legalMenu"]) {
    if (
      technicalMatrix[area] === "READY" &&
      contentAuthority[area] !== "APPROVED_LAUNCH_CONTENT"
    ) {
      launchMatrix[area] = "EDITORIAL_ACTION";
    }
  }
  if (
    technicalMatrix.editorial !== "BLOCKED" &&
    contentAuthority.editorial !== "APPROVED_LAUNCH_CONTENT"
  ) {
    launchMatrix.editorial = "EDITORIAL_ACTION";
  }
  if (
    technicalMatrix.projects !== "BLOCKED" &&
    contentAuthority.projects !== "APPROVED_LAUNCH_CONTENT"
  ) {
    launchMatrix.projects = "EDITORIAL_ACTION";
  }
  return launchMatrix;
}

function finding(site, area, classification, evidence, expected, owner, action, verification) {
  return {
    site,
    area,
    classification,
    evidence,
    expectedCanonicalState: expected,
    owner,
    recommendedAction: action,
    destructive: false,
    mutationAuthorized: false,
    verificationMethod: verification,
  };
}

function formatBrandIdentity(identity) {
  return `${identity.name}; ${identity.tagline}; ${Object.entries(identity.colors)
    .map(([name, value]) => `${name} ${value}`)
    .join("; ")}.`;
}

function createAreaFinding(
  siteKey,
  site,
  area,
  classification,
  contentAuthority,
) {
  if (classification === "BLOCKED") {
    return finding(
      site.siteName,
      area,
      classification,
      site.blocker ?? "Required public evidence could not be inspected.",
      "The accepted public contract coordinate is inspectable.",
      "BLOCKED",
      "Restore authorized read-only access or resolve the evidence conflict.",
      "Rerun the read-only audit for this tenant and area.",
    );
  }

  if (area === "frontPage") {
    const homepage = site.homepage;
    const missingFields = Object.entries(homepage.heroFieldPopulation ?? {})
      .filter(([, populated]) => !populated)
      .map(([name]) => name);
    return finding(
      site.siteName,
      area,
      classification,
      classification === "MISSING_CONFIGURATION"
        ? `showOnFront=${homepage.showOnFront}; pageOnFront=${homepage.pageOnFront}; resolvesRootUri=${homepage.resolvesRootUri}; databaseId=${homepage.databaseId}; uri=${homepage.uri}; status=${homepage.status}; isFrontPage=${homepage.isFrontPage}; variant=${homepage.variant}; expectedVariant=${homepage.expectedVariant}.`
        : `Page ${homepage.databaseId} resolves at ${homepage.uri} with variant=${homepage.variant}; missing accepted hero fields=${missingFields.join(",") || "unknown"}.`,
      `A published ${homepage.expectedVariant} homepage assigned as the static front page, resolving at URI /, with all accepted hero fields populated.`,
      classification === "MISSING_CONFIGURATION"
        ? "CMS_ADMIN_ACTION"
        : "EDITORIAL_ACTION",
      classification === "MISSING_CONFIGURATION"
        ? "Create/select the approved homepage and assign it in Reading Settings after editorial approval."
        : "Supply and approve the missing structured homepage content without changing the canonical / lookup.",
      "Re-query readingSettings and page(id: \"/\", idType: URI), then verify configuration, variant, and accepted hero fields.",
    );
  }

  if (Object.hasOwn(MENU_AREAS, area)) {
    const key = MENU_AREAS[area];
    const menu = site.menus[key];
    return finding(
      site.siteName,
      area,
      classification,
      `Native ${key.toUpperCase()} assignment count=${menu.assignedCount}; connectionTruncated=${menu.truncated}; menu summaries=${JSON.stringify(menu.menus)}.`,
      `Exactly one unrestricted, untruncated native ${key.toUpperCase()} menu with the expected location, safe items, unique identities, and no orphans.`,
      "CMS_ADMIN_ACTION",
      menu.assignedCount === 0
        ? `Create/approve and assign the ${key.toUpperCase()} menu using the native WordPress location.`
        : `Correct the ambiguous or structurally unsafe ${key.toUpperCase()} native menu assignment.`,
      "Re-query the accepted SiraNavigation operation and validate assignment, location, hierarchy, restrictions, and URLs.",
    );
  }

  if (area === "businessUnit") {
    return finding(
      site.siteName,
      area,
      classification,
      `Expected slug=${site.businessUnit.expectedSlug}; term=${JSON.stringify(site.businessUnit.term)}; available slugs=${site.businessUnit.availableTerms.map((term) => term.slug).join(",")}; truncated=${site.businessUnit.availableTermsTruncated}.`,
      siteKey === "group"
        ? `An unfiltered Group contract plus exactly one evidence-backed term for each accepted slug: ${REQUIRED_BUSINESS_UNIT_SLUGS.join(", ")}.`
        : `A canonical Business Unit term with exact slug ${site.businessUnit.expectedSlug}.`,
      "CMS_ADMIN_ACTION",
      classification === "MISSING_CONFIGURATION"
        ? "Create the exact approved term and assign only relevant accepted editorial records; do not derive or rename slugs mechanically."
        : "Correct the taxonomy slug, identity, duplication, or truncation anomaly without changing the approved mapping.",
      "Re-query siraBusinessUnit by SLUG and its server-filtered accepted contentNodes connection.",
    );
  }

  if (area === "editorial") {
    const filtered = site.editorial.branchFiltered;
    const requiresAuthority =
      contentAuthority !== "APPROVED_LAUNCH_CONTENT";
    return finding(
      site.siteName,
      area,
      classification,
      `Root accepted-family count=${site.editorial.root.returnedCount}; root anomalies=${hasEditorialAnomalies(site.editorial.root)}; groupRootUnfiltered=${site.editorial.groupRootUnfiltered}; filtered=${filtered ? JSON.stringify(filtered) : "unavailable"}.`,
      siteKey === "group"
        ? "The native unfiltered Group feed is structurally safe and contains explicitly approved authoritative launch content."
        : "The exact Business Unit term exposes a structurally safe server-filtered feed containing explicitly approved authoritative launch content.",
      requiresAuthority
        ? "EDITORIAL_ACTION"
        : classification === "OWNER_DECISION"
          ? "OWNER_DECISION"
        : classification === "MISSING_CONFIGURATION"
          ? "CMS_ADMIN_ACTION"
          : "EDITORIAL_ACTION",
      requiresAuthority
        ? contentAuthority === "NO_CONTENT"
          ? "Author, review, and explicitly approve authoritative launch editorial content after required taxonomy configuration; do not fabricate frontend fallbacks."
          : "Review existing technically valid records, retain or replace them editorially, and explicitly approve authoritative launch content; do not delete records in this increment."
        : classification === "OWNER_DECISION"
          ? "Decide whether this tenant intentionally launches with an empty editorial feed; otherwise commission approved content."
        : classification === "MISSING_CONFIGURATION"
          ? "Restore the exact Business Unit term/filter configuration before treating existing branch content as ready."
          : "Correct malformed, restricted, unsafe, or truncated accepted editorial records.",
      "Re-query the accepted native root and, for branches, server-filtered editorial operations.",
    );
  }

  if (area === "projects") {
    const projects = site.projects;
    const structuralAnomalies = hasProjectStructuralAnomalies(projects);
    const requiresAuthority =
      contentAuthority !== "APPROVED_LAUNCH_CONTENT";
    return finding(
      site.siteName,
      area,
      classification,
      `Published count=${projects.returnedPublishedCount}; structuralAnomalies=${hasProjectStructuralAnomalies(projects)}; missingFeaturedImages=${projects.missingFeaturedImageCount}; missingFeaturedAlt=${projects.missingFeaturedAltCount}; missingSubtitles=${projects.missingSubtitleCount}; galleryMissingAlt=${projects.gallery.missingAltCount}.`,
      "Every launch project is explicitly approved as authoritative, structurally safe, and has approved archive presentation fields.",
      requiresAuthority
        ? "EDITORIAL_ACTION"
        : classification === "OWNER_DECISION"
          ? "OWNER_DECISION"
        : structuralAnomalies
          ? "CMS_ADMIN_ACTION"
          : "EDITORIAL_ACTION",
      requiresAuthority
        ? contentAuthority === "NO_CONTENT"
          ? "Author, review, and explicitly approve authoritative launch project records; do not fabricate frontend fallbacks."
          : "Review existing technically valid projects, retain or replace them editorially, explicitly approve launch records, and complete presentation gaps; do not delete records in this increment."
        : classification === "OWNER_DECISION"
          ? "Decide whether this tenant requires launch projects; if yes, commission public records rather than frontend fallbacks."
        : classification === "EDITORIAL_ACTION"
          ? "Supply approved missing archive presentation fields and media metadata."
          : "Correct malformed, restricted, unsafe, duplicate, or truncated project data.",
      "Re-query the accepted Project Archive and native Project Single operations and verify zero relevant anomalies.",
    );
  }

  if (area === "brand") {
    const expected = CANONICAL_BRAND_IDENTITIES[siteKey];
    return finding(
      site.siteName,
      area,
      classification,
      `Live key=${site.brand.key}; name=${site.brand.name}; tagline=${site.brand.tagline}; colors=${JSON.stringify(site.brand.colors)}.`,
      expected ? formatBrandIdentity(expected) : "Approved canonical identity evidence for this tenant.",
      classification === "BLOCKED" ? "BLOCKED" : "CMS_ADMIN_ACTION",
      "Correct the canonical public brand fields in WordPress using approved repository identity evidence; do not normalize incorrect values in Next.js.",
      "Re-query siraBrand and compare the exact effective key, name, tagline, and identity colors.",
    );
  }

  if (area === "announcement" || area === "emergency") {
    const banner = site.brand[area];
    return finding(
      site.siteName,
      area,
      classification,
      `Typed ${area} summary=${JSON.stringify(banner)}.`,
      "The typed banner is null or has valid message, severity, safe link/target, schedule, dismissibility, and revision identity.",
      "EDITORIAL_ACTION",
      classification === "EDITORIAL_ACTION"
        ? `Review the expired ${area} and separately approve deactivation or rescheduling.`
        : `Correct the malformed typed ${area} fields without fabricating copy.`,
      `Re-query siraBrand.${area} and re-evaluate structure, link safety, and schedule.`,
    );
  }

  const brandMedia = { logo: site.brand.logo, mark: site.brand.mark };
  const mediaEvidence = {
    brand: brandMedia,
    editorial: site.editorial.root.featuredMedia,
    projects: {
      published: site.projects.returnedPublishedCount,
      missingFeaturedImages: site.projects.missingFeaturedImageCount,
      missingFeaturedAlt: site.projects.missingFeaturedAltCount,
      galleryUnsafe: site.projects.gallery.unsafeMediaCount,
      galleryMissingAlt: site.projects.gallery.missingAltCount,
      galleryRestricted: site.projects.gallery.restrictedMediaCount,
    },
  };
  return finding(
    site.siteName,
    area,
    classification,
    `Required public media summary=${JSON.stringify(mediaEvidence)}.`,
    "Media required by current public brand/content has safe URLs, useful alt text, usable dimensions, and no restricted asset leakage.",
    "EDITORIAL_ACTION",
    "Supply or correct required public media and accessibility metadata without fabricating assets.",
    "Re-query public media metadata and verify source safety, alt text, dimensions, and restriction state.",
  );
}

export function buildFindings(
  sites,
  matrix,
  technicalMatrix = matrix,
  contentAuthorityMatrix = {},
) {
  const findings = [];
  for (const [siteKey, site] of Object.entries(sites)) {
    for (const area of MATRIX_AREAS) {
      const classification = matrix[siteKey][area];
      if (classification !== "READY") {
        const contentAuthority = CONTENT_AUTHORITY_AREAS.includes(area)
          ? contentAuthorityMatrix[siteKey]?.[area] ?? "NOT_APPLICABLE"
          : "NOT_APPLICABLE";
        findings.push(
          Object.freeze({
            ...createAreaFinding(
              siteKey,
              site,
              area,
              classification,
              contentAuthority,
            ),
            technicalClassification:
              technicalMatrix[siteKey]?.[area] ?? classification,
            contentAuthority,
          }),
        );
      }
    }
  }
  return findings;
}

async function execute(endpoint, variables) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ query: QUERY, variables }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) throw new Error(`HTTP_${response.status}`);
  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`GRAPHQL_${payload.errors.map((error) => error.extensions?.code ?? "ERROR").join("_")}`);
  }
  return payload.data;
}

export async function runContentReadinessAudit(
  environment,
  auditedAt = new Date().toISOString(),
) {
  const sites = {};

  for (const [siteKey, config] of Object.entries(SITE_CONFIG)) {
    const endpoint = environment[config.endpointKey] ?? process.env[config.endpointKey];
    if (!endpoint) {
      sites[siteKey] = { siteName: config.name, inspected: false, blocker: "ENDPOINT_NOT_CONFIGURED" };
      continue;
    }
    try {
      const data = await execute(endpoint, {
        businessUnit: config.businessUnit ?? "__group-unfiltered__",
      });
      const rootEditorial = editorialSummary(data.editorial);
      const branchEditorial =
        config.businessUnit && data.branchBusinessUnit
          ? editorialSummary(data.branchBusinessUnit.contentNodes)
          : null;
      sites[siteKey] = {
        siteName: config.name,
        inspected: true,
        homepage: homepageSummary(data, siteKey),
        menus: {
          primary: menuSummary(data.primary),
          footer: menuSummary(data.footer),
          legal: menuSummary(data.legal),
        },
        businessUnit: {
          expectedSlug: config.businessUnit,
          term: config.businessUnit
            ? data.branchBusinessUnit
              ? {
                  databaseId: data.branchBusinessUnit.databaseId,
                  name: data.branchBusinessUnit.name,
                  slug: data.branchBusinessUnit.slug,
                  totalAssignedObjectCount: data.branchBusinessUnit.count,
                }
              : null
            : null,
          availableTerms: (data.businessUnits?.nodes ?? []).map((term) => ({
            databaseId: term.databaseId,
            name: term.name,
            slug: term.slug,
            totalAssignedObjectCount: term.count,
            acceptedEditorialAssignments: editorialSummary(term.acceptedEditorial),
          })),
          availableTermsTruncated:
            data.businessUnits?.pageInfo?.hasNextPage === true,
        },
        editorial: {
          groupRootUnfiltered: siteKey === "group",
          root: rootEditorial,
          branchFiltered: branchEditorial,
        },
        projects: projectSummary(data.projects),
        brand: brandSummary(data.brand, auditedAt),
      };
    } catch (error) {
      sites[siteKey] = {
        siteName: config.name,
        inspected: false,
        blocker: error instanceof Error ? error.message : "UNKNOWN_AUDIT_ERROR",
      };
    }
  }

  const technicalReadinessMatrix = Object.fromEntries(
    Object.entries(sites).map(([siteKey, site]) => [siteKey, classifySite(siteKey, site)]),
  );
  const contentAuthorityMatrix = Object.fromEntries(
    Object.entries(sites).map(([siteKey, site]) => [
      siteKey,
      classifyContentAuthority(siteKey, site),
    ]),
  );
  const readinessMatrix = Object.fromEntries(
    Object.entries(technicalReadinessMatrix).map(([siteKey, matrix]) => [
      siteKey,
      applyLaunchAuthority(matrix, contentAuthorityMatrix[siteKey]),
    ]),
  );
  const findings = buildFindings(
    sites,
    readinessMatrix,
    technicalReadinessMatrix,
    contentAuthorityMatrix,
  );
  const classificationCounts = Object.fromEntries(
    READINESS_CLASSIFICATIONS.map((classification) => [classification, 0]),
  );
  for (const row of Object.values(readinessMatrix)) {
    for (const classification of Object.values(row)) {
      classificationCounts[classification] = (classificationCounts[classification] ?? 0) + 1;
    }
  }

  return {
    schemaVersion: 2,
    audit: "Step 2C.3D WordPress Content Readiness",
    auditedAt,
    mode: "read-only public GraphQL metadata",
    querySource: basename(import.meta.filename),
    security: {
      endpointValuesPersisted: false,
      credentialsPersisted: false,
      unpublishedBodiesPersisted: false,
      rawPayloadsPersisted: false,
      wordpressMutationOccurred: false,
      backendMutationOccurred: false,
      productionDeploymentOccurred: false,
    },
    limitations: [
      "Public GraphQL proves published/anonymous contract readiness only.",
      "Draft/private totals, WordPress admin provenance, and show_on_front mutation controls require authorized admin/WP-CLI evidence.",
      "Counts are exact only when truncated=false.",
    ],
    readinessMatrix,
    technicalReadinessMatrix,
    contentAuthority: {
      vocabulary: CONTENT_AUTHORITY_STATES,
      ownerClarification:
        "Existing WordPress business/editorial records are not approved as authoritative launch content unless explicit approval evidence exists.",
      matrix: contentAuthorityMatrix,
      destructiveCleanupAuthorized: false,
    },
    classificationCounts,
    findings,
    historicalRevalidation: {
      branchFrontPages: "UNCHANGED_MISSING",
      nativeMenus: "UNCHANGED_MISSING",
      groupBrand: "UNCORRECTED",
      healthcareBrand: "UNCORRECTED",
    },
    sites,
  };
}

async function main() {
  const envPath = resolve(process.argv[2] ?? ".env.local");
  const outputPath = resolve(process.argv[3] ?? "../artifacts/step-2c3d/content-readiness-live.json");
  const envText = await readFile(envPath, "utf8");
  const environment = Object.fromEntries(
    envText.split(/\r?\n/u).flatMap((line) => {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/u.exec(line);
      return match ? [[match[1], match[2]]] : [];
    }),
  );
  const output = await runContentReadinessAudit(environment);

  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main();
}

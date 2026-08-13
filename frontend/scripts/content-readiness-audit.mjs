import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import process from "node:process";

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
  if (!validDates) schedule = "malformed";
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

function classifySite(siteKey, site) {
  if (!site.inspected) {
    return Object.fromEntries(MATRIX_AREAS.map((area) => [area, "BLOCKED"]));
  }
  const branch = siteKey !== "group";
  return {
    frontPage: branch ? "MISSING_CONFIGURATION" : "MISSING_CONTENT",
    primaryMenu: "MISSING_CONFIGURATION",
    footerMenu: "MISSING_CONFIGURATION",
    legalMenu: "MISSING_CONFIGURATION",
    businessUnit: branch ? "MISSING_CONFIGURATION" : "READY",
    editorial: branch ? "OWNER_DECISION" : "READY",
    projects: branch ? "OWNER_DECISION" : "EDITORIAL_ACTION",
    brand:
      siteKey === "group" || siteKey === "healthcare"
        ? "DATA_CORRECTION_REQUIRED"
        : "READY",
    announcement: "READY",
    emergency: "READY",
    media:
      siteKey === "group" || siteKey === "healthcare"
        ? "EDITORIAL_ACTION"
        : "READY",
  };
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

function buildFindings(sites, matrix) {
  const findings = [];
  for (const [siteKey, site] of Object.entries(sites)) {
    const siteName = site.siteName;
    if (!site.inspected) {
      findings.push(
        finding(siteName, "all", "BLOCKED", site.blocker, "All public B1-B7 CMS coordinates inspectable.", "BLOCKED", "Restore authorized read-only endpoint access.", "Rerun the audit."),
      );
      continue;
    }
    if (matrix[siteKey].frontPage === "MISSING_CONFIGURATION") {
      findings.push(
        finding(siteName, "frontPage", "MISSING_CONFIGURATION", `showOnFront=${site.homepage.showOnFront}; pageOnFront=${site.homepage.pageOnFront}; page(id: \"/\", idType: URI)=null`, "A published Branch homepage assigned as the static front page and resolving at URI /.", "CMS_ADMIN_ACTION", "Create/select the approved branch homepage and assign it in Reading Settings after editorial approval.", "Re-query readingSettings and page(id: \"/\", idType: URI)."),
      );
    } else {
      findings.push(
        finding(siteName, "frontPage", "MISSING_CONTENT", `Page ${site.homepage.databaseId} resolves at / with variant=${site.homepage.variant}; all accepted Group hero fields are empty.`, "The configured Group front page contains approved structured Group homepage content.", "EDITORIAL_ACTION", "Supply and approve the Group structured homepage content without changing the canonical / lookup.", "Re-query the accepted SiraHomepage operation and verify populated Group fields."),
      );
    }
    for (const [area, key] of [["primaryMenu", "primary"], ["footerMenu", "footer"], ["legalMenu", "legal"]]) {
      findings.push(
        finding(siteName, area, "MISSING_CONFIGURATION", `Native ${key.toUpperCase()} menu assignment count=${site.menus[key].assignedCount}.`, `Exactly one usable native ${key.toUpperCase()} menu assignment.`, "CMS_ADMIN_ACTION", `Create/approve and assign the ${key.toUpperCase()} menu using native WordPress menu locations.`, `Re-query the accepted SiraNavigation operation and validate hierarchy/URLs.`),
      );
    }
    if (matrix[siteKey].businessUnit === "MISSING_CONFIGURATION") {
      findings.push(
        finding(siteName, "businessUnit", "MISSING_CONFIGURATION", `Expected slug=${site.businessUnit.expectedSlug}; term lookup=null; available term count=${site.businessUnit.availableTerms.length}.`, `A canonical Business Unit term with slug ${site.businessUnit.expectedSlug}.`, "CMS_ADMIN_ACTION", "Create the exact approved term and assign only relevant editorial content; do not derive or rename slugs mechanically.", "Re-query siraBusinessUnit by SLUG and its filtered contentNodes connection."),
      );
    }
    if (matrix[siteKey].editorial === "OWNER_DECISION") {
      const filteredEvidence = site.editorial.branchFiltered
        ? `filtered accepted-family count=${site.editorial.branchFiltered.returnedCount}`
        : "filtered connection unavailable because the exact Business Unit term is missing";
      findings.push(
        finding(siteName, "editorial", "OWNER_DECISION", `Published accepted-family root count=${site.editorial.root.returnedCount}; ${filteredEvidence}.`, "An owner-confirmed intentional empty state or an approved editorial publishing plan.", "OWNER_DECISION", "Decide whether this branch intentionally launches with an empty editorial feed; if not, assign editorial creation to an editor after the Business Unit term exists.", "After the exact term exists, re-query root and branch-filtered accepted editorial connections."),
      );
    }
    if (matrix[siteKey].projects === "OWNER_DECISION") {
      findings.push(
        finding(siteName, "projects", "OWNER_DECISION", `Published project count=${site.projects.returnedPublishedCount}.`, "An owner-confirmed intentional empty archive or an approved project publishing plan.", "OWNER_DECISION", "Decide whether this branch requires launch projects; if yes, commission public project records rather than adding frontend fallbacks.", "Re-query siraProjects and native project-single URIs."),
      );
    } else {
      findings.push(
        finding(siteName, "projects", "EDITORIAL_ACTION", `${site.projects.returnedPublishedCount} published projects; ${site.projects.missingFeaturedImageCount} missing featured images; ${site.projects.missingSubtitleCount} missing subtitles.`, "Every launch-ready project card has approved archive presentation fields.", "EDITORIAL_ACTION", "Supply approved featured images/alt text and project subtitles for the three published projects.", "Re-query siraProjects and verify zero required archive-field gaps."),
      );
    }
    if (matrix[siteKey].brand === "DATA_CORRECTION_REQUIRED") {
      const expected = siteKey === "group"
        ? "SIRA GROUP; primary #cca34b; secondary #172232; accent #cca34b; paper #f7f4ed; ink #20242b."
        : "SIRA Healthcare; primary #2c6dad; secondary #12283f; accent #2c6dad; paper #f3f7fb; ink #1f2932.";
      findings.push(
        finding(siteName, "brand", "DATA_CORRECTION_REQUIRED", `Live name=${site.brand.name}; colors=${JSON.stringify(site.brand.colors)}.`, expected, "CMS_ADMIN_ACTION", "Correct the canonical public brand fields in WordPress using the approved repository identity evidence; do not normalize these values in Next.js.", "Re-query siraBrand and compare exact effective values."),
      );
    }
    if (matrix[siteKey].media === "EDITORIAL_ACTION") {
      const evidence = siteKey === "group"
        ? `Brand logo alt missing=${site.brand.logo.populated && !site.brand.logo.hasAltText}; brand mark populated=${site.brand.mark.populated}; project featured images missing=${site.projects.missingFeaturedImageCount}.`
        : `Brand mark alt missing=${site.brand.mark.populated && !site.brand.mark.hasAltText}.`;
      findings.push(
        finding(siteName, "media", "EDITORIAL_ACTION", evidence, "Public required media has useful alt text, safe URLs, and usable dimensions; launch project cards have approved images where required.", "EDITORIAL_ACTION", "Supply meaningful accessibility text and required project imagery without fabricating assets.", "Re-query public media metadata and verify alt/dimensions/source readiness."),
      );
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

async function main() {
  const envPath = resolve(process.argv[2] ?? ".env.local");
  const outputPath = resolve(process.argv[3] ?? "../artifacts/step-2c3d/content-readiness-live.json");
  const auditedAt = new Date().toISOString();
  const envText = await readFile(envPath, "utf8");
  const environment = Object.fromEntries(
    envText.split(/\r?\n/u).flatMap((line) => {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/u.exec(line);
      return match ? [[match[1], match[2]]] : [];
    }),
  );
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

  const readinessMatrix = Object.fromEntries(
    Object.entries(sites).map(([siteKey, site]) => [siteKey, classifySite(siteKey, site)]),
  );
  const findings = buildFindings(sites, readinessMatrix);
  const classificationCounts = Object.fromEntries(
    READINESS_CLASSIFICATIONS.map((classification) => [classification, 0]),
  );
  for (const row of Object.values(readinessMatrix)) {
    for (const classification of Object.values(row)) {
      classificationCounts[classification] = (classificationCounts[classification] ?? 0) + 1;
    }
  }

  const output = {
    schemaVersion: 1,
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

  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
}

await main();

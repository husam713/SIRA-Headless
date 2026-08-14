import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import {
  applyLaunchAuthority,
  buildFindings,
  classifyContentAuthority,
  classifySite,
  runContentReadinessAudit,
} from "./content-readiness-audit.mjs";

const SITE_CONFIG = Object.freeze({
  group: Object.freeze({ name: "Group", endpointKey: "SIRA_WP_GROUP_GRAPHQL_URL" }),
  consulting: Object.freeze({ name: "Consulting", endpointKey: "SIRA_WP_CONSULTING_GRAPHQL_URL" }),
  healthcare: Object.freeze({ name: "Healthcare", endpointKey: "SIRA_WP_HEALTHCARE_GRAPHQL_URL" }),
  lifestyle: Object.freeze({ name: "Lifestyle", endpointKey: "SIRA_WP_LIFESTYLE_GRAPHQL_URL" }),
  realestate: Object.freeze({ name: "Real Estate", endpointKey: "SIRA_WP_REALESTATE_GRAPHQL_URL" }),
});

const CONTENT_AUTHORITY_VOCABULARY = Object.freeze([
  "APPROVED_LAUNCH_CONTENT",
  "UNAPPROVED_EXISTING_CONTENT",
  "NO_CONTENT",
  "NOT_APPLICABLE",
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

export const HOMEPAGE_DETAIL_QUERY = String.raw`
  query SiraCmsPreflightHomepage {
    frontPage: page(id: "/", idType: URI, asPreview: false) {
      databaseId
      siraHomepage {
        variant
        groupHomepage {
          hero {
            headingBefore headingHighlight headingAfter description
            primaryCta { title url target }
            secondaryCta { title url target }
            slides {
              eyebrowOverride titleOverride descriptionOverride locationOverride imageAltOverride
              imageOverride { node { databaseId sourceUrl altText isRestricted mediaDetails { width height } } }
              mobileImageOverride { node { databaseId sourceUrl altText isRestricted mediaDetails { width height } } }
              relatedCompany { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } }
              relatedProject { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } }
              businessUnit { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } }
            }
          }
          ticker { enabled items { label link { title url target } businessUnit { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } } }
          latestUpdates { eyebrow heading description sourceMode itemLimit link { title url target } selectedItems { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } }
          companies { eyebrow heading description link { title url target } selectedCompanies { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } }
          about { eyebrow heading description body link { title url target } metrics { value label supportingText } }
          investor { eyebrow heading description body formHeading formDescription link { title url target } metrics { value label supportingText } selectedInvestments { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } onePagerDocument { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } }
          services { eyebrow heading description link { title url target } selectedServices { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } }
          projects { eyebrow heading description link { title url target } selectedProjects { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } }
          insights { eyebrow heading description sourceMode itemLimit link { title url target } selectedItems { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } }
          testimonials { eyebrow heading description link { title url target } selectedTestimonials { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } }
          partners { eyebrow heading description link { title url target } selectedPartners { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } }
          contact { eyebrow heading description formVariant formContext }
        }
        branchHomepage {
          hero { eyebrow headingBefore headingHighlight headingAfter description region imageAlt primaryCta { title url target } secondaryCta { title url target } image { node { databaseId sourceUrl altText isRestricted mediaDetails { width height } } } mobileImage { node { databaseId sourceUrl altText isRestricted mediaDetails { width height } } } }
          statistics { value label supportingText }
          overview { eyebrow heading description body link { title url target } }
          focusAreas { title description }
          projects { eyebrow heading description link { title url target } selectedProjects { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } }
          insights { eyebrow heading description sourceMode itemLimit link { title url target } selectedItems { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } }
          contact { eyebrow heading description formVariant formContext }
          footer { taglineOverride groupLinkLabelOverride }
        }
      }
    }
  }
`;

export const GROUP_ENTITY_QUERY = String.raw`
  query SiraCmsPreflightGroupEntities {
    companies: siraCompanies(first: 100) {
      pageInfo { hasNextPage }
      nodes {
        __typename databaseId status isRestricted title uri excerpt
        featuredImage { node { databaseId sourceUrl altText isRestricted mediaDetails { width height } } }
        companyDetails { shortDescriptor operatingStatus externalWebsiteUrl cardImageOverride { node { databaseId sourceUrl altText isRestricted mediaDetails { width height } } } }
      }
    }
    services(first: 100) {
      pageInfo { hasNextPage }
      nodes {
        __typename databaseId status isRestricted title uri content
        featuredImage { node { databaseId sourceUrl altText isRestricted mediaDetails { width height } } }
        serviceItem { impact advisoryServices { advisoryList } photos(first: 50) { pageInfo { hasNextPage } nodes { databaseId sourceUrl altText isRestricted mediaDetails { width height } } } serviceDetails { mainHeader serviceDescription list { listItem } } }
      }
    }
    investments: siraInvestments(first: 100) {
      pageInfo { hasNextPage }
      nodes {
        __typename databaseId status isRestricted title uri excerpt
        featuredImage { node { databaseId sourceUrl altText isRestricted mediaDetails { width height } } }
        investmentDetails { publicDisplay ticketSizeLabel onePagerDocument { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } relatedCompany { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } relatedProject { pageInfo { hasNextPage } nodes { __typename ... on DatabaseIdentifier { databaseId } } } }
      }
    }
    testimonials: siraTestimonials(first: 100) {
      pageInfo { hasNextPage }
      nodes { __typename databaseId status isRestricted title uri content testimonialDetails { consentApproved role organization sourceUrl } }
    }
    partners: siraPartners(first: 100) {
      pageInfo { hasNextPage }
      nodes { __typename databaseId status isRestricted title uri featuredImage { node { databaseId sourceUrl altText isRestricted mediaDetails { width height } } } partnerDetails { websiteUrl relationshipLabel logoAltOverride } }
    }
    documents: siraDocuments(first: 100) {
      pageInfo { hasNextPage }
      nodes { __typename databaseId status isRestricted title uri excerpt featuredImage { node { databaseId sourceUrl altText isRestricted mediaDetails { width height } } } documentDetails { publicationDate version } }
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
    return ["http:", "https:"].includes(parsed.protocol) && parsed.username === "" && parsed.password === "";
  } catch {
    return false;
  }
}

function textFields(source, names) {
  return Object.fromEntries(names.map((name) => [name, isNonEmpty(source?.[name])]));
}

function linkSummary(link) {
  if (!link) return { populated: false };
  return {
    populated: true,
    labelPresent: isNonEmpty(link.title),
    urlSafe: isSafeUrl(link.url),
    target: link.target ?? null,
  };
}

function mediaSummary(edgeOrNode) {
  const node = edgeOrNode?.node ?? edgeOrNode;
  if (!node) return { populated: false };
  return {
    populated: true,
    databaseId: node.databaseId,
    sourceUrlSafe: isSafeUrl(node.sourceUrl),
    altTextPresent: isNonEmpty(node.altText),
    width: node.mediaDetails?.width ?? null,
    height: node.mediaDetails?.height ?? null,
    restricted: node.isRestricted === true,
  };
}

function connectionSummary(connection) {
  const nodes = connection?.nodes ?? [];
  return {
    returnedCount: nodes.length,
    truncated: connection?.pageInfo?.hasNextPage === true,
    records: nodes.map((node) => ({
      typename: node.__typename,
      databaseId: node.databaseId,
    })),
  };
}

function repeaterSummary(rows, fields) {
  const values = rows ?? [];
  return {
    rowCount: values.length,
    completeRowCount: values.filter((row) => fields.every((field) => isNonEmpty(row?.[field]))).length,
    fields,
  };
}

function groupHomepageSummary(group) {
  if (!group) return { present: false };
  const heroSlides = group.hero?.slides ?? [];
  const tickerItems = group.ticker?.items ?? [];
  return {
    present: true,
    hero: {
      present: group.hero !== null,
      fields: textFields(group.hero, ["headingBefore", "headingHighlight", "headingAfter", "description"]),
      primaryCta: linkSummary(group.hero?.primaryCta),
      secondaryCta: linkSummary(group.hero?.secondaryCta),
      slideCount: heroSlides.length,
      slides: heroSlides.map((slide) => ({
        fields: textFields(slide, ["eyebrowOverride", "titleOverride", "descriptionOverride", "locationOverride", "imageAltOverride"]),
        image: mediaSummary(slide.imageOverride),
        mobileImage: mediaSummary(slide.mobileImageOverride),
        relatedCompany: connectionSummary(slide.relatedCompany),
        relatedProject: connectionSummary(slide.relatedProject),
        businessUnit: connectionSummary(slide.businessUnit),
      })),
    },
    ticker: {
      present: group.ticker !== null,
      enabled: group.ticker?.enabled ?? null,
      itemCount: tickerItems.length,
      completeLabelCount: tickerItems.filter((item) => isNonEmpty(item.label)).length,
      safeLinkCount: tickerItems.filter((item) => !item.link || linkSummary(item.link).urlSafe).length,
    },
    latestUpdates: sectionSummary(group.latestUpdates, "selectedItems", ["eyebrow", "heading", "description", "sourceMode"]),
    companies: sectionSummary(group.companies, "selectedCompanies", ["eyebrow", "heading", "description"]),
    about: {
      ...sectionSummary(group.about, null, ["eyebrow", "heading", "description", "body"]),
      metrics: repeaterSummary(group.about?.metrics, ["value", "label"]),
    },
    investor: {
      ...sectionSummary(group.investor, "selectedInvestments", ["eyebrow", "heading", "description", "body", "formHeading", "formDescription"]),
      metrics: repeaterSummary(group.investor?.metrics, ["value", "label"]),
      onePagerDocument: connectionSummary(group.investor?.onePagerDocument),
    },
    services: sectionSummary(group.services, "selectedServices", ["eyebrow", "heading", "description"]),
    projects: sectionSummary(group.projects, "selectedProjects", ["eyebrow", "heading", "description"]),
    insights: sectionSummary(group.insights, "selectedItems", ["eyebrow", "heading", "description", "sourceMode"]),
    testimonials: sectionSummary(group.testimonials, "selectedTestimonials", ["eyebrow", "heading", "description"]),
    partners: sectionSummary(group.partners, "selectedPartners", ["eyebrow", "heading", "description"]),
    contact: sectionSummary(group.contact, null, ["eyebrow", "heading", "description", "formVariant", "formContext"]),
  };
}

function sectionSummary(section, connectionField, fields) {
  if (!section) return { present: false };
  return {
    present: true,
    fields: textFields(section, fields),
    link: Object.hasOwn(section, "link") ? linkSummary(section.link) : undefined,
    selection: connectionField ? connectionSummary(section[connectionField]) : undefined,
    itemLimit: Object.hasOwn(section, "itemLimit") ? section.itemLimit ?? null : undefined,
  };
}

function branchHomepageSummary(branch) {
  if (!branch) return { present: false };
  return {
    present: true,
    hero: {
      present: branch.hero !== null,
      fields: textFields(branch.hero, ["eyebrow", "headingBefore", "headingHighlight", "headingAfter", "description", "region", "imageAlt"]),
      image: mediaSummary(branch.hero?.image),
      mobileImage: mediaSummary(branch.hero?.mobileImage),
      primaryCta: linkSummary(branch.hero?.primaryCta),
      secondaryCta: linkSummary(branch.hero?.secondaryCta),
    },
    statistics: repeaterSummary(branch.statistics, ["value", "label"]),
    overview: sectionSummary(branch.overview, null, ["eyebrow", "heading", "description", "body"]),
    focusAreas: repeaterSummary(branch.focusAreas, ["title", "description"]),
    projects: sectionSummary(branch.projects, "selectedProjects", ["eyebrow", "heading", "description"]),
    insights: sectionSummary(branch.insights, "selectedItems", ["eyebrow", "heading", "description", "sourceMode"]),
    contact: sectionSummary(branch.contact, null, ["eyebrow", "heading", "description", "formVariant", "formContext"]),
    footer: {
      present: branch.footer !== null,
      fields: textFields(branch.footer, ["taglineOverride", "groupLinkLabelOverride"]),
    },
  };
}

function homepageDetailSummary(data) {
  const page = data?.frontPage;
  return {
    rootPagePresent: page !== null,
    databaseId: page?.databaseId ?? null,
    variant: page?.siraHomepage?.variant ?? null,
    groupHomepage: groupHomepageSummary(page?.siraHomepage?.groupHomepage),
    branchHomepage: branchHomepageSummary(page?.siraHomepage?.branchHomepage),
  };
}

function baseRecord(node) {
  return {
    databaseId: node.databaseId,
    typename: node.__typename,
    publicationStatus: node.status ?? null,
    restricted: node.isRestricted === true,
    titlePresent: isNonEmpty(node.title),
    uriSafe: isSafeUrl(node.uri),
  };
}

function inventorySummary(connection, mapper) {
  const nodes = connection?.nodes ?? [];
  return {
    evidenceClassification: "CONFIRMED",
    contentAuthority: nodes.length > 0 ? "UNAPPROVED_EXISTING_CONTENT" : "NO_CONTENT",
    returnedPublishedCount: nodes.length,
    truncated: connection?.pageInfo?.hasNextPage === true,
    records: nodes.map(mapper),
  };
}

function groupEntitySummary(data) {
  return {
    companies: inventorySummary(data.companies, (node) => ({
      ...baseRecord(node),
      excerptPresent: isNonEmpty(node.excerpt),
      featuredImage: mediaSummary(node.featuredImage),
      details: {
        shortDescriptorPresent: isNonEmpty(node.companyDetails?.shortDescriptor),
        operatingStatusPresent: isNonEmpty(node.companyDetails?.operatingStatus),
        externalWebsiteSafe: node.companyDetails?.externalWebsiteUrl ? isSafeUrl(node.companyDetails.externalWebsiteUrl) : null,
        cardImageOverride: mediaSummary(node.companyDetails?.cardImageOverride),
      },
    })),
    services: inventorySummary(data.services, (node) => ({
      ...baseRecord(node),
      contentPresent: isNonEmpty(node.content),
      featuredImage: mediaSummary(node.featuredImage),
      serviceItem: {
        impactPresent: isNonEmpty(node.serviceItem?.impact),
        advisoryRowCount: node.serviceItem?.advisoryServices?.length ?? 0,
        photoCount: node.serviceItem?.photos?.nodes?.length ?? 0,
        photosTruncated: node.serviceItem?.photos?.pageInfo?.hasNextPage === true,
        serviceDetailRowCount: node.serviceItem?.serviceDetails?.length ?? 0,
        completeServiceDetailRowCount: (node.serviceItem?.serviceDetails ?? []).filter(
          (row) => isNonEmpty(row.mainHeader) && isNonEmpty(row.serviceDescription),
        ).length,
      },
    })),
    investments: inventorySummary(data.investments, (node) => ({
      ...baseRecord(node),
      excerptPresent: isNonEmpty(node.excerpt),
      featuredImage: mediaSummary(node.featuredImage),
      publicDisplay: node.investmentDetails?.publicDisplay ?? null,
      ticketSizeLabelPresent: isNonEmpty(node.investmentDetails?.ticketSizeLabel),
      onePagerDocument: connectionSummary(node.investmentDetails?.onePagerDocument),
      relatedCompany: connectionSummary(node.investmentDetails?.relatedCompany),
      relatedProject: connectionSummary(node.investmentDetails?.relatedProject),
    })),
    testimonials: inventorySummary(data.testimonials, (node) => ({
      ...baseRecord(node),
      contentPresent: isNonEmpty(node.content),
      consentApproved: node.testimonialDetails?.consentApproved ?? null,
      rolePresent: isNonEmpty(node.testimonialDetails?.role),
      organizationPresent: isNonEmpty(node.testimonialDetails?.organization),
      sourceUrlSafe: node.testimonialDetails?.sourceUrl ? isSafeUrl(node.testimonialDetails.sourceUrl) : null,
    })),
    partners: inventorySummary(data.partners, (node) => ({
      ...baseRecord(node),
      featuredImage: mediaSummary(node.featuredImage),
      websiteUrlSafe: node.partnerDetails?.websiteUrl ? isSafeUrl(node.partnerDetails.websiteUrl) : null,
      relationshipLabelPresent: isNonEmpty(node.partnerDetails?.relationshipLabel),
      logoAltOverridePresent: isNonEmpty(node.partnerDetails?.logoAltOverride),
    })),
    documents: inventorySummary(data.documents, (node) => ({
      ...baseRecord(node),
      excerptPresent: isNonEmpty(node.excerpt),
      featuredImage: mediaSummary(node.featuredImage),
      publicationDatePresent: isNonEmpty(node.documentDetails?.publicationDate),
      versionPresent: isNonEmpty(node.documentDetails?.version),
      publicDeliveryPolicy: "UNKNOWN",
    })),
  };
}

async function executeReadOnly(endpoint, query, maximumAttempts = 5) {
  if (/\bmutation\b/iu.test(query)) throw new Error("MUTATION_DOCUMENT_REJECTED");
  let lastError;
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!response.ok) throw new Error(`HTTP_${response.status}`);
      const payload = await response.json();
      if (payload.errors?.length) {
        throw new Error(`GRAPHQL_${payload.errors.map((error) => error.extensions?.code ?? "ERROR").join("_")}`);
      }
      return payload.data;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

async function runBaseAuditWithRetries(environment, auditedAt, maximumAttempts = 5) {
  let latest;
  const confirmedSites = {};
  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    latest = await runContentReadinessAudit(environment, auditedAt);
    for (const [siteKey, site] of Object.entries(latest.sites)) {
      if (site.inspected === true) confirmedSites[siteKey] = site;
    }
    if (Object.keys(confirmedSites).length === Object.keys(SITE_CONFIG).length) break;
  }
  const sites = Object.fromEntries(Object.keys(SITE_CONFIG).map((siteKey) => [
    siteKey,
    confirmedSites[siteKey] ?? latest.sites[siteKey],
  ]));
  const technicalReadinessMatrix = Object.fromEntries(
    Object.entries(sites).map(([siteKey, site]) => [siteKey, classifySite(siteKey, site)]),
  );
  const contentAuthorityMatrix = Object.fromEntries(
    Object.entries(sites).map(([siteKey, site]) => [siteKey, classifyContentAuthority(siteKey, site)]),
  );
  const readinessMatrix = Object.fromEntries(
    Object.entries(technicalReadinessMatrix).map(([siteKey, matrix]) => [
      siteKey,
      applyLaunchAuthority(matrix, contentAuthorityMatrix[siteKey]),
    ]),
  );
  const classificationCounts = Object.fromEntries(
    READINESS_CLASSIFICATIONS.map((classification) => [classification, 0]),
  );
  for (const row of Object.values(readinessMatrix)) {
    for (const classification of Object.values(row)) {
      classificationCounts[classification] += 1;
    }
  }
  return {
    ...latest,
    sites,
    technicalReadinessMatrix,
    contentAuthority: { ...latest.contentAuthority, matrix: contentAuthorityMatrix },
    readinessMatrix,
    classificationCounts,
    findings: buildFindings(sites, readinessMatrix, technicalReadinessMatrix, contentAuthorityMatrix),
  };
}

function parseEnvironment(source) {
  return Object.fromEntries(
    source.split(/\r?\n/u).flatMap((line) => {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/u.exec(line);
      return match ? [[match[1], match[2]]] : [];
    }),
  );
}

async function readStandardInput() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

const BRANCH_KEYS = Object.freeze(["consulting", "healthcare", "lifestyle", "realestate"]);
const MENU_SCOPES = Object.freeze(["primary", "footer", "legal"]);

function sameEvidence(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function classifyActionEvidence({
  evidenceAvailable,
  observedState,
  acceptedCurrentState,
  acceptedExpectedState,
  blockedBySot001 = false,
}) {
  if (blockedBySot001) {
    return { evidenceStatus: "BLOCKED_BY_SOT_001", evidenceClassification: "CONFIRMED" };
  }
  if (!evidenceAvailable) {
    return { evidenceStatus: "EVIDENCE_UNKNOWN", evidenceClassification: "UNKNOWN" };
  }
  if (sameEvidence(observedState, acceptedExpectedState)) {
    return { evidenceStatus: "CHANGED_AS_EXPECTED", evidenceClassification: "CONFIRMED" };
  }
  if (sameEvidence(observedState, acceptedCurrentState)) {
    return { evidenceStatus: "VALIDATED_UNCHANGED", evidenceClassification: "CONFIRMED" };
  }
  return { evidenceStatus: "DRIFT_DETECTED", evidenceClassification: "CONFIRMED" };
}

export function classifyDrift({ requiredEvidenceAvailable, comparisonsMatch }) {
  if (!requiredEvidenceAvailable) {
    return { status: "EVIDENCE_BLOCKED", evidenceClassification: "UNKNOWN" };
  }
  if (comparisonsMatch) {
    return { status: "NONE_DETECTED", evidenceClassification: "CONFIRMED" };
  }
  return { status: "DRIFT_DETECTED", evidenceClassification: "CONFIRMED" };
}

export function derivePreflightStatus({
  tenantsInspected,
  requiredTenantCount,
  detailedTenantEvidenceAvailable,
  groupInventoryAvailable,
  actionEvidenceAvailable,
}) {
  return tenantsInspected === requiredTenantCount
    && detailedTenantEvidenceAvailable
    && groupInventoryAvailable
    && actionEvidenceAvailable
    ? "READY_FOR_INDEPENDENT_REVIEW"
    : "BLOCKED";
}

function brandActionStates(action, site) {
  const keys = Object.keys(action.currentEvidence ?? {});
  const observedState = Object.fromEntries(keys.map((key) => [
    key,
    key === "name" ? site?.brand?.name : site?.brand?.colors?.[key],
  ]));
  return {
    evidenceAvailable: site?.inspected === true && keys.every((key) => observedState[key] !== undefined),
    observedState,
    acceptedCurrentState: action.currentEvidence,
    acceptedExpectedState: Object.fromEntries(keys.map((key) => [key, action.expected?.[key]])),
  };
}

function allTrue(values) {
  return values.every((value) => value === true);
}

function actionEvidenceStates(action, { base, sites, groupEntities }) {
  const group = base.sites.group;
  const healthcare = base.sites.healthcare;
  const branchSites = BRANCH_KEYS.map((siteKey) => base.sites[siteKey]);
  const actionId = action.id;

  if (actionId === "CMS-2C4-001") return brandActionStates(action, group);
  if (actionId === "CMS-2C4-002") return brandActionStates(action, healthcare);

  if (actionId === "CMS-2C4-003") {
    const heroFields = sites.group?.structuredHomepage?.groupHomepage?.hero?.fields;
    const observedState = {
      variant: group?.homepage?.variant ?? null,
      approvedHeroContentPresent: heroFields ? allTrue(Object.values(heroFields)) : null,
    };
    return {
      evidenceAvailable: sites.group?.inspected === true && heroFields !== undefined,
      observedState,
      acceptedCurrentState: { variant: "group", approvedHeroContentPresent: false },
      acceptedExpectedState: { variant: "group", approvedHeroContentPresent: true },
    };
  }

  if (actionId === "CMS-2C4-004") {
    const configuredTenants = BRANCH_KEYS.filter((siteKey) => {
      const current = base.sites[siteKey];
      const detailed = sites[siteKey]?.structuredHomepage;
      return current?.homepage?.showOnFront === "page"
        && current.homepage.pageOnFront > 0
        && current.homepage.resolvesRootUri === true
        && detailed?.variant === "branch";
    });
    return {
      evidenceAvailable: BRANCH_KEYS.every((siteKey) => sites[siteKey]?.inspected === true),
      observedState: configuredTenants,
      acceptedCurrentState: [],
      acceptedExpectedState: [...BRANCH_KEYS],
    };
  }

  if (actionId === "CMS-2C4-005") {
    const assignedLocations = Object.keys(SITE_CONFIG).flatMap((siteKey) => MENU_SCOPES.flatMap((scope) => (
      base.sites[siteKey]?.menus?.[scope]?.assignedCount === 1 ? [`${siteKey}:${scope}`] : []
    )));
    const expectedLocations = Object.keys(SITE_CONFIG).flatMap((siteKey) => (
      MENU_SCOPES.map((scope) => `${siteKey}:${scope}`)
    ));
    return {
      evidenceAvailable: Object.keys(SITE_CONFIG).every((siteKey) => base.sites[siteKey]?.inspected === true),
      observedState: assignedLocations,
      acceptedCurrentState: [],
      acceptedExpectedState: expectedLocations,
    };
  }

  if (actionId === "CMS-2C4-006") {
    const exactTerms = BRANCH_KEYS.filter((siteKey) => {
      const unit = base.sites[siteKey]?.businessUnit;
      return unit?.term?.slug === unit?.expectedSlug && unit?.availableTermsTruncated === false;
    });
    return {
      evidenceAvailable: branchSites.every((site) => site?.inspected === true),
      observedState: exactTerms,
      acceptedCurrentState: [],
      acceptedExpectedState: [...BRANCH_KEYS],
    };
  }

  if (actionId === "CMS-2C4-007") {
    const observedState = {
      returnedCount: group?.editorial?.root?.returnedCount ?? null,
      contentAuthority: base.contentAuthority.matrix.group.editorial,
    };
    return {
      evidenceAvailable: group?.inspected === true,
      observedState,
      acceptedCurrentState: { returnedCount: 4, contentAuthority: "UNAPPROVED_EXISTING_CONTENT" },
      acceptedExpectedState: { returnedCount: 4, contentAuthority: "APPROVED_LAUNCH_CONTENT" },
    };
  }

  if (actionId === "CMS-2C4-008") {
    const observedState = {
      returnedCount: group?.projects?.returnedPublishedCount ?? null,
      contentAuthority: base.contentAuthority.matrix.group.projects,
      missingFeaturedImageCount: group?.projects?.missingFeaturedImageCount ?? null,
      missingSubtitleCount: group?.projects?.missingSubtitleCount ?? null,
    };
    return {
      evidenceAvailable: group?.inspected === true,
      observedState,
      acceptedCurrentState: {
        returnedCount: 3,
        contentAuthority: "UNAPPROVED_EXISTING_CONTENT",
        missingFeaturedImageCount: 3,
        missingSubtitleCount: 3,
      },
      acceptedExpectedState: {
        returnedCount: 3,
        contentAuthority: "APPROVED_LAUNCH_CONTENT",
        missingFeaturedImageCount: 0,
        missingSubtitleCount: 0,
      },
    };
  }

  if (actionId === "CMS-2C4-009") {
    const observedState = {
      editorialTenants: BRANCH_KEYS.filter((siteKey) => base.sites[siteKey]?.editorial?.root?.returnedCount > 0),
      projectTenants: BRANCH_KEYS.filter((siteKey) => base.sites[siteKey]?.projects?.returnedPublishedCount > 0),
    };
    return {
      evidenceAvailable: branchSites.every((site) => site?.inspected === true),
      observedState,
      acceptedCurrentState: { editorialTenants: [], projectTenants: [] },
      acceptedExpectedState: { editorialTenants: [...BRANCH_KEYS], projectTenants: [...BRANCH_KEYS] },
    };
  }

  if (actionId === "CMS-2C4-010") {
    const inventories = groupEntities?.inventories;
    const observedState = inventories ? {
      companiesPresent: inventories.companies.returnedPublishedCount > 0,
      servicesPresent: inventories.services.returnedPublishedCount > 0,
      investmentsPresent: inventories.investments.returnedPublishedCount > 0,
      testimonialsPresent: inventories.testimonials.returnedPublishedCount > 0,
      partnersPresent: inventories.partners.returnedPublishedCount > 0,
      documentsPresent: inventories.documents.returnedPublishedCount > 0,
      authoritativeFamilies: Object.entries(inventories)
        .filter(([, inventory]) => inventory.contentAuthority === "APPROVED_LAUNCH_CONTENT")
        .map(([family]) => family),
    } : null;
    const acceptedCurrentState = {
      companiesPresent: true,
      servicesPresent: true,
      investmentsPresent: false,
      testimonialsPresent: false,
      partnersPresent: false,
      documentsPresent: false,
      authoritativeFamilies: [],
    };
    const acceptedExpectedState = {
      companiesPresent: true,
      servicesPresent: true,
      investmentsPresent: true,
      testimonialsPresent: true,
      partnersPresent: true,
      documentsPresent: true,
      authoritativeFamilies: ["companies", "services", "investments", "testimonials", "partners", "documents"],
    };
    return {
      evidenceAvailable: groupEntities?.currentEvidenceClassification === "CONFIRMED" && inventories !== undefined,
      observedState,
      acceptedCurrentState,
      acceptedExpectedState,
    };
  }

  if (actionId === "CMS-2C4-011") {
    const observedState = {
      groupLogoHasAlt: group?.brand?.logo?.hasAltText ?? null,
      healthcareMarkHasAlt: healthcare?.brand?.mark?.hasAltText ?? null,
    };
    return {
      evidenceAvailable: group?.inspected === true && healthcare?.inspected === true,
      observedState,
      acceptedCurrentState: { groupLogoHasAlt: false, healthcareMarkHasAlt: false },
      acceptedExpectedState: { groupLogoHasAlt: true, healthcareMarkHasAlt: true },
    };
  }

  if (actionId === "CMS-2C4-012") {
    const observedState = {
      technicallyActive: healthcare?.brand?.announcement?.schedule === "active",
      contentAuthority: base.contentAuthority.matrix.healthcare.announcement,
    };
    return {
      evidenceAvailable: healthcare?.inspected === true,
      observedState,
      acceptedCurrentState: { technicallyActive: true, contentAuthority: "UNAPPROVED_EXISTING_CONTENT" },
      acceptedExpectedState: { technicallyActive: true, contentAuthority: "APPROVED_LAUNCH_CONTENT" },
    };
  }

  const observedState = {
    classification: action.classification,
    mutationAuthorized: action.mutationAuthorized,
  };
  return {
    evidenceAvailable: action.classification === "DEFERRED" && action.mutationAuthorized === false,
    observedState,
    acceptedCurrentState: { classification: "DEFERRED", mutationAuthorized: false },
    acceptedExpectedState: { classification: "RESOLVED", mutationAuthorized: false },
  };
}

function buildActionMapping(manifest, context) {
  return manifest.actions.map((action) => {
    const states = actionEvidenceStates(action, context);
    const result = classifyActionEvidence(states);
    return {
      actionId: action.id,
      acceptedClassification: action.classification,
      owner: action.owner,
      evidenceClassification: result.evidenceClassification,
      evidenceStatus: result.evidenceStatus,
      comparisonBasis: "CURRENT_REQUIRED_EVIDENCE_VS_ACCEPTED_CURRENT_AND_EXPECTED_STATE",
      observedState: states.observedState,
      destructive: false,
      mutationAuthorized: false,
      detailArtifact: "artifacts/step-2c5a/remediation-batches.json",
    };
  });
}

export function reconcileExistingPreflight(existing, manifest, reconciledAt = new Date().toISOString()) {
  const base = {
    sites: Object.fromEntries(Object.entries(existing.sites).map(([siteKey, site]) => [siteKey, site.current])),
    readinessMatrix: existing.readinessMatrix,
    technicalReadinessMatrix: existing.technicalReadinessMatrix,
    contentAuthority: existing.contentAuthority,
  };
  const actionMapping = buildActionMapping(manifest, {
    base,
    sites: existing.sites,
    groupEntities: existing.groupHomepageRelatedEntities,
  });
  const groupInventoryAvailable = existing.groupHomepageRelatedEntities?.currentEvidenceClassification === "CONFIRMED";
  const actionEvidenceAvailable = actionMapping.every((action) => action.evidenceStatus !== "EVIDENCE_UNKNOWN");
  const detailedTenantEvidenceAvailable = Object.values(existing.sites).every((site) => site.inspected === true);
  const requiredEvidenceAvailable = existing.tenantsInspected === Object.keys(SITE_CONFIG).length
    && detailedTenantEvidenceAvailable
    && groupInventoryAvailable
    && actionEvidenceAvailable;
  const comparisonsMatch = existing.drift.readinessMatrixMatches === true
    && existing.drift.technicalReadinessMatrixMatches === true
    && existing.drift.exactPublicSiteSummariesMatch === true;
  const drift = classifyDrift({ requiredEvidenceAvailable, comparisonsMatch });
  return {
    ...existing,
    stage: "Step 2C.5A — CMS Preflight & Remediation Plan",
    status: derivePreflightStatus({
      tenantsInspected: existing.tenantsInspected,
      requiredTenantCount: Object.keys(SITE_CONFIG).length,
      detailedTenantEvidenceAvailable,
      groupInventoryAvailable,
      actionEvidenceAvailable,
    }),
    derivationReconciledAt: reconciledAt,
    derivationNote: "Derived classifications were recomputed from the reviewed sanitized evidence; auditedAt remains the live evidence timestamp.",
    drift: {
      ...existing.drift,
      status: drift.status,
      evidenceClassification: drift.evidenceClassification,
      requiredEvidenceAvailable,
    },
    actionMapping,
  };
}

export async function runCmsPreflight({ environment, previous, manifest, auditedAt }) {
  const base = await runBaseAuditWithRetries(environment, auditedAt);
  const sites = {};
  for (const [siteKey, config] of Object.entries(SITE_CONFIG)) {
    const endpoint = environment[config.endpointKey] ?? process.env[config.endpointKey];
    if (!endpoint || base.sites[siteKey]?.inspected !== true) {
      sites[siteKey] = {
        siteName: config.name,
        inspected: false,
        evidenceClassification: "UNKNOWN",
        blocker: endpoint ? base.sites[siteKey]?.blocker ?? "BASE_PREFLIGHT_BLOCKED" : "ENDPOINT_NOT_CONFIGURED",
      };
      continue;
    }
    try {
      const homepageData = await executeReadOnly(endpoint, HOMEPAGE_DETAIL_QUERY);
      const previousMatches = JSON.stringify(base.sites[siteKey]) === JSON.stringify(previous.sites[siteKey]);
      sites[siteKey] = {
        siteName: config.name,
        inspected: true,
        evidenceClassification: "CONFIRMED",
        previousPublicEvidenceMatches: previousMatches,
        current: base.sites[siteKey],
        structuredHomepage: homepageDetailSummary(homepageData),
      };
    } catch (error) {
      sites[siteKey] = {
        siteName: config.name,
        inspected: false,
        evidenceClassification: "UNKNOWN",
        blocker: error instanceof Error ? error.message : "UNKNOWN_HOMEPAGE_PREFLIGHT_ERROR",
      };
    }
  }

  let groupHomepageRelatedEntities;
  const groupEndpoint = environment[SITE_CONFIG.group.endpointKey] ?? process.env[SITE_CONFIG.group.endpointKey];
  try {
    groupHomepageRelatedEntities = {
      priorEvidenceClassification: "UNKNOWN",
      currentEvidenceClassification: "CONFIRMED",
      driftStatus: "NOT_COMPARABLE_NEW_PUBLIC_BASELINE",
      inventories: groupEntitySummary(await executeReadOnly(groupEndpoint, GROUP_ENTITY_QUERY)),
    };
  } catch (error) {
    groupHomepageRelatedEntities = {
      priorEvidenceClassification: "UNKNOWN",
      currentEvidenceClassification: "UNKNOWN",
      driftStatus: "UNKNOWN",
      blocker: error instanceof Error ? error.message : "UNKNOWN_ENTITY_PREFLIGHT_ERROR",
    };
  }

  const inspectedCount = Object.values(sites).filter((site) => site.inspected).length;
  const previousMatrixMatches = JSON.stringify(base.readinessMatrix) === JSON.stringify(previous.readinessMatrix);
  const previousTechnicalMatrixMatches = JSON.stringify(base.technicalReadinessMatrix) === JSON.stringify(previous.technicalReadinessMatrix);
  const allSiteEvidenceMatches = Object.values(sites).every(
    (site) => site.inspected && site.previousPublicEvidenceMatches,
  );
  const groupInventoryAvailable = groupHomepageRelatedEntities.currentEvidenceClassification === "CONFIRMED";
  const actionMapping = buildActionMapping(manifest, {
    base,
    sites,
    groupEntities: groupHomepageRelatedEntities,
  });
  const actionEvidenceAvailable = actionMapping.every((action) => action.evidenceStatus !== "EVIDENCE_UNKNOWN");
  const requiredEvidenceAvailable = inspectedCount === Object.keys(SITE_CONFIG).length
    && Object.values(sites).every((site) => site.inspected)
    && groupInventoryAvailable
    && actionEvidenceAvailable;
  const drift = classifyDrift({
    requiredEvidenceAvailable,
    comparisonsMatch: previousMatrixMatches && previousTechnicalMatrixMatches && allSiteEvidenceMatches,
  });

  return {
    schemaVersion: 1,
    stage: "Step 2C.5A — CMS Preflight & Remediation Plan",
    status: derivePreflightStatus({
      tenantsInspected: inspectedCount,
      requiredTenantCount: Object.keys(SITE_CONFIG).length,
      detailedTenantEvidenceAvailable: Object.values(sites).every((site) => site.inspected),
      groupInventoryAvailable,
      actionEvidenceAvailable,
    }),
    auditedAt,
    baseline: {
      branch: "main",
      commit: "710eec3cf90e1a7d707860f9ee73d0abf283019c",
      latestAcceptedStage: "Step 2C.4",
      pullRequest: 14,
      approvedHead: "a4d8945bf5b83e304b1b0fb434eb7441ea243849",
      mergeCommit: "710eec3cf90e1a7d707860f9ee73d0abf283019c",
      frontendCiRun: 29,
      fullRegression: "24 files / 204 tests PASS",
    },
    mode: "read-only public GraphQL metadata plus repository planning",
    querySource: basename(import.meta.filename),
    tenantKeys: Object.keys(SITE_CONFIG),
    tenantsInspected: inspectedCount,
    previousEvidence: {
      contentReadiness: "artifacts/step-2c3d/content-readiness.json",
      designAudit: "artifacts/step-2c4/design-data-contract-audit.json",
      correctionManifest: "artifacts/step-2c4/cms-correction-manifest.json",
    },
    evidenceVocabulary: ["CONFIRMED", "STRONGLY_INFERRED", "UNKNOWN"],
    contentAuthority: {
      vocabulary: CONTENT_AUTHORITY_VOCABULARY,
      rule: "Published or technically valid records remain unapproved unless explicit launch-authority evidence exists.",
      matrix: base.contentAuthority.matrix,
    },
    drift: {
      status: drift.status,
      evidenceClassification: drift.evidenceClassification,
      requiredEvidenceAvailable,
      comparedTenantCount: inspectedCount,
      comparedReadinessCoordinates: 55,
      readinessMatrixMatches: previousMatrixMatches,
      technicalReadinessMatrixMatches: previousTechnicalMatrixMatches,
      exactPublicSiteSummariesMatch: allSiteEvidenceMatches,
      expandedGroupEntityCoordinates: "NOT_COMPARABLE_NEW_PUBLIC_BASELINE",
    },
    readinessMatrix: base.readinessMatrix,
    technicalReadinessMatrix: base.technicalReadinessMatrix,
    classificationCounts: base.classificationCounts,
    sites,
    groupHomepageRelatedEntities,
    actionMapping,
    acceptedActionCounts: manifest.actionCounts,
    blockers: [
      { id: "CMS_MUTATION_GATE", status: "BLOCKED", evidenceClassification: "CONFIRMED", summary: "No CMS mutation window or action authorization has been granted." },
      { id: "CONTENT_AUTHORITY", status: "BLOCKED", evidenceClassification: "CONFIRMED", summary: "No editorial/project/homepage-related record has explicit authoritative launch approval." },
      { id: "SOT-001", status: "OPEN", evidenceClassification: "CONFIRMED", summary: "Any newly discovered backend/schema correction remains BLOCKED_BY_SOT_001." },
      { id: "ADMIN_PRIVATE_STATE", status: "UNKNOWN", evidenceClassification: "UNKNOWN", summary: "Draft/private totals and WordPress-admin provenance are not exposed by anonymous public GraphQL." },
    ],
    unknowns: [
      "WordPress backend hostname and protected admin origin",
      "GraphQL, media, staging, preview, and revalidation origins beyond configured runtime access",
      "Cookie-domain and CORS policies",
      "Draft/private totals and option-change provenance",
      "Launch authority absent explicit approval records",
      "Actual export/backup existence and storage location",
    ],
    security: {
      queryDocumentsContainMutation: false,
      endpointValuesPersisted: false,
      credentialsPersisted: false,
      authorizationHeadersUsed: false,
      cookiesUsed: false,
      unpublishedBodiesPersisted: false,
      rawPayloadsPersisted: false,
      wordpressMutationOccurred: false,
      contentDeletionOccurred: false,
      backendRuntimeMutationOccurred: false,
      generatedGraphqlMutationOccurred: false,
      productionUiMutationOccurred: false,
      dependencyOrLockfileMutationOccurred: false,
      productionDeploymentOccurred: false,
      productionAuthorized: false,
      sot001Status: "OPEN",
    },
    authorization: {
      cmsMutationAuthorization: "NOT_GRANTED",
      contentDeletionAuthorized: false,
      destructiveCleanupAuthorized: false,
      backendRuntimeMutationAuthorized: false,
      productionUiImplementationAuthorized: false,
      step3Authorized: false,
      deploymentAuthorized: false,
      mergeAuthorized: false,
      nextGate: "OWNER_ACCEPTANCE",
    },
  };
}

async function main() {
  const envPath = resolve(process.argv[2] ?? ".env.local");
  const previousPath = resolve(process.argv[3] ?? "../artifacts/step-2c3d/content-readiness.json");
  const manifestPath = resolve(process.argv[4] ?? "../artifacts/step-2c4/cms-correction-manifest.json");
  const outputPath = resolve(process.argv[5] ?? "../artifacts/step-2c5a/cms-preflight.json");
  const reconcileStandardInput = process.argv.includes("--reconcile-stdin");
  const [environmentSource, previousSource, manifestSource] = await Promise.all([
    reconcileStandardInput ? Promise.resolve("") : readFile(envPath, "utf8"),
    reconcileStandardInput ? readStandardInput() : readFile(previousPath, "utf8"),
    readFile(manifestPath, "utf8"),
  ]);
  const manifest = JSON.parse(manifestSource);
  const output = reconcileStandardInput
    ? reconcileExistingPreflight(JSON.parse(previousSource), manifest)
    : await runCmsPreflight({
      environment: parseEnvironment(environmentSource),
      previous: JSON.parse(previousSource),
      manifest,
      auditedAt: new Date().toISOString(),
    });
  const replaceOutput = process.argv.includes("--replace");
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, {
    encoding: "utf8",
    flag: replaceOutput ? "w" : "wx",
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main();
}

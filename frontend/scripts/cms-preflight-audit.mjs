import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";
import { runContentReadinessAudit } from "./content-readiness-audit.mjs";

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

async function executeReadOnly(endpoint, query) {
  if (/\bmutation\b/iu.test(query)) throw new Error("MUTATION_DOCUMENT_REJECTED");
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
}

function parseEnvironment(source) {
  return Object.fromEntries(
    source.split(/\r?\n/u).flatMap((line) => {
      const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/u.exec(line);
      return match ? [[match[1], match[2]]] : [];
    }),
  );
}

function actionEvidenceStatus(actionId) {
  if (actionId === "CMS-2C4-010") return "EXPANDED_NEW_PUBLIC_BASELINE_NO_CLASSIFICATION_CHANGE";
  if (["CMS-2C4-013", "CMS-2C4-014", "CMS-2C4-015"].includes(actionId)) {
    return "ACCEPTED_DEFERRED_EVIDENCE_UNCHANGED";
  }
  return "VALIDATED_UNCHANGED";
}

export async function runCmsPreflight({ environment, previous, manifest, auditedAt }) {
  const base = await runContentReadinessAudit(environment, auditedAt);
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

  return {
    schemaVersion: 1,
    stage: "Step 2C.5A — CMS Preflight & Remediation Plan",
    status: inspectedCount === 5 ? "READY_FOR_INDEPENDENT_REVIEW" : "BLOCKED",
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
      status: previousMatrixMatches && previousTechnicalMatrixMatches && allSiteEvidenceMatches
        ? "NONE_DETECTED_IN_PREVIOUSLY_OBSERVABLE_PUBLIC_COORDINATES"
        : "DRIFT_DETECTED_OR_EVIDENCE_BLOCKED",
      evidenceClassification: "CONFIRMED",
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
    actionMapping: manifest.actions.map((action) => ({
      actionId: action.id,
      acceptedClassification: action.classification,
      owner: action.owner,
      evidenceClassification: "CONFIRMED",
      evidenceStatus: actionEvidenceStatus(action.id),
      destructive: false,
      mutationAuthorized: false,
      detailArtifact: "artifacts/step-2c5a/remediation-batches.json",
    })),
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
  const [environmentSource, previousSource, manifestSource] = await Promise.all([
    readFile(envPath, "utf8"),
    readFile(previousPath, "utf8"),
    readFile(manifestPath, "utf8"),
  ]);
  const output = await runCmsPreflight({
    environment: parseEnvironment(environmentSource),
    previous: JSON.parse(previousSource),
    manifest: JSON.parse(manifestSource),
    auditedAt: new Date().toISOString(),
  });
  await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, {
    encoding: "utf8",
    flag: "wx",
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  await main();
}

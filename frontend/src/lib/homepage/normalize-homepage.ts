import type {
  BranchHomepage,
  BranchHomepageHero,
  GroupHomepage,
  GroupHomepageHero,
  GroupHomepageHeroSlide,
  HomepageBusinessUnit,
  HomepageContactSection,
  HomepageContentItem,
  HomepageContentKind,
  HomepageContentSection,
  HomepageDiagnostic,
  HomepageDiagnostic as Diagnostic,
  HomepageEditorialSection,
  HomepageFocusArea,
  HomepageHero,
  HomepageInvestorSection,
  HomepageLink,
  HomepageMedia,
  HomepageMetric,
  HomepageMetricsSection,
  HomepageResolution,
  HomepageRichTextSection,
  HomepageSelection,
  HomepageSectionHeader,
  HomepageTicker,
  InvalidHomepageReason,
} from "@/lib/homepage/types";
import type { SiraHomepageQueryData } from "@/queries/homepage";
import type { SiteKey } from "@/types/site";

type RecordValue = Readonly<Record<string, unknown>>;

interface ContentContract {
  readonly kind: HomepageContentKind;
  readonly contentTypeName: string;
}

const CONTENT_CONTRACTS: Readonly<Record<string, ContentContract>> =
  Object.freeze({
    SiraArticle: Object.freeze({ kind: "article", contentTypeName: "sira_article" }),
    SiraCompany: Object.freeze({ kind: "company", contentTypeName: "sira_company" }),
    SiraDocument: Object.freeze({ kind: "document", contentTypeName: "sira_document" }),
    SiraDownload: Object.freeze({ kind: "download", contentTypeName: "sira_download" }),
    SiraInsight: Object.freeze({ kind: "insight", contentTypeName: "sira_insight" }),
    SiraInvestment: Object.freeze({ kind: "investment", contentTypeName: "sira_investment" }),
    SiraNewsItem: Object.freeze({ kind: "news", contentTypeName: "sira_news" }),
    SiraPartner: Object.freeze({ kind: "partner", contentTypeName: "sira_partner" }),
    SiraPressRelease: Object.freeze({
      kind: "press-release",
      contentTypeName: "sira_press_release",
    }),
    SiraProject: Object.freeze({ kind: "project", contentTypeName: "sira_project" }),
    SiraService: Object.freeze({ kind: "service", contentTypeName: "sira_service" }),
    SiraTestimonial: Object.freeze({
      kind: "testimonial",
      contentTypeName: "sira_testimonial",
    }),
    SiraWhitepaper: Object.freeze({
      kind: "whitepaper",
      contentTypeName: "sira_whitepaper",
    }),
  });

const EMPTY_DIAGNOSTICS: readonly HomepageDiagnostic[] = Object.freeze([]);
const EMPTY_ITEMS: readonly [] = Object.freeze([]);

function isRecord(value: unknown): value is RecordValue {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePlainText(value: unknown, maximumLength: number): string | null {
  if (typeof value !== "string") return null;

  const normalized = value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/giu, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]*>/gu, " ")
    .replace(/[<>]/gu, " ")
    .replace(/&nbsp;/giu, " ")
    .replace(/\s+/gu, " ")
    .trim();

  return normalized === "" ? null : normalized.slice(0, maximumLength);
}

function normalizeRichText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized === "" ? null : normalized.slice(0, 20_000);
}

function normalizePublicHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();

  if (
    href === "" ||
    href.startsWith("//") ||
    href.includes("\\") ||
    /[\u0000-\u001f\u007f]/u.test(href)
  ) return null;

  if (href.startsWith("/")) return href;

  try {
    const url = new URL(href);
    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username !== "" ||
      url.password !== ""
    ) return null;
    return url.toString();
  } catch {
    return null;
  }
}

function normalizeDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const date = value.trim();
  return date !== "" && date.length <= 64 && Number.isFinite(Date.parse(date))
    ? date
    : null;
}

function normalizePositiveInteger(value: unknown): number | null {
  return Number.isSafeInteger(value) && Number(value) > 0 ? Number(value) : null;
}

function normalizeLink(value: unknown): HomepageLink | null {
  if (!isRecord(value)) return null;
  const href = normalizePublicHref(value["url"]);
  if (href === null) return null;
  return Object.freeze({
    label: normalizePlainText(value["title"], 240),
    href,
    target: value["target"] === "_blank" ? "_blank" : null,
  });
}

function normalizeMedia(value: unknown): HomepageMedia | null {
  if (!isRecord(value) || !isRecord(value["node"])) return null;
  const node = value["node"];
  const databaseId = normalizePositiveInteger(node["databaseId"]);
  const sourceUrl = normalizePublicHref(node["sourceUrl"]);
  const restriction = node["isRestricted"];
  if (
    databaseId === null ||
    sourceUrl === null ||
    restriction === true ||
    (restriction !== false && restriction !== null)
  ) return null;

  const details = isRecord(node["mediaDetails"]) ? node["mediaDetails"] : null;
  return Object.freeze({
    databaseId,
    sourceUrl,
    altText: normalizePlainText(node["altText"], 300),
    width: normalizePositiveInteger(details?.["width"]),
    height: normalizePositiveInteger(details?.["height"]),
  });
}

function diagnostic(code: Diagnostic["code"], databaseId: number | null): Diagnostic {
  return Object.freeze({ code, databaseId });
}

function normalizeMetric(value: unknown): HomepageMetric | null {
  if (!isRecord(value)) return null;
  return Object.freeze({
    value: normalizePlainText(value["value"], 120),
    label: normalizePlainText(value["label"], 240),
    supportingText: normalizePlainText(value["supportingText"], 500),
  });
}

function normalizeMetrics(value: unknown, maximum: number): readonly HomepageMetric[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    value.slice(0, maximum).map(normalizeMetric).filter((item): item is HomepageMetric => item !== null),
  );
}

function normalizeItem(
  value: unknown,
  expectedTypename: string | null,
  diagnostics: HomepageDiagnostic[],
): HomepageContentItem | null {
  if (!isRecord(value)) {
    diagnostics.push(diagnostic("invalid-content-item", null));
    return null;
  }

  const databaseId = normalizePositiveInteger(value["databaseId"]);
  if (databaseId === null) {
    diagnostics.push(diagnostic("invalid-content-item", null));
    return null;
  }

  const restriction = value["isRestricted"];
  if (restriction === true) {
    diagnostics.push(diagnostic("restricted-content-item", databaseId));
    return null;
  }
  if (restriction !== false && restriction !== null) {
    diagnostics.push(diagnostic("invalid-restriction-signal", databaseId));
    return null;
  }

  const typename = typeof value["__typename"] === "string"
    ? value["__typename"]
    : expectedTypename;
  const contract = typename === null ? null : CONTENT_CONTRACTS[typename];
  if (contract === undefined || contract === null) {
    diagnostics.push(diagnostic("unsupported-content-type", databaseId));
    return null;
  }
  if (value["contentTypeName"] !== contract.contentTypeName) {
    diagnostics.push(diagnostic("content-type-mismatch", databaseId));
    return null;
  }

  const title = normalizePlainText(value["title"], 240);
  const href = normalizePublicHref(value["uri"]);
  if (title === null || href === null) {
    diagnostics.push(diagnostic("invalid-content-item", databaseId));
    return null;
  }

  const detailsKey =
    contract.kind === "document" ||
    contract.kind === "download" ||
    contract.kind === "whitepaper"
      ? "documentDetails"
      : `${contract.kind.replace("press-release", "pressRelease")}Details`;
  const details = isRecord(value[detailsKey]) ? value[detailsKey] : null;

  if (contract.kind === "investment" && details?.["publicDisplay"] !== true) {
    diagnostics.push(diagnostic("restricted-content-item", databaseId));
    return null;
  }
  if (contract.kind === "testimonial" && details?.["consentApproved"] !== true) {
    diagnostics.push(diagnostic("restricted-content-item", databaseId));
    return null;
  }

  const rawImage = contract.kind === "company" && isRecord(details?.["cardImageOverride"])
    ? details?.["cardImageOverride"]
    : value["featuredImage"];
  const featuredImage = rawImage === null || rawImage === undefined
    ? null
    : normalizeMedia(rawImage);
  if (rawImage !== null && rawImage !== undefined && featuredImage === null) {
    diagnostics.push(diagnostic("invalid-media", databaseId));
  }

  const partnerImage = contract.kind === "partner" && featuredImage !== null
    ? Object.freeze({
        ...featuredImage,
        altText: normalizePlainText(details?.["logoAltOverride"], 300) ?? featuredImage.altText,
      })
    : featuredImage;

  // Investments carry no business-unit relation of their own — it's read
  // through investmentDetails.relatedCompany's own businessUnit instead
  // (see HomepageInvestmentNode in homepage.graphql), unlike companies/hero
  // slides/ticker items, which expose `businessUnit` directly on the node.
  const investmentRelatedCompany = isRecord(details?.["relatedCompany"])
    ? details["relatedCompany"]
    : null;
  const investmentCompanyNodes = Array.isArray(investmentRelatedCompany?.["nodes"])
    ? investmentRelatedCompany["nodes"]
    : [];
  const investmentBusinessUnit = isRecord(investmentCompanyNodes[0])
    ? investmentCompanyNodes[0]["businessUnit"]
    : null;

  return Object.freeze({
    kind: contract.kind,
    databaseId,
    title,
    href,
    excerpt: normalizePlainText(value["excerpt"], 1_200),
    featuredImage: partnerImage,
    date: normalizeDate(value["date"]),
    modified: normalizeDate(value["modified"]),
    subtitle: normalizePlainText(details?.["subtitle"], 300),
    location: normalizePlainText(details?.["location"], 300),
    status: normalizePlainText(details?.["status"] ?? details?.["operatingStatus"], 120),
    descriptor: normalizePlainText(details?.["shortDescriptor"], 500),
    externalHref: normalizePublicHref(
      details?.["externalWebsiteUrl"] ?? details?.["websiteUrl"] ?? details?.["sourceUrl"],
    ),
    ticketSizeLabel: normalizePlainText(details?.["ticketSizeLabel"], 240),
    role: normalizePlainText(details?.["role"], 240),
    organization: normalizePlainText(details?.["organization"], 240),
    relationshipLabel: normalizePlainText(details?.["relationshipLabel"], 240),
    publicationDate: normalizeDate(details?.["publicationDate"]),
    version: normalizePlainText(details?.["version"], 120),
    businessUnit: normalizeBusinessUnits(
      contract.kind === "investment" ? investmentBusinessUnit : value["businessUnit"],
    ),
  });
}

function emptySelection<T>(): HomepageSelection<T> {
  return Object.freeze({ status: "empty", items: EMPTY_ITEMS, diagnostics: EMPTY_DIAGNOSTICS });
}

function normalizeSelection(
  value: unknown,
  expectedTypename: string | null,
): HomepageSelection<HomepageContentItem> {
  if (value === null || value === undefined) return emptySelection();
  if (!isRecord(value) || !Array.isArray(value["nodes"]) || !isRecord(value["pageInfo"])) {
    return Object.freeze({
      status: "invalid",
      reason: "invalid-connection",
      items: EMPTY_ITEMS,
      diagnostics: Object.freeze([diagnostic("invalid-content-item", null)]),
    });
  }
  if (value["pageInfo"]["hasNextPage"] !== false) {
    return Object.freeze({
      status: "invalid",
      reason: "relationship-truncated",
      items: EMPTY_ITEMS,
      diagnostics: Object.freeze([diagnostic("relationship-truncated", null)]),
    });
  }

  const diagnostics: HomepageDiagnostic[] = [];
  const items = value["nodes"]
    .map((node) => normalizeItem(node, expectedTypename, diagnostics))
    .filter((item): item is HomepageContentItem => item !== null);
  const frozenDiagnostics = Object.freeze([...diagnostics]);
  if (items.length === 0) {
    if (value["nodes"].length === 0) return emptySelection();
    return Object.freeze({
      status: "invalid",
      reason: "no-public-items",
      items: EMPTY_ITEMS,
      diagnostics: frozenDiagnostics,
    });
  }
  return Object.freeze({ status: "ready", items: Object.freeze(items), diagnostics: frozenDiagnostics });
}

function normalizeBusinessUnits(value: unknown): HomepageSelection<HomepageBusinessUnit> {
  if (value === null || value === undefined) return emptySelection();
  if (!isRecord(value) || !Array.isArray(value["nodes"]) || !isRecord(value["pageInfo"])) {
    return Object.freeze({ status: "invalid", reason: "invalid-connection", items: EMPTY_ITEMS, diagnostics: EMPTY_DIAGNOSTICS });
  }
  if (value["pageInfo"]["hasNextPage"] !== false) {
    return Object.freeze({ status: "invalid", reason: "relationship-truncated", items: EMPTY_ITEMS, diagnostics: Object.freeze([diagnostic("relationship-truncated", null)]) });
  }
  const items = value["nodes"].map((node): HomepageBusinessUnit | null => {
    if (!isRecord(node)) return null;
    const databaseId = normalizePositiveInteger(node["databaseId"]);
    const name = normalizePlainText(node["name"], 240);
    const slug = normalizePlainText(node["slug"], 160);
    return databaseId !== null && name !== null && slug !== null
      ? Object.freeze({ databaseId, name, slug })
      : null;
  }).filter((item): item is HomepageBusinessUnit => item !== null);
  return items.length === 0
    ? emptySelection()
    : Object.freeze({ status: "ready", items: Object.freeze(items), diagnostics: EMPTY_DIAGNOSTICS });
}

function normalizeHeader(value: RecordValue): HomepageSectionHeader {
  return Object.freeze({
    eyebrow: normalizePlainText(value["eyebrow"], 160),
    heading: normalizePlainText(value["heading"], 300),
    description: normalizePlainText(value["description"], 1_200),
    link: normalizeLink(value["link"]),
  });
}

function normalizeContentSection(
  value: unknown,
  connectionKey: string,
  expectedTypename: string | null,
): HomepageContentSection | null {
  if (!isRecord(value)) return null;
  const rawLimit = value["itemLimit"];
  return Object.freeze({
    ...normalizeHeader(value),
    sourceMode: normalizePlainText(value["sourceMode"], 80),
    itemLimit: typeof rawLimit === "number" && Number.isFinite(rawLimit) && rawLimit >= 1 && rawLimit <= 12
      ? Math.floor(rawLimit)
      : null,
    selection: normalizeSelection(value[connectionKey], expectedTypename),
  });
}

function normalizeEditorialSection(value: unknown): HomepageEditorialSection | null {
  return normalizeContentSection(value, "selectedItems", null);
}

function normalizeRichTextSection(value: unknown): HomepageRichTextSection | null {
  if (!isRecord(value)) return null;
  return Object.freeze({ ...normalizeHeader(value), body: normalizeRichText(value["body"]) });
}

function normalizeMetricsSection(value: unknown, maximum: number): HomepageMetricsSection | null {
  if (!isRecord(value)) return null;
  return Object.freeze({
    ...normalizeHeader(value),
    body: normalizeRichText(value["body"]),
    metrics: normalizeMetrics(value["metrics"], maximum),
  });
}

function normalizeContact(value: unknown): HomepageContactSection | null {
  if (!isRecord(value)) return null;
  return Object.freeze({
    eyebrow: normalizePlainText(value["eyebrow"], 160),
    heading: normalizePlainText(value["heading"], 300),
    description: normalizePlainText(value["description"], 1_200),
    formVariant: normalizePlainText(value["formVariant"], 120),
    formContext: normalizePlainText(value["formContext"], 240),
  });
}

function normalizeHero(value: RecordValue): HomepageHero {
  return Object.freeze({
    headingBefore: normalizePlainText(value["headingBefore"], 240),
    headingHighlight: normalizePlainText(value["headingHighlight"], 240),
    headingAfter: normalizePlainText(value["headingAfter"], 240),
    description: normalizePlainText(value["description"], 1_200),
    primaryCta: normalizeLink(value["primaryCta"]),
    secondaryCta: normalizeLink(value["secondaryCta"]),
  });
}

function normalizeGroupHero(value: RecordValue): GroupHomepageHero {
  const slides = Array.isArray(value["slides"])
    ? value["slides"].slice(0, 8).filter(isRecord).map((slide): GroupHomepageHeroSlide => Object.freeze({
        title: normalizePlainText(slide["titleOverride"], 300),
        eyebrow: normalizePlainText(slide["eyebrowOverride"], 160),
        description: normalizePlainText(slide["descriptionOverride"], 1_200),
        location: normalizePlainText(slide["locationOverride"], 240),
        imageAlt: normalizePlainText(slide["imageAltOverride"], 300),
        image: normalizeMedia(slide["imageOverride"]),
        mobileImage: normalizeMedia(slide["mobileImageOverride"]),
        primaryCta: normalizeLink(slide["primaryCtaOverride"]),
        secondaryCta: normalizeLink(slide["secondaryCtaOverride"]),
        businessUnit: normalizeBusinessUnits(slide["businessUnit"]),
        relatedProject: normalizeSelection(slide["relatedProject"], "SiraProject"),
        relatedCompany: normalizeSelection(slide["relatedCompany"], "SiraCompany"),
      }))
    : Object.freeze([]);
  return Object.freeze({ ...normalizeHero(value), slides: Object.freeze(slides) });
}

function normalizeTicker(value: unknown): HomepageTicker | null {
  if (!isRecord(value)) return null;
  const items = Array.isArray(value["items"])
    ? value["items"].slice(0, 12).filter(isRecord).map((item) => Object.freeze({
        label: normalizePlainText(item["label"], 240),
        link: normalizeLink(item["link"]),
        businessUnit: normalizeBusinessUnits(item["businessUnit"]),
      }))
    : Object.freeze([]);
  return Object.freeze({ enabled: value["enabled"] === true, items: Object.freeze(items) });
}

function normalizeInvestor(value: unknown): HomepageInvestorSection | null {
  if (!isRecord(value)) return null;
  return Object.freeze({
    ...normalizeHeader(value),
    body: normalizeRichText(value["body"]),
    metrics: normalizeMetrics(value["metrics"], 8),
    formHeading: normalizePlainText(value["formHeading"], 300),
    formDescription: normalizePlainText(value["formDescription"], 1_200),
    investments: normalizeSelection(value["selectedInvestments"], "SiraInvestment"),
    onePager: normalizeSelection(value["onePagerDocument"], null),
  });
}

function invalid(siteKey: SiteKey, reason: InvalidHomepageReason): HomepageResolution {
  return Object.freeze({ status: "invalid", siteKey, reason });
}

export function normalizeHomepage(siteKey: SiteKey, data: SiraHomepageQueryData): HomepageResolution {
  if (!isRecord(data) || !("page" in data)) return invalid(siteKey, "invalid-page");
  const page = data["page"];
  if (page === null) return Object.freeze({ status: "not-found", siteKey, reason: "homepage-not-configured" });
  if (!isRecord(page) || normalizePositiveInteger(page["databaseId"]) === null || page["uri"] !== "/") {
    return invalid(siteKey, "invalid-page");
  }
  const fields = page["siraHomepage"];
  if (!isRecord(fields)) return invalid(siteKey, "missing-homepage-data");
  const expectedVariant = siteKey === "group" ? "group" : "branch";
  if (fields["variant"] !== expectedVariant) return invalid(siteKey, "variant-mismatch");

  const databaseId = Number(page["databaseId"]);
  const title = normalizePlainText(page["title"], 240);
  // Every section is its OWN standalone top-level field group, so it lives
  // directly on `page` — not nested under `siraHomepage` (which now holds
  // only `variant`), and not under a `groupHomepage`/`branchHomepage`
  // wrapper either. See the note on PresentationFields.php's
  // group_homepage_section_groups() for why: WPGraphQL for ACF cannot
  // resolve text/textarea/link/wysiwyg/relationship fields that live
  // inside a `group`-type field nested inside another field group's own
  // `fields` array — only a field group's own direct top-level fields
  // resolve correctly.
  if (siteKey === "group") {
    if (!isRecord(page["groupHero"])) return invalid(siteKey, "missing-variant-data");
    const homepage: GroupHomepage = Object.freeze({
      siteKey,
      databaseId,
      uri: "/",
      title,
      variant: "group",
      hero: normalizeGroupHero(page["groupHero"]),
      ticker: normalizeTicker(page["ticker"]),
      latestUpdates: normalizeEditorialSection(page["latestUpdates"]),
      companies: normalizeContentSection(page["companies"], "selectedCompanies", "SiraCompany"),
      about: normalizeMetricsSection(page["about"], 8),
      investor: normalizeInvestor(page["investor"]),
      services: normalizeContentSection(page["services"], "selectedServices", "SiraService"),
      projects: normalizeContentSection(page["groupProjects"], "selectedProjects", "SiraProject"),
      insights: normalizeEditorialSection(page["groupInsights"]),
      testimonials: normalizeContentSection(page["testimonials"], "selectedTestimonials", "SiraTestimonial"),
      partners: normalizeContentSection(page["partners"], "selectedPartners", "SiraPartner"),
      contact: normalizeContact(page["groupContact"]),
    });
    return Object.freeze({ status: "ready", homepage });
  }

  // Same flattening applies to the branch variant's sections.
  if (!isRecord(page["branchHero"])) return invalid(siteKey, "missing-variant-data");
  const hero = page["branchHero"];
  const branchHero: BranchHomepageHero = Object.freeze({
    ...normalizeHero(hero),
    eyebrow: normalizePlainText(hero["eyebrow"], 160),
    region: normalizePlainText(hero["region"], 160),
    imageAlt: normalizePlainText(hero["imageAlt"], 300),
    image: normalizeMedia(hero["image"]),
    mobileImage: normalizeMedia(hero["mobileImage"]),
  });
  // `statistics`/`focusAreas` are each their own field group wrapping a
  // same-named repeater (Page.statistics.statistics, Page.focusAreas.
  // focusAreas), because WPGraphQL for ACF derives the wrapper's type name
  // from the field group title rather than the graphql_type_name set in
  // PresentationFields.php.
  //
  // These DO resolve. An earlier version of this comment said repeaters did
  // not resolve over GraphQL and that this always normalized empty; that is
  // no longer true and the stale note caused the gap to be mis-triaged as a
  // backend defect. Verified 2026-08-31 against live data: Consulting,
  // Lifestyle and Real Estate each return 4 statistics and 3 focus areas.
  // Healthcare returns null for both because nobody has authored them.
  const focusAreasField = isRecord(page["focusAreas"]) ? page["focusAreas"]["focusAreas"] : null;
  const focusAreas = Array.isArray(focusAreasField)
    ? focusAreasField.slice(0, 12).filter(isRecord).map((item): HomepageFocusArea => Object.freeze({
        title: normalizePlainText(item["title"], 240),
        description: normalizePlainText(item["description"], 1_000),
      }))
    : Object.freeze([]);
  const statisticsField = isRecord(page["statistics"]) ? page["statistics"]["statistics"] : null;
  const footer = isRecord(page["footer"])
    ? Object.freeze({
        taglineOverride: normalizePlainText(page["footer"]["taglineOverride"], 500),
        groupLinkLabelOverride: normalizePlainText(page["footer"]["groupLinkLabelOverride"], 240),
      })
    : null;
  const homepage: BranchHomepage = Object.freeze({
    siteKey,
    databaseId,
    uri: "/",
    title,
    variant: "branch",
    hero: branchHero,
    statistics: normalizeMetrics(statisticsField, 8),
    overview: normalizeRichTextSection(page["overview"]),
    focusAreas: Object.freeze(focusAreas),
    projects: normalizeContentSection(page["branchProjects"], "selectedProjects", "SiraProject"),
    insights: normalizeEditorialSection(page["branchInsights"]),
    contact: normalizeContact(page["branchContact"]),
    footer,
  });
  return Object.freeze({ status: "ready", homepage });
}

import type {
  BranchHomepage,
  BranchHomepageHero,
  DigitalCapability,
  DigitalHomepage,
  DigitalHomepageHero,
  DigitalMarqueeSection,
  DigitalWordmarkSection,
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
  HomepageSectionName,
  HomepageTicker,
  HomepageVariant,
  InvalidHomepageReason,
} from "@/lib/homepage/types";
import type { GraphQLErrorSummary } from "@/lib/graphql/errors";
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

/**
 * Shared with the Digital content normalizers.
 */
export function normalizePlainText(value: unknown, maximumLength: number): string | null {
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

/**
 * Shared with the Digital content normalizers.
 */
export function normalizeRichText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized === "" ? null : normalized.slice(0, 20_000);
}

/**
 * Shared with the Digital content normalizers.
 *
 * Exported rather than copied: this encodes a security decision about what an
 * href may be, and a second copy is a second place to forget to fix it.
 */
export function normalizePublicHref(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();

  if (
    href === "" ||
    href.startsWith("//") ||
    href.includes("\\") ||
    /[\u0000-\u001f\u007f]/u.test(href)
  ) return null;

  if (href.startsWith("/")) return href;

  // Same-document anchors. Editors author "#projects" and "#contact" in the
  // ACF link fields, and `new URL("#projects")` throws, so every in-page CTA
  // the CMS carried was being normalized to null and dropped — including both
  // hero buttons. A fragment has no scheme and no authority and cannot leave
  // the page, so the only thing worth checking is that it is a plausible id.
  if (href.startsWith("#")) {
    return /^#[A-Za-z][\w.:-]*$/u.test(href) ? href : null;
  }

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

/**
 * Shared with the Digital content normalizers.
 *
 * Exported rather than copied: this encodes a security decision about what an
 * href may be, and a second copy is a second place to forget to fix it.
 */
export function normalizeLink(value: unknown): HomepageLink | null {
  if (!isRecord(value)) return null;
  const href = normalizePublicHref(value["url"]);
  if (href === null) return null;
  return Object.freeze({
    label: normalizePlainText(value["title"], 240),
    href,
    target: value["target"] === "_blank" ? "_blank" : null,
  });
}

/**
 * Shared with the Digital content normalizers.
 *
 * Exported rather than copied: this encodes a security decision about what an
 * href may be, and a second copy is a second place to forget to fix it.
 */
export function normalizeMedia(value: unknown): HomepageMedia | null {
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

function diagnostic(
  code: Diagnostic["code"],
  databaseId: number | null,
  section: HomepageSectionName | null = null,
): Diagnostic {
  return Object.freeze({ code, databaseId, section });
}

const SECTION_NAMES: ReadonlySet<string> = new Set<HomepageSectionName>([
  "about",
  "companies",
  "contact",
  "focusAreas",
  "footer",
  "hero",
  "insights",
  "investor",
  "latestUpdates",
  "overview",
  "partners",
  "projects",
  "services",
  "statistics",
  "testimonials",
  "ticker",
]);

/**
 * Maps a GraphQL error path onto the section it affected, but only on an exact
 * match of `page -> <variant envelope> -> <known section>`. Anything else
 * returns null: an unattributable error is recorded without a section rather
 * than blamed on a section that may be perfectly healthy.
 */
function sectionFromErrorPath(
  path: readonly (string | number)[] | null,
  envelopeKey: string,
): HomepageSectionName | null {
  if (path === null || path.length < 3) return null;
  if (path[0] !== "page" || path[1] !== envelopeKey) return null;

  const candidate = path[2];

  return typeof candidate === "string" && SECTION_NAMES.has(candidate)
    ? (candidate as HomepageSectionName)
    : null;
}

/**
 * Turns tolerated transport errors into page-level diagnostics. Only the code
 * and the mapped section survive: the GraphQL message, the endpoint, and the
 * query text never enter this model, because it is rendered into the page
 * payload and therefore reaches the browser.
 */
function fieldErrorDiagnostics(
  errors: readonly GraphQLErrorSummary[],
  envelopeKey: string,
): readonly Diagnostic[] {
  if (errors.length === 0) return EMPTY_DIAGNOSTICS;

  return Object.freeze(
    errors.map((error) =>
      diagnostic(
        "graphql-field-error",
        null,
        sectionFromErrorPath(error.path, envelopeKey),
      ),
    ),
  );
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

// A branch site nobody has authored still returns its ACF group as an object
// with every field null. `isRecord` is therefore true, the section is kept, and
// it renders as an empty band: an 850px hero carrying no heading at all, and an
// overview showing only its fallback eyebrow. Presence of the group is not
// presence of content, so emptiness is judged on the normalized values.
//
// normalizePlainText already collapses whitespace-only strings to null, so a
// field containing only spaces counts as empty here without a second check.
//
// Branch tenants only. Group normalization is deliberately untouched.
function hasAnyValue(values: readonly unknown[]): boolean {
  return values.some((value) => value !== null);
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

// ---------------------------------------------------------------------------
// Digital variant sections (ADR-033)
// ---------------------------------------------------------------------------
// Same tolerance rules as every other section here: an absent group is null, a
// group whose every field is empty normalizes to nothing renderable, and no
// section can take the page down with it.

/**
 * The capability rail.
 *
 * Capped at twelve because the rail is a reading surface, not a catalogue: past
 * a dozen entries a numbered list stops being scannable and the CMS should be
 * splitting it. An entry with neither a title nor a summary is dropped rather
 * than rendered as an empty numbered row.
 */
function normalizeCapabilities(value: unknown): readonly DigitalCapability[] {
  if (!Array.isArray(value)) return Object.freeze([]);

  const capabilities = value
    .slice(0, 12)
    .filter(isRecord)
    .map((entry): DigitalCapability =>
      Object.freeze({
        title: normalizePlainText(entry["title"], 160),
        summary: normalizePlainText(entry["summary"], 600),
        link: normalizeLink(entry["link"]),
      }),
    )
    .filter((entry) => hasAnyValue([entry.title, entry.summary]));

  return Object.freeze(capabilities);
}

/**
 * The marquee band.
 *
 * Items are plain strings, not links: this is a statement of reach, and a row
 * of names that each navigate somewhere reads as a directory instead. Capped at
 * forty because the track is duplicated for the loop and a longer list makes
 * the cycle slow enough to look stalled.
 */
function normalizeMarquee(value: unknown): DigitalMarqueeSection | null {
  if (!isRecord(value)) return null;

  const rawItems = Array.isArray(value["items"]) ? value["items"] : [];
  const items = rawItems
    .slice(0, 40)
    .map((entry) =>
      isRecord(entry)
        ? normalizePlainText(entry["label"], 120)
        : normalizePlainText(entry, 120),
    )
    .filter((entry): entry is string => entry !== null);

  return Object.freeze({
    ...normalizeHeader(value),
    body: normalizeRichText(value["body"]),
    items: Object.freeze(items),
  });
}

/**
 * The scroll-driven wordmark band.
 *
 * Returns null without a `word`, because the band is one enormous piece of type
 * and the lockup beneath it is a caption. A caption with nothing to caption is
 * two screens of empty ground.
 */
function normalizeWordmark(value: unknown): DigitalWordmarkSection | null {
  if (!isRecord(value)) return null;

  const word = normalizePlainText(value["word"], 40);
  if (word === null) return null;

  return Object.freeze({
    word,
    lockup: normalizePlainText(value["lockup"], 300),
    link: normalizeLink(value["link"]),
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

/**
 * Resilience boundary.
 *
 * CRITICAL — the page envelope. A missing or malformed `page`, `siraHomepage`,
 * variant, or variant field group means there is no recoverable homepage, and
 * these still resolve to `not-found` / `invalid` exactly as before.
 *
 * TOLERANT — every presentation section, `hero` included. A section that is
 * absent or that lost its data to a GraphQL field error is omitted, and the
 * rest of the homepage still renders. `fieldErrors` carries the tolerated
 * transport errors so they can be attributed to sections where safe.
 */
export function normalizeHomepage(
  siteKey: SiteKey,
  data: SiraHomepageQueryData,
  fieldErrors: readonly GraphQLErrorSummary[] = [],
  /**
   * The URI this homepage was asked for.
   *
   * The guard below exists to prove the CMS returned the page we requested
   * rather than some other page, and it used to do that by pinning the URI to
   * the site root. ADR-034 gives each language its own homepage — Arabic lives
   * at `/ar/` — so the comparison is now against what was requested. Pinning it
   * to `/` did not fail loudly; it resolved `invalid-page` and rendered the
   * not-ready shell, which is a much quieter way to lose a whole language.
   */
  expectedUri: string = "/",
): HomepageResolution {
  if (!isRecord(data) || !("page" in data)) return invalid(siteKey, "invalid-page");
  const page = data["page"];
  if (page === null) return Object.freeze({ status: "not-found", siteKey, reason: "homepage-not-configured" });
  if (
    !isRecord(page) ||
    normalizePositiveInteger(page["databaseId"]) === null ||
    page["uri"] !== expectedUri
  ) {
    return invalid(siteKey, "invalid-page");
  }
  const fields = page["siraHomepage"];
  if (!isRecord(fields)) return invalid(siteKey, "missing-homepage-data");
  // Three variants now, so this is a mapping rather than a group/not-group
  // test. Digital gets its own value deliberately: with the old expression it
  // would have expected `branch` and rendered as a fifth branch site the moment
  // its CMS returned that variant, which ADR-033 explicitly does not want.
  const expectedVariant: HomepageVariant =
    siteKey === "group" ? "group" : siteKey === "digital" ? "digital" : "branch";
  if (fields["variant"] !== expectedVariant) return invalid(siteKey, "variant-mismatch");

  const databaseId = Number(page["databaseId"]);
  const title = normalizePlainText(page["title"], 240);
  // sira-core 1.6.0 registers the sections as two ACF *field groups*,
  // `groupHomepage` and `branchHomepage`, rather than as `group`-type fields
  // nested inside one. ACF prefixes a group field's children with the parent
  // name, so the old nesting made it look for
  // `sira_group_homepage_hero_heading_before` while every row actually stored
  // on a front page is `hero_heading_before` — so every field resolved to null
  // and this normalizer never reached "ready". A field group adds no storage
  // prefix, which makes the existing content readable without re-authoring it,
  // and keeps Group and Branch in separate GraphQL types — which the nesting
  // was providing, since both variants name a section `hero`.
  const groupSections: Record<string, unknown> = isRecord(page["groupHomepage"])
    ? page["groupHomepage"]
    : {};
  const branchSections: Record<string, unknown> = isRecord(page["branchHomepage"])
    ? page["branchHomepage"]
    : {};

  if (siteKey === "group") {
    // The variant envelope stays critical: without the field group there is no
    // recoverable homepage data at all. This check used to be implicit, riding
    // on the hero guard below; hero is tolerant now, so it is stated directly.
    if (!isRecord(page["groupHomepage"])) return invalid(siteKey, "missing-variant-data");
    const homepage: GroupHomepage = Object.freeze({
      siteKey,
      databaseId,
      uri: expectedUri,
      title,
      variant: "group",
      // Tolerant from here down. An absent or failed hero is omitted like any
      // other section instead of collapsing the whole page.
      hero: isRecord(groupSections["hero"])
        ? normalizeGroupHero(groupSections["hero"])
        : null,
      ticker: normalizeTicker(groupSections["ticker"]),
      latestUpdates: normalizeEditorialSection(groupSections["latestUpdates"]),
      companies: normalizeContentSection(groupSections["companies"], "selectedCompanies", "SiraCompany"),
      about: normalizeMetricsSection(groupSections["about"], 8),
      investor: normalizeInvestor(groupSections["investor"]),
      services: normalizeContentSection(groupSections["services"], "selectedServices", "SiraService"),
      projects: normalizeContentSection(groupSections["projects"], "selectedProjects", "SiraProject"),
      insights: normalizeEditorialSection(groupSections["insights"]),
      testimonials: normalizeContentSection(groupSections["testimonials"], "selectedTestimonials", "SiraTestimonial"),
      partners: normalizeContentSection(groupSections["partners"], "selectedPartners", "SiraPartner"),
      contact: normalizeContact(groupSections["contact"]),
      diagnostics: fieldErrorDiagnostics(fieldErrors, "groupHomepage"),
    });
    return Object.freeze({ status: "ready", homepage });
  }

  if (siteKey === "digital") {
    // Same field-group registration as the other two variants, and the same
    // envelope/section split: the field group is critical, every section in it
    // is tolerant.
    if (!isRecord(page["digitalHomepage"])) return invalid(siteKey, "missing-variant-data");
    const digitalSections: Record<string, unknown> = page["digitalHomepage"];
    const digitalHeroSource = digitalSections["hero"];
    const digitalHeroCandidate: DigitalHomepageHero | null = isRecord(digitalHeroSource)
      ? Object.freeze({
          ...normalizeHero(digitalHeroSource),
          eyebrow: normalizePlainText(digitalHeroSource["eyebrow"], 160),
        })
      : null;
    // Same keep-threshold reasoning as the branch hero: the Digital hero is a
    // full-viewport panel gated on a heading, so an eyebrow alone cannot
    // justify one screen of empty dark ground.
    const digitalHero: DigitalHomepageHero | null =
      digitalHeroCandidate !== null &&
      hasAnyValue([
        digitalHeroCandidate.headingBefore,
        digitalHeroCandidate.headingHighlight,
        digitalHeroCandidate.headingAfter,
        digitalHeroCandidate.description,
        digitalHeroCandidate.primaryCta,
        digitalHeroCandidate.secondaryCta,
      ])
        ? digitalHeroCandidate
        : null;

    const homepage: DigitalHomepage = Object.freeze({
      siteKey,
      databaseId,
      uri: expectedUri,
      title,
      variant: "digital",
      hero: digitalHero,
      capabilitiesEyebrow: normalizePlainText(digitalSections["capabilitiesEyebrow"], 80),
      capabilities: normalizeCapabilities(digitalSections["capabilities"]),
      marquee: normalizeMarquee(digitalSections["marquee"]),
      wordmark: normalizeWordmark(digitalSections["wordmark"]),
      insights: normalizeEditorialSection(digitalSections["insights"]),
      contact: normalizeContact(digitalSections["contact"]),
      diagnostics: fieldErrorDiagnostics(fieldErrors, "digitalHomepage"),
    });
    return Object.freeze({ status: "ready", homepage });
  }

  // Same field-group move applies to the branch variant's sections.
  // Same envelope/section split as the group variant above.
  if (!isRecord(page["branchHomepage"])) return invalid(siteKey, "missing-variant-data");
  const heroSource = branchSections["hero"];
  const branchHeroCandidate: BranchHomepageHero | null = isRecord(heroSource)
    ? Object.freeze({
        ...normalizeHero(heroSource),
        eyebrow: normalizePlainText(heroSource["eyebrow"], 160),
        region: normalizePlainText(heroSource["region"], 160),
        imageAlt: normalizePlainText(heroSource["imageAlt"], 300),
        image: normalizeMedia(heroSource["image"]),
        mobileImage: normalizeMedia(heroSource["mobileImage"]),
      })
    : null;
  // The keep-threshold has to match what BranchHero actually renders, or the
  // empty band comes back through a narrower door. The hero is a 75-85svh
  // full-bleed panel whose <h1> is gated on a heading, so eyebrow, region and
  // imageAlt cannot justify it on their own: an eyebrow-only hero is that same
  // tall dark band carrying one small line and no heading at all.
  //
  // Only content that fills the panel counts: headings, description, either
  // image, or a CTA.
  const branchHero: BranchHomepageHero | null =
    branchHeroCandidate !== null &&
    hasAnyValue([
      branchHeroCandidate.headingBefore,
      branchHeroCandidate.headingHighlight,
      branchHeroCandidate.headingAfter,
      branchHeroCandidate.description,
      branchHeroCandidate.image,
      branchHeroCandidate.mobileImage,
      branchHeroCandidate.primaryCta,
      branchHeroCandidate.secondaryCta,
    ])
      ? branchHeroCandidate
      : null;
  // `statistics` and `focusAreas` are repeaters, and under the field-group
  // registration they arrive as plain lists. They used to be doubled up
  // (`statistics { statistics { … } }`) because each sat inside a same-named
  // group field; that wrapper is gone.
  //
  // Repeaters DO resolve. An older version of this comment claimed they did
  // not and that this always normalized empty; that was wrong, and the stale
  // note caused the gap to be mis-triaged as a backend defect. Treat
  // resolution as verified-by-observation rather than guaranteed by contract:
  // if these ever normalize empty again, probe the endpoint directly before
  // assuming a frontend fault. A branch site legitimately returns null here
  // when nobody has authored the content — Healthcare did on 2026-08-31.
  const focusAreasField = branchSections["focusAreas"];
  const focusAreas = Array.isArray(focusAreasField)
    ? focusAreasField.slice(0, 12).filter(isRecord).map((item): HomepageFocusArea => Object.freeze({
        title: normalizePlainText(item["title"], 240),
        description: normalizePlainText(item["description"], 1_000),
      }))
    : Object.freeze([]);
  const statisticsField = branchSections["statistics"];
  const overviewCandidate = normalizeRichTextSection(branchSections["overview"]);
  const overview =
    overviewCandidate !== null &&
    hasAnyValue([
      overviewCandidate.eyebrow,
      overviewCandidate.heading,
      overviewCandidate.description,
      overviewCandidate.link,
      overviewCandidate.body,
    ])
      ? overviewCandidate
      : null;
  const footer = isRecord(branchSections["footer"])
    ? Object.freeze({
        taglineOverride: normalizePlainText(branchSections["footer"]["taglineOverride"], 500),
        groupLinkLabelOverride: normalizePlainText(branchSections["footer"]["groupLinkLabelOverride"], 240),
      })
    : null;
  const homepage: BranchHomepage = Object.freeze({
    siteKey,
    databaseId,
    uri: expectedUri,
    title,
    variant: "branch",
    hero: branchHero,
    statistics: normalizeMetrics(statisticsField, 8),
    overview,
    focusAreas: Object.freeze(focusAreas),
    projects: normalizeContentSection(branchSections["projects"], "selectedProjects", "SiraProject"),
    insights: normalizeEditorialSection(branchSections["insights"]),
    contact: normalizeContact(branchSections["contact"]),
    footer,
    diagnostics: fieldErrorDiagnostics(fieldErrors, "branchHomepage"),
  });
  return Object.freeze({ status: "ready", homepage });
}

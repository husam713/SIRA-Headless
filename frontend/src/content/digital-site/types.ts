import type { SiteKey } from "@/types/site";

/**
 * The SIRA Digital site's narrative, typed.
 *
 * Everything a visitor reads on the Digital routes comes from one object per
 * language, and the two languages share this shape exactly, so a section that
 * exists in English cannot quietly go missing in Arabic (tests/unit/digital-site
 * asserts the parity). The narrative is split by page (`en/*.ts`, `ar/*.ts`)
 * so an editor replacing provisional copy touches one file per page; the shape
 * stays close to what an ACF field group would carry, so moving it into the
 * CMS later changes the source, not the components.
 *
 * What is NOT here, by design: client names, statistics, people, offices,
 * certifications, partner status, founding dates. None of those have been
 * supplied by the owner and the site does not invent them. Sample figures for
 * the illustrative demonstrations live in `content/digital-site/demo/`, are
 * language-neutral, and are always rendered under an "illustrative" label.
 *
 * Every sentence describing how SIRA Digital works is PROVISIONAL until the
 * owner approves it — see docs/website-prototype/09_CONTENT_AND_APPROVAL_REGISTER.md.
 */

export interface DigitalLink {
  readonly label: string;
  /** A locale-less site path (`/contact/`) or an in-page anchor (`#…`). */
  readonly href: string;
}

export interface DigitalPageMeta {
  readonly title: string;
  readonly description: string;
}

/** The pages the repository narrative owns. */
export type DigitalPageKey =
  | "home"
  | "services"
  | "erpnext"
  | "automation"
  | "industries"
  | "method"
  | "about"
  | "contact";

/** A heading with its standfirst — the opening of almost every section. */
export interface DigitalHeading {
  readonly title: string;
  readonly intro: string;
}

/** A page's opening: title (one or more lines) and standfirst. */
export interface DigitalPageIntro {
  readonly title: readonly string[];
  readonly lede: string;
}

/** A short statement with its explanation (commitments, principles, patterns). */
export interface DigitalStatement {
  readonly key: string;
  readonly title: string;
  readonly body: string;
}

/** One line of a two-column ledger: a label and what it means. */
export interface DigitalLedgerRow {
  readonly key: string;
  readonly label: string;
  readonly detail: string;
}

/* ------------------------------------------------------------------------ */
/* Shared catalogues                                                        */
/* ------------------------------------------------------------------------ */

/** A line of work SIRA Digital proposes to offer (provisional). */
export interface DigitalSolution {
  readonly key: "erp" | "automation" | "integration" | "reporting" | "support";
  readonly title: string;
  readonly summary: string;
  /** The longer treatment on /services/. */
  readonly detail: string;
  readonly includes: readonly string[];
  /** What the client holds at the end of this line of work. */
  readonly outcome: string;
  /** When this is the right place to start. */
  readonly fits: string;
  readonly link: DigitalLink;
}

/** An ERPNext module, described by what it does for the business. */
export interface DigitalModule {
  readonly key: string;
  readonly name: string;
  readonly handles: string;
  /** The documents a user meets in it, in the system's own vocabulary. */
  readonly documents: readonly string[];
}

/** A Saudi requirement the implementation handles. */
export interface DigitalRequirement {
  readonly key: string;
  readonly name: string;
  readonly body: string;
}

/** A sector, and how the same modules are used differently in it. */
export interface DigitalSector {
  readonly key: string;
  readonly name: string;
  readonly summary: string;
  readonly pains: readonly string[];
  /** Module keys (DigitalModule.key) that carry this sector's work. */
  readonly modules: readonly string[];
  /** The sector's typical route, as document names in order. */
  readonly flow: readonly string[];
  readonly integrations: readonly string[];
}

/** A business function, and what the system changes for it. */
export interface DigitalFunction {
  readonly key: string;
  readonly name: string;
  readonly before: string;
  readonly after: string;
}

/** A stage of an implementation. The content really is a sequence. */
export interface DigitalPhase {
  readonly key: string;
  readonly name: string;
  readonly summary: string;
  readonly activities: readonly string[];
  readonly deliverables: readonly string[];
  /** What the client contributes in this stage. */
  readonly fromYou: readonly string[];
  /** The review that closes the stage. */
  readonly gate: string;
}

export interface DigitalQuestion {
  readonly key: string;
  readonly question: string;
  readonly answer: readonly string[];
}

/* ------------------------------------------------------------------------ */
/* Demonstrations — labels only; the sample figures live in demo/*.ts       */
/* ------------------------------------------------------------------------ */

export interface DigitalRouteMapContent {
  /** Accessible name of the diagram. */
  readonly label: string;
  readonly caption: string;
  readonly purchase: readonly string[];
  readonly sales: readonly string[];
  /** The ledger node's label, one entry per line. */
  readonly ledger: readonly string[];
  readonly pause: string;
}

export interface DigitalWorkflowCategory {
  readonly key: "stock" | "services" | "asset";
  readonly label: string;
}

export interface DigitalWorkflowContent {
  readonly title: string;
  readonly intro: string;
  readonly note: string;
  readonly request: {
    readonly heading: string;
    readonly item: string;
    readonly requester: string;
  };
  readonly amountLabel: string;
  readonly amountHint: string;
  readonly currency: string;
  readonly categoryLabel: string;
  readonly categories: readonly DigitalWorkflowCategory[];
  readonly urgentLabel: string;
  readonly urgentHint: string;
  readonly routeHeading: string;
  /** `{count}` is replaced by the number of approvals on the route. */
  readonly routeSummary: string;
  readonly escalates: string;
  readonly hours: string;
  readonly roles: {
    readonly requester: string;
    readonly manager: string;
    readonly procurement: string;
    readonly finance: string;
    readonly general: string;
    readonly system: string;
  };
  readonly steps: {
    readonly submit: string;
    readonly manager: string;
    readonly quotations: string;
    readonly budget: string;
    readonly general: string;
    readonly order: string;
  };
  /** Why a step is on the route. `{limit}` is replaced by a formatted amount. */
  readonly reasons: {
    readonly always: string;
    readonly manager: string;
    readonly quotations: string;
    readonly asset: string;
    readonly general: string;
    readonly order: string;
  };
  readonly states: {
    readonly pending: string;
    readonly approved: string;
  };
  /** Runs the request through its route, step by step. */
  readonly run: string;
  /** Announced when the route completes. `{reference}` is the order number. */
  readonly done: string;
  readonly reset: string;
}

export interface DigitalDashboardTile {
  readonly label: string;
  readonly note: string;
  readonly sources: readonly string[];
}

export interface DigitalDashboardContent {
  readonly title: string;
  readonly intro: string;
  readonly stamp: string;
  readonly company: string;
  readonly period: string;
  readonly sourceLabel: string;
  readonly tiles: {
    readonly cash: DigitalDashboardTile;
    readonly overdue: DigitalDashboardTile;
    readonly approvals: DigitalDashboardTile;
    readonly reorder: DigitalDashboardTile;
    readonly margin: DigitalDashboardTile;
  };
  readonly sales: DigitalDashboardTile & {
    readonly weekPrefix: string;
  };
  readonly ageing: {
    readonly label: string;
    readonly buckets: readonly string[];
  };
  readonly invoices: DigitalDashboardTile & {
    readonly cleared: string;
    readonly reported: string;
    readonly rejected: string;
  };
  readonly currency: string;
}

/* ------------------------------------------------------------------------ */
/* Pages                                                                    */
/* ------------------------------------------------------------------------ */

export interface DigitalHomeContent {
  readonly hero: {
    readonly title: readonly string[];
    readonly lede: string;
    readonly primary: DigitalLink;
    readonly secondary: DigitalLink;
    readonly map: DigitalRouteMapContent;
  };
  readonly problem: DigitalHeading & {
    readonly diagramLabel: string;
    readonly islands: readonly string[];
    readonly symptomHeading: string;
    readonly costHeading: string;
    readonly rows: readonly DigitalLedgerRow[];
  };
  readonly solutions: DigitalHeading & {
    readonly includesLabel: string;
    readonly outcomeLabel: string;
  };
  readonly erp: DigitalHeading & {
    readonly databaseLabel: string;
    readonly requirementsTitle: string;
    readonly more: DigitalLink;
  };
  readonly industries: DigitalHeading & {
    readonly more: DigitalLink;
  };
  readonly method: DigitalHeading & {
    readonly deliverableLabel: string;
    readonly more: DigitalLink;
  };
  readonly commitments: DigitalHeading & {
    readonly items: readonly DigitalStatement[];
  };
  readonly faq: DigitalHeading & {
    readonly keys: readonly string[];
  };
}

export interface DigitalServicesContent {
  readonly intro: DigitalPageIntro;
  readonly indexLabel: string;
  readonly includesLabel: string;
  readonly outcomeLabel: string;
  readonly fitsLabel: string;
  readonly engagements: DigitalHeading & {
    readonly items: readonly DigitalStatement[];
  };
  readonly notSure: DigitalHeading & {
    readonly link: DigitalLink;
  };
}

export interface DigitalErpnextContent {
  readonly intro: DigitalPageIntro;
  readonly why: DigitalHeading & {
    readonly items: readonly DigitalStatement[];
  };
  readonly modules: DigitalHeading & {
    readonly documentsLabel: string;
    readonly databaseLabel: string;
  };
  readonly saudi: DigitalHeading & {
    readonly caution: string;
  };
  readonly migration: DigitalHeading & {
    readonly sources: readonly DigitalLedgerRow[];
  };
  readonly hosting: DigitalHeading & {
    readonly options: readonly DigitalStatement[];
  };
  readonly frappe: DigitalHeading & {
    readonly items: readonly string[];
  };
  readonly existing: DigitalHeading & {
    readonly items: readonly string[];
  };
  readonly faqKeys: readonly string[];
}

export interface DigitalAutomationContent {
  readonly intro: DigitalPageIntro;
  readonly patterns: DigitalHeading & {
    readonly items: readonly DigitalStatement[];
  };
  readonly integrations: DigitalHeading & {
    readonly hub: string;
    readonly groups: readonly { readonly key: string; readonly name: string; readonly items: readonly string[] }[];
  };
  readonly boundaries: DigitalHeading & {
    readonly automateLabel: string;
    readonly automate: readonly string[];
    readonly keepLabel: string;
    readonly keep: readonly string[];
  };
  readonly faqKeys: readonly string[];
}

export interface DigitalIndustriesContent {
  readonly intro: DigitalPageIntro;
  readonly sectors: DigitalHeading & {
    readonly painsLabel: string;
    readonly modulesLabel: string;
    readonly flowLabel: string;
    readonly integrationsLabel: string;
  };
  readonly functions: DigitalHeading & {
    readonly functionLabel: string;
    readonly beforeLabel: string;
    readonly afterLabel: string;
  };
  readonly group: DigitalHeading;
}

export interface DigitalMethodContent {
  readonly intro: DigitalPageIntro;
  readonly phasesTitle: string;
  readonly activitiesLabel: string;
  readonly deliverablesLabel: string;
  readonly fromYouLabel: string;
  readonly gateLabel: string;
  readonly roles: DigitalHeading & {
    readonly items: readonly DigitalLedgerRow[];
  };
  readonly checklist: DigitalHeading & {
    readonly questionLabel: string;
    readonly answerLabel: string;
    readonly items: readonly DigitalLedgerRow[];
  };
}

export interface DigitalAboutContent {
  readonly intro: DigitalPageIntro;
  readonly sections: readonly {
    readonly key: string;
    readonly title: string;
    readonly body: readonly string[];
  }[];
  readonly principles: DigitalHeading & {
    readonly items: readonly DigitalStatement[];
  };
  readonly group: DigitalHeading & {
    readonly companies: readonly { readonly key: SiteKey; readonly name: string; readonly field: string }[];
    readonly visit: string;
  };
}

export interface DigitalDiscoveryOption {
  readonly key: string;
  /** What the choice says. */
  readonly label: string;
  /** How it reads inside the composed brief. */
  readonly phrase: string;
}

export interface DigitalDiscoveryContent {
  readonly situationLabel: string;
  readonly situations: readonly DigitalDiscoveryOption[];
  readonly areasLabel: string;
  readonly areasHint: string;
  readonly areas: readonly DigitalDiscoveryOption[];
  readonly sizeLabel: string;
  readonly sizes: readonly DigitalDiscoveryOption[];
  readonly timingLabel: string;
  readonly timings: readonly DigitalDiscoveryOption[];
  readonly previewLabel: string;
  readonly previewEmpty: string;
  readonly previewNote: string;
  /** Sentence templates; `{…}` placeholders are replaced by the chosen phrases. */
  readonly sentenceSituation: string;
  readonly sentenceAreas: string;
  readonly sentenceSize: string;
  readonly sentenceTiming: string;
  readonly listSeparator: string;
  readonly listLast: string;
  readonly clear: string;
}

export interface DigitalContactForm {
  readonly legend: string;
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly company: string;
  readonly companyPrefix: string;
  readonly optional: string;
  readonly message: string;
  readonly messageHint: string;
  readonly submit: string;
  readonly sending: string;
  readonly successTitle: string;
  readonly successBody: string;
  readonly another: string;
  readonly errorSummary: string;
  readonly errorRequired: string;
  readonly errorEmail: string;
  readonly errorShort: string;
  readonly errorRateLimited: string;
  readonly errorFailed: string;
  readonly privacyNote: string;
  readonly privacyLink: DigitalLink;
  /** The `service` field sent to the CMS when nothing was chosen. */
  readonly defaultService: string;
}

export interface DigitalContactContent {
  readonly intro: DigitalPageIntro;
  readonly discovery: DigitalDiscoveryContent;
  readonly form: DigitalContactForm;
  readonly after: DigitalHeading & {
    readonly steps: readonly string[];
  };
}

/* ------------------------------------------------------------------------ */
/* The whole narrative                                                      */
/* ------------------------------------------------------------------------ */

export interface DigitalSiteContent {
  readonly locale: "en" | "ar";
  readonly meta: {
    readonly siteName: string;
    readonly pages: Readonly<Record<DigitalPageKey, DigitalPageMeta>>;
  };
  readonly brand: {
    readonly wordmark: string;
    /** The same name in the other script, set small beside the wordmark. */
    readonly echo: string;
    readonly groupName: string;
    readonly groupCompany: string;
    readonly tagline: string;
  };
  readonly nav: {
    readonly home: string;
    readonly label: string;
    readonly items: readonly DigitalLink[];
    readonly start: DigitalLink;
    readonly menu: string;
    readonly close: string;
    readonly skip: string;
    readonly language: {
      /** The other language, written in that language. */
      readonly label: string;
      readonly hint: string;
    };
  };
  readonly common: {
    readonly illustrative: string;
    readonly related: string;
    readonly closing: DigitalHeading & {
      readonly steps: readonly string[];
      readonly primary: DigitalLink;
    };
  };
  readonly solutions: readonly DigitalSolution[];
  readonly modules: readonly DigitalModule[];
  readonly requirements: readonly DigitalRequirement[];
  readonly sectors: readonly DigitalSector[];
  readonly functions: readonly DigitalFunction[];
  readonly phases: readonly DigitalPhase[];
  readonly questions: readonly DigitalQuestion[];
  readonly demos: {
    readonly workflow: DigitalWorkflowContent;
    readonly dashboard: DigitalDashboardContent;
  };
  readonly home: DigitalHomeContent;
  readonly services: DigitalServicesContent;
  readonly erpnext: DigitalErpnextContent;
  readonly automation: DigitalAutomationContent;
  readonly industries: DigitalIndustriesContent;
  readonly method: DigitalMethodContent;
  readonly about: DigitalAboutContent;
  readonly contact: DigitalContactContent;
  readonly footer: {
    readonly solutionsHeading: string;
    readonly companyHeading: string;
    readonly groupHeading: string;
    readonly legalHeading: string;
    readonly legal: readonly DigitalLink[];
    readonly rights: string;
    readonly provisional: string;
  };
  readonly notFound: {
    readonly code: string;
    readonly title: string;
    readonly body: string;
    readonly home: string;
    readonly suggestions: string;
  };
}

import type { SiteKey } from "@/types/site";

/**
 * The SIRA Digital site's narrative, typed.
 *
 * Everything a visitor reads on the Digital routes comes from one object per
 * language, and the two languages share this shape exactly, so a section that
 * exists in English cannot quietly go missing in Arabic (tests/unit/digital-site
 * asserts the parity). The shape is deliberately close to what an ACF field
 * group would carry: if the owner later moves the narrative into the CMS, the
 * components do not change, only the source.
 *
 * What is NOT here, by design: client names, statistics, people, offices,
 * certifications, founding dates. None of those have been supplied by the
 * owner, and the site does not invent them.
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

export interface DigitalCapability {
  readonly key: string;
  readonly index: string;
  readonly title: string;
  readonly summary: string;
  /** The longer treatment, used on the services page. */
  readonly detail: string;
  /** "Typical requests" — kinds of work, never named engagements. */
  readonly examples: readonly string[];
}

export interface DigitalStep {
  readonly key: string;
  readonly index: string;
  readonly title: string;
  readonly summary: string;
}

export interface DigitalPrinciple {
  readonly title: string;
  readonly body: string;
}

export interface DigitalCompany {
  readonly key: SiteKey;
  readonly name: string;
  readonly field: string;
}

/** One selectable chip in the brief composer. */
export interface DigitalBriefOption {
  readonly key: string;
  /** What the chip says. */
  readonly label: string;
  /** How it reads inside the composed sentence. */
  readonly phrase: string;
}

export interface DigitalBriefComposer {
  readonly repeatsLabel: string;
  readonly repeats: readonly DigitalBriefOption[];
  readonly helpLabel: string;
  readonly help: readonly DigitalBriefOption[];
  readonly previewLabel: string;
  readonly previewEmpty: string;
  /** `{repeats}` is replaced by the joined list of chosen work. */
  readonly sentenceRepeats: string;
  /** `{help}` is replaced by the chosen help phrase. */
  readonly sentenceHelp: string;
  /** When only the kind of help was chosen. */
  readonly sentenceHelpOnly: string;
  readonly sentenceEnd: string;
  /** Between list items, and before the last one. */
  readonly listSeparator: string;
  readonly listLast: string;
  readonly clear: string;
}

export interface DigitalContactForm {
  readonly name: string;
  readonly email: string;
  readonly phone: string;
  readonly message: string;
  readonly messageHint: string;
  readonly submit: string;
  readonly sending: string;
  readonly successTitle: string;
  readonly successBody: string;
  readonly another: string;
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

export interface DigitalSiteContent {
  readonly locale: "en" | "ar";
  readonly meta: {
    readonly siteName: string;
    readonly home: DigitalPageMeta;
    readonly services: DigitalPageMeta;
    readonly about: DigitalPageMeta;
    readonly contact: DigitalPageMeta;
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
  readonly hero: {
    readonly eyebrow: string;
    readonly title: readonly string[];
    readonly lede: string;
    readonly primary: DigitalLink;
    readonly secondary: DigitalLink;
    readonly scroll: string;
    readonly fieldLabel: string;
  };
  readonly statement: {
    readonly eyebrow: string;
    readonly lines: readonly string[];
  };
  readonly capabilities: {
    readonly eyebrow: string;
    readonly title: string;
    readonly intro: string;
    readonly items: readonly DigitalCapability[];
    readonly more: DigitalLink;
    readonly examplesLabel: string;
  };
  readonly approach: {
    readonly eyebrow: string;
    readonly title: string;
    readonly intro: string;
    readonly steps: readonly DigitalStep[];
  };
  readonly principles: {
    readonly eyebrow: string;
    readonly title: string;
    readonly items: readonly DigitalPrinciple[];
  };
  readonly group: {
    readonly eyebrow: string;
    readonly title: string;
    readonly body: string;
    readonly companies: readonly DigitalCompany[];
    readonly visit: string;
  };
  readonly closing: {
    readonly title: string;
    readonly body: string;
    readonly primary: DigitalLink;
  };
  readonly services: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lede: string;
    readonly notSureTitle: string;
    readonly notSureBody: string;
    readonly notSure: DigitalLink;
  };
  readonly about: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lede: string;
    readonly sections: readonly {
      readonly key: string;
      readonly title: string;
      readonly body: readonly string[];
    }[];
  };
  readonly contact: {
    readonly eyebrow: string;
    readonly title: string;
    readonly lede: string;
    readonly composer: DigitalBriefComposer;
    readonly form: DigitalContactForm;
    readonly afterTitle: string;
    readonly after: readonly string[];
  };
  readonly footer: {
    readonly siteHeading: string;
    readonly legalHeading: string;
    readonly groupHeading: string;
    readonly legal: readonly DigitalLink[];
    readonly clockLabel: string;
    readonly rights: string;
  };
  readonly notFound: {
    readonly code: string;
    readonly title: string;
    readonly body: string;
    readonly home: string;
  };
}

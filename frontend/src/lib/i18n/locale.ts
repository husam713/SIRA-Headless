import type { LocaleCode, SiteDefinition, SiteKey } from "@/types/site";

/**
 * How a request's language is decided, and how it travels.
 *
 * The URL owns the locale: `/ar/services` is Arabic, `/services` is the site's
 * default. That is the only signal — not a cookie, not Accept-Language, not a
 * stored preference — because a language a reader cannot link to, share or
 * bookmark is not a first-class language, and because a page that changes
 * language based on a header cannot be cached or indexed per locale.
 *
 * The proxy strips the prefix from the internal path and puts the resolved
 * locale in a request header instead, so every route is bilingual without the
 * route tree being duplicated under `/ar`. That header is stripped from inbound
 * requests before it is set, so a client cannot choose it by sending it.
 */

export const LOCALE_HEADER = "x-sira-locale";

/**
 * The request path with both prefixes removed — the site key the proxy adds and
 * the locale the proxy consumes.
 *
 * Set by the proxy because a Server Component cannot otherwise learn the path
 * it is rendering, and the language switch has to point at the same page in the
 * other language rather than at the homepage.
 */
export const PATH_HEADER = "x-sira-path";

/** Prefix segments that select a non-default locale. */
export const LOCALE_PREFIX: Readonly<Record<string, LocaleCode>> = Object.freeze({
  ar: "ar",
  en: "en",
});

export function isLocaleCode(value: string): value is LocaleCode {
  return value === "en" || value === "ar";
}

/**
 * Splits a public path into its locale and the rest.
 *
 * `/ar/services` becomes `{ locale: "ar", path: "/services" }`; `/services`
 * becomes `{ locale: null, path: "/services" }`. A bare `/ar` keeps `/` as its
 * path so the Arabic homepage is not a 404.
 */
export function splitLocalePath(pathname: string): {
  readonly locale: LocaleCode | null;
  readonly path: string;
} {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (first === undefined || !Object.hasOwn(LOCALE_PREFIX, first)) {
    return { locale: null, path: pathname };
  }

  const rest = segments.slice(1).join("/");

  return {
    locale: LOCALE_PREFIX[first] ?? null,
    path: rest === "" ? "/" : `/${rest}`,
  };
}

/** The locale a request resolved to, given what the proxy put in the header. */
export function resolveLocale(
  site: SiteDefinition,
  headerValue: string | null,
): LocaleCode {
  if (
    headerValue !== null &&
    isLocaleCode(headerValue) &&
    site.localeRoutesApproved &&
    site.supportedLocales.includes(headerValue)
  ) {
    return headerValue;
  }

  return site.defaultLocale;
}

/**
 * A public href for this locale. The default locale carries no prefix.
 *
 * The trailing slash is not cosmetic: this application runs with
 * `trailingSlash: true`, so `/ar` answers 308 to `/ar/`. Emitting the canonical
 * form here means the language switch — the one control a reader uses precisely
 * because they are struggling — costs one request rather than two.
 */
export function localeHref(
  site: SiteDefinition,
  locale: LocaleCode,
  path: string,
): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withSlash = normalized.endsWith("/") ? normalized : `${normalized}/`;

  if (locale === site.defaultLocale) return withSlash;

  return `/${locale}${withSlash}`;
}

/**
 * Where this locale's copy of a CMS record lives.
 *
 * ADR-034: a locale is a slug prefix inside the SAME WordPress site rather than
 * a second site or a translation plugin. One company, one editorial team, one
 * media library, and an Arabic page is an ordinary page an editor can find in
 * the admin — with no network-wide plugin decision imposed on the five tenants
 * that did not ask for one.
 */
export function localeUri(locale: LocaleCode, site: SiteDefinition, uri: string): string {
  const normalized = uri.startsWith("/") ? uri : `/${uri}`;

  if (locale === site.defaultLocale) return normalized;

  return normalized === "/" ? `/${locale}/` : `/${locale}${normalized}`;
}

/** BCP-47 tag for Intl formatting. Saudi Arabic, not generic Arabic. */
export function intlLocale(locale: LocaleCode): string {
  return locale === "ar" ? "ar-SA" : "en-SA";
}

export interface Chrome {
  readonly skipToContent: string;
  readonly switchLanguage: string;
  readonly switchLanguageShort: string;
  readonly switchLanguageHint: string;
  readonly contactCta: string;
  readonly primaryNav: string;
  readonly siteNav: string;
  readonly siteMenu: string;
  readonly openMenu: string;
  readonly closeMenu: string;
  readonly onThisPage: string;
  /**
   * The lead-in on every services block.
   *
   * It repeats on all ten, so no single service owns it editorially - which is
   * the test for whether a string belongs in here rather than in the CMS.
   */
  readonly currentChallenge: string;
  /**
   * Column labels on the industries register. They repeat on every row, so no
   * single row owns them editorially and they cannot come from a term's own
   * fields — which is the test for whether a string belongs in here at all.
   */
  /**
   * Furniture on the sector pages.
   *
   * All six repeat across every one of the twelve sectors, so no single sector
   * owns them editorially - the same test the labels below meet. A sector is a
   * taxonomy term and has no page-intro fields of its own to carry them.
   */
  readonly allIndustries: string;
  readonly automationWorkflow: string;
  readonly whatWeBuild: string;
  readonly typicalStack: string;
  readonly industryCtaHeading: string;
  readonly industryCtaLabel: string;
  readonly bottleneckLabel: string;
  readonly opportunityLabel: string;
  readonly previewMode: string;
  readonly exitPreview: string;
  readonly footerPages: string;
  readonly footerCompanies: string;
  readonly footerConnect: string;
  readonly allRightsReserved: string;
  readonly errorTitle: string;
  readonly errorBody: string;
  readonly tryAgain: string;
  readonly notFoundTitle: string;
  readonly notFoundBody: string;
  readonly featuredProjects: string;
  readonly previousProject: string;
  readonly nextProject: string;
  readonly pause: string;
  readonly play: string;
  readonly featuredVentures: string;
  /** `{index}`, `{count}` and `{title}` are substituted. */
  readonly showingSlide: string;
  readonly projects: string;
  readonly companies: string;
  readonly allProjects: string;
  readonly filterAll: string;
  readonly statusLabel: string;
  readonly yearLabel: string;
  readonly atAGlance: string;
  readonly gallery: string;
  readonly nextProjectLabel: string;
  readonly ticketSize: string;
  readonly requestPack: string;
  readonly whereWeWork: string;
  readonly startConversation: string;
  readonly viewProjects: string;
  readonly explore: string;
  readonly newsAndPerspectives: string;
  readonly fromTheDesk: string;
  readonly packLead: string;
  readonly packInvestorType: string;
  readonly packInvestorTypes: readonly string[];
  readonly packRange: string;
  readonly packRanges: readonly string[];
  readonly packCta: string;
  readonly packDone: string;
  readonly fullName: string;
  readonly emailAddress: string;
  readonly close: string;
  /** The first subject in a contact form's list: the route for anything else. */
  readonly generalEnquiry: string;
  /** Section fallbacks where the CMS eyebrow is empty. */
  readonly getInTouch: string;
  readonly investorRelations: string;
  readonly howItWorks: string;
  readonly contact: string;
  /** Editorial kinds, as the homepage insights chapter labels them. */
  readonly editorialKinds: Readonly<Record<"news" | "insight" | "article" | "press-release", string>>;
  readonly readMore: string;
  /**
   * Names that live in English in the registry, the brand presets and the
   * business-unit taxonomy, said in this language. Keyed by site key, by
   * business-unit slug and by the company operating status.
   */
  readonly siteNames: Readonly<Record<SiteKey, string>>;
  readonly businessUnits: Readonly<Record<string, string>>;
  readonly companyStatus: Readonly<Record<string, string>>;
}

/**
 * Interface strings the shell renders itself.
 *
 * Deliberately small. Everything a reader is here to read comes from the CMS;
 * this is only the furniture that has no editorial owner — a menu button's
 * accessible name, the skip link, the language switch. Growing this object is a
 * signal that something should have been content instead.
 */
export const CHROME: Readonly<Record<LocaleCode, Chrome>> = Object.freeze({
  en: Object.freeze({
    skipToContent: "Skip to main content",
    switchLanguage: "العربية",
    switchLanguageShort: "AR",
    switchLanguageHint: "اعرض هذه الصفحة بالعربية",
    contactCta: "Contact Us",
    primaryNav: "Primary",
    siteNav: "Site",
    siteMenu: "Site menu",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    onThisPage: "On this page",
    currentChallenge: "Current challenge:",
    allIndustries: "Industries",
    automationWorkflow: "Automation workflow",
    whatWeBuild: "What we build",
    typicalStack: "Typical stack",
    industryCtaHeading: "Have a workflow worth automating?",
    industryCtaLabel: "Book a free consultation",
    bottleneckLabel: "Where the time goes",
    opportunityLabel: "What can be done",
    previewMode: "Preview Mode",
    exitPreview: "Exit Preview",
    footerPages: "Pages",
    footerCompanies: "Companies",
    footerConnect: "Connect",
    allRightsReserved: "All rights reserved.",
    errorTitle: "This page could not be loaded.",
    errorBody: "Please try again. No private error details are displayed.",
    tryAgain: "Try again",
    notFoundTitle: "Page not found",
    notFoundBody: "The requested SIRA page does not exist.",
    featuredProjects: "Featured Projects",
    previousProject: "Previous featured project",
    nextProject: "Next featured project",
    pause: "Pause",
    play: "Play",
    featuredVentures: "Featured ventures",
    showingSlide: "Showing {index} of {count}: {title}",
    projects: "Projects",
    companies: "Companies",
    allProjects: "All projects",
    filterAll: "All",
    statusLabel: "Status",
    yearLabel: "Year",
    atAGlance: "At a glance",
    gallery: "Gallery",
    nextProjectLabel: "Next project",
    ticketSize: "Ticket size",
    requestPack: "Request the investor pack",
    whereWeWork: "Where we work",
    startConversation: "Start a conversation",
    viewProjects: "View projects",
    explore: "Explore",
    newsAndPerspectives: "News & perspectives",
    fromTheDesk: "From the {name} desk",
    packLead: "Tell us who you are and we will send the current pack and arrange an introduction.",
    packInvestorType: "Investor type",
    packInvestorTypes: ["Private / individual", "Family office", "Institutional"],
    packRange: "Indicative range",
    packRanges: ["$250K – $1M", "$1M – $5M", "$5M+"],
    packCta: "Request pack",
    packDone: "Requested — we will be in touch within two working days.",
    fullName: "Full name",
    emailAddress: "Email address",
    close: "Close",
    generalEnquiry: "General enquiry",
    getInTouch: "Get in Touch",
    investorRelations: "Investor relations",
    howItWorks: "How it works",
    contact: "Contact",
    editorialKinds: Object.freeze({
      news: "News",
      insight: "Insight",
      article: "Article",
      "press-release": "Press release",
    }),
    readMore: "Read More",
    siteNames: Object.freeze({
      group: "SIRA Group",
      consulting: "SIRA Consulting",
      healthcare: "SIRA Healthcare",
      lifestyle: "SIRA Lifestyle",
      realestate: "SIRA Real Estate",
      digital: "SIRA Digital",
    }),
    businessUnits: Object.freeze({
      consulting: "Consulting",
      healthcare: "Healthcare",
      lifestyle: "Lifestyle",
      "real-estate": "Real Estate",
      digital: "Digital",
    }),
    companyStatus: Object.freeze({
      active: "Active",
      comingSoon: "Coming soon",
      inactive: "Inactive",
    }),
  }),
  ar: Object.freeze({
    skipToContent: "تخطَّ إلى المحتوى الرئيسي",
    switchLanguage: "English",
    switchLanguageShort: "EN",
    switchLanguageHint: "View this page in English",
    contactCta: "تواصل معنا",
    primaryNav: "الرئيسية",
    siteNav: "الموقع",
    siteMenu: "قائمة الموقع",
    openMenu: "افتح القائمة",
    closeMenu: "أغلق القائمة",
    onThisPage: "في هذه الصفحة",
    currentChallenge: "التحدي الحالي:",
    allIndustries: "القطاعات",
    automationWorkflow: "مسار الأتمتة",
    whatWeBuild: "ما الذي نبنيه",
    typicalStack: "المنظومة التقنية",
    industryCtaHeading: "لديك عملية تستحق الأتمتة؟",
    industryCtaLabel: "احجز استشارة مجانية",
    bottleneckLabel: "أين يضيع الوقت",
    opportunityLabel: "ما الذي يمكن عمله",
    previewMode: "وضع المعاينة",
    exitPreview: "إنهاء المعاينة",
    footerPages: "الصفحات",
    footerCompanies: "الشركات",
    footerConnect: "تواصل",
    allRightsReserved: "جميع الحقوق محفوظة.",
    errorTitle: "تعذّر تحميل هذه الصفحة.",
    errorBody: "يرجى المحاولة مرة أخرى. لا تُعرض أي تفاصيل خاصة عن الخطأ.",
    tryAgain: "حاول مرة أخرى",
    notFoundTitle: "الصفحة غير موجودة",
    notFoundBody: "صفحة سيرا المطلوبة غير موجودة.",
    featuredProjects: "مشاريع مميزة",
    previousProject: "المشروع المميز السابق",
    nextProject: "المشروع المميز التالي",
    pause: "إيقاف مؤقت",
    play: "تشغيل",
    featuredVentures: "مشاريع مميزة",
    showingSlide: "عرض {index} من {count}: {title}",
    projects: "المشاريع",
    companies: "الشركات",
    allProjects: "كل المشاريع",
    filterAll: "الكل",
    statusLabel: "الحالة",
    yearLabel: "السنة",
    atAGlance: "لمحة سريعة",
    gallery: "معرض",
    nextProjectLabel: "المشروع التالي",
    ticketSize: "حجم الاستثمار",
    requestPack: "اطلب ملف المستثمر",
    whereWeWork: "أين نعمل",
    startConversation: "ابدأ محادثة",
    viewProjects: "استعرض المشاريع",
    explore: "استكشف",
    newsAndPerspectives: "أخبار ورؤى",
    fromTheDesk: "من مكتب {name}",
    packLead: "أخبرنا من أنت وسنرسل الملف الحالي ونرتب تعريفاً.",
    packInvestorType: "نوع المستثمر",
    packInvestorTypes: ["فرد / خاص", "مكتب عائلي", "مؤسسي"],
    packRange: "النطاق التقريبي",
    packRanges: ["$250K – $1M", "$1M – $5M", "$5M+"],
    packCta: "اطلب الملف",
    packDone: "تم الطلب — سنتواصل معك خلال يومي عمل.",
    fullName: "الاسم الكامل",
    emailAddress: "البريد الإلكتروني",
    close: "إغلاق",
    generalEnquiry: "استفسار عام",
    getInTouch: "تواصل معنا",
    investorRelations: "علاقات المستثمرين",
    howItWorks: "كيف نعمل",
    contact: "تواصل",
    editorialKinds: Object.freeze({
      news: "أخبار",
      insight: "رؤية",
      article: "مقال",
      "press-release": "بيان صحفي",
    }),
    readMore: "اقرأ المزيد",
    siteNames: Object.freeze({
      group: "مجموعة سيرة",
      consulting: "سيرة للاستشارات",
      healthcare: "سيرة للرعاية الصحية",
      lifestyle: "سيرة لايف ستايل",
      realestate: "سيرة العقارية",
      digital: "سيرة الرقمية",
    }),
    businessUnits: Object.freeze({
      consulting: "الاستشارات",
      healthcare: "الرعاية الصحية",
      lifestyle: "أسلوب الحياة",
      "real-estate": "العقارات",
      digital: "الرقمية",
    }),
    companyStatus: Object.freeze({
      active: "نشطة",
      comingSoon: "قريبًا",
      inactive: "غير نشطة",
    }),
  }),
});

/**
 * A business unit's name in the page's language. English keeps whatever the
 * CMS or the preset said — the term name is the editor's — and Arabic reads
 * the chrome, because the taxonomy is not localized (ADR-034 keeps terms
 * per record type, and `sira_business_unit` is shared across languages).
 */
export function localizeUnitLabel(
  locale: LocaleCode,
  slug: string | null,
  fallback: string | null,
): string | null {
  if (locale === "en" || slug === null) return fallback;
  return CHROME[locale].businessUnits[slug] ?? fallback;
}

/** A company's operating status as a badge, in the page's language. */
export function localizeCompanyStatus(locale: LocaleCode, status: string | null): string | null {
  if (status === null) return null;
  const key = status.trim();
  return CHROME[locale].companyStatus[key] ?? status;
}

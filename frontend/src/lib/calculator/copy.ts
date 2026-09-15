import type { IndustryKey, SizeKey } from "@/lib/calculator/model";
import type { LocaleCode } from "@/types/site";

/**
 * Every word the calculator says, in both languages.
 *
 * Separated from `model.ts` on purpose. The model is arithmetic and has no
 * opinion about language; this file has no opinion about arithmetic. Keeping
 * them apart is what let the Arabic build be a translation rather than a second
 * implementation of the maths.
 *
 * THE ENGLISH IS THE OWNER'S OWN, TAKEN VERBATIM off the reference. Two lines
 * in particular are load-bearing and must not be smoothed:
 *
 *   - `savingNote` — "Realised cost avoidance - not the notional value of every
 *     freed hour." That sentence is the only thing on the page that tells the
 *     reader the headline is already discounted, and it is describing the
 *     `REALISATION` constant, not hedging in the absence of one.
 *   - `disclaimerLead` / `disclaimer` — "Indicative estimate." followed by what
 *     the figures actually are. A calculator that will not say this is selling.
 *
 * Their punctuation is the reference's too: a hyphen where a typographer would
 * set an em dash. Copying it exactly is the point of "verbatim", and a silent
 * improvement is still a change to somebody else's words.
 *
 * The Arabic is business Arabic rather than a literal rendering, and it keeps
 * the same hedging the English does, because the hedging is the feature.
 */

export interface CalculatorCopy {
  /* ---------------------------------------------------------------- section */
  readonly sectionEyebrow: string;
  readonly sectionHeading: string;
  readonly sectionStandfirst: string;

  /* ----------------------------------------------------------------- inputs */
  readonly inputsTitle: string;
  readonly industry: string;
  readonly size: string;
  readonly team: string;
  readonly teamHint: string;
  /** Screen-reader value text for the team slider, e.g. "40 employees". */
  readonly teamValueText: (value: string) => string;
  readonly hours: string;
  readonly hoursHint: string;
  readonly hoursValueText: (value: string) => string;
  readonly advanced: string;
  readonly hourlyCost: string;
  readonly hourlyCostHint: string;
  readonly hourlyCostValueText: (value: string) => string;
  readonly currentAutomation: string;
  readonly currentAutomationHint: string;
  readonly currentAutomationValueText: (value: string) => string;
  readonly volumeNote: (volumes: {
    readonly leads: string;
    readonly calls: string;
    readonly documents: string;
  }) => string;

  /* ---------------------------------------------------------------- outputs */
  readonly outputsTitle: string;
  readonly savingLabel: string;
  readonly savingNote: string;
  readonly hoursSaved: string;
  readonly roi: string;
  readonly payback: string;
  readonly revenue: string;
  readonly leadResponse: string;
  readonly leadResponseSuffix: string;
  readonly coverage: string;
  readonly coverageNote: string;
  readonly productivity: string;
  readonly manualHoursTitle: string;
  readonly manualToday: string;
  readonly manualAfter: string;
  readonly projectionTitle: string;
  readonly projectionChartLabel: (total: string) => string;
  readonly firstMonth: string;
  readonly lastMonth: string;
  readonly recommendedTitle: string;

  /* ----------------------------------------------------------- calls to act */
  readonly bookSession: string;
  readonly downloadReport: string;
  readonly disclaimerLead: string;
  readonly disclaimer: string;

  /* ------------------------------------------------------------------ units */
  /** Appended straight onto a figure: `29,440h`, `18.2Kh`. */
  readonly hourUnit: string;
  readonly monthUnit: string;
  /** Shown instead of a number once payback passes the two-year ceiling. */
  readonly paybackBeyond: string;

  /* --------------------------------------------------------- the paper copy */
  readonly reportTitle: string;
  readonly reportInputsTitle: string;
  readonly reportGeneratedOn: (date: string) => string;

  /* ------------------------------------------------------------ vocabulary */
  readonly industries: Readonly<Record<IndustryKey, string>>;
  readonly sizes: Readonly<Record<SizeKey, string>>;
  /**
   * What the reference recommends per sector.
   *
   * A fixed list, captured verbatim for all twelve industries. It lives in the
   * copy rather than the model because it is a sentence, not a number: a model
   * that knows what a workflow is called in English is a model that cannot be
   * translated.
   */
  readonly recommended: Readonly<Record<IndustryKey, readonly string[]>>;
}

const EN: CalculatorCopy = Object.freeze<CalculatorCopy>({
  sectionEyebrow: "Before you write",
  sectionHeading: "See what automation could save.",
  sectionStandfirst:
    "Adjust a few details about your business to estimate your potential automation impact.",

  inputsTitle: "Your business",
  industry: "Industry",
  size: "Business size",
  team: "Team Size",
  teamHint: "People whose work automation would touch",
  teamValueText: (value) => `${value} employees`,
  hours: "Manual Hours Per Week",
  hoursHint: "Repetitive work per person, per week",
  hoursValueText: (value) => `${value} hrs/person`,
  advanced: "Advanced assumptions",
  hourlyCost: "Average Employee Hourly Cost",
  hourlyCostHint: "Fully loaded, including everything beyond salary",
  hourlyCostValueText: (value) => `$${value} per hour`,
  currentAutomation: "Current Automation Level",
  currentAutomationHint: "How much of this already runs without a person",
  currentAutomationValueText: (value) => `${value}% already automated`,
  volumeNote: ({ leads, calls, documents }) =>
    `Lead, call and document volumes are estimated from your team size - about ${leads} leads, ${calls} calls and ${documents} documents a month.`,

  outputsTitle: "Estimated impact",
  savingLabel: "Estimated annual savings",
  savingNote:
    "Realised cost avoidance - not the notional value of every freed hour.",
  hoursSaved: "Hours saved per year",
  roi: "First-year ROI",
  payback: "Payback period",
  revenue: "Revenue opportunity",
  leadResponse: "Lead response",
  leadResponseSuffix: "faster",
  coverage: "Automation coverage",
  coverageNote:
    "Share of repeatable operations that could run without manual intervention.",
  productivity: "Productivity improvement",
  manualHoursTitle: "Manual hours per year",
  manualToday: "Today",
  manualAfter: "With SIRA",
  projectionTitle: "Potential savings over 12 months",
  projectionChartLabel: (total) =>
    `Cumulative benefit rising to approximately ${total} by month twelve.`,
  firstMonth: "Month 1",
  lastMonth: "Month 12",
  recommendedTitle: "Recommended automations",

  bookSession: "Book a free AI strategy session",
  downloadReport: "Download the automation report",
  disclaimerLead: "Indicative estimate.",
  disclaimer:
    "Figures are modelled from your inputs using industry-typical assumptions for automatable workload, transaction handling time and implementation cost. They are not a quotation and not a guarantee of results - a scoping call replaces them with numbers based on your actual processes.",

  hourUnit: "h",
  monthUnit: "mo",
  paybackBeyond: "24+ mo",

  reportTitle: "Automation impact report",
  reportInputsTitle: "What this was calculated from",
  reportGeneratedOn: (date) => `Generated ${date}`,

  industries: Object.freeze({
    healthcare: "Healthcare",
    "real-estate": "Real Estate",
    manufacturing: "Manufacturing",
    retail: "Retail",
    education: "Education",
    finance: "Finance",
    hospitality: "Hospitality",
    construction: "Construction",
    "professional-services": "Professional Services",
    automotive: "Automotive",
    logistics: "Logistics",
    technology: "Technology",
  }),
  sizes: Object.freeze({
    startup: "Startup",
    small: "Small Business",
    growing: "Growing Business",
    enterprise: "Enterprise",
  }),
  recommended: Object.freeze({
    healthcare: Object.freeze([
      "AI Receptionist",
      "Appointment Automation",
      "CRM Automation",
      "Medical Document OCR",
      "WhatsApp Follow-up",
    ]),
    "real-estate": Object.freeze([
      "Lead Response AI",
      "Viewing Scheduler",
      "CRM Autopilot",
      "Contract OCR",
      "WhatsApp Nurture",
    ]),
    manufacturing: Object.freeze([
      "Production Dashboards",
      "Predictive Maintenance",
      "Supplier Workflow Automation",
      "Purchase Order OCR",
    ]),
    retail: Object.freeze([
      "Inventory Automation",
      "Customer Support AI",
      "Order Processing",
      "Marketing Automation",
      "WhatsApp Commerce",
    ]),
    education: Object.freeze([
      "Admissions AI",
      "Student Records OCR",
      "Enrolment Workflow",
      "Parent Communication Bot",
    ]),
    finance: Object.freeze([
      "KYC Document AI",
      "Onboarding Automation",
      "Compliance Workflow",
      "Reporting Dashboards",
    ]),
    hospitality: Object.freeze([
      "Booking AI",
      "Virtual Concierge",
      "Review Response Automation",
      "WhatsApp Reservations",
    ]),
    construction: Object.freeze([
      "Project Tracking",
      "Material Ordering Automation",
      "Blueprint Document AI",
      "Subcontractor Workflow",
    ]),
    "professional-services": Object.freeze([
      "Document Intelligence",
      "Client Onboarding AI",
      "Time & Billing Automation",
      "Proposal Generation",
    ]),
    automotive: Object.freeze([
      "Service Booking AI",
      "Parts Inventory Automation",
      "Garage CRM",
      "Follow-up Automation",
    ]),
    logistics: Object.freeze([
      "Route Optimisation",
      "Shipment Tracking AI",
      "Delivery Notification Bot",
      "Freight Document OCR",
    ]),
    technology: Object.freeze([
      "Support Triage AI",
      "API Integration Layer",
      "Onboarding Automation",
      "Usage Analytics",
    ]),
  }),
});

const AR: CalculatorCopy = Object.freeze<CalculatorCopy>({
  sectionEyebrow: "قبل أن تكتب",
  sectionHeading: "اطّلع على ما يمكن أن توفّره الأتمتة.",
  sectionStandfirst:
    "عدّل بعض التفاصيل عن منشأتك لتقدير الأثر المحتمل للأتمتة.",

  inputsTitle: "منشأتك",
  industry: "القطاع",
  size: "حجم المنشأة",
  team: "عدد الموظفين",
  teamHint: "من ستتغيّر طريقة عملهم بعد الأتمتة",
  teamValueText: (value) => `${value} موظفًا`,
  hours: "الساعات اليدوية أسبوعيًا",
  hoursHint: "العمل المتكرر لكل موظف في الأسبوع",
  hoursValueText: (value) => `${value} ساعة لكل موظف`,
  advanced: "افتراضات متقدمة",
  hourlyCost: "متوسط تكلفة ساعة الموظف",
  hourlyCostHint: "التكلفة الإجمالية، شاملة ما هو أبعد من الراتب",
  hourlyCostValueText: (value) => `${value} دولارًا للساعة`,
  currentAutomation: "مستوى الأتمتة الحالي",
  currentAutomationHint: "كم من هذا العمل يجري اليوم من دون تدخّل بشري",
  currentAutomationValueText: (value) => `${value}% مؤتمت بالفعل`,
  volumeNote: ({ leads, calls, documents }) =>
    `تُقدَّر أحجام الطلبات والمكالمات والمستندات من عدد موظفيك - نحو ${leads} طلبًا و${calls} مكالمة و${documents} مستندًا شهريًا.`,

  outputsTitle: "الأثر التقديري",
  savingLabel: "التوفير السنوي التقديري",
  savingNote: "تكلفة مُتفاداة فعليًا - لا القيمة الاسمية لكل ساعة مُحرَّرة.",
  hoursSaved: "ساعات موفَّرة سنويًا",
  roi: "العائد في السنة الأولى",
  payback: "فترة الاسترداد",
  revenue: "فرصة إيرادية",
  leadResponse: "زمن الاستجابة للطلبات",
  leadResponseSuffix: "أسرع",
  coverage: "تغطية الأتمتة",
  coverageNote:
    "نسبة العمليات المتكررة التي يمكن أن تجري من دون تدخّل يدوي.",
  productivity: "تحسّن الإنتاجية",
  manualHoursTitle: "الساعات اليدوية سنويًا",
  manualToday: "اليوم",
  manualAfter: "مع سيرا",
  projectionTitle: "التوفير المحتمل خلال 12 شهرًا",
  projectionChartLabel: (total) =>
    `العائد التراكمي يرتفع إلى ما يقارب ${total} في الشهر الثاني عشر.`,
  firstMonth: "الشهر 1",
  lastMonth: "الشهر 12",
  recommendedTitle: "الأتمتة المقترحة",

  bookSession: "احجز جلسة استراتيجية مجانية",
  downloadReport: "نزّل تقرير الأتمتة",
  disclaimerLead: "تقدير استرشادي.",
  disclaimer:
    "الأرقام محسوبة من مدخلاتك وفق افتراضات معتادة في القطاع عن حجم العمل القابل للأتمتة، وزمن معالجة المعاملات، وكلفة التنفيذ. وهي ليست عرض سعر ولا ضمانًا لأي نتيجة - جلسة تحديد النطاق تستبدلها بأرقام مبنية على عملياتك الفعلية.",

  hourUnit: " ساعة",
  monthUnit: "شهر",
  paybackBeyond: "أكثر من 24 شهرًا",

  reportTitle: "تقرير أثر الأتمتة",
  reportInputsTitle: "ما حُسب هذا التقرير بناءً عليه",
  reportGeneratedOn: (date) => `صدر في ${date}`,

  industries: Object.freeze({
    healthcare: "الرعاية الصحية",
    "real-estate": "العقار",
    manufacturing: "التصنيع",
    retail: "التجزئة",
    education: "التعليم",
    finance: "التمويل",
    hospitality: "الضيافة",
    construction: "المقاولات",
    "professional-services": "الخدمات المهنية",
    automotive: "السيارات",
    logistics: "الخدمات اللوجستية",
    technology: "التقنية",
  }),
  sizes: Object.freeze({
    startup: "منشأة ناشئة",
    small: "منشأة صغيرة",
    growing: "منشأة نامية",
    enterprise: "منشأة كبيرة",
  }),
  recommended: Object.freeze({
    healthcare: Object.freeze([
      "موظف استقبال ذكي",
      "أتمتة المواعيد",
      "أتمتة إدارة العملاء",
      "قراءة المستندات الطبية آليًا",
      "متابعة عبر واتساب",
    ]),
    "real-estate": Object.freeze([
      "استجابة ذكية للطلبات",
      "جدولة المعاينات",
      "قيادة آلية لإدارة العملاء",
      "قراءة العقود آليًا",
      "متابعة عبر واتساب",
    ]),
    manufacturing: Object.freeze([
      "لوحات متابعة الإنتاج",
      "الصيانة التنبؤية",
      "أتمتة مسارات المورّدين",
      "قراءة أوامر الشراء آليًا",
    ]),
    retail: Object.freeze([
      "أتمتة المخزون",
      "دعم عملاء ذكي",
      "معالجة الطلبات",
      "أتمتة التسويق",
      "تجارة عبر واتساب",
    ]),
    education: Object.freeze([
      "قبول ذكي",
      "قراءة سجلات الطلاب آليًا",
      "مسار التسجيل",
      "روبوت تواصل مع أولياء الأمور",
    ]),
    finance: Object.freeze([
      "ذكاء اصطناعي لمستندات اعرف عميلك",
      "أتمتة تهيئة العملاء",
      "مسار الالتزام التنظيمي",
      "لوحات التقارير",
    ]),
    hospitality: Object.freeze([
      "حجوزات ذكية",
      "كونسيرج افتراضي",
      "أتمتة الرد على التقييمات",
      "حجوزات عبر واتساب",
    ]),
    construction: Object.freeze([
      "متابعة المشاريع",
      "أتمتة طلب المواد",
      "ذكاء اصطناعي لمستندات المخططات",
      "مسار مقاولي الباطن",
    ]),
    "professional-services": Object.freeze([
      "ذكاء المستندات",
      "تهيئة ذكية للعملاء",
      "أتمتة الوقت والفوترة",
      "توليد العروض",
    ]),
    automotive: Object.freeze([
      "حجز خدمة ذكي",
      "أتمتة مخزون القطع",
      "إدارة عملاء الورشة",
      "أتمتة المتابعة",
    ]),
    logistics: Object.freeze([
      "تحسين المسارات",
      "تتبّع ذكي للشحنات",
      "روبوت إشعارات التسليم",
      "قراءة مستندات الشحن آليًا",
    ]),
    technology: Object.freeze([
      "فرز ذكي لطلبات الدعم",
      "طبقة تكامل واجهات البرمجة",
      "أتمتة التهيئة",
      "تحليلات الاستخدام",
    ]),
  }),
});

export const CALCULATOR_COPY: Readonly<Record<LocaleCode, CalculatorCopy>> =
  Object.freeze({ en: EN, ar: AR });

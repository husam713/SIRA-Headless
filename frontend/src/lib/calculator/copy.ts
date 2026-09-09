import {
  CURRENCY,
  type Assumption,
  type IndustryKey,
  type SizeKey,
  type WorkflowKey,
} from "@/lib/calculator/model";
import type { LocaleCode } from "@/types/site";

/**
 * Every word the calculator says, in both languages.
 *
 * Separated from `model.ts` on purpose. The model is arithmetic and has no
 * opinion about language; this file has no opinion about arithmetic. Keeping
 * them apart is what let the Arabic build be a translation rather than a second
 * implementation of the maths — and it is the only reason the assumption list
 * can be honest in two languages at once.
 *
 * The Arabic here is business Arabic rather than a literal rendering of the
 * English: "أين يضيع الوقت" is what somebody would actually ask, and the
 * translated sentences below keep the same hedging the English does, because
 * the hedging is the point of the feature.
 */

interface CalculatorCopy {
  readonly sectionEyebrow: string;
  readonly sectionHeading: string;
  readonly sectionStandfirst: string;

  readonly industry: string;
  readonly size: string;
  readonly people: string;
  readonly peopleHint: string;
  readonly hours: string;
  readonly hoursHint: string;
  readonly exactSuffix: string;
  readonly scope: string;

  readonly headlineLabel: string;
  readonly headlineNote: string;
  readonly hoursReleased: string;
  readonly ofWorkload: string;
  readonly payback: string;
  readonly productivity: string;
  readonly manualHoursTitle: string;
  readonly manualToday: string;
  readonly manualAfter: string;
  readonly projectionTitle: string;
  readonly projectionNote: string;
  readonly recommendedTitle: string;
  readonly recommendedNote: string;
  readonly monthAbbrev: string;
  readonly monthsAbbreviation: string;
  readonly buildLabel: string;
  readonly buildAcross: (count: number) => string;
  readonly noScope: string;

  readonly showAssumptions: string;
  readonly hideAssumptions: string;
  readonly disclaimer: string;

  readonly industries: Readonly<Record<IndustryKey, string>>;
  readonly sizes: Readonly<Record<SizeKey, string>>;
  readonly workflows: Readonly<Record<WorkflowKey, string>>;
  readonly assumption: (
    assumption: Assumption,
    format: NumberFormatters,
  ) => string;
}

/** Locale-aware formatters supplied by the component that already has them. */
export interface NumberFormatters {
  readonly count: (value: number) => string;
  readonly money: (value: number) => string;
  readonly percent: (value: number) => string;
}

/**
 * The English wording for one assumption.
 *
 * A named function rather than an inline property so its parameters are
 * typed and the switch can be proven exhaustive: an `Assumption` kind added
 * later fails to compile here instead of silently rendering nothing.
 */
function assumptionEn(
  assumption: Assumption,
  format: NumberFormatters,
): string {
  switch (assumption.kind) {
    case "workload":
      return `${format.count(assumption.people)} people × ${format.count(assumption.hoursPerWeek)} repetitive hours per week × ${format.count(assumption.weeksPerYear)} working weeks.`;
    case "coverage":
      return `Selected workflows cover ${format.percent(assumption.percent)} of that manual workload, after an industry and size adjustment, capped at ${format.percent(assumption.ceilingPercent)}.`;
    case "realisation":
      return `Only ${format.percent(assumption.percent)} of released hours are counted as realised cost avoidance — the rest is absorbed rather than saved.`;
    case "hourly-cost":
      return `Fully-loaded cost of ${format.count(assumption.low)}–${format.count(assumption.high)} ${CURRENCY} per hour.`;
    case "build-cost":
      return `Indicative build of ${format.count(assumption.low)}–${format.count(assumption.high)} ${CURRENCY} per workflow.`;
  }
}

/**
 * The Arabic wording for one assumption.
 *
 * A named function rather than an inline property so its parameters are
 * typed and the switch can be proven exhaustive: an `Assumption` kind added
 * later fails to compile here instead of silently rendering nothing.
 */
function assumptionAr(
  assumption: Assumption,
  format: NumberFormatters,
): string {
  switch (assumption.kind) {
    case "workload":
      return `${format.count(assumption.people)} موظف × ${format.count(assumption.hoursPerWeek)} ساعة متكررة أسبوعيًا × ${format.count(assumption.weeksPerYear)} أسبوع عمل.`;
    case "coverage":
      return `مسارات العمل المختارة تغطي ${format.percent(assumption.percent)} من ذلك العمل اليدوي، بعد تعديل حسب القطاع والحجم، وبحد أقصى ${format.percent(assumption.ceilingPercent)}.`;
    case "realisation":
      return `تُحتسب ${format.percent(assumption.percent)} فقط من الساعات المُحرَّرة كتكلفة مُتفاداة فعليًا؛ والباقي يُستوعَب في عمل آخر.`;
    case "hourly-cost":
      return `تكلفة إجمالية للساعة تتراوح بين ${format.count(assumption.low)} و${format.count(assumption.high)} ${CURRENCY}.`;
    case "build-cost":
      return `كلفة تنفيذ تقديرية تتراوح بين ${format.count(assumption.low)} و${format.count(assumption.high)} ${CURRENCY} لكل مسار عمل.`;
  }
}

const EN: CalculatorCopy = Object.freeze<CalculatorCopy>({
  sectionEyebrow: "Before you write",
  sectionHeading: "What would this be worth?",
  sectionStandfirst:
    "A deliberately conservative model. It counts only the fraction of released time a business actually converts into avoided cost, caps what automation can reach, and shows you every assumption it made.",

  industry: "Industry",
  size: "Organisation size",
  people: "People this touches",
  peopleHint: "Everyone whose work the automation would change.",
  hours: "Repetitive hours each, per week",
  hoursHint: "Time spent on work that follows the same steps every time.",
  exactSuffix: "exact",
  scope: "Where the time goes",

  headlineLabel: "Indicative annual saving",
  headlineNote:
    "Realised cost avoidance — not the notional value of every freed hour. Most released time is absorbed rather than saved, and this figure already accounts for that.",
  hoursReleased: "Hours released a year",
  ofWorkload: "Of the manual workload",
  payback: "Payback",
  productivity: "Capacity released",
  manualHoursTitle: "Manual hours a year",
  manualToday: "Today",
  manualAfter: "After",
  projectionTitle: "Cumulative position over 12 months",
  projectionNote:
    "Net of the indicative build cost, so the line starts below zero and crosses it at payback.",
  recommendedTitle: "Where to start",
  recommendedNote: "Ordered by how much of the manual workload each one removes.",
  monthAbbrev: "M",
  monthsAbbreviation: "mo",
  buildLabel: "Indicative build",
  buildAcross: (count) =>
    count === 1 ? "across 1 workflow" : `across ${String(count)} workflows`,
  noScope:
    "Choose at least one place the time goes. Without a scope there is nothing to estimate, and an average would be a guess dressed as a number.",

  showAssumptions: "Show every assumption",
  hideAssumptions: "Hide assumptions",
  disclaimer:
    "Indicative only. This is a model, not a quotation, not a forecast and not a guarantee of any outcome. Real figures come from looking at your actual process.",

  industries: Object.freeze({
    healthcare: "Healthcare",
    "real-estate": "Real estate",
    hospitality: "Hospitality",
    retail: "Retail and distribution",
    logistics: "Logistics",
    construction: "Construction",
    "professional-services": "Professional services",
    education: "Education",
    manufacturing: "Manufacturing",
    other: "Something else",
  }),
  sizes: Object.freeze({
    small: "Under 20 people",
    growing: "20 to 100 people",
    established: "100 to 500 people",
    enterprise: "Over 500 people",
  }),
  workflows: Object.freeze({
    approvals: "Approvals and handovers",
    documents: "Document handling",
    "customer-enquiries": "Customer enquiries",
    reporting: "Reporting and reconciliation",
    "field-capture": "Field and site capture",
  }),

  assumption: assumptionEn,
});

const AR: CalculatorCopy = Object.freeze<CalculatorCopy>({
  sectionEyebrow: "قبل أن تكتب",
  sectionHeading: "كم تساوي هذه الأتمتة؟",
  sectionStandfirst:
    "نموذج متحفّظ عن قصد. يحتسب فقط الجزء الذي تحوّله المنشأة فعليًا من الوقت المُحرَّر إلى تكلفة مُتفاداة، ويضع سقفًا لما تستطيع الأتمتة الوصول إليه، ويعرض عليك كل افتراض استند إليه.",

  industry: "القطاع",
  size: "حجم المنشأة",
  people: "عدد الموظفين المتأثرين",
  peopleHint: "كل من ستتغيّر طريقة عمله بعد الأتمتة.",
  hours: "الساعات المتكررة أسبوعيًا لكل موظف",
  hoursHint: "الوقت المصروف على عمل يتبع الخطوات نفسها في كل مرة.",
  exactSuffix: "قيمة دقيقة",
  scope: "أين يضيع الوقت",

  headlineLabel: "التوفير السنوي التقديري",
  headlineNote:
    "تكلفة مُتفاداة فعليًا، لا القيمة الاسمية لكل ساعة مُحرَّرة. معظم الوقت المُحرَّر يُستوعَب في عمل آخر بدل أن يُوفَّر، وهذا الرقم يأخذ ذلك في الحسبان.",
  hoursReleased: "ساعات مُحرَّرة سنويًا",
  ofWorkload: "من العمل اليدوي",
  payback: "فترة الاسترداد",
  productivity: "طاقة مُحرَّرة",
  manualHoursTitle: "الساعات اليدوية سنويًا",
  manualToday: "اليوم",
  manualAfter: "بعد الأتمتة",
  projectionTitle: "الوضع التراكمي خلال 12 شهرًا",
  projectionNote:
    "بعد خصم التكلفة التقديرية للبناء، فيبدأ الخط تحت الصفر ويعبره عند نقطة الاسترداد.",
  recommendedTitle: "من أين تبدأ",
  recommendedNote: "مرتّبة حسب حجم العمل اليدوي الذي يزيله كل منها.",
  monthAbbrev: "ش",
  monthsAbbreviation: "شهرًا",
  buildLabel: "كلفة التنفيذ التقديرية",
  buildAcross: (count) =>
    count === 1 ? "لمسار عمل واحد" : `عبر ${String(count)} مسارات عمل`,
  noScope:
    "اختر موضعًا واحدًا على الأقل يضيع فيه الوقت. من دون نطاق محدّد لا يوجد ما يُقدَّر، وأي متوسط سيكون تخمينًا في هيئة رقم.",

  showAssumptions: "اعرض كل الافتراضات",
  hideAssumptions: "أخفِ الافتراضات",
  disclaimer:
    "تقديري فقط. هذا نموذج حسابي، وليس عرض سعر ولا توقّعًا ولا ضمانًا لأي نتيجة. الأرقام الحقيقية تأتي من دراسة عمليتك الفعلية.",

  industries: Object.freeze({
    healthcare: "الرعاية الصحية",
    "real-estate": "العقار",
    hospitality: "الضيافة",
    retail: "التجزئة والتوزيع",
    logistics: "الخدمات اللوجستية",
    construction: "المقاولات",
    "professional-services": "الخدمات المهنية",
    education: "التعليم",
    manufacturing: "التصنيع",
    other: "قطاع آخر",
  }),
  sizes: Object.freeze({
    small: "أقل من ٢٠ موظفًا",
    growing: "من ٢٠ إلى ١٠٠ موظف",
    established: "من ١٠٠ إلى ٥٠٠ موظف",
    enterprise: "أكثر من ٥٠٠ موظف",
  }),
  workflows: Object.freeze({
    approvals: "الاعتمادات والتسليم",
    documents: "معالجة المستندات",
    "customer-enquiries": "طلبات العملاء",
    reporting: "التقارير والتسويات",
    "field-capture": "الرصد الميداني",
  }),

  assumption: assumptionAr,
});

export const CALCULATOR_COPY: Readonly<Record<LocaleCode, CalculatorCopy>> =
  Object.freeze({ en: EN, ar: AR });

export type { CalculatorCopy };

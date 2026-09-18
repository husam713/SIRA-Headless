import type { LocaleCode } from "@/types/site";

/**
 * What the newsroom says around the entries, per language. The entries
 * themselves are whatever language they were written in (ADR-037); these are
 * the masthead, the filters, the counts and the link labels the owner's
 * newsroom design carries.
 */
export interface NewsroomCopy {
  readonly title: string;
  readonly newsroom: string;
  readonly latest: string;
  readonly readTheStory: string;
  readonly allDesks: string;
  readonly everything: string;
  readonly filterByDesk: string;
  readonly filterByFormat: string;
  readonly keepExploring: string;
  readonly keepExploringLead: (brand: string) => string;
  readonly stories: (count: number) => string;
  readonly entries: (count: number) => string;
  readonly viewAll: string;
  readonly nothingYet: (brand: string) => string;
  readonly nothingFor: (label: string) => string;
  readonly couldNotLoad: string;
  readonly desk: string;
  readonly format: string;
  readonly published: string;
  readonly readingTime: (minutes: number) => string;
  readonly summaryOnly: string;
  readonly inThisArticle: string;
  readonly articleDetails: string;
  readonly onThisPage: string;
  readonly exploreAll: string;
  readonly deskOf: (desk: string) => string;
  readonly updated: (date: string) => string;
  readonly moreFrom: (desk: string) => string;
}

const EN: NewsroomCopy = Object.freeze({
  title: "Insights",
  newsroom: "Newsroom",
  latest: "Latest insights",
  readTheStory: "Read the story",
  allDesks: "All desks",
  everything: "Everything",
  filterByDesk: "Filter insights by desk",
  filterByFormat: "Filter insights by format",
  keepExploring: "Keep exploring.",
  keepExploringLead: (brand: string) => `${brand} perspectives, updates and analysis.`,
  stories: (count: number) => `${String(count)} ${count === 1 ? "story" : "stories"}`,
  entries: (count: number) => `${String(count)} ${count === 1 ? "ENTRY" : "ENTRIES"}`,
  viewAll: "View all insights",
  nothingYet: (brand: string) => `${brand} has not published anything yet.`,
  nothingFor: (label: string) => `Nothing filed under ${label} yet.`,
  couldNotLoad: "The insights could not be loaded just now. Please try again shortly.",
  desk: "Desk",
  format: "Format",
  published: "Published",
  readingTime: (minutes: number) => `${String(minutes)} min read`,
  summaryOnly: "This entry was filed as a summary only.",
  inThisArticle: "In this article",
  articleDetails: "Article details",
  onThisPage: "On this page",
  exploreAll: "Explore all insights",
  deskOf: (desk: string) => `${desk} desk`,
  updated: (date: string) => `Updated ${date}`,
  moreFrom: (desk: string) => `More from ${desk}`,
});

const AR: NewsroomCopy = Object.freeze({
  title: "رؤى",
  newsroom: "غرفة الأخبار",
  latest: "أحدث الرؤى",
  readTheStory: "اقرأ القصة",
  allDesks: "كل المكاتب",
  everything: "الكل",
  filterByDesk: "تصفية الرؤى حسب المكتب",
  filterByFormat: "تصفية الرؤى حسب النوع",
  keepExploring: "واصل الاستكشاف.",
  keepExploringLead: (brand: string) => `رؤى ${brand} ومستجداتها وتحليلاتها.`,
  stories: (count: number) => `${String(count)} ${count === 1 ? "قصة" : count === 2 ? "قصتان" : count <= 10 ? "قصص" : "قصة"}`,
  entries: (count: number) => `${String(count)} ${count === 1 ? "مدخل" : count === 2 ? "مدخلان" : count <= 10 ? "مداخل" : "مدخلًا"}`,
  viewAll: "عرض كل الرؤى",
  nothingYet: (brand: string) => `لم تنشر ${brand} شيئًا بعد.`,
  nothingFor: (label: string) => `لا شيء تحت ${label} بعد.`,
  couldNotLoad: "تعذّر تحميل الرؤى الآن. يُرجى المحاولة بعد قليل.",
  desk: "المكتب",
  format: "النوع",
  published: "تاريخ النشر",
  readingTime: (minutes: number) => `${String(minutes)} دقائق قراءة`,
  summaryOnly: "أُودع هذا المدخل كملخص فقط.",
  inThisArticle: "في هذا المقال",
  articleDetails: "تفاصيل المقال",
  onThisPage: "في هذه الصفحة",
  exploreAll: "استعرض كل الرؤى",
  deskOf: (desk: string) => `مكتب ${desk}`,
  updated: (date: string) => `حُدِّث في ${date}`,
  moreFrom: (desk: string) => `المزيد من ${desk}`,
});

export const NEWSROOM_COPY: Readonly<Record<LocaleCode, NewsroomCopy>> = Object.freeze({ en: EN, ar: AR });

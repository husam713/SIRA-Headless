import type { DigitalSiteContent } from "@/content/digital-site/types";

/**
 * سيرة الرقمية — العربية: الإطار المشترك بين الصفحات.
 *
 * Written as business Arabic, not rendered from the English. Same shape and
 * the same keys/hrefs as `en/common.ts` (tests/unit/digital-site/content.test.ts).
 * PROVISIONAL until the owner approves the copy.
 */
export const COMMON_AR = {
  meta: {
    siteName: "سيرة الرقمية",
    pages: {
      home: {
        title: "سيرة الرقمية — ERPNext وأتمتة الأعمال للمؤسسات السعودية",
        description:
          "تطبّق سيرة الرقمية نظام ERPNext وتؤتمت الموافقات والمستندات والتقارير للمؤسسات في المملكة العربية السعودية، بالعربية والإنجليزية، جاهزًا للفوترة الإلكترونية، ومستضافًا حيث تقتضي سياساتكم.",
      },
      services: {
        title: "الحلول",
        description:
          "تطبيق ERPNext وأتمتة سير العمل والربط والتقارير والدعم: ما تقترح سيرة الرقمية تقديمه، وما يشمله كل مسار، ومن أين يبدأ المشروع.",
      },
      erpnext: {
        title: "تطبيق ERPNext",
        description:
          "كيف تطبّق سيرة الرقمية نظام ERPNext وإطار Frappe للمؤسسات في المملكة: الوحدات، والمتطلبات السعودية، ونقل البيانات، والاستضافة، والتطبيقات المخصصة.",
      },
      automation: {
        title: "أتمتة الأعمال",
        description:
          "موافقات والتقاط مستندات وعمليات ربط وتقارير مجدولة مبنية حول نظامكم، ويبقى كل قرار يحتاج إلى تقدير بيد شخص.",
      },
      industries: {
        title: "القطاعات",
        description:
          "كيف تحمل وحدات النظام نفسها أعمالًا مختلفة في التجارة والتوزيع، والمقاولات، والتصنيع، والخدمات المهنية، ومقدّمي الرعاية الصحية، والتجزئة والضيافة، والعقارات.",
      },
      method: {
        title: "المنهجية",
        description:
          "المراحل الخمس من أول محادثة إلى نظام يعمل، وما تستلمونه وما نحتاجه منكم في كل مرحلة.",
      },
      about: {
        title: "الشركة",
        description:
          "سيرة الرقمية هي الشركة التقنية في مجموعة سيرة، وتطبّق أنظمة الأعمال للمؤسسات في المملكة العربية السعودية.",
      },
      contact: {
        title: "اطلب جلسة استكشاف",
        description:
          "صفوا وضع عملياتكم اليوم. يقرأ شخص كل طلب ويردّ بالبريد الإلكتروني لترتيب جلسة استكشاف.",
      },
    },
  },

  brand: {
    wordmark: "سيرة الرقمية",
    echo: "SIRA Digital",
    groupName: "مجموعة سيرة",
    groupCompany: "إحدى شركات مجموعة سيرة",
    tagline: "أنظمة أعمال للمؤسسات في المملكة العربية السعودية.",
  },

  nav: {
    home: "الرئيسية",
    label: "القائمة الرئيسية",
    items: [
      { label: "الحلول", href: "/services/" },
      { label: "نظام ERPNext", href: "/erpnext/" },
      { label: "الأتمتة", href: "/automation/" },
      { label: "القطاعات", href: "/industries/" },
      { label: "المنهجية", href: "/method/" },
      { label: "الشركة", href: "/about/" },
    ],
    start: { label: "اطلب جلسة استكشاف", href: "/contact/" },
    menu: "القائمة",
    close: "إغلاق",
    skip: "انتقل إلى المحتوى",
    language: {
      label: "English",
      hint: "اقرأ هذه الصفحة بالإنجليزية",
    },
  },

  common: {
    illustrative: "توضيحي: بيانات نموذجية، وليست لعميل",
    related: "تابع إلى",
    closing: {
      title: "ابدأ بجلسة استكشاف",
      intro:
        "أخبرونا كيف يجري العمل اليوم. نردّ ببعض الأسئلة، ثم نلتقي لنحدد أين يساعد النظام أولًا.",
      steps: [
        "تصفون وضع عملياتكم.",
        "نقرأ ما كتبتم ونردّ بالبريد الإلكتروني.",
        "نلتقي لنرسم عملياتكم ونتفق على ما يأتي أولًا.",
      ],
      primary: { label: "اطلب جلسة استكشاف", href: "/contact/" },
    },
  },

  footer: {
    solutionsHeading: "الحلول",
    companyHeading: "الصفحات",
    groupHeading: "مجموعة سيرة",
    legalHeading: "قانوني",
    legal: [
      { label: "الخصوصية", href: "/privacy/" },
      { label: "الشروط", href: "/terms/" },
    ],
    rights: "سيرة الرقمية، إحدى شركات مجموعة سيرة.",
    provisional: "نموذج أولي للمراجعة. المحتوى مبدئي حتى يُعتمد.",
  },

  notFound: {
    code: "غير موجودة",
    title: "هذه الصفحة ليست جزءًا من النظام.",
    body: "ربما كُتب العنوان خطأً، أو نُقلت الصفحة. هذه هي الصفحات الموجودة:",
    home: "الذهاب إلى الصفحة الرئيسية",
    suggestions: "صفحات هذا الموقع",
  },
} satisfies Pick<DigitalSiteContent, "meta" | "brand" | "nav" | "common" | "footer" | "notFound">;

import type { DigitalSiteContent } from "@/content/digital-site/types";

/**
 * سيرة الرقمية — العربية: نصوص المثالين التوضيحيين.
 *
 * Both demonstrations are ILLUSTRATIVE (see `en/demos.ts`). Escalation times
 * are all 11 hours or more, so «ساعة» is grammatically right after every
 * number the simulator can show.
 */
export const DEMOS_AR = {
  demos: {
    workflow: {
      title: "شاهد طلب شراء يجد طريقه",
      intro:
        "غيّروا المبلغ أو الفئة فيتغير المسار معها. هذه القواعد مثال، وفي نظامكم تكون قواعدكم أنتم، تُكتب مرة واحدة وتُطبَّق على كل طلب.",
      note: "قواعد توضيحية، تُعدّ بشكل مختلف لكل عميل.",
      request: {
        heading: "طلب شراء",
        item: "أجهزة مكتبية لفريق المالية",
        requester: "مقدَّم من إدارة المالية",
      },
      amountLabel: "المبلغ",
      amountHint: "حرّكوا المؤشر أو اكتبوا مبلغًا.",
      currency: "ر.س",
      categoryLabel: "ما الذي يُشترى",
      categories: [
        { key: "stock", label: "أصناف مخزون" },
        { key: "services", label: "خدمات" },
        { key: "asset", label: "معدات وأصول" },
      ],
      urgentLabel: "عاجل",
      urgentHint: "يقصّر المدة قبل تصعيد الخطوة المنتظرة.",
      routeHeading: "مسار هذا الطلب",
      routeSummary: "عدد الموافقات قبل إصدار الأمر: {count}",
      escalates: "يُصعَّد بعد",
      hours: "ساعة",
      roles: {
        requester: "مقدّم الطلب",
        manager: "مدير الإدارة",
        procurement: "المشتريات",
        finance: "المدير المالي",
        general: "المدير العام",
        system: "النظام",
      },
      steps: {
        submit: "يقدّم الطلب",
        manager: "يوافق على الطلب",
        quotations: "يجمع عروض أسعار الموردين",
        budget: "يراجع الميزانية والرسملة",
        general: "يعطي الموافقة النهائية",
        order: "يُصدر أمر الشراء",
      },
      reasons: {
        always: "كل طلب يبدأ من هنا.",
        manager: "يحتاج كل طلب أولًا إلى موافقة إدارته.",
        quotations: "المبالغ من {limit} تحتاج إلى عروض أسعار منافسة.",
        asset: "المعدات تصبح أصلًا ثابتًا، فتراجعها المالية.",
        general: "المبالغ من {limit} تحتاج إلى موافقة المدير العام.",
        order: "يُنشأ تلقائيًا بعد تسجيل آخر موافقة.",
      },
      states: {
        pending: "بانتظار",
        approved: "تم",
      },
      run: "أرسل الطلب",
      done: "صدر أمر الشراء {reference}.",
      reset: "إعادة المثال",
    },

    dashboard: {
      title: "ما يفتحه المدير العام صباح الأحد",
      intro:
        "مشهد واحد تغذّيه السجلات نفسها التي تعمل عليها الفرق. يمكن تتبع كل رقم إلى المستندات التي وراءه، فيبدأ الاجتماع بالقرارات لا بالمطابقات.",
      stamp: "بيانات نموذجية، وليست لعميل.",
      company: "شركة المثال التجارية (شركة افتراضية)",
      period: "منذ بداية الأسبوع",
      sourceLabel: "من أين يأتي هذا الرقم",
      tiles: {
        cash: {
          label: "النقد في الحسابات البنكية",
          note: "مطابَق مع كشوف الأمس.",
          sources: ["تسوية بنكية", "قيد دفع"],
        },
        overdue: {
          label: "ذمم مدينة متأخرة",
          note: "عملاء تجاوزوا شروط السداد.",
          sources: ["فاتورة مبيعات", "قيد دفع", "حد ائتمان العميل"],
        },
        approvals: {
          label: "طلبات بانتظار الموافقة",
          note: "أقدمها ينتظر منذ الخميس.",
          sources: ["طلب مواد", "إجراء سير العمل"],
        },
        reorder: {
          label: "أصناف دون حد إعادة الطلب",
          note: "طلبات المواد أُعدّت تلقائيًا.",
          sources: ["دفتر المخزون", "حد إعادة طلب الصنف"],
        },
        margin: {
          label: "هامش الربح الإجمالي هذا الشهر",
          note: "من مخزون مُقيَّم، لا من تقديرات.",
          sources: ["فاتورة مبيعات", "دفتر المخزون"],
        },
      },
      sales: {
        label: "المبيعات المفوترة، آخر اثني عشر أسبوعًا",
        note: "بآلاف الريالات، دون ضريبة القيمة المضافة.",
        weekPrefix: "الأسبوع",
        sources: ["فاتورة مبيعات"],
      },
      ageing: {
        label: "المتأخرات بحسب العمر",
        buckets: ["حتى 30 يومًا", "من 31 إلى 60 يومًا", "من 61 إلى 90 يومًا", "أكثر من 90 يومًا"],
      },
      invoices: {
        label: "الفواتير الإلكترونية هذا الأسبوع",
        note: "ردود منصة فاتورة.",
        sources: ["فاتورة مبيعات", "سجل الفواتير الإلكترونية"],
        cleared: "معتمدة",
        reported: "مُبلَّغ عنها",
        rejected: "مرفوضة، للتصحيح",
      },
      currency: "ر.س",
    },
  },
} satisfies Pick<DigitalSiteContent, "demos">;

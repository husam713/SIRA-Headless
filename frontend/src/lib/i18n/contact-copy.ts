import type { LocaleCode } from "@/types/site";

/**
 * The contact page's own words, in both languages.
 *
 * Everything here is a FALLBACK. The page prefers the CMS intro group, so an
 * editor changes the headline and the standfirst without a deploy and without
 * an engineer; these strings are what renders on a tenant that has not authored
 * the page yet, so that the route still produces a valid document with one
 * `<h1>` rather than an empty band.
 *
 * The exceptions are the three labels at the bottom — the field labels and the
 * working week. Those repeat on every tenant and have no per-tenant editorial
 * owner, which is the test for whether a string belongs in code at all.
 *
 * `hoursValue` deliberately names the working week and the timezone and stops
 * there. Opening times are a business fact nobody has supplied, and inventing
 * "9am to 5pm" would be inventing a commitment the company has not made.
 */

interface ContactCopy {
  readonly eyebrow: string;
  readonly heading: string;
  readonly standfirst: string;
  readonly emailLabel: string;
  readonly hoursLabel: string;
  readonly hoursValue: string;
  /** The last option in the enquiry-subject list, after the real services. */
  readonly notSureYet: string;
}

export const CONTACT_COPY: Readonly<Record<LocaleCode, ContactCopy>> =
  Object.freeze({
    en: Object.freeze({
      eyebrow: "Start here",
      heading: "Tell us where the time goes.",
      standfirst:
        "An operations review is a conversation, not a pitch. Describe the process that costs you the most hours and we will tell you honestly whether software is the answer.",
      emailLabel: "Email",
      hoursLabel: "Hours",
      hoursValue: "Sunday to Thursday, Arabia Standard Time (UTC+3)",
      notSureYet: "Not sure yet",
    }),
    ar: Object.freeze({
      eyebrow: "ابدأ من هنا",
      heading: "أخبرنا أين يضيع وقتكم.",
      standfirst:
        "مراجعة العمليات حوار وليست عرضًا تجاريًا. صف لنا العملية التي تكلفك أكثر عدد من الساعات، وسنخبرك بصراحة إن كانت البرمجيات هي الحل أصلًا.",
      emailLabel: "البريد الإلكتروني",
      hoursLabel: "أوقات العمل",
      hoursValue: "من الأحد إلى الخميس، بتوقيت السعودية (UTC+3)",
      notSureYet: "لست متأكدًا بعد",
    }),
  });

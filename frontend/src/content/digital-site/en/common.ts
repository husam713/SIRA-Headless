import type { DigitalSiteContent } from "@/content/digital-site/types";

/**
 * SIRA Digital — English: the chrome every page shares.
 *
 * PROVISIONAL: page titles, descriptions, the tagline and the closing ask
 * are proposals awaiting owner approval (09_CONTENT_AND_APPROVAL_REGISTER.md).
 */
export const COMMON_EN = {
  meta: {
    siteName: "SIRA Digital",
    pages: {
      home: {
        title: "SIRA Digital — ERPNext and business automation for Saudi organizations",
        description:
          "SIRA Digital implements ERPNext and automates approvals, documents and reporting for organizations in Saudi Arabia, in Arabic and English, ready for ZATCA e-invoicing and hosted where your policies require.",
      },
      services: {
        title: "Solutions",
        description:
          "ERPNext implementation, workflow automation, integration, reporting and support: what SIRA Digital proposes to deliver, what each line of work includes and where an engagement starts.",
      },
      erpnext: {
        title: "ERPNext implementation",
        description:
          "How SIRA Digital implements ERPNext and the Frappe framework for organizations in Saudi Arabia: modules, Saudi requirements, data migration, hosting and custom applications.",
      },
      automation: {
        title: "Business automation",
        description:
          "Approvals, document capture, integrations and scheduled reporting built around your ERP, with a person in charge of every decision that needs judgment.",
      },
      industries: {
        title: "Industries",
        description:
          "How the same ERP modules carry different work in trading and distribution, contracting, manufacturing, professional services, healthcare providers, retail and hospitality, and real estate.",
      },
      method: {
        title: "Method",
        description:
          "The five stages from the first conversation to a running system, with what you receive and what we need from you at each one.",
      },
      about: {
        title: "Company",
        description:
          "SIRA Digital is the technology company of SIRA GROUP. It implements business systems for organizations in Saudi Arabia.",
      },
      contact: {
        title: "Request a discovery call",
        description:
          "Describe where your operations stand today. A person reads every request and replies by email to arrange a discovery call.",
      },
    },
  },

  brand: {
    wordmark: "SIRA Digital",
    echo: "سيرة الرقمية",
    groupName: "SIRA GROUP",
    groupCompany: "A SIRA GROUP company",
    tagline: "Business systems for organizations in Saudi Arabia.",
  },

  nav: {
    home: "Home",
    label: "Main",
    items: [
      { label: "Solutions", href: "/services/" },
      { label: "ERPNext", href: "/erpnext/" },
      { label: "Automation", href: "/automation/" },
      { label: "Industries", href: "/industries/" },
      { label: "Method", href: "/method/" },
      { label: "Company", href: "/about/" },
    ],
    start: { label: "Request a discovery call", href: "/contact/" },
    menu: "Menu",
    close: "Close",
    skip: "Skip to content",
    language: {
      label: "العربية",
      hint: "Read this page in Arabic",
    },
  },

  common: {
    illustrative: "Illustrative: sample data, not a client",
    related: "Continue with",
    closing: {
      title: "Start with a discovery call",
      intro:
        "Tell us how the work runs today. We reply with a few questions, then meet to map where a system would help first.",
      steps: [
        "You describe where your operations stand.",
        "We read it and reply by email.",
        "We meet to map your processes and agree what comes first.",
      ],
      primary: { label: "Request a discovery call", href: "/contact/" },
    },
  },

  footer: {
    solutionsHeading: "Solutions",
    companyHeading: "Pages",
    groupHeading: "SIRA GROUP",
    legalHeading: "Legal",
    legal: [
      { label: "Privacy", href: "/privacy/" },
      { label: "Terms", href: "/terms/" },
    ],
    rights: "SIRA Digital. A SIRA GROUP company.",
    provisional: "Prototype for review. Content is provisional until approved.",
  },

  notFound: {
    code: "Not found",
    title: "This page is not part of the system.",
    body: "The address may be mistyped, or the page may have moved. These are the pages that exist:",
    home: "Go to the homepage",
    suggestions: "Pages on this site",
  },
} satisfies Pick<DigitalSiteContent, "meta" | "brand" | "nav" | "common" | "footer" | "notFound">;

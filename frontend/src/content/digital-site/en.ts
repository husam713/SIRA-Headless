import type { DigitalSiteContent } from "@/content/digital-site/types";

/**
 * SIRA Digital — English.
 *
 * Written as the company's own voice: plain, specific about the work, and
 * silent about anything the owner has not supplied. Capability copy describes
 * what the company does; it never claims what it has done for whom.
 */
export const DIGITAL_SITE_EN: DigitalSiteContent = {
  locale: "en",

  meta: {
    siteName: "SIRA Digital",
    home: {
      title: "SIRA Digital — Systems for the work that repeats",
      description:
        "Operational software and AI automation for businesses in Saudi Arabia, from the technology company of SIRA GROUP. Workflow automation, AI assistants, document intelligence, custom applications, integration and reporting — in Arabic and English.",
    },
    services: {
      title: "What we build",
      description:
        "Six kinds of system, delivered end to end: workflow automation, AI agents and assistants, document intelligence, custom applications, integration and APIs, data and dashboards.",
    },
    about: {
      title: "Company",
      description:
        "SIRA Digital is the technology company of SIRA GROUP. It designs and builds operational software and AI automation for businesses in Saudi Arabia.",
    },
    contact: {
      title: "Start a conversation",
      description:
        "Compose a short brief about the work that repeats in your business. A person reads it and replies by email.",
    },
  },

  brand: {
    wordmark: "SIRA Digital",
    echo: "سيرة الرقمية",
    groupName: "SIRA GROUP",
    groupCompany: "A SIRA GROUP company",
    tagline: "Systems for the work that repeats.",
  },

  nav: {
    home: "Home",
    items: [
      { label: "What we build", href: "/services/" },
      { label: "Company", href: "/about/" },
    ],
    start: { label: "Start a conversation", href: "/contact/" },
    menu: "Menu",
    close: "Close",
    skip: "Skip to content",
    language: {
      label: "العربية",
      hint: "Read this page in Arabic",
    },
  },

  hero: {
    eyebrow: "The technology company of SIRA GROUP",
    title: ["Work that repeats", "deserves a system."],
    lede:
      "We design and build operational software and AI automation for businesses in Saudi Arabia — approvals, documents, customer conversations and reporting that run on their own, with people still in charge.",
    primary: { label: "Start a conversation", href: "/contact/" },
    secondary: { label: "What we build", href: "#capabilities" },
    scroll: "Scroll",
    fieldLabel: "Decorative: routes drawing themselves across a grid",
  },

  statement: {
    eyebrow: "Point of view",
    lines: [
      "Most of a company's day is the same work, done again.",
      "We turn that work into systems that run it — and report on it.",
      "Designed for the Saudi market, in Arabic and English from the first line.",
    ],
  },

  capabilities: {
    eyebrow: "What we build",
    title: "Six kinds of system.",
    intro:
      "Most engagements combine two or three. Start from the one that describes your problem, or bring the problem and let us map it.",
    examplesLabel: "Typical requests",
    more: { label: "See what we build", href: "/services/" },
    items: [
      {
        key: "workflow",
        index: "01",
        title: "Workflow automation",
        summary:
          "Approvals, quotes, handovers and requests that move on their own, escalate when stuck, and leave a record.",
        detail:
          "Workflow automation is where most engagements begin, because it is where the time goes. We model the process as it actually happens — including the exceptions — then build the system that moves each step, escalates the stuck ones and records the whole path. Your team keeps every decision that needs a person.",
        examples: [
          "Approval chains",
          "Quote to invoice",
          "Onboarding and offboarding",
          "Field requests",
        ],
      },
      {
        key: "agents",
        index: "02",
        title: "AI agents and assistants",
        summary:
          "Assistants on WhatsApp, the web and voice that answer within your rules, hand over to people, and keep an audit trail.",
        detail:
          "An assistant is only useful if it knows when to stop. We build agents that answer from your own knowledge and rules — on WhatsApp, the web or voice — hand the conversation to a person the moment they should, and log every exchange so you can see what was said and improve it.",
        examples: [
          "Customer replies",
          "Internal helpdesk",
          "Bookings and follow-ups",
          "Voice assistants",
        ],
      },
      {
        key: "documents",
        index: "03",
        title: "Document intelligence",
        summary:
          "Reading, extracting and filing invoices, contracts and forms — in Arabic and English — so nobody retypes them.",
        detail:
          "Paper does not go away; it just needs to stop being retyped. We combine OCR, language models and plain rules to read invoices, contracts and forms in Arabic and English, extract what matters, check it against your systems and file it where it belongs — with a person reviewing whatever the system is unsure about.",
        examples: [
          "Invoice capture",
          "Contract review support",
          "Forms and applications",
          "Archive search",
        ],
      },
      {
        key: "applications",
        index: "04",
        title: "Custom applications",
        summary:
          "Internal tools and customer-facing products built for how your team works, on web and mobile.",
        detail:
          "When the right tool does not exist, we build it: an operations console for your team, a portal for your customers, a mobile app for the field, or a product you intend to sell. Web and mobile, designed around the work rather than around the software.",
        examples: [
          "Operations consoles",
          "Customer portals",
          "Mobile apps for field teams",
          "Products you can sell",
        ],
      },
      {
        key: "integration",
        index: "05",
        title: "Integration and APIs",
        summary:
          "Your ERP, CRM, payments and the systems around them, connected so data is entered once.",
        detail:
          "Most operational pain is data entered twice. We connect your ERP, CRM, payment and partner systems — through their APIs or around their limits — so records are created once and stay consistent everywhere, with reconciliation built in rather than bolted on.",
        examples: [
          "ERP and CRM sync",
          "Payment and banking flows",
          "Government and partner APIs",
          "Legacy systems",
        ],
      },
      {
        key: "data",
        index: "06",
        title: "Data and dashboards",
        summary:
          "Reporting that reconciles — one set of numbers, refreshed on its own, that the whole company trusts.",
        detail:
          "Reporting is trustworthy when the numbers reconcile. We build the pipelines and dashboards that pull from the systems of record, agree with each other, refresh without anyone exporting a spreadsheet, and raise a flag when something drifts.",
        examples: [
          "Management dashboards",
          "Operational KPIs",
          "Reconciliation",
          "Alerts",
        ],
      },
    ],
  },

  approach: {
    eyebrow: "How we work",
    title: "From the first conversation to a running system.",
    intro:
      "Four stages, always in this order. The software is the third one.",
    steps: [
      {
        key: "map",
        index: "01",
        title: "Map",
        summary:
          "We start where the time goes: a short review of the work that repeats, who does it, and what it costs to do by hand.",
      },
      {
        key: "design",
        index: "02",
        title: "Design",
        summary:
          "The workflow before the software. We agree on what runs automatically, what stops for a person, and what gets recorded.",
      },
      {
        key: "build",
        index: "03",
        title: "Build",
        summary:
          "Delivered in short, visible cycles, with your team using the system before it is finished.",
      },
      {
        key: "run",
        index: "04",
        title: "Run",
        summary:
          "Monitoring, training and handover. A system is only done when your people run it.",
      },
    ],
  },

  principles: {
    eyebrow: "What we hold to",
    title: "Four commitments.",
    items: [
      {
        title: "People stay in charge.",
        body: "Automation removes repetition, not judgment. Every automated step has a person who can see it, stop it and change it.",
      },
      {
        title: "Systems explain themselves.",
        body: "What ran, when, on whose behalf and with what result — recorded, searchable and reportable.",
      },
      {
        title: "Arabic is not an afterthought.",
        body: "Interfaces, documents and assistants are designed in Arabic and English together, not translated at the end.",
      },
      {
        title: "Simple beats clever.",
        body: "The right system is the one your team will still be running in five years. We build for that.",
      },
    ],
  },

  group: {
    eyebrow: "Part of SIRA GROUP",
    title: "A technology company inside an operating group.",
    body: "SIRA Digital is one of the SIRA GROUP companies, alongside consulting, healthcare, lifestyle and real estate. That gives us a close view of how real operations run — and a group behind every engagement.",
    visit: "Visit",
    companies: [
      { key: "group", name: "SIRA GROUP", field: "The group" },
      { key: "consulting", name: "SIRA Consulting", field: "Consulting" },
      { key: "healthcare", name: "SIRA Healthcare", field: "Healthcare" },
      { key: "lifestyle", name: "SIRA Lifestyle", field: "Lifestyle" },
      { key: "realestate", name: "SIRA Real Estate", field: "Real estate" },
    ],
  },

  closing: {
    title: "Bring us the work that repeats.",
    body: "Tell us what your team does again and again. We'll come back with a straight answer on whether a system would help, and what it would take.",
    primary: { label: "Start a conversation", href: "/contact/" },
  },

  services: {
    eyebrow: "What we build",
    title: "Six kinds of system, delivered end to end.",
    lede: "Each engagement usually combines two or three of these. Start from the one that describes your problem, or bring the problem and let us map it.",
    notSureTitle: "Not sure which one you need?",
    notSureBody:
      "Most people aren't. Describe the work that repeats and we'll tell you what kind of system it wants — or whether it wants one at all.",
    notSure: { label: "Compose a brief", href: "/contact/" },
  },

  about: {
    eyebrow: "Company",
    title: "The technology company of SIRA GROUP.",
    lede: "SIRA Digital designs and builds operational software and AI automation for businesses in Saudi Arabia.",
    sections: [
      {
        key: "what",
        title: "What we do",
        body: [
          "We build the systems a business runs on day to day: workflow automation, AI assistants, document intelligence, custom applications, integration and reporting.",
          "We take a problem from the first conversation to a running system, and we stay with it. The measure of a finished system is that your own people run it.",
        ],
      },
      {
        key: "group",
        title: "Who we are part of",
        body: [
          "SIRA Digital is one of the SIRA GROUP companies. The group's other companies work in consulting, healthcare, lifestyle and real estate — operations that run on approvals, documents, bookings and reports every day.",
          "Being inside an operating group keeps us close to how that work is actually done, and puts a group behind every engagement we take on.",
        ],
      },
      {
        key: "languages",
        title: "Two first languages",
        body: [
          "Arabic and English are both first languages here. This site, the interfaces we build and the documents our systems read are designed in both from the start — not translated at the end.",
        ],
      },
    ],
  },

  contact: {
    eyebrow: "Start",
    title: "Start from the work, not the software.",
    lede: "Compose a short brief below. It takes a minute, and it gives us enough to reply properly.",
    composer: {
      repeatsLabel: "What repeats in your business?",
      repeats: [
        { key: "approvals", label: "Approvals", phrase: "approvals" },
        { key: "quotes", label: "Quotes and invoices", phrase: "quotes and invoices" },
        { key: "replies", label: "Customer replies", phrase: "customer replies" },
        { key: "documents", label: "Documents and forms", phrase: "documents and forms" },
        { key: "reports", label: "Reports", phrase: "reports" },
        { key: "scheduling", label: "Scheduling", phrase: "scheduling" },
        { key: "onboarding", label: "Onboarding", phrase: "onboarding" },
        { key: "other", label: "Something else", phrase: "something else we'll describe below" },
      ],
      helpLabel: "What kind of help are you after?",
      help: [
        { key: "automate", label: "Automate it", phrase: "we'd like to automate it" },
        { key: "assistant", label: "An AI assistant", phrase: "we'd like an AI assistant" },
        { key: "application", label: "An application", phrase: "we'd like an application built" },
        { key: "integration", label: "Connect our systems", phrase: "we'd like our systems connected" },
        { key: "dashboards", label: "Dashboards and reporting", phrase: "we'd like dashboards and reporting" },
        { key: "unsure", label: "Not sure yet", phrase: "we're not sure yet what would help" },
      ],
      previewLabel: "Your brief",
      previewEmpty: "Pick what repeats, and what kind of help you're after. We'll draft the brief.",
      sentenceRepeats: "We keep doing {repeats} by hand",
      sentenceHelp: ", and {help}",
      sentenceHelpOnly: "We have work that repeats, and {help}",
      sentenceEnd: ".",
      listSeparator: ", ",
      listLast: " and ",
      clear: "Clear",
    },
    form: {
      name: "Your name",
      email: "Work email",
      phone: "Phone (optional)",
      message: "Anything else?",
      messageHint:
        "What happens today, roughly how often, and what “better” would look like. The brief above is included automatically.",
      submit: "Send the brief",
      sending: "Sending…",
      successTitle: "Received.",
      successBody:
        "A person will read this and reply by email. Nothing automatic happens with your brief.",
      another: "Send another",
      errorRequired: "This field is required.",
      errorEmail: "Enter a valid email address.",
      errorShort: "Add a few more words so we can reply properly.",
      errorRateLimited: "Too many attempts from this connection. Try again in a few minutes.",
      errorFailed: "We couldn't send that. Please try again in a moment.",
      privacyNote: "Your details are used only to reply to you.",
      privacyLink: { label: "Privacy", href: "/privacy/" },
      defaultService: "General enquiry",
    },
    afterTitle: "What happens next",
    after: [
      "We read it — a person, not a bot.",
      "We reply by email with questions, or with a short proposal for a review call.",
      "If a system would not help, we say so.",
    ],
  },

  footer: {
    siteHeading: "Site",
    legalHeading: "Legal",
    groupHeading: "SIRA GROUP",
    legal: [
      { label: "Privacy", href: "/privacy/" },
      { label: "Terms", href: "/terms/" },
    ],
    clockLabel: "Saudi time",
    rights: "SIRA Digital. A SIRA GROUP company.",
  },

  notFound: {
    code: "404",
    title: "This route doesn't exist.",
    body: "The page may have moved, or never been. The homepage is a good place to route from.",
    home: "Back to the homepage",
  },
};

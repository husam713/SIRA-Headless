import type { DigitalSiteContent } from "@/content/digital-site/types";

/**
 * SIRA Digital — English: the page narratives.
 *
 * PROVISIONAL throughout: positioning, commitments, engagement models and the
 * method are proposals for the owner to approve, amend or remove
 * (docs/website-prototype/09_CONTENT_AND_APPROVAL_REGISTER.md). Nothing here
 * names a client, a figure, a person, an office, a partner status or a date.
 */
export const PAGES_EN = {
  home: {
    hero: {
      title: ["From request to ledger,", "one system."],
      lede:
        "SIRA Digital implements ERPNext and automates the work around it: purchasing, inventory, sales, finance, HR and approvals, for organizations in Saudi Arabia. In Arabic and English, ready for ZATCA e-invoicing, hosted where your policies require.",
      primary: { label: "Request a discovery call", href: "/contact/" },
      secondary: { label: "Try the approval example", href: "#approval-demo" },
      map: {
        label:
          "Diagram: a purchase and a sale each travel through their documents and post to one general ledger.",
        caption: "Purchases and sales move through their documents and post to one general ledger.",
        purchase: ["Purchase request", "Approval", "Purchase order", "Goods receipt", "Supplier invoice"],
        sales: ["Quotation", "Sales order", "Delivery note", "Sales invoice", "ZATCA clearance"],
        ledger: ["General", "ledger"],
        pause: "Pause the animation",
      },
    },

    problem: {
      title: "Most companies run on five systems and a spreadsheet.",
      intro: "None of them is wrong on its own. Together they turn every number into a negotiation.",
      diagramLabel:
        "Diagram: spreadsheets, email, chat approvals, an accounting app, a warehouse sheet and paper invoices, none of them connected to the others.",
      islands: ["Spreadsheets", "Email", "Chat approvals", "Accounting app", "Warehouse sheet", "Paper invoices"],
      symptomHeading: "What happens",
      costHeading: "What it costs",
      rows: [
        {
          key: "approvals",
          label: "Approvals happen in chat threads.",
          detail: "Nobody can show who approved what, or when.",
        },
        {
          key: "retyping",
          label: "Orders are typed twice.",
          detail: "Once into accounting, once into the warehouse sheet, with two chances to differ.",
        },
        {
          key: "stock",
          label: "Stock is counted, not known.",
          detail: "Purchasing buys what sales already promised, or what is already on the shelf.",
        },
        {
          key: "close",
          label: "Month-end is a spreadsheet project.",
          detail: "Finance spends the close reconciling exports instead of reviewing results.",
        },
        {
          key: "einvoicing",
          label: "E-invoicing is bolted on.",
          detail: "Invoices are issued in one tool and cleared in another, and the errors surface late.",
        },
        {
          key: "reports",
          label: "Every report has its own number.",
          detail: "Meetings begin by agreeing on the figures before anyone can discuss them.",
        },
      ],
    },

    solutions: {
      title: "What we do",
      intro:
        "Five lines of work, usually combined. Most engagements start with the ERP and add automation once the records live in one place.",
      includesLabel: "Includes",
      outcomeLabel: "You end up with",
    },

    erp: {
      title: "ERPNext, implemented for how Saudi companies work",
      intro:
        "ERPNext is an open-source ERP built on the Frappe framework. Every department works in one database, so a purchase, a delivery and a payment are one trail seen from different desks.",
      databaseLabel: "One database, one general ledger",
      requirementsTitle: "Saudi requirements, handled in the setup",
      more: { label: "How we implement ERPNext", href: "/erpnext/" },
    },

    industries: {
      title: "Where it applies",
      intro:
        "The modules are the same in every company. The route through them is not: a contractor's month looks nothing like a distributor's.",
      more: { label: "Explore industries", href: "/industries/" },
    },

    method: {
      title: "How a system goes live",
      intro: "Five stages, in order. Each one ends with something you can review before the next begins.",
      deliverableLabel: "You receive",
      more: { label: "Read the method", href: "/method/" },
    },

    commitments: {
      title: "What you can hold us to",
      intro: "Five commitments that apply to every engagement, whatever its size.",
      items: [
        {
          key: "ownership",
          title: "You own the system.",
          body: "ERPNext is open source. Your instance, your data, your configuration and its documentation belong to you, with no licence to renew.",
        },
        {
          key: "arabic",
          title: "Arabic is designed, not translated.",
          body: "Screens, print formats and training work in Arabic from the first day, with English beside it.",
        },
        {
          key: "people",
          title: "People decide, the system records.",
          body: "Automation moves the work and keeps the trail. Approvals that need judgment stay with a person.",
        },
        {
          key: "documented",
          title: "Nothing undocumented.",
          body: "Every customisation is written down and handed over, so another team could maintain it.",
        },
        {
          key: "adoption",
          title: "Training until it is used.",
          body: "Go-live is not the finish line. We stay through the first closes, the first audits and the first hard questions.",
        },
      ],
    },

    faq: {
      title: "Questions buyers ask first",
      intro: "Plain answers to what finance, operations and IT usually want to know before a first call.",
      keys: ["zatca", "arabic", "hosting", "phasing", "timeline", "cost", "existing", "migration"],
    },
  },

  services: {
    intro: {
      title: ["Solutions"],
      lede:
        "Five lines of work that together give a company one system of record and the automation around it. Each can start on its own; most engagements combine two or three.",
    },
    indexLabel: "Lines of work",
    includesLabel: "What it includes",
    outcomeLabel: "What you end up with",
    fitsLabel: "Where it fits",
    engagements: {
      title: "Ways to start",
      intro: "Every engagement begins with discovery. What follows depends on where you are today.",
      items: [
        {
          key: "discovery",
          title: "Discovery",
          body: "A short, fixed engagement that maps your processes, systems and data, and ends in a scope and plan you can use with us or without us.",
        },
        {
          key: "phased",
          title: "Phased implementation",
          body: "Finance and one operational area first, then the rest in planned phases, each with its own go-live.",
        },
        {
          key: "recovery",
          title: "Review and recovery",
          body: "For an ERPNext system that is not doing what it should: we review it, fix what matters and bring it up to date.",
        },
        {
          key: "care",
          title: "Run and support",
          body: "Ongoing support, upgrades and improvements for a system that is already live, ours or another partner's.",
        },
      ],
    },
    notSure: {
      title: "Not sure where to start?",
      intro:
        "Describe the problem rather than the solution. We will tell you which of these applies, including when the honest answer is none of them.",
      link: { label: "Request a discovery call", href: "/contact/" },
    },
  },

  erpnext: {
    intro: {
      title: ["ERPNext, implemented", "for Saudi organizations"],
      lede:
        "ERPNext is a complete, open-source ERP built on the Frappe framework. We implement it as your company's system of record, configured for Saudi requirements and for the way your teams actually work.",
    },
    why: {
      title: "Why ERPNext",
      intro: "Four properties of the platform matter most to the companies we speak with.",
      items: [
        {
          key: "open",
          title: "Open source, no licence fee",
          body: "ERPNext is free to use and modify. You pay for implementation, hosting and support, not for each user you add.",
        },
        {
          key: "one",
          title: "One database for the company",
          body: "Accounting, stock, buying, selling, HR and projects share one set of records, so reports agree by design.",
        },
        {
          key: "extend",
          title: "Built to be extended",
          body: "The Frappe framework adds fields, documents, workflows and whole applications without changing the core, so upgrades stay possible.",
        },
        {
          key: "api",
          title: "Open to other systems",
          body: "Every record type has a REST API out of the box, which turns most integrations into configuration rather than a project of their own.",
        },
      ],
    },
    modules: {
      title: "The modules, by what they do",
      intro: "Choose a module to see what it handles and the documents your team will work with in it.",
      documentsLabel: "Documents your team uses",
      databaseLabel: "One database, one general ledger",
    },
    saudi: {
      title: "Saudi requirements",
      intro: "Handled as part of the setup, verified with you, and documented.",
      caution:
        "Regulations change. At the start of every engagement we confirm the current ZATCA, payroll and data rules instead of relying on what was true last year.",
    },
    migration: {
      title: "Coming from somewhere else",
      intro: "Most companies arrive with years of data in other tools. We move what you need and reconcile it before go-live.",
      sources: [
        {
          key: "spreadsheets",
          label: "Spreadsheets",
          detail: "Master data cleaned and imported; open balances and documents rebuilt as records.",
        },
        {
          key: "accounting",
          label: "Accounting software",
          detail: "Chart of accounts mapped, opening balances and open invoices migrated and reconciled.",
        },
        {
          key: "erp",
          label: "Another ERP",
          detail: "Masters, open transactions and history extracted, mapped and rehearsed on a copy first.",
        },
        {
          key: "older",
          label: "An older ERPNext",
          detail: "Upgraded to the current version, with customisations reviewed and tested before the switch.",
        },
      ],
    },
    hosting: {
      title: "Where it runs",
      intro: "The same system can live in three places. The choice follows your policies, your sector's rules and your IT team.",
      options: [
        {
          key: "managed",
          title: "Managed cloud",
          body: "A managed ERPNext hosting service, with the region chosen to suit your requirements.",
        },
        {
          key: "private",
          title: "Private cloud in the Kingdom",
          body: "Your own environment with a cloud provider operating inside Saudi Arabia, for data that must stay in the country.",
        },
        {
          key: "onpremise",
          title: "Your own servers",
          body: "Installed in your data centre and operated by your team, with our support.",
        },
      ],
    },
    frappe: {
      title: "When the standard is not enough",
      intro:
        "The Frappe framework is the toolkit ERPNext itself is built with. We use it to add what your business needs without changing the core.",
      items: [
        "Custom documents and fields for processes ERPNext does not cover",
        "Portals for customers, suppliers and employees",
        "Mobile-friendly screens for field and warehouse teams",
        "Industry applications, maintained alongside your ERP",
      ],
    },
    existing: {
      title: "Already on ERPNext?",
      intro: "Many systems were implemented quickly and then left alone. We can help with:",
      items: [
        "A review of configuration, permissions and data quality",
        "Upgrades from older versions to the current release",
        "Fixes for reports, workflows and print formats",
        "Taking over support from another partner",
      ],
    },
    faqKeys: ["zatca", "arabic", "hosting", "integrations", "existing"],
  },

  automation: {
    intro: {
      title: ["Automate the work", "between people and systems"],
      lede:
        "Most delays sit in the gaps: a request waiting for a signature, an invoice waiting for a match, a report waiting for an export. We build the workflows and integrations that close those gaps inside your ERP, with a person in charge of every judgment.",
    },
    patterns: {
      title: "What we automate",
      intro: "Six patterns cover most of the work.",
      items: [
        {
          key: "approvals",
          title: "Approvals with rules",
          body: "Who approves what, up to which amount, and who stands in when someone is away. Written once, applied to every request.",
        },
        {
          key: "escalation",
          title: "Escalation",
          body: "When a step waits too long, the system reminds, then escalates, so nothing stalls silently.",
        },
        {
          key: "capture",
          title: "Document capture",
          body: "Supplier invoices and forms read from email and scans, matched to orders, and queued for a person to confirm.",
        },
        {
          key: "notifications",
          title: "Notifications",
          body: "The right person hears about the event that concerns them, by email or messaging, with a link to the record.",
        },
        {
          key: "scheduled",
          title: "Scheduled work",
          body: "Reports, reminders, reorder suggestions and reconciliations that run on a schedule instead of on someone's memory.",
        },
        {
          key: "sync",
          title: "Synchronisation",
          body: "Orders, payments and records flowing between your ERP and the platforms around it, entered once.",
        },
      ],
    },
    integrations: {
      title: "What we connect",
      intro: "ERPNext at the centre; the systems around it connected through documented APIs.",
      hub: "ERPNext",
      groups: [
        { key: "finance", name: "Finance", items: ["Bank statements", "Payment files", "Payment gateways"] },
        { key: "commerce", name: "Commerce", items: ["E-commerce stores", "Point of sale", "Delivery platforms"] },
        { key: "government", name: "Government", items: ["ZATCA e-invoicing", "Payroll and wage-protection files"] },
        { key: "people", name: "People", items: ["Attendance devices", "HR and recruitment tools"] },
        { key: "workplace", name: "Workplace", items: ["Email and calendars", "Messaging", "Document storage"] },
      ],
    },
    boundaries: {
      title: "What stays with people",
      intro: "Automation should remove repetition, not judgment. We draw the line with you before anything is built.",
      automateLabel: "The system does",
      automate: [
        "Routing, reminders and escalation",
        "Matching, calculating and posting",
        "Collecting the data a decision needs",
        "Recording who did what, and when",
      ],
      keepLabel: "A person decides",
      keep: [
        "Approvals that need judgment",
        "Exceptions and disputes",
        "Anything that commits the company to a third party",
        "Changes to the rules themselves",
      ],
    },
    faqKeys: ["integrations", "zatca", "privacy", "afterlaunch"],
  },

  industries: {
    intro: {
      title: ["The same modules,", "a different route"],
      lede:
        "Every company buys, sells, stores and pays. What differs is the route through those steps, and where it breaks. Choose a sector to see the route we would start from.",
    },
    sectors: {
      title: "By sector",
      intro: "Seven sectors, each with its usual problems, the modules that carry the work, and the route its documents take.",
      painsLabel: "Where it usually breaks",
      modulesLabel: "Modules that carry the work",
      flowLabel: "The route",
      integrationsLabel: "Typical connections",
    },
    functions: {
      title: "By function",
      intro: "What changes for each department when the company runs on one system.",
      functionLabel: "Function",
      beforeLabel: "Before",
      afterLabel: "After",
    },
    group: {
      title: "Sectors we see from inside the group",
      intro:
        "SIRA GROUP operates companies in consulting, healthcare, lifestyle and real estate. Those are the sectors where SIRA Digital proposes to start.",
    },
  },

  method: {
    intro: {
      title: ["From the first conversation", "to a running system"],
      lede:
        "Five stages, always in this order. Each ends with a review, so you approve what was done before the next stage begins and always know what comes next.",
    },
    phasesTitle: "The five stages",
    activitiesLabel: "What happens",
    deliverablesLabel: "What you receive",
    fromYouLabel: "What we need from you",
    gateLabel: "How it closes",
    roles: {
      title: "Who does what",
      intro: "An implementation is a joint project. These roles exist on every engagement, whatever its size.",
      items: [
        { key: "sponsor", label: "Your sponsor", detail: "A member of management who owns the outcome and settles priorities." },
        { key: "owner", label: "Your system owner", detail: "The person who will own the system after go-live, involved from the first day." },
        { key: "keyusers", label: "Your key users", detail: "One per department, testing the system and deciding how the work should run." },
        { key: "lead", label: "Our implementation lead", detail: "Your single point of contact, responsible for the plan, the scope and the quality." },
        { key: "team", label: "Our consultants and developers", detail: "Functional and technical specialists for configuration, integration and data." },
      ],
    },
    checklist: {
      title: "Questions to ask any ERP partner",
      intro: "Including us. If a partner cannot answer these plainly, the implementation will be harder than it needs to be.",
      questionLabel: "Ask",
      answerLabel: "Our answer",
      items: [
        {
          key: "ownership",
          label: "Who owns the system, the code and the configuration?",
          detail: "You do. The instance, its data, every customisation and its documentation are yours.",
        },
        {
          key: "standard",
          label: "How much will you customise, and why?",
          detail: "As little as possible. Every change to the standard is justified in the design and documented.",
        },
        {
          key: "data",
          label: "How will our data be migrated and checked?",
          detail: "Rehearsed on a copy, reconciled with your accountant, and signed off before go-live.",
        },
        {
          key: "training",
          label: "Who trains our people, and in which language?",
          detail: "We do, by role, in Arabic and English, with guides your team keeps.",
        },
        {
          key: "einvoicing",
          label: "How will e-invoicing be handled?",
          detail: "With a tested Phase 2 app, onboarded on the Fatoora portal together with your team.",
        },
        {
          key: "exit",
          label: "What happens if we change partners?",
          detail: "You leave with full documentation and access. Nothing about the system depends on us.",
        },
        {
          key: "after",
          label: "What happens after go-live?",
          detail: "Close support through the first closes, then agreed support, upgrades and regular reviews.",
        },
      ],
    },
  },

  about: {
    intro: {
      title: ["The technology company", "of SIRA GROUP"],
      lede:
        "SIRA Digital implements business systems for organizations in Saudi Arabia: ERPNext at the core, automation and integration around it, in Arabic and English.",
    },
    sections: [
      {
        key: "why",
        title: "Why it exists",
        body: [
          "Most organizations do not lack software. They lack one system the whole company trusts, configured for how they work and supported by people who understand both the technology and the business.",
          "SIRA Digital is set up to be that partner for organizations in Saudi Arabia.",
        ],
      },
      {
        key: "how",
        title: "How it works",
        body: [
          "We start from the processes and documents of the business, not from a template. We prefer the standard system to custom code, and we document every change we make.",
          "We work in Arabic and English with equal care, because the people who use the system will.",
        ],
      },
    ],
    principles: {
      title: "Principles",
      intro: "How decisions are made on every engagement.",
      items: [
        { key: "ownership", title: "The client owns the system", body: "Data, configuration, code and documentation belong to the client." },
        { key: "standard", title: "Standard before custom", body: "The built-in way first; custom work only where it clearly pays for itself." },
        { key: "people", title: "People decide, systems record", body: "Automation removes repetition, never accountability." },
        { key: "arabic", title: "Arabic is designed, not translated", body: "Interfaces, documents and training work in Arabic from the first day." },
        { key: "plain", title: "Plain answers", body: "Scope, cost and risk explained in words a manager can act on." },
      ],
    },
    group: {
      title: "Part of SIRA GROUP",
      intro: "SIRA Digital is one of the SIRA GROUP companies, alongside consulting, healthcare, lifestyle and real estate.",
      companies: [
        { key: "group", name: "SIRA GROUP", field: "The group" },
        { key: "consulting", name: "SIRA Consulting", field: "Consulting" },
        { key: "healthcare", name: "SIRA Healthcare", field: "Healthcare" },
        { key: "lifestyle", name: "SIRA Lifestyle", field: "Lifestyle" },
        { key: "realestate", name: "SIRA Real Estate", field: "Real estate" },
      ],
      visit: "Visit the site",
    },
  },

  contact: {
    intro: {
      title: ["Request a discovery call"],
      lede:
        "Describe where your operations stand today. A person reads every request and replies by email to arrange a call, usually with a few questions first.",
    },
    discovery: {
      situationLabel: "Where are you today?",
      situations: [
        { key: "spreadsheets", label: "Spreadsheets and separate tools", phrase: "we run on spreadsheets and separate tools" },
        { key: "accounting", label: "An accounting app we are outgrowing", phrase: "we are outgrowing our accounting software" },
        { key: "erp", label: "An ERP that does not fit", phrase: "our current ERP does not fit how we work" },
        { key: "erpnext", label: "ERPNext, and it needs work", phrase: "we already use ERPNext and it needs work" },
      ],
      areasLabel: "What should the system cover first?",
      areasHint: "Choose any that apply.",
      areas: [
        { key: "finance", label: "Finance and VAT", phrase: "finance and VAT" },
        { key: "einvoicing", label: "E-invoicing", phrase: "e-invoicing" },
        { key: "purchasing", label: "Purchasing", phrase: "purchasing" },
        { key: "inventory", label: "Inventory", phrase: "inventory" },
        { key: "sales", label: "Sales and CRM", phrase: "sales and CRM" },
        { key: "hr", label: "HR and payroll", phrase: "HR and payroll" },
        { key: "projects", label: "Projects", phrase: "projects" },
        { key: "manufacturing", label: "Manufacturing", phrase: "manufacturing" },
        { key: "approvals", label: "Approvals and workflows", phrase: "approvals and workflows" },
        { key: "integrations", label: "Integrations", phrase: "integrations" },
        { key: "reporting", label: "Reporting", phrase: "reporting" },
      ],
      sizeLabel: "How many people will use it?",
      sizes: [
        { key: "s", label: "Up to 10", phrase: "up to 10 people" },
        { key: "m", label: "11 to 50", phrase: "11 to 50 people" },
        { key: "l", label: "51 to 200", phrase: "51 to 200 people" },
        { key: "xl", label: "More than 200", phrase: "more than 200 people" },
      ],
      timingLabel: "When would you like to start?",
      timings: [
        { key: "quarter", label: "This quarter", phrase: "this quarter" },
        { key: "half", label: "Within six months", phrase: "within six months" },
        { key: "exploring", label: "Exploring for now", phrase: "once we have explored the options" },
      ],
      previewLabel: "Your request, as we will read it",
      previewEmpty: "Choose a few answers and your request takes shape here.",
      previewNote: "This text is sent with your details. Add anything else below.",
      sentenceSituation: "Today {situation}.",
      sentenceAreas: "The system should cover {areas} first.",
      sentenceSize: "It will be used by {size}.",
      sentenceTiming: "We would like to start {timing}.",
      listSeparator: ", ",
      listLast: " and ",
      clear: "Clear answers",
    },
    form: {
      legend: "Your details",
      name: "Name",
      email: "Work email",
      phone: "Phone",
      company: "Company",
      companyPrefix: "Company:",
      optional: "optional",
      message: "Anything else we should know",
      messageHint: "Systems you use today, branches or warehouses, deadlines.",
      submit: "Send request",
      sending: "Sending…",
      successTitle: "Request received",
      successBody: "A person at SIRA Digital will read your request and reply by email.",
      another: "Send another request",
      errorSummary: "Some fields need attention.",
      errorRequired: "Enter your name.",
      errorEmail: "Enter an email address, such as name@company.com.",
      errorShort: "Choose where you are today, or tell us a little more (at least 10 characters).",
      errorRateLimited: "Too many requests from this connection. Try again in a few minutes.",
      errorFailed: "The request could not be sent. Try again in a moment.",
      privacyNote: "Your details are used only to reply to this request.",
      privacyLink: { label: "Privacy notice", href: "/privacy/" },
      defaultService: "Discovery call",
    },
    after: {
      title: "What happens next",
      intro: "Three steps, each with a person.",
      steps: [
        "We read your request and reply by email.",
        "We agree a time for a discovery call.",
        "We map your processes together and propose where to start.",
      ],
    },
  },
} satisfies Pick<
  DigitalSiteContent,
  "home" | "services" | "erpnext" | "automation" | "industries" | "method" | "about" | "contact"
>;

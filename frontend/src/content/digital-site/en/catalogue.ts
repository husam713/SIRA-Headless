import type { DigitalSiteContent } from "@/content/digital-site/types";

/**
 * SIRA Digital — English: the catalogues several pages draw from.
 *
 * Module and document names follow ERPNext's own vocabulary
 * (https://docs.frappe.io/erpnext). Solutions, stages and commitments are
 * PROPOSALS — what SIRA Digital could offer — not verified current services.
 * FAQ answers about ERPNext capabilities rest on Frappe's documentation and
 * ZATCA's published rules (02_MARKET_AND_COMPETITOR_RESEARCH.md); answers about
 * how SIRA works are provisional.
 */
export const CATALOGUE_EN = {
  solutions: [
    {
      key: "erp",
      title: "ERPNext implementation",
      summary:
        "One system for finance, purchasing, inventory, sales, projects and HR, configured around how your company works.",
      detail:
        "We implement ERPNext as the system of record for the whole company. Each department works in the same database, so an order, a delivery and a payment are one trail rather than three spreadsheets. The work starts from your processes and documents, not from a template.",
      includes: [
        "Process mapping and fit-gap analysis",
        "Modules, roles, permissions and approval rules",
        "Chart of accounts, VAT and e-invoicing setup",
        "Data migration from your current tools",
        "Training for every role, in Arabic and English",
      ],
      outcome: "A live ERPNext system with your data, your documents and trained users.",
      fits: "When the company runs on spreadsheets and separate tools, or has outgrown its accounting software.",
      link: { label: "How we implement ERPNext", href: "/erpnext/" },
    },
    {
      key: "automation",
      title: "Workflow automation",
      summary:
        "Approvals, notifications and routine steps that move on their own and leave an audit trail.",
      detail:
        "Most delays sit between people: a request waiting for a signature, an invoice waiting for a match. We model those steps as workflows with clear rules, so the system moves the work, escalates what is stuck and records who decided what.",
      includes: [
        "Approval chains with limits and delegation",
        "Escalation when a step waits too long",
        "Document capture from email and scans",
        "Scheduled reports and alerts",
        "Notifications by email and messaging",
      ],
      outcome: "Workflows that run inside your ERP, with every action recorded.",
      fits: "When the records exist but the work between them still moves by chat, email and paper.",
      link: { label: "Business automation", href: "/automation/" },
    },
    {
      key: "integration",
      title: "Integration and APIs",
      summary:
        "Your ERP connected to banks, e-commerce, payment, HR and government platforms, so data is entered once.",
      detail:
        "ERPNext exposes an API for every record type. We use it to connect the systems around your ERP, so a web order, a bank statement or a payroll file arrives as a document instead of being typed again, with monitoring when something fails.",
      includes: [
        "Bank statements and payment files",
        "E-commerce and point-of-sale orders",
        "Payroll exports and HR systems",
        "E-invoicing and other government platforms",
        "Custom APIs for partners and your own apps",
      ],
      outcome: "Documented integrations with monitoring and error handling.",
      fits: "When the same data is typed into two systems, or a partner needs access to yours.",
      link: { label: "Integrations", href: "/automation/#integrations" },
    },
    {
      key: "reporting",
      title: "Reporting and dashboards",
      summary:
        "Management views drawn from the system of record, so the numbers agree with the books.",
      detail:
        "A dashboard is only trusted when it comes from the same records the teams work in. We build the financial, operational and management views each role needs, with the documents behind every figure one step away.",
      includes: [
        "Management and operations dashboards",
        "Financial statements and VAT reports",
        "Inventory, purchasing and sales analysis",
        "Reports by role and department",
        "Alerts when a figure crosses a limit",
      ],
      outcome: "Dashboards each manager uses, sourced from live records.",
      fits: "When meetings start by agreeing which number is right.",
      link: { label: "See an example dashboard", href: "/#dashboard" },
    },
    {
      key: "support",
      title: "Support and improvement",
      summary:
        "After go-live, a team that knows your system answers questions, fixes problems and keeps improving it.",
      detail:
        "Go-live is the start of the system's working life. We support users through the first closes, keep the system updated and secure, upgrade it to new ERPNext versions, and add what the business needs next.",
      includes: [
        "Support with agreed response times",
        "Monitoring, backups and security updates",
        "Upgrades to new ERPNext versions",
        "New workflows and reports as the business grows",
        "Regular reviews of how the system is used",
      ],
      outcome: "A supported system that keeps pace with the business.",
      fits: "After any implementation, ours or another partner's.",
      link: { label: "Support after go-live", href: "/services/#support" },
    },
  ],

  modules: [
    {
      key: "accounting",
      name: "Accounting",
      handles: "The general ledger, receivables, payables, banking, budgets and VAT, for one company or several.",
      documents: ["Journal entry", "Payment entry", "Bank reconciliation", "Budget"],
    },
    {
      key: "buying",
      name: "Buying",
      handles: "Requests, supplier quotations and purchase orders, with the approvals in between.",
      documents: ["Material request", "Request for quotation", "Purchase order", "Purchase invoice"],
    },
    {
      key: "selling",
      name: "Selling",
      handles: "Quotations, sales orders and invoices, with price lists, discounts and credit limits under control.",
      documents: ["Quotation", "Sales order", "Delivery note", "Sales invoice"],
    },
    {
      key: "stock",
      name: "Stock",
      handles: "Warehouses, batches and serial numbers, with reorder levels and stock valuation.",
      documents: ["Stock entry", "Purchase receipt", "Stock reconciliation", "Pick list"],
    },
    {
      key: "manufacturing",
      name: "Manufacturing",
      handles: "Bills of materials, work orders, production planning and job cards.",
      documents: ["Bill of materials", "Work order", "Job card", "Production plan"],
    },
    {
      key: "projects",
      name: "Projects",
      handles: "Project costing, timesheets and billing by milestone or by time.",
      documents: ["Project", "Task", "Timesheet", "Activity cost"],
    },
    {
      key: "hr",
      name: "HR and payroll",
      handles: "Employees, leave, attendance, salary structures and payroll runs, through Frappe HR.",
      documents: ["Employee", "Leave application", "Salary slip", "Payroll entry"],
    },
    {
      key: "crm",
      name: "CRM",
      handles: "Leads, opportunities and the follow-up that turns them into quotations.",
      documents: ["Lead", "Opportunity", "Customer", "Appointment"],
    },
    {
      key: "assets",
      name: "Assets",
      handles: "Fixed assets from purchase to disposal, with depreciation and maintenance.",
      documents: ["Asset", "Asset movement", "Depreciation schedule", "Asset maintenance"],
    },
    {
      key: "support",
      name: "Support",
      handles: "Customer issues, service level agreements and maintenance visits.",
      documents: ["Issue", "Service level agreement", "Warranty claim", "Maintenance visit"],
    },
  ],

  requirements: [
    {
      key: "vat",
      name: "VAT",
      body: "Tax templates for sales and purchases, VAT on every invoice, and the return figures your accountant files.",
    },
    {
      key: "einvoicing",
      name: "ZATCA e-invoicing",
      body: "Phase 2 integration through a tested e-invoicing app: invoices in the required format, signed, then cleared or reported through the Fatoora platform, with your system onboarded together with you.",
    },
    {
      key: "language",
      name: "Arabic and English",
      body: "An Arabic interface laid out right to left, with invoices, quotations and reports printed in both languages.",
    },
    {
      key: "payroll",
      name: "Payroll",
      body: "Salary structures, allowances and deductions set up for Saudi payroll, with the files your wage-protection process needs prepared and checked with your HR team.",
    },
    {
      key: "hosting",
      name: "Data and hosting",
      body: "Hosting chosen to meet your policies and sector rules, including inside the Kingdom, with access controlled by role.",
    },
  ],

  sectors: [
    {
      key: "trading",
      name: "Trading and distribution",
      summary: "Buying, holding and selling stock across warehouses and branches, often on credit and in volume.",
      pains: [
        "Stock levels that differ by warehouse and by spreadsheet",
        "Credit limits checked after the order instead of before it",
        "Supplier invoices matched to receipts by hand",
      ],
      modules: ["buying", "stock", "selling", "accounting", "crm"],
      flow: ["Material request", "Purchase order", "Purchase receipt", "Sales order", "Delivery note", "Sales invoice"],
      integrations: ["E-commerce and point of sale", "Bank statements", "ZATCA e-invoicing"],
    },
    {
      key: "contracting",
      name: "Contracting and projects",
      summary: "Work won by tender and delivered by project, where every cost has to land on the right job.",
      pains: [
        "Costs that reach the project after the month has closed",
        "Subcontractor payments approved outside the system",
        "Progress billing prepared in spreadsheets",
      ],
      modules: ["projects", "buying", "stock", "accounting", "hr"],
      flow: ["Project", "Material request", "Purchase order", "Timesheet", "Sales invoice", "Payment entry"],
      integrations: ["Supplier and subcontractor portals", "Bank payment files", "Document management"],
    },
    {
      key: "manufacturing",
      name: "Manufacturing",
      summary: "Turning materials into products, where planning, costing and quality all depend on the bill of materials.",
      pains: [
        "Production planned on a whiteboard and purchased on a hunch",
        "Product costs estimated instead of calculated",
        "Batches that cannot be traced back to their materials",
      ],
      modules: ["manufacturing", "stock", "buying", "selling", "accounting"],
      flow: ["Sales order", "Production plan", "Work order", "Job card", "Stock entry", "Delivery note"],
      integrations: ["Machine and scale data", "Quality systems", "ZATCA e-invoicing"],
    },
    {
      key: "services",
      name: "Professional services",
      summary: "Selling time and expertise, where utilisation and billing are the business.",
      pains: [
        "Timesheets collected at month-end from memory",
        "Engagements billed late, or not at all",
        "Margins per client that nobody can see",
      ],
      modules: ["projects", "crm", "selling", "accounting", "hr"],
      flow: ["Opportunity", "Quotation", "Project", "Timesheet", "Sales invoice", "Payment entry"],
      integrations: ["Calendars and email", "Electronic signatures", "Bank statements"],
    },
    {
      key: "healthcare",
      name: "Healthcare providers",
      summary: "Clinics and medical centres, where purchasing, consumables and staff costs sit beside patient care. We work on the business side, not on clinical records.",
      pains: [
        "Consumables ordered urgently because nobody saw them running low",
        "Staff and doctor costs tracked outside finance",
        "Insurance receivables followed up by hand",
      ],
      modules: ["stock", "buying", "accounting", "hr", "assets"],
      flow: ["Material request", "Purchase order", "Purchase receipt", "Stock entry", "Purchase invoice", "Payment entry"],
      integrations: ["Clinical systems, for business data only", "Insurance billing exports", "Bank statements"],
    },
    {
      key: "retail",
      name: "Retail and hospitality",
      summary: "Many small transactions across outlets, where stock, cash and staff move every hour.",
      pains: [
        "Outlet sales reconciled to stock at the end of the week",
        "Purchasing that cannot see what each outlet sold",
        "Rosters and payroll kept in separate tools",
      ],
      modules: ["selling", "stock", "buying", "accounting", "hr"],
      flow: ["POS invoice", "Stock transfer", "Material request", "Purchase order", "Purchase receipt", "Bank reconciliation"],
      integrations: ["Point-of-sale terminals", "Delivery and e-commerce platforms", "Payment gateways"],
    },
    {
      key: "realestate",
      name: "Real estate and facilities",
      summary: "Properties, leases and maintenance, where income recurs and costs are scattered.",
      pains: [
        "Rent schedules kept in spreadsheets",
        "Maintenance requests that never reach purchasing",
        "Owner and tenant statements prepared by hand",
      ],
      modules: ["assets", "accounting", "support", "buying", "projects"],
      flow: ["Contract", "Sales invoice", "Payment entry", "Issue", "Maintenance visit", "Purchase order"],
      integrations: ["Tenant and owner portals", "Payment gateways", "Bank statements"],
    },
  ],

  functions: [
    {
      key: "finance",
      name: "Finance",
      before: "Closing the month means exporting, reconciling and typing figures again.",
      after: "Entries post as the work happens, so the close becomes a review.",
    },
    {
      key: "procurement",
      name: "Procurement",
      before: "Requests arrive by chat and approvals by signature on paper.",
      after: "Requests follow rules, approvals are recorded and orders leave from the system.",
    },
    {
      key: "inventory",
      name: "Inventory",
      before: "The count disagrees with the books and nobody knows which one is right.",
      after: "Every movement is a document, so stock on hand is a report rather than a count.",
    },
    {
      key: "sales",
      name: "Sales",
      before: "Quotations live in documents and discount limits live in people's heads.",
      after: "Price lists, discount limits and credit checks apply before the order is confirmed.",
    },
    {
      key: "people",
      name: "HR and payroll",
      before: "Leave, attendance and payroll are three spreadsheets and a deadline.",
      after: "Leave and attendance feed payroll, and payroll posts to the ledger.",
    },
    {
      key: "projects",
      name: "Projects",
      before: "Project costs arrive late and in the wrong place.",
      after: "Time, materials and purchases are booked to the project as they happen.",
    },
    {
      key: "management",
      name: "Management",
      before: "Every report opens a discussion about whose number is right.",
      after: "One set of numbers, from the records everyone works in.",
    },
  ],

  phases: [
    {
      key: "discover",
      name: "Discover",
      summary: "We learn how the work actually runs, where it stalls, and what the system has to do first.",
      activities: [
        "Interviews with each department",
        "A walk through real documents: orders, invoices, approvals",
        "An inventory of systems, spreadsheets and data",
        "Agreement on scope and priorities",
      ],
      deliverables: ["Maps of the current processes", "A prioritised scope, in phases", "A first plan with stages and dates"],
      fromYou: ["A sponsor from management", "Time with each department lead", "Sample documents and reports"],
      gate: "You approve the scope and the plan.",
    },
    {
      key: "design",
      name: "Design",
      summary: "The future process before the configuration: what the system does on its own, what stops for a person, and what gets recorded.",
      activities: [
        "Fit-gap analysis against standard ERPNext",
        "Approval rules, roles and permissions",
        "Chart of accounts, taxes and document numbering",
        "Print formats and reports in Arabic and English",
      ],
      deliverables: ["A solution design document", "The workflow and approval matrix", "A data migration plan"],
      fromYou: ["Decisions on policies and approval limits", "Your accountant's review of the chart of accounts"],
      gate: "You sign off the design.",
    },
    {
      key: "build",
      name: "Build",
      summary: "We configure, extend and connect the system, and rehearse the data migration until it reconciles.",
      activities: [
        "Configuration of modules and workflows",
        "Custom fields, apps and integrations where the standard is not enough",
        "Migration rehearsals on a copy of your data",
        "Regular demonstrations of the working system",
      ],
      deliverables: ["A configured system in a test environment", "Documented customisations", "A reconciled migration rehearsal"],
      fromYou: ["Key users at every demonstration", "Clean master data: customers, suppliers, items"],
      gate: "Your key users accept the test system.",
    },
    {
      key: "launch",
      name: "Launch",
      summary: "Testing with your real scenarios, training for every role, and a planned cutover.",
      activities: [
        "User acceptance testing with your own scenarios",
        "Training by role, in Arabic and English",
        "E-invoicing onboarding on the Fatoora platform",
        "Cutover: final migration, opening balances, go-live",
      ],
      deliverables: ["Trained users and guides for each role", "A completed go-live checklist", "A running system with your live data"],
      fromYou: ["Testers from each department", "A cutover window agreed with operations"],
      gate: "You confirm go-live.",
    },
    {
      key: "run",
      name: "Run",
      summary: "Close support while the first cycles complete, then ongoing support and improvement.",
      activities: [
        "Close support through the first month-end close",
        "Monitoring, backups and updates",
        "Upgrades to new ERPNext versions",
        "New reports and workflows as needs grow",
      ],
      deliverables: ["Support with agreed response times", "Regular reviews of how the system is used", "An improvement backlog you control"],
      fromYou: ["A system owner on your side", "Feedback from the people who use it"],
      gate: "Reviewed together at agreed intervals.",
    },
  ],

  questions: [
    {
      key: "zatca",
      question: "Can ERPNext issue ZATCA-compliant e-invoices?",
      answer: [
        "Yes, with an e-invoicing app that implements Phase 2. Invoices are generated in the required format, cryptographically stamped, and cleared or reported through ZATCA's Fatoora platform.",
        "ZATCA lets businesses use any solution that meets its requirements. We select and test the app with you, then onboard your system on the Fatoora portal together.",
      ],
    },
    {
      key: "arabic",
      question: "Does ERPNext work in Arabic?",
      answer: [
        "ERPNext has an Arabic interface with a right-to-left layout. We review the translation of the screens your teams use, design Arabic and bilingual print formats for invoices and quotations, and train each role in the language they work in.",
      ],
    },
    {
      key: "hosting",
      question: "Where will our data be hosted?",
      answer: [
        "Where your policies require. ERPNext can run on a managed cloud, on a private cloud including providers inside the Kingdom, or on your own servers.",
        "Government entities and regulated sectors have data residency rules. We design the hosting to meet them and document where each copy of your data lives.",
      ],
    },
    {
      key: "phasing",
      question: "Do we have to replace everything at once?",
      answer: [
        "No. Most companies start with finance and one operational area, such as purchasing or inventory, then add the rest in planned phases. The discovery call is where we agree what comes first.",
      ],
    },
    {
      key: "timeline",
      question: "How long does an implementation take?",
      answer: [
        "It depends on the modules, the state of your data, and how many companies, branches and warehouses are involved. After discovery you receive a plan with stages and dates, and every stage ends with a review before the next one starts.",
      ],
    },
    {
      key: "cost",
      question: "What does it cost?",
      answer: [
        "ERPNext itself has no licence fee. What you pay for is the implementation work, hosting and support, set out in a proposal after discovery and priced by scope rather than by user.",
      ],
    },
    {
      key: "existing",
      question: "We already use ERPNext. Can you help?",
      answer: [
        "Yes. We review existing installations, correct configurations, upgrade older versions to the current release, and take over support from another partner.",
      ],
    },
    {
      key: "integrations",
      question: "Can ERPNext connect to our other systems?",
      answer: [
        "Yes. The Frappe framework generates a REST API for every record type and supports webhooks and scheduled jobs. We use them to connect banks, e-commerce, payment, HR and government platforms, and we document every integration we build.",
      ],
    },
    {
      key: "migration",
      question: "What happens to our existing data?",
      answer: [
        "We migrate what you need: customers, suppliers, items, opening balances and open documents. Each migration is rehearsed on a copy and reconciled with your accountant before go-live.",
      ],
    },
    {
      key: "afterlaunch",
      question: "What happens after go-live?",
      answer: [
        "A period of close support while teams settle in and the first month-end closes, then ongoing support with agreed response times, upgrades and improvements.",
      ],
    },
    {
      key: "privacy",
      question: "How is personal data protected?",
      answer: [
        "Employee and customer records are personal data under Saudi Arabia's Personal Data Protection Law. We configure roles and permissions so each person sees only what their work requires, and help you document how the data is processed and where it is stored.",
      ],
    },
  ],
} satisfies Pick<
  DigitalSiteContent,
  "solutions" | "modules" | "requirements" | "sectors" | "functions" | "phases" | "questions"
>;

/* SIRA Atlas — prototype content.
   Real copy and imagery come from the live SIRA CMS (siratrgroup.com and the
   cms-<tenant> origins). Records marked demo:true are invented so the
   experience can be browsed end to end; they are not editorial content. */
window.SIRA = (() => {
  const M = "https://siratrgroup.com/wp-content/uploads/";
  const IMG = {
    prime: "https://cms-realestate.siratrgroup.com/wp-content/uploads/sites/4/2026/09/SIRAPRIME_Katalog-R2.jpg",
    rosina: M + "2026/04/1737457106_48eebacda02d8841312d.png",
    rosinaMri: M + "2026/06/ROSINA-MRI-768x1365-1.jpeg",
    pet: M + "2026/04/PET-scan-machine-body1.webp",
    villasSunset: M + "2026/04/Luxury-coastal-villas-at-sunset.png",
    villasIstanbul: M + "2026/04/Luxury-coastal-villas-in-istanbul.png",
    hospitality: M + "2026/04/background2.png",
    realestate: M + "2026/07/realestate.png",
    istanbul: "https://cms-consulting.siratrgroup.com/wp-content/uploads/sites/2/2026/09/istanbul-financial-center-skyline-2.webp-2.webp",
    istanbul2: "https://cms-consulting.siratrgroup.com/wp-content/uploads/sites/2/2026/08/istanbul-financial-center-skyline.webp.webp",
    ovan: M + "2026/03/OVAN-Group-new-logo-4.png",
    rafeef: M + "2026/03/cropped-Rafeef-LOGO-270x270-1.png",
  };

  const companies = [
    {
      key: "realestate", n: "01", name: "SIRA Real Estate", short: "Real Estate",
      ar: "سيرا العقارية",
      color: "#b0733c", deep: "#2b1b14", paper: "#faf5ef",
      tagline: "Building enduring places across markets.",
      taglineAr: "نبني أماكن تدوم عبر الأسواق.",
      summary: "Residential and mixed-use development across Türkiye and growth markets, from land assembly to post-delivery operation.",
      place: "Istanbul, Türkiye", image: IMG.prime, hero: IMG.villasIstanbul,
      status: "active", since: "2014",
      stats: [["20+", "Projects delivered"], ["$120M+", "Under development"], ["3", "Active markets"]],
      capabilities: ["Full-cycle development", "Branded residences", "Mixed-use masterplanning", "Advisory & structuring"],
    },
    {
      key: "healthcare", n: "02", name: "SIRA Healthcare", short: "Healthcare",
      ar: "سيرا للرعاية الصحية",
      color: "#2c6dad", deep: "#12283f", paper: "#f3f7fb",
      tagline: "Diagnostics without compromise.",
      taglineAr: "تشخيص بلا مساومة.",
      summary: "European diagnostic standards for East Africa — advanced imaging centers built on intelligent technology and operated for lasting patient impact.",
      place: "Nairobi, Kenya", image: IMG.rosina, hero: IMG.rosinaMri,
      status: "active", since: "2019",
      stats: [["30K+", "Annual patient scans"], ["+42%", "YoY growth"], ["4", "Modalities"]],
      capabilities: ["Diagnostic imaging", "Center development", "Clinical partnerships", "Facility management systems"],
    },
    {
      key: "lifestyle", n: "03", name: "SIRA Lifestyle", short: "Lifestyle",
      ar: "سيرا لايف ستايل",
      color: "#2e8c72", deep: "#12382f", paper: "#f2f8f5",
      tagline: "Places people return to.",
      taglineAr: "أماكن يعود إليها الناس.",
      summary: "Hospitality, branded residences and experience-led destinations — the group's newest division.",
      place: "Middle East & Africa", image: IMG.hospitality, hero: IMG.hospitality,
      status: "launching", since: "2026",
      stats: [["1", "Founding platform"], ["2", "Sites in review"], ["2027", "First opening"]],
      capabilities: ["Hospitality platform", "Branded residences", "Destination concepts", "Operator partnerships"],
    },
    {
      key: "consulting", n: "04", name: "SIRA Consulting", short: "Consulting",
      ar: "سيرا للاستشارات",
      color: "#8b5aae", deep: "#2b1f36", paper: "#f8f4fa",
      tagline: "Strategy for new markets.",
      taglineAr: "استراتيجية للأسواق الجديدة.",
      summary: "Market entry, investment structuring and execution support for partners moving capital between Europe, Africa and the Middle East.",
      place: "Istanbul · Paris", image: IMG.istanbul, hero: IMG.istanbul2,
      status: "active", since: "2016",
      stats: [["40+", "Engagements"], ["12", "Countries advised"], ["3", "Continents"]],
      capabilities: ["Market entry", "Investment structuring", "Partnership formation", "Execution support"],
    },
    {
      key: "digital", n: "05", name: "SIRA Digital", short: "Digital",
      ar: "سيرا ديجيتال",
      color: "#d4a94f", deep: "#0e1626", paper: "#0a0f1a",
      tagline: "Systems that run the work.",
      taglineAr: "أنظمة تُدير العمل.",
      summary: "Automation, intelligent operations and the software layer beneath the group's companies — offered to partners as a service.",
      place: "Riyadh · Istanbul", image: IMG.pet, hero: IMG.pet,
      status: "launching", since: "2026",
      stats: [["10", "Services"], ["12", "Sectors"], ["720×", "Faster lead response"]],
      capabilities: ["Workflow automation", "AI operations", "Data platforms", "Digital products"],
    },
  ];

  const projects = [
    {
      id: "sira-prime", company: "realestate", name: "Sira Prime", kind: "Residential",
      place: "Istanbul, Türkiye", status: "Under development", year: "2026", image: IMG.prime, gallery: [IMG.villasIstanbul, IMG.realestate, IMG.istanbul],
      dek: "Flagship villa development with pre-sales underway.",
      body: [
        "Sira Prime is a low-rise residential community on Istanbul's Asian shore: 64 villas set around a shared garden spine, with a private clubhouse, a wellness building and direct access to the coastal path.",
        "Pre-sales opened in the second quarter of 2026 and the first phase is scheduled for handover in early 2028. The project is structured as an equity partnership, with SIRA Real Estate as developer and operator of the completed estate.",
      ],
      facts: [["Units", "64 villas"], ["Site", "9.2 ha"], ["Handover", "Q1 2028"], ["Structure", "Equity partnership"]],
      ticket: "$2M – $10M",
    },
    {
      id: "rosina-diagnostic-center", company: "healthcare", name: "Rosina Diagnostic Center", kind: "Diagnostic imaging",
      place: "Nairobi, Kenya", status: "Operational", year: "2021", image: IMG.rosina, gallery: [IMG.rosinaMri, IMG.pet, IMG.rosina],
      dek: "Advanced imaging and molecular diagnostics platform.",
      body: [
        "Rosina is SIRA Healthcare's flagship centre: MRI, CT, ultrasound and, since July 2026, a PET-CT molecular imaging wing for early-stage cancer diagnostics.",
        "The centre runs on the group's own facility-management system, which schedules modalities, tracks consumables and reports to referring clinicians in real time. It performs more than thirty thousand scans a year and grew 42% year on year.",
      ],
      facts: [["Modalities", "MRI · CT · US · PET-CT"], ["Scans / year", "30,000+"], ["Opened", "2021"], ["Growth", "+42% YoY"]],
      ticket: "$1M – $5M",
    },
    {
      id: "hospitality-platform", company: "lifestyle", name: "Hospitality Platform", kind: "Hospitality",
      place: "Middle East & Africa", status: "Coming soon", year: "2027", image: IMG.villasSunset, gallery: [IMG.hospitality, IMG.villasSunset],
      dek: "Founding-partner opportunity in the group's newest hospitality division.",
      body: [
        "SIRA Lifestyle's first platform brings together branded residences and a boutique hospitality operator across two coastal sites now in review.",
        "The division launched in 2026 and is open to a small number of founding partners who take a position across the platform rather than a single asset.",
      ],
      facts: [["Sites", "2 in review"], ["Model", "Owner-operator"], ["First opening", "2027"], ["Structure", "Founding partnership"]],
      ticket: "By invitation",
    },
    {
      id: "pet-ct-imaging-center", company: "healthcare", name: "PET-CT Imaging Center", kind: "Molecular imaging",
      place: "East Africa", status: "Planned", year: "2027", image: IMG.pet, gallery: [IMG.pet, IMG.rosinaMri],
      dek: "Next-generation molecular imaging for early cancer diagnosis.",
      body: [
        "A stand-alone molecular imaging centre replicating the Rosina PET-CT wing in a second East African city, with a regional cyclotron partnership for isotope supply.",
      ],
      facts: [["Modality", "PET-CT"], ["Stage", "Site selection"], ["Target", "2027"], ["Partner", "Regional cyclotron"]],
      ticket: "$1M – $5M", demo: true,
    },
    {
      id: "istanbul-financial-district-office", company: "consulting", name: "Istanbul Financial District Advisory", kind: "Advisory",
      place: "Istanbul, Türkiye", status: "Operational", year: "2025", image: IMG.istanbul2, gallery: [IMG.istanbul, IMG.istanbul2],
      dek: "Structuring East African healthcare and housing capital through Istanbul.",
      body: [
        "An ongoing advisory mandate structuring Turkish and Gulf capital into East African diagnostic and residential platforms, using Istanbul's financial district as the bridge jurisdiction.",
      ],
      facts: [["Mandate", "Multi-year"], ["Corridor", "Türkiye ⇄ East Africa"], ["Sectors", "Healthcare · Housing"]],
      ticket: "—", demo: true,
    },
    {
      id: "coastal-residences", company: "realestate", name: "Coastal Residences", kind: "Branded residences",
      place: "Istanbul, Türkiye", status: "Planned", year: "2028", image: IMG.villasIstanbul, gallery: [IMG.villasIstanbul, IMG.prime],
      dek: "Branded residences on the Bosphorus approach, operated with SIRA Lifestyle.",
      body: [
        "A second-phase site adjoining Sira Prime, planned as branded residences with a hospitality operator from the group's own Lifestyle division.",
      ],
      facts: [["Units", "38"], ["Stage", "Masterplan"], ["Operator", "SIRA Lifestyle"]],
      ticket: "$2M – $10M", demo: true,
    },
  ];

  const insights = [
    {
      id: "istanbul-africa-bridge", desk: "consulting", type: "Insight", date: "Aug 2026",
      title: "Why Istanbul Is Becoming Africa's Investment Bridge",
      dek: "How geography and policy are turning Turkish capital toward East African healthcare and housing.",
      image: IMG.istanbul, read: "6 min",
      body: [
        "Three things have happened at once. Turkish contractors have spent a decade building across the continent and know its procurement. Gulf capital wants exposure to East African growth without operating there directly. And Istanbul's financial district has quietly become the jurisdiction both sides accept.",
        "For SIRA the corridor is not a thesis but a daily route: our real estate teams are in Istanbul, our diagnostic centres are in Nairobi, and most of the capital that moves between them passes through the same handful of advisers.",
        "The question for a partner is not whether the bridge exists, but which side of it to build on first.",
      ],
    },
    {
      id: "nairobi-imaging-boom", desk: "healthcare", type: "Insight", date: "Aug 2026",
      title: "Inside Nairobi's Diagnostic Imaging Boom",
      dek: "Demand for advanced radiology is reshaping how healthcare investors think about East Africa.",
      image: IMG.rosinaMri, read: "5 min",
      body: [
        "Five years ago a patient in Nairobi who needed an MRI often waited weeks or flew abroad. Today Rosina alone performs more than thirty thousand scans a year, and demand is still growing faster than capacity.",
        "The investment case is unusual: cash-flow-positive within the first eighteen months, with growth constrained by equipment lead times rather than by demand.",
      ],
    },
    {
      id: "strategic-partner", desk: "group", type: "Article", date: "Aug 2026",
      title: "What We Look for in a Strategic Partner",
      dek: "A look at the criteria SIRA GROUP applies before entering a new market or venture.",
      image: IMG.villasSunset, read: "4 min",
      body: [
        "Long-term capital. Specialised operators. One house. Those are the three tests, and a venture that fails any of them does not proceed, however attractive the return.",
      ],
    },
    {
      id: "pet-ct-wing", desk: "healthcare", type: "News", date: "Jul 2026",
      title: "Rosina Diagnostic Center Adds PET-CT Molecular Imaging Wing",
      dek: "The Nairobi facility expands into early-stage cancer diagnostics.",
      image: IMG.pet, read: "3 min",
      body: ["The new wing brings molecular imaging to Nairobi for the first time under a single operator, with isotope supply secured through a regional partnership."],
    },
    {
      id: "lifestyle-launch", desk: "lifestyle", type: "News", date: "Jul 2026",
      title: "SIRA GROUP Expands Portfolio into Hospitality & Lifestyle",
      dek: "SIRA Lifestyle launches as the group's newest division.",
      image: IMG.hospitality, read: "3 min",
      body: ["The division will develop and operate hospitality assets and branded residences across the Middle East and Africa, beginning with two coastal sites now in review."],
    },
    {
      id: "coastal-residence-brief", desk: "realestate", type: "Article", date: "Jul 2025",
      title: "Design Brief: The Coastal Residence",
      dek: "The architectural principles behind SIRA Lifestyle's first ground-up development.",
      image: IMG.villasIstanbul, read: "7 min",
      body: ["Low, long and open to the water: the brief asked for buildings that disappear into the slope rather than announce themselves."],
      demo: true,
    },
  ];

  const services = [
    {
      n: "01", key: "development", title: "Real Estate Development & Consulting",
      dek: "Full-cycle development and advisory for residential and hospitality projects, from planning through post-development support.",
      company: "realestate", image: IMG.prime,
      items: ["Land assembly and masterplanning", "Design management", "Pre-sales and marketing", "Construction delivery", "Post-delivery operation"],
    },
    {
      n: "02", key: "diagnostics", title: "Medical Investment & Smart Diagnostics",
      dek: "Strategic partnership and operation of advanced diagnostic centers powered by intelligent management systems.",
      company: "healthcare", image: IMG.rosinaMri,
      items: ["Center feasibility and siting", "Equipment procurement", "Clinical partnerships", "Facility-management systems", "Operator model"],
    },
    {
      n: "03", key: "ventures", title: "Hospitality & Energy Ventures",
      dek: "Emerging investments in hospitality and energy infrastructure, extending our footprint into new markets.",
      company: "lifestyle", image: IMG.villasSunset,
      items: ["Platform formation", "Operator selection", "Founding partnerships", "Destination concepts"],
    },
    {
      n: "04", key: "advisory", title: "Market Entry & Investment Structuring",
      dek: "Execution support for partners moving capital between Europe, Africa and the Middle East.",
      company: "consulting", image: IMG.istanbul2,
      items: ["Market entry", "Investment structuring", "Partnership formation", "Regulatory pathway"],
    },
  ];

  const investor = {
    metrics: [
      ["$120M+", "Assets under development", "+18% YoY"],
      ["14–18%", "Projected IRR", "Target"],
      ["30K+", "Annual patient scans", "+42% YoY"],
      ["5+", "Markets across 3 continents", "Active"],
    ],
    opportunities: [
      { company: "realestate", title: "Sira Prime — Residential", dek: "Equity participation in a flagship villa development with pre-sales underway.", ticket: "$2M – $10M", project: "sira-prime" },
      { company: "healthcare", title: "Diagnostic Network Expansion", dek: "Scaling a cash-flow-positive diagnostic platform into new East African cities.", ticket: "$1M – $5M", project: "pet-ct-imaging-center" },
      { company: "lifestyle", title: "Hospitality Platform", dek: "Founding-partner opportunity in the group's newest hospitality division.", ticket: "By invitation", project: "hospitality-platform" },
    ],
  };

  const group = {
    stats: [["10+", "Years of experience", "Since 2014"], ["5+", "Countries", "Across three continents"], ["20+", "Projects delivered", "Across all divisions"], ["4", "Strategic partners", "Long-term relationships"]],
    testimonials: [
      { quote: "SIRA GROUP brought European rigor and local insight to every stage of delivery. A rare, dependable development partner.", name: "Mehmet Aydın", role: "Managing Director, OVAN Group" },
      { quote: "Their investment made advanced diagnostics accessible in Nairobi. The impact on patient care has been immediate.", name: "Dr. Amina Njoroge", role: "Medical Director, Rosina Diagnostic Center" },
      { quote: "They structure like a bank and deliver like a builder. That combination is why we keep coming back.", name: "Selin Kaya", role: "Partner, Rafeef", demo: true },
    ],
    partners: [{ name: "OVAN Group", logo: IMG.ovan }, { name: "Rafeef", logo: IMG.rafeef }],
    places: [
      { n: "01", city: "Istanbul", ar: "إسطنبول", role: "Headquarters · Real Estate", company: "realestate", image: IMG.istanbul },
      { n: "02", city: "Nairobi", ar: "نيروبي", role: "Healthcare operations", company: "healthcare", image: IMG.rosina },
      { n: "03", city: "Paris", ar: "باريس", role: "Investor relations", company: "consulting", image: IMG.istanbul2 },
      { n: "04", city: "Riyadh", ar: "الرياض", role: "SIRA Digital", company: "digital", image: IMG.pet },
    ],
  };

  const hero = [
    { project: "sira-prime", eyebrow: "SIRA Real Estate", place: "Istanbul, Türkiye", image: IMG.prime, title: ["Shaping", "a Smarter", "Future"], titleAr: ["نصنع", "مستقبلاً", "أذكى"] },
    { project: "rosina-diagnostic-center", eyebrow: "SIRA Healthcare", place: "Nairobi, Kenya", image: IMG.rosinaMri, title: ["Diagnostics", "Without", "Compromise"], titleAr: ["تشخيص", "بلا", "مساومة"] },
    { project: "hospitality-platform", eyebrow: "SIRA Lifestyle", place: "Coming soon", image: IMG.hospitality, title: ["Places People", "Return", "To"], titleAr: ["أماكن", "يعود إليها", "الناس"] },
  ];

  const i18n = {
    en: {
      dir: "ltr", companies: "Companies", investors: "Investors", projects: "Projects", services: "Services", insights: "Insights", contact: "Contact",
      contactCta: "Start a conversation", menu: "Menu", close: "Close", switch: "العربية", switchHint: "Read in Arabic",
      heroLead: "A multinational investment and development group operating across real estate, healthcare, hospitality and advisory in Europe, Africa and the Middle East.",
      viewProjects: "View projects", requestAdvisory: "Request advisory", featured: "Featured", of: "of",
      theHouse: "The house", houseTitle: ["One group,", "five companies."], houseLead: "SIRA GROUP operates as a house of specialised companies, each focused on a distinct market — with new divisions launching as the group expands.",
      explore: "Explore", allProjects: "All projects", allInsights: "All insights", readStory: "Read the story",
      wherewework: "Where we work", placesTitle: ["Bridging continents", "through smart investment."],
      placesLead: "Headquartered between Istanbul and Paris, SIRA GROUP invests in and operates ventures across real estate, healthcare, hospitality and energy — building infrastructure for the next generation of growth in Africa and the Middle East.",
      investorEyebrow: "Investor relations", investorTitle: ["Invest alongside", "SIRA GROUP."],
      investorLead: "We partner with institutional and private investors seeking exposure to high-growth real estate and healthcare across Africa, Europe and the Middle East.",
      requestPack: "Request the investor pack", ticket: "Ticket size",
      servicesEyebrow: "What we do", servicesTitle: ["Advisory, development", "and operation."],
      projectsEyebrow: "Global footprint", projectsTitle: ["Developments and facilities", "under way."],
      insightsEyebrow: "News & perspectives", insightsTitle: ["Perspectives from", "the markets we build in."],
      wordsEyebrow: "In their words", partnersEyebrow: "Our partners",
      ctaTitle: ["Ready to partner", "with us?"], ctaLead: "We welcome investment inquiries, partnership opportunities and professional collaboration across our markets.",
      footerTag: "Shaping a smarter future.", pages: "Pages", connect: "Connect", rights: "All rights reserved.",
      filterAll: "All", status: "Status", back: "Back", next: "Next project", facts: "At a glance", gallery: "Gallery",
      form: { name: "Full name", email: "Email address", service: "I'm interested in", message: "Your message", send: "Send message", sending: "Sending…", sent: "Thank you — your message has reached us.", sentLead: "A member of the SIRA GROUP team will respond directly, usually within two working days.", again: "Send another message", general: "General enquiry" },
      pack: { title: "Request the investor pack", lead: "Tell us who you are and we'll send the current pack and arrange an introduction.", type: "Investor type", types: ["Private / individual", "Family office", "Institutional"], range: "Indicative range", ranges: ["$250K – $1M", "$1M – $5M", "$5M+"], cta: "Request pack", done: "Requested — we'll be in touch within two working days." },
    },
    ar: {
      dir: "rtl", companies: "الشركات", investors: "المستثمرون", projects: "المشاريع", services: "الخدمات", insights: "رؤى", contact: "تواصل",
      contactCta: "ابدأ محادثة", menu: "القائمة", close: "إغلاق", switch: "English", switchHint: "Read in English",
      heroLead: "مجموعة استثمار وتطوير متعددة الجنسيات تعمل في العقارات والرعاية الصحية والضيافة والاستشارات في أوروبا وأفريقيا والشرق الأوسط.",
      viewProjects: "استعرض المشاريع", requestAdvisory: "اطلب استشارة", featured: "مميز", of: "من",
      theHouse: "البيت", houseTitle: ["مجموعة واحدة،", "خمس شركات."], houseLead: "تعمل مجموعة سيرا كبيت من الشركات المتخصصة، تركز كل منها على سوق مميز — مع إطلاق أقسام جديدة مع توسع المجموعة.",
      explore: "استكشف", allProjects: "كل المشاريع", allInsights: "كل الرؤى", readStory: "اقرأ القصة",
      wherewework: "أين نعمل", placesTitle: ["نربط القارات", "باستثمار ذكي."],
      placesLead: "من مقرها بين إسطنبول وباريس، تستثمر مجموعة سيرا وتدير مشاريع في العقارات والرعاية الصحية والضيافة والطاقة — لبناء البنية التحتية للجيل القادم من النمو في أفريقيا والشرق الأوسط.",
      investorEyebrow: "علاقات المستثمرين", investorTitle: ["استثمر إلى جانب", "مجموعة سيرا."],
      investorLead: "نتشارك مع مستثمرين مؤسسيين وأفراد يسعون للاستثمار في العقارات والرعاية الصحية عالية النمو في أفريقيا وأوروبا والشرق الأوسط.",
      requestPack: "اطلب ملف المستثمر", ticket: "حجم الاستثمار",
      servicesEyebrow: "ماذا نفعل", servicesTitle: ["استشارات وتطوير", "وتشغيل."],
      projectsEyebrow: "بصمة عالمية", projectsTitle: ["مشاريع ومنشآت", "قيد التنفيذ."],
      insightsEyebrow: "أخبار ورؤى", insightsTitle: ["رؤى من", "الأسواق التي نبني فيها."],
      wordsEyebrow: "بكلماتهم", partnersEyebrow: "شركاؤنا",
      ctaTitle: ["مستعد للشراكة", "معنا؟"], ctaLead: "نرحب باستفسارات الاستثمار وفرص الشراكة والتعاون المهني عبر أسواقنا.",
      footerTag: "نصنع مستقبلاً أذكى.", pages: "الصفحات", connect: "تواصل", rights: "جميع الحقوق محفوظة.",
      filterAll: "الكل", status: "الحالة", back: "رجوع", next: "المشروع التالي", facts: "لمحة سريعة", gallery: "معرض",
      form: { name: "الاسم الكامل", email: "البريد الإلكتروني", service: "أنا مهتم بـ", message: "رسالتك", send: "أرسل الرسالة", sending: "جارٍ الإرسال…", sent: "شكراً — وصلتنا رسالتك.", sentLead: "سيرد عليك أحد أعضاء فريق مجموعة سيرا مباشرة، عادةً خلال يومي عمل.", again: "أرسل رسالة أخرى", general: "استفسار عام" },
      pack: { title: "اطلب ملف المستثمر", lead: "أخبرنا من أنت وسنرسل الملف الحالي ونرتب تعريفاً.", type: "نوع المستثمر", types: ["فرد / خاص", "مكتب عائلي", "مؤسسي"], range: "النطاق التقريبي", ranges: ["$250K – $1M", "$1M – $5M", "$5M+"], cta: "اطلب الملف", done: "تم الطلب — سنتواصل معك خلال يومي عمل." },
    },
  };

  return { IMG, companies, projects, insights, services, investor, group, hero, i18n };
})();

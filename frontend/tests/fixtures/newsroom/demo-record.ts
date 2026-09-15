import type {
  EditorialDeskKey,
  EditorialItem,
  EditorialKind,
} from "@/lib/editorial/types";

// ---------------------------------------------------------------------------
// DEMO CONTENT — NOT SIRA ANNOUNCEMENTS.
//
// Every headline, summary, figure, place and partner name below is invented for
// design and layout testing. None of it is a SIRA GROUP announcement, none of
// it has been reviewed by anyone at SIRA, and nothing here may be published,
// quoted, or loaded into the CMS. It exists so the newsroom can be judged
// against the shapes real editorial actually takes rather than against four
// records and a placeholder.
//
// It is deliberately awkward in the places a design usually gets flattered:
//
//   - headlines from four words to twenty-two;
//   - summaries from one clause to three sentences, and several with none;
//   - roughly half the entries carrying no featured image at all;
//   - every desk, including two joint entries filed to two desks;
//   - all four content kinds;
//   - four publication years, including a year with a single entry;
//   - one entry with no date.
// ---------------------------------------------------------------------------

const DESK_GROUND: Readonly<Record<EditorialDeskKey, readonly [string, string]>> =
  Object.freeze({
    group: ["#101722", "#cca34b"],
    healthcare: ["#0d1c2b", "#2c6dad"],
    "real-estate": ["#1c1410", "#b0733c"],
    lifestyle: ["#0e1f1a", "#2e8c72"],
    consulting: ["#191324", "#8b5aae"],
    digital: ["#0a0f1a", "#d4a94f"],
  });

/**
 * A stand-in photograph.
 *
 * Flat geometry in the desk's own accent rather than a stock photo: the point
 * of these is to show how the composition behaves when an image is present and
 * how the desk accents sit together down a page, not to pretend the CMS has
 * art it does not have.
 */
function plate(desk: EditorialDeskKey, seed: number): string {
  const [ground, accent] = DESK_GROUND[desk];
  const x = 120 + ((seed * 137) % 640);
  const y = 90 + ((seed * 71) % 260);
  const r = 90 + ((seed * 53) % 130);

  return (
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">` +
        `<rect width="1200" height="900" fill="${ground}"/>` +
        `<circle cx="${x}" cy="${y}" r="${r}" fill="${accent}" opacity="0.5"/>` +
        `<rect x="0" y="${520 + (seed % 5) * 40}" width="1200" height="380" fill="${accent}" opacity="0.14"/>` +
        `<path d="M${140 + (seed % 7) * 60} 900 V${300 + (seed % 4) * 90} h180 v${120 + (seed % 3) * 60}" ` +
        `fill="none" stroke="${accent}" stroke-width="3" opacity="0.75"/>` +
        `</svg>`,
    )
  );
}

interface DemoSeed {
  readonly title: string;
  readonly excerpt: string | null;
  readonly kind: EditorialKind;
  readonly desks: readonly EditorialDeskKey[];
  readonly publishedAt: string | null;
  readonly image: boolean;
}

const SECTION_BY_KIND: Readonly<Record<EditorialKind, string>> = Object.freeze({
  news: "news",
  insight: "insights",
  article: "articles",
  "press-release": "press-releases",
});

const TYPENAME_BY_KIND = Object.freeze({
  news: "SiraNewsItem",
  insight: "SiraInsight",
  article: "SiraArticle",
  "press-release": "SiraPressRelease",
} as const);

const CONTENT_TYPE_BY_KIND = Object.freeze({
  news: "sira_news",
  insight: "sira_insight",
  article: "sira_article",
  "press-release": "sira_press_release",
} as const);

const SEEDS: readonly DemoSeed[] = Object.freeze([
  {
    title: "SIRA GROUP Signs Strategic Partnership with OVAN Group",
    excerpt:
      "A joint venture to accelerate residential delivery in Istanbul, combining capital, land and delivery capability across three districts.",
    kind: "news",
    desks: ["real-estate", "group"],
    publishedAt: "2026-07-14T09:00:00",
    image: true,
  },
  {
    title:
      "Rosina Diagnostic Center Adds a PET-CT Molecular Imaging Wing, Bringing Early-Stage Oncology Screening Within Reach of Nairobi's Referral Network",
    excerpt:
      "The facility expands into early-stage cancer diagnostics with next-generation molecular imaging, and becomes the first in the region to publish reporting turnaround times.",
    kind: "news",
    desks: ["healthcare"],
    publishedAt: "2026-06-02T08:30:00",
    image: true,
  },
  {
    title: "What We Underwrite",
    excerpt:
      "The five tests every SIRA investment has to pass before capital moves, and the one that disqualifies most opportunities.",
    kind: "insight",
    desks: ["group"],
    publishedAt: "2026-05-21T10:00:00",
    image: false,
  },
  {
    title: "SIRA Lifestyle Opens Founding-Partner Applications for Its First Coastal Property",
    excerpt: null,
    kind: "press-release",
    desks: ["lifestyle"],
    publishedAt: "2026-05-04T07:00:00",
    image: true,
  },
  {
    title: "Inside Nairobi's Diagnostic Imaging Boom",
    excerpt:
      "Why demand for advanced radiology is reshaping healthcare investment across East Africa. Imaging volumes are rising faster than bed capacity, and reporting turnaround — not machine count — has become the binding constraint.",
    kind: "article",
    desks: ["healthcare"],
    publishedAt: "2026-04-28T12:00:00",
    image: false,
  },
  {
    title: "Why Istanbul Remains a Resilient Property Market",
    excerpt:
      "The fundamentals continuing to draw international capital into Turkish real estate, and the two that have quietly weakened.",
    kind: "insight",
    desks: ["real-estate"],
    publishedAt: "2026-04-09T09:15:00",
    image: true,
  },
  {
    title: "SIRA Consulting Appointed to Advise on a Cross-Border Healthcare Platform",
    excerpt:
      "The mandate covers market entry, licensing and clinical partnership structure across two jurisdictions.",
    kind: "news",
    desks: ["consulting", "healthcare"],
    publishedAt: "2026-03-30T11:00:00",
    image: false,
  },
  {
    title: "Bridging Continents Through Smart Investment",
    excerpt:
      "How a house of specialised companies is building infrastructure for the next generation of growth.",
    kind: "article",
    desks: ["group"],
    publishedAt: "2026-03-11T09:00:00",
    image: true,
  },
  {
    title: "A Second Diagnostic Center for East Africa",
    excerpt: "Site selection has begun for a second facility, targeting 2027.",
    kind: "news",
    desks: ["healthcare"],
    publishedAt: "2026-02-19T08:00:00",
    image: false,
  },
  {
    title: "The Cost of Waiting",
    excerpt:
      "Three markets where the entry price moved against patient capital in eighteen months.",
    kind: "insight",
    desks: ["consulting"],
    publishedAt: "2026-02-02T10:30:00",
    image: false,
  },
  {
    title: "SIRA Prime Tops Out Four Weeks Ahead of Schedule",
    excerpt:
      "The Istanbul development reaches structural completion ahead of programme, with handover now expected in the first quarter.",
    kind: "news",
    desks: ["real-estate"],
    publishedAt: "2026-01-15T09:45:00",
    image: true,
  },
  {
    title: "Statement on the 2025 Portfolio Review",
    excerpt: null,
    kind: "press-release",
    desks: ["group"],
    publishedAt: "2026-01-08T16:00:00",
    image: false,
  },
  {
    title: "Hospitality Is an Operating Business, Not an Asset Class",
    excerpt:
      "Why SIRA Lifestyle staffs before it buys, and what that has cost us twice.",
    kind: "insight",
    desks: ["lifestyle"],
    publishedAt: "2025-11-24T09:00:00",
    image: false,
  },
  {
    title: "SIRA GROUP Completes Its Investment in Rosina Diagnostic Center",
    excerpt:
      "The transaction closes a nine-month process and gives the group a majority position in the facility.",
    kind: "news",
    desks: ["healthcare", "group"],
    publishedAt: "2025-10-06T08:00:00",
    image: true,
  },
  {
    title: "Notes From a Year of Building in Two Time Zones",
    excerpt:
      "What running an Istanbul development team and a Nairobi clinical team out of one investment committee actually requires, and the three things we would do differently.",
    kind: "article",
    desks: ["group"],
    publishedAt: "2025-09-12T09:00:00",
    image: false,
  },
  {
    title: "Consulting Practice Expands Its Market-Entry Team",
    excerpt: "Four senior appointments across Istanbul and Nairobi.",
    kind: "news",
    desks: ["consulting"],
    publishedAt: "2025-08-19T10:00:00",
    image: false,
  },
  {
    title: "Design Brief: The Coastal Residence",
    excerpt:
      "The architectural principles behind SIRA Lifestyle's first ground-up development.",
    kind: "article",
    desks: ["lifestyle"],
    publishedAt: "2025-07-01T09:00:00",
    image: true,
  },
  {
    title: "SIRA GROUP Turns Ten",
    excerpt: null,
    kind: "news",
    desks: ["group"],
    publishedAt: "2025-05-30T12:00:00",
    image: false,
  },
  {
    title: "Land Assembly and the Patience It Requires",
    excerpt:
      "Six years of acquisition on one Istanbul block, told through the four deals that nearly ended it.",
    kind: "article",
    desks: ["real-estate"],
    publishedAt: "2025-03-17T09:00:00",
    image: true,
  },
  {
    title: "Appointment of a Group Chief Investment Officer",
    excerpt: null,
    kind: "press-release",
    desks: ["group"],
    publishedAt: "2024-11-11T15:00:00",
    image: false,
  },
  {
    title: "What Good Partnership Looks Like After the First Year",
    excerpt:
      "Partnerships are underwritten on the pitch and judged on the second year. A note on what SIRA measures once the novelty is gone.",
    kind: "insight",
    desks: ["group", "consulting"],
    publishedAt: "2024-08-05T09:00:00",
    image: false,
  },
  {
    title: "First Clinical Partnership Signed in Nairobi",
    excerpt: "A referral agreement covering three private practices.",
    kind: "news",
    desks: ["healthcare"],
    publishedAt: "2024-04-22T08:30:00",
    image: false,
  },
  {
    title: "Istanbul Residential: A Ten-Year View",
    excerpt:
      "Demographics, currency and construction cost, and what each of them is likely to do to yields between now and 2034.",
    kind: "insight",
    desks: ["real-estate"],
    publishedAt: "2023-12-04T09:00:00",
    image: true,
  },
  {
    title: "Corporate Information Notice",
    excerpt: "Registered office and filing details.",
    kind: "press-release",
    desks: ["group"],
    publishedAt: null,
    image: false,
  },
]);

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 80)
    .replace(/-+$/u, "");
}

function toItem(seed: DemoSeed, index: number): EditorialItem {
  const kind = seed.kind;
  const primary = seed.desks[0] ?? "group";

  return Object.freeze({
    databaseId: 8000 + index,
    typename: TYPENAME_BY_KIND[kind],
    contentTypeName: CONTENT_TYPE_BY_KIND[kind],
    kind,
    title: seed.title,
    excerpt: seed.excerpt,
    href: `/${SECTION_BY_KIND[kind]}/${slugify(seed.title)}/`,
    publishedAt: seed.publishedAt,
    modifiedAt: null,
    featuredImage: seed.image
      ? Object.freeze({
          databaseId: 9000 + index,
          sourceUrl: plate(primary, index + 1),
          altText: null,
          width: 1200,
          height: 900,
        })
      : null,
    desks: Object.freeze([...seed.desks]),
  });
}

/** The whole demo record, newest first, exactly as the feed would hand it over. */
export const DEMO_RECORD: readonly EditorialItem[] = Object.freeze(
  SEEDS.map(toItem),
);

/** The subset a branch tenant would receive: one desk, no cross-filed entries. */
export function demoBranchRecord(
  desk: EditorialDeskKey,
): readonly EditorialItem[] {
  return Object.freeze(
    DEMO_RECORD.filter((item) => item.desks.includes(desk)).map((item) =>
      Object.freeze({ ...item, desks: Object.freeze([desk]) }),
    ),
  );
}

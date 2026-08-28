import { describe, expect, it, vi } from "vitest";
import { resolveHomepage } from "@/lib/homepage/get-homepage";
import { normalizeHomepage } from "@/lib/homepage/normalize-homepage";
import type { SiraHomepageQueryData } from "@/queries/homepage";
import type { BranchSiteKey } from "@/lib/homepage/types";

type HomepagePage = NonNullable<SiraHomepageQueryData["page"]>;

// Every section is its OWN standalone top-level field group, so it lives
// directly on `page` — not nested under `siraHomepage` (which now holds
// only `variant`), and not under a `groupHomepage`/`branchHomepage` wrapper
// either. See the note on PresentationFields.php's
// group_homepage_section_groups() and normalize-homepage.ts for why:
// WPGraphQL for ACF cannot resolve text/textarea/link/wysiwyg/relationship
// fields that live inside a `group`-type field nested inside another field
// group's own `fields` array. `hero`, `projects`, `insights`, and `contact`
// are the only names both variants used, so those four are prefixed
// (groupHero/branchHero, etc.) to stay unique as siblings; every other
// section name is unchanged. `statistics`/`focusAreas` are each their own
// field group wrapping a same-named repeater (a naming quirk explained in
// normalize-homepage.ts), hence the extra nesting level on those two below.
function emptyBranchFields() {
  return {
    branchHero: null,
    statistics: null,
    overview: null,
    focusAreas: null,
    branchProjects: null,
    branchInsights: null,
    branchContact: null,
    footer: null,
  };
}

function emptyGroupFields() {
  return {
    groupHero: null,
    ticker: null,
    latestUpdates: null,
    companies: null,
    about: null,
    investor: null,
    services: null,
    groupProjects: null,
    groupInsights: null,
    testimonials: null,
    partners: null,
    groupContact: null,
  };
}

function createBranchHomepage(title = "Consulting"): SiraHomepageQueryData {
  return {
    page: {
      databaseId: 42,
      uri: "/",
      title,
      siraHomepage: { variant: "branch" },
      ...emptyGroupFields(),
      ...emptyBranchFields(),
      branchHero: {
        eyebrow: "  Consulting  ",
        headingBefore: "Strategy for",
        headingHighlight: "new markets",
        headingAfter: null,
        description: "  Deliberate   growth. ",
        region: "Riyadh",
        imageAlt: null,
        image: null,
        mobileImage: null,
        primaryCta: null,
        secondaryCta: null,
      },
    },
  };
}

function createGroupHomepage(): SiraHomepageQueryData {
  return {
    page: {
      databaseId: 7,
      uri: "/",
      title: "SIRA Group",
      siraHomepage: { variant: "group" },
      ...emptyGroupFields(),
      ...emptyBranchFields(),
      groupHero: {
        headingBefore: "Shaping a",
        headingHighlight: "smarter",
        headingAfter: "future",
        description: "Long-term enterprise value.",
        primaryCta: null,
        secondaryCta: null,
        slides: null,
      },
    },
  };
}

function withBranchFields(overrides: Partial<HomepagePage>): SiraHomepageQueryData {
  const data = createBranchHomepage();
  const page = data.page as HomepagePage;
  return {
    page: { ...page, ...overrides },
  };
}

function withGroupFields(overrides: Partial<HomepagePage>): SiraHomepageQueryData {
  const data = createGroupHomepage();
  const page = data.page as HomepagePage;
  return {
    page: { ...page, ...overrides },
  };
}

function createProject(databaseId: number, restricted = false) {
  return {
    databaseId,
    contentTypeName: "sira_project",
    title: `Project ${databaseId}`,
    uri: `/projects/${databaseId}/`,
    excerpt: "<p>Public project</p>",
    isRestricted: restricted,
    featuredImage: null,
    projectDetails: {
      subtitle: "Flagship",
      location: "Riyadh",
      status: "active",
    },
  };
}

function createMedia(databaseId: number) {
  return {
    node: {
      databaseId,
      sourceUrl: `https://media.example.test/${databaseId}.jpg`,
      altText: `Image ${databaseId}`,
      isRestricted: false,
      mediaDetails: { width: 1600, height: 900 },
    },
  };
}

function createEditorial(databaseId: number) {
  return {
    __typename: "SiraInsight" as const,
    databaseId,
    contentTypeName: "sira_insight",
    date: "2026-08-20T10:00:00+00:00",
    modified: "2026-08-20T11:00:00+00:00",
    title: `Insight ${databaseId}`,
    uri: `/insights/${databaseId}/`,
    excerpt: "Editorial summary",
    isRestricted: false,
    featuredImage: createMedia(databaseId),
  };
}

function createCompleteGroupHomepage(): SiraHomepageQueryData {
  const emptyConnection = { nodes: [], pageInfo: { hasNextPage: false } };
  return withGroupFields({
    groupHero: {
      headingBefore: "Shaping a",
      headingHighlight: "smarter",
      headingAfter: "future",
      description: "Long-term enterprise value.",
      primaryCta: { title: "Explore", url: "/projects/", target: null },
      secondaryCta: { title: "Contact", url: "/contact/", target: null },
      slides: [{
        titleOverride: "Featured project",
        eyebrowOverride: "Group",
        descriptionOverride: "A flagship project",
        locationOverride: "Riyadh",
        imageAltOverride: "Project skyline",
        imageOverride: createMedia(500),
        mobileImageOverride: null,
        primaryCtaOverride: null,
        secondaryCtaOverride: null,
        businessUnit: {
          nodes: [{ databaseId: 5, name: "Healthcare", slug: "healthcare" }],
          pageInfo: { hasNextPage: false },
        },
        relatedProject: {
          nodes: [createProject(501)],
          pageInfo: { hasNextPage: false },
        },
        relatedCompany: emptyConnection,
      }],
    },
    ticker: {
      enabled: true,
      items: [{
        label: "SIRA Healthcare",
        link: { title: "Visit", url: "https://healthcare.siratrgroup.com/", target: "_blank" },
        businessUnit: emptyConnection,
      }],
    },
    latestUpdates: {
      eyebrow: "Latest",
      heading: "Updates",
      description: "From across SIRA",
      sourceMode: "selected",
      itemLimit: 3,
      link: { title: "Newsroom", url: "/news/", target: null },
      selectedItems: { nodes: [createEditorial(601)], pageInfo: { hasNextPage: false } },
    },
    companies: {
      eyebrow: "Portfolio",
      heading: "Companies",
      description: null,
      link: null,
      selectedCompanies: {
        pageInfo: { hasNextPage: false },
        nodes: [{
          databaseId: 602,
          contentTypeName: "sira_company",
          title: "SIRA Company",
          uri: "/companies/sira-company/",
          excerpt: null,
          isRestricted: false,
          featuredImage: null,
          companyDetails: {
            shortDescriptor: "Operating company",
            operatingStatus: "active",
            externalWebsiteUrl: "https://company.example.test/",
            cardImageOverride: createMedia(602),
          },
        }],
      },
    },
    about: {
      eyebrow: "About",
      heading: "SIRA Group",
      description: "Long-term platform",
      body: "<p>Enterprise body</p>",
      link: null,
      metrics: [{ value: "25", label: "Years", supportingText: "of experience" }],
    },
    investor: {
      eyebrow: "Investor",
      heading: "Investor relations",
      description: null,
      body: "<p>Investor body</p>",
      link: null,
      metrics: [],
      formHeading: "Request information",
      formDescription: "Presentation only",
      selectedInvestments: {
        pageInfo: { hasNextPage: false },
        nodes: [{
          databaseId: 603,
          contentTypeName: "sira_investment",
          title: "Public investment",
          uri: "/investments/public/",
          excerpt: null,
          isRestricted: false,
          featuredImage: null,
          investmentDetails: { publicDisplay: true, ticketSizeLabel: "Growth" },
        }],
      },
      onePagerDocument: emptyConnection,
    },
    services: {
      eyebrow: "Services",
      heading: "Capabilities",
      description: null,
      link: null,
      selectedServices: {
        pageInfo: { hasNextPage: false },
        nodes: [{
          databaseId: 604,
          contentTypeName: "sira_service",
          title: "Advisory",
          uri: "/services/advisory/",
          excerpt: "Service summary",
          isRestricted: false,
          featuredImage: null,
        }],
      },
    },
    groupProjects: {
      eyebrow: "Projects",
      heading: "Selected work",
      description: null,
      link: null,
      selectedProjects: { nodes: [createProject(605)], pageInfo: { hasNextPage: false } },
    },
    groupInsights: {
      eyebrow: "Insights",
      heading: "Perspectives",
      description: null,
      sourceMode: "selected",
      itemLimit: 3,
      link: null,
      selectedItems: emptyConnection,
    },
    testimonials: {
      eyebrow: "Voices",
      heading: "Testimonials",
      description: null,
      link: null,
      selectedTestimonials: {
        pageInfo: { hasNextPage: false },
        nodes: [{
          databaseId: 606,
          contentTypeName: "sira_testimonial",
          title: "Approved quote",
          uri: "/testimonials/approved/",
          excerpt: "Testimonial",
          isRestricted: false,
          featuredImage: null,
          testimonialDetails: { consentApproved: true, role: "CEO", organization: "Example", sourceUrl: null },
        }],
      },
    },
    partners: {
      eyebrow: "Partners",
      heading: "Our partners",
      description: null,
      link: null,
      selectedPartners: {
        pageInfo: { hasNextPage: false },
        nodes: [{
          databaseId: 607,
          contentTypeName: "sira_partner",
          title: "Partner",
          uri: "/partners/partner/",
          excerpt: null,
          isRestricted: false,
          featuredImage: createMedia(607),
          partnerDetails: { logoAltOverride: "Partner logo", relationshipLabel: "Strategic", websiteUrl: "https://partner.example.test/" },
        }],
      },
    },
    groupContact: { eyebrow: "Contact", heading: "Talk to SIRA", description: null, formVariant: "contact", formContext: "group-homepage" },
  });
}

function createCompleteBranchHomepage(): SiraHomepageQueryData {
  return withBranchFields({
    branchHero: {
      eyebrow: "Healthcare",
      headingBefore: "Care for",
      headingHighlight: "tomorrow",
      headingAfter: null,
      description: "Healthcare platform",
      region: "Saudi Arabia",
      imageAlt: "Healthcare team",
      image: createMedia(701),
      mobileImage: null,
      primaryCta: { title: "Projects", url: "/projects/", target: null },
      secondaryCta: null,
    },
    statistics: { statistics: [{ value: "12", label: "Facilities", supportingText: null }] },
    overview: { eyebrow: "Overview", heading: "Our focus", description: null, body: "<p>Overview</p>", link: null },
    focusAreas: { focusAreas: [{ title: "Delivery", description: "Integrated care" }] },
    branchProjects: {
      eyebrow: "Projects",
      heading: "Selected work",
      description: null,
      link: null,
      selectedProjects: { nodes: [createProject(702)], pageInfo: { hasNextPage: false } },
    },
    branchInsights: {
      eyebrow: "Insights",
      heading: "Latest thinking",
      description: null,
      sourceMode: "selected",
      itemLimit: 3,
      link: null,
      selectedItems: { nodes: [createEditorial(703)], pageInfo: { hasNextPage: false } },
    },
    branchContact: { eyebrow: "Contact", heading: "Talk to us", description: null, formVariant: "contact", formContext: "healthcare-homepage" },
    footer: { taglineOverride: "Care that advances", groupLinkLabelOverride: "SIRA Group" },
  });
}

describe("homepage server adapter", () => {
  it("normalizes complete valid Group fixture data across every supported section", () => {
    const result = normalizeHomepage("group", createCompleteGroupHomepage());
    expect(result).toMatchObject({
      status: "ready",
      homepage: {
        variant: "group",
        hero: { slides: [{ title: "Featured project", relatedProject: { status: "ready" } }] },
        ticker: { enabled: true, items: [{ label: "SIRA Healthcare" }] },
        latestUpdates: { selection: { status: "ready" } },
        companies: { selection: { status: "ready" } },
        about: { metrics: [{ value: "25" }] },
        investor: { investments: { status: "ready" }, onePager: { status: "empty" } },
        services: { selection: { status: "ready" } },
        projects: { selection: { status: "ready" } },
        insights: { selection: { status: "empty" } },
        testimonials: { selection: { status: "ready" } },
        partners: { selection: { status: "ready" } },
        contact: { formContext: "group-homepage" },
      },
    });
  });

  it("normalizes complete valid data through the single shared Branch contract", () => {
    expect(normalizeHomepage("healthcare", createCompleteBranchHomepage())).toMatchObject({
      status: "ready",
      homepage: {
        siteKey: "healthcare",
        variant: "branch",
        hero: { image: { databaseId: 701, width: 1600, height: 900 } },
        statistics: [{ value: "12" }],
        overview: { heading: "Our focus" },
        focusAreas: [{ title: "Delivery" }],
        projects: { selection: { status: "ready" } },
        insights: { selection: { status: "ready" } },
        contact: { formContext: "healthcare-homepage" },
        footer: { taglineOverride: "Care that advances" },
      },
    });
  });

  it("normalizes the complete canonical Group boundary with safe optional sections", () => {
    const result = normalizeHomepage("group", createGroupHomepage());

    expect(result).toMatchObject({
      status: "ready",
      homepage: {
        siteKey: "group",
        databaseId: 7,
        uri: "/",
        title: "SIRA Group",
        variant: "group",
        hero: {
          headingBefore: "Shaping a",
          headingHighlight: "smarter",
          headingAfter: "future",
          description: "Long-term enterprise value.",
          slides: [],
        },
        ticker: null,
        latestUpdates: null,
        companies: null,
        investor: null,
        contact: null,
      },
    });
  });

  it("normalizes one shared Branch boundary for every trusted branch key", () => {
    for (const siteKey of [
      "consulting",
      "healthcare",
      "lifestyle",
      "realestate",
    ] as const satisfies readonly BranchSiteKey[]) {
      expect(normalizeHomepage(siteKey, createBranchHomepage(siteKey))).toMatchObject({
        status: "ready",
        homepage: {
          siteKey,
          title: siteKey,
          variant: "branch",
          statistics: [],
          focusAreas: [],
          projects: null,
          insights: null,
          hero: {
            eyebrow: "Consulting",
            headingBefore: "Strategy for",
            headingHighlight: "new markets",
            description: "Deliberate growth.",
            image: null,
          },
        },
      });
    }
  });

  it("normalizes bounded project relationships and strips markup", () => {
    const data = withBranchFields({ branchProjects: {
      eyebrow: "Work",
      heading: "Projects",
      description: null,
      link: { title: "All", url: "/projects/", target: null },
      selectedProjects: {
        nodes: [createProject(81)],
        pageInfo: { hasNextPage: false },
      },
    } });

    expect(normalizeHomepage("consulting", data)).toMatchObject({
      status: "ready",
      homepage: {
        projects: {
          heading: "Projects",
          link: { label: "All", href: "/projects/", target: null },
          selection: {
            status: "ready",
            items: [{ kind: "project", databaseId: 81, excerpt: "Public project" }],
          },
        },
      },
    });
  });

  it("fails a curated relationship closed when the bounded result is truncated", () => {
    const data = withBranchFields({ branchProjects: {
      eyebrow: null,
      heading: "Projects",
      description: null,
      link: null,
      selectedProjects: {
        nodes: [createProject(81)],
        pageInfo: { hasNextPage: true },
      },
    } });

    expect(normalizeHomepage("consulting", data)).toMatchObject({
      status: "ready",
      homepage: {
        projects: {
          selection: {
            status: "invalid",
            reason: "relationship-truncated",
            items: [],
            diagnostics: [{ code: "relationship-truncated" }],
          },
        },
      },
    });
  });

  it("never exposes restricted relationship nodes", () => {
    const data = withBranchFields({ branchProjects: {
      eyebrow: null,
      heading: "Projects",
      description: null,
      link: null,
      selectedProjects: {
        nodes: [createProject(99, true)],
        pageInfo: { hasNextPage: false },
      },
    } });

    expect(normalizeHomepage("consulting", data)).toMatchObject({
      status: "ready",
      homepage: {
        projects: {
          selection: {
            status: "invalid",
            reason: "no-public-items",
            items: [],
            diagnostics: [{ code: "restricted-content-item", databaseId: 99 }],
          },
        },
      },
    });
  });

  it("exposes only public-display investments and consent-approved testimonials", () => {
    const investor: HomepagePage["investor"] = {
      eyebrow: null,
      heading: "Investor",
      description: null,
      body: null,
      link: null,
      metrics: null,
      formHeading: null,
      formDescription: null,
      onePagerDocument: null,
      selectedInvestments: {
        pageInfo: { hasNextPage: false },
        nodes: [
          {
            databaseId: 1,
            contentTypeName: "sira_investment",
            title: "Private",
            uri: "/investments/private/",
            excerpt: null,
            isRestricted: false,
            featuredImage: null,
            investmentDetails: { publicDisplay: false, ticketSizeLabel: null },
          },
          {
            databaseId: 2,
            contentTypeName: "sira_investment",
            title: "Public",
            uri: "/investments/public/",
            excerpt: null,
            isRestricted: false,
            featuredImage: null,
            investmentDetails: { publicDisplay: true, ticketSizeLabel: "Growth" },
          },
        ],
      },
    };
    const testimonials: HomepagePage["testimonials"] = {
      eyebrow: null,
      heading: "Testimonials",
      description: null,
      link: null,
      selectedTestimonials: {
        pageInfo: { hasNextPage: false },
        nodes: [
          {
            databaseId: 3,
            contentTypeName: "sira_testimonial",
            title: "No consent",
            uri: "/testimonials/3/",
            excerpt: null,
            isRestricted: false,
            featuredImage: null,
            testimonialDetails: {
              consentApproved: false,
              role: null,
              organization: null,
              sourceUrl: null,
            },
          },
          {
            databaseId: 4,
            contentTypeName: "sira_testimonial",
            title: "Approved",
            uri: "/testimonials/4/",
            excerpt: null,
            isRestricted: false,
            featuredImage: null,
            testimonialDetails: {
              consentApproved: true,
              role: "CEO",
              organization: "Example",
              sourceUrl: null,
            },
          },
        ],
      },
    };
    const data = withGroupFields({ investor, testimonials });

    expect(normalizeHomepage("group", data)).toMatchObject({
      status: "ready",
      homepage: {
        investor: {
          investments: {
            status: "ready",
            items: [{ databaseId: 2, kind: "investment" }],
            diagnostics: [{ code: "restricted-content-item", databaseId: 1 }],
          },
        },
        testimonials: {
          selection: {
            status: "ready",
            items: [{ databaseId: 4, kind: "testimonial" }],
            diagnostics: [{ code: "restricted-content-item", databaseId: 3 }],
          },
        },
      },
    });
  });

  it("keeps Group and Branch variants isolated by the trusted site key", () => {
    expect(normalizeHomepage("group", createBranchHomepage())).toEqual({
      status: "invalid",
      siteKey: "group",
      reason: "variant-mismatch",
    });
    for (const branch of ["consulting", "healthcare", "lifestyle", "realestate"] as const) {
      expect(normalizeHomepage(branch, createGroupHomepage())).toEqual({
        status: "invalid",
        siteKey: branch,
        reason: "variant-mismatch",
      });
    }
  });

  it("represents a missing root page without fabricating another page", () => {
    expect(normalizeHomepage("healthcare", { page: null })).toEqual({
      status: "not-found",
      siteKey: "healthcare",
      reason: "homepage-not-configured",
    });
  });

  it("reports an unsupported homepage data shape explicitly", () => {
    const data = createBranchHomepage();
    if (data.page === null) throw new Error("fixture");
    expect(normalizeHomepage("consulting", {
      page: { ...data.page, siraHomepage: null },
    })).toEqual({
      status: "invalid",
      siteKey: "consulting",
      reason: "missing-homepage-data",
    });
  });

  it("maps remote failures to a stable server result", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    await expect(resolveHomepage("lifestyle", async () => {
      throw new Error("endpoint unavailable");
    })).resolves.toEqual({ status: "remote-error", siteKey: "lifestyle", errorName: "Error" });
    expect(warning).toHaveBeenCalledWith(
      "SIRA homepage query failed.",
      expect.objectContaining({ siteKey: "lifestyle", errorName: "Error" }),
    );
    warning.mockRestore();
  });
});

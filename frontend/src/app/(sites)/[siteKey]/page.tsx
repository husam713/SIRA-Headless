import { notFound } from "next/navigation";
import { BranchHero } from "@/components/homepage/branch-hero";
import { BranchOverview } from "@/components/homepage/branch-overview";
import { BranchStats } from "@/components/homepage/branch-stats";
import { GroupAbout } from "@/components/homepage/group-about";
import { GroupCompanies } from "@/components/homepage/group-companies";
import { GroupContact } from "@/components/homepage/group-contact";
import { GroupHero } from "@/components/homepage/group-hero";
import { GroupInsights } from "@/components/homepage/group-insights";
import { GroupInvestor } from "@/components/homepage/group-investor";
import { GroupLatestUpdates } from "@/components/homepage/group-latest-updates";
import { GroupPartners } from "@/components/homepage/group-partners";
import { GroupProjects } from "@/components/homepage/group-projects";
import { GroupServices } from "@/components/homepage/group-services";
import { GroupTestimonials } from "@/components/homepage/group-testimonials";
import { GroupTicker } from "@/components/homepage/group-ticker";
import { getBrand } from "@/lib/brand";
import { getHomepageForRequest } from "@/lib/homepage";
import { getSiteDefinition } from "@/lib/host/resolve-site";

interface SiteHomePageProps {
  readonly params: Promise<{
    readonly siteKey: string;
  }>;
}

export default async function SiteHomePage({
  params,
}: SiteHomePageProps) {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) {
    notFound();
  }

  const [brand, homepage] = await Promise.all([
    getBrand(site.key),
    getHomepageForRequest(site.key),
  ]);

  if (homepage.status === "ready" && homepage.homepage.variant === "group") {
    return (
      <>
        {/*
          Hidden, not decorative: carries the resolved WordPress page title so
          published-vs-draft data selection stays independently verifiable in
          rendered output (see scripts/preview-runtime-check.mjs), without
          duplicating the hero's own <h1> for screen-reader users.
        */}
        <span className="sr-only" data-sira-homepage-title>
          {homepage.homepage.title}
        </span>
        <GroupHero hero={homepage.homepage.hero} />
        <GroupTicker ticker={homepage.homepage.ticker} />
        <GroupLatestUpdates section={homepage.homepage.latestUpdates} />
        <GroupCompanies section={homepage.homepage.companies} />
        <GroupAbout section={homepage.homepage.about} />
        <GroupInvestor section={homepage.homepage.investor} />
        <GroupServices section={homepage.homepage.services} />
        <GroupProjects section={homepage.homepage.projects} />
        <GroupInsights section={homepage.homepage.insights} />
        <GroupTestimonials section={homepage.homepage.testimonials} />
        <GroupPartners section={homepage.homepage.partners} />
        <GroupContact
          section={homepage.homepage.contact}
          email={brand.email}
          address={brand.address}
        />
      </>
    );
  }

  if (homepage.status === "ready" && homepage.homepage.variant === "branch") {
    const { homepage: branch } = homepage;

    return (
      <>
        {/*
          Hidden, not decorative: carries the resolved WordPress page title so
          published-vs-draft data selection stays independently verifiable in
          rendered output (see scripts/preview-runtime-check.mjs), without
          duplicating the hero's own <h1> for screen-reader users.
        */}
        <span className="sr-only" data-sira-homepage-title>
          {branch.title}
        </span>
        <BranchHero hero={branch.hero} />
        <BranchStats statistics={branch.statistics} />
        <BranchOverview overview={branch.overview} focusAreas={branch.focusAreas} />
        <GroupProjects section={branch.projects} />
        <GroupInsights section={branch.insights} />
        <GroupContact
          section={branch.contact}
          email={brand.email}
          address={brand.address}
        />
      </>
    );
  }

  const homepageTitle =
    homepage.status === "ready" ? homepage.homepage.title : brand.name;

  return (
    <section className="mx-auto grid min-h-[60svh] max-w-7xl content-center gap-6 px-6 py-20 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">
        Step 3
      </p>

      <h1
        className="max-w-4xl text-balance font-display text-4xl font-medium tracking-tight sm:text-6xl"
        data-sira-homepage-title
      >
        {homepageTitle}
      </h1>

      <p className="max-w-2xl text-pretty text-lg leading-8 text-brand-ink-soft">
        Brand identity is supplied by WordPress when available. Semantic
        presentation tokens, typography, and local fallback assets remain
        frontend-owned.
      </p>

      <dl className="grid max-w-3xl gap-4 rounded-xl border border-brand-border bg-brand-tint p-6 sm:grid-cols-3">
        <div>
          <dt className="text-sm text-brand-ink-faint">Site key</dt>
          <dd className="font-medium">{site.key}</dd>
        </div>
        <div>
          <dt className="text-sm text-brand-ink-faint">Brand source</dt>
          <dd className="font-medium">{brand.source}</dd>
        </div>
        <div>
          <dt className="text-sm text-brand-ink-faint">Canonical hostname</dt>
          <dd className="font-medium">{site.canonicalHostname}</dd>
        </div>
      </dl>
    </section>
  );
}

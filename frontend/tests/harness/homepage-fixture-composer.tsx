import type { ReactElement } from "react";
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
import { createBrandCssVariables } from "@/lib/brand/css-variables";
import { createFallbackBrand } from "@/lib/brand/fallbacks";
import type { BranchHomepage, GroupHomepage } from "@/lib/homepage/types";
import type { SiteKey } from "@/types/site";

// Test-only composer. It imports the REAL production section components and
// mirrors the composition in src/app/(sites)/[siteKey]/page.tsx, including the
// conditional hero. It deliberately re-implements no markup of its own: every
// element below comes from production code, so what the harness screenshots is
// what the site renders.
//
// tests/contract/fixture-harness-parity.test.ts fails if this file and page.tsx
// ever stop rendering the same set of homepage components.
//
// The shared shell (SiteHeader / SiteFooter) lives in the route layout, not the
// page, and needs live navigation data, so it is out of this harness's scope.

// Production puts the brand tokens on <html> and the paper/ink classes on
// <body> (see src/components/brand/brand-document.tsx). The harness renders a
// fragment, so it mirrors both onto one wrapper: without it every fixture
// renders with default colours and the four tenants are indistinguishable.
//
// The values come from the real brand exports, never from a copy of the
// palette. Fonts are deliberately NOT handled here - next/font cannot be
// imported outside the Next compiler - so scripts/verify-homepage-fixtures.mjs
// applies the font-variable classes it discovers in the built CSS.
export function withBrandTokens(
  siteKey: SiteKey,
  children: ReactElement,
): ReactElement {
  const brand = createFallbackBrand(siteKey);

  return (
    <div
      data-brand-key={brand.key}
      data-brand-source={brand.source}
      className="min-h-screen bg-brand-paper font-sans text-brand-ink antialiased"
      style={createBrandCssVariables(brand)}
    >
      {children}
    </div>
  );
}

const FIXTURE_EMAIL = "fixtures@example.test";
const FIXTURE_ADDRESS = "Fixture address, Riyadh";

export function composeGroupHomepage(homepage: GroupHomepage): ReactElement {
  return (
    <>
      <span className="sr-only" data-sira-homepage-title>
        {homepage.title}
      </span>
      {homepage.hero !== null && <GroupHero hero={homepage.hero} />}
      <GroupTicker ticker={homepage.ticker} />
      <GroupLatestUpdates section={homepage.latestUpdates} />
      <GroupCompanies section={homepage.companies} />
      <GroupAbout section={homepage.about} />
      <GroupInvestor section={homepage.investor} />
      <GroupServices section={homepage.services} />
      <GroupProjects section={homepage.projects} />
      <GroupInsights section={homepage.insights} />
      <GroupTestimonials section={homepage.testimonials} />
      <GroupPartners section={homepage.partners} />
      <GroupContact
        section={homepage.contact}
        email={FIXTURE_EMAIL}
        address={FIXTURE_ADDRESS}
      />
    </>
  );
}

export function composeBranchHomepage(homepage: BranchHomepage): ReactElement {
  return (
    <>
      <span className="sr-only" data-sira-homepage-title>
        {homepage.title}
      </span>
      {homepage.hero !== null && <BranchHero hero={homepage.hero} />}
      <BranchStats statistics={homepage.statistics} />
      <BranchOverview
        overview={homepage.overview}
        focusAreas={homepage.focusAreas}
      />
      <GroupProjects section={homepage.projects} />
      <GroupInsights section={homepage.insights} />
      <GroupContact
        section={homepage.contact}
        email={FIXTURE_EMAIL}
        address={FIXTURE_ADDRESS}
      />
    </>
  );
}

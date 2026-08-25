import { notFound } from "next/navigation";
import { GroupHero } from "@/components/homepage/group-hero";
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
    return <GroupHero hero={homepage.homepage.hero} />;
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

import { notFound } from "next/navigation";
import { getBrand } from "@/lib/brand";
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

  const brand = await getBrand(site.key);

  return (
    <section className="mx-auto grid min-h-[60svh] max-w-7xl content-center gap-6 px-6 py-20 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">
        Step 2C
      </p>

      <h1 className="max-w-4xl text-balance font-display text-4xl font-medium tracking-tight sm:text-6xl">
        {brand.name} is using the approved SIRA brand foundation.
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

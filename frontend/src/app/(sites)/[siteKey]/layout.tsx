import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BrandDocument } from "@/components/brand/brand-document";
import { getBrand } from "@/lib/brand";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { SITE_KEYS } from "@/types/site";
import "@/styles/globals.css";

interface SiteLayoutProps {
  readonly children: ReactNode;
  readonly params: Promise<{
    readonly siteKey: string;
  }>;
}

export function generateStaticParams(): Array<{ siteKey: string }> {
  return SITE_KEYS.map((siteKey) => ({ siteKey }));
}

export async function generateMetadata({
  params,
}: Pick<SiteLayoutProps, "params">): Promise<Metadata> {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) {
    notFound();
  }

  const [brand, requestHeaders, draft] = await Promise.all([
    getBrand(site.key),
    headers(),
    draftMode(),
  ]);
  const hostname = requestHeaders.get("host") ?? "";
  const discovery = resolveSiteDiscoveryContext(site.key, hostname);

  return buildSiteMetadata(discovery, brand, "/", {
    forceNoIndex: draft.isEnabled,
  });
}

export default async function SiteLayout({
  children,
  params,
}: SiteLayoutProps) {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) {
    notFound();
  }

  const [brand, draft] = await Promise.all([
    getBrand(site.key),
    draftMode(),
  ]);

  return (
    <BrandDocument site={site} brand={brand}>
      <a
        href="#main-content"
        className="fixed start-4 top-4 z-50 -translate-y-24 rounded-md bg-brand-ink px-4 py-3 text-brand-paper transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      {draft.isEnabled ? (
        <aside
          aria-label="Preview Mode"
          className="border-b border-brand-border bg-brand-tint px-6 py-3 text-sm"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <strong>Preview Mode</strong>
            <Link className="underline" href="/api/preview/exit?destination=/">
              Exit Preview
            </Link>
          </div>
        </aside>
      ) : null}

      <header className="border-b border-brand-border bg-brand-paper-glass backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <p className="font-display text-xl font-semibold tracking-wide">
            {brand.name}
          </p>
          <p className="text-sm text-brand-ink-faint">
            {site.canonicalHostname}
          </p>
        </div>
      </header>

      <main id="main-content">{children}</main>

      <footer className="border-t border-brand-deep-border bg-brand-footer text-brand-paper">
        <div className="mx-auto max-w-7xl px-6 py-8 text-sm text-brand-paper/70 lg:px-8">
          SIRA Enterprise headless frontend scaffold
        </div>
      </footer>
    </BrandDocument>
  );
}

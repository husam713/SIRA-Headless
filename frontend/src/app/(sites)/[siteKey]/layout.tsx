import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  BrandDocument,
} from "@/components/brand/brand-document";
import {
  getBrand,
} from "@/lib/brand";
import {
  getSiteDefinition,
} from "@/lib/host/resolve-site";
import {
  SITE_KEYS,
} from "@/types/site";
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

export const metadata: Metadata = {
  title: {
    default: "SIRA Enterprise",
    template: "%s | SIRA Enterprise",
  },
  description: "SIRA Enterprise headless platform.",
};

export default async function SiteLayout({
  children,
  params,
}: SiteLayoutProps) {
  const { siteKey } = await params;
  const site = getSiteDefinition(siteKey);

  if (site === null) {
    notFound();
  }

  const brand = await getBrand(site.key);

  return (
    <BrandDocument site={site} brand={brand}>
      <a
        href="#main-content"
        className="fixed start-4 top-4 z-50 -translate-y-24 rounded-md bg-brand-ink px-4 py-3 text-brand-paper transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

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

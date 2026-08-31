import type { Metadata } from "next";
import { draftMode, headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { BrandDocument } from "@/components/brand/brand-document";
import { SiteFooter } from "@/components/shell/site-footer";
import { SiteHeader } from "@/components/shell/site-header";
import { PageContainer } from "@/components/layout/page-container";
import { getBrand } from "@/lib/brand";
import { getSiteDefinition } from "@/lib/host/resolve-site";
import { getHomepageForRequest } from "@/lib/homepage";
import { getNavigation } from "@/lib/navigation";
import type { NavigationItem, NavigationResolution } from "@/lib/navigation";
import { buildSiteMetadata } from "@/lib/seo/metadata";
import { resolveSiteDiscoveryContext } from "@/lib/seo/discovery";
import { SiteStructuredDataScripts } from "@/lib/seo/structured-data";
import { SITE_KEYS, type SiteKey } from "@/types/site";
import "@/styles/globals.css";

function scopeItems(
  navigation: NavigationResolution,
  scope: "primary" | "footer",
): readonly NavigationItem[] {
  if (navigation.status !== "resolved") return [];
  const resolution = navigation[scope];
  return resolution.status === "ready" ? resolution.menu.items : [];
}

/** Present on branch sites only — SIRA GROUP has no cross-link to itself. */
function resolveGroupCrossLink(
  siteKey: SiteKey,
): { readonly name: string; readonly canonicalHostname: string } | null {
  if (siteKey === "group") return null;
  const groupSite = getSiteDefinition("group");
  return groupSite === null
    ? null
    : { name: groupSite.name, canonicalHostname: groupSite.canonicalHostname };
}

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

  // getHomepageForRequest is request-cached and already awaited by the page,
  // so this resolves the same promise rather than issuing a second query. The
  // footer lives in the layout but its branch overrides arrive with homepage
  // data, which is why they were previously parsed and then dropped.
  const [brand, draft, navigation, homepage] = await Promise.all([
    getBrand(site.key),
    draftMode(),
    getNavigation(site.key),
    getHomepageForRequest(site.key),
  ]);

  const branchFooter =
    homepage.status === "ready" && homepage.homepage.variant === "branch"
      ? homepage.homepage.footer
      : null;

  const groupSite = resolveGroupCrossLink(site.key);
  const groupHeaderLink = groupSite === null
    ? null
    : { label: `${groupSite.name} ↗`, href: `https://${groupSite.canonicalHostname}/` };
  const groupFooterLink = groupSite === null
    ? null
    : {
        label: `${branchFooter?.groupLinkLabelOverride ?? `A ${groupSite.name} Company`} ↗`,
        href: `https://${groupSite.canonicalHostname}/`,
      };

  return (
    <BrandDocument site={site} brand={brand}>
      <SiteStructuredDataScripts siteKey={site.key} brand={brand} />

      <a
        href="#main-content"
        className="fixed start-4 top-4 z-50 -translate-y-24 rounded-md bg-brand-ink px-4 py-3 text-brand-paper transition-transform focus:translate-y-0"
      >
        Skip to main content
      </a>

      {draft.isEnabled ? (
        <aside
          aria-label="Preview Mode"
          className="border-b border-brand-border bg-brand-tint text-sm"
        >
          {/* The gutter belongs to the container, not the <aside>: the old
              px-6 carried no lg: step, so this banner desynced from the
              header and every section at wide viewports. */}
          <PageContainer className="flex items-center justify-between gap-4 py-3">
            <strong>Preview Mode</strong>
            <Link className="underline" href="/api/preview/exit/?destination=/">
              Exit Preview
            </Link>
          </PageContainer>
        </aside>
      ) : null}

      <SiteHeader
        brand={brand}
        items={scopeItems(navigation, "primary")}
        groupLink={groupHeaderLink}
      />

      <main id="main-content">{children}</main>

      <SiteFooter
        brand={brand}
        items={scopeItems(navigation, "footer")}
        groupLink={groupFooterLink}
        taglineOverride={branchFooter?.taglineOverride ?? null}
      />
    </BrandDocument>
  );
}

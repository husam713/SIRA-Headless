import type { ResolvedBrand } from "@/lib/brand/types";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import type { SiteKey } from "@/types/site";

const SCHEMA_CONTEXT = "https://schema.org" as const;

export interface OrganizationStructuredData {
  readonly "@context": typeof SCHEMA_CONTEXT;
  readonly "@type": "Organization";
  readonly name: string;
  readonly url: string;
  readonly description?: string;
  readonly logo?: string;
  readonly email?: string;
  readonly telephone?: string;
  readonly sameAs?: readonly string[];
}

export interface WebSiteStructuredData {
  readonly "@context": typeof SCHEMA_CONTEXT;
  readonly "@type": "WebSite";
  readonly name: string;
  readonly url: string;
}

export interface SiteStructuredData {
  readonly organization: OrganizationStructuredData;
  readonly website: WebSiteStructuredData;
}

function normalizePublicUrl(value: string | null): string | null {
  if (value === null) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      url.username !== "" ||
      url.password !== ""
    ) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function getOrganizationLogo(
  siteKey: SiteKey,
  brand: ResolvedBrand,
): string | undefined {
  if (brand.remoteLogo !== null) {
    return brand.remoteLogo.sourceUrl;
  }

  const localLogo = brand.assets.logo;

  if (localLogo === null || localLogo.decorative) {
    return undefined;
  }

  return buildCanonicalUrl(siteKey, localLogo.src).toString();
}

function getSocialProfiles(brand: ResolvedBrand): readonly string[] {
  return Object.values(brand.socialProfiles).flatMap((value) => {
    const normalized = normalizePublicUrl(value);

    return normalized === null ? [] : [normalized];
  });
}

function assertTenantBrand(siteKey: SiteKey, brand: ResolvedBrand): void {
  if (brand.siteKey !== siteKey || brand.key !== siteKey) {
    throw new TypeError(
      `Structured data brand identity does not match SIRA site ${siteKey}.`,
    );
  }
}

export function buildOrganizationStructuredData(
  siteKey: SiteKey,
  brand: ResolvedBrand,
): OrganizationStructuredData {
  assertTenantBrand(siteKey, brand);

  const description = brand.description ?? brand.tagline ?? undefined;
  const logo = getOrganizationLogo(siteKey, brand);
  const sameAs = getSocialProfiles(brand);

  return Object.freeze({
    "@context": SCHEMA_CONTEXT,
    "@type": "Organization",
    name: brand.name,
    url: buildCanonicalUrl(siteKey, "/").toString(),
    ...(description === undefined ? {} : { description }),
    ...(logo === undefined ? {} : { logo }),
    ...(brand.email === null ? {} : { email: brand.email }),
    ...(brand.phone === null ? {} : { telephone: brand.phone }),
    ...(sameAs.length === 0 ? {} : { sameAs: Object.freeze(sameAs) }),
  });
}

export function buildWebSiteStructuredData(
  siteKey: SiteKey,
  brand: ResolvedBrand,
): WebSiteStructuredData {
  assertTenantBrand(siteKey, brand);

  return Object.freeze({
    "@context": SCHEMA_CONTEXT,
    "@type": "WebSite",
    name: brand.name,
    url: buildCanonicalUrl(siteKey, "/").toString(),
  });
}

export function buildSiteStructuredData(
  siteKey: SiteKey,
  brand: ResolvedBrand,
): SiteStructuredData {
  return Object.freeze({
    organization: buildOrganizationStructuredData(siteKey, brand),
    website: buildWebSiteStructuredData(siteKey, brand),
  });
}

const UNSAFE_JSON_LD_CHARACTERS = /[<>&\u2028\u2029]/g;
const JSON_LD_CHARACTER_ESCAPES = Object.freeze({
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029",
} as const);

export function serializeJsonLd(value: unknown): string {
  const serialized = JSON.stringify(value);

  if (serialized === undefined) {
    throw new TypeError("JSON-LD value must be JSON serializable.");
  }

  return serialized.replace(
    UNSAFE_JSON_LD_CHARACTERS,
    (character) =>
      JSON_LD_CHARACTER_ESCAPES[
        character as keyof typeof JSON_LD_CHARACTER_ESCAPES
      ],
  );
}

interface JsonLdScriptProps {
  readonly data: unknown;
}

export function JsonLdScript({ data }: JsonLdScriptProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}

interface SiteStructuredDataProps {
  readonly siteKey: SiteKey;
  readonly brand: ResolvedBrand;
}

export function SiteStructuredDataScripts({
  siteKey,
  brand,
}: SiteStructuredDataProps) {
  const data = buildSiteStructuredData(siteKey, brand);

  return (
    <>
      <JsonLdScript data={data.organization} />
      <JsonLdScript data={data.website} />
    </>
  );
}

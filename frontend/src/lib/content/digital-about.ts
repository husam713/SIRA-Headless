import "server-only";

import { cache } from "react";
import { fetchPublishedGraphQL, SiraGraphQLError } from "@/lib/graphql";
import {
  normalizeLink,
  normalizeMedia,
  normalizePlainText,
  normalizeRichText,
} from "@/lib/homepage/normalize-homepage";
import type { HomepageLink, HomepageMedia } from "@/lib/homepage/types";
import { SIRA_DIGITAL_ABOUT_QUERY } from "@/queries/digital-about";
import type { LocaleCode, SiteKey } from "@/types/site";
import { recordLocale } from "./get-content-page";

/**
 * The About page: its composition, and the people it introduces.
 *
 * Every section is independently nullable and the route omits any that resolves
 * to null. That is the same rule the homepage follows, and it is what lets this
 * page ship before the owner has supplied the real team, figures and portraits
 * without a single one of them being invented in React.
 */

export interface AboutHero {
  readonly eyebrow: string | null;
  readonly headingBefore: string | null;
  readonly headingHighlight: string | null;
  readonly headingAfter: string | null;
  readonly description: string | null;
  readonly primaryCta: HomepageLink | null;
  readonly secondaryCta: HomepageLink | null;
  readonly portrait: HomepageMedia | null;
}

export interface AboutStat {
  readonly value: string;
  readonly label: string | null;
}

export interface AboutSectionHeader {
  readonly eyebrow: string | null;
  readonly heading: string | null;
  readonly standfirst: string | null;
}

export interface AboutSocial {
  readonly network: string;
  readonly href: string;
}

export interface AboutStatement {
  readonly ghostWord: string | null;
  readonly body: string | null;
  readonly quote: string | null;
  readonly attributionName: string | null;
  readonly attributionRole: string | null;
  readonly socials: readonly AboutSocial[];
}

export interface AboutProcessStep {
  readonly title: string;
  readonly body: string | null;
}

export interface AboutProcess extends AboutSectionHeader {
  readonly steps: readonly AboutProcessStep[];
}

export interface TeamMember {
  readonly databaseId: number;
  readonly slug: string;
  readonly name: string;
  readonly role: string | null;
  readonly summary: string | null;
  readonly portrait: HomepageMedia | null;
  readonly locale: LocaleCode | null;
}

export interface DigitalAbout {
  readonly hero: AboutHero | null;
  readonly stats: readonly AboutStat[];
  readonly team: AboutSectionHeader | null;
  readonly people: readonly TeamMember[];
  readonly statement: AboutStatement | null;
  readonly process: AboutProcess | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** A section whose every field came back empty is absent, not blank. */
function present<T extends object>(section: T): T | null {
  return Object.values(section).every(
    (field) => field === null || (Array.isArray(field) && field.length === 0),
  )
    ? null
    : Object.freeze(section);
}

function normalizeHero(value: unknown): AboutHero | null {
  if (!isRecord(value)) return null;

  return present<AboutHero>({
    eyebrow: normalizePlainText(value["eyebrow"], 80),
    headingBefore: normalizePlainText(value["headingBefore"], 120),
    headingHighlight: normalizePlainText(value["headingHighlight"], 120),
    headingAfter: normalizePlainText(value["headingAfter"], 120),
    description: normalizePlainText(value["description"], 400),
    primaryCta: normalizeLink(value["primaryCta"]),
    secondaryCta: normalizeLink(value["secondaryCta"]),
    portrait: normalizeMedia(value["portrait"]),
  });
}

function normalizeStats(value: unknown): readonly AboutStat[] {
  if (!Array.isArray(value)) return Object.freeze([]);

  return Object.freeze(
    value
      .filter(isRecord)
      .map((row): AboutStat | null => {
        const figure = normalizePlainText(row["value"], 12);

        return figure === null
          ? null
          : Object.freeze({
              value: figure,
              label: normalizePlainText(row["label"], 120),
            });
      })
      .filter((stat): stat is AboutStat => stat !== null)
      // Eight is the authoring cap; the band is measured for four. Anything
      // past that is trimmed here rather than allowed to wrap into a second
      // row that reads as a mistake.
      .slice(0, 8),
  );
}

function normalizeHeader(value: unknown): AboutSectionHeader | null {
  if (!isRecord(value)) return null;

  return present<AboutSectionHeader>({
    eyebrow: normalizePlainText(value["eyebrow"], 80),
    heading: normalizePlainText(value["heading"], 200),
    standfirst: normalizePlainText(value["standfirst"], 400),
  });
}

function normalizeSocials(value: unknown): readonly AboutSocial[] {
  if (!Array.isArray(value)) return Object.freeze([]);

  return Object.freeze(
    value
      .filter(isRecord)
      .map((row): AboutSocial | null => {
        const network = normalizePlainText(row["network"], 40);
        const href = normalizeLink({ url: row["url"], title: network });

        // A social circle with no destination is a button that does nothing.
        // The NETWORK is what names it for a screen reader, so both are
        // required rather than one being inferred from the other.
        return network === null || href === null
          ? null
          : Object.freeze({ network, href: href.href });
      })
      .filter((social): social is AboutSocial => social !== null)
      .slice(0, 8),
  );
}

function normalizeStatement(value: unknown): AboutStatement | null {
  if (!isRecord(value)) return null;

  return present<AboutStatement>({
    ghostWord: normalizePlainText(value["ghostWord"], 16),
    body: normalizeRichText(value["body"]),
    quote: normalizePlainText(value["quote"], 400),
    attributionName: normalizePlainText(value["attributionName"], 120),
    attributionRole: normalizePlainText(value["attributionRole"], 120),
    socials: normalizeSocials(value["socials"]),
  });
}

function normalizeProcess(value: unknown): AboutProcess | null {
  if (!isRecord(value)) return null;

  const steps = Array.isArray(value["steps"])
    ? value["steps"]
        .filter(isRecord)
        .map((row): AboutProcessStep | null => {
          const title = normalizePlainText(row["title"], 80);

          return title === null
            ? null
            : Object.freeze({
                title,
                body: normalizePlainText(row["body"], 400),
              });
        })
        .filter((step): step is AboutProcessStep => step !== null)
        .slice(0, 6)
    : [];

  return present<AboutProcess>({
    eyebrow: normalizePlainText(value["eyebrow"], 80),
    heading: normalizePlainText(value["heading"], 200),
    standfirst: normalizePlainText(value["standfirst"], 400),
    steps: Object.freeze(steps),
  });
}

function normalizePeople(value: unknown): readonly TeamMember[] {
  if (!isRecord(value) || !Array.isArray(value["nodes"])) return Object.freeze([]);

  return Object.freeze(
    value["nodes"]
      .filter(isRecord)
      .map((node): TeamMember | null => {
        const databaseId = Number(node["databaseId"]);
        const name = normalizePlainText(node["title"], 120);
        const slug = typeof node["slug"] === "string" ? node["slug"] : null;

        if (
          !Number.isSafeInteger(databaseId) ||
          databaseId <= 0 ||
          name === null ||
          slug === null
        ) {
          return null;
        }

        const details = isRecord(node["personDetails"])
          ? node["personDetails"]
          : {};
        const locale = isRecord(node["siraLocale"])
          ? node["siraLocale"]["code"]
          : null;

        return Object.freeze({
          databaseId,
          slug,
          name,
          role: normalizePlainText(details["role"], 120),
          summary: normalizePlainText(node["excerpt"], 240),
          portrait: normalizeMedia(node["featuredImage"]),
          locale: locale === "en" || locale === "ar" ? locale : null,
        });
      })
      .filter((member): member is TeamMember => member !== null),
  );
}

function normalizeAbout(data: unknown): DigitalAbout | null {
  if (!isRecord(data)) return null;

  const page = isRecord(data["page"]) ? data["page"] : null;
  const about = page !== null && isRecord(page["digitalAbout"])
    ? page["digitalAbout"]
    : null;

  const composition: DigitalAbout = {
    hero: about === null ? null : normalizeHero(about["hero"]),
    stats: about === null ? Object.freeze([]) : normalizeStats(about["stats"]),
    team: about === null ? null : normalizeHeader(about["team"]),
    people: normalizePeople(data["siraLeadershipProfiles"]),
    statement: about === null ? null : normalizeStatement(about["statement"]),
    process: about === null ? null : normalizeProcess(about["process"]),
  };

  return present<DigitalAbout>(composition);
}

async function resolveDigitalAbout(
  siteKey: SiteKey,
  uri: string,
): Promise<DigitalAbout | null> {
  try {
    return normalizeAbout(
      await fetchPublishedGraphQL(
        siteKey,
        SIRA_DIGITAL_ABOUT_QUERY,
        { uri, asPreview: false },
        { tags: ["content-page", "team"] },
      ),
    );
  } catch (error) {
    console.warn("SIRA digital about query failed.", {
      siteKey,
      errorName:
        error instanceof SiraGraphQLError || error instanceof Error
          ? error.name
          : "UnknownAboutResolutionError",
    });
    return null;
  }
}

export const getDigitalAbout = cache(resolveDigitalAbout);

/**
 * The people written in one language.
 *
 * Unlike the index routes, an untranslated team does NOT fall back to the other
 * language. A grid mixing Arabic and English names reads as a rendering fault
 * rather than as a content gap, and a person's name is the one string a reader
 * is most likely to notice is in the wrong script.
 */
export function peopleForLocale(
  people: readonly TeamMember[],
  locale: LocaleCode,
): readonly TeamMember[] {
  const selected = people.filter((person) => recordLocale(person) === locale);

  return Object.freeze(selected.length === 0 ? people : selected);
}

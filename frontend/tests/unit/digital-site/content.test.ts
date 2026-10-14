import { describe, expect, it } from "vitest";

import { DIGITAL_SITE_AR } from "@/content/digital-site/ar";
import { DIGITAL_SITE_EN } from "@/content/digital-site/en";
import { getDigitalSiteContent } from "@/content/digital-site";
import { ROUTE_STATIONS } from "@/lib/digital-site/route-map";
import { DIGITAL_SERVED_PATHS } from "@/lib/digital-site/routes";

// The two languages are one site. This asserts what a reader would notice: a
// section, an option or a link that exists in English and not in Arabic, an
// English string left inside the Arabic edition, or a claim the owner never
// supplied appearing in either.

type Json = string | number | boolean | null | readonly Json[] | { readonly [key: string]: Json };

/** Fields whose values are shared identifiers or deliberate other-script echoes. */
const SHARED_KEYS = new Set(["key", "index", "href", "locale", "echo"]);

/** Arrays of identifiers that point into another catalogue (a sector's module keys, a page's FAQ keys). */
const REFERENCE = /^(sectors\.\d+\.modules|home\.faq\.keys|erpnext\.faqKeys|automation\.faqKeys)\.\d+$/u;

const ARABIC = /[؀-ۿ]/u;
const LATIN_LETTERS = /[A-Za-z]/u;

function walk(
  value: Json,
  path: readonly string[],
  visit: (path: readonly string[], value: string) => void,
): void {
  if (typeof value === "string") {
    visit(path, value);
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, [...path, String(index)], visit));
  } else if (typeof value === "object" && value !== null) {
    for (const [key, item] of Object.entries(value)) walk(item, [...path, key], visit);
  }
}

function shape(value: Json): Json {
  if (typeof value === "string") return "string";
  if (Array.isArray(value)) return value.map(shape);
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, shape(item)]));
  }
  return value;
}

function identifiers(value: Json, path: readonly string[] = []): string[] {
  const found: string[] = [];
  walk(value, path, (at, text) => {
    const leaf = at[at.length - 1] ?? "";
    if (leaf === "key" || leaf === "index" || leaf === "href" || REFERENCE.test(at.join("."))) {
      found.push(`${at.join(".")}=${text}`);
    }
  });
  return found;
}

// Nothing the owner has not supplied: no statistics, no clients, no people,
// no offices, no awards, and nothing that belongs to the other company that
// shares the name (artifacts/reference-forensics/sirahdigital-in/REPORT.md).
const FORBIDDEN = [
  /\b\d+\s?(\+|%|percent|years?|clients?|projects?|businesses|countries|team members)\b/iu,
  /\b(award|certified|ISO\s?\d|fortune|testimonial|10,000|10000)\b/iu,
  /\b(chennai|riyaz|mohamed|jesheeba|monisha|salman|aakash|tnpsc|lexdraft|nusi|aura transcriber)\b/iu,
  /\b(riyadh|jeddah|dammam|istanbul|paris)\b/iu,
  /\d+\s?(٪|%|\+)/u,
  /(عملاؤنا|جوائز|شيناي|الرياض|جدة|إسطنبول|باريس|سنوات من الخبرة|عميل سعيد)/u,
];

describe("SIRA Digital content", () => {
  const en = DIGITAL_SITE_EN as unknown as Json;
  const ar = DIGITAL_SITE_AR as unknown as Json;

  it("has the same shape in both languages", () => {
    expect(shape(ar)).toEqual(shape(en));
  });

  it("shares every key, index and href between the languages", () => {
    expect(identifiers(ar)).toEqual(identifiers(en));
  });

  it("leaves no string empty in either language", () => {
    for (const content of [en, ar]) {
      walk(content, [], (path, text) => {
        expect(text.trim(), path.join(".")).not.toBe("");
      });
    }
  });

  it("writes the Arabic edition in Arabic", () => {
    walk(ar, [], (path, text) => {
      const leaf = path[path.length - 1] ?? "";
      if (SHARED_KEYS.has(leaf) || REFERENCE.test(path.join("."))) return;
      // Punctuation-only strings (a full stop, a list joiner) have no script.
      if (!/\p{L}/u.test(text)) return;
      // The language switch names the other language in that language.
      if (path.join(".") === "nav.language.label") return;
      expect(ARABIC.test(text), `${path.join(".")}: "${text}"`).toBe(true);
    });
  });

  it("keeps the English edition free of Arabic except where it echoes the name", () => {
    walk(en, [], (path, text) => {
      const leaf = path[path.length - 1] ?? "";
      if (leaf === "echo" || path.join(".") === "nav.language.label") return;
      expect(ARABIC.test(text), `${path.join(".")}: "${text}"`).toBe(false);
    });
  });

  it("makes no claim the owner has not supplied", () => {
    for (const content of [en, ar]) {
      walk(content, [], (path, text) => {
        for (const pattern of FORBIDDEN) {
          expect(pattern.test(text), `${path.join(".")}: "${text}" matches ${pattern}`).toBe(false);
        }
      });
    }
  });

  it("keeps Latin numerals only, in both editions", () => {
    for (const content of [en, ar]) {
      walk(content, [], (path, text) => {
        expect(/[٠-٩]/u.test(text), path.join(".")).toBe(false);
      });
    }
  });

  it("resolves a whole narrative per locale", () => {
    expect(getDigitalSiteContent("en")).toBe(DIGITAL_SITE_EN);
    expect(getDigitalSiteContent("ar")).toBe(DIGITAL_SITE_AR);
    expect(LATIN_LETTERS.test(DIGITAL_SITE_EN.home.hero.title.join(" "))).toBe(true);
    expect(DIGITAL_SITE_EN.solutions).toHaveLength(5);
    expect(DIGITAL_SITE_EN.phases).toHaveLength(5);
  });

  it("supplies a label for every station of the hero route", () => {
    for (const content of [DIGITAL_SITE_EN, DIGITAL_SITE_AR]) {
      expect(content.home.hero.map.purchase).toHaveLength(ROUTE_STATIONS);
      expect(content.home.hero.map.sales).toHaveLength(ROUTE_STATIONS);
    }
  });

  it("only refers to modules, questions and pages that exist", () => {
    for (const content of [DIGITAL_SITE_EN, DIGITAL_SITE_AR]) {
      const modules = new Set(content.modules.map((module) => module.key));
      const questions = new Set(content.questions.map((question) => question.key));
      for (const sector of content.sectors) {
        for (const key of sector.modules) expect(modules.has(key), `${sector.key} → ${key}`).toBe(true);
      }
      for (const key of [...content.home.faq.keys, ...content.erpnext.faqKeys, ...content.automation.faqKeys]) {
        expect(questions.has(key), key).toBe(true);
      }
      for (const item of content.nav.items) expect(DIGITAL_SERVED_PATHS).toContain(item.href);
    }
  });

  it("only links to routes the Digital site serves", () => {
    const served = new Set(DIGITAL_SERVED_PATHS);
    for (const content of [en, ar]) {
      walk(content, [], (path, text) => {
        if (path[path.length - 1] !== "href") return;
        if (text.startsWith("#")) return;
        const route = text.split("#")[0] ?? "";
        expect(served.has(route), `${path.join(".")} links to ${text}`).toBe(true);
      });
    }
  });
});

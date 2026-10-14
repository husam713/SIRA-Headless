import type { DigitalDiscoveryContent, DigitalDiscoveryOption } from "@/content/digital-site/types";

/**
 * The discovery form's brief: the sentences a reader at SIRA Digital sees,
 * composed from what the visitor chose, in the visitor's language. Pure, so
 * both languages' joins are tested without a browser.
 */

export interface DiscoverySelection {
  readonly situation: string | null;
  readonly areas: readonly string[];
  readonly size: string | null;
  readonly timing: string | null;
}

export const EMPTY_SELECTION: DiscoverySelection = Object.freeze({
  situation: null,
  areas: Object.freeze([]) as readonly string[],
  size: null,
  timing: null,
});

function find(options: readonly DigitalDiscoveryOption[], key: string | null): DigitalDiscoveryOption | null {
  if (key === null) return null;
  return options.find((option) => option.key === key) ?? null;
}

/**
 * Joins phrases the way the language lists things. Where the conjunction is
 * a word ("and") and a phrase already contains it ("finance and VAT"), the
 * last join gains a comma so the sentence does not read "finance and VAT and
 * inventory". The Arabic «و» is a single letter attached to the next word and
 * never triggers this.
 */
export function joinList(items: readonly string[], discovery: DigitalDiscoveryContent): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0] ?? "";

  const conjunction = discovery.listLast.trim();
  const wordy = /^[a-z]{2,}$/iu.test(conjunction);
  const clashes = wordy && items.some((item) => ` ${item} `.includes(` ${conjunction} `));
  const last = items[items.length - 1] ?? "";
  const lastJoin = clashes ? `${discovery.listSeparator.trimEnd()}${discovery.listLast}` : discovery.listLast;

  if (items.length === 2) return `${items[0]}${lastJoin}${last}`;
  return `${items.slice(0, -1).join(discovery.listSeparator)}${lastJoin}${last}`;
}

/** The brief, or `null` while nothing has been chosen. */
export function composeDiscoveryBrief(
  discovery: DigitalDiscoveryContent,
  selection: DiscoverySelection,
): string | null {
  const sentences: string[] = [];

  const situation = find(discovery.situations, selection.situation);
  if (situation !== null) sentences.push(discovery.sentenceSituation.replace("{situation}", situation.phrase));

  // Areas keep the order they are offered in, not the order they were clicked.
  const areas = discovery.areas.filter((area) => selection.areas.includes(area.key)).map((area) => area.phrase);
  if (areas.length > 0) sentences.push(discovery.sentenceAreas.replace("{areas}", joinList(areas, discovery)));

  const size = find(discovery.sizes, selection.size);
  if (size !== null) sentences.push(discovery.sentenceSize.replace("{size}", size.phrase));

  const timing = find(discovery.timings, selection.timing);
  if (timing !== null) sentences.push(discovery.sentenceTiming.replace("{timing}", timing.phrase));

  return sentences.length === 0 ? null : sentences.join(" ");
}

/** What the contact endpoint's `service` field receives (≤ 80 characters). */
export function discoveryService(
  discovery: DigitalDiscoveryContent,
  selection: DiscoverySelection,
  fallback: string,
): string {
  const firstArea = discovery.areas.find((area) => selection.areas.includes(area.key));
  const situation = find(discovery.situations, selection.situation);
  return (firstArea?.label ?? situation?.label ?? fallback).slice(0, 80);
}

/** The message body: the brief, the company line, then whatever the person wrote. */
export function discoveryMessage(
  brief: string | null,
  company: string,
  companyPrefix: string,
  message: string,
): string {
  const parts = [
    brief,
    company.trim() === "" ? null : `${companyPrefix} ${company.trim()}`,
    message.trim() === "" ? null : message.trim(),
  ].filter((part): part is string => part !== null);
  return parts.join("\n\n");
}

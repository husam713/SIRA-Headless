import type { DigitalBriefComposer } from "@/content/digital-site/types";

/**
 * The brief composer's sentence, from what was chosen. Pure, so the Arabic
 * and English joins can be tested without a browser.
 */

export interface BriefSelection {
  readonly repeats: readonly string[];
  readonly help: string | null;
}

/**
 * Joins the chosen phrases the way the language lists things. Where the
 * conjunction is a word ("and") and a phrase already contains it ("quotes
 * and invoices"), the list falls back to commas so the sentence does not
 * read "approvals and quotes and invoices". A single-letter conjunction (the
 * Arabic «و») is part of ordinary words, so it never triggers this.
 */
function joinList(items: readonly string[], composer: DigitalBriefComposer): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0] ?? "";

  const conjunction = composer.listLast.trim();
  const wordy = /^[a-z]{2,}$/iu.test(conjunction);
  const clashes = wordy && items.some((item) => ` ${item} `.includes(` ${conjunction} `));

  if (items.length === 2) {
    return `${items[0]}${clashes ? composer.listSeparator : composer.listLast}${items[1]}`;
  }

  const head = items.slice(0, -1).join(composer.listSeparator);
  const last = items[items.length - 1] ?? "";
  const before = clashes ? `${composer.listSeparator.trimEnd()}${composer.listLast}` : composer.listLast;
  return `${head}${before}${last}`;
}

/** The sentence, or `null` when nothing has been chosen yet. */
export function composeBrief(
  composer: DigitalBriefComposer,
  selection: BriefSelection,
): string | null {
  const repeats = selection.repeats
    .map((key) => composer.repeats.find((option) => option.key === key)?.phrase)
    .filter((phrase): phrase is string => phrase !== undefined);
  const help = composer.help.find((option) => option.key === selection.help)?.phrase ?? null;

  if (repeats.length === 0 && help === null) return null;

  let sentence = "";

  if (repeats.length > 0) {
    sentence = composer.sentenceRepeats.replace("{repeats}", joinList(repeats, composer));
    if (help !== null) sentence += composer.sentenceHelp.replace("{help}", help);
  } else if (help !== null) {
    sentence = composer.sentenceHelpOnly.replace("{help}", help);
  }

  return `${sentence}${composer.sentenceEnd}`;
}

/** What the contact endpoint's `service` field receives. */
export function briefService(
  composer: DigitalBriefComposer,
  selection: BriefSelection,
  fallback: string,
): string {
  const help = composer.help.find((option) => option.key === selection.help)?.label;
  return (help ?? fallback).slice(0, 80);
}

/** The message body: the composed brief, then whatever the person wrote. */
export function briefMessage(brief: string | null, message: string): string {
  const trimmed = message.trim();
  if (brief === null) return trimmed;
  if (trimmed === "") return brief;
  return `${brief}\n\n${trimmed}`;
}

// Reads an editor's "heading then paragraph" body into a list.
//
// Several Atlas blocks are lists of short titled entries — a service's
// coverage, a company's capabilities, the investor process — and the natural
// way to author them in WordPress is a run of `<h3>` headings each followed by
// a paragraph. This turns that markup into data so a block can set each entry
// in its own cell rather than rendering the body as prose. A body with no
// headings yields an empty list, and the route falls back to prose.

export interface HeadedEntry {
  readonly title: string;
  readonly body: string | null;
}

function decode(value: string): string {
  return value
    .replace(/<[^>]*>/gu, "")
    .replace(/&nbsp;/giu, " ")
    .replace(/&amp;/giu, "&")
    .replace(/&#8217;|&rsquo;/giu, "’")
    .replace(/&#8216;|&lsquo;/giu, "‘")
    .replace(/&#8211;|&ndash;/giu, "–")
    .replace(/&#8212;|&mdash;/giu, "—")
    .replace(/&quot;/giu, '"')
    .replace(/&#039;|&apos;/giu, "'")
    .replace(/&lt;/giu, "<")
    .replace(/&gt;/giu, ">")
    .replace(/\s+/gu, " ")
    .trim();
}

export function parseHeadedList(html: string | null): readonly HeadedEntry[] {
  if (html === null) return [];

  const entries: HeadedEntry[] = [];
  const pattern = /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>([\s\S]*?)(?=<h[2-4][^>]*>|$)/giu;

  for (const match of html.matchAll(pattern)) {
    const title = decode(match[1] ?? "");
    const body = decode(match[2] ?? "");

    if (title !== "") {
      entries.push(Object.freeze({ title, body: body === "" ? null : body }));
    }
  }

  return Object.freeze(entries);
}

/** The items of the first `<ul>`/`<ol>` in a body, as plain text. */
export function parseListItems(html: string | null): readonly string[] {
  if (html === null) return [];

  const items: string[] = [];

  for (const match of html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/giu)) {
    const text = decode(match[1] ?? "");
    if (text !== "") items.push(text);
  }

  return Object.freeze(items);
}

/** The paragraphs of a body, as plain text, in order. */
export function parseParagraphs(html: string | null): readonly string[] {
  if (html === null) return [];

  const paragraphs: string[] = [];

  for (const match of html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/giu)) {
    const text = decode(match[1] ?? "");
    if (text !== "") paragraphs.push(text);
  }

  return Object.freeze(paragraphs);
}

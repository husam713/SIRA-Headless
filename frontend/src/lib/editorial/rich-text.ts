// Turns the CMS's rendered HTML into a checked tree of nodes, which the
// renderer then emits as React elements.
//
// The alternative was `dangerouslySetInnerHTML`, and this codebase has
// deliberately never done that with CMS content — the only such call in the
// app serialises JSON-LD it builds itself. Injecting an editor's HTML would
// make every author a potential XSS vector, and pulling in a sanitiser would
// be the first runtime dependency beyond next/react.
//
// Building elements instead of markup makes the failure mode safe by
// construction: a parsing mistake here produces output that looks wrong, not
// output that executes. Nothing in this file can emit a tag, an attribute or a
// URL scheme that is not on a list below.

export type RichTextNode =
  | Readonly<{ type: "text"; value: string }>
  | Readonly<{
      type: "element";
      tag: RichTextTag;
      attributes: Readonly<Record<string, string>>;
      children: readonly RichTextNode[];
    }>;

/** Everything the WordPress block editor emits that this design supports. */
const ALLOWED_TAGS = Object.freeze([
  "p",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "a",
  "blockquote",
  "figure",
  "figcaption",
  "img",
  "br",
  "hr",
  "code",
  "pre",
] as const);

export type RichTextTag = (typeof ALLOWED_TAGS)[number];

/**
 * Attributes kept per tag. Everything else — every `on*` handler, `style`,
 * `class`, `id`, every data attribute — is dropped, so no CMS content can
 * carry behaviour or reach into the page's own styling.
 */
const ALLOWED_ATTRIBUTES: Readonly<Record<string, readonly string[]>> =
  Object.freeze({
    a: Object.freeze(["href"]),
    img: Object.freeze(["src", "alt", "width", "height"]),
  });

/** Tags whose contents are discarded along with the tag itself. */
const DROPPED_SUBTREES = Object.freeze(["script", "style", "iframe", "object", "embed", "svg", "math"]);

const VOID_TAGS = Object.freeze(["br", "hr", "img"]);

const SAFE_URL = /^(?:https?:|mailto:|tel:|\/(?!\/)|#)/i;

function isAllowedTag(name: string): name is RichTextTag {
  return (ALLOWED_TAGS as readonly string[]).includes(name);
}

const ENTITIES: Readonly<Record<string, string>> = Object.freeze({
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  lsquo: "‘",
  rsquo: "’",
  ldquo: "“",
  rdquo: "”",
});

export function decodeEntities(value: string): string {
  return value.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, body: string) => {
    if (body.startsWith("#")) {
      const codePoint = body.startsWith("#x") || body.startsWith("#X")
        ? Number.parseInt(body.slice(2), 16)
        : Number.parseInt(body.slice(1), 10);

      // Anything outside Unicode, or a surrogate half, is left as written
      // rather than being turned into a replacement character.
      if (
        !Number.isInteger(codePoint) ||
        codePoint < 1 ||
        codePoint > 0x10ffff ||
        (codePoint >= 0xd800 && codePoint <= 0xdfff)
      ) {
        return match;
      }

      return String.fromCodePoint(codePoint);
    }

    return ENTITIES[body.toLowerCase()] ?? match;
  });
}

/**
 * A URL is kept only if it starts with a scheme on the list, a single leading
 * slash, or a fragment. `javascript:`, `data:` and protocol-relative `//host`
 * are all rejected — the last because it silently inherits the page's scheme
 * and leaves the site.
 */
function safeUrl(value: string): string | null {
  const trimmed = decodeEntities(value).trim();
  // Control characters are stripped first: `java\tscript:` is a real evasion.
  const cleaned = trimmed.replace(/[\u0000-\u001F\u007F]/g, "");
  return SAFE_URL.test(cleaned) ? cleaned : null;
}

interface OpenTag {
  readonly name: string;
  readonly attributes: Readonly<Record<string, string>>;
  readonly selfClosing: boolean;
}

/** Parse the attribute list of one start tag. */
function parseAttributes(source: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*("[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;

  for (const match of source.matchAll(pattern)) {
    const name = match[1]!.toLowerCase();
    const raw = match[2];
    const value =
      raw === undefined
        ? ""
        : raw.startsWith('"') || raw.startsWith("'")
          ? raw.slice(1, -1)
          : raw;
    attributes[name] = value;
  }

  return attributes;
}

function readTag(html: string, start: number): { readonly tag: OpenTag | string; readonly end: number } | null {
  const close = html.indexOf(">", start);
  if (close === -1) return null;

  const inner = html.slice(start + 1, close);

  if (inner.startsWith("/")) {
    return { tag: `/${inner.slice(1).trim().toLowerCase()}`, end: close + 1 };
  }

  const match = /^([a-zA-Z][a-zA-Z0-9-]*)([\s\S]*)$/.exec(inner);
  if (match === null) return null;

  const name = match[1]!.toLowerCase();
  const rest = match[2] ?? "";

  return {
    tag: {
      name,
      attributes: Object.freeze(parseAttributes(rest.replace(/\/\s*$/, ""))),
      selfClosing: rest.trimEnd().endsWith("/") || VOID_TAGS.includes(name),
    },
    end: close + 1,
  };
}

/**
 * Parse rendered CMS HTML into an allowlisted node tree.
 *
 * A tag that is not on the list is unwrapped — its children survive, its
 * element does not — except for the few whose contents are discarded outright.
 */
export function parseRichText(html: string): readonly RichTextNode[] {
  const root: RichTextNode[] = [];
  const stack: Array<{ readonly tag: RichTextTag | null; readonly children: RichTextNode[] }> = [
    { tag: null, children: root },
  ];

  const push = (node: RichTextNode): void => {
    stack[stack.length - 1]!.children.push(node);
  };

  const pushText = (value: string): void => {
    const decoded = decodeEntities(value);
    if (decoded.length > 0) push(Object.freeze({ type: "text", value: decoded }));
  };

  let index = 0;

  while (index < html.length) {
    const next = html.indexOf("<", index);

    if (next === -1) {
      pushText(html.slice(index));
      break;
    }

    if (next > index) pushText(html.slice(index, next));

    // Comments, doctypes and CDATA carry nothing this renderer wants.
    if (html.startsWith("<!--", next)) {
      const end = html.indexOf("-->", next);
      index = end === -1 ? html.length : end + 3;
      continue;
    }
    if (html.startsWith("<!", next) || html.startsWith("<?", next)) {
      const end = html.indexOf(">", next);
      index = end === -1 ? html.length : end + 1;
      continue;
    }

    const read = readTag(html, next);
    if (read === null) {
      // A stray `<` that opens nothing is content, not markup.
      pushText(html.slice(next, next + 1));
      index = next + 1;
      continue;
    }

    index = read.end;

    if (typeof read.tag === "string") {
      const name = read.tag.slice(1);
      if (!isAllowedTag(name)) continue;

      // Close the nearest matching open element. An unmatched close tag is
      // ignored rather than collapsing the tree.
      for (let depth = stack.length - 1; depth > 0; depth -= 1) {
        if (stack[depth]!.tag === name) {
          stack.length = depth;
          break;
        }
      }
      continue;
    }

    const { name, attributes, selfClosing } = read.tag;

    if (DROPPED_SUBTREES.includes(name)) {
      // Skip to the matching close tag, discarding everything between.
      const closeIndex = html.toLowerCase().indexOf(`</${name}`, index);
      index = closeIndex === -1 ? html.length : (html.indexOf(">", closeIndex) + 1 || html.length);
      continue;
    }

    if (!isAllowedTag(name)) continue;

    const kept: Record<string, string> = {};
    for (const attribute of ALLOWED_ATTRIBUTES[name] ?? []) {
      const value = attributes[attribute];
      if (value === undefined) continue;

      if (attribute === "href" || attribute === "src") {
        const url = safeUrl(value);
        if (url !== null) kept[attribute] = url;
        continue;
      }

      kept[attribute] = decodeEntities(value);
    }

    // A link with no destination left is unwrapped rather than rendered as an
    // anchor that goes nowhere.
    if (name === "a" && kept["href"] === undefined) continue;
    if (name === "img" && kept["src"] === undefined) continue;

    if (selfClosing) {
      push(
        Object.freeze({
          type: "element",
          tag: name,
          attributes: Object.freeze(kept),
          children: Object.freeze([]),
        }),
      );
      continue;
    }

    const children: RichTextNode[] = [];
    push(
      Object.freeze({
        type: "element",
        tag: name,
        attributes: Object.freeze(kept),
        children,
      }),
    );
    stack.push({ tag: name, children });
  }

  return Object.freeze(root);
}

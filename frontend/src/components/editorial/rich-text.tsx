import { createElement, Fragment, type ReactNode } from "react";

import type { RichTextNode, RichTextTag } from "@/lib/editorial/rich-text";

// Renders the checked tree from lib/editorial/rich-text as React elements.
// Nothing here interpolates a string into markup, so an article body cannot
// introduce script, styling or behaviour no matter what an author pastes into
// the editor.
//
// Each tag also gets the design's own typography rather than browser defaults,
// which is the second reason to build elements instead of injecting HTML: the
// CMS supplies structure, this file supplies the type.

const TAG_CLASS: Readonly<Record<RichTextTag, string | undefined>> = Object.freeze({
  p: "text-[1.0625rem] leading-[1.75] text-brand-ink-soft [&+p]:mt-6",
  // Headings carry their own bottom margin. `[&+p]:mt-6` on the paragraph only
  // separates two paragraphs, so without this the first paragraph after a
  // heading sits flush against it.
  h2: "mt-14 mb-5 font-display text-[clamp(1.75rem,3vw,2.5rem)] font-normal leading-tight text-brand-ink",
  h3: "mt-12 mb-4 font-display text-[clamp(1.375rem,2.2vw,1.75rem)] font-normal leading-snug text-brand-ink",
  h4: "mt-10 mb-3 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-accent",
  ul: "mt-6 grid gap-3 ps-5 [&>li]:list-disc",
  ol: "mt-6 grid gap-3 ps-5 [&>li]:list-decimal",
  li: "text-[1.0625rem] leading-[1.7] text-brand-ink-soft",
  strong: "font-semibold text-brand-ink",
  em: "italic",
  a: "underline underline-offset-4 decoration-brand-accent hover:text-brand-accent",
  blockquote:
    "my-10 border-s-2 border-brand-accent ps-6 font-display text-[clamp(1.25rem,2.4vw,1.75rem)] leading-snug text-brand-ink",
  figure: "my-12",
  figcaption: "mt-4 text-[13px] leading-relaxed text-brand-ink-faint",
  img: "w-full",
  br: undefined,
  hr: "my-14 border-0 border-t border-brand-border",
  code: "bg-brand-tint px-1.5 py-0.5 font-mono text-[0.9em]",
  pre: "my-8 overflow-x-auto bg-brand-tint p-5 font-mono text-[13px] leading-relaxed",
});

/** Anchors that leave the site get the usual safety attributes. */
function anchorProps(href: string): Record<string, string> {
  return href.startsWith("http")
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };
}

function renderNode(node: RichTextNode, key: number): ReactNode {
  if (node.type === "text") return node.value;

  const { tag, attributes, children } = node;
  const className = TAG_CLASS[tag];

  if (tag === "br" || tag === "hr") {
    return createElement(tag, { key, className });
  }

  if (tag === "img") {
    return createElement("img", {
      key,
      className,
      src: attributes["src"],
      // An image with no author-supplied alt is decorative as far as this
      // renderer can tell, and an empty alt is the correct way to say so.
      alt: attributes["alt"] ?? "",
      width: attributes["width"],
      height: attributes["height"],
      loading: "lazy",
      decoding: "async",
    });
  }

  const extra =
    tag === "a" ? anchorProps(attributes["href"] ?? "") : {};

  return createElement(
    tag,
    { key, className, ...extra },
    ...children.map((child, index) => renderNode(child, index)),
  );
}

interface RichTextProps {
  readonly nodes: readonly RichTextNode[];
}

export function RichText({ nodes }: RichTextProps) {
  return createElement(
    Fragment,
    null,
    ...nodes.map((node, index) => renderNode(node, index)),
  );
}

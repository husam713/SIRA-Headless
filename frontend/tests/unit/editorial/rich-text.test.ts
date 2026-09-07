import { describe, expect, it } from "vitest";

import { decodeEntities, parseRichText } from "@/lib/editorial/rich-text";
import type { RichTextNode } from "@/lib/editorial/rich-text";

// The parser is the security boundary for CMS article bodies. The app never
// injects CMS HTML, so nothing here can produce an executing string — but a
// hole would still let an author's markup reach the page as an element the
// design never intended, so the hostile cases below are the point of the file.

function tags(nodes: readonly RichTextNode[]): string[] {
  return nodes.flatMap((node) =>
    node.type === "element" ? [node.tag, ...tags(node.children)] : [],
  );
}

function text(nodes: readonly RichTextNode[]): string {
  return nodes
    .map((node) => (node.type === "text" ? node.value : text(node.children)))
    .join("");
}

function firstElement(
  nodes: readonly RichTextNode[],
  tag: string,
): Extract<RichTextNode, { type: "element" }> | null {
  for (const node of nodes) {
    if (node.type !== "element") continue;
    if (node.tag === tag) return node;
    const nested = firstElement(node.children, tag);
    if (nested !== null) return nested;
  }
  return null;
}

describe("parseRichText — structure", () => {
  it("keeps the block structure the editor produced", () => {
    const nodes = parseRichText(
      "<p>First</p><h2>Heading</h2><ul><li>One</li><li>Two</li></ul>",
    );

    expect(tags(nodes)).toEqual(["p", "h2", "ul", "li", "li"]);
    expect(text(nodes)).toBe("FirstHeadingOneTwo");
  });

  it("keeps inline emphasis inside a paragraph", () => {
    const nodes = parseRichText("<p>A <strong>bold</strong> and <em>italic</em> line</p>");

    expect(tags(nodes)).toEqual(["p", "strong", "em"]);
    expect(text(nodes)).toBe("A bold and italic line");
  });

  it("unwraps an unknown tag but keeps what it wrapped", () => {
    // WordPress wraps blocks in divs and spans this design has no use for.
    // Dropping their content along with them would silently lose the article.
    const nodes = parseRichText('<div class="wp-block"><p>Kept</p></div>');

    expect(tags(nodes)).toEqual(["p"]);
    expect(text(nodes)).toBe("Kept");
  });

  it("ignores an unmatched closing tag instead of collapsing the tree", () => {
    const nodes = parseRichText("<p>One</p></div><p>Two</p>");

    expect(tags(nodes)).toEqual(["p", "p"]);
  });

  it("treats a stray angle bracket as content", () => {
    expect(text(parseRichText("<p>5 < 7</p>"))).toContain("5 < 7");
  });

  it("drops comments and doctypes", () => {
    const nodes = parseRichText("<!-- wp:paragraph --><p>Body</p><!-- /wp:paragraph -->");

    expect(tags(nodes)).toEqual(["p"]);
    expect(text(nodes)).toBe("Body");
  });

  it("returns nothing for nothing", () => {
    expect(parseRichText("")).toEqual([]);
  });
});

describe("parseRichText — hostile input", () => {
  it("discards a script tag and its contents", () => {
    const nodes = parseRichText('<p>Before</p><script>alert("x")</script><p>After</p>');

    expect(tags(nodes)).toEqual(["p", "p"]);
    expect(text(nodes)).toBe("BeforeAfter");
    expect(text(nodes)).not.toContain("alert");
  });

  it("discards style, iframe, object, embed and svg subtrees", () => {
    for (const tag of ["style", "iframe", "object", "embed", "svg"]) {
      const nodes = parseRichText(`<p>Kept</p><${tag}>DROPPED</${tag}>`);

      expect(text(nodes), tag).toBe("Kept");
    }
  });

  it("strips every event handler and presentational attribute", () => {
    const nodes = parseRichText(
      '<p onclick="steal()" style="position:fixed" class="x" id="y" data-z="1">Body</p>',
    );
    const paragraph = firstElement(nodes, "p");

    expect(paragraph).not.toBeNull();
    expect(Object.keys(paragraph!.attributes)).toEqual([]);
  });

  it("rejects a javascript: link by unwrapping the anchor", () => {
    // The text survives — the reader still sees the words — but there is no
    // anchor left to click.
    const nodes = parseRichText('<p><a href="javascript:alert(1)">Click</a></p>');

    expect(tags(nodes)).toEqual(["p"]);
    expect(text(nodes)).toBe("Click");
  });

  it("rejects a javascript: scheme hidden behind an entity-encoded control character", () => {
    const nodes = parseRichText('<p><a href="java&#9;script:alert(1)">Click</a></p>');

    expect(tags(nodes)).toEqual(["p"]);
  });

  it("rejects data: and protocol-relative URLs", () => {
    // A protocol-relative URL silently inherits the page scheme and leaves the
    // site, which is not something an article body should be able to do.
    for (const href of ["data:text/html,<script>1</script>", "//evil.example/x", "vbscript:x"]) {
      const nodes = parseRichText(`<p><a href="${href}">Click</a></p>`);

      expect(tags(nodes), href).toEqual(["p"]);
    }
  });

  it("keeps the schemes an article legitimately uses", () => {
    for (const href of [
      "https://example.test/a",
      "http://example.test/a",
      "mailto:someone@example.test",
      "/news/story/",
      "#section",
    ]) {
      const nodes = parseRichText(`<p><a href="${href}">Link</a></p>`);
      const anchor = firstElement(nodes, "a");

      expect(anchor, href).not.toBeNull();
      expect(anchor!.attributes["href"]).toBe(href);
    }
  });

  it("drops an image whose source is rejected, and keeps one that is not", () => {
    expect(tags(parseRichText('<figure><img src="javascript:1" alt="x"></figure>'))).toEqual([
      "figure",
    ]);
    expect(
      tags(parseRichText('<figure><img src="https://example.test/a.jpg" alt="x"></figure>')),
    ).toEqual(["figure", "img"]);
  });

  it("does not let an unclosed tag swallow the rest of the document", () => {
    const nodes = parseRichText("<p>One<p>Two<p>Three");

    expect(text(nodes)).toBe("OneTwoThree");
  });
});

describe("decodeEntities", () => {
  it("decodes the named entities WordPress emits", () => {
    expect(decodeEntities("Tom &amp; Jerry &mdash; done")).toBe("Tom & Jerry — done");
    expect(decodeEntities("&ldquo;quoted&rdquo;")).toBe("“quoted”");
  });

  it("decodes numeric and hex references", () => {
    expect(decodeEntities("&#8217;")).toBe("’");
    expect(decodeEntities("&#x2019;")).toBe("’");
  });

  it("leaves an unknown or out-of-range reference as written", () => {
    expect(decodeEntities("&notareal;")).toBe("&notareal;");
    expect(decodeEntities("&#1114112;")).toBe("&#1114112;");
    expect(decodeEntities("&#xD800;")).toBe("&#xD800;");
  });
});

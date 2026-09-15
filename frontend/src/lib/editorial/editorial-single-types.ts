import type { RichTextNode } from "@/lib/editorial/rich-text";
import type { EditorialItem } from "@/lib/editorial/types";
import type { SiteKey } from "@/types/site";

/**
 * One editorial item with its body, parsed into the checked node tree the
 * renderer consumes. The body is parsed here rather than in the component so a
 * malformed or hostile document is rejected at the boundary, before anything
 * downstream has to reason about it.
 */
export interface EditorialArticle extends EditorialItem {
  readonly body: readonly RichTextNode[];
}

export type InvalidEditorialSingleReason =
  | "invalid-request"
  | "invalid-node"
  | "unsupported-node-type"
  | "restricted-node"
  | "locator-mismatch"
  | "content-too-large";

export type EditorialSingleResolution =
  | Readonly<{ status: "ready"; siteKey: SiteKey; article: EditorialArticle }>
  | Readonly<{ status: "not-found"; siteKey: SiteKey; uri: string }>
  | Readonly<{
      status: "invalid";
      siteKey: SiteKey;
      reason: InvalidEditorialSingleReason;
    }>
  | Readonly<{ status: "remote-error"; siteKey: SiteKey; errorName: string }>;

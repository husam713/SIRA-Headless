import "server-only";

export {
  getHomepage,
  getHomepageForRequest,
  getPreviewHomepage,
} from "@/lib/homepage/get-homepage";
export type {
  BranchHomepage,
  BranchHomepageHero,
  BranchSiteKey,
  GroupHomepage,
  Homepage,
  HomepageHero,
  HomepageResolution,
  HomepageVariant,
  InvalidHomepageReason,
} from "@/lib/homepage/types";

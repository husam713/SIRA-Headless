import "server-only";

export {
  getEditorialFeed,
  resolveEditorialFeed,
} from "@/lib/editorial/get-editorial-feed";
export type {
  EditorialContentTypeName,
  EditorialDiagnostic,
  EditorialDiagnosticCode,
  EditorialFeedResolution,
  EditorialImage,
  EditorialItem,
  EditorialKind,
  EditorialPage,
  EditorialPageInfo,
  EditorialTypename,
  InvalidEditorialFeedReason,
} from "@/lib/editorial/types";

import "server-only";

export {
  getProjectArchive,
  PROJECT_ARCHIVE_CACHE_TAGS,
  resolveProjectArchive,
} from "@/lib/projects/get-project-archive";
export {
  getProjectSingle,
  PROJECT_SINGLE_CACHE_TAGS,
  resolveProjectSingle,
} from "@/lib/projects/get-project-single";
export type {
  InvalidProjectArchiveReason,
  ProjectArchiveDiagnostic,
  ProjectArchiveDiagnosticCode,
  ProjectArchiveImage,
  ProjectArchiveItem,
  ProjectArchivePage,
  ProjectArchivePageInfo,
  ProjectArchiveResolution,
} from "@/lib/projects/types";
export type {
  InvalidProjectSingleReason,
  ProjectSingleDiagnostic,
  ProjectSingleDiagnosticCode,
  ProjectSingleImage,
  ProjectSingleProject,
  ProjectSingleRelatedCompany,
  ProjectSingleResolution,
  ProjectSingleStatistic,
} from "@/lib/projects/project-single-types";

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface ProjectState {
  readonly currentStage: string;
  readonly currentSubstage: string;
  readonly executionBaseline: string;
  readonly productionAuthorized: boolean;
  readonly governance: {
    readonly canonicalBranch: string;
    readonly defaultBranch: string;
  };
  readonly latestAcceptedIncrement: {
    readonly stage: string;
    readonly status: string;
    readonly pullRequest: number;
    readonly implementationHead: string;
    readonly mergeCommit: string;
    readonly frontendCi: string;
    readonly fullRegression: string;
  };
}

describe("B7 durable state acceptance", () => {
  it("records cumulative acceptance after merged B7", () => {
    const state = JSON.parse(
      readFileSync(
        new URL("../../../project-state.json", import.meta.url),
        "utf8",
      ),
    ) as ProjectState;

    expect(state).toMatchObject({
      currentStage: "2C.5B",
      currentSubstage: "2C.5B-CMS-MUTATION-READINESS-BACKUP-GATE",
      executionBaseline: "2bd4991f75a53ab9209e748499dcb8915769e3a6",
      productionAuthorized: false,
      governance: {
        canonicalBranch: "main",
        defaultBranch: "main",
      },
      latestAcceptedIncrement: {
        stage: "Step 2C.5B",
        status: "ACCEPTED_MERGED",
        pullRequest: 16,
        implementationHead: "4afad259dd4c184de5b61ca51f91fcde7222cbf2",
        mergeCommit: "2bd4991f75a53ab9209e748499dcb8915769e3a6",
        frontendCi: "PASS",
        fullRegression: "26 files / 252 tests PASS",
      },
    });
  });
});

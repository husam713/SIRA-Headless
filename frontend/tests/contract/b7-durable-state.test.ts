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
      currentStage: "2C.3D",
      currentSubstage: "2C.3D-AUDIT",
      executionBaseline: "4f306733b3e45bee4244688186e5ecae570fcb8b",
      productionAuthorized: false,
      governance: {
        canonicalBranch: "main",
        defaultBranch: "main",
      },
      latestAcceptedIncrement: {
        stage: "Step 2C.3C",
        status: "ACCEPTED_MERGED",
        pullRequest: 12,
        implementationHead: "847b0c3f067d9af4f00591c3554a7a693a646017",
        mergeCommit: "4f306733b3e45bee4244688186e5ecae570fcb8b",
        frontendCi: "PASS",
        fullRegression: "22 files / 183 tests PASS",
      },
    });
  });
});

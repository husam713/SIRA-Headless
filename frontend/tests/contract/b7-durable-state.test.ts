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
  it("records accepted and merged B7 before cumulative closure", () => {
    const state = JSON.parse(
      readFileSync(
        new URL("../../../project-state.json", import.meta.url),
        "utf8",
      ),
    ) as ProjectState;

    expect(state).toMatchObject({
      currentStage: "2C.3C",
      currentSubstage: "2C.3C-CLOSURE",
      executionBaseline: "73f41e88a5d1016e2cdd586991765d992a513416",
      productionAuthorized: false,
      governance: {
        canonicalBranch: "main",
        defaultBranch: "main",
      },
      latestAcceptedIncrement: {
        stage: "Step 2C.3C-B7",
        status: "ACCEPTED_MERGED",
        pullRequest: 11,
        implementationHead: "851b85b3d685ae1304466dc5baecadc87bcd1b90",
        mergeCommit: "73f41e88a5d1016e2cdd586991765d992a513416",
        frontendCi: "PASS",
        fullRegression: "21 files / 174 tests PASS",
      },
    });
  });
});

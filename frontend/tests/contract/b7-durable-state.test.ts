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

describe("B7 durable state baseline", () => {
  it("records accepted and merged B6 before B7 runtime work", () => {
    const state = JSON.parse(
      readFileSync(
        new URL("../../../project-state.json", import.meta.url),
        "utf8",
      ),
    ) as ProjectState;

    expect(state).toMatchObject({
      currentStage: "2C.3C",
      currentSubstage: "B7",
      executionBaseline: "a116fea3514af457a54a0df1d5f4e86e4badbeba",
      productionAuthorized: false,
      governance: {
        canonicalBranch: "main",
        defaultBranch: "main",
      },
      latestAcceptedIncrement: {
        stage: "Step 2C.3C-B6",
        status: "ACCEPTED_MERGED",
        pullRequest: 10,
        implementationHead: "f392cfbb022e1928011ff2b28f7955b9e9acb6b0",
        mergeCommit: "a116fea3514af457a54a0df1d5f4e86e4badbeba",
        frontendCi: "PASS",
        fullRegression: "20 files / 158 tests PASS",
      },
    });
  });
});

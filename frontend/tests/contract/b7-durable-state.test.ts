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
      currentStage: "2C.4",
      currentSubstage: "2C.4-AUDIT",
      executionBaseline: "1cfab49f113acca5a1866e225f8b5b64a5fcb926",
      productionAuthorized: false,
      governance: {
        canonicalBranch: "main",
        defaultBranch: "main",
      },
      latestAcceptedIncrement: {
        stage: "Step 2C.3D",
        status: "ACCEPTED_MERGED",
        pullRequest: 13,
        implementationHead: "73bec8e671a53c1abb5396ed945785162b71b5da",
        mergeCommit: "1cfab49f113acca5a1866e225f8b5b64a5fcb926",
        frontendCi: "PASS",
        fullRegression: "23 files / 196 tests PASS",
      },
    });
  });
});

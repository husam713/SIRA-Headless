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
      currentStage: "2C.5A",
      currentSubstage: "2C.5A-CMS-PREFLIGHT",
      executionBaseline: "710eec3cf90e1a7d707860f9ee73d0abf283019c",
      productionAuthorized: false,
      governance: {
        canonicalBranch: "main",
        defaultBranch: "main",
      },
      latestAcceptedIncrement: {
        stage: "Step 2C.4",
        status: "ACCEPTED_MERGED",
        pullRequest: 14,
        implementationHead: "a4d8945bf5b83e304b1b0fb434eb7441ea243849",
        mergeCommit: "710eec3cf90e1a7d707860f9ee73d0abf283019c",
        frontendCi: "PASS",
        fullRegression: "24 files / 204 tests PASS",
      },
    });
  });
});

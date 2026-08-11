import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface ProjectState {
  readonly currentStage: string;
  readonly currentSubstage: string;
  readonly executionBaseline: string;
  readonly productionAuthorized: boolean;
  readonly latestAcceptedIncrement: {
    readonly stage: string;
    readonly status: string;
    readonly pullRequest: number;
    readonly implementationHead: string;
    readonly mergeCommit: string;
    readonly frontendCi: string;
  };
}

describe("B6 durable state baseline", () => {
  it("records accepted and merged B5 before B6 runtime work", () => {
    const state = JSON.parse(
      readFileSync(
        new URL("../../../project-state.json", import.meta.url),
        "utf8",
      ),
    ) as ProjectState;

    expect(state).toMatchObject({
      currentStage: "2C.3C",
      currentSubstage: "B6",
      executionBaseline: "00022da346777ce67acc92b0c53c07627e1d85e3",
      productionAuthorized: false,
      latestAcceptedIncrement: {
        stage: "Step 2C.3C-B5",
        status: "ACCEPTED_MERGED",
        pullRequest: 9,
        implementationHead: "9fec2ea30c36cab62c1af4f576429bea3ea42628",
        mergeCommit: "00022da346777ce67acc92b0c53c07627e1d85e3",
        frontendCi: "PASS",
      },
    });
  });
});

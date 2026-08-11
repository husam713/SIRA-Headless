import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

interface ProjectState {
  readonly currentStage: string;
  readonly currentSubstage: string;
  readonly executionBaseline: string;
  readonly latestAcceptedIncrement: {
    readonly stage: string;
    readonly status: string;
    readonly pullRequest: number;
    readonly implementationHead: string;
    readonly mergeCommit: string;
    readonly frontendCi: string;
  };
}

describe("B5 durable state baseline", () => {
  it("records accepted and merged B4 before B5 runtime work", () => {
    const state = JSON.parse(
      readFileSync(
        new URL("../../../project-state.json", import.meta.url),
        "utf8",
      ),
    ) as ProjectState;

    expect(state).toMatchObject({
      currentStage: "2C.3C",
      currentSubstage: "B5",
      executionBaseline: "684bce5b51f977e078029870b085a15b2204ad60",
      latestAcceptedIncrement: {
        stage: "Step 2C.3C-B4",
        status: "ACCEPTED_MERGED",
        pullRequest: 8,
        implementationHead: "e31ce8e793601266be4ae8064ebb0f5fa74c2e81",
        mergeCommit: "684bce5b51f977e078029870b085a15b2204ad60",
        frontendCi: "PASS",
      },
    });
  });
});

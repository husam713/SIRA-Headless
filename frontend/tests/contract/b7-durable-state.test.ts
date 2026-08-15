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
      executionBaseline: "f0d0974a75ac49a9c4fd88f0f229fa28a209acfd",
      productionAuthorized: false,
      governance: {
        canonicalBranch: "main",
        defaultBranch: "main",
      },
      latestAcceptedIncrement: {
        stage: "Step 2C.5A",
        status: "ACCEPTED_MERGED",
        pullRequest: 15,
        implementationHead: "bb6cca02bd97524182e2d53628c5ea9567228ee4",
        mergeCommit: "f0d0974a75ac49a9c4fd88f0f229fa28a209acfd",
        frontendCi: "PASS",
        fullRegression: "25 files / 218 tests PASS",
      },
    });
  });
});

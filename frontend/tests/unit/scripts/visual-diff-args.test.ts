import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

// visual-diff.mjs carries a shebang, so Vite cannot import it as a module the
// way Node can. These tests therefore drive the real CLI as a subprocess, which
// is also the contract that matters: argument handling and the process exit
// status. Nothing here launches a browser — every case fails during argument
// parsing, before Chromium would be needed.

const SCRIPT = fileURLToPath(
  new URL("../../../scripts/visual-diff.mjs", import.meta.url),
);

function run(args: readonly string[]): {
  readonly status: number | null;
  readonly stdout: string;
  readonly stderr: string;
} {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    encoding: "utf8",
    timeout: 30_000,
  });

  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

describe("visual-diff CLI arguments", () => {
  it("lists every target the G-J review needs", () => {
    const { status, stdout } = run(["--list"]);

    expect(status).toBe(0);
    for (const tenant of ["healthcare", "consulting", "lifestyle", "realestate"]) {
      expect(stdout).toContain(tenant);
    }
  });

  it("rejects an unknown target instead of skipping it", () => {
    // The pre-existing behaviour only warned and continued, so a typo produced
    // a run that exited 0 having captured nothing for that tenant.
    const { status, stderr } = run(["--targets", "healthcare,bogus"]);

    expect(status).toBe(1);
    expect(stderr).toContain("Unknown target(s): bogus");
  });

  it("rejects a non-integer viewport width", () => {
    const { status, stderr } = run(["--targets", "healthcare", "--viewports", "1440,abc"]);

    expect(status).toBe(1);
    expect(stderr).toContain("integer widths");
  });

  it("rejects viewport widths outside the supported range", () => {
    for (const width of ["10", "9999"]) {
      const { status, stderr } = run(["--targets", "healthcare", "--viewports", width]);

      expect(status, `width ${width}`).toBe(1);
      expect(stderr, `width ${width}`).toContain("outside 320-3840");
    }
  });

  it("rejects empty target and viewport lists", () => {
    expect(run(["--targets", " , "]).stderr).toContain("at least one target");
    expect(run(["--viewports", " , "]).stderr).toContain("at least one width");
  });

  it("requires a value for each flag", () => {
    for (const flag of ["--targets", "--viewports", "--out"]) {
      const { status, stderr } = run([flag]);

      expect(status, flag).toBe(1);
      expect(stderr, flag).toContain(`${flag} requires a value`);
    }
  });

  it("defaults to the live source and accepts the fixture source", () => {
    // Fixture mode is what makes the content sections comparable while the CMS
    // is unauthored; live stays the default so existing invocations are
    // unchanged.
    expect(run(["--source", "fixture", "--targets", "healthcare", "--list"]).status).toBe(0);
    expect(run(["--source", "live", "--targets", "healthcare", "--list"]).status).toBe(0);
  });

  it("rejects an unknown source", () => {
    const { status, stderr } = run(["--source", "bogus", "--targets", "healthcare"]);

    expect(status).toBe(1);
    expect(stderr).toContain('--source expects "live" or "fixture"');
  });

  it("requires a value for --source", () => {
    const { status, stderr } = run(["--source"]);

    expect(status).toBe(1);
    expect(stderr).toContain("--source requires a value");
  });

  it("rejects an unrecognised flag", () => {
    const { status, stderr } = run(["--nope"]);

    expect(status).toBe(1);
    expect(stderr).toContain("Unknown argument: --nope");
  });
});

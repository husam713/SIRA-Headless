import { describe, expect, it } from "vitest";

import { WORKFLOW_DEMO } from "@/content/digital-site/demo/workflow";
import { approvalCount, clampAmount, routeRequest } from "@/lib/digital-site/workflow";

// The approval example's policy, pinned: the simulator only renders what
// this engine returns, so these cases are what a visitor can see.

const keys = (input: Parameters<typeof routeRequest>[0]) => routeRequest(input).map((step) => step.key);

describe("approval example — rule engine", () => {
  it("routes a small stock request through the manager to the order", () => {
    expect(keys({ amount: 4_500, category: "stock", urgent: false })).toEqual(["submit", "manager", "order"]);
  });

  it("adds competing quotations from the quotation threshold", () => {
    const { quotationsFrom } = WORKFLOW_DEMO.rules;
    expect(keys({ amount: quotationsFrom - 1, category: "services", urgent: false })).not.toContain("quotations");
    expect(keys({ amount: quotationsFrom, category: "services", urgent: false })).toEqual([
      "submit",
      "manager",
      "quotations",
      "order",
    ]);
  });

  it("sends equipment to finance and large amounts to the general manager, in that order", () => {
    const input = { amount: 160_000, category: "asset", urgent: false } as const;
    expect(keys(input)).toEqual(["submit", "manager", "quotations", "budget", "general", "order"]);
    expect(approvalCount(routeRequest(input))).toBe(3);
  });

  it("always starts with the requester and ends with the system issuing the order", () => {
    for (const amount of [1_000, 50_000, 300_000]) {
      for (const category of ["stock", "services", "asset"] as const) {
        const route = routeRequest({ amount, category, urgent: false });
        expect(route[0]?.role).toBe("requester");
        expect(route.at(-1)?.role).toBe("system");
        expect(route.at(-1)?.escalateAfterHours).toBeNull();
      }
    }
  });

  it("shortens escalation when urgent, and every escalation reads correctly in Arabic", () => {
    const normal = routeRequest({ amount: 160_000, category: "asset", urgent: false });
    const urgent = routeRequest({ amount: 160_000, category: "asset", urgent: true });
    normal.forEach((step, index) => {
      if (step.escalateAfterHours === null) return;
      const fast = urgent[index]?.escalateAfterHours ?? null;
      expect(fast).not.toBeNull();
      expect(fast ?? 0).toBeLessThan(step.escalateAfterHours);
    });
    // «ساعة» (singular) is only correct after numbers from 11 upward.
    for (const step of [...normal, ...urgent]) {
      if (step.escalateAfterHours !== null) expect(step.escalateAfterHours).toBeGreaterThanOrEqual(11);
    }
  });

  it("keeps any typed amount inside the example's range", () => {
    expect(clampAmount(0)).toBe(WORKFLOW_DEMO.min);
    expect(clampAmount(10_000_000)).toBe(WORKFLOW_DEMO.max);
    expect(clampAmount(Number.NaN)).toBe(WORKFLOW_DEMO.defaultAmount);
    expect(clampAmount(18_400.6)).toBe(18_401);
  });

  it("offers presets that each show a different route", () => {
    const routes = WORKFLOW_DEMO.presets.map((amount) => keys({ amount, category: "stock", urgent: false }).join(">"));
    expect(new Set(routes).size).toBe(WORKFLOW_DEMO.presets.length);
  });
});

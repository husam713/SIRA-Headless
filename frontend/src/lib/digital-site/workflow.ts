import { WORKFLOW_DEMO, type WorkflowDemo } from "@/content/digital-site/demo/workflow";

/**
 * The approval example's rule engine — pure, so it is tested without a
 * browser and the simulator only renders what this returns.
 *
 * It mirrors how an ERPNext Workflow is configured: states reached in order,
 * each owned by a role, some guarded by a condition on the document
 * (`doc.grand_total >= 100000`). The policy itself is ILLUSTRATIVE; a real
 * client's thresholds come out of the Design stage.
 */

export type WorkflowCategory = "stock" | "services" | "asset";

export interface WorkflowInput {
  readonly amount: number;
  readonly category: WorkflowCategory;
  readonly urgent: boolean;
}

export type WorkflowStepKey = "submit" | "manager" | "quotations" | "budget" | "general" | "order";
export type WorkflowRole = "requester" | "manager" | "procurement" | "finance" | "general" | "system";
export type WorkflowReason = "always" | "manager" | "quotations" | "asset" | "general" | "order";

export interface WorkflowStep {
  readonly key: WorkflowStepKey;
  readonly role: WorkflowRole;
  readonly reason: WorkflowReason;
  /** Whether this step is an approval (counted in the route summary). */
  readonly approval: boolean;
  /** Hours a person may hold the step before it escalates; null for automatic steps. */
  readonly escalateAfterHours: number | null;
  /** The threshold that put this step on the route, for the reason text. */
  readonly limit: number | null;
}

/** Keeps an amount inside the example's range, as a whole riyal. */
export function clampAmount(value: number, demo: WorkflowDemo = WORKFLOW_DEMO): number {
  if (!Number.isFinite(value)) return demo.defaultAmount;
  return Math.min(demo.max, Math.max(demo.min, Math.round(value)));
}

/**
 * The route a purchase request takes under the example policy.
 *
 * Order matters and matches how such policies are usually written: the line
 * manager always approves first; competing quotations are gathered before
 * money is committed at higher amounts; equipment is reviewed by finance
 * because it becomes a fixed asset; the general manager signs last; the
 * order is issued by the system once the final approval is recorded.
 */
export function routeRequest(input: WorkflowInput, demo: WorkflowDemo = WORKFLOW_DEMO): WorkflowStep[] {
  const amount = clampAmount(input.amount, demo);
  const hours = (role: keyof WorkflowDemo["escalation"]): number => demo.escalation[role][input.urgent ? 1 : 0];

  const steps: WorkflowStep[] = [
    { key: "submit", role: "requester", reason: "always", approval: false, escalateAfterHours: null, limit: null },
    { key: "manager", role: "manager", reason: "manager", approval: true, escalateAfterHours: hours("manager"), limit: null },
  ];

  if (amount >= demo.rules.quotationsFrom) {
    steps.push({
      key: "quotations",
      role: "procurement",
      reason: "quotations",
      approval: false,
      escalateAfterHours: hours("procurement"),
      limit: demo.rules.quotationsFrom,
    });
  }

  if (input.category === "asset") {
    steps.push({ key: "budget", role: "finance", reason: "asset", approval: true, escalateAfterHours: hours("finance"), limit: null });
  }

  if (amount >= demo.rules.generalFrom) {
    steps.push({
      key: "general",
      role: "general",
      reason: "general",
      approval: true,
      escalateAfterHours: hours("general"),
      limit: demo.rules.generalFrom,
    });
  }

  steps.push({ key: "order", role: "system", reason: "order", approval: false, escalateAfterHours: null, limit: null });

  return steps;
}

/** How many approvals the route contains. */
export function approvalCount(steps: readonly WorkflowStep[]): number {
  return steps.filter((step) => step.approval).length;
}

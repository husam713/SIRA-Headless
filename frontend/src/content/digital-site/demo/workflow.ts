/**
 * The approval example's numbers — ILLUSTRATIVE.
 *
 * A fictional purchase request and a fictional policy: the thresholds and
 * escalation times are invented to show how ERPNext workflow conditions
 * (`doc.grand_total >= …`) shape a route. They are not a recommendation and
 * not any client's policy. Language-neutral: labels live in the narrative.
 */
export const WORKFLOW_DEMO = {
  /** ERPNext's own naming series for a material request. */
  reference: "MAT-MR-2026-00142",
  /** ERPNext's naming series for the purchase order the route ends in. */
  orderReference: "PUR-ORD-2026-00087",
  /** Milliseconds between steps when the request is run. */
  stepMs: 650,
  defaultAmount: 18_400,
  min: 1_000,
  max: 300_000,
  step: 100,
  presets: [4_500, 38_000, 160_000],
  rules: {
    /** From this amount, procurement must collect competing quotations. */
    quotationsFrom: 25_000,
    /** From this amount, the general manager gives final approval. */
    generalFrom: 100_000,
  },
  /** Hours before a waiting step escalates: [normal, urgent]. All ≥ 11 (Arabic plural rule). */
  escalation: {
    manager: [24, 12],
    procurement: [48, 24],
    finance: [48, 24],
    general: [48, 24],
  },
} as const;

export type WorkflowDemo = typeof WORKFLOW_DEMO;

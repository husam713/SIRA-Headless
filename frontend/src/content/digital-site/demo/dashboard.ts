/**
 * The management view's figures — ILLUSTRATIVE.
 *
 * Invented for a fictional trading company ("Example Trading Co."). They are
 * never a client's numbers and never SIRA Digital's results, and every
 * surface that renders them carries the narrative's `common.illustrative`
 * label (asserted in tests/unit/digital-site/demos.test.ts).
 */
export const DASHBOARD_DEMO = {
  cash: 2_384_500,
  overdue: 412_300,
  /** Overdue receivables by age bucket; sums to `overdue`. */
  ageing: [168_900, 121_400, 74_200, 47_800],
  approvals: 14,
  reorder: 23,
  /** Gross margin, percent. */
  margin: 31.4,
  /** Invoiced sales per week, thousands of riyals, oldest first. */
  sales: [612, 588, 640, 701, 655, 690, 742, 718, 765, 802, 779, 836],
  invoices: { cleared: 186, reported: 1_204, rejected: 3 },
} as const;

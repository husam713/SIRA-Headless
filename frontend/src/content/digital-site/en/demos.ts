import type { DigitalSiteContent } from "@/content/digital-site/types";

/**
 * SIRA Digital — English: the words of the two demonstrations.
 *
 * Both are ILLUSTRATIVE. The approval rules and every figure on the dashboard
 * are invented for the example (the figures live in `demo/*.ts`); they
 * describe a fictional trading company, never a client and never SIRA
 * Digital's own results.
 */
export const DEMOS_EN = {
  demos: {
    workflow: {
      title: "Watch a purchase request find its way",
      intro:
        "Change the amount or the category and the route changes with it. These rules are an example. In your system they are your rules, written once and applied to every request.",
      note: "Illustrative rules, configured differently for every client.",
      request: {
        heading: "Purchase request",
        item: "Office equipment for the finance team",
        requester: "Requested by the finance department",
      },
      amountLabel: "Amount",
      amountHint: "Move the slider or type an amount.",
      currency: "SAR",
      categoryLabel: "What is being bought",
      categories: [
        { key: "stock", label: "Stock items" },
        { key: "services", label: "Services" },
        { key: "asset", label: "Equipment and assets" },
      ],
      urgentLabel: "Urgent",
      urgentHint: "Shortens the time before a waiting step escalates.",
      routeHeading: "The route for this request",
      routeSummary: "{count} approvals before the order is issued",
      escalates: "Escalates after",
      hours: "hours",
      roles: {
        requester: "Requester",
        manager: "Department manager",
        procurement: "Procurement",
        finance: "Finance manager",
        general: "General manager",
        system: "The system",
      },
      steps: {
        submit: "Submits the request",
        manager: "Approves the request",
        quotations: "Collects supplier quotations",
        budget: "Checks the budget and capitalisation",
        general: "Gives final approval",
        order: "Issues the purchase order",
      },
      reasons: {
        always: "Every request starts here.",
        manager: "Every request needs its own department's approval first.",
        quotations: "Amounts from {limit} need competing quotations.",
        asset: "Equipment becomes a fixed asset, so finance reviews it.",
        general: "Amounts from {limit} need the general manager.",
        order: "Created automatically once the last approval is recorded.",
      },
      states: {
        pending: "Waiting",
        approved: "Done",
      },
      run: "Send the request",
      done: "Purchase order {reference} issued.",
      reset: "Reset the example",
    },

    dashboard: {
      title: "What the general manager opens on Sunday morning",
      intro:
        "One view, fed by the same records the teams work in. Every figure can be traced to the documents behind it, so the meeting starts with decisions instead of reconciliations.",
      stamp: "Sample data. Not a client.",
      company: "Example Trading Co. (fictional)",
      period: "Week to date",
      sourceLabel: "Where this comes from",
      tiles: {
        cash: {
          label: "Cash across bank accounts",
          note: "Reconciled with yesterday's statements.",
          sources: ["Bank reconciliation", "Payment entry"],
        },
        overdue: {
          label: "Receivables overdue",
          note: "Customers past their payment terms.",
          sources: ["Sales invoice", "Payment entry", "Customer credit limit"],
        },
        approvals: {
          label: "Requests waiting for approval",
          note: "Oldest waiting since Thursday.",
          sources: ["Material request", "Workflow action"],
        },
        reorder: {
          label: "Items below reorder level",
          note: "Material requests drafted automatically.",
          sources: ["Stock ledger", "Item reorder level"],
        },
        margin: {
          label: "Gross margin this month",
          note: "From valued stock, not estimates.",
          sources: ["Sales invoice", "Stock ledger"],
        },
      },
      sales: {
        label: "Invoiced sales, last twelve weeks",
        note: "Thousands of riyals, excluding VAT.",
        weekPrefix: "Week",
        sources: ["Sales invoice"],
      },
      ageing: {
        label: "Overdue by age",
        buckets: ["Up to 30 days", "31 to 60 days", "61 to 90 days", "Over 90 days"],
      },
      invoices: {
        label: "E-invoices this week",
        note: "Responses from the Fatoora platform.",
        sources: ["Sales invoice", "E-invoice log"],
        cleared: "Cleared",
        reported: "Reported",
        rejected: "Rejected, to correct",
      },
      currency: "SAR",
    },
  },
} satisfies Pick<DigitalSiteContent, "demos">;

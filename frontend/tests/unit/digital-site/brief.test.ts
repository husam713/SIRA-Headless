import { describe, expect, it } from "vitest";

import { DIGITAL_SITE_AR } from "@/content/digital-site/ar";
import { DIGITAL_SITE_EN } from "@/content/digital-site/en";
import { briefMessage, briefService, composeBrief } from "@/lib/digital-site/brief";

const en = DIGITAL_SITE_EN.contact.composer;
const ar = DIGITAL_SITE_AR.contact.composer;

describe("brief composer", () => {
  it("is empty until something is chosen", () => {
    expect(composeBrief(en, { repeats: [], help: null })).toBeNull();
    expect(composeBrief(ar, { repeats: [], help: null })).toBeNull();
  });

  it("writes the English sentence with the language's own list joins", () => {
    expect(composeBrief(en, { repeats: ["approvals"], help: null })).toBe(
      "We keep doing approvals by hand.",
    );
    expect(composeBrief(en, { repeats: ["approvals", "reports"], help: null })).toBe(
      "We keep doing approvals and reports by hand.",
    );
    // A phrase that already contains "and" falls back to commas.
    expect(composeBrief(en, { repeats: ["approvals", "quotes"], help: "assistant" })).toBe(
      "We keep doing approvals, quotes and invoices by hand, and we'd like an AI assistant.",
    );
    expect(
      composeBrief(en, { repeats: ["approvals", "reports", "scheduling"], help: "unsure" }),
    ).toBe(
      "We keep doing approvals, reports and scheduling by hand, and we're not sure yet what would help.",
    );
    expect(composeBrief(en, { repeats: [], help: "automate" })).toBe(
      "We have work that repeats, and we'd like to automate it.",
    );
  });

  it("writes the Arabic sentence with Arabic joins", () => {
    expect(composeBrief(ar, { repeats: ["approvals", "reports"], help: "assistant" })).toBe(
      "ما زلنا ننجز الاعتمادات والتقارير يدويًا، ونودّ مساعدًا بالذكاء الاصطناعي.",
    );
    expect(composeBrief(ar, { repeats: [], help: "unsure" })).toBe(
      "لدينا عمل يتكرّر، ولسنا متأكدين بعد مما قد يساعد.",
    );
  });

  it("ignores keys it does not know", () => {
    expect(composeBrief(en, { repeats: ["nonsense"], help: "nonsense" })).toBeNull();
  });

  it("sends the chosen help as the subject, within the endpoint's limit", () => {
    expect(briefService(en, { repeats: [], help: "assistant" }, "General enquiry")).toBe(
      "An AI assistant",
    );
    expect(briefService(en, { repeats: ["approvals"], help: null }, "General enquiry")).toBe(
      "General enquiry",
    );
    for (const option of [...en.help, ...ar.help]) {
      expect(option.label.length).toBeLessThanOrEqual(80);
    }
  });

  it("puts the brief before whatever the person wrote", () => {
    expect(briefMessage("Brief.", "  Details.  ")).toBe("Brief.\n\nDetails.");
    expect(briefMessage("Brief.", "")).toBe("Brief.");
    expect(briefMessage(null, " Details. ")).toBe("Details.");
    // A brief on its own already clears the endpoint's minimum length.
    const brief = composeBrief(en, { repeats: ["approvals"], help: null });
    expect(briefMessage(brief, "").length).toBeGreaterThanOrEqual(10);
  });
});

import { describe, expect, it } from "vitest";

import { DIGITAL_SITE_AR } from "@/content/digital-site/ar";
import { DIGITAL_SITE_EN } from "@/content/digital-site/en";
import {
  composeDiscoveryBrief,
  discoveryMessage,
  discoveryService,
  EMPTY_SELECTION,
  joinList,
} from "@/lib/digital-site/discovery";

const en = DIGITAL_SITE_EN.contact.discovery;
const ar = DIGITAL_SITE_AR.contact.discovery;

describe("discovery brief", () => {
  it("is empty until something is chosen", () => {
    expect(composeDiscoveryBrief(en, EMPTY_SELECTION)).toBeNull();
  });

  it("writes every answer as a sentence, in English", () => {
    const brief = composeDiscoveryBrief(en, {
      situation: "spreadsheets",
      areas: ["inventory", "finance", "reporting"],
      size: "m",
      timing: "half",
    });
    expect(brief).toBe(
      "Today we run on spreadsheets and separate tools. The system should cover finance and VAT, inventory, and reporting first. It will be used by 11 to 50 people. We would like to start within six months.",
    );
  });

  it("keeps the offered order of areas, not the click order", () => {
    const brief = composeDiscoveryBrief(en, { ...EMPTY_SELECTION, areas: ["reporting", "purchasing"] });
    expect(brief).toBe("The system should cover purchasing and reporting first.");
  });

  it("writes the same answers in Arabic, joined the Arabic way", () => {
    const brief = composeDiscoveryBrief(ar, {
      situation: "spreadsheets",
      areas: ["finance", "inventory", "reporting"],
      size: null,
      timing: "quarter",
    });
    expect(brief).toBe(
      "حاليًا نعمل على جداول بيانات وأدوات منفصلة. نريد أن يغطي النظام أولًا المالية وضريبة القيمة المضافة، والمخزون والتقارير. ونرغب في البدء خلال هذا الربع.",
    );
  });

  it("joins two items without a comma, and avoids «and … and» in English", () => {
    expect(joinList(["a", "b"], en)).toBe("a and b");
    expect(joinList(["finance and VAT", "inventory"], en)).toBe("finance and VAT, and inventory");
    expect(joinList(["أ", "ب"], ar)).toBe("أ وب");
  });

  it("sends the first chosen area as the service, then the situation, then the default", () => {
    expect(discoveryService(en, { ...EMPTY_SELECTION, areas: ["hr", "finance"] }, "x")).toBe("Finance and VAT");
    expect(discoveryService(en, { ...EMPTY_SELECTION, situation: "erp" }, "x")).toBe("An ERP that does not fit");
    expect(discoveryService(en, EMPTY_SELECTION, "Discovery call")).toBe("Discovery call");
  });

  it("puts the brief, the company and the message in that order", () => {
    expect(discoveryMessage("Brief.", " Acme ", "Company:", " Hello ")).toBe("Brief.\n\nCompany: Acme\n\nHello");
    expect(discoveryMessage(null, "", "Company:", "")).toBe("");
  });
});

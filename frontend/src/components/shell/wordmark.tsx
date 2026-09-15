// The SIRA wordmark, set the way the brand writes it: the house name in the
// surface's own ink, the company name in that company's accent. "SIRA Real
// Estate" is therefore SIRA in white and "Real Estate" in the real-estate
// terracotta, and the same rule produces "SIRA GROUP" in white and gold.
//
// One component so the header and the footer cannot drift apart, and so a new
// tenant is written correctly the moment its brand exists rather than when
// somebody remembers to add a second special case.

type WordmarkTone = "ink" | "paper";

interface WordmarkProps {
  /** The brand's own name, e.g. "SIRA Real Estate". */
  readonly name: string;
  /** Which surface it sits on. Picks both halves' colours. */
  readonly tone: WordmarkTone;
  readonly className?: string;
}

// On paper the standard accent carries; on the deep surfaces it does not, which
// is the same split every section eyebrow already makes.
//
// The `paper` tone means "the wordmark as it is set on a DEEP surface", which
// is why its lead reads --brand-on-deep and not --brand-paper. Those were the
// same colour for as long as every brand had light paper; SIRA Digital's paper
// is its dark ground (ADR-033), and the literal token would have set the
// footer wordmark in near-black on near-black.
const TONE: Readonly<Record<WordmarkTone, { lead: string; rest: string }>> =
  Object.freeze({
    ink: { lead: "text-brand-ink", rest: "text-brand-accent" },
    paper: { lead: "text-brand-on-deep", rest: "text-brand-accent-bright" },
  });

export function Wordmark({ name, tone, className }: WordmarkProps) {
  const words = name.trim().split(/\s+/u);
  const lead = words[0] ?? name;
  const rest = words.slice(1).join(" ");
  const colours = TONE[tone];

  // A one-word brand has no company half to colour. Splitting it anyway would
  // either leave it uncoloured or tint the house name itself, so it stays whole.
  if (rest === "") {
    return <span className={joinWordmark(colours.lead, className)}>{lead}</span>;
  }

  return (
    // The two halves are one accessible name: the space between them is real
    // text, not a gap, so the name is read and copied as "SIRA Real Estate".
    <span className={joinWordmark(colours.lead, className)}>
      {lead} <span className={colours.rest}>{rest}</span>
    </span>
  );
}

function joinWordmark(...parts: readonly (string | undefined)[]): string {
  return parts.filter((part) => part !== undefined && part !== "").join(" ");
}

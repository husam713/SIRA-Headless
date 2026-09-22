import type { DigitalSiteContent } from "@/content/digital-site";

interface DigitalStatementProps {
  readonly content: DigitalSiteContent;
}

/** The point of view, three lines long, read by a moving light. */
export function DigitalStatement({ content }: DigitalStatementProps) {
  return (
    <section className="dg-section dg-tone-deep" aria-labelledby="dg-statement-heading">
      <div className="dg-container">
        <h2
          className="dg-eyebrow dg-mono"
          id="dg-statement-heading"
          style={{ marginBlockEnd: "2.5rem" }}
        >
          {content.statement.eyebrow}
        </h2>
        <div className="dg-statement">
          {content.statement.lines.map((line, index) => (
            <div key={line} className="dg-statement__line">
              <span className="dg-mono" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <p className="dg-statement__text">{line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import type { DigitalSiteContent } from "@/content/digital-site";

interface DigitalPrinciplesProps {
  readonly content: DigitalSiteContent;
  readonly headingId?: string;
}

/** Four commitments, on lapis. */
export function DigitalPrinciples({
  content,
  headingId = "dg-principles-heading",
}: DigitalPrinciplesProps) {
  const { principles } = content;

  return (
    <section className="dg-section dg-tone-deep" aria-labelledby={headingId}>
      <div className="dg-container">
        <div className="dg-section-head dg-reveal">
          <div>
            <p className="dg-eyebrow dg-mono">{principles.eyebrow}</p>
            <h2 className="dg-display-l" id={headingId}>
              {principles.title}
            </h2>
          </div>
        </div>

        <ol className="dg-principles">
          {principles.items.map((item, index) => (
            <li key={item.title} className="dg-principle dg-reveal">
              <span className="dg-mono dg-principle__index">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="dg-display-m dg-principle__title">{item.title}</h3>
              <p className="dg-principle__body">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

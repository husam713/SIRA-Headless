import type { DigitalSiteContent } from "@/content/digital-site";

interface DigitalApproachProps {
  readonly content: DigitalSiteContent;
}

/** Four stops on one route: map, design, build, run. */
export function DigitalApproach({ content }: DigitalApproachProps) {
  const { approach } = content;

  return (
    <section className="dg-section dg-tone-bone-2" aria-labelledby="dg-approach-heading">
      <div className="dg-container">
        <div className="dg-section-head dg-reveal">
          <div>
            <p className="dg-eyebrow dg-mono">{approach.eyebrow}</p>
            <h2 className="dg-display-l" id="dg-approach-heading">
              {approach.title}
            </h2>
          </div>
          <p className="dg-lede">{approach.intro}</p>
        </div>

        <ol className="dg-steps">
          {approach.steps.map((step) => (
            <li key={step.key} className="dg-step">
              <span className="dg-mono dg-step__index">{step.index}</span>
              <h3 className="dg-display-s dg-step__title">{step.title}</h3>
              <p className="dg-step__summary">{step.summary}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

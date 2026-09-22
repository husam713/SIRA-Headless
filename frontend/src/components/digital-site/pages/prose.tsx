import type { ContentPage } from "@/lib/content/get-content-page";

interface DigitalProsePageProps {
  readonly page: ContentPage;
  readonly eyebrow?: string;
}

/**
 * A CMS page (privacy, terms, anything an editor adds) in the Digital voice.
 * The HTML is sanitised in the data layer, not here.
 */
export function DigitalProsePage({ page, eyebrow }: DigitalProsePageProps) {
  return (
    <article>
      <div className="dg-container">
        <div className="dg-intro">
          {eyebrow === undefined ? null : <p className="dg-eyebrow dg-mono">{eyebrow}</p>}
          <h1 className="dg-display-l">{page.title}</h1>
        </div>
        {page.html === null ? null : (
          <div className="dg-section dg-section--tight" style={{ paddingBlockStart: 0 }}>
            <div className="dg-prose" dangerouslySetInnerHTML={{ __html: page.html }} />
          </div>
        )}
      </div>
    </article>
  );
}

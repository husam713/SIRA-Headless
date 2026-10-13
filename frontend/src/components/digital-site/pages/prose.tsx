import type { ContentPage } from "@/lib/content/get-content-page";

interface DigitalProsePageProps {
  readonly page: ContentPage;
}

/**
 * A CMS page (privacy, terms, anything an editor adds) in the Digital voice.
 * The HTML is sanitised in the data layer, not here.
 */
export function DigitalProsePage({ page }: DigitalProsePageProps) {
  return (
    <article className="dg-tone-paper">
      <header className="dg-page-intro">
        <div className="dg-container">
          <h1 className="dg-title-l dg-page-intro__title">{page.title}</h1>
        </div>
      </header>
      {page.html === null ? null : (
        <div className="dg-section dg-section--flush">
          <div className="dg-container">
            <div className="dg-prose" dangerouslySetInnerHTML={{ __html: page.html }} />
          </div>
        </div>
      )}
    </article>
  );
}

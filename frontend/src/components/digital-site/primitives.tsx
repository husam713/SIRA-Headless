import type { ReactNode } from "react";

import type {
  DigitalPageIntro,
  DigitalQuestion,
  DigitalSiteContent,
} from "@/content/digital-site";
import { digitalHref } from "@/lib/digital-site/hrefs";
import type { LocaleCode, SiteDefinition } from "@/types/site";

/**
 * The Digital document's building blocks. Server components only: nothing
 * here needs the browser. Class names are the design system's vocabulary
 * (docs/website-prototype/04_DESIGN_SYSTEM.md); every one is a `.dg-` class
 * so the sheet stays scoped to this document.
 */

export type DigitalTone = "paper" | "sheet" | "mist" | "night";

interface SectionProps {
  readonly id?: string;
  readonly tone?: DigitalTone;
  readonly labelledBy: string;
  readonly className?: string;
  readonly children: ReactNode;
}

/** A chapter of a page, on one of four surfaces. */
export function Section({ id, tone = "paper", labelledBy, className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`dg-section dg-tone-${tone}${className === undefined ? "" : ` ${className}`}`}
    >
      <div className="dg-container">{children}</div>
    </section>
  );
}

interface SectionHeadProps {
  readonly id: string;
  readonly title: string;
  readonly intro?: string;
  /** Content set beside the heading on wide screens (a link, a note). */
  readonly aside?: ReactNode;
}

/** A section's heading and standfirst. No eyebrow: the title says what it is. */
export function SectionHead({ id, title, intro, aside }: SectionHeadProps) {
  return (
    <header className="dg-head">
      <div className="dg-head__main">
        <h2 className="dg-title-m" id={id}>
          {title}
        </h2>
        {intro === undefined ? null : <p className="dg-head__intro">{intro}</p>}
      </div>
      {aside === undefined ? null : <div className="dg-head__aside">{aside}</div>}
    </header>
  );
}

interface PageIntroProps {
  readonly id: string;
  readonly intro: DigitalPageIntro;
  readonly children?: ReactNode;
}

/** A subpage's opening: the title, line by line, and its standfirst. */
export function PageIntro({ id, intro, children }: PageIntroProps) {
  return (
    <header className="dg-page-intro dg-tone-paper">
      <div className="dg-container">
        <h1 className="dg-title-l dg-page-intro__title" id={id}>
          {intro.title.map((line) => (
            <span key={line} className="dg-line">
              {line}
            </span>
          ))}
        </h1>
        <p className="dg-lede dg-page-intro__lede">{intro.lede}</p>
        {children}
      </div>
    </header>
  );
}

interface ButtonLinkProps {
  readonly href: string;
  readonly variant?: "primary" | "secondary" | "quiet";
  readonly className?: string;
  readonly children: ReactNode;
}

export function ButtonLink({ href, variant = "primary", className, children }: ButtonLinkProps) {
  const variantClass = variant === "primary" ? "" : ` dg-btn--${variant}`;
  return (
    <a href={href} className={`dg-btn${variantClass}${className === undefined ? "" : ` ${className}`}`}>
      {children}
    </a>
  );
}

interface TextLinkProps {
  readonly href: string;
  readonly children: ReactNode;
}

/** An inline link that reads as a link: underlined, the accent colour. */
export function TextLink({ href, children }: TextLinkProps) {
  return (
    <a href={href} className="dg-link">
      {children}
    </a>
  );
}

export type DigitalState = "pending" | "approved" | "rejected" | "draft";

/** A document state, as ERP users see it: a dot and a word, never colour alone. */
export function StatusChip({ state, children }: { readonly state: DigitalState; readonly children: ReactNode }) {
  return <span className={`dg-status dg-status--${state}`}>{children}</span>;
}

interface FaqProps {
  readonly questions: readonly DigitalQuestion[];
  readonly keys: readonly string[];
  /** Exclusive accordion group name, so one answer is open at a time. */
  readonly name: string;
}

/**
 * Questions and answers on native `<details>`: keyboard, find-in-page and
 * screen readers work without a script, and `name` makes the group exclusive
 * where supported.
 */
export function Faq({ questions, keys, name }: FaqProps) {
  const selected = keys
    .map((key) => questions.find((question) => question.key === key))
    .filter((question): question is DigitalQuestion => question !== undefined);

  return (
    <div className="dg-faq">
      {selected.map((question) => (
        <details key={question.key} className="dg-faq__item" name={name}>
          <summary className="dg-faq__q">
            <span>{question.question}</span>
            <span className="dg-faq__marker" aria-hidden="true" />
          </summary>
          <div className="dg-faq__a">
            {question.answer.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}

interface ClosingProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
  readonly content: DigitalSiteContent;
}

/** The ask every page ends with: what happens if you write to us. */
export function Closing({ site, locale, content }: ClosingProps) {
  const { closing } = content.common;
  return (
    <section className="dg-section dg-tone-night dg-closing" aria-labelledby="dg-closing-title">
      <div className="dg-container dg-closing__grid">
        <div>
          <h2 className="dg-title-m" id="dg-closing-title">
            {closing.title}
          </h2>
          <p className="dg-lede dg-closing__intro">{closing.intro}</p>
          <ButtonLink href={digitalHref(site, locale, closing.primary.href)} className="dg-btn--on-night">
            {closing.primary.label}
          </ButtonLink>
        </div>
        <ol className="dg-closing__steps">
          {closing.steps.map((step, index) => (
            <li key={step} className="dg-closing__step">
              <span className="dg-closing__index" aria-hidden="true">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

interface RelatedProps {
  readonly site: SiteDefinition;
  readonly locale: LocaleCode;
  readonly content: DigitalSiteContent;
  /** Locale-less paths of the pages to suggest next. */
  readonly paths: readonly string[];
}

/** "Continue with": the next pages, from the navigation's own labels. */
export function Related({ site, locale, content, paths }: RelatedProps) {
  const items = paths
    .map((path) => content.nav.items.find((item) => item.href === path))
    .filter((item): item is NonNullable<typeof item> => item !== undefined);
  if (items.length === 0) return null;

  return (
    <nav className="dg-related" aria-labelledby="dg-related-title">
      <div className="dg-container dg-related__inner">
        <h2 className="dg-label" id="dg-related-title">
          {content.common.related}
        </h2>
        <ul className="dg-related__list">
          {items.map((item) => (
            <li key={item.href}>
              <a className="dg-related__link" href={digitalHref(site, locale, item.href)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

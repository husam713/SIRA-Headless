import Link from "next/link";
import type { CSSProperties } from "react";

import {
  editorialDeskAccent,
  editorialDeskLabel,
  primaryDesk,
} from "@/lib/editorial/desks";
import { formatShortDateline } from "@/lib/editorial/entry-view";
import { editorialKindSingular } from "@/lib/editorial/record";
import { editorialArticleHref } from "@/lib/editorial/routes";
import type { EditorialItem } from "@/lib/editorial/types";
import { formatContentDate } from "@/lib/homepage/format-date";
import { CHROME, localizeUnitLabel } from "@/lib/i18n/locale";
import type { LocaleCode } from "@/types/site";

// Editorial rows from the newsroom feed, set the way the homepage insights
// chapter sets them: desk and kind as the kicker, the title, one line, the
// picture plate at the trailing edge. Every row links into the newsroom's own
// article route, whose design is untouched.

interface InsightRowsProps {
  readonly items: readonly EditorialItem[];
  readonly href: (path: string) => string;
  /** The page's language, for the kicker; the articles themselves stay as written. */
  readonly locale?: LocaleCode;
}

export function InsightRows({ items, href, locale = "en" }: InsightRowsProps) {
  if (items.length === 0) return null;

  const withMedia = items.every((item) => item.featuredImage !== null);

  return (
    <div className="atlas-insights">
      {items.map((item, index) => {
        const desk = primaryDesk(item);
        const articleHref = editorialArticleHref(item.href);
        const date = locale === "en" ? formatShortDateline(item.publishedAt) : formatContentDate(item.publishedAt, locale);
        const kind = locale === "en" ? editorialKindSingular(item.kind) : CHROME[locale].editorialKinds[item.kind];

        return (
          <article
            key={item.databaseId}
            className={`atlas-insight reveal${withMedia ? "" : " atlas-insight--text"}`}
            style={
              {
                "--reveal-offset": `${String(Math.min(index, 5) * 1.5)}%`,
                "--c": editorialDeskAccent(desk),
              } as CSSProperties
            }
          >
            <p className="atlas-insight__meta">
              <b style={{ color: editorialDeskAccent(desk) }}>
                {localizeUnitLabel(locale, desk, editorialDeskLabel(desk))}
              </b>
              <span>
                {kind}
                {date !== null ? ` · ${date}` : null}
              </span>
            </p>

            <div>
              <h3 className="atlas-insight__title">
                {articleHref === null ? (
                  item.title
                ) : (
                  <Link href={href(articleHref)} className="transition-colors hover:text-brand-accent">
                    {item.title}
                  </Link>
                )}
              </h3>
              {item.excerpt !== null ? <p className="atlas-insight__copy">{item.excerpt}</p> : null}
            </div>

            {withMedia && item.featuredImage !== null ? (
              <div className="atlas-insight__thumb" aria-hidden="true">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.featuredImage.sourceUrl}
                  alt=""
                  width={item.featuredImage.width ?? undefined}
                  height={item.featuredImage.height ?? undefined}
                  loading="lazy"
                  decoding="async"
                />
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

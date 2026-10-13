import type { ReactNode } from "react";

import type { DigitalDashboardContent, DigitalDashboardTile } from "@/content/digital-site/types";
import { DASHBOARD_DEMO } from "@/content/digital-site/demo/dashboard";
import { formatAmount, formatNumber, formatPercent } from "@/lib/digital-site/format";
import type { LocaleCode } from "@/types/site";

interface DashboardProps {
  readonly content: DigitalDashboardContent;
  readonly locale: LocaleCode;
  /** The visible "illustrative" label, from the narrative's common strings. */
  readonly illustrative: string;
}

interface TileProps {
  readonly tile: DigitalDashboardTile;
  readonly value: ReactNode;
  readonly sourceLabel: string;
  readonly wide?: boolean;
  /** Spans the whole row (the chart). */
  readonly full?: boolean;
  readonly children?: ReactNode;
}

/**
 * One figure, and the documents it comes from. The disclosure is the point:
 * a management number is only trusted when the trail behind it is one step
 * away, which is what an ERP gives a manager that a spreadsheet does not.
 */
function Tile({ tile, value, sourceLabel, wide = false, full = false, children }: TileProps) {
  return (
    <div className={`dg-tile${wide ? " dg-tile--wide" : ""}${full ? " dg-tile--full" : ""}`}>
      <p className="dg-tile__label">{tile.label}</p>
      <p className="dg-tile__value">{value}</p>
      {children}
      <p className="dg-tile__note">{tile.note}</p>
      <details className="dg-tile__source">
        <summary>{sourceLabel}</summary>
        <ul>
          {tile.sources.map((source) => (
            <li key={source}>{source}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}

/** Twelve weeks of invoiced sales as bars, with the same data as a table for assistive technology. */
function SalesChart({ content, locale }: { readonly content: DigitalDashboardContent; readonly locale: LocaleCode }) {
  const values = DASHBOARD_DEMO.sales;
  const max = Math.max(...values);
  const width = 480;
  const height = 132;
  const gap = 8;
  const bar = (width - gap * (values.length - 1)) / values.length;
  const rtl = locale === "ar";

  return (
    <>
      <svg className="dg-bars" viewBox={`0 0 ${width} ${height + 4}`} aria-hidden="true" focusable="false">
        <line className="dg-bars__base" x1={0} x2={width} y1={height + 1} y2={height + 1} />
        {values.map((value, index) => {
          const h = Math.round((value / max) * (height - 8));
          // Time runs in the reading direction: newest at the end of the line.
          const slot = rtl ? values.length - 1 - index : index;
          return (
            <rect
              key={index}
              className={`dg-bars__bar${index === values.length - 1 ? " dg-bars__bar--latest" : ""}`}
              x={slot * (bar + gap)}
              y={height - h}
              width={bar}
              height={h}
              rx={1.5}
            />
          );
        })}
      </svg>
      <table className="dg-visually-hidden">
        <caption>{content.sales.label}</caption>
        <tbody>
          {values.map((value, index) => (
            <tr key={index}>
              <th scope="row">
                {content.sales.weekPrefix} {formatNumber(locale, index + 1)}
              </th>
              <td>{formatNumber(locale, value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/**
 * "What the general manager opens on Sunday morning": a management view of a
 * fictional trading company. Every figure is sample data from
 * `content/digital-site/demo/dashboard.ts`, and the view says so twice — in
 * its stamp and in the shared illustrative label — so nothing on it can be
 * read as a client's numbers or as SIRA Digital's results.
 */
export function Dashboard({ content, locale, illustrative }: DashboardProps) {
  const data = DASHBOARD_DEMO;
  const ageingMax = Math.max(...data.ageing);
  /** The chart's headline: the twelve weeks it shows, in riyals. */
  const twelveWeeks = data.sales.reduce((sum, week) => sum + week, 0) * 1000;

  return (
    <div className="dg-dash">
      <div className="dg-dash__bar">
        <div>
          <p className="dg-dash__company">{content.company}</p>
          <p className="dg-dash__period">{content.period}</p>
        </div>
        <p className="dg-dash__stamp">{content.stamp}</p>
      </div>

      <div className="dg-dash__grid">
        <Tile tile={content.tiles.cash} value={formatAmount(locale, data.cash, content.currency)} sourceLabel={content.sourceLabel} />
        <Tile tile={content.tiles.approvals} value={formatNumber(locale, data.approvals)} sourceLabel={content.sourceLabel} />
        <Tile tile={content.tiles.reorder} value={formatNumber(locale, data.reorder)} sourceLabel={content.sourceLabel} />
        <Tile tile={content.tiles.margin} value={formatPercent(locale, data.margin)} sourceLabel={content.sourceLabel} />

        <Tile
          tile={content.tiles.overdue}
          value={formatAmount(locale, data.overdue, content.currency)}
          sourceLabel={content.sourceLabel}
          wide
        >
          <dl className="dg-ageing" aria-label={content.ageing.label}>
            {data.ageing.map((amount, index) => (
              <div key={content.ageing.buckets[index] ?? index} className="dg-ageing__row">
                <dt>{content.ageing.buckets[index]}</dt>
                <dd>
                  <span
                    className="dg-ageing__bar"
                    style={{ inlineSize: `${Math.max(6, (amount / ageingMax) * 100)}%` }}
                    aria-hidden="true"
                  />
                  <span className="dg-ageing__value">{formatNumber(locale, amount)}</span>
                </dd>
              </div>
            ))}
          </dl>
        </Tile>

        <Tile
          tile={content.invoices}
          value={formatNumber(locale, data.invoices.cleared + data.invoices.reported + data.invoices.rejected)}
          sourceLabel={content.sourceLabel}
          wide
        >
          <ul className="dg-einv">
            <li>
              <span className="dg-status dg-status--approved">{content.invoices.cleared}</span>
              <span className="dg-einv__value">{formatNumber(locale, data.invoices.cleared)}</span>
            </li>
            <li>
              <span className="dg-status dg-status--draft">{content.invoices.reported}</span>
              <span className="dg-einv__value">{formatNumber(locale, data.invoices.reported)}</span>
            </li>
            <li>
              <span className="dg-status dg-status--rejected">{content.invoices.rejected}</span>
              <span className="dg-einv__value">{formatNumber(locale, data.invoices.rejected)}</span>
            </li>
          </ul>
        </Tile>

        <Tile tile={content.sales} value={formatAmount(locale, twelveWeeks, content.currency)} sourceLabel={content.sourceLabel} full>
          <SalesChart content={content} locale={locale} />
        </Tile>
      </div>

      <p className="dg-illustrative">{illustrative}</p>
    </div>
  );
}

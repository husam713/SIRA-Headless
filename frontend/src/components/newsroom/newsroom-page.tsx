import Link from "next/link";

import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { DeskIndex, type DeskIndexEntry } from "@/components/newsroom/desk-index";
import { NewsroomFront } from "@/components/newsroom/newsroom-front";
import { NewsroomLead } from "@/components/newsroom/newsroom-lead";
import {
  NewsroomMasthead,
  type ExtentCellProps,
} from "@/components/newsroom/newsroom-masthead";
import {
  NewsroomRecord,
  type NewsroomRecordBand,
} from "@/components/newsroom/newsroom-record";
import {
  deskRegister,
  editorialDeskLabel,
  isEditorialDeskKey,
} from "@/lib/editorial/desks";
import { toEntryViews } from "@/lib/editorial/entry-view";
import {
  composeNewsroom,
  countByKind,
  editorialKindLabel,
  yearSpan,
} from "@/lib/editorial/record";
import type {
  EditorialDeskKey,
  EditorialItem,
  EditorialKind,
} from "@/lib/editorial/types";
import type { SiteKey } from "@/types/site";

// ONE newsroom, instantiated per tenant (ADR-020). The route resolves the site,
// the brand and the feed; every decision about what the page then *is* lives
// here, which is why the preview harness can render the production page rather
// than a copy of it.
//
// The two tenant shapes are art-directed rather than merely recoloured:
//
//   GROUP indexes by DESK. The question a reader brings to a holding company's
//   newsroom is which house did this, so the index is the composition of the
//   group and each entry reports the company that filed it.
//
//   A BRANCH has one desk, so indexing by it would be a row of one. It indexes
//   by FORMAT instead, and its entries report their kind where Group's report
//   their company.
//
// Same system, same components, one implementation, different axis.

export interface NewsroomPageProps {
  readonly siteKey: SiteKey;
  readonly brandName: string;
  /** The loaded window of the record, newest first. */
  readonly items: readonly EditorialItem[];
  /** Active desk filter. Group only; ignored elsewhere. */
  readonly desk: EditorialDeskKey | null;
  /** Active format filter. Branch tenants only; ignored on Group. */
  readonly kind: EditorialKind | null;
  /** True when the feed failed rather than came back empty. */
  readonly isFailure: boolean;
  /**
   * False on any host that is not the tenant's canonical production hostname.
   * On those hosts the record may still hold placeholder editorial (ADR-030),
   * and the masthead says so. The same signal already drives `noindex`, so the
   * caveat and the crawler policy cannot disagree.
   */
  readonly isProductionCanonical?: boolean;
}

function buildIndex(
  isGroup: boolean,
  items: readonly EditorialItem[],
  desk: EditorialDeskKey | null,
  kind: EditorialKind | null,
): readonly DeskIndexEntry[] {
  if (isGroup) {
    return Object.freeze([
      {
        key: "all",
        label: "All desks",
        href: "/news",
        count: items.length,
        share: 1,
        accent: null,
        isActive: desk === null,
      },
      ...deskRegister(items).map((entry) => ({
        key: entry.desk,
        label: entry.label,
        href: `/news?desk=${entry.desk}`,
        count: entry.count,
        share: entry.share,
        accent: entry.accent,
        isActive: desk === entry.desk,
      })),
    ]);
  }

  return Object.freeze([
    {
      key: "all",
      label: "Everything",
      href: "/news",
      count: items.length,
      share: 1,
      accent: null,
      isActive: kind === null,
    },
    ...countByKind(items).map((entry) => ({
      key: entry.kind,
      label: entry.label,
      href: `/news?kind=${entry.kind}`,
      count: entry.count,
      share: entry.share,
      // A branch page is already painted in its own company's accent; a second
      // set of accents inside it would say the formats are five more brands.
      accent: null,
      isActive: kind === entry.kind,
    })),
  ]);
}

export function NewsroomPage({
  siteKey,
  brandName,
  items,
  desk,
  kind,
  isFailure,
  isProductionCanonical = true,
}: NewsroomPageProps) {
  const isGroup = siteKey === "group";
  const secondary = isGroup ? "desk" : "kind";

  const activeDesk = isGroup ? desk : null;
  const activeKind = isGroup ? null : kind;

  const selected =
    activeDesk !== null
      ? items.filter((item) => item.desks.includes(activeDesk))
      : activeKind !== null
        ? items.filter((item) => item.kind === activeKind)
        : items;

  const { lead, front, record } = composeNewsroom(selected);
  const bands: readonly NewsroomRecordBand[] = record.map((band) => ({
    year: band.year,
    entries: toEntryViews(band.items),
  }));

  const span = yearSpan(items);
  const deskCount = new Set(items.flatMap((item) => [...item.desks])).size;
  const kindCount = new Set(items.map((item) => item.kind)).size;

  const extent: readonly ExtentCellProps[] = [
    { label: "Entries", value: String(items.length) },
    ...(span === null ? [] : [{ label: "Covering", value: span }]),
    isGroup
      ? { label: "Desks", value: String(deskCount) }
      : { label: "Formats", value: String(kindCount) },
  ];

  const filterLabel =
    activeDesk !== null && isEditorialDeskKey(activeDesk)
      ? editorialDeskLabel(activeDesk)
      : activeKind !== null
        ? editorialKindLabel(activeKind)
        : null;

  return (
    <>
      <NewsroomMasthead
        deskLabel={isGroup ? "SIRA GROUP" : brandName}
        standfirst={
          isGroup
            ? "Investments, partnerships and perspectives from SIRA GROUP and the specialised companies it builds."
            : `Announcements and analysis from ${brandName}, filed alongside the wider SIRA GROUP record.`
        }
        extent={extent}
        notice={
          isProductionCanonical
            ? null
            : "This record may include placeholder editorial published for design review. It is not a SIRA GROUP announcement."
        }
      />

      {/*
        The index renders whenever the record holds anything at all, including
        under a filter that matched nothing — it is how a reader gets back out
        of an empty view.
      */}
      {items.length > 0 ? (
        <DeskIndex
          label={
            isGroup
              ? "Filter the record by desk"
              : "Filter the record by format"
          }
          entries={buildIndex(isGroup, items, activeDesk, activeKind)}
        />
      ) : null}

      {lead !== null ? (
        <>
          <NewsroomLead entry={toEntryViews([lead])[0]!} secondary={secondary} />
          <NewsroomFront entries={toEntryViews(front)} secondary={secondary} />
          <NewsroomRecord bands={bands} secondary={secondary} />
        </>
      ) : (
        <EmptyRecord
          filterLabel={filterLabel}
          brandName={brandName}
          isFailure={isFailure}
        />
      )}
    </>
  );
}

interface EmptyRecordProps {
  readonly filterLabel: string | null;
  readonly brandName: string;
  readonly isFailure: boolean;
}

/**
 * Three different nothings, said differently.
 *
 * A filter that matched nothing, a record that has not been opened yet, and a
 * feed that failed to load are not the same event, and telling a reader "no
 * articles" for all three — as the reference design did — hides a fault behind
 * what looks like ordinary emptiness.
 */
function EmptyRecord({ filterLabel, brandName, isFailure }: EmptyRecordProps) {
  const message = isFailure
    ? "The record could not be loaded just now. This is a fault on our side, not an empty archive — please try again shortly."
    : filterLabel !== null
      ? `Nothing has been filed under ${filterLabel} yet.`
      : `${brandName} has not filed to the record yet. Announcements and analysis will appear here first.`;

  return (
    <Section space="tight" label="The record">
      <PageContainer>
        <p className="max-w-[46ch] text-[clamp(1.125rem,2vw,1.5rem)] leading-[1.5] text-brand-ink-soft">
          {message}
        </p>
        {filterLabel !== null ? (
          <p className="mt-8">
            <Link
              href="/news"
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-accent underline underline-offset-4"
            >
              View the whole record
            </Link>
          </p>
        ) : null}
      </PageContainer>
    </Section>
  );
}

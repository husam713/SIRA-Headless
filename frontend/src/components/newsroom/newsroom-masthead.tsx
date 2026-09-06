import { PageContainer } from "@/components/layout/page-container";
import { Section } from "@/components/layout/section";
import { SectionEyebrow } from "@/components/layout/section-eyebrow";

// Every SIRA tenant runs the same masthead under the same title, because the
// newsroom is one institutional record kept by five desks — not five
// newsrooms. The eyebrow names which desk you are standing in, and the tenant's
// own brand tokens colour the page. That is the whole business proposition of a
// holding company, stated by the page before a word of it is read.
//
// It is compact on purpose. A full-viewport hero over an archive tells a reader
// nothing and costs them a scroll; the extent block tells them immediately how
// much record there is and how far back it runs.

export interface ExtentCellProps {
  readonly label: string;
  readonly value: string;
}

interface NewsroomMastheadProps {
  readonly deskLabel: string;
  readonly standfirst: string;
  /** Two or three figures describing what the page is holding. */
  readonly extent: readonly ExtentCellProps[];
  /**
   * Shown on non-production hosts while the record may still contain
   * placeholder editorial (ADR-030). It is deliberately part of the masthead
   * rather than a badge on each entry: the caveat is about the whole record,
   * and stamping every headline would make the page unusable for the design
   * review it exists to support.
   */
  readonly notice?: string | null;
}

function ExtentCell({ label, value }: ExtentCellProps) {
  return (
    <div className="extent__cell">
      <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-paper/60">
        {label}
      </dt>
      {/*
        Isolated for the same reason as the dateline: "2023-2026" is two number
        runs around a neutral en dash, which RTL reorders to "2026-2023". The
        cell itself still aligns logically.
      */}
      <dd
        dir="ltr"
        className="mt-2 whitespace-nowrap font-display text-[clamp(1.5rem,2vw,1.75rem)] leading-none tabular-nums text-brand-paper rtl:text-end"
      >
        {value}
      </dd>
    </div>
  );
}

export function NewsroomMasthead({
  deskLabel,
  standfirst,
  extent,
  notice = null,
}: NewsroomMastheadProps) {
  return (
    <Section tone="deep" labelledBy="newsroom-heading" space="tight">
      <PageContainer className="grid gap-y-12 lg:grid-cols-12 lg:gap-x-12">
        <div className="lg:col-span-7">
          <SectionEyebrow tone="bright">{deskLabel} · Newsroom</SectionEyebrow>
          <h1
            id="newsroom-heading"
            className="mt-7 font-display text-[clamp(3rem,9vw,6.5rem)] font-normal leading-[0.94] tracking-[-0.015em]"
          >
            The Record
          </h1>
          <p className="mt-8 max-w-[48ch] text-[clamp(1.0625rem,1.5vw,1.25rem)] leading-[1.6] text-brand-paper/65">
            {standfirst}
          </p>
        </div>

        {/*
          Stated as a description list so the figures keep their labels for a
          screen reader instead of becoming three loose numbers.
        */}
        <dl className="extent self-end lg:col-span-5">
          {extent.map((cell) => (
            <ExtentCell key={cell.label} label={cell.label} value={cell.value} />
          ))}
        </dl>

        {notice !== null ? (
          <p
            // role=note rather than status: it is a standing caveat about the
            // page, not something that changed and needs announcing.
            className="border-t border-brand-paper/20 pt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-paper/70 lg:col-span-12"
          >
            <span className="text-brand-accent-bright">Preview</span>{" "}
            <span aria-hidden="true">·</span> {notice}
          </p>
        ) : null}
      </PageContainer>
    </Section>
  );
}

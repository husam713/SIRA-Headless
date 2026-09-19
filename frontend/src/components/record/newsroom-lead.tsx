import Link from "next/link";

import { accentStyle, RecordEyebrow } from "@/components/record/record-primitives";
import type { EntryView } from "@/lib/editorial/entry-view";

interface NewsroomLeadProps {
  readonly entry: EntryView;
}

/** The lead is editorially led by its actual image or, when absent, by type. */
export function NewsroomLead({ entry }: NewsroomLeadProps) {
  const { item } = entry;

  return (
    <article
      className={`newsroom-hero${
        item.featuredImage === null ? " newsroom-hero--text-only" : ""
      }`}
      style={accentStyle(entry.accent)}
    >
      <div className="newsroom-hero__copy">
        <RecordEyebrow accent={entry.accent}>
          <span>{entry.deskLabel}</span>
          <span>{entry.kindLabel}</span>
        </RecordEyebrow>
        <h2>
          {entry.href === null ? (
            item.title
          ) : (
            <Link href={entry.href}>{item.title}</Link>
          )}
        </h2>
        {item.excerpt !== null ? (
          <p className="newsroom-hero__deck">{item.excerpt}</p>
        ) : null}
        {entry.href !== null ? (
          <Link href={entry.href} className="newsroom-hero__link">
            Read the story <span aria-hidden="true">&rarr;</span>
          </Link>
        ) : null}
      </div>

      {item.featuredImage !== null ? (
        <figure className="newsroom-hero__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.featuredImage.sourceUrl}
            alt={item.featuredImage.altText ?? ""}
            width={item.featuredImage.width ?? undefined}
            height={item.featuredImage.height ?? undefined}
            loading="eager"
            decoding="async"
          />
        </figure>
      ) : null}
    </article>
  );
}

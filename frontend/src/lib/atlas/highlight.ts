// The italic accent phrase inside an Atlas heading.
//
// The homepage hero has an editorial field for its highlight; the inner pages
// have one heading string. An editor marks the phrase with asterisks —
// "Developments and facilities *under way.*" — and the page sets it in the
// accent italic. The marks are the only convention: a heading without them
// reads whole, and a heading that keeps them by mistake loses only the marks.

export interface SplitHeading {
  readonly text: string;
  readonly highlight: string | null;
}

export function splitHighlight(heading: string): SplitHeading {
  const match = /\*([^*]+)\*/u.exec(heading);

  if (match === null || match[1] === undefined) {
    return { text: heading, highlight: null };
  }

  return {
    text: heading.replace(match[0], match[1]),
    highlight: match[1],
  };
}

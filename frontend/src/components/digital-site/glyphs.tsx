/**
 * The few drawn marks the Digital document uses. Each is a line that turns
 * at right angles — the grammar of the SIRA mark — and each is decorative
 * (`aria-hidden`): the text beside it carries the meaning.
 */

/** The small mark beside the wordmark: the line nesting inward, once. Interim, pending the Digital mark. */
export function WordmarkGlyph({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path
        d="M1.5 15 V1.5 H14.5 V11 H7 V6"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinejoin="miter"
        strokeLinecap="square"
      />
    </svg>
  );
}

export function MenuGlyph({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M2 5.5 H18 M2 10 H18 M2 14.5 H18" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="square" />
    </svg>
  );
}

export function CloseGlyph({ className }: { readonly className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M4 4 L16 16 M16 4 L4 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="square" />
    </svg>
  );
}

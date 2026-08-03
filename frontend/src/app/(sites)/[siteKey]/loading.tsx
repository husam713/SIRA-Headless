export default function Loading() {
  return (
    <div
      className="mx-auto min-h-[60svh] max-w-7xl px-6 py-20 lg:px-8"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading SIRA site</span>
      <div className="h-8 w-40 animate-pulse rounded bg-brand-ink/10" />
      <div className="mt-8 h-16 max-w-3xl animate-pulse rounded bg-brand-ink/10" />
    </div>
  );
}

export default function NotFound() {
  return (
    <section className="mx-auto grid min-h-[60svh] max-w-3xl content-center gap-5 px-6 py-20">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">
        404
      </p>
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="text-brand-ink/70">
        The requested SIRA page does not exist.
      </p>
    </section>
  );
}

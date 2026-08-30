import { PageContainer } from "@/components/layout/page-container";
import { Prose } from "@/components/layout/prose";
export default function NotFound() {
  return (
    <section>
      <PageContainer className="grid min-h-[60svh] content-center py-20">
        {/* max-w-3xl was a reading measure, not a container width. */}
        <Prose className="mx-auto grid gap-5">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">
        404
      </p>
      <h1 className="text-4xl font-semibold">Page not found</h1>
      <p className="text-brand-ink/70">
        The requested SIRA page does not exist.
      </p>
        </Prose>
      </PageContainer>
    </section>
  );
}

import { PageContainer } from "@/components/layout/page-container";

export default function Loading() {
  return (
    // The live-region semantics stay on a real element: PageContainer does not
    // declare aria-*, and TypeScript does not flag hyphenated JSX attributes on
    // components, so passing them to it would drop them silently.
    <div aria-busy="true" aria-live="polite">
      <PageContainer className="min-h-[60svh] py-20">
        <span className="sr-only">Loading SIRA site</span>
        <div className="h-8 w-40 animate-pulse rounded bg-brand-ink/10" />
        <div className="mt-8 h-16 max-w-3xl animate-pulse rounded bg-brand-ink/10" />
      </PageContainer>
    </div>
  );
}

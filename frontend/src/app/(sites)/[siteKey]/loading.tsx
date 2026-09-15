import { PageContainer } from "@/components/layout/page-container";

// The interim state between routes. It is shaped like the thing it stands in
// for — an eyebrow, a headline, a lead paragraph, set on the page's own intro
// rhythm — so the content arrives into a layout that is already there rather
// than replacing two grey bars of a different size. `animate-pulse` is
// collapsed by the site-wide reduced-motion rule, leaving the still shapes.
export default function Loading() {
  return (
    // The live-region semantics stay on a real element: PageContainer does not
    // declare aria-*, and TypeScript does not flag hyphenated JSX attributes on
    // components, so passing them to it would drop them silently.
    <div aria-busy="true" aria-live="polite">
      <PageContainer className="min-h-[60svh] pb-12 pt-[clamp(4rem,8vw,7rem)]">
        <span className="sr-only">Loading SIRA site</span>
        <div aria-hidden="true" className="animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-px w-8 bg-brand-ink/15" />
            <div className="h-2.5 w-28 rounded-sm bg-brand-ink/10" />
          </div>
          <div className="mt-6 h-[clamp(2.25rem,5vw,3.75rem)] max-w-[22ch] rounded-sm bg-brand-ink/10" />
          <div className="mt-3 h-[clamp(2.25rem,5vw,3.75rem)] max-w-[14ch] rounded-sm bg-brand-ink/10" />
          <div className="mt-8 h-4 max-w-[60ch] rounded-sm bg-brand-ink/[0.07]" />
          <div className="mt-3 h-4 max-w-[52ch] rounded-sm bg-brand-ink/[0.07]" />
        </div>
      </PageContainer>
    </div>
  );
}

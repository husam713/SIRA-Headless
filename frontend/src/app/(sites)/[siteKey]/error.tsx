"use client";
import { PageContainer } from "@/components/layout/page-container";
import { Prose } from "@/components/layout/prose";

import { useEffect } from "react";

interface SiteErrorProps {
  readonly error: Error & {
    readonly digest?: string;
  };
  readonly reset: () => void;
}

export default function SiteError({ error, reset }: SiteErrorProps) {
  useEffect(() => {
    console.error("SIRA route error", {
      digest: error.digest ?? null,
      name: error.name,
    });
  }, [error]);

  return (
    <section role="alert">
      <PageContainer className="grid min-h-[60svh] content-center py-20">
        {/* max-w-3xl was a reading measure, not a container width. */}
        <Prose className="mx-auto grid gap-5">
          <h1 className="text-3xl font-semibold">This page could not be loaded.</h1>
          <p className="text-brand-ink/70">
            Please try again. No private error details are displayed.
          </p>
          <div>
            <button
              type="button"
              onClick={reset}
              className="rounded-md bg-brand-primary px-5 py-3 font-medium text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink"
            >
              Try again
            </button>
          </div>
        </Prose>
      </PageContainer>
    </section>
  );
}

"use client";

import { useEffect, useSyncExternalStore } from "react";

import { PageContainer } from "@/components/layout/page-container";
import { Prose } from "@/components/layout/prose";
import { CHROME, isLocaleCode } from "@/lib/i18n/locale";
import type { LocaleCode } from "@/types/site";

interface SiteErrorProps {
  readonly error: Error & {
    readonly digest?: string;
  };
  readonly reset: () => void;
}

/**
 * A Client Component cannot read the request, so the language comes from
 * the document the layout already rendered (`<html lang>`). The server
 * snapshot is the default language; the client snapshot is the document's,
 * and useSyncExternalStore reconciles the two after hydration without a
 * mismatch. An error page is the one place that trade is acceptable.
 */
const noSubscription = (): (() => void) => () => undefined;
const readDocumentLocale = (): LocaleCode => {
  const lang = document.documentElement.lang;
  return isLocaleCode(lang) ? lang : "en";
};
const readServerLocale = (): LocaleCode => "en";

function useDocumentLocale(): LocaleCode {
  return useSyncExternalStore(noSubscription, readDocumentLocale, readServerLocale);
}

export default function SiteError({ error, reset }: SiteErrorProps) {
  const chrome = CHROME[useDocumentLocale()];

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
          <h1 className="atlas-display atlas-display--m">{chrome.errorTitle}</h1>
          <p className="text-brand-ink/70">{chrome.errorBody}</p>
          <div>
            <button
              type="button"
              onClick={reset}
              className="press rounded-md bg-brand-primary px-5 py-3 font-medium text-brand-ink hover:bg-brand-accent-bright"
            >
              {chrome.tryAgain}
            </button>
          </div>
        </Prose>
      </PageContainer>
    </section>
  );
}

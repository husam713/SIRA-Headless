import { headers } from "next/headers";

import { PageContainer } from "@/components/layout/page-container";
import { Prose } from "@/components/layout/prose";
import { CHROME, isLocaleCode, LOCALE_HEADER } from "@/lib/i18n/locale";

export default async function NotFound() {
  // The proxy writes the resolved locale for every served request; a missing
  // or unexpected value is the default language, never a throw on a 404.
  const locale = (await headers()).get(LOCALE_HEADER) ?? "en";
  const chrome = CHROME[isLocaleCode(locale) ? locale : "en"];

  return (
    <section>
      <PageContainer className="grid min-h-[60svh] content-center py-20">
        {/* max-w-3xl was a reading measure, not a container width. */}
        <Prose className="mx-auto grid gap-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-accent">404</p>
          <h1 className="atlas-display atlas-display--m">{chrome.notFoundTitle}</h1>
          <p className="text-brand-ink/70">{chrome.notFoundBody}</p>
        </Prose>
      </PageContainer>
    </section>
  );
}

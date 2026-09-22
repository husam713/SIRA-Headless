"use client";

import { useEffect, useState } from "react";

import { intlLocale } from "@/lib/i18n/locale";
import type { LocaleCode } from "@/types/site";

interface DigitalClockProps {
  readonly label: string;
  readonly locale: LocaleCode;
}

/**
 * The time in Saudi Arabia, in the footer. A small live thing on a page that
 * otherwise holds still: it says the company keeps this clock. Rendered only
 * after mount so the server never guesses a minute the client would correct.
 */
export function DigitalClock({ label, locale }: DigitalClockProps) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(intlLocale(locale), {
      timeZone: "Asia/Riyadh",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      // Latin digits in both languages (ADR-034).
      numberingSystem: "latn",
    });

    const update = () => setTime(formatter.format(new Date()));
    update();

    const now = Date.now();
    const untilNextMinute = 60_000 - (now % 60_000);
    let interval: ReturnType<typeof setInterval> | null = null;
    const timeout = setTimeout(() => {
      update();
      interval = setInterval(update, 60_000);
    }, untilNextMinute);

    return () => {
      clearTimeout(timeout);
      if (interval !== null) clearInterval(interval);
    };
  }, [locale]);

  return (
    <span className="dg-clock dg-mono">
      <span className="dg-clock__dot" aria-hidden="true" />
      <span>{label}</span>
      {time === null ? null : (
        <time className="dg-num" dateTime={time}>
          {time}
        </time>
      )}
    </span>
  );
}

import { CHROME } from "@/lib/i18n/locale";
import type { LocaleCode } from "@/types/site";

interface LanguageSwitchProps {
  /** The locale currently being read. */
  readonly locale: LocaleCode;
  /** The same page in the other language. */
  readonly href: string;
  readonly alternate: LocaleCode;
  readonly className?: string;
}

/**
 * The switch between the two languages.
 *
 * Three details matter more than the styling:
 *
 * - The label is the target language written in its own script — العربية, not
 *   "Arabic" — because the person who needs it is by definition not reading the
 *   current language well.
 * - `lang` on the anchor tells a screen reader to pronounce that label with the
 *   right voice, and `hrefLang` tells everything else what is on the other end.
 * - It points at the current page in the other language, not at the homepage.
 *   Dropping a reader on the front page is the most common way this control is
 *   got wrong.
 *
 * A link rather than a control with state: the language is in the URL, so
 * switching it is navigation.
 */
export function LanguageSwitch({
  locale,
  href,
  alternate,
  className,
}: LanguageSwitchProps) {
  const chrome = CHROME[locale];

  return (
    <a
      href={href}
      lang={alternate}
      hrefLang={alternate}
      dir={alternate === "ar" ? "rtl" : "ltr"}
      title={chrome.switchLanguageHint}
      className={className}
    >
      {chrome.switchLanguage}
    </a>
  );
}

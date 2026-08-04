import Link from "next/link";
import { alternateLanguages } from "./chapters";
import { t } from "./ui";
import type { Locale } from "./types";

/**
 * 日英の切替リンク。同じ章の対訳ページへ直接飛ぶ。
 * hreflang と同じ対応表(alternateLanguages)を使うので、両者がずれない。
 */
export default function LocaleSwitch({
  path,
  locale,
}: {
  path: string;
  locale: Locale;
}) {
  const alt = alternateLanguages(path, locale);
  const target = locale === "en" ? alt.ja : alt.en;
  const strings = t(locale);

  return (
    <Link
      href={target}
      hrefLang={locale === "en" ? "ja" : "en"}
      aria-label={strings.switchAria}
      className="rounded-full border border-gray-300 dark:border-neutral-600 px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-300 transition hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-500 dark:hover:text-blue-400"
    >
      {strings.switchLabel}
    </Link>
  );
}

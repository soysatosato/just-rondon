import { t } from "./ui";
import type { Locale } from "./types";

export default function Disclaimer({
  locale = "ja",
}: {
  locale?: Locale;
}) {
  const strings = t(locale);

  return (
    <aside className="mt-10 rounded-lg border border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 p-4 text-xs leading-relaxed text-amber-900 dark:text-amber-200">
      <p className="font-semibold">{strings.disclaimerHeading}</p>
      {strings.disclaimerBody.map((paragraph) => (
        <p key={paragraph} className="mt-2">
          {paragraph}
        </p>
      ))}
    </aside>
  );
}

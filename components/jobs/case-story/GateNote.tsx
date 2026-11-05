import { CASE_STORY_GATE_ENABLED } from "./gate";
import { t } from "./ui";
import type { Locale } from "./types";

/**
 * 目次ページで、どこまで誰でも読めるかを先に伝える一言。
 * 章を開いてから閉じていると知るより、ここで分かっている方が裏切られた感じが少ない。
 * 線を引いていないあいだは何も出さない。
 */
export default function GateNote({ locale = "ja" }: { locale?: Locale }) {
  if (!CASE_STORY_GATE_ENABLED) return null;
  return (
    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
      {t(locale).gateIndexNote}
    </p>
  );
}

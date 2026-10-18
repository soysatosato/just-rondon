import type { ReactNode } from "react";

/**
 * ガイド記事の章ひとつ分の入れ物。ビザ・住まい・お金などの分野別
 * レイアウト(18種)が同じものをそれぞれ書いていたので、ここに集めた。
 *
 * スマホでは枠で囲まず、章の頭に罫線を引いて区切るだけにする。枠の
 * 線と内側の余白のぶん本文の幅が削られ、注意書きの枠が入れ子になると
 * 1行が17字前後まで細った(390px の画面で本文幅 276px)。sm 以上は
 * 余白に余裕があるので、従来どおりカードにする。
 *
 * 最初の章は上に罫線を引かない(直前の目次や要点表と二重線になる)。
 * sm 以上では first: の打ち消しを sm:first: で戻してカードの枠に揃える。
 */
export default function GuideSectionCard({
  id,
  children,
}: {
  id?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 space-y-2 border-t border-gray-200 pt-6 first:border-t-0 first:pt-0 dark:border-neutral-800 sm:rounded-xl sm:border sm:border-gray-300 sm:bg-white sm:p-6 sm:shadow-sm sm:first:border-t sm:first:pt-6 dark:sm:border-neutral-700 dark:sm:bg-neutral-900"
    >
      {children}
    </section>
  );
}

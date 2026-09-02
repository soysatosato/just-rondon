import Link from "next/link";
import { TicketCheck } from "lucide-react";

/**
 * ロンドンパス対象の印。プランの各行と追加欄の候補で共用する。
 *
 * 行き先を選ぶ画面にこれが要るのは、パスが「対象施設をいくつ回るか」で
 * 損得の決まる商品だから。対象かどうかを詳細ページでしか確かめられないと、
 * 判断に必要な材料が旅程を組んでいる画面に無いことになる。
 *
 * リンク先を判定ページにしてあるのは詳細ページと同じ理由で、「対象」だけを
 * 出すと買う方向にしか押さないため。対象だと知った読者が次に要るのは
 * 損益分岐のほうなので、バッジ単体を出口にしない。
 *
 * 条件付き(londonPassNote あり)を無印の「対象」と同じ見た目にはしない。
 * 乗り降り自由バスのように会社が限られるものを無条件だと受け取られると、
 * 現地で使えないぶんを当てにしてパスを買うことになる。
 */
export default function LondonPassBadge({
  note,
  className = "",
}: {
  /** 条件付きのときの但し書き。無条件なら null。文面はここには出さない。 */
  note: string | null;
  className?: string;
}) {
  return (
    <Link
      href="/sightseeing/passes"
      className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 transition hover:border-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 ${className}`}
    >
      <TicketCheck className="h-3 w-3 shrink-0" aria-hidden />
      ロンドンパス対象
      {note && <span className="font-normal">（条件あり）</span>}
    </Link>
  );
}

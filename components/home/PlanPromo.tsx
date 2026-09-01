"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { usePlanCount } from "@/components/attractions/plan/plan-store";

/**
 * トップページの旅行プラン導線。
 *
 * この道具はサイトの中心に据えたいものだが、トップページに一切出て
 * いなかった。到達経路は観光ハブを4セクション下までスクロールして
 * 見つかるカード1枚だけで、大半の読者は存在に気づかないまま帰っていた。
 *
 * かつてはここに押せる名所のタイルを6枚並べ、その場でプランに入れて
 * もらう作りにしていた。狙いは「説明より触らせるほうが早い」だったが、
 * トップに写真のカードが並ぶ帯は他にもあり(ヒーロー・棚が5列)、
 * 3つ目の写真グリッドとしてしか見えていなかった。タイルはやめて、
 * 何ができるかを文章で言い切り、押す先は /plan の1本に絞っている。
 * 選んだ件数だけは引き継ぐので、途中まで組んだ人にはその数字が出る。
 */
export default function PlanPromo() {
  const count = usePlanCount();

  return (
    <div className="flex h-full flex-col rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-600 dark:text-indigo-400">
        Trip Planner
      </p>
      <h2 className="mt-3 text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
        行きたい場所を選ぶだけで、
        <br className="hidden sm:block" />
        旅程になる
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        掲載中の観光スポットから選ぶと、日別に並べて
        <strong className="font-semibold text-foreground">
          入場料の合計・滞在時間・スポット間の移動
        </strong>
        を出します。ロンドンの有料施設は£30前後が普通で、4ヶ所選べば
        £100を超えます。詰め込みすぎている日には警告が出るので、
        削る判断が現地ではなく出発前にできます。
      </p>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        ログインは要りません。順路は地図に出て、作ったプランはURL1本で
        同行者に送れます。
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3 pt-2 sm:mt-auto">
        <Link
          href="/plan"
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          {count > 0 ? `${count}ヶ所でプランを作る` : "旅行プランを作る"}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        {count > 0 && (
          <span className="text-xs text-muted-foreground">
            選んだぶんは保存されています
          </span>
        )}
      </div>
    </div>
  );
}

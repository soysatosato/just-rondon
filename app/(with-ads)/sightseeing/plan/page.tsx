export const revalidate = 60 * 60 * 24;

import Link from "next/link";

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import PlanBuilder from "@/components/attractions/plan/PlanBuilder";
import { fetchPlanSpots } from "@/utils/actions/attractions";
import { buildPageMetadata } from "@/lib/seo";

/**
 * 読者が自分で組む旅行プラン。
 *
 * /sightseeing/itinerary(編集部のモデルコース)と役割を分けている。
 * あちらは「どこへ行くか」を提案する読み物で、こちらは行き先を決めた人が
 * 「その組み合わせが1日に収まるか」を確かめる道具。記事を読んで決めた人が
 * 次にやることを引き受ける位置づけなので、両方から相互に導線を張っている。
 *
 * プランの中身はブラウザにしか無く、URL の ?spots= もクライアントで読む。
 * サーバーはどの読者にも同じHTMLを返すので、canonical は素直に
 * /sightseeing/plan 1本でよい(共有リンクで無限のURLが生えることはない)。
 */
const PAGE_TITLE = "ロンドン旅行プラン作成｜行きたい観光スポットを日別に組み立てる";
const PAGE_DESCRIPTION =
  "行きたいロンドンの観光スポットを選ぶだけで、日別の旅行プランに組み立てます。入場料の合計、滞在時間の目安、スポット間の徒歩距離を自動で計算し、1日に詰め込みすぎているときは警告します。近い順への並べ替え、Googleマップの順路、同行者に送れる共有リンクつき。";

export const metadata = buildPageMetadata({
  path: "/sightseeing/plan",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "ロンドン 旅行 プラン",
    "ロンドン 観光 プラン 作成",
    "ロンドン 旅程",
    "ロンドン 観光 ルート",
    "ロンドン 観光 予算",
    "ロンドン 何日",
  ],
});

export default async function PlanPage() {
  const spots = await fetchPlanSpots();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <div className="mb-6">
        <Breadcrumbs path="/sightseeing/plan" />
      </div>

      <header className="mb-8 space-y-4">
        <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          Trip Planner
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ロンドンの旅行プランを作る
        </h1>
        <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            行きたいスポットを選ぶと、日別に並べて
            <strong className="font-semibold text-foreground">
              入場料の合計・滞在時間・スポット間の移動
            </strong>
            を出します。掲載中の{spots.length}件から選べます。
            ロンドンは有料施設が£30を超えるのが普通で、しかも中心部は
            見どころが密集しているぶん詰め込みすぎになりやすい街です。
            合計が先に見えていれば、削る判断が現地ではなく出発前にできます。
          </p>
          <p>
            スポット間は、徒歩圏なら実際の道のりに近い徒歩分数を、
            離れていれば地下鉄・バスでの移動として一律の目安を置いています。
            乗換回数までは分からないので、
            <strong className="font-semibold text-foreground">
              正確な所要時間は現地の乗換案内で確かめてください
            </strong>
            。ここで出しているのは「1日に収まるかどうか」を判断するための概算です。
          </p>
          <p>
            どこへ行くか自体を決めかねているなら、先に
            <Link
              href="/sightseeing/itinerary"
              className="underline underline-offset-2 hover:text-foreground"
            >
              1日〜5日のモデルコース
            </Link>
            か
            <Link
              href="/sightseeing/areas"
              className="underline underline-offset-2 hover:text-foreground"
            >
              エリアガイド
            </Link>
            を読んでから戻ってくると早いです。作ったプランは、このブラウザに
            保存されます。
          </p>
        </div>
      </header>

      <PlanBuilder spots={spots} />
    </main>
  );
}

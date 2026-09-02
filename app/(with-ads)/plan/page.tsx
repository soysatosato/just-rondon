export const revalidate = 60 * 60 * 24;

import Link from "next/link";
import {
  CalendarRange,
  Clock,
  Map as MapIcon,
  Route,
  Share2,
  Wallet,
} from "lucide-react";

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import PlanBuilder from "@/components/attractions/plan/PlanBuilder";
import { fetchPlanSpots } from "@/utils/actions/attractions";
import { buildPageMetadata } from "@/lib/seo";

/**
 * 読者が自分で組む旅行プラン。サイトの中心に置いている道具。
 *
 * /sightseeing/itinerary(編集部のモデルコース)と役割を分けている。
 * あちらは「どこへ行くか」を提案する読み物で、こちらは行き先を決めた人が
 * 「その組み合わせが1日に収まるか」を確かめる道具。記事を読んで決めた人が
 * 次にやることを引き受ける位置づけなので、両方から相互に導線を張っている。
 *
 * 説明を先に3段落置いていたのをやめた。道具のページで最初に出るべきは
 * 道具そのもので、読まなければ始められない説明ではない。
 *
 * 「何ができるか」の4枚も、同じ理由で本体の下へ落とした。上に置いていた
 * ときは、プランを持っている再訪者が自分の旅程に辿り着くまでに毎回
 * 1画面ぶんの案内をまたいでいた。この4枚が要るのは初回だけで、
 * そのために毎回の到達を遅くする配分になっていた。読み物としては
 * 残す価値があるので、消さずに前提と限界の手前に置いている。
 *
 * 本文の幅だけ他のページより広く取ってある。広い画面では日割りの右に
 * 地図を貼りつけたままにしており、読み物の幅(max-w-4xl)では地図が
 * 日割りを潰す。下の説明のほうは読み物なので、そちらだけ幅を戻している。
 *
 * プランの中身はブラウザにしか無く、URL の ?spots= もクライアントで読む。
 * サーバーはどの読者にも同じHTMLを返すので、canonical は素直に
 * /plan 1本でよい(共有リンクで無限のURLが生えることはない)。
 */
const PAGE_TITLE = "ロンドン旅行プラン作成｜行きたい観光スポットを日別に組み立てる";
const PAGE_DESCRIPTION =
  "行きたいロンドンの観光スポットを選ぶだけで、日別の旅行プランに組み立てます。入場料の合計、滞在時間の目安、スポット間の徒歩距離を自動で計算し、1日に詰め込みすぎているときは警告します。順路の地図、近い順への並べ替え、Googleマップの経路、同行者に送れる共有リンクつき。";

export const metadata = buildPageMetadata({
  path: "/plan",
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

/** 「何ができるか」。説明文の代わりに、道具の出力そのものを名指しする。 */
const CAPABILITIES = [
  {
    icon: Wallet,
    title: "入場料が先に出る",
    body: "有料施設が£30を超えるのは普通で、4ヶ所選べば£100を超えます。合計が先に見えていれば、削る判断が現地ではなく出発前にできます。",
  },
  {
    icon: Clock,
    title: "何時に着くかが出る",
    body: "宿を出る時刻を決めると、滞在と移動を積んで各スポットの到着時刻を出します。閉館に間に合うか、夜の予定に間に合うかは、合計の長さではなく時刻でしか分かりません。",
  },
  {
    icon: Route,
    title: "1日に収まるか判定する",
    body: "滞在と移動を足して9時間を超えた日、滞在2時間以上の施設が3ヶ所以上入った日には警告を出します。基準はモデルコース記事と同じです。",
  },
  {
    icon: MapIcon,
    title: "全日程が1枚の地図に出る",
    body: "日ごとに色を分けて重ねるので、同じ道の往復も、別々の日に同じ地区へ2回行っていることも一目で分かります。近い順への並べ替えとGoogleマップの経路つき。",
  },
  {
    icon: Share2,
    title: "同行者に送れる",
    body: "作ったプランはURL1本になります。ログインは要りません。出発日を入れると各日に曜日が付き、印刷すれば現地で紙のまま使えます。",
  },
] as const;

export default async function PlanPage() {
  const spots = await fetchPlanSpots();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <div className="mb-6 print:hidden">
        <Breadcrumbs path="/plan" />
      </div>

      <header className="mb-8 print:mb-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white print:hidden">
          <CalendarRange className="h-3 w-3" aria-hidden />
          Trip Planner
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          ロンドンの旅行プランを作る
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground print:hidden">
          掲載中の{spots.length}件から行きたいスポットを選ぶと、日別に並べて
          <strong className="font-semibold text-foreground">
            何時に着いて何時に終わるか・入場料の合計・スポット間の移動
          </strong>
          を出します。ロンドンは中心部に見どころが密集しているぶん、
          詰め込みすぎになりやすい街です。
        </p>
      </header>

      <PlanBuilder spots={spots} />

      <section className="mt-12 max-w-3xl print:hidden">
        <h2 className="text-base font-bold tracking-tight">
          この道具でできること
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {CAPABILITIES.map((item) => (
            <li
              key={item.title}
              className="flex gap-3 rounded-xl border border-border bg-card p-4"
            >
              <item.icon
                className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400"
                aria-hidden
              />
              <div className="min-w-0">
                <p className="text-sm font-bold leading-snug">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/*
        前提と限界。本体の下に置く。読まなくても道具は動くが、
        移動時間をどう出しているかは書いておかないと、直線距離からの
        概算を乗換案内の代わりに使われる。
      */}
      <section className="mt-6 max-w-3xl space-y-3 rounded-2xl border border-border bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground print:hidden">
        <h2 className="text-base font-bold tracking-tight text-foreground">
          この数字の作り方
        </h2>
        <p>
          スポット間は、徒歩圏なら実際の道のりに近い徒歩分数を、離れていれば
          地下鉄・バスでの移動として一律の目安を置いています。直線距離からは
          乗換回数も待ち時間も出せないので、区間ごとに違う数字を出すと
          精度があるように見えてしまうためです。
          <strong className="font-semibold text-foreground">
            正確な所要時間は現地の乗換案内で確かめてください
          </strong>
          。ここで出しているのは「1日に収まるかどうか」を判断するための概算です。
        </p>
        <p>
          各スポットの到着時刻は、その日に宿を出る時刻から滞在と移動を順に
          足しただけのものです。食事も休憩も行列も入っていないので、実際は
          常にこれより遅くなります。滞在時間の分からないスポットを挟んだ日は、
          そこから先の時刻に「〜」を付けています。
        </p>
        <p>
          料金と滞在時間は各スポットの掲載値をそのまま合計しています。値の無い
          スポットは合計に入らないので、実際はここに出る額より増えます。
          曜日で閉まるスポットの警告は、開館時間の記載が曜日に触れているものだけが
          対象です。警告が出ないことは開いている保証ではありません。
        </p>
        <p>
          作ったプランはこのブラウザに保存されます。アカウントは要りません。
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
          を読んでから戻ってくると早いです。
        </p>
      </section>
    </main>
  );
}

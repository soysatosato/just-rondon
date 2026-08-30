export const revalidate = 60 * 60;

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import AttractionBrowser from "@/components/attractions/AttractionBrowser";
import { fetchAllAttractions } from "@/utils/actions/attractions";
import { AD_SLOTS } from "@/lib/adsense";
import { buildPageMetadata } from "@/lib/seo";

/**
 * 以前はこのページが page / sort / rec / mustSee / kids / free / category の
 * 7パラメータを受け、組み合わせを noindex にして canonical を寄せていた。
 * 絞り込みをクライアント側に移したのでURLは1本になり、noindex の出し分けも
 * ページ送りも要らなくなった。既存の ?page=2 等は同じ内容を返し、
 * canonical が /sightseeing/all を指すのでそこに寄る。
 */
const PAGE_TITLE = "ロンドンの観光スポット一覧 | 料金・所要時間・エリアで探す";
const PAGE_DESCRIPTION =
  "ロンドンの観光スポットを、歴史・王室・美術館・エンタメ・庭園・建築・ツアー・買い物・季節限定に分けて一覧掲載。大人料金、滞在時間の目安、最寄り駅を各スポットに表示し、無料のもの、子ども向き、1時間以内で回れるものといった条件で絞り込めます。";

export const metadata = buildPageMetadata({
  path: "/sightseeing/all",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "ロンドン 観光 スポット 一覧",
    "ロンドン 観光 施設",
    "ロンドン 観光 無料",
    "ロンドン 観光 所要時間",
    "ロンドン 観光 料金",
    "ロンドン 子連れ 観光",
  ],
});

export default async function AllAttractionsPage() {
  const attractions = await fetchAllAttractions();

  // 導入文で使う概況。件数を本文に直書きすると、スポットが増減したとき
  // 黙って古くなる。
  const freeCount = attractions.filter((a) => a.isFree).length;
  const kidsCount = attractions.filter((a) => a.isForKids).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <div className="mb-6">
        <Breadcrumbs path="/sightseeing/all" />
      </div>

      <header className="mb-8 space-y-4">
        <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          All Spots
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ロンドンの観光スポット 全{attractions.length}件
        </h1>
        <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            掲載している観光スポットをすべて並べています。うち{freeCount}件は無料、
            {kidsCount}件は子ども連れでも持ちこたえられる場所です。
            ロンドンは有料の施設が高い街で、£30を超えるものが珍しくない一方、
            公園も主要な博物館も無料で開いています。その両方が同じ一覧に並んでいます。
          </p>
          <p>
            {attractions.length}件を名前だけ並べても選べないので、
            <strong className="font-semibold text-foreground">種類</strong>
            で章に分けました。歴史・王室・美術館・エンタメ・庭園・建築・ツアー・買い物・季節限定の順です。
            気になる区分の見出しから読み進めてください。
          </p>
          <p>
            行き先の見当がついているなら、絞り込みが早いです。
            大人料金、滞在時間の目安、最寄り駅は各カードに出しているので、
            「1時間以内」「£20以下」「無料」といった条件と、
            エリアガイドの街区で絞り込めます。
          </p>
        </div>
      </header>

      <div className="mb-8 flex justify-center">
        <AdSenseUnit slot={AD_SLOTS.listing} reservedHeight={120} />
      </div>

      <AttractionBrowser attractions={attractions} />
    </main>
  );
}

export const revalidate = 60 * 60;

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import MuseumBrowser from "@/components/museums/MuseumBrowser";
import {
  museumsCollectionJsonLd,
} from "@/components/museums/jsonld";
import { fetchAllMuseums } from "@/utils/actions/museums";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { AD_SLOTS } from "@/lib/adsense";

// 館数は本文側で DB から数える。title/description は静的なので、
// ここに件数を書くと館が増減したときに黙って古くなる。
const PAGE_TITLE =
  "ロンドンの美術館・博物館 一覧 | ジャンル・所要時間・エリアで探す";
const PAGE_DESCRIPTION =
  "ロンドンの美術館・博物館を、絵画・世界史・自然科学・デザイン・作家の家・乗り物・戦争・変わり種の8ジャンルに分けて掲載。1時間で回れる館、無料の館、子ども向きの館、サウス・ケンジントンやグリニッジなど街区での絞り込みに対応。恐竜やゴッホといった展示内容からも検索できます。";

export const metadata = buildPageMetadata({
  path: "/museums/all-museums",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "ロンドン 美術館 一覧",
    "ロンドン 博物館 一覧",
    "ロンドン 美術館 無料",
    "ロンドン 美術館 地図",
    "ロンドン 博物館 おすすめ",
    "ロンドン 美術館 所要時間",
    "ロンドン 小さい 博物館",
    "サウスケンジントン 博物館",
  ],
});

export default async function AllMuseumsPage() {
  const museums = await fetchAllMuseums();

  // 導入文で使う概況。件数はDBが増えれば動くので、本文に数字を直書きしない。
  const freeCount = museums.filter((m) => m.price === 0).length;
  const shortCount = museums.filter(
    (m) => (m.museumInfo?.recommendedDuration ?? 999) <= 60,
  ).length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <JsonLd
        data={breadcrumbListJsonLd({
          path: "/museums",
          current: "美術館一覧",
          currentHref: "/museums/all-museums",
        })}
      />
      <JsonLd
        data={museumsCollectionJsonLd({
          path: "/museums/all-museums",
          name: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          museums,
        })}
      />

      <div className="mb-6">
        <Breadcrumbs path="/museums" current="美術館一覧" />
      </div>

      <header className="mb-8 space-y-4">
        <span className="inline-block rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
          All Museums
        </span>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          ロンドンの美術館・博物館 全{museums.length}館
        </h1>
        <div className="max-w-3xl space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            この街の主要館は常設展が無料で、予約も要りません。だから
            「せっかく入場料を払ったから全部見なければ」という気負いなく、
            30分だけ立ち寄って出てくる、という使い方ができます。
            {freeCount}館が無料、{shortCount}館は1時間あれば回りきれる規模です。
          </p>
          <p>
            とはいえ{museums.length}館を名前だけ並べられても選べないので、
            <strong className="font-semibold text-foreground">
              何が置いてあるか
            </strong>
            で8つに分けました。絵画、世界史と考古学、自然と科学、デザインと工芸、
            誰かが住んでいた家、乗り物と産業、戦争、そして一点突破の変わり種です。
            気になる区分の見出しから読み進めてください。
          </p>
          <p>
            行き先がもう決まっているなら、上の検索と絞り込みが早いです。
            検索は館名だけでなく展示内容にも当たるので、「恐竜」「ゴッホ」
            「マグナカルタ」のように見たいものの名前で引けます。滞在時間、街区、
            無料かどうか、子ども連れ向きかでも絞れます。
          </p>
        </div>
      </header>

      <MuseumBrowser museums={museums} />

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}

import LoadingCards from "@/components/card/LoadingCards";
import { buildPageMetadata } from "@/lib/seo";
import MusicalHomePage from "@/components/musicals/MusicalHomePage";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import {
  fetchMusicalRankings,
  fetchMusicalsForBrowse,
} from "@/utils/actions/musicals";
import { collectionPageJsonLd } from "@/components/musicals/jsonld";
import { redirect } from "next/navigation";
import { Suspense } from "react";

// 公演中の作品とランキングは DB 側で動く。
export const revalidate = 60 * 60;

/*
  タイトルは検索語の「ロンドン ミュージカル」を先頭に置く。以前の
  「ロンドン観光・ミュージカル・劇場・シアターガイド」は語が並んでいる
  だけで、2026-07-28〜10-25 の Search Console では「ロンドン ミュージカル」
  43位・「イギリス ミュージカル」63位、91表示でクリック0だった。
  description はこのページで実際にできること(条件で絞る・上演時間・
  英語の比重・劇場)を書く。
*/
export const metadata = buildPageMetadata({
  path: "/musicals",
  title: "ロンドンのミュージカル｜おすすめ作品・チケット・劇場ガイド",
  titleSuffix: false,
  description:
    "ロンドン・ウエストエンドで上演中のミュージカルを、英語が不安・子どもと行く・時間が限られているといった条件から選べるガイド。作品ごとのあらすじ、上演時間、歌と台詞の比重、劇場と最寄り駅、チケットの取り方までまとめています。",
});
export default async function HomePage() {
  const [musicals, ranking] = await Promise.all([
    fetchMusicalsForBrowse(),
    fetchMusicalRankings(),
  ]);
  if (musicals.length === 0) redirect("/");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd(musicals)),
        }}
      />
      <JsonLd data={breadcrumbListJsonLd({ path: "/musicals" })} />

      <div className="mx-auto max-w-6xl px-4 pt-4">
        <Breadcrumbs path="/musicals" />
      </div>

      <section>
        <Suspense fallback={<LoadingCards />}>
          <MusicalHomePage musicals={musicals} ranking={ranking} />
        </Suspense>
      </section>
    </>
  );
}

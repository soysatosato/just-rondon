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
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata = buildPageMetadata({
  path: "/musicals",
  title: "ロンドン観光・ミュージカル・劇場・シアターガイド | ジャスト・ロンドン",
  titleSuffix: false,
  description: "初めてのロンドン観光でも安心！主要ミュージカルの見どころや必見作品、あらすじやストーリー、便利なアクセス方法をわかりやすく紹介する、観光客向けガイドサイトです。",
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

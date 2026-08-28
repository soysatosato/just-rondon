export const revalidate = 60 * 60;

import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import MuseumsHub from "@/components/museums/MuseumsHub";
import {
  museumsCollectionJsonLd,
  museumsFaqJsonLd,
} from "@/components/museums/jsonld";
import { museumsFaqItems } from "@/components/museums/faq";
import { fetchMuseumsHubData } from "@/utils/actions/museums";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import { AD_SLOTS } from "@/lib/adsense";

const PAGE_TITLE =
  "ロンドンの美術館・博物館ガイド | 無料の常設展・見どころ・回り方";
const PAGE_DESCRIPTION =
  "大英博物館、ナショナル・ギャラリー、テート・モダン、V&A、自然史博物館。ロンドンの主要館は常設展が無料で予約も不要です。目的別のおすすめ、混雑を避ける時間帯、荷物や撮影のルール、1日の回り方まで日本語でまとめたロンドン美術館ガイド。";

export const metadata = buildPageMetadata({
  path: "/museums",
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "ロンドン 美術館",
    "ロンドン 博物館",
    "大英博物館",
    "ナショナル・ギャラリー",
    "テート・モダン",
    "ロンドン 美術館 無料",
    "ロンドン 美術館 おすすめ",
    "V&A",
    "自然史博物館",
    "ロンドン 観光",
  ],
});

export default async function MuseumsHubPage() {
  const { topMuseums, totalCount, freeCount, kidsCount } =
    await fetchMuseumsHubData();

  return (
    <>
      <JsonLd data={breadcrumbListJsonLd({ path: "/museums" })} />
      <JsonLd
        data={museumsCollectionJsonLd({
          path: "/museums",
          name: PAGE_TITLE,
          description: PAGE_DESCRIPTION,
          museums: topMuseums,
        })}
      />
      <JsonLd data={museumsFaqJsonLd(museumsFaqItems, "/museums")} />

      <div className="mx-auto max-w-6xl px-4 pt-4">
        <Breadcrumbs path="/museums" />
      </div>

      <MuseumsHub
        topMuseums={topMuseums}
        totalCount={totalCount}
        freeCount={freeCount}
        kidsCount={kidsCount}
      />

      <div className="mx-auto max-w-6xl px-4 pb-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </>
  );
}

export const revalidate = 60 * 60;

import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import MuseumBrowser from "@/components/museums/MuseumBrowser";
import {
  museumsCollectionJsonLd,
  museumsHubBreadcrumbJsonLd,
} from "@/components/museums/jsonld";
import { fetchAllMuseums } from "@/utils/actions/museums";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";

const PAGE_TITLE = "ロンドンの美術館・博物館 一覧 | 無料・子ども向けで絞り込む";
const PAGE_DESCRIPTION =
  "ロンドンの美術館・博物館を一覧で掲載。常設展が無料の館、子ども連れで楽しめる館、おすすめ度の高い館で絞り込めます。館名やエリアからの検索、地図表示にも対応。";

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
  ],
});

export default async function AllMuseumsPage() {
  const museums = await fetchAllMuseums();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <JsonLd
        data={museumsHubBreadcrumbJsonLd({
          name: "美術館一覧",
          path: "/museums/all-museums",
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
          ロンドンの美術館・博物館 一覧
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          掲載している全{museums.length}館です。
          この街の主要館は常設展が無料なので、
          「せっかく入場料を払ったから全部見なければ」という気負いなく、
          30分だけ立ち寄るような使い方ができます。
          無料かどうか、子ども連れ向きか、おすすめ度で絞り込んでください。
        </p>
      </header>

      <MuseumBrowser museums={museums} />

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}

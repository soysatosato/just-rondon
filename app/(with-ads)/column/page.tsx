export const revalidate = 60 * 60;

import { fetchColumns } from "@/utils/actions/contents";
import { buildPageMetadata } from "@/lib/seo";
import JsonLd from "@/components/seo/JsonLd";
import {
  columnHubBreadcrumbJsonLd,
  columnHubCollectionJsonLd,
} from "@/components/column/jsonld";
import ColumnCard from "@/components/column/ColumnCard";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";

export const metadata = buildPageMetadata({
  path: "/column",
  title: "コラム | イギリスの歴史・文化・伝統を深掘りする読み物",
  description:
    "イギリスの歴史・文化・伝統・制度にまつわるコラムを毎日更新でお届けします。旅行ガイドだけでは伝えきれない、イギリスの奥深さをじっくり読み解く読み物です。",
  keywords: [
    "イギリス コラム",
    "イギリス 歴史",
    "イギリス 文化",
    "イギリス 豆知識",
    "ロンドン コラム",
  ],
});

export default async function ColumnHubPage() {
  const columns = await fetchColumns();

  return (
    <main className="max-w-5xl mx-auto py-8 px-4 md:py-10">
      <JsonLd data={columnHubBreadcrumbJsonLd()} />
      <JsonLd data={columnHubCollectionJsonLd(columns)} />

      <header className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-snug mb-4">
          コラム
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          イギリスの歴史・文化・伝統・制度にまつわる読み物コラムです。
          <br />
          旅行ガイドだけでは伝えきれない、イギリスの奥深さをじっくり読み解きます。
        </p>
      </header>

      {columns.length === 0 ? (
        <p className="text-muted-foreground">近日公開予定です。</p>
      ) : (
        <section className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 max-w-full">
          {columns.map((item) => (
            <ColumnCard key={item.id} item={item} />
          ))}
        </section>
      )}

      <div className="mt-10">
        <AdSenseUnit slot={AD_SLOTS.listing} />
      </div>
    </main>
  );
}

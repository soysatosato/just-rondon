import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Pagination from "@/components/home/Pagination";
import { fetchAllAttractions } from "@/utils/actions/attractions";
import AttractionFilterBar from "@/components/attractions/AttractionFilterBar";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import { AD_SLOTS } from "@/lib/adsense";
import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

// フィルター UI（前回提供したやつ）

/**
 * このページは page / sort / rec / mustSee / kids / free / category の
 * 7パラメータで組み合わせ爆発する。フィルター付きは noindex にして
 * クリーンURLへ canonical を寄せ、クロール予算を実ページに回す。
 *
 * robots.txt でブロックしてはいけない。クロールできないと noindex も読めず
 * 「robots.txt によりブロックされましたがインデックスに登録されました」になる。
 */
export async function generateMetadata({
  searchParams,
}: {
  searchParams: {
    page?: string;
    sort?: string;
    rec?: string;
    mustSee?: string;
    kids?: string;
    free?: string;
    category?: string;
  };
}): Promise<Metadata> {
  const page = Number(searchParams.page) || 1;
  const hasFilter = Boolean(
    searchParams.sort ||
      searchParams.rec ||
      searchParams.mustSee ||
      searchParams.kids ||
      searchParams.free ||
      searchParams.category,
  );

  return buildPageMetadata({
    path:
      !hasFilter && page > 1
        ? `/sightseeing/all?page=${page}`
        : "/sightseeing/all",
    title:
      page > 1 && !hasFilter
        ? `ロンドン観光施設一覧（${page}ページ目）`
        : "ロンドン観光施設一覧",
    description:
      "ロンドンの観光施設を一覧で紹介。話題のスポットから歴史ある名所まで、まとめてチェックできます。",
    noindex: hasFilter,
  });
}

export default async function FacilitiesListPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
    sort?: string;
    rec?: string;
    mustSee?: string;
    kids?: string;
    free?: string;
    category?: string;
  };
}) {
  const currentPage = Number(searchParams.page) || 1;
  const itemsPerPage = 10;

  const { page, ...restParams } = searchParams;
  // QueryString → フィルター条件に変換
  const filters = {
    sort: searchParams.sort || null,
    rec: searchParams.rec ? Number(searchParams.rec) : null,
    mustSee: searchParams.mustSee === "true",
    kids: searchParams.kids === "true",
    free: searchParams.free === "true",
    categories: searchParams.category ? searchParams.category.split(",") : [],
  };

  // データ取得（フィルタ条件を渡す）
  const { facilities, totalCount } = await fetchAllAttractions({
    page: currentPage,
    limit: itemsPerPage,
    filters,
  });

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Breadcrumbs path="/sightseeing/all" className="mb-6" />

      <h1 className="text-2xl font-bold mb-4">ロンドン観光施設一覧</h1>
      <p className="text-base text-muted-foreground mb-2">
        ロンドンには、急いで巡らなくても楽しめる場所がたくさんあります。
        この観光施設一覧は、その“たくさん”をひとまず俯瞰できるようにまとめたものです。
        歴史ある名所もあれば、何気ないけれど妙に記憶に残るスポットも並んでいます。
      </p>
      <p className="text-base text-muted-foreground mb-8">
        リストを眺めながら、気になったものがあれば軽い気持ちで詳細ページを見てみてください。
        意外な発見があったり、旅のルートが自然と形になったりするかもしれません。
        見過ごしたつもりでも、つい思い返してしまう。それくらいロンドンは、印象の残りやすい街です。
      </p>

      {/* 追加：フィルターバー */}
      <AttractionFilterBar />
      <div className="mt-4 justify-center flex">
        <AdSenseUnit slot={AD_SLOTS.listing} reservedHeight={120} />
      </div>
      <div className="grid gap-8">
        {facilities.map((f) => (
          <Card key={f.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base flex flex-wrap items-center gap-1">
                <span className="whitespace-nowrap">{f.name}</span>
                <Badge
                  variant="secondary"
                  className="whitespace-nowrap flex-none"
                >
                  {f.engName}
                </Badge>
              </CardTitle>
              <CardDescription className="text-sm italic">
                {f.tagline}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <AspectRatio
                ratio={16 / 9}
                className="rounded-md overflow-hidden"
              >
                <img
                  src={f.image}
                  alt={f.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                />
              </AspectRatio>

              {f.summary && (
                <p className="mt-4 text-gray-700 dark:text-neutral-300">
                  {f.summary}
                </p>
              )}

              <div className="mt-4">
                <Link
                  href={`/sightseeing/${f.slug}`}
                  className="inline-block px-3 py-1 border rounded border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 transition"
                >
                  詳細を見る
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={totalCount}
        itemsPerPage={itemsPerPage}
        baseUrl="/sightseeing/all"
        query={restParams}
      />
    </div>
  );
}

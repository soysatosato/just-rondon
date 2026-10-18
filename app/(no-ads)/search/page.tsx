import { Suspense } from "react";
import { noindexMetadata } from "@/lib/seo";
import SearchPageResults from "@/components/search/SearchPageResults";

/**
 * サイト内検索の結果ページ。
 *
 * 検索結果のページは検索エンジンに載せない(noindex)。中身が問い合わせごとに
 * 変わり、同じ内容のページを無数に作ることになるため。広告も置かない
 * ((no-ads) 配下)。
 *
 * ページ自体は静的に描き、?q= はブラウザ側で読む(SearchPageResults)。
 */
export const metadata = noindexMetadata("サイト内検索");

export default function SearchPage() {
  return (
    <main className="mx-auto max-w-3xl px-1 py-8 sm:px-4 md:py-12">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        サイト内検索
      </h1>
      <Suspense
        fallback={<p className="mt-6 text-sm text-muted-foreground">読み込んでいます…</p>}
      >
        <SearchPageResults />
      </Suspense>
    </main>
  );
}

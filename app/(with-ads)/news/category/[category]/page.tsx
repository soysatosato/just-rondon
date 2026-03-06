import Pagination from "@/components/home/Pagination";
import { fetchNewsByCategory } from "@/utils/actions/news";
import Link from "next/link";

interface Props {
  params: { category: string };
  searchParams?: { page?: string };
}

export const metadata = {
  title: "ロンドンニュース | 最新情報をまとめてチェック | ジャスト・ロンドン",
  description:
    "ロンドンの最新ニュースやイベント情報、日常生活に役立つ話題のトピックをまとめてお届けします。",
  keywords: ["ロンドン", "ニュース", "最新情報", "イベント", "観光", "話題"],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/news",
  },
  openGraph: {
    title: "ロンドンニュース | 最新情報をまとめてチェック",
    description:
      "ロンドンの最新ニュースやイベント情報、話題のトピックをまとめてお届けします。",
    url: "https://www.just-rondon.com/news",
    siteName: "ジャスト・ロンドン | ニュース",
    locale: "ja_JP",
    type: "website",
  },
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const categoryName = decodeURIComponent(params.category);
  const currentPage = Number(searchParams?.page ?? 1);
  const itemsPerPage = 10;

  const { news, total } = await fetchNewsByCategory({
    category: categoryName,
    page: currentPage,
    limit: itemsPerPage,
  });

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* ページタイトル & SEO用前文 */}
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          {categoryName}
          <br />
          ニュース
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg max-w-3xl mx-auto text-left">
          {categoryName}に関する最新ニュースや話題をまとめてお届けします。
          <br />
          ロンドンやイギリス国内の動向、注目の出来事、イベントを網羅的にチェックできるカテゴリページです。
        </p>
      </header>

      {/* ニュースリスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map((n) => (
          <article
            key={n.id}
            className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors duration-200">
              <Link href={`/news/${n.id}`}>{n.title}</Link>
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
              {n.summary}
            </p>
            <time
              className="text-xs text-gray-400 mt-3 block"
              dateTime={n.createdAt.toISOString()}
            >
              {n.createdAt.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </article>
        ))}
      </div>

      {/* ページネーション */}
      <div className="flex justify-center my-8">
        <Pagination
          currentPage={currentPage}
          totalItems={total}
          itemsPerPage={itemsPerPage}
          baseUrl={`/news/category/${encodeURIComponent(categoryName)}`}
        />
      </div>
    </main>
  );
}

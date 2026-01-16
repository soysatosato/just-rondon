import { fetchLatestNewsByCategory } from "@/utils/actions/news";
import Link from "next/link";

export const metadata = {
  title:
    "ロンドン観光スポット一覧 | 人気名所・おすすめ体験をまとめてチェック | ジャスト・ロンドン",
  description:
    "ロンドンの人気観光スポットやおすすめ体験、家族向けの無料スポット、季節のイベントまで、旅行に役立つ情報をわかりやすくまとめて紹介します。",
  keywords: [
    "ロンドン",
    "観光",
    "観光名所",
    "おすすめスポット",
    "ロンドン旅行",
    "観光地一覧",
    "ロンドン観光ガイド",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/sightseeing",
  },
  openGraph: {
    title: "ロンドン観光スポット一覧 | 人気名所・おすすめ体験をチェック",
    description:
      "ロンドン観光に欠かせない定番スポットから無料で楽しめる体験、季節のイベントまで、旅行前に知っておきたい情報を総まとめ。",
    url: "https://www.just-rondon.com/sightseeing",
    siteName: "ジャスト・ロンドン | 観光スポット",
    locale: "ja_JP",
    type: "website",
  },
};

const CATEGORIES = [
  "政治・経済・社会",
  "ライフスタイル",
  "文化・エンタメ",
] as const;

export default async function NewsPage({}) {
  const newsByCategory = await fetchLatestNewsByCategory();

  return (
    <main className="max-w-6xl mx-auto px-4 py-12 space-y-12">
      {/* ページタイトル */}
      <header className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">
          ロンドンニュース
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg">
          ロンドンの最新ニュースや話題をカテゴリごとにまとめてお届けします。
        </p>
      </header>

      {/* カテゴリごとのニュース */}
      {CATEGORIES.map((category) => (
        <section key={category} className="space-y-6">
          <h2 className="text-2xl font-bold mb-4 border-l-4 border-blue-500 pl-3">
            {category}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {newsByCategory[category]?.map((n) => (
              <article
                key={n.id}
                className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow hover:shadow-lg transition-shadow duration-300"
              >
                <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 transition-colors duration-200">
                  <Link href={`/news/${n.id}`}>{n.title}</Link>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-3">
                  {n.summary}
                </p>
                <time
                  className="text-xs text-gray-400 mt-3 block"
                  dateTime={n.createdAt}
                >
                  {new Date(n.createdAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </article>
            ))}
          </div>

          {/* もっと見るボタン */}
          <div className="mt-4 text-center">
            <Link
              href={`/news/category/${encodeURIComponent(category)}`}
              className="inline-block px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200"
            >
              もっと見る
            </Link>
          </div>
        </section>
      ))}
    </main>
  );
}

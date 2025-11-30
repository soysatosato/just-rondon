import ReactMarkdown from "react-markdown";
import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchHPActivities } from "@/utils/actions/contents";

export const metadata = {
  title:
    "ハリー・ポッター聖地巡礼 in ロンドン | ロケ地・モデル地・スタジオツアー完全ガイド | ロンドん！",
  description:
    "ロンドンで巡るハリー・ポッターの聖地特集。キングスクロス駅9¾番線、レドンホール・マーケット、ミレニアム橋、ロンドン動物園、レイコック村など映画ロケ地を徹底紹介。スタジオツアー（WB Studio Tour London）への行き方も掲載。",
  keywords: [
    "ハリー・ポッター",
    "Harry Potter",
    "ハリポタ 聖地巡礼",
    "ロンドン ハリーポッター",
    "ロケ地",
    "スタジオツアー",
    "9¾番線",
    "映画ロケ地",
    "ワーナーブラザーズスタジオツアー",
    "キングスクロス駅",
    "レドンホールマーケット",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/sightseeing/harry-potter",
  },
  openGraph: {
    title:
      "ハリー・ポッター聖地巡礼ガイド | ロンドンで訪れたいロケ地 & 名所一覧",
    description:
      "ロンドンで楽しむハリー・ポッターの世界。映画ロケ地、ゆかりある建物、スタジオツアー、魔法ワールドを感じられる場所をまとめた完全ガイド。",
    url: "https://www.just-rondon.com/sightseeing/harry-potter",
    siteName: "ロンドん！ | ハリー・ポッター特集",
    locale: "ja_JP",
    type: "website",
  },
};

export default async function HarryPotterPage() {
  const contents = await fetchHPActivities();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div>
        <h2 className="text-lg italic font-semibold text-center text-purple-700 dark:text-purple-300 mt-2">
          Harry Potter Spots in London
        </h2>
        <h1 className="text-2xl font-bold text-center">
          ロンドンで巡るハリー・ポッタースポット
        </h1>
      </div>
      <div>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
          ロンドンは、魔法界の外側にあっても不思議がそこかしこに染み込んでいる街です。重層的な歴史、曲がりくねった街路、居心地のいいパブ、そして古い建物が織りなす空気だけでも魅力的ですが、この街には愛され続ける『ハリー・ポッター』の世界と結びついた場所が数多くあります。
        </p>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
          映画のロケ地、没入型のスタジオツアー、遊び心あふれるショップ、テーマ性のあるホテルまで、ファンが魔法の世界に一歩踏み込めるスポットがぎっしりと詰まっています。
        </p>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-10">
          このガイドでは、ロンドンに点在する必見のハリー・ポッターゆかりの場所を紹介します。本や映画、そして舞台が残した魔法の痕跡をたどりながら、街の中に潜む“魔法の片鱗”を探しにいきましょう。
        </p>
      </div>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          目次
        </h2>

        <ul className="list-none space-y-3 border-l border-gray-300 dark:border-gray-700 pl-3">
          {contents.map((item: any, idx: number) => (
            <li key={item.id} className="leading-tight relative pl-6">
              <span
                className="
            absolute left-0 text-gray-500 dark:text-gray-400 text-sm
          "
              >
                {idx + 1}.
              </span>

              <a
                href={`#${item.slug}`}
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:underline text-sm font-medium"
              >
                {item.title}
              </a>

              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                {item.summary}
              </p>
            </li>
          ))}
        </ul>
      </section>
      {contents.map((item) => {
        const isLinkable = item.slug && item.slug !== "-";
        const cardInner = (
          <Card
            key={item.id}
            className="p-4 shadow-md rounded-xl hover:shadow-lg transition"
          >
            <CardHeader>
              <CardTitle className="text-2xl">{item.title}</CardTitle>

              {item.image && (
                <div className="relative w-full h-64 mt-4 rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </CardHeader>

            <CardContent>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <ReactMarkdown>{item.mainText}</ReactMarkdown>
              </div>

              {item.sections?.length > 0 && (
                <div className="mt-6 space-y-6">
                  {item.sections
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((sec) => (
                      <div
                        key={sec.id}
                        className="border-l-4 pl-4 border-purple-600"
                      >
                        <h3 className="text-xl font-semibold">{sec.title}</h3>
                        {sec.description && (
                          <p className="text-gray-600 mt-2 whitespace-pre-line">
                            {sec.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              )}

              {item.website && (
                <a
                  href={item.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-6 text-purple-700 font-semibold hover:underline"
                >
                  Visit Official Website →
                </a>
              )}
            </CardContent>
          </Card>
        );

        return (
          <div id={item.slug} key={item.id}>
            {isLinkable ? (
              <Link href={`/sightseeing/${item.slug}`} className="block">
                {cardInner}
              </Link>
            ) : (
              cardInner
            )}
          </div>
        );
      })}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchStadiumTours } from "@/utils/actions/contents";
import ExpandableText from "@/components/card/ExpandableText";

export const metadata = {
  title:
    "テムズ川クルーズ完全ガイド | ロンドン観光を満喫するリバークルーズ | ロンドん！",
  description:
    "ロンドン名物のテムズ川クルーズを徹底解説。ビッグ・ベン、ロンドン・アイ、タワーブリッジを眺める観光クルーズや、ナイトクルーズ、ディナークルーズまで、料金・ルート・おすすめを紹介する保存版ガイド。",
  keywords: [
    "テムズ川クルーズ",
    "ロンドン クルーズ",
    "リバークルーズ",
    "ナイトクルーズ",
    "ロンドン 観光",
    "タワーブリッジ",
    "ロンドンアイ",
    "ビッグベン",
    "ディナークルーズ",
    "観光船",
    "川下り ロンドン",
    "ロンドン 川 クルーズ",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/sightseeing/thames-cruise",
  },
  openGraph: {
    title: "テムズ川クルーズ完全ガイド | ロンドンの名所を船から楽しむ",
    description:
      "ビッグ・ベン、ロンドン塔、ウェストミンスター寺院など、テムズ川沿いの名所を結ぶ人気クルーズ。観光、ディナー、ナイトクルーズまで徹底紹介。",
    url: "https://www.just-rondon.com/sightseeing/thames-cruise",
    siteName: "ロンドん！ | テムズ川クルーズ特集",
    locale: "ja_JP",
    type: "website",
  },
};

export default async function tadiumToursListPage() {
  const contents = await fetchStadiumTours();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">
      <div>
        <h2 className="text-lg italic font-semibold text-center text-purple-700 dark:text-purple-300 mt-2">
          Stadium Tours in London
        </h2>
        <h1 className="text-2xl font-bold text-center">
          ロンドンで楽しむスタジアムツアー
        </h1>
      </div>
      <div>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
          ロンドンは、世界トップレベルのフットボール（サッカー）が息づく街です。
          街を歩けば、プレミアリーグの歴史や熱狂がそこかしこに漂っています。
        </p>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
          スタジアムツアーでは、選手たちが実際に使うロッカールーム、ピッチへ続くトンネル、
          VIPが座るロイヤルボックスなど、普段絶対入れない場所に足を踏み入れることができます。
          まさに“試合前夜の緊張感”を体験できる裏側への冒険です。
        </p>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-10">
          このガイドでは、アーセナル、チェルシー、トッテナム、ウェストハム、
          そして聖地ウェンブリーまで、ロンドンが誇るスタジアムツアーを紹介します。
          少しだけファン目線で、心が高鳴る瞬間を一緒に巡っていきましょう。
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

        return (
          <div id={item.slug} key={item.id}>
            <Card className="p-4 shadow-md rounded-xl hover:shadow-lg transition">
              <CardHeader>
                <CardTitle className="text-2xl">{item.title}</CardTitle>

                {item.image && (
                  <div className="relative w-full h-64 mt-4 rounded-lg overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
              </CardHeader>

              <CardContent>
                {item.mainText && (
                  <ExpandableText text={item.mainText} maxLines={4} />
                )}

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
                            <p className="text-gray-600 dark:text-gray-300 mt-2 whitespace-pre-line">
                              {sec.description}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {isLinkable && (
                  <div className="mt-6 text-right">
                    <Link
                      href={`/sightseeing/${item.slug}`}
                      className="
        inline-flex items-center gap-2
        rounded-full px-4 py-1.5
        text-sm font-semibold
        bg-purple-100 dark:bg-purple-800/50
        text-purple-700 dark:text-purple-300
        hover:bg-purple-200 dark:hover:bg-purple-700
        transition-all
        group
      "
                    >
                      詳細ページへ
                      <span
                        className="
          inline-block transition-transform duration-200
          group-hover:translate-x-1
        "
                      >
                        →
                      </span>
                    </Link>
                  </div>
                )}

                {/* 外部オフィシャルサイト */}
                {item.website && (
                  <a
                    href={item.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 text-purple-700 font-semibold hover:underline"
                  >
                    Visit Official Website →
                  </a>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import { fetchKidsFreeActivities } from "@/utils/actions/contents";

export const metadata = {
  title:
    "子どもと行けるロンドン無料スポット特集 | 家族で楽しむ観光ガイド | ジャスト・ロンドン",
  description:
    "ロンドンで子どもと楽しめる無料観光スポットを厳選紹介。自然史博物館、科学博物館、ブリティッシュミュージアム、スカイガーデン、コーラムズ・フィールズ、プレイパーク、動物スポットなど、家族で1日たっぷり遊べる人気の無料スポットをまとめたガイドです。",
  keywords: [
    "ロンドン",
    "無料",
    "子ども",
    "子連れ",
    "ロンドン 観光",
    "家族旅行",
    "ロンドン 無料スポット",
    "ロンドン 子供と行ける場所",
    "ロンドン 親子",
    "キッズ向け",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.just-rondon.com/sightseeing/kids-free-activities",
  },
  openGraph: {
    title:
      "子どもと行けるロンドン無料観光スポット特集 | 家族で楽しむお得ガイド",
    description:
      "ロンドンで子連れに人気の無料スポットを総まとめ。自然史博物館や科学博物館、スカイガーデン、公園・動物・遊び場など、親子で楽しめる場所を一覧で紹介。",
    url: "https://www.just-rondon.com/sightseeing/kids-free-activities",
    siteName: "ジャスト・ロンドン | 子どもと無料で楽しむロンドン",
    locale: "ja_JP",
    type: "website",
  },
};

export default async function KidsFreeListPage() {
  const items = await fetchKidsFreeActivities();

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 space-y-14">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <h1 className="text-xl font-extrabold tracking-tight">
          ロンドンで子どもと楽しむ無料スポットBEST 10
        </h1>

        <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          ロンドンには、子どもと一緒に“お金をかけずに”楽しめる場所が驚くほど豊富にあります。
          博物館、公園、展望台、王室イベント──無料でも想像以上に充実した体験ができるのがこの街の魅力です。
          10歳以下なら交通機関も無料なので、家族で気軽にロンドンの街を冒険できます。
          有料スポットと組み合わせれば、予算を抑えつつ最高の思い出が作れます。
        </p>
      </section>

      {/* List Section */}
      <section className="grid gap-8">
        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            目次
          </h2>

          <ul className="list-none space-y-3 border-l border-gray-300 dark:border-gray-700 pl-3">
            {items.map((item: any, idx: number) => (
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

        {/* --- Cards Section --- */}
        <section className="grid gap-10">
          {items.map((item: any) => (
            <div key={item.id} id={item.slug} className="scroll-mt-24">
              <Link href={`/sightseeing/${item.slug}`} className="group block">
                <Card
                  className="shadow-sm border bg-white/60 backdrop-blur-sm 
    hover:shadow-xl hover:bg-white transition-all duration-300
    dark:bg-slate-800/60 dark:hover:bg-slate-800 
    dark:border-slate-700"
                >
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">
                      {item.title}
                    </CardTitle>

                    {item.engTitle && (
                      <p className="text-sm text-muted-foreground italic">
                        {item.engTitle}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="text-sm leading-relaxed space-y-3">
                    <p className="font-medium text-muted-foreground">
                      {item.summary}
                    </p>

                    <div className="prose prose-sm max-w-none text-muted-foreground">
                      <ReactMarkdown>{item.mainText}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </section>
      </section>
    </div>
  );
}

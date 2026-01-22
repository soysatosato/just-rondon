import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import ReactMarkdown from "react-markdown";
import Link from "next/link";

import { CardCarousel } from "@/components/card/CardCarousel";

import {
  getHighlightAttractions,
  getMustSeeCategories,
  getSeasonalAttractions,
  getRoyalAttractions,
  getTours,
  getKidsAttractions,
  getFreeAttractions,
  getTodaysPicks,
} from "@/utils/sightseeing";

const faqItems = [
  {
    question: "ロンドンで絶対に行くべき観光地は？",
    answer: [
      "**ロンドン塔**：世界遺産にも登録されている中世の要塞で、王冠ジュエルの展示が有名。",
      "**ロンドン・アイ**：ヨーロッパ最大級の観覧車から、ロンドンのパノラマビューを楽しめる。",
      "**セント・ポール大聖堂**：巨大なドームが象徴の教会。上部のギャラリーから街を一望可能。",
      "**大英博物館**：古代エジプトやギリシャなど、人類史を網羅する世界最大級の博物館。",
      "**ハンプトン・コート宮殿**：ヘンリー8世ゆかりの宮殿で、庭園や迷路も人気。",
      "**バッキンガム宮殿**：英国王のロンドン公邸。夏季限定で内部一般公開や衛兵交代式が見どころ。",
      "**ビッグ・ベン**：国会議事堂に隣接する象徴的な時計台。限定日には内部見学ツアーも実施。",
    ],
  },
  {
    question: "ロンドンのどのエリアに観光スポットが多い？",
    answer: [
      "**北ロンドン**：ロンドン動物園やマダム・タッソー蝋人形館、大英図書館など。",
      "**東ロンドン**：O2アリーナの屋上クライムやケーブルカー、ジャック・ザ・リッパーのウォーキングツアー。",
      "**南ロンドン**：テート・ブリテン、シェイクスピアズ・グローブ座、カティーサーク号など歴史スポットが充実。",
      "**西ロンドン**：キュー・ガーデンズやケンジントン宮殿、自然史博物館などが集まるエリア。",
    ],
  },
  {
    question: "ロンドン旅行のおすすめ時期は？",
    answer: [
      "一年を通して比較的温暖で、いつ訪れても楽しめる都市。",
      "一般的には「5月」がベストシーズンとされ、日照時間が長く、気温も穏やかで観光しやすい。",
      "**春（3〜5月）**：花が咲き始め、公園散策にぴったり。",
      "**夏（6〜8月）**：日が長く、屋外イベントやルーフトップバーが充実。ただし観光客も多め。",
      "**秋（9〜11月）**：比較的穏やかな気候で、紅葉とともに落ち着いた雰囲気を楽しめる。",
      "**冬（12〜2月）**：イルミネーションやクリスマスマーケットなど、イベント重視の人におすすめ。",
    ],
  },
  {
    question: "ロンドン観光は何日あれば足りる？",
    answer: [
      "主要スポットだけを巡るなら2〜3日でも可能だが、博物館や近郊都市も含めてじっくり楽しむなら5〜7日がおすすめ。",
      "時間が限られている場合は、ホップオン・ホップオフバスやシティパスを活用すると効率的。",
    ],
  },
  {
    question: "ロンドンで最も訪問者数が多い観光地は？",
    answer: [
      "英国の観光業協会 ALVA の統計では、2024年のロンドンで最も訪問者数が多かったのは「大英博物館」で、年間約640万回以上の訪問があったとされている。",
    ],
  },
];

export default async function Page() {
  const [
    highlightAttractions,
    mustSeeCategories,
    seasonalAttractions,
    royalAttractions,
    tours,
    kidsAttractions,
    freeAttractions,
    todaysPicks,
  ] = await Promise.all([
    getHighlightAttractions(),
    getMustSeeCategories(),
    getSeasonalAttractions(),
    getRoyalAttractions(),
    getTours(),
    getKidsAttractions(),
    getFreeAttractions(),
    getTodaysPicks(3),
  ]);

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-12">
        <section className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              London Sightseeing
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              ロンドンには、世界的に有名な観光スポットがぎゅっと詰まっています。
              王室ゆかりの宮殿や歴史ある教会、最先端の展望台や体験型ミュージアムまで、
              初めてのロンドンでも、リピーターでも楽しめる見どころが目白押しです。
            </p>
            <p className="max-w-3xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              ここでは、日本からの旅行者にも人気の「絶対に外せないスポット」を中心に、
              テーマ別にロンドンの見どころを整理して紹介します。
              多くの施設は事前予約制や日時指定チケット制なので、
              渡航前にオフィシャルサイトで最新情報を確認しておくと安心です。
            </p>
          </div>

          {/* メインの4カード（ここはそのまま） */}
          <div className="grid gap-4 sm:grid-cols-2">
            {highlightAttractions.map((item: any, idx: any) => (
              <Link key={idx} href={`/sightseeing/${item.slug}`}>
                <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                  <div className="relative h-40 w-full">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </div>
                  <CardHeader className="space-y-1">
                    <p className="text-xs font-medium text-emerald-600">
                      {item.subtitle}
                    </p>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* ロンドン観光の概要テキスト（そのまま） */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">ロンドン観光の始め方</h2>
          <p className="max-w-4xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            ロンドンの魅力は「歴史」と「今」が同時に存在していることです。
            タワー・オブ・ロンドンで中世の雰囲気を味わいつつ、
            ロンドン・アイからは近未来的なシティのビル群を見渡せます。
            ウェストミンスター寺院では英国の王室行事の舞台を見学し、
            バッキンガム宮殿では衛兵交代式を見守る——
            1日のうちに何世紀分もの時間旅行ができてしまうのがロンドンです。
          </p>
          <p className="max-w-4xl text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            「何から回ればいいか分からない」という人は、
            まずは「必見スポット」と「シティパス」の情報を押さえ、
            1〜2日分のシンプルなモデルコースを作るのがおすすめです。
          </p>

          <div className="flex justify-end mt-2">
            <Link
              href="/sightseeing/all"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              ロンドン観光スポット一覧を見る →
            </Link>
          </div>
        </section>

        {/* Today’s Picks（grid → carousel） */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">Today’s Picks</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              本日のおすすめスポットをランダムにセレクト。
            </p>
          </div>

          <CardCarousel>
            {todaysPicks.map((item: any, idx: any) => (
              <div
                key={idx}
                className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <Link href={`/sightseeing/${item.slug}`}>
                  <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition">
                    <div className="relative h-40 w-full">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                    <CardHeader className="space-y-1">
                      <p className="text-xs font-semibold text-emerald-600">
                        Today’s Pick
                      </p>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            ))}
          </CardCarousel>
        </section>

        {/* 必見スポットカテゴリ（ここはgridのまま維持） */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">ロンドン必見スポット</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              バッキンガム宮殿やビッグ・ベン、ロンドン・アイなど、
              「ロンドンらしさ」を感じる名所をテーマ別にチェックしましょう。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {mustSeeCategories.map((item: any, idx: any) => (
              <Link key={idx} href={`/sightseeing/${item.slug}`}>
                <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                  <div className="relative h-40 w-full">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                    />
                  </div>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
          <Card className="border-dashed border-slate-300 bg-slate-50 dark:bg-slate-700">
            <CardContent className="space-y-2 py-4 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-semibold">
                Sightseeing pass（観光パス）をうまく使おう
              </p>
              <p>
                ロンドン・パスや他のシティパスを利用すると、
                人気アトラクションの入場料が最大50%程度節約できることもあります。
                自分の行きたい場所と比較しながら、もっともお得なパスを選びましょう。
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 季節イベント（grid → carousel） */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">季節イベント</h2>

          <CardCarousel>
            {seasonalAttractions.map((item: any, idx: any) => (
              <div key={idx} className="flex-[0_0_100%] md:flex-[0_0_50%]">
                <Link href={`/sightseeing/${item.slug}`}>
                  <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="relative h-40 w-full">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                    <CardContent className="space-y-1 py-3">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </CardCarousel>
        </section>

        {/* 王室ゆかり（grid → carousel） */}
        <section className="space-y-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">王室ゆかりのスポット</h3>

            <CardCarousel>
              {royalAttractions.map((item: any, idx: any) => (
                <div
                  key={idx}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] md:flex-[0_0_25%]"
                >
                  <Link href={`/sightseeing/${item.slug}`}>
                    <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                      <div className="relative h-40 w-full">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          fetchPriority="low"
                        />
                      </div>
                      <CardContent className="space-y-1 py-2">
                        <p className="text-xs font-semibold">{item.title}</p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              ))}
            </CardCarousel>
          </div>
        </section>

        {/* ツアー（grid → carousel） */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">見逃せないロンドンツアー</h2>

          <CardCarousel>
            {tours.map((item: any, idx: any) => (
              <div key={idx} className="flex-[0_0_100%] md:flex-[0_0_50%]">
                <Link href={`/sightseeing/${item.slug}`}>
                  <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="relative h-40 w-full">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                    <CardContent className="space-y-1 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{item.title}</p>
                        {item.badge && (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.description}
                      </p>
                      {item.price && (
                        <p className="text-[11px] font-medium text-slate-900 dark:text-slate-100">
                          From {item.price}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </CardCarousel>
        </section>

        {/* 家族向け（grid → carousel） */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">家族で楽しめるロンドン</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              子どもと一緒のロンドン旅行なら、体験型ミュージアムやアトラクションが充実したエリアを中心にホテルを選ぶと移動が楽になります。
            </p>
          </div>

          <CardCarousel>
            {kidsAttractions.map((item: any, idx: any) => (
              <div key={idx} className="flex-[0_0_100%] md:flex-[0_0_50%]">
                <Link href={`/sightseeing/${item.slug}`}>
                  <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="relative h-40 w-full">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                    <CardContent className="space-y-1 py-3">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </CardCarousel>
        </section>

        {/* ミュージアム（grid → carousel） */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            ロンドンの必見ミュージアム & アートギャラリー
          </h2>
          <p className="max-w-4xl text-sm text-slate-600 dark:text-slate-300">
            ロンドンの多くの国立博物館・美術館は入場無料（特別展は有料）で、
            コスパの面でも世界トップクラス。雨の日は「ミュージアムはしご」もおすすめです。
          </p>

          <CardCarousel>
            {freeAttractions.map((item: any, idx: any) => (
              <div
                key={idx}
                className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
              >
                <Link href={`/museums/${item.slug}`}>
                  <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="relative h-40 w-full">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                      />
                    </div>
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            ))}
          </CardCarousel>
        </section>

        {/* FAQ（Card一覧 → Accordion） */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">ロンドン観光 FAQ</h2>

          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((faq: any, idx: any) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border-none"
              >
                <Card className="border-none shadow-sm">
                  <AccordionTrigger className="px-6 py-4">
                    <span className="text-sm font-semibold">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {faq.answer.map((line: any, i: any) => (
                        <div key={i} className="flex gap-1">
                          <span className="shrink-0">・</span>
                          <div className="prose prose-slate max-w-none">
                            <ReactMarkdown>{line}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </Card>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
    </div>
  );
}

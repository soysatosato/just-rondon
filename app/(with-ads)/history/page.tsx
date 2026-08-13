import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import GuideFaq from "@/components/guides/GuideFaq";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import {
  HISTORY_BASE,
  HISTORY_ERA_BLURBS,
  HISTORY_ERA_LABELS,
  HISTORY_ERA_ORDER,
  HISTORY_SECTION_NAME,
  chapterPath,
  chaptersByEra,
  historyChapters,
  historyHubCollectionJsonLd,
} from "@/components/history/chapters";

const TITLE =
  "イギリスの歴史 全10章｜ロンドンで実際に立てる場所から辿る通史";
const DESCRIPTION =
  "ローマ帝国のブリタニア征服から EU 離脱まで、イギリスの歴史を全10章で解説します。各章に「今のロンドンに残っているもの」と「実際に立てる場所」をつけました。年号を覚えるためではなく、目の前の街がなぜこうなっているかを理解するための通史です。";

export const metadata = buildPageMetadata({
  path: HISTORY_BASE,
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "イギリス 歴史",
    "イギリス 歴史 わかりやすく",
    "ロンドン 歴史",
    "イギリス 通史",
    "英国史",
    "大英帝国 歴史",
    "イギリス 歴史 年表",
  ],
});

/**
 * 「今日の疑問」から章に入る導線。
 *
 * 通史の目次（第1章 ローマ、第2章 アングロサクソン…）を最初に置くと、
 * 学校の教科書の目次と同じものになり、読者は自分に関係があると思わない。
 * 各章が持つ legacyToday の中から最も引きの強いものを1つずつ出して、
 * 「今のロンドンで見えているもの」を入口にする。
 *
 * ここに並ぶ問いは components/history/content/*.ts の legacyToday と
 * 対応しているので、章の本文を書き換えたらこちらも合わせること。
 */
const QUESTIONS: { question: string; answer: string; slug: string }[] = [
  {
    question: "シティの境界線が、なぜあんなに不自然に歪んでいるのか",
    answer: "ローマの城壁をなぞっているから",
    slug: "roman-britain",
  },
  {
    question: "曜日の名前が、なぜそろって北欧の神々なのか",
    answer: "アングロサクソンが自分たちの神を当てはめたから",
    slug: "anglo-saxons-vikings",
  },
  {
    question: "牛は cow なのに、なぜ牛肉は beef なのか",
    answer: "育てる人と食べる人が、別の言語を話していたから",
    slug: "norman-conquest",
  },
  {
    question: "英国王が、なぜ今も「国教会の首長」なのか",
    answer: "16世紀の王の離婚問題が、そのまま制度になったから",
    slug: "tudors",
  },
  {
    question: "国王が、なぜ庶民院の議場に入れないのか",
    answer: "1642年にチャールズ1世が武装兵を連れて踏み込んだから",
    slug: "civil-war",
  },
  {
    question: "大英博物館が無料なのに、なぜ収蔵品が国際問題になるのか",
    answer: "帝国の拡大過程で取得されたものが相当数あるから",
    slug: "union-and-empire",
  },
  {
    question: "ロンドンの下水道が、なぜ今も1860年代のものなのか",
    answer: "1858年の「大悪臭」で、必要の倍の太さで作られたから",
    slug: "industrial-revolution",
  },
  {
    question: "パブが、なぜ長いあいだ23時に閉まっていたのか",
    answer: "第一次大戦の軍需工場法が、90年近く残ったから",
    slug: "world-wars",
  },
  {
    question: "GPの診察も入院も、なぜ無料なのか",
    answer: "1948年のNHS創設時の原則が、今も続いているから",
    slug: "postwar",
  },
  {
    question: "日本人がイギリスに行くのに、なぜETAが必要になったのか",
    answer: "EU離脱後、英国が国境管理を一から作り直したから",
    slug: "modern-britain",
  },
];

const FAQ_ITEMS = [
  {
    question: "どの章から読めばいいですか？",
    answer:
      "**通しで読むなら第1章から**です。各章の末尾に次章へのリンクがあり、順に読めるように書いています。ただし各章は単体でも完結しているので、上の「今日の疑問」から気になるものを選んで、そこだけ読んでも構いません。ロンドン滞在中なら、これから行く場所が出てくる章を先に読むのが最も効率的です。",
  },
  {
    question: "普通の世界史の解説と、何が違うのですか？",
    answer:
      "**全章に「実際に立てる場所」をつけています**。復元やレプリカではなく、その時代の物証が今も見られる地点だけを、最寄り駅と入場可否つきで挙げました。加えて各章の冒頭は年号ではなく「今のロンドンに残っているもの」から始まります。年表を覚えるためではなく、目の前の街を読むための通史です。",
  },
  {
    question: "「イギリス」「イングランド」「UK」は、どう違うのですか？",
    answer:
      "**イングランド**は島の一地域、**グレートブリテン**はイングランド・スコットランド・ウェールズが乗る島、**UK（連合王国）** はそれに北アイルランドを加えた国家です。日本語の「イギリス」はポルトガル語の Inglez（イングランド）由来の通称。スコットランド人に England と言うと訂正されることがあるので、迷ったら Britain か the UK が無難です。第6章で詳しく扱います。",
  },
  {
    question: "子どもと一緒に歴史を辿るなら、どこがおすすめですか？",
    answer:
      "**ロンドン塔**（第3章）が最もわかりやすく、鎧・王冠・処刑場跡と見どころが具体的です。次点で**自然史博物館・科学博物館**（第7章、どちらも無料）。逆に帝国戦争博物館のホロコースト・ギャラリー（第8章）は14歳未満には推奨されていません。",
  },
  {
    question: "1日で歴史を一気に体感できるルートはありますか？",
    answer:
      "**Tower Hill から西へ歩くルート**を推します。ローマ城壁（第1章）→ ロンドン塔（第3章）→ セント・ポール大聖堂とブリッツの痕跡（第5・8章）→ ウェストミンスター寺院とバンケティング・ハウス（第2・4・5章）。徒歩と地下鉄で1日に収まり、2000年を東から西へ辿れます。",
  },
];

export default function HistoryHubPage() {
  const pageUrl = `${SITE_URL}${HISTORY_BASE}`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 text-gray-900 dark:text-gray-100">
      <JsonLd
        data={breadcrumbJsonLd({
          name: HISTORY_SECTION_NAME,
          path: HISTORY_BASE,
        })}
      />
      <JsonLd
        data={historyHubCollectionJsonLd({
          name: TITLE,
          description: DESCRIPTION,
        })}
      />
      <JsonLd data={faqPageJsonLd(FAQ_ITEMS, pageUrl)} />

      <BreadCrumbs name={HISTORY_SECTION_NAME} />

      <header className="mt-6 space-y-4">
        <h1 className="text-2xl font-bold leading-tight md:text-4xl">
          イギリスの歴史 全10章
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          A History of Britain, in Ten Chapters
        </p>
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          年号を覚えるための通史ではありません。
          <strong>目の前のロンドンが、なぜこうなっているのか</strong>
          を理解するための通史です。
          各章の冒頭は「今も残っているもの」から始まり、末尾に
          <strong>その時代に実際に立てる場所</strong>
          を、最寄り駅と入場可否つきで置いています。
        </p>
      </header>

      {/*
        通史の目次より前に「今日の疑問」を出す。
        読者が自分の体験と結びつけられる問いを入口にしないと、
        「イギリス史の解説ページ」は最後まで自分ごとにならない。
      */}
      <section aria-labelledby="questions" className="mt-10 space-y-5">
        <div className="space-y-2">
          <h2 id="questions" className="text-xl font-bold md:text-2xl">
            気になる疑問から読む
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            どれも答えが歴史にあります。1つ選べば、それがあなたの入口です。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {QUESTIONS.map((q) => (
            <Link key={q.slug} href={chapterPath(q.slug)} className="block">
              <Card className="h-full border-gray-300 bg-white shadow-sm transition hover:border-amber-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-amber-500">
                <CardContent className="flex h-full flex-col p-5">
                  <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100">
                    {q.question}
                  </p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    → {q.answer}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <AdSenseUnit slot={AD_SLOTS.listing} className="my-10" />

      <Separator className="my-8" />

      <section aria-labelledby="all-chapters" className="space-y-8">
        <div className="space-y-2">
          <h2 id="all-chapters" className="text-xl font-bold md:text-2xl">
            全{historyChapters.length}章
          </h2>
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            紀元43年から現在まで。順に読めば通史になり、1章だけでも完結します。
          </p>
        </div>

        {HISTORY_ERA_ORDER.map((era) => {
          const chapters = chaptersByEra(era);
          if (chapters.length === 0) return null;

          return (
            <div key={era} className="space-y-3">
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                  {HISTORY_ERA_LABELS[era]}
                </h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                  {HISTORY_ERA_BLURBS[era]}
                </p>
              </div>

              <div className="space-y-3">
                {chapters.map((c) => (
                  <Link
                    key={c.slug}
                    href={chapterPath(c.slug)}
                    className="block"
                  >
                    <Card className="border-gray-300 bg-white shadow-sm transition hover:border-amber-400 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:border-amber-500">
                      <CardContent className="p-5">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span className="text-xs font-bold text-amber-700 dark:text-amber-500">
                            第{c.number}章
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {c.period}
                          </span>
                          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
                            {c.eyebrow}
                          </span>
                        </div>
                        <span className="mt-1.5 block text-base font-semibold">
                          {c.label}
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                          {c.blurb}
                        </span>
                        <span className="mt-2 block text-xs leading-relaxed text-amber-700 dark:text-amber-500">
                          今も残るもの：{c.hook}
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      <GuideFaq items={FAQ_ITEMS} />

      <div className="mt-10 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-neutral-700 dark:bg-neutral-900">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          歴史を実際に見に行くなら
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
          各章に挙げた場所の多くは、以下のページで行き方やチケットを詳しく扱っています。
        </p>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link
              href="/museums/best-10-museums"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              絶対に行くべき美術館・博物館10選
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/royal-london"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ロイヤル・ロンドン｜王室ゆかりの場所を巡る
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/blue-plaques"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              ブループラーク巡り｜街に埋まった人物史
            </Link>
          </li>
          <li>
            <Link
              href="/sightseeing/itinerary"
              className="text-blue-600 hover:opacity-80 dark:text-blue-400"
            >
              モデルコース（1〜5日）
            </Link>
          </li>
        </ul>
      </div>

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}

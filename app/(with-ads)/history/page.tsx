import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import GuideFaq from "@/components/guides/GuideFaq";
import HubMasthead from "@/components/reading/HubMasthead";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { hubOgImage } from "@/lib/og-hubs";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import ChapterList from "@/components/history/ChapterList";
import EraRail from "@/components/history/EraRail";
import QuestionCards, {
  type HistoryQuestion,
} from "@/components/history/QuestionCards";
import WalkStrip from "@/components/history/WalkStrip";
import { historyChapterArticles } from "@/components/history/content";
import { walkRouteSentence } from "@/components/history/walk";
import {
  HISTORY_BASE,
  HISTORY_ERA_BLURBS,
  HISTORY_ERA_LABELS,
  HISTORY_ERA_ORDER,
  HISTORY_SECTION_NAME,
  chapterPath,
  chaptersByEra,
  eraAnchor,
  eraChapterRange,
  eraRange,
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
  images: [hubOgImage("history")],
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
const QUESTIONS: HistoryQuestion[] = [
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

/**
 * 題字の背景。
 *
 * 他の読み物ハブは最新記事の挿絵を沈めているが、通史には「最新」が無く、
 * 10章のどれか1つを出すと、そこが表紙のように見える。かわりに1616年の
 * ロンドン俯瞰図を敷いた。全10章のうち4章がこの絵より前の話で、残りは
 * この絵のあとに起きたことなので、どの章の側にも寄らない。
 *
 * パブリックドメインだが、背景として使うときも出典は書いておく。
 */
const MASTHEAD = {
  image:
    "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/London_panorama%2C_1616.jpg/1280px-London_panorama%2C_1616.jpg",
  caption: "クラース・ヤンスゾーン・フィスヘル「ロンドン俯瞰図」1616年",
  credit: "Claes Janszoon Visscher II (Public domain)",
  link: "https://commons.wikimedia.org/wiki/File:London_panorama,_1616.jpg",
};

/**
 * 題字に出す数字。
 *
 * 「全10章」だけでは分量が伝わらないので、このセクションの取り柄である
 * 現地接地（whereToStand）と年表の行数を数えて出す。章の本文から数える
 * ので、章を書き足せば勝手に増える。
 */
const CHAPTER_ARTICLES = Object.values(historyChapterArticles);
const PLACE_COUNT = CHAPTER_ARTICLES.reduce(
  (sum, c) => sum + c.whereToStand.length,
  0,
);
const TIMELINE_COUNT = CHAPTER_ARTICLES.reduce(
  (sum, c) => sum + c.timeline.length,
  0,
);

/** 実際に見に行くときの送り先。章の whereToStand から先の実用情報を持つページ。 */
const VISIT_LINKS = [
  {
    href: "/museums/best-10-museums",
    label: "絶対に行くべき美術館・博物館10選",
    note: "章に出てくる収蔵品の多くはここにあります",
  },
  {
    href: "/sightseeing/royal-london",
    label: "ロイヤル・ロンドン",
    note: "王室ゆかりの場所を、行き方とあわせて",
  },
  {
    href: "/sightseeing/blue-plaques",
    label: "ブループラーク巡り",
    note: "街の壁に埋まっている人物史",
  },
  {
    href: "/sightseeing/itinerary",
    label: "モデルコース（1〜5日）",
    note: "歴史の地点を旅程に組み込むなら",
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
    answer: `**全章に「実際に立てる場所」をつけています**。全10章で合計${PLACE_COUNT}か所。復元やレプリカではなく、その時代の物証が今も見られる地点だけを、最寄り駅と入場可否つきで挙げました。加えて各章の冒頭は年号ではなく「今のロンドンに残っているもの」から始まります。年表を覚えるためではなく、目の前の街を読むための通史です。`,
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
    // 順路は walk.ts が正。ここに地点を直書きすると、帯と食い違う。
    answer: `**Tower Hill から西へ歩くルート**を推します。${walkRouteSentence()}。徒歩と地下鉄で1日に収まり、2000年を東から西へ辿れます。このページの「1日で2000年を歩く」に、各地点で何が見えるかをまとめました。`,
  },
];

export default function HistoryHubPage() {
  const pageUrl = `${SITE_URL}${HISTORY_BASE}`;
  const firstChapter = historyChapters[0];

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 text-gray-900 dark:text-gray-100 md:py-10">
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

      <Breadcrumbs path="/history" className="mb-6" />

      <HubMasthead
        accent="history"
        eyebrow="A History of Britain"
        kicker="全10章・通読できます"
        titleLead="イギリスの歴史 "
        titleAccent="全10章"
        description={
          <>
            年号を覚えるための通史ではありません。
            <strong className="font-bold text-white">
              目の前のロンドンが、なぜこうなっているのか
            </strong>
            を理解するための通史です。各章は「今も残っているもの」から始まり、末尾に
            <strong className="font-bold text-white">
              その時代に実際に立てる場所
            </strong>
            を、最寄り駅と入場可否つきで置いています。
          </>
        }
        image={MASTHEAD.image}
        stats={[
          { label: "通史", value: `${historyChapters.length}`, unit: "章" },
          { label: "立てる場所", value: `${PLACE_COUNT}`, unit: "か所" },
          { label: "年表", value: `${TIMELINE_COUNT}`, unit: "行" },
        ]}
      >
        <EraRail />
        <p className="mt-6 text-[10px] leading-snug text-white/30">
          題字の背景: {MASTHEAD.caption}（
          <a
            href={MASTHEAD.link}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/50"
          >
            {MASTHEAD.credit}
          </a>
          ）
        </p>
      </HubMasthead>

      {/*
        通史の目次より前に「今日の疑問」を出す。
        読者が自分の体験と結びつけられる問いを入口にしないと、
        「イギリス史の解説ページ」は最後まで自分ごとにならない。
      */}
      <section aria-labelledby="questions" className="mb-14">
        <div className="mb-5 border-b border-foreground/15 pb-4">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-500" />
            Start with a question
          </p>
          <h2
            id="questions"
            className="mt-2 text-xl font-bold tracking-tight sm:text-2xl"
          >
            気になる疑問から読む
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            どれも答えが歴史にあります。1つ選べば、それがあなたの入口です。
          </p>
        </div>

        <QuestionCards questions={QUESTIONS} />
      </section>

      <AdSenseUnit slot={AD_SLOTS.listing} className="mb-14" />

      <section aria-labelledby="all-chapters" className="mb-14">
        <div className="mb-6 border-b border-foreground/15 pb-4">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-500" />
            Ten chapters
          </p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <h2
              id="all-chapters"
              className="text-xl font-bold tracking-tight sm:text-2xl"
            >
              全{historyChapters.length}章
            </h2>
            <Link
              href={chapterPath(firstChapter.slug)}
              className="shrink-0 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-600"
            >
              第1章から読む →
            </Link>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            紀元43年から現在まで。順に読めば通史になり、1章だけでも完結します。
          </p>
        </div>

        <div className="space-y-10">
          {HISTORY_ERA_ORDER.map((era) => {
            const chapters = chaptersByEra(era);
            if (chapters.length === 0) return null;

            return (
              <div key={era} id={eraAnchor(era)} className="scroll-mt-24">
                <div className="mb-4 border-l-2 border-amber-400 pl-3.5">
                  <p className="font-serif text-[11px] font-semibold tabular-nums text-amber-700 dark:text-amber-500">
                    {eraRange(era)}・{eraChapterRange(era)}
                  </p>
                  <h3 className="mt-0.5 text-lg font-bold tracking-tight">
                    {HISTORY_ERA_LABELS[era]}
                  </h3>
                  <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                    {HISTORY_ERA_BLURBS[era]}
                  </p>
                </div>

                <ChapterList chapters={chapters} />
              </div>
            );
          })}
        </div>
      </section>

      <div className="mb-14">
        <WalkStrip />
      </div>

      <section aria-labelledby="visit" className="mb-14">
        <div className="mb-5 border-b border-foreground/15 pb-4">
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-amber-500" />
            Go and see it
          </p>
          <h2
            id="visit"
            className="mt-2 text-xl font-bold tracking-tight sm:text-2xl"
          >
            歴史を実際に見に行くなら
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            各章に挙げた{PLACE_COUNT}か所の多くは、以下のページで行き方やチケットを詳しく扱っています。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {VISIT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-lg hover:shadow-amber-900/5 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-amber-800"
            >
              <p className="text-sm font-bold tracking-tight transition-colors group-hover:text-amber-700 dark:group-hover:text-amber-400">
                {link.label}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {link.note}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <GuideFaq items={FAQ_ITEMS} />

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />
    </main>
  );
}

import { buildPageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/seo";
import {
  SIGHTSEEING_BASE,
  SIGHTSEEING_PUBLISHER,
  sightseeingBreadcrumbJsonLd,
} from "../jsonld";
import type { FootballGuideArticle } from "./types";

export { SITE_URL };

export const FOOTBALL_BASE = `${SIGHTSEEING_BASE}/football`;
export const FOOTBALL_SECTION_NAME = "プレミアリーグ観戦ガイド";

/**
 * ハブでの分類。
 *
 * 「チケットを取る → 当日を乗り切る → クラブを選ぶ → 観戦以外」の4段。
 * この順序は、読者が実際に詰まる順序そのもの。日本語のサッカー観戦情報は
 * スタジアム紹介から始まるものが多いが、実際の障壁は入口のチケットにある。
 * 席が取れなければスタジアムの解説は一行も役に立たない。
 *
 * この4つ以外は増やさないこと。増やすなら別セクションを立てるべきサイン。
 */
export type FootballCategory = "tickets" | "matchday" | "clubs" | "beyond";

export const FOOTBALL_CATEGORY_LABELS: Record<FootballCategory, string> = {
  tickets: "チケットを取る",
  matchday: "試合当日を乗り切る",
  clubs: "どのクラブを観るか",
  beyond: "プレミアリーグの外側",
};

export const FOOTBALL_CATEGORY_BLURBS: Record<FootballCategory, string> = {
  tickets:
    "最初に読む3本。ロンドン観戦の成否は9割ここで決まります。会員制度の仕組みと、絶対に手を出してはいけない買い方。",
  matchday:
    "席が取れた後の話。スタジアムへの行き方、持ち込み制限、パブでの過ごし方、そして応援の作法。",
  clubs:
    "ロンドンの6クラブそれぞれの性格と、取りやすさ。初めてなら選ぶべきクラブは決まっています。",
  beyond:
    "チケットが取れなかった人へ。パブ観戦、下部リーグ、女子サッカー、スタジアムツアー。むしろこちらが面白いこともあります。",
};

export const FOOTBALL_CATEGORY_ORDER: FootballCategory[] = [
  "tickets",
  "matchday",
  "clubs",
  "beyond",
];

export type FootballGuideMeta = {
  slug: string;
  category: FootballCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * 観戦ガイドの並び。
 *
 * 先頭がチケットの取り方なのは、日本人がロンドンでサッカーを観ようと
 * したときに最初に、そして最も深く躓くのがそこだから。
 * 「日本の感覚でチケットサイトを開いて買う」が通用せず、
 * かつ二次流通サイトで買うと違法かつ入場拒否されるという、
 * 知らないと確実に事故る構造になっている。
 *
 * next-sitemap.config.js の staticPages と、/sightseeing/football ハブの
 * カード表示順をこのリストと一致させること。
 */
export const footballGuides: FootballGuideMeta[] = [
  {
    slug: "tickets",
    category: "tickets",
    eyebrow: "Getting Tickets",
    label: "チケットの取り方のすべて",
    blurb:
      "一般販売はほぼ存在しません。会員になる、公式リセールを張る、ホスピタリティを買う、の3択です。クラブごとの発売時期と、実際の手順。",
  },
  {
    slug: "resale-warning",
    category: "tickets",
    eyebrow: "Resale & Scams",
    label: "買ってはいけないチケット",
    blurb:
      "英国では football のチケット転売が法律で禁じられています。二次流通サイトで買った席は入場を拒否されます。合法な入手経路との見分け方。",
  },
  {
    slug: "planning",
    category: "tickets",
    eyebrow: "Planning",
    label: "日程の組み方と、直前の変更",
    blurb:
      "キックオフ時刻はテレビ放映の都合で数週間前に変わります。旅行の日程を試合に合わせる方法と、変更に耐える組み方。",
  },
  {
    slug: "matchday",
    category: "matchday",
    eyebrow: "Matchday",
    label: "試合当日の流れ",
    blurb:
      "何時に出るか、何を持って行けないか、入場からキックオフまで。ロンドンのスタジアムはバッグの持ち込みが厳しく、知らないと入れません。",
  },
  {
    slug: "getting-there",
    category: "matchday",
    eyebrow: "Getting There",
    label: "スタジアムへの行き方と帰り方",
    blurb:
      "6つのスタジアムそれぞれの最寄り駅と所要時間。そして本当の難所である「帰り」。試合終了後の駅は入場規制がかかります。",
  },
  {
    slug: "etiquette",
    category: "matchday",
    eyebrow: "Etiquette",
    label: "観戦の作法とやってはいけないこと",
    blurb:
      "立って応援していいのか、相手チームのユニフォームで行っていいのか。ホーム側の席で相手を応援すると退場になります。",
  },
  {
    slug: "which-club",
    category: "clubs",
    eyebrow: "Choosing a Club",
    label: "どのクラブの試合を観るか",
    blurb:
      "ロンドンの6クラブを、チケットの取りやすさ・スタジアムの魅力・立地で比較。初めてなら答えははっきりしています。",
  },
  {
    slug: "stadiums",
    category: "clubs",
    eyebrow: "Stadiums",
    label: "6つのスタジアム徹底比較",
    blurb:
      "エミレーツからクレイヴン・コテージまで。収容人数、雰囲気、席の選び方、そして「どの席を買うと失敗するか」。",
  },
  {
    slug: "north-london-derby",
    category: "clubs",
    eyebrow: "Derbies",
    label: "ロンドン・ダービーという特別な試合",
    blurb:
      "北ロンドン・ダービーをはじめ、ロンドン勢同士の対戦は雰囲気がまるで違います。観られる可能性と、その日の街の空気。",
  },
  {
    slug: "pub-watching",
    category: "beyond",
    eyebrow: "Watching in Pubs",
    label: "パブで観る",
    blurb:
      "実はこれが最もイギリスらしい観戦です。土曜15時の試合が放映されない理由と、放映のあるパブの探し方。無料で、席も要りません。",
  },
  {
    slug: "lower-leagues",
    category: "beyond",
    eyebrow: "Lower Leagues & WSL",
    label: "下部リーグと女子サッカー",
    blurb:
      "当日券で入れて、価格は3分の1。ロンドンには十数クラブがあります。women's Super League も含め、むしろ濃い体験ができる選択肢。",
  },
  {
    slug: "stadium-tours",
    category: "beyond",
    eyebrow: "Stadium Tours",
    label: "試合がない日のスタジアム",
    blurb:
      "オフシーズンや、チケットが取れなかった日に。ロッカールームとピッチサイドに入れるツアーは、試合日には絶対に見られない場所です。",
  },
];

export function footballGuidePath(slug: string) {
  return `${FOOTBALL_BASE}/${slug}`;
}

export function getFootballGuideMeta(slug: string) {
  return footballGuides.find((g) => g.slug === slug) ?? null;
}

/** /sightseeing/football/[slug] が実際に生成するページ。 */
export const footballGuideSlugs = footballGuides.map((g) => g.slug);

export function footballGuidesByCategory(category: FootballCategory) {
  return footballGuides.filter((g) => g.category === category);
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildFootballGuideMetadata(article: FootballGuideArticle) {
  return buildPageMetadata({
    path: footballGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function footballGuideBreadcrumbJsonLd(article: FootballGuideArticle) {
  const meta = getFootballGuideMeta(article.slug);
  return sightseeingBreadcrumbJsonLd([
    { name: FOOTBALL_SECTION_NAME, path: FOOTBALL_BASE },
    {
      name: meta?.label ?? article.title,
      path: footballGuidePath(article.slug),
    },
  ]);
}

export function footballGuideArticleJsonLd(article: FootballGuideArticle) {
  const url = `${SITE_URL}${footballGuidePath(article.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.description,
    inLanguage: "ja",
    mainEntityOfPage: url,
    dateModified: article.updatedAt,
    author: SIGHTSEEING_PUBLISHER,
    publisher: SIGHTSEEING_PUBLISHER,
  };
}

/** /sightseeing/football ハブが持つ記事の一覧を CollectionPage として出す。 */
export function footballHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${FOOTBALL_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    publisher: SIGHTSEEING_PUBLISHER,
    hasPart: footballGuides.map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${footballGuidePath(g.slug)}`,
    })),
  };
}

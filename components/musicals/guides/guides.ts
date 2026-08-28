import { breadcrumbListJsonLd } from "@/components/navigation/tree";
import type { MusicalGuideArticle } from "./types";

import { SITE_URL, buildPageMetadata } from "@/lib/seo";
export { SITE_URL };
export const MUSICALS_BASE = "/musicals";
export const MUSICAL_GUIDES_SECTION_NAME = "観劇ガイド";

export const MUSICALS_PUBLISHER = {
  "@type": "Organization",
  name: "ジャスト・ロンドン",
  url: SITE_URL,
} as const;

/**
 * 情報の基準時点。
 *
 * チケットの買い方も劇場の慣習も年単位でしか変わらないので、
 * 交通ガイドのような改定日に紐づく運用は要らない。記事をまとめて
 * 見直したときにここだけ更新する。
 */
export const MUSICAL_GUIDE_AS_OF = "2026年8月";
export const MUSICAL_GUIDE_UPDATED_AT = "2026-08-16";

/**
 * ハブでの分類。
 *
 * 「観る前に決める → 当日 → 相手に合わせて選ぶ」の3段。
 * 読者が記事を必要とする順番そのもので、迷っている段階の人は
 * 1段目だけ、チケットを取った人が2段目に降りてくる。
 */
export type MusicalGuideCategory = "before" | "onTheDay" | "choosing";

export const MUSICAL_GUIDE_CATEGORY_LABELS: Record<
  MusicalGuideCategory,
  string
> = {
  before: "チケットを取るまで",
  onTheDay: "劇場に行く日",
  choosing: "誰と観るか、何を観るか",
};

export const MUSICAL_GUIDE_CATEGORY_BLURBS: Record<
  MusicalGuideCategory,
  string
> = {
  before:
    "まず読む2本。どこで買えば安全か、いくらが相場かが分かれば、あとは作品を選ぶだけです。",
  onTheDay:
    "チケットを取ったあとに読む2本。何時に着いて、休憩で何が起きて、終演後どう帰るか。",
  choosing:
    "英語が不安なとき、子どもと行くとき。作品選びの基準が変わる場合の2本です。",
};

export const MUSICAL_GUIDE_CATEGORY_ORDER: MusicalGuideCategory[] = [
  "before",
  "onTheDay",
  "choosing",
];

export type GuideMeta = {
  slug: string;
  category: MusicalGuideCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * ガイド記事の並び。
 *
 * next-sitemap.config.js の staticPages、および /musicals トップページの
 * カード表示順と一致させること。
 */
export const guides: GuideMeta[] = [
  {
    slug: "west-end-tickets",
    category: "before",
    eyebrow: "Tickets & Prices",
    label: "チケットの買い方・お得な料金ガイド",
    blurb:
      "公式ボックスオフィスとTodayTixの使い分け、TKTS半額ブースやday seatsでの節約術、料金相場の目安をまとめました。",
  },
  {
    slug: "pre-theatre-dining",
    category: "before",
    eyebrow: "Pre-Theatre Dining",
    label: "劇場街の食事・プリシアターメニュー",
    blurb:
      "開演前の2時間をどう使うか。プリシアターメニューの仕組みと予約の時間割、劇場内のバーで済ませる選択肢まで。",
  },
  {
    slug: "west-end-etiquette",
    category: "onTheDay",
    eyebrow: "Theatre Etiquette",
    label: "劇場の楽しみ方・マナーガイド",
    blurb:
      "服装や開演時間の目安、劇場街へのアクセス、撮影・遅刻時の対応、チップの慣習など、当日に知っておきたいことを解説。",
  },
  {
    slug: "first-time-theatre",
    category: "onTheDay",
    eyebrow: "Your First Night",
    label: "初めての観劇・当日の流れ",
    blurb:
      "劇場に着いてから席を立つまでを時系列で。休憩で客席が空になる理由と、カーテンコールまでが本編だという話。",
  },
  {
    slug: "shows-without-english",
    category: "choosing",
    eyebrow: "Enjoying Without English",
    label: "英語がわからなくても楽しめる作品の選び方",
    blurb:
      "英語力そのものより、作品の形式と予習で決まります。歌中心か台詞中心かの見分け方と、前夜にやっておくこと。",
  },
  {
    slug: "theatre-with-kids",
    category: "choosing",
    eyebrow: "Theatre with Kids",
    label: "子連れ観劇ガイド",
    blurb:
      "年齢の目安の読み方、マチネと夜公演の選び方、上演時間と座席。子どもと行くときだけ判断基準が変わります。",
  },
];

export function guidePath(slug: string) {
  return `${MUSICALS_BASE}/${slug}`;
}

export function getGuideMeta(slug: string) {
  return guides.find((g) => g.slug === slug) ?? null;
}

export function guidesByCategory(category: MusicalGuideCategory) {
  return guides.filter((g) => g.category === category);
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は必ず自分の実URLを指す。
 */
export function buildMetadata(article: MusicalGuideArticle) {
  return buildPageMetadata({
    path: guidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function breadcrumbJsonLd(article: MusicalGuideArticle) {
  const meta = getGuideMeta(article.slug);

  return breadcrumbListJsonLd({
    path: "/musicals",
    current: meta?.label ?? article.title,
    currentHref: guidePath(article.slug),
  });
}

export function articleJsonLd(article: MusicalGuideArticle) {
  const url = `${SITE_URL}${guidePath(article.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.description,
    inLanguage: "ja",
    mainEntityOfPage: url,
    dateModified: article.updatedAt,
    author: MUSICALS_PUBLISHER,
    publisher: MUSICALS_PUBLISHER,
  };
}

/**
 * FAQ を構造化データに出す。
 *
 * answer は markdown を含みうるので、記法を落としてから渡すこと。
 * 太字の ** がそのまま検索結果に出ると読めない。
 */
export function faqPageJsonLd(
  faq: { question: string; answer: string }[],
  pageUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripInlineMarkdown(item.answer),
      },
    })),
  };
}

/** JSON-LD に出す前に markdown の装飾を落とす。 */
export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\[(.+?)\]\((.+?)\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

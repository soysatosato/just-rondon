import type { CaseStoryArticle } from "./types";

export const SITE_URL = "https://www.just-rondon.com";
export const CASE_STORY_BASE = "/jobs/service-charges/case-story";

export type Chapter = {
  slug: string;
  label: string;
  blurb: string;
  kind: "story" | "tool";
};

/**
 * 章の並び。next-sitemap.config.js の staticPages と一致させること。
 * インデックス・前後ナビ・パンくず・JSON-LD がすべてここを参照する。
 */
export const chapters: Chapter[] = [
  {
    slug: "background",
    label: "何が問題だったのか",
    blurb:
      "12.5%のサービスチャージが客から徴収される一方、実際に還元されていた額との差。争点になった事実関係を整理します。",
    kind: "story",
  },
  {
    slug: "acas-early-conciliation",
    label: "Acas Early Conciliation",
    blurb:
      "Tribunalへ進む前に必ず通る手続き。Acasは味方ではなく中立機関である、という前提から始まります。",
    kind: "story",
  },
  {
    slug: "et1-filing",
    label: "ET1を提出する",
    blurb:
      "正式な申立て。期限、請求内容の書き方、求める救済、そして通訳の希望をどう書いたか。",
    kind: "story",
  },
  {
    slug: "tribunal-correspondence",
    label: "証拠提出と相手方とのやり取り",
    blurb:
      "証拠バンドルの作り方、送達の落とし穴、「受け取っていない」と言われたときの対応。",
    kind: "story",
  },
  {
    slug: "default-judgment",
    label: "答弁なし・審理・判決",
    blurb:
      "答弁書が出ないとどうなるか。誤った通知への対処、オンライン審理、そして£4,007.55の判決。",
    kind: "story",
  },
  {
    slug: "high-court-enforcement",
    label: "勝っても払われないとき",
    blurb:
      "判決は自動では支払われない。High Courtのwritへの移行、執行費用、相手方の抵抗、そして回収まで。",
    kind: "story",
  },
  {
    slug: "check-your-service-charge",
    label: "自分の未払い額を計算する",
    blurb:
      "実際に裁判所に認容された計算方法を、そのまま自分のケースに当てはめる手順。",
    kind: "tool",
  },
  {
    slug: "how-to-file-a-claim",
    label: "申立ての進め方（まとめ）",
    blurb:
      "全体フロー、各段階の期限、費用、提出物チェックリスト、そしてやってはいけないこと。",
    kind: "tool",
  },
  {
    slug: "resources-and-links",
    label: "参考リンク集",
    blurb:
      "Acas、gov.uk、Tipping Act、ET1フォーム、公開判決検索。何がどこに書いてあるか。",
    kind: "tool",
  },
];

export function chapterPath(slug: string) {
  return `${CASE_STORY_BASE}/${slug}`;
}

export function getChapterIndex(slug: string) {
  return chapters.findIndex((c) => c.slug === slug);
}

export function getNeighbours(slug: string) {
  const i = getChapterIndex(slug);
  return {
    prev: i > 0 ? chapters[i - 1] : null,
    next: i >= 0 && i < chapters.length - 1 ? chapters[i + 1] : null,
  };
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は必ず自分の実URLを指す。
 */
export function buildMetadata(article: CaseStoryArticle) {
  const url = `${SITE_URL}${chapterPath(article.slug)}`;

  return {
    title: `${article.title} | ジャスト・ロンドン`,
    description: article.description,
    keywords: article.keywords,
    robots: { index: true, follow: true },
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      siteName: "ジャスト・ロンドン｜英国生活・法律ガイド",
      locale: "ja_JP",
      type: "article" as const,
    },
  };
}

export function breadcrumbJsonLd(article: CaseStoryArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "サービスチャージ",
        item: `${SITE_URL}/jobs/service-charges`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "サービスチャージ未払いの記録",
        item: `${SITE_URL}${CASE_STORY_BASE}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: `${SITE_URL}${chapterPath(article.slug)}`,
      },
    ],
  };
}

export function articleJsonLd(article: CaseStoryArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    inLanguage: "ja",
    isPartOf: {
      "@type": "Article",
      name: "サービスチャージ未払いの記録",
      url: `${SITE_URL}${CASE_STORY_BASE}`,
    },
    mainEntityOfPage: `${SITE_URL}${chapterPath(article.slug)}`,
    publisher: {
      "@type": "Organization",
      name: "ジャスト・ロンドン",
      url: SITE_URL,
    },
  };
}

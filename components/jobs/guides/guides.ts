import type { JobGuideArticle } from "./types";

import { SITE_URL, buildPageMetadata } from "@/lib/seo";
export { SITE_URL };
export const JOBS_BASE = "/jobs";

export type GuideMeta = {
  slug: string;
  label: string;
  blurb: string;
};

/**
 * ガイド記事の並び。next-sitemap.config.js の staticPages、
 * および /jobs トップページのカード表示順と一致させること。
 */
export const guides: GuideMeta[] = [
  {
    slug: "minimum-wage",
    label: "最低賃金・給与明細の見方",
    blurb:
      "National Living Wage・National Minimum Wageの最新レート、給与明細（payslip）のチェック方法、不当な天引きの見分け方。",
  },
  {
    slug: "employment-contract",
    label: "労働契約・就業規則の基本",
    blurb:
      "雇用開始日に受け取るべきwritten statementの中身、試用期間の注意点、解雇・退職時に確認すべきこと。",
  },
  {
    slug: "visa-and-work",
    label: "ビザと就労の接点",
    blurb:
      "学生ビザ・Graduateビザで働ける範囲、Skilled Workerスポンサーへの切り替え、違反した場合のリスク。",
  },
  {
    slug: "workplace-harassment",
    label: "ハラスメント・職場トラブルの相談先",
    blurb:
      "Equality Act 2010が守る範囲、2024年10月に始まった雇用主のセクハラ防止義務、Acas・Citizens Adviceの使い方。",
  },
  {
    slug: "workplace-pension",
    label: "職場年金（Nest）の仕組みと脱退方法",
    blurb:
      "知らないうちにPayslipから引かれる年金の正体、返金される1か月の期限、電話・オンラインでの具体的な脱退手順、期限を過ぎた場合の選択肢。",
  },
];

export function guidePath(slug: string) {
  return `${JOBS_BASE}/${slug}`;
}

export function getGuideMeta(slug: string) {
  return guides.find((g) => g.slug === slug) ?? null;
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は必ず自分の実URLを指す。
 */
export function buildMetadata(article: JobGuideArticle) {
  return buildPageMetadata({
    path: guidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
  });
}

export function breadcrumbJsonLd(article: JobGuideArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ホーム", item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: "お仕事・労働問題",
        item: `${SITE_URL}${JOBS_BASE}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `${SITE_URL}${guidePath(article.slug)}`,
      },
    ],
  };
}

export function articleJsonLd(article: JobGuideArticle) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    inLanguage: "ja",
    mainEntityOfPage: `${SITE_URL}${guidePath(article.slug)}`,
    dateModified: article.updatedAt,
    publisher: {
      "@type": "Organization",
      name: "ジャスト・ロンドン",
      url: SITE_URL,
    },
  };
}

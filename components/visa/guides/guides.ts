import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import type { VisaGuideArticle } from "./types";

export { SITE_URL };

export const VISA_BASE = "/visa";
export const VISA_SECTION_NAME = "ビザガイド";

/**
 * ハブでの分類。読者が自分の状況を選ぶときの語彙に合わせる。
 * 「短期」「働く」「学ぶ」「家族」「渡英後」以外は増やさないこと。
 * カテゴリが増えるほど、読者は自分がどれかを判断できなくなる。
 */
export type VisaCategory = "short" | "work" | "study" | "family" | "after";

export const VISA_CATEGORY_LABELS: Record<VisaCategory, string> = {
  short: "短期で訪れる",
  work: "働く",
  study: "学ぶ",
  family: "家族と暮らす",
  after: "渡英後の手続き",
};

export type VisaGuideMeta = {
  slug: string;
  category: VisaCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
  /**
   * サイト外(/sightseeing 配下など)に本体がある記事はここに実パスを持つ。
   * ETA だけは旅行ガイドとして先に書かれており、旅程を立てる読者の
   * 導線上そこに置いたままの方が自然なので、ビザ側からは参照だけする。
   */
  externalPath?: string;
};

/**
 * ビザガイドの並び。「短期 → 働く → 学ぶ → 家族 → 渡英後」＝滞在の長さ順。
 *
 * 先頭が ETA なのは、日本国籍の読者の圧倒的多数が観光客であり、
 * かつ「無いと出発できない」唯一の手続きだから。
 *
 * next-sitemap.config.js の staticPages と、/visa ハブのカード表示順を
 * このリストと一致させること。
 */
export const visaGuides: VisaGuideMeta[] = [
  {
    slug: "eta-uk-visa-guide",
    category: "short",
    eyebrow: "Before You Fly",
    label: "ETA（電子渡航認証）申請ガイド",
    blurb:
      "観光・短期出張なら、まずこれ。日本国籍も取得必須で、無いと日本の空港で搭乗を断られます。申請は10分・£20。英語しかないアプリ画面の日本語対訳つき。",
    externalPath: "/sightseeing/eta-uk-visa-guide",
  },
  {
    slug: "uk-visa-guide",
    category: "short",
    eyebrow: "Overview",
    label: "英国ビザ全ルート比較",
    blurb:
      "自分がどのビザに該当するのかを、目的・期間・年齢から絞り込みます。日本人が実際に使う9ルートの費用・滞在期間・永住までの距離を一覧で比較。",
  },
  {
    slug: "youth-mobility-scheme",
    category: "work",
    eyebrow: "Working Holiday",
    label: "YMS（ワーホリ）申請ガイド",
    blurb:
      "18〜30歳なら、スポンサーなしで最長2年働ける唯一のルート。日本枠は年6,000人・抽選なし。却下の最大要因である「£2,530を28日間」の証明方法を実務レベルで解説。",
  },
  {
    slug: "skilled-worker",
    category: "work",
    eyebrow: "Sponsored Work",
    label: "Skilled Worker（就労ビザ）ガイド",
    blurb:
      "2025年7月に学士相当（RQF6）へ引き上げられ、約180職種が対象外になりました。今も取れる職種、年収£41,700の壁、スポンサー企業の探し方まで。",
  },
  {
    slug: "global-talent",
    category: "work",
    eyebrow: "No Sponsor Needed",
    label: "Global Talent（卓越人材ビザ）ガイド",
    blurb:
      "研究者・アーティスト・技術者向け。雇用主のスポンサーが要らず、最短3年で永住権に届く、日本人に最も過小評価されているルートです。",
  },
  {
    slug: "student",
    category: "study",
    eyebrow: "Study & After",
    label: "Student／Graduate ビザガイド",
    blurb:
      "CAS の取り方、維持費の証明額、就労できる週20時間の正確な数え方。卒業後のGraduateビザは2027年1月申請分から18ヶ月に短縮されます。",
  },
  {
    slug: "family",
    category: "family",
    eyebrow: "Partner & Family",
    label: "家族・配偶者ビザガイド",
    blurb:
      "英国人・定住者の配偶者として暮らすためのルート。最低所得£29,000の証明方法、貯蓄£88,500での代替、関係の真実性をどう立証するか。",
  },
  {
    slug: "after-arrival",
    category: "after",
    eyebrow: "After You Land",
    label: "渡英後の手続きガイド",
    blurb:
      "ビザが下りて終わりではありません。UKVIアカウント、share code、NINo、GP登録、銀行口座。パスポート更新時の旅券番号更新を怠ると搭乗拒否されます。",
  },
];

export function visaGuidePath(slug: string) {
  const meta = visaGuides.find((g) => g.slug === slug);
  return meta?.externalPath ?? `${VISA_BASE}/${slug}`;
}

export function getVisaGuideMeta(slug: string) {
  return visaGuides.find((g) => g.slug === slug) ?? null;
}

/** /visa/[slug] が実際に生成するページ。externalPath を持つものは除く。 */
export const visaGuideSlugs = visaGuides
  .filter((g) => !g.externalPath)
  .map((g) => g.slug);

export function visaGuidesByCategory(category: VisaCategory) {
  return visaGuides.filter((g) => g.category === category);
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildVisaGuideMetadata(article: VisaGuideArticle) {
  return buildPageMetadata({
    path: visaGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function visaGuideBreadcrumbJsonLd(article: VisaGuideArticle) {
  const meta = getVisaGuideMeta(article.slug);
  return breadcrumbJsonLd(
    { name: VISA_SECTION_NAME, path: VISA_BASE },
    [
      {
        name: meta?.label ?? article.title,
        path: visaGuidePath(article.slug),
      },
    ]
  );
}

export function visaGuideArticleJsonLd(article: VisaGuideArticle) {
  const url = `${SITE_URL}${visaGuidePath(article.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: article.title,
    description: article.description,
    inLanguage: "ja",
    mainEntityOfPage: url,
    dateModified: article.updatedAt,
    author: SITE_PUBLISHER,
    publisher: SITE_PUBLISHER,
  };
}

/** /visa ハブが持つガイド記事の一覧を CollectionPage として出す。 */
export function visaHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${VISA_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    hasPart: visaGuides.map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${visaGuidePath(g.slug)}`,
    })),
  };
}

import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import type { HealthGuideArticle } from "./types";

export { SITE_URL };

export const HEALTH_BASE = "/health";
export const HEALTH_SECTION_NAME = "医療・NHS";

/**
 * ハブでの分類。読者が医療に触れる順番に合わせる。
 * 「備える → かかる → 払う」以外は増やさないこと。
 *
 * 救急を独立させないのは、緊急時に目次から探させないため。
 * 救急は「かかる」の先頭に置き、ハブでも最上部に固定で出す。
 */
export type HealthCategory = "prepare" | "access" | "cost";

export const HEALTH_CATEGORY_LABELS: Record<HealthCategory, string> = {
  prepare: "渡英前・渡英直後に備える",
  access: "実際にかかる",
  cost: "お金と自己負担",
};

export type HealthGuideMeta = {
  slug: string;
  category: HealthCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * 医療ガイドの並び。「備える → かかる → 払う」＝読者が実際に踏む順。
 *
 * 先頭が GP 登録なのは、英国の医療がすべて GP を入口に設計されており、
 * 登録していないと専門医にも検査にも到達できないから。
 * IHS(お金)の話を先に置くと、「まだ体調も崩していないのに保険料の話」で離脱する。
 *
 * next-sitemap.config.js の staticPages と、/health ハブのカード表示順を
 * このリストと一致させること。
 */
export const healthGuides: HealthGuideMeta[] = [
  {
    slug: "gp-registration",
    category: "prepare",
    eyebrow: "GP Registration",
    label: "GP に登録する（英国医療の入口）",
    blurb:
      "身分証も住所証明も在留資格の証明も要りません。これは親切ではなく NHS の規則です。オンライン10〜15分で終わる手順と、断られたときに電話する先まで。",
  },
  {
    slug: "ihs-and-entitlement",
    category: "prepare",
    eyebrow: "IHS",
    label: "IHS と、自分がどこまで無料か",
    blurb:
      "ビザ申請時に払ったあの数十万円が医療費の正体です。払った人は GP も A&E も無料。逆に短期滞在の旅行者は有料になる線引きを、はっきりさせます。",
  },
  {
    slug: "when-you-are-ill",
    category: "access",
    eyebrow: "111 or 999",
    label: "体調を崩したとき、どこに行くか",
    blurb:
      "救急車か我慢かの二択ではありません。間に 111 があります。24時間・無料・通訳つき。A&E で6時間待つ前に、この番号を知っているかで結果が変わります。",
  },
  {
    slug: "pharmacy-and-prescriptions",
    category: "access",
    eyebrow: "Pharmacy",
    label: "薬局で買う・処方箋を受け取る",
    blurb:
      "軽い不調なら GP を待たず薬局で解決します。Pharmacy First で薬剤師が抗生物質まで出せる範囲と、日本の市販薬に当たる棚の見つけ方。",
  },
  {
    slug: "dentist-and-optician",
    category: "cost",
    eyebrow: "Dental & Eyes",
    label: "歯科と眼科は別枠（ここだけ高い）",
    blurb:
      "NHS の歯科は定額3段階ですが、そもそも新規患者を受け付ける診療所がほとんどありません。一時帰国で治すという選択が現実解になる理由と、その損得。",
  },
  {
    slug: "prescription-costs",
    category: "cost",
    eyebrow: "Prescription Costs",
    label: "処方箋料を下げる（PPC の損益分岐）",
    blurb:
      "1品目£9.90は「1回」ではなく「1品目」。年12品目を超えるなら前払い証で頭打ちにできます。無料になる条件と、イングランド以外なら全部無料という話。",
  },
];

export function healthGuidePath(slug: string) {
  return `${HEALTH_BASE}/${slug}`;
}

export function getHealthGuideMeta(slug: string) {
  return healthGuides.find((g) => g.slug === slug) ?? null;
}

/** /health/[slug] が実際に生成するページ。 */
export const healthGuideSlugs = healthGuides.map((g) => g.slug);

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildHealthGuideMetadata(article: HealthGuideArticle) {
  return buildPageMetadata({
    path: healthGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function healthGuideBreadcrumbJsonLd(article: HealthGuideArticle) {
  const meta = getHealthGuideMeta(article.slug);
  return breadcrumbJsonLd({ name: HEALTH_SECTION_NAME, path: HEALTH_BASE }, [
    {
      name: meta?.label ?? article.title,
      path: healthGuidePath(article.slug),
    },
  ]);
}

export function healthGuideArticleJsonLd(article: HealthGuideArticle) {
  const url = `${SITE_URL}${healthGuidePath(article.slug)}`;

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

/** /health ハブが持つガイド記事の一覧を CollectionPage として出す。 */
export function healthHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${HEALTH_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    hasPart: healthGuides.map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${healthGuidePath(g.slug)}`,
    })),
  };
}

import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import type { MoneyGuideArticle } from "./types";

export { SITE_URL };

export const MONEY_BASE = "/money";
export const MONEY_SECTION_NAME = "お金・銀行";

/**
 * ハブでの分類。渡英直後に金が動く順に合わせる。
 * 「口座を開く → 日本から持ってくる → 英国で受け取る」以外は増やさないこと。
 */
export type MoneyCategory = "account" | "transfer" | "earning";

export const MONEY_CATEGORY_LABELS: Record<MoneyCategory, string> = {
  account: "口座を開く",
  transfer: "日本から送る",
  earning: "英国で受け取る",
};

export const MONEY_CATEGORY_ORDER: MoneyCategory[] = [
  "account",
  "transfer",
  "earning",
];

export type MoneyGuideMeta = {
  slug: string;
  category: MoneyCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * お金ガイドの並び。「口座 → 送金 → 受け取り」＝渡英直後に金が動く順。
 *
 * 先頭が口座開設なのは、口座がないと家も借りられず給与も受け取れないため、
 * 渡英直後のボトルネックが例外なくここに来るから。送金の話を先に置いても、
 * 受け皿の口座がなければ実行できない。
 *
 * next-sitemap.config.js の staticPages と、/money ハブのカード表示順を
 * このリストと一致させること。
 */
export const moneyGuides: MoneyGuideMeta[] = [
  {
    slug: "opening-an-account",
    category: "account",
    eyebrow: "Open an Account",
    label: "渡英直後に開ける口座はどれか",
    blurb:
      "住所証明を求められて詰まるのが定番の失敗です。Monzo と Starling はそれを要求しません。パスポートと eVisa のシェアコードだけで、数分から数日で開きます。",
  },
  {
    slug: "passing-the-checks",
    category: "account",
    eyebrow: "Passing the Checks",
    label: "「審査が通りやすい」の正体",
    blurb:
      "落ちる原因は信用スコアではなく、ほぼ住所証明です。卵と鶏の循環をどこで断つか、住所証明として実際に通る書類は何か、落ちたあとに何を変えて出し直すか。",
  },
  {
    slug: "choosing-a-bank",
    category: "account",
    eyebrow: "Which Bank",
    label: "銀行の選び方（アプリ銀行と高街銀行）",
    blurb:
      "結論から言えば、1本目はアプリ銀行、高街銀行は必要になってからで間に合います。FSCS の£85,000保護の有無と、給与振込を置くべき口座の判断。",
  },
  {
    slug: "sending-money-from-japan",
    category: "transfer",
    eyebrow: "Remittance",
    label: "日本から送金する（手数料の本当の内訳）",
    blurb:
      "「手数料無料」の送金ほど高いことがあります。取られているのは為替の上乗せだからです。Wise・Revolut・銀行送金の総コストを、同じ物差しで比較します。",
  },
  {
    slug: "national-insurance-number",
    category: "earning",
    eyebrow: "NI Number",
    label: "National Insurance number を取る",
    blurb:
      "「NIN がないと働けない」は誤解です。就労権があれば初日から働けます。届くまで2〜6週間かかるので、待つ必要がないことを知っているかで収入開始が1ヶ月変わります。",
  },
];

export function moneyGuidePath(slug: string) {
  return `${MONEY_BASE}/${slug}`;
}

export function getMoneyGuideMeta(slug: string) {
  return moneyGuides.find((g) => g.slug === slug) ?? null;
}

/** /money/[slug] が実際に生成するページ。 */
export const moneyGuideSlugs = moneyGuides.map((g) => g.slug);

export function moneyGuidesByCategory(category: MoneyCategory) {
  return moneyGuides.filter((g) => g.category === category);
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildMoneyGuideMetadata(article: MoneyGuideArticle) {
  return buildPageMetadata({
    path: moneyGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function moneyGuideBreadcrumbJsonLd(article: MoneyGuideArticle) {
  const meta = getMoneyGuideMeta(article.slug);
  return breadcrumbJsonLd({ name: MONEY_SECTION_NAME, path: MONEY_BASE }, [
    {
      name: meta?.label ?? article.title,
      path: moneyGuidePath(article.slug),
    },
  ]);
}

export function moneyGuideArticleJsonLd(article: MoneyGuideArticle) {
  const url = `${SITE_URL}${moneyGuidePath(article.slug)}`;

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

/** /money ハブが持つガイド記事の一覧を CollectionPage として出す。 */
export function moneyHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${MONEY_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    hasPart: moneyGuides.map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${moneyGuidePath(g.slug)}`,
    })),
  };
}

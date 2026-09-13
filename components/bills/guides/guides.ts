import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import type { BillsGuideArticle } from "./types";

export { SITE_URL };

export const BILLS_BASE = "/bills";
export const BILLS_SECTION_NAME = "光熱費・生活の契約";

/**
 * ハブでの分類。家賃の外で毎月出ていくお金を、性質で3つに分ける。
 * 「家賃と比べる → 住まいにかかる → つなぐ」以外は増やさないこと。
 *
 * 「住まいにかかる」の4本は、入居した瞬間に発生し、自分で止められない。
 * 「つなぐ」の2本は、自分で選んで契約するもの。
 * 選べるかどうかで読者のやることが変わるので、そこで分けている。
 */
export type BillsCategory = "rent" | "home" | "connect";

export const BILLS_CATEGORY_LABELS: Record<BillsCategory, string> = {
  rent: "家賃と比べる",
  home: "住まいにかかる",
  connect: "つなぐ",
};

export type BillsGuideMeta = {
  slug: string;
  category: BillsCategory;
  /** 英語ラベル。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * 光熱費ガイドの並び。
 *
 * 先頭が「bills included」なのは、この単語を最初に目にするのが
 * 契約前の物件広告だから。ここで含まれる項目を知らないまま契約すると、
 * 残り6本の請求が「思っていなかった出費」として届く。
 *
 * Council Tax を「住まいにかかる」の先頭に置くのは、額が最も大きく、
 * 登録を忘れたときの請求の遡り方が最も痛いから。
 *
 * next-sitemap.config.js の staticPages と、/bills ハブのカード表示順を
 * このリストと一致させること。
 */
export const billsGuides: BillsGuideMeta[] = [
  {
    slug: "bills-included",
    category: "rent",
    eyebrow: "Bills Included",
    label: "「bills included」の中身と家賃の比べ方",
    blurb:
      "法律上の定義はなく、何が入るかは物件ごとに違います。council tax・ガス電気・水道・ネット・TV licence の5項目を1つずつ確かめ、含まれない分を足してから比べます。",
  },
  {
    slug: "council-tax",
    category: "home",
    eyebrow: "Council Tax",
    label: "Council Tax とは（払う人・金額・割引）",
    blurb:
      "家に住む人にかかる地方税で、収入ではなく1991年の物件評価で決まります。一人暮らしは25%引き、全員フルタイム学生なら免除。区に登録しないと、後からまとめて請求されます。",
  },
  {
    slug: "energy",
    category: "home",
    eyebrow: "Gas & Electricity",
    label: "ガス・電気（入居日のメーターと price cap）",
    blurb:
      "入居した時点で契約はもうあります。最初の仕事はメーターを撮ること。price cap は請求額の上限ではなく単価の上限なので、基本料金だけで毎月いくらかかるかを先に知っておきます。",
  },
  {
    slug: "water",
    category: "home",
    eyebrow: "Water",
    label: "水道（Thames Water と請求の決まり方）",
    blurb:
      "水道会社は選べません。ロンドンの大半は Thames Water です。メーターの有無で請求の決まり方が変わり、一人暮らしでメーターがない家は、使っていない水の分まで払っていることがあります。",
  },
  {
    slug: "tv-licence",
    category: "home",
    eyebrow: "TV Licence",
    label: "TV Licence は必要か",
    blurb:
      "テレビを持っているかではなく、何を見るかで決まります。放送中の番組と BBC iPlayer は必要、Netflix のオンデマンドだけなら不要。要らない人は、届く手紙に申告で答えれば止まります。",
  },
  {
    slug: "broadband",
    category: "connect",
    eyebrow: "Broadband",
    label: "ネット回線（入居前に申し込む理由）",
    blurb:
      "開通には時間がかかるので、入居してから探すと数週間ネットのない生活になります。18〜24か月契約の途中の値上げは、いつ結んだ契約かで扱いが変わります。",
  },
  {
    slug: "mobile",
    category: "connect",
    eyebrow: "Mobile",
    label: "携帯の契約（最初は SIM only から）",
    blurb:
      "英国の電話番号がないと、銀行アプリも物件サイトも先に進みません。本体込みの24か月契約は信用審査で落ちやすいので、渡英直後は審査の軽い SIM only で番号を確保します。",
  },
];

export function billsGuidePath(slug: string) {
  return `${BILLS_BASE}/${slug}`;
}

export function getBillsGuideMeta(slug: string) {
  return billsGuides.find((g) => g.slug === slug) ?? null;
}

/** /bills/[slug] が実際に生成するページ。 */
export const billsGuideSlugs = billsGuides.map((g) => g.slug);

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildBillsGuideMetadata(article: BillsGuideArticle) {
  return buildPageMetadata({
    path: billsGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function billsGuideBreadcrumbJsonLd(article: BillsGuideArticle) {
  const meta = getBillsGuideMeta(article.slug);
  return breadcrumbJsonLd({ name: BILLS_SECTION_NAME, path: BILLS_BASE }, [
    {
      name: meta?.label ?? article.title,
      path: billsGuidePath(article.slug),
    },
  ]);
}

export function billsGuideArticleJsonLd(article: BillsGuideArticle) {
  const url = `${SITE_URL}${billsGuidePath(article.slug)}`;

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

/** /bills ハブが持つガイド記事の一覧を CollectionPage として出す。 */
export function billsHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${BILLS_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    hasPart: billsGuides.map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${billsGuidePath(g.slug)}`,
    })),
  };
}

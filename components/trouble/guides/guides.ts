import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import type { TroubleGuideArticle } from "./types";

export { SITE_URL };

export const TROUBLE_BASE = "/trouble";
export const TROUBLE_SECTION_NAME = "トラブル対応";

/**
 * ハブでの分類。読者が「何が起きたか」で選べる形にする。
 *
 * 制度別(警察・保険・大使館)ではなく被害別で切るのが要点。
 * 被害直後の人は「これは警察の管轄か保険の管轄か」を判断できない。
 * 判断できないことを読者に要求しない分類にする。
 *
 * 「盗まれた・失くした」を先頭に置くのは、件数が最も多く、
 * かつ時間制約が最もきついから(カード停止は分単位で効く)。
 */
export type TroubleCategory = "loss" | "harm" | "procedure";

export const TROUBLE_CATEGORY_LABELS: Record<TroubleCategory, string> = {
  loss: "盗まれた・失くした",
  harm: "被害に遭った",
  procedure: "届出とお金の手続き",
};

export const TROUBLE_CATEGORY_ORDER: TroubleCategory[] = [
  "loss",
  "harm",
  "procedure",
];

export type TroubleGuideMeta = {
  slug: string;
  category: TroubleCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * トラブル対応ガイドの並び。「起きたこと → 届け出る → 取り戻す」の順。
 *
 * 先頭がスリ・ひったくりなのは、ロンドンで日本人が遭う被害の最多件数であり、
 * かつ対応の時間制約が最もきついため(カード停止が遅れるほど被害が増える)。
 * パスポート紛失を2番目に置くのは、帰国という締切があるぶん焦りが大きく、
 * かつ警察の届出証明が前提になるので police-report への導線が要るから。
 *
 * next-sitemap.config.js の staticPages と、/trouble ハブのカード表示順を
 * このリストと一致させること。
 *
 * 全8本で完結。追加するときはこのリストに足し、
 * sitemap とハブの順序も同時に更新する。
 *
 * stalking-harassment だけは記事の設計が他と違う(安全の確保が手続きより先)。
 * 詳細は content/stalking-harassment.ts の冒頭コメントを参照。
 */
export const troubleGuides: TroubleGuideMeta[] = [
  {
    slug: "pickpocket",
    category: "loss",
    eyebrow: "Theft",
    label: "スリ・ひったくりに遭った直後にやること",
    blurb:
      "最初の30分で決まります。カードを止める順番、スマホを遠隔ロックする手順、そして絶対にやってはいけない「位置情報を頼りに自分で取り返しに行く」こと。",
  },
  {
    slug: "lost-passport",
    category: "loss",
    eyebrow: "Passport",
    label: "パスポートを失くした・盗まれた",
    blurb:
      "帰国できなくなるわけではありません。警察の届出証明を取り、大使館で「帰国のための渡航書」を出してもらう道があります。必要書類と順番を、締切から逆算して。",
  },
  {
    slug: "lost-property",
    category: "loss",
    eyebrow: "Lost Property",
    label: "落とし物を探す（地下鉄・バス・タクシー）",
    blurb:
      "盗まれたのではなく置き忘れたなら、探す場所は警察ではありません。TfL の遺失物センターは保管3ヶ月。バスは最初の3日だけ営業所に直接聞くほうが早い、という分岐まで。",
  },
  {
    slug: "stalking-harassment",
    category: "harm",
    eyebrow: "Stalking",
    label: "つきまとい・ストーカー被害に遭ったら",
    blurb:
      "我慢して耐えるものではありません。通報するか決める前から相談できる専門窓口があります。声を出せないまま999を呼ぶ方法と、安全を確保してから記録を取る順番。",
  },
  {
    slug: "scams",
    category: "harm",
    eyebrow: "Scams",
    label: "詐欺に遭ったら（銀行の返金義務）",
    blurb:
      "自分で振り込んでしまっても、諦めるのはまだ早い。2024年10月から銀行に返金義務が課されました。上限£85,000。そして159という、知らないと損をする番号の話。",
  },
  {
    slug: "police-report",
    category: "procedure",
    eyebrow: "Crime Reference",
    label: "警察に届け出る（crime reference number）",
    blurb:
      "物が戻らなくても届け出る理由があります。保険請求も、大使館の渡航書も、この番号がないと進みません。999 と 101 とオンラインの使い分けを、はっきりさせます。",
  },
  {
    slug: "insurance-claim",
    category: "procedure",
    eyebrow: "Insurance",
    label: "保険に請求する（旅行保険・カード付帯）",
    blurb:
      "請求が通らない理由は、補償の中身ではなく手続きの順番にあります。受理番号を待つと期限を過ぎる、という落とし穴と、免責額を先に計算すべき理由。",
  },
  {
    slug: "embassy",
    category: "procedure",
    eyebrow: "Embassy",
    label: "大使館にできること・できないこと",
    blurb:
      "パスポートの発給と領事面会はできます。弁護士費用の負担と裁判の通訳はできません。線を先に知っておくほうが、いざというとき確実に頼れます。",
  },
];

export function troubleGuidePath(slug: string) {
  return `${TROUBLE_BASE}/${slug}`;
}

export function getTroubleGuideMeta(slug: string) {
  return troubleGuides.find((g) => g.slug === slug) ?? null;
}

/** /trouble/[slug] が実際に生成するページ。 */
export const troubleGuideSlugs = troubleGuides.map((g) => g.slug);

export function troubleGuidesByCategory(category: TroubleCategory) {
  return troubleGuides.filter((g) => g.category === category);
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildTroubleGuideMetadata(article: TroubleGuideArticle) {
  return buildPageMetadata({
    path: troubleGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function troubleGuideBreadcrumbJsonLd(article: TroubleGuideArticle) {
  const meta = getTroubleGuideMeta(article.slug);
  return breadcrumbJsonLd({ name: TROUBLE_SECTION_NAME, path: TROUBLE_BASE }, [
    {
      name: meta?.label ?? article.title,
      path: troubleGuidePath(article.slug),
    },
  ]);
}

export function troubleGuideArticleJsonLd(article: TroubleGuideArticle) {
  const url = `${SITE_URL}${troubleGuidePath(article.slug)}`;

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

/** /trouble ハブが持つガイド記事の一覧を CollectionPage として出す。 */
export function troubleHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${TROUBLE_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    hasPart: troubleGuides.map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${troubleGuidePath(g.slug)}`,
    })),
  };
}

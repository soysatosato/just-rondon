import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import {
  SIGHTSEEING_BASE,
  SIGHTSEEING_PUBLISHER,
  sightseeingBreadcrumbJsonLd,
} from "../jsonld";
/**
 * metadata と JSON-LD を組み立てるのに要る最小限のフィールド。
 *
 * 旅行ガイド8本はいずれも markdown の記事オブジェクトをやめ、
 * それぞれ専用の構造化データ(components/sightseeing/guides/<slug>/)に
 * 移した。共通で要るのはここに並ぶ5つだけなので、ヘルパーの引数も
 * 実際に読む範囲に絞ってある。各ガイドはこれを満たす meta を持つ。
 */
export type TravelGuideMetaSource = {
  /**
   * URL の末尾。子ページは `itinerary/rainy-day` のように
   * 親 slug からの相対パスをスラッシュ区切りで持つ。
   * travelGuidePath() がそのまま /sightseeing に連結する。
   */
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  /** ISO日付(YYYY-MM-DD)。Article.dateModified と og:modified_time に使う。 */
  updatedAt: string;
};

export { SITE_URL, SIGHTSEEING_BASE };

/**
 * 全記事共通の基準時点と更新日。
 *
 * 記事ごとに散らすと、1本だけ直して他が古いまま残る。実際この方式に
 * するまで、同じ内容の旅行ガイドに3種類の更新日が並んでいた。
 * ETA の料金や開館情報を触ったら、ここを1行直す。
 */
export const TRAVEL_GUIDE_AS_OF = "2026年8月";
export const TRAVEL_GUIDE_UPDATED_AT = "2026-08-13";

export type TravelGuideMeta = {
  slug: string;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * 旅行ガイドの並び。
 * 「渡航資格 → 旅程 → 宿 → 移動 → 予算 → 支払い → 実用情報 → バリアフリー」
 * ＝旅行者の意思決定順。
 *
 * ETA を先頭に置いているのは、これだけが「無いと出発できない」手続きだから。
 * 旅程や宿を考える前に片付けてもらう。
 *
 * budget を宿・移動の後に置くのは、積算の材料(宿代・運賃)が
 * 先に決まっていないと予算の話ができないため。
 *
 * step-free だけは意思決定順から外れて末尾にある。必要な人には
 * 最初に読んでほしい記事だが、大多数には関係がなく、上に置くと
 * ほかのガイドが押し下げられるため。必要な人は検索で直接来る。
 *
 * next-sitemap.config.js の staticPages、/sightseeing ハブの
 * 「旅の準備」カード表示順と一致させること。
 *
 * transport だけは例外で、実体が1本の記事ではなく
 * /sightseeing/transport 配下のハブ(components/sightseeing/transport/)になっている。
 * このリストに残しているのは、/sightseeing ハブのカードと
 * 各ガイド末尾の相互リンクに出したいから。
 */
export const travelGuides: TravelGuideMeta[] = [
  {
    slug: "eta-uk-visa-guide",
    eyebrow: "Before You Fly",
    label: "ETA（英国電子渡航認証）申請ガイド",
    blurb:
      "日本国籍も取得必須。£20・10分で終わる申請を、英語しかないアプリ画面の日本語対訳付きで案内します。ICチップが読めない・自撮りが弾かれる時の対処法も。",
  },
  {
    slug: "itinerary",
    eyebrow: "Itineraries",
    label: "ロンドン モデルコース（1〜5日）",
    blurb:
      "初めてのロンドンで外さない王道ルートを1日目から5日目まで。滞在日数別の圧縮版に加えて、雨の日・子連れ・乗り継ぎ半日の分岐版を別ページで用意しています。",
  },
  {
    slug: "hotels",
    eyebrow: "Where to Stay",
    label: "宿泊エリア別ホテル選び",
    blurb:
      "ウェストミンスター、コヴェント・ガーデン、サウス・ケンジントンなど主要エリアを比較。宿のタイプ別の予算感と、日本人が驚くポイントも。",
  },
  {
    slug: "transport",
    eyebrow: "Getting Around",
    label: "ロンドンの交通ガイド（全9本）",
    blurb:
      "切符は買いません。運賃と上限額の仕組み、5空港からのアクセス、地下鉄・バス・シェアサイクル・タクシーの使い分け。在住者向けに定期券・自転車・車の話まで。",
  },
  {
    slug: "budget",
    eyebrow: "Budget",
    label: "ロンドン旅行の予算（7日間）",
    blurb:
      "「7日間でいくら」を宿・食・交通・入場に割って積算しました。節約・標準・ゆとりの3帯で1日あたりを出し、削って効く順番まで。航空券を除いた現地費用の話です。",
  },
  {
    slug: "tipping-and-payment",
    eyebrow: "Tipping & Paying",
    label: "チップと支払い",
    blurb:
      "チップは義務ではありません。service charge の外し方、JCBが使えない問題、円建て決済（DCC）を断る理由、両替で損をしない方法まで、払う側の実務を。",
  },
  {
    slug: "travel-tips",
    eyebrow: "Travel Tips",
    label: "ロンドン旅行の実用情報",
    blurb:
      "治安とスリ対策、旅行者のNHS利用と保険、eSIM、電源プラグ、季節ごとの服装、12月25日の全休まで。渡航前に押さえておきたいことを一気に。",
  },
  {
    slug: "step-free",
    eyebrow: "Step-free",
    label: "バリアフリーのロンドン",
    blurb:
      "地下鉄はエレベーターのない駅が大多数、一方でバスは全車両が低床。この落差を知っているかで1日が変わります。車椅子・ベビーカーで段差なく動くための原則。",
  },
];

export function travelGuidePath(slug: string) {
  return `${SIGHTSEEING_BASE}/${slug}`;
}

export function getTravelGuideMeta(slug: string) {
  return travelGuides.find((g) => g.slug === slug) ?? null;
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildTravelGuideMetadata(article: TravelGuideMetaSource) {
  return buildPageMetadata({
    path: travelGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

/**
 * 子ページ(例 itinerary/rainy-day)は親を1段挟んだパンくずにする。
 * parent を渡さなければ従来どおり 観光ガイド → 記事 の2段。
 */
export function travelGuideBreadcrumbJsonLd(
  article: Pick<TravelGuideMetaSource, "slug" | "title">,
  parent?: { name: string; slug: string }
) {
  const meta = getTravelGuideMeta(article.slug);
  const trail = parent
    ? [{ name: parent.name, path: travelGuidePath(parent.slug) }]
    : [];

  return sightseeingBreadcrumbJsonLd([
    ...trail,
    {
      name: meta?.label ?? article.title,
      path: travelGuidePath(article.slug),
    },
  ]);
}

export function travelGuideArticleJsonLd(article: TravelGuideMetaSource) {
  const url = `${SITE_URL}${travelGuidePath(article.slug)}`;

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

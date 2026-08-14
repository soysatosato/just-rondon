import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import type { BeyondArticle, BeyondTier } from "./types";

export { SITE_URL };

export const BEYOND_BASE = "/beyond-london";
export const BEYOND_SECTION_NAME = "Beyond London";

/**
 * ハブでの束ね方。
 *
 * 区分の基準は「ロンドン市内かどうか」ではなく(それはセクションに
 * 入る条件そのもの)、「泊まる必要があるか」だけ。
 * 読者が最初に決めるのがそこだから。
 *
 * rail は行き先ではなく移動の実務。カードの見た目も分ける。
 * ここに行き先を混ぜると、読者が BritRail Pass を地名だと誤読する。
 */
export type BeyondCategory = BeyondTier | "rail";

export const BEYOND_CATEGORY_LABELS: Record<BeyondCategory, string> = {
  rail: "ロンドンの外へ出る前に",
  dayTrip: "日帰りで行ける",
  weekender: "週末に1泊で行ける",
};

export const BEYOND_CATEGORY_BLURBS: Record<BeyondCategory, string> = {
  rail: "英国の鉄道は、同じ区間でも買い方で3〜4倍変わります。行き先を決める前に、切符の仕組みとパスの損得を片付けておくと、以降の判断がすべて速くなります。",
  dayTrip:
    "朝出て夜には宿に戻れる範囲。片道2時間以内で、宿の手配が要りません。ロンドン滞在を切らずに、もうひとつの英国を1日だけ見に行く選択肢です。",
  weekender:
    "日帰りでは削るものが多すぎる行き先。金曜の夜か土曜の朝に出て、日曜に戻る前提で組みます。",
};

export const BEYOND_CATEGORY_ORDER: BeyondCategory[] = [
  "rail",
  "dayTrip",
  "weekender",
];

export type BeyondMeta = {
  slug: string;
  category: BeyondCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  /** 州・地方名。行き先カードにだけ出す。 */
  county?: string;
  /** 片道の所要。行き先カードにだけ出す。 */
  journeyTime?: string;
  blurb: string;
};

/**
 * Beyond London の並び。
 *
 * 先頭が鉄道2本なのは、行き先を先に見せると読者が
 * 「当日、駅の窓口で買えばいい」と思ったまま出発するから。
 * 英国では当日券が Advance の3〜4倍になることがあり、
 * ここを知らずに動くと日帰り1回で数十ポンド損をする。
 *
 * 週末1泊圏(weekender)は所要時間の短い順ではなく、
 * ヨーク → エディンバラ → 湖水地方 → ペンザンスの順で並べる。
 * 最初の2つが同じ東海岸本線上にあり、読者が「ヨークで1泊して
 * さらに北へ」と続けて読めるため。ペンザンスを最後に置くのは、
 * 唯一の寝台列車という別枠の提案だから。
 *
 * next-sitemap.config.js の staticPages と、
 * /beyond-london ハブのカード表示順をこのリストと一致させること。
 */
export const beyondDestinations: BeyondMeta[] = [
  {
    slug: "britrail-pass",
    category: "rail",
    eyebrow: "BritRail Pass",
    label: "BritRail Pass は元が取れるのか",
    blurb:
      "日本の代理店が熱心に売っていますが、多くの旅程では元が取れません。英国の Advance 切符が安すぎるためです。買うべき条件と、買ってはいけない条件を数字で判定します。",
  },
  {
    slug: "windsor",
    category: "dayTrip",
    eyebrow: "Windsor",
    label: "ウィンザー",
    county: "バークシャー州",
    journeyTime: "約30分〜1時間",
    blurb:
      "現在も使われている世界最古の居住城。ロンドンから最も手軽な「王室の本物」で、半日で戻れます。ただしOyster圏外なので、切符の買い方だけ先に押さえてください。",
  },
  {
    slug: "oxford",
    category: "dayTrip",
    eyebrow: "Oxford",
    label: "オックスフォード",
    county: "オックスフォードシャー州",
    journeyTime: "約1時間",
    blurb:
      "英語圏最古の大学。ただしカレッジは学期中に見学が制限されるので、「行けば入れる」ではありません。行く前に見学可否を確認する手順まで。",
  },
  {
    slug: "cambridge",
    category: "dayTrip",
    eyebrow: "Cambridge",
    label: "ケンブリッジ",
    county: "ケンブリッジシャー州",
    journeyTime: "約1時間20分",
    blurb:
      "パント（平底舟）で川から眺めるカレッジ群。オックスフォードとどちらを選ぶかで迷う人が多いので、その判断基準から書きます。",
  },
  {
    slug: "bath-stonehenge",
    category: "dayTrip",
    eyebrow: "Bath & Stonehenge",
    label: "バースとストーンヘンジ",
    county: "サマセット州・ウィルトシャー州",
    journeyTime: "約1時間30分",
    blurb:
      "ローマ人が作った浴場が、ほぼそのまま残っています。ストーンヘンジと組み合わせるなら鉄道より現地発ツアーが速い、というのが結論です。",
  },
  {
    slug: "cotswolds",
    category: "dayTrip",
    eyebrow: "The Cotswolds",
    label: "コッツウォルズ",
    county: "グロスターシャー州ほか",
    journeyTime: "約1時間30分〜2時間",
    blurb:
      "蜂蜜色の石造りの村が点在する丘陵地帯。このセクションで唯一、公共交通が実用にならない行き先です。ツアーか車を勧める理由を正直に書きます。",
  },
  {
    slug: "brighton",
    category: "dayTrip",
    eyebrow: "Brighton",
    label: "ブライトン",
    county: "イースト・サセックス州",
    journeyTime: "約1時間",
    blurb:
      "ロンドンから最短で着く「英国の海辺」。砂ではなく小石の浜と、インド風の異様な離宮。バスで1時間の白亜の断崖セブンシスターズまで含めて、天気に賭ける日帰りを組み立てます。",
  },
  {
    slug: "canterbury",
    category: "dayTrip",
    eyebrow: "Canterbury",
    label: "カンタベリー",
    county: "ケント州",
    journeyTime: "約1時間",
    blurb:
      "英国国教会の総本山。ヘンリー8世がローマと断絶した宗教改革の帰結が、この大聖堂ひとつで見て取れます。",
  },
  {
    slug: "york",
    category: "weekender",
    eyebrow: "York",
    label: "ヨーク",
    county: "ノース・ヨークシャー州",
    journeyTime: "約2時間",
    blurb:
      "ローマの軍団基地、ヴァイキングの王国、中世の大聖堂が徒歩30分の範囲に積み重なっています。日帰りもできますが、観光客が帰ったあとの夜が泊まる理由です。",
  },
  {
    slug: "edinburgh",
    category: "weekender",
    eyebrow: "Edinburgh",
    label: "エディンバラ",
    county: "スコットランド",
    journeyTime: "約4時間20分",
    blurb:
      "唯一の「別の国」。紙幣も法律も教育制度も変わります。2026年7月に英国初の宿泊税が始まったので、予算の立て方も他とは違います。",
  },
  {
    slug: "lake-district",
    category: "weekender",
    eyebrow: "The Lake District",
    label: "湖水地方",
    county: "カンブリア州",
    journeyTime: "約3時間20分",
    blurb:
      "「車がないと無理」と書かれがちですが、ウィンダミア湖の東岸に絞れば船とバスで回れます。その線引きから書きます。",
  },
  {
    slug: "penzance",
    category: "weekender",
    eyebrow: "Penzance & Cornwall",
    label: "ペンザンスとコーンウォール",
    county: "コーンウォール州",
    journeyTime: "約5時間（寝台なら夜行）",
    blurb:
      "このセクションで最も遠く、英国で数少ない寝台列車で行ける行き先。海に浮かぶ城と、崖を削った野外劇場が待っています。",
  },
];

export function beyondPath(slug: string) {
  return `${BEYOND_BASE}/${slug}`;
}

export function getBeyondMeta(slug: string) {
  return beyondDestinations.find((d) => d.slug === slug) ?? null;
}

/** /beyond-london/[slug] が実際に生成するページ。 */
export const beyondSlugs = beyondDestinations.map((d) => d.slug);

export function beyondByCategory(category: BeyondCategory) {
  return beyondDestinations.filter((d) => d.category === category);
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildBeyondMetadata(article: BeyondArticle) {
  return buildPageMetadata({
    path: beyondPath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function beyondBreadcrumbJsonLd(article: BeyondArticle) {
  const meta = getBeyondMeta(article.slug);
  return breadcrumbJsonLd({ name: BEYOND_SECTION_NAME, path: BEYOND_BASE }, [
    { name: meta?.label ?? article.title, path: beyondPath(article.slug) },
  ]);
}

export function beyondArticleJsonLd(article: BeyondArticle) {
  const url = `${SITE_URL}${beyondPath(article.slug)}`;

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

/**
 * 行き先ページに TouristDestination を足す。
 *
 * 住所や座標は持たない(持つと DB の Attraction と二重管理になり、
 * かつ町全体に単一の座標を与えても意味がない)ので、
 * name と説明だけの最小構成にする。
 * 座標のない Place を無理に出すより、確実に言えることだけ出す。
 */
export function beyondDestinationJsonLd(article: {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  county: string;
}) {
  const url = `${SITE_URL}${beyondPath(article.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "TouristDestination",
    "@id": `${url}#destination`,
    name: article.engTitle,
    alternateName: article.title,
    description: article.summary,
    url,
    address: {
      "@type": "PostalAddress",
      addressRegion: article.county,
      addressCountry: "GB",
    },
  };
}

/** /beyond-london ハブが持つ記事の一覧を CollectionPage として出す。 */
export function beyondHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${BEYOND_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    publisher: SITE_PUBLISHER,
    hasPart: beyondDestinations.map((d) => ({
      "@type": "Article",
      name: d.label,
      description: d.blurb,
      url: `${SITE_URL}${beyondPath(d.slug)}`,
    })),
  };
}

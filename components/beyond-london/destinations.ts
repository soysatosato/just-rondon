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

/**
 * 行き先が要求する時間。ハブの絞り込みの主軸。
 *
 * 「日帰りか1泊か」(BeyondTier)とは別に持つ。tier は記事の書き方を
 * 決める区分だが、読者がハブで最初に照合するのは自分の空き時間で、
 * そこには「午前中しか空いていない」という第三の状態がある。
 *
 * 配列で持つのは、複数の時間枠に成立する行き先があるから。
 * ヨークは日帰りもできるが1泊するほうがいい——記事本文がそう
 * 書いているのに、どちらか一方に振ると必ず嘘になる。
 */
export type BeyondTimeFit = "halfDay" | "fullDay" | "overnight";

/**
 * 何を見に行くか。時間で絞ったあとの第二軸。
 *
 * 網羅的な分類ではなく、「これがあるから行く」と言える要素だけを
 * 付ける。全行き先に当てはまるタグ(歴史・街歩き)は付けない——
 * 絞り込みに使えないタグは、チップの列を長くするだけになる。
 */
export type BeyondTheme =
  | "castle"
  | "university"
  | "ancient"
  | "cathedral"
  | "seaside"
  | "countryside"
  | "walking"
  | "scotland";

export const BEYOND_THEME_LABELS: Record<BeyondTheme, string> = {
  castle: "城と宮殿",
  university: "大学の街",
  ancient: "ローマ・古代",
  cathedral: "大聖堂",
  seaside: "海辺",
  countryside: "田園と村",
  walking: "自然を歩く",
  scotland: "別の国",
};

/**
 * 現地に着いてからの足。
 *
 * ハブに出すのは、ここが行き先選びを覆すことがあるから。
 * コッツウォルズは所要時間だけ見ればオックスフォードと同程度だが、
 * 駅に降りても村には着かない。時間と運賃だけを並べた表は、
 * この一点で読者を誤らせる。
 */
export type BeyondLocalTransport = "walk" | "local" | "tour";

export const BEYOND_LOCAL_TRANSPORT_LABELS: Record<
  BeyondLocalTransport,
  string
> = {
  walk: "駅から徒歩圏",
  local: "現地でバス・船",
  tour: "ツアーか車が要る",
};

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

  /* --- 以下、ハブの一覧・絞り込みが使う。rail には付けない --- */

  /** ロンドン側の始発駅。短く。複数あるなら「／」で繋ぐ。 */
  fromStation?: string;
  /**
   * 片道の最速所要(分)。並べ替えと所要バーの長さに使う。
   * 表示は journeyTime のほうを出す——「約1時間30分」と
   * 書いてある記事に対して「90分」と出すと別物に見える。
   */
  journeyMinutes?: number;
  /** どの時間枠で成立するか。1つ以上。 */
  timeFit?: BeyondTimeFit[];
  themes?: BeyondTheme[];
  localTransport?: BeyondLocalTransport;
  /**
   * localTransport の但し書き。
   * 一語のラベルでは嘘になる行き先にだけ付ける(バースは単体なら徒歩圏、
   * 湖水地方は東岸だけ公共交通で足りる、など)。
   */
  localTransportNote?: string;
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
    fromStation: "パディントン／ウォータールー",
    journeyMinutes: 35,
    timeFit: ["halfDay", "fullDay"],
    themes: ["castle", "cathedral"],
    localTransport: "walk",
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
    fromStation: "パディントン",
    journeyMinutes: 60,
    timeFit: ["fullDay"],
    themes: ["university"],
    localTransport: "walk",
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
    fromStation: "キングス・クロス",
    journeyMinutes: 60,
    timeFit: ["fullDay"],
    themes: ["university"],
    localTransport: "local",
    localTransportNote: "駅から中心部まで徒歩25分。バスで10分",
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
    fromStation: "パディントン",
    journeyMinutes: 90,
    timeFit: ["fullDay"],
    themes: ["ancient"],
    localTransport: "tour",
    localTransportNote: "バース単体なら駅から徒歩圏。ストーンヘンジと組むならツアー",
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
    fromStation: "パディントン",
    journeyMinutes: 90,
    timeFit: ["fullDay"],
    themes: ["countryside"],
    localTransport: "tour",
    localTransportNote: "鉄道で行けるのはモートン・イン・マーシュなど一部の村だけ",
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
    fromStation: "ヴィクトリア",
    journeyMinutes: 60,
    timeFit: ["fullDay"],
    themes: ["seaside", "castle", "walking"],
    localTransport: "walk",
    localTransportNote: "セブンシスターズまで足を延ばすならバスで1時間",
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
    fromStation: "セント・パンクラス",
    journeyMinutes: 60,
    timeFit: ["halfDay", "fullDay"],
    themes: ["cathedral"],
    localTransport: "walk",
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
    fromStation: "キングス・クロス",
    journeyMinutes: 120,
    timeFit: ["fullDay", "overnight"],
    themes: ["ancient", "cathedral"],
    localTransport: "walk",
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
    fromStation: "キングス・クロス",
    journeyMinutes: 260,
    timeFit: ["overnight"],
    themes: ["scotland", "castle", "walking"],
    localTransport: "walk",
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
    fromStation: "ユーストン",
    journeyMinutes: 200,
    timeFit: ["overnight"],
    themes: ["countryside", "walking"],
    localTransport: "local",
    localTransportNote: "湖の東岸なら船とバスで回れる。西岸は車が要る",
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
    fromStation: "パディントン",
    journeyMinutes: 300,
    timeFit: ["overnight"],
    themes: ["seaside", "castle"],
    localTransport: "local",
    localTransportNote: "現地はバスと支線。寝台なら夜行で移動できる",
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

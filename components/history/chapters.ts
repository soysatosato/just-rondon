import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import type { HistoryChapter } from "./types";

export { SITE_URL };

export const HISTORY_BASE = "/history";
export const HISTORY_SECTION_NAME = "イギリスの歴史";

/** 全章共通の更新日。章ごとに散らすと更新漏れが出るのでここで一元管理する。 */
export const HISTORY_UPDATED_AT = "2026-08-12";

/**
 * 時代区分。ハブでの束ね方。
 *
 * 王朝名ではなく「この島に何が起きたか」で切っている。
 * 王朝で切ると、読者が知りたい「なぜ今こうなっているのか」から遠ざかる。
 */
export type HistoryEra = "foundation" | "kingdom" | "empire" | "modern";

export const HISTORY_ERA_LABELS: Record<HistoryEra, string> = {
  foundation: "島の土台ができるまで",
  kingdom: "ひとつの王国になるまで",
  empire: "世界に広がった時代",
  modern: "帝国のあとの現在",
};

export const HISTORY_ERA_BLURBS: Record<HistoryEra, string> = {
  foundation:
    "ローマが道と城壁を敷き、去ったあとにアングロサクソンとヴァイキングが入れ替わり住んだ約1000年。ロンドンという都市の輪郭がここで決まります。",
  kingdom:
    "1066年の征服から、宗教改革、内戦、そして議会が王に勝つまで。今の英国の政治制度の骨格が、この4章のあいだに出来上がります。",
  empire:
    "連合王国の成立、世界の4分の1を支配した帝国、そして産業革命。大英博物館の収蔵品と、ロンドンの街並みそのものがこの時代の産物です。",
  modern:
    "二つの大戦、NHSの誕生、ウィンドラッシュ世代の到来、EU離脱。今日ロンドンで見えている多様さと分断が、どこから来たのか。",
};

export const HISTORY_ERA_ORDER: HistoryEra[] = [
  "foundation",
  "kingdom",
  "empire",
  "modern",
];

export type HistoryChapterMeta = {
  slug: string;
  number: number;
  era: HistoryEra;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  /** 扱う期間。カードに出す。 */
  period: string;
  blurb: string;
  /**
   * この章の「今も残る痕跡」を一言で。ハブのカードに出す。
   * 通史の目次ではなく「今日の疑問への答え」として並べるための一行。
   */
  hook: string;
};

/**
 * 全10章の並び。時系列そのもの。
 *
 * 10章にしたのは、このサイトの読者が現地で出会うものと1対1で
 * 対応させられる下限だから。ローマ=ロンドン城壁、ノルマン=ロンドン塔、
 * チューダー=ハンプトン・コート、内戦=バンケティング・ハウス、
 * 帝国=大英博物館、産業革命=パディントン、大戦=Churchill War Rooms、
 * ウィンドラッシュ=ブリクストン。
 * これ以下に圧縮すると、/museums・/sightseeing から相互リンクを張る先が
 * 足りなくなる。
 *
 * next-sitemap.config.js の staticPages と、/history ハブのカード表示順を
 * このリストと一致させること。
 */
export const historyChapters: HistoryChapterMeta[] = [
  {
    slug: "roman-britain",
    number: 1,
    era: "foundation",
    eyebrow: "Roman Britain",
    label: "ローマ支配とブリタニア",
    period: "紀元43年〜410年",
    blurb:
      "ロンドンという都市を作ったのはローマ人です。テムズ川に橋を架けられる最初の地点、という理由だけで選ばれた場所に、約400年で城壁に囲まれた街ができました。",
    hook: "シティの境界線が今も不自然に歪んでいるのは、ローマの城壁の跡だから",
  },
  {
    slug: "anglo-saxons-vikings",
    number: 2,
    era: "foundation",
    eyebrow: "Anglo-Saxons & Vikings",
    label: "アングロサクソンとヴァイキング",
    period: "410年〜1066年",
    blurb:
      "ローマが去り、ロンドンは一度捨てられます。英語という言語、州（シャイア）の区分、そして「イングランド」という名前が生まれたのがこの600年です。",
    hook: "曜日の名前が北欧の神々なのも、英語が不規則すぎるのも、この時代のせい",
  },
  {
    slug: "norman-conquest",
    number: 3,
    era: "kingdom",
    eyebrow: "Norman Conquest",
    label: "ノルマン征服と中世の王権",
    period: "1066年〜1485年",
    blurb:
      "1066年、英語を話さない王がイングランドを征服します。ロンドン塔は市民を守る城ではなく、市民を威圧するために建てられました。マグナ・カルタもこの時代です。",
    hook: "英語で牛は cow なのに牛肉が beef なのは、征服者がフランス語を話したから",
  },
  {
    slug: "tudors",
    number: 4,
    era: "kingdom",
    eyebrow: "The Tudors",
    label: "チューダー朝と宗教改革",
    period: "1485年〜1603年",
    blurb:
      "ヘンリー8世が離婚のためにローマ教会と断絶し、英国国教会を作ります。修道院は解体され、その土地が貴族に配られました。エリザベス1世とシェイクスピアの時代。",
    hook: "英国の君主が今も「国教会の首長」なのは、王の離婚が理由",
  },
  {
    slug: "civil-war",
    number: 5,
    era: "kingdom",
    eyebrow: "Civil War & Revolution",
    label: "内戦・共和政・名誉革命",
    period: "1603年〜1714年",
    blurb:
      "議会が王を裁判にかけ、公開で処刑します。その後の共和政、王政復古、そして1688年の名誉革命で、「王は議会に従う」という原則が確定しました。",
    hook: "国王が庶民院（下院）に入れないのは、1642年にチャールズ1世が踏み込んだから",
  },
  {
    slug: "union-and-empire",
    number: 6,
    era: "empire",
    eyebrow: "Union & Empire",
    label: "連合王国の成立と大英帝国",
    period: "1707年〜1858年",
    blurb:
      "イングランドとスコットランドが合併し、United Kingdom が生まれます。同時に始まる帝国の拡大と、その資金源だった奴隷貿易。大英博物館の収蔵品はここから来ました。",
    hook: "大英博物館が無料なのに、その収蔵品の来歴が今も揉め続けている理由",
  },
  {
    slug: "industrial-revolution",
    number: 7,
    era: "empire",
    eyebrow: "Industrial Revolution",
    label: "産業革命とヴィクトリア朝",
    period: "1760年〜1901年",
    blurb:
      "世界初の鉄道、世界初の地下鉄、世界初の万国博覧会。同時に、世界初のスラムと公害も生みました。今のロンドンの地下鉄網と下水道はこの時代の遺産です。",
    hook: "ロンドンの下水道が今も1860年代のものなのは、「大悪臭」事件のおかげ",
  },
  {
    slug: "world-wars",
    number: 8,
    era: "modern",
    eyebrow: "The World Wars",
    label: "二つの大戦",
    period: "1914年〜1945年",
    blurb:
      "ロンドンは史上初めて空から爆撃された首都のひとつです。ブリッツで街の3分の1が焼け、戦後の再建がロンドンの姿を決めました。",
    hook: "パブが長らく23時に閉まっていたのは、第一次大戦の軍需工場法の名残",
  },
  {
    slug: "postwar",
    number: 9,
    era: "modern",
    eyebrow: "Postwar Britain",
    label: "戦後・NHS・ウィンドラッシュ",
    period: "1945年〜1979年",
    blurb:
      "焼け跡から、無料の国民医療（NHS）が生まれます。労働力不足を埋めるためカリブ海諸国から人々が招かれ、そして数十年後に「不法滞在者」として扱われました。",
    hook: "NHSが今も無料なのと、ブリクストンがカリブ系の街になったのは同じ理由",
  },
  {
    slug: "modern-britain",
    number: 10,
    era: "modern",
    eyebrow: "Modern Britain",
    label: "EC加盟から離脱、そして現在",
    period: "1973年〜現在",
    blurb:
      "サッチャーの改革、金融ビッグバン、ロンドンの再国際化。そして2016年の国民投票と2020年の離脱。この島が何度目かの「ヨーロッパとの距離」を測り直しています。",
    hook: "入国審査でEU市民の列がなくなったのも、ETAが必要になったのもこの帰結",
  },
];

export function chapterPath(slug: string) {
  return `${HISTORY_BASE}/${slug}`;
}

export function getChapterMeta(slug: string) {
  return historyChapters.find((c) => c.slug === slug) ?? null;
}

/** /history/[slug] が実際に生成するページ。 */
export const historyChapterSlugs = historyChapters.map((c) => c.slug);

export function chaptersByEra(era: HistoryEra) {
  return historyChapters.filter((c) => c.era === era);
}

/**
 * 前後の章。通史は順番に読むものなので、housing/transport のような
 * カテゴリ内リンクではなく、前後ナビを持たせる
 * (components/jobs/case-story/ChapterNav.tsx と同じ考え方)。
 */
export function getNeighbours(slug: string) {
  const i = historyChapters.findIndex((c) => c.slug === slug);
  if (i === -1) return { prev: null, next: null };

  return {
    prev: i > 0 ? historyChapters[i - 1] : null,
    next: i < historyChapters.length - 1 ? historyChapters[i + 1] : null,
  };
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildChapterMetadata(chapter: HistoryChapter) {
  return buildPageMetadata({
    path: chapterPath(chapter.slug),
    title: chapter.title,
    description: chapter.description,
    keywords: chapter.keywords,
    type: "article",
    modifiedTime: chapter.updatedAt,
  });
}

export function chapterBreadcrumbJsonLd(chapter: HistoryChapter) {
  const meta = getChapterMeta(chapter.slug);
  return breadcrumbJsonLd(
    { name: HISTORY_SECTION_NAME, path: HISTORY_BASE },
    [{ name: meta?.label ?? chapter.title, path: chapterPath(chapter.slug) }]
  );
}

export function chapterArticleJsonLd(chapter: HistoryChapter) {
  const url = `${SITE_URL}${chapterPath(chapter.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: chapter.title,
    description: chapter.description,
    inLanguage: "ja",
    mainEntityOfPage: url,
    dateModified: chapter.updatedAt,
    author: SITE_PUBLISHER,
    publisher: SITE_PUBLISHER,
    /** 章は連載の一部なので位置を持たせる。 */
    position: chapter.number,
    isPartOf: {
      "@type": "CreativeWorkSeries",
      name: "イギリスの歴史 全10章",
      url: `${SITE_URL}${HISTORY_BASE}`,
    },
  };
}

/** /history ハブが持つ章の一覧を CollectionPage として出す。 */
export function historyHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${HISTORY_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    publisher: SITE_PUBLISHER,
    hasPart: historyChapters.map((c) => ({
      "@type": "Article",
      name: `第${c.number}章 ${c.label}`,
      description: c.blurb,
      url: `${SITE_URL}${chapterPath(c.slug)}`,
    })),
  };
}

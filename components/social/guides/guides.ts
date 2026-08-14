import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import type { SocialGuideArticle } from "./types";

export { SITE_URL };

export const SOCIAL_BASE = "/social";
export const SOCIAL_SECTION_NAME = "出会いと人間関係";

/**
 * ハブでの分類。「誰と」で切る。
 *
 * trouble が「何が起きたか」で切ったのに対し、こちらは相手で切る。
 * 読者の悩みは「友だちがいない」「恋人ができない」「日本人と
 * どう付き合うか」のどれかに必ず落ちるので、この3つで漏れない。
 *
 * friends を先頭に置くのは、件数が最も多く、かつ他の2つの土台になるから。
 * 恋愛も日本人コミュニティも、結局は友人関係の作り方の応用になる。
 *
 * japanese を最後に置くのは順位の話ではない。渡英直後はここが入口になるが、
 * ハブの導線(渡英歴で切る)のほうでそれを拾うので、
 * 一覧の並びは「現地で広げる → 日本語圏との距離を決める」の順にしている。
 */
export type SocialCategory = "friends" | "dating" | "japanese";

export const SOCIAL_CATEGORY_LABELS: Record<SocialCategory, string> = {
  friends: "友だちをつくる",
  dating: "恋愛",
  japanese: "日本人コミュニティ",
};

export const SOCIAL_CATEGORY_ORDER: SocialCategory[] = [
  "friends",
  "dating",
  "japanese",
];

export type SocialGuideMeta = {
  slug: string;
  category: SocialCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
};

/**
 * 出会い・人間関係ガイドの並び。「仕組みを知る → 場に出る → 続ける」の順。
 *
 * 各カテゴリで、理解 → 行動 → 継続/安全 の3本立てにしている。
 * 友人カテゴリの3本目が「続ける」なのに対し、恋愛カテゴリの3本目が
 * 「安全」なのは意図的で、恋愛には友人関係にない危険が伴うため。
 * dating-safety は後回しにできる話ではないので、
 * カテゴリ内に必ず1本立てて /trouble に接続する。
 *
 * community-distance は、このセクションで唯一
 * 「入るべきか」を扱う回。人の属性ではなく距離の取り方を主語にすること。
 * 詳細は content/community-distance.ts の冒頭コメントを参照。
 *
 * next-sitemap.config.js の staticPages と、/social ハブのカード表示順を
 * このリストと一致させること。
 *
 * 全9本。追加するときはこのリストに足し、
 * content/index.ts と sitemap も同時に更新する。
 */
export const socialGuides: SocialGuideMeta[] = [
  {
    slug: "how-brits-make-friends",
    category: "friends",
    eyebrow: "How It Works",
    label: "イギリス人はどこで友だちを作っているのか",
    blurb:
      "学生時代・職場・趣味の3経路にほぼ限られます。だから「大人になってから友だちを作る」のは現地人にとっても難しい。パブの round の作法と、社交辞令の見分け方から。",
  },
  {
    slug: "where-to-meet-people",
    category: "friends",
    eyebrow: "Where to Go",
    label: "人と出会える場所（費用と、入りやすさ順）",
    blurb:
      "run club、Meetup、ボランティア、ジムのクラス。会話を強制される密度が低い順に並べます。英語に不安があるほど、しゃべらなくていい活動から入るのが正解です。",
  },
  {
    slug: "keeping-friendships",
    category: "friends",
    eyebrow: "Keeping It",
    label: "せっかく知り合った人と、続かない理由",
    blurb:
      "ロンドンは人の入れ替わりが激しく、距離が遠いと会わなくなります。誘う頻度の目安、ドタキャン文化への構え方、そして「知り合いは多いが友人がいない」問題。",
  },
  {
    slug: "dating-apps",
    category: "dating",
    eyebrow: "Apps",
    label: "マッチングアプリの使い分け（Hinge・Bumble・Tinder）",
    blurb:
      "アプリごとに集まる層が違います。真剣な交際なら Hinge、という現在の相場。プロフィールの書き方と、課金する価値があるかどうかの判断。",
  },
  {
    slug: "dating-culture",
    category: "dating",
    eyebrow: "Culture",
    label: "交際の作法（seeing・exclusive・the talk）",
    blurb:
      "「付き合っている」の定義が日本と違います。告白の文化はなく、代わりに the talk という確認の会話があります。デート代の払い方の相場まで。",
  },
  {
    slug: "dating-safety",
    category: "dating",
    eyebrow: "Safety",
    label: "会う前と、会ってからの安全",
    blurb:
      "初回に公共の場を選ぶ理由、Ask for Angela という合言葉、位置情報の共有。ロマンス詐欺と、ビザ目的の関係を見分ける手がかりも扱います。",
  },
  {
    slug: "where-japanese-gather",
    category: "japanese",
    eyebrow: "Community",
    label: "日本人はどこに集まっているか",
    blurb:
      "mixb、日本人会、Facebook グループ、日系の店、大学の日本人会。それぞれ集まる層が違います。駐在・留学生・永住者のどこに自分が入るかで、選ぶ場所が変わります。",
  },
  {
    slug: "japanese-events",
    category: "japanese",
    eyebrow: "Events",
    label: "日本関連イベントの年間カレンダー",
    blurb:
      "Japan Matsuri、Hyper Japan、盆踊り、日本語ミートアップ、社会人スポーツ。日程は毎年動くので、時期と探し方で覚えるのが実用的です。",
  },
  {
    slug: "community-distance",
    category: "japanese",
    eyebrow: "Distance",
    label: "日本人コミュニティとの距離の取り方",
    blurb:
      "入るべきか避けるべきか、という問いの立て方をやめます。狭いネットワークで何が起きやすいかを知ったうえで、関わり方の濃淡を自分で決めるための材料を。",
  },
];

export function socialGuidePath(slug: string) {
  return `${SOCIAL_BASE}/${slug}`;
}

export function getSocialGuideMeta(slug: string) {
  return socialGuides.find((g) => g.slug === slug) ?? null;
}

/**
 * 本文が存在する slug の集合。
 *
 * このセクションは9本の構成を先に確定させ、本文を順次追加していく。
 * socialGuides(構成)と socialGuideArticles(本文)がずれている間、
 * ハブが未執筆ページへのリンクを出すと 404 を踏ませることになるので、
 * 公開judgeをここに集約する。
 *
 * 循環 import を避けるため content/index.ts からは読まず、
 * ハブとレイアウトが呼び出し側で articles を渡す形にしている。
 *
 * 全9本が揃ったらこの関数と published 系のフィルタは削除してよい。
 */
export function publishedSocialGuides(publishedSlugs: readonly string[]) {
  const set = new Set(publishedSlugs);
  return socialGuides.filter((g) => set.has(g.slug));
}

export function publishedSocialGuidesByCategory(
  category: SocialCategory,
  publishedSlugs: readonly string[]
) {
  return publishedSocialGuides(publishedSlugs).filter(
    (g) => g.category === category
  );
}

/** 構成上のすべての slug。sitemap や進捗の確認に使う。 */
export const socialGuideSlugs = socialGuides.map((g) => g.slug);

export function socialGuidesByCategory(category: SocialCategory) {
  return socialGuides.filter((g) => g.category === category);
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildSocialGuideMetadata(article: SocialGuideArticle) {
  return buildPageMetadata({
    path: socialGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function socialGuideBreadcrumbJsonLd(article: SocialGuideArticle) {
  const meta = getSocialGuideMeta(article.slug);
  return breadcrumbJsonLd({ name: SOCIAL_SECTION_NAME, path: SOCIAL_BASE }, [
    {
      name: meta?.label ?? article.title,
      path: socialGuidePath(article.slug),
    },
  ]);
}

export function socialGuideArticleJsonLd(article: SocialGuideArticle) {
  const url = `${SITE_URL}${socialGuidePath(article.slug)}`;

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
 * /social ハブが持つガイド記事の一覧を CollectionPage として出す。
 *
 * hasPart には公開済みの記事だけを入れる。未執筆の URL を構造化データに
 * 載せるとクロールされて 404 になるため、publishedSlugs で絞る。
 */
export function socialHubCollectionJsonLd(meta: {
  name: string;
  description: string;
  publishedSlugs: readonly string[];
}) {
  const url = `${SITE_URL}${SOCIAL_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    hasPart: publishedSocialGuides(meta.publishedSlugs).map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${socialGuidePath(g.slug)}`,
    })),
  };
}

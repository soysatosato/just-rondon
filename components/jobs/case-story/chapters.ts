import type { CaseStoryArticle, Locale } from "./types";

import { SITE_URL, buildPageMetadata } from "@/lib/seo";
export { SITE_URL };

/**
 * 日本語版が正、英語版は /en プレフィックス配下に同じ slug で並ぶ。
 * この対応が1:1で崩れると hreflang が壊れるので、章の追加は必ず両方に入れる。
 */
export const CASE_STORY_BASE = "/jobs/service-charges/case-story";
export const CASE_STORY_BASE_EN = "/en/jobs/service-charges/case-story";

export function caseStoryBase(locale: Locale = "ja") {
  return locale === "en" ? CASE_STORY_BASE_EN : CASE_STORY_BASE;
}

/** サービスチャージ・ガイド本体(親ページ)。日本語版しかないので英語版からもここへ送る。 */
export const SERVICE_CHARGES_PATH = "/jobs/service-charges";

export type Chapter = {
  slug: string;
  label: string;
  blurb: string;
  kind: "story" | "tool";
};

type ChapterDef = {
  slug: string;
  kind: "story" | "tool";
  ja: { label: string; blurb: string };
  en: { label: string; blurb: string };
};

/**
 * 章の並び。next-sitemap.config.js の staticPages と一致させること。
 * インデックス・前後ナビ・パンくず・JSON-LD がすべてここを参照する。
 */
const chapterDefs: ChapterDef[] = [
  {
    slug: "background",
    kind: "story",
    ja: {
      label: "何が問題だったのか",
      blurb:
        "12.5%のサービスチャージが客から徴収される一方、実際に還元されていた額との差。争点になった事実関係を整理します。",
    },
    en: {
      label: "What the dispute was about",
      blurb:
        "A 12.5% service charge was added to every bill, but only a fraction of it reached staff. The facts that ended up in front of the tribunal.",
    },
  },
  {
    slug: "acas-early-conciliation",
    kind: "story",
    ja: {
      label: "Acas Early Conciliation",
      blurb:
        "Tribunalへ進む前に必ず通る手続き。Acasは味方ではなく中立機関である、という前提から始まります。",
    },
    en: {
      label: "Acas Early Conciliation",
      blurb:
        "The mandatory step before a tribunal claim. It starts with understanding that Acas is neutral — not on your side.",
    },
  },
  {
    slug: "et1-filing",
    kind: "story",
    ja: {
      label: "ET1を提出する",
      blurb:
        "正式な申立て。期限、請求内容の書き方、求める救済、そして通訳の希望をどう書いたか。",
    },
    en: {
      label: "Filing the ET1",
      blurb:
        "The formal claim: the deadline, how to word the particulars, the remedy sought, and how I asked for an interpreter.",
    },
  },
  {
    slug: "tribunal-correspondence",
    kind: "story",
    ja: {
      label: "証拠提出と相手方とのやり取り",
      blurb:
        "証拠バンドルの作り方、送達の落とし穴、「受け取っていない」と言われたときの対応。",
    },
    en: {
      label: "Evidence and correspondence",
      blurb:
        "Building the bundle, the traps in how you serve it, and what to say when the respondent claims they never received it.",
    },
  },
  {
    slug: "default-judgment",
    kind: "story",
    ja: {
      label: "答弁なし・審理・判決",
      blurb:
        "答弁書が出ないとどうなるか。誤った通知への対処、オンライン審理、そして£4,007.55の判決。",
    },
    en: {
      label: "No response, hearing, judgment",
      blurb:
        "What happens when no ET3 is filed: a notice sent in error, an online hearing, and a judgment of £4,007.55.",
    },
  },
  {
    slug: "high-court-enforcement",
    kind: "story",
    ja: {
      label: "勝っても払われないとき",
      blurb:
        "判決は自動では支払われない。High Courtのwritへの移行、執行費用、相手方の抵抗、そして回収まで。",
    },
    en: {
      label: "Winning but not getting paid",
      blurb:
        "A judgment does not pay itself. Transferring to a High Court writ, the costs, the pushback, and finally the money.",
    },
  },
  {
    slug: "check-your-service-charge",
    kind: "tool",
    ja: {
      label: "自分の未払い額を計算する",
      blurb:
        "実際に裁判所に認容された計算方法を、そのまま自分のケースに当てはめる手順。",
    },
    en: {
      label: "Work out what you are owed",
      blurb:
        "The exact calculation the tribunal accepted, laid out so you can run it on your own payslips.",
    },
  },
  {
    slug: "how-to-file-a-claim",
    kind: "tool",
    ja: {
      label: "申立ての進め方（まとめ）",
      blurb:
        "全体フロー、各段階の期限、費用、提出物チェックリスト、そしてやってはいけないこと。",
    },
    en: {
      label: "How to bring a claim",
      blurb:
        "The whole route end to end: deadlines at each stage, costs, a document checklist, and the mistakes to avoid.",
    },
  },
  {
    slug: "resources-and-links",
    kind: "tool",
    ja: {
      label: "参考リンク集",
      blurb:
        "Acas、gov.uk、Tipping Act、ET1フォーム、公開判決検索。何がどこに書いてあるか。",
    },
    en: {
      label: "Sources and links",
      blurb:
        "Acas, gov.uk, the Tipping Act, the ET1 form, the public judgment database — and what each one actually tells you.",
    },
  },
];

/** 指定言語の章一覧。並び順は言語をまたいで常に同じ。 */
export function getChapters(locale: Locale = "ja"): Chapter[] {
  return chapterDefs.map((c) => ({
    slug: c.slug,
    kind: c.kind,
    label: c[locale].label,
    blurb: c[locale].blurb,
  }));
}

/** 既存の日本語ページ用。新規コードは getChapters(locale) を使うこと。 */
export const chapters: Chapter[] = getChapters("ja");

export function chapterPath(slug: string, locale: Locale = "ja") {
  return `${caseStoryBase(locale)}/${slug}`;
}

export function getChapterIndex(slug: string) {
  return chapterDefs.findIndex((c) => c.slug === slug);
}

export function getNeighbours(slug: string, locale: Locale = "ja") {
  const list = getChapters(locale);
  const i = getChapterIndex(slug);
  return {
    prev: i > 0 ? list[i - 1] : null,
    next: i >= 0 && i < list.length - 1 ? list[i + 1] : null,
  };
}

/** 同じ章の、もう一方の言語のパス。言語切替リンクとhreflangの両方で使う。 */
export function alternateLanguages(path: string, locale: Locale) {
  const suffix =
    locale === "en"
      ? path.slice(CASE_STORY_BASE_EN.length)
      : path.slice(CASE_STORY_BASE.length);
  return {
    ja: `${CASE_STORY_BASE}${suffix}`,
    en: `${CASE_STORY_BASE_EN}${suffix}`,
  };
}

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は必ず自分の実URLを指し、hreflang で日英を相互に結ぶ。
 */
export function buildMetadata(
  article: CaseStoryArticle,
  locale: Locale = "ja"
) {
  const path = chapterPath(article.slug, locale);
  return buildPageMetadata({
    path,
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    locale,
    languages: alternateLanguages(path, locale),
  });
}

export function breadcrumbJsonLd(
  article: CaseStoryArticle,
  locale: Locale = "ja"
) {
  const t =
    locale === "en"
      ? {
          home: "Home",
          serviceCharges: "Service charges",
          story: "Unpaid service charge: a tribunal record",
        }
      : {
          home: "ホーム",
          serviceCharges: "サービスチャージ",
          story: "サービスチャージ未払いの記録",
        };

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t.home, item: SITE_URL },
      {
        "@type": "ListItem",
        position: 2,
        name: t.serviceCharges,
        item: `${SITE_URL}/jobs/service-charges`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: t.story,
        item: `${SITE_URL}${caseStoryBase(locale)}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: article.title,
        item: `${SITE_URL}${chapterPath(article.slug, locale)}`,
      },
    ],
  };
}

export function articleJsonLd(
  article: CaseStoryArticle,
  locale: Locale = "ja"
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    inLanguage: locale,
    isPartOf: {
      "@type": "Article",
      name:
        locale === "en"
          ? "Unpaid service charge: a tribunal record"
          : "サービスチャージ未払いの記録",
      url: `${SITE_URL}${caseStoryBase(locale)}`,
    },
    mainEntityOfPage: `${SITE_URL}${chapterPath(article.slug, locale)}`,
    publisher: {
      "@type": "Organization",
      name: locale === "en" ? "Just Rondon" : "ジャスト・ロンドン",
      url: SITE_URL,
    },
  };
}

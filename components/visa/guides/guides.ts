import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { SITE_PUBLISHER, breadcrumbJsonLd } from "@/lib/jsonld";
import {
  IHS_PER_YEAR,
  PROCESSING_WEEKS,
  VISA_FEES,
  VISA_THRESHOLDS,
  gbp,
  ymsTotalCost,
} from "@/lib/visa/rates";
import type { VisaGuideArticle, VisaRouteFacts } from "./types";

export { SITE_URL };

export const VISA_BASE = "/visa";
export const VISA_SECTION_NAME = "ビザガイド";

/**
 * ハブでの分類。読者が自分の状況を選ぶときの語彙に合わせる。
 * 「短期」「働く」「学ぶ」「家族」「渡英後」以外は増やさないこと。
 * カテゴリが増えるほど、読者は自分がどれかを判断できなくなる。
 */
export type VisaCategory = "short" | "work" | "study" | "family" | "after";

export const VISA_CATEGORY_LABELS: Record<VisaCategory, string> = {
  short: "短期で訪れる",
  work: "働く",
  study: "学ぶ",
  family: "家族と暮らす",
  after: "渡英後の手続き",
};

export const VISA_SPONSOR_LABELS: Record<VisaRouteFacts["sponsor"], string> = {
  none: "スポンサー不要",
  employer: "雇用主のスポンサーが必要",
  school: "学校のスポンサーが必要",
  partner: "英国側のパートナーが必要",
};

export type VisaGuideMeta = {
  slug: string;
  category: VisaCategory;
  /** 英語ラベル。カードの eyebrow に使う。 */
  eyebrow: string;
  label: string;
  blurb: string;
  /**
   * 比較できる形のルート要件。実際のビザルート5本だけが持つ。
   *
   * 記事(content/)ではなくここに置いているのは、ハブが7本ぶんの
   * 本文を読み込まずに比較を組めるようにするため。記事側の
   * atAGlance はルート固有の項目だけを持ち、この7項目とは重複しない。
   *
   * 全ルート比較(uk-visa-guide)と渡英後の手続き(after-arrival)、
   * および ETA は「ルート」ではないので持たない。
   */
  routeFacts?: VisaRouteFacts;
  /**
   * サイト外(/sightseeing 配下など)に本体がある記事はここに実パスを持つ。
   * ETA だけは旅行ガイドとして先に書かれており、旅程を立てる読者の
   * 導線上そこに置いたままの方が自然なので、ビザ側からは参照だけする。
   */
  externalPath?: string;
  /**
   * externalPath を持つ記事の audience。
   *
   * ハブの一覧は各記事の audience を読む(types.ts が「記事側を正とし、
   * ハブはここを参照する」と決めている)が、ETA の本体は /visa 配下に
   * 無いので読めない。その1件のためだけのフィールドで、
   * externalPath を持たない記事には書かないこと。
   */
  externalAudience?: string;
};

/**
 * ビザガイドの並び。「短期 → 働く → 学ぶ → 家族 → 渡英後」＝滞在の長さ順。
 *
 * 先頭が ETA なのは、日本国籍の読者の圧倒的多数が観光客であり、
 * かつ「無いと出発できない」唯一の手続きだから。
 *
 * next-sitemap.config.js の staticPages と、/visa ハブのカード表示順を
 * このリストと一致させること。
 */
export const visaGuides: VisaGuideMeta[] = [
  {
    slug: "eta-uk-visa-guide",
    category: "short",
    eyebrow: "Before You Fly",
    label: "ETA（電子渡航認証）申請ガイド",
    blurb:
      "観光・短期出張なら、まずこれ。日本国籍も取得必須で、無いと日本の空港で搭乗を断られます。申請は10分・£20。英語しかないアプリ画面の日本語対訳つき。",
    externalPath: "/sightseeing/eta-uk-visa-guide",
    externalAudience: "観光や短期の出張で、6ヶ月以内の滞在をする人",
  },
  {
    slug: "uk-visa-guide",
    category: "short",
    eyebrow: "Overview",
    label: "英国ビザ全ルート比較",
    blurb:
      "自分がどのビザに該当するのかを、目的・期間・年齢から絞り込みます。日本人が実際に使う9ルートの費用・滞在期間・永住までの距離を一覧で比較。",
  },
  {
    slug: "youth-mobility-scheme",
    category: "work",
    eyebrow: "Working Holiday",
    label: "YMS（ワーホリ）申請ガイド",
    blurb:
      "18〜30歳なら、スポンサーなしで最長2年働ける唯一のルート。日本枠は年6,000人・抽選なし。却下の最大要因である「£2,530を28日間」の証明方法を実務レベルで解説。",
    routeFacts: {
      sponsor: "none",
      sponsorNote: "不要。内定も英語力の証明も要りません",
      ageLimit: "申請時に18〜30歳",
      incomeRequirement: `${gbp(VISA_THRESHOLDS.youthMobility.funds)} を${VISA_THRESHOLDS.youthMobility.fundsDays}日間連続で保持（本人名義）`,
      upfrontCost: `約${gbp(ymsTotalCost(2))}`,
      upfrontNote: `申請料 ${gbp(VISA_FEES.youthMobility)} ＋ IHS 年${gbp(
        IHS_PER_YEAR.discounted
      )} × 2年 ＋ 生体情報登録`,
      maxStay: "最長2年（延長不可・生涯1回のみ）",
      countsTowardsIlr: false,
      ilrNote: "1日も算入されません",
      processing: `標準で約${PROCESSING_WEEKS.work}週間`,
    },
  },
  {
    slug: "skilled-worker",
    category: "work",
    eyebrow: "Sponsored Work",
    label: "Skilled Worker（就労ビザ）ガイド",
    blurb:
      "2025年7月に学士相当（RQF6）へ引き上げられ、約180職種が対象外になりました。今も取れる職種、年収£41,700の壁、スポンサー企業の探し方まで。",
    routeFacts: {
      sponsor: "employer",
      sponsorNote:
        "必須。ライセンスを持つ英国の雇用主から CoS の発行を受ける",
      ageLimit: null,
      incomeRequirement: `年${gbp(
        VISA_THRESHOLDS.skilledWorker.general
      )} と職種別相場（going rate）の高い方`,
      upfrontCost: `${gbp(VISA_FEES.skilledWorker.outsideUpTo3y)} ＋ IHS`,
      upfrontNote: `英国外から3年以下の申請料 ${gbp(
        VISA_FEES.skilledWorker.outsideUpTo3y
      )} ＋ IHS 年${gbp(IHS_PER_YEAR.standard)} × 滞在年数`,
      maxStay: "最長5年。更新回数に制限なし",
      countsTowardsIlr: true,
      ilrNote: "5年で永住申請の対象になります",
      processing: `標準で約${PROCESSING_WEEKS.work}週間`,
    },
  },
  {
    slug: "global-talent",
    category: "work",
    eyebrow: "No Sponsor Needed",
    label: "Global Talent（卓越人材ビザ）ガイド",
    blurb:
      "研究者・アーティスト・技術者向け。雇用主のスポンサーが要らず、最短3年で永住権に届く、日本人に最も過小評価されているルートです。",
    routeFacts: {
      sponsor: "none",
      sponsorNote: "不要。雇用主も内定も要りません",
      ageLimit: null,
      incomeRequirement: null,
      upfrontCost: `${gbp(VISA_FEES.globalTalent.total)} ＋ IHS`,
      upfrontNote: `推薦 ${gbp(VISA_FEES.globalTalent.endorsement)} ＋ 査証 ${gbp(
        VISA_FEES.globalTalent.visa
      )} ＋ IHS 年${gbp(IHS_PER_YEAR.standard)} × 滞在年数`,
      maxStay: "1〜5年で自分で選択。更新の回数制限なし",
      countsTowardsIlr: true,
      ilrNote: "最短3年（Exceptional Talent の場合）",
      processing: `推薦・査証それぞれ約${PROCESSING_WEEKS.work}週間`,
    },
  },
  {
    slug: "student",
    category: "study",
    eyebrow: "Study & After",
    label: "Student／Graduate ビザガイド",
    blurb:
      "CAS の取り方、維持費の証明額、就労できる週20時間の正確な数え方。卒業後のGraduateビザは2027年1月申請分から18ヶ月に短縮されます。",
    routeFacts: {
      sponsor: "school",
      sponsorNote: "必要。学校から CAS を発行してもらう",
      ageLimit: null,
      incomeRequirement: `学費残額 ＋ 月${gbp(
        VISA_THRESHOLDS.student.maintenanceLondonPerMonth
      )}（ロンドン）× 最大${VISA_THRESHOLDS.student.maintenanceMaxMonths}ヶ月`,
      upfrontCost: `${gbp(VISA_FEES.student)} ＋ IHS`,
      upfrontNote: `申請料 ${gbp(VISA_FEES.student)} ＋ IHS 年${gbp(
        IHS_PER_YEAR.discounted
      )}（学生割引レート）× 課程年数`,
      maxStay: "課程期間＋α。卒業後は Graduate で最長2年",
      countsTowardsIlr: false,
      ilrNote: "Student・Graduate とも算入されません",
      processing: `標準で約${PROCESSING_WEEKS.student}週間`,
    },
  },
  {
    slug: "family",
    category: "family",
    eyebrow: "Partner & Family",
    label: "家族・配偶者ビザガイド",
    blurb:
      "英国人・定住者の配偶者として暮らすためのルート。最低所得£29,000の証明方法、貯蓄£88,500での代替、関係の真実性をどう立証するか。",
    routeFacts: {
      sponsor: "partner",
      sponsorNote: "英国市民・定住者のパートナーが必要",
      ageLimit: null,
      incomeRequirement: `英国側に年${gbp(
        VISA_THRESHOLDS.family.minimumIncome
      )}、または貯蓄${gbp(VISA_THRESHOLDS.family.cashSavings)}`,
      upfrontCost: `${gbp(VISA_FEES.familyPartner.outside)} ＋ IHS`,
      upfrontNote: `英国外からの申請料 ${gbp(
        VISA_FEES.familyPartner.outside
      )} ＋ IHS 年${gbp(IHS_PER_YEAR.standard)} × 付与期間`,
      maxStay: "2年9ヶ月 → 更新で2年6ヶ月",
      countsTowardsIlr: true,
      ilrNote: "5年で永住申請の対象になります",
      processing: `約${PROCESSING_WEEKS.family}週間（他ルートの4倍）`,
    },
  },
  {
    slug: "after-arrival",
    category: "after",
    eyebrow: "After You Land",
    label: "渡英後の手続きガイド",
    blurb:
      "ビザが下りて終わりではありません。UKVIアカウント、share code、NINo、GP登録、銀行口座。パスポート更新時の旅券番号更新を怠ると搭乗拒否されます。",
  },
];

export function visaGuidePath(slug: string) {
  const meta = visaGuides.find((g) => g.slug === slug);
  return meta?.externalPath ?? `${VISA_BASE}/${slug}`;
}

export function getVisaGuideMeta(slug: string) {
  return visaGuides.find((g) => g.slug === slug) ?? null;
}

/** /visa/[slug] が実際に生成するページ。externalPath を持つものは除く。 */
export const visaGuideSlugs = visaGuides
  .filter((g) => !g.externalPath)
  .map((g) => g.slug);

/**
 * 記事データから Next.js の metadata を組み立てる。
 * canonical は buildPageMetadata が path から導出するので手書きしない。
 */
export function buildVisaGuideMetadata(article: VisaGuideArticle) {
  return buildPageMetadata({
    path: visaGuidePath(article.slug),
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "article",
    modifiedTime: article.updatedAt,
  });
}

export function visaGuideBreadcrumbJsonLd(article: VisaGuideArticle) {
  const meta = getVisaGuideMeta(article.slug);
  return breadcrumbJsonLd(
    { name: VISA_SECTION_NAME, path: VISA_BASE },
    [
      {
        name: meta?.label ?? article.title,
        path: visaGuidePath(article.slug),
      },
    ]
  );
}

export function visaGuideArticleJsonLd(article: VisaGuideArticle) {
  const url = `${SITE_URL}${visaGuidePath(article.slug)}`;

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

/** /visa ハブが持つガイド記事の一覧を CollectionPage として出す。 */
export function visaHubCollectionJsonLd(meta: {
  name: string;
  description: string;
}) {
  const url = `${SITE_URL}${VISA_BASE}`;

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: meta.name,
    description: meta.description,
    inLanguage: "ja",
    hasPart: visaGuides.map((g) => ({
      "@type": "Article",
      name: g.label,
      description: g.blurb,
      url: `${SITE_URL}${visaGuidePath(g.slug)}`,
    })),
  };
}

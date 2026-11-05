// components/jobs/survey/entry.ts
//
// アンケートの入口で共通に使うもの。ダッシュボード・店舗ページ・完了画面から
// 同じ約束を同じ言葉で書くため、URLの組み立てと文言をここに集める。

import type { JobRole } from "@/utils/labels";
import type { SurveyLocale } from "@/utils/service-charge-diagnosis-text";

export const SURVEY_PATH = "/jobs/service-charges/survey";
/** 英語版。日本食店で働く日本人以外のスタッフ向け。 */
export const SURVEY_PATH_EN = "/en/jobs/service-charges/survey";

export const THANKS_PATH = "/jobs/service-charges/thanks";
export const THANKS_PATH_EN = "/en/jobs/service-charges/thanks";

export function surveyPath(locale: SurveyLocale = "ja") {
  return locale === "en" ? SURVEY_PATH_EN : SURVEY_PATH;
}

export function thanksPath(locale: SurveyLocale = "ja") {
  return locale === "en" ? THANKS_PATH_EN : THANKS_PATH;
}

/** 職種の値か。URL から受け取ったものを確かめるのに使う。 */
export function isJobRole(value: unknown): value is JobRole {
  return (
    value === "floor" ||
    value === "kitchen" ||
    value === "both" ||
    value === "other"
  );
}

/**
 * アンケートのURL。
 *
 * store を渡すと、その店舗を選んだ状態で2問目から始まる。店名を探し直す
 * 手間は、店舗ページや検索から来た人にとっていちばん無駄な1手になる。
 * q は店名の打ちかけで、検索欄に入った状態で開く。
 *
 * more は「前に働いた店も答える」短縮版。答え終えた人が2店舗目以降を
 * 答えるときに使い、詳しい設問と自由記述を飛ばす。role は1店舗目で
 * 答えた職種で、短縮版では聞き直さない。
 */
export function surveyHref(params?: {
  store?: string;
  q?: string;
  more?: boolean;
  role?: JobRole | null;
  locale?: SurveyLocale;
}): string {
  const search = new URLSearchParams();
  const q = params?.q?.trim();
  if (params?.store) search.set("store", params.store);
  else if (q) search.set("q", q);
  if (params?.more) search.set("more", "1");
  if (params?.more && params.role) search.set("role", params.role);
  const qs = search.toString();
  const path = surveyPath(params?.locale);
  return qs ? `${path}?${qs}` : path;
}

export type SurveyPromiseKey = "scope" | "short" | "preview" | "welcome";

/**
 * 答える前に知っておいてほしいこと。
 *
 * 回答をためらわせているのは「長そう」「何を書かされるのか」「問題のない店なら
 * 書かなくていい」だと見ている。それぞれに事実で答える。
 *
 * 匿名であることは入口の見出し脇に一言置くだけにして、氏名やIPアドレスを
 * 保存しないという列挙はしない。並べるほど「特定されうるもの」を数え上げる
 * ことになり、かえって身構えさせるため。
 *
 * ここに書く約束は実装と食い違ってはいけない。必須の設問は SurveyForm の
 * nextDisabled、判定が送信前に出ることは SurveyForm の最終ステップが根拠。
 */
export const SURVEY_PROMISES: {
  key: SurveyPromiseKey;
  /** 入口のカードや追従バーに並べる短い形。 */
  short: string;
  title: string;
  body: string;
}[] = [
  {
    key: "scope",
    short: "聞くのは店のことだけ",
    title: "聞くのは、店のことだけ",
    body: "あなた自身のことは聞きません。働いた店で何が起きていたかだけを教えてください。",
  },
  {
    key: "short",
    short: "必須は3問だけ",
    title: "必須は3問だけ",
    body: "店名・働いていた時期・サービスチャージの有無。ほかは「わからない」や空欄のままで先へ進めます。",
  },
  {
    key: "preview",
    short: "送るかは判定を見てから",
    title: "送るかどうかは、判定を見てから",
    body: "最後のページで、法律に照らした判定と次にやることが出ます。送らずに閉じても構いません。",
  },
  {
    key: "welcome",
    short: "辞めた店・良い店も歓迎",
    title: "辞めた店も、良い店も",
    body: "きちんと分配している店を知りたい人もいます。問題のなかった職場や、前に働いていた店の回答も同じだけ役に立ちます。",
  },
];

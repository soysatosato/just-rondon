// components/jobs/survey/entry.ts
//
// アンケートの入口で共通に使うもの。ダッシュボード・店舗ページ・完了画面から
// 同じ約束を同じ言葉で書くため、URLの組み立てと文言をここに集める。

export const SURVEY_PATH = "/jobs/service-charges/survey";

/**
 * アンケートのURL。
 *
 * store を渡すと、その店舗を選んだ状態で2問目から始まる。店名を探し直す
 * 手間は、店舗ページや検索から来た人にとっていちばん無駄な1手になる。
 * q は店名の打ちかけで、検索欄に入った状態で開く。
 */
export function surveyHref(params?: { store?: string; q?: string }): string {
  const search = new URLSearchParams();
  const q = params?.q?.trim();
  if (params?.store) search.set("store", params.store);
  else if (q) search.set("q", q);
  const qs = search.toString();
  return qs ? `${SURVEY_PATH}?${qs}` : SURVEY_PATH;
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

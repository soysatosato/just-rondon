import type { Locale } from "./types";

/**
 * 記事の外側(パンくず・前後ナビ・免責)の文言。
 * 本文は content/ と content/en/ にあり、ここには入れない。
 */
const strings = {
  ja: {
    breadcrumbServiceCharges: "サービスチャージ",
    breadcrumbStory: "未払いの記録",
    chapterLabel: (n: number) => `第${n}章`,
    prevChapter: "← 前の章",
    nextChapter: "次の章 →",
    backToIndex: "全体の目次に戻る",
    switchLabel: "English",
    switchAria: "Read this chapter in English",
    gateHeading: "この先は会員の方だけが読めます",
    gateBody:
      "登録は無料です。メールに届く確認コードか、Google・LINE のアカウントで1分ほどで済みます。名前や写真の登録はありません。",
    gateLockedList: "この章の続き",
    gateSignUp: "無料で登録して続きを読む",
    gateSignIn: "登録済みの方はログイン",
    gateLoading: "続きを読み込んでいます…",
    gateError: "続きを読み込めませんでした。",
    gateRetry: "もう一度読み込む",
    gateIndexNote:
      "第1章と参考リンク集は全文、ほかの章は最初の節まで読めます。続きは無料の会員登録で読めます。",
    disclaimerHeading: "この記事について",
    disclaimerBody: [
      "これは私個人の経験にもとづく記録であり、法律アドバイスではありません。手続きの内容や期限は変わることがあります。ご自身のケースについては、AcasやCitizens Advice、資格のある専門家に確認してください。",
      "第三者の氏名（相手方の関係者、代理人、担当者、同僚、証人など）、事件番号、連絡先はすべて省略または匿名化しています。会社名は、公開されている記録で確認できる範囲にとどめています。",
      "本文では、審判所が実際に判断した事項と、私自身が受けた説明や当時の受け止めとを区別して書いています。後者はあくまで私の認識であり、事実認定ではありません。",
    ],
  },
  en: {
    breadcrumbServiceCharges: "Service charges",
    breadcrumbStory: "Tribunal record",
    chapterLabel: (n: number) => `Chapter ${n}`,
    prevChapter: "← Previous",
    nextChapter: "Next →",
    backToIndex: "Back to all chapters",
    switchLabel: "日本語",
    switchAria: "この章を日本語で読む",
    gateHeading: "The rest of this chapter is for members",
    gateBody:
      "Signing up is free and takes about a minute, with a code sent to your email or your Google or LINE account. No name or photo is needed. (The sign-up screen is in Japanese.)",
    gateLockedList: "Still to come in this chapter",
    gateSignUp: "Sign up free to keep reading",
    gateSignIn: "Already a member? Log in",
    gateLoading: "Loading the rest of the chapter…",
    gateError: "The rest of the chapter could not be loaded.",
    gateRetry: "Try again",
    gateIndexNote:
      "Chapter 1 and the sources page are open to everyone; the other chapters can be read up to their first section. The rest is free with a member account.",
    disclaimerHeading: "About this record",
    disclaimerBody: [
      "This is a personal account of my own case, not legal advice. Procedures and time limits change. For your own situation, check with Acas, Citizens Advice, or a qualified adviser.",
      "Names of third parties (people connected to the respondent, representatives, case officers, colleagues, witnesses) as well as case numbers and contact details have been omitted or anonymised. The company is named only to the extent it appears in the public record.",
      "Throughout, I distinguish between what the tribunal actually decided and what I was told or understood at the time. The latter is my own recollection, not a finding of fact.",
    ],
  },
} as const;

export function t(locale: Locale) {
  return strings[locale];
}

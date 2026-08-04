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

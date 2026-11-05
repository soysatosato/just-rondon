// components/jobs/survey/copy.tsx
//
// アンケートの画面の文言。日本語(/jobs/service-charges/survey)と
// 英語(/en/jobs/service-charges/survey)。
//
// 英語版は、日本食店で働く日本人以外のスタッフ(キッチンに多い)に答えてもらう
// ためのもの。設問・選択肢・保存する値は日英で同じにして、集計は1つにまとめる。
// 判定の文章は utils/service-charge-diagnosis-text.ts が持つ。

import Link from "next/link";
import {
  DISTRIBUTION_LABEL,
  DISTRIBUTION_LEGAL_NOTE,
  JOB_ROLE_LABEL,
  WORK_PERIOD_LABEL,
  YES_NO_UNKNOWN_LABEL,
  type DistributionType,
  type JobRole,
  type WorkPeriod,
  type YesNoUnknown,
} from "@/utils/labels";
import type { DiagnosisLevel } from "@/utils/service-charge";
import type { SurveyLocale } from "@/utils/service-charge-diagnosis-text";

export type { SurveyLocale };

export type StepId = 1 | 2 | 3 | 4 | 5 | 6;

type CommentField = { label: string; hint: string; placeholder: string };

export type SurveyCopy = {
  optional: string;
  steps: Record<StepId, string>;
  stepCounter: (n: number, total: number, title: string) => string;
  answeringAbout: string;
  change: string;
  errorTitle: string;

  store: { label: string; hint: (stores: number, responses: number) => string };
  workPeriod: {
    label: string;
    hint: string;
    labels: Record<WorkPeriod, string>;
    over3yNote: string;
  };
  jobRole: { label: string; hint: string; labels: Record<JobRole, string> };
  collected: { label: string; yes: string; no: string; noNote: string };
  rate: { label: string; hint: string; other: string; unknown: string; aria: string };
  distribution: {
    label: string;
    hint: string;
    labels: Record<DistributionType, string>;
    legal: Record<DistributionType, string>;
    law: React.ReactNode;
  };
  yesNoUnknown: Record<YesNoUnknown, string>;
  detailsIntro: string;
  writtenPolicy: { label: string; hint: string };
  onPayslip: { label: string; hint: string };
  kitchen: { label: string; hint: string };
  amount: {
    label: string;
    hint: string;
    perMonthLabel: string;
    perMonth: string;
    hoursLabel: string;
    hoursUnit: string;
    amountPlaceholder: string;
    hoursPlaceholder: string;
    hourlySentence: (hourly: string, median: string | null) => string;
  };
  commentsIntro: React.ReactNode;
  comments: {
    serviceCharge: CommentField;
    meal: CommentField;
    general: CommentField;
  };
  result: {
    kicker: string;
    sub: string;
    whatHappensTitle: string;
    whatHappens: string[];
    skippedNote: string;
    answerDetails: string;
  };
  nav: {
    back: string;
    next: string;
    sending: string;
    send: string;
    skipToResult: string;
  };
  storeSearch: {
    placeholder: string;
    selected: string;
    notListed: string;
    manualName: string;
    manualAddress: string;
    manualNote: string;
    backToList: string;
  };
  diagnosis: {
    levels: Record<DiagnosisLevel, string>;
    yourHourly: string;
    perHour: string;
    median: string;
    findings: string;
    nextSteps: string;
    disclaimer: string;
  };
};

const JA: SurveyCopy = {
  optional: "任意",
  steps: {
    1: "店舗",
    2: "働き方",
    3: "サービスチャージ",
    4: "分配の中身",
    5: "自由記述",
    6: "判定と送信",
  },
  stepCounter: (n, total, title) => `ステップ ${n} / ${total}：${title}`,
  answeringAbout: "回答する店舗：",
  change: "変更",
  errorTitle: "入力内容をご確認ください",

  store: {
    label: "どの店舗について答えますか？",
    hint: (stores, responses) =>
      `これまでに ${stores} 店舗・${responses} 件の回答が集まっています。候補に出てこない場合は手入力もできます。`,
  },
  workPeriod: {
    label: "その職場で働いていたのはいつですか？",
    hint: "サービスチャージの全額分配が義務になったのは2024年10月1日です。いつの話かによって、当てはまる法律が変わります。",
    labels: WORK_PERIOD_LABEL,
    over3yNote: "全額分配の義務が始まったのは2024年10月1日です",
  },
  jobRole: {
    label: "どの職種で働いていましたか？",
    hint: "「キッチンには分配されない」という証言が繰り返し寄せられています。どちら側から見た話かによって、意味が変わります。",
    labels: JOB_ROLE_LABEL,
  },
  collected: {
    label: "この店舗は、お客様からサービスチャージを徴収していますか？",
    yes: "徴収している",
    no: "徴収していない",
    noNote: "この先の分配についての設問はスキップされます",
  },
  rate: {
    label: "料率は何％ですか？",
    hint: "レシートの「service charge」の行に書かれています。近年は15%を掲げる店も増えています。",
    other: "その他の料率",
    unknown: "わからない",
    aria: "サービスチャージの料率",
  },
  distribution: {
    label: "集めたサービスチャージは、どう分配されていますか？",
    hint: "他のスタッフから聞いた話でも構いません。実際に受け取っていなくても、分かる範囲でお答えください。",
    labels: DISTRIBUTION_LABEL,
    legal: DISTRIBUTION_LEGAL_NOTE,
    law: (
      <>
        <p>
          <span className="font-medium text-foreground">
            Employment (Allocation of Tips) Act 2023
          </span>
          （2024年10月1日施行）により、チップとサービスチャージは
          <span className="font-medium text-foreground">
            全額が働いた人のもの
          </span>
          と定められ、雇用主が税金・国民保険料以外を差し引くことは違法です。
        </p>
        <p className="mt-2">
          「時給に固定額で上乗せ」は、上乗せという方式そのものが違法なのではなく、
          <span className="font-medium text-foreground">
            店が集めた総額が全額スタッフに渡っているか
          </span>
          が分かれ目になります。
        </p>
        <p className="mt-2">
          <Link
            href="/jobs/service-charges"
            target="_blank"
            className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
          >
            サービスチャージの法律を読む ↗
          </Link>
        </p>
      </>
    ),
  },
  yesNoUnknown: YES_NO_UNKNOWN_LABEL,
  detailsIntro:
    "ここから先は、雇用主に義務づけられていることを、働く人の側から確認する設問です。分からない項目は「わからない」で構いません。",
  writtenPolicy: {
    label:
      "分配のルールを書いた文書（チップポリシー）を見たことがありますか？",
    hint: "分配の責任者・分配方法・サービスチャージの扱いを書面にし、働く人が読める状態にしておくことは、2024年10月から雇用主の義務です。",
  },
  onPayslip: {
    label: "給与明細に、サービスチャージが別項目として載っていますか？",
    hint: "別項目で出ていれば、いくら受け取ったかを自分で確認できます。従業員には過去3年分の支払い記録を閲覧する権利もあります。",
  },
  kitchen: {
    label: "キッチンスタッフにも分配されていますか？",
    hint: "分配の対象は「その職場で働く人」で、フロアに限られません。一律の除外は公平性の観点から問題になり得ます。",
  },
  amount: {
    label: "あなたが実際に受け取っている額を教えてください",
    hint: "店舗全体の総額ではなく、あなた個人が1ヶ月に受け取っている概算です。勤務時間もあわせて答えていただくと、他店と比べられる「時給換算」が出せます。",
    perMonthLabel: "1ヶ月に受け取る額",
    perMonth: "/ 月",
    hoursLabel: "1ヶ月の勤務時間（概算）",
    hoursUnit: "時間 / 月",
    amountPlaceholder: "例）250",
    hoursPlaceholder: "例）160",
    hourlySentence: (hourly, median) =>
      `サービスチャージは時給換算で £${hourly} です。` +
      (median ? ` この調査の中央値は £${median} です。` : ""),
  },
  commentsIntro: (
    <>
      集計の数字より、ここに書かれた具体的な話のほうが読まれています。
      <span className="font-medium text-foreground">
        個人が特定される情報は書かないでください。
      </span>
      すべて任意です。
    </>
  ),
  comments: {
    serviceCharge: {
      label: "サービスチャージについて",
      hint: "分配の実態、店側の説明、質問したときの反応など。",
      placeholder:
        "例）フロアスタッフのみで分配。キッチンには渡っていない。総額を聞いたが教えてもらえなかった。",
    },
    meal: {
      label: "賄いについて",
      hint: "回数、内容、提供されない食材、ドリンクの有無など。",
      placeholder: "例）1日1回、日替わりで選べない。ドリンクは水とお茶のみ。",
    },
    general: {
      label: "その他（職場について）",
      hint: "シフト、残業、休憩、人間関係、ビザサポートなど。良い点も書いてください。",
      placeholder: "個人が特定される情報は入力しないでください。",
    },
  },
  result: {
    kicker: "あなたの回答からの判定",
    sub: "送信する前に、いただいた回答を法律に照らして整理しました。送信せずにこのまま閉じても、この判定は変わりません。",
    whatHappensTitle: "送信すると、どうなりますか",
    whatHappens: [
      "店舗名とあわせて集計され、実態調査に匿名で反映されます。",
      "次にその店で働く人が、面接を受ける前に実態を知ることができます。",
      "自由記述は、運営が内容を確かめてから店舗ページに載せます。",
    ],
    skippedNote:
      "詳しい設問（チップポリシー・給与明細・キッチンへの分配）を飛ばしました。答えると、判定がより具体的になります。",
    answerDetails: "詳しい設問に答える",
  },
  nav: {
    back: "戻る",
    next: "次へ",
    sending: "送信中...",
    send: "この内容で送信する",
    skipToResult: "残りの設問を飛ばして、判定と送信へ",
  },
  storeSearch: {
    placeholder: "店舗名を検索",
    selected: "選択中: ",
    notListed: "リストにない場合はこちら",
    manualName: "店舗名（必須）",
    manualAddress: "住所（任意）",
    manualNote:
      "リスト未登録の店舗として送信されます。確認され次第マスタに反映されるため、それまでダッシュボードには表示されない場合があります。",
    backToList: "リストから検索する",
  },
  diagnosis: {
    levels: {
      alert: "要注意",
      check: "確認が必要",
      clear: "問題なし",
      unknown: "情報不足",
    },
    yourHourly: "あなたの時給換算",
    perHour: "/ 時",
    median: "この調査の中央値",
    findings: "回答から分かること",
    nextSteps: "次にやること",
    disclaimer:
      "この判定は、いただいた回答を Employment (Allocation of Tips) Act 2023 の条文と Acas の解説に照らして機械的に当てはめたものです。法的助言ではなく、個別の事情によって結論は変わります。実際に手続きを取る前に Acas または資格を持つ専門家にご確認ください。",
  },
};

const EN: SurveyCopy = {
  optional: "Optional",
  steps: {
    1: "Restaurant",
    2: "Your work",
    3: "Service charge",
    4: "How it's shared",
    5: "Comments",
    6: "Result & send",
  },
  stepCounter: (n, total, title) => `Step ${n} of ${total}: ${title}`,
  answeringAbout: "Answering about: ",
  change: "Change",
  errorTitle: "Please check your answers",

  store: {
    label: "Which restaurant are you answering about?",
    hint: (stores, responses) =>
      `${responses} answers about ${stores} restaurants so far. If yours isn't listed, you can type it in.`,
  },
  workPeriod: {
    label: "When did you work there?",
    hint: "Passing on service charges in full became a legal duty on 1 October 2024. Which rules apply depends on when this was.",
    labels: {
      current: "I still work there",
      within1y: "Within the last year",
      "1to3y": "1–3 years ago",
      over3y: "More than 3 years ago",
    },
    over3yNote: "The duty to pass on service charges in full began on 1 October 2024",
  },
  jobRole: {
    label: "What was your role?",
    hint: "We keep hearing that kitchen staff get nothing. Which side you saw it from changes what an answer means.",
    labels: {
      floor: "Front of house (floor)",
      kitchen: "Kitchen",
      both: "Both floor and kitchen",
      other: "Other (manager, bar, reception, etc.)",
    },
  },
  collected: {
    label: "Does this restaurant add a service charge to customers' bills?",
    yes: "Yes",
    no: "No",
    noNote: "The questions about how it's shared will be skipped",
  },
  rate: {
    label: "What is the rate?",
    hint: "It's on the \"service charge\" line of the receipt. More places now charge 15%.",
    other: "Another rate",
    unknown: "Not sure",
    aria: "Service charge rate",
  },
  distribution: {
    label: "How is the service charge shared out?",
    hint: "Something you heard from coworkers is fine. Answer as far as you know, even if you never received any yourself.",
    labels: {
      equal: "Split equally among staff",
      gradient: "Weighted by role, hours or similar",
      fixed: "A fixed amount added to the hourly rate",
      none: "Not shared with staff",
    },
    legal: {
      equal: "Lawful",
      gradient: "Lawful if the criteria are written in the policy",
      fixed: "Likely unlawful if most of it stays with the owner",
      none: "Likely unlawful",
    },
    law: (
      <>
        <p>
          Under the{" "}
          <span className="font-medium text-foreground">
            Employment (Allocation of Tips) Act 2023
          </span>{" "}
          (in force from 1 October 2024), tips and service charges{" "}
          <span className="font-medium text-foreground">
            belong in full to the people who work for them
          </span>
          . It is unlawful for an employer to deduct anything other than tax
          and National Insurance.
        </p>
        <p className="mt-2">
          A fixed top-up on the hourly rate is not unlawful in itself. What
          matters is{" "}
          <span className="font-medium text-foreground">
            whether the total the restaurant collects reaches staff in full
          </span>
          .
        </p>
        <p className="mt-2">
          <a
            href="https://www.acas.org.uk/tips-and-service-charges"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground underline underline-offset-2 hover:opacity-80"
          >
            Read the Acas guide ↗
          </a>
        </p>
      </>
    ),
  },
  yesNoUnknown: { yes: "Yes", no: "No", unknown: "Not sure" },
  detailsIntro:
    "These questions check, from the worker's side, what the employer is required to do. \"Not sure\" is fine.",
  writtenPolicy: {
    label:
      "Have you seen a written document setting out how tips are shared (a tipping policy)?",
    hint: "Since October 2024, employers must put in writing who shares out tips, how, and how the service charge is handled, and make it available to workers.",
  },
  onPayslip: {
    label: "Does the service charge appear as a separate line on your payslip?",
    hint: "If it does, you can check what you received. Workers also have the right to see the tip records for the past 3 years.",
  },
  kitchen: {
    label: "Do kitchen staff get a share too?",
    hint: "Sharing covers the people who work at the place, not only front of house. Leaving a whole group out can be unfair.",
  },
  amount: {
    label: "How much do you actually receive?",
    hint: "Not the restaurant's total — roughly what you personally get in a month. If you also give your hours, we can work out an hourly figure to compare with other places.",
    perMonthLabel: "Amount per month",
    perMonth: "/ month",
    hoursLabel: "Hours worked per month (approx.)",
    hoursUnit: "hours / month",
    amountPlaceholder: "e.g. 250",
    hoursPlaceholder: "e.g. 160",
    hourlySentence: (hourly, median) =>
      `That's £${hourly} an hour from the service charge.` +
      (median ? ` The median in this survey is £${median}.` : ""),
  },
  commentsIntro: (
    <>
      Specific stories here are read more than the numbers. You can write in
      English.{" "}
      <span className="font-medium text-foreground">
        Please don&apos;t include anything that identifies a person.
      </span>{" "}
      Everything here is optional.
    </>
  ),
  comments: {
    serviceCharge: {
      label: "About the service charge",
      hint: "How it's shared, what the restaurant told you, how they reacted when you asked.",
      placeholder:
        "e.g. Only floor staff get a share; nothing goes to the kitchen. I asked for the total and wasn't told.",
    },
    meal: {
      label: "About staff meals",
      hint: "How often, what's included, food you can't have, drinks.",
      placeholder: "e.g. One meal a day, no choice. Only water and tea to drink.",
    },
    general: {
      label: "Anything else about the workplace",
      hint: "Shifts, overtime, breaks, the team, visa sponsorship. Good things too.",
      placeholder: "Please don't include anything that identifies a person.",
    },
  },
  result: {
    kicker: "What your answers suggest",
    sub: "Before you send, we've checked your answers against the law. Closing this page without sending won't change the result.",
    whatHappensTitle: "What happens when you send",
    whatHappens: [
      "It's counted anonymously under the restaurant's name and added to the survey results.",
      "The next person to work there can see what it's really like before their interview.",
      "Comments are checked by the editor before they appear on the restaurant's page.",
    ],
    skippedNote:
      "You skipped the detailed questions (tipping policy, payslip, kitchen staff). Answering them makes the result more specific.",
    answerDetails: "Answer them",
  },
  nav: {
    back: "Back",
    next: "Next",
    sending: "Sending...",
    send: "Send these answers",
    skipToResult: "Skip the rest and see the result",
  },
  storeSearch: {
    placeholder: "Search for the restaurant",
    selected: "Selected: ",
    notListed: "Not on the list? Enter it yourself",
    manualName: "Restaurant name (required)",
    manualAddress: "Address (optional)",
    manualNote:
      "This will be sent as an unlisted restaurant. It may not appear in the results until we've checked it.",
    backToList: "Search the list instead",
  },
  diagnosis: {
    levels: {
      alert: "Needs attention",
      check: "Worth checking",
      clear: "No issues found",
      unknown: "Not enough information",
    },
    yourHourly: "Your hourly figure",
    perHour: "/ hr",
    median: "Median in this survey",
    findings: "What your answers show",
    nextSteps: "What to do next",
    disclaimer:
      "This result applies the Employment (Allocation of Tips) Act 2023 and Acas guidance mechanically to your answers. It is not legal advice, and individual circumstances can change the conclusion. Check with Acas or a qualified adviser before taking any formal step.",
  },
};

export const SURVEY_COPY: Record<SurveyLocale, SurveyCopy> = { ja: JA, en: EN };

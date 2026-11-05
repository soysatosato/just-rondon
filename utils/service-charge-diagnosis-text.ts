// utils/service-charge-diagnosis-text.ts
//
// 自己診断(utils/service-charge.ts の diagnose)の文章。日本語と英語。
//
// 英語版のアンケート(/en/jobs/service-charges/survey)は、日本食店で働く
// 日本人以外のスタッフに向けたもの。判定の論理は1つだけにして、言葉だけを
// ここで持ち替える。根拠と断定の範囲は日英で同じにすること。
//
// 申立て期限は lib/jobs/claim-deadline.ts と同じ: 不公正な分配(s.27K)は12か月、
// ポリシー・記録の不開示(s.27N)は6か月(2026年9月30日以前の不開示は3か月)。

import type { DistributionType } from "./labels";
import type { DiagnosisLevel } from "./service-charge";

export type SurveyLocale = "ja" | "en";

type FindingText = { title: string; body: string };

type ActionText = {
  title: string;
  body: string;
  href: string;
  external?: boolean;
};

export type DiagnosisText = {
  levelHeadline: Record<DiagnosisLevel, string>;
  notCollected: { headline: string; lead: string; cashTips: FindingText };
  distribution: Record<DistributionType, FindingText>;
  policyMissing: FindingText;
  policyUnknown: FindingText;
  notOnPayslip: FindingText;
  kitchenExcluded: FindingText;
  over3y: FindingText;
  hourly: (amount: string) => FindingText;
  lead: {
    alert: string;
    check: string;
    /** 等分配・傾斜配分と答えて、問題が見当たらなかったとき。 */
    clearShared: string;
    clear: string;
    unknown: string;
  };
  actions: {
    askPolicy: ActionText;
    keepRecords: ActionText;
    calculate: ActionText;
    deadlines: ActionText;
    minimumWage: ActionText;
    acas: ActionText;
  };
};

const ACAS_TIPS_URL = "https://www.acas.org.uk/tips-and-service-charges";

const JA: DiagnosisText = {
  levelHeadline: {
    alert: "法律に反している可能性が高い項目があります",
    check: "確認したほうがよい項目があります",
    clear: "大きな問題は見当たりませんでした",
    unknown: "判断するには情報が足りません",
  },
  notCollected: {
    headline: "サービスチャージを徴収していない職場です",
    lead: "Tipping Act 2023 が対象にするのは、雇用主が管理・影響できるチップとサービスチャージです。徴収していない職場では、この法律の分配義務そのものが発生しません。",
    cashTips: {
      title: "現金で直接受け取るチップは対象外",
      body: "客から直接手渡され、雇用主がいっさい関与しないチップは法律の対象外です。逆に、カード決済のチップを店がいったん預かって配っているなら、名前が何であれ分配義務がかかります。",
    },
  },
  distribution: {
    none: {
      title: "集めたサービスチャージが1ポンドも渡っていない",
      body: "2024年10月1日以降、チップ・サービスチャージは全額が働いた人のものと定められています。雇用主が差し引けるのは税金と国民保険料だけです。まったく分配されていない状態は、Tipping Act 2023 に反している可能性が高いと言えます。",
    },
    fixed: {
      title: "「時給に固定額で上乗せ」は、それだけでは判断できない",
      body: "上乗せという方式そのものが違法なのではありません。分かれ目は、店が集めた総額が全額スタッフに渡っているかどうかです。上乗せの合計が集めた総額を下回り、差額が店に残っているなら違法です。総額の開示を求めてください。",
    },
    gradient: {
      title: "傾斜配分は、基準が書面にあれば適法",
      body: "役職や勤務時間に応じて配分を変えること自体は認められています。ただし法律が求めているのは「公平で透明性のある分配」なので、その基準がチップポリシーに書かれている必要があります。",
    },
    equal: {
      title: "分配の方法そのものには問題がなさそう",
      body: "等分配は Code of Practice が想定する形のひとつです。残る論点は、集めた総額がそのまま分配に回っているかどうかになります。",
    },
  },
  policyMissing: {
    title: "書面のチップポリシーが存在しない",
    body: "分配のルールを書面にし、働く人が読める状態にしておくことは、2024年10月1日から雇用主の義務です。ポリシーや記録が開示されない場合の申立て期限は6か月（2026年9月30日以前の不開示は3か月）なので、未払いの請求（12か月）とは分けて考えてください。",
  },
  policyUnknown: {
    title: "チップポリシーは「見せてください」と言える",
    body: "すべての労働者がチップポリシーにアクセスできるようにすることは雇用主の義務です。分配の責任者・分配方法・サービスチャージの扱いが書かれているはずなので、まずは開示を求めるところから始められます。",
  },
  notOnPayslip: {
    title: "給与明細に別項目で出ていない",
    body: "いくら受け取ったのかを自分で確認できない状態です。従業員には過去3年間のチップ支払い記録を閲覧する権利があり、雇用主には3年間の記録保存義務があります。記録の請求は、未払いを計算する前提になります。",
  },
  kitchenExcluded: {
    title: "キッチンが分配から外されている",
    body: "分配の対象は「その職場で働く人」であり、フロアに限られません。キッチンスタッフを一律に除外する運用は、公平性の観点から問題になり得ます。役割に応じた重み付けは可能ですが、その基準はポリシーに書かれている必要があります。",
  },
  over3y: {
    title: "3年以上前の経験は、法律が違う可能性がある",
    body: "全額分配の義務が始まったのは2024年10月1日です。それ以前の運用は、いまの基準では測れません。記録の保存義務も3年なので、当時の資料が残っていない可能性もあります。",
  },
  hourly: (amount) => ({
    title: `サービスチャージは時給換算で £${amount}`,
    body: "この額は最低賃金とは別に受け取るべきものです。時給が最低賃金に届かない分をサービスチャージで埋める運用は違法で、チップは最低賃金の「上に」乗ります。給与明細で、基本時給だけで最低賃金を満たしているか確認してください。",
  }),
  lead: {
    alert:
      "回答の中に、Tipping Act 2023 が禁じている状態にあたる可能性の高いものがありました。いますぐ争う必要はありませんが、記録を残すことだけは先に始めてください。",
    check:
      "ただちに違法と言い切れるものではないものの、店に確認すれば白黒がつく項目があります。確認の求め方も下にまとめました。",
    clearShared:
      "回答の範囲では、法律が求めている形から外れているところは見当たりませんでした。残る論点は「集めた総額が全額渡っているか」だけです。",
    clear: "回答の範囲では、目立った問題は見当たりませんでした。",
    unknown:
      "分からない項目が多いままでも構いません。下の順番で確認していけば、自分の職場がどちらなのかは判断できます。",
  },
  actions: {
    askPolicy: {
      title: "チップポリシーの開示を求める",
      body: "「分配のルールを書いたものを見せてください」と伝えるだけです。開示は義務なので、断られた事実そのものが記録になります。",
      href: "/jobs/service-charges#section-286",
    },
    keepRecords: {
      title: "給与明細とシフト表を手元に残す",
      body: "未払いを計算するのに要る記録は、給与明細・シフト表・売上記録（Zレポート）の3つだけです。在職中のうちに揃うものは揃えておきます。",
      href: "/jobs/service-charges/case-story/check-your-service-charge",
    },
    calculate: {
      title: "未払い額を自分で計算する",
      body: "審判所で実際に認容された計算方法を、数字ごと公開しています。「その日の総サービスチャージ ÷ その日の稼働人数 × 自分の実稼働日数」が出発点です。",
      href: "/jobs/service-charges/case-story/check-your-service-charge",
    },
    deadlines: {
      title: "期限を確認する",
      body: "未払いチップの申立ては12か月以内、ポリシーや記録の不開示は6か月以内（2026年9月30日以前の不開示は3か月以内）です。起点は「支払われるべきだった日」なので、辞めたあとでも請求できます。",
      href: "/jobs/service-charges#section-286",
    },
    minimumWage: {
      title: "基本時給だけで最低賃金を満たしているか見る",
      body: "チップを最低賃金の補填に使うことは違法です。サービスチャージを除いた基本時給が法定額に届いているかを確認してください。",
      href: "/jobs/minimum-wage",
    },
    acas: {
      title: "Acas に相談する（無料・雇用主に連絡は行かない）",
      body: "審判所に申し立てる場合、その前に Acas の Early Conciliation を経ることが原則として必須です。順序を間違えると受理されません。",
      href: ACAS_TIPS_URL,
      external: true,
    },
  },
};

const EN: DiagnosisText = {
  levelHeadline: {
    alert: "Some of your answers point to a likely breach of the law",
    check: "Some things are worth checking",
    clear: "No major problems found",
    unknown: "Not enough information to judge",
  },
  notCollected: {
    headline: "This workplace doesn't add a service charge",
    lead: "The Tipping Act 2023 covers tips and service charges that the employer controls or influences. Where no service charge is collected, the duty to share it out doesn't arise.",
    cashTips: {
      title: "Cash tips handed straight to you are not covered",
      body: "Tips a customer gives you directly, with no involvement from the employer, fall outside the Act. But if card tips are held by the restaurant and then paid out, the duty to share them applies whatever they are called.",
    },
  },
  distribution: {
    none: {
      title: "None of the service charge reaches staff",
      body: "Since 1 October 2024, tips and service charges belong in full to the people who work for them. The employer may only deduct tax and National Insurance. Paying staff nothing at all is likely to breach the Tipping Act 2023.",
    },
    fixed: {
      title: "A fixed top-up on the hourly rate can't be judged on its own",
      body: "A top-up is not unlawful in itself. What matters is whether the total the restaurant collects reaches staff in full. If the top-ups add up to less than what was collected and the rest stays with the business, that is unlawful. Ask for the total.",
    },
    gradient: {
      title: "Weighted sharing is lawful if the rules are written down",
      body: "Sharing more or less by role or hours is allowed. But the law requires sharing to be fair and transparent, so the criteria need to be set out in the tipping policy.",
    },
    equal: {
      title: "The way it is shared looks fine",
      body: "An equal split is one of the arrangements the Code of Practice expects. The remaining question is whether the whole amount collected goes into the split.",
    },
  },
  policyMissing: {
    title: "There is no written tipping policy",
    body: "Since 1 October 2024, employers must put their tipping rules in writing and make them available to workers. The time limit for a claim that the policy or records were not provided is 6 months (3 months if the failure was on or before 30 September 2026), so treat it separately from a claim for unpaid tips (12 months).",
  },
  policyUnknown: {
    title: "You can ask to see the tipping policy",
    body: "Employers must make the tipping policy available to every worker. It should say who decides the sharing, how it is shared and how the service charge is handled, so asking for it is a simple first step.",
  },
  notOnPayslip: {
    title: "It isn't shown separately on your payslip",
    body: "That means you can't check what you were paid. Workers have the right to see the tip records for the past 3 years, and employers must keep them for 3 years. Asking for the records is the starting point for working out anything unpaid.",
  },
  kitchenExcluded: {
    title: "Kitchen staff are left out",
    body: "Sharing covers the people who work at the place, not only front of house. Leaving all kitchen staff out can be unfair. Weighting by role is allowed, but the criteria must be in the policy.",
  },
  over3y: {
    title: "More than 3 years ago, a different law may apply",
    body: "The duty to pass on service charges in full began on 1 October 2024, so earlier practice can't be measured against today's rules. Records only have to be kept for 3 years, so they may no longer exist.",
  },
  hourly: (amount) => ({
    title: `Your service charge works out at £${amount} an hour`,
    body: "This should come on top of the minimum wage. Using service charge to make up a basic rate below the minimum wage is unlawful. Check on your payslip that your basic hourly rate alone meets the minimum wage.",
  }),
  lead: {
    alert:
      "Something in your answers is likely to be what the Tipping Act 2023 prohibits. You don't need to start a dispute now, but do start keeping records.",
    check:
      "Nothing here is clearly unlawful yet, but asking the restaurant would settle it one way or the other. How to ask is set out below.",
    clearShared:
      "From your answers, nothing departs from what the law requires. The one remaining question is whether the whole amount collected reaches staff.",
    clear: "From your answers, nothing stands out as a problem.",
    unknown:
      "It's fine to leave things as 'not sure'. Working through the steps below will tell you which side your workplace is on.",
  },
  actions: {
    askPolicy: {
      title: "Ask to see the tipping policy",
      body: "Just say: \"Can I see the written rules for how tips are shared?\" Employers have to provide it, so a refusal is itself on the record.",
      href: "https://www.gov.uk/government/publications/distributing-tips-fairly-statutory-code-of-practice",
      external: true,
    },
    keepRecords: {
      title: "Keep your payslips and rotas",
      body: "To work out what you're owed you need three things: payslips, rotas and the sales records (Z reports). Collect what you can while you still work there.",
      href: "/en/jobs/service-charges/case-story/check-your-service-charge",
    },
    calculate: {
      title: "Work out what you're owed",
      body: "The calculation an Employment Tribunal actually accepted is published in full, with the figures. The starting point is: the day's total service charge ÷ the number of staff working that day × the days you worked.",
      href: "/en/jobs/service-charges/case-story/check-your-service-charge",
    },
    deadlines: {
      title: "Check the time limits",
      body: "A claim about unpaid tips must be made within 12 months; a claim that the policy or records weren't provided within 6 months (3 months if the failure was on or before 30 September 2026). Time runs from when you should have been paid, so you can still claim after leaving.",
      href: "/en/jobs/service-charges/case-story/how-to-file-a-claim",
    },
    minimumWage: {
      title: "Check your basic rate meets the minimum wage",
      body: "Tips can't be used to top up pay to the minimum wage. Check that your hourly rate without the service charge reaches the legal minimum.",
      href: "https://www.gov.uk/national-minimum-wage-rates",
      external: true,
    },
    acas: {
      title: "Talk to Acas (free, and your employer isn't contacted)",
      body: "Before making a tribunal claim you normally have to go through Acas Early Conciliation. If you skip it, the claim won't be accepted.",
      href: ACAS_TIPS_URL,
      external: true,
    },
  },
};

export const DIAGNOSIS_TEXT: Record<SurveyLocale, DiagnosisText> = {
  ja: JA,
  en: EN,
};

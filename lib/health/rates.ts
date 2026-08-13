/**
 * イングランドの医療にかかる金額・電話番号・期間を一元管理する。
 *
 * なぜ定数にするか:
 * NHS の患者負担額(処方箋・歯科・眼科)は毎年4月1日に改定される。
 * 2025年と2026年は処方箋料が凍結されたが、これは政治判断による例外であって
 * 恒久措置ではない。金額を記事本文にべた書きすると、次の4月に全記事を
 * grep して回ることになり、必ず取りこぼす。
 *
 * 運用ルール:
 * 1. 記事から数値を書くときは必ずここを参照する(`gbp(NHS_CHARGES.prescriptionItem)` の形)。
 * 2. 改定時はこのファイルと HEALTH_AS_OF / HEALTH_UPDATED_AT だけを更新する。
 * 3. 出典は HEALTH_SOURCES に持つ。裏取りせずに数値を書き換えないこと。
 * 4. 制度はイングランドのもの。スコットランド・ウェールズ・北アイルランドは
 *    処方箋が無料など前提から違うので、記事側で必ず「イングランドの」と明示する。
 *
 * 金額はすべて GBP。2026年8月13日に nhs.uk・nhsbsa.nhs.uk・gov.uk で確認。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const HEALTH_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const HEALTH_UPDATED_AT = "2026-08-13";

/** 患者負担額の改定日。毎年4月1日。 */
export const HEALTH_CHARGE_REVISION = "毎年4月1日";

/**
 * NHS の患者負担額(イングランド)。
 *
 * 「NHS は無料」は半分だけ正しい。GP の診察・A&E・入院は無料だが、
 * 処方箋・歯科・眼科には定額の自己負担がある。日本語圏で最も誤解が多い点。
 */
export const NHS_CHARGES = {
  /**
   * 処方箋1品目あたり。2025年4月・2026年4月と2年連続で据え置かれた。
   * 「1回いくら」ではなく「1品目いくら」なので、3種類出れば3倍かかる。
   */
  prescriptionItem: 9.9,

  /** 処方箋前払い証(PPC)3ヶ月分。4品目以上で元が取れる。 */
  ppc3Months: 32.05,
  /** PPC 12ヶ月分。12品目以上で元が取れる。10回の分割払いも可。 */
  ppc12Months: 114.5,
  /** 3ヶ月PPCが得になる品目数の下限。 */
  ppc3MonthsBreakEvenItems: 4,
  /** 12ヶ月PPCが得になる品目数の下限。 */
  ppc12MonthsBreakEvenItems: 12,

  /** 歯科 Band 1: 検診・レントゲン・歯石除去。 */
  dentalBand1: 27.9,
  /** 歯科 Band 2: 詰め物・抜歯・根管治療。 */
  dentalBand2: 76.6,
  /** 歯科 Band 3: 冠・入れ歯・ブリッジ。 */
  dentalBand3: 332.1,
} as const;

/**
 * Immigration Health Surcharge(移民健康保険料)。
 *
 * ビザ申請時に滞在年数ぶんを一括前払いする。これを払っているからこそ
 * NHS を居住者と同じ条件で使える。「保険に入っていないから病院に行けない」
 * と思い込んでいる人が多いが、IHS を払った時点で受診資格はある。
 */
export const IHS = {
  /** 一般の成人(就労ビザなど)の年額。 */
  perYearStandard: 1035,
  /** 学生・YMS(ワーホリ)・18歳未満の年額。 */
  perYearStudentAndYms: 776,
  /** 6ヶ月以下の海外申請は課金されない。 */
  exemptUnderMonths: 6,
} as const;

/**
 * 緊急時の連絡先。命に関わるので数値と同格で管理する。
 *
 * 111 の存在が日本語圏で決定的に知られていない。
 * 「救急車か、我慢か」の二択だと思われているが、実際は間に 111 がある。
 */
export const NHS_CONTACTS = {
  /** 生命に関わる緊急時。救急車・警察・消防。 */
  emergency: "999",
  /** 緊急ではないが判断に迷うとき。24時間・無料・通訳あり。 */
  nonEmergency: "111",
  /** GP に登録を拒否された場合の相談先(NHS England)。 */
  englandContactCentre: "0300 311 22 33",
  /** PPC の電話購入窓口。 */
  ppcPhone: "0300 330 1341",
} as const;

/** GP 登録の実務。 */
export const GP_REGISTRATION = {
  /** オンライン登録の所要時間。 */
  onlineFormMinutes: "10〜15分",
  /** 診療所が登録可否を返すまでの上限(稼働日)。 */
  practiceResponseWorkingDays: 5,
} as const;

/** ポンド表記。小数以下が .00 のときは省く。 */
export function gbp(value: number) {
  return `£${value.toFixed(2).replace(/\.00$/, "")}`;
}

/** PPC を使ったときの年間の損益分岐を文章で出すためのヘルパー。 */
export function ppc12MonthsSaving(itemsPerYear: number) {
  return itemsPerYear * NHS_CHARGES.prescriptionItem - NHS_CHARGES.ppc12Months;
}

/**
 * 出典。記事の GuideSources に渡す。
 * 数値を更新するときは、必ずこのリストを開いて裏を取ること。
 */
export const HEALTH_SOURCES = [
  {
    label: "NHS - Register with a GP surgery",
    url: "https://www.nhs.uk/nhs-services/gps/how-to-register-with-a-gp-surgery/",
  },
  {
    label: "NHS - Get help with prescription costs",
    url: "https://www.nhs.uk/nhs-services/prescriptions/get-help-with-prescription-costs/",
  },
  {
    label: "NHSBSA - Prescription prepayment certificate (PPC)",
    url: "https://www.nhsbsa.nhs.uk/help-nhs-prescription-costs/nhs-prescription-prepayment-certificate-ppc",
  },
  {
    label: "NHS - Understanding NHS dental charges",
    url: "https://www.nhs.uk/nhs-services/dentists/understanding-nhs-dental-charges/",
  },
  {
    label: "GOV.UK - Pay for UK healthcare as part of your immigration application",
    url: "https://www.gov.uk/healthcare-immigration-application/how-much-pay",
  },
  {
    label: "GOV.UK - NHS entitlements: migrant health guide",
    url: "https://www.gov.uk/guidance/nhs-entitlements-migrant-health-guide",
  },
] as const;

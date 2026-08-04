/**
 * 英国ビザの料金・所得閾値・制度変更日を一元管理する。
 *
 * なぜ定数にするか:
 * 英国の申請料は「毎年4月に一斉改定」される(直近は2026年4月8日、6〜7%増)。
 * IHS・給与閾値・維持費もそれぞれ別のタイミングで動く。
 * 数値を記事本文にべた書きすると、改定のたびに全記事を grep して回ることになり、
 * 必ず取りこぼす。実際に旧 /visa/uk-visa-guide-2025 は ETA £16・
 * Standard Visitor £127・Student £524 と、1年以上前の料金を掲載し続けていた。
 *
 * 運用ルール:
 * 1. 記事から数値を書くときは必ずここを参照する(`gbp(VISA_FEES.eta)` の形)。
 * 2. 改定時はこのファイルと RATES_AS_OF / RATES_UPDATED_AT だけを更新する。
 * 3. 出典は VISA_SOURCES に持つ。裏取りせずに数値を書き換えないこと。
 *
 * すべて GBP。数値は 2026年8月4日に gov.uk で確認。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const RATES_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const RATES_UPDATED_AT = "2026-08-04";

/**
 * 申請料。
 * Skilled Worker と Family は「英国外から / 英国内から」で額が違い、
 * さらに Skilled Worker は滞在3年以下 / 3年超で倍近く変わる。
 */
export const VISA_FEES = {
  /** 電子渡航認証。2026年4月8日に £16 から改定。 */
  eta: 20,
  /** Standard Visitor(最長6ヶ月)。日本国籍は原則ETAで足りるので通常不要。 */
  standardVisitor6m: 135,
  student: 558,
  graduate: 937,
  /** Youth Mobility Scheme(ワーホリ)。2026年4月8日に £319 から改定。 */
  youthMobility: 340,

  skilledWorker: {
    outsideUpTo3y: 819,
    outsideOver3y: 1618,
    insideUpTo3y: 943,
    insideOver3y: 1865,
    /** Immigration Salary List 掲載職種の割引額。英国内外を問わず同額。 */
    salaryListUpTo3y: 628,
    salaryListOver3y: 1235,
  },

  globalTalent: {
    /** 推薦(エンドースメント)申請と査証申請の2段階。合計 £766。 */
    endorsement: 561,
    visa: 205,
    total: 766,
  },

  highPotentialIndividual: {
    application: 880,
    /** Ecctis による学位の同等性証明。申請前に必須で、税込。 */
    ecctisVerification: 252,
  },

  familyPartner: {
    outside: 2064,
    inside: 1407,
  },

  /** 永住権(Indefinite Leave to Remain)。 */
  ilr: 3226,
  /** 市民権(帰化)。 */
  naturalisation: 1709,

  /** 優先審査。2023年10月4日から据え置き(2026年4月改定でも変更なし)。1人あたり。 */
  priority: 500,
  superPriority: 1000,

  /** ビザ申請センターでの生体情報登録。国・拠点により変動。 */
  biometric: 19.2,
} as const;

/**
 * IHS(Immigration Health Surcharge / 医療サーチャージ)。年額・前払い。
 * 払えば NHS を利用できる。申請が却下された場合は IHS のみ返金される
 * (申請料は返らない)。
 */
export const IHS_PER_YEAR = {
  /** 就労・家族ビザなど一般。 */
  standard: 1035,
  /** 学生・ユースモビリティ・申請時18歳未満・学生の扶養家族。 */
  discounted: 776,
} as const;

/**
 * 所得・資金の閾値。
 * 「いくら持っていれば申請できるか」は却下理由の最頻出項目なので、
 * 記事側では必ずこの定数から書き出す。
 */
export const VISA_THRESHOLDS = {
  skilledWorker: {
    /** 一般の最低年収。職種ごとの going rate と比べて高い方を満たす必要がある。 */
    general: 41700,
    /** New entrant(就業初期)・博士号保持者などの割引後の最低年収。 */
    discounted: 33400,
    /** スポンサーが証明しない場合に本人が示す生活資金。 */
    maintenance: 1270,
  },

  youthMobility: {
    /** 本人名義の口座に必要な残高。 */
    funds: 2530,
    /** 上記残高を連続して維持すべき日数。 */
    fundsDays: 28,
  },

  student: {
    /** ロンドン内の教育機関。月額 × 最大9ヶ月。 */
    maintenanceLondonPerMonth: 1529,
    /** ロンドン外の教育機関。月額 × 最大9ヶ月。 */
    maintenanceOutsideLondonPerMonth: 1171,
    maintenanceMaxMonths: 9,
    /** 資金を連続保持すべき日数。 */
    fundsDays: 28,
  },

  family: {
    /** 配偶者・パートナービザの最低所得(2024年4月導入)。子の人数で増額されない。 */
    minimumIncome: 29000,
    /** 所得の代わりに使える現金貯蓄。 */
    cashSavings: 88500,
  },
} as const;

/**
 * 雇用主(スポンサー)側の費用。
 * 求職者が「なぜスポンサーしてもらえないのか」を理解するために必要な数字。
 * 日本人求職者がこれを知らずに交渉して失敗する例が多い。
 */
export const SPONSOR_COSTS = {
  /** Immigration Skills Charge。年額。2025年12月16日に32%増。 */
  skillsChargeLargePerYear: 1320,
  skillsChargeSmallPerYear: 480,
  /** スポンサーライセンス申請料。2026年4月8日改定。 */
  licenceLarge: 1682,
  licenceSmall: 611,
} as const;

/**
 * 制度変更の施行日・期限。
 * 「いつ申請したか」で適用ルールが変わる項目が増えているため、
 * 記事では必ず日付とセットで書く。
 */
export const VISA_KEY_DATES = {
  /** Skilled Worker の技能要件が RQF3 → RQF6(学士相当)へ。約180職種が対象外に。 */
  rqf6From: "2025-07-22",
  /** 介護職(care worker)の海外からの新規採用が停止。 */
  careWorkerOverseasClosedFrom: "2025-07-22",
  /** Skilled Worker の英語要件が B1 → B2 へ。 */
  englishB2From: "2027-03-26",
  /** Graduate visa の標準付与期間が2年 → 18ヶ月へ(博士は3年のまま)。 */
  graduate18MonthsFrom: "2027-01-01",
  /** ETA が全面施行され、未取得だと搭乗を拒否されるようになった日。 */
  etaFullyEnforcedFrom: "2026-02-25",
  /** BRP(在留カード)が一斉失効し、eVisa へ完全移行した日。 */
  brpExpiredOn: "2024-12-31",
} as const;

/** ユースモビリティの日本枠。2024年1月31日に1,500 → 6,000へ拡大。抽選なし・通年申請可。 */
export const JAPAN_YMS_QUOTA = 6000;

/** 標準審査期間(英国外からの申請)。単位は「英国の営業週」。 */
export const PROCESSING_WEEKS = {
  visitor: 3,
  student: 3,
  work: 3,
  family: 12,
} as const;

/**
 * 数値を記事本文に埋めるためのフォーマッタ。
 * 端数のある £19.20 だけ小数第2位まで出す。
 */
export function gbp(amount: number): string {
  const hasFraction = !Number.isInteger(amount);
  return `£${amount.toLocaleString("en-GB", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** ISO日付("2025-07-22")を和文表記("2025年7月22日")にする。 */
export function jpDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

/** 円換算の目安。為替は動くので記事では「約」を付けて使うこと。 */
export function gbpWithYen(amount: number, rate = 195): string {
  const yen = Math.round((amount * rate) / 1000) * 1000;
  return `${gbp(amount)}（約${yen.toLocaleString("ja-JP")}円）`;
}

/**
 * ユースモビリティの総額。滞在年数(2 or 3)を渡す。
 * 申請料 + IHS(年額 × 年数) + 生体情報登録料。
 */
export function ymsTotalCost(years: 2 | 3): number {
  return (
    VISA_FEES.youthMobility +
    IHS_PER_YEAR.discounted * years +
    VISA_FEES.biometric
  );
}

/** 出典。記事の sources に流し込んで使う。 */
export const VISA_SOURCES = {
  fees: {
    label: "GOV.UK: Visa fees（申請料一覧）",
    url: "https://www.gov.uk/government/publications/visa-regulations-revised-table",
  },
  ihs: {
    label: "GOV.UK: Immigration health surcharge（医療サーチャージ）",
    url: "https://www.gov.uk/healthcare-immigration-application/how-much-pay",
  },
  eta: {
    label: "GOV.UK: Electronic Travel Authorisation（ETA）",
    url: "https://www.gov.uk/guidance/apply-for-an-electronic-travel-authorisation-eta",
  },
  yms: {
    label: "GOV.UK: Youth Mobility Scheme visa",
    url: "https://www.gov.uk/youth-mobility",
  },
  skilledWorker: {
    label: "GOV.UK: Skilled Worker visa",
    url: "https://www.gov.uk/skilled-worker-visa",
  },
  student: {
    label: "GOV.UK: Student visa",
    url: "https://www.gov.uk/student-visa",
  },
  graduate: {
    label: "GOV.UK: Graduate visa",
    url: "https://www.gov.uk/graduate-visa",
  },
  globalTalent: {
    label: "GOV.UK: Global Talent visa",
    url: "https://www.gov.uk/global-talent",
  },
  family: {
    label: "GOV.UK: UK family visa（配偶者・パートナー）",
    url: "https://www.gov.uk/uk-family-visa/partner-spouse",
  },
  standardVisitor: {
    label: "GOV.UK: Standard Visitor visa",
    url: "https://www.gov.uk/standard-visitor",
  },
  evisa: {
    label: "GOV.UK: Get access to your eVisa（UKVIアカウント）",
    url: "https://www.gov.uk/get-access-evisa",
  },
  proveRightToWork: {
    label: "GOV.UK: Prove your right to work to an employer（share code）",
    url: "https://www.gov.uk/prove-right-to-work",
  },
  processingTimes: {
    label: "GOV.UK: Visa decision waiting times（審査期間）",
    url: "https://www.gov.uk/guidance/visa-decision-waiting-times-applications-outside-the-uk",
  },
  ilr: {
    label: "GOV.UK: Indefinite leave to remain（永住権）",
    url: "https://www.gov.uk/indefinite-leave-to-remain",
  },
  nino: {
    label: "GOV.UK: Apply for a National Insurance number",
    url: "https://www.gov.uk/apply-national-insurance-number",
  },
} as const;

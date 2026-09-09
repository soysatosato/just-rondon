// lib/labels.ts

/* ========= サービスチャージ ========= */
export type DistributionType = "equal" | "gradient" | "fixed" | "none";

export const DISTRIBUTION_LABEL: Record<DistributionType, string> = {
  equal: "従業員に等分配されている",
  gradient: "役職・勤務時間等に応じたグラデーション分配",
  fixed: "時給に一定額として固定で上乗せ",
  none: "分配されていない",
};

/**
 * 分配方法ごとの、Tipping Act 2023 に照らした位置づけ。
 * アンケートの選択肢にのみ添える補足で、集計表示では使わない
 * （グラフの凡例に法的評価が混ざると読みにくいため）。
 *
 * fixed を断定しないのは、上乗せ方式そのものが違法なのではなく、
 * 集めた総額が全額スタッフに渡っていない場合に違法となるため。
 */
export const DISTRIBUTION_LEGAL_NOTE: Record<DistributionType, string> = {
  equal: "適法",
  gradient: "基準がポリシーに明記されていれば適法",
  fixed: "大部分をオーナー側が取得している場合は違法の可能性が高い",
  none: "違法の可能性が高い",
};

/* ========= 設問刷新(2026-09)で足したもの ========= */

/**
 * 「いつの話か」。Tipping Act 2023 の施行は2024年10月1日で、それより前の
 * 経験は法制度そのものが違う。現在の実態として並べてよいかの線引きに使う。
 */
export type WorkPeriod = "current" | "within1y" | "1to3y" | "over3y";

export const WORK_PERIOD_LABEL: Record<WorkPeriod, string> = {
  current: "いまも働いている",
  within1y: "1年以内に働いていた",
  "1to3y": "1〜3年前に働いていた",
  over3y: "3年以上前に働いていた",
};

/** 一覧やグラフで日付の代わりに出す短縮形。 */
export const WORK_PERIOD_SHORT_LABEL: Record<WorkPeriod, string> = {
  current: "在職中",
  within1y: "1年以内",
  "1to3y": "1〜3年前",
  over3y: "3年以上前",
};

/**
 * 職種。キッチンが分配から外されているという証言が繰り返し出るため、
 * その証言がどちら側から見たものかを区別する。
 */
export type JobRole = "floor" | "kitchen" | "both" | "other";

export const JOB_ROLE_LABEL: Record<JobRole, string> = {
  floor: "ホール（フロア）",
  kitchen: "キッチン",
  both: "ホールとキッチンの両方",
  other: "その他（マネージャー・バー・レセプションなど）",
};

/**
 * 「はい／いいえ／わからない」。分からないことを分からないまま送れないと、
 * 回答者は当てずっぽうを選ぶか離脱する。集計では unknown を分母から外す。
 */
export type YesNoUnknown = "yes" | "no" | "unknown";

export const YES_NO_UNKNOWN_LABEL: Record<YesNoUnknown, string> = {
  yes: "はい",
  no: "いいえ",
  unknown: "わからない",
};

export type AmountPeriod = "weekly" | "monthly";

export const AMOUNT_PERIOD_LABEL: Record<AmountPeriod, string> = {
  weekly: "週額",
  monthly: "月額",
};

/* ========= 職場環境 ========= */
export type WorkAtmosphere = "good" | "neutral" | "tense" | "toxic";

export const WORK_ATMOSPHERE_LABEL: Record<WorkAtmosphere, string> = {
  good: "雰囲気が良い",
  neutral: "特に問題はない",
  tense: "職場がピリピリしている",
  toxic: "明らかに問題がある",
};

export type EthnicityRatio =
  | "mostly-japanese"
  | "mixed"
  | "mostly-non-japanese";

export const ETHNICITY_RATIO_LABEL: Record<EthnicityRatio, string> = {
  "mostly-japanese": "日本人の従業員が多い",
  mixed: "多国籍の従業員が多い",
  "mostly-non-japanese": "日本人は少数派",
};

/* ========= 賄い ========= */
export type MealDrink = "alcohol" | "softdrink" | "water" | "none";

export const MEAL_DRINK_LABEL: Record<MealDrink, string> = {
  alcohol: "酒類まで自由に飲める",
  softdrink: "ソフトドリンクは自由",
  water: "水・お茶のみ",
  none: "提供なし",
};

/* ========= 労働条件 ========= */
export type ShiftSchedule = "monthly" | "weekly";

export const SHIFT_SCHEDULE_LABEL: Record<ShiftSchedule, string> = {
  monthly: "月ごとに決まる",
  weekly: "週ごとに決まる",
};

export type VisaSupport = "yes" | "no" | "unknown";

export const VISA_SUPPORT_LABEL: Record<VisaSupport, string> = {
  yes: "ビザサポートあり",
  no: "ビザサポートなし",
  unknown: "分からない",
};

export type ManagementPresence =
  | "owner-daily"
  | "manager-daily"
  | "sometimes"
  | "hands-off";

export const MANAGEMENT_PRESENCE_LABEL: Record<ManagementPresence, string> = {
  "owner-daily": "オーナーが日常的に関与",
  "manager-daily": "マネージャーが常駐",
  sometimes: "ときどき関与している",
  "hands-off": "管理者はほぼ不在",
};

export function labelOf<T extends string>(
  map: Record<T, string>,
  value: string | null
): string {
  if (!value) return "未記入";
  return map[value as T] ?? "未記入";
}

export type MealRestriction = "beef" | "meat" | "fish" | "none";

export const MEAL_RESTRICTION_LABEL: Record<MealRestriction, string> = {
  beef: "牛肉",
  meat: "肉全般",
  fish: "魚介類",
  none: "特に制限なし",
};

// lib/labels.ts

/* ========= サービスチャージ ========= */
export type DistributionType = "equal" | "gradient" | "fixed" | "none";

export const DISTRIBUTION_LABEL: Record<DistributionType, string> = {
  equal: "従業員に等分配されている",
  gradient: "役職・勤務時間等に応じたグラデーション分配",
  fixed: "時給に一定額として固定で上乗せ（大部分をオーナー側が取得）",
  none: "分配されていない（実質オーナー側が取得）",
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

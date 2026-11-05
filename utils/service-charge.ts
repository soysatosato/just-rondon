// utils/service-charge.ts
//
// サービスチャージ調査の集計と自己診断。DBにもReactにも依存しない純関数だけを置く。
// サーバー(ダッシュボード)とクライアント(アンケートの診断ステップ)の両方から
// 同じ判定を使うため、"use server" も "use client" も付けない。

import { storeSlug } from "@/lib/jobs/store-slug";
import {
  DISTRIBUTION_LABEL,
  type DistributionType,
  type JobRole,
  type WorkPeriod,
  type YesNoUnknown,
} from "./labels";
import {
  DIAGNOSIS_TEXT,
  type SurveyLocale,
} from "./service-charge-diagnosis-text";

/* ============================================================
 * 型
 * ========================================================== */

/** 集計に必要な列だけを抜いた回答。Prisma の ServiceCharge から作る。 */
export type ChargeRecord = {
  id: string;
  placeId: string;
  storeName: string;
  storeAddress: string;
  borough: string | null;
  postcode: string | null;
  lat: number | null;
  lng: number | null;
  createdAt: Date;
  /** 店舗候補から選ばれた回答は true。手入力で登録された回答は false。 */
  isVerified: boolean;
  serviceChargeCollected: boolean;
  distributionType: string | null;
  amountPeriod: string | null;
  amountValue: number | null;
  monthlyHours: number | null;
  chargeRatePercent: number | null;
  jobRole: string | null;
  workPeriod: string | null;
  kitchenIncluded: string | null;
  onPayslip: string | null;
  writtenPolicy: string | null;
  serviceChargeComment: string | null;
  mealComment: string | null;
  generalComment: string | null;
};

/**
 * 店舗の状態。回答が割れている店では「悪いほうを採る」。
 *
 * 1件でも「分配されていない」と言った人がいる事実は、他の回答で
 * 打ち消せる性質のものではないため。件数は別に出して読み手が判断できるようにする。
 */
export type StoreStatus = "unpaid" | "fixed" | "shared" | "no-charge" | "unknown";

export const STORE_STATUS_LABEL: Record<StoreStatus, string> = {
  unpaid: "分配なしの報告あり",
  fixed: "固定上乗せの報告あり",
  shared: "分配されている",
  "no-charge": "サービスチャージなし",
  unknown: "分配方法は未回答",
};

export type StoreAggregate = {
  placeId: string;
  /** 店舗ページのURL末尾。規則は lib/jobs/store-slug.js が持つ。 */
  slug: string;
  storeName: string;
  storeAddress: string;
  borough: string | null;
  postcode: string | null;
  status: StoreStatus;
  responseCount: number;
  /** うち、店舗候補から選ばれた(実在が確認できている)回答の数。 */
  verifiedCount: number;
  collectedCount: number;
  /** 分配方法ごとの件数。徴収ありの回答だけが対象。 */
  distribution: Record<DistributionType, number>;
  /** 時給換算の中央値。月額と月の勤務時間が両方ある回答だけから出す。 */
  hourly: number | null;
  hourlySampleSize: number;
  /** 月額換算の中央値。週額回答は 52/12 倍して揃える。 */
  monthly: number | null;
  monthlySampleSize: number;
  commentCount: number;
  /** 法定義務の3項目。徴収ありの回答だけが対象。 */
  writtenPolicy: ObligationTally;
  onPayslip: ObligationTally;
  kitchenIncluded: ObligationTally;
  latestAt: Date;
};

export type ObligationTally = {
  yes: number;
  no: number;
  unknown: number;
  /** yes + no。「わからない」を除いた分母。 */
  answered: number;
};

export type ServiceChargeOverview = {
  totalResponses: number;
  totalStores: number;
  collectedResponses: number;
  /** サービスチャージを徴収している店舗の数。 */
  collectedStores: number;
  /** そのうち「分配されていない」の報告が1件以上ある店舗の数。 */
  unpaidStores: number;
  /** 「固定上乗せ」の報告が1件以上ある店舗の数（unpaid と重複しない）。 */
  fixedStores: number;
  distribution: { type: DistributionType; label: string; count: number }[];
  /** 徴収ありかつ分配方法に回答があった件数。distribution の分母。 */
  distributionAnswered: number;
  hourly: {
    median: number | null;
    min: number | null;
    max: number | null;
    sampleSize: number;
  };
  monthly: {
    median: number | null;
    sampleSize: number;
  };
  writtenPolicy: ObligationTally;
  onPayslip: ObligationTally;
  kitchenIncluded: ObligationTally;
  stores: StoreAggregate[];
  latestAt: Date | null;
  firstAt: Date | null;
};

/* ============================================================
 * 小道具
 * ========================================================== */

const DISTRIBUTION_TYPES: DistributionType[] = [
  "equal",
  "gradient",
  "fixed",
  "none",
];

function isDistributionType(v: string | null): v is DistributionType {
  return v !== null && (DISTRIBUTION_TYPES as string[]).includes(v);
}

/**
 * 中央値。平均を使わないのは、この調査の金額回答に
 * 「店舗全体の総額を書いてしまった」と見られる桁違いの値が混ざるため。
 * 平均だと1件で全体が動くが、中央値は動かない。
 */
export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** 週額回答を月額に揃える。年52週 ÷ 12か月。 */
export function toMonthlyAmount(
  value: number | null,
  period: string | null,
): number | null {
  if (value === null) return null;
  if (period === "weekly") return (value * 52) / 12;
  return value;
}

/**
 * サービスチャージの時給換算。
 *
 * 月額だけでは、週2で入っている人とフルタイムの人が同じ列に並んでしまう。
 * 勤務時間で割って初めて店どうしを比較できる。勤務時間を聞き始めたのは
 * 2026年9月の設問刷新からなので、それ以前の回答は null になる。
 */
export function hourlyRate(record: {
  amountValue: number | null;
  amountPeriod: string | null;
  monthlyHours: number | null;
}): number | null {
  const monthlyAmount = toMonthlyAmount(record.amountValue, record.amountPeriod);
  if (monthlyAmount === null) return null;
  if (!record.monthlyHours || record.monthlyHours <= 0) return null;
  return monthlyAmount / record.monthlyHours;
}

function tally(values: (string | null)[]): ObligationTally {
  const t = { yes: 0, no: 0, unknown: 0, answered: 0 };
  for (const v of values) {
    if (v === "yes") t.yes += 1;
    else if (v === "no") t.no += 1;
    else if (v === "unknown") t.unknown += 1;
  }
  t.answered = t.yes + t.no;
  return t;
}

function statusOf(records: ChargeRecord[]): StoreStatus {
  const collected = records.filter((r) => r.serviceChargeCollected);
  if (collected.length === 0) return "no-charge";
  const types = collected.map((r) => r.distributionType);
  if (types.includes("none")) return "unpaid";
  if (types.includes("fixed")) return "fixed";
  if (types.includes("equal") || types.includes("gradient")) return "shared";
  return "unknown";
}

/* ============================================================
 * 集計
 * ========================================================== */

export function aggregateStore(records: ChargeRecord[]): StoreAggregate {
  const head = records[0];
  const collected = records.filter((r) => r.serviceChargeCollected);

  const distribution = {
    equal: 0,
    gradient: 0,
    fixed: 0,
    none: 0,
  } as Record<DistributionType, number>;
  for (const r of collected) {
    if (isDistributionType(r.distributionType)) {
      distribution[r.distributionType] += 1;
    }
  }

  const hourlyValues = collected
    .map((r) => hourlyRate(r))
    .filter((v): v is number => v !== null);
  const monthlyValues = collected
    .map((r) => toMonthlyAmount(r.amountValue, r.amountPeriod))
    .filter((v): v is number => v !== null);

  // 住所は空で送られてくる回答があるので、埋まっているものを拾う。
  const address = records.find((r) => r.storeAddress)?.storeAddress ?? "";

  const commentCount = records.filter(
    (r) => r.serviceChargeComment || r.mealComment || r.generalComment,
  ).length;
  const verifiedCount = records.filter((r) => r.isVerified).length;

  // slug は head の1件だけから作る。回答一覧のリンク(回答1件しか持たない)と
  // 同じ値になる必要があるため、ここで他の回答から値を補ってはいけない。
  const slug = storeSlug(head);

  return {
    placeId: head.placeId,
    slug,
    storeName: head.storeName,
    storeAddress: address,
    borough: records.find((r) => r.borough)?.borough ?? null,
    postcode: records.find((r) => r.postcode)?.postcode ?? null,
    status: statusOf(records),
    responseCount: records.length,
    verifiedCount,
    collectedCount: collected.length,
    distribution,
    hourly: median(hourlyValues),
    hourlySampleSize: hourlyValues.length,
    monthly: median(monthlyValues),
    monthlySampleSize: monthlyValues.length,
    commentCount,
    writtenPolicy: tally(collected.map((r) => r.writtenPolicy)),
    onPayslip: tally(collected.map((r) => r.onPayslip)),
    kitchenIncluded: tally(collected.map((r) => r.kitchenIncluded)),
    latestAt: records.reduce<Date>(
      (max, r) => (r.createdAt > max ? r.createdAt : max),
      records[0].createdAt,
    ),
  };
}

/**
 * ポストコードの地区記号。"NW5 2JT" → "NW"、"W1D 4EE" → "W"。
 *
 * ロンドンの住所はこの記号だけで大まかな位置が伝わる(W1=ウエストエンド、
 * N1=イズリントン…)ので、店舗一覧のまとまりと「近くの店舗」の判定に使う。
 * ロンドン以外(BT/RG など)も同じ規則で区切れるため、例外扱いはしない。
 */
export function postcodeArea(postcode: string | null): string | null {
  const head = (postcode ?? "").trim().toUpperCase().split(/\s+/)[0];
  const letters = head.match(/^[A-Z]+/);
  return letters ? letters[0] : null;
}

/** 店舗一覧の既定の並び。問題の報告がある店を上に、同じ状態なら回答の多い順。 */
const STATUS_WEIGHT: Record<StoreStatus, number> = {
  unpaid: 0,
  fixed: 1,
  unknown: 2,
  shared: 3,
  "no-charge": 4,
};

export function buildOverview(records: ChargeRecord[]): ServiceChargeOverview {
  const byStore = new Map<string, ChargeRecord[]>();
  for (const r of records) {
    const list = byStore.get(r.placeId);
    if (list) list.push(r);
    else byStore.set(r.placeId, [r]);
  }

  const stores = [...byStore.values()]
    .map(aggregateStore)
    .sort((a, b) => {
      const w = STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status];
      if (w !== 0) return w;
      if (b.responseCount !== a.responseCount)
        return b.responseCount - a.responseCount;
      return a.storeName.localeCompare(b.storeName, "en");
    });

  const collected = records.filter((r) => r.serviceChargeCollected);

  const distributionCounts = {
    equal: 0,
    gradient: 0,
    fixed: 0,
    none: 0,
  } as Record<DistributionType, number>;
  for (const r of collected) {
    if (isDistributionType(r.distributionType)) {
      distributionCounts[r.distributionType] += 1;
    }
  }

  const hourlyValues = collected
    .map((r) => hourlyRate(r))
    .filter((v): v is number => v !== null);
  const monthlyValues = collected
    .map((r) => toMonthlyAmount(r.amountValue, r.amountPeriod))
    .filter((v): v is number => v !== null);

  const times = records.map((r) => r.createdAt.getTime());

  return {
    totalResponses: records.length,
    totalStores: stores.length,
    collectedResponses: collected.length,
    collectedStores: stores.filter((s) => s.collectedCount > 0).length,
    unpaidStores: stores.filter((s) => s.status === "unpaid").length,
    fixedStores: stores.filter((s) => s.status === "fixed").length,
    distribution: DISTRIBUTION_TYPES.map((type) => ({
      type,
      label: DISTRIBUTION_LABEL[type],
      count: distributionCounts[type],
    })),
    distributionAnswered: DISTRIBUTION_TYPES.reduce(
      (sum, type) => sum + distributionCounts[type],
      0,
    ),
    hourly: {
      median: median(hourlyValues),
      min: hourlyValues.length ? Math.min(...hourlyValues) : null,
      max: hourlyValues.length ? Math.max(...hourlyValues) : null,
      sampleSize: hourlyValues.length,
    },
    monthly: {
      median: median(monthlyValues),
      sampleSize: monthlyValues.length,
    },
    writtenPolicy: tally(collected.map((r) => r.writtenPolicy)),
    onPayslip: tally(collected.map((r) => r.onPayslip)),
    kitchenIncluded: tally(collected.map((r) => r.kitchenIncluded)),
    stores,
    latestAt: times.length ? new Date(Math.max(...times)) : null,
    firstAt: times.length ? new Date(Math.min(...times)) : null,
  };
}

/* ============================================================
 * 自由記述の整形
 * ========================================================== */

/**
 * 旧設問（賄いの回数・シフトの決まり方など選択式だったもの）を廃止したとき、
 * 過去の回答は自由記述の末尾に「（以前の設問への回答）…」として畳み込まれた。
 * 引用として読ませたいのは書き手自身の文章なので、そこだけ切り出す。
 */
export function splitLegacyNote(text: string): {
  body: string;
  legacy: string | null;
} {
  const marker = "（以前の設問への回答）";
  const index = text.indexOf(marker);
  if (index === -1) return { body: text.trim(), legacy: null };
  return {
    body: text.slice(0, index).trim(),
    legacy: text.slice(index + marker.length).trim() || null,
  };
}

/** 引用の抜粋。文の途中で切れたことが分かるように「…」を足す。 */
export function excerpt(text: string, maxLength = 150): string {
  const normalised = text.replace(/\r\n/g, "\n").trim();
  if (normalised.length <= maxLength) return normalised;
  return `${normalised.slice(0, maxLength)}…`;
}

/* ============================================================
 * 自己診断
 *
 * 回答者に何も返さないアンケートは、答える理由がない。送信の直前に
 * 「あなたの職場で何が起きているか」を法律に照らして言い切る。
 *
 * 根拠はすべて /jobs/service-charges の本文と同じ:
 * Employment (Allocation of Tips) Act 2023(2024年10月1日施行)。
 * ここで新しい法解釈を作らない。断定するのは本文が断定している範囲だけ。
 * ========================================================== */

export type DiagnosisInput = {
  collected: "yes" | "no" | null;
  distribution: DistributionType | null;
  kitchenIncluded: YesNoUnknown | null;
  onPayslip: YesNoUnknown | null;
  writtenPolicy: YesNoUnknown | null;
  workPeriod: WorkPeriod | null;
  jobRole: JobRole | null;
  monthlyAmount: number | null;
  monthlyHours: number | null;
};

export type DiagnosisTone = "alert" | "warn" | "info" | "ok";

export type DiagnosisFinding = {
  tone: DiagnosisTone;
  title: string;
  body: string;
};

export type DiagnosisAction = {
  title: string;
  body: string;
  href?: string;
  external?: boolean;
};

export type DiagnosisLevel = "alert" | "check" | "clear" | "unknown";

export type Diagnosis = {
  level: DiagnosisLevel;
  headline: string;
  lead: string;
  findings: DiagnosisFinding[];
  actions: DiagnosisAction[];
  /** 時給換算。出せたときだけ。 */
  hourly: number | null;
};

/**
 * 判定する。文章は utils/service-charge-diagnosis-text.ts が言語ごとに持ち、
 * ここは「どの指摘を出すか」だけを決める。英語版のアンケートも同じ論理を通る。
 */
export function diagnose(
  input: DiagnosisInput,
  locale: SurveyLocale = "ja",
): Diagnosis {
  const text = DIAGNOSIS_TEXT[locale];
  const findings: DiagnosisFinding[] = [];
  const actions: DiagnosisAction[] = [];

  const hourly =
    input.monthlyAmount !== null &&
    input.monthlyHours !== null &&
    input.monthlyHours > 0
      ? input.monthlyAmount / input.monthlyHours
      : null;

  if (input.collected === "no") {
    return {
      level: "unknown",
      headline: text.notCollected.headline,
      lead: text.notCollected.lead,
      findings: [{ tone: "info", ...text.notCollected.cashTips }],
      actions: [{ ...text.actions.minimumWage }, { ...text.actions.acas }],
      hourly: null,
    };
  }

  /* --- 分配方法 ---------------------------------------------------- */
  if (input.distribution) {
    const tone: Record<DistributionType, DiagnosisTone> = {
      none: "alert",
      fixed: "warn",
      gradient: "info",
      equal: "ok",
    };
    findings.push({
      tone: tone[input.distribution],
      ...text.distribution[input.distribution],
    });
  }

  /* --- 書面のチップポリシー（法定義務） ------------------------------ */
  if (input.writtenPolicy === "no") {
    findings.push({ tone: "alert", ...text.policyMissing });
  } else if (input.writtenPolicy === "unknown") {
    findings.push({ tone: "info", ...text.policyUnknown });
  }

  /* --- 給与明細と記録 ---------------------------------------------- */
  if (input.onPayslip === "no") {
    findings.push({ tone: "warn", ...text.notOnPayslip });
  }

  /* --- キッチンの扱い ----------------------------------------------- */
  if (input.kitchenIncluded === "no") {
    findings.push({ tone: "warn", ...text.kitchenExcluded });
  }

  /* --- いつの話か --------------------------------------------------- */
  if (input.workPeriod === "over3y") {
    findings.push({ tone: "info", ...text.over3y });
  }

  /* --- 金額 ---------------------------------------------------------- */
  if (hourly !== null) {
    findings.push({ tone: "info", ...text.hourly(hourly.toFixed(2)) });
  }

  /* --- レベル判定 ---------------------------------------------------- */
  const hasAlert = findings.some((f) => f.tone === "alert");
  const hasWarn = findings.some((f) => f.tone === "warn");
  const answeredEnough =
    input.distribution !== null &&
    (input.writtenPolicy !== null || input.onPayslip !== null);

  let level: DiagnosisLevel;
  if (hasAlert) level = "alert";
  else if (hasWarn) level = "check";
  else if (answeredEnough) level = "clear";
  else level = "unknown";

  /* --- 次にやること --------------------------------------------------- */
  if (input.writtenPolicy !== "yes") actions.push({ ...text.actions.askPolicy });
  actions.push({ ...text.actions.keepRecords });
  if (level === "alert" || level === "check") {
    actions.push({ ...text.actions.calculate });
    actions.push({ ...text.actions.deadlines });
  }
  actions.push({ ...text.actions.minimumWage });
  actions.push({ ...text.actions.acas });

  return {
    level,
    headline: text.levelHeadline[level],
    lead: leadFor(level, input, locale),
    findings,
    actions,
    hourly,
  };
}

function leadFor(
  level: DiagnosisLevel,
  input: DiagnosisInput,
  locale: SurveyLocale,
): string {
  const lead = DIAGNOSIS_TEXT[locale].lead;
  switch (level) {
    case "alert":
      return lead.alert;
    case "check":
      return lead.check;
    case "clear":
      return input.distribution === "equal" || input.distribution === "gradient"
        ? lead.clearShared
        : lead.clear;
    default:
      return lead.unknown;
  }
}

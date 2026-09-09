// utils/service-charge.ts
//
// サービスチャージ調査の集計と自己診断。DBにもReactにも依存しない純関数だけを置く。
// サーバー(ダッシュボード)とクライアント(アンケートの診断ステップ)の両方から
// 同じ判定を使うため、"use server" も "use client" も付けない。

import {
  DISTRIBUTION_LABEL,
  type DistributionType,
  type JobRole,
  type WorkPeriod,
  type YesNoUnknown,
} from "./labels";

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
  storeName: string;
  storeAddress: string;
  borough: string | null;
  postcode: string | null;
  status: StoreStatus;
  responseCount: number;
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

  return {
    placeId: head.placeId,
    storeName: head.storeName,
    storeAddress: address,
    borough: records.find((r) => r.borough)?.borough ?? null,
    postcode: records.find((r) => r.postcode)?.postcode ?? null,
    status: statusOf(records),
    responseCount: records.length,
    collectedCount: collected.length,
    distribution,
    hourly: median(hourlyValues),
    hourlySampleSize: hourlyValues.length,
    monthly: median(monthlyValues),
    monthlySampleSize: monthlyValues.length,
    commentCount: records.filter(
      (r) => r.serviceChargeComment || r.mealComment || r.generalComment,
    ).length,
    latestAt: records.reduce<Date>(
      (max, r) => (r.createdAt > max ? r.createdAt : max),
      records[0].createdAt,
    ),
  };
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

const LEVEL_HEADLINE: Record<DiagnosisLevel, string> = {
  alert: "法律に反している可能性が高い項目があります",
  check: "確認したほうがよい項目があります",
  clear: "大きな問題は見当たりませんでした",
  unknown: "判断するには情報が足りません",
};

export function diagnose(input: DiagnosisInput): Diagnosis {
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
      headline: "サービスチャージを徴収していない職場です",
      lead: "Tipping Act 2023 が対象にするのは、雇用主が管理・影響できるチップとサービスチャージです。徴収していない職場では、この法律の分配義務そのものが発生しません。",
      findings: [
        {
          tone: "info",
          title: "現金で直接受け取るチップは対象外",
          body: "客から直接手渡され、雇用主がいっさい関与しないチップは法律の対象外です。逆に、カード決済のチップを店がいったん預かって配っているなら、名前が何であれ分配義務がかかります。",
        },
      ],
      actions: [minimumWageAction(), acasAction()],
      hourly: null,
    };
  }

  /* --- 分配方法 ---------------------------------------------------- */
  if (input.distribution === "none") {
    findings.push({
      tone: "alert",
      title: "集めたサービスチャージが1ポンドも渡っていない",
      body: "2024年10月1日以降、チップ・サービスチャージは全額が働いた人のものと定められています。雇用主が差し引けるのは税金と国民保険料だけです。まったく分配されていない状態は、Tipping Act 2023 に反している可能性が高いと言えます。",
    });
  } else if (input.distribution === "fixed") {
    findings.push({
      tone: "warn",
      title: "「時給に固定額で上乗せ」は、それだけでは判断できない",
      body: "上乗せという方式そのものが違法なのではありません。分かれ目は、店が集めた総額が全額スタッフに渡っているかどうかです。上乗せの合計が集めた総額を下回り、差額が店に残っているなら違法です。総額の開示を求めてください。",
    });
  } else if (input.distribution === "gradient") {
    findings.push({
      tone: "info",
      title: "傾斜配分は、基準が書面にあれば適法",
      body: "役職や勤務時間に応じて配分を変えること自体は認められています。ただし法律が求めているのは「公平で透明性のある分配」なので、その基準がチップポリシーに書かれている必要があります。",
    });
  } else if (input.distribution === "equal") {
    findings.push({
      tone: "ok",
      title: "分配の方法そのものには問題がなさそう",
      body: "等分配は Code of Practice が想定する形のひとつです。残る論点は、集めた総額がそのまま分配に回っているかどうかになります。",
    });
  }

  /* --- 書面のチップポリシー（法定義務） ------------------------------ */
  if (input.writtenPolicy === "no") {
    findings.push({
      tone: "alert",
      title: "書面のチップポリシーが存在しない",
      body: "分配のルールを書面にし、働く人が読める状態にしておくことは、2024年10月1日から雇用主の義務です。ポリシーや記録が開示されない場合の申立て期限は3か月と短いので、未払いの請求（12か月）とは分けて考えてください。",
    });
  } else if (input.writtenPolicy === "unknown") {
    findings.push({
      tone: "info",
      title: "チップポリシーは「見せてください」と言える",
      body: "すべての労働者がチップポリシーにアクセスできるようにすることは雇用主の義務です。分配の責任者・分配方法・サービスチャージの扱いが書かれているはずなので、まずは開示を求めるところから始められます。",
    });
  }

  /* --- 給与明細と記録 ---------------------------------------------- */
  if (input.onPayslip === "no") {
    findings.push({
      tone: "warn",
      title: "給与明細に別項目で出ていない",
      body: "いくら受け取ったのかを自分で確認できない状態です。従業員には過去3年間のチップ支払い記録を閲覧する権利があり、雇用主には3年間の記録保存義務があります。記録の請求は、未払いを計算する前提になります。",
    });
  }

  /* --- キッチンの扱い ----------------------------------------------- */
  if (input.kitchenIncluded === "no") {
    findings.push({
      tone: "warn",
      title: "キッチンが分配から外されている",
      body: "分配の対象は「その職場で働く人」であり、フロアに限られません。キッチンスタッフを一律に除外する運用は、公平性の観点から問題になり得ます。役割に応じた重み付けは可能ですが、その基準はポリシーに書かれている必要があります。",
    });
  }

  /* --- いつの話か --------------------------------------------------- */
  if (input.workPeriod === "over3y") {
    findings.push({
      tone: "info",
      title: "3年以上前の経験は、法律が違う可能性がある",
      body: "全額分配の義務が始まったのは2024年10月1日です。それ以前の運用は、いまの基準では測れません。記録の保存義務も3年なので、当時の資料が残っていない可能性もあります。",
    });
  }

  /* --- 金額 ---------------------------------------------------------- */
  if (hourly !== null) {
    findings.push({
      tone: "info",
      title: `サービスチャージは時給換算で £${hourly.toFixed(2)}`,
      body: "この額は最低賃金とは別に受け取るべきものです。時給が最低賃金に届かない分をサービスチャージで埋める運用は違法で、チップは最低賃金の「上に」乗ります。給与明細で、基本時給だけで最低賃金を満たしているか確認してください。",
    });
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
  if (input.writtenPolicy !== "yes") {
    actions.push({
      title: "チップポリシーの開示を求める",
      body: "「分配のルールを書いたものを見せてください」と伝えるだけです。開示は義務なので、断られた事実そのものが記録になります。",
      href: "/jobs/service-charges#section-286",
    });
  }
  actions.push({
    title: "給与明細とシフト表を手元に残す",
    body: "未払いを計算するのに要る記録は、給与明細・シフト表・売上記録（Zレポート）の3つだけです。在職中のうちに揃うものは揃えておきます。",
    href: "/jobs/service-charges/case-story/check-your-service-charge",
  });
  if (level === "alert" || level === "check") {
    actions.push({
      title: "未払い額を自分で計算する",
      body: "審判所で実際に認容された計算方法を、数字ごと公開しています。「その日の総サービスチャージ ÷ その日の稼働人数 × 自分の実稼働日数」が出発点です。",
      href: "/jobs/service-charges/case-story/check-your-service-charge",
    });
    actions.push({
      title: "期限を確認する",
      body: "未払いチップの申立ては12か月以内、ポリシーや記録が開示されない場合は3か月以内です。起点は「支払われるべきだった日」なので、辞めたあとでも請求できます。",
      href: "/jobs/service-charges#section-286",
    });
  }
  actions.push(minimumWageAction());
  actions.push(acasAction());

  return {
    level,
    headline: LEVEL_HEADLINE[level],
    lead: leadFor(level, input),
    findings,
    actions,
    hourly,
  };
}

function leadFor(level: DiagnosisLevel, input: DiagnosisInput): string {
  switch (level) {
    case "alert":
      return "回答の中に、Tipping Act 2023 が禁じている状態にあたる可能性の高いものがありました。いますぐ争う必要はありませんが、記録を残すことだけは先に始めてください。";
    case "check":
      return "ただちに違法と言い切れるものではないものの、店に確認すれば白黒がつく項目があります。確認の求め方も下にまとめました。";
    case "clear":
      return input.distribution === "equal" || input.distribution === "gradient"
        ? "回答の範囲では、法律が求めている形から外れているところは見当たりませんでした。残る論点は「集めた総額が全額渡っているか」だけです。"
        : "回答の範囲では、目立った問題は見当たりませんでした。";
    default:
      return "分からない項目が多いままでも構いません。下の順番で確認していけば、自分の職場がどちらなのかは判断できます。";
  }
}

function minimumWageAction(): DiagnosisAction {
  return {
    title: "基本時給だけで最低賃金を満たしているか見る",
    body: "チップを最低賃金の補填に使うことは違法です。サービスチャージを除いた基本時給が法定額に届いているかを確認してください。",
    href: "/jobs/minimum-wage",
  };
}

function acasAction(): DiagnosisAction {
  return {
    title: "Acas に相談する（無料・雇用主に連絡は行かない）",
    body: "審判所に申し立てる場合、その前に Acas の Early Conciliation を経ることが原則として必須です。順序を間違えると受理されません。",
    href: "https://www.acas.org.uk/tips-and-service-charges",
    external: true,
  };
}

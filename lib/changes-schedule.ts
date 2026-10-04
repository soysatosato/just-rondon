import { TRANSPORT_KEY_DATES, BUS, gbp } from "@/lib/transport/rates";
import { VISA_KEY_DATES } from "@/lib/visa/rates";
import { ENERGY_CAP, ELECTRICITY_VAT_CUT } from "@/lib/bills/rates";
import type { ChangeAudience, ChangeKind } from "@/lib/changes";

/**
 * これから変わることが分かっている改定の予定表。
 *
 * 新しい事実はここに書かない。日付も金額も lib/<section>/rates.ts の定数から
 * 引くだけにしている。rates.ts は「改定のたびにそこだけ直す」運用なので、
 * ここが定数を参照していれば、改定の反映とともに予定表も勝手に進む。
 * 逆にここへ日付を直書きすると、rates.ts と食い違ったまま気付けない。
 *
 * 使い道は2つ:
 *   1. /changes ハブの「これから変わること」(読者向け)
 *   2. scripts/report-monthly-changes.ts(号を書くときの取りこぼし防止)
 *
 * 載せる条件は「日付か月が公表されている」こと。「2026年後半」のように
 * 月すら決まっていないもの(Renters' Rights Act の第2段階など)は載せない。
 *
 * recurring は「毎年この時期に改定される」という制度上の決まりで、
 * 金額はまだ出ていない。画面では「例年」と添えて、確定した予定と区別する。
 */

export type ScheduledChange = {
  id: string;
  /** "2026-11-01"。月だけ決まっているものはその月の1日。 */
  date: string;
  /** day=日付まで決まっている / month=月だけ決まっている */
  precision: "day" | "month";
  /** 毎年この時期に改定される(金額は直前に発表)。 */
  recurring?: boolean;
  kind: ChangeKind;
  audience: ChangeAudience;
  title: string;
  /** 金額が決まっているときの「前→後」。 */
  before?: string;
  after?: string;
  /** 1文の補足。 */
  note?: string;
  sitePath: string;
};

/** 「2027年1月1日」「2027年3月」を ISO の日付と精度に直す。読めなければ null。 */
export function parseJaDate(
  text: string,
): { date: string; precision: "day" | "month" } | null {
  const m = text.match(/(\d{4})年(\d{1,2})月(?:(\d{1,2})日)?/);
  if (!m) return null;
  const y = m[1];
  const mo = m[2].padStart(2, "0");
  if (m[3]) return { date: `${y}-${mo}-${m[3].padStart(2, "0")}`, precision: "day" };
  return { date: `${y}-${mo}-01`, precision: "month" };
}

/** ISO 日付の翌日。「〜まで」の期限を「〜から変わる」日に直す。 */
function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/** now 以降で最初に来る「毎年 month/day」。 */
function nextAnnual(month: number, day: number, now: Date): string {
  const y = now.getUTCFullYear();
  const thisYear = Date.UTC(y, month - 1, day);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const year = thisYear >= today ? y : y + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/**
 * 予定表の全件。日付の古いものも含む(呼び出し側が期間で絞る)。
 * 毎年の改定は now を基準に「次の回」を作る。
 */
export function buildScheduledChanges(now: Date = new Date()): ScheduledChange[] {
  const list: ScheduledChange[] = [];

  list.push({
    id: "bus-fare-rise",
    date: TRANSPORT_KEY_DATES.busFareRise,
    precision: "day",
    kind: "fare",
    audience: "both",
    title: "バス・トラム運賃の値上げ",
    before: gbp(BUS.single),
    after: gbp(BUS.from2026Nov.single),
    note: `1日の上限は${gbp(BUS.dailyCap)}から${gbp(BUS.from2026Nov.dailyCap)}に。`,
    sitePath: "/sightseeing/transport/bus",
  });

  const capsFrozen = parseJaDate(TRANSPORT_KEY_DATES.capsFrozenUntil);
  if (capsFrozen) {
    list.push({
      id: "tfl-caps-freeze-ends",
      ...capsFrozen,
      kind: "fare",
      audience: "both",
      title: "地下鉄・鉄道の1日・週の上限額とTravelcardの据え置き期限",
      note: "据え置きはこの月まで。その後の額は未発表。",
      sitePath: "/sightseeing/transport/fares",
    });
  }

  list.push({
    id: "tfl-annual-fares",
    date: nextAnnual(3, 1, now),
    precision: "month",
    recurring: true,
    kind: "fare",
    audience: "both",
    title: "TfL運賃の年次改定",
    note: "地下鉄・鉄道の単発運賃は毎年3月に改定される。金額は直前に発表。",
    sitePath: "/sightseeing/transport/fares",
  });

  /*
   * 「いまの期間が始まった日」も持つ。次の改定日だけだと、定数を新しい
   * 期間に直した瞬間に、その月に起きた改定が予定表から消える。月次号は
   * まさにその改定を書くので、下調べ(report-monthly-changes.ts)で拾えるよう
   * 開始日の側も残す。ハブでは日付が過ぎているので出ない。
   */
  const energyStarted = parseJaDate(ENERGY_CAP.period);
  if (energyStarted) {
    list.push({
      id: "energy-cap-current",
      ...energyStarted,
      kind: "bills",
      audience: "resident",
      title: `ガス・電気の料金上限(Ofgem price cap)が${ENERGY_CAP.changePercent}%上がる`,
      before: `年£${ENERGY_CAP.previousTypicalAnnual.toLocaleString("en-GB")}`,
      after: `年£${ENERGY_CAP.typicalAnnual.toLocaleString("en-GB")}`,
      note: "典型的な使用量の世帯(ガス＋電気、Direct Debit)の年額。",
      sitePath: "/bills/energy",
    });
  }

  const vatFrom = parseJaDate(ELECTRICITY_VAT_CUT.from);
  if (vatFrom) {
    list.push({
      id: "electricity-vat-cut-starts",
      ...vatFrom,
      kind: "bills",
      audience: "resident",
      title: "電気代の VAT が 0% に(時限措置)",
      before: `${ELECTRICITY_VAT_CUT.previousRatePercent}%`,
      after: "0%",
      note: `${ELECTRICITY_VAT_CUT.until}まで。`,
      sitePath: "/bills/energy",
    });
  }

  const energy = parseJaDate(ENERGY_CAP.nextChange);
  if (energy) {
    list.push({
      id: "energy-cap-next",
      ...energy,
      kind: "bills",
      audience: "resident",
      title: "ガス・電気の料金上限(Ofgem price cap)の改定",
      note: "上限は3か月ごとに改定される。金額は前の月の下旬に発表。",
      sitePath: "/bills/energy",
    });
  }

  const vatUntil = parseJaDate(ELECTRICITY_VAT_CUT.until);
  if (vatUntil && vatUntil.precision === "day") {
    list.push({
      id: "electricity-vat-cut-ends",
      date: nextDay(vatUntil.date),
      precision: "day",
      kind: "bills",
      audience: "resident",
      title: "電気代の VAT 0% 措置が終わる",
      before: "0%",
      after: `${ELECTRICITY_VAT_CUT.previousRatePercent}%`,
      note: `${ELECTRICITY_VAT_CUT.from}からの時限措置。延長の発表があれば号で知らせる。`,
      sitePath: "/bills/energy",
    });
  }

  list.push({
    id: "graduate-18-months",
    date: VISA_KEY_DATES.graduate18MonthsFrom,
    precision: "day",
    kind: "visa",
    audience: "resident",
    title: "Graduate visa の期間が2年から18か月に",
    before: "2年",
    after: "18か月",
    note: "この日以降の申請分から。博士課程修了者は3年のまま。",
    sitePath: "/visa/student",
  });

  list.push({
    id: "skilled-worker-english-b2",
    date: VISA_KEY_DATES.englishB2From,
    precision: "day",
    kind: "visa",
    audience: "resident",
    title: "Skilled Worker の英語要件が B1 から B2 に",
    before: "B1",
    after: "B2",
    note: "この日以降の申請分から。",
    sitePath: "/visa/skilled-worker",
  });

  list.push({
    id: "minimum-wage-annual",
    date: nextAnnual(4, 1, now),
    precision: "day",
    recurring: true,
    kind: "wage",
    audience: "resident",
    title: "最低賃金(National Living Wage)の年次改定",
    note: "毎年4月1日。新しい額は前年の秋に政府が発表する。",
    sitePath: "/jobs/minimum-wage",
  });

  list.push({
    id: "april-household-bills",
    date: nextAnnual(4, 1, now),
    precision: "day",
    recurring: true,
    kind: "bills",
    audience: "resident",
    title: "Council Tax・水道・TV Licence の年次改定",
    note: "どれも毎年4月1日。Council Tax は区ごとに額が違う。",
    sitePath: "/bills",
  });

  return list.sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * [from, to) に入る予定。ハブの「これから変わること」と、号を書くときの
 * 確認リストに使う。
 *
 * 月だけ決まっているものは月単位で比べる。日付で比べると、from が月の
 * 途中のとき「今月のどこか」の予定が始まる前から落ちてしまう。
 */
export function scheduledChangesBetween(
  from: Date,
  to: Date,
  now: Date = new Date(),
): ScheduledChange[] {
  const lo = from.toISOString().slice(0, 10);
  const hi = to.toISOString().slice(0, 10);
  return buildScheduledChanges(now).filter((c) =>
    c.precision === "month"
      ? c.date.slice(0, 7) >= lo.slice(0, 7) && c.date < hi
      : c.date >= lo && c.date < hi,
  );
}

/** 画面に出す日付。「2026年11月1日」/「2027年3月」。 */
export function formatScheduledDate(change: ScheduledChange): string {
  const [y, m, d] = change.date.split("-").map((n) => parseInt(n, 10));
  return change.precision === "day" ? `${y}年${m}月${d}日` : `${y}年${m}月`;
}

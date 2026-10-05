import { parsePriceGbp } from "@/components/attractions/facts";
import { BUS_CREDIT, LONDON_PASS } from "@/lib/sightseeing/passes";
import type { FareZone, SpotFareZone } from "@/lib/transport/fare-zones";
import {
  CAPS,
  PAYG_SINGLE_FROM_ZONE1,
  PAYMENT,
  TRAVELCARD,
} from "@/lib/transport/rates";
import { dateForDay, parseIsoDate, weekdayIndex } from "./dates";
import { legBetween, type DayPlan } from "./index";

/**
 * 旅程の「費用」の計算。/plan の交通費・払い方の比較・ロンドンパスの判定。
 *
 * lib/plan/index.ts と同じく、数字の作り方はすべてここに集めて React には
 * 持ち込まない。交通費は経路を引いていない概算で、どこまでを数字として
 * 出してよいかの線引きが表示側に散ると、精度があるように見える数字が
 * 勝手に生える。
 *
 * 金額の出どころ:
 * - 運賃・上限額・Travelcard は lib/transport/rates.ts
 * - パスの価格は lib/sightseeing/passes.ts
 * - 入場料は各スポットの掲載値(priceAdult)。プランの入場料の合計と同じ数字。
 *   掲載値は「£35.8〜」のような事前購入の最安値が多く、/sightseeing/passes の
 *   損益分岐表(窓口価格)より安い。パスを買わない人が実際に払うのは事前購入の
 *   額なので、比べる相手としてはこちらが正しい。そのぶん記事の表よりパスに
 *   厳しい結果になるが、記事の結論(元が取れる条件は狭い)と向きは同じ。
 */

/* ------------------------------------------------------------------ *
 * 宿のゾーン
 * ------------------------------------------------------------------ */

/**
 * 宿のゾーン。読者に選んでもらう。プランは宿の場所を持っていないので、
 * 朝と夜の乗車の運賃と、その日の上限額がどのゾーンまでかはここで決まる。
 */
export type HomeZone = FareZone;

export const HOME_ZONES: readonly HomeZone[] = [1, 2, 3, 4, 5, 6];

/**
 * 既定は Zone 2。中心部のホテルの多くは Zone 1 だが、分からない人が
 * 選ばずに済ませたときに安いほうへ倒すと、予算が足りなくなる。
 * Zone 1 と 2 は1日の上限額が同じなので、上限に届く日はどちらでも変わらない。
 */
export const DEFAULT_HOME_ZONE: HomeZone = 2;

export function isHomeZone(value: unknown): value is HomeZone {
  return HOME_ZONES.includes(value as HomeZone);
}

/** 「Zone 1–3」。Zone 1 だけのときは「Zone 1」。 */
export function zoneRangeLabel(zone: FareZone): string {
  return zone === 1 ? "Zone 1" : `Zone 1–${zone}`;
}

/* ------------------------------------------------------------------ *
 * 1日ぶんの交通費
 * ------------------------------------------------------------------ */

/**
 * ピークの時間帯(0時からの分)。平日のみ。rates.ts の PEAK_HOURS と同じ。
 * 表示用の文字列とは別に、比べるための数値をここに持つ。
 */
const PEAK_WINDOWS = [
  [6 * 60 + 30, 9 * 60 + 30],
  [16 * 60, 19 * 60],
] as const;

/**
 * その時刻に乗るとピーク運賃か。
 *
 * 出発日が入っていなければ曜日が分からないので、平日として数える。
 * 予算の見積もりは高いほうに外れるほうが害が小さい。祝日(銀行休業日)は
 * 終日オフピークだが、ここでは見ていない。
 */
function isPeak(minutes: number, weekday: number | null): boolean {
  if (weekday !== null && weekday >= 5) return false;
  return PEAK_WINDOWS.some(([from, to]) => minutes >= from && minutes < to);
}

function capFor(zone: FareZone) {
  return CAPS[zone === 1 ? "zone1" : `zone1to${zone}`];
}

/** Travelcard には Zone 1 だけの券が無い。Zone 1–2 を使う。 */
function travelcardFor(zone: FareZone) {
  return TRAVELCARD[`zone1to${Math.max(2, zone)}`];
}

function round2(amount: number): number {
  return Math.round(amount * 100) / 100;
}

export type DayTransport = {
  day: number;
  /** 地下鉄・Overground・DLR の運賃の目安(£)。1日の上限額で頭打ちにした後。 */
  gbp: number;
  /** その日に乗る一番外側のゾーン(宿を含む)。上限額はここまでの額を使う。 */
  reach: FareZone;
  /** 数えた乗車回数。ゾーン外へ出る区間は入れない。 */
  rides: number;
  /** うちピーク運賃で数えた回数。 */
  peakRides: number;
  /** 1日の上限額に届いたか。 */
  capped: boolean;
  /**
   * Zone 1-6 の外(ウィンザー、ワトフォードなど)へ出入りする区間の数。
   * TfL の上限額の対象外の鉄道を使うので、金額には入れず「別途」とだけ出す。
   */
  outsideLegs: number;
};

/**
 * 1日ぶんの交通費を見積もる。
 *
 * 乗車回数は「宿→最初のスポット」「スポット間のうち徒歩圏でない区間」
 * 「最後のスポット→宿」。徒歩圏の判定は旅程の移動時間と同じ legBetween に
 * 任せる——片方で歩かせて片方で乗せると、時間と運賃が別の旅程を数えることになる。
 *
 * 1回ごとの運賃は、両端の外側のゾーンまでを Zone 1 から乗った額にする。
 * Zone 1 を通らない区間は実際にはこれより安いが、経路を引いていないので
 * どちらを通るかは分からない。高いほうに外して、上限額で頭打ちにする。
 */
export function dayTransport(
  day: DayPlan,
  homeZone: HomeZone,
  date: Date | null,
): DayTransport {
  const weekday = date ? weekdayIndex(date) : null;
  // 住所を持たないスポット(パス類)は乗車に数えない。
  const located = day.rows.filter((row) => row.spot.fareZone !== null);

  if (located.length === 0) {
    return {
      day: day.day,
      gbp: 0,
      reach: homeZone,
      rides: 0,
      peakRides: 0,
      capped: false,
      outsideLegs: 0,
    };
  }

  const rides: { from: SpotFareZone; to: SpotFareZone; depart: number }[] = [
    { from: homeZone, to: located[0].spot.fareZone!, depart: day.startMinutes },
  ];
  for (let i = 1; i < located.length; i++) {
    const prev = located[i - 1];
    const leg = legBetween(prev.spot, located[i].spot);
    if (leg?.kind === "walk") continue;
    rides.push({
      from: prev.spot.fareZone!,
      to: located[i].spot.fareZone!,
      depart: prev.leaveMinutes,
    });
  }
  const last = located[located.length - 1];
  rides.push({ from: last.spot.fareZone!, to: homeZone, depart: last.leaveMinutes });

  let sum = 0;
  let reach: FareZone = homeZone;
  let priced = 0;
  let peakRides = 0;
  let outsideLegs = 0;

  for (const ride of rides) {
    if (ride.from === "outside" || ride.to === "outside") {
      outsideLegs++;
      continue;
    }
    const zone = Math.max(ride.from, ride.to) as FareZone;
    if (zone > reach) reach = zone;
    const peak = isPeak(ride.depart, weekday);
    if (peak) peakRides++;
    const fare = PAYG_SINGLE_FROM_ZONE1[zone];
    sum += peak ? fare.peak : fare.offPeak;
    priced++;
  }

  const cap = capFor(reach).daily;
  return {
    day: day.day,
    gbp: round2(Math.min(sum, cap)),
    reach,
    rides: priced,
    peakRides,
    capped: priced > 0 && sum >= cap,
    outsideLegs,
  };
}

/* ------------------------------------------------------------------ *
 * 旅程全体の交通費と払い方
 * ------------------------------------------------------------------ */

export type TravelcardOption = {
  /** カード代と、7日を過ぎた日の都度払いを含めた合計(£)。 */
  gbp: number;
  /** 券のゾーン。旅程で乗る一番外側まで。 */
  zone: FareZone;
  /** 7日券そのものの価格。 */
  price: number;
  /** 券が効く最初の日と最後の日(何日目)。 */
  fromDay: number;
  toDay: number;
  /** 7日を過ぎて都度払いになる分(£)。 */
  extraGbp: number;
};

export type TripTransport = {
  days: DayTransport[];
  /** タッチ決済で払った場合の合計(£)。月〜日の週の上限額を当てた後。 */
  payg: number;
  /** 週の上限額で減った額(£)。0なら効いていない。 */
  weeklyCapSaving: number;
  /**
   * 出発日から曜日が分かったか。分からないときは1日目を月曜とみなす
   * (週の上限額がいちばん効く並び。都度払いに有利な側で見積もる)。
   */
  datesKnown: boolean;
  /** Oyster の都度払い。運賃はタッチ決済と同じで、カード代が乗る。 */
  oyster: number;
  /** Oyster に7日 Travelcard を載せた場合。乗る日が無ければ null。 */
  travelcard: TravelcardOption | null;
  /** 金額に入れていない、ゾーン外へ出入りする区間の数(旅程全体)。 */
  outsideLegs: number;
};

/**
 * 旅程全体の交通費と、払い方3通りの比較。
 *
 * 週の上限額は月曜〜日曜で区切られ、7日 Travelcard は何曜日からでも
 * 始められる。週の上限額と7日券は同じ値段なので、差が出るのは
 * 「旅程が月曜をまたいで、上限額が2週に割れる」ときだけ。木曜着・水曜発の
 * 7日間なら、都度払いは2週ともに上限に届かず、7日券のほうが安くなる。
 */
export function tripTransport(
  days: DayPlan[],
  homeZone: HomeZone,
  startDate: string | null,
): TripTransport {
  const perDay = days.map((day) =>
    dayTransport(day, homeZone, dateForDay(startDate, day.day)),
  );

  const start = parseIsoDate(startDate);
  const offset = start ? weekdayIndex(start) : 0;

  // 月〜日で区切った週ごとに、上限額を当てる。
  const weeks = new Map<number, { sum: number; reach: FareZone }>();
  for (const t of perDay) {
    const week = Math.floor((offset + t.day - 1) / 7);
    const current = weeks.get(week) ?? { sum: 0, reach: homeZone };
    current.sum += t.gbp;
    if (t.rides > 0 && t.reach > current.reach) current.reach = t.reach;
    weeks.set(week, current);
  }
  let payg = 0;
  for (const week of weeks.values()) {
    payg += Math.min(week.sum, capFor(week.reach).weekly);
  }
  payg = round2(payg);
  const rawTotal = round2(perDay.reduce((sum, t) => sum + t.gbp, 0));

  const rideDays = perDay.filter((t) => t.rides > 0);
  let travelcard: TravelcardOption | null = null;
  if (rideDays.length > 0) {
    const zone = rideDays.reduce<FareZone>(
      (max, t) => (t.reach > max ? t.reach : max),
      homeZone,
    );
    // 最初に乗る日から7日。それより後の日は同じ Oyster で都度払いにする
    // (最大10日の旅程なので、2枚目の7日券が得になる長さにはならない)。
    const fromDay = rideDays[0].day;
    const toDay = fromDay + 6;
    const extraGbp = round2(
      perDay.filter((t) => t.day > toDay).reduce((sum, t) => sum + t.gbp, 0),
    );
    const price = travelcardFor(zone).weekly;
    travelcard = {
      gbp: round2(price + PAYMENT.oysterCardFee + extraGbp),
      zone,
      price,
      fromDay,
      toDay,
      extraGbp,
    };
  }

  return {
    days: perDay,
    payg,
    weeklyCapSaving: round2(rawTotal - payg),
    datesKnown: start !== null,
    oyster: round2(payg + PAYMENT.oysterCardFee),
    travelcard,
    outsideLegs: perDay.reduce((sum, t) => sum + t.outsideLegs, 0),
  };
}

/* ------------------------------------------------------------------ *
 * ロンドンパスの損得
 * ------------------------------------------------------------------ */

export type PassItem = {
  slug: string;
  name: string;
  /** 何日目に行くか。 */
  day: number;
  /** 掲載値の大人料金(£)。 */
  price: number;
};

export type PassOption = {
  /** 何日券か。 */
  days: number;
  /** 大人の価格(£)。 */
  price: number;
  /** パスを使う最初の日と最後の日(何日目)。 */
  startDay: number;
  endDay: number;
  /** 期間内に入る対象スポット。 */
  covered: PassItem[];
  /** 対象スポットを個別に買った場合の合計(£)。 */
  coveredValue: number;
  /** coveredValue − price。正ならパスが得。 */
  saving: number;
};

export type PassVerdict = {
  /**
   * none: 対象スポット(有料・無条件)が1つも入っていない
   * lose: 買わないほうが安い
   * close: パスが安いが、差がわずか
   * win: パスが得
   */
  kind: "none" | "lose" | "close" | "win";
  /** いちばん得な(損が小さい)組み合わせ。none のときは null。 */
  best: PassOption | null;
  /** 旅程に入っている対象スポット(有料・無条件)。 */
  eligible: PassItem[];
  /** 対象だが条件付きのため計算に入れていないスポット。 */
  conditional: { slug: string; name: string }[];
  /**
   * 乗り降り自由バス(パスに含まれる)に乗るつもりなら、損得が逆転するか。
   * lose のときだけ意味を持つ。
   */
  busWouldFlip: boolean;
};

/**
 * 「差がわずか」の線。パス代の1割か£10の大きいほう。
 *
 * パスは多くの施設で時間指定の予約が要り、行き先も対象施設に縛られる。
 * 掲載値は事前購入の最安値なので、時間帯によっては個別のほうが高くつく
 * こともある。その程度の揺れで消える差を「得」と言い切らない。
 */
const CLOSE_RATIO = 0.1;
const CLOSE_MIN_GBP = 10;

/**
 * 旅程に沿ってロンドンパスの損得を出す。
 *
 * パスは使い始めの日から連続した日数で切れる。そこで旅程の連続した
 * N日ごとに対象スポットの入場料を足し、各日数券の価格と比べて、
 * いちばん得な(損が小さい)ものを1つ選ぶ。同じ損得なら短い券を採る。
 *
 * 数えるのは有料で無条件の対象スポットだけ。無料の施設はパスで
 * 浮く額が無く、条件付き(londonPassNote あり)は現地で使えないことが
 * あるので、当てにして計算しない。
 */
export function londonPassVerdict(days: DayPlan[]): PassVerdict {
  const eligible: PassItem[] = [];
  const conditional: { slug: string; name: string }[] = [];

  for (const day of days) {
    for (const row of day.rows) {
      const { spot } = row;
      if (!spot.londonPass) continue;
      if (spot.londonPassNote) {
        conditional.push({ slug: spot.slug, name: spot.name });
        continue;
      }
      const price = parsePriceGbp(spot.priceAdult);
      if (!price) continue;
      eligible.push({ slug: spot.slug, name: spot.name, day: day.day, price });
    }
  }

  if (eligible.length === 0 || days.length === 0) {
    return { kind: "none", best: null, eligible, conditional, busWouldFlip: false };
  }

  const firstDay = days[0].day;
  const lastDay = days[days.length - 1].day;
  const span = lastDay - firstDay + 1;

  let best: PassOption | null = null;
  // LONDON_PASS は日数の短い順。旅程の日数以上の券は、それより長い券を
  // 見ても覆う範囲は同じで高くなるだけなので、最初の1つで打ち切る。
  for (const pass of LONDON_PASS) {
    const length = Math.min(pass.days, span);
    for (let startDay = firstDay; startDay + length - 1 <= lastDay; startDay++) {
      const endDay = startDay + length - 1;
      const covered = eligible.filter(
        (item) => item.day >= startDay && item.day <= endDay,
      );
      const coveredValue = round2(covered.reduce((sum, item) => sum + item.price, 0));
      const saving = round2(coveredValue - pass.adult);
      if (!best || saving > best.saving) {
        best = {
          days: pass.days,
          price: pass.adult,
          startDay,
          endDay,
          covered,
          coveredValue,
          saving,
        };
      }
    }
    if (pass.days >= span) break;
  }

  // eligible が空でない以上、少なくとも1つは評価している。
  const option = best!;
  const margin = Math.max(CLOSE_MIN_GBP, option.price * CLOSE_RATIO);
  const kind =
    option.saving <= 0 ? "lose" : option.saving < margin ? "close" : "win";

  return {
    kind,
    best: option,
    eligible,
    conditional,
    busWouldFlip: kind === "lose" && -option.saving < BUS_CREDIT,
  };
}

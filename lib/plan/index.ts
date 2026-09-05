import {
  parseDurationMinutes,
  parsePriceGbp,
} from "@/components/attractions/facts";
import { distanceKm } from "@/lib/sightseeing/geo";
import { formatClosedDays, weekdayIndex } from "./dates";

/**
 * 読者が自分で組む旅行プラン(/plan)の計算まわり。
 *
 * /sightseeing/itinerary が編集部の書いた固定のモデルコースなのに対して、
 * こちらは144件から選んだスポットを日別に並べて、合計と移動を出す道具。
 * 記事のほうは「どこへ行くか」を提案し、ここは「選んだ先が1日に収まるか」
 * を答える。役割が違うので別ページにしてある。
 *
 * 計算はすべてこのファイルに集め、React 側には持ち込まない。理由は
 * 移動時間の見積もりが「直線距離からの推定」でしかなく、どこまでを
 * 数字として出してよいかの判断が1か所にまとまっていないと、表示側で
 * 勝手に精度の高そうな数字を作ってしまうため。
 */

/** プランの1行が必要とする列。詳細ページの本文には触れない。 */
export type PlanSpot = {
  slug: string;
  name: string;
  engName: string | null;
  image: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  area: string | null;
  priceAdult: string | null;
  durationText: string | null;
  openingHours: string | null;
  /**
   * 休みの曜日。0=月 〜 6=日。空配列は曜日休館なし、または未調査。
   * 「この日は閉まっています」の警告はこの値だけを見る。
   */
  closedWeekdays: number[];
  nearestStation: string | null;
  isFree: boolean;
  mustSee: boolean;
  recommendLevel: number | null;
  /**
   * ロンドンパスの対象か。プランの各行にバッジで出す。
   *
   * 合計欄には出さない。パスで元が取れるかは日数と組み合わせで決まり、
   * 「対象が5ヶ所」だけを大きく出すと、£100超のパスを買う判断を
   * 数えただけの数字で押すことになる。判断は /sightseeing/passes に任せ、
   * ここは「この施設は対象」という事実だけを持つ。
   */
  londonPass: boolean;
  /** 対象だが条件が付くときの但し書き。無条件なら null。 */
  londonPassNote: string | null;
};

/**
 * 保存されるのは slug と何日目か、それに滞在時間を変えたならその分数だけ。
 * 名前や料金は持たない。中身は毎回DBの最新を引く。
 */
export type PlanEntry = {
  slug: string;
  day: number;
  /**
   * 読者が入れた滞在時間(分)。掲載値より優先する。
   * 変えていなければ持たない——既定と同じ値を書き込むと、掲載値が
   * 変わったときに古い既定がプランに残り続ける。
   */
  minutes?: number;
};

/** 日数の上限。これ以上は旅程ではなく別の旅行。 */
export const MAX_DAYS = 10;
/** スポット数の上限。共有URLの長さと、画面の見通しの両方から。 */
export const MAX_SPOTS = 40;

/**
 * 読者が入れられる滞在時間の幅。
 *
 * 下限を5分にしているのは、0分を入れられると「その日に行くが時間は
 * かからない」という状態になり、合計から消えるため。上限の12時間は
 * 1日の予算(9時間)より大きく取ってある。上限で丸めると、入れた値と
 * 出る値が食い違って壊れて見える。
 */
export const MIN_STAY_MINUTES = 5;
export const MAX_STAY_MINUTES = 12 * 60;

/** 滞在時間として受け付けられる値か。共有URLと localStorage の両方で使う。 */
export function isValidStayMinutes(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_STAY_MINUTES &&
    value <= MAX_STAY_MINUTES
  );
}

/**
 * 1日の開始時刻(0時からの分)。
 *
 * これを入れるまで、この道具が出す時間は「滞在と移動で8時間40分」という
 * 長さだけだった。長さは足し算の答えでしかなく、読者が知りたいのは
 * 「その日は何時に終わるのか」のほうで、8時間40分が18時に終わるのか
 * 21時に終わるのかは開始時刻を決めないと出ない。閉館時刻に間に合うか、
 * 夕食の予約に間に合うかは、長さではなく時刻でしか判断できない。
 *
 * 既定の9時は /sightseeing/itinerary のモデルコースと同じ前提。
 * 変えられるようにしてあるのは、時差で早起きになる人と、
 * 昼から動き始める人で3時間はずれるため。
 */
export const DEFAULT_START_MINUTES = 9 * 60;
export const MIN_START_MINUTES = 5 * 60;
export const MAX_START_MINUTES = 15 * 60;

export function isValidStartMinutes(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= MIN_START_MINUTES &&
    value <= MAX_START_MINUTES
  );
}

/* ------------------------------------------------------------------ *
 * 共有リンク
 * ------------------------------------------------------------------ */

/**
 * slug は144件すべてが [a-z0-9-] だけでできている。
 *
 * 区切りに `.` と `_` を選んだのは、どちらも slug に現れないうえ、
 * URL のクエリで percent-encode されない文字だから。`,` も slug には
 * 現れないが、URLSearchParams を通すと %2C になり、送られたリンクが
 * 読みにくくなる(値としては同じものが戻るので動きはする)。
 * 共有リンクは人が LINE やメールに貼るものなので、見た目のまま残す。
 */
const SLUG_PATTERN = /^[a-z0-9-]+$/;
const DAY_SEPARATOR = "_";
const SPOT_SEPARATOR = ".";
/**
 * 滞在時間を変えたスポットは `slug~90` の形にする。
 * `~` も RFC 3986 の unreserved なので percent-encode されず、
 * slug にも現れない。区切りの3文字がどれも生のまま残る。
 */
const MINUTES_SEPARATOR = "~";

/**
 * 日ごとに slug を並べた文字列にする。
 *
 * 日は normalizeDays で常に 1..n に詰めてあるので、途中が空になることは
 * 画面からの操作では起きない。それでも 1..lastDay を素直に回して空の
 * 区切りを残すのは、手で書き換えられたURLを読み戻したときに日番号が
 * ずれないようにするため。
 */
export function encodePlan(entries: PlanEntry[]): string {
  if (entries.length === 0) return "";
  const lastDay = Math.max(...entries.map((e) => e.day));
  const days: string[] = [];
  for (let day = 1; day <= lastDay; day++) {
    days.push(
      entries
        .filter((e) => e.day === day)
        .map((e) =>
          isValidStayMinutes(e.minutes)
            ? `${e.slug}${MINUTES_SEPARATOR}${e.minutes}`
            : e.slug,
        )
        .join(SPOT_SEPARATOR),
    );
  }
  return days.join(DAY_SEPARATOR);
}

/**
 * 共有リンクを読み戻す。
 *
 * 他人が手で書き換えたURLも届くので、slug の形をしていないもの、重複、
 * 上限超えは黙って捨てる。プランが1件でも残るなら開く価値があるので、
 * 壊れた入力でもエラーにはしない。
 */
export function decodePlan(param: string | null | undefined): PlanEntry[] {
  if (!param) return [];
  const seen = new Set<string>();
  const entries: PlanEntry[] = [];

  param
    .split(DAY_SEPARATOR)
    .slice(0, MAX_DAYS)
    .forEach((segment, index) => {
      for (const token of segment.split(SPOT_SEPARATOR)) {
        const [slug, rawMinutes] = token.split(MINUTES_SEPARATOR);
        if (!SLUG_PATTERN.test(slug)) continue;
        if (seen.has(slug)) continue;
        if (entries.length >= MAX_SPOTS) return;
        seen.add(slug);

        // 滞在時間が壊れていてもスポットは残す。プランの中身のほうが
        // 惜しく、落とした分は掲載値に戻るだけで済む。
        const minutes = Number(rawMinutes);
        entries.push(
          rawMinutes !== undefined && isValidStayMinutes(minutes)
            ? { slug, day: index + 1, minutes }
            : { slug, day: index + 1 },
        );
      }
    });

  return normalizeDays(entries);
}

/**
 * 空の日を詰めて 1..n に振り直す。
 *
 * 途中の日を空にしたまま「3日目」だけが残ると、日の見出しと実際の
 * 旅程がずれる。中身のある日だけを順に数え直す。
 */
export function normalizeDays(entries: PlanEntry[]): PlanEntry[] {
  const used = [...new Set(entries.map((e) => e.day))].sort((a, b) => a - b);
  const remap = new Map(used.map((day, i) => [day, i + 1]));
  return entries.map((e) => ({ ...e, day: remap.get(e.day) ?? 1 }));
}

/* ------------------------------------------------------------------ *
 * スポット間の移動
 * ------------------------------------------------------------------ */

/**
 * 住所を持たないスポット。ロンドンパスや市内周遊バスのような商品で、
 * 座標は便宜的な一点でしかない(address が "-" の5件)。
 * 距離を出すと「大英博物館からロンドンパスまで徒歩12分」になるので、
 * このスポットが絡む区間は移動を出さない。
 */
export function hasRealLocation(spot: PlanSpot): boolean {
  return Boolean(spot.address) && spot.address !== "-";
}

export type LegKind = "walk" | "transit" | "daytrip";

export type PlanLeg = {
  kind: LegKind;
  /** 直線距離(km)。表示にも使うので丸めずに持つ。 */
  km: number;
  /** 旅程の合計に足す分数。 */
  minutes: number;
};

/** 実際に歩く道のりは直線距離の1.3倍前後になる。 */
const STREET_FACTOR = 1.3;
/** 信号と人混みを含めた実効の歩行速度。観光客の速度で見積もる。 */
const WALK_KMH = 4.5;
/** これを超えたら歩かせない。中心部で1.2kmは徒歩15分強。 */
const WALK_MAX_KM = 1.2;
/** これを超えたらロンドン市内の移動ではない(ウィンザー、ビスター等)。 */
const DAYTRIP_KM = 15;

/**
 * 地下鉄・バスでの移動に置く固定値。
 *
 * 直線距離から乗換回数や待ち時間は出せない。区間ごとに違う数字を出すと
 * 精度があるように見えてしまうので、市内は一律30分、郊外は片道90分で
 * 置く。実際の所要は乗換案内で確かめてもらう前提で、ここは「1日に
 * 収まるかどうか」の判断材料に徹する。
 */
const TRANSIT_MINUTES = 30;
const DAYTRIP_MINUTES = 90;

/** 区間ひとつぶんの移動。どちらかが住所を持たないスポットなら null。 */
export function legBetween(from: PlanSpot, to: PlanSpot): PlanLeg | null {
  if (!hasRealLocation(from) || !hasRealLocation(to)) return null;

  const km = distanceKm(from, to);

  if (km <= WALK_MAX_KM) {
    const minutes = Math.max(
      1,
      Math.round(((km * STREET_FACTOR) / WALK_KMH) * 60),
    );
    return { kind: "walk", km, minutes };
  }

  if (km <= DAYTRIP_KM) {
    return { kind: "transit", km, minutes: TRANSIT_MINUTES };
  }

  return { kind: "daytrip", km, minutes: DAYTRIP_MINUTES };
}

/* ------------------------------------------------------------------ *
 * 1日ぶんの集計
 * ------------------------------------------------------------------ */

/**
 * 「大型施設」の線引き。滞在の目安が2時間以上のもの。
 *
 * /sightseeing/itinerary が「大型施設は1日2ヶ所まで」を勧めている。
 * 記事とこの道具が違うことを言うと、どちらを信じればよいか分からなく
 * なるので、警告の基準を記事に合わせてある。記事側を直すときはここも直すこと。
 */
const BIG_VENUE_MINUTES = 120;
export const BIG_VENUES_PER_DAY = 2;

/**
 * 1日の上限。9時に出て18時に戻る想定。
 *
 * 表示側でも使う——1日ぶんの帯をこの長さで割って、どこまで埋まっているかを
 * 出している。警告の基準と帯の目盛りが違うと、帯が満杯なのに警告が出ない
 * (あるいはその逆の)日ができる。
 */
export const DAY_BUDGET_MINUTES = 9 * 60;

export type PlanWarning = {
  /** 同じ日に2つ出しても意味のない警告があるので種別を持つ。 */
  kind: "big-venues" | "too-long" | "daytrip" | "closed";
  message: string;
};

export type PlanRow = {
  spot: PlanSpot;
  /** 直前のスポットからの移動。その日の先頭は null。 */
  legFromPrevious: PlanLeg | null;
  /**
   * その日が休館日だと原文から読み取れた場合の曜日一覧(「月・火」)。
   * 出発日が未設定のとき、および openingHours が曜日に触れていないときは null。
   */
  closedOn: string | null;
  /**
   * 合計に入れた滞在時間(分)。掲載値も読者の入力も無ければ null。
   * 表示側はこの値を出す——原文と合計が食い違って見えないように。
   */
  stayMinutes: number | null;
  /** 掲載値から読める滞在時間(分)。「既定に戻す」の宛先。無ければ null。 */
  defaultMinutes: number | null;
  /** 読者が入れた値を使っているか。 */
  overridden: boolean;
  /**
   * ここに着く時刻(0時からの分)。開始時刻に、手前の滞在と移動を足したもの。
   *
   * 滞在時間の分からないスポットは0分として先へ進める。合計の出し方と
   * 同じ扱いで、そこを「不明」で打ち切ると、1ヶ所欠けただけでその日の
   * 残り全部から時刻が消える。ずれる向きは常に「実際はこれより遅い」の
   * 一方向なので、表示側はその旨を断ったうえで時刻を出す。
   */
  arriveMinutes: number;
  /** ここを出る時刻(0時からの分)。滞在時間が分からなければ到着と同じ。 */
  leaveMinutes: number;
};

export type BuildDayOptions = {
  /** その日の日付。渡すと曜日で閉まるスポットを警告に足す。 */
  date?: Date | null;
  /** slug → 読者が入れた滞在時間(分)。掲載値より優先する。 */
  overrides?: ReadonlyMap<string, number>;
  /** その日の開始時刻(0時からの分)。省略すると9時。 */
  startMinutes?: number;
};

export type DayPlan = {
  day: number;
  rows: PlanRow[];
  /** 滞在時間の合計(分)。掲載値も読者の入力も無いスポットは数えない。 */
  stayMinutes: number;
  /** 移動時間の合計(分)。 */
  travelMinutes: number;
  /**
   * 滞在時間が分からなかったスポット数。合計の下に断りを出すのに使う。
   * 読者が自分で入れれば0になる。
   */
  unknownDurationCount: number;
  /** 大人料金の合計(£)。 */
  totalGbp: number;
  /** 料金が分からなかったスポット数。 */
  unknownPriceCount: number;
  warnings: PlanWarning[];
  /** その日の開始時刻(0時からの分)。 */
  startMinutes: number;
  /** 最後のスポットを出る時刻(0時からの分)。空の日は開始時刻と同じ。 */
  endMinutes: number;
};

/**
 * 1日ぶんのスポット列から、移動・合計・警告を組み立てる。
 *
 * date を渡すと、その曜日に閉まっているスポットを警告に足す。渡さない
 * (出発日が未設定の)ときは曜日の判定そのものを行わない。開館曜日は
 * openingHours の原文から読めるぶんだけを見ているので、警告が出ないことは
 * 「開いている」ではなく「原文に書かれていない」を意味する。
 */
export function buildDayPlan(
  day: number,
  spots: PlanSpot[],
  options: BuildDayOptions = {},
): DayPlan {
  const { date, overrides, startMinutes: dayStart = DEFAULT_START_MINUTES } =
    options;
  const weekday = date ? weekdayIndex(date) : null;

  // 時刻を積み上げながら組む。到着時刻は手前の行が決まらないと出せないので、
  // map ではなく順に走らせる必要がある。
  let clock = dayStart;

  const rows: PlanRow[] = spots.map((spot, i) => {
    /*
     * 休館曜日は Attraction.closedWeekdays が持つ。以前は openingHours の
     * 原文を正規表現で読んでいたが、読めるのが155件中10件しかなかった。
     *
     * 空配列は「毎日開いている」と「まだ調べていない」の両方でありうる。
     * どちらでも警告を出さない点は同じなので、ここでは区別しない
     * (区別が要るのは点検する側で、closedDaysCheckedAt が持つ)。
     */
    const closedDays = weekday === null ? null : spot.closedWeekdays;

    /*
     * 滞在時間は掲載値を既定にして、読者が入れていればそちらを採る。
     *
     * 掲載値のほうを書き換えないのは、原文が「1〜1時間半」のように幅と
     * 注記を持っているため。読者が入れるのは合計に足す1つの数で、
     * 原文の代わりにはならない。両方を持って、出す側で選ぶ。
     */
    const defaultMinutes = parseDurationMinutes(spot.durationText);
    const override = overrides?.get(spot.slug);
    const overridden = isValidStayMinutes(override);
    const stayMinutes = overridden ? override : defaultMinutes;

    const legFromPrevious = i === 0 ? null : legBetween(spots[i - 1], spot);
    const arriveMinutes = clock + (legFromPrevious?.minutes ?? 0);
    const leaveMinutes = arriveMinutes + (stayMinutes ?? 0);
    clock = leaveMinutes;

    return {
      spot,
      legFromPrevious,
      closedOn:
        closedDays && weekday !== null && closedDays.includes(weekday)
          ? formatClosedDays(closedDays)
          : null,
      stayMinutes,
      defaultMinutes,
      overridden,
      arriveMinutes,
      leaveMinutes,
    };
  });

  let stayMinutes = 0;
  let unknownDurationCount = 0;
  let totalGbp = 0;
  let unknownPriceCount = 0;
  let bigVenues = 0;

  for (const row of rows) {
    const minutes = row.stayMinutes;
    if (minutes === null) {
      unknownDurationCount++;
    } else {
      stayMinutes += minutes;
      if (minutes >= BIG_VENUE_MINUTES) bigVenues++;
    }

    const price = parsePriceGbp(row.spot.priceAdult);
    if (price === null) unknownPriceCount++;
    else totalGbp += price;
  }

  const travelMinutes = rows.reduce(
    (sum, row) => sum + (row.legFromPrevious?.minutes ?? 0),
    0,
  );

  const warnings: PlanWarning[] = [];

  if (bigVenues > BIG_VENUES_PER_DAY) {
    warnings.push({
      kind: "big-venues",
      message: `滞在2時間以上の施設が${bigVenues}ヶ所あります。1日2ヶ所までに減らすと、残りを街歩きに使えます。`,
    });
  }

  const endMinutes = rows.length === 0 ? dayStart : rows[rows.length - 1].leaveMinutes;

  const total = stayMinutes + travelMinutes;
  if (total > DAY_BUDGET_MINUTES) {
    warnings.push({
      kind: "too-long",
      // 長さではなく終わる時刻で言う。「9時間40分」は多いかどうかの判断が
      // 要るが、「終わるのは20:40」はその場で分かる。
      message: `${formatClock(dayStart)}に出ても、終わるのは${formatClock(endMinutes)}です。1ヶ所を別の日に移すと収まります。`,
    });
  }

  // 休館日は真っ先に出す。詰め込みすぎは現地で削れば済むが、閉まっている
  // 日に行くのは出発前にしか直せない。
  const closedRows = rows.filter((row) => row.closedOn);
  if (closedRows.length > 0) {
    warnings.unshift({
      kind: "closed",
      message: `この日は${closedRows
        .map((row) => `${row.spot.name}(${row.closedOn}休)`)
        .join("・")}が閉まっています。別の日に移すか、外してください。`,
    });
  }

  const daytripCount = rows.filter(
    (row) => row.legFromPrevious?.kind === "daytrip",
  ).length;
  if (daytripCount > 0) {
    warnings.push({
      kind: "daytrip",
      message:
        "ロンドン市外への移動が入っています。ウィンザーやビスターは往復だけで半日かかるので、その日は1ヶ所に絞るのが現実的です。",
    });
  }

  return {
    day,
    rows,
    stayMinutes,
    travelMinutes,
    unknownDurationCount,
    totalGbp,
    unknownPriceCount,
    warnings,
    startMinutes: dayStart,
    endMinutes,
  };
}

/* ------------------------------------------------------------------ *
 * 並べ替え
 * ------------------------------------------------------------------ */

/**
 * 地理的に近い順へ並べ替える(最近傍法)。
 *
 * 選んだ順に回ると、ロンドン塔 → 大英博物館 → タワーブリッジ のように
 * 同じ道を往復する旅程ができあがる。厳密な最短経路(TSP)は解かないが、
 * 1日ぶんは数ヶ所しかないので、最近傍で組むだけで往復はほぼ消える。
 *
 * 起点は動かさない。「朝いちばんにここへ行きたい」という意図が
 * 並べ替えで消えるほうが、数百m遠回りするより困るため。
 * 住所を持たないスポット(パス類)は距離を測れないので末尾に置く。
 */
export function orderByProximity(spots: PlanSpot[]): PlanSpot[] {
  const locatable = spots.filter(hasRealLocation);
  const rest = spots.filter((spot) => !hasRealLocation(spot));
  if (locatable.length <= 2) return [...locatable, ...rest];

  const remaining = locatable.slice(1);
  const ordered = [locatable[0]];

  while (remaining.length > 0) {
    const current = ordered[ordered.length - 1];
    let nearest = 0;
    let nearestKm = Infinity;
    remaining.forEach((spot, i) => {
      const km = distanceKm(current, spot);
      if (km < nearestKm) {
        nearestKm = km;
        nearest = i;
      }
    });
    ordered.push(remaining.splice(nearest, 1)[0]);
  }

  return [...ordered, ...rest];
}

/* ------------------------------------------------------------------ *
 * 表示用の整形
 * ------------------------------------------------------------------ */

/** 分を「3時間20分」の形にする。0分は "0分"。 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}分`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}時間` : `${h}時間${m}分`;
}

/**
 * 0時からの分を「9:00」「18:40」の形にする。
 *
 * 日をまたいだら「翌1:20」。上限12時間の滞在を並べれば24時を越えられるので、
 * そこで 0:20 に巻き戻すと、前の行より早い時刻が下に並ぶことになる。
 */
export function formatClock(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const dayOffset = Math.floor(total / (24 * 60));
  const h = Math.floor((total % (24 * 60)) / 60);
  const m = total % 60;
  return `${dayOffset > 0 ? "翌" : ""}${h}:${String(m).padStart(2, "0")}`;
}

/** 距離を「600m」「2.4km」の形にする。1km未満は10m単位に丸める。 */
export function formatKm(km: number): string {
  if (km >= 1) return `${km.toFixed(1)}km`;
  // 座標がほぼ同じスポット同士で「0m」と出ると壊れて見えるので下限を置く。
  return `${Math.max(10, Math.round(km * 100) * 10)}m`;
}

/** 合計金額。端数の出ない額は整数で出す。 */
export function formatGbp(amount: number): string {
  return Number.isInteger(amount) ? `£${amount}` : `£${amount.toFixed(2)}`;
}

const LEG_LABELS: Record<LegKind, string> = {
  walk: "徒歩",
  transit: "地下鉄・バス",
  daytrip: "市外へ移動",
};

export function legLabel(leg: PlanLeg): string {
  if (leg.kind === "walk") {
    return `徒歩${leg.minutes}分 (${formatKm(leg.km)})`;
  }
  // 市内・市外は固定値で置いているので「約」を付けて、直線距離を添える。
  return `${LEG_LABELS[leg.kind]}で約${formatMinutes(leg.minutes)} (直線${formatKm(leg.km)})`;
}

/* ------------------------------------------------------------------ *
 * Google マップ
 * ------------------------------------------------------------------ */

/** Directions API のURLが受け取れる経由地の数。 */
const MAX_WAYPOINTS = 9;

/**
 * その日のルートを Google マップの経路検索で開くURL。
 *
 * 名前ではなく座標を渡す。日本語名では引けず、英名でも "The Shard" のような
 * 一般名詞に近いものが別の場所に当たることがあるため。
 * 2ヶ所未満、または住所を持たないスポットだけの日では null を返す。
 */
export function dayDirectionsUrl(spots: PlanSpot[]): string | null {
  const points = spots.filter(hasRealLocation);
  if (points.length < 2) return null;

  const coords = (spot: PlanSpot) => `${spot.lat},${spot.lng}`;
  const origin = coords(points[0]);
  const destination = coords(points[points.length - 1]);
  const waypoints = points
    .slice(1, -1)
    .slice(0, MAX_WAYPOINTS)
    .map(coords)
    .join("|");

  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
    // 徒歩を既定にする。中心部の旅程はほとんど歩きで、地下鉄が要る区間は
    // マップ側で切り替えたほうが早い。
    travelmode: "walking",
  });
  if (waypoints) params.set("waypoints", waypoints);

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

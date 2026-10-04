/**
 * ロンドンの日の出・日の入りと、夏時間の切り替え日。
 *
 * 外部 API は使わず計算で出す。日の出・日の入りは天文計算で決まり、
 * 何年先でも同じ式で求まる。API に頼ると、落ちたときに月別ページの
 * 主要な数字が消える。
 *
 * 式は NOAA 系の簡易式(いわゆる sunrise equation)。大気差と太陽の
 * 視半径を -0.833° で見込み、誤差は1〜2分。旅程を決める目安には十分で、
 * 分単位の正確さが要る用途(礼拝の時刻など)には使わないこと。
 */

/** ロンドン中心部(トラファルガー広場付近)。天気予報と同じ点。 */
const LONDON = { latitude: 51.5074, longitude: -0.1278 };

const DAY_MS = 24 * 60 * 60 * 1000;
const RAD = Math.PI / 180;

/** Date(UTC) → ユリウス日。 */
function toJulian(ms: number): number {
  return ms / DAY_MS + 2440587.5;
}

function fromJulian(julian: number): number {
  return (julian - 2440587.5) * DAY_MS;
}

/**
 * その日の日の出・日の入りの時刻(UTC のミリ秒)。
 * 白夜・極夜になる緯度ではないので、ロンドンでは常に両方が求まる。
 */
function sunEvents(year: number, month: number, day: number) {
  const noonUtc = Date.UTC(year, month - 1, day, 12);
  const n = Math.round(toJulian(noonUtc) - 2451545.0 + 0.0008);
  const meanSolarNoon = n - LONDON.longitude / 360;

  const anomaly = (357.5291 + 0.98560028 * meanSolarNoon) % 360;
  const m = anomaly * RAD;
  const center =
    1.9148 * Math.sin(m) + 0.02 * Math.sin(2 * m) + 0.0003 * Math.sin(3 * m);
  const eclipticLongitude = ((anomaly + center + 180 + 102.9372) % 360) * RAD;

  const transit =
    2451545.0 +
    meanSolarNoon +
    0.0053 * Math.sin(m) -
    0.0069 * Math.sin(2 * eclipticLongitude);

  const declination = Math.asin(
    Math.sin(eclipticLongitude) * Math.sin(23.4397 * RAD)
  );
  const latitude = LONDON.latitude * RAD;
  const hourAngle = Math.acos(
    (Math.sin(-0.833 * RAD) - Math.sin(latitude) * Math.sin(declination)) /
      (Math.cos(latitude) * Math.cos(declination))
  );
  const offset = hourAngle / (2 * Math.PI);

  return {
    sunrise: fromJulian(transit - offset),
    sunset: fromJulian(transit + offset),
  };
}

const LONDON_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/London",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export type SunDay = {
  /** その月の何日か。 */
  day: number;
  /** ロンドン時間の "07:12"。夏時間の期間は BST で出る。 */
  sunrise: string;
  sunset: string;
  /** 日の出から日の入りまで(分)。 */
  daylightMinutes: number;
};

export function getSunDay(year: number, month: number, day: number): SunDay {
  const { sunrise, sunset } = sunEvents(year, month, day);
  return {
    day,
    sunrise: LONDON_TIME.format(sunrise),
    sunset: LONDON_TIME.format(sunset),
    daylightMinutes: Math.round((sunset - sunrise) / 60000),
  };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/**
 * 月の1日・15日・末日の3点。
 *
 * 毎日の表にしないのは、読者が知りたいのは「何時ごろ暗くなるか」の
 * 幅であって、特定の日の分単位の時刻ではないから。夏時間の切り替えが
 * ある月は、切り替えの前後で1時間跳ぶので、別に getClockChange で示す。
 */
export function getMonthSunDays(year: number, month: number): SunDay[] {
  return [1, 15, daysInMonth(year, month)].map((day) =>
    getSunDay(year, month, day)
  );
}

/** その月の最終日曜日(1〜31)。 */
function lastSunday(year: number, month: number): number {
  const last = daysInMonth(year, month);
  const dow = new Date(Date.UTC(year, month - 1, last)).getUTCDay();
  return last - dow;
}

export type ClockChange = {
  day: number;
  /** "start" = 夏時間が始まる(時計を1時間進める) / "end" = 終わる(戻す)。 */
  kind: "start" | "end";
};

/**
 * 夏時間(BST)の切り替え。3月と10月の最終日曜日。
 * それ以外の月は null。
 */
export function getClockChange(year: number, month: number): ClockChange | null {
  if (month === 3) return { day: lastSunday(year, 3), kind: "start" };
  if (month === 10) return { day: lastSunday(year, 10), kind: "end" };
  return null;
}

/**
 * その日の日本との時差(時間)。夏時間中は8、それ以外は9。
 * 夏時間は3月最終日曜〜10月最終日曜。切り替えは深夜1時(UTC)だが、
 * 日単位の表示なので当日は切り替え後として扱う。
 */
export function hoursBehindJapan(year: number, month: number, day: number): number {
  const start = Date.UTC(year, 2, lastSunday(year, 3));
  const end = Date.UTC(year, 9, lastSunday(year, 10));
  const t = Date.UTC(year, month - 1, day);
  return t >= start && t < end ? 8 : 9;
}

/** 「9時間12分」。 */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}時間` : `${h}時間${m}分`;
}

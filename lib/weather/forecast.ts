/**
 * Open-Meteo からロンドンの週間予報を取得する。
 *
 * 設計メモ:
 * 1. APIキー不要・商用利用可・1日1万リクエストまで無料。登録も要らない。
 * 2. 天候コードは WMO 4677 準拠の数値。Open-Meteo が使う組み合わせだけを
 *    日本語ラベルと絵文字に写像する。
 * 3. イギリスの天気は「気温より雨が降るか」が旅程を左右するので、
 *    降水確率を最高気温と同格で扱う。
 */

/** ロンドン中心部(トラファルガー広場付近)の座標。 */
const LONDON = { latitude: 51.5074, longitude: -0.1278 };

const ENDPOINT =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${LONDON.latitude}&longitude=${LONDON.longitude}` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
  `&timezone=Europe%2FLondon&forecast_days=7`;

/**
 * キャッシュ秒数。Open-Meteo の予報モデル自体が1時間ごとの更新なので、
 * それより短くしても新しい値は返ってこない。
 */
export const WEATHER_REVALIDATE_SECONDS = 3600;

type OpenMeteoResponse = {
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: (number | null)[];
  };
};

export type DailyForecast = {
  /** ISO 日付 (YYYY-MM-DD)。 */
  date: string;
  /** 「8/14(木)」形式の表示用ラベル。 */
  label: string;
  /** 今日かどうか。UIで強調するのに使う。 */
  isToday: boolean;
  weather: string;
  icon: string;
  tempMax: number;
  tempMin: number;
  /** 降水確率(%)。取得できない日は null。 */
  precipitation: number | null;
};

export type ForecastResult = {
  days: DailyForecast[];
  fetchedAt: string;
};

/**
 * WMO 天候コード → 日本語ラベルと絵文字。
 * Open-Meteo が返しうるコードを網羅している。
 */
const WMO: Record<number, { text: string; icon: string }> = {
  0: { text: "快晴", icon: "☀️" },
  1: { text: "晴れ", icon: "🌤️" },
  2: { text: "薄曇り", icon: "⛅" },
  3: { text: "曇り", icon: "☁️" },
  45: { text: "霧", icon: "🌫️" },
  48: { text: "霧(着氷性)", icon: "🌫️" },
  51: { text: "霧雨(弱)", icon: "🌦️" },
  53: { text: "霧雨", icon: "🌦️" },
  55: { text: "霧雨(強)", icon: "🌧️" },
  56: { text: "着氷性の霧雨", icon: "🌧️" },
  57: { text: "着氷性の霧雨(強)", icon: "🌧️" },
  61: { text: "小雨", icon: "🌦️" },
  63: { text: "雨", icon: "🌧️" },
  65: { text: "強い雨", icon: "🌧️" },
  66: { text: "着氷性の雨", icon: "🌧️" },
  67: { text: "着氷性の雨(強)", icon: "🌧️" },
  71: { text: "小雪", icon: "🌨️" },
  73: { text: "雪", icon: "🌨️" },
  75: { text: "大雪", icon: "❄️" },
  77: { text: "霧雪", icon: "🌨️" },
  80: { text: "にわか雨(弱)", icon: "🌦️" },
  81: { text: "にわか雨", icon: "🌧️" },
  82: { text: "激しいにわか雨", icon: "⛈️" },
  85: { text: "にわか雪", icon: "🌨️" },
  86: { text: "にわか雪(強)", icon: "❄️" },
  95: { text: "雷雨", icon: "⛈️" },
  96: { text: "雷雨(ひょう)", icon: "⛈️" },
  99: { text: "激しい雷雨(ひょう)", icon: "⛈️" },
};

const WEEKDAY_JA = ["日", "月", "火", "水", "木", "金", "土"];

/**
 * 「8/14(木)」を作る。
 * ISO 文字列を手で分解しているのは、new Date(iso) だと実行環境の
 * タイムゾーンでずれる可能性があるため。予報の日付はロンドン基準で
 * 確定しているので、そのまま文字として扱う。
 */
function toLabel(iso: string): { label: string; weekdayIndex: number } {
  const [y, m, d] = iso.split("-").map(Number);
  // 曜日計算のみ UTC 正午で固定して、日付境界のずれを避ける。
  const weekdayIndex = new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay();
  return { label: `${m}/${d}(${WEEKDAY_JA[weekdayIndex]})`, weekdayIndex };
}

/** ロンドンの「今日」の ISO 日付。予報配列の先頭と突き合わせる。 */
function londonToday(): string {
  // en-CA ロケールは YYYY-MM-DD を返すので ISO 日付として扱える。
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

export async function fetchLondonForecast(): Promise<ForecastResult> {
  const res = await fetch(ENDPOINT, {
    headers: { Accept: "application/json" },
    next: { revalidate: WEATHER_REVALIDATE_SECONDS },
  });

  if (!res.ok) {
    throw new Error(`Open-Meteo responded ${res.status}`);
  }

  const { daily } = (await res.json()) as OpenMeteoResponse;
  const today = londonToday();

  const days: DailyForecast[] = daily.time.map((date, i) => {
    const code = daily.weather_code[i];
    const wmo = WMO[code] ?? { text: "―", icon: "🌡️" };
    const { label } = toLabel(date);

    return {
      date,
      label,
      isToday: date === today,
      weather: wmo.text,
      icon: wmo.icon,
      tempMax: Math.round(daily.temperature_2m_max[i]),
      tempMin: Math.round(daily.temperature_2m_min[i]),
      precipitation: daily.precipitation_probability_max[i] ?? null,
    };
  });

  return { days, fetchedAt: new Date().toISOString() };
}

/**
 * -------------------------------------------------------------------
 * 週次ダイジェスト向けの切り出し。
 *
 * 週間予報は既に7日ぶん取れているのに、これまでトップの1行帯が
 * 「今日」だけを使って残りを捨てていた。号の会期(weekStart〜weekEnd)と
 * 重なる日だけを抜き出して、催しの一覧の隣に置くために足した層。
 *
 * 予報は Open-Meteo の forecast_days=7 が上限なので、号の後半が
 * 予報範囲の外に出ることがある(来週号を早めに出した場合など)。
 * その場合は取れた日だけを返す。足りない日を推測で埋めない。
 * -------------------------------------------------------------------
 */

/** ロンドン基準の ISO 日付 (YYYY-MM-DD) に落とす。 */
function toLondonIsoDate(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

/**
 * 週の範囲に重なる予報日だけを返す。
 *
 * 範囲が予報のどこにも重ならなければ空配列。呼び出し側は空なら
 * ブロックごと出さないこと——「予報なし」と書くより、何も出ないほうがよい。
 */
export function selectForecastForWeek(
  forecast: ForecastResult,
  weekStart: Date,
  weekEnd: Date
): DailyForecast[] {
  const start = toLondonIsoDate(weekStart);
  const end = toLondonIsoDate(weekEnd);
  // ISO 日付は辞書順と時系列順が一致するので、文字列比較で足りる。
  return forecast.days.filter((day) => day.date >= start && day.date <= end);
}

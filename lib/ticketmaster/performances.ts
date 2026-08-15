/**
 * Ticketmaster Discovery API から公演日程を取る。
 *
 * 対象は Musical.ticketmasterAttractionId が入っている作品だけ。
 * その ID は scripts/link-musical-ticketmaster.ts で人が確認した組しか
 * 入っていないので、ここでは名寄せを一切しない。attraction ID で引いた
 * ものはその作品の公演である、という前提だけで動く。
 */

/** Discovery API のうち実際に使うフィールドだけを写した型。 */
type TicketmasterEvent = {
  id: string;
  url?: string;
  dates?: {
    start?: {
      localDate?: string;
      localTime?: string;
      dateTBD?: boolean;
      dateTBA?: boolean;
      timeTBA?: boolean;
      noSpecificTime?: boolean;
    };
    status?: { code?: string };
  };
  _embedded?: {
    venues?: { name?: string; city?: { name?: string } }[];
  };
};

export type Performance = {
  eventId: string;
  startsAt: Date;
  timeTba: boolean;
  url?: string;
  status: string;
};

const ENDPOINT = "https://app.ticketmaster.com/discovery/v2/events.json";

/** 1リクエストの最大件数。Discovery API の上限。 */
const PAGE_SIZE = 200;

/**
 * 取得するページ数の上限。
 *
 * 無料枠は (page+1)*size <= 1000 を超えると HTTP 400 を返す。
 * 200件 x 5ページ = 1000 がちょうど上限。ロングランでも半年先までは
 * これで収まる(実測で最多 Vaudeville の607公演)。
 */
const MAX_PAGES = 5;

/** 連続呼び出しの間隔。無料枠は 5req/sec なので余裕を持たせる。 */
const REQUEST_INTERVAL_MS = 250;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * ロンドンの現地時刻を UTC の Date にする。
 *
 * TM は localDate と localTime を別々に返し、オフセットを持たない。
 * new Date("2026-08-15T19:30:00") と書くと実行環境のタイムゾーンで
 * 解釈され、日本で動かすと9時間ずれる。同期スクリプトは手元(JST)でも
 * サーバー(UTC)でも走るので、環境非依存に London として組み立てる。
 *
 * 夏時間の切り替えを自前で計算しない。Intl に London の実際のオフセットを
 * 訊いて差を埋める(BST は 3月最終日曜〜10月最終日曜で、年により日付が動く)。
 */
function londonLocalToDate(localDate: string, localTime: string): Date {
  // まず UTC とみなして仮の時刻を作る
  const naive = new Date(`${localDate}T${localTime}Z`);
  if (Number.isNaN(naive.getTime())) {
    throw new Error(`日時を解釈できません: ${localDate} ${localTime}`);
  }

  // その瞬間のロンドンの壁時計を求め、仮の時刻とのズレをオフセットとみなす
  const londonWallClock = new Date(
    naive.toLocaleString("en-US", { timeZone: "Europe/London" }),
  );
  const utcWallClock = new Date(naive.toLocaleString("en-US", { timeZone: "UTC" }));
  const offsetMs = londonWallClock.getTime() - utcWallClock.getTime();

  return new Date(naive.getTime() - offsetMs);
}

/**
 * 1作品ぶんの公演日程を取得する。
 *
 * ロンドン以外の会場は落とす。attraction は国際ツアーを含むことがあり
 * (例: "Mamma Mia! (International)")、そのまま入れると他都市の日程が
 * ロンドンの公演として並ぶ。
 */
export async function fetchPerformances(
  attractionId: string,
  apiKey: string,
): Promise<Performance[]> {
  const performances: Performance[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url =
      `${ENDPOINT}?attractionId=${encodeURIComponent(attractionId)}` +
      `&city=London&countryCode=GB&size=${PAGE_SIZE}&page=${page}&sort=date,asc` +
      `&apikey=${encodeURIComponent(apiKey)}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Ticketmaster responded ${res.status} (attraction ${attractionId})`);
    }

    const data = (await res.json()) as { _embedded?: { events?: TicketmasterEvent[] } };
    const events = data._embedded?.events ?? [];

    for (const event of events) {
      const start = event.dates?.start;
      const localDate = start?.localDate;
      // 日付未定の公演は日程として出せない。時刻未定は日付だけ出す。
      if (!localDate || start?.dateTBD || start?.dateTBA) continue;

      // ロンドン以外の会場を落とす。
      const city = event._embedded?.venues?.[0]?.city?.name ?? "";
      if (!city.toLowerCase().includes("london")) continue;

      const timeTba = start.timeTBA === true || start.noSpecificTime === true || !start.localTime;
      // 時刻未定は 00:00 として持ち、表示側で timeTba を見て時刻を隠す。
      const localTime = timeTba ? "00:00:00" : start.localTime!;

      performances.push({
        eventId: event.id,
        startsAt: londonLocalToDate(localDate, localTime),
        timeTba,
        url: event.url,
        status: event.dates?.status?.code ?? "onsale",
      });
    }

    if (events.length < PAGE_SIZE) break;
    await sleep(REQUEST_INTERVAL_MS);
  }

  return performances;
}

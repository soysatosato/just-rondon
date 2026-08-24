/**
 * TfL の StopPoint / Journey Planner から、観光スポットの最寄駅と
 * 徒歩分を求める。
 *
 * 設計メモ:
 *
 * 1. APIキーは不要(lib/tfl/status.ts と同じ無登録枠)。ただしこちらは
 *    **リクエスト時に呼ばない。** 駅の位置も徒歩経路も年単位で変わらない
 *    ものなので、スクリプトで1回引いて Attraction.nearestStation に
 *    焼き込み、表示側はDBだけを見る。読者を待たせる理由がない。
 *
 * 2. 距離は直線距離を使わない。StopPoint が返す distance は直線だが、
 *    ロンドン塔(城壁の内側)やキューガーデン(園内)のように敷地が広い
 *    スポットでは、実際の徒歩経路が直線の2〜3倍になる。直線で「徒歩3分」
 *    と書くと、現地で倍かかって読者が列車を逃す。したがって
 *    Journey Planner に歩かせた実経路の所要時間を採る。
 *
 * 3. 逆に StopPoint を省いて Journey Planner だけで済ませることもできない。
 *    あれは「どの駅が近いか」を教えてくれないので、候補の列挙には
 *    半径検索が要る。2段構えにしているのはそのため。
 *
 * 4. 徒歩の分数は TfL の値をそのまま使い、こちらで割り算し直さない。
 *    TfL の歩速は 75m/分ほどでやや遅めだが、信号待ちや階段を含んだ
 *    値として一貫している。自前の歩速で上書きすると、経路長だけ
 *    TfL・分数だけ自前という継ぎ接ぎになり、根拠が説明できなくなる。
 */

/** 検索する駅の種別。バス停は数が多すぎて「最寄駅」の役に立たない。 */
const STOP_TYPES = "NaptanMetroStation,NaptanRailStation";

/** 対象の交通機関。lib/tfl/status.ts の MODES に national-rail を足したもの。 */
const MODES = "tube,dlr,elizabeth-line,overground,national-rail";

/**
 * 駅を探す半径(m)。
 *
 * 1500m は「歩けるが遠い」の上限。これを超える郊外のスポット
 * (ウィンザー城など)は最寄駅を出しても徒歩の案内にならないので、
 * 見つからなかったものとして扱い、人が書いた既存の値を残す。
 */
const SEARCH_RADIUS_M = 1500;

/** 候補として徒歩経路を引く駅の数。直線距離の上位からこの数だけ試す。 */
const CANDIDATE_LIMIT = 3;

type StopPoint = {
  naptanId: string;
  commonName: string;
  /** 直線距離(m)。候補の絞り込みにだけ使う。 */
  distance: number;
  modes: string[];
};

export type NearestStation = {
  /** 駅名(日本語表示用に整えたもの)。例: 「Tower Hill」 */
  name: string;
  /** TfL の正式名。例: 「Tower Hill Underground Station」 */
  officialName: string;
  naptanId: string;
  /** 徒歩の所要分。TfL の Journey Planner が返した値。 */
  walkMinutes: number;
  /** 徒歩経路の距離(m)。直線ではない。 */
  walkMetres: number;
  /** そのまま Attraction.nearestStation に入れる文字列。 */
  label: string;
};

/**
 * TfL の駅名から、日本語の文中で邪魔になる接尾辞を落とす。
 *
 * 「Tower Hill Underground Station」のままだと
 * 「Tower Hill Underground Station 徒歩9分」と長すぎて読み飛ばされる。
 * 駅であることは「徒歩◯分」の文脈で自明なので、種別は落として
 * 固有名だけ残す。
 */
function shortenStationName(officialName: string): string {
  return officialName
    .replace(/\s+(Underground|DLR|Rail|Overground)\s+Station$/i, "")
    .replace(/\s+Station$/i, "")
    .trim();
}

/**
 * 429 のときに待ち直す回数と初期待ち時間。
 *
 * 無登録枠は1分あたり50回。スポット1件で最大4回叩くので、走らせ方に
 * よっては普通に上限へ触れる。ここで諦めると144件の一括更新が途中で
 * 落ち、どこまで進んだか分からなくなる。指数で待てば枠は必ず回復する
 * (上限は分単位のローリングウィンドウなので、数十秒待てば空く)。
 */
const MAX_RETRIES = 4;
const RETRY_BASE_MS = 5000;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function tflJson<T>(url: string): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        // UA が無いと TfL に 403 で弾かれることがある。
        "User-Agent": "just-rondon/1.0 (+https://www.just-rondon.com)",
      },
    });

    if (res.ok) return (await res.json()) as T;

    // 429(枠切れ)と 5xx(一時的な不調)だけ待って引き直す。
    // 404 のような「そもそも無い」応答を繰り返し叩いても意味がない。
    const retriable = res.status === 429 || res.status >= 500;
    if (!retriable || attempt >= MAX_RETRIES) {
      throw new Error(`TfL API responded ${res.status} for ${url}`);
    }

    await wait(RETRY_BASE_MS * 2 ** attempt);
  }
}

/**
 * 半径内の駅を直線距離の近い順に返す。
 *
 * TfL は distance の昇順で返す(確認済み)。候補を先頭から数駅だけ
 * 取る前提はこの順序に依存しているので、並べ替えはこちらでは行わない。
 */
async function findNearbyStations(lat: number, lng: number): Promise<StopPoint[]> {
  const url =
    `https://api.tfl.gov.uk/StopPoint?lat=${lat}&lon=${lng}` +
    `&stopTypes=${STOP_TYPES}&radius=${SEARCH_RADIUS_M}&modes=${MODES}`;
  const data = await tflJson<{ stopPoints?: StopPoint[] }>(url);
  return data.stopPoints ?? [];
}

/** 座標から駅まで実際に歩かせて、所要分と経路長を得る。 */
async function walkTo(
  lat: number,
  lng: number,
  naptanId: string
): Promise<{ minutes: number; metres: number } | null> {
  const url =
    `https://api.tfl.gov.uk/Journey/JourneyResults/${lat},${lng}/to/${naptanId}` +
    `?mode=walking`;

  try {
    const data = await tflJson<{
      journeys?: { duration?: number; legs?: { distance?: number }[] }[];
    }>(url);
    const journey = data.journeys?.[0];
    if (!journey?.duration) return null;

    const metres = journey.legs?.[0]?.distance ?? 0;
    return { minutes: journey.duration, metres };
  } catch {
    // 経路が引けない駅(工事中の出入口など)は候補から落とす。
    return null;
  }
}

/**
 * 最寄駅を決める。
 *
 * 直線距離の上位数駅について実際に歩かせ、**徒歩時間が最短**のものを
 * 採る。直線で一番近い駅が徒歩でも一番近いとは限らないため
 * (川・線路・城壁で隔てられていると順位が入れ替わる)。
 *
 * 同着のときは経路が短いほうを採る。TfL の分数は1分単位に丸められて
 * いるので同着が頻繁に起きるが、そこで「先に調べたほう」を採ると
 * 実質ランダムに決まってしまう。実例: エミレーツ・スタジアムでは
 * Holloway Road(539m) と Arsenal(587m) がどちらも7分で並ぶ。
 * この2つは距離で割ると前者が残るが、どちらを出しても嘘ではない。
 * 決め方が説明できることのほうが、どちらを選ぶかより重要。
 *
 * 半径内に駅が無ければ null。呼び出し側は既存の値を残すこと。
 */
export async function findNearestStation(
  lat: number,
  lng: number
): Promise<NearestStation | null> {
  const candidates = (await findNearbyStations(lat, lng)).slice(0, CANDIDATE_LIMIT);
  if (candidates.length === 0) return null;

  let best: NearestStation | null = null;

  for (const stop of candidates) {
    const walk = await walkTo(lat, lng, stop.naptanId);
    if (!walk) continue;

    const better =
      !best ||
      walk.minutes < best.walkMinutes ||
      // 分数が同じなら経路の短いほうを採る(1分単位の丸めによる同着対策)。
      (walk.minutes === best.walkMinutes && walk.metres < best.walkMetres);

    if (better) {
      const name = shortenStationName(stop.commonName);
      best = {
        name,
        officialName: stop.commonName,
        naptanId: stop.naptanId,
        walkMinutes: walk.minutes,
        walkMetres: walk.metres,
        label: `${name}駅 徒歩${walk.minutes}分`,
      };
    }
  }

  return best;
}

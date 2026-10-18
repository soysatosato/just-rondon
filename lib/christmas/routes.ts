import { distanceKm } from "@/lib/sightseeing/geo";

/**
 * 灯りを見て歩く順路(/sightseeing/christmas-lights)。
 *
 * 立ち寄り先の座標は OpenStreetMap(Nominatim)と、サイトの観光スポットの
 * 座標から取った(2026-10-18)。距離は区間ごとの直線距離を足したもので、
 * 実際に歩く道のりは角を曲がるぶん少し長くなる。画面にもそう書く。
 * 距離の計算は観光スポットの「近く」と同じ distanceKm(lib/sightseeing/geo)。
 *
 * 編集部が歩いて測った所要時間ではない。歩く速さを時速4kmとして距離から
 * 出した目安で、見物や買い物の時間は含まない。
 */

export type RouteStop = {
  name: string;
  lat: number;
  lng: number;
  /** その地点で見るもの。1〜2文。 */
  note: string;
  /** サイトの観光スポット。旅行プランへ渡すときに使う。 */
  spot?: string;
  /** 特集の灯り・マーケットの slug。点灯日を添えるのに使う。 */
  item?: string;
};

export type LightsRoute = {
  slug: string;
  title: string;
  /** 2〜3文。どんな人向けか。 */
  lead: string;
  /** いつ歩くとよいか。1文。 */
  when: string;
  stops: RouteStop[];
};

export const LIGHTS_ROUTES: LightsRoute[] = [
  {
    slug: "west-end",
    title: "ウエスト・エンドの灯りを歩く",
    lead: "セルフリッジズから車の入らないオックスフォード・ストリートを東へ歩き、リージェント・ストリートとカーナビー・ストリートを抜けて、コヴェント・ガーデンで締める。ロンドンの代表的な灯りを1本の道でつなぐ順路。",
    when: "日の入りの少し前にセルフリッジズを出ると、空がまだ青いうちにオックスフォード・ストリートの灯りが見られる。",
    stops: [
      {
        name: "セルフリッジズ",
        lat: 51.5147,
        lng: -0.1527,
        note: "車両通行止めの区間の西の端。クリスマスのショーウィンドウで知られる百貨店の前から歩き始める。",
        spot: "selfridges-london",
        item: "oxford-street",
      },
      {
        name: "ニュー・ボンド・ストリートの入口",
        lat: 51.5146,
        lng: -0.1468,
        note: "南へ折れればボンド・ストリートの灯り。高級店の店先の飾りを見て戻る。",
        item: "bond-street",
      },
      {
        name: "オックスフォード・サーカス",
        lat: 51.5154,
        lng: -0.142,
        note: "オックスフォード・ストリートとリージェント・ストリートの交差点。ここから南へ曲がる。",
        item: "regent-street",
      },
      {
        name: "カーナビー・ストリート",
        lat: 51.5137,
        lng: -0.1392,
        note: "リージェント・ストリートを少し下り、グレート・マールバラ・ストリートから東へ入る。小路の端から端まで吊り飾りの下を歩く。",
        spot: "liberty-london",
        item: "carnaby-street",
      },
      {
        name: "ピカデリー・サーカス",
        lat: 51.5101,
        lng: -0.134,
        note: "ビーク・ストリートからリージェント・ストリートに戻り、天使の灯りの下を弧に沿って南へ。",
        spot: "piccadilly-circus",
        item: "regent-street",
      },
      {
        name: "レスター・スクエア",
        lat: 51.5103,
        lng: -0.1301,
        note: "広場にスケートリンクと屋台が出る。トラファルガー広場のツリーが点灯したあと(例年12月の第1木曜から)なら、南へ5分寄り道できる。",
        spot: "movie-statue-street-leicester-square",
        item: "leicester-square-christmas-market",
      },
      {
        name: "コヴェント・ガーデン",
        lat: 51.5117,
        lng: -0.1231,
        note: "マーケットホールの天井の飾りと、西側の広場の大きなツリーがゴール。",
        spot: "covent-garden",
        item: "covent-garden-christmas-market",
      },
    ],
  },
  {
    slug: "south-bank",
    title: "テムズ川の南岸を歩く",
    lead: "サウスバンク・センターの屋台から川沿いの遊歩道を東へ歩き、タワーブリッジを正面に見るウィンター・バイ・ザ・リバーまで。2つのマーケットと夜景をつなぐ、川沿いの遊歩道をほぼずっと歩ける順路。",
    when: "バラ・マーケットは夕方に閉まる店が多いので、寄るなら暗くなる前に通り過ぎるように出る。",
    stops: [
      {
        name: "サウスバンク・センター",
        lat: 51.5058,
        lng: -0.1168,
        note: "ロイヤル・フェスティバル・ホールの前の川沿いに、木の小屋の屋台が並ぶ。ロンドン・アイはすぐ西。",
        spot: "london-eye",
        item: "southbank-centre-winter-market",
      },
      {
        name: "オクソ・タワー",
        lat: 51.5075,
        lng: -0.1084,
        note: "ウォータールー橋をくぐって東へ。対岸のセント・ポール大聖堂のドームが見えてくる。",
      },
      {
        name: "テート・モダン",
        lat: 51.5076,
        lng: -0.1001,
        note: "旧発電所の美術館の前を通る。正面のミレニアム・ブリッジを渡ればセント・ポール大聖堂。",
        spot: "tate-modern",
      },
      {
        name: "バラ・マーケット",
        lat: 51.5055,
        lng: -0.0909,
        note: "川から少し南に入った食品市場。開いている時間なら、温かい軽食で休める。",
        spot: "borough-market",
      },
      {
        name: "ヘイズ・ギャレリア",
        lat: 51.5057,
        lng: -0.0837,
        note: "ウィンター・バイ・ザ・リバーの屋台とバーが並ぶ。東にタワーブリッジ、川の向こうにロンドン塔が見える。",
        item: "winter-by-the-river",
      },
      {
        name: "ポッターズ・フィールズ公園",
        lat: 51.5042,
        lng: -0.0784,
        note: "タワーブリッジのたもとの公園がゴール。ライトアップされた橋を真横から見られる。",
        spot: "london-tower-bridge",
      },
    ],
  },
];

/** 区間の直線距離の合計(km、小数1桁)。 */
export function routeDistanceKm(route: LightsRoute): number {
  let total = 0;
  for (let i = 1; i < route.stops.length; i++) {
    total += distanceKm(route.stops[i - 1], route.stops[i]);
  }
  return Math.round(total * 10) / 10;
}

/** 時速4kmで歩いたときの分数。5分単位に丸める。 */
export function routeWalkMinutes(route: LightsRoute): number {
  const minutes = (routeDistanceKm(route) / 4) * 60;
  return Math.max(5, Math.round(minutes / 5) * 5);
}

/**
 * Google マップの徒歩の道順。立ち寄り先を経由地にする。
 * スマホでは地図のアプリが開く。
 */
export function googleMapsWalkingUrl(route: LightsRoute): string {
  const point = (s: RouteStop) => `${s.lat},${s.lng}`;
  const [first, ...rest] = route.stops;
  const last = rest[rest.length - 1];
  const waypoints = rest.slice(0, -1).map(point).join("|");
  const params = new URLSearchParams({
    api: "1",
    origin: point(first),
    destination: point(last),
    travelmode: "walking",
    ...(waypoints ? { waypoints } : {}),
  });
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

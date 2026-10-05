/**
 * /plan の交通費の見積もりに使う「駅とゾーンの表」を TfL から作り直す。
 *
 *   npx tsx scripts/build-fare-zone-stations.ts
 *
 * 出力は lib/transport/stations.ts(生成物。手で直さない)。
 * 駅の追加・ゾーン変更があったときに走らせ直す。DBには触れない。
 *
 * ------------------------------------------------------------------
 * 何を取るか
 * ------------------------------------------------------------------
 * TfL Unified API の /Line/{id}/StopPoints から、地下鉄・DLR・
 * Overground・Elizabeth 線と、ロンドンに乗り入れる National Rail 各社の
 * 駅を集め、additionalProperties の Zone と緯度経度を抜く。
 *
 * ゾーンの付いていない駅(Windsor & Eton Central など)も捨てずに残す。
 * スポットに一番近い駅がゾーン外の駅なら「ゾーン外=上限の対象外」と
 * 判定できるのは、その駅が表に載っているからで、捨てると隣のゾーン6の
 * 駅が最寄りになってウィンザー城がゾーン6に化ける。
 *
 * トラムは入れない。停留所にゾーンが付いておらず、クロイドンのスポットが
 * 「ゾーン外」になってしまう。
 *
 * ------------------------------------------------------------------
 * 手で補っているもの
 * ------------------------------------------------------------------
 * 2026年10月の取得時点で、ロンドン市内なのにゾーンが欠けていた駅が3つあった。
 *   - Clapham Junction: Zone 2 なのに Zone が付いていない → 2 で補う
 *   - St Pancras International / Stratford International: 高速線(HS1)の
 *     ホームで上限の対象外。隣の地下鉄駅が正しいゾーンを持っているので、
 *     市内の「ゾーン無し」の駅は表から外す(CENTRAL_KM 以内)
 */

import { writeFileSync } from "node:fs";
import { join } from "node:path";

const LINES = [
  // 地下鉄
  "bakerloo",
  "central",
  "circle",
  "district",
  "hammersmith-city",
  "jubilee",
  "metropolitan",
  "northern",
  "piccadilly",
  "victoria",
  "waterloo-city",
  // DLR・Elizabeth・Overground
  "dlr",
  "elizabeth",
  "liberty",
  "lioness",
  "mildmay",
  "suffragette",
  "weaver",
  "windrush",
  // ロンドンに乗り入れる National Rail
  "c2c",
  "chiltern-railways",
  "great-northern",
  "greater-anglia",
  "great-western-railway",
  "southeastern",
  "southern",
  "south-western-railway",
  "thameslink",
];

/** Zone が欠けている駅の補い。commonName で引く。 */
const ZONE_OVERRIDES: Record<string, number> = {
  "Clapham Junction Rail Station": 2,
};

/**
 * 掲載スポットが収まる範囲(lib/sightseeing/geo.ts の注記)に少し余白を足したもの。
 * これより外の駅はどのスポットの最寄りにもならない。
 */
const BBOX = { minLat: 51.2, maxLat: 52.0, minLng: -1.3, maxLng: 0.4 };

/** チャリング・クロス。市内の「ゾーン無し」の駅を外す基準点。 */
const CENTRE = { lat: 51.5074, lng: -0.1278 };
const CENTRAL_KM = 20;

type StopPoint = {
  commonName: string;
  lat: number;
  lon: number;
  additionalProperties?: { key: string; value: string }[];
};

type Row = { name: string; lat: number; lng: number; zone: number | null };

/**
 * "2+3" や "2/3" は境界の駅。安いほう(小さいほう)を取る。
 * 中心部から来る旅行者には、境界駅は内側のゾーンとして運賃がかかる。
 */
function parseZone(value: string | undefined): number | null {
  if (!value || value === "NA") return null;
  const zones = value
    .split(/[+/]/)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n > 0);
  return zones.length > 0 ? Math.min(...zones) : null;
}

/** 表示用の駅名。"Underground Station" などの種別を落とす。 */
function shortName(commonName: string): string {
  return commonName
    .replace(/ (Underground|Rail|DLR|Elizabeth line|London Overground) Station$/, "")
    .replace(/ Station$/, "")
    .trim();
}

function km(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dLat = (a.lat - b.lat) * 111;
  const dLng = (a.lng - b.lng) * 69;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

/**
 * キー無しの TfL API は短時間に叩くと 429 を返す。待って数回やり直す。
 */
async function fetchLine(line: string): Promise<StopPoint[]> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://api.tfl.gov.uk/Line/${line}/StopPoints`);
    if (res.ok) return res.json() as Promise<StopPoint[]>;
    if (res.status !== 429 || attempt >= 5) {
      throw new Error(`${line}: HTTP ${res.status}`);
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 15_000));
  }
}

async function main() {
  const byName = new Map<string, Row>();

  for (const line of LINES) {
    const stops = await fetchLine(line);
    for (const stop of stops) {
      const lat = stop.lat;
      const lng = stop.lon;
      if (
        lat < BBOX.minLat ||
        lat > BBOX.maxLat ||
        lng < BBOX.minLng ||
        lng > BBOX.maxLng
      ) {
        continue;
      }

      const raw = stop.additionalProperties?.find((p) => p.key === "Zone")?.value;
      const zone = ZONE_OVERRIDES[stop.commonName] ?? parseZone(raw);
      if (zone === null && km({ lat, lng }, CENTRE) <= CENTRAL_KM) continue;

      // 地下鉄駅と鉄道駅が同じ名前で別々に載っている(Kew Gardens など)。
      // ゾーンが食い違うことは無いが、念のため内側のゾーンを残す。
      const name = shortName(stop.commonName);
      const prev = byName.get(name);
      if (prev && (prev.zone ?? Infinity) <= (zone ?? Infinity)) continue;
      byName.set(name, {
        name,
        lat: Math.round(lat * 10000) / 10000,
        lng: Math.round(lng * 10000) / 10000,
        zone,
      });
    }
  }

  const rows = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  // toISOString は UTC なので、日本の朝に走らせると前日になる。
  const today = new Date().toLocaleDateString("en-CA");

  const body = rows
    .map((r) => `  [${JSON.stringify(r.name)}, ${r.lat}, ${r.lng}, ${r.zone}],`)
    .join("\n");

  const file = `/**
 * 駅とゾーンの表。/plan の交通費の見積もりでスポットのゾーンを決めるのに使う。
 *
 * scripts/build-fare-zone-stations.ts が TfL Unified API から生成した。
 * 手で直さないこと(直すならスクリプト側の補いに足して走らせ直す)。
 *
 * zone が null の駅は運賃ゾーンの外(Windsor & Eton Central など)。
 * 境界の駅("2+3")は内側のゾーンにしてある。
 */

/** [駅名, 緯度, 経度, ゾーン] */
export type StationRow = readonly [string, number, number, number | null];

/** 取得日。 */
export const STATIONS_AS_OF = "${today}";

export const STATIONS: readonly StationRow[] = [
${body}
];
`;

  const out = join(process.cwd(), "lib/transport/stations.ts");
  writeFileSync(out, file);
  console.log(
    `${rows.length}駅を書き出しました(ゾーン外 ${rows.filter((r) => r.zone === null).length}駅) → ${out}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

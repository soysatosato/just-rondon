"use client";

import { Fragment, useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { hasRealLocation, type PlanSpot } from "@/lib/plan";
import { dayColor } from "./day-colors";

/**
 * 旅程ぜんぶを1枚に落とした地図。
 *
 * 以前は日ごとに1枚ずつ地図を置いていた。その日の順路が一筆書きかどうかは
 * それで分かるが、この道具でいちばん大きく削れる無駄——「2日目と4日目が
 * どちらもケンジントンで、まとめれば1日空く」——は、日をまたいで
 * 見比べないと見えない。日ごとの地図は、それを構造的に見せられない。
 *
 * 1枚にまとめると副作用として重さも減る。上限の10日ぶんを開くと
 * タイルの取得が10面ぶん走っていたのが1面になった。
 *
 * 日は色で分ける。番号は日ごとに1から振り直すので、10日ぶんを重ねると
 * 同じ「1」が10個並ぶ。色が唯一の手がかりになる場面なので、日程チップと
 * 日のカードの見出しにも同じ色を置き、3つが同じ日を指していると分かるようにした。
 *
 * 住所を持たないスポット(ロンドンパスのような商品)は座標が便宜的な一点
 * でしかないので、地図にも線にも載せない。載せると実在しない立ち寄り先が
 * 順路に描かれる。番号は載る側で振り直さず、その日の通し番号のまま出す
 * ——本文の一覧と番号が食い違うほうが混乱する。
 */

export type TripMapDay = { day: number; spots: PlanSpot[] };

type Pin = { spot: PlanSpot; index: number; day: number };

type MappedDay = {
  day: number;
  color: string;
  pins: Pin[];
  line: [number, number][];
};

/**
 * 番号入りのマーカー。画像ではなく DOM を置く divIcon にしているのは、
 * 番号と色の組み合わせぶんの画像を用意せずに済ませるため。
 * 選んだ日以外を薄くするのも、ここで opacity を混ぜて実現している。
 */
function numberedIcon(index: number, color: string, dimmed: boolean) {
  return L.divIcon({
    className: "",
    html:
      `<span style="display:flex;align-items:center;justify-content:center;` +
      `width:26px;height:26px;border-radius:9999px;background:${color};color:#fff;` +
      `font-size:12px;font-weight:700;border:2px solid #fff;` +
      `box-shadow:0 1px 4px rgba(0,0,0,.4);opacity:${dimmed ? 0.3 : 1}">${index}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

/**
 * ピンが全部入るように寄せる。
 *
 * MapContainer の center/zoom は初回しか効かないので、スポットを足したり
 * 日を選び直したりしたあとに追随させるには地図の実体を触る必要がある。
 * 日を選んだらその日だけに寄る——全体像は色で見えているので、選んだ
 * あとに欲しいのはその日の順路のほうになる。
 */
function FitBounds({
  days,
  focusDay,
}: {
  days: MappedDay[];
  focusDay: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    const target = focusDay
      ? days.filter((entry) => entry.day === focusDay)
      : days;
    const points = target.flatMap((entry) => entry.line);
    if (points.length === 0) return;

    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }

    const bounds = L.latLngBounds(points);
    // 座標がほぼ同じスポットだけの日は、bounds が一点に潰れて最大ズームまで
    // 寄ってしまう。そこだけ固定ズームに逃がす。
    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 16 });
  }, [map, days, focusDay]);

  return null;
}

export default function PlanTripMap({
  days,
  focusDay = null,
  className = "h-[300px] w-full",
}: {
  days: TripMapDay[];
  /** この日だけを濃く出して、そこに寄る。null なら全日程。 */
  focusDay?: number | null;
  className?: string;
}) {
  const mapped = useMemo<MappedDay[]>(
    () =>
      days.map((entry) => {
        const pins = entry.spots
          .map((spot, i) => ({ spot, index: i + 1, day: entry.day }))
          .filter((pin) => hasRealLocation(pin.spot));
        return {
          day: entry.day,
          color: dayColor(entry.day),
          pins,
          line: pins.map(
            (pin) => [pin.spot.lat, pin.spot.lng] as [number, number],
          ),
        };
      }),
    [days],
  );

  const center = mapped.find((entry) => entry.line.length > 0)?.line[0];
  if (!center) return null;

  return (
    <div className={className}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
        // 地図の上にヘッダーや吹き出しが重なるので、既定の z-index を下げる。
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mapped.map((entry) => {
          const dimmed = focusDay !== null && entry.day !== focusDay;
          return (
            // Fragment で包む。ここに要素を置くと地図の DOM に混ざり、
            // 透明な箱がタイルの上に載って操作を吸ってしまう。
            <Fragment key={entry.day}>
              {/*
                区間の線。破線にしているのは直線で結んでいるからで、実際に
                歩く道のりではない。実線にすると「この道を通る」と読める。
              */}
              {entry.line.length > 1 && (
                <Polyline
                  positions={entry.line}
                  pathOptions={{
                    color: entry.color,
                    weight: dimmed ? 2 : 3,
                    opacity: dimmed ? 0.2 : 0.75,
                    dashArray: "6 6",
                  }}
                />
              )}

              {entry.pins.map((pin) => (
                <Marker
                  key={pin.spot.slug}
                  position={[pin.spot.lat, pin.spot.lng]}
                  icon={numberedIcon(pin.index, entry.color, dimmed)}
                  // 選んでいる日を必ず手前に出す。中心部では別々の日のピンが
                  // 重なり、薄いほうが上に載ると濃いピンが隠れる。
                  zIndexOffset={dimmed ? 0 : 500}
                >
                  <Popup>
                    <span className="text-xs font-semibold">
                      {entry.day}日目 {pin.index}. {pin.spot.name}
                    </span>
                  </Popup>
                </Marker>
              ))}
            </Fragment>
          );
        })}

        <FitBounds days={mapped} focusDay={focusDay} />
      </MapContainer>
    </div>
  );
}

"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { hasRealLocation, type PlanSpot } from "@/lib/plan";

/**
 * その日の順路を地図に落とす。
 *
 * この道具は144件ぶんの座標を持ち、区間ごとの徒歩距離まで出しているのに、
 * それを一度も見せていなかった。「徒歩12分」を4つ並べられても、その日が
 * 行ったり来たりなのか一筆書きなのかは読み取れない。地図なら一目で分かる。
 *
 * 住所を持たないスポット(ロンドンパスのような商品)は座標が便宜的な一点
 * でしかないので、地図にも線にも載せない。載せると実在しない立ち寄り先が
 * 順路に描かれることになる。番号は地図に載る側で振り直さず、その日の
 * 通し番号のまま出す——本文の一覧と番号が食い違うほうが混乱する。
 */

type Pin = { spot: PlanSpot; index: number };

/**
 * 番号入りのマーカー。画像ではなく DOM を置く divIcon にしているのは、
 * 番号を焼き込んだ画像を40枚用意せずに済ませるため。色は本文の
 * 番号バッジと同じ indigo にして、地図と一覧の対応を色でも示す。
 */
function numberedIcon(index: number) {
  return L.divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:9999px;background:#4f46e5;color:#fff;font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)">${index}</span>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

/**
 * 全ピンが入るように寄せる。
 *
 * MapContainer の center/zoom は初回しか効かないので、スポットを足したり
 * 並べ替えたりしたあとに追随させるには地図の実体を触る必要がある。
 */
function FitBounds({ pins }: { pins: Pin[] }) {
  const map = useMap();

  useEffect(() => {
    if (pins.length === 0) return;
    const points = pins.map(
      (pin) => [pin.spot.lat, pin.spot.lng] as [number, number],
    );

    if (points.length === 1) {
      map.setView(points[0], 15);
      return;
    }

    const bounds = L.latLngBounds(points);
    // 座標がほぼ同じスポットだけの日は、bounds が一点に潰れて
    // 最大ズームまで寄ってしまう。そこだけ固定ズームに逃がす。
    if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
      map.setView(points[0], 15);
      return;
    }
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 16 });
  }, [map, pins]);

  return null;
}

export default function PlanDayMap({ spots }: { spots: PlanSpot[] }) {
  const pins = useMemo<Pin[]>(
    () =>
      spots
        .map((spot, i) => ({ spot, index: i + 1 }))
        .filter((pin) => hasRealLocation(pin.spot)),
    [spots],
  );

  if (pins.length === 0) return null;

  const line = pins.map((pin) => [pin.spot.lat, pin.spot.lng] as [number, number]);

  return (
    <div className="h-[260px] w-full sm:h-[320px]">
      <MapContainer
        center={line[0]}
        zoom={14}
        scrollWheelZoom={false}
        className="h-full w-full"
        // 地図の上にヘッダーや吹き出しが重なるので、既定の z-index を下げる。
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/*
          区間の線。破線にしているのは直線で結んでいるからで、実際に
          歩く道のりではない。実線にすると「この道を通る」と読める。
        */}
        {line.length > 1 && (
          <Polyline
            positions={line}
            pathOptions={{
              color: "#4f46e5",
              weight: 3,
              opacity: 0.7,
              dashArray: "6 6",
            }}
          />
        )}

        {pins.map((pin) => (
          <Marker
            key={pin.spot.slug}
            position={[pin.spot.lat, pin.spot.lng]}
            icon={numberedIcon(pin.index)}
          >
            <Popup>
              <span className="text-xs font-semibold">
                {pin.index}. {pin.spot.name}
              </span>
            </Popup>
          </Marker>
        ))}

        <FitBounds pins={pins} />
      </MapContainer>
    </div>
  );
}

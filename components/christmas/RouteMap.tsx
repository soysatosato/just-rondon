"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { RouteStop } from "@/lib/christmas/routes";

/**
 * 灯りを見て歩く順路の地図。旅行プランの地図(PlanTripMap)と同じ作り。
 *
 * 線は破線にする。立ち寄り先を直線で結んでいるだけで、歩く道そのものでは
 * ないため(実線にすると「この道を通る」と読める)。道順は Google マップの
 * リンクで渡す。
 */

const ROUTE_COLOR = "#b91c1c";

function numberedIcon(index: number) {
  return L.divIcon({
    className: "",
    html:
      `<span style="display:flex;align-items:center;justify-content:center;` +
      `width:28px;height:28px;border-radius:9999px;background:${ROUTE_COLOR};color:#fff;` +
      `font-size:13px;font-weight:700;border:2px solid #fde68a;` +
      `box-shadow:0 1px 4px rgba(0,0,0,.4)">${index}</span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    map.fitBounds(L.latLngBounds(points), { padding: [28, 28], maxZoom: 16 });
  }, [map, points]);
  return null;
}

export default function RouteMap({
  stops,
  className = "h-[320px] w-full",
}: {
  stops: RouteStop[];
  className?: string;
}) {
  const points = useMemo(
    () => stops.map((s) => [s.lat, s.lng] as [number, number]),
    [stops],
  );
  if (points.length === 0) return null;

  return (
    <div className={className}>
      <MapContainer
        center={points[0]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-full w-full"
        // 地図の上にヘッダーや吹き出しが重なるので、既定の z-index を下げる。
        style={{ zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Polyline
          positions={points}
          pathOptions={{ color: ROUTE_COLOR, weight: 3, opacity: 0.8, dashArray: "6 6" }}
        />
        {stops.map((stop, i) => (
          <Marker key={stop.name} position={[stop.lat, stop.lng]} icon={numberedIcon(i + 1)}>
            <Popup>
              <span className="text-xs font-semibold">
                {i + 1}. {stop.name}
              </span>
            </Popup>
          </Marker>
        ))}
        <FitBounds points={points} />
      </MapContainer>
    </div>
  );
}

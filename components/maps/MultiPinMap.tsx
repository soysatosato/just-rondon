"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { divIcon, latLngBounds } from "leaflet";

export type MapPin = {
  lat: number;
  lng: number;
  /** 地図の上の番号。下に並べる一覧の番号と揃える。 */
  n: number;
  label: string;
};

/**
 * 番号つきのピンを複数置く地図。店舗・旗艦店・宿のエリアの一覧に使う。
 *
 * ピンに名前を出さず番号だけにしているのは、スマホの幅で名前を並べると
 * 重なって読めなくなるため。名前は地図の下の一覧(同じ番号)で読む。
 * 読み上げでも一覧が本体になる。
 */
function FitBounds({ pins }: { pins: MapPin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length === 0) return;
    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 15);
      return;
    }
    map.fitBounds(latLngBounds(pins.map((p) => [p.lat, p.lng])), {
      padding: [28, 28],
    });
  }, [map, pins]);
  return null;
}

function pinIcon(n: number, color: string) {
  return divIcon({
    className: "",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:9999px;background:${color};color:#fff;font:600 12px/1 system-ui,sans-serif;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.35)">${n}</span>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

export default function MultiPinMap({
  pins,
  color = "#1e3a8a",
  heightClass = "h-[42vh] min-h-[260px]",
}: {
  pins: MapPin[];
  /** ピンの色。ページの区分の色に合わせる。 */
  color?: string;
  heightClass?: string;
}) {
  const center: [number, number] = pins[0]
    ? [pins[0].lat, pins[0].lng]
    : [51.5074, -0.1278];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      zoomControl={false}
      className={`${heightClass} w-full rounded-xl`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      <FitBounds pins={pins} />
      {pins.map((p) => (
        <Marker
          key={`${p.n}-${p.lat}-${p.lng}`}
          position={[p.lat, p.lng]}
          icon={pinIcon(p.n, color)}
          title={`${p.n}. ${p.label}`}
          alt={`${p.n}. ${p.label}`}
        />
      ))}
    </MapContainer>
  );
}

"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { icon } from "leaflet";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaMapMarkerAlt } from "react-icons/fa";
import Link from "next/link";

/** 地図が使う分だけ。作品データ全体を渡さずに済むようにしている。 */
export type MappableArtwork = {
  id: number;
  slug: string;
  name: string;
  engName: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
};

type Props = {
  artworks: MappableArtwork[];
};

const iconUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const markerIcon = icon({
  iconUrl: iconUrl,
  iconSize: [20, 30],
});

/**
 * 作品はロンドン全域に散っていて、館の一覧のように1点を中心に寄せると
 * 端の作品が画面外に出る。全マーカーが入る矩形に合わせる。
 */
function boundsOf(artworks: MappableArtwork[]): [[number, number], [number, number]] | null {
  if (artworks.length === 0) return null;

  const lats = artworks.map((a) => a.lat);
  const lngs = artworks.map((a) => a.lng);

  return [
    [Math.min(...lats), Math.min(...lngs)],
    [Math.max(...lats), Math.max(...lngs)],
  ];
}

export default function BanksyMapComponent({ artworks }: Props) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
    }
  }, []);

  const bounds = boundsOf(artworks);

  return (
    <MapContainer
      // bounds が無い(=作品0件)ときだけ中心指定に倒す。
      {...(bounds
        ? { bounds, boundsOptions: { padding: [32, 32] as [number, number] } }
        : { center: [51.5074, -0.1278] as [number, number], zoom: 11 })}
      scrollWheelZoom={true}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {artworks.map((artwork) => (
        <Marker
          key={artwork.id}
          position={[artwork.lat, artwork.lng]}
          icon={markerIcon}
        >
          <Popup>
            <Card className="max-w-[220px] border-0 shadow-none">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-base leading-snug">
                  {artwork.engName}
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {artwork.name}
                </span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="mb-3 flex items-start gap-2 text-xs text-muted-foreground">
                  <FaMapMarkerAlt className="mt-0.5 shrink-0" />
                  <span>{artwork.address}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  asChild
                >
                  <Link
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${artwork.address} London`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Googleマップで開く
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

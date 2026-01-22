"use client";

import { Museum } from "@prisma/client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { icon } from "leaflet";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaMapMarkerAlt, FaMoneyBillWave } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

type Props = {
  museums: Museum[];
};

const iconUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const markerIcon = icon({
  iconUrl: iconUrl,
  iconSize: [20, 30],
});

export default function MuseumsMapComponent({ museums }: Props) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
    }
  }, []);

  const center =
    museums.length > 0 ? [museums[0].lat, museums[0].lng] : [51.5074, -0.1278];

  return (
    <MapContainer
      center={center as [number, number]}
      zoom={12}
      scrollWheelZoom={true}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {museums.map((museum) => (
        <Marker
          key={museum.id}
          position={[museum.lat, museum.lng]}
          icon={markerIcon}
        >
          <Popup>
            <Card className="max-w-[200px] md:max-w-xs">
              {museum.image && (
                <div className="relative w-full h-24 rounded-t-lg overflow-hidden">
                  <img
                    src={museum.image}
                    alt={museum.name}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-base md:text-xl">
                  {museum.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-2 text-sm text-muted-foreground">
                  <FaMoneyBillWave className="text-green-600 dark:text-green-300" />
                  <span>
                    {museum.price === 0 ? "無料" : `£${museum.price}`}
                  </span>
                </div>
                <div className="flex items-center space-x-2 mb-4 text-xs text-muted-foreground line-clamp-1">
                  <FaMapMarkerAlt />
                  <span>{museum.address}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center 
             text-gray-900 border-gray-900 
             dark:text-gray-100 dark:border-gray-100"
                  asChild
                >
                  <Link href={`/museums/${museum.slug}`}>詳細情報</Link>
                </Button>
              </CardContent>
            </Card>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

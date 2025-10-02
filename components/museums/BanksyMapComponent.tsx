"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { icon } from "leaflet";
import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FaMapMarkerAlt } from "react-icons/fa";

type Props = {
  artworks: any[];
};

const iconUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const markerIcon = icon({
  iconUrl: iconUrl,
  iconSize: [20, 30],
});

export default function BanksyMapComponent({ artworks }: Props) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
    }
  }, []);

  const center =
    artworks.length > 0
      ? [artworks[0].lat, artworks[0].lng]
      : [51.5074, -0.1278];

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
      {artworks.map((artwork) => (
        <Marker
          key={artwork.id}
          position={[artwork.lat, artwork.lng]}
          icon={markerIcon}
        >
          <Popup>
            <Card className="max-w-xs">
              <CardHeader>
                <CardTitle className="text-xl">{artwork.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                  <FaMapMarkerAlt />
                  <span>{artwork.address}</span>
                </div>
              </CardContent>
            </Card>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

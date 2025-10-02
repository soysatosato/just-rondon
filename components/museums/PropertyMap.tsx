"use client";
import { MapContainer, TileLayer, Marker, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { icon } from "leaflet";

const iconUrl =
  "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png";
const markerIcon = icon({
  iconUrl: iconUrl,
  iconSize: [20, 30],
});

type props = {
  lat: number;
  lng: number;
};

export default function PropertyMap({ lat, lng }: props) {
  const defaultLocation = [51.505, -0.09];
  const location = [lat, lng] as [number, number];
  return (
    <div className="bg-background-light dark:bg-background px-4 py-3 rounded-md">
      <MapContainer
        center={location || defaultLocation}
        zoom={14}
        scrollWheelZoom={false}
        className="h-[50vh] rounded-md"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        <Marker position={location || defaultLocation} icon={markerIcon} />
      </MapContainer>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export type SelectedPlace = {
  placeId: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  borough?: string;
  postcode?: string;
};

type Props = {
  onSelect: (place: SelectedPlace) => void;
};

export default function PlaceAutocomplete({ onSelect }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [ready, setReady] = useState(false);

  // Google Maps が読み込まれるまで待つ
  useEffect(() => {
    if (window.google?.maps?.places) {
      setReady(true);
      return;
    }

    const id = setInterval(() => {
      if (window.google?.maps?.places) {
        setReady(true);
        clearInterval(id);
      }
    }, 200);

    return () => clearInterval(id);
  }, []);

  // Autocomplete 初期化
  useEffect(() => {
    if (!ready || !inputRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ["establishment"],
      componentRestrictions: { country: "gb" },
      fields: [
        "place_id",
        "name",
        "formatted_address",
        "geometry",
        "address_components",
      ],
    });

    autocomplete.addListener("place_changed", () => {
      const p = autocomplete.getPlace();
      if (!p.place_id || !p.geometry?.location) return;

      const comps = p.address_components ?? [];
      const get = (t: string) =>
        comps.find((c) => c.types.includes(t))?.long_name;

      onSelect({
        placeId: p.place_id,
        name: p.name ?? "",
        address: p.formatted_address ?? "",
        lat: p.geometry.location.lat(),
        lng: p.geometry.location.lng(),
        borough: get("administrative_area_level_2"),
        postcode: get("postal_code"),
      });
    });
  }, [ready, onSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="店舗名を検索"
      className="w-full rounded-md border px-3 py-2 bg-background"
    />
  );
}

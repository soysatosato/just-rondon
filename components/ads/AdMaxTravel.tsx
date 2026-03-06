"use client";

import { useEffect, useRef } from "react";

export default function AdMaxTravel() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const script = document.createElement("script");
    script.src = "https://adm.shinobi.jp/s/8301071f4327eeee620da1fbc6464e7d";
    script.async = true;

    ref.current.appendChild(script);
  }, []);

  return <div ref={ref} className="min-h-[50px]" />;
}

import AdMaxOverlay from "@/components/ads/AdMaxOverlay";
import AdMaxSwitch from "@/components/ads/AdMaxSwitch";
import type { ReactNode } from "react";

export default function WithAdsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <AdMaxOverlay />
      {children}
      <div className="mt-2">
        <AdMaxSwitch id="32ceb65479d99deacb56072aecc7aa0b" />
      </div>
    </div>
  );
}

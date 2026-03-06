import AdMaxBanner from "@/components/ads/AdMaxBanner";
import type { ReactNode } from "react";

export default function WithAdsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div>
        <AdMaxBanner id="79695e0a0c519cbdc2aa4d409afe80c4" />
      </div>
      {children}
      <div className="mt-2">
        <AdMaxBanner id="8301071f4327eeee620da1fbc6464e7d" />
      </div>
    </div>
  );
}

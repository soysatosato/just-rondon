import AdSenseLoader from "@/components/ads/AdSenseLoader";
import type { ReactNode } from "react";

/**
 * 美術館のページは (with-ads) の外にあるので、AdSense の読み込みはここで行う。
 * 枠は各ページ側で AdSenseUnit を置く。
 */
export default function MuseumsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AdSenseLoader />
    </>
  );
}

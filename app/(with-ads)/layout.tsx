import AdMaxSwitch from "@/components/ads/AdMaxSwitch";
import type { ReactNode } from "react";

/**
 * このレイアウトに AdSense ユニットは置かない。
 * 配下に survey(フォーム)・thanks・dashboard(ログイン後ツール)が含まれ、
 * コンテンツの無いページへの掲載は AdSense ポリシー違反になる。
 * サーバーコンポーネントなので pathname を見て除外もできない。
 * 広告は各ページ側で明示的に配置する。
 */
export default function WithAdsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
      <div className="mt-2">
        <AdMaxSwitch id="32ceb65479d99deacb56072aecc7aa0b" />
      </div>
    </div>
  );
}

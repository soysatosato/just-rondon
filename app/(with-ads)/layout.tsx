import AdMaxSwitch from "@/components/ads/AdMaxSwitch";
import type { ReactNode } from "react";

/**
 * このレイアウトに AdSense ユニットは置かない。広告は各ページ側で明示的に配置する。
 *
 * 配下に survey(フォーム)・thanks(送信完了)・dashboard(ログイン後ツール)が
 * 含まれ、コンテンツの無いページへの掲載は AdSense ポリシー違反になる。
 * このレイアウトはサーバーコンポーネントで pathname を読めないため、
 * 除外はクライアント側の広告コンポーネントが lib/ad-placement.ts の
 * allowsAds() で行う。ここに枠を置いても、対象パスでは枠ごと描画されない。
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

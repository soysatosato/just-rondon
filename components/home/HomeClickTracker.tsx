"use client";

import { useEffect } from "react";

/**
 * トップのどのブロックから先へ進んだかを GA4 に送る。
 *
 * トップは検索からの着地がほとんど無く(月1クリック程度)、読者は詳細ページから
 * ロゴを押して来る。並べ替えの良し悪しは「どのブロックが押されたか」でしか
 * 測れないので、ブロックの入れ物に data-home-module="weekly" のような名前を
 * 付け、その中のリンクとボタンが押されたら select_content を1件送る。
 *
 * 1か所で click を拾う(各リンクに onClick を付けない)。ブロックはサーバー
 * コンポーネントのままにしておけるうえ、ブロックを足しても属性を付けるだけで済む。
 *
 * gtag は本番で GA を読み込んだときだけある(app/layout.tsx)。無ければ何もしない。
 * 同意の扱いは GA 側の同意モード(ConsentDefaults)に任せる。
 */
type Gtag = (command: "event", name: string, params: Record<string, string>) => void;

export default function HomeClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const control = target.closest("a[href], button");
      const block = control?.closest("[data-home-module]");
      if (!control || !block) return;

      const gtag = (window as unknown as { gtag?: Gtag }).gtag;
      if (typeof gtag !== "function") return;

      gtag("event", "select_content", {
        content_type: "home_module",
        content_id: block.getAttribute("data-home-module") ?? "",
        link_url:
          control.getAttribute("href") ??
          (control.getAttribute("aria-label") || control.textContent?.trim() || "button"),
      });
    };

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}

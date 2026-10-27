declare global {
  interface Window {
    admaxads?: Array<{
      admax_id: string;
      type: "banner" | "overlay" | "switch";
    }>;
    __admaxScriptPromise__?: Promise<void>;
  }
}

/**
 * 忍者AdMax の配信を止めるためのフラグ。
 *
 * AdSense の審査中は false にしておく。AdSense 枠が1つも表示されていない状態で
 * 他社広告だけが配信されていると、審査時の心証を損ねるため。
 * 審査通過後に true へ戻せば配信を再開できる。そのときは public/ads.txt にも
 * 忍者AdMax の行を戻すこと(配信を止めている間に削除した。2026-10-27)。
 * 削除前の684行は `git show 45ad914:public/ads.txt` で見られるが、提携先は
 * 入れ替わるので、戻すときは忍者AdMax が案内している最新の内容を使う。
 *
 * false の間は AdMaxSwitch が何も描画せず、外部スクリプトも読み込まない。
 */
export const ADMAX_ENABLED = false;

const SCRIPT_SRC = "https://adm.shinobi.jp/st/t.js";

export type AdMaxType = "banner" | "overlay" | "switch";

export function ensureAdMaxQueue() {
  if (typeof window === "undefined") return;
  window.admaxads = window.admaxads || [];
}

export function registerAdMax(admax_id: string, type: AdMaxType) {
  if (typeof window === "undefined") return;

  ensureAdMaxQueue();

  const exists = window.admaxads!.some(
    (ad) => ad.admax_id === admax_id && ad.type === type,
  );

  if (!exists) {
    window.admaxads!.push({ admax_id, type });
  }
}

export function unregisterAdMax(admax_id: string, type: AdMaxType) {
  if (typeof window === "undefined" || !window.admaxads) return;

  window.admaxads = window.admaxads.filter(
    (ad) => !(ad.admax_id === admax_id && ad.type === type),
  );
}

export function loadAdMaxScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!ADMAX_ENABLED) return Promise.resolve();

  if (window.__admaxScriptPromise__) {
    return window.__admaxScriptPromise__;
  }

  const existing = document.querySelector(
    `script[src="${SCRIPT_SRC}"]`,
  ) as HTMLScriptElement | null;

  if (existing) {
    window.__admaxScriptPromise__ = Promise.resolve();
    return window.__admaxScriptPromise__;
  }

  window.__admaxScriptPromise__ = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.charset = "utf-8";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load AdMax script"));
    document.body.appendChild(script);
  });

  return window.__admaxScriptPromise__;
}

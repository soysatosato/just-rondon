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
 * 審査通過後に true へ戻せば、コードを触らずに配信を再開できる。
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

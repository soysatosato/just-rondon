declare global {
  interface Window {
    admaxads?: Array<{
      admax_id: string;
      type: "banner" | "overlay" | "switch";
    }>;
    __admaxScriptPromise__?: Promise<void>;
  }
}

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

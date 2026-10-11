"use client";

import { useEffect, useState } from "react";

type TcData = { gdprApplies?: boolean; listenerId?: number };

type ConsentWindow = Window & {
  googlefc?: {
    callbackQueue?: unknown[];
    showRevocationMessage?: () => void;
  };
  __tcfapi?: (
    command: string,
    version: number,
    callback: (data: TcData, success: boolean) => void,
    parameter?: unknown
  ) => void;
};

/**
 * 「プライバシーと Cookie の設定」のリンク。英国・EEA・スイスの読者が、
 * Google の CMP で一度した同意をいつでも選び直せるようにする
 * (Google の EU ユーザーの同意ポリシーと GDPR の要件)。
 *
 * CMP が「この読者には GDPR がかかる」と答えたときだけ出す。日本からの
 * 読者には押しても何も起きないリンクになるため。CMP は adsbygoogle.js と
 * 一緒にしか読まれないので、広告の無いページを直接開いたときは出ない。
 * 広告のあるページへ移ると CMP が読まれ、そこから先は出たままになる。
 *
 * googlefc.callbackQueue は CMP の読み込み前から積んでおける。読み込まれた
 * 時点で順に実行される。
 */
export default function ConsentSettingsLink() {
  const [applies, setApplies] = useState(false);

  useEffect(() => {
    const w = window as ConsentWindow;
    let listenerId: number | undefined;
    let cancelled = false;

    w.googlefc = w.googlefc || {};
    w.googlefc.callbackQueue = w.googlefc.callbackQueue || [];
    w.googlefc.callbackQueue.push({
      CONSENT_API_READY: () => {
        if (cancelled) return;
        w.__tcfapi?.("addEventListener", 2.2, (data, success) => {
          if (!success || !data) return;
          listenerId = data.listenerId;
          setApplies(Boolean(data.gdprApplies));
        });
      },
    });

    return () => {
      cancelled = true;
      if (listenerId !== undefined) {
        w.__tcfapi?.("removeEventListener", 2.2, () => {}, listenerId);
      }
    };
  }, []);

  if (!applies) return null;

  return (
    <button
      type="button"
      onClick={() =>
        (window as ConsentWindow).googlefc?.showRevocationMessage?.()
      }
    >
      プライバシーと Cookie の設定
    </button>
  );
}

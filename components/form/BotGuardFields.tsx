"use client";

import { useEffect, useState } from "react";

/**
 * ボット除けの隠し項目。サーバー側の判定は utils/form-guard.ts の looksLikeBot。
 */
export default function BotGuardFields() {
  // 描画時ではなくマウント後に入れる(ページはキャッシュされた
  // HTMLなので、描画時刻はビルド時刻になってしまう)。
  const [startedAt, setStartedAt] = useState("");
  useEffect(() => setStartedAt(String(Date.now())), []);

  return (
    <>
      <input type="hidden" name="startedAt" value={startedAt} />
      {/* 人には見えず、埋まっていたら送信を破棄する。 */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
    </>
  );
}

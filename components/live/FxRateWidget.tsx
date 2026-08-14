"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { QUICK_AMOUNTS, toJpy, type FxRate } from "@/lib/fx/rate";

/**
 * GBP→JPY の参考レートと早見表。
 *
 * 意図的にやっていること:
 * 1. 「£1 = ◯円」を大きく出したうえで、£5〜£100 の早見表を添える。
 *    ロンドンで値札を見た瞬間に暗算したいのは £1 ではなく、
 *    実際に払う額(パブ1杯 £6、ミュージカル £50 など)だから。
 * 2. レート自身の日付を必ず出す。出典の ECB は平日1日1回しか
 *    公表しないので、週末は前営業日の値になる。「今の実勢」と
 *    誤解させないための表示。
 * 3. 両替所や決済カードの実効レートはここから数%離れる、と明記する。
 *    この数字で予算を組んだ読者が現地でズレて困らないように。
 */
export default function FxRateWidget() {
  const [data, setData] = useState<FxRate | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch("/api/fx-rate")
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json: FxRate) => {
        if (alive) setData(json);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });

    return () => {
      alive = false;
    };
  }, []);

  if (failed) return null;

  if (!data) {
    return (
      <Card className="border-gray-200 dark:border-gray-800">
        <CardContent className="p-5">
          <div className="h-5 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-4 h-16 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardContent className="p-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
          ポンド円の参考レート
        </h2>

        <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-gray-100">
          £1 ={" "}
          <span className="tabular-nums">
            {data.jpyPerGbp.toFixed(2)}
          </span>
          <span className="ml-1 text-base font-semibold">円</span>
        </p>

        <ul className="mt-4 grid grid-cols-3 gap-2">
          {QUICK_AMOUNTS.map((amount) => (
            <li
              key={amount}
              className="rounded-lg border border-gray-100 px-2 py-2 text-center dark:border-gray-800"
            >
              <span className="block text-xs text-gray-500 dark:text-gray-400">
                £{amount}
              </span>
              <span className="block text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                {toJpy(amount, data.jpyPerGbp).toLocaleString("ja-JP")}円
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {data.rateDate} 時点の ECB(欧州中央銀行)公表レート。出典:{" "}
          <a
            href="https://frankfurter.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Frankfurter
          </a>
          。<strong className="font-semibold">両替所やカード決済の実効レートは、手数料の上乗せぶんここから数%離れます。</strong>
          予算の当たりをつけるための基準値として使ってください。
        </p>
      </CardContent>
    </Card>
  );
}

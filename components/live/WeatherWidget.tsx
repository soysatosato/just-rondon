"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { ForecastResult } from "@/lib/weather/forecast";

/**
 * ロンドンの週間予報。
 *
 * 気温より降水確率を目立たせている。イギリスの旅程を狂わせるのは
 * 寒さではなく雨で、読者が知りたいのは「どの日に屋内の予定を寄せるか」
 * だから。30%以上の日は色を変えて、傘を持つ判断ができるようにする。
 */

/** これ以上なら傘を意識すべき、と判断する降水確率のしきい値(%)。 */
const RAIN_ALERT = 30;

export default function WeatherWidget() {
  const [data, setData] = useState<ForecastResult | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;

    fetch("/api/weather")
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json();
      })
      .then((json: ForecastResult) => {
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
          <div className="h-5 w-44 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="mt-4 h-20 w-full animate-pulse rounded bg-gray-100 dark:bg-gray-900" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardContent className="p-5">
        <h2 className="text-base font-bold text-gray-900 dark:text-gray-100">
          ロンドンの週間天気
        </h2>

        {/* 7日分が狭い画面に収まらないので横スクロールさせる。
            ページ本体を横に伸ばさないため、スクロールはこの中で完結させる。 */}
        <div className="-mx-1 mt-3 overflow-x-auto">
          <ul className="flex min-w-max gap-2 px-1">
            {data.days.map((day) => (
              <li
                key={day.date}
                className={`flex w-[4.75rem] shrink-0 flex-col items-center gap-1 rounded-lg border p-2.5 ${
                  day.isToday
                    ? "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/40"
                    : "border-gray-100 dark:border-gray-800"
                }`}
              >
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  {day.isToday ? "今日" : day.label}
                </span>
                <span aria-hidden="true" className="text-2xl leading-none">
                  {day.icon}
                </span>
                <span className="text-center text-[0.7rem] leading-tight text-gray-600 dark:text-gray-400">
                  {day.weather}
                </span>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {day.tempMax}°
                  <span className="ml-0.5 text-xs font-normal text-gray-500 dark:text-gray-400">
                    {day.tempMin}°
                  </span>
                </span>
                {day.precipitation !== null && (
                  <span
                    className={`text-[0.7rem] font-medium ${
                      day.precipitation >= RAIN_ALERT
                        ? "text-blue-700 dark:text-blue-300"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    ☂ {day.precipitation}%
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          出典:{" "}
          <a
            href="https://open-meteo.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2"
          >
            Open-Meteo
          </a>
          。上段が最高気温、下段が最低気温、☂ が降水確率です。
        </p>
      </CardContent>
    </Card>
  );
}

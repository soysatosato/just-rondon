"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { SeverityLevel, TflStatusResult } from "@/lib/tfl/status";
import type { ForecastResult } from "@/lib/weather/forecast";
import type { FxRate } from "@/lib/fx/rate";

/**
 * トップページのヒーロー直下に置く「今日のロンドン」1行帯。
 *
 * 他ページにある詳細ウィジェット(TflStatusWidget / FxRateWidget)とは
 * 役割が違う。あちらは腰を据えて読む人向けで、こちらは訪問直後の読者に
 * 「今日は雨か」「止まっている線はあるか」「ポンドはいくらか」を一目で
 * 渡し、詳しく知りたければ各ページへ送る。したがって数字は各1個までに
 * 絞り、詳細は出さない。天気だけは単体の詳細ページがないため、この帯が
 * 唯一の表示場所になる(リンクなし)。
 *
 * 設計上の判断:
 *
 * 1. 3本まとめて並列に取る。個別ウィジェットのように別々に描き始めると、
 *    到着順に行が伸び縮みしてヒーロー直下がガタつく。全部揃うまでは
 *    同じ高さのプレースホルダを出し、一度だけ差し替える。
 * 2. 高さはデータの有無に関わらず固定(h-11)。取得に失敗した項目は
 *    その区画だけ消え、帯自体は残る。3本とも落ちたときだけ帯ごと消す。
 * 3. 運行状況は「乱れている路線数」だけを出す。トップに11路線の一覧は
 *    要らないし、平常時こそ何も言わずに緑の点だけで済ませたい。
 */

/** 帯の高さ。取得前後で変えるとヒーローの下が動くので固定する。 */
const STRIP_HEIGHT = "h-11";

type StripData = {
  tfl: TflStatusResult | null;
  weather: ForecastResult | null;
  fx: FxRate | null;
};

const DOT_COLOR: Record<SeverityLevel, string> = {
  good: "bg-emerald-500",
  minor: "bg-amber-500",
  severe: "bg-red-500",
  closed: "bg-gray-400",
};

/** 失敗を null に倒す。1本落ちても残り2本は出したいので個別に握りつぶす。 */
async function loadJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/** 区画の仕切り。項目が消えたときに線だけ残らないよう、要素として挟む。 */
function Divider() {
  return (
    <span
      aria-hidden="true"
      className="h-4 w-px shrink-0 bg-border"
    />
  );
}

export default function LiveStrip() {
  const [data, setData] = useState<StripData | null>(null);

  useEffect(() => {
    let alive = true;

    Promise.all([
      loadJson<TflStatusResult>("/api/tfl-status"),
      loadJson<ForecastResult>("/api/weather"),
      loadJson<FxRate>("/api/fx-rate"),
    ]).then(([tfl, weather, fx]) => {
      if (alive) setData({ tfl, weather, fx });
    });

    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return (
      <div
        className={`mx-auto mt-8 flex max-w-2xl items-center justify-center rounded-full border bg-card/60 px-4 ${STRIP_HEIGHT}`}
      >
        <div className="h-3 w-52 animate-pulse rounded-full bg-muted" />
      </div>
    );
  }

  const { tfl, weather, fx } = data;

  // 3本とも取れなかったときは、空の帯を残さず消す。
  if (!tfl && !weather && !fx) return null;

  const today = weather?.days.find((d) => d.isToday) ?? weather?.days[0] ?? null;
  // 運行時間外(closed)は乱れに数えない。深夜に「15路線に乱れ」と出ると、
  // 終電後なだけなのに事故が起きているように読める。
  const disrupted =
    tfl?.lines.filter((l) => l.level !== "good" && l.level !== "closed") ?? [];
  const closedCount =
    tfl?.lines.filter((l) => l.level === "closed").length ?? 0;
  const normalCount = tfl?.lines.filter((l) => l.level === "good").length ?? 0;
  const offHours = closedCount > normalCount;

  // 帯に出す点の色は、最も深刻な路線に合わせる。severe が1本でもあれば赤。
  const worstLevel: SeverityLevel = disrupted.some((l) => l.level === "severe")
    ? "severe"
    : disrupted.length > 0
      ? "minor"
      : offHours
        ? "closed"
        : "good";

  const items: { key: string; href: string | null; node: React.ReactNode }[] =
    [];

  if (today) {
    items.push({
      key: "weather",
      // 天気単体の詳細ページがないため、他項目と違いリンクさせない。
      href: null,
      node: (
        <>
          <span aria-hidden="true" className="text-base leading-none">
            {today.icon}
          </span>
          <span className="font-semibold tabular-nums">{today.tempMax}°</span>
          {today.precipitation !== null && (
            <span className="text-muted-foreground tabular-nums">
              ☂{today.precipitation}%
            </span>
          )}
        </>
      ),
    });
  }

  if (tfl) {
    items.push({
      key: "tfl",
      href: "/sightseeing/transport",
      node: (
        <>
          <span
            aria-hidden="true"
            className={`size-2 shrink-0 rounded-full ${DOT_COLOR[worstLevel]}`}
          />
          <span className="font-semibold">
            {disrupted.length > 0
              ? `${disrupted.length}路線に乱れ`
              : offHours
                ? "運行時間外"
                : "全線平常"}
          </span>
        </>
      ),
    });
  }

  if (fx) {
    items.push({
      key: "fx",
      href: "/money",
      node: (
        <>
          <span className="text-muted-foreground">£1</span>
          <span className="font-semibold tabular-nums">
            {Math.round(fx.jpyPerGbp)}円
          </span>
        </>
      ),
    });
  }

  return (
    <div
      className={`mx-auto mt-8 flex max-w-2xl items-center justify-center gap-1 overflow-x-auto rounded-full border bg-card/60 px-2 text-xs shadow-sm backdrop-blur-sm sm:gap-2 sm:px-4 sm:text-sm ${STRIP_HEIGHT}`}
    >
      {items.map((item, i) => (
        <div key={item.key} className="flex shrink-0 items-center gap-1 sm:gap-2">
          {i > 0 && <Divider />}
          {item.href ? (
            <Link
              href={item.href}
              className="flex items-center gap-1.5 rounded-full px-1.5 py-1 transition hover:bg-muted sm:px-2"
            >
              {item.node}
            </Link>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full px-1.5 py-1 sm:px-2">
              {item.node}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

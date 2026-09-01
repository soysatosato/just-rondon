"use client";

import { useMemo } from "react";
import { Clock } from "lucide-react";

import {
  formatMinutes,
  isValidStayMinutes,
  MAX_STAY_MINUTES,
  MIN_STAY_MINUTES,
  type PlanRow,
} from "@/lib/plan";
import { setSpotMinutes } from "./plan-store";

/**
 * 滞在時間の変更。
 *
 * 掲載値は「初めて行く人が普通に見て回ったら」の目安なので、実際とは
 * ずれる。大英博物館を1時間で切り上げる人も、半日いる人もいる。既定を
 * 動かせないと、合計も「1日に収まるか」の判定も他人の前提のままになる。
 *
 * 数値入力ではなく選択にしているのは、この道具が出すのが概算だから。
 * 分単位で刻める入力欄を置くと、直線距離から出した移動時間の隣に
 * 「1時間47分」が並び、全体が実測のように見えてしまう。
 *
 * 掲載値そのものは書き換えない。原文は「1〜1時間半」のように幅と注記を
 * 持っていて、合計に足す1つの数では置き換えられない。両方を持って、
 * 「掲載どおり」に戻す先を残してある。
 */

/** 選べる滞在時間。旅程を組む粒度に合わせて、短いほうを細かく刻む。 */
const STAY_PRESETS = [15, 30, 45, 60, 90, 120, 150, 180, 240, 300, 360, 480];

export default function PlanStayEditor({ row }: { row: PlanRow }) {
  const { spot, stayMinutes, defaultMinutes, overridden } = row;

  const options = useMemo(() => {
    const values = new Set(
      STAY_PRESETS.filter(
        (m) => m >= MIN_STAY_MINUTES && m <= MAX_STAY_MINUTES,
      ),
    );
    // 共有リンクから来た値が候補に無いことがある。選択中の値が
    // 一覧に無いと、選択が外れて別の数字に見える。
    if (overridden && isValidStayMinutes(stayMinutes)) values.add(stayMinutes);
    return [...values].sort((a, b) => a - b);
  }, [overridden, stayMinutes]);

  /*
   * 「掲載どおり」の見え方は、掲載値があるかで変わる。
   * 掲載値の無い42件では戻る先が無いので、戻すと合計から外れることを
   * その場に書く。黙って消えると、合計が減った理由が分からない。
   */
  const resetLabel =
    defaultMinutes === null
      ? "未定（合計に入れない）"
      : `掲載どおり（${formatMinutes(defaultMinutes)}）`;

  const id = `stay-${spot.slug}`;

  return (
    <div className="flex items-center gap-1">
      <Clock className="h-3 w-3 shrink-0" aria-hidden />
      <label className="sr-only" htmlFor={id}>
        {spot.name}の滞在時間
      </label>

      <select
        id={id}
        value={overridden && stayMinutes !== null ? String(stayMinutes) : ""}
        onChange={(e) =>
          setSpotMinutes(spot.slug, e.target.value ? Number(e.target.value) : null)
        }
        className={`rounded border bg-background px-1.5 py-0.5 text-[11px] print:hidden ${
          overridden
            ? "border-indigo-400 font-semibold text-indigo-700 dark:text-indigo-300"
            : "border-border text-muted-foreground"
        }`}
      >
        <option value="">{resetLabel}</option>
        {options.map((minutes) => (
          <option key={minutes} value={minutes}>
            {formatMinutes(minutes)}
          </option>
        ))}
      </select>

      {/* 紙には操作できないものを出さない。値だけ文字で残す。 */}
      <span className="hidden print:inline">
        {stayMinutes === null ? "滞在時間 未定" : formatMinutes(stayMinutes)}
      </span>

      {/*
        掲載値と違う値を使っていることを、開かなくても分かるようにする。
        原文は選択肢の「掲載どおり（…）」に出ているので、ここでは繰り返さない。
      */}
      {overridden && (
        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 print:hidden">
          変更
        </span>
      )}
    </div>
  );
}

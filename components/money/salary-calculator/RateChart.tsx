"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { RatePoint } from "@/lib/money/take-home/curve";
import { formatGbp, formatPercent } from "@/lib/money/take-home/format";

const HEIGHT = 288;
const MARGIN = { top: 40, right: 16, bottom: 30, left: 44 };

/** 横軸の目盛りの刻み。幅に収まるいちばん細かいものを使う。 */
const X_STEPS = [25_000, 50_000, 100_000, 200_000, 250_000, 500_000, 1_000_000];

function compactGbp(value: number) {
  if (value >= 1_000_000) return `£${Number((value / 1_000_000).toFixed(1))}m`;
  if (value >= 1000) return `£${Math.round(value / 1000)}k`;
  return `£${Math.round(value)}`;
}

/**
 * 「額面が増えると、国に納める割合はどう変わるか」。
 *
 * 税率表は「年収£50,270までは20%」と帯で書くが、読者が本当に知りたいのは
 * 「昇給したら、増えた分のうちいくら残るか」。それを限界税率(次の£1に
 * かかる率)の段差として描き、額面全体の負担率を補助線として重ねる。
 * £100,000を超えたところで段差が跳ね上がる、非課税枠の逓減が一目で分かる。
 *
 * 2本とも単位は同じ「%」なので、縦軸は1本で済む。
 *
 * グラフの上をドラッグ(スマホは横にスワイプ、またはタップ)すると額面が
 * 動く。数字を打ち直さなくても「£60,000ならどうなるか」を試せる。
 * 縦方向のスクロールは奪わない(touch-action: pan-y)。
 */
export default function RateChart({
  points,
  xMax,
  gross,
  userMarginal,
  userEffective,
  taperZone,
  onScrub,
  onDragChange,
}: {
  points: RatePoint[];
  xMax: number;
  gross: number;
  userMarginal: number;
  userEffective: number;
  /** 非課税枠が削られる区間(額面)。税コードを手入力しているときは null。 */
  taperZone: { from: number; to: number } | null;
  onScrub: (gross: number) => void;
  /**
   * ドラッグの開始と終了。横軸の右端は額面に合わせて伸びるので、
   * ドラッグ中は親が軸を止めておかないと、右端で押さえ続けたときに
   * 「軸が伸びる → 額面が増える → 軸が伸びる」を繰り返して暴走する。
   */
  onDragChange?: (dragging: boolean) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(720);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const gesture = useRef<{
    id: number;
    type: string;
    startX: number;
    startY: number;
    active: boolean;
  } | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width;
      if (next) setWidth(Math.round(next));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onDragChange?.(dragging);
  }, [dragging, onDragChange]);

  const plotW = Math.max(160, width - MARGIN.left - MARGIN.right);
  const plotH = HEIGHT - MARGIN.top - MARGIN.bottom;

  const maxRate = points.reduce((m, p) => Math.max(m, p.marginal), 0);
  const yMax = Math.min(1, Math.max(0.5, Math.ceil((maxRate + 0.04) * 10) / 10));
  const yStep = yMax > 0.7 ? 0.2 : 0.1;

  const sx = (value: number) => MARGIN.left + (Math.min(value, xMax) / xMax) * plotW;
  const sy = (rate: number) =>
    MARGIN.top + (1 - Math.min(rate, yMax) / yMax) * plotH;

  const paths = useMemo(() => {
    if (points.length === 0) return { step: "", area: "", effective: "" };
    const scaleX = (v: number) => MARGIN.left + (v / xMax) * plotW;
    const scaleY = (r: number) => MARGIN.top + (1 - Math.min(r, yMax) / yMax) * plotH;

    let step = `M${scaleX(points[0].gross).toFixed(1)},${scaleY(points[0].marginal).toFixed(1)}`;
    for (let i = 1; i < points.length; i++) {
      step += `H${scaleX(points[i].gross).toFixed(1)}V${scaleY(points[i].marginal).toFixed(1)}`;
    }
    const area = `${step}V${scaleY(0).toFixed(1)}H${scaleX(0).toFixed(1)}Z`;

    // 額面0の点は負担率が定義できないので、1点目から引く。
    const effective = points
      .slice(1)
      .map(
        (p, i) =>
          `${i === 0 ? "M" : "L"}${scaleX(p.gross).toFixed(1)},${scaleY(p.effective).toFixed(1)}`,
      )
      .join("");
    return { step, area, effective };
  }, [points, xMax, plotW, plotH, yMax]);

  const yTicks: number[] = [];
  for (let v = 0; v <= yMax + 1e-9; v += yStep) yTicks.push(Number(v.toFixed(2)));

  const maxTicks = Math.max(2, Math.floor(plotW / 64));
  const xStep = X_STEPS.find((s) => xMax / s <= maxTicks) ?? X_STEPS[X_STEPS.length - 1];
  const xTicks: number[] = [];
  for (let v = 0; v <= xMax + 1; v += xStep) xTicks.push(v);

  const grossFromClientX = (clientX: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return 0;
    const ratio = (clientX - rect.left - MARGIN.left) / plotW;
    return Math.min(1, Math.max(0, ratio)) * xMax;
  };

  const indexFor = (value: number) =>
    Math.round((value / xMax) * (points.length - 1));

  const handlePointerDown = (e: PointerEvent<SVGRectElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    gesture.current = {
      id: e.pointerId,
      type: e.pointerType,
      startX: e.clientX,
      startY: e.clientY,
      // マウスは押した瞬間から動かす。指は縦スクロールと区別がつくまで待つ。
      active: e.pointerType !== "touch",
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    const value = grossFromClientX(e.clientX);
    setHoverIndex(indexFor(value));
    if (gesture.current.active) {
      setDragging(true);
      onScrub(value);
    }
  };

  const handlePointerMove = (e: PointerEvent<SVGRectElement>) => {
    const value = grossFromClientX(e.clientX);
    setHoverIndex(indexFor(value));
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    if (!g.active) {
      const dx = Math.abs(e.clientX - g.startX);
      const dy = Math.abs(e.clientY - g.startY);
      if (dx > 8 && dx > dy) {
        g.active = true;
        setDragging(true);
      }
    }
    if (g.active) onScrub(value);
  };

  const endGesture = (e: PointerEvent<SVGRectElement>, commitTap: boolean) => {
    const g = gesture.current;
    if (g && g.id === e.pointerId && commitTap && !g.active) {
      const moved =
        Math.abs(e.clientX - g.startX) > 8 || Math.abs(e.clientY - g.startY) > 8;
      if (!moved) onScrub(grossFromClientX(e.clientX));
    }
    gesture.current = null;
    setDragging(false);
    if (e.pointerType !== "mouse") setHoverIndex(null);
  };

  const hover = hoverIndex !== null ? points[hoverIndex] : null;
  const markerX = sx(gross);
  const transition =
    dragging || reduceMotion ? "none" : "transform 380ms cubic-bezier(0.16, 1, 0.3, 1)";
  const inTaperZone =
    hover && taperZone ? hover.gross > taperZone.from && hover.gross <= taperZone.to : false;

  const summary = `額面の年収と税率のグラフ。額面${formatGbp(gross)}では、次の£1にかかる率が${formatPercent(
    userMarginal,
  )}、額面全体に対する負担が${formatPercent(userEffective)}です。${
    taperZone
      ? `${formatGbp(taperZone.from)}から${formatGbp(taperZone.to)}までは、非課税枠が削られるため率が上がります。`
      : ""
  }`;

  return (
    <div>
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-5 rounded-full bg-[#4a3aa7] dark:bg-[#9085e9]" />
          <span>
            <span className="font-medium text-foreground">限界税率</span>
            （次の£1にかかる率）
          </span>
        </li>
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-0.5 w-5 rounded-full bg-muted-foreground/70" />
          <span>
            <span className="font-medium text-foreground">実効負担率</span>
            （額面全体に対する割合）
          </span>
        </li>
      </ul>

      <div ref={wrapRef} className="relative mt-3 select-none">
        <svg
          ref={svgRef}
          width={width}
          height={HEIGHT}
          viewBox={`0 0 ${width} ${HEIGHT}`}
          role="img"
          aria-label={summary}
          className="block max-w-full overflow-visible"
          style={{ touchAction: "pan-y" }}
        >
          {/* 格子と縦軸の目盛り */}
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={MARGIN.left}
                x2={MARGIN.left + plotW}
                y1={sy(tick)}
                y2={sy(tick)}
                className={tick === 0 ? "stroke-border" : "stroke-border/60"}
                strokeWidth={1}
                shapeRendering="crispEdges"
              />
              <text
                x={MARGIN.left - 8}
                y={sy(tick)}
                dy="0.32em"
                textAnchor="end"
                className="fill-muted-foreground text-[11px] tabular-nums"
              >
                {Math.round(tick * 100)}%
              </text>
            </g>
          ))}

          {xTicks.map((tick) => (
            <text
              key={tick}
              x={sx(tick)}
              y={HEIGHT - 8}
              textAnchor={tick === 0 ? "start" : tick >= xMax ? "end" : "middle"}
              className="fill-muted-foreground text-[11px] tabular-nums"
            >
              {compactGbp(tick)}
            </text>
          ))}

          {/* 非課税枠の逓減区間。系列ではないので、色を持たない面で置く。 */}
          {taperZone && taperZone.from < xMax && (
            <g>
              <rect
                x={sx(taperZone.from)}
                y={MARGIN.top}
                width={Math.max(0, sx(taperZone.to) - sx(taperZone.from))}
                height={plotH}
                className="fill-muted"
                opacity={0.9}
              />
              {sx(taperZone.to) - sx(taperZone.from) > 58 && (
                <text
                  x={(sx(taperZone.from) + sx(taperZone.to)) / 2}
                  y={MARGIN.top + 14}
                  textAnchor="middle"
                  className="fill-muted-foreground text-[10.5px]"
                >
                  枠の逓減
                </text>
              )}
            </g>
          )}

          <path
            d={paths.area}
            className="fill-[#4a3aa7]/10 dark:fill-[#9085e9]/10"
            stroke="none"
          />
          <path
            d={paths.effective}
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="stroke-muted-foreground/70"
          />
          <path
            d={paths.step}
            fill="none"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            className="stroke-[#4a3aa7] dark:stroke-[#9085e9]"
          />

          {/* ホバーの縦線 */}
          {hover && !dragging && (
            <line
              x1={sx(hover.gross)}
              x2={sx(hover.gross)}
              y1={MARGIN.top}
              y2={MARGIN.top + plotH}
              className="stroke-foreground/25"
              strokeWidth={1}
              shapeRendering="crispEdges"
            />
          )}

          {/* あなたの位置 */}
          <g style={{ transform: `translateX(${markerX}px)`, transition }}>
            <line
              x1={0}
              x2={0}
              y1={MARGIN.top - 6}
              y2={MARGIN.top + plotH}
              className="stroke-foreground"
              strokeWidth={1.5}
            />
            <circle
              r={4}
              cx={0}
              cy={0}
              style={{ transform: `translateY(${sy(userEffective)}px)`, transition }}
              className="fill-muted-foreground stroke-background"
              strokeWidth={2}
            />
            <circle
              r={5}
              cx={0}
              cy={0}
              style={{ transform: `translateY(${sy(userMarginal)}px)`, transition }}
              className="fill-[#4a3aa7] stroke-background dark:fill-[#9085e9]"
              strokeWidth={2}
            />
          </g>

          {/* 操作を受ける面。目盛りの帯まで含めて広めに取る。 */}
          <rect
            x={MARGIN.left}
            y={0}
            width={plotW}
            height={HEIGHT}
            fill="transparent"
            className={cn("cursor-ew-resize", dragging && "cursor-grabbing")}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={(e) => endGesture(e, true)}
            onPointerCancel={(e) => endGesture(e, false)}
            onPointerLeave={() => {
              if (!gesture.current) setHoverIndex(null);
            }}
          />
        </svg>

        {/* あなたの位置のラベル。SVG の text より折り返しと背景を扱いやすい。 */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background shadow-sm"
          style={{
            left: Math.min(Math.max(markerX, 64), width - 64),
            transition: dragging || reduceMotion ? "none" : "left 380ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <span className="tabular-nums">{formatGbp(gross)}</span>
          <span className="mx-1 opacity-60">·</span>
          限界 <span className="tabular-nums">{formatPercent(userMarginal, 0)}</span>
        </div>

        {hover && (
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute z-10 w-48 rounded-lg border bg-popover/95 p-2.5 text-xs shadow-lg backdrop-blur",
            )}
            style={{
              top: MARGIN.top + 10,
              left:
                sx(hover.gross) > width * 0.58
                  ? sx(hover.gross) - 12 - 192
                  : sx(hover.gross) + 12,
            }}
          >
            <p className="text-sm font-semibold tabular-nums text-foreground">
              額面 {formatGbp(hover.gross)}
            </p>
            <dl className="mt-1.5 space-y-1">
              <div className="flex items-center gap-2">
                <span aria-hidden className="h-0.5 w-3 rounded-full bg-[#4a3aa7] dark:bg-[#9085e9]" />
                <dt className="text-muted-foreground">限界税率</dt>
                <dd className="ml-auto font-semibold tabular-nums text-foreground">
                  {formatPercent(hover.marginal)}
                </dd>
              </div>
              <div className="flex items-center gap-2">
                <span aria-hidden className="h-0.5 w-3 rounded-full bg-muted-foreground/70" />
                <dt className="text-muted-foreground">実効負担率</dt>
                <dd className="ml-auto font-semibold tabular-nums text-foreground">
                  {formatPercent(hover.effective)}
                </dd>
              </div>
              <div className="flex items-center gap-2 border-t border-border/70 pt-1">
                <dt className="text-muted-foreground">手取り（年）</dt>
                <dd className="ml-auto font-semibold tabular-nums text-foreground">
                  {formatGbp(hover.takeHome)}
                </dd>
              </div>
            </dl>
            {inTaperZone && (
              <p className="mt-1.5 leading-snug text-muted-foreground">
                非課税枠が£2につき£1削られる区間です
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import styles from "./christmas.module.css";

/**
 * 見出しの帯の上辺に垂らす電球のガーランド。飾りだけで情報は持たないので、
 * 読み上げからは外す(aria-hidden)。
 *
 * 電線は8つの弧(2次ベジエ)で、各弧の 1/4・1/2・3/4 の点に電球を吊る。
 * 座標は viewBox(1000×100)の上で計算してあり、幅に合わせて等倍で縮む。
 */

const ARC_WIDTH = 125;
const ARCS = 8;
const WIRE_TOP = 12;
const WIRE_SAG = 46;

/** 弧の上の点。t は 0〜1。 */
function onArc(x0: number, t: number) {
  const p0 = { x: x0, y: WIRE_TOP };
  const p1 = { x: x0 + ARC_WIDTH / 2, y: WIRE_SAG };
  const p2 = { x: x0 + ARC_WIDTH, y: WIRE_TOP };
  const a = (1 - t) * (1 - t);
  const b = 2 * (1 - t) * t;
  const c = t * t;
  return { x: a * p0.x + b * p1.x + c * p2.x, y: a * p0.y + b * p1.y + c * p2.y };
}

// 金・赤・緑・電球色・青を順に。どの色も紺の夜空の上で見分けられる明るさ。
const COLORS = ["#fcd34d", "#f87171", "#6ee7b7", "#fff7ed", "#93c5fd"];

const WIRE = Array.from({ length: ARCS }, (_, i) => {
  const x0 = i * ARC_WIDTH;
  return `Q${x0 + ARC_WIDTH / 2},${WIRE_SAG} ${x0 + ARC_WIDTH},${WIRE_TOP}`;
}).join(" ");

const BULBS = Array.from({ length: ARCS }, (_, i) =>
  [0.25, 0.5, 0.75].map((t) => onArc(i * ARC_WIDTH, t)),
).flat();

export default function LightString({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 100"
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMin meet"
    >
      <defs>
        <filter id="xmas-glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>
      <path
        d={`M0,${WIRE_TOP} ${WIRE}`}
        fill="none"
        stroke="#1f2937"
        strokeWidth="2.5"
        opacity="0.9"
      />
      {BULBS.map((point, i) => {
        const color = COLORS[i % COLORS.length];
        const cx = point.x;
        const cy = point.y + 11;
        return (
          <g
            key={i}
            className={styles.bulb}
            style={{ animationDelay: `${(i * 0.37) % 3.2}s` }}
          >
            <circle cx={cx} cy={cy} r="11" fill={color} opacity="0.45" filter="url(#xmas-glow)" />
            <rect x={cx - 3} y={point.y - 1} width="6" height="5" rx="1" fill="#374151" />
            <ellipse cx={cx} cy={cy} rx="5.5" ry="8" fill={color} />
            <ellipse cx={cx - 1.6} cy={cy - 2.5} rx="1.6" ry="2.6" fill="#ffffff" opacity="0.55" />
          </g>
        );
      })}
    </svg>
  );
}

export default function LyrixLogo({
  size = 64,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const width = (size * 700) / 200;

  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 700 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="LyriXplorer"
    >
      <defs>
        <linearGradient
          id="gradB"
          x1="0"
          y1="0"
          x2="700"
          y2="200"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#72E5FF" />
          <stop offset="100%" stopColor="#A58BFF" />
        </linearGradient>
      </defs>

      {/* Main */}
      <g transform="translate(0,-6)">
        <text
          x="40"
          y="120"
          fontFamily="Segoe UI, Helvetica, sans-serif"
          fontSize="88"
          fontWeight="750"
          fill="url(#gradB)"
          transform="skewX(-6)"
          paintOrder="stroke fill"
          stroke="rgba(0,0,0,0.14)"
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
        >
          LyriX
        </text>

        <polygon
          points="260,55 280,90 315,110 280,130 260,165 240,130 205,110 240,90"
          fill="url(#gradB)"
          transform="scale(0.38) translate(480,118) rotate(18)"
          opacity="0.95"
        />

        <text
          x="282"
          y="120"
          fontFamily="Segoe UI, Helvetica, sans-serif"
          fontSize="88"
          fontWeight="750"
          fill="url(#gradB)"
          transform="skewX(-6)"
          paintOrder="stroke fill"
          stroke="rgba(0,0,0,0.14)"
          strokeWidth="0.8"
          vectorEffect="non-scaling-stroke"
        >
          plorer
        </text>
      </g>

      {/* Japanese subtitle (bigger) */}
      <text
        x="170"
        y="152"
        textAnchor="middle"
        fontFamily="Segoe UI, Helvetica, sans-serif"
        fontSize="22"
        fontWeight="600"
        fill="rgba(148,163,184,0.92)"
        letterSpacing="0.14em"
      >
        リリックスプローラー
      </text>
    </svg>
  );
}

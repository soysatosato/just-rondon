export default function LyrixLogo({
  size = 100,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const width = (size * 700) / 200;
  const height = size;
  return (
    <svg
      width={width}
      height={size}
      viewBox="0 0 700 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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
          <stop offset="0%" stop-color="#72E5FF" />
          <stop offset="100%" stop-color="#A58BFF" />
        </linearGradient>
      </defs>
      <text
        x="40"
        y="130"
        font-family="Segoe UI, Helvetica, sans-serif"
        font-size="100"
        font-weight="700"
        fill="url(#gradB)"
        transform="skewX(-5)"
      >
        LyriX
      </text>
      <polygon
        points="260,55 280,90 315,110 280,130 260,165 240,130 205,110 240,90"
        fill="url(#gradB)"
        transform="scale(0.4) translate(450,110) rotate(20)"
      />
      <text
        x="288"
        y="130"
        font-family="Segoe UI, Helvetica, sans-serif"
        font-size="100"
        font-weight="700"
        fill="url(#gradB)"
        transform="skewX(-5)"
      >
        plorer
      </text>
    </svg>
  );
}

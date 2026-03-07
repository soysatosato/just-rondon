export default function LyrixLogo({
  size = 64,
  className,
}: {
  size?: number;
  className?: string;
}) {
  const width = (size * 700) / 200;

  return (
    <div
      className={className}
      style={{
        width,
        textAlign: "center",
      }}
      role="img"
      aria-label="LyriXplorer"
    >
      {/* ロゴ本体（PNG） */}
      <div className="mt-2">
        <img
          src="/lyrix.png"
          alt="LyriXplorer"
          width={width}
          height={size}
          style={{ display: "block", margin: "0 auto" }}
        />
      </div>
      {/* カタカナはそのまま */}
      <div
        style={{
          marginTop: 6,
          fontFamily: "Segoe UI, Helvetica, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.14em",
          color: "rgba(148,163,184,0.92)",
        }}
        className="mb-2"
      >
        リリックスプローラー
      </div>
    </div>
  );
}

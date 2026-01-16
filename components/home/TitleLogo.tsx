export default function TitleLogo() {
  return (
    <span className="inline-flex flex-col leading-tight select-none">
      {/* Japanese Title */}
      <span
        className="
          inline-block
          bg-gradient-to-r
          from-red-400
          via-foreground
          to-red-400
          bg-clip-text
          text-transparent
          text-2xl
          font-bold
        "
        style={{
          WebkitTextStroke: "0.6px rgba(0,0,0,0.18)",
        }}
      >
        ジャスト・ロンドン
      </span>

      {/* English Subtitle */}
      <span
        className="
          text-[10px]
          tracking-[0.35em]
          uppercase
          text-muted-foreground
          font-medium
          mt-0.5
        "
      >
        JUST RONDON
      </span>
    </span>
  );
}

/**
 * サイトのワードマーク。
 *
 * onPhoto は写真の上に重ねる場合。通常版はテーマの foreground を挟んだ
 * グラデーションだが、写真の上ではライトテーマの黒文字が沈むうえ、
 * 濃色の縁取りが白い建物に当たると潰れる。写真版は白基調に振る。
 */
export default function TitleLogo({ onPhoto = false }: { onPhoto?: boolean }) {
  return (
    <span className="inline-flex flex-col leading-tight select-none">
      {/* Japanese Title */}
      <span
        className={`inline-block bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent ${
          onPhoto
            ? "from-red-300 via-white to-red-300"
            : "from-red-400 via-foreground to-red-400"
        }`}
        style={
          onPhoto
            ? { WebkitTextStroke: "0.6px rgba(255,255,255,0.25)" }
            : { WebkitTextStroke: "0.6px rgba(0,0,0,0.18)" }
        }
      >
        ジャスト・ロンドン
      </span>

      {/* English Subtitle */}
      <span
        className={`mt-0.5 text-[10px] font-medium uppercase tracking-[0.35em] ${
          onPhoto ? "text-white/70" : "text-muted-foreground"
        }`}
      >
        JUST RONDON
      </span>
    </span>
  );
}

/**
 * 外部から借りた画像の出典表記。
 *
 * Wikimedia Commons の CC 画像は作者名とライセンス名の表示が条件なので、
 * source が commons のときは省略できない。将来アフィリエイトAPI由来の
 * 画像(rakuten / amazon)を混ぜたときは、それぞれの規約に応じてここに
 * 分岐を足す。表記の判断をこの1箇所に閉じ込めるための部品。
 */
export default function ImageCredit({
  source,
  credit,
  link,
  className = "",
}: {
  source: string | null;
  credit: string | null;
  link: string | null;
  className?: string;
}) {
  if (source !== "commons" || !credit) return null;

  return (
    <p
      className={`text-[11px] leading-snug text-muted-foreground ${className}`}
    >
      画像:{" "}
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:opacity-80"
        >
          {credit}
        </a>
      ) : (
        credit
      )}
    </p>
  );
}

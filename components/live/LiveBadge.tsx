/**
 * 「いつ時点のデータか」を示す小さなバッジ。
 *
 * GuideFreshness が静的な記事の基準日を示すのに対して、これは
 * 外部APIから取ってきた変動データ用。サーバー側で数分〜数時間
 * キャッシュしている以上、表示は常に多少古い。その事実を隠さずに
 * 出しておかないと、読者が「今まさにこの状況」と誤解する。
 */
export default function LiveBadge({
  fetchedAt,
  label = "現地時刻",
}: {
  fetchedAt: string;
  label?: string;
}) {
  // ロンドン時間で出す。読者の端末のタイムゾーンで出すと、
  // 日本から見ている人に「9時間後の時刻」が見えてしまう。
  const time = new Date(fetchedAt).toLocaleTimeString("en-GB", {
    timeZone: "Europe/London",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <span className="text-xs text-gray-500 dark:text-gray-400">
      {label} {time} 時点
    </span>
  );
}

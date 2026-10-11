/**
 * 2025年のイベントカレンダー(/events/archive/2025 と月ごとの12本)は
 * 削除した。410 を返して、検索エンジンに「もう戻らない」と伝える。
 *
 * 2026-10 の監査で、去年の催しの紹介と決まり文句の多い文章が13ページ
 * 並んでいるだけと分かった。1年で検索のクリックは0、表示は16回。
 * 404 でなく 410 にしたのは、一時的な欠落ではないと伝えて索引から早く
 * 落とすため。noindex で残すと、広告の審査からは中身の薄いページとして
 * 見え続ける。
 *
 * DB の Content(category = "london-events-2025")の12行は消していない。
 * 月別ページ(/events/<月>)の導入文の代用は、同じ月の新しい年の行を
 * 使うので(fetchMonthIntroFallback)、2025年の行はどこからも読まれない。
 */

const BODY = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>このページは削除しました | ジャスト・ロンドン</title>
</head>
<body style="font-family: system-ui, sans-serif; max-width: 36rem; margin: 4rem auto; padding: 0 1rem; line-height: 1.7;">
<h1 style="font-size: 1.25rem;">このページは削除しました</h1>
<p>2025年のイベントカレンダーは公開を終えました。今年と来年の催しは<a href="/events/calendar">イベントカレンダー</a>に月ごとにまとめています。</p>
</body>
</html>`;

export function GET() {
  return new Response(BODY, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

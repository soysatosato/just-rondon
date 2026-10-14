/**
 * 旧 LyriXplorer(/lyrixplorer と配下すべて)は 410 を返す。
 *
 * 以前は next.config.mjs で just-lyrics.com へ 308 転送していた。
 * just-lyrics.com は歌詞全文と和訳を載せていて、2026-10 の監査で
 * このサイトの AdSense 審査に響きうると分かったため、転送をやめた。
 * 転送が残っていると、このサイトが歌詞サイトの入口だと検索エンジンに
 * 伝え続けることになる。
 *
 * 404 でなく 410 にしたのは、一時的な欠落ではないと伝えて索引から
 * 早く落とすため。案内文にも just-lyrics.com へのリンクは置かない。
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
<p>歌詞のページは公開を終えました。ウエストエンドの作品のあらすじと曲順は<a href="/musicals">ミュージカル一覧</a>にまとめています。</p>
</body>
</html>`;

export function GET() {
  return new Response(BODY, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

/**
 * Instagram の埋め込みURLを検査して正規化する。
 *
 * 一番起きやすい間違いがプロフィールURL(instagram.com/dishoom/)を貼ること。
 * 埋め込めないのに見た目は正しいURLなので、素通しすると本番で無言の空白に
 * なる。投入の時点で弾いて警告する。
 *
 * 埋め込めるのは個別の投稿(/p/...)と Reels(/reel/...)だけ。Instagram は
 * プロフィール単位の埋め込みを廃止している。
 */
export function normaliseInstagramUrl(
  raw: string | undefined | null,
  label: string,
): string | null {
  if (!raw) return null;

  // 共有リンクに付いてくる ?igsh=... などを落とす。
  const clean = raw.split("?")[0].replace(/\/+$/, "");

  // 検索結果や共有からは /{アカウント名}/p/{ID}/ の形も出てくる。
  // これは /p/{ID}/ と同じ投稿を指す別表記(IDが投稿の一意キー)なので、
  // 弾かずに正規形へ寄せる。埋め込みスクリプトは正規形を前提にしている。
  const match = clean.match(
    /^https:\/\/(?:www\.)?instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(p|reel)\/([A-Za-z0-9_-]+)$/,
  );

  if (!match) {
    console.warn(
      `  [${label}] 埋め込めないURLなので無視した: ${raw}\n` +
        `    投稿(/p/...)か Reels(/reel/...)のURLが必要。プロフィールURLは埋め込めない。`,
    );
    return null;
  }

  const [, kind, id] = match;

  // Instagram の埋め込みは末尾スラッシュ付きを想定している。
  return `https://www.instagram.com/${kind}/${id}/`;
}

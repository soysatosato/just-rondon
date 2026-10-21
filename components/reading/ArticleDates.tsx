import { publishedDateOf } from "@/lib/publish-schedule";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

/**
 * 読み物の「公開」と「更新」の日付。
 *
 * 値は JSON-LD の datePublished / dateModified と同じもの
 * (publishedDateOf / modifiedDateOf)。Google は画面の日付と構造化データの
 * 日付が一致していること、日付に「公開」「更新」のような見出しを付けることを
 * 求めている。以前は見出しの無い公開日だけを出し、構造化データの更新日は
 * 閲覧のたびに動いていた。
 *
 * 更新は公開後に本文を直した記事(revisedAt)にだけ出す。公開と同じ日に
 * 直したものは日付が同じになるので出さない。
 */
export default function ArticleDates({
  content,
}: {
  content: { publishedAt: Date | null; createdAt: Date; revisedAt: Date | null };
}) {
  const published = publishedDateOf(content);
  const revised = content.revisedAt;
  const showRevised =
    revised !== null && formatDate(revised) !== formatDate(published);

  return (
    <>
      <time dateTime={published.toISOString()}>{formatDate(published)}</time>
      公開
      {showRevised && (
        <>
          <span aria-hidden className="mx-1 text-muted-foreground/40">
            ·
          </span>
          <time dateTime={revised.toISOString()}>{formatDate(revised)}</time>
          更新
        </>
      )}
    </>
  );
}

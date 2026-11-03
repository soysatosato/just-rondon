import Link from "next/link";

/**
 * イギリス英語の A〜Z 索引。全語を最初から見せる。
 *
 * 以前は全語の一覧を閉じた <details> に入れ、書庫は12語ずつめくる作りだった。
 * 辞書を引きに来た人(検索語は「chuffed 意味」の形)にとって、引きたい語が
 * 何画面目にあるか分からない一覧は使えない。語は短いので、頭文字で行を分けて
 * 1画面に並べる。
 */
export default function BritishEnglishAZ({
  entries,
}: {
  entries: { slug: string; engTitle: string | null; title: string }[];
}) {
  const words = entries
    .map((e) => ({ href: `/british-english/${e.slug}`, word: e.engTitle ?? e.title }))
    .sort((a, b) => a.word.localeCompare(b.word, "en", { sensitivity: "base" }));
  if (words.length === 0) return null;

  const groups = new Map<string, typeof words>();
  for (const w of words) {
    const head = /^[a-z]/i.test(w.word) ? w.word[0].toUpperCase() : "#";
    groups.set(head, [...(groups.get(head) ?? []), w]);
  }

  return (
    <section aria-labelledby="be-az" className="mb-14">
      <div className="mb-4 border-b border-foreground/20 pb-2">
        <h2 id="be-az" className="text-lg font-bold tracking-tight sm:text-xl">
          A〜Zで引く(全{words.length}語)
        </h2>
      </div>
      <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {[...groups.entries()].map(([head, list]) => (
          <div key={head} className="flex gap-4 py-2.5">
            <dt className="w-6 shrink-0 pt-1 text-sm font-extrabold text-rose-700 dark:text-rose-400">
              {head}
            </dt>
            <dd className="flex flex-wrap gap-1.5">
              {list.map((w) => (
                <Link
                  key={w.href}
                  href={w.href}
                  lang="en-GB"
                  className="rounded-full border border-neutral-200 px-3 py-1 text-sm font-medium transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 dark:border-neutral-700 dark:hover:border-rose-800 dark:hover:bg-rose-950/30 dark:hover:text-rose-200"
                >
                  {w.word}
                </Link>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

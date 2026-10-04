import Link from "next/link";

/**
 * /account の運営者欄。運営者(lib/admin.ts の isAdmin)のときだけ出す。
 *
 * 管理ページはナビに載せていない。記事ページは全員に同じ HTML を返して
 * いるので、運営者かどうかを混ぜられないため。/account はログイン状態を
 * 見て毎回描画しているので、ここなら判定をそのまま使える。
 */
const LINKS = [
  {
    href: "/admin/reading",
    label: "読み物の管理",
    note: "下書きのプレビューと承認、予約の確認",
  },
  {
    href: "/tweets",
    label: "ツイート下書き",
    note: "X に投稿する文面のコピーと、投稿済みの記録",
  },
] as const;

export default function AdminLinksSection() {
  return (
    <section
      aria-labelledby="admin-links-heading"
      className="rounded-xl border border-amber-300 bg-amber-50/60 p-5 dark:border-amber-800 dark:bg-amber-950/30 sm:p-6"
    >
      <h2 id="admin-links-heading" className="text-base font-semibold">
        運営者メニュー
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        運営者としてログインしています。この欄はほかの人には表示されません。
      </p>
      <ul className="mt-4 space-y-2">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="block rounded-lg border bg-background px-4 py-3 transition-colors hover:bg-accent"
            >
              <span className="text-sm font-semibold">{l.label}</span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {l.note}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Sparkles, Stamp } from "lucide-react";

import db from "@/utils/db";
import StampBook, {
  type StampBookEntry,
} from "@/components/stamps/StampBook";
import { stampType, STAMP_META, type StampType } from "@/lib/stamps";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("スタンプ帳");

/**
 * スタンプ帳。押したスタンプを種別ごとに並べる、ログインした人だけのページ。
 *
 * auth() を読むので動的描画になる。ここは他人のスタンプを混ぜてはいけない
 * ページなので、キャッシュされないことが正しい。
 */
export default async function StampsPage() {
  const { userId } = auth();

  if (!userId) return <SignedOut />;

  const [stamps, attractionTotal, museumTotal, musicalTotal] =
    await Promise.all([
      db.stamp.findMany({
        where: { profileId: userId },
        orderBy: { stampedAt: "desc" },
        select: {
          id: true,
          stampedAt: true,
          onSite: true,
          attractionId: true,
          museumId: true,
          musicalId: true,
          attraction: { select: { slug: true, name: true, image: true } },
          museum: { select: { slug: true, name: true, image: true } },
          musical: { select: { slug: true, name: true, image: true } },
        },
      }),
      // 分母は読者が実際に押せる数に合わせる。伏せたスポット
      // (isPublished: false)は詳細ページが出ないので押せない。
      db.attraction.count({ where: { isPublished: true } }),
      db.museum.count(),
      // 上演が終わった作品も分母に入れる。観たことがある人は押せるので、
      // isOnShow で絞ると「押したのに分母から消えている」ことが起きる。
      db.musical.count(),
    ]);

  const entries: StampBookEntry[] = [];
  for (const stamp of stamps) {
    const type = stampType(stamp);
    if (!type) continue;
    const target =
      type === "attraction"
        ? stamp.attraction
        : type === "museum"
          ? stamp.museum
          : stamp.musical;
    // 外部キーと CHECK 制約があるので、ここが null になるのは
    // 対象が消えた直後の競合だけ。描けないものは黙って飛ばす。
    if (!target) continue;
    entries.push({
      id: stamp.id,
      type,
      slug: target.slug,
      name: target.name,
      image: target.image,
      stampedAt: stamp.stampedAt.toISOString(),
      onSite: stamp.onSite,
    });
  }

  const totals: Record<StampType, number> = {
    attraction: attractionTotal,
    museum: museumTotal,
    musical: musicalTotal,
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
          Stamp Book
        </p>
        <h1 className="mt-2 text-2xl font-semibold">スタンプ帳</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          行った観光スポット・入った美術館・観たミュージカルの記録です。
          各ページの「スタンプを押す」から増えます。
        </p>
      </header>

      <StampBook entries={entries} totals={totals} />
    </div>
  );
}

/**
 * ログインしていない人に出す説明。
 *
 * ここで /sign-in へ即リダイレクトしないのは、ナビゲーションから
 * 「スタンプ帳」を初めて押した人が、何のための機能か分からないまま
 * ログイン画面に立つことになるため。まず何が貯まるのかを見せる。
 */
function SignedOut() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
        Stamp Book
      </p>
      <h1 className="mt-2 text-2xl font-semibold">スタンプ帳</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        行った場所にスタンプを押して、自分の記録として残せます。
        観光スポット・美術館・ミュージカルの各ページにボタンがあります。
      </p>

      <ul className="mt-8 space-y-4 text-sm">
        <li className="flex items-start gap-3">
          <span className="mt-0.5 rounded-full border-2 border-dashed border-rose-500 p-1.5 text-rose-600 dark:text-rose-400">
            <Stamp className="h-4 w-4" aria-hidden />
          </span>
          <span className="leading-relaxed">
            <span className="font-semibold">押すだけのスタンプ</span>
            <br />
            帰国してからでも、昔行った場所でも記録できます。
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5 rounded-full border-2 border-dashed border-amber-500 p-1.5 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" aria-hidden />
          </span>
          <span className="leading-relaxed">
            <span className="font-semibold">現地で押すと金のスタンプ</span>
            <br />
            その場所の近くで位置情報を付けて押したときだけ付きます。
          </span>
        </li>
      </ul>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/sign-in"
          className="inline-flex items-center rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          ログイン
        </Link>
        <Link
          href="/sign-up"
          className="inline-flex items-center rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400"
        >
          アカウントを作る
        </Link>
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted-foreground">
        記事を読むのにログインは要りません。スタンプ帳を使うときだけ必要です。
        まずは
        <Link
          href={STAMP_META.attraction.hubHref}
          className="mx-1 font-semibold text-rose-600 hover:underline dark:text-rose-400"
        >
          観光スポットの一覧
        </Link>
        から見てみてください。
      </p>
    </div>
  );
}

import Link from "next/link";
import { Users } from "lucide-react";

import InviteLinkButton from "@/components/stamps/friends/InviteLinkButton";
import MemberDot from "@/components/stamps/friends/MemberDot";
import { listFriends } from "@/lib/stamp-friends";
import { TOGETHER_HREF } from "@/lib/stamp-friends-shared";

/**
 * スタンプ帳(/stamps)に置く、旅仲間への入口。
 *
 * つながっている相手がいれば顔ぶれと「重ねて見る」を、いなければ
 * 何ができるかの一文と招待リンクのボタンを出す。比べる画面そのものは
 * /stamps/together にあり、ここは入口だけ。
 *
 * 自分でデータを引くサーバーコンポーネントにしてあるので、/stamps 側は
 * userId を渡して置くだけでよい。
 */
export default async function StampFriendsCard({ userId }: { userId: string }) {
  const friends = await listFriends(userId);

  return (
    <section aria-labelledby="stamp-friends-heading" className="space-y-4">
      {/* 見出しはスタンプ帳のほかの欄(StampBook の SectionHeading)と同じ形。 */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
            <span className="h-3 w-0.5 shrink-0 rounded-full bg-rose-500" />
            Friends
          </p>
          <h2
            id="stamp-friends-heading"
            className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl"
          >
            旅仲間
          </h2>
        </div>
        {friends.length > 0 && (
          <Link
            href={TOGETHER_HREF}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            <Users className="h-4 w-4" aria-hidden />
            重ねて見る
          </Link>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-border px-5 py-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {friends.length > 0
            ? "スタンプ帳を重ねて、まだ誰も行っていない場所から次の予定を立てられます。"
            : "パートナーや友人とスタンプ帳をつなぐと、お互いが行った場所を重ねて、まだ誰も行っていない場所を一覧にできます。"}
        </p>

        {friends.length > 0 ? (
          <>
            <ul className="flex flex-wrap gap-2">
              {friends.map((friend, i) => (
                <li
                  key={friend.id}
                  className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-sm"
                >
                  {/* 色は /stamps/together で既定で重ねたときの並び(自分が0番)に合わせる。 */}
                  <MemberDot index={i + 1} username={friend.username} />
                  <span className="[overflow-wrap:anywhere]">
                    {friend.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {friend.stampCount}個
                  </span>
                </li>
              ))}
            </ul>
            <details className="group">
              <summary className="cursor-pointer list-none text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400 [&::-webkit-details-marker]:hidden">
                旅仲間を招待する
              </summary>
              <InviteLinkButton className="mt-3" />
            </details>
          </>
        ) : (
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <InviteLinkButton />
            <Link
              href={TOGETHER_HREF}
              className="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
            >
              くわしく見る →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

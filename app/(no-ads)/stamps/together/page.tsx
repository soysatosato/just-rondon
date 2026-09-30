import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Users } from "lucide-react";

import InviteLinkButton from "@/components/stamps/friends/InviteLinkButton";
import MemberDot from "@/components/stamps/friends/MemberDot";
import SharingNote from "@/components/stamps/friends/SharingNote";
import TogetherView, {
  type TogetherMember,
} from "@/components/stamps/friends/TogetherView";
import UnlinkFriendButton from "@/components/stamps/friends/UnlinkFriendButton";
import { ensureProfile } from "@/lib/profile";
import { noindexMetadata } from "@/lib/seo";
import { listFriends, type StampFriend } from "@/lib/stamp-friends";
import { MAX_TOGETHER } from "@/lib/stamp-friends-shared";
import {
  countByMember,
  loadTogetherPlaces,
  splitByOverlap,
} from "@/lib/stamp-together";
import { formatStampDate, STAMP_BOOK_HREF } from "@/lib/stamps";

export const metadata = noindexMetadata("旅仲間とスタンプ帳を重ねる");

/**
 * 旅仲間とスタンプ帳を重ねるページ。ログインした人だけが使う。
 *
 * ?with= に重ねる相手を、つながり(StampFriend)の id のカンマ区切りで取る。
 * 相手の clerkId ではなくつながりの id にしているのは、URL が共有されても
 * 相手の Clerk のIDが外に出ないようにするのと、自分とつながっていない
 * 相手を指定できないようにするため(自分のつながりに無い id は黙って捨てる)。
 *
 * 指定が無ければ、新しくつながった順に MAX_TOGETHER 人まで全員を重ねる。
 * パートナーとだけつながっている人は、開けばそのまま2人の比較になる。
 *
 * auth() を読むので動的描画になる。他人のスタンプが混ざるページなので、
 * キャッシュされないことが正しい。
 */
export default async function TogetherPage({
  searchParams,
}: {
  searchParams: { with?: string | string[] };
}) {
  const { userId, redirectToSignIn } = auth();
  if (!userId) return redirectToSignIn();

  const [profile, friends] = await Promise.all([
    ensureProfile(userId),
    listFriends(userId),
  ]);

  if (friends.length === 0) return <NoFriendsYet />;

  const selected = pickFriends(friends, searchParams.with);
  const memberIds = [userId, ...selected.map((f) => f.clerkId)];
  const places = await loadTogetherPlaces(memberIds);
  const counts = countByMember(places, memberIds.length);

  const members: TogetherMember[] = [
    { username: profile.username, count: counts[0], friendId: null },
    ...selected.map((friend, i) => ({
      username: friend.username,
      count: counts[i + 1],
      friendId: friend.id,
    })),
  ];
  const others = friends
    .filter((friend) => !selected.includes(friend))
    .map((friend) => ({ friendId: friend.id, username: friend.username }));

  return (
    <div className="mx-auto max-w-4xl py-6 sm:py-8">
      <header className="mb-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
          Stamp Book Together
        </p>
        <h1 className="mt-2 text-2xl font-semibold [overflow-wrap:anywhere]">
          {selected.length === 1
            ? `${profile.username} と ${selected[0].username} のスタンプ帳`
            : `${members.length}人のスタンプ帳`}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          行った場所を重ねました。まだ誰も行っていない場所は一緒に行く候補に、
          誰かだけが行った場所は、その人に案内してもらえます。
          <Link
            href={STAMP_BOOK_HREF}
            className="ml-1 font-semibold text-rose-600 hover:underline dark:text-rose-400"
          >
            自分のスタンプ帳へ
          </Link>
        </p>
      </header>

      <TogetherView members={members} others={others} overlap={splitByOverlap(places, members.length)} />

      <FriendsManager friends={friends} />
    </div>
  );
}

/** ?with= から重ねる相手を決める。つながっていない id は捨てる。 */
function pickFriends(
  friends: StampFriend[],
  param: string | string[] | undefined,
): StampFriend[] {
  const raw = Array.isArray(param) ? param.join(",") : (param ?? "");
  const ids = new Set(raw.split(",").filter(Boolean));
  const picked = friends.filter((friend) => ids.has(friend.id));
  return (picked.length > 0 ? picked : friends).slice(0, MAX_TOGETHER);
}

/** つながっている全員と、解除・招待。重ねている相手に限らず全員を出す。 */
function FriendsManager({ friends }: { friends: StampFriend[] }) {
  return (
    <section
      aria-labelledby="friends-heading"
      className="mt-12 space-y-5 rounded-2xl border border-border p-5 sm:p-6"
    >
      <div>
        <h2 id="friends-heading" className="text-base font-semibold">
          つながっている旅仲間
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{friends.length}人</p>
      </div>

      <ul className="divide-y divide-border">
        {friends.map((friend) => (
          <li
            key={friend.id}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5"
          >
            <span className="min-w-0 text-sm">
              <span className="font-medium [overflow-wrap:anywhere]">
                {friend.username}
              </span>
              <span className="ml-2 text-xs text-muted-foreground">
                スタンプ{friend.stampCount}個・{formatStampDate(friend.linkedAt)}から
              </span>
            </span>
            <UnlinkFriendButton friendId={friend.id} username={friend.username} />
          </li>
        ))}
      </ul>

      <div className="space-y-3 border-t border-border pt-5">
        <p className="text-sm font-semibold">旅仲間を増やす</p>
        <InviteLinkButton />
      </div>

      <SharingNote />
    </section>
  );
}

/** まだ誰ともつながっていない人に、何ができるかを見せて招待リンクを作らせる。 */
function NoFriendsYet() {
  return (
    <div className="mx-auto max-w-2xl py-10 sm:py-12">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
        Stamp Book Together
      </p>
      <h1 className="mt-2 text-2xl font-semibold">旅仲間とスタンプ帳を重ねる</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        パートナーや友人とスタンプ帳をつなぐと、お互いが行った場所を重ねて見られます。
        次の旅行の予定を立てるときに使ってください。
      </p>

      <ul className="mt-8 space-y-4 text-sm">
        <li className="flex items-start gap-3">
          <span className="mt-0.5 flex -space-x-1.5">
            <MemberDot index={0} username="A" />
            <MemberDot index={1} username="B" />
          </span>
          <span className="leading-relaxed">
            <span className="font-semibold">まだ誰も行っていない場所</span>
            <br />
            観光スポットはエリアごとにまとめるので、一緒に回る半日の行き先がそのまま決まります。
          </span>
        </li>
        <li className="flex items-start gap-3">
          <span className="mt-0.5">
            <MemberDot index={1} username="B" onSite />
          </span>
          <span className="leading-relaxed">
            <span className="font-semibold">誰かだけが行った場所</span>
            <br />
            行ったことのある人に、見どころや回り方を案内してもらえます。
          </span>
        </li>
        <li className="flex items-start gap-3">
          <Users className="mt-0.5 h-5 w-5 text-rose-500" aria-hidden />
          <span className="leading-relaxed">
            <span className="font-semibold">グループでも</span>
            <br />
            つながった相手は{MAX_TOGETHER}人まで一度に重ねられます。
          </span>
        </li>
      </ul>

      <div className="mt-10 space-y-3">
        <p className="text-sm font-semibold">
          招待リンクを作って、LINE などで相手に送ってください
        </p>
        <InviteLinkButton />
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <SharingNote />
      </div>

      <Link
        href={STAMP_BOOK_HREF}
        className="mt-8 inline-block text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
      >
        ← 自分のスタンプ帳へ
      </Link>
    </div>
  );
}

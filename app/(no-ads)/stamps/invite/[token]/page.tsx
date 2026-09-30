import type { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import AcceptInviteButton from "@/components/stamps/friends/AcceptInviteButton";
import SharingNote from "@/components/stamps/friends/SharingNote";
import { noindexMetadata } from "@/lib/seo";
import { findFriendship, findInvite } from "@/lib/stamp-friends";
import {
  INVITE_TTL_DAYS,
  invitePath,
  togetherHref,
  TOGETHER_HREF,
} from "@/lib/stamp-friends-shared";
import { formatStampDate, STAMP_BOOK_HREF } from "@/lib/stamps";

/*
 * タイトルに招待した人の名前を入れない。LINE などのプレビューは
 * このタイトルを拾うので、名前を入れるとトークの外にも名前が出ていく。
 */
export const metadata = noindexMetadata("スタンプ帳の招待");

/**
 * 招待リンクを開いたページ。
 *
 * 開いただけではつながらない。「つなぐ」を押して初めてつながる
 * (理由は AcceptInviteButton)。このページ自体は何も書き換えない。
 *
 * ログインしていない人には、誰からの何の招待かを見せてから
 * ログイン・登録に送り、終わったらこのページに戻す。招待リンクで
 * 初めてこのサイトに来た人が、いきなりログイン画面に立たないように。
 */
export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const { userId } = auth();
  const invite = await findInvite(params.token);

  if (!invite) return <InviteGone />;

  const heading = `${invite.inviterUsername} さんから、スタンプ帳をつなぐ招待が届いています`;

  if (userId === invite.inviterId) {
    return (
      <Shell heading="これはあなたが作った招待リンクです">
        <p className="text-sm leading-relaxed text-muted-foreground">
          つなぎたい相手に、このページのURLを送ってください。相手が開いて「スタンプ帳をつなぐ」を押すと、つながります。
          {formatStampDate(invite.expiresAt)}まで使えます。
        </p>
        <BackLinks />
      </Shell>
    );
  }

  if (userId) {
    const friendId = await findFriendship(userId, invite.inviterId);
    if (friendId) {
      return (
        <Shell heading={`${invite.inviterUsername} さんとは、もうつながっています`}>
          <Link
            href={togetherHref([friendId])}
            className="inline-flex items-center rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            スタンプ帳を重ねて見る
          </Link>
        </Shell>
      );
    }

    return (
      <Shell heading={heading}>
        <Explanation />
        <AcceptInviteButton token={params.token} />
        <p className="text-xs text-muted-foreground">
          このリンクは{formatStampDate(invite.expiresAt)}まで使えます。
        </p>
      </Shell>
    );
  }

  // Clerk のログイン・登録画面は redirect_url を見て、終わったらそこへ戻す。
  const back = encodeURIComponent(invitePath(params.token));
  return (
    <Shell heading={heading}>
      <Explanation />
      <p className="text-sm leading-relaxed">
        つなぐには、ジャスト・ロンドンのアカウントが要ります。
        ログインか登録が終わると、このページに戻ってきます。
      </p>
      <div className="flex flex-wrap items-center gap-4">
        <Link
          href={`/sign-up?redirect_url=${back}`}
          className="inline-flex items-center rounded-full bg-rose-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          アカウントを作る
        </Link>
        <Link
          href={`/sign-in?redirect_url=${back}`}
          className="inline-flex items-center rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400"
        >
          ログイン
        </Link>
      </div>
    </Shell>
  );
}

function Shell({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl py-10 sm:py-12">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
        Stamp Book Together
      </p>
      <h1 className="mt-2 text-2xl font-semibold leading-snug [overflow-wrap:anywhere]">
        {heading}
      </h1>
      <div className="mt-6 space-y-6">{children}</div>
    </div>
  );
}

function Explanation() {
  return (
    <>
      <p className="text-sm leading-relaxed text-muted-foreground">
        ジャスト・ロンドンのスタンプ帳は、行った観光スポット・美術館・観たミュージカルの記録です。
        つなぐとお互いのスタンプを重ねて、まだ誰も行っていない場所を一覧にできます。
        一緒に行く場所を決めるときに使ってください。
      </p>
      <div className="rounded-xl border border-border p-4">
        <SharingNote />
      </div>
    </>
  );
}

function BackLinks() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <Link
        href={TOGETHER_HREF}
        className="font-semibold text-rose-600 hover:underline dark:text-rose-400"
      >
        旅仲間とスタンプ帳を重ねる
      </Link>
      <Link
        href={STAMP_BOOK_HREF}
        className="font-semibold text-rose-600 hover:underline dark:text-rose-400"
      >
        自分のスタンプ帳へ
      </Link>
    </div>
  );
}

function InviteGone() {
  return (
    <Shell heading="この招待リンクは使えません">
      <p className="text-sm leading-relaxed text-muted-foreground">
        招待リンクは1人ぶんで、使われた時点で無効になります。作ってから{INVITE_TTL_DAYS}日たったものも使えません。
        送ってくれた人に、新しいリンクを作ってもらってください。
      </p>
      <BackLinks />
    </Shell>
  );
}

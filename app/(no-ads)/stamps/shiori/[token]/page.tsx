import type { Metadata } from "next";
import Link from "next/link";

import ShioriView from "@/components/stamps/shiori/ShioriView";
import { AREAS_BASE } from "@/components/sightseeing/areas/areas";
import { DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo";
import { findShareOwner, loadShiori } from "@/lib/stamp-share";
import { STAMP_BOOK_HREF } from "@/lib/stamps";

/*
 * スタンプが押されるたびに中身が変わり、公開をやめたら即座に開けなくなって
 * いなければならない。auth() を読まないページなので、指定しないと最初に
 * 開かれたときの HTML がキャッシュされ続ける。
 */
export const dynamic = "force-dynamic";

const TITLE = "ロンドン旅のしおり";
const DESCRIPTION =
  "ロンドンで実際に行った観光スポット・美術館・ミュージカルを、スタンプ帳からエリアごとのしおりにしました。";

/*
 * 検索には出さない(リンクを渡された人だけが開くページ)。一方で LINE などで
 * 渡されるのが本来の使い方なので、共有カードの中身は用意する。
 *
 * タイトルと説明に持ち主の名前を入れない。招待リンク(/stamps/invite/…)と
 * 同じで、プレビューに拾われた名前は、渡した相手の外にも出ていく。
 * og:url も付けない(リンクそのものを共有カードの正規 URL として配らない)。
 */
export const metadata: Metadata = {
  title: `${TITLE} | ${SITE_NAME}`,
  description: DESCRIPTION,
  robots: { index: false, follow: true },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: SITE_NAME,
    type: "website",
    locale: "ja_JP",
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

/**
 * 旅のしおり。スタンプ帳の持ち主が、これからロンドンへ行く友人に渡すページ。
 *
 * ログインは要らない。読むのは友人で、アカウントを持っていないことのほうが
 * 多い。何を載せて何を載せないかは lib/stamp-share.ts の冒頭。
 */
export default async function ShioriPage({
  params,
}: {
  params: { token: string };
}) {
  const owner = await findShareOwner(params.token);
  if (!owner) return <ShioriGone />;

  const data = await loadShiori(owner.clerkId);

  return (
    <div className="mx-auto max-w-4xl py-6 sm:py-8">
      <ShioriView username={owner.username} data={data} />
    </div>
  );
}

/**
 * 公開をやめた・作り直したリンク。どちらだったかは言わない(持ち主が
 * 特定の相手に見せるのをやめた、ということが伝わってしまう)。
 */
function ShioriGone() {
  return (
    <div className="mx-auto max-w-2xl py-10 sm:py-12">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-rose-600 dark:text-rose-400">
        Travel Notes
      </p>
      <h1 className="mt-2 text-2xl font-semibold leading-snug">
        このしおりは開けません
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        リンクが古くなったか、公開が終わっています。送ってくれた人に、いまのリンクを聞いてみてください。
      </p>
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <Link
          href={AREAS_BASE}
          className="font-semibold text-rose-600 hover:underline dark:text-rose-400"
        >
          エリアガイドから歩く場所を探す
        </Link>
        <Link
          href={STAMP_BOOK_HREF}
          className="font-semibold text-rose-600 hover:underline dark:text-rose-400"
        >
          スタンプ帳について
        </Link>
      </div>
    </div>
  );
}

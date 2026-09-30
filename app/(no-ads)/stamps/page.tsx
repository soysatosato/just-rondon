import { auth } from "@clerk/nextjs/server";

import StampBook from "@/components/stamps/StampBook";
import StampBookIntro from "@/components/stamps/StampBookIntro";
import StampFriendsCard from "@/components/stamps/friends/StampFriendsCard";
import ShioriShareCard from "@/components/stamps/shiori/ShioriShareCard";
import { ensureProfile } from "@/lib/profile";
import { loadStampBook } from "@/lib/stamp-progress";
import { noindexMetadata } from "@/lib/seo";

export const metadata = noindexMetadata("スタンプ帳");

/**
 * スタンプ帳。押したスタンプと台紙の埋まり具合を出す、ログインした人だけのページ。
 *
 * auth() を読むので動的描画になる。ここは他人のスタンプを混ぜてはいけない
 * ページなので、キャッシュされないことが正しい。
 *
 * 見出しにユーザーネームを出す。登録するとまずここに着くので、Profile の行
 * (と自動で付く名前)もここで作られることが多い(lib/profile.ts)。
 */
export default async function StampsPage() {
  const { userId } = auth();

  if (!userId) return <StampBookIntro />;

  const [profile, data] = await Promise.all([
    ensureProfile(userId),
    loadStampBook(userId),
  ]);

  return (
    <div className="mx-auto max-w-4xl py-6 sm:py-8">
      <StampBook username={profile.username} data={data}>
        <ShioriShareCard userId={userId} stampCount={data.entries.length} />
        <StampFriendsCard userId={userId} />
      </StampBook>
    </div>
  );
}

import { Eye, EyeOff } from "lucide-react";

import ShioriLinkPanel from "@/components/stamps/shiori/ShioriLinkPanel";
import { findShareToken, shioriPath } from "@/lib/stamp-share";

/**
 * スタンプ帳(/stamps)に置く、旅のしおりの入口。
 *
 * これからロンドンへ行く友人に、自分が行った場所をしおりにして渡す。
 * しおりそのもの(/stamps/shiori/…)はログインしていない人も開けるページで、
 * 観光スポットはエリアごとにまとめ、エリアガイドとコラムを添えて見せる。
 *
 * 旅仲間(StampFriendsCard)と並べて置くが、役割が違う。旅仲間は2人とも
 * スタンプ帳を持っていて重ねて見るもの、しおりは相手がアカウントを
 * 持っていなくても渡せる片方向のもの。
 *
 * 自分でデータを引くサーバーコンポーネントにしてあるので、/stamps 側は
 * userId を渡して置くだけでよい。
 */
export default async function ShioriShareCard({
  userId,
  stampCount,
}: {
  userId: string;
  stampCount: number;
}) {
  const token = await findShareToken(userId);

  return (
    <section aria-labelledby="stamp-shiori-heading" className="space-y-4">
      {/* 見出しはスタンプ帳のほかの欄(StampBook の SectionHeading)と同じ形。 */}
      <div>
        <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-3 w-0.5 shrink-0 rounded-full bg-rose-500" />
          Travel Notes
        </p>
        <h2
          id="stamp-shiori-heading"
          className="mt-1.5 text-lg font-bold tracking-tight sm:text-xl"
        >
          旅のしおり
        </h2>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <div className="space-y-4 px-5 py-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            今度ロンドンへ行く友達に、行った場所をしおりにして渡せます。
            観光スポットはエリアごとにまとめ、歩き方のエリアガイドと、行く前に読むと面白いコラムを添えます。
            受け取った人は、ログインしなくても見られます。
          </p>
          <ShioriLinkPanel
            initialPath={token ? shioriPath(token) : null}
            canPublish={stampCount > 0}
          />
        </div>

        <ul className="space-y-2 border-t border-border bg-muted/30 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
          <li className="flex items-start gap-2">
            <Eye className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              しおりに載るのは、ユーザーネームと称号、スタンプを押した場所です。
              リンクを知っている人なら誰でも開けるので、渡す相手を選んでください。
            </span>
          </li>
          <li className="flex items-start gap-2">
            <EyeOff className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              押した日時と、現地で押した金のスタンプかどうかは載りません。検索エンジンにも出ません。
              リンクの作り直しと公開の停止は、いつでもここからできます。
            </span>
          </li>
        </ul>
      </div>
    </section>
  );
}

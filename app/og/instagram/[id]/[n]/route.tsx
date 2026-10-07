import db from "@/utils/db";
import { isIgCategory } from "@/lib/instagram/limits";
import { buildIgSlide, renderIgSlide } from "@/lib/instagram/render";

/**
 * Instagram のカルーセルの n 枚目(1〜5)を PNG で描く。
 *
 *   /og/instagram/<投稿id>/<n>?v=...          フィード用 1080x1350
 *   /og/instagram/<投稿id>/<n>?v=...&f=reel   リール用 1080x1920
 *
 * 管理ページ(/admin/instagram)の確認用と、運営者がスマホに保存して
 * Instagram アプリに入れる用。URL は lib/instagram/caption.ts の igSlideUrl で
 * 組む(?v= に原稿と記事の更新日時が入り、中身が変わると別URLになる)。
 *
 * /api/ ではなく /og/ の下に置くのは、他の共有カードと同じく robots.txt の
 * Disallow を避けるため。いまは使わないが、API で自動投稿する段階では
 * Instagram 側のサーバーがこのURLを取りに来る。
 */
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: { id: string; n: string } },
) {
  const post = await db.instagramPost.findUnique({
    where: { id: params.id },
    include: {
      content: {
        select: {
          category: true,
          engTitle: true,
          image: true,
          imageSource: true,
          imageCredit: true,
        },
      },
    },
  });
  if (!post || !isIgCategory(post.content.category)) {
    return new Response("Not found", { status: 404 });
  }

  const category = post.content.category;
  const slide = await buildIgSlide(post, category, Number(params.n));
  if (!slide) return new Response("Not found", { status: 404 });

  const format =
    new URL(request.url).searchParams.get("f") === "reel" ? "reel" : "feed";
  return renderIgSlide({ slide, category, format });
}

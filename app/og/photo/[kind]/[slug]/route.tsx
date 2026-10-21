import { ImageResponse } from "next/og";

import {
  OG_CACHE_CONTROL,
  OG_PHOTO_SIZES,
  isOgPhotoRatio,
  loadOgPhoto,
  photoCoverRect,
  type ReadingPhotoKind,
} from "@/lib/og";
import { VERTICAL_FOCUS } from "@/components/og/OgCard";
import {
  fetchAreaBySlug,
  fetchBritishEnglishBySlug,
  fetchColumnBySlug,
  fetchModernBritainBySlug,
} from "@/utils/actions/contents";

/**
 * 読み物の、文字を載せない写真だけの画像を1枚描く。
 *
 * 写真のある記事の og:image と、Article の JSON-LD の image がここを指す
 * (lib/og.ts の readingPhotoOgImage)。共有カード(/og/column/[slug] など)は
 * 見出しの文字が主役で、Google が Discover の画像に避けるよう書いている
 * 「文字の多い画像」に当たるため、X 向けの twitter:image にだけ残している。
 *
 * ?r= で比を選ぶ(16x9 / 4x3 / 1x1、既定は 16x9)。
 *
 * 写真の幅が足りないとき(Discover は幅1200px以上を求める)や取得に失敗した
 * ときは、同じ記事の共有カードへ一時リダイレクトする。画像を返さないと
 * SNS も Google もページの画像を失い、引き伸ばした写真を返すと粗い画像が
 * 検索結果に出る。リダイレクトはキャッシュさせず、次の取得で写真を試し直す。
 *
 * /api/ の下に置かない理由は app/og/british-english/[slug]/route.tsx と同じ
 * (robots.txt が /api/ を止めているので、Google も SNS も画像を取れない)。
 */
export const dynamic = "force-dynamic";

const FETCHERS: Record<
  ReadingPhotoKind,
  (slug: string) => Promise<{ image: string | null } | null>
> = {
  column: fetchColumnBySlug,
  "british-english": fetchBritishEnglishBySlug,
  "modern-britain": fetchModernBritainBySlug,
  areas: fetchAreaBySlug,
};

function isKind(value: string): value is ReadingPhotoKind {
  return Object.prototype.hasOwnProperty.call(FETCHERS, value);
}

/** 取りに行く写真の幅。記事の写真は 1280px のサムネイルで持っている。 */
const SOURCE_WIDTH = 1280;
/** これより狭い写真は描かない。Discover の画像の下限。 */
const MIN_WIDTH = 1200;

export async function GET(
  request: Request,
  { params }: { params: { kind: string; slug: string } },
) {
  if (!isKind(params.kind)) {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const ratioParam = url.searchParams.get("r");
  const box = OG_PHOTO_SIZES[isOgPhotoRatio(ratioParam) ? ratioParam : "16x9"];

  const content = await FETCHERS[params.kind](params.slug);
  const photo = await loadOgPhoto(content?.image, SOURCE_WIDTH);

  if (!photo || photo.width < MIN_WIDTH) {
    const card = new URL(
      `/og/${params.kind}/${encodeURIComponent(params.slug)}${url.search}`,
      url,
    );
    return new Response(null, {
      status: 307,
      headers: { location: card.toString(), "cache-control": "no-store" },
    });
  }

  const rect = photoCoverRect(photo, box, VERTICAL_FOCUS);

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: box.width,
          height: box.height,
          overflow: "hidden",
          backgroundColor: "#111827",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- satori が描く画像の中身で、ページの <img> ではない */}
        <img
          src={photo.src}
          alt=""
          width={rect.width}
          height={rect.height}
          style={{ position: "absolute", ...rect }}
        />
      </div>
    ),
    {
      ...box,
      // 小文字のキーで上書きする理由は lib/og-render.tsx の renderOgCard と同じ。
      headers: { "cache-control": OG_CACHE_CONTROL },
    },
  );
}

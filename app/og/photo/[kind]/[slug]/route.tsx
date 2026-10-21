import { ImageResponse } from "next/og";

import {
  OG_CACHE_CONTROL,
  OG_PHOTO_SIZES,
  isOgPhotoRatio,
  loadOgPhoto,
  photoCoverRect,
  type OgPhotoKind,
} from "@/lib/og";
import { DEFAULT_OG_IMAGE } from "@/lib/seo";
import { parseEventMonth } from "@/lib/events";
import { getMonthGuide } from "@/lib/london-months/content";
import { getEventGuide } from "@/lib/annual-events";
import { VERTICAL_FOCUS } from "@/components/og/OgCard";
import {
  fetchAreaBySlug,
  fetchBritishEnglishBySlug,
  fetchColumnBySlug,
  fetchModernBritainBySlug,
} from "@/utils/actions/contents";
import { fetchBriefBySlug } from "@/utils/actions/weekly";
import { fetchChangeIssueBySlug } from "@/utils/actions/changes";

/**
 * ページの、文字を載せない写真だけの画像を1枚描く。
 *
 * 写真のあるページの og:image と、Article の JSON-LD の image がここを指す
 * (lib/og.ts の photoOgImage)。共有カード(/og/column/[slug] など)は
 * 見出しの文字が主役で、Google が Discover の画像に避けるよう書いている
 * 「文字の多い画像」に当たるため、X 向けの twitter:image にだけ残している。
 *
 * ?r= で比を選ぶ(16x9 / 4x3 / 1x1、既定は 16x9)。
 *
 * 写真の幅が足りないとき(Discover は幅1200px以上を求める)や取得に失敗した
 * ときは、同じページの共有カード(無ければサイトの既定の画像)へ一時
 * リダイレクトする。画像を返さないと SNS も Google もページの画像を失い、
 * 引き伸ばした写真を返すと粗い画像が検索結果に出る。リダイレクトは
 * キャッシュさせず、次の取得で写真を試し直す。
 *
 * /api/ の下に置かない理由は app/og/british-english/[slug]/route.tsx と同じ
 * (robots.txt が /api/ を止めているので、Google も SNS も画像を取れない)。
 */
export const dynamic = "force-dynamic";

type PhotoSource = {
  /** その slug のページの写真の URL。無ければ null。 */
  photo: (slug: string) => Promise<string | null>;
  /** 写真が使えないときに回す画像のパス。 */
  fallback: (slug: string) => string;
};

const card = (section: string) => (slug: string) =>
  `/og/${section}/${encodeURIComponent(slug)}`;

/** 「◯月のロンドン」(/events/november)と年中行事ガイドは同じ /events/<slug>。 */
function eventPagePhoto(slug: string) {
  const month = parseEventMonth(slug);
  if (month !== null) return getMonthGuide(month)?.photo ?? null;
  return getEventGuide(slug)?.photo ?? null;
}

const SOURCES: Record<OgPhotoKind, PhotoSource> = {
  column: {
    photo: async (slug) => (await fetchColumnBySlug(slug))?.image ?? null,
    fallback: card("column"),
  },
  "british-english": {
    photo: async (slug) => (await fetchBritishEnglishBySlug(slug))?.image ?? null,
    fallback: card("british-english"),
  },
  "modern-britain": {
    photo: async (slug) => (await fetchModernBritainBySlug(slug))?.image ?? null,
    fallback: card("modern-britain"),
  },
  areas: {
    photo: async (slug) => (await fetchAreaBySlug(slug))?.image ?? null,
    fallback: card("areas"),
  },
  "events-week": {
    photo: async (slug) => (await fetchBriefBySlug(slug))?.image ?? null,
    fallback: card("events-week"),
  },
  changes: {
    photo: async (slug) => (await fetchChangeIssueBySlug(slug))?.image ?? null,
    fallback: card("changes"),
  },
  events: {
    photo: async (slug) => eventPagePhoto(slug)?.url ?? null,
    // 「◯月のロンドン」と行事ガイドには共有カードが無い。
    fallback: () => DEFAULT_OG_IMAGE,
  },
};

function isKind(value: string): value is OgPhotoKind {
  return Object.prototype.hasOwnProperty.call(SOURCES, value);
}

/** 取りに行く写真の幅。写真は 1280px のサムネイルで持っている。 */
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
  const source = SOURCES[params.kind];

  const photo = await loadOgPhoto(await source.photo(params.slug), SOURCE_WIDTH);

  if (!photo || photo.width < MIN_WIDTH) {
    const fallback = new URL(`${source.fallback(params.slug)}${url.search}`, url);
    return new Response(null, {
      status: 307,
      headers: { location: fallback.toString(), "cache-control": "no-store" },
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

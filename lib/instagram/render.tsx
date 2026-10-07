import { ImageResponse } from "next/og";

import {
  OG_CACHE_CONTROL,
  loadOgFonts,
  loadOgPhoto,
  ogFontOption,
  type OgPhoto,
} from "@/lib/og";
import {
  IG_FRAMES,
  IgSlide,
  igSlideText,
  type IgSlideInput,
} from "@/components/og/IgSlide";
import {
  IG_POINT_COUNT,
  IG_SLIDE_COUNT,
  parseIgPoints,
  type IgCategory,
} from "./limits";
import type { IgFormat } from "./caption";

/**
 * Instagram のカルーセルの1枚を PNG で返す。ルート
 * (app/og/instagram/[id]/[n]/route.tsx)とローカルの試し刷りの両方から呼ぶ。
 *
 * PNG のままにしている。手でアプリに入れる第1段階では PNG で足りる。
 * API で自動投稿する段階に進むときは JPEG が要る(Instagram の API は
 * JPEG しか受け付けない)ので、そのとき変換を足す。
 */
export async function renderIgSlide({
  slide,
  category,
  format,
}: {
  slide: IgSlideInput;
  category: IgCategory;
  format: IgFormat;
}) {
  const frame = IG_FRAMES[format];
  const fonts = await loadOgFonts(igSlideText(slide, category), [400, 700]);

  return new ImageResponse(<IgSlide slide={slide} category={category} frame={frame} />, {
    width: frame.width,
    height: frame.height,
    ...ogFontOption(fonts),
    // 小文字キーで上書きする理由は lib/og-render.tsx と同じ。
    headers: { "cache-control": OG_CACHE_CONTROL },
  });
}

/**
 * 表紙の写真。1080px 幅の版面に全面で敷くので、Wikimedia の 1920px 版を
 * 取りにいく。原本が 1920px より小さいと Wikimedia は 400 を返す
 * (原本より大きい縮小版は作らない)ので、1280px・960px と順に下げる。
 * 主画像は登録時に幅1200px以上を確かめてあり、1280px までには必ず当たる。
 */
async function loadIgPhoto(url: string | null): Promise<OgPhoto | null> {
  if (!url) return null;
  for (const width of [1920, 1280, 960]) {
    const photo = await loadOgPhoto(url, width);
    if (photo) return photo;
  }
  return null;
}

export type IgPostForSlides = {
  coverHead: string;
  coverTail: string | null;
  points: unknown;
  closingTitle: string;
  closingBody: string;
  content: {
    engTitle: string | null;
    image: string | null;
    imageSource: string | null;
    imageCredit: string | null;
  };
};

/**
 * 投稿の n 枚目(1〜5)を版面の入力にする。範囲外や原稿が崩れていれば null。
 *
 * 表紙の型は記事のカテゴリで決める。イギリス英語は写真を使わない
 * (記事に写真があっても)。語を主役にするのが共有カードと同じ方針で、
 * 写真のクレジットも要らなくなる。
 */
export async function buildIgSlide(
  post: IgPostForSlides,
  category: IgCategory,
  n: number,
): Promise<IgSlideInput | null> {
  if (!Number.isInteger(n) || n < 1 || n > IG_SLIDE_COUNT) return null;

  if (n === 1) {
    if (category === "british-english") {
      return {
        type: "cover",
        head: post.coverHead,
        tail: post.coverTail,
        word: post.content.engTitle?.trim() || null,
        photo: null,
        credit: null,
      };
    }
    const photo = await loadIgPhoto(post.content.image);
    return {
      type: "cover",
      head: post.coverHead,
      tail: post.coverTail,
      word: null,
      photo,
      credit:
        photo && post.content.imageSource === "commons"
          ? post.content.imageCredit
          : null,
    };
  }

  if (n <= IG_POINT_COUNT + 1) {
    const points = parseIgPoints(post.points);
    if (!points) return null;
    return { type: "point", page: n, point: points[n - 2] };
  }

  return { type: "closing", title: post.closingTitle, body: post.closingBody };
}

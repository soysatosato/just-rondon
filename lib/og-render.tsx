import { ImageResponse } from "next/og";

import {
  OG_CACHE_CONTROL,
  OG_SIZE,
  loadOgFonts,
  loadOgPhoto,
  ogFontOption,
  ogPlainText,
  splitOgHeadline,
} from "@/lib/og";
import {
  OG_THEMES,
  OgCard,
  ogCardText,
  truncateOg,
  type OgCardInput,
  type OgThemeName,
} from "@/components/og/OgCard";

/**
 * OGカードを1枚描いて PNG のレスポンスにする。
 *
 * セクションごとのルートはここを呼ぶだけにしてある。フォントの取得、
 * 写真の取得、キャッシュヘッダーは、どのカードでも同じでないと
 * 片方だけ豆腐になったり片方だけキャッシュが効かなかったりするため。
 */
export async function renderOgCard(input: OgCardInput) {
  const fonts = await loadOgFonts(ogCardText(input), [400, 700]);

  return new ImageResponse(<OgCard {...input} />, {
    ...OG_SIZE,
    ...ogFontOption(fonts),
    // ImageResponse 側の既定ヘッダーと同じ小文字キーで上書きする。
    // "Cache-Control" と大文字で書くと別キー扱いで両方が残り、
    // カンマで連結された壊れた値が配信される。
    headers: { "cache-control": OG_CACHE_CONTROL },
  });
}

/** 左パネルに敷く写真の実寸。パネル幅より少し大きい許可幅を取る。 */
const PHOTO_WIDTH = 500;

/**
 * 読み物1本ぶんのカード。
 *
 * 見出しは「つかみ——何の話か」で割って、前を大きく後ろを小さく組む。
 * 割れない見出しのときだけ、後ろに要約を回す。どちらも無いカードは
 * つかみだけになるが、それでもロゴ1枚よりは何の記事か分かる。
 */
export async function renderArticleOgCard({
  content,
  badge,
  theme,
  glyph,
}: {
  content: {
    title: string;
    summary: string | null;
    mainText: string | null;
    image: string | null;
  } | null;
  badge: string;
  theme: OgThemeName;
  glyph: string;
}) {
  const title = content?.title?.trim() || badge;
  const { head, tail } = splitOgHeadline(title);

  const fallbackTail = content
    ? ogPlainText(content.summary || content.mainText || "", 54)
    : "";

  return renderOgCard({
    badge,
    // 3行に収まる上限。これを超える見出しは実在しないが、将来長いものが
    // 入っても版面が崩れないように切る。
    head: truncateOg(head, 44),
    tail: tail ? truncateOg(tail, 54) : fallbackTail || null,
    glyph,
    photo: await loadOgPhoto(content?.image, PHOTO_WIDTH),
    theme: OG_THEMES[theme],
  });
}

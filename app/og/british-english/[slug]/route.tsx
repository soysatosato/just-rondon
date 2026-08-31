import { ImageResponse } from "next/og";

import {
  OG_CACHE_CONTROL,
  OG_SIZE,
  loadOgFonts,
  ogFontOption,
  ogPlainText,
} from "@/lib/og";
import { fetchBritishEnglishBySlug } from "@/utils/actions/contents";

/**
 * 「イギリス英語」記事のSNS共有カードを1枚ずつ描く。
 *
 * 記事に画像を用意していないため、共有すると全記事が同じロゴ画像になり、
 * タイムライン上で何の話か分からなかった。このセクションの主役は英単語そのもの
 * なので、その語を大きく置いたカードを記事ごとに生成する。
 *
 * ファイル規約(opengraph-image.tsx)ではなくルートハンドラにしているのは、
 * 規約側の画像はページが openGraph.images を持っていると無視される仕様で
 * (next/dist/lib/metadata/resolve-metadata.js)、このサイトの metadata は
 * すべて buildPageMetadata が images を必ず設定するため。
 * メタデータの組み立て口を1つに保ったまま使えるURLの形にしてある。
 *
 * /api/ の下に置いていないのは robots.txt が Disallow: /api/ を出しているため。
 * Twitterbot も facebookexternalhit も robots.txt に従うので、そこに置くと
 * 画像の取得自体を拒否され、共有カードが無画像になる。
 */

/**
 * 都度描画する。URLに記事の updatedAt を ?v= として付けており、
 * 同じURLの中身は変わらない前提でCDNに immutable で持たせる。
 * ルートキャッシュ(revalidate)に任せると、キーがパスだけで ?v= を見ないため
 * 記事を直しても最大1時間は古いカードが配られる。
 */
export const dynamic = "force-dynamic";

const BADGE = "BRITISH ENGLISH";
const SITE = "ジャスト・ロンドン";
const DOMAIN = "just-rondon.com";

/** 英単語の見出し。長い言い回し(Bob's your uncle 等)でも1〜2行に収める。 */
function engTitleSize(text: string): number {
  if (text.length <= 8) return 118;
  if (text.length <= 14) return 94;
  if (text.length <= 20) return 74;
  if (text.length <= 30) return 56;
  return 44;
}

/** 日本語見出し。全角前提なので英語より刻みが細かい。 */
function titleSize(text: string): number {
  if (text.length <= 14) return 46;
  if (text.length <= 22) return 38;
  if (text.length <= 34) return 32;
  // このセクションの見出しは1文まるごとの長いものが多い。48字までなら
  // この大きさで2行に収まるので、途中で切らずに最後まで読ませる。
  return 30;
}

function truncate(text: string, maxLength: number): string {
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const content = await fetchBritishEnglishBySlug(params.slug);

  const eng = content?.engTitle?.trim() || "";
  const title = truncate(content?.title?.trim() || "イギリス英語", 48);
  // 1行に収まる長さで切る。2行に伸ばすと下のサイト名と詰まって窮屈になる。
  const summary = content
    ? ogPlainText(content.summary || content.mainText || "", 38)
    : "単語・言い回し・スラングを毎日1つ。";

  // engTitle が無い記事は日本語の見出しを主役にする。
  const heroText = eng || title;
  const heroSize = eng ? engTitleSize(eng) : 64;

  const fonts = await loadOgFonts(
    [BADGE, heroText, eng ? title : "", summary, SITE, DOMAIN].join(""),
    [400, 700]
  );

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#fffdfc",
          backgroundImage:
            "linear-gradient(135deg, #fff1f2 0%, #ffffff 48%, #fff7ed 100%)",
        }}
      >
        {/* 記事ページのヘッダーにある淡いローズの丸。ぼかしは satori が
            扱えないので、薄い塗りの大きな円で近い印象を作る。 */}
        <div
          style={{
            position: "absolute",
            top: -150,
            right: -110,
            width: 460,
            height: 460,
            borderRadius: 460,
            backgroundColor: "rgba(244, 63, 94, 0.10)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -190,
            left: -150,
            width: 360,
            height: 360,
            borderRadius: 360,
            backgroundColor: "rgba(56, 189, 248, 0.10)",
          }}
        />

        {/* 本文ページの引用ブロックと同じ、左端の赤いレール */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 18,
            height: "100%",
            backgroundImage: "linear-gradient(180deg, #dc2626 0%, #f43f5e 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "62px 76px 56px 94px",
          }}
        >
          <div style={{ display: "flex" }}>
            <div
              style={{
                display: "flex",
                backgroundColor: "#dc2626",
                color: "#ffffff",
                fontSize: 24,
                fontWeight: 700,
                letterSpacing: "6px",
                padding: "12px 26px",
                borderRadius: 999,
              }}
            >
              {BADGE}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                color: "#e11d48",
                fontSize: heroSize,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-1px",
              }}
            >
              {heroText}
            </div>

            {eng && (
              <div
                style={{
                  display: "flex",
                  marginTop: 22,
                  color: "#111827",
                  fontSize: titleSize(title),
                  fontWeight: 700,
                  lineHeight: 1.35,
                }}
              >
                {title}
              </div>
            )}

            {summary && (
              <div
                style={{
                  display: "flex",
                  marginTop: 20,
                  color: "#6b7280",
                  fontSize: 25,
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}
              >
                {summary}
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{ display: "flex", color: "#111827", fontSize: 26, fontWeight: 700 }}
            >
              {SITE}
            </div>
            <div
              style={{ display: "flex", color: "#9ca3af", fontSize: 24, fontWeight: 400 }}
            >
              {DOMAIN}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      ...ogFontOption(fonts),
      // ImageResponse 側の既定ヘッダーと同じ小文字キーで上書きする。
      // "Cache-Control" と大文字で書くと別キー扱いで両方が残り、
      // カンマで連結された壊れた値が配信される。
      headers: { "cache-control": OG_CACHE_CONTROL },
    }
  );
}

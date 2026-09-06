import { OG_CARD_VERSION, OG_SIZE } from "@/lib/og";
import type { OgThemeName } from "@/components/og/OgCard";

/**
 * ハブページのSNS共有カード。
 *
 * 記事と違ってハブには挿絵が無く、これまでは全ページ共通のロゴ(810x665)が
 * 出ていた。1200x630 ではないのでXではほぼ正方形に切られ、どのハブを
 * 共有しても同じ絵になる——ユーザーの言う「サイトのアイコンだけ」がこれ。
 *
 * 文面は各ハブの h1 とリード文から取る。カード用に別の言葉を考えると、
 * ページを書き換えたときにカードだけ古い言葉のまま残るため。
 */

export const OG_HUBS = {
  column: {
    badge: "COLUMN",
    head: "イギリスは、掘るほど面白い",
    tail: "歴史・文化・伝統・制度にまつわる読み物コラム。毎日更新。",
    glyph: "掘",
    theme: "column",
  },
  "british-english": {
    badge: "BRITISH ENGLISH",
    head: "イギリス英語は、ちょっとひねくれてる",
    tail: "単語・言い回し・スラングを1つずつ。由来と使い方、米語との違いまで。",
    glyph: "英",
    theme: "british-english",
  },
  "modern-britain": {
    badge: "BRITAIN, ARGUED",
    head: "そのニュースは、何を意味するのか",
    tail: "最新の英国ニュースを、背景・制度・歴史から読み解く時事論考。",
    glyph: "今",
    theme: "modern-britain",
  },
  reading: {
    badge: "READING BRITAIN",
    head: "英国を読む",
    tail: "歴史を辿り、いまを論じ、言葉を味わう。ガイドブックが終わるところから。",
    glyph: "読",
    theme: "reading",
  },
} satisfies Record<
  string,
  {
    badge: string;
    head: string;
    tail: string;
    glyph: string;
    theme: OgThemeName;
  }
>;

export type OgHubSlug = keyof typeof OG_HUBS;

/**
 * ハブのカードURL。パスは app/og/hub/[slug]/route.tsx と対。
 *
 * 中身は文面を書き換えたときにしか変わらないので、?v= は意匠の
 * バージョンだけでよい。記事のように updatedAt を持たない。
 */
export function hubOgImage(slug: OgHubSlug) {
  return {
    url: `/og/hub/${slug}?v=${OG_CARD_VERSION}`,
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    alt: `${OG_HUBS[slug].head} | ジャスト・ロンドン`,
  };
}

import { OG_CARD_VERSION, OG_SIZE } from "@/lib/og";
import { CURRENT_TAX_YEAR } from "@/lib/money/take-home/tax-years";
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
  history: {
    badge: "A HISTORY OF BRITAIN",
    head: "イギリスの歴史 全10章",
    tail: "ローマの城壁からEU離脱まで。各章に、実際に立てる場所をつけました。",
    glyph: "史",
    theme: "history",
  },
  reading: {
    badge: "READING BRITAIN",
    head: "英国を読む",
    tail: "歴史を辿り、いまを論じ、言葉を味わう。ガイドブックが終わるところから。",
    glyph: "読",
    theme: "reading",
  },
  /*
    読み物のハブではないが、挿絵を持たない点は同じなので同じ版面を使う。
    文面に年度が入るため、hubOgImage には年度を revision として渡す
    (年度を更新したとき、SNS に残った去年のカードを外すため)。
  */
  "salary-calculator": {
    badge: "TAKE-HOME PAY",
    head: "イギリスの手取り計算機",
    tail: `年収・時給を入れると、${CURRENT_TAX_YEAR.label}年度の所得税・NI・年金・学生ローンを引いた手取りが出ます。`,
    glyph: "£",
    theme: "money",
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
 * 文面が定期的に変わるカード(年度を含む計算機など)だけ revision を渡す。
 */
export function hubOgImage(slug: OgHubSlug, revision?: string) {
  return {
    url: `/og/hub/${slug}?v=${OG_CARD_VERSION}${revision ? `-${revision}` : ""}`,
    width: OG_SIZE.width,
    height: OG_SIZE.height,
    alt: `${OG_HUBS[slug].head} | ジャスト・ロンドン`,
  };
}

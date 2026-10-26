/**
 * 広告を出してはいけないパスの判定。
 *
 * AdSense は「コンテンツの無いページ」への掲載をポリシー違反として扱う。
 * 入力フォーム・送信完了画面・ログイン後のツール画面がこれにあたり、
 * 読み物としての本文を持たないので広告の掲載面にしてはいけない。
 *
 * app/(with-ads)/layout.tsx は配下すべてに広告枠を1つ置く。その配下に
 * jobs/service-charges の survey(フォーム)・thanks(送信完了)・
 * dashboard(集計ツール)が含まれているため、レイアウト側は
 * 「どのパスに居るか」を知る必要がある。サーバーコンポーネントからは
 * pathname を読めないので、判定はクライアント側の広告コンポーネントで行う。
 * AdSense 本体の読み込み(components/ads/AdSenseLoader.tsx)も同じ判定を使う。
 *
 * ここを増やすときは、noindexMetadata を付けているページと対応させること。
 * 検索結果に出さないと決めたページは、広告の掲載面にもしない。
 */

/**
 * 広告を出さないパスの接頭辞。
 *
 * 前方一致で見るので、配下のページ(dashboard/[id] や dashboard/voices)も
 * まとめて対象になる。
 */
const AD_FREE_PREFIXES = [
  "/jobs/service-charges/survey",
  "/jobs/service-charges/thanks",
  "/jobs/service-charges/dashboard",
] as const;

import { unwrittenMonthPaths } from "@/lib/london-months/written-months";

/**
 * そのパスちょうどにだけ広告を出さないページ。
 *
 * 「◯月のロンドン」のうち本文をまだ書いていない月(noindex)。
 * どの月が該当するかは lib/london-months/written-months.js が決める。
 */
const AD_FREE_PATHS: readonly string[] = unwrittenMonthPaths();

/**
 * 配下のページだけ広告を出さないパス。そのパス自体(一覧)には出す。
 *
 * 店舗別サービスチャージは、一覧(/jobs/service-charges/stores)が
 * 検索から店名で来た人を受ける本文のあるページで、各店舗のページは
 * 中身が薄いので全店 noindex にしてある。
 */
const AD_FREE_CHILDREN_OF = ["/jobs/service-charges/stores"] as const;

/**
 * 形で決まる広告を出さないページ。
 *
 * 美術館の作品ページ(/museums/<館>/artworks/<id>)。DB から館ごとに数百件ずつ
 * 生える作品の解説で、全件 noindex にしてある
 * (app/museums/[slug]/artworks/[id]/page.tsx)。作品の一覧(/artworks)と
 * 館のページには出す。
 */
const AD_FREE_PATTERNS: readonly RegExp[] = [
  /^\/museums\/[^/]+\/artworks\/[^/]+$/,
];

/**
 * このパスに広告を出してよいか。
 *
 * pathname が null(初回レンダリング等)のときは false を返す。
 * 判定が付かないうちに出してしまうより、出さないほうが安全なため。
 */
export function allowsAds(pathname: string | null): boolean {
  if (!pathname) return false;

  if (
    AD_FREE_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  ) {
    return false;
  }
  if (AD_FREE_PATHS.includes(pathname)) return false;
  if (AD_FREE_PATTERNS.some((pattern) => pattern.test(pathname))) return false;
  return !AD_FREE_CHILDREN_OF.some((parent) =>
    pathname.startsWith(`${parent}/`)
  );
}

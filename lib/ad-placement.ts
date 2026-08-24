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
 *
 * ここを増やすときは、noindexMetadata を付けているページと対応させること。
 * 検索結果に出さないと決めたページは、広告の掲載面にもしない。
 */

/**
 * 広告を出さないパスの接頭辞。
 *
 * 前方一致で見るので、配下のページ(dashboard/[id] や dashboard/archive)も
 * まとめて対象になる。
 */
const AD_FREE_PREFIXES = [
  "/jobs/service-charges/survey",
  "/jobs/service-charges/thanks",
  "/jobs/service-charges/dashboard",
] as const;

/**
 * このパスに広告を出してよいか。
 *
 * pathname が null(初回レンダリング等)のときは false を返す。
 * 判定が付かないうちに出してしまうより、出さないほうが安全なため。
 */
export function allowsAds(pathname: string | null): boolean {
  if (!pathname) return false;

  return !AD_FREE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

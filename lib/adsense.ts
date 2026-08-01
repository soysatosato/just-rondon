export const ADSENSE_CLIENT = "ca-pub-7128094501931852";

/**
 * AdSense管理画面「広告 > 広告ユニットごと」で作成したスロットIDを貼る。
 *
 * 環境変数にしないのは、パブリッシャーID・スロットIDはどうせHTMLに出る公開値で
 * 秘匿の必要が無い一方、Vercel側で入れ忘れると「ビルドエラー無しに収益が全損」する
 * ため。git管理・型チェック・grep可能なリテラルで持つ方が安全。
 *
 * 空文字の間 AdSenseUnit は null を返すので、IDが未発行でも安全にデプロイできる。
 */
export const AD_SLOTS = {
  /** 記事本文中(レスポンシブ ディスプレイ広告) */
  inArticle: "",
  /** 記事末尾 */
  articleBottom: "",
  /** 一覧・ハブページ */
  listing: "",
} as const;

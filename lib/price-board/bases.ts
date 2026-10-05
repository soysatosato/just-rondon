/**
 * 物価ボード(/prices)の「数字の基準」。
 *
 * 物価の数字は、何を数えたものかで簡単に倍違う。パブの1パイントは
 * Wetherspoon なら£3、ソーホーなら£8で、どちらも嘘ではない。だから
 * このボードは全品目に「何の数字か」と「なぜそれを基準にしたか」を付ける。
 * 画面では各行に短い名前だけを出し、ここの説明はページ末尾にまとめる
 * (行ごとに説明を並べると、表が読めなくなる)。
 *
 * 基準を足すときの優先順位:
 *   1. 公式価格・法定額(値札そのもの)
 *   2. ONS の統計(ロンドンの値が取れるもの)
 *   3. 公表されている指数(SpareRoom のように、公的統計に無いもの)
 *   4. どれも無ければ「目安」と明記する
 */

export type PriceBasisId =
  | "official"
  | "statutory"
  | "onsQuotes"
  | "onsRent"
  | "spareRoom"
  | "ofgem"
  | "mhclg"
  | "estimate";

export type PriceBasis = {
  id: PriceBasisId;
  /** 行に出す短い名前。 */
  name: string;
  /** 何の数字か。1文。 */
  what: string;
  /** なぜこれを基準にするか(妥当性と限界)。1文。 */
  why: string;
  /** 基準そのものの説明ページ。品目ごとの出典は items.ts の sourceUrl。 */
  url?: string;
};

export const PRICE_BASES: Record<PriceBasisId, PriceBasis> = {
  official: {
    id: "official",
    name: "公式価格",
    what: "運営者・施設・チェーンが自ら公表している価格。",
    why: "値札そのものなので、いつ誰が調べても同じ値になります。",
  },
  statutory: {
    id: "statutory",
    name: "法定額",
    what: "法律や政府の決定で決まっている額。",
    why: "全国一律で、年度の途中では変わりません。",
  },
  onsQuotes: {
    id: "onsQuotes",
    name: "ONS 店頭価格調査",
    what: "英国統計局(ONS)が物価指数を作るために毎月店頭で集めている価格のうち、ロンドン分の中央値。",
    why: "公式の物価統計の元データで、特定の店や銘柄に偏りません。",
    url: "https://www.ons.gov.uk/economy/inflationandpriceindices/datasets/consumerpriceindicescpiandretailpricesindexrpiitemindicesandpricequotes",
  },
  onsRent: {
    id: "onsRent",
    name: "ONS 家賃統計",
    what: "ONS が毎月出す、ロンドンの民間賃貸の平均家賃(契約中の物件を含む)。",
    why: "英国の家賃の公式統計です。既存の契約を含むぶん、いま募集中の物件の提示額より低めに出ます。",
    url: "https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/privaterentandhousepricesuk/latest",
  },
  spareRoom: {
    id: "spareRoom",
    name: "SpareRoom 指数",
    what: "ルームシェア募集サイト最大手の SpareRoom が四半期ごとに出す、募集広告の家賃の平均(光熱費込み)。",
    why: "部屋単位の家賃は政府統計に無く、Time Out など英国のメディアもこの指数を引用しています。",
    url: "https://www.spareroom.co.uk/content/info-landlords/rentalindex/",
  },
  ofgem: {
    id: "ofgem",
    name: "Ofgem 料金上限",
    what: "規制当局 Ofgem が3か月ごとに決める料金上限で計算した、典型的な使用量の世帯の年額(ガス＋電気)。",
    why: "大手の標準プランはこの上限どおりの単価なので、ほぼ実勢です。請求額は使用量しだいで変わります。",
    url: "https://www.ofgem.gov.uk/information-consumers/energy-advice-households/energy-price-cap-unit-rates-and-standing-charges",
  },
  mhclg: {
    id: "mhclg",
    name: "政府統計",
    what: "住宅・コミュニティ・地方自治省(MHCLG)が毎年集計する、ロンドン全区の平均。",
    why: "全区の公式の税額から出した平均です。実際の額は区と band で倍以上変わります。",
    url: "https://www.gov.uk/government/statistics/council-tax-levels-set-by-local-authorities-in-england-2026-to-2027",
  },
  estimate: {
    id: "estimate",
    name: "目安",
    what: "公式の統計も公表価格も無い品目。編集部が複数の店やサイトの価格から置いた見積もり。",
    why: "店と時期で幅が大きいので、予算の当たりをつける程度に使ってください。",
  },
};

/** 末尾の「数字の基準」に並べる順番。 */
export const PRICE_BASIS_ORDER: PriceBasisId[] = [
  "official",
  "statutory",
  "onsQuotes",
  "onsRent",
  "spareRoom",
  "ofgem",
  "mhclg",
  "estimate",
];

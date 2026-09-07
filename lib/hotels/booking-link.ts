/**
 * 宿泊エリアを決めた読者を、そのエリアの検索結果へ送り出す。
 *
 * このページは13エリアから1つを選ばせるところまでやって終わっていた。
 * 読者はそのあと予約サイトを開き、また「ロンドン」で検索し直す。
 * せっかく決めた答えが引き継がれず、振り出しに戻っていた。
 *
 * 設計メモ:
 *
 * 1. **APIは使わない。** Booking.com の Demand API は Managed Affiliate
 *    Partner の契約が前提で個人サイトには開かれておらず、規約(General
 *    Partner Terms v5)は AI を使った運用に書面承認を求めている。
 *    一方、検索URLのクエリパラメータは公開仕様で、リンクを組むだけなら
 *    何の審査も要らない。ここでやりたいのは「エリアを引き継ぐ」ことだけ
 *    なので、リンクで足りる。
 *
 * 2. **nflt(設備フィルタ)は使わない。** ツイン・エレベーター・エアコンで
 *    絞れると便利だが、nflt のコード体系は非公開で予告なく変わる。
 *    間違ったコードを送ると「絞ったつもりで絞れていない」か、最悪
 *    無関係な条件で絞られた一覧を見せることになる。壊れたときに
 *    こちらから気づけない種類の壊れ方なので、採らない。
 *    代わりに **BOOKING_FILTER_VOCAB で英語のフィルタ名を渡す。**
 *    このページは twin/lift/air conditioning が罠だと知っているのだから、
 *    予約サイトで自分でチェックを入れられるだけの語彙を持たせるほうが、
 *    こちらでURLに埋め込むより確実で、しかも他の予約サイトでも使える。
 *
 * 3. **日付は入れない。** 静的ページなので読者の日程を知らない。
 *    省くと Booking.com 側が日付を尋ねる。適当な日付を埋めて
 *    「その日程の値段」を見せてしまうより正しい。
 *
 * 4. **aid(アフィリエイトID)は付けていない。** 収益化する場合はASP経由で
 *    取得したIDを AFFILIATE_ID に入れれば、全リンクに一括で乗る。
 *    現時点で空にしてあるのは、AdSense が低価値コンテンツ判定で
 *    再審査待ちのため。審査を通してから付けること。
 */

/** ASPで取得したアフィリエイトID。空のあいだは素のリンクを出す。 */
const AFFILIATE_ID = "";

/**
 * エリアid → Booking.com に渡す地区名。
 *
 * 日本語のエリア名は検索に通らないので英語で持つ。content.ts の
 * Area.id と一対一で対応させること。「, London」まで付けるのは、
 * Bloomsbury や Greenwich のように英国内の他所と同名の地名があるため。
 */
export const AREA_SEARCH_TERMS: Record<string, string> = {
  westminster: "Westminster, London",
  "covent-garden": "Covent Garden, London",
  "south-ken": "South Kensington, London",
  bloomsbury: "Bloomsbury, London",
  "kings-cross": "King's Cross, London",
  paddington: "Paddington, London",
  city: "City of London, London",
  southbank: "South Bank, London",
  marylebone: "Marylebone, London",
  shoreditch: "Shoreditch, London",
  bayswater: "Bayswater, London",
  greenwich: "Greenwich, London",
  stratford: "Stratford, London",
};

/**
 * そのエリアの検索結果URLを組む。
 *
 * dest_type=district を付けて「地区」として解釈させる。付けないと
 * 同名のホテルや駅に吸われることがある。
 */
export function bookingSearchUrl(areaId: string): string | null {
  const term = AREA_SEARCH_TERMS[areaId];
  if (!term) return null;

  const params = new URLSearchParams({
    ss: term,
    dest_type: "district",
    lang: "ja",
    selected_currency: "JPY",
    group_adults: "2",
    no_rooms: "1",
    group_children: "0",
  });
  if (AFFILIATE_ID) params.set("aid", AFFILIATE_ID);

  return `https://www.booking.com/searchresults.ja.html?${params.toString()}`;
}

/**
 * 予約サイトでチェックすべき英語のフィルタ名。
 *
 * 本文の「日本の常識と違うところ」で挙げている落とし穴と対応している。
 * 知識を持って帰れる形にするのがここの役割で、URLに埋めるのとは違い
 * Booking.com 以外でも使える。
 */
export const BOOKING_FILTER_VOCAB = [
  {
    en: "Twin beds",
    ja: "ベッド2台",
    why: "「double」はダブルベッド1台。ベッドを分けたいなら必ずこれで絞る",
  },
  {
    en: "Lift / Elevator",
    ja: "エレベーター",
    why: "無い宿が普通にある。スーツケースがあるなら必須",
  },
  {
    en: "Air conditioning",
    ja: "エアコン",
    why: "夏に渡航するなら確認する。無い宿が多い",
  },
  { en: "Bathtub", ja: "バスタブ", why: "シャワーのみが標準。湯船が要るなら指定する" },
  { en: "Family rooms", ja: "家族部屋", why: "3人以上で泊まるなら。数が少ない" },
  {
    en: "Kitchen / Kitchenette",
    ja: "キッチン",
    why: "サービスアパートメントを探すとき。長期滞在向け",
  },
] as const;

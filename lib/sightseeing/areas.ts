/**
 * エリアガイド(/sightseeing/areas)の基準時点。
 *
 * エリアガイドは金額をほとんど持たない(入場料は各スポットの詳細ページ、
 * 交通費は lib/transport/rates.ts が持つ)ので、このファイルが持つのは
 * 鮮度の日付と、記事を跨いで使う「歩く時間」の目安だけ。
 *
 * ここに入場料や運賃を書き足さないこと。エリアガイドで金額を出したく
 * なったら、それは各スポットの詳細ページか /sightseeing/budget の
 * 仕事になる。二重管理すると必ず片方が古くなる。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const AREA_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const AREA_UPDATED_AT = "2026-08-13";

/**
 * マーケットの開催曜日。
 *
 * ショーディッチとグリニッジの回遊は曜日で成否が決まる。
 * 「行ってみたら閉まっていた」が最も起きやすい失敗なので、
 * 記事とハブの両方から同じ定数を参照する。
 */
export const MARKET_DAYS = {
  columbiaRoadFlower: "日曜のみ（8:00〜15:00頃）",
  oldSpitalfields: "毎日（木・日が最も規模が大きい）",
  brickLane: "日曜が中心（土曜も一部）",
  greenwich: "水〜日（火曜は休み）",
  borough: "月〜土（月・火は規模が小さい）",
} as const;

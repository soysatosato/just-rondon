/**
 * 「時間別の回り方」。持ち時間が1時間・2〜3時間・半日のとき、それぞれ
 * どこを、どの順で、何分ずつ見るかを書いた順路。
 *
 * 「◯◯ 所要時間」で検索して来る人は、行く日が決まっていて時間配分を
 * 決めたい人。所要時間の目安(Attraction.durationText)だけでは
 * 「1時間しかないなら何を見るか」に答えられないので、段ごとの順路で答える。
 *
 * 着いてからの歩き方(AttractionVisitStep / MuseumVisitStep)との違い:
 * 歩き方は「なぜそれを見るか」を語る読み物で、こちらは早見表。
 * 同じ作品が両方に出てよいが、こちらの note は1〜2文に抑える。
 *
 * DB ではなくコードに置いているのは、「◯月のロンドン」(lib/london-months)や
 * 年中行事のガイド(lib/annual-events)と同じ理由で、確認日と出典を本文の
 * 隣に置き、差分で読めるようにするため。部屋番号は展示替えで動くので、
 * 直すときは必ず公式で確かめ直し、checkedAt と sources も一緒に更新すること。
 *
 * マークダウンにはしない。表示側はプレーンテキストとして描く。
 */

export type RouteSource = { label: string; url: string };

/** 順路の1地点。 */
export type RouteStop = {
  /** 何を見るか。作品なら「作者『題名』」。 */
  title: string;
  /**
   * どこにあるか。館内の表示どおりに書く("Room 43"、"Level 2"、
   * "Ground floor")。英国の Ground floor は日本の1階にあたるが、
   * 現地の案内板と照らし合わせられるよう、日本式には直さない。
   */
  where: string;
  /** その地点で使う目安の分数。地点間の移動は含めない。 */
  minutes: number;
  /** 1〜2文。何を見るのか、なぜ寄るのか。期限のある事実は日付つきで書く。 */
  note: string;
  /**
   * サイト内のページ(作品ページ、近くのスポット)。
   * 作品は /museums/<館>/artworks/<id>。存在しないIDを書くと404になるので、
   * 足したら scripts/check-time-routes.ts で確かめる。
   */
  href?: string;
};

/** 持ち時間ひとつ分の順路。 */
export type TimeRoute = {
  /** 段の名前。「1時間」「2〜3時間」「半日」。タブの見出しになる。 */
  label: string;
  /**
   * 旅程(/plan)に入れるときの滞在分数。
   * 地点の minutes の合計に移動を足した値で、label と食い違わないこと。
   */
  minutes: number;
  /**
   * この段を1文で。観光ページ側の短い答えにもそのまま出るので、
   * 地点の名前を具体的に入れる。
   */
  summary: string;
  stops: RouteStop[];
  /** 段の最後に添える一言(時間が余ったら、など)。任意。 */
  tip?: string;
};

export type TimeRouteGuide = {
  /**
   * Attraction の slug。
   * 旅程は Attraction を単位にしているので、「この配分で旅程に入れる」は
   * 美術館ページに出すときもこの slug で入れる。
   */
  attractionSlug: string;
  /**
   * 美術館側(/museums/<slug>)の slug。あれば順路はそのページに出す。
   * 観光側の URL はそのページへ転送している(lib/museum-attraction-pairs.js)。
   * 対応表と一致させること。
   */
  museumSlug?: string;
  /**
   * 見出しのすぐ下に置く1文の答え。「◯◯ 所要時間」への答えそのもの。
   * 段の label をすべて含めて書く。
   */
  answer: string;
  /** 短い順。 */
  routes: TimeRoute[];
  /** 全段に共通する注意(入口・開館時間・閉室)。1要素1〜2文、3つまで。 */
  notes: string[];
  /** 公式の館内図や見学案内。ページから外部リンクで出す。 */
  map?: RouteSource;
  sources: RouteSource[];
  /** 公式の情報で最後に確かめた日("YYYY-MM-DD")。ページに出す。 */
  checkedAt: string;
};

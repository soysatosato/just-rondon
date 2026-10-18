/**
 * ロンドンのクリスマスマーケット(/sightseeing/christmas-markets)。
 *
 * 以前はマーケットごとに詳細ページ(/christmas-markets/<slug>)があったが、
 * 2026-10 にこのハブ1本へまとめた。どのページも同じ型の約500字で、会期は
 * 「例年◯月」としか書けておらず、AdSense 不承認後の監査で中身の薄い
 * ページ群に数えられた。読者が知りたいのは「どこが、いつ、どう違うか」で、
 * それは比べて並べないと出てこない。旧URLはこのページの #<slug> へ転送している
 * (next.config.mjs)。
 *
 * 年ごとに変わる事実(会期・営業時間・12月25日の営業)は editions に年ごとに
 * 持ち、主催者の公式発表で確かめたものだけを入れる。予想の日程は入れない
 * ——予想を確定のように書くのは、古い日程を残すのと同じ質の誤りになる。
 * 本文(body・access・tip・nearby)には、来年もそのまま通用することだけを書く。
 * 年中行事ガイド(lib/annual-events)と同じ分け方。
 *
 * 毎年秋にやること: 各マーケットの公式サイトで新しい年の発表を確かめ、
 * editions に1件足して、LAST_CHECKED を確かめた日に直す。
 *
 * このデータはマーケット比較のページだけでなく、クリスマス特集のハブ
 * (/events/christmas)と、観光スポットの季節の帯も読む(lib/christmas/index.ts)。
 * 以前は app/(with-ads)/sightseeing/christmas-markets/data.ts にあった。
 *
 * マークダウンの太字は使わない。CommonMark の規則で ** が生のまま出る
 * 問題(CLAUDE.md)を避けるため。sections の住所と出典のリンクだけは
 * markdown で書く(FeatureLayout が描画する)。
 */

import {
  editionFor,
  formatFullDate,
  formatRange,
  previousEdition,
  sourceLine,
} from "./season";
import type {
  SeasonEdition,
  SeasonItem,
  SeasonKind,
  SeasonPlace,
  SeasonSource,
} from "./types";

export type MarketSource = SeasonSource;

/** 1シーズン分の開催。マーケットは開幕日が分かったものだけを持つ。 */
export type MarketEdition = SeasonEdition & { start: string };

export type ChristmasMarket = {
  /** ページ内アンカー。旧詳細ページの slug と同じにしてある(転送先になる)。 */
  slug: string;
  title: string;
  /** 比較表の行見出し。短く。 */
  shortTitle: string;
  engTitle: string;
  summary: string;
  /** 本文。1要素=1段落。年に依存しないことだけ。 */
  body: string[];
  /** 比較表の「入場」。 */
  entry: string;
  /** 最寄り駅。比較表とカードの1行に出す。 */
  station: string;
  /** 発表が無いときに出す、年に依存しない時期。 */
  usualTiming: string;
  /** 住所(地図リンクの markdown)と行き方。 */
  access: string;
  tip: string;
  nearby?: string;
  website: string;
  /** 古い年から順に。 */
  editions: MarketEdition[];
  /**
   * 観光スポット(/sightseeing/<spotSlug>)のページが本体になっているもの。
   * 一覧ではカードにしてそちらへ送り、ここには本文を持たない。
   */
  spotSlug?: string;
  /**
   * 特集のハブの暦で、どの段に置くか。屋台を出さないコヴェント・ガーデンと
   * トラファルガー広場は「灯り」、リンクが主役のバタシーは「リンク」、
   * テーマパークに近いウィンター・ワンダーランドは「催し」に置く。
   */
  hubKind: SeasonKind;
  /** 季節の帯を出す観光スポット。 */
  places?: SeasonPlace[];
};

/**
 * 発表の無いマーケットを「未発表」と書くときの、確かめた日。
 * 全マーケットの公式サイトを見直したら、ここを直す。
 */
export const LAST_CHECKED = "2026-10-18";

/** 地図リンク。住所の表記をそのまま検索語にする。 */
function map(label: string): string {
  return `[${label}](https://www.google.com/maps?q=${encodeURIComponent(label)})`;
}

export const christmasMarkets: ChristmasMarket[] = [
  {
    slug: "covent-garden-christmas-market",
    title: "コヴェント・ガーデンのクリスマス",
    shortTitle: "コヴェント・ガーデン",
    engTitle: "Christmas at Covent Garden",
    summary:
      "屋台を並べるマーケットではなく、常設のマーケットホールと広場がまるごとクリスマスの飾りに包まれる。巨大なツリーと天井から下がるオーナメントを見に行く場所。",
    body: [
      "コヴェント・ガーデンは、木の小屋が並ぶ形式のクリスマスマーケットではない。19世紀のマーケットホールと周りの広場が、11月中旬の点灯式から年明けまで飾り付けられる。西側の広場には英国産のモミのツリーが立ち、マーケットホールの天井には金色のベルや大きなオーナメントが吊られる。",
      "買い物は、ホールの中で一年中開いているアップル・マーケット(手工芸品が中心)と、南隣のジュビリー・マーケットが中心になる。食べ歩きの屋台を期待して行くと肩透かしになるが、飾りの見応えは中心部でも指折りで、写真を撮りに行く場所と考えるとよい。",
    ],
    entry: "無料",
    station: "コヴェント・ガーデン駅",
    usualTiming: "例年11月中旬の点灯から1月上旬まで",
    access: `${map("Covent Garden Piazza, London WC2E 8RF")}。地下鉄ピカデリー線のコヴェント・ガーデン駅から徒歩2分。混む時間帯は駅の入場が制限されることがあるので、帰りはレスター・スクエア駅まで歩くほうが早い。`,
    tip: "飾りは日が暮れて灯りが入ってからが見どころ。12月の日没は16時前なので、夕方早めに着けば明るいうちの広場と夜の飾りの両方を見られる。ツリーの前は夕方から人が増える。",
    nearby:
      "レスター・スクエアとトラファルガー広場まで、どちらも歩いて10分ほど。3か所は1晩でまとめて回れる。",
    website: "https://www.coventgarden.london/",
    hubKind: "lights",
    places: [{ spot: "covent-garden", relation: "here" }],
    editions: [
      {
        year: 2026,
        start: "2026-11-12",
        label: "点灯は",
        notes: [
          "公式は、点灯からの7週間をクリスマスの催しの期間としている。終わりの日は発表されていない。",
        ],
        sources: [
          {
            label: "Covent Garden – Lights Switch On",
            url: "https://www.coventgarden.london/event/covent-garden-lights-switch-on",
          },
        ],
        checkedAt: "2026-10-11",
      },
    ],
  },
  {
    slug: "southbank-centre-winter-market",
    title: "サウスバンク・センター・ウィンターマーケット",
    shortTitle: "サウスバンク",
    engTitle: "Southbank Centre Winter Market",
    summary:
      "テムズ川南岸の遊歩道に、木の小屋の屋台がハンガーフォード橋の下まで並ぶ。中心部では開幕が早く、夜遅くまで開いている。",
    body: [
      "劇場とコンサートホールが集まるサウスバンク・センターの前、テムズ川沿いのクイーンズ・ウォークに屋台が並ぶ。食べ物と飲み物の屋台が多く、ホットワインやチーズ料理、焼き菓子を片手に川沿いを歩く形になる。",
      "中心部のマーケットの中では始まるのが早く、11月上旬から開く。夜遅くまで営業しているので、観劇や夕食のあとにも寄れる。ロンドン・アイのすぐ隣で、景色も含めて選ぶならここ。",
    ],
    entry: "無料",
    station: "ウォータールー駅",
    usualTiming: "例年11月上旬〜1月上旬",
    access: `${map("Queen's Walk, London SE1 8XX")}。ハンガーフォード橋の下から川沿いに続く。ウォータールー駅から徒歩5分。北岸のエンバンクメント駅からは、鉄道橋の両脇にある歩行者橋(ゴールデン・ジュビリー・ブリッジ)を渡って5分ほど。`,
    tip: "週末の夜は川沿いの道が人で詰まる。食べ歩きが目的なら、屋台の行列が短い平日の夕方が狙い目。",
    nearby: "トラファルガー広場へは歩行者橋を渡って15分ほど。",
    website: "https://www.southbankcentre.co.uk/activity/winter-market/",
    hubKind: "market",
    places: [{ spot: "london-eye", relation: "nearby" }],
    editions: [
      {
        year: 2026,
        start: "2026-11-02",
        end: "2027-01-03",
        hours: "屋台 11:00〜22:00、バー 11:00〜23:00",
        sources: [
          {
            label: "Southbank Centre – Winter Market",
            url: "https://www.southbankcentre.co.uk/activity/winter-market/",
          },
        ],
        checkedAt: "2026-10-11",
      },
    ],
  },
  {
    slug: "winter-by-the-river",
    title: "ウィンター・バイ・ザ・リバー(ロンドン・ブリッジ)",
    shortTitle: "ウィンター・バイ・ザ・リバー",
    engTitle: "Winter by the River",
    summary:
      "タワーブリッジを正面に見る川沿いの遊歩道のマーケット。夜景を見ながら飲むのに向いている。",
    body: [
      "ロンドン・ブリッジ駅の北、テムズ川南岸のクイーンズ・ウォーク沿いに屋台が並ぶ。屋根付きの商業施設ヘイズ・ギャレリアの前から東へ、タワーブリッジに向かって続き、どこにいても橋が視界に入る。",
      "屋台には工芸品のギフトと、飲み物や軽食が並ぶ。ここ数年は、川を見渡せる2階建てのポップアップのバーと、カーリングを体験できるレーンも出ている。",
    ],
    entry: "無料",
    station: "ロンドン・ブリッジ駅",
    usualTiming: "例年11月中旬〜1月上旬",
    access: `${map("Queen's Walk, London SE1 2DB")}。ロンドン・ブリッジ駅から徒歩5分。タワーブリッジを渡れば、北岸のロンドン塔まで15分ほど。`,
    tip: "タワーブリッジのライトアップが見える日没後がいちばん映える。川沿いのバーは混む夜に入れないことがあるので、目当てなら早めの時間に。",
    nearby:
      "南隣のバラ・マーケット(食品市場)と組み合わせやすい。バラ・マーケットは夕方に閉まる店が多いので、先にそちらへ。",
    website: "https://www.londonbridgecity.co.uk/",
    hubKind: "market",
    places: [
      { spot: "london-tower-bridge", relation: "nearby" },
      { spot: "borough-market", relation: "nearby" },
    ],
    editions: [
      {
        year: 2025,
        start: "2025-11-13",
        end: "2026-01-04",
        hours: "11:00〜22:00(12月24日は17:00まで、12月31日は21:00まで)",
        christmasDay: "closed",
        sources: [
          {
            label: "London Bridge City – Winter by the River 2025",
            url: "https://www.londonbridgecity.co.uk/events/2025/november/winter-by-the-river-2025-2",
          },
        ],
        checkedAt: "2026-10-11",
      },
      {
        year: 2026,
        start: "2026-11-10",
        end: "2027-01-03",
        hours: "11:00〜22:00(12月24日は17:00まで、12月31日は21:00まで)",
        christmasDay: "closed",
        notes: [
          "2階建てのバー「クラブハウス」と、ロンドン・ブリッジ・シティの桟橋にカーリングのレーン(6本)が出る。",
        ],
        sources: [
          {
            label: "London Bridge City – Winter by the River 2026",
            url: "https://www.londonbridgecity.co.uk/events/2026/november/winter-by-the-river-2026",
          },
        ],
        checkedAt: "2026-10-18",
      },
    ],
  },
  {
    slug: "trafalgar-square-christmas-market",
    title: "トラファルガー広場のツリーとマーケット",
    shortTitle: "トラファルガー広場",
    engTitle: "Christmas at Trafalgar Square",
    summary:
      "毎年ノルウェーから贈られるツリーが立つ、ロンドンのクリスマスの象徴のような広場。12月はツリーの下でキャロル(聖歌)の合唱が続く。",
    body: [
      "トラファルガー広場のツリーは、第二次大戦中の支援への礼として、1947年から毎年ノルウェーのオスロ市が贈っている。点灯は12月の初め(例年は第1木曜)で、ツリーは十二夜の前まで立っている。12月中はツリーの下で、合唱団が1時間ずつキャロルを歌う。",
      "ナショナル・ギャラリー前のテラスには、ここ数年、木の小屋の屋台が並ぶマーケットも出ている。ただし広場を管理するロンドン市の案内にマーケットは載っておらず、会期は直前まで分かりにくい。ツリーと歌を目当てに行き、屋台はあればついでに、と考えるのがよい。",
    ],
    entry: "無料",
    station: "チャリング・クロス駅",
    usualTiming: "ツリーの点灯は例年12月の第1木曜",
    access: `${map("Trafalgar Square, London")}。チャリング・クロス駅から徒歩1分。`,
    tip: "点灯式の夜は広場が人で埋まる。ツリーをゆっくり見るなら点灯式の翌日以降に。",
    nearby:
      "ナショナル・ギャラリーは目の前で、常設展は入館無料。コヴェント・ガーデンとレスター・スクエアへは歩いて10分ほど。",
    website:
      "https://www.london.gov.uk/who-we-are/city-halls-buildings-and-squares/trafalgar-square/christmas",
    hubKind: "lights",
    places: [
      { spot: "trafalgar-square", relation: "here" },
      { spot: "the-fourth-plinth-trafalgar-square", relation: "here" },
      { spot: "national-gallery-london", relation: "nearby" },
      { museum: "national-gallery", relation: "nearby" },
    ],
    editions: [],
  },
  {
    slug: "leicester-square-christmas-market",
    title: "レスター・スクエアのスケートリンクとマーケット",
    shortTitle: "レスター・スクエア",
    engTitle: "Skate Leicester Square",
    summary:
      "映画館と劇場に囲まれた広場に屋外のスケートリンクが出て、周りにクリスマスの屋台とバーが並ぶ。中心部ではいちばん早く始まる。",
    body: [
      "レスター・スクエアは、映画のプレミア上映が開かれる映画館と劇場に囲まれた、ウエスト・エンドの真ん中の広場。冬は広場の中央に屋外スケートリンクができ、その周りにギフトや菓子の屋台、温かい飲み物を出すバーが並ぶ。",
      "滑るには日時指定のチケットが要る。屋台は公共の広場に並ぶので、滑らずに見て回るだけでも構わない。",
    ],
    entry: "広場は無料、リンクは有料",
    station: "レスター・スクエア駅",
    usualTiming: "例年11月上旬〜1月上旬",
    access: `${map("Leicester Square, London WC2H 7LU")}。地下鉄レスター・スクエア駅から徒歩2分。`,
    tip: "12月の夜と週末は、リンクの枠から先に埋まる。滑るなら事前に予約を。",
    nearby:
      "中華街(チャイナタウン)はすぐ北。コヴェント・ガーデンとトラファルガー広場まで、どちらも歩いて10分ほど。",
    website: "https://www.skateleicestersquare.co.uk/",
    hubKind: "rink",
    places: [{ spot: "movie-statue-street-leicester-square", relation: "here" }],
    editions: [
      {
        year: 2026,
        start: "2026-10-31",
        end: "2027-01-03",
        hours: "10:00〜22:00(11月26日までの平日は12:00から)",
        christmasDay: "closed",
        notes: ["12月24日は18:00まで、12月26日と1月1日は12:00から。"],
        sources: [
          {
            label: "Skate Leicester Square",
            url: "https://www.skateleicestersquare.co.uk/",
          },
        ],
        checkedAt: "2026-10-11",
      },
    ],
  },
  {
    slug: "winter-wonderland",
    spotSlug: "hyde-park-winter-wonderland",
    title: "ハイド・パーク・ウィンター・ワンダーランド",
    shortTitle: "ウィンター・ワンダーランド",
    engTitle: "Hyde Park Winter Wonderland",
    summary:
      "ハイド・パークに遊園地とアイスリンク、ショー、屋台が集まるロンドン最大のクリスマスイベント。入場は日時指定の予約制で、マーケットというより冬のテーマパーク。",
    body: [],
    entry: "日時指定の予約制",
    station: "ハイド・パーク・コーナー駅",
    usualTiming: "例年11月中旬〜1月上旬",
    access: "",
    tip: "",
    website: "https://hydeparkwinterwonderland.com/",
    hubKind: "event",
    places: [{ spot: "kensington-gardens", relation: "nearby" }],
    editions: [
      {
        year: 2026,
        start: "2026-11-19",
        end: "2027-01-03",
        hours: "10:00〜22:00(遅く開く日あり)",
        christmasDay: "closed",
        booking: {
          status: "入場は日時指定の予約制(時間帯で料金が変わる)",
          url: "https://hydeparkwinterwonderland.com/tickets-guide/",
        },
        sources: [
          {
            label: "Hyde Park Winter Wonderland – Tickets guide",
            url: "https://hydeparkwinterwonderland.com/tickets-guide/",
          },
        ],
        checkedAt: "2026-10-18",
      },
    ],
  },
  {
    slug: "battersea-power-christmas-market",
    title: "バタシー発電所のクリスマス",
    shortTitle: "バタシー発電所",
    engTitle: "Christmas at Battersea Power Station",
    summary:
      "発電所を改装したショッピングモールに、冬だけ屋外のスケートリンクと遊具が加わる。屋内の店と組み合わせれば天気に左右されにくい。",
    body: [
      "4本の煙突で知られる旧バタシー発電所は、2022年にショッピングモールと住宅に生まれ変わった。冬は川沿いの広場にスケートリンク「グライド」ができ、メリーゴーラウンドなどの遊具や菓子の屋台が並ぶ。",
      "木の小屋が並ぶマーケットは常設ではなく、週末だけの開催になる年がある。屋台が目当てなら、その年の日程を確かめてから行くこと。モールの中の店は冬じゅう開いているので、雨の日でもクリスマスの買い物はできる。",
    ],
    entry: "無料、リンクは有料",
    station: "バタシー・パワー・ステーション駅",
    usualTiming: "スケートリンクは例年11月上旬〜1月上旬",
    access: `${map("Battersea Power Station, London SW11 8DD")}。地下鉄ノーザン線のバタシー・パワー・ステーション駅から徒歩2分。テムズ川の船(ウーバー・ボート)の桟橋もある。`,
    tip: "煙突の上まで上がる展望エレベーター「リフト109」からは、冬の夕暮れのロンドンを見下ろせる(料金は別)。",
    website: "https://batterseapowerstation.co.uk/",
    hubKind: "rink",
    places: [
      { spot: "battersea-power-station", relation: "here" },
      { spot: "chimney-lift-battersea-power-station", relation: "here" },
      { spot: "battersea-park", relation: "nearby" },
    ],
    editions: [
      {
        year: 2025,
        start: "2025-11-07",
        end: "2026-01-04",
        label: "スケートリンクは",
        notes: [
          "屋台のマーケットは11月15〜16日、12月6〜7日、12月13〜14日の3つの週末だけだった。",
        ],
        sources: [
          {
            label: "Battersea Power Station – Christmas 2025",
            url: "https://batterseapowerstation.co.uk/news/step-into-the-magic-of-christmas-at-battersea-power-station/",
          },
        ],
        checkedAt: "2026-10-11",
      },
      {
        year: 2026,
        start: "2026-11-06",
        end: "2027-01-03",
        label: "スケートリンクは",
        notes: [
          "屋台のマーケットの日程は発表されていない(2025年は3つの週末だけだった)。",
        ],
        sources: [
          {
            label: "Glide at Battersea Power Station(Ticketmaster)",
            url: "https://www.ticketmaster.co.uk/glide",
          },
        ],
        checkedAt: "2026-10-11",
      },
    ],
  },
  {
    slug: "kings-cross-christmas-market",
    title: "キングス・クロスのクリスマスマーケット",
    shortTitle: "キングス・クロス",
    engTitle: "Christmas at King's Cross",
    summary:
      "再開発された倉庫街に、デザイン雑貨や手作りの品の店が期間限定で並ぶ。ホットワインの市というより、贈り物を探しに行く場所。",
    body: [
      "キングス・クロス駅の北側は、運河沿いの貨物ヤードを店と広場に作り替えた地区。冬はコール・ドロップス・ヤードやグラナリー・スクエアに期間限定の屋台やポップアップの店が出る。並ぶのはデザイン雑貨や服、手作りのギフトが中心で、気の利いた贈り物を探すのに向く。",
      "ほかのマーケットより始まりが遅く、11月下旬からクリスマスの直前までの短い会期になることが多い。",
    ],
    entry: "無料",
    station: "キングス・クロス・セント・パンクラス駅",
    usualTiming: "例年11月下旬〜12月下旬",
    access: `${map("Coal Drops Yard, London N1C 4DQ")}。キングス・クロス・セント・パンクラス駅から徒歩5分。`,
    tip: "ユーロスターの発着駅セント・パンクラスの目の前なので、パリへの行き帰りに寄れる。",
    nearby:
      "セント・パンクラス駅の構内にも毎年大きなツリーが飾られる。運河沿いを西へ歩けば、カムデンまで30〜40分。",
    website: "https://www.kingscross.co.uk/",
    hubKind: "market",
    places: [
      { spot: "st-pancras-international", relation: "nearby" },
      { spot: "harry-potter-shop-platform-934", relation: "nearby" },
    ],
    editions: [],
  },
  {
    slug: "spitalfields-christmas-market",
    title: "スピタルフィールズのクリスマス",
    shortTitle: "スピタルフィールズ",
    engTitle: "Christmas at Old Spitalfields Market",
    summary:
      "屋根のあるヴィクトリア朝の市場ホールに、独立系の作り手の店が並ぶ。雨でも濡れずにギフトを探せる。",
    body: [
      "オールド・スピタルフィールズ・マーケットは、19世紀末の屋根付きの市場ホール。普段から服や雑貨、手作りの品の屋台と常設の店が入っていて、冬はホール全体が飾り付けられ、クリスマス向けの品ぞろえになる。",
      "多くのマーケットと違って屋根の下にあるので、雨の日の行き先に向く。一点物の雑貨や、作り手から直接買う贈り物を探すなら、中心部の屋台村よりこちらのほうが選びがいがある。",
    ],
    entry: "無料",
    station: "リバプール・ストリート駅",
    usualTiming: "例年11月中旬〜12月下旬",
    access: `${map("Old Spitalfields Market, London E1 6EW")}。リバプール・ストリート駅から徒歩5分。`,
    tip: "屋台は曜日で顔ぶれが変わる。週末は店が増えるぶん混む。",
    nearby:
      "東へ歩けばブリック・レーン、北へ歩けばショーディッチ。ストリートアートを見て回れる。",
    // www. 付きは証明書が合わず、ブラウザが警告を出す(2026-10-18 確認)。
    website: "https://oldspitalfieldsmarket.com/",
    hubKind: "market",
    places: [{ spot: "old-spitalfields-market", relation: "here" }],
    editions: [
      {
        year: 2026,
        start: "2026-11-11",
        label: "点灯は",
        notes: [
          "点灯の催しは16:30〜19:30。クリスマスの市の日程は発表されていない。",
        ],
        sources: [
          {
            label: "Old Spitalfields Market – Christmas 2026 Light Switch On Party",
            url: "https://oldspitalfieldsmarket.com/",
          },
        ],
        checkedAt: "2026-10-18",
      },
    ],
  },
  {
    slug: "kingston-christmas-market",
    title: "キングストン・クリスマスマーケット",
    shortTitle: "キングストン",
    engTitle: "Kingston Christmas Market",
    summary:
      "ロンドン南西部の古い市場町の広場に、木の小屋が並ぶ。観光地の混雑を離れて、郊外の町のクリスマスを見たい人向け。",
    body: [
      "キングストン・アポン・テムズは中世から市が立ってきた町で、マーケットはその古い市場広場(エンシェント・マーケット・プレイス)で開かれる。木の小屋の屋台が広場を囲み、食べ物や飲み物、工芸品が並ぶ。",
      "中心部から電車で30分ほどかかるが、そのぶん観光地の人込みから離れて、郊外の町のクリスマスを見られる。町のすぐ横をテムズ川が流れていて、川沿いのパブで休める。",
    ],
    entry: "無料",
    station: "キングストン駅(鉄道)",
    usualTiming: "例年11月中旬〜12月下旬",
    access: `${map("Ancient Market Place, Kingston upon Thames KT1 1JS")}。ウォータールー駅から鉄道で約30分のキングストン駅から、徒歩10分ほど。`,
    tip: "屋台は夕方に閉まり、そのあとは飲食とバーだけが遅くまで開く(時間はその年の会期の欄に)。灯りの入った広場を見るなら、暗くなる前に着いておくとよい。",
    nearby:
      "テムズ川を上ったハンプトン・コート宮殿までバスで20分ほど。冬は宮殿の前庭に屋外スケートリンクが出る年もある。",
    website: "https://www.kingstonchristmasmarket.co.uk/",
    hubKind: "market",
    editions: [
      {
        year: 2026,
        start: "2026-11-12",
        end: "2027-01-03",
        hours:
          "屋台 10:00〜18:00(木〜土は20:00まで)、飲食とバー 10:00〜21:00(木〜土は22:00、日曜は20:00まで)",
        christmasDay: "closed",
        notes: ["12月24日と26日は、屋台が18:00、飲食とバーが20:00まで。"],
        sources: [
          {
            label: "Kingston Christmas Market",
            url: "https://www.kingstonchristmasmarket.co.uk/",
          },
        ],
        checkedAt: "2026-10-11",
      },
    ],
  },
];

/* ============================================================
 * 会期の読み出し(マーケット比較のページ用)
 *
 * 日付の書式と版の引き方は lib/christmas/season.ts にある。
 * ========================================================== */

/**
 * 各マーケットの「◯年の会期」欄の本文(markdown)。
 *
 * 発表があれば会期・時間・12月25日と出典。無ければ「未発表」と例年の時期、
 * 前の年の実績があればそれも添える。
 */
export function seasonDescription(
  market: ChristmasMarket,
  year: number,
): string {
  const edition = editionFor(market.editions, year);

  if (edition) {
    const lines = [
      `${formatRange(edition)}。`,
      edition.hours ? `営業は${edition.hours}。` : null,
      edition.christmasDay === "closed"
        ? "12月25日は休み。"
        : edition.christmasDay === "open"
          ? "12月25日も開く。"
          : null,
      ...(edition.notes ?? []),
    ].filter(Boolean);
    return `${lines.join("")}\n\n${sourceLine(edition.sources, edition.checkedAt)}`;
  }

  const previous = previousEdition(market.editions, year);
  const head = `${formatFullDate(LAST_CHECKED)}の時点で未発表。${market.usualTiming}。`;
  if (!previous) return head;

  const prevLines = [
    `前回(${previous.year}年)は${formatRange(previous)}`,
    previous.christmasDay === "closed" ? "で、12月25日は休みだった。" : "だった。",
    ...(previous.notes ?? []),
  ];
  return `${head}${prevLines.join("")}\n\n${sourceLine(previous.sources, previous.checkedAt)}`;
}

/** 比較表の「会期」。 */
export function tableRange(market: ChristmasMarket, year: number): string {
  const edition = editionFor(market.editions, year);
  return edition ? formatRange(edition) : "未発表";
}

/** 比較表の「12月25日」。公式に書かれていなければ「—」。 */
export function tableChristmasDay(
  market: ChristmasMarket,
  year: number,
): string {
  const edition = editionFor(market.editions, year);
  if (edition?.christmasDay === "closed") return "休み";
  if (edition?.christmasDay === "open") return "営業";
  return "—";
}

/**
 * 特集のハブに載せる形。本文(body・access など)は持たず、会期と行き先だけ。
 * 詳しい案内はマーケット比較のページの節(本体がスポットのページなら、そちら)。
 */
export function marketSeasonItems(): SeasonItem[] {
  return christmasMarkets.map((m) => ({
    slug: m.slug,
    kind: m.hubKind,
    title: m.title,
    shortTitle: m.shortTitle,
    engTitle: m.engTitle,
    summary: m.summary,
    station: m.station,
    href: m.spotSlug
      ? `/sightseeing/${m.spotSlug}`
      : `/sightseeing/christmas-markets#${m.slug}`,
    free: m.entry.startsWith("無料") || m.entry.startsWith("広場は無料"),
    entry: m.entry,
    usualTiming: m.usualTiming,
    editions: m.editions,
    places: m.places,
  }));
}

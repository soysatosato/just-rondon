import type { SeasonItem } from "./types";

/**
 * 通りの灯り。点灯日は各通りの公式発表で確かめたものだけ。
 *
 * コヴェント・ガーデンとトラファルガー広場はマーケット比較のデータ
 * (markets.ts)が持っていて、特集では hubKind で「灯り」の段に置く。
 * ここに同じ場所を二重に書かないこと。
 *
 * 灯りの終わる日はどこも発表しない(例年1月上旬に外される)ので、
 * end は書かない。暦では「終わりは未発表」として出る。
 *
 * 毎年秋にやること: 各通りの公式サイトで点灯日を確かめ、editions に1件足す。
 */

const CHECKED = "2026-10-18";

export const christmasLights: SeasonItem[] = [
  {
    slug: "carnaby-street",
    kind: "lights",
    title: "カーナビー・ストリートの飾り",
    shortTitle: "カーナビー・ストリート",
    engTitle: "Carnaby Street",
    summary:
      "1960年代に流行の発信地だった、歩行者専用の小路。年ごとに趣向を変えた吊り飾りが架かる。通りは200mほどで、数分で端から端まで歩ける。",
    station: "オックスフォード・サーカス駅",
    href: "/sightseeing/christmas-lights#carnaby-street",
    free: true,
    entry: "無料",
    usualTiming: "例年11月上旬に点灯",
    editions: [
      {
        year: 2026,
        start: "2026-11-04",
        label: "点灯は",
        sources: [
          {
            label: "This is Soho – Carnaby Street",
            url: "https://www.thisissoho.co.uk/carnaby-street/",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
    places: [
      { spot: "liberty-london", relation: "nearby" },
      { spot: "hamleys-regent-street", relation: "nearby" },
    ],
  },
  {
    slug: "regent-street",
    kind: "lights",
    title: "リージェント・ストリートの灯り",
    shortTitle: "リージェント・ストリート",
    engTitle: "Regent Street",
    summary:
      "オックスフォード・サーカスからピカデリー・サーカスまで、ゆるく弧を描く大通りの頭上に、天使をかたどった光の飾りが連なる。2016年から続く、ロンドンのクリスマスの顔のような飾り。",
    station: "オックスフォード・サーカス駅、ピカデリー・サーカス駅",
    href: "/sightseeing/christmas-lights#regent-street",
    free: true,
    entry: "無料",
    usualTiming: "例年11月上旬に点灯",
    editions: [
      {
        year: 2026,
        start: "2026-11-05",
        label: "点灯は",
        notes: [
          "点灯の日は17:00〜21:00に通りが車両通行止めになり、歩いて回れる。",
          "2016年から続く「スピリット・オブ・クリスマス」の飾りに、今年は新しい趣向が加わると発表されている。",
        ],
        sources: [
          {
            label: "Regent Street – The Festive Spirits return for 2026(2026年10月1日)",
            url: "https://www.regentstreetonline.com/news/festive-spirits-return-for-2026",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
    places: [
      { spot: "hamleys-regent-street", relation: "here" },
      { spot: "piccadilly-circus", relation: "nearby" },
      { spot: "liberty-london", relation: "nearby" },
    ],
  },
  {
    slug: "oxford-street",
    kind: "lights",
    title: "オックスフォード・ストリートの灯り",
    shortTitle: "オックスフォード・ストリート",
    engTitle: "Oxford Street",
    summary:
      "マーブル・アーチからトッテナム・コート・ロードまで約2km続く、ロンドン一の買い物通り。通りの頭上いっぱいに飾りが架かる。",
    station: "ボンド・ストリート駅、オックスフォード・サーカス駅",
    href: "/sightseeing/christmas-lights#oxford-street",
    free: true,
    entry: "無料",
    usualTiming: "例年11月上旬に点灯",
    editions: [
      {
        year: 2026,
        notes: [
          "今年の飾りの一部はハリー・ポッターにちなんだものになると、通りの公式サイトが告知している。点灯日はまだ発表されていない。",
          "10月26日から、オーチャード・ストリート(セルフリッジズの角)からグレート・ポートランド・ストリートまでの区間は車両通行止めになる。",
        ],
        sources: [
          {
            label: "Oxford Street(公式サイト)",
            url: "https://www.oxfordstreet.co.uk/",
          },
          {
            label: "TfL – Oxford Street",
            url: "https://tfl.gov.uk/modes/driving/oxford-street",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
    // 2026年は飾りの一部がハリー・ポッター仕様なので、関連のスポットにも出す
    // (点灯日が発表されるまでは、帯には出ない)。
    places: [
      { spot: "selfridges-london", relation: "here" },
      { spot: "harry-potter-shop-platform-934", relation: "related" },
      { spot: "leadenhall-market-london", relation: "related" },
    ],
  },
  {
    slug: "bond-street",
    kind: "lights",
    title: "ボンド・ストリートの灯り",
    shortTitle: "ボンド・ストリート",
    engTitle: "Bond Street",
    summary:
      "高級ブランドの路面店が並ぶメイフェアの通り。オックスフォード・ストリートから南へ折れるとすぐで、店先の飾りも見どころになる。",
    station: "ボンド・ストリート駅",
    href: "/sightseeing/christmas-lights#bond-street",
    free: true,
    entry: "無料",
    usualTiming: "例年11月中旬に点灯",
    editions: [
      {
        year: 2026,
        start: "2026-11-12",
        label: "点灯は",
        sources: [
          {
            label: "Bond Street(公式サイト)",
            url: "https://www.bondstreet.co.uk/",
          },
        ],
        checkedAt: CHECKED,
      },
    ],
  },
];

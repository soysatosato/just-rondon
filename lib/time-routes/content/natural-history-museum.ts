import type { TimeRouteGuide } from "../types";

/**
 * ロンドン自然史博物館。
 *
 * 2026-10-05 に公式サイトの各展示室ページと館内図(Museum-map.pdf)で確かめた。
 * - 恐竜ギャラリー: Central Building の Ground floor。動くティラノサウルスは
 *   毎年9月に整備で止まる(2026年は9月7〜25日)。
 * - アース・ホール(Ground floor・東棟)にステゴサウルスの「ソフィー」。
 *   金属の地球儀を抜けるエスカレーターで Volcanoes and Earthquakes
 *   (東棟 Floor 2)へ上がると、1995年の神戸の地震を再現した部屋がある。
 * - 哺乳類ホールのシロナガスクジラの模型は1930年代に部屋の中で組み上げたもの。
 * - Treasures(Central Building の Floor 1)にダーウィン『種の起源』の初版など。
 * - ヒンツェ・ホールの Floor 2 に、1891年に切り倒された樹齢1,300年の
 *   ジャイアント・セコイアの断面。
 * - コクーンは7階から入って5階へ下りる順路。
 *
 * 開館 10:00〜17:50(最終入場 17:30)。2026年10月9日は休館。
 */
export const naturalHistoryMuseum: TimeRouteGuide = {
  attractionSlug: "natural-history-museum",
  museumSlug: "natural-history-museum",
  answer:
    "入口のクジラと恐竜、地球の展示だけなら1時間、主な展示室をひと通りなら2〜3時間、上の階や庭園まで回るなら半日です。",
  notes: [
    "入場無料で予約なしでも入れますが、週末と学校の休みは入口に列ができます。公式サイトで無料の入場チケットを取っておくと確実です。",
    "開館は10:00〜17:50(最終入場17:30)。",
    "入口は正面のクロムウェル・ロード側(ヒンツェ・ホールに出る)と、東側のエキシビション・ロード側(アース・ホールに出る)の2か所です。",
  ],
  routes: [
    {
      label: "1時間",
      minutes: 60,
      summary:
        "ヒンツェ・ホールのシロナガスクジラの骨格、恐竜ギャラリー、アース・ホールのステゴサウルスを見て、地球儀を抜けるエスカレーターで地震の展示へ上がります。",
      stops: [
        {
          title: "シロナガスクジラの骨格『ホープ』",
          where: "ヒンツェ・ホール(Ground floor)",
          minutes: 8,
          note: "正面入口を入った大広間に吊られた、全長25mの本物の骨格。真下から見上げてください。",
        },
        {
          title: "恐竜ギャラリー",
          where: "Ground floor(Central Building)",
          minutes: 20,
          note: "動くティラノサウルスや、最初に見つかったティラノサウルスの骨格の一部がある、館内でいちばん混む展示室です。混む日は入場待ちの列ができます。",
        },
        {
          title: "ステゴサウルスの『ソフィー』",
          where: "アース・ホール(Ground floor・東棟)",
          minutes: 7,
          note: "もっとも完全なステゴサウルスの骨格のひとつ。恐竜ギャラリーではなく、こちらにいます。",
        },
        {
          title: "地球儀のエスカレーターと地震の展示",
          where: "Volcanoes and Earthquakes(東棟 Floor 2)",
          minutes: 15,
          note: "アース・ホールから金属の地球儀の中を通るエスカレーターで上がると、1995年の阪神・淡路大震災の揺れを、日本のスーパーを模した部屋で再現しています。",
        },
      ],
      tip: "恐竜ギャラリーに列ができていたら、先にアース・ホールと地震の展示を回して、あとで戻るほうが待たずに済みます。",
    },
    {
      label: "2〜3時間",
      minutes: 150,
      summary:
        "1時間の4か所に、哺乳類ホールのシロナガスクジラの模型、Treasures、鉱物の展示室、建物の装飾を足します。",
      stops: [
        {
          title: "シロナガスクジラの骨格『ホープ』",
          where: "ヒンツェ・ホール(Ground floor)",
          minutes: 8,
          note: "大広間の天井から吊られた全長25mの骨格。",
        },
        {
          title: "建物の装飾",
          where: "ヒンツェ・ホールの柱と天井",
          minutes: 5,
          note: "柱や壁のテラコッタの動植物は、西側が現生の種、東側が絶滅した種と描き分けられています。",
        },
        {
          title: "恐竜ギャラリー",
          where: "Ground floor(Central Building)",
          minutes: 25,
          note: "動くティラノサウルス、トリケラトプスの頭骨、学術的に最初に知られたイグアノドンの骨格。",
        },
        {
          title: "哺乳類とシロナガスクジラの模型",
          where: "Mammals Hall(Ground floor)",
          minutes: 15,
          note: "1930年代にこの部屋の中で組み上げられた実物大の模型。骨格の『ホープ』と見比べると大きさが実感できます。",
        },
        {
          title: "Treasures",
          where: "Cadogan Gallery(Floor 1・Central Building)",
          minutes: 15,
          note: "ダーウィン『種の起源』の初版や、絶滅したバーバリライオンの頭骨など、館が選んだ逸品を集めた暗い展示室。",
        },
        {
          title: "鉱物の展示室",
          where: "Minerals(Floor 1)",
          minutes: 15,
          note: "長い部屋に古い陳列棚が並ぶ展示室。奥のThe Vaultに宝石や希少な鉱物が集めてあります。",
        },
        {
          title: "ステゴサウルスの『ソフィー』",
          where: "アース・ホール(Ground floor・東棟)",
          minutes: 7,
          note: "エスカレーターに乗る前に。",
        },
        {
          title: "地球儀のエスカレーターと地震の展示",
          where: "Volcanoes and Earthquakes(東棟 Floor 2)",
          minutes: 20,
          note: "1995年の阪神・淡路大震災の揺れを再現した部屋があります。",
        },
      ],
    },
    {
      label: "半日",
      minutes: 240,
      summary:
        "2〜3時間の順路に、巨大なセコイアの断面、ダーウィン・センターのコクーン、2024年に開いた庭園を足して、途中で一度休みます。",
      stops: [
        {
          title: "ヒンツェ・ホールと建物の装飾",
          where: "Ground floor",
          minutes: 15,
          note: "クジラの骨格『ホープ』と、西と東で描き分けられたテラコッタの動植物。",
        },
        {
          title: "恐竜ギャラリー",
          where: "Ground floor(Central Building)",
          minutes: 25,
          note: "開館直後か夕方に回すと待たずに入れます。",
        },
        {
          title: "哺乳類ホール",
          where: "Ground floor",
          minutes: 15,
          note: "1930年代の実物大のシロナガスクジラの模型。",
        },
        {
          title: "Treasuresと鉱物の展示室",
          where: "Floor 1(Central Building)",
          minutes: 30,
          note: "『種の起源』の初版、The Vaultの宝石。",
        },
        {
          title: "ジャイアント・セコイアの断面",
          where: "ヒンツェ・ホール Floor 2",
          minutes: 10,
          note: "1891年に切り倒されたとき樹齢1,300年だった木の断面。年輪に歴史の出来事が書き添えてあります。",
        },
        {
          title: "休憩",
          where: "館内のカフェ",
          minutes: 20,
          note: "Ground floorにカフェが複数あります。場所は館内図で。",
        },
        {
          title: "ダーウィン・センターのコクーン",
          where: "West wing(Cocoon Level 7→5)",
          minutes: 30,
          note: "繭の形をした建物の中を、7階から5階へ下りながら、研究と標本の収蔵の様子を見る展示です。",
        },
        {
          title: "アース・ホールと地震の展示",
          where: "東棟 Ground floor〜Floor 2",
          minutes: 30,
          note: "ステゴサウルスの『ソフィー』から、地球儀のエスカレーターで地震と火山の展示へ。",
        },
        {
          title: "庭園",
          where: "Evolution Garden・Nature Discovery Garden",
          minutes: 30,
          note: "2024年7月に開いた無料の庭園。地球の歴史を岩石と植物でたどる小道があり、館内で疲れたときの休憩にも向きます。",
        },
      ],
    },
  ],
  map: {
    label: "公式の館内図(PDF)",
    url: "https://www.nhm.ac.uk/content/dam/nhm-www/visit/map/Museum-map.pdf",
  },
  sources: [
    {
      label: "Natural History Museum – Visit",
      url: "https://www.nhm.ac.uk/visit.html",
    },
    {
      label: "Natural History Museum – Museum map(PDF)",
      url: "https://www.nhm.ac.uk/content/dam/nhm-www/visit/map/Museum-map.pdf",
    },
    {
      label: "Natural History Museum – Dinosaurs",
      url: "https://www.nhm.ac.uk/visit/galleries-and-museum-map/dinosaurs.html",
    },
    {
      label: "Natural History Museum – Volcanoes and Earthquakes",
      url: "https://www.nhm.ac.uk/visit/galleries-and-museum-map/volcanoes-and-earthquakes.html",
    },
    {
      label: "Natural History Museum – The giant sequoia",
      url: "https://www.nhm.ac.uk/discover/giant-sequoia-slice.html",
    },
  ],
  checkedAt: "2026-10-05",
};

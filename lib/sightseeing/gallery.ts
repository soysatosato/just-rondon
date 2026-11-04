import type { ContentPhoto } from "@/lib/content-photo";

/**
 * 観光スポットのページの写真(ヒーローの1枚のほか)。
 *
 * 2026-11 の見直しで、検索の表示が多いスポット20か所に足した。それまでは
 * 全ページが写真1枚だけで、何が見られる場所なのかを写真で伝えられて
 * いなかった。
 *
 * 選び方(2026-11-05):
 * - Wikimedia Commons の CC BY / CC BY-SA / CC0 / パブリックドメインだけ。
 *   作者とライセンスを credit に書き、写真の下に出す(表示が利用の条件)。
 * - 原本の幅が1600px以上の横長。Commons の Quality images を優先した。
 * - 人物が主役の写真、別の場所の写真、著作権の残る美術作品を写した写真は外した。
 * - alt は何が写っているかの1文。撮影年が今と離れているものは年を書く。
 *
 * url は Wikimedia が配る 1280px 版(lib/wikimedia-image.ts の許可幅)。
 * 差し替えるときは scripts/lib/commons.ts の resolveCommonsImage で
 * 作者とライセンスを取り直すこと(同じファイル名で中身が変わることがある)。
 */
export const SPOT_GALLERY: Record<string, ContentPhoto[]> = {
  "tower-of-london": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/La_Torre%2C_Londres%2C_Inglaterra%2C_2022-11-26%2C_DD_140.jpg/1280px-La_Torre%2C_Londres%2C_Inglaterra%2C_2022-11-26%2C_DD_140.jpg",
      alt: "城の中心にあるホワイト・タワー(2022年)",
      credit: "Diego Delso / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:La_Torre,_Londres,_Inglaterra,_2022-11-26,_DD_140.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/London%2C_Tower_of_London%2C_Queen%27s_House_--_2016_--_4670.jpg/1280px-London%2C_Tower_of_London%2C_Queen%27s_House_--_2016_--_4670.jpg",
      alt: "タワー・グリーンに面した木組みの家、クイーンズ・ハウス",
      credit: "Dietmar Rabich / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:London,_Tower_of_London,_Queen%27s_House_--_2016_--_4670.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/The_Traitors%27_Gate._Tower_of_London%2C_GB.jpg/1280px-The_Traitors%27_Gate._Tower_of_London%2C_GB.jpg",
      alt: "テムズ川側の水門「反逆者の門」(2010年)",
      credit: "Ввласенко / CC BY-SA 3.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:The_Traitors%27_Gate._Tower_of_London,_GB.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/London%2C_Tower_of_London_--_2016_--_4791.jpg/1280px-London%2C_Tower_of_London_--_2016_--_4791.jpg",
      alt: "テムズ川から見たロンドン塔",
      credit: "Dietmar Rabich / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:London,_Tower_of_London_--_2016_--_4791.jpg",
    },
  ],
  "st-pauls-cathedral": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/At_London_2026_0086_-_St._Paul%27s_Cathedral.jpg/1280px-At_London_2026_0086_-_St._Paul%27s_Cathedral.jpg",
      alt: "下から見上げたドーム(2026年1月)",
      credit: "Mike Peel / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:At_London_2026_0086_-_St._Paul%27s_Cathedral.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Paternoster_Square%2C_London.jpg/1280px-Paternoster_Square%2C_London.jpg",
      alt: "ドームの上のゴールデン・ギャラリーから見下ろしたパタノスター・スクエア(2010年)",
      credit: "Eluveitie / CC BY-SA 3.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Paternoster_Square,_London.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/At_London_2024_015.jpg/1280px-At_London_2024_015.jpg",
      alt: "テムズ川の対岸から見た大聖堂(2024年)",
      credit: "Mike Peel / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:At_London_2024_015.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Millennium_Bridge_London.jpg/1280px-Millennium_Bridge_London.jpg",
      alt: "ミレニアム・ブリッジの先に見える大聖堂(2009年)",
      credit: "Telemaque MySon / CC BY-SA 3.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Millennium_Bridge_London.jpg",
    },
  ],
  "london-tower-bridge": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/London_MMB_J8_Tower_Bridge.jpg/1280px-London_MMB_J8_Tower_Bridge.jpg",
      alt: "テムズ川に架かるタワーブリッジと観光船(2012年)",
      credit: "mattbuck / CC BY-SA 3.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:London_MMB_J8_Tower_Bridge.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/London%2C_Tower_Bridge_--_2016_--_4676.jpg/1280px-London%2C_Tower_Bridge_--_2016_--_4676.jpg",
      alt: "ロンドン塔の側から見たタワーブリッジ",
      credit: "Dietmar Rabich / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:London,_Tower_Bridge_--_2016_--_4676.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/London%2C_Tower_Bridge_--_2016_--_4772.jpg/1280px-London%2C_Tower_Bridge_--_2016_--_4772.jpg",
      alt: "川の上から見た橋の塔",
      credit: "Dietmar Rabich / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:London,_Tower_Bridge_--_2016_--_4772.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/London_MMB_Y4_Tower_Bridge.jpg/1280px-London_MMB_Y4_Tower_Bridge.jpg",
      alt: "テムズ川の高速船から近づくタワーブリッジ(2013年)",
      credit: "mattbuck / CC BY-SA 3.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:London_MMB_Y4_Tower_Bridge.jpg",
    },
  ],
  "windsor-castle": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Round_Tower%2C_Windsor_Castle%2C_England_-_Nov_2006.jpg/1280px-Round_Tower%2C_Windsor_Castle%2C_England_-_Nov_2006.jpg",
      alt: "城の中心の丸い塔、ラウンド・タワー(2006年)",
      credit: "Diliff / CC BY-SA 3.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Round_Tower,_Windsor_Castle,_England_-_Nov_2006.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Windsor_Castle_Upper_Ward_Quadrangle_2_-_Nov_2006.jpg/1280px-Windsor_Castle_Upper_Ward_Quadrangle_2_-_Nov_2006.jpg",
      alt: "アッパー・ワードの中庭(2006年)",
      credit: "Diliff / CC BY 3.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Windsor_Castle_Upper_Ward_Quadrangle_2_-_Nov_2006.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Curfew_Tower_and_the_west_wall_of_the_Castle._Windsor%2C_UK.jpg/1280px-Curfew_Tower_and_the_west_wall_of_the_Castle._Windsor%2C_UK.jpg",
      alt: "西側の城壁とカーフュー・タワー(2019年)",
      credit: "Ввласенко / CC BY-SA 3.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Curfew_Tower_and_the_west_wall_of_the_Castle._Windsor,_UK.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Cambio_de_la_Guardia_del_Castillo_de_Windsor%2C_Inglaterra%2C_2014-08-12%2C_DD_08.JPG/1280px-Cambio_de_la_Guardia_del_Castillo_de_Windsor%2C_Inglaterra%2C_2014-08-12%2C_DD_08.JPG",
      alt: "ウィンザーの町を行進する衛兵交代の楽隊(2014年)",
      credit: "Diego Delso / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Cambio_de_la_Guardia_del_Castillo_de_Windsor,_Inglaterra,_2014-08-12,_DD_08.JPG",
    },
  ],
  "big-ben": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Big_Ben_Elizabeth_Tower_London_2023_01_Detail.jpg/1280px-Big_Ben_Elizabeth_Tower_London_2023_01_Detail.jpg",
      alt: "修復を終えた時計の文字盤(2023年)",
      credit: "Julian Herzog / CC BY 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Big_Ben_Elizabeth_Tower_London_2023_01_Detail.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Big_Ben_at_sunrise%2C_2016.jpg/1280px-Big_Ben_at_sunrise%2C_2016.jpg",
      alt: "ウェストミンスター橋の側から見た朝の時計塔(2016年)",
      credit: "Bjørn Erik Pedersen / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Big_Ben_at_sunrise,_2016.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Big_Ben_at_sunset_-_2014-10-27_17-30.jpg/1280px-Big_Ben_at_sunset_-_2014-10-27_17-30.jpg",
      alt: "夕暮れのウェストミンスター橋と時計塔(2014年)",
      credit: "Colin / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Big_Ben_at_sunset_-_2014-10-27_17-30.jpg",
    },
  ],
  "london-eye": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/06_2023_London_Eye_seen_from_the_West_IMG_7510.jpg/1280px-06_2023_London_Eye_seen_from_the_West_IMG_7510.jpg",
      alt: "西側から見たロンドン・アイ(2023年)",
      credit: "Alexander-93 / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:06_2023_London_Eye_seen_from_the_West_IMG_7510.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/London_Eye%2C_2016.jpg/1280px-London_Eye%2C_2016.jpg",
      alt: "ゴンドラ(カプセル)の近景(2016年)",
      credit: "Bjørn Erik Pedersen / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:London_Eye,_2016.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/London_Eye_Twilight_April_2006.jpg/1280px-London_Eye_Twilight_April_2006.jpg",
      alt: "裏側の並木から見た夕暮れのロンドン・アイ(2006年)",
      credit: "Diliff / CC BY 2.5, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:London_Eye_Twilight_April_2006.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/London_Eye%2C_Londres%2C_Inglaterra%2C_2022-11-24%2C_DD_13-15_HDR.jpg/1280px-London_Eye%2C_Londres%2C_Inglaterra%2C_2022-11-24%2C_DD_13-15_HDR.jpg",
      alt: "夜のロンドン・アイ(2022年)",
      credit: "Diego Delso / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:London_Eye,_Londres,_Inglaterra,_2022-11-24,_DD_13-15_HDR.jpg",
    },
  ],
  "changing-the-guard-buckingham-palace": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Guard_of_Buckingham_Palace.JPG/1280px-Guard_of_Buckingham_Palace.JPG",
      alt: "バッキンガム宮殿の前に立つウェルシュ・ガーズの歩哨(2010年)",
      credit: "MaryG90 / CC BY-SA 3.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Guard_of_Buckingham_Palace.JPG",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Guard_of_Buckingham_Palace_-_02.jpg/1280px-Guard_of_Buckingham_Palace_-_02.jpg",
      alt: "宮殿の前庭で行われた交代(2011年、英国空軍連隊の儀仗隊が務めた回)",
      credit: "Carlos Delgado / CC BY-SA 3.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Guard_of_Buckingham_Palace_-_02.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Guard_of_Buckingham_Palace_-_01.jpg/1280px-Guard_of_Buckingham_Palace_-_01.jpg",
      alt: "宮殿の門の前の歩哨(2011年)",
      credit: "Carlos Delgado / CC BY-SA 3.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Guard_of_Buckingham_Palace_-_01.jpg",
    },
  ],
  "abbey-road-beatles": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Abbey_Road_zebra_crossing%2C_24-11-2015.jpg/1280px-Abbey_Road_zebra_crossing%2C_24-11-2015.jpg",
      alt: "人のいない横断歩道(2015年)",
      credit: "Peter Heeling / CC0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Abbey_Road_zebra_crossing,_24-11-2015.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Abbey_Road_zebra_crossing_%26_Abbey_Road_Studios.jpg/1280px-Abbey_Road_zebra_crossing_%26_Abbey_Road_Studios.jpg",
      alt: "横断歩道とアビー・ロード・スタジオ(2009年)",
      credit: "Josephenus P. Riley / CC BY 2.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Abbey_Road_zebra_crossing_%26_Abbey_Road_Studios.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/1969_Abbey_Road_%28edit%29.jpg/1280px-1969_Abbey_Road_%28edit%29.jpg",
      alt: "アルバム発売の前日、1969年9月25日のアビー・ロード",
      credit: "Dr. Ronald Kunze, derivative work by Clusternot / CC BY-SA 3.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:1969_Abbey_Road_(edit).jpg",
    },
  ],
  "bt-tower-london": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/London_July_2015-3.jpg/1280px-London_July_2015-3.jpg",
      alt: "下から見上げたBTタワー(2015年)",
      credit: "Alvesgaspar / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:London_July_2015-3.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Looking_west_from_the_terrace_of_the_White_Collar_Factory%2C_Old_Street%2C_2018-09-22.jpg/1280px-Looking_west_from_the_terrace_of_the_White_Collar_Factory%2C_Old_Street%2C_2018-09-22.jpg",
      alt: "オールド・ストリートのビルから西を見た眺め。奥にBTタワー(2018年)",
      credit: "Colin / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Looking_west_from_the_terrace_of_the_White_Collar_Factory,_Old_Street,_2018-09-22.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Top_of_BT_Tower_at_Dusk.jpg/1280px-Top_of_BT_Tower_at_Dusk.jpg",
      alt: "夕暮れのタワーの上部(2022年)",
      credit: "Sebastiandoe5 / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Top_of_BT_Tower_at_Dusk.jpg",
    },
  ],
  "spencer-house-london": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Spencer_House%2C_London.jpg/1280px-Spencer_House%2C_London.jpg",
      alt: "グリーン・パークから見たスペンサー・ハウス(2015年)",
      credit: "orangeaurochs / CC BY 2.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Spencer_House,_London.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Brayley%281820%29_p4.075_-_Earl_Spencer%27s_House%2C_Green_Park.jpg/1280px-Brayley%281820%29_p4.075_-_Earl_Spencer%27s_House%2C_Green_Park.jpg",
      alt: "1820年の版画に描かれたグリーン・パーク側の姿",
      credit: "Brayley (1820) / Public domain, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Brayley(1820)_p4.075_-_Earl_Spencer%27s_House,_Green_Park.jpg",
    },
  ],
  "parliament-square": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Parliament_Square_%2800769p%29.jpg/1280px-Parliament_Square_%2800769p%29.jpg",
      alt: "広場とエリザベス・タワー(ビッグ・ベン)(2025年)",
      credit: "Rhododendrites / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Parliament_Square_(00769p).jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Winston_Churchill_statue%2C_Parliament_Square%2C_London-29Sept2011.jpg/1280px-Winston_Churchill_statue%2C_Parliament_Square%2C_London-29Sept2011.jpg",
      alt: "ウィンストン・チャーチルの像(2011年)",
      credit: "Michael from Austin, TX / CC BY-SA 2.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Winston_Churchill_statue,_Parliament_Square,_London-29Sept2011.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Parliament_Square_-_Mandela_and_Peel_%284061517355%29.jpg/1280px-Parliament_Square_-_Mandela_and_Peel_%284061517355%29.jpg",
      alt: "ネルソン・マンデラとロバート・ピールの像(2009年)",
      credit: "Elliott Brown from Birmingham, United Kingdom / CC BY 2.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Parliament_Square_-_Mandela_and_Peel_(4061517355).jpg",
    },
  ],
  "barbican-centre": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Barbican_Estate_City_of_London_2026_08.jpg/1280px-Barbican_Estate_City_of_London_2026_08.jpg",
      alt: "バービカン・センターを見下ろす高架の歩道(2026年)",
      credit: "Julian Herzog / CC BY 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Barbican_Estate_City_of_London_2026_08.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Barbican_Estate_City_of_London_2026_07.jpg/1280px-Barbican_Estate_City_of_London_2026_07.jpg",
      alt: "クロムウェル・ハイウォークから見たバービカン・エステート(2026年)",
      credit: "Julian Herzog / CC BY 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Barbican_Estate_City_of_London_2026_07.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Barbican_Estate_Frobisher_Crescent_City_of_London_2026_06.jpg/1280px-Barbican_Estate_Frobisher_Crescent_City_of_London_2026_06.jpg",
      alt: "フロビッシャー・クレセントの曲面の外観(2026年)",
      credit: "Julian Herzog / CC BY 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Barbican_Estate_Frobisher_Crescent_City_of_London_2026_06.jpg",
    },
  ],
  "bbc-television-centre": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/At_London_2024_412.jpg/1280px-At_London_2024_412.jpg",
      alt: "いまのテレビジョン・センター(2024年)",
      credit: "Mike Peel / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:At_London_2024_412.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/BBC_Television_Centre_-_geograph.org.uk_-_2990251.jpg/1280px-BBC_Television_Centre_-_geograph.org.uk_-_2990251.jpg",
      alt: "入口(2012年)",
      credit: "Colin Smith / CC BY-SA 2.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:BBC_Television_Centre_-_geograph.org.uk_-_2990251.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/BBC_Television_Centre_Strollerdos_Flickr.jpg/1280px-BBC_Television_Centre_Strollerdos_Flickr.jpg",
      alt: "円形の建物に囲まれた中庭(2006年、BBCが使っていたころ)",
      credit: "Strollerdos / CC BY 2.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:BBC_Television_Centre_Strollerdos_Flickr.jpg",
    },
  ],
  "grant-museum-of-zoology": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Interior_of_the_Grant_Museum_of_Zoology%2C_London.jpg/1280px-Interior_of_the_Grant_Museum_of_Zoology%2C_London.jpg",
      alt: "標本が壁一面に並ぶ館内(2019年)",
      credit: "JRennocks / CC BY 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Interior_of_the_Grant_Museum_of_Zoology,_London.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Brains_-_Grant_Museum_of_Zoology_-_DSC00265.jpg/1280px-Brains_-_Grant_Museum_of_Zoology_-_DSC00265.jpg",
      alt: "瓶に入った脳の標本(2024年)",
      credit: "Daderot / CC0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Brains_-_Grant_Museum_of_Zoology_-_DSC00265.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Blaschka_Grant_Museum_of_Zoology_Londres_05082013_2.jpg/1280px-Blaschka_Grant_Museum_of_Zoology_Londres_05082013_2.jpg",
      alt: "ブラシュカ父子のガラスの模型(2013年)",
      credit: "Vassil / CC0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Blaschka_Grant_Museum_of_Zoology_Londres_05082013_2.jpg",
    },
  ],
  "rhs-chelsea-flower-show": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Chelsea_Flower_Show_visitors_at_Royal_Hospital_Chelsea.jpg/1280px-Chelsea_Flower_Show_visitors_at_Royal_Hospital_Chelsea.jpg",
      alt: "王立病院の建物を背に会場を歩く人たち(2019年)",
      credit: "NaturalWorld1963 / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Chelsea_Flower_Show_visitors_at_Royal_Hospital_Chelsea.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/National_Garden_Scheme_Garden_-_Chelsea_Flower_Show_2024_-_DSC01943.jpg/1280px-National_Garden_Scheme_Garden_-_Chelsea_Flower_Show_2024_-_DSC01943.jpg",
      alt: "2024年のナショナル・ガーデン・スキームの庭",
      credit: "Daderot / CC0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:National_Garden_Scheme_Garden_-_Chelsea_Flower_Show_2024_-_DSC01943.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Sanctuary_Garden%2C_Moroto_-_Chelsea_Flower_Show_2024_-_DSC02306.jpg/1280px-Sanctuary_Garden%2C_Moroto_-_Chelsea_Flower_Show_2024_-_DSC02306.jpg",
      alt: "2024年のサンクチュアリ・ガーデン部門の庭の1つ",
      credit: "Daderot / CC0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Sanctuary_Garden,_Moroto_-_Chelsea_Flower_Show_2024_-_DSC02306.jpg",
    },
  ],
  "crystal-palace-dinosaurs": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Crystal_Palace_Dinosaurs_2024_08.jpg/1280px-Crystal_Palace_Dinosaurs_2024_08.jpg",
      alt: "茂みの中の恐竜の像(2024年)",
      credit: "Celsoazevedo / CC BY 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Crystal_Palace_Dinosaurs_2024_08.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Anoplotherium_Crystal_Palace_2018.jpg/1280px-Anoplotherium_Crystal_Palace_2018.jpg",
      alt: "アノプロテリウムの群れ(2018年)",
      credit: "Dreizung / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Anoplotherium_Crystal_Palace_2018.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Heron_among_dinosaurs%2C_Crystal_Palace_Park_-_geograph.org.uk_-_2621020.jpg/1280px-Heron_among_dinosaurs%2C_Crystal_Palace_Park_-_geograph.org.uk_-_2621020.jpg",
      alt: "恐竜の像のあいだのアオサギ(2011年)",
      credit: "Jim Osley / CC BY-SA 2.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Heron_among_dinosaurs,_Crystal_Palace_Park_-_geograph.org.uk_-_2621020.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Guide_to_the_Crystal_Palace_and_Park_1856_%28147900764%29.jpg/1280px-Guide_to_the_Crystal_Palace_and_Park_1856_%28147900764%29.jpg",
      alt: "1856年の公園の案内書の挿絵",
      credit: "Samuel Phillips / Public domain, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Guide_to_the_Crystal_Palace_and_Park_1856_(147900764).jpg",
    },
  ],
  "tottenham-hotspur-stadium-tour": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Home_dressing_room_of_Tottenham_Hotspur_Stadium.jpg/1280px-Home_dressing_room_of_Tottenham_Hotspur_Stadium.jpg",
      alt: "ホームチームの更衣室(2020年)",
      credit: "Hzh / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Home_dressing_room_of_Tottenham_Hotspur_Stadium.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Players%27_tunnel_at_Tottenham_Hotspur_Stadium%2C_view_towards_pitch.jpg/1280px-Players%27_tunnel_at_Tottenham_Hotspur_Stadium%2C_view_towards_pitch.jpg",
      alt: "ピッチへ出る選手の通路(2020年)",
      credit: "Hzh / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Players%27_tunnel_at_Tottenham_Hotspur_Stadium,_view_towards_pitch.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/South_stand_of_Tottenham_Hotspur_Stadium%2C_December_2020.jpg/1280px-South_stand_of_Tottenham_Hotspur_Stadium%2C_December_2020.jpg",
      alt: "南スタンド(2020年)",
      credit: "Hzh / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:South_stand_of_Tottenham_Hotspur_Stadium,_December_2020.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Spurs_cockerel_on_the_roof_at_Tottenham_Hotspur_Stadium_2020.jpg/1280px-Spurs_cockerel_on_the_roof_at_Tottenham_Hotspur_Stadium_2020.jpg",
      alt: "屋根の上の雄鶏の像(2020年)",
      credit: "Hzh / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Spurs_cockerel_on_the_roof_at_Tottenham_Hotspur_Stadium_2020.jpg",
    },
  ],
  "st-jamess-park": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/St_James%27s_Park_London_May_2016_002.jpg/1280px-St_James%27s_Park_London_May_2016_002.jpg",
      alt: "湖の西側。奥にバッキンガム宮殿(2016年)",
      credit: "King of Hearts / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:St_James%27s_Park_London_May_2016_002.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/St_James%27s_Park_London_May_2016_001.jpg/1280px-St_James%27s_Park_London_May_2016_001.jpg",
      alt: "湖の東側。奥にホース・ガーズ(2016年)",
      credit: "King of Hearts / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:St_James%27s_Park_London_May_2016_001.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/On_The_Blue_Bridge_in_St._James%27s_Park_Lake_facing_the_London_Eye_-_July_2023.jpg/1280px-On_The_Blue_Bridge_in_St._James%27s_Park_Lake_facing_the_London_Eye_-_July_2023.jpg",
      alt: "ブルー・ブリッジから見た湖とロンドン・アイ(2023年)",
      credit: "Captain Galaxy / CC BY 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:On_The_Blue_Bridge_in_St._James%27s_Park_Lake_facing_the_London_Eye_-_July_2023.jpg",
    },
  ],
  "millennium-bridge": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/05_2023_London_Millennium_Bridge_with_St_Paul%27s_IMG_7483.jpg/1280px-05_2023_London_Millennium_Bridge_with_St_Paul%27s_IMG_7483.jpg",
      alt: "セント・ポール大聖堂へ向かう橋(2023年)",
      credit: "Alexander-93 / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:05_2023_London_Millennium_Bridge_with_St_Paul%27s_IMG_7483.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/At_London_2024_020.jpg/1280px-At_London_2024_020.jpg",
      alt: "夕暮れの橋と大聖堂(2024年)",
      credit: "Mike Peel / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:At_London_2024_020.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/London_MMB_%C2%BB0W5_Millennium_Bridge_and_The_Shard.jpg/1280px-London_MMB_%C2%BB0W5_Millennium_Bridge_and_The_Shard.jpg",
      alt: "橋とザ・シャード(2014年)",
      credit: "mattbuck / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:London_MMB_%C2%BB0W5_Millennium_Bridge_and_The_Shard.jpg",
    },
  ],
  "golden-hinde": [
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Replica_of_the_Golden_Hinde_-_geograph.org.uk_-_8391959.jpg/1280px-Replica_of_the_Golden_Hinde_-_geograph.org.uk_-_8391959.jpg",
      alt: "船着き場に浮かぶ復元船(2026年)",
      credit: "Chris Heaton / CC BY-SA 2.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Replica_of_the_Golden_Hinde_-_geograph.org.uk_-_8391959.jpg",
    },
    {
      url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Golden_Hind_replica%2C_London_1.jpg/1280px-Golden_Hind_replica%2C_London_1.jpg",
      alt: "船首の金色の雌鹿の像(2009年)",
      credit: "Mike Peel / CC BY-SA 4.0, via Wikimedia Commons",
      link: "https://commons.wikimedia.org/wiki/File:Golden_Hind_replica,_London_1.jpg",
    },
  ],
};

export function spotGalleryFor(slug: string): ContentPhoto[] {
  return SPOT_GALLERY[slug] ?? [];
}

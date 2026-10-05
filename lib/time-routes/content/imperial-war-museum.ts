import type { TimeRouteGuide } from "../types";

/**
 * 帝国戦争博物館(IWM London)。
 *
 * 公式の館内図(2025年10月版)で確かめた。館内図そのものに「1時間なら
 * 吹き抜けを見て時代を1つに絞る」「2時間以上なら4つの階を」という回り方が
 * 書いてあるので、1時間と2〜3時間はそれに沿っている。
 * - Level 0: 第一次世界大戦ギャラリー、吹き抜け(Atrium)、カフェ
 * - Level 1: 第二次世界大戦ギャラリー
 * - Level 2: ホロコースト・ギャラリー(14歳以上向け)、Peace and Security 1945–2014
 * - Level 3: Blavatnik Art, Film and Photography Galleries、企画展
 * - Level 5: 新しい展示室を準備中
 * 各階の「見どころ」は館内図の Level highlights から採った。
 *
 * 公式サイトはスクリプトからの取得を弾くので、館内図のPDFと検索結果の
 * 公式ページで確かめている。
 */
export const imperialWarMuseum: TimeRouteGuide = {
  attractionSlug: "imperial-war-museum",
  museumSlug: "imperial-war-museum",
  answer:
    "吹き抜けの大展示を見て時代を1つに絞れば1時間、第一次・第二次世界大戦とホロコーストを見るなら2〜3時間、美術と映像の階まで含めるなら半日です。",
  notes: [
    "入場無料・予約不要。開館は10:00〜18:00。",
    "ホロコースト・ギャラリーは14歳以上向けと館が案内しています。",
    "大きな荷物やスーツケースは預けられません。小さな鞄は£1硬貨を入れて使うロッカー(硬貨は戻ります)に入れられます。",
  ],
  routes: [
    {
      label: "1時間",
      minutes: 60,
      summary:
        "吹き抜けの大展示を見てから、第二次世界大戦のギャラリーに絞ります。館の案内と同じ組み方です。",
      stops: [
        {
          title: "吹き抜けの大展示",
          where: "Atrium(Level 0)",
          minutes: 10,
          note: "スピットファイアなどの機体が吊られ、V2ロケットが立つ吹き抜け。まず見上げてから動いてください。",
        },
        {
          title: "第二次世界大戦ギャラリー",
          where: "Level 1",
          minutes: 45,
          note: "2021年に開いた常設展示。D-デイに弾片を受けた水筒や、零式艦上戦闘機の残骸などが並びます。",
        },
      ],
      tip: "第一次世界大戦を見たいなら、同じ時間でLevel 0の第一次世界大戦ギャラリーに替えてください。",
    },
    {
      label: "2〜3時間",
      minutes: 150,
      summary:
        "吹き抜けから、第一次世界大戦(Level 0)、第二次世界大戦(Level 1)、ホロコースト(Level 2)と、時代の順に上がっていきます。",
      stops: [
        {
          title: "吹き抜けの大展示",
          where: "Atrium(Level 0)",
          minutes: 10,
          note: "スピットファイアとV2ロケット。",
        },
        {
          title: "第一次世界大戦ギャラリー",
          where: "Level 0",
          minutes: 40,
          note: "毒ガスで縮んだ将校の手袋や、1914年の兵士募集のポスターなど。",
        },
        {
          title: "第二次世界大戦ギャラリー",
          where: "Level 1",
          minutes: 45,
          note: "D-デイに弾片を受けた水筒、零式艦上戦闘機の残骸、ローラ・ナイトが描いたニュルンベルク裁判の絵。",
        },
        {
          title: "ホロコースト・ギャラリー",
          where: "Level 2",
          minutes: 45,
          note: "犠牲になった人々の持ち物と証言から組み立てた展示。ベルゲン・ベルゼンを生き延びたゲナ・トゥルゲルのウェディングドレスもあります。14歳以上向け。",
        },
      ],
    },
    {
      label: "半日",
      minutes: 240,
      summary:
        "2〜3時間の順路に、1945年以降の展示と、美術・写真・映像のLevel 3を足して、途中で一度休みます。",
      stops: [
        {
          title: "吹き抜けと第一次世界大戦ギャラリー",
          where: "Level 0",
          minutes: 50,
          note: "スピットファイアとV2ロケットを見上げてから、第一次世界大戦へ。",
        },
        {
          title: "第二次世界大戦ギャラリー",
          where: "Level 1",
          minutes: 45,
          note: "2021年に開いた常設展示。",
        },
        {
          title: "休憩",
          where: "Level 0のカフェ",
          minutes: 15,
          note: "カフェは17:30まで。",
        },
        {
          title: "ホロコースト・ギャラリー",
          where: "Level 2",
          minutes: 45,
          note: "14歳以上向け。",
        },
        {
          title: "Peace and Security 1945–2014",
          where: "Level 2",
          minutes: 25,
          note: "冷戦以降の戦争と紛争の展示。広島に投下された原爆と同じ型『リトルボーイ』の外殻もあります。",
        },
        {
          title: "美術・映画・写真のギャラリー",
          where: "Level 3",
          minutes: 40,
          note: "ジョン・シンガー・サージェントの大作『毒ガス』(1919年)や、ピーター・ジャクソン監督の記録映画『彼らは生きていた』。",
        },
      ],
    },
  ],
  map: {
    label: "公式の館内図(PDF)",
    url: "https://www.iwm.org.uk/sites/default/files/files/2025-10/IWM%20London%20Visitor%20Map%20Oct%202025.pdf",
  },
  sources: [
    {
      label: "IWM London – Visitor map(2025年10月版)",
      url: "https://www.iwm.org.uk/sites/default/files/files/2025-10/IWM%20London%20Visitor%20Map%20Oct%202025.pdf",
    },
    {
      label: "IWM London – Visit",
      url: "https://www.iwm.org.uk/visits/iwm-london",
    },
  ],
  checkedAt: "2026-10-05",
};

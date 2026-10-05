import type { TimeRouteGuide } from "../types";

/**
 * 大英博物館。
 *
 * 部屋番号と「見逃せない展示」は公式の館内図(2026年3月版、2026-05 掲載)で
 * 確かめた。館内図の Don't miss に挙がっているのは、ロゼッタ・ストーン(4)、
 * ライオン狩りの浮彫(10)、パルテノン神殿の彫刻(18)、ホア・ハカナナイア(24)、
 * 唐の墓の像とシヴァ・ナタラージャ(33)、ルイス島のチェス駒(40)、
 * オクサスの遺宝(52)、ベニンの飾り板(25)など。順路はこれを軸に組んだ。
 *
 * 7・9・10・19・20室と57・58室は 11:00〜15:00 しか開かない(館内図の注記)。
 * 41室(サットン・フー)は 2026-10-12〜23 に一部閉室。70室(ポートランドの壺)は
 * 11月に閉室の予定があるため順路に入れていない。
 *
 * 公式サイトはスクリプトからの取得を弾くので、館内図のPDFと検索結果の
 * 公式ページで確かめている。
 */
const BM = "/museums/british-museum/artworks";

export const britishMuseum: TimeRouteGuide = {
  attractionSlug: "british-museum-london",
  museumSlug: "british-museum",
  answer:
    "教科書に載る展示に絞れば1時間、地域をまたいで主要な展示を回るなら2〜3時間、アフリカや日本の展示まで足を延ばすなら半日です。",
  notes: [
    "入場無料。公式サイトで無料の時間指定チケットを取っておくと、混む日でも入りやすくなります。入口は正面のグレート・ラッセル通りと、北側のモンタギュー・プレイスの2か所です。",
    "開館は10:00〜17:00、金曜は20:30まで(最終入場は閉館15分前)。",
    "アッシリアの浮彫がある7・9・10室と、ギリシャの19・20室は11:00〜15:00しか開いていません(2026年3月版の館内図による)。",
  ],
  routes: [
    {
      label: "1時間",
      minutes: 60,
      summary:
        "ロゼッタ・ストーンとパルテノン神殿の彫刻を見てから上の階へ。ミイラ、サットン・フーの兜、ルイス島のチェス駒の5か所です。",
      stops: [
        {
          title: "ロゼッタ・ストーン",
          where: "Room 4",
          minutes: 8,
          note: "同じ布告をヒエログリフ、民衆文字、ギリシャ文字の3通りで刻んだ石碑。いちばん混む展示なので最初に。",
          href: `${BM}/2606e6b4-cd3e-4b5c-b8e4-16c243c10821`,
        },
        {
          title: "パルテノン神殿の彫刻",
          where: "Room 18",
          minutes: 12,
          note: "アテネのパルテノン神殿の破風と壁面を飾っていた大理石彫刻を、大きな一室に並べています。",
          href: `${BM}/e4c35bd6-6df5-4360-b1f9-9876b0fe76a1`,
        },
        {
          title: "エジプトのミイラ",
          where: "Room 62〜63(Upper floor)",
          minutes: 12,
          note: "ミイラと棺が並ぶ2部屋。館内でも人が集まる一角です。",
          href: `${BM}/9fdd3596-45e7-4cbd-9519-2c0e227fc761`,
        },
        {
          title: "サットン・フーの兜",
          where: "Room 41(Upper floor)",
          minutes: 8,
          note: "7世紀のアングロ・サクソンの船葬墓から出た副葬品。2026年10月12〜23日は部屋の一部が閉まります。",
          href: `${BM}/9050b3de-27eb-4ac1-bf3a-938bdce46e33`,
        },
        {
          title: "ルイス島のチェス駒",
          where: "Room 40(Upper floor)",
          minutes: 6,
          note: "12世紀にセイウチの牙などで彫られたチェス駒。41室から続けて見られます。",
          href: `${BM}/c22aab98-21f6-4b84-9eec-e0f28cdcba57`,
        },
      ],
    },
    {
      label: "2〜3時間",
      minutes: 150,
      summary:
        "1時間の5か所に、アッシリアのライオン狩りの浮彫、イースター島のモアイ、中国と南アジアの展示、古代イランのオクサスの遺宝を足します。",
      stops: [
        {
          title: "ロゼッタ・ストーンとエジプトの彫刻",
          where: "Room 4",
          minutes: 12,
          note: "ロゼッタ・ストーンのほか、アメンホテプ3世の巨大な頭像も同じ部屋にあります。",
          href: `${BM}/2606e6b4-cd3e-4b5c-b8e4-16c243c10821`,
        },
        {
          title: "アッシリアのライオン狩りの浮彫",
          where: "Room 10",
          minutes: 10,
          note: "ニネヴェの王宮を飾っていた浮彫。この部屋は11:00〜15:00しか開かないので、時間を合わせてください。",
        },
        {
          title: "パルテノン神殿の彫刻",
          where: "Room 18",
          minutes: 15,
          note: "破風の彫像と、神殿の壁を一周していた浮彫(フリーズ)。",
          href: `${BM}/e4c35bd6-6df5-4360-b1f9-9876b0fe76a1`,
        },
        {
          title: "イースター島のモアイ『ホア・ハカナナイア』",
          where: "Room 24",
          minutes: 6,
          note: "「生と死」をテーマにした部屋に立つ、玄武岩の祖先像です。",
          href: `${BM}/12d97789-5ae8-4a9a-9681-ce4dd5c17cb2`,
        },
        {
          title: "中国と南アジア",
          where: "Room 33",
          minutes: 12,
          note: "唐の将軍の墓から出た陶製の像と、南インドのブロンズ像『シヴァ・ナタラージャ』。",
          href: `${BM}/82eee86c-c201-4655-bd1f-aa929989feb1`,
        },
        {
          title: "エジプトのミイラ",
          where: "Room 62〜63(Upper floor)",
          minutes: 15,
          note: "ミイラと棺、副葬品が並ぶ2部屋。",
          href: `${BM}/9fdd3596-45e7-4cbd-9519-2c0e227fc761`,
        },
        {
          title: "オクサスの遺宝",
          where: "Room 52(Upper floor)",
          minutes: 6,
          note: "アケメネス朝ペルシャ時代の金銀細工です。",
        },
        {
          title: "サットン・フーの兜",
          where: "Room 41(Upper floor)",
          minutes: 10,
          note: "2026年10月12〜23日は部屋の一部が閉まります。",
          href: `${BM}/9050b3de-27eb-4ac1-bf3a-938bdce46e33`,
        },
        {
          title: "ルイス島のチェス駒",
          where: "Room 40(Upper floor)",
          minutes: 6,
          note: "12世紀にセイウチの牙などで彫られたチェス駒。",
          href: `${BM}/c22aab98-21f6-4b84-9eec-e0f28cdcba57`,
        },
      ],
    },
    {
      label: "半日",
      minutes: 240,
      summary:
        "2〜3時間の順路に、地下のアフリカ、上階のエジプトの墓の壁画、日本の展示を足して、グレート・コートで一度休みます。",
      stops: [
        {
          title: "地上階の西側(エジプト・アッシリア・ギリシャ)",
          where: "Room 4〜23",
          minutes: 50,
          note: "ロゼッタ・ストーン(4)、ライオン狩りの浮彫(10。11:00〜15:00のみ)、ネレイド記念碑(17)、パルテノン神殿の彫刻(18)。",
          href: `${BM}/95836a46-adba-4afd-baab-b8fd4904983c`,
        },
        {
          title: "地上階の北側(オセアニア・メキシコ・アジア)",
          where: "Room 24〜33",
          minutes: 35,
          note: "モアイ『ホア・ハカナナイア』(24)、トルコ石のモザイク仮面(27)、唐の墓の像とシヴァ・ナタラージャ(33)。",
          href: `${BM}/2e059156-43a9-42b4-9b30-67f8a61fc1dd`,
        },
        {
          title: "アフリカ",
          where: "Room 25(Lower floor)",
          minutes: 20,
          note: "ベニン王国の真鍮の飾り板が並ぶ地下の展示室。混み合うと入場を絞ることがあります。",
        },
        {
          title: "休憩",
          where: "グレート・コート",
          minutes: 20,
          note: "ガラス屋根の中庭にカフェがあります。",
        },
        {
          title: "エジプトの暮らしと死",
          where: "Room 61〜64(Upper floor)",
          minutes: 40,
          note: "ネバムンの墓の壁画(61)、ミイラ(62〜63)、5,000年以上前の遺体『ゲベレインの男性』(64)。",
          href: `${BM}/f9f4c6fa-616d-489a-b5f6-083a818151fd`,
        },
        {
          title: "古代イランと中世ヨーロッパ",
          where: "Room 52・41・40(Upper floor)",
          minutes: 25,
          note: "オクサスの遺宝(52)、サットン・フーの兜(41)、ルイス島のチェス駒(40)。",
        },
        {
          title: "日本の展示",
          where: "Room 92〜94(Level 5)",
          minutes: 25,
          note: "北側の階段で上がった最上階。日本の美術と工芸が英国でどう紹介されているかを見られます。",
          href: `${BM}/c7dc43c5-a316-4eb5-bad2-efb2af7a453b`,
        },
      ],
    },
  ],
  map: {
    label: "公式の館内図(PDF)",
    url: "https://www.britishmuseum.org/sites/default/files/2026-05/British_Museum_map.pdf",
  },
  sources: [
    {
      label: "British Museum – Museum map(2026年3月版)",
      url: "https://www.britishmuseum.org/sites/default/files/2026-05/British_Museum_map.pdf",
    },
    {
      label: "British Museum – Visit(開館時間・閉室)",
      url: "https://www.britishmuseum.org/visit",
    },
    {
      label: "British Museum – Late opening on Fridays",
      url: "https://www.britishmuseum.org/visit/late-opening-on-fridays",
    },
  ],
  checkedAt: "2026-10-05",
};

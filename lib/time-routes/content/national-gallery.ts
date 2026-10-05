import type { TimeRouteGuide } from "../types";

/**
 * ナショナル・ギャラリー。
 *
 * 2025年5月のセインズベリー翼の再開に合わせて全館が掛け替えられ、
 * 13世紀から20世紀初めまでが時代順に並んだ。セインズベリー翼(Room 51〜66)が
 * 1260〜1550年、本館の Room 2〜14 が1500〜1600年、15〜32 が1600〜1700年、
 * 33〜37と中央ホールが18世紀、38〜46 が1800年以降。順路はこの並びに沿って、
 * 入口のあるセインズベリー翼から本館の東へ抜ける向きで組んである。
 *
 * 部屋番号は 2026-10-05 に公式の部屋別ページ(floorplans/level-2/room-XX)で
 * 1点ずつ確かめた。DB の Artwork.room は掛け替え前の番号が残っているものが
 * あったので、ここで使った作品は scripts/fix-time-route-facts-2026-10.ts で
 * 合わせてある(ロキービー・ヴィーナス 30→19、フェルメール 16→25 など)。
 *
 * 『ひまわり』は 2026-06-06〜10-11 にフィラデルフィア美術館へ貸し出し中。
 * 戻ってからの展示再開日は発表が無いので、日付つきで書いて作品ページへ送る。
 */
const NG = "/museums/national-gallery/artworks";

export const nationalGallery: TimeRouteGuide = {
  attractionSlug: "national-gallery-london",
  museumSlug: "national-gallery",
  answer:
    "名画に絞れば1時間、時代順に代表作をたどるなら2〜3時間、全館をひと通り歩くなら半日です。",
  notes: [
    "入口はトラファルガー広場に面したセインズベリー翼です。入場は無料で、無料の時間指定チケットを取っておくと優先して入れます(予約なしでも入れます)。",
    "開館は10:00〜18:00、金曜だけ21:00まで。",
    "閉まっている部屋は日によって変わります。2026年10月5日の時点では7・8室、16・17室、30・31室などが閉まっていました。",
  ],
  routes: [
    {
      label: "1時間",
      minutes: 60,
      summary:
        "セインズベリー翼の『岩窟の聖母』と『アルノルフィーニ夫妻の肖像』から、ホルバイン『大使たち』、ターナー、ゴッホの部屋へ。時代順に5か所だけ寄ります。",
      stops: [
        {
          title: "レオナルド・ダ・ヴィンチ『岩窟の聖母』",
          where: "Room 51",
          minutes: 8,
          note: "セインズベリー翼の部屋。同じ部屋に、イングランド王リチャード2世を描いた祭壇画『ウィルトン・ディプティク』も掛かっています。",
          href: `${NG}/9af2ef67-7f8c-4796-b273-e0ad105aec74`,
        },
        {
          title: "ヤン・ファン・エイク『アルノルフィーニ夫妻の肖像』",
          where: "Room 52",
          minutes: 7,
          note: "奥の凸面鏡に、部屋の入口に立つ2人の人物が小さく映っています。鏡の上の署名と一緒に、近づいて見てください。",
          href: `${NG}/5e1e7b70-ce53-428e-b433-9dd802a33d27`,
        },
        {
          title: "ハンス・ホルバイン『大使たち』",
          where: "Room 4",
          minutes: 6,
          note: "2人の足元に斜めに伸びる形は、絵の横へ回り込んで斜めから見ると髑髏になります。正面で見たあと、位置を変えて探してください。",
          href: `${NG}/f62c80ef-c561-4c54-8262-ea922fc4be9d`,
        },
        {
          title: "ターナー『戦うテメレール号』",
          where: "Room 40",
          minutes: 7,
          note: "解体されに行く帆船を、蒸気のタグボートが曳く場面。同じ部屋の『雨、蒸気、速度』と並べて見られます。",
          href: `${NG}/26c8262e-6cac-4418-8cb3-6ea8ddfcc0c0`,
        },
        {
          title: "ゴッホの部屋(『ひまわり』『ゴッホの椅子』)",
          where: "Room 43",
          minutes: 10,
          note: "『ひまわり』は2026年6月6日〜10月11日、米フィラデルフィア美術館に貸し出されています。展示に戻る日は作品ページで確かめてください。同じ部屋の『ゴッホの椅子』『糸杉のある麦畑』はそのまま見られます。",
          href: `${NG}/1e7aa46e-8b4d-4947-beee-2e7c96bafe5d`,
        },
      ],
      tip: "時間が余ったら、すぐ近くのRoom 44でスーラ『アニエールの水浴』、Room 46でモネの睡蓮を。",
    },
    {
      label: "2〜3時間",
      minutes: 150,
      summary:
        "初期ルネサンスから印象派まで、時代順に16か所。ベラスケス、レンブラント、フェルメール、カラヴァッジョも入ります。",
      stops: [
        {
          title: "レオナルド・ダ・ヴィンチ『岩窟の聖母』",
          where: "Room 51",
          minutes: 8,
          note: "同じ部屋に『ウィルトン・ディプティク』と、ミケランジェロの未完の板絵『マンチェスターの聖母』。",
          href: `${NG}/9af2ef67-7f8c-4796-b273-e0ad105aec74`,
        },
        {
          title: "ヤン・ファン・エイク『アルノルフィーニ夫妻の肖像』",
          where: "Room 52",
          minutes: 7,
          note: "奥の凸面鏡に、部屋の入口に立つ2人が映っています。",
          href: `${NG}/5e1e7b70-ce53-428e-b433-9dd802a33d27`,
        },
        {
          title: "ボッティチェリ『神秘的な降誕』",
          where: "Room 60",
          minutes: 6,
          note: "画面の上で天使たちが輪になって舞う降誕図。同じ部屋にフィリッポ・リッピ『受胎告知』もあります。",
          href: `${NG}/85049a23-db02-4f71-9c08-4025a0a14598`,
        },
        {
          title: "ハンス・ホルバイン『大使たち』",
          where: "Room 4",
          minutes: 6,
          note: "足元の斜めの形は、絵の横から見ると髑髏になります。",
          href: `${NG}/f62c80ef-c561-4c54-8262-ea922fc4be9d`,
        },
        {
          title: "ヴェネツィア派(ティツィアーノ『ラ・スキアヴォナ』ほか)",
          where: "Room 10",
          minutes: 6,
          note: "ヴェネツィアの色彩の部屋。ヴェロネーゼ『アレクサンドロスの前のダレイオス家族』、ティントレット『天の川の起源』も並びます。",
          href: `${NG}/25b7fce4-17dc-43f3-a178-e6cdd6cdcc35`,
        },
        {
          title: "ベラスケス『ヴィーナスの化粧(ロキービー・ヴィーナス)』",
          where: "Room 19",
          minutes: 6,
          note: "スペイン絵画の部屋。ベラスケスが8点まとまっています。",
          href: `${NG}/6ccc7e7c-36c7-4865-8c1a-8f29e25245cf`,
        },
        {
          title: "レンブラント『63歳の自画像』",
          where: "Room 22",
          minutes: 7,
          note: "レンブラントだけの部屋。亡くなる年に描いた自画像と、『ベルシャザルの饗宴』を。",
          href: `${NG}/2151a019-4f5e-43f4-a93f-ff8b57fd9853`,
        },
        {
          title: "フェルメール『ヴァージナルの前に立つ若い女性』",
          where: "Room 25",
          minutes: 6,
          note: "対になる『ヴァージナルの前に座る若い女性』と2点並んでいます。同じ部屋にデルフトの画家たちの室内画も。",
          href: `${NG}/dae75a1c-f5b0-46a0-8d9d-2129a5edf3b1`,
        },
        {
          title: "カラヴァッジョ『エマオの晩餐』",
          where: "Room 32",
          minutes: 6,
          note: "イタリア・バロックの部屋。カラヴァッジョが3点と、アルテミジア・ジェンティレスキの自画像があります。",
        },
        {
          title: "スタッブス『ホイッスルジャケット』",
          where: "Room 34",
          minutes: 6,
          note: "背景を描かずに馬だけを実物大で描いた大作。同じ部屋にゲインズバラ『アンドリューズ夫妻』と、ホガースの連作『当世風の結婚』。",
          href: `${NG}/441f4a96-4939-4f2f-b93b-2852743d8aef`,
        },
        {
          title: "ドラローシュ『ジェーン・グレイの処刑』",
          where: "Room 38",
          minutes: 4,
          note: "在位9日で廃され、ロンドン塔で処刑された女王を、目隠しの姿で描いた大作です。",
          href: `${NG}/0c1dd077-238d-4df3-9ec8-2be7bcb12765`,
        },
        {
          title: "ターナー『戦うテメレール号』『雨、蒸気、速度』",
          where: "Room 40",
          minutes: 7,
          note: "ターナー、コンスタブル、コローの風景画の部屋。",
          href: `${NG}/26c8262e-6cac-4418-8cb3-6ea8ddfcc0c0`,
        },
        {
          title: "マネ『メキシコ皇帝マクシミリアンの処刑』",
          where: "Room 41",
          minutes: 5,
          note: "初期の印象派の部屋。この絵は切り分けられた断片を、のちにドガがつなぎ直した姿で残っています。モネ『ウェストミンスター下のテムズ川』も同じ部屋に。",
          href: `${NG}/56d3fa22-2c37-4a2d-9015-f7d071b68006`,
        },
        {
          title: "ゴッホの部屋",
          where: "Room 43",
          minutes: 8,
          note: "『ゴッホの椅子』『糸杉のある麦畑』など。『ひまわり』は2026年10月11日まで米フィラデルフィア美術館に貸し出し中で、展示に戻る日は作品ページで確かめてください。",
          href: `${NG}/1e7aa46e-8b4d-4947-beee-2e7c96bafe5d`,
        },
        {
          title: "スーラ『アニエールの水浴』",
          where: "Room 44",
          minutes: 4,
          note: "セザンヌとスーラの部屋。この大作のための習作も一緒に掛かっています。",
          href: `${NG}/f974aa43-194e-4721-89c2-25109a781f71`,
        },
        {
          title: "モネ『睡蓮の池』",
          where: "Room 46",
          minutes: 5,
          note: "モネだけの部屋。太鼓橋を描いた1899年の『睡蓮の池』から、晩年の大きな睡蓮まで。",
          href: `${NG}/c7f3737e-ba01-4dc0-bdb9-94dcc32768f8`,
        },
      ],
    },
    {
      label: "半日",
      minutes: 240,
      summary:
        "セインズベリー翼から本館へ、時代の区切りごとに全館を歩きます。真ん中で一度休憩を入れます。",
      stops: [
        {
          title: "中世と初期ルネサンス(1260〜1550年)",
          where: "セインズベリー翼 Room 51〜66",
          minutes: 60,
          note: "金地の板絵から、ファン・エイク、ボッティチェリ、ピエロ・デッラ・フランチェスカ(Room 66)、レオナルドまで。部屋の数が多く、ここだけで1時間かかります。",
        },
        {
          title: "ルネサンス(1500〜1600年)",
          where: "本館 Room 2〜14",
          minutes: 40,
          note: "ホルバイン『大使たち』(Room 4)、ヴェネツィア派(Room 10)、マンテーニャの連作『カエサルの勝利』(Room 12)。",
        },
        {
          title: "休憩",
          where: "館内のカフェ",
          minutes: 20,
          note: "カフェとレストランが館内に複数あります。場所は館内図で。",
        },
        {
          title: "バロック(1600〜1700年)",
          where: "Room 15〜32",
          minutes: 50,
          note: "ルーベンス(Room 18)、ベラスケス(19)、レンブラント(22)、フェルメール(25)、カラヴァッジョ(32)。",
        },
        {
          title: "18世紀",
          where: "Room 33〜37・中央ホール",
          minutes: 25,
          note: "18世紀のヴェネツィア絵画(Room 33)、ゲインズバラやスタッブスの英国絵画(34)。中央ホールには等身大の肖像画が並びます。",
        },
        {
          title: "19世紀から20世紀初め",
          where: "Room 38〜46",
          minutes: 45,
          note: "ジェーン・グレイの処刑(Room 38)、ターナー(40)、印象派(41)、ゴッホ(43)、スーラ(44)、モネ(46)。人気の部屋が最後に集まるので、時間を残しておいてください。",
        },
      ],
    },
  ],
  map: {
    label: "公式の館内図(部屋ごとの展示)",
    url: "https://www.nationalgallery.org.uk/visiting/floorplans/level-2",
  },
  sources: [
    {
      label: "National Gallery – Level 2(部屋ごとの展示)",
      url: "https://www.nationalgallery.org.uk/visiting/floorplans/level-2",
    },
    {
      label: "National Gallery – Plan your visit",
      url: "https://www.nationalgallery.org.uk/visiting/plan-your-visit",
    },
    {
      label: "National Gallery – Sunflowers",
      url: "https://www.nationalgallery.org.uk/paintings/vincent-van-gogh-sunflowers",
    },
    {
      label: "Philadelphia Art Museum – Van Gogh's Sunflowers",
      url: "https://press.philamuseum.org/van-goghs-sunflowers-a-symphony-in-blue-and-yellow/",
    },
  ],
  checkedAt: "2026-10-05",
};

import type { TimeRouteGuide } from "../types";

/**
 * テート・モダン。
 *
 * コレクション展示は数か月ごとに掛け替えられ、部屋の番号と中身の対応が
 * 頻繁に変わる(館内図とウェブの部屋番号が食い違っていることもある)。
 * そのため順路は部屋番号ではなく、展示の名前と階で書いている。
 * 2026-10-05 に公式の館内図(TM_map.pdf)と展示ページで確かめた。
 * - ナタリー・ベル棟 Level 2 東側「In the Studio」: ロスコの部屋
 *   (シーグラム壁画)、International Surrealism。ロスコ『Black on Maroon』は
 *   作品ページに「On display at Tate Modern part of Level 2: In the Studio」。
 * - Level 2「Artist and Society」、Level 3「Performer and Participant」、
 *   Level 4「Materials and Objects」「Media Networks」。
 * - タービン・ホール: Hyundai Commission はタレク・アトゥイ
 *   (2026-10-13〜2027-04-11)。
 * - ブラヴァトニック棟 Level 10 が無料の展望階。
 * - 有料の企画展: フリーダ・カーロ展(〜2027-01-03)、アナ・メンディエタ展
 *   (〜2027-01-17)など。
 */
export const tateModern: TimeRouteGuide = {
  attractionSlug: "tate-modern",
  museumSlug: "tate-modern",
  answer:
    "タービン・ホールとロスコの部屋、10階の展望階だけなら1時間、コレクション展示の各階を回るなら2〜3時間、有料の企画展まで入れるなら半日です。",
  notes: [
    "コレクション展示は無料・予約不要。有料なのは企画展だけです。",
    "開館は日〜木曜10:00〜18:00、金・土曜は21:00まで。最終入場は閉館30分前です。",
    "部屋の番号と中身は掛け替えで頻繁に変わるので、展示の名前と階で探してください。",
  ],
  routes: [
    {
      label: "1時間",
      minutes: 60,
      summary:
        "タービン・ホールから、Level 2のロスコの部屋とシュルレアリスムの部屋へ。最後にブラヴァトニック棟10階の展望階に上がります。",
      stops: [
        {
          title: "タービン・ホール",
          where: "Level 0",
          minutes: 10,
          note: "発電所のタービンが並んでいた吹き抜け。毎年秋から春まで大型の新作が入り、2026年は10月13日からタレク・アトゥイの作品です。入れ替えの時期は空のこともあります。",
        },
        {
          title: "マーク・ロスコの部屋",
          where: "Level 2 東側「In the Studio」",
          minutes: 15,
          note: "レストランのために描かれ、納められなかった『シーグラム壁画』の連作が、薄暗い部屋を囲んでいます。",
          href: "/museums/tate-modern/artworks/7676cb3c-85b0-497d-992e-3f398dbf679c",
        },
        {
          title: "シュルレアリスムの部屋",
          where: "Level 2 東側「In the Studio」",
          minutes: 10,
          note: "パリのシュルレアリストたちと、世界各地の同時代の作家を並べた部屋です。",
        },
        {
          title: "展望階",
          where: "ブラヴァトニック棟 Level 10",
          minutes: 15,
          note: "無料で上がれる展望階。テムズ川越しに、セント・ポール大聖堂が正面に見えます。",
        },
      ],
    },
    {
      label: "2〜3時間",
      minutes: 150,
      summary:
        "Level 2から4まで、テーマ別のコレクション展示を各階で回り、最後に展望階へ上がります。",
      stops: [
        {
          title: "タービン・ホール",
          where: "Level 0",
          minutes: 10,
          note: "その時期の大型作品。入れ替えの時期は空のこともあります。",
        },
        {
          title: "In the Studio",
          where: "Level 2 東側",
          minutes: 30,
          note: "ロスコの部屋、シュルレアリスム、ジョーン・ミッチェルなど、画家の制作をテーマにした展示です。",
          href: "/museums/tate-modern/artworks/7676cb3c-85b0-497d-992e-3f398dbf679c",
        },
        {
          title: "Artist and Society",
          where: "Level 2 西側",
          minutes: 25,
          note: "ゲルハルト・リヒターの部屋や、写真家ダイアン・アーバスの部屋など。",
        },
        {
          title: "Performer and Participant",
          where: "Level 3",
          minutes: 20,
          note: "マリーナ・アブラモヴィッチ、ピピロッティ・リストら、身体や観客を作品に巻き込む作家たち。",
        },
        {
          title: "Materials and ObjectsとMedia Networks",
          where: "Level 4",
          minutes: 30,
          note: "身の回りの素材を使った作品と、メディアや大衆文化を扱う作品。ウォーホルの部屋もこの階です。",
        },
        {
          title: "展望階",
          where: "ブラヴァトニック棟 Level 10",
          minutes: 15,
          note: "無料。セント・ポール大聖堂とシティを川越しに。",
        },
      ],
    },
    {
      label: "半日",
      minutes: 240,
      summary:
        "2〜3時間の順路に、有料の企画展を1本(予約がおすすめ)と、地下のタンクス、カフェでの休憩を足します。",
      stops: [
        {
          title: "有料の企画展",
          where: "展覧会ごとに階が違う(館内図で確認)",
          minutes: 75,
          note: "2026年10月の時点では、フリーダ・カーロ展(2027年1月3日まで)やアナ・メンディエタ展(1月17日まで)など。館は予約を勧めています。",
        },
        {
          title: "コレクション展示",
          where: "Level 2〜4",
          minutes: 100,
          note: "In the Studio(ロスコの部屋)、Artist and Society、Performer and Participant、Materials and Objects。",
          href: "/museums/tate-modern/artworks/7676cb3c-85b0-497d-992e-3f398dbf679c",
        },
        {
          title: "休憩",
          where: "Level 6のレストランか、Level 10のカフェ",
          minutes: 20,
          note: "どちらも川を見下ろせる位置にあります。",
        },
        {
          title: "タービン・ホールとタンクス",
          where: "Level 0",
          minutes: 20,
          note: "地下の円筒形の空間タンクスは、映像とパフォーマンスのための展示室です。",
        },
        {
          title: "展望階",
          where: "ブラヴァトニック棟 Level 10",
          minutes: 15,
          note: "金・土曜は21:00まで開いているので、日没後の眺めも見られます。",
        },
      ],
    },
  ],
  map: {
    label: "公式の館内図(PDF)",
    url: "https://media.tate.org.uk/aztate-prd-ew-dg-wgtail-st1-ctr-data/galleries/TM_map.pdf",
  },
  sources: [
    {
      label: "Tate Modern – Visit",
      url: "https://www.tate.org.uk/visit/tate-modern",
    },
    {
      label: "Tate Modern – In the Studio",
      url: "https://www.tate.org.uk/visit/tate-modern/display/in-the-studio",
    },
    {
      label: "Tate Modern – What's on",
      url: "https://www.tate.org.uk/whats-on/tate-modern",
    },
    {
      label: "Tate Modern – Map(PDF)",
      url: "https://media.tate.org.uk/aztate-prd-ew-dg-wgtail-st1-ctr-data/galleries/TM_map.pdf",
    },
  ],
  checkedAt: "2026-10-05",
};

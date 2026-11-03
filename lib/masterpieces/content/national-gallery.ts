import type { MasterpieceGuide } from "../types";

/**
 * ナショナル・ギャラリーの名作ページ。
 *
 * 事実は公式の作品ページ(About the work・Key facts・Exhibition history)と
 * 館内図で確かめた。展示状況はページが毎日公式を読んで出す
 * (lib/masterpieces/national-gallery.ts)。checked は人が最後に確かめた
 * 記録で、公式が読めなかった日にだけ出る。
 *
 * 館は研究センター(2028年開館予定)に向けた工事で部屋を閉め、作品を移して
 * いる(公式の訪問案内、2026-10-30)。部屋番号は変わりうるので、本文には
 * 書かない。部屋番号は checked と、ページが公式から読んだ値だけが持つ。
 */

const NG = "/museums/national-gallery/artworks";

/** 名作ページの展示状況の下に添える、館全体の注意。 */
export const NATIONAL_GALLERY_NOTE =
  "ナショナル・ギャラリーは、研究センター(2028年開館予定)に向けた工事で一部の部屋を閉め、作品を移しています。公式は、目当ての作品があるなら行く前に現在の場所を確かめるよう勧めています。";

const sunflowers: MasterpieceGuide = {
  artworkId: "1e7aa46e-8b4d-4947-beee-2e7c96bafe5d",
  museumSlug: "national-gallery",
  name: "ゴッホ『ひまわり』",
  officialUrl:
    "https://www.nationalgallery.org.uk/paintings/vincent-van-gogh-sunflowers",
  checked: {
    on: "2026-10-30",
    placement: { state: "on-display", level: "Level 2", room: "Room 43" },
  },
  photo: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Vincent_Willem_van_Gogh_127.jpg/1280px-Vincent_Willem_van_Gogh_127.jpg",
    alt: "ゴッホ『ひまわり』(1888年、ナショナル・ギャラリー所蔵)。黄色い背景の前に、15本のひまわりを挿した花瓶",
    credit: "Vincent van Gogh / Public domain, via Wikimedia Commons",
    link: "https://commons.wikimedia.org/wiki/File:Vincent_Willem_van_Gogh_127.jpg",
    width: 3349,
    height: 4226,
  },
  description:
    "ゴッホ『ひまわり』がナショナル・ギャラリーのどの部屋にあり、いま見られるかを公式サイトで確かめて載せています。見るところ3点と、東京のSOMPO美術館の『ひまわり』との関係も。",
  facts: [
    { label: "作者", value: "フィンセント・ファン・ゴッホ(1853〜1890)" },
    { label: "制作", value: "1888年8月、南フランスのアルル" },
    { label: "技法・大きさ", value: "油彩・カンヴァス、92.1 × 73 cm" },
    {
      label: "所蔵の経緯",
      value: "1924年にコートールド基金で購入。1961年にテート・ギャラリーから移管",
    },
    { label: "入館料", value: "無料(常設展示)" },
  ],
  minutes: 10,
  route:
    "入口はトラファルガー広場に面したセインズベリー翼で、館の西の端にあります。Room 43 は反対の東側、1800年以降の絵が並ぶ38〜46室の中にあるので、館内の案内で「Room 43」をたどって本館を東へ抜けます。",
  lookFor: [
    {
      heading: "15本の花の一生",
      body: "つぼみから満開、花びらが落ちて種になるまで、15本がそれぞれ違う時期の姿で描かれています。館の解説によれば、左下のつぼみはまだ開ききらず、満開が7本、花びらを落として種になりかけたものが7本です。",
    },
    {
      heading: "盛り上がった絵の具",
      body: "花びら・葉・茎は形に沿った長い筆の跡で、種の部分は小さく盛り上げた絵の具の点でざらつきを出しています。19世紀に出回った固めの油絵の具を生かした厚塗り(インパスト)です。実物の前で、近くから見てください。",
    },
    {
      heading: "黄色だけの絵と「Vincent」の署名",
      body: "ゴッホ自身が「すべて黄色の絵」と呼んだとおり、色は黄色に絞られ、オレンジがかった黄土色から背景の淡い緑がかった黄色まで幅があります。花瓶の署名は名前だけの「Vincent」。姓は発音しにくいと言われていたので、名前で署名していました。",
    },
  ],
  about: [
    "1888年8月、南フランスのアルルにいたゴッホは、借りていた「黄色い家」に画家のポール・ゴーギャンを迎えるため、部屋を飾るひまわりの絵を描き始めました。最初の4点はわずか1週間で描き、弟テオに「マルセイユの人がブイヤベースを食べるような勢いで描いている」と書き送っています。",
    "この絵は、その4点のうちゴッホが「掛けるに足る」と考えて署名した2点の1つです。もう1点はミュンヘンのノイエ・ピナコテークにある『14本のひまわり』で、ゴッホはこの2点を、ゴーギャンが使う客間に掛けました。ゴーギャンは10月23日に着きましたが、12月23日に2人は衝突し、ゴッホが自分の左耳の一部を切ったあと、ゴーギャンはパリへ戻りました。",
    "連作は1888〜89年に全部で7点描かれ、いま美術館で公開されているのは5点です。ロンドンのほかは、アムステルダムのファン・ゴッホ美術館、ミュンヘンのノイエ・ピナコテーク、フィラデルフィア美術館、東京のSOMPO美術館。残る2点のうち1点は個人蔵で長く公開されておらず、もう1点は1921年に日本のコレクターが買い、第二次世界大戦中に失われました。",
    "SOMPO美術館は、自館の『ひまわり』について、8月に描かれたこのロンドンの1点をもとに、ゴッホがゴーギャンと暮らしていた1888年11月下旬から12月上旬ごろに描かれたと考えられている、と説明しています。基本の色と構図は同じで、筆の運びや色調が違います。東京で見たことがあれば、見比べてみてください。",
  ],
  history: [
    {
      period: "2026年6月6日〜10月11日",
      note: "米フィラデルフィア美術館の展覧会「Van Gogh's Sunflowers: A Symphony in Blue and Yellow」に貸し出し",
    },
    {
      period: "2024年9月14日〜2025年1月19日",
      note: "館内の特別展「Van Gogh: Poets and Lovers」に出品",
    },
  ],
  sameRoom: [
    {
      label: "ゴッホ『ゴッホの椅子』",
      href: `${NG}/392018a2-490f-4f6c-886c-7625648093ed`,
    },
    {
      label: "ゴッホ『糸杉のある麦畑』",
      href: `${NG}/110e6440-654e-41bd-bf5f-608bfa97e963`,
    },
  ],
  sources: [
    {
      label: "National Gallery – Sunflowers",
      url: "https://www.nationalgallery.org.uk/paintings/vincent-van-gogh-sunflowers",
    },
    {
      label: "National Gallery – Level 2, Room 43",
      url: "https://www.nationalgallery.org.uk/visiting/floorplans/level-2/room-43",
    },
    {
      label: "National Gallery – Visiting(入口・工事中の部屋)",
      url: "https://www.nationalgallery.org.uk/visiting",
    },
    {
      label: "SOMPO美術館 – フィンセント・ファン・ゴッホ《ひまわり》",
      url: "https://www.sompo-museum.org/collection/gogh/",
    },
  ],
};

export const NATIONAL_GALLERY_GUIDES: readonly MasterpieceGuide[] = [sunflowers];

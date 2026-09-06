/**
 * /museums に不足していた5館を追加する（2026-09）。
 *
 *   npx tsx scripts/add-museums-2026-09.ts            # 何が起きるか表示
 *   npx tsx scripts/add-museums-2026-09.ts --apply    # 投入
 *   npx tsx scripts/add-museums-2026-09.ts --apply --slug=dennis-severs-house
 *
 * 冪等。slug で upsert し、付随データ(MuseumInfo / OpeningHours /
 * Highlight / Trivia / MuseumVisitStep)は毎回作り直す。
 *
 * ------------------------------------------------------------------
 * なぜこの5館なのか
 * ------------------------------------------------------------------
 * Attraction 側を3回に分けて埋めたあと、Museum テーブル47館を見直した。
 * 大物は揃っているが、次の5館が両方のテーブルから抜けていた。
 *
 *   ミュージアム・オブ・ザ・ホーム  2021年に改称・再開。時代別の居間という
 *                                  他に無い常設展示を持つのに未収録
 *   旧手術室博物館                  ヨーロッパ現存最古の手術室
 *   デニス・セヴァーズの家          無言で歩く「静物画のドラマ」
 *   ギルドホール・アート・ギャラリー 地下にロンドンのローマ円形闘技場
 *   ベンジャミン・フランクリン・ハウス 世界で唯一残るフランクリンの家
 *
 * いずれも Attraction 側には置かない。両方に置くと URL が2本になって
 * 同じ語で競合する(lib/museum-attraction-pairs.ts の冒頭コメント参照)。
 *
 * ------------------------------------------------------------------
 * 開館時間と料金は「読んで」取っている(重要)
 * ------------------------------------------------------------------
 * OpeningHours は MuseumHero の表示だけでなく、jsonld.ts の
 * openingHoursSpecification として構造化データにも出る。つまり
 * 間違った値は検索結果に載る。今回は全5館の公式サイトを 2026-09-06 に
 * 実際に読んで書き写した。記憶で書いていたら2件間違えていた:
 *
 *   - 旧手術室博物館は木〜日だけ(月〜水は休み)
 *   - ベンジャミン・フランクリン・ハウスは月火休で、
 *     金曜だけ内容と料金が違う(自由見学£10 / 金曜の建築ツアー£14)
 *
 * デニス・セヴァーズの家は「開く日が限られる」型だが、公式の予定表を
 * 4週ぶん確認したところ金・土・日で一貫していたので、その3日だけ
 * 開館として入れてある。ただし回ごとの予約制であることを
 * description と歩き方の1歩目に必ず書く。
 *
 * ------------------------------------------------------------------
 * 本文の書き方
 * ------------------------------------------------------------------
 *   - description は markdown。MuseumAbout.tsx が改行で段落に割って
 *     react-markdown に通す。閉じの ** を句読点・閉じ括弧の直後に
 *     置かないこと(置くと生の ** が画面に出る)
 *   - summary / blurb / highlights[] はプレーンテキスト。markdown 不可
 *   - MuseumVisitStep の body もプレーンテキスト。MuseumVisitFlow.tsx は
 *     ReactMarkdown を通していない
 *   - 料金・開館時間は本文に書かない。museumInfo と openingHours が持つ
 *     例外は「その曜日を外すと入れない」もので、これは行動を変える
 *
 * 画像はすべて Wikimedia Commons。Commons API の imageinfo で確認済み。
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** 月〜日の7要素。null は休館。 */
type Hours = ([string, string] | null)[];

type NewMuseum = {
  slug: string;
  name: string;
  engName: string;
  tagline: string;
  /** markdown。段落は改行で区切る。 */
  description: string;
  /** プレーンテキスト。1行目が要約、以降 "・" 始まりの箇条。 */
  summary: string;
  /** 詩的な一文。プレーンテキスト。 */
  blurb: string;
  /** 一覧のタグと検索に使う短い語を3つ。 */
  highlights: string[];
  price: number;
  tourPrice: number;
  address: string;
  lat: number;
  lng: number;
  image: string;
  website: string;
  recommendLevel: number;
  isForChildren: boolean;
  hours: Hours;
  info: {
    photographyAllowed?: string | null;
    reservationRequired?: boolean | null;
    cloakroomInfo?: string | null;
    nearestStation?: string | null;
    stationWalkingMinutes?: number | null;
    guidedTourAvailable?: boolean | null;
    guidedTourLanguages?: string | null;
    guidedTourFee?: number | null;
    cafeteriaAvailable?: boolean | null;
    shopAvailable?: boolean | null;
    admissionFeeAdult?: number | null;
    admissionFeeStudent?: number | null;
    admissionFeeChild?: number | null;
    recommendedDuration?: number | null;
  };
  highlightSpots: { title: string; location?: string | null; body: string }[];
  trivia: { title: string; content: string }[];
  visitFlow: {
    kind: "arrival" | "highlight" | "missable" | "tip";
    title: string;
    body: string;
  }[];
};

const O = (o: string, c: string): [string, string] => [o, c];
const X = null;

export const MUSEUMS: NewMuseum[] = [
  /* =================================================================
   * 1. ミュージアム・オブ・ザ・ホーム
   * =================================================================
   * SOURCES
   *   https://museumofthehome.org.uk/visit/
   *   https://en.wikipedia.org/wiki/Museum_of_the_Home
   *   https://en.wikipedia.org/wiki/Robert_Geffrye
   *
   * 公式(2026-09-06)より:
   *   「We are free to visit, open Tuesday–Sunday and on Bank Holidays」
   *   「Free and open to all / 10am-5pm | Tuesday to Sunday」
   *   住所 136 Kingsland Road, London E2 8EA
   */
  {
    slug: "museum-of-the-home",
    name: "ミュージアム・オブ・ザ・ホーム",
    engName: "Museum of the Home",
    tagline: "1630年から現在までの居間を、順に歩いて通り抜ける",
    description: `ショーディッチのキングズランド・ロードに面した、細長い救貧院を転用した無料の博物館。もとは**1714年**、ロンドン市長を務めた**ロバート・ジェフリー**の遺贈により、貧しい金物商のために建てられた建物である。

中心にあるのは「**時代を通る部屋**」（Rooms Through Time）と呼ばれる常設展示で、**1630年代から現代まで**のロンドンの中流家庭の居間が、実物大で時代順に並んでいる。壁紙も椅子の配置も暖炉も、その時代のものに揃えてある。最後の部屋にはテレビとゲーム機がある。順に歩き抜けると、300年ぶんの「くつろぎ方」の変化を体ひとつで通ることになる。

庭も同じ発想で作られていて、時代別の庭園と壁で囲まれたハーブ園がある。**2021年6月**、大規模な改修を経て、それまでの「ジェフリー博物館」から現在の名前に変わった。館名の変更は、設立者の資産の出どころをめぐる議論と同じ時期に起きている。`,
    summary:
      "「家とは何か」を問う無料の博物館\n・1630年代から現代までの居間を時代順に再現\n・18世紀の救貧院を転用した建物\n・時代別の庭園と壁囲いのハーブ園",
    blurb:
      "他人の居間を順に通り抜けていくと、いま自分が座っている部屋も、この列のいちばん端にあるのだと気づく。",
    highlights: ["時代別の居間", "18世紀の救貧院", "庭園"],
    price: 0,
    tourPrice: 0,
    address: "136 Kingsland Road, London E2 8EA",
    lat: 51.5308,
    lng: -0.0759,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/01/The_Geffrye_Museum_in_Shoreditch_%2801%29.jpg",
    website: "https://museumofthehome.org.uk/",
    recommendLevel: 3,
    isForChildren: true,
    hours: [X, O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00")],
    info: {
      photographyAllowed: "撮影自由（一部展示を除く）",
      reservationRequired: false,
      nearestStation: "Hoxton",
      stationWalkingMinutes: 1,
      cafeteriaAvailable: true,
      shopAvailable: true,
      admissionFeeAdult: 0,
      admissionFeeStudent: 0,
      admissionFeeChild: 0,
      recommendedDuration: 90,
    },
    highlightSpots: [
      {
        title: "時代を通る部屋（Rooms Through Time）",
        location: "旧救貧院の棟",
        body: "1630年代から現代まで、ロンドンの中流家庭の居間を実物大で時代順に並べた常設展示です。壁紙も椅子の配置も暖炉も、その時代のものに揃えてあります。順路を守って歩くと、暖炉が消え、椅子が壁から離れ、部屋の中心がテレビに移っていく過程が連続して見えます。",
      },
      {
        title: "救貧院として建てられた建物そのもの",
        location: "旧救貧院の棟",
        body: "1714年、貧しい金物商のために建てられた救貧院です。一室だけ当時の状態に戻して公開されていて、寝台と暖炉しかない一間で老人が暮らしていたことが分かります。中流家庭の居間を並べた展示の隣に、それを持てなかった人の部屋が置かれている構成です。",
      },
      {
        title: "時代別の庭園とハーブ園",
        location: "建物の裏手",
        body: "屋内の部屋と同じ考えで、庭も時代ごとに区切って作られています。17世紀の実用的な菜園から20世紀の郊外住宅の庭まで。壁で囲まれたハーブ園は薬用と料理用の草を分けて植えてあり、春から秋にかけて見応えがあります。",
      },
    ],
    trivia: [
      {
        title: "家具職人たちが救った建物",
        content:
          "1910年代、救貧院の運営者がこの土地を売ろうとしたとき、取り壊しに反対したのは地元ショーディッチの家具職人たちでした。この一帯はロンドンの家具製造の中心地で、職人の技術教育のために家具の博物館が要ると訴えたのです。ロンドン州議会が土地を買い取り、1914年に博物館として開きました。展示の軸が「家の中」なのは、この出自から来ています。",
      },
      {
        title: "設立者の像をめぐる論争",
        content:
          "建物の正面に立つロバート・ジェフリーの像は、2020年に大きな議論になりました。彼の資産の一部が、大西洋奴隷貿易を担った王立アフリカ会社への出資から得られたものだったためです。館が行った意見公募では回答の7割超が像の撤去を支持しましたが、理事会は像を残したうえで説明を加える方針を選びました。館名がジェフリー博物館から現在の名前に変わったのは、この時期のことです。",
      },
      {
        title: "駅を出た正面が入口",
        content:
          "オーバーグラウンドのホクストン駅を出ると、道を挟んで正面がこの博物館です。ロンドンの博物館のなかでも駅からの距離が最も短い部類で、雨の日でもほとんど濡れずに着きます。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "ホクストン駅の正面。月曜は閉まっている",
        body: "オーバーグラウンドのホクストン駅を出ると、道の向かいがもう入口です。開くのは火曜から日曜の10時から17時で、月曜は休みます（祝日の月曜は開きます）。入館は無料で、予約も要りません。",
      },
      {
        kind: "tip",
        title: "新館から入って、旧館へ抜ける",
        body: "受付とショップとカフェは、改修で増築された新しい棟の側にあります。時代別の部屋があるのは、その先につながる細長い旧救貧院のほうです。展示を先に見たいなら、受付を通り過ぎて奥へ進んでください。",
      },
      {
        kind: "highlight",
        title: "居間を、順番どおりに歩く",
        body: "順路を守ることに意味があります。1630年代の部屋から始めて時代順に進むと、暖炉が消え、椅子が壁から離れ、部屋の中心がテレビへ移っていく過程が連続して見えます。逆から歩くとこの効果が消えるので、戻るときは展示室の外を通ってください。",
      },
      {
        kind: "missable",
        title: "救貧院の一室が、そのまま残っている",
        body: "時代別の居間とは別に、この建物が救貧院だったころの部屋が一室だけ復元されています。寝台と暖炉しかない一間です。中流家庭の居間を並べた展示の隣に、それを持てなかった人の部屋が置いてある。この配置は偶然ではありません。",
      },
      {
        kind: "missable",
        title: "正面の像と、その周りの掲示",
        body: "建物の正面に立つのは設立者ロバート・ジェフリーの像です。資産の一部が奴隷貿易に関わる会社への出資から得られたことが2020年に議論になり、館は像を残したうえで説明を加える方針を採りました。台座まわりの掲示まで読むと、この館が自分の出自をどう扱うと決めたかが分かります。",
      },
      {
        kind: "tip",
        title: "庭は建物の裏。冬は屋内だけと考える",
        body: "時代別の庭園とハーブ園は建物の裏手にあります。植栽が主役なので、見応えがあるのは春から秋です。冬に行くなら屋内だけのつもりで、所要も短めに見ておいてください。",
      },
    ],
  },

  /* =================================================================
   * 2. 旧手術室博物館
   * =================================================================
   * SOURCES
   *   https://oldoperatingtheatre.com/visit/
   *   https://en.wikipedia.org/wiki/Old_Operating_Theatre_Museum_and_Herb_Garret
   *
   * 公式(2026-09-06)より:
   *   「Monday-Wednesday: CLOSED / Thursday-Sunday: 10.30am-5pm」
   *   「Last admission is at 16.15pm」「Average length of a visit is ~45 minutes」
   *   Adult £10 / Concession £8 / Family £22 / Child (16 and under) £6.50
   *   「Only handbags and small backpacks are permitted in the museum」
   */
  {
    slug: "old-operating-theatre",
    name: "旧手術室博物館",
    engName: "Old Operating Theatre Museum and Herb Garret",
    tagline: "麻酔も消毒も無かった時代の手術室が、教会の屋根裏に残っている",
    description: `ロンドン・ブリッジ駅のすぐ南、**1703年**に建てられた聖トマス教会の**屋根裏**にある小さな博物館。もとは隣接していた聖トマス病院の薬剤師が、薬草を干して保管するための空間だった。

**1822年**、その屋根裏の中に女性病棟のための手術室が作られた。木造の階段席が手術台を三方から囲む、円形劇場のような造りである。これが**ヨーロッパに現存する最古の手術室**とされる。**麻酔**が使われるようになるのは1846年、**消毒**が広まるのは1860年代で、この部屋が使われていたのはそのどちらよりも前である。患者は押さえつけられ、外科医に求められた最大の技能は速さだった。手術台の下には、血を受けるおがくずの箱が置かれている。

1862年に病院が移転したあと、この部屋は入口を塞がれて忘れられた。再発見は**1956年**、記録を頼りに屋根裏へよじ登った研究者による。上がる方法は狭くて急な螺旋階段しかなく、エレベーターは無い。`,
    summary:
      "1822年の手術室がそのまま残る医学史の博物館\n・ヨーロッパ現存最古の手術室\n・病院の薬剤師が薬草を干していた屋根裏\n・麻酔以前・消毒以前の外科道具",
    blurb:
      "木の階段席に囲まれた台の下に、おがくずの箱が置いてある。何を受けるための箱かは、考えないほうがいい。",
    highlights: ["ヨーロッパ最古の手術室", "薬草の屋根裏", "医学史"],
    price: 10,
    tourPrice: 10,
    address: "9a St Thomas Street, London SE1 9RY",
    lat: 51.5044,
    lng: -0.0873,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/The_Old_Operating_Theatre_Museum%2C_Southwark_-_geograph.org.uk_-_5495585.jpg",
    website: "https://oldoperatingtheatre.com/",
    recommendLevel: 3,
    isForChildren: false,
    hours: [X, X, X, O("10:30", "17:00"), O("10:30", "17:00"), O("10:30", "17:00"), O("10:30", "17:00")],
    info: {
      photographyAllowed: "撮影自由",
      reservationRequired: false,
      cloakroomInfo: "無し。ハンドバッグと小さなリュック以外は持ち込めない",
      nearestStation: "London Bridge",
      stationWalkingMinutes: 2,
      cafeteriaAvailable: false,
      shopAvailable: true,
      admissionFeeAdult: 10,
      admissionFeeStudent: 8,
      admissionFeeChild: 6.5,
      recommendedDuration: 45,
    },
    highlightSpots: [
      {
        title: "手術室そのもの",
        location: "屋根裏の最上部",
        body: "木の階段席が手術台を三方から囲みます。座席ではなく立ち見の段で、医学生が手すりに詰めかけて見下ろしていました。手術台の下にはおがくずの箱があります。血を受けるためのものです。この部屋の説明は、それ以上の言葉をあまり必要としません。",
      },
      {
        title: "薬草の屋根裏（ハーブ・ガレット）",
        location: "階段を登ってすぐ",
        body: "手術室ができる前、ここは病院の薬剤師が薬草を干して保管する場所でした。梁から薬草が吊るされ、乳鉢、蒸留器、瀉血用の刃物、蛭を入れた壺が並びます。19世紀初めの薬がどう作られていたかが、そのまま置いてあります。",
      },
      {
        title: "壁に掲げられたラテン語",
        location: "手術室",
        body: "「Miseratione non mercede」——報酬のためではなく、憐れみのために。慈善病院として運営されていたこの病院の理念です。麻酔なしの手術が行われていた部屋にこの言葉が掲げられていることを、どう受け取るかは訪れた人しだいです。",
      },
    ],
    trivia: [
      {
        title: "94年間、部屋の存在ごと忘れられていた",
        content:
          "1862年、鉄道の敷設にともなって病院がランベスへ移転したとき、この手術室は入口を塞がれたまま取り残されました。以後、教会の屋根裏に部屋があること自体が忘れられます。1956年、記録を調べていた研究者レイモンド・ラッセルが屋根裏へよじ登って発見し、1962年に博物館として開きました。",
      },
      {
        title: "ナイチンゲールの看護学校は、この病院にあった",
        content:
          "聖トマス病院は、1860年にフローレンス・ナイチンゲールが世界初の近代的な看護学校を開いた場所です。この手術室が使われていた時期と重なります。移転先のランベスにある現在の聖トマス病院には、フローレンス・ナイチンゲール博物館があります。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "木曜から日曜だけ。上がる方法は階段しかない",
        body: "開くのは木曜から日曜の10時半から17時、最終入場は16時15分です。月曜から水曜は閉まります。入口を入ると、いきなり狭くて急な螺旋階段が上へ伸びていて、これ以外に上がる方法がありません。エレベーターは無く、車椅子では入れません。",
      },
      {
        kind: "tip",
        title: "大きな荷物は持ち込めない",
        body: "階段が狭いため、持ち込めるのはハンドバッグと小さなリュックだけです。スーツケースを引いて来ると、その場で断られます。所要は45分ほどなので、ロンドン・ブリッジ駅のロッカーに預けてから来るのがよい。",
      },
      {
        kind: "arrival",
        title: "まず屋根裏に出る。手術室はその奥",
        body: "階段を登り切ると、薬草の吊るされた屋根裏に出ます。手術室はさらに奥です。薬を作っていた場所を通ってから手術室に入る順路になっていて、この順番が効きます。先に奥へ走らないでください。",
      },
      {
        kind: "highlight",
        title: "手術台の下を見る",
        body: "階段席に囲まれた台の下に、おがくずの箱が置かれています。血を受けるためのものです。麻酔も消毒もまだ無い時代で、外科医に求められた最大の技能は速さでした。展示の説明文を読む前に、まず箱を見てください。",
      },
      {
        kind: "missable",
        title: "壁のラテン語",
        body: "「Miseratione non mercede」——報酬のためではなく憐れみのために。慈善病院だったこの病院の理念です。麻酔なしの手術が行われていた部屋にこの言葉が掲げられていることの意味は、現場に立たないと分かりません。",
      },
      {
        kind: "tip",
        title: "そのあとの予定を軽くしておく",
        body: "ロンドン・ブリッジ駅から徒歩2分で、バラ・マーケットもザ・シャードもすぐです。中身の重い博物館なので、出たあとに市場で何か食べる時間を入れておくと切り替えが効きます。",
      },
    ],
  },

  /* =================================================================
   * 3. デニス・セヴァーズの家
   * =================================================================
   * SOURCES
   *   https://www.dennissevershouse.co.uk/calendar
   *   https://www.dennissevershouse.co.uk/event/silent-day-visit
   *   https://www.dennissevershouse.co.uk/event/silent-night-visit
   *   https://en.wikipedia.org/wiki/Dennis_Severs%27_House
   *
   * 公式の予定表(2026-09-06 時点、4週ぶん)より:
   *   開くのは金・土・日のみ。昼の見学は 12:00〜15:15 の枠、所要45分
   *   Silent Day Visit £16 / Silent Night Visit £25 /
   *   Dennis Severs' Tour £75 / Armchair Concerts £38（いずれも別途手数料）
   *   撮影不可・トイレ無し・車椅子不可・大きな荷物不可・ピンヒール不可
   *
   * ★ 回ごとの予約制。曜日は一貫していたので3日ぶん入れてあるが、
   *   「その日に開いているとは限らない」ことを本文と歩き方の1歩目に書く。
   */
  {
    slug: "dennis-severs-house",
    name: "デニス・セヴァーズの家",
    engName: "Dennis Severs' House",
    tagline: "住人がたったいま部屋を出ていったように作られた、無言で歩く家",
    description: `スピタルフィールズに建つ**1724年**の家。もとはフランスから逃れてきたユグノーの絹織物職人の住居である。博物館ではあるが、展示物に説明札は付いていない。

**1979年**、カリフォルニア出身の**デニス・セヴァーズ**がこの家を買い、電気を引かないまま住みながら、10の部屋を「架空の絹織物職人一家がいま暮らしている家」として作り込んでいった。食べかけの皿、崩れた寝床、まだ湯気の立つカップ。部屋ごとに設定された年代は1724年から1914年までを移動する。

見学は**無言**で行う。同行者との会話も含めて、話すことができない。夜の回はろうそくと暖炉の灯りだけである。玄関の上には「**Aut Visum Aut Non**」——見えるか、見えないか——と掲げられている。

注意が要るのは、これが歴史的に正確な復元では**ない**ことである。セヴァーズ自身がこれを「静物画のドラマ」と呼び、事実の再現ではなく想像の作品だと明言していた。18世紀の暮らしを学びに行く場所ではない。また、開くのは週に3日ほどで、回ごとの予約制である。`,
    summary:
      "架空の一家が「たったいま出ていった」状態で保たれた家\n・見学は無言で行う\n・夜はろうそくと暖炉の灯りだけ\n・撮影不可・トイレ無し・要予約",
    blurb:
      "食べかけの皿、まだ温かいカップ、上の階で人の気配。誰もいないと知っているのに、この家には誰かがいる。",
    highlights: ["無言の見学", "18世紀の家", "スピタルフィールズ"],
    price: 16,
    tourPrice: 25,
    address: "18 Folgate Street, London E1 6BX",
    lat: 51.5205,
    lng: -0.0757,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/8e/18_Folgate_Street_%28Night%29.jpg",
    website: "https://www.dennissevershouse.co.uk/",
    recommendLevel: 3,
    isForChildren: false,
    hours: [X, X, X, X, O("12:00", "16:00"), O("12:00", "16:00"), O("12:00", "16:00")],
    info: {
      photographyAllowed: "撮影禁止",
      reservationRequired: true,
      cloakroomInfo: "無し。大きな荷物・ベビーカーは持ち込めない",
      nearestStation: "Liverpool Street",
      stationWalkingMinutes: 8,
      cafeteriaAvailable: false,
      shopAvailable: true,
      admissionFeeAdult: 16,
      recommendedDuration: 45,
    },
    highlightSpots: [
      {
        title: "10の部屋を、時代を移動しながら歩く",
        body: "各部屋が1724年から1914年までの別々の年に設定されています。地下の台所から屋根裏の職人部屋まで、階を上がるほど時代が進む作りです。壁紙の傷み方も燭台の様式も、部屋ごとに変えてあります。",
      },
      {
        title: "「たったいま出ていった」ための仕掛け",
        body: "食べかけの食事、脱ぎ捨てられた服、まだ温かい飲み物。それに加えて音が使われています。上の階から人の話し声や足音が聞こえてきます。誰もいないと分かっているのに家の中に誰かがいる、という状態が最後まで続きます。",
      },
      {
        title: "無言であることの効果",
        body: "しゃべれないので、入ってくるものが増えます。時計の音、遠くの鐘、通りを行く馬車。そして匂い——香水、煙、丁子、たばこ。部屋ごとに調合が変えてあり、視覚より先に嗅覚が反応する部屋があります。",
      },
    ],
    trivia: [
      {
        title: "作った本人が、電気を引かずに20年住んでいた",
        content:
          "デニス・セヴァーズは1979年にこの家を買ってから1999年に亡くなるまで、電気を引かずにここで暮らしました。ろうそくと暖炉で生活しながら部屋を作り込み、来客を招いて自分で案内していたのです。彼の死後、家はスピタルフィールズ歴史建造物トラストに引き継がれました。",
      },
      {
        title: "歴史の復元ではない",
        content:
          "18世紀の家を正確に再現した施設だと思って行くと、話が合いません。セヴァーズはこれを「静物画のドラマ」と呼び、事実の復元ではなく想像の作品だと明言していました。年代の混ざった調度も意図的なものです。歴史資料としてではなく、ひとつの作品として入る場所です。",
      },
    ],
    visitFlow: [
      {
        kind: "tip",
        title: "予約が要る。開く日も限られている",
        body: "当日ふらりと入れる家ではありません。開くのは週に3日ほどで、時間帯ごとの予約制です。公式の予定表から日付と回を選んで先に買ってください。遅刻すると入れてもらえません。",
      },
      {
        kind: "tip",
        title: "昼の回と夜の回で、見えるものが変わる",
        body: "昼の無言見学のほかに、ろうそくと暖炉の灯りだけで歩く夜の回があります。この家の作りがいちばん効くのは夜の回ですが、枠が少なく先に埋まります。案内人が付く長い回や、演奏付きの回が出る日もあります。",
      },
      {
        kind: "arrival",
        title: "入ったら、しゃべらない",
        body: "見学は無言で行います。同行者との会話も含めて話すことができません。これは雰囲気づくりの演出ではなく、聞こえる音と匂いを増やすための仕組みです。話せないと分かった瞬間から、時計の音と遠くの鐘が聞こえ始めます。",
      },
      {
        kind: "highlight",
        title: "食べかけの皿と、上の階の物音",
        body: "各部屋は住人がたったいま出ていった状態に作られています。食べかけの食事、崩れた寝床、まだ温かい飲み物。そこへ上の階から話し声と足音が聞こえてきます。誰もいないと知っているのに家の中に誰かがいる、という状態が最後まで続きます。",
      },
      {
        kind: "missable",
        title: "玄関の上に掲げられた一文",
        body: "「Aut Visum Aut Non」——見えるか、見えないか。この家を作った人が来訪者に投げた言葉です。事実の復元を期待して入ると何も見えず、ひとつの作品として入ると全部見える。そういう意味に読めます。入る前に見上げてください。",
      },
      {
        kind: "tip",
        title: "体と持ち物の制約が多い",
        body: "撮影は禁止、トイレはありません。大きな荷物とベビーカーは預けられません。床は傾き階段は急で、車椅子では入れません。暖炉を焚くので煙が多く、呼吸器に不安があるなら避けたほうがよい。建物を傷めるためピンヒールも不可です。",
      },
    ],
  },

  /* =================================================================
   * 4. ギルドホール・アート・ギャラリー
   * =================================================================
   * SOURCES
   *   https://www.cityoflondon.gov.uk/things-to-do/attractions-museums-entertainment/guildhall-art-gallery
   *   https://www.thecityofldn.com/directory/guildhall-art-gallery/
   *   https://en.wikipedia.org/wiki/Guildhall_Art_Gallery
   *   https://en.wikipedia.org/wiki/London_Roman_Amphitheatre
   *
   * 開館・料金(2026-09-06 確認):
   *   Mon to Sun 10am to 5pm（最終入場 16:45）
   *   「Admission to Guildhall Art Gallery and London's Roman Amphitheatre
   *     is free, but they recommend that you book a general admission ticket」
   */
  {
    slug: "guildhall-art-gallery",
    name: "ギルドホール・アート・ギャラリー",
    engName: "Guildhall Art Gallery",
    tagline: "建て直しの穴を掘ったら、探し続けていたローマの円形闘技場が出てきた",
    description: `シティ（ロンドン市）が19世紀から集めてきた絵画を展示する、入館無料の美術館。最初の建物は1941年の空襲で焼失し、現在の建物が開いたのは**1999年**である。

この館が特異なのは、その建て直しから始まる。**1988年**、新しい建物の基礎を掘るための発掘調査で、地下から石積みの遺構が出た。何世紀も探されながら見つかっていなかった**ロンドンの円形闘技場**である。西暦70年ごろに木造で建てられ、120年ごろに石造へ改築されたもので、収容は6千人ほどと推定されている。当時のロンディニウムの人口を考えると、相当な割合が一度に入る規模だった。

遺構は地下にそのまま残され、展示室として公開されている。地上のギルドホール・ヤードの舗石には、闘技場の外周が黒い石で描かれている。絵画のほうも見応えがあり、ラファエル前派の作品と、英国でも最大級の大きさを持つ**コプリー**の《ジブラルタルの海上砲台の敗北》がある。`,
    summary:
      "シティの絵画コレクションと、地下のローマ遺跡\n・1988年に発見されたロンドンの円形闘技場跡\n・ラファエル前派とヴィクトリア朝の絵画\n・英国最大級の絵画《ジブラルタルの海上砲台の敗北》",
    blurb:
      "地下に降りると、二千年前にここで人が死ぬのを見物していた場所の輪郭が、暗がりに光の線で浮かんでいる。",
    highlights: ["ローマ円形闘技場", "ラファエル前派", "無料"],
    price: 0,
    tourPrice: 0,
    address: "Guildhall Yard, London EC2V 5AE",
    lat: 51.5157,
    lng: -0.0921,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d7/Guildhall_Art_Gallery%2C_London.jpg",
    website:
      "https://www.cityoflondon.gov.uk/things-to-do/attractions-museums-entertainment/guildhall-art-gallery",
    recommendLevel: 3,
    isForChildren: false,
    hours: [O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00")],
    info: {
      photographyAllowed: "撮影自由（一部制限あり）",
      reservationRequired: false,
      nearestStation: "Bank",
      stationWalkingMinutes: 5,
      cafeteriaAvailable: false,
      shopAvailable: true,
      admissionFeeAdult: 0,
      admissionFeeStudent: 0,
      admissionFeeChild: 0,
      recommendedDuration: 75,
    },
    highlightSpots: [
      {
        title: "ロンドンの円形闘技場跡",
        location: "地下",
        body: "1988年、新しい美術館の基礎を掘っていて出土しました。何世紀も探されながら見つかっていなかった遺構です。残っているのは東側の門と排水路と壁の下部だけですが、暗い展示室の中に観客席の位置が光の線で示されていて、規模が体感できます。",
      },
      {
        title: "コプリー《ジブラルタルの海上砲台の敗北》",
        location: "専用の吹き抜け",
        body: "1791年、ジョン・シングルトン・コプリー作。英国でも最大級の大きさを持つ絵画で、美術館のほうがこの絵に合わせて設計されています。下から見上げるのと、上階の手すりから見下ろすのとで印象が変わるので、両方から見てください。",
      },
      {
        title: "ラファエル前派とヴィクトリア朝の絵",
        body: "ロセッティ、ミレイ、ランドシーアなど19世紀英国の絵が並びます。シティが同時代に買い集めたものなので、当時のロンドンの商人たちが何を良い絵だと思っていたかがそのまま並んでいる、という見方もできます。",
      },
    ],
    trivia: [
      {
        title: "地上の舗石に、闘技場の輪郭が描かれている",
        content:
          "ギルドホール・ヤードの石畳に、黒い石で大きな楕円が描かれています。地下にある円形闘技場の外周をそのまま地上に写したものです。広場を横切る人はほとんど気づかずに踏んでいます。地下に降りる前に一度、上から全体の大きさを見ておくとよい。",
      },
      {
        title: "戦争で建物だけが失われた",
        content:
          "1886年に開いた最初のギルドホール・アート・ギャラリーは、1941年の空襲で焼失しました。ただし収蔵品は事前に疎開させてあったため、絵はほぼ無事でした。以後半世紀以上、仮設の場所で展示が続き、現在の建物が開いたのは1999年です。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "無料。券を取っておくと受付が早い",
        body: "ギルドホール・ヤードに面した入口から入ります。美術館も地下の円形闘技場跡も無料ですが、事前に無料の入場券を取っておくと受付が早く済みます。当日そのまま入ることもできます。開くのは毎日10時から17時、最終入場は16時45分です。",
      },
      {
        kind: "missable",
        title: "入る前に、足元の黒い楕円を見る",
        body: "ギルドホール・ヤードの石畳に、黒い石で大きな楕円が描かれています。地下の円形闘技場の外周を地上に写したものです。広場を横切る人はほとんど気づかずに踏んでいます。地下に降りる前に一度、上から全体の大きさを見ておいてください。",
      },
      {
        kind: "highlight",
        title: "絵より先に、地下へ降りる",
        body: "この館の本題は地下です。1988年、建物の基礎を掘っていて出土した円形闘技場の遺構が、そのままの位置で展示されています。残っているのは東門と排水路と壁の下部だけですが、暗い部屋の中に観客席の位置が光の線で示されていて、規模が体で分かります。",
      },
      {
        kind: "highlight",
        title: "絵に合わせて建てられた吹き抜け",
        body: "コプリーの《ジブラルタルの海上砲台の敗北》は英国でも最大級の大きさの絵です。この絵を掛けるために専用の吹き抜けが作られているので、下から見上げるのと上階の手すりから見下ろすのとで見え方が変わります。両方から見てください。",
      },
      {
        kind: "tip",
        title: "隣のギルドホールも見る",
        body: "同じ広場に面して建つギルドホールは15世紀の大広間です。開いている日は無料で中に入れます。ローマの円形闘技場、中世の大広間、19世紀の絵画が、ひとつの広場に縦に重なっている場所です。",
      },
      {
        kind: "tip",
        title: "週末は静かだが、食事の店が閉まる",
        body: "周囲はオフィス街で、平日の昼は勤め人で混み、土日は驚くほど静かになります。ただし週末は周辺の飲食店も閉まる店が多いので、食事はバービカンかスミスフィールド方面まで歩くつもりで組んでください。",
      },
    ],
  },

  /* =================================================================
   * 5. ベンジャミン・フランクリン・ハウス
   * =================================================================
   * SOURCES
   *   https://benjaminfranklinhouse.org/visit/buy-tickets/
   *   https://benjaminfranklinhouse.org/visit/
   *   https://en.wikipedia.org/wiki/Benjamin_Franklin_House
   *   https://en.wikipedia.org/wiki/William_Hewson_(surgeon)
   *
   * 公式(2026-09-06)より:
   *   Monday & Tuesday: Closed
   *   Wed/Thu/Sat/Sun: Self-guided Tour 11am-5pm（最終入場16:30）
   *     Adults £10 / Concession £8 / 11 & under FREE
   *   Friday: Architectural Tour 11,12,1,2,3,4pm
   *     Adults £14 / Concessions £10 / Under 12s Free
   *   住所 36 Craven St, London WC2N 5NF
   */
  {
    slug: "benjamin-franklin-house",
    name: "ベンジャミン・フランクリン・ハウス",
    engName: "Benjamin Franklin House",
    tagline: "世界で唯一残っている、ベンジャミン・フランクリンの家",
    description: `チャリング・クロス駅のすぐ裏、ストランドから一本入ったクレイヴン・ストリートに建つ**1730年**のテラスハウス。**ベンジャミン・フランクリン**が**1757年から1775年**までの16年間住んだ家で、**世界に現存する唯一のフランクリンの家**である。フィラデルフィアの家は1812年に取り壊されている。

当時の彼はペンシルヴェニア植民地の代理人としてロンドンにおり、議会への働きかけを続けていた。この家を出たのは**1775年3月**、レキシントンの戦いの数週間前である。つまり独立戦争が始まる直前まで、のちの建国の父はロンドンで暮らしていた。

内部は家具を並べて当時を再現した邸宅博物館ではなく、ジョージ王朝様式の内装をできるだけ残したまま公開されている。曜日によって中身が変わり、水・木・土・日は自由見学、金曜は建築に焦点を当てたガイドツアーになる。**月曜と火曜は休み**である。`,
    summary:
      "独立宣言の起草者が16年住んだ、現存する唯一の家\n・1757年から1775年まで居住\n・1730年築のジョージ王朝様式のテラスハウス\n・地下から出土した1,200点以上の人骨",
    blurb:
      "アメリカ建国の父が16年暮らした家。その地下からは、彼とは関係のない15人分の骨が出てきた。",
    highlights: ["フランクリンの旧居", "ジョージ王朝様式", "地下の人骨"],
    price: 10,
    tourPrice: 14,
    address: "36 Craven Street, London WC2N 5NF",
    lat: 51.5077,
    lng: -0.1245,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Benjamin_Franklin_House.jpg",
    website: "https://benjaminfranklinhouse.org/",
    recommendLevel: 2,
    isForChildren: false,
    hours: [X, X, O("11:00", "17:00"), O("11:00", "17:00"), O("11:00", "17:00"), O("11:00", "17:00"), O("11:00", "17:00")],
    info: {
      reservationRequired: false,
      nearestStation: "Charing Cross",
      stationWalkingMinutes: 2,
      guidedTourAvailable: true,
      guidedTourLanguages: "英語",
      guidedTourFee: 14,
      cafeteriaAvailable: false,
      shopAvailable: true,
      admissionFeeAdult: 10,
      admissionFeeStudent: 8,
      admissionFeeChild: 0,
      recommendedDuration: 60,
    },
    highlightSpots: [
      {
        title: "フランクリンが上り下りした階段と床",
        body: "調度で飾り立てた部屋ではなく、18世紀の内装をできるだけ残したまま公開されています。階段、羽目板、窓の造作の多くが当時のものです。「彼が触ったもの」を探すより、彼が毎日使った空間の寸法を体で測るほうが、この家の見方に合っています。",
      },
      {
        title: "クレイヴン・ストリートの骨",
        location: "地下",
        body: "1998年の保存工事のとき、地下から1,200点を超える人骨が出土しました。少なくとも15人分です。フランクリンとは関係がなく、下宿の娘婿ウィリアム・ヒューソンが1770年代にこの家で私設の解剖学校を開いていたためのものです。",
      },
      {
        title: "ジョージ王朝様式のテラスハウス",
        body: "1730年築で、ロンドンに残る同時代の中流のテラスハウスとしては保存状態がよいほうです。金曜の建築ツアーは、この建物がどう作られ、どう荒廃し、どう救われたかを扱います。フランクリンに関心がなくても建築として成立する回です。",
      },
    ],
    trivia: [
      {
        title: "地下の人骨は、解剖学校のものだった",
        content:
          "1998年に見つかった人骨は当初「フランクリンの地下室の死体」として報じられましたが、実際は下宿の娘婿ウィリアム・ヒューソンが1770年代にこの家で開いていた解剖学校の残りです。当時の解剖学校は遺体の入手が法的にきわどく、墓掘り人から買った遺体の残りを地下に埋めて処理していました。",
      },
      {
        title: "下宿の女主人と、その娘",
        content:
          "フランクリンの家主はマーガレット・スティーヴンソン、その娘ポリーとは生涯にわたって手紙のやりとりが続きました。妻子はフィラデルフィアに残したままだったので、ロンドンでは事実上もうひとつの家庭を持っていたことになります。ポリーはのちにフィラデルフィアへ渡り、1790年の彼の臨終に立ち会っています。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "月曜と火曜は休み。曜日で中身が変わる",
        body: "水曜・木曜・土曜・日曜は自由見学で、11時から17時のあいだに好きな時間に入れます（最終入場16時半）。金曜だけは建築に焦点を当てたガイドツアーで、11時から16時まで毎正時に出発します。料金も金曜だけ高くなります。月曜と火曜は閉まります。",
      },
      {
        kind: "tip",
        title: "調度を見に行く場所ではない",
        body: "家具を並べて当時を再現した邸宅博物館ではありません。18世紀の内装をできるだけそのまま残した、空っぽに近い家です。「何が置いてあるか」を期待すると肩透かしを食うので、部屋の寸法と階段の勾配を体で測りに行くつもりで入ってください。",
      },
      {
        kind: "highlight",
        title: "16年という長さを考える",
        body: "フランクリンがこの家に住んだのは1757年から1775年までの16年間で、妻子はフィラデルフィアに残したままでした。彼がここを出たのは1775年3月、レキシントンの戦いの数週間前です。独立戦争が始まる直前まで、建国の父はこの家で暮らしていたことになります。",
      },
      {
        kind: "missable",
        title: "地下から出た1,200点の骨",
        body: "1998年の保存工事で、少なくとも15人分、1,200点を超える人骨が地下から出土しました。フランクリンの仕業ではありません。下宿の娘婿ウィリアム・ヒューソンが1770年代にこの家で私設の解剖学校を開いていて、遺体の残りを地下に埋めて処理していたためです。当時それを表に出せなかった事情まで含めて、館の説明を読んでください。",
      },
      {
        kind: "tip",
        title: "無料の音声ガイドを先に入れておく",
        body: "Bloomberg Connects という無料アプリで音声ガイドが使えます。自由見学の回はこれがあるかどうかで情報量がかなり変わるので、館内で電波に困らないよう、来る前に落としておくとよい。",
      },
      {
        kind: "tip",
        title: "外観はただの古い家。通り過ぎる",
        body: "ストランドから一本入った細い通りにあり、看板も小さいので気づかずに通り過ぎます。トラファルガー広場から徒歩5分なので、ナショナル・ギャラリーやナショナル・ポートレート・ギャラリーの帰りに組み込みやすい場所ではあります。",
      },
    ],
  },
];

const APPLY = process.argv.includes("--apply");
const ONLY = process.argv.find((a) => a.startsWith("--slug="))?.slice(7);

/** MuseumVisitStep と Highlight/Trivia はプレーンテキスト描画。記法が入っていたら止める。 */
function findMarkdown(m: NewMuseum): string[] {
  const md = /\*\*|\[.+?\]\(.+?\)/;
  const bad: string[] = [];
  m.visitFlow.forEach((s) => {
    if (md.test(s.body) || md.test(s.title)) bad.push(`visitFlow: ${s.title}`);
  });
  m.highlightSpots.forEach((h) => {
    if (md.test(h.body) || md.test(h.title)) bad.push(`highlight: ${h.title}`);
  });
  m.trivia.forEach((t) => {
    if (md.test(t.content) || md.test(t.title)) bad.push(`trivia: ${t.title}`);
  });
  if (md.test(m.summary)) bad.push("summary");
  if (md.test(m.blurb)) bad.push("blurb");
  m.highlights.forEach((h) => {
    if (md.test(h)) bad.push(`highlights: ${h}`);
  });
  return bad;
}

async function main() {
  const targets = MUSEUMS.filter((m) => !ONLY || m.slug === ONLY);
  if (ONLY && targets.length === 0) {
    console.error(`slug=${ONLY} はこのスクリプトの対象外です`);
    process.exitCode = 1;
    return;
  }

  let broken = false;
  for (const m of targets) {
    for (const b of findMarkdown(m)) {
      console.error(`✗ ${m.slug} / ${b}: マークダウン記法が入っています`);
      broken = true;
    }
  }
  if (broken) {
    console.error("\nプレーンテキストに直してから流し直してください。");
    process.exitCode = 1;
    return;
  }

  console.log(APPLY ? "== 投入 ==\n" : "== ドライラン(--apply で投入) ==\n");

  for (const m of targets) {
    const existing = await prisma.museum.findUnique({
      where: { slug: m.slug },
      select: { id: true },
    });
    const nameClash = await prisma.museum.findFirst({
      where: { name: m.name, slug: { not: m.slug } },
      select: { slug: true },
    });

    const openDays = m.hours
      .map((h, i) => (h ? "月火水木金土日"[i] : null))
      .filter(Boolean)
      .join("");
    console.log(
      `${m.name} (${m.slug})\n` +
        `  ${existing ? "既存を更新" : "新規"} / lv${m.recommendLevel} / ` +
        `${m.price === 0 ? "無料" : `£${m.price}`} / 開館 ${openDays} / ` +
        `本文 ${m.description.length}字 / 見どころ${m.highlightSpots.length} 豆知識${m.trivia.length} 歩き方${m.visitFlow.length}`,
    );
    if (nameClash) {
      console.error(`  ✗ name が ${nameClash.slug} と衝突します。name は @unique です`);
      process.exitCode = 1;
      continue;
    }

    if (!APPLY) {
      console.log("");
      continue;
    }

    const { hours, info, highlightSpots, trivia, visitFlow, ...cols } = m;
    const saved = await prisma.museum.upsert({
      where: { slug: m.slug },
      create: { ...cols, category: "museum" },
      update: { ...cols, category: "museum" },
      select: { id: true },
    });
    const id = saved.id;

    await prisma.$transaction([
      // 付随データは毎回作り直す。冪等にするため。
      prisma.highlight.deleteMany({ where: { museumId: id } }),
      prisma.trivia.deleteMany({ where: { museumId: id } }),
      prisma.museumVisitStep.deleteMany({ where: { museumId: id } }),
      prisma.openingHours.deleteMany({ where: { museumId: id } }),
      prisma.museumInfo.deleteMany({ where: { museumId: id } }),

      prisma.openingHours.createMany({
        data: DAYS.map((day, i) => ({
          museumId: id,
          dayOfWeek: day,
          openTime: hours[i]?.[0] ?? null,
          closeTime: hours[i]?.[1] ?? null,
        })),
      }),
      prisma.museumInfo.create({
        data: { museumId: id, website: m.website, ...info },
      }),
      prisma.highlight.createMany({
        data: highlightSpots.map((h, i) => ({
          museumId: id,
          title: h.title,
          location: h.location ?? null,
          body: h.body,
          order: i,
        })),
      }),
      prisma.trivia.createMany({
        data: trivia.map((t) => ({ museumId: id, title: t.title, content: t.content })),
      }),
      prisma.museumVisitStep.createMany({
        data: visitFlow.map((s, i) => ({
          museumId: id,
          kind: s.kind,
          title: s.title,
          body: s.body,
          displayOrder: i + 1,
        })),
      }),
    ]);
    console.log("    → 投入\n");
  }

  const chars = targets.reduce((n, m) => n + m.description.length, 0);
  console.log(`対象 ${targets.length}館 / description 合計 ${chars}字`);
  if (!APPLY) console.log("\n--apply を付けると投入します。");
}

if (process.argv[1]?.includes("add-museums-2026-09")) {
  main()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

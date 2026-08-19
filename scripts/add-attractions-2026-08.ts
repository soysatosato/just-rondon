/**
 * /sightseeing に不足していた11スポットを追加する。
 *
 *   npx tsx scripts/add-attractions-2026-08.ts            # 何が起きるか表示
 *   npx tsx scripts/add-attractions-2026-08.ts --apply    # 投入
 *   npx tsx scripts/add-attractions-2026-08.ts --apply --slug=borough-market
 *
 * 冪等。slug で upsert するので何度流しても同じ結果になる。
 * AttractionStory は source: "authored" で入る。
 *
 * ------------------------------------------------------------------
 * なぜこの11件なのか
 * ------------------------------------------------------------------
 * 既存135件を棚卸ししたところ、2つの穴が見つかった。
 *
 * A. 知名度の高い定番が抜けていた(6件)
 *    バラ・マーケット / HMS ベルファスト / サマセット・ハウス /
 *    コヴェント・ガーデン / ハイゲート墓地 / ロイヤル・アルバート・ホール
 *
 *    - マーケットは3件あるのに「食のマーケット」が1つも無かった
 *    - コートールドは /museums にあるのに、建物のサマセット・ハウスが無い
 *    - サウス・ケンジントン(自然史・科学・V&A)が揃っているのにホールが無い
 *
 * B. 王立公園がハイド・パークしか無かった(5件)
 *    セント・ジェームズ / リージェンツ / グリニッジ / リッチモンド /
 *    ハムステッド・ヒース
 *
 *    ロンドン動物園(リージェンツ内)、王立天文台(グリニッジ内)、
 *    ケンウッド・ハウス(ヒース内)は既に載っているのに、その親にあたる
 *    公園そのものが無い、という状態だった。
 *
 * ★ V&A・ナショナル・ポートレート・ギャラリー・国立海洋博物館などは
 *   Museum テーブル(47件)に既にあるため、ここでは追加しない。
 *   両方に置くと URL が2本になり同じ語で競合する
 *   (lib/museum-attraction-pairs.ts の冒頭コメント参照)。
 *
 * ------------------------------------------------------------------
 * 本文の書き方
 * ------------------------------------------------------------------
 * seed-attraction-stories-level5.ts の基準に従う。要点:
 *   - 因果を書く。年号の羅列にしない
 *   - 事実(料金・アクセス・開館・所要)は本文に書かない。カラムが持つ
 *   - highlight は作らない。visitFlow を入れたときに伏せられるため
 *   - 閉じの ** を全角の閉じ括弧・鉤括弧の直後に置かない
 *
 * 画像はすべて Wikimedia Commons。投入前に HTTP 200 と image/* を確認済み。
 *
 * 料金は 2026-08-19 時点。改定されるので、ズレに気づいたらここではなく
 * DB のカラムを直すこと(このスクリプトは初回投入用)。
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Story = {
  kind: "history" | "context" | "trivia" | "practical";
  heading: string | null;
  body: string;
};

type NewSpot = {
  slug: string;
  name: string;
  engName: string;
  tagline: string;
  summary: string;
  address: string;
  lat: number;
  lng: number;
  image: string;
  website: string;
  category: string;
  recommendLevel: number;
  isFree: boolean;
  isForKids: boolean;
  mustSee: boolean;
  priceAdult: string | null;
  priceChild: string | null;
  durationText: string | null;
  nearestStation: string | null;
  openingHours: string | null;
  area: string | null;
  stories: Story[];
};

export const SPOTS: NewSpot[] = [
  /*
   * SOURCES
   *   https://boroughmarket.org.uk/our-story/
   *   https://www.londonmuseum.org.uk/collections/london-stories/borough-market-londons-oldest-food-trading-hub/
   *   https://en.wikipedia.org/wiki/Borough_Market
   */
  {
    slug: "borough-market",
    name: "バラ・マーケット",
    engName: "Borough Market",
    tagline: "1000年続くロンドン最古の食料品市場",
    summary:
      "ロンドン・ブリッジのたもとにある食のマーケット。11世紀から記録が残り、1756年に現在地へ移って以来、同じ場所で商いを続けている。生鮮食品の卸売市場として発展し、現在はチーズ・パン・惣菜・菓子の専門店が並ぶ。入場無料で、その場で食べられる屋台も多い。月曜休み。",
    address: "8 Southwark St, London SE1 1TL, UK",
    lat: 51.5055,
    lng: -0.0909,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/bf/Borough_Market_%284701274756%29.jpg",
    website: "https://boroughmarket.org.uk/",
    category: "shop",
    recommendLevel: 4,
    isFree: true,
    isForKids: false,
    mustSee: false,
    priceAdult: "無料",
    priceChild: "無料",
    durationText: "1〜2時間",
    nearestStation: "London Bridge 徒歩3分",
    openingHours: "火〜金 10:00〜17:00 / 土 9:00〜17:00 / 日 10:00〜16:00（月休）",
    area: "southbank",
    stories: [
      {
        kind: "history",
        heading: "橋の交通渋滞を理由に、一度廃止されている",
        body: `市場の記録は**1014年**に遡るとされ、1276年にはロンドン橋のたもとに市が立っていたことが文書に残る。ロンドンで最も古い食料品市場と言われるのはこのためである。

ところが**1754年**、この市場は議会の制定法で**廃止**された。理由は交通渋滞である。当時ロンドン橋はテムズを渡る唯一の橋で、その南詰に市が広がっていた。荷車と人が滞留し、橋の通行に支障が出るまでになっていた。

しかし市場は消えなかった。翌**1756年**、地元の教区民が資金を出して橋から少し離れたロチェスター・ヤードの土地を買い、そこで市を再開する。このとき定められたのが、市場を**信託**として運営する仕組みだった。所有者が利益を上げるのではなく、収益を市場の維持に戻す形である。この信託は今も続いており、270年前の解決策がそのまま組織として生きている。`,
      },
      {
        kind: "context",
        heading: "卸売から小売へ、客が入れ替わった",
        body: `19世紀、テムズ沿いの埠頭に近いという立地が効いた。船から陸揚げされた果物と野菜がここに集まり、**卸売市場**として拡大する。現在の鉄骨の建物の骨格は1851年の設計に遡る。

20世紀後半、卸売の機能は郊外の大規模市場へ移っていった。多くの都心の市場がこの流れで消えたが、ここは違う道をとる。1990年代から**質の高い食材を一般客に売る**方向へ舵を切り、生産者や専門店を集めた。結果として、卸売業者相手だった市場が、料理をする人と旅行者の来る場所に変わった。

だから今のバラ・マーケットは「昔からの市場が残っている」のではなく、**中身を入れ替えて生き延びた市場**である。建物と信託は古く、売っているものと客層は新しい。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- **月曜は休み**。曜日によって出店数が変わり、土曜が最も多い。12月は毎日開く
- 屋根はあるが壁は開いており、実質的に屋外に近い。冬は冷える
- サザーク大聖堂がすぐ隣に建つ。テート・モダンやシェイクスピアのグローブ座も川沿いに歩ける距離にある`,
      },
    ],
  },

  /*
   * SOURCES
   *   https://www.iwm.org.uk/visits/hms-belfast/about
   *   https://en.wikipedia.org/wiki/HMS_Belfast
   *   https://www.iwm.org.uk/sites/default/files/hmsb_factsheet_centenary.pdf
   */
  {
    slug: "hms-belfast",
    name: "HMS ベルファスト",
    engName: "HMS Belfast",
    tagline: "テムズに係留された、第二次大戦を戦った巡洋艦",
    summary:
      "タワーブリッジとロンドン橋の間に係留されている軽巡洋艦。1938年進水。北極海の輸送船団護衛、北岬沖海戦、ノルマンディー上陸作戦、朝鮮戦争に従軍した。1971年から帝国戦争博物館の分館として公開され、9層の甲板を機関室まで歩いて見学できる。",
    address: "The Queen's Walk, London SE1 2JH, UK",
    lat: 51.5065,
    lng: -0.0813,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/9/93/HMS_Belfast_and_Tower_Bridge_before_sunrise.jpg",
    website: "https://www.iwm.org.uk/visits/hms-belfast",
    category: "historic",
    recommendLevel: 4,
    isFree: false,
    isForKids: true,
    mustSee: false,
    priceAdult: "£26.80〜",
    priceChild: "£13.40〜（5〜15歳）",
    durationText: "2〜3時間",
    nearestStation: "London Bridge 徒歩5分",
    openingHours: "10:00〜18:00（10/28〜3/31は17:00まで、最終入場は閉館1時間前）",
    area: "southbank",
    stories: [
      {
        kind: "history",
        heading: "沈められかけ、解体されかけた船",
        body: `**1938年3月17日**進水。タウン級のうちエディンバラ型の1番艦として建造された軽巡洋艦である。

就役から2か月あまりの1939年11月、この船は**磁気機雷**に触れて艦底を破壊された。竜骨が歪み、修理には3年近くを要している。開戦直後に戦列を離れたことになる。

復帰後の戦歴は濃い。18か月にわたり**北極海の輸送船団**を護衛した。ソ連へ物資を運ぶ航路で、凍結と暗闇と敵潜水艦の三重の危険があった。1943年12月の**北岬沖海戦**ではドイツの戦艦シャルンホルストの撃沈に加わっている。乗員1,963名のうち生還したのは36名だった。1944年には5週間にわたりノルマンディー上陸作戦を艦砲射撃で支援し、その最初期の砲撃を放った艦の一隻とされる。戦後は朝鮮戦争にも従軍した。

**1971年**、この船は解体を待つ状態にあった。保存のための基金が立ち上がってこれを買い取り、同年**10月21日**——トラファルガー海戦の記念日——にロンドンで公開が始まった。`,
      },
      {
        kind: "context",
        heading: "9層の甲板を、下まで降りられる",
        body: `見学の特徴は、**甲板の上だけで終わらない**ことにある。艦橋や主砲塔だけでなく、機関室、ボイラー室、砲弾を送り上げる弾薬庫、乗員の寝床、調理場、歯科治療室まで降りて見られる。

軍艦は居住空間としては極端に窮屈である。天井は低く、通路は狭く、ハンモックが密に吊られていた。展示を見るというより、**950人が半年単位で暮らした密度**を体で確かめる場所になっている。梯子のような急階段を何度も上り下りするので、動きやすい服装と靴が要る。

主砲は6インチ砲12門。艦から西を向いた砲は、現在ロンドン中心部の方向へ向けられているが、これは照準の再現として意図的に設定されたものである。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 進水は**聖パトリックの日**(3月17日)。名の由来である北アイルランドのベルファストで建造された
- 艦内は階段と段差が多く、車椅子で回れる範囲は限られる。事前に確認したほうがよい
- 対岸のロンドン塔、上流のタワーブリッジと合わせて川沿いを歩く動線に入る`,
      },
    ],
  },

  /*
   * SOURCES
   *   https://www.somersethouse.org.uk/
   *   https://en.wikipedia.org/wiki/Somerset_House
   *   https://www.victorianlondon.org/buildings/somersethouse.htm
   */
  {
    slug: "somerset-house",
    name: "サマセット・ハウス",
    engName: "Somerset House",
    tagline: "世界初の「官庁ビル」として建てられた新古典主義の建物",
    summary:
      "ストランドとテムズの間に建つ巨大な新古典主義建築。1776年から、散在していた官庁を1か所にまとめるために建てられた。中庭は無料で入れ、夏は55本の噴水が並び、冬はスケートリンクになる。コートールド・ギャラリーが同じ建物に入る。",
    address: "Strand, London WC2R 1LA, UK",
    lat: 51.5111,
    lng: -0.1172,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/45/The_courtyard_of_Somerset_House%2C_Strand%2C_London_-_geograph.org.uk_-_1601172.jpg",
    website: "https://www.somersethouse.org.uk/",
    category: "historic",
    recommendLevel: 3,
    isFree: true,
    isForKids: false,
    mustSee: false,
    priceAdult: "無料（中庭・テラス。企画展とリンクは有料）",
    priceChild: "無料（中庭・テラス）",
    durationText: "1〜2時間",
    nearestStation: "Temple 徒歩5分",
    openingHours: "中庭 8:00〜23:00（企画展は施設ごとに異なる）",
    area: "westminster",
    stories: [
      {
        kind: "history",
        heading: "官庁を1か所に集める、という発想の建物",
        body: `ここには元々、16世紀にサマセット公が建て始めた宮殿があった。公は完成を見ずに処刑され、建物は1766年に取り壊される。

跡地に建てられたのが現在のサマセット・ハウスで、着工は**1776年**、設計は**ウィリアム・チェンバーズ**。目的が変わっている。宮殿でも邸宅でもなく、**あちこちに散らばっていた官庁を1つの建物にまとめる**ことだった。海軍本部、印紙局、塩税局、糧食局、宝くじ局などが入居している。

これは世界的にも早い例で、**目的に合わせて設計された官庁建築**の先駆けとされる。それまで政府の事務所は既存の建物を借りて使うもので、事務作業のために一から設計するという考え方自体が新しかった。大半の事務室は1788年までに使えるようになっている。

ストランドに面した北棟だけは扱いが違い、王立アカデミー、王立協会、古物協会という**学術団体**のために設計された。`,
      },
      {
        kind: "context",
        heading: "川に向かって建てられている",
        body: `テムズ側に回ると、建物の下部に**アーチの列**が並んでいるのが見える。これは装飾ではない。建設当時、テムズの水面は今よりずっと建物に近く、**船がこのアーチに直接着けられた**。海軍本部が入る建物として、川からの出入りが想定されていた。

現在この足元に道路があるのは、19世紀に**ヴィクトリア・エンバンクメント**が造られてテムズが狭められたためである。川を締め切って下水道と地下鉄を通した都市改造の結果、水辺の建物が内陸に取り残された。同じことがロンドンの川沿いの各所で起きている。

中庭は長らく職員の駐車場だった。1990年代以降に一般公開され、現在は**55本の噴水**が並ぶ広場になっている。夏は水が上がり、冬はスケートリンクが設けられる。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 中庭とテラス、カフェへの立ち入りは**無料**。有料なのは企画展とスケートなどの季節催事
- **コートールド・ギャラリー**が同じ敷地の北棟にある。印象派・後期印象派の収蔵で知られ、こちらは別料金
- 出生・結婚・死亡の登録所が20世紀までここに置かれていた。英国の家系を辿る調査でこの建物名が出てくるのはそのため`,
      },
    ],
  },

  /*
   * SOURCES
   *   https://en.wikipedia.org/wiki/Covent_Garden
   *   https://www.historyhit.com/locations/covent-garden/
   *   https://coventgardenareatrust.org.uk/visitor-info/
   */
  {
    slug: "covent-garden",
    name: "コヴェント・ガーデン",
    engName: "Covent Garden",
    tagline: "修道院の菜園から、ロンドン最初の広場へ",
    summary:
      "イニゴー・ジョーンズが1631年に設計した、ロンドンで最初の「広場」。長く青果市場だったが1974年に卸売が郊外へ移転し、屋根付きの市場建屋は専門店とカフェの並ぶ空間になった。大道芸が許可されている数少ない場所で、ロイヤル・オペラ・ハウスとロンドン交通博物館が面する。",
    address: "Covent Garden, London WC2E 8RF, UK",
    lat: 51.5117,
    lng: -0.1231,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/a/aa/Covent_Garden_Piazza_%28August_2023%29_04.jpg",
    website: "https://www.coventgarden.london/",
    category: "shop",
    recommendLevel: 4,
    isFree: true,
    isForKids: true,
    mustSee: false,
    priceAdult: "無料（広場・市場建屋）",
    priceChild: "無料（広場・市場建屋）",
    durationText: "1〜2時間",
    nearestStation: "Covent Garden 徒歩1分",
    openingHours: "広場は終日／店舗は概ね10:00〜20:00",
    area: "soho",
    stories: [
      {
        kind: "history",
        heading: "名前の「コヴェント」は修道院のこと",
        body: `1200年ごろ、ウェストミンスター寺院の修道院長がこの一帯**40エーカー**を囲い、修道院(convent)の**菜園**(garden)として使った。「Convent Garden」が縮まって Covent Garden になっている。地名がそのまま用途の記録になっている例である。

宗教改革で土地は王室に接収され、のちベッドフォード伯爵家の所有となる。**1631年**、第4代伯爵が建築家**イニゴー・ジョーンズ**に、裕福な借家人を集めるための住宅地の設計を依頼した。

ジョーンズがここで作ったのが、**ロンドン最初のスクエア**(square)である。手本にしたのはイタリアの広場で、三方を統一された意匠の建物で囲み、中央を開けた空間にした。それまでのロンドンの街路は自然発生的に曲がりくねっており、**整形された広場を計画して作る**という発想自体が新しかった。以後ロンドンの都市開発はこの型を繰り返すことになる。`,
      },
      {
        kind: "context",
        heading: "市場が出ていったから、今の姿になった",
        body: `1654年ごろには広場の南側で青果の露店が立ち始め、やがてそれが本業になった。上品な住宅地として設計された広場は、**ロンドン最大の青果卸売市場**に変わっていく。現在の屋根付き市場建屋は19世紀のものである。

1960年代末、この市場が問題になった。トラックが狭い街路に集中し、渋滞が慢性化していた。**1974年**、卸売市場はテムズ南岸のナイン・エルムズへ移転する。

このとき、空いた市場建屋を取り壊して再開発する計画が持ち上がった。反対運動の末に建物は保存され、内部が小売店と飲食店に改装される。**卸売市場が去り、建物だけが残った**ことが現在の姿を決めた。歩行者専用になった広場に大道芸人が集まるようになったのも移転後である。芸を披露するには審査を通る必要があり、場所と時間が割り当てられている。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- ジョーンズが設計した聖パウロ教会が広場の西側に建つ。俳優の墓が多く「役者の教会」と呼ばれる。大道芸はこの教会の柱廊の前で行われる
- **ロンドン交通博物館**が広場の東側、**ロイヤル・オペラ・ハウス**が北東に面している
- 『マイ・フェア・レディ』の冒頭でイライザが花を売っているのは、市場だった時代のこの広場である`,
      },
    ],
  },

  /*
   * SOURCES
   *   https://highgatecemetery.org/about
   *   https://en.wikipedia.org/wiki/Highgate_Cemetery
   *   https://en.wikipedia.org/wiki/Magnificent_Seven_cemeteries
   */
  {
    slug: "highgate-cemetery",
    name: "ハイゲート墓地",
    engName: "Highgate Cemetery",
    tagline: "埋葬地不足が生んだ、ヴィクトリア朝の庭園墓地",
    summary:
      "1839年開設。教会墓地の飽和を受けて郊外に作られた「壮麗なる七墓地」の一つ。エジプト風の通路や環状の霊廟が並ぶ西側と、カール・マルクスの墓がある東側に分かれる。20世紀に放棄されて森に還りかけたが、1975年に発足した保存団体が管理を引き継いだ。",
    address: "Swain's Ln, London N6 6PJ, UK",
    lat: 51.5669,
    lng: -0.1471,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/7/77/Egyptian_Avenue_Highgate_Cemetery.jpg",
    website: "https://highgatecemetery.org/",
    category: "historic",
    recommendLevel: 3,
    isFree: false,
    isForKids: false,
    mustSee: false,
    priceAdult: "£10前後（西側・東側込み）／東側のみ £4.50前後",
    priceChild: "£6前後（西側）／東側のみ 50p前後",
    durationText: "1〜2時間",
    nearestStation: "Archway 徒歩15分",
    openingHours: "10:00〜17:00（11〜2月は16:00まで）",
    area: null,
    stories: [
      {
        kind: "history",
        heading: "教会の墓地が、埋めきれなくなった",
        body: `19世紀前半のロンドンは人口が急増し、**教区の教会墓地が飽和**していた。既存の墓を掘り返して新しい遺体を入れる、浅く埋めるといったことが常態化し、衛生上の危険が指摘されるようになる。

対策として、市街の外縁に大規模な民営墓地を作ることが決まった。1830年代に相次いで開かれた7つがのちに**壮麗なる七墓地**(Magnificent Seven)と呼ばれる。ハイゲートは**1839年**、その3番目として開かれた。

設計思想が独特である。これらは単なる埋葬地ではなく、**庭園として造られた**。曲がりくねった小径、植栽、眺望。死を隠すのではなく、風景の中に配置して見せる。当時のロンドン市民にとってここは散策の場所でもあり、名士の墓を見に来る訪問先でもあった。`,
      },
      {
        kind: "context",
        heading: "一度、森に還りかけた",
        body: `20世紀に入ると民営墓地の経営は行き詰まる。区画が売り切れれば新たな収入が無く、永代管理の費用だけが残るためである。ハイゲートも例外ではなく、**1970年代には事実上放棄されていた**。門は閉ざされ、庭園だった敷地は自生した木に覆われ、霊廟は崩れ、荒らされた。

**1975年**、これを引き取るために**ハイゲート墓地の友の会**が発足する。以後の作業は修復と管理が中心で、危険な状態にあった記念物は順次安定化された。現在は36エーカーの敷地が、**墓地であり、史跡であり、生き物の生息地**という3つの性格を併せ持つ場所として管理されている。

つまり今ここが緑深いのは、造園の意図と放棄された数十年の両方の結果である。整えられた庭園でも、手つかずの森でもない。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- **東側**にカール・マルクスの墓がある。巨大な頭部像は1956年に建てられたもので、当初の墓はもっと目立たない場所にあった
- **西側**のエジプト風通路(エジプシャン・アヴェニュー)と環状霊廟(サークル・オブ・レバノン)は、中央のレバノン杉を囲んで造られている。この杉は墓地より古い
- 現役の墓地でもあり、今も埋葬が行われている。見学は静粛に。西側はガイドツアーが基本`,
      },
    ],
  },

  /*
   * SOURCES
   *   https://www.royalalberthall.com/about-the-hall/news/2016/july/prince-alberts-cultural-vision-and-the-history-of-south-kensington-what-is-albertopolis/
   *   https://en.wikipedia.org/wiki/Royal_Albert_Hall
   *   https://lordslibrary.parliament.uk/royal-albert-hall-at-150/
   */
  {
    slug: "royal-albert-hall",
    name: "ロイヤル・アルバート・ホール",
    engName: "Royal Albert Hall",
    tagline: "万博の利益で作られた、円形の「芸術と科学の殿堂」",
    summary:
      "1871年開場の円形コンサートホール。1851年ロンドン万博の利益を元手にした、アルバート公の文化地区構想の中核として建てられた。夏のプロムスの会場として知られる。公演のない時間帯にはガイドツアーがあり、客席・王室ボックス・舞台裏を見学できる。",
    address: "Kensington Gore, South Kensington, London SW7 2AP, UK",
    lat: 51.5009,
    lng: -0.1773,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/9/93/Royal_Albert_Hall%2C_London_-_Nov_2012.jpg",
    website: "https://www.royalalberthall.com/",
    category: "historic",
    recommendLevel: 3,
    isFree: false,
    isForKids: false,
    mustSee: false,
    priceAdult: "ツアー £16〜18前後（公演は別料金）",
    priceChild: "ツアー £10前後",
    durationText: "1時間（ツアー）",
    nearestStation: "South Kensington 徒歩12分",
    openingHours: "ツアーは日により異なる（公演の合間に実施）",
    area: null,
    stories: [
      {
        kind: "history",
        heading: "万博が黒字だったので、その金で街区を作った",
        body: `**1851年**のロンドン万国博覧会は成功し、**18万ポンド**規模の利益を残した。委員長を務めた**アルバート公**は、この金を配当せずに**サウス・ケンジントンの土地の購入**に充てた。

構想は明確だった。博物館と教育機関を一帯に集め、市民が歴史・文化・美術・音楽・科学を学べる街区を作る。この一帯は後に**アルバートポリス**と呼ばれるようになる。実際にここには自然史博物館、科学博物館、V&A、王立音楽大学が並ぶことになった。**エキシビション・ロード**という通りの名は、その資金源である万博に由来する。

**ロイヤル・アルバート・ホール**はこの構想の中核として**1871年**に開場した。アルバート公自身は1861年に世を去っており、完成を見ていない。ヴィクトリア女王が夫の名を冠した。`,
      },
      {
        kind: "context",
        heading: "音が響きすぎる建物を、キノコで直した",
        body: `この建物には長く知られた欠点があった。**音の反響**である。

原因は形にある。ここは「芸術と科学のホール」として設計されており、**演奏会専用の建物ではなかった**。楕円形の平面と巨大なドーム天井は、講演や展示には向いても、音楽には向かない。天井で反射した音が遅れて客席に届き、はっきりした反響(エコー)として聞こえた。「英国で作曲家が自作を2度聴ける唯一の場所」という皮肉が語られたほどである。

対策が施されたのは**1969年**。天井から**85枚のガラス繊維製の円盤**を吊り下げ、音を拡散させる方式が採られた。キノコのような形からそう呼ばれる。見上げると天井一面に浮いているのが分かる。**建物の欠陥を、後から吊るした部品で補っている**構造で、この円盤は今やホールの見どころの一つになっている。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 夏の**BBCプロムス**の主会場。立ち見席(プロムナード席)が当日券で安く出るのが特徴で、開演前に列ができる
- 外壁を一周する陶製のフリーズ(帯状装飾)には、「芸術と科学の勝利」を主題にした場面が描かれている
- ハイド・パークとケンジントン・ガーデンズの南端に面し、向かいにアルバート公記念碑が立つ`,
      },
    ],
  },

  /*
   * SOURCES
   *   https://www.royalparks.org.uk/visit/parks/st-jamess-park/history
   *   https://en.wikipedia.org/wiki/St_James%27s_Park
   *   https://www.londonmuseum.org.uk/collections/london-stories/st-jamess-park-royal-playground-wildlife-haven/
   */
  {
    slug: "st-jamess-park",
    name: "セント・ジェームズ・パーク",
    engName: "St James's Park",
    tagline: "王立公園で最も古く、ペリカンが360年住み着いている",
    summary:
      "バッキンガム宮殿とホース・ガーズの間に広がる57エーカーの公園。ヘンリー8世が1532年に湿地を排水して鹿の猟場にしたのが始まりで、王立公園では最も古い。1660年代にロシア大使から贈られたペリカンの子孫が今も湖畔にいる。ブルー・ブリッジからの宮殿の眺めで知られる。",
    address: "London SW1A 2BJ, UK",
    lat: 51.5027,
    lng: -0.1341,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/e4/St_James%27s_Park_Lake_%E2%80%93_East_from_the_Blue_Bridge_-_2012-10-06.jpg",
    website: "https://www.royalparks.org.uk/visit/parks/st-jamess-park",
    category: "garden",
    recommendLevel: 4,
    isFree: true,
    isForKids: true,
    mustSee: false,
    priceAdult: "無料",
    priceChild: "無料",
    durationText: "1時間",
    nearestStation: "St James's Park 徒歩2分",
    openingHours: "5:00〜24:00",
    area: "westminster",
    stories: [
      {
        kind: "history",
        heading: "湿地を干拓して、鹿を放った",
        body: `もとは**沼地**だった。ここを変えたのは**ヘンリー8世**で、**1532年**にこの土地を取得して排水し、**鹿の猟場**にした。同時に狩りの拠点として建てたのが、現在のセント・ジェームズ宮殿である。

王立公園のうち最も古いのはこの公園で、以後の歴代の君主がそれぞれ手を加えた。**ジェームズ1世**は動物を集め、ラクダ、ワニ、象まで飼っている。当時の王侯にとって珍しい動物の収集は権威の誇示だった。このとき造られた東端の池と島が、現在のダック・アイランドにあたる。

**チャールズ2世**は亡命先のフランスの様式に倣い、直線的な運河を掘って庭園を整えた。現在の曲線的な湖と樹木の配置は、**1820年代にジョン・ナッシュ**が改めたものである。フランス式の直線を、英国式の自然な曲線に作り替えた形になる。`,
      },
      {
        kind: "context",
        heading: "ペリカンは外交の贈り物だった",
        body: `この公園の湖には**ペリカン**がいる。ロンドンの都心には不釣り合いな鳥だが、由来がはっきりしている。

**1664年**、**ロシア大使**がチャールズ2世に贈ったのが最初である。以来360年以上、この公園ではペリカンが飼われ続けてきた。累計40羽以上が住んだとされる。血統が続いているというより、**贈り物として始まった慣習が制度として維持されている**という性格が強い。

餌の時間が決まっており、その時刻には湖畔に人が集まる。野生の鳥ではないので、公園の職員が世話をしている。

**ブルー・ブリッジ**は湖の中ほどに架かる橋で、ここが公園で最も知られた撮影場所になっている。西を向けばバッキンガム宮殿、東を向けばホース・ガーズの尖塔とロンドン・アイが水面越しに重なる。**儀式の中心を両側から挟んで見られる**位置にある。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 衛兵交代式の行列はこの公園を通る。宮殿前の人垣を避けて、公園側で行進を見る方法がある
- リスが多く、人に近寄る。餌をやる行為は勧められていない
- ホース・ガーズ・パレードに隣接しており、トゥルーピング・ザ・カラーの会場はこの公園の東端にあたる`,
      },
    ],
  },

  /*
   * SOURCES
   *   https://en.wikipedia.org/wiki/Regent%27s_Park
   *   https://www.royalparks.org.uk/visit/parks/the-regents-park
   *   https://historicengland.org.uk/listing/the-list/list-entry/1000246
   */
  {
    slug: "regents-park",
    name: "リージェンツ・パーク",
    engName: "The Regent's Park",
    tagline: "宮殿を建てるはずだった土地が、公園として残った",
    summary:
      "ロンドン北部の410エーカーの王立公園。1811年、摂政皇太子のためにジョン・ナッシュが立案した都市計画の一部で、当初は宮殿と邸宅群を建てる予定だった。計画は縮小され、公園として残る。園内にロンドン動物園、野外劇場、1万株超のバラを植えたクイーン・メアリーズ・ガーデンがある。",
    address: "Chester Rd, London NW1 4NR, UK",
    lat: 51.5313,
    lng: -0.1570,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Regent%27s_Park_London.jpg",
    website: "https://www.royalparks.org.uk/visit/parks/the-regents-park",
    category: "garden",
    recommendLevel: 3,
    isFree: true,
    isForKids: true,
    mustSee: false,
    priceAdult: "無料",
    priceChild: "無料",
    durationText: "1〜2時間",
    nearestStation: "Regent's Park 徒歩3分",
    openingHours: "5:00〜日没",
    area: null,
    stories: [
      {
        kind: "history",
        heading: "計画倒れになったおかげで、公園になった",
        body: `この土地は長く王室の所有で、メリルボーン・パークと呼ばれていた。**1811年**に貸借の期限が切れて王室に戻ることになり、これを機に**摂政皇太子**(のちのジョージ4世)が建築家**ジョン・ナッシュ**に開発計画を立てさせた。

ナッシュの構想は壮大だった。皇太子のための**宮殿**を園内に置き、その周囲に**40棟の邸宅**を配し、外周を統一された意匠のテラスハウスで囲む。さらにこの公園から南のカールトン・ハウスまで、新しい大通り(リージェント街)で結ぶ。

**実現したのは一部である**。宮殿は建てられず、40棟の予定だった邸宅は**8棟**に減った。外周のテラスハウスと通りは造られたので、街路の骨格だけが計画通りに残った。

結果として、**建物で埋めるはずだった中心部が空いたまま**になった。410エーカーの緑地が都心の北に残っているのは、この計画が完遂されなかったためである。一般に開かれたのは**1835年**、当初は週2日だけだった。`,
      },
      {
        kind: "context",
        heading: "円の内側に、後から庭が作られた",
        body: `公園の中央には**インナー・サークル**という円形の道路がある。ナッシュの計画では、この内側は個人に貸し出される区画だった。

ここが一般に開かれたのは**1930年代**である。造られた庭園は**クイーン・メアリーズ・ガーデン**と名付けられ、現在はバラで知られる。1万株を超える規模で、見頃は初夏になる。つまりこの公園は、**外側が19世紀、内側が20世紀**という二重の構造を持っている。

同じ円の内側に**野外劇場**(Open Air Theatre)がある。夏季のみ運営され、シェイクスピアやミュージカルが樹木を背景に上演される。雨天でも原則として続行される。

北端には**ロンドン動物園**がある。1828年開園で公園より古く、公園の一部を占める形で今も運営されている。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 外周の**テラスハウス**はナッシュの設計。白い漆喰塗りの列柱が並び、公園側から見ると宮殿のように見えるが、実際は連続した住宅である
- 北側の**プリムローズ・ヒル**は公園の一部で、ロンドン中心部を見渡す眺望がある。丘の上からの眺めは法律で保護されている
- リージェンツ運河が公園の北端をかすめており、リトル・ヴェニス方面へ水路沿いに歩ける`,
      },
    ],
  },

  /*
   * SOURCES
   *   https://www.royalparks.org.uk/visit/parks/greenwich-park/history
   *   https://en.wikipedia.org/wiki/Greenwich_Park
   *   https://friendsofgreenwichpark.org.uk/The-Park/Creation-of-Greenwich-Park/
   */
  {
    slug: "greenwich-park",
    name: "グリニッジ・パーク",
    engName: "Greenwich Park",
    tagline: "王立公園で最初に囲われた、世界遺産の丘",
    summary:
      "テムズ南岸の高台に広がる王立公園。1433年に囲い込まれた、王立公園で最も古い囲い地。丘の上に王立天文台が建ち、本初子午線が通る。斜面の芝生からロンドン中心部とカナリー・ワーフが一望できる。旧王立海軍学校や国立海事博物館とともに世界遺産の構成要素になっている。",
    address: "Greenwich, London SE10 8QY, UK",
    lat: 51.4769,
    lng: 0.0005,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/dd/Greenwich_Park_Vista.jpg",
    website: "https://www.royalparks.org.uk/visit/parks/greenwich-park",
    category: "garden",
    recommendLevel: 4,
    isFree: true,
    isForKids: true,
    mustSee: false,
    priceAdult: "無料",
    priceChild: "無料",
    durationText: "1〜2時間",
    nearestStation: "Cutty Sark (DLR) 徒歩8分",
    openingHours: "6:00〜日没",
    area: "greenwich",
    stories: [
      {
        kind: "history",
        heading: "1433年に囲われた、最初の王立公園",
        body: `**1433年**、ハンフリー・オブ・グロスター公がこの土地を囲い込んだ。**王立公園のうち最初に囲われた**のがここである。公は丘の上に塔を建てており、その場所には後に王立天文台が建つことになる。

公園の形を決めたのは17世紀の改造だった。**チャールズ2世**は、ヴェルサイユ庭園で知られるフランスの造園家**アンドレ・ル・ノートル**に設計を求めた。中世の荒れ地と猟場だった土地が、菱形に交差する並木道と、斜面を階段状に刻んだ**段丘**を持つ整形庭園に作り替えられる。天文台へ向かう斜面の「巨人の階段」と呼ばれた段は、このときのものである。

さらに古い層もある。園内にはローマ時代の**神殿跡**とみられる遺構があり、西側には**アングロサクソン時代の墳墓群**が並ぶ。丘の上という立地が、時代を超えて意味を持ち続けたことが分かる。`,
      },
      {
        kind: "context",
        heading: "この斜面が、写真の撮れる場所である",
        body: `グリニッジで最もよく知られた眺めは、天文台の建つ丘の斜面から北を向いたものである。

手前に**旧王立海軍学校**の左右対称の建物と**クイーンズ・ハウス**の白い箱が並び、その向こうにテムズが横切り、対岸に**カナリー・ワーフ**の高層ビル群が立つ。**17世紀の建築と20世紀の金融街が一つの視界に収まる**構図で、ロンドンの都市史がそのまま奥行きになっている。

この眺めが成立しているのは偶然ではない。クイーンズ・ハウスから川へ抜ける視線は建築の意図として設計されており、その軸線上に建物を建てないことで保たれてきた。

公園と天文台、海事博物館、旧海軍学校をまとめて**海事都市グリニッジ**として世界遺産に登録されている。個々の建物ではなく、この配置全体が評価されている。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 丘は思ったより急である。天文台まで歩いて上る場合、坂道を10分ほど見ておくとよい
- 園内に**鹿の囲い地**(ザ・ワイルダネス)があり、17世紀から鹿が飼われている
- 2012年ロンドン五輪では馬術と近代五種の会場になった`,
      },
    ],
  },

  /*
   * SOURCES
   *   https://www.frp.org.uk/history/
   *   https://en.wikipedia.org/wiki/Richmond_Park
   *   https://www.londonmuseum.org.uk/collections/london-stories/richmond-park-londons-biggest-park/
   */
  {
    slug: "richmond-park",
    name: "リッチモンド・パーク",
    engName: "Richmond Park",
    tagline: "600頭超の鹿が放し飼いにされた、ロンドン最大の公園",
    summary:
      "ロンドン最大の王立公園。チャールズ1世が1637年に約2,500エーカーを塀で囲って鹿の猟場にしたのが始まりで、今も600頭を超えるアカシカとダマジカが放し飼いにされている。国立自然保護区でもある。園内のキング・ヘンリーズ・マウンドからは、16キロ離れたセント・ポール大聖堂が法律で保護された視線の先に見える。",
    address: "Richmond, London TW10 5HS, UK",
    lat: 51.4425,
    lng: -0.2735,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/03/Richmond_Park.jpg",
    website: "https://www.royalparks.org.uk/visit/parks/richmond-park",
    category: "garden",
    recommendLevel: 3,
    isFree: true,
    isForKids: true,
    mustSee: false,
    priceAdult: "無料",
    priceChild: "無料",
    durationText: "2〜3時間",
    nearestStation: "Richmond 徒歩25分（またはバス）",
    openingHours: "7:00〜日没（夏季）／7:30〜日没（冬季）",
    area: null,
    stories: [
      {
        kind: "history",
        heading: "塀で囲った王と、通行権を訴えたビール醸造業者",
        body: `**1637年**、**チャールズ1世**がリッチモンドの丘一帯**約2,500エーカー**を囲い、アカシカとダマジカの猟場にした。囲いには**8マイルに及ぶ煉瓦の塀**が築かれている。

これは地元では歓迎されなかった。共有地として使ってきた土地が、塀一つで立ち入れなくなったからである。反発を受けて王は歩行者の通行権を認めたが、その後の管理者は次第に立ち入りを制限していった。

決着をつけたのは**1758年**、リッチモンドの**ビール醸造業者ジョン・ルイス**が起こした裁判だった。この訴訟で**歩行者がいつでも通行できる権利**が確認され、管理者による締め出しは覆される。**個人が王室の管理者を相手取って公共のアクセスを守った**例として記録されている。

現在この公園を誰でも自由に歩けるのは、この判決の帰結である。`,
      },
      {
        kind: "context",
        heading: "16キロ先の大聖堂が、法律で守られている",
        body: `園内の**キング・ヘンリーズ・マウンド**という小さな塚から東を向くと、樹木の間に切り取られた細い視界の先に、**セント・ポール大聖堂**のドームが見える。距離はおよそ**16キロ**ある。

この眺めは偶然残っているのではない。**保護された景観**(protected vista)として指定されており、この視線上に高い建物を建てることが規制されている。ロンドンには同種の保護された視線が複数あり、都市の高層化が進む中で特定の眺めだけが法的に守られている。

したがってここで見えているのは、大聖堂そのものというより**都市計画の意思**である。何百年も前の眺めを、規制によって現在まで維持しているという事実のほうが、この場所の見どころにあたる。

鹿は今も**600頭を超える**規模で放し飼いにされている。柵はなく、歩道のすぐ脇にいることも多い。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 鹿は**野生動物**である。特に9〜11月の交尾期と5〜7月の出産期は気が立つ。**50メートル以上離れる**よう公園側が求めている。餌をやらないこと
- 面積が広く、端から端まで歩くと相当な時間がかかる。自転車での周回路がある
- **イザベラ・プランテーション**という庭園が園内にあり、春はツツジとシャクナゲで知られる`,
      },
    ],
  },

  /*
   * SOURCES
   *   https://www.hampsteadheath.net/protecting-the-heath
   *   https://en.wikipedia.org/wiki/Hampstead_Heath
   *   https://www.oss.org.uk/hampstead-heaths-milestone-act-of-parliament/
   */
  {
    slug: "hampstead-heath",
    name: "ハムステッド・ヒース",
    engName: "Hampstead Heath",
    tagline: "地主の宅地化を30年阻んで守られた、起伏のある原野",
    summary:
      "ロンドン北部に広がる約800エーカーの原野。19世紀に地主が宅地開発を繰り返し試み、その都度阻まれた末、1871年の法律で「永久に囲わず建てず」と定められた。パーラメント・ヒルからの中心部の眺めは法律で保護されている。通年で泳げる池があり、ケンウッド・ハウスが敷地の北側に建つ。",
    address: "Hampstead, London NW3 1TH, UK",
    lat: 51.5608,
    lng: -0.1629,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/1c/Parliament_Hill_view_of_Central_London_-_geograph.org.uk_-_1568116.jpg",
    website: "https://www.cityoflondon.gov.uk/things-to-do/green-spaces/hampstead-heath",
    category: "garden",
    recommendLevel: 3,
    isFree: true,
    isForKids: true,
    mustSee: false,
    priceAdult: "無料（遊泳池は有料）",
    priceChild: "無料（遊泳池は有料）",
    durationText: "2〜3時間",
    nearestStation: "Hampstead Heath 徒歩1分",
    openingHours: "終日開放",
    area: null,
    stories: [
      {
        kind: "history",
        heading: "地主が売りたがり、遺言がそれを止めていた",
        body: `19世紀のハムステッド・ヒースは、**サー・トマス・メアリオン・ウィルソン**という地主の所有地だった。ロンドンが北へ広がるにつれ、この起伏のある原野は宅地として高い価値を持つようになる。

ウィルソンは開発したかったが、できなかった。父の遺言が**21年を超える借地契約を禁じていた**ためである。当時の宅地開発は99年の長期借地を前提としており、21年では住宅を建てて回収する事業が組めない。

そこで彼は法律を変えようとした。共有地を囲い込む権限を求める私法案を議会に出し、これを繰り返す。**30年以上にわたる攻防**の末、法案はいずれも通らなかった。

ウィルソンは1869年に世を去る。**1871年**、議会は**ハムステッド・ヒース法**を成立させ、200エーカーを公共のために取得した。法の文言は明快で、管理者は「ヒースを永久に**開かれた、囲われない、建物の建たない**状態に保つ」こと、そして「ヒースの**自然な様相と状態**を可能な限り保存する」ことを義務づけられた。`,
      },
      {
        kind: "context",
        heading: "整備されていないのは、そう決められているから",
        body: `他の王立公園を見たあとにここへ来ると、印象がはっきり違う。花壇も並木道も整形された芝生も少なく、雑木林と草地と池が入り混じっている。

これは手入れ不足ではない。1871年法が求めているのは、庭園として整えることではなく、**自然な様相を保存する**ことだからである。管理の目標が他の公園と根本的に違う。ロンドンの中心から地下鉄で20分の場所に、意図的に整備されない土地が残されている。

その後も敷地は足されていった。**パーラメント・ヒル**が1888年、ゴールダーズ・ヒルが1898年、拡張部が1907年、そして**1928年**にアイヴィー伯がケンウッド邸の残余を国へ遺贈している。現在の約800エーカーは、半世紀以上かけて継ぎ足された結果である。

**パーラメント・ヒルからの中心部の眺めは法律で保護されている**。リッチモンド・パークの視線と同じ仕組みで、この方向には高い建物を建てられない。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- **遊泳池**(ポンド)が男性用・女性用・混合の3つあり、**通年で泳げる**。冬も水温は下がるだけで閉まらない。有料で、事前予約が要る
- **ケンウッド・ハウス**が敷地の北側に建つ。レンブラントとフェルメールが無料で見られる屋敷で、ヒースの散策と組み合わせられる
- 起伏が大きく、ぬかるむ道が多い。歩きやすい靴が要る`,
      },
    ],
  },
];

const APPLY = process.argv.includes("--apply");
const ONLY = process.argv.find((a) => a.startsWith("--slug="))?.slice(7);

async function main() {
  const targets = SPOTS.filter((s) => !ONLY || s.slug === ONLY);
  if (ONLY && targets.length === 0) {
    console.error(`slug=${ONLY} はこのスクリプトの対象外です`);
    process.exitCode = 1;
    return;
  }

  console.log(APPLY ? "== 投入 ==\n" : "== ドライラン(--apply で投入) ==\n");

  for (const spot of targets) {
    const existing = await prisma.attraction.findUnique({
      where: { slug: spot.slug },
      select: { id: true, name: true },
    });
    const nameClash = await prisma.attraction.findFirst({
      where: { name: spot.name, slug: { not: spot.slug } },
      select: { slug: true },
    });

    const chars = spot.stories.reduce((n, s) => n + s.body.length, 0);
    console.log(
      `${spot.name} (${spot.slug})\n` +
        `  ${existing ? "既存を更新" : "新規"} / ${spot.category} / lv${spot.recommendLevel} / ` +
        `${spot.stories.length}本 ${chars}字`,
    );
    if (nameClash) {
      console.error(`  ✗ name が ${nameClash.slug} と衝突します。name は @unique です`);
      process.exitCode = 1;
      continue;
    }
    spot.stories.forEach((s) =>
      console.log(`    ${s.kind.padEnd(9)} ${s.heading ?? "(既定ラベル)"}  ${s.body.length}字`),
    );

    if (!APPLY) {
      console.log("");
      continue;
    }

    const { stories, ...cols } = spot;
    const saved = await prisma.attraction.upsert({
      where: { slug: spot.slug },
      create: cols,
      update: cols,
      select: { id: true },
    });

    // 読み物は作り直す。source: "authored" なので移行スクリプトは触らない。
    await prisma.$transaction([
      prisma.attractionStory.deleteMany({ where: { attractionId: saved.id } }),
      prisma.attractionStory.createMany({
        data: stories.map((s, i) => ({
          attractionId: saved.id,
          kind: s.kind,
          heading: s.heading,
          body: s.body,
          displayOrder: i + 1,
          source: "authored",
        })),
      }),
    ]);
    console.log("    → 投入\n");
  }

  const total = targets.reduce(
    (n, s) => n + s.stories.reduce((m, t) => m + t.body.length, 0),
    0,
  );
  console.log(`対象 ${targets.length}件 / 本文 合計 ${total}字`);
  if (!APPLY) console.log("\n--apply を付けると投入します。");
}

if (process.argv[1]?.includes("add-attractions-2026-08")) {
  main()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

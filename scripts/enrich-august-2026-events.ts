/**
 * 2026年8月開催イベントの情報を拡充する一度きりのスクリプト。
 *
 * 1. 月別Content時代の名残で同一イベントが月ごとに重複登録されている行を整理
 * 2. description末尾の「開催日：」行を削除(startDate/endDateで表現済みのため)
 * 3. 8月開催イベントに会場・アクセス・料金・おすすめポイントを付与
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

/** 通年イベントが月ごとに分割登録されていた重複行。残す1行以外を削除する。 */
const DUPLICATE_TITLES_TO_DELETE = [
  "BBC Proms（BBCプロムス）",
  "Buckingham Palace Summer Opening（バッキンガム宮殿 夏季一般公開）",
  "Buckingham Palace Summer Opening - Final Weeks（バッキンガム宮殿 夏季一般公開 最終週）",
  "The Championships, Wimbledon（ウィンブルドン選手権）",
  "Hyde Park Winter Wonderland（ハイド・パーク ウィンター・ワンダーランド開幕）",
];

type EventSeed = {
  /** 既存行を探すためのタイトル。無ければ新規作成 */
  matchTitle?: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  category: string;
  venue: string;
  area: string;
  nearestStation: string;
  priceInfo: string;
  isFree: boolean;
  bookingRequired: boolean;
  highlights: string[];
  tips: string;
  website: string;
  displayOrder: number;
};

const AUGUST_EVENTS: EventSeed[] = [
  {
    matchTitle: "Buckingham Palace Summer Opening（バッキンガム宮殿 夏季一般公開）",
    title: "Buckingham Palace Summer Opening（バッキンガム宮殿 夏季一般公開）",
    description:
      "**国王の公式ロンドン邸宅バッキンガム宮殿のステート・ルームが、年に一度公開される夏季限定の機会**。金箔と深紅で彩られたスロー・ルーム、歴代君主が集めたレンブラントやフェルメールが並ぶピクチャー・ギャラリーなど、公式行事に使われる19室を順路に沿って見学できる。チケットには宮殿庭園への入場も含まれ、ロンドン中心部とは思えない広大な芝生と湖を散策できる。\n\n8月は9:30〜19:30の毎日開館(最終入場17:30)。9月からは木〜月曜のみの開館に変わるため、毎日開いている8月は最も予定を組みやすい時期といえる。",
    startDate: utc(2026, 7, 9),
    endDate: utc(2026, 9, 27),
    category: "王室・歴史",
    venue: "Buckingham Palace",
    area: "セント・ジェームズ/ウェストミンスター",
    nearestStation: "Green Park駅/Victoria駅(徒歩約10分)",
    priceInfo: "大人(25歳以上)£33、18〜24歳£21.50、5歳以上の子供£16.50、5歳未満無料",
    isFree: false,
    bookingRequired: true,
    highlights: [
      "年間を通じて夏の数か月しか入れない、王室公邸の内部を見学できる貴重な機会",
      "入場料に宮殿庭園が含まれ、テラスからの眺めとカフェも楽しめる",
      "日本語を含む多言語マルチメディアガイドが無料で付属(12歳未満向けの子供版もあり)",
      "8月は毎日開館。9月は木〜月曜のみとなるため日程を組みやすいのは8月",
    ],
    tips: "時間指定制で、7〜8月の枠は数週間前に埋まることが多いため必ず事前予約を。2026年は改修工事(Reservicing Programme)のためホワイト・ドローイング・ルームが非公開、ボールルームの一部も仮囲いで隠れている点に注意。",
    website: "https://www.rct.uk/visit/buckingham-palace",
    displayOrder: 1,
  },
  {
    matchTitle: "BBC Proms - First Night（BBCプロムス開幕）",
    title: "BBC Proms（BBCプロムス）",
    description:
      "**ロイヤル・アルバート・ホールを舞台に8週間続く、世界最大級のクラシック音楽祭**。1895年に「気軽な服装で、安く、誰でもクラシックに触れられる場を」という理念で始まり、130年を経た今もその精神が守られている。2026年は7月17日から9月12日まで、80公演以上が組まれる。\n\n2026年のテーマはアメリカ独立宣言250周年にちなんだ**アメリカ音楽**。ガーシュウィンやバーンスタイン、コープランドといった定番から現代作曲家の委嘱作まで、例年以上に間口の広いプログラムになっている。",
    startDate: utc(2026, 7, 17),
    endDate: utc(2026, 9, 12),
    category: "音楽・クラシック",
    venue: "Royal Albert Hall(一部公演はCadogan Hall等)",
    area: "サウス・ケンジントン",
    nearestStation: "South Kensington駅(徒歩約12分)/High Street Kensington駅",
    priceInfo: "当日立見券(Promming)£8、指定席は公演により£20〜£100程度",
    isFree: false,
    bookingRequired: false,
    highlights: [
      "**当日券の立見席「Promming」が£8**。世界トップ級のオーケストラをこの価格で聴けるのはプロムス最大の魅力",
      "ドレスコードなし。Tシャツにリュックの観光客が普通に混ざっている、格式張らない音楽祭",
      "アリーナ席(舞台正面の平土間)に立てば、指揮者の表情が見える距離で聴ける",
      "2026年はアメリカ音楽がテーマ。クラシック初心者でも知っている曲に出会いやすい年",
    ],
    tips: "Promming券は各公演当日の朝9:30にオンラインで約1,000枚が売り出され、Door 12の当日券売り場でも販売される。人気公演は開場前から列ができるので、狙うなら早めに。立ち見は2時間近くになることもあるため歩きやすい靴で。",
    website: "https://www.royalalberthall.com/tickets/proms/bbc-proms-2026",
    displayOrder: 2,
  },
  {
    title: "Ealing Blues Festival（イーリング・ブルース・フェスティバル）",
    description:
      "**39年の歴史を持つ、ロンドン西部イーリングの野外ブルース・フェスティバル**。ローリング・ストーンズやザ・フーを生んだ「イーリング・クラブ」の街という土地柄を受け継ぎ、アメリカのリズム&ブルースから英国ブルース、スカ、レゲエへと至る音楽の流れを2日間でたどる構成になっている。2026年はRobert Finley、Bob Log III、Misty in Rootsらが出演。\n\nウォルポール・パークの芝生にレジャーシートを広げ、ピクニック気分で音楽を聴く地元密着型の雰囲気で、大型フェスの喧騒が苦手な人にも向いている。",
    startDate: utc(2026, 8, 1),
    endDate: utc(2026, 8, 2),
    category: "音楽・フェス",
    venue: "Walpole Park",
    area: "イーリング(ロンドン西部)",
    nearestStation: "Ealing Broadway駅(徒歩約10分)",
    priceInfo: "£10〜。週末通し券・VIP券あり。0〜11歳は無料",
    isFree: false,
    bookingRequired: false,
    highlights: [
      "チケット£10〜と、ロンドンの音楽フェスとしては破格の安さ",
      "11歳以下は無料。芝生でくつろげるファミリー向けの空気感",
      "英国ロックの源流「イーリング・クラブ」ゆかりの地で聴くブルースという文脈の面白さ",
      "中心部から地下鉄セントラル線/エリザベス線で20〜30分とアクセスしやすい",
    ],
    tips: "屋外の芝生開催なので、レジャーシートと羽織るものを。8月上旬のロンドンは日中20℃台でも日が落ちると急に冷える。",
    website: "https://ealingsummerfestivals.com/",
    displayOrder: 3,
  },
  {
    matchTitle: "Camden Fringe（カムデン・フリンジ）",
    title: "Camden Fringe（カムデン・フリンジ）",
    description:
      "**カムデン一帯の小劇場を舞台にした、演劇とコメディの祭典**。エディンバラ・フリンジに出るには資金が足りない、あるいはロンドンで試したい――そんな作り手のために2006年に始まり、2026年で**20周年**を迎える。2026年は39会場で450本以上の公演がかかる過去最大規模。\n\n歴史劇風ミュージカル、フェミニスト・キャバレー、マーダーミステリー、フィジカルシアター、子供向けまでジャンルは雑多で、無名の実験作と将来のスターが同じ値段で並んでいるのがフリンジの醍醐味。",
    startDate: utc(2026, 8, 3),
    endDate: utc(2026, 8, 30),
    category: "演劇・コメディ",
    venue: "Camden People's Theatre、The Cockpit、Old Red Lion、Camden Comedy Club、Upstairs at the Gatehouse など39会場",
    area: "カムデン/北ロンドン一帯",
    nearestStation: "Camden Town駅、Kentish Town駅ほか(会場により異なる)",
    priceInfo: "1公演あたり£5〜£15程度が中心",
    isFree: false,
    bookingRequired: true,
    highlights: [
      "1公演£5〜£15。ウエストエンドの1/10以下の価格で舞台に触れられる",
      "2026年は20周年で450本以上・39会場と過去最大規模",
      "公演時間は1時間前後が中心。夜に2〜3本はしごする楽しみ方ができる",
      "客席50〜100人規模の小空間が多く、演者との距離が近い",
    ],
    tips: "英語のセリフ量が多いコメディは難易度が高め。英語に自信がなければフィジカルシアターやダンス、マイム系の演目を選ぶと言語の壁が低い。公式サイトでジャンル別に絞り込める。",
    website: "https://camdenfringe.com/",
    displayOrder: 4,
  },
  {
    title: "Longines Global Champions Tour of London（ロンジン・グローバル・チャンピオンズツアー ロンドン大会）",
    description:
      "**世界最高峰の馬術(障害飛越)サーキットのロンドン大会**。会場は現役を退いた軍人が暮らす17世紀の王立施設「ロイヤル・ホスピタル・チェルシー」の南庭で、クリストファー・レンが設計した赤煉瓦の建物を背景に、オリンピックメダリストを含むトップライダーが競う。\n\n3日間でCSI2*・CSI5*の各競技、チーム戦のGCL、そして最終日のグランプリが行われる。ロンドン大会は2037年までの長期開催が決まっており、チェルシーの夏の定番行事として定着しつつある。",
    startDate: utc(2026, 8, 7),
    endDate: utc(2026, 8, 9),
    category: "スポーツ",
    venue: "Royal Hospital Chelsea(South Grounds)",
    area: "チェルシー",
    nearestStation: "Sloane Square駅(徒歩約12分)",
    priceInfo: "日により変動。4歳未満は保護者膝上で無料、4〜12歳は同伴割引あり",
    isFree: false,
    bookingRequired: true,
    highlights: [
      "チェルシー・フラワーショーと同じ歴史的会場で開かれる、非日常感のある舞台設定",
      "馬術を知らなくても「落とさず速く飛ぶ」だけのシンプルなルールで観戦しやすい",
      "会場内にシャンパンバーやフードスタンドが並び、観戦しない時間も過ごせる",
      "最終日のグランプリが最大の見どころ",
    ],
    tips: "芝生の上を歩くので、ヒールの高い靴は避けた方が無難。真夏でも屋外なので日差し対策を。",
    website: "https://www.gcglobalchampions.com/en-us/schedule/2026/london",
    displayOrder: 5,
  },
  {
    title: "The Weeknd - Wembley Stadium（ザ・ウィークエンド ウェンブリー公演）",
    description:
      "**ザ・ウィークエンドが英国最大の会場ウェンブリー・スタジアムで行う5公演**。8月14・15・16・18・19日の日程で、9万人規模のスタジアムを5夜連続に近い形で埋める大型公演となる。\n\n「Blinding Lights」「Save Your Tears」などのヒット曲に加え、大規模なステージ演出を伴うスタジアムショー仕様。ロンドン滞在が8月中旬に重なるなら、日程を合わせる価値のあるイベント。",
    startDate: utc(2026, 8, 14),
    endDate: utc(2026, 8, 19),
    category: "音楽・ポップス",
    venue: "Wembley Stadium",
    area: "ウェンブリー(ロンドン北西部)",
    nearestStation: "Wembley Park駅(徒歩約10分)",
    priceInfo: "公演・座席により大きく変動(一般的にスタジアム公演は£70〜£200程度)",
    isFree: false,
    bookingRequired: true,
    highlights: [
      "8月14・15・16・18・19日の5公演。滞在日程に合わせやすい",
      "収容9万人のウェンブリー・スタジアムならではの大規模演出",
      "Wembley Park駅から会場までのウェンブリー・ウェイの高揚感も含めて体験価値が高い",
    ],
    tips: "終演後はWembley Park駅が非常に混雑し、入場規制がかかる。時間に余裕を見ておくか、隣のWembley Stadium駅(Marylebone方面)を使う手もある。",
    website: "https://www.wembleystadium.com/",
    displayOrder: 6,
  },
  {
    title: "Regent's Park Open Air Theatre（リージェンツ・パーク野外劇場 夏のシーズン）",
    description:
      "**公園の木立に囲まれた1,250席の野外劇場**。1932年開場で、ロンドンの夏を代表する舞台のひとつ。2026年の目玉はドリュー・マコーニー演出による『**キャッツ**』で、英国では初となる再演版が7月25日から9月12日まで上演される。\n\n8月中旬からは4歳以上向けのファミリー公演『Anansi the Spider』(西アフリカ・カリブの民話をもとにした昼公演)が加わり、ライブ・ミュージック・ウィークやファミリー・テイクオーバー・デイも開催される。日没とともに照明が効いてくる演出は屋内劇場では味わえない。",
    startDate: utc(2026, 7, 25),
    endDate: utc(2026, 9, 12),
    category: "演劇・ミュージカル",
    venue: "Regent's Park Open Air Theatre",
    area: "リージェンツ・パーク",
    nearestStation: "Baker Street駅(徒歩約10分)",
    priceInfo: "£15〜。多くの席が£25以下、月曜公演は上限価格設定あり",
    isFree: false,
    bookingRequired: true,
    highlights: [
      "『キャッツ』英国初の再演版が2026年シーズンの中心演目",
      "£15から観られ、月曜公演は価格が抑えられている",
      "劇場前の芝生でピクニック可。食べ物の持ち込みが認められている",
      "8月15日からはファミリー向け『Anansi the Spider』(4歳〜)の昼公演も",
    ],
    tips: "雨天でも原則決行(荒天中止時のみ振替)。ブランケットやレインコートがあると安心で、会場でも販売している。夜公演は終演が22時近くになるため、上着は必須。",
    website: "https://openairtheatre.com/",
    displayOrder: 7,
  },
  {
    title: "Ariana Grande - The O2 Residency（アリアナ・グランデ O2レジデンシー）",
    description:
      "**アリアナ・グランデによるThe O2での10公演レジデンシー**。8月15・16・19・20・23・24・27・28・31日と9月1日の日程で組まれ、ロンドンに長期滞在型で腰を据える形の公演となる。\n\nThe O2は2万人規模の屋内アリーナで、天候に左右されないのがスタジアム公演との違い。同一会場で複数日程が確保されているため、他の予定と調整しやすいのも利点。",
    startDate: utc(2026, 8, 15),
    endDate: utc(2026, 9, 1),
    category: "音楽・ポップス",
    venue: "The O2 Arena",
    area: "グリニッジ半島(ロンドン東部)",
    nearestStation: "North Greenwich駅(徒歩約5分)",
    priceInfo: "公演・座席により変動(アリーナ公演は一般的に£60〜£180程度)",
    isFree: false,
    bookingRequired: true,
    highlights: [
      "8月中に9公演が組まれており、日程を合わせやすい",
      "屋内アリーナのため雨天の心配がない",
      "North Greenwich駅から徒歩5分。ジュビリー線でロンドン中心部から20分程度",
      "会場周辺に飲食店が集まっており、開演前の時間をつぶしやすい",
    ],
    tips: "同じ8月下旬はGDIFやオール・ポインツ・イーストとも重なる時期。グリニッジ地区の観光と組み合わせると移動が効率的。",
    website: "https://www.theo2.co.uk/",
    displayOrder: 8,
  },
  {
    title: "All Points East（オール・ポインツ・イースト）",
    description:
      "**ヴィクトリア・パークで2週末にわたって開かれる大型音楽フェス**。8月21日から30日までの会期のうち、有料公演日は5日間。2026年のラインナップはJorja Smith&Tems(21日)、Lorde(22日)、Deftones率いるOutbreak Festival(23日)、Tyler, the Creator(28・29日)、Twenty One Pilots(30日)。\n\n特筆すべきは2週末の間の平日(8月24〜27日)で、「**In The Neighbourhood**」と称して公園が地域向けに無料開放される。映画上映やワークショップ、屋台が出て、チケットを持たない人でもフェスの空気を味わえる。",
    startDate: utc(2026, 8, 21),
    endDate: utc(2026, 8, 30),
    category: "音楽・フェス",
    venue: "Victoria Park",
    area: "ハックニー/東ロンドン",
    nearestStation: "Mile End駅、Hackney Wick駅、Bethnal Green駅",
    priceInfo: "有料公演日は1日券£70〜£100程度。平日「In The Neighbourhood」は無料",
    isFree: false,
    bookingRequired: true,
    highlights: [
      "**8月24〜27日の平日は無料開放**。チケットなしでも公園でフェスの雰囲気を楽しめる",
      "1日ごとにジャンルが大きく変わる編成(ソウル/ポップ/ヘヴィ/ヒップホップ)",
      "都心から地下鉄で20分程度。宿を移さずに参加できる",
      "23日のOutbreak FestivalはDeftones、IDLES、Interpolなどラウド系に特化した一日",
    ],
    tips: "日ごとに別チケットなので、狙いのアーティストの出演日を必ず確認すること。公園内は芝生で、雨が降るとぬかるむためスニーカーよりも防水性のある靴が無難。",
    website: "https://www.allpointseastfestival.com/",
    displayOrder: 9,
  },
  {
    title: "Greenwich+Docklands International Festival（グリニッジ+ドックランズ国際フェスティバル）",
    description:
      "**ロンドン最大級の野外パフォーマンス芸術祭で、そのほぼ全てが無料**。8月21日から9月6日までの17日間、グリニッジ、ニューアム、テムズミードの街路や公園そのものが舞台になる。2026年は25以上のカンパニーが参加し、世界初演3作、英国初演5作、ロンドン初演10作を上演。テーマは「WE MOVE」。\n\n8月21日の開幕作は、フランスの振付家メディ・ケルクーシュによる大規模ダンス作品『360』(ウーリッジ中心部の円形特設ステージ)。8月22・23日にはグリニッジ・パークで家族向けの「Greenwich Fair」が開かれる。",
    startDate: utc(2026, 8, 21),
    endDate: utc(2026, 9, 6),
    category: "アート・パフォーマンス",
    venue: "ウーリッジ、グリニッジ・パーク、テムズミードほか屋外各所",
    area: "グリニッジ/ニューアム/テムズミード",
    nearestStation: "Woolwich駅(エリザベス線)、Cutty Sark駅(DLR)ほか",
    priceInfo: "原則無料(一部の公演のみ収容人数の都合でチケット制、無料枠あり)",
    isFree: true,
    bookingRequired: false,
    highlights: [
      "**ほぼ全ての公演が無料**。旅行中の予算を気にせず本格的な舞台芸術に触れられる",
      "屋外開催なので言語に依存しないダンス・サーカス・大型人形劇が中心。英語力を問わない",
      "8月22・23日のGreenwich Fairは子供連れ向けの無料プログラムが充実",
      "世界初演3作を含む、他では観られない演目が並ぶ",
    ],
    tips: "会場が広範囲に散らばるため、公式サイトで日付と場所を確認してから動くこと。グリニッジ天文台やカティ・サーク観光と同じ日にまとめると効率が良い。",
    website: "https://festival.org/gdif-2026/",
    displayOrder: 10,
  },
  {
    matchTitle: "Notting Hill Carnival（ノッティングヒル・カーニバル）",
    title: "Notting Hill Carnival（ノッティングヒル・カーニバル）",
    description:
      "**ヨーロッパ最大級のカリビアン・ストリートカーニバル**。1966年に西インド諸島系移民のコミュニティ行事として始まり、現在は200万人規模が訪れるロンドン最大の路上祭となった。羽根飾りの衣装をまとったパレード、街角に据えられた30以上のサウンドシステム、ジャークチキンやカリー・ゴートの屋台が、ノッティングヒルからラドブローク・グローブ一帯を埋め尽くす。\n\n日程は3日構成。**8月29日(土)** は前夜祭にあたるスチールバンド全国大会「Panorama」(エムズリー・ホーニマン公園、有料)。**8月30日(日)** は未明のJ'ouvertとファミリー向けのChildren's Day Parade。**8月31日(月・バンクホリデー)** が本番のAdults' Paradeとなる。",
    startDate: utc(2026, 8, 29),
    endDate: utc(2026, 8, 31),
    category: "伝統行事・カーニバル",
    venue: "ノッティングヒル〜ラドブローク・グローブの公道(Panoramaのみエムズリー・ホーニマン公園)",
    area: "ノッティングヒル/ケンジントン&チェルシー",
    nearestStation: "Westbourne Park駅、Ladbroke Grove駅(Notting Hill Gate駅は当日規制あり)",
    priceInfo: "パレード・サウンドシステムは無料。Panoramaのみ有料(大人£22程度〜)",
    isFree: true,
    bookingRequired: false,
    highlights: [
      "**パレードもサウンドシステムも入場無料**。ロンドン最大の祭りを予算ゼロで体験できる",
      "8月30日(日)のChildren's Dayは人出が比較的穏やかで、子供連れや初参加者向け",
      "8月31日(月)のAdults' Paradeが最も規模が大きく熱気がある本番",
      "30以上のサウンドシステムごとにソカ、レゲエ、ダブなど音楽の色が違い、歩くだけで音が変わる",
    ],
    tips: "当日はNotting Hill Gate駅が出口専用や閉鎖になることがあり、Westbourne Park駅かLadbroke Grove駅の利用が推奨される。周辺の店舗やトイレは早い時間から行列するため、飲み物は持参を。人混みは相当なもので、貴重品は体の前で管理すること。",
    website: "https://nhcarnival.org/",
    displayOrder: 11,
  },
  {
    title: "Tracey Emin（トレイシー・エミン回顧展 / テート・モダン）",
    description:
      "**英国現代美術を代表するトレイシー・エミンの、過去最大規模となる回顧展**。2月27日に始まり、**8月31日で会期終了**となるため、8月がラストチャンスとなる。\n\n自身のベッドをそのまま提示した『My Bed』でターナー賞候補となり、露悪的とも評された作風で知られるが、近年は大病を経て描かれた絵画作品で再評価が進んでいる。ネオン、ドローイング、刺繍、彫刻まで、40年近い活動を通してたどる構成。",
    startDate: utc(2026, 2, 27),
    endDate: utc(2026, 8, 31),
    category: "アート・展覧会",
    venue: "Tate Modern",
    area: "サウスバンク/バンクサイド",
    nearestStation: "Southwark駅、Blackfriars駅(徒歩約10分)",
    priceInfo: "特別展のため有料(テート・モダンの常設展示は無料)",
    isFree: false,
    bookingRequired: true,
    highlights: [
      "**8月31日で閉幕**。2026年夏の滞在なら見逃せないタイミング",
      "テート・モダン史上最大規模のエミン回顧展",
      "常設コレクションは無料なので、特別展と合わせて半日過ごせる",
      "ミレニアム・ブリッジでセント・ポール大聖堂側と徒歩で行き来できる立地",
    ],
    tips: "会期末は混雑するため、オンラインで時間指定のチケットを事前確保するのが確実。作品の性質上、性的な主題を扱うものが含まれる。",
    website: "https://www.tate.org.uk/visit/tate-modern",
    displayOrder: 12,
  },
  {
    title: "Zurbarán（スルバラン展 / ナショナル・ギャラリー）",
    description:
      "**スペイン黄金時代の画家フランシスコ・デ・スルバラン(1598-1664)の、英国初となる本格的な個展**。5月2日から**8月23日まで**の会期で、8月に閉幕する。\n\n漆黒の背景から白い修道服が浮かび上がる静謐な宗教画と、器物を等間隔に並べた静物画で知られ、「スペインのカラヴァッジョ」とも評される。派手さはないが、光と質感の描写を間近で見る体験としては屈指の展覧会。",
    startDate: utc(2026, 5, 2),
    endDate: utc(2026, 8, 23),
    category: "アート・展覧会",
    venue: "The National Gallery",
    area: "トラファルガー広場",
    nearestStation: "Charing Cross駅、Leicester Square駅(徒歩約5分)",
    priceInfo: "特別展のため有料(ナショナル・ギャラリーの常設展示は無料)",
    isFree: false,
    bookingRequired: true,
    highlights: [
      "**8月23日で閉幕**。英国では初の本格的スルバラン個展",
      "常設展は無料。ゴッホ『ひまわり』やフェルメールと同じ建物で観られる",
      "トラファルガー広場に面し、他の観光との動線に組み込みやすい",
      "静物画の質感描写は複製では伝わりにくく、実物を見る価値が高い",
    ],
    tips: "会期末の8月は混雑が想定されるため事前予約を。ナショナル・ギャラリーは金曜が21時まで開館しており、夕方以降は比較的空いている。",
    website: "https://www.nationalgallery.org.uk/",
    displayOrder: 13,
  },
];

/** description末尾の「開催日：」「開催期間：」行を削除する */
function stripDateLine(description: string): string {
  return description
    .replace(/\n?開催(?:日|期間)[:：][^\n]*/g, "")
    .trim();
}

async function main() {
  // --- 1. 重複行の削除 ---
  const deleted = await db.event.deleteMany({
    where: { title: { in: DUPLICATE_TITLES_TO_DELETE } },
  });
  console.log(`deleted duplicates: ${deleted.count}`);

  // --- 2. 全イベントのdescriptionから冗長な日付行を削除 ---
  const all = await db.event.findMany();
  let stripped = 0;
  for (const e of all) {
    const next = stripDateLine(e.description);
    if (next !== e.description) {
      await db.event.update({ where: { id: e.id }, data: { description: next } });
      stripped++;
    }
  }
  console.log(`stripped date lines: ${stripped}`);

  // --- 3. 8月イベントの登録・更新 ---
  let created = 0;
  let updated = 0;
  for (const seed of AUGUST_EVENTS) {
    const { matchTitle, ...data } = seed;
    const existing = matchTitle
      ? await db.event.findFirst({ where: { title: matchTitle } })
      : null;

    if (existing) {
      await db.event.update({ where: { id: existing.id }, data });
      updated++;
      console.log(`  updated: ${data.title}`);
    } else {
      await db.event.create({ data });
      created++;
      console.log(`  created: ${data.title}`);
    }
  }
  console.log(`\ncreated: ${created}, updated: ${updated}`);
}

main().finally(() => db.$disconnect());

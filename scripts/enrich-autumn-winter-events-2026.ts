/**
 * 2026年秋〜冬のイベント23件に実用情報を足す。
 *
 *   npx tsx scripts/enrich-autumn-winter-events-2026.ts              # ドライラン
 *   npx tsx scripts/enrich-autumn-winter-events-2026.ts --apply      # 投入
 *   npx tsx scripts/enrich-autumn-winter-events-2026.ts --apply --title=Halloween
 *
 * 冪等。指定した項目だけを上書きし、書いていない項目には触らない。
 *
 * ------------------------------------------------------------------
 * なぜ作ったか
 * ------------------------------------------------------------------
 * Event 75件のうち、venue / area / nearestStation / priceInfo / highlights /
 * tips がすべて空の行が62件あった。description は書けているので
 * 「何のイベントか」は分かるが、「どこで、いくらで、予約が要るのか」が
 * どこにも無い状態だった。
 *
 * トップページは fetchUpcomingEvents(3) で直近3件を出すので、
 * これから読者が最初に見るのは秋以降のイベントになる。夏までのものは
 * すでに終わっていて出ない。そこで会期が2026-08-25 以降のものを対象にした。
 *
 * 会期が過去の43件は消さない。1月の元日パレードや4月のイースターは
 * 毎年めぐってくる恒例行事で、/events/calendar が年間の参照表として
 * 使っている。過去の月が並ぶのは仕様であって、古いデータではない。
 *
 * ------------------------------------------------------------------
 * 書き方の基準
 * ------------------------------------------------------------------
 * - highlights は3〜4項目。description と同じことを繰り返さない。
 *   「何が見えるか」ではなく「どう動くか」を優先する。
 * - tips は行動を変える一言。混む時間、無料の見方、予約の要否。
 * - priceInfo は幅で書く。単一の値を書くと改定で嘘になる。
 * - 無料のものは isFree=true にする。表示側が判定に使う。
 * - 日付が動くものは「例年」と書いて逃がす。
 *
 * ------------------------------------------------------------------
 * 裏取り(2026-08-25 時点)
 * ------------------------------------------------------------------
 * - Totally Thames: 9/1〜9/30、20区にまたがり100件以上の催し。無料のものが多い。
 *   https://thamesfestivaltrust.org/artistic-programme/totally-thames/
 * - London Design Festival: 9/12〜9/20、24回目。市内11のデザイン地区。
 *   大半が無料・予約不要で、V&A の展示やランドマーク作品も無料。
 *   https://londondesignfestival.com/
 * - Open House Festival: 9/12〜9/20、35回目。無料。予約制の建物は
 *   8月中旬に予約開始で、人気物件は数分で埋まる。ダウニング街10番地は抽選。
 *   https://open-city.org.uk/open-house-festival
 * - Great River Race: 9/12。ミルウォールからリッチモンドまで約21.6マイル
 *   (約34.7km)。観戦は無料。
 *   https://www.greatriverrace.co.uk/race-overview/
 * - Last Night of the Proms: 9/12、ロイヤル・アルバート・ホール。有料で
 *   入手困難(5公演分の抽選・当日立見など複数の経路がある)。ハイド・パークの
 *   Proms in the Park は別途。
 *   https://www.royalalberthall.com/tickets/proms/bbc-proms-2026/last-night-of-the-proms-2026
 * - London Fashion Week: 9/17〜9/21。業界向けが中心で一般公開は限定的。
 * - BFI London Film Festival: 10/7〜10/18、70回目。250本以上。
 *   会場はBFIサウスバンク、BFI IMAX、ロイヤル・フェスティバル・ホールなど。
 *   チケットは£10前後から。
 *   https://whatson.bfi.org.uk/lff/Online/default.asp
 * - Frieze London & Masters: 10/14〜10/18、リージェンツ・パーク。
 *   一般日は約£70、2会場共通は約£90、割引約£40、13歳未満無料。
 *   公園内の彫刻展示 Frieze Sculpture は無料。
 *   https://www.frieze.com/fairs/frieze-london-frieze-masters/visitor-information
 * - Diwali on the Square: 10/25、トラファルガー広場。入場無料。
 * - Alexandra Palace Fireworks: 10/31〜11/1。有料。
 * - Southbank Centre Winter Market: 11/2〜1/4。入場無料。
 * - Bonfire Night: 11/5。各地の花火大会は有料のものが多い。
 * - Regent Street 点灯式: 11/6。無料。点灯後は1月上旬まで毎日点灯。
 * - Remembrance Sunday: 11/8。ホワイトホールのセノタフ。無料。
 * - Skate at Somerset House: 11/11〜1/10。滑走は£11〜£28.50。
 *   敷地に入るだけなら無料。チケットは9月発売。
 *   https://www.somersethouse.org.uk/skate-times-tickets-faqs
 * - Christmas at Kew: 11/13〜1/3。大人£25.23〜、子ども£20〜、4歳未満無料。
 *   16:20〜22:00の時間指定制で、売り切れる。
 *   https://www.kew.org/kew-gardens/whats-on/christmas
 * - Lord Mayor's Show: 11/14 11:00開始。無料。3マイルの行列に7,000人以上。
 *   夜に花火。
 *   https://www.lordmayorsshow.london/
 * - Hyde Park Winter Wonderland: 2026年は11/19〜1/3(DBの11/21〜1/5は前年の
 *   日程だったので直す)。オフピークは入場無料、通常£5〜、ピーク£7.50〜。
 *   11月の月〜木は£1の枠がある。
 *   https://hydeparkwinterwonderland.com/tickets-guide/
 * - Trafalgar Square 点灯式: 12月第1木曜(2026年は12/3)。無料。18:30頃終了。
 *   ノルウェーから1947年より毎年贈られる樅の木。
 *   https://www.westminster.gov.uk/trafalgar-tree
 * - Christmas Day: 12/25。地下鉄・バス・鉄道が終日運休。店舗もほぼ休業。
 * - Boxing Day: 12/26。セール。交通は減便で動く。
 * - NYE Fireworks: 12/31。有料の観覧エリア制で£20〜£50。
 *   10月頃に第1次発売、11月に追加発売。
 *   https://www.visitlondon.com/things-to-do/event/27002385-london-new-years-eve-fireworks
 */

import "dotenv/config";
import db from "../utils/db";

type Enrich = {
  venue?: string;
  area?: string;
  nearestStation?: string;
  priceInfo?: string;
  isFree?: boolean;
  bookingRequired?: boolean;
  highlights?: string[];
  tips?: string;
  website?: string;
  /** 会期が実際と違っていたときだけ入れる。 */
  startDate?: Date;
  endDate?: Date;
};

/** title の先頭一致で引く。DBの title は「英名（和名）」の形。 */
export const ENRICH: Record<string, Enrich> = {
  "Totally Thames": {
    venue: "テムズ川沿いの各所",
    area: "テムズ川流域（リッチモンド〜バーキング）",
    priceInfo: "多くは無料（一部の催しは有料）",
    isFree: true,
    website: "https://thamesfestivaltrust.org/artistic-programme/totally-thames/",
    highlights: [
      "9月の1か月間、20区にまたがって100件以上の催しが分散して開かれる",
      "干潮の川床を歩くフォアショア・ウォークなど、この時期しかできない体験がある",
      "船上での展示やコンサートなど、川の上に出る企画が組まれる",
    ],
    tips: "会場が川沿い全域に散らばるので、行き当たりばったりでは回れません。公式サイトで日付と場所を絞ってから出かけてください。無料の催しが多い一方、乗船するものは早く埋まります。",
  },
  "London Design Festival": {
    venue: "市内11のデザイン地区（V&A、バンクサイド、ショーディッチほか）",
    area: "ロンドン各所",
    priceInfo: "大半が無料",
    isFree: true,
    bookingRequired: false,
    website: "https://londondesignfestival.com/",
    highlights: [
      "V&A が会期中の拠点になり、館内に大型の委嘱作品が据えられる",
      "広場や街路に置かれるランドマーク作品は無料で予約も要らない",
      "普段は入れないデザイン事務所が開放されるオープンスタジオがある",
    ],
    tips: "プログラムの大半が無料・予約不要なので、地区をひとつ決めて歩くのが向いています。V&A の展示だけなら通常の開館時間に行けば見られます。",
  },
  "Open House Festival": {
    venue: "ロンドン全33区の建物",
    area: "ロンドン全域",
    priceInfo: "無料",
    isFree: true,
    bookingRequired: true,
    website: "https://open-city.org.uk/open-house-festival",
    highlights: [
      "官庁や大使館、個人宅など、普段は入れない建物が無料で開放される",
      "設計者や住人自身が案内に立つ建物があり、図面では分からない話が聞ける",
      "ダウニング街10番地など一部の物件は抽選制",
    ],
    tips: "予約が要る建物は8月中旬に受付が始まり、人気のものは数分で埋まります。当日並べば入れる建物も多いので、予約を取り逃しても諦めないでください。歩く距離が長くなるので靴を選ぶこと。",
  },
  "Great River Race": {
    venue: "テムズ川（ミルウォール〜リッチモンド）",
    area: "テムズ川",
    priceInfo: "観戦は無料",
    isFree: true,
    website: "https://www.greatriverrace.co.uk/",
    highlights: [
      "約34kmを300艇以上の手漕ぎ舟が遡上する",
      "ヴァイキング船から中国のドラゴンボートまで、伝統的な舟が入り混じる",
      "橋の上と川沿いの遊歩道から無料で見られる",
    ],
    tips: "スタートとゴールが大きく離れているので、どこか1か所の橋に陣取るのが現実的です。舟は数時間かけて通過するため、通過時刻を公式サイトで確認してから行ってください。",
  },
  "Last Night of the Proms": {
    venue: "ロイヤル・アルバート・ホール",
    area: "サウス・ケンジントン",
    nearestStation: "South Kensington 徒歩10分",
    priceInfo: "有料（入手困難）",
    bookingRequired: true,
    website: "https://www.royalalberthall.com/tickets/proms/bbc-proms-2026/last-night-of-the-proms-2026",
    highlights: [
      "「ルール・ブリタニア」「威風堂々」を客席全体で歌う最終夜",
      "客が国旗やクラッカーを持ち込み、クラシックの演奏会とは思えない空気になる",
      "ハイド・パークの Proms in the Park など屋外の中継会場が別に立つ",
    ],
    tips: "この夜だけは通常の発売では取れません。5公演分を買った人向けの抽選や当日の立見など複数の経路があります。中継会場のほうが取りやすく、雰囲気は十分味わえます。",
  },
  "London Fashion Week": {
    venue: "市内各所",
    area: "ロンドン各所",
    priceInfo: "業界関係者向け（一般公開は限定的）",
    website: "https://londonfashionweek.co.uk/",
    highlights: [
      "世界4大コレクションの一つで、新人デザイナーの発表の場として知られる",
      "ショー自体は基本的に招待制",
      "一般向けの展示や販売会が併催されることがある",
    ],
    tips: "ショーを見に行くイベントではありません。会場周辺に人が集まるので、その時期にソーホーやメイフェアを歩くと街の空気が変わっているのが分かる、という楽しみ方になります。",
  },
  "BFI London Film Festival": {
    venue: "BFIサウスバンク、BFI IMAX、ロイヤル・フェスティバル・ホールほか",
    area: "サウスバンク",
    nearestStation: "Waterloo 徒歩5分",
    priceInfo: "£10前後〜",
    bookingRequired: true,
    website: "https://whatson.bfi.org.uk/lff/Online/default.asp",
    highlights: [
      "2026年は第70回。250本以上が上映される",
      "監督や俳優が登壇するQ&A付きの回がある",
      "英語字幕なしの外国語作品も多く、英語が母語でなくても入りやすい回がある",
    ],
    tips: "話題作は発売直後に売り切れます。会員先行があるので一般発売日には残っていないことも。当日券の列に並ぶと入れる回があるので、諦めずに会場へ行く価値はあります。",
  },
  "Frieze London": {
    venue: "リージェンツ・パーク（特設テント）",
    area: "リージェンツ・パーク",
    nearestStation: "Regent's Park 徒歩10分",
    priceInfo: "一般日 £70前後（2会場共通£90前後、割引£40前後、13歳未満無料）",
    bookingRequired: true,
    website: "https://www.frieze.com/fairs/frieze-london-frieze-masters/visitor-information",
    highlights: [
      "48か国から約300のギャラリーが出展する見本市で、美術館ではなく商談の場",
      "公園内の彫刻展示 Frieze Sculpture は入場無料で誰でも見られる",
      "会期中はメイフェアのギャラリーが揃って企画展を打つ",
    ],
    tips: "入場料が高いので、まず無料の Frieze Sculpture だけ見るという選択があります。会場内は商談が優先で、値札は基本的に出ていません。閉場間際は搬出が始まるため早めに。",
  },
  "Diwali on the Square": {
    venue: "トラファルガー広場",
    area: "ウェストミンスター",
    nearestStation: "Charing Cross 徒歩3分",
    priceInfo: "無料",
    isFree: true,
    bookingRequired: false,
    website: "https://www.london.gov.uk/events/diwali-square",
    highlights: [
      "インド古典舞踊やライブのステージが一日中続く",
      "菜食の屋台が並び、行列は昼過ぎに最も伸びる",
      "ランゴーリー（色粉の床絵）作りなど参加できる催しがある",
    ],
    tips: "入場無料で予約も要りませんが、広場は昼過ぎから混みます。ステージ前で見たいなら午前中に。食べ物の屋台は現金のみのことがあります。",
  },
  "Alexandra Palace Fireworks Festival": {
    venue: "アレクサンドラ・パレス",
    area: "北ロンドン",
    nearestStation: "Alexandra Palace 徒歩15分",
    priceInfo: "有料（事前購入が安い）",
    bookingRequired: true,
    website: "https://www.alexandrapalace.com/whats-on/fireworks-festival/",
    highlights: [
      "丘の上から打ち上げるため、ロンドン中心部の夜景を背景に見える",
      "花火に加えてドローンショーが組まれる",
      "ドイツ式のビアホールと移動遊園地が併設される",
    ],
    tips: "当日券より事前購入が安く済みます。丘を登るので歩きやすい靴が要ります。終演後は駅が非常に混むので、時間をずらすか一駅歩くのが楽です。",
  },
  Halloween: {
    venue: "市内各所",
    area: "ロンドン各所",
    priceInfo: "催しによる",
    highlights: [
      "ロンドン・ダンジョンなどの観光施設が特別演出を出す",
      "パブとクラブは仮装前提の催しが増える",
      "住宅街のトリック・オア・トリートは地区差が大きい",
    ],
    tips: "英国のハロウィンは日本より子ども向けの色が濃く、渋谷のような路上の集まりはありません。大人向けの催しはチケット制が基本なので、当日ふらりと参加できるものは多くありません。",
  },
  "Southbank Centre Winter Market": {
    venue: "サウスバンク・センター（テムズ河畔）",
    area: "サウスバンク",
    nearestStation: "Waterloo 徒歩5分",
    priceInfo: "入場無料",
    isFree: true,
    bookingRequired: false,
    website: "https://www.southbankcentre.co.uk/whats-on/festivals-series/winter-market",
    highlights: [
      "ロンドン・アイとビッグ・ベンを望む川沿いに木造の屋台が並ぶ",
      "入場無料で、通り抜けるだけでも成立する",
      "屋内のサウスバンク・センターに逃げ込めるので雨でも動ける",
    ],
    tips: "入場無料のクリスマスマーケットとしては最も立地がよく、川沿いを歩く経路にそのまま組み込めます。夕方以降は人が増えるので、写真を撮るなら日没直後が空いています。",
  },
  "Guy Fawkes Night": {
    venue: "市内各所の公園",
    area: "ロンドン各所",
    priceInfo: "会場による（有料の大会が多い）",
    bookingRequired: true,
    highlights: [
      "1605年の火薬陰謀事件に由来し、たき火と花火で祝う",
      "バタシー・パークやアレクサンドラ・パレスなど大規模会場は有料",
      "前後の週末に分散して開催されるので11/5当日でなくても見られる",
    ],
    tips: "主要な花火大会は事前購入制で、当日券が出ないこともあります。無料で見られる小規模な催しもありますが、混雑と寒さは相応です。厚着で行ってください。",
  },
  "Regent Street Christmas Lights": {
    venue: "リージェント・ストリート",
    area: "ウェストエンド",
    nearestStation: "Oxford Circus 徒歩1分",
    priceInfo: "無料",
    isFree: true,
    bookingRequired: false,
    highlights: [
      "点灯式の日は通りが歩行者天国になる",
      "点灯後は翌年1月上旬まで毎晩点灯するので、式に行けなくても見られる",
      "天使をかたどった装飾が通りの全長にわたって並ぶ",
    ],
    tips: "点灯式当日は身動きが取れないほど混みます。イルミネーション自体は1月上旬まで毎晩点いているので、式を外して平日の夜に行くほうが落ち着いて見られます。",
  },
  "Remembrance Sunday": {
    venue: "ホワイトホール（セノタフ）",
    area: "ウェストミンスター",
    nearestStation: "Westminster 徒歩5分",
    priceInfo: "無料",
    isFree: true,
    highlights: [
      "国王臨席のもと11時に2分間の黙祷が捧げられる",
      "退役軍人の行進が式典後に続く",
      "赤いポピーを身につける習慣が街全体に見られる",
    ],
    tips: "式典は追悼の場であって観光の催しではありません。見学する場合は静かに振る舞ってください。ホワイトホール周辺は早朝から交通規制が入り、沿道の場所取りは7時台から始まります。",
  },
  "Skate at Somerset House": {
    venue: "サマセット・ハウス中庭",
    area: "ストランド",
    nearestStation: "Temple 徒歩5分",
    priceInfo: "滑走 £11〜£28.50（見学のみは無料）",
    bookingRequired: true,
    website: "https://www.somersethouse.org.uk/skate-times-tickets-faqs",
    highlights: [
      "18世紀の新古典様式の中庭にリンクが張られる",
      "夜はライトアップされ、昼とはまったく違う場所になる",
      "滑らずに敷地へ入って眺めるだけなら無料",
    ],
    tips: "チケットは9月に発売され、週末の夜から埋まります。滑らないなら予約なしで中庭に入れるので、コートールド・ギャラリーとあわせて寄るのが効率的です。",
  },
  "Christmas at Kew": {
    venue: "キュー王立植物園",
    area: "キュー",
    nearestStation: "Kew Gardens 徒歩5分",
    priceInfo: "大人 £25.23〜 / 子ども £20〜（4歳未満無料）",
    bookingRequired: true,
    website: "https://www.kew.org/kew-gardens/whats-on/christmas",
    highlights: [
      "約1.5マイルの光のトレイルを歩いて回る",
      "温室と巨木が照らされ、昼間の植物園とは別の見え方になる",
      "16:20以降の時間指定制で、日中の入園とは別のチケット",
    ],
    tips: "毎年売り切れるので、行くと決めたら早く押さえてください。屋外を1時間以上歩くうえ11月以降のロンドンの夜は冷えます。日中の植物園とは別料金である点に注意。",
  },
  "The Lord Mayor's Show": {
    venue: "シティ（マンション・ハウス〜王立裁判所）",
    area: "シティ・オブ・ロンドン",
    nearestStation: "St Paul's 徒歩5分",
    priceInfo: "無料",
    isFree: true,
    bookingRequired: false,
    website: "https://www.lordmayorsshow.london/",
    highlights: [
      "800年以上続く行列で、11:00に始まる",
      "3マイルの経路を7,000人以上が馬車と山車で進む",
      "夕方にテムズ川で花火が上がる",
    ],
    tips: "沿道はどこでも無料で見られますが、良い位置は9時台から埋まります。行列は同じ経路を往復するので、一度見逃しても戻りを待てます。11月中旬の朝は冷えます。",
  },
  "Hyde Park Winter Wonderland": {
    venue: "ハイド・パーク",
    area: "ハイド・パーク",
    nearestStation: "Hyde Park Corner 徒歩5分",
    priceInfo: "オフピーク無料 / 通常 £5〜 / ピーク £7.50〜（アトラクションは別料金）",
    bookingRequired: true,
    website: "https://hydeparkwinterwonderland.com/tickets-guide/",
    // DBの会期は前年の日程だった。2026年は11/19〜1/3。
    startDate: new Date("2026-11-19T00:00:00.000Z"),
    endDate: new Date("2027-01-03T00:00:00.000Z"),
    highlights: [
      "入場券と乗り物代が別で、園内で使う額のほうが大きくなりやすい",
      "11月の月〜木には£1の入場枠が出ることがある",
      "観覧車とスケートリンク、屋内のビアホールが主要な集客装置",
    ],
    tips: "12月の週末夕方が最も混み、入場制限がかかります。11月中の平日に行けば同じ内容をはるかに空いた状態で回れます。入場は事前予約制なので当日券をあてにしないこと。",
  },
  "Trafalgar Square Christmas Tree": {
    venue: "トラファルガー広場",
    area: "ウェストミンスター",
    nearestStation: "Charing Cross 徒歩3分",
    priceInfo: "無料",
    isFree: true,
    bookingRequired: false,
    website: "https://www.westminster.gov.uk/trafalgar-tree",
    highlights: [
      "1947年から毎年ノルウェーが贈り続けている樅の木",
      "第二次世界大戦中の英国の支援に対する感謝として続く行事",
      "点灯式では聖歌隊と軍楽隊の演奏がある",
    ],
    tips: "点灯式は12月第1木曜の夕方で、18:30頃に終わります。式に間に合わなくてもツリーは年明けまで立っているので、混雑を避けるなら後日に。周囲でキャロルが歌われる夜があります。",
  },
  "Christmas Day": {
    venue: "市内全域",
    area: "ロンドン全域",
    priceInfo: "—",
    highlights: [
      "地下鉄・バス・鉄道が終日運休する。1年でこの日だけ",
      "商店・スーパー・多くの観光施設が休業する",
      "教会の礼拝は一般でも参列できるものがある",
    ],
    tips: "この日にロンドンにいるなら、移動できない前提で計画してください。空港へ行く手段も限られ、タクシーは割増しかつ捕まりません。食事は前日までに用意するか、開いているホテルのレストランを予約しておくこと。",
  },
  "Boxing Day": {
    venue: "オックスフォード・ストリート、リージェント・ストリートほか",
    area: "ウェストエンド",
    nearestStation: "Oxford Circus 徒歩1分",
    priceInfo: "—",
    highlights: [
      "英国最大のセールが始まり、主要店は早朝から開ける",
      "人気店は開店前から行列ができる",
      "交通は前日と違って動くが、減便される",
    ],
    tips: "クリスマス当日とは違い交通は動きますが本数は減ります。オンラインで同じ値引きが出ることも多いので、行列に並ぶ価値があるかは事前に確かめてください。",
  },
  "New Year's Eve Fireworks": {
    venue: "テムズ河畔（ロンドン・アイ周辺）",
    area: "サウスバンク",
    nearestStation: "Waterloo 徒歩10分",
    priceInfo: "£20〜£50（観覧エリアは事前予約制）",
    bookingRequired: true,
    website: "https://www.visitlondon.com/things-to-do/event/27002385-london-new-years-eve-fireworks",
    highlights: [
      "ロンドン・アイ周辺から1万発以上が上がる",
      "ビッグ・ベンの鐘とともに新年を迎える",
      "観覧エリアは有料で、無料で見られる場所は年々狭まっている",
    ],
    tips: "チケットは10月頃に発売され、短期間で売り切れます。取れなかった場合、テレビ中継で見るか、プリムローズ・ヒルなど離れた高台から遠望する選択になります。終演後の地下鉄は数時間混み続けます。",
  },
};

const APPLY = process.argv.includes("--apply");
const TITLE_ARG = process.argv.find((a) => a.startsWith("--title="));

async function main() {
  const keys = TITLE_ARG ? [TITLE_ARG.split("=")[1]] : Object.keys(ENRICH);

  console.log(APPLY ? "== 投入 ==\n" : "== ドライラン(--apply で投入) ==\n");

  let updated = 0;
  let notFound = 0;

  for (const key of keys) {
    // title は「英名（和名）」の形なので前方一致で引く。
    const ev = await db.event.findFirst({ where: { title: { startsWith: key } } });
    if (!ev) {
      console.error(`✗ ${key}: 見つかりません`);
      notFound++;
      process.exitCode = 1;
      continue;
    }

    const next = ENRICH[key];
    const changes: string[] = [];
    for (const [k, v] of Object.entries(next)) {
      const before = (ev as Record<string, unknown>)[k];
      if (Array.isArray(v)) {
        const b = before as string[];
        if (b.length === v.length && b.every((x, i) => x === v[i])) continue;
        changes.push(`    ${k}: ${b.length}件 → ${v.length}件`);
      } else if (v instanceof Date) {
        if ((before as Date)?.getTime() === v.getTime()) continue;
        changes.push(
          `    ${k}: ${(before as Date)?.toISOString().slice(0, 10)} → ${v.toISOString().slice(0, 10)}  ★会期の訂正`,
        );
      } else {
        if (before === v) continue;
        const b = before === null || before === "" ? "(空)" : String(before);
        changes.push(`    ${k}: ${b} → ${String(v)}`);
      }
    }

    if (changes.length === 0) {
      console.log(`${ev.title}\n    変更なし\n`);
      continue;
    }

    console.log(ev.title);
    changes.forEach((c) => console.log(c));
    updated++;

    if (APPLY) {
      await db.event.update({ where: { id: ev.id }, data: next });
      console.log("    → 更新");
    }
    console.log("");
  }

  console.log(`対象 ${keys.length}件 / 更新 ${updated}件 / 見つからず ${notFound}件`);
  if (!APPLY) console.log("\n--apply を付けると投入します。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

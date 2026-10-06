import {
  EUROSTAR,
  EUROSTAR_AS_OF,
  EUROSTAR_SOURCES,
  EUROSTAR_UPDATED_AT,
  EU_BORDER,
  PARIS,
  eur,
  hoursMinutes,
} from "@/lib/beyond-london/eurostar";
import { gbp, jpDate } from "@/lib/beyond-london/rates";
import { VISA_FEES, VISA_SOURCES } from "@/lib/visa/rates";
import type { DestinationArticle } from "../types";

/**
 * パリ。このセクションで唯一、国境を越える行き先。
 *
 * パリの観光案内にはしない。書くのは「ロンドンからどう行って、
 * どう帰ってくるか」——予約、セント・パンクラスの手続き、EU の入国審査、
 * パリに何時間いられるか——だけで、見どころは日帰りで予約が要る3つに絞る。
 * 増やしたくなったら、それはこのセクションの記事ではない。
 *
 * 金額・時刻・制度の日付は lib/beyond-london/eurostar.ts から引く。
 * 時刻は曜日と時期で変わるので、必ず「◯月◯日のダイヤの例」として書く。
 */

const C = EUROSTAR.checkIn;
const T = EUROSTAR.sampleTimetable;
const EES = EU_BORDER.ees;
const ETIAS = EU_BORDER.etias;
const STD = EUROSTAR.classes.standard;
const PREMIER = EUROSTAR.classes.premier;
const sampleDay = jpDate(T.date);

/** 往復の早期と直前。片道の帯を2倍にして見せる。 */
const RETURN_EARLY = EUROSTAR.standardFrom * 2;
/** 日帰りでメトロに乗る回数の目安(北駅との往復を含む)。 */
const METRO_RIDES = 5;

const paris: DestinationArticle = {
  kind: "destination",
  slug: "paris",
  tier: "weekender",
  title: "ユーロスターで行くパリ｜予約・セント・パンクラスの手続き・日帰りの行程",
  engTitle: "Paris by Eurostar from London",
  county: "フランス",
  country: "FR",
  summary: `ロンドンから片道約2時間20分。日帰りは成立しますが、駅での手続きに往復で2時間半ほどかかり、${jpDate(
    EES.fullFrom
  )}からはEUの新しい入国審査（EES）で初回に指紋と顔写真を登録します。予約、セント・パンクラスでの手続き、帰りの審査、パリに何時間いられるかまで、ロンドン発の実務だけを${EUROSTAR_AS_OF}時点の公式情報でまとめます。`,
  description:
    "ロンドンからユーロスターでパリへ行く実務ガイド。予約の時期と3クラスの違い、セント・パンクラスに何分前に着くか、EUの入国審査EES（指紋・顔写真の登録）とETIASの現状、帰りの審査をパリで済ませる仕組み、日帰りでパリに何時間いられるか、メトロの切符まで。",
  keywords: [
    "ユーロスター 予約",
    "ユーロスター 乗り方",
    "ロンドン パリ 移動",
    "ロンドン パリ 日帰り",
    "セントパンクラス ユーロスター",
    "ユーロスター 何分前",
    "EES 入国審査",
    "ETIAS",
  ],
  dataAsOf: EUROSTAR_AS_OF,
  updatedAt: EUROSTAR_UPDATED_AT,
  verdict: {
    stayLength:
      "日帰りならパリに9〜10時間。予約した美術館1つと街歩きで埋まります。入りたい場所が2つ以上あるなら1泊",
    watchOut: `改札は出発の${C.stPancras.standardCloses}分前に閉まり、過ぎると乗れません。初めてのEES登録は審査に時間がかかるので、公式の目安（${C.stPancras.standardArrive}分前）より早めに着いてください`,
    suitedTo:
      "ロンドン滞在の1日を、別の国の首都に使いたい人。パリを腰を据えて見たい人には、日帰りは短すぎます",
  },
  gettingThere: {
    fromStation: "セント・パンクラス・インターナショナル（キングス・クロス駅の向かい）",
    operator:
      "Eurostar（ユーロスター）。ロンドンとパリを結ぶ直通列車は、いまはユーロスターだけです",
    journeyTime: `多くの列車が${hoursMinutes(
      EUROSTAR.usualMinutes
    )}、遅い便で${hoursMinutes(
      EUROSTAR.slowestMinutes
    )}。パリは${PARIS.timeDifferenceHours}時間進んでいるので、時計の上では3時間20〜30分かかって見えます`,
    frequency: `1時間に1本前後。平日のロンドン発は1日${T.trainsFromLondon}本ほどです（${sampleDay}の例）`,
    fareGuide: `Standard の最安は片道${gbp(
      EUROSTAR.standardFrom
    )}から。これは往復で買ったときの片道分で、片道だけだと${
      EUROSTAR.standardFromOneWayOnly
    }からです。安い席から売れていくので、直前には片道${
      EUROSTAR.lastMinuteBand
    }になることが珍しくありません`,
    oysterValid: false,
    oysterNote:
      "ユーロスターは国際列車で、Oyster やタッチ決済では乗れません。事前に予約して、QRコードのeチケットで改札を通ります。セント・パンクラスまでの地下鉄は、いつもどおり Oyster・タッチ決済で行けます。**パリのメトロも、ロンドンとは別の切符です**（下の「パリのメトロは別の切符」）。",
    bookingAdvice: `発売は${EUROSTAR.bookingOpensMonths}。安い席から売り切れるので、日程が決まったらその日に買ってください。公式サイト（eurostar.com）かアプリで買えば手数料はかかりません。`,
    ticketGuideLink: { href: "#booking", label: "ユーロスターの予約と3つのクラス" },
  },
  onArrival: {
    fromStationToCentre:
      "パリ北駅（Gare du Nord）に着きます。入国審査はロンドンで済んでいるので、**降りたらそのまま駅の外**です。中心部へはメトロ4号線で、シテ島（ノートルダム）まで15分ほど。北駅の周りはスリが多いので、着いた直後に地図を見ながら立ち止まらないでください。",
    halfDay:
      "シテ島のノートルダム大聖堂から、セーヌ沿いにルーヴルまで歩く。中に入らなければ半日で収まります。",
    fullDay:
      "予約した美術館を1つ（ルーヴルなら2〜3時間）と、ノートルダム・エッフェル塔を外から。2つ目の美術館を入れると、帰りの列車に追われます。",
  },
  stayAndNight: {
    whereToStay:
      "帰りの列車に合わせるなら、**北駅からメトロ4号線1本で戻れる場所**が楽です。レ・アール、サン＝ミシェル、サン＝ジェルマン＝デ＝プレは4号線沿いで、どこも中心部を歩いて回れます。北駅のすぐ周りは安いものの、夜は雰囲気のよくない一角があります。",
    priceBand:
      "中心部の3つ星で1泊€150〜250程度が目安です。春から秋と大きな見本市の時期は上がります。",
    atNight:
      "夏は22時近くまで明るく、セーヌ沿いを歩くだけで夜が埋まります。日没後のエッフェル塔は毎正時に数分間きらめくので、見るなら時刻を合わせて。**日帰りでは見られない時間帯**で、1泊する理由のひとつです。",
    gettingBack: `パリ北駅には、Standard なら出発の${C.gareDuNord.standardArrive}分前に着くよう公式が案内しています。ロンドン側より長い目安です。昼過ぎの便なら夕方にロンドンへ着きます。**日曜の夕方の便は混むぶん高くなりがち**なので、帰りも早めに取ってください。`,
    levyNote: `**パリにも宿泊税があります**。2026年1月から、3つ星で1泊・大人1人${eur(
      PARIS.touristTax.threeStar
    )}、4つ星で${eur(
      PARIS.touristTax.fourStar
    )}です。2人で2泊すると、3つ星でも${eur(
      PARIS.touristTax.threeStar * 4
    )}の上乗せになります。宿の料金とは別に、現地で請求されることがあります。`,
  },
  highlights: [
    {
      name: "ルーヴル美術館",
      engName: "Musée du Louvre",
      body: "世界最大級の美術館で、全部を見るつもりで入ると1日でも足りません。日帰りなら見る作品を先に決めて、時間枠を予約して入ります。",
      admission: `**日本・英国の国籍や居住者は${eur(
        PARIS.admissions.louvre.nonEea
      )}**（2026年1月14日から。EEAの人は${eur(
        PARIS.admissions.louvre.eea
      )}）。${PARIS.admissions.louvre.closedDay}休館。時間枠の予約が推奨されています`,
      mapQuery: "Musée du Louvre",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/1280px-Louvre_Museum_Wikimedia_Commons.jpg",
      imageSource: "commons",
      imageCredit: "Benh LIEU SONG (CC BY-SA 3.0)",
      imageLink:
        "https://commons.wikimedia.org/wiki/File:Louvre_Museum_Wikimedia_Commons.jpg",
    },
    {
      name: "ノートルダム大聖堂",
      engName: "Cathédrale Notre-Dame de Paris",
      body: "2019年の火災から5年をかけて修復され、2024年12月に再開しました。北駅からメトロ4号線1本で、シテ島の駅を出てすぐです。",
      admission:
        "無料。時間枠の予約（無料）が2日前から当日まで取れて、予約すると並ぶ時間が短くなります",
      mapQuery: "Cathédrale Notre-Dame de Paris",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/West_facade_of_Notre-Dame_de_Paris_in_2025_-_003.jpg/1280px-West_facade_of_Notre-Dame_de_Paris_in_2025_-_003.jpg",
      imageSource: "commons",
      imageCredit: "Wyslijp16 (CC BY 4.0)",
      imageLink:
        "https://commons.wikimedia.org/wiki/File:West_facade_of_Notre-Dame_de_Paris_in_2025_-_003.jpg",
    },
    {
      name: "エッフェル塔",
      engName: "Tour Eiffel",
      body: "外から見るだけなら予約は要りません。上るなら、公式サイトで日時指定の券を先に取ります。頂上まで行くと、待ち時間を含めて2〜3時間は見てください。",
      admission: `大人はエレベーターで頂上まで${eur(
        PARIS.admissions.eiffelTower.summitByLift
      )}、2階まで${eur(
        PARIS.admissions.eiffelTower.secondFloorByLift
      )}。公式サイト（toureiffel.paris）以外で買うと上乗せされます`,
      mapQuery: "Tour Eiffel",
      image:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/1280px-Tour_Eiffel_Wikimedia_Commons.jpg",
      imageSource: "commons",
      imageCredit: "Benh LIEU SONG (Public domain)",
      imageLink:
        "https://commons.wikimedia.org/wiki/File:Tour_Eiffel_Wikimedia_Commons.jpg",
    },
  ],
  mainText: `このセクションで唯一、国境を越える行き先です。

ロンドンからパリまで、ユーロスターで約2時間20分。朝の便で出て最終で戻れば、パリに9〜10時間いられます。日帰りは**成立します**。

ただし、飛行機ほどではないにしても手続きがあります。セント・パンクラスで保安検査と出入国の審査を受け、改札は**出発の${C.stPancras.standardCloses}分前に閉まります**。帰りは同じことをパリ北駅で繰り返します。${jpDate(
    EES.fullFrom
  )}からはEUの新しい入国審査（EES）が全面運用になり、初めての人は指紋と顔写真を登録します。

この記事はパリの観光案内ではありません。書くのは、**ロンドンからどう行って、どう帰ってくるか**です。予約、駅での手続き、入国審査、パリに何時間いられるかを、${EUROSTAR_AS_OF}時点の公式情報でまとめます。見どころは、日帰りで予約が要る3つだけに絞っています。`,
  sections: [
    {
      id: "booking",
      navLabel: "予約とクラス",
      title: "予約：いつ、どこで、どのクラスで",
      body: `**発売は${EUROSTAR.bookingOpensMonths}です**。運賃は航空券と同じ変動制で、安い席から売れていきます。英国の鉄道の Advance のような券種の区別はなく、同じ列車でも買う時期で値段が変わると考えてください。

| | |
|---|---|
| **最安** | Standard で片道${gbp(EUROSTAR.standardFrom)}から（往復で買ったときの片道分。片道だけなら${EUROSTAR.standardFromOneWayOnly}から） |
| **直前・当日** | 片道${EUROSTAR.lastMinuteBand}になることが珍しくない |
| **買う場所** | 公式サイト eurostar.com かアプリ。手数料はかかりません |
| **切符** | eチケット（QRコード）。印刷するか、アプリに入れる |

**3つのクラス**

| | Standard | Plus | Premier |
|---|---|---|---|
| **変更** | ${STD.exchange} | Standard と同じ | ${PREMIER.exchange} |
| **払い戻し** | ${STD.refund} | Standard と同じ | ${PREMIER.refund} |
| **荷物** | ${STD.luggage} | ${EUROSTAR.classes.plus.luggage} | ${PREMIER.luggage} |
| **食事** | ${STD.meal} | ${EUROSTAR.classes.plus.meal} | ${PREMIER.meal} |

日帰りなら**Standard で十分**です。Plus との差は席の広さと軽食で、変更と払い戻しの条件は同じです。Premier は改札の締切が${C.stPancras.premierCloses}分前と遅く、変更も自由ですが、値段は別物になります。

覚えておく価値があるのは、**Standard でも出発1時間前までなら変更の手数料がかからない**ことです。差額は払いますが、帰りの列車を早めたくなったらアプリから変えられます（安い列車に変えても、差額は戻りません）。`,
      tips: [
        `Eurostar Snap は、直前に「午前か午後か」だけを選んで安く買う券。列車は${EUROSTAR.snap.trainAssignedHoursBefore}時間前までに決まって知らされ、変更も払い戻しもできない。帰りの時刻を選べないので、日帰りには向かない`,
        `ディズニーランド・パリへの直通は${EUROSTAR.disneylandDirectEnded}に廃止された。パリ市内からRERで向かう`,
        "ブリュッセル・アムステルダムへもセント・パンクラスから直通がある。駅での手続きはパリ行きと同じ",
      ],
    },
    {
      id: "st-pancras",
      navLabel: "セント・パンクラスで",
      title: "セント・パンクラスに何分前に着くか",
      body: `**公式の目安は出発の${C.stPancras.standardArrive}分前**です（Premier は${C.stPancras.premierArrive}分前）。改札は${C.stPancras.standardCloses}分前に閉まり、過ぎると乗れません。ホームに列車が止まっていても、です。

着いてからの順番は次のとおりです。

1. **改札**：eチケットのQRコードをかざす
2. **保安検査**：荷物をX線に通す。飛行機と違い、液体の量の制限はない
3. **英国側の確認**：係員がパスポートを読み取る
4. **フランスの入国審査**：ここでEESの登録をする（次の節）
5. 出発ロビーで待ち、案内が出たらホームへ

フランスの入国審査がロンドン側にあるのは、英仏が互いの駅に審査官を置き合っているからです。そのため、**パリに着いたら降りてそのまま街に出られます**。

公式の${C.stPancras.standardArrive}分は最低線と考えてください。金曜の夕方、学校の休み、週末の朝は列が延びます。EESの登録が初めてなら、さらに余裕を見るのが安全です。`,
      tips: [
        "セント・パンクラスはキングス・クロス駅の向かい。地下鉄の駅名は King's Cross St Pancras",
        `荷物は1辺${EUROSTAR.luggageMaxCm}cmまで。Standard と Plus は大きいもの2個と小さい手荷物1個`,
        "ナイフ類は刃の長さで制限がある。お酒は持ち込めるが、車内で飲める量に上限がある",
      ],
      callout: {
        tone: "warn",
        title: `締切は${C.stPancras.standardCloses}分前。過ぎるとその切符では乗れない`,
        body: `改札が閉まったあとに着いても、列車には乗れません。Standard と Plus の無料変更は出発1時間前までなので、**遅れそうだと分かった時点で**アプリから後の列車に変えてください。差額だけで済みます。`,
      },
    },
    {
      id: "ees-etias",
      navLabel: "EESとETIAS",
      title: "EUの入国審査が変わった：EESとETIAS",
      body: `**EES（Entry/Exit System）**

EUの国境で、パスポートにスタンプを押す代わりに、出入りを電子的に記録する仕組みです。${jpDate(
        EES.startedOn
      )}に始まり、${jpDate(
        EES.fullFrom
      )}に全面運用になりました。この日でスタンプは廃止されています。

| | |
|---|---|
| **対象** | EU以外の国籍で、短期滞在の人。**日本国籍も英国籍も対象** |
| **初回にすること** | 顔写真と指紋の登録（${EES.noFingerprintsUnder}歳未満は指紋なし） |
| **どこで** | セント・パンクラスのフランスの入国審査。事前の申請はない |
| **費用** | 無料 |
| **2回目以降** | 記録は${EES.retentionYears}年保存され、次からは確認だけで速い |

ロンドンからなら、**セント・パンクラスのフランスの審査ブースで登録します**。事前に申し込むものはありません。Premier の乗客などは、専用の端末で先に登録するよう係員に案内されることがありますが、Standard ではブースで係員と一緒に済ませます。

時間がかかるのは初回だけです。ただ、初回の人が多い日は列全体が遅くなります。

**ETIAS**

ビザの要らない国の人が、EUに入る前にオンラインで申請する渡航認証です（英国のETAのEU版）。始まれば日本国籍も英国籍も必要になり、申請料は${eur(
        ETIAS.feeEur
      )}、有効期間は${ETIAS.validYears}年です。

**${EUROSTAR_AS_OF}時点では、まだ始まっていません**。${
        ETIAS.status
      }です。いまパリへ行くのにETIASは要りません。ETIASを名乗って手数料を取る代行サイトがあるので、開始が発表されるまでは申し込まないでください。`,
      callout: {
        tone: "info",
        title: `「${EES.windowDays}日のうち${EES.maxDays}日」は、英国にいた日と別に数える`,
        body: `EESは、シェンゲン圏に**${EES.windowDays}日のうち${EES.maxDays}日まで**しかいられない規則を自動で数えます。英国はシェンゲン圏ではないので、ロンドンにいる日数はこの${EES.maxDays}日に入りません。パリへの日帰りは1日として数えられます。`,
      },
    },
    {
      id: "documents",
      navLabel: "持っていく書類",
      title: "持っていく書類：旅行者と在住者で違うところ",
      body: `| | 旅行者（日本国籍） | 英国在住者（日本国籍） |
|---|---|---|
| **パスポート** | EUを出る予定の日から${EU_BORDER.passport.validMonthsAfterExit}か月以上の残りが要る | 同じ |
| **パリに入る** | EES（初回に指紋と顔写真）。ETIASはまだ要らない | 同じ。英国の在留資格があっても対象 |
| **英国に戻る** | ETA（ロンドンに来るときに取ったもの） | eVisa（今のパスポートに紐付いていること） |
| **90日の計算** | 英国にいた日は数えない | 同じ。英国に住んでいても、シェンゲン圏は別に数える |

**旅行者は、ETAを取り直す必要は通常ありません**。ロンドンに入るときに取ったETAは2年間（パスポートの期限が先ならそこまで）有効で、何度でも使えます。パスポートを新しくした場合だけ取り直しです（${gbp(
        VISA_FEES.eta
      )}）。詳しくは[ETAの取り方](/sightseeing/eta-uk-visa-guide)へ。

**在住者が引っかかりやすいのは帰り**です。パスポートを更新したのに UKVI のアカウントを直していないと、パリ北駅での英国の審査で時間がかかります。出発前に、今のパスポートが登録されているか確かめてください（[入国後の手続き｜eVisa](/visa/after-arrival)）。`,
    },
    {
      id: "return",
      navLabel: "帰り（パリ北駅）",
      title: "帰り：英国の入国審査はパリで受ける",
      body: `帰りは、行きと同じ順番をパリ北駅で通ります。

1. **改札**：QRコードをかざす
2. **保安検査**
3. **フランスの出国審査**：EESで出国が記録される
4. **英国の入国審査**：英国の審査官がパリで審査する

そのため、**ロンドンに着いたら審査はありません**。セント・パンクラスで降りて、そのまま地下鉄に乗れます。

公式の目安は、Standard で出発の${C.gareDuNord.standardArrive}分前です。ロンドン側より長く取ってあるのは、夕方の北駅が混むからです。最終は21時台発・ロンドン22時台着で（${sampleDay}の例）、**乗り遅れるとその日のうちにロンドンへ戻る手段はほとんどありません**。`,
      tips: ["北駅の券売機や案内板の周りはスリが多い。荷物から目を離さない"],
      callout: {
        tone: "warn",
        title: "日帰りの帰りは、最終の1本前を取る",
        body: `最終に乗り遅れたり、最終が運休になったりすると、その日のうちには帰れません。同じ日に別の便へ振り替えようにも、後ろにもう列車がないからです。日帰りの帰りは**最終の1本前**を取っておくと、遅れても最終が受け皿になります。`,
      },
    },
    {
      id: "day-trip",
      navLabel: "日帰りの時間配分",
      title: "日帰りで、パリに何時間いられるか",
      body: `時刻は${sampleDay}（火曜）のダイヤの例です。曜日と時期で変わるので、予約するときに確かめてください。

| | 始発で行く | 7時台で行く |
|---|---|---|
| **セント・パンクラスに着く** | 4時45分ごろ | 5時45分ごろ |
| **ロンドン発** | ${T.firstFromLondon.dep} | ${T.morningFromLondon.dep} |
| **パリ北駅着（パリ時間）** | ${T.firstFromLondon.arr} | ${T.morningFromLondon.arr} |
| **北駅に戻る** | 19時30分ごろ | 19時30分ごろ |
| **パリ発（最終）** | ${T.lastFromParis.dep} | ${T.lastFromParis.dep} |
| **ロンドン着** | ${T.lastFromParis.arr} | ${T.lastFromParis.arr} |
| **パリにいられる時間** | 約10時間 | 約9時間 |

**現実的なのは7時台の便**です。始発に乗るには4時台に駅に着く必要があり、地下鉄が動き出す前です。駅の近くに泊まるか、タクシーか夜行バスで向かうことになります。

**9時間で何ができるか**

移動とお昼で3時間ほど消えます。残る6時間で入れるのは、**予約した美術館1つと、外から見る名所2〜3か所**までと考えてください。

- **美術館を中心にする日**：北駅 → ルーヴル（予約した時間枠で2〜3時間）→ セーヌ沿いを歩いてシテ島のノートルダム → 北駅
- **外から見て回る日**：北駅 → ノートルダム（無料）→ セーヌ沿いにルーヴルの中庭とチュイルリー公園 → エッフェル塔（上るなら日時指定の券）→ 北駅

ルーヴルとエッフェル塔の頂上を同じ日に入れると、どちらかが駆け足になります。入りたい場所が2つ以上あるなら、1泊を考えてください。

**1人あたりの費用の目安**

| | |
|---|---|
| **ユーロスター往復** | 早く買えば${gbp(RETURN_EARLY)}から。直前は£300を超えることも |
| **メトロ** | 1回券${METRO_RIDES}回で${eur(PARIS.transport.metroTicket * METRO_RIDES)}（ほかにICカード代${eur(PARIS.transport.navigoEasyCard)}） |
| **ルーヴルに入るなら** | ${eur(PARIS.admissions.louvre.nonEea)} |

運賃の差がいちばん大きいので、日帰りの総額は**ユーロスターをいつ買うかでほぼ決まります**。`,
      tips: [
        `ルーヴルは${PARIS.admissions.louvre.closedDay}休館。日帰りの日を${PARIS.admissions.louvre.closedDay}にしない`,
        "パリの美術館は月曜か火曜に休むところが多い。行く日の曜日を先に確かめる",
        "金曜と土曜の夜は一部路線で地下鉄の終夜運転（Night Tube）がある。土曜・日曜の始発なら、地下鉄で駅まで行ける場合がある",
      ],
    },
    {
      id: "metro",
      navLabel: "パリのメトロ",
      title: "パリのメトロは別の切符",
      body: `ロンドンの Oyster も、ロンドンで使っているクレジットカードのタッチ決済も、**パリのメトロの改札では使えません**。カードのタッチ決済はメトロでは${
        PARIS.transport.contactlessOnMetroFrom
      }導入される予定で、${EUROSTAR_AS_OF}時点ではまだです。

| | |
|---|---|
| **1回券** | Ticket Métro-Train-RER ${eur(PARIS.transport.metroTicket)}（2026年） |
| **入れ物** | ICカード Navigo Easy（${eur(PARIS.transport.navigoEasyCard)}）に入れるか、スマートフォンのアプリで買う |
| **買う場所** | 北駅の券売機・窓口 |

紙の切符はなくなりつつあり、Navigo Easy に1回券を何回分かまとめて入れるのが一般的です。日帰りで乗るのは北駅との往復を含めて4〜5回なので、**${METRO_RIDES}回分で${eur(
        PARIS.transport.metroTicket * METRO_RIDES
      )}**です。

北駅からは**メトロ4号線**が便利です。シャトレ、シテ島（ノートルダム）、サン＝ミシェル、サン＝ジェルマン＝デ＝プレへ乗り換えなしで行けます。ルーヴルへは、シャトレから1号線に乗り換えるか、歩いて15分ほどです。`,
    },
  ],
  faq: [
    {
      question: "ユーロスターは何分前に駅に着けばいいですか？",
      answer: `**公式の目安は出発の${C.stPancras.standardArrive}分前**です（Premier は${C.stPancras.premierArrive}分前）。改札は${C.stPancras.standardCloses}分前に閉まり、過ぎると乗れません。初めてEESに登録する人や、金曜の夕方・休暇期間はさらに早めに着いてください。パリ北駅からの帰りは${C.gareDuNord.standardArrive}分前が目安です。`,
    },
    {
      question: "ユーロスターの予約はいつから？いつ買うのが安いですか？",
      answer: `発売は${EUROSTAR.bookingOpensMonths}からです。航空券と同じ変動制で安い席から売れていくので、**日程が決まったらすぐ買う**のがいちばん安くなります。Standard の最安は片道${gbp(
        EUROSTAR.standardFrom
      )}から（往復で買ったときの片道分）で、直前は片道${EUROSTAR.lastMinuteBand}になることが珍しくありません。`,
    },
    {
      question: "ロンドンからパリへ日帰りはできますか？",
      answer: `**できます**。7時台の便で行き、最終の21時台の便で戻ると、パリに9時間ほどいられます（${sampleDay}のダイヤの例）。ただ、駅の手続きに往復で2時間半ほどかかるので、入れるのは予約した美術館1つと街歩きまでです。`,
    },
    {
      question: "EESとは何ですか？日本人も登録が必要ですか？",
      answer: `EUの国境で、パスポートのスタンプの代わりに出入りを電子的に記録する仕組みで、${jpDate(
        EES.fullFrom
      )}に全面運用になりました。**日本国籍も対象**で、初回に顔写真と指紋（${EES.noFingerprintsUnder}歳未満は指紋なし）を登録します。ロンドンからはセント・パンクラスのフランスの審査で登録し、事前の申請は要りません。無料です。`,
    },
    {
      question: "ETIASは必要ですか？",
      answer: `**${EUROSTAR_AS_OF}時点では要りません**。まだ始まっておらず、開始日も発表されていません。始まれば日本国籍も英国籍も、事前のオンライン申請（${eur(
        ETIAS.feeEur
      )}、${ETIAS.validYears}年有効）が必要になります。`,
    },
    {
      question: "パリに着いたら入国審査はありますか？",
      answer:
        "**ありません**。フランスの入国審査はセント・パンクラスで済んでいるので、パリ北駅では降りてそのまま街に出られます。帰りも同じで、英国の入国審査はパリ北駅で受けるため、ロンドンでは審査なしで駅を出られます。",
    },
    {
      question: "液体の持ち込みに制限はありますか？",
      answer: `**量の制限はありません**。飛行機の100ml規則は関係なく、飲み物も化粧品もそのまま持ち込めます。荷物は Standard と Plus で大きいもの2個と小さい手荷物1個まで（1辺${EUROSTAR.luggageMaxCm}cmまで）。ナイフ類は刃の長さで制限があります。`,
    },
    {
      question: "パリのメトロでOysterやタッチ決済は使えますか？",
      answer: `**使えません**。パリのメトロは、ICカード Navigo Easy（${eur(
        PARIS.transport.navigoEasyCard
      )}）に1回券（${eur(
        PARIS.transport.metroTicket
      )}）を入れて乗ります。クレジットカードのタッチ決済は、メトロでは${
        PARIS.transport.contactlessOnMetroFrom
      }導入される予定です。`,
    },
    {
      question: "ディズニーランド・パリへの直通はありますか？",
      answer: `**ありません**。ロンドンからの直通は${EUROSTAR.disneylandDirectEnded}に廃止されました。パリ北駅で降りて、市内からRERで向かいます。`,
    },
  ],
  sources: [
    ...EUROSTAR_SOURCES,
    {
      label: "Musée du Louvre – 開館時間と料金（公式）",
      url: PARIS.admissions.louvre.official,
    },
    {
      label: "Tour Eiffel – 料金と開館時間（公式）",
      url: PARIS.admissions.eiffelTower.official,
    },
    {
      label: "Notre-Dame de Paris – 無料の時間枠予約（公式）",
      url: PARIS.admissions.notreDame.official,
    },
    VISA_SOURCES.eta,
    {
      label: "GOV.UK – UKVI アカウントの情報を更新する（eVisa）",
      url: "https://www.gov.uk/update-uk-visas-immigration-account-details",
    },
  ],
  relatedLinks: [
    {
      href: "/sightseeing/eta-uk-visa-guide",
      label: "ETAの取り方｜パリから英国に戻るときにも要る",
    },
    {
      href: "/visa/after-arrival",
      label: "入国後の手続き｜在住者は出発前に eVisa を確かめる",
    },
    {
      href: "/sightseeing/hotels",
      label: "宿泊エリアの選び方｜始発に乗るならセント・パンクラス周辺",
    },
    {
      href: "/beyond-london/canterbury",
      label: "カンタベリー｜同じセント・パンクラスから1時間",
    },
  ],
};

export default paris;

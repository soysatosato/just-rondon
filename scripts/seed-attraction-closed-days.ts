/**
 * 観光スポットの「休みの曜日」を closedWeekdays に入れる。
 *
 *   npx tsx scripts/seed-attraction-closed-days.ts            # ドライラン
 *   npx tsx scripts/seed-attraction-closed-days.ts --apply    # 投入
 *   npx tsx scripts/seed-attraction-closed-days.ts --report   # 未調査の一覧
 *   npx tsx scripts/seed-attraction-closed-days.ts --only <slug> [--apply]
 *                                                             # 1件だけ
 *
 * 冪等。slug を指定した行だけを更新する。
 *
 * ★ --apply は一覧の全件の closedDaysCheckedAt を今日に書き換える。
 *   確かめ直していない行まで「今日確かめた」ことになるので、1件を足したり
 *   直したりしたときは --only でその行だけを投入すること。
 *
 * ------------------------------------------------------------------
 * なぜ正規表現を使わないのか
 * ------------------------------------------------------------------
 * 直前まで lib/plan/dates.ts の parseClosedDays() が openingHours の
 * 散文から曜日を読み取っていた。155件中10件しか読めておらず、しかも
 * 書き方ひとつで誤読する(「土曜のみ」は他6日が休館だと読まれる)。
 *
 * ここでは移行元をパースしない。10件ぶんの読み取り結果は正しかったので、
 * その値を人が確認したうえで**数字として直接書いてある**。以後この列は
 * 出典を見て人が埋める。機械が推測する余地を残さない。
 *
 * ------------------------------------------------------------------
 * openingHours からの曜日の削除
 * ------------------------------------------------------------------
 * 同じ事実を2か所に置くと、改定のとき片方が取り残される。
 * closedWeekdays を入れた行は、openingHours から「休みの曜日」の記述を
 * 抜く(cleanOpeningHours)。曜日ごとに開館"時刻"が違う場合の曜日表記は
 * 残す——それは休館の情報ではないので重複しない。
 *
 *   バラ・マーケット
 *     前: 火〜金 10:00〜17:00 / 土 9:00〜17:00 / 日 10:00〜16:00（月休）
 *     後: 火〜金 10:00〜17:00 / 土 9:00〜17:00 / 日 10:00〜16:00
 *          ↑ 曜日ごとの時刻は残す。「月休」だけを列へ移す
 *
 * ------------------------------------------------------------------
 * 埋めていない行について
 * ------------------------------------------------------------------
 * closedDaysCheckedAt が null の行は「まだ調べていない」。空配列と
 * 区別できるようにしてあるのは、未調査を「毎日開いている」として
 * 出さないため。--report で残りが出る。
 */

import "dotenv/config";
import db from "../utils/db";

/** 0=月 〜 6=日。lib/plan/dates.ts の WEEKDAY_LABELS と同じ並び。 */
const MON = 0, TUE = 1, WED = 2, THU = 3, FRI = 4, SAT = 5, SUN = 6;
const LABELS = ["月", "火", "水", "木", "金", "土", "日"];

type Entry = {
  slug: string;
  /** 休みの曜日。空配列は「調べたうえで曜日休館は無い」。 */
  closed: number[];
  /** 曜日で表せない休み。1文。 */
  note?: string;
  /** openingHours から曜日の記述を抜いた形。変更が要らなければ省略。 */
  openingHours?: string;
  /** 根拠。URL か、それに準ずる出所。 */
  source: string;
};

/* ------------------------------------------------------------------ *
 * 1. 曜日休館がある行
 * ------------------------------------------------------------------ */

const CLOSED_SOME_DAYS: Entry[] = [
  {
    slug: "st-pauls-cathedral",
    closed: [SUN],
    note: "日曜は礼拝のみで、見学はできない（ドームの回廊は時期により公開）",
    source: "https://www.stpauls.co.uk/planning-your-visit",
  },
  {
    slug: "westminster-abbey",
    closed: [SUN],
    note: "日曜は礼拝のみで、見学はできない",
    source: "https://www.westminster-abbey.org/visit-us/prices-and-entry-times",
  },
  {
    slug: "kensington-palace",
    closed: [MON, TUE],
    source: "https://www.hrp.org.uk/kensington-palace/visit/opening-and-closing-times/",
  },
  {
    slug: "sir-john-soanes-museum",
    closed: [MON, TUE],
    openingHours: "10:00〜17:00 (最終入場16:30)",
    source: "https://www.soane.org/your-visit",
  },
  {
    slug: "quentin-blake-centre",
    closed: [MON, TUE],
    openingHours: "10:00〜17:00（最終入場16:00）",
    source: "https://qbcentre.org.uk/your-visit",
  },
  {
    slug: "royal-academy-of-arts",
    closed: [MON],
    openingHours: "10:00〜18:00 (金曜21:00まで)",
    source: "https://www.royalacademy.org.uk/plan-your-visit",
  },
  {
    slug: "serpentine-galleries",
    closed: [MON],
    openingHours: "10:00〜18:00 (展覧会期中)",
    source: "https://www.serpentinegalleries.org/visit/",
  },
  {
    slug: "florence-nightingale-museum",
    closed: [MON],
    openingHours: "10:00〜17:00 (最終入場16:30)",
    source: "https://www.florence-nightingale.co.uk/visit/",
  },
  {
    slug: "borough-market",
    closed: [MON],
    // 曜日ごとに時刻が違うので、曜日の表記そのものは残す。抜くのは「月休」だけ。
    openingHours: "火〜金 10:00〜17:00 / 土 9:00〜17:00 / 日 10:00〜16:00",
    source: "https://boroughmarket.org.uk/visit-us/",
  },
  {
    slug: "columbia-road-flower-market",
    closed: [MON, TUE, WED, THU, FRI, SAT],
    openingHours: "8:00〜15:00頃",
    source: "https://columbiaroad.info/",
  },
  {
    slug: "portobello-road-market",
    closed: [SUN],
    openingHours: "9:00〜18:00（木は13:00まで。アンティークの露店が出るのは土曜だけ）",
    source: "https://visitportobello.com/",
  },
  {
    slug: "banqueting-house-london",
    closed: [TUE, WED],
    note: "夏季のみ公開。会期は年によって変わる",
    openingHours: "10:00〜16:00 (夏季公開。会期は公式で確認)",
    source: "https://www.hrp.org.uk/banqueting-house/visit/",
  },
  {
    slug: "abba-voyage",
    closed: [TUE, WED],
    openingHours: "公演日は公式で確認",
    source: "https://abbavoyage.com/plan-your-visit/",
  },
  {
    slug: "emery-walkers-house",
    closed: [MON, TUE, WED, FRI, SUN],
    note: "見学はガイドツアーのみ。木曜と土曜の 11:00 と 13:00",
    source: "https://www.emerywalker.org.uk/visit",
  },
  {
    slug: "kelmscott-house-william-morris-society",
    closed: [MON, TUE, WED, SUN],
    note: "木曜と土曜は午後のみ。金曜はガイドツアーの枠だけ",
    source: "https://williammorrissociety.org/whats-on/",
  },
  /*
   * 館ではなく式なので「休み」は式の無い曜日。公式カレンダー(2026年10〜11月)は
   * 11:00の Guard Change を月・水・金にだけ載せ、火・木・土は15:00の
   * Captain's Inspection、日曜は一部の日に10:00の Sunday Parade。
   * 旅程の「この日は閉まっています」はこの値で出る(2026-10 の監査まで空で、
   * 火曜に入れても警告が出なかった)。夏に毎日になる年があるので、
   * 季節が変わったらカレンダーを見直すこと。
   */
  {
    slug: "changing-the-guard-buckingham-palace",
    closed: [TUE, THU, SAT, SUN],
    note: "11:00の衛兵交代は月・水・金。火・木・土は15:00の点検、日曜は10:00のパレードがある日がある",
    source: "https://www.householddivision.org.uk/changing-the-guard-calendar",
  },
  // 2026-10-29 に公式で確認(サイト総点検 P2-4)。
  {
    slug: "barbican-art-gallery",
    closed: [MON],
    note: "祝日(バンク・ホリデー)も休み",
    source: "https://www.barbican.org.uk/your-visit/general-info/opening-hours",
  },
  // 2026-10-30 に公式で確認(サイト総点検 P2-4 の続き)。
  {
    slug: "58th-street-london",
    closed: [MON],
    openingHours: "火〜金 19:00 / 土日 13:00・19:00(公演の開始時刻)",
    source: "https://58thstreet.co.uk/reservations/",
  },
  {
    slug: "alcotraz-immersive-prison-cocktail-experience",
    closed: [MON],
    source: "https://alcotraz.co.uk/locations/london",
  },
  {
    slug: "osterley-park-and-house",
    closed: [MON, TUE],
    note: "月・火は庭園だけ開く(館はバンク・ホリデーの月曜は開く)",
    openingHours: "館 水〜日 11:00〜15:30",
    source: "https://www.nationaltrust.org.uk/visit/london/osterley-park-and-house",
  },
  {
    slug: "spencer-house-london",
    closed: [MON, TUE, WED, THU, FRI, SAT],
    note: "一般公開は日曜だけ。平日は予約制の団体ツアーのみ。8月は休館",
    source: "https://www.spencerhouse.co.uk/tours/",
  },
  {
    slug: "the-charterhouse-london",
    closed: [SUN, MON],
    openingHours: "火〜土 10:30〜16:30(ガイドツアーは11:00と14:15)",
    source: "https://thecharterhouse.org/visit-us/",
  },
  {
    slug: "fenton-house-hampstead",
    closed: [MON, TUE, WED, THU, SAT],
    note: "11〜2月は休館。開くのは金・日とバンク・ホリデーの月曜",
    source: "https://www.nationaltrust.org.uk/visit/london/fenton-house-and-garden",
  },
  // 2026-10-30、公式サイトが自動の読み取りを拒むため、公式ドメインに絞った検索で確認。
  {
    slug: "windsor-castle",
    closed: [TUE, WED],
    openingHours: "3〜10月 10:00〜17:15 / 11〜2月 10:00〜16:15(最終入場は閉館の1時間15分前)",
    source: "https://www.rct.uk/visit/windsor-castle",
  },
  {
    slug: "royal-mews",
    closed: [TUE, WED],
    note: "冬のあいだは休館(再開日は公式で確認)",
    source: "https://www.rct.uk/visit/the-royal-mews-buckingham-palace",
  },
  {
    slug: "grant-museum-of-zoology",
    closed: [SUN, MON],
    source: "https://www.ucl.ac.uk/engage/museums-collections/grant-museum-zoology/visit-grant-museum-zoology",
  },
  // 2026-11-03、曜日のページ(/sightseeing/open)を出す前に閲覧上位を確認。
  // 公式の営業カレンダー(ページ内の openingTimeData)は11〜12月の分だけ。
  {
    slug: "the-view-from-the-shard",
    closed: [MON, TUE],
    note: "2026年11〜12月の営業で確認。12月22・28・29日は開き、24〜26日は休む。1月以降は公式の営業カレンダーで確認",
    openingHours: "水〜金・日 11:00〜19:00 / 土 10:00〜22:00(最終入場は閉場の1時間前)",
    source: "https://www.theviewfromtheshard.com/opening-times/",
  },
  // 公式サイトが自動の読み取りを拒むため、公式ドメインに絞った検索で確認。
  {
    slug: "houses-of-parliament-self-guided-audio-tour",
    closed: [MON, TUE, WED, THU, FRI, SUN],
    note: "見学ツアーは土曜(通年)と、議会の休会中の平日にある。日程は公式のチケット販売で確認",
    source: "https://www.parliament.uk/visiting/visiting-and-tours/",
  },
];

/* ------------------------------------------------------------------ *
 * 2. 曜日休館が無いことを確認した行
 *
 *    「調べたら毎日開いていた」であって「調べていない」ではない。
 *    この区別のために closedDaysCheckedAt を入れる。
 * ------------------------------------------------------------------ */

const OPEN_EVERY_DAY: Entry[] = [
  { slug: "tower-of-london", closed: [], source: "https://www.hrp.org.uk/tower-of-london/visit/" },
  { slug: "british-museum-london", closed: [], source: "https://www.britishmuseum.org/visit" },
  { slug: "national-gallery-london", closed: [], source: "https://www.nationalgallery.org.uk/visiting" },
  { slug: "natural-history-museum", closed: [], source: "https://www.nhm.ac.uk/visit.html" },
  { slug: "churchill-war-rooms", closed: [], source: "https://www.iwm.org.uk/visits/churchill-war-rooms" },

  /*
   * 屋外・常時開放。openingHours が「常時開放」「終日」と書いている行で、
   * 曜日で閉まる余地が無いもの。個別に目視して選んである
   * (「常時開放」と書いてあっても中身が催しなら対象外にする)。
   */
  { slug: "trafalgar-square", closed: [], source: "屋外の広場。常時開放" },
  { slug: "piccadilly-circus", closed: [], source: "屋外の交差点。常時開放" },
  { slug: "parliament-square", closed: [], source: "屋外の広場。常時開放" },
  { slug: "millennium-bridge", closed: [], source: "屋外の橋。常時開放" },
  { slug: "the-fourth-plinth-trafalgar-square", closed: [], source: "屋外の彫刻。常時開放" },
  { slug: "movie-statue-street-leicester-square", closed: [], source: "屋外の銅像。常時開放" },
  { slug: "the-gherkin-30-st-mary-axe", closed: [], source: "外観のみ。内部は非公開" },
  { slug: "hampstead-heath", closed: [], source: "終日開放の公園" },
  { slug: "crystal-palace-dinosaurs", closed: [], source: "公園内の屋外展示。日没で閉園" },
  { slug: "golders-hill-park-zoo", closed: [], source: "公園内。動物エリアは日没まで" },
  { slug: "covent-garden", closed: [], source: "広場は終日。店舗の営業時間は個別" },
  { slug: "leadenhall-market-london", closed: [], source: "通路は常時開放。店舗の営業時間は個別" },
  { slug: "st-pancras-international", closed: [], source: "稼働中の鉄道駅。終日" },

  // 2026-10-29 に公式で確認(サイト総点検 P2-4)。どれも12月24〜26日は別に休み。
  { slug: "tate-britain", closed: [], source: "https://www.tate.org.uk/visit/tate-britain" },
  { slug: "tate-modern", closed: [], source: "https://www.tate.org.uk/visit/tate-modern" },
  {
    slug: "science-museum",
    closed: [],
    note: "2026年11月11日(水)は終日休館",
    source: "https://www.sciencemuseum.org.uk/visit-us",
  },
  { slug: "imperial-war-museum", closed: [], source: "https://www.iwm.org.uk/visits/iwm-london" },
  { slug: "london-tower-bridge", closed: [], source: "https://www.towerbridge.org.uk/plan-your-visit" },
  { slug: "hyde-park-london", closed: [], source: "https://www.royalparks.org.uk/visit/parks/hyde-park" },
  {
    slug: "sky-garden-london",
    closed: [],
    note: "貸し切りなどで一般公開しない日があり、公式サイトに載る",
    source: "https://skygarden.london/booking/",
  },
  {
    slug: "barbican-centre",
    closed: [],
    openingHours: "月〜金 8:00〜23:00 / 土日 9:00〜23:00 / 祝日 11:00〜23:00",
    source: "https://www.barbican.org.uk/your-visit/general-info/opening-hours",
  },
  { slug: "harrods-london", closed: [], source: "https://www.harrods.com/en-gb/c/plan-your-visit" },

  // 2026-10-30 に公式で確認(サイト総点検 P2-4 の続き)。王立公園は門の開閉時刻だけが
  // 載っていて休みの曜日は無い。どれも12月25日前後は別に休み。
  { slug: "jack-the-ripper-museum", closed: [], source: "https://www.jacktherippermuseum.com" },
  {
    slug: "monument-to-the-great-fire-of-london",
    closed: [],
    openingHours: "9:30〜13:00 / 14:00〜18:00 (最終入場12:30・17:30)",
    source: "https://www.themonument.org.uk/",
  },
  {
    slug: "london-eye",
    closed: [],
    note: "毎年1月いっぱいは点検のため休業",
    source: "https://www.londoneye.com/plan-your-visit/before-you-visit/opening-hours/",
  },
  {
    slug: "kenwood-house-hampstead",
    closed: [],
    source: "https://www.english-heritage.org.uk/visit/places/kenwood/",
  },
  {
    slug: "down-house-charles-darwin",
    closed: [],
    source: "https://www.english-heritage.org.uk/visit/places/home-of-charles-darwin-down-house/",
  },
  {
    slug: "jewel-tower-westminster",
    closed: [],
    openingHours: "10:00〜16:00 (最終入場15:30)",
    source: "https://www.english-heritage.org.uk/visit/places/jewel-tower/",
  },
  { slug: "highgate-cemetery", closed: [], source: "https://highgatecemetery.org/" },
  {
    slug: "queens-house-greenwich",
    closed: [],
    source: "https://www.rmg.co.uk/plan-your-visit/opening-times",
  },
  {
    slug: "old-royal-naval-college",
    closed: [],
    source: "https://ornc.org/plan-a-visit/opening-times/",
  },
  { slug: "young-va-bethnal-green", closed: [], source: "https://www.vam.ac.uk/young/visit" },
  {
    slug: "london-museum-smithfield",
    closed: [],
    openingHours: "2026年11月28日開館。日〜木 10:00〜18:00 / 金土 10:00〜23:00",
    source: "https://www.londonmuseum.org.uk/whats-on/smithfield-general-admission/",
  },
  {
    slug: "somerset-house",
    closed: [],
    source: "https://www.somersethouse.org.uk/visit-us/opening-times-and-prices",
  },
  {
    slug: "southwark-cathedral",
    closed: [],
    source: "https://cathedral.southwark.anglican.org/visiting/visitor-information/",
  },
  {
    slug: "diana-princess-of-wales-memorial-playground",
    closed: [],
    note: "閉園は季節で変わり、11〜1月は15:45",
    source: "https://www.royalparks.org.uk/visit/parks/kensington-gardens/diana-memorial-playground",
  },
  {
    slug: "greenwich-park",
    closed: [],
    source: "https://www.royalparks.org.uk/visit/parks/greenwich-park",
  },
  {
    slug: "kensington-gardens",
    closed: [],
    source: "https://www.royalparks.org.uk/parks/kensington-gardens",
  },
  { slug: "regents-park", closed: [], source: "https://www.royalparks.org.uk/parks/regents-park" },
  {
    slug: "richmond-park",
    closed: [],
    source: "https://www.royalparks.org.uk/parks/richmond-park",
  },
  {
    slug: "st-jamess-park",
    closed: [],
    source: "https://www.royalparks.org.uk/parks/st-jamess-park",
  },
  { slug: "abbey-road-beatles", closed: [], source: "屋外の道路の横断歩道。常時" },
  {
    slug: "bicester-village",
    closed: [],
    source: "https://www.thebicestercollection.com/bicester-village/en/visit",
  },
  { slug: "camden-lock-market", closed: [], source: "https://www.camdenmarket.com/visit-us" },
  {
    slug: "fortnum-and-mason",
    closed: [],
    openingHours: "月〜土 10:00〜20:00 / 日 12:00〜18:00",
    source: "https://www.fortnumandmason.com/piccadilly",
  },
  { slug: "battersea-power-station", closed: [], source: "https://batterseapowerstation.co.uk/" },
  {
    slug: "shakespeares-globe-guided-tour",
    closed: [],
    source: "https://www.shakespearesglobe.com/whats-on/globe-theatre-guided-tour/",
  },
  { slug: "the-ghost-bus-tours", closed: [], source: "https://theghostbustours.com/london/" },
  {
    slug: "bat-and-ball-stratford",
    closed: [],
    source: "https://www.thebatandball.com/locations/stratford",
  },
  {
    slug: "chimney-lift-battersea-power-station",
    closed: [],
    source: "https://thechimneylift.co.uk/your-visit/opening-hours/",
  },
  {
    slug: "frameless-london",
    closed: [],
    openingHours: "月〜木 11:00〜18:00 / 金 10:30〜22:00 / 土 10:00〜22:00 / 日 10:00〜18:00",
    source: "https://frameless.com/opening-times/",
  },
  { slug: "paradox-museum-london", closed: [], source: "https://paradoxmuseum.com/london/" },
  {
    slug: "lords-cricket-ground",
    closed: [],
    source: "https://www.lords.org/lords/lord-s-experience/tours",
  },
  {
    slug: "ifs-cloud-cable-car-london",
    closed: [],
    source: "https://tfl.gov.uk/modes/london-cable-car/opening-hours-frequency",
  },
  // 次の5件は公式ドメインに絞った検索で確認(公式サイトが自動の読み取りを拒むため)。
  {
    slug: "kew-gardens-london",
    closed: [],
    openingHours: "10:00開園。閉園は季節で変わり、冬は15:15〜16:00(最終入場は閉園の45分〜1時間前)",
    source: "https://www.kew.org/kew-gardens/visit-kew-gardens/opening-and-closing-times",
  },
  { slug: "london-zoo", closed: [], source: "https://www.londonzoo.org/plan-your-visit/opening-times" },
  { slug: "london-transport-museum", closed: [], source: "https://www.ltmuseum.co.uk/visit/opening-times" },
  { slug: "hms-belfast", closed: [], source: "https://www.iwm.org.uk/visits/hms-belfast" },
  {
    slug: "liberty-london",
    closed: [],
    openingHours: "月〜土 10:00〜20:00 / 日 12:00〜18:00(11:30から見て回れる)",
    source: "https://support.libertylondon.com/hc/en-us/articles/26970438567185-What-are-the-store-opening-hours",
  },
  // 2026-11-03、曜日のページ(/sightseeing/open)を出す前に閲覧上位を確認。
  {
    slug: "harry-potter-shop-platform-934",
    closed: [],
    openingHours: "月〜土 8:00〜22:00 / 日 9:00〜20:00",
    source: "https://harrypottershop.co.uk/pages/kings-cross",
  },
  {
    slug: "madame-tussauds-london",
    closed: [],
    note: "12月25日は休む。閉館時刻は日によって変わる",
    source: "https://www.madametussauds.com/london/plan-your-visit/before-you-visit/opening-hours/",
  },
  // 公式サイトが自動の読み取りを拒むため、公式ドメインに絞った検索で確認。
  {
    slug: "london-dungeon",
    closed: [],
    note: "12月25日は休む。開館時間は日によって変わる",
    source: "https://www.thedungeons.com/london/plan-your-visit/before-you-visit/opening-hours/",
  },
];

const ENTRIES = [...CLOSED_SOME_DAYS, ...OPEN_EVERY_DAY];

const APPLY = process.argv.includes("--apply");
const REPORT = process.argv.includes("--report");
/** --only <slug> のときの slug。全件の確認日を書き換えずに1件だけ投入する。 */
const ONLY = (() => {
  const i = process.argv.indexOf("--only");
  return i === -1 ? null : (process.argv[i + 1] ?? "");
})();

const fmt = (days: number[]) =>
  days.length === 0 ? "曜日休館なし" : days.map((d) => LABELS[d]).join("・") + "休";

async function report() {
  const rows = await db.attraction.findMany({
    where: { isPublished: true },
    select: {
      slug: true, name: true, category: true, recommendLevel: true,
      openingHours: true, closedWeekdays: true, closedDaysCheckedAt: true,
    },
    orderBy: [{ recommendLevel: "desc" }, { name: "asc" }],
  });

  const checked = rows.filter((r) => r.closedDaysCheckedAt !== null);
  const unchecked = rows.filter((r) => r.closedDaysCheckedAt === null);

  console.log(`公開 ${rows.length}件 / 確認済み ${checked.length}件 / 未調査 ${unchecked.length}件\n`);

  console.log("=== 未調査(おすすめ度の高い順) ===");
  for (const r of unchecked) {
    console.log(`  lv${r.recommendLevel ?? 0} ${r.category.padEnd(13)} ${r.name}`);
  }

  /*
   * closedWeekdays を入れたのに openingHours にも曜日休館が残っている行。
   * 二重管理になっているので、片方を消すこと。
   */
  const drift = checked.filter(
    (r) => r.openingHours && /[月火水木金土日]\s*曜?\s*休/.test(r.openingHours),
  );
  if (drift.length > 0) {
    console.log("\n=== ★ openingHours にも休館曜日が残っている(二重管理) ===");
    for (const r of drift) console.log(`  ${r.name}  「${r.openingHours}」`);
  }

  await db.$disconnect();
}

async function main() {
  if (REPORT) return report();

  console.log(APPLY ? "== 投入 ==\n" : "== ドライラン(--apply で投入) ==\n");

  const targets = ONLY === null ? ENTRIES : ENTRIES.filter((e) => e.slug === ONLY);
  if (ONLY !== null && targets.length === 0) {
    console.error(`✗ --only ${ONLY || "(slug なし)"} は一覧にありません`);
    process.exitCode = 1;
    await db.$disconnect();
    return;
  }

  const seen = new Set<string>();
  let applied = 0;

  for (const e of targets) {
    if (seen.has(e.slug)) {
      console.error(`✗ ${e.slug} が2回出てきます`);
      process.exitCode = 1;
      continue;
    }
    seen.add(e.slug);

    const current = await db.attraction.findUnique({
      where: { slug: e.slug },
      select: {
        name: true,
        openingHours: true,
        closedWeekdays: true,
        closedDaysCheckedAt: true,
        closedNote: true,
      },
    });

    if (!current) {
      console.error(`✗ ${e.slug} が見つかりません`);
      process.exitCode = 1;
      continue;
    }

    console.log(`${current.name} (${e.slug})`);
    // 書き換える前の値。投入を取り消すときの戻し先になる。
    console.log(
      `    現在: ${current.closedDaysCheckedAt ? fmt(current.closedWeekdays) : "未調査"}` +
        (current.closedNote ? ` / 注記「${current.closedNote}」` : "") +
        (current.closedDaysCheckedAt
          ? ` / 確認 ${current.closedDaysCheckedAt.toISOString().slice(0, 10)}`
          : ""),
    );
    console.log(`    ${fmt(e.closed)}   出典: ${e.source}`);
    if (e.note) console.log(`    注記: ${e.note}`);
    if (e.openingHours && e.openingHours !== current.openingHours) {
      console.log(`    開館時間 - ${current.openingHours}`);
      console.log(`             + ${e.openingHours}`);
    }

    if (APPLY) {
      await db.attraction.update({
        where: { slug: e.slug },
        data: {
          closedWeekdays: e.closed,
          closedDaysCheckedAt: new Date(),
          ...(e.note ? { closedNote: e.note } : {}),
          ...(e.openingHours ? { openingHours: e.openingHours } : {}),
        },
      });
      console.log("    → 投入");
      applied++;
    }
    console.log("");
  }

  const withClosure = targets.filter((e) => e.closed.length > 0).length;
  console.log(
    `対象 ${targets.length}件（うち曜日休館あり ${withClosure}件 / ` +
      `毎日開いていることを確認 ${targets.length - withClosure}件）`,
  );
  if (APPLY) console.log(`投入 ${applied}件`);
  else console.log("\n--apply を付けると投入します。--report で未調査の一覧が出ます。");

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

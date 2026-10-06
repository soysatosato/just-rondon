/**
 * ユーロスターでパリへ行くときの運賃・手続き・EU の入国制度・パリ側の金額。
 * /beyond-london/paris だけが使う。
 *
 * なぜ rates.ts と分けるか:
 * あちらは National Rail と BritRail で、改定は例年3月にまとめて来る。
 * こちらは追随すべき対象がまったく違い、動き方もばらばらになる。
 *
 *   - ユーロスターの運賃は航空券と同じ変動制で、改定日というものがない
 *   - EU の入国制度(EES・ETIAS)は開始日が何度も延びている
 *   - パリの交通運賃と入場料は1月に改定される
 *
 * 同居させると、英国の運賃を3月に確認した日付で、EU の制度まで
 * 「確認済み」に見えてしまう。
 *
 * 運用ルール(rates.ts と同じ):
 * 1. 記事から金額・日付を書くときは必ずここを参照する。
 * 2. 改定時はこのファイルと EUROSTAR_AS_OF / EUROSTAR_UPDATED_AT だけを更新する。
 * 3. 出典は EUROSTAR_SOURCES に持つ。裏取りせずに数値を書き換えないこと。
 *
 * ETIAS の開始日は月次の改定まとめ(/add-monthly-changes)で毎月確かめる。
 * 決まったら EU_BORDER.etias を直す(scripts/report-monthly-changes.ts が
 * 未定のあいだ毎月知らせる)。
 *
 * 2026年10月7日に eurostar.com・help.eurostar.com・home-affairs.ec.europa.eu・
 * travel-europe.europa.eu・iledefrance-mobilites.fr・louvre.fr・toureiffel.paris・
 * notredamedeparis.fr・parisjetaime.com で確認。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const EUROSTAR_AS_OF = "2026年10月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const EUROSTAR_UPDATED_AT = "2026-10-07";

/* -----------------------------------------------------
   ユーロスター
   出典: eurostar.com / help.eurostar.com
----------------------------------------------------- */

export const EUROSTAR = {
  /** 公式の表示「ほとんどの列車が2時間16分」。遅い便は2時間37分。 */
  usualMinutes: 136,
  slowestMinutes: 157,
  /**
   * Standard の最安。公式の「from £39」。
   * 往復で買ったときの片道分で、片道だけだと£50前後から(seat61)。
   */
  standardFrom: 39,
  standardFromOneWayOnly: "£50前後",
  /**
   * 直前・当日の相場観。公式は出していないので帯で持つ。
   * 英国の報道・比較サイトでは£180〜250の例が多いので、控えめに書く。
   */
  lastMinuteBand: "£150以上",
  /** 発売開始。公式ヘルプ「10〜11か月前」。 */
  bookingOpensMonths: "10〜11か月前",

  /**
   * 時刻の例。曜日・時期で変わるので「この日はこうだった」として持つ。
   * 記事は必ず「例」と書き、断定しない。
   */
  sampleTimetable: {
    /** 確認した運行日(火曜)。 */
    date: "2026-10-06",
    firstFromLondon: { dep: "06:01", arr: "09:29" },
    /** 現実的な朝の便。始発は5時前に起きることになる。 */
    morningFromLondon: { dep: "07:01", arr: "10:29" },
    lastFromParis: { dep: "21:02", arr: "22:30" },
    /** この日のロンドン発の本数。 */
    trainsFromLondon: 16,
  },

  /** 駅に着いておく時刻と、改札が閉まる時刻(出発の何分前か)。 */
  checkIn: {
    stPancras: {
      standardArrive: 75,
      premierArrive: 45,
      standardCloses: 30,
      premierCloses: 15,
    },
    gareDuNord: {
      standardArrive: "75〜90",
      premierArrive: "45〜60",
      standardCloses: 30,
      premierCloses: 15,
    },
  },

  /** 3つのクラス。Standard と Plus は条件が同じで、違うのは席と食事。 */
  classes: {
    standard: {
      label: "Eurostar Standard",
      exchange: "出発1時間前まで無料（差額は払う）",
      refund: "出発7日前まで、£25を引いて返金",
      luggage: "大きい荷物2個＋小さい手荷物1個",
      meal: "なし（車内で買える）",
    },
    plus: {
      label: "Eurostar Plus",
      exchange: "出発1時間前まで無料（差額は払う）",
      refund: "出発7日前まで、£25を引いて返金",
      luggage: "大きい荷物2個＋小さい手荷物1個",
      meal: "軽食と飲み物が席に出る",
    },
    premier: {
      label: "Eurostar Premier",
      exchange: "出発の2日後まで無料",
      refund: "出発の2日後まで無料",
      luggage: "大きい荷物3個＋小さい手荷物1個",
      meal: "食事と飲み物、ラウンジ",
    },
  },

  /** ロンドン発着の路線で持ち込める荷物の最大の辺。 */
  luggageMaxCm: 85,
  /** 液体の量の制限はない(飛行機の100ml規則は無関係)。 */
  liquidsRestricted: false,

  /**
   * Eurostar Snap。直前に、午前か午後かだけ選んで安く買う券。
   * 列車は48時間前までに決まって知らされる。変更・払い戻し不可。
   */
  snap: {
    trainAssignedHoursBefore: 48,
    refundable: false,
  },

  /** ロンドン→ディズニーランド・パリの直通。2023年6月に廃止。 */
  disneylandDirectEnded: "2023年6月",
} as const;

/* -----------------------------------------------------
   EU の入国制度(EES・ETIAS)
   出典: European Commission(Home Affairs)/ travel-europe.europa.eu

   日本のパスポートも英国のパスポートも「第三国」扱いで、両方の対象。
   ロンドン在住の日本人も対象から外れない(EU 加盟国の在留許可を
   持つ人だけが外れる)。
----------------------------------------------------- */

export const EU_BORDER = {
  ees: {
    /** 段階的な運用開始。 */
    startedOn: "2025-10-12",
    /** 全面運用。この日でパスポートへのスタンプが廃止された。 */
    fullFrom: "2026-04-10",
    /** 指紋を取らない年齢(この年齢未満)。顔写真は取る。 */
    noFingerprintsUnder: 12,
    /** 記録の保存期間。この間は次の入国が速い。 */
    retentionYears: 3,
    /** シェンゲン圏に滞在できる日数(180日間のうち)。 */
    maxDays: 90,
    windowDays: 180,
  },
  etias: {
    /**
     * 開始日。未定のあいだは null。
     * 2026年第4四半期の予定が2026年7月に EU の公式ページから消え、
     * 2026年10月時点で新しい日付は出ていない。
     */
    startsOn: null as string | null,
    status: "2026年中の開始は見送られ、開始日は未発表",
    /** 開始後の申請料(ユーロ)。 */
    feeEur: 20,
    /** 有効期間。パスポートの期限が先に来ればそこまで。 */
    validYears: 3,
  },
  /** シェンゲン圏に入るときのパスポートの条件。 */
  passport: {
    /** 出国予定日から何か月以上の残りが要るか。 */
    validMonthsAfterExit: 3,
    /** 発行から何年以内か。 */
    issuedWithinYears: 10,
  },
} as const;

/* -----------------------------------------------------
   パリ側
   出典: Île-de-France Mobilités / 各施設の公式

   金額はユーロ。円やポンドに換算しない(為替で毎日ずれる)。
----------------------------------------------------- */

export const PARIS = {
  /** パリはロンドンより1時間進んでいる。夏時間の切り替え日は同じ。 */
  timeDifferenceHours: 1,
  transport: {
    /** Ticket Métro-Train-RER(1回券)。2026年1月1日改定。 */
    metroTicket: 2.55,
    /** IC カード Navigo Easy の発行料。 */
    navigoEasyCard: 2,
    /**
     * メトロの改札でクレジットカードのタッチ決済が使えるようになる時期。
     * 2026年6月にオルリー空港駅で先行導入、メトロは2027年から路線ごとに、
     * 全線は2030年の予定。
     */
    contactlessOnMetroFrom: "2027年から順次",
  },
  /** パリの宿泊税(1泊・大人1人)。2026年1月1日から。 */
  touristTax: {
    threeStar: 5.53,
    fourStar: 8.45,
  },
  admissions: {
    louvre: {
      /** EEA 以外の国籍・居住者。日本と英国はこちら。2026年1月14日から。 */
      nonEea: 32,
      eea: 22,
      closedDay: "火曜",
      official: "https://www.louvre.fr/en/visit/hours-admission",
    },
    eiffelTower: {
      summitByLift: 36.7,
      secondFloorByLift: 23.5,
      official: "https://www.toureiffel.paris/en/rates-opening-times",
    },
    notreDame: {
      /** 入場は無料。時間枠の予約(無料)は2日前から当日まで取れる。 */
      free: true,
      official: "https://www.notredamedeparis.fr/en/visit/reservation-free/",
    },
  },
} as const;

/** ユーロの表示。端数があるときだけ小数第2位まで出す(€36.70、€32)。 */
export function eur(amount: number): string {
  const hasFraction = !Number.isInteger(amount);
  return `€${amount.toFixed(hasFraction ? 2 : 0)}`;
}

/** 分を「2時間16分」にする。 */
export function hoursMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}時間` : `${h}時間${m}分`;
}

/* -----------------------------------------------------
   出典
----------------------------------------------------- */

export const EUROSTAR_SOURCES = [
  {
    label: "Eurostar – When to arrive at the station（駅に着く時刻と締切）",
    url: "https://www.eurostar.com/uk-en/travel-info/your-trip/check-in",
  },
  {
    label: "Eurostar Help Centre – 3つのクラスの特徴と変更・払い戻し条件",
    url: "https://help.eurostar.com/faq/uk-en/question/What-are-the-features-and-ticket-conditions-of-the-three-travel-classes",
  },
  {
    label: "Eurostar Help Centre – 発売開始の時期",
    url: "https://help.eurostar.com/faq/us-en/question/How-far-in-advance-can-I-book-Eurostar-tickets",
  },
  {
    label: "Eurostar Help Centre – EU の Entry/Exit System（EES）",
    url: "https://help.eurostar.com/faq/us-en/question/What-s-the-EU-s-Entry-Exit-System-EES",
  },
  {
    label: "Eurostar – 荷物の規定",
    url: "https://www.eurostar.com/uk-en/travel-info/travel-planning/luggage",
  },
  {
    label: "Eurostar – 時刻表（セント・パンクラス → パリ北駅）",
    url: "https://www.eurostar.com/us-en/travel-info/timetable/7015400/8727100/london-st-pancras-intl/paris-gare-du-nord",
  },
  {
    label: "European Commission – Entry/Exit System（全面運用とスタンプの廃止）",
    url: "https://home-affairs.ec.europa.eu/policies/schengen/smart-borders/entry-exit-system_en",
  },
  {
    label: "Travel to Europe – EES の FAQ（指紋の年齢・保存期間）",
    url: "https://travel-europe.europa.eu/en/ees/faq",
  },
  {
    label: "Travel to Europe – ETIAS（公式）",
    url: "https://travel-europe.europa.eu/etias_en",
  },
  {
    label: "Île-de-France Mobilités – 2026年の運賃",
    url: "https://www.iledefrance-mobilites.fr/tarifs-titre-de-transport-en-commun-2026",
  },
  {
    label: "Paris je t'aime（パリ観光局）– パリの宿泊税",
    url: "https://parisjetaime.com/professionnels/article/hebergements-taxe-de-sejour-a-paris-a1192",
  },
];

/**
 * トラブル対応の連絡先・期限・手数料を一元管理する。
 *
 * なぜ定数にするか:
 * このセクションは「電話番号を1つ間違えると読者が困る」種類の情報を扱う。
 * 999 と 101 と 159 の使い分けが本文にべた書きされていると、番号が変わったとき
 * (あるいは書き間違えたとき)に全記事を grep して回ることになる。
 *
 * 運用ルール:
 * 1. 記事から番号・期限・金額を書くときは必ずここを参照する。
 * 2. 手数料は改定されるので、金額そのものより「どこで確認するか」を優先して書く。
 *    確定値を書けないものは意図的に数値を持たせていない(下の EMBASSY を参照)。
 * 3. 出典は TROUBLE_SOURCES に持つ。裏取りせずに書き換えないこと。
 *
 * 2026年8月14日に met.police.uk・tfl.gov.uk・stopscamsuk.org.uk・
 * actionfraud.police.uk・uk.emb-japan.go.jp で確認。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const TROUBLE_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const TROUBLE_UPDATED_AT = "2026-08-14";

/**
 * 緊急連絡先。
 *
 * 日本語圏で決定的に知られていないのが 101 と 159 の存在。
 * 「盗まれた=999」だと思って通報し、緊急ではないと判断されて
 * 話を聞いてもらえないまま切られる、という経験談が多い。
 * 進行中でない盗難は 101、銀行がらみは 159 が正しい入口になる。
 */
export const EMERGENCY_CONTACTS = {
  /** 生命に関わる緊急時、または犯罪が今まさに進行中のとき。 */
  emergency: "999",
  /** 緊急ではない警察への連絡。すでに終わった盗難の通報はこちら。 */
  nonEmergency: "101",
  /** 聴覚・言語障害のある人向けの緊急連絡(SMS)。事前登録が必要。 */
  emergencySms: "999（emergencySMS 登録が必要）",
  /**
   * 銀行の詐欺窓口に安全につながる短縮番号。
   * 「銀行を名乗る電話」を切ったあと、かけ直す先がこれ。
   * 主要銀行が参加する Stop Scams UK の運営。
   */
  bankFraud: "159",
  /**
   * 詐欺の通報窓口(イングランド・ウェールズ・北アイルランド)。
   *
   * 2025年12月4日に Action Fraud が Report Fraud に置き換わった
   * (2026年1月に一般向け本格稼働)。番号は据え置きで、
   * actionfraud.police.uk は reportfraud.police.uk に転送される。
   * 日本語の情報はまだ「Action Fraud」表記が多いので、
   * 記事側では旧名にも触れて読者が迷わないようにすること。
   */
  reportFraud: "0300 123 2040",
} as const;

/**
 * 詐欺の通報窓口。名称が変わったばかりなので、別立てで持つ。
 *
 * スコットランドだけ管轄が違う(Police Scotland の 101)。
 * ここを混ぜると通報先を間違えるため、必ず分けて書くこと。
 */
export const FRAUD_REPORTING = {
  /** 現行の名称。 */
  serviceName: "Report Fraud",
  /** 旧称。検索でこちらに当たる読者が多いので併記する。 */
  formerName: "Action Fraud",
  /** 置き換わった日。 */
  replacedOn: "2025年12月4日",
  url: "https://www.reportfraud.police.uk/",
  /** 運営主体。 */
  operator: "City of London Police",
  /** 対象地域。スコットランドは含まれない。 */
  coverage: "イングランド・ウェールズ・北アイルランド",
  /** スコットランドの通報先。 */
  scotland: "Police Scotland（101）",
} as const;

/**
 * 詐欺被害の返金ルール。
 *
 * 2024年10月7日から、だまされて自分で送金した被害(APP詐欺)にも
 * 銀行の返金義務が課された。これは日本の制度にない考え方で、
 * 「自分で振り込んだのだから諦めるしかない」と思い込む読者が多い。
 * 金額と期限が制度で決まっているので、必ず数値で示すこと。
 */
export const FRAUD_REIMBURSEMENT = {
  /** 強制返金制度の開始日。これ以降の取引が対象。 */
  mandatoryFrom: "2024年10月7日",
  /** APP詐欺の返金上限。 */
  appMaxGbp: 85000,
  /** 銀行が返金すべき期限(営業日)。調査が要る場合は延びる。 */
  appRefundWorkingDays: 5,
  /** 調査が長引いた場合の上限(営業日)。 */
  appRefundMaxWorkingDays: 35,
  /** 銀行が差し引ける自己負担額の上限。 */
  appExcessGbp: 100,
  /** 身に覚えのない引き落とし(不正利用)を申し出られる期限。 */
  unauthorisedClaimMonths: 13,
  /** カードの紛失・盗難時に負担しうる上限。 */
  unauthorisedLiabilityGbp: 35,
  /** クレジットカードの Section 75 が使える下限額。 */
  section75MinGbp: 100,
} as const;

/**
 * 警察への届出。
 *
 * crime reference number がこのセクション全体の背骨になる。
 * 保険請求・大使館での渡航書申請・携帯会社への申告が、すべてこの番号を
 * 前提に動く。「警察に行っても物は戻らない」と考えて届出を省くと、
 * あとの手続きが全部止まるという因果を記事側で必ず示すこと。
 */
export const POLICE_REPORT = {
  /** 盗難のオンライン通報窓口(ロンドン警視庁)。 */
  metOnlineUrl: "https://www.met.police.uk/ro/report/ocr/af/how-to-report-a-crime/",
  /** 落とし物(犯罪ではないもの)の届出窓口。 */
  metLostPropertyUrl:
    "https://www.met.police.uk/ro/report/lp/lost-or-found-property/",
  /** オンライン通報後、警察から連絡が来るまでの目安。 */
  responseHours: 24,
  /** 通報にかかる費用。無料であることを明示する必要がある(有料と誤解されがち)。 */
  cost: "無料",
} as const;

/**
 * TfL の遺失物センター。
 *
 * 地下鉄・バス・DLR・Overground・Elizabeth line・ブラックキャブが対象。
 * ミニキャブ(Uber等)と National Rail は対象外で、事業者ごとに窓口が違う。
 * ここを混同すると探す場所そのものを間違えるので、記事で必ず切り分ける。
 */
export const TFL_LOST_PROPERTY = {
  /** 問い合わせ窓口(NotLost)。 */
  enquiryUrl: "https://notlostenquiry.com/tfl/",
  /** 案内ページ。 */
  helpUrl: "https://tfl.gov.uk/help-and-contact/lost-property",
  /** 照会の回答までにかかる日数の上限。繁忙期はさらに延びる。 */
  reviewDays: 15,
  /** 保管期間。これを過ぎると処分・寄付に回る。 */
  holdMonths: 3,
  /** 現金だけは例外的に長く請求できる。 */
  cashClaimMonths: 12,
  /** バスで落とした直後に、まず問い合わせるべき先。 */
  busDirectContactDays: 3,
  /** 受け取りは要予約。飛び込みでは受け取れない。 */
  collectionByAppointment: true,
} as const;

/**
 * 在英国日本国大使館(領事班)。
 *
 * 手数料は年度ごとに改定され(4月1日)、為替レートでも変動するため、
 * 金額を定数として持たない。記事側では「大使館の手数料ページで確認する」
 * と書き、リンクを出すこと。古い金額を断定するほうが読者の実害が大きい。
 */
export const EMBASSY = {
  name: "在英国日本国大使館",
  /** 領事班の代表番号。 */
  phone: "020-7465-6565",
  address: "101-104 Piccadilly, London W1J 7JT",
  /** 窓口受付時間(月〜金)。祝日は閉館。 */
  hours: "09:30〜16:30",
  passportUrl: "https://www.uk.emb-japan.go.jp/itpr_ja/index_000032.html",
  feeUrl: "https://www.uk.emb-japan.go.jp/itpr_ja/index_000056.html",
  emergencyUrl: "https://www.uk.emb-japan.go.jp/itpr_ja/kinkyu.html",
  /** 手数料の改定日。金額を書かない代わりに、改定があることは伝える。 */
  feeRevision: "毎年4月1日",
} as const;

/**
 * 「帰国のための渡航書」の必要書類。
 *
 * 警察の届出証明が要る点が、このセクションの因果の要。
 * パスポートを盗まれた人がまず警察に行く理由がここにある。
 */
export const TRAVEL_DOCUMENT_REQUIREMENTS = [
  "紛失一般旅券等届出書",
  "渡航書発給申請書",
  "写真2葉（4.5cm×3.5cm）",
  "警察の届出証明（crime reference number）",
  "日本国籍と身元を確認できるもの（戸籍謄本など）",
  "帰国便の予約が分かるもの",
] as const;

/**
 * 大使館・総領事館ができること／できないこと。
 *
 * 期待値の調整がこのセクションで最も効く場所。
 * 「大使館に行けばなんとかしてくれる」と思って行き、
 * 何もしてもらえなかったと感じて帰る、という落差が実際に起きている。
 * できないことを先に、理由とセットで示すほうが結果的に頼りになる。
 *
 * 外務省・各在外公館が公表している「できること・できないこと」に準拠。
 */
export const CONSULAR_SUPPORT = {
  can: [
    "パスポートの発給・再発給、帰国のための渡航書の発給",
    "各種証明書（在留証明・署名証明など）の発給",
    "事件・事故に遭ったときの相談、現地当局への照会",
    "弁護士・通訳・病院のリスト（情報）の提供",
    "逮捕・拘禁された場合の領事面会、家族への連絡の仲介",
    "家族・知人への連絡の仲介（所持金を失ったときなど）",
    "災害・事故時の安否確認と情報提供",
  ],
  cannot: [
    "弁護士費用・保釈金・訴訟費用の負担や貸付、その保証",
    "取り調べや裁判での通訳・翻訳",
    "金銭の一般的な貸与・給付（帰国旅費の貸与は例外的な最後の手段）",
    "犯罪捜査、犯人の逮捕、事件の捜査への介入",
    "医療行為、病院への入院手続きの代行",
    "身元保証人になること、住居や仕事の斡旋",
    "相手方との示談交渉や、法的な代理",
  ],
} as const;

/** ポンド表記。小数以下が .00 のときは省く。 */
export function gbp(value: number) {
  return `£${value.toFixed(2).replace(/\.00$/, "")}`;
}

/** 千の位区切り付きのポンド表記。返金上限のような大きい額に使う。 */
export function gbpLarge(value: number) {
  return `£${value.toLocaleString("en-GB")}`;
}

/**
 * 出典。記事の GuideSources に渡す。
 * 番号や期限を更新するときは、必ずこのリストを開いて裏を取ること。
 */
export const TROUBLE_SOURCES = [
  {
    label: "Metropolitan Police - Report a crime",
    url: "https://www.met.police.uk/ro/report/ocr/af/how-to-report-a-crime/",
  },
  {
    label: "Metropolitan Police - Report lost or found property",
    url: "https://www.met.police.uk/ro/report/lp/lost-or-found-property/",
  },
  {
    label: "Transport for London - Lost property",
    url: "https://tfl.gov.uk/help-and-contact/lost-property",
  },
  {
    label: "Stop Scams UK - STOP, HANG UP, CALL 159",
    url: "https://stopscamsuk.org.uk/campaign/get-help-now/",
  },
  {
    label: "Report Fraud - UK's home for reporting cyber crime & fraud",
    url: "https://www.reportfraud.police.uk/",
  },
  {
    label: "City of London Police - Report Fraud launches",
    url: "https://www.cityoflondon.police.uk/news/city-of-london/news/2026/january/report-fraud-launches/",
  },
  {
    label: "FCA - Fraudulent payments（返金ルール）",
    url: "https://www.fca.org.uk/consumers/fraudulent-payments",
  },
  {
    label: "外務省 - 海外安全ホームページ",
    url: "https://www.anzen.mofa.go.jp/",
  },
  {
    label: "在英国日本国大使館 - 旅券（パスポート）",
    url: "https://www.uk.emb-japan.go.jp/itpr_ja/index_000032.html",
  },
  {
    label: "在英国日本国大使館 - 緊急連絡先",
    url: "https://www.uk.emb-japan.go.jp/itpr_ja/kinkyu.html",
  },
] as const;

/**
 * 英国の銀行口座・送金・National Insurance number に関わる数値を一元管理する。
 *
 * なぜ定数にするか:
 * 送金手数料と為替マージンは事業者側の都合で予告なく変わり、口座開設の
 * 必要書類も eVisa 移行のような制度変更で動く。記事本文にべた書きすると
 * 追随できず、しかも金の話なので間違いがそのまま読者の損になる。
 *
 * 運用ルール:
 * 1. 記事から数値を書くときは必ずここを参照する。
 * 2. 改定時はこのファイルと MONEY_AS_OF / MONEY_UPDATED_AT だけを更新する。
 * 3. 手数料率は事業者の公表値。為替レートは変動するので「率」だけを持ち、
 *    「¥300,000 送ると何円」のような実額は記事側で計算例として書かない。
 * 4. 特定の事業者を勧める記事にはしない。構造(なぜアプリ銀行が通るのか)を
 *    書き、事業者は「その構造の代表例」として出す。
 *
 * 2026年8月13日に各社の公表資料と gov.uk で確認。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const MONEY_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const MONEY_UPDATED_AT = "2026-08-13";

/**
 * 銀行の分類。
 *
 * 渡英直後の口座開設が詰まる原因はただ一つ、「住所証明(proof of address)」。
 * 高街銀行は住所証明を要求し、住所証明は銀行の明細で出すのが一般的なので、
 * 卵と鶏の循環に入る。アプリ銀行はこの要求をパスポート＋自撮り＋
 * eVisa シェアコードの本人確認で置き換えたので、循環を断てる。
 *
 * つまり「審査が通りやすい銀行」の正体は信用スコアではなく、
 * 住所証明を要求するかどうかである。
 */
export type BankKind = "app" | "highStreet";

export const BANK_KIND_LABELS: Record<BankKind, string> = {
  app: "アプリ銀行",
  highStreet: "高街銀行(店舗型)",
};

export type BankProfile = {
  name: string;
  kind: BankKind;
  /** 英国の預金保護(FSCS)対象か。Revolut は電子マネー機関なので扱いが違う。 */
  fscsProtected: boolean;
  /** 住所証明なしで開設まで到達できるか。渡英直後の可否を分ける最大の分岐。 */
  worksWithoutProofOfAddress: boolean;
  /** 開設までの目安。 */
  openingTime: string;
  /** この銀行を選ぶ理由と、選ばない理由。断定調で短く。 */
  note: string;
};

/**
 * 渡英直後に現実的な選択肢。
 *
 * 並び順は「渡英直後の通りやすさ」順。Monzo が先頭なのは、
 * 住所証明が要らず FSCS 保護もある組み合わせで、かつ英国内の
 * 家賃・給与の受け取りにそのまま使えるため。
 */
export const BANKS: BankProfile[] = [
  {
    name: "Monzo",
    kind: "app",
    fscsProtected: true,
    worksWithoutProofOfAddress: true,
    openingTime: "数分〜数日",
    note: "英国の銀行免許を持ち、預金は£85,000まで保護されます。住所証明が要らず、給与振込にも家賃の引き落としにも使えるので、渡英直後の1本目として最も無難です。",
  },
  {
    name: "Starling Bank",
    kind: "app",
    fscsProtected: true,
    worksWithoutProofOfAddress: true,
    openingTime: "数分〜数日",
    note: "Monzo とほぼ同格。海外送金が Starling 内で完結する点と、実店舗を持たないぶん手数料が薄い点が強みです。どちらか一方で構いません。",
  },
  {
    name: "Revolut",
    kind: "app",
    fscsProtected: true,
    worksWithoutProofOfAddress: true,
    openingTime: "数分",
    note: "渡英前に日本にいる間から開設でき、多通貨をそのまま持てます。ただし英国の銀行免許で運営される口座かどうかはプラン・時期で変わるため、給与の受け取り先は Monzo か Starling に置くほうが確実です。",
  },
  {
    name: "HSBC / Lloyds / Barclays / NatWest",
    kind: "highStreet",
    fscsProtected: true,
    worksWithoutProofOfAddress: false,
    openingTime: "予約から2〜4週間",
    note: "住所証明を求められるため、渡英直後は詰まります。支店予約が数週間先になることも多い。住宅ローンや長期の信用実績が要る段階になってから、2本目として作る順番が現実的です。",
  },
];

/**
 * 住所証明として通りやすい書類。
 *
 * 銀行の公表リストは広いが、渡英直後に実際に手に入るものは限られる。
 * 「手に入る順」に並べる。
 */
export const PROOF_OF_ADDRESS_OPTIONS = [
  "大学・語学学校が発行する在籍証明(住所入り)",
  "雇用主が発行する在職証明(住所入り)",
  "賃貸契約書(tenancy agreement)",
  "council tax の通知書",
  "光熱費の請求書(自分名義のもの)",
  "GP 登録の完了通知",
] as const;

/**
 * 日本↔英国の送金手段。
 *
 * 銀行の国際送金(SWIFT)が高いのは手数料だけでなく為替マージンのため。
 * 「手数料無料」を掲げる事業者ほどマージンで取る構造を、記事で説明する。
 */
export type TransferService = {
  name: string;
  /** 手数料の考え方。率か固定か。 */
  feeModel: string;
  /** 為替レートの扱い。ここが総コストの大半を決める。 */
  rateModel: string;
  /** 着金の目安。 */
  speed: string;
  note: string;
};

export const TRANSFER_SERVICES: TransferService[] = [
  {
    name: "Wise",
    feeModel: "送金額に対しておよそ0.4〜0.6%",
    rateModel: "実勢レート(ミッドマーケットレート)。上乗せなし。",
    speed: "同日〜翌営業日",
    note: "レートに上乗せがないぶん総額が読めます。曜日による差もありません。日本↔英国では基準にしてよい選択肢です。",
  },
  {
    name: "Revolut",
    feeModel: "プランごとの無料枠あり。超過分に手数料。",
    rateModel: "平日は実勢レートに近いが、土日は1%前後の上乗せ。",
    speed: "数分〜翌営業日",
    note: "平日に無料枠の範囲で送るなら安い。週末に送ると上乗せぶん確実に損をするので、送金は平日に寄せてください。",
  },
  {
    name: "銀行の国際送金(SWIFT)",
    feeModel: "1件あたり数千円の固定手数料＋中継銀行手数料",
    rateModel: "実勢レートに2〜3%前後の上乗せ",
    speed: "2〜5営業日",
    note: "手数料より為替の上乗せのほうが高くつきます。少額では選ぶ理由がありません。大金を確実な記録付きで送る場合だけ検討対象になります。",
  },
];

/** 週末に Revolut で送ると上乗せされる率(目安)。 */
export const REVOLUT_WEEKEND_MARKUP_PERCENT = 1;

/**
 * National Insurance number(NIN)。
 *
 * 「NIN がないと働けない」は誤解。就労権さえあれば働ける。
 * この誤解のせいで就業開始を遅らせる人が多いので、記事で明確に否定する。
 */
export const NATIONAL_INSURANCE = {
  /** オンライン申請から通知までの目安。 */
  processingWeeks: "2〜6週間",
  /** 混雑期の上振れ。 */
  processingWeeksWorstCase: "16週間",
  /** 申請ページ。 */
  applyUrl: "https://www.gov.uk/apply-national-insurance-number",
  /** NIN がなくても就労権があれば働ける。 */
  canWorkBeforeIssued: true,
} as const;

/** ポンド表記。小数以下が .00 のときは省く。 */
export function gbp(value: number) {
  return `£${value.toFixed(2).replace(/\.00$/, "")}`;
}

/** 住所証明なしで開設まで行ける銀行だけを返す。 */
export function banksWithoutProofOfAddress() {
  return BANKS.filter((b) => b.worksWithoutProofOfAddress);
}

/**
 * 出典。記事の GuideSources に渡す。
 * 手数料は事業者が予告なく変えるため、更新時は必ず一次情報を開くこと。
 */
export const MONEY_SOURCES = [
  {
    label: "GOV.UK - Apply for a National Insurance number",
    url: "https://www.gov.uk/apply-national-insurance-number",
  },
  {
    label: "FSCS - Check your money is protected",
    url: "https://www.fscs.org.uk/check/check-your-money-is-protected/",
  },
  {
    label: "Wise - Pricing",
    url: "https://wise.com/gb/pricing/",
  },
  {
    label: "Revolut - Fees",
    url: "https://www.revolut.com/legal/fees/",
  },
  {
    label: "Monzo - Opening an account",
    url: "https://monzo.com/help/monzo-account-help/open-account/",
  },
  {
    label: "GOV.UK - View and prove your immigration status (eVisa share code)",
    url: "https://www.gov.uk/view-prove-immigration-status",
  },
] as const;

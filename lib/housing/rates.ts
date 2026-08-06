/**
 * 英国(イングランド)の賃貸に関わる金額・上限・施行日を一元管理する。
 *
 * なぜ定数にするか:
 * 2025年10月27日に成立した Renters' Rights Act 2025 が2026年5月1日に施行され、
 * 「AST(定期借家)」「Section 21(無過失立ち退き)」「家賃の複数ヶ月前払い」という、
 * それ以前の日本語の家探し情報がすべて前提にしていた3点が同時に消滅した。
 * 数値と施行日を記事本文にべた書きすると、次の段階施行(PRSデータベース、
 * Decent Homes Standard)のたびに全記事を grep して回ることになり、必ず取りこぼす。
 *
 * 運用ルール:
 * 1. 記事から数値を書くときは必ずここを参照する(`gbp(HOUSING_LIMITS.rentInAdvanceMonths)` の形)。
 * 2. 改定時はこのファイルと HOUSING_AS_OF / HOUSING_UPDATED_AT だけを更新する。
 * 3. 出典は HOUSING_SOURCES に持つ。裏取りせずに数値を書き換えないこと。
 *
 * 金額はすべて GBP。2026年8月6日に gov.uk・legislation.gov.uk・ONS で確認。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const HOUSING_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const HOUSING_UPDATED_AT = "2026-08-06";

/**
 * 制度変更の施行日。
 *
 * 「2026年5月1日より前か後か」で借主の権利がまるごと変わるため、
 * 記事では必ず日付とセットで書く。ネット上の日本語情報の大半は
 * まだ改正前(AST・Section 21 が存在する世界)を前提にしている。
 */
export const HOUSING_KEY_DATES = {
  /** Renters' Rights Act 2025 の国王裁可。 */
  royalAssent: "2025-10-27",
  /**
   * 第1段階施行。既存・新規を問わずすべての assured shorthold tenancy が
   * assured periodic tenancy(期間の定めのない借家)へ自動転換された日。
   * 同時に Section 21 が廃止。
   */
  phase1: "2026-05-01",
  /** 大家が Section 21 通知を有効に出せた最終日。 */
  section21LastDay: "2026-04-30",
  /** 第2段階。PRS データベースと大家オンブズマンへの登録義務が始まる予定。 */
  phase2From: "2026年後半",
  /** 第3段階。Decent Homes Standard と Awaab's Law の民間賃貸への適用。 */
  phase3From: "2027年以降",
  /** Tenant Fees Act 2019 の施行日(手数料禁止・holding deposit 上限)。 */
  tenantFeesAct: "2019-06-01",
} as const;

/**
 * 借主が払ってよい金額の上限。
 *
 * ここを超える請求はすべて Tenant Fees Act 2019 上の prohibited payment
 * (禁止された支払い)であり、支払っても返還を請求できる。
 */
export const HOUSING_LIMITS = {
  /** 物件を押さえるための holding deposit。上限1週間分の家賃。 */
  holdingDepositWeeks: 1,
  /** holding deposit を大家・エージェントが保持できる日数(deadline for agreement)。 */
  holdingDepositMaxDays: 15,
  /** 契約成立時に holding deposit を返金・充当すべき日数。 */
  holdingDepositRefundDays: 7,

  /** 敷金(tenancy deposit)。年間家賃が閾値未満なら5週間分。 */
  depositWeeksUnderThreshold: 5,
  /** 年間家賃が閾値以上なら6週間分。 */
  depositWeeksOverThreshold: 6,
  /** 上記が切り替わる年間家賃。 */
  depositThresholdAnnualRent: 50000,
  /** 敷金を保護スキームに預託すべき期限(日数)。 */
  depositProtectionDays: 30,

  /**
   * 前払い家賃の上限(ヶ月)。2026年5月1日から。
   * 署名前の請求自体が違法で、署名後に請求できるのも1ヶ月分まで。
   */
  rentInAdvanceMonths: 1,

  /** 借主が退去を通知する期間(ヶ月)。家賃支払日以前に書面で。 */
  tenantNoticeMonths: 2,
  /** 大家が明け渡しを求める場合の標準的な通知期間(ヶ月)。事由により短縮あり。 */
  landlordNoticeMonths: 4,
  /** 家賃の値上げ通知に必要な期間(ヶ月)。値上げは年1回まで。 */
  rentIncreaseNoticeMonths: 2,
} as const;

/**
 * 違反した大家・エージェントに科される民事制裁金の上限。
 *
 * 借主が直接受け取る金ではないが、「通報すると相手にいくら効くのか」を
 * 知っているかどうかで交渉の姿勢が変わるため記事に出す。
 */
export const HOUSING_PENALTIES = {
  /** 前払い家賃の上限超過。 */
  rentInAdvance: 5000,
  /** 入札(募集価格超の受け入れ)、差別、データベース未登録など。 */
  standard: 7000,
  /** 重大・反復違反。刑事訴追に代えて科される。 */
  serious: 40000,
  /** 敷金を未保護のまま放置した場合、借主が請求できる賠償(敷金の倍率)。 */
  depositCompensationMin: 1,
  depositCompensationMax: 3,
} as const;

/**
 * 相場。読者が「提示された家賃が高いのか安いのか」を判断する基準線。
 *
 * 一棟まるごと借りる場合は ONS、部屋単位のシェアは SpareRoom を使う。
 * この2つは母集団が違うので混ぜて比較しないこと。
 */
export const LONDON_RENT = {
  /** グレーターロンドンの平均月額家賃(全物件・ONS、2026年上半期)。 */
  onsGreaterLondonMonthly: 2290,
  /** インナーロンドンのシェア1部屋あたり平均月額(SpareRoom、2026年Q2)。 */
  roomInnerLondonMonthly: 979,
  /** アウターロンドンのシェア1部屋あたり平均月額(同上)。 */
  roomOuterLondonMonthly: 794,
  /** グレーターロンドン全体のシェア1部屋あたり平均月額(同上)。 */
  roomGreaterLondonMonthly: 915,
} as const;

/**
 * 月額 Travelcard の料金（大人・2026年4月改定）。
 *
 * 家賃だけを比べて外側のゾーンを選ぶと、定期代の差で逆転することがある。
 * 「家賃＋交通費」で比較させるために、記事から必ずこの値を参照する。
 */
export const TRAVELCARD_MONTHLY = {
  zone1to2: 171.7,
  zone1to3: 201.6,
  zone1to4: 246.6,
  zone1to5: 293.4,
  zone1to6: 313.4,
} as const;

/**
 * 出典。記事の GuideSources に出す。
 * 数値を書き換えるときは、必ずここのURLを開いて確認してから行う。
 */
export const HOUSING_SOURCES = [
  {
    label: "GOV.UK - Renters' Rights Act: overview for tenants",
    url: "https://www.gov.uk/guidance/renters-rights-act-overview-for-tenants",
  },
  {
    label: "GOV.UK - Guide to the Renters' Rights Act",
    url: "https://www.gov.uk/government/publications/guide-to-the-renters-rights-act/guide-to-the-renters-rights-act",
  },
  {
    label: "legislation.gov.uk - Renters' Rights Act 2025",
    url: "https://www.legislation.gov.uk/ukpga/2025/26/contents",
  },
  {
    label: "legislation.gov.uk - Tenant Fees Act 2019 Schedule 1",
    url: "https://www.legislation.gov.uk/ukpga/2019/4/schedule/1",
  },
  {
    label: "GOV.UK - Tenancy deposit protection",
    url: "https://www.gov.uk/tenancy-deposit-protection",
  },
  {
    label: "Shelter England - 借主の権利に関する法情報",
    url: "https://england.shelter.org.uk/professional_resources/legal",
  },
  {
    label: "ONS - Private rent and house prices, UK",
    url: "https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/privaterentandhousepricesuk/july2026",
  },
  {
    label: "SpareRoom - UK Rental Index",
    url: "https://www.spareroom.co.uk/content/info-landlords/rentalindex/",
  },
  {
    label: "Transport for London - Adult fares and Travelcard prices",
    url: "https://tfl.gov.uk/fares/find-fares",
  },
] as const;

/** 週家賃から敷金上限を計算する。年間家賃で5週/6週が切り替わる。 */
export function depositCapWeeks(monthlyRent: number): number {
  const annual = monthlyRent * 12;
  return annual >= HOUSING_LIMITS.depositThresholdAnnualRent
    ? HOUSING_LIMITS.depositWeeksOverThreshold
    : HOUSING_LIMITS.depositWeeksUnderThreshold;
}

/**
 * 月額家賃から敷金上限額(£)を出す。
 *
 * 英国の「週いくら」は月額 × 12 ÷ 52 で求める。
 * 月額 ÷ 4 で計算すると必ず過大になり、大家の過大請求を見逃す。
 */
export function depositCapAmount(monthlyRent: number): number {
  const weekly = (monthlyRent * 12) / 52;
  return Math.round(weekly * depositCapWeeks(monthlyRent));
}

/** 月額家賃から holding deposit の上限額(£)を出す。 */
export function holdingDepositCap(monthlyRent: number): number {
  return Math.round(((monthlyRent * 12) / 52) * HOUSING_LIMITS.holdingDepositWeeks);
}

/** 数値を記事本文に埋めるためのフォーマッタ。 */
export function gbp(amount: number): string {
  const hasFraction = !Number.isInteger(amount);
  return `£${amount.toLocaleString("en-GB", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** ISO日付("2026-05-01")を和文表記("2026年5月1日")にする。 */
export function jpDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

import type { HousingGuideArticle } from "../types";
import {
  HOUSING_AS_OF,
  HOUSING_KEY_DATES,
  HOUSING_LIMITS,
  HOUSING_PENALTIES,
  HOUSING_SOURCES,
  HOUSING_UPDATED_AT,
  LONDON_RENT,
  depositCapAmount,
  gbp,
  holdingDepositCap,
  jpDate,
} from "@/lib/housing/rates";

/** 記事中の計算例に使う家賃。ロンドンのシェア1部屋の実勢に近い値を選ぶ。 */
const EXAMPLE_RENT = 1000;

const depositsAndFees: HousingGuideArticle = {
  slug: "deposits-and-fees",
  title: "ロンドン賃貸の初期費用｜敷金の上限と、法律で禁止された手数料",
  engTitle: "Deposits, Holding Deposits and Banned Fees in England",
  audience: "見積もりを提示されて、この金額が正当なのか判断したい人",
  summary: `英国の賃貸では、借主が払ってよい金額が法律で厳密に決まっています。敷金は上限${
    HOUSING_LIMITS.depositWeeksUnderThreshold
  }週間分、holding depositは${
    HOUSING_LIMITS.holdingDepositWeeks
  }週間分、前払い家賃は${
    HOUSING_LIMITS.rentInAdvanceMonths
  }ヶ月分まで。そして契約手数料・更新料・内見料・referencing費用は**すべて違法**です。払ってしまった分も取り戻せます。`,
  description:
    "英国Tenant Fees Act 2019とRenters' Rights Actにもとづく賃貸初期費用の上限を解説。敷金5週間分、holding deposit 1週間分、前払い家賃1ヶ月分の根拠と、違法な手数料を請求されたときの返還請求の手順。",
  keywords: [
    "イギリス 賃貸 初期費用",
    "ロンドン 敷金",
    "holding deposit",
    "Tenant Fees Act 2019",
    "tenancy deposit scheme",
    "デポジット 返還",
    "違法 手数料 賃貸",
    "前払い家賃",
  ],
  dataAsOf: HOUSING_AS_OF,
  updatedAt: HOUSING_UPDATED_AT,
  atAGlance: [
    {
      label: "敷金の上限",
      value: `年間家賃${gbp(50000)}未満なら${
        HOUSING_LIMITS.depositWeeksUnderThreshold
      }週間分、以上なら${HOUSING_LIMITS.depositWeeksOverThreshold}週間分`,
    },
    {
      label: "holding deposit",
      value: `${HOUSING_LIMITS.holdingDepositWeeks}週間分まで`,
    },
    {
      label: "前払い家賃",
      value: `${HOUSING_LIMITS.rentInAdvanceMonths}ヶ月分まで（${jpDate(
        HOUSING_KEY_DATES.phase1
      )}〜）`,
    },
    {
      label: "契約・更新・内見の手数料",
      value: "全額違法。請求されたら支払う義務はない",
    },
    {
      label: "月£1,000の部屋の初期費用",
      value: `敷金${gbp(depositCapAmount(EXAMPLE_RENT))}＋初月家賃${gbp(
        EXAMPLE_RENT
      )}＝${gbp(depositCapAmount(EXAMPLE_RENT) + EXAMPLE_RENT)}程度`,
    },
  ],
  mainText: `日本の賃貸では、礼金・仲介手数料・鍵交換代・消毒代といった名目で、家賃の4〜6ヶ月分が初期費用として消えるのが普通です。その感覚のまま英国に来ると、**エージェントに言われるまま違法な請求を払ってしまいます**。

英国（イングランド）では ${jpDate(
    HOUSING_KEY_DATES.tenantFeesAct
  )} 施行の **Tenant Fees Act 2019** によって、借主から取ってよい金の種類が法律で列挙されました。リストに載っていない請求はすべて「prohibited payment（禁止された支払い）」であり、**払ってしまっても返還を請求できます**。

さらに ${jpDate(
    HOUSING_KEY_DATES.phase1
  )} からは Renters' Rights Act により、前払い家賃の上限も加わりました。この記事では、正当な請求と違法な請求の線引きを、金額の根拠とともに整理します。`,
  sections: [
    {
      id: "allowed-payments",
      title: "払ってよい金は、この5種類しかない",
      subtitle: "リストにないものはすべて違法",
      body: `法律が認めている借主からの徴収は、実質的に次のものだけです。

| 名目 | 上限 | いつ払うか |
| --- | --- | --- |
| 家賃（rent） | 上限なし（募集価格を超える受け入れは禁止） | 毎月 |
| Holding deposit | **${HOUSING_LIMITS.holdingDepositWeeks}週間分** | 物件を押さえるとき |
| Tenancy deposit（敷金） | **${HOUSING_LIMITS.depositWeeksUnderThreshold}週間分**（年間家賃${gbp(
        50000
      )}以上なら${HOUSING_LIMITS.depositWeeksOverThreshold}週間分） | 契約時 |
| 前払い家賃 | **${HOUSING_LIMITS.rentInAdvanceMonths}ヶ月分**まで | 契約署名**後** |
| 光熱費・council tax・通信費 | 実費 | 契約による |

このほか、**借主の落ち度で発生した費用**（鍵の紛失による交換、家賃の滞納利息、借主都合の契約変更手数料£50まで）は請求できますが、いずれも実費相当に限られます。

### 逆に、これらはすべて違法です

- 契約手数料（tenancy agreement fee / admin fee）
- **referencing 費用**（信用調査は大家の負担）
- 内見料（viewing fee）
- **更新料（renewal fee）**
- インベントリー作成費（inventory fee）
- 保証人の審査費用（guarantor referencing fee）
- 「事務手数料」「書類作成費」などの名目一切
- エージェントへの謝礼・紹介料

日本の仲介手数料に相当するものは、**英国では存在しません**。エージェントの報酬は大家が払います。あなたに請求してくる時点で違法です。`,
      callout: {
        tone: "warn",
        title: "週割りの計算に注意",
        body: `英国の「週いくら」は、月額を4で割った額ではありません。**月額 × 12 ÷ 52** です。

月£${EXAMPLE_RENT.toLocaleString()}の部屋なら、週あたりは約${gbp(
          Math.round((EXAMPLE_RENT * 12) / 52)
        )}。敷金の上限は${HOUSING_LIMITS.depositWeeksUnderThreshold}週間分なので**${gbp(
          depositCapAmount(EXAMPLE_RENT)
        )}**、holding deposit は**${gbp(holdingDepositCap(EXAMPLE_RENT))}**が上限です。

月額÷4で計算すると週あたりが過大になり、「5週間分」として${gbp(
          Math.round((EXAMPLE_RENT / 4) * 5)
        )}を請求されても気づけません。この差額は毎回あなたの損になります。`,
      },
    },
    {
      id: "holding-deposit",
      title: "Holding deposit ——物件を押さえるための1週間分",
      subtitle: "返ってくる場合と、没収される場合",
      body: `気に入った物件が見つかると、まず holding deposit を求められます。「他の人に回さないよう押さえる」ための金で、上限は**${
        HOUSING_LIMITS.holdingDepositWeeks
      }週間分の家賃**です。

### タイムライン

1. holding deposit を払う
2. 大家・エージェントは**${
        HOUSING_LIMITS.holdingDepositMaxDays
      }日以内**に審査を終えて契約に進む必要がある（deadline for agreement）
3. 契約成立 → **${
        HOUSING_LIMITS.holdingDepositRefundDays
      }日以内**に返金、または初月家賃・敷金へ充当（充当には合意が必要）

### 返ってくる場合

- 大家側が契約を取りやめた
- ${HOUSING_LIMITS.holdingDepositMaxDays}日の期限内に手続きが終わらなかった
- 大家が Right to Rent 上あなたを受け入れられないと判明した
- 契約成立した（返金または充当）

### 没収される場合

- あなたが自分から辞退した
- **申告に虚偽があった**（収入を偽った、職歴を盛ったなど）
- Right to Rent チェックに通らなかった（在留資格がない場合）
- 合理的な努力をせず審査に協力しなかった

つまり、**正直に申告して待っていれば、原則として返ってきます**。逆に、収入や在職状況を大きく盛って referencing で発覚すると、没収の正当な理由になります。

### 実務上の注意

同時に複数の物件へ holding deposit を出すのは避けてください。1件しか契約できない以上、残りは自分都合の辞退となり没収されます。ロンドンの市場は速いので焦りますが、**押さえるのは1件ずつ**が鉄則です。`,
      tips: [
        "支払い前に「これは holding deposit であり、上限は1週間分である」ことをメールで確認してください。文言が残っていれば、後で名目をすり替えられません。",
        "現金で払わないこと。銀行振込にして、振込明細を記録として残します。",
        "15日の期限は当事者間の合意で延長できますが、延長には書面での同意が必要です。「まだ審査中だから」と口頭で引き延ばされたら、期限を確認してください。",
      ],
    },
    {
      id: "tenancy-deposit",
      title: "敷金と保護スキーム ——預けられていなければ最大3倍取り戻せる",
      subtitle: "ここが借主にとって最強の武器になる",
      body: `敷金（tenancy deposit）の上限は、年間家賃が${gbp(50000)}未満なら**${
        HOUSING_LIMITS.depositWeeksUnderThreshold
      }週間分**、${gbp(50000)}以上なら**${
        HOUSING_LIMITS.depositWeeksOverThreshold
      }週間分**です。

そして英国の制度で決定的に重要なのが、**大家が敷金を自分の手元に置いてはいけない**ことです。受け取った敷金は**${
        HOUSING_LIMITS.depositProtectionDays
      }日以内**に、政府認可の保護スキーム（tenancy deposit protection scheme）に預託する義務があります。

### 認可スキームは3つ

- **Deposit Protection Service（DPS）**
- **MyDeposits**
- **Tenancy Deposit Scheme（TDS）**

いずれかに預けられ、あなたには **prescribed information**（どのスキームに、いくら、いつ預けたか）が通知されます。

### 預けられていなかったら

これは大家にとって重大な違反です。借主は裁判所に申し立てて、**敷金額の${
        HOUSING_PENALTIES.depositCompensationMin
      }〜${
        HOUSING_PENALTIES.depositCompensationMax
      }倍の賠償金**を請求できます（敷金そのものの返還とは別に、です）。

月£${EXAMPLE_RENT.toLocaleString()}の部屋で敷金${gbp(
        depositCapAmount(EXAMPLE_RENT)
      )}なら、最大で${gbp(
        depositCapAmount(EXAMPLE_RENT) * HOUSING_PENALTIES.depositCompensationMax
      )}に加えて敷金の返還を求められる計算です。

**入居から30日を過ぎても prescribed information が届かない場合、必ず確認してください。** これは日本人が最も見逃しがちで、かつ最も金額の大きい権利です。

### 自分で確認する方法

3つのスキームはいずれも、ウェブサイトで自分の敷金が保護されているか検索できます。大家に聞かずに確認できるので、入居から1ヶ月経ったら一度調べてください。`,
      callout: {
        tone: "warn",
        title: "lodger の敷金は保護されない",
        body: `保護スキームの義務は assured tenancy に対するものです。**大家と同居する lodger（excluded licence）には適用されません。**

つまり lodger として払った敷金は、法的な保護の外にあります。返還は大家との交渉次第で、応じてもらえなければ少額訴訟（small claims）に持ち込むしかありません。lodger 契約では、**敷金の額を最小限に抑える交渉**が現実的な自衛策になります。契約形態の違いは[契約形態の地図](/housing/tenancy-types)で詳しく扱っています。`,
      },
    },
    {
      id: "rent-in-advance",
      title: "前払い家賃の上限 ——2026年5月に変わった最重要ポイント",
      subtitle: "「半年分前払い」はもう違法",
      body: `${jpDate(
        HOUSING_KEY_DATES.phase1
      )}から、前払い家賃に上限が設けられました。

- **署名前に家賃を請求すること自体が違法**
- 契約に署名した後でも、請求できるのは**${
        HOUSING_LIMITS.rentInAdvanceMonths
      }ヶ月分まで**
- 違反した大家・エージェントには最大**${gbp(
        HOUSING_PENALTIES.rentInAdvance
      )}**の民事制裁金

### なぜこれが日本人にとって重大なのか

改正前、UK に信用情報も保証人もない渡英直後の日本人が物件を借りる際の標準的な突破法が、**「半年分〜1年分の家賃を前払いする」**ことでした。審査に通らない代わりに現金を積む、という取引です。日本語の家探し情報にも「6ヶ月分前払いを提案すれば通りやすい」と書かれてきました。

**この手は、もう使えません。** 違法だからです。大家が受け入れると言っても、それは大家が制裁金のリスクを負う話であり、あなたが提案すべきことでもありません。

代わりに何をするかは、[審査を通す](/housing/referencing)で詳しく扱います。結論だけ言えば、**保証人サービス（guarantor service）が事実上の必須ルートになりました**。

### 「1ヶ月分」の数え方

初月の家賃を入居前に払うのは正常です。上限に触れるのは、そこにさらに2ヶ月目・3ヶ月目分を上乗せする場合です。契約時に「敷金＋初月家賃」を払うのは適法、「敷金＋6ヶ月分家賃」は違法、という線引きになります。`,
      tips: [
        "エージェントから「外国人の方は6ヶ月分前払いが条件です」と言われたら、それは2026年5月以降は違法な要求です。その場でGOV.UKのガイダンスを示せば引き下がる場合があります。",
        "この規制は、前払いを『申し出る』ことまでは禁じていないという解釈も業界側にはあります。ただし大家が受け取れば大家が制裁対象になるため、提案しても通らない前提で動いてください。",
        "自治体の private housing team（住宅担当部署）が執行機関です。違法な請求を受けたら、物件所在地の自治体に通報できます。",
      ],
    },
    {
      id: "total-cost",
      title: "初期費用の総額を試算する",
      subtitle: "日本の感覚との差",
      body: `具体的に見てみます。ロンドンのシェア1部屋の平均は、インナーロンドンで月${gbp(
        LONDON_RENT.roomInnerLondonMonthly
      )}、アウターロンドンで月${gbp(
        LONDON_RENT.roomOuterLondonMonthly
      )}です（SpareRoom、2026年Q2）。一棟まるごとの平均は月${gbp(
        LONDON_RENT.onsGreaterLondonMonthly
      )}（ONS、2026年上半期）。

**月£${EXAMPLE_RENT.toLocaleString()}の部屋を借りる場合:**

| 項目 | 金額 | 備考 |
| --- | --- | --- |
| Holding deposit | ${gbp(
        holdingDepositCap(EXAMPLE_RENT)
      )} | 契約時に敷金・家賃へ充当されるのが通例 |
| Tenancy deposit | ${gbp(
        depositCapAmount(EXAMPLE_RENT)
      )} | 退去時に返還される |
| 初月家賃 | ${gbp(EXAMPLE_RENT)} | |
| **契約時に必要な現金** | **${gbp(
        depositCapAmount(EXAMPLE_RENT) + EXAMPLE_RENT
      )}** | holding depositは充当されるため二重に払わない |

これに加えて、保証人サービスを使う場合はその手数料（年間家賃の数％が相場）がかかります。

**日本との最大の違いは、礼金と仲介手数料がゼロであること**です。返ってこない金は初月家賃だけで、敷金は退去時に（原状回復の範囲を超える減額がなければ）戻ってきます。日本の「初期費用は家賃の5ヶ月分」に比べれば、制度としてはかなり借主に優しい設計です。

問題は金額の大きさではなく、**審査を通れるかどうか**にあります。`,
      callout: {
        tone: "tip",
        title: "council tax を忘れないこと",
        body: `家賃とは別に、council tax（自治体税）が毎月かかります。ロンドンの Band C〜D なら年間£1,500〜2,000程度、月額に直すと£125〜170ほどです。

**bills included の物件でも、council tax が含まれるとは限りません。** 募集文の「bills included」が何を指すのか（水道・光熱・ネット・council tax）を必ず個別に確認してください。

なお**フルタイムの学生は council tax が免除**されます（世帯全員が学生の場合）。学生ビザで来る人は、入居後に自治体へ在学証明を提出してください。`,
      },
    },
    {
      id: "how-to-claim",
      title: "違法な請求をされたとき、どう取り戻すか",
      subtitle: "3段階で進める",
      body: `払ってしまった後でも取り戻せます。順序立てて進めてください。

### 第1段階：書面で返還を求める

エージェント・大家にメールで、**「Tenant Fees Act 2019 上の prohibited payment にあたるため、返還を求めます」**と明記して送ります。金額・支払日・名目を具体的に書き、返答期限（14日程度）を切ります。

多くの場合、この段階で返ってきます。相手は違法だと分かっていて請求しているので、法律の名前を出されると引きます。

### 第2段階：自治体に通報する

物件所在地の自治体（council）の private housing team が Tenant Fees Act の執行機関です。ウェブサイトに通報フォームがあります。自治体は大家・エージェントに最大£${HOUSING_PENALTIES.standard.toLocaleString()}の民事制裁金を科すことができ、反復違反なら£${HOUSING_PENALTIES.serious.toLocaleString()}まで上がります。

エージェント経由なら、**property redress scheme**（Property Redress Scheme または The Property Ombudsman）への申立ても有効です。エージェントは加入が義務づけられており、裁定には拘束力があります。

### 第3段階：First-tier Tribunal に申し立てる

自治体が動かない場合、借主自身が First-tier Tribunal（Property Chamber）に返還命令を求められます。申立ては本人でも可能で、弁護士は必須ではありません。

### 相談先

- **Citizens Advice** — 無料。英語での相談になりますが、通訳の手配を依頼できる場合があります。
- **Shelter** — 住宅問題専門の慈善団体。電話相談とオンラインの法情報が充実しています。
- **自治体の private housing team** — 執行権限を持つのはここです。`,
      tips: [
        "証拠はすべて残してください。募集広告のスクリーンショット、見積書、振込明細、やり取りのメール。あとから集めるのは困難です。",
        "エージェントとのやり取りは、電話ではなくメールに寄せてください。電話で言われた条件は、後で「言っていない」になります。",
        "返還請求に時効はありますが（一般に6年）、実務上は早く動くほど回収可能性が上がります。気づいたらすぐ書面を出してください。",
      ],
    },
  ],
  faq: [
    {
      question: "エージェントに「referencing費用£150」を請求されました。払う必要がありますか？",
      answer:
        "ありません。referencing（信用調査）の費用は Tenant Fees Act 2019 で明確に禁止されており、大家・エージェント側の負担です。請求されたら書面で拒否し、応じない場合は物件所在地の自治体に通報してください。すでに払ってしまった場合も返還を請求できます。",
    },
    {
      question: "敷金が保護スキームに預けられているか、どう確認しますか？",
      answer:
        "DPS・MyDeposits・TDS の3つのスキームは、いずれも自社サイトで預託の有無を検索できます。契約開始日・住所・敷金額などを入力すれば確認できるため、大家に尋ねる必要はありません。入居から30日を過ぎても prescribed information が届かない場合は、必ず自分で調べてください。",
    },
    {
      question: "契約更新のたびに更新料を請求されています。これは適法ですか？",
      answer:
        "違法です。更新料（renewal fee）は Tenant Fees Act 2019 の禁止対象です。そもそも2026年5月1日以降はすべての契約が期間の定めのない periodic tenancy に転換されており、「更新」という手続き自体が存在しません。更新料を請求されている場合、その大家・エージェントは現行制度を理解していないか、意図的に違法な請求をしています。",
    },
    {
      question: "前払い家賃の上限は、保証人が立てられない場合でも適用されますか？",
      answer:
        "適用されます。保証人がいるかどうかにかかわらず、契約署名後に請求できる前払い家賃は1ヶ月分までです。保証人を立てられない場合の代替は、前払いではなく保証人サービス（guarantor service）の利用になります。",
    },
    {
      question: "敷金から「クリーニング代」を引かれました。認められますか？",
      answer:
        "professional cleaning を一律に義務づける条項は、Tenant Fees Act 2019 の下では原則として無効です。ただし、入居時より明らかに汚れている場合の原状回復費用は正当な控除になり得ます。争点は「通常損耗（fair wear and tear）か否か」で、入居時の写真があるかどうかが決定的です。詳しくは退去の記事で扱います。",
    },
  ],
  sources: [...HOUSING_SOURCES],
  relatedLinks: [
    { href: "/housing/tenancy-types", label: "契約形態の地図（2026年5月の法改正後）" },
    { href: "/housing/referencing", label: "審査を通す（信用情報ゼロの渡英直後に）" },
    { href: "/housing/moving-out", label: "退去とデポジット返還交渉" },
    { href: "/jobs/minimum-wage", label: "最低賃金・給与明細の見方" },
  ],
};

export default depositsAndFees;

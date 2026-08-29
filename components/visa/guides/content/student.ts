import type { VisaGuideArticle } from "../types";
import {
  IHS_PER_YEAR,
  PROCESSING_WEEKS,
  RATES_AS_OF,
  RATES_UPDATED_AT,
  VISA_FEES,
  VISA_KEY_DATES,
  VISA_SOURCES,
  VISA_THRESHOLDS,
  gbp,
  jpDate,
} from "@/lib/visa/rates";

/**
 * Student + Graduate をまとめた記事。
 *
 * 分けない理由: 留学を検討する読者の関心は最初から「卒業後どうなるか」
 * まで一続きで、Student だけ読んでも意思決定できない。特に Graduate visa の
 * 18ヶ月短縮(2027年1月申請分〜)は、いま出願先を選んでいる読者の
 * 判断材料そのものなので、同じページに置く。
 *
 * 就労時間のルールは /jobs/visa-and-work と重複するが、あちらは
 * 「働く側の労働問題」視点、こちらは「ビザ申請者」視点。相互リンクで繋ぐ。
 */
const student: VisaGuideArticle = {
  slug: "student",
  title:
    "英国Student／Graduateビザガイド｜資金証明の正確な額と、卒業後2年の使い方",
  engTitle: "UK Student Visa and Graduate Visa",
  summary:
    "英国の学位課程に通うための Student visa と、卒業後に最長2年働ける Graduate visa をまとめて解説します。維持費の証明額、週20時間の正確な数え方、そして2027年1月申請分から Graduate が18ヶ月に短縮される点まで。",
  description:
    "英国Student visa（学生ビザ）とGraduate visa（卒業生ビザ）の要件を解説。CAS、資金証明の金額（ロンドン£1,529／地方£1,171×9ヶ月）と28日ルール、学期中週20時間の就労制限の正確な意味、費用£558とIHS、Graduate visaの2027年1月からの18ヶ月短縮、Skilled Workerへの切り替え条件まで。2026年8月時点の情報。",
  keywords: [
    "イギリス 学生ビザ",
    "Student visa 資金証明",
    "Graduate visa 期間",
    "イギリス 留学 ビザ 費用",
    "CAS 学生ビザ",
    "学生ビザ 就労時間",
    "卒業後 イギリス 就職",
  ],
  audience: "英国の大学・大学院に留学する人と、その卒業後を考えている人",
  dataAsOf: RATES_AS_OF,
  updatedAt: RATES_UPDATED_AT,
  mainText: `英国留学のビザは、**Student visa（在学中）** と **Graduate visa（卒業後）** の2段構えで考えます。

Student visa は学校がスポンサーになるため、入学が決まればビザ自体は比較的通りやすいルートです。**落ちる原因はほぼ資金証明の形式ミスに集中しています。**

一方、卒業後の Graduate visa には**重要な変更が控えています。**

> **${jpDate(VISA_KEY_DATES.graduate18MonthsFrom)}以降に申請する人から、標準の付与期間が2年から18ヶ月に短縮されます**（博士号取得者の3年は維持）

いま出願先とコース開始時期を検討している方にとって、これは無視できない差です。卒業後に英国で職を探し、Skilled Worker への切り替えを狙うなら、**使える時間が6ヶ月減る**ことを前提に計画してください。

このページは、Student の申請実務から Graduate の使い方まで、一続きで解説します。`,
  atAGlance: [
    { label: "スポンサー", value: "**必要**（学校。CAS を発行してもらう）" },
    {
      label: "資金証明（ロンドン）",
      value: `学費残額 ＋ 月${gbp(VISA_THRESHOLDS.student.maintenanceLondonPerMonth)} × 最大${VISA_THRESHOLDS.student.maintenanceMaxMonths}ヶ月`,
    },
    {
      label: "資金証明（ロンドン外）",
      value: `学費残額 ＋ 月${gbp(VISA_THRESHOLDS.student.maintenanceOutsideLondonPerMonth)} × 最大${VISA_THRESHOLDS.student.maintenanceMaxMonths}ヶ月`,
    },
    {
      label: "申請料",
      value: `${gbp(VISA_FEES.student)}＋IHS 年${gbp(IHS_PER_YEAR.discounted)}（学生割引レート）`,
    },
    { label: "就労", value: "学位課程なら学期中は**週20時間まで**、休暇中はフルタイム可" },
    {
      label: "卒業後（Graduate）",
      value: `${gbp(VISA_FEES.graduate)}。2年（博士3年）。**${jpDate(VISA_KEY_DATES.graduate18MonthsFrom)}申請分から18ヶ月**`,
    },
    { label: "永住へのカウント", value: "Student・Graduate とも**されません**" },
  ],
  sections: [
    {
      id: "cas",
      title: "Student visa：まず CAS を得る",
      subtitle: "これがなければ申請は始まりません",
      body: `### CAS とは

**CAS（Confirmation of Acceptance for Studies）** は、学校が発行する参照番号です。「この学生を受け入れる」という学校からの証明であり、**ビザ申請フォームにこの番号を入力しないと先へ進めません**。

### CAS が出るまでの流れ

1. **無条件のオファー（unconditional offer）** を受ける
2. **学費の一部（deposit）を支払う**（学校により金額は異なる）
3. 学校が求める書類を提出する
4. **学校が CAS を発行**する

**条件付きオファー（conditional offer）の段階では CAS は出ません**。IELTS のスコア提出や成績証明など、条件をすべて満たす必要があります。

### CAS の内容を必ず確認する

CAS には、以下が記載されています。**間違いがあると、そのままビザ却下につながります。**

- [ ] **氏名がパスポートと完全に一致**しているか
- [ ] **生年月日・国籍**が正しいか
- [ ] **コース名、開始日、終了日**
- [ ] **学費の総額と、すでに支払った額**
- [ ] コースの**レベル**（RQF6=学士、RQF7=修士 など）
- [ ] **ATAS が必要かどうか**

**特に「すでに支払った額」は重要です**。ここに記載された額の分だけ、資金証明で用意すべき学費が減ります。記載漏れがあれば、学校に修正を依頼してください。

### CAS には有効期限があります

**発行から6ヶ月以内**に申請する必要があります。また、コース開始日の**6ヶ月前から**申請できます。`,
      tips: [
        "CAS の氏名は、パスポートのローマ字表記と1文字も違ってはいけません。ミドルネームの扱いや長音の表記（OTO / OHTO）で食い違うことがあります。",
        "ATAS（Academic Technology Approval Scheme）は、工学・物理・材料・特定のIT分野などで必要になります。取得に数週間かかるので、CAS に「required」とあれば即座に着手してください。",
      ],
    },
    {
      id: "money",
      title: "資金証明：最も落ちやすいポイント",
      subtitle: "金額の計算と、28日ルール",
      body: `### 用意すべき金額

**「学費の未払い分」＋「生活費」** の合計です。

| コースの場所 | 生活費（月額） | 最大月数 | 生活費の上限 |
|---|---:|---:|---:|
| **ロンドン**（Greater London 内） | ${gbp(VISA_THRESHOLDS.student.maintenanceLondonPerMonth)} | ${VISA_THRESHOLDS.student.maintenanceMaxMonths}ヶ月 | ${gbp(VISA_THRESHOLDS.student.maintenanceLondonPerMonth * VISA_THRESHOLDS.student.maintenanceMaxMonths)} |
| **ロンドン以外** | ${gbp(VISA_THRESHOLDS.student.maintenanceOutsideLondonPerMonth)} | ${VISA_THRESHOLDS.student.maintenanceMaxMonths}ヶ月 | ${gbp(VISA_THRESHOLDS.student.maintenanceOutsideLondonPerMonth * VISA_THRESHOLDS.student.maintenanceMaxMonths)} |

**計算例：ロンドンの修士課程（1年）、学費 £28,000、うち £5,000 を支払済み**

- 学費の未払い分：£28,000 − £5,000 ＝ **£23,000**
- 生活費：${gbp(VISA_THRESHOLDS.student.maintenanceLondonPerMonth)} × 9ヶ月 ＝ **${gbp(VISA_THRESHOLDS.student.maintenanceLondonPerMonth * VISA_THRESHOLDS.student.maintenanceMaxMonths)}**
- **必要額の合計：約${gbp(23000 + VISA_THRESHOLDS.student.maintenanceLondonPerMonth * VISA_THRESHOLDS.student.maintenanceMaxMonths)}**

日本円にすると、**700万円前後**を口座に置いておく計算になります。

### 28日ルール

YMS と同じ形式です。

- 必要額を **${VISA_THRESHOLDS.student.fundsDays}日間、連続して**保持していること
- その **28日目が、申請日から31日以内**であること
- **1日でも下回ってはいけません**

### 名義について（Student は少し緩い）

Student visa では、**本人名義に加えて、親または法定後見人の名義の口座も使えます**。ただしその場合、

- **親子関係を証明する書類**（戸籍謄本＋認証翻訳、または出生証明書）
- **親からの同意書**（資金の使用を許可する旨、署名入り）

の2点が追加で必要です。

### 資金証明が免除されるケース

以下のいずれかに該当すると、資金証明そのものが不要になります。

- **英国に12ヶ月以上、合法的に滞在している**状態で申請する場合
- 政府や公的機関の**奨学金**を受けている場合（証明書が必要）`,
      tips: [
        "「ロンドンかどうか」は、通う教育機関の所在地で判定されます。住む場所ではありません。",
        "学費を多く前払いしておくと、資金証明で用意すべき額が減ります。手元資金が心もとない場合、この方法で総額を圧縮できます。",
        "定期預金や証券口座は原則使えません。普通預金に移してから28日を数え始めてください。",
      ],
      callout: {
        tone: "warn",
        title: "「見せ金」は必ず問題になります",
        body: `28日間だけ知人から借りて口座に入れ、申請後に返す——この方法は推奨できません。

UKVI は**資金の出所（source of funds）** について追加の説明を求めることがあり、大口の入金があれば説明を要求される可能性があります。説明できない場合、資金要件を満たさないと判断されるだけでなく、**虚偽申告（deception）と認定されるリスク**があります。

deception と認定されると、**10年間の再申請禁止**につながります。金額の大きい学生ビザで、最も避けるべき失敗です。`,
      },
    },
    {
      id: "work",
      title: "在学中に働ける範囲",
      subtitle: "「週20時間」の数え方を、正確に理解してください",
      body: `### 上限

| コースのレベル | 学期中（term time） | 休暇中（vacation） |
|---|---|---|
| **学位レベル以上**（学士・修士・博士） | **週20時間** | **フルタイム可** |
| 学位レベル未満 | **週10時間** | フルタイム可 |

### 誤解されやすい3つの点

**1. 「週」ごとの上限であり、平均ではありません**

ある週に30時間働き、翌週10時間にして「平均20時間」にする——これは**違反です**。1週間ごとに20時間以内でなければなりません。

なお「週」は**月曜から日曜**で数えます。

**2. 「学期中」は自分の授業日程ではありません**

**在籍する教育機関が公式に定める学期日程（official term dates）** が基準です。授業がない週でも、公式には学期中であれば週20時間の制限がかかります。**論文執筆期間は「学期中」に該当することが多い**ので、特に注意してください。

**3. 自営業・フリーランスはできません**

学生ビザで認められるのは雇用のみです。**業務委託、フリーランス、個人事業は不可**です。また、プロスポーツ選手・エンターテイナーとしての活動も認められません。

### カウントされないもの

- **無償のボランティア活動**（volunteering）は上限に含まれません
- ただし「voluntary work（無給だが業務として行うもの）」は**含まれます**。この区別は曖昧なので、無給でも組織に対する義務が発生する働き方は避けてください

### 違反した場合

- **本人**：ビザ取消、退去、将来の英国ビザ申請での却下リスク
- **雇用主**：1人あたり最大 ${gbp(60000)} の民事制裁金、スポンサーライセンス取消

雇用主には、採用前に **share code による就労権確認**が義務づけられています。**この確認を求めず現金払いのみで雇おうとする求人は、それ自体が危険なサイン**です。

より詳しくは [ビザと就労の接点](/jobs/visa-and-work) で解説しています。`,
    },
    {
      id: "cost-process",
      title: "費用と申請の流れ",
      subtitle: "IHS は学生割引レートが適用されます",
      body: `### 費用

| 項目 | 金額 |
|---|---:|
| 申請料（英国外／英国内とも） | ${gbp(VISA_FEES.student)} |
| **IHS（年額・学生割引）** | **${gbp(IHS_PER_YEAR.discounted)}** |
| 生体情報登録（センター利用時） | ${gbp(VISA_FEES.biometric)} |

### 総額の例：1年間の修士課程

Student visa はコース期間に加えて数ヶ月が付与されるため、IHS は通常**コース期間＋αの年数分**を前払いします。1年のコースなら、実務上は2年分（${gbp(IHS_PER_YEAR.discounted * 2)}）を求められることが多くなります。

- 申請料：${gbp(VISA_FEES.student)}
- IHS：${gbp(IHS_PER_YEAR.discounted * 2)}
- **ビザ関連の合計：約${gbp(VISA_FEES.student + IHS_PER_YEAR.discounted * 2)}**

これに学費と生活費が別途かかります。

### 流れ

1. **無条件オファー → deposit 支払い → CAS 発行**
2. 必要なら **ATAS を取得**
3. **資金を28日間保持**
4. **オンライン申請**（CAS 番号を入力）
5. **申請料と IHS を支払う**
6. **本人確認** — ID Check アプリ、またはビザ申請センター
7. **書類提出** — パスポート、CAS、資金証明、英語力証明、（必要なら）結核検査証明
8. **結果を待つ** — 標準で約${PROCESSING_WEEKS.student}週間
9. **承認後90日以内に入国**

コース開始日の**6ヶ月前から**申請できます。**9〜10月は申請が集中する**ので、早めに動いてください。

### 付与される期間

| コース | コース期間に加算される期間 |
|---|---|
| 12ヶ月以上の学位課程 | 終了後 **4ヶ月** |
| 6〜12ヶ月のコース | 終了後 **2ヶ月** |
| 6ヶ月未満のコース | 終了後 **7日** |

この「終了後の期間」の間に、Graduate visa へ切り替えます。`,
    },
    {
      id: "graduate",
      title: "Graduate visa：卒業後に最長2年",
      subtitle: `${jpDate(VISA_KEY_DATES.graduate18MonthsFrom)}申請分から18ヶ月に短縮されます`,
      body: `### 何ができるか

Graduate visa は、**制約がほとんどありません**。

- **就労時間の上限なし**（フルタイム可）
- **職種の制限なし**
- **スポンサー不要**
- **自営業・フリーランスも可能**
- 転職自由

学生ビザの週20時間制限から解放され、**英国で本格的に働ける最初の期間**になります。

### 付与される期間

| 学位 | 現在（${jpDate(VISA_KEY_DATES.graduate18MonthsFrom)}より前に申請） | ${jpDate(VISA_KEY_DATES.graduate18MonthsFrom)}以降に申請 |
|---|---|---|
| 学士・修士 | **2年** | **18ヶ月** |
| **博士（PhD）** | **3年** | **3年**（変更なし） |

**博士号取得者は影響を受けません**。学士・修士の方は、**6ヶ月分の猶予が失われる**ことになります。

### 申請の要件

- 現在 **Student visa を保持している**こと
- **英国内にいる**こと（英国外からは申請できません）
- **対象となる英国の学位課程を修了**したこと
- **学校が Home Office に修了を報告済み**であること

**学校からの報告が届く前は申請できません**。最終試験や口述試験が終わっても、事務手続きに時間がかかることがあります。学生ビザの残り期間を確認しながら、学校の担当部署に進捗を確認してください。

### 費用

| 項目 | 金額 |
|---|---:|
| 申請料 | ${gbp(VISA_FEES.graduate)} |
| **IHS（年額）** | **${gbp(IHS_PER_YEAR.standard)}** |

**注意：Graduate visa の IHS は学生割引が効きません。**一般レートの ${gbp(IHS_PER_YEAR.standard)}/年 になります。2年分なら ${gbp(IHS_PER_YEAR.standard * 2)}、申請料と合わせて**${gbp(VISA_FEES.graduate + IHS_PER_YEAR.standard * 2)}**です。ここで想定外の出費になる人が多いポイントです。

### 永住にはカウントされません

**Graduate visa の期間は、ILR（永住権）にまったく算入されません。**

つまりこの2年（または18ヶ月）は、**Skilled Worker のスポンサーを見つけるための猶予期間**です。ここで切り替えられなければ、期限で出国することになります。`,
      callout: {
        tone: "warn",
        title: "Graduate から Skilled Worker への切り替えは、以前より難しくなりました",
        body: `${jpDate(VISA_KEY_DATES.rqf6From)}の制度改正で、Skilled Worker の対象職種が**学士相当（RQF6）以上**に引き上げられ、約180職種が対象外になりました。

英国の大学を卒業していれば職種のレベル自体は満たしやすいものの、**年収 ${gbp(VISA_THRESHOLDS.skilledWorker.general)}（新卒等の割引でも ${gbp(VISA_THRESHOLDS.skilledWorker.discounted)}）** の壁と、**スポンサーライセンスを持つ企業を見つける**という条件は残ります。

Graduate の期間が18ヶ月に短縮されると、この活動時間がさらに削られます。**卒業を待たず、在学中から就職活動とスポンサー企業の絞り込みを始めてください**。詳しくは [Skilled Worker ガイド](/visa/skilled-worker) を参照してください。`,
      },
      tips: [
        "Graduate visa は1回しか取得できません。学士で取得すると、後で修士を修了しても再取得はできません。",
        "Graduate visa 中に Skilled Worker へ切り替える場合、英国内から申請できます。いったん帰国する必要はありません。",
        "家族（配偶者・子ども）を帯同できますが、学生ビザの時点で扶養家族として滞在していた人に限られます。",
      ],
    },
  ],
  faq: [
    {
      question: "資金証明は親の口座でも大丈夫ですか？",
      answer:
        "**Student visa なら可能です**。親または法定後見人の名義の口座が使えます。ただし、親子関係を証明する書類（戸籍謄本＋認証翻訳など）と、親からの署名入り同意書が追加で必要です。なお YMS では親名義は認められません。",
    },
    {
      question: "学期中に週20時間を超えて働くとどうなりますか？",
      answer:
        "**ビザ条件違反です**。ビザの取消、退去、将来の英国ビザ申請での却下リスクにつながります。雇用主側にも1人あたり最大" +
        gbp(60000) +
        "の制裁金が科されます。「平均で20時間」という調整は認められず、1週間ごとの上限です。",
    },
    {
      question: "学生ビザでフリーランスの仕事はできますか？",
      answer:
        "**できません**。学生ビザで認められるのは雇用のみで、自営業・業務委託・個人事業はいずれも不可です。フリーランスとして働けるようになるのは、Graduate visa を取得してからです。",
    },
    {
      question: "Graduate visa は英国の外からでも申請できますか？",
      answer:
        "**できません**。申請時点で英国内にいて、かつ Student visa を保持している必要があります。卒業後に一度帰国してしまうと、申請権を失います。",
    },
    {
      question: "Graduate visa が18ヶ月に短縮されるのは、いつからですか？",
      answer:
        `**${jpDate(VISA_KEY_DATES.graduate18MonthsFrom)}以降に申請する人から**です。基準は「コースの開始日」でも「卒業日」でもなく、**申請日**です。それより前に申請できれば2年が付与されます。博士号取得者の3年は変わりません。`,
    },
    {
      question: "留学した期間は永住権にカウントされますか？",
      answer:
        "**Student・Graduate とも、原則カウントされません**。ただし、Skilled Worker へ切り替えた後の期間はカウントされます。留学を起点に永住を目指す場合、「留学 → Graduate → Skilled Worker で5年」という設計になり、合計では相応の年数がかかります。",
    },
    {
      question: "IHS は学生割引が効きますか？",
      answer:
        `**Student visa は割引レート（年${gbp(IHS_PER_YEAR.discounted)}）**が適用されます。ただし**Graduate visa には適用されず、一般レート（年${gbp(IHS_PER_YEAR.standard)}）** になります。卒業後の申請でここが想定外の出費になる方が多いので、あらかじめ見込んでおいてください。`,
    },
  ],
  sources: [
    VISA_SOURCES.student,
    {
      label: "GOV.UK: Student visa – money（資金要件）",
      url: "https://www.gov.uk/student-visa/money",
    },
    {
      label: "GOV.UK: Student visa – work（在学中の就労）",
      url: "https://www.gov.uk/student-visa/work",
    },
    VISA_SOURCES.graduate,
    VISA_SOURCES.ihs,
    VISA_SOURCES.proveRightToWork,
  ],
  relatedLinks: [
    { href: "/visa/uk-visa-guide", label: "英国ビザ全ルート比較" },
    { href: "/visa/skilled-worker", label: "Skilled Worker（就労ビザ）ガイド" },
    { href: "/visa/after-arrival", label: "渡英後の手続きガイド" },
    { href: "/jobs/visa-and-work", label: "ビザと就労の接点｜働ける範囲と切り替え" },
  ],
};

export default student;

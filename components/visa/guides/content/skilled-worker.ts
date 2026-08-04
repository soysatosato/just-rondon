import type { VisaGuideArticle } from "../types";
import {
  IHS_PER_YEAR,
  PROCESSING_WEEKS,
  RATES_AS_OF,
  RATES_UPDATED_AT,
  SPONSOR_COSTS,
  VISA_FEES,
  VISA_KEY_DATES,
  VISA_SOURCES,
  VISA_THRESHOLDS,
  gbp,
  jpDate,
} from "@/lib/visa/rates";

/**
 * Skilled Worker 記事。
 *
 * この記事が背負う一番の役割は「2025年7月22日以前の情報で計画している
 * 読者を止めること」。RQF3→RQF6 の引き上げで約180職種が対象外になり、
 * それ以前の体験談・ブログ・エージェントの説明はほぼ使えなくなった。
 * にもかかわらず日本語の情報は更新が遅く、旧要件のまま流通している。
 *
 * もう一つの役割は、雇用主側のコスト(ISC・ライセンス料)を明示すること。
 * 「なぜスポンサーしてもらえないのか」を求職者が理解していないと、
 * 通らない交渉に時間を溶かす。金額を見せるのが最短の説明になる。
 */
const skilledWorker: VisaGuideArticle = {
  slug: "skilled-worker",
  title:
    "Skilled Worker（英国就労ビザ）ガイド｜RQF6引き上げ後に、まだ取れる職種と年収の壁",
  engTitle: "UK Skilled Worker Visa",
  summary:
    "2025年7月22日、対象職種が学士相当（RQF6）以上に引き上げられ、約180職種が一気に対象外になりました。このページは、いま実際に取れる職種の見分け方、年収£41,700の壁の正確な意味、スポンサー企業の探し方と、雇用主側が負担する費用までを整理します。",
  description:
    "英国Skilled Worker visa（就労ビザ）の2026年時点の要件を解説。2025年7月のRQF6引き上げで何が変わったか、Temporary Shortage Listの扱い、最低年収£41,700とgoing rateの関係、new entrant割引、CoSの取得、スポンサー企業の調べ方、雇用主が負担するImmigration Skills Charge、申請費用の総額、永住までの5年、2027年3月からの英語B2化まで。",
  keywords: [
    "Skilled Worker visa",
    "イギリス 就労ビザ",
    "英国 スポンサー 企業",
    "RQF6 職種",
    "CoS 取得",
    "イギリス 就職 ビザ",
    "Skilled Worker 年収",
  ],
  audience: "英国企業に就職して、スポンサーを得て働きたい人",
  dataAsOf: RATES_AS_OF,
  updatedAt: RATES_UPDATED_AT,
  mainText: `**Skilled Worker は、英国で長期的に働き、永住を目指すための本線ルートです。**5年で ILR（永住権）に届き、家族も帯同でき、更新にも制限がありません。

一方で、**${jpDate(VISA_KEY_DATES.rqf6From)}を境に、このルートは明確に狭くなりました。**

対象となる職種の技能水準が **RQF3（高卒相当）から RQF6（学士相当）へ引き上げられ、約180職種が一括で対象外**になったためです。飲食、小売、事務、ホスピタリティ、そして介護——これまで「英国で就職してビザを出してもらう」入口になっていた職種の多くが、ここで閉じました。

**日本語で流通している情報の多くは、まだこの改正を反映していません。**2024年以前に書かれた体験談やエージェントの説明を基準に計画を立てると、確実に外します。

このページは、改正後の現在地から書いています。`,
  atAGlance: [
    { label: "スポンサー", value: "**必須**。ライセンスを持つ英国の雇用主から CoS の発行を受ける" },
    { label: "職種の要件", value: "原則 RQF6（学士相当）以上。一部の職種のみ例外" },
    {
      label: "最低年収",
      value: `${gbp(VISA_THRESHOLDS.skilledWorker.general)} と職種別相場（going rate）の**高い方**`,
    },
    { label: "英語力", value: "現在 CEFR B1。2027年3月26日申請分から B2" },
    {
      label: "申請料（英国外・3年以下）",
      value: `${gbp(VISA_FEES.skilledWorker.outsideUpTo3y)}＋IHS 年${gbp(IHS_PER_YEAR.standard)}`,
    },
    { label: "滞在できる期間", value: "最長5年。更新回数に制限なし" },
    { label: "永住まで", value: "**5年**（この期間はカウントされます）" },
    { label: "家族の帯同", value: "可能。ただし Temporary Shortage List の職種は不可" },
  ],
  sections: [
    {
      id: "rqf6",
      title: "2025年7月22日に何が変わったか",
      subtitle: "ここを理解しないと、他のすべての情報が無意味になります",
      body: `### 変更の中身

| 項目 | 2025年7月21日まで | 2025年7月22日から |
|---|---|---|
| 職種の技能水準 | **RQF3**（高卒相当） | **RQF6**（学士相当） |
| 対象職種の数 | 広い | **約180職種が除外** |
| RQF3〜5の扱い | 対象 | **原則不可**（TSL掲載の約50職種のみ例外） |

### 対象外になった代表的な職種

改正で Skilled Worker の対象から外れたのは、たとえば次のような職種です。

- 飲食業のスタッフ・シェフの一部
- 小売・販売職
- 一般事務・管理補助
- ホスピタリティ、ホテルスタッフ
- **介護職（care worker / senior care worker）** — 海外からの新規採用は完全に停止
- 各種の技能職・現場職の一部

### いま対象に残っているもの

**学士相当（RQF6）以上の職種**です。具体的には：

- ソフトウェア開発、データエンジニアリング、IT アーキテクト
- 各分野のエンジニア（機械・電気・土木・化学）
- 金融、会計、アクチュアリー、アナリスト
- 医療専門職（医師、看護師など。ただし英国での資格登録が別途必要）
- 研究職、大学教員
- マーケティング、PR、経営コンサルティングの専門職
- 建築、都市計画
- 法務専門職

### 例外：Temporary Shortage List（TSL）

RQF3〜5でも、**人材不足が深刻と認定された約50職種**は、期限付きで対象に残されています。

ただし条件が厳しくなります。

- **家族（配偶者・子ども）を帯同できません**
- **2026年12月31日で期限切れ**の予定（延長されるかは未定）

TSL は「一時的な救済」であって、**そこに乗って長期の生活設計を組むのは危険**です。`,
      tips: [
        "自分の職種が対象かどうかは、職種名ではなく SOC コード（Standard Occupational Classification）で判定されます。求人の肩書きではなく、実際の職務内容で決まります。",
        "すでに 2025年7月22日より前から Skilled Worker を保持している人には経過措置があり、旧ルールでの延長が認められる場合があります。新規申請者には適用されません。",
      ],
      callout: {
        tone: "warn",
        title: "介護職ルートは、日本から直接は取れなくなりました",
        body: `2025年7月22日以降、**英国外から介護職（care worker / senior care worker）のスポンサーを新規に受けることはできません**。

対象は「すでに英国に滞在していて、既存のビザから切り替える人」に限られます。日本から応募して介護ビザで渡英する、という経路は現在閉じています。

看護師・医師などの医療職は Health and Care Worker visa の対象として残っていますが、**英国の資格登録（看護師なら NMC 登録）が必須**で、日本の資格をそのまま使うことはできません。登録には英語試験（IELTS または OET）と、試験・実技評価を伴う手続きが必要で、通常1年前後かかります。`,
      },
    },
    {
      id: "salary",
      title: "年収要件：£41,700の壁の正確な意味",
      subtitle: "「41,700以上なら通る」ではありません",
      body: `### 基本ルール

満たすべきは、次の**2つのうち高い方**です。

1. **一般の最低年収：${gbp(VISA_THRESHOLDS.skilledWorker.general)}**
2. **その職種の going rate（相場賃金）**

つまり ${gbp(VISA_THRESHOLDS.skilledWorker.general)} は下限にすぎません。going rate が ${gbp(52000)} の職種なら、${gbp(52000)} が必要です。**職種別の going rate は GOV.UK の表で確認してください。**

### 割引が効くケース

一定の条件を満たすと、下限が ${gbp(VISA_THRESHOLDS.skilledWorker.discounted)} まで下がります。

| ケース | 最低年収 |
|---|---:|
| 一般 | ${gbp(VISA_THRESHOLDS.skilledWorker.general)} |
| **New entrant**（26歳未満、または就業初期・新卒） | ${gbp(VISA_THRESHOLDS.skilledWorker.discounted)} |
| 職務に関連する**博士号**を持つ | ${gbp(VISA_THRESHOLDS.skilledWorker.discounted)} |
| Immigration Salary List（ISL）掲載職種 | ${gbp(VISA_THRESHOLDS.skilledWorker.discounted)} |
| 医療・教育の一部（国の給与表に従う職種） | 給与表による |

**New entrant は最長4年間しか使えません。**その後は一般の水準を満たす必要があるため、「新卒で入って4年後に昇給が追いつかない」という詰み方をする人がいます。転職・昇給の計画を最初から立てておいてください。

### 年収に算入できるもの・できないもの

| 算入できる | 算入できない |
|---|---|
| 基本給（guaranteed basic salary） | **残業代** |
| — | **賞与・ボーナス**（保証されていないもの） |
| — | 各種手当（住宅・交通など） |
| — | 株式報酬（RSU等） |

**基本給だけで判定されます。**「総支給額では超えている」は通りません。オファーレターの basic salary の欄が、そのまま判定額です。

### 労働時間の扱い

年収は**週48時間を上限として**計算されます。週60時間働く前提で年収を積み上げることはできません。`,
      tips: [
        "オファーを受けたら、まず基本給が going rate を超えているかを自分で確認してください。人事が移民規則に詳しいとは限りません。",
        "パートタイムの場合、年収は実労働時間に応じて按分されるのではなく、閾値そのものを満たす必要があります。フルタイム前提のルートだと考えてください。",
      ],
    },
    {
      id: "sponsor",
      title: "スポンサー企業を見つける",
      subtitle: "ここが実務上、最大の関門です",
      body: `Skilled Worker は**雇用主のスポンサーがなければ、申請すら始まりません**。そして「日本人を雇いたい企業」と「スポンサーできる企業」は別物です。

### スポンサーライセンスを持つ企業を確認する

GOV.UK が **[登録スポンサー一覧](https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers)** を公開しています。数千社が掲載された Excel/ODS ファイルで、毎日更新されます。

**応募前に、必ずここで社名を検索してください。**求人票に「visa sponsorship available」と書かれていても、ライセンスが失効している例があります。

確認すべき列：

- 会社名（正式名称。屋号と異なる場合があります）
- **Route**（"Skilled Worker" が含まれているか）
- **Rating**（"A rating" であること。B rating は制裁中の状態）

### 雇用主が負担する費用を知っておく

企業がスポンサーを渋る理由は、多くの場合コストです。**雇用主側は以下を負担します。**

| 項目 | 大企業 | 中小・慈善団体 |
|---|---:|---:|
| スポンサーライセンス申請料 | ${gbp(SPONSOR_COSTS.licenceLarge)} | ${gbp(SPONSOR_COSTS.licenceSmall)} |
| **Immigration Skills Charge（年額）** | **${gbp(SPONSOR_COSTS.skillsChargeLargePerYear)}** | **${gbp(SPONSOR_COSTS.skillsChargeSmallPerYear)}** |
| CoS 発行料 | 別途 | 別途 |

**Immigration Skills Charge は2025年12月16日に32%引き上げられました。**3年契約なら大企業で ${gbp(SPONSOR_COSTS.skillsChargeLargePerYear * 3)}、これに ライセンス料と事務コストが乗ります。**1人採用するのに数千ポンドの追加負担**が発生する構造です。

この金額を知っておくと、交渉の現実味が変わります。「ビザ費用は自分で払います」と申し出ても、**ISC は法律上、雇用主が負担しなければならず、労働者に転嫁できません**。ここは譲れない部分です。

### 現実的な探し方

1. **登録スポンサー一覧を職種・地域で絞り込み、そこから逆に求人を探す**
2. **大企業・大学・NHS・研究機関**を優先する（ライセンス保有率が高く、手続きにも慣れている）
3. 日系企業の英国法人を狙う（ただしライセンス保有は要確認）
4. **すでに英国にいる状態で探す**（YMS や Student からの切り替えは、面接のハードルが下がる）`,
      tips: [
        "面接の最終段階まで進んでからビザの話を切り出すと、そこで破談になります。応募時か一次面接で「sponsorship が可能か」を確認してください。時間の節約になります。",
        "「スポンサーはできないが、業務委託なら」という提案は受けないでください。Skilled Worker は雇用契約が前提で、業務委託ではビザが出ません。",
      ],
      callout: {
        tone: "warn",
        title: "CoS を有償で売る業者に注意してください",
        body: `「CoS を発行します」と金銭を要求する斡旋業者が存在します。**CoS の売買は違法**であり、発覚した場合は雇用主のライセンス取消、労働者側はビザ取消と長期の再申請禁止につながります。

CoS は、**実在する求人に対して、実際に雇用する企業が発行するもの**です。仕事の実体がないのに発行された CoS は、遅かれ早かれ監査で発覚します。

日本語で「確実にビザが取れる」と謳う斡旋には、特に注意してください。`,
      },
    },
    {
      id: "requirements",
      title: "申請要件の全体像",
      subtitle: "スポンサーが決まった後に揃えるもの",
      body: `### 必須要件

1. **CoS（Certificate of Sponsorship）** — 雇用主が発行する参照番号。発行から3ヶ月以内に申請する必要があります
2. **職種が対象リストに含まれること**（RQF6以上、または TSL 掲載）
3. **年収要件**を満たすこと
4. **英語力の証明**
5. **生活資金の証明**
6. 必要に応じて **結核（TB）検査証明**、**犯罪経歴証明書**

### 英語力

現在は **CEFR B1 相当**です。証明方法は以下のいずれか。

- **SELT（Secure English Language Test）** — IELTS for UKVI など、UKVI 承認の試験
- **英語圏の大学で学位を取得**したこと
- 英語が公用語の国の国籍を持つこと（日本国籍は該当しません）

**2027年3月26日申請分からは B2 に引き上げられます。**B1 と B2 では要求水準に明確な差があるため、この日をまたぐ予定の方は、余裕のあるうちに受験しておくことを勧めます。

### 生活資金

**${gbp(VISA_THRESHOLDS.skilledWorker.maintenance)}** を、**28日間連続**で保持していることを証明します（28日目が申請日から31日以内）。

ただし、**雇用主が CoS 上で「必要なら生活費を負担する」と証明した場合、この証明は免除されます**。多くの企業は証明してくれるので、まず雇用主に確認してください。

### 犯罪経歴証明書が要る職種

医療、教育、社会福祉など、**子どもや弱者と接する職種**では、日本の警察が発行する犯罪経歴証明書（無犯罪証明書）の提出を求められます。都道府県警察本部で申請し、発行に数週間かかります。`,
      tips: [
        "CoS には有効期限（発行から3ヶ月）があります。受け取ったら速やかに申請してください。期限を過ぎると雇用主に再発行を依頼することになります。",
        "IELTS は「IELTS for UKVI」でなければ受け付けられません。通常の IELTS と会場も予約経路も異なるので、申し込み時に必ず確認してください。",
      ],
    },
    {
      id: "cost-and-process",
      title: "費用と申請の流れ",
      subtitle: "3年契約なら、本人負担は約80万円",
      body: `### 申請料

| 申請場所 | 3年以下 | 3年超 |
|---|---:|---:|
| 英国外から | ${gbp(VISA_FEES.skilledWorker.outsideUpTo3y)} | ${gbp(VISA_FEES.skilledWorker.outsideOver3y)} |
| 英国内から（切替・延長） | ${gbp(VISA_FEES.skilledWorker.insideUpTo3y)} | ${gbp(VISA_FEES.skilledWorker.insideOver3y)} |
| **ISL掲載職種**（内外共通） | ${gbp(VISA_FEES.skilledWorker.salaryListUpTo3y)} | ${gbp(VISA_FEES.skilledWorker.salaryListOver3y)} |

「3年超」は倍近くなります。**契約期間を3年ちょうどにして、後で延長する**方が総額を抑えられる場合があります（延長時にまた申請料はかかりますが、キャッシュフローは楽になります）。

### 総額の例：英国外から3年、本人のみ

- 申請料：${gbp(VISA_FEES.skilledWorker.outsideUpTo3y)}
- IHS：${gbp(IHS_PER_YEAR.standard)} × 3年 ＝ ${gbp(IHS_PER_YEAR.standard * 3)}
- 生体情報登録：${gbp(VISA_FEES.biometric)}
- **合計：${gbp(VISA_FEES.skilledWorker.outsideUpTo3y + IHS_PER_YEAR.standard * 3 + VISA_FEES.biometric)}**

**家族を帯同する場合、配偶者・子どもそれぞれに同額の申請料と IHS がかかります。**4人家族なら、単純計算で4倍です。

### 申請の流れ

1. **内定を得る**
2. 雇用主が **CoS を発行**（参照番号を受け取る）
3. **オンライン申請**（GOV.UK。CoS 番号を入力）
4. **申請料と IHS を支払う**
5. **本人確認** — ID Check アプリ、またはビザ申請センター
6. **書類をアップロード** — パスポート、英語力証明、資金証明など
7. **結果を待つ** — 標準で約${PROCESSING_WEEKS.work}週間（英国外から）
8. **承認後90日以内に入国**

### 急ぐ場合

| サービス | 追加料金 | 結果 |
|---|---:|---|
| Priority | ${gbp(VISA_FEES.priority)} | 5営業日 |
| Super Priority | ${gbp(VISA_FEES.superPriority)} | 翌営業日 |

**1人あたり**です。入社日が決まっていて逆算が厳しい場合は、雇用主に費用負担を交渉する余地があります。`,
    },
    {
      id: "after",
      title: "取得後：転職、延長、永住",
      subtitle: "スポンサー付きビザ特有の制約があります",
      body: `### 転職するとどうなるか

**転職には新しいビザ申請が必要です。**Skilled Worker は「特定の雇用主のもとで、特定の職務に就く」という条件付きの許可だからです。

- 転職先も**スポンサーライセンスを持っている必要がある**
- 新しい CoS を発行してもらい、**変更申請（change of employment）**を行う
- 申請が承認されるまで、**新しい仕事を始めてはいけません**

同じ雇用主の中での昇進・職務変更でも、SOC コードが変わる場合は申請が必要です。

### 解雇されたら

**猶予は60日**です。雇用主がスポンサーを終了すると Home Office に報告され、ビザは短縮（curtailment）されます。この期間内に、

- 別のスポンサー企業から新しい CoS を得て切り替える
- 別のビザルートへ切り替える
- 出国する

のいずれかを選ぶ必要があります。**スポンサー付きビザの最大のリスクがここです。**貯蓄と、常に更新した職務経歴書を持っておいてください。

### 延長

回数制限はありません。要件（職種・年収・スポンサー）を満たし続ける限り、更新できます。**年収要件は更新時点の基準で判定される**ため、閾値が引き上げられると更新できなくなる可能性があります。

### 永住（ILR）まで

**5年**です。Skilled Worker の期間はフルにカウントされます。

追加要件：

- **Life in the UK テスト**の合格
- **英語力 CEFR B1 以上**
- 直近5年間、**1年あたり180日を超えて英国を離れていない**こと
- 申請時点で年収要件を満たしていること

申請料は ${gbp(VISA_FEES.ilr)} です。`,
      callout: {
        tone: "warn",
        title: "永住までの年数が10年に延びる可能性があります（未確定）",
        body: `英国政府は2025年の移民白書で、就労ルートの永住までの期間を **5年から10年へ延長する**方針を打ち出しました。

**2026年8月時点の状況：**意見公募は2026年2月12日に終了しましたが、政府の正式回答も改正規則の議会提出も**まだ行われていません**。したがって**現行の5年ルールが有効**です。

争点は「**すでに英国にいる人に遡って適用されるか**」で、ここが未確定のまま残っています。Skilled Worker で長期計画を立てている方は、GOV.UK と報道の継続的な確認をお願いします。`,
      },
    },
  ],
  faq: [
    {
      question: "内定がなくても Skilled Worker を申請できますか？",
      answer:
        "**できません。**スポンサーライセンスを持つ雇用主からの内定と CoS（雇用割当証明）が、申請の前提条件です。内定なしで渡英して職を探したい場合は、YMS（18〜30歳）か Global Talent、High Potential Individual を検討してください。",
    },
    {
      question: "飲食店やホテルの仕事でビザは取れますか？",
      answer:
        "**2025年7月22日以降、原則として取れません。**対象職種が学士相当（RQF6）以上に引き上げられ、飲食・小売・ホスピタリティの多くが対象外になりました。Temporary Shortage List に載る一部職種のみ例外ですが、家族を帯同できず、2026年12月31日で期限切れの予定です。",
    },
    {
      question: "年収が£41,700に届いていませんが、可能性はありますか？",
      answer:
        "**新卒・就業初期（new entrant）や、職務に関連する博士号を持つ場合は " +
        gbp(VISA_THRESHOLDS.skilledWorker.discounted) +
        " まで下がります。**ただし new entrant は最長4年間の適用です。また、職種別の going rate がこれを上回る場合は、going rate の方が優先されます。",
    },
    {
      question: "ボーナスや残業代は年収に含められますか？",
      answer:
        "**含められません。**判定されるのは保証された基本給（guaranteed basic salary）のみです。賞与、残業代、住宅手当、株式報酬はいずれも算入できません。オファーレターの basic salary の額が、そのまま判定額になります。",
    },
    {
      question: "転職したらビザはどうなりますか？",
      answer:
        "**新しい申請が必要です。**転職先もスポンサーライセンスを持っている必要があり、新しい CoS を得て変更申請を行います。**承認が下りるまで新しい仕事を始めてはいけません。**",
    },
    {
      question: "解雇されたら、すぐ出国しなければなりませんか？",
      answer:
        "**60日の猶予があります。**その間に、別のスポンサー企業から CoS を得て切り替えるか、別ルートへ切り替えるか、出国するかを選びます。スポンサー付きビザの最大のリスクなので、常に転職可能な状態を保っておいてください。",
    },
    {
      question: "介護職で英国に行きたいのですが、可能ですか？",
      answer:
        "**日本から直接は不可能です。**2025年7月22日に、海外からの介護職の新規スポンサーは停止されました。対象は「すでに英国にいて、既存ビザから切り替える人」に限られます。看護師資格をお持ちなら、NMC 登録を経て Health and Care Worker visa という経路はあります。",
    },
  ],
  sources: [
    VISA_SOURCES.skilledWorker,
    {
      label: "GOV.UK: Skilled Worker visa – your job（職種・年収要件）",
      url: "https://www.gov.uk/skilled-worker-visa/your-job",
    },
    {
      label: "GOV.UK: Skilled Worker visa – how much it costs",
      url: "https://www.gov.uk/skilled-worker-visa/how-much-it-costs",
    },
    {
      label: "GOV.UK: Register of licensed sponsors（スポンサー企業一覧）",
      url: "https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers",
    },
    {
      label: "GOV.UK: Immigration Skills Charge（雇用主負担）",
      url: "https://www.gov.uk/uk-visa-sponsorship-employers/immigration-skills-charge",
    },
    VISA_SOURCES.ihs,
    VISA_SOURCES.ilr,
  ],
  relatedLinks: [
    { href: "/visa/uk-visa-guide", label: "英国ビザ全ルート比較" },
    { href: "/visa/youth-mobility-scheme", label: "YMS（ワーホリ）申請ガイド" },
    { href: "/visa/global-talent", label: "Global Talent（卓越人材ビザ）ガイド" },
    { href: "/jobs/visa-and-work", label: "ビザと就労の接点｜働ける範囲と切り替え" },
    { href: "/jobs/employment-contract", label: "英国の労働契約書の読み方" },
  ],
};

export default skilledWorker;

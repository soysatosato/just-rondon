import {
  DRIVING,
  TRANSPORT_AS_OF,
  TRANSPORT_KEY_DATES,
  TRANSPORT_UPDATED_AT,
  TRAVELCARD,
  gbp,
  jpDate,
} from "@/lib/transport/rates";
import type { TransportGuideArticle } from "../types";

const car: TransportGuideArticle = {
  slug: "car",
  title: "ロンドンで車・バイクを買う｜免許の切り替えとULEZ・渋滞税の実際",
  engTitle: "Owning a Car or Motorbike in London",
  summary: `日本の免許で運転できるのは英国居住者になってから${DRIVING.foreignLicenceMonths}ヶ月だけです。ただし日本は指定国なので、試験なしで英国免許に切り替えられます。Congestion Charge は${jpDate(TRANSPORT_KEY_DATES.congestionChargeRevision)}に ${gbp(DRIVING.congestionCharge)} へ。バイクは今も無料です。`,
  description: `ロンドンで車やバイクを持つための実務ガイド。日本の運転免許から英国免許への切り替え（手数料${gbp(DRIVING.licenceExchangeFee)}）、Congestion Charge ${gbp(DRIVING.congestionCharge)}とULEZ ${gbp(DRIVING.ulezDaily)}の仕組み、中古車の買い方、MOT・VED・保険を含む年間維持費、そして「そもそも必要か」の判断まで。`,
  keywords: [
    "ロンドン 車 購入",
    "イギリス 運転免許 切り替え",
    "ULEZ ロンドン",
    "Congestion Charge",
    "イギリス 中古車",
    "ロンドン バイク",
    "イギリス 車 維持費",
  ],
  dataAsOf: TRANSPORT_AS_OF,
  updatedAt: TRANSPORT_UPDATED_AT,
  atAGlance: [
    {
      label: "日本の免許",
      value: `英国居住者になってから${DRIVING.foreignLicenceMonths}ヶ月間だけ有効。以降は英国免許が必要`,
    },
    {
      label: "免許の切り替え",
      value: `日本は指定国。${DRIVING.exchangeWithinYears}年以内なら試験なしで交換（D1申請・${gbp(DRIVING.licenceExchangeFee)}）`,
    },
    {
      label: "Congestion Charge",
      value: `1日 ${gbp(DRIVING.congestionCharge)}（${DRIVING.congestionChargeHours}）。**バイクは無料**`,
    },
    {
      label: "ULEZ",
      value: `基準を満たさない車・バイクは1日 ${gbp(DRIVING.ulezDaily)}。全ロンドン、${DRIVING.ulezHours}`,
    },
    {
      label: "年間維持費",
      value: `購入費を除いて ${gbp(DRIVING.runningCostLow)}〜${gbp(DRIVING.runningCostHigh)} 程度`,
    },
    {
      label: "結論",
      value:
        "Zone 1–2 に住むなら、まず要りません。郊外・子育て・週末の遠出があるなら検討",
    },
  ],
  mainText: `最初に、身も蓋もない結論を書きます。

**ロンドンの Zone 1–2 に住んでいるなら、車はほぼ確実に不要です**。公共交通が密で、駐車場所がなく、Congestion Charge が1日 ${gbp(DRIVING.congestionCharge)} かかり、渋滞で自転車のほうが速い。年間 ${gbp(DRIVING.runningCostLow)}〜${gbp(DRIVING.runningCostHigh)} を払って、生活が不便になる可能性のほうが高い。

それでも車が要る場面はあります。子どもが複数いる、郊外に住んでいる、週末に英国内を回りたい、仕事で道具を運ぶ——このあたりです。そしてバイクなら、**Congestion Charge が免除される**という大きな利点があります。

この記事は「買うべきかどうか」から始めて、必要だと判断した人のために免許・購入・維持費・規制を順に扱います。`,
  sections: [
    {
      id: "do-you-need",
      title: "そもそも必要か",
      body: `### 車を持たないほうがいい人

- **Zone 1–2 に住んでいる**。駐車許可証が高く、そもそも路上に空きがない
- **通勤が公共交通で完結する**
- **週末の遠出が月1回以下**。その頻度ならレンタカーかカーシェアのほうが安い

### 代替手段を先に検討する

| 手段 | 費用感 | 向いている用途 |
|---|---|---|
| **Zipcar / Enterprise Car Club** | 時間単位。燃料・保険込み | 数時間の買い出し、IKEA |
| **レンタカー** | 1日 £40〜80 | 週末の遠出、地方への旅行 |
| **鉄道 ＋ 現地でレンタカー** | — | 遠方の目的地。長距離運転を避けられる |
| **配送サービス** | — | 大型家具・家電。買って運ぶ必要がそもそもない |

**月に2〜3回しか乗らないなら、カーシェアのほうがほぼ確実に安く済みます**。年間維持費 ${gbp(DRIVING.runningCostLow)} は、Zipcar なら年間100時間以上に相当します。

### それでも車が要る場面

- 子どもが2人以上いて、習い事や学校の送迎がある
- Zone 4 以遠、あるいはロンドン郊外に住んでいる
- 仕事で機材や商品を運ぶ
- 家族の介護など、時間の融通が利かない移動がある

### バイクという選択

**バイク（motorcycle / moped）は Congestion Charge が免除されます。**これは大きい。毎日中心部に入るなら、年間で £4,000 以上の差になります。駐車も、ロンドンには**二輪専用の無料駐車スペース**が多数あり、多くの自治体で無料です。

一方で ULEZ はバイクにも適用されます（2007年7月以降に登録された車体はおおむね基準を満たします）。`,
      callout: {
        tone: "tip",
        title: "定期券と比べてみる",
        body: `Zone 1–2 の年間 Travelcard は ${gbp(TRAVELCARD.zone1to2.annual)}、Zone 1–6 でも ${gbp(TRAVELCARD.zone1to6.annual)} です。車の年間維持費 ${gbp(DRIVING.runningCostLow)}〜${gbp(DRIVING.runningCostHigh)}（購入費を除く）と比べてください。**車1台の維持費で、家族全員分の年間定期が買えます。**`,
      },
    },
    {
      id: "licence",
      title: "運転免許 —— 最初に片付けること",
      subtitle: `日本の免許で運転できるのは${DRIVING.foreignLicenceMonths}ヶ月だけ`,
      body: `ここを誤解している人が非常に多いので、はっきり書きます。

> **日本の運転免許で英国内を運転できるのは、英国の居住者になってから${DRIVING.foreignLicenceMonths}ヶ月間だけです。**

短期の旅行者なら、日本の免許＋国際運転免許証（または日本の免許＋公式翻訳）で運転できます。しかし**居住者になった時点で${DRIVING.foreignLicenceMonths}ヶ月のカウントが始まり**、その後は英国の免許がないと違法になります。

### 日本は「指定国（designated country）」

幸い、**日本は DVLA の指定国リストに入っています**。つまり——

> **試験を受けずに、日本の免許を英国の免許に交換できます。**

これは大きな利点です。指定国でない国の出身者は、理論試験と実技試験を受け直す必要があります。

### 手続き

1. **D1 申請用紙を入手する**。DVLA のサービスを扱う郵便局（Post Office）で受け取ります。**オンラインで印刷することはできません**（一部の欄が印刷不可）
2. **日本の免許の公式な翻訳を用意する**。DVLA は日本語の免許をそのまま受け付けません。**在英日本国大使館（ロンドン）または在エディンバラ日本国総領事館**で翻訳証明を取得します
3. **D1 に記入し、日本の免許・翻訳・写真・手数料 ${gbp(DRIVING.licenceExchangeFee)} を添えて DVLA に郵送する**
4. 数週間で英国の免許が届きます。**日本の免許は DVLA に保管され、返却されません**（帰国時に日本で再取得の手続きが必要になります）

### 期限

**英国の居住者になってから${DRIVING.exchangeWithinYears}年以内**に申請してください。この期限を過ぎると、指定国であっても試験を受け直すことになります。

つまり実務上は「${DRIVING.foreignLicenceMonths}ヶ月以内に切り替えを済ませ、遅くとも${DRIVING.exchangeWithinYears}年以内には必ず」ということになります。`,
      tips: [
        "翻訳証明の取得には日本のパスポートと免許証の原本が必要。大使館の窓口予約が要る場合があるので、事前に確認する",
        "日本の免許が DVLA に回収されるため、帰国後に日本で運転する予定があるなら、切り替え前に日本の免許のコピーと有効期限を記録しておく",
        "二輪の資格については、日本の免許の区分と英国の区分の対応が単純ではない。二輪も切り替えたい場合は、D1 の申請前に DVLA に個別に確認すること",
      ],
      callout: {
        tone: "warn",
        title: `${DRIVING.foreignLicenceMonths}ヶ月を過ぎて運転すると無免許運転です`,
        body: `居住者になってから${DRIVING.foreignLicenceMonths}ヶ月を過ぎた後、日本の免許だけで運転すると**無免許運転**として扱われます。任意保険も無効になり、事故を起こせば全額自己負担です。渡英したら、住居と銀行口座の次に片付ける手続きだと考えてください。`,
      },
    },
    {
      id: "congestion-ulez",
      title: "Congestion Charge と ULEZ",
      subtitle: `${jpDate(TRANSPORT_KEY_DATES.congestionChargeRevision)}に大きく変わりました`,
      body: `ロンドンで運転するうえで、この2つは避けて通れません。**別々の制度で、どちらも別々に課金されます。**

### Congestion Charge（渋滞税）

中心部（おおむね Zone 1 の内側）に入る車に課される料金です。

| 項目 | 内容 |
|---|---|
| 料金 | **${gbp(DRIVING.congestionCharge)}／日**（走行日から3日目までなら ${gbp(DRIVING.congestionChargeLate)}） |
| 時間帯 | ${DRIVING.congestionChargeHours} |
| 無料期間 | ${DRIVING.congestionChargeFreePeriod} |
| **バイク・原付** | **免除** |
| EV（乗用車） | ${DRIVING.evCarDiscountPercent}%引き（Auto Pay 登録が条件。実質 ${gbp(DRIVING.evCarDaily)}） |
| EV（バン等） | ${DRIVING.evVanDiscountPercent}%引き（同上） |
| 居住者割引 | ${DRIVING.residentDiscountPercent}%引き（ゾーン内に住んでいる場合） |
| 違反金 | ${gbp(DRIVING.penalty)}（14日以内なら ${gbp(DRIVING.penaltyEarly)}／28日超で ${gbp(DRIVING.penaltyCertificate)}） |

**${jpDate(TRANSPORT_KEY_DATES.congestionChargeRevision)}に £15 から ${gbp(DRIVING.congestionCharge)} に値上げされ、同時に EV の全額免除が廃止されました**。これは2020年以来の改定で、日本語の情報の多くはまだ更新されていません。EV 割引はさらに ${jpDate(TRANSPORT_KEY_DATES.congestionChargeEvStep2)} に縮小される予定です。

### ULEZ（超低排出ゾーン）

**排ガス基準を満たさない車両**に課される料金です。Congestion Charge と違い、**ロンドン全域**（M25 の内側、M25 自体は含まない）で、**${DRIVING.ulezHours}**課金されます。

| 項目 | 内容 |
|---|---|
| 料金 | **${gbp(DRIVING.ulezDaily)}／日**（乗用車・バイク） |
| 対象 | 基準を満たさない車両のみ |
| ガソリン車の基準 | ${DRIVING.ulezPetrolStandard} |
| ディーゼル車の基準 | ${DRIVING.ulezDieselStandard} |
| バイクの基準 | ${DRIVING.ulezMotorcycleStandard} |
| 違反金 | ${gbp(DRIVING.penalty)}（14日以内なら ${gbp(DRIVING.penaltyEarly)}） |

**基準を満たしていれば、ULEZ は1ペンスもかかりません**。逆に言えば、古い車を安く買うと、毎日 ${gbp(DRIVING.ulezDaily)} を払い続けることになります。年間250日乗れば ${gbp(DRIVING.ulezDaily * 250)}。車体の安さが吹き飛びます。

**中古車を買う前に、必ずナンバーで確認してください**。TfL のサイトに登録番号を入力すれば、その車が ULEZ 対象かどうかが即座に分かります。`,
      tips: [
        "Congestion Charge と ULEZ は別の制度。中心部に古い車で入ると、両方合わせて " +
          gbp(DRIVING.congestionCharge + DRIVING.ulezDaily) +
          " かかる",
        "支払いは Auto Pay（自動引き落とし）に登録するのが確実。手動だと払い忘れて違反金になる",
        "違反金の通知（PCN）はナンバープレートの登録住所に届く。引っ越したら DVLA の住所変更を必ず行う",
        "レンタカーやカーシェアの料金には Congestion Charge が含まれていないことがある。契約条件を確認する",
      ],
      callout: {
        tone: "warn",
        title: "中古車を買う前に必ずナンバーで ULEZ 判定を",
        body: `TfL の「Check your vehicle」ページに登録番号（ナンバープレート）を入力すると、その車が ULEZ の基準を満たすかどうかが即座に分かります。**基準を満たさない車は、安く買っても毎日 ${gbp(DRIVING.ulezDaily)} かかります**。これを確認せずに買うのは、ロンドンで最も高くつく失敗の一つです。`,
      },
    },
    {
      id: "buying",
      title: "中古車の買い方",
      body: `英国の中古車市場は成熟しており、個人売買もディーラーも一般的です。

### どこで買うか

| 経路 | 価格 | リスク |
|---|---|---|
| **主要ディーラー**（Arnold Clark、Motorpoint など） | 高い | 低い。保証が付く |
| **中古車販売店（独立系）** | 中 | 中。店の評判を調べる |
| **オンライン**（Cinch、Cazoo 系） | 中 | 低〜中。試乗ができない |
| **個人売買**（AutoTrader、Gumtree、Facebook） | 安い | **高い**。保証なし |

渡英して間もないなら、**多少高くてもディーラーか大手オンラインをおすすめします**。保証があり、書類が揃っており、トラブル時の窓口があります。

### 買う前に必ず確認すること

1. **V5C（logbook）**：車検証にあたる登録証。**売り主の名前と住所が一致しているか**を確認します。無い車は買ってはいけません
2. **MOT 履歴**：GOV.UK で登録番号を入力すると、**過去の MOT 記録と走行距離が無料で見られます**。走行距離が途中で減っていたら改ざんの疑いがあります
3. **ULEZ 判定**：前述のとおり、TfL のサイトで確認
4. **HPI チェック**（有料、£10〜20）：**盗難車でないか、事故で全損扱いになっていないか、ローンが残っていないか**を調べます。ローンが残っている車を買うと、所有権が移りません
5. **試乗**：エンジン音、ブレーキ、ハンドルの取られ、警告灯

### 買った直後にやること

1. **保険に入る**。**保険なしで公道を走ることはできません**（自宅の駐車場から動かすのも不可）
2. **V5C の名義変更**。オンラインで即日できます
3. **VED（自動車税）を払う**。**英国では自動車税は売買時に引き継がれません**。買った瞬間に自分で払う必要があります
4. **MOT の有効期限を確認する**`,
      tips: [
        "GOV.UK の「Check MOT history」は無料。買う前に必ず見る。過去の不合格理由と走行距離の推移が全部載っている",
        "英国では「road tax（自動車税）が残っているから安い」という売り文句は成り立たない。名義変更と同時に売り主に還付され、買い主は新規に払う",
        "冬タイヤの習慣は英国にはほぼない。年間を通じてオールシーズンタイヤで足りる",
      ],
      callout: {
        tone: "warn",
        title: "保険に入っていない車は、停めておくだけでも違法です",
        body: "英国には **Continuous Insurance Enforcement** という制度があり、**公道に登録された車は、走っていなくても保険に入っている必要があります**。乗らない期間があるなら、DVLA に **SORN**（一時抹消の届出）を出して、公道以外の場所に保管してください。",
      },
    },
    {
      id: "insurance",
      title: "任意保険 —— 渡英直後が最も高い",
      body: `英国では自動車保険への加入が法的義務です。そして**渡英直後の日本人にとって、これが最大の障壁になります**。

### なぜ高くなるのか

英国の保険料は **no claims bonus（無事故割引）** の積み上げで決まります。無事故で1年経つごとに割引が増え、5年以上で6〜7割引きになることもあります。

**日本での運転歴と無事故記録は、原則として引き継がれません**。つまり、日本で20年無事故でも、英国では「運転歴ゼロ」からのスタートになります。

一般的な保険料は年 ${gbp(DRIVING.insuranceTypicalLow)}〜${gbp(DRIVING.insuranceTypicalHigh)} ですが、**渡英直後だとこれを大きく超えることがあります**。ロンドンは全国で最も保険料の高い地域でもあります。

### 下げる方法

- **日本の無事故証明を提出する**。日本の保険会社から英文の無事故証明（No Claims Certificate）を取り寄せると、**一部の保険会社は割引を認めます**。すべての会社が認めるわけではないので、複数社に問い合わせてください
- **テレマティクス保険（black box）**：運転を記録して安全運転なら保険料が下がる商品。運転歴のない人向けです
- **比較サイトを使う**：Compare the Market、GoCompare、Confused.com などで一括見積もり。**同じ条件で保険料が倍違うことは普通にあります**
- **車種を選ぶ**：保険グループ（insurance group、1〜50）が低い車ほど安い。中古車を選ぶ時点で保険料も一緒に見積もる
- **年払いにする**：月払いは実質的に金利がつき、年払いより1割前後高くなります

### 保険の種類

- **Third party only**：対人・対物のみ。最低限
- **Third party, fire and theft**：上記＋火災・盗難
- **Comprehensive（fully comp）**：自車の損害も含む。**意外なことに、Comprehensive のほうが安いことがあります**（リスクの低い層が選ぶため）

必ず3種類とも見積もりを取ってください。`,
      tips: [
        "見積もりの際の「職業」の書き方で保険料が変わる。虚偽はいけないが、同じ仕事に複数の呼び方があるなら、それぞれで見積もってみる価値はある",
        "更新（renewal）時に自動更新すると、たいてい高くなる。毎年、比較サイトで取り直す。これは英国では常識的な行動とされている",
        "日本の無事故証明は、渡英前に日本の保険会社に依頼しておく。渡英後だと手続きが煩雑になる",
      ],
    },
    {
      id: "running-costs",
      title: "維持費の内訳",
      body: `購入費を除いた年間の維持費です。

| 項目 | 年額の目安 | 備考 |
|---|---:|---|
| 任意保険 | ${gbp(DRIVING.insuranceTypicalLow)}〜${gbp(DRIVING.insuranceTypicalHigh)}＋ | 渡英直後はこれを大きく超えることがある |
| VED（自動車税） | ${gbp(DRIVING.vedStandard)} | 2017年4月以降登録の標準税率。新車価格 £40,000 超なら最大 ${gbp(DRIVING.vedExpensiveMax)} |
| MOT（車検） | 最大 ${gbp(DRIVING.motMaxFee)} | 法定上限。初回登録から${DRIVING.motFirstAfterYears}年後以降、毎年 |
| 燃料 | £1,500〜2,500 | 走行距離次第 |
| 整備・修理 | £300〜700 | 車齢が上がるほど増える |
| 駐車許可証（residents' permit） | £50〜300＋ | 自治体と排出量による。中心部ほど高い |
| Congestion Charge | 中心部に入る日数 × ${gbp(DRIVING.congestionCharge)} | 毎日なら年 £4,000 超 |
| ULEZ | 基準を満たせば ${gbp(0)} | 満たさなければ 1日 ${gbp(DRIVING.ulezDaily)} |

合計すると、**購入費を除いて年 ${gbp(DRIVING.runningCostLow)}〜${gbp(DRIVING.runningCostHigh)}** というのが一般的な数字です。中心部に毎日入るなら、これに Congestion Charge が上乗せされます。

### MOT（車検）

**初回登録から${DRIVING.motFirstAfterYears}年経った車は、毎年 MOT を受ける義務があります**。法定の上限料金は ${gbp(DRIVING.motMaxFee)} と安く、日本の車検とはまったく規模が違います（日本の車検は整備を含みますが、MOT は検査のみ）。

不合格になると整備が必要で、そこで費用が発生します。**MOT の有効期限が切れた車を公道で走らせると違法**で、保険も無効になります。

### 駐車

ロンドンの多くの地域は **CPZ（Controlled Parking Zone）** に指定されており、**居住者の駐車許可証がないと路上に停められません**。許可証は自治体（borough）に申請します。

- 料金は自治体と車の排出量によって大きく違います（年 £50 の地域もあれば、£300 を超える地域もあります）
- **世帯あたりの発行枚数に上限**があります。2台目以降は大幅に高くなるか、そもそも発行されません
- 新築のフラットは、そもそも**駐車許可証の申請資格が与えられない**（permit-free development）ことがあります

**賃貸契約や購入契約の前に、その住所で駐車許可証が取れるかを必ず確認してください**。取れないと車を停める場所がありません。`,
      callout: {
        tone: "warn",
        title: "新しいフラットは駐車許可証が取れないことがあります",
        body: "ロンドンの自治体は、交通量抑制のため、新築の集合住宅を **permit-free development** に指定することが増えています。この住所に住むと、**居住者用の駐車許可証を申請する資格がありません**。車を持つ予定があるなら、家探しの段階で自治体のサイトか大家に確認してください。",
      },
    },
    {
      id: "motorbike",
      title: "バイクという選択肢",
      subtitle: "Congestion Charge が免除される",
      body: `ロンドンで日常的に中心部へ入るなら、**バイクは車より圧倒的に合理的です。**

### 利点

- **Congestion Charge が免除**。年間で £4,000 以上の差になります
- **駐車が無料または非常に安い**。ロンドンには二輪専用の駐車スペースが多数あり、多くの自治体で無料です
- **渋滞に強い**。フィルタリング（車列の間をすり抜ける走行）は英国では合法です（安全な範囲で）
- 燃費が良く、保険料も車より安い傾向

### 制約

- **ULEZ は適用されます**。${DRIVING.ulezMotorcycleStandard}を満たさない古い車体は1日 ${gbp(DRIVING.ulezDaily)}
- **雨が多い**。ロンドンの気候で年間を通じてバイク通勤するのは、装備が要ります
- **盗難が多い**。ロンドンのバイク盗難は自転車以上に組織的で、ディスクロック・チェーン・アラーム・GPS トラッカーが実質的に必須です
- **免許**。日本の二輪免許から英国の二輪資格への切り替えは、車ほど単純ではありません。DVLA に個別に確認してください

### 免許の実務

英国で二輪に乗るには、**CBT（Compulsory Basic Training）** という基礎訓練の修了証が最低限必要です（125cc まで、2年間有効）。それ以上の排気量には、A1 / A2 / A の各区分に応じた試験があります。

日本の免許を D1 で切り替える場合、**二輪の資格がそのまま移るとは限りません**。車（カテゴリ B）は指定国として交換できますが、二輪については扱いが異なることがあるため、申請前に DVLA に直接確認してください。`,
      tips: [
        "スクーター（125cc）は CBT だけで乗れて、ロンドンの通勤では十分な性能がある。中心部に毎日入るなら最も安上がり",
        "バイク盗難対策は、チェーン＋グラウンドアンカー＋ディスクロック＋アラーム＋GPS の多重防御が基本",
        "冬用の装備（防水グローブ、ヒーテッドグリップ）に £200 程度は見ておく",
      ],
    },
    {
      id: "driving",
      title: "英国で運転するときの実務",
      body: `### 日本と同じこと

- **左側通行**。ハンドルは右
- 交通標識の多くは国際的な記号

### 日本と違うこと

- **ラウンドアバウト（環状交差点）が非常に多い**。右から来る車が優先。慣れるまで最も緊張する要素です
- **速度は mph（マイル毎時）**。市街地 30mph（約48km/h）、幹線 60mph、モーターウェイ 70mph
- **信号のない交差点が多く、譲り合いで処理される**
- **モーターウェイに料金所がない**（M6 Toll など一部を除く）
- **速度違反の取り締まりは固定カメラが中心**。ナンバーで自動的に通知が届きます
- **スマートモーターウェイ**：路肩が走行車線になる区間があり、表示に従う必要があります

### 罰則

英国の免許には**ペナルティポイント制**があり、12点で免許停止になります。速度超過で3〜6点、携帯電話の使用で6点です。**渡英3年以内の新規免許保持者は、6点で免許取り消し**になります。

### ガソリンスタンド

セルフサービスが基本で、**給油してから店内で払います**（日本と逆）。ポンプの番号を伝えて支払います。

- **Petrol**：ガソリン（緑のノズル）
- **Diesel**：ディーゼル（黒のノズル）

**入れ間違えると、エンジンを壊します**。レンタカーでは特に注意してください。`,
      tips: [
        "ラウンドアバウトが不安なら、最初は交通量の少ない時間帯に練習する。ロンドン郊外の住宅地が向いている",
        "英国の駐車は「時間制限」と「許可証の有無」の2つの規制がかかる。標識を必ず読む。読み違えると £60〜130 の罰金",
        "二重の黄色線（double yellow line）は駐停車禁止。一重は時間帯規制あり。標識を確認する",
      ],
    },
  ],
  faq: [
    {
      question: "日本の運転免許でロンドンを運転できますか？",
      answer: `**英国の居住者になってから${DRIVING.foreignLicenceMonths}ヶ月間だけ**運転できます。それ以降は英国の免許が必要で、日本の免許だけで運転すると無免許運転になり、保険も無効になります。ただし**日本は DVLA の指定国**なので、**試験を受けずに交換できます**。D1 申請用紙（郵便局で入手）に日本の免許・大使館発行の翻訳証明・手数料 ${gbp(DRIVING.licenceExchangeFee)} を添えて申請してください。期限は居住者になってから${DRIVING.exchangeWithinYears}年以内です。`,
    },
    {
      question: "Congestion Charge はいくらですか？",
      answer: `**1日 ${gbp(DRIVING.congestionCharge)}** です（${jpDate(TRANSPORT_KEY_DATES.congestionChargeRevision)}に £15 から値上げされました）。時間帯は${DRIVING.congestionChargeHours}。**バイク・原付は免除**です。EV は同時に全額免除が廃止され、Auto Pay 登録を条件に乗用車で${DRIVING.evCarDiscountPercent}%引き（実質 ${gbp(DRIVING.evCarDaily)}）になりました。払い忘れると ${gbp(DRIVING.penalty)} の違反金です。`,
    },
    {
      question: "ULEZ は必ずかかりますか？",
      answer: `**いいえ。排ガス基準を満たしていれば1ペンスもかかりません。**基準はガソリン車で${DRIVING.ulezPetrolStandard}、ディーゼル車で${DRIVING.ulezDieselStandard}、バイクで${DRIVING.ulezMotorcycleStandard}です。満たさない車両は**ロンドン全域で${DRIVING.ulezHours}、1日 ${gbp(DRIVING.ulezDaily)}** かかります。中古車を買う前に、TfL のサイトで登録番号を入力して必ず判定を確認してください。`,
    },
    {
      question: "ロンドンで車を持つと年間いくらかかりますか？",
      answer: `**購入費を除いて年 ${gbp(DRIVING.runningCostLow)}〜${gbp(DRIVING.runningCostHigh)}** が一般的な目安です。内訳は保険（${gbp(DRIVING.insuranceTypicalLow)}〜${gbp(DRIVING.insuranceTypicalHigh)}）、VED（${gbp(DRIVING.vedStandard)}）、MOT（最大 ${gbp(DRIVING.motMaxFee)}）、燃料、整備、駐車許可証など。中心部に毎日入るなら Congestion Charge が年 £4,000 以上上乗せされます。参考までに、Zone 1–6 の年間 Travelcard は ${gbp(TRAVELCARD.zone1to6.annual)} です。`,
    },
    {
      question: "渡英直後は保険料が高いと聞きました",
      answer:
        "**そのとおりです。**英国の保険料は無事故割引（no claims bonus）の積み上げで決まり、**日本での運転歴は原則として引き継がれません**。ただし、日本の保険会社から**英文の無事故証明**を取り寄せると、一部の保険会社は割引を認めます。すべての会社が認めるわけではないので、比較サイトで複数社に見積もりを取ってください。同じ条件で保険料が倍違うことは普通にあります。",
    },
    {
      question: "バイクなら安く済みますか？",
      answer: `**中心部に毎日入るなら、大幅に安くなります**。バイクは **Congestion Charge が免除**されるためで、これだけで年 £4,000 以上の差になります。加えて駐車が無料または非常に安く、燃費も保険料も車より有利です。ただし ULEZ は適用され（${DRIVING.ulezMotorcycleStandard}）、盗難対策の装備も必要です。日本の二輪免許の切り替えは車ほど単純ではないので、DVLA に個別に確認してください。`,
    },
    {
      question: "駐車場所はどうすればいいですか？",
      answer:
        "ロンドンの多くの地域は **CPZ（Controlled Parking Zone）**で、**自治体発行の居住者用駐車許可証がないと路上に停められません**。料金は年 £50〜300 超と地域差が大きく、世帯あたりの枚数にも上限があります。さらに**新築のフラットは permit-free development に指定され、そもそも申請資格がない**ことがあります。車を持つ予定があるなら、家探しの段階で必ず確認してください。",
    },
  ],
  sources: [
    {
      label: "GOV.UK – Exchange a foreign driving licence",
      url: "https://www.gov.uk/exchange-foreign-driving-licence",
    },
    {
      label: "GOV.UK – Driving in Great Britain on a non-GB licence",
      url: "https://www.gov.uk/driving-nongb-licence",
    },
    {
      label: "TfL – Congestion Charge",
      url: "https://tfl.gov.uk/modes/driving/congestion-charge",
    },
    {
      label: "TfL – Ultra Low Emission Zone（車両判定を含む）",
      url: "https://tfl.gov.uk/modes/driving/ultra-low-emission-zone",
    },
    {
      label: "GOV.UK – Check MOT history（無料の車歴確認）",
      url: "https://www.gov.uk/check-mot-history",
    },
    {
      label: "GOV.UK – Vehicle tax rates（VED）",
      url: "https://www.gov.uk/vehicle-tax-rate-tables",
    },
  ],
  relatedLinks: [
    {
      href: "/sightseeing/transport/travelcard",
      label: "定期券とRailcardの損得｜車と比べる基準線",
    },
    {
      href: "/sightseeing/transport/own-bike",
      label: "自分の自転車を買って通勤する",
    },
    {
      href: "/housing/where-to-live",
      label: "エリアの選び方と、家賃と交通費の総額",
    },
    { href: "/visa/after-arrival", label: "渡英後の手続きガイド" },
  ],
};

export default car;

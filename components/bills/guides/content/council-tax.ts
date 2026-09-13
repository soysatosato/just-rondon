import type { BillsGuideArticle } from "../types";
import {
  BILLS_AS_OF,
  BILLS_SOURCES,
  BILLS_UPDATED_AT,
  COUNCIL_TAX,
  COUNCIL_TAX_BANDS,
  gbp,
  gbpRound,
  londonCouncilTaxForBand,
} from "@/lib/bills/rates";

const londonD = COUNCIL_TAX.londonBandD;
const singlePersonAnnual =
  londonD * (1 - COUNCIL_TAX.singlePersonDiscountPercent / 100);

const bandTable = COUNCIL_TAX_BANDS.map(
  (b) =>
    `| ${b.band} | ${b.valuation1991} | ${b.ratioLabel} | ${gbpRound(
      londonCouncilTaxForBand(b.band)
    )} | ${gbpRound(londonCouncilTaxForBand(b.band) / COUNCIL_TAX.defaultInstalments)} |`
).join("\n");

const councilTax: BillsGuideArticle = {
  slug: "council-tax",
  title: "Council Tax（カウンシルタックス）とは｜誰が払い、いくらで、どう安くなるか",
  engTitle: "Council Tax Explained for New Arrivals",
  audience:
    "入居したら council tax の請求が来た、あるいは自分が払う必要があるのかわからない人",
  summary: `家に住む人にかかる地方税です。収入ではなく、住んでいる物件の band で決まります。ロンドンの平均は Band D で年${gbp(
    londonD
  )}。一人暮らしなら${COUNCIL_TAX.singlePersonDiscountPercent}%引き、住人が全員フルタイム学生なら免除です。どちらも自動では適用されないので、区に申請してください。`,
  description: `イギリスの Council Tax（カウンシルタックス）を解説。誰が払うのか（借主・大家・シェアハウス）、band と金額の決まり方、ロンドン平均 Band D 年${gbp(
    londonD
  )}（${COUNCIL_TAX.year}）、一人暮らしの${COUNCIL_TAX.singlePersonDiscountPercent}%割引と学生の免除、入居時の登録、払えないときに何が起きるかまで。`,
  keywords: [
    "Council Tax とは",
    "カウンシルタックス",
    "イギリス 住民税",
    "council tax 学生 免除",
    "council tax 一人暮らし 割引",
    "council tax band",
    "ロンドン council tax 金額",
  ],
  dataAsOf: BILLS_AS_OF,
  updatedAt: BILLS_UPDATED_AT,
  atAGlance: [
    {
      label: "何の税金か",
      value: "住居にかかる地方税。ごみ収集や警察など区の行政サービスの財源",
    },
    {
      label: "誰が払うか",
      value: "原則はそこに住む18歳以上。部屋ごとに貸すシェアハウスは**大家**",
    },
    {
      label: "ロンドンの水準",
      value: `Band D 平均で年${gbp(londonD)}（${COUNCIL_TAX.year}）。最も安い ${
        COUNCIL_TAX.cheapestBorough.name
      } は${gbp(COUNCIL_TAX.cheapestBorough.bandD)}`,
    },
    {
      label: "安くなる条件",
      value: `一人暮らしは${COUNCIL_TAX.singlePersonDiscountPercent}%引き。全員フルタイム学生なら免除。**要申請**`,
    },
    {
      label: "払い方",
      value: `年額を${COUNCIL_TAX.defaultInstalments}回に分けるのが標準。申し出れば${COUNCIL_TAX.optionalInstalments}回にできる`,
    },
    {
      label: "入居したら",
      value: "区のサイトで登録する。区は入居を自動では知らない",
    },
  ],
  mainText: `**Council Tax** は、住居に住む人が区（borough）に払う地方税です。日本の住民税に訳されることがありますが、仕組みはかなり違います。

- **収入に関係ありません。** 年収がゼロでも、住んでいれば請求されます
- **人ではなく住居にかかります。** 1軒に1つの請求が届き、住んでいる人数は割引の判定にだけ使われます
- **ビザの種類で免除されません。** ワーホリ（YMS）でも就労ビザでも、条件は英国人と同じです

家賃の広告にはまず出てこないのに、ロンドンでは平均で年${gbp(
    londonD
  )}、月にすると約${gbpRound(
    londonD / COUNCIL_TAX.defaultInstalments
  )}（10回払いの場合）になります。家賃の次に大きい固定費です。

そしてこの税金には、**申請しないと適用されない割引**と、**払い遅れると一気に年額全部を請求される**という、知らないと損をする仕組みが2つあります。`,
  sections: [
    {
      id: "how-much",
      title: "金額は band で決まる",
      navLabel: "band と金額",
      subtitle: "物件の価値で8段階。今の家賃や相場とは関係ない",
      body: `Council Tax の額は、住居が **A〜H の8つの band** のどれに属するかで決まります。

イングランドの band は **1991年4月1日時点の評価額** で振り分けられていて、それ以後は見直されていません。1991年以降に建った物件も「1991年に建っていたらいくらか」で評価されています。つまり、いまの家賃の高さや物件価格の上昇とは関係がありません。

各 band の税額は、**Band D を1としたときの法定の比率** で決まります。区が決めるのは Band D の額だけで、残りは自動的に決まる仕組みです。

### ロンドン平均で換算した目安（${COUNCIL_TAX.year}）

| Band | 1991年の評価額 | Band D に対する比率 | 年額（ロンドン平均） | 10回払いの1回 |
|---|---|---|---|---|
${bandTable}

これは **ロンドン全体の平均** で換算した目安です。実際の額は区によって大きく違います。

- 最も安い **${COUNCIL_TAX.cheapestBorough.name}** は Band D で年${gbp(
        COUNCIL_TAX.cheapestBorough.bandD
      )}。ロンドン平均のほぼ半分です
- ロンドン平均の Band D（${gbp(londonD)}）は、前年度から${
        COUNCIL_TAX.londonChangePercent
      }%上がっています
- 参考までに、イングランド全体の平均は${gbp(COUNCIL_TAX.englandBandD)}です。ロンドンは全国より安い部類に入ります

### 自分の物件の額を調べる

1. GOV.UK の **Check your Council Tax band** に郵便番号を入れ、物件の band を調べる
2. 物件がある区のサイトで、その年度の **band ごとの年額** を見る

フラットは同じ建物でも部屋ごとに band が違うことがあります。住所は部屋番号まで正確に選んでください。`,
      tips: [
        "band は内見前でも調べられる。家賃が同じ2物件なら、band と区の違いで年に数百ポンド変わる。",
        "band の見直しの申し立ては、政府機関（VOA）に無料でできる。手数料を取って代行を持ちかける電話やメールには応じない。",
        "スコットランドとウェールズは band の区切りも比率も違う。この記事の表はイングランドのもの。",
      ],
    },
    {
      id: "who-pays",
      title: "誰が払うのか",
      navLabel: "誰が払うか",
      subtitle: "借主か、大家か、シェアハウスか",
      body: `原則として、**そこに住んでいる18歳以上の人** が払います。家を所有しているかどうかは関係なく、借主が払うのが普通です。

### 1軒を借りている場合（家族・カップル・友人同士）

契約者全員が **連帯して** 責任を負います。請求書は1通で、区から見れば「この住居の分」です。誰がいくら出すかは住人同士で決めることで、1人が払わなければ、区は他の住人に請求できます。

### 部屋ごとに別々の契約で貸すシェアハウス

**大家が納税義務者** になります。部屋ごとに契約が分かれた、いわゆる HMO（複数世帯が住む物件）では、住人ではなく所有者に請求が行く決まりです。この場合、Council Tax は家賃に含めて回収されているのが普通です。

ただし、SpareRoom などで「1部屋を借りる」形でも、実際は **1軒をまとめて借りている契約に途中から名前を加えている** だけのことがあります。この場合は住人が払う側です。どちらなのかは契約書で確認してください。

### 家主の家に住むロッジャー

大家本人と同居して1部屋を借りる形（lodger）なら、**大家が払います**。借りる側に請求は来ません。

### 迷ったら

区の Council Tax 窓口に、住所と契約の形を伝えて聞くのが確実です。「誰が liable（納税義務者）か」を判断するのは区です。`,
      callout: {
        tone: "warn",
        title: "「bills included」でも council tax が入っているとは限らない",
        body: "物件広告の bills included は、ガス・電気・水道・ネットだけを指していることがあります。council tax は額が大きいので、含まれるかを必ず個別に確認し、メールで答えを残してください。詳しくは[「bills included」の中身](/bills/bills-included)を参照してください。",
      },
    },
    {
      id: "discounts",
      title: "割引と免除は、申請しないと適用されない",
      navLabel: "割引と免除",
      subtitle: `一人暮らし${COUNCIL_TAX.singlePersonDiscountPercent}%引き、学生だけの世帯は免除`,
      body: `Council Tax の請求は **「大人が2人以上住んでいる」** 前提で計算されています。そこから人数と住人の属性に応じて差し引かれます。

### 一人暮らしは${COUNCIL_TAX.singlePersonDiscountPercent}%引き

住人が自分1人なら **${COUNCIL_TAX.singlePersonDiscountPercent}%引き**（single person discount）です。ロンドン平均の Band D なら、年${gbp(
        londonD
      )}が約${gbpRound(singlePersonAnnual)}になります。

自分以外の住人が全員 **disregarded（数に入らない人）** の場合も、一人暮らしと同じ扱いになります。

### 数に入らない人（disregarded）

代表的なのは次の人です。

- 18歳未満
- **フルタイムの学生**
- 見習い（一定の賃金以下）、学生看護師、住み込みの介護者、外交官など

つまり **「フルタイム学生1人＋働いている人1人」のカップルは、一人暮らしと同じ${COUNCIL_TAX.singlePersonDiscountPercent}%引き** になります。

### 全員がフルタイム学生なら免除

住人が全員フルタイム学生の世帯は、**払う必要がありません**。

ここでの「フルタイム学生」には条件があります。

- コースが **${COUNCIL_TAX.student.minCourseYears}年以上** 続く
- 学習時間が **週${COUNCIL_TAX.student.minHoursPerWeek}時間以上**

大学の学位課程なら通常満たしますが、**数か月の語学コースは期間の条件を満たしません**。語学学校に通っているだけでは学生扱いにならないことが多いので、学校が発行する在学証明（council tax exemption certificate）を出せるか、入学前に確認してください。

### 申請が必要

どの割引も免除も、**区に申請して初めて適用されます**。学生なら在学証明を添えて区のサイトから申請します。

また、実際には条件を満たしていないのに割引を受け続けると、差額の返還に加えて罰金の対象になります。**同居人が増えたら届け出てください。**`,
      tips: [
        "一人暮らしの割引は、住み始めた日に遡って申請できることが多い。気づいた時点ですぐ申請する。",
        "学生の免除には、大学が発行する council tax 用の在学証明が要る。学生課に頼めば出してくれる。",
        "同居人が引っ越してきた・出ていった、は区に届け出る。割引の条件が変わるため。",
      ],
      callout: {
        tone: "warn",
        title: "ビザで滞在中の人は「Council Tax Reduction」を申請しない",
        body: "収入が低い世帯向けの **Council Tax Reduction**（区の減額制度）は、入管法上の public funds（公的資金）に含まれます。多くのビザは public funds の利用を禁じているため、申請すると在留資格に影響するおそれがあります。一方、上の一人暮らし割引や学生の免除は収入で判定する給付ではなく、public funds の一覧にも入っていません。名前が似ているので混同しないでください。",
      },
    },
    {
      id: "register",
      title: "入居したら区に登録する",
      navLabel: "入居時の登録",
      subtitle: "区は入居を自動では知らない",
      body: `Council Tax は **入居した日から日割りで** 発生します。区は誰がいつ入居したかを自動では把握していないので、自分で知らせる必要があります。

### 登録の手順

1. 物件がある **区（borough）の公式サイト** で「council tax moving in」などのページを開く
2. 入居日、住所、契約の形（借りているか、誰と住んでいるか）、前の住所を入力する
3. 割引や免除の条件に当てはまるなら、同じタイミングで申請する
4. 数週間で請求書（bill）が届く。初回は入居日からその年度末（3月31日）までの額

### 支払いの仕組み

- 年度は **4月1日〜翌年3月31日**
- 標準は **${COUNCIL_TAX.defaultInstalments}回払い**（4月〜1月）。**${COUNCIL_TAX.optionalInstalments}回払い** にしたいと申し出れば、1回あたりの額が下がります
- 支払いは Direct Debit（口座引き落とし）にしておくと、払い忘れがなくなります

### 登録を忘れると

請求が止まるわけではありません。**入居日に遡って、まとめて請求されます。** 気づかないまま1年経つと、1年分がいきなり届きます。

### 退去するとき

退去日を区に届け出てください。日割りで精算され、払いすぎた分は返金されるか、次の住所の区へ引き継がれます。届け出ないと、住んでいない期間の請求が続きます。`,
      tips: [
        "区の名前は住所から分かる。郵便番号で GOV.UK の「Find your local council」を検索すれば出る。",
        "Direct Debit に切り替えるのが最も確実な払い忘れ対策。後述のとおり、1回の遅れで年額全部の請求になりうる。",
        "年度の途中で帰国するときは、区に退去を届け出て精算する。住所を失っても請求の宛先は残る。",
      ],
    },
    {
      id: "arrears",
      title: "払えない・払い忘れたときに起きること",
      navLabel: "払えないとき",
      subtitle: "督促の進み方が速い",
      body: `Council Tax の滞納は、ほかの請求よりも **手続きが速く、重く** 進みます。

### 督促の流れ

1. **支払いが1回遅れる** と、督促状（reminder）が届き、**${COUNCIL_TAX.reminderDays}日以内** に払うよう求められる
2. ${COUNCIL_TAX.reminderDays}日以内に払わないと、**分割払いの権利を失い、その年度の残りを一括で** 払うよう求められる
3. さらに滞納すると、区は治安判事裁判所に **liability order（支払命令）** を申し立てられる。裁判費用が借金に加算される
4. 支払命令が出ると、区は **給与からの天引き** を雇用主に命じたり、**執行官（bailiffs / enforcement agents）** を差し向けたりできる

払う能力があるのに拒み続けた場合は、最終的に拘禁の可能性もあると GOV.UK は明記しています。

### 払えないと分かったら、すぐ区に連絡する

督促が進む前に連絡すれば、**支払い計画の変更** に応じてもらえることがあります。${COUNCIL_TAX.optionalInstalments}回払いへの変更も、その一つです。

無視するのが最も悪い選択です。一度 liability order が出ると、費用が加算されたうえで、交渉の余地が大きく狭まります。

### 無料の相談先

Citizens Advice や StepChange など、借金問題を無料で相談できる窓口があります。有料の「債務整理」業者に先に行く必要はありません。`,
      callout: {
        tone: "tip",
        title: "収入が途切れたら、督促を待たずに連絡する",
        body: "失業や病気で払えなくなりそうなときは、最初の支払いが遅れる前に区へ連絡してください。前もって相談した人と、督促を無視した人とでは、区の対応がまったく違います。",
      },
    },
  ],
  faq: [
    {
      question: "Council Tax は誰が払うのですか。",
      answer:
        "原則として、その住居に住む18歳以上の人です。家を所有しているかは関係なく、借主が払うのが普通です。ただし部屋ごとに別々の契約で貸すシェアハウス（HMO）では大家が納税義務者になり、家主と同居するロッジャーの場合も大家が払います。自分がどれに当たるかは契約書で確認し、迷ったら区に聞いてください。",
    },
    {
      question: "ワーホリ（YMS）や就労ビザでも払う必要がありますか。",
      answer:
        "あります。Council Tax はビザの種類で免除されません。一人暮らしの割引やフルタイム学生の免除といった条件は、英国人と同じ基準で判定されます。",
    },
    {
      question: "一人暮らしなら安くなりますか。",
      answer: `住人が自分1人なら${COUNCIL_TAX.singlePersonDiscountPercent}%引きになります。自分以外の住人が全員フルタイム学生などの「数に入らない人」の場合も同じです。ただし自動では適用されないので、区のサイトから申請してください。`,
    },
    {
      question: "語学学校の学生も免除されますか。",
      answer: `多くの場合、されません。免除の対象になるフルタイム学生は、コースが${COUNCIL_TAX.student.minCourseYears}年以上続き、週${COUNCIL_TAX.student.minHoursPerWeek}時間以上学ぶ人です。数か月の語学コースは期間の条件を満たしません。長期のコースで条件を満たす場合は、学校が council tax 用の在学証明を出せるか確認してください。`,
    },
    {
      question: "ロンドンの Council Tax はいくらですか。",
      answer: `区と物件の band によって大きく違います。${COUNCIL_TAX.year}のロンドン全体の平均は Band D で年${gbp(
        londonD
      )}、最も安い ${COUNCIL_TAX.cheapestBorough.name} は${gbp(
        COUNCIL_TAX.cheapestBorough.bandD
      )}です。物件の band は GOV.UK で郵便番号から調べられ、band ごとの年額は各区のサイトに出ています。`,
    },
    {
      question: "払い忘れたらどうなりますか。",
      answer: `督促状が届き、${COUNCIL_TAX.reminderDays}日以内に払わないと分割払いの権利を失って、その年度の残りを一括で請求されます。さらに滞納すると裁判所の支払命令が出て、給与の天引きや執行官の派遣に進みます。払えないと分かった時点で、すぐ区に連絡してください。`,
    },
  ],
  sources: [...BILLS_SOURCES.councilTax],
  relatedLinks: [
    { href: "/bills/bills-included", label: "「bills included」の中身と家賃の比べ方" },
    { href: "/housing/where-to-live", label: "エリアの選び方と、家賃と交通費の総額" },
    { href: "/housing/tenancy-types", label: "契約形態の地図（2026年5月の法改正後）" },
    { href: "/money/opening-an-account", label: "渡英直後に開ける口座はどれか" },
  ],
};

export default councilTax;

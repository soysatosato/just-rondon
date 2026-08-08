import {
  BUS,
  DOCKLESS,
  SANTANDER,
  TRANSPORT_AS_OF,
  TRANSPORT_KEY_DATES,
  TRANSPORT_UPDATED_AT,
  gbp,
} from "@/lib/transport/rates";
import type { TransportGuideArticle } from "../types";

const cycling: TransportGuideArticle = {
  slug: "cycling",
  title: "ロンドンのシェアサイクル｜Santander・Lime・Forestの料金と使い分け",
  engTitle: "Cycle Hire and E-Scooters",
  summary: `ドック式の Santander Cycles と、乗り捨て型の Lime・Forest。料金体系がまったく違うので、使い方を間違えると同じ距離で3倍払うことになります。安く済ませる組み合わせと、私有の電動キックボードが違法である理由をまとめました。`,
  description: `ロンドンのシェアサイクルを比較。Santander Cycles の Day Pass ${gbp(SANTANDER.dayPass)}、Lime と Forest のドックレス e-bike の料金、安全な走り方、Cycle Superhighway、そして私有の電動キックボードが公道で違法である理由まで解説します。`,
  keywords: [
    "ロンドン シェアサイクル",
    "サンタンデールサイクル",
    "ボリスバイク",
    "Lime ロンドン",
    "ロンドン 自転車 レンタル",
    "ロンドン 電動キックボード",
  ],
  dataAsOf: TRANSPORT_AS_OF,
  updatedAt: TRANSPORT_UPDATED_AT,
  atAGlance: [
    {
      label: "いちばん安い",
      value: `Santander Cycles の Day Pass ${gbp(SANTANDER.dayPass)}。24時間、${SANTANDER.passRideMinutes}分以内の乗車が何度でも`,
    },
    {
      label: "乗り捨てたい",
      value: `Lime / Forest のドックレス e-bike。アンロック ${gbp(DOCKLESS.forest.unlock)} ＋ 分課金`,
    },
    {
      label: "Santander 単発",
      value: `クラシック ${gbp(SANTANDER.singleClassic)}／${SANTANDER.singleClassicMinutes}分、e-bike ${gbp(SANTANDER.singleEbike)}／${SANTANDER.singleEbikeMinutes}分`,
    },
    {
      label: "通勤に使うなら",
      value: `Santander の年間会員 ${gbp(SANTANDER.annual)}。1日あたり約 £0.33`,
    },
    {
      label: "電動キックボード",
      value: "レンタルのみ合法。私有の車体は公道走行が違法です",
    },
    { label: "走行", value: "左側通行。ヘルメットは義務ではないが強く推奨" },
  ],
  mainText: `ロンドンは、この10年で自転車が本当に走りやすい街になりました。保護された自転車レーンが中心部を貫き、通勤時間帯の一部の道路では自転車のほうが車より多いほどです。

シェアサイクルには大きく2種類あります。**決められたドックで借りて返す Santander Cycles** と、**その辺に停めて乗り捨てる Lime / Forest** です。料金の考え方がまったく違い、使い分けを間違えると同じ距離で3倍払うことになります。

一方で、ロンドンの車道は**左側通行で交通量が多く、バスとタクシーが至近距離を走ります**。日本で日常的に自転車に乗っている人でも、最初の数回は緊張します。この記事では料金だけでなく、安全に走るための実務も扱います。`,
  sections: [
    {
      id: "santander",
      title: "Santander Cycles（ドック式）",
      subtitle: "通称ボリス・バイク。中心部に密に配置されている",
      body: `ロンドン市内に800か所以上のドッキングステーションがあり、そこで借りてそこに返します。**返す場所が決まっている**のが最大の特徴で、これは制約でもあり、確実性でもあります。

### 料金（${TRANSPORT_AS_OF}時点）

| プラン | 価格 | 内容 |
|---|---:|---|
| 単発（クラシック） | ${gbp(SANTANDER.singleClassic)} | ${SANTANDER.singleClassicMinutes}分まで。超過は${SANTANDER.singleClassicMinutes}分ごとに ${gbp(SANTANDER.singleClassic)} |
| 単発（e-bike） | ${gbp(SANTANDER.singleEbike)} | ${SANTANDER.singleEbikeMinutes}分まで。超過は${SANTANDER.singleEbikeMinutes}分ごとに ${gbp(SANTANDER.singleEbike)} |
| **Day Pass** | **${gbp(SANTANDER.dayPass)}** | **24時間、${SANTANDER.passRideMinutes}分以内の乗車が何度でも** |
| 月額 | ${gbp(SANTANDER.monthly)}〜 | Day Pass と同じ条件 |
| 年間 | ${gbp(SANTANDER.annual)}〜 | Day Pass と同じ条件 |

Day Pass・月額・年間の会員が e-bike に乗る場合は、**1回あたり ${gbp(SANTANDER.ebikeSurcharge)} の追加**がかかります。

### Day Pass が圧倒的に得

観光で使うなら、**${gbp(SANTANDER.dayPass)} の Day Pass 一択**です。単発だと2回乗った時点で元が取れませんし、Day Pass なら1回あたり${SANTANDER.passRideMinutes}分まで使えます（単発は${SANTANDER.singleClassicMinutes}分）。2025年4月に無料時間が30分から${SANTANDER.passRideMinutes}分に倍増したことで、実用性が大きく上がりました。

**${SANTANDER.passRideMinutes}分でロンドン中心部はほぼ横断できます。**目的地に着いたらいったんドックに返し、次に乗るときにまた借りれば、追加料金は発生しません。`,
      tips: [
        `${SANTANDER.passRideMinutes}分を超えると超過料金が発生する。長距離を走るときは、途中のドックに一度返して借り直すと無料のまま続けられる`,
        "返却時は、ドックのランプが緑になるまで確認する。しっかり刺さっていないと返却扱いにならず、超過料金が積み上がる",
        "満車のドックに当たることがある。ドックの端末で「Not enough space?」を押すと、無料で15分延長され、近くの空きドックが表示される",
        `24時間以内に返却しないと最大 ${gbp(SANTANDER.nonReturnCharge)} を請求される`,
      ],
      callout: {
        tone: "tip",
        title: "アプリを先に入れておく",
        body: "Santander Cycles の公式アプリで、空き台数と空きドック数がリアルタイムで見られます。目的地のドックが満車かどうかを出発前に確認できるので、ドック式の最大の弱点をかなり潰せます。Citymapper でも同じ情報が見られます。",
      },
    },
    {
      id: "dockless",
      title: "Lime と Forest（ドックレス）",
      subtitle: "乗り捨てられるが、料金は読みにくい",
      body: `**Lime**（緑）と **Forest**（黒と緑）は、街のあちこちに置かれている電動アシスト自転車です。アプリで QR コードを読んで解錠し、指定エリア内であればどこに停めても構いません。

### 料金の考え方

| | アンロック | 分課金 | 定額プラン |
|---|---:|---:|---|
| **Lime** | ${gbp(DOCKLESS.lime.unlock)} | 約 ${gbp(DOCKLESS.lime.perMinuteApprox)}/分 | LimePrime 月 ${gbp(DOCKLESS.lime.primeMonthly)}（アンロック無料＋${DOCKLESS.lime.primeFlatMinutes}分 ${gbp(DOCKLESS.lime.primeFlatFare)}） |
| **Forest** | ${gbp(DOCKLESS.forest.unlock)} | ${gbp(DOCKLESS.forest.perMinute)}/分 | 毎日${DOCKLESS.forest.freeMinutesDaily}分の無料枠あり |

**分課金なので、乗る時間が読めないと料金も読めません。**20分乗れば Lime で £7 前後になり、これは地下鉄より高く、バス（${gbp(BUS.single)}）の4倍です。

### 使い分けの結論

- **観光で1日いろいろ回る** → Santander の Day Pass（${gbp(SANTANDER.dayPass)}）
- **10分程度の1回だけ、乗り捨てたい** → Forest（毎日${DOCKLESS.forest.freeMinutesDaily}分無料枠があるので、短距離なら実質アンロック代だけ）
- **毎日通勤で使う** → Santander の年間（${gbp(SANTANDER.annual)}）か LimePrime
- **坂道が多い / 荷物がある** → 電動アシストのある Lime / Forest

Forest の無料枠は毎日リセットされるので、**${DOCKLESS.forest.freeMinutesDaily}分で着く距離を毎日1回だけ**という使い方なら、これが最も安くなります。`,
      tips: [
        "ドックレスは自治体ごとに駐輪ルールが違う。指定の駐輪エリア以外に停めると追加料金を取られることがある。アプリの地図で許可エリアを確認する",
        "料金は自治体との協定やキャンペーンで頻繁に変わる。乗る前にアプリで実際の見積もりを確認すること",
        "Lime / Forest は電動アシスト付きなので、Santander のクラシック車より速く着く。時間で課金される以上、これは料金にも効く",
      ],
      callout: {
        tone: "warn",
        title: "歩道に放置された車体は問題になっています",
        body: "ドックレス自転車の放置は、ロンドンで実際に社会問題になっています。視覚障害のある人の通行を妨げるためです。**必ずアプリが指定する駐輪エリアに停めてください。**ルール外に停めると追加料金がかかるだけでなく、事業者が営業許可を失う原因にもなります。",
      },
    },
    {
      id: "riding",
      title: "ロンドンで安全に走る",
      subtitle: "日本と決定的に違う点",
      body: `### 左側通行

**日本と同じ左側通行**です。ここは安心してください。ただし、**ラウンドアバウト（環状交差点）は時計回り**で、初めてだと入るタイミングが分かりません。慣れるまでは、無理に入らず自転車を降りて歩道を押して渡ってください。

### 歩道は走れない

**イギリスでは自転車の歩道走行は違法です。**車道を走ってください。日本の感覚で歩道に上がると、罰金の対象になり得ます。

### 自転車レーン

ロンドンには保護された自転車レーン（Cycleways、旧称 Cycle Superhighway）が整備されています。番号（C1、C6 など）が振られており、**車道から物理的に分離されている区間が増えています**。Citymapper や Google マップの自転車モードは、これらを優先したルートを出します。

### バスとタクシーに注意

ロンドンの自転車事故で最も多いのが、**大型車の左折巻き込み**です。バスやトラックの左側（内側）に並んで停まらないでください。運転席から見えません。

### ヘルメット

**法的な義務はありません。**ロンドンでノーヘルの人は多数派です。ただしシェアサイクルにヘルメットは付いてこないので、事故時のリスクは自分で負うことになります。長く住むなら買ってください。`,
      tips: [
        "夜間はライトの点灯が法的義務。Santander Cycles は走り出すと自動で点灯するが、Lime / Forest は確認すること",
        "手信号（曲がる方向に腕を伸ばす）はロンドンでは普通に使われる。使うと車が譲ってくれる",
        "雨の日はマンホールの蓋とバスレーンの白線が非常に滑る。急ブレーキと急カーブを避ける",
        "Advanced Stop Line（信号手前の自転車用の待機スペース）が引かれている交差点が多い。車より前に出て待つことで、視認性が上がる",
      ],
      callout: {
        tone: "warn",
        title: "慣れていない人にはおすすめしません",
        body: "ロンドン中心部の車道は交通量が多く、道幅も日本より狭い場所があります。**日本で日常的に車道を走っていない人が、観光初日にいきなり乗るのは危険です。**まずは公園内（ハイド・パーク、リージェンツ・パーク）やテムズ川沿いの分離レーンで試して、感覚を掴んでから街に出てください。",
      },
    },
    {
      id: "e-scooters",
      title: "電動キックボードのルール",
      subtitle: "「レンタルは合法、私有は違法」という奇妙な状態",
      body: `イギリスの電動キックボード（e-scooter）の扱いは、日本から見ると非常に分かりにくいものです。

### レンタルは合法（試験運行）

政府（DfT）の試験運行の枠組みで、**認可された事業者のレンタル車体だけ**が公道を走れます。ロンドンでは **Lime・Forest・Voi** などが対象で、**${TRANSPORT_KEY_DATES.eScooterTrialUntil}まで**認められています。

利用には条件があります。

- **18歳以上**
- **英国の運転免許（仮免許を含む）で、カテゴリ Q の資格があること**
- 速度は市街地で時速12.5マイル（約20km/h）に制限
- 歩道は走行不可

**この免許要件が、多くの旅行者にとって実質的な壁になります。**日本の運転免許では要件を満たさないことが多く、事業者によって扱いも異なります。乗りたい場合は、各事業者のアプリで登録できるかを確認してください。

### 私有の車体は違法

**自分で買った電動キックボードを公道や歩道で走らせるのは違法です。**合法に乗れるのは私有地（所有者の許可がある場所）のみです。

日本から持ち込んで乗った場合、取り締まりの対象になります。無保険運転として扱われ、車体の押収や罰金、免許の点数加算に至ることがあります。`,
      callout: {
        tone: "warn",
        title: "日本から電動キックボードを持ち込まないでください",
        body: "日本では特定小型原動機付自転車として公道走行が認められていますが、**イギリスでは私有の電動キックボードの公道走行は違法**です。「日本では合法だから」は通用しません。持ち込んでも乗る場所がありません。",
      },
    },
    {
      id: "own-bike",
      title: "自分の自転車を持つという選択",
      body: `数日の旅行ならシェアサイクルで十分ですが、**ロンドンに住むなら自分の自転車を買うほうが安く、確実です**。

Santander の年間会員（${gbp(SANTANDER.annual)}）は1日あたり約 £0.33 と非常に安いのですが、それでも「借りたい場所に台がない」「返したい場所が満車」という不確実性は残ります。通勤で毎日使うなら、この不確実性はストレスになります。

一方、自分の自転車には**盗難**という大きなリスクがあり、鍵と駐輪場所の準備が必須です。

購入する場合の具体的な手順、Cycle to Work（給与天引きで実質3〜4割引き）の使い方、鍵の選び方、盗難対策、保険については、[自分の自転車を買って通勤する](/sightseeing/transport/own-bike)で詳しく扱っています。`,
      callout: {
        tone: "tip",
        title: "まずシェアサイクルで通勤ルートを試す",
        body: "自転車を買う前に、Santander の Day Pass や月額で**実際の通勤ルートを2〜3回走ってみてください。**思っていたより坂がある、思っていたより車が怖い、思っていたより速い——どれも走ってみないと分かりません。買ってから気づくと数百ポンドが無駄になります。",
      },
    },
  ],
  faq: [
    {
      question: "Santander Cycles と Lime、どちらが安いですか？",
      answer: `**1日に複数回乗るなら Santander の Day Pass（${gbp(SANTANDER.dayPass)}）が圧倒的に安い**です。24時間のあいだ、${SANTANDER.passRideMinutes}分以内の乗車が何度でもできます。Lime は分課金なので、20分乗ると £7 前後になります。逆に、**10分以内の1回だけで乗り捨てたい**なら Forest（毎日${DOCKLESS.forest.freeMinutesDaily}分の無料枠あり）が安くつきます。`,
    },
    {
      question: "Santander Cycles の30分制限に引っかかりませんか？",
      answer: `Day Pass・月額・年間の会員は、2025年4月から**1回あたり${SANTANDER.passRideMinutes}分**まで使えます（以前は30分でした）。${SANTANDER.passRideMinutes}分あればロンドン中心部はほぼ横断できます。それ以上走る場合は、途中のドックに一度返して借り直せば無料のまま続けられます。単発利用は${SANTANDER.singleClassicMinutes}分制限のままです。`,
    },
    {
      question: "ロンドンで自転車に乗るのは危険ですか？",
      answer:
        "分離された自転車レーンが整備された区間は安全ですが、**中心部の一般道は交通量が多く、慣れていない人には勧められません**。特に大型車の左折巻き込みが事故原因の上位です。まずはハイド・パークやテムズ川沿いの分離レーンで慣れてから街に出てください。ヘルメットは義務ではありませんが、あるに越したことはありません。",
    },
    {
      question: "歩道を走ってもいいですか？",
      answer:
        "**違法です。**イギリスでは自転車の歩道走行が禁じられており、罰金の対象になり得ます。車道を走ってください。ラウンドアバウトなど怖い場所では、自転車を降りて押して歩けば歩行者扱いになります。",
    },
    {
      question: "電動キックボードに乗れますか？",
      answer: `**レンタルなら条件付きで乗れますが、私有の車体は違法です。**レンタルは Lime・Forest・Voi などの認可事業者の車体に限られ、18歳以上かつ**英国の運転免許（仮免許を含む、カテゴリ Q）**が必要です。日本の免許では要件を満たさないことが多く、実質的に旅行者は使えません。日本から自分のキックボードを持ち込んで乗るのは違法です。`,
    },
    {
      question: "ヘルメットは必要ですか？",
      answer:
        "**法的な義務はありません。**ロンドンではノーヘルで走っている人が多数派です。ただしシェアサイクルにヘルメットは付属しないので、被りたい場合は自分で持参する必要があります。長期滞在するなら購入をおすすめします。",
    },
  ],
  sources: [
    {
      label: "TfL – Santander Cycles: what you pay",
      url: "https://tfl.gov.uk/modes/cycling/santander-cycles/what-you-pay",
    },
    {
      label: "TfL – Santander Cycles: how it works",
      url: "https://tfl.gov.uk/modes/cycling/santander-cycles/how-it-works",
    },
    {
      label: "TfL – Cycling in London（ルートとルール）",
      url: "https://tfl.gov.uk/modes/cycling/",
    },
    {
      label: "GOV.UK – Powered transporters（電動キックボードの法的扱い）",
      url: "https://www.gov.uk/government/publications/powered-transporters/information-sheet-guidance-on-powered-transporters",
    },
  ],
  relatedLinks: [
    {
      href: "/sightseeing/transport/own-bike",
      label: "自分の自転車を買って通勤する｜Cycle to Work と盗難対策",
    },
    {
      href: "/sightseeing/transport/fares",
      label: "運賃と支払い方法のすべて｜タッチ決済・上限額",
    },
    {
      href: "/sightseeing/kids-free-activities",
      label: "子連れで行けるロンドンの無料スポット",
    },
  ],
};

export default cycling;

import {
  BUS,
  CAPS,
  CONTACTLESS_BRANDS,
  PAYMENT,
  PEAK_HOURS,
  TFL_FARES_SOURCE,
  TRANSPORT_AS_OF,
  TRANSPORT_KEY_DATES,
  TRANSPORT_UPDATED_AT,
  gbp,
  jpDate,
} from "@/lib/transport/rates";
import type { TransportGuideArticle } from "../types";

const fares: TransportGuideArticle = {
  slug: "fares",
  title: "ロンドンの交通運賃と支払い方法｜タッチ決済・Oyster・上限額",
  engTitle: "Fares and Payment",
  summary: `ロンドンでは切符を買いません。日本で使っているタッチ決済対応のクレジットカードを、そのまま改札にかざすだけです。ゾーン制、1日と週の上限額、Oyster との使い分け、そして JCB が使えないという落とし穴まで、${TRANSPORT_AS_OF}時点の公式料金で整理します。`,
  description: `ロンドンの交通運賃の仕組みを解説。ゾーン制と1日・週の上限額、タッチ決済とOysterカードの使い分け、ピーク／オフピークの時間帯、JCBが非対応である点まで。上限額は${TRANSPORT_KEY_DATES.capsFrozenUntil}まで据え置きです。`,
  keywords: [
    "ロンドン 交通 運賃",
    "オイスターカード",
    "ロンドン タッチ決済",
    "ロンドン ゾーン",
    "ロンドン 交通費",
    "TfL 上限額",
    "ロンドン 地下鉄 料金",
  ],
  dataAsOf: TRANSPORT_AS_OF,
  updatedAt: TRANSPORT_UPDATED_AT,
  atAGlance: [
    {
      label: "支払い方法",
      value:
        "Visa / Mastercard / Amex のタッチ決済カード、または Apple Pay・Google Pay。切符も交通系ICも不要",
    },
    {
      label: "使えないカード",
      value: "JCB（改札で弾かれます）",
    },
    {
      label: "1日の上限額",
      value: `Zone 1–2 で ${gbp(CAPS.zone1to2.daily)}。何回乗ってもこれ以上は引かれません`,
    },
    {
      label: "週の上限額",
      value: `Zone 1–2 で ${gbp(CAPS.zone1to2.weekly)}（月曜〜日曜）。タッチ決済のみ`,
    },
    {
      label: "バス",
      value: `1回 ${gbp(BUS.single)}、1日上限 ${gbp(BUS.dailyCap)}。地下鉄とは別枠`,
    },
    {
      label: "据え置き期限",
      value: `上限額と Travelcard は${TRANSPORT_KEY_DATES.capsFrozenUntil}まで据え置き`,
    },
  ],
  mainText: `ロンドンの交通で、日本から来た人が最初にやりがちな失敗は「券売機の列に並ぶこと」です。

**並ぶ必要はありません**。日本で普段使っているタッチ決済対応のクレジットカードを、そのまま改札にかざせば乗れます。切符も交通系ICカードも、事前の登録も要りません。しかも運賃は、わざわざ £${PAYMENT.oysterCardFee} 払って Oyster カードを買った場合とまったく同額です。

ただし、この「かざすだけ」の裏側では**ゾーン制・上限額・ピーク／オフピーク**という3つの仕組みが動いています。知らなくても乗れますが、知らないまま動くと、同じ移動で数ポンド損をします。この記事はその3つを片付けるためのものです。`,
  sections: [
    {
      id: "conclusion",
      title: "結論：タッチ決済一択",
      subtitle: "ほとんどの人にとって Oyster を買う理由はありません",
      body: `最初に答えを書きます。

**日本で発行された Visa または Mastercard のタッチ決済対応カード、あるいはそれを登録した Apple Pay / Google Pay を、そのまま改札にかざしてください**。それが最も安く、最も速く、最も面倒がない方法です。

TfL（ロンドン交通局）が受け付けているブランドは以下のとおりです。

| ブランド | 可否 |
|---|---|
${CONTACTLESS_BRANDS.map((b) => `| ${b} | ○ |`).join("\n")}
| **JCB** | **×（非対応）** |

**JCB は使えません**。改札にかざしても開きません。JCB しか持っていない場合は、Visa か Mastercard のカードを1枚用意するか、現地で Oyster カードを買ってください。

### なぜ Oyster ではなくタッチ決済なのか

理由は3つあります。

1. **運賃が同額**。Oyster に価格上の優位はもうありません
2. **カード代 ${gbp(PAYMENT.oysterCardFee)} がかからない**。しかもこの ${gbp(PAYMENT.oysterCardFee)} は2022年9月以降、返金されません
3. **週の上限額（月〜日）がタッチ決済にしか効かない**。Oyster のペイ・アズ・ユー・ゴーには適用されません

3つめが決定的です。ロンドンに1週間いるなら、この差だけで数十ポンド変わることがあります。`,
      tips: [
        "スマホでタッチする場合、実体カードとスマホに登録した同じカードは「別のカード」として扱われる。上限額の計算が分割されるので、旅行中はどちらか一方に固定する",
        "決済端末で「日本円で決済しますか？」（DCC）と聞かれたら必ず断り、ポンド建てを選ぶ。円建ては両替レートが不利になる",
        "カード会社の海外事務手数料（1.6〜2.2%程度）は別途かかる。金額が小さいので気にする必要はないが、明細に載ることは知っておく",
      ],
      callout: {
        tone: "warn",
        title: "旅程の途中でカードを変えないこと",
        body: "上限額（キャップ）は**カード1枚ごと**に計算されます。今日はA社、明日はB社と使い分けると、どちらも上限に届かないまま満額を払い続けることになります。旅行中は1枚に固定してください。また、**1枚のカードで家族分をまとめて改札を通ることはできません**。1人1枚が必要です。",
      },
    },
    {
      id: "oyster",
      title: "それでも Oyster を買うべき人",
      body: `次のいずれかに当てはまるなら、Oyster カードを買う意味があります。

- **Visa / Mastercard / Amex のタッチ決済カードを持っていない**（JCB のみ、など）
- **Railcard の割引を使いたい**。Railcard の1/3割引は、タッチ決済には紐付けられません（[定期券とRailcardの損得](/sightseeing/transport/travelcard)で詳しく扱います）
- **11〜15歳の子ども料金の設定が必要**
- **現金でチャージして支出を管理したい**

Oyster は駅の券売機、TfL Visitor Centre、一部のコンビニ（Oyster Ticket Stop の表示がある店）で買えます。${gbp(PAYMENT.oysterCardFee)} のうち ${gbp(PAYMENT.oysterInitialCredit)} は初期チャージとして使えるので、実質の手数料は ${gbp(PAYMENT.oysterCardFee - PAYMENT.oysterInitialCredit)} です。

帰国時、残高が ${gbp(PAYMENT.oysterInstantRefundLimit)} 未満なら駅の券売機でその場で返金を受けられます。それ以上ある場合は、オンライン申請か Visitor Centre での手続きになります。**カード代の ${gbp(PAYMENT.oysterCardFee)} 自体は返ってきません。**

### 長期滞在する場合

ここまでは旅行者向けの話です。**住み始めると前提が変わります**。日本のカードを使い続けると海外事務手数料が毎日積み上がるうえ、週の上限額の計算も1枚に固定し続ける必要があります。英国の銀行口座を開いて現地のデビットカードに切り替えるのが結局いちばん安く、[銀行の選び方](/money/choosing-a-bank)と[口座開設の手順](/money/opening-an-account)にまとめてあります。通学・通勤で毎日乗るなら、[定期券とRailcardの損得](/sightseeing/transport/travelcard)で上限額と定期券のどちらが得かを先に確認してください。`,
      callout: {
        tone: "tip",
        title: "Visitor Oyster は買わなくていい",
        body: "空港や旅行代理店で売られている「Visitor Oyster Card」は、通常の Oyster より手数料が高いことがあり、運賃も割引されません。デザインが違うだけです。現地で通常の Oyster を買うか、タッチ決済で済ませてください。",
      },
    },
    {
      id: "zones",
      title: "ゾーン制 ——「距離」ではなく「またいだ数」",
      body: `ロンドンの運賃は、中心部を Zone 1 として同心円状に Zone 9 まで広がる**ゾーン制**で決まります。距離ではなく、**どのゾーンからどのゾーンまで移動したか**で値段が決まります。

- **Zone 1**：シティ、ウェストミンスター、ソーホー、大英博物館、コヴェント・ガーデン。主要観光地はほぼここ
- **Zone 2**：ノッティング・ヒル、カムデン、グリニッジ、ショーディッチ、ブリクストン
- **Zone 3〜4**：住宅地が中心。観光で行くのはウィンブルドン、キュー・ガーデンズくらい
- **Zone 6**：ヒースロー空港

観光の移動は実質 **Zone 1–2 でほぼ完結します**。逆に言うと、Zone 3 以遠に宿を取ると、毎日の運賃と移動時間の両方が増えます。宿を決める前に、そのエリアが何ゾーンかを必ず確認してください。

住む場所を探している場合も同じ話が効きます。家賃の安さが定期代で相殺されることがあるので、[エリアの選び方と、家賃と交通費の総額](/housing/where-to-live)も合わせて読んでください。`,
      tips: [
        "同じ「1駅」でも、ゾーン境界をまたぐかどうかで料金が変わることがある",
        "駅によっては2つのゾーンにまたがって設定されている（境界駅）。安いほうで計算される",
      ],
      callout: {
        tone: "tip",
        title: "宿選びは「ゾーン」から逆算する",
        body: "Zone 1–2 に泊まるのが結果的にいちばん安く済むケースが多いです。エリアごとの特徴は[宿泊エリア別ホテル選び](/sightseeing/hotels)で比較しています。",
      },
    },
    {
      id: "caps",
      title: "上限額（キャップ）——乗るほど得になる",
      subtitle: "旅行者にとって、ロンドンでいちばん有利な制度",
      body: `ロンドンには**1日の上限額（daily cap）** があります。1日にどれだけ乗っても、この金額を超えて請求されることはありません。観光で1日に5〜6回乗るような使い方をすれば、ほぼ確実に上限に到達します。

さらにタッチ決済には**月曜〜日曜の週の上限額**もあります。繰り返しになりますが、これは Oyster のペイ・アズ・ユー・ゴーには適用されません。

### 上限額（${TRANSPORT_AS_OF}時点・大人料金）

| ゾーン | 1日上限（ピーク） | 1日上限（オフピーク） | 月〜日の上限 |
|---|---:|---:|---:|
| Zone 1 のみ | ${gbp(CAPS.zone1.daily)} | ${gbp(CAPS.zone1.dailyOffPeak)} | ${gbp(CAPS.zone1.weekly)} |
| Zone 1–2 | ${gbp(CAPS.zone1to2.daily)} | ${gbp(CAPS.zone1to2.dailyOffPeak)} | ${gbp(CAPS.zone1to2.weekly)} |
| Zone 1–3 | ${gbp(CAPS.zone1to3.daily)} | ${gbp(CAPS.zone1to3.dailyOffPeak)} | ${gbp(CAPS.zone1to3.weekly)} |
| Zone 1–4 | ${gbp(CAPS.zone1to4.daily)} | ${gbp(CAPS.zone1to4.dailyOffPeak)} | ${gbp(CAPS.zone1to4.weekly)} |
| Zone 1–5 | ${gbp(CAPS.zone1to5.daily)} | ${gbp(CAPS.zone1to5.dailyOffPeak)} | ${gbp(CAPS.zone1to5.weekly)} |
| Zone 1–6 | ${gbp(CAPS.zone1to6.daily)} | ${gbp(CAPS.zone1to6.dailyOffPeak)} | ${gbp(CAPS.zone1to6.weekly)} |

観光でよく使う Zone 1–2 は、**ピークとオフピークで1日上限が同じ ${gbp(CAPS.zone1to2.daily)}** です。つまり Zone 1–2 の中だけで動く日は、時間帯を気にする必要がほとんどありません。

これらの上限額と Travelcard の価格は、**${TRANSPORT_KEY_DATES.capsFrozenUntil}まで据え置き**が TfL から公式にアナウンスされています。`,
      tips: [
        `Zone 1–2 の週上限 ${gbp(CAPS.zone1to2.weekly)} は、1日上限 ${gbp(CAPS.zone1to2.daily)} のちょうど5日分。月曜から日曜の間に6日以上乗るなら、6日目以降は実質タダになる`,
        "上限は「月曜始まり」で集計される。滞在が週をまたぐと、それぞれの週で別々にカウントされるので注意",
        `バス・トラムの上限額は地下鉄とは別枠（バスのみなら1日 ${gbp(BUS.dailyCap)}）。ただし同じ日に地下鉄も使えば、地下鉄側の上限に統合される`,
      ],
      callout: {
        tone: "info",
        title: "上限額の対象外になるもの",
        body: "**ヒースロー・エクスプレス**と **Southeastern の高速列車（HS1）** は、TfL の上限額にも Travelcard にも含まれません。これらは完全に別料金です。**Uber Boat by Thames Clippers（テムズ川の高速船）** も別枠です。",
      },
    },
    {
      id: "peak",
      title: "ピークとオフピークの時間帯",
      body: `地下鉄・鉄道の**単発運賃**は、平日の通勤時間帯だけ高くなります。

- **ピーク**：平日 ${PEAK_HOURS.morning} および ${PEAK_HOURS.evening}
- **オフピーク**：それ以外の平日すべて、および**土日祝は終日**

前述のとおり Zone 1–2 の1日上限は時間帯で変わらないので、中心部だけで動く日は気にしなくて構いません。差が出るのは、**ヒースロー（Zone 6）など遠方へ長距離で移動する日**です。

朝の移動を9時半すぎに、夕方の移動を19時すぎにずらすだけで安くなることがあります。そもそも通勤ラッシュの地下鉄は東京並みに混むので、時間をずらすのは快適さの面でも正解です。

**バスとトラムにはピーク／オフピークの区別がありません**。いつ乗っても ${gbp(BUS.single)} です。`,
      callout: {
        tone: "warn",
        title: "ヒースロー発着は時間帯に関係なくピーク運賃",
        body: "TfL の規定により、**Zone 1 を発着または経由するヒースロー行き／発の地下鉄・エリザベス・ラインは、時間帯を問わずピーク運賃**が適用されます。「土曜だからオフピークで安いはず」は成り立ちません。",
      },
    },
    {
      id: "bus-fares",
      title: "バス・トラムの運賃は別建て",
      body: `バスとトラムは、地下鉄とは独立した運賃体系です。

| 項目 | 料金 |
|---|---:|
| バス・トラム 1回 | ${gbp(BUS.single)} |
| 1日上限 | ${gbp(BUS.dailyCap)} |
| 月〜日の上限 | ${gbp(BUS.weeklyCap)} |
| ホッパー運賃 | 最初のタッチから**${BUS.hopperMinutes}分以内**なら追加のバス・トラムは無料 |

バスは**ゾーンに関係なく均一運賃**です。ロンドンの端から端まで乗っても ${gbp(BUS.single)}。しかもホッパー運賃があるので、${BUS.hopperMinutes}分以内に乗り継げば何本乗っても ${gbp(BUS.single)} のままです。

**バスで現金は使えません**。タッチ決済カードか Oyster が必須です。乗り方の詳細は[バスとトラム](/sightseeing/transport/bus)を参照してください。`,
      callout: {
        tone: "warn",
        title: `${jpDate(TRANSPORT_KEY_DATES.busFareRise)}にバス運賃が値上げされます`,
        body: `バス・トラムの運賃は市長の方針で ${gbp(BUS.single)} に凍結されてきましたが、**${jpDate(TRANSPORT_KEY_DATES.busFareRise)}から ${gbp(BUS.from2026Nov.single)}** に、1日上限も ${gbp(BUS.dailyCap)} から **${gbp(BUS.from2026Nov.dailyCap)}** に改定されます。7 Day Bus & Tram Pass も ${gbp(BUS.pass7Day)} から ${gbp(BUS.from2026Nov.pass7Day)} になります。11月以降に渡航・通勤する方はご注意ください。`,
      },
    },
    {
      id: "children",
      title: "子どもの運賃",
      body: `**11歳未満は、大人（11歳以上）と一緒なら地下鉄・バスとも無料**です。改札は大人と一緒に通ります（自動改札の場合、大人がタッチしてゲートが開いている間に一緒に通り抜けます）。

11〜15歳は割引運賃が適用されますが、これには**事前の設定が必要**です。

- **短期滞在なら**：駅の窓口で「Young Visitor discount」を Oyster カードに設定してもらう。最大14日間、大人運賃の半額になります
- **在住なら**：Zip Oyster photocard（11-15 Zip）を申請する。バスは無料、地下鉄は半額になります

タッチ決済のクレジットカードには、これらの子ども割引を紐付けられません。子どもの分は Oyster が必要になります。`,
      tips: [
        "Young Visitor discount は、大人が Oyster またはタッチ決済で一緒に旅行していることが条件。窓口で頼めばその場で設定してくれる",
        "Zip Oyster photocard は写真とロンドンの住所が必要で、申請から発行まで数週間かかる。渡英直後には間に合わない",
      ],
    },
    {
      id: "mistakes",
      title: "実際によく起きる失敗",
      body: `最後に、日本から来た人がやりがちな失敗をまとめます。

1. **降りるときのタッチを忘れる** → その区間の**最大運賃**を引かれます。バスは降車タッチ不要ですが、地下鉄・鉄道では必須です
2. **1枚のカードで家族全員が改札を通ろうとする** → できません。1人1枚です
3. **日によって違うカードを使う** → 上限額が分割され、損をします
4. **JCB カードだけを持って行く** → 改札で弾かれます
5. **改札のない駅でタッチし忘れる** → ナショナル・レールやオーバーグラウンドの一部の駅には改札がなく、ホーム上のポール型リーダーでタッチします。見落とすと未払い扱いになります
6. **改札を出ずに乗り換えようとして、いったん改札を出てしまう** → 一部の駅では改札外乗り換えが正規ルートで、その場合はタッチしても連続した1回の移動として扱われます。心配なら Citymapper の案内に従ってください

### 引かれすぎた場合

TfL のウェブサイトでカードを登録すると、乗車履歴と課金額を確認できます。タッチ忘れによる最大運賃の請求は、**オンラインで返金申請ができます**（年に数回まで）。心当たりがあれば申請してください。`,
      callout: {
        tone: "warn",
        title: "12月25日はロンドンの交通機関がほぼ全面停止します",
        body: "クリスマス当日は、**地下鉄・バス・鉄道のほぼすべてが運休**します。この日の移動手段は徒歩かタクシー（かつ料金は割増）だけです。12月26日（Boxing Day）も大幅な減便になります。年末年始にロンドンにいる予定なら、25日は「宿の近くを歩いて過ごす日」として計画してください。",
      },
    },
  ],
  faq: [
    {
      question: "Oyster カードとタッチ決済、どちらがお得ですか？",
      answer: `**タッチ決済です**。運賃は同額ですが、Oyster にはカード代 ${gbp(PAYMENT.oysterCardFee)}（返金不可）がかかり、さらに月曜〜日曜の週の上限額がタッチ決済にしか適用されません。Visa / Mastercard / American Express のタッチ決済対応カードを持っているなら、Oyster を買う理由はほぼありません。`,
    },
    {
      question: "日本で発行したクレジットカードで改札を通れますか？",
      answer:
        "**Visa・Mastercard・American Express・Maestro なら通れます**。日本発行のカードでも問題ありません。ただし **JCB は非対応**です。カード会社の海外事務手数料は別途かかるので、事前に確認しておくと安心です。",
    },
    {
      question: "1週間の滞在なら、交通費はいくらぐらいですか？",
      answer: `Zone 1–2 の範囲で毎日観光する場合、月曜〜日曜の上限額 **${gbp(CAPS.zone1to2.weekly)}** が上限です。滞在が週をまたぐ場合は、それぞれの週で別々に計算されます。バスだけの日は1日 ${gbp(BUS.dailyCap)} が上限になります。`,
    },
    {
      question: "改札を出るときにタッチし忘れました。どうなりますか？",
      answer:
        "その区間で考えられる**最大運賃**が引かれます。TfL のサイトでカードを登録していれば履歴から確認でき、年に数回までオンラインで返金申請ができます。頻繁に起きる場合は認められないので、出るときのタッチを習慣にしてください。",
    },
    {
      question: "上限額はいつ確定しますか？その場で分かりますか？",
      answer:
        "改札では都度「最大想定額」が仮押さえされ、その日の終わり（正確には翌日の未明）に TfL 側で1日分をまとめて再計算し、上限を超えた分は請求されません。カードの利用明細にはまとめて1件で載るので、**移動のたびの金額を追っても意味がありません**。TfL のサイトで乗車履歴を見るのが正確です。",
    },
    {
      question: "子どもの運賃はどうなりますか？",
      answer:
        "**11歳未満は、大人と一緒であれば地下鉄・バスとも無料**です。11〜15歳は割引運賃が適用されますが、Oyster カードへの事前設定が必要です（短期滞在なら駅の窓口で Young Visitor discount を設定してもらえます）。タッチ決済のクレジットカードには子ども割引を紐付けられません。",
    },
  ],
  sources: [
    { label: "TfL – Fares（運賃トップ / 公式）", url: "https://tfl.gov.uk/fares" },
    TFL_FARES_SOURCE,
    {
      label: "TfL – Contactless and Oyster（支払い方法の公式説明）",
      url: "https://tfl.gov.uk/fares/how-to-pay-and-where-to-buy-tickets-and-oyster/pay-as-you-go",
    },
    {
      label: "TfL – Bus and tram fares",
      url: "https://tfl.gov.uk/fares/find-fares/bus-and-tram-fares",
    },
  ],
  relatedLinks: [
    {
      href: "/sightseeing/transport/tube",
      label: "地下鉄とロンドンの鉄道｜5種類の違いと乗り方",
    },
    {
      href: "/sightseeing/transport/travelcard",
      label: "定期券とRailcardの損得｜在住者向け",
    },
    {
      href: "/sightseeing/hotels",
      label: "宿泊エリア別ホテル選び｜どのゾーンに泊まるべきか",
    },
    {
      href: "/sightseeing/travel-tips",
      label: "ロンドン旅行の実用情報｜両替・カード・治安・eSIM",
    },
    {
      href: "/housing/where-to-live",
      label: "住むエリアの選び方｜家賃と交通費の総額で考える",
    },
    {
      href: "/money/choosing-a-bank",
      label: "銀行の選び方｜コンタクトレス決済に使うカードを決める",
    },
  ],
};

export default fares;

import {
  BUS,
  CAPS,
  RAILCARD,
  TRANSPORT_AS_OF,
  TRANSPORT_KEY_DATES,
  TRANSPORT_UPDATED_AT,
  TRAVELCARD,
  TRAVELCARD_OUTER,
  annualAtWeeklyCap,
  annualSavingAmount,
  annualSavingPercent,
  gbp,
} from "@/lib/transport/rates";
import type { TransportGuideArticle } from "../types";

/** ハイブリッド勤務の週あたり交通費（Zone 1–2 の1日上限 × 出社日数）。 */
function hybridWeekly(days: number) {
  return CAPS.zone1to2.daily * days;
}

/** 年間の出社週数。英国の法定年休5.6週を引いた現実的な値。 */
const WORKING_WEEKS = 46;

const travelcard: TransportGuideArticle = {
  slug: "travelcard",
  title: "ロンドンの定期券とRailcard｜年間Travelcardは本当に得か",
  engTitle: "Season Tickets and Railcards",
  summary: `週の上限額があるので、7 Day Travelcard を買う意味はもうありません。効くのは年間定期とRailcardです。ただし週3日出社のハイブリッド勤務なら、年間定期はむしろ損になります。実際の数字で分岐点を出しました。`,
  description: `ロンドンの定期券（Travelcard）とRailcardの損得を計算。7 Day Travelcard が週上限と同額で無意味な理由、年間Travelcard が得になる出社日数の分岐点、RailcardをOysterに紐付けてオフピーク運賃を1/3引きにする方法、学生・60歳以上の割引まで。`,
  keywords: [
    "ロンドン 定期券",
    "Travelcard 年間",
    "Railcard Oyster",
    "ロンドン 通勤 交通費",
    "TfL 定期",
    "ロンドン 在住 交通費",
    "Bus and Tram Pass",
  ],
  dataAsOf: TRANSPORT_AS_OF,
  updatedAt: TRANSPORT_UPDATED_AT,
  atAGlance: [
    {
      label: "7 Day Travelcard",
      value: `買う意味なし。週の上限額（Zone 1–2 で ${gbp(TRAVELCARD.zone1to2.weekly)}）と1ペンスも変わりません`,
    },
    {
      label: "年間 Travelcard",
      value: `Zone 1–2 で ${gbp(TRAVELCARD.zone1to2.annual)}。週上限で通うより年 ${gbp(annualSavingAmount("zone1to2"))} 安い`,
    },
    {
      label: "ただし条件つき",
      value: `週5日フル出社ならお得。**週4日以下なら年間定期は損**になります`,
    },
    {
      label: "Railcard",
      value: `年 ${gbp(RAILCARD.annual)}。Oyster に紐付けるとオフピークの運賃と1日上限が${RAILCARD.discountRate}引き`,
    },
    {
      label: "Railcard の制約",
      value: "タッチ決済には紐付けられません。Oyster カードが必要です",
    },
    {
      label: "バス通勤なら",
      value: `月額 Bus & Tram Pass ${gbp(BUS.passMonthly)}。バスだけで通うなら検討の価値あり`,
    },
  ],
  mainText: `ロンドンで働き始めた人が最初にする質問が「定期券は買うべきか」です。

答えは、**ほとんどの人にとって「買わなくていい」**です。理由は単純で、タッチ決済に**週の上限額**があるからです。上限額は 7 Day Travelcard と同じ金額に設定されているので、7日券を買っても、何も買わずにカードをかざし続けても、払う金額は1ペンスも変わりません。

では何が効くのか。**年間 Travelcard** と **Railcard** です。そしてこの2つは、あなたの働き方によって得にも損にもなります。この記事では、実際の数字で分岐点を出します。

前提として、運賃と上限額の仕組みそのものは[運賃と支払い方法のすべて](/sightseeing/transport/fares)で解説しています。`,
  sections: [
    {
      id: "weekly-is-pointless",
      title: "7 Day Travelcard を買う意味はない",
      subtitle: "週の上限額とまったく同額に設定されています",
      body: `まずこれを片付けます。

| ゾーン | 週の上限額（タッチ決済） | 7 Day Travelcard |
|---|---:|---:|
| Zone 1–2 | ${gbp(CAPS.zone1to2.weekly)} | ${gbp(TRAVELCARD.zone1to2.weekly)} |
| Zone 1–3 | ${gbp(CAPS.zone1to3.weekly)} | ${gbp(TRAVELCARD.zone1to3.weekly)} |
| Zone 1–4 | ${gbp(CAPS.zone1to4.weekly)} | ${gbp(TRAVELCARD.zone1to4.weekly)} |
| Zone 1–6 | ${gbp(CAPS.zone1to6.weekly)} | ${gbp(TRAVELCARD.zone1to6.weekly)} |

**同額です。**しかも上限額のほうが有利です。7 Day Travelcard は買った時点で満額を払いますが、上限額は**実際に乗った分しか請求されません**。その週に3日しか出社しなければ、3日分で済みます。

7 Day Travelcard を買う理由が残るのは、次の場合だけです。

- **Oyster を使っていて、週の上限額が効かない**（Oyster の PAYG には週上限が適用されません）
- 経費精算で「定期券の領収書」が必要
- 学生割引（18+ Student Oyster）を効かせたい`,
      callout: {
        tone: "warn",
        title: "Oyster を使っているなら話が変わります",
        body: "**週の上限額はタッチ決済にしか適用されません**。Oyster カードのペイ・アズ・ユー・ゴーで毎日乗ると、上限なく積み上がっていきます。Oyster を使い続ける理由（Railcard 割引、学生割引など）があるなら、7 Day Travelcard を Oyster に載せる意味があります。",
      },
    },
    {
      id: "annual",
      title: "年間 Travelcard の損得",
      subtitle: "週5日出社なら得。週4日以下なら損",
      body: `年間 Travelcard は、週の上限額で1年間通い続けた場合と比べて約${annualSavingPercent("zone1to2")}%安くなります。

| ゾーン | 年間 Travelcard | 週上限で52週 | 差額 | 割引率 |
|---|---:|---:|---:|---:|
| Zone 1–2 | ${gbp(TRAVELCARD.zone1to2.annual)} | ${gbp(annualAtWeeklyCap(TRAVELCARD.zone1to2.weekly))} | ${gbp(annualSavingAmount("zone1to2"))} | ${annualSavingPercent("zone1to2")}% |
| Zone 1–3 | ${gbp(TRAVELCARD.zone1to3.annual)} | ${gbp(annualAtWeeklyCap(TRAVELCARD.zone1to3.weekly))} | ${gbp(annualSavingAmount("zone1to3"))} | ${annualSavingPercent("zone1to3")}% |
| Zone 1–4 | ${gbp(TRAVELCARD.zone1to4.annual)} | ${gbp(annualAtWeeklyCap(TRAVELCARD.zone1to4.weekly))} | ${gbp(annualSavingAmount("zone1to4"))} | ${annualSavingPercent("zone1to4")}% |
| Zone 1–6 | ${gbp(TRAVELCARD.zone1to6.annual)} | ${gbp(annualAtWeeklyCap(TRAVELCARD.zone1to6.weekly))} | ${gbp(annualSavingAmount("zone1to6"))} | ${annualSavingPercent("zone1to6")}% |

数字だけ見ると圧倒的に見えます。**ただし、この比較は「毎週きっちり上限に到達する」ことを前提にしています。**

### 上限に到達するのは週5日出社した場合だけ

Zone 1–2 の1日上限は ${gbp(CAPS.zone1to2.daily)}、週の上限は ${gbp(CAPS.zone1to2.weekly)}。つまり**週上限は1日上限のちょうど5日分**です。

では、出社日数ごとに年間いくらになるか計算します（法定年休を引いた${WORKING_WEEKS}週で計算）。

| 出社日数 | 週あたり | 年間（${WORKING_WEEKS}週） | 年間 Travelcard（${gbp(TRAVELCARD.zone1to2.annual)}）と比べて |
|---|---:|---:|---|
| 週5日 | ${gbp(CAPS.zone1to2.weekly)} | ${gbp(CAPS.zone1to2.weekly * WORKING_WEEKS)} | **年間定期のほうが ${gbp(CAPS.zone1to2.weekly * WORKING_WEEKS - TRAVELCARD.zone1to2.annual)} 安い** |
| 週4日 | ${gbp(hybridWeekly(4))} | ${gbp(hybridWeekly(4) * WORKING_WEEKS)} | 都度払いのほうが ${gbp(TRAVELCARD.zone1to2.annual - hybridWeekly(4) * WORKING_WEEKS)} 安い |
| 週3日 | ${gbp(hybridWeekly(3))} | ${gbp(hybridWeekly(3) * WORKING_WEEKS)} | 都度払いのほうが ${gbp(TRAVELCARD.zone1to2.annual - hybridWeekly(3) * WORKING_WEEKS)} 安い |
| 週2日 | ${gbp(hybridWeekly(2))} | ${gbp(hybridWeekly(2) * WORKING_WEEKS)} | 都度払いのほうが ${gbp(TRAVELCARD.zone1to2.annual - hybridWeekly(2) * WORKING_WEEKS)} 安い |

**週4日以下の出社なら、年間 Travelcard は損です**。ハイブリッド勤務が定着した現在、これに当てはまる人はかなり多いはずです。

もちろん、週末も頻繁に地下鉄で出かけるなら話は変わります。**Travelcard は平日も週末も無制限**なので、休日の外出が多い人は週4日出社でも元が取れることがあります。自分の実際の移動を1ヶ月分振り返って判断してください。`,
      tips: [
        "TfL のサイトでカードを登録すると、過去の乗車履歴と月ごとの支払額が見られる。判断はこの実績値でするのが確実",
        "年間 Travelcard は途中解約でき、使った期間分を差し引いて払い戻される。ただし手数料がかかり、月額換算より不利なレートで精算される",
        `年間 Travelcard は月額（Zone 1–2 で ${gbp(TRAVELCARD.zone1to2.monthly)}）を約${Math.round((TRAVELCARD.zone1to2.annual / TRAVELCARD.zone1to2.monthly) * 10) / 10}ヶ月分払った金額。ロンドンに1年未満しかいないなら月額を選ぶ`,
      ],
      callout: {
        tone: "tip",
        title: "会社の season ticket loan を使う",
        body: `年間 Travelcard は Zone 1–2 でも ${gbp(TRAVELCARD.zone1to2.annual)} と一括で払うには大きな金額です。多くの英国企業には **season ticket loan**（定期券購入のための**無利子の給与前貸し**）という福利厚生があり、会社が全額を立て替えて、毎月の給与から少しずつ天引きされます。人事に確認する価値があります。ただし**年度の途中で退職すると残額を一括返済**することになるので、契約期間が読めない場合は注意してください。`,
      },
    },
    {
      id: "monthly",
      title: "月額 Travelcard という中間解",
      body: `年間ほど縛られたくないが、上限額より安くしたい——という場合の選択肢が月額 Travelcard です。

| ゾーン | 月額 | 週上限で1ヶ月（約4.33週） | 差 |
|---|---:|---:|---:|
| Zone 1–2 | ${gbp(TRAVELCARD.zone1to2.monthly)} | ${gbp(Math.round(TRAVELCARD.zone1to2.weekly * 4.33 * 100) / 100)} | 約 ${gbp(Math.round((TRAVELCARD.zone1to2.weekly * 4.33 - TRAVELCARD.zone1to2.monthly) * 100) / 100)} 安い |
| Zone 1–3 | ${gbp(TRAVELCARD.zone1to3.monthly)} | ${gbp(Math.round(TRAVELCARD.zone1to3.weekly * 4.33 * 100) / 100)} | 約 ${gbp(Math.round((TRAVELCARD.zone1to3.weekly * 4.33 - TRAVELCARD.zone1to3.monthly) * 100) / 100)} 安い |
| Zone 1–4 | ${gbp(TRAVELCARD.zone1to4.monthly)} | ${gbp(Math.round(TRAVELCARD.zone1to4.weekly * 4.33 * 100) / 100)} | 約 ${gbp(Math.round((TRAVELCARD.zone1to4.weekly * 4.33 - TRAVELCARD.zone1to4.monthly) * 100) / 100)} 安い |

年間ほどの割引率はありませんが、**1ヶ月ごとに判断できる**のが利点です。出社日数が月によって変わる働き方なら、月額を「フル出社の月だけ買う」という使い方もできます。

### Zone 1 を通らない通勤

見落とされがちですが、**Zone 1 を経由しない Travelcard は大幅に安くなります**。

| ゾーン | 月額 | 年間 |
|---|---:|---:|
| Zone 2–3 | ${gbp(TRAVELCARD_OUTER.zone2to3.monthly)} | ${gbp(TRAVELCARD_OUTER.zone2to3.annual)} |
| Zone 2–4 | ${gbp(TRAVELCARD_OUTER.zone2to4.monthly)} | ${gbp(TRAVELCARD_OUTER.zone2to4.annual)} |
| Zone 3–6 | ${gbp(TRAVELCARD_OUTER.zone3to6.monthly)} | ${gbp(TRAVELCARD_OUTER.zone3to6.annual)} |

Zone 1–4 の年間が ${gbp(TRAVELCARD.zone1to4.annual)} なのに対し、Zone 2–4 なら ${gbp(TRAVELCARD_OUTER.zone2to4.annual)}。**${gbp(TRAVELCARD.zone1to4.annual - TRAVELCARD_OUTER.zone2to4.annual)} の差**です。職場も自宅も Zone 1 の外にあるなら、必ずこちらを検討してください。`,
      callout: {
        tone: "info",
        title: "Travelcard はバスにも使える",
        body: "Travelcard（7日・月・年）には**バスとトラムの乗り放題が含まれます**。ゾーンに関係なく、ロンドン中のバスに乗れます。ここは上限額との重要な違いで、バスもよく使うなら Travelcard の価値が上がります。",
      },
    },
    {
      id: "railcard",
      title: "Railcard を Oyster に紐付ける",
      subtitle: "在住者が見落としがちな、最も効く割引",
      body: `Railcard は英国の鉄道割引カードで、年 ${gbp(RAILCARD.annual)} です。長距離列車が${RAILCARD.discountRate}引きになることで知られていますが、**ロンドン在住者にとっての本命は別のところにあります**。

> **Railcard を Oyster カードに紐付けると、地下鉄・オーバーグラウンド・エリザベス・ラインの
> オフピーク運賃と1日上限が${RAILCARD.discountRate}引きになります。**

Zone 1–2 のオフピーク1日上限 ${gbp(CAPS.zone1to2.daily)} が、約 £5.90 になります。年 ${gbp(RAILCARD.annual)} の投資は、**数週間で回収できます**。

### 手順

1. Railcard を買う（オンラインでデジタル版が即日発行されます）
2. **Oyster カード**を用意する（タッチ決済のクレジットカードでは不可）
3. 地下鉄駅の窓口か TfL Visitor Centre へ行き、**Oyster と Railcard の両方を見せて「紐付けてほしい」と伝える**
4. その場で設定され、Railcard の有効期間中ずっと割引が効きます

### 重要な制約

- **タッチ決済のクレジットカードには紐付けられません**（${TRANSPORT_AS_OF}時点）。Oyster が必須です
- **オフピークのみ**。平日の朝夕のピーク時間帯は割引されません
- バスとトラムには適用されません（もともと均一運賃のため）
- 週の上限額は Oyster の PAYG には適用されないので、**週上限を捨てて日次の1/3引きを取る**という選択になります

### どの Railcard を買うか

| Railcard | 対象 | 価格 |
|---|---|---:|
| 16-25 Railcard | 16〜25歳、または26歳以上のフルタイム学生 | 年 ${gbp(RAILCARD.annual)}／3年 ${gbp(RAILCARD.threeYear)} |
| 26-30 Railcard | 26〜30歳 | 年 ${gbp(RAILCARD.annual)}（1年のみ） |
| Two Together Railcard | 指定した2人が**一緒に**移動するとき | 年 ${gbp(RAILCARD.annual)}（1年のみ） |
| Network Railcard | 南東イングランド在住者。年齢制限なし | 年 ${gbp(RAILCARD.annual)}（1年のみ） |
| Family & Friends Railcard | 大人1〜4人＋子ども1〜4人 | 年 ${gbp(RAILCARD.annual)}／3年 ${gbp(RAILCARD.threeYear)} |
| Senior Railcard | 60歳以上 | 年 ${gbp(RAILCARD.annual)}／3年 ${gbp(RAILCARD.threeYear)} |

**年齢制限で他に該当しない人には Network Railcard** があります。ロンドンを含む南東イングランドで使え、年齢の条件がありません。ただし Network Railcard は Oyster への紐付け対象外の場合があるため、購入前に TfL で確認してください。`,
      tips: [
        "Railcard はデジタル版（アプリ）でも Oyster への紐付けができる。駅の窓口でアプリの画面を見せればよい",
        "紐付けは Railcard の有効期限まで有効。更新したら、もう一度窓口で設定し直す必要がある",
        `26-30 Railcard は誕生日の前日までに買えば、31歳になっても1年間使える。30歳の人は今すぐ買う価値がある`,
      ],
      callout: {
        tone: "warn",
        title: "タッチ決済への Railcard 紐付けはまだできません",
        body: `TfL と Rail Delivery Group は、タッチ決済カードに Railcard 割引を適用する仕組みを検討していますが、**${TRANSPORT_AS_OF}時点で実装されていません**。Railcard の割引を TfL 網で使いたいなら、Oyster カードを持つ必要があります。`,
      },
    },
    {
      id: "bus-pass",
      title: "バスだけで通うなら Bus & Tram Pass",
      body: `職場までバス1本で行けるなら、地下鉄を使わない生活も現実的です。

| 項目 | 価格 |
|---|---:|
| バス1回 | ${gbp(BUS.single)} |
| 1日上限 | ${gbp(BUS.dailyCap)} |
| 7 Day Bus & Tram Pass | ${gbp(BUS.pass7Day)}（週上限と同額） |
| **月額 Bus & Tram Pass** | **${gbp(BUS.passMonthly)}** |

7日券はバスの週上限（${gbp(BUS.weeklyCap)}）と同額なので、これも買う意味がありません。**効くのは月額です**。${gbp(BUS.passMonthly)} は、週上限で1ヶ月払うより約 ${gbp(Math.round((BUS.weeklyCap * 4.33 - BUS.passMonthly) * 100) / 100)} 安くなります。

さらに、バス通勤の最大の利点は**ゾーンが関係ない**ことです。Zone 5 から Zone 1 まで通っても運賃は同じ。地下鉄で Zone 1–5 の年間 Travelcard（${gbp(TRAVELCARD.zone1to5.annual)}）を買うのと比べると、桁が違います。

もちろん、時間はかかります。「安いが遅い」と「速いが高い」のトレードオフを、自分の通勤ルートで測ってみてください。`,
      callout: {
        tone: "warn",
        title: `${TRANSPORT_KEY_DATES.busFareRise.replace(/-/g, "/")} にバス関連の価格が上がります`,
        body: `バス・トラムの運賃は ${gbp(BUS.single)} → ${gbp(BUS.from2026Nov.single)}、1日上限は ${gbp(BUS.dailyCap)} → ${gbp(BUS.from2026Nov.dailyCap)}、7 Day Bus & Tram Pass は ${gbp(BUS.pass7Day)} → ${gbp(BUS.from2026Nov.pass7Day)} に改定されます。月額パスも同時に上がる見込みです。`,
      },
    },
    {
      id: "discounts",
      title: "該当すれば必ず使うべき割引",
      body: `### 18+ Student Oyster photocard

ロンドンの教育機関にフルタイムで在籍している18歳以上の学生は、**Travelcard と Bus & Tram Pass が30%引き**になります。

Zone 1–2 の年間 Travelcard が ${gbp(TRAVELCARD.zone1to2.annual)} → 約 ${gbp(Math.round(TRAVELCARD.zone1to2.annual * 0.7))} です。**在学中は必ず申請してください**。申請は TfL のサイトから、学校の認証を経て行います。発行に数週間かかるので、入学が決まったら早めに動いてください。

なお、この割引は Travelcard とパスにかかるもので、**都度払い（PAYG）には効きません**。学生は「定期を買ったほうが得」という、一般の在住者とは逆の結論になります。

### 60+ London Oyster photocard

**ロンドンに住む60歳以上**は、TfL の交通機関が**無料**になります（平日の朝の一部時間帯に制限あり）。66歳以降は Freedom Pass に移行し、より広い範囲で使えます。

### Jobcentre Plus Travel Discount Card

求職者手当などを受給している場合、TfL の運賃が半額になるカードが発行されます。Jobcentre Plus の担当者に相談してください。

### 子ども

- **11歳未満**：大人と一緒なら無料
- **11〜15歳**：Zip Oyster photocard でバス無料、地下鉄半額
- **16〜17歳**：Zip Oyster photocard でバス半額、地下鉄半額

Zip Oyster はロンドンの住所と写真が必要で、発行に数週間かかります。`,
      tips: [
        "18+ Student Oyster は年度ごとに再申請が必要。更新を忘れると割引が切れる",
        "60+ London Oyster photocard はロンドン在住が条件。他州から通勤している場合は対象外",
      ],
    },
    {
      id: "decision",
      title: "結局どれを買うか",
      subtitle: "働き方から逆算する",
      body: `ここまでの内容を、判断の順序にまとめます。

**1. 学生か、60歳以上か、求職中か**
→ 該当する割引カードを申請してください。他のどの選択肢より効きます。

**2. Railcard の対象年齢か（16-25 / 26-30 / Senior）**
→ 年 ${gbp(RAILCARD.annual)} で買い、Oyster に紐付けてください。オフピーク中心の生活なら最も費用対効果が高い選択です。

**3. 週5日出社しているか**
→ **はい**：年間 Travelcard（会社の season ticket loan が使えるなら併用）
→ **いいえ（週4日以下）**：**何も買わず、タッチ決済で都度払い**。上限額が自動で守ってくれます

**4. 通勤にバスしか使わないか**
→ 月額 Bus & Tram Pass を検討してください。

**5. 職場も自宅も Zone 1 の外か**
→ Zone 2–4 などの Zone 1 を含まない Travelcard を確認してください。数百ポンド変わります。

### まずやること

TfL のサイトで自分のカードを登録し、**過去1〜2ヶ月の実際の支払額を見てください**。見積もりではなく実績です。これを年換算した金額と、年間 Travelcard の ${gbp(TRAVELCARD.zone1to2.annual)}（該当ゾーン）を比べれば、答えは自動的に出ます。

住む場所を検討している段階なら、家賃と定期代を合わせた総額で比較する必要があります。[エリアの選び方と、家賃と交通費の総額](/housing/where-to-live)で扱っています。`,
      callout: {
        tone: "tip",
        title: "自転車という選択肢を計算に入れる",
        body: `Zone 1–2 の年間 Travelcard ${gbp(TRAVELCARD.zone1to2.annual)} は、**そこそこ良い自転車が1台買える金額**です。通勤距離が5km以内なら、自転車のほうが速く、安く、しかも運動になることがあります。[自分の自転車を買って通勤する](/sightseeing/transport/own-bike)で、Cycle to Work を使った買い方を扱っています。`,
      },
    },
  ],
  faq: [
    {
      question: "7 Day Travelcard は買うべきですか？",
      answer: `**タッチ決済を使っているなら、買う必要はありません**。週の上限額が 7 Day Travelcard とまったく同額に設定されているうえ、上限額なら実際に乗った分しか請求されません。Oyster カードを使っている場合（Oyster の PAYG には週上限が効きません）や、学生割引を効かせたい場合だけ、7日券に意味があります。`,
    },
    {
      question: "年間 Travelcard は得ですか？",
      answer: `**週5日出社しているなら得です。**Zone 1–2 で ${gbp(TRAVELCARD.zone1to2.annual)}、週上限で52週通うより ${gbp(annualSavingAmount("zone1to2"))} 安くなります。ただし**週4日以下の出社なら損**です。週4日なら都度払いのほうが年 ${gbp(TRAVELCARD.zone1to2.annual - hybridWeekly(4) * WORKING_WEEKS)} ほど安くなります。週末の外出頻度によっても変わるので、TfL のサイトで実際の支払い履歴を確認してから決めてください。`,
    },
    {
      question: "Railcard は Oyster に紐付けられますか？",
      answer: `**はい。**地下鉄駅の窓口か TfL Visitor Centre で、Oyster カードと Railcard の両方を見せれば設定してくれます。これでオフピークの運賃と1日上限が${RAILCARD.discountRate}引きになります。ただし**タッチ決済のクレジットカードには紐付けられません**（${TRANSPORT_AS_OF}時点）。Railcard 割引を使うには Oyster が必要です。`,
    },
    {
      question: "Railcard の割引はピーク時間にも効きますか？",
      answer:
        "**効きません。**TfL 網での Railcard 割引は**オフピーク限定**です。平日の朝夕の通勤時間帯に毎日乗るなら、Railcard の恩恵はほとんど受けられません。逆に、時差出勤や在宅勤務中心で日中の移動が多い人には非常に効きます。",
    },
    {
      question: "会社が定期代を出してくれますか？",
      answer:
        "**日本のような「通勤手当」の慣行は英国にはありません**。交通費は原則として自己負担です。代わりに多くの企業が **season ticket loan**（定期券購入のための無利子の給与前貸し）を用意しており、会社が年間定期を立て替えて毎月の給与から天引きされます。人事に確認してください。ただし年度途中で退職すると残額の一括返済を求められます。",
    },
    {
      question: "Zone 1 を通らない通勤なら安くなりますか？",
      answer: `**大幅に安くなります**。たとえば Zone 1–4 の年間 Travelcard は ${gbp(TRAVELCARD.zone1to4.annual)} ですが、Zone 2–4 なら ${gbp(TRAVELCARD_OUTER.zone2to4.annual)} と、${gbp(TRAVELCARD.zone1to4.annual - TRAVELCARD_OUTER.zone2to4.annual)} 違います。職場も自宅も Zone 1 の外にあるなら、必ず Zone 1 を含まない Travelcard の価格を確認してください。`,
    },
  ],
  sources: [
    {
      label: "TfL – Adult caps and Travelcard prices（公式PDF）",
      url: "https://content.tfl.gov.uk/adult-fares.pdf",
    },
    {
      label: "TfL – Travelcards and Bus & Tram Passes",
      url: "https://tfl.gov.uk/fares/find-fares/travelcard-and-bus-pass",
    },
    { label: "Railcards – 公式サイト", url: "https://www.railcard.co.uk/" },
    {
      label: "TfL – 18+ Student Oyster photocard",
      url: "https://tfl.gov.uk/fares/free-and-discounted-travel/18-plus-student-oyster-photocard",
    },
    {
      label: "TfL – 60+ London Oyster photocard",
      url: "https://tfl.gov.uk/fares/free-and-discounted-travel/60-plus-london-oyster-photocard",
    },
  ],
  relatedLinks: [
    {
      href: "/sightseeing/transport/fares",
      label: "運賃と支払い方法のすべて｜タッチ決済・上限額",
    },
    {
      href: "/sightseeing/transport/own-bike",
      label: "自分の自転車を買って通勤する｜Cycle to Work と盗難対策",
    },
    {
      href: "/housing/where-to-live",
      label: "エリアの選び方と、家賃と交通費の総額",
    },
    { href: "/jobs", label: "ロンドンで働く人のための労働問題ガイド" },
  ],
};

export default travelcard;

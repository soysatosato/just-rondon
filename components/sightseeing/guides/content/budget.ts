import type { TravelGuideArticle } from "../types";
import {
  ADMISSIONS,
  BUDGET_AS_OF,
  BUDGET_SOURCES,
  BUDGET_UPDATED_AT,
  DAILY_TOTALS,
  EXTRAS,
  FOOD_PER_DAY,
  FREE_HIGHLIGHTS,
  LODGING,
  SUGGESTED_DONATION,
  TRIP_NIGHTS,
  gbp,
  gbpRange,
  lodgingTotal,
  perDay,
} from "@/lib/sightseeing/budget";
import { CAPS, AIRPORTS } from "@/lib/transport/rates";
import { MEAL_DEALS } from "@/lib/food/prices";

/**
 * 金額はすべて lib/sightseeing/budget.ts から引く。ここにべた書きしない。
 * 交通費は lib/transport/rates.ts、食費の単価は lib/food/prices.ts が持つ。
 *
 * 為替レートは書かない。travel-tips と同じ理由(書いた瞬間に古くなり、
 * 読者が誤った予算を立てる)。円換算は読者自身にやってもらう。
 *
 * 航空券は積算に含めない。出発地・時期・航空会社で10万円単位で動き、
 * 幅を書いても予算の役に立たないため。「現地費用」に絞ることで
 * この記事の数字は最後まで信用できる。
 */
const budget: TravelGuideArticle = {
  slug: "budget",
  title:
    "ロンドン旅行の予算｜7日間の費用を宿・食・交通・入場で積算（2026年版）",
  engTitle: "London Travel Budget",
  summary:
    "「ロンドンは高い」で終わらせず、7泊ぶんの現地費用を宿・食・交通・入場料に分けて積算しました。節約・標準・ゆとりの3つの予算帯で1日あたりの金額を出し、どこを削ると効くのかまで踏み込みます。航空券を除いた「着いてから使う金額」の話です。",
  description:
    "ロンドン7日間の旅行予算を宿泊・食費・交通費・入場料に分けて積算。節約・標準・ゆとりの3パターンで内訳と合計を示し、無料の博物館や交通費の上限額など、実際に効く節約ポイントを解説します。2026年8月時点の料金。",
  keywords: [
    "ロンドン 旅行 予算",
    "ロンドン 7日間 費用",
    "ロンドン 物価",
    "イギリス 旅行 費用",
    "ロンドン 節約",
    "ロンドン 入場料",
  ],
  dataAsOf: BUDGET_AS_OF,
  updatedAt: BUDGET_UPDATED_AT,
  mainText: `ロンドンの旅行予算は、**「1日いくら」を宿・食・交通・入場の4つに割って積み上げる**のがいちばん外しません。合計だけ眺めても、どこを削れば効くのかが見えないからです。

この記事では**${TRIP_NIGHTS}泊ぶんの現地費用**を3つの予算帯で積算しました。**いずれも各項目の下限を積んだ「最低ライン」**です。実際には宿の時期変動と予備費が乗るので、ここに1〜3割を足して考えてください。

| 予算帯 | 1人1日あたり | ${TRIP_NIGHTS}日間の合計 |
|---|---|---|
| **節約** | 約 ${gbp(perDay(DAILY_TOTALS.thrifty.tripTotal))} | 約 ${gbp(DAILY_TOTALS.thrifty.tripTotal)} |
| **標準** | 約 ${gbp(perDay(DAILY_TOTALS.standard.tripTotal))} | 約 ${gbp(DAILY_TOTALS.standard.tripTotal)} |
| **ゆとり** | 約 ${gbp(perDay(DAILY_TOTALS.comfortable.tripTotal))} | 約 ${gbp(DAILY_TOTALS.comfortable.tripTotal)} |

**航空券は含めていません。**出発地・時期・航空会社で10万円単位で動くため、幅を書いても予算の役に立たないからです。ここは「着いてから使う金額」に絞ります。

**為替レートも意図的に書いていません。**渡航直前にご自身で確認してください。`,
  sections: [
    {
      id: "structure",
      title: "予算の構造 — 宿が6割を決める",
      subtitle: "削って効く順番を先に知る",
      body: `ロンドンの旅行費用は、**項目ごとに「動かせる幅」がまるで違います。**

| 項目 | 総額に占める割合の目安 | 動かせる幅 |
|---|---|---|
| **宿泊** | 40〜60% | **非常に大きい**。ここが予算を決める |
| **食費** | 20〜30% | **大きい**。工夫が直接効く |
| **入場料** | 5〜20% | **大きい**。無料施設だけでも成立する |
| **交通費** | 8〜12% | **小さい**。上限額があるため天井が決まっている |

つまり、**節約したいなら手を付ける順番は「宿 → 食 → 入場料」**です。交通費を削っても総額はほとんど変わりません（後述しますが、上限額の仕組みで最初から天井が決まっています）。

逆に言えば、**交通費は最初に確定できる**ということでもあります。予算を立てるとき、いちばん読みにくい宿から決めて、交通費は固定費として置いてしまうのが早いです。`,
      tips: [
        "1人旅とふたり旅では1人あたりの宿泊費が倍近く違う。宿は「1室あたり」で価格が付くため、割り勘が効く",
        "滞在を1泊延ばすより、1泊減らして宿のグレードを上げたほうが満足度が高いことが多い",
      ],
    },
    {
      id: "lodging",
      title: "宿泊費",
      subtitle: `${TRIP_NIGHTS}泊でいくらになるか`,
      body: `ロンドンの宿は**season と曜日で倍近く動きます。**下の表は通年の目安です。

| タイプ | 1泊 | ${TRIP_NIGHTS}泊の合計 | 備考 |
|---|---|---|---|
| ${LODGING.hostelDorm.label} | ${gbpRange(LODGING.hostelDorm)} | ${lodgingTotal(LODGING.hostelDorm)} | ${LODGING.hostelDorm.note} |
| ${LODGING.budgetHotel.label} | ${gbpRange(LODGING.budgetHotel)} | ${lodgingTotal(LODGING.budgetHotel)} | ${LODGING.budgetHotel.note} |
| ${LODGING.apartment.label} | ${gbpRange(LODGING.apartment)} | ${lodgingTotal(LODGING.apartment)} | ${LODGING.apartment.note} |
| ${LODGING.midRange.label} | ${gbpRange(LODGING.midRange)} | ${lodgingTotal(LODGING.midRange)} | ${LODGING.midRange.note} |

**ホステル以外は「1室あたり」の価格です。**ふたりで泊まれば1人あたりは半分になります。ここが1人旅とふたり旅で総額の印象が大きく変わる理由です。

### 高くなる時期

- **6〜8月**：観光のピーク。最も高い
- **12月中旬〜クリスマス**：マーケットとイルミネーションで上がる
- **大型イベントの開催週**：ウィンブルドン、大きな展示会など

### 安くなる時期

- **1〜2月**：最安。ただし日照が短く寒い
- **11月**（クリスマス前）：比較的落ち着く

### 立地をどう考えるか

ゾーン1の中心部にこだわると跳ね上がります。ただし、**ゾーン2〜3に出しても交通費は上限額で頭打ち**になるため、宿代の下がり幅のほうがたいてい大きい。地下鉄の駅から徒歩5分以内なら、ゾーン2は十分に現実的な選択です。`,
      callout: {
        tone: "info",
        title: "エリアごとの向き不向き",
        body: "どのエリアに泊まると何が近いのか、日本人が驚くポイントは何かは[宿泊エリア別ホテル選び](/sightseeing/hotels)で詳しく比較しています。",
      },
      tips: [
        "英国のホテルは部屋が狭い。日本のビジネスホテルより狭いことも珍しくない",
        "古い建物の宿はエレベーターが無いことがある。大きなスーツケースなら事前に確認する",
        "朝食込みかどうかで実質的な価格が変わる。1人£15前後の差になる",
      ],
    },
    {
      id: "food",
      title: "食費",
      subtitle: "1日£15でも£70でも成立する",
      body: `食費は**工夫がそのまま金額に出る**項目です。

| 帯 | 1日あたり | ${TRIP_NIGHTS}日間 | 中身 |
|---|---|---|---|
| ${FOOD_PER_DAY.thrifty.label} | ${gbp(FOOD_PER_DAY.thrifty.perDay)} | ${gbp(FOOD_PER_DAY.thrifty.perDay * TRIP_NIGHTS)} | ${FOOD_PER_DAY.thrifty.note} |
| ${FOOD_PER_DAY.standard.label} | ${gbp(FOOD_PER_DAY.standard.perDay)} | ${gbp(FOOD_PER_DAY.standard.perDay * TRIP_NIGHTS)} | ${FOOD_PER_DAY.standard.note} |
| ${FOOD_PER_DAY.comfortable.label} | ${gbp(FOOD_PER_DAY.comfortable.perDay)} | ${gbp(FOOD_PER_DAY.comfortable.perDay * TRIP_NIGHTS)} | ${FOOD_PER_DAY.comfortable.note} |

### Meal Deal が効く

スーパーやドラッグストアの **Meal Deal**（メイン＋スナック＋ドリンクのセット）が、ロンドンの昼食の基準線です。

| 店 | 通常価格 | 会員価格 |
|---|---|---|
| ${MEAL_DEALS.tesco.label} | ${gbp(MEAL_DEALS.tesco.standard)} | ${gbp(MEAL_DEALS.tesco.member)} |
| ${MEAL_DEALS.sainsburys.label} | ${gbp(MEAL_DEALS.sainsburys.standard)} | ${gbp(MEAL_DEALS.sainsburys.member)} |
| ${MEAL_DEALS.boots.label} | ${gbp(MEAL_DEALS.boots.standard)} | ${gbp(MEAL_DEALS.boots.member)} |
| ${MEAL_DEALS.coop.label} | ${gbp(MEAL_DEALS.coop.standard)} | ${gbp(MEAL_DEALS.coop.member)} |

**昼を Meal Deal にするだけで、1日£10前後が浮きます。**${TRIP_NIGHTS}日なら£70。これは入場料2つぶんです。

### 外食の単価感

- パブのビール1パイント（ゾーン1）：**${gbp(EXTRAS.pintZone1)}前後**
- カフェのコーヒー：**${gbp(EXTRAS.coffee)}前後**
- パブの食事（メイン1皿）：£16〜22
- きちんとしたレストランのディナー：1人£45〜

### 水を買わない

**ロンドンの水道水は飲めます。**マイボトルを持って行けば、それだけで1日£2〜3、${TRIP_NIGHTS}日で£15〜20が浮きます。`,
      callout: {
        tone: "info",
        title: "食費をもっと下げる",
        body: "閉店前の値引き、余剰food アプリ、学割など、ロンドンで食費を抑える手段は[ロンドンの食費節約](/food)にまとめています。",
      },
      tips: [
        "着席型のレストランでは伝票に service charge が12.5%前後加算されている。予算に乗せておく",
        "パブはカウンターで注文して先払い。席で待っていても誰も来ない",
        "宿にキッチンがあるなら、朝食だけ自炊するだけで1日£8前後が浮く",
      ],
    },
    {
      id: "transport",
      title: "交通費",
      subtitle: "上限額があるので天井が決まっている",
      body: `**ロンドンの交通費は、予算のうちで唯一「最悪でもこれ以上かからない」と言い切れる項目です。**タッチ決済には1日・1週間の上限額（capping）があり、それを超えて課金されません。

| 区間 | 1日の上限 | 週の上限 |
|---|---|---|
| Zone 1〜2 | **${gbp(CAPS.zone1to2.daily)}** | **${gbp(CAPS.zone1to2.weekly)}** |
| Zone 1〜3 | ${gbp(CAPS.zone1to3.daily)} | ${gbp(CAPS.zone1to3.weekly)} |
| Zone 1〜6 | ${gbp(CAPS.zone1to6.daily)} | ${gbp(CAPS.zone1to6.weekly)} |

観光の大半は Zone 1〜2 に収まります。つまり、**どれだけ乗っても週${gbp(CAPS.zone1to2.weekly)}**。これが交通費の天井です。

### 切符は買わない

**Oyster カードも1日券も、旅行者にはほぼ不要です。**手持ちの Visa / Mastercard のタッチ決済でそのまま改札を通れます。上限額も自動で効きます。

**ただし JCB は使えません。**Visa か Mastercard を必ず用意してください。

### 空港からの移動

ここは上限額と別枠で見ておく必要があります。

| 手段 | 片道 |
|---|---|
| ピカデリー線（ヒースロー↔Zone 1） | ${gbp(AIRPORTS.heathrow.piccadillyFromZone1)} |
| エリザベス・ライン（同） | ${gbp(AIRPORTS.heathrow.elizabethFromZone1)} |
| ヒースロー・エクスプレス（当日券） | ${gbp(AIRPORTS.heathrow.expressOnDay)} |
| ヒースロー・エクスプレス（30日以上前の予約） | ${gbp(AIRPORTS.heathrow.expressAdvanceFrom)}〜 |

**急がないならピカデリー線が圧倒的に安い。**所要時間は50分ほどかかりますが、往復で£40近い差になります。

### ${TRIP_NIGHTS}日間の交通費の目安

Zone 1〜2 の週上限 ${gbp(CAPS.zone1to2.weekly)} ＋ 空港往復（ピカデリー線で ${gbp(AIRPORTS.heathrow.piccadillyFromZone1 * 2)}）＝ **約 ${gbp(CAPS.zone1to2.weekly + AIRPORTS.heathrow.piccadillyFromZone1 * 2)}**。

総額に占める割合は1割前後です。**ここを削る努力は、費用対効果が悪い。**`,
      callout: {
        tone: "info",
        title: "運賃と上限額の詳しい仕組み",
        body: "ゾーンの数え方、ピーク・オフピーク、バスのホッパー運賃などは[ロンドンの交通ガイド](/sightseeing/transport)で9本に分けて解説しています。",
      },
    },
    {
      id: "admissions",
      title: "入場料",
      subtitle: "無料の施設だけでも旅は成立する",
      body: `**ロンドン最大の武器は、一級の博物館・美術館が軒並み無料なことです。**

### 無料で入れる主要施設

${FREE_HIGHLIGHTS.map((n) => `- ${n}`).join("\n")}

いずれも常設展が無料です。入口に**任意の寄付（${gbp(SUGGESTED_DONATION)}前後が推奨額として掲示される）**の箱がありますが、義務ではありません。特別展は別料金です。

**この8施設だけで、まる3日は埋まります。**入場料£0で。

### 有料の主要施設

| 施設 | 大人1名 |
|---|---|
| ロンドン塔 | ${gbp(ADMISSIONS.towerOfLondon)} |
| ウェストミンスター寺院 | ${gbp(ADMISSIONS.westminsterAbbey)} |
| セント・ポール大聖堂 | ${gbp(ADMISSIONS.stPaulsCathedral)} |
| チャーチル戦時執務室 | ${gbp(ADMISSIONS.churchillWarRooms)} |
| ウィンザー城 | ${gbp(ADMISSIONS.windsorCastle)} |
| ザ・シャード（展望台） | ${gbp(ADMISSIONS.shardView)} |
| ロンドン・アイ | ${gbp(ADMISSIONS.londonEye)} |
| キュー・ガーデン | ${gbp(ADMISSIONS.kewGardens)} |
| ワーナー・ブラザース スタジオツアー | ${gbp(ADMISSIONS.harryPotterStudio)} |

**多くの施設はオンラインの事前購入が当日窓口より安く、しかも列に並ばずに済みます。**行くと決めているなら、必ず先に買ってください。

### 予算への乗せ方

有料施設を**${TRIP_NIGHTS}日で3つ**に絞れば、入場料は約£90。**5つ**なら約£155。無料施設と組み合わせれば、ここは自分でコントロールできる項目です。`,
      tips: [
        "ロンドン塔とウェストミンスター寺院は所要2〜3時間。1日に2つ以上の有料施設を詰めると駆け足になる",
        "展望台は無料の選択肢がある。Sky Garden は事前予約制で無料、テート・モダンの最上階も無料",
        "学生証（国際学生証を含む）で割引になる施設が多い。持っているなら必ず提示する",
      ],
    },
    {
      id: "extras",
      title: "そのほかの出費",
      body: `積算から漏れやすい項目です。

| 項目 | 目安 |
|---|---|
| ミュージカル（安い席） | ${gbp(EXTRAS.musicalCheap)}〜 |
| ミュージカル（中位の席） | ${gbp(EXTRAS.musicalMid)}前後 |
| ミュージカル（良席） | ${gbp(EXTRAS.musicalPremium)}〜 |
| アフタヌーンティー | ${gbp(EXTRAS.afternoonTeaFrom)}〜 |
| 土産（1週間ぶんの総額） | ${gbp(EXTRAS.souvenirsTypical)}前後 |
| 海外旅行保険 | ${EXTRAS.insuranceNote} |

### 忘れやすいもの

- **公衆トイレ**：20〜50p のことがある（博物館・デパート・パブは無料）
- **レジ袋**：有料。エコバッグを持って行く
- **チップ**：着席型レストランの service charge 12.5%前後は伝票に自動加算
- **データ通信**：eSIM で1週間£10前後

### 免税は無い

**英国の旅行者向け VAT 還付制度は2021年1月に廃止されました。**買い物をしても税金は戻ってきません。古いガイドブックには還付手続きの説明が残っていることがありますが、予算に「還付ぶん」を見込まないでください。`,
      callout: {
        tone: "warn",
        title: "海外旅行保険は予算に必ず入れる",
        body: "NHS は旅行者に無料ではありません。無保険で大きなけがや病気をすると、自己負担が数十万円〜数百万円規模になり得ます。削ってよい項目ではありません。",
      },
    },
    {
      id: "models",
      title: `${TRIP_NIGHTS}日間の積算モデル`,
      subtitle: "3つの予算帯で組んでみる",
      body: `ここまでの数字を、実際に足してみます。**すべて1人あたり・${TRIP_NIGHTS}泊・航空券を除く現地費用**です。

### 節約モデル（1日あたり約 ${gbp(perDay(DAILY_TOTALS.thrifty.tripTotal))}）

| 項目 | ${TRIP_NIGHTS}日間 |
|---|---|
| 宿（ホステルのドミトリー） | ${gbp(LODGING.hostelDorm.min * TRIP_NIGHTS)}〜 |
| 食費（Meal Deal 中心） | ${gbp(FOOD_PER_DAY.thrifty.perDay * TRIP_NIGHTS)} |
| 交通（週上限＋空港往復） | ${gbp(CAPS.zone1to2.weekly + AIRPORTS.heathrow.piccadillyFromZone1 * 2)} |
| 入場料（無料施設のみ） | ${gbp(0)} |
| **合計** | **約 ${gbp(DAILY_TOTALS.thrifty.tripTotal)}** |

無料の博物館だけで組んでも、ロンドンは十分に楽しめます。

### 標準モデル（1日あたり約 ${gbp(perDay(DAILY_TOTALS.standard.tripTotal))}）

| 項目 | ${TRIP_NIGHTS}日間 |
|---|---|
| 宿（格安チェーン・2人で1室を割り勘） | ${gbp((LODGING.budgetHotel.min * TRIP_NIGHTS) / 2)}〜 |
| 食費（昼は軽く、夜はパブ） | ${gbp(FOOD_PER_DAY.standard.perDay * TRIP_NIGHTS)} |
| 交通（週上限＋空港往復） | ${gbp(CAPS.zone1to2.weekly + AIRPORTS.heathrow.piccadillyFromZone1 * 2)} |
| 入場料（有料3施設） | 約 ${gbp(90)} |
| ミュージカル1本 | ${gbp(EXTRAS.musicalMid)} |
| **合計** | **約 ${gbp(DAILY_TOTALS.standard.tripTotal)}** |

多くの旅行者が現実的に着地するのはこの帯です。

### ゆとりモデル（1日あたり約 ${gbp(perDay(DAILY_TOTALS.comfortable.tripTotal))}）

| 項目 | ${TRIP_NIGHTS}日間 |
|---|---|
| 宿（中級ホテル・2人で1室を割り勘） | ${gbp((LODGING.midRange.min * TRIP_NIGHTS) / 2)}〜 |
| 食費（1日1回はレストラン） | ${gbp(FOOD_PER_DAY.comfortable.perDay * TRIP_NIGHTS)} |
| 交通（週上限＋空港はエリザベス・ライン往復） | ${gbp(CAPS.zone1to2.weekly + AIRPORTS.heathrow.elizabethFromZone1 * 2)} |
| 入場料（有料5施設＋日帰り遠出） | 約 ${gbp(200)} |
| ミュージカル良席＋アフタヌーンティー | 約 ${gbp(EXTRAS.musicalPremium + EXTRAS.afternoonTeaFrom)} |
| **合計** | **約 ${gbp(DAILY_TOTALS.comfortable.tripTotal)}** |

**どのモデルでも、交通費だけはほぼ同額です。**上限額があるので、そういう構造になっています。

### この数字の読み方

上の3つは、**各項目の下限を積んだ最低ライン**です。宿を範囲の上限で取れば節約モデルでも£500近くになりますし、繁忙期はさらに動きます。**予備費として1〜3割を上乗せして考えてください。**`,
      tips: [
        "予備費として総額の10〜15%を上乗せしておく。天候で予定を変える、体調を崩す、良い土産を見つける",
        "現金は£20〜50で足りる。残りはすべてカードで払える",
        "決済端末で「円建てで払うか」と聞かれたら必ず断る。ポンド建てのほうが有利",
      ],
    },
    {
      id: "cutting",
      title: "削るならここ",
      subtitle: "効く順に並べる",
      body: `1. **宿をゾーン2に出す** — 1泊£30前後下がることがあり、${TRIP_NIGHTS}泊で£200以上。交通費は上限額で頭打ちなので、下がった宿代がそのまま残る
2. **昼を Meal Deal にする** — 1日£10前後、${TRIP_NIGHTS}日で£70
3. **有料施設を絞る** — 無料の8施設で3日は埋まる。有料は「本当に見たい3つ」に
4. **空港はピカデリー線** — ヒースロー・エクスプレスとの往復差は£40前後
5. **マイボトルを持つ** — 水道水が飲めるので、${TRIP_NIGHTS}日で£15〜20
6. **ミュージカルは当日券・立ち見・平日マチネ** — 良席の半額以下になることがある

### 逆に、削らないほうがいいもの

- **海外旅行保険** — 削ってはいけません
- **歩きやすい靴** — 1日1万歩以上歩きます。ここをケチると旅程が壊れます
- **通信手段** — 地図と乗換案内が使えないと、結果的にタクシー代がかさむ`,
    },
  ],
  faq: [
    {
      question: "ロンドン7日間の旅行費用は、結局いくらですか？",
      answer: `**航空券を除いた現地費用で、1人あたり約${gbp(DAILY_TOTALS.thrifty.tripTotal)}〜${gbp(DAILY_TOTALS.comfortable.tripTotal)}**です。1日あたりに直すと、節約で約${gbp(perDay(DAILY_TOTALS.thrifty.tripTotal))}、標準的な旅行で約${gbp(perDay(DAILY_TOTALS.standard.tripTotal))}、ゆとりを持って約${gbp(perDay(DAILY_TOTALS.comfortable.tripTotal))}が目安になります。ただしこれは各項目の下限を積んだ最低ラインなので、**予備費として1〜3割を上乗せ**してください。差を生むのは主に宿泊費です。`,
    },
    {
      question: "交通費は1週間でいくらかかりますか？",
      answer: `**Zone 1〜2 なら週${gbp(CAPS.zone1to2.weekly)}が上限**です。タッチ決済には1日・1週間の上限額があり、それ以上は課金されません。空港往復（ピカデリー線で${gbp(AIRPORTS.heathrow.piccadillyFromZone1 * 2)}）を足しても、${TRIP_NIGHTS}日で約${gbp(CAPS.zone1to2.weekly + AIRPORTS.heathrow.piccadillyFromZone1 * 2)}です。`,
    },
    {
      question: "入場料を抑えるにはどうすればいいですか？",
      answer: `**大英博物館、ナショナル・ギャラリー、テート・モダン、自然史博物館、V&A など主要な博物館・美術館は常設展が無料**です。これだけで3日は埋まります。有料施設を「本当に見たい3つ」に絞れば、入場料は${TRIP_NIGHTS}日で£90前後に収まります。`,
    },
    {
      question: "1人旅とふたり旅で、1人あたりの費用は変わりますか？",
      answer:
        "**大きく変わります。**ホテルは「1室あたり」で価格が付くため、ふたりで泊まれば1人あたりの宿泊費はほぼ半分になります。宿泊費は総額の4〜6割を占めるので、1人あたりの総額で2〜3割の差が出ます。",
    },
    {
      question: "現金はいくら必要ですか？",
      answer:
        "**£20〜50で十分**です。ロンドンはほぼ完全にキャッシュレスで、カフェ・パブ・スーパー・地下鉄・タクシーまでカードで完結します。ただし**JCB はほぼ使えない**ため、Visa か Mastercard を用意してください。",
    },
    {
      question: "免税手続きで安くなりますか？",
      answer:
        "**なりません。**英国の旅行者向け VAT 還付制度は2021年1月に廃止されました。買い物をしても税金は戻ってこないので、予算に還付ぶんを見込まないでください。",
    },
    {
      question: "予備費はどれくらい見ておくべきですか？",
      answer:
        "**総額の10〜15%**を目安にしてください。天候で予定を変える、体調を崩して薬を買う、想定外に良い土産を見つける——このあたりで必ず動きます。",
    },
  ],
  sources: [...BUDGET_SOURCES],
  relatedLinks: [
    {
      href: "/sightseeing/hotels",
      label: "宿泊エリア別ホテル選び",
    },
    {
      href: "/sightseeing/transport",
      label: "ロンドンの交通ガイド｜運賃と上限額の仕組み",
    },
    {
      href: "/food",
      label: "ロンドンの食費節約",
    },
    {
      href: "/sightseeing/tipping-and-payment",
      label: "チップと支払い｜service charge・カード・両替",
    },
    {
      href: "/sightseeing/itinerary",
      label: "ロンドン モデルコース（1〜5日）",
    },
    {
      href: "/sightseeing/travel-tips",
      label: "ロンドン旅行の実用情報",
    },
  ],
};

export default budget;

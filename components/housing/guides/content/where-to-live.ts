import type { HousingGuideArticle } from "../types";
import {
  HOUSING_AS_OF,
  HOUSING_SOURCES,
  HOUSING_UPDATED_AT,
  LONDON_RENT,
  TRAVELCARD_MONTHLY,
  gbp,
} from "@/lib/housing/rates";

const whereToLive: HousingGuideArticle = {
  slug: "where-to-live",
  title: "ロンドンのエリア選び｜家賃と交通費の総額で考える住む場所",
  engTitle: "Choosing Where to Live in London",
  audience: "どのエリアに住むべきか、判断の軸が分からない人",
  summary: `Zone 3 の安い家賃は、定期代の差で消えることがあります。Zone 1-2 の月額 Travelcard が${gbp(
    TRAVELCARD_MONTHLY.zone1to2
  )}、Zone 1-4 なら${gbp(
    TRAVELCARD_MONTHLY.zone1to4
  )}。この差を家賃に足して比べるのが最初の一歩です。加えて治安データ、council tax band、EPC の調べ方を実務レベルで扱います。`,
  description:
    "ロンドンでどのエリアに住むかを、家賃と交通費の総額で判断する方法を解説。Travelcardのゾーン別料金、police.ukでの治安データの調べ方、council tax bandとEPCの確認手順、通勤時間の実測方法まで。",
  keywords: [
    "ロンドン エリア 選び",
    "ロンドン 住む 場所",
    "Travelcard ゾーン 料金",
    "ロンドン 治安 調べ方",
    "council tax band",
    "ロンドン 家賃 相場 エリア",
    "通勤 時間 ロンドン",
  ],
  dataAsOf: HOUSING_AS_OF,
  updatedAt: HOUSING_UPDATED_AT,
  atAGlance: [
    {
      label: "Zone 1-2 定期",
      value: `月${gbp(TRAVELCARD_MONTHLY.zone1to2)}`,
    },
    {
      label: "Zone 1-4 定期",
      value: `月${gbp(TRAVELCARD_MONTHLY.zone1to4)}（Zone 1-2 との差は月${gbp(
        Math.round((TRAVELCARD_MONTHLY.zone1to4 - TRAVELCARD_MONTHLY.zone1to2) * 10) / 10
      )}）`,
    },
    { label: "比較の単位", value: "家賃 ＋ 定期代 ＋ council tax ＋ 冬の暖房費" },
    { label: "治安の確認", value: "police.uk で通り単位の犯罪データが見られる" },
    { label: "見落としがち", value: "council tax band と EPC。合わせて月£200近く動く" },
  ],
  mainText: `「ロンドンのどこに住めばいいですか」という質問に、エリア名で答えるのはあまり意味がありません。予算、通勤先、生活スタイルによって最適解が変わるからです。

代わりに、**判断の軸**を渡します。この記事で扱うのは次の4つです。

1. **家賃と交通費を足した総額**で比べる
2. **治安**をデータで確認する
3. **council tax band** と **EPC** という、家賃表示に出てこないコスト
4. **通勤時間を実測する**

このうち最初の1つを知らないまま「家賃が安いから」でエリアを決めると、**年間で£1,000以上を無駄にする**ことがあります。`,
  sections: [
    {
      id: "total-cost",
      title: "家賃だけで比べてはいけない",
      subtitle: "定期代を足すと逆転する",
      body: `ロンドンの交通は同心円状のゾーン制で、中心から離れるほど定期代が上がります。2026年4月改定の月額 Travelcard は次のとおりです。

| ゾーン | 月額 Travelcard | Zone 1-2 との差 |
| --- | --- | --- |
| Zone 1-2 | ${gbp(TRAVELCARD_MONTHLY.zone1to2)} | — |
| Zone 1-3 | ${gbp(TRAVELCARD_MONTHLY.zone1to3)} | +${gbp(
        Math.round((TRAVELCARD_MONTHLY.zone1to3 - TRAVELCARD_MONTHLY.zone1to2) * 10) / 10
      )} |
| Zone 1-4 | ${gbp(TRAVELCARD_MONTHLY.zone1to4)} | +${gbp(
        Math.round((TRAVELCARD_MONTHLY.zone1to4 - TRAVELCARD_MONTHLY.zone1to2) * 10) / 10
      )} |
| Zone 1-5 | ${gbp(TRAVELCARD_MONTHLY.zone1to5)} | +${gbp(
        Math.round((TRAVELCARD_MONTHLY.zone1to5 - TRAVELCARD_MONTHLY.zone1to2) * 10) / 10
      )} |
| Zone 1-6 | ${gbp(TRAVELCARD_MONTHLY.zone1to6)} | +${gbp(
        Math.round((TRAVELCARD_MONTHLY.zone1to6 - TRAVELCARD_MONTHLY.zone1to2) * 10) / 10
      )} |

### 具体例

Zone 2 の部屋が月£1,100、Zone 4 の部屋が月£950。**家賃だけ見れば Zone 4 が月£150安い**。

しかし定期代を足すと：

- Zone 2: £1,100 ＋ ${gbp(TRAVELCARD_MONTHLY.zone1to2)} = **${gbp(
        Math.round(1100 + TRAVELCARD_MONTHLY.zone1to2)
      )}**
- Zone 4: £950 ＋ ${gbp(TRAVELCARD_MONTHLY.zone1to4)} = **${gbp(
        Math.round(950 + TRAVELCARD_MONTHLY.zone1to4)
      )}**

差は月£${Math.round(
        1100 + TRAVELCARD_MONTHLY.zone1to2 - (950 + TRAVELCARD_MONTHLY.zone1to4)
      )}まで縮まります。ここに**通勤時間が片道20分延びること**（年間で約160時間）を加えると、判断は変わってきます。

### 通勤しない人は逆になる

在宅勤務が中心なら、定期を買う必要がありません。その場合は外側のゾーンで広い部屋に住むほうが合理的です。**自分が週に何日通勤するかを先に決めてから**、エリアを絞ってください。

週2日の出社なら定期は不要で、都度払い（contactless の日次・週次上限が適用される）のほうが安く済みます。`,
      tips: [
        "Travelcard を買わなくても、contactless / Oyster には日次と週次の上限（cap）が自動適用されます。週3日以下の通勤なら、定期より上限のほうが安くなることが多いです。",
        "ゾーンの境界にある駅は狙い目です。Zone 2/3 境界の駅なら Zone 1-2 の定期で乗れることがあります。TfL のサイトで駅ごとのゾーンを確認してください。",
        "バスは全ゾーン共通料金で、地下鉄より大幅に安いです。バス通勤が現実的な距離なら、交通費の計算がまったく変わります。",
      ],
      callout: {
        tone: "tip",
        title: "相場の基準線",
        body: `判断の物差しとして、現在の相場を押さえておいてください。

- 一棟まるごと（フラット・ハウス）の平均：月${gbp(
          LONDON_RENT.onsGreaterLondonMonthly
        )}（ONS、2026年上半期）
- シェアの1部屋：インナーロンドン月${gbp(
          LONDON_RENT.roomInnerLondonMonthly
        )}、アウターロンドン月${gbp(
          LONDON_RENT.roomOuterLondonMonthly
        )}（SpareRoom、2026年Q2）

提示された家賃がこの水準から大きく外れている場合、**安ければ理由を探し、高ければ交渉の余地を探る**——どちらにしても確認すべき情報があります。`,
      },
    },
    {
      id: "commute",
      title: "通勤時間を実測する",
      subtitle: "「駅から徒歩5分」は信用しない",
      body: `募集文の所要時間は、ほぼ例外なく楽観的です。実測してください。

### 確認の手順

1. **Citymapper か Google Maps で、物件の住所から勤務先まで検索する。** 駅名ではなく住所で。
2. **平日の朝8時台で検索する。** 時刻を指定しないと、空いている時間帯の所要時間が出ます。
3. **乗り換え回数を見る。** 所要時間が同じでも、乗り換え2回と直通では疲労度が違います。
4. **駅までの徒歩時間を、実際に歩いて確かめる。** 内見のときに駅から歩いてください。

### 「直通かどうか」は所要時間より重要

ロンドンの地下鉄はラッシュ時に相当混みます。乗り換えのたびに階段とホームの混雑を通過するため、**乗り換え1回は体感で10分以上の負荷**になります。

45分の直通と、35分で乗り換え2回なら、多くの人にとって前者のほうが楽です。

### 路線の信頼性も見る

路線によって遅延・運休の頻度が違います。TfL のサイトで各路線の運行状況の履歴が公開されているほか、住んでいる人に聞くのが最も確実です。

Elizabeth line（2022年開業）は新しく、速く、比較的空いています。沿線の家賃は開業後に上がりましたが、通勤の質は明確に高いです。`,
      tips: [
        "夜遅い時間の帰宅ルートも確認してください。終電の時刻、Night Tube（金土のみ運行の路線がある）の有無、駅から家までの道の明るさ。",
        "自転車通勤が可能な距離なら、交通費がゼロになります。ロンドンはサイクルレーンの整備が進んでおり、Zone 2 圏内なら現実的な選択肢です。",
        "内見のとき、実際に自分が使う時間帯の電車に乗って行ってみるのが最も確実です。手間はかかりますが、毎日のことなので投資に見合います。",
      ],
    },
    {
      id: "safety",
      title: "治安をデータで確認する",
      subtitle: "評判ではなく、通り単位の統計を見る",
      body: `「あのエリアは危ない」という話は、たいてい何年も前の評判が更新されないまま流通しています。ロンドンは再開発のスピードが速く、10年で様変わりするエリアが珍しくありません。

**データで確認してください。**

### police.uk

英国警察の公式サイト [police.uk](https://www.police.uk/) では、**通り単位の犯罪統計**が月次で公開されています。

1. 物件の住所または郵便番号を入力
2. 地図上に、その周辺で発生した犯罪がカテゴリ別・月別に表示される
3. 犯罪の種類（窃盗、暴行、自転車盗、住居侵入など）まで分かる

見るべきは**総数より種類**です。繁華街に近ければ酔客がらみのトラブルが増えるのは当然で、それが自分の生活に影響するかは別問題です。一方で**住居侵入（burglary）と自転車盗（bicycle theft）**は、住民として直接影響を受けます。

### 現地で見ること

データに出ないものもあります。内見のついでに確認してください。

- **夜に歩いてみる。** 街灯の間隔、人通り、店が開いているか
- **駅から家までの道。** 遠回りでも明るい道があるか
- **建物のセキュリティ。** 共用エントランスにオートロックがあるか、郵便受けの状態
- **ゴミの管理。** 集積所が荒れている建物は、管理全般が緩い傾向があります

### エリアの評判より、通り単位で見る

同じ地名でも、通り1本で雰囲気が変わるのがロンドンです。「◯◯は治安が悪い」というくくりではなく、**その物件の住所**で調べてください。`,
      callout: {
        tone: "info",
        title: "自転車を持つなら盗難対策を前提に",
        body: `ロンドンの自転車盗難は非常に多く、police.uk のデータでも上位に来ます。屋内保管ができる物件か、鍵のかかる駐輪場があるかを内見で確認してください。

路上に停めた自転車は、良い鍵を使っていても盗まれることがあります。自転車通勤を考えているなら、**保管場所を物件選びの条件に入れる**べきです。`,
      },
    },
    {
      id: "council-tax-epc",
      title: "家賃表示に出てこない2つのコスト",
      subtitle: "council tax band と EPC",
      body: `### council tax

自治体税で、**家賃とは別に毎月かかります**。物件の評価額に応じて Band A〜H に分類され、自治体ごとに税率が違います。

ロンドンの Band C〜D なら年間£1,500〜2,000程度、**月額に直すと£125〜170**。これは家賃の1割前後に相当する額です。

**調べ方**：GOV.UK の [Check your Council Tax band](https://www.gov.uk/council-tax-bands) に住所を入れれば、その物件の band が分かります。自治体のサイトで band ごとの年額が公開されているので、掛け合わせれば月額が出ます。

**免除・割引**
- **フルタイムの学生は免除**（世帯全員が学生の場合）
- **単身世帯は25%割引**（single person discount）

学生ビザで来る人は、入居後に自治体へ在学証明を提出してください。申請しないと請求され続けます。

### EPC（Energy Performance Certificate）

省エネ性能の格付け（A〜G）です。**民間賃貸は最低E以上でなければ貸し出せません**。

実用上の意味は**冬の暖房費**です。同じ広さでも、C評価とE評価では月の光熱費が£50〜100変わることがあります。

**調べ方**：GOV.UK の [Find an energy certificate](https://www.gov.uk/find-energy-certificate) で住所検索すれば、**内見前に**確認できます。証明書には推定光熱費と、改善のための推奨事項まで載っています。

### 総額での比較表

エリアを比べるときは、この形で並べてください。

| 項目 | 物件A（Zone 2） | 物件B（Zone 4） |
| --- | --- | --- |
| 家賃 | £1,100 | £950 |
| 定期代 | ${gbp(TRAVELCARD_MONTHLY.zone1to2)} | ${gbp(
        TRAVELCARD_MONTHLY.zone1to4
      )} |
| council tax（月） | £145 | £130 |
| 冬季の暖房費（月・概算） | £80 | £130 |
| **合計** | **£${Math.round(
        1100 + TRAVELCARD_MONTHLY.zone1to2 + 145 + 80
      )}** | **£${Math.round(950 + TRAVELCARD_MONTHLY.zone1to4 + 130 + 130)}** |

家賃£150の差が、総額では逆転しています。`,
      tips: [
        "bills included の物件でも council tax が含まれるとは限りません。「bills」に何が入るのか、水道・ガス・電気・ネット・council tax を個別に確認してください。",
        "EPC の証明書には、その物件の推定年間光熱費が記載されています。複数物件を比べるときの客観的な指標として使えます。",
        "council tax は入居した時点から発生します。自治体への登録を忘れると、後からまとめて請求されます。入居したら自治体のサイトから登録してください。",
      ],
    },
    {
      id: "lifestyle",
      title: "生活の実態で選ぶ",
      subtitle: "数字に出ない条件",
      body: `総額と治安を確認したうえで、最後は生活の中身です。

### 買い物

- **スーパーの価格帯。** Lidl / Aldi（安い）、Tesco / Sainsbury's / Morrisons（中位）、Waitrose / M&S（高い）。近所にどれがあるかで食費が月£50以上変わります
- **アジア食材店の有無。** 日本の調味料や米を買う頻度が高いなら、これは生活の質に直結します。中華系・韓国系のスーパーがあるエリアは選択肢が広がります
- **日曜の営業時間。** 英国では大型店の日曜営業が法律で6時間に制限されています

### 医療

- **GP（かかりつけ医）の登録。** 住所によって登録できる診療所が決まります。評判は NHS のサイトで確認できます
- 登録手順は[渡英後の手続きガイド](/visa/after-arrival)で扱っています

### 洗濯・乾燥

英国の物件に**乾燥機はほぼありません**。冬は洗濯物が乾かず、室内干しが湿気とカビの原因になります。

- 室内に干すスペースがあるか
- ラジエーターの数と位置
- 近所にコインランドリー（launderette）があるか

### 騒音源

- パブ（週末の夜、閉店後の路上）
- 幹線道路、線路、飛行機の経路（ヒースロー方面は西側）
- 工事現場、再開発地域
- ゴミ収集の曜日と時間（早朝に来ます）

### 実際に歩く

最終的には、**候補エリアを休日に歩いてみる**のが最も確実です。1時間歩けば、統計に出ない情報が大量に入ってきます。どんな店があるか、どんな人が歩いているか、公園はあるか、道は清潔か。

ロンドンは徒歩10分で雰囲気が変わる街です。地図とデータだけでは分かりません。`,
    },
  ],
  faq: [
    {
      question: "Zone 3 以遠は避けたほうがいいですか？",
      answer: `一概には言えません。毎日通勤するなら定期代の差（Zone 1-2 と Zone 1-4 で月${gbp(
        Math.round((TRAVELCARD_MONTHLY.zone1to4 - TRAVELCARD_MONTHLY.zone1to2) * 10) / 10
      )}）と通勤時間が効いてくるため、家賃の安さが相殺されがちです。一方、在宅勤務が中心なら定期が不要になるため、外側のゾーンで広い部屋に住むほうが合理的です。週に何日通勤するかを先に決めてから判断してください。`,
    },
    {
      question: "治安の良し悪しは、どう調べるのが正確ですか？",
      answer:
        "police.uk で物件の住所を入力すると、周辺の犯罪統計が通り単位・月次・カテゴリ別に表示されます。エリア全体の評判より、その住所での実データを見るほうが正確です。加えて、内見のついでに夜にその道を歩いてみてください。街灯の間隔や人通りは統計に出ません。",
    },
    {
      question: "council tax は誰が払うのですか？",
      answer:
        "原則として入居者が払います。ただし HMO（複数世帯が住むシェア物件）では大家が納税義務者となり、家賃に含まれる形になることがあります。「bills included」の物件でも council tax が含まれるとは限らないため、契約前に個別に確認してください。フルタイムの学生のみの世帯は免除、単身世帯は25%割引が適用されます。",
    },
    {
      question: "EPC の評価はどのくらい実際の光熱費に影響しますか？",
      answer:
        "同じ広さでもC評価とE評価では、冬季の光熱費が月£50〜100程度変わることがあります。EPCの証明書には推定年間光熱費が記載されているため、複数物件を比較する客観的な指標として使えます。GOV.UK の Find an energy certificate で住所検索すれば、内見前に確認できます。",
    },
    {
      question: "日本食材が買えるエリアはどこですか？",
      answer:
        "日系スーパーは中心部に集中していますが、中華系・韓国系のアジア食材店はロンドン各地にあり、米・醤油・味噌などの基本的なものはそちらで揃います。ネット通販も選択肢です。エリア選びの決定的な条件にするより、通販と組み合わせる前提で考えるほうが選択肢が広がります。",
    },
  ],
  sources: [...HOUSING_SOURCES],
  relatedLinks: [
    { href: "/housing/viewing", label: "内見チェックリスト" },
    {
      href: "/housing/rightmove-zoopla-openrent",
      label: "Rightmove・Zoopla・OpenRent の使い分け",
    },
    { href: "/sightseeing/transport", label: "ロンドンの交通ガイド" },
    { href: "/visa/after-arrival", label: "渡英後の手続きガイド（GP登録・銀行口座）" },
  ],
};

export default whereToLive;

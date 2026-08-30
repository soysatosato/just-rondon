import {
  BRITRAIL,
  BRITRAIL_DISCOUNTS,
  BRITRAIL_ELIGIBILITY_SOURCE,
  LONG_DISTANCE_ROUTES,
  NATIONAL_RAIL_TICKETS_SOURCE,
  RAIL_AS_OF,
  RAIL_UPDATED_AT,
  RAILCARD,
  gbp,
} from "@/lib/beyond-london/rates";
import type { RailHowToArticle } from "../types";

const britrailPass: RailHowToArticle = {
  kind: "railHowTo",
  slug: "britrail-pass",
  title: "BritRail Pass は元が取れるのか｜損益分岐を数字で判定する",
  engTitle: "Is the BritRail Pass Worth It?",
  summary: `日本の代理店が熱心に売っている英国鉄道パスですが、実際には多くの旅程で元が取れません。英国の Advance 切符が安すぎるからです。それでも確実に得をする条件はあります。${RAIL_AS_OF}時点の制度で、買うべき人と買ってはいけない人を切り分けます。`,
  description:
    "BritRail Pass の損得を判定するガイド。Consecutive と Flexi の違い、Advance 切符との比較、元が取れる条件と取れない条件。英国居住者は購入できないこと、渡英前に買う必要があること、ロンドン地下鉄では使えないことなど、日本語圏で誤解の多い点も整理します。",
  keywords: [
    "BritRail Pass",
    "ブリットレイルパス",
    "イギリス 鉄道 パス",
    "BritRail 元が取れる",
    "イギリス 鉄道 乗り放題",
    "ブリットレイルパス 買い方",
    "イギリス 周遊 鉄道",
  ],
  dataAsOf: RAIL_AS_OF,
  updatedAt: RAIL_UPDATED_AT,
  atAGlance: [
    {
      label: "買える人",
      value: `英国に${BRITRAIL.ineligibleAfterMonthsResident}ヶ月以上住んでいない人だけ。在住者は購入不可`,
    },
    {
      label: "買う場所",
      value: "渡英前に日本などで購入します。英国到着後は買えません",
    },
    {
      label: "券種",
      value: `連続日数券（${BRITRAIL.consecutiveDayOptions.join(
        "・"
      )}日）と、${BRITRAIL.flexiWindowDays}日間から選ぶ Flexi 券`,
    },
    {
      label: "座席指定",
      value: "含まれません。指定が必須の列車では別途手数料がかかります",
    },
    {
      label: "ロンドン地下鉄",
      value: `使えません。ただし${BRITRAIL.validLondonLines.join("・")}には乗れます`,
    },
    {
      label: "元が取れる条件",
      value: "長距離を3回以上、かつ直前手配。日帰り中心ならまず取れません",
    },
  ],
  mainText: `BritRail Pass は、英国の鉄道が一定期間乗り放題になる、**非居住者専用**のパスです。日本の旅行代理店が熱心に扱っていて、「イギリスを鉄道で回るなら必須」という紹介をよく見かけます。

**その紹介は、多くの場合まちがっています。**

理由は単純で、**英国の Advance 切符が安すぎるから**です。[英国の鉄道切符の買い方](/sightseeing/transport/national-rail)で書いたとおり、早めに買えばロンドン〜エディンバラが片道${LONG_DISTANCE_ROUTES[0].advanceFromBand}のことがあります。この値段を知らないままパスの価格を見ると「乗り放題なら得だ」と感じますが、比較対象を正しく置くと結論が変わります。

とはいえ、**確実に得をする条件も存在します**。そして日本語の情報では「買えない人がいる」「ロンドンの地下鉄では使えない」といった前提が抜けていることが多く、買ってから気づくと取り返しがつきません。

この記事は、パスを勧めるためでも否定するためでもなく、**あなたの旅程で元が取れるかを判定するため**のものです。`,
  breakEven: {
    premise: `比較対象は「同じ移動を Advance 切符で買った場合の合計額」です。パスの価格だけを見ても損得は判断できません。まず行きたい区間を書き出し、各社サイトで Advance の実額を調べてください。`,
    verdict: `**長距離（片道2時間以上）を3回以上、かつ旅程が直前まで決まらないなら、パスが有利になります**。逆に、行き先と日程が決まっていて Advance を予約できるなら、ほぼ確実に個別購入のほうが安く済みます。`,
    whenNotWorth: [
      "ロンドンを拠点に日帰りを繰り返す旅程。日帰り圏は片道£10〜30程度で、パスの1日あたり単価に届きません",
      "旅程が確定していて、12週間前に Advance を予約できる場合。最安枠が取れるならパスは勝てません",
      "ロンドン市内の移動が中心の場合。地下鉄・バスは対象外で、別途タッチ決済が必要です",
      "2人以上で、Railcard を使える場合。年 " +
        gbp(RAILCARD.annual) +
        ` のカードで ${RAILCARD.discountRate} 引きになるため、パスとの差が縮まります`,
    ],
  },
  sections: [
    {
      id: "who-can-buy",
      navLabel: "買えるのか",
      title: "まず、あなたは買えるのか",
      subtitle: "在住者は対象外です",
      body: `BritRail Pass は**非居住者専用の商品**です。公式規定では、**英国に${BRITRAIL.ineligibleAfterMonthsResident}ヶ月以上居住している人は購入できません**。

これは日本語の紹介記事でしばしば抜け落ちる点です。ワーキングホリデーや留学でロンドンに住んでいる人が「イギリス国内を回りたい」と考えてパスを探しても、**そもそも対象外**です。在住者は Railcard（年 ${gbp(
        RAILCARD.annual
      )}）で ${RAILCARD.discountRate} 引きを狙うのが正解で、こちらは居住者でも買えます。

もうひとつ重要な前提があります。**パスは渡英前に購入する必要があります**。英国に到着してから買うことはできません。「現地で様子を見てから決めよう」は成立しないので、出発前に判断を済ませてください。

なお、購入したパスは**発券から${BRITRAIL.validateWithinMonths}ヶ月以内**に使い始める必要があります。旅程がまだ固まっていない段階で買っておくこと自体は可能です。`,
      callout: {
        tone: "warn",
        title: "在住者が見るべきなのは Railcard のほう",
        body: `英国に${BRITRAIL.ineligibleAfterMonthsResident}ヶ月以上住んでいるなら、BritRail Pass は購入できません。代わりに **Railcard**（年 ${gbp(
          RAILCARD.annual
        )}）を検討してください。全国の Advance・Off-Peak が ${RAILCARD.discountRate} 引きになり、Oyster に紐付ければロンドン市内のオフピーク運賃にも効きます。詳しくは[英国の鉄道切符の買い方](/sightseeing/transport/national-rail)へ。`,
      },
    },
    {
      id: "consecutive-vs-flexi",
      navLabel: "券種の選択",
      title: "Consecutive と Flexi のどちらを選ぶか",
      body: `パスには大きく2種類あります。

| 種類 | 使い方 | 向いている旅程 |
|---|---|---|
| **Consecutive（連続日数券）** | 使い始めた日から**連続**した日数ぶん有効 | 毎日のように移動し続ける周遊 |
| **Flexi（フレキシー券）** | ${BRITRAIL.flexiWindowDays}日間のうち、**選んだ日数だけ**有効 | 拠点に数日滞在しつつ、時々遠出する |

選べる日数は、連続日数券が **${BRITRAIL.consecutiveDayOptions.join(
        "・"
      )}日**、Flexi が **${BRITRAIL.flexiDayOptions.join("・")}日**です。

**判断は単純です**。移動しない日が旅程にどれだけあるかを数えてください。ロンドンに3日、エディンバラに2日といった滞在型なら、実際に長距離列車に乗る日は数日しかありません。この場合は Flexi です。連続日数券を買うと、観光している日ぶんの料金まで払うことになります。

逆に、毎日のように街から街へ動き続けるなら連続日数券が有利です。ただしそういう旅程は英国ではあまり現実的ではありません。**主要都市間の移動は2〜4時間で済むので、毎日移動する必然性が薄い**からです。`,
      tips: [
        "Flexi の「使う日」は当日に決められる。前もって申告する必要はない",
        "1日に何本乗ってもその日は1日ぶん。乗り継ぐ日にまとめると効率がいい",
        "夜行列車（Caledonian Sleeper）は日付をまたぐ扱いに注意。規定を確認すること",
      ],
    },
    {
      id: "the-real-comparison",
      navLabel: "実際に比べる",
      title: "実際に比べてみる",
      subtitle: "パスの価格ではなく、Advance の合計と比べる",
      body: `ここが記事の核心です。**パスの価格を単体で見ても、高いか安いかは判断できません**。比べるべきは「同じ移動を個別に買った場合の合計」です。

ロンドン発の代表的な長距離ルートで、運賃の幅を見てみます。

| 行き先 | 運行会社 | 所要 | Advance（早期） | 当日券（Anytime） |
|---|---|---|---|---|
${LONG_DISTANCE_ROUTES.map(
  (r) =>
    `| **${r.to}** | ${r.operator} | ${r.journeyTime} | ${r.advanceFromBand}〜 | ${r.anytimeBand} |`
).join("\n")}

**同じ列車でも3〜4倍の差があります。**そして BritRail Pass が本当に競争すべき相手は、右の当日券ではなく**左の Advance**です。

旅程が決まっていて12週間前に予約できるなら、ロンドン〜エディンバラを往復しても Advance で£60〜80程度に収まることがあります。ここにパスで勝つのは簡単ではありません。

**逆に言えば、Advance が使えない状況ならパスが効きます。**

- 旅程が直前まで決まらない
- 天候や気分で行き先を変えたい
- 「明日エディンバラに行こう」とその日に決めたい

こういう旅なら、当日券の高さがそのままパスの価値になります。パスの本質は**割引ではなく、予定を固定しなくていい自由**です。そこに価値を感じるかどうかで決めてください。`,
      callout: {
        tone: "tip",
        title: "判定の手順",
        body: "1. 行きたい区間をすべて書き出す\n2. 各社サイトで **Advance の実額**を調べて合計する（日程未定なら適当な平日で仮に検索する）\n3. その合計と、パスの価格を比べる\n\nこの3ステップで判定できます。**2番を飛ばして買う人が多いので、そこだけ省かないでください。**",
      },
    },
    {
      id: "what-it-does-not-cover",
      navLabel: "乗れないもの",
      title: "パスで乗れないもの",
      body: `**ロンドン地下鉄（Underground）では使えません**。これが最大の誤解です。パスを持っていても、市内の地下鉄・バスには別途タッチ決済かOysterが必要です（[運賃と支払い方法](/sightseeing/transport/fares)を参照）。

ただし「ロンドンで一切使えない」わけでもありません。**${BRITRAIL.validLondonLines.join(
        "・"
      )}**は National Rail の路線なので、パスで乗れます。空港からの移動やロンドン横断に使える場面はあります。

もうひとつ重要なのが**座席指定**です。パスに座席指定は**含まれません**。パスは「乗る権利」であって、座席を保証するものではありません。

長距離列車の多くは指定なしでも乗れますが、**指定が必須の列車もあります**。その場合は別途手数料を払って指定を取る必要があります。金曜夕方や日曜午後の主要幹線は混むので、パスがあっても座席指定は取っておくほうが安全です。立ったまま4時間はかなり応えます。`,
      tips: [
        "指定席の手数料は数ポンド程度。混雑する時間帯なら払う価値がある",
        "指定はパスを有効化する前でも取れるが、運行会社に直接連絡する必要がある",
        "ヒースロー・エクスプレスなど一部の空港連絡列車は対象外のことがある。事前に確認を",
      ],
      callout: {
        tone: "warn",
        title: "「乗り放題」に地下鉄は含まれない",
        body: `ロンドン市内の地下鉄・バス・DLR は BritRail Pass の対象外です。市内の移動には別途タッチ決済が必要になるので、**ロンドン滞在ぶんの交通費は別枠で予算に入れてください**。Zone 1–2 なら1日上限があるので、[運賃と支払い方法](/sightseeing/transport/fares)で確認できます。`,
      },
    },
    {
      id: "discounts",
      navLabel: "割引と価格",
      title: "割引区分と、価格の調べ方",
      body: `年齢などによる割引があります。

- **${BRITRAIL_DISCOUNTS.youth.label}**：${BRITRAIL_DISCOUNTS.youth.approxOff}
- **${BRITRAIL_DISCOUNTS.senior.label}**：${BRITRAIL_DISCOUNTS.senior.approxOff}
- **子ども**：大人1名につき1名（5〜15歳）が無料になる設定があります

**割引率は代理店によって前後します。**というより、BritRail Pass は**販売代理店ごとに価格も通貨も違います**。円建てで売る代理店、ドル建て、ポンド建てが混在していて、為替と代理店の取り分で最終価格が変わります。

このため、このページには**価格表を載せていません**。載せた瞬間に古くなり、しかも「どこで買うか」によって正しくなくなるからです。実額は必ず公式サイトか、購入を検討している代理店で確認してください。

複数の代理店を比べる価値はあります。同じパスでも数千円違うことがあります。`,
      callout: {
        tone: "info",
        title: "価格を載せない理由",
        body: "BritRail Pass は代理店ごとに価格・通貨・割引率が違い、為替でも動きます。このサイトで一覧を持つと、必ずどこかの時点で嘘になります。**判断の枠組みだけを示し、実額は公式で確認する**方針にしています。",
      },
    },
  ],
  faq: [
    {
      question: "イギリスに住んでいますが、BritRail Pass を買えますか？",
      answer: `**買えません**。BritRail Pass は非居住者専用で、英国に${BRITRAIL.ineligibleAfterMonthsResident}ヶ月以上居住している人は購入資格がありません。在住者は代わりに **Railcard**（年 ${gbp(
        RAILCARD.annual
      )}）を検討してください。全国の運賃が ${RAILCARD.discountRate} 引きになり、居住者でも購入できます。`,
    },
    {
      question: "イギリスに着いてから買えますか？",
      answer:
        "**買えません**。渡英前に購入する必要があります。現地で判断しようと考えている場合は、その選択肢がないことを前提に計画してください。なお、購入後は発券から11ヶ月以内に使い始めれば大丈夫なので、旅程が固まる前に買っておくことは可能です。",
    },
    {
      question: "ロンドンの地下鉄には乗れますか？",
      answer: `**乗れません**。地下鉄・バス・DLR は対象外で、別途タッチ決済かOysterが必要です。ただし**${BRITRAIL.validLondonLines.join(
        "・"
      )}**は National Rail の路線なのでパスで乗れます。ロンドン市内ぶんの交通費は、別枠で予算に入れておいてください。`,
    },
    {
      question: "座席は確保されますか？",
      answer:
        "**されません**。パスは乗車する権利であって、座席の保証ではありません。指定が必須の列車では別途手数料を払って指定を取る必要があります。金曜夕方や日曜午後の幹線は混雑するので、パスを持っていても座席指定を取っておくことを勧めます。",
    },
    {
      question: "結局、買ったほうがいいのでしょうか？",
      answer:
        "**長距離を3回以上、かつ旅程が直前まで決まらないなら買う価値があります**。逆に、行き先と日程が決まっていて12週間前に Advance を予約できるなら、個別に買うほうがほぼ確実に安く済みます。ロンドンを拠点にした日帰り中心の旅程では、まず元が取れません。まず行きたい区間の Advance 実額を調べて、合計と比べてください。",
    },
    {
      question: "Consecutive と Flexi はどちらがいいですか？",
      answer: `**移動しない日が何日あるかで決まります**。ロンドンに数日滞在してから遠出する、といった拠点型の旅程なら **Flexi**（${BRITRAIL.flexiWindowDays}日間のうち使う日だけ有効）です。毎日のように街から街へ動き続けるなら連続日数券が有利ですが、英国の主要都市間は2〜4時間で結ばれているため、毎日移動する旅程自体があまり現実的ではありません。`,
    },
  ],
  sources: [
    BRITRAIL_ELIGIBILITY_SOURCE,
    {
      label: "BritRail – 公式トップ（券種と価格）",
      url: "https://www.britrail.com/",
    },
    NATIONAL_RAIL_TICKETS_SOURCE,
    {
      label: "Railcard – 公式（1/3割引の対象と価格）",
      url: "https://www.railcard.co.uk/",
    },
  ],
  relatedLinks: [
    {
      href: "/sightseeing/transport/national-rail",
      label: "英国の鉄道切符の買い方｜Advance・Off-Peak・Anytimeの違い",
    },
    {
      href: "/beyond-london",
      label: "Beyond London｜ロンドンの外へ",
    },
    {
      href: "/sightseeing/transport/fares",
      label: "ロンドンの運賃と支払い方法｜市内はタッチ決済で完結する",
    },
    {
      href: "/sightseeing/itinerary",
      label: "モデルコース｜郊外への日帰りをどの日に入れるか",
    },
  ],
};

export default britrailPass;

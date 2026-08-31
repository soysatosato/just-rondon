import type { FoodGuideArticle } from "../types";
import {
  FOOD_AS_OF,
  FOOD_SOURCES,
  FOOD_UPDATED_AT,
  MEAL_DEALS,
  MEAL_DEAL_MAX_VALUE,
  gbp,
  mealDealSaving,
} from "@/lib/food/prices";

const mealDeal: FoodGuideArticle = {
  slug: "meal-deal",
  title: "ロンドンの Meal Deal 完全攻略｜チェーン別の価格と損しない組み合わせ",
  engTitle: "Getting the Most Out of a London Meal Deal",
  audience: "昼食代を今日から下げたい人（旅行者・在住者どちらも）",
  summary: `メイン＋スナック＋ドリンクをセットで買うと割引になる仕組みで、ロンドンの昼食の基本形です。Tesco は会員価格で${gbp(
    MEAL_DEALS.tesco.member
  )}、Morrisons は${gbp(
    MEAL_DEALS.morrisons.member
  )}。単品で揃えると倍近くになるため、使わない理由がありません。ただし会員カードの有無と、枠ごとに何を選ぶかで最終的な得の大きさが変わります。`,
  description:
    "ロンドンのMeal Deal（ミールディール）を使い切るための実務ガイド。Tesco・Sainsbury's・Boots・Greggs・M&Sのチェーン別価格、Clubcard会員価格との差、同じ値段で最大の価値を取る組み合わせ方、棚が空になる時間帯まで解説します。",
  keywords: [
    "Meal Deal ロンドン",
    "ミールディール イギリス",
    "Tesco Meal Deal 値段",
    "ロンドン 昼食 安い",
    "イギリス ランチ 節約",
    "Clubcard Meal Deal",
    "ロンドン 食費 節約",
  ],
  dataAsOf: FOOD_AS_OF,
  updatedAt: FOOD_UPDATED_AT,
  atAGlance: [
    {
      label: "最安クラス",
      value: `${MEAL_DEALS.morrisons.label} 会員${gbp(
        MEAL_DEALS.morrisons.member
      )} / ${MEAL_DEALS.coop.label} 会員${gbp(MEAL_DEALS.coop.member)}`,
    },
    {
      label: "最も店舗が多い",
      value: `${MEAL_DEALS.tesco.label} 会員${gbp(
        MEAL_DEALS.tesco.member
      )}（通常${gbp(MEAL_DEALS.tesco.standard)}）`,
    },
    {
      label: "会員価格の差",
      value: `Tesco で1回あたり${gbp(
        mealDealSaving(MEAL_DEALS.tesco)
      )}。週5回なら月${gbp(mealDealSaving(MEAL_DEALS.tesco) * 20)}`,
    },
    { label: "狙う時間", value: "12時前。昼のピーク後はメイン棚が空になる" },
    { label: "最大の落とし穴", value: "会員カードを作らずに通常価格で買うこと" },
  ],
  mainText: `ロンドンで働く人・学ぶ人の昼食を支えているのが **Meal Deal（ミールディール）** です。「メイン1つ＋スナック1つ＋ドリンク1つ」を対象棚から選ぶと、合計がセット価格になる仕組みです。

単品で買うと合計${gbp(
    MEAL_DEAL_MAX_VALUE.mainSingleHigh +
      MEAL_DEAL_MAX_VALUE.snackSingleHigh +
      MEAL_DEAL_MAX_VALUE.drinkSingleHigh
  )}前後になる組み合わせが、Tesco の会員価格なら${gbp(
    MEAL_DEALS.tesco.member
  )}で収まります。ロンドンでカフェに入れば${gbp(
    12
  )}前後は当たり前なので、昼食をここに寄せるだけで食費の景色が変わります。

ただ、Meal Deal は「知っていれば使える」ものではなく、**知っている量で得の大きさが変わる**仕組みです。この記事では、チェーンごとの価格差と、同じ金額で最大の価値を取る選び方を扱います。`,
  sections: [
    {
      id: "chain-prices",
      navLabel: "チェーン別の価格",
      title: "チェーン別の価格 —— どこが安いのか",
      subtitle: "会員価格の有無で順位が入れ替わる",
      panel: "meal-deal-prices",
      body: `### 実際にどう選ぶか

**Morrisons と Co-op が最安**ですが、ロンドン中心部では店舗が少なく、狙って行くものではありません。現実には **Tesco か Sainsbury's** が近くにあるはずなので、そのどちらかで会員価格を使うのが基本になります。

**Greggs** は Meal Deal というより「ベーカリー系の温かいもの＋ドリンク」の組み合わせで、パンやソーセージロールが主役です。温かいものが食べたい日はここ。

**M&S と Waitrose** は高いですが、中身の質が明確に上です。「今日はまともなものを食べたい」という日の選択肢として持っておくと便利です。

**Boots と WHSmith** は駅構内や病院の近くにあり、他に選択肢がない場所で助かります。Boots は Advantage Card があれば${gbp(
        MEAL_DEALS.boots.member
      )}まで下がります。`,
      tips: [
        `Tesco の通常価格と会員価格の差は1回${gbp(
          mealDealSaving(MEAL_DEALS.tesco)
        )}。平日毎日なら年間で${gbp(
          Math.round(mealDealSaving(MEAL_DEALS.tesco) * 240)
        )}前後の差になる`,
        "同じチェーンでも「駅構内の小型店」は Meal Deal 対象外の商品が多い。棚の表示を必ず確認する",
        "空港とターミナル駅の一部店舗は Meal Deal をやっていない。移動日は事前に買っておく",
      ],
      callout: {
        tone: "warn",
        title: "会員カードなしで買うのが一番の損",
        body: `Clubcard も Nectar も**無料**で、その場で作れます。カードを持たずに通常価格で買うのは、毎回${gbp(
          mealDealSaving(MEAL_DEALS.tesco)
        )}を捨てているのと同じです。作り方は[Clubcard・Nectar は必ず作る](/food/loyalty-cards)で扱います。`,
      },
    },
    {
      id: "maximise",
      navLabel: "得な組み合わせ",
      title: "同じ値段で最大の価値を取る",
      subtitle: "セット価格なので、単品が高いものを選ぶのが正解",
      body: `Meal Deal は「どれを選んでも同じ値段」です。つまり**単品価格が高いものを選べば選ぶほど得**という、極めて単純な構造をしています。

### 枠ごとの狙いどころ

**メイン枠** —— 寿司パック、ラップ、プレミアム系のサンドイッチが単品${gbp(
        MEAL_DEAL_MAX_VALUE.mainSingleHigh
      )}前後で最も高い部類です。逆に一番安いのはプレーンなチーズサンドやハムサンドで、${gbp(
        2
      )}前後。同じ${gbp(
        MEAL_DEALS.tesco.member
      )}を払うなら、寿司やラップを選ぶ方が明らかに得です。

**スナック枠** —— ナッツ類とチョコ菓子が単品${gbp(
        MEAL_DEAL_MAX_VALUE.snackSingleHigh
      )}前後で高め。ポテトチップスの小袋は${gbp(
        0.85
      )}前後なので、ここで差が出ます。

**ドリンク枠** —— スムージー、エナジードリンク、プレミアムなコーヒー飲料が単品${gbp(
        MEAL_DEAL_MAX_VALUE.drinkSingleHigh
      )}前後で最も高い部類。水（${gbp(
        0.65
      )}前後）を選ぶのは最も損な選択です。水は水道水で足りるので、ドリンク枠は必ず高いものを取ります。

### 組み合わせの例

どちらも支払いは ${gbp(MEAL_DEALS.tesco.member)} です。

- **寿司＋ナッツ＋スムージー** —— 単品で買えば${gbp(
        MEAL_DEAL_MAX_VALUE.mainSingleHigh +
          MEAL_DEAL_MAX_VALUE.snackSingleHigh +
          MEAL_DEAL_MAX_VALUE.drinkSingleHigh
      )}。実質${gbp(
        MEAL_DEAL_MAX_VALUE.mainSingleHigh +
          MEAL_DEAL_MAX_VALUE.snackSingleHigh +
          MEAL_DEAL_MAX_VALUE.drinkSingleHigh -
          MEAL_DEALS.tesco.member
      )}の得
- **チーズサンド＋チップス＋水** —— 単品で買えば${gbp(
        2 + 0.85 + 0.65
      )}。セットにすると${gbp(
        MEAL_DEALS.tesco.member - (2 + 0.85 + 0.65)
      )}高くつきます

後者は得どころか損で、**Meal Deal にした意味がありません**。同じ支払いで倍近い価値を取れるので、枠ごとに高いものを選ぶ癖をつけてください。`,
      tips: [
        "値札に単品価格が併記されているので、迷ったら数字を見比べる。慣れれば数秒で判断できる",
        "寿司パックは Meal Deal 対象に入っていることが多く、対象内では最も割高な商品。日本食が恋しいときの現実的な選択肢になる",
        "スナック枠でナッツを選ぶと、腹持ちの面でも有利。午後に間食を買わずに済む",
      ],
    },
    {
      id: "timing",
      navLabel: "買う時間帯",
      title: "時間帯 —— 12時を過ぎると選べなくなる",
      subtitle: "棚が空になると「損な組み合わせ」しか残らない",
      body: `Meal Deal の落とし穴は価格ではなく**在庫**です。

オフィス街の店舗では、12時から13時半のあいだにメイン棚が急速に空になります。13時を過ぎて残っているのは、たいてい単品価格の安いプレーンなサンドイッチです。つまり**遅い時間に行くと、選べる中で最も損な組み合わせしか残っていない**という状態になります。

### 現実的な行動

- **11時半〜12時**に行くのが最適。品揃えが最も広い
- 13時半以降しか行けない日は、Meal Deal を諦めて別の手を使う方が満足度が高い（[値引きシールと閉店前半額](/food/discount-timing)）
- 金曜の夕方は、翌日が休みの店舗が多いため補充が少ない

逆に、**夕方以降は値引きシールが貼られ始める**ので、時間帯によって戦略を切り替えるのが正解です。Meal Deal は昼の技、値引きシールは夕方の技と覚えておくと迷いません。`,
      callout: {
        tone: "tip",
        title: "朝のうちに買っておく",
        body: "出勤・通学の途中に買って持ち歩くのが、品揃えと時間の両方で最も有利です。サンドイッチ類は要冷蔵ですが、数時間なら実用上問題ありません（夏場は避けてください）。",
      },
    },
  ],
  faq: [
    {
      question: "Meal Deal は旅行者でも使えますか。",
      answer:
        "使えます。会員カードも無料でその場で作れるため、短期の旅行でも会員価格で買えます。詳しくは[Clubcard・Nectar は必ず作る](/food/loyalty-cards)をご覧ください。",
    },
    {
      question: "対象商品はどう見分けますか。",
      answer:
        "棚に「Meal Deal」「£3.60 Meal Deal」などの表示が出ています。対象外の商品が同じ棚に混ざっていることもあるため、値札のラベルを確認するのが確実です。レジで合計が下がらなければ対象外だったということになります。",
    },
    {
      question: "メインを2つ選ぶことはできますか。",
      answer:
        "できません。メイン・スナック・ドリンクの各枠から1つずつという構成が条件です。ただし「スナック枠に入っているサラダ」などを組み合わせれば、実質的に量を増やせます。",
    },
    {
      question: "一番安く済ませるならどのチェーンですか。",
      answer: `会員価格では ${MEAL_DEALS.morrisons.label}（${gbp(
        MEAL_DEALS.morrisons.member
      )}）と ${MEAL_DEALS.coop.label}（${gbp(
        MEAL_DEALS.coop.member
      )}）が最安クラスです。ただしロンドン中心部では店舗が少ないため、実際には ${
        MEAL_DEALS.tesco.label
      }（${gbp(MEAL_DEALS.tesco.member)}）が現実的な最安になります。`,
    },
  ],
  sources: [FOOD_SOURCES[0], FOOD_SOURCES[1]],
  relatedLinks: [
    { href: "/food/loyalty-cards", label: "Clubcard・Nectar は必ず作る" },
    {
      href: "/food/discount-timing",
      label: "値引きシールと閉店前半額を狙う",
    },
    { href: "/food/where-to-buy", label: "買う場所を変える" },
  ],
  commentPrompt:
    "Meal Deal で「これが一番お得」という組み合わせや、対象商品が充実している店舗があれば教えてください。ロンドン以外の都市の情報も歓迎です。",
};

export default mealDeal;

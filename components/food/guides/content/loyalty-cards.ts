import type { FoodGuideArticle } from "../types";
import {
  FOOD_AS_OF,
  FOOD_SOURCES,
  FOOD_UPDATED_AT,
  MEAL_DEALS,
  gbp,
  mealDealSaving,
} from "@/lib/food/prices";

const loyaltyCards: FoodGuideArticle = {
  slug: "loyalty-cards",
  title: "Clubcard と Nectar は必ず作る｜イギリスの二重価格の話",
  engTitle: "Why You Must Get a Clubcard or Nectar Card",
  audience: "イギリスでスーパーを一度でも使う人（旅行者を含む）",
  summary: `イギリスのスーパーは、会員価格と通常価格の二本立てになっています。同じ商品が会員なら数十ペンス〜${gbp(
    1
  )}以上安く、Meal Deal も Tesco なら1回${gbp(
    mealDealSaving(MEAL_DEALS.tesco)
  )}変わります。カードは**無料**でその場で作れるので、作らない理由がありません。短期の旅行者でも作れます。`,
  description:
    "イギリスのスーパーの会員カード（Tesco Clubcard・Sainsbury's Nectar）を作るべき理由と作り方。会員価格と通常価格の差、旅行者でも作れるのか、住所欄に何を書くか、アプリでの使い方まで解説します。",
  keywords: [
    "Clubcard 作り方",
    "Nectar カード 旅行者",
    "Tesco 会員価格",
    "イギリス スーパー 会員カード",
    "Clubcard 旅行者",
    "ロンドン 食費 節約",
  ],
  dataAsOf: FOOD_AS_OF,
  updatedAt: FOOD_UPDATED_AT,
  atAGlance: [
    { label: "費用", value: "無料。年会費もない" },
    { label: "作成時間", value: "アプリなら5分程度" },
    {
      label: "Meal Deal での差",
      value: `Tesco で1回${gbp(mealDealSaving(MEAL_DEALS.tesco))}、週5回で月${gbp(
        mealDealSaving(MEAL_DEALS.tesco) * 20
      )}`,
    },
    { label: "旅行者", value: "作れる。宿泊先の住所で登録可能" },
    { label: "優先順位", value: "Tesco の Clubcard →Sainsbury's の Nectar" },
  ],
  mainText: `イギリスのスーパーで棚を見ると、同じ商品に**2つの値段**が並んでいることに気づきます。大きい方が通常価格、「Clubcard Price」「Nectar Price」と書かれた方が会員価格です。

この差は小さくありません。商品によっては通常価格の3割引きに近い設定になっていることもあり、**会員でない客が実質的に割高な価格を払う**構造になっています。

そして、このカードは**無料**です。年会費もなく、その場で作れます。イギリスに数日いるだけの旅行者でも作れます。つまり、作らないという選択に合理性がありません。`,
  sections: [
    {
      id: "which-cards",
      title: "どのカードを作るか",
      subtitle: "近所にある店で決める",
      body: `優先順位は**自分の生活圏に何があるか**で決まります。

| カード | チェーン | 特徴 |
| --- | --- | --- |
| **Clubcard** | ${MEAL_DEALS.tesco.label} | 店舗数が最多。まず作るべき1枚 |
| **Nectar** | ${MEAL_DEALS.sainsburys.label} | Tesco と並ぶ大手。Argos でも使える |
| Co-op Member | ${MEAL_DEALS.coop.label} | 小型店が多く、住宅街で強い |
| More Card | ${MEAL_DEALS.morrisons.label} | Meal Deal が最安クラス |
| Advantage Card | ${MEAL_DEALS.boots.label} | 駅・病院の近くで助かる |

### 現実的な判断

**Tesco の Clubcard は無条件で作る**べきです。ロンドンでは Tesco Express（小型店）が街中にあり、避けて生活する方が難しいためです。

次に、通勤・通学経路に Sainsbury's があるなら **Nectar** も作ります。この2枚があれば大半の場面をカバーできます。

残りは「近所にその店があるなら」で判断すれば十分です。財布に入れるカードを増やしても管理できないので、**アプリでバーコードを表示する運用**にするのがおすすめです。`,
      tips: [
        "アプリを入れればカード自体を持ち歩く必要がない。レジでバーコードを見せるだけ",
        "Nectar は Argos や一部のガソリンスタンドでも使える。用途が広い",
        "レジで「Do you have a Clubcard?」と聞かれる。持っていればアプリを開いて見せる",
      ],
      callout: {
        tone: "warn",
        title: "作らないと毎回損をする",
        body: `Meal Deal だけ見ても、Tesco では通常${gbp(
          MEAL_DEALS.tesco.standard
        )}に対し会員${gbp(
          MEAL_DEALS.tesco.member
        )}です。平日毎日買うなら年間で${gbp(
          Math.round(mealDealSaving(MEAL_DEALS.tesco) * 240)
        )}前後の差になります。詳しくは[Meal Deal を使い切る](/food/meal-deal)をご覧ください。`,
      },
    },
    {
      id: "how-to-register",
      title: "作り方 —— 旅行者でも作れる",
      subtitle: "住所欄で詰まる人が多い",
      body: `### 手順

1. アプリ（Tesco / Sainsbury's）をダウンロードするか、店頭で申込用紙をもらう
2. メールアドレス、名前、住所を登録する
3. アプリ上でデジタルカードがすぐ発行される

**店頭で即日もらえる物理カードもあります。** レジやサービスカウンターで「Can I get a Clubcard?」と言えば渡してもらえ、あとでアプリに紐づけられます。この方法なら住所の入力を後回しにできます。

### 住所欄をどうするか

ここで詰まる人が多いのですが、**宿泊先の住所（ホテル、Airbnb、学生寮、シェアハウス）で問題ありません。** 郵便物を受け取る必要はなく、ポイントの管理はアカウントとメールアドレスに紐づいています。

日本の住所で登録しようとするとフォームが弾くことがあるため、**滞在先の英国内の住所**を入れるのが確実です。

### ポイントについて

Clubcard も Nectar もポイントが貯まりますが、**旅行者にとっての本命はポイントではなく「会員価格で買えること」** です。数日の滞在でポイントを使えるほど貯めるのは現実的ではないので、割引価格の適用だけを目的に作ればよいです。

長期滞在者ならポイントも意味を持ちます。Clubcard のポイントはクーポンに交換でき、提携先では額面以上の価値になる仕組みもあります。`,
      tips: [
        "メールアドレスは普段使うものを登録する。クーポンがメールで届く",
        "アプリの言語は英語のみだが、登録フォームは名前・住所・メールだけで難しくない",
        "帰国後もアカウントは残る。再訪時にそのまま使える",
      ],
      callout: {
        tone: "tip",
        title: "同行者の分は作らなくてよい",
        body: "会員価格は「カードを提示した会計」に適用されるため、家族や友人と一緒に買う場合は誰か1人が持っていれば足ります。全員で作る必要はありません。",
      },
    },
    {
      id: "beyond-discounts",
      title: "会員価格以外の使いどころ",
      subtitle: "クーポンと、たまにある大きな特典",
      body: `### 個別クーポン

購買履歴に応じたクーポンがアプリとメールに届きます。「よく買う商品が割引」という形が多く、**同じものを繰り返し買う生活をしていると効き方が大きくなります**。

### Clubcard のポイント交換

Clubcard のポイントは、提携先（レストラン、アトラクション、鉄道など）のクーポンに交換すると**額面以上の価値になる**ことがあります。長期滞在者は貯める価値があります。

### 注意しておくこと

- **二重価格そのものへの批判もあります。** 会員価格が「割引」ではなく、非会員に割高な価格を課しているだけだという指摘で、英国の競争当局も価格表示を調査しています
- 購買履歴は当然記録されます。気になる場合は登録情報を最小限にする選択もあります

とはいえ、費用が無料で効果が確実という点で、**作らない合理性はほぼありません**。`,
    },
  ],
  faq: [
    {
      question: "短期の旅行でも Clubcard は作れますか。",
      answer:
        "作れます。宿泊先の住所で登録でき、店頭で物理カードをその場でもらうこともできます。数日の滞在でも Meal Deal の会員価格が使えるため、作る価値があります。",
    },
    {
      question: "住所は日本の住所でもいいですか。",
      answer:
        "フォームが英国の郵便番号形式を求めるため弾かれることがあります。滞在先（ホテル・Airbnb・寮）の英国内の住所を入れるのが確実です。郵便物を受け取る必要はありません。",
    },
    {
      question: "カードを忘れた場合、あとから割引を適用できますか。",
      answer:
        "原則できません。会計時に提示する必要があります。アプリを入れておけばスマホだけで済むため、忘れる余地がなくなります。",
    },
    {
      question: "何枚も作る意味はありますか。",
      answer:
        "生活圏にある店の分だけで十分です。Tesco の Clubcard と Sainsbury's の Nectar の2枚で大半をカバーできます。使わない店のカードを増やしても管理の手間が増えるだけです。",
    },
  ],
  sources: [FOOD_SOURCES[0], FOOD_SOURCES[1]],
  relatedLinks: [
    { href: "/food/meal-deal", label: "Meal Deal を使い切る" },
    { href: "/food/where-to-buy", label: "買う場所を変える" },
    { href: "/food/apps-and-coupons", label: "アプリとクーポンで削る" },
  ],
  commentPrompt:
    "会員カードで「これは明らかに得だった」という体験や、旅行者として作るときに詰まった点があれば教えてください。",
};

export default loyaltyCards;

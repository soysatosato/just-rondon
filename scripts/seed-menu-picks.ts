import "dotenv/config";
import db from "../utils/db";

/**
 * 店ごとの「何を頼むか」を投入する。SouvenirPick の restaurants 版。
 *
 * Restaurant.body(平均180字)は「なぜこの店か」——歴史・内装・予約の
 * 仕組みを扱う。そこで話が終わるので、**メニューを渡された時点で
 * 読者は放り出される**。店まで案内して注文で詰まらせるのは、
 * 土産ページが棚の前で銘柄を出せなかったのと同じ穴。
 *
 * ## 書き方の方針
 *
 * - **name はメニュー表記のまま。**指させないと注文できないので訳さない
 * - **nameJa で何の料理か分かるようにする。**英語だけでは選べない
 * - **reason は1〜3文。**店の紹介ではなく皿の話だけを書く
 * - **role で頼む順を示す。**signature を1皿目、second を2皿目に置く
 * - **価格は幅で書く。**変動する
 *
 * ## 写真は後から足す
 *
 * image 系は nullable のまま投入する。既存の店写真12件はすべて
 * Commons の**外観**で料理が1枚も写っていない(RestaurantCard の
 * コメント参照)ので、自分で撮った料理写真の置き場がここになる。
 * 自分の写真は imageSource: "own"(ImageCredit が commons 以外を
 * 描画しないので credit 不要)。
 *
 * 実行: npx tsx scripts/seed-menu-picks.ts
 */

export type MenuPickSeed = {
  name: string;
  nameJa?: string;
  priceRange?: string;
  reason: string;
  role?: "signature" | "second" | "drink" | "seasonal";
  /**
   * 公式メニューの価格(£)。確かめた日(YYYY-MM-DD)と、載っていたページと組で書く。
   * 店のページは priceRange よりこちらを優先して出し、予算の例もこれで計算する。
   */
  officialPrice?: number;
  priceCheckedAt?: string;
  priceSourceUrl?: string;
};

const CHECKED = "2026-11-05";

export const MENU_PICKS: { slug: string; picks: MenuPickSeed[] }[] = [
  // ── アフタヌーンティー ──
  {
    slug: "the-ritz-afternoon-tea",
    picks: [
      {
        name: "Traditional Afternoon Tea",
        nameJa: "アフタヌーンティー(大人1人)",
        priceRange: "£95〜",
        officialPrice: 95,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://www.theritzlondon.com/dine-with-us/afternoon-tea/",
        reason:
          "ここは単品で頼む店ではなく、このセットが体験そのものです。**コースは滞在中に補充されます**(公式)。16歳未満は£73からです。",
        role: "signature",
      },
      {
        name: "Ritz Royal Blend",
        nameJa: "リッツ・ロイヤル・ブレンド(紅茶)",
        reason:
          "リッツのアフタヌーンティーでしか飲めない独自のブレンドです(公式)。",
        role: "drink",
      },
      {
        name: "A Glass of Champagne",
        nameJa: "シャンパン(グラス1杯)",
        priceRange: "£26〜",
        officialPrice: 26,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://www.theritzlondon.com/dine-with-us/afternoon-tea/",
        reason:
          "記念日なら1杯足せます。アフタヌーンティーの公式ページでは£26から、よくある質問のページでは£25からとあり、表記が揃っていません。",
        role: "second",
      },
    ],
  },
  {
    slug: "fortnum-and-mason-tea-salon",
    picks: [
      {
        name: "Classic Afternoon Tea",
        nameJa: "クラシック・アフタヌーンティー(1人、紅茶のポットつき)",
        priceRange: "£88",
        officialPrice: 88,
        priceCheckedAt: CHECKED,
        priceSourceUrl:
          "https://www.fortnumandmason.com/media/fortnums/blogpost/pdf/DJTS_Classic_Afternoon_Tea_Christmas_2026.pdf",
        reason:
          "2026年のクリスマスの期間のメニューで、紅茶のポットがついて1人£88です。公式の案内では、時期によっては£84からです。**紅茶は席で担当者に相談しながら選べます**(公式)。",
        role: "signature",
      },
      {
        name: "Savoury Afternoon Tea",
        nameJa: "セイヴォリー(甘くない)のセット",
        priceRange: "£89",
        officialPrice: 89,
        priceCheckedAt: CHECKED,
        priceSourceUrl:
          "https://www.fortnumandmason.com/media/fortnums/blogpost/pdf/DJTS_Savoury_Afternoon_Tea_Christmas_2026.pdf",
        reason:
          "甘いものより塩気を好む人のために、スコーンやペイストリーまで塩気のある品にしたセットです(公式メニュー)。",
        role: "second",
      },
      {
        name: "High Tea",
        nameJa: "ハイティー(温かい料理を1皿選ぶセット)",
        priceRange: "£90",
        officialPrice: 90,
        priceCheckedAt: CHECKED,
        priceSourceUrl:
          "https://www.fortnumandmason.com/media/fortnums/blogpost/pdf/DJTS_High_Tea_Christmas_2026.pdf",
        reason:
          "ロブスターのオムレツやビーフ・ウェリントンなどから温かい料理を1皿選び、スコーンとペイストリーが続きます(公式メニュー)。",
        role: "second",
      },
      {
        name: "Royal Blend",
        nameJa: "ロイヤル ブレンド(紅茶)",
        reason:
          "フォートナム&メイソンの定番の紅茶です。**同じ茶葉は下の階の売り場でも買えます。**",
        role: "drink",
      },
      {
        name: "A Glass of Blanc de Blancs",
        nameJa: "シャンパン(グラス1杯)",
        priceRange: "£23.50",
        officialPrice: 23.5,
        priceCheckedAt: CHECKED,
        priceSourceUrl:
          "https://www.fortnumandmason.com/media/fortnums/blogpost/pdf/DJTS_Classic_Afternoon_Tea_Christmas_2026.pdf",
        reason:
          "メニューの最初に勧められている、フォートナム&メイソンのブラン・ド・ブラン(シャンパン)です。",
        role: "drink",
      },
    ],
  },
  {
    slug: "sketch-afternoon-tea",
    picks: [
      {
        name: "Afternoon Tea in the Glade",
        nameJa: "アフタヌーンティー(内装が主役のセット)",
        priceRange: "£70〜",
        reason:
          "**この店は味より空間を買いに行く店**です。セット内容より、どの部屋に通されるかのほうが体験を左右します。予約時に部屋の希望を伝えられることがあるので、聞いてみてください。",
        role: "signature",
      },
      {
        name: "卵型の個室トイレ",
        nameJa: "(注文品ではありません)",
        reason:
          "**注文とは関係ありませんが、行かずに帰る人が多いので書いておきます。** 白い卵型のカプセルが並ぶトイレがこの店で最も知られた場所です。食後に必ず寄ってください。",
        role: "second",
      },
    ],
  },

  // ── フィッシュ&チップス ──
  {
    slug: "poppies-fish-and-chips",
    picks: [
      {
        name: "Cod & Chips",
        nameJa: "タラのフィッシュ&チップス",
        priceRange: "£17〜22",
        reason:
          "迷ったらタラ(cod)。身が厚くて崩れにくく、**日本人が想像する白身魚の味に最も近い**のがこれです。ハドック(haddock)はもう少し風味が強く、好みが分かれます。",
        role: "signature",
      },
      {
        name: "Mushy Peas",
        nameJa: "マッシーピース(青えんどう豆のペースト)",
        priceRange: "£3〜4",
        reason:
          "**フィッシュ&チップスの正式な相棒**で、これを頼まないと片手落ちです。見た目に驚きますが、揚げ物の油を切る役割があります。少量なので1つを分ければ足ります。",
        role: "second",
      },
      {
        name: "Pickled Onion / Gherkin",
        nameJa: "酢漬けの玉ねぎ・きゅうり",
        priceRange: "£1〜3",
        reason:
          "現地の食べ方に寄せるならこれも。**酸味で最後まで飽きずに食べ切れます。** 揚げ物だけで進めると後半が重くなります。",
        role: "second",
      },
    ],
  },
  {
    slug: "the-golden-hind",
    picks: [
      {
        name: "Grilled Cod",
        nameJa: "タラのグリル(揚げていないもの)",
        priceRange: "£14〜18",
        reason:
          "**この店の隠れた注文**で、衣を付けずに焼いた魚を出します。揚げ物が続いて胃が疲れているとき、あるいは同行者が油物を避けたいときの逃げ道になります。他店にはあまりありません。",
        role: "signature",
      },
      {
        name: "Fried Cod & Chips",
        nameJa: "タラのフィッシュ&チップス",
        priceRange: "£12〜18",
        reason:
          "1914年創業の老舗の標準形。**衣が薄めで軽い**のがこの店の特徴で、重い衣が苦手ならここが合います。",
        role: "signature",
      },
    ],
  },
  {
    slug: "rock-and-sole-plaice",
    picks: [
      {
        name: "Haddock & Chips",
        nameJa: "ハドック(コダラ)のフィッシュ&チップス",
        priceRange: "£15〜20",
        reason:
          "タラより風味が強く、**イギリス北部ではこちらが標準**です。タラを食べたことがあるなら、次はこれで違いを試す価値があります。",
        role: "signature",
      },
      {
        name: "屋外のテーブル席",
        nameJa: "(注文品ではありません)",
        reason:
          "**コヴェント・ガーデンの路上に出た席がこの店の名物**です。店内は狭いので、天気が良ければ外を選んでください。席を選べるか最初に聞くのが早い。",
        role: "second",
      },
    ],
  },

  // ── サンデーロースト ──
  {
    slug: "blacklock-sunday-roast",
    picks: [
      {
        name: "All In",
        nameJa: "オール・イン(3種の肉の盛り合わせ)",
        priceRange: "£25〜30",
        reason:
          "**2人以上ならこれ一択**です。ビーフ・ポーク・ラムが一皿に乗り、付け合わせも込み。日曜日にこの店へ行く理由がこの皿に集約されています。1人だと量が多すぎます。",
        role: "signature",
      },
      {
        name: "Beef Sunday Roast",
        nameJa: "ビーフのサンデーロースト(単品)",
        priceRange: "£22〜28",
        reason:
          "1人で行くならこちら。**サンデーローストの標準はビーフ**なので、初めてならまずこれを基準にしてください。",
        role: "signature",
      },
      {
        name: "Pre-Chop Bites",
        nameJa: "前菜の小皿(骨付き肉の切れ端)",
        priceRange: "£5〜8",
        reason:
          "肉が出るまでの繋ぎに置かれる小皿。**安いわりに満足度が高い**ので、待ち時間が長そうなら頼んでおくと空腹で待たずに済みます。",
        role: "second",
      },
    ],
  },
  {
    slug: "hawksmoor-sunday-roast",
    picks: [
      {
        name: "Roast Sirloin",
        nameJa: "サーロインのロースト",
        priceRange: "£25〜35",
        reason:
          "**元がステーキ屋なので、肉そのものの質が他店と違います。** サンデーローストとしては高い部類ですが、払っている先が肉なのが分かる皿です。",
        role: "signature",
      },
      {
        name: "Beef Dripping Chips",
        nameJa: "牛脂で揚げたポテト",
        priceRange: "£5〜7",
        reason:
          "**この店で最も評判の良いサイド。** 牛脂で揚げたポテトで、植物油のものとは別物です。ローストに付いてこないので別途頼んでください。",
        role: "second",
      },
      {
        name: "Yorkshire Pudding",
        nameJa: "ヨークシャープディング",
        reason:
          "**サンデーローストに必ず付く器状のパン**で、グレイビーを吸わせて食べます。プディングという名前ですが甘くありません。付いてこなければ追加できます。",
        role: "second",
      },
    ],
  },
  {
    slug: "the-harwood-arms",
    picks: [
      {
        name: "Venison Scotch Egg",
        nameJa: "鹿肉のスコッチエッグ",
        priceRange: "£8〜12",
        reason:
          "**この店を有名にした一皿**で、ローストを頼むかどうかに関わらず注文する価値があります。鹿肉で包んだスコッチエッグはロンドンでもここが筆頭に挙がります。",
        role: "signature",
      },
      {
        name: "Sunday Roast (肉は週替わり)",
        nameJa: "サンデーロースト",
        priceRange: "£35〜50",
        reason:
          "ミシュラン星付きのパブなので、**肉は週によって変わります。** 何が出るかは当日次第なので、こだわりがあるなら予約時に確認してください。要予約です。",
        role: "signature",
      },
    ],
  },

  // ── イングリッシュ・ブレックファスト ──
  {
    slug: "regency-cafe",
    picks: [
      {
        name: "Set Breakfast (Large)",
        nameJa: "セットの朝食(大)",
        priceRange: "£9〜13",
        reason:
          "ベーコン・ソーセージ・卵・豆・トマト・トーストが一皿に乗る標準形。**単品で組むより明確に安い**ので、フル・イングリッシュを食べに来たならセットで頼んでください。",
        role: "signature",
      },
      {
        name: "Bubble & Squeak",
        nameJa: "バブル&スクイーク(茹で野菜を焼いた付け合わせ)",
        priceRange: "£1〜3",
        reason:
          "**残り物のじゃがいもとキャベツを焼き固めた家庭料理**で、観光客はまず頼みません。追加で£2ほど。イギリスの朝食らしさを一段深めたいならこれを足してください。",
        role: "second",
      },
      {
        name: "Mug of Tea",
        nameJa: "マグの紅茶",
        priceRange: "£1〜2",
        reason:
          "**この店ではコーヒーではなく紅茶**です。濃く入れてミルクをたっぷり入れる、いわゆるビルダーズ・ティー。朝食セットに合わせるならこちら。",
        role: "drink",
      },
    ],
  },
  {
    slug: "e-pellicci",
    picks: [
      {
        name: "Full English Breakfast",
        nameJa: "フル・イングリッシュ・ブレックファスト",
        priceRange: "£9〜14",
        reason:
          "1900年創業、イタリア系一家が営む店の標準形。**ここは料理より一家との会話が名物**なので、カウンター近くに座ると体験が変わります。",
        role: "signature",
      },
      {
        name: "Homemade Lasagne / Pasta",
        nameJa: "自家製ラザニア・パスタ",
        priceRange: "£8〜12",
        reason:
          "**イタリア系の店なのでパスタが本気**です。朝食の時間を過ぎてしまったとき、あるいは英国式の朝食に飽きたときの選択肢になります。",
        role: "second",
      },
    ],
  },
  {
    slug: "the-wolseley",
    picks: [
      {
        name: "Full English Breakfast",
        nameJa: "フル・イングリッシュ・ブレックファスト",
        priceRange: "£20〜35",
        reason:
          "**同じ料理をグリーン・パークの元自動車ショールームで食べる**のがこの店の値段の理由です。天井の高い空間で朝食を取る体験に払う店で、味だけで比べると割高に見えます。",
        role: "signature",
      },
      {
        name: "Eggs Benedict",
        nameJa: "エッグベネディクト",
        priceRange: "£16〜22",
        reason:
          "揚げ物が重いと感じるならこちら。**この店の朝食メニューで最も人気のある一皿**で、フル・イングリッシュより軽く済みます。",
        role: "signature",
      },
      {
        name: "Viennoiserie (Pastries)",
        nameJa: "クロワッサン等の焼き菓子",
        priceRange: "£5〜9",
        reason:
          "朝食を軽く済ませたい日の逃げ道。**コーヒーと焼き菓子だけでもこの空間には入れます。** 予算を抑えて内装だけ見たいときに使えます。",
        role: "second",
      },
    ],
  },

  // ── インドカレー ──
  {
    slug: "dishoom",
    picks: [
      {
        name: "House Black Daal",
        nameJa: "ハウス・ブラック・ダール(黒豆を煮込んだカレー)",
        priceRange: "£11.50",
        officialPrice: 11.5,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://www.dishoom.com/menu/all-day-main/",
        reason:
          "**店の看板の一皿です。** 黒豆をじっくり煮込んだカレーで、ナンに付けて食べます。",
        role: "signature",
      },
      {
        name: "Chicken Ruby",
        nameJa: "チキン・ルビー(トマトベースのチキンカレー)",
        priceRange: "£18.90",
        officialPrice: 18.9,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://www.dishoom.com/menu/all-day-main/",
        reason: "カレーを1皿頼むなら、これが基準になります。",
        role: "second",
      },
      {
        name: "Bacon Naan Roll",
        nameJa: "ベーコン・ナン・ロール",
        priceRange: "£11.70",
        officialPrice: 11.7,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://www.dishoom.com/menu/breakfast/",
        reason:
          "**朝食の時間だけの品です**(平日8:00〜11:45、週末9:00〜11:45)。ナンにベーコンを巻いたもので、昼と夜のメニューには載りません。",
        role: "seasonal",
      },
      {
        name: "House Chai",
        nameJa: "ハウス・チャイ",
        priceRange: "£4.90",
        officialPrice: 4.9,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://www.dishoom.com/menu/drinks/",
        reason: "イラニ・カフェの再現という店の趣旨に合う飲み物です。",
        role: "drink",
      },
    ],
  },
  {
    slug: "tayyabs",
    picks: [
      {
        name: "Lamb Chops",
        nameJa: "ラムチョップ(炭火焼き)",
        priceRange: "£10〜14",
        reason:
          "**この店の代名詞。** 鉄板に乗って煙を上げながら出てきます。カレーより先にこれを頼む客がほとんどで、頼まないと来た意味がありません。",
        role: "signature",
      },
      {
        name: "Karahi Gosht",
        nameJa: "カラヒ・ゴシュト(羊肉のカレー)",
        priceRange: "£12〜16",
        reason:
          "パンジャブ料理の店なので、**羊肉が中心**です。鶏より羊のほうがこの店の性格が出ます。辛さは強めなので、苦手なら伝えてください。",
        role: "second",
      },
      {
        name: "Bring Your Own Alcohol",
        nameJa: "(酒の持ち込み)",
        reason:
          "**この店は酒を出さず、持ち込みが認められています。** 近くの店でビールを買ってから入るのが常連の作法です。知らないと飲み物で困ります。",
        role: "drink",
      },
    ],
  },
  {
    slug: "brick-lane-curry-houses",
    picks: [
      {
        name: "客の入っている店を選ぶ",
        nameJa: "(店選びの基準)",
        reason:
          "**ここは1軒の店ではなく通りです。** 客引きが値引きを持ちかけてきますが、強く勧誘してくる店ほど中は空いています。**窓から中を見て、客が入っている店に入るのが最も確実**です。",
        role: "signature",
      },
      {
        name: "Balti / Bhuna",
        nameJa: "バルティ・ブナ(汁気の少ないカレー)",
        priceRange: "£10〜16",
        reason:
          "この通りの店はバングラデシュ系が多く、**汁気の少ないタイプが得意**です。イギリス式のこってりしたカレーを試すならこのあたりが分かりやすい。",
        role: "second",
      },
    ],
  },

  // ── パイ&マッシュ ──
  {
    slug: "m-manze",
    picks: [
      {
        name: "Pie, Mash & Liquor",
        nameJa: "パイ・マッシュ・リカー(緑のソース添え)",
        priceRange: "£6〜10",
        reason:
          "**リカーは酒ではなく、パセリの緑色のソース**です。これを抜くとこの料理ではなくなるので、見た目に驚いても付けたまま頼んでください。1902年創業、現存最古のパイ&マッシュ店です。",
        role: "signature",
      },
      {
        name: "Jellied Eels",
        nameJa: "ゼリー寄せのうなぎ",
        priceRange: "£5〜8",
        reason:
          "**ロンドンの労働者街の名物で、好き嫌いが激しく分かれます。** 冷たいゼリーに煮こごりのうなぎ。挑戦するなら少量から。**無理に頼む必要はありません。**",
        role: "second",
      },
      {
        name: "Vinegar (Chilli Vinegar)",
        nameJa: "唐辛子入りの酢",
        reason:
          "**テーブルに置いてある酢をかけるのが現地の食べ方**です。そのままだと味が単調なので、かけて初めてこの料理が分かります。",
        role: "second",
      },
    ],
  },
  {
    slug: "goddards-at-greenwich",
    picks: [
      {
        name: "Pie, Mash & Liquor",
        nameJa: "パイ・マッシュ・リカー",
        priceRange: "£7〜11",
        reason:
          "1890年創業。**グリニッジ観光と合わせられる立地**が最大の利点で、パイ&マッシュのためだけに東ロンドンへ行かなくて済みます。",
        role: "signature",
      },
      {
        name: "Vegetarian Pie",
        nameJa: "ベジタリアン向けのパイ",
        priceRange: "£7〜11",
        reason:
          "**老舗のパイ&マッシュ店には珍しく、肉以外の選択肢があります。** 同行者に肉を食べない人がいるならこの店を選んでください。",
        role: "second",
      },
    ],
  },

  // ── ソルトビーフ・ベーグル ──
  {
    slug: "beigel-bake",
    picks: [
      {
        name: "Salt Beef Beigel with Mustard & Pickle",
        nameJa: "ソルトビーフ・ベーグル(マスタードとピクルス入り)",
        priceRange: "£6〜9",
        reason:
          "**24時間営業の白い店のほう。** 注文時に「マスタードとピクルスは?」と聞かれるので、**両方入れるのが標準**です。迷ったら「both」と答えてください。",
        role: "signature",
      },
      {
        name: "Beigel with Cream Cheese & Salmon",
        nameJa: "クリームチーズとサーモンのベーグル",
        priceRange: "£4〜7",
        reason:
          "肉が重いときの選択肢。**深夜に寄るならこちらのほうが胃に優しい**。ソルトビーフは量が多く、夜中に食べ切れないことがあります。",
        role: "second",
      },
    ],
  },
  {
    slug: "beigel-shop",
    picks: [
      {
        name: "Salt Beef Beigel",
        nameJa: "ソルトビーフ・ベーグル",
        priceRange: "£6〜9",
        reason:
          "**黄色い看板の隣の店**で、こちらのほうが古く1855年創業を掲げます。**2軒は数十メートルしか離れていないので、両方買って食べ比べるのが正しい訪れ方**です。",
        role: "signature",
      },
    ],
  },

  // ── ラーメン ──
  {
    slug: "kanada-ya",
    picks: [
      {
        name: "Original Tonkotsu Ramen",
        nameJa: "豚骨ラーメン(基本)",
        priceRange: "£14〜18",
        reason:
          "**18時間炊いた豚骨スープが売りの店**なので、まずは何も足さない基本形で。ロンドンの豚骨ラーメンではここが基準として挙がります。",
        role: "signature",
      },
      {
        name: "Chashu Men",
        nameJa: "チャーシュー麺",
        priceRange: "£17〜21",
        reason:
          "チャーシューを増やしたもの。**ロンドンのラーメンは日本より高い**ので、£3ほどの差なら足したほうが満足度が上がります。",
        role: "second",
      },
      {
        name: "Kae-dama",
        nameJa: "替え玉",
        priceRange: "£2〜4",
        reason:
          "**替え玉があります。** 麺の硬さも指定できるので、日本と同じ食べ方が通ります。量が足りなければ遠慮なく。",
        role: "second",
      },
    ],
  },
  {
    slug: "bone-daddies",
    picks: [
      {
        name: "Tonkotsu",
        nameJa: "豚骨ラーメン",
        priceRange: "£15〜19",
        reason:
          "**日本のラーメンをそのまま再現する店ではなく、ロンドン向けに寄せた店**です。基本の豚骨でもニンニクや香味油が強め。日本の味を期待するとずれます。",
        role: "signature",
      },
      {
        name: "Tantanmen",
        nameJa: "担々麺",
        priceRange: "£16〜20",
        reason:
          "**この店の味付けの方向性に最も合う一杯。** もともと濃い味に振っているので、担々麺のような主張の強いものが噛み合います。",
        role: "signature",
      },
    ],
  },
  {
    slug: "tonkotsu-ramen",
    picks: [
      {
        name: "Tonkotsu",
        nameJa: "豚骨ラーメン",
        priceRange: "£13〜17",
        reason:
          "**自家製麺が売りの店**で、スープより麺に特徴があります。ロンドンのラーメン店では珍しく麺を店で打っています。",
        role: "signature",
      },
      {
        name: "Tokyo Ramen",
        nameJa: "東京ラーメン(醤油)",
        priceRange: "£13〜17",
        reason:
          "豚骨が続いて重いときに。**あっさりした醤油ベース**で、複数店を回るならこちらを挟むと胃が保ちます。",
        role: "second",
      },
    ],
  },

  // ── 日本食 ──
  {
    slug: "koya",
    picks: [
      {
        name: "Kake Udon (Hot)",
        nameJa: "かけうどん(温)",
        priceRange: "£10〜14",
        reason:
          "**足で踏んで作る手打ちうどんが売り**なので、まずは出汁と麺だけの基本形で。余計なものが乗らないぶん麺の質がそのまま出ます。",
        role: "signature",
      },
      {
        name: "Atsu-atsu / Hiya-atsu",
        nameJa: "温かい麺に冷たいつゆ・冷たい麺に温かいつゆ",
        priceRange: "£11〜15",
        reason:
          "**麺とつゆの温度を別々に選べる**のがこの店の面白いところ。日本のうどん屋でも珍しい組み合わせを試せます。",
        role: "second",
      },
      {
        name: "English Breakfast Udon",
        nameJa: "イングリッシュ・ブレックファスト・うどん",
        priceRange: "£12〜16",
        reason:
          "**ベーコンと卵をうどんに乗せた、この店にしかない一杯。** ロンドンで食べる意味がある皿という点では、かけうどんより強い選択肢です。",
        role: "second",
      },
    ],
  },
  {
    slug: "jin-kichi",
    picks: [
      {
        name: "Charcoal-grilled Skewers (Kushiyaki)",
        nameJa: "炭火の串焼き",
        priceRange: "£3〜6/本",
        reason:
          "**この店は寿司屋ではなく串焼きの店**として評価されています。1978年からハムステッドで続く店で、炭火の串を頼まずに帰るのは違います。数本ずつ頼んでください。",
        role: "signature",
      },
      {
        name: "Sashimi Selection",
        nameJa: "刺身の盛り合わせ",
        priceRange: "£20〜35",
        reason:
          "串焼きと合わせるなら。**ロンドンの日本食としては魚の質が安定している**店ですが、価格は日本の感覚より高くなります。",
        role: "second",
      },
    ],
  },
  {
    slug: "namaiki",
    picks: [
      {
        name: "Omakase Course",
        nameJa: "おまかせコース",
        reason:
          "**単品ではなくコースの店**です。公式は価格を公開していません。**予約するときに総額とサービス料を確認してください。**",
        role: "signature",
      },
    ],
  },

  // ── 中華 ──
  {
    slug: "noodle-inn",
    picks: [
      {
        name: "Hand-pulled Noodles",
        nameJa: "手打ちの拉麺",
        priceRange: "£10〜15",
        reason:
          "**麺を店で引いているのがこの店の売り**です。中華街の店は数が多く選びにくいので、手打ち麺という分かりやすい基準で選べるのが利点。",
        role: "signature",
      },
      {
        name: "Chilli Oil Wontons",
        nameJa: "ラー油のワンタン",
        priceRange: "£6〜10",
        reason:
          "麺と一緒に頼む小皿として定番。**辛さは調整してもらえることが多い**ので、苦手なら伝えてください。",
        role: "second",
      },
    ],
  },
  {
    slug: "dumplings-legend",
    picks: [
      {
        name: "Xiao Long Bao",
        nameJa: "小籠包",
        priceRange: "£8〜12",
        reason:
          "**厨房がガラス張りで、包んでいるところが見えます。** 店名の通り点心が主役なので、まずこれ。熱いので最初のひと口で汁を吸ってください。",
        role: "signature",
      },
      {
        name: "Dim Sum Selection",
        nameJa: "点心の盛り合わせ",
        priceRange: "£15〜25",
        reason:
          "**昼の時間帯は点心が中心**です。複数人なら盛り合わせで頼んで分けるのが効率的で、1人だと種類を絞ることになります。",
        role: "second",
      },
    ],
  },
  {
    slug: "new-loon-fung",
    picks: [
      {
        name: "Trolley Dim Sum",
        nameJa: "ワゴンの点心",
        priceRange: "£15〜30",
        reason:
          "**ワゴンが回ってきて、乗っているものを指させば取れる形式**です。メニューが読めなくても注文できるので、中華街で最も敷居が低い。**この形式は昼の時間帯だけ**です。",
        role: "signature",
      },
      {
        name: "Char Siu Bao",
        nameJa: "チャーシューまん",
        priceRange: "£4〜7",
        reason:
          "ワゴンで迷ったらまずこれ。**外れがなく、辛くもないので誰と行っても安全**な一品です。",
        role: "second",
      },
    ],
  },

  // ── 料理ページを持たない店(「絶対行くべき店」から) ──
  {
    slug: "the-devonshire",
    picks: [
      {
        name: "Steak Sandwich",
        nameJa: "ステーキ・サンドイッチ(1階のパブ)",
        priceRange: "£12",
        officialPrice: 12,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://www.devonshiresoho.co.uk/menus/bar-menu.pdf",
        reason:
          "予約なしで入れる1階のパブで頼める品です。牛肉は店で熟成させて切り分けています(公式)。",
        role: "signature",
      },
      {
        name: "Sausage Roll",
        nameJa: "ソーセージ・ロール(1階のパブ)",
        priceRange: "£6",
        officialPrice: 6,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://www.devonshiresoho.co.uk/menus/bar-menu.pdf",
        reason: "パブの軽食は、店の精肉場とパン焼き場で作っています(公式)。",
        role: "second",
      },
      {
        name: "Beef Cheek and Guinness Suet Pudding",
        nameJa: "牛ほほ肉とギネスのスエット・プディング(2〜3階の食堂)",
        priceRange: "£28",
        officialPrice: 28,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://www.devonshiresoho.co.uk/menus/restaurant-menu.pdf",
        reason:
          "牛ほほ肉をギネスで煮込み、牛脂を練り込んだ生地で包んで蒸したイギリスの料理です。予約制の食堂のメニューにあります。",
        role: "second",
      },
    ],
  },
  {
    slug: "padella",
    picks: [
      {
        name: "Pici cacio & pepe",
        nameJa: "ピチ・カチョ・エ・ペペ(太い手打ち麺、ペコリーノと黒胡椒)",
        priceRange: "£13〜13.5",
        officialPrice: 13.5,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://www.padella.co/borough-market/",
        reason:
          "店の名物です。11月4日のメニューで、ボロー店とショーディッチ店は£13.5、ソーホー店は£13でした。",
        role: "signature",
      },
      {
        name: "Pappardelle with 8 hours Hereford beef shin ragu",
        nameJa: "パッパルデッレ(ヘレフォード牛すね肉の8時間ラグー)",
        priceRange: "£15.5〜16.5",
        officialPrice: 16.5,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://www.padella.co/borough-market/",
        reason:
          "幅の広い手打ち麺に、牛すね肉を8時間煮込んだラグーを合わせた皿です(メニューの表記)。",
        role: "second",
      },
      {
        name: "Tagliarini with slow cooked tomato sauce",
        nameJa: "タリアリーニ(じっくり煮たトマトソース)",
        priceRange: "£12.5",
        officialPrice: 12.5,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://www.padella.co/borough-market/",
        reason: "11月4日のメニューで、いちばん安い皿でした。",
        role: "second",
      },
    ],
  },
  {
    slug: "st-john-smithfield",
    picks: [
      {
        name: "Roast Bone Marrow and Parsley Salad",
        nameJa: "骨髄のローストとパセリのサラダ",
        priceRange: "£16.50",
        officialPrice: 16.5,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://stjohnrestaurant.com/a/menus/1",
        reason: "店の看板の一皿です。骨ごと焼いた髄に、パセリのサラダを添えます。",
        role: "signature",
      },
      {
        name: "Eccles Cake and Lancashire Cheese",
        nameJa: "エクルズ・ケーキとランカシャー・チーズ",
        priceRange: "£12.50",
        officialPrice: 12.5,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://stjohnrestaurant.com/a/menus/1",
        reason:
          "干しぶどうを詰めたパイ菓子に、ランカシャー地方のチーズを合わせるデザートです。",
        role: "second",
      },
      {
        name: "Madeleines Half Dozen",
        nameJa: "マドレーヌ(6個)",
        priceRange: "£10",
        officialPrice: 10,
        priceCheckedAt: CHECKED,
        priceSourceUrl: "https://stjohnrestaurant.com/a/menus/1",
        reason:
          "注文を受けてから焼くので15分かかります(メニューの表記)。12個は£18です。",
        role: "second",
      },
    ],
  },
  {
    slug: "simpsons-in-the-strand",
    picks: [
      {
        name: "Roast Rib of Devonshire Beef",
        nameJa: "デヴォン産牛リブのロースト(席で切り分け)",
        priceRange: "£49.75",
        officialPrice: 49.75,
        priceCheckedAt: CHECKED,
        priceSourceUrl:
          "https://www.simpsonsinthestrand.co.uk/wp-content/uploads/2026/09/00362_Simpsons_Grand_Divan_MAIN_Menu_AUGUST_2026.pdf",
        reason:
          "ワゴンで運んで席で切り分ける、店の名物です。ヨークシャー・プディング、根菜のロースト、ホースラディッシュのソースとグレイビーが付きます(公式メニュー)。",
        role: "signature",
      },
      {
        name: "The English Gambit",
        nameJa: "イングリッシュ・ブレックファスト(朝食)",
        priceRange: "£22.75",
        officialPrice: 22.75,
        priceCheckedAt: CHECKED,
        priceSourceUrl:
          "https://www.simpsonsinthestrand.co.uk/wp-content/uploads/2026/09/00362_Simpsons_Grand_Divan_BREAKFAST_Menu_A5_4pp_AUGUST_2026.pdf",
        reason:
          "好みの調理の卵、カンバーランド・ソーセージ、ベーコン、焼きトマト、バブル&スクイークの皿です(公式の朝食メニュー)。朝食は平日7時からです。",
        role: "seasonal",
      },
      {
        name: "English Breakfast tea",
        nameJa: "イングリッシュ・ブレックファスト・ティー",
        priceRange: "£6.50",
        officialPrice: 6.5,
        priceCheckedAt: CHECKED,
        priceSourceUrl:
          "https://www.simpsonsinthestrand.co.uk/wp-content/uploads/2026/09/00362_Simpsons_Grand_Divan_BREAKFAST_Menu_A5_4pp_AUGUST_2026.pdf",
        reason: "朝食メニューの紅茶です。",
        role: "drink",
      },
    ],
  },
];

async function main() {
  let shops = 0;
  let picks = 0;
  const missing: string[] = [];

  for (const entry of MENU_PICKS) {
    const restaurant = await db.restaurant.findUnique({
      where: { slug: entry.slug },
      select: { id: true, name: true },
    });

    if (!restaurant) {
      missing.push(entry.slug);
      continue;
    }

    // image は手で埋める列なので、全消し→再投入はしない。
    // 同名の皿があれば更新し、無ければ足す。
    for (const [i, p] of entry.picks.entries()) {
      const existing = await db.menuPick.findFirst({
        where: { restaurantId: restaurant.id, name: p.name },
        select: { id: true },
      });

      const data = {
        name: p.name,
        nameJa: p.nameJa ?? null,
        priceRange: p.priceRange ?? null,
        reason: p.reason,
        role: p.role ?? "signature",
        officialPrice: p.officialPrice ?? null,
        priceCheckedAt: p.priceCheckedAt
          ? new Date(`${p.priceCheckedAt}T00:00:00Z`)
          : null,
        priceSourceUrl: p.priceSourceUrl ?? null,
        displayOrder: i,
      };

      if (existing) {
        await db.menuPick.update({ where: { id: existing.id }, data });
      } else {
        await db.menuPick.create({
          data: { ...data, restaurantId: restaurant.id },
        });
      }
      picks += 1;
    }

    // seed から外した皿を消す。写真を手で入れた皿は残す(消すと写真ごと失う)。
    const removed = await db.menuPick.deleteMany({
      where: {
        restaurantId: restaurant.id,
        name: { notIn: entry.picks.map((p) => p.name) },
        image: null,
      },
    });
    if (removed.count > 0) {
      console.log(`  - ${restaurant.name}: 外した皿 ${removed.count}件を削除`);
    }

    shops += 1;
    console.log(`✓ ${restaurant.name} (${entry.picks.length}皿)`);
  }

  if (missing.length > 0) {
    console.warn(`\n× 見つからない店: ${missing.join(", ")}`);
  }
  console.log(`\n${shops}店・計${picks}皿を投入。`);
}

const invokedDirectly = process.argv[1]?.endsWith("seed-menu-picks.ts");

if (invokedDirectly) {
  main()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
}

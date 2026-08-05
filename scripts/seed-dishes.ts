import "dotenv/config";
import db from "../utils/db";
import {
  imageColumns,
  resolveCommonsImage,
  type CommonsImage,
} from "./lib/commons";

/**
 * /restaurants の料理・店データを投入する。
 *
 * 店には住所を持たせない。番地の裏取りができないうえ、移転すると
 * 一番目立つ場所に古い情報が残る。エリアと最寄り駅、公式サイトがあれば
 * 読者は辿り着けるし、この3つは番地より変わりにくい。
 */

type RestaurantSeed = {
  slug: string;
  name: string;
  engName: string;
  blurb: string;
  body?: string;
  area: string;
  nearestStation?: string;
  priceRange?: string;
  website?: string;
  bookingRequired?: boolean;
  commonsFile?: string;
};

type DishSeed = {
  slug: string;
  name: string;
  engName: string;
  tagline: string;
  summary: string;
  body: string;
  howTo?: string;
  priceRange?: string;
  bestTime?: string;
  commonsFile?: string;
  restaurants: RestaurantSeed[];
};

const DISHES: DishSeed[] = [
  {
    slug: "afternoon-tea",
    name: "アフタヌーンティー",
    engName: "Afternoon Tea",
    tagline: "食事というより行事。予約を取り、2時間を空けて臨むもの。",
    summary:
      "3段スタンドのサンドイッチ・スコーン・ケーキを、紅茶を替えながら2時間かけて食べる。ロンドンで最も予約が必要な食事です。",
    body: `19世紀半ば、第7代ベッドフォード公爵夫人アンナが「昼食から夕食までの間が空きすぎて耐えられない」として、午後に紅茶と軽食を運ばせたのが始まりとされています。当時の夕食は夜8時ごろ。空腹をしのぐための私的な習慣が、やがて社交の形式になりました。

構成はほぼ決まっています。下段に**フィンガーサンドイッチ**（キュウリ、スモークサーモン、卵とクレス、ハムマスタードあたり）、中段に**スコーン**とクロテッドクリーム・ジャム、上段に**ペイストリーとケーキ**。紅茶は数種類から選べ、多くの店でおかわりや別の茶葉への変更ができます。

似た言葉に**ハイティー**がありますが、これは別物です。もともとは労働者階級が仕事を終えた夕方に、肉や卵を含むしっかりした食事を高い（high）テーブルで摂ったもの。優雅なイメージで使われがちですが、本来は逆の意味合いを持つ言葉です。

値段はロンドン中心部のホテルで1人 £60〜100 が相場。決して安くありませんが、**2時間近く席にいられて、食べきれない分は箱に詰めて持ち帰れる店も多い**ので、一食としてはそれほど不合理ではありません。`,
    howTo: `- **予約はほぼ必須。** 人気店は数週間から数か月前に埋まります。思い立った日に入れる場所ではありません
- **食べる順番は下から上。** サンドイッチ → スコーン → ケーキ。甘さが段々強くなる設計になっています
- **スコーンはナイフで切らず、手で横に割る。** これが作法とされています
- クリームとジャムのどちらを先に塗るかは、デヴォン式（クリームが先）とコーンウォール式（ジャムが先）で今も論争があります。どちらでも構いませんが、話題としては鉄板です
- **ドレスコードに注意。** 高級ホテルではジーンズ・スニーカー不可、男性はジャケット着用を求められる店があります。予約時に必ず確認してください
- 食べきれないのが普通です。持ち帰り用の箱をもらえるか聞いてみてください`,
    priceRange: "£40〜100",
    bestTime: "14:00〜17:00 / 要予約",
    commonsFile: "File:Afternoon tea, Beaumont Hotel, London.jpg",
    restaurants: [
      {
        slug: "the-ritz-afternoon-tea",
        name: "ザ・リッツ",
        engName: "The Ritz London",
        blurb:
          "格式で選ぶならここ。ドレスコードが最も厳しく、そのぶん体験としての密度が高い。",
        body: `パーム・コートと呼ばれる吹き抜けの空間で、生演奏を聴きながら供されます。ロンドンのアフタヌーンティーの基準点のような存在で、1日に複数回の時間帯が設定されているほど需要があります。

**ドレスコードが明確**なのが特徴で、男性はジャケットとネクタイが必要、ジーンズとスニーカーは不可。旅行の荷物にジャケットを入れるかどうかを、予約の段階で決めておく必要があります。予約は数か月前から埋まります。`,
        area: "ピカデリー",
        nearestStation: "Green Park",
        priceRange: "£75〜",
        website: "https://www.theritzlondon.com/",
        bookingRequired: true,
        commonsFile: "File:The Ritz London.jpg",
      },
      {
        slug: "fortnum-and-mason-tea-salon",
        name: "フォートナム&メイソン",
        engName: "Fortnum & Mason",
        blurb:
          "紅茶そのものの品揃えが最強。買い物と同じ建物で済むので、旅程に組み込みやすい。",
        body: `1707年創業の老舗。上階のティーサロンでアフタヌーンティーを供しています。**紅茶専門店が母体**なので茶葉の選択肢が非常に多く、紅茶を目的に来るならここが分かりやすい。

同じ建物の下の階が土産物の宝庫なので、**お茶をしてそのまま買い物**という流れが作れます。ホテルのアフタヌーンティーより旅程に組み込みやすいのが実務的な利点です。`,
        area: "ピカデリー",
        nearestStation: "Green Park / Piccadilly Circus",
        priceRange: "£70〜",
        website: "https://www.fortnumandmason.com/",
        bookingRequired: true,
      },
      {
        slug: "sketch-afternoon-tea",
        name: "スケッチ",
        engName: "sketch",
        blurb:
          "内装で選ぶ店。伝統的な格式より、写真に撮りたくなる空間を求める人向け。",
        body: `メイフェアのタウンハウスを改装したレストラン兼ギャラリー。**内装そのものが目的地**になっている珍しい店で、アートに覆われた部屋のデザインは折々に大きく変わります。卵形のカプセルが並ぶトイレも有名。

伝統的なホテルのアフタヌーンティーとは方向性が違うので、「格式を体験したい」のか「非日常の空間に行きたい」のかで選び分けてください。こちらも予約必須です。`,
        area: "メイフェア",
        nearestStation: "Oxford Circus",
        priceRange: "£70〜",
        website: "https://sketch.london/",
        bookingRequired: true,
      },
    ],
  },

  {
    slug: "fish-and-chips",
    name: "フィッシュ&チップス",
    engName: "Fish and Chips",
    tagline: "一度は食べる。ただし店を選ばないと、まるで別の料理になる。",
    summary:
      "白身魚のフライと極太のポテト。観光地の適当な店とちゃんとした専門店とで、同じ名前の別料理くらい差が出ます。",
    body: `イギリスを象徴する料理ですが、成り立ちは移民料理です。**衣をつけて揚げた魚**はユダヤ系移民が持ち込んだ調理法で、これに揚げたジャガイモが組み合わさり、19世紀後半に労働者の食事として定着しました。第二次大戦中も配給制の対象外に置かれ続けた、数少ない食べ物でもあります。

魚は **cod（タラ）** か **haddock（ハドック）** が基本。注文時にどちらか聞かれます。コッドのほうが身が厚くて淡白、ハドックは少し風味が強い。付け合わせには **mushy peas**（潰したグリーンピース。見た目は強烈ですが塩気が揚げ物に合います）、タルタルソース、カレーソースなど。

味の決め手は**衣と油**です。専門店（"chippy" と呼ばれます）は揚げたてを出しますが、観光地の回転の悪い店では作り置きの衣がしんなりしていることがある。**同じ£15を払うなら、店を選ぶだけで満足度が倍違う**料理です。`,
    howTo: `- **塩と酢（salt and vinegar）をかけるか聞かれます。** 「やってみたい」なら是非。モルトビネガーの酸味が揚げ物を軽くします
- テイクアウェイのほうが安く、着席（sit-in）は1.5倍ほどになる店が多い
- 量が相当多いです。ポーションのサイズを選べる店なら小さいほうで十分
- **チップスはフライドポテトより太く、中がほくほく。** マクドナルドのそれとは別物と思ってください`,
    priceRange: "£10〜20",
    bestTime: "昼・夜どちらでも",
    commonsFile: "File:Fish and chips plate with peas.jpg",
    restaurants: [
      {
        slug: "poppies-fish-and-chips",
        name: "ポピーズ",
        engName: "Poppies Fish & Chips",
        blurb:
          "1950年代の内装を再現した店。観光客にも入りやすく、味も落とさない安全牌。",
        body: `スピタルフィールズ、カムデン、ソーホーに店を構えます。ジュークボックスとレトロな内装で写真映えし、席で食べられるので観光の途中に寄りやすい。

「雰囲気重視の観光客向け」に見えて中身はしっかりしており、**初めてのフィッシュ&チップスとして外しにくい**選択肢です。混む時間帯は行列ができます。`,
        area: "スピタルフィールズ / カムデン / ソーホー",
        nearestStation: "Liverpool Street / Camden Town",
        priceRange: "£15〜22",
        website: "https://poppiesfishandchips.co.uk/",
        commonsFile: "File:Poppies Fish & Chips 6-8 Hanbury Street 2015-05-18.jpg",
      },
      {
        slug: "the-golden-hind",
        name: "ゴールデン・ハインド",
        engName: "The Golden Hind",
        blurb:
          "1914年創業。メリルボーンの路地にある、観光地価格になっていない老舗。",
        body: `メリルボーン・レーンの小さな店。100年以上続く老舗でありながら、値段は観光地の相場より抑えめです。揚げ物だけでなく**グリル（揚げていない魚）**も選べるのが特徴で、脂っこいものが苦手な人にはこちらが向きます。

席数が少ないので昼時は待つことがあります。`,
        area: "メリルボーン",
        nearestStation: "Bond Street",
        priceRange: "£12〜18",
        commonsFile: "File:Golden Hind, Marylebone, London (6820332564).jpg",
      },
      {
        slug: "rock-and-sole-plaice",
        name: "ロック&ソール・プレイス",
        engName: "Rock & Sole Plaice",
        blurb:
          "コヴェント・ガーデンのど真ん中。観光の動線上で食べたいときの現実解。",
        body: `1871年から続くと掲げる、ロンドン最古級のフィッシュ&チップス店。コヴェント・ガーデンから歩いてすぐという立地が最大の強みで、**観光の合間に無理なく寄れます**。

天気が良ければ店先の屋外席が気持ちいい。立地相応に混みます。`,
        area: "コヴェント・ガーデン",
        nearestStation: "Covent Garden / Holborn",
        priceRange: "£15〜20",
        commonsFile: "File:The Rock & Sole Plaice.jpg",
      },
    ],
  },

  {
    slug: "sunday-roast",
    name: "サンデーロースト",
    engName: "Sunday Roast",
    tagline: "日曜の昼だけ、パブが本気を出す。売り切れたら終わり。",
    summary:
      "ローストした肉に、ヨークシャープディングとロースト野菜とグレイビー。日曜限定なので、旅程の側を合わせる必要があります。",
    body: `イギリスの家庭が日曜日に食べてきた、一週間で最も重い食事。教会から戻ってオーブンに肉を入れる、という生活のリズムから生まれた習慣です。今は家庭で作るより**パブで食べる**ほうが一般的になりました。

皿の上に載るものはだいたい決まっています。

- **肉**：ビーフ、ラム、ポーク、チキンから選ぶ。ベジタリアン向けの nut roast を置く店も多い
- **ヨークシャープディング**：小麦粉と卵と牛乳を高温で焼いた、器のように膨らんだもの。グレイビーを受け止めるための存在
- **ロースト・ポテト**：外はカリカリ、中はほくほく。イギリス人がこだわる部分
- **季節の野菜**：ニンジン、パースニップ、芽キャベツ、ブロッコリーなど
- **グレイビー**：肉汁から作るソース。全体にかけて食べる

重要なのは**日曜の昼にしか出ない**ということです。しかも仕込んだ分がなくなれば終わり。夕方に行くと「roast は終わりました」と言われることが珍しくありません。`,
    howTo: `- **日曜の12時〜15時が本番。** 14時を過ぎると売り切れが出始めます
- 人気店は予約必須。当日ふらっと入れる前提で組まないこと
- 肉の種類を選びます。迷ったら **beef** が最も定番
- **量が非常に多い。** 朝食を軽くしておくと最後まで食べられます
- グレイビーは足りなければおかわりを頼めます`,
    priceRange: "£20〜40",
    bestTime: "日曜 12:00〜15:00",
    commonsFile: "File:Traditional.Sunday.Roast-01.jpg",
    restaurants: [
      {
        slug: "blacklock-sunday-roast",
        name: "ブラックロック",
        engName: "Blacklock",
        blurb:
          "日曜ローストで名前が挙がる店。全部盛りの「All In」が名物。",
        body: `チョップハウス（肉料理の店）として知られますが、**日曜のローストで特に評価が高い**店です。複数の肉が一皿に載る「All In」を人数分で頼むのが定番の食べ方。

ソーホーをはじめ市内数か所に店があります。日曜は予約が取りにくいので、旅程が決まった段階で押さえておくのが安全です。`,
        area: "ソーホーほか",
        nearestStation: "Piccadilly Circus",
        priceRange: "£25〜35",
        website: "https://theblacklock.com/",
        bookingRequired: true,
      },
      {
        slug: "hawksmoor-sunday-roast",
        name: "ホークスモア",
        engName: "Hawksmoor",
        blurb:
          "ステーキハウスの日曜ロースト。肉の質で選ぶならここが分かりやすい。",
        body: `イギリス産の熟成牛で知られるステーキハウス。**日曜だけローストを出します**。ステーキの店が本気で焼いた肉なので、肉そのものの質を目当てにするなら選びやすい。

市内に複数店舗があり、いずれも予約推奨。ディナーで行くと高くつきますが、日曜のローストは比較的手が届く価格帯です。`,
        area: "セブン・ダイアルズ / ボロー ほか",
        nearestStation: "Covent Garden / London Bridge",
        priceRange: "£25〜40",
        website: "https://thehawksmoor.com/",
        bookingRequired: true,
      },
      {
        slug: "the-harwood-arms",
        name: "ハーウッド・アームズ",
        engName: "The Harwood Arms",
        blurb:
          "ミシュラン星付きのパブ。中心部から外れるぶん、観光客の少ない日曜を過ごせる。",
        body: `フラムにあるガストロパブ。パブとしてミシュランの星を得ている珍しい店で、**鹿肉（venison）**をはじめとするジビエで知られます。

中心部からは離れるので移動時間を見込む必要がありますが、そのぶん観光地の喧騒がない。予約は必須です。`,
        area: "フラム",
        nearestStation: "Fulham Broadway",
        priceRange: "£35〜50",
        website: "https://harwoodarms.com/",
        bookingRequired: true,
      },
    ],
  },

  {
    slug: "full-english-breakfast",
    name: "イングリッシュ・ブレックファスト",
    engName: "Full English Breakfast",
    tagline: "一日一食で済む朝食。観光の初日にこそ効く。",
    summary:
      "ベーコン、ソーセージ、卵、ベイクドビーンズ、トマト、マッシュルーム。皿が埋まるまで載せる、イギリスの朝の定番です。",
    body: `ヴィクトリア朝の地主階級の朝食が起源とされ、20世紀に労働者の食事として広まりました。一皿の内容はおおむね次の通りです。

- **ベーコン**（アメリカのそれより厚く、ハムに近い）
- **ソーセージ**（バンガーズ。ハーブが効いていて肉々しい）
- **卵**（目玉焼き、スクランブル、ポーチドから選べることが多い）
- **ベイクドビーンズ**（トマトソースの豆。皿の上で他と混ざる）
- **グリルドトマト**と**マッシュルーム**
- **ブラックプディング**（豚の血のソーセージ。苦手なら抜いてもらえます）
- **トースト**または**フライドブレッド**、**ハッシュブラウン**

これを供する庶民的なカフェを **"greasy spoon"**（脂じみたスプーン）と呼びます。蔑称のようでいて愛着のこもった言い方で、ロンドンの街の記憶と強く結びついた場所です。近年は家賃高騰で数を減らしており、**残っている老舗は行っておく価値があります**。

紅茶は濃く煮出したものにミルクをたっぷり入れた **builder's tea**（現場作業員の紅茶）が定番。これも含めて一つの体験です。`,
    howTo: `- **朝食の量が尋常ではありません。** これを食べたら昼は抜くくらいの想定で
- ブラックプディングが苦手なら、注文時に "without black pudding" と伝えれば外してくれます
- 卵の焼き方を聞かれます。fried / scrambled / poached
- 老舗のカフェは**現金のみ**の店がまだあります。少額の現金を持っておくと安全
- 週末の朝は並びます。平日の朝が狙い目`,
    priceRange: "£8〜20",
    bestTime: "7:00〜11:00",
    commonsFile: "File:Full English Breakfast.JPG",
    restaurants: [
      {
        slug: "regency-cafe",
        name: "リージェンシー・カフェ",
        engName: "Regency Cafe",
        blurb:
          "1946年開業。黒タイルの外観が有名で、映画にも使われてきたロンドンの朝の象徴。",
        body: `ウェストミンスターの住宅街にある、黒いタイル張りの外観が印象的なカフェ。**1946年から続く**greasy spoon の代表格で、映画やドラマのロケ地としても知られます。

注文が出来上がると**カウンターから名前や品名を大声で呼ばれる**のがこの店の名物。緊張しますが、それも含めて体験です。朝は並びますが回転は速い。

ウェストミンスター寺院やビッグ・ベンから歩ける距離なので、**観光の初日の朝に組み込みやすい**立地です。`,
        area: "ウェストミンスター",
        nearestStation: "Pimlico / St James's Park",
        priceRange: "£8〜13",
        commonsFile: "File:Regency Cafe, Westminster (1).jpg",
      },
      {
        slug: "e-pellicci",
        name: "E・ペリッチ",
        engName: "E Pellicci",
        blurb:
          "1900年創業、イーストエンドのイタリア系一家が続けるカフェ。内装が文化財に指定されている。",
        body: `ベスナル・グリーンにある家族経営のカフェ。1900年の創業以来、同じ一家が続けています。**1946年に施された木象嵌の内装がグレードII指定の文化財**になっており、建物ごと保存対象という珍しい店。

イタリア系の家族が営むため、通常の英国式朝食に加えてパスタなどのイタリア料理も出ます。常連と店主の距離が近く、観光地の飲食店とはまったく違う空気があります。

席数が少ないので、時間帯によっては相席になります。`,
        area: "ベスナル・グリーン",
        nearestStation: "Bethnal Green",
        priceRange: "£8〜14",
        commonsFile:
          "File:London Borough of Tower Hamlets - E. Pellicci Cafe - 20230330173314.jpg",
      },
      {
        slug: "the-wolseley",
        name: "ザ・ウォルズリー",
        engName: "The Wolseley",
        blurb:
          "自動車ショールームを改装した壮麗なカフェ。同じ朝食を、まったく違う舞台で。",
        body: `ピカデリーにある、1920年代の自動車ショールームを転用したグランド・カフェ。黒と金を基調にした高い天井の空間で、**同じイングリッシュ・ブレックファストが別の料理に見えます**。

greasy spoon の対極にある選択肢で、値段も相応。朝から人が入るので予約が無難です。グリーン・パークやリッツと同じ通りにあるため、午前の観光と繋げやすい立地。`,
        area: "ピカデリー",
        nearestStation: "Green Park",
        priceRange: "£20〜35",
        website: "https://www.thewolseley.com/",
        bookingRequired: true,
      },
    ],
  },

  {
    slug: "indian-curry",
    name: "インドカレー",
    engName: "Indian Curry",
    tagline: "ロンドンで最も進化した「イギリス料理」。国民食と呼ばれるまでになった。",
    summary:
      "移民が持ち込み、この街で作り替えられた料理。安い定食から星付きまで、価格帯の幅が最も広いジャンルです。",
    body: `イギリス料理と言いながら、実質的にロンドンで最も外れが少ないのがインド系の料理です。南アジアからの移民が持ち込み、現地の嗜好に合わせて変化してきました。

象徴的なのが**チキン・ティッカ・マサラ**。イギリスで生まれたという説が有力で（グラスゴーの店が発祥という話が知られていますが諸説あります）、2001年には当時の外相ロビン・クックが演説で「真の英国の国民食」と呼びました。**移民の料理が国の料理になった**という文脈まで含めて、この街を語る一皿です。

地域によって色があります。

- **ブリック・レーン**（バングラデシュ系。"Banglatown" とも呼ばれる通り）
- **ホワイトチャペル**（パンジャブ系。ラムチョップで知られる店が集まる）
- **サウソール**や**トゥーティング**（中心部から離れるが、より地元向けの店が多い）

観光の合間に食べるなら中心部のモダンな店、時間があるならローカルな地区へ、という使い分けができます。`,
    howTo: `- **ナンかライスかを選びます。** カレーと別料金なので、頼み忘れるとカレーだけが来ます
- 辛さは日本の感覚より控えめなことが多い。物足りなければ辛くしてもらえます
- **BYOB（酒の持ち込み可）**の店があります。酒代が浮くので、事前に確認する価値あり
- ブリック・レーンには**客引き**が多く、値引きを持ちかけられます。強く勧めてくる店ほど良いとは限りません
- 数人でシェアする前提の量。2人なら カレー2 + ナン1〜2 + ライス1 くらいで足ります`,
    priceRange: "£12〜40",
    bestTime: "昼・夜どちらでも",
    commonsFile: "File:Chicken tikka masala.jpg",
    restaurants: [
      {
        slug: "dishoom",
        name: "ディシューム",
        engName: "Dishoom",
        blurb:
          "旧ボンベイのイラニ・カフェを再現した内装。ロンドンで最も予約が取りにくい店のひとつ。",
        body: `20世紀のボンベイにあったイラニ・カフェ（ペルシャ系移民が営んだ大衆食堂）へのオマージュとして作られた店。**内装の作り込みが徹底していて**、店に入った時点で体験が始まります。

名物は黒豆を長時間煮込んだ **black daal** と、朝に出る **bacon naan roll**。日本人の口にも合いやすい味付けで、辛さで身構える必要がありません。

コヴェント・ガーデン、キングス・クロス、ショーディッチ、カーナビーなど複数店舗。**とにかく混むので予約を強く推奨**します。`,
        area: "コヴェント・ガーデン / キングス・クロス / ショーディッチ ほか",
        nearestStation: "Covent Garden / King's Cross",
        priceRange: "£20〜35",
        website: "https://www.dishoom.com/",
        bookingRequired: true,
        commonsFile: "File:Dishoom King's Cross interior 1.jpg",
      },
      {
        slug: "tayyabs",
        name: "タイヤブス",
        engName: "Tayyabs",
        blurb:
          "ホワイトチャペルのパンジャブ料理。焼きたてのラムチョップ目当てに行列ができる。",
        body: `1972年から続くパンジャブ料理の店。**シークカバブとラムチョップ**で知られ、鉄板で音を立てたまま運ばれてきます。

安く、量が多く、常に混雑している大衆的な店です。**酒の持ち込みができる**ため、近くの店でビールを買ってから入る人が多い。

観光地から少し外れますが、地下鉄で行ける範囲です。予約なしだと待つ覚悟を。`,
        area: "ホワイトチャペル",
        nearestStation: "Whitechapel / Aldgate East",
        priceRange: "£15〜25",
        website: "https://tayyabs.co.uk/",
        commonsFile: "File:Tayyabs, Whitechapel, London (3103113765).jpg",
      },
      {
        slug: "brick-lane-curry-houses",
        name: "ブリック・レーンのカレー街",
        engName: "Brick Lane Curry Houses",
        blurb:
          "一本の通りにカレー店が並ぶ。店選びより、通りを歩くこと自体が目的になる場所。",
        body: `イーストエンドのブリック・レーンは、バングラデシュ系の移民が集まり **"Banglatown"** とも呼ばれる通りです。街路標識に英語とベンガル語が併記されているのが目印。

正直に言えば、**一軒一軒の質にはばらつきがあります**。客引きが積極的で、席に着く前に割引を持ちかけられることも珍しくありません。それでも、この通りが持つ歴史——ユグノー、ユダヤ人、そしてバングラデシュ系と、移民の波が層になって残っている——を歩いて感じる価値があります。

日曜はブリック・レーン・マーケットが立つので、市場と合わせて回るのが効率的です。`,
        area: "ブリック・レーン(イーストエンド)",
        nearestStation: "Shoreditch High Street / Aldgate East",
        priceRange: "£12〜25",
        commonsFile: "File:120-122 Brick Lane Preem & Prithi.jpg",
      },
    ],
  },

  {
    slug: "pie-and-mash",
    name: "パイ&マッシュ",
    engName: "Pie and Mash",
    tagline: "減り続けているロンドンの労働者めし。今のうちに食べておく料理。",
    summary:
      "ミンチ肉のパイとマッシュポテトに、緑色のパセリソース。イーストエンドの労働者が食べてきた、消えつつある一皿です。",
    body: `19世紀のロンドンで、テムズ川で獲れたウナギを売る屋台から発展した食べ物です。安く腹を満たせる労働者の食事として、イーストエンドを中心に専門店（"pie and mash shop"）が広がりました。

皿の上には3つ。**ミンチ肉のパイ**、**マッシュポテト**、そして **liquor（リカー）** と呼ばれる緑色のソース。酒ではなく、パセリを効かせたウナギの茹で汁がもとになったソースです。店によっては **jellied eels**（ウナギの煮こごり）も置いていて、これがこの料理の本来の姿に最も近い。

注目すべきは、**この料理が今まさに消えかけている**ことです。かつてロンドンには数百軒のパイ&マッシュ店がありましたが、イーストエンドの再開発と食文化の変化で数十軒にまで減りました。白いタイル張りの壁、木のベンチ、大理石のテーブルという定型の内装ごと、失われつつある空間です。

味は驚くほど素朴で、正直に言えば感動する種類の料理ではありません。それでも**行く理由があるとすれば、それは味ではなく、その店がまだそこにあるということ自体**です。`,
    howTo: `- パイは1個か2個（"one and one" = パイ1つとマッシュ1つ）で頼みます
- **リカーは緑色ですが辛くありません。** パセリの風味の穏やかなソースです
- テーブルの酢（chilli vinegar）をかけるのが伝統的な食べ方
- **ジェリード・イールは相当に人を選びます。** 挑戦するなら少量から
- £8前後と非常に安い。現金のみの店もあります`,
    priceRange: "£6〜12",
    bestTime: "昼(夕方に閉まる店が多い)",
    commonsFile: "File:Pie mash and liquor Manze Bermondsey.jpg",
    restaurants: [
      {
        slug: "m-manze",
        name: "M・マンゼ",
        engName: "M. Manze",
        blurb:
          "現存する最古のパイ&マッシュ店とされる。タワーブリッジから歩ける距離にある。",
        body: `1892年に開いた建物で、1902年からマンゼ家が営むイール&パイ・ハウス。**現存する最古のパイ&マッシュ店**とされています。

タワーブリッジ・ロード沿いにあり、**タワーブリッジやバラ・マーケットから歩ける**のが観光上の利点。白いタイルと木のベンチという、この業態の内装がそのまま残っています。

昼どきを中心に営業し、夕方には閉まります。日曜が休みのことが多いので、営業時間は事前に確認を。`,
        area: "バーモンジー",
        nearestStation: "Borough / London Bridge",
        priceRange: "£6〜12",
        website: "https://www.manze.co.uk/",
        commonsFile:
          "File:M.Manze Bermondsey - 87 Tower Bridge Road London SE1 4TW.jpg",
      },
      {
        slug: "goddards-at-greenwich",
        name: "ゴダーズ",
        engName: "Goddard's at Greenwich",
        blurb:
          "1890年創業。グリニッジ観光のついでに寄れる、数少ないパイ&マッシュ店。",
        body: `1890年から続く一家の店で、現在はグリニッジのチャーチ・ストリートにあります。**グリニッジ天文台やカティサーク、旧王立海軍学校の観光動線上**にあるため、わざわざイーストエンドまで行かなくてもこの料理を体験できます。

パイの中身も選べるようになっており、伝統的なミンチ肉以外の選択肢があるのが現代的。初めての一皿としては入りやすい店です。`,
        area: "グリニッジ",
        nearestStation: "Cutty Sark (DLR)",
        priceRange: "£7〜13",
        website: "https://goddardsatgreenwich.co.uk/",
        commonsFile: "File:Goddard's At Greenwich.jpg",
      },
    ],
  },

  {
    slug: "salt-beef-bagel",
    name: "ソルトビーフ・ベーグル",
    engName: "Salt Beef Bagel",
    tagline: "深夜でも開いている。£6でロンドン最高の一皿だと言う人がいる。",
    summary:
      "塩漬けにして煮た牛肉を、マスタードとピクルスごとベーグルに挟むだけ。ブリック・レーンのユダヤ系の名残です。",
    body: `ブリック・レーン周辺は19世紀末から20世紀にかけて東欧系ユダヤ人が多く住んだ地区で、**ベーグルはその時代の名残**です。バングラデシュ系のカレー店が並ぶ今の通りに、ベーグル店だけが前の層として残っている。移民の街が層をなしている様子が、一本の通りの中で見えます。

作りは単純です。塩漬けにして時間をかけて煮た牛肉（salt beef）を、切ったベーグルに挟み、**イングリッシュ・マスタード**とピクルスを添える。それだけ。肉はほろりと崩れ、マスタードは涙が出るほど強い。

値段が £6〜8 程度と、ロンドンの外食としては破格です。**アフタヌーンティーが £80 する街で、£7 でこれが食べられる**という落差そのものが面白い。

そして特筆すべきは営業時間です。**24時間開いている店がある。** 深夜のロンドンで確実に温かいものが食べられる場所として、地元の人にも観光客にも使われています。`,
    howTo: `- **"salt beef bagel with mustard and pickle"** と頼めば通じます
- マスタードは本当に強い。加減してほしければ "a little mustard" と伝えてください
- 現金のほうが速いことがあります
- 深夜に行くと行列ができていることも。回転は速いです`,
    priceRange: "£6〜10",
    bestTime: "いつでも(24時間営業の店あり)",
    commonsFile: "File:Salt beef bagel.jpg",
    restaurants: [
      {
        slug: "beigel-bake",
        name: "ベーグル・ベイク",
        engName: "Beigel Bake",
        blurb:
          "黄色い看板の24時間営業。ブリック・レーンで最も有名な行列。",
        body: `ブリック・レーンの北端にある、黄色い看板の店。**24時間営業**で、深夜でも人が並んでいます。

店内は狭く、カウンターで頼んで受け取るだけ。ソルトビーフ・ベーグルのほか、スモークサーモンとクリームチーズのベーグルも定番です。

近くにもう一軒ベーグル店があり、地元では長年比較されています。両方買って食べ比べるのが正解かもしれません。`,
        area: "ブリック・レーン",
        nearestStation: "Shoreditch High Street",
        priceRange: "£6〜9",
        commonsFile: "File:Beigel Bake Brick Lane London.jpg",
      },
      {
        slug: "beigel-shop",
        name: "ベーグル・ショップ",
        engName: "Beigel Shop",
        blurb:
          "隣に並ぶもう一軒。青い看板のほう。どちらが上かは長年の論争になっている。",
        body: `同じブリック・レーン沿い、黄色い看板の店のすぐ近くにある青い看板の店。**どちらが本家か、どちらが美味いか**は地元で長く議論されています。

こちらのほうが空いていることが多いので、行列を避けたいときの選択肢にもなります。営業時間は店によって異なるため、深夜に確実に開いている店を探すなら24時間営業のほうへ。`,
        area: "ブリック・レーン",
        nearestStation: "Shoreditch High Street",
        priceRange: "£6〜9",
      },
    ],
  },
];

async function main() {
  let dishOrder = 0;
  let images = 0;
  let missing = 0;

  for (const d of DISHES) {
    dishOrder += 1;

    let dishImage: CommonsImage | null = null;
    if (d.commonsFile) {
      dishImage = await resolveCommonsImage(d.commonsFile);
      if (dishImage) images += 1;
      else {
        missing += 1;
        console.warn(`  画像が見つからない: ${d.commonsFile}`);
      }
    }

    const dishData = {
      name: d.name,
      engName: d.engName,
      tagline: d.tagline,
      summary: d.summary,
      body: d.body,
      howTo: d.howTo ?? null,
      priceRange: d.priceRange ?? null,
      bestTime: d.bestTime ?? null,
      displayOrder: dishOrder,
      ...imageColumns(dishImage),
    };

    const dish = await db.dish.upsert({
      where: { slug: d.slug },
      create: { slug: d.slug, ...dishData },
      update: dishData,
    });

    let restOrder = 0;
    for (const r of d.restaurants) {
      restOrder += 1;

      let restImage: CommonsImage | null = null;
      if (r.commonsFile) {
        restImage = await resolveCommonsImage(r.commonsFile);
        if (restImage) images += 1;
        else {
          missing += 1;
          console.warn(`  画像が見つからない: ${r.commonsFile}`);
        }
      }

      const restData = {
        name: r.name,
        engName: r.engName,
        dishId: dish.id,
        blurb: r.blurb,
        body: r.body ?? null,
        area: r.area,
        nearestStation: r.nearestStation ?? null,
        priceRange: r.priceRange ?? null,
        website: r.website ?? null,
        bookingRequired: r.bookingRequired ?? false,
        displayOrder: restOrder,
        ...imageColumns(restImage),
      };

      await db.restaurant.upsert({
        where: { slug: r.slug },
        create: { slug: r.slug, ...restData },
        update: restData,
      });
    }

    console.log(`✓ ${d.name}（店 ${d.restaurants.length}件）`);
  }

  const total = DISHES.reduce((n, d) => n + d.restaurants.length, 0);
  console.log(
    `\n料理 ${DISHES.length}件 / 店 ${total}件を登録。画像 ${images}枚を解決、${missing}枚は見つからず。`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

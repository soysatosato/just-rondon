import "dotenv/config";
import db from "../utils/db";
import {
  imageColumns,
  resolveCommonsImage,
  type CommonsImage,
} from "./lib/commons";

/**
 * /souvenirs のお土産データを投入する。
 *
 * 画像は Wikimedia Commons の API で実行時に解決する。ファイル名だけを
 * ソースに持ち、URL・作者・ライセンスは毎回 API から取り直す。
 * Commons は同じファイル名のまま中身が差し替わることがあり、
 * 解決済みURLを手で貼るとライセンス表記だけが古いまま残るため。
 *
 * 画像が解決できなかった品はそのまま image = null で登録する。
 * 特集の公開を画像の有無に待たせない方針(schema.prisma の Souvenir 参照)。
 */

type SouvenirSeed = {
  slug: string;
  name: string;
  engName: string;
  category: "tea" | "sweets" | "food" | "beauty" | "goods";
  blurb: string;
  body: string;
  priceRange: string;
  buyAt: string[];
  tips?: string;
  recommendLevel: number;
  /** Commons の "File:..." タイトル。 */
  commonsFile?: string;
};

const SOUVENIRS: SouvenirSeed[] = [
  // ---------- 紅茶 ----------
  {
    slug: "twinings-tea",
    name: "トワイニングの紅茶",
    engName: "Twinings",
    category: "tea",
    blurb:
      "スーパーで数百円。ばらまき土産の最適解でありながら、ストランドの本店に行けば一気に「特別なお土産」になる。",
    body: `イギリス土産で迷ったら、まずここに戻ってくる定番です。日本でも売っていますが、現地のスーパーで買う価格は驚くほど安く、Tesco や Sainsbury's なら 50袋入りが £3 前後。職場や友人へのばらまき用としてこれ以上効率のいい選択肢はそうありません。

ただ「安いから」だけで選ぶと少しもったいない。トワイニングは1706年からストランド216番地の同じ場所で店を開き続けていて、**世界最古の営業中のティーショップ**とされています。間口が異様に狭い（2メートルほどしかない）のに奥に細長く伸びる不思議な店で、奥は小さな博物館になっています。ここでしか買えないブレンドや、店頭で量り売りしてくれる茶葉もあります。

スーパーで買う定番の箱と、本店で買う限定ブレンドを組み合わせると、同じブランドで「ばらまき用」と「特別な一人用」を両方まかなえます。`,
    priceRange: "£3〜15",
    buyAt: ["Tesco", "Sainsbury's", "ヒースロー空港", "トワイニング本店(Strand 216)"],
    tips: "本店は地下鉄 Temple 駅から徒歩3分。入口が本当に狭いので、番地を見ながら歩かないと通り過ぎます。",
    recommendLevel: 5,
    commonsFile:
      "File:Tea canisters in the Twinings Strand Heritage Shop, London, UK - 20120129.jpg",
  },
  {
    slug: "fortnum-and-mason-tea",
    name: "フォートナム&メイソンの紅茶",
    engName: "Fortnum & Mason",
    category: "tea",
    blurb:
      "あの水色の缶。渡した瞬間に「ちゃんとしたお土産」になる、見た目の強さで選ぶ一品。",
    body: `1707年創業、王室御用達。ピカデリーの本店はデパートというより紅茶のテーマパークで、フロアごとに紅茶・ジャム・ビスケット・ハンパー（贈答用バスケット）が並んでいます。

お土産として強いのは、味よりもまず**あの淡いターコイズ（オイスターブルー）の缶**です。箱を開けた瞬間に「イギリスに行ってきた」が伝わるパッケージで、中身が同じ紅茶でも受け取った側の印象がまるで違います。定番は Royal Blend（濃いめでミルクに合う）と Countess Grey（アールグレイより軽くて飲みやすい）あたり。

値段は缶入りで £15〜25 と、スーパーの紅茶とは一桁違います。全員に配るものではなく、**「この人には特別に」という相手を1〜2人決めて買う**のが現実的な使い方です。缶は飲み終わった後も小物入れとして残るので、単価の割に長く記憶に残ります。`,
    priceRange: "£15〜30",
    buyAt: ["ピカデリー本店", "セント・パンクラス駅店", "ヒースロー空港"],
    tips: "本店の紙袋も同じ水色でかなり可愛いので、捨てずに持ち帰るとラッピングに使えます。",
    recommendLevel: 5,
    commonsFile: "File:Fortnum and Mason Christmas countdown 2025-12-15.jpg",
  },
  {
    slug: "whittard-of-chelsea",
    name: "ウィッタード オブ チェルシー",
    engName: "Whittard of Chelsea",
    category: "tea",
    blurb:
      "紅茶より、実はホットチョコレートが本命。フレーバーの種類が多く、紅茶を飲まない相手にも渡せる。",
    body: `1886年創業の紅茶・コーヒー専門店。フォートナム&メイソンほど高くなく、スーパーの紅茶よりは特別感がある、ちょうど中間の価格帯を埋めてくれるブランドです。観光エリアには必ずと言っていいほど店舗があります。

紅茶ももちろん良いのですが、日本人の土産として評判がいいのは**ホットチョコレート**。ルビーチョコレート、ソルテッドキャラメル、ホワイトチョコレートなど味の種類が多く、缶入りで見た目も華やかです。紅茶を飲む習慣がない相手や、子どものいる家庭に渡すときの逃げ道として非常に優秀。

店頭では試飲・試食をさせてくれることが多いので、迷ったら店員に声をかけて味を確かめてから決められます。`,
    priceRange: "£8〜20",
    buyAt: ["コヴェント・ガーデン", "オックスフォード・ストリート", "各主要駅"],
    tips: "「3個買うと割引」のような複数割引をやっていることが多く、まとめ買いのほうが単価が下がります。",
    recommendLevel: 4,
    commonsFile: "File:Whittard Chelsea 1886, Brighton.jpg",
  },

  // ---------- お菓子 ----------
  {
    slug: "walkers-shortbread",
    name: "ウォーカーズのショートブレッド",
    engName: "Walkers Shortbread",
    category: "sweets",
    blurb:
      "赤いタータンチェックの箱。軽くて割れにくく日持ちもする、お土産の条件をすべて満たした優等生。",
    body: `スコットランド生まれのショートブレッド。バターの配合が高く、素朴なのにしっかり濃厚で、紅茶に合わせると分かりやすく美味しい。お土産としての強さは味だけでなく**運びやすさ**にあります。

- 個包装されているので配りやすい
- 賞味期限が長い（数か月単位）
- 缶や厚紙の箱に入っていて割れにくい
- スーパーで £2〜5、空港でも手に入る

大きさもフィンガー型・丸型・三角型と揃っていて、小さな箱をいくつも買えばばらまき用、タータンチェックの缶を1つ買えばそれなりの贈り物になります。

似た商品として Shortbread House of Edinburgh などもあり、そちらのほうが手作り感があって美味しいという人もいます。値段は倍ほどしますが、自分用に1箱試す価値はあります。`,
    priceRange: "£2〜12",
    buyAt: ["Tesco", "Sainsbury's", "M&S", "ヒースロー空港"],
    tips: "スーツケースの中で潰れやすい唯一の弱点は、缶入りを選べば解決します。",
    recommendLevel: 5,
    commonsFile: "File:Walkers Shortbread cookies.jpg",
  },
  {
    slug: "cadbury-dairy-milk",
    name: "キャドバリーのチョコレート",
    engName: "Cadbury Dairy Milk",
    category: "sweets",
    blurb:
      "イギリス人が育った味。日本で売っているものと配合が違うので、現地で買う意味がちゃんとある。",
    body: `イギリスの国民的チョコレート。紫のパッケージはどのスーパーにも必ず置いてあります。

面白いのは、**同じ Dairy Milk でも国によってレシピが違う**こと。イギリス版はミルク分が多く、アメリカ版より柔らかくて甘さが穏やかだと言われます。日本で見かけるものとも味が違うので、「現地で買ってきた」ことに意味が出るタイプのお土産です。

バリエーションが豊富なのも楽しいところで、Caramel、Fruit & Nut、Wholenut、Oreo、Daim など棚一面に並びます。あとイギリス土産として鉄板なのが **Cadbury Roses** や **Heroes** の大きな缶・袋。ひと粒ずつ包装された小さなチョコの詰め合わせで、職場にそのまま置ける手軽さがあります。

夏の持ち帰りだけ注意。溶けます。`,
    priceRange: "£1〜10",
    buyAt: ["Tesco", "Sainsbury's", "Boots", "空港"],
    tips: "イースター前後に出る Creme Egg は季節限定で、この時期だけの土産として話題になります。",
    recommendLevel: 4,
    commonsFile: "File:Cadbury-Dairy-Milk-Caramel-Bar.jpg",
  },
  {
    slug: "tunnocks-teacake",
    name: "タノックスのティーケーキ",
    engName: "Tunnock's Teacake",
    category: "sweets",
    blurb:
      "銀と赤の包み紙が可愛い、スコットランドの定番。安くて軽くて、見た目のインパクトがある。",
    body: `ビスケットの上にマシュマロを乗せ、チョコレートで包んだ小さなお菓子。1956年から包装デザインがほとんど変わっておらず、赤と銀のストライプの包み紙は英国のレトロ雑貨のような佇まいです。

味は素朴で、正直に言えば「ものすごく美味しい」というより「懐かしい」タイプ。ただお土産としては**単価が安く（1個50p程度）、軽く、見た目が可愛い**という三拍子が揃っていて、数を配りたいときに強い。

同じくタノックスの **Caramel Wafer**（赤と金の包み）も定番で、こちらのほうが日本人の口には合いやすいという声が多いです。両方を混ぜて袋詰めにすると、色合いも華やかになります。`,
    priceRange: "£2〜5",
    buyAt: ["Tesco", "Sainsbury's", "Co-op"],
    tips: "包み紙のデザイン目当てで買う人も多いので、食べた後の紙を1枚残しておくと栞になります。",
    recommendLevel: 3,
    commonsFile: "File:Tunnocksteacake.jpg",
  },

  // ---------- 食品 ----------
  {
    slug: "marmite",
    name: "マーマイト",
    engName: "Marmite",
    category: "food",
    blurb:
      "「好きか嫌いか」しかない発酵食品。ネタとして渡すなら最強、味を期待して渡すと危険。",
    body: `ビール酵母から作られる真っ黒なペースト。トーストに**ごく薄く**塗って食べます。塩気と旨味が強烈で、味噌汁とアンチョビを煮詰めたような、と表現されることもあります。

メーカー自身が公式スローガンに *"Love it or hate it"*（好きか嫌いかのどちらかだ）を掲げているくらい、評価が真っ二つに割れる食品です。だからこそお土産としては話題になる。渡すときは必ず「薄く塗って」と伝えてください。日本人が普通のジャムの感覚で塗ると、ほぼ確実に事故になります。

小さい瓶（125g）なら £2〜3 で、荷物にもなりません。ネタ枠として1つ買っておくと、旅行の話をするときの小道具になります。

なお液体・ペースト類なので、**機内持ち込みではなく預け荷物に入れてください**。`,
    priceRange: "£2〜5",
    buyAt: ["Tesco", "Sainsbury's", "Co-op"],
    tips: "苦手な人向けにマイルドな Marmite の派生商品もありますが、話のネタとしては定番のオリジナルが一番です。",
    recommendLevel: 3,
    commonsFile: "File:Marmite Jars.jpg",
  },
  {
    slug: "hp-sauce",
    name: "HPソース",
    engName: "HP Sauce",
    category: "food",
    blurb:
      "イギリスの家庭の味。ラベルに国会議事堂が描かれていて、実はロンドン土産としての説得力が高い。",
    body: `イングリッシュ・ブレックファストに欠かせないブラウンソース。トマトとタマリンド、デーツ、酢と香辛料から作られていて、ウスターソースと中濃ソースの中間のような味です。日本のソースに慣れた舌にはかなり馴染みやすく、マーマイトと違って**渡した相手が普通に使える**のが強み。

ラベルには**ウェストミンスター宮殿（国会議事堂）**が描かれています。HP は "Houses of Parliament" の略で、19世紀末に議会のレストランで使われていたという逸話に由来します。ロンドン土産として渡すときにこの話を添えると、ただの調味料が一気に土産らしくなります。

ソーセージ、ベーコン、卵、フライドポテトに合います。目玉焼きにかけるだけでも雰囲気が出ます。液体なので預け荷物へ。`,
    priceRange: "£2〜4",
    buyAt: ["Tesco", "Sainsbury's", "Asda"],
    tips: "瓶はガラスで重いので、複数買うなら衣類で包んでスーツケースの中央に。",
    recommendLevel: 4,
    commonsFile: "File:HP Original (cropped).jpg",
  },
  {
    slug: "clotted-cream",
    name: "クロテッドクリーム",
    engName: "Clotted Cream",
    category: "food",
    blurb:
      "アフタヌーンティーのあの味を家で。冷蔵が要らない瓶詰めなら持ち帰れる。",
    body: `スコーンに塗るあの濃厚なクリーム。生クリームとバターの中間のような食感で、イギリスのアフタヌーンティー体験の記憶に直結する味です。

生のクロテッドクリームは要冷蔵で持ち帰れませんが、**瓶詰め・缶詰めのタイプ**なら常温で保存でき、日本まで持ち帰れます。Rodda's（コーンウォールの老舗）のものがスーパーやデパートで手に入ります。

一緒に **ストロベリージャム**と**スコーンミックス（粉）**を買えば、自宅でクリームティーを再現できます。これは単体の食品を渡すより喜ばれやすい組み合わせで、「体験を持ち帰る」タイプのお土産になります。

なおクリームが先かジャムが先かは、デヴォン式（クリームが先）とコーンウォール式（ジャムが先）で今も論争が続いています。この話を添えて渡すと確実に盛り上がります。`,
    priceRange: "£3〜8",
    buyAt: ["Waitrose", "M&S", "Fortnum & Mason", "空港"],
    tips: "常温保存できるタイプかどうかはラベルの確認が必須。冷蔵品を買うと持ち帰れません。",
    recommendLevel: 4,
    commonsFile: "File:Clotted cream tin.jpg",
  },

  // ---------- コスメ・香り ----------
  {
    slug: "neals-yard-remedies",
    name: "ニールズヤード レメディーズ",
    engName: "Neal's Yard Remedies",
    category: "beauty",
    blurb:
      "青いガラス瓶がそのまま看板になっているオーガニックコスメ。日本より確実に安く買える。",
    body: `1981年にコヴェント・ガーデンの小さな路地「ニールズ・ヤード」で始まったオーガニックコスメ。あの**濃い青のガラス瓶**は光による成分劣化を防ぐためのもので、見た目のためだけのデザインではありません。

日本にも店舗がありますが、**現地価格は日本の半額近い**ことも珍しくなく、価格差だけでも買う理由になります。定番はフランキンセンスのクリーム、ワイルドローズのビューティバーム、レメディーズ トゥ ロールのアロマオイル。小さなロールオンなら £8 前後で、かさばらず配りやすい。

発祥の地であるニールズ・ヤード自体が、壁も窓枠もカラフルに塗られた写真映えする小さな中庭で、観光地としても寄る価値があります。**買い物と観光を同じ場所で済ませられる**のがこのお土産の隠れた利点です。`,
    priceRange: "£8〜35",
    buyAt: ["ニールズ・ヤード(コヴェント・ガーデン)", "各店舗", "空港"],
    tips: "イギリスは2021年に旅行者向けの付加価値税還付を廃止しています。免税を前提に予算を組まないでください。",
    recommendLevel: 5,
    commonsFile: "File:Neal's Yard Remedies 15 Neal's Yard 2024-05-14.jpg",
  },
  {
    slug: "lush",
    name: "ラッシュ",
    engName: "LUSH",
    category: "beauty",
    blurb:
      "発祥はイギリス。バスボムは軽くて安くて見た目が派手、という土産の理想形。",
    body: `日本でもおなじみですが、**ラッシュはイギリス（ドーセット州プール）発祥**です。オックスフォード・ストリートの旗艦店は複数フロアあり、日本では扱っていない商品や限定品が並びます。

お土産に向くのは断然**バスボム**。ひとつ £4〜6 程度で、軽く、割れにくく、色と形が派手なので開けた瞬間の反応がいい。個包装されていないので紙袋のまま持ち帰ることになりますが、香りが強いので他の荷物と分けてジッパー袋に入れておくのが安全です。

シャンプーバー（固形シャンプー）も液体扱いにならず機内持ち込みできるため、荷物の制約が厳しい人にはこちらが向きます。`,
    priceRange: "£4〜15",
    buyAt: ["オックスフォード・ストリート旗艦店", "各店舗"],
    tips: "香りが非常に強いので、紅茶やお菓子と同じ袋に入れると匂いが移ります。必ず分けてください。",
    recommendLevel: 4,
    commonsFile: "File:Lush Cosmetics - geograph.org.uk - 3204706.jpg",
  },
  {
    slug: "jo-malone-london",
    name: "ジョー マローン ロンドン",
    engName: "Jo Malone London",
    category: "beauty",
    blurb:
      "クリーム色の箱と黒いリボン。予算を上げてでも「外さないもの」を渡したいときの選択肢。",
    body: `1994年ロンドン創業のフレグランス。イングリッシュ・ペアー&フリージア、ライム バジル&マンダリンといった香りが定番で、**重ねづけ（レイヤリング）を前提にした軽い香り**が特徴です。

お土産として優れているのは、ラッピングがブランド側で完成していること。クリーム色の箱に黒いリボンをかけてくれるので、こちらで包み直す必要がありません。**9ml のミニサイズ**なら £30 前後で、フルサイズより現実的です。

香水は好みが分かれるので、相手の好みが分からない場合はボディクリームやハンドソープのほうが安全。空港の免税店にも入っているので、街で買い忘れても最後に回収できます。`,
    priceRange: "£30〜120",
    buyAt: ["リージェント・ストリート", "セルフリッジズ", "ヒースロー空港免税店"],
    tips: "液体なので容量100ml超は機内持ち込み不可。空港の制限エリア内で買えば持ち込めます。",
    recommendLevel: 4,
    commonsFile: "File:Jo Malone London Silver Birch and Lavender Cologne.jpg",
  },
  {
    slug: "penhaligons",
    name: "ペンハリガン",
    engName: "Penhaligon's",
    category: "beauty",
    blurb:
      "1870年創業、王室御用達の老舗。動物の頭をかたどった蓋のシリーズが土産として異様に強い。",
    body: `ヴィクトリア朝のロンドンで理髪店から始まったフレグランスハウス。**リボンを結んだガラス瓶**が伝統的な意匠です。

近年よく知られているのが **Portraits コレクション**で、キツネやシカ、ウサギといった動物の頭部をかたどった金属の蓋が付いています。イギリスの貴族社会を風刺したキャラクター設定が各香りに与えられていて、置いておくだけでオブジェになる。値段は £200 前後と高価ですが、**空になっても捨てられない**タイプの土産です。

もっと現実的な予算なら、コヴェント・ガーデンやバーリントン・アーケードの店舗で買える小さなサンプルセットやソープ。それでも箱のデザインが古典的で、老舗らしい品格があります。`,
    priceRange: "£25〜250",
    buyAt: ["バーリントン・アーケード", "コヴェント・ガーデン", "各店舗"],
    tips: "店舗で香りを試すと、無料でサンプルを何種類か包んでくれることがあります。",
    recommendLevel: 3,
    commonsFile: "File:PENHALIGON'S Eau de Cologne.jpg",
  },

  // ---------- 雑貨 ----------
  {
    slug: "london-underground-goods",
    name: "ロンドン地下鉄のグッズ",
    engName: "London Underground Roundel Goods",
    category: "goods",
    blurb:
      "赤い丸に青い横棒。ロンドンで最も強いアイコンで、Tシャツからマグネットまで何にでも載っている。",
    body: `**ラウンデル**と呼ばれるあの円形のマークは1908年から使われていて、ロンドンという都市そのものを一目で示す記号になっています。お土産として優れているのは、この記号が**説明を必要としない**こと。渡した相手がロンドンを知らなくても、あのマークだけで伝わります。

商品はマグネット、マグカップ、トートバッグ、靴下、Tシャツ、キーホルダーまで無数にあります。安いものは £3〜5 で、数を配りたいときに便利。

質にこだわるなら、コヴェント・ガーデンの**ロンドン交通博物館（London Transport Museum）のショップ**へ。博物館に入らなくてもショップだけ利用でき、歴代の路線図やヴィンテージポスターの複製、moquette（座席の生地）を使ったポーチなど、街の土産物屋には無いものが揃っています。座席の生地シリーズは実際に地下鉄で使われている柄なので、乗った記憶と結びつく良い土産になります。`,
    priceRange: "£3〜40",
    buyAt: ["ロンドン交通博物館ショップ", "土産物店", "各駅"],
    tips: "交通博物館のショップは入場券なしで入れます。ここだけ目当てに寄る価値があります。",
    recommendLevel: 5,
    commonsFile: "File:LondonUnderground roundel on Holborn station exit.jpg",
  },
  {
    slug: "paddington-bear",
    name: "パディントン ベア",
    engName: "Paddington Bear",
    category: "goods",
    blurb:
      "赤い帽子と青いコートのクマ。子どもにも大人にも渡せて、駅に会いに行けるという物語がついてくる。",
    body: `1958年に生まれた、ペルーからロンドンにやってきたクマの物語。映画のヒットで日本での知名度も一気に上がりました。

お土産として良いのは、**買う前に「会いに行ける」**こと。パディントン駅の1番ホーム脇にブロンズ像があり、その隣には専門ショップ（Paddington Bear Shop）があります。写真を撮ってからぬいぐるみを買う、という流れがそのまま土産話になります。レスター・スクエアにも映画のシーンを再現した像があります。

ぬいぐるみは £20〜40 とかさばりますが、キーホルダーやマグカップ、絵本なら軽くて安い。原作の英語の絵本は、英語学習中の子どもへの土産としても収まりがいいです。`,
    priceRange: "£8〜45",
    buyAt: ["パディントン駅のショップ", "ハムリーズ", "土産物店"],
    tips: "ぬいぐるみは体積を食うので、買うなら帰国日に。スーツケースの余白を先に確保しておくと安心です。",
    recommendLevel: 4,
    commonsFile: "File:Paddington Bear Statue @ Paddington Station.jpg",
  },
  {
    slug: "brown-betty-teapot",
    name: "ブラウンベティのティーポット",
    engName: "Brown Betty Teapot",
    category: "goods",
    blurb:
      "茶色くて丸い、何の変哲もないポット。それがイギリスの家庭で一番使われてきた形。",
    body: `17世紀にストーク・オン・トレントで採れる赤い粘土から作られ始めた、丸い茶色のティーポット。装飾も何もありませんが、**イギリスで最も紅茶を美味しく淹れられるポット**と言われ続けてきました。丸い形が茶葉をよく対流させ、厚い陶土が熱を逃がしにくいという理屈です。

フォートナム&メイソンの缶が「贈り物としての紅茶」だとすれば、こちらは「生活としての紅茶」。派手さは皆無ですが、**毎日使われる**タイプの土産です。紅茶を本当に飲む相手に渡すなら、缶よりこちらのほうが刺さることがあります。

重くて割れ物なので持ち帰りは覚悟が要ります。2カップ用の小さいサイズなら £15 前後、衣類でしっかり包めば預け荷物で運べます。`,
    priceRange: "£15〜40",
    buyAt: ["百貨店の食器売場", "キッチン用品店", "アンティークマーケット"],
    tips: "ポートベロー・マーケットなどの蚤の市では中古が数ポンドで見つかることもあります。",
    recommendLevel: 3,
    commonsFile: "File:Brown Betty teapot by Sadler 03.jpg",
  },
];

async function main() {
  let order = 0;
  let resolved = 0;

  for (const s of SOUVENIRS) {
    order += 1;

    let image: CommonsImage | null = null;
    if (s.commonsFile) {
      try {
        image = await resolveCommonsImage(s.commonsFile);
      } catch (err) {
        console.warn(`  画像の解決に失敗: ${s.commonsFile}`, err);
      }
      if (!image) {
        console.warn(`  画像が見つからない: ${s.commonsFile}`);
      } else {
        resolved += 1;
      }
    }

    const data = {
      name: s.name,
      engName: s.engName,
      category: s.category,
      blurb: s.blurb,
      body: s.body,
      priceRange: s.priceRange,
      buyAt: s.buyAt,
      tips: s.tips ?? null,
      recommendLevel: s.recommendLevel,
      displayOrder: order,
      image: image?.url ?? null,
      imageSource: image ? "commons" : null,
      imageCredit: image?.credit ?? null,
      imageLink: image?.link ?? null,
    };

    await db.souvenir.upsert({
      where: { slug: s.slug },
      create: { slug: s.slug, ...data },
      update: data,
    });

    console.log(`✓ ${s.name}${image ? "" : "（画像なし）"}`);
  }

  console.log(
    `\n${SOUVENIRS.length}件を登録。画像を解決できたのは ${resolved}件。`,
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

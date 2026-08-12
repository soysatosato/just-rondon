// 映画・ドラマのロケ地巡り(/sightseeing/film-locations)。
//
// 作品を単位にしているのは、読者が「シャーロックのロケ地を回りたい」から
// 場所を探すため。場所を単位にすると「ここは何の作品?」という逆引きになり、
// 巡礼の動線にならない。
//
// 番地を持たせていないのは Restaurant と同じ理由で、番地の裏取りができないから。
// エリアと最寄り駅、そして公式サイトへのリンクがあれば読者は辿り着ける。
// mapQuery は Google マップの検索語として使う。座標ではなく施設名で引くことで、
// 施設が移転しても壊れない。
//
// 画像は Souvenir と同じ考え方で扱う。「画像が揃うまで公開しない」と
// 1本も出せなくなるので、image は nullable。作品スチルは当然使えないので、
// 場所そのものの写真だけを対象にしている。
//
// imageSource は表示側の分岐に使う。
//   "commons"  — Wikimedia Commons のCC/PD画像。直リンクし、imageCredit を必須表示する。
//   "instagram" — 画像は複製せず instagramUrl を埋め込む(InstagramEmbed)。
//                  この場合 image は使わない。
//   "ai"       — 権利処理済み写真が見つからない場所向けに生成し、Supabase storage
//                (utils/supabase.ts の uploadImage)にアップロードして公開URLを持たせる。
//                実在しない画角に見えないよう、雰囲気カット程度の扱いに留める。
//
// 作品を追加したら next-sitemap.config.js の staticPages にも1行足すこと。
// あちらは CJS で、このファイルを読めない。

export type FilmSpot = {
  /** ページ内アンカー。 */
  slug: string;
  name: string;
  engName: string;
  /** 作品のどの場面で使われたか。カード上部に出す一行。 */
  scene: string;
  /** 解説。markdown。 */
  body: string;
  area: string;
  nearestStation: string;
  /** 中に入れるのか、外から見るだけなのか。巡礼の可否を最初に伝える。 */
  access: string;
  tips?: string;
  website?: string;
  /** Google マップの検索語。 */
  mapQuery: string;
  image?: string;
  /** "commons" | "instagram" | "ai" */
  imageSource?: string;
  /** 出典・ライセンス表記。commons のときは必須。 */
  imageCredit?: string;
  imageLink?: string;
  /** 施設公式アカウントの「投稿」URL。imageSource が instagram のときに使う。 */
  instagramUrl?: string;
};

export type FilmWork = {
  slug: string;
  /** 日本語の作品名。 */
  title: string;
  engTitle: string;
  /** カードの eyebrow に使う英語ラベル。 */
  eyebrow: string;
  years: string;
  /** カード用の一言。 */
  summary: string;
  /** 一覧カードに出す、巡礼のしやすさ。 */
  routeHint: string;
  /** 記事冒頭のリード。markdown。段落ごとに配列で持つ。 */
  lead: string[];
  spots: FilmSpot[];
  /** 巡礼前に知っておくべき注意。 */
  note?: string;
  keywords: string[];
};

export const filmWorks: FilmWork[] = [
  {
    slug: "sherlock",
    title: "SHERLOCK(シャーロック)",
    engTitle: "Sherlock",
    eyebrow: "BBC Drama",
    years: "2010–2017",
    summary:
      "221Bはベーカー街にない。ユーストン裏の一本道から、飛び降りた病院の屋上、壁だけの偽の家まで、市内で完結する巡礼コース。",
    routeHint: "ロンドン市内で完結・半日",
    lead: [
      "BBC版『SHERLOCK』のロンドンは、観光ガイドに載る顔とは少しずれたところに広がっています。ベーカー街ではなくユーストンの裏通り、大英博物館ではなく創建1123年の病院、そして「家の形をしているのに家ではない建物」。ドラマの美術チームが選んだのは、どれも実在の理由を持った場所ばかりです。",
      "しかもそのほとんどが地下鉄で回れる範囲に収まっています。ここでは主要なロケ地を、なぜそこが選ばれたのかという背景と一緒に紹介します。",
    ],
    note: "セント・バーソロミュー病院は現役の総合病院です。撮影ゆかりの場所ではありますが、患者と職員が日常的に使う医療施設なので、写真を撮る際は入口や通路をふさがないよう配慮してください。",
    keywords: [
      "シャーロック ロケ地",
      "SHERLOCK ロケ地",
      "BBC シャーロック",
      "221B ベーカー街",
      "ノースガワーストリート",
      "スピーディーズ",
      "セントバーソロミュー病院",
    ],
    spots: [
      {
        slug: "north-gower-street",
        name: "ノース・ガワー・ストリート 187番地",
        engName: "187 North Gower Street",
        scene: "221Bベーカー街の外観 / シリーズ全編",
        body: `ドラマの221Bベーカー街は、**ベーカー街では撮影されていません**。実際に使われたのは、ユーストン駅の西側にあるノース・ガワー・ストリートの187番地です。

理由は単純で、本物のベーカー街は交通量が多いうえに観光客が絶えず、長時間の路上撮影に耐えないから。一方このノース・ガワー・ストリートは、19世紀のテラスハウスが連なる見た目でありながら、比較的静かで通行を止めやすい。制作陣が街並みの「ベーカー街らしさ」だけを抜き出して移植した、という格好です。

撮影のために通りに加えられた変更は、驚くほど小さなものでした。187番地の玄関扉を、同じような黒い扉に「221b」の番号を付けたものへ丸ごと交換しただけ。撮影が終われば元の扉に戻されるため、普段この番地を訪ねても221bの表示はありません。

真下にあるサンドイッチ店 **Speedy's Sandwich Bar & Café** は、劇中でもそのままの名前と外観で登場します。シリーズ2では店内でも撮影が行われました。ここは今も普通に営業している実在の店で、客として入って食事ができます。ただし上の階は本物の集合住宅なので、「221Bの部屋」を見学することはできません。`,
        area: "ブルームズベリー / ユーストン",
        nearestStation: "Euston Square 駅、Warren Street 駅(いずれも徒歩数分)",
        access:
          "通りは公道なので自由に歩けます。Speedy's は営業中のカフェで、客として利用可能。建物の上階は私有の住居で立ち入れません。",
        tips: "住人が実際に暮らす通りです。玄関先での長時間の撮影や、窓へのカメラ向けは控えてください。",
        mapQuery: "Speedy's Sandwich Bar & Cafe London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/c/c8/North_Gower_Street%2C_Euston_-_geograph.org.uk_-_548871.jpg",
        imageSource: "commons",
        imageCredit: "Stephen McKay (CC BY-SA 2.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:North_Gower_Street,_Euston_-_geograph.org.uk_-_548871.jpg",
      },
      {
        slug: "st-barts-hospital",
        name: "セント・バーソロミュー病院(セント・バーツ)",
        engName: "St Bartholomew's Hospital",
        scene: "「ライヘンバッハ・フォール」の飛び降り / モリー・フーパーの職場",
        body: `シリーズ2最終話、シャーロックが屋上から身を投げるあの病院です。ファンにとっては聖地であり、実際に事件後しばらく、壁には「I believe in Sherlock Holmes」と書かれた付箋やメッセージが貼り続けられていました。

この病院が選ばれたのは偶然ではありません。**1123年創建、イギリスで現存する最古級の病院**であり、現在の場所で900年間ずっと医療を続けてきた稀有な施設です。ジェームズ・ギブスが18世紀に設計した中庭の建物群は、そのまま19世紀のロンドンとしても20世紀としても撮れる強度を持っています。

そして何より、原作との符合があります。コナン・ドイルの『緋色の研究』で、ホームズとワトスンが初めて引き合わされるのが、まさにこのセント・バーツの化学実験室でした。ドラマ第1話でも二人はここで出会います。飛び降りの舞台にこの病院を選んだのは、二人の物語が始まった場所で一度終わらせる、という筋の通し方だったわけです。

敷地内には **セント・バーソロミュー病院博物館** があり、900年分の医療史の展示と、ホガースが手がけた大階段の壁画を見ることができます。`,
        area: "シティ・オブ・ロンドン(ウェスト・スミスフィールド)",
        nearestStation: "St Paul's 駅、Barbican 駅、Farringdon 駅",
        access:
          "敷地と中庭は通り抜け可能。併設の病院博物館は入場無料ですが、開館日が週数日に限られるため事前に公式サイトで確認を。",
        tips: "隣接するスミスフィールド市場は800年以上続くロンドンの食肉市場。早朝以外は静かですが、建物自体が一見の価値ありです。",
        website: "https://www.bartshealth.nhs.uk/barts-hospital-museum",
        mapQuery: "St Bartholomew's Hospital London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/2/2e/Atrium_of_Barts%2C_St_Bartholomew%27s_Hospital%2C_City_of_London%2C_England.jpg",
        imageSource: "commons",
        imageCredit: "Acabashi (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Atrium_of_Barts,_St_Bartholomew's_Hospital,_City_of_London,_England.jpg",
      },
      {
        slug: "leinster-gardens",
        name: "レンスター・ガーデンズの「偽の家」",
        engName: "23–24 Leinster Gardens",
        scene: "シリーズ3「最後の誓い」",
        body: `シャーロックがメアリーと対峙する、あの家です。ドラマの小道具ではなく、**150年以上前から実在するロンドンの名物建築**で、正面の壁しかありません。

事情は地下鉄の歴史に直結しています。1860年代、世界初の地下鉄であるメトロポリタン線を延伸する工事が、このテラスハウスの列を真っ二つに切り裂きました。当時の地下鉄は蒸気機関車で走っていたため、煙と蒸気を逃がす開削区間がどうしても必要だったのです。

ところが2軒分を取り壊すと、優雅なジョージ王朝様式の街並みに歯抜けができてしまう。そこで1868年、**壁だけの「家」**が建てられました。約1.5メートルの厚さしかない張りぼてで、背後には線路がむき出しで走っています。景観を保つと同時に、蒸気を吐く汽車を通行人の目から隠す衝立の役割も果たしていました。

一度知ってしまうと現地では簡単に見分けられます。23番地と24番地だけ、**窓がすべて灰色に塗りつぶされていて、玄関に郵便受けも呼び鈴もありません**。手前の通りに立って左右の家と見比べると、その不自然さがはっきり分かります。`,
        area: "ベイズウォーター",
        nearestStation: "Bayswater 駅、Queensway 駅",
        access: "公道から外観を眺めるだけの場所です。中に入ることはできません(そもそも中がありません)。",
        tips: "裏側は Porchester Terrace 側から見られます。線路の上に壁が立っているだけ、という構造が確認できます。",
        mapQuery: "23-24 Leinster Gardens London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/7/7e/23-24_Leinster_Gardens%2C_the_%22fake_house%22_-_geograph.org.uk_-_49276.jpg",
        imageSource: "commons",
        imageCredit: "Hywel Williams (CC BY-SA 2.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:23-24_Leinster_Gardens,_the_%22fake_house%22_-_geograph.org.uk_-_49276.jpg",
      },
      {
        slug: "the-langham",
        name: "ザ・ラングハム",
        engName: "The Langham",
        scene: "シリーズ2「ベルグレービアの醜聞」ほか",
        body: `リージェント・ストリートの北端に立つ、1865年開業のグランドホテル。ドラマでは高級ホテルの場面で登場します。

このホテルがシャーロックと結びつくのは、実は撮影よりもずっと前からです。1889年8月、ここで開かれた出版社の晩餐会に、当時まだ無名に近かったコナン・ドイルと、すでに評判を得ていたオスカー・ワイルドが同席しました。この席でドイルが受けた執筆依頼から生まれたのが、ホームズ第2作の『**四つの署名**』です。ワイルドの『ドリアン・グレイの肖像』も同じ晩餐会がきっかけでした。

さらにドイルは、そのラングハム自体を作品の舞台に繰り返し使っています。『ボヘミアの醜聞』でボヘミア王が滞在するのも、『四つの署名』でモースタン大尉が失踪前に泊まるのも、このホテルです。**原作にもドラマにも登場する数少ない実在の建物**ということになります。`,
        area: "メリルボーン / リージェント・ストリート北端",
        nearestStation: "Oxford Circus 駅",
        access:
          "営業中の高級ホテルです。外観は自由に見られます。中を見たい場合はアフタヌーンティーやバーの利用が現実的で、いずれも要予約・ドレスコードあり。",
        tips: "向かいはBBCの本拠地であるブロードキャスティング・ハウス。BBC制作のドラマがこのホテルを使った理由の一端が分かります。",
        website: "https://www.langhamhotels.com/en/the-langham/london/",
        mapQuery: "The Langham London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/d/df/Langham_london.jpg",
        imageSource: "commons",
        imageCredit: "The Langham, London (CC BY-SA 3.0)",
        imageLink: "https://commons.wikimedia.org/wiki/File:Langham_london.jpg",
      },
      {
        slug: "southbank-undercroft",
        name: "サウスバンク・アンダークロフト(スケートパーク)",
        engName: "Southbank Undercroft",
        scene: "シリーズ1「死を呼ぶ暗号」の落書き",
        body: `シャーロックとジョンが謎の記号を追う場面で登場する、コンクリートむき出しのスケートスポット。ハンガーフォード橋とウォータールー橋のあいだ、クイーンズ・ウォークに面したサウスバンク・センターの床下です。

ここは1970年代初頭から、誰かに与えられたわけでもなく**スケーターが自然に住み着いて生まれた場所**で、世界最古級のスケートスポットとして知られています。壁のグラフィティは常に描き替えられるため、訪れるたびに見え方が変わります。

2013年、この区画を商業施設に転用する再開発案が持ち上がった際、スケーターらが「Long Live Southbank」を結成して大規模な反対運動を展開しました。15万筆近い署名が集まり、2014年に開発計画は撤回。文化的価値のある空間として保存が決まっています。ドラマが撮影された当時、この場所はまさに存続をかけて争われている最中でした。`,
        area: "サウスバンク",
        nearestStation: "Waterloo 駅、Embankment 駅",
        access: "屋外の公共空間で、24時間自由に見学できます。入場無料。",
        tips: "滑っている人の進路に立たないこと。撮影は歓迎されますが、レール沿いの動線は空けておくのがマナーです。",
        mapQuery: "Southbank Undercroft Skate Space London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/5/5a/South_Bank_Skate_Park_-_geograph.org.uk_-_3843135.jpg",
        imageSource: "commons",
        imageCredit: "Chris Whippet (CC BY-SA 2.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:South_Bank_Skate_Park_-_geograph.org.uk_-_3843135.jpg",
      },
      {
        slug: "baker-street",
        name: "ベーカー街と シャーロック・ホームズ博物館",
        engName: "Baker Street & The Sherlock Holmes Museum",
        scene: "ドラマのロケ地ではないが、原作の聖地",
        body: `ドラマの撮影には使われていませんが、巡礼の締めくくりとして触れておく価値があります。

まず面白いのは、**コナン・ドイルが「221B」と書いた時点で、そんな番地は存在しなかった**ということです。当時のベーカー街は番号が100番台までしかなく、221という数字は実在しない安全な架空の番地として選ばれました。ベーカー街が北へ延長されて200番台が生まれたのは1930年代のことです。

すると今度は「221B宛のファンレター」が実在の建物に届き始めます。その番地を含む区画にあったアビー・ナショナル(住宅金融組合)は、世界中から届くホームズ宛の手紙に返信するため、**専任の秘書を雇っていました**。

現在のシャーロック・ホームズ博物館は、実際には239番地に建っていますが、特例として「221B」の表示を掲げることが認められています。館内はヴィクトリア朝の下宿として再現されており、行列ができることも珍しくありません。

ベーカー街駅の構内も見どころです。ホームの壁一面に、ホームズの横顔のシルエットをあしらったタイルが貼られています。駅の外にはホームズの銅像も立っています。`,
        area: "メリルボーン",
        nearestStation: "Baker Street 駅",
        access: "博物館は有料・年中無休(公式サイト参照)。駅構内のタイルと屋外の銅像は無料で見られます。",
        tips: "駅そのものが1863年開業の世界最古の地下鉄駅のひとつ。メトロポリタン線のホームは開業当時の姿を色濃く残しています。",
        website: "https://www.sherlock-holmes.co.uk/",
        mapQuery: "Sherlock Holmes Museum Baker Street London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/3/33/221B_Baker_Street%2C_London_-_Sherlock_Holmes_Museum.jpg",
        imageSource: "commons",
        imageCredit: "Jordan 1972 (Public Domain)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:221B_Baker_Street,_London_-_Sherlock_Holmes_Museum.jpg",
      },
    ],
  },
  {
    slug: "bridgerton",
    title: "ブリジャートン家",
    engTitle: "Bridgerton",
    eyebrow: "Netflix Series",
    years: "2020–",
    summary:
      "ブリジャートン家の屋敷はグリニッジ、王妃の宮殿は政府の迎賓館。「摂政時代のロンドン」は市内各所の建物を継ぎ合わせて作られている。",
    routeHint: "グリニッジ + 市内 / 1日",
    lead: [
      "『ブリジャートン家』が描くのは1810年代の摂政時代ロンドンですが、当時の街並みがそのまま残っている場所はほとんどありません。制作陣が採ったのは、**ロンドンとその周辺に散らばる建物を一軒ずつ選び、継ぎ合わせて架空の街を組み立てる**という手法でした。",
      "そのため「ブリジャートン家の外観」と「その室内」は別の建物ですし、王妃の宮殿にいたっては外観と内装がまったく違う場所にあります。ここでは実際に訪ねられるロケ地を、劇中のどの部分に化けたのかと一緒に整理します。",
    ],
    note: "ランカスター・ハウスは英国政府の迎賓施設で、通常は一般公開されていません。訪問を旅程に組み込む場合は、毎年9月のオープン・ハウス・フェスティバルなど、限られた公開機会を事前に調べる必要があります。",
    keywords: [
      "ブリジャートン ロケ地",
      "Bridgerton ロケ地",
      "レンジャーズハウス",
      "ランカスターハウス",
      "サイオンハウス",
      "グリニッジ 観光",
      "ネットフリックス ロケ地",
    ],
    spots: [
      {
        slug: "rangers-house",
        name: "レンジャーズ・ハウス",
        engName: "Ranger's House",
        scene: "ブリジャートン家の外観",
        body: `シリーズを象徴する、あの赤レンガの屋敷です。グリニッジ・パークの西端に立つ18世紀初頭のジョージ王朝様式の邸宅で、イングリッシュ・ヘリテッジが管理しています。

「ブリジャートン家」として使われているのは**外観だけ**です。玄関前の階段でキャラクターたちが行き交う場面はここで撮られていますが、一歩入った屋内は別のスタジオセットに切り替わります。ドラマの家の内側を探しに行っても見つからない、というのはロケ地巡りでよくある落とし穴です。

建物自体の見どころは、館内のヴェルナー・コレクション。ダイヤモンド王として財を成したユリウス・ヴェルナーが集めた約700点の個人コレクションで、ルネサンス期の宝飾品、マヨリカ焼、中世の象牙細工などが、当時の邸宅の雰囲気のまま並べられています。

正面に立つと、劇中でブリジャートン家の玄関前を彩っていた**藤の花が実物ではない**ことにも気づきます。あれは撮影用に取り付けられた造花で、季節を問わず同じ画を撮るための工夫でした。`,
        area: "グリニッジ / ブラックヒース",
        nearestStation: "Cutty Sark(DLR)から徒歩約20分、Blackheath 駅から徒歩約10分",
        access:
          "イングリッシュ・ヘリテッジの有料施設。開館は季節によって週数日に限られるため、必ず公式サイトで開館日を確認してください。外観は公園側からいつでも見られます。",
        tips: "グリニッジ・パークの丘を登れば旧王立天文台と本初子午線。同じ日にまとめて回れます。",
        website: "https://www.english-heritage.org.uk/visit/places/rangers-house-the-wernher-collection/",
        mapQuery: "Ranger's House Greenwich London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/0/09/EH1218679_The_Ranger%27s_House.JPG",
        imageSource: "commons",
        imageCredit: "Katie Chan (CC BY-SA 3.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:EH1218679_The_Ranger's_House.JPG",
      },
      {
        slug: "lancaster-house",
        name: "ランカスター・ハウス",
        engName: "Lancaster House",
        scene: "シャーロット王妃の宮殿の内部",
        body: `王妃が社交界の令嬢たちを謁見する、あの豪奢な広間です。バッキンガム宮殿から歩いてすぐの場所にありますが、宮殿そのものではありません。

1825年、のちのヨーク公フレデリックのために着工された邸宅で、金箔と大理石に覆われた大階段を持つ新古典主義建築です。19世紀には**バッキンガム宮殿よりも豪華だと言われた**ほどで、ヴィクトリア女王が当時の所有者を訪ねた際に「あなたの宮殿から私の家へ帰ります」と述べたという逸話が残っています。

現在は英国政府が国際会議や外交儀礼のために使う施設です。オバマ大統領の国賓訪問、コモンウェルス首脳会議、ブレグジット方針を示した「ランカスター・ハウス演説」など、現代史の舞台としても繰り返し登場します。

映像作品にとっては、**宮殿の内部を撮りたいときの定番の代役**でもあります。『ザ・クラウン』のバッキンガム宮殿、そして後述する『ダウントン・アビー』の王室の場面も、同じこの建物で撮られています。`,
        area: "セント・ジェームズ",
        nearestStation: "Green Park 駅",
        access:
          "政府の迎賓施設のため通常は非公開です。毎年9月のオープン・ハウス・フェスティバルなど、限られた機会にのみ一般公開されることがあります。外観は Stable Yard 側の道路から見られます。",
        tips: "隣はセント・ジェームズ宮殿、目の前はグリーン・パーク。王室関連の建物が集中する一角です。",
        mapQuery: "Lancaster House St James's London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/c/c3/Lancaster_House_London.jpg",
        imageSource: "commons",
        imageCredit: "Ricardalovesmonuments (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Lancaster_House_London.jpg",
      },
      {
        slug: "hampton-court-palace",
        name: "ハンプトン・コート宮殿",
        engName: "Hampton Court Palace",
        scene: "シャーロット王妃の宮殿の外観",
        body: `ランカスター・ハウスが王妃の宮殿の「中身」なら、こちらは「外側」です。馬車が乗りつける正面や庭園の場面で使われています。

16世紀にウルジー枢機卿が建て、ヘンリー8世が取り上げて拡張した宮殿。**チューダー朝の赤レンガ部分と、クリストファー・レンが17世紀末に増築したバロック様式の部分が、一つの建物の中で正面からぶつかり合っている**という珍しい構造をしています。庭を挟んで両側に立つと、まるで別の宮殿を見ているようです。

見どころは、ヘンリー8世の大広間、天井から吊るされた調理器具がそのまま残るチューダー朝の厨房、そして1690年代に植えられた世界最大級のブドウの木。敷地内の生垣迷路は1700年頃に作られ、現存する英国最古のものです。

摂政時代を描いたドラマがチューダー朝の宮殿を使っている、というのは時代考証としては大胆ですが、映像作品では珍しくない選択です。`,
        area: "リッチモンド・アポン・テムズ(ロンドン南西部)",
        nearestStation: "Hampton Court 駅(Waterloo から約35分)",
        access: "有料の一般公開施設。年間を通じて開いています。庭園のみのチケットもあります。",
        tips: "中心部からは離れますが、テムズ川沿いを走る電車が快適です。半日は見ておきたい規模。",
        website: "https://www.hrp.org.uk/hampton-court-palace/",
        mapQuery: "Hampton Court Palace",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/1/14/Hampton_Court_Palace_20120224.JPG",
        imageSource: "commons",
        imageCredit: "James Park-Watt (CC BY-SA 3.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Hampton_Court_Palace_20120224.JPG",
      },
      {
        slug: "syon-house",
        name: "サイオン・ハウス グレート・コンサバトリー",
        engName: "Syon House & The Great Conservatory",
        scene: "シリーズ2 レディ・ダンベリーの舞踏会",
        body: `西ロンドンに残る、ノーサンバランド公爵家のロンドン邸宅。**首都に残る唯一の公爵家の大邸宅**とされています。

もとは1547年に修道院跡地に建てられた館ですが、現在の姿を決定づけたのは18世紀です。1760年代、第1代ノーサンバランド公爵が建築家ロバート・アダムに内装を任せ、新古典主義の室内装飾の代表作と呼ばれる一連の部屋が生まれました。外観の質素な四角い箱と、中に入った瞬間の色彩の豊かさの落差が、この館の見どころです。

ドラマで舞踏会の会場になった**グレート・コンサバトリー**は、館ではなく庭にある巨大な温室です。1820年代にチャールズ・ファウラーが設計したもので、鉄とガラスで大空間を覆う建築としては先駆的な存在でした。後の万国博覧会の水晶宮に影響を与えたとも言われます。ガラス張りのドームの下で行われる舞踏会という絵は、この建物なしには成立しませんでした。`,
        area: "ブレントフォード(ロンドン西部)",
        nearestStation: "Syon Lane 駅、または Gunnersbury 駅からバス",
        access:
          "有料の一般公開施設。館と庭園で公開期間が異なり、館は春から秋の週数日に限られます。事前に公式サイトで確認を。",
        tips: "隣接するロンドン・ミュージアム・オブ・ウォーターアンドスチームなど、この一帯は産業遺産が集まっています。",
        website: "https://www.syonpark.co.uk/",
        mapQuery: "Syon House Brentford London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/4/4a/Syon_House_-_the_Great_Conservatory.JPG",
        imageSource: "commons",
        imageCredit: "John Chapman (CC BY-SA 3.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Syon_House_-_the_Great_Conservatory.JPG",
      },
      {
        slug: "old-royal-naval-college",
        name: "旧王立海軍学校とペインテッド・ホール",
        engName: "Old Royal Naval College & The Painted Hall",
        scene: "摂政時代のロンドンの街路 / 式典の場面",
        body: `グリニッジの川沿いに広がる、左右対称の壮大な建物群。世界遺産「海事都市グリニッジ」の中核で、ドラマでは石畳の街路や馬車の走る場面として繰り返し登場します。

もとは1690年代に**傷病兵となった水兵のための施設**として、クリストファー・レンの設計で建てられました。当初は宮殿にする計画もありましたが、そこから川の眺めが遮られることを嫌ったメアリー2世の意向で、建物を二つに割って中央に視線の通り道を残す配置になりました。この「真ん中が空いている」という不自然な設計が、結果として映像に映えるあの広い石畳の空間を生んでいます。

必見は**ペインテッド・ホール**です。画家ジェームズ・ソーンヒルが1707年から約19年をかけて天井と壁を埋め尽くした空間で、「イギリスのシスティーナ礼拝堂」と呼ばれます。もともとは食堂として設計されましたが、あまりに豪華すぎて水兵たちの日常の食事には使われなくなった、という経緯があります。`,
        area: "グリニッジ",
        nearestStation: "Cutty Sark(DLR)徒歩約5分",
        access:
          "敷地と芝生は無料で通り抜けできます。ペインテッド・ホールは有料(チケットは1年間有効)。",
        tips: "テムズ川のリバーボートで中心部から向かうと、船から見上げる正面の構図がそのまま劇中の画になります。",
        website: "https://ornc.org/",
        mapQuery: "Old Royal Naval College Greenwich",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/3/39/Painted_Hall_at_Royal_Naval_College_in_Greenwich%2C_London%2C_England%2C_UK.jpg",
        imageSource: "commons",
        imageCredit: "Shawn M. Kent (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Painted_Hall_at_Royal_Naval_College_in_Greenwich,_London,_England,_UK.jpg",
      },
      {
        slug: "queens-house",
        name: "クイーンズ・ハウス",
        engName: "Queen's House",
        scene: "屋内の階段・広間の場面",
        body: `旧王立海軍学校の二棟のあいだ、視線の通り道の突き当たりに立つ白い建物です。1616年にイニゴー・ジョーンズが設計した、**イギリス初の本格的な古典主義建築**として建築史に必ず登場します。

当時のイギリスは、まだ木組みと切妻屋根の建物が当たり前でした。そこにイタリアのパッラーディオ様式を持ち込んだこの真っ白な直方体は、同時代の人々の目にはほとんど宇宙船のように映ったはずです。以後300年の英国建築の方向を決めた一棟と言っていい存在です。

内部で目を引くのが**チューリップ階段**。中心に支柱を持たない自立式の螺旋階段としてはイギリス初のもので、下から見上げた渦巻きの構図は写真によく使われます。

館内は国立海洋博物館の一部として運営される美術館で、海洋画のコレクションを収蔵しています。**入場は無料**です。`,
        area: "グリニッジ",
        nearestStation: "Cutty Sark(DLR)徒歩約8分",
        access: "入場無料。特別展のみ有料の場合があります。",
        tips: "旧王立海軍学校、国立海洋博物館、旧王立天文台と徒歩圏内にまとまっています。",
        website: "https://www.rmg.co.uk/queens-house",
        mapQuery: "Queen's House Greenwich London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/0/0c/Greenwich_Queens_House_from_north.jpg",
        imageSource: "commons",
        imageCredit: "Michael Coppins (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Greenwich_Queens_House_from_north.jpg",
      },
      {
        slug: "hackney-empire",
        name: "ハックニー・エンパイア",
        engName: "Hackney Empire",
        scene: "劇場・オペラハウスの場面",
        body: `東ロンドンに残るエドワード朝の劇場。1901年、当時ミュージックホール建築を量産していた建築家フランク・マッチャムの設計で開場しました。

ミュージックホールとは、19世紀の労働者階級の娯楽として発展した大衆演芸場のことです。チャップリンやスタン・ローレルが初期に立った舞台でもあり、**イギリスの大衆芸能がここから映画へ流れ出していった**現場と言えます。

戦後はテレビ局のスタジオ、その後ビンゴホールへと転用され、取り壊し寸前まで追い込まれた時期もありました。1980年代に市民運動によって劇場として再生され、現在も現役で公演を行っています。ドラマでは、その豪奢な内装が摂政時代の劇場として使われました。`,
        area: "ハックニー(ロンドン東部)",
        nearestStation: "Hackney Central 駅、Hackney Downs 駅",
        access: "現役の劇場です。内部を見るには公演チケットを購入するのが確実。外観はいつでも見られます。",
        tips: "周辺はロンドンでも独特の空気を持つエリア。ブロードウェイ・マーケット(土曜)と組み合わせると回りやすいです。",
        website: "https://hackneyempire.co.uk/",
        mapQuery: "Hackney Empire London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/2/23/Hackney_empire_1.jpg",
        imageSource: "commons",
        imageCredit: "Tarquin Binary(Public Domain)",
        imageLink: "https://commons.wikimedia.org/wiki/File:Hackney_empire_1.jpg",
      },
    ],
  },
  {
    slug: "downton-abbey",
    title: "ダウントン・アビー",
    engTitle: "Downton Abbey",
    eyebrow: "ITV Drama & Films",
    years: "2010–2015 / 劇場版",
    summary:
      "本邸はハンプシャー、村はコッツウォルズ。ただし王室の場面と一家のロンドン邸宅は市内で撮られている。日帰りと市内散策の組み合わせで巡る。",
    routeHint: "ロンドン発の日帰り + 市内",
    lead: [
      "『ダウントン・アビー』のロケ地巡りは、他の2作品とは事情が違います。物語の中心である屋敷も村もロンドンにはなく、**ロンドンを起点にした日帰り旅行**として組み立てる必要があるためです。",
      "一方で、劇中でクローリー家が「ロンドンへ行く」場面に使われた建物は、当然ながら実際にロンドンにあります。ここでは日帰りで行く郊外のロケ地と、市内で歩いて回れるロケ地を分けて紹介します。",
    ],
    note: "ハイクレア城の公開日は年間60〜70日程度に限られ、事前予約制です。人気の日程は数か月前に売り切れます。ここを目当てにするなら、旅程の中でも最初に押さえるべき予約です。",
    keywords: [
      "ダウントンアビー ロケ地",
      "Downton Abbey ロケ地",
      "ハイクレア城",
      "バンプトン村",
      "ロンドン 日帰り",
      "イギリス 貴族 屋敷",
    ],
    spots: [
      {
        slug: "highclere-castle",
        name: "ハイクレア城",
        engName: "Highclere Castle",
        scene: "ダウントン・アビー(グランサム伯爵家の本邸)",
        body: `シリーズと劇場版を通じて、屋敷の外観と主要な部屋の撮影に使われた本物のカントリーハウスです。ハンプシャー州、ロンドンの西約110キロに位置し、現在もカーナヴォン伯爵家が実際に暮らしています。

現在の姿になったのは1840年代。国会議事堂を設計したチャールズ・バリーが手がけたもので、外観のシルエットが議事堂とどこか似ているのはそのためです。

この城には、ドラマとは別の有名な物語があります。**第5代カーナヴォン伯爵は、ツタンカーメン王墓の発掘に資金を出した人物**でした。1922年、考古学者ハワード・カーターとともに「王家の谷」で無傷の王墓を発見し、20世紀最大の考古学的発見として世界を沸かせます。しかし伯爵はその翌年、カイロで蚊に刺された傷から敗血症を起こして急死しました。ここから「ツタンカーメンの呪い」という伝説が生まれています。

その縁で、城の地下には**エジプト展示室**が設けられており、発掘当時の記録や副葬品の複製が公開されています。ダウントンを見に来て、思いがけず考古学史に足を踏み入れることになる場所です。`,
        area: "ハンプシャー州ニューベリー近郊(ロンドンから約110km)",
        nearestStation:
          "Paddington 駅から Newbury 駅まで約1時間、そこからタクシーで約20分",
        access:
          "年間60〜70日程度の限定公開。事前予約制で、人気の日程は早期に売り切れます。城・庭園・エジプト展示室で券種が分かれています。",
        tips: "公開日は夏季に集中します。日程が合わない場合は、庭園のみ公開の日やイベント日を狙う手もあります。",
        website: "https://www.highclerecastle.co.uk/",
        mapQuery: "Highclere Castle Newbury",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/5/55/Highclere_Castle_%28April_2011%29.jpg",
        imageSource: "commons",
        imageCredit: "Richard Munckton (CC BY 2.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Highclere_Castle_(April_2011).jpg",
      },
      {
        slug: "bampton",
        name: "バンプトン村",
        engName: "Bampton, Oxfordshire",
        scene: "ダウントン村",
        body: `蜂蜜色の石造りの家が並ぶ、オックスフォードシャー西部のコッツウォルズの村。劇中で村人たちが暮らす「ダウントン村」は、ほぼこの村そのままです。

主な対応関係は次の通りです。

- **セント・メアリー教会** — 劇中の「聖ミカエル・諸天使教会」。マシューとメアリーの結婚式など、節目の場面はここで撮影されました。
- **旧バンプトン図書館(チャーチゲート・ハウス脇)** — ダウントンのコテージ病院の外観。
- **チャーチゲート・ハウス** — イソベル・クローリーの家。

村がロケ地に選ばれたのは、**電線や現代的な看板が少なく、エドワード朝の画面を作るために消すものが少なかった**からだと言われます。実際に歩いてみると、通りの幅も建物の高さも100年前からほとんど変わっていないことが分かります。

観光地化された村ではないので、住民の生活の場であることを忘れずに歩きたい場所です。`,
        area: "オックスフォードシャー州(ロンドンから約120km)",
        nearestStation:
          "Paddington 駅から Oxford 駅まで約1時間、そこからバスまたはタクシーで約40分",
        access:
          "村は自由に歩けます。教会は通常開いていますが、礼拝中は見学を控えてください。公共交通の本数が少ないため、レンタカーかツアー利用が現実的です。",
        tips: "同じコッツウォルズのバーフォードやバイブリーと組み合わせると、1日で回る価値のある行程になります。",
        mapQuery: "Bampton Oxfordshire",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/f/f2/Bampton_StMaryV_south2.jpg",
        imageSource: "commons",
        imageCredit: "Motacilla (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Bampton_StMaryV_south2.jpg",
      },
      {
        slug: "basildon-park",
        name: "バシルドン・パーク",
        engName: "Basildon Park",
        scene: "グランサム・ハウス(クローリー家のロンドン邸宅)の内部",
        body: `一家が「ロンドンの家」に滞在する場面で使われた屋敷。実際にはバークシャー州にあり、ナショナル・トラストが管理しています。

1770年代に建てられたパッラーディオ様式の邸宅ですが、この建物の見どころは**一度死にかけてから蘇った**という来歴にあります。20世紀に入って所有者を失い、両大戦では兵舎として使われ、戦後は屋根が抜け、内装の一部は売り払われて海を渡りました。1950年代には解体寸前でした。

これを買い取ったのがイリフ卿夫妻です。夫人は流出した装飾品を各地から買い戻し、失われた部分は同時代の他の館から救い出した部材で埋めて、20年以上かけて館を復元しました。今見ている壮麗な内装は、そうやって集め直されたものです。

ドラマの豪奢な室内が、実は破壊と収集の産物である──というのは、この館を知ったうえで見ると味わいが変わります。`,
        area: "バークシャー州(ロンドンから約70km)",
        nearestStation: "Paddington 駅から Reading 駅まで約30分、そこからタクシーで約20分",
        access: "ナショナル・トラストの有料公開施設。開館日は季節により異なります。",
        website: "https://www.nationaltrust.org.uk/visit/london-and-south-east/basildon-park",
        mapQuery: "Basildon Park Reading",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/9/95/Basildon_House_-_geograph.org.uk_-_4638362.jpg",
        imageSource: "commons",
        imageCredit: "Philip Halling (CC BY-SA 2.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Basildon_House_-_geograph.org.uk_-_4638362.jpg",
      },
      {
        slug: "lancaster-house-downton",
        name: "ランカスター・ハウス",
        engName: "Lancaster House",
        scene: "劇場版 バッキンガム宮殿の内部",
        body: `劇場版で国王夫妻がダウントンを訪れる物語の、王室側の場面。バッキンガム宮殿の内部として撮影されたのがこの建物です。

『ブリジャートン家』でシャーロット王妃の宮殿の内装に使われていたのと**まったく同じ建物**で、英国の時代劇において「宮殿の中」を撮りたいときの事実上の標準ロケ地になっています。バッキンガム宮殿そのものを撮影に貸し出すことは基本的にないため、金箔の大階段と豪奢な広間を備えたこの館に需要が集中する、という構図です。

同じ部屋が、ある作品では1810年代の王妃の謁見室になり、別の作品では1920年代のジョージ5世の宮殿になる。ロケ地を知ってから見ると、そういう「使い回し」が見えるようになります。`,
        area: "セント・ジェームズ(ロンドン市内)",
        nearestStation: "Green Park 駅",
        access:
          "英国政府の迎賓施設のため通常は非公開。毎年9月のオープン・ハウス・フェスティバルなど、限られた機会にのみ公開されます。",
        mapQuery: "Lancaster House St James's London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/c/c3/Lancaster_House_London.jpg",
        imageSource: "commons",
        imageCredit: "Ricardalovesmonuments (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Lancaster_House_London.jpg",
      },
      {
        slug: "bridgewater-house",
        name: "ブリッジウォーター・ハウス",
        engName: "Bridgewater House",
        scene: "グランサム・ハウスの外観",
        body: `クローリー家のロンドンの邸宅「グランサム・ハウス」の外観に使われた建物。グリーン・パークのすぐそば、クリーヴランド・ロウに面して立っています。

設計したのはチャールズ・バリー。**ハイクレア城を設計したのと同じ建築家**です。屋敷の外観と一家の本邸が、意図せず同じ建築家の手による建物で統一されている、という偶然があります。

19世紀半ばにブリッジウォーター伯爵家のために建てられ、当時この家が所蔵していた美術コレクションは、個人の所蔵としてはロンドン随一と言われました。現在は個人所有のオフィスとして使われており、内部の見学はできません。

すぐ隣がランカスター・ハウス、その先がセント・ジェームズ宮殿。**歩いて数分の範囲に、ダウントンのロンドン関連ロケ地が固まっています**。`,
        area: "セント・ジェームズ(ロンドン市内)",
        nearestStation: "Green Park 駅",
        access: "個人所有の建物で内部見学は不可。公道から外観のみ見られます。",
        mapQuery: "Bridgewater House Cleveland Row London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/a/a8/Bridgewater_House_London_%281%29.jpg",
        imageSource: "commons",
        imageCredit: "Ricardalovesmonuments (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Bridgewater_House_London_(1).jpg",
      },
      {
        slug: "middle-temple",
        name: "ミドル・テンプル",
        engName: "Middle Temple Lane & Hall",
        scene: "シリーズ5 ヨークの街路",
        body: `シティとウェストミンスターのあいだ、テムズ川に向かって下る石畳の一角。劇中ではヨークの街として撮影されました。

ここは**インズ・オブ・コート**、すなわち法廷弁護士(バリスター)を養成し、資格を与える四つの法曹院のひとつです。中世以来、独自の自治権を持つ区域として、ロンドンのただ中にありながら別の統治下に置かれてきました。今も現役の法律事務所が軒を連ねています。

**ミドル・テンプル・ホール**は1570年代に完成した食堂で、二重ハンマービーム構造の木造天井が当時のまま残っています。ここで1602年、シェイクスピアの『十二夜』が上演記録に残る最初の公演を迎えました。作者自身が出演していた可能性も指摘されています。ホールの長テーブルは、エリザベス1世が寄贈したという伝承のあるオーク材です。

ガス灯の名残りと石畳が続くこの区画は、車の入らない静けさもあって、19世紀の画面を撮るには理想的な場所になっています。`,
        area: "テンプル(シティ西端)",
        nearestStation: "Temple 駅、Blackfriars 駅",
        access:
          "路地と中庭は平日の日中であれば通り抜けできます。ミドル・テンプル・ホールの内部は公開日が限られるため、事前に確認が必要です。",
        tips: "隣接するテンプル教会は、円形の身廊を持つテンプル騎士団の12世紀の教会。合わせて訪ねる価値があります。",
        website: "https://www.middletemple.org.uk/",
        mapQuery: "Middle Temple Hall London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/3/35/Middle_Temple_Hall_Exterior%2C_London%2C_UK_-_Diliff.jpg",
        imageSource: "commons",
        imageCredit: "David Iliff (CC BY-SA 3.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Middle_Temple_Hall_Exterior,_London,_UK_-_Diliff.jpg",
      },
      {
        slug: "the-ritz",
        name: "ザ・リッツ",
        engName: "The Ritz London",
        scene: "シリーズ最終話 再会の場面",
        body: `ピカデリーに面した1906年開業のホテル。シリーズ最終話でイーディスとバーティが再会する場面が、ここのレストランで撮影されました。

創業者セザール・リッツは、ホテル業の常識をいくつも書き換えた人物です。**客室ごとに専用の浴室を備える**という当時としては破格の設計、電話の各室設置、そして「淑女が同伴者なしで公の場で食事をしてよい」空間としてホテルのレストランを開いたことなど、現在の高級ホテルの標準の多くがここから始まりました。建物自体も、鉄骨造にポートランド石を貼るというロンドンでは初期の工法で建てられています。

現在も名物はアフタヌーンティーで、パーム・コートで一日に何回かに分けて供されます。**要予約で、男性はジャケットとネクタイ着用が必須**という明確なドレスコードがあり、当日ふらりと立ち寄れる場所ではありません。数か月前から予約が埋まります。`,
        area: "ピカデリー / セント・ジェームズ",
        nearestStation: "Green Park 駅",
        access:
          "営業中のホテル。外観は自由に見られます。アフタヌーンティーやレストランの利用は要予約・ドレスコードあり。",
        tips: "ブリッジウォーター・ハウス、ランカスター・ハウスとは徒歩数分。ダウントンの市内ロケ地はこの一帯に集中しています。",
        website: "https://www.theritzlondon.com/",
        mapQuery: "The Ritz London Piccadilly",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/f/fd/The_Ritz_London.jpg",
        imageSource: "commons",
        imageCredit: "Sheila1988 (CC BY-SA 4.0)",
        imageLink: "https://commons.wikimedia.org/wiki/File:The_Ritz_London.jpg",
      },
    ],
  },
  {
    slug: "paddington",
    title: "パディントン",
    engTitle: "Paddington",
    eyebrow: "Film Series",
    years: "2014–2017",
    summary:
      "ペルーからやってきた小熊が住み着いたのは、ノッティング・ヒルの街並みそのもの。骨董店、博物館、パステルカラーの住宅街まで、絵本の続きを歩けるコース。",
    routeHint: "ノッティング・ヒル周辺で半日",
    lead: [
      "『パディントン』が愛される理由のひとつは、舞台がほとんど実在のロンドンだということです。CGの熊が歩き回るのは、作り物のセットではなく、ノッティング・ヒルの市場、南ケンジントンの博物館、プリムローズ・ヒルの住宅街という、observedな実在の街並みです。",
      "ここでは劇中に登場した実在の場所を、なぜその場所が選ばれたのかという背景と一緒に紹介します。私有の住宅も含まれるため、見学の可否は事前に必ず確認してください。",
    ],
    note: "チャルコット・クレセントは実際に人が暮らす住宅街です。外観の見学・撮影にとどめ、玄関先での長居や住人への声かけは控えてください。",
    keywords: [
      "パディントン ロケ地",
      "Paddington ロケ地",
      "ノッティングヒル ロケ地",
      "パディントン駅",
      "ポートベロー・ロード",
      "自然史博物館 パディントン",
      "映画 ロケ地 ロンドン",
      "聖地巡礼 ロンドン",
    ],
    spots: [
      {
        slug: "marylebone-station",
        name: "メリルボーン駅(劇中の「パディントン駅」外観)",
        engName: "Marylebone Station",
        scene: "小熊パディントンが到着し、ブラウン一家と出会う場面",
        body: `物語の起点となる駅の場面。プラットフォームの撮影は実際のパディントン駅で行われていますが、街路から見上げる「パディントン駅」の堂々とした正面玄関のカットは、実はここメリルボーン駅です。

本物のパディントン駅にはああした大きな正面アーチがないため、美術チームがメリルボーン駅の入口に「PADDINGTON STATION」の看板を掲げて撮影しました。駅名を偽装したロケ地、という珍しい成り立ちです。

一方、本物のパディントン駅の1番線には、原作者マイケル・ボンドの立ち会いのもと2000年に除幕されたパディントン・ベアのブロンズ像が今も立っています。物語の中でブラウン一家が小熊と出会った場所として、こちらもあわせて訪ねる価値があります。`,
        area: "メリルボーン(撮影地)/ パディントン(像の所在地)",
        nearestStation: "Marylebone 駅(撮影地)、Paddington 駅(像)",
        access:
          "どちらも現役の主要駅で、自由に出入りできます。パディントン駅1番線の像は無料で見学可能。",
        tips: "メリルボーン駅の「映画の外観」とパディントン駅の「本物の像」は徒歩15分ほど。両方回ると撮影の種明かしが体感できます。",
        website: "https://www.paddington.com/us/heritage/the-station/",
        mapQuery: "Marylebone Station London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/1/12/Marylebone_station_frontage_-_DSCF0473.JPG",
        imageSource: "commons",
        imageCredit: "Rept0n1x (CC BY-SA)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Marylebone_station_frontage_-_DSCF0473.JPG",
      },
      {
        slug: "alices-antiques",
        name: "アリスズ・アンティークス(劇中の「グルーバーさんの骨董店」)",
        engName: "Alice's Antiques, Portobello Road",
        scene: "パディントンの友人、グルーバーさんの骨董店",
        body: `ポートベロー・ロードに実在する骨董店。真っ赤な外壁とごちゃごちゃとしたショーウィンドウの雑貨が、劇中の「グルーバーさんの骨董店」にそのまま採用されました。

1952年からこの一族が営む店で(建物自体の商いは1887年から)、ノッティング・ヒルの顔とも言える存在です。1969年の映画『ミニミニ大作戦』にも登場しており、ロケ地としての実績は『パディントン』以前からありました。

2025年秋には、店舗兼上階の住居がおよそ450万ポンドで売りに出されたと報じられました。長年のオーナー一族が手放す決断をしたためで、訪問前に営業状況を確認しておくと安心です。`,
        area: "ノッティング・ヒル",
        nearestStation: "Notting Hill Gate 駅、Ladbroke Grove 駅(いずれも徒歩約10分)",
        access:
          "外観は市場に面した通り沿いなのでいつでも見学可能。店内に入れるかは営業状況によるため、訪問前の確認を推奨します。",
        tips: "土曜のポートベロー・ロード・マーケット開催中に訪れると、通り全体の雰囲気も一緒に楽しめます。",
        mapQuery: "Alice's Antiques Portobello Road London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/a/a8/Alice%27s_Antique_Shop%2C_Portobello_Road%2C_Notting_Hill%2C_London_2022-08-18.jpg",
        imageSource: "commons",
        imageCredit: "Brokentaco (CC BY 2.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Alice%27s_Antique_Shop,_Portobello_Road,_Notting_Hill,_London_2022-08-18.jpg",
      },
      {
        slug: "natural-history-museum-paddington",
        name: "自然史博物館",
        engName: "Natural History Museum",
        scene: "剥製師ミリセントの職場という設定の場面(第1作)",
        body: `テラコッタ張りの外壁と大聖堂のようなヒンツェ・ホールを持つ、サウス・ケンジントンのヴィクトリア朝建築。第1作で、パディントンを剥製にしようとする悪役ミリセント(ニコール・キッドマン)の職場として使われました。

館内での撮影は、一般公開時間を避けるため夜間に複数回にわたって行われたと報じられています。剥製師の悪役の舞台として、実在の標本コレクションを持つこの博物館ほど説得力のある場所はなかったといえます。

パディントン駅、ポートベロー・ロードと同様、作り込んだセットではなく実在のロンドンの名所をそのまま使うという、このシリーズ一貫した姿勢がここにも表れています。`,
        area: "サウス・ケンジントン",
        nearestStation: "South Kensington 駅",
        access: "入場無料(一部の特別展のみ有料)。一般公開時間内は自由に見学できます。",
        tips: "平日の開館直後が比較的空いています。目玉のクジラの骨格標本「ホープ」があるヒンツェ・ホールは必見です。",
        website: "https://www.nhm.ac.uk",
        mapQuery: "Natural History Museum London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/7/76/Entrance_to_Natural_History_Museum%2C_Cromwell_Road%2C_London_SW7_-_geograph.org.uk_-_1034304.jpg",
        imageSource: "commons",
        imageCredit: "Christine Matthews (CC BY-SA 2.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Entrance_to_Natural_History_Museum,_Cromwell_Road,_London_SW7_-_geograph.org.uk_-_1034304.jpg",
      },
      {
        slug: "chalcot-crescent",
        name: "チャルコット・クレセント(劇中の「ウィンザー・ガーデンズ32番地」)",
        engName: "Chalcot Crescent, Primrose Hill",
        scene: "ブラウン一家の自宅の外観",
        body: `物語の設定上、ブラウン家の「ウィンザー・ガーデンズ32番地」はノッティング・ヒル寄りにあることになっていますが、実際の外観撮影が行われたのはプリムローズ・ヒルのチャルコット・クレセントです。

パステルカラーに塗られたジョージ王朝様式の連棟住宅と、鋳鉄のバルコニーが並ぶ通りで、絵本さながらの佇まいがこの映画の「絵本のようなロンドン」を体現しています。ロケハンの担当者いわく、実在の設定地よりも「さらに高級な」エリアが選ばれたことになります。

なお室内の場面はここではなく、エルストリー・スタジオに組まれたセットで撮影されています。この通りで見られるのはあくまで外観だけです。`,
        area: "プリムローズ・ヒル",
        nearestStation: "Chalk Farm 駅 徒歩約9分",
        access:
          "実際に人が暮らす住宅街です。中に入ることはできません。通りからの外観の見学・撮影にとどめてください。",
        tips: "近くのプリムローズ・ヒルの丘に登ればロンドンのスカイラインが一望できます。合わせて訪ねるのがおすすめです。",
        mapQuery: "Chalcot Crescent Primrose Hill London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/f/f8/1-17_Chalcot_Crescent%2C_Primrose_Hill%2C_April_2026.jpg",
        imageSource: "commons",
        imageCredit: "No Swan So Fine (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:1-17_Chalcot_Crescent,_Primrose_Hill,_April_2026.jpg",
      },
    ],
  },
  {
    slug: "james-bond",
    title: "James Bond(007)シリーズ",
    engTitle: "James Bond",
    eyebrow: "Film Series",
    years: "1962–",
    summary:
      "MI6本部の実物、Spectreのクライマックスの橋、そしてフレミング本人がなじんだバー。虚実が入り混じる007のロンドンを歩く。",
    routeHint: "市内に点在・移動を含め1日",
    lead: [
      "007シリーズのロンドンは一筋縄ではいきません。MI6本部として映るビルは本当に現役の情報機関の本部であり、一方でボンドの行きつけとして知られる社交クラブは劇中では別の名前で登場します。実在と虚構が意図的に重ねられているのが、このシリーズのロンドンの特徴です。",
      "ここでは長寿シリーズの中から、実際に訪ねられる場所を厳選して紹介します。政府施設や会員制クラブが含まれるため、見学の可否は事前に確認してから旅程を組んでください。",
    ],
    note: "SISビル(通称MI6本部ビル)は現役の情報機関の庁舎です。観光施設ではないため、外観を対岸や橋の上から眺める・撮影するにとどめ、敷地に近づいたり長時間の撮影を行ったりしないでください。",
    keywords: [
      "James Bond ロケ地",
      "007 ロケ地",
      "MI6 本部ビル",
      "ヴォクソール・クロス",
      "ウェストミンスター橋 スペクター",
      "デュークス・バー",
      "映画 ロケ地 ロンドン",
      "聖地巡礼 ロンドン",
    ],
    spots: [
      {
        slug: "sis-building",
        name: "SISビル(通称「MI6本部ビル」)",
        engName: "SIS Building, Vauxhall Cross",
        scene: "MI6本部の外観として、シリーズ5作に繰り返し登場",
        body: `『ゴールデンアイ』『ワールド・イズ・ノット・イナフ』『ダイ・アナザー・デイ』『スカイフォール』『スペクター』と、5作にわたってMI6本部として画面に映る建物です。特撮ではなく、**実際に稼働している英国秘密情報部(MI6)の本庁舎**そのものが使われています。

テムズ川沿い、ヴォクソール・ブリッジのたもとに立つこの建物は1994年築、建築家テリー・ファレルによる階段状(ジッグラト状)のデザインで、砂色と緑色の外観がひと目でそれとわかります。

『ワールド・イズ・ノット・イナフ』冒頭の爆破シーンは、実際の庁舎ではなくパインウッド・スタジオに作られた50フィートの模型で撮影されました。さすがに本物の情報機関の庁舎を爆破するわけにはいかなかった、という事情です。『スカイフォール』でも同様に本部への攻撃シーンが描かれ、公開時にはSIS職員向けの特別上映会が庁舎内で行われ、その場面に歓声が上がったと伝えられています。`,
        area: "ヴォクソール",
        nearestStation: "Vauxhall 駅 徒歩2〜10分",
        access:
          "現役の情報機関庁舎のため、内部見学や敷地への立ち入りはできません。対岸やヴォクソール・ブリッジ上からの外観の見学・撮影にとどめてください。",
        tips: "ヴォクソール・ブリッジの上、またはテムズ対岸(北岸)から見ると、建物全体の階段状のシルエットが川越しに収まります。夕方は外壁の色が暖色に映えます。",
        mapQuery: "SIS Building Vauxhall Cross London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/3/37/Secret_Intelligence_Service_building_-_Vauxhall_Cross_-_Vauxhall_-_London_-_24042004.jpg",
        imageSource: "commons",
        imageCredit: "Tagishsimon (CC BY-SA 3.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Secret_Intelligence_Service_building_-_Vauxhall_Cross_-_Vauxhall_-_London_-_24042004.jpg",
      },
      {
        slug: "westminster-bridge",
        name: "ウェストミンスター橋",
        engName: "Westminster Bridge",
        scene: "『スペクター』(2015)クライマックスの舞台",
        body: `『スペクター』終盤、ボンドがブロフェルドのヘリコプターを撃墜し、橋の上に墜落させたのちブロフェルドと対峙する、シリーズきっての緊迫したクライマックスの舞台です。

撮影は実際の橋の一部と、パインウッド・スタジオの「007ステージ」に組まれた実物大のレプリカを組み合わせて行われました。ロンドンの夜景を映す35フィートの巨大スクリーンで橋を囲み、視覚効果チームが夏の撮影を冬の夜へとデジタルで変換しています。墜落するヘリコプターには実機(ユーロコプターAS365ドーファンN2、登録記号G-LCPL)が使われました。

すぐ隣に国会議事堂とビッグ・ベンが立つ立地そのものが、この場面をひと目でロンドンとわかる画にしています。`,
        area: "ウェストミンスター",
        nearestStation: "Westminster 駅",
        access: "終日開放されている歩行者用の橋。無料でいつでも渡れます。",
        tips: "ビッグ・ベンと国会議事堂を画面に収めるなら夕暮れから夜がおすすめ。日中は観光客で混雑するため、早朝の方が撮影はしやすいです。",
        mapQuery: "Westminster Bridge London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/b/b2/Westminster_Bridge_with_shadows_and_Big_Ben.jpg",
        imageSource: "commons",
        imageCredit: "Matt Brown (CC BY 2.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Westminster_Bridge_with_shadows_and_Big_Ben.jpg",
      },
      {
        slug: "dukes-bar",
        name: "デュークス・バー",
        engName: "DUKES Bar, DUKES Hotel",
        scene: "撮影地ではなく、ボンドのマティーニの元ネタとされるバー",
        body: `ここは映画の撮影が行われた場所ではありません。原作者イアン・フレミング本人が通っていたことで知られ、ボンドの「ステア、ノット・シェイクン(かき混ぜて、振らないで)」というマティーニの流儀のルーツとされるバーです。

1908年からセント・ジェームズの路地裏で営業する老舗で、スピリッツを冷凍庫で冷やし、グラスも冷やしたうえで、シェイカーではなく客の目の前で注ぎ入れる独自の作法で知られます。フレミングがここのイタリア人バーテンダーとマティーニの技法について語り合ったことが、『カジノ・ロワイヤル』に登場するヴェスパー・マティーニのレシピに影響したと広く語られていますが、フレミング自身がこの店の名を作中で明言したわけではなく、あくまで店側や業界での言い伝えに近いものである点は留意してください。`,
        area: "セント・ジェームズ",
        nearestStation: "Green Park 駅 徒歩約5分",
        access:
          "営業中のバーで、誰でも入店できます(要予約推奨、スマートカジュアル以上のドレスコードあり)。",
        tips: "定番はヴェスパー・マティーニ。アルコール度数が高いため、店側は非公式に「2杯まで」を勧めています。夜は予約推奨。",
        website: "https://www.dukeshotel.com/dukesbar.html",
        mapQuery: "DUKES Bar St James's London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/a/a3/Dukes_Hotel%2C_St_James%27s_Place%2C_June_2022_01.jpg",
        imageSource: "commons",
        imageCredit: "No Swan So Fine (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Dukes_Hotel,_St_James's_Place,_June_2022_01.jpg",
      },
      {
        slug: "reform-club",
        name: "リフォーム・クラブ(劇中の「ブレイズ」)",
        engName: "The Reform Club, Pall Mall",
        scene: "『ダイ・アナザー・デイ』(2002)フェンシングクラブ「ブレイズ」",
        body: `『ダイ・アナザー・デイ』で、ボンドが悪役グレイブスとフェンシングで対決する会員制クラブ「ブレイズ」として使われた、パル・マルの実在の社交クラブです。「ブレイズ」自体はフレミングの原作小説(代表作は『ムーンレイカー』)にたびたび登場する架空のクラブ名で、映画版でその実写化にあたって選ばれました。

建物は1841年開業、建築家チャールズ・バリーの設計で、ローマのファルネーゼ宮を手本にしたイタリア風のファサードを持ちます。実際に映画で使われたのは外観や一部の内部空間のみで、フェンシングホールや噴水のある庭園などの場面の多くはスタジオに組まれたセットだったと伝えられています。

『八十日間世界一周』でフィリアス・フォッグが旅立つクラブとしても知られるなど、映像作品のロケ地としての実績は007以前から長い建物です。`,
        area: "パル・マル / セント・ジェームズ",
        nearestStation: "Charing Cross 駅、Piccadilly Circus 駅(いずれも徒歩5〜10分)",
        access:
          "会員制の私設クラブで、一般の飛び込み見学はできません。事前予約のガイドツアー、または毎年9月のオープン・ハウス・ロンドン開催時のみ内部見学が可能です。外観はパル・マル沿いからいつでも見られます。",
        tips: "オープン・ハウス・ロンドン以外の時期は外観の見学にとどめ、アセニアム・クラブなど周辺の「クラブランド」の建物とあわせて歩くのがおすすめです。",
        website: "https://www.reformclub.com",
        mapQuery: "Reform Club Pall Mall London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/c/c1/104_Pall_Mall%2C_London-15249008557.jpg",
        imageSource: "commons",
        imageCredit: "Phil Guest (CC BY-SA 2.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:104_Pall_Mall,_London-15249008557.jpg",
      },
    ],
  },
];

export function getFilmWork(slug: string) {
  return filmWorks.find((w) => w.slug === slug) ?? null;
}

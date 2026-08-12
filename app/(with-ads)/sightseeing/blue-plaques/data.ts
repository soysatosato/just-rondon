// ブループラーク巡り(/sightseeing/blue-plaques)。
//
// エリアを単位にしているのは、film-locations の作品単位と同じ理由で、
// 読者が「マリルボンを歩きたい」から人物を探すため。人物を単位にすると
// 散策の動線にならない。
//
// 掲載するのは English Heritage が運用する公式のブループラーク制度
// (青い円形プレート)に限る。自治体や団体が独自に設置する別スキームの
// プレートは、色や形が似ていても同列に扱わない。異なるスキームを
// 混ぜて出すと「本物のブループラークだけを巡りたい」読者の期待を裏切る。
//
// 番地は正確な現地確認ができる限り持たせる。プレート自体に住所が
// 刻まれているため、film-locations や Restaurant と違って裏取りの
// 難度が低い。
//
// 画像は film-locations と同じ方針。Wikimedia Commons のCC/PD画像を
// 直リンクし、imageCredit を必須表示する。画像が無い人物も、
// 画像なしで成立するカードとして書く。
//
// エリアを追加したら next-sitemap.config.js の staticPages にも1行足すこと。
// あちらは CJS で、このファイルを読めない。

export type Plaque = {
  /** ページ内アンカー。 */
  slug: string;
  name: string;
  engName: string;
  /** プレートに刻まれた肩書き・功績の一言。カード上部に出す。 */
  title: string;
  /** プレートに示された在住・活動期間の表記。 */
  years: string;
  /** 解説。markdown。 */
  body: string;
  address: string;
  nearestStation: string;
  /** 内部が公開施設なのか、外観のみの私有物件なのかを最初に伝える。 */
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
  instagramUrl?: string;
};

export type PlaqueArea = {
  slug: string;
  /** エリア名。 */
  title: string;
  engTitle: string;
  /** カードの eyebrow に使う一言テーマ。 */
  eyebrow: string;
  /** カード用の一言。 */
  summary: string;
  /** 一覧カードに出す、散策のしやすさ。 */
  routeHint: string;
  /** 記事冒頭のリード。markdown。段落ごとに配列で持つ。 */
  lead: string[];
  plaques: Plaque[];
  /** 散策前に知っておくべき注意。 */
  note?: string;
  keywords: string[];
};

export const plaqueAreas: PlaqueArea[] = [
  {
    slug: "marylebone-fitzrovia",
    title: "マリルボン / フィッツロヴィア",
    engTitle: "Marylebone & Fitzrovia",
    eyebrow: "作家・知識人",
    summary:
      "ヴァージニア・ウルフからH.G.ウェルズまで。静かな住宅街の壁に、近代文学史がそのまま埋め込まれている一角。",
    routeHint: "地下鉄駅2〜3駅分・半日",
    lead: [
      "マリルボンからフィッツロヴィアにかけての一帯は、19世紀後半から20世紀前半にかけて作家や知識人が好んで住んだエリアです。派手な観光名所こそありませんが、一本裏の通りに入ると、青いプレートが次から次へと現れます。",
      "ここでは実際に歩いて巡れる範囲の人物を厳選して紹介します。ほとんどが現在も人が住む私有の建物なので、見学は外観のみになります。",
    ],
    note: "掲載する建物のほとんどは現在も人が暮らす私有の住宅です。プレートの写真を撮る以上のこと(呼び鈴を鳴らす、敷地に入るなど)は控えてください。",
    keywords: [
      "ブループラーク マリルボン",
      "ブループラーク フィッツロヴィア",
      "Blue Plaque London",
      "ヴァージニア・ウルフ 家",
      "ロンドン 文豪 ゆかりの地",
      "聖地巡礼 ロンドン",
    ],
    plaques: [
      {
        slug: "virginia-woolf",
        name: "ヴァージニア・ウルフ",
        engName: "Virginia Woolf",
        title: "小説家",
        years: "1907–1911",
        body: `父の死後、ウルフは兄エイドリアンとともにこの家を借りました。ここで毎週木曜の夜に開かれた集まりに、リットン・ストレイチーやクライヴ・ベルらが集い、それがのちの「ブルームズベリー・グループ」の出発点になります。20世紀初頭のイギリスの文学・美術批評・性のあり方をめぐる価値観を大きく揺さぶった集団の、まさに発祥の場所です。

ウルフはここで過ごした年月の延長線上で、処女作『船出』の執筆に取り組んでいきます。同じ建物にはのちにジョージ・バーナード・ショーのプレートも掲げられ、ロンドンでも指折りの「二枚看板」の文学史的建物になっています。`,
        address: "29 Fitzroy Square, Fitzrovia, London W1T 5LP",
        nearestStation: "Warren Street 駅 徒歩3〜4分",
        access: "私有の住宅です。外観の見学にとどめてください。",
        tips: "同じ建物にジョージ・バーナード・ショーのプレートも掲げられています。あわせて見学できます。",
        mapQuery: "29 Fitzroy Square London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/7/78/Virginia_Stephen_%28VIRGINIA_WOOLF%29_-_29_Fitzroy_Square_Fitzrovia_London_W1T_5LP.jpg",
        imageSource: "commons",
        imageCredit: "Spudgun67 (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Virginia_Stephen_(VIRGINIA_WOOLF)_-_29_Fitzroy_Square_Fitzrovia_London_W1T_5LP.jpg",
      },
      {
        slug: "george-bernard-shaw",
        name: "ジョージ・バーナード・ショー",
        engName: "George Bernard Shaw",
        title: "劇作家",
        years: "1887–1898",
        body: `ショーが無名の若き批評家としてこの家に越してきて、著名な劇作家として去っていった10年間です。プレートには「その天才の蓄えから世界を豊かにした」という言葉が添えられています。

このフィッツロイ・スクエア時代に、のちの作品を特徴づける逆説的で鋭い機知が磨かれ、『ウォレン夫人の職業』や『武器と人間』が書かれました。同じ建物にはのちにヴァージニア・ウルフのプレートも加わり、古い時代のブロンズ製と新しい青いプレートが並ぶ、珍しい二枚看板の建物になっています。`,
        address: "29 Fitzroy Square, Fitzrovia, London W1T 6LQ",
        nearestStation: "Warren Street 駅 徒歩3〜4分",
        access: "私有の住宅です。外観の見学にとどめてください。",
        tips: "ヴァージニア・ウルフのプレートと同じ建物にあります。ひとつの外観で二人分を見学できます。",
        mapQuery: "29 Fitzroy Square London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/d/dc/GEORGE_BERNARD_SHAW_-_29_Fitzroy_Square_Fitzrovia_London_W1T_6LQ.jpg",
        imageSource: "commons",
        imageCredit: "Spudgun67 (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:GEORGE_BERNARD_SHAW_-_29_Fitzroy_Square_Fitzrovia_London_W1T_6LQ.jpg",
      },
      {
        slug: "elizabeth-barrett-browning",
        name: "エリザベス・バレット・ブラウニング",
        engName: "Elizabeth Barrett Browning",
        title: "詩人",
        years: "1838–1846",
        body: `病がちで、支配的な父のもとほとんど自室に閉じこもっていた時期に、エリザベス・バレットはこの家で1844年の詩集『Poems』を書き上げました。この詩集が彼女を一躍有名にし、ロバート・ブラウニングが最初のファンレターを送るきっかけになります。

父に秘密にしたまま進んだ二人の交際は、1846年のイタリアへの駆け落ちに至ります。この顛末はのちに戯曲・映画『バレット家の人々』として描かれました。もとの18世紀の建物自体は1935年に取り壊されており、現在の建物にプレートが移設された際、その経緯を示す石板が添えられています。`,
        address: "50 Wimpole Street, Marylebone, London W1G 8SQ",
        nearestStation: "Bond Street 駅、Regent's Park 駅(いずれも徒歩8〜10分)",
        access: "現在は医療関係の事務所が入る建物です。外観の見学にとどめてください。",
        mapQuery: "50 Wimpole Street London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/8/82/Elizabeth_Barrett_Barrett_-_50_Wimpole_Street_Marylebone_W1G_8SQ.jpg",
        imageSource: "commons",
        imageCredit: "Spudgun67 (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Elizabeth_Barrett_Barrett_-_50_Wimpole_Street_Marylebone_W1G_8SQ.jpg",
      },
      {
        slug: "frances-hodgson-burnett",
        name: "フランセス・ホジソン・バーネット",
        engName: "Frances Hodgson Burnett",
        title: "作家",
        years: "1893–1898",
        body: `大西洋の両岸で名声を得ていた絶頂期に、バーネットはこの1770年代建造の壮麗なタウンハウスを借り、私財を圧迫するほど盛大なもてなしを続けました(その事情はのちに短編『The Captain's Youngest』に反映されています)。

この家は間接的に『秘密の花園』(1911年)の誕生にも関わっています。1898年にここを引き払いケント州のメイサム・ホールへ移った後、そこの塀に囲まれた薔薇園が小説の舞台の直接の着想源になりました。ちなみに1979年にプレートが設置された際、実は隣の建物に誤って取り付けられ、翌日に付け直されたという逸話も残っています。`,
        address: "63 Portland Place, Marylebone, London W1B 1QP",
        nearestStation: "Regent's Park 駅、Great Portland Street 駅(いずれも徒歩4〜5分)",
        access: "私有・商業用の建物です。外観の見学にとどめてください。",
        mapQuery: "63 Portland Place London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/1/10/FRANCES_HODGSON_BURNETT_-_63_Portland_Place_Marylebone_London_W1B_1QP.jpg",
        imageSource: "commons",
        imageCredit: "Spudgun67 (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:FRANCES_HODGSON_BURNETT_-_63_Portland_Place_Marylebone_London_W1B_1QP.jpg",
      },
      {
        slug: "roger-fry",
        name: "ロジャー・フライ",
        engName: "Roger Fry",
        title: "美術評論家・美術家",
        years: "1913–1919",
        body: `フライは画家というより、批評家・キュレーターとしてブルームズベリー・グループの中核を担った人物です。1910年にグラフトン・ギャラリーで開いた「マネと後期印象派」展を企画し、「ポスト印象派(Post-Impressionist)」という言葉自体を作ったことで知られています。

この住所では1913年、装飾美術・織物・家具などを手がける工房「オメガ・ワークショップス」を設立しました。ダンカン・グラントやヴァネッサ・ベル、ウィンダム・ルイスらが関わった匿名制作の共同体でしたが、利益は出ないまま1919年に閉鎖されています。近所の29番地(ウルフ、ショーの家)とは目と鼻の先で、あわせて回れる距離です。`,
        address: "33 Fitzroy Square, Fitzrovia, London W1P 6AY",
        nearestStation: "Warren Street 駅 徒歩2分",
        access: "現在はイベント会場として使われる私有の建物です。外観の見学にとどめてください。",
        tips: "ウルフ・ショーのプレートがある29番地とは徒歩1分の距離。3人分をまとめて回れます。",
        mapQuery: "33 Fitzroy Square London",
      },
      {
        slug: "dante-gabriel-rossetti-birthplace",
        name: "ダンテ・ゲイブリエル・ロセッティ(生誕地)",
        engName: "Dante Gabriel Rossetti",
        title: "詩人・画家",
        years: "1828年生誕",
        body: `ロセッティが1848年にミレイ、ハント とともに結成した「ラファエル前派同盟」は、当時の型にはまった古典主義への反発から、強い色彩と細部への異様なこだわりを特徴としました。詩人クリスティーナ・ロセッティを含むロセッティ家のきょうだい全員が、この住所で生まれています。

なお、ロセッティが実際に生まれた建物(旧38番シャーロット・ストリート)は取り壊されており、現在のプレートは1906年にロンドン州議会が設置したのち、1928年に建て替え後の建物へ補足の説明板とともに移設されたものです。オリジナルの建物ではない点は、正確を期すなら知っておきたい事実です。`,
        address: "110 Hallam Street, Fitzrovia, London W1W 5HD",
        nearestStation: "Great Portland Street 駅 徒歩3分",
        access: "私有の住宅・オフィスです。外観の見学にとどめてください。",
        tips: "プレートは生誕地を示すものですが、建物自体は建て替え後のものです。",
        mapQuery: "110 Hallam Street London",
      },
    ],
  },
  {
    slug: "chelsea",
    title: "チェルシー",
    engTitle: "Chelsea",
    eyebrow: "音楽・アート・ボヘミアン",
    summary:
      "オスカー・ワイルドの旧宅からロックスターの住処まで。19世紀のボヘミアンと20世紀のミュージシャンが同じ通りに眠るエリア。",
    routeHint: "チェルシー中心部で半日",
    lead: [
      "チェルシーはヴィクトリア朝の芸術家コロニーとして知られた土地でありながら、20世紀にはロックミュージシャンたちが住み着いた一角でもあります。時代の異なる二つの「ボヘミアン」が同じ通りの中に共存しているのが、このエリアの面白さです。",
      "ここでは実際に訪ねられる住居を、なぜその人物がここに住んだのかという背景と一緒に紹介します。",
    ],
    note: "掲載する建物の多くは私有の住宅です。プレートの見学・撮影にとどめ、長時間の滞在や敷地内への立ち入りは控えてください。",
    keywords: [
      "ブループラーク チェルシー",
      "Blue Plaque Chelsea",
      "オスカー・ワイルド 家",
      "ロンドン ロックスター 住居跡",
      "ロンドン 音楽史 ゆかりの地",
      "聖地巡礼 ロンドン",
    ],
    plaques: [
      {
        slug: "oscar-wilde",
        name: "オスカー・ワイルド",
        engName: "Oscar Wilde",
        title: "劇作家",
        years: "1885年頃–1895年",
        body: `コンスタンス・ロイドとの結婚を機に、ワイルドは新築のこの家に移り住みました。前衛的な建築家E・W・ゴドウィンに内装を依頼し、「私の目は部屋に純色の休息の場を求める」という自身の美学理論をそのまま反映させています。

名声の絶頂期、ここで『ドリアン・グレイの肖像』や『真面目が肝心』を執筆し、サラ・ベルナールらをもてなしました。しかし1894年、クイーンズベリー侯爵がワイルドを同性愛者だと中傷するカードをこの家に残したことが、のちの名誉毀損訴訟、そして投獄へとつながる引き金になります。1895年、ワイルドはこの家を去ることになりました。`,
        address: "34 Tite Street, Chelsea, London SW3 4JA",
        nearestStation: "Sloane Square 駅 徒歩12〜15分",
        access: "現在は複数の住戸に分割された私有の建物です。外観の見学にとどめてください。",
        mapQuery: "34 Tite Street Chelsea London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/5/52/Oscar_Wilde_-_34_Tite_Street%2C_Chelsea%2C_SW3_4JA.JPG",
        imageSource: "commons",
        imageCredit: "Spudgun67 (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Oscar_Wilde_-_34_Tite_Street,_Chelsea,_SW3_4JA.JPG",
      },
      {
        slug: "bob-marley",
        name: "ボブ・マーリー",
        engName: "Bob Marley",
        title: "シンガーソングライター",
        years: "1977年",
        body: `マーリー&ザ・ウェイラーズは1977年、アルバム『Exodus』(「Jamming」「Waiting in Vain」「One Love」収録)を仕上げるための拠点として、この4階建てのテラスハウスを数か月間使用しました。マーリーはロンドンを「第二の拠点」と呼び、バンド仲間とバタシー・パークでサッカーに興じ、ザ・クラッシュをはじめとする当時のパンクシーンとも交流を持ちました。

このプレートが実現するまでには時間がかかりました。1977年の大麻所持容疑での逮捕を警戒したマーリーが、この住所を電話帳や選挙人名簿にあえて載せていなかったためです。English Heritageは当時の新聞報道をもとに、ようやくこの住所とのつながりを確認しました。`,
        address: "42 Oakley Street, Chelsea, London SW3 5HA",
        nearestStation: "Sloane Square 駅 徒歩約12分",
        access: "私有の住宅です。外観の見学にとどめてください。",
        mapQuery: "42 Oakley Street Chelsea London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/6/6a/BOB_MARLEY_-_42_Oakley_Street_Chelsea_SW3_5HA_Royal_Borough_of_Kensington_and_Chelsea.jpg",
        imageSource: "commons",
        imageCredit: "Spudgun67 (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:BOB_MARLEY_-_42_Oakley_Street_Chelsea_SW3_5HA_Royal_Borough_of_Kensington_and_Chelsea.jpg",
      },
      {
        slug: "james-whistler",
        name: "ジェームズ・アボット・マクニール・ホイッスラー",
        engName: "James Abbott McNeill Whistler",
        title: "画家・版画家",
        years: "1866年末–1878年10月",
        body: `アメリカ生まれのホイッスラーは、この家を仲間の画家たちを招く日曜恒例の「朝食会」の舞台にし、室内も自ら壁画で飾り立てました。ここで代表作である母の肖像画、正式名『灰と黒の配列 第1番』(1871年)を描き、窓の外に広がるテムズ川を夜に捉えた「ノクターン」連作も手がけています。

1878年、批評家ジョン・ラスキンを名誉毀損で訴えた裁判に勝訴したものの、莫大な訴訟費用によって財政破綻し、この家を手放すことになりました。`,
        address: "96 Cheyne Walk, Chelsea, London SW10 0DQ",
        nearestStation: "Sloane Square 駅 徒歩15〜18分(キングス・ロード経由のバスも利用可)",
        access: "私有の住宅です。外観の見学にとどめてください。",
        mapQuery: "96 Cheyne Walk Chelsea London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/6/6c/JAMES_ABBOTT_MCNEILL_WHISTLER_-_96_Cheyne_Walk_Chelsea_London_SW10_0DQ.jpg",
        imageSource: "commons",
        imageCredit: "Spudgun67 (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:JAMES_ABBOTT_MCNEILL_WHISTLER_-_96_Cheyne_Walk_Chelsea_London_SW10_0DQ.jpg",
      },
      {
        slug: "rossetti-swinburne",
        name: "ダンテ・ゲイブリエル・ロセッティ&アルジャーノン・チャールズ・スウィンバーン",
        engName: "Dante Gabriel Rossetti & Algernon Charles Swinburne",
        title: "詩人・画家 / 詩人",
        years: "1862–1882(ロセッティ)",
        body: `妻エリザベス・シダルの死の直後、1862年にロセッティはこの大きな屋敷(かつては「クイーンズ・ハウス」とも呼ばれた)を借り、20年間住み続けました。彼にとって最も長く暮らした住まいであり、ラファエル前派としてもっとも生産的だった時期をここで過ごしています。

1862年から1864年にかけては詩人スウィンバーンと同居しており、プレートには二人の名が並びます。ロセッティは庭で風変わりな動物を飼っていたと伝えられ、ウォンバットや孔雀もいたという逸話が残っています。近隣の住民が孔雀の飼育を禁じる条項をわざわざ賃貸契約に加えるようになった、という地域の言い伝えも広く語られていますが、これは厳密な裏付けの取りにくい逸話として紹介するにとどめます。`,
        address: "16 Cheyne Walk, Chelsea, London SW3 5RA",
        nearestStation: "Sloane Square 駅 徒歩18〜20分",
        access: "私有の住宅です。外観の見学にとどめてください。",
        mapQuery: "16 Cheyne Walk Chelsea London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/9/93/DANTE_GABRIEL_ROSSETTI_AND_ALGERNON_CHARLES_SWINBURNE_-_16_Cheyne_Walk_Chelsea_London_SW3_5RA.jpg",
        imageSource: "commons",
        imageCredit: "Spudgun67 (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:DANTE_GABRIEL_ROSSETTI_AND_ALGERNON_CHARLES_SWINBURNE_-_16_Cheyne_Walk_Chelsea_London_SW3_5RA.jpg",
      },
      {
        slug: "augustus-john",
        name: "オーガスタス・ジョン",
        engName: "Augustus John",
        title: "画家",
        years: "1913年築の自邸",
        body: `20世紀初頭のイギリスを代表する肖像画家のひとりであり、奔放な生活ぶりでも知られたジョンのために、1913〜14年、オランダ人建築家ロバート・ファン・ト・ホフが設計・新築した住宅です(建設費は当時で約2,200ポンド、現在グレードII指定建造物)。

この家で(内縁関係にあった)2番目の妻と子どもたちと暮らし、自宅兼アトリエとして使いました。当時のチェルシーはロンドンのボヘミアン芸術シーンの中心地で、近隣にはホイッスラーやロセッティの旧居もあり、19世紀と20世紀、二つの時代のボヘミアンが同じ通り沿いに共存しているのがこのエリアの面白さです。`,
        address: "28 Mallord Street, Chelsea, London SW3 6DU",
        nearestStation: "South Kensington 駅 徒歩約7分(Sloane Square 駅も利用可)",
        access: "私有の住宅です。外観の見学にとどめてください。",
        mapQuery: "28 Mallord Street Chelsea London",
      },
    ],
  },
  {
    slug: "westminster-st-jamess",
    title: "ウェストミンスター / セント・ジェームズ",
    engTitle: "Westminster & St James's",
    eyebrow: "政治・科学",
    summary:
      "チャーチルの戦時下の家からニュートンの旧居まで。権力と知の中心地に刻まれた、政治家と科学者のプレート。",
    routeHint: "国会議事堂周辺で半日",
    lead: [
      "英国政治の中心地であるウェストミンスターと、隣接するセント・ジェームズには、時代を動かした政治家や科学者ゆかりの建物が集まっています。国会議事堂やバッキンガム宮殿と徒歩圏内にあるため、王室観光のついでに立ち寄りやすいのも特徴です。",
      "ここでは実際に訪ねられる建物を厳選して紹介します。",
    ],
    keywords: [
      "ブループラーク ウェストミンスター",
      "Blue Plaque Westminster",
      "アイザック・ニュートン 家",
      "セント・ジェームズ・スクエア",
      "ロンドン 政治家 ゆかりの地",
      "聖地巡礼 ロンドン",
    ],
    plaques: [
      {
        slug: "isaac-newton",
        name: "アイザック・ニュートン",
        engName: "Isaac Newton",
        title: "科学者",
        years: "1700–1709",
        body: `ニュートンは1696年、王立造幣局の造幣局長(のち長官)に任命されたのを機にジャーミン・ストリートへ移り、最初は88番地に、1700年からはより広い87番地に移って1709年まで住みました。この間、王立協会の会長も務めています。

造幣局長としての職務のひとつが贋金の取り締まりで、ニュートンはこれを本気で遂行しました。自ら偽造犯を尋問することもあったと伝えられ、彼の告発によって処刑された者もいたとされています。プレートは1908年に設置され、1915年に付け直されています。`,
        address: "87 Jermyn Street, St James's, London SW1Y 6JP",
        nearestStation: "Piccadilly Circus 駅、Green Park 駅(いずれも徒歩約5分)",
        access: "現在は紳士服店が入る商業ビルです。外観・プレートの見学にとどめてください。",
        tips: "写真に写る建物の番地表記が「86」になっている資料もありますが、English Heritage公式では87番地とされています。",
        mapQuery: "87 Jermyn Street London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/4/47/Isaac_Newton_blue_plaque%2C_86_Jermyn_Street_SW1_-_geograph.org.uk_-_2836643.jpg",
        imageSource: "commons",
        imageCredit: "Robin Sones (CC BY-SA 2.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Isaac_Newton_blue_plaque,_86_Jermyn_Street_SW1_-_geograph.org.uk_-_2836643.jpg",
      },
      {
        slug: "lord-palmerston",
        name: "パーマストン子爵",
        engName: "Lord Palmerston",
        title: "政治家",
        years: "1846–1855",
        body: `パーマストンは1846年末から1855年1月まで、この家で外務大臣としての職務の一部を務め、その後1855年に首相の座に就きました。妻エミリーはこの家で影響力のある政治サロンを開いていました。

パーマストンは若い頃から社交的で魅力にあふれた人物として知られ、「キューピッド」というあだ名がついたほどでした。首相としての長い政治キャリアの締めくくりに、クリミア戦争を通じてイギリスを率いています。なお、パーマストンのプレートはロンドン市内に3か所あり、この4番地はその中でも主要な「政治家としての在住地」を示すものです。`,
        address: "4 Carlton Gardens, St James's, London SW1Y 5AA",
        nearestStation: "Charing Cross 駅、Green Park 駅(いずれも徒歩約8分)",
        access: "現在は私有のオフィスビルです。外観の見学にとどめてください。",
        mapQuery: "4 Carlton Gardens London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/2/2b/Lord_Palmerston_-_4_Carlton_Gardens_St._James%27s_London_SW1Y_5AA.jpg",
        imageSource: "commons",
        imageCredit: "Spudgun67 (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Lord_Palmerston_-_4_Carlton_Gardens_St._James's_London_SW1Y_5AA.jpg",
      },
      {
        slug: "nancy-astor",
        name: "ナンシー・アスター",
        engName: "Nancy Astor",
        title: "初めて議席に就いた女性議員",
        years: "1912–1946",
        body: `アメリカ生まれのアスターは1912年から1946年までこの家に暮らしました。1919年、保守党のプリマス・サットン選出議員として、イギリスで初めて庶民院に議席を持つ女性となり、以後25年以上その座を守り続けました。

セント・ジェームズ・スクエアで現存する最古の建物(1726〜28年築)であるこの家は、彼女の華やかな政治的社交の舞台でもありました。50人規模の晩餐会や600人規模の舞踏会が開かれたと伝えられ、戦時中の被害もあって1946年に手放されています。プレートは1987年、イギリス初の女性首相マーガレット・サッチャーによって除幕されました。`,
        address: "4 St James's Square, St James's, London SW1Y 6JU",
        nearestStation: "Piccadilly Circus 駅 徒歩約5分、Green Park 駅 徒歩約7分",
        access: "現在は会員制クラブ(Naval and Military Club)です。外観の見学にとどめてください。",
        mapQuery: "4 St James's Square London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/8/8d/Nancy_Astor_-_4_St_James%27s_Square_St_James%27s_London_SW1Y_6JU.jpg",
        imageSource: "commons",
        imageCredit: "Spudgun67 (CC BY-SA 4.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:Nancy_Astor_-_4_St_James's_Square_St_James's_London_SW1Y_6JU.jpg",
      },
      {
        slug: "gladstone-pitt-derby",
        name: "ウィリアム・グラッドストン、大ピット、ダービー伯爵",
        engName: "William Gladstone, Pitt the Elder & the Earl of Derby",
        title: "3人の首相を輩出した邸宅",
        years: "1735–36年築",
        body: `1735〜36年に建てられたこの邸宅は、時代を違えて3人の首相(あるいは首相経験者)が暮らした建物として、異例の大きなプレートが掲げられています。大ピット(チャタム伯爵)、ダービー伯爵エドワード・スタンリー、そしてウィリアム・グラッドストン。いずれも卓越した弁舌家として知られた政治家です。

ヴィクトリア朝を通じて4度にわたり首相を務めたグラッドストンは、長い政治人生の終盤にあたる1890年の議会会期中にこの家に住んでいました。現在は国際問題を扱うシンクタンク「チャタム・ハウス」(王立国際問題研究所)の本拠地となっており、政治的な系譜がそのまま続いている建物です。`,
        address: "10 St James's Square, St James's, London SW1Y 4LE",
        nearestStation: "Piccadilly Circus 駅、Green Park 駅(いずれも徒歩6〜8分)",
        access:
          "現在はシンクタンク「チャタム・ハウス」の拠点です。一般の見学はできませんが、公開講演会が開かれることがあります。",
        website: "https://www.chathamhouse.org/",
        mapQuery: "10 St James's Square London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/5/56/10StJamesPlaque1.jpg",
        imageSource: "commons",
        imageCredit: "Gareth E Kegg (CC BY-SA 4.0)",
        imageLink: "https://commons.wikimedia.org/wiki/File:10StJamesPlaque1.jpg",
      },
      {
        slug: "william-huskisson",
        name: "ウィリアム・ハスキソン",
        engName: "William Huskisson",
        title: "政治家",
        years: "1770–1830",
        body: `貿易庁長官、のちに植民地大臣を務めたハスキソンは、19世紀前半を代表する政治家のひとりです。しかし今日では、その死にざまで語られることの方が多い人物でもあります。

1830年9月、リヴァプール・アンド・マンチェスター鉄道の開業式典で、スティーヴンソンが開発した機関車「ロケット号」に轢かれて死亡し、広く報じられた鉄道事故としては史上初の犠牲者とされています。産業革命の輝かしい一場面の裏にある、痛ましい史実を伝えるプレートです。`,
        address: "28 St James's Place, St James's, London SW1A 1NR",
        nearestStation: "Green Park 駅 徒歩約10〜12分",
        access: "私有の建物です。外観の見学にとどめてください。",
        tips: "隣接する29番地には、ウィンストン・チャーチルの短期滞在を示す別のプレートがあります。あわせて見学できます。",
        mapQuery: "28 St James's Place London",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/4/4d/William_Huskisson_%283984676257%29.jpg",
        imageSource: "commons",
        imageCredit: "Simon Harriyott (CC BY 2.0)",
        imageLink:
          "https://commons.wikimedia.org/wiki/File:William_Huskisson_(3984676257).jpg",
      },
    ],
  },
];

export function getPlaqueArea(slug: string) {
  return plaqueAreas.find((a) => a.slug === slug) ?? null;
}

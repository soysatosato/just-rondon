/**
 * ロンドンに残るバンクシー作品のデータ。
 *
 * API ルート(/api/banksy-artworks)ではなくここに置いているのは、
 * ページをサーバー側で描画するため。作品一覧は検索エンジンに読ませたい
 * 本文そのものなので、クライアントで fetch すると初期HTMLが空になる。
 *
 * status は「現地へ行って見られるか」を表す。バンクシー作品は
 * 撤去・盗難・塗り潰しが日常的に起きるので、掲載する以上は
 * 現存しない作品を黙って残さない。2026年8月時点の調査に基づく。
 */

export type ArtworkStatus =
  /** 現地にあり、鑑賞できる */
  | "present"
  /** 一部が失われている・保護板越しなど、当初の状態では見られない */
  | "altered"
  /** 現地から失われた。訪問しても見られない */
  | "gone"
  /** 現存の確認が取れていない。訪問前に要確認 */
  | "unconfirmed";

export type BanksyArtwork = {
  id: number;
  slug: string;
  engName: string;
  name: string;
  /** 制作年。諸説ある場合は代表的な表記。 */
  year: string;
  /** 「イーストエンド」等、巡る順を決めるためのまとまり。 */
  area: string;
  address: string;
  lat: number;
  lng: number;
  status: ArtworkStatus;
  /** 一覧のバッジに出す短い現況。status を人間の言葉にしたもの。 */
  statusNote: string;
  /** 保護板(ペルスペックス等)で覆われているか。 */
  protected: boolean;
  description: string;
  url: string;
  fromIG: boolean;
};

export const STATUS_LABEL: Record<ArtworkStatus, string> = {
  present: "現存",
  altered: "一部変化",
  gone: "現存せず",
  unconfirmed: "要確認",
};

/**
 * 巡る順を考えるためのエリア区分。地理的に近いものをまとめている。
 */
export const AREAS = [
  {
    key: "east",
    name: "イーストエンド",
    hint: "ショーディッチ〜ベスナル・グリーン。作品密度が最も高く、歩いて回れます。",
  },
  {
    key: "city",
    name: "シティ・バービカン",
    hint: "バスキア壁画の2点が並ぶ一角。地下鉄バービカン駅から数分です。",
  },
  {
    key: "north",
    name: "ノース・ロンドン",
    hint: "ハックニーとイズリントン。2点の距離が離れているので地下鉄かバスで。",
  },
  {
    key: "outer",
    name: "郊外・単独",
    hint: "1点ずつ離れています。近くまで行く用事があるときに寄るのが現実的です。",
  },
] as const;

export type AreaKey = (typeof AREAS)[number]["key"];

export const BANKSY_ARTWORKS: (BanksyArtwork & { areaKey: AreaKey })[] = [
  {
    id: 20,
    slug: "blind-patriotism",
    engName: "Blind Patriotism",
    name: "盲目的な愛国心",
    year: "2026",
    areaKey: "outer",
    area: "セント・ジェームズ",
    address: "Waterloo Place, St James's, London SW1Y",
    lat: 51.506517,
    lng: -0.132103,
    status: "present",
    statusNote: "2026年4月に出現。柵越しに鑑賞できます",
    protected: true,
    description:
      "2026年4月29日にウォータールー・プレイスに現れた、バンクシーとしては珍しい立体作品です。スーツ姿の男性像が台座から一歩踏み出そうとしていますが、掲げた旗が風で顔の側に巻き戻り、視界を完全に塞いでいます。旗を掲げる行為そのものが前を見えなくしている、という構図で、題名の「盲目的な愛国心」がそのまま形になっています。ロンドン中心部の記念像が立ち並ぶ一角に、記念像の文法を借りて置かれている点が効いています。ウェストミンスター区は撤去ではなく保存の側に回り、保護柵が設けられた状態で公開されています。現時点でロンドンで見られるバンクシー作品としては最も新しく、状態も良好です。",
    url: "https://www.instagram.com/p/C-SZYdMMGLd/",
    fromIG: false,
  },
  {
    id: 14,
    slug: "guard-dog",
    engName: "Guard Dog",
    name: "ガード・ドッグ",
    year: "2003",
    areaKey: "east",
    area: "ショーディッチ",
    address: "83 Rivington St, London EC2A 3AY",
    lat: 51.526082,
    lng: -0.079041,
    status: "altered",
    statusNote: "中庭が開いていないと見られません",
    protected: true,
    description:
      "2003年、ショーディッチのナイトクラブ「Cargo」の中庭に描かれた初期の代表作です。「指定されたグラフィティエリア」を警官がプードルを連れて巡回しているという構図で、取り締まる側と、飼い慣らされた滑稽さを重ねています。同じ中庭には「His Master's Voice」も並んでおり、2点まとめて見られるのがこの場所の価値です。両作品ともペルスペックスで保護され、状態は良好に保たれてきました。ただしCargoは閉業しており、中庭に入れるかどうかは現在その場所を使っている店の営業状況次第です。夜のクラブの営業時間に合わせて行く、という以前の前提はもう通用しないので、訪問前に現地の状況を確認してください。なお同じリヴィントン・ストリートのart'otel London Hoxtonにも、保存された作品が2点あります。",
    url: "https://www.instagram.com/p/DK4kOlZo9nK/",
    fromIG: true,
  },
  {
    id: 10,
    slug: "pink-car",
    engName: "Pink Car",
    name: "ピンクの車",
    year: "2005",
    areaKey: "east",
    area: "ブリック・レーン",
    address: "6 Dray Walk, London E1 6NJ",
    lat: 51.52104,
    lng: -0.07243,
    status: "altered",
    statusNote: "骸骨のステンシルは失われ、車体だけが残ります",
    protected: true,
    description:
      "ブリック・レーン近く、トゥルーマン・ブルワリー跡地に置かれた古いトライアンフGT6を、バンクシーがピンクに塗ったインスタレーションです。当初は運転席の窓に死神(グリム・リーパー)のステンシルが描かれており、それこそがバンクシーの手による部分でした。ただしこの死神は2007年から2008年頃には失われており、現在残っているのはピンクの車体そのものだけです。透明のケースに収められた状態で今も現地にありますが、経年で相当に傷んでおり、作品というより遺構に近い見え方をします。それでも、ストリートアートを保存しようとすると何が残り何が消えるのか、という問いがそのまま形になっている点で、見に行く価値のある場所ではあります。",
    url: "https://www.instagram.com/p/Bu8LlVygqwv/",
    fromIG: true,
  },
  {
    id: 7,
    slug: "yellow-lines-flower-painter",
    engName: "Yellow Lines Flower Painter",
    name: "黄色いラインの花を描く画家",
    year: "2007",
    areaKey: "east",
    area: "ベスナル・グリーン",
    address: "42-46 Pollard Row, London E2 6NB",
    lat: 51.5303456,
    lng: -0.0561633,
    status: "altered",
    statusNote: "画家の人物像は失われ、花の一部だけが残ります",
    protected: false,
    description:
      "ベスナル・グリーン・ワーキング・メンズ・クラブの壁に2007年に描かれた作品です。道路の二重黄線が歩道を越えて壁を這い上がり、途中から大輪の黄色い花に変わる。その脇に、ペンキ缶に腰掛けてローラーを持つ作業員が描かれていました。規制を引く行為が、そのまま花を描く行為になっているという構図です。2019年、この作品は壁から切り出されました。クラブの当時の担当者が2万ポンドで元従業員に売却し、修復業者の手で取り外され、アメリカ・コロラド州へ渡っています。保険評価額は75万ドル前後と報じられました。クラブの理事会はこれを不正な売却として提訴し、2025年6月時点で高等法院での審理に向かっていますが、結論はまだ出ていません。現地の壁には花の一部が残っているものの、作業員の姿は失われ、周囲は他の落書きに覆われています。完全な形での鑑賞はできません。",
    url: "https://www.instagram.com/p/DMhZa4qtTag/",
    fromIG: true,
  },
  {
    id: 12,
    slug: "basquiat-tribute-1",
    engName: "Basquiat Tribute Mural 1",
    name: "バスキア・トリビュート壁画 1",
    year: "2017",
    areaKey: "city",
    area: "バービカン",
    address: "Golden Ln, Barbican, London EC2Y 8HD",
    lat: 51.52246,
    lng: -0.09603,
    status: "present",
    statusNote: "保護板の下で良好に保存されています",
    protected: true,
    description:
      "2017年9月、バービカンでのバスキア大回顧展『Basquiat: Boom for Real』の開幕に合わせて描かれた2点のうちの1点です。バスキアの1982年の作品『Boy and Dog in a Johnnypump』に登場する王冠のモチーフを、観覧車のチケット売り場として描き直しています。美術館が過去の路上画家を殿堂に迎え入れる、その瞬間に路上の側から描き足すという位置取りが効いた作品です。バービカン側は2点を恒久的に保存する方針を取り、いずれもペルスペックスで覆われ、他者のタグが付いた場合は除去されています。ゴールデン・レーンとビーチ・ストリートの角、バービカンの駐車場に近いビーチ・ストリートのトンネル付近にあり、2点は隣り合っているので一度に見られます。",
    url: "https://www.instagram.com/p/BZJELJiAmb5/",
    fromIG: true,
  },
  {
    id: 13,
    slug: "basquiat-tribute-2",
    engName: "Basquiat Tribute Mural 2",
    name: "バスキア・トリビュート壁画 2",
    year: "2017",
    areaKey: "city",
    area: "バービカン",
    address: "Golden Ln, Barbican, London EC2Y 8HD",
    lat: 51.522512,
    lng: -0.096142,
    status: "present",
    statusNote: "保護板の下で良好に保存されています",
    protected: true,
    description:
      "同じく2017年9月、バスキア展に合わせて描かれたもう1点です。『Boy and Dog in a Johnnypump』の少年が、2人の警官に身体検査を受けている場面が描かれています。黒人の画家を称える大回顧展が開かれるその建物の外壁で、黒人の少年が職務質問を受けている。祝祭と現実を同じ壁の上で衝突させた構図で、バンクシーがバスキアに捧げた敬意の内容がここにはっきり出ています。1点目と並んで設置されており、こちらも保護板の下で良好に保たれています。",
    url: "https://www.instagram.com/p/BZJGKelgSqg/?img_index=1",
    fromIG: true,
  },
  {
    id: 11,
    slug: "i-love-robbo-rat",
    engName: "'I Love Robbo' Rat",
    name: "「ロボが好き」ネズミ",
    year: "2010年代",
    areaKey: "city",
    area: "シティ",
    address: "38-42 Chiswell St, London EC1Y 4SB",
    lat: 51.520744,
    lng: -0.0898305,
    status: "present",
    statusNote: "保護シート越しに見られます",
    protected: true,
    description:
      "プラカードを掲げたネズミが、ストリートアーティストKing Robboの名を掲げています。バンクシーとRobboは、カムデンのリージェンツ運河沿いで互いの作品を上塗りし合う応酬を長く続けた関係で、この作品はその文脈を知っていて初めて意味が立ち上がります。敬意なのか皮肉なのかは意図的に決着がついておらず、そこが読みどころです。保護用の透明シートの下にありますが、Robboのタグ部分は黒く消され、周囲にはステッカーが貼られ続けており、作品の状態は今も動いています。",
    url: "https://www.instagram.com/p/BmqPdS3nHAz/",
    fromIG: true,
  },
  {
    id: 6,
    slug: "tonbridge-street-rat",
    engName: "Tonbridge Street Rat",
    name: "トンブリッジ・ストリートのネズミ",
    year: "2000年代",
    areaKey: "north",
    area: "キングス・クロス",
    address: "36 Tonbridge Street, London WC1H 9DW",
    lat: 51.528789,
    lng: -0.124659,
    status: "unconfirmed",
    statusNote: "現況の裏が取れていません。訪問前に確認を",
    protected: false,
    description:
      "キングス・クロスのトンブリッジ・ストリートに残るとされるネズミです。ネズミはバンクシーが2000年代初頭から繰り返し描いてきたモチーフで、都市の片隅で見過ごされる存在に自分自身を重ねた自画像とも読まれています。ステンシルで素早く描かれ、気づかれないまま増えていく点も含めてバンクシーらしい主題です。ただし、この作品については近年の状態を確認できる情報が見つかりませんでした。存在自体は複数のガイドが記録していますが、今も壁に残っているかは未確認です。なお、同じキングス・クロス地区には別のプラカード・ネズミがアーガイル・ストリートの建物(現在はホテル)にもあり、こちらとは別作品なので混同しないでください。",
    url: "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/banksyratwork.jpeg",
    fromIG: false,
  },
  {
    id: 3,
    slug: "the-royal-family",
    engName: "The Royal Family",
    name: "ロイヤル・ファミリー",
    year: "2001",
    areaKey: "north",
    area: "ストーク・ニューイントン",
    address: "140 Stoke Newington Church St, London N16 0JU",
    lat: 51.562233,
    lng: -0.081411,
    status: "altered",
    statusNote: "黒い塗料に囲まれつつ、中央部分が残っています",
    protected: false,
    description:
      "2001年に描かれた初期作で、バルコニーから手を振る王室一家を風刺的に描いています。2003年にはBlurのシングル『Crazy Beat』のジャケットに使われ、広く知られるようになりました。2009年、ハックニー区の職員がこの壁を黒く塗り潰し始めましたが、地元住民が抗議して作業が止まり、結果として黒く塗られた壁の中央に一家だけが島のように残る、という奇妙な状態になりました。行政が消そうとした跡がそのまま作品の一部として見える点で、かえって現在のほうが雄弁だとも言えます。風雨でかなり色褪せていますが、今も判別できる状態でストーク・ニューイントン・チャーチ・ストリートの壁に残っています。",
    url: "https://www.instagram.com/p/1NY-XIEOfq/?utm_source=ig_embed",
    fromIG: true,
  },
  {
    id: 9,
    slug: "tree",
    engName: "Tree",
    name: "ツリー",
    year: "2024",
    areaKey: "north",
    area: "フィンズベリー・パーク",
    address: "390A Hornsey Rd, London N19 4HT",
    lat: 51.565619,
    lng: -0.120431,
    status: "altered",
    statusNote: "保護板と柵に覆われ、当初の見え方ではありません",
    protected: true,
    description:
      "2024年3月、ホーンジー・ロードの集合住宅の壁に現れました。強剪定されて丸裸になった桜の木の背後に、緑の塗料を吹き付けて「失われた葉」を描き足すという視覚的な仕掛けです。壁面には高圧洗浄機を構える人物のステンシルがあり、その人物が緑を吹き付けているように見えます。都市が自然をどう管理し、どう見せかけるかへの皮肉として読まれました。公開直後から人が集まりましたが、数日のうちに白い塗料をかけられ、その後は木枠とペルスペックス、さらに柵で保護されています。保護のための構造物が視界に入るため、写真で見た通りの効果は現地では得にくくなっています。桜自体はその後葉をつけました。",
    url: "https://www.instagram.com/p/C4p0mn7su0a/?hl=en&img_index=2",
    fromIG: true,
  },
  {
    id: 4,
    slug: "pelicans",
    engName: "Pelicans",
    name: "ペリカン",
    year: "2024",
    areaKey: "outer",
    area: "ウォルサムストウ",
    address: "144 Northcote Rd, London E17 7EB",
    lat: 51.584568,
    lng: -0.0335,
    status: "present",
    statusNote: "保護板付き。動物シリーズで最も状態が良い1点です",
    protected: true,
    description:
      "2024年8月の動物シリーズの1点で、ウォルサムストウのフィッシュ・アンド・チップス店「Bonners Fish Bar」の壁に、2羽のペリカンが魚を丸呑みしている姿が描かれています。魚屋の壁で魚を食べる鳥、という単純な冗談ですが、店の商売とそのまま噛み合っているのが可笑しい。地元の反応が早かった作品でもあり、Wood Street Wallsという地域のコレクティブが透明の保護板を設置し、住民が見張りを立てて守りました。結果として動物シリーズの中では最も良い状態で残っています。角地にある店で、壁画自体はプレトリア・アベニュー側を向いているので、ノースコート・ロード側から探すと見つけにくいかもしれません。",
    url: "https://www.instagram.com/p/C-csjTiMN2R/",
    fromIG: true,
  },
  {
    id: 2,
    slug: "elephants",
    engName: "Elephants",
    name: "ゾウ",
    year: "2024",
    areaKey: "outer",
    area: "チェルシー",
    address: "Edith Grove, Kensington and Chelsea, London SW10",
    lat: 51.4825,
    lng: -0.182,
    status: "present",
    statusNote: "落書き被害から修復され、保護コーティング済み",
    protected: true,
    description:
      "2024年8月の動物シリーズの1点。壁に開いた2つの窓から、2頭のゾウが顔を突き出して互いに鼻を伸ばしています。窓という既存の構造をそのまま目や輪郭に使う、バンクシーが得意とする手口です。ロンドンでも有数の高級住宅地であるチェルシーの壁に現れたことで、街の側の文脈も込みで話題になりました。2024年9月に白いストライプの落書きを受けましたが、その後修復され、区が防落書きコーティングを施しています。エディス・グローブとエディス・テラスの角にあり、2026年時点でも良好な状態で見られます。",
    url: "https://www.instagram.com/p/C-U-LLVubOO/",
    fromIG: true,
  },
  {
    id: 5,
    slug: "rhino",
    engName: "Rhino",
    name: "サイ",
    year: "2024",
    areaKey: "outer",
    area: "チャールトン",
    address: "83 Westmoor St, London SE7 8NQ",
    lat: 51.4860991,
    lng: 0.0324953,
    status: "altered",
    statusNote: "壁の絵は残るものの、乗っていた車が撤去されました",
    protected: false,
    description:
      "2024年8月の動物シリーズの1点で、壁に描かれたサイが乗用車に乗り上がろうとしている構図でした。「乗っていた」のは壁の絵ではなく、その前に実際に置かれていた日産マイクラです。壁の絵と現実の車が組み合わさって初めて成立する作品でしたが、この車は後に撤去されました。グリニッジ王立区は自らが撤去したものではないと表明しています。現在も壁のサイのステンシルは残っていますが、肝心の車が無いため、宙に浮いたような絵として見えます。公開から数時間後には目出し帽の人物にタグを描かれる被害も受けました。作品としての完全な姿は、もう現地では見られません。",
    url: "https://www.instagram.com/p/C-ka78Ds53T/?utm_source=ig_embed",
    fromIG: true,
  },
  {
    id: 1,
    slug: "ibex",
    engName: "Ibex",
    name: "アイベックス",
    year: "2024",
    areaKey: "outer",
    area: "キュー",
    address: "110 Kew Green, Richmond TW9 3AP",
    lat: 51.485244,
    lng: -0.286107,
    status: "gone",
    statusNote: "2025年2月に壁ごと撤去されました。現地にはありません",
    protected: false,
    description:
      "2024年8月、バンクシーが9日間連続で発表した動物シリーズの第1作です。キュー・ブリッジ近くの建物の壁に、崩れかけた柱の上でバランスを取るアイベックス(野生の山羊)が描かれ、周囲には落ちてくる岩が添えられていました。真上には監視カメラが設置されており、危うい足場に立つ動物がカメラに見下ろされている、という構図でした。この作品は2025年2月初頭、建物の改修工事に先立って専門業者の手で壁ごと取り外され、カンブリア州カーライルの修復スタジオへ運ばれました。現地に行っても見ることはできません。動物シリーズの出発点として記録に留める意味で掲載していますが、キュー・グリーンまで足を運ぶ理由にはなりません。",
    url: "https://www.instagram.com/p/C-SZYdMMGLd/",
    fromIG: true,
  },
];

/** 現地で見られる見込みがある作品(= 現存せず・要確認 を除く)。 */
export const VIEWABLE_ARTWORKS = BANKSY_ARTWORKS.filter(
  (a) => a.status === "present" || a.status === "altered",
);

/** 地図に出す作品。現存しないものはピンを立てても意味がないので外す。 */
export const MAPPABLE_ARTWORKS = BANKSY_ARTWORKS.filter(
  (a) => a.status !== "gone",
);

export function artworksByArea(areaKey: AreaKey) {
  return BANKSY_ARTWORKS.filter((a) => a.areaKey === areaKey);
}

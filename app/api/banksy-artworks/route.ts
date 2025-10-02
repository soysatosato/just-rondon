import { NextResponse } from "next/server";

const BANKSY_ARTWORKS = [
  {
    id: 0,
    engName: "Slave Labour (Commemoration)",
    name: "奴隷労働（記念作品）",
    address: "8 Whymark Ave, London N22 6AQ",
    lat: 51.59109,
    lng: -0.103612,
    description:
      "2012年にロンドン・ウッドグリーンのWhymark Avenueに現れたバンクシーの『Slave Labour（奴隷労働）』は、壁に描かれた少年が古びたミシンでユニオンジャックの旗を縫い続ける姿を描き、児童労働や過剰な愛国心、消費社会の搾取構造を批判する象徴的な作品として知られています。この作品はバンクシー本人の作品ではありません。オリジナルは壁ごと切り取られ海外に持ち出され、最終的にはオークションで約75万ポンド（約1億円）で売却されました。その商業化と流出は大きな議論を呼び、バンクシー作品の保存や公共性をめぐる問題を浮き彫りにしました。バンクシーの消えた作品を追悼・再解釈したものです。オリジナルの『Slave Labour』はすでにロンドンには存在しませんが、その記憶と批評性はこの記念作品に引き継がれています。",
    url: "https://www.instagram.com/p/CdiizXSoLHE/?hl=am-et&img_index=1",
    fromIG: true,
  },
  {
    id: 1,
    engName: "Ibex",
    name: "アイベックス",
    address: "108 Kew Grn, Richmond TW9 3AP",
    lat: 51.485244,
    lng: -0.286107,
    description:
      "2024年8月、バンクシーがロンドンで9日間連続して発表した動物シリーズの第1作目。リッチモンドのキュー・ブリッジ近くの建物の壁に描かれたアイベックス（山羊）は、崩れかけたコラムの上にバランスを取って立つ姿が特徴的です。周囲には落下する岩のようなスプレーが描かれ、上方には監視カメラが設置されています。バンクシー自身がInstagramで公開し、作品の存在が確認されました。",
    url: "https://www.instagram.com/p/C-SZYdMMGLd/",
    fromIG: true,
  },
  {
    id: 2,
    engName: "Elephants",
    name: "ゾウ",
    address: "10 Edith Grove, Kensington and Chelsea, London, SW10 0LB",
    lng: -0.182,
    lat: 51.4825,
    description:
      "2024年8月、バンクシーが描いた2頭のゾウが、壁の窓から顔を出す姿が描かれています。1頭はストライプで落書きされるなどの被害を受けていますが、まだ壁に残っています。作品は、富裕層が住むチェルシー地区に位置し、ストリートアートと高級住宅地の対比が話題となりました。",
    url: "https://www.instagram.com/p/C-U-LLVubOO/",
    fromIG: true,
  },
  {
    id: 3,
    engName: "The Royal Family",
    name: "ロイヤル・ファミリー",
    address: "390 Hornsey Rd, Finsbury Park, London N19 4HT",
    lat: 51.5873645,
    lng: -0.1209667,
    description:
      "2001年にバンクシーによって制作されたこの作品は、英国王室を題材に、バルコニーで手を振る姿を風刺的に描いています。2003年にはBlurのシングル『Crazy Beat』のジャケットにも使用され、一般にも知られる作品となりました。2009年にはハックニー区の職員によって黒いペンキで塗りつぶされそうになりましたが、地元住民の抗議により中止され、現在も建物の壁に一部が残されています。",
    url: "https://www.instagram.com/p/1NY-XIEOfq/?utm_source=ig_embed",
    fromIG: true,
  },
  {
    id: 4,
    engName: "Pelicans",
    name: "ペリカン",
    lat: 51.584568,
    lng: -0.0335,
    address: "144 Northcote Rd, London E17 7EB",
    description:
      "2024年8月、バンクシーがウォルサムストウのボンナー・フィッシュ・バーの壁に描いた2羽のペリカンが、ユーモラスに魚を食べる姿が表現されています。作品は、地元の人々に親しまれ、現在もそのまま残っています。",
    url: "https://www.instagram.com/p/C-csjTiMN2R/",
    fromIG: true,
  },
  {
    id: 5,
    engName: "Rhino",
    name: "サイ",
    address: "83 Westmoor St, London SE7 8NQ",
    lat: 51.4860991,
    lng: 0.0324953,
    description:
      "2024年8月、バンクシーがチャールトンのウェストムーア・ストリートに描いたサイが、日産マイクラに乗る姿が描かれています。しっかりとした壁に描かれており、撤去が難しいため、現在もそのまま残っています。",
    url: "https://www.instagram.com/p/C-ka78Ds53T/?utm_source=ig_embed",
    fromIG: true,
  },
  {
    id: 6,
    engName: "Banksy Rat",
    name: "バンクシー・ラット",
    address: "36 Tonbridge Street, London WC1H 9DW",
    lat: 51.528789,
    lng: -0.124659,
    description:
      "このバンクシーのラット・アートは、ロンドンのキングス・クロス地区に位置するトンブリッジ・ストリートの建物の壁面に描かれています。この作品は、バンクシーの初期の作品群に見られるラット・シリーズの一部であり、2000年代初頭に描かれたと考えられています。バンクシーのラットは、権威への反抗や社会的なメッセージを込めた象徴的なキャラクターとして知られています。この作品も、彼の特徴的なスタイルであるステンシル技法を用いて描かれており、都市の壁に突如現れることで通行人の注意を引きます。ラットは、しばしば社会の周縁に位置する存在として描かれ、バンクシー自身のアーティストとしての立場や、社会における「見えざる者」としての自己認識を反映しています。",
    url: "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/banksyratwork.jpeg",
    fromIG: false,
  },
  {
    id: 7,
    engName: "Yellow Lines Flower Painter",
    name: "黄色いラインの花を描く画家",
    address: "42-46 Pollard Row, London E2 6NB",
    lat: 51.5303456,
    lng: -0.0561633,
    description:
      "バンクシーが2007年にロンドン・ベスナル・グリーンのベスナル・グリーン・ワーキング・メンズ・クラブの壁に描いた作品です。この作品では、道路のダブルイエローラインが歩道を越えて壁に伸び、途中で大きな黄色い花に変わるというユニークな構図が特徴です。壁の前には、ペンキの缶に腰掛け、ローラーを持つ作業員が描かれており、都市の規制とその中での美の創造を象徴しています。作品は、バンクシーらしい社会的・政治的メッセージを含んでおり、都市空間における規制と創造性の対比を描いています。この作品は、長年にわたり多くの人々に愛されてきましたが、2019年に作品の一部が無断で壁から切り取られ、アメリカ・コロラド州アスペンのギャラリーに展示される事態となりました。これに対し、ベスナル・グリーン・ワーキング・メンズ・クラブの理事たちは、作品が不正に取り外され、販売されたとして、法的措置を取っています。",
    url: "https://www.instagram.com/p/DMhZa4qtTag/",
    fromIG: true,
  },
  {
    id: 8,
    engName: "Boy, Pigeon, Flowers",
    name: "少年、鳩、花",
    address: "165A Hoxton St, London N1 6PJ",
    lng: -0.0803822,
    lat: 51.5315,
    description:
      "この作品は、ロンドンのハックニー地区、ホクストン・ストリートに位置しています。2024年4月7日に報道デジタルによって公開された写真により、バンクシーの新作として注目を集めました。壁には、走る少年、花を持った鳩、そして花が描かれています。少年は花を持った鳩を追いかけるように走っており、作品は都市の監視社会と個人の自由、そして自然とのつながりをテーマにしていると解釈されています。",
    url: "https://www.instagram.com/p/DH8eoDTzLR0/?img_index=4",
    fromIG: true,
  },
  {
    id: 9,
    engName: "Tree",
    name: "ツリー",
    address: "390A Hornsey Rd, London N19 4HT",
    lng: -0.120431,
    lat: 51.565619,
    description:
      "2024年3月にホーンジー・ロードの集合住宅の壁に出現したバンクシーの作品。強剪定されて丸裸になった街路樹の背後に、緑の塗料を大胆に吹き付けて“失われた葉”を補う視覚的トリックを用いている。壁面には高圧洗浄機を持つ人物のステンシルも描かれ、彼／彼女が緑を生み出しているように見せる構成。都市の自然喪失や緑の管理への皮肉を込めたとされ、公開直後から注目を集めたが、その後一部が落書きで損傷し保護シートが施された。現在も現地で鑑賞可能で、バンクシーが環境問題や公共空間の意味を問いかける代表的な近年作の一つとなっている。",
    url: "https://www.instagram.com/p/C4p0mn7su0a/?hl=en&img_index=2",
    fromIG: true,
  },
  {
    id: 10,
    engName: "Pink Car",
    name: "ピンクの車",
    address: "6 Dray Walk, London E1 6NJ",
    lng: -0.07243,
    lat: 51.52104,
    description:
      "この作品は2004年頃、バンクシーがBrick Lane近くのTruman Brewery跡地に設置された古いTriumph GT6をピンク色に塗装し、運転席の窓には骸骨ドライバーのステンシルが描かれていたインスタレーション的アートです。突如として現れた“廃車”が街の風景とミスマッチを起こしながらも魅力的な存在となり、すぐに観光名所化しました。時間の経過と共に窓は破損され、骸骨の画像は木板で覆われたものの、現在も透明なパーセプスケースで保護された状態で現地に残っています。バンクシーとストリートアートが持つ一過性と保存のジレンマを象徴する作品です。",
    url: "https://www.instagram.com/p/Bu8LlVygqwv/",
    fromIG: true,
  },
  {
    id: 11,
    engName: "‘I Love Robbo’ Rat",
    name: "「ロボが好き」ネズミ",
    address: "38-42 Chiswell St, London EC1Y 4SB",
    lng: -0.0898305,
    lat: 51.520744,
    description:
      "このネズミは有名ストリートアーティストKing Robboへのリスペクト、あるいは皮肉として描かれています。バンクシーとRobboは過去にカムデンのリージェンツ運河沿いで互いの作品を塗り替える有名な争いを繰り広げていました。ネズミが掲げるプラカードのメッセージは、その複雑な関係性とストリートアート文化におけるユーモアを象徴しています。作品は現在も現地で確認できます。",
    url: "https://www.instagram.com/p/BmqPdS3nHAz/",
    fromIG: true,
  },
  {
    id: 12,
    engName: "Basquiat Tribute Mural 1",
    name: "バスキア・トリビュート壁画 1",
    address: "Golden Ln, Barbican, London EC2Y 8HD",
    lng: -0.09603,
    lat: 51.52246,
    description:
      "2017年9月17日、ロンドンのゴールデン・レーン沿いに現れたバンクシーの2点の壁画のうちの1つ。バスキアの1982年の作品『Boy and Dog in a Johnnypump』を基に、バスキアの象徴的な王冠を模した観覧車のチケット売り場を描いています。この作品は、バスキアのロンドンでの大規模回顧展『Basquiat: Boom for Real』の開催を前に、バンクシーがバスキアへの敬意を表して制作したものです。観覧車の車両部分にはバスキアの王冠が描かれ、バスキアの作品との関連性が強調されています。",
    url: "https://www.instagram.com/p/BZJELJiAmb5/",
    fromIG: true,
  },
  {
    id: 13,
    engName: "Basquiat Tribute Mural 2",
    name: "バスキア・トリビュート壁画 2",
    address: "Golden Ln, Barbican, London EC2Y 8HD",
    lng: -0.09603,
    lat: 51.52246,
    description:
      "2017年9月17日、ロンドンのゴールデン・レーン沿いに現れたバンクシーの2点の壁画のうちの1つ。バスキアの『Boy and Dog in a Johnnypump』の人物が、2人の警官によって身体検査を受けているシーンが描かれています。バスキアの作品の登場人物が警官によって取り押さえられている構図は、バスキアの作品にしばしば見られる権力への挑戦や社会的なメッセージを反映しています。バンクシーは自身のInstagramでこの作品を公開し、バスキアへの敬意を表しています。",
    url: "https://www.instagram.com/p/BZJGKelgSqg/?img_index=1",
    fromIG: true,
  },
  {
    id: 14,
    engName: "Guard Dog",
    name: "ガード・ドッグ",
    address: "83 Rivington St, London EC2A 3AY",
    lng: -0.079041,
    lat: 51.526082,
    description:
      "「Guard Dog」は2003年、ロンドン・ショーディッチのナイトクラブ「Cargo」の中庭に描かれたバンクシーの作品です。この作品では、警官とそのプードルが『指定されたグラフィティエリア』を巡回している様子が描かれており、権力と権威に対する強烈な風刺を含んでいます。警察の監視や秩序維持の象徴としての警官に対し、プードルという滑稽で従順なイメージを組み合わせることで、権力の滑稽さや皮肉を表現しています。また、背景の文字やサインは、バンクシーがしばしば用いるアイロニーを強調しており、見た目のユーモアとは裏腹に、都市空間における規制や監視社会に対する批評を込めています。この壁画はペルスペックスで保護され、長年にわたり保存状態が良好であるため、バンクシーの初期代表作として現地で鑑賞することが可能です。また、同じCargoの中庭には「His Master's Voice」と呼ばれる作品も並んでおり、両作品を通してバンクシーの若き頃の反権力的視点や都市文化への関わりを学ぶことができます。バンクシー作品としては珍しく、公共空間にありながら保護されている数少ない例であり、ストリートアートが如何にして保存されるかの実例とも言えます。",
    url: "https://www.instagram.com/p/DK4kOlZo9nK/",
    fromIG: true,
  },
];
const reversedBanksyArtworks = [...BANKSY_ARTWORKS].reverse();

export async function GET() {
  return NextResponse.json(reversedBanksyArtworks);
}

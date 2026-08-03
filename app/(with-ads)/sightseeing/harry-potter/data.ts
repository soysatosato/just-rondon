export type HPSection = {
  title: string;
  description: string | null;
};

export type HPActivity = {
  title: string;
  slug: string;
  summary: string | null;
  mainText: string | null;
  image: string | null;
  website: string | null;
  sections: HPSection[];
};

// 旧DB(Content, category: "harry-potter")の内容を、createdAt降順(旧fetchHPActivitiesと同じ表示順)で
// そのままハードコードしたもの。このカテゴリは更新運用が無いため静的化した。
export const hpActivities: HPActivity[] = [
  {
    title: "ワーナー・ブラザーズ スタジオツアー ロンドン",
    slug: "warner-bros-studio-tour-harry-potter",
    summary:
      "ハリーポッター映画の舞台裏を体験できる公式スタジオツアー。本物のセット・衣装・小道具を間近で見られるロンドン最強の魔法体験。",
    mainText: `
**ワーナー・ブラザーズ スタジオツアー ロンドン（The Making of Harry Potter）** は、ハリーポッターファンにとって「聖地」とも言える場所です。映画撮影のために実際に使われた巨大セットがそのまま保存され、ホグワーツの大広間、ダンブルドアの校長室、ダイアゴン横丁、禁じられた森、キングス・クロス駅の9と3/4番線など、映画の世界にそのまま足を踏み入れることができます。

スタジオ内には、衣装、魔法動物、魔法薬の小道具、そして特殊効果の解説など、映画制作の裏側を深く知る展示が豊富に揃っています。巨大なホグワーツ城のモデルの前では時間を忘れてしまうほど見入ってしまうでしょう。

また、季節限定の特別イベントも魅力です。ハロウィンには「Dark Arts」、春には「Magical Mischief」、冬には「Hogwarts in the Snow」が開催され、季節ごとに別の魔法体験が楽しめます。映画ファンでなくても十分に圧倒されるスケールで、ロンドン観光の目玉にふさわしいスポットです。
`,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f7/Entrance_of_Warner_Bros._Studio_Tour_London_%282025%29.jpg",
    website: null,
    sections: [],
  },
  {
    title: "ハリー・ポッターと呪いの子（舞台）",
    slug: "-",
    summary:
      "19年後のハリーたちを描く続編舞台。圧倒的演出と魔法のギミックで世界中のファンを魅了するロンドンの人気公演。",
    mainText: `
**「ハリー・ポッターと呪いの子」** は、原作最終巻から19年後の物語を描いた公式舞台作品です。ロンドンの歴史あるパレスシアターでロングラン上演されており、世界中からファンが訪れる人気演目となっています。

この作品の魅力は、舞台とは思えないほどの“魔法演出”。瞬間移動、燃え上がる炎、水・煙・光を使ったギミックなど、映画ではなく実際の舞台でどうやって実現しているのか不思議になるほど迫力ある演出が続きます。

物語はハリー、ロン、ハーマイオニーの子どもたちの世代が中心となり、家族、友情、呪いの連鎖といったテーマが描かれます。映画シリーズを見終えた後に観ると、感情が深く揺さぶられる構成です。

ロンドンでしか体験できない“魔法の舞台”として、ポッタリアンは必見です。

[ミュージカルの詳細はこちら](https://www.just-rondon.com/musicals/harry-potter-cursed-child)
`,
    image:
      "https://upload.wikimedia.org/wikipedia/en/8/87/Cursed_Child_new_poster.jpg",
    website: null,
    sections: [],
  },
  {
    title: "ハリー・ポッター ショップ（9と3/4番線）",
    slug: "harry-potter-shop-platform-934",
    summary:
      "キングス・クロス駅の“9と3/4番線”にある公式ショップ。トロリーのフォトスポットは行列必至。",
    mainText: `
**キングス・クロス駅の「9と3/4番線」** は、ハリーポッターの聖地として世界的に有名です。駅構内には、荷物トロリーが壁に吸い込まれていく象徴的なフォトスポットが設置されており、ファンが長蛇の列を作る人気スポットとなっています。

隣には公式ショップ **The Harry Potter Shop at Platform 9¾** があり、オリジナルの杖、ローブ、スカーフ、文具、レプリカアイテムなど、幅広い魔法グッズが揃います。店内の内装はオリバンダーの杖店を彷彿とさせ、見ているだけでも楽しい空間です。

ロンドン観光で必ず立ち寄りたい場所のひとつで、ショップの限定商品も多く、お土産選びに最適です。
`,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/6a/Platform9.75_-_2012.jpg",
    website: null,
    sections: [],
  },
  {
    title: "ダイアゴン横丁（レドンホール・マーケット）",
    slug: "leadenhall-market-london",
    summary:
      "レドンホール・マーケットはダイアゴン横丁の撮影地として有名。青い扉は漏れ鍋の入口。",
    mainText: `
**レドンホール・マーケット（Leadenhall Market）** は、映画『ハリー・ポッター』シリーズでダイアゴン横丁として登場するロケ地です。
ヴィクトリア時代のアーケードが美しく、石畳の道、ガス灯風の照明、色鮮やかな外観が映画の雰囲気にぴったりとマッチしています。

特にファンが訪れるのは、**Bull's Head Passage にある青い扉**。
映画で“漏れ鍋（Leaky Cauldron）”の入口として使用された場所で、今も多くのファンが写真を撮りに訪れます。

飲食店やショップも多いため、ロケ地巡りの途中で休憩するのにも最適なスポットです。
`,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/4/46/Leadenhall_Market_In_London_-_Feb_2006_rotated.jpg",
    website: null,
    sections: [],
  },
  {
    title: "ロンドン動物園・爬虫類館",
    slug: "london-zoo",
    summary:
      "ハリーが初めて蛇と会話した場所として有名なロケ地。実際の爬虫類たちも展示されている人気エリア。",
    mainText: `
**London Zoo の Reptile House（爬虫類館）** は、映画『ハリー・ポッターと賢者の石』でハリーが蛇と会話する象徴的なシーンが撮影された場所です。劇中でダドリーをガラスの中に閉じ込めるあのシーンを思い出しながら館内を歩くと、より深い映画体験ができます。

展示エリアには世界中の蛇、トカゲ、カメ、ワニなどが生息しており、それぞれの生態について学べる工夫がされています。特に大型の蛇は迫力があり、子どもから大人まで楽しめる内容です。

動物好きとハリポタ好きの双方に刺さる観光スポットで、ロンドン観光の定番ルートにも組み込みやすい場所にあります。
`,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/9/91/Snowdon_Aviary_at_London_Zoo%2C_England-16Aug2009.jpg",
    website: null,
    sections: [],
  },
  {
    title: "タワーブリッジ（映画ロケ地）",
    slug: "london-tower-bridge",
    summary:
      "ハリーがロンドンの空を飛ぶシーンに登場する橋。『不死鳥の騎士団』で重要なロケーションとなった。",
    mainText: `
**タワーブリッジ** は、映画『ハリー・ポッターと不死鳥の騎士団』で、ハリーがホウキに乗ってロンドンの上空を飛ぶシーンに登場します。テムズ川沿いの象徴的な景色は映画でも強く印象に残ります。

周辺にはミレニアムブリッジやランベス橋など、シリーズに登場する他の橋もあり、実際に歩いて回るだけで“ロケ地巡りコース”として成立します。

昼間の景色はもちろん、夕暮れ時のタワーブリッジは息を呑む美しさです。映画のファンでなくても感動するロンドンの代表的ランドマークで、ハリポタ巡礼にも欠かせないスポットです。
`,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/59/Tower_Bridge_at_Dawn.jpg",
    website: null,
    sections: [],
  },
  {
    title: "ハリー・ポッター像（レスタースクエア）",
    slug: "-",
    summary:
      "レスタースクエアの映画ヒーロー像のひとつ。ホグワーツ生時代のハリーが空を飛ぶ姿が見られる無料スポット。",
    mainText: `
**Scenes in the Square** は、ロンドンのレスタースクエアにある映画キャラクター像の展示エリアで、英国映画100年を記念して設置されました。その中でひときわ目を引くのが、**ホウキに乗ったハリー・ポッターの銅像**です。

この像は、ハリーが初めてクィディッチの試合に参加するシーンを再現しており、躍動感のある姿は写真映えも抜群。
無料で見学できるため、気軽に立ち寄れるスポットとして人気があります。

周辺には劇場・ショップ・レストランも多く、ロンドンの中心地で魔法を感じるにはぴったりの場所です。
`,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/04/Harry_Potter_sculpture_in_Leicester_Square_%2850725720988%29.jpg",
    website: null,
    sections: [],
  },
  {
    title: "セント・パンクラス駅（映画ロケ地）",
    slug: "-",
    summary:
      "ホグワーツ特急の発着シーンで使われた駅。ウィーズリー家の空飛ぶ車が離陸する印象的な場面の舞台。",
    mainText: `
**セント・パンクラス駅** は、映画でキングス・クロス駅の外観として使われたネオゴシック建築の美しい駅です。特に『秘密の部屋』では、ロンとハリーがウィーズリー家のフォード・アングリアで空へ飛び立つシーンが撮影されました。

赤レンガ造りの壮麗な建築は、写真を撮るだけでも十分価値があります。駅前の広場にはカフェや観光客向けの施設も多く、観光しやすい環境です。

近隣には実際のキングス・クロス駅もあるため、ハリポタロケ地をまとめて巡るのに最適なエリアです。
`,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/60/St_Pancras_Railway_Station_2012-06-23.jpg",
    website: null,
    sections: [],
  },
  {
    title: "ピカデリー・サーカス（映画ロケ地）",
    slug: "-",
    summary:
      "『死の秘宝』で3人が逃走中に駆け抜けるロケ地。ロンドン中心部の象徴で観光に組み込みやすい。",
    mainText: `
**ピカデリー・サーカス** は、『ハリー・ポッターと死の秘宝 PART1』で、ハリー・ロン・ハーマイオニーの3人が逃走しながら走り抜けるシーンに使われています。
ロンドンで最も賑やかな交差点のひとつで、巨大スクリーンとネオンライトが特徴的です。

観光地としても中心的存在で、近くには中華街、シアター、レストラン、ショップが密集しています。
映画のワンシーンを思い出しながら歩くと、ロンドンの街がより“魔法的”に感じられる場所です。
`,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f9/Open_Happiness_Piccadilly_Circus_Blue-Pink_Hour_120917-1126-jikatu.jpg",
    website: null,
    sections: [],
  },
  {
    title: "ウェストミンスター駅（映画ロケ地）",
    slug: "-",
    summary:
      "ハリーがアーサー・ウィーズリーと一緒に地下鉄を使うシーンの撮影地。1日閉鎖して撮影された。",
    mainText: `
**ウェストミンスター駅** は、『ハリー・ポッターと不死鳥の騎士団』で、ハリーがアーサー・ウィーズリーに地下鉄を案内される印象的なシーンの撮影地として使用されました。
普段は通勤客で賑わう駅ですが、撮影の際には丸一日閉鎖して映画用のセットとして使われたことで知られています。

近くにはビッグベンやウェストミンスター寺院などの名所があり、ロケ地巡りと観光を同時に楽しむことができます。
近代的で広々とした構造の駅内は、映画のワンカットを思い浮かべながら歩くだけでワクワクするスポットです。
`,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d6/Westminster_station_entrance_Portcullis_House.JPG",
    website: null,
    sections: [],
  },
  {
    title: "デ・ヴィア・ハウス（ゴドリックの谷の家）",
    slug: "-",
    summary:
      "ハリーの生家として映画に登場した建物。ロンドンから約2時間、村そのものが中世の世界のよう。",
    mainText: `
**デ・ヴィア・ハウス（De Vere House）** は、映画『ハリー・ポッターと死の秘宝 PART1』で主人公ハリーの生家「ゴドリックの谷」として登場した家です。
ロンドンから列車・車で約2時間、サフォークの美しい村ラヴェナム（Lavenham）に位置しています。

村全体が中世の面影を残しており、340以上の歴史的建築物が並ぶ“イギリスで最も美しい村のひとつ”とされています。
映画ではこの家が、ハリーの両親が命を落とした悲劇の象徴として登場し、多くのファンにとって特別な場所になりました。

現在、この家は **Airbnb で宿泊可能** で、魔法世界の雰囲気を存分に味わえる特別な体験ができます。
`,
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/deverehouse.jpeg",
    website: null,
    sections: [],
  },
  {
    title: "濡れ鍋（魔法のカクテル調合体験）",
    slug: "the-cauldron",
    summary:
      "魔法薬の授業のようにカクテルを作る没入型バー。杖を使って分子カクテルを調合するユニークな体験。",
    mainText: `
**The Cauldron（ザ・コルドロン）** は、まるで魔法薬学の授業に参加したかのような体験ができるユニークなバーです。店内は暗い森を思わせる幻想的な空間で、ゲストは“魔法使い見習い”として、杖を使いながら分子カクテルを調合していきます。

ウェルカムドリンクの「Poetic Mead」から始まり、指導役（Potion Master）が調合法を教えてくれます。煙が上がり、色が変わり、泡が弾けるなど、見た目にも楽しい反応が次々と起こるため、非日常感に浸れる魅力があります。

大人向けの体験ではありますが、魔法の世界への没入感はハリーポッターファンにも圧倒的な人気。友達同士やカップルにもおすすめです。
`,
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/claudron.jpeg",
    website: null,
    sections: [],
  },
];

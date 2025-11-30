// app/page.tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import Image from "next/image";

const highlightAttractions = [
  {
    title: "Warner Bros. Studio Tour London",
    subtitle: "舞台にもなったロケ地",
    description:
      "映画『ハリー・ポッター』の撮影セットをそのまま体験できるスタジオツアー。",
    slug: "warner-bros-studio-tour-harry-potter",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f7/Entrance_of_Warner_Bros._Studio_Tour_London_%282025%29.jpg",
  },
  {
    title: "ロンドン塔",
    subtitle: "世界遺産",
    description:
      "王冠ジュエルが展示されている、ロンドンを代表する世界遺産の塔。",
    slug: "tower-of-london",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f0/Tower_of_London_White_Tower.jpg",
  },
  {
    title: "London Eye",
    subtitle: "ロンドン旅の定番スポット",
    description:
      "テムズ川沿いにそびえる巨大観覧車。ロンドンの街並みを360°一望。",
    slug: "london-eye",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d6/London-Eye-2009.JPG",
  },
  {
    title: "The London Pass",
    subtitle: "ロンドン観光パス",
    description: "主要観光スポットの入場料がセットになったお得なシティパス。",
    slug: "the-london-pass",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/londonpass.jpeg",
  },
];

const mustSeeCategories = [
  {
    title: "ロンドン必見スポット厳選",
    description: "まず押さえておきたい代表的な観光名所を厳選。",
    slug: "must-see",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/must-see-bg.jpg",
  },
  {
    title: "ハリー・ポッターゆかりの地",
    description: "作品の舞台となったロケ地や関連アトラクションを巡る。",
    slug: "harry-potter",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/51/Harry_Potter_logo.svg",
  },
  {
    title: "王室ゆかりの観光地",
    description: "バッキンガム宮殿や王室ギャラリーなど英国王室の世界へ。",
    slug: "royal-london",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/royal-london-bg.jpeg",
  },
  {
    title: "子どもと楽しむロンドン",
    description: "家族旅行にぴったりな体験型スポットを紹介。",
    slug: "kids-free-activities",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/kids-free-activities-bg.jpeg",
  },
];

const seasonalAttractions = [
  {
    title: "クリスマスマーケット2025",
    description: "本物そっくりなセレブの蝋人形が150体以上勢ぞろい。",
    slug: "christmas-market",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/london-cm-bg.jpeg",
  },
  {
    title: "Chelsea Winter Village",
    description: "光のトンネルとマーケットが楽しめる冬季限定イベント。",
    slug: "chelsea-winter-village-2025",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/chelseawintervillage.jpeg",
    price: "£23.95〜",
  },
];

const royalAttractions = [
  {
    title: "Royal Observatory",
    description: "グリニッジ子午線で有名な天文台。",
    slug: "royal-observatory-greenwich",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/e/ef/Royal_observatory_Greenwich.JPG",
    price: "£24.00〜",
  },
  {
    title: "Kensington Palace",
    description: "ケイト妃ゆかりの宮殿。王室の暮らしを感じられる展示も。",
    slug: "kensington-palace",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/80/Kensington_Palace%2C_the_South_Front_-_geograph.org.uk_-_287402.jpg",
    price: "£24.70〜",
  },
  {
    title: "The King’s Gallery",
    description: "ロイヤルコレクションの名画が並ぶギャラリー。",
    slug: "kings-gallery-buckingham-palace",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/21/The_King%27s_Gallery_2024-06-27.jpg",
    price: "£19.00〜",
  },
  {
    title: "Hampton Court Palace",
    description: "ヘンリー8世ゆかりの宮殿。迷路庭園や歴史的な部屋が見どころ。",
    slug: "hampton-court-palace",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/b6/Tudor_Chimney_Pots_at_Hampton_Court_Palace_-_panoramio.jpg",
    price: "£28.00〜",
  },
];

const tours = [
  {
    title: "乗り降り自由バスツアー",
    description: "乗り降り自由の定番観光バス。主要スポットを効率よく巡れる。",
    slug: "hop-on-hop-off-bus-tour-london",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2c/YJ11TVA_TOOTBUS_Volvo_B9TL_with_East_Lancs_Visionaire_bodywork_%2852511927151%29.jpg",
    price: "£42.00〜",
    badge: "",
  },
  {
    title: "アフタヌーンティー・バスツアー",
    description: "ロンドン名物アフタヌーンティーを楽しみながら市内を周遊。",
    slug: "afternoon-tea-bus-london",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/afternoontea-bus-tour.jpeg",
    price: "£49.00〜",
    badge: "",
  },
  // {
  //   title: "テムズ川ボートツアー",
  //   description: "テムズ川から眺めるビッグ・ベンやタワーブリッジは格別。",
  //   slug: "",
  //   image: "",
  //   price: "目安 £20〜",
  //   badge: "",
  // },
  // {
  //   title: "The Total London Experience",
  //   description: "主要スポットを1日でまわる欲張りツアー。",
  //   slug: "",
  //   image: "",
  //   price: "£129.00〜",
  //   badge: "",
  // },
  // {
  //   title: "Christmas Lights Bus Tour",
  //   description:
  //     "冬季限定、ロンドン中心部のイルミネーションを巡るナイトツアー。",
  //   slug: "",
  //   image: "",

  //   price: "£26.00〜",
  //   badge: "",
  // },
  // {
  //   title: "London Stadium Tours",
  //   description: "プレミアリーグのスタジアム見学ツアーなどスポーツ好き向け。",
  //   slug: "",
  //   image: "",
  //   price: "£20.00〜（目安）",
  //   badge: "",
  // },
];

// const kidsAttractions = [
//   {
//     title: "Prehistoric Planet",
//     description: "恐竜の世界をテーマにした没入型アトラクション。",
//     slug: "",
//     image: "",
//     price: "£25.00〜",
//   },
//   {
//     title: "IFS Cloud Cable Car（ロンドン・ケーブルカー）",
//     description: "空中散歩でテムズ川を横断。子どもにも大人気。",
//     slug: "",
//     image: "",
//     price: "£13.00〜",
//   },
//   {
//     title: "Paradox Museum London",
//     description: "錯視やトリックアートで「脳が混乱する」体験型ミュージアム。",
//     slug: "",
//     image: "",
//     price: "£16.90〜",
//   },
//   {
//     title: "London Transport Museum",
//     description: "ロンドンのバスや地下鉄の歴史を楽しみながら学べる博物館。",
//     slug: "",
//     image: "",
//     price: "£24.50〜",
//   },
//   {
//     title: "The Paddington Bear Experience",
//     description: "パディントンの世界に入り込める体験型アトラクション。",
//     slug: "",
//     image: "",
//     price: "£34.00〜",
//   },
//   {
//     title: "Jurassic World: The Experience",
//     description: "映画『ジュラシック・ワールド』の世界を再現した没入型体験。",
//     slug: "",
//     image: "",
//     price: "£31.90〜",
//   },
// ];

const freeAttractions = [
  {
    title: "大英博物館",
    description: "ロゼッタストーンをはじめ、世界中の文化財が集まる巨大博物館。",
    slug: "british-museum",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/1/1b/British_Museum_from_NE_2_%28cropped%29.JPG",
  },
  {
    title: "ナショナル・ギャラリー",
    description:
      "英国を代表する美術館。ファン・ゴッホやターナーなど名画が多数展示されている。",
    slug: "national-gallery",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Galer%C3%ADa_Nacional%2C_Londres%2C_Inglaterra%2C_2014-08-07%2C_DD_036.JPG",
  },
  {
    title: "Tate Modern",
    description: "テムズ川沿いの発電所跡にある現代アート美術館。",
    slug: "tate-modern",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Tate_Modern_-_Bankside_Power_Station.jpg/1920px-Tate_Modern_-_Bankside_Power_Station.jpg",
  },
];

const faqItems = [
  {
    question: "ロンドンで絶対に行くべき観光地は？",
    answer: [
      "**ロンドン塔**：世界遺産にも登録されている中世の要塞で、王冠ジュエルの展示が有名。",
      "**ロンドン・アイ**：ヨーロッパ最大級の観覧車から、ロンドンのパノラマビューを楽しめる。",
      "**セント・ポール大聖堂**：巨大なドームが象徴の教会。上部のギャラリーから街を一望可能。",
      "**大英博物館**：古代エジプトやギリシャなど、人類史を網羅する世界最大級の博物館。",
      "**ハンプトン・コート宮殿**：ヘンリー8世ゆかりの宮殿で、庭園や迷路も人気。",
      "**バッキンガム宮殿**：英国王のロンドン公邸。夏季限定で内部一般公開や衛兵交代式が見どころ。",
      "**ビッグ・ベン**：国会議事堂に隣接する象徴的な時計台。限定日には内部見学ツアーも実施。",
    ],
  },
  {
    question: "ロンドンのどのエリアに観光スポットが多い？",
    answer: [
      "**北ロンドン**：ロンドン動物園やマダム・タッソー蝋人形館、大英図書館など。",
      "**東ロンドン**：O2アリーナの屋上クライムやケーブルカー、ジャック・ザ・リッパーのウォーキングツアー。",
      "**南ロンドン**：テート・ブリテン、シェイクスピアズ・グローブ座、カティーサーク号など歴史スポットが充実。",
      "**西ロンドン**：キュー・ガーデンズやケンジントン宮殿、自然史博物館などが集まるエリア。",
    ],
  },
  {
    question: "ロンドン旅行のおすすめ時期は？",
    answer: [
      "一年を通して比較的温暖で、いつ訪れても楽しめる都市。",
      "一般的には「5月」がベストシーズンとされ、日照時間が長く、気温も穏やかで観光しやすい。",
      "**春（3〜5月）**：花が咲き始め、公園散策にぴったり。",
      "**夏（6〜8月）**：日が長く、屋外イベントやルーフトップバーが充実。ただし観光客も多め。",
      "**秋（9〜11月）**：比較的穏やかな気候で、紅葉とともに落ち着いた雰囲気を楽しめる。",
      "**冬（12〜2月）**：イルミネーションやクリスマスマーケットなど、イベント重視の人におすすめ。",
    ],
  },
  {
    question: "ロンドン観光は何日あれば足りる？",
    answer: [
      "主要スポットだけを巡るなら2〜3日でも可能だが、博物館や近郊都市も含めてじっくり楽しむなら5〜7日がおすすめ。",
      "時間が限られている場合は、ホップオン・ホップオフバスやシティパスを活用すると効率的。",
    ],
  },
  {
    question: "ロンドンで最も訪問者数が多い観光地は？",
    answer: [
      "英国の観光業協会 ALVA の統計では、2024年のロンドンで最も訪問者数が多かったのは「大英博物館」で、年間約640万回以上の訪問があったとされている。",
    ],
  },
];

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="mx-auto max-w-6xl px-4 py-8 space-y-12">
        <section className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              London Sightseeing
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
              ロンドンには、世界的に有名な観光スポットがぎゅっと詰まっています。
              王室ゆかりの宮殿や歴史ある教会、最先端の展望台や体験型ミュージアムまで、
              初めてのロンドンでも、リピーターでも楽しめる見どころが目白押しです。
            </p>
            <p className="max-w-3xl text-xs leading-relaxed text-slate-500">
              ここでは、日本からの旅行者にも人気の「絶対に外せないスポット」を中心に、
              テーマ別にロンドンの見どころを整理して紹介します。
              多くの施設は事前予約制や日時指定チケット制なので、
              渡航前にオフィシャルサイトで最新情報を確認しておくと安心です。
            </p>
          </div>

          {/* メインの4カード */}
          <div className="grid gap-4 sm:grid-cols-2">
            {highlightAttractions.map((item, idx) => (
              <Link key={idx} href={`/sightseeing/${item.slug}`}>
                <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                  <div className="relative h-40 w-full">
                    <Image
                      src={item.image} // ← データに image プロパティを追加する
                      alt={item.title}
                      fill // 親要素いっぱいに広げる
                      className="object-cover" // よくある“カードのトップ画像”の見え方
                    />
                  </div>
                  <CardHeader className="space-y-1">
                    <p className="text-xs font-medium text-emerald-600">
                      {item.subtitle}
                    </p>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* ロンドン観光の概要テキスト */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">ロンドン観光の始め方</h2>
          <p className="max-w-4xl text-sm leading-relaxed text-slate-600">
            ロンドンの魅力は「歴史」と「今」が同時に存在していることです。
            タワー・オブ・ロンドンで中世の雰囲気を味わいつつ、
            ロンドン・アイからは近未来的なシティのビル群を見渡せます。
            ウェストミンスター寺院では英国の王室行事の舞台を見学し、
            バッキンガム宮殿では衛兵交代式を見守る——
            1日のうちに何世紀分もの時間旅行ができてしまうのがロンドンです。
          </p>
          <p className="max-w-4xl text-xs leading-relaxed text-slate-500">
            「何から回ればいいか分からない」という人は、
            まずは「必見スポット」と「シティパス」の情報を押さえ、
            1〜2日分のシンプルなモデルコースを作るのがおすすめです。
          </p>
        </section>

        {/* 必見スポットカテゴリ */}
        <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">ロンドン必見スポット</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              バッキンガム宮殿やビッグ・ベン、ロンドン・アイなど、
              「ロンドンらしさ」を感じる名所をテーマ別にチェックしましょう。
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {mustSeeCategories.map((item, idx) => (
              <Link key={idx} href={`/sightseeing/${item.slug}`}>
                <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                  <div className="relative h-40 w-full">
                    <Image
                      src={item.image} // ← データに image プロパティを追加する
                      alt={item.title}
                      fill // 親要素いっぱいに広げる
                      className="object-cover" // よくある“カードのトップ画像”の見え方
                    />
                  </div>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
          <Card className="border-dashed border-slate-300 bg-slate-50">
            <CardContent className="space-y-2 py-4 text-xs text-slate-600">
              <p className="font-semibold">
                Sightseeing pass（観光パス）をうまく使おう
              </p>
              <p>
                ロンドン・パスや他のシティパスを利用すると、
                人気アトラクションの入場料が最大50%程度節約できることもあります。
                自分の行きたい場所と比較しながら、もっともお得なパスを選びましょう。
              </p>
            </CardContent>
          </Card>
        </section>

        {/* 季節・人気アトラクション */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">季節イベント</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {seasonalAttractions.map((item, idx) => (
              <Link key={idx} href={`/sightseeing/${item.slug}`}>
                <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                  <div className="relative h-40 w-full">
                    <Image
                      src={item.image} // ← データに image プロパティを追加する
                      alt={item.title}
                      fill // 親要素いっぱいに広げる
                    />
                  </div>
                  <CardContent className="space-y-1 py-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-slate-600">{item.description}</p>
                    <p className="pt-1 text-xs font-medium text-slate-900">
                      From {item.price}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* カテゴリフィルタ風セクション */}
        <section className="space-y-4">
          {/* <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold">Explore by category</span>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-slate-900 px-3 py-1 text-white">
                All London
              </span>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
                Attractions
              </span>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
                Theme Park
              </span>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
                Bridge
              </span>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
                Architecture
              </span>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
                Boat
              </span>
              <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
                More categories
              </span>
            </div>
          </div> */}

          {/* 王室ゆかりのスポット */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">王室ゆかりのスポット</h3>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {royalAttractions.map((item, idx) => (
                <Link key={idx} href={`/sightseeing/${item.slug}`}>
                  <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                    <div className="relative h-40 w-full">
                      <Image
                        src={item.image} // ← データに image プロパティを追加する
                        alt={item.title}
                        fill // 親要素いっぱいに広げる
                        className="object-cover" // よくある“カードのトップ画像”の見え方
                      />
                    </div>
                    <CardContent className="space-y-1 py-2">
                      <p className="text-xs font-semibold">{item.title}</p>
                      <p className="text-[11px] text-slate-600">
                        {item.description}
                      </p>
                      <p className="text-[11px] font-medium text-slate-900">
                        From {item.price}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ツアー & リバークルーズ */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">見逃せないロンドンツアー</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {tours.map((item, idx) => (
              <Link key={idx} href={`/sightseeing/${item.slug}`}>
                <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                  <div className="relative h-40 w-full">
                    <Image
                      src={item.image} // ← データに image プロパティを追加する
                      alt={item.title}
                      fill // 親要素いっぱいに広げる
                      className="object-cover" // よくある“カードのトップ画像”の見え方
                    />
                  </div>
                  <CardContent className="space-y-1 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{item.title}</p>
                      {item.badge && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{item.description}</p>
                    <p className="pt-1 text-xs font-medium text-slate-900">
                      {item.price}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* <section className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">家族で楽しめるロンドン</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">
              子どもと一緒のロンドン旅行なら、体験型ミュージアムやアトラクションが充実したエリアを中心にホテルを選ぶと移動が楽になります。
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {kidsAttractions.map((item,idx) => (
              <Link href={`/sightseeing/${item.slug}`}>
                <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                  <div className="relative h-40 w-full">
                    <Image
                      src={item.image} // ← データに image プロパティを追加する
                      alt={item.title}
                      fill // 親要素いっぱいに広げる
                      className="object-cover" // よくある“カードのトップ画像”の見え方
                    />
                  </div>
                  <CardContent className="space-y-1 py-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-xs text-slate-600">{item.description}</p>
                    <p className="pt-1 text-xs font-medium text-slate-900">
                      From {item.price}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section> */}

        {/* 博物館 & アート */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">
            ロンドンの必見ミュージアム & アートギャラリー
          </h2>
          <p className="max-w-4xl text-sm text-slate-600">
            ロンドンの多くの国立博物館・美術館は入場無料（特別展は有料）で、
            コスパの面でも世界トップクラス。雨の日は「ミュージアムはしご」もおすすめです。
          </p>

          <div className="grid gap-4 md:grid-cols-3">
            {freeAttractions.map((item, idx) => (
              <Link key={idx} href={`/museums/${item.slug}`}>
                <Card className="overflow-hidden border-none shadow-sm cursor-pointer hover:shadow-md transition">
                  <div className="relative h-40 w-full">
                    <Image
                      src={item.image} // ← データに image プロパティを追加する
                      alt={item.title}
                      fill // 親要素いっぱいに広げる
                      className="object-cover" // よくある“カードのトップ画像”の見え方
                    />
                  </div>
                  <CardHeader className="space-y-1">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed">
                      {item.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="space-y-6">
          <h2 className="text-xl font-semibold">ロンドン観光 FAQ</h2>
          <div className="space-y-4">
            {faqItems.map((faq) => (
              <Card
                key={faq.question}
                className="border-none bg-white shadow-sm"
              >
                <CardHeader>
                  <CardTitle className="text-sm">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xs leading-relaxed text-slate-600">
                  {faq.answer.map((line) => (
                    <div key={line} className="flex gap-1">
                      <span className="shrink-0">・</span>
                      <div className="prose prose-slate max-w-none">
                        <ReactMarkdown>{line}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

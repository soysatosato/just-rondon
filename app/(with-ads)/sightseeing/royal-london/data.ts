export type RoyalActivity = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  mainText: string;
  image: string;
};

export const royalActivities: RoyalActivity[] = [
  {
    slug: "hampton-court-palace",
    title: "ハンプトン・コート宮殿",
    engTitle: "Hampton Court Palace",
    summary:
      "ヘンリー8世と6人の王妃たちが暮らした宮殿。チューダー朝とステュアート朝の歴史、庭園や迷路も楽しめる。",
    mainText:
      "**ハンプトン・コート宮殿**は、ヘンリー8世とその6人の王妃で知られる、英国史の“ドラマ現場”ともいえる宮殿です。チューダー朝とステュアート朝の建築やインテリアが残されており、歴史に興味がある人にはたまらないスポット。\n\n敷地は広大で、**チャペル、グレートホール、庭園、メイズ（迷路庭園）** など見どころが満載。家族連れにも人気が高く、歴史好きから庭園目当ての旅行者まで幅広い層に愛されています。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/b6/Tudor_Chimney_Pots_at_Hampton_Court_Palace_-_panoramio.jpg",
  },
  {
    slug: "kensington-palace",
    title: "ケンジントン宮殿",
    engTitle: "Kensington Palace",
    summary:
      "かつてダイアナ元妃が暮らし、現在も若い王族が居住する宮殿。ヴィクトリア女王誕生の地としても有名。",
    mainText:
      "**ケンジントン宮殿**は、長年にわたり若い王族たちが暮らしてきた“ロイヤルファミリーの家”ともいえる場所です。かつてはダイアナ元妃が暮らし、ウィリアム王子とキャサリン妃もここを公式住居として使用していました。\n\nこの宮殿は**ヴィクトリア女王の生誕地**としても知られ、彼女が誕生し育った部屋を見学することができます。また、国王や貴族たちが謁見や会合に使った**キングズ・ステート・アパートメント**など、王室の日常と政治の舞台に触れられる空間も見どころです。庭園も美しく、屋外散策も楽しめます。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/cb/St_Pauls_aerial_%28cropped%29.jpg",
  },
  {
    slug: "kings-gallery-buckingham-palace",
    title: "キングズ・ギャラリー（バッキンガム宮殿）",
    engTitle: "The King’s Gallery at Buckingham Palace",
    summary:
      "王室コレクションの名画や家具、工芸品を鑑賞できるバッキンガム宮殿併設のギャラリー。年間を通して特別展も開催。",
    mainText:
      "**キングズ・ギャラリー**は、バッキンガム宮殿に併設されたアートギャラリーで、世界的にも貴重な王室コレクションを展示しています。絵画、家具、装飾品など、各時代の王室文化を象徴する品々を間近で見ることができます。\n\n毎年テーマの異なる**特別展**が開催され、同じギャラリーでも訪れる時期によってまったく違う表情を見せてくれるのも魅力。入場券には通常、開催中の展示がすべて含まれます。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/21/The_King%27s_Gallery_2024-06-27.jpg",
  },
  {
    slug: "royal-mews",
    title: "ロイヤル・ミューズ（バッキンガム宮殿）",
    engTitle: "The Royal Mews at Buckingham Palace",
    summary:
      "王室の馬車・車両・厩舎を管理する施設。ゴールドステートコーチなど歴史的な馬車を間近で見られる。",
    mainText:
      "**ロイヤル・ミューズ**は、バッキンガム宮殿の“足”を支える重要な施設で、王室の馬車や車両、馬を管理するワーキングステーブルです。戴冠式などで使用される**ゴールド・ステート・コーチ**や、エリザベス女王のダイヤモンド・ジュビリーを記念して作られたコーチなど、歴史的価値の高い馬車を間近で見ることができます。\n\n見学では、実際に馬車の内部を体験できる展示もあり、子どもから大人まで楽しめる内容になっています。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/a/a5/The_Royal_Mews_%28geograph_2321013%29.jpg",
  },
  {
    slug: "buckingham-palace",
    title: "バッキンガム宮殿 ステートルーム",
    engTitle: "Buckingham Palace",
    summary:
      "夏季限定で一般公開される、バッキンガム宮殿の公式行事用の部屋。玉座の間やボールルームは圧巻。",
    mainText:
      "**バッキンガム宮殿 ステートルーム**は、国王が公式行事や晩餐会を行うための豪華な部屋で、通常は夏の期間限定で一般公開されます。玉座の間（Throne Room）、ボールルーム、ミュージックルーム、ホワイト・ドローイングルームなど、テレビや写真で見たことのある“王室の舞台裏”に足を踏み入れることができます。\n\n見学は基本的に**セルフガイド形式**で、自分のペースで空間を堪能できるのも魅力のひとつです。",
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Buckingham_Palace_UK.jpg",
  },
  {
    slug: "changing-the-guard-buckingham-palace",
    title: "衛兵交代式（バッキンガム宮殿）",
    engTitle: "Changing of the Guard Ceremony",
    summary:
      "バッキンガム宮殿前で行われる王室警護の交代儀式。軍楽隊の生演奏とともに行進する、ロンドン観光のハイライト。",
    mainText:
      "**衛兵交代式**は、バッキンガム宮殿の前で行われる、王室警護の兵士たちの交代儀式です。現在の衛兵から新しい衛兵へと任務が引き継がれる様子が、**軍楽隊の生演奏**とともに行進形式で披露されます。\n\n観光客にとっては“無料で楽しめる王室ショー”とも言える存在で、ロンドン初訪問の人には特におすすめ。とても人気があるため、良い場所から見たい場合は早めに到着するのがポイントです。",
    image:
      "https://vuovopzkzwmgvlxjtykw.supabase.co/storage/v1/object/public/londonnn/Changing%20of%20the%20Guard.jpeg",
  },
  {
    slug: "madame-tussauds-london",
    title: "マダム・タッソー館（ロンドン）",
    engTitle: "Madame Tussauds London",
    summary:
      "王室メンバーを含むセレブの等身大フィギュアが並ぶ有名ワックスミュージアム。王族“勢ぞろい”の写真が撮れる。",
    mainText:
      "**マダム・タッソー館 ロンドン**では、王室メンバーをはじめ、世界中のセレブや歴史上の人物の等身大ワックスフィギュアが展示されています。エリザベス女王は長年にわたり多くの像が制作されており、ウィリアム王子とキャサリン妃の婚約ポーズ、チャールズ国王とカミラ王妃の像など、ロイヤル勢が充実しています。\n\n実際の王室メンバーに会う機会はなかなかありませんが、ここなら**“ロイヤル集合写真”**を撮ることができます。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2f/WaxMuseumMadameTussaudsLondon.JPG",
  },
  {
    slug: "household-cavalry-museum",
    title: "ホースガーズ・博物館（ホースホールド・キャバルリー・ミュージアム）",
    engTitle: "Household Cavalry Museum",
    summary:
      "国王を護衛する近衛騎兵と王室との関係を学べる“現役”博物館。キングズ・ライフガードの交代式も必見。",
    mainText:
      "**Household Cavalry Museum** は、王室を護衛するエリート騎兵部隊と王室との関係を紹介するユニークな博物館です。実際に兵士たちが働いている厩舎をガラス越しに見ることができる、“現役のミュージアム”である点が大きな特徴です。\n\nホースガーズ・パレード前では、バッキンガム宮殿の衛兵交代式の“別バージョン”とも言える **King’s Life Guard の交代式** が行われ、こちらも見応えがあります。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Household_Cavalry_Museum_-_Joy_of_Museums.jpg/2560px-Household_Cavalry_Museum_-_Joy_of_Museums.jpg",
  },
  {
    slug: "westminster-abbey",
    title: "ウェストミンスター寺院",
    engTitle: "Westminster Abbey",
    summary:
      "戴冠式・国葬・王室結婚式の舞台となる歴史的寺院。英国王室の歴史と切り離せない場所。",
    mainText:
      "**ウェストミンスター寺院**は、1066年以来、すべての戴冠式が行われてきた歴史的な寺院です。王室の結婚式や国葬もたびたび行われており、近年ではウィリアム王子とキャサリン妃の結婚式、エリザベス2世の国葬の舞台となりました。\n\n寺院内部には王や女王、著名人の墓所や記念碑が並び、英国の歴史と文化が凝縮されています。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/7/70/November_2019_in_London_-_44.jpg",
  },
  {
    slug: "kew-palace",
    title: "キュー・パレス（キュー・ガーデンズ内）",
    engTitle: "Kew Palace",
    summary:
      "キュー・ガーデンズ内にある小さな王宮。ジョージ3世とシャーロット王妃の“郊外の隠れ家”的な住まい。",
    mainText:
      "**キュー・パレス**は、世界的に有名な植物園である**キュー・ガーデンズ**内に位置する、最も小さな王宮です。ジョージ3世とシャーロット王妃の住居として使われ、のちの君主たちにとっても“週末の息抜き”として利用された場所とされています。\n\n宮殿への入場は、基本的にキュー・ガーデンズの入場券に含まれており、庭園散策と合わせて楽しめるのが魅力です。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d1/Kew_Gardens_Palm_House%2C_London_-_July_2009.jpg",
  },
  {
    slug: "st-pauls-cathedral",
    title: "セント・ポール大聖堂",
    engTitle: "St Paul’s Cathedral",
    summary:
      "ダイアナ元妃とチャールズ皇太子の結婚式の舞台。王室の記念礼拝でも使われる壮大な大聖堂。",
    mainText:
      "**セント・ポール大聖堂**は、ロンドンを代表するランドマークのひとつで、ドーム型の屋根が印象的な大聖堂です。1981年にはチャールズ皇太子とダイアナ元妃の結婚式がここで行われ、多くの人にとって“テレビ越しに見た王室の舞台”として記憶されています。\n\nエリザベス2世のシルバー・ゴールデン・ダイヤモンド・プラチナジュビリーの記念礼拝も行われており、現代に至るまで王室との関わりが続いている重要な場所です。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/cb/St_Pauls_aerial_%28cropped%29.jpg",
  },
  {
    slug: "hyde-park-london",
    title: "ロイヤル・パーク（王立公園）",
    engTitle: "Royal Parks",
    summary:
      "ハイドパークやリッチモンド・パークなど、王室所有の広大な公園群。市民に開放された貴重なグリーンスペース。",
    mainText:
      "**ロイヤル・パーク**は、王室が所有する広大な都市公園で、ロンドン市民にも開放されている貴重な緑地です。代表的な公園には、**ハイド・パーク、リージェンツ・パーク、リッチモンド・パーク、セント・ジェームズ・パーク**などがあります。\n\nピクニック、ランニング、ボート遊び、野生動物の観察など、楽しみ方はさまざま。晴れた日に王室ゆかりのオープンスペースでのんびり過ごすのは、ロンドンならではの贅沢な時間です。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f3/Hyde_Park_London_from_the_air.jpg",
  },
  {
    slug: "windsor-castle",
    title: "ウィンザー城",
    engTitle: "Windsor Castle",
    summary:
      "ロンドン郊外にある国王の公邸のひとつ。聖ジョージ礼拝堂にはエリザベス女王とフィリップ殿下が眠る、英国王室ゆかりの城。",
    mainText:
      "**ウィンザー城**は、ロンドン中心部から少し離れたバークシャー州に位置する、国王の公式居住地のひとつです。敷地内には、エリザベス2世とフィリップ殿下が葬られた**セント・ジョージ礼拝堂（St George’s Chapel）** があり、王室ファンにとっては特別な場所となっています。\n\n訪問者は、豪華なステートルームや礼拝堂、城の外観と周囲の城下町の雰囲気を楽しむことができます。ロンドンから日帰りで行ける距離ですが、**「ロンドン観光＋小旅行」** という感覚で組み合わせると満足度が高いスポットです。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/58/Windsor_Castle_Upper_Ward_Quadrangle_Corrected_2-_Nov_2006.jpg",
  },
  {
    slug: "tower-of-london",
    title: "ロンドン塔",
    engTitle: "The Tower of London",
    summary:
      "1000年以上の歴史を持つ要塞兼王宮。王冠や宝飾品が収められたクラウン・ジュエルズと“ビーフィーター”で有名。",
    mainText:
      "**ロンドン塔**は、約1000年の歴史を持つ要塞兼王宮であり、英国史の明暗が詰まった場所です。現在は観光地として開放されており、**クラウン・ジュエルズ（Crown Jewels）** と呼ばれる戴冠式などで使われる王冠や宝飾品を見学できます。\n\n敷地内には、王室の護衛として知られる**イェオマン・ウォーダーズ（通称ビーフィーター）**が常駐しており、彼らによるガイドツアーは人気コンテンツのひとつ。中世の王や女王が暮らした**中世宮殿エリア**や、王室の武具を展示するアーマリーなど、見どころが多く、一日じっくり楽しめるロイヤルスポットです。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f0/Tower_of_London_White_Tower.jpg",
  },
  {
    slug: "banqueting-house-london",
    title: "バンケット・ハウス",
    engTitle: "Banqueting House",
    summary:
      "チャールズ1世が処刑された場所として知られる歴史的建物。ルーベンスによる天井画も必見。",
    mainText:
      "**バンケット・ハウス**は、ロンドン中心部ホワイトホールにある歴史的な建物で、1649年にチャールズ1世が処刑された場所として知られています。現在は**Historic Royal Palaces**の一部として運営されており、内部には画家ルーベンスによる見事な天井画が残されています。\n\n他の王宮と比べるとややマニアックなスポットですが、英国史と美術が好きな人にはたまらない“通好みのロイヤルスポット”です。",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/14/Banqueting_House_London.jpg",
  },
];

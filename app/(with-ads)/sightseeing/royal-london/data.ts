export type RoyalActivity = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  mainText: string;
  image: string;
  /** Commons の作者とライセンス。カードの写真の下に出す。 */
  imageCredit?: string | null;
  imageLink?: string | null;
};

export const royalActivities: RoyalActivity[] = [
  {
    slug: "hampton-court-palace",
    title: "ハンプトン・コート宮殿",
    engTitle: "Hampton Court Palace",
    summary:
      "ヘンリー8世と6人の王妃たちが暮らした宮殿。チューダー朝とステュアート朝の建物が残り、庭園と迷路もある。",
    mainText:
      "**ハンプトン・コート宮殿**は、ヘンリー8世とその6人の王妃で知られる宮殿です。チューダー朝とステュアート朝の建築と内装が残っています。\n\n敷地には**チャペル、グレートホール、庭園、メイズ（迷路庭園）** があります。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Tudor_Chimney_Pots_at_Hampton_Court_Palace_-_panoramio.jpg/960px-Tudor_Chimney_Pots_at_Hampton_Court_Palace_-_panoramio.jpg",
    imageCredit: "Maxwell Hamilton / CC BY-SA 3.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:Tudor_Chimney_Pots_at_Hampton_Court_Palace_-_panoramio.jpg",
  },
  {
    slug: "kensington-palace",
    title: "ケンジントン宮殿",
    engTitle: "Kensington Palace",
    summary:
      "かつてダイアナ元妃が暮らし、現在も若い王族が居住する宮殿。ヴィクトリア女王誕生の地としても有名。",
    mainText:
      "**ケンジントン宮殿**は、長年にわたり若い王族たちが暮らしてきた宮殿です。かつてはダイアナ元妃が暮らし、ウィリアム王子とキャサリン妃もここを公式住居として使用していました。\n\nこの宮殿は**ヴィクトリア女王の生誕地**としても知られ、彼女が誕生し育った部屋を見学することができます。また、国王や貴族たちが謁見や会合に使った**キングズ・ステート・アパートメント**も公開されています。宮殿の外には庭園があります。",
    // 以前はセント・ポール大聖堂の空撮が入っていた(取り違え)。
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Palacio_de_Kensington%2C_Londres%2C_Inglaterra%2C_2022-11-25%2C_DD_29.jpg/1280px-Palacio_de_Kensington%2C_Londres%2C_Inglaterra%2C_2022-11-25%2C_DD_29.jpg",
    imageCredit: "Diego Delso / CC BY-SA 4.0, via Wikimedia Commons",
    imageLink:
      "https://commons.wikimedia.org/wiki/File:Palacio_de_Kensington,_Londres,_Inglaterra,_2022-11-25,_DD_29.jpg",
  },
  {
    slug: "kings-gallery-buckingham-palace",
    title: "キングズ・ギャラリー（バッキンガム宮殿）",
    engTitle: "The King’s Gallery at Buckingham Palace",
    summary:
      "王室コレクションの名画や家具、工芸品を鑑賞できるバッキンガム宮殿併設のギャラリー。年間を通して特別展も開催。",
    mainText:
      "**キングズ・ギャラリー**は、バッキンガム宮殿に併設されたアートギャラリーで、王室コレクションの絵画、家具、装飾品を展示しています。\n\n展示は毎年テーマを変えた**特別展**で、訪れる時期によって中身が変わります。入場券には通常、開催中の展示がすべて含まれます。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/The_King%27s_Gallery_2024-06-27.jpg/1280px-The_King%27s_Gallery_2024-06-27.jpg",
    imageCredit: "Matt Brown / CC BY 2.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:The_King%27s_Gallery_2024-06-27.jpg",
  },
  {
    slug: "royal-mews",
    title: "ロイヤル・ミューズ（バッキンガム宮殿）",
    engTitle: "The Royal Mews at Buckingham Palace",
    summary:
      "王室の馬車・車両・厩舎を管理する施設。ゴールドステートコーチなど歴史的な馬車を間近で見られる。",
    mainText:
      "**ロイヤル・ミューズ**は、王室の馬車や車両、馬を管理するバッキンガム宮殿の厩舎で、今も使われています。戴冠式などで使用される**ゴールド・ステート・コーチ**や、エリザベス女王のダイヤモンド・ジュビリーを記念して作られたコーチなど、歴史的な馬車を間近で見られます。\n\n馬車の内部を体験できる展示もあります。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/a/a5/The_Royal_Mews_%28geograph_2321013%29.jpg",
    imageCredit: "Thomas Nugent / CC BY-SA 2.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:The_Royal_Mews_(geograph_2321013).jpg",
  },
  {
    slug: "buckingham-palace",
    title: "バッキンガム宮殿 ステートルーム",
    engTitle: "Buckingham Palace",
    summary:
      "夏季限定で一般公開される、バッキンガム宮殿の公式行事用の部屋。玉座の間やボールルームを見学できる。",
    mainText:
      "**バッキンガム宮殿 ステートルーム**は、国王が公式行事や晩餐会に使う部屋で、通常は夏の期間限定で一般公開されます。玉座の間（Throne Room）、ボールルーム、ミュージックルーム、ホワイト・ドローイングルームなどに入れます。\n\n見学は基本的に**セルフガイド形式**です。",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Buckingham_Palace_UK.jpg/1280px-Buckingham_Palace_UK.jpg",
    imageCredit: "Chiugoran / CC BY-SA 3.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:Buckingham_Palace_UK.jpg",
  },
  {
    slug: "changing-the-guard-buckingham-palace",
    title: "衛兵交代式（バッキンガム宮殿）",
    engTitle: "Changing of the Guard Ceremony",
    summary:
      "バッキンガム宮殿前で行われる王室警護の交代儀式。軍楽隊の生演奏とともに行進する。見学は無料。",
    mainText:
      "**衛兵交代式**は、バッキンガム宮殿の前で行われる、王室警護の兵士たちの交代儀式です。現在の衛兵から新しい衛兵へと任務が引き継がれる様子が、**軍楽隊の生演奏**とともに行進形式で披露されます。\n\n見学は無料です。宮殿前は混むので、前のほうで見たいなら早めに着いてください。",
    // 以前は出どころの記録が無い宣伝用の写真(消えた旧ストレージを指していて表示もされていなかった)。
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Band_of_the_Welsh_Guards%2C_Buckingham_Palace%2C_London_-_Diliff.jpg/1280px-Band_of_the_Welsh_Guards%2C_Buckingham_Palace%2C_London_-_Diliff.jpg",
    imageCredit: "Diliff / CC BY-SA 3.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:Band_of_the_Welsh_Guards,_Buckingham_Palace,_London_-_Diliff.jpg",
  },
  {
    slug: "madame-tussauds-london",
    title: "マダム・タッソー館（ロンドン）",
    engTitle: "Madame Tussauds London",
    summary:
      "王室メンバーを含む有名人の等身大の蝋人形が並ぶ館。王室の像と並んで写真が撮れる。",
    mainText:
      "**マダム・タッソー館 ロンドン**では、王室メンバーをはじめ、世界中のセレブや歴史上の人物の等身大ワックスフィギュアが展示されています。エリザベス女王は長年にわたり多くの像が制作されており、ウィリアム王子とキャサリン妃の婚約ポーズ、チャールズ国王とカミラ王妃の像など、王室の像が多く並びます。\n\n王室の像と並んで写真を撮れます。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/WaxMuseumMadameTussaudsLondon.JPG/1280px-WaxMuseumMadameTussaudsLondon.JPG",
    imageCredit: "self-made / CC BY-SA 3.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:WaxMuseumMadameTussaudsLondon.JPG",
  },
  {
    slug: "household-cavalry-museum",
    title: "ホースガーズ・博物館（ホースホールド・キャバルリー・ミュージアム）",
    engTitle: "Household Cavalry Museum",
    summary:
      "国王を護衛する近衛騎兵と王室との関係を紹介する博物館。厩舎は現役で、建物の前ではキングズ・ライフガードの交代式がある。",
    mainText:
      "**Household Cavalry Museum** は、王室を護衛する騎兵部隊と王室との関係を紹介する博物館です。兵士たちが実際に働いている厩舎を、ガラス越しに見られます。\n\nホースガーズ・パレード前では、騎兵による **King’s Life Guard の交代式** が行われます。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Household_Cavalry_Museum_-_Joy_of_Museums.jpg/1280px-Household_Cavalry_Museum_-_Joy_of_Museums.jpg",
    imageCredit: "Joyofmuseums / CC BY-SA 4.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:Household_Cavalry_Museum_-_Joy_of_Museums.jpg",
  },
  {
    slug: "westminster-abbey",
    title: "ウェストミンスター寺院",
    engTitle: "Westminster Abbey",
    summary:
      "戴冠式・国葬・王室結婚式が行われてきた寺院。",
    mainText:
      "**ウェストミンスター寺院**は、1066年以来、すべての戴冠式が行われてきた歴史的な寺院です。王室の結婚式や国葬もたびたび行われており、近年ではウィリアム王子とキャサリン妃の結婚式、エリザベス2世の国葬の舞台となりました。\n\n寺院内部には王や女王、著名人の墓所や記念碑が並びます。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/November_2019_in_London_-_44.jpg/1280px-November_2019_in_London_-_44.jpg",
    imageCredit: "Thomas Dahlstrøm Nielsen / CC BY-SA 4.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:November_2019_in_London_-_44.jpg",
  },
  {
    slug: "kew-palace",
    title: "キュー・パレス（キュー・ガーデンズ内）",
    engTitle: "Kew Palace",
    summary:
      "キュー・ガーデンズ内にある小さな王宮。ジョージ3世とシャーロット王妃が住んだ。",
    mainText:
      "**キュー・パレス**は、植物園の**キュー・ガーデンズ**内にある、最も小さな王宮です。ジョージ3世とシャーロット王妃の住居として使われ、のちの君主たちにとっても“週末の息抜き”として利用された場所とされています。\n\n宮殿への入場は、基本的にキュー・ガーデンズの入場券に含まれています。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Kew_Gardens_Palm_House%2C_London_-_July_2009.jpg/1280px-Kew_Gardens_Palm_House%2C_London_-_July_2009.jpg",
    imageCredit: "Diliff / CC BY-SA 3.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:Kew_Gardens_Palm_House,_London_-_July_2009.jpg",
  },
  {
    slug: "st-pauls-cathedral",
    title: "セント・ポール大聖堂",
    engTitle: "St Paul’s Cathedral",
    summary:
      "ダイアナ元妃とチャールズ皇太子が結婚式を挙げた大聖堂。王室の記念礼拝にも使われる。",
    mainText:
      "**セント・ポール大聖堂**は、ドーム屋根の大聖堂です。1981年にはチャールズ皇太子とダイアナ元妃の結婚式がここで行われました。\n\nエリザベス2世のシルバー・ゴールデン・ダイヤモンド・プラチナジュビリーの記念礼拝も、ここで行われています。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/St_Pauls_aerial_%28cropped%29.jpg/1280px-St_Pauls_aerial_%28cropped%29.jpg",
    imageCredit: "Mark Fosh / CC BY 2.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:St_Pauls_aerial_(cropped).jpg",
  },
  {
    slug: "hyde-park-london",
    title: "ロイヤル・パーク（王立公園）",
    engTitle: "Royal Parks",
    summary:
      "ハイドパークやリッチモンド・パークなど、王室が所有し、一般に開放されている公園。",
    mainText:
      "**ロイヤル・パーク**は、王室が所有し、一般に開放されている公園です。代表的な公園には、**ハイド・パーク、リージェンツ・パーク、リッチモンド・パーク、セント・ジェームズ・パーク**などがあります。\n\nピクニック、ランニング、ボート遊び、野生動物の観察に使われています。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Hyde_Park_London_from_the_air.jpg/1280px-Hyde_Park_London_from_the_air.jpg",
    imageCredit: "@LondonNPC #NationalParkCity / CC BY 2.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:Hyde_Park_London_from_the_air.jpg",
  },
  {
    slug: "windsor-castle",
    title: "ウィンザー城",
    engTitle: "Windsor Castle",
    summary:
      "ロンドン郊外にある国王の公邸のひとつ。聖ジョージ礼拝堂にはエリザベス女王とフィリップ殿下が眠る、英国王室ゆかりの城。",
    mainText:
      "**ウィンザー城**は、ロンドン中心部から少し離れたバークシャー州に位置する、国王の公式居住地のひとつです。敷地内には、エリザベス2世とフィリップ殿下が葬られた**セント・ジョージ礼拝堂（St George’s Chapel）** があります。\n\n見学できるのはステートルームと礼拝堂です。ロンドンから日帰りで行けます（行き方は[ウィンザーへの日帰り](/beyond-london/windsor)）。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Windsor_Castle_Upper_Ward_Quadrangle_Corrected_2-_Nov_2006.jpg/1280px-Windsor_Castle_Upper_Ward_Quadrangle_Corrected_2-_Nov_2006.jpg",
    imageCredit: "Diliff / CC BY 2.5, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:Windsor_Castle_Upper_Ward_Quadrangle_Corrected_2-_Nov_2006.jpg",
  },
  {
    slug: "tower-of-london",
    title: "ロンドン塔",
    engTitle: "The Tower of London",
    summary:
      "1000年以上の歴史を持つ要塞兼王宮。王冠や宝飾品が収められたクラウン・ジュエルズと“ビーフィーター”で有名。",
    mainText:
      "**ロンドン塔**は、約1000年の歴史を持つ要塞兼王宮です。現在は観光地として開放されており、**クラウン・ジュエルズ（Crown Jewels）** と呼ばれる戴冠式などで使われる王冠や宝飾品を見学できます。\n\n敷地内には、王室の護衛として知られる**イェオマン・ウォーダーズ（通称ビーフィーター）**が常駐していて、彼らによるガイドツアーがあります。中世の王や女王が暮らした**中世宮殿エリア**や、王室の武具を展示するアーマリーもあります。",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Tower_of_London_White_Tower.jpg/1280px-Tower_of_London_White_Tower.jpg",
    imageCredit: "Bernard Gagnon / CC BY-SA 3.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:Tower_of_London_White_Tower.jpg",
  },
  {
    slug: "banqueting-house-london",
    title: "バンケット・ハウス",
    engTitle: "Banqueting House",
    summary:
      "チャールズ1世が処刑された場所として知られる建物。ルーベンスの天井画が残る。",
    mainText:
      "**バンケット・ハウス**は、ロンドン中心部ホワイトホールにある歴史的な建物で、1649年にチャールズ1世が処刑された場所として知られています。現在は**Historic Royal Palaces**の一部として運営されており、内部には画家ルーベンスの天井画が残っています。",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/14/Banqueting_House_London.jpg",
    imageCredit: "en:User:ChrisO / CC BY-SA 3.0, via Wikimedia Commons",
    imageLink: "https://commons.wikimedia.org/wiki/File:Banqueting_House_London.jpg",
  },
];

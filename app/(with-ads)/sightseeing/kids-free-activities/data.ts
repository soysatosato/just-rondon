export type KidsFreeActivity = {
  slug: string;
  title: string;
  engTitle: string;
  summary: string;
  mainText: string;
};

// 「ロンドンで子どもと楽しむ無料スポットBEST 10」の静的コンテンツ。
// 元は Content モデル（category: "free-london-kids"）から取得していたが、
// 更新運用がなく内容がほぼ固定のため、コード上にハードコードして管理する。
export const kidsFreeActivities: KidsFreeActivity[] = [
  {
    slug: "corams-fields",
    title: "コーラムズ・フィールズ",
    engTitle: "Coram’s Fields",
    summary: "子どものための7エーカー公園。遊具・水遊びエリア・ミニ動物園つき。",
    mainText:
      "**Coram’s Fields** は、7エーカーある子ども専用の公園です。遊具、砂場、夏の水遊び場、小さなファームがあります。大人だけでは入れず、子ども同伴でないと入場できません。ロンドン中心部にあり、無料です。",
  },
  {
    slug: "golders-hill-park-zoo",
    title: "ゴールダーズ・ヒル・パーク動物園",
    engTitle: "Golders Hill Park Zoo",
    summary: "ハムステッド・ヒース近くにある無料の小さな動物園。ワラビーやレムールがいる。",
    mainText:
      "ハムステッド・ヒースに隣接する**ゴールダーズ・ヒル・パーク動物園**は、無料で入れる小さな動物園です。ワラビー、レムール、スコティッシュワイルドキャットなどがいます。周辺には水泳池やリドもあります。",
  },
  {
    slug: "changing-the-guard-buckingham-palace",
    title: "衛兵交代式（バッキンガム宮殿）",
    engTitle: "Changing of the Guard, Buckingham Palace",
    summary: "王室の伝統儀式。行進と軍楽隊の生演奏があり、見学は無料。",
    mainText:
      "**衛兵交代式**は、バッキンガム宮殿とセント・ジェームズ宮殿を守る衛兵が交代する儀式です。行進と軍楽隊の生演奏があり、所要約45分、11時に始まります。混むので、少し早めに着いてください。",
  },
  {
    slug: "diana-princess-of-wales-memorial-playground",
    title: "ロンドン・プレイグラウンド",
    engTitle: "London’s Fabulous Playgrounds",
    summary: "ロンドンには無料のプレイグラウンドが多い。代表はケンジントン・ガーデンズのダイアナ妃記念プレイグラウンド。",
    mainText:
      "ロンドンには**無料で遊べる公園とプレイグラウンドが多くあります**。代表的なのが、ケンジントン・ガーデンズ内の **Princess of Wales’ Memorial Playground** です。ピーターパンにちなんだ大きな海賊船、砂場、ティーピー、感覚遊具などがあります。",
  },
  {
    slug: "natural-history-museum",
    title: "自然史博物館",
    engTitle: "The Natural History Museum",
    summary: "動物・自然・恐竜の展示がある無料の博物館。屋内なので雨の日にも行ける。",
    mainText:
      "**ナチュラル・ヒストリー・ミュージアム（自然史博物館）** は入場無料です。動物の標本、大型の哺乳類の模型、地球科学の展示があり、なかでも恐竜の化石の展示がよく知られています。屋内なので、冬や雨の日でも数時間過ごせます。",
  },
  {
    slug: "science-museum",
    title: "サイエンスミュージアム",
    engTitle: "The Science Museum",
    summary: "科学と宇宙がテーマの無料の博物館。",
    mainText:
      "**サイエンスミュージアム**は入場無料の博物館です。宇宙ギャラリーには月面着陸船の模型があります。有料エリアの **Wonderlab** では、実験や実演を見たり、自分で試したりできます。",
  },
  {
    slug: "crystal-palace-dinosaurs",
    title: "クリスタルパレス・ダイナソーズ",
    engTitle: "Crystal Palace Dinosaurs",
    summary: "19世紀に造られた恐竜の彫刻が公園の中に並ぶ。迷路と湖もあり、無料。",
    mainText:
      "**Crystal Palace Dinosaurs** は、公園の中に点在する恐竜の彫刻群で、19世紀に造られたものです。木々の間や遊具エリアに恐竜が置かれています。公園には迷路や湖もあります。",
  },
  {
    slug: "imperial-war-museum",
    title: "インペリアル・ウォー・ミュージアム",
    engTitle: "Imperial War Museum London",
    summary: "戦争と歴史を学べる無料博物館。特に8歳以上の子どもにおすすめ。",
    mainText:
      "**Imperial War Museum London** は、戦争の歴史を扱う無料の博物館です。兵器、車両、飛行機などの実物と、映像の展示が多くあります。学校で第二次世界大戦を習っている子どもなら、授業の内容と結びつけて見られます。",
  },
  {
    slug: "british-museum-london",
    title: "大英博物館",
    engTitle: "The British Museum",
    summary: "古代文明の遺物を集めた無料の博物館。週末と学校休暇には子ども向けのトレイルがある。",
    mainText:
      "**大英博物館**は入場無料で、エジプト・ギリシャ・アジアなど古代文明の遺物を展示しています。ミイラ（牛のミイラを含む）やファラオ像、古代のゲームなど、子どもが興味を持ちやすい展示があります。週末や学校休暇には、無料のアクティビティバッグやトレイルが用意されます。",
  },
  {
    slug: "sky-garden-london",
    title: "スカイガーデン",
    engTitle: "Sky Garden",
    summary: "シティの高層ビルの上にある無料の展望庭園。予約制。",
    mainText:
      "**Sky Garden** は、ロンドン中心部の高層ビルの上階にある展望庭園です（予約制）。360度の眺めと、熱帯植物が植えられた屋内の庭があり、有料のザ・シャードと違って入場は無料です。子どもは平日18時以降と週末21時以降は入場できません。",
  },
];

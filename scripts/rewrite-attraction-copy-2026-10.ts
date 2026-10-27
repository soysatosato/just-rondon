/**
 * 観光スポット詳細の冒頭(tagline・summary)と一部の読み物から、宣伝文句を外す。
 *
 *   npx tsx scripts/rewrite-attraction-copy-2026-10.ts           # 差分を表示するだけ
 *   npx tsx scripts/rewrite-attraction-copy-2026-10.ts --apply   # DBへ反映
 *
 * 2026-10-27 の「AI生成っぽい文言」の監査で、詳細ページの最初に出る
 * tagline と summary に「ロンドン屈指」「必見」「〜の魅力」「人気スポット」
 * のような評価だけの文が多いと分かった(公開182件中96件)。着地の97%は
 * 詳細ページなので、閲覧の多い上位20件から直す。この20件のうち該当した
 * 14件が今回の対象。評価の文は消し、元の文にあった事実だけを残す。
 * 新しい事実は足さない。
 *
 * AttractionSection は対象外。詳細ページは AttractionStory だけを読み、
 * AttractionSection はどこにも描画されていない(fix-content-markdown-bold.ts)。
 *
 * 書き換えるのは、いまの値が下の before と一致したときだけ。after と
 * 一致していれば済んだものとして飛ばし、どちらとも違えば触らずに報告する
 * (ほかの作業で先に直されていた場合に上書きしないため)。
 *
 * 自然史博物館の旧 summary にあった「4.5億年」「80万点」は、それぞれ
 * 45億年・8,000万点の誤りと思われる。確かめていないので、数字ごと外した。
 */

import db from "../utils/db";

const APPLY = process.argv.includes("--apply");

type Change = { before: string; after: string };

const ATTRACTION_FIXES: ({ slug: string; field: "tagline" | "summary" } & Change)[] = [
  {
    slug: "tate-britain",
    field: "summary",
    before:
      "テート・ブリテンは、1500年代から現代までの英国美術を体系的に収蔵する国立ギャラリーです。J.M.W.ターナーの世界最大級のコレクションをはじめ、コンスタブルやプレ・ラファエル派、ベーコン、フロイド、ホックニー、ブリジット・ライリーなど幅広い作家の作品を鑑賞できます。入館は常設コレクションに限り無料で、企画展では最新の英国アートにも触れられます。クラシカルな外観の建物は、かつて刑務所があったミルバンク地区に建てられ、ロンドン観光の中でも落ち着いてアートを楽しめるスポットとして人気です。",
    after:
      "テート・ブリテンは、1500年代から現代までの英国美術を体系的に収蔵する国立ギャラリーです。J.M.W.ターナーの世界最大級のコレクションをはじめ、コンスタブルやプレ・ラファエル派、ベーコン、フロイド、ホックニー、ブリジット・ライリーなど幅広い作家の作品を鑑賞できます。入館は常設コレクションに限り無料で、企画展では最新の英国アートにも触れられます。建物は、かつて刑務所があったミルバンク地区に建っています。",
  },
  {
    slug: "tate-modern",
    field: "tagline",
    before:
      "世界の現代アートが集うテムズ川沿いの巨大美術館",
    after:
      "発電所を改装した、テムズ川沿いの国立現代美術館",
  },
  {
    slug: "tate-modern",
    field: "summary",
    before:
      "テート・モダンは、ロンドン・バンクサイドの旧バンクサイド発電所を改装した、英国の国立・国際現代アート美術館です。テムズ川とミレニアム・ブリッジを望むロケーションに、ピカソやマティス、草間彌生など世界中のアーティストの作品が集結。入館は常設展示エリアが無料で、巨大なタービンホールのインスタレーションや地下のタンク空間など、建築そのものも見どころです。ファミリーや初めて現代アートに触れる旅行者でも楽しみやすく、ロンドン滞在で一度は訪れたい定番スポットです。",
    after:
      "テート・モダンは、ロンドン・バンクサイドの旧バンクサイド発電所を改装した、英国の国立・国際現代アート美術館です。テムズ川沿い、ミレニアム・ブリッジの南端にあり、ピカソやマティス、草間彌生などの作品を所蔵しています。常設展示は入館無料です。発電所のタービン室だったタービンホールと、地下のタンクも展示に使われています。",
  },
  {
    slug: "buckingham-palace",
    field: "tagline",
    before:
      "イギリス王室の象徴的な宮殿",
    after:
      "イギリス君主の公式住居",
  },
  {
    slug: "buckingham-palace",
    field: "summary",
    before:
      "1837年にヴィクトリア女王が居住して以来、イギリス君主の公式住居。600室以上あり、庭園も広大。毎日11時前後には衛兵交代式が行われ、観光客に人気。内部ツアーでは豪華な玉座の間や王室の美術品を見られる時期もある。",
    after:
      "1837年にヴィクトリア女王が住んで以来の、イギリス君主の公式住居。部屋は600室以上ある。宮殿前の衛兵交代式は11時からだが、毎日ではない。内部は夏の一般公開の時期に、玉座の間や王室の美術品を見られる。",
  },
  {
    slug: "bt-tower-london",
    field: "summary",
    before:
      "BTタワーは、1960年代に建設されたロンドン中心部の通信タワーで、かつては展望ギャラリーや回転レストランを備えた観光名所でした。現在は一般公開されていませんが、ロンドンのスカイラインを語る上で欠かせない存在です。毎年9月に開催されるOpen House London期間中のみ、抽選制で内部見学が行われることがあり、建築・通信・都市史に関心のある人々にとって特別な場所となっています。",
    after:
      "BTタワーは、1960年代に建設されたロンドン中心部の通信タワーで、かつては展望ギャラリーや回転レストランを備えた観光名所でした。現在は一般公開されていません。毎年9月のOpen House Londonの期間中だけ、抽選制で内部見学が行われることがあります。",
  },
  {
    slug: "hyde-park-london",
    field: "summary",
    before:
      "ハイドパークはロンドン中心部に位置し、350エーカーの広大な敷地に湖、庭園、スポーツ施設、カフェ、スピーカーズ・コーナーなど多彩な魅力が集まる英国を代表する公園。冬はウィンター・ワンダーランド、夏は野外イベントの会場としても人気で、四季を通じてロンドン市民と観光客を惹きつける。美しい自然と文化の歴史が融合した心地よい都市のオアシス。",
    after:
      "ハイドパークはロンドン中心部にある350エーカーの公園で、湖、庭園、スポーツ施設、カフェ、スピーカーズ・コーナーがある。冬はウィンター・ワンダーランド、夏は野外イベントの会場になる。",
  },
  {
    slug: "st-pauls-cathedral",
    field: "tagline",
    before:
      "ロンドンの象徴的な大聖堂",
    after:
      "クリストファー・レンが設計した、ドームの大聖堂",
  },
  {
    slug: "st-pauls-cathedral",
    field: "summary",
    before:
      "17世紀に建てられた英国国教会の大聖堂で、著名な建築家クリストファー・レンの傑作。高さ111mの大ドームはロンドンのランドマークで、展望ギャラリーからは市街地を一望できる。内部には豪華なモザイクやステンドグラスがあり、歴史的な葬儀や結婚式も行われてきた。地下には聖職者や著名人の墓もある。",
    after:
      "17世紀に建てられた英国国教会の大聖堂で、設計はクリストファー・レン。高さ111mのドームの上の展望ギャラリーから、市街地を見渡せる。内部にはモザイクとステンドグラスがあり、歴史的な葬儀や結婚式も行われてきた。地下には聖職者や著名人の墓もある。",
  },
  {
    slug: "barbican-centre",
    field: "tagline",
    before:
      "ヨーロッパ最大級、芸術が集結する巨大カルチャー拠点",
    after:
      "コンサートホール・劇場・映画館・美術館が一つに入る文化施設",
  },
  {
    slug: "barbican-centre",
    field: "summary",
    before:
      "バービカン・センターは、シティ・オブ・ロンドンに位置するヨーロッパ最大級の総合芸術文化施設です。コンサートホール、劇場、映画館、美術館、図書館、会議施設、ショップ、温室までを一つの建物群に収め、音楽・演劇・映画・美術・建築が日常的に交差する空間として機能しています。ロンドン交響楽団の本拠地でもあり、世界水準のパフォーマンスと実験的な表現を同時に体験できる点が最大の魅力。観光スポットであると同時に、ロンドン市民の生活に深く根ざした文化の中枢です。",
    after:
      "バービカン・センターは、シティ・オブ・ロンドンにあるヨーロッパ最大級の総合芸術文化施設です。コンサートホール、劇場、映画館、美術館、図書館、会議施設、ショップ、温室までが一つの建物群に入っています。ロンドン交響楽団の本拠地でもあります。",
  },
  {
    slug: "natural-history-museum",
    field: "tagline",
    before:
      "4.5億年の地球史と生命を巡るロンドン屈指の無料博物館",
    after:
      "恐竜の化石とシロナガスクジラの骨格を無料で見られる博物館",
  },
  {
    slug: "natural-history-museum",
    field: "summary",
    before:
      "ロンドン自然史博物館は、4.5億年の地球の歴史を80万点以上のコレクションで辿る世界的博物館。巨大な青いシロナガスクジラ骨格『Hope』、恐竜化石、隕石、鉱物標本など、生命の進化から地球科学まで幅広く展示。ヴィクトリア時代の重厚なゴシック建築も必見。入場無料で、家族連れから研究者まで楽しめる。",
    after:
      "ロンドン自然史博物館は、地球と生命の歴史を標本でたどる博物館。シロナガスクジラの骨格『Hope』、恐竜の化石、隕石、鉱物標本など、生命の進化から地球科学まで展示している。建物はヴィクトリア時代のもの。入場無料。",
  },
  {
    slug: "sky-garden-london",
    field: "summary",
    before:
      "ウォーキー・トーキーと呼ばれる高層ビルの最上階にある空中庭園。ガラス張りの展望フロアからロンドンの街を無料で一望でき、夕日が差し込む時間帯は特に人気。緑に囲まれたスペースでゆっくり過ごせるほか、バーやレストランも併設されている。予約制なので事前の時間指定がおすすめ。",
    after:
      "ウォーキー・トーキーと呼ばれる高層ビルの最上部にある屋内庭園。ガラス張りの展望フロアからロンドンの街を見渡せる。入場は無料だが時間指定の予約が要り、夕方の枠から先に埋まる。バーとレストランも入っている。",
  },
  {
    slug: "harry-potter-shop-platform-934",
    field: "tagline",
    before:
      "ホグワーツ特急の“出発点”にある魔法ワールド公式ショップ",
    after:
      "キングス・クロス駅の9と3/4番線にある公式ショップ",
  },
  {
    slug: "harry-potter-shop-platform-934",
    field: "summary",
    before:
      "キングス・クロス駅の9と3/4番線にあるハリー・ポッター公式ショップ。映画の象徴的な“消えるカート”前で写真が撮れるほか、寮カラーのマフラー、杖、限定グッズ、チョコレート・フロッグなど魔法界の商品が勢揃い。店内はオリバンダーの杖店を思わせる内装で、ファン必訪の魔法スポット。",
    after:
      "キングス・クロス駅の9と3/4番線にあるハリー・ポッター公式ショップ。壁に消えていくカートの前で写真が撮れるほか、寮カラーのマフラー、杖、限定グッズ、チョコレート・フロッグなどを売っている。店内はオリバンダーの杖店に似せた内装。",
  },
  {
    slug: "leadenhall-market-london",
    field: "tagline",
    before:
      "歴史と美食が融合したシティ・オブ・ロンドンの華麗な屋内マーケット",
    after:
      "ヴィクトリア時代のガラス屋根がかかる、シティの市場",
  },
  {
    slug: "leadenhall-market-london",
    field: "summary",
    before:
      "レドンホール・マーケットは14世紀から続くロンドンの歴史市場で、現在の華麗な鉄骨ガラス屋根は19世紀にホレス・ジョーンズによって設計された。宝飾店や衣料品店から、ワインバー、レストラン、カフェまで揃う人気スポットで、映画『ハリー・ポッターと賢者の石』のダイアゴン横丁のロケ地としても有名。観光と食事のどちらでも楽しめるロンドン屈指の美しい市場。",
    after:
      "レドンホール・マーケットは14世紀から続く市場で、いまの鉄骨とガラスの屋根は19世紀にホレス・ジョーンズが設計した。宝飾店や衣料品店、ワインバー、レストラン、カフェが入り、映画『ハリー・ポッターと賢者の石』のダイアゴン横丁のロケ地としても知られる。",
  },
  {
    slug: "science-museum",
    field: "tagline",
    before:
      "宇宙・医学・数学・工学など科学の魅力が詰まったロンドン屈指の無料ミュージアム",
    after:
      "宇宙・医学・数学・工学を展示する、入場無料の科学博物館",
  },
  {
    slug: "science-museum",
    field: "summary",
    before:
      "サウス・ケンジントンにあるサイエンス・ミュージアムは、革新的な科学展示、歴史的オブジェ、インタラクティブ体験がそろう英国を代表する科学博物館。宇宙船、DNAモデル、医学ギャラリー、巨大な工業遺産など、多彩な展示を通じて科学の歩みを実感できる。無料で楽しめ、子どもから大人まで幅広く人気。",
    after:
      "サウス・ケンジントンにある科学博物館。実際に飛んだ宇宙船、DNAの模型、医学のギャラリー、大型の産業機械などを展示し、触って試せる展示もある。常設展は入場無料。",
  },
  {
    slug: "kenwood-house-hampstead",
    field: "tagline",
    before:
      "名画と自然を無料で楽しめる、ロンドン屈指の邸宅美術館",
    after:
      "フェルメールやレンブラントを無料で見られる、ハムステッド・ヒースの邸宅",
  },
  {
    slug: "kenwood-house-hampstead",
    field: "summary",
    before:
      "ケンウッド・ハウスは、ハムステッド・ヒースの北端に広がる広大な公園内に建つ、18世紀の優雅なカントリーハウスです。ロバート・アダム設計による美しい内装とともに、フェルメールやレンブラント、ターナー、ゲインズバラといった巨匠の作品を含む世界的な美術コレクションを所蔵している点が最大の魅力。入館は無料で、ロンドン市内にいながら、美術館と自然散策を同時に楽しめる貴重なスポットです。",
    after:
      "ケンウッド・ハウスは、ハムステッド・ヒースの北端の公園内に建つ18世紀のカントリーハウスです。内装はロバート・アダムの設計で、フェルメール、レンブラント、ターナー、ゲインズバラの作品を所蔵しています。入館は無料です。",
  },
  {
    slug: "diana-princess-of-wales-memorial-playground",
    field: "tagline",
    before:
      "巨大な海賊船が子どもたちの想像力を解き放つ無料プレイグラウンド",
    after:
      "ピーター・パンの海賊船がある、12歳までの無料の遊び場",
  },
  {
    slug: "diana-princess-of-wales-memorial-playground",
    field: "summary",
    before:
      "ダイアナ元妃の名前を冠したロンドン随一の人気プレイグラウンド。『ピーター・パン』に着想を得た巨大な木製の海賊船を中心に、ティーピー、ツリーハウス、砂場、水遊びエリア、楽器遊具などが並び、12歳までの子どもが自由に遊べる。ケンジントン・ガーデンズの緑豊かな環境にあり、カフェやベビールームも整備された家族向けスポット。",
    after:
      "ダイアナ元妃の名前を冠した、無料のプレイグラウンド。『ピーター・パン』に着想を得た巨大な木製の海賊船を中心に、ティーピー、ツリーハウス、砂場、水遊びエリア、楽器遊具などが並び、12歳までの子どもが自由に遊べる。ケンジントン・ガーデンズの中にあり、カフェとベビールームがある。",
  },
];

const STORY_FIXES: ({ id: number } & Change)[] = [
  {
    id: 2434,
    before:
      "- プレイグラウンドの“ピーター・パン”テーマは、原作者 J.M. バリーがケンジントン・ガーデンズで多くの時間を過ごしたことに由来  \n- ダイアナ元妃は生前、子ども支援活動を熱心に行っていたため、この遊び場はその精神を象徴して作られた  \n- 巨大海賊船は常にメンテナンスされ、安全設備はロンドンでもトップクラス  \n- 開園以来、年間100万人以上の子どもたちが訪れる人気スポット  \n- 保護者が入口で待つ“Pick-up Area”があるのはロンドンのプレイグラウンドでは珍しい仕組み",
    after:
      "- プレイグラウンドの“ピーター・パン”テーマは、原作者 J.M. バリーがケンジントン・ガーデンズで多くの時間を過ごしたことに由来  \n- ダイアナ元妃を記念して造られた  \n- 年間100万人以上の子どもが訪れる  \n- 入口に、保護者が子どもを待つ“Pick-up Area”がある",
  },
];

const VISIT_STEP_FIXES: ({ id: number } & Change)[] = [
  {
    id: 4585,
    before:
      "入場無料の邸宅で、予約も要りません。それでいて、レンブラント、フェルメール、ハルス、ゲインズバラが並びます。ビール醸造で財を成したギネス家のアイヴィー伯爵が集めた作品を、邸宅ごと国に寄贈したためです。ロンドンでも屈指の「無料で見られるものの質」がここにあります。",
    after:
      "入場無料の邸宅で、予約も要りません。それでいて、レンブラント、フェルメール、ハルス、ゲインズバラが並びます。ビール醸造で財を成したギネス家のアイヴィー伯爵が集めた作品を、邸宅ごと国に寄贈したためです。",
  },
];

type Outcome = "update" | "done" | "mismatch";

function judge(current: string | null, change: Change): Outcome {
  if (current === change.after) return "done";
  if (current === change.before) return "update";
  return "mismatch";
}

function report(label: string, outcome: Outcome, change: Change) {
  if (outcome === "done") {
    console.log(`= ${label}(済み)`);
    return;
  }
  if (outcome === "mismatch") {
    console.log(`! ${label}: いまの値が before と違うので触らない`);
    return;
  }
  console.log(`~ ${label}`);
  console.log(`  - ${change.before}`);
  console.log(`  + ${change.after}`);
}

async function main() {
  let updates = 0;
  let mismatches = 0;

  for (const fix of ATTRACTION_FIXES) {
    const row = await db.attraction.findUnique({
      where: { slug: fix.slug },
      select: { id: true, tagline: true, summary: true },
    });
    if (!row) {
      console.log(`! ${fix.slug}: スポットが見つからない`);
      mismatches++;
      continue;
    }
    const outcome = judge(row[fix.field], fix);
    report(`${fix.slug}.${fix.field}`, outcome, fix);
    if (outcome === "mismatch") mismatches++;
    if (outcome !== "update") continue;
    updates++;
    if (APPLY) {
      await db.attraction.update({
        where: { id: row.id },
        data: { [fix.field]: fix.after },
      });
    }
  }

  for (const fix of STORY_FIXES) {
    const row = await db.attractionStory.findUnique({
      where: { id: fix.id },
      select: { body: true },
    });
    const outcome = row ? judge(row.body, fix) : "mismatch";
    report(`AttractionStory#${fix.id}`, outcome, fix);
    if (outcome === "mismatch") mismatches++;
    if (outcome !== "update") continue;
    updates++;
    if (APPLY) {
      await db.attractionStory.update({
        where: { id: fix.id },
        data: { body: fix.after },
      });
    }
  }

  for (const fix of VISIT_STEP_FIXES) {
    const row = await db.attractionVisitStep.findUnique({
      where: { id: fix.id },
      select: { body: true },
    });
    const outcome = row ? judge(row.body, fix) : "mismatch";
    report(`AttractionVisitStep#${fix.id}`, outcome, fix);
    if (outcome === "mismatch") mismatches++;
    if (outcome !== "update") continue;
    updates++;
    if (APPLY) {
      await db.attractionVisitStep.update({
        where: { id: fix.id },
        data: { body: fix.after },
      });
    }
  }

  console.log(
    `\n${APPLY ? "反映" : "差分のみ(--apply で反映)"}: 更新 ${updates} 件、不一致 ${mismatches} 件`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());

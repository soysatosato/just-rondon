import "dotenv/config";
import db from "../utils/db";

/**
 * 品目ごとの「イチオシ商品」を投入する。
 *
 * recommendation(markdown)が「なぜそれを選ぶか」の地の文なのに対し、
 * ここは**商品そのもの**を1行1点で持つ。分けたのは画像のため——
 * 本文中に銘柄名を埋めたままだと、商品ごとの写真を差し込む先が無い。
 *
 * ## 書き方の方針
 *
 * - **name は英語の正式名称。**棚とラベルで一致させるので訳さない
 * - **reason は1〜3文。**recommendation の要約ではなく、この商品を
 *   選ぶ理由だけを書く。本文と同じ文を繰り返さない
 * - **role で用途を分ける。**読者が知りたいのは商品の並びではなく、
 *   自分の用途にどれが当たるか
 * - **価格は必ず幅で書く。**変動する
 *
 * ## 写真は後から足す
 *
 * image / imageSource / imageCredit / imageLink は nullable のまま
 * 投入する。撮影できた商品から image を埋めれば、本文もスキーマも
 * 触らずに写真付きへ変わる。自分で撮った写真は imageSource: "own" で、
 * このとき credit は不要(ImageCredit が commons 以外を描画しない)。
 *
 * 実行: npx tsx scripts/seed-souvenir-picks.ts
 */

export type Pick = {
  name: string;
  nameJa?: string;
  size?: string;
  priceRange?: string;
  reason: string;
  role?: "standard" | "premium" | "budget" | "seasonal";
};

export const PICKS: { slug: string; picks: Pick[] }[] = [
  {
    slug: "twinings-tea",
    picks: [
      {
        name: "English Breakfast",
        nameJa: "イングリッシュ ブレックファスト",
        size: "50袋入り",
        priceRange: "£3 前後",
        reason:
          "配る枚数が要るならこれ。日本でも名前が通っているので、渡した相手が飲み方に迷いません。スーパーで箱買いできます。",
        role: "budget",
      },
      {
        name: "Earl Grey",
        nameJa: "アールグレイ",
        size: "50袋入り",
        priceRange: "£3 前後",
        reason:
          "English Breakfast と並ぶ定番。ベルガモットの香りが分かりやすく、紅茶に詳しくない相手でも「アールグレイ」として認識してもらえます。",
        role: "budget",
      },
      {
        name: "London Strand Breakfast",
        nameJa: "ロンドン ストランド ブレックファスト",
        size: "茶葉 125g 前後",
        priceRange: "£8〜10",
        reason:
          "ストランド本店ゆかりのアッサム主体のブレンド。日本の店頭ではまず見かけないので、「本店で買った」ことが中身で説明できます。",
        role: "premium",
      },
    ],
  },
  {
    slug: "fortnum-and-mason-tea",
    picks: [
      {
        name: "Royal Blend",
        nameJa: "ロイヤル ブレンド",
        size: "缶入り 250g",
        priceRange: "£15〜20",
        reason:
          "F&M で最も知られた看板ブレンド。濃いめでミルクによく合い、日本人がイメージする「イギリスの紅茶」に最も近い1本です。迷ったらこれ。",
        role: "standard",
      },
      {
        name: "Countess Grey",
        nameJa: "カウンテス グレイ",
        size: "缶入り 250g",
        priceRange: "£15〜20",
        reason:
          "アールグレイにオレンジを重ねた軽い柑橘系。ベルガモットの香りが苦手な人でも飲めるので、アールグレイを贈って外した経験があるならこちらに替えると当たります。",
        role: "standard",
      },
      {
        name: "Afternoon Blend",
        nameJa: "アフタヌーン ブレンド",
        size: "缶入り 250g",
        priceRange: "£15〜20",
        reason:
          "渋みが穏やかで、ミルクでもストレートでもいける汎用性があります。紅茶を飲む習慣が微妙な相手向け。",
        role: "standard",
      },
    ],
  },
  {
    slug: "whittard-of-chelsea",
    picks: [
      {
        name: "Luxury White Hot Chocolate",
        nameJa: "ラグジュアリー ホワイト ホットチョコレート",
        size: "缶入り 350g",
        priceRange: "£10〜13",
        reason:
          "ウィッタードの本命は紅茶ではなくホットチョコレート。ホワイトは見た目にも珍しく日本ではまず見かけないので、子どものいる家庭に強い1缶です。",
        role: "standard",
      },
      {
        name: "Salted Caramel Hot Chocolate",
        nameJa: "ソルテッドキャラメル ホットチョコレート",
        size: "缶入り 350g",
        priceRange: "£10〜13",
        reason:
          "人気上位の定番。甘いだけで終わらないので大人向けに渡せます。ホワイトと2缶で組むと味の幅が出ます。",
        role: "standard",
      },
      {
        name: "70% Cocoa Hot Chocolate",
        nameJa: "70% ココア ホットチョコレート",
        size: "缶入り 350g",
        priceRange: "£10〜13",
        reason:
          "甘さが抑えられていて、ココアというよりチョコレートを溶かした飲み物に近い。しっかりカカオが好きな相手に。",
        role: "premium",
      },
    ],
  },
  {
    slug: "walkers-shortbread",
    picks: [
      {
        name: "Walkers Shortbread Fingers",
        nameJa: "ウォーカーズ ショートブレッド フィンガー",
        size: "個包装の箱",
        priceRange: "£2〜5",
        reason:
          "赤いタータンの箱の定番。原材料が小麦粉・バター・砂糖・塩だけの正統派で、外しません。フィンガー型は食べやすく箱も薄いので配る用に最適です。",
        role: "budget",
      },
      {
        name: "Walkers Shortbread Tartan Tin",
        nameJa: "ウォーカーズ タータン缶",
        size: "缶入り",
        priceRange: "£8〜12",
        reason:
          "同じ中身でも缶入りは食べ終わったあとも残ります。スーツケースの中で潰れないという実利もあるので、贈り物にするならこちら。",
        role: "standard",
      },
      {
        name: "Shortbread House of Edinburgh",
        nameJa: "ショートブレッド ハウス オブ エジンバラ",
        size: "箱入り",
        priceRange: "£8〜15",
        reason:
          "手作りに近い製法で、ウォーカーズより明確にバターの香りが立ちます。菓子に詳しい相手なら違いが分かる1箱。デパートや専門店で扱っています。",
        role: "premium",
      },
    ],
  },
  {
    slug: "cadbury-dairy-milk",
    picks: [
      {
        name: "Cadbury Roses",
        nameJa: "キャドバリー ローゼス",
        size: "大袋・大缶",
        priceRange: "£5〜10",
        reason:
          "個包装の詰め合わせで、開けて置いておくだけで配り終わります。キャラメルやフォンダンなど落ち着いた構成なので職場向き。",
        role: "budget",
      },
      {
        name: "Cadbury Heroes",
        nameJa: "キャドバリー ヒーローズ",
        size: "大袋・大缶",
        priceRange: "£5〜10",
        reason:
          "Dairy Milk や Twirl のミニ版が中心の詰め合わせ。Roses より馴染みやすい構成で、子どもにも配れます。",
        role: "budget",
      },
      {
        name: "Cadbury Twirl",
        nameJa: "キャドバリー トワール",
        size: "バー",
        priceRange: "£1 前後",
        reason:
          "フレーク状のチョコを2本、チョコで包んだもの。食感が独特で日本ではほぼ手に入りません。個人に渡すならプレーンの板チョコよりこちら。",
        role: "standard",
      },
      {
        name: "Cadbury Wispa",
        nameJa: "キャドバリー ウィスパ",
        size: "バー",
        priceRange: "£1 前後",
        reason:
          "気泡入りの軽いチョコで、口の中で溶ける速さが日本の板チョコと違います。Twirl・Crunchie と3本セットにすると土産話が立ちます。",
        role: "standard",
      },
      {
        name: "Cadbury Crunchie",
        nameJa: "キャドバリー クランチー",
        size: "バー",
        priceRange: "£1 前後",
        reason:
          "中がハニカム状の飴。ザクザクした食感が日本に無いので、3本の中では一番驚かれます。",
        role: "standard",
      },
      {
        name: "Cadbury Creme Egg",
        nameJa: "キャドバリー クリームエッグ",
        size: "1個",
        priceRange: "£1 前後",
        reason:
          "卵型のチョコの中にフォンダンが入った季節限定品。イースター前後(1〜4月ごろ)にしか並ばないので、その時期の土産として話題になります。",
        role: "seasonal",
      },
    ],
  },
  {
    slug: "tunnocks-teacake",
    picks: [
      {
        name: "Tunnock's Caramel Wafer",
        nameJa: "タノックス キャラメルウエハース",
        size: "マルチパック",
        priceRange: "1個あたり 50p 前後",
        reason:
          "赤と金の包み紙。ウエハースにキャラメルを重ねてチョコで包んだ平たい形で、日本人の口に最も合います。平たいので型崩れしにくく、夏場もこちらが安全。",
        role: "standard",
      },
      {
        name: "Tunnock's Tea Cake",
        nameJa: "タノックス ティーケーキ",
        size: "マルチパック",
        priceRange: "1個あたり 50p 前後",
        reason:
          "赤と銀のストライプ。マシュマロをチョコで包んだドーム型で、包み紙の可愛さは断然こちら。Caramel Wafer と混ぜると赤・銀・金が揃います。",
        role: "standard",
      },
    ],
  },
  {
    slug: "marmite",
    picks: [
      {
        name: "Marmite Yeast Extract (Original)",
        nameJa: "マーマイト オリジナル",
        size: "125g 小瓶",
        priceRange: "£2〜3",
        reason:
          "土産としてはこのサイズが正解。70gは小さすぎて土産に見えず、250g以上は「毎日食べる人」向けで、話のネタとして渡すには重すぎます。",
        role: "standard",
      },
    ],
  },
  {
    slug: "hp-sauce",
    picks: [
      {
        name: "HP Sauce Original",
        nameJa: "HPソース オリジナル",
        size: "255g / 285g ガラス瓶",
        priceRange: "£2〜4",
        reason:
          "赤いラベルにウェストミンスター宮殿が描かれた定番品。HP の名前と国会議事堂のラベルに意味があるので、派生品ではなくこれを選んでください。",
        role: "standard",
      },
      {
        name: "HP Sauce Squeezy Bottle",
        nameJa: "HPソース スクイーズボトル",
        size: "プラスチックボトル",
        priceRange: "£2〜4",
        reason:
          "軽くて割れません。ラベルの見栄えはガラス瓶が上なので、渡す相手が「飾る人」ならガラス、「使う人」ならこちら。",
        role: "standard",
      },
    ],
  },
  {
    slug: "clotted-cream",
    picks: [
      {
        name: "Devon Cream Company Clotted Cream",
        nameJa: "デヴォン クリーム カンパニー クロテッドクリーム",
        size: "170g 前後の瓶",
        priceRange: "£4〜6",
        reason:
          "常温保存タイプで、未開封なら数か月もちます。日本まで持ち帰れる選択肢としては現実的にこれが本命。ラベルの保存方法を必ず確認してください。",
        role: "standard",
      },
      {
        name: "Rodda's Cornish Clotted Cream",
        nameJa: "ロダス コーニッシュ クロテッドクリーム",
        size: "227g / 454g",
        priceRange: "£2〜5",
        reason:
          "1890年創業コーンウォールの老舗で、この分野で最も知られたブランド。ただし要冷蔵なので日本には持ち帰れません。滞在中にスコーンと食べる用。",
        role: "premium",
      },
      {
        name: "Trewithen Dairy Cornish Clotted Cream",
        nameJa: "トレウィズン デイリー クロテッドクリーム",
        size: "227g 前後",
        priceRange: "£2〜5",
        reason:
          "同じくコーンウォールの評価の高い冷蔵品。ロダスが売り切れているときの代替として覚えておくと使えます。",
        role: "premium",
      },
    ],
  },
  {
    slug: "neals-yard-remedies",
    picks: [
      {
        name: "Remedies to Roll",
        nameJa: "レメディーズ トゥ ロール",
        size: "10ml ロールオン",
        priceRange: "£8 前後",
        reason:
          "かさばらず割れにくいので、数を買うならこれ一択。香りの好みが分かれても負担が小さい価格帯です。リラックス系の Night Time が万人向け。",
        role: "budget",
      },
      {
        name: "Frankincense Intense Cream",
        nameJa: "フランキンセンス クリーム",
        size: "50g 前後",
        priceRange: "£30〜45",
        reason:
          "ニールズヤードで最も知られた看板商品。青い瓶がそのままブランドの象徴なので、渡したときに「あの青い瓶」だと伝わります。1人に絞るならこれ。",
        role: "premium",
      },
      {
        name: "Wild Rose Beauty Balm",
        nameJa: "ワイルドローズ ビューティバーム",
        size: "50g 前後",
        priceRange: "£30〜45",
        reason:
          "クレンジングから保湿まで1つで使える定番。用途を説明しやすいので、化粧品に詳しくない相手にも渡せます。",
        role: "premium",
      },
    ],
  },
  {
    slug: "lush",
    picks: [
      {
        name: "Intergalactic Bath Bomb",
        nameJa: "インターギャラクティック バスボム",
        size: "1個",
        priceRange: "£5〜6",
        reason:
          "ラッシュで最も売れているバスボム。濃紺にピンクと金が散った見た目、ペパーミントとグレープフルーツの香り、湯に入れるとパチパチ弾けるポップキャンディ入り。説明しやすく反応も大きい。",
        role: "standard",
      },
      {
        name: "Sex Bomb Bath Bomb",
        nameJa: "セックスボム バスボム",
        size: "1個",
        priceRange: "£5〜6",
        reason:
          "ピンクの球体のフローラル系。名前のインパクトで話題になります。渡す相手を選びますが、当たると強い1個。",
        role: "standard",
      },
      {
        name: "Shampoo Bar",
        nameJa: "シャンプーバー(固形シャンプー)",
        size: "55g 前後",
        priceRange: "£8〜12",
        reason:
          "液体扱いにならないので機内持ち込みができます。バスボムより実用的で、湯船に浸かる習慣がない相手にも渡せる。荷物の制約が厳しいときの本命。",
        role: "standard",
      },
    ],
  },
  {
    slug: "jo-malone-london",
    picks: [
      {
        name: "Lime Basil & Mandarin Cologne",
        nameJa: "ライム バジル & マンダリン",
        size: "9ml ミニ",
        priceRange: "£30 前後",
        reason:
          "柑橘とハーブの軽さで性別を問わず使えます。迷ったらこちらのほうが外しません。9ml でも箱とリボンは同じなので見た目の格は落ちません。",
        role: "standard",
      },
      {
        name: "English Pear & Freesia Cologne",
        nameJa: "イングリッシュ ペアー & フリージア",
        size: "9ml ミニ",
        priceRange: "£30 前後",
        reason:
          "洋梨のやわらかい甘さで、ジョー マローンの看板と言える1本。女性に渡すならこちらが定番です。",
        role: "standard",
      },
      {
        name: "Body Crème / Hand Wash",
        nameJa: "ボディクリーム / ハンドソープ",
        size: "各種",
        priceRange: "£30〜50",
        reason:
          "香りの主張が弱く、使い道がはっきりしているので外しにくい。相手の好みが分からないなら香水を避けてこちらが安全です。",
        role: "standard",
      },
    ],
  },
  {
    slug: "penhaligons",
    picks: [
      {
        name: "Halfeti",
        nameJa: "ハルフェティ",
        size: "75ml(Portraits)",
        priceRange: "£200 前後",
        reason:
          "動物の頭部をかたどった金属の蓋が付く Portraits コレクションで最も売れている1本。ローズにグレープフルーツとスパイスを重ねた濃厚な香りで、空になってもオブジェとして残ります。",
        role: "premium",
      },
      {
        name: "The Coveted Duchess Rose",
        nameJa: "カヴェテッド ダッチェス ローズ",
        size: "75ml(Portraits)",
        priceRange: "£200 前後",
        reason:
          "ローズ主体で華やか。Portraits は各香りにイギリスの貴族社会を風刺したキャラクター設定が付いていて、渡すときに設定の話を添えられます。",
        role: "premium",
      },
      {
        name: "Soap / Mini Set",
        nameJa: "ソープ / ミニサイズのセット",
        size: "各種",
        priceRange: "£25〜60",
        reason:
          "箱のデザインが古典的なので価格の割に見栄えがします。1870年創業・王室御用達という背景も説明材料になる、現実的な予算の選択肢。",
        role: "standard",
      },
    ],
  },
  {
    slug: "london-underground-goods",
    picks: [
      {
        name: "Moquette Pouch / Coin Purse",
        nameJa: "モケット生地のポーチ・コインケース",
        size: "各種",
        priceRange: "£10〜30",
        reason:
          "地下鉄の座席に実際に使われている織物。乗ったときに座った柄がそのまま製品になっているので、体験と結びついた記憶の残り方をします。交通博物館ショップの本命。",
        role: "standard",
      },
      {
        name: "Vintage TfL Poster Print",
        nameJa: "ヴィンテージポスターの複製",
        size: "各種",
        priceRange: "£10〜25",
        reason:
          "1920〜30年代のロンドン交通局のポスターはデザイン史的に評価が高く、丸めて持ち帰れるので荷物になりません。",
        role: "standard",
      },
      {
        name: "Roundel Magnet / Keyring",
        nameJa: "ラウンデルのマグネット・キーホルダー",
        size: "各種",
        priceRange: "£3〜5",
        reason:
          "赤い丸に青い横棒のロゴ。ばらまき用ならこれで十分で、街の土産物屋や駅の売店にもあります。博物館まで行く必要はありません。",
        role: "budget",
      },
    ],
  },
  {
    slug: "paddington-bear",
    picks: [
      {
        name: "Paddington Bear Soft Toy",
        nameJa: "パディントン ぬいぐるみ",
        size: "各種サイズ",
        priceRange: "£20〜40",
        reason:
          "赤い帽子と青いコートの標準的な姿のもの。パディントン駅1番ホーム脇のショップで、ブロンズ像で写真を撮ってから買う流れがそのまま土産話になります。",
        role: "standard",
      },
      {
        name: "A Bear Called Paddington",
        nameJa: "くまのパディントン(原作絵本)",
        size: "書籍",
        priceRange: "£8〜12",
        reason:
          "マイケル・ボンドの1958年の第1作。平易な英語で挿絵もあるので、英語を学んでいる子どもへの土産に収まりよく決まります。軽くて荷物にならない。",
        role: "standard",
      },
      {
        name: "Keyring / Mug / Tote Bag",
        nameJa: "キーホルダー / マグ / トートバッグ",
        size: "各種",
        priceRange: "£8〜20",
        reason:
          "荷物を増やしたくないとき用。ぬいぐるみは体積を食うので、複数人に配るならこちらに寄せてください。",
        role: "budget",
      },
    ],
  },
  {
    slug: "brown-betty-teapot",
    picks: [
      {
        name: "Brown Betty Teapot (2-cup)",
        nameJa: "ブラウンベティ ティーポット 2カップ用",
        size: "2カップ用",
        priceRange: "£15 前後",
        reason:
          "重さも大きさも持ち帰りの許容範囲に収まるサイズ。4カップ用以上は重量と容積の両方に効いてくるので、他に買うものがある旅程では現実的ではありません。裏の「Made in England」を必ず確認してください。",
        role: "standard",
      },
    ],
  },
];

async function main() {
  let items = 0;
  let picks = 0;

  for (const entry of PICKS) {
    const souvenir = await db.souvenir.findUnique({
      where: { slug: entry.slug },
      select: { id: true, name: true },
    });

    if (!souvenir) {
      console.warn(`× 見つからない: ${entry.slug}`);
      continue;
    }

    // 画像は後から手で埋める列なので、全消し→再投入はしない。
    // 同名の商品があれば更新し、無ければ足す。
    for (const [i, p] of entry.picks.entries()) {
      const existing = await db.souvenirPick.findFirst({
        where: { souvenirId: souvenir.id, name: p.name },
        select: { id: true },
      });

      const data = {
        name: p.name,
        nameJa: p.nameJa ?? null,
        size: p.size ?? null,
        priceRange: p.priceRange ?? null,
        reason: p.reason,
        role: p.role ?? "standard",
        displayOrder: i,
      };

      if (existing) {
        await db.souvenirPick.update({ where: { id: existing.id }, data });
      } else {
        await db.souvenirPick.create({
          data: { ...data, souvenirId: souvenir.id },
        });
      }
      picks += 1;
    }

    items += 1;
    console.log(`✓ ${souvenir.name} (${entry.picks.length}点)`);
  }

  console.log(`\n${items}品目・計${picks}点の商品を投入。`);
}

const invokedDirectly = process.argv[1]?.endsWith("seed-souvenir-picks.ts");

if (invokedDirectly) {
  main()
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
}

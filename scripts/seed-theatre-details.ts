/**
 * 劇場の実用情報(最寄駅・客席数・運営グループ・メモ)を入れる。
 *
 * 住所と座標は migrate-musical-theatres.ts が作品から移しているので、
 * ここでは人が調べた情報だけを足す。
 *
 * 客席数は「約」で扱う。劇場は改装のたびに数十席単位で変わり、
 * 公式サイトの数字も版によって食い違う。座席の選び方を書くうえで
 * 必要なのは桁(500席か2000席か)であって正確な数ではない。
 *
 * 実行:
 *   npx tsx scripts/seed-theatre-details.ts --dry
 *   npx tsx scripts/seed-theatre-details.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type TheatreDetail = {
  nearestStation: string;
  capacity: number;
  operator: string;
  notes: string;
};

/**
 * slug → 実用情報。
 *
 * notes は「その劇場に行く人が当日困ること」だけを書く。どの劇場にも
 * 当てはまる一般論(早めに着く、荷物は少なく)は
 * /musicals/west-end-etiquette 側の役目なので繰り返さない。
 */
const DETAILS: Record<string, TheatreDetail> = {
  sondheim: {
    nearestStation:
      "Piccadilly Circus (Bakerloo, Piccadilly) / Leicester Square 徒歩5分",
    capacity: 1080,
    operator: "Delfont Mackintosh Theatres",
    notes: `シャフツベリー・アベニューに面した、間口の狭い劇場です。ロビーが小さく、開場後は入口前の歩道に列ができます。雨の日は傘の置き場がないので、折りたたみにしておくと扱いが楽です。

**座席について**

- ストール(1階)は緩やかな傾斜で、前列に背の高い人が座ると視界が塞がれることがあります。
- ドレスサークル(2階)前方は舞台全体が見渡せ、この劇場ではもっとも評価の高い区画です。
- グランドサークル(3階)は傾斜が急で、高所が苦手な場合は前方の列を避けたほうが無難です。`,
  },
  "apollo-victoria": {
    nearestStation: "Victoria (Victoria, District, Circle) 徒歩3分",
    capacity: 2328,
    operator: "LW Theatres",
    notes: `ヴィクトリア駅のすぐ近くにある大型劇場です。座席数が2300を超えるため、同じ「後方席」でも他の劇場よりかなり遠くなります。

**座席について**

- ストール後方やサークル後方は舞台までの距離があり、表情までは見えません。演出の規模を楽しむ作品なので、双眼鏡があると細部まで追えます。
- 劇場が大きいぶん通路も長く、休憩中のトイレは混みます。並ぶ前提で時間を見ておくとよいです。`,
  },
  lyceum: {
    nearestStation:
      "Covent Garden (Piccadilly) / Charing Cross / Temple 徒歩5〜8分",
    capacity: 2100,
    operator: "ATG Tickets",
    notes: `ストランドからほど近い大劇場です。客席が広く、演出で客席の通路を使う場面があります。

**座席について**

- 通路側の席は、演者が近くを通る場面に出会えることがあります。
- ストール後方から3階席までは距離があるため、舞台美術の全体像を見たいか、表情を見たいかで階を選ぶと後悔しません。`,
  },
  palace: {
    nearestStation:
      "Leicester Square (Northern, Piccadilly) / Tottenham Court Road 徒歩3分",
    capacity: 1400,
    operator: "Nimax Theatres",
    notes: `ケンブリッジ・サーカスの角に建つ、赤レンガの大きな建物です。

**座席について**

- 上階へは階段が多く、エレベーターの利用には事前の連絡が要る場合があります。足に不安があるときは購入前に劇場へ確認してください。
- 上演時間の長い作品が入ることが多い劇場です。座席の余裕を優先すると、終盤の疲れ方が変わります。`,
  },
  "victoria-palace": {
    nearestStation: "Victoria (Victoria, District, Circle) 徒歩2分",
    capacity: 1550,
    operator: "Delfont Mackintosh Theatres",
    notes: `ヴィクトリア駅の正面にあり、駅からの分かりやすさはウエストエンドでも屈指です。

**座席について**

- 改装が新しく、座席の間隔とサイトラインは全体に良好です。
- 早口の台詞が続く作品が入る場合、後方席だと聞き取りの負担が上がります。前方〜中列を選べると楽になります。`,
  },
  "gillian-lynne": {
    nearestStation: "Holborn (Central, Piccadilly) / Covent Garden 徒歩5分",
    capacity: 1200,
    operator: "LW Theatres",
    notes: `ドルリー・レーンにある、ウエストエンドでは珍しい現代建築の劇場です。

**座席について**

- 客席が舞台を囲む形に近く、他の劇場より「安い席の見切れ」が起きにくい構造です。
- 傾斜がしっかりついているため、前列の人の頭で視界が塞がれる心配は小さめです。`,
  },
  dominion: {
    nearestStation: "Tottenham Court Road (Central, Northern, Elizabeth) 徒歩1分",
    capacity: 2069,
    operator: "Nederlander",
    notes: `トッテナム・コート・ロード駅の目の前にある大型劇場です。エリザベス線が通っており、ヒースロー方面からの移動が楽な立地です。

**座席について**

- 2000席規模のため、後方席は舞台がかなり遠くなります。
- ロビーと客席の間に階段があり、混雑時は流れが滞ります。開演直前の到着は避けたほうが安全です。`,
  },
  "prince-edward": {
    nearestStation:
      "Leicester Square (Northern, Piccadilly) / Tottenham Court Road 徒歩4分",
    capacity: 1716,
    operator: "Delfont Mackintosh Theatres",
    notes: `ソーホーの中心、オールド・コンプトン・ストリートに面しています。終演後に食事をする店が徒歩圏に多い立地です。

**座席について**

- 客席が横に広く、端の席は舞台を斜めから見る形になります。中央寄りを選べると見え方が安定します。`,
  },
  cambridge: {
    nearestStation: "Covent Garden (Piccadilly) / Leicester Square 徒歩3分",
    capacity: 1231,
    operator: "Delfont Mackintosh Theatres",
    notes: `セブン・ダイヤルズに近い、円形の外観が目印の劇場です。

**座席について**

- 舞台と客席が近く、1階前方は演者の表情がよく見えます。
- 子ども向けの作品が入ることが多い劇場です。小さな子どもには座席用のクッションを貸し出していることがあるので、必要なら入場時に尋ねてみてください。`,
  },
  "his-majestys": {
    nearestStation: "Piccadilly Circus (Bakerloo, Piccadilly) 徒歩5分",
    capacity: 1216,
    operator: "LW Theatres",
    notes: `ヘイマーケットに建つ、1897年開場の歴史ある劇場です。内装の装飾そのものが見どころになります。

**座席について**

- 古い劇場のため、ボックス席や上階の一部は柱で視界が遮られる「制限付き視界(restricted view)」になります。安い席にはその表示があるので、購入時に必ず確認してください。
- 座席の幅は現代の劇場より狭めです。`,
  },
  gielgud: {
    nearestStation: "Piccadilly Circus (Bakerloo, Piccadilly) 徒歩4分",
    capacity: 986,
    operator: "Delfont Mackintosh Theatres",
    notes: `シャフツベリー・アベニュー沿いの中規模劇場です。

**座席について**

- 1000席弱と手頃な大きさで、後方席でも舞台が遠すぎません。
- 上階は傾斜が急です。手すりを使って昇り降りしてください。`,
  },
  adelphi: {
    nearestStation: "Charing Cross / Covent Garden / Embankment 徒歩5分",
    capacity: 1500,
    operator: "LW Theatres",
    notes: `ストランドに面したアール・デコ調の劇場です。

**座席について**

- ストールは傾斜が緩く、前方の人の頭が視界に入りやすい区画があります。
- 大がかりな舞台装置を使う作品が入ることが多く、その場合は少し引いた位置のほうが仕掛けの全体が見えます。`,
  },
  lyric: {
    nearestStation: "Piccadilly Circus (Bakerloo, Piccadilly) 徒歩4分",
    capacity: 915,
    operator: "Nimax Theatres",
    notes: `シャフツベリー・アベニューでもっとも古い劇場のひとつです。

**座席について**

- 900席規模で舞台との距離が近く、音楽を主体にした作品との相性がよい会場です。
- 上階へは階段のみの経路があります。`,
  },
  novello: {
    nearestStation: "Covent Garden / Temple / Charing Cross 徒歩5分",
    capacity: 1105,
    operator: "Delfont Mackintosh Theatres",
    notes: `ストランド沿いの劇場です。オールドウィッチにも近く、終演後の移動の選択肢が多い立地です。

**座席について**

- サークル前方は舞台全体を見下ろす形になり、群舞のある作品では隊形がよく見えます。`,
  },
  piccadilly: {
    nearestStation: "Piccadilly Circus (Bakerloo, Piccadilly) 徒歩3分",
    capacity: 1200,
    operator: "ATG Tickets",
    notes: `デンマン・ストリートにある劇場です。ピカデリー・サーカスの喧騒からすぐ入れます。

**座席について**

- 客席が広めに取られており、大がかりな装飾を使う演出では、ある程度引いた席のほうが世界観を捉えやすくなります。`,
  },
  "prince-of-wales": {
    nearestStation: "Piccadilly Circus (Bakerloo, Piccadilly) 徒歩3分",
    capacity: 1160,
    operator: "Delfont Mackintosh Theatres",
    notes: `コヴェントリー・ストリートに面した、比較的新しい内装の劇場です。

**座席について**

- 改装が入っており、座席の間隔は同規模の古い劇場より快適です。
- サイトラインが良く、極端に見えにくい席は少ない構造です。`,
  },
  vaudeville: {
    nearestStation: "Charing Cross / Covent Garden / Embankment 徒歩5分",
    capacity: 690,
    operator: "Nimax Theatres",
    notes: `ストランド沿いの小ぶりな劇場です。

**座席について**

- 700席弱と小さく、どの席からも舞台が近いのが最大の利点です。
- そのぶん客席の通路が狭く、中央の席は出入りに人を立たせることになります。休憩でロビーへ出たい場合は通路側が快適です。`,
  },
  "noel-coward": {
    nearestStation: "Leicester Square (Northern, Piccadilly) 徒歩3分",
    capacity: 872,
    operator: "Delfont Mackintosh Theatres",
    notes: `セント・マーチンズ・レーンにある劇場です。台詞主体の作品が入ることが多い会場です。

**座席について**

- 舞台と客席の距離が近く、台詞のニュアンスが伝わりやすい構造です。
- 上階の前方は手すりが視界に入る席があります。`,
  },
  "theatre-royal-drury-lane": {
    nearestStation: "Covent Garden (Piccadilly) / Holborn 徒歩5分",
    capacity: 2196,
    operator: "LW Theatres",
    notes: `1663年に始まる、ロンドンでもっとも歴史の長い劇場です。大規模な改修を経ており、内部は歴史的な装飾と現代的な設備が同居しています。

**座席について**

- 2000席超の大劇場で、階によって体験が大きく変わります。
- ロビーやバーが広く、開演前の時間を過ごしやすい劇場です。早めに入って建物そのものを見る価値があります。`,
  },
  phoenix: {
    nearestStation: "Tottenham Court Road (Central, Northern, Elizabeth) 徒歩3分",
    capacity: 1012,
    operator: "ATG Tickets",
    notes: `チャリング・クロス・ロードに面した劇場です。

**座席について**

- ストールとサークルの傾斜がしっかりしており、後方でも見やすい部類です。`,
  },
  duchess: {
    nearestStation: "Covent Garden / Temple / Holborn 徒歩5分",
    capacity: 494,
    operator: "Nimax Theatres",
    notes: `ウエストエンドでも小さい部類に入る劇場です。キャサリン・ストリート沿いにあります。

**座席について**

- 500席弱で舞台が非常に近く、細かい所作まで見えます。
- 客席への入口が地下にあり、階段を降りる構造です。`,
  },
  criterion: {
    nearestStation: "Piccadilly Circus (Bakerloo, Piccadilly) 徒歩1分",
    capacity: 588,
    operator: "ATG Tickets",
    notes: `ピカデリー・サーカスの真下にある、全席が地下の珍しい劇場です。

**座席について**

- 客席へは階段を降ります。地下のため、閉所が苦手な場合は通路側を選ぶと落ち着きます。
- 小規模で舞台が近く、コメディとの相性がよい会場です。`,
  },
  fortune: {
    nearestStation: "Covent Garden (Piccadilly) / Holborn 徒歩4分",
    capacity: 432,
    operator: "ATG Tickets",
    notes: `ラッセル・ストリートにある、ウエストエンド最小級の劇場です。

**座席について**

- 400席台で、後方席でも舞台との距離がほとんど気になりません。
- 客席は縦に積み上がる構造で、上階は傾斜が急です。`,
  },
  "st-martins": {
    nearestStation: "Leicester Square (Northern, Piccadilly) 徒歩3分",
    capacity: 550,
    operator: "Nimax Theatres",
    notes: `ウェスト・ストリートにある小劇場です。長期上演の作品が入っており、内装も当時のまま保たれています。

**座席について**

- 小さな劇場のため、どの席からも舞台がよく見えます。
- 座席の幅と足元は現代の基準では狭めです。`,
  },
  arts: {
    nearestStation: "Leicester Square (Northern, Piccadilly) 徒歩2分",
    capacity: 350,
    operator: "独立系",
    notes: `グレート・ニューポート・ストリートにある小劇場です。

**座席について**

- 350席ほどで、舞台と客席の一体感が強い会場です。
- 入口が分かりにくいので、時間に余裕を持って向かってください。`,
  },
  "charing-cross": {
    nearestStation: "Charing Cross / Embankment 徒歩2分",
    capacity: 265,
    operator: "独立系",
    notes: `ヴィリアーズ・ストリートの、鉄道高架下にある小劇場です。

**座席について**

- 265席と非常に小さく、舞台との距離が近い会場です。
- 入口はアーチ下にあり、初見では見落としやすい場所にあります。`,
  },
  wyndhams: {
    nearestStation: "Leicester Square (Northern, Piccadilly) 徒歩2分",
    capacity: 750,
    operator: "Delfont Mackintosh Theatres",
    notes: `チャリング・クロス・ロードに面した、装飾の美しい中規模劇場です。

**座席について**

- 750席ほどで、台詞主体の作品でも後方まで声が届きます。
- 上階は傾斜が急で、前方の列は柵が視界に入ることがあります。`,
  },
  "kit-kat-club": {
    nearestStation: "Charing Cross / Embankment 徒歩3分",
    capacity: 600,
    operator: "ATG Tickets",
    notes: `プレイハウス劇場を、上演作品に合わせてキャバレー会場として改装したものです。通常の劇場とは入場の仕方から違います。

**座席について**

- 客席がテーブル席を含む構成で、席種によって体験がまったく変わります。購入時に席種の説明をよく読んでください。
- 開演のかなり前から入場して過ごす形式が案内されることがあります。指定された時刻を確認しておいてください。`,
  },
  "county-hall": {
    nearestStation: "Waterloo (Jubilee, Northern, Bakerloo) / Westminster 徒歩5分",
    capacity: 500,
    operator: "独立系",
    notes: `テムズ川南岸、旧ロンドン市庁舎の建物内に設けられた会場です。ロンドン・アイのすぐ隣にあります。

**座席について**

- 元は議事堂だった空間を使っており、通常の劇場とは客席の配置が異なります。
- 川沿いで観光地のただ中にあるため、開演前後は周辺が混雑します。`,
  },
  "empress-museum-earls-court": {
    nearestStation: "Earl's Court (District, Piccadilly) / West Brompton 徒歩5分",
    capacity: 1200,
    operator: "独立系",
    notes: `劇場ではなく、アールズ・コートの展示施設を使った会場です。中心部の劇場街からは離れています。

**座席について**

- 一般的な劇場の座席構成とは異なります。購入時に会場図を確認してください。
- ウエストエンドから地下鉄で20分ほどかかります。他の予定と組み合わせる場合は移動時間を見ておいてください。`,
  },
  "troubadour-wembley-park": {
    nearestStation: "Wembley Park (Jubilee, Metropolitan) 徒歩5分",
    capacity: 2000,
    operator: "Troubadour Theatres",
    notes: `ウェンブリーにある大型の常設仮設劇場です。ウエストエンドではなく、中心部から地下鉄で30分ほどかかります。

**座席について**

- 大規模な装置を前提とした会場で、客席は舞台を広く囲む構成です。
- ウェンブリー・スタジアムでの催しと日程が重なると、駅と周辺が非常に混雑します。試合や公演の予定を調べてから向かうと安心です。`,
  },
};

async function main() {
  const dry = process.argv.includes("--dry");
  const theatres = await prisma.theatre.findMany({
    select: { slug: true, name: true },
    orderBy: { slug: "asc" },
  });

  const missing = theatres.filter((t) => !DETAILS[t.slug]);
  if (missing.length > 0) {
    console.log("DETAILS 未記入の劇場:");
    for (const t of missing) console.log(`  - ${t.slug} (${t.name})`);
  }

  let updated = 0;
  for (const t of theatres) {
    const detail = DETAILS[t.slug];
    if (!detail) continue;

    if (dry) {
      console.log(`${t.slug}: ${detail.nearestStation} / 約${detail.capacity}席`);
      continue;
    }

    await prisma.theatre.update({
      where: { slug: t.slug },
      data: {
        nearestStation: detail.nearestStation,
        capacity: detail.capacity,
        operator: detail.operator,
        notes: detail.notes,
        lastVerifiedAt: new Date(),
      },
    });
    updated++;
  }

  console.log(
    dry
      ? `\n--dry: ${theatres.length - missing.length}件を更新対象として確認しました。`
      : `${updated}件を更新しました。`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

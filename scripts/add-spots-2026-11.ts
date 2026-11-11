/**
 * 2026-11 の鮮度調査で見つかった、サイトに無かった2か所を追加する。
 *
 *   npx tsx scripts/add-spots-2026-11.ts            # 何が起きるか表示＋描画チェック
 *   npx tsx scripts/add-spots-2026-11.ts --apply    # 投入
 *
 * 冪等。slug で upsert し、付随データ(読み物 / MuseumInfo / OpeningHours /
 * 見どころ / 豆知識 / 歩き方)は作り直す。
 *
 * ------------------------------------------------------------------
 * なぜこの2か所なのか
 * ------------------------------------------------------------------
 * - ホライゾン22(観光スポット): シティでいちばん高いビルの58階にある無料の
 *   展望ギャラリー。スカイ・ガーデン(sky-garden-london)と同じく、無料・予約制の
 *   眺望として旅行者に需要がある。2023年に開いていたが、サイトに行が無かった。
 * - V&Aイースト・ストアハウス(美術館): 2025年5月に開いた V&A の収蔵庫。
 *   V&Aイースト・ミュージアム(va-east-museum)の豆知識と歩き方が「公園の反対側に
 *   ある倉庫型の施設」として案内しているのに、その行き先のページが無かった。
 *
 * 見送ったもの(2026-11-11 の報告より):
 *   - Absurd City(Wake The Tiger、ウェストフィールド・ロンドン、2026/10/15開業):
 *     有料の没入型アートで、既存の frameless-london と性格が重なる
 *   - Lightroom(キングス・クロス): 演目が入れ替わる会場。過去に演目ごとに
 *     2本作って非公開にした経緯がある(prehistoric-planet / moonwalkers)
 *   - Museum of Shakespeare(ショーディッチ): 開館日が未発表
 *
 * ------------------------------------------------------------------
 * SOURCES(2026-11-11 に確認)
 * ------------------------------------------------------------------
 * ホライゾン22
 *   https://horizon22.co.uk/            「Located on Level 58」「300-degree views」
 *   https://horizon22.co.uk/visit       「Visiting Horizon 22 is free」、平日10-18 / 土10-17 / 日10-16、
 *                                       「22 Bishopsgate London, EC2N 4BQ」「the tallest building in
 *                                       the City of London」「41 seconds ... two high-speed lifts ...
 *                                       up to eight metres per second」
 *   https://en.wikipedia.org/wiki/22_Bishopsgate
 *                                       58階・254m、建物は278m・62階・2020年完成、設計 PLP Architecture、
 *                                       「Tickets are free as a condition of the planning permission ...
 *                                       granted by the City of London」、当初案 The Pinnacle(KPF)は
 *                                       「Helter Skelter」と呼ばれた
 *   https://www.ianvisits.co.uk/venues/horizon-22/
 *                                       「they expect the average visit to last around 45 minutes」
 *   最寄駅は TfL の Journey Planner の徒歩経路(lib/tfl/nearest-station)。
 *
 * V&Aイースト・ストアハウス
 *   https://www.vam.ac.uk/east/storehouse/visit
 *                                       毎日10-18、木・土は22時まで、24〜26日休み、無料・予約不要、
 *                                       「2 Parkes Street」E20 3AX、Hackney Wick 徒歩8分 / Stratford 20分、
 *                                       388番バスが Here East の前に停まる
 *   https://www.vam.ac.uk/info/order-an-object
 *                                       無料、2週間以上前にオンラインで予約、同じ館から最大5点
 *   https://www.vam.ac.uk/info/david-bowie-centre-faqs
 *                                       8万点超、200点ずつ入れ替え、2026-07-13 から入場に券が要る、会員は不要
 *   https://artdependence.com/articles/va-east-storehouse-opens-to-the-public-on-saturday-31-may/
 *                                       2025-05-31 開館、DS+R、旧五輪メディア・放送センター(Here East)、
 *                                       25万点・35万冊・1,000件のアーカイブ、4層、Weston Collections Hall、
 *                                       棚の端の100を超える小展示、6点の大型展示(カウフマン・オフィス、
 *                                       トリホス宮殿の天井、フランクフルト・キッチン、ロビン・フッド・
 *                                       ガーデンズ、アグラの列柱、ピカソの《青列車》の舞台幕 10m×11m)、
 *                                       予約の一番人気は1954年のバレンシアガのドレス
 *   https://www.timeout.com/london/news/first-look-inside-the-mind-blowing-new-v-a-east-storehouse-in-stratford-052825
 *                                       ガラスの床、ブライス・ハウスから移った、ロビン・フッド・ガーデンズの
 *                                       外壁が中2階から下がり2階で廊下を再現、「the largest Picasso in the world」
 *   最寄駅の徒歩分は TfL の Journey Planner(7分)。公式は8分。
 *
 * 本文の約束は既存の add-attractions / add-museums と同じ。事実(料金・開館・
 * 所要)は読み物に書かない。閉じの ** を句読点・閉じ括弧の直後に置かない。
 */

import "dotenv/config";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismaClient } from "@prisma/client";
import { imageColumns, resolveCommonsImage } from "./lib/commons";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const CHECKED = new Date("2026-11-11T12:00:00Z");

/* ------------------------------------------------------------------ */
/* ホライゾン22                                                        */
/* ------------------------------------------------------------------ */

const HORIZON_IMAGE = "File:Horizon 22 viewing gallery.jpg";

const HORIZON = {
  slug: "horizon-22",
  name: "ホライゾン22",
  engName: "Horizon 22",
  tagline: "22ビショップスゲートの58階、地上254メートルの無料の展望ギャラリー",
  summary:
    "シティでいちばん高いビル、22ビショップスゲートの58階(地上254メートル)にある展望ギャラリー。入場は無料で、日時指定の券を公式サイトで取る。2基の高速エレベーターが41秒で58階まで上がる。無料なのは、シティ・オブ・ロンドンがこのビルの建設を許可したときの条件だから。",
  address: "22 Bishopsgate, London EC2N 4BQ, UK",
  // 郵便番号 EC2N 4BQ の代表点(postcodes.io)。
  lat: 51.514149,
  lng: -0.083493,
  website: "https://horizon22.co.uk/",
  category: "architecture",
  recommendLevel: 4,
  isFree: true,
  isForKids: false,
  mustSee: false,
  priceAdult: "無料(要予約)",
  priceChild: "無料(要予約)",
  durationText: "45分前後",
  nearestStation: "Bank駅 徒歩6分",
  openingHours: "平日 10:00〜18:00 / 土 10:00〜17:00 / 日 10:00〜16:00",
  closedWeekdays: [] as number[],
  closedDaysCheckedAt: CHECKED,
  closedNote: null,
  area: "city",
  stories: [
    {
      kind: "context",
      heading: "なぜ無料で上がれるのか",
      body: `22ビショップスゲートは、**2020年**に完成した高さ**278メートル**・62階建てのオフィスビルで、シティ・オブ・ロンドンでいちばん高い。その58階、地上**254メートル**の階をまるごと使ったのがホライゾン22である。

上がるのに料金がかからないのは、運営側の好意ではない。シティ・オブ・ロンドンがこのビルの建設を許可したとき、無料で公開する展望階を設けることを条件にしたからである。金融街の空を民間のビルが占めるかわりに、その眺めの一部を誰でも使えるようにする、という取引になっている。

エレベーターは2基で、毎秒最大8メートルで昇り、58階まで**41秒**しかかからない。公式は眺めを「300度」と書いている。ぐるりと一周見渡せるわけではない、ということでもある。`,
    },
    {
      kind: "history",
      heading: "「ヘルター・スケルター」になるはずだった場所",
      body: `この場所には、もともと別の超高層ビルが建つはずだった。**ピナクル**と名付けられた当初案は、設計事務所コーン・ペダーセン・フォックスによるもので、その螺旋状の姿から、遊園地の螺旋の滑り台になぞらえて**ヘルター・スケルター**と呼ばれた。

実際に建ったのは、設計をPLPアーキテクチャーに改めた別のビルである。2016年の終わりに改めて工事が始まり、費用のかかる螺旋の形は取りやめになった。いまの22ビショップスゲートに、あだ名の由来になった形は残っていない。`,
    },
  ],
};

/* ------------------------------------------------------------------ */
/* V&Aイースト・ストアハウス                                           */
/* ------------------------------------------------------------------ */

const STOREHOUSE_IMAGE = "File:Inside the V&A East Storehouse 2025-08-17.jpg";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const O = (o: string, c: string): [string, string] => [o, c];

const STOREHOUSE = {
  slug: "va-east-storehouse",
  name: "V&Aイースト・ストアハウス",
  engName: "V&A East Storehouse",
  tagline: "V&Aの収蔵庫の棚のあいだを歩いて見る、無料の施設",
  description: `クイーン・エリザベス・オリンピック・パークの北西、ヒア・イーストの一角に**2025年5月31日**に開いた、V&A(ヴィクトリア＆アルバート博物館)の収蔵庫。2012年ロンドン五輪のメディア・放送センターだった建物の一部を使っている。入館は無料で、予約も要らない。

ここは展示室ではなく、倉庫そのものである。**25万点**を超える品と**35万冊**の本、1,000件のアーカイブが4層の建物に収められていて、以前はウェスト・ケンジントンのブライス・ハウスにしまわれていたものだ。中央の吹き抜け、ウェストン・コレクションズ・ホールからは、鋼の棚が並ぶ各階を見渡せる。棚の端には100を超える小さな展示が組み込まれ、数か月ごとに入れ替わる。

建物に組み込まれた大物もある。フランク・ロイド・ライトが設計した1930年代のカウフマン・オフィス、15世紀スペインのトリホス宮殿の天井、マルガレーテ・シュッテ＝リホツキーのフランクフルト・キッチン、東ロンドンの集合住宅ロビン・フッド・ガーデンズの外壁の一部、17世紀ムガルのアグラの列柱、そして高さ10メートル・幅11メートルのピカソの舞台幕《青列車》。設計はニューヨークのディラー・スコフィディオ＋レンフロ。`,
  summary:
    "V&Aの収蔵庫の中を歩いて見る、無料の施設\n・2025年5月31日開館\n・25万点を超える収蔵品と35万冊の本\n・見たい品を予約して手元で見られる(最大5点)",
  blurb: "展示室のかわりに、天井まで届く鋼の棚が並ぶ。そのあいだを歩くこと自体が見学になる。",
  highlights: ["2025年開館", "収蔵庫を歩く", "無料"],
  price: 0,
  tourPrice: 0,
  address: "2 Parkes Street, Queen Elizabeth Olympic Park, London E20 3AX",
  // 郵便番号 E20 3AX の代表点(postcodes.io)。
  lat: 51.545392,
  lng: -0.020826,
  website: "https://www.vam.ac.uk/east/storehouse/visit",
  recommendLevel: 3,
  isForChildren: false,
  hours: [
    O("10:00", "18:00"),
    O("10:00", "18:00"),
    O("10:00", "18:00"),
    O("10:00", "22:00"),
    O("10:00", "18:00"),
    O("10:00", "22:00"),
    O("10:00", "18:00"),
  ],
  info: {
    reservationRequired: false,
    nearestStation: "Hackney Wick",
    stationWalkingMinutes: 7,
    admissionFeeAdult: 0,
    admissionFeeStudent: 0,
    admissionFeeChild: 0,
  },
  highlightSpots: [
    {
      title: "中央の吹き抜けから4層を見渡す",
      location: "ウェストン・コレクションズ・ホール",
      body: "入ってすぐの吹き抜けが、建物の中心のウェストン・コレクションズ・ホールです。床の一部がガラスで、下の階の棚まで見通せます。鋼の棚が4層にわたって並ぶ構造を、ここで一度つかんでから歩き出すと迷いません。",
    },
    {
      title: "ピカソの舞台幕《青列車》",
      location: "デヴィッド・アンド・モリー・ローウェル・ボースウィック・ギャラリー",
      body: "バレエ・リュスの舞台『青列車』のための幕で、高さ10メートル、幅11メートルあります。Time Out は「世界最大のピカソ」と書いています。大きすぎて長く公開されていなかった6点の大型展示のひとつで、専用の展示室に掛けられています。",
    },
    {
      title: "建物に組み込まれた、ほかの建物のかけら",
      body: "フランク・ロイド・ライトのカウフマン・オフィスは、米国の外に残る唯一の完全なライトの室内です。東ロンドンの集合住宅ロビン・フッド・ガーデンズは、外壁が中2階から下がり、2階では住戸の廊下を再現した部分に入れます。15世紀スペインのトリホス宮殿の金箔の天井もあります。",
    },
  ],
  trivia: [
    {
      title: "見たい品を予約して、手元で見せてもらえる",
      content:
        "「オーダー・アン・オブジェクト」という無料の仕組みで、収蔵品のうち見たいものを最大5点まで予約し、専用の部屋で出してもらえます。予約はオンラインで、訪問の2週間以上前までに済ませます。受付の開始から約2週間で250件を超える予約が入り、いちばん人気はバレンシアガの1954年のピンクのシルクのイブニングドレスだったそうです。",
    },
    {
      title: "デヴィッド・ボウイのアーカイブもここにある",
      content:
        "8万点を超えるデヴィッド・ボウイのアーカイブを収めたデヴィッド・ボウイ・センターも、この建物の中にあります。展示は200点ずつ入れ替わります。2026年7月13日からは、入るのに券が要るようになりました(V&Aの会員は不要)。",
    },
  ],
  visitFlow: [
    {
      kind: "arrival",
      title: "ハックニー・ウィック駅から歩いて7〜8分",
      body: "最寄りはオーバーグラウンドのハックニー・ウィック駅です。建物はヒア・イーストの一角にあり、388番のバスがヒア・イーストの前に停まります。ストラトフォード駅からは歩いて20分ほどかかります。入館は無料で予約も要りませんが、混む時間は入口に列ができることがあります。",
    },
    {
      kind: "highlight",
      title: "吹き抜けで全体をつかんでから棚へ",
      body: "まず中央の吹き抜けから各階の棚を見渡し、どの階に何が並んでいるかをつかみます。棚の端に組み込まれた小さな展示は、数か月ごとに入れ替わります。前に来た人の感想と違うものが置かれていても、それがこの施設の普通です。",
    },
    {
      kind: "tip",
      title: "手元で見たい品があるなら、2週間前に予約",
      body: "オーダー・アン・オブジェクトの予約は、訪問の2週間以上前までにオンラインで済ませる必要があります。当日に頼むことはできません。旅程が決まったら、先に見たい品を選んで予約しておきます。",
    },
    {
      kind: "tip",
      title: "木曜と土曜は22時まで",
      body: "木曜と土曜は22時まで開いています。ほかの曜日は18時で閉まります。昼にオリンピック公園を歩いて、夕方から入るという組み立てもできます。",
    },
    {
      kind: "missable",
      title: "V&Aイースト・ミュージアムは別の建物",
      body: "同じV&Aイーストの名を持つミュージアム(展示館)は、公園の反対側、アクアティクス・センターの近くにある別の建物です。歩くと20分ほどかかるので、両方回るなら半日を見ておきます。ミュージアムも入館は無料です。",
    },
  ] as { kind: "arrival" | "highlight" | "missable" | "tip"; title: string; body: string }[],
};

/* ------------------------------------------------------------------ */
/* 描画チェック                                                        */
/* ------------------------------------------------------------------ */

function rendersRawBold(md: string): boolean {
  if (!md.includes("**")) return false;
  const html = renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, md),
  );
  return html.includes("**");
}

/** プレーンテキストの欄にマークダウンが混じっていないか。 */
const MD = /\*\*|\[.+?\]\(.+?\)/;

function check(): string[] {
  const bad: string[] = [];
  for (const s of HORIZON.stories) {
    // 読み物は段落ごとに描画される。
    s.body.split(/\n\n+/).forEach((p, i) => {
      if (rendersRawBold(p)) bad.push(`horizon-22 / ${s.heading} 第${i + 1}段落`);
    });
  }
  if (MD.test(HORIZON.summary) || MD.test(HORIZON.tagline)) bad.push("horizon-22 / summary・tagline");
  STOREHOUSE.description
    .split(/\r?\n/)
    .filter((p) => p.trim())
    .forEach((p, i) => {
      if (rendersRawBold(p)) bad.push(`va-east-storehouse / description 第${i + 1}段落`);
    });
  const plain = [
    STOREHOUSE.summary,
    STOREHOUSE.blurb,
    ...STOREHOUSE.highlights,
    ...STOREHOUSE.highlightSpots.flatMap((h) => [h.title, h.body]),
    ...STOREHOUSE.trivia.flatMap((t) => [t.title, t.content]),
    ...STOREHOUSE.visitFlow.flatMap((v) => [v.title, v.body]),
  ];
  plain.forEach((t) => {
    if (MD.test(t)) bad.push(`va-east-storehouse / プレーンテキスト欄: ${t.slice(0, 20)}…`);
  });
  // 日本語の本文に半角英単語が紛れていないか(attraction-story-writing-rules)。
  const texts = [
    ...HORIZON.stories.map((s) => s.body),
    HORIZON.summary,
    STOREHOUSE.description,
    ...plain,
  ];
  texts.forEach((t) => {
    const words = t.match(/[A-Za-z]{3,}/g)?.filter((w) => !["PLP", "Time", "Out", "V&A"].includes(w));
    if (words?.length) bad.push(`半角英単語: ${words.join(", ")} … ${t.slice(0, 20)}`);
  });
  return bad;
}

async function main() {
  const problems = check();
  if (problems.length > 0) {
    problems.forEach((p) => console.error(`✗ ${p}`));
    process.exitCode = 1;
    return;
  }

  const [horizonImage, storehouseImage] = await Promise.all([
    resolveCommonsImage(HORIZON_IMAGE),
    resolveCommonsImage(STOREHOUSE_IMAGE),
  ]);
  if (!horizonImage || !storehouseImage) throw new Error("Commons の画像を解決できなかった");

  console.log(APPLY ? "== 投入 ==\n" : "== ドライラン(--apply で投入) ==\n");

  // --- ホライゾン22
  const clash = await prisma.attraction.findFirst({
    where: { name: HORIZON.name, slug: { not: HORIZON.slug } },
    select: { slug: true },
  });
  if (clash) throw new Error(`name が ${clash.slug} と衝突する`);
  const existingSpot = await prisma.attraction.findUnique({ where: { slug: HORIZON.slug }, select: { id: true } });
  console.log(
    `${HORIZON.name} (${HORIZON.slug}) ${existingSpot ? "既存を更新" : "新規"} / 読み物${HORIZON.stories.length}本 ` +
      `${HORIZON.stories.reduce((n, s) => n + s.body.length, 0)}字 / 画像 ${horizonImage.credit}`,
  );

  // --- V&Aイースト・ストアハウス
  const museumClash = await prisma.museum.findFirst({
    where: { name: STOREHOUSE.name, slug: { not: STOREHOUSE.slug } },
    select: { slug: true },
  });
  if (museumClash) throw new Error(`name が ${museumClash.slug} と衝突する`);
  const existingMuseum = await prisma.museum.findUnique({ where: { slug: STOREHOUSE.slug }, select: { id: true } });
  console.log(
    `${STOREHOUSE.name} (${STOREHOUSE.slug}) ${existingMuseum ? "既存を更新" : "新規"} / 本文 ${STOREHOUSE.description.length}字 / ` +
      `見どころ${STOREHOUSE.highlightSpots.length} 豆知識${STOREHOUSE.trivia.length} 歩き方${STOREHOUSE.visitFlow.length} / ` +
      `画像 ${storehouseImage.credit}`,
  );

  if (!APPLY) {
    console.log("\n--apply を付けると投入します。");
    return;
  }

  const { stories, ...spotCols } = HORIZON;
  const spot = await prisma.attraction.upsert({
    where: { slug: HORIZON.slug },
    create: { ...spotCols, ...imageColumns(horizonImage), image: horizonImage.url },
    update: { ...spotCols, ...imageColumns(horizonImage), image: horizonImage.url },
    select: { id: true },
  });
  await prisma.$transaction([
    prisma.attractionStory.deleteMany({ where: { attractionId: spot.id } }),
    prisma.attractionStory.createMany({
      data: stories.map((s, i) => ({
        attractionId: spot.id,
        kind: s.kind,
        heading: s.heading,
        body: s.body,
        displayOrder: i + 1,
        // 移行スクリプトが触らない目印(attraction-story-source-guard)。
        source: "authored",
      })),
    }),
  ]);
  console.log(`  → ${HORIZON.slug} を投入`);

  const { hours, info, highlightSpots, trivia, visitFlow, ...museumCols } = STOREHOUSE;
  const museum = await prisma.museum.upsert({
    where: { slug: STOREHOUSE.slug },
    create: { ...museumCols, ...imageColumns(storehouseImage), image: storehouseImage.url, category: "museum" },
    update: { ...museumCols, ...imageColumns(storehouseImage), image: storehouseImage.url, category: "museum" },
    select: { id: true },
  });
  const id = museum.id;
  await prisma.$transaction([
    prisma.highlight.deleteMany({ where: { museumId: id } }),
    prisma.trivia.deleteMany({ where: { museumId: id } }),
    prisma.museumVisitStep.deleteMany({ where: { museumId: id } }),
    prisma.openingHours.deleteMany({ where: { museumId: id } }),
    prisma.museumInfo.deleteMany({ where: { museumId: id } }),
    prisma.openingHours.createMany({
      data: DAYS.map((day, i) => ({
        museumId: id,
        dayOfWeek: day,
        openTime: hours[i][0],
        closeTime: hours[i][1],
      })),
    }),
    prisma.museumInfo.create({ data: { museumId: id, website: STOREHOUSE.website, ...info } }),
    prisma.highlight.createMany({
      data: highlightSpots.map((h, i) => ({
        museumId: id,
        title: h.title,
        location: h.location ?? null,
        body: h.body,
        order: i,
      })),
    }),
    prisma.trivia.createMany({
      data: trivia.map((t) => ({ museumId: id, title: t.title, content: t.content })),
    }),
    prisma.museumVisitStep.createMany({
      data: visitFlow.map((s, i) => ({
        museumId: id,
        kind: s.kind,
        title: s.title,
        body: s.body,
        displayOrder: i + 1,
      })),
    }),
  ]);
  console.log(`  → ${STOREHOUSE.slug} を投入`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

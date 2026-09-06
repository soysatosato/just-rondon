/**
 * /sightseeing に M&M'sワールド 1件を追加する（2026-09 第4弾）。
 *
 *   npx tsx scripts/add-attractions-2026-09-4.ts            # 何が起きるか表示
 *   npx tsx scripts/add-attractions-2026-09-4.ts --apply    # 投入
 *
 * 冪等。slug で upsert する。AttractionStory は source: "authored" で入る。
 *
 * ------------------------------------------------------------------
 * なぜ1件だけのスクリプトなのか
 * ------------------------------------------------------------------
 * 第3弾(add-attractions-2026-09-3)で外した1件を、あとから足している。
 * 外した理由は公式サイトのURLを確認できなかったことで、内容ではない。
 * 1件のために本文と歩き方で2ファイルに割ると、どちらも中身が1件だけの
 * ファイルになるので、ここでは歩き方も同じファイルに入れてある。
 * 次にまとめて足すときは、これまでどおり2ファイルに戻すこと。
 *
 * ------------------------------------------------------------------
 * website をどう決めたか(重要)
 * ------------------------------------------------------------------
 * mms.com はボット遮断が強く、存在しないパスにも 403 を返す。
 * つまり 403 か 404 かで「そのページが実在するか」を判定できない。
 * 第3弾ではこれを理由に見送った。
 *
 * 決め手になったのは mmsworld.com である。この「M&M'sワールド」名の
 * ドメインは 301 で https://www.mms.com/en-us/explore/mms-stores を
 * 指しており、これは会社自身が出している正規のリダイレクトである。
 * 遷移先そのものは読めないが、ブランドがこの名前で公式に指している
 * 先が分かったので、短くて追随の効く mmsworld.com のほうを入れた。
 *
 * ------------------------------------------------------------------
 * 本文の書き方
 * ------------------------------------------------------------------
 * 菓子店であって観光施設ではない。宣伝文にならないよう、
 *   - 建物の来歴(旧スイス・センターと、外に立つグロッケンシュピール)
 *   - 量り売りが会計で驚かれること
 * を先に置く。「安くない」「ただの店である」と書けない記事なら、
 * このページは無いほうがよい。
 *
 * 閉じの ** を句読点・閉じ括弧の直後に置かないこと。
 * 歩き方(visitFlow)はプレーンテキスト描画。投入前に検出して止める。
 *
 * 画像は Wikimedia Commons。Commons API の imageinfo で確認済み。
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Story = {
  kind: "history" | "context" | "trivia" | "practical";
  heading: string | null;
  body: string;
};

type Step = {
  kind: "arrival" | "highlight" | "missable" | "tip";
  title: string;
  body: string;
};

type NewSpot = {
  slug: string;
  name: string;
  engName: string;
  tagline: string;
  summary: string;
  address: string;
  lat: number;
  lng: number;
  image: string;
  website: string;
  category: string;
  recommendLevel: number;
  isFree: boolean;
  isForKids: boolean;
  mustSee: boolean;
  priceAdult: string | null;
  priceChild: string | null;
  durationText: string | null;
  nearestStation: string | null;
  openingHours: string | null;
  closedWeekdays: number[];
  closedDaysCheckedAt: Date | null;
  closedNote: string | null;
  area: string | null;
  stories: Story[];
  visitFlow: Step[];
};

const CHECKED = new Date("2026-09-06");

export const SPOTS: NewSpot[] = [
  /*
   * SOURCES
   *   https://mmsworld.com/  （301 → mms.com の M&M's Stores）
   *   https://en.wikipedia.org/wiki/M%26M%27s_World
   *   https://en.wikipedia.org/wiki/Swiss_Centre,_London
   *   https://en.wikipedia.org/wiki/Leicester_Square
   *
   * ★ 営業時間は公式が読めないため代表値を入れ、closedDaysCheckedAt は
   *   確認済みにしてある。年中無休の小売店であることは複数の情報源で
   *   一致しており、曜日休業は無い。時刻のほうは幅を持たせた。
   */
  {
    slug: "mms-world-london",
    name: "M&M'sワールド ロンドン",
    engName: "M&M's World London",
    tagline: "菓子より、店の外に立つ時計のほうが見どころかもしれない",
    summary:
      "レスター・スクエアの角に建つ、4フロアのM&M's専門店。2011年開業で、菓子店としては世界最大級を名乗る。売り場の中心は20色以上の粒を量り売りする壁で、ここが会計で驚かれる。建っているのは1968年のスイス・センターの跡地で、その建物にあったスイスの仕掛け時計は解体されずに残り、いまも店の外の広場で毎正時に動いている。入店は無料。",
    address: "1 Swiss Court, London W1D 6AP, UK",
    lat: 51.5106,
    lng: -0.1316,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/b/bf/M%5EM%27s_World%2C_Leicester_Square_-_geograph.org.uk_-_7424043.jpg",
    website: "https://mmsworld.com/",
    category: "shop",
    recommendLevel: 2,
    isFree: true,
    isForKids: true,
    mustSee: false,
    priceAdult: "無料（入店）",
    priceChild: "無料（入店）",
    durationText: "30分",
    nearestStation: "Leicester Square 徒歩2分",
    openingHours: "10:00〜23:00頃（時期で前後する。公式で確認）",
    closedWeekdays: [],
    closedDaysCheckedAt: CHECKED,
    closedNote: null,
    area: "soho",
    stories: [
      {
        kind: "history",
        heading: "スイスの建物が消えて、時計だけが残った",
        body: `いまこの店が建っている場所には、**1968年**から**スイス・センター**という建物があった。スイスの観光局と銀行と時計店とレストランが入る、いわばスイスの出先である。レスター・スクエアの一角がスイスに割り当てられていた、と考えるとよい。

その建物は**2008年**に取り壊された。ただし、外壁に取り付けられていた**グロッケンシュピール**——鐘と からくり人形の仕掛け時計——だけは解体されなかった。**27個の鐘**と、牛を連れた牧夫や踊る人形が動くもので、地元で親しまれていたためである。

時計は保管されたのち、**2011年**に独立した塔として広場に建て直された。同じ年、跡地に開いたのがこの店である。つまり**建物は入れ替わったが、時計は場所に残った**。いま店から出てくる客のほとんどは、その塔を見上げずに通り過ぎていく。

住所が「スイス・コート」のままなのも、この経緯による。菓子屋の住所にスイスの名が残っているのは、消えた建物の名残である。`,
      },
      {
        kind: "context",
        heading: "観光施設ではなく、店である",
        body: `先に書いておくと、ここは**博物館でもアトラクションでもなく、菓子の小売店**である。入場は無料で、4フロアすべてが売り場になっている。乗り物も展示もない。

売り場の中心は、壁一面に並んだ**量り売りの筒**である。20色を超える粒が色ごとに詰まっていて、袋に好きなだけ取って、レジで**重さで**払う。ここが問題で、粒は軽いように見えて袋に入れると一気に嵩が増す。会計で表示される額に驚く客が毎日いる。取る前に、単価と自分の袋の重さを一度確かめたほうがよい。

もうひとつの売り物が**ロンドンらしさ**である。近衛兵の帽子をかぶった粒、二階建てバスに乗った粒、電話ボックスに入った粒。土産としては分かりやすく、そのぶん値も張る。

つまりこの店は、**行く価値の判断が人によってはっきり分かれる**場所である。子ども連れなら滞在時間の使い道として成立するし、菓子に興味がないなら10分で出ることになる。同じ広場に世界最大級を名乗る**レゴ・ストア**もあり、こちらも入店無料である。どちらも「無料で入れて、買わなければ0円」という点だけは共通している。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 入店は無料。買わずに見て出ても構わない
- 量り売りは**重さで課金**される。袋に取りすぎると会計で跳ね上がる
- 名前や短い文を印刷した粒を作れる機械がある。仕上がりまで時間がかかるので、混む時間帯は避けたほうがよい
- 週末と学校休暇の時期は通路が詰まる。空いているのは**平日の午前**
- 店の外の広場に立つ仕掛け時計は、旧スイス・センターから引き継がれたもの。毎正時に動く
- 同じ広場にレゴ・ストアがある。どちらも入店無料で、レゴのほうが空いていることが多い`,
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "レスター・スクエアの北西の角",
        body: "レスター・スクエア駅から徒歩2分、広場の北西の角に面しています。入店は無料で予約も要りません。週末と学校休暇の時期は通路が詰まるので、歩きやすいのは平日の午前です。",
      },
      {
        kind: "missable",
        title: "入る前に、外の仕掛け時計を見る",
        body: "店の外の広場に、鐘とからくり人形の時計塔が立っています。かつてこの場所にあったスイス・センターの外壁に付いていたもので、建物が2008年に取り壊されたあとも残されました。27個の鐘があり、毎正時に牧夫や動物の人形が動きます。店から出た客のほとんどが見上げずに通り過ぎます。",
      },
      {
        kind: "tip",
        title: "量り売りは、取る前に単価を見る",
        body: "壁一面の筒から好きな色を袋に取って、レジで重さで払う仕組みです。粒は軽く見えますが袋に入れると一気に嵩が増し、会計で驚くことになります。取り始める前に単価の表示を確認して、袋の重さを途中で一度見ておくと安全です。",
      },
      {
        kind: "highlight",
        title: "買うならロンドン限定の柄",
        body: "近衛兵の帽子をかぶった粒、二階建てバスに乗った粒、電話ボックスに入った粒。土産としていちばん分かりやすいのはこの系統です。量り売りより単価は高いので、ばらまき用と自分用で分けて考えるとよい。",
      },
      {
        kind: "tip",
        title: "4フロアあるが、全部見る必要はない",
        body: "上に行くほど雑貨と衣類の比率が上がります。菓子が目当てなら下の階だけで用が済みます。中身は乗り物も展示もない小売店なので、興味の度合いによって10分で終わる人と1時間いる人に分かれます。",
      },
      {
        kind: "tip",
        title: "隣のレゴ・ストアと組み合わせる",
        body: "同じ広場に世界最大級を名乗るレゴ・ストアがあり、こちらも入店無料です。レゴで組んだビッグベンや地下鉄の車両が置いてあります。M&M'sより空いていることが多いので、子ども連れなら両方を回して時間を調整できます。",
      },
    ],
  },
];

const APPLY = process.argv.includes("--apply");

async function main() {
  // 歩き方はプレーンテキスト描画。マークダウンが混ざっていたら止める。
  const md = /\*\*|\[.+?\]\(.+?\)|^#|^- /m;
  let broken = false;
  for (const spot of SPOTS) {
    for (const step of spot.visitFlow) {
      if (md.test(step.body) || md.test(step.title)) {
        console.error(`✗ ${spot.slug} / ${step.title}: マークダウン記法が入っています`);
        broken = true;
      }
    }
  }
  if (broken) {
    console.error("\nプレーンテキストに直してから流し直してください。");
    process.exitCode = 1;
    return;
  }

  console.log(APPLY ? "== 投入 ==\n" : "== ドライラン(--apply で投入) ==\n");

  for (const spot of SPOTS) {
    const existing = await prisma.attraction.findUnique({
      where: { slug: spot.slug },
      select: { id: true },
    });
    const nameClash = await prisma.attraction.findFirst({
      where: { name: spot.name, slug: { not: spot.slug } },
      select: { slug: true },
    });

    const chars = spot.stories.reduce((n, s) => n + s.body.length, 0);
    console.log(
      `${spot.name} (${spot.slug})\n` +
        `  ${existing ? "既存を更新" : "新規"} / ${spot.category} / lv${spot.recommendLevel} / ` +
        `本文${spot.stories.length}本 ${chars}字 / 歩き方${spot.visitFlow.length}ステップ`,
    );
    if (nameClash) {
      console.error(`  ✗ name が ${nameClash.slug} と衝突します。name は @unique です`);
      process.exitCode = 1;
      continue;
    }
    spot.stories.forEach((s) =>
      console.log(`    ${s.kind.padEnd(9)} ${s.heading ?? "(既定ラベル)"}  ${s.body.length}字`),
    );
    spot.visitFlow.forEach((s) => console.log(`    ${s.kind.padEnd(9)} ${s.title}`));

    if (!APPLY) {
      console.log("");
      continue;
    }

    const { stories, visitFlow, ...cols } = spot;
    const saved = await prisma.attraction.upsert({
      where: { slug: spot.slug },
      create: cols,
      update: cols,
      select: { id: true },
    });

    await prisma.$transaction([
      prisma.attractionStory.deleteMany({ where: { attractionId: saved.id } }),
      prisma.attractionStory.createMany({
        data: stories.map((s, i) => ({
          attractionId: saved.id,
          kind: s.kind,
          heading: s.heading,
          body: s.body,
          displayOrder: i + 1,
          source: "authored",
        })),
      }),
      prisma.attractionVisitStep.deleteMany({ where: { attractionId: saved.id } }),
      prisma.attractionVisitStep.createMany({
        data: visitFlow.map((s, i) => ({
          attractionId: saved.id,
          kind: s.kind,
          title: s.title,
          body: s.body,
          displayOrder: i + 1,
        })),
      }),
    ]);
    console.log("    → 投入\n");
  }

  if (!APPLY) console.log("--apply を付けると投入します。");
}

if (process.argv[1]?.includes("add-attractions-2026-09-4")) {
  main()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

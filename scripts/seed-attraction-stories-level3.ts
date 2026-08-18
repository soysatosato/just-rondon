/**
 * recommendLevel 3 の63スポットについて、AttractionStory を書き直す。
 *
 *   npx tsx scripts/seed-attraction-stories-level3.ts            # 何が起きるか表示
 *   npx tsx scripts/seed-attraction-stories-level3.ts --apply    # 投入
 *   npx tsx scripts/seed-attraction-stories-level3.ts --apply --resume
 *   npx tsx scripts/seed-attraction-stories-level3.ts --apply --slug=leadenhall-market-london
 *
 * 冪等。スポット単位で AttractionStory を作り直す。書いた本文は
 * source: "authored" で入るので、migrate-sections-to-stories.ts を
 * 流し直しても消えない(2026-08-18 に消えた事故の再発防止)。
 *
 * level 5 (seed-attraction-stories-level5.ts) と同じ方針。基準は
 * そちらの冒頭コメントに詳しく書いてあるので、書き足す前に必ず読むこと。
 * 要点だけ再掲する:
 *
 *   - 因果を書く。年号の羅列にしない
 *   - 固有名詞と数字を入れる
 *   - 俗説は訂正する。裏が取れなかったものは書かない
 *   - 事実(料金・アクセス・開館・所要)は書かない。ファクトバーが持つ
 *   - highlight は作らない。visitFlow があるページでは伏せられるため
 *   - 閉じの ** を全角の閉じ括弧・鉤括弧・英数字の直後に置かない
 *
 * ------------------------------------------------------------------
 * level 3 の特徴
 * ------------------------------------------------------------------
 * 63件で描画41,184字、平均654字。58件が1,200字未満で、階層の中で
 * いちばん薄い。内訳を見ると原因ははっきりしていて、文字数の大半が
 * highlight に入っている。63件中54件に visitFlow があるため、
 * その highlight は1文字も表示されていない。
 * ハウスホールド・キャバルリー博物館は保有682字に対し描画166字だった。
 *
 * さらに level 4 で見つかったのと同じ問題がある:
 *   - 箇条書きでファクトバーと同じ項目(料金・開館・所要)を並べている
 *   - 本文の末尾に「さらに詳しく知りたいなら、[こちらでチェック]」という
 *     自サイトへの内部リンクが入っている。読み物の締めとして機能しておらず、
 *     移行時に拾われたものなので落とす
 *
 * ------------------------------------------------------------------
 * 分量の考え方
 * ------------------------------------------------------------------
 * level 4 と同じく素材の量で決める。歴史のある建物(レドンホール、
 * ホース・ガーズ)は1,400〜1,800字。体験型施設やスタジアムツアーは
 * 語れる因果が少ないので1,000〜1,400字。水増ししない。
 *
 * 出典は各スポットの SOURCES コメントに URL で残す。
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export type Story = {
  kind: "highlight" | "history" | "trivia" | "practical" | "context";
  heading: string | null;
  body: string;
};

export const STORIES: Record<string, Story[]> = {
  /*
   * SOURCES
   *   https://householdcavalrymuseum.co.uk/about/
   *   https://www.householddivision.org.uk/household-cavalry-museum
   *   https://en.wikipedia.org/wiki/Household_Cavalry
   *   https://en.wikipedia.org/wiki/Horse_Guards_(building)
   */
  "household-cavalry-museum": [
    {
      kind: "history",
      heading: "王が自分の首を守るために作った部隊",
      body: `近衛騎兵(Household Cavalry)の創設は**1661年**、チャールズ2世の直命による。父チャールズ1世が1649年に処刑され、共和政のもとで11年間亡命していた王が、王政復古の翌年に真っ先に作ったのがこの部隊だった。

つまりこれは儀仗のための飾りの部隊として生まれたのではない。議会派に父を殺された王が、自分の身辺を守らせるために手元に置いた騎兵である。「英国陸軍で最も格式が高い」と言われるのは、単に古いからではなく、王個人の護衛という位置づけが今も続いているためだ。

現在の近衛騎兵は**ライフガーズ**(The Life Guards)と**ブルーズ・アンド・ロイヤルズ**(The Blues and Royals)の2個連隊からなる。1969年にロイヤル・ホース・ガーズ(ブルーズ)とロイヤル・ドラグーンズが統合してブルーズ・アンド・ロイヤルズとなり、1991年に両連隊が近衛騎兵連隊としてまとまった。統合後も制服・伝統・連隊長は別のままで、赤い上着がライフガーズ、青がブルーズ・アンド・ロイヤルズと見分けられる。`,
    },
    {
      kind: "context",
      heading: "ここが「宮殿の正門」だった時代の名残",
      body: `ホース・ガーズの建物は**1750年から1759年**にかけて建てられた。チャールズ2世が1663年に建てさせた建物の、18世紀における建て替えである。

なぜ通り抜けのアーチがこれほど立派なのか。ここがかつて**ホワイトホール宮殿からセント・ジェームズ・パークと王宮群へ向かう正式な入口**だったからだ。宮殿は1698年に焼失したが、通用門としての格は建物のほうに残った。現在もこのアーチを馬車で通れるのは君主とごく限られた人物だけ、という慣習が続いている。

博物館が入っているのは、この現役の軍事施設の内部である。2007年にエリザベス2世が開館させた。展示室の隣が実際に使われている厩舎で、ガラス越しに馬の世話をしている様子が見えるのはそのためだ。観光用に再現した厩舎ではなく、勤務の風景がそのまま覗ける構造になっている。`,
    },
    {
      kind: "trivia",
      heading: null,
      body: `- 儀礼用の**胸甲**(キュイラス)は本物の金属製で、前後合わせて相当な重さがある。装飾ではなく、元は実際に刃を止めるための防具だった
- 儀仗兵として知られるが実戦部隊でもあり、アフガニスタンやイラクにも派遣されている。装甲偵察を担う部隊としての顔がある
- ホワイトホール側のアーチ脇に立つ騎乗の衛兵は勤務中で、馬は蹴ることがある。写真は自由だが、係員が距離を見ている`,
    },
  ],

  /*
   * SOURCES
   *   https://leadenhallmarket.co.uk/history-of-leadenhall-market/
   *   https://www.museumoflondon.org.uk/discover/romans-londinium
   *   https://en.wikipedia.org/wiki/Leadenhall_Market
   */
  "leadenhall-market-london": [
    {
      kind: "history",
      heading: "ローマ時代の広場が、そのまま市場であり続けている",
      body: `この一帯には**西暦70年ごろ**、ロンディニウムのフォルム(広場)とバシリカ(集会所・法廷)が置かれた。100年ごろに建て替えられたバシリカは**アルプス以北で最大**、面積はトラファルガー広場より広かったとされる。フォルムには商店や両替商が並んでいた。

つまりこの場所は、約2,000年前から商いの中心だった土地に、今も市場が建っているということになる。ロンドンで「古い」と言われる場所は多いが、用途まで連続している例は多くない。バシリカ南側の柱脚の一部は、グレイスチャーチ・ストリート90番地の地下に保存されている。

市場としての記録は**1309年**の「Ledenehalle」に遡る。名前は**鉛葺きの屋根**を持つ館の中庭で市が開かれていたことに由来する。1345年にはエドワード3世が、ロンドン市民以外の業者が家禽を売ってよい場所としてここを指定した。1666年のロンドン大火で市場も被害を受け、再建の際に初めて屋根のある構造になっている。`,
    },
    {
      kind: "context",
      heading: "ヴィクトリア朝の鉄とガラスに置き換わった理由",
      body: `現在の建物は**1881年**、市の建築家**ホレス・ジョーンズ**(Sir Horace Jones)の設計で完成した。費用は99,000ポンド。石造だったそれまでの構造を、**錬鉄とガラス**に置き換えている。

ジョーンズはビリングスゲート魚市場やスミスフィールドの食肉市場も手がけ、タワーブリッジの設計者でもある。19世紀後半のロンドンで市場建築を鉄骨に切り替えていったのは、広い無柱空間と採光をとるためだった。天井まで抜けた通路に自然光が落ちるのは、生鮮品を扱う市場として合理的な設計である。

意匠の手本はミラノの**ヴィットーリオ・エマヌエーレ2世のガッレリア**だった。深緑と臙脂に金を差した現在の塗装は後年のものだが、アーケードの構成そのものは開業時から変わっていない。`,
    },
    {
      kind: "trivia",
      heading: null,
      body: `- 1881年の建て替えでジョーンズが基礎を掘った際、下からローマ時代のバシリカの一部が出てきた。市場を作り直そうとして、2,000年前の市場の跡を掘り当てたことになる
- 『ハリー・ポッターと賢者の石』の撮影に使われた。ダイアゴン横丁そのものではなく、**漏れ鍋**へ向かう路地としてこの一帯が映っている
- 『裏切りのサーカス』(Tinker Tailor Soldier Spy)のロケ地でもある
- 週末は多くの店が閉まる。金融街の只中にあり、客層が平日の勤め人だからで、観光地としての時間帯とはずれている`,
    },
  ],

  /*
   * SOURCES
   *   https://help.wembleystadium.com/support/solutions/articles/7000028145-stats-and-facts
   *   https://www.wembleystadium.com/news/2013/apr/25/90-years-of-wembley-stadium
   *   https://en.wikipedia.org/wiki/Twin_Towers,_Wembley
   *   https://lsaa.org/images/pdf_files/projects/Wembley_Reduced_2025.pdf
   *   https://populous.com/article/100-years-of-wembley-designing-an-icon
   */
  "wembley-stadium-tour": [
    {
      kind: "history",
      heading: "ツインタワーを失ってまで建て替えた事情",
      body: `旧ウェンブリーは1923年開場。正面に立つ**ツインタワー**は、イングランド代表の聖地の象徴として80年近く親しまれた。それでも2000年に閉場し、**2003年に解体**されている。

理由は老朽化だけではない。旧スタジアムは陸上トラックを備えた多目的競技場で、観客席がピッチから遠かった。加えて屋根を支える柱が座席からの視界を遮る箇所があり、立ち見席を廃して全席を座席にすると収容人数も落ちる。改修では解決しきれないと判断され、同じ敷地に建て替えることになった。

新スタジアムは2003年から2007年にかけて建設され、**2007年**のFAカップ決勝で開場した。設計はフォスター・アンド・パートナーズとポピュラス。収容は**90,000席**で、**視界を遮る柱が1本もない**。`,
    },
    {
      kind: "context",
      heading: "あのアーチは飾りではなく、屋根を吊っている",
      body: `新ウェンブリーの目印である**アーチ**は、高さ**133メートル**、スパン**315メートル**。単一スパンの屋根構造としては世界最長とされる。

重要なのは、これが記念碑ではなく**構造材**だということだ。アーチは北側の屋根の**全重量**と、南側の**約60パーセント**を負担している。つまり屋根を上から吊ることで、観客席の中に柱を立てずに済ませている。ツインタワーという象徴を捨てた代わりに得たのが「90,000席すべてで視界が遮られない」という条件で、それを成立させているのがこのアーチである。

屋根は11エーカーを超え、うち4エーカーが可動式になっている。ピッチに日照と風を通すために開閉するもので、観客席の上は常に覆われている。`,
    },
    {
      kind: "trivia",
      heading: null,
      body: `- 優勝チームがトロフィーを受け取るまでに上る階段は**107段**。旧スタジアムでは39段で、ピッチ脇のロイヤルボックスの位置が変わったため段数が増えた
- 場内のトイレは**2,618か所**あり、単一の建物としては世界最多とされる
- アーチは垂直から**22度**傾けて立てられている。まっすぐ立てると荷重の一部が隣接する土地側にかかるため、傾けて敷地内に力を落としている。前後のケーブルで位置を保っている`,
    },
  ],
};

/** kind ごとの既定ラベル。表示側(components/sightseeing/stories.ts)と合わせる。 */
const DEFAULT_LABEL: Record<string, string> = {
  highlight: "見どころ",
  history: "歴史",
  context: "この場所について",
  trivia: "豆知識",
  practical: "訪問のヒント",
};

/**
 * 同じ見出しが1スポット内で重複していないか。
 * 重複すると表示側が「訪問のヒント（1）」のように番号を振ることになる。
 */
function findDuplicateHeadings(stories: Story[]): string[] {
  const seen = new Map<string, number>();
  for (const s of stories) {
    const h = s.heading ?? `(既定: ${DEFAULT_LABEL[s.kind]})`;
    seen.set(h, (seen.get(h) ?? 0) + 1);
  }
  return [...seen.entries()].filter(([, n]) => n > 1).map(([h]) => h);
}

async function main() {
  const apply = process.argv.includes("--apply");
  const resume = process.argv.includes("--resume");
  const only = process.argv.find((a) => a.startsWith("--slug="))?.slice(7);

  const slugs = Object.keys(STORIES).filter((s) => !only || s === only);
  if (only && slugs.length === 0) {
    console.error(`slug=${only} はこのスクリプトの対象外です`);
    process.exitCode = 1;
    return;
  }

  // 先に全件の見出し重複を確かめる。1件でも壊れていたら投入しない。
  let broken = false;
  for (const slug of slugs) {
    const dups = findDuplicateHeadings(STORIES[slug]);
    if (dups.length > 0) {
      console.error(`✗ ${slug}: 見出しが重複 → ${dups.join(" / ")}`);
      broken = true;
    }
  }
  if (broken) {
    console.error("\n見出しを直してから流し直してください。");
    process.exitCode = 1;
    return;
  }

  console.log(apply ? "== 投入 ==\n" : "== ドライラン(--apply で投入) ==\n");

  let totalBefore = 0;
  let totalAfter = 0;

  for (const slug of slugs) {
    const attraction = await prisma.attraction.findUnique({
      where: { slug },
      include: { stories: true, visitFlow: true },
    });

    if (!attraction) {
      console.error(`✗ ${slug}: 見つかりません`);
      continue;
    }

    const stories = STORIES[slug];
    const before = attraction.stories.reduce((n, s) => n + s.body.length, 0);
    const after = stories.reduce((n, s) => n + s.body.length, 0);
    totalBefore += before;
    totalAfter += after;

    // visitFlow があるページでは highlight が伏せられる(stories.ts)。
    // ここでは作らない方針だが、足したときに気づけるよう警告する。
    const hidden = stories.filter(
      (s) => attraction.visitFlow.length > 0 && s.kind === "highlight",
    );
    const hiddenNote =
      hidden.length > 0 ? `  ※highlight ${hidden.length}本は表示されない` : "";

    console.log(
      `${attraction.name} (${slug})\n` +
        `  ${attraction.stories.length}本/${before}字 → ${stories.length}本/${after}字${hiddenNote}`,
    );
    for (const s of stories) {
      const h = s.heading ?? `(既定: ${DEFAULT_LABEL[s.kind]})`;
      console.log(`    ${s.kind.padEnd(9)} ${h}  ${s.body.length}字`);
    }

    if (apply) {
      if (resume && attraction.stories.length > 0) {
        const written = attraction.stories.some((s) =>
          stories.some((n) => n.body === s.body),
        );
        if (written) {
          console.log("    → --resume: 投入済みのため飛ばす");
          console.log("");
          continue;
        }
      }

      // 冪等にするため、そのスポットのぶんを消してから作り直す。
      // ここで書く本文は source: "authored"。移行スクリプトは
      // authored を持つスポットに触らないので、巻き添えにならない。
      await prisma.$transaction([
        prisma.attractionStory.deleteMany({
          where: { attractionId: attraction.id },
        }),
        prisma.attractionStory.createMany({
          data: stories.map((s, i) => ({
            attractionId: attraction.id,
            kind: s.kind,
            heading: s.heading,
            body: s.body,
            displayOrder: i + 1,
            source: "authored",
          })),
        }),
      ]);
      console.log("    → 投入");
    }
    console.log("");
  }

  console.log(
    `合計 ${totalBefore}字 → ${totalAfter}字 (+${totalAfter - totalBefore})`,
  );
  if (!apply) console.log("\n--apply を付けると投入します。");
}

// 本文だけを他のスクリプト(校正など)から読めるように、
// 直接実行されたときだけ DB に触る。
if (process.argv[1]?.includes("seed-attraction-stories-level3")) {
  main()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

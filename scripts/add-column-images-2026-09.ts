import "dotenv/config";
import db from "../utils/db";
import { imageColumns, resolveCommonsImage } from "./lib/commons";

/**
 * 赤い電話ボックスのコラムに、ヒーローと節ごとの写真を入れる。
 *
 * この記事は「箱の形」そのものが主題で、K1 とK2 の違い、ソーンの墓の
 * ドーム、ダリッジの霊廟のランタン——どれも文章より写真1枚のほうが速い。
 * 節に紐づけて置くのはそのためで、写真を記事の頭にまとめてしまうと
 * 「どの節の話か」が消える。
 *
 * ファイル名だけをソースに持ち、URL・作者・ライセンスは実行のたびに
 * Commons の API で取り直す(seed-brands.ts / seed-souvenirs.ts と同じ)。
 * Commons は同じファイル名のまま中身が差し替わることがあり、解決済みの
 * URLを手で貼るとライセンス表記だけが古いまま残る。
 *
 *   npx tsx scripts/add-column-images-2026-09.ts [--dry]
 */

const SLUG = "london-s-red-telephone-box-was-born-from-a-tomb";

/** ヒーロー。記事の顔なので横位置のものを選ぶ(切り抜きは16:9相当)。 */
const HERO = {
  file: "File:Five classic red K6 telephone boxes on a pavement in London.jpg",
  caption:
    "ロンドンの歩道に並ぶK6。いま「赤い電話ボックス」と聞いて思い浮かぶのはまずこの型で、その原型は1924年の設計競技で決まった。",
};

/** 節の写真。キーは ContentSection.displayOrder。 */
const SECTIONS: Record<number, { file: string; caption: string }> = {
  0: {
    file: "File:K1 Telephone Booth, High Street, Bembridge (May 2016).jpg",
    caption:
      "ワイト島ベンブリッジに残るK1。クリーム色の躯体に赤い扉、頂部はピラミッド型。ロンドンの区議会が街路への設置を拒み続けたのは、この姿である。",
  },
  1: {
    file: "File:Wooden Prototype K2 Phonebox in entrance arch to Royal Academy of Arts, London.jpg",
    caption:
      "1924年の審査のために作られた木製の試作K2。ピカデリーのバーリントン・ハウス(ロイヤル・アカデミー)の入口門に、審査のあと置かれた場所から動かずに立っている。量産型と違って「TELEPHONE」の照明サインがない。",
  },
  2: {
    file: "File:St Pancras Old Church, John Soane mausoleum 2.jpg",
    caption:
      "セント・パンクラス旧教会の墓地に立つソーンの墓(1816年)。四角い平面の上に浅く伏せた椀のような屋根が載り、四隅が切り取られて面を作る——この輪郭が争点になっている。",
  },
  3: {
    file: "File:Dulwich Picture Gallery, the mausoleum - geograph.org.uk - 1257476.jpg",
    caption:
      "ダリッジ・ピクチャー・ギャラリーの霊廟(1811–14年)。屋根に載るランタン(採光塔)も同じ浅いドームで、「下敷きは墓だ」と断定できない理由がここにある。",
  },
  4: {
    file: "File:K2 telephone kiosk on Great George Street, London.jpg",
    caption:
      "ホワイトホールとの交差点近く、グレート・ジョージ・ストリートのK2。スコットが指定したのは銀色で、赤く塗ったのも、王冠に換気の穴を開けたのも郵政省である。",
  },
  5: {
    file: "File:Defibrillator K6 telephone box - geograph.org.uk - 6157368.jpg",
    caption:
      "AED(自動体外式除細動器)の格納庫になったK6。BTの「Adopt a Kiosk」で1ポンドで引き取られた箱は7,200基を超える。",
  },
};

async function resolve(file: string, caption: string) {
  const image = await resolveCommonsImage(file);
  if (!image) throw new Error(`Commons で解決できなかった: ${file}`);
  return {
    // Commons の API は新しい thumb.wikimedia.org を返すことがある。
    // DB に入っている既存の画像URLは upload.wikimedia.org なので揃える。
    ...imageColumns({
      ...image,
      url: image.url.replace(
        "https://thumb.wikimedia.org/",
        "https://upload.wikimedia.org/",
      ),
    }),
    imageCaption: caption,
  };
}

async function main() {
  const dryRun = process.argv.includes("--dry");

  const content = await db.content.findFirst({
    where: { slug: SLUG, category: "column" },
    include: { sections: { orderBy: { displayOrder: "asc" } } },
  });
  if (!content) throw new Error(`コラムが見つからない: ${SLUG}`);

  const hero = await resolve(HERO.file, HERO.caption);
  console.log(`HERO ${hero.image}\n  ${hero.imageCredit}`);
  if (!dryRun) {
    await db.content.update({ where: { id: content.id }, data: hero });
  }

  for (const sec of content.sections) {
    const seed = SECTIONS[sec.displayOrder];
    if (!seed) {
      console.log(`SKIP (no image): [${sec.displayOrder}] ${sec.title}`);
      continue;
    }
    const data = await resolve(seed.file, seed.caption);
    console.log(`[${sec.displayOrder}] ${sec.title}\n  ${data.image}\n  ${data.imageCredit}`);
    if (!dryRun) {
      await db.contentSection.update({ where: { id: sec.id }, data });
    }
  }

  console.log(dryRun ? "(dry run — 何も書いていない)" : "done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

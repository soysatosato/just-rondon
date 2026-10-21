/**
 * 既存の週次「今週のロンドン」12号と月次「今月変わったロンドン」10月号に
 * 写真を入れる。一度きりのスクリプト(2026-10)。
 *
 *   npx tsx scripts/set-issue-photos-2026-10.ts --dry   # 確かめるだけ
 *   npx tsx scripts/set-issue-photos-2026-10.ts
 *
 * 先に 20261022000000_add_issue_photo_credits のマイグレーションが要る。
 *
 * 写真は Wikimedia Commons の CC 画像で、その号の目玉の会場か様子。作品(展示物・
 * 期間限定の装飾)は写さない。2026-10-21 に1枚ずつ目で見て、写っているものと
 * 画質を確かめた。美術館・名所の写真は、その館・スポットのページと同じもの。
 *
 * 幅と出典は作成スクリプトと同じ scripts/lib/issue-image.ts で確かめる。
 *
 * updatedAt を動かさないよう生の SQL で書く。写真を足しても号の中身は
 * 変わっていない。updatedAt は号の dateModified と sitemap の lastmod に
 * 出ているので、動かすと直していない12号が一斉に「更新」を名乗る。
 *
 * すでに写真がある号は飛ばす(何度流しても同じ結果になる)。
 */

import "dotenv/config";
import db from "../utils/db";
import { issueImageColumns, type IssueImageColumns } from "./lib/issue-image";

type PhotoInput = { image: string; alt: string };

const WEEKLY: Record<string, PhotoInput> = {
  // 8/16 で今季が終わる運河沿いの無料シネマ
  "2026-w33": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Open_Air_Cinema_KX_London.jpg/1280px-Open_Air_Cinema_KX_London.jpg",
    alt: "キングス・クロス、リージェンツ運河沿いの階段に作られた野外シネマ(2025年)",
  },
  // グリニッジ・フェアと GDIF の開幕
  "2026-w34": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Greenwich_Park_-_View_NNW_on_Queen%27s_House%2C_Greenwich_Hospital_%26_Canary_Wharf_Docklands.jpg/1280px-Greenwich_Park_-_View_NNW_on_Queen%27s_House%2C_Greenwich_Hospital_%26_Canary_Wharf_Docklands.jpg",
    alt: "グリニッジ・パークの丘から見たクイーンズ・ハウスとカナリー・ワーフ",
  },
  // ノッティング・ヒル・カーニバル60周年
  "2026-w35": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Notting_Hill_Carnival_Performers_in_London.jpg/1280px-Notting_Hill_Carnival_Performers_in_London.jpg",
    alt: "ノッティング・ヒルの通りを歩く、羽根飾りの衣装のカーニバルの踊り手(2023年)",
  },
  // カーニバルの本番「大人の日」
  "2026-w36": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Notting_Hill_Carnival_1_-_August_2006.jpg/1280px-Notting_Hill_Carnival_1_-_August_2006.jpg",
    alt: "ノッティング・ヒル・カーニバルのパレードの踊り手と楽隊(2006年)",
  },
  // バイユーのタペストリーが大英博物館へ
  "2026-w37": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/British_Museum_from_NE_2_%28cropped%29.JPG/1280px-British_Museum_from_NE_2_%28cropped%29.JPG",
    alt: "大英博物館の正面",
  },
  // パーリー・キングス&クイーンズの収穫祭
  "2026-w38": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Pearly_Kings_and_Queens_Harvest_Festival_2024_%2813%29.jpg/1280px-Pearly_Kings_and_Queens_Harvest_Festival_2024_%2813%29.jpg",
    alt: "ギルドホール・ヤードのパーリー・キングス&クイーンズの収穫祭(2024年)",
  },
  // テート・ブリテンのホイッスラー展が閉幕
  "2026-w39": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Tate_Britain_%285822081512%29_%282%29.jpg/1280px-Tate_Britain_%285822081512%29_%282%29.jpg",
    alt: "テート・ブリテンの正面",
  },
  // ナショナル・ギャラリーのルノワール展と、トラファルガー広場のジャパン祭り
  "2026-w40": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Galer%C3%ADa_Nacional%2C_Londres%2C_Inglaterra%2C_2014-08-07%2C_DD_036.JPG/1280px-Galer%C3%ADa_Nacional%2C_Londres%2C_Inglaterra%2C_2014-08-07%2C_DD_036.JPG",
    alt: "トラファルガー広場から見たナショナル・ギャラリー",
  },
  // BFI ロンドン映画祭
  "2026-w41": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Riverfront%2C_BFI_Southbank_2025-08-21.jpg/1280px-Riverfront%2C_BFI_Southbank_2025-08-21.jpg",
    alt: "ウォータールー橋の下にあるBFIサウスバンクの入口",
  },
  // ヘイワード・ギャラリーのアニッシュ・カプーア展が閉幕
  "2026-w42": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Hayward_Gallery%2C_South_Bank_-_from_Waterloo_Bridge_-_geograph.org.uk_-_2282926.jpg/1280px-Hayward_Gallery%2C_South_Bank_-_from_Waterloo_Bridge_-_geograph.org.uk_-_2282926.jpg",
    alt: "ウォータールー橋から見たヘイワード・ギャラリー",
  },
  // ダリッジで北斎『冨嶽三十六景』
  "2026-w43": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Dulwich_Picture_Gallery%2C_main_entrance.JPG/1280px-Dulwich_Picture_Gallery%2C_main_entrance.JPG",
    alt: "ダリッジ・ピクチャー・ギャラリーの入口",
  },
  // オックスフォード・ストリートが車の入らない通りに
  "2026-w44": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Pedestrian_day_on_Oxford_Street.jpg/1280px-Pedestrian_day_on_Oxford_Street.jpg",
    alt: "車を止めて歩行者に開いた日のオックスフォード・ストリート(2008年)",
  },
};

const MONTHLY: Record<string, PhotoInput> = {
  // 11/1 からバス運賃が£1.85に
  "2026-10": {
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/New_Routemaster_buses_%2835576002554%29.jpg/1280px-New_Routemaster_buses_%2835576002554%29.jpg",
    alt: "ホワイトホールに並ぶロンドンの2階建てバス",
  },
};

async function setWeekly(slug: string, c: IssueImageColumns) {
  return db.$executeRaw`UPDATE "WeeklyBrief" SET "image" = ${c.image}, "imageAlt" = ${c.imageAlt}, "imageSource" = ${c.imageSource}, "imageCredit" = ${c.imageCredit}, "imageLink" = ${c.imageLink} WHERE "slug" = ${slug} AND "image" IS NULL`;
}

async function setMonthly(slug: string, c: IssueImageColumns) {
  return db.$executeRaw`UPDATE "MonthlyChangeIssue" SET "image" = ${c.image}, "imageAlt" = ${c.imageAlt}, "imageSource" = ${c.imageSource}, "imageCredit" = ${c.imageCredit}, "imageLink" = ${c.imageLink} WHERE "slug" = ${slug} AND "image" IS NULL`;
}

async function main() {
  const dry = process.argv.includes("--dry");

  const targets = [
    ...Object.entries(WEEKLY).map(([slug, photo]) => ({ table: "weekly" as const, slug, photo })),
    ...Object.entries(MONTHLY).map(([slug, photo]) => ({ table: "monthly" as const, slug, photo })),
  ];

  let updated = 0;
  for (const { table, slug, photo } of targets) {
    const row =
      table === "weekly"
        ? await db.weeklyBrief.findUnique({ where: { slug }, select: { image: true } })
        : await db.monthlyChangeIssue.findUnique({ where: { slug }, select: { image: true } });
    const path = table === "weekly" ? `/events/week/${slug}` : `/changes/${slug}`;

    if (!row) {
      console.log(`skip  ${path} (no such issue)`);
      continue;
    }
    if (row.image) {
      console.log(`skip  ${path} (already has a photo)`);
      continue;
    }

    const columns = await issueImageColumns(photo.image, photo.alt);
    console.log(`${dry ? "would set" : "set"}  ${path}`);
    console.log(`        ${columns.imageAlt}`);
    console.log(`        画像: ${columns.imageCredit}`);
    if (dry) continue;

    const count =
      table === "weekly" ? await setWeekly(slug, columns) : await setMonthly(slug, columns);
    updated += count;
  }

  console.log(dry ? "\n--dry: nothing written." : `\nUpdated ${updated} issue(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

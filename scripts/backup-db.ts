/**
 * DB全体をローカルにバックアップする。
 *
 * 2026-08-23 の事故を受けて作った。あのとき失われたのは「DBにしか無かったもの」
 * ——コラム29本・18万字の本文——だけで、git にあった seed スクリプトは全部無事だった。
 * 助かったのは Supabase の日次バックアップに間に合ったからで、次も間に合う保証はない。
 *
 * 使い方:
 *   npx tsx scripts/backup-db.ts            通常のバックアップ
 *   npx tsx scripts/backup-db.ts --force    件数激減の警告を無視して実行
 *   npx tsx scripts/backup-db.ts --verify   最新バックアップの健全性だけ確認
 *
 * 保存先は BACKUP_DIR(既定 ~/Desktop/just-rondon-backups)。
 * リポジトリの外に置く。本文には非公開の原稿が含まれうるし、
 * 13MB のダンプを毎回コミットすると .git が際限なく膨らむため。
 */

import "dotenv/config";
import * as fs from "node:fs";
import * as path from "node:path";
import * as os from "node:os";
import * as zlib from "node:zlib";
import db from "../utils/db";

const BACKUP_DIR =
  process.env.BACKUP_DIR ??
  path.join(os.homedir(), "Desktop", "just-rondon-backups");

/** 保持する世代数。古いものから消す。 */
const KEEP = 10;

/**
 * 件数が前回よりこの割合を下回ったら異常とみなす。
 *
 * 0.5 = 半減。事故当日、Attraction は 146 → 0 になっていた。
 * 空になったDBを黙ってバックアップし、正常な世代を押し出してしまうのが
 * 最悪の筋書きなので、そこで必ず止める。
 */
const SHRINK_RATIO = 0.5;

/**
 * 中身が消えたら二度と作れないテーブル。
 *
 * 人が書いた原稿だけを挙げている。Lyrics や RedditPost は外部から
 * 取り直せるので入れない。ここが 0 件になったら、件数比較を待たずに止める。
 */
const CRITICAL = [
  "Content",
  "ContentSection",
  "Attraction",
  "AttractionStory",
  "AttractionVisitStep",
  "Musical",
  "Museum",
  "Brand",
];

type Manifest = {
  takenAt: string;
  database: string;
  totalRows: number;
  tables: Record<string, number>;
};

async function fetchAll() {
  const tables: { tablename: string }[] = await db.$queryRawUnsafe(
    `SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename`,
  );

  const data: Record<string, unknown[]> = {};
  const counts: Record<string, number> = {};
  let total = 0;

  for (const { tablename } of tables) {
    const rows: unknown[] = await db.$queryRawUnsafe(
      `SELECT * FROM "${tablename}"`,
    );
    data[tablename] = rows;
    counts[tablename] = rows.length;
    total += rows.length;
  }

  return { data, counts, total };
}

/** 直近のマニフェストを読む。無ければ null(初回)。 */
function readLatestManifest(): Manifest | null {
  const p = path.join(BACKUP_DIR, "latest.manifest.json");
  if (!fs.existsSync(p)) return null;
  try {
    return JSON.parse(fs.readFileSync(p, "utf8")) as Manifest;
  } catch {
    return null;
  }
}

/**
 * 今回の件数が前回と比べて異常でないかを見る。
 *
 * 減っていること自体は正常な操作でも起きる(古い記事を消すなど)。
 * 止めるのは「消えた」と言えるほど極端なときだけにして、
 * 毎回警告が出て慣れてしまう状態を避ける。
 */
function detectAnomalies(counts: Record<string, number>, prev: Manifest | null) {
  const problems: string[] = [];

  for (const t of CRITICAL) {
    if (counts[t] === undefined) continue;
    if (counts[t] === 0 && (prev?.tables?.[t] ?? 0) > 0) {
      problems.push(`${t}: ${prev!.tables[t]} → 0 (全消失)`);
    }
  }

  if (prev) {
    for (const [t, n] of Object.entries(counts)) {
      const before = prev.tables[t] ?? 0;
      if (before === 0 || n === 0) continue; // 0件は上のループで見ている
      if (n < before * SHRINK_RATIO) {
        problems.push(`${t}: ${before} → ${n} (半減以上)`);
      }
    }
  }

  return problems;
}

/** 書き出したファイルを読み直し、件数が一致するかまで見る。 */
function verifyFile(file: string, expected: Manifest) {
  const raw = zlib.gunzipSync(fs.readFileSync(file)).toString("utf8");
  const parsed = JSON.parse(raw) as Record<string, unknown[]>;
  const mismatches: string[] = [];
  for (const [t, n] of Object.entries(expected.tables)) {
    const got = parsed[t]?.length ?? -1;
    if (got !== n) mismatches.push(`${t}: manifest=${n} file=${got}`);
  }
  return mismatches;
}

function pruneOld() {
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => /^just-rondon-\d{8}-\d{6}\.json\.gz$/.test(f))
    .sort()
    .reverse();

  const removed: string[] = [];
  for (const f of files.slice(KEEP)) {
    fs.unlinkSync(path.join(BACKUP_DIR, f));
    removed.push(f);
  }
  return removed;
}

async function main() {
  const argv = process.argv.slice(2);
  const force = argv.includes("--force");
  const verifyOnly = argv.includes("--verify");

  fs.mkdirSync(BACKUP_DIR, { recursive: true });

  if (verifyOnly) {
    const prev = readLatestManifest();
    if (!prev) {
      console.log("バックアップがまだありません。");
      return;
    }
    const target = path.join(BACKUP_DIR, prev.database);
    if (!fs.existsSync(target)) {
      console.error(`✗ マニフェストが指すファイルがありません: ${prev.database}`);
      process.exitCode = 1;
      return;
    }
    const bad = verifyFile(target, prev);
    if (bad.length) {
      console.error("✗ 破損:", bad.join(", "));
      process.exitCode = 1;
    } else {
      console.log(
        `✓ ${prev.database} は正常 (${prev.totalRows.toLocaleString()}行 / ${prev.takenAt})`,
      );
    }
    return;
  }

  console.log("DBを読み出しています…");
  const { data, counts, total } = await fetchAll();

  const prev = readLatestManifest();
  const problems = detectAnomalies(counts, prev);

  if (problems.length && !force) {
    console.error("\n⚠ 件数が異常です。バックアップを中止しました。\n");
    for (const p of problems) console.error("   " + p);
    console.error(
      "\nDBが壊れている可能性があります。正常なバックアップを上書きしないため、" +
        "\nここで止めます。DBを確認してください。" +
        "\n意図した変更なら --force を付けて再実行します。\n",
    );
    process.exitCode = 1;
    return;
  }

  // 例: 20260823-101811。ファイル名でそのまま時系列に並ぶようにする。
  const d = new Date();
  const p2 = (n: number) => String(n).padStart(2, "0");
  const stamp =
    `${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}` +
    `-${p2(d.getHours())}${p2(d.getMinutes())}${p2(d.getSeconds())}`;
  const name = `just-rondon-${stamp}.json.gz`;
  const file = path.join(BACKUP_DIR, name);

  const json = JSON.stringify(
    data,
    (_k, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  );
  fs.writeFileSync(file, zlib.gzipSync(json));

  const manifest: Manifest = {
    takenAt: new Date().toISOString(),
    database: name,
    totalRows: total,
    tables: counts,
  };

  // 書けたつもりで壊れている、が一番困る。読み直して件数まで突き合わせる。
  const bad = verifyFile(file, manifest);
  if (bad.length) {
    fs.unlinkSync(file);
    console.error("✗ 書き出したファイルが壊れていました:", bad.join(", "));
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(
    path.join(BACKUP_DIR, "latest.manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  const sizeMb = fs.statSync(file).size / 1024 / 1024;
  console.log(`\n✓ ${name}  (${sizeMb.toFixed(1)} MB, ${total.toLocaleString()}行)`);

  if (problems.length && force) {
    console.log("\n⚠ --force で以下の警告を無視しました:");
    for (const p of problems) console.log("   " + p);
  }

  // 前回からの増減。目視で「増えているか」を確かめられるようにする。
  if (prev) {
    const diffs = Object.entries(counts)
      .map(([t, n]) => [t, n - (prev.tables[t] ?? 0)] as const)
      .filter(([, d]) => d !== 0)
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
    if (diffs.length) {
      console.log("\n前回との差分:");
      for (const [t, d] of diffs.slice(0, 10)) {
        console.log(`   ${t.padEnd(22)} ${d > 0 ? "+" : ""}${d}`);
      }
    } else {
      console.log("\n前回から変化なし。");
    }
  }

  const removed = pruneOld();
  if (removed.length) console.log(`\n古い世代を削除: ${removed.length}件`);

  console.log(`\n保存先: ${BACKUP_DIR}`);
}

main()
  .catch((e) => {
    console.error("バックアップに失敗しました:", e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

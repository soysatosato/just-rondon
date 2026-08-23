/**
 * backup-db.ts が作ったバックアップからデータを戻す。
 *
 * 既定は --dry(何もせず差分だけ出す)。実際に書き込むには --write が要る。
 * 戻す作業は事故のあと、焦っている状況で走らせることになるので、
 * 「うっかり実行して上書きした」が起きない側に倒してある。
 *
 * 使い方:
 *   npx tsx scripts/restore-db.ts --list                    世代を一覧する
 *   npx tsx scripts/restore-db.ts --table Content           差分を見る(既定は dry)
 *   npx tsx scripts/restore-db.ts --table Content --write   実際に戻す
 *   npx tsx scripts/restore-db.ts --file <name> --table X --write
 *
 * テーブル指定は必須。全件を一括で戻す口はあえて用意していない
 * ——DB全体を巻き戻したいなら Supabase のバックアップから復元するほうが
 * 確実で速い。こちらは「この表だけ消えた」を埋めるための道具。
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

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => /^just-rondon-\d{8}-\d{6}\.json\.gz$/.test(f))
    .sort()
    .reverse();
}

function load(file: string): Record<string, Record<string, unknown>[]> {
  const raw = zlib.gunzipSync(fs.readFileSync(path.join(BACKUP_DIR, file)));
  return JSON.parse(raw.toString("utf8"));
}

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const argv = process.argv.slice(2);
  const backups = listBackups();

  if (argv.includes("--list") || argv.length === 0) {
    if (!backups.length) {
      console.log(`バックアップがありません: ${BACKUP_DIR}`);
      return;
    }
    console.log(`${BACKUP_DIR}\n`);
    for (const f of backups) {
      const size = fs.statSync(path.join(BACKUP_DIR, f)).size / 1024 / 1024;
      console.log(`  ${f}  (${size.toFixed(1)} MB)`);
    }
    console.log(
      "\n復元するには:\n  npx tsx scripts/restore-db.ts --table <TableName>",
    );
    return;
  }

  const table = arg("--table");
  if (!table) {
    console.error("--table <TableName> を指定してください。");
    process.exitCode = 1;
    return;
  }

  const file = arg("--file") ?? backups[0];
  if (!file || !fs.existsSync(path.join(BACKUP_DIR, file))) {
    console.error(`バックアップが見つかりません: ${file ?? "(なし)"}`);
    process.exitCode = 1;
    return;
  }

  const dump = load(file);
  const rows = dump[table];
  if (!rows) {
    console.error(`${file} に ${table} がありません。`);
    process.exitCode = 1;
    return;
  }

  const current: { c: number }[] = await db.$queryRawUnsafe(
    `SELECT count(*)::int c FROM "${table}"`,
  );
  const now = current[0].c;

  console.log(`バックアップ: ${file}`);
  console.log(`テーブル    : ${table}`);
  console.log(`現在        : ${now} 行`);
  console.log(`バックアップ: ${rows.length} 行`);

  const write = argv.includes("--write");
  if (!write) {
    console.log(
      "\n(dry run — 何も書き込んでいません)\n実行するには --write を付けてください。",
    );
    return;
  }

  // 列の型を引いておく。JSON には型が無いので、これが無いと
  // 日付が text のまま渡って INSERT が落ちる。
  const colTypes: { column_name: string; data_type: string }[] =
    await db.$queryRawUnsafe(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = $1`,
      table,
    );
  const types = new Map(colTypes.map((c) => [c.column_name, c.data_type]));

  // 既存行には触れず、id が無いものだけを足す。
  // 復元は「消えた分を埋める」用途なので、手を入れた最新の行を
  // 古い内容で塗り潰さないほうが安全。
  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const id = (row as { id?: unknown }).id;
    if (id === undefined) continue;

    const exists: { c: number }[] = await db.$queryRawUnsafe(
      `SELECT count(*)::int c FROM "${table}" WHERE id = $1`,
      id,
    );
    if (exists[0].c > 0) {
      skipped++;
      continue;
    }

    const cols = Object.keys(row);
    const quoted = cols.map((c) => `"${c}"`).join(", ");

    // JSON を経由すると日付が文字列になり、Postgres は timestamp 列への
    // 挿入を拒む。列の型を見て、日付・JSON・配列だけ明示的にキャストする。
    const params = cols
      .map((c, i) => {
        const t = types.get(c);
        if (!t) return `$${i + 1}`;
        if (t.startsWith("timestamp") || t === "date")
          return `$${i + 1}::timestamp`;
        if (t === "jsonb" || t === "json") return `$${i + 1}::${t}`;
        if (t === "ARRAY") return `$${i + 1}::text[]`;
        return `$${i + 1}`;
      })
      .join(", ");

    const values = cols.map((c) => {
      const v = (row as Record<string, unknown>)[c];
      const t = types.get(c);
      if (v === null || v === undefined) return null;
      // jsonb は文字列化して渡す(オブジェクトのままだと型が合わない)
      if ((t === "jsonb" || t === "json") && typeof v === "object")
        return JSON.stringify(v);
      return v;
    });

    await db.$executeRawUnsafe(
      `INSERT INTO "${table}" (${quoted}) VALUES (${params})`,
      ...values,
    );
    inserted++;
  }

  const after: { c: number }[] = await db.$queryRawUnsafe(
    `SELECT count(*)::int c FROM "${table}"`,
  );
  console.log(
    `\n✓ 挿入 ${inserted} / 既存のためスキップ ${skipped} → 現在 ${after[0].c} 行`,
  );
}

main()
  .catch((e) => {
    console.error("復元に失敗しました:", e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());

/**
 * scripts/create-column.ts の Supabase REST API 版。
 *
 * Prisma (= Postgres への直接接続) が使えない環境むけ。Claude Code on the web の
 * ような隔離コンテナからは 5432/6543 に出られないことがあり、その場合
 * `npx tsx scripts/create-column.ts` は接続できずに落ちる。こちらは
 * PostgREST(https://<project>.supabase.co/rest/v1/)越しに同じ2テーブルへ
 * INSERT するので、HTTPS さえ通れば動く。
 *
 * 依存ゼロ。node_modules が無くても動くよう、素の node だけで書いてある
 * (npm install も prisma generate も不要)。
 *
 *   node scripts/create-column-rest.mjs <payload.json>
 *   node scripts/create-column-rest.mjs <payload.json> --dry   # 検証だけして書かない
 *
 * 必要な環境変数は utils/supabase.ts と同じ SUPABASE_URL / SUPABASE_KEY。
 * 書き込むので service_role キーが要る(anon キーだと RLS で弾かれる)。
 * .env があれば読む。
 *
 * ------------------------------------------------------------------
 * create-column.ts との違い
 * ------------------------------------------------------------------
 * バリデーションは向こうと同じものを移植してある(タグの正典チェック、
 * 連載の名前と回数の対、displayOrder 0 への挿絵禁止、image 無しの
 * imageSummary 禁止、挿絵3枚以上の警告)。タグの正典は二重管理に
 * ならないよう lib/column-taxonomy.ts から実行時に読み出す。
 *
 * 違いは id の採番だけ。Prisma の `@default(cuid())` はDBのデフォルトでは
 * なくクライアント側で値を作っているため、REST から入れるときは自分で
 * cuid を生成して渡す必要がある。ContentSection.id は SERIAL なのでDB任せ。
 *
 * Content と ContentSection は別リクエストになるので、節の INSERT が失敗
 * したら本体を消してから終了する(中身の無いコラムが /column に出るのを防ぐ)。
 */

import { readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { hostname } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// .env は dotenv 無しで読む。`export KEY=value` と引用符だけ面倒を見る。
function loadDotEnv() {
  let text;
  try {
    text = readFileSync(path.join(ROOT, ".env"), "utf-8");
  } catch {
    return;
  }
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}

/** lib/column-taxonomy.ts を正典として読む(ここでタグ一覧を複製しない)。 */
function loadTags() {
  const src = readFileSync(path.join(ROOT, "lib", "column-taxonomy.ts"), "utf-8");
  const block = src.slice(src.indexOf("COLUMN_TAGS"), src.indexOf("] as const"));
  const keys = [...block.matchAll(/key:\s*"([^"]+)"/g)].map((m) => m[1]);
  if (keys.length === 0) throw new Error("could not read COLUMN_TAGS from lib/column-taxonomy.ts");
  return keys;
}

/**
 * cuid v1。Prisma の `@default(cuid())` が入れるのと同じ形にそろえる
 * ('c' + 時刻 + カウンタ + フィンガープリント + 乱数、全25文字)。
 * 既存行と見分けがつかない形にしておかないと、後から並べたときに浮く。
 */
let counter = Math.floor(Math.random() * 1679616);
const FINGERPRINT = (() => {
  const host = hostname();
  const hostSum = host.split("").reduce((a, c) => a + c.charCodeAt(0), host.length + 36);
  const pid = process.pid.toString(36).padStart(2, "0").slice(-2);
  return pid + hostSum.toString(36).padStart(2, "0").slice(-2);
})();

function cuid() {
  const ts = Date.now().toString(36);
  counter = (counter + 1) % 1679616;
  const cnt = counter.toString(36).padStart(4, "0");
  const rnd = [...randomBytes(6)].map((b) => b.toString(36)).join("").slice(0, 8).padEnd(8, "0");
  return `c${ts}${cnt}${FINGERPRINT}${rnd}`;
}

function toSlugBase(title) {
  const romanized = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (romanized) return romanized;
  return `column-${new Date().toISOString().slice(0, 10)}`;
}

function validatePayload(payload, validTags) {
  if (!payload.title?.trim()) throw new Error("title is required");
  if (!payload.summary?.trim()) throw new Error("summary is required");

  if (!Array.isArray(payload.tags) || payload.tags.length === 0) {
    throw new Error(`tags must be a non-empty array. Valid tags: ${validTags.join(", ")}`);
  }
  for (const tag of payload.tags) {
    if (!validTags.includes(tag)) {
      throw new Error(`Unknown tag "${tag}". Valid tags: ${validTags.join(", ")}`);
    }
  }

  const hasName = Boolean(payload.seriesName?.trim());
  const hasOrder = typeof payload.seriesOrder === "number";
  if (hasName !== hasOrder) {
    throw new Error("seriesName and seriesOrder must be provided together (or both omitted)");
  }
  if (hasOrder && payload.seriesOrder < 1) throw new Error("seriesOrder must be 1 or greater");

  if (!Array.isArray(payload.sections) || payload.sections.length === 0) {
    throw new Error("sections must be a non-empty array");
  }
  for (const [i, sec] of payload.sections.entries()) {
    if (!sec.title?.trim()) throw new Error(`sections[${i}].title is required`);
    if (!sec.description?.trim()) throw new Error(`sections[${i}].description is required`);
    if (typeof sec.displayOrder !== "number") {
      throw new Error(`sections[${i}].displayOrder must be a number`);
    }
    if (sec.imageSummary?.trim() && !sec.image?.trim()) {
      throw new Error(`sections[${i}].imageSummary needs sections[${i}].image`);
    }
    if (sec.displayOrder === 0 && sec.image?.trim()) {
      throw new Error(
        `sections[${i}].image is not allowed on the first section ` +
          `(displayOrder 0): it lands right under the article's own image`,
      );
    }
  }

  const illustrated = payload.sections.filter((s) => s.image?.trim()).length;
  if (illustrated > 2) {
    console.warn(
      `Warning: ${illustrated} section images. The guideline is 0-2 — ` +
        `keep only the ones that help the reader understand the section.`,
    );
  }
}

function restClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_KEY must be set");
  const base = `${url.replace(/\/+$/, "")}/rest/v1`;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };

  async function request(method, pathAndQuery, { body, prefer } = {}) {
    const res = await fetch(`${base}${pathAndQuery}`, {
      method,
      headers: prefer ? { ...headers, Prefer: prefer } : headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`${method} ${pathAndQuery} -> HTTP ${res.status}: ${text.slice(0, 600)}`);
    }
    return text ? JSON.parse(text) : null;
  }

  return {
    get: (p) => request("GET", p),
    post: (table, rows) =>
      request("POST", `/${table}`, { body: rows, prefer: "return=representation" }),
    delete: (p) => request("DELETE", p),
  };
}

async function findUniqueSlug(db, base) {
  let candidate = base;
  let n = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const hit = await db.get(
      `/Content?select=id&category=eq.column&slug=eq.${encodeURIComponent(candidate)}&limit=1`,
    );
    if (hit.length === 0) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

async function main() {
  loadDotEnv();
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) throw new Error("Usage: node scripts/create-column-rest.mjs <payload.json> [--dry]");

  const payload = JSON.parse(readFileSync(file, "utf-8"));
  validatePayload(payload, loadTags());

  const db = restClient();
  const slug = await findUniqueSlug(db, toSlugBase(payload.engTitle || payload.title));

  if (payload.seriesName) {
    const clash = await db.get(
      `/Content?select=slug&category=eq.column` +
        `&seriesName=eq.${encodeURIComponent(payload.seriesName)}` +
        `&seriesOrder=eq.${payload.seriesOrder}&limit=1`,
    );
    if (clash.length > 0) {
      throw new Error(
        `Series "${payload.seriesName}" already has 第${payload.seriesOrder}回: ${clash[0].slug}`,
      );
    }
  }

  if (dry) {
    console.log(
      `[dry] would create /column/${slug} — ` +
        `${payload.sections.length} sections, tags=[${payload.tags.join(", ")}]` +
        (payload.seriesName ? `, series="${payload.seriesName}" 第${payload.seriesOrder}回` : ""),
    );
    return;
  }

  const id = cuid();
  const now = new Date().toISOString();
  const [created] = await db.post("Content", [
    {
      id,
      title: payload.title,
      engTitle: payload.engTitle ?? null,
      slug,
      summary: payload.summary,
      mainText: payload.mainText ?? null,
      image: payload.image ?? null,
      website: payload.website ?? null,
      category: "column",
      route: "/column",
      tags: payload.tags,
      seriesName: payload.seriesName ?? null,
      seriesOrder: payload.seriesOrder ?? null,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  try {
    await db.post(
      "ContentSection",
      payload.sections
        .slice()
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map((s) => ({
          title: s.title,
          subtitle: s.subtitle ?? null,
          description: s.description,
          displayOrder: s.displayOrder,
          image: s.image ?? null,
          imageSummary: s.imageSummary ?? null,
          contentId: created.id,
          createdAt: now,
          updatedAt: now,
        })),
    );
  } catch (e) {
    // 本体だけ残ると、節の無いコラムが /column に並んでしまう。
    await db.delete(`/Content?id=eq.${created.id}`).catch(() => {});
    throw e;
  }

  console.log(`Created column: /column/${created.slug} (id=${created.id})`);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});

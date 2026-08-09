import "dotenv/config";

/**
 * Instagram の投稿URLが「生きているか」「誰の投稿か」を調べる。
 *
 *   npx tsx scripts/inspect-instagram.ts <URL または投稿ID> ...
 *
 * Instagram 本体は、ログアウト状態のリクエストに対して実在する投稿でも
 * 存在しないIDでも同じ JS シェルを 200 で返す。ステータスコードでは
 * 判定できない(検証済み: 架空IDでも 200 が返る)。
 *
 * そこで本文をレンダリングして返すリーダー(r.jina.ai)を経由する。
 * こちらは <title> を組み立てて返すため、
 *
 *   生存 → 「<アカウント名> on Instagram: "<キャプション>"」
 *   死亡 → 「Post isn't available」
 *
 * と、はっきり分かれる。削除済みの投稿と架空のIDは同じ扱いになるが、
 * どちらも「使えない」点では同じなので区別する必要はない。
 *
 * アカウント名が取れるのが重要で、検索で拾ったURLは公式ではなく
 * 小売店やファンアカウントの投稿であることが多い。埋め込む前に
 * 誰の投稿かを必ず確認する。
 */

const READER = "https://r.jina.ai/https://www.instagram.com/p/";

/** URL でも生IDでも受け取れるようにする。 */
function toId(raw: string): string | null {
  const clean = raw.trim().split("?")[0].replace(/\/+$/, "");
  // /p/ でも /reel/ でも、アカウント名が前に付いていても最後がID。
  const m = clean.match(/(?:\/(?:p|reel)\/)([A-Za-z0-9_-]+)$/);
  if (m) return m[1];
  // 素のIDが渡された場合。
  if (/^[A-Za-z0-9_-]{5,}$/.test(clean)) return clean;
  return null;
}

type Result = {
  id: string;
  alive: boolean;
  account: string | null;
  caption: string | null;
};

async function inspect(id: string): Promise<Result> {
  const res = await fetch(`${READER}${id}/`, {
    headers: { "User-Agent": "just-rondon/1.0 (link checker)" },
  });
  const text = await res.text();
  const title = text.match(/^Title:\s*(.*)$/m)?.[1]?.trim() ?? "";

  if (!title || /Post isn't available|Page Not Found/i.test(title)) {
    return { id, alive: false, account: null, caption: null };
  }

  // 「<アカウント> on Instagram: "<キャプション>"」の形を分解する。
  const m = title.match(/^(.*?)\s+on Instagram:\s*"?([\s\S]*?)"?$/);
  return {
    id,
    alive: true,
    account: m?.[1]?.trim() ?? null,
    caption: (m?.[2] ?? title).replace(/\s+/g, " ").trim() || null,
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      "使い方: npx tsx scripts/inspect-instagram.ts <URL または投稿ID> ...",
    );
    process.exit(1);
  }

  let dead = 0;

  for (const arg of args) {
    const id = toId(arg);
    if (!id) {
      console.log(`? ${arg}\n    URLから投稿IDを取り出せない`);
      dead += 1;
      continue;
    }

    try {
      const r = await inspect(id);
      if (!r.alive) {
        dead += 1;
        console.log(`✗ ${id}\n    投稿が存在しない（削除済みか誤ったID）`);
        continue;
      }
      console.log(`✓ ${id}`);
      console.log(`    アカウント: ${r.account ?? "(不明)"}`);
      if (r.caption) console.log(`    ${r.caption.slice(0, 100)}`);
      console.log(`    https://www.instagram.com/p/${id}/`);
    } catch (err) {
      dead += 1;
      console.log(`! ${id}\n    確認できなかった: ${(err as Error).message}`);
    }
  }

  if (dead) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

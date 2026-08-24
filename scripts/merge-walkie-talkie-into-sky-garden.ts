/**
 * ウォーキー・トーキーをスカイガーデンに統合する（2026-08）。
 *
 * 20-fenchurch-street-walkie-talkie と sky-garden-london は同じ建物・
 * 同じ訪問体験を指す重複行だった。住所は同じ EC3M 8AF、公式サイトも
 * 画像も同一で、ウォーキー・トーキー側の本文（見どころ・料金・所要時間）
 * も中身はスカイガーデンの説明になっている。ビルは営業中のオフィスで、
 * 訪問者が入れるのは最上部のスカイガーデンだけなので、訪問先として
 * 分ける実体がない。
 *
 * さらに予約枠の説明が食い違っていた（3週間先 vs 翌週分）ため、
 * どちらのページに当たるかで読者の準備時期が変わってしまっていた。
 *
 * 方針:
 *   - スカイガーデン側に寄せる。予約サイト名も検索語もこちらが主。
 *   - ウォーキー・トーキー側にしか無い事実（カーバンクル・カップ受賞、
 *     ルーバーが後付けだと見上げて分かる話）だけを移す。ヴィニオリ設計・
 *     ジャガーが溶けた件・許可条件としての無料開放は、スカイガーデン側に
 *     すでにより詳しく書かれているので移さない。
 *   - 行は削除せず isPublished:false で伏せる。削除すると本文と visitFlow が
 *     巻き添えで消え、何を載せていたか追えなくなる（schema の注記に従う）。
 *
 * 冪等。--dry で差分だけ表示する。
 */
import db from "@/utils/db";

const DRY = process.argv.includes("--dry");

const KEEP = "sky-garden-london";
const MERGE = "20-fenchurch-street-walkie-talkie";

/**
 * スカイガーデン側の trivia に足す行。
 * 重複を避けるため、向こうにしか無い事実だけに絞る。
 */
const EXTRA_TRIVIA = [
  "- **2015年、英国で最も醜い建物に贈られる「カーバンクル・カップ」を受賞**しています。景観論争がそれだけ大きかったということでもあります。",
  "- **外壁に並ぶ横方向の庇は後付け**です。反射光の対策として3〜34階に取り付けられたもので、近くで見上げると分かります。",
];

async function main() {
  const keep = await db.attraction.findUnique({
    where: { slug: KEEP },
    include: { stories: true },
  });
  const merge = await db.attraction.findUnique({ where: { slug: MERGE } });

  if (!keep) throw new Error(`${KEEP} が見つからない`);
  if (!merge) {
    console.log(`${MERGE} は既に無い。何もしない。`);
    return;
  }

  // 1) スカイガーデンの trivia に、向こうにしか無い事実を足す。
  const trivia = keep.stories.find((s) => s.kind === "trivia");
  if (!trivia) {
    throw new Error(`${KEEP} に trivia が無い。想定外なので中断する。`);
  }

  // 冪等性の判定は、行そのものが既に本文に含まれているかで見る。
  const missing = EXTRA_TRIVIA.filter((line) => !trivia.body.includes(line));

  if (missing.length > 0) {
    const nextBody = `${trivia.body.trimEnd()}\n${missing.join("\n")}`;
    console.log(`trivia に ${missing.length} 行追加:`);
    missing.forEach((m) => console.log(`  + ${m}`));
    if (!DRY) {
      await db.attractionStory.update({
        where: { id: trivia.id },
        data: { body: nextBody },
      });
    }
  } else {
    console.log("trivia は追加済み。");
  }

  // 2) ウォーキー・トーキーを非公開にする。
  if (merge.isPublished) {
    console.log(`${MERGE} を非公開にする`);
    if (!DRY) {
      await db.attraction.update({
        where: { id: merge.id },
        data: { isPublished: false },
      });
    }
  } else {
    console.log(`${MERGE} は既に非公開。`);
  }

  console.log(`\n${DRY ? "[dry] " : ""}完了`);
}

main().finally(() => process.exit(0));

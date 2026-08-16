/**
 * あらすじ4層(storyHook / characters / appeals / storyEnding)を入れる。
 *
 * 既存の description は「物語の流れ」の層としてそのまま使うが、結末を
 * 含んだままの原稿は scenes で上書きして結末を切り落とす。切り落とした
 * ぶんが storyEnding に入り、ページでは折りたたみの中にだけ出る。
 *
 * 原稿は作品数が多いので scripts/story-content/ 以下に分けて置き、
 * ここでは束ねるだけにする。
 *
 * 書くときの約束:
 * - storyHook は地の文。箇条書きにしない。何が起きるかではなく、
 *   何に心を動かされる話なのかを書く。結末には触れない。
 * - characters は筋ではなく人物を説明する。「〜する人」ではなく
 *   「〜を抱えている人」。並び順は主人公から関係の遠い順。
 * - appeals は「劇場でしか起きないこと」を書く。あらすじを繰り返さない。
 *   舞台機構・生の歌唱・客席の反応など、映像や粗筋では代えられない
 *   ものだけを挙げる。kind:"trivia" には裏付けの取れた事実だけを置く
 *   (下の出典コメントを参照)。曖昧な伝聞は書かない——読者が現地で
 *   確かめられる話なので、外すと信用がそのまま損なわれる。
 * - SCENES はクライマックスの手前で止める。結末は ENDING に置く。
 *
 * 実行:
 *   npx tsx scripts/seed-musical-story.ts --dry
 *   npx tsx scripts/seed-musical-story.ts
 *   npx tsx scripts/seed-musical-story.ts wicked
 */

import { PrismaClient } from "@prisma/client";
import { FLAGSHIP_STORIES } from "./story-content/flagship";
import type { Story } from "./story-content/types";

const prisma = new PrismaClient();

const STORIES: Record<string, Story> = {
  ...FLAGSHIP_STORIES,
};

async function main() {
  const dry = process.argv.includes("--dry");
  const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

  const slugs = only.length > 0 ? only : Object.keys(STORIES);

  for (const slug of slugs) {
    const story = STORIES[slug];
    if (!story) {
      console.error(`✗ ${slug}: STORIES に原稿がありません`);
      continue;
    }

    const musical = await prisma.musical.findUnique({
      where: { slug },
      select: { id: true, name: true },
    });
    if (!musical) {
      console.error(`✗ ${slug}: 作品が見つかりません`);
      continue;
    }

    if (dry) {
      const highlights = story.appeals.filter((a) => a.kind === "highlight");
      console.log(
        `- ${musical.name}: hook ${story.storyHook.length}字 / ` +
          `人物 ${story.characters.length}人 / ` +
          `見どころ ${highlights.length}件・裏話 ${story.appeals.length - highlights.length}件 / ` +
          `scenes ${story.scenes.length}字 / ending ${story.storyEnding.length}字`,
      );
      continue;
    }

    await prisma.musical.update({
      where: { id: musical.id },
      data: {
        storyHook: story.storyHook,
        characters: story.characters,
        appeals: story.appeals,
        description: story.scenes,
        storyEnding: story.storyEnding,
      },
    });
    console.log(`✓ ${musical.name}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

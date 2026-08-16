import type {
  MusicalAppeal,
  MusicalCharacter,
} from "../../components/musicals/story";

/**
 * 1作品ぶんのあらすじ原稿。
 *
 * 書くときの約束は scripts/seed-musical-story.ts の冒頭にまとめている。
 * 特に appeals の裏話(kind:"trivia")は、出典URLをコードのコメントとして
 * 原稿の真横に必ず残すこと。
 */
export type Story = {
  storyHook: string;
  characters: MusicalCharacter[];
  appeals: MusicalAppeal[];
  /** description を差し替える原稿。結末を含まないところまで。 */
  scenes: string;
  storyEnding: string;
};

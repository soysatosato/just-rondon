import type { HistoryChapter } from "../types";
import angloSaxonsVikings from "./anglo-saxons-vikings";
import civilWar from "./civil-war";
import industrialRevolution from "./industrial-revolution";
import modernBritain from "./modern-britain";
import normanConquest from "./norman-conquest";
import postwar from "./postwar";
import romanBritain from "./roman-britain";
import tudors from "./tudors";
import unionAndEmpire from "./union-and-empire";
import worldWars from "./world-wars";

/**
 * slug → 章。
 *
 * chapters.ts の historyChapters と過不足なく一致させること。
 * 章を足したら、chapters.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages の3箇所を更新する。
 *
 * 並びは時系列（第1章から第10章）。オブジェクトのキー順が
 * そのまま章順になるようにしておくと、取りこぼしに気づきやすい。
 */
export const historyChapterArticles: Record<string, HistoryChapter> = {
  "roman-britain": romanBritain,
  "anglo-saxons-vikings": angloSaxonsVikings,
  "norman-conquest": normanConquest,
  tudors,
  "civil-war": civilWar,
  "union-and-empire": unionAndEmpire,
  "industrial-revolution": industrialRevolution,
  "world-wars": worldWars,
  postwar,
  "modern-britain": modernBritain,
};

export {
  romanBritain,
  angloSaxonsVikings,
  normanConquest,
  tudors,
  civilWar,
  unionAndEmpire,
  industrialRevolution,
  worldWars,
  postwar,
  modernBritain,
};

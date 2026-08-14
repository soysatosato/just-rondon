import type { SocialGuideArticle } from "../types";
import communityDistance from "./community-distance";
import datingApps from "./dating-apps";
import datingCulture from "./dating-culture";
import datingSafety from "./dating-safety";
import howBritsMakeFriends from "./how-brits-make-friends";
import japaneseEvents from "./japanese-events";
import keepingFriendships from "./keeping-friendships";
import whereJapaneseGather from "./where-japanese-gather";
import whereToMeetPeople from "./where-to-meet-people";

/**
 * slug → 記事。
 *
 * guides.ts の socialGuides と過不足なく一致させること。
 * 記事を足したら、guides.ts の並び・このマップ・
 * next-sitemap.config.js の staticPages の3箇所を更新する。
 *
 * 全9本で完結。並びは guides.ts の socialGuides と同じ
 * (友人3本 → 恋愛3本 → 日本人コミュニティ3本)。
 */
export const socialGuideArticles: Record<string, SocialGuideArticle> = {
  "how-brits-make-friends": howBritsMakeFriends,
  "where-to-meet-people": whereToMeetPeople,
  "keeping-friendships": keepingFriendships,
  "dating-apps": datingApps,
  "dating-culture": datingCulture,
  "dating-safety": datingSafety,
  "where-japanese-gather": whereJapaneseGather,
  "japanese-events": japaneseEvents,
  "community-distance": communityDistance,
};

export {
  howBritsMakeFriends,
  whereToMeetPeople,
  keepingFriendships,
  datingApps,
  datingCulture,
  datingSafety,
  whereJapaneseGather,
  japaneseEvents,
  communityDistance,
};

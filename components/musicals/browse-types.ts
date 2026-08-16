/**
 * /musicals トップがクライアントへ渡す作品の形。
 *
 * Prisma の Musical をそのまま使わないのは、description(最大2600字)を
 * 含む全カラムがクライアントへの JSON に載ってしまうため。
 * utils/actions/musicals.ts の fetchMusicalsForBrowse の select と
 * 一致させること。
 */
export type BrowseMusical = {
  id: string;
  slug: string;
  name: string;
  engName: string;
  summary: string;
  image: string;
  highlights: string[];
  mustSee: boolean;
  recommendLevel: number;
  isOnShow: boolean;
  address: string;
  runtimeMinutes: number | null;
  intervalMinutes: number | null;
  minAgeGuidance: number | null;
  englishForm: string | null;
  theatre: { slug: string; name: string; nameJa: string } | null;
  theatreName: string;
};

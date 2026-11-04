/**
 * 同じ建物・同じ会場にあって、別々のページで案内しているスポットの組。
 *
 * 2026-11 の見直しで、統合はせず役割を書き分けて相互にリンクすると決めた
 * (ユーザーの判断、推奨どおり)。たとえばバービカンはセンター・アート・
 * ギャラリー・温室の3ページがあり、Search Console ではセンターが195表示、
 * アート・ギャラリーが172表示と、別々の問いで出ている(2026-08-05〜11-01)。
 * 1本にまとめると、どちらかの問いへの答えが薄くなる。代わりに、どのページを
 * 読めばよいかを各ページの冒頭で示す。
 *
 * role は「そのページが何の案内か」を1行で。料金や時間は書かない
 * (Attraction の列が持つ)。
 */

export type SpotGroupMember = { slug: string; name: string; role: string };

export type SpotGroup = {
  id: string;
  /** 「バービカン・センターの3つのページ」 */
  title: string;
  members: SpotGroupMember[];
};

export const SPOT_GROUPS: readonly SpotGroup[] = [
  {
    id: "barbican",
    title: "バービカン・センターの中の3つのページ",
    members: [
      {
        slug: "barbican-centre",
        name: "バービカン・センター",
        role: "建物と、ホール・劇場・映画館。無料で歩けるロビーとテラス",
      },
      {
        slug: "barbican-art-gallery",
        name: "バービカン・アート・ギャラリー",
        role: "有料の企画展(常設展は無い)",
      },
      {
        slug: "barbican-conservatory",
        name: "バービカン温室",
        role: "公開日だけ開く温室。無料・予約制",
      },
    ],
  },
  {
    id: "tottenham-stadium",
    title: "トッテナム・ホットスパー・スタジアムの3つの体験",
    members: [
      {
        slug: "tottenham-hotspur-stadium-tour",
        name: "スタジアムツアー",
        role: "更衣室や選手の通路など、スタジアムの中を歩くツアー",
      },
      {
        slug: "the-dare-skywalk-tottenham-hotspur-stadium",
        name: "デア・スカイウォーク",
        role: "ハーネスを着けて屋根の上を歩く(8歳以上)",
      },
      {
        slug: "f1-drive-london",
        name: "F1 ドライブ・ロンドン",
        role: "スタジアムの中のカートのサーキット",
      },
    ],
  },
  {
    id: "afternoon-tea-bus",
    title: "アフタヌーンティーのバス(2社)",
    members: [
      {
        slug: "afternoon-tea-bus-london",
        name: "アフタヌーンティーバス",
        role: "2階建てバスで食べるアフタヌーンティー(出発地は予約のときに決まる)",
      },
      {
        slug: "taylor-swift-afternoon-tea-bus-tour",
        name: "テイラー・スウィフト風 アフタヌーンティー・バスツアー",
        role: "Golden Tours の、テイラー・スウィフトの曲を流すバス(ヴィクトリア駅近くから出発)",
      },
    ],
  },
  {
    id: "battersea-power-station",
    title: "バタシー発電所の2つのページ",
    members: [
      {
        slug: "battersea-power-station",
        name: "バタシー発電所",
        role: "発電所の建物と、中のショップ・レストラン",
      },
      {
        slug: "chimney-lift-battersea-power-station",
        name: "チムニー・リフト",
        role: "煙突の中を109m上る有料の展望リフト",
      },
    ],
  },
];

const BY_SLUG = new Map<string, SpotGroup>();
for (const group of SPOT_GROUPS) {
  for (const member of group.members) BY_SLUG.set(member.slug, group);
}

export function spotGroupFor(slug: string): SpotGroup | null {
  return BY_SLUG.get(slug) ?? null;
}

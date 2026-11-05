/**
 * 同じ店・同じ名前を扱う複数のページを、役割を分けて案内し合うための表。
 *
 * フォートナム&メイソンはブランド・観光・お土産・ティーサロン(店)の4か所、
 * トワイニングなどはブランドとお土産の2か所に載っている。統合はせず
 * (観光スポットのページはプランとスタンプにつながっている)、各ページの役割を
 * 一言で書いて互いに案内する。検索でどれか1つに着地した人が、自分の目的の
 * ページへ移れるようにするため。
 *
 * role は「そのページで何が分かるか」。ページの題名と食い違わないこと。
 */
export type SameNamePage = { href: string; label: string; role: string };

const GROUPS: SameNamePage[][] = [
  [
    {
      href: "/brands/fortnum-and-mason",
      label: "フォートナム&メイソン(ブランド)",
      role: "何を買うか、どの店で買うか",
    },
    {
      href: "/sightseeing/fortnum-and-mason",
      label: "フォートナム・アンド・メイソン(観光)",
      role: "本店の歩き方と所要時間",
    },
    {
      href: "/souvenirs/fortnum-and-mason-tea",
      label: "フォートナム&メイソンの紅茶(お土産)",
      role: "どの紅茶を選ぶか、どう持ち帰るか",
    },
    {
      href: "/restaurants/fortnum-and-mason-tea-salon",
      label: "フォートナム&メイソンのティーサロン",
      role: "アフタヌーンティーの予約と価格",
    },
  ],
  [
    {
      href: "/brands/twinings",
      label: "トワイニング(ブランド)",
      role: "ブランドの成り立ちと、ストランドの本店",
    },
    {
      href: "/souvenirs/twinings-tea",
      label: "トワイニングの紅茶(お土産)",
      role: "どの紅茶を選ぶか、どう持ち帰るか",
    },
  ],
  [
    {
      href: "/brands/jo-malone-london",
      label: "ジョー マローン ロンドン(ブランド)",
      role: "ブランドの成り立ちと、ロンドンの店",
    },
    {
      href: "/souvenirs/jo-malone-london",
      label: "ジョー マローンの香り(お土産)",
      role: "どの香りを選ぶか、どう持ち帰るか",
    },
  ],
  [
    {
      href: "/brands/penhaligons",
      label: "ペンハリガン(ブランド)",
      role: "ブランドの成り立ちと、ロンドンの店",
    },
    {
      href: "/souvenirs/penhaligons",
      label: "ペンハリガンの香り(お土産)",
      role: "どの香りを選ぶか、どう持ち帰るか",
    },
  ],
];

/** そのページと同じ名前を扱う、ほかのページ。無ければ空配列。 */
export function sameNamePages(currentHref: string): SameNamePage[] {
  const group = GROUPS.find((g) => g.some((p) => p.href === currentHref));
  return group ? group.filter((p) => p.href !== currentHref) : [];
}

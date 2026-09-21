/**
 * ユーザーネームの規則と、最初に自動で付く名前。
 *
 * このサイトは顔写真も本名も扱わない。読者を表すのはユーザーネームだけで、
 * 登録すると「ロンドンの地名+英国らしい名詞」(PimlicoPuffin、SohoBusker)が
 * ランダムに付き、本人が /account で変えられる。
 *
 * ここでは DB に触らない。空いているかの確認と保存は lib/profile.ts でやる。
 * 文字数の上限はフォームでも使うので、クライアントから読まれて困るものは置かない。
 */

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 24;

/* ------------------------------------------------------------------ *
 * 自動で付く名前
 * ------------------------------------------------------------------ */

/*
  型は「地名+名詞」の1つだけにしてある。語を足せば組み合わせはそのまま増えるので、
  数字付きの名前(SohoBusker42)が目立ってきたら、まず下の2つに語を足す。
  型を増やす(爵位型の EarlOfIslington など)のは、それでも足りなくなってから。

  どちらも11文字以内にすること。数字2桁を足しても USERNAME_MAX_LENGTH に収まり、
  自動で付けた名前が自分の規則で弾かれることが無い。

  英俗語で別の意味になる語は入れない(crumpet、tart、banger など)。本人が
  選んだ名前ではないので、からかわれていると取られかねない語(toff など)も避ける。
*/

/** ロンドンの街・駅の名前。1語で書けるものだけ。 */
const PLACES = [
  "Aldgate",
  "Angel",
  "Balham",
  "Bankside",
  "Barbican",
  "Barnes",
  "Battersea",
  "Bayswater",
  "Belgravia",
  "Bermondsey",
  "Blackheath",
  "Bloomsbury",
  "Borough",
  "Bow",
  "Brixton",
  "Brockley",
  "Camden",
  "Chelsea",
  "Chiswick",
  "Clapham",
  "Clerkenwell",
  "Dalston",
  "Deptford",
  "Dulwich",
  "Ealing",
  "Fulham",
  "Greenwich",
  "Hackney",
  "Hammersmith",
  "Hampstead",
  "Highbury",
  "Highgate",
  "Holborn",
  "Hoxton",
  "Islington",
  "Kennington",
  "Kensington",
  "Kew",
  "Kilburn",
  "Lambeth",
  "Lewisham",
  "Limehouse",
  "Marylebone",
  "Mayfair",
  "Paddington",
  "Peckham",
  "Pimlico",
  "Putney",
  "Richmond",
  "Rotherhithe",
  "Shoreditch",
  "Soho",
  "Southwark",
  "Stockwell",
  "Stratford",
  "Streatham",
  "Temple",
  "Thames",
  "Tooting",
  "Twickenham",
  "Vauxhall",
  "Walthamstow",
  "Wandsworth",
  "Wapping",
  "Waterloo",
  "Wembley",
  "Westminster",
  "Whitechapel",
  "Wimbledon",
  "Woolwich",
] as const;

/** 英国らしい動物・食べ物・人・モノ。 */
const NOUNS = [
  // 動物
  "Badger",
  "Beagle",
  "Bulldog",
  "Corgi",
  "Fox",
  "Hare",
  "Hedgehog",
  "Heron",
  "Kingfisher",
  "Lion",
  "Magpie",
  "Otter",
  "Owl",
  "Parakeet",
  "Pigeon",
  "Pony",
  "Puffin",
  "Raven",
  "Robin",
  "Squirrel",
  "Stag",
  "Swan",
  "Terrier",
  "Unicorn",
  "Wren",
  // 食べ物
  "Biscuit",
  "Crumble",
  "Cuppa",
  "Custard",
  "Flapjack",
  "Kipper",
  "Marmalade",
  "Muffin",
  "Pasty",
  "Pudding",
  "Scone",
  "Shortbread",
  "Teacake",
  "Toastie",
  "Treacle",
  "Trifle",
  // 人
  "Beefeater",
  "Bobby",
  "Busker",
  "Cabbie",
  "Lamplighter",
  "Mudlark",
  "Postie",
  "Rambler",
  // モノ
  "Bowler",
  "Brolly",
  "Bunting",
  "Busby",
  "Conker",
  "Cricket",
  "Crown",
  "Kettle",
  "Monocle",
  "Oyster",
  "Phonebox",
  "Postbox",
  "Routemaster",
  "Tartan",
  "Teapot",
  "Wellie",
] as const;

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * ランダムな名前を1つ作る。空いているかは見ない。
 *
 * 最初は数字を付けない。SohoBusker と SohoBusker42 なら前者のほうが
 * 名前として読めるので、2桁(10〜99)は埋まっていたときだけ足す
 * (いつ足すかは lib/profile.ts が決める)。
 */
export function randomUsername({
  withNumber,
}: {
  withNumber: boolean;
}): string {
  const number = withNumber ? String(10 + Math.floor(Math.random() * 90)) : "";
  return `${pick(PLACES)}${pick(NOUNS)}${number}`;
}

/* ------------------------------------------------------------------ *
 * 本人が付ける名前の規則
 * ------------------------------------------------------------------ */

/**
 * 運営と紛らわしい名前。
 *
 * 今のユーザーネームは本人にしか見えないので最小限にしてある。掲示板のように
 * 他人に見える場所へ出すときに見直すこと。
 */
const RESERVED = [
  "admin",
  "administrator",
  "moderator",
  "official",
  "staff",
  "support",
  "system",
];

function isReserved(username: string): boolean {
  const bare = username.toLowerCase().replace(/[_0-9]/g, "");
  return RESERVED.includes(bare) || bare.includes("rondon");
}

/** 名前を確かめた・変えた結果。通れば保存する形の名前、弾けば理由を返す。 */
export type UsernameResult =
  | { ok: true; username: string }
  | { ok: false; error: string };

/**
 * 本人が入力した名前を確かめる。通れば保存する形に整えて返す。
 *
 * 使えるのは半角英数字と _ だけ。自動で付く名前と見た目がそろい、
 * 将来 URL や @メンションに使うことになってもそのまま使える。
 *
 * 全角で打たれた英数字(ＳｏｈｏＢｕｓｋｅｒ)は半角に直す。日本語入力のまま
 * 打つ人は多く、弾いて打ち直させるより直したほうが早い。
 */
export function checkUsername(input: string): UsernameResult {
  const username = input.normalize("NFKC").trim();

  if (username.length === 0) {
    return { ok: false, error: "ユーザーネームを入力してください" };
  }
  if (!/^[A-Za-z0-9_]+$/.test(username)) {
    return { ok: false, error: "使えるのは半角英数字と _ だけです" };
  }
  if (
    username.length < USERNAME_MIN_LENGTH ||
    username.length > USERNAME_MAX_LENGTH
  ) {
    return {
      ok: false,
      error: `${USERNAME_MIN_LENGTH}〜${USERNAME_MAX_LENGTH}文字にしてください`,
    };
  }
  if (!/[A-Za-z]/.test(username)) {
    return { ok: false, error: "英字を1文字以上入れてください" };
  }
  if (isReserved(username)) {
    return { ok: false, error: "この名前は使えません" };
  }
  return { ok: true, username };
}

/**
 * 重複を判定するための形。Profile.usernameKey に入れる。
 *
 * 大文字小文字だけが違う名前(PimlicoPuffin と pimlicopuffin)を、
 * 別の人に取らせないため。
 */
export function usernameKey(username: string): string {
  return username.toLowerCase();
}

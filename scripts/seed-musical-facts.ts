/**
 * 上演時間・休憩・推奨年齢・英語の形式を入れる。
 *
 * 埋めるのは確認が取れた作品だけ。未確認は null のまま残し、
 * ページ側は項目ごと出さない。推定を入れてはいけない——
 * 「2時間半で終わる」と読んで夕食を予約した読者が間に合わなくなる。
 *
 * runtimeMinutes は休憩込みの総所要時間。intervalMinutes はその内数で、
 * 0 は「休憩なしで通す」を意味する(未確認の null とは別物)。
 *
 * englishForm / englishNote は「難易度」ではない。上演の形式という事実と、
 * そう言える根拠だけを持つ。どちらが楽かは読者の得手不得手で入れ替わるので、
 * サイトの側では判定しない。
 *
 * 実行:
 *   npx tsx scripts/seed-musical-facts.ts --dry
 *   npx tsx scripts/seed-musical-facts.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Facts = {
  runtimeMinutes: number;
  intervalMinutes: number;
  minAgeGuidance: number;
  englishForm: "sung-through" | "dialogue-heavy" | "balanced" | "non-verbal";
  /** なぜその形式と言えるかの根拠。ENGLISH_FORM_NOTES の後ろに続けて表示される。 */
  englishNote: string;
};

const FACTS: Record<string, Facts> = {
  "disneys-the-lion-king": {
    runtimeMinutes: 150,
    intervalMinutes: 20,
    minAgeGuidance: 6,
    englishForm: "balanced",
    englishNote:
      "原作のディズニー映画が日本で広く知られており、筋を知ったうえで観る人が多い作品です。パペットと衣装による視覚表現の比重が大きく、英語を細かく追えなくても場面の意味を取りやすくなっています。",
  },
  "les-miserables": {
    runtimeMinutes: 170,
    intervalMinutes: 20,
    minAgeGuidance: 7,
    englishForm: "sung-through",
    englishNote:
      "台詞にあたる部分もほぼ歌で進みます。日本でも上演が重ねられ、原作小説と併せて筋が知られているため、場面の対応を取りやすい作品です。",
  },
  "phantom-of-the-opera": {
    runtimeMinutes: 150,
    intervalMinutes: 20,
    minAgeGuidance: 10,
    englishForm: "sung-through",
    englishNote:
      "物語は劇場という一つの舞台の中で進み、登場人物も多くありません。関係が追いやすく、歌詞を逐一聞き取れなくても筋を見失いにくい構成です。",
  },
  wicked: {
    runtimeMinutes: 165,
    intervalMinutes: 20,
    minAgeGuidance: 7,
    englishForm: "balanced",
    englishNote:
      "『オズの魔法使い』の前日譚という設定で、原典を知っていると人物の関係が掴みやすくなります。台詞には言葉遊びが多く、そこは聞き取れなくても筋には影響しません。",
  },
  hamilton: {
    runtimeMinutes: 165,
    intervalMinutes: 20,
    minAgeGuidance: 10,
    englishForm: "sung-through",
    englishNote:
      "早口のラップで進む場面が多く、単位時間あたりの情報量がウエストエンドの作品でも際立って多い作品です。加えて18世紀アメリカ建国期の人名と出来事が前提知識として要ります。予習の有無で理解度がはっきり変わります。",
  },
  "matilda-the-musical": {
    runtimeMinutes: 160,
    intervalMinutes: 20,
    minAgeGuidance: 6,
    englishForm: "balanced",
    englishNote:
      "子ども向けに作られており、発音は明瞭です。一方で歌詞に韻を踏んだ言葉遊びが多く、その面白さは聞き取れないと伝わりません。筋自体は原作小説が日本でも知られています。",
  },
  "mamma-mia": {
    runtimeMinutes: 145,
    intervalMinutes: 20,
    minAgeGuidance: 5,
    englishForm: "balanced",
    englishNote:
      "ABBAの既存曲で構成されており、曲を知っていれば歌詞は耳に入りやすくなります。筋も「母の結婚式に父親候補が集まる」という一行で説明できる単純さです。",
  },
  six: {
    runtimeMinutes: 80,
    intervalMinutes: 0,
    minAgeGuidance: 10,
    englishForm: "sung-through",
    englishNote:
      "休憩なしの80分で、コンサート形式で進みます。ヘンリー8世の6人の妃という前提を知っていると各曲の立ち位置が掴めます。現代的な言い回しと歴史の固有名詞が混ざるため、聞き取りの負荷は高めです。",
  },
  "harry-potter-cursed-child": {
    runtimeMinutes: 210,
    intervalMinutes: 20,
    minAgeGuidance: 10,
    englishForm: "dialogue-heavy",
    englishNote:
      "歌のない戯曲で、筋は台詞だけで進みます。原作シリーズを読んでいることが実質的な前提で、登場人物の関係や過去の出来事の説明は最小限です。上演時間も長く、英語で筋を追う負担はウエストエンドの人気作の中では大きい部類です。",
  },
  "the-mousetrap": {
    runtimeMinutes: 130,
    intervalMinutes: 20,
    minAgeGuidance: 10,
    englishForm: "dialogue-heavy",
    englishNote:
      "推理劇で、手がかりと伏線が台詞の中だけに置かれます。誰が何を言ったかを取り違えると結末の意外性が伝わらないため、英語で筋を追う前提の作品です。",
  },
  "the-play-that-goes-wrong": {
    runtimeMinutes: 135,
    intervalMinutes: 20,
    minAgeGuidance: 8,
    englishForm: "non-verbal",
    englishNote:
      "「劇が次々に失敗していく」という状況そのものが笑いになる作品です。仕掛けの大半は装置の崩壊や役者の動きで見せるため、台詞が聞き取れなくても何が起きているかは伝わります。",
  },
  "the-book-of-mormon": {
    runtimeMinutes: 150,
    intervalMinutes: 15,
    minAgeGuidance: 17,
    englishForm: "balanced",
    englishNote:
      "アメリカの宗教と時事を題材にした風刺で、笑いの多くが英語圏の文脈に依存します。歌詞も速く、下ネタと固有名詞が入り混じります。年齢の目安が高く設定されている作品です。",
  },
  hadestown: {
    runtimeMinutes: 145,
    intervalMinutes: 15,
    minAgeGuidance: 8,
    englishForm: "sung-through",
    englishNote:
      "ギリシャ神話のオルフェウスとエウリディケが原典で、筋の骨格は広く知られています。語り手が要所で状況を説明する構成のため、歌詞を追い切れなくても現在地を見失いにくくなっています。",
  },
  "moulin-rouge": {
    runtimeMinutes: 165,
    intervalMinutes: 20,
    minAgeGuidance: 12,
    englishForm: "balanced",
    englishNote:
      "既存のポップスを繋いで構成されており、聞き覚えのある曲が多く出てきます。映画版が日本でも知られており、筋を知ったうえで観れば英語の負担は下がります。",
  },
  cabaret: {
    runtimeMinutes: 165,
    intervalMinutes: 20,
    minAgeGuidance: 15,
    englishForm: "balanced",
    englishNote:
      "1930年代ベルリンが舞台で、時代背景を知っているかで受け取り方が変わります。歌と台詞が交互に来る構成ですが、politics に触れる台詞は聞き取れないと主題が伝わりにくい部分があります。",
  },
  "back-to-the-future": {
    runtimeMinutes: 155,
    intervalMinutes: 20,
    minAgeGuidance: 6,
    englishForm: "balanced",
    englishNote:
      "映画版が日本で広く知られており、筋を追う助けになります。舞台装置による車の演出など視覚的な見せ場が多い作品です。",
  },
  "mj-the-musical": {
    runtimeMinutes: 150,
    intervalMinutes: 20,
    minAgeGuidance: 8,
    englishForm: "balanced",
    englishNote:
      "マイケル・ジャクソンの既存曲で構成され、ダンスの比重が大きい作品です。曲を知っていれば歌詞は耳に入りやすく、振付そのものが見どころになります。",
  },
  "my-neighbour-totoro": {
    runtimeMinutes: 165,
    intervalMinutes: 20,
    minAgeGuidance: 6,
    englishForm: "non-verbal",
    englishNote:
      "原作のジブリ映画が日本では誰もが知る作品で、筋を完全に知ったうえで観ることになります。パペットと音楽による表現が中心で、英語の聞き取りが体験を左右しません。",
  },
  "the-devil-wears-prada": {
    runtimeMinutes: 150,
    intervalMinutes: 20,
    minAgeGuidance: 12,
    englishForm: "balanced",
    englishNote:
      "映画版と原作小説が日本でも知られています。ファッション業界を舞台にした早口のやりとりが持ち味で、その皮肉は聞き取れると格段に面白くなる部分です。",
  },
  oliver: {
    runtimeMinutes: 165,
    intervalMinutes: 20,
    minAgeGuidance: 6,
    englishForm: "balanced",
    englishNote:
      "ディケンズの『オリバー・ツイスト』が原作で、筋は広く知られています。19世紀ロンドンの下町言葉が使われる場面があり、そこは聞き取りにくく感じるかもしれません。",
  },
  "starlight-express": {
    runtimeMinutes: 135,
    intervalMinutes: 20,
    minAgeGuidance: 6,
    englishForm: "non-verbal",
    englishNote:
      "ローラースケートで滑走するレース場面が中心で、見せ場は速度と動きにあります。筋は単純で、英語の細部が分からなくても展開を追えます。",
  },
  "stranger-things": {
    runtimeMinutes: 170,
    intervalMinutes: 20,
    minAgeGuidance: 14,
    englishForm: "dialogue-heavy",
    englishNote:
      "Netflixドラマの前日譚で、シリーズを観ていることが前提に近い作品です。歌はなく筋は台詞で進みます。舞台上の特殊効果は見応えがありますが、人物の関係は台詞でしか説明されません。",
  },
  "witness-for-the-prosecution": {
    runtimeMinutes: 145,
    intervalMinutes: 20,
    minAgeGuidance: 12,
    englishForm: "dialogue-heavy",
    englishNote:
      "法廷劇で、証言のやりとりそのものが筋です。旧ロンドン市庁舎の議場を法廷に見立てた会場も含めて体験になりますが、英語で議論を追えないと結末の反転が効きません。",
  },
  "all-my-sons": {
    runtimeMinutes: 135,
    intervalMinutes: 20,
    minAgeGuidance: 12,
    englishForm: "dialogue-heavy",
    englishNote:
      "アーサー・ミラーの戯曲で、家族の会話だけで進みます。言い淀みや沈黙に意味が置かれる作品のため、英語での観劇に慣れている人向けです。",
  },
  "the-importance-of-being-earnest": {
    runtimeMinutes: 150,
    intervalMinutes: 20,
    minAgeGuidance: 12,
    englishForm: "dialogue-heavy",
    englishNote:
      "オスカー・ワイルドの喜劇で、面白さのほぼ全部が台詞の言葉遊びと逆説にあります。19世紀の言い回しも多く、英語での観劇経験がないと笑いどころを取りこぼします。",
  },
  "operation-mincemeat": {
    runtimeMinutes: 140,
    intervalMinutes: 20,
    minAgeGuidance: 12,
    englishForm: "balanced",
    englishNote:
      "第二次大戦中の英国の実在の作戦を題材にした風刺です。笑いが英国の階級や官僚制の文脈に依存し、早口の掛け合いも多いため、聞き取りの負荷は高い部類です。",
  },
  "titanique": {
    runtimeMinutes: 105,
    intervalMinutes: 0,
    minAgeGuidance: 15,
    englishForm: "balanced",
    englishNote:
      "映画『タイタニック』のパロディで、セリーヌ・ディオンの曲を使って進みます。元の映画を知っていることが笑いの前提です。ややきわどい表現が入ります。",
  },
  "magic-mike-live": {
    runtimeMinutes: 105,
    intervalMinutes: 15,
    minAgeGuidance: 18,
    englishForm: "non-verbal",
    englishNote:
      "ダンスとアクロバットのショーで、筋を追う種類の公演ではありません。英語の聞き取りは体験にほとんど影響しません。18歳未満は入場できません。",
  },
  "the-choir-of-man": {
    runtimeMinutes: 90,
    intervalMinutes: 0,
    minAgeGuidance: 12,
    englishForm: "non-verbal",
    englishNote:
      "パブを舞台にした音楽ショーで、物語よりも合唱と演奏が中心です。知られたポップスやフォークが多く、英語の細部が分からなくても楽しめます。",
  },
};

async function main() {
  const dry = process.argv.includes("--dry");

  const musicals = await prisma.musical.findMany({
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });
  const bySlug = new Set(musicals.map((m) => m.slug));

  // FACTS 側に DB に無い slug があれば教える(slug の綴り違いは
  // 黙って何も更新されないので気付きにくい)。
  const orphans = Object.keys(FACTS).filter((s) => !bySlug.has(s));
  if (orphans.length > 0) {
    console.log("DB に無い slug が FACTS にあります:");
    for (const s of orphans) console.log(`  - ${s}`);
    console.log("");
  }

  const missing = musicals.filter((m) => !FACTS[m.slug]);

  let updated = 0;
  for (const m of musicals) {
    const f = FACTS[m.slug];
    if (!f) continue;

    if (dry) {
      console.log(
        `${m.name} (${m.slug}): ${f.runtimeMinutes}分 / ${f.minAgeGuidance}歳〜 / ${f.englishForm}`,
      );
      continue;
    }

    await prisma.musical.update({
      where: { slug: m.slug },
      data: {
        runtimeMinutes: f.runtimeMinutes,
        intervalMinutes: f.intervalMinutes,
        minAgeGuidance: f.minAgeGuidance,
        englishForm: f.englishForm,
        englishNote: f.englishNote,
        factsVerifiedAt: new Date(),
      },
    });
    updated++;
  }

  if (missing.length > 0) {
    console.log(`\n未記入のまま残る作品(${missing.length}件):`);
    for (const m of missing) console.log(`  - ${m.slug} (${m.name})`);
  }

  console.log(
    dry
      ? `\n--dry: ${musicals.length - missing.length}件を更新対象として確認しました。`
      : `\n${updated}件を更新しました。`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

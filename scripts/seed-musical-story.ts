/**
 * あらすじ3層(storyHook / characters / storyEnding)を入れる。
 *
 * 既存の description は「物語の流れ」の層としてそのまま使うが、結末を
 * 含んだままの原稿は SCENES で上書きして結末を切り落とす。切り落とした
 * ぶんが storyEnding に入り、ページでは折りたたみの中にだけ出る。
 *
 * 書くときの約束:
 * - storyHook は地の文。箇条書きにしない。何が起きるかではなく、
 *   何に心を動かされる話なのかを書く。結末には触れない。
 * - characters は筋ではなく人物を説明する。「〜する人」ではなく
 *   「〜を抱えている人」。並び順は主人公から関係の遠い順。
 * - SCENES はクライマックスの手前で止める。結末は ENDING に置く。
 *
 * 実行:
 *   npx tsx scripts/seed-musical-story.ts --dry
 *   npx tsx scripts/seed-musical-story.ts
 *   npx tsx scripts/seed-musical-story.ts wicked
 */

import { PrismaClient } from "@prisma/client";
import type { MusicalCharacter } from "../components/musicals/story";

const prisma = new PrismaClient();

type Story = {
  storyHook: string;
  characters: MusicalCharacter[];
  /** description を差し替える原稿。結末を含まないところまで。 */
  scenes: string;
  storyEnding: string;
};

const STORIES: Record<string, Story> = {
  wicked: {
    storyHook: `オズの西に住んでいた「悪い魔女」。彼女が死んだ日、国じゅうが祝杯をあげた。ただひとり、南の善い魔女グリンダだけが言葉を選びながら民衆の前に立っている。**二人はかつて、同じ部屋で暮らした親友だった。**

生まれつき肌が緑だったというだけで、エルファバは父に疎まれ、行く先々で笑われて育った。金髪で人気者のガリンダとは、大学で相部屋になった瞬間から反発しあう。それでも二人は、互いのなかに相手が持っていないものを見つけてしまう。片方は正しさを、もう片方は愛されかたを知っていた。

この作品が問うのは、誰が悪者かではない。**誰が悪者ということにされたのか**、そしてそれを知っていた友人が何を選んだのか。『オズの魔法使い』でドロシーが水をかけたあの魔女に、こういう十六年があったのだと知ったあとでは、もう元の童話には戻れなくなる。`,
    characters: [
      {
        name: "エルファバ",
        role: "主人公",
        oneLiner:
          "緑の肌に生まれた少女。誰よりも強い魔力と正義感を持ちながら、それを使うほど世界から嫌われていく。",
      },
      {
        name: "グリンダ",
        role: "その親友",
        oneLiner:
          "愛されることに長けた人気者。友人を選ぶか、民衆に望まれた自分でいるかを迫られる。",
      },
      {
        name: "フィエロ",
        role: "二人が惹かれる王子",
        oneLiner:
          "何も考えずに生きてきた放蕩の王子。エルファバに出会って初めて、態度を決めることを覚える。",
      },
      {
        name: "ネッサローズ",
        role: "エルファバの妹",
        oneLiner:
          "父に溺愛されて育った車椅子の妹。姉の献身を当然のものとして受け取り、やがて姉を責める側に回る。",
      },
      {
        name: "マダム・モリブル",
        role: "シズ大学の学長",
        oneLiner:
          "エルファバの才能を見抜き、引き上げると見せて利用する。世論を作る術を知っている人物。",
      },
      {
        name: "オズの魔法使い",
        role: "国の頂点",
        oneLiner:
          "エメラルド・シティに君臨する偉大な魔法使い。会ってみると、驚くほど普通の男である。",
      },
    ],
    scenes: `## 第一幕：出会いと決別

### プロローグ — 魔女の死を祝う国
- オズ国民が「西の悪い魔女」の死を喜び祝う場面から物語は始まる。
- 南の善い魔女グリンダが民衆の前に降り立ち、魔女の生い立ちを語りはじめる。
- 魔女は母と見知らぬ男の情事から生まれ、父は全身緑色の娘を忌み嫌っていた。
- ここから、グリンダの回想としてすべてが語り直される。
(♪ 「No One Mourns the Wicked」)

### シズ大学 — 反発から始まる同居
- エルファバは妹ネッサローズと共にシズ大学へ入学し、妹の世話を任される。
- 初対面のガリンダ（後のグリンダ）と反発しあうが、手違いから同室になる。
- エルファバの魔術の才を見抜いたマダム・モリブルは、いずれ魔法使いの右腕になれると予言する。
- 二人は手紙で互いへの不満を吐露しあう。
(♪ 「Dear Old Shiz」, 「The Wizard and I」, 「What Is This Feeling?」)

### 動物たちが言葉を失っていく
- 唯一の動物教師ディラモンド教授の授業が、動物排斥団体によって中止される。
- エルファバは、オズで動物たちが言葉を奪われつつある現実を知る。
- 王子フィエロが登場し、無神経な振る舞いでエルファバを怒らせる。
(♪ 「Something Bad」, 「Dancing Through Life」)

### パーティ — 友情が芽生える夜
- ガリンダが悪意から贈った黒い三角帽子を、エルファバは本気で被って現れ、嘲笑の的になる。
- 一人で踊り続けるエルファバの隣に、ガリンダが並んで踊りはじめる。
- 罪悪感と親愛が入り混じったまま、二人は友人になる。
(♪ 「Popular」)

### エメラルド・シティ — 憧れが壊れる日
- エルファバとグリンダは念願の魔法使いへの謁見を果たす。
- しかし魔法使いの正体と、その真意を知ったエルファバは恐怖する。
- マダム・モリブルとの共謀を知り、協力を拒んで逃走する。
(♪ 「One Short Day」, 「A Sentimental Man」)

### 第一幕の幕切れ — 箒で宙を舞う
- 塔へ逃げたエルファバを衛兵が追う。
- グリンダは共に来るよう説得するが、エルファバは引き返さないことを選ぶ。
- 箒に乗って宙へ舞い上がり、魔法使いと戦う決意を告げる。
(♪ 「Defying Gravity」)

## 第二幕：悪い魔女にされていく

### 汚名を着せられて
- エルファバの失踪後、マダム・モリブルは彼女に「西の悪い魔女」の汚名を着せる。
- 同時にグリンダを「善い魔女」として祭り上げ、フィエロを親衛隊長に任命する。
- グリンダは民衆の期待に応えながら、友を思い出している。
(♪ 「Thank Goodness」)

### 妹とボック
- 総督となった妹ネッサローズは、姉を責める。
- エルファバは魔法で妹の銀の靴をルビーの靴に変え、歩けるようにする。
- しかし歩けるようになったことで、そばにいたボックは自分の存在意義を失う。
- 引き止めようとしたネッサローズの呪文が暴走し、ボックに危害を加えてしまう。
- エルファバは咄嗟の魔法でボックを救うが、彼は木こりの姿でしか生きられなくなる。
(♪ 「The Wicked Witch of the East」)

### 魔法使いとの対決、そして森へ
- 翼猿を解放するため宮廷へ戻ったエルファバに、魔法使いは和解を持ちかける。
- ディラモンド教授の変わり果てた姿を見て、エルファバは誘いを拒む。
- 駆けつけたフィエロが彼女を助け、二人は共に逃げる。
- 裏切られたと感じたグリンダは打ちのめされる。
(♪ 「Wonderful」, 「I'm Not That Girl (Reprise)」)

### 森 — 短い幸福
- 暗い森の中で、エルファバとフィエロは互いの想いを確かめあう。
- 妹の危機を察したエルファバが急行するが、既に手遅れだった。
- 現れたグリンダと口論になり、そこへ衛兵が迫る。
- フィエロは囮となってエルファバを逃がす。
(♪ 「As Long As You're Mine」)

### 二人の最後の対話
- 追い詰められたエルファバは、グリンダに魔法の書を託す。
- 互いを責めることをやめ、出会ってしまったことの意味を確かめあう。
- 二人は真の友情を誓い、そして別れる。
(♪ 「For Good」)`,
    storyEnding: `群衆が城に迫るなか、ドロシーがバケツの水を浴びせ、エルファバは溶けて姿を消す——ように見える。

だが実際には、エルファバは魔法で身を隠しただけで死んではいなかった。拷問を受け瀕死だったフィエロも、彼女の魔法によって脳のないカカシの姿で生き延びており、城で二人は再会する。

エルファバは、自分が生きていることをグリンダにさえ明かさないまま、フィエロと共にオズを去る。二度と戻らない約束で。

残されたグリンダは、魔法使いのもとへ向かう。そこで、オズ大王が口を滑らせた一言——エルファバの母の形見を「自分のものだ」と言ったこと——から、彼が**エルファバの父親その人**だったことを突き止める。グリンダは大王を気球に乗せてオズから追放し、マダム・モリブルを牢へ送る。

こうしてグリンダは、親友が死んだと信じたまま、その親友が正そうとした国を引き継ぐことになる。`,
  },
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
      console.log(
        `- ${musical.name}: hook ${story.storyHook.length}字 / ` +
          `人物 ${story.characters.length}人 / scenes ${story.scenes.length}字 / ` +
          `ending ${story.storyEnding.length}字`,
      );
      continue;
    }

    await prisma.musical.update({
      where: { id: musical.id },
      data: {
        storyHook: story.storyHook,
        characters: story.characters,
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

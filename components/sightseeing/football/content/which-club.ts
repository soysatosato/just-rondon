import {
  DIFFICULTY_LABELS,
  FOOTBALL_AS_OF,
  FOOTBALL_SOURCES,
  FOOTBALL_UPDATED_AT,
  LONDON_CLUBS,
  REALISTIC_CLUBS,
  SEASON,
  gbp,
} from "@/lib/football/clubs";
import type { FootballGuideArticle } from "../types";

const fulham = LONDON_CLUBS.find((c) => c.slug === "fulham")!;
const brentford = LONDON_CLUBS.find((c) => c.slug === "brentford")!;
const palace = LONDON_CLUBS.find((c) => c.slug === "crystal-palace")!;

const whichClub: FootballGuideArticle = {
  slug: "which-club",
  title: "ロンドンのどのクラブを観るか｜6クラブを取りやすさで比べる",
  engTitle: "Which London Club Should You Watch",
  summary: `${SEASON}シーズン、ロンドンには6つのプレミアリーグクラブがあります。有名なクラブほどチケットは取れません。初めてロンドンで試合を観るなら、選ぶべきクラブははっきりしています。`,
  description: `ロンドンのプレミアリーグ6クラブ（${LONDON_CLUBS.map((c) => c.name).join("・")}）を、チケットの取りやすさ・価格・スタジアムの魅力・アクセスで比較。旅行者が現実的に狙えるクラブを${FOOTBALL_AS_OF}時点の情報で解説します。`,
  keywords: [
    "ロンドン サッカークラブ",
    "プレミアリーグ ロンドン",
    "アーセナル チェルシー トッテナム 観戦",
    "ロンドン サッカー どこ",
    "プレミアリーグ 観戦 おすすめ",
  ],
  dataAsOf: FOOTBALL_AS_OF,
  updatedAt: FOOTBALL_UPDATED_AT,
  atAGlance: [
    {
      label: "クラブ数",
      value: `${SEASON}シーズンは6クラブ。ウェストハムは降格しました`,
    },
    {
      label: "初めてなら",
      value: `${REALISTIC_CLUBS.map((c) => c.name).join("・")}。会員になれば現実的に取れます`,
    },
    {
      label: "最も取りにくい",
      value: "アーセナル。一般販売は事実上存在しません",
    },
    {
      label: "雰囲気が最高",
      value: `${palace.name}（${palace.stadiumJa}）。リーグ屈指と評されます`,
    },
    {
      label: "建物が面白い",
      value: `${fulham.name}（${fulham.stadiumJa}）。英国最古級で観光地でもあります`,
    },
    {
      label: "設備が最新",
      value: "トッテナム。2019年開業、収容62,850人はロンドン最大です",
    },
  ],
  mainText: `「ロンドンでプレミアリーグを観たい」と考えたとき、多くの人がまずアーセナルかチェルシーを思い浮かべます。そして**その2つが、最も取りにくい**クラブです。

${SEASON}シーズン、ロンドンには**${LONDON_CLUBS.length}つ**のプレミアリーグクラブがあります。

${LONDON_CLUBS.map((c) => `- **${c.name}**（${c.stadiumJa}・${c.capacity.toLocaleString()}人）`).join("\n")}

このうち、旅行者が現実的にチケットを取れるのは**下の3クラブ**です。そして重要なことに、**観戦体験の質は、クラブの知名度と比例しません**。

むしろピッチが近く、地元の空気が濃く、そして——**強豪が対戦相手としてやってくる**。フラムのホームゲームには、リバプールもマンチェスター・シティも来ます。同じ選手を、半額以下で観られるのです。

この記事は、6クラブを「取りやすさ」「スタジアムの魅力」「アクセス」で比較します。`,
  sections: [
    {
      id: "comparison",
      title: "6クラブ一覧",
      body: `| クラブ | 収容 | 価格帯 | 取りやすさ | 最寄り駅 |
|---|---:|---:|---|---|
${LONDON_CLUBS.map(
  (c) =>
    `| **${c.name}** | ${c.capacity.toLocaleString()} | ${gbp(c.ticketLow)}〜${gbp(c.ticketHigh)} | ${DIFFICULTY_LABELS[c.difficulty]} | ${c.nearestStation}（徒歩${c.walkMinutes}分） |`
).join("\n")}

**「取りやすさ」がこの表で最も重要な列**です。価格や収容人数は参考情報にすぎません。席が取れなければ、他の条件は意味を持ちません。

### ウェストハムは今シーズン、プレミアリーグにいません

ロンドン・スタジアム（旧オリンピックスタジアム）を本拠地とするウェストハム・ユナイテッドは、前シーズンに降格しました。**${SEASON}シーズン、ロンドン・スタジアムでプレミアリーグの試合は開催されません**。

日本語の観戦情報にはウェストハムを含むものが残っていますが、今季は2部（Championship）の試合になります。ただし**2部の試合はチケットが取りやすく、価格も安い**ので、それはそれで有力な選択肢です。[下部リーグと女子サッカー](/sightseeing/football/lower-leagues)を参照してください。`,
      callout: {
        tone: "warn",
        title: "昇降格でクラブの顔ぶれは毎年変わります",
        body: `プレミアリーグは毎シーズン、下位3クラブが2部に降格し、2部から3クラブが昇格します。**ロンドンのクラブ数も年によって変わります**（${SEASON}シーズンは6クラブ）。数年前の記事を参考にすると、すでに降格したクラブの情報を読むことになるので、必ず今季の所属を確認してください。`,
      },
    },
    {
      id: "recommended",
      title: "初めてなら、この3クラブ",
      subtitle: "会員になれば現実的に取れます",
      body: `${REALISTIC_CLUBS.map(
    (c) => `### ${c.name}｜${c.stadiumJa}

${c.character}

**チケット**：${c.availability}

| 項目 | 内容 |
|---|---|
| 収容 | ${c.capacity.toLocaleString()}人 |
| 価格 | ${gbp(c.ticketLow)}〜${gbp(c.ticketHigh)} |
| 会員費 | ${c.membershipFrom ? `年 ${gbp(c.membershipFrom)}〜` : "—"} |
| 行き方 | ${c.nearestStation}駅（${c.line}）から徒歩約${c.walkMinutes}分 |
`
  ).join("\n---\n\n")}

### この3つをどう選ぶか

- **雰囲気を最優先するなら ${palace.name}**。ホルムズデール・エンドの応援はプレミアリーグ屈指と評されます。ただし中心部からは最も遠い部類です
- **観光も兼ねるなら ${fulham.name}**。テムズ川沿いの${fulham.stadiumJa}は英国最古級で、木造の Grade II 指定建築が現役で使われています。試合がなくても見に行く価値がある建物です
- **手軽さなら ${brentford.name}**。2020年開業の新しいスタジアムで、収容${brentford.capacity.toLocaleString()}人とコンパクト。どの席からもピッチが近く見えます`,
      tips: [
        "3クラブとも、強豪との対戦(Category A)だけは取りにくい。中位・下位との対戦を狙う",
        "パレスは鉄道でロンドン・ブリッジから20分ほど。地下鉄ではないので路線図に載っていない",
        "クレイヴン・コテージはテムズ川沿いを歩いて行くと気持ちがいい。パトニー・ブリッジ駅から川沿いのルートがある",
      ],
      callout: {
        tone: "tip",
        title: "「弱いクラブのホームに強豪が来る日」を狙う",
        body: `スター選手を観たいなら、強豪のホームゲームではなく**その強豪がアウェイで来る試合**を狙うという発想があります。${fulham.name}のホームにマンチェスター・シティが来れば、同じ選手を安く観られます。ただしその試合はそのクラブにとって Category A なので、比較的取りにくくなる点は覚悟してください。`,
      },
    },
    {
      id: "big-three",
      title: "アーセナル・チェルシー・トッテナムを狙う場合",
      body: `知名度の高い3クラブは、いずれも入手難易度が高いです。それでも狙うなら、戦略が要ります。

${LONDON_CLUBS.filter((c) => c.difficulty === "very-hard" || c.difficulty === "hard")
  .map(
    (c) => `### ${c.name}｜${c.stadiumJa}

${c.character}

**チケット**：${c.availability}

| 項目 | 内容 |
|---|---|
| 収容 | ${c.capacity.toLocaleString()}人 |
| 価格 | ${gbp(c.ticketLow)}〜${gbp(c.ticketHigh)} |
| 会員費 | ${c.membershipFrom ? `年 ${gbp(c.membershipFrom)}〜` : "—"} |
| 行き方 | ${c.nearestStation}駅（${c.line}）から徒歩約${c.walkMinutes}分 |
`
  )
  .join("\n---\n\n")}

### 現実的な攻め方

1. **会員になる**（必須。これなしでは土俵に上がれません）
2. **Category C の試合だけを狙う**（中位・下位クラブとの対戦）
3. **公式リセールを毎日張る**（試合3〜5日前がピーク）
4. **ホスピタリティを検討する**（${gbp(400)}〜。ただし確実）

**平日夜の試合**が最も狙い目です。地元の勤め人が来にくく、リセールにも出やすくなります。

### トッテナムが比較的マシな理由

トッテナムの${LONDON_CLUBS.find((c) => c.slug === "tottenham")!.stadiumJa}は**収容62,850人とロンドン最大**です。単純に席数が多い分、アーセナルよりは可能性があります。2019年開業でスタジアムの設備自体も欧州最高水準なので、「大箱の最新スタジアムを体験する」という目的なら第一候補になります。`,
    },
    {
      id: "how-to-choose",
      title: "結局どう選ぶか",
      body: `目的別に整理します。

| あなたの目的 | 選ぶべきクラブ |
|---|---|
| **とにかく試合を観たい** | ${REALISTIC_CLUBS.map((c) => c.name).join("・")} |
| **雰囲気と応援を体験したい** | ${palace.name} |
| **建物・歴史を味わいたい** | ${fulham.name} |
| **最新の巨大スタジアム** | トッテナム |
| **中心部から楽に行きたい** | チェルシー（駅から徒歩5分） |
| **スター選手を観たい** | 取りやすいクラブの、強豪戦 |
| **特定のクラブのファン** | そのクラブ一択。会員になって粘る |

### 「どこでもいいから観たい」が最も賢い

こだわりのない旅行者にとって、**クラブを限定しないことが最大の武器**です。

滞在期間中にロンドンで開催される全試合をリストアップし、取りやすいクラブから順に当たっていけば、**1週間の滞在ならかなりの確率でどこかは取れます**。

逆に「アーセナルでなければ意味がない」と決めてしまうと、成功率は一気に下がります。

### 順位や強さで選ばないこと

「強いクラブのほうが良い試合が観られる」というのは、スタジアム観戦においてはあまり当たりません。**スタジアムでの体験を決めるのは、試合の質より場の空気**です。

小さなスタジアムで、地元の人たちが本気で一喜一憂している中に混ざるほうが、記憶に残ります。`,
      callout: {
        tone: "tip",
        title: "6クラブすべてが「本物のプレミアリーグ」です",
        body: "どのクラブを選んでも、世界最高峰のリーグの試合であることに変わりはありません。相手として来るのはリバプールでありマンチェスター・シティです。**知名度で選ぶより、確実に席が取れるほうを選んでください**。",
      },
    },
  ],
  faq: [
    {
      question: "ロンドンにはプレミアリーグのクラブがいくつありますか？",
      answer: `${SEASON}シーズンは**6クラブ**です（${LONDON_CLUBS.map((c) => c.name).join("、")}）。なお**ウェストハム・ユナイテッドは前シーズンに降格**したため、今季ロンドン・スタジアムでプレミアリーグの試合は開催されません。昇降格でクラブ数は毎年変わります。`,
    },
    {
      question: "初めてなら、どのクラブがおすすめですか？",
      answer: `**${REALISTIC_CLUBS.map((c) => c.name).join("・")}**のいずれかです。会員になれば現実的にチケットが取れ、価格も ${gbp(30)}〜${gbp(75)} に収まります。雰囲気なら${palace.name}、建物の面白さなら${fulham.name}、手軽さなら${brentford.name}が向いています。`,
    },
    {
      question: "アーセナルやチェルシーの試合は本当に取れませんか？",
      answer:
        "**取れないわけではありませんが、準備が要ります**。会員になったうえで、Category C（中位・下位クラブとの対戦）を狙い、公式リセールを毎日確認する——これで可能性が出てきます。日程が動かせないなら、ホスピタリティ（£400〜）が確実です。一般販売を待つ戦略は成立しません。",
    },
    {
      question: "有名クラブでないと、つまらないのでは？",
      answer:
        "**逆のことが起きることが多いです**。小さいスタジアムほどピッチが近く、地元サポーターの熱量を直接感じられます。しかも相手として来るのはリバプールやマンチェスター・シティです。同じ選手を、半額以下で、より近い距離から観られます。スタジアム体験の質は、クラブの知名度とは比例しません。",
    },
    {
      question: "どのスタジアムが最も雰囲気がいいですか？",
      answer: `**${palace.name}の${palace.stadiumJa}**が、プレミアリーグ屈指と評されることが多いです。特にゴール裏の Holmesdale End の応援は圧巻です。収容${palace.capacity.toLocaleString()}人と小さめで、音が反響しやすい構造も効いています。中心部からは鉄道で20分ほどかかります。`,
    },
  ],
  sources: [...FOOTBALL_SOURCES],
  relatedLinks: [
    {
      href: "/sightseeing/football/tickets",
      label: "チケットの取り方のすべて",
    },
    {
      href: "/sightseeing/football/stadiums",
      label: "6つのスタジアム徹底比較",
    },
    {
      href: "/sightseeing/football/lower-leagues",
      label: "下部リーグと女子サッカー",
    },
  ],
};

export default whichClub;

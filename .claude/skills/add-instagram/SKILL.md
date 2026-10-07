---
name: add-instagram
description: just-rondon(イギリス旅行サイト)の公式Instagram用に、公開済みのコラム・イギリス英語の記事からカルーセル投稿(5枚組)の原稿を作り、DBに下書きとして追加する。画像は原稿から自動で描かれ、運営者が /admin/instagram で確認・承認して、5枚を保存し Instagram アプリの予約投稿に入れる(投稿自体は自動化していない)。「インスタの投稿を作って」「カルーセルを作って」「/add-instagram」で起動する。
---

# /add-instagram — Instagram のカルーセル原稿を作る

公開済みの記事1本から、5枚組のカルーセル(1 表紙 / 2〜4 要点 / 5 締め)の
原稿とキャプションを書き、`InstagramPost` に下書き(`status: "draft"`)で入れる。
git の commit/push はしない。

画像は原稿から `/og/instagram/<id>/<n>` が毎回描く(`components/og/IgSlide.tsx`)。
運営者は `/admin/instagram` で5枚を見て承認し、枠(日本時間21:00、月・水・金・日)が
決まったら、5枚を保存して Instagram アプリの予約投稿に入れる。

`$ARGUMENTS` に本数や記事の指定があれば従う。無ければ**4本(1週間ぶん)**作り、
**コラム3本+イギリス英語1本**にする。

## Step 1 — 予約の残りと、作った記事を確かめる

```bash
npx tsx -e '
import db from "./utils/db";
(async () => {
  const rows = await db.instagramPost.findMany({
    where: { status: { not: "rejected" } },
    orderBy: [{ scheduledAt: "asc" }, { createdAt: "asc" }],
    select: { status: true, scheduledAt: true, coverHead: true, content: { select: { category: true, slug: true } } },
  });
  for (const r of rows) console.log(r.status.padEnd(8), r.scheduledAt?.toISOString().slice(0, 10) ?? "----------", r.content.category, r.content.slug, "|", r.coverHead);
  await db.$disconnect();
})();
'
```

既に投稿がある記事は選ばない(登録スクリプトも弾く)。承認待ちの下書きが
たくさん残っているなら、増やす前にユーザーに伝える。

## Step 2 — 記事を選ぶ

候補は「公開済みで、まだ投稿の無い記事」:

```bash
npx tsx -e '
import db from "./utils/db";
(async () => {
  const rows = await db.content.findMany({
    where: {
      category: { in: ["column", "british-english"] },
      publishedAt: { lte: new Date() },
      instagramPosts: { none: { status: { not: "rejected" } } },
    },
    orderBy: { views: "desc" },
    select: { category: true, slug: true, title: true, engTitle: true, views: true, seriesName: true, seriesOrder: true, image: true },
  });
  for (const r of rows) console.log(r.views, r.category, r.slug, "|", r.engTitle ?? "", r.title, r.seriesName ? `[${r.seriesName} ${r.seriesOrder}]` : "", r.image ? "" : "(写真なし)");
  await db.$disconnect();
})();
'
```

選び方(上ほど優先):

1. **投稿日の2〜3週間以内に、その話題の日付がある記事**。ガイ・フォークス(11/5)、
   戦没者追悼(11/11)、クリスマス、ボクシング・デーなど。季節の話題は前もって出す。
2. **見出しに落差がある記事**(「実は〇〇だった」「〇〇は△△で決まった」)。表紙で
   止まるかどうかは見出しで決まる。閲覧数(views)の多い記事はその実績がある。
3. **連載は第1回だけ**。第2回以降は前の回を読んでいないと分からない。
4. 同じ週に同じ題材(王室ばかり、など)を並べない。

コラムは表紙に記事の写真をそのまま全面で使う(4:5に切り抜かれる)。写真が
無いコラムは選ばない。

## Step 3 — 記事を最後まで読む

```bash
npx tsx -e '
import db from "./utils/db";
(async () => {
  const [category, slug] = process.argv.slice(1);
  const c = await db.content.findFirst({ where: { category, slug }, include: { sections: { orderBy: { displayOrder: "asc" } } } });
  if (!c) { console.log("not found"); return; }
  console.log(c.engTitle ?? "", c.title, "\n\n", c.summary, "\n\n", c.mainText);
  for (const s of c.sections) console.log("\n##", s.title, s.subtitle ?? "", "\n", s.description, s.description2 ?? "", s.description3 ?? "");
  await db.$disconnect();
})();
' <category> <slug>
```

## Step 4 — 原稿を書く

**記事に書いてあることだけで書く。**事実・数字・年号を足さない、変えない。
記事は書いたときに裏を取ってあり、カルーセルで新しい事実を出すと、
誰も確かめていない文が画像として残る。言い換えて縮めるのはよい。

### 文字数の上限(`lib/instagram/limits.ts`。超えると登録で弾かれる)

| 欄 | 上限 | 中身 |
|---|---|---|
| `coverHead` | 30字 | 表紙の見出し。いちばん大きく出る |
| `coverTail` | 40字 | 表紙の副題(任意) |
| `points[].label` | 8字 | 要点の大きな札。年号「1340」、数字「600万語に1回」、短い語「直訳」 |
| `points[].title` | 22字 | 要点の見出し(2行まで) |
| `points[].body` | 100字 | 要点の本文(5行まで) |
| `closingTitle` | 22字 | 締めの見出し |
| `closingBody` | 80字 | 締めの本文 |
| `caption` | 500字 | キャプション本文 |
| `hashtags` | 5個 | `#` を付けずに書く。Instagram の上限が5個 |

画像に入る欄(caption と hashtags 以外)には**絵文字とマークダウンの記号を
使わない**。画像のフォントに絵文字が無く豆腐になり、`**` はそのまま出る。

### 1枚目 — 表紙

- **コラム**: 記事の見出し「つかみ——何の話か」の、つかみを `coverHead` に、
  何の話かを `coverTail` に。30字に収まらなければ縮める。写真の上に白で重なる。
- **イギリス英語**: 表紙には英語の表現(記事の `engTitle`)が大きく出る。
  `coverHead` はその下に置く日本語で、「〜と言われたら身構えろ」のように
  英語と続けて読める形にする。英語を `coverHead` に繰り返さない。

### 2〜4枚目 — 要点3つ

記事を「3つの場面」か「3つの事実」に縮める。コラムなら発端・転機・山場、
イギリス英語なら直訳・本当の意味・使い方(または意外な事実)が基本の形。

- **札(label)は大きく出るので、目で拾える短いものにする**。年号・数字が
  最も強い。無ければ2〜4字の語。
- 1枚で完結させる。「前の枚を見ていないと分からない」本文にしない
  (スワイプの途中から見る人もいる)。
- 本文は記事の文を写さず、1枚1つの驚きに絞って書き直す。

### 5枚目 — 締め

いまどうなっているか、行くならどうするか、オチ、のどれか。
「いかがでしたか」「まとめ」のような常套句は書かない。記事への誘導
(「記事の全文はプロフィールのリンクから」)は版面が自動で足すので書かない。

### キャプション

- 1行目で何の話か分かるようにする(フィードでは最初の1〜2行しか見えない)。
- 2〜4文。URL は書かない(押せない)。絵文字は使っても1つまで。
- 誘導の一文・表紙の画像クレジット・ハッシュタグは表示時に自動で足すので、
  **本文に書かない**。

### ハッシュタグ(5個まで)

`ロンドン` か `イギリス` を必ず1つ入れ、残りは題材(`ロンドン塔`、`世界史`、
`イギリス英語`、`英語学習` など)。人気だけで関係の薄いタグは付けない。

## Step 5 — 登録する

スクラッチパッドに配列の JSON を書き、まず `--dry` で検査する:

```json
[
  {
    "category": "column",
    "slug": "why-not-even-a-nazi-bomb-could-stop-the-tower-of-londons-ceremony-of-the-keys",
    "coverHead": "ロンドン塔「鍵の儀式」700年",
    "coverTail": "ナチスの爆撃でも、7分間だけは止まらなかった",
    "points": [
      { "label": "1340", "title": "王が無防備な城に入れた夜", "body": "…" },
      { "label": "1826", "title": "「日没」をやめて時刻を固定", "body": "…" },
      { "label": "1940", "title": "爆風に倒れても続けた", "body": "…" }
    ],
    "closingTitle": "いまも毎晩、7分間だけ",
    "closingBody": "…",
    "caption": "…",
    "hashtags": ["ロンドン", "イギリス", "ロンドン塔", "世界史", "雑学"]
  }
]
```

```bash
npx tsx scripts/create-instagram-posts.ts <JSONのパス> --dry
npx tsx scripts/create-instagram-posts.ts <JSONのパス>
```

1件でも問題があると1件も入らない。出た指摘を直して流し直す。

## Step 6 — 完了報告

git の操作はしない。次を報告する:

- 作った本数と、各投稿の記事・表紙の見出し
- 季節の話題があるものは、いつまでに出すべきか
- `/admin/instagram` で5枚を見て承認すること(承認した順に枠が埋まる)

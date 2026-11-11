---
name: add-instagram-reel
description: just-rondon(イギリス旅行サイト)の公式Instagram用に、コラム・イギリス英語の記事(公開前の新しい記事も可)からリール動画(MP4、1080x1920、40秒前後)を作る。原稿を書いてDBに下書きで入れ、Remotion で動画・表紙・キャプションを書き出す。運営者が /admin/instagram で承認し、MP4 を Instagram アプリの予約投稿に入れる(投稿自体は自動化していない)。「リールを作って」「インスタの動画を作って」「/add-instagram-reel」で起動する。
---

# /add-instagram-reel — Instagram のリール動画を作る

記事1本から5場面(1 表紙 / 2〜4 要点 / 5 締め)のリールの原稿を書き、
`InstagramPost` に下書き(`status: "draft"`)で入れ、`scripts/render-instagram-reel.ts`
で MP4 を書き出す。git の commit/push はしない。

原稿の形はカルーセル(`/add-instagram`)と同じで、本文の上限だけが短い。
動画は `video/IgReel.tsx`(Remotion)が描く。表紙は1コマ目から完成した絵で出て、
要点は札が弾んで出たあと見出しと本文が1字ずつ現れ、締めのあとに
「プロフィールのリンクから」の枠が出る。音は入れない。

公開前の記事(下書き・予約中)からも作れる。新しい記事を出すのに合わせて
作るため。投稿の枠は、記事が画面に出たあと(公開の1時間後以降)にしか
入らない(`lib/instagram/schedule.ts` の `igEarliestPostTime`)。

`$ARGUMENTS` に記事の指定(slug・URL・タイトル)があれば従う。無ければ、
直近に作った記事のうち投稿の無いものから**1本**作る。

## Step 1 — 記事を決める

```bash
npx tsx -e '
import db from "./utils/db";
(async () => {
  const rows = await db.content.findMany({
    where: {
      category: { in: ["column", "british-english"] },
      instagramPosts: { none: { status: { not: "rejected" } } },
    },
    orderBy: [{ publishedAt: { sort: "desc", nulls: "first" } }, { createdAt: "desc" }],
    take: 12,
    select: { category: true, slug: true, title: true, engTitle: true, publishedAt: true, image: true, seriesName: true, seriesOrder: true },
  });
  for (const r of rows) console.log(r.publishedAt?.toISOString().slice(0, 16) ?? "DRAFT", r.category, r.slug, "|", r.engTitle ?? "", r.title, r.seriesName ? `[${r.seriesName} ${r.seriesOrder}]` : "", r.image ? "" : "(写真なし)");
  await db.$disconnect();
})();
'
```

指定が無ければ、いちばん新しい記事にする。ただし次は飛ばす:

- **連載の第2回以降**。前の回を読んでいないと分からない。第1回で作る。
- **写真の無いコラム**。表紙が無地になる(登録で弾かれる)。
- 直前のリールと同じ題材(王室が続く、など)。

## Step 2 — 記事を最後まで読む

```bash
npx tsx -e '
import db from "./utils/db";
(async () => {
  const [category, slug] = process.argv.slice(1);
  const c = await db.content.findFirst({ where: { category, slug }, include: { sections: { orderBy: { displayOrder: "asc" } } } });
  if (!c) { console.log("not found"); return; }
  console.log(c.engTitle ?? "", c.title, "\n\n", c.summary, "\n\n", c.mainText);
  for (const s of c.sections) console.log("\n##", s.title, s.subtitle ?? "", "\n", s.description, s.description2 ?? "", s.description3 ?? "");
  console.log("\nIMAGE:", c.image, "|", c.imageCredit);
  await db.$disconnect();
})();
' <category> <slug>
```

## Step 3 — 原稿を書く

**記事に書いてあることだけで書く。**事実・数字・年号を足さない、変えない。
言い換えて縮めるのはよい。記事が「〜とされる」「〜とみられる」と書いている
ことは、原稿でも言い切らない。

### 字数(超えると登録・書き出しで弾かれる)

| 欄 | 上限 | 目安 | 中身 |
|---|---|---|---|
| `coverHead` | 30字 | 15字前後 | 表紙の見出し。いちばん大きく出る |
| `coverTail` | 40字 | 25字前後 | 表紙の副題(任意) |
| `points[].label` | 8字 | | 要点の大きな札。年号「1925」、短い語「意味」「gob = 口」 |
| `points[].title` | 22字 | 12字前後 | 要点の見出し |
| `points[].body` | **60字** | **40字前後** | 要点の本文 |
| `closingTitle` | 22字 | | 締めの見出し |
| `closingBody` | **60字** | **40字前後** | 締めの本文 |
| `caption` | 500字 | | キャプション本文 |
| `hashtags` | 5個 | | `#` を付けずに書く |

上限は `lib/instagram/limits.ts`(`IG_LIMITS` と、リール用に短くした
`IG_REEL_LIMITS`)。画像に入る欄には**絵文字とマークダウンの記号を使わない**
(フォントに絵文字が無く、`**` はそのまま出る)。

### 尺

場面の長さは字数で自動で決まる(`video/timing.ts`。1秒9字で読ませ、表紙は
5.5秒まで)。本文を40字前後にすると全体で35秒前後、上限いっぱいで40秒前後。
**45秒を超えたら本文を削る。**短い動画ほど最後まで見られる。

### 1場面目 — 表紙(つかみ)

表紙は動画の1コマ目から完成した絵で出る。サムネイルにもなり、ここで指が
止まらなければ先は見られない。**冒頭1秒で何の話か分かる言葉**にする。

- **コラム**: 記事の写真が全面に敷かれ、下に白で見出しが重なる。`coverHead` は
  落差のある短い言い切り(「007の名前は、鳥の図鑑から」)。15字前後までなら
  大きく出る。`coverTail` は続きを見たくなる一言で、答えを言い切らない。
- **イギリス英語**: 英語の表現(記事の `engTitle`)が大きく出る。`coverHead` は
  その下の日本語で、英語と続けて読める形(「口がふさがらないほどの驚き」)。
  英語を `coverHead` に繰り返さない。

### 2〜4場面目 — 要点3つ

カルーセルと同じく、記事を「3つの場面」か「3つの事実」に縮める。コラムなら
発端・転機・山場、イギリス英語なら意味・語源・最古の記録(または使い方)。

- **札(label)は年号・数字が最も強い**。無ければ2〜4字の語。
- 1場面で完結させる。前の場面を見ていないと分からない本文にしない。
- 本文は1場面1つの驚きに絞る。動画は読み返せないので、カルーセルより短く。

### 5場面目 — 締め

いまどうなっているか、オチ、意外な後日談のどれか。「いかがでしたか」
「まとめ」は書かない。記事への誘導の枠は動画が自動で足すので書かない。

### 折り返し

改行は文節単位で自動で入る(Chrome の `word-break: auto-phrase`)。手で改行を
入れない。「スーザン・ボイル」のような中黒入りの名前は「・」で折れることがある。

### キャプションとハッシュタグ

`/add-instagram` と同じ。1行目で何の話か分かるようにし、2〜4文。URL は書かない。
誘導の一文・表紙の画像クレジット・ハッシュタグは自動で足すので本文に書かない。
タグは `ロンドン` か `イギリス` を必ず1つ入れ、残りは題材。

## Step 4 — 検査して、静止画で確かめる

スクラッチパッドに配列の JSON を書く(形は `/add-instagram` と同じ)。

```bash
npx tsx scripts/create-instagram-posts.ts <JSONのパス> --dry --reel
npx tsx scripts/render-instagram-reel.ts <JSONのパス> --stills
```

`--stills` は動画を書かず、表紙と確認用の静止画だけを描く(1分ほど)。
**Read で次の6枚を必ず見る**:

- `instagram-reels/reel-<slug>-cover.jpg`(表紙。原寸)
- `instagram-reels/reel-<slug>-check/1-cover.jpg` 〜 `5-closing.jpg`(各場面の文字が出揃ったところ。半分の大きさ)

見るところ:

1. 文字のはみ出し・重なり。下の帯(サイト名)や締めの誘導の枠に本文が届いていないか
2. 豆腐(□)や、太さの違う代わりのフォントが混じっていないか
3. 語の途中で折れていないか、1行目と2行目の釣り合い
4. **コラムの表紙の写真**: 主題(人物の顔、建物)が切れていないか。見出しの裏が
   明るすぎて白い文字が読めなくないか。読めなければ記事の写真の問題なので、
   ユーザーに伝える(このスキルでは写真を差し替えない)
5. 写真のクレジットが表紙の下に出ているか(CC BY / BY-SA の写真は必須)
6. 書き出しの最初に出る尺(秒)。45秒を超えていないか

直したら `--stills` で描き直して、もう一度見る。

## Step 5 — 登録して、動画を書き出す

```bash
npx tsx scripts/create-instagram-posts.ts <JSONのパス> --reel
npx tsx scripts/render-instagram-reel.ts <JSONのパス>
```

登録は1件でも問題があると1件も入らない。書き出しは1本2〜3分。初回だけ描画用の
Chrome(約100MB)を取ってくる。出力は `instagram-reels/`(コミットしない):

- `reel-<slug>.mp4` — 投稿する動画(1080x1920・30fps・H.264、無音の音声トラック入り)
- `reel-<slug>-cover.jpg` — 表紙(アプリで「カメラロールから追加」に使う)
- `reel-<slug>-caption.txt` — キャプション(誘導・クレジット・タグ込み)

### 登録したあとで原稿を直すとき

JSON を直し、`render-instagram-reel.ts <JSON> --stills` で検査と確認をしてから、
DB の投稿を書き換えて、投稿の id から書き出し直す:

```bash
npx tsx -e '
import db from "./utils/db";
import { readFileSync } from "node:fs";
(async () => {
  const [id, file] = process.argv.slice(1);
  const p = JSON.parse(readFileSync(file, "utf-8"))[0];
  await db.instagramPost.update({
    where: { id },
    data: { coverHead: p.coverHead, coverTail: p.coverTail ?? null, points: p.points, closingTitle: p.closingTitle, closingBody: p.closingBody, caption: p.caption, hashtags: p.hashtags },
  });
  console.log("updated", id);
  await db.$disconnect();
})();
' <投稿のid> <JSONのパス>
npx tsx scripts/render-instagram-reel.ts --post <投稿のid>
```

アプリの予約に入れたあと(`queued`)に直したときは、アプリ側の予約も
入れ直してもらう。

## Step 6 — 完了報告

git の操作はしない。次を報告する:

- 記事と、表紙の見出し・尺(秒)
- 動画・表紙・キャプションのファイルの**絶対パス**
- キャプションの全文(そのまま貼れるように)
- 記事の公開日時と、投稿できる最も早い時刻(記事が下書きなら「記事の承認が先」)
- 運営者の手順:
  1. `/admin/instagram` で承認する(記事が下書きなら、先に `/admin/reading` で記事を承認)。枠(日本時間21:00)が入る
  2. MP4 と表紙の JPG をスマホへ送る(AirDrop など)
  3. Instagram アプリで「リール」→ 動画を選ぶ → 曲を付けるならここで(商用で使える曲だけ) → カバーを「カメラロールから追加」で表紙の JPG に → キャプションを貼る → 詳細設定で枠の日時に予約
  4. `/admin/instagram` で「アプリの予約に入れた」を押す(押すと `/ig` に記事が並ぶ)
- 管理ページの「5枚を保存」「リール用を保存」はカルーセル用の静止画。リールでは使わない(キャプションのコピーは使える)

## 決めごと

- ナレーション(AI音声)は入れない。リアルな合成音声を入れると Instagram の
  「AI情報」ラベルが必要になる。文字と、アプリで付ける曲だけで見せる。
- 動画に記事に無い写真・映像・地図を足さない。写真は記事の写真(表紙)だけ。
- Remotion は個人と3人以下の会社なら無料(https://remotion.dev/license)。
  運営が4人以上の組織になったら有償ライセンスが要る。

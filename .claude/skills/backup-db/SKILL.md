---
name: backup-db
description: just-rondon の本番DBを丸ごとローカルにバックアップする。全テーブルをgzip圧縮したJSONで世代保存し、前回との件数差分を表示する。件数が激減していたら「DBが壊れている」とみなして自動で中止し、正常なバックアップを守る。コラムなど本文がDBにしか無いコンテンツを追加したあとは必ず実行する。「バックアップを取って」「/backup-db」で起動する。復元は scripts/restore-db.ts。
---

# /backup-db — 本番DBをバックアップする

`.env` の `DATABASE_URL` が指すDBの全テーブルを読み出し、
`~/Desktop/just-rondon-backups/` に世代保存する。

## なぜこれがあるか

2026-08-23、本番DBのコンテンツが全て失われた。復旧できたのは
Supabase の日次バックアップに間に合ったからで、間に合わなければ
**コラム29本・本文18万字が永久に失われていた**。

そのとき生き残ったものと失われかけたものを分けたのは、一点だけだった:

- **git にもあったもの**(seed スクリプト、観光の本文、ブランド19件)は無傷
- **DBにしか無かったもの**(コラム、british-english、modern-britain、週次)は
  git 全履歴を検索しても0件、Wayback Machine にも無し

`/add-column` などのスキルは本文をその場で生成してDBに直接書き込み、
ファイルに残さない。だから「書いた瞬間からDBが唯一の原本」になる。
その状態を放置しないための道具。

関連: [[db-content-lives-only-in-db]]

## 実行

```bash
npx tsx scripts/backup-db.ts
```

`package.json` に登録済みなので `npm run backup-db` でもよい。

| オプション | 用途 |
|---|---|
| （なし） | 通常のバックアップ |
| `--force` | 件数激減の警告を無視して実行する |
| `--verify` | 最新バックアップが壊れていないかだけ確認する |

## いつ実行するか

- **コラム・british-english・modern-britain・週次ダイジェストを追加した直後**（必須）
- DBを触る作業（マイグレーション、seed の流し直し、データ移行）の**前**
- 大きな変更をする前に、念のため

## 中止されたときの読み方

こう出たら、**それは正常な動作**である。

```
⚠ 件数が異常です。バックアップを中止しました。
   Content: 146 → 0 (全消失)
```

これは「DBが壊れているかもしれないので、正常なバックアップを上書きしない」
という意味。**ここで `--force` を反射的に付けてはいけない。**
空のDBを繰り返しバックアップして正常な世代を押し出す、というのが
このスクリプトが防いでいる最悪の筋書きそのものだから。

まずDBを見る。本当に消えていたら Supabase の日次バックアップから復元する
（Pro プランが必要。Free では復元できない）。
意図した削除だと確信できるときだけ `--force` を付ける。

判定基準:
- 重要テーブルが 0 件になった → 中止
- どれかのテーブルが半減以下になった → 中止

重要テーブル: Content / ContentSection / Attraction / AttractionStory /
AttractionVisitStep / Musical / Museum / Brand

## 保存されるもの

```
~/Desktop/just-rondon-backups/
  just-rondon-20260823-191926.json.gz   全48テーブル・約3.4MB
  just-rondon-20260823-191855.json.gz
  latest.manifest.json                  最新の件数一覧
```

- 全テーブル・全行。どれが大事かを事前に見極めなくて済む
- gzip 圧縮で1世代あたり約3.4MB
- **10世代**を保持し、古いものから自動で消す
- 書き出したあと読み直して件数を突き合わせ、壊れていたら消してエラーにする

リポジトリの外に置く。本文には未公開の原稿が含まれうるし、
13MBのダンプを毎回コミットすると `.git` が際限なく膨らむため
（`.gitignore` にも登録済み）。

**ローカルにしか無い点は、この仕組みの弱点である。**
PCごと失うと守れない。ディスク全体のバックアップ（Time Machine 等）と
併用するか、時々どこかにコピーしておくこと。

## 復元

```bash
npx tsx scripts/restore-db.ts --list                    # 世代一覧
npx tsx scripts/restore-db.ts --table Content           # 差分を見る(既定はdry)
npx tsx scripts/restore-db.ts --table Content --write   # 実際に戻す
```

- **既定は dry run。** `--write` を付けない限り何も書き込まない
- テーブル指定は必須。全件一括で戻す口は用意していない
  ——DB全体を巻き戻すなら Supabase から復元するほうが確実
- **既存の行には触れない。** `id` が無い行だけを挿入する。
  手を入れた最新の行を古い内容で塗り潰さないため
- 何度実行しても結果は同じ（2回目は全てスキップされる）

本文を持つテーブルは `Content` と `ContentSection` の2つに分かれている。
コラムを戻すときは**両方**必要（`Content` は見出し、`ContentSection` が本文）。

## 注意

- 実行には `.env` の `DATABASE_URL` が要る
- **Storage（画像）は対象外。** Supabase の Storage API 配下にある画像603件は
  このバックアップにもSupabaseの日次バックアップにも含まれない
- 保存先を変えるには環境変数 `BACKUP_DIR` を設定する

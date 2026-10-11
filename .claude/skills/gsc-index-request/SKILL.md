---
name: gsc-index-request
description: just-rondon の sitemap.xml から未インデックスの可能性が高いURLを洗い出し、Google Search Console の「インデックス登録をリクエスト」を送る。人手で書いた記事ページ(美術館の館ページ /museums/<slug> を含む。作品ページ・歌詞ページなど大量に自動生成される詳細ページは除く)を優先し、送信済みURLは記録して重複送信を避ける。「インデックスリクエストして」「今日の分お願いします」「/gsc-index-request」で起動する。
---

# /gsc-index-request — 未インデックスページのインデックス登録リクエスト

sitemap.xml 全URLのうち、GSC上でまだインデックスされていないものを優先度順に
洗い出し、`mcp__google-search-console__submit_url_for_indexing` でリクエストを送る。
Indexing API には1日あたりの送信上限があるため、**1回の実行につき最大20件**に絞る。

## 対象サイト

`siteUrl: https://www.just-rondon.com/`

## Step 1 — 送信済みログを確認する

`.claude/task/gsc-index-log.md` に過去の送信記録がある。無ければ新規作成する
(見出し行だけの空ファイルでよい)。

```
# GSC Index Request Log

## 2026-08-14
- https://www.just-rondon.com/trouble (URL is unknown to Google → requested)
- https://www.just-rondon.com/health (URL is unknown to Google → requested)
...
```

このログに載っている URL で、かつ送信から **14日未満** のものは今回スキップする
(Googleのクロールには数日〜数週間かかるため、頻繁な再送信は無意味)。
14日以上経っても状況が変わらない場合は再送信の対象にしてよい。

## Step 2 — sitemapの全URLを取得する

```bash
curl -sS "https://www.just-rondon.com/sitemap.xml"
# sitemapindex なら中の <loc> (通常 sitemap-0.xml) を取得
curl -sS "https://www.just-rondon.com/sitemap-0.xml" | grep -o '<loc>[^<]*</loc>' | sed 's/<loc>//;s#</loc>##'
```

## Step 3 — 優先度をつける

全URLをそのまま検査すると日次では終わらないため、次の順で候補を絞る。

1. **最優先**: セクショントップ/ハブページ(例 `/trouble`, `/health`, `/money`,
   `/food`, `/beyond-london`, `/restaurants`, `/housing`, `/history`, `/visa`,
   `/brands`, `/column`, `/british-english`, `/jobs`, `/souvenirs`, `/contact` など、
   `app/(with-ads)/<section>/page.tsx` に対応する固定パス)
2. **次点**: 上記ハブ配下の人手で書いた個別記事(例 `/trouble/pickpocket`,
   `/health/gp-registration`)。`[slug]` 配下でも `musicals` 以外は対象。
   美術館の館ページ `/museums/<slug>`(47件)もここに含める。2026-08 に手書きの
   見どころ・歩き方で作り直し、2026-10 には主要6館に時間別の回り方を載せたが、
   2026-10-05 時点で調べた4館はどれも「Discovered - currently not indexed」の
   まま一度もクロールされていなかった。とくに時間別の回り方がある6館
   (national-gallery, british-museum, natural-history-museum, tate-modern,
   science-museum, imperial-war-museum)を先に送る。
3. **除外**: `/museums/*/artworks/*`, `/musicals/*/songs/*` などDBから大量自動生成
   される詳細ページ。件数が数百〜千件規模で1件ずつのリクエストが非効率なため、
   ユーザーから明示的に依頼されない限り対象にしない。

ログに記録済み(14日以内)のURLはこの時点で除外する。

## Step 4 — 状態を検査する

候補から先着20件程度を `mcp__google-search-console__inspect_url` で検査する。
`siteUrl` は `https://www.just-rondon.com/`、`inspectionUrl` は各URL。

複数URLがある場合は1メッセージ内で並列に呼び出してよい。

次の `coverageState` のみリクエスト対象とする:

- `URL is unknown to Google`
- `Discovered - currently not indexed`
- `Crawled - currently not indexed`

以下は対象外(すでにインデックス済み、またはリクエストしても解決しない):

- `Submitted and indexed` — 対応不要
- `Duplicate without user-selected canonical` — `googleCanonical` が 747live.bet や
  access.ms.gov など無関係なサイトになっているもの。ミラーや改ざんではない。
  2026-08 に Googlebot がページを Next.js 既定の「Application error」画面として
  描画し、同じ画面になったほかの Next.js サイトと重複扱いされた(既定の画面は
  <head> ごと差し替わるので userCanonical も無い)。2026-10-11 に app/error.tsx と
  app/global-error.tsx を入れて再発は防いだが、すでに重複扱いのページは
  再クロールされるまで戻らない。2026-09-13 に API で送った重複ページは28日後も
  1本も再クロールされていなかったので、`submit_url_for_indexing` はほぼ効かない。
  ログに残すだけにして、Search Console の画面の「インデックス登録をリクエスト」を
  ユーザーに頼む(1日10本ほどが上限)。

## Step 5 — リクエストを送信する

対象URLを `mcp__google-search-console__submit_url_for_indexing`(`type: URL_UPDATED`)
で送信する。1回の実行で **最大20件** まで。複数ある場合は1メッセージ内で並列に呼び出す。

## Step 6 — ログに記録する

`.claude/task/gsc-index-log.md` に今日の日付の見出しを追加し、送信したURLと
検査時の `coverageState` を追記する(Editツールで末尾に追記)。

## Step 7 — 完了報告

- 今回送信した件数と内訳(ハブページ何件、個別記事何件)
- スキップした件数(ログに記録済み・14日未満のため)
- 次回以降の候補がまだ残っているか(残数の目安)

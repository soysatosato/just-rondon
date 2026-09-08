# just-rondon

## リモート実行環境(Claude Code on the web)でのDBアクセス

**この環境からは本番DBに直接つながらない。** 外向き通信がHTTPSプロキシ経由に
限定されており、Supabase の Postgres ポート(pooler の `6543` / direct の
`5432`)へのTCP接続が届かない。`DATABASE_URL` と `DIRECT_URL` は設定されて
いるが、使っても `Can't reach database server` で失敗する。

つまり **Prisma を使うスクリプトはリモート環境では動かない**。以下はすべて
該当する:

- `scripts/create-british-english.ts`(`/add-british-english`)
- `scripts/create-column.ts`(`/add-column`)
- `scripts/create-modern-britain.ts`(`/add-modern-britain`)
- `scripts/create-weekly-brief.ts`(`/add-weekly-brief`)
- `scripts/create-tweets.ts`(`/add-tweets`)
- `scripts/backup-db.ts` / `scripts/restore-db.ts`
- その他 `scripts/` 配下で `utils/db` を読んでいるもの全般

### 代わりに Supabase REST API を使う

`SUPABASE_URL` と `SUPABASE_KEY`(service role)が環境変数にあり、HTTPSなので
プロキシを通る。テーブル名は Prisma のモデル名そのまま(`Content`,
`ContentSection` など)。

```bash
# 読み取り例
curl -s "$SUPABASE_URL/rest/v1/Content?category=eq.british-english&select=title,engTitle,slug&order=createdAt.desc" \
  -H "apikey: $SUPABASE_KEY" -H "Authorization: Bearer $SUPABASE_KEY"
```

書き込むときの注意:

- **`id` は自前で採番する。** Prisma の `@default(cuid())` はクライアント側で
  値を作るので、RESTから入れると `id` が埋まらない。既存行に合わせて cuid v1
  形式(`c` + 時刻base36 + カウンタ + フィンガープリント + ランダム)の文字列を
  生成して渡す。`ContentSection.id` は DB 側の autoincrement なので不要。
- `createdAt` / `updatedAt` も明示的に渡しておくのが安全。カラムは
  timezone なしなので UTC の ISO 文字列から `Z` を落として入れる。
- スキーマ上の必須項目(`category`, `route` など)は各スキルのスクリプトが
  何を入れているかを読んで、同じ値を再現する。
- slug の一意チェックはスクリプトと同じ条件(`category` と `slug` の両方で
  絞る)で事前に行う。`Content.slug` は全体では一意ではない。

### npm install は基本不要

Prisma が動かない以上、依存のインストールもたいてい徒労になる。`npm install`
を走らせると `package-lock.json` に無関係な差分(esbuild のオプショナル依存に
`"dev": true` が付く)が出て、コミット対象を汚すので注意。記事追加系のスキルは
上記の curl だけで完結する。

## 記事追加系スキルは git を触らない

`/add-british-english` などのコンテンツ追加スキルは、本文がDBにしか無い。
commit / push は不要で、DBに1行入れれば ISR 再検証後(最大1時間)に反映される。

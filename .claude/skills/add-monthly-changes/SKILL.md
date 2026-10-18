---
name: add-monthly-changes
description: just-rondon の「今月変わったロンドン」月次号を1号ぶん調べてDBに下書きとして追加する。その月に適用が始まった運賃・入場料・光熱費・最低賃金・ビザなどの改定と開業・閉館、来月以降に決まった改定を一次ソースで確かめ、サイト内の数字(lib/*/rates.ts と観光スポットの料金)を先に直してから、出典付きでまとめて /changes に載せる(運営者が /admin/reading で承認すると公開)。物価ボード(/prices)の月ごとの記録と物価メモもこのとき残す。「今月変わったロンドンを作って」「月次の改定まとめを作って」「/add-monthly-changes」で起動する。
---

# /add-monthly-changes — 「今月変わったロンドン」を1号作る

`/changes/<YYYY-MM>` に出る月次号を1号作り、`MonthlyChangeIssue` /
`MonthlyChangeItem` テーブルに**下書き**として登録する。運営者が `/admin/reading`
でプレビューして承認すると公開される。

`$ARGUMENTS` に `2026-10` のような月の指定があればその月を、無ければ**今月**
(ロンドンの日付)を対象にする。号は月のはじめ(1〜7日ごろ)に作る。

## この号の約束

1. **確認できた事実だけを載せる。** 「〜と報じられている」「〜が検討されている」は
   載せない。項目ごとに一次ソース(TfL・Ofgem・GOV.UK・会場の公式)の URL を
   `source` に入れる。一次ソースが取れない項目は落とす。
2. **数字は「前 → 後」で書く。** 読者が最初に知りたいのは「いくらからいくらへ」。
   `before` / `after` に短い表示用の文字列で入れる(「£1.75」「年£1,663」「B1」)。
3. **サイトの数字を先に直す。** 号に「変わった」と書くのに、運賃のガイドが古い
   金額のままでは、サイトが自分と矛盾する。改定は Step 3 で `lib/*/rates.ts` と
   スポットの料金に反映してから号に書く。号の `sitePath` はその直したページを指す。
4. **誰に効くかを分ける。** `audience` は `traveller`(旅行者)・`resident`(在住者)・
   `both`。旅行者だけが読んでも在住者だけが読んでも、自分に関係する項目が拾えるように。

## 載せるもの

| kind        | 中身                                                                    |
| ----------- | ----------------------------------------------------------------------- |
| `fare`      | 地下鉄・バス・鉄道・空港アクセスの運賃、上限額、Congestion Charge        |
| `admission` | 観光スポット・美術館の入場料の改定                                      |
| `opening`   | 新規開業、リニューアル再開、新路線・新駅                                |
| `closure`   | 閉館、長期休館、サービスの終了                                          |
| `bills`     | ガス・電気の上限、Council Tax、水道、TV Licence、通信                   |
| `housing`   | 賃貸の制度(Renters' Rights Act の段階施行など)                          |
| `wage`      | 最低賃金、雇用の制度                                                    |
| `visa`      | ビザの要件・申請料、ETA、入国の手続き                                   |
| `tax`       | 所得税・NI・手当                                                        |
| `life`      | 時計の切り替え(夏時間)、祝日、その他の暮らしのルール                    |

`timing`:

- `changed` — **その月に適用が始まった**もの。号の主役
- `upcoming` — 来月以降に適用される改定で、**金額や日付が公表されている**もの

`status`:

- `confirmed` — 法令・公式発表で確定
- `planned` — 公式に発表されたが、まだ覆りうる(議会の承認待ちなど)。本文でも明示する

### 載せないもの

- 噂、報道ベースの観測、検討段階の案、パブリックコメント中のもの
- 金額も日付も決まっていない「〜年後半に」の改定(決まった号で載せる)
- ロンドンに関係しない地方の制度(スコットランドだけの改定など)。ただし
  ロンドンから出かける人に効くもの(エディンバラの宿泊税など)は `traveller` で載せてよい
- 週次の「今週のロンドン」で扱う催し・ストライキ・運休。月次は**金額と制度**の号

### 件数の目安

| 節         | 目安   |
| ---------- | ------ |
| `changed`  | 3〜8件 |
| `upcoming` | 2〜6件 |

改定の少ない月はある。件数を埋めるために弱い項目を足さない。

## Step 1 — 下調べを出す

```bash
npx tsx scripts/report-monthly-changes.ts 2026-10
```

出てくるもの:

1. **予定表にある改定**(`lib/changes-schedule.ts`)。`★今月` はその月に起きた改定、
   `予告` は来月以降。どれも定数ファイルが持っている数字なので、ここに出たものは
   **必ず一次ソースで今も有効か確かめる**(延期・撤回がありうる)
2. **観光スポットの料金の変更履歴**(前号の調査日以降)。DBのトリガーが自動で
   記録している。表記を直しただけの行も混ざるので、改定かどうかは公式で判断する
3. **定数ファイルの確認日**。`!` が付いたもの(60日以上前)は、今月の調査で
   一緒に見直す
4. **既にある号**。対象月が既にあれば、内容を見てから `--replace` で上書きするか決める

## Step 2 — 調べる(毎月同じ確認リスト)

WebSearch / WebFetch で当たる。**検索語は英語。** その月と翌月の名前を入れる
(`London fares November 2026` など)。

### 毎月必ず見る

| 対象 | 一次ソース | 見るもの |
| ---- | ---------- | -------- |
| TfL | `tfl.gov.uk/info-for/media/press-releases`、`tfl.gov.uk/fares` | 運賃・上限額・Congestion Charge・ULEZ の改定、新駅・新路線 |
| 光熱費 | `ofgem.gov.uk`(price cap) | 四半期ごとの上限。**2・5・8・11月の下旬に次の期間が発表される** |
| ビザ | `gov.uk/government/collections/immigration-rules-statement-of-changes`、`gov.uk/government/news` | 要件・申請料・ETA の変更。施行日を確認 |
| EU の入国 | `travel-europe.europa.eu`(ETIAS・EES)、`help.eurostar.com` | **ETIAS の開始日が発表されたか**。決まったら `lib/beyond-london/eurostar.ts` の `EU_BORDER.etias`(`startsOn`・`status`)と /beyond-london/paris の ETIAS の節・FAQ を直し、日付を `lib/changes-schedule.ts` に登録する。号では `traveller` で載せる |
| 賃金・税 | `gov.uk`(National Minimum Wage、Budget) | 最低賃金は秋に翌4月分が発表される。予算の発表月は特に注意 |
| 入場料 | 主要スポットの公式チケットページ | 下の「入場料の確かめ方」 |
| 開業・閉館 | Time Out London のニュース、各施設の公式 | 開業日・閉館日は公式で確定させる |

### 時期で見るもの

- **1月**: 鉄道運賃(National Rail)、TfL 運賃の発表、Ofgem の1〜3月分
- **3月**: TfL・鉄道の運賃改定の適用
- **4月**: 最低賃金、Council Tax、水道、TV Licence、所得税の年度替わり、処方箋料
- **3月最終日曜 / 10月最終日曜**: 夏時間の開始・終了(日本との時差が変わる。`life`・`traveller`)
- **10月・11月**: 予算(Budget)の発表、翌年4月の最低賃金の発表

### 入場料の確かめ方

閲覧数の多いスポットから順に、公式のチケットページで大人料金を確かめる。

```bash
npx tsx -e '
import db from "./utils/db";
(async () => {
  const rows = await db.attraction.findMany({
    where: { isPublished: true, priceAdult: { not: null }, NOT: { priceAdult: "無料" } },
    orderBy: { views: "desc" }, take: 20,
    select: { slug: true, name: true, priceAdult: true, priceChild: true, website: true },
  });
  for (const r of rows) console.log(r.slug, "|", r.name, "|", r.priceAdult, "|", r.priceChild ?? "-", "|", r.website ?? "-");
  await db.$disconnect();
})();
'
```

料金は「£35.8〜」のような表示用の文字列で、「〜」付きの最安値で書いている行が多い。
既存の行の書き方に合わせる。曜日や時期で変わる料金(ピーク料金・オンライン割引)を、
ある日の値だけ見て「値上げ」と書かない。同じ条件の料金どうしで比べられないときは載せない。

`lib/sightseeing/budget.ts` の入場料(旅費の目安の計算に使う)も同じスポットを
持っているので、DB を直したらこちらも揃える。

## Step 3 — サイトの数字を直す(号に書く前に)

### 料金・制度の定数(`lib/*/rates.ts`)

改定が確認できたら、該当する定数を直し、ファイルの `*_AS_OF` / `*_UPDATED_AT` と
冒頭の「◯月◯日に確認」を今日の日付にする。各ファイル冒頭の運用ルールに従うこと
(例: bills/rates.ts の price cap は `ENERGY_CAP.period` と `nextChange` も書き換える)。

新しく**日付の決まった**改定が発表されたら、定数ファイルに日付を足し、
`lib/changes-schedule.ts` に予定として登録する(日付は定数から引く。直書きしない)。
これで /changes の「これから変わること」に出る。

定数ファイルの変更はコードの変更なので、**号の登録とは別に commit する**
(英語のメッセージ。`git add` は自分が変えたファイルだけ。stash や `add -A` は使わない)。
`npx tsc --noEmit` を通してから。

### 観光スポットの料金

```bash
npx tsx scripts/update-attraction-price.ts <slug> --adult "£36〜" [--child "£18〜"] --dry   # 確認
npx tsx scripts/update-attraction-price.ts <slug> --adult "£36〜" [--child "£18〜"]          # 反映
```

変更履歴はトリガーが記録するので、次の号の下調べに自動で出る。

## Step 4 — JSON を組み立てて登録する

スクラッチパッドに書き出し、リポジトリのルートで実行する。

```bash
npx tsx scripts/create-monthly-changes.ts <一時ファイルのパス>
npx tsx scripts/create-monthly-changes.ts <path> --replace   # 既存の号を上書き(公開済みなら公開日時は保たれる)
```

スクリプトは太字(`**`)が描画されない箇所を見つけると登録を止める
(CLAUDE.md の「Verification」)。`headline` / `summary` / 項目の `title` は
Markdown として描画しないので `**` を書かない。

```json
{
  "slug": "2026-10",
  "headline": "ガス・電気の料金上限が4%上がり、同時に電気代の VAT が0%に。11月1日にはバス運賃が£1.85になる。",
  "summary": "2〜3文。その月にいちばん家計と旅費に効く変化を主語にして、旅行者向けと在住者向けの両方に触れる。",
  "items": [
    {
      "kind": "bills",
      "audience": "resident",
      "timing": "changed",
      "status": "confirmed",
      "title": "ガス・電気の料金上限が4%上がった",
      "before": "年£1,663",
      "after": "年£1,723",
      "effectiveDate": "2026-10-01",
      "description": "Markdown 可。何が変わったか → 誰にどれだけ効くか → 読者は何をすればいいか(メーターの検針値を送る、固定料金プランを比べる等)。",
      "sitePath": "/bills/energy",
      "source": "https://www.ofgem.gov.uk/...",
      "sourceName": "Ofgem",
      "displayOrder": 0
    }
  ]
}
```

- `title` を省くと「2026年10月に変わったロンドン」になる。原則省く
- `headline` は「いちばん効く変化の1文。ほかの変化の1文。」の形にする。
  SNS カードはこれを句点で割って組む(週次と同じ)
- `displayOrder` は `changed` から振る。その月の目玉を先頭に置く
- `description` は事実の列挙で終えず、**読者がどう動けばいいか**まで書く。
  旅行者なら旅費の見積もりがどう変わるか、在住者なら手続きや請求の確認の仕方
- `effectiveDate` は適用日。月単位でしか決まっていないものは null にして本文に書く
- 日本語の地名・制度名には初出で英語を添える(読者が現地で探せるように)

## Step 5 — 物価ボード(/prices)を記録する

ボードの30品目は `lib/price-board/items.ts` が各定数から引いている。Step 3 で
定数を直していれば、ボードの値もすでに直っている。ここでは月ごとにしか
見ない品目を確かめ、その月の値を記録する。

1. **ONS の店頭価格(パイント・コーヒー)**

   ```bash
   npx tsx scripts/ons-london-prices.ts
   ```

   出た値を `lib/food/prices.ts` の `ONS_LONDON_PRICES` に貼る(`surveyMonth` も)。
   公表は調査月の翌月中旬なので、月はじめに取れるのは前々月の分。

2. **改定の周期が決まっていない品目**

   | 品目 | 定数 | いつ見るか |
   | ---- | ---- | ---------- |
   | Meal Deal(Tesco) | `lib/food/prices.ts` の `MEAL_DEALS.tesco` | 毎月 |
   | 入場料5件(ロンドン塔・ウェストミンスター寺院・セント・ポール・ロンドン・アイ・スタジオツアー) | `lib/sightseeing/budget.ts` の `ADMISSIONS` | 毎月(Step 2 の入場料と一緒に) |
   | ONS の家賃 | `lib/housing/rates.ts` の `onsGreaterLondonMonthly` / `onsPeriod` | 毎月(中旬に前月分が出る) |
   | SpareRoom のシェア1部屋 | 同 `roomGreaterLondonMonthly` / `spareRoomPeriod` | 1・4・7・10月(前の四半期分) |

   TfL・Council Tax・水道・TV Licence・最低賃金・Ofgem は、Step 2 の確認リストで
   改定を拾えば足りる。「目安」の品目(アフタヌーンティー・ミュージカル・宿)は
   月ごとには見ない。

3. **記録する**

   ```bash
   npx tsx scripts/snapshot-price-board.ts --dry                        # 前回からの差を見る
   npx tsx scripts/snapshot-price-board.ts --memo "…" --issue <この号のslug>
   ```

   `--dry` は、ポンドで値が変わった品目と、前回からの為替の動きを出す。
   メモは2〜3文で、**ポンドで動いたもの(値上げ・値下げ)と為替で動いたもの
   (円安・円高)を分けて書く**。日本の読者にとって、ロンドンが高くなった理由の
   半分は為替なので、混ぜると何が起きたのか分からなくなる。

   > バス運賃が£1.75から£1.85に上がった。ほかの品目はポンドでは据え置きだが、円は前月より2%安くなり、円で払う額はそのぶん増えた。

   メモはプレーンテキストとして出るので `**` を書かない。

4. `lib/price-board/snapshots.json` と直した定数を commit する(号の登録とは別)。
   ボードの品目を足すときは、先に定数ファイルに値を置き、`items.ts` から参照する。
   品目の `id` は記録のキーなので変えない(変えると前月比が途切れる)。

## Step 6 — バックアップ

号の本文は DB にしか無い。登録に成功したら続けて実行する。

```bash
npx tsx scripts/backup-db.ts
```

`⚠ 件数が異常です` で止まったら、`--force` を付けずにユーザーに報告する。

## Step 7 — 完了報告

最後にユーザーへ報告する。

- 作成した号の slug と URL(`https://www.just-rondon.com/changes/<slug>`)
- **下書きに入れたこと。`/admin/reading` でプレビューして承認すると公開されること**
- 項目数と内訳(`changed` / `upcoming`、旅行者向け / 在住者向け)
- 号の目玉とその理由
- Step 3 で直したサイトの数字(定数ファイルとスポットの料金)と、その commit
- 物価ボードの記録(ポンドで変わった品目、為替の動き、書いたメモ)
- 一次ソースが取れずに落とした項目があれば、その内容

公式X用のツイート案を2〜3案添える。**公開後に投稿する**(承認前は号の URL が404)。
140字以内、1行目は **【今月変わったロンドン】**、末尾に号の URL。字数は実測する。
**1案目は王道の要約**(その月のいちばん大きな改定をひと言で)にし、それだけを
`/tweets` に下書き登録する。残りの案はチャットに出すだけで、DBには入れない。

```bash
python3 -c 'import sys; t=sys.stdin.read().rstrip("\n"); print(len(t), "OK" if len(t)<=140 else "NG")' <<'TWEET'
【今月変わったロンドン】
…本文…
https://www.just-rondon.com/changes/<slug>
TWEET
```

1案目の登録は、スクラッチパッドの JSON に書き出して次で行う。`category` は
`changes`。本文の改行は `\n` で書く。

```bash
npx tsx scripts/create-tweets.ts <JSONのパス>
```

```json
[{ "body": "【今月変わったロンドン】\n…本文…\nhttps://www.just-rondon.com/changes/<slug>", "category": "changes" }]
```

号が下書きのあいだ、`/tweets` はこのツイートを「記事の公開待ち」に分けて出す。

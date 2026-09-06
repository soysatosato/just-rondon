---
name: add-weekly-brief
description: just-rondon の「今週のロンドン」週次ダイジェストを1号ぶん調べてDBに追加する。その週のイベント(単発の催し・展覧会の開幕/最終週・無料開放・新規オープン)を主役に、影響の大きい支障情報を添えてWeb検索で調査し、出典付きでまとめて /events に公開する。「今週号を作って」「週次ダイジェストを更新して」「/add-weekly-brief」で起動する。
---

# /add-weekly-brief — 「今週のロンドン」を1号作る

`/events` に出る週次ダイジェストを1号作成し、`WeeklyBrief` / `WeeklyBriefItem`
テーブルに直接登録する。git の commit/push は不要 — DBに入れるだけで
`/events` と `/events/week/<slug>` に(ISR再検証後、最大1時間以内に)反映される。

`$ARGUMENTS` に `2026-w33` や `2026-08-12` のような週の指定があればその週を、
無ければ**次の月曜から始まる週**(=これから来る週)を対象にする。

## このページの主役はイベント

読者がこの号を開くのは「今週ロンドンで何があるか」を知りたいからで、
運休情報を読みたいからではない。**その週のイベントを主役に据える。**
支障系(ストライキ・運休・臨時休館)は、旅程が実際に壊れるレベルのものだけを
添える脇役として扱う。

ページ側も「耳寄り情報 → 注意 → 前提」の順に描画する。

### 件数の目安(1号あたり)

| グループ                 | 目安    | 方針                                                   |
| ------------------------ | ------- | ------------------------------------------------------ |
| 機会系(イベント・耳寄り) | **6〜10件** | ここに一番手間をかける。少ないなら調査が足りていない |
| 支障系(注意)             | 0〜3件  | 影響が大きいものだけ。無い週は0件でよい               |
| 環境系(前提)             | 0〜2件  | 平常でない天候と祝日のみ                              |

イベントが5件に満たないまま登録しない。Step 3 の調査先を増やして探し直す。

### 載せるもの

| グループ               | kind         | 中身                                                           |
| ---------------------- | ------------ | -------------------------------------------------------------- |
| **機会系(主役)**       | `event`      | 単発・突発の催し(1回限りの公演、ポップアップ、記念行事、フェス、マーケット) |
|                        | `exhibition` | 展覧会の**開幕**または**最終週**(「今週で終わり」は訴求が強い) |
|                        | `deal`       | 無料開放日、割引、期間限定メニュー、無料イベント               |
|                        | `opening`    | 新規オープン、リニューアル、期間限定ショップ                   |
| 支障系(脇役)           | `strike`     | 地下鉄・鉄道・バス・空港のストライキ                           |
|                        | `disruption` | 計画運休、路線/駅の閉鎖(**旅行者の主要動線に関わる分のみ**)   |
|                        | `closure`    | 有名観光地・美術館の臨時休館                                   |
|                        | `crowd`      | **見に行く価値のない**混雑源。デモ、行進、道路封鎖、試合日の混雑 |
| 環境系                 | `weather`    | 熱波、大雪、暴風警報など平常でないもの                         |
|                        | `holiday`    | Bank Holiday と前後の運行・営業の変化                          |

### 大型イベントは `event` に入れる(`crowd` ではない)

カーニバル、フェス、パレード、花火のような**人が集まるイベントそのもの**は、
必ず機会系の `event` として書く。`crowd` に入れると「今週の注意」に落ちて、
避けるべき障害物として表示されてしまう。

`crowd` は**見に行く対象ではない混雑源**のためにある — デモ、行進、
道路封鎖、試合日の駅の混雑。読者がそれを目当てに出かけないものだけ。

大型イベントを `event` で書くときは、**まずそのイベントの中身を書く**。

1. **何が行われるか** — 見どころ、何を見て何を聴いて何を食べるものなのか。
   1〜2行で済ませない。読者がその場の様子を想像できるまで書く
2. **日ごとの違い** — 日によって性格が変わるなら分ける(例: 子ども向けの日と大人の日)
3. **どう楽しむか** — どこで見るのがよいか、何時に行くか、初めてなら何を狙うか
4. **費用** — 無料なら `isFree: true` と `priceInfo` を必ず入れる。
   予約や有料の関連公演があればそれも
5. **そのうえで**アクセスと混雑 — 駅の閉鎖や迂回はここ。**最後に置く**

**分量の目安**: アクセス・混雑の記述が、イベントの中身の記述より長くなったら
書き方を間違えている。中身が主、動線は従。

規模が大きく交通影響も重い場合でも、項目を2つに割らない。1つの `event` に
まとめ、末尾で動線を説明する。「行かない人は近づくな」だけで終えず、
**行く人のための情報を先に十分書く。**

### 載せないもの

- **影響の小さい支障系**。郊外の一区間だけの週末工事、迂回が容易な部分運休、
  マイナーな会場の休館などは書かない。判定の目安は Step 4 の `severity` で、
  **`low` 相当のものは原則落とす**(`high` は必ず載せる、`medium` は主要路線・
  主要観光地に関わるものだけ)
- 既存 `Event` テーブルにある定番イベント(自動抽出枠で出る)は重要度が低ければ
  載せない。重要なイベントであれば、内容を肉付けして載せたい
- 通年やっている常設のもの
- 旅行者の行動が変わらない単なるニュース(政治・事件・スポーツの結果)
- **噂・未確定の情報**。「〜という report がある」程度のものは書かない
- ロンドン以外の話題。ただしヒースロー/ガトウィックやロンドン発着の
  長距離列車など、**ロンドンからの移動に関わるもの**は対象に含める

年間カレンダー(`Event` テーブル / `/events/calendar`)は「1年前から分かっている
定番」を既に持っている。ページ側が `Event` テーブルから今週開催中のものを自動で
拾って併記するので、手で書くと二重掲載になる。

## Step 1 — 対象の週と既存号を確認する

```bash
npx tsx -e '
import db from "./utils/db";
import { getWeekSlugForDate, getWeekRange, parseWeekSlug, formatWeekRange } from "./lib/weekly";
(async () => {
  // 次の月曜から始まる週(=これから来る週)を既定の対象にする
  const d = new Date(); d.setUTCDate(d.getUTCDate() + 7);
  const slug = getWeekSlugForDate(d);
  const p = parseWeekSlug(slug)!;
  const r = getWeekRange(p.year, p.week);
  console.log("対象週:", slug, formatWeekRange(r.weekStart, r.weekEnd));
  console.log("既存号:", JSON.stringify(await db.weeklyBrief.findMany({
    select: { slug: true, published: true, researchedAt: true },
    orderBy: { weekStart: "desc" }, take: 8,
  }), null, 1));
  await db.$disconnect();
})();
'
```

対象週が既にあれば、内容を確認したうえで `--replace` で上書きするか判断する。

## Step 2 — その週に既にある「定番」を確認する(重複回避)

ページが自動で拾う分。ここに出たものは原則 items に書かない(二重掲載になる)。
ただし**その週の目玉になるほど重要なもの**は、内容を肉付けして機会系に載せてよい。

```bash
npx tsx -e '
import db from "./utils/db";
import { getWeekRange, parseWeekSlug } from "./lib/weekly";
(async () => {
  const p = parseWeekSlug(process.argv[1])!;   // 例: 2026-w33
  const { weekStart, weekEnd } = getWeekRange(p.year, p.week);
  const rows = await db.event.findMany({
    where: { startDate: { lte: weekEnd }, endDate: { gte: weekStart } },
    select: { title: true, startDate: true, endDate: true },
    orderBy: { startDate: "asc" },
  });
  console.log(rows.length + "件が自動掲載されます:");
  for (const r of rows) console.log(" -", r.title);
  await db.$disconnect();
})();
' 2026-w33
```

## Step 3 — 調査する

WebSearch / WebFetch で当たる。**イベント探しから始めて、時間の大半をそこに使う。**
支障系は最後に TfL を一度見れば足りる。

### 3-1. まずイベントを探す(ここが本番)

#### Time Out London は毎回必ず調べる(省略不可)

**どの号でも、最初に Time Out London を見る。**ロンドンのイベント報道で
最も速く、網羅的で、単発の催しを拾うにはここが最良の入口になる。

**とくに「ニュース」欄を必ず見ること。**イベント一覧のページだけでは足りない。
突発の催し・ポップアップ・企業のプロモーション企画は、
一覧ではなくニュース記事として出る。実例として、タワーブリッジ横で行われた
ポケモンの無料謎解きイベントは、ニュース記事にしか載っていなかった。

必ず開く:

- `https://www.timeout.com/london/news` — **突発イベントはここ。最優先**
- `https://www.timeout.com/london/things-to-do` — 定番の一覧
- `free things to do london this weekend <日付>` で出る Time Out の記事
- Time Out の記事URLは `.../london/news/<記事スラッグ>-<MMDDYY>` の形。
  末尾の数字が日付なので、**対象週の直近に出た記事**かどうかを確認する

**その週だけでなく翌週の記事も見る。**Time Out は数日〜1週間前に予告記事を
出すので、来週号の準備がここでできる。逆に、対象週の号を作るときは
**1〜2週間前に遡って記事を読む**(告知は事前に出ているため、
対象週に発行された記事だけを見ると間に合わない)。

Time Out で見つけた項目は、**必ず主催者・会場の公式ページまで辿って
`source` を一次ソースにする。**Time Out は日付を間違えることがある
(3-4 のグリニッジ・フェアの例)。一次ソースが取れた場合でも、
Time Out の記事は `website` に入れておくと読者の役に立つ。

| 対象                             | 当たり先                                                       |
| -------------------------------- | -------------------------------------------------------------- |
| 今週の催し全般                   | Time Out London、Visit London、Londonist、Secret London、SheerLuxe(いずれも二次) |
| 展覧会の開幕・最終週             | 各美術館の公式 What's On(Tate / National Gallery / V&A / British Museum / Royal Academy / Barbican / Somerset House など) |
| 単発公演・フェス                 | Southbank Centre、Barbican、Royal Albert Hall、各劇場の公式     |
| **会期の長い野外フェス**         | **festival.org(GDIF)、Greenwich+Docklands、各BIDや自治体の Summer of Culture** |
| 無料開放日・割引                 | 各会場公式、National Trust / English Heritage、**Historic Royal Palaces(HRP)**、Museums at Night 系 |
| **宮殿・王室関連の催し**         | **hrp.org.uk と hrpfestivals.com(ハンプトン・コート、ロンドン塔、ケンジントン宮殿)** |
| マーケット・ポップアップ         | Borough / Broadway / Columbia Road 等の公式、会場のSNS          |
| 新規オープン・リニューアル       | 会場公式のプレスリリース                                        |
| 季節もの(花・紅葉・イルミ)      | Royal Parks、Kew Gardens、各庭園公式                            |

**東ロンドンの大型会場を毎回見る。**中心部の美術館だけ見ていると、
オリンピック公園一帯の催しを丸ごと落とす。

- Queen Elizabeth Olympic Park(`queenelizabetholympicpark.co.uk`)
- East Bank(Sadler's Wells East / V&A East / BBC / UCL East)
- Stratford Cross、Westfield 周辺のイベント告知

検索語は英語で。週の日付を添えると精度が上がる:

- `things to do in London this weekend <日付>`
- `free things to do London this weekend <日付>`
- `London events <月> <年>`
- `closing soon London exhibition` / `new exhibition opening London <月>`
- `free events London this week`
- `London pop up <月> <年>`
- `London festival <月> <年>` — **会期の長いフェスを拾うため。必須**
- `bank holiday weekend London <年>` — **祝日を含む週は必ず**

**同じ催しが複数媒体に出ていたら、会場の公式ページまで辿って一次ソースにする。**
二次ソースしか無い項目は `sourceName` に媒体名を入れ、読者が信頼度を
判断できるようにする。

### 3-1a. 会期の長いイベントを取りこぼさない(最頻出の見落とし)

**「今週始まるもの」だけを探すと、既に始まっている大型フェスを丸ごと落とす。**
GDIF(8月下旬〜9月上旬・全公演無料・25団体超)のような17日間の催しは、
開幕日の号にしか載らず、会期中の週の号から消えてしまう。

対象週について、**次の2つを必ず別々に確認する**:

1. **今週始まる/終わるもの** — 通常の検索で拾える
2. **今週も会期中のもの** — 先月〜今月に開幕した多日程フェス・大型展。
   `London festival <月> <年>`、`what's on London <月> <年>` で拾い、
   **前号・前々号に載せた会期の長い項目を読み返して、まだ続いていないか確かめる**

会期中のものを載せるときは「もう始まっている」で終えず、
**その週に何が演じられるか**を書く(GDIFなら『360』は21日、
Efectos Especiales は29〜30日、というように週ごとの演目を特定する)。

### 3-1b. 「今週で終わる」を能動的に洗い出す

展覧会は開幕より**閉幕のほうが訴求が強い**。待っていても記事にはならないので、
主要館の What's On を開いて**会期末の日付を自分で数える**。

- Tate Modern / Tate Britain、National Gallery、V&A、British Museum、
  Royal Academy、Barbican、Somerset House、Hayward、Serpentine、
  Camden Art Centre、Whitechapel、Design Museum
- 検索語: `London exhibition last chance <月> <年>`、
  `"until <日> <月>" exhibition London`

**大型の回顧展が閉幕する週は、それだけで号の目玉になる。**
チケットの割引制度(Tate Collective の16〜25歳£5、National Art Pass 50%引き、
会員無料、2for1)まで調べて書くと、読者の行動が実際に変わる。

### 3-2. 次に支障系を確認する(影響が大きいものだけ)

| 対象                                                | 一次ソース                                    |
| --------------------------------------------------- | --------------------------------------------- |
| 地下鉄・DLR・Overground・Elizabeth line の運休/スト | `tfl.gov.uk/status-updates`、RMT・ASLEF 公式  |
| ロンドン発着の鉄道                                  | National Rail(ロンドンに関わる分のみ)        |
| 空港                                                | ヒースロー / ガトウィック公式                 |
| 有名観光地の臨時休館                                | 各会場の公式サイト                            |
| デモ・行進・道路封鎖                                | Metropolitan Police、Greater London Authority |

ここで拾ったものは Step 4 の `severity` で選別する。**`low` 相当は載せない。**
「旅行者の主要動線(ゾーン1〜2の主要路線、空港アクセス)が壊れるか」を基準にする。

### 3-3. 環境系

祝日は GOV.UK bank holidays、天候は平常でない警報が出ている時だけ。

調査のコツ:

- **今週判明した来月の話**を落とさない。人気公演のチケット発売開始や
  大型展の会期発表は一番の耳寄り情報になる → `timing: "announced"` で載せる。
- 展覧会は「最終週」を狙って探す。「今週で終わり」は訴求が強い。
- イベントが件数の目安に届かないときは、調査先を widen する。
  美術館だけでなく、庭園・マーケット・小劇場・映画館の特別上映まで見る。
- **無料のものを最低3件は入れる。**「無料」は最も強い訴求で、探せば必ずある。
- **中心部(ゾーン1)だけで埋めない。**グリニッジ、ストラトフォード、
  ハムステッド、クリスタル・パレス、ハンプトン・コートまで足を伸ばす。

### 3-4. 登録前のチェック(ここを飛ばさない)

**機会系が目安に届いたからといって、そこで調査を止めない。**
以下に1つでも「いいえ」があれば、Step 3 に戻って探し直す。

- [ ] **Time Out London のニュース欄**を見たか(3-1・省略不可)
- [ ] 機会系が **6件以上** あるか
- [ ] **無料の項目が3件以上**あるか
- [ ] **会期の長いフェス**(今週も開催中の多日程イベント)を確認したか(3-1a)
- [ ] **今週閉幕する展覧会**を主要館の会期末から洗い出したか(3-1b)
- [ ] **ゾーン1の外**の項目が2件以上あるか
- [ ] 東ロンドン(オリンピック公園・East Bank)を見たか
- [ ] 祝日を含む週なら `bank holiday weekend London` で検索したか
- [ ] 各項目の日付を**一次ソースで**確認したか(二次媒体は日付を間違える)

**日付は必ず一次ソースで裏を取る。**実例として、Time Out はグリニッジ・フェアを
「8/23〜24」と書いていたが、主催者の Royal Borough of Greenwich では
「8/22〜23」だった。会場・主催者の公式ページが最終的な根拠になる。

**二次媒体どうしで矛盾したら、一次ソースが取れるまで載せない。**
会期が食い違った項目(例: ある媒体が「8/30まで」、公式では既に終了)は
落とす。裏の取れない項目を載せるより、件数が1件少ないほうがよい。

## Step 4 — 各項目の属性を決める

- **`severity`**(支障系 `strike`/`disruption`/`closure`/`crowd` は必須)
  - **機会系(`event` 等)には付けない。** グループは `kind` で決まるので表示位置は
    変わらないが、`high` を付けるとカードが赤枠+「影響大」バッジになり、
    楽しむイベントが警告に見えてしまう。交通影響は `description` の末尾で説明する
  - `high` — 旅程の変更が必要(地下鉄全線スト、空港の大規模欠航)。必ず載せる
  - `medium` — 迂回や時間調整で回避できる(一部路線運休、エリア封鎖)。
    主要路線・主要観光地に関わるものだけ載せる
  - `low` — 知っておくと快適(混雑予報、営業時間の変更)。**原則載せない**
- **`timing`**
  - `thisWeek` — 今週その事が起きる(既定)
  - `announced` — 今週判明した。発生は先
- **`status`**
  - `confirmed` — 確定
  - `planned` — まだ覆りうる。**ストライキ予告は原則こちら**。妥結して中止に
    なるのが普通なので、`description` に「◯月◯日時点で予告段階。妥結すれば
    中止になる」と明記する
- **`source`** — 必須。http(s) のURL。無い項目は載せない

## Step 5 — JSONを組み立てて登録する

スクラッチパッドに書き出し、リポジトリのルートで実行する。

```bash
npx tsx scripts/create-weekly-brief.ts <一時ファイルのパス>
```

既定では `published: false` の下書きとして入る。内容を確認してから公開する。

```bash
npx tsx scripts/create-weekly-brief.ts <path> --publish            # 公開して登録
npx tsx scripts/create-weekly-brief.ts <path> --replace --publish  # 既存号を上書き
```

ペイロードの形。**`displayOrder` は機会系から振る**(ページも耳寄り情報を先頭に
描画する)。

```json
{
  "slug": "2026-w33",
  "title": "今週のロンドン(8/10〜8/16)",
  "headline": "テートの話題の特別展が今週で閉幕。週末はノッティング・ヒル・カーニバルで一帯が大混雑に。",
  "summary": "2〜3文。今週なにがあるかを主役に書き、支障があれば最後に一言添える。",
  "items": [
    {
      "kind": "exhibition",
      "timing": "thisWeek",
      "status": "confirmed",
      "title": "テート・モダンの◯◯展が今週日曜で閉幕",
      "description": "Markdown可。何が見られるか、なぜ今週行く価値があるかを書く。混む時間帯と予約の要否まで触れる。",
      "startDate": "2026-08-10",
      "endDate": "2026-08-16",
      "venue": "Tate Modern",
      "area": "サウス・バンク",
      "nearestStation": "Southwark",
      "priceInfo": "£20(会員無料)",
      "website": "https://www.tate.org.uk/",
      "source": "https://www.tate.org.uk/",
      "displayOrder": 0
    },
    {
      "kind": "deal",
      "title": "◯◯美術館が今週末のみ無料開放",
      "description": "...",
      "isFree": true,
      "priceInfo": "無料(要事前予約)",
      "website": "https://example.org/",
      "source": "https://example.org/",
      "displayOrder": 1
    },
    {
      "kind": "disruption",
      "severity": "high",
      "timing": "thisWeek",
      "status": "confirmed",
      "title": "セントラル線 リヴァプール・ストリート〜レイトンストーン間が週末運休",
      "description": "何が起きるか、旅行者はどう動けばいいかまで書く。代替ルートを必ず示す。",
      "startDate": "2026-08-15",
      "endDate": "2026-08-16",
      "area": "イースト・ロンドン",
      "nearestStation": "Liverpool Street",
      "source": "https://tfl.gov.uk/status-updates/",
      "sourceName": "Transport for London",
      "displayOrder": 10
    }
  ]
}
```

`slug` を省くと `weekOf` の週、それも無ければ**実行日の週**になる。
先の週を作るときは `slug` か `weekOf` を明示すること。

`headline` / `summary` の書き方 — **その週の目玉イベントを主語にする。**
運休や工事を頭に置かない。支障系が `high` の週だけ、後半に一言添える。

`description` の書き方 — 事実の列挙で終わらせず、**読者がどう動けばいいか**まで
書く。イベントなら見どころ・予約の要否・混む時間帯、運休なら代替ルート、
休館なら近くの代替スポット。

## Step 6 — バックアップ

DBに書き込んだ本文は、この時点で**DBにしか存在しない**。
2026-08-23 にコラム29本・18万字が失われかけたのは、まさにこの状態を
放置していたためだった。投入が成功したら、続けて実行する。

```bash
npx tsx scripts/backup-db.ts
```

`⚠ 件数が異常です` と出て中止された場合は、**`--force` を付けずに**
ユーザーに報告する。DBが壊れている可能性があり、正常なバックアップを
上書きしないための停止だから。詳しくは `/backup-db` スキルを参照。

## Step 7 — 完了報告

git の操作(commit, push, branch作成など)は一切行わない。
最後に以下をユーザーに報告する。

- 作成した号の slug と `/events/week/<slug>` のURL
- 掲載した項目数と内訳(**機会系が何件**、支障系が何件、環境系が何件)
- 目玉として推したイベントとその理由
- `severity: high` の項目があればその内容
- `published` の状態(下書きのままなら、公開するコマンドも添える)

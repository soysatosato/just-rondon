# AttractionSection → AttractionStory 移行計画

`scripts/survey-attraction-sections.ts` の実測にもとづく設計案。
**まだ何も変更していない。** この文書を確認してから実装に入る。

## いま何が起きているか

`AttractionSection` は135スポットで **1,018節・215,526字**。
`title` が自由文字列なので **172種類の見出し**が生まれ、うち **138種類は1件しか
使われていない**（「アクセス」「アクセス方法」「所在地」「場所」が全部同義）。

この状態だと表示側の判断がすべて正規表現頼みになる。実際、
`isRedundantOverview()` は145件の「概要」に対して **0件** しか検出できていない。

さらに **393節・60,896字が事実の重複**で、ファクトバーと二重になるため
表示側で伏せられている。データとしては生きているが、誰にも読まれていない。

## 移行先の内訳（実測）

| 移行先 | 節数 | 文字数 | 扱い |
| --- | ---: | ---: | --- |
| `facts` | 393 | 60,896 | カラム／`AttractionAccess` へ吸い上げ。節は破棄 |
| `story:highlight` | 126 | 44,619 | そのまま移す |
| `redundant`（概要） | 145 | 37,998 | 原則破棄。38件だけ退避を検討 |
| `story:history` | 93 | 26,230 | そのまま移す |
| `story:practical` | 89 | 15,066 | そのまま移す |
| `split:practical` | 80 | 12,944 | 所要時間の行を落として移す |
| `story:trivia` | 38 | 8,147 | そのまま移す |
| `story:context` | 23 | 6,240 | そのまま移す |
| `review` | 31 | 3,386 | 人が個別に判断 |

**読み物として移るのは 449節・113,246字。** 事実は構造化データへ、
重複は破棄。手作業が要るのは 31 + 38 = **69件**だけ。

## 新しいモデル

```prisma
/// 観光スポットの読み物。AttractionSection の後継。
///
/// 旧 AttractionSection は title が自由文字列だったため、同じ話題に
/// 172種類の見出しが生まれ、表示側が正規表現で推測する羽目になった。
/// ここでは kind を固定値に限定し、見出しは表示用の飾りとして分離する。
///
/// 事実(料金・アクセス・開館・所要)はここに入れない。カラムと
/// AttractionAccess が持つ。本文に事実を書くと、ファクトバーと
/// 二重になったうえ、改定時に両方直す必要が出る。
model AttractionStory {
  id           Int        @id @default(autoincrement())
  attractionId String
  attraction   Attraction @relation(fields: [attractionId], references: [id], onDelete: Cascade)

  /// "highlight" | "history" | "trivia" | "practical" | "context"
  /// ★自由入力しない。増やすときは表示側の並び順とラベルも同時に直すこと。
  kind         String
  /// 表示用の見出し。null なら kind ごとの既定ラベルを使う。
  /// 「なぜ中世の城のような外観なのか」のような固有の見出しだけ入れる。
  heading      String?
  /// 本文。markdown。MarkdownBody で描画する。
  body         String

  /// 節に添える画像。null 可(写真を自前で撮らない運用のため)。
  imageUrl     String?
  /// "commons" | "official" | "own" 等。表示側の分岐に使う。
  /// URL だけ持っていてもライセンス表記ができないので必ず併せて持つ。
  imageSource  String?
  /// 出典・ライセンス表記。commons のときは必須。
  imageCredit  String?
  imageLink    String?
  /// 画像の下に出す説明。何が写っているかと、本文のどこに効くかを書く。
  imageCaption String?

  displayOrder Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([attractionId, displayOrder])
}
```

### kind の定義

| kind | 既定ラベル | 中身 |
| --- | --- | --- |
| `highlight` | 見どころ | 何を見るか。visitFlow がある場合は表示側で伏せる |
| `history` | 歴史 | 成り立ち、建築、変遷 |
| `trivia` | 豆知識 | 逸話、由来、驚きのある事実 |
| `practical` | 訪問のヒント | 服装、年齢制限、混雑、飲食、ショップ |
| `context` | （個別に指定） | そのスポット固有の話（「跳ね橋の仕組み」など） |

`imageSource` 系を4つ持たせるのは `BrandImage` / `Souvenir` の先例に合わせたため。
Commons の画像は作者名とライセンスの表記が要るので、URL だけでは正しく描けない。

## 事実の受け皿

`facts` 393節の行き先。既存カラムで足りない部分だけ新設する。

```prisma
/// 交通手段ごとのアクセス。
///
/// 既存の nearestStation(String?) は1行しか持てず、84/135しか埋まっていない。
/// 一方「アクセス」節141件の中には、バス86件・船17件・自転車27件の記述がある。
/// 1行に詰め込むと情報が落ちるので、手段ごとに分ける。
model AttractionAccess {
  id           Int        @id @default(autoincrement())
  attractionId String
  attraction   Attraction @relation(fields: [attractionId], references: [id], onDelete: Cascade)

  /// "tube" | "rail" | "bus" | "boat" | "cycle" | "walk"
  mode         String
  /// "Tower Hill (District, Circle) 徒歩5分" のような1行。
  detail       String
  displayOrder Int @default(0)

  @@index([attractionId, displayOrder])
}
```

## 手作業が要る69件

### review 31件（3,386字）

自動分類できなかったもの。「高さと構造」「改修工事」「雨天時の過ごし方」
「試合日のツアー」など、**内容は良いが見出しが独特**なもの。
`kind` を人が決めて `heading` にその見出しを残す。

### 概要の退避候補 38件

「概要」を消す前に、summary に無い**数値を伴う事実**が入っているもの。

- BTタワー「1965年・177m」
- ザ・シャード「68・69階・72階」
- セント・ポール「1666年・1710年・111m・364フィート」
- 自然史博物館「1753年・1881年・8,000万点」

これらは `history` か `trivia` へ退避してから概要を消す。

## 進め方

1. **この計画をレビュー**（いまここ）
2. `AttractionStory` と `AttractionAccess` を追加。**旧 `AttractionSection` は残す**
3. 移行スクリプト（ドライラン既定・`--apply` で投入）
   - 自動分類ぶんを一括投入
   - 69件は個別の割り当て表をスクリプト内に持つ
4. 表示側を `AttractionStory` に切り替え。旧モデルは読まなくなるが**まだ消さない**
5. 本番で問題がないことを確認してから、別コミットで `AttractionSection` を削除

4と5を分けるのは、表示を切り替えた直後に問題が出たときへ戻せるようにするため。
移行スクリプトは冪等にし、何度流しても同じ結果になるようにする。

## 確認したいこと

- `kind` は5つで足りるか。`context` に逃がす想定だが、
  たとえば「食事・ショップ」を `practical` から独立させたほうがよいか
- 画像は当面すべて null になる見込み。先に列だけ用意しておく方針でよいか
- `AttractionAccess` まで一度にやるか、まず `AttractionStory` だけ入れて
  事実の整理は次の段階に回すか

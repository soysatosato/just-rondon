-- 週次「今週のロンドン」と月次「今月変わったロンドン」の号に、写真の説明と
-- 出典の列を足す(2026-10)。
--
-- image の列は前からあったが、1号も写真を持たず、og:image も JSON-LD の画像も
-- 文字のカードかロゴだった。Google は Discover の画像に文字の少ない大きな写真を
-- 求めている。Commons の CC 画像は作者とライセンスの表示が利用の条件なので、
-- 写真を入れる前に出典の列を用意する。値は scripts/set-issue-photos-2026-10.ts
-- (既存の13号)と、各号の作成スクリプトが入れる。
ALTER TABLE "WeeklyBrief"
  ADD COLUMN "imageAlt" TEXT,
  ADD COLUMN "imageSource" TEXT,
  ADD COLUMN "imageCredit" TEXT,
  ADD COLUMN "imageLink" TEXT;

ALTER TABLE "MonthlyChangeIssue"
  ADD COLUMN "imageAlt" TEXT,
  ADD COLUMN "imageSource" TEXT,
  ADD COLUMN "imageCredit" TEXT,
  ADD COLUMN "imageLink" TEXT;

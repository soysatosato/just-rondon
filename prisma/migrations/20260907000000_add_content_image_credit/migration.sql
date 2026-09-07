-- コラム(Content / ContentSection)の画像に、出典表記とキャプションを持たせる。
--
-- これまで Content.image / ContentSection.image は URL しか持っていなかった。
-- 挿絵の出典は Wikimedia Commons に限っており、CC のライセンスは作者名と
-- ライセンス名の表示が条件なので、URL だけを持つ形は条件を満たせない。
-- AttractionStory / BrandImage / Souvenir では最初からこの4列を組にして
-- 持たせている(components/shared/ImageCredit.tsx が imageSource で表記を
-- 分岐する)。コラムだけが例外になっていた。
--
-- ContentSection 側にも同じ列を足すのは、長いコラムでは節ごとに写真が
-- 要るため。「K1はこういう箱だった」という節にK1の写真が無いと、文章が
-- 形の説明に文字数を使うことになる。写真は節に紐づく——別の節の写真を
-- 置くと意味が反転するので、Content にまとめて持たせることはしない。
--
-- imageCaption を別に持つのは、キャプションが「何が写っているか」ではなく
-- 「その写真が本文のどの主張を裏付けるか」を書く場所だから。alt(=見出し)で
-- 代用できない。

ALTER TABLE "Content" ADD COLUMN "imageSource" TEXT;
ALTER TABLE "Content" ADD COLUMN "imageCredit" TEXT;
ALTER TABLE "Content" ADD COLUMN "imageLink" TEXT;
ALTER TABLE "Content" ADD COLUMN "imageCaption" TEXT;

ALTER TABLE "ContentSection" ADD COLUMN "imageSource" TEXT;
ALTER TABLE "ContentSection" ADD COLUMN "imageCredit" TEXT;
ALTER TABLE "ContentSection" ADD COLUMN "imageLink" TEXT;
ALTER TABLE "ContentSection" ADD COLUMN "imageCaption" TEXT;

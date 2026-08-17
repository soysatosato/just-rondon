-- CreateTable
-- AttractionSection の後継。旧テーブルは残したまま並行運用する。
--
-- 旧 AttractionSection は title が自由文字列だったため、135スポットで
-- 172種類の見出しが生まれ、うち138種類は1件しか使われていなかった
-- (「アクセス」「アクセス方法」「所在地」「場所」がすべて同義)。
-- 表示側は見出しを正規表現で推測するしかなく、実際 isRedundantOverview() は
-- 145件の「概要」に対して0件しか検出できていない。
--
-- kind を固定値(highlight/history/trivia/practical/context)に限定し、
-- 表示用の見出しは heading に分離する。並び順・重複判定・非表示の判断は
-- すべて kind で行う。
--
-- 画像は URL 単体で持たない。Commons の画像は作者名とライセンスの表記を
-- 要求するので、URL だけだと正しく描画できない。BrandImage / Souvenir と
-- 同じ4点セットにそろえている。当面はほぼ null の見込み。
CREATE TABLE "AttractionStory" (
    "id" SERIAL NOT NULL,
    "attractionId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "heading" TEXT,
    "body" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageSource" TEXT,
    "imageCredit" TEXT,
    "imageLink" TEXT,
    "imageCaption" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttractionStory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttractionStory_attractionId_displayOrder_idx" ON "AttractionStory"("attractionId", "displayOrder");

-- AddForeignKey
-- スポットが消えたら読み物も消す。旧 AttractionSection は onDelete 未指定
-- (= Restrict)だったが、こちらは Cascade にそろえる。visitFlow と同じ扱い。
ALTER TABLE "AttractionStory" ADD CONSTRAINT "AttractionStory_attractionId_fkey" FOREIGN KEY ("attractionId") REFERENCES "Attraction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

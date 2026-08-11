-- 館ごとの「必見ポイント」。
-- Artwork は画像・作者を伴う作品単位のデータで6館しか揃っておらず、
-- 残り41館の見どころセクションが空になっていた。展示室・建築・体験など
-- 作品以外も指せる軽いテキストとして別テーブルに持つ。
CREATE TABLE "Highlight" (
    "id" TEXT NOT NULL,
    "museumId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "location" TEXT,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Highlight_museumId_idx" ON "Highlight"("museumId");

ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_museumId_fkey"
    FOREIGN KEY ("museumId") REFERENCES "Museum"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

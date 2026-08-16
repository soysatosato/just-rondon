-- AlterTable
-- notes(自由記述)を3つに割る。すべて nullable で、既存の notes は残す。
--
-- 分割するのは、1つの箱に混ざっていた「予約時に読むもの(座席)」と
-- 「当日に読むもの(入口・クローク・トイレ)」が、読むタイミングの
-- 違うものだったため。分けると各項目を厚く書く圧力もかかる。
--
-- 既存の notes は落とさない。31劇場ぶんの書き直しが済むまで
-- 表示側のフォールバックに要る。
ALTER TABLE "Theatre" ADD COLUMN     "intro" TEXT,
ADD COLUMN     "seatingNotes" TEXT,
ADD COLUMN     "visitNotes" TEXT;

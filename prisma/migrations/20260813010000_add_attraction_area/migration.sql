-- AlterTable
-- エリアガイド(/sightseeing/areas)用の街区。nullable。
-- 既存行は NULL のまま入り、scripts/assign-attraction-areas.ts で埋める。
-- 値は components/sightseeing/areas/areas.ts の AreaSlug と一致させること。
ALTER TABLE "Attraction" ADD COLUMN     "area" TEXT;

-- CreateIndex
-- ハブと各エリアページが area で全件を引くので、都度のシーケンシャルスキャンを避ける。
CREATE INDEX "Attraction_area_idx" ON "Attraction"("area");

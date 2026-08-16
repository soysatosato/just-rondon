-- CreateTable
-- 劇場。Musical から theatreName / address / lat / lng を切り出したもの。
-- 作品より寿命が長く、作品が移動しても劇場側の情報は残るため別テーブルにする。
CREATE TABLE "Theatre" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameJa" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "nearestStation" TEXT,
    "capacity" INTEGER,
    "operator" TEXT,
    "notes" TEXT,
    "lastVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Theatre_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Theatre_slug_key" ON "Theatre"("slug");

-- AlterTable
-- theatreId は nullable のまま入れる。既存31行は NULL で残り、
-- scripts/migrate-musical-theatres.ts が theatreName から Theatre を作って紐付ける。
-- theatreName はここでは落とさない。紐付けが済むまで表示側のフォールバックに要る。
ALTER TABLE "Musical" ADD COLUMN     "theatreId" TEXT;

-- AlterTable
-- 上演時間・年齢・英語まわりの実用情報。すべて nullable。
-- 推定値を入れないため、確認できた作品だけを後から埋める。
ALTER TABLE "Musical" ADD COLUMN     "runtimeMinutes" INTEGER,
ADD COLUMN     "intervalMinutes" INTEGER,
ADD COLUMN     "minAgeGuidance" INTEGER,
ADD COLUMN     "englishForm" TEXT,
ADD COLUMN     "englishNote" TEXT,
ADD COLUMN     "factsVerifiedAt" TIMESTAMP(3);

-- AddForeignKey
-- 劇場は作品より寿命が長い。劇場行を消しても作品は残すため SET NULL。
ALTER TABLE "Musical" ADD CONSTRAINT "Musical_theatreId_fkey" FOREIGN KEY ("theatreId") REFERENCES "Theatre"("id") ON DELETE SET NULL ON UPDATE CASCADE;

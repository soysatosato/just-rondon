-- BrandImage に orientation を足す。
--
-- 本文中の図版は一律 16:9 のクロップ表示だったが、人物の全身や
-- 縦長の商品写真(トレンチコートなど)は 16:9 だと主題が切れてしまう。
-- 表示アスペクト比を画像ごとに選べるようにする。既存行はすべて
-- これまで通りの landscape(16:9) のままにする。
ALTER TABLE "BrandImage" ADD COLUMN "orientation" TEXT NOT NULL DEFAULT 'landscape';

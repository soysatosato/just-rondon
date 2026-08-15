-- AlterTable
-- isOnShow と theatreName を人が最後に確認した日。nullable。
--
-- 既存行は NULL(未確認)のまま入る。ここで created/updatedAt を初期値に
-- 流用しない。流用すると全31行が「確認済み」として埋まり、実際には
-- 誰も確かめていない終演済みの公演が棚卸しの対象から外れてしまう。
-- 未確認は未確認として残すのが、この列を足す目的に適う。
ALTER TABLE "Musical" ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3);

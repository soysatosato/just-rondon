-- 観光スポットに「ロンドンパスの対象か」を持たせる。
--
-- /sightseeing/passes で損益分岐を出したが、読者がそのページから
-- 得た判断を各スポットのページに持ち込めなかった。ロンドン塔の
-- ページを開いた人が「これはパスに入っているのか」を知る手段が
-- サイト内に無く、Go City の一覧を自分で照合するしかない。
--
-- boolean だけにしないのは、対象ではあるが条件が付く行があるため。
-- 乗り降り自由バスは Big Bus 社の2日券だけが対象で、他社のバスには
-- 乗れない。これを false にすると読者は「対象外」と読み、
-- 注記なしの true にすると他社のバスに乗ろうとする。
--
-- 立てる条件は schema.prisma のコメントを参照。要点は
-- 「元から無料の館には立てない」——パスが付けるのは音声ガイドで
-- あって入場料ではなく、そこに対象と出すと記事の結論と矛盾する。

ALTER TABLE "Attraction" ADD COLUMN "londonPass" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Attraction" ADD COLUMN "londonPassNote" TEXT;

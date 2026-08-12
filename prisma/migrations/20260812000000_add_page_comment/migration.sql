-- 節約Tips(/food)の記事に読者の実践している工夫を投稿してもらう欄を設ける。
-- 将来コラムやアトラクションでも同じ欄を出せるようにしたいため、
-- セクションごとにテーブルを増やす作りは避け、対象を種類+識別子で持つ1枚にした。
--
-- 既存の掲示板 Post/Comment は postId 必須で Post への外部キーを持つため、
-- 静的な記事ページに紐づけるにはダミーの Post が必要になる。別系統として切る。
--
-- targetKey: slug(food / column)と uuid(attraction / museum)が混在するので TEXT。
--            外部キーは張らないため、対象が消えてもコメントは残る。
-- isHidden:  荒らしは物理削除せず論理削除で隠す。通報対応の履歴を残すため。
CREATE TYPE "CommentTargetType" AS ENUM ('FOOD_TIP', 'COLUMN', 'ATTRACTION', 'MUSEUM', 'HOUSING');

CREATE TABLE "PageComment" (
    "id" TEXT NOT NULL,
    "targetType" "CommentTargetType" NOT NULL,
    "targetKey" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "sessionId" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "PageComment_pkey" PRIMARY KEY ("id")
);

-- 「この記事のコメントを新しい順に」しか引かないため、この複合インデックス1本で足りる。
CREATE INDEX "PageComment_targetType_targetKey_createdAt_idx"
    ON "PageComment"("targetType", "targetKey", "createdAt");

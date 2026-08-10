-- Souvenir にブランド公式 Instagram 投稿の埋め込み用列を足す。
-- Restaurant / Brand と同じ扱い。NULL 可なので既存行はそのまま通る。
ALTER TABLE "Souvenir" ADD COLUMN "instagramUrl" TEXT;

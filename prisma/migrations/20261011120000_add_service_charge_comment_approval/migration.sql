-- サービスチャージ調査の自由記述を承認制にする(2026-10)。
--
-- 自由記述は店名と並んで公開され、特定の人への非難(「オーナーのモラハラ」
-- など)がそのまま載っていた(AdSense 不承認後の監査で発覚)。店舗ページを
-- noindex にしても URL を知っていれば読めるので、文章は運営者が確かめた
-- ものだけを出す。既存の回答も null から始め、/admin/service-charges で
-- 1件ずつ承認する。
ALTER TABLE "ServiceCharge" ADD COLUMN "commentsApprovedAt" TIMESTAMP(3);

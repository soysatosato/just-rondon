-- Supabase のデータ API(PostgREST)から public スキーマを閉じる。
--
-- Supabase は public に作ったテーブルへ、既定で anon(未ログイン)と
-- authenticated に全権限(TRUNCATE まで)を付ける。RLS も無効だったので、
-- プロジェクトの URL と anon 鍵があれば、データ API 経由で全テーブルを
-- 読み書き・全消去できる状態だった(2026-10-29、Supabase の診断で63表)。
--
-- このサイトはデータ API を使っていない。読み書きはすべて Prisma が
-- postgres ロールで行い、postgres は BYPASSRLS を持つので、ここで RLS を
-- 有効にしても(ポリシーは作らない)サイトの動きは変わらない。
--
-- 既定の権限(default privileges)も外すのは、今後のマイグレーションで
-- 作るテーブルに同じ権限が付き直さないようにするため。
--
-- anon などは Supabase にしか無いロールなので、無い環境(素の Postgres の
-- shadow DB など)では権限の操作を飛ばす。
--
-- 本番には 2026-10-29 にこのファイルを1テーブルずつ当て、migrate resolve
-- --applied で記録した。1つのトランザクションで63表をロックすると、サイトの
-- 読み込みとロックの順番が食い違ってデッドロックになったため。

DO $$
DECLARE
  r record;
BEGIN
  FOR r IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
  END LOOP;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
    REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
    REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;

    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
      REVOKE ALL ON TABLES FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
      REVOKE ALL ON SEQUENCES FROM anon, authenticated;
    ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
      REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
  END IF;
END $$;

-- 入場料の変更履歴を残すトリガー関数。search_path を固定しないと、
-- 呼び出し側の search_path で別のスキーマのテーブルを指しうる。
ALTER FUNCTION public.record_attraction_price_change() SET search_path = public, pg_temp;

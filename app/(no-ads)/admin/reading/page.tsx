import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/utils/db";
import { isAdmin } from "@/lib/admin";
import { noindexMetadata } from "@/lib/seo";
import {
  SCHEDULE_RULES,
  SCHEDULED_CATEGORIES,
  formatJst,
  formatLondon,
  londonDate,
  nearestSlotDate,
  nextDailySlot,
  slotFor,
  type ScheduledCategory,
} from "@/lib/publish-schedule";
import {
  ApproveForm,
  RescheduleForm,
  UnscheduleForm,
} from "@/components/admin/ScheduleForms";

export const dynamic = "force-dynamic";

export const metadata = noindexMetadata("読み物の管理");

/** 「最近公開した記事」に出す本数。 */
const RECENT_TAKE = 5;
/** コラムの予約がこの日数を切ったら目立たせる。 */
const COLUMN_STOCK_WARN_DAYS = 7;

const SELECT = {
  id: true,
  category: true,
  slug: true,
  title: true,
  engTitle: true,
  createdAt: true,
  publishedAt: true,
} as const;

const BADGE: Record<ScheduledCategory, string> = {
  column: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  "british-english":
    "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
  "modern-britain":
    "bg-indigo-100 text-indigo-900 dark:bg-indigo-950 dark:text-indigo-200",
};

type Row = {
  id: string;
  category: string;
  slug: string;
  title: string;
  engTitle: string | null;
  createdAt: Date;
  publishedAt: Date | null;
};

function previewHref(row: Row) {
  return `/api/admin/preview?path=${encodeURIComponent(`/${row.category}/${row.slug}`)}`;
}

function CategoryBadge({ category }: { category: ScheduledCategory }) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-bold ${BADGE[category]}`}
    >
      {SCHEDULE_RULES[category].label}
    </span>
  );
}

function Heading({ row }: { row: Row }) {
  return (
    <p className="mt-1 font-semibold leading-snug">
      {row.category === "british-english" && row.engTitle && (
        <span className="mr-2">{row.engTitle}</span>
      )}
      <span
        className={
          row.category === "british-english" && row.engTitle
            ? "text-sm font-normal text-muted-foreground"
            : ""
        }
      >
        {row.title}
      </span>
    </p>
  );
}

function When({ at }: { at: Date }) {
  return (
    <span className="text-xs text-muted-foreground">
      ロンドン {formatLondon(at)} / 日本 {formatJst(at)}
    </span>
  );
}

/**
 * 読み物の管理ページ。下書きをプレビューして承認し、予約に入れる。
 * 要件は docs/reading-scheduled-publishing.md §4。
 *
 * 運営者以外には404を返す(ページがあることも知らせない)。
 */
export default async function ReadingAdminPage() {
  if (!isAdmin()) notFound();

  const now = new Date();
  const category = { in: SCHEDULED_CATEGORIES };
  const [drafts, queued, recent, latestColumn] = await Promise.all([
    db.content.findMany({
      where: { category, publishedAt: null },
      orderBy: { createdAt: "asc" },
      select: SELECT,
    }),
    db.content.findMany({
      where: { category, publishedAt: { gt: now } },
      orderBy: { publishedAt: "asc" },
      select: SELECT,
    }),
    db.content.findMany({
      where: { category, publishedAt: { lte: now } },
      orderBy: { publishedAt: "desc" },
      take: RECENT_TAKE,
      select: SELECT,
    }),
    db.content.findFirst({
      where: { category: "column", publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      select: { publishedAt: true },
    }),
  ]);

  const today = londonDate(now);
  const nextColumnSlot = nextDailySlot(
    "column",
    latestColumn?.publishedAt ?? null,
    now,
  );

  // コラムは毎日1本なので、予約が入っている日の数が「あと何日分」。
  const columnDays = new Set(
    queued
      .filter((r) => r.category === "column")
      .map((r) => londonDate(r.publishedAt!)),
  );
  const columnStockLow = columnDays.size < COLUMN_STOCK_WARN_DAYS;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">読み物の管理</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        下書きをプレビューで読み、承認すると予約に入ります。文章の修正はチャットで
        Claude に伝えてください。
      </p>

      {/* 公開ルール。日本時間は夏冬で変わるので、直近の枠で出す。 */}
      <section className="mt-6 grid gap-2 sm:grid-cols-3">
        {SCHEDULED_CATEGORIES.map((c) => {
          const slot = slotFor(c, nearestSlotDate(c, now))!;
          const rule = SCHEDULE_RULES[c];
          return (
            <div key={c} className="rounded-lg border p-3 text-sm">
              <CategoryBadge category={c} />
              <p className="mt-1.5 font-semibold">
                ロンドン {rule.hour}:{String(rule.minute).padStart(2, "0")}
              </p>
              <p className="text-xs text-muted-foreground">
                日本 {formatJst(slot).split(" ")[1]}・
                {rule.cadence === "daily" ? "毎日" : "不定期"}
              </p>
            </div>
          );
        })}
      </section>

      <section
        className={`mt-4 rounded-lg border p-4 text-sm ${
          columnStockLow
            ? "border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
            : ""
        }`}
      >
        <p className="font-semibold">
          コラムの予約: あと {columnDays.size} 日分
          {columnStockLow && "(残り少なくなっています)"}
        </p>
        <p className="mt-0.5 text-xs">
          次に承認したコラムは ロンドン {formatLondon(nextColumnSlot)} / 日本{" "}
          {formatJst(nextColumnSlot)} に入ります。予約が尽きた日はコラムを休みます。
        </p>
      </section>

      <section className="mt-10">
        <h2 className="border-b pb-2 text-lg font-semibold">
          下書き({drafts.length})
        </h2>
        {drafts.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">下書きはありません。</p>
        )}
        <ul className="divide-y">
          {drafts.map((row) => {
            const c = row.category as ScheduledCategory;
            const daily = SCHEDULE_RULES[c].cadence === "daily";
            return (
              <li key={row.id} className="py-4">
                <div className="flex items-center gap-2">
                  <CategoryBadge category={c} />
                  <span className="text-xs text-muted-foreground">
                    作成 {formatJst(row.createdAt)}(日本)
                  </span>
                </div>
                <Heading row={row} />
                <div className="mt-2 flex flex-wrap items-start gap-3">
                  <a
                    href={previewHref(row)}
                    className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-accent"
                  >
                    プレビュー
                  </a>
                  <ApproveForm
                    id={row.id}
                    nextSlotLabel={
                      daily ? formatLondon(nextColumnSlot) : undefined
                    }
                    defaultDate={nearestSlotDate(c, now)}
                    minDate={today}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="border-b pb-2 text-lg font-semibold">
          予約中({queued.length})
        </h2>
        {queued.length === 0 && (
          <p className="mt-3 text-sm text-muted-foreground">予約はありません。</p>
        )}
        <ul className="divide-y">
          {queued.map((row) => (
            <li key={row.id} className="py-4">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={row.category as ScheduledCategory} />
                <When at={row.publishedAt!} />
              </div>
              <Heading row={row} />
              <div className="mt-2 flex flex-wrap items-start gap-3">
                <a
                  href={previewHref(row)}
                  className="inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium hover:bg-accent"
                >
                  プレビュー
                </a>
                <RescheduleForm
                  id={row.id}
                  defaultDate={londonDate(row.publishedAt!)}
                  minDate={today}
                />
                <UnscheduleForm id={row.id} />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="border-b pb-2 text-lg font-semibold">最近公開した記事</h2>
        <ul className="divide-y">
          {recent.map((row) => (
            <li key={row.id} className="py-3">
              <div className="flex flex-wrap items-center gap-2">
                <CategoryBadge category={row.category as ScheduledCategory} />
                <When at={row.publishedAt!} />
              </div>
              <Link
                href={`/${row.category}/${row.slug}`}
                className="mt-1 block font-semibold leading-snug hover:underline"
              >
                {row.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Prisma } from "@prisma/client";
import db from "@/utils/db";
import { isAdminSession } from "@/lib/admin";
import { noindexMetadata } from "@/lib/seo";
import { formatJst } from "@/lib/publish-schedule";
import { storePath, storeSlug } from "@/lib/jobs/store-slug";
import { ApproveCommentsForm } from "@/components/admin/ServiceChargeForms";

export const dynamic = "force-dynamic";

export const metadata = noindexMetadata("サービスチャージの自由記述");

/** 自由記述が1欄でもある回答。 */
const HAS_COMMENT: Prisma.ServiceChargeWhereInput = {
  OR: [
    { serviceChargeComment: { not: null } },
    { mealComment: { not: null } },
    { generalComment: { not: null } },
  ],
};

const FILTERS = {
  pending: { label: "未掲載", where: { commentsApprovedAt: null } },
  approved: { label: "掲載中", where: { commentsApprovedAt: { not: null } } },
} satisfies Record<
  string,
  { label: string; where: Prisma.ServiceChargeWhereInput }
>;

type Filter = keyof typeof FILTERS;

function isFilter(value: unknown): value is Filter {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(FILTERS, value)
  );
}

const COMMENT_FIELDS = [
  ["serviceChargeComment", "サービスチャージについて"],
  ["mealComment", "賄いについて"],
  ["generalComment", "その他"],
] as const;

/**
 * サービスチャージ調査の自由記述を、載せるか決めるページ。
 * 新しい回答の通知メールから #r-{id} 付きで開かれる。
 *
 * 承認するまで文章はどの画面にも出ない(utils/actions/jobs.ts の
 * withApprovedComments)。選択式の答えは承認と関係なく集計に入る。
 *
 * 運営者以外には404を返す(ページがあることも知らせない)。
 */
export default async function ServiceChargeCommentsAdminPage({
  searchParams,
}: {
  searchParams: { filter?: string };
}) {
  if (!(await isAdminSession())) notFound();

  const filter: Filter = isFilter(searchParams.filter)
    ? searchParams.filter
    : "pending";

  const [rows, counts] = await Promise.all([
    db.serviceCharge.findMany({
      where: { AND: [HAS_COMMENT, FILTERS[filter].where] },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        placeId: true,
        storeName: true,
        postcode: true,
        createdAt: true,
        commentsApprovedAt: true,
        serviceChargeComment: true,
        mealComment: true,
        generalComment: true,
      },
    }),
    Promise.all(
      Object.values(FILTERS).map(({ where }) =>
        db.serviceCharge.count({ where: { AND: [HAS_COMMENT, where] } }),
      ),
    ),
  ]);
  const countOf = Object.fromEntries(
    Object.keys(FILTERS).map((key, i) => [key, counts[i]]),
  ) as Record<Filter, number>;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">サービスチャージの自由記述</h1>
        <Link
          href="/admin/reading"
          className="text-sm text-muted-foreground underline underline-offset-2"
        >
          読み物の管理
        </Link>
      </div>
      <div className="mt-1 space-y-2 text-sm text-muted-foreground">
        <p>
          載せた文章は、店名と一緒に店舗ページと声の一覧に出ます。載せるまでは
          選択式の答えだけが出ます。
        </p>
        <p>
          載せないもの: 特定の人(オーナー・店長など)への非難、違法・犯罪だと
          言い切っているもの、個人が特定できる情報。働いた人の体験として
          書かれた事実(「キッチンには渡っていない」「総額を教えてもらえなかった」)は
          載せてよい。
        </p>
      </div>

      <nav className="mt-6 flex gap-2 border-b pb-3 text-sm">
        {(Object.keys(FILTERS) as Filter[]).map((key) => (
          <Link
            key={key}
            href={
              key === "pending"
                ? "/admin/service-charges"
                : `/admin/service-charges?filter=${key}`
            }
            className={`rounded-md px-3 py-1.5 ${
              key === filter
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {FILTERS[key].label}({countOf[key]})
          </Link>
        ))}
      </nav>

      {rows.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">
          該当する回答はありません。
        </p>
      )}

      <ul className="divide-y">
        {rows.map((r) => (
          <li key={r.id} id={`r-${r.id}`} className="scroll-mt-6 py-5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <Link
                href={storePath(storeSlug(r))}
                className="font-bold text-foreground underline underline-offset-2"
              >
                {r.storeName || "(店舗名なし)"}
              </Link>
              <span>{formatJst(r.createdAt)}(日本)に回答</span>
              {r.commentsApprovedAt && (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
                  {formatJst(r.commentsApprovedAt)}に掲載
                </span>
              )}
            </div>

            <dl className="mt-3 space-y-3">
              {COMMENT_FIELDS.map(([field, label]) =>
                r[field] ? (
                  <div key={field}>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
                      {r[field]}
                    </dd>
                  </div>
                ) : null,
              )}
            </dl>

            <div className="mt-3">
              <ApproveCommentsForm
                id={r.id}
                approved={Boolean(r.commentsApprovedAt)}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

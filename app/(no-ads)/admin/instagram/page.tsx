import Link from "next/link";
import { notFound } from "next/navigation";
import db from "@/utils/db";
import { isAdmin } from "@/lib/admin";
import { noindexMetadata } from "@/lib/seo";
import { isIgCategory, type IgCategory } from "@/lib/instagram/limits";
import {
  IG_BIO_URL,
  articlePath,
  composeIgCaption,
  igSlideUrls,
} from "@/lib/instagram/caption";
import {
  IG_SLOT_HOUR_JST,
  formatIgSlot,
  igSlotWeekdaysLabel,
  jstDate,
  nextIgSlot,
} from "@/lib/instagram/schedule";
import {
  CopyCaptionButton,
  IgActionForm,
  IgRescheduleForm,
  SaveSlidesButton,
} from "@/components/admin/InstagramForms";

export const dynamic = "force-dynamic";

export const metadata = noindexMetadata("Instagramの管理");

/** 「投稿済み」に出す本数。 */
const RECENT_TAKE = 8;
/** 予約(承認済み+アプリに入れた分)がこの本数を切ったら目立たせる。週4本の1週間ぶん。 */
const STOCK_WARN = 4;

const LABEL: Record<IgCategory, { name: string; className: string }> = {
  column: {
    name: "コラム",
    className: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200",
  },
  "british-english": {
    name: "イギリス英語",
    className: "bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200",
  },
};

const INCLUDE = {
  content: {
    select: {
      category: true,
      slug: true,
      title: true,
      engTitle: true,
      image: true,
      imageSource: true,
      imageCredit: true,
      updatedAt: true,
    },
  },
} as const;

type PostRow = Awaited<ReturnType<typeof loadPosts>>[number];

function loadPosts(where: object, orderBy: object, take?: number) {
  return db.instagramPost.findMany({ where, orderBy, take, include: INCLUDE });
}

function captionOf(post: PostRow): string {
  const usesPhoto =
    post.content.category === "column" &&
    post.content.image &&
    post.content.imageSource === "commons";
  return composeIgCaption({
    caption: post.caption,
    hashtags: post.hashtags,
    credit: usesPhoto ? post.content.imageCredit : null,
  });
}

function Thumbs({ urls, ratio }: { urls: string[]; ratio: "feed" | "reel" }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {urls.map((url, i) => (
        <a
          key={url}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`relative shrink-0 overflow-hidden rounded-md border bg-muted ${
            ratio === "feed" ? "aspect-[4/5] w-28" : "aspect-[9/16] w-24"
          }`}
          title={`${i + 1}枚目を開く`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`${i + 1}枚目`}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        </a>
      ))}
    </div>
  );
}

function PostCard({ post, now }: { post: PostRow; now: Date }) {
  const category = post.content.category as IgCategory;
  const label = LABEL[category];
  const feed = igSlideUrls(post, post.content.updatedAt);
  const reel = igSlideUrls(post, post.content.updatedAt, "reel");
  const caption = captionOf(post);
  const baseName = `ig-${jstDate(post.scheduledAt ?? post.createdAt)}-${post.content.slug.slice(0, 24)}`;
  const slotPassed = post.scheduledAt && post.scheduledAt.getTime() <= now.getTime();
  const today = jstDate(now);

  return (
    <li className="rounded-lg border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${label.className}`}>
          {label.name}
        </span>
        {post.scheduledAt && (
          <span className="text-sm font-semibold">{formatIgSlot(post.scheduledAt)}</span>
        )}
      </div>
      <p className="mt-1 font-semibold leading-snug">
        {category === "british-english" && post.content.engTitle && (
          <span className="mr-2">{post.content.engTitle}</span>
        )}
        {post.coverHead}
      </p>
      <Link
        href={articlePath(category, post.content.slug)}
        className="text-xs text-muted-foreground underline underline-offset-2"
        target="_blank"
      >
        記事: {post.content.title}
      </Link>

      {post.status === "approved" && slotPassed && (
        <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">
          投稿時刻を過ぎています。日付を変更してからアプリに入れてください。
        </p>
      )}

      <div className="mt-3">
        <Thumbs urls={feed} ratio="feed" />
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-muted-foreground">
          リール用(縦長)の5枚
        </summary>
        <div className="mt-2">
          <Thumbs urls={reel} ratio="reel" />
        </div>
      </details>

      <details className="mt-2">
        <summary className="cursor-pointer text-xs text-muted-foreground">
          キャプション
        </summary>
        <pre className="mt-2 whitespace-pre-wrap rounded-md bg-muted p-3 font-sans text-xs leading-relaxed">
          {caption}
        </pre>
      </details>

      <div className="mt-3 flex flex-wrap items-start gap-2">
        {(post.status === "approved" || post.status === "queued") && (
          <>
            <SaveSlidesButton urls={feed} baseName={baseName} label="5枚を保存" />
            <SaveSlidesButton
              urls={reel}
              baseName={`${baseName}-reel`}
              label="リール用を保存"
            />
            <CopyCaptionButton text={caption} />
          </>
        )}
        {post.status === "draft" && (
          <>
            <IgActionForm id={post.id} action="approve" label="承認して次の枠に入れる" />
            <IgActionForm id={post.id} action="reject" label="不採用" variant="outline" />
          </>
        )}
        {post.status === "approved" && (
          <>
            <IgActionForm id={post.id} action="queue" label="アプリの予約に入れた" />
            <IgActionForm
              id={post.id}
              action="unschedule"
              label="下書きに戻す"
              variant="outline"
            />
          </>
        )}
        {post.status === "queued" && !slotPassed && (
          <IgActionForm
            id={post.id}
            action="unqueue"
            label="承認済みに戻す"
            variant="outline"
          />
        )}
      </div>
      {post.status === "approved" && post.scheduledAt && (
        <div className="mt-2">
          <IgRescheduleForm
            id={post.id}
            defaultDate={slotPassed ? today : jstDate(post.scheduledAt)}
            minDate={today}
          />
        </div>
      )}
    </li>
  );
}

function Section({
  title,
  note,
  posts,
  now,
  empty,
}: {
  title: string;
  note?: string;
  posts: PostRow[];
  now: Date;
  empty: string;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-lg font-semibold">
        {title} <span className="text-sm font-normal text-muted-foreground">{posts.length}本</span>
      </h2>
      {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
      {posts.length ? (
        <ul className="mt-3 space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} now={now} />
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">{empty}</p>
      )}
    </section>
  );
}

/**
 * Instagram のカルーセル投稿の管理ページ(成長施策 C7 の第1段階)。
 *
 * 原稿は /add-instagram スキルが下書きで入れる。ここで5枚を見て承認すると
 * 次の枠(日本時間21:00)が入り、運営者が5枚を保存して Instagram アプリの
 * 予約投稿に入れる。入れたら「アプリの予約に入れた」を押す。
 * /ig(プロフィールのリンク先)には、予約に入れて時刻を過ぎた投稿だけが出る。
 *
 * 運営者以外には404を返す。
 */
export default async function InstagramAdminPage() {
  if (!isAdmin()) notFound();

  const now = new Date();
  const ig = { content: { category: { in: ["column", "british-english"] } } };
  const [approved, drafts, queued, posted] = await Promise.all([
    loadPosts({ ...ig, status: "approved" }, { scheduledAt: "asc" }),
    loadPosts({ ...ig, status: "draft" }, { createdAt: "asc" }),
    loadPosts({ ...ig, status: "queued", scheduledAt: { gt: now } }, { scheduledAt: "asc" }),
    loadPosts(
      { ...ig, status: "queued", scheduledAt: { lte: now } },
      { scheduledAt: "desc" },
      RECENT_TAKE,
    ),
  ]);
  const visible = (rows: PostRow[]) => rows.filter((p) => isIgCategory(p.content.category));

  const latest = [...approved, ...queued]
    .map((p) => p.scheduledAt!)
    .sort((a, b) => b.getTime() - a.getTime())[0];
  const nextSlot = nextIgSlot(latest ?? null, now);
  const stock = approved.length + queued.length;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">Instagramの管理</h1>
        <Link
          href="/admin/reading"
          className="text-sm text-muted-foreground underline underline-offset-2"
        >
          読み物の管理
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        承認すると次の枠に入ります。スマホでこのページを開き「5枚を保存」→
        Instagram アプリで5枚を選び、キャプションを貼って予約投稿に入れたら
        「アプリの予約に入れた」を押してください。原稿の修正はチャットで Claude に。
      </p>

      <section className="mt-6 grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border p-3 text-sm">
          <p className="text-xs text-muted-foreground">投稿枠(日本時間)</p>
          <p className="mt-1 font-semibold">
            {igSlotWeekdaysLabel()} {IG_SLOT_HOUR_JST}:00
          </p>
        </div>
        <div className="rounded-lg border p-3 text-sm">
          <p className="text-xs text-muted-foreground">次に承認した投稿の枠</p>
          <p className="mt-1 font-semibold">{formatIgSlot(nextSlot)}</p>
        </div>
        <div
          className={`rounded-lg border p-3 text-sm ${
            stock < STOCK_WARN ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950" : ""
          }`}
        >
          <p className="text-xs text-muted-foreground">予約の残り</p>
          <p className="mt-1 font-semibold">{stock}本</p>
          {stock < STOCK_WARN && (
            <p className="text-xs text-red-700 dark:text-red-300">
              1週間ぶんを切っています。/add-instagram で作ってください。
            </p>
          )}
        </div>
      </section>

      <Section
        title="アプリに入れる"
        note="承認済みで、まだ Instagram アプリの予約に入れていない投稿。"
        posts={visible(approved)}
        now={now}
        empty="ありません。"
      />
      <Section
        title="下書き"
        posts={visible(drafts)}
        now={now}
        empty="下書きはありません。/add-instagram で追加してください。"
      />
      <Section
        title="予約済み"
        note="アプリの予約に入れた投稿。時刻が来ると Instagram に出て、/ig にも載ります。"
        posts={visible(queued)}
        now={now}
        empty="ありません。"
      />
      <Section
        title="投稿済み"
        posts={visible(posted)}
        now={now}
        empty="まだありません。"
      />

      <section className="mt-12 rounded-lg border p-4 text-xs leading-relaxed text-muted-foreground">
        <p className="font-semibold text-foreground">プロフィールに貼るリンク</p>
        <p className="mt-1 break-all font-mono">{IG_BIO_URL}</p>
        <p className="mt-1">
          計測用の印(utm)付き。GA4 で Instagram から来た人数を数えられます。
          リンク先 /ig には、投稿した記事が新しい順に並びます。
        </p>
      </section>
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { MapPin, Plus, Sparkles, Star, X } from "lucide-react";

import MemberDot, { memberColor } from "@/components/stamps/friends/MemberDot";
import {
  areaGuidePath,
  areaGuides,
} from "@/components/sightseeing/areas/areas";
import { cn } from "@/lib/utils";
import { MAX_TOGETHER, togetherHref } from "@/lib/stamp-friends-shared";
import {
  groupByType,
  type TogetherOverlap,
  type TogetherPlace,
} from "@/lib/stamp-together";
import { STAMP_META, type StampType } from "@/lib/stamps";

/**
 * 旅仲間とスタンプ帳を重ねた画面(/stamps/together)の中身。
 *
 * 予定を立てるための画面なので、上から「まだ誰も行っていない」
 * 「誰かが行った」「全員が行った」の順に置く。スタンプ帳(/stamps)は
 * 押したものを眺める場所で、ここはこれから行く場所を決める場所。
 *
 * まだ誰も行っていない場所は、観光スポットだけで150件を超える。
 * 全部を1列に並べると選べないので、観光スポットはエリアガイドの
 * エリアごとに分けて、1エリアを半日で回る単位として見せる。
 * どの枠も最初の数件だけを出し、残りは畳んでおく。
 */

export type TogetherMember = {
  username: string;
  /** 押した数(公開中の場所だけ)。 */
  count: number;
  /** つながりの id。自分は null。 */
  friendId: string | null;
};

/** 人数で言い方を変える。2人なら「二人とも」のほうが自然に読める。 */
function overlapLabels(memberCount: number) {
  return memberCount === 2
    ? { nobody: "二人ともまだ", some: "どちらかが行った", everyone: "二人とも行った" }
    : { nobody: "まだ誰も行っていない", some: "誰かが行った", everyone: "全員が行った" };
}

/** 枠の中で最初に出す件数。残りは「残りN件」に畳む。 */
const PREVIEW = { area: 5, list: 8, visited: 10 } as const;

const TYPE_HEADINGS: Record<StampType, string> = {
  attraction: STAMP_META.attraction.label,
  museum: STAMP_META.museum.label,
  // 上演が終わった作品は「まだ誰も」に出さないので、見出しでそう断っておく。
  musical: `${STAMP_META.musical.label}(上演中)`,
};

/* ------------------------------------------------------------------ *
 * 小さな部品
 * ------------------------------------------------------------------ */

function PlaceLink({ place }: { place: TogetherPlace }) {
  return (
    <Link
      href={STAMP_META[place.type].path(place.slug)}
      className="min-w-0 hover:text-rose-600 hover:underline dark:hover:text-rose-400"
    >
      {place.name}
      {place.mustSee && (
        <Star
          className="ml-1 inline h-3 w-3 fill-amber-400 text-amber-400"
          aria-label="定番"
        />
      )}
    </Link>
  );
}

/** 最初の数件を出し、残りを畳む一覧。 */
function Collapsible<T>({
  items,
  preview,
  render,
  className,
}: {
  items: T[];
  preview: number;
  render: (item: T) => ReactNode;
  className?: string;
}) {
  const head = items.slice(0, preview);
  const rest = items.slice(preview);
  return (
    <>
      <ul className={className}>{head.map(render)}</ul>
      {rest.length > 0 && (
        <details className="group mt-2">
          <summary className="cursor-pointer list-none text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400 [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">残り{rest.length}件を見る</span>
            <span className="hidden group-open:inline">閉じる</span>
          </summary>
          <ul className={cn("mt-2", className)}>{rest.map(render)}</ul>
        </details>
      )}
    </>
  );
}

/** 誰が行ったかの丸を並べる。 */
function Visitors({
  place,
  members,
}: {
  place: TogetherPlace;
  members: TogetherMember[];
}) {
  return (
    <span className="flex shrink-0 gap-1">
      {place.visits.map((visit) => (
        <MemberDot
          key={visit.member}
          index={visit.member}
          username={members[visit.member].username}
          onSite={visit.onSite}
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ *
 * 顔ぶれ
 * ------------------------------------------------------------------ */

function MembersBar({
  members,
  others,
}: {
  members: TogetherMember[];
  others: { friendId: string; username: string }[];
}) {
  const selectedIds = members
    .map((m) => m.friendId)
    .filter((id): id is string => id !== null);
  const full = selectedIds.length >= MAX_TOGETHER;

  return (
    <div className="space-y-3 rounded-2xl border border-border px-5 py-4">
      <ul className="flex flex-wrap gap-2">
        {members.map((member, index) => (
          <li
            key={member.friendId ?? "me"}
            className="flex items-center gap-2 rounded-full border border-border py-1 pl-1 pr-3 text-sm"
          >
            <MemberDot index={index} username={member.username} size="md" />
            <span className="font-medium [overflow-wrap:anywhere]">
              {member.friendId === null ? `${member.username}(自分)` : member.username}
            </span>
            <span className="text-xs text-muted-foreground">
              {member.count}個
            </span>
            {/* 相手が1人しかいないときは外せない。外すと比べる相手がいなくなる。 */}
            {member.friendId !== null && selectedIds.length > 1 && (
              <Link
                href={togetherHref(selectedIds.filter((id) => id !== member.friendId))}
                className="-mr-1 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`${member.username}を外す`}
                scroll={false}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </Link>
            )}
          </li>
        ))}
      </ul>

      {others.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs">
          <span className="text-muted-foreground">
            {full ? `一度に重ねられるのは${MAX_TOGETHER}人までです` : "ほかの旅仲間も重ねる"}
          </span>
          {!full &&
            others.map((other) => (
              <Link
                key={other.friendId}
                href={togetherHref([...selectedIds, other.friendId])}
                scroll={false}
                className="inline-flex items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 font-medium hover:border-rose-400 hover:text-rose-600 dark:hover:text-rose-400"
              >
                <Plus className="h-3 w-3" aria-hidden />
                <span className="[overflow-wrap:anywhere]">{other.username}</span>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}

function OverlapSummary({
  overlap,
  memberCount,
}: {
  overlap: TogetherOverlap;
  memberCount: number;
}) {
  const labels = overlapLabels(memberCount);
  const tiles = [
    { id: "nobody", label: labels.nobody, count: overlap.nobody.length, accent: true },
    { id: "some", label: labels.some, count: overlap.some.length, accent: false },
    { id: "everyone", label: labels.everyone, count: overlap.everyone.length, accent: false },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {tiles.map((tile) => (
        <a
          key={tile.id}
          href={`#${tile.id}`}
          className={cn(
            "rounded-xl border px-3 py-3 transition hover:border-rose-400 sm:px-4",
            tile.accent ? "border-rose-500/40 bg-rose-500/5" : "border-border",
          )}
        >
          <span className="block text-2xl font-semibold tabular-nums">
            {tile.count}
          </span>
          <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground sm:text-xs">
            {tile.label}
          </span>
        </a>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * まだ誰も行っていない
 * ------------------------------------------------------------------ */

/** 種別ごとに先頭の1件。まず何から行くかの答えとして、写真付きで出す。 */
function Picks({ places }: { places: TogetherPlace[] }) {
  const picks = groupByType(places).map((group) => group.places[0]);
  if (picks.length === 0) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {picks.map((place) => (
        <Link
          key={`${place.type}:${place.slug}`}
          href={STAMP_META[place.type].path(place.slug)}
          className="group flex items-center gap-3 rounded-xl border border-border p-2.5 transition hover:border-rose-400 sm:flex-col sm:items-stretch sm:p-0"
        >
          <img
            src={place.image}
            alt=""
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-lg object-cover sm:h-28 sm:w-full sm:rounded-b-none sm:rounded-t-xl"
          />
          <span className="min-w-0 sm:px-3 sm:pb-3">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {STAMP_META[place.type].label}
            </span>
            <span className="mt-0.5 block text-sm font-semibold leading-snug group-hover:underline">
              {place.name}
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}

/** 観光スポットをエリアガイドのエリアごとに。エリアの無いものは最後にまとめる。 */
function AttractionsByArea({ places }: { places: TogetherPlace[] }) {
  const areas = [
    ...areaGuides.map((area) => ({
      key: area.slug,
      label: area.label,
      href: areaGuidePath(area.slug) as string | null,
      places: places.filter((p) => p.area === area.slug),
    })),
    {
      key: "other",
      label: "そのほかのエリア",
      href: null,
      places: places.filter(
        (p) => !areaGuides.some((area) => area.slug === p.area),
      ),
    },
  ].filter((area) => area.places.length > 0);

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {areas.map((area) => (
        <div key={area.key} className="rounded-xl border border-border p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold">
              <MapPin className="h-3.5 w-3.5 text-rose-500" aria-hidden />
              {area.label}
            </h4>
            <span className="shrink-0 text-xs text-muted-foreground">
              {area.places.length}か所
            </span>
          </div>
          <Collapsible
            items={area.places}
            preview={PREVIEW.area}
            className="mt-2 space-y-1.5 text-sm"
            render={(place) => (
              <li key={place.slug}>
                <PlaceLink place={place} />
              </li>
            )}
          />
          {area.href && (
            <Link
              href={area.href}
              className="mt-3 inline-block text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
            >
              このエリアの歩き方 →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

function PlaceListCard({
  type,
  places,
}: {
  type: StampType;
  places: TogetherPlace[];
}) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold">{TYPE_HEADINGS[type]}</h4>
        <span className="shrink-0 text-xs text-muted-foreground">
          {places.length}件
        </span>
      </div>
      <Collapsible
        items={places}
        preview={PREVIEW.list}
        className="mt-2 space-y-1.5 text-sm"
        render={(place) => (
          <li key={place.slug}>
            <PlaceLink place={place} />
          </li>
        )}
      />
    </div>
  );
}

function NobodySection({
  places,
  memberCount,
}: {
  places: TogetherPlace[];
  memberCount: number;
}) {
  const labels = overlapLabels(memberCount);
  const byType = new Map(groupByType(places).map((g) => [g.type, g.places]));
  const attractions = byType.get("attraction") ?? [];
  const lists = (["museum", "musical"] as const)
    .map((type) => ({ type, places: byType.get(type) ?? [] }))
    .filter((list) => list.places.length > 0);

  return (
    <section id="nobody" className="scroll-mt-24 space-y-5">
      <div>
        <h2 className="text-lg font-semibold">{labels.nobody}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          一緒に行く候補です。
          <Star className="mx-0.5 inline h-3 w-3 fill-amber-400 text-amber-400" aria-hidden />
          の定番を先に、よく読まれている順に並べています。
        </p>
      </div>

      {places.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
          掲載している場所は、もう誰かが行っています。
        </p>
      ) : (
        <>
          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              まず行くなら
            </h3>
            <Picks places={places} />
          </div>

          {attractions.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {TYPE_HEADINGS.attraction}(エリア別)
              </h3>
              <AttractionsByArea places={attractions} />
            </div>
          )}

          {lists.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {lists.map((list) => (
                <PlaceListCard key={list.type} type={list.type} places={list.places} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 誰かが行った・全員が行った
 * ------------------------------------------------------------------ */

function SomeSection({
  places,
  members,
}: {
  places: TogetherPlace[];
  members: TogetherMember[];
}) {
  const labels = overlapLabels(members.length);
  return (
    <section id="some" className="scroll-mt-24 space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{labels.some}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          行った人に、見どころや回り方を聞いてみてください。丸が行った人で、
          <span className="mx-0.5 inline-block h-2.5 w-2.5 rounded-full ring-2 ring-amber-400" aria-hidden />
          金の輪は現地で押したスタンプです。
        </p>
      </div>

      {places.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
          まだありません。行った場所のページで「スタンプを押す」を押すと、ここに重なります。
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {groupByType(places).map((group) => (
            <div key={group.type} className="rounded-xl border border-border p-4">
              <h3 className="text-sm font-semibold">{STAMP_META[group.type].label}</h3>
              <Collapsible
                items={group.places}
                preview={PREVIEW.visited}
                className="mt-2 divide-y divide-border text-sm"
                render={(place) => (
                  <li
                    key={place.slug}
                    className="flex items-center justify-between gap-3 py-1.5"
                  >
                    <PlaceLink place={place} />
                    <Visitors place={place} members={members} />
                  </li>
                )}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function EveryoneSection({
  places,
  memberCount,
}: {
  places: TogetherPlace[];
  memberCount: number;
}) {
  const labels = overlapLabels(memberCount);
  return (
    <section id="everyone" className="scroll-mt-24 space-y-4">
      <h2 className="text-lg font-semibold">{labels.everyone}</h2>
      {places.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
          まだありません。一緒に行った場所で、それぞれがスタンプを押すとここに並びます。
        </p>
      ) : (
        <div className="space-y-4">
          {groupByType(places).map((group) => (
            <div key={group.type}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {STAMP_META[group.type].label}
              </h3>
              <ul className="mt-2 flex flex-wrap gap-2">
                {group.places.map((place) => (
                  <li key={place.slug}>
                    <Link
                      href={STAMP_META[place.type].path(place.slug)}
                      className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/5 px-3 py-1 text-xs font-medium hover:border-rose-500 hover:underline"
                    >
                      {place.visits.every((v) => v.onSite) && (
                        <Sparkles className="h-3 w-3 text-amber-500" aria-label="全員が現地で押した" />
                      )}
                      {place.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * 全体
 * ------------------------------------------------------------------ */

export default function TogetherView({
  members,
  others,
  overlap,
}: {
  /** 先頭が自分、続いて重ねている旅仲間。 */
  members: TogetherMember[];
  /** つながっているが、いま重ねていない旅仲間。 */
  others: { friendId: string; username: string }[];
  overlap: TogetherOverlap;
}) {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <MembersBar members={members} others={others} />
        <OverlapSummary overlap={overlap} memberCount={members.length} />
      </div>

      <NobodySection places={overlap.nobody} memberCount={members.length} />
      <SomeSection places={overlap.some} members={members} />
      <EveryoneSection places={overlap.everyone} memberCount={members.length} />

      {/* 色の凡例。丸の頭文字が同じ人がいても、色で見分けられるように。 */}
      <p className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-6 text-xs text-muted-foreground">
        {members.map((member, index) => (
          <span key={member.friendId ?? "me"} className="inline-flex items-center gap-1.5">
            <MemberDot index={index} username={member.username} />
            <span className={cn("font-medium", memberColor(index).text)}>
              {member.username}
            </span>
          </span>
        ))}
      </p>
    </div>
  );
}

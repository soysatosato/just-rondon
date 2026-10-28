import Link from "next/link";
import { Baby, Flame, MapPin, Tag, Ticket, TicketCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  areaGuidePath,
  getAreaMeta,
} from "@/components/sightseeing/areas/areas";
import { categoryChipMap } from "@/components/sightseeing/categories";

/**
 * 観光スポットの見出しの下に並べる印(定番・子ども向け・無料・ロンドンパス)と、
 * 区分・エリアへのリンク。
 *
 * 観光スポットの詳細ページと、観光スポットと対になる美術館のページ
 * (lib/museum-attraction-pairs.js)の両方で使う。後者でも印は Attraction の
 * 行から出す——ロンドンパスの対象や「定番」は Attraction の列にしか無い。
 */

type TaggedAttraction = {
  mustSee: boolean;
  isForKids: boolean;
  isFree: boolean;
  londonPass: boolean;
  londonPassNote: string | null;
  category: string;
  area: string | null;
};

export default function AttractionTags({
  attraction,
}: {
  attraction: TaggedAttraction;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <AttractionBadges attraction={attraction} />
        <CategoryLink category={attraction.category} />
        <AreaLink area={attraction.area} />
      </div>

      {/* 「対象だが条件付き」の但し書き。バッジに収まらないので下に出す。
          これが無いと、乗り降り自由バスのように会社が限られる対象を
          読者が無条件だと受け取る。 */}
      {attraction.londonPass && attraction.londonPassNote && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          ロンドンパス：{attraction.londonPassNote}
        </p>
      )}
    </>
  );
}

function AttractionBadges({ attraction }: { attraction: TaggedAttraction }) {
  return (
    <div className="flex flex-wrap gap-2">
      {attraction.mustSee && (
        <Badge
          className="flex items-center gap-1 
          bg-red-600 text-white 
          dark:bg-red-600
        "
        >
          <Flame className="h-3 w-3" />
          MUST SEE
        </Badge>
      )}

      {attraction.isForKids && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 
            dark:bg-neutral-800 dark:text-neutral-200
          "
        >
          <Baby className="h-3 w-3" />
          子ども向け
        </Badge>
      )}

      {attraction.isFree && (
        <Badge
          variant="secondary"
          className="flex items-center gap-1 
            dark:bg-neutral-800 dark:text-neutral-200
          "
        >
          <Ticket className="h-3 w-3" />
          無料
        </Badge>
      )}

      {/*
        ロンドンパス対象。判定ページへのリンクにしてある。
        「対象」だけを出すと買う方向にしか押さないが、対象施設が
        何か所あるかで損得が決まる商品なので、対象だと知った読者が
        次に必要なのは損益分岐のほう。バッジ単体を出口にしない。
      */}
      {attraction.londonPass && (
        <Link href="/sightseeing/passes">
          <Badge
            variant="secondary"
            className="flex items-center gap-1 border border-emerald-300
              bg-emerald-50 text-emerald-800 transition hover:border-emerald-500
              dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300
            "
          >
            <TicketCheck className="h-3 w-3" />
            ロンドンパス対象
          </Badge>
        </Link>
      )}
    </div>
  );
}

function CategoryLink({ category }: { category: string }) {
  return (
    <Link
      href={`/sightseeing/all?category=${encodeURIComponent(category)}`}
      className="inline-flex items-center gap-1 rounded-full border
        px-3 py-1 text-xs
        text-neutral-600 border-neutral-300
        transition
        hover:bg-neutral-100
        dark:text-neutral-300 dark:border-neutral-700
        dark:hover:bg-neutral-800
      "
    >
      <Tag className="h-3 w-3" />
      {categoryChipMap[category] ?? category}
    </Link>
  );
}

/**
 * このスポットが属する街区へのリンク。
 *
 * area が null のスポット(郊外、ツアー商品など)では何も出さない。
 * エリアガイドを持たない街区に飛ばすと行き止まりになるので、
 * areas.ts に定義のある slug のときだけリンクする。
 */
function AreaLink({ area }: { area: string | null }) {
  if (!area) return null;

  const meta = getAreaMeta(area);
  if (!meta) return null;

  return (
    <Link
      href={areaGuidePath(meta.slug)}
      className="inline-flex items-center gap-1 rounded-full border
        px-3 py-1 text-xs
        text-emerald-700 border-emerald-300
        transition
        hover:bg-emerald-50
        dark:text-emerald-400 dark:border-emerald-800
        dark:hover:bg-emerald-950/40
      "
    >
      <MapPin className="h-3 w-3" />
      {meta.label}を歩く
    </Link>
  );
}

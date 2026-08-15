import { Book, BadgeCheck, CalendarClock, Heart } from "lucide-react";
import { Badge } from "../ui/badge";
import RecommendStars from "./shared/RecommendStars";

/**
 * 「上映中」を人が最後に確かめてから、この日数を過ぎたら断定をやめる。
 *
 * scripts/check-musical-freshness.ts の STALE_DAYS と揃えている。
 * あちらが「そろそろ見よう」の基準、こちらが「まだ言い切ってよいか」の
 * 基準で、ずらすと棚卸しに出ていない作品が読者側で先に警告されるか、
 * その逆が起きる。
 */
const CLAIM_VALID_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

/** 上演中と言い切ってよいか。未確認(null)は言い切らない。 */
function canAssertOnShow(lastVerifiedAt: Date | null): boolean {
  if (lastVerifiedAt === null) return false;
  return Date.now() - lastVerifiedAt.getTime() < CLAIM_VALID_DAYS * DAY_MS;
}

function formatVerifiedAt(date: Date): string {
  // 「2026年8月時点」。日まで出すと確認の精度以上に正確に見える。
  return `${date.getFullYear()}年${date.getMonth() + 1}月時点`;
}

export default function MusicalInfo({
  isOnShow,
  lastVerifiedAt,
  recommendLevel,
  original,
}: {
  isOnShow: boolean;
  lastVerifiedAt: Date | null;
  recommendLevel: number;
  original: string;
}) {
  const verified = canAssertOnShow(lastVerifiedAt);
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-foreground mb-6">
        基本情報
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
        {isOnShow && (
          <InfoItem
            icon={verified ? BadgeCheck : CalendarClock}
            label="ステータス"
            value={
              verified ? (
                <div className="flex flex-col gap-1">
                  <Badge
                    variant="outline"
                    className="w-fit border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
                  >
                    上映中
                  </Badge>
                  <span className="text-xs font-normal text-muted-foreground">
                    {formatVerifiedAt(lastVerifiedAt!)}
                  </span>
                </div>
              ) : (
                // 確認が古い(または未確認)ときは緑で言い切らない。
                // ロングランでも終演は起きるので、断定したまま古い情報を
                // 出すより、公式で確かめてもらうほうが読者の実害が小さい。
                <div className="flex flex-col gap-1">
                  <Badge
                    variant="outline"
                    className="w-fit border-amber-600/40 bg-amber-600/10 text-amber-700 dark:text-amber-400"
                  >
                    公式サイトで要確認
                  </Badge>
                  <span className="text-xs font-normal text-muted-foreground">
                    上演状況の確認が取れていません
                  </span>
                </div>
              )
            }
          />
        )}
        <InfoItem
          icon={Heart}
          label="おすすめ度"
          value={
            <div className="flex items-center gap-2">
              <RecommendStars level={recommendLevel} tone="muted" />
              <span className="text-muted-foreground">{recommendLevel}/5</span>
            </div>
          }
        />
        <InfoItem icon={Book} label="原作" value={original || "情報なし"} />
      </div>
    </section>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon size={20} />
      </span>
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-medium text-foreground mt-1">
          {value}
        </div>
      </div>
    </div>
  );
}

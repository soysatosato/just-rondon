import { Book, BadgeCheck, Heart } from "lucide-react";
import { Badge } from "../ui/badge";
import RecommendStars from "./shared/RecommendStars";

export default function MusicalInfo({
  isOnShow,
  recommendLevel,
  original,
}: {
  isOnShow: boolean;
  recommendLevel: number;
  original: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-foreground mb-6">
        基本情報
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
        {isOnShow && (
          <InfoItem
            icon={BadgeCheck}
            label="ステータス"
            value={
              <Badge
                variant="outline"
                className="border-emerald-600/40 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
              >
                上映中
              </Badge>
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

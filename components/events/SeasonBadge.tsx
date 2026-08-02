import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSeasonMeta } from "@/lib/events";

export default function SeasonBadge({
  monthNumber,
  className,
}: {
  monthNumber: number;
  className?: string;
}) {
  const meta = getSeasonMeta(monthNumber);
  return (
    <Badge variant="outline" className={cn(meta.badgeClass, className)}>
      {meta.label}・{monthNumber}月
    </Badge>
  );
}

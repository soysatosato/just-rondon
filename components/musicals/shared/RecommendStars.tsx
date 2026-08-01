import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
};

export default function RecommendStars({
  level,
  size = "sm",
  tone = "light",
}: {
  level: number;
  size?: "sm" | "md";
  /** "light": 暗い画像の上に重ねる用(未達成分は白半透明)。"muted": カード背景の上に置く用。 */
  tone?: "light" | "muted";
}) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            sizeClasses[size],
            i < level
              ? "fill-amber-400 text-amber-400"
              : tone === "light"
                ? "fill-transparent text-white/40"
                : "fill-transparent text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

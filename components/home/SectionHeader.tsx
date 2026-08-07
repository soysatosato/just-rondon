import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function SectionHeader({
  eyebrow,
  title,
  description,
  accentClassName,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  accentClassName?: string;
}) {
  return (
    <div className="mb-6 max-w-2xl">
      {eyebrow && (
        <Badge
          className={cn(
            "mb-3 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white",
            accentClassName ?? "bg-red-600 hover:bg-red-600"
          )}
        >
          {eyebrow}
        </Badge>
      )}
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
        {title}
      </h2>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}

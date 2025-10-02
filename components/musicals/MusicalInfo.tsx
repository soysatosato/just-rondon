import { BadgeCheck, Book, Globe, Heart, Star } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";

export default function MusicalInfo({
  isOnShow,
  mustSee,
  recommendLevel,
  website,
  original,
}: {
  isOnShow: boolean;
  mustSee: boolean;
  recommendLevel: number;
  website: string;
  original: string;
}) {
  return (
    <section className="max-w-4xl mx-auto py-10">
      <h2 className="text-xl md:text-2xl font-semibold tracking-wide text-gray-800 dark:text-gray-100 mb-6 border-b pb-2 border-gray-300 dark:border-gray-700">
        基本情報
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5 text-gray-700 dark:text-gray-300">
        {isOnShow && (
          <InfoItem
            icon={BadgeCheck}
            label="ステータス"
            value={<Badge variant="destructive">上映中</Badge>}
          />
        )}
        {mustSee && (
          <InfoItem
            icon={Star}
            label="おすすめ度"
            value={<Badge variant="default">Must See</Badge>}
          />
        )}
        <InfoItem
          icon={Heart}
          label="おすすめ度"
          value={recommendLevel + "/5"}
        />
        <InfoItem
          icon={Globe}
          label="公式サイト"
          value={
            <Link
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
            >
              見る
            </Link>
          }
        />
        <InfoItem icon={Book} label="原作" value={original} />
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
      <Icon size={20} className="text-indigo-500 dark:text-indigo-400 mt-1" />
      <div>
        <div className="text-xs uppercase tracking-widest font-semibold text-gray-500 dark:text-gray-400">
          {label}
        </div>
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 mt-1">
          {value}
        </div>
      </div>
    </div>
  );
}

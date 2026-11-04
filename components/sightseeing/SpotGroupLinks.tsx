import Link from "next/link";
import { attractionPagePath } from "@/lib/museum-attraction-pairs";
import { spotGroupFor } from "@/lib/sightseeing/spot-groups";

/**
 * 同じ建物・会場を別々のページで案内しているスポットの組(lib/sightseeing/spot-groups.ts)。
 * どのページが何の案内かを並べ、いま読んでいるページに印を付ける。
 * 組に入っていないスポットでは何も描かない。
 */
export default function SpotGroupLinks({ slug }: { slug: string }) {
  const group = spotGroupFor(slug);
  if (!group) return null;

  return (
    <nav
      aria-label={group.title}
      className="rounded-2xl border border-border p-4 sm:p-5"
    >
      <p className="text-sm font-semibold">{group.title}</p>
      <ul className="mt-2 space-y-2">
        {group.members.map((member) => {
          const current = member.slug === slug;
          return (
            <li key={member.slug} className="text-sm leading-relaxed">
              {current ? (
                <span aria-current="page" className="font-semibold">
                  {member.name}(このページ)
                </span>
              ) : (
                <Link
                  href={attractionPagePath(member.slug)}
                  className="font-medium text-link underline underline-offset-2 hover:opacity-80 dark:text-blue-400"
                >
                  {member.name}
                </Link>
              )}
              <span className="block text-xs text-muted-foreground">
                {member.role}
              </span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function MusicalBreadCrumbs({
  name,
  name2,
  link2,
  name3,
}: {
  name: string;
  name2?: string;
  link2?: string;
  name3?: string;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Separator */}
        <BreadcrumbSeparator />

        {/* Name */}
        <BreadcrumbItem>
          {name2 || name3 ? (
            <BreadcrumbLink asChild>
              <Link href={`/musicals/${link2}`}>{name}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{name}</BreadcrumbPage>
          )}
        </BreadcrumbItem>

        {/* Name2 */}
        {name2 && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {name3 ? (
                <BreadcrumbLink asChild>
                  <Link href={`/musicals/${link2}/songs`}>{name2}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{name2}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}

        {/* Name3 */}
        {name3 && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-gray-500">
                {name3?.length > 3 ? name3.slice(0, 3) + "…" : name3}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

/**
 * name / name2 / name3 の順に階層が深くなる。
 * link・link2 は先頭スラッシュ無しのパス("sightseeing/transport" のように
 * 複数セグメントも渡せる)。最後の要素だけがリンクにならない。
 */
export default function BreadCrumbs({
  name,
  name2,
  name3,
  link,
  link2,
}: {
  name: string;
  name2?: string;
  name3?: string;
  link?: string;
  link2?: string;
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
          {name2 ? (
            <BreadcrumbLink asChild>
              <Link href={`/${link}`}>{name}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{name}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {name2 && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {name3 ? (
                <BreadcrumbLink asChild>
                  <Link href={`/${link2}`}>{name2}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{name2}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
          </>
        )}
        {name3 && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbPage>{name3}</BreadcrumbPage>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

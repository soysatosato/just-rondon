import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

export default function BreadCrumbs({
  name,
  name2,
  link,
}: {
  name: string;
  name2?: string;
  link?: string;
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
            <BreadcrumbPage>{name2}</BreadcrumbPage>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

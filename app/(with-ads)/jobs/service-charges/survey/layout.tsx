// app/(with-ads)/jobs/service-charges/survey/layout.tsx
import { noindexMetadata } from "@/lib/seo";

// page.tsx が "use client" なので metadata はここで宣言する。
export const metadata = noindexMetadata("サービスチャージ アンケート");

export default function SurveyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

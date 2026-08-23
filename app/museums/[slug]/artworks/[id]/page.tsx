import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Metadata } from "next";
import {
  fetchArtworkDetails,
  fetchMuseumIDandName,
} from "@/utils/actions/museums";
import { Star } from "lucide-react";
import { FaStar } from "react-icons/fa";
import MuseumBreadCrumbs from "@/components/museums/BreadCrumbs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Sparkles } from "lucide-react";
import ContactDialog from "@/components/form/ContactDialog";
import JsonLd from "@/components/seo/JsonLd";
import { absoluteUrl, buildPageMetadata } from "@/lib/seo";
import {
  artworkJsonLd,
  museumBreadcrumbJsonLd,
} from "@/components/museums/jsonld";

export async function generateMetadata({
  params,
}: {
  params: { id: string; slug: string };
}): Promise<Metadata> {
  const artwork = await fetchArtworkDetails(params.id);

  return buildPageMetadata({
    path: `/museums/${params.slug}/artworks/${params.id}`,
    title: `${artwork?.title}・${artwork?.artist}｜${artwork?.museum.name}の作品解説・ロンドン観光・美術館ガイド`,
    titleSuffix: false,
    description: `${artwork?.title}・${artwork?.artist}（${artwork?.museum.name}所蔵）の見どころ・ハイライトを徹底解説。ロンドン観光で絶対に見るべき美術館・注目作品の情報をわかりやすくガイドします。`,
    images: artwork?.image ? [artwork.image] : undefined,
    // 作品ページはDBから機械的に量産され、1件あたりの固有本文が数百字しかない。
    // サイト全体(1,199URL)の4割を占めるため、インデックスさせると
    // 記事コンテンツの評価まで薄まる。館内の回遊導線としては残すので follow は維持。
    noindex: true,
  });
}

export default async function ArtworkDetailPage({
  params,
}: {
  params: { id: string; slug: string };
}) {
  const museum = await fetchMuseumIDandName(params.slug);
  if (!museum) return;
  const artwork = await fetchArtworkDetails(params.id);
  return (
    <main className="max-w-3xl mx-auto px-4 space-y-4">
      {artwork && (
        <>
          <JsonLd
            data={museumBreadcrumbJsonLd(
              { name: museum.name, slug: params.slug },
              [
                {
                  name: artwork.title,
                  url: absoluteUrl(
                    `/museums/${params.slug}/artworks/${params.id}`,
                  ),
                },
              ],
            )}
          />
          <JsonLd
            data={artworkJsonLd(artwork, {
              name: museum.name,
              slug: params.slug,
            })}
          />
        </>
      )}
      <MuseumBreadCrumbs
        name={museum.name}
        link2={params.slug}
        name2="コレクション"
        name3={artwork?.title}
      />

      {/* タイトル＋評価＋バッジ */}
      <section className="flex flex-col items-center gap-2">
        <div className="flex flex-col items-center text-center">
          {/* {artwork?.engTitle && ( */}
          <p className="text-sm text-gray-400 italic">{artwork?.engTitle}</p>
          {/* )} */}
          <h1 className="text-2xl md:text-3xl font-serif font-bold">
            {artwork?.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {artwork?.recommendLevel && (
            <div className="flex items-center gap-1 text-yellow-400">
              {[...Array(3)].map((_, i) =>
                i < artwork?.recommendLevel ? (
                  <FaStar key={i} size={16} />
                ) : (
                  <Star key={i} size={16} />
                ),
              )}
            </div>
          )}
          {artwork?.mustSee && (
            <Badge variant="destructive" className="uppercase px-2 py-0.5">
              Must See
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          {artwork?.artist}, {artwork?.year}
        </p>
        <p className="text-xs text-muted-foreground">
          {artwork?.museum.name} {artwork?.room}
        </p>
      </section>

      {artwork?.image && (
        <div className="relative mx-auto overflow-hidden rounded-lg shadow-sm transform hover:scale-[1.01] transition duration-200 w-full max-w-2xl aspect-[4/3]">
          <img
            src={artwork.image}
            alt={artwork.title}
            className="absolute inset-0 w-full h-full object-contain"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
          />
        </div>
      )}

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-2 border-b border-border pb-2 text-xl font-bold tracking-tight">
          作品の概要
        </h2>
        {artwork?.description && (
          <div className="prose dark:prose-invert max-w-none text-sm font-sans">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mt-5">{children}</p>,
              }}
            >
              {artwork.description}
            </ReactMarkdown>
          </div>
        )}
      </section>


      {artwork?.highlights && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-2 border-b border-border pb-2 text-lg font-bold tracking-tight md:text-xl">
            ここがポイント
          </h2>
          <ul className="space-y-2">
            {artwork.highlights.map((h, idx) => (
              <ReactMarkdown
                key={idx}
                remarkPlugins={[remarkGfm]}
                components={{
                  li: ({ children }) => (
                    <li className="flex items-start gap-2">
                      <Sparkles className="mt-1 h-4 w-4 flex-shrink-0 text-amber-500" />
                      <span className="text-sm leading-relaxed text-muted-foreground">
                        {children}
                      </span>
                    </li>
                  ),
                  p: ({ children }) => <>{children}</>, // pタグで潰れないように
                }}
              >
                {`- ${h}`}
              </ReactMarkdown>
            ))}
          </ul>
          {(params.slug === "british-museum" ||
            params.slug === "national-gallery") && (
            <div className="my-6 ">
              <ContactDialog />
            </div>
          )}
        </section>
      )}
    </main>
  );
}

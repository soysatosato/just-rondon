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

export async function generateMetadata({
  params,
}: {
  params: { id: string; slug: string };
}): Promise<Metadata> {
  const artwork = await fetchArtworkDetails(params.id);

  return {
    title: `${artwork?.title}・${artwork?.artist}｜${artwork?.museum.name}の作品解説・ロンドン観光・美術館ガイド`,
    description: `${artwork?.title}・${artwork?.artist}（${artwork?.museum.name}所蔵）の見どころ・ハイライトを徹底解説。ロンドン観光で絶対に見るべき美術館・注目作品の情報をわかりやすくガイドします。`,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: `https://www.just-rondon.com/museums/${params.slug}/artworks/${params.id}`,
    },
  };
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
                )
              )}
            </div>
          )}
          {artwork?.mustSee && (
            <Badge variant="destructive" className="uppercase px-2 py-0.5">
              Must See
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-500">
          {artwork?.artist}, {artwork?.year}
        </p>
        <p className="text-xs text-gray-400">
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
          />
        </div>
      )}

      <section className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg shadow-inner">
        <h2 className="text-xl font-semibold border-b pb-1 mb-2 text-gray-900 dark:text-gray-100">
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
        <section className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-lg md:text-xl font-semibold border-b pb-1 mb-2 text-gray-900 dark:text-gray-100">
            ここがポイント！
          </h2>
          <ul className="space-y-2">
            {artwork.highlights.map((h, idx) => (
              <ReactMarkdown
                key={idx}
                remarkPlugins={[remarkGfm]}
                components={{
                  li: ({ children }) => (
                    <li className="flex items-start gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500 mt-1 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
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

import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, MapPin, Wallet, Store } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import ImageCredit from "@/components/shared/ImageCredit";
import BrandFigure from "@/components/brands/BrandFigure";
import { Badge } from "@/components/ui/badge";
import { buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import {
  fetchBrand,
  fetchBrandSlugs,
  fetchBrands,
} from "@/utils/actions/brands";
import {
  BRAND_BASE,
  BRAND_CATEGORY_LABELS,
  BRAND_SECTION_NAME,
  brandJsonLd,
  brandPath,
  type BrandCategory,
} from "@/components/brands/meta";

export async function generateStaticParams() {
  const slugs = await fetchBrandSlugs();
  return slugs.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const brand = await fetchBrand(params.slug);
  if (!brand) return {};

  return buildPageMetadata({
    path: brandPath(brand.slug),
    title: `${brand.name}（${brand.engName}）｜成り立ちとロンドンでの買い方`,
    description: `${brand.blurb} ${brand.founded ? `${brand.founded}年創業。` : ""}ロンドンのどこで買えるか、日本との価格差、定番アイテムまで紹介します。`,
    type: "article",
    keywords: [
      brand.name,
      brand.engName,
      `${brand.name} ロンドン`,
      `${brand.name} 安い`,
      `${brand.name} 本店`,
      "イギリス ブランド",
    ],
    ...(brand.image ? { images: [brand.image] } : {}),
  });
}

export default async function BrandPage({
  params,
}: {
  params: { slug: string };
}) {
  const brand = await fetchBrand(params.slug);
  if (!brand) notFound();

  // 「次にどれを読むか」を切らさないための他ブランドリンク。
  const others = (await fetchBrands()).filter((b) => b.slug !== brand.slug);

  const categoryLabel =
    BRAND_CATEGORY_LABELS[brand.category as BrandCategory] ?? null;

  const storyImages = brand.images.filter((i) => i.section === "story");
  const buyingImages = brand.images.filter((i) => i.section === "buying");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd({ name: BRAND_SECTION_NAME, path: BRAND_BASE }, [
            { name: brand.name, path: brandPath(brand.slug) },
          ]),
          brandJsonLd(brand),
        ]}
      />

      <BreadCrumbs
        name={BRAND_SECTION_NAME}
        name2={brand.name}
        link="brands"
      />

      <header className="mt-6 space-y-3">
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          {brand.name}
          <span className="ml-2 text-base font-normal italic text-muted-foreground">
            {brand.engName}
          </span>
        </h1>

        <div className="flex flex-wrap items-center gap-1.5">
          {categoryLabel && (
            <Badge variant="secondary" className="font-normal">
              {categoryLabel}
            </Badge>
          )}
          {brand.founded && (
            <Badge variant="secondary" className="font-normal">
              {brand.founded}年創業
            </Badge>
          )}
          {brand.origin && (
            <Badge variant="secondary" className="font-normal">
              {brand.origin}
            </Badge>
          )}
          {brand.royalWarrant && (
            <Badge
              variant="outline"
              className="gap-1 border-amber-600/40 bg-amber-600/10 font-normal text-amber-700 dark:text-amber-400"
            >
              <Crown className="h-3 w-3" />
              王室御用達
            </Badge>
          )}
        </div>

        <p className="text-base font-medium leading-relaxed text-sky-800 dark:text-sky-300">
          {brand.blurb}
        </p>
      </header>

      {brand.image && (
        <figure className="mt-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
            <img
              src={brand.image}
              alt={brand.name}
              className="absolute inset-0 h-full w-full object-cover"
              decoding="async"
            />
          </div>
          <figcaption className="mt-1.5">
            <ImageCredit
              source={brand.imageSource}
              credit={brand.imageCredit}
              link={brand.imageLink}
            />
          </figcaption>
        </figure>
      )}

      {(brand.priceRange || brand.flagship) && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {brand.priceRange && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <Wallet className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  価格の目安
                </p>
                <p className="text-sm font-medium">{brand.priceRange}</p>
              </div>
            </div>
          )}
          {brand.flagship && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  旗艦店
                </p>
                <p className="text-sm font-medium">{brand.flagship}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <section className="mt-8">
        <h2 className="mb-1 text-xl font-semibold">
          {brand.name}とは何なのか
        </h2>
        <MarkdownBody className="text-base">{brand.story}</MarkdownBody>
        {storyImages.map((image) => (
          <BrandFigure key={image.id} image={image} />
        ))}
      </section>

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="mt-8" />

      <section className="mt-10">
        <h2 className="mb-1 text-xl font-semibold">ロンドンでの買い方</h2>
        <MarkdownBody className="text-base">{brand.buying}</MarkdownBody>
        {buyingImages.map((image) => (
          <BrandFigure key={image.id} image={image} />
        ))}

        {brand.buyAt.length > 0 && (
          <div className="mt-5 flex items-start gap-2 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
            <Store className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground">
                ロンドンで買える場所
              </p>
              <div className="flex flex-wrap gap-1">
                {brand.buyAt.map((place) => (
                  <Badge key={place} variant="secondary" className="font-normal">
                    {place}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {brand.tips && (
          <p className="mt-4 rounded-lg border-l-4 border-amber-400 bg-amber-50 py-2 pl-3 pr-2 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <span className="font-semibold">ひとこと: </span>
            {brand.tips}
          </p>
        )}
      </section>

      {brand.items.length > 0 && (
        <section className="mt-12 space-y-5">
          <div className="space-y-2 border-b border-slate-200 pb-3 dark:border-slate-700">
            <h2 className="text-xl font-semibold sm:text-2xl">
              何を買えばいいか
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              長く定番として残っているものを中心に選びました。
              <strong className="font-semibold">価格は変わります。</strong>
              目安として見てください。
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {brand.items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
              >
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <h3 className="text-sm font-bold">{item.name}</h3>
                  {item.engName && (
                    <span className="text-xs italic text-muted-foreground">
                      {item.engName}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.note}
                </p>
                {item.priceRange && (
                  <p className="mt-2 text-xs font-semibold">
                    {item.priceRange}
                  </p>
                )}
                {item.affiliateUrl && (
                  <a
                    href={item.affiliateUrl}
                    target="_blank"
                    rel="nofollow sponsored noopener noreferrer"
                    className="mt-2 inline-block text-xs font-medium text-sky-700 hover:underline dark:text-sky-300"
                  >
                    取り扱いを見る →
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {brand.website && (
        <p className="mt-8 text-sm">
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-700 hover:underline dark:text-sky-300"
          >
            {brand.engName} 公式サイト →
          </a>
        </p>
      )}

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      {others.length > 0 && (
        <section className="mt-12 space-y-3 rounded-lg border border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-lg font-semibold">ほかのイギリスブランド</h2>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {others.map((b) => (
              <li key={b.id}>
                <Link
                  href={brandPath(b.slug)}
                  className="text-sky-700 hover:underline dark:text-sky-300"
                >
                  {b.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

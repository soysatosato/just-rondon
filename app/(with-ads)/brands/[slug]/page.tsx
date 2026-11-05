import { notFound } from "next/navigation";
import { Crown, ExternalLink, MapPin, Store, Train, Wallet } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import ImageCredit from "@/components/shared/ImageCredit";
import InstagramEmbed from "@/components/shared/InstagramEmbed";
import SameNamePages from "@/components/shared/SameNamePages";
import GuideFaq from "@/components/guides/GuideFaq";
import BrandFigure from "@/components/brands/BrandFigure";
import BrandRelated from "@/components/brands/BrandRelated";
import ViewTracker from "@/components/analytics/ViewTracker";
import LazyMultiPinMap from "@/components/maps/LazyMultiPinMap";
import { splitMarkdownSections } from "@/components/brands/splitMarkdownSections";
import { Badge } from "@/components/ui/badge";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import { formatCheckedDate } from "@/lib/restaurants/shop";
import {
  fetchBrand,
  fetchBrandSlugs,
  fetchBrands,
} from "@/utils/actions/brands";
import {
  BRAND_BASE,
  BRAND_CATEGORY_LABELS,
  BRAND_PRICES_RECORDED,
  BRAND_SECTION_NAME,
  brandJsonLd,
  brandPath,
  getStoreKindMeta,
  type BrandCategory,
} from "@/components/brands/meta";
import { IMAGE_SIZES, responsiveImage } from "@/lib/wikimedia-image";

// 取得側の unstable_cache(utils/actions/brands.ts)と同じ1日。
export const revalidate = 60 * 60 * 24;

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
    title: `${brand.name}（${brand.engName}）｜ロンドンで買える店と定番品、歴史`,
    description: `${brand.blurb} ${brand.founded ? `${brand.founded}年創業。` : ""}ロンドンの店舗(地図つき)、定番品と価格の目安、ブランドの歴史を紹介します。`,
    type: "article",
    keywords: [
      brand.name,
      brand.engName,
      `${brand.name} ロンドン`,
      `${brand.name} 店舗`,
      `${brand.name} 本店`,
      `${brand.name} 歴史`,
    ],
    ...(brand.image ? { images: [brand.image] } : {}),
  });
}

/**
 * ブランドの個別ページ。
 *
 * 以前は 特徴 → 歴史 → 買い方 の長文(合計2,000〜3,200字)を読み終えてから
 * 定番品と店舗が出てきた(バーバリーで上から7,406px)。店頭で役に立つ
 * 「何を買うか」「どこで買うか」を上に出し、長文はその後ろに置く。
 * 長文は削らない(「ブランド名 歴史」で来る人の答えなので)。
 */
export default async function BrandPage({
  params,
}: {
  params: { slug: string };
}) {
  const brand = await fetchBrand(params.slug);
  if (!brand) notFound();

  // 末尾の他ブランド導線に渡す。「次にどれを読むか」を切らさないため。
  const allBrands = await fetchBrands();

  const path = brandPath(brand.slug);
  const categoryLabel =
    BRAND_CATEGORY_LABELS[brand.category as BrandCategory] ?? null;

  const sectionBlocks = (section: "appeal" | "story" | "buying") => {
    const text = brand[section];
    const blocks = splitMarkdownSections(text);
    const count = Math.max(blocks.length, 1);
    const groups: (typeof brand.images)[] = Array.from({ length: count }, () => []);
    for (const image of brand.images.filter((i) => i.section === section)) {
      // displayOrder は「何番目のブロックの直後に置くか」。超える値は最後へ。
      const index = Math.max(Math.min(image.displayOrder, count - 1), 0);
      groups[index]?.push(image);
    }
    return blocks.map((block, i) => ({ block, images: groups[i] ?? [] }));
  };

  const flagship = brand.stores.find((s) => s.kind === "flagship") ?? null;
  const outlets = brand.stores.filter((s) => s.kind === "outlet");
  const mapped = brand.stores.filter(
    (s): s is typeof s & { lat: number; lng: number } =>
      s.lat != null && s.lng != null,
  );
  const pinNumber = (id: string) => mapped.findIndex((s) => s.id === id) + 1;
  const warrantChecked = formatCheckedDate(brand.royalWarrantCheckedAt);

  const faqItems = brand.faqs.map((f) => ({
    question: f.question,
    answer: f.answer,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd({ name: BRAND_SECTION_NAME, path: BRAND_BASE }, [
            { name: brand.name, path },
          ]),
          brandJsonLd(brand),
          ...(faqItems.length > 0
            ? [faqPageJsonLd(faqItems, `${SITE_URL}${path}`)]
            : []),
        ]}
      />

      <Breadcrumbs path="/brands" current={brand.name} />

      {brand.image && (
        <figure className="mt-5">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted">
            <img
              {...responsiveImage(brand.image, IMAGE_SIZES.article)}
              alt={brand.name}
              className="absolute inset-0 h-full w-full object-cover"
              decoding="async"
              fetchPriority="high"
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

      <header className="mt-5 space-y-3">
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          {brand.name}
          <span className="ml-2 text-base font-normal italic text-muted-foreground">
            {brand.engName}
          </span>
        </h1>
        <p className="text-base font-medium leading-relaxed text-sky-800 dark:text-sky-300">
          {brand.blurb}
        </p>
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
              <Crown className="h-3 w-3" aria-hidden />
              王室御用達
            </Badge>
          )}
        </div>
        {brand.royalWarrant && brand.royalWarrantGrantor && (
          <p className="text-xs text-muted-foreground">
            王室御用達:{brand.royalWarrantGrantor}から授与
            {warrantChecked && `(${warrantChecked}に確認`}
            {warrantChecked && brand.royalWarrantSourceUrl && (
              <>
                、
                <a
                  href={brand.royalWarrantSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  出典
                </a>
              </>
            )}
            {warrantChecked && ")"}
          </p>
        )}
      </header>

      {/* 判断に使う3つ。店頭で迷わないための要約。 */}
      <dl className="mt-5 grid gap-2 sm:grid-cols-3">
        {brand.priceRange && (
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <dt className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <Wallet className="h-3.5 w-3.5" aria-hidden />
              価格の目安
            </dt>
            <dd className="mt-1 text-sm font-semibold">{brand.priceRange}</dd>
            <dd className="text-xs text-muted-foreground">
              {BRAND_PRICES_RECORDED}に調べた幅
            </dd>
          </div>
        )}
        {flagship && (
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <dt className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <Store className="h-3.5 w-3.5" aria-hidden />
              旗艦店
            </dt>
            <dd className="mt-1 text-sm font-semibold leading-snug">
              <a href="#where-to-buy" className="underline-offset-2 hover:underline">
                {flagship.name}
              </a>
            </dd>
            {flagship.nearestStation && (
              <dd className="text-xs text-muted-foreground">
                最寄り: {flagship.nearestStation}
              </dd>
            )}
          </div>
        )}
        {outlets.length > 0 && (
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <dt className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              アウトレット
            </dt>
            <dd className="mt-1 text-sm font-semibold leading-snug">
              {outlets.map((o) => o.name).join("、")}
            </dd>
          </div>
        )}
      </dl>

      {/* 1. 何を買うか */}
      {brand.items.length > 0 && (
        <section id="what-to-buy" className="mt-10 scroll-mt-20 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold sm:text-2xl">何を買えばいいか</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              長く定番として残っているものを選びました。価格は{BRAND_PRICES_RECORDED}に調べた目安で、変わります。
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {brand.items.map((item) => (
              <li
                key={item.id}
                className="flex overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800"
              >
                {item.image && (
                  <div className="relative w-28 flex-none bg-slate-100 dark:bg-slate-800 sm:w-32">
                    <img
                      {...responsiveImage(item.image, "128px")}
                      alt={item.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1 p-3.5">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h3 className="text-sm font-bold">{item.name}</h3>
                    {item.engName && (
                      <span className="text-xs italic text-muted-foreground">
                        {item.engName}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {item.note}
                  </p>
                  {item.priceRange && (
                    <p className="mt-1.5 text-sm font-semibold">{item.priceRange}</p>
                  )}
                  {item.affiliateUrl && (
                    <a
                      href={item.affiliateUrl}
                      target="_blank"
                      rel="nofollow sponsored noopener noreferrer"
                      className="mt-1.5 inline-block text-xs font-medium text-sky-700 hover:underline dark:text-sky-300"
                    >
                      取り扱いを見る →
                    </a>
                  )}
                  {item.image && (
                    <ImageCredit
                      source={item.imageSource}
                      credit={item.imageCredit}
                      link={item.imageLink}
                      className="mt-1.5"
                    />
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 2. どこで買うか。番地まで分かる店舗は地図に番号で置く。 */}
      {brand.stores.length > 0 && (
        <section id="where-to-buy" className="mt-10 scroll-mt-20 space-y-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold sm:text-2xl">どこで買うか</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              営業時間は変わりやすいので載せていません。行く前に公式サイトで確認してください。
            </p>
          </div>
          <LazyMultiPinMap
            pins={mapped.map((s, i) => ({
              lat: s.lat,
              lng: s.lng,
              n: i + 1,
              label: s.name,
            }))}
            color="#047857"
          />
          <ul className="space-y-3">
            {brand.stores.map((store) => {
              const kind = getStoreKindMeta(store.kind);
              const n = pinNumber(store.id);
              return (
                <li
                  key={store.id}
                  className="flex gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                >
                  <span
                    aria-hidden
                    className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-semibold ${
                      n > 0
                        ? "bg-emerald-700 text-white"
                        : "border border-slate-300 text-muted-foreground"
                    }`}
                  >
                    {n > 0 ? n : "–"}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`font-normal ${kind.badgeClass}`}
                      >
                        {kind.label}
                      </Badge>
                      <h3 className="text-sm font-bold">{store.name}</h3>
                    </div>
                    {store.address && (
                      <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
                        {store.address}
                      </p>
                    )}
                    {store.nearestStation && (
                      <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Train className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
                        {store.nearestStation}
                      </p>
                    )}
                    {store.note && (
                      <p className="mt-2 text-xs leading-relaxed">{store.note}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {mapped.length < brand.stores.length && (
            <p className="text-xs text-muted-foreground">
              番号の無い店舗は、番地と郵便番号まで確かめられていないため地図に置いていません。
            </p>
          )}
        </section>
      )}

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="mt-10" />

      {/* 3. 特徴 ── 長文はここから。年号から入らない。 */}
      <section className="mt-10">
        <h2 className="mb-1 text-xl font-semibold">{brand.name}の特徴</h2>
        {sectionBlocks("appeal").map(({ block, images }, i) => (
          <div key={i}>
            <MarkdownBody className="text-base">{block}</MarkdownBody>
            {images.map((image) => (
              <BrandFigure key={image.id} image={image} />
            ))}
          </div>
        ))}
      </section>

      {/* 4. 歴史 */}
      <section className="mt-10">
        <h2 className="mb-1 text-xl font-semibold">{brand.name}の歴史</h2>
        {sectionBlocks("story").map(({ block, images }, i) => (
          <div key={i}>
            <MarkdownBody className="text-base">{block}</MarkdownBody>
            {images.map((image) => (
              <BrandFigure key={image.id} image={image} />
            ))}
          </div>
        ))}
      </section>

      {/* 5. 買い方の実務 */}
      <section className="mt-10">
        <h2 className="mb-1 text-xl font-semibold">ロンドンでの買い方</h2>
        {sectionBlocks("buying").map(({ block, images }, i) => (
          <div key={i}>
            <MarkdownBody className="text-base">{block}</MarkdownBody>
            {images.map((image) => (
              <BrandFigure key={image.id} image={image} />
            ))}
          </div>
        ))}
        {brand.tips && (
          <p className="mt-4 rounded-lg border-l-4 border-amber-400 bg-amber-50 py-2 pl-3 pr-2 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <span className="font-semibold">ひとこと: </span>
            {brand.tips}
          </p>
        )}
      </section>

      {/* 公式アカウントの投稿。押してから読み込む。 */}
      {brand.instagramUrl && (
        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-semibold">公式アカウントより</h2>
          <InstagramEmbed url={brand.instagramUrl} />
        </section>
      )}

      {faqItems.length > 0 && <GuideFaq items={faqItems} />}

      <SameNamePages currentHref={path} className="mt-8" />

      {brand.website && (
        <p className="mt-8 text-sm">
          <a
            href={brand.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sky-700 hover:underline dark:text-sky-300"
          >
            {brand.engName} 公式サイト
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        </p>
      )}

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      <BrandRelated all={allBrands} current={brand} />

      <ViewTracker targetType="brand" slug={brand.slug} />
    </div>
  );
}

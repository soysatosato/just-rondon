import Link from "next/link";
import { notFound } from "next/navigation";
import { Crown, MapPin, Wallet, Train } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import BreadCrumbs from "@/components/home/BreadCrumbs";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import ImageCredit from "@/components/shared/ImageCredit";
import InstagramEmbed from "@/components/shared/InstagramEmbed";
import GuideFaq from "@/components/guides/GuideFaq";
import BrandFigure from "@/components/brands/BrandFigure";
import { splitMarkdownSections } from "@/components/brands/splitMarkdownSections";
import { Badge } from "@/components/ui/badge";
import { buildPageMetadata, SITE_URL } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
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
  getStoreKindMeta,
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
    title: `${brand.name}（${brand.engName}）｜特徴と歴史、ロンドンでの買い方`,
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

  const appealImages = brand.images.filter((i) => i.section === "appeal");
  const storyImages = brand.images.filter((i) => i.section === "story");
  const buyingImages = brand.images.filter((i) => i.section === "buying");
  const appealBlocks = splitMarkdownSections(brand.appeal);
  const storyBlocks = splitMarkdownSections(brand.story);
  const buyingBlocks = splitMarkdownSections(brand.buying);

  // displayOrder は「何番目のブロックの直後に置くか」。
  // ブロック数を超える値は最後のブロックに繰り込む。
  const groupImagesByBlock = (
    images: typeof brand.images,
    blockCount: number,
  ) => {
    const groups: (typeof brand.images)[] = Array.from(
      { length: blockCount },
      () => [],
    );
    for (const image of images) {
      const index = Math.min(image.displayOrder, blockCount - 1);
      groups[Math.max(index, 0)]?.push(image);
    }
    return groups;
  };

  const appealImageGroups = groupImagesByBlock(
    appealImages,
    Math.max(appealBlocks.length, 1),
  );
  const storyImageGroups = groupImagesByBlock(
    storyImages,
    Math.max(storyBlocks.length, 1),
  );
  const buyingImageGroups = groupImagesByBlock(
    buyingImages,
    Math.max(buyingBlocks.length, 1),
  );

  // ヘッダーの要約ボックスに出す代表店。旗艦店が無ければ最初の1件で代用する。
  const headlineStore =
    brand.stores.find((s) => s.kind === "flagship") ?? brand.stores[0] ?? null;

  const faqItems = brand.faqs.map((f) => ({
    question: f.question,
    answer: f.answer,
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd({ name: BRAND_SECTION_NAME, path: BRAND_BASE }, [
            { name: brand.name, path: brandPath(brand.slug) },
          ]),
          brandJsonLd(brand),
          ...(faqItems.length > 0
            ? [
                faqPageJsonLd(
                  faqItems,
                  `${SITE_URL}${brandPath(brand.slug)}`,
                ),
              ]
            : []),
        ]}
      />

      <BreadCrumbs name={BRAND_SECTION_NAME} name2={brand.name} link="brands" />

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

      {(brand.priceRange || headlineStore) && (
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
          {headlineStore && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  {getStoreKindMeta(headlineStore.kind).label}
                </p>
                <p className="text-sm font-medium">{headlineStore.name}</p>
                {headlineStore.nearestStation && (
                  <p className="text-xs text-muted-foreground">
                    最寄り: {headlineStore.nearestStation}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. 特徴・魅力 ── 読者が最初に知りたいのは「何が良いのか」。年号から入らない。 */}
      <section className="mt-8">
        <h2 className="mb-1 text-xl font-semibold">
          {brand.name}の特徴
        </h2>
        {appealBlocks.map((block, i) => (
          <div key={i}>
            <MarkdownBody className="text-base">{block}</MarkdownBody>
            {appealImageGroups[i]?.map((image) => (
              <BrandFigure key={image.id} image={image} />
            ))}
          </div>
        ))}
      </section>

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="mt-8" />

      {/* 2. 歴史 */}
      <section className="mt-10">
        <h2 className="mb-1 text-xl font-semibold">
          {brand.name}の歴史
        </h2>
        {storyBlocks.map((block, i) => (
          <div key={i}>
            <MarkdownBody className="text-base">{block}</MarkdownBody>
            {storyImageGroups[i]?.map((image) => (
              <BrandFigure key={image.id} image={image} />
            ))}
          </div>
        ))}
      </section>

      {/* 3. 買い方 */}
      <section className="mt-10">
        <h2 className="mb-1 text-xl font-semibold">ロンドンでの買い方</h2>
        {buyingBlocks.map((block, i) => (
          <div key={i}>
            <MarkdownBody className="text-base">{block}</MarkdownBody>
            {buyingImageGroups[i]?.map((image) => (
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

      {/*
        4. 公式アカウントの投稿。
        Commons の画像は店舗外観や史料が中心で、そのブランドが「今」
        何を作っているのかが写らない。公式の投稿を埋め込めば、写真を
        複製せずに現行品を見せられる。
      */}
      {brand.instagramUrl && (
        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-semibold">公式アカウントより</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {brand.engName} の公式アカウントの投稿です。
          </p>
          <InstagramEmbed url={brand.instagramUrl} />
        </section>
      )}

      {/* 5. 何を買うか */}
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
                className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800"
              >
                {/*
                  定番品の写真。画像の無いアイテムと並ぶので、枠の中で
                  高さを固定して一覧の行が崩れないようにする。
                */}
                {item.image && (
                  <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-slate-800">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}

                <div className="p-4">
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
                  {item.image && (
                    <div className="mt-2">
                      <ImageCredit
                        source={item.imageSource}
                        credit={item.imageCredit}
                        link={item.imageLink}
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 6. 主な店舗・アウトレット */}
      {brand.stores.length > 0 && (
        <section className="mt-12 space-y-5">
          <div className="space-y-2 border-b border-slate-200 pb-3 dark:border-slate-700">
            <h2 className="text-xl font-semibold sm:text-2xl">
              主な店舗・アウトレット
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              <strong className="font-semibold">
                営業時間は載せていません。
              </strong>
              変わりやすく、古い情報を頼りに行くと閉まっていることがあるためです。
              行く前に公式サイトで確認してください。
            </p>
          </div>

          <ul className="space-y-3">
            {brand.stores.map((store) => {
              const kind = getStoreKindMeta(store.kind);
              return (
                <li
                  key={store.id}
                  className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                >
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
                      <MapPin className="mt-0.5 h-3.5 w-3.5 flex-none" />
                      {store.address}
                    </p>
                  )}
                  {store.nearestStation && (
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                      <Train className="mt-0.5 h-3.5 w-3.5 flex-none" />
                      {store.nearestStation}
                    </p>
                  )}
                  {store.note && (
                    <p className="mt-2 text-xs leading-relaxed">{store.note}</p>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* 7. FAQ */}
      {faqItems.length > 0 && <GuideFaq items={faqItems} />}

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

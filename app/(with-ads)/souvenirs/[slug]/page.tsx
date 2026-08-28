import Link from "next/link";
import { notFound } from "next/navigation";
import { Gift, Luggage, MapPin, ShoppingBasket, Wallet } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import GuideFaq from "@/components/guides/GuideFaq";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import ImageCredit from "@/components/shared/ImageCredit";
import InstagramEmbed from "@/components/shared/InstagramEmbed";
import { Badge } from "@/components/ui/badge";
import { SITE_URL, buildPageMetadata } from "@/lib/seo";
import { breadcrumbJsonLd, faqPageJsonLd } from "@/lib/jsonld";
import {
  fetchSouvenir,
  fetchSouvenirSlugs,
  fetchSouvenirs,
} from "@/utils/actions/souvenirs";
import SouvenirPicks from "@/components/souvenirs/SouvenirPicks";
import { souvenirArticleJsonLd } from "@/components/souvenirs/jsonld";
import {
  SOUVENIR_BASE,
  SOUVENIR_CATEGORY_DESCRIPTIONS,
  SOUVENIR_CATEGORY_LABELS,
  SOUVENIR_SECTION_NAME,
  souvenirPath,
  type SouvenirCategory,
} from "@/components/souvenirs/categories";

export async function generateStaticParams() {
  const slugs = await fetchSouvenirSlugs();
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const souvenir = await fetchSouvenir(params.slug);
  if (!souvenir) return {};

  const categoryLabel =
    SOUVENIR_CATEGORY_LABELS[souvenir.category as SouvenirCategory] ?? "お土産";

  return buildPageMetadata({
    path: souvenirPath(souvenir.slug),
    title: `${souvenir.name}｜ロンドン土産としての選び方と買える場所`,
    description: `${souvenir.blurb} 価格の目安は${souvenir.priceRange ?? "店により異なります"}。どこで買えるか、誰に渡すと喜ばれるか、持ち帰るときの注意まで紹介します。`,
    type: "article",
    keywords: [
      souvenir.name,
      ...(souvenir.engName ? [souvenir.engName] : []),
      `${souvenir.name} お土産`,
      `${souvenir.name} ロンドン`,
      `イギリス お土産 ${categoryLabel}`,
      "ロンドン お土産",
    ],
    ...(souvenir.image ? { images: [souvenir.image] } : {}),
  });
}

export default async function SouvenirPage({
  params,
}: {
  params: { slug: string };
}) {
  const souvenir = await fetchSouvenir(params.slug);
  if (!souvenir) notFound();

  const all = await fetchSouvenirs();

  const category = souvenir.category as SouvenirCategory;
  const categoryLabel = SOUVENIR_CATEGORY_LABELS[category] ?? null;
  const categoryDescription = SOUVENIR_CATEGORY_DESCRIPTIONS[category] ?? null;

  // 「次にどれを読むか」を切らさない。同カテゴリを先に出し、
  // 足りなければ他カテゴリで埋める。同カテゴリだけだと2〜3件で尽きるため。
  const faqItems = souvenir.faqs.map((f) => ({
    question: f.question,
    answer: f.answer,
  }));

  const others = all.filter((s) => s.slug !== souvenir.slug);
  const sameCategory = others.filter((s) => s.category === souvenir.category);
  const related = [
    ...sameCategory,
    ...others.filter((s) => s.category !== souvenir.category),
  ].slice(0, 6);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            { name: SOUVENIR_SECTION_NAME, path: SOUVENIR_BASE },
            [{ name: souvenir.name, path: souvenirPath(souvenir.slug) }],
          ),
          souvenirArticleJsonLd(souvenir),
          ...(faqItems.length > 0
            ? [
                faqPageJsonLd(
                  faqItems,
                  `${SITE_URL}${souvenirPath(souvenir.slug)}`,
                ),
              ]
            : []),
        ]}
      />

      <Breadcrumbs path="/souvenirs" current={souvenir.name} />

      <header className="mt-6 space-y-3">
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          {souvenir.name}
          {souvenir.engName && (
            <span className="ml-2 text-base font-normal italic text-muted-foreground">
              {souvenir.engName}
            </span>
          )}
        </h1>

        {categoryLabel && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="font-normal">
              {categoryLabel}
            </Badge>
          </div>
        )}

        <p className="text-base font-medium leading-relaxed text-sky-800 dark:text-sky-300">
          {souvenir.blurb}
        </p>
      </header>

      {souvenir.image && (
        <figure className="mt-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl">
            <img
              src={souvenir.image}
              alt={souvenir.name}
              className="absolute inset-0 h-full w-full object-cover"
              decoding="async"
            />
          </div>
          <figcaption className="mt-1.5">
            <ImageCredit
              source={souvenir.imageSource}
              credit={souvenir.imageCredit}
              link={souvenir.imageLink}
            />
          </figcaption>
        </figure>
      )}

      {(souvenir.priceRange || souvenir.buyAt.length > 0) && (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {souvenir.priceRange && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <Wallet className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  価格の目安
                </p>
                <p className="text-sm font-medium">{souvenir.priceRange}</p>
              </div>
            </div>
          )}

          {souvenir.buyAt.length > 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <MapPin className="mt-0.5 h-4 w-4 flex-none text-muted-foreground" />
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  買える場所
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {souvenir.buyAt.map((place) => (
                    <Badge
                      key={place}
                      variant="secondary"
                      className="font-normal"
                    >
                      {place}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <section className="mt-8">
        <MarkdownBody className="text-base">{souvenir.body}</MarkdownBody>

        {souvenir.tips && (
          <p className="mt-6 rounded-lg border-l-4 border-amber-400 bg-amber-50 py-2 pl-3 pr-2 text-sm leading-relaxed text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            <span className="font-semibold">ひとこと: </span>
            {souvenir.tips}
          </p>
        )}
      </section>

      {/*
        「どれを買うか」を本文の直後に置く。読者が店頭で最後に詰まるのは
        品の由来でも渡し方でもなく銘柄で、棚に似た品が並んだときに
        選べないと記事を読んだ意味が半分になる。渡し方・持ち帰りより
        手前なのは、買う前に読むのがここだけだから。
      */}
      {(souvenir.picks.length > 0 || souvenir.recommendation) && (
        <section className="mt-10">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
            <ShoppingBasket className="h-5 w-5 flex-none text-muted-foreground" />
            どれを買うか
          </h2>

          {/*
            商品一覧を地の文より先に置く。棚の前で開いた読者が要るのは
            まず「どれ」で、理由はその次。並びだけ見て店員に聞ける形に
            しておき、迷ったときだけ下の本文を読ませる。
          */}
          <SouvenirPicks picks={souvenir.picks} />

          {souvenir.recommendation && (
            <MarkdownBody className="mt-6 text-base">
              {souvenir.recommendation}
            </MarkdownBody>
          )}
        </section>
      )}

      {/*
        渡し方と持ち帰りを本文と分けている。読者はここだけを確認しに
        戻ってくる——「マーマイト 持ち帰り」で来た人は商品の紹介文では
        なく、預けるべきかだけを知りたい。見出しを立てておけば
        目次からも検索結果のスニペットからも直接たどり着ける。
      */}
      {souvenir.givingNote && (
        <section className="mt-10">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
            <Gift className="h-5 w-5 flex-none text-muted-foreground" />
            誰に渡すと喜ばれるか
          </h2>
          <MarkdownBody className="text-base">
            {souvenir.givingNote}
          </MarkdownBody>
        </section>
      )}

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="mt-8" />

      {souvenir.carryingNote && (
        <section className="mt-10">
          <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold">
            <Luggage className="h-5 w-5 flex-none text-muted-foreground" />
            持ち帰るときの注意
          </h2>
          <MarkdownBody className="text-base">
            {souvenir.carryingNote}
          </MarkdownBody>
        </section>
      )}

      {/*
        Commons の画像は商品そのものより店頭や史料が写ることが多く、
        「今どんなパッケージで売っているか」が分からない。公式の投稿を
        埋め込めば、写真を複製せずに現行品を見せられる。
      */}
      {souvenir.instagramUrl && (
        <section className="mt-10 space-y-3">
          <h2 className="text-xl font-semibold">公式アカウントより</h2>
          <InstagramEmbed url={souvenir.instagramUrl} />
        </section>
      )}

      {faqItems.length > 0 && <GuideFaq items={faqItems} />}

      {categoryLabel && categoryDescription && (
        <section className="mt-12 space-y-2 rounded-lg border border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-lg font-semibold">
            {categoryLabel}をお土産にするなら
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {categoryDescription}
          </p>
          <p className="pt-1 text-sm">
            <Link
              href={`${SOUVENIR_BASE}#category-${category}`}
              className="text-sky-700 hover:underline dark:text-sky-300"
            >
              {categoryLabel}のお土産をまとめて見る →
            </Link>
          </p>
        </section>
      )}

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      {related.length > 0 && (
        <section className="mt-12 space-y-3 rounded-lg border border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-lg font-semibold">ほかのお土産</h2>
          <ul className="grid gap-2 text-sm sm:grid-cols-2">
            {related.map((s) => (
              <li key={s.id}>
                <Link
                  href={souvenirPath(s.slug)}
                  className="text-sky-700 hover:underline dark:text-sky-300"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
          <p className="pt-1 text-sm">
            <Link
              href={SOUVENIR_BASE}
              className="font-medium text-sky-700 hover:underline dark:text-sky-300"
            >
              お土産の一覧に戻る →
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}

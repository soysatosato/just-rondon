import Link from "next/link";
import {
  CalendarCheck,
  Clock,
  ExternalLink,
  MapPin,
  Train,
  Wallet,
} from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import AdSenseUnit from "@/components/ads/AdSenseUnit";
import { AD_SLOTS } from "@/lib/adsense";
import Breadcrumbs from "@/components/navigation/Breadcrumbs";
import MarkdownBody from "@/components/jobs/MarkdownBody";
import ImageCredit from "@/components/shared/ImageCredit";
import InstagramEmbed from "@/components/shared/InstagramEmbed";
import SameNamePages from "@/components/shared/SameNamePages";
import AttractionSpotRail from "@/components/sightseeing/AttractionSpotRail";
import ViewTracker from "@/components/analytics/ViewTracker";
import LazyMultiPinMap from "@/components/maps/LazyMultiPinMap";
import MenuPicks from "@/components/restaurants/MenuPicks";
import { SITE_URL } from "@/lib/seo";
import { breadcrumbJsonLd } from "@/lib/jsonld";
import { IMAGE_SIZES, responsiveImage } from "@/lib/wikimedia-image";
import { toJpy, type FxRate } from "@/lib/fx/rate";
import {
  WEEKDAY_LABELS,
  budgetExamples,
  cheapestBudget,
  formatCheckedDate,
  formatGbp,
  mappedBranches,
  shopPath,
  shopScenes,
  shopSources,
  type ShopWithRelations,
} from "@/lib/restaurants/shop";
import {
  RESTAURANT_BASE,
  RESTAURANT_SECTION_NAME,
  dishPath,
} from "@/components/restaurants/meta";

export type NearbySpotForShop = {
  slug: string;
  name: string;
  image: string;
  distanceKm: number;
  durationText: string | null;
};

export type RelatedShop = {
  slug: string;
  name: string;
  engName: string;
  blurb: string;
  href: string;
};

const POSTCODE_RE = /([A-Z]{1,2}[0-9][0-9A-Z]?)\s?([0-9][A-Z]{2})\b/;

const SECTIONS = [
  { id: "order", label: "何を頼むか" },
  { id: "budget", label: "予算" },
  { id: "how-to-get-in", label: "入り方" },
  { id: "about", label: "どんな店か" },
  { id: "location", label: "場所" },
  { id: "sources", label: "出典" },
] as const;

/**
 * 店のページ。並びは読者が下す判断の順にしている。
 *
 *   行く価値があるか(写真と一文)→ 自分に合うか(予算・予約・時間・場所)
 *   → 行ったら何を頼むか → いくらになるか → どう入るか → どんな店か
 *   → どこにあって、前後に何をするか → 確かめる(出典と確認日)
 *
 * 料理ページのカードと違い、事実の欄はすべて公式で確かめた値で、
 * 確認日と出典を画面に出す。公式に書かれていない欄は出さない。
 */
export default function ShopView({
  shop,
  nearby,
  relatedShops,
  inMustVisit,
  fx,
}: {
  shop: ShopWithRelations;
  nearby: NearbySpotForShop[];
  relatedShops: RelatedShop[];
  inMustVisit: boolean;
  fx: FxRate | null;
}) {
  const path = shopPath(shop.slug);
  const pageUrl = `${SITE_URL}${path}`;
  const examples = budgetExamples(shop);
  const cheapest = cheapestBudget(examples);
  const scenes = shopScenes(shop, examples);
  const sources = shopSources(shop);
  const branches = mappedBranches(shop);
  const checked = formatCheckedDate(shop.factsCheckedAt);

  const photos = [
    ...(shop.image
      ? [
          {
            url: shop.image,
            caption: shop.name,
            source: shop.imageSource,
            credit: shop.imageCredit,
            link: shop.imageLink,
          },
        ]
      : []),
    ...shop.photos
      .filter((p) => p.url !== shop.image)
      .map((p) => ({
        url: p.url,
        caption: p.caption,
        source: p.imageSource,
        credit: p.imageCredit,
        link: p.imageLink,
      })),
  ];

  const bookingSummary =
    shop.walkIn === true && shop.bookingRequired
      ? "予約制。予約なしで入れる席もある"
      : shop.walkIn === true
        ? "予約なしで入れる席がある"
        : shop.bookingRequired
          ? "予約をしてから行く店"
          : "入り方を参照";

  const timeSummary = [
    shop.breakfast === true ? "朝食あり" : null,
    shop.closedDaysCheckedAt
      ? shop.closedWeekdays.length === 0
        ? "毎日営業"
        : `${shop.closedWeekdays.map((d) => WEEKDAY_LABELS[d]).join("・")}曜休み`
      : null,
  ]
    .filter(Boolean)
    .join("・");

  const crumbTrail = shop.dish
    ? [{ label: shop.dish.name, href: dishPath(shop.dish.slug) }]
    : [];

  const singleBranch = branches.length === 1 ? branches[0] : null;
  const postcodeMatch = singleBranch?.address.match(POSTCODE_RE);

  const restaurantJsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${pageUrl}#restaurant`,
    name: shop.engName,
    alternateName: shop.name,
    description: shop.blurb,
    ...(shop.cuisine ? { servesCuisine: shop.cuisine } : {}),
    ...(shop.website ? { url: shop.website } : {}),
    ...(photos.length > 0 ? { image: photos.map((p) => p.url) } : {}),
    ...(shop.bookingRequired ? { acceptsReservations: true } : {}),
    ...(singleBranch
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: singleBranch.address,
            ...(postcodeMatch
              ? { postalCode: `${postcodeMatch[1]} ${postcodeMatch[2]}` }
              : {}),
            addressLocality: "London",
            addressCountry: "GB",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: singleBranch.lat,
            longitude: singleBranch.lng,
          },
        }
      : {}),
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-10">
      <JsonLd
        data={[
          breadcrumbJsonLd(
            { name: RESTAURANT_SECTION_NAME, path: RESTAURANT_BASE },
            [
              ...(shop.dish
                ? [{ name: shop.dish.name, path: dishPath(shop.dish.slug) }]
                : []),
              { name: shop.name, path },
            ],
          ),
          restaurantJsonLd,
        ]}
      />

      <Breadcrumbs path="/restaurants" trail={crumbTrail} current={shop.name} />

      {/* 1. 写真。料理・店内・外観のうちあるものを横に並べる。 */}
      {photos.length > 0 && (
        <div className="mt-5 -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0">
          {photos.slice(0, 2).map((photo, i) => (
            <figure
              key={photo.url}
              className="w-[85%] flex-none snap-start sm:w-auto"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
                <img
                  {...responsiveImage(photo.url, IMAGE_SIZES.grid2)}
                  alt={photo.caption}
                  className="absolute inset-0 h-full w-full object-cover"
                  decoding="async"
                  {...(i === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
                />
              </div>
              <figcaption className="mt-1 space-y-0.5">
                {i > 0 && (
                  <p className="text-xs text-muted-foreground">{photo.caption}</p>
                )}
                <ImageCredit
                  source={photo.source}
                  credit={photo.credit}
                  link={photo.link}
                />
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* 2. 名前と一文 */}
      <header className="mt-5 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground">
          {[shop.cuisine, shop.area].filter(Boolean).join("・")}
        </p>
        <h1 className="text-2xl font-bold leading-snug tracking-tight sm:text-3xl">
          {shop.name}
          <span className="ml-2 text-base font-normal italic text-muted-foreground">
            {shop.engName}
          </span>
        </h1>
        <p className="text-base font-medium leading-relaxed text-sky-800 dark:text-sky-300">
          {shop.blurb}
        </p>
      </header>

      {/* 3. 判断に使う4つ。すべて公式で確かめた値。 */}
      <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
          <dt className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Wallet className="h-3.5 w-3.5" aria-hidden />
            予算の例
          </dt>
          <dd className="mt-1 text-sm font-semibold">
            {cheapest ? (
              <a href="#budget" className="underline-offset-2 hover:underline">
                {formatGbp(cheapest.total)}〜
              </a>
            ) : (
              shop.priceRange ?? "—"
            )}
          </dd>
          {cheapest && (
            <dd className="text-xs text-muted-foreground">{cheapest.label}</dd>
          )}
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
          <dt className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
            予約
          </dt>
          <dd className="mt-1 text-sm font-semibold leading-snug">
            <a
              href="#how-to-get-in"
              className="underline-offset-2 hover:underline"
            >
              {bookingSummary}
            </a>
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
          <dt className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Clock className="h-3.5 w-3.5" aria-hidden />
            営業
          </dt>
          <dd className="mt-1 text-sm font-semibold leading-snug">
            {timeSummary || "公式サイトで確認"}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
          <dt className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Train className="h-3.5 w-3.5" aria-hidden />
            最寄駅
          </dt>
          <dd className="mt-1 text-sm font-semibold leading-snug">
            <a href="#location" className="underline-offset-2 hover:underline">
              {shop.nearestStation ?? shop.area}
            </a>
          </dd>
        </div>
      </dl>
      {checked && (
        <p className="mt-2 text-xs text-muted-foreground">
          予約・営業・価格は{checked}に公式サイトで確かめた内容です。変わることがあるので、行く前に公式サイトを見てください。
        </p>
      )}

      {/* 4. こんなときに。記録した事実から自動で決めている。 */}
      {scenes.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-semibold text-muted-foreground">
            こんなときに
          </p>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {scenes.map((s) => (
              <li
                key={s.id}
                title={s.basis}
                className="rounded-full border border-slate-300 px-2.5 py-0.5 text-xs font-medium dark:border-slate-600"
              >
                {s.label}
              </li>
            ))}
          </ul>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            {scenes.map((s) => `${s.label}=${s.basis}`).join("。")}。
          </p>
        </div>
      )}

      {/* ページ内の目次。スマホでは横にスクロールする。 */}
      <nav
        aria-label="このページの節"
        className="mt-6 -mx-4 overflow-x-auto border-y border-slate-200 px-4 py-2 dark:border-slate-700"
      >
        <ul className="flex w-max gap-4 text-sm">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-sky-700 hover:underline dark:text-sky-300"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* 5. 何を頼むか */}
      <section id="order" className="mt-8 scroll-mt-20">
        <h2 className="mb-3 text-xl font-semibold">何を頼むか</h2>
        <MenuPicks picks={shop.menuPicks} variant="page" />
      </section>

      {/* 6. 予算の例。公式価格を足し、サービス料を上乗せした計算を見せる。 */}
      {examples.length > 0 && (
        <section id="budget" className="mt-10 scroll-mt-20">
          <h2 className="mb-3 text-xl font-semibold">予算の例</h2>
          <ul className="space-y-3">
            {examples.map((e) => (
              <li
                key={e.label}
                className="rounded-lg border border-slate-200 p-4 dark:border-slate-700"
              >
                <p className="text-sm font-semibold">{e.label}</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {e.lines.map((l) => (
                    <li key={l.name} className="flex justify-between gap-3">
                      <span className="min-w-0">
                        {l.name}
                        {l.nameJa && (
                          <span className="ml-1 text-xs text-muted-foreground">
                            {l.nameJa}
                          </span>
                        )}
                      </span>
                      <span className="flex-none tabular-nums">
                        {formatGbp(l.price)}
                      </span>
                    </li>
                  ))}
                  {e.serviceChargePercent != null && (
                    <li className="flex justify-between gap-3 text-muted-foreground">
                      <span>サービス料 {e.serviceChargePercent}%</span>
                      <span className="flex-none tabular-nums">
                        {formatGbp(Math.round((e.total - e.subtotal) * 100) / 100)}
                      </span>
                    </li>
                  )}
                  <li className="flex justify-between gap-3 border-t border-slate-200 pt-1 font-semibold dark:border-slate-700">
                    <span>合計</span>
                    <span className="flex-none tabular-nums">
                      {formatGbp(e.total)}
                      {fx && (
                        <span className="ml-1 text-xs font-normal text-muted-foreground">
                          (約{toJpy(e.total, fx.jpyPerGbp).toLocaleString("ja-JP")}円)
                        </span>
                      )}
                    </span>
                  </li>
                </ul>
                {e.serviceChargePercent == null && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    サービス料が加算されるかどうかは、公式に記載がありません。
                  </p>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            価格は公式メニューの表記を足した値です。
            {fx &&
              `円は${formatCheckedDate(fx.rateDate)}の欧州中央銀行の参照レート(1ポンド${fx.jpyPerGbp.toFixed(2)}円)で換算しています。`}
          </p>
        </section>
      )}

      <AdSenseUnit slot={AD_SLOTS.inArticle} className="mt-10" />

      {/* 7. 入り方 */}
      <section id="how-to-get-in" className="mt-10 scroll-mt-20">
        <h2 className="mb-2 text-xl font-semibold">入り方</h2>
        {shop.bookingNote && (
          <MarkdownBody className="text-base">{shop.bookingNote}</MarkdownBody>
        )}
        {(shop.dressCode || shop.serviceChargePercent != null) && (
          <dl className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800/60">
            {shop.dressCode && (
              <div className="flex gap-3">
                <dt className="w-24 flex-none text-xs font-semibold text-muted-foreground">
                  服装
                </dt>
                <dd>{shop.dressCode}</dd>
              </div>
            )}
            {shop.serviceChargePercent != null && (
              <div className="flex gap-3">
                <dt className="w-24 flex-none text-xs font-semibold text-muted-foreground">
                  サービス料
                </dt>
                <dd>{shop.serviceChargePercent}%が会計に加算される</dd>
              </div>
            )}
          </dl>
        )}
        {inMustVisit && (
          <p className="mt-4 text-sm">
            予約が取りにくい店の入り方の型は
            <Link
              href="/restaurants/must-visit"
              className="mx-1 text-sky-700 underline underline-offset-2 dark:text-sky-300"
            >
              絶対行くべき超人気店
            </Link>
            にまとめています。
          </p>
        )}
      </section>

      {/* 8. どんな店か */}
      {shop.body && (
        <section id="about" className="mt-10 scroll-mt-20">
          <h2 className="mb-2 text-xl font-semibold">どんな店か</h2>
          <MarkdownBody className="text-base">{shop.body}</MarkdownBody>
          {photos.length > 2 && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {photos.slice(2).map((photo) => (
                <figure key={photo.url}>
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
                    <img
                      {...responsiveImage(photo.url, IMAGE_SIZES.grid2)}
                      alt={photo.caption}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <figcaption className="mt-1 space-y-0.5">
                    <p className="text-xs text-muted-foreground">{photo.caption}</p>
                    <ImageCredit
                      source={photo.source}
                      credit={photo.credit}
                      link={photo.link}
                    />
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
          {shop.instagramUrl && (
            <div className="mt-6">
              <InstagramEmbed url={shop.instagramUrl} />
            </div>
          )}
        </section>
      )}

      {/* 9. 場所。店舗が複数ある店は一覧と地図を同じ番号で対応させる。 */}
      <section id="location" className="mt-10 scroll-mt-20 space-y-4">
        <h2 className="text-xl font-semibold">
          {shop.branches.length > 1
            ? `店舗(ロンドンに${shop.branches.length}店)`
            : "場所"}
        </h2>
        <LazyMultiPinMap
          pins={branches.map((b, i) => ({
            lat: b.lat,
            lng: b.lng,
            n: i + 1,
            label: b.name,
          }))}
          color="#b91c1c"
        />
        <ol className="space-y-2">
          {shop.branches.map((b) => {
            const n = branches.findIndex((m) => m.id === b.id) + 1;
            return (
              <li
                key={b.id}
                className="flex gap-3 rounded-lg border border-slate-200 p-3 text-sm dark:border-slate-700"
              >
                <span
                  aria-hidden
                  className={`mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full text-xs font-semibold ${
                    n > 0
                      ? "bg-red-700 text-white"
                      : "border border-slate-300 text-muted-foreground"
                  }`}
                >
                  {n > 0 ? n : "–"}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{b.name}</p>
                  <p className="flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 flex-none" aria-hidden />
                    {b.address}
                  </p>
                  {b.note && <p className="mt-1 text-xs">{b.note}</p>}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${shop.engName}, ${b.address}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-sky-700 hover:underline dark:text-sky-300"
                  >
                    Google マップで開く
                    <ExternalLink className="h-3 w-3" aria-hidden />
                  </a>
                  {n === 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      公式の一覧に郵便番号が無いため、地図には置いていません。
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
        {shop.website && (
          <a
            href={shop.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:underline dark:text-sky-300"
          >
            公式サイトで営業時間と予約を確認する
            <ExternalLink className="h-3.5 w-3.5" aria-hidden />
          </a>
        )}
      </section>

      {/* 10. 周辺。1店舗の店だけ(複数店舗の店は、どこから測るか決まらない)。 */}
      {nearby.length > 0 && (
        <div className="mt-12">
          <AttractionSpotRail
            heading={`${shop.name}から歩いて行ける観光スポット`}
            description="直線距離の目安です。実際に歩く道のりはこれより長くなります。"
            spots={nearby}
          />
        </div>
      )}

      {/* 11. 出典と確認日 */}
      <section
        id="sources"
        className="mt-12 scroll-mt-20 rounded-lg border border-neutral-200 bg-neutral-50 p-5 dark:border-neutral-700 dark:bg-neutral-900"
      >
        <h2 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
          出典と確認日
        </h2>
        {checked && (
          <p className="mt-1 text-xs text-muted-foreground">
            このページの予約・営業・価格は、{checked}に下の公式ページで確かめました。
          </p>
        )}
        <ul className="mt-3 space-y-2 text-sm">
          {sources.map((s) => (
            <li key={s.url}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link underline underline-offset-2 hover:opacity-80"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <SameNamePages currentHref={path} className="mt-8" />

      {/* 12. 次に読む */}
      {(relatedShops.length > 0 || shop.dish) && (
        <section className="mt-10 space-y-3">
          <h2 className="text-lg font-semibold">
            {shop.dish ? `ほかの${shop.dish.name}の店` : "ほかの店"}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {relatedShops.map((r) => (
              <li key={r.slug}>
                <Link
                  href={r.href}
                  className="block h-full rounded-lg border border-slate-200 p-3 transition hover:border-sky-400 dark:border-slate-700"
                >
                  <span className="block text-sm font-semibold">
                    {r.name}
                    <span className="ml-1 text-xs font-normal italic text-muted-foreground">
                      {r.engName}
                    </span>
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {r.blurb}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          {shop.dish && (
            <p className="text-sm">
              <Link
                href={dishPath(shop.dish.slug)}
                className="font-semibold text-sky-700 hover:underline dark:text-sky-300"
              >
                {shop.dish.name}の店を比べる →
              </Link>
            </p>
          )}
        </section>
      )}

      <AdSenseUnit slot={AD_SLOTS.articleBottom} className="mt-10" />

      <ViewTracker targetType="restaurant" slug={shop.slug} />
    </div>
  );
}

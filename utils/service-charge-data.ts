import "server-only";

import db from "./db";
import {
  aggregateStore,
  buildOverview,
  postcodeArea,
  type ChargeRecord,
  type ServiceChargeOverview,
  type StoreAggregate,
} from "./service-charge";
import type { StoreSearchResult } from "./actions/jobs";

/**
 * サービスチャージ調査の読み出し。ページ(サーバーコンポーネント)からだけ呼ぶ。
 *
 * 以前は回答の送信と同じ utils/actions/jobs.ts("use server")にあった。
 * そこに置いた関数は画面を通さずに外から呼べる窓口になるので、
 * 読者のフォームが呼ぶ searchStores と submitSurvey だけを向こうに残した。
 */

/**
 * アンケートを店舗を選んだ状態で開くための1件。
 *
 * URL の ?store= から引くので、候補リストに正式に載っている店舗だけを返す。
 * 手入力で登録された未確認の店舗をここで通すと、送信時に「候補から選ばれた
 * 回答」として isVerified: true で記録されてしまう。
 */
export async function fetchSurveyStore(
  id: string
): Promise<StoreSearchResult | null> {
  if (typeof id !== "string" || !id || id.length > 100) return null;

  const store = await db.store.findFirst({
    where: { id, isVerified: true },
  });
  if (!store) return null;

  return {
    id: store.id,
    name: store.name,
    address: store.address,
    lat: store.lat,
    lng: store.lng,
    borough: store.borough,
    postcode: store.postcode,
  };
}

/**
 * アンケートの店舗候補の数。ダッシュボードで「回答が届いている店舗は
 * 候補のうち何店舗か」を出す分母にする。
 */
export async function fetchStoreCandidateCount(): Promise<number> {
  return db.store.count({ where: { isVerified: true } });
}

/* ============================================================
 * 集計の取り出し
 *
 * 集計はSQLではなくJS側でまとめて行う。回答は数十件しかなく、
 * groupBy を設問の数だけ並べるより、1回読んで utils/service-charge.ts の
 * 純関数に渡すほうが、店舗単位と回答単位の数字が食い違わない。
 * ========================================================== */

/**
 * 集計と表示に使う列。
 *
 * commentsApprovedAt は自由記述を伏せるかの判定にだけ使い、
 * withApprovedComments を通したあとの ChargeRecord には残らない。
 */
const RECORD_SELECT = {
  id: true,
  placeId: true,
  storeName: true,
  storeAddress: true,
  borough: true,
  postcode: true,
  lat: true,
  lng: true,
  createdAt: true,
  isVerified: true,
  serviceChargeCollected: true,
  distributionType: true,
  amountPeriod: true,
  amountValue: true,
  monthlyHours: true,
  chargeRatePercent: true,
  jobRole: true,
  workPeriod: true,
  kitchenIncluded: true,
  onPayslip: true,
  writtenPolicy: true,
  serviceChargeComment: true,
  mealComment: true,
  generalComment: true,
  commentsApprovedAt: true,
} as const;

type SelectedRecord = ChargeRecord & { commentsApprovedAt: Date | null };

/**
 * 運営者が承認していない回答の自由記述を伏せる。
 *
 * 自由記述は店名と並んで出る文章で、特定の人への非難や、確かめようのない
 * 断定がそのまま載っていた。未承認の回答も選択式の答えは集計と店舗ページに
 * 出し、文章だけを空にする。DB から読んだ回答は必ずここを通すので、
 * 「現場の声 N件」の件数や声の一覧を含め、未承認の文章はどの画面にも届かない。
 * 承認は /admin/service-charges。
 */
function withApprovedComments(rows: SelectedRecord[]): ChargeRecord[] {
  return rows.map(({ commentsApprovedAt, ...record }) =>
    commentsApprovedAt
      ? record
      : {
          ...record,
          serviceChargeComment: null,
          mealComment: null,
          generalComment: null,
        },
  );
}

export async function fetchServiceChargeOverview(): Promise<ServiceChargeOverview> {
  const records = await db.serviceCharge.findMany({
    where: { isVerified: true },
    orderBy: { createdAt: "desc" },
    select: RECORD_SELECT,
  });
  return buildOverview(withApprovedComments(records as SelectedRecord[]));
}

/**
 * 店舗詳細で使う回答。ここだけ isVerified を見ない。
 * 手入力で登録された回答は一覧には出さないが、通知メールのリンクから
 * 内容を確認できる必要があるため。
 */
export async function fetchServiceChargesByPlaceId(
  placeId: string
): Promise<ChargeRecord[]> {
  const records = await db.serviceCharge.findMany({
    where: { placeId },
    orderBy: { createdAt: "desc" },
    select: RECORD_SELECT,
  });
  return withApprovedComments(records as SelectedRecord[]);
}

/**
 * 店舗ページ1枚ぶん。slug から引く。
 *
 * 回答は69件しかないので、1回全部読んで JS 側で店舗ごとにまとめる。
 * slug は店名とポストコードから作る決まりで、SQLの where に書けない
 * (書けば lib/jobs/store-slug.js と規則が二重になる)ため、
 * ここでも集計と同じ関数を通して突き合わせる。
 *
 * isVerified で絞らないのは fetchServiceChargesByPlaceId と同じ理由。
 * 店舗ページはすべて noindex で sitemap にも出さないので、手入力で
 * 登録された店舗も URL を知っている人にしか届かない。
 */
export async function fetchStorePage(slug: string): Promise<{
  store: StoreAggregate;
  records: ChargeRecord[];
  /** 同じポストコード地区の他店舗。回遊と内部リンクのため。 */
  nearby: StoreAggregate[];
} | null> {
  const all = withApprovedComments(
    (await db.serviceCharge.findMany({
      orderBy: { createdAt: "desc" },
      select: RECORD_SELECT,
    })) as SelectedRecord[],
  );

  const byStore = new Map<string, ChargeRecord[]>();
  for (const r of all) {
    const list = byStore.get(r.placeId);
    if (list) list.push(r);
    else byStore.set(r.placeId, [r]);
  }

  const stores = [...byStore.values()].map(aggregateStore);
  const store = stores.find((s) => s.slug === slug);
  if (!store) return null;

  const area = postcodeArea(store.postcode);
  const nearby = area
    ? stores
        .filter(
          (s) =>
            s.placeId !== store.placeId &&
            s.verifiedCount > 0 &&
            postcodeArea(s.postcode) === area,
        )
        .sort((a, b) => b.responseCount - a.responseCount)
        .slice(0, 6)
    : [];

  return {
    store,
    records: byStore.get(store.placeId) ?? [],
    nearby,
  };
}

/**
 * 店舗ページの slug 一覧。generateStaticParams から呼ぶ。
 *
 * 店舗ページは検索には出さないが、一覧から辿る人のためにビルド時に
 * 全店ぶん描いておく。
 */
export async function fetchStoreSlugs(): Promise<string[]> {
  const records = withApprovedComments(
    (await db.serviceCharge.findMany({
      orderBy: { createdAt: "desc" },
      select: RECORD_SELECT,
    })) as SelectedRecord[],
  );

  const byStore = new Map<string, ChargeRecord[]>();
  for (const r of records) {
    const list = byStore.get(r.placeId);
    if (list) list.push(r);
    else byStore.set(r.placeId, [r]);
  }

  return [...byStore.values()].map((rows) => aggregateStore(rows).slug);
}

export type ResponseFeedFilter = {
  /** 分配方法での絞り込み。 */
  dist?: string;
  /** 自由記述のある回答だけに絞る。 */
  withComment?: boolean;
};

function feedWhere(filter?: ResponseFeedFilter) {
  const clauses: any[] = [{ isVerified: true }];
  if (
    filter?.dist &&
    ["equal", "gradient", "fixed", "none"].includes(filter.dist)
  ) {
    clauses.push({ distributionType: filter.dist });
  }
  if (filter?.withComment) {
    // 伏せた文章しか無い回答を「自由記述あり」に数えない。
    clauses.push({ commentsApprovedAt: { not: null } });
    clauses.push({
      OR: [
        { serviceChargeComment: { not: null } },
        { mealComment: { not: null } },
        { generalComment: { not: null } },
      ],
    });
  }
  return { AND: clauses };
}

export async function fetchResponseCount(
  filter?: ResponseFeedFilter
): Promise<number> {
  return db.serviceCharge.count({ where: feedWhere(filter) });
}

/** 回答を1件ずつ新着順に返す。店舗ごとにまとめない「声の一覧」用。 */
export async function fetchResponseFeed(
  page: number,
  itemsPerPage: number,
  filter?: ResponseFeedFilter
): Promise<ChargeRecord[]> {
  const records = await db.serviceCharge.findMany({
    where: feedWhere(filter),
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * itemsPerPage,
    take: itemsPerPage,
    select: RECORD_SELECT,
  });
  return withApprovedComments(records as SelectedRecord[]);
}

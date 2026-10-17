"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type Dispatch,
  type SetStateAction,
} from "react";

/**
 * 一覧の絞り込みを URL のクエリに持たせる。
 *
 * 観光スポット・美術館・ミュージカルの一覧は、以前は絞り込みを useState だけで
 * 持っていた。そのせいで次の2つが壊れていた。
 *
 *   - スポット詳細のカテゴリタグは /sightseeing/all?category=museum に
 *     リンクしているのに、一覧は常に「すべて」で始まった。
 *   - 絞り込んで詳細を開き、戻ると条件が消えた。スクロール位置だけは
 *     ブラウザが戻すので、絞り込む前の一覧の途中に放り出された。
 *
 * ここでは状態を URL に書き戻し(replaceState なので履歴は増やさない)、
 * 開いたときに URL から読む。
 *
 * useSearchParams は使わない。静的に描くページで使うと Suspense の内側が
 * クライアント描画になり、一覧の中身がサーバーの HTML から消えるため。
 * サーバーは常に既定値(絞り込みなし)で描き、URL は useSyncExternalStore で読む。
 *
 *   - 初回表示(ハイドレーション): サーバーと同じ既定値で描いてから、
 *     直後に URL の条件へ切り替える。食い違いの警告は出ない。
 *   - 戻る・進む(クライアント側の遷移): 最初の描画から URL の条件で描く。
 *     ブラウザがスクロール位置を戻す時点で、絞り込んだ一覧が出ている。
 */
export type UrlStateCodec<T> = {
  /** この一覧が URL に書くキー。ほかのキー(utm_* など)には触らない。 */
  keys: readonly string[];
  /** 不正な値は既定値に落とす。手で書き換えた URL や古いリンクも来る。 */
  parse: (params: URLSearchParams) => T;
  /** 既定値の項目は null を返して URL から消す。 */
  serialize: (state: T) => Record<string, string | null>;
};

/** URL の値が候補にあればそれを、無ければ null を返す。parse 用。 */
export function pickOne<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T | null {
  return value !== null && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

// URL が変わるのは自分で書き戻したときだけなので購読はしない。
// 値は描画のたびに getSnapshot で読み直される。
const subscribe = () => () => {};
const readSearch = () => window.location.search;
// サーバーとハイドレーション中は「まだ読んでいない」を null で表す。
const readNothing = () => null;

/** codec はモジュールの定数で渡すこと。描画ごとに作ると effect が毎回走る。 */
export function useUrlState<T>(
  codec: UrlStateCodec<T>,
): [T, Dispatch<SetStateAction<T>>] {
  const search = useSyncExternalStore<string | null>(
    subscribe,
    readSearch,
    readNothing,
  );
  const [state, setState] = useState<T>(() =>
    codec.parse(new URLSearchParams(search ?? "")),
  );
  // URL の条件を取り込み済みか。取り込む前に書き戻すと、URL にあった条件を
  // 既定値で上書きして消してしまう。
  const adopted = useRef(search !== null);

  useEffect(() => {
    if (adopted.current || search === null) return;
    adopted.current = true;
    setState(codec.parse(new URLSearchParams(search)));
  }, [codec, search]);

  useEffect(() => {
    if (!adopted.current) return;

    const params = new URLSearchParams(window.location.search);
    for (const key of codec.keys) params.delete(key);
    for (const [key, value] of Object.entries(codec.serialize(state))) {
      if (value) params.set(key, value);
    }

    const next = params.toString();
    if (next === window.location.search.replace(/^\?/, "")) return;

    // Next.js 14.1 以降は replaceState をルーターが拾うので、
    // usePathname などとの食い違いは起きない。
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`,
    );
  }, [codec, state]);

  return [state, setState];
}

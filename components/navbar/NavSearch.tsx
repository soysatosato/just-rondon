"use client";
import { Input } from "../ui/input";
import { useSearchParams, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { useState, useEffect } from "react";

export default function NavSearch() {
  // URLのクエリパラメータ（例：`?search=apple`）を取得するためのフック
  const searchParams = useSearchParams();
  // 現在のURLのパス部分（例：/products）を取得するフック
  // pathname は、ナビゲーション時にURLを更新する際に必要になる
  // const pathname = usePathname(); // その中の `replace` は、現在のURLを変更するが、ブラウザの履歴には残さない（戻るボタンで戻れない）という特徴がある。
  // `useRouter()` は、Next.js のルーター操作を行うためのフック。
  const { replace } = useRouter();
  const [search, setSearch] = useState(
    //searchParams.get("search")` で、`search` という名前のパラメータの値を取得できる。
    searchParams.get("search")?.toString() || ""
  ); //  300ミリ秒以内に連続して入力があった場合、最後の1回だけが実行される。

  // `useDebouncedCallback` は、呼び出しを一定時間遅延させるフック
  const handleSearch = useDebouncedCallback((value: string) => {
    // すでにある searchParams（URLクエリ）を元に、新しい URLSearchParams オブジェクトを作成。
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    replace(`/?${params.toString()}`);
  }, 300);

  //  useEffectが必要なケースは、URLだけが外部から変わったとき
  // ユーザーが URLの ?search=xxx を手で消したり、違うURLにリダイレクトされたとき
  // 他のボタンやナビゲーションで URL が書き換わったとき（例：replace(...) だけされた）
  // このとき input の onChange は 発火しない ので、search 状態は更新されない。
  // つまり input欄には古い文字列が残ったままになるので、useEffectが必要になる
  const searchQuery = searchParams.get("search");
  useEffect(() => {
    if (!searchQuery) {
      setSearch("");
    }
  }, [searchQuery]);

  return (
    <div>
      <Input
        type="text"
        placeholder="find a property..."
        className="maz-w-xs dark:bg-muted"
        onChange={(e) => {
          setSearch(e.target.value);
          handleSearch(e.target.value);
        }}
        value={search}
      />
    </div>
  );
}

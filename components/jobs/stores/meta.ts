// components/jobs/stores/meta.ts
//
// 店舗ページのタイトル・説明文・キーワード。
//
// 検索から来る人は「店名 + サービスチャージ」「店名 + バイト」で引く。
// どのページも同じテンプレートに名前だけ差し込んだ説明文にすると、
// 検索結果のスニペットが全店舗で同じ文になり、クリックの理由が無くなる。
// 店ごとに違う「状態・件数・時給換算」を先に出す。

import { displayWidth, fitTitle, truncateDescription } from "@/lib/seo";
import { DISTRIBUTION_LABEL, type DistributionType } from "@/utils/labels";
import type { StoreAggregate } from "@/utils/service-charge";

const TITLE_SUFFIXES = [
  "のサービスチャージ｜働いた人の証言",
  "のサービスチャージ実態",
  "のサービスチャージ",
];

/**
 * 店名は "Hiden - Japanese Curry Cafe" のように半角だけで30字近いものが多い。
 * 文字数で測ると収まるサフィックスまで落ちてしまうので、表示幅で測る。
 */
export function storeTitle(store: StoreAggregate): string {
  return fitTitle(store.storeName || "店舗", TITLE_SUFFIXES, displayWidth);
}

/** 状態を一文で言い切る。説明文の冒頭に置く部分。 */
function statusSentence(store: StoreAggregate): string {
  switch (store.status) {
    case "unpaid":
      return "「集めたサービスチャージが分配されていない」という回答が届いています。";
    case "fixed":
      return "サービスチャージは「時給に固定額で上乗せ」という回答です。";
    case "shared": {
      const main = (["equal", "gradient"] as DistributionType[])
        .filter((type) => store.distribution[type] > 0)
        .map((type) => DISTRIBUTION_LABEL[type])
        .join("・");
      return `サービスチャージは${main || "スタッフに分配されている"}という回答です。`;
    }
    case "no-charge":
      return "サービスチャージを徴収していない職場という回答です。";
    default:
      return "サービスチャージの分配方法は、まだ回答が集まっていません。";
  }
}

export function storeDescription(store: StoreAggregate): string {
  const parts = [
    `ロンドン「${store.storeName}」で働いた人からの匿名回答${store.responseCount}件。`,
    statusSentence(store),
  ];

  if (store.hourly !== null) {
    parts.push(`時給換算の中央値は£${store.hourly.toFixed(2)}。`);
  }
  if (store.commentCount > 0) {
    parts.push("現場の声も原文のまま載せています。");
  }

  return truncateDescription(parts.join(""), 140);
}

export function storeKeywords(store: StoreAggregate): string[] {
  const name = store.storeName;
  return [
    name,
    `${name} サービスチャージ`,
    `${name} バイト`,
    `${name} 評判`,
    `${name} ロンドン`,
    ...(store.postcode ? [`${name} ${store.postcode}`] : []),
    "ロンドン 飲食店 サービスチャージ",
  ];
}

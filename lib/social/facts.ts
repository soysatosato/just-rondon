/**
 * 出会い・人間関係セクションの事実データを一元管理する。
 *
 * なぜ定数にするか:
 * このセクションで陳腐化するのは「アプリの勢力と料金」「年次イベントの時期」
 * 「相談窓口」の3つだけで、それ以外(パブの round の作法、"the talk" の存在、
 * 誘い方の頻度)は年単位で変わらない。変わるものだけをここに集め、
 * 変わらないものは本文に直書きする。全部を定数化すると本文が読めなくなる。
 *
 * /trouble の contacts.ts と方針が違う点:
 * あちらは「番号を1つ間違えると読者が困る」ので全数値を定数にした。
 * こちらは実害の水準が違うので、金額は「目安」として持ち、
 * 確定値を書けないものは意図的に幅を持たせている。
 *
 * 運用ルール:
 * 1. アプリの料金は変動が激しい。数値そのものより「無料でどこまでできるか」を
 *    優先して書く。金額は目安として扱い、断定しない。
 * 2. 年次イベントは開催月のみ持つ。日程は毎年動くので日付を書かない。
 * 3. 相談窓口の番号は実害に直結するので、ここから必ず参照する。
 *
 * 2026年8月14日に各サービスの公式サイトで確認。
 */

/** 情報の基準時点。記事の dataAsOf バッジに出る。 */
export const SOCIAL_AS_OF = "2026年8月";

/** ISO日付。記事の updatedAt(Article.dateModified)に出る。 */
export const SOCIAL_UPDATED_AT = "2026-08-14";

/**
 * マッチングアプリの勢力図。
 *
 * 順序は「ロンドンで真剣な relationship を探す人の使用率」順。
 * Hinge が先頭なのは、ここ数年ロンドンの20〜30代で
 * 「まず Hinge」がほぼ定着しているため。
 * 料金は変動が激しいので、月額の数値ではなく
 * 「無料でどこまでできるか」を persuasion の軸にする。
 */
export const DATING_APPS = [
  {
    name: "Hinge",
    tagline: "真剣な交際を探す人が最も多い",
    freeTier: "1日に送れる「いいね」に上限あり。無料でも十分にマッチする",
    note: "プロフィールが質問への回答形式。写真だけでなく文章が要る",
  },
  {
    name: "Bumble",
    tagline: "女性から先にメッセージを送る仕組み",
    freeTier: "24時間以内に返信しないとマッチが消える（無料枠だと復活が1日1回）",
    note: "友だち探し用の Bumble BFF、仕事用の Bumble Bizz が同じアプリ内にある",
  },
  {
    name: "Tinder",
    tagline: "利用者数は最大だが、目的の幅が広い",
    freeTier: "スワイプ数に上限。マッチ自体は無料で可能",
    note: "真剣な交際から気軽な出会いまで混在する。プロフィールに目的を書く人が多い",
  },
  {
    name: "Thursday",
    tagline: "木曜だけ動く。当日会う前提",
    freeTier: "木曜以外はアプリが使えない設計",
    note: "オフラインのイベントも開催。メッセージを延々続ける消耗を避けたい人向け",
  },
] as const;

/**
 * 友だちづくりの入口。
 *
 * `japaneseFriendly` は「英語に不安があっても入りやすいか」の目安。
 * 会話量が少ない活動ほど入りやすい、という単純な基準で付けている
 * (走る・登る活動は会話が要らない時間が長い)。
 * 語学力ではなく「会話を強制される密度」で並べるのが要点。
 */
export const MEETING_CHANNELS = [
  {
    name: "run club",
    cost: "無料が多い",
    japaneseFriendly: "高い",
    note: "近年のロンドンで最も勢いのある社交の場。走っている間は会話が要らない",
  },
  {
    name: "Meetup",
    cost: "無料〜£10程度",
    japaneseFriendly: "中",
    note: "趣味・言語交換・国際交流。当日キャンセルが多いので人数は当てにしない",
  },
  {
    name: "Bumble BFF",
    cost: "無料枠あり",
    japaneseFriendly: "中",
    note: "同性の友だち探し専用モード。渡英直後の人が多く使う",
  },
  {
    name: "スポーツクラブ・ジムのクラス",
    cost: "£30〜/月",
    japaneseFriendly: "高い",
    note: "同じ時間に同じ顔が揃うので、回数で親しくなれる",
  },
  {
    name: "ボランティア",
    cost: "無料",
    japaneseFriendly: "中",
    note: "チャリティショップの店番など。継続すると確実に顔見知りができる",
  },
  {
    name: "パブのクイズナイト",
    cost: "参加費£2程度",
    japaneseFriendly: "低い",
    note: "英語の速度と文化的な知識が要る。誘われたら行く場所で、初手ではない",
  },
] as const;

/**
 * 日本人コミュニティの年次イベント。
 *
 * 日程は毎年動くので月のみ持つ。日付を書くと必ず古くなる。
 */
export const JAPANESE_EVENTS = [
  { name: "Hyper Japan", month: "7月・冬", note: "英国最大級の日本文化イベント" },
  { name: "Japan Matsuri", month: "9月頃", note: "屋外開催の日本祭り。無料" },
  { name: "盆踊り・夏祭り", month: "7〜8月", note: "日本人会や寺院が主催" },
] as const;

/**
 * デート・交際まわりの安全に関わる窓口。
 *
 * ここだけは /trouble/contacts.ts と同じ厳密さで扱う。
 * 番号の誤りが実害に直結するため、本文に直接書かない。
 */
export const SAFETY_CONTACTS = {
  /** 生命に関わる緊急時。 */
  emergency: "999",
  /** 緊急ではない警察への連絡。 */
  nonEmergency: "101",
  /**
   * バーやパブで、店員に助けを求めるための合言葉。
   * 「Angela はいますか」と聞くと、店員が安全に退出させてくれる。
   * 英国の多くの店舗が参加しているが、全店ではない。
   */
  askForAngela: "Ask for Angela",
  /** ストーカー被害の専門相談窓口。/trouble/stalking-harassment と共通。 */
  stalkingHelpline: "0808 802 0300",
} as const;

/** 出典。裏取りせずに書き換えないこと。 */
export const SOCIAL_SOURCES = [
  {
    label: "GOV.UK - Ask for Angela（安全に助けを求める仕組み）",
    url: "https://www.gov.uk/government/news/ask-for-angela",
  },
  {
    label: "Suzy Lamplugh Trust - National Stalking Helpline",
    url: "https://www.suzylamplugh.org/pages/category/national-stalking-helpline",
  },
  {
    label: "Meetup - London のグループ検索",
    url: "https://www.meetup.com/cities/gb/london/",
  },
] as const;

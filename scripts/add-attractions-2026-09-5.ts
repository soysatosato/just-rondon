/**
 * /sightseeing にロンドンパス対象の6スポットを追加する（2026-09 第5弾）。
 *
 *   npx tsx scripts/add-attractions-2026-09-5.ts            # ドライラン
 *   npx tsx scripts/add-attractions-2026-09-5.ts --apply    # 投入
 *   npx tsx scripts/add-attractions-2026-09-5.ts --apply --slug=golden-hinde
 *
 * 冪等。slug で upsert し、AttractionStory は source: "authored" で作り直す。
 *
 * ------------------------------------------------------------------
 * なぜこの6件なのか
 * ------------------------------------------------------------------
 * Go City 自身の対象ディレクトリ(113件)と Attraction テーブルを突き合わせ、
 * **有料でパスが入場料を肩代わりするのに、こちらに行が無い**ものを拾った。
 * 選定の考え方は scripts/set-london-pass-attractions.ts の冒頭と同じ。
 *
 * このうち3件(カティサーク・郵便博物館・コートールド)は Museum テーブルに
 * 既に行がある。**Museum には londonPass 列が無い**ため、/sightseeing/passes の
 * 対象一覧に出せず、詳細ページにバッジも出せなかった。両テーブルに同じ
 * スポットを持つ例は既にある(london-transport-museum / household-cavalry-museum /
 * royal-observatory-greenwich が同一 slug で重複)ので、その前例に合わせている。
 *
 * 見送ったもの:
 * - Twist Museum、Museum of Illusions(既存の paradox-museum-london と題材が重なる)
 * - Swingers、QUEENS、Flip Out、Activate、Game Vault、Soho Comedy Factory
 *   (遊興施設であって観光スポットではない)
 * - 徒歩ツアー・食事系が計15件ほど(運営会社ごとの商品で、内容が薄い)
 * - ブレナム宮殿、ストーンヘンジ、ブライトン(ロンドン外)
 * - ラムセス展(年号付きの会期物。料金と会期に内容が尽きるため除外する方針)
 *
 * ------------------------------------------------------------------
 * 本文の書き方
 * ------------------------------------------------------------------
 * 基準は scripts/seed-attraction-stories-level5.ts の冒頭が正典。
 *   1. 因果を書く。年号の羅列にしない
 *   2. 固有名詞と数字を入れる
 *   3. 俗説は訂正する
 *   4. **事実(料金・アクセス・開館・所要)は書かない。**ファクトバーが持つ
 *   5. highlight は作らない。visitFlow があるページでは伏せられるため
 *
 * 今回は3件で俗説の訂正が入っている:
 *   - カティサーク: 2007年の火事で船が失われたという報道は誤り。修復中で
 *     マストと外板の多くが場外の倉庫にあった。現存する外殻の約9割が進水当時のもの
 *   - ゴールデン・ハインド号: 張りぼてではない。14万マイル以上を実際に航海し、
 *     1979年に世界一周している
 *   - 近衛歩兵博物館: グレナディア・ガーズがワーテルローで破ったのは帝国親衛隊の
 *     擲弾兵ではなく猟歩兵。同じ熊毛帽をかぶっていたため取り違えられた
 *
 * 閉じの `**` を句読点・全角の閉じ括弧の直後に置かないこと。
 * CommonMark の right-flanking 規則で太字にならず `**` が生で出る。
 * 投入前に検出して止めるチェックを main() に入れてある。
 *
 * ------------------------------------------------------------------
 * SOURCES(全件 2026-09-07 に確認)
 * ------------------------------------------------------------------
 * カティサーク
 *   https://www.rmg.co.uk/cutty-sark
 *   https://www.rmg.co.uk/cutty-sark/history/fire
 *   https://en.wikipedia.org/wiki/Cutty_Sark
 *   https://www.dezeen.com/2012/04/25/cutty-sark-by-grimshaw/
 *   https://grimshaw.global/projects/culture-and-exhibition/the-cutty-sark-conservation-project/
 * 郵便博物館・メールレール
 *   https://en.wikipedia.org/wiki/London_Post_Office_Railway
 *   https://www.postalmuseum.org/blog/why-did-mail-rail-close/
 *   https://www.timeout.com/london/museums/the-postal-museum-and-mail-rail
 *   https://www.artfund.org/explore/museums-and-galleries/the-postal-museum
 *   https://gocity.com/en/london/attractions/postal-museum
 * コートールド・ギャラリー
 *   https://courtauld.ac.uk/gallery/plan-your-visit/
 *   https://courtauld.ac.uk/gallery/about-the-courtauld-gallery/
 *   https://en.wikipedia.org/wiki/Courtauld_Gallery
 *   https://www.nationalgallery.org.uk/about-us/history/collectors-and-benefactors/samuel-courtauld
 *   https://en.wikipedia.org/wiki/Self-Portrait_with_Bandaged_Ear
 * ゴールデン・ハインド号
 *   https://www.goldenhinde.co.uk/visit
 *   https://en.wikipedia.org/wiki/Golden_Hinde_(1973)
 *   https://en.wikipedia.org/wiki/Golden_Hind
 *   https://www.cabinet.ox.ac.uk/drake-chair-1662
 * 近衛歩兵博物館
 *   https://gocity.com/en/london/attractions/guards-museum
 *   https://en.wikipedia.org/wiki/The_Guards_Museum
 *   https://www.nam.ac.uk/explore/coldstream-guards
 *   https://www.nam.ac.uk/explore/grenadier-guards
 *   https://changing-guard.com/foot-guards.html
 * カートゥーン・ミュージアム
 *   https://www.cartoonmuseum.org/visit-us
 *   https://victorianweb.org/art/illustration/leech/101.html
 *   https://en.wikipedia.org/wiki/Punch_(magazine)
 *   https://en.wikipedia.org/wiki/The_Cartoon_Museum
 *
 * 画像はすべて Wikimedia Commons。imageinfo と HTTP 200 を確認済み。
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** 0=月 〜 6=日。scripts/seed-attraction-closed-days.ts と同じ並び。 */
const MON = 0;

type Story = {
  kind: "history" | "context" | "trivia" | "practical";
  heading: string | null;
  body: string;
};

type NewSpot = {
  slug: string;
  name: string;
  engName: string;
  tagline: string;
  summary: string;
  address: string;
  lat: number;
  lng: number;
  image: string;
  website: string;
  category: string;
  recommendLevel: number;
  isFree: boolean;
  isForKids: boolean;
  mustSee: boolean;
  priceAdult: string | null;
  priceChild: string | null;
  durationText: string | null;
  nearestStation: string | null;
  /** 時刻だけ。休みの曜日は closedWeekdays が持つ。 */
  openingHours: string | null;
  closedWeekdays: number[];
  closedDaysCheckedAt: Date | null;
  closedNote: string | null;
  area: string | null;
  stories: Story[];
};

const CHECKED = new Date("2026-09-07");

export const SPOTS: NewSpot[] = [
  /* =================================================================
   * 1. カティサーク
   * =================================================================
   * 料金・開館は 2026-09-07 に rmg.co.uk から取得:
   *   大人£22 / 子ども£11、毎日 10:00-17:00(最終入場 16:15)
   */
  {
    slug: "cutty-sark",
    name: "カティサーク",
    engName: "Cutty Sark",
    tagline: "スエズ運河に仕事を奪われた、最後の茶クリッパー",
    summary:
      "1869年に進水した、現存する唯一の茶クリッパー。中国から新茶を運ぶ速さの競争のために造られたが、進水の5日前にスエズ運河が開通し、目的そのものが失われた。船はオーストラリアの羊毛航路で本領を発揮する。2012年の再公開にあたって船体は乾ドックの底から3メートル持ち上げられ、見学者は船底の下に立って、速さのために絞り込まれた船体の線を見上げられる。",
    address: "King William Walk, Greenwich, London SE10 9HT, UK",
    lat: 51.4827,
    lng: -0.0096,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2c/Cutty_Sark%2C_Greenwich_-_geograph.org.uk_-_4387927.jpg",
    website: "https://www.rmg.co.uk/cutty-sark",
    category: "historic",
    recommendLevel: 4,
    isFree: false,
    isForKids: true,
    mustSee: false,
    priceAdult: "£22",
    priceChild: "£11",
    durationText: "1〜2時間",
    nearestStation: "Cutty Sark（DLR）徒歩2分",
    openingHours: "10:00〜17:00（最終入場16:15）",
    closedWeekdays: [],
    closedDaysCheckedAt: CHECKED,
    closedNote:
      "マラソンなど地域の催しに合わせて臨時休館する日がある。行く前に公式の案内を確認すること。",
    area: "greenwich",
    stories: [
      {
        kind: "history",
        heading: "スエズ運河が開いた5日後に進水した",
        body: `**1869年11月22日**、スコットランドのダンバートンで進水した。目的ははっきりしていた。中国から茶を運ぶ競争に勝つことである。当時の茶クリッパーは、その年の新茶を最初にロンドンへ届けた船が高値を取れた。速さがそのまま金になる商売だった。

ところがその**5日前**、地中海と紅海をつなぐ**スエズ運河**が開通していた。帆船は運河を自力で通れない。風の通らない狭い水路では曳船が要る。いっぽう蒸気船は運河を抜けて航路を数千マイル縮められる。この船は、自分の仕事が成り立たなくなる知らせとほぼ同時に世に出たことになる。

茶の航路から締め出された船が本領を発揮したのは、**オーストラリアの羊毛**だった。1880年代、船長**リチャード・ウッジェット**のもとでシドニーからロンドンまで**73日**という記録的な航海を重ね、同じ航路の蒸気船を抑えて羊毛を届けている。用途を失った船が、別の航路で最速になった。

1895年にポルトガルの船主へ売られ**フェレイラ**と改名。1922年、英国の船長**ウィルフレッド・ダウマン**が港でその姿に気づいて買い戻した。世界に残る茶クリッパーは、いまこの1隻だけである。`,
      },
      {
        kind: "context",
        heading: "鉄の骨に木を張って、船を細くした",
        body: `船体は**コンポジット構造**という作りである。骨組みを錬鉄で組み、その上から木の外板を張る。木だけで造ると強度を出すために肋材を太くせねばならず、船が重くなって遅くなる。鉄の骨にすれば骨を細くでき、そのぶん船倉が広がり、船体の線を絞り込める。速さのための工法だった。

材も部位で使い分けている。水線から下は弾力のある**ロックエルム**、上は**チーク**。さらに船底には**マンツメタル**という真鍮の一種を張った。フジツボや海藻が付くと船足が落ちるため、それを防ぐ金属である。

2012年の再公開にあたり、設計事務所**グリムショー**はこの船体を乾ドックの底から**3メートル**持ち上げた。12基の鋼の架台が船を支えている。船の下に人が立てるようにしたのは、この船の値打ちが甲板の上ではなく**船底の形**にあるからである。上から眺めるだけでは、なぜ速かったのかが分からない。`,
      },
      {
        kind: "trivia",
        heading: "船名の意味は「丈の短い肌着」",
        body: `カティサークとは、スコットランド語で**丈の短い肌着**を指す言葉である。船名の出どころは、詩人**ロバート・バーンズ**が1790年に書いた物語詩『**タム・オ・シャンター**』にある。

酔って夜道を帰る農夫タムが、廃教会で魔女たちの宴を覗き見る。その中に**ナニー**という若い魔女がいて、丈の足りない肌着——カティサーク——だけを身につけて踊っていた。思わず「よくやった、カティサーク」と声を上げてしまったタムは、気づかれて魔女たちに追われ、命からがら逃げる。

船首像はこのナニーである。腕を前へ突き出しているのは、詩の中で彼女がタムの馬の尾を掴み取る場面を写しているため。**速い船に、追いかけてくる者の名を付けた**わけである。船主のジョン・ウィリスはスコットランド人で、この詩は当時の国民的な愛唱詩だった。`,
      },
      {
        kind: "context",
        heading: "2007年の火事は、報じられたほど失われていない",
        body: `**2007年5月21日**、修復工事の最中に船が燃えた。炎に包まれる映像が世界中に流れ、歴史的な帆船が失われたと報じられた。

実際には違う。火が出たとき、この船は**解体して直している途中**だった。マストも、外板の多くも、すでに取り外されて場外の倉庫に入っていた。燃えたのは現場に残っていた部分である。船の材の**半分以上は火の届かない場所にあった**。いま見えている外殻は、**約9割が進水当時のもの**である。

とはいえ無傷ではない。工期は**18か月**延び、費用は**1千万ポンド**増えた。再公開は**2012年4月**で、エリザベス2世が行っている。火元は、工事期間中に電源を入れたままにされていた**業務用の集塵機**とされた。

この一件は、火災報道の見出しと実際の被害がどれだけずれるかの例としてよく引かれる。世界中が失われたと思った船は、修復中だったおかげで助かっている。`,
      },
    ],
  },

  /* =================================================================
   * 2. 郵便博物館（メール・レール）
   * =================================================================
   * 料金・開館は 2026-09-07 に Time Out / Art Fund / Go City で照合:
   *   大人£17.60 / 16-24歳£12.20 / 子ども£10、火〜日 10:00-17:00
   *   月曜休(学校休暇期間は開く)。切符は1年間有効。
   *
   * ★ 休館曜日で出典が割れた。SEO 系の記事が「水〜日(月火休)」と書くが、
   *   Art Fund・Time Out・Go City の3件はいずれも「火〜日(月休)」で一致。
   *   公式サイトは Cloudflare でボットを弾くため直接確認できていない。
   */
  {
    slug: "postal-museum",
    name: "郵便博物館（メール・レール）",
    engName: "The Postal Museum & Mail Rail",
    tagline: "渋滞を避けて地下に掘られた、世界初の無人運転鉄道",
    summary:
      "ロンドンの地下に眠る郵便専用鉄道メール・レールに乗れる博物館。1927年開業、運転士のいない世界初の鉄道で、最盛期には1日400万通の郵便が街路の渋滞と無関係に運ばれた。2003年に運行を終えたが、トンネルは埋められずに残り、いまは見学用の小さな車両が当時の坑道を走る。地上の展示は500年ぶんの郵便の歴史を扱う。",
    address: "15-20 Phoenix Place, London WC1X 0DA, UK",
    lat: 51.5236,
    lng: -0.1119,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/8e/A_Mail_Rail_train_at_the_Postal_Museum_-_geograph.org.uk_-_6416017.jpg",
    website: "https://www.postalmuseum.org",
    category: "museum",
    recommendLevel: 3,
    isFree: false,
    isForKids: true,
    mustSee: false,
    priceAdult: "£17.60（1年間有効）",
    priceChild: "£10（3〜15歳）／£12.20（16〜24歳）",
    durationText: "1時間30分〜2時間",
    nearestStation: "Farringdon 徒歩10分 / Russell Square 徒歩10分",
    openingHours: "10:00〜17:00（メール・レールの最終便15:30）",
    closedWeekdays: [MON],
    closedDaysCheckedAt: CHECKED,
    closedNote: "学校の休暇期間は月曜も開く。メール・レールは事前予約が要る。",
    area: null,
    stories: [
      {
        kind: "history",
        heading: "道が詰まったので、地下に鉄道を掘った",
        body: `20世紀の初め、ロンドンの郵便は馬車と自動車で街路を運ばれていた。ところが市街の混雑がひどく、数マイルの距離に何時間もかかる。地上が使えないなら地下を通せばいい——という結論で掘られたのが**メール・レール**である。

**1927年**開業。線路の幅は**2フィート**（約61センチ）しかない。人を乗せないと決めたからこの幅で足りた。運転士も置かなかった。**世界初の無人運転鉄道**であり、ロンドン地下鉄で自動運転が始まる**ヴィクトリア線**（1967年）より40年早い。

西のパディントンから東のホワイトチャペルまで**6.5マイル**、8つの駅を結んだ。側線を含めた線路の総延長は**22マイル**に及ぶ。最盛期には**1日400万通**を運んでいる。地上でどれだけ車が詰まろうと、郵便だけは街の下を止まらずに流れていた。

この発想自体は当時の郵便事業では突飛でない。空気圧で筒を送る管路がすでに使われており、それを本格的な鉄道に置き換えたのがこの路線である。`,
      },
      {
        kind: "context",
        heading: "止まった理由は、老朽化ではない",
        body: `**2003年5月**、メール・レールは76年の運行を終えて止まった。設備が壊れたからでも、トンネルが崩れたからでもない。**道路で運んだほうが安かった**からである。

郵便公社の試算では、この鉄道を使う費用は同じ量を道路で運ぶ場合の**3倍から5倍**にのぼった。無人運転とはいえ、トンネルと軌道と車両を保守する人手は要る。いっぽう地上ではトラックが大型化し、仕分けの拠点そのものが郊外へ移っていた。**ロンドンの中心部を東西に貫く線路が、そもそも要らない配置**に変わっていたのである。

つまりこの鉄道は、機械として寿命が尽きたのではない。運ぶべき荷物のほうが別の道を選んだために止まった。

閉鎖後もトンネルは埋め戻されず、そのまま放置された。埋めるにも金がかかるからである。10年以上たって見学路として開き直せたのは、この「手を付けられずに残った」状態があったからだった。`,
      },
      {
        kind: "trivia",
        heading: "乗るのは、当時の車両ではない",
        body: `見学者が乗るのは、**この見学のために新しく作られた車両**である。当時の郵便列車は人を運ぶ想定がないので、そもそも座る場所がない。ここを誤解したまま行くと、期待が少しずれる。

走るトンネルのほうは本物で、1927年に掘られたものをそのまま使っている。断面は円く、天井は低い。走るのは**マウント・プレザントの地下に残る区間**で、全長6.5マイルの本線をたどるわけではない。

途中で照明を落とし、坑道の壁面に当時の作業の映像を投影する演出が入る。郵便を仕分けていた頃のプラットホームの跡が、通過するときに見える。使われなくなった駅がそのまま暗がりに残っているのは、この路線が**廃止ではなく放置**という形で終わったためである。`,
      },
      {
        kind: "practical",
        heading: "車椅子では乗れない。建物も2つに分かれている",
        body: `メール・レールの車両には**車椅子では乗れない**。天井が低く通路が狭いうえ、座席へ乗り移る必要があるためで、これは設備の制約として公式に案内されている。乗れない人のために、館内には同じ経路を映像でたどる**バーチャル版**が用意されている。

もう一つ、行く前に知っておくと迷わないことがある。**博物館とメール・レールは別の建物**で、フェニックス・プレイスという道を挟んで向かい合っている。切符は共通だが、展示を見てから道を渡って乗り場へ行く、という動きになる。雨の日は傘を出す場面がある。

閉所が苦手な人は、トンネルの区間が15分ほど続くことを頭に入れておくとよい。途中で降りることはできない。`,
      },
    ],
  },

  /* =================================================================
   * 3. コートールド・ギャラリー
   * =================================================================
   * 料金・開館は 2026-09-07 に courtauld.ac.uk の Plan your visit から:
   *   大人£16(寄付込み) / £14、18歳未満は無料、毎日 10:00-18:00(最終入場17:15)
   */
  {
    slug: "courtauld-gallery",
    name: "コートールド・ギャラリー",
    engName: "The Courtauld Gallery",
    tagline: "英国最古の展覧会場に、英国が買わなかった絵が掛かっている",
    summary:
      "サマセット・ハウスの北棟にある美術館。マネ《フォリー＝ベルジェールのバー》とゴッホ《包帯をした自画像》を持つ、印象派・ポスト印象派の名品で知られる。実業家サミュエル・コートールドが1920年代、英国の美術館がまだ手を出していなかった時期に集めた作品が中心。展示室のグレート・ルームは、ロイヤル・アカデミーの夏季展のために建てられた英国最古の展覧会場である。",
    address: "Somerset House, Strand, London WC2R 0RN, UK",
    lat: 51.511,
    lng: -0.117,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/f/f2/Courtauld_Gallery%2C_Staircase.jpg",
    website: "https://courtauld.ac.uk/gallery/",
    category: "museum",
    recommendLevel: 3,
    isFree: false,
    isForKids: false,
    mustSee: false,
    priceAdult: "£16（寄付込み）／£14",
    priceChild: "18歳未満は無料",
    durationText: "1時間30分〜2時間",
    nearestStation: "Temple 徒歩5分",
    openingHours: "10:00〜18:00（最終入場17:15）",
    closedWeekdays: [],
    closedDaysCheckedAt: CHECKED,
    closedNote: "特別展の会期中は閉館時刻が延びることがある。",
    area: "westminster",
    stories: [
      {
        kind: "history",
        heading: "人造絹糸で得た金で、誰も買わない絵を買った",
        body: `**サミュエル・コートールド**（1876〜1947）は、繊維会社コートールズを率いた実業家である。同社が財を成したのは**レーヨン**——木材パルプから作る人造絹糸だった。本物の絹より安く、見た目と手ざわりは絹に近い。20世紀前半の女性の服を変えた素材である。

その金で彼が買ったのが、当時の英国ではまだ評価の定まっていなかった**フランス印象派・ポスト印象派**の絵だった。1920年代の話である。パリでは既に価値が認められつつあったが、ロンドンの美術館はほとんど手を出していない。**英国の美術界は、この一群の絵を50年ちかく無視していた**。

コートールドは自分のために買うだけで終わらせなかった。**1923年、テート・ギャラリーへ5万ポンドを寄付**している。国のために買え、という趣旨の基金だった。この**コートールド基金**で23点が購入され、マネ、ルノワール、スーラ、ドガ、ゴッホが英国の国有コレクションに入る。

その絵は1950年代から60年代にかけて、「もう現代美術ではない」という理由でナショナル・ギャラリーへ移された。いまトラファルガー広場で当たり前のように見られる印象派の一部は、この一人の寄付から来ている。`,
      },
      {
        kind: "context",
        heading: "ここは英国でいちばん古い展覧会場である",
        body: `展示の中心となる**グレート・ルーム**は、絵を掛けるために建てられた部屋としては英国最古のものである。サマセット・ハウスは建築家**ウィリアム・チェンバーズ**の設計で1780年代に完成し、学術団体を収める目的で作られた。その一つが**ロイヤル・アカデミー**だった。

**1780年から1836年までの57年間**、アカデミーの**夏季展**はこの部屋で開かれている。当時の展示は壁一面に床から天井まで絵を掛ける方式で、目の高さの列——**オン・ザ・ライン**——に掛けてもらえるかどうかが画家の死活問題だった。ロンドンの美術界の中心は、比喩ではなく物理的にこの一室にあった。

入口の上には、いまもギリシャ語の銘が残る。**ΟΥΔΕΙΣ ΑΜΟΥΣΟΣ ΕΙΣΙΤΩ**——「ムーサに縁なき者、入るべからず」。アカデミーが自らの権威を刻んだ言葉である。

その部屋にいま掛かっているのが、**アカデミーの美学を壊した側の絵**であるのは、なかなかの皮肉だ。印象派は官展に落とされ続けた画家たちの運動だった。2018年9月から**コートールド・コネクツ**と呼ばれる改修に入り、2021年11月に再開している。`,
      },
      {
        kind: "trivia",
        heading: "マネの鏡は、どう見ても計算が合わない",
        body: `**エドゥアール・マネ**の《**フォリー＝ベルジェールのバー**》（1882）は、この館でいちばん人が立ち止まる絵である。カウンターに立つ女性の背後は一面の鏡で、劇場の客席が映り込んでいる。

問題はその鏡像だ。正面を向いた女性の後ろ姿が、**なぜか右へ大きくずれて**映っている。しかも鏡の中の彼女は、山高帽の男性客と向かい合って話している。ところが絵の手前——女性の正面——には誰も立っていない。その男がいるべき位置は、**絵を見ている我々の場所**である。

これが画家の失敗なのか、意図した仕掛けなのかは、100年以上論じられていまだ決着していない。写真のように正確に描く技術を持っていた画家が、鏡だけを外している。マネはこの絵を描いた翌年に亡くなった。

絵の前に立ったら、まず女性の顔を正面から見て、それから鏡の中の彼女を探すとよい。ずれに気づいた瞬間、絵の居心地が変わる。`,
      },
      {
        kind: "trivia",
        heading: "ゴッホの包帯が右耳にある理由",
        body: `**フィンセント・ファン・ゴッホ**の《**包帯をした自画像**》（1889年1月）も、この館の顔である。前年の暮れにアルルで耳を切った直後、傷がまだ癒えないうちに描かれた。

絵では**右耳**に包帯が巻かれている。しかし記録に残っているのは**左耳**の負傷である。矛盾ではない。自画像は鏡を見て描くので左右が入れ替わる。画家は鏡に映った自分をそのまま写しただけである。

背景に日本の版画が掛かっているのも見落とさないほうがいい。ゴッホは浮世絵を集めて模写しており、**輪郭線と平坦な色面**という浮世絵の方法は、彼の絵の作り方そのものに入り込んでいる。人生でいちばん追い詰められた時期の自画像に、その版画をわざわざ描き込んでいる。`,
      },
    ],
  },

  /* =================================================================
   * 4. ゴールデン・ハインド号
   * =================================================================
   * 料金・開館は 2026-09-07 に goldenhinde.co.uk の Plan your visit から:
   *   大人£6 / 子ども(3-16)£6 / 家族4名£20、4-10月 10:00-18:00、
   *   11-3月 10:00-17:00(最終入場は閉館30分前)
   */
  {
    slug: "golden-hinde",
    name: "ゴールデン・ハインド号",
    engName: "Golden Hinde",
    tagline: "張りぼてではない。14万マイルを走った本物の帆船",
    summary:
      "ロンドン橋のたもとの船だまりに浮かぶ、フランシス・ドレイクの旗艦の実物大復元船。1973年にデヴォンの造船所で当時の工法をなぞって建造され、係留されたままではなく実際に航海した。走行距離は14万マイルを超え、1979年には原型と同じく世界一周を果たしている。撮影用の模型と思って通り過ぎる人が多いが、大西洋も太平洋も渡った本物の船である。",
    address: "St Mary Overie Dock, Cathedral Street, London SE1 9DE, UK",
    lat: 51.5069,
    lng: -0.0906,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/3/38/Golden_Hinde_03.jpg",
    website: "https://www.goldenhinde.co.uk",
    category: "historic",
    recommendLevel: 3,
    isFree: false,
    isForKids: true,
    mustSee: false,
    priceAdult: "£6",
    priceChild: "£6（3〜16歳）／3歳未満は無料",
    durationText: "45分〜1時間",
    nearestStation: "London Bridge 徒歩5分",
    openingHours: "4〜10月 10:00〜18:00 / 11〜3月 10:00〜17:00（最終入場は閉館30分前）",
    closedWeekdays: [],
    closedDaysCheckedAt: CHECKED,
    closedNote:
      "貸切の催しや整備で臨時に閉まる日がある。遠回りして寄るなら事前に電話で確認するのが確実。",
    area: "southbank",
    stories: [
      {
        kind: "context",
        heading: "これは飾りではない。地球を回ってきた船である",
        body: `ロンドン橋のたもとの狭い船だまりに、16世紀の帆船が浮かんでいる。多くの人はこれを街角に据えられた**張りぼて**か、動かない撮影用の模型だと思って通り過ぎる。それは間違っている。

この船は**1973年**、デヴォン州**アップルドア**の造船所で、当時の工法をなぞって建造された木造帆船である。建造後は係留されたままではなく、**実際に外洋へ出た**。これまでに走った距離は**14万マイル以上**——地球を5周する以上になる。**1979年**には原型と同じく世界一周を果たした。

つまりこの復元船は、**原型のゴールデン・ハインド号が生涯に走った距離をとうに超えている**。乗り込むときに踏む甲板は、大西洋も太平洋も渡ってきた本物の船の甲板である。船体が小さいことに驚く人が多いが、驚くべきはむしろ、この大きさで世界を一周できたという事実のほうだ。`,
      },
      {
        kind: "history",
        heading: "ペリカン号が航海の途中で名を変えた理由",
        body: `**フランシス・ドレイク**が1577年にプリマスを発ったとき、旗艦の名は**ペリカン号**だった。ゴールデン・ハインドではない。改名したのは航海の途中、1578年に南米のマゼラン海峡へ入る直前である。

理由は政治だった。その直前、ドレイクは反乱を企てたとして**トマス・ダウティ**という乗組員を裁判にかけ、処刑している。ダウティは航海の出資者の一人**クリストファー・ハットン**に近い人物だった。世界の裏側で仲間を斬っておいて、帰国後にハットンの怒りをどう収めるか。ドレイクにとっては死活問題である。

そこで彼は、船をハットンの紋章にちなんで改名した。ハットンの紋章は**金色の雌鹿**——ゴールデン・ハインドである。船名を替えることで後ろ盾に敬意を示した。処世術としては露骨だが、効いた。

1580年に帰還し、翌**1581年**、エリザベス1世はデプトフォードでこの船の甲板の上でドレイクにナイトの位を授けている。積んで帰った財宝は、当時の国庫の歳入を上回ったといわれる。`,
      },
      {
        kind: "trivia",
        heading: "原型は、朽ちるまで見世物にされた",
        body: `世界一周から戻った原型の船を、エリザベス1世は解体させなかった。**後世への記念として**デプトフォードの造船所に専用のドックを築き、そこへ据えて公開したのである。**世界最初の保存船**と呼ばれることがあるのは、このためだ。

ただし当時、木造船を長期保存する技術はない。船は雨風にさらされて少しずつ傷んでいった。**1618年**、ヴェネツィア大使の秘書はその姿を「**死んだ馬の、さらされた肋骨と剥き出しの頭骨のよう**」と書き残している。それでも見物人は途切れず、1650年代にとうとう崩れ落ちた。

残った健全な材からは椅子が作られた。そのうちの一脚は**1662年**にオックスフォードの**ボドリアン図書館**へ贈られ、いまも同館のディヴィニティ・スクールに置かれている。船は失われたが、木は座るものになって残った。`,
      },
      {
        kind: "practical",
        heading: "階段が急で、館内にトイレが無い",
        body: `船の中は、行く前に構造を知っておいたほうがよい。16世紀の船をそのまま再現しているため、**段差と天井の低さが現代の基準に合っていない**。

乗り込むところで**5段**の階段があり、**段差を避けて入る経路は無い**。船内の層をつなぐのは幅の狭い急な階段で、はしごに近い角度のものもある。天井が低く、背の高い人は下の層でかがむ必要がある。車椅子とベビーカーでの見学は構造上できない。

もう一つ、**館内に見学者用のトイレが無い**。ロンドン・ブリッジ駅かバラ・マーケットで済ませてから来ること。

滞在は45分から1時間ほどなので、順路としては先にサザーク大聖堂とバラ・マーケットを回り、最後にこの船へ寄る形が動きやすい。いずれも徒歩5分の範囲に固まっている。`,
      },
    ],
  },

  /* =================================================================
   * 5. 近衛歩兵博物館（ガーズ・ミュージアム）
   * =================================================================
   * 料金・開館は 2026-09-07 に Go City の施設ページから:
   *   大人£11 / 子ども(6-15)£3 / 5歳以下無料、毎日 10:00-16:00(最終入場15:30)
   *   公式サイト theguardsmuseum.com はボットを弾くため直接確認できず。
   */
  {
    slug: "guards-museum",
    name: "近衛歩兵博物館（ガーズ・ミュージアム）",
    engName: "The Guards Museum",
    tagline: "衛兵交代式へ行く前に、赤い制服の読み方を覚える場所",
    summary:
      "バッキンガム宮殿に隣接するウェリントン兵舎の地階にある、近衛歩兵5個連隊の博物館。グレナディア、コールドストリーム、スコッツ、アイリッシュ、ウェルシュの各連隊の歴史と制服を扱う。上着のボタンの並び方で連隊を見分ける方法がここで分かるので、先に寄ってから衛兵交代式へ行くと、赤い塊にしか見えなかったものが読めるようになる。",
    address: "Wellington Barracks, Birdcage Walk, London SW1E 6HQ, UK",
    lat: 51.5008,
    lng: -0.1344,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/dc/London_-_Wellington_Barracks_-_geograph.org.uk_-_7484484.jpg",
    website: "https://theguardsmuseum.com",
    category: "museum",
    recommendLevel: 2,
    isFree: false,
    isForKids: false,
    mustSee: false,
    priceAdult: "£11",
    priceChild: "£3（6〜15歳）／5歳以下は無料",
    durationText: "45分〜1時間",
    nearestStation: "St James's Park 徒歩5分",
    openingHours: "10:00〜16:00（最終入場15:30）",
    closedWeekdays: [],
    closedDaysCheckedAt: CHECKED,
    closedNote:
      "現役の軍施設の中にあるため、式典や警備の都合で予告なく閉まる日がある。",
    area: "westminster",
    stories: [
      {
        kind: "context",
        heading: "ボタンの間隔で、どの連隊かが分かる",
        body: `宮殿の門に立つ赤い制服の衛兵は、全員が同じ連隊ではない。**近衛歩兵**は5個連隊あり、日によって任務に就く連隊が替わる。見分ける方法があって、しかも双眼鏡が要らないほど簡単である。**上着のボタンの並び方**を見ればよい。

- **グレナディア・ガーズ**——ボタンが等間隔に1つずつ
- **コールドストリーム・ガーズ**——2つずつの組
- **スコッツ・ガーズ**——3つずつの組
- **アイリッシュ・ガーズ**——4つずつの組
- **ウェルシュ・ガーズ**——5つずつの組

この数字は**連隊が作られた順番**と一致している。いちばん古い連隊が1つずつ、5番目が5つずつという並びで、制服の飾りがそのまま序列の表記になっている。

熊毛帽の羽根飾りでも区別がつく。グレナディアは左に白、コールドストリームは右に赤、スコッツは羽根なし、アイリッシュは右に青、ウェルシュは左に白と緑。**衛兵交代式へ行く前にこの館へ寄る**という順番にしておくと、式の見え方が変わる。`,
      },
      {
        kind: "history",
        heading: "国王の親衛隊は、国王を処刑した軍の生き残りである",
        body: `**コールドストリーム・ガーズ**は、英国正規陸軍で**現役最古の連隊**である。創設は**1650年**。ただしその成り立ちには、王室の親衛隊としては具合の悪い事実がある。この連隊は**オリヴァー・クロムウェルの新模範軍**の部隊として生まれた。

創設者は**ジョージ・マンク**大佐。共和国側の指揮官として、1650年のダンバーの戦いでスコットランド王党派を破った側にいた人物である。チャールズ1世を処刑した体制の軍だ。

ところが**1660年1月**、マンクはスコットランド国境の村**コールドストリーム**から連隊を率いてロンドンへ南下し、議会を再開させ、結果として**チャールズ2世の王政復古**を実現させてしまう。翌1661年、新模範軍は解体された。マンクの連隊だけが例外的に残されたのは、陸軍内の反乱鎮圧に用いられて有用性を証明したためである。

連隊名の由来が王都でも戦場でもなく、**国境の小さな村の名**であるのはこのためだ。連隊の標語は**Nulli Secundus**——「何者にも次がず」。1番目を名乗るグレナディアより自分たちのほうが古い、という当てこすりが込められている。`,
      },
      {
        kind: "trivia",
        heading: "熊毛帽は、間違えた相手から取った戦利品",
        body: `**グレナディア・ガーズ**の熊毛帽は、**1815年のワーテルローの戦い**の褒賞である。ナポレオンの**帝国親衛隊**を打ち破った功により、相手のかぶっていた熊毛帽と、擲弾をかたどった帽章を与えられた。連隊が「グレナディア」（擲弾兵）を名乗るのもこのときからである。

ただしここには、広く信じられている**誤り**が混じっている。実際に彼らが正面から当たったのは、帝国親衛隊の**擲弾兵**ではない。ナポレオンは精鋭の擲弾兵をプランスノワへ回してプロイセン軍に当てており、近衛歩兵の前に現れたのは**猟歩兵**（シャスール）だった。猟歩兵も同じ熊毛帽をかぶっていたため、硝煙と混乱のなかで取り違えられ、そのまま定着した。

つまりこの帽子は、**間違えた相手から取った戦利品**ということになる。なお「グレナディア・ガーズ」が正式な連隊名になるのは、ワーテルローから62年後の**1877年**である。`,
      },
      {
        kind: "context",
        heading: "近衛の博物館は2つある。ここは歩兵のほう",
        body: `ロンドンには近衛部隊の博物館が**2つ**あり、よく取り違えられる。ここ**近衛歩兵博物館**が扱うのは徒歩の5個連隊である。もう一つ、ホワイトホールのホース・ガーズにある**ハウスホールド・キャバルリー博物館**が扱うのは騎馬の2個連隊——**ライフ・ガーズ**と**ブルーズ・アンド・ロイヤルズ**だ。

この2つを合わせて**ハウスホールド・ディヴィジョン**（近衛師団）と呼ぶ。宮殿の門に立つのが歩兵、ホワイトホールで馬に乗っているのが騎兵、と覚えればよい。制服の色も違う。ライフ・ガーズは赤い上着に白い兜飾り、ブルーズ・アンド・ロイヤルズは紺の上着に赤い兜飾りである。

この館が入る**ウェリントン兵舎**は、衛兵交代式に出る部隊が実際に整列する場所でもある。月・水・金の午前中には、これから宮殿へ向かう新しい衛兵が兵舎の前庭で整列するところを、柵の外から見られる。`,
      },
    ],
  },

  /* =================================================================
   * 6. カートゥーン・ミュージアム（漫画博物館）
   * =================================================================
   * 料金・開館は 2026-09-07 に cartoonmuseum.org の Visit us から:
   *   大人£12(1年間有効) / 18歳未満無料、火〜土 10:30-17:30、
   *   日 12:00-16:00、月休。毎月最終木曜は20:00まで。
   *   公式サイトが「London Pass 保持者は無料」と明記している。
   */
  {
    slug: "cartoon-museum",
    name: "カートゥーン・ミュージアム（漫画博物館）",
    engName: "The Cartoon Museum",
    tagline: "「カートゥーン」という言葉の意味が変わった場所の話",
    summary:
      "18世紀の風刺版画から今朝の新聞の政治漫画まで、英国の風刺画250年ぶんを一続きに扱う小さな博物館。ホガース、ギルレイ、ローランドソンに始まり、『パンチ』を経て『ビーノ』『ダンディ』へ至る系譜が同じ階に並ぶ。オックスフォード・ストリートから一本入ったフィッツロヴィアのウェルズ・ストリートにあり、1時間ほどで一巡できる。",
    address: "63 Wells Street, Fitzrovia, London W1A 3AE, UK",
    lat: 51.5177,
    lng: -0.1372,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/c4/Cartoon_Museum_Wells_St.png",
    website: "https://www.cartoonmuseum.org",
    category: "museum",
    recommendLevel: 2,
    isFree: false,
    isForKids: true,
    mustSee: false,
    priceAdult: "£12（1年間有効）",
    priceChild: "18歳未満は無料",
    durationText: "1時間",
    nearestStation: "Goodge Street 徒歩5分 / Oxford Circus 徒歩7分",
    openingHours: "火〜土 10:30〜17:30 / 日 12:00〜16:00（毎月最終木曜は20:00まで）",
    closedWeekdays: [MON],
    closedDaysCheckedAt: CHECKED,
    closedNote: "展示の入れ替え期間に短期の休館が入ることがある。",
    area: "soho",
    stories: [
      {
        kind: "history",
        heading: "1843年、皮肉ひとつで言葉の意味が入れ替わった",
        body: `**カートゥーン**（cartoon）はもともと、フレスコ画を描く前に実物大で引く**下絵**を指す言葉だった。いまの「風刺画・漫画」という意味になったのは、**1843年**のロンドンで起きた、ひとつの当てこすりが発端である。

当時、焼失した**ウェストミンスター宮殿**の再建にあたって、内部を飾る壁画の下絵を公募する展覧会が開かれていた。国費を投じて壮麗な絵を選ぶ催しである。これに対し風刺雑誌『**パンチ**』は、貧民が街にあふれているときに壁の絵へ金を使うのか、と噛みついた。

1843年7月15日号に載った**ジョン・リーチ**の絵は、ぼろをまとった貧しいロンドン子たちが立派な絵画展を見物している図で、題は「**カートゥーン第1番——実体と影**」。宮殿の下絵展を茶化して、自分たちの風刺画に同じ名を付けたのである。

これが評判を取り、以後『パンチ』の中心となる風刺画は単に「カートゥーン」と呼ばれるようになった。**皮肉のために借りた言葉が、そのまま新しい意味になって世界中へ広がった**わけである。`,
      },
      {
        kind: "context",
        heading: "ギルレイとビーノが同じ階に並ぶ理由",
        body: `この館の収蔵は、18世紀の銅版画から今朝の新聞の風刺画まで、**250年ぶんが一続き**になっている。乱暴な並べ方に見えるが、英国の風刺画の歴史では、これが自然な並びである。

出発点は**ウィリアム・ホガース**、**ジェームズ・ギルレイ**、**トーマス・ローランドソン**。18世紀後半のロンドンでは、版画商の店先の窓に最新の風刺画が貼り出され、人だかりができた。新聞より早く、字が読めない人にも届く**大衆メディア**だったのである。ギルレイの描いた小男のナポレオンや、太った田舎紳士の**ジョン・ブル**は、そのまま国民的なイメージとして定着した。

19世紀には『パンチ』が政治風刺の型を作り、20世紀に入ると『**ビーノ**』や『**ダンディ**』といった子供向けの漫画が同じ系譜を引き継ぐ。デニスやミニー・ザ・ミンクスの乱暴さは、ギルレイの毒を薄めた版と言っていい。

英国はついに、**上等な風刺と下世話な漫画を制度として分けなかった**。だから同じ館の同じ階に並んでいる。`,
      },
      {
        kind: "trivia",
        heading: "行くたびに違う絵が出ている",
        body: `展示は**入れ替え制**である。紙の作品は光に弱く、掛けたままにすると退色するため、常設展示という形が取りにくい。行くたびに違う絵が出ていると思ってよい。逆に言えば、目当ての一枚を見に行く場所ではない。

館は**2019年**に、ブルームズベリーのリトル・ラッセル・ストリートから、フィッツロヴィアの**ウェルズ・ストリート**へ移ってきた。オックスフォード・ストリートの人混みから一本入っただけで、通りは急に静かになる。

この館の特徴は、**来館者が声を出して笑う**ことである。美術館としては珍しい。もっとも風刺画はもともと、店先で立ち止まった通行人を笑わせるために作られたものだ。静かに鑑賞されるほうが、本来の姿から遠い。`,
      },
    ],
  },
];

const APPLY = process.argv.includes("--apply");
const ONLY = process.argv.find((a) => a.startsWith("--slug="))?.slice(7);

/**
 * 太字が本当に描画されるかを、実際にレンダリングして確かめる。
 *
 * 正規表現で `。**` を探す方式は使えない。開き側の `**` も同じ形になるため
 * (「〜である。**次に**」は正しい)、区別が付かず誤検出だらけになる。
 * CommonMark の right-flanking 規則は前後の文字の組み合わせで決まるので、
 * scripts/scan-db-markdown-bold.ts と同じく描画結果に生の `**` が
 * 残るかどうかで判定する。
 */
const renderMd = (md: string): string =>
  renderToStaticMarkup(
    React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, md),
  );

function boldViolations(body: string): string[] {
  if (!body.includes("**")) return [];
  const html = renderMd(body);
  if (!html.includes("**")) return [];
  /* 描画結果から ** の周辺を切り出して報告する。本文側を正規表現で
     切って再描画すると、切った時点で ** が不対応になり嘘の検出が出る。 */
  const plain = html.replace(/<[^>]+>/g, "");
  return [...plain.matchAll(/\*\*/g)].map((m) =>
    plain.slice(Math.max(0, (m.index ?? 0) - 24), (m.index ?? 0) + 12),
  );
}

async function main() {
  const targets = SPOTS.filter((s) => !ONLY || s.slug === ONLY);
  if (ONLY && targets.length === 0) {
    console.error(`slug=${ONLY} はこのスクリプトの対象外です`);
    process.exitCode = 1;
    return;
  }

  console.log(APPLY ? "== 投入 ==\n" : "== ドライラン(--apply で投入) ==\n");

  for (const spot of targets) {
    const existing = await prisma.attraction.findUnique({
      where: { slug: spot.slug },
      select: { id: true },
    });
    const nameClash = await prisma.attraction.findFirst({
      where: { name: spot.name, slug: { not: spot.slug } },
      select: { slug: true },
    });

    const chars = spot.stories.reduce((n, s) => n + s.body.length, 0);
    const closed = spot.closedDaysCheckedAt
      ? spot.closedWeekdays.length
        ? spot.closedWeekdays.map((d) => "月火水木金土日"[d]).join("・")
        : "無し"
      : "未調査";
    console.log(
      `${spot.name} (${spot.slug})\n` +
        `  ${existing ? "既存を更新" : "新規"} / ${spot.category} / lv${spot.recommendLevel} / ` +
        `${spot.stories.length}本 ${chars}字 / 休館 ${closed}`,
    );

    if (nameClash) {
      console.error(`  ✗ name が ${nameClash.slug} と衝突します。name は @unique です`);
      process.exitCode = 1;
      continue;
    }

    let bad = 0;
    for (const s of spot.stories) {
      const v = boldViolations(s.body);
      v.forEach((h) => {
        console.error(`  ✗ 太字違反: …${h}…`);
        bad++;
      });
      console.log(
        `    ${s.kind.padEnd(9)} ${s.heading ?? "(既定ラベル)"}  ${s.body.length}字`,
      );
    }
    if (bad > 0) {
      process.exitCode = 1;
      continue;
    }

    if (!APPLY) {
      console.log("");
      continue;
    }

    const { stories, ...cols } = spot;
    const saved = await prisma.attraction.upsert({
      where: { slug: spot.slug },
      create: cols,
      update: cols,
      select: { id: true },
    });

    // 読み物は作り直す。source: "authored" なので移行スクリプトは触らない。
    await prisma.$transaction([
      prisma.attractionStory.deleteMany({ where: { attractionId: saved.id } }),
      prisma.attractionStory.createMany({
        data: stories.map((s, i) => ({
          attractionId: saved.id,
          kind: s.kind,
          heading: s.heading,
          body: s.body,
          displayOrder: i + 1,
          source: "authored",
        })),
      }),
    ]);
    console.log("    → 投入\n");
  }

  const total = targets.reduce(
    (n, s) => n + s.stories.reduce((m, t) => m + t.body.length, 0),
    0,
  );
  console.log(`対象 ${targets.length}件 / 本文 合計 ${total}字`);
  if (!APPLY) console.log("\n--apply を付けると投入します。");
}

if (process.argv[1]?.includes("add-attractions-2026-09-5")) {
  main()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

/**
 * /museums にさらに12館を追加する（2026-09 その2）。
 *
 *   npx tsx scripts/add-museums-2026-09-2.ts            # 何が起きるか表示
 *   npx tsx scripts/add-museums-2026-09-2.ts --apply    # 投入
 *   npx tsx scripts/add-museums-2026-09-2.ts --apply --slug=kenwood-house
 *
 * 冪等。slug で upsert し、付随データ(MuseumInfo / OpeningHours /
 * Highlight / Trivia / MuseumVisitStep)は毎回作り直す。Artwork だけは
 * 作品ページの URL(/museums/[slug]/artworks/[id])を変えないよう、
 * engTitle で探して update する。
 *
 * ------------------------------------------------------------------
 * なぜこの12館なのか
 * ------------------------------------------------------------------
 * Museum 側に無かった館のうち、次の2群。
 *
 * (1) どちらのテーブルにも無かった8館
 *   V&Aイースト・ミュージアム   2026年4月18日開館、無料。今年いちばん大きな新館
 *   ヘイワード・ギャラリー       サウスバンク・センターの現代美術館
 *   ダリッジ美術館               1817年公開、イングランド最古の公共美術館
 *   サーチ・ギャラリー           チェルシーの現代美術館
 *   ハンテリアン博物館           外科の標本館。2023年に再開、無料
 *   ジョンソン博士の家           英語辞典が編まれた家
 *   ヘンデル・ヘンドリックス・ハウス ヘンデルとヘンドリックスが隣同士に住んだ家
 *   ウィリアム・モリス・ギャラリー 無料。モリス関連はケルムスコット・ハウスと
 *                                  エメリー・ウォーカーの家が観光スポット側にある
 *
 * (2) 観光スポット(Attraction)側にしか無かった4館
 *   ロンドン・ミュージアム   london-museum-smithfield
 *   ロイヤル・アカデミー     royal-academy-of-arts
 *   ケンウッド・ハウス       kenwood-house-hampstead
 *   クイーンズ・ハウス       queens-house-greenwich
 *
 * (2) は前回の方針(両方に置かない)の例外になる。ケンウッドのフェルメールと
 * レンブラント、クイーンズ・ハウスのアルマダ・ポートレートは、Museum 側の
 * 作品ページの形式でしか書けないため。URL が2本になる問題は
 * lib/museum-attraction-pairs.ts に対応を足して、相互リンクで受ける。
 *
 * ------------------------------------------------------------------
 * 開館時間と料金は「読んで」取っている(2026-09-30)
 * ------------------------------------------------------------------
 * OpeningHours は jsonld.ts の openingHoursSpecification として検索結果に
 * 出るので、公式サイト(読めないものは ianvisits など第三者の最新の記載)を
 * 読んで書き写した。記憶で書いていたら外していたもの:
 *
 *   - ハンテリアン博物館は日曜・月曜休
 *   - ヘンデル・ヘンドリックス・ハウスは月曜・火曜休
 *   - ジョンソン博士の家は日曜が12〜16時だけ
 *   - ヘイワード・ギャラリーは土曜だけ20時まで
 *   - ロイヤル・アカデミーの無料のコレクション・ギャラリーは2025年10月から
 *     2027年まで工事で閉鎖中。所蔵品の一部はファイン・ルームズで無料公開
 *     (2027年1月29日まで、11〜16時)
 *   - ウィリアム・モリス・ギャラリーは改修で閉館中、2026年10月3日再開
 *
 * ★ ロンドン・ミュージアムは2026年11月28日開館で、執筆時点では開館時間が
 *   未発表(公式の Visit ページにも無い)。OpeningHours は1行も作らない。
 *   構造化データに推測の時間を出さないため。開館後に hours を埋めて
 *   --slug=london-museum-smithfield で流し直すこと。本文と歩き方の1歩目も
 *   開館前の書き方になっている。
 *
 * ------------------------------------------------------------------
 * 本文の書き方(前回と同じ)
 * ------------------------------------------------------------------
 *   - description は markdown。MuseumAbout.tsx が改行で段落に割って
 *     react-markdown に通す。閉じの ** を句読点・閉じ括弧の直後に
 *     置かないこと。このスクリプトは実際に描画して生の ** が残らないかを
 *     投入前に確かめ、残っていれば止まる
 *   - summary / blurb / highlights[] / Highlight / Trivia / MuseumVisitStep は
 *     プレーンテキスト
 *   - Artwork の description と highlights は作品ページで react-markdown を
 *     通る。館ページに出るのは recommendLevel 3 かつ mustSee の作品だけ
 *     (utils/actions/museums.ts)なので、今回の作品はすべてそれに揃える
 *
 * 画像はすべて Wikimedia Commons。Commons API の imageinfo で確認済み。
 * 原寸が大きいもの(館の写真で最大11MB、作品で3〜5千ピクセル)は
 * 縮小版を使う。横長の館写真は1920px、縦長と作品は1280px。
 */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** 月〜日の7要素。null は休館。 */
type Hours = ([string, string] | null)[];

type NewArtwork = {
  title: string;
  /** 照合キー。再実行時はこれで既存行を探して update する。 */
  engTitle: string;
  artist: string;
  year: string;
  room?: string | null;
  image: string;
  /** markdown。 */
  description: string;
  /** markdown 可。作品ページで箇条書きになる。 */
  highlights: string[];
};

type NewMuseum = {
  slug: string;
  name: string;
  engName: string;
  tagline: string;
  /** markdown。段落は改行で区切る。 */
  description: string;
  /** プレーンテキスト。1行目が要約、以降 "・" 始まりの箇条。 */
  summary: string;
  /** 詩的な一文。プレーンテキスト。 */
  blurb: string;
  /** 一覧のタグと検索に使う短い語を3つ。 */
  highlights: string[];
  price: number;
  /** 画面には出ない。企画展込みなど上位の料金の控え。 */
  tourPrice: number;
  address: string;
  lat: number;
  lng: number;
  image: string;
  website: string;
  recommendLevel: number;
  isForChildren: boolean;
  /** null は開館時間が未発表。OpeningHours を作らない。 */
  hours: Hours | null;
  info: {
    photographyAllowed?: string | null;
    reservationRequired?: boolean | null;
    cloakroomInfo?: string | null;
    nearestStation?: string | null;
    stationWalkingMinutes?: number | null;
    nearestBusStop?: string | null;
    busStopWalkingMinutes?: number | null;
    guidedTourAvailable?: boolean | null;
    guidedTourLanguages?: string | null;
    guidedTourFee?: number | null;
    cafeteriaAvailable?: boolean | null;
    shopAvailable?: boolean | null;
    admissionFeeAdult?: number | null;
    admissionFeeStudent?: number | null;
    admissionFeeChild?: number | null;
    recommendedDuration?: number | null;
  };
  highlightSpots: { title: string; location?: string | null; body: string }[];
  trivia: { title: string; content: string }[];
  visitFlow: {
    kind: "arrival" | "highlight" | "missable" | "tip";
    title: string;
    body: string;
  }[];
  artworks?: NewArtwork[];
};

const O = (o: string, c: string): [string, string] => [o, c];
const X = null;
const DAILY = (o: string, c: string): Hours => DAYS.map(() => O(o, c));

export const MUSEUMS: NewMuseum[] = [
  /* =================================================================
   * 1. V&Aイースト・ミュージアム
   * =================================================================
   * SOURCES
   *   https://www.vam.ac.uk/east
   *   https://en.wikipedia.org/wiki/V%26A_East
   *   https://www.timeout.com/london/news/the-v-a-east-will-open-this-weekend-heres-everything-you-need-to-know-about-the-major-new-london-museum-041526
   *
   * 公式(2026-09-30)より:
   *   「Daily: 10.00 – 18.00. Thursday and Saturday: 10.00 – 22.00」
   *   「Admission is free. Some exhibitions and events carry a separate charge」
   *   「East Bank, 107 Carpenters Rd, Queen Elizabeth Olympic Park, Stratford, London E20 2AR」
   * Wikipedia: 2026-04-18 開館、V&Aの6拠点目、O'Donnell + Tuomey、5階建て、
   *   形の違う479枚のプレキャスト・パネル、常設 Why We Make に500点超、
   *   3万人超の若者に意見聴取。ストアハウスは2025年5月開館(DS+R)
   */
  {
    slug: "va-east-museum",
    name: "V&Aイースト・ミュージアム",
    engName: "V&A East Museum",
    tagline: "オリンピック公園の水辺に開いた、「いま」を扱うV&Aの新館",
    description: `2012年ロンドン五輪の会場跡、クイーン・エリザベス・オリンピック・パークの水辺に**2026年4月18日**に開いた、V&A（ヴィクトリア＆アルバート博物館）の新館。サウス・ケンジントンの本館、ベスナル・グリーンのヤングV&A、スコットランドのV&Aダンディーなどに続く、V&Aとして**6つ目の拠点**にあたる。入館は無料。

本館が数千年ぶんの工芸とデザインを時代と素材で分けて見せるのに対し、こちらが向いているのは**いま**である。常設展示「**Why We Make**（なぜ人はものを作るのか）」には、V&Aの収蔵品から選んだ**500点以上**が並ぶ。1744年に仕立てられた絹のドレスと、2023年の地元サッカークラブ、ウォルサムストウFCのユニフォームが、同じ問いの下に置かれている。アレキサンダー・マックイーンやヴィヴィアン・ウエストウッドの服、カーニバルやバレエの衣装、ヤインカ・イロリの椅子もここにある。

設計はアイルランドの建築事務所**オドネル＋トゥオミー**。形のすべて異なる479枚のプレキャスト・コンクリートのパネルで包んだ、5階建ての建物である。計画の段階で、3万人を超える若い人から意見を集めたという。木曜と土曜は22時まで開いていて、夜の博物館として使える。`,
    summary:
      "V&Aが「いま」の文化を扱うために建てた無料の新館\n・2026年4月18日開館\n・常設展示 Why We Make に500点以上\n・木曜と土曜は22時まで開館",
    blurb:
      "18世紀の絹のドレスと地元クラブのサッカーのユニフォームが、「なぜ作るのか」という同じ問いの答えとして並んでいる。",
    highlights: ["2026年開館", "現代のデザイン", "夜22時まで"],
    price: 0,
    tourPrice: 0,
    address: "East Bank, 107 Carpenters Road, London E20 2AR",
    lat: 51.5419,
    lng: -0.0135,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/V%26A_East_-_2025-08-24.jpg/1920px-V%26A_East_-_2025-08-24.jpg",
    website: "https://www.vam.ac.uk/east",
    recommendLevel: 4,
    isForChildren: false,
    hours: [O("10:00", "18:00"), O("10:00", "18:00"), O("10:00", "18:00"), O("10:00", "22:00"), O("10:00", "18:00"), O("10:00", "22:00"), O("10:00", "18:00")],
    info: {
      reservationRequired: false,
      nearestStation: "Stratford",
      stationWalkingMinutes: 12,
      admissionFeeAdult: 0,
      admissionFeeStudent: 0,
      admissionFeeChild: 0,
      recommendedDuration: 120,
    },
    highlightSpots: [
      {
        title: "常設展示「Why We Make」",
        location: "常設ギャラリー",
        body: "V&Aの収蔵品から選んだ500点以上で、「人はなぜものを作るのか」を問う常設展示です。本館のように時代や素材で部屋を分けるのではなく、問いを軸に組まれているので、1744年の絹のドレスと2023年のサッカーのユニフォームが同じ展示の中に並びます。本館で縦に見てきたものを、ここでは横に切って見ることになります。",
      },
      {
        title: "20世紀以降の作り手たち",
        body: "トリニダード出身で英国のテキスタイルを塗り替えたアルシア・マクニッシュの1959年の布《ゴールデン・ハーベスト》、ロンドン生まれのヤインカ・イロリが2015年に作った椅子《キャプテン・フック》、モリー・ゴダードの服。本館では長い歴史の最後尾に置かれがちな作り手が、ここでは主役として並びます。",
      },
      {
        title: "形の違う479枚のパネルでできた建物",
        location: "外観",
        body: "設計はアイルランドの建築事務所オドネル＋トゥオミー。外壁は形のすべて異なる479枚のプレキャスト・コンクリートのパネルでできていて、見る角度と時間で表情が変わります。公園を歩いて近づくときに、一度立ち止まって全体を見てください。",
      },
    ],
    trivia: [
      {
        title: "3万人の若者が計画に意見を出した",
        content:
          "館長ガス・ケイスリー＝ヘイフォードのもと、建物と展示の計画段階で3万人を超える若い人から意見を集めています。最初から若い来館者を中心に据えて作られた博物館です。",
      },
      {
        title: "倉庫のほうは別の建物",
        content:
          "同じ「V&Aイースト」の名で、2025年5月に倉庫型のストアハウスが先に開いています。設計はニューヨークのディラー・スコフィディオ＋レンフロ。25万点を超える収蔵品と35万冊の本を収めた倉庫の中を歩けるほか、見たい品を予約して手元で見せてもらう仕組みもあります。9万点を超えるデヴィッド・ボウイのアーカイブを収めたデヴィッド・ボウイ・センターもこちらです。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "ストラトフォード駅から公園を抜けて歩く",
        body: "最寄りはストラトフォード駅で、駅前のショッピングセンターを抜け、オリンピック公園に入って水辺まで10〜15分ほど歩きます。正面入口はアクアティクス・センター側の遊歩道に面しています。入館は無料で予約は要りませんが、混む時間帯は入口に列ができることがあります。",
      },
      {
        kind: "highlight",
        title: "まず常設展示「Why We Make」へ",
        body: "常設展示は500点以上あり、「なぜ作るのか」という問いを軸に組まれています。何年のものかより、誰が何のために作ったかを読みながら回ると、18世紀のドレスと現代のユニフォームが同じ場所にある理由が見えてきます。",
      },
      {
        kind: "tip",
        title: "企画展は有料。常設だけでも成立する",
        body: "企画展は別料金です。常設展示だけで1時間半は見られるので、料金を払うかどうかは常設を見終えてから決めても遅くありません。",
      },
      {
        kind: "tip",
        title: "木曜と土曜は夜22時まで",
        body: "木曜と土曜は22時まで開いています。昼のオリンピック公園を歩いたあと、夕方から入って夜に出るという組み立てができます。ほかの曜日は18時で閉まります。",
      },
      {
        kind: "missable",
        title: "ストアハウスは公園の反対側",
        body: "同じV&Aイーストの名を持つ倉庫型のストアハウスは別の建物で、公園の北西側のヒア・イーストにあります。歩くと20分ほどかかるので、両方回るなら半日を見てください。ストアハウスも入館は無料です。",
      },
    ],
  },

  /* =================================================================
   * 2. ロンドン・ミュージアム(スミスフィールド)
   * =================================================================
   * SOURCES
   *   https://www.londonmuseum.org.uk/smithfield/
   *   https://www.londonmuseum.org.uk/visit/
   *   https://www.londonmuseum.org.uk/about/press/press-releases/london-museum-smithfield-will-open-doors/
   *   https://www.londonmuseum.org.uk/blog/smithfield-opening-2026/
   *
   * 公式(2026-09-30)より:
   *   「Opening 28 Nov 2026」「Free to visit」「Smithfield, London EC1A 9AG」
   *   開館時間は未発表(Visit ページも Docklands の時間しか無い)
   *   Real Time / Our Time(13 large installations) / Past Time(Roman street level)
   *   「A six-metre viewing window ... live trains」「Shared Late Nights
   *   (every Friday and Saturday, from November 2026)」
   *   1883年、Sir Horace Jones。Poultry Market は2028年開館
   *
   * ★ 観光スポット側 london-museum-smithfield と対。
   */
  {
    slug: "london-museum-smithfield",
    name: "ロンドン・ミュージアム",
    engName: "London Museum",
    tagline: "ヴィクトリア朝の市場の地下で、ロンドンという街そのものを見る",
    description: `2022年12月にロンドン・ウォールの旧館を閉じたロンドン博物館が、**2026年11月28日**、スミスフィールドの旧市場に移って開く。入館は無料。扱うのはひとつの街、ロンドンそのものである。収蔵は**700万点**で、単一の都市を対象にしたコレクションとしては世界最大とされる。

建物は**1883年**に開いたヴィクトリア朝の青果市場、ジェネラル・マーケット。設計はタワーブリッジやレドンホール・マーケットと同じ**ホレス・ジョーンズ**で、1990年代に市場が閉じてから長く使われずにいた。改装はスタントン・ウィリアムズとアシフ・カーンが担った。

館は3つに分かれる。屋根で覆われた旧市場の通りにある入口の「**Real Time**」は、巨大なスクリーンでいまのロンドンを映す。中央の「**Our Time**」には大型の展示が13点置かれ、昼から夜まで催しが入る。そして地下の「**Past Time**」が常設展示で、床の高さは**ローマ時代の路面**に揃えてある。ここには幅6メートルの窓があり、ガラスの向こうを**テムズリンクの列車**が走っていく。`,
    summary:
      "700万点の収蔵品でロンドンという街を見せる、無料の博物館\n・2026年11月28日開館\n・1883年の青果市場を改装\n・地下の展示室の窓からテムズリンクの列車が見える",
    blurb:
      "ローマの路面の高さまで降りた展示室の窓の向こうを、いまの通勤電車が走っていく。",
    highlights: ["2026年11月開館", "700万点の収蔵品", "旧スミスフィールド市場"],
    price: 0,
    tourPrice: 0,
    address: "Smithfield, London EC1A 9AG",
    lat: 51.5185,
    lng: -0.1039,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/81/General_Market%2C_Smithfield_-_geograph.org.uk_-_4233961.jpg",
    website: "https://www.londonmuseum.org.uk/smithfield/",
    recommendLevel: 4,
    isForChildren: true,
    hours: null,
    info: {
      nearestStation: "Farringdon",
      stationWalkingMinutes: 4,
      admissionFeeAdult: 0,
      admissionFeeStudent: 0,
      admissionFeeChild: 0,
      recommendedDuration: 150,
    },
    highlightSpots: [
      {
        title: "地下の窓を走るテムズリンク",
        location: "Past Time（地下）",
        body: "常設展示室の壁に幅6メートルの窓が開いていて、すぐ向こうをテムズリンクの列車が走ります。走行中の鉄道を展示の一部にした博物館は、館によれば世界で初めてです。ローマ時代の路面の高さまで降りた部屋で、いまのロンドンの通勤電車を見ることになります。",
      },
      {
        title: "チープサイドの宝飾品",
        location: "Past Time（地下）",
        body: "1912年、シティのチープサイドで建物を壊していた作業員が地下から掘り当てた、500点近い16〜17世紀の宝飾品です。宝石商が隠したまま取りに戻らなかったと考えられています。ロンドン博物館の収蔵品のなかでも、とりわけ知られた一群です。",
      },
      {
        title: "街の記憶を背負った品々",
        body: "ロンドン市長が乗る黄金の馬車、チャールズ1世が処刑の日に身につけていたとされる肌着、エメリン・パンクハーストのハンガーストライキ章、アンナ・パヴロワの「瀕死の白鳥」の衣装。2017年にホワイトチャペルの下水道で見つかった脂の塊（ファットバーグ）の一片や、バンクシーの《ピラニア》、ザ・クラッシュのポール・シムノンが叩き壊したベースも並びます。",
      },
    ],
    trivia: [
      {
        title: "なぜ引っ越したのか",
        content:
          "旧館は1976年からロンドン・ウォールにありましたが、環状交差点をまたぐ歩行者デッキの上に入口があり、地上からは見つけにくい建物でした。移転先のスミスフィールドはファリンドン駅の目の前で、エリザベス線、テムズリンク、地下鉄が交わる乗り換えの要所です。",
      },
      {
        title: "隣の家禽市場は2028年に開く",
        content:
          "隣接する1960年代の家禽市場（ポウルトリー・マーケット）も博物館の一部になる予定で、企画展の会場、学習センター、収蔵庫が入って2028年に開きます。2026年に開くのは計画の前半です。東のドックランズ博物館は別館としてそのまま残ります。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "開館は2026年11月28日。時間は公式で確かめる",
        body: "開館は2026年11月28日です。この記事を書いた時点では、開館時間はまだ公表されていません。常設展示は無料ですが、開館直後は混雑が予想されるので、出かける前に公式サイトで時間と入場方法を確かめてください。",
      },
      {
        kind: "arrival",
        title: "ファリンドン駅から歩いて数分",
        body: "最寄りはファリンドン駅で、エリザベス線、テムズリンク、地下鉄のメトロポリタン線・サークル線・ハマースミス＆シティ線が使えます。駅から市場の建物までは歩いて数分です。入口は、屋根で覆われた旧市場の通りにある「Real Time」の区画です。",
      },
      {
        kind: "highlight",
        title: "地下へ降りて、ローマの路面の高さへ",
        body: "常設展示「Past Time」は地下にあり、床の高さがローマ時代の路面に揃えてあります。降りていくこと自体が、2000年ぶんの地層を下ることになる作りです。時代順の展示と主題ごとの展示が組み合わされています。",
      },
      {
        kind: "missable",
        title: "窓の前で列車を一本待つ",
        body: "地下の展示室には幅6メートルの窓があり、そこをテムズリンクの列車が通ります。展示を見ながら通り過ぎてしまわず、窓の前で一本待ってみてください。この館にしかない眺めです。",
      },
      {
        kind: "tip",
        title: "金曜と土曜は夜の催しがある",
        body: "金曜と土曜の夜は、DJの入る催しが開館直後から毎週予定されています。昼に展示を見て、夜にもう一度寄るという使い方ができる博物館です。",
      },
      {
        kind: "tip",
        title: "ドックランズ博物館と取り違えない",
        body: "同じ館の別館、ドックランズ博物館（London Museum Docklands）はカナリー・ウォーフの近くにあり、移転後も残ります。検索すると両方が出てくるので、行き先を取り違えないようにしてください。",
      },
    ],
  },

  /* =================================================================
   * 3. ヘイワード・ギャラリー
   * =================================================================
   * SOURCES
   *   https://southbank.london/see-and-do/hayward-gallery
   *   https://en.wikipedia.org/wiki/Hayward_Gallery
   *   https://draughtslondon.com/anish-kapoor-at-hayward-gallery-2026/
   *
   * 公式(southbankcentre.co.uk)は bot 対策で読めず、サウスバンク地区の
   * 公式案内で確認(2026-09-30):
   *   「Tue–Fri 10am–6pm Sat 10am–8pm Sun 10am–6pm Closed Mon」
   * アニッシュ・カプーア展(2026-06-16〜10-18): 大人£22、12〜16歳£9、12歳未満無料
   */
  {
    slug: "hayward-gallery",
    name: "ヘイワード・ギャラリー",
    engName: "Hayward Gallery",
    tagline: "所蔵品を持たず、企画展だけで回すコンクリートの現代美術館",
    description: `テムズ川南岸のサウスバンク・センターの中にある、現代美術の展覧会のための美術館。**1968年7月**に開いた。所蔵品による常設展示は持たず、年に3〜4本の大型企画展だけで回している。行けば必ず別のものが見られる代わりに、展覧会の入れ替え期間は閉まる。

建物は打ち放しコンクリートの**ブルータリズム**建築の代表例で、グレーター・ロンドン議会の建築部が設計した。設計チームには、のちに建築グループ「アーキグラム」の中心となるウォーレン・チョークとロン・ヘロンが加わっていた。屋根にはピラミッド形の天窓が並び、2015年から2018年の改修で約60基が作り直されて、上階の展示室に自然光が戻った。

企画展は、国際的な作家の大規模な個展と、ひとつの主題でまとめたグループ展が中心である。2026年6月から10月にかけては、アニッシュ・カプーアがほぼ30年ぶりにこの館に戻り、建物全体を使った個展を開いた。`,
    summary:
      "所蔵品を持たず、企画展だけで回す現代美術館\n・1968年開館のブルータリズム建築\n・年に3〜4本の大型企画展\n・月曜休館、土曜は20時まで",
    blurb:
      "コンクリートの箱は毎回中身を入れ替える。同じ建物に二度入っても、同じものは見られない。",
    highlights: ["現代美術", "ブルータリズム建築", "企画展のみ"],
    price: 22,
    tourPrice: 22,
    address: "Southbank Centre, Belvedere Road, London SE1 8XX",
    lat: 51.5062,
    lng: -0.1155,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Hayward_Gallery%2C_South_Bank_-_from_Waterloo_Bridge_-_geograph.org.uk_-_2282926.jpg/1920px-Hayward_Gallery%2C_South_Bank_-_from_Waterloo_Bridge_-_geograph.org.uk_-_2282926.jpg",
    website: "https://www.southbankcentre.co.uk/venues/hayward-gallery/",
    recommendLevel: 3,
    isForChildren: false,
    hours: [X, O("10:00", "18:00"), O("10:00", "18:00"), O("10:00", "18:00"), O("10:00", "18:00"), O("10:00", "20:00"), O("10:00", "18:00")],
    info: {
      nearestStation: "Waterloo",
      stationWalkingMinutes: 7,
      admissionFeeAdult: 22,
      admissionFeeChild: 9,
      recommendedDuration: 90,
    },
    highlightSpots: [
      {
        title: "ピラミッド形の天窓の下の展示室",
        location: "上階",
        body: "屋根に並ぶピラミッド形の天窓は、この建物の目印です。2015年から2018年の改修で約60基が作り直され、それまで光を遮っていた天井が外されて、上階の展示室に自然光が入るようになりました。晴れた日と曇りの日で、作品の見え方が変わります。",
      },
      {
        title: "ブルータリズムの建物の外側",
        location: "外観",
        body: "打ち放しのコンクリートの箱がいくつも積み重なり、階段と歩廊が外壁に絡みつくように付いています。入る前に、ウォータールー橋の上から全体を見下ろしてください。展示室の箱が重なり合っている様子がよく分かります。",
      },
      {
        title: "その時々の企画展",
        body: "所蔵品を持たない館なので、見どころは毎回の企画展です。国際的な作家の大規模な個展と、ひとつの主題でまとめたグループ展が交互に来ます。何をやっているかを確かめてから行く館で、ふらりと入って常設を見るという使い方はできません。",
      },
    ],
    trivia: [
      {
        title: "風を読んで光っていたネオンの塔",
        content:
          "建物を貫くコンクリートの塔のひとつには、1972年から2008年まで、風の強さと向きに反応して色が変わるネオンの彫刻が載っていました。サウスバンクの夜の目印として、36年間光り続けたものです。",
      },
      {
        title: "アーキグラムの二人が関わった建物",
        content:
          "設計チームにいたウォーレン・チョークとロン・ヘロンは、のちに「歩く都市」などの空想的な都市計画で知られる建築グループ、アーキグラムの中心人物になりました。ヘイワードは、彼らがロンドンの役所の建築部にいたころに関わった、実際に建った建物です。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "月曜は休み。展覧会の入れ替え期間も閉まる",
        body: "開くのは火曜から日曜で、火曜から金曜と日曜は10時から18時、土曜は20時までです。月曜は閉まります。所蔵品を持たない館なので、展覧会と展覧会の間の設営期間は建物ごと閉まります。行く日に何をやっているかを先に確かめてください。",
      },
      {
        kind: "tip",
        title: "チケットは先に取っておく",
        body: "企画展は有料で、2026年のアニッシュ・カプーア展は大人£22、12〜16歳£9、12歳未満は無料でした。料金は展覧会ごとに変わります。人気の展覧会は週末から埋まるので、日にちが決まったら先に買っておくのが確実です。",
      },
      {
        kind: "arrival",
        title: "ウォータールー駅から川のほうへ",
        body: "ウォータールー駅から川に向かって歩いて7分ほどです。対岸のエンバンクメント駅から、ハンガーフォード橋の歩道を渡ってくることもできます。建物が重なり合っていて入口が分かりにくいので、「HAYWARD GALLERY」の文字を目印にしてください。",
      },
      {
        kind: "highlight",
        title: "晴れた日の昼に行く",
        body: "上階の展示室には、屋根のピラミッド形の天窓から自然光が入ります。作品によっては光の具合で見え方が大きく変わるので、晴れた日の昼に行けるならそのほうが得です。",
      },
      {
        kind: "tip",
        title: "川沿いの散歩と組み合わせる",
        body: "すぐ外はテムズ川沿いの遊歩道で、ロイヤル・フェスティバル・ホールや国立劇場、橋の下の古本市が並ぶ一帯です。展覧会のあと、川沿いを東へ歩いてテート・モダンまで流れていく組み立てが作りやすい場所です。",
      },
    ],
  },

  /* =================================================================
   * 4. ダリッジ美術館
   * =================================================================
   * SOURCES
   *   https://www.ianvisits.co.uk/venues/dulwich-picture-gallery/ (2026-07 確認の記載)
   *   https://en.wikipedia.org/wiki/Dulwich_Picture_Gallery
   *   https://en.wikipedia.org/wiki/Portrait_of_Jacob_de_Gheyn_III
   *   https://en.wikipedia.org/wiki/The_Linley_Sisters
   *   https://artuk.org/discover/stories/rembrandts-girl-at-a-window-at-dulwich-picture-gallery
   *
   * 公式は bot 対策で読めず。ianvisits(2026-07確認)と検索結果の公式抜粋より:
   *   「open Tuesday to Sunday from 10am to 5pm. It's usually closed on Monday」
   *   企画展込み £14.50 / 学生 £10.50 / 18歳未満無料。コレクションのみ £10
   */
  {
    slug: "dulwich-picture-gallery",
    name: "ダリッジ美術館",
    engName: "Dulwich Picture Gallery",
    tagline: "ポーランド王のために集めた名画が、ロンドン南郊に残った",
    description: `ロンドン南部の住宅地ダリッジにある、**1817年**に一般公開された美術館。イングランドで最も古い公共美術館で、公開のために一から設計された美術館の建物としても世界で最初のものとされる。設計は**ジョン・ソーン**。

コレクションの始まりは数奇である。18世紀末、ロンドンの画商**デザンファンとブルジョワ**は、ポーランド国王スタニスワフ・アウグストの依頼で、王国の美術館にするための名画を集めていた。ところが**1795年**、ポーランドは周辺国に分割されて消滅し、王は退位する。渡す先を失ったまま、絵はロンドンに残った。ブルジョワはそれを**1811年**、ダリッジの学校に遺贈し、公開のための建物が建てられた。

ソーンは展示室の天井から光を落とし、窓を持たない壁いっぱいに絵を掛けられるようにした。この天窓の展示室は、のちの世界中の美術館の手本になる。レンブラント、プッサン、ルーベンス、ゲインズバラ、ムリーリョ、カナレットが、200年前とほぼ同じ部屋で見られる。建物の中ほどには、コレクションを残した人々が眠る霊廟がある。`,
    summary:
      "イングランド最古の公共美術館で見るオールド・マスター\n・1817年公開、設計はジョン・ソーン\n・レンブラント、プッサン、ゲインズバラ\n・世界で最も多く盗まれた絵がある",
    blurb:
      "国を失った王のために集められた絵が、南ロンドンの芝生の奥で、200年前と同じ天窓の光を浴びている。",
    highlights: ["オールド・マスター", "ジョン・ソーン設計", "最古の公共美術館"],
    price: 10,
    tourPrice: 14.5,
    address: "Gallery Road, London SE21 7AD",
    lat: 51.4461,
    lng: -0.0864,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Dulwich_Picture_Gallery%2C_main_entrance.JPG",
    website: "https://www.dulwichpicturegallery.org.uk/",
    recommendLevel: 4,
    isForChildren: false,
    hours: [X, O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00")],
    info: {
      nearestStation: "West Dulwich",
      stationWalkingMinutes: 10,
      cafeteriaAvailable: true,
      admissionFeeAdult: 10,
      admissionFeeChild: 0,
      recommendedDuration: 90,
    },
    highlightSpots: [
      {
        title: "ソーンの天窓の展示室",
        body: "展示室は窓を持たず、天井の高い位置から光を取り込みます。壁のすべてを絵のために使え、絵にじかに日光が当たらない。この仕組みはのちに世界中の美術館が採り入れました。建築家フィリップ・ジョンソンは「ソーンは絵の見せ方を教えてくれた」と述べています。",
      },
      {
        title: "美術館の中の霊廟",
        body: "展示室の並びの中ほどに、コレクションを残した画商デザンファンとブルジョワらが眠る霊廟があります。絵を見せるための建物の中心に墓が置かれている、世界でも珍しい造りです。ソーンは霊廟にも天井から光を落とし、展示室とは違う色の光で満たしました。",
      },
      {
        title: "レンブラントの小さな2点",
        body: "窓の縁に腕を乗せた少女を描いた《窓辺の少女》と、30センチ四方ほどの板に描かれた《ヤーコプ・デ・ゲイン3世の肖像》。後者は4度盗まれ、そのたびに戻ってきた絵です。どちらも作品のページで詳しく紹介しています。",
      },
    ],
    trivia: [
      {
        title: "世界で最も多く盗まれた絵",
        content:
          "レンブラントの《ヤーコプ・デ・ゲイン3世の肖像》は1966年以降に4度盗まれ、「持ち帰りのレンブラント」と呼ばれるようになりました。見つかった場所は、墓地のベンチの下、自転車の荷台、タクシーの中、ドイツの駅の荷物棚。最も多く盗まれた美術品として、ギネス世界記録に載っています。",
      },
      {
        title: "霊廟を襲った飛行爆弾",
        content:
          "1944年7月12日、ドイツのV1飛行爆弾が近くに落ち、霊廟と西側の展示室が大きく壊れました。このとき霊廟に納められていた遺骸が敷地に散らばったと記録されています。建物は戦後に再建されました。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "ウェスト・ダリッジ駅から住宅街を歩く",
        body: "最寄りは、ヴィクトリア駅から電車で十数分のウェスト・ダリッジ駅で、そこから歩いて10分ほどです。開くのは火曜から日曜の10時から17時で、月曜は閉まります。",
      },
      {
        kind: "tip",
        title: "常設だけなら、コレクション券で足りる",
        body: "企画展と常設をまとめて見る券（大人£14.50）のほかに、常設のコレクションだけを見る券があり、大人£10です。18歳未満は無料。企画展に興味がなければ、コレクション券で十分です。",
      },
      {
        kind: "highlight",
        title: "絵より先に、天井を見上げる",
        body: "展示室には窓がなく、天井から光が落ちてきます。ソーンが考えたこの天窓の展示室が、のちの世界中の美術館の手本になりました。絵を見る前に、部屋そのものを一度見上げてください。",
      },
      {
        kind: "highlight",
        title: "《窓辺の少女》の正面に立つ",
        body: "窓の縁に腕を乗せた少女が、こちらをまっすぐ見ています。レンブラントがこの絵を本当に窓辺に置いて通行人をだましたという逸話が残るほど、生々しい絵です。部屋を横切りながら見るのではなく、正面に立ってください。",
      },
      {
        kind: "missable",
        title: "霊廟を見落とさない",
        body: "展示室の並びの中ほどに、コレクションを残した人々が眠る霊廟があります。展示室の続きのように見えるので、通り過ぎてしまいがちです。絵のために建てた建物の中心に墓を置いた、という設計の意味を考えてみてください。",
      },
      {
        kind: "tip",
        title: "庭のカフェと、ダリッジの村",
        body: "美術館の前の庭にはカフェがあり、美術館が開く前の朝から開いています。芝生の庭と周りのダリッジの村の落ち着いた雰囲気も含めて、中心部から半日かけて来る価値のある場所です。",
      },
    ],
    artworks: [
      {
        title: "窓辺の少女",
        engTitle: "Girl at a Window",
        artist: "レンブラント・ファン・レイン",
        year: "1645年",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Rembrandt_Harmensz_van_Rijn_-_Girl_at_a_Window_-_Google_Art_Project.jpg/1280px-Rembrandt_Harmensz_van_Rijn_-_Girl_at_a_Window_-_Google_Art_Project.jpg",
        description: `**窓の縁に腕を乗せた少女が、こちらを見ています。** それだけの絵が、通りを行く人々を本物の人間だと思い込ませた、という話が残っています。

**まず、目を見てください。** 少し首を傾け、口元はほとんど動いていない。見つめているのか、ただぼんやりしているのか、決めきれない表情です。描いたときのレンブラントは39歳。モデルが誰なのかは分かっておらず、注文の肖像画ではなかったと考えられています。

**次に、画面の下の石の縁を見てください。** 少女はこの縁に腕を乗せ、こちら側へ身を乗り出しています。石の縁は、額縁のすぐ内側に置かれた本物の窓枠のように描かれている。**絵の中と外の境目が、わざと曖昧にされている**のです。

**この絵には有名な逸話があります。** 17世紀末にこの絵を持っていたフランスの著述家ロジェ・ド・ピールによれば、レンブラントはこの絵を自宅の窓に置いた。通りを行く人々は、何日も窓辺から動かない女中を不思議がって足を止めた、というのです。この話は事実ではないとされていますが、そう語られるだけの力がこの絵にはあります。

**筆の跡にも注目を。** 顔と手は細かく描き込まれている一方、白い服の袖は太い筆で大きく塗られています。近づくと筆の跡しか見えず、離れると布になる。**描き込む場所と省く場所の差**が、少女を暗い背景から浮き上がらせています。

この絵はのちに、ウォレス・コレクションにあるレイノルズの《いちご売りの少女》にも影響を与えたと考えられています。`,
        highlights: [
          "窓の縁に腕を乗せ、こちら側へ身を乗り出す少女。絵の内と外の境目がわざと曖昧にされている",
          "レンブラントが窓に置いて通行人をだましたという逸話が残る（事実ではないとされる）",
          "顔と手は細かく、白い袖は太い筆で大きく。描き込む場所と省く場所の差が少女を浮かび上がらせる",
          "レイノルズの《いちご売りの少女》（ウォレス・コレクション）に影響を与えたと考えられている",
        ],
      },
      {
        title: "ヤーコプ・デ・ゲイン3世の肖像",
        engTitle: "Portrait of Jacob de Gheyn III",
        artist: "レンブラント・ファン・レイン",
        year: "1632年",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Rembrandt_Harmensz_van_Rijn_-_Jacob_III_de_Gheyn_-_Google_Art_Project.jpg/1280px-Rembrandt_Harmensz_van_Rijn_-_Jacob_III_de_Gheyn_-_Google_Art_Project.jpg",
        description: `**世界で最も多く盗まれた絵です。** 1966年以降に4度持ち去られ、4度とも戻ってきました。ついたあだ名は「持ち帰りのレンブラント（テイクアウェイ・レンブラント）」。

**まず、大きさを確かめてください。** 縦30センチ、横25センチほどのオーク板。コートの下に隠して持ち出せる寸法です。盗まれ続けた理由のひとつは、この小ささにあります。

**戻ってきた場所が、どれも妙です。** 墓地のベンチの下。自転車の荷台。タクシーの中。ドイツ・ミュンスターの駅の荷物棚。最も多く盗まれた美術品として、ギネス世界記録に載っています。

**そして、絵そのものを見てください。** 描かれているのは版画家のヤーコプ・デ・ゲイン3世。白い襞襟と黒い服の間から、顔だけが光の中に浮かんでいます。まだ20代半ばのレンブラントが、アムステルダムで肖像画家として売れ始めたころの仕事です。

**この絵には対になる一枚があります。** レンブラントは同じ年、デ・ゲインの友人マウリッツ・ホイヘンスの肖像も、同じ大きさの板に描きました（現在はハンブルク美術館）。二人は、先に死んだほうの肖像を、残ったほうが引き取ると取り決めていた。デ・ゲインが先に亡くなり、この絵はホイヘンスの手に渡ります。そのホイヘンスも、1年とたたずに後を追いました。`,
        highlights: [
          "1966年以降4度盗まれ、4度とも戻ってきた。ギネス世界記録の「最も多く盗まれた美術品」",
          "縦30センチほどのオーク板。コートの下に隠せる小ささが盗まれ続けた理由のひとつ",
          "見つかった場所は墓地のベンチの下、自転車の荷台、タクシーの中、ドイツの駅の荷物棚",
          "友人ホイヘンスの肖像と対で描かれ、先に死んだほうの肖像を残ったほうが引き取る約束だった",
        ],
      },
      {
        title: "リンリー姉妹",
        engTitle: "The Linley Sisters",
        artist: "トマス・ゲインズバラ",
        year: "1772年",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Gainsborough%2C_Thomas_-_Elizabeth_and_Mary_Linley_-_Google_Art_Project.jpg/1280px-Gainsborough%2C_Thomas_-_Elizabeth_and_Mary_Linley_-_Google_Art_Project.jpg",
        description: `**描かれているのは、18世紀の保養地バースで評判の歌手だった姉妹です。** 父トマス・リンリーは町の音楽家で、姉エリザベスと妹メアリーは若くして演奏会の舞台に立っていました。

**まず、二人の服を見てください。** 青と金茶のドレス。ところがこの服は、描かれた当時のものではありません。1785年、リンリー家の求めに応じて、ゲインズバラ自身が**服をその年の流行に合わせて描き直した**のです。完成から13年後の衣替えです。

**次に、背景を見てください。** 二人は室内ではなく、暗い木立の中にいます。筆は速く、葉も幹もはっきりした輪郭を持たない。ゲインズバラが得意とした、人物と風景が溶け合う描き方です。当時の彼はバースに住み、上流階級の肖像を描いて暮らしていました。

**この絵が描かれた1772年、姉のエリザベスは劇作家リチャード・ブリンズリー・シェリダンと駆け落ちします。** のちに喜劇《悪口学校》を書く人物です。絵は同じ年のロイヤル・アカデミー夏季展に出品されました。

**なぜダリッジにあるのか。** 1835年、姉妹の兄弟ウィリアム・リンリーがこの美術館に寄贈しました。60年以上、家族の手元にあった絵です。`,
        highlights: [
          "バースで評判の歌手だった姉妹。姉エリザベスはこの年、劇作家シェリダンと駆け落ちする",
          "服は1785年にゲインズバラ自身がその年の流行に合わせて描き直したもの。完成から13年後の衣替え",
          "人物と木立が溶け合う速い筆。バースで肖像画家をしていたころのゲインズバラの手",
          "1772年のロイヤル・アカデミー夏季展に出品。1835年に姉妹の兄弟が寄贈した",
        ],
      },
    ],
  },

  /* =================================================================
   * 5. サーチ・ギャラリー
   * =================================================================
   * SOURCES
   *   https://www.saatchigallery.com/visit
   *   https://en.wikipedia.org/wiki/Saatchi_Gallery
   *   https://en.wikipedia.org/wiki/Duke_of_York%27s_Headquarters
   *   https://www.saatchigallery.com/press/release/beyond-the-streets-one-of-the-worlds-most-influential-contemporary-platforms-launches-an-all-new-exhibition-dedicated-to-street-culture
   *
   * 公式(2026-09-30)より:
   *   「Monday to Sunday: 10AM – 6PM」
   *   「Duke of York's HQ, King's Road, London, SW3 4RY」
   *   「a 3-4 minutes' walk from Sloane Square Underground」
   * BEYOND THE STREETS(2026-11-11〜2027-05-05、Galleries 4-14): 大人£25
   * 無料の展示が並行する時期もある(The Raw & The Cooked は無料・予約不要)
   */
  {
    slug: "saatchi-gallery",
    name: "サーチ・ギャラリー",
    engName: "Saatchi Gallery",
    tagline: "「ヤング・ブリティッシュ・アーティスト」を世に出した、チェルシーの現代美術館",
    description: `チェルシーのキングス・ロード沿い、スローン・スクエア駅のすぐ近くにある現代美術館。広告会社サーチ＆サーチの共同創業者**チャールズ・サーチ**が、1985年に自らのコレクションを見せるために開いた。

この館の名を決定づけたのは1990年代である。1992年の展覧会「ヤング・ブリティッシュ・アーティスト」で、ホルマリン漬けのサメを使った**ダミアン・ハースト**の作品が初めて公開された。以後「YBA」と呼ばれる若い作家たちを、サーチは買い集め、展示し、世に押し出した。1997年にロイヤル・アカデミーで開かれた展覧会「センセーション」は、ハーストやトレイシー・エミンら42人の作品で30万人以上を集め、大きな論争を呼んだ。

いまの建物は、**1801年**に兵士の寡婦の子どもたちのための学校として建てられたデューク・オブ・ヨーク本部で、館は2008年にここへ移った。2019年からは登録慈善団体として運営されている。展示は企画展が中心で、有料の大型展と、無料で見られる展示が時期によって混在する。`,
    summary:
      "YBAを世に出したコレクターの名を冠した現代美術館\n・ダミアン・ハーストのサメが初公開された館\n・1801年築の旧軍施設を使った展示室\n・スローン・スクエア駅から徒歩4分",
    blurb:
      "ひとりの広告マンの買い物が、90年代のイギリス美術の地図をまるごと描き変えた。",
    highlights: ["現代美術", "YBA", "キングス・ロード"],
    price: 25,
    tourPrice: 25,
    address: "Duke of York's HQ, King's Road, London SW3 4RY",
    lat: 51.4906,
    lng: -0.1589,
    image: "https://upload.wikimedia.org/wikipedia/commons/e/e6/SaatchiGallery.jpg",
    website: "https://www.saatchigallery.com/",
    recommendLevel: 3,
    isForChildren: false,
    hours: DAILY("10:00", "18:00"),
    info: {
      nearestStation: "Sloane Square",
      stationWalkingMinutes: 4,
      shopAvailable: true,
      admissionFeeAdult: 25,
      recommendedDuration: 90,
    },
    highlightSpots: [
      {
        title: "旧軍施設の中の白い展示室",
        body: "1801年の建物の中に、天井の高い白い展示室がいくつも並びます。外は煉瓦と柱廊の古典的な建物、中は真っ白な箱という落差がこの館の特徴です。広い部屋が多く、大きな立体作品やインスタレーションがよく映えます。",
      },
      {
        title: "その時々の企画展",
        body: "常設のコレクション展示はなく、見られるものは企画展で決まります。2026年11月11日から2027年5月5日までは、ストリート文化を扱う大型展「BEYOND THE STREETS」が10室以上を使って開かれます。100組を超える作り手の作品が並ぶ展覧会です。",
      },
      {
        title: "芝生の奥の柱廊",
        location: "外観",
        body: "キングス・ロードから一歩入ると、芝生の広場の奥に柱廊を持つ煉瓦の建物が見えます。もとは兵士の寡婦の子どもたちのための学校で、その後は長く軍の施設として使われました。展示を見る前に、正面の芝生から建物全体を見ておくとよいでしょう。",
      },
    ],
    trivia: [
      {
        title: "サメが初めて公開された場所",
        content:
          "ダミアン・ハーストがホルマリンの水槽にイタチザメを沈めた作品は、1992年にこのギャラリーの展覧会「ヤング・ブリティッシュ・アーティスト」で初めて公開されました。制作の費用を出したのはチャールズ・サーチです。当時の館はまだ北ロンドンのセント・ジョンズ・ウッドにあり、塗料工場を改装した建物でした。",
      },
      {
        title: "部屋いっぱいの廃油",
        content:
          "リチャード・ウィルソンの《20:50》は、部屋を廃油で満たした作品です。油の面が鏡になり、天井と壁がそのまま下にも映ります。旧館で常設展示されていた作品で、2025年の40周年記念展では、この建物の最上階で再び公開されました。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "スローン・スクエア駅から4分",
        body: "スローン・スクエア駅（ディストリクト線・サークル線）を出て、キングス・ロードを歩いて3〜4分です。毎日10時から18時まで開いています。",
      },
      {
        kind: "tip",
        title: "何をやっているかで料金が変わる",
        body: "展示は企画展が中心で、展覧会ごとに料金が違います。大型展は有料で、2026年11月からの「BEYOND THE STREETS」は大人£25。一方で、無料で入れる展示が並行して開かれる時期もあります。行く前に公式サイトで、その日の展示と料金を確かめてください。",
      },
      {
        kind: "highlight",
        title: "大型展は、閉館の2時間前には入る",
        body: "大型展は、最終入場が閉館の1時間前の17時に設定されることがあります。10室を超える規模の展覧会なら1時間半は見ておきたいので、遅くとも16時には入ってください。",
      },
      {
        kind: "missable",
        title: "建物を正面の芝生から見る",
        body: "入口へ急ぐ前に、芝生の広場から建物全体を見てください。1801年に兵士の寡婦の子どもたちのための学校として建てられた、柱廊のある古典的な建物です。中の真っ白な展示室との落差が、この館の面白さのひとつです。",
      },
      {
        kind: "tip",
        title: "キングス・ロードと組み合わせる",
        body: "館の前はキングス・ロードの買い物通りで、スローン・スクエアからチェルシーへ店が続きます。南へ10分ほど歩けば国立陸軍博物館もあります。",
      },
    ],
  },

  /* =================================================================
   * 6. ハンテリアン博物館
   * =================================================================
   * SOURCES
   *   https://hunterianmuseum.org/visit
   *   https://en.wikipedia.org/wiki/Hunterian_Museum,_London
   *   https://www.museumsassociation.org/museums-journal/news/2023/05/londons-hunterian-museum-reopens-after-6-years/
   *   https://blooloop.com/museum/news/hunterian-museum-london-reopens/
   *
   * 公式(2026-09-30)より:
   *   「Tuesday to Saturday: 10am–5pm」「Sunday, Monday, Bank holidays: Closed」
   *   「The Hunterian Museum is free to everyone」「Pre-booking is recommended」
   *   「Photography is permitted for personal use only」(フラッシュ不可、
   *    人体標本の大写しを SNS に載せない)
   *   水曜14:15に学芸員ツアー(約30分、予約不要、先着12人)
   */
  {
    slug: "hunterian-museum",
    name: "ハンテリアン博物館",
    engName: "Hunterian Museum",
    tagline: "18世紀の外科医が集めた標本の瓶が、ガラスの棚に何千と並ぶ",
    description: `リンカーンズ・イン・フィールズの南側、英国王立外科医師会（Royal College of Surgeons of England）の建物の中にある医学の博物館。入館は無料。

中心にあるのは、18世紀の外科医**ジョン・ハンター**が生涯をかけて集めた標本である。人間と動物の骨格、臓器、病変を保存液に沈めた瓶が、ガラスの棚に何千と並ぶ。1799年に政府がこのコレクションを買い上げて外科医師会に託し、それがこの館の始まりになった。1941年の空襲では、展示室の一部が収蔵品ごと失われている。

**2017年**から6年間閉館して全面的に改修され、**2023年5月**に再開した。ハンターの標本2,000点以上を収めた長い展示室に加えて、ローマ時代の止血帯から最新の手術ロボットまで、外科の歴史をたどる展示が加わった。再開にあたり、「アイルランドの巨人」チャールズ・バーンの骨格は展示から外された。本人が望まなかった形で手に入れられた遺体だったからである。

展示されているのは本物の人体である。苦手な人には向かないが、医学の進歩が誰の体の上に成り立ってきたのかを、ここまで正面から見せる場所は多くない。`,
    summary:
      "外科医ジョン・ハンターの標本を見せる無料の医学博物館\n・2023年5月に6年ぶりに再開\n・保存液の瓶に入った2,000点以上の標本\n・日曜・月曜は休館",
    blurb:
      "瓶の中の臓器は、名前の分からない誰かのものだ。この部屋の静けさは、その事実から来ている。",
    highlights: ["医学史", "解剖標本", "無料"],
    price: 0,
    tourPrice: 0,
    address: "38–43 Lincoln's Inn Fields, London WC2A 3PE",
    lat: 51.5153,
    lng: -0.1158,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Royal_College_of_Surgeons_of_England_September_2023.jpg/1920px-Royal_College_of_Surgeons_of_England_September_2023.jpg",
    website: "https://hunterianmuseum.org/",
    recommendLevel: 3,
    isForChildren: false,
    hours: [X, O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), X],
    info: {
      photographyAllowed: "個人利用のみ可（フラッシュ不可）",
      reservationRequired: false,
      nearestStation: "Holborn",
      stationWalkingMinutes: 5,
      cafeteriaAvailable: true,
      shopAvailable: true,
      admissionFeeAdult: 0,
      admissionFeeStudent: 0,
      admissionFeeChild: 0,
      recommendedDuration: 75,
    },
    highlightSpots: [
      {
        title: "ハンターの標本が並ぶ長い展示室",
        body: "長さ22メートルの展示室の両側に、ハンターが作った2,000点を超える標本がガラスの棚に並びます。人間の器官と、同じ働きをする動物の器官が比べられるように置かれていて、ハンターが体の仕組みを種を越えて理解しようとしていたことが分かります。",
      },
      {
        title: "木の板に広げられた血管と神経",
        body: "17世紀にイタリアのパドヴァで作られた「イーヴリン・テーブル」は、人体から取り出した血管や神経を木の板の上に広げ、ニスで固めたものです。全身をめぐる管の配置が、一枚の板の上に図のように写し取られています。",
      },
      {
        title: "外科の道具の2000年",
        body: "ローマ時代の止血帯から、麻酔に使われたクロロホルムの吸入器、ジョゼフ・リスターの手術道具、ハロルド・ホプキンズの内視鏡の試作品、現代の手術ロボットまで。外科が「速さ」の技術から「精密さ」の技術に変わっていく過程が、道具の形でたどれます。",
      },
    ],
    trivia: [
      {
        title: "展示から外された「アイルランドの巨人」",
        content:
          "身長2メートル30センチ近くあったチャールズ・バーンは、18世紀のロンドンで見世物として知られた人物でした。死後に解剖されることを恐れ、遺体を海に沈めるよう頼んでいましたが、ハンターは手を回して遺体を手に入れ、骨格を標本にしました。骨格は200年以上この館に展示されてきましたが、2023年の再開時に展示から外されました。研究のための収蔵は続いています。",
      },
      {
        title: "チャーチルの入れ歯と、ワーテルローの歯",
        content:
          "収蔵品には、ウィンストン・チャーチルの入れ歯や、ワーテルローの戦場で戦死者から抜かれた歯も含まれます。19世紀の入れ歯には戦場で集めた人間の歯が使われ、「ワーテルローの歯」という言葉が残っているほどです。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "日曜と月曜は休み。入場枠を取っておくと確実",
        body: "開くのは火曜から土曜の10時から17時で、日曜と月曜は閉まります。入館は無料です。当日そのまま入ることもできますが、公式サイトで無料の入場枠を取っておくと確実です。最終入場は16時を目安にしてください。",
      },
      {
        kind: "tip",
        title: "展示されているのは本物の人体",
        body: "瓶の中の臓器も骨格も、本物の人体です。苦手な人や小さな子ども連れは、入る前に一度考えてください。撮影は個人利用に限られ、フラッシュは不可です。館は、人体の標本を大写しにしてSNSに載せないよう求めています。",
      },
      {
        kind: "highlight",
        title: "ハンターの展示室は、比べながら見る",
        body: "長い展示室の棚には、人間の器官と動物の器官が並べて置かれています。1点ずつ見るより、棚を横に比べながら歩くと、ハンターが何を知ろうとしていたのかが見えてきます。",
      },
      {
        kind: "missable",
        title: "水曜午後の無料ツアー",
        body: "毎週水曜の14時15分から、学芸員が見どころを案内する30分ほどのツアーがあります。予約は不要で先着12人。英語ですが、どの棚の前で立ち止まるべきかが分かるだけでも参加する価値があります。",
      },
      {
        kind: "tip",
        title: "広場の向かいにソーン博物館",
        body: "リンカーンズ・イン・フィールズの北側には、サー・ジョン・ソーンズ博物館があります。広場を挟んで向かい合う2館で、どちらも無料です。午前にどちらか、午後にもう片方という回り方ができます。",
      },
    ],
  },

  /* =================================================================
   * 7. ジョンソン博士の家
   * =================================================================
   * SOURCES
   *   https://www.drjohnsonshouse.org/visit
   *   https://en.wikipedia.org/wiki/Dr_Johnson%27s_House
   *
   * 公式(2026-09-30)より:
   *   Tuesday to Saturday「10am - 5pm (last entry 4.30pm)」
   *   Sunday「12pm - 4pm (last entry 3.30pm)」(月曜の記載なし=休)
   *   Adult £10 / Students £9 / Children (5-16) £5 / Under 5s Free
   *   「Friday Afternoon Special 2pm - 5pm Adults: £5」
   *   「Free Audio Guide available on your phone」
   *   「There is regrettably no step-free access」
   */
  {
    slug: "dr-johnsons-house",
    name: "ジョンソン博士の家",
    engName: "Dr Johnson's House",
    tagline: "英語の辞書の金字塔が編まれた、フリート街裏の屋根裏",
    description: `フリート街から細い路地を抜けた先、ガフ・スクエアに建つ1700年ごろの家。**サミュエル・ジョンソン**が1748年から1759年まで暮らし、その屋根裏で『**英語辞典**』を編んだ。

1755年に出たこの辞書は、4万を超える語を定義し、その語が実際にどう使われてきたかを、文学作品などからの引用で示した。英語の辞書として初めてのものではないが、以後150年ほど、英語の辞書といえばジョンソンのものを指した。定義には本人の癖が出ていて、「辞書編纂者」の項には「辞書を書く者。無害な苦役者」とある。

ジョンソンはロンドンで何度も住まいを変えたが、残っているのはこの家だけである。その後は宿屋や印刷所、倉庫として使われて荒れ果て、1911年に新聞社主のセシル・ハームズワースが買い取って修復し、1914年に公開した。18世紀の羽目板の部屋と松材の階段、ジョンソンとその周りの人々の肖像が残る、小さく静かな家である。`,
    summary:
      "英語辞書の金字塔が編まれた、ジョンソンの住まい\n・1748年から1759年まで居住\n・屋根裏で『英語辞典』を編纂\n・日曜は午後だけ、月曜休館",
    blurb:
      "ロンドンに飽きた者は人生に飽きた者だ、と言った人の、ロンドンでただひとつ残った住まい。",
    highlights: ["英語辞典", "18世紀の家", "文学"],
    price: 10,
    tourPrice: 10,
    address: "17 Gough Square, London EC4A 3DE",
    lat: 51.515,
    lng: -0.1081,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Dr._Johnson%27s_House.jpg/1280px-Dr._Johnson%27s_House.jpg",
    website: "https://www.drjohnsonshouse.org/",
    recommendLevel: 3,
    isForChildren: false,
    hours: [X, O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("12:00", "16:00")],
    info: {
      reservationRequired: false,
      nearestStation: "Chancery Lane",
      stationWalkingMinutes: 7,
      guidedTourAvailable: true,
      cafeteriaAvailable: false,
      shopAvailable: true,
      admissionFeeAdult: 10,
      admissionFeeStudent: 9,
      admissionFeeChild: 5,
      recommendedDuration: 60,
    },
    highlightSpots: [
      {
        title: "辞書が編まれた屋根裏",
        location: "最上階",
        body: "ジョンソンは最上階の屋根裏を仕事場にし、助手たちと辞書を作りました。書物の中から使用例になる文に印を付け、それを書き写して語ごとに仕分けていくという、気の遠くなる作業です。契約から刊行まで9年。階段を上がりきったときの天井の低さと明るさに、その仕事の空気が残っています。",
      },
      {
        title: "羽目板の部屋と松材の階段",
        body: "家の中は18世紀の羽目板と松材の階段がよく残っています。家具は多くありませんが、ジョンソンと、彼を囲んだ人々の肖像が各部屋に掛かっています。1700年ごろのロンドンの中流の家の寸法を、そのまま体で測れる場所です。",
      },
      {
        title: "広場の猫ホッジの像",
        location: "ガフ・スクエア（屋外）",
        body: "家の前の広場に、ジョンソンが可愛がった猫ホッジの銅像があります。像はジョンソンの辞書の上に座り、足元には牡蠣の殻が置かれています。ジョンソンが自分でホッジのために牡蠣を買いに行っていたと、伝記作家ボズウェルが書き残しています。",
      },
    ],
    trivia: [
      {
        title: "定義に出る本人の癖",
        content:
          "ジョンソンの辞書には、書き手の顔が見える定義がいくつもあります。「オート麦」は「イングランドではふつう馬に与えるが、スコットランドでは人を養う穀物」。スコットランド人への当てこすりとして有名な一文です。ちなみに辞書作りを手伝った6人の助手のうち、5人はスコットランド人でした。",
      },
      {
        title: "「ロンドンに飽きた者は」",
        content:
          "「ロンドンに飽きた者は、人生に飽きた者だ。ロンドンには、人生が与えうるすべてがあるのだから」。1777年にジョンソンがボズウェルに語った言葉で、ロンドンについて最もよく引かれる一文になりました。この家を出てから18年後の言葉です。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "路地の奥にある。月曜は休み",
        body: "フリート街から北へ入る細い路地を抜けた先の、小さな広場に面しています。開くのは火曜から土曜の10時から17時（最終入場16時半）、日曜は12時から16時（最終入場15時半）で、月曜は閉まります。",
      },
      {
        kind: "tip",
        title: "金曜の午後は半額",
        body: "金曜の14時から17時は、大人の入館料が£10から£5に下がります。音声ガイドは自分のスマートフォンで無料で聞けるので、イヤホンを持っていくとよいでしょう。",
      },
      {
        kind: "highlight",
        title: "屋根裏まで上がる",
        body: "辞書が作られたのは最上階の屋根裏です。途中の部屋を見ながら、階段で最上階まで上がってください。エレベーターはなく、段差のない経路もありません。",
      },
      {
        kind: "missable",
        title: "猫のホッジに挨拶する",
        body: "入る前か出たあとに、広場の猫ホッジの像を見てください。辞書の上に座った姿で、足元の牡蠣の殻は、ジョンソンが自分で牡蠣を買ってきて与えていたという逸話から来ています。",
      },
      {
        kind: "tip",
        title: "フリート街の古いパブと組み合わせる",
        body: "すぐ近くのフリート街には、ジョンソンも通ったと伝わる17世紀のパブ「イェ・オールド・チェシャー・チーズ」があります。見学のあとに寄ると、この一帯が新聞と文筆の街だったころの空気の続きが味わえます。",
      },
    ],
  },

  /* =================================================================
   * 8. ヘンデル・ヘンドリックス・ハウス
   * =================================================================
   * SOURCES
   *   https://handelhendrix.org/visit/
   *   https://en.wikipedia.org/wiki/Handel_Hendrix_House
   *
   * 公式(2026-09-30)より:
   *   「Monday and Tuesday – Closed / Wednesday - Sunday: 10:00 - 17:00
   *    (last entry at 16:00)」
   *   Adults £14.50 / Students £10.50 / 13-17 £5 / 12 and under (family) Free
   *   「25 Brook Street / Mayfair / London / W1K 4HB」「Bond Street」
   *   「Your ticket will give you access to both houses」
   */
  {
    slug: "handel-hendrix-house",
    name: "ヘンデル・ヘンドリックス・ハウス",
    engName: "Handel Hendrix House",
    tagline: "200年を隔てて、ヘンデルとジミ・ヘンドリックスが壁一枚の隣人だった",
    description: `メイフェアのブルック・ストリートに並ぶ2軒のジョージ王朝様式の家。**25番地**には作曲家**ヘンデル**が1723年から1759年に亡くなるまで36年間住み、**23番地**の最上階にはギタリストの**ジミ・ヘンドリックス**が1968年から1969年まで住んだ。200年あまりを隔てて、同じ通りの隣同士である。1枚の入場券で両方の家に入れる。

ヘンデルはこの家の最初の住人だった。1741年の《メサイア》をはじめ、《王宮の花火の音楽》などをここで書き、2階の表の部屋に歌手や奏者を集めて稽古をした。家はその時代の内装に戻され、チェンバロの置かれた部屋で演奏会が開かれている。

ヘンドリックスの部屋は、恋人キャシー・エッチンガムの記憶と当時の写真をもとに、2016年に再現された。壁掛けの布やレコードまで、1969年の姿に近づけてある。隣にヘンデルが住んでいたと知った彼は、ヘンデルのレコードを買いに行ったと伝えられている。改修を経て2023年に再開し、現在の名前になった。`,
    summary:
      "ヘンデルとジミ・ヘンドリックスが隣同士に住んだ家\n・ヘンデルが36年暮らし《メサイア》を書いた家\n・1968〜69年のヘンドリックスの部屋を再現\n・月曜・火曜は休館",
    blurb:
      "《メサイア》が書かれた部屋の壁の向こうで、200年後、ひとりのギタリストがヘンデルのレコードに針を落とした。",
    highlights: ["ヘンデル", "ジミ・ヘンドリックス", "メイフェア"],
    price: 14.5,
    tourPrice: 14.5,
    address: "25 Brook Street, London W1K 4HB",
    lat: 51.513,
    lng: -0.1459,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Handel_Hendrix_House_May_2023_%28cropped%29.jpg/1280px-Handel_Hendrix_House_May_2023_%28cropped%29.jpg",
    website: "https://handelhendrix.org/",
    recommendLevel: 3,
    isForChildren: false,
    hours: [X, X, O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00")],
    info: {
      reservationRequired: false,
      nearestStation: "Bond Street",
      stationWalkingMinutes: 4,
      admissionFeeAdult: 14.5,
      admissionFeeStudent: 10.5,
      recommendedDuration: 75,
    },
    highlightSpots: [
      {
        title: "ヘンデルの稽古の部屋と作曲の部屋",
        location: "25番地 2階",
        body: "ヘンデルは2階の表の部屋に歌手や奏者を集めて稽古をし、奥の部屋で作曲しました。《メサイア》もこの家で書かれています。いまは当時の内装に戻され、チェンバロが置かれています。演奏会の日には、ヘンデルが自分の音楽を鳴らした部屋で、その曲を聴くことになります。",
      },
      {
        title: "ヘンドリックスの寝室",
        location: "23番地 最上階",
        body: "ヘンドリックスが恋人と暮らした最上階のフラットの寝室が、当時の写真をもとに再現されています。派手な壁掛けの布、床に積まれたレコード。取材もこの部屋で受けていました。彼が「初めての自分の家」と呼んだと伝えられる部屋です。",
      },
      {
        title: "並んだ2枚のブルー・プラーク",
        location: "建物の正面",
        body: "通りに面した壁には、ヘンデルとヘンドリックスそれぞれのブルー・プラークが掛かっています。18世紀の作曲家と20世紀のギタリストの記念銘板が隣り合う、ロンドンでも珍しい光景です。",
      },
    ],
    trivia: [
      {
        title: "《メサイア》は3週間あまりで書かれた",
        content:
          "ヘンデルは1741年の夏、この家で《メサイア》を3週間あまりで書き上げました。初演は翌1742年、ロンドンではなくダブリンでした。",
      },
      {
        title: "200年前の隣人",
        content:
          "ヘンドリックスは、200年前の隣人がヘンデルだったと知ると、ヘンデルのレコードを買いに行ったと伝えられています。部屋でヘンデルの幽霊を見たと話していた、という逸話まで残っています。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "月曜と火曜は休み",
        body: "開くのは水曜から日曜の10時から17時で、最終入場は16時です。月曜と火曜は閉まります。ボンド・ストリート駅から歩いて数分の、メイフェアの落ち着いた通りにあります。",
      },
      {
        kind: "tip",
        title: "料金は年齢で変わる",
        body: "大人は£14.50、学生は£10.50、13〜17歳は£5です。12歳以下は家族と一緒なら無料。1枚の券で、ヘンデルの家とヘンドリックスの部屋の両方に入れます。",
      },
      {
        kind: "highlight",
        title: "ヘンデルの家から、隣へ移る",
        body: "展示は2軒に分かれています。先にヘンデルの家で18世紀の部屋を見てから、ヘンドリックスの部屋に移るのがおすすめです。チェンバロの部屋からレコードの積まれた寝室へ、200年の隔たりが数歩で縮まります。",
      },
      {
        kind: "missable",
        title: "演奏会の予定を確かめる",
        body: "ヘンデルの時代の楽器を使った演奏会が、この家の部屋で開かれています。日程が合えば、見学とは別にこちらを予約する価値があります。",
      },
      {
        kind: "tip",
        title: "出たら、通りの向かいから壁を見る",
        body: "見学を終えたら、通りの向かい側から建物を見てください。隣り合う2軒の壁に、ヘンデルとヘンドリックスのブルー・プラークが並んでいます。",
      },
    ],
  },

  /* =================================================================
   * 9. ウィリアム・モリス・ギャラリー
   * =================================================================
   * SOURCES
   *   https://www.wmgallery.org.uk/
   *   https://en.wikipedia.org/wiki/William_Morris_Gallery
   *
   * 公式(2026-09-30)より:
   *   「Tuesday to Sunday 10am - 5pm」、入館無料
   *   「The Gallery building is currently closed for renovations」
   *   → 2026年10月3日(土)再開。Deeney's Café は営業
   *   「Lloyd Park, Forest Road, Walthamstow, London E17 4PP」
   */
  {
    slug: "william-morris-gallery",
    name: "ウィリアム・モリス・ギャラリー",
    engName: "William Morris Gallery",
    tagline: "モリスが少年時代を過ごした家で、デザインと社会運動の両方を見る",
    description: `ロンドン北東部ウォルサムストウの公園の中に建つ、**1762年**のジョージ王朝様式の邸宅「ウォーター・ハウス」。デザイナーで詩人、社会運動家でもあった**ウィリアム・モリス**が、1848年から1856年、14歳から22歳までを家族と過ごした家で、いまはモリスの生涯と仕事を扱う無料の美術館になっている。

1950年に首相クレメント・アトリーの手で開館した。9つの部屋で、少年時代から、モリス商会の壁紙や織物、染めと織りの工房の技法、晩年のケルムスコット・プレスの本づくり、そして社会主義者としての活動までを追う。美しいものを作ることと、それを誰が作り誰が使えるのかを問うことが、モリスの中ではひとつの仕事だったことが分かる構成である。

2011年から2012年の改修を経て、2013年には英国の年間最優秀博物館（ミュージアム・オブ・ザ・イヤー）に選ばれた。2026年は再び改修のために閉館し、**10月3日**に再開する。裏手に広がるロイド・パークは、もとはこの家の庭だった。`,
    summary:
      "ウィリアム・モリスの生涯と仕事を見せる無料の美術館\n・モリスが10代を過ごした1762年の邸宅\n・壁紙・織物からケルムスコット・プレスまで\n・2013年ミュージアム・オブ・ザ・イヤー",
    blurb:
      "壁紙の柄を描いた手と、労働者の前で演説した声が、同じ家の9つの部屋に並んでいる。",
    highlights: ["ウィリアム・モリス", "アーツ・アンド・クラフツ", "無料"],
    price: 0,
    tourPrice: 0,
    address: "Lloyd Park, Forest Road, London E17 4PP",
    lat: 51.5913,
    lng: -0.0204,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/20231231_London_Walthamstow_09b.jpg/1920px-20231231_London_Walthamstow_09b.jpg",
    website: "https://www.wmgallery.org.uk/",
    recommendLevel: 3,
    isForChildren: false,
    hours: [X, O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00"), O("10:00", "17:00")],
    info: {
      reservationRequired: false,
      nearestStation: "Walthamstow Central",
      stationWalkingMinutes: 15,
      cafeteriaAvailable: true,
      admissionFeeAdult: 0,
      admissionFeeStudent: 0,
      admissionFeeChild: 0,
      recommendedDuration: 90,
    },
    highlightSpots: [
      {
        title: "モリス商会の壁紙と織物",
        body: "モリスが仲間と興したモリス商会の壁紙、織物、タイル、ステンドグラスが並びます。植物と鳥を組み合わせた図柄には、いまも手刷りで作られ続けているものがあります。工房の技法を扱う部屋では、一枚の柄が上下左右に途切れず繰り返すよう、どう設計されているかが分かります。",
      },
      {
        title: "ケルムスコット・プレスの本",
        body: "晩年のモリスはハマースミスで印刷所ケルムスコット・プレスを開き、活字の書体から紙まで自分で決めた本を作りました。中世の写本を思わせる、文字と装飾がぎっしり詰まったページです。",
      },
      {
        title: "社会主義者モリスの部屋",
        body: "モリスは後半生、社会主義の運動に身を投じ、街頭で演説し、機関紙を出しました。美しいものを作る人が、それを買えない人のことを考え続けた記録です。デザインの展示だけ見て帰ると、この館の半分を見落とします。",
      },
    ],
    trivia: [
      {
        title: "地元選出の首相が開いた",
        content:
          "1950年の開館式を務めたのは、首相クレメント・アトリーでした。戦後の労働党政権を率いた人物が、社会主義者でもあったモリスの記念館を開いたことになります。アトリーはこのとき、地元ウォルサムストウ選出の下院議員でもありました。",
      },
      {
        title: "新聞王の家から、公園と美術館へ",
        content:
          "モリス家が去ったあと、家は新聞社主エドワード・ロイドの手に渡りました。1900年にロイドの息子が家と庭をウォルサムストウに寄贈し、庭は公園に、家はのちに美術館になりました。公園の名前ロイド・パークはここから来ています。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "2026年10月3日に再開。月曜は休み",
        body: "2026年は改修のため建物が閉まっていて、10月3日（土）に再開します。開くのは火曜から日曜の10時から17時で、月曜は閉まります。入館は無料です。",
      },
      {
        kind: "arrival",
        title: "ウォルサムストウ・セントラル駅から歩く",
        body: "最寄りはヴィクトリア線とオーバーグラウンドのウォルサムストウ・セントラル駅で、北へ15分ほど歩きます。中心部からヴィクトリア線で乗り換えなしで来られます。",
      },
      {
        kind: "highlight",
        title: "9つの部屋を、最後まで歩く",
        body: "展示は9つの部屋で、少年時代から晩年までをおおむね順にたどります。モリスの名前を壁紙で知っている人ほど、後半の社会主義の部屋で印象が変わります。途中で引き返さず、最後の部屋まで歩いてください。",
      },
      {
        kind: "missable",
        title: "裏の公園へ出る",
        body: "建物の裏はロイド・パークで、もとはこの家の庭です。家の名前の由来になった堀が、いまも公園の中に残っています。晴れていれば、見学のあとにカフェで何か買って庭に出てください。",
      },
      {
        kind: "tip",
        title: "モリスをもっと追うなら、西のハマースミスへ",
        body: "モリスが晩年を過ごしたハマースミスのケルムスコット・ハウスや、盟友の印刷家の家が残るエメリー・ウォーカーの家は、観光スポットのページで紹介しています。ウォルサムストウは少年時代、ハマースミスは晩年。両方を見ると、ひとりの人の一生がロンドンの東西にまたがっているのが分かります。",
      },
    ],
  },

  /* =================================================================
   * 10. ロイヤル・アカデミー・オブ・アーツ
   * =================================================================
   * SOURCES
   *   https://www.royalacademy.org.uk/page/opening-times (検索結果の抜粋)
   *   https://www.theartnewspaper.com/2025/10/03/londons-royal-academy-set-to-close-collection-gallery-until-2027
   *   https://www.royalacademy.org.uk/exhibition/fine-rooms-open (検索結果の抜粋)
   *   https://en.wikipedia.org/wiki/Taddei_Tondo
   *   https://hyperallergic.com/london-royal-academy-michelangelo-taddei-tondo/
   *
   * 公式は bot 対策で読めず。検索結果の公式抜粋より:
   *   「Monday: closed, Tuesday–Sunday: 10am–6pm, Friday: 10am–9pm」
   *   「Last entry to the galleries is half an hour before closing time」
   *   コレクション・ギャラリー(6 Burlington Gardens)は2025-10-10閉鎖、
   *   建物全体は2025-10-27から、2027年再開(David Chipperfield Architects)
   *   ファイン・ルームズ: 2025-12-16〜2027-01-29、火〜日11〜16時(金〜21時)、
   *   無料・予約不要。2026-11-06 と 12-04 は閉室
   *
   * ★ 観光スポット側 royal-academy-of-arts と対。
   * ★ タッデイ・トンドの現在の展示場所は確認できなかったので、
   *   作品(Artwork)にはせず、豆知識で「時期により展示場所が変わる」と書く。
   */
  {
    slug: "royal-academy-of-arts",
    name: "ロイヤル・アカデミー・オブ・アーツ",
    engName: "Royal Academy of Arts",
    tagline: "画家と建築家が自分たちで運営する、1768年創立の美術機関",
    description: `ピカデリーに面したバーリントン・ハウスに本拠を置く美術機関。**1768年**、国王ジョージ3世の承認のもと、画家と建築家たちが自分たちの手で設立した。初代会長は肖像画家の**ジョシュア・レイノルズ**。現在も「ロイヤル・アカデミシャン」と呼ばれる現役の作家たちが運営にあたっている。

美術館としての顔は企画展である。古典から現代まで、年間を通じて大型の有料展が入れ替わる。**1769年**から毎年開かれている夏季展（サマー・エキシビション）は、誰でも応募できる公募展として世界で最も長く続いているもので、無名の応募者の作品と大御所の新作が同じ壁に並ぶ。

所蔵品には、英国にある唯一のミケランジェロの大理石彫刻「タッデイ・トンド」がある。ただし所蔵品を見せるコレクション・ギャラリー（裏手のバーリントン・ガーデンズ側の建物）は、2025年10月から拡張工事で閉まっていて、再開は2027年の予定である。そのあいだはバーリントン・ハウスの「ファイン・ルームズ」で、所蔵品の一部を無料で公開している。`,
    summary:
      "芸術家自身が運営する、1768年創立の美術機関\n・年間を通じて大型の企画展\n・1769年から続く公募展「夏季展」\n・所蔵品の一部をファイン・ルームズで無料公開",
    blurb:
      "250年前に画家たちが自分で作った学校と展示室を、いまも画家たちが自分で動かしている。",
    highlights: ["企画展", "夏季展", "ピカデリー"],
    price: 0,
    tourPrice: 25,
    address: "Burlington House, Piccadilly, London W1J 0BD",
    lat: 51.5094,
    lng: -0.1395,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Royal_Academy_%285125746823%29.jpg/1920px-Royal_Academy_%285125746823%29.jpg",
    website: "https://www.royalacademy.org.uk/",
    recommendLevel: 3,
    isForChildren: false,
    hours: [X, O("10:00", "18:00"), O("10:00", "18:00"), O("10:00", "18:00"), O("10:00", "21:00"), O("10:00", "18:00"), O("10:00", "18:00")],
    info: {
      nearestStation: "Piccadilly Circus",
      stationWalkingMinutes: 6,
      shopAvailable: true,
      recommendedDuration: 90,
    },
    highlightSpots: [
      {
        title: "企画展の大展示室",
        location: "バーリントン・ハウス",
        body: "RAの本題は企画展です。バーリントン・ハウスの奥に続く展示室で、古典の巨匠から現代の作家まで、年間を通じて大型展が入れ替わります。夏には、誰でも応募できる公募展「夏季展」が1769年から毎年開かれています。",
      },
      {
        title: "ファイン・ルームズの所蔵品展示",
        location: "バーリントン・ハウス",
        body: "18世紀の邸宅の面影を残す「ファイン・ルームズ」で、RAの所蔵品の一部が無料で公開されています。コレクション・ギャラリーが工事で閉まっているあいだの措置で、2027年1月29日まで。予約は要りません。",
      },
      {
        title: "中庭とレイノルズ像",
        location: "アネンバーグ・コートヤード",
        body: "ピカデリーから門をくぐると、石畳の中庭の真ん中に初代会長ジョシュア・レイノルズの像が立っています。手にパレットと筆を持った姿です。中庭は無料で入れ、企画展に合わせて現代作家の作品が置かれることもあります。",
      },
    ],
    trivia: [
      {
        title: "英国唯一のミケランジェロの大理石",
        content:
          "所蔵する「タッデイ・トンド」は、聖母子と幼い洗礼者ヨハネを彫った円形の浮き彫りで、1504年ごろフィレンツェのタッデイ家の注文で彫られ、未完のまま残されました。1830年にRAの所蔵となった、英国にある唯一のミケランジェロの大理石彫刻です。2020年、コロナ禍で財政が悪化した際には売却を検討しているとの報道が出ましたが、RAは所蔵品を売るつもりはないと否定しました。コレクション・ギャラリーの工事中は展示場所が変わるので、見たい場合は公式で確かめてください。",
      },
      {
        title: "YBAを世に出した「センセーション」展",
        content:
          "1997年、RAはチャールズ・サーチのコレクションによる「センセーション」展を開き、ダミアン・ハーストやトレイシー・エミンら若い作家の作品を並べました。格式ある機関の展覧会としては異例の騒ぎになり、30万人以上が訪れています。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "月曜は休み。金曜は21時まで",
        body: "開くのは火曜から日曜の10時から18時、金曜だけ21時までです。月曜は閉まります。最終入場は閉館の30分前。入口はピカデリーに面したバーリントン・ハウスの門で、裏手の建物が工事中の2027年春までは、こちらの入口だけを使います。",
      },
      {
        kind: "tip",
        title: "無料で見られる範囲を知っておく",
        body: "中庭と、所蔵品を公開しているファイン・ルームズは無料で、予約も要りません。有料なのは大型の企画展で、ひとつ£20台半ばが目安です。企画展を見ないなら、30分ほどで回れます。",
      },
      {
        kind: "highlight",
        title: "企画展は日時指定の券を先に取る",
        body: "人気の企画展は週末から売り切れます。2026年秋は、ヴィクトリア朝の画家リチャード・ダッドの展覧会が10月25日まで、南仏を描いた絵画を集めた「Painting the French Riviera」が10月2日から2027年1月31日まで開かれています。行く日が決まったら先に券を取ってください。",
      },
      {
        kind: "missable",
        title: "ファイン・ルームズは開いている時間が短い",
        body: "所蔵品を公開しているファイン・ルームズは11時から16時（金曜は21時まで）で、建物全体より遅く開き、早く閉まります。2026年11月6日と12月4日は閉まります。企画展と一緒に回るなら、午後の早い時間に寄ってください。",
      },
      {
        kind: "tip",
        title: "向かいはフォートナム＆メイソン",
        body: "ピカデリーを挟んで斜め向かいには老舗の食料品店フォートナム＆メイソン、すぐ隣には19世紀のアーケード、バーリントン・アーケードがあります。展覧会の前後に紅茶と買い物を挟める立地です。",
      },
    ],
  },

  /* =================================================================
   * 11. ケンウッド・ハウス
   * =================================================================
   * SOURCES
   *   https://www.english-heritage.org.uk/visit/places/kenwood/
   *   https://www.english-heritage.org.uk/visit/places/kenwood/prices-and-opening-times/
   *   https://en.wikipedia.org/wiki/Kenwood_House
   *   https://en.wikipedia.org/wiki/The_Guitar_Player_(Vermeer)
   *   https://en.wikipedia.org/wiki/Self-Portrait_with_Two_Circles
   *
   * 公式(2026-09-30)より:
   *   「Daily 10am–5pm (last entry 4:30pm)」
   *   「Tickets to Kenwood are free but we recommend pre-booking to guarantee
   *    entry to the house」
   *   Brew House Café、Bloomberg Connects のデジタルガイド
   *   ツアー「Lord Mansfield: Slavery and Justice」
   * 第三者の案内には冬季16時閉館とするものがあるが、公式の現行表示は17時。
   * 公式に合わせ、歩き方の1歩目で「冬は早まる年がある」と添える。
   *
   * ★ 観光スポット側 kenwood-house-hampstead と対。
   */
  {
    slug: "kenwood-house",
    name: "ケンウッド・ハウス",
    engName: "Kenwood House",
    tagline: "ハムステッド・ヒースの丘の上で、フェルメールとレンブラントを無料で見る",
    description: `ハムステッド・ヒースの北端、広い芝生の斜面の上に建つ白い邸宅。18世紀に建築家**ロバート・アダム**が改築した家で、いまはイングリッシュ・ヘリテッジが管理し、入館は無料である。

家の主だったのは、イングランドの首席裁判官を務めた**マンスフィールド伯**。アダムは1764年から1779年にかけて彼のために家を作り直し、なかでも図書室は、アダムの内装のなかで最もよく知られたもののひとつになった。

館の中心をなす絵画は、ギネス家の**アイヴィー伯**のコレクションである。1925年にこの家を買い取った伯爵は、2年後に亡くなる際、家と絵をまとめて国に遺した。フェルメールの《ギターを弾く女》、レンブラントの《2つの円のある自画像》をはじめ、ハルス、ゲインズバラ、ターナーの絵が、美術館の展示室ではなく邸宅の部屋に掛かっている。`,
    summary:
      "フェルメールとレンブラントを無料で見られる、丘の上の邸宅\n・ロバート・アダムが改築した18世紀の邸宅\n・アイヴィー伯が国に遺した名画コレクション\n・ハムステッド・ヒースの散歩と組み合わせる",
    blurb:
      "ヒースの丘を歩いて上がった先の部屋で、フェルメールの女が、画面の外の誰かに向かってギターを鳴らしている。",
    highlights: ["フェルメール", "ロバート・アダム", "ハムステッド・ヒース"],
    price: 0,
    tourPrice: 0,
    address: "Hampstead Lane, London NW3 7JR",
    lat: 51.5719,
    lng: -0.1657,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Kenwood_House_2.jpg/1920px-Kenwood_House_2.jpg",
    website: "https://www.english-heritage.org.uk/visit/places/kenwood/",
    recommendLevel: 4,
    isForChildren: false,
    hours: DAILY("10:00", "17:00"),
    info: {
      reservationRequired: false,
      nearestStation: "Hampstead",
      stationWalkingMinutes: 30,
      nearestBusStop: "Kenwood House（210番）",
      busStopWalkingMinutes: 2,
      guidedTourAvailable: true,
      cafeteriaAvailable: true,
      shopAvailable: true,
      admissionFeeAdult: 0,
      admissionFeeStudent: 0,
      admissionFeeChild: 0,
      recommendedDuration: 120,
    },
    highlightSpots: [
      {
        title: "アダムの図書室",
        body: "ロバート・アダムの内装のなかでも最もよく知られた部屋です。半円筒形の天井に淡い色と金の装飾が細かく入り、両端は円柱で仕切られた本棚のくぼみになっています。天井を見上げる時間を、絵を見る時間と同じくらい取ってください。",
      },
      {
        title: "フェルメール《ギターを弾く女》",
        body: "フェルメール晩年の一枚です。画面の左端に寄せて座り、画面の外の誰かに向かって笑顔でギターを鳴らす女性と、右側に大きく空いた空間。作品のページで詳しく紹介しています。",
      },
      {
        title: "レンブラント《2つの円のある自画像》",
        body: "60歳前後のレンブラントが、パレットと筆を手にこちらを見据える大きな自画像です。背景の壁に描かれた2つの円弧が何を意味するのかは、いまも分かっていません。作品のページで詳しく紹介しています。",
      },
    ],
    trivia: [
      {
        title: "盗まれたフェルメール",
        content:
          "1974年2月23日、《ギターを弾く女》がこの家から盗まれました。犯人は政治的な要求を突きつけましたが、絵は同じ年の5月7日、ロンドン市内の教会の墓地で見つかりました。湿った場所に置かれていたにもかかわらず、ほとんど傷んでいなかったといいます。",
      },
      {
        title: "ダイド・ベルが暮らした家",
        content:
          "マンスフィールド伯の家には、甥の娘ダイド・エリザベス・ベルが暮らしていました。英国海軍士官の父と、奴隷とされていたアフリカ系の母のあいだに生まれた女性です。首席裁判官だった伯爵は、1772年のサマーセット事件で、奴隷を本人の意思に反して国外へ連れ出すことはできないとする判決を下しています。館では、この二つの事実を並べて扱うツアーも開かれています。",
      },
      {
        title: "『ノッティングヒルの恋人』の撮影地",
        content:
          "1999年の映画『ノッティングヒルの恋人』で、ヒュー・グラント演じる主人公が、映画の撮影中のジュリア・ロバーツを訪ねる場面は、この家の敷地で撮られました。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "無料だが、入場券を取っておくと確実",
        body: "家は毎日10時から17時まで開いていて（最終入場16時半）、入館は無料です。混む日に確実に入るため、公式サイトで無料の入場券を先に取っておくことが勧められています。冬は閉館が早まる年もあるので、行く前に公式の時間を確かめてください。",
      },
      {
        kind: "arrival",
        title: "ヒースを歩いて上がるか、バスで門まで行くか",
        body: "ハムステッド駅やゴスペル・オーク駅から、ハムステッド・ヒースを横切って歩くと30分前後。起伏のある草地を上っていく道のりで、それ自体がこの家を訪ねる楽しみの一部です。歩きたくなければ、北側のハムステッド・レーンを走る210番のバスが家の入口近くに停まります。",
      },
      {
        kind: "highlight",
        title: "図書室で天井を見上げる",
        body: "ロバート・アダムの図書室は、この家でいちばんの部屋です。半円筒形の天井と、両端の円柱の奥の本棚。絵を探しに先を急ぐ前に、この部屋で一度立ち止まってください。",
      },
      {
        kind: "highlight",
        title: "フェルメールとレンブラントに時間を残す",
        body: "レンブラントの自画像とフェルメールの《ギターを弾く女》は、この家でいちばん人が足を止める2点です。音声ガイドは無料アプリのBloomberg Connectsで聞けるので、来る前に入れておくとよいでしょう。",
      },
      {
        kind: "tip",
        title: "カフェで休んで、芝生を湖まで下る",
        body: "敷地内のカフェ「ブリュー・ハウス」で休んでから、家の前の芝生の斜面を湖のほうへ下ってみてください。振り返ると、この家がなぜ丘の上に建てられたのかが分かります。",
      },
    ],
    artworks: [
      {
        title: "ギターを弾く女",
        engTitle: "The Guitar Player",
        artist: "ヨハネス・フェルメール",
        year: "1672年頃",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Jan_Vermeer_van_Delft_013.jpg/1280px-Jan_Vermeer_van_Delft_013.jpg",
        description: `**フェルメールの女性たちのなかで、これほど開けっぴろげな表情はめずらしい。** 手紙を読む女も、牛乳を注ぐ女も、自分の世界に沈み込んで静かです。ところがこの女性は、口元をほころばせ、画面の外の誰かのほうを向いて、ギターをかき鳴らしています。

**まず、構図を見てください。** 女性は画面の左端に寄せられ、右半分は大きく空いています。フェルメールの絵は、ふつうもっと釣り合いがとれている。この傾きが、演奏のさなかの一瞬、音が鳴っている時間を画面に持ち込んでいます。

**次に、ギターの弦を見てください。** 飾りのついた響き穴まで細かく描き込まれた楽器のなかで、弦だけがぼやけています。**弦が震えている**ように見えるのです。

**光と視線を見てください。** 光は右から、画面に描かれていない窓から差し込んでいます。女性がその右のほうへ顔を向けていることで、彼女が誰かに向かって弾いていることが分かる。聴き手は、画面の外にいるのです。

**描かれた楽器は、当時の新しいものでした。** 17世紀のオランダでは、それまでのリュートに代わってギターが流行し始めていました。オコジョの毛皮で縁取った黄色い上着、真珠の首飾り、背後の風景画。フェルメールが繰り返し使った小道具のなかに、流行の楽器が加わっています。

**1974年、この絵は盗まれました。** 犯人は政治的な要求を突きつけ、2か月半ほど行方が分からないままでした。見つかったのはロンドン市内の教会の墓地。湿気にさらされていたにもかかわらず、ほぼ無傷でした。

フェルメールが亡くなる数年前、最晩年の作品のひとつです。`,
        highlights: [
          "フェルメールには珍しい、開けっぴろげな表情。画面の外の聴き手に向かって弾いている",
          "女性は左端に寄せられ、右半分が空いている。この傾きが演奏中の一瞬を画面に持ち込む",
          "細かく描かれた楽器のなかで、弦だけがぼやけている。弦が震えているように見える",
          "1974年に盗まれ、2か月半後にロンドン市内の教会の墓地で見つかった",
        ],
      },
      {
        title: "2つの円のある自画像",
        engTitle: "Self-Portrait with Two Circles",
        artist: "レンブラント・ファン・レイン",
        year: "1665〜1669年頃",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Rembrandt_Self-portrait_%28Kenwood%29.jpg/1280px-Rembrandt_Self-portrait_%28Kenwood%29.jpg",
        description: `**レンブラントは生涯に40点を超える自画像を描きました。** そのなかでもこの一枚は、ひときわ大きく、ひときわ堂々としています。

**まず、姿勢を見てください。** 片手を腰に当て、もう一方の手にパレットと筆と腕鎮（描くときに手を支える棒）を握っている。白い帽子に、毛皮の縁取りのある上着。こちらを見据える顔は、老いを隠していません。晩年のレンブラントは破産を経験し、財産を失っていました。それでもここにいるのは、**仕事の道具を手にした画家**です。

**次に、背景の2つの円を見てください。** 画家の背後の壁に、大きな円弧が2つ描かれています。これが何なのかは、いまも分かっていません。オランダの家によく掛けられていた世界地図の両半球だという説。ルネサンスの画家ジョットが、道具を使わずに完全な円を描いて腕前を示したという逸話を指すという説。神の完全さを表す記号だという説。あるいは単に、画面を組み立てるための幾何学的な形だという説。**答えの出ない謎が、そのまま絵の力になっています。**

**手を見てください。** 顔に比べて、手の部分はほとんど描き込まれていません。濡れた絵の具の上に素早く筆を重ね、ところどころ引っかいて線を刻んでいる。署名も日付もないこの絵は、未完成のまま残された可能性もあります。

60歳前後のレンブラントが、描くことそのものを描いた一枚です。`,
        highlights: [
          "片手を腰に、もう一方の手にパレットと筆。破産を経た晩年の画家が、仕事の道具を手に立っている",
          "背後の2つの円弧が何を意味するかは分かっていない。地図の両半球、ジョットの円、幾何学的な構成などの説がある",
          "手はほとんど描き込まれず、濡れた絵の具を引っかいた線も残る",
          "署名も日付もなく、未完成のまま残された可能性もある",
        ],
      },
    ],
  },

  /* =================================================================
   * 12. クイーンズ・ハウス
   * =================================================================
   * SOURCES
   *   https://www.rmg.co.uk/queens-house
   *   https://en.wikipedia.org/wiki/Queen%27s_House
   *   https://en.wikipedia.org/wiki/Armada_Portrait
   *
   * 公式(2026-09-30)より:
   *   「Open daily 10am–5pm (last entry 4:15pm). Closed December 24–26」
   *   「Free entry」オンライン予約推奨、Smartify で無料音声ガイド
   *   Richard Wright の天井(2016)
   *
   * ★ 観光スポット側 queens-house-greenwich と対。
   */
  {
    slug: "queens-house",
    name: "クイーンズ・ハウス",
    engName: "Queen's House",
    tagline: "イングランド最初の古典主義建築に、エリザベス1世の「アルマダ・ポートレート」が掛かる",
    description: `グリニッジ公園の麓、国立海洋博物館の翼にはさまれて建つ白い館。建築家**イニゴー・ジョーンズ**が1616年、ジェームズ1世の王妃アン・オブ・デンマークのために設計を始め、チャールズ1世の王妃ヘンリエッタ・マリアの代の1630年代に完成した。**イングランドで最初の古典主義建築**とされる。

ジョーンズはイタリアを旅してパラディオの建築を学び、その比例の考え方をこの館に持ち込んだ。中心の大広間は一辺40フィート（約12メートル）の**完全な立方体**である。煉瓦と破風の館が当たり前だったイングランドに、白い箱のような建物が突然現れたことになる。

いまはロイヤル・ミュージアムズ・グリニッジの美術館として、入館無料で公開されている。所蔵品の目玉は、1588年のスペイン無敵艦隊撃退を記念して描かれた**エリザベス1世の「アルマダ・ポートレート」**。2016年、建設400年に合わせた館の改修と同じ年に、公募の寄付を集めて館の所蔵になった。`,
    summary:
      "イニゴー・ジョーンズが建てた、イングランド最初の古典主義建築\n・一辺40フィートの立方体の大広間\n・支柱のない螺旋階段「チューリップ階段」\n・エリザベス1世の「アルマダ・ポートレート」を無料で見られる",
    blurb:
      "400年前、煉瓦の国に置かれた真っ白な箱。その中で、女王が地球儀に手を置いている。",
    highlights: ["古典主義建築", "アルマダ・ポートレート", "無料"],
    price: 0,
    tourPrice: 0,
    address: "Romney Road, London SE10 9NF",
    lat: 51.4811,
    lng: -0.0039,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Queens_House.jpg/1920px-Queens_House.jpg",
    website: "https://www.rmg.co.uk/queens-house",
    recommendLevel: 3,
    isForChildren: false,
    hours: DAILY("10:00", "17:00"),
    info: {
      reservationRequired: false,
      nearestStation: "Cutty Sark (DLR)",
      stationWalkingMinutes: 8,
      guidedTourAvailable: true,
      admissionFeeAdult: 0,
      admissionFeeStudent: 0,
      admissionFeeChild: 0,
      recommendedDuration: 60,
    },
    highlightSpots: [
      {
        title: "立方体の大広間",
        location: "グレート・ホール",
        body: "一辺40フィート（約12メートル）の完全な立方体の部屋です。上階には部屋をぐるりと囲む回廊があります。天井には2016年、現代美術家リチャード・ライトが金箔で描いた模様が入りました。もとの天井画はジェンティレスキが描いたものでしたが、1708年に持ち出され、いまはロンドン中心部のマールバラ・ハウスにあります。",
      },
      {
        title: "チューリップ階段",
        body: "中心の支柱を持たない螺旋階段で、英国で最初の幾何学的な自立式の階段とされます。段の一つひとつが壁から張り出し、互いに支え合っています。手すりの鉄細工の花がチューリップに見えることからこの名で呼ばれますが、実際はユリを表したものだとも言われます。",
      },
      {
        title: "エリザベス1世の「アルマダ・ポートレート」",
        body: "1588年のスペイン無敵艦隊撃退を記念した肖像です。女王の右手は地球儀の上、アメリカ大陸の上に置かれています。背後の2つの窓には、迫る火船と、嵐で岩場に砕ける敵の艦隊。作品のページで詳しく紹介しています。",
      },
    ],
    trivia: [
      {
        title: "道路をまたいで建っていた",
        content:
          "完成当時、この館はデットフォードとウリッジを結ぶ街道をまたいで建っていました。道の両側に建てた2つの棟を2階の橋でつないだ形で、王妃はグリニッジ宮殿の庭から公園へ、道に降りずに渡ることができたのです。道はのちに館の北側へ移され、いまのロムニー・ロードになっています。",
      },
      {
        title: "チューリップ階段の心霊写真",
        content:
          "1966年、カナダから来た牧師がチューリップ階段を撮影したところ、現像した写真に、手すりをつかんで階段を上る白い人影が写っていたとされます。撮影したとき、階段には誰もいなかったといいます。この写真はいまも、英国の心霊写真として繰り返し取り上げられています。",
      },
    ],
    visitFlow: [
      {
        kind: "arrival",
        title: "毎日開いて、入館は無料",
        body: "毎日10時から17時まで（最終入場16時15分）開いていて、入館は無料です。当日そのまま入れることが多いものの、確実に入るには公式サイトで無料の入場券を先に取っておくとよいでしょう。12月24日から26日は閉まります。最寄りはDLRのカティーサーク駅です。",
      },
      {
        kind: "highlight",
        title: "大広間の真ん中に立って、上を見る",
        body: "入ってすぐの大広間は、一辺約12メートルの完全な立方体です。床の中央に立って、金色の天井を見上げてください。上階の回廊に上がると、同じ部屋を見下ろす視点も得られます。",
      },
      {
        kind: "highlight",
        title: "チューリップ階段を下から見上げる",
        body: "支柱のない螺旋階段は、下から真上を見上げたときにいちばん美しく見えます。段が壁から張り出して互いに支え合う仕組みなので、中心には何もありません。白い渦がそのまま上へ抜けていく眺めです。",
      },
      {
        kind: "highlight",
        title: "アルマダ・ポートレートの窓を読む",
        body: "女王の背後の2つの窓を、左から右へ読んでください。左は迫るイングランドの火船、右は嵐で岩場に打ち上げられるスペインの艦隊。勝利の経緯が、窓の外の景色として肖像画に組み込まれています。",
      },
      {
        kind: "tip",
        title: "グリニッジの他の館と組み合わせる",
        body: "隣は国立海洋博物館、公園の丘の上はグリニッジ天文台で、カティーサークも歩いてすぐです。有料の天文台やカティーサークの時間から逆算して、空いた時間にこの館を入れると一日が組みやすくなります。音声ガイドは無料アプリのSmartifyで聞けます。",
      },
    ],
    artworks: [
      {
        title: "エリザベス1世（アルマダ・ポートレート）",
        engTitle: "Armada Portrait of Elizabeth I",
        artist: "作者不詳（イングランドの工房）",
        year: "1588年頃",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Armada_Portrait_Elizabeth_I_Queens_House.jpg/1280px-Armada_Portrait_Elizabeth_I_Queens_House.jpg",
        description: `**勝利のすぐ後に描かれた、「宣伝」としての肖像画です。** 1588年、スペインの無敵艦隊を退けたエリザベス1世を、これ以上ないほどの権威で飾り立てています。

**まず、女王の右手を見てください。** 指先が地球儀の上に置かれ、その指が覆っているのは**アメリカ大陸**です。海の向こうの新しい世界へ、イングランドが手を伸ばそうとしていることを示す身振りです。

**次に、背後の2つの窓を左から右へ見てください。** 左の窓には、スペイン艦隊に向かっていくイングランドの火船。右の窓には、嵐に流され、岩だらけの海岸で砕けるスペインの船。英国では、この嵐は「プロテスタントの風」と呼ばれました。**戦いの経緯が、窓の外の景色として一枚に組み込まれている**のです。

**衣装を見てください。** 襞襟、全身に縫い付けられた真珠、リボン、宝石。真珠の一部はスコットランド女王メアリーのものだったとも言われます。女王の脇には王冠。肖像を横長の画面に収め、背景に出来事を描き込むこの形式は、エリザベスの肖像画としては前例のないものでした。

**この絵には兄弟がいます。** アルマダ・ポートレートは3点が現存し、ほかの2点はウォーバーン・アビー（ベッドフォード公爵家）と、周りを切り詰めた形でナショナル・ポートレート・ギャラリーにあります。かつては宮廷画家ジョージ・ガワーの作とされていましたが、いまは3点とも別々の工房で、名前の分からない画家たちが描いたと考えられています。

クイーンズ・ハウスの1点は、無敵艦隊と戦ったフランシス・ドレークの一族に伝わったもので、2016年に公募の寄付によってロイヤル・ミュージアムズ・グリニッジの所蔵になりました。`,
        highlights: [
          "女王の右手の指先が、地球儀のアメリカ大陸を覆っている。海の向こうへ伸びるイングランドの野心",
          "左の窓に迫る火船、右の窓に嵐で砕けるスペイン艦隊。戦いの経緯が一枚に組み込まれている",
          "現存する3点のうちの1点。ほかはウォーバーン・アビーとナショナル・ポートレート・ギャラリーにある",
          "ドレークの一族に伝わり、2016年に公募の寄付でロイヤル・ミュージアムズ・グリニッジの所蔵になった",
        ],
      },
    ],
  },
];

const APPLY = process.argv.includes("--apply");
const ONLY = process.argv.find((a) => a.startsWith("--slug="))?.slice(7);

/** プレーンテキスト描画の欄に記法が入っていたら止める。 */
function findMarkdown(m: NewMuseum): string[] {
  const md = /\*\*|\[.+?\]\(.+?\)/;
  const bad: string[] = [];
  m.visitFlow.forEach((s) => {
    if (md.test(s.body) || md.test(s.title)) bad.push(`visitFlow: ${s.title}`);
  });
  m.highlightSpots.forEach((h) => {
    if (md.test(h.body) || md.test(h.title)) bad.push(`highlight: ${h.title}`);
  });
  m.trivia.forEach((t) => {
    if (md.test(t.content) || md.test(t.title)) bad.push(`trivia: ${t.title}`);
  });
  if (md.test(m.summary)) bad.push("summary");
  if (md.test(m.blurb)) bad.push("blurb");
  m.highlights.forEach((h) => {
    if (md.test(h)) bad.push(`highlights: ${h}`);
  });
  return bad;
}

/** react-markdown で実際に描画して、生の ** が残るかを見る。 */
function rendersRawBold(md: string): boolean {
  if (!md.includes("**")) return false;
  return renderToStaticMarkup(
    React.createElement(ReactMarkdown, null, md),
  ).includes("**");
}

/** markdown で描画される欄のうち、太字が壊れているもの。 */
function findBrokenBold(m: NewMuseum): string[] {
  const bad: string[] = [];
  // MuseumAbout.tsx と同じく、改行で段落に割ってから1段落ずつ描画する。
  m.description
    .split(/\r?\n/)
    .filter((p) => p.trim())
    .forEach((p, i) => {
      if (rendersRawBold(p)) bad.push(`description 第${i + 1}段落`);
    });
  (m.artworks ?? []).forEach((a) => {
    if (rendersRawBold(a.description)) bad.push(`artwork: ${a.title} / description`);
    a.highlights.forEach((h, i) => {
      if (rendersRawBold(h)) bad.push(`artwork: ${a.title} / highlights[${i}]`);
    });
  });
  return bad;
}

async function main() {
  const targets = MUSEUMS.filter((m) => !ONLY || m.slug === ONLY);
  if (ONLY && targets.length === 0) {
    console.error(`slug=${ONLY} はこのスクリプトの対象外です`);
    process.exitCode = 1;
    return;
  }

  let broken = false;
  for (const m of targets) {
    for (const b of findMarkdown(m)) {
      console.error(`✗ ${m.slug} / ${b}: マークダウン記法が入っています`);
      broken = true;
    }
    for (const b of findBrokenBold(m)) {
      console.error(`✗ ${m.slug} / ${b}: 太字が描画されず ** が残ります`);
      broken = true;
    }
    if (m.hours && m.hours.length !== 7) {
      console.error(`✗ ${m.slug}: hours は月〜日の7要素にしてください`);
      broken = true;
    }
  }
  if (broken) {
    console.error("\n直してから流し直してください。");
    process.exitCode = 1;
    return;
  }

  console.log(APPLY ? "== 投入 ==\n" : "== ドライラン(--apply で投入) ==\n");

  for (const m of targets) {
    const existing = await prisma.museum.findUnique({
      where: { slug: m.slug },
      select: { id: true },
    });
    const nameClash = await prisma.museum.findFirst({
      where: { name: m.name, slug: { not: m.slug } },
      select: { slug: true },
    });

    const openDays = m.hours
      ? m.hours
          .map((h, i) => (h ? "月火水木金土日"[i] : null))
          .filter(Boolean)
          .join("")
      : "未発表";
    console.log(
      `${m.name} (${m.slug})\n` +
        `  ${existing ? "既存を更新" : "新規"} / lv${m.recommendLevel} / ` +
        `${m.price === 0 ? "無料" : `£${m.price}`} / 開館 ${openDays} / ` +
        `本文 ${m.description.length}字 / 見どころ${m.highlightSpots.length} 豆知識${m.trivia.length} ` +
        `歩き方${m.visitFlow.length} 作品${m.artworks?.length ?? 0}`,
    );
    if (nameClash) {
      console.error(`  ✗ name が ${nameClash.slug} と衝突します。name は @unique です`);
      process.exitCode = 1;
      continue;
    }

    if (!APPLY) {
      console.log("");
      continue;
    }

    const { hours, info, highlightSpots, trivia, visitFlow, artworks, ...cols } = m;
    const saved = await prisma.museum.upsert({
      where: { slug: m.slug },
      create: { ...cols, category: "museum" },
      update: { ...cols, category: "museum" },
      select: { id: true },
    });
    const id = saved.id;

    await prisma.$transaction([
      // 付随データは毎回作り直す。冪等にするため。
      prisma.highlight.deleteMany({ where: { museumId: id } }),
      prisma.trivia.deleteMany({ where: { museumId: id } }),
      prisma.museumVisitStep.deleteMany({ where: { museumId: id } }),
      prisma.openingHours.deleteMany({ where: { museumId: id } }),
      prisma.museumInfo.deleteMany({ where: { museumId: id } }),

      // 開館時間が未発表の館は1行も作らない。推測の時間を構造化データに出さない。
      ...(hours
        ? [
            prisma.openingHours.createMany({
              data: DAYS.map((day, i) => ({
                museumId: id,
                dayOfWeek: day,
                openTime: hours[i]?.[0] ?? null,
                closeTime: hours[i]?.[1] ?? null,
              })),
            }),
          ]
        : []),
      prisma.museumInfo.create({
        data: { museumId: id, website: m.website, ...info },
      }),
      prisma.highlight.createMany({
        data: highlightSpots.map((h, i) => ({
          museumId: id,
          title: h.title,
          location: h.location ?? null,
          body: h.body,
          order: i,
        })),
      }),
      prisma.trivia.createMany({
        data: trivia.map((t) => ({ museumId: id, title: t.title, content: t.content })),
      }),
      prisma.museumVisitStep.createMany({
        data: visitFlow.map((s, i) => ({
          museumId: id,
          kind: s.kind,
          title: s.title,
          body: s.body,
          displayOrder: i + 1,
        })),
      }),
    ]);

    // 作品は作り直さない。id が作品ページの URL になっているため。
    for (const a of artworks ?? []) {
      const data = {
        title: a.title,
        engTitle: a.engTitle,
        artist: a.artist,
        year: a.year,
        room: a.room ?? null,
        location: a.room ?? null,
        image: a.image,
        description: a.description,
        highlights: a.highlights,
        // 館ページに出るのは recommendLevel 3 かつ mustSee の作品だけ。
        mustSee: true,
        recommendLevel: 3,
        isOnDisplay: true,
      };
      const found = await prisma.artwork.findFirst({
        where: { museumId: id, engTitle: a.engTitle },
        select: { id: true },
      });
      if (found) {
        await prisma.artwork.update({ where: { id: found.id }, data });
      } else {
        await prisma.artwork.create({ data: { ...data, museumId: id } });
      }
    }
    console.log("    → 投入\n");
  }

  const chars = targets.reduce((n, m) => n + m.description.length, 0);
  const works = targets.reduce((n, m) => n + (m.artworks?.length ?? 0), 0);
  console.log(`対象 ${targets.length}館 / 作品 ${works}点 / description 合計 ${chars}字`);
  if (!APPLY) console.log("\n--apply を付けると投入します。");
}

if (process.argv[1]?.includes("add-museums-2026-09-2")) {
  main()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

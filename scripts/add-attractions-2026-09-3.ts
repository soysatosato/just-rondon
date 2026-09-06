/**
 * /sightseeing に不足していた10スポットを追加する（2026-09 第3弾）。
 *
 *   npx tsx scripts/add-attractions-2026-09-3.ts            # 何が起きるか表示
 *   npx tsx scripts/add-attractions-2026-09-3.ts --apply    # 投入
 *   npx tsx scripts/add-attractions-2026-09-3.ts --apply --slug=temple-church
 *
 * 冪等。slug で upsert するので何度流しても同じ結果になる。
 * AttractionStory は source: "authored" で入る。
 * 歩き方は scripts/seed-visit-flow-2026-09-3.ts が持つ。
 *
 * ------------------------------------------------------------------
 * なぜこの10件なのか
 * ------------------------------------------------------------------
 * 第1弾(add-attractions-2026-09-2)が「定番なのに無かったもの」を埋めたので、
 * こちらはテーマ単位で残っていた穴を塞ぐ。
 *
 *   競技場    サッカー6会場・クリケット2会場があるのにラグビーの総本山が無い
 *   隠れた庭  大公園は網羅済みだが、壁の内側にある小さな庭が丸ごと空
 *   宗教建築  国教会の大物は揃っているが、円形教会と最古級の教区教会が無い
 *   無料の名所 ストリートアートと川底トンネルという、金のかからない定番が無い
 *
 * 既存データとの関係で特におかしかったもの:
 *   - バタシー発電所とチムニー・リフトはあるのに、隣のバタシー・パークが無い
 *   - バービカン・センターとバービカン・アート・ギャラリーはあるのに、
 *     同じ建物でいちばん人が入りたがる温室が無い
 *   - グリニッジ・マーケット(第1弾)の歩き方でフット・トンネルに触れたのに、
 *     トンネル自体のページが無い
 *   - ロンドン・ミュージアム(スミスフィールド)はあるのに、
 *     その真隣に建つ900年の教会が無い
 *
 * ------------------------------------------------------------------
 * M&M'sワールドを入れなかった理由
 * ------------------------------------------------------------------
 * レスター・スクエアの4フロアの菓子店で、来場者数だけなら上位に入る。
 * ただし公式サイト(mms.com)がボット遮断で全ページ 403 を返し、
 * ロンドン店のURLが実在するかを確認できなかった。website が null の
 * Attraction は現在1件も無く、ここで最初の1件を作る価値は無い。
 * 確認できたら単独で足すこと。
 *
 * ------------------------------------------------------------------
 * 曜日をここに書かないこと(重要)
 * ------------------------------------------------------------------
 * openingHours には時刻だけを書く。休みの曜日は closedWeekdays が持つ
 * (0=月 〜 6=日)。曜日ごとに開く"時刻"が違う場合の曜日表記だけは残す。
 *
 * 今回、曜日休館が確認できたのは3件:
 *   トゥイッケナム        月休(ただし地元の学校休暇中は開く)
 *   チェルシー薬草園      土休
 *   テンプル教会          土日休(平日も行事で閉まる日がある)
 *
 * バービカン温室だけ closedDaysCheckedAt を null に残してある。
 * 「公開日として告知された日以外は閉まる」方式で、曜日では表せない。
 * 空配列 + 確認済みにすると「曜日休館は無い」= ほぼ毎日開いている、と
 * 読まれてしまい、実態と正反対になる。closedNote に事実を置いた。
 *
 * ------------------------------------------------------------------
 * 本文の書き方
 * ------------------------------------------------------------------
 * seed-attraction-stories-level5.ts の基準に従う。要点:
 *   - 因果を書く。年号の羅列にしない
 *   - 事実(料金・アクセス・開館・所要)は本文に書かない。カラムが持つ
 *   - highlight は作らない。visitFlow を入れたときに伏せられるため
 *   - 俗説は訂正する
 *   - 閉じの ** を全角の句読点・閉じ括弧の直後に置かない
 *     NG: **〜である。**次に    OK: **〜である**。次に
 *
 * 画像はすべて Wikimedia Commons。Commons API の imageinfo で
 * 実在と mime を確認済み。開館時間・料金は各公式サイトを 2026-09-06 に
 * 実際に読んで取った値。
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** 0=月 〜 6=日。scripts/seed-attraction-closed-days.ts と同じ並び。 */
const MON = 0,
  SAT = 5,
  SUN = 6;

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

const CHECKED = new Date("2026-09-06");

export const SPOTS: NewSpot[] = [
  /* =================================================================
   * 1. トゥイッケナム・スタジアム（ワールドラグビー博物館）
   * =================================================================
   * SOURCES
   *   https://worldrugbymuseum.com/plan-your-visit/
   *   https://worldrugbymuseum.com/stadium-tours/
   *   https://en.wikipedia.org/wiki/Twickenham_Stadium
   *   https://en.wikipedia.org/wiki/Calcutta_Cup
   *
   * 開館・料金は 2026-09-06 に公式の Plan your visit から取得:
   *   Tue-Sat 10:00-17:00 / Sun 11:00-17:00 / Bank Holidays 11:00-17:00
   *   Monday: only over LBRuT school holidays
   *   博物館のみ 大人£12.50 / 子ども(5-15)£7.50
   *   ツアー付き 大人£32.00 / 子ども£21.50
   */
  {
    slug: "twickenham-world-rugby-museum",
    name: "トゥイッケナム・スタジアム（ワールドラグビー博物館）",
    engName: "World Rugby Museum and Twickenham Stadium Tour",
    tagline: "キャベツ畑を買った男の名で呼ばれる、ラグビーの総本山",
    summary:
      "8万2千人を収容する、ラグビーユニオン専用としては世界最大のスタジアム。イングランド代表の本拠地で、協会の本部でもある。東スタンドに入るワールドラグビー博物館は約4万点を収蔵し、イングランドとスコットランドが争うカルカッタ・カップの実物が置かれている。ピッチサイド、ロッカールーム、選手が芝へ出る通路を歩くスタジアムツアーと組み合わせられる。",
    address: "Allianz Stadium, Whitton Road, Twickenham TW2 7BA, UK",
    lat: 51.456,
    lng: -0.3417,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/0/02/Twickenham_Stadium_aerial_view_2014.jpg",
    website: "https://worldrugbymuseum.com/",
    category: "tour",
    recommendLevel: 3,
    isFree: false,
    isForKids: true,
    mustSee: false,
    priceAdult: "£12.50（博物館のみ）／£32.00（スタジアムツアー付き）",
    priceChild: "£7.50（5〜15歳、博物館のみ）／£21.50（ツアー付き）",
    durationText: "1〜2時間（ツアー付きは2〜3時間）",
    nearestStation: "Twickenham 徒歩15分",
    openingHours: "火〜土 10:00〜17:00 / 日・祝 11:00〜17:00",
    closedWeekdays: [MON],
    closedDaysCheckedAt: CHECKED,
    closedNote:
      "月曜は原則休みだが、地元リッチモンド区の学校休暇の期間は開く。試合と催しの日はツアーが休止する。",
    area: null,
    stories: [
      {
        kind: "history",
        heading: "キャベツ畑を 5,572 ポンドで買った男",
        body: `**1907年**、ラグビー協会の委員だった**ウィリアム・ウィリアムズ**が、ロンドン西郊の10エーカーほどの土地を**5,572ポンド12シリング6ペンス**で買った。当時そこは**キャベツ畑**——市場向けの野菜を作る農地だった。

協会の中では反対が強かった。中心部から遠すぎる、あんな畑に金を出すのか、と。この土地には長いあいだ「**ビリー・ウィリアムズのキャベツ畑**」という揶揄の呼び名がついてまわった。ところが皮肉なもので、いまではその呼び名のほうが愛称として定着し、実況でも普通に使われる。

最初の試合は**1909年**、ハーレクインズ対リッチモンド。代表の国際試合は**1910年**のイングランド対ウェールズが最初である。以後100年以上にわたって増築が続き、収容は**8万2千人**に達した。ラグビーユニオン専用の競技場としては世界最大で、英国全体でもウェンブリーに次ぐ規模になっている。

なお2024年から命名権が売られ、正式な呼称は**アリアンツ・スタジアム**に変わった。切符にも案内板にもこの名が出るが、人はいまもトゥイッケナムと呼ぶ。`,
      },
      {
        kind: "context",
        heading: "ラグビーの起源の話には、証拠が無い",
        body: `博物館の収蔵は約**4万点**で、この競技に関するものとしては世界最大とされる。中心に置かれているのが**カルカッタ・カップ**である。

由来が変わっている。1878年、インドのカルカッタ・フットボール・クラブが解散した。残った資金をどうするかという話になり、クラブは銀行から預金を**銀のルピー貨**で引き出し、それを溶かして一つの杯に鋳造した。取っ手はコブラの形、蓋の上には象が乗っている。翌1879年から、イングランドとスコットランドがこの杯を毎年争い続けている。

もうひとつ、この博物館が扱いに気を遣っているのが**競技の起源**である。「1823年、ラグビー校のウィリアム・ウェッブ・エリスがフットボールの試合中にボールを抱えて走り出した」——この話は世界中で語られているが、**同時代の証拠は一つも無い**。逸話が現れるのは出来事から半世紀以上あとの回想録で、しかも伝聞である。ワールドカップの優勝杯にその名が冠されているにもかかわらず、起源としては伝説として扱うのが現在の理解であり、展示もその線で組まれている。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- **月曜は休み**。ただし地元リッチモンド区の学校休暇の期間は開く
- 博物館だけの券と、スタジアムツアーを付けた券がある。ツアーはピッチサイド、ロッカールーム、選手用の通路を歩く
- 試合と催しの日はツアーが休止する。公式の開催カレンダーと合わせて確認すること
- ウォータールー駅から列車で30分前後、トゥイッケナム駅から徒歩15分。試合日以外は静かな住宅地である
- ローズ（クリケット）、ウィンブルドン（テニス）、ウェンブリー（サッカー）と並ぶ、英国の競技別の総本山のひとつ`,
      },
    ],
  },

  /* =================================================================
   * 2. ホランド・パーク（京都庭園）
   * =================================================================
   * SOURCES
   *   https://www.rbkc.gov.uk/parks-leisure-and-culture/parks/your-local-park/holland-park
   *   https://en.wikipedia.org/wiki/Holland_Park
   *   https://en.wikipedia.org/wiki/Holland_House
   *   https://operahollandpark.com/
   */
  {
    slug: "holland-park-kyoto-garden",
    name: "ホランド・パーク（京都庭園）",
    engName: "Holland Park and the Kyoto Garden",
    tagline: "空襲で焼けた邸宅の跡に、京都から贈られた庭がある",
    summary:
      "ケンジントンにある22ヘクタールの公園。中心にあったジャコビアン様式の邸宅ホランド・ハウスは1940年の空襲でほぼ焼け落ち、残った壁がいまは夏の野外オペラの背景になっている。園内の京都庭園は1991年に京都商工会議所から贈られた本格的な日本庭園で、滝と鯉の池のまわりを放し飼いの孔雀が歩いている。2011年の震災への支援に対する礼として作られた福島記念庭園も隣にある。入場無料。",
    address: "Ilchester Place, London W8 6LU, UK",
    lat: 51.5024,
    lng: -0.2043,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/ca/Kyoto_Garden%2C_Holland_Park_-_geograph.org.uk_-_7484766.jpg",
    website:
      "https://www.rbkc.gov.uk/parks-leisure-and-culture/parks/your-local-park/holland-park",
    category: "garden",
    recommendLevel: 3,
    isFree: true,
    isForKids: true,
    mustSee: false,
    priceAdult: "無料",
    priceChild: "無料",
    durationText: "1〜2時間",
    nearestStation: "Holland Park 徒歩8分",
    openingHours: "7:30〜日没まで（閉園時刻は季節で前後する）",
    closedWeekdays: [],
    closedDaysCheckedAt: CHECKED,
    closedNote: null,
    area: null,
    stories: [
      {
        kind: "history",
        heading: "ホイッグ党のサロンが、一夜で焼けた",
        body: `**ホランド・ハウス**は1605年に建った。当初は「コープ城」と呼ばれた大きなジャコビアン様式の邸宅で、のちにフォックス家——ホランド男爵家——のものになる。

この家が知られているのは建築ではなく、そこで開かれた**集まり**のほうである。19世紀の前半、第3代ホランド男爵夫妻はここに政治家と文人を集めた。バイロン、ウォルター・スコット、ディケンズ、パーマストン。ホイッグ党の思想がこの客間で練られたと言ってよく、「**ホランド・ハウス・セット**」という呼び名が残っている。当時の英国でもっとも影響力のある社交の場だった。

**1940年9月**の夜、ドイツ軍の焼夷弾がこの家を直撃した。火は10時間燃え続け、建物はほとんど失われた。残ったのは東翼と1階のアーケードだけである。

戦後、跡地は自治体が買い取って公園になった。焼け残った壁はそのまま保存され、いまは夏のあいだ**オペラ・ホランド・パーク**の野外舞台の背景として使われている。廃墟を客席から見ながらオペラを聴く、という奇妙な体験がここで成立している。`,
      },
      {
        kind: "context",
        heading: "京都から贈られた庭に、孔雀が歩いている",
        body: `園内北側の**京都庭園**は、**1991年**に京都商工会議所からロンドンへ贈られたものである。翌年にかけて行われた日本祭を記念し、日本の庭師が現地で作庭した。

段になった滝、鯉の泳ぐ池、石灯籠、楓と躑躅。日本庭園としてはよく作られているほうで、秋の紅葉と春の花期に人が集まる。

ただしこの庭がロンドンらしくなるのは、**孔雀**のせいである。ホランド・パークには放し飼いの孔雀がおり、餌を求めて京都庭園にも入ってくる。石灯籠の脇を孔雀が歩き、池の縁で羽を広げる。作庭した側の意図には無かったはずの光景が、いまではこの庭の定番の写真になっている。

すぐ隣にもうひとつ、**福島記念庭園**がある。こちらは**2012年**、2011年の震災に対する英国からの支援への礼として作られた。同じ公園の中に、贈った側と礼を返した側の庭が並んでいる例は、ほかにあまり無い。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 入場無料。京都庭園も無料で、公園の北寄りにある
- 孔雀は放し飼い。餌を与えないよう掲示が出ている
- **紅葉は11月**、躑躅は5月ごろ。写真を撮る人が集中するのはこの2つの時期
- デザイン・ミュージアムが公園の南の縁に建っている。旧コモンウェルス・インスティテュートの建物を改装したもの
- ホランド・パーク駅（セントラル線）から徒歩8分。ハイ・ストリート・ケンジントン駅からも歩ける
- オペラ・ホランド・パークは6月から8月ごろ。日程と券は別に確認すること`,
      },
    ],
  },

  /* =================================================================
   * 3. バービカン温室
   * =================================================================
   * SOURCES
   *   https://www.barbican.org.uk/whats-on/2026/event/visit-the-conservatory
   *   https://en.wikipedia.org/wiki/Barbican_Centre
   *   https://en.wikipedia.org/wiki/Barbican_Estate
   *
   * 公式(2026-09-06)より:
   *   「1980年から81年にかけて植えられ、1984年に開いた。約1,500種」
   *   「公開日として掲載されていない日は閉まっている。入場は無料だが要予約。
   *     券は1か月前から。当日券は公開日の9:30から少数」
   *
   * ★ website は年号入りのURL。2027年になったら差し替えること。
   *   バービカンは温室の常設ページを持っておらず、毎年のイベントページに
   *   なっている。ルート(barbican.org.uk)に逃がすと公開日に辿り着けない。
   */
  {
    slug: "barbican-conservatory",
    name: "バービカン温室",
    engName: "Barbican Conservatory",
    tagline: "劇場の舞台裏を隠すために、ガラスの温室を被せた",
    summary:
      "バービカン・センターの上階にある温室。ロンドンではキューガーデンに次ぐ規模で、約1,500種の植物と樹木が入る。もとは劇場のフライタワー——舞台の上に背景を吊り上げるための背の高い設備——を外から隠す必要があって生まれた空間で、その建築上の問題への答えがガラス張りの温室だった。入場は無料。ただし一般に開ける日が限られていて予約制なので、行く前に必ず公開日を確認すること。",
    address: "Barbican Centre, Silk Street, London EC2Y 8DS, UK",
    lat: 51.52,
    lng: -0.0937,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/dd/Barbican_Conservatory_-_1.jpg",
    website:
      "https://www.barbican.org.uk/whats-on/2026/event/visit-the-conservatory",
    category: "garden",
    recommendLevel: 2,
    isFree: true,
    isForKids: true,
    mustSee: false,
    priceAdult: "無料（要予約）",
    priceChild: "無料（要予約）",
    durationText: "45分〜1時間",
    nearestStation: "Barbican 徒歩5分",
    openingHours: "公開日のみ、時間指定の予約制（公開日程は公式で確認）",
    closedWeekdays: [],
    closedDaysCheckedAt: null,
    closedNote:
      "公開日として告知された日以外は閉まっている。貸切の催しが入る日も閉まる。無料だが予約が要り、券は1か月前から。当日券は公開日の朝9時半から少数だけ出る。",
    area: "city",
    stories: [
      {
        kind: "history",
        heading: "隠したかったのは、劇場の天井裏",
        body: `バービカン一帯は、**1940年12月**の空襲でほぼ完全に焼き払われた。戦後、この更地に建てられたのが、住宅と劇場とコンサートホールと学校を一体で組んだバービカン・エステートである。設計は**チェンバリン・パウエル・アンド・ボン**、コンクリート打ち放しのブルータリズムを代表する建築として知られる。

設計上の難問のひとつが**フライタワー**だった。劇場には、舞台の上に背景を吊り上げて収納するための塔状の空間が要る。バービカン劇場のそれは高く、外から見れば巨大で無表情な箱が突き出すことになる。周囲は住宅である。

出てきた答えが、**その箱にガラスの温室を被せる**ことだった。1980年から81年にかけて植栽が行われ、**1984年**に開いている。つまりこの温室は、植物を育てるために計画された場所ではない。**劇場の設備を視界から消すという建築上の都合**から生まれた副産物である。`,
      },
      {
        kind: "context",
        heading: "1,500種が、コンクリートの上で40年育っている",
        body: `いまここには約**1,500種**の植物と樹木が入る。温帯と乾燥帯が混ざっており、南アフリカの岩石砂漠の低木からブラジルの海岸の植物まで、まったく系統の違うものが一つ屋根の下に並ぶ。木性シダ、ナツメヤシ、モンステラ、コーヒー、ショウガ。原産地では希少になっている種も含まれる。

乾燥帯の区画は別室になっていて、サボテンと多肉植物が集められている。池には鯉とミズガメがいる。

面白いのは足元である。ここは地面の上ではなく、**劇場の屋上**にあたる。コンクリートの構造物の上に土を載せて40年以上育て続けた結果が、この密度である。窓の外にはバービカンの高層住宅とコンクリートの回廊が見え、内側は熱帯になっている。ロンドンの温室のうち、ここだけが**建築の内側にある**。

そして、いつでも入れるわけではない。一般公開は**日を限って**行われ、告知されていない日は閉まっている。貸切の催しが入れば、その日も閉まる。無料だが予約制である。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- **入場無料。ただし予約制で、公開日が限られている**。行く前に必ず公式の公開日程を確認すること
- 券は1か月前から公開される。当日券は公開日の朝9時半から、数に限りがある
- 館内の案内が分かりにくい。標識を追うより、受付で場所を聞くほうが早い
- 同じ建物にバービカン・アート・ギャラリーがある。こちらは有料だが、開いている日はずっと多い
- ロンドンでキューガーデンのテンペレート・ハウスに次ぐ規模とされる`,
      },
    ],
  },

  /* =================================================================
   * 4. チェルシー薬草園
   * =================================================================
   * SOURCES
   *   https://www.chelseaphysicgarden.co.uk/visit/opening-times-and-tickets/
   *   https://en.wikipedia.org/wiki/Chelsea_Physic_Garden
   *   https://en.wikipedia.org/wiki/Philip_Miller
   *
   * 公式(2026-09-06)より:
   *   開園 日〜金 11:00-17:00（土曜休）
   *   大人 £15（寄付込み）/ £13.50、5〜25歳 £6.50 / £5、5歳未満 無料
   */
  {
    slug: "chelsea-physic-garden",
    name: "チェルシー薬草園",
    engName: "Chelsea Physic Garden",
    tagline: "1673年から同じ壁の中にある、ロンドン最古の植物園",
    summary:
      "テムズ川に面した壁囲いの中にある、1673年開設のロンドン最古の植物園。薬剤師の徒弟に薬草を見分けさせるための教材として作られた。約5,000種の食用・薬用・実用の植物が、わずか4エーカー（1.6ヘクタール）に収まっている。高い壁と川がつくる微気候のおかげで、英国では育たないはずのオリーブやグレープフルーツが屋外で実をつける。土曜だけ閉まる。",
    address: "66 Royal Hospital Road, Chelsea, London SW3 4HS, UK",
    lat: 51.4846,
    lng: -0.1622,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/69/Beds_-_Chelsea_Physic_Garden_-_DSC02830.jpg",
    website: "https://www.chelseaphysicgarden.co.uk/",
    category: "garden",
    recommendLevel: 2,
    isFree: false,
    isForKids: false,
    mustSee: false,
    priceAdult: "£15（寄付込み）／£13.50",
    priceChild: "£6.50（5〜25歳）／5歳未満は無料",
    durationText: "1時間30分〜2時間",
    nearestStation: "Sloane Square 徒歩12分",
    openingHours: "11:00〜17:00（最終入場は閉園30分前）",
    closedWeekdays: [SAT],
    closedDaysCheckedAt: CHECKED,
    closedNote:
      "冬季に長期の休園期間が入ることがある。出発前に公式の開園日を確認すること。",
    area: null,
    stories: [
      {
        kind: "history",
        heading: "薬剤師が、薬草を見分けるために作った",
        body: `**1673年**、ロンドンの薬剤師組合が、テムズ川べりのこの土地に庭を作った。目的は観賞ではない。**徒弟の教育**である。

当時の薬はほとんどが植物からできていた。似た葉の草を取り違えれば人が死ぬ。だから徒弟には、生きた状態の薬草を見分ける訓練が要る。この庭は最初、そのための教材だった。川に面した場所が選ばれたのは、船で植物を運び込めるからでもある。

**1712年**にチェルシーの荘園を買った**ハンス・スローン**——大英博物館のもとになる収集を残した医師である——が、**1722年**にこの庭を組合へ永代で貸し出した。地代は**年に£5**。この地代は、いまも同じ額が払われ続けている。庭の中央にはスローンの像が立つ（本物は大英博物館にあり、これは複製である）。

同じ1722年から48年間、庭師を務めた**フィリップ・ミラー**の代に、ここは当時の世界でもっとも重要な植物園のひとつになった。彼の書いた『園芸事典』は18世紀の標準的な参考書である。**1732年**にこの庭からアメリカのジョージア植民地へ送られた綿の種が、のちの米国の綿産業の出発点になったとされる。`,
      },
      {
        kind: "context",
        heading: "壁の内側だけ、気候が違う",
        body: `広さは**4エーカー**、1.6ヘクタールしかない。ロンドンの植物園としては小さいほうである。にもかかわらず、ここで育っているものが変わっている。理由は**微気候**にある。

三方を高い煉瓦の壁が囲み、南はテムズ川に接している。壁が北風を止め、川が気温の振れを均す。結果として、この庭の内側だけが英国の他のどこよりも温暖な状態に保たれている。

そのおかげで屋外で実をつけるものがある。英国最大とされる**オリーブ**の木、屋外で実る**グレープフルーツ**、そして**ザクロ**。いずれも本来この緯度では育たない。煉瓦の壁一枚を隔てて、植物にとっては別の国になっている。

構成も独特で、区画は見た目の美しさではなく**用途と系統**で分けられている。薬用植物の庭、食用と実用の庭、そして庭自体の歴史をたどる散歩道。何を見ているのか分からないまま歩くとただの雑然とした庭に見えるので、解説を読むか、案内付きで回るほうがよい。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- **土曜が休み**。開くのは日曜から金曜まで
- 案内付きのツアーは4月から10月、入場料に含まれる。ただし有志の案内人が担当するので、当日必ず行われるとは限らない
- 冬季に長期の休園期間が入ることがある。出発前に公式の開園日を確認すること
- スローン・スクエア駅から徒歩12分。庭のすぐ外の道をバスが通る
- 温室の音声ガイドが無料で用意されている。自分の携帯で聞く形式
- すぐ東にチェルシー王立病院がある。5月のRHSチェルシー・フラワー・ショーの会場はそちら`,
      },
    ],
  },

  /* =================================================================
   * 5. ポストマンズ・パーク
   * =================================================================
   * SOURCES
   *   https://www.cityoflondon.gov.uk/things-to-do/city-gardens/find-a-garden/postmans-park
   *   https://en.wikipedia.org/wiki/Postman%27s_Park
   *   https://en.wikipedia.org/wiki/Memorial_to_Heroic_Self-Sacrifice
   *   https://en.wikipedia.org/wiki/George_Frederic_Watts
   *
   * ★ category は garden ではなく historic にしてある。0.2エーカーの
   *   緑地ではあるが、読者がここへ行く理由は植栽ではなく54枚の陶板である。
   */
  {
    slug: "postmans-park",
    name: "ポストマンズ・パーク",
    engName: "Postman's Park",
    tagline: "他人を助けて死んだ市井の人を、54枚の陶板が記録している",
    summary:
      "セント・ポール大聖堂の北にある小さな公園。名は、近くにあった郵便局の職員が昼休みに使ったことによる。園内の木造の回廊には、他人の命を救って死んだ普通の人々を記録した陶板が並ぶ。画家G・F・ワッツが1900年に開いた「英雄的自己犠牲の記念碑」で、現在54枚。1枚ずつ、誰が誰をどう助けて死んだかが数行で書かれている。入場無料。",
    address: "King Edward Street, London EC1A 7BT, UK",
    lat: 51.517,
    lng: -0.0983,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/5/50/Postman%27s_Park_Wall_of_Heroes.JPG",
    website:
      "https://www.cityoflondon.gov.uk/things-to-do/city-gardens/find-a-garden/postmans-park",
    category: "historic",
    recommendLevel: 2,
    isFree: true,
    isForKids: false,
    mustSee: false,
    priceAdult: "無料",
    priceChild: "無料",
    durationText: "30分",
    nearestStation: "St Paul's 徒歩3分",
    openingHours: "8:00〜19:00頃（冬季は早く閉まる）",
    closedWeekdays: [],
    closedDaysCheckedAt: CHECKED,
    closedNote: null,
    area: "city",
    stories: [
      {
        kind: "history",
        heading: "13年間、誰も相手にしなかった提案",
        body: `**1887年**、画家の**ジョージ・フレデリック・ワッツ**がタイムズ紙に投書した。ヴィクトリア女王の即位50年を記念するなら、王侯や軍人ではなく、**他人を救って死んだ普通の人々**を記録する記念碑を作るべきだ、という内容である。

反応は無かった。**13年**待って何も起きなかったので、ワッツは自分の金で作ることにした。**1900年**、シティのこの小さな公園に木造の回廊が建ち、陶板が掛けられた。ダウルトン製の釉薬タイルで、のちにウィリアム・ド・モーガンの工房が引き継いでいる。

ワッツは1904年に死んだ。事業は妻のメアリーが続けたが、彼女の死後は途絶える。当初は120枚を予定していたところ、現在あるのは**54枚**である。

長い空白のあと、**2009年**に1枚だけ追加された。2007年、テムズミードの運河に落ちた少年を助けて死んだ印刷技術者**リー・ピット**の板である。**78年ぶり**の追加だった。`,
      },
      {
        kind: "context",
        heading: "1枚が、数行で一人の生涯を終わらせる",
        body: `陶板に書かれているのは、名前と、職業と、何をして死んだかである。それだけである。

たとえば——「**アリス・エアーズ**、煉瓦工の助手の娘。バラのユニオン・ストリートの燃える家から3人の子どもを勇敢に救い出し、自らの若い命を代償とした。1885年4月24日」。

この形式が効く。装飾も比喩も無く、事実だけが並んでいる。溺れた者を助けて溺れた者、線路に降りた者、火の中に入った者。**子どもを助けて死んだ大人**と、**弟や妹を助けて死んだ子ども**が同じ壁に並んでいる。読み進めるうちに、記念碑というより名簿を読んでいる感覚になってくる。

この場所が広く知られるようになったのは**2004年**の映画「クローサー」による。冒頭で登場人物がこの回廊を訪れ、アリス・エアーズの名を自分の偽名として使う。公開後、訪問者が目に見えて増えた。

公園そのものは小さい。かつてこの近くに郵便局の本部があり、その職員が昼休みに来ていたことから**郵便屋の公園**と呼ばれるようになった。いまも近隣の勤め人が弁当を食べている。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 入場無料。柵はあるが、日中は開いている
- 回廊は公園の**西寄り**にある。入って正面ではないので、見落とさないこと
- 陶板は屋根の下にあるので、雨の日でも読める
- 全部読むと30分ほどかかる。回廊の前に座れる場所がある
- セント・ポール大聖堂から徒歩3分。ロンドン・ミュージアム（スミスフィールド）とセント・バーソロミュー・ザ・グレートも徒歩圏`,
      },
    ],
  },

  /* =================================================================
   * 6. バタシー・パーク
   * =================================================================
   * SOURCES
   *   https://www.wandsworth.gov.uk/battersea-park/
   *   https://en.wikipedia.org/wiki/Battersea_Park
   *   https://en.wikipedia.org/wiki/London_Peace_Pagoda
   *   https://en.wikipedia.org/wiki/Nipponzan-My%C5%8Dh%C5%8Dji
   */
  {
    slug: "battersea-park",
    name: "バタシー・パーク",
    engName: "Battersea Park",
    tagline: "決闘場だった湿地に、日本の僧が仏塔を建てた",
    summary:
      "テムズ川の南岸に広がる約80ヘクタールの公園。1858年開園。それ以前は決闘と賭博と日曜の見世物で知られた荒れ地で、1829年には現職の首相だったウェリントン公爵がここで決闘している。川沿いに立つロンドン平和仏塔は、1985年に日本山妙法寺の僧と尼が自ら建てたもの。ボート池、19世紀の亜熱帯庭園、子ども動物園があり、バタシー発電所から徒歩10分。",
    address: "Battersea Park, London SW11 4NJ, UK",
    lat: 51.4791,
    lng: -0.1575,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/8/8c/Battersea_Park_Peace_Pagoda_2024-05-25.jpg",
    website: "https://www.wandsworth.gov.uk/battersea-park/",
    category: "garden",
    recommendLevel: 2,
    isFree: true,
    isForKids: true,
    mustSee: false,
    priceAdult: "無料（子ども動物園のみ有料）",
    priceChild: "無料（子ども動物園のみ有料）",
    durationText: "1〜2時間",
    nearestStation: "Battersea Power Station 徒歩10分",
    openingHours: "6:30〜日没まで（閉園時刻は季節で前後する）",
    closedWeekdays: [],
    closedDaysCheckedAt: CHECKED,
    closedNote: null,
    area: null,
    stories: [
      {
        kind: "history",
        heading: "現職の首相が、この野原で決闘した",
        body: `公園になる前、ここは**バタシー・フィールズ**と呼ばれる湿地だった。評判は悪い。日曜になると見世物と賭博と酒の市が立ち、決闘の場所としても使われていた。

いちばん有名な決闘は**1829年3月21日**である。当時の首相**ウェリントン公爵**が、カトリック解放法をめぐって自分を侮辱した**ウィンチルシー伯爵**に決闘を申し込み、ここで撃ち合った。ワーテルローでナポレオンを破った男が、現職の首相のまま拳銃を構えたことになる。結果は両者とも外した——公爵はわざと横に撃ち、伯爵は空へ向けて撃った、と伝えられる。

この土地を公園にする案が通るのは1840年代で、**1858年**に開園した。湿地を埋め立てるために、サリー商業ドックの掘削で出た土がここへ運び込まれている。設計は**ジェイムズ・ペネソーン**。

もうひとつ記録がある。**1864年**、サッカー協会（FA）の規則にもとづく試合が、初めてこの公園で行われた。いま世界中で行われている競技の、規則の上での最初の一戦がここである。`,
      },
      {
        kind: "context",
        heading: "日本の僧が建てた仏塔が、川を向いて立っている",
        body: `公園の川沿いに、白い**ロンドン平和仏塔**が立っている。高さ33.5メートル、四方に金色の仏像が四体——誕生、成道、初転法輪、涅槃を表す。

建てたのは**日本山妙法寺**という日本の仏教教団である。**1984年から85年**にかけて、僧と尼が実際に現地で作業した。当時のロンドンの自治体（GLC）が「平和年」を掲げていたことに応じた贈り物で、費用も労力も日本側が負っている。

皮肉なことに、完成の直後にGLCは中央政府によって廃止された。贈られた相手のほうが消えたわけだが、仏塔は残った。いまも同じ教団の僧が近くに住み、毎日太鼓を打っている。

この公園はほかの部分も入り組んでいる。ボート池、19世紀の**亜熱帯庭園**——英国では最初期の試みとされる——、1951年の英国祭のときに作られた遊園地の名残、そしてポンプハウス・ギャラリー。有料なのは子ども動物園だけで、あとはすべて無料である。

同じ岸に**バタシー発電所**が建っており、徒歩10分で行き来できる。発電所の煙突に登ってからこの公園へ降りてくると、同じ景色を高さを変えて2度見ることになる。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 入場無料。子ども動物園だけが有料
- 平和仏塔は公園の**北の縁**、川沿いの遊歩道に面している
- バタシー・パワー・ステーション駅（ノーザン線）から徒歩10分。鉄道のバタシー・パーク駅からも近い
- アルバート橋を歩いて渡ればチェルシー。チェルシー薬草園まで10分ほど
- 秋は亜熱帯庭園と池の周りが色づく。広いので、目的地を決めずに入ると歩き疲れる`,
      },
    ],
  },

  /* =================================================================
   * 7. リーク・ストリート・アーチ
   * =================================================================
   * SOURCES
   *   https://www.leakestreetarches.london/
   *   https://en.wikipedia.org/wiki/Leake_Street
   *   https://en.wikipedia.org/wiki/The_Cans_Festival
   */
  {
    slug: "leake-street-arches",
    name: "リーク・ストリート・アーチ（グラフィティ・トンネル）",
    engName: "Leake Street Arches",
    tagline: "バンクシーが2008年に開放した、描いてよいトンネル",
    summary:
      "ウォータールー駅の下をくぐる、全長300メートルほどの旧線路のトンネル。2008年5月、バンクシーが世界中のステンシル作家を集めて「Cans Festival」を開いた場所で、以後ここは合法的に描いてよい壁として残っている。壁は絶えず上書きされるので、同じ絵は数日から数週間しか残らない。つまりバンクシーの作品もとうに消えている。入場無料、24時間通り抜けできる。",
    address: "Leake Street, London SE1 7NN, UK",
    lat: 51.5013,
    lng: -0.1145,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/d/d6/Leake_Street_Graffiti_Tunnel_Looking_North.jpg",
    website: "https://www.leakestreetarches.london/",
    category: "architecture",
    recommendLevel: 3,
    isFree: true,
    isForKids: false,
    mustSee: false,
    priceAdult: "無料",
    priceChild: "無料",
    durationText: "20〜30分",
    nearestStation: "Waterloo 徒歩3分",
    openingHours: "常時開放（トンネル沿いの店は概ね12:00〜23:00）",
    closedWeekdays: [],
    closedDaysCheckedAt: CHECKED,
    closedNote: null,
    area: "southbank",
    stories: [
      {
        kind: "history",
        heading: "3日間の催しが、そのまま定着した",
        body: `リーク・ストリートは、ウォータールー駅へ列車を運ぶ高架の下を通る旧道である。かつてユーロスターが発着していた線路の下にあたり、長らく暗く汚れた通り抜けにすぎなかった。

**2008年5月**、**バンクシー**がここで「**Cans Festival**」という催しを開いた。世界各国から**39人**のステンシル作家を招き、トンネルの壁を全面的に開放して、連休のあいだ一般に公開した。行列ができた。

催しは3日で終わったが、壁のほうはそのままになった。以後ここは**描くことが黙認され、やがて公式に認められた壁**として続いている。ロンドンで合法的にスプレーを使える場所は数えるほどしかなく、そのなかでも最大級である。

近年はトンネル沿いのアーチが飲食店や催事の会場に改装され、「リーク・ストリート・アーチ」として売り出されるようになった。それでも壁の運用そのものは変わっていない。`,
      },
      {
        kind: "context",
        heading: "見に行っても、そこには何も残っていない",
        body: `この場所についていちばん誤解されているのが、これである。**バンクシーの絵を見に行っても、無い**。

理由は単純で、ここが誰でも描いてよい壁だからである。誰かが描いた上に、翌週には別の誰かが描く。人気のある位置ほど回転が速い。2008年の作品はもちろん、先月の作品も残っていない。**残らないことが、この場所の仕組みそのもの**である。

だから見るべきものは、特定の作品ではなく**壁の状態**になる。塗料が層になって数センチの厚みで盛り上がっている箇所があり、それが十数年ぶんの上書きの記録である。運がよければ、誰かが描いている最中に出くわす。

歩くときの作法もそこから決まる。**制作中の人の前を横切らない**。写真は撮ってよいが、描いている本人を正面から撮るなら一声かけること。スプレーの臭いがこもるので、喘息があるなら長居しないほうがよい。

トンネルは公道で、24時間通り抜けられる。ただし夜は明かりが乏しく、人通りも減る。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 入場無料。誰でも描いてよい（用具は自分で持ち込む）
- ウォータールー駅から徒歩3分。ヨーク・ロード側から入ると分かりやすい
- 音がよく反響する。アーチの中の催事場から音楽が漏れていることが多い
- ロンドン・アイまで徒歩8分、サウスバンク・センターまで10分。川沿いの散歩と組み合わせやすい
- 「ここでしか見られない絵」を期待して行くと外れる。壁は毎週変わる`,
      },
    ],
  },

  /* =================================================================
   * 8. グリニッジ・フット・トンネル
   * =================================================================
   * SOURCES
   *   https://www.royalgreenwich.gov.uk/parking-transport-and-streets/travel-foot-bike-or-public-transport/check-status-foot-tunnels
   *   https://en.wikipedia.org/wiki/Greenwich_foot_tunnel
   *   https://historicengland.org.uk/listing/the-list/list-entry/1289371
   */
  {
    slug: "greenwich-foot-tunnel",
    name: "グリニッジ・フット・トンネル",
    engName: "Greenwich Foot Tunnel",
    tagline: "渡し船の運賃を無くすために、1902年にテムズの下を掘った",
    summary:
      "グリニッジと対岸のアイル・オブ・ドッグズを結ぶ、川底の歩行者用トンネル。1902年開通、全長370メートル、白い釉薬タイル20万枚で覆われている。渡し船に頼っていた労働者が、天候と運賃に左右されずにドックへ通えるようにするために掘られた。無料で、階段は24時間通れる。北側の出口から振り返ると、旧王立海軍学校の正面が川ごしに一枚の絵のように収まる。",
    address: "Cutty Sark Gardens, London SE10 9HT, UK",
    lat: 51.4827,
    lng: -0.0096,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/66/Greenwich_Foot_Tunnel%2C_Greenwich_side.jpg",
    website:
      "https://www.royalgreenwich.gov.uk/parking-transport-and-streets/travel-foot-bike-or-public-transport/check-status-foot-tunnels",
    category: "architecture",
    recommendLevel: 2,
    isFree: true,
    isForKids: true,
    mustSee: false,
    priceAdult: "無料",
    priceChild: "無料",
    durationText: "20〜30分（往復）",
    nearestStation: "Cutty Sark（DLR）徒歩3分",
    openingHours: "階段は24時間（エレベーターは稼働時間が決まっている）",
    closedWeekdays: [],
    closedDaysCheckedAt: CHECKED,
    closedNote:
      "補修でエレベーターが止まることがある。稼働状況は自治体の公式ページに出る。",
    area: "greenwich",
    stories: [
      {
        kind: "history",
        heading: "船が来ないと、仕事に行けなかった",
        body: `19世紀の終わり、テムズ南岸に住む労働者の多くは、対岸の**アイル・オブ・ドッグズ**にある造船所とドックへ通っていた。移動の手段は渡し船である。

これが問題だった。船は霧が出れば止まり、風が強ければ欠航する。運賃も毎日払わなければならない。仕事に行けるかどうかが、その日の天気と持ち金で決まっていた。

**1902年**、ロンドン州議会が川底のトンネルを開通させた。設計は技師の**アレクサンダー・ビニー**。全長**370メートル**、満潮時で水面下**15メートル**、内壁は白い釉薬タイル**20万枚**で覆われている。両端には円形のガラス屋根の建物が建ち、エレベーターと螺旋階段が地下へ降りていく。

そして**無料**にされた。渡し船の運賃をなくすことが目的だったのだから当然ではあるが、この無料は120年以上変わっていない。テムズを渡る手段のうち、いまも料金を取らないものは数えるほどしかない。`,
      },
      {
        kind: "context",
        heading: "途中で、トンネルの太さが変わる",
        body: `歩いていると、北寄りの区間で**内壁の様子が変わる**のに気づく。白いタイルが途切れ、鋳鉄の輪が剥き出しになった区間が続き、しかもわずかに狭い。

これは**戦争の跡**である。1940年、この付近に落ちた爆弾でトンネルが損傷した。修復にあたって内側にもう一枚の鉄の管を通したため、その区間だけ内径が小さくなっている。天井が近づき、足音の響き方も変わる。設計時の断面と、爆撃後の断面が、同じトンネルの中で切り替わる。

もうひとつ、歩き通す価値があるのは**北側の出口**である。アイランド・ガーデンズに出て振り返ると、川の向こうに**旧王立海軍学校**の左右対称の正面と、その奥の丘に立つ天文台が、一枚の絵のように収まる。これは18世紀にカナレットが描いた構図とほぼ同じで、グリニッジという場所が「対岸から見られること」を前提に設計されたことが、立った瞬間に分かる。**この眺めは、川を渡らないと手に入らない**。

自転車は押して歩くこと。トンネル内は乗車禁止である。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- **無料。階段は24時間通れる**。エレベーターは稼働時間が決まっているので、公式の稼働状況を見てから行くこと
- 片道の徒歩は10分ほど。往復して戻る人が多い
- 螺旋階段はかなり長い。膝に不安があるならエレベーターの時間を先に確認すること
- 入口はカティサークのすぐ横。グリニッジ・マーケットから徒歩5分
- 音がよく響く。楽器を持ち込んで演奏する人がいる
- 対岸のアイランド・ガーデンズからDLRに乗れる。往復せずカナリー・ワーフへ抜ける組み方もできる`,
      },
    ],
  },

  /* =================================================================
   * 9. テンプル教会
   * =================================================================
   * SOURCES
   *   https://www.templechurch.com/
   *   https://en.wikipedia.org/wiki/Temple_Church
   *   https://en.wikipedia.org/wiki/William_Marshal,_1st_Earl_of_Pembroke
   *
   * 公式(2026-09-06)より:
   *   「Open usually from Monday to Friday for public visits」
   *   見学料 £5.00 / £3.00、子どもは無料
   *   第二次大戦後で最大規模の修復事業の最中(目標£6.7m)
   */
  {
    slug: "temple-church",
    name: "テンプル教会",
    engName: "Temple Church",
    tagline: "テンプル騎士団が、エルサレムの聖墳墓教会を写して建てた円形の教会",
    summary:
      "フリート街の裏、法曹院（インズ・オブ・コート）の敷地の中にある教会。1185年、テンプル騎士団がエルサレムの聖墳墓教会にならって円形の身廊を建てた。床には9体の騎士の石像が横たわり、そのうちの一人はマグナ・カルタの交渉にあたったウィリアム・マーシャルである。1941年の空襲で焼け、戦後に復元された。見学は原則として平日のみで、有料。",
    address: "Temple, London EC4Y 7BB, UK",
    lat: 51.5133,
    lng: -0.1107,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/6/67/Temple_Church_1%2C_London%2C_UK_-_Diliff.jpg",
    website: "https://www.templechurch.com/",
    category: "historic",
    recommendLevel: 3,
    isFree: false,
    isForKids: false,
    mustSee: false,
    priceAdult: "£5.00（割引 £3.00）",
    priceChild: "無料",
    durationText: "30分〜45分",
    nearestStation: "Temple 徒歩5分",
    openingHours: "10:00〜16:00頃（日によって変わる。公式の予定表で確認）",
    closedWeekdays: [SAT, SUN],
    closedDaysCheckedAt: CHECKED,
    closedNote:
      "平日でも礼拝・行事・貸切で見学できない日がある。第二次大戦後で最大規模の修復事業のさなかで、見学できる範囲が変わることもある。",
    area: "city",
    stories: [
      {
        kind: "history",
        heading: "マグナ・カルタの交渉は、この建物から始まった",
        body: `**1185年**、この教会は献堂された。建てたのは**テンプル騎士団**——十字軍の時代に生まれた修道騎士の集団である。彼らの英国本部がここに置かれた。

円形の身廊は、エルサレムの**聖墳墓教会**を模したものである。騎士団にとっては、その建物の形を写すこと自体が信仰の表明だった。献堂式にはエルサレム総大主教ヘラクリウスが来英し、ヘンリー2世が列席している。長方形の内陣は1240年に足された。

この場所が英国史に直接関わるのは**1214年から15年**にかけてである。ジョン王はロンドン滞在中の拠点としてテンプルを使い、対立する貴族たちとの交渉がここで行われた。仲介にあたったのが**ウィリアム・マーシャル**、初代ペンブルック伯である。1215年のラニーミードでのマグナ・カルタ調印に至る過程は、この建物の中から始まっている。マーシャルは1219年に死に、この教会の床に葬られた。

騎士団が1312年に解体されたあと、教会はホスピタル騎士団へ移り、やがて敷地を借りていた法律家たちの手に残った。いまも**インナー・テンプルとミドル・テンプル**という2つの法曹院が共同で所有し、維持している。どの教区にも属さない特殊な地位にある教会である。`,
      },
      {
        kind: "context",
        heading: "床の騎士像は、墓ではない",
        body: `円形の身廊の床に、鎖帷子をまとった**9体の石像**が横たわっている。この教会でいちばん写真に撮られるものである。

そして、いちばん誤解されているものでもある。**これは墓ではない**。石像は記念のための彫像であって、その下に遺体があるわけではない。しかも現在の配置は元のものではなく、後世に何度も動かされている。「騎士たちがここに眠っている」という説明は2003年の小説とその映画化以降に一気に広まったが、正確ではない。

石像そのものにも傷がある。**1941年5月10日**の夜——セント・ダンスタン・イン・ザ・イーストが焼けたのと同じ夜である——焼夷弾がこの教会を直撃した。屋根が落ち、円形の身廊は燃え、石像は熱と落下物で大きく損傷した。いま見えているのは、その後に修復されたものである。

戦後の復元では、19世紀に施されていた極彩色の装飾は戻されなかった。代わりに、17世紀に**クリストファー・レン**が作った祭壇背後の衝立が復されている。焼けたことによって、かえって中世に近い姿になった部分がある。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 見学は**土日が休み**。原則として平日のみで、平日も行事と礼拝で閉まる日がある。公式の予定表で確認すること
- 見学料は大人£5.00、割引£3.00、子どもは無料
- 入口が分かりにくい。フリート街から細い門をくぐって法曹院の敷地に入る。表通りには面していない
- 聖歌隊が有名で、演奏会と礼拝の日程は公式に出ている
- 最寄りはテンプル駅。ブラックフライアーズ駅、チャンセリー・レーン駅からも歩ける
- 現在、第二次大戦後で最大規模の修復事業のさなかにある`,
      },
    ],
  },

  /* =================================================================
   * 10. セント・バーソロミュー・ザ・グレート
   * =================================================================
   * SOURCES
   *   https://www.greatstbarts.com/visit/
   *   https://en.wikipedia.org/wiki/St_Bartholomew-the-Great
   *   https://en.wikipedia.org/wiki/St_Bartholomew%27s_Hospital
   *
   * 公式(2026-09-06)より:
   *   「Monday-Saturday 10am-5pm & Sundays between services」
   *   「Free Admission - There is no admission charge for visiting」
   *   ★ かつて有料だったが、現在は無料(寄付制)。古い案内に£6前後と
   *     書かれていることがあるので、そちらを引き写さないこと。
   */
  {
    slug: "st-bartholomew-the-great",
    name: "セント・バーソロミュー・ザ・グレート",
    engName: "St Bartholomew the Great",
    tagline: "いま入れるのは、取り壊された大きな教会の東の端だけ",
    summary:
      "スミスフィールドに建つ1123年創建の教会。建物が現在まで残っている教区教会としてはロンドン最古とされる。宗教改革のときに身廊が丸ごと取り壊されたため、いま入れるのは元の建物の東側だけで、外の墓地と広場は消えた身廊の跡地にあたる。ノルマン様式の重い円柱がそのまま残り、ロンドンでもっとも撮影に使われる教会でもある。入場は無料（寄付制）。",
    address: "West Smithfield, London EC1A 9DS, UK",
    lat: 51.519,
    lng: -0.0999,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/a/a7/St_Bartholomew_the_Great_-_091.jpg",
    website: "https://www.greatstbarts.com/",
    category: "historic",
    recommendLevel: 3,
    isFree: true,
    isForKids: false,
    mustSee: false,
    priceAdult: "無料（寄付制）",
    priceChild: "無料（寄付制）",
    durationText: "30分〜45分",
    nearestStation: "Barbican 徒歩5分",
    openingHours: "月〜土 10:00〜17:00 / 日は礼拝の合間",
    closedWeekdays: [],
    closedDaysCheckedAt: CHECKED,
    closedNote: "礼拝と行事の時間は見学できない。",
    area: "city",
    stories: [
      {
        kind: "history",
        heading: "マラリアで倒れた宮廷人が、見た夢",
        body: `**1123年**、ヘンリー1世の宮廷にいた**ラヒア**という人物が、この場所に修道院と施療院を建てた。

きっかけは病である。ローマへ巡礼に行った彼はマラリアで倒れ、助かったら病院を建てると誓った。回復の途上で聖バルトロマイの幻を見て、スミスフィールドに建てよと告げられた——というのが伝えられている由来である。誓いは果たされ、修道院と病院が同時に生まれた。その病院がセント・バーソロミュー病院で、**900年たったいまも同じ場所で診療を続けている**。

決定的な変化は**1539年**、修道院の解散である。修道院の建物は解体され、教会は教区教会として残ったが、そのとき**身廊が丸ごと取り壊された**。

だから現在の建物は、元の教会の**東側の部分だけ**である。中に入って「奥行きが足りない」と感じるとしたら、それは正しい。失われた身廊は建物の外——いまは墓地と広場になっている場所——へ伸びていた。門から教会の入口まで妙に歩かされるのは、そこが**かつて建物の内側だったから**である。`,
      },
      {
        kind: "context",
        heading: "ツェッペリンの爆弾が、隠れていた家を暴いた",
        body: `入口の門も、それ自体が歴史の層になっている。

スミスフィールド側に立つ**チューダー様式の門**は、下の石造りのアーチが13世紀のもので、これが取り壊された身廊への入口だった。その上に載っている木骨の家は**1595年**に建てられている。

ところがこの木骨は、長いあいだ見えていなかった。後世にタイルと漆喰で覆われ、通りに面したただの古い家として扱われていた。それが露わになったのは**1916年**、第一次大戦のツェッペリン飛行船による空襲で、爆風が表面の覆いを吹き飛ばしたからである。**爆撃が建物の年代を明らかにした**という、あまり他に例のない経緯を持っている。

堂内にも見つけにくいものがある。南側の壁の高い位置に、小さな出窓が突き出している。**ボルトン修道院長の出窓**で、自室にいながら祭壇を見張るために16世紀初めに作られた。窓の下の石には彼の名前が判じ絵になっていて、**樽を射抜く弩の矢**が彫られている。樽は tun、弩の矢は bolt——合わせて Bolton である。

若い**ベンジャミン・フランクリン**が1725年に印刷工として働いていたのも、この教会の一角である。修道院の解散後、聖母礼拝堂が印刷所として貸し出されていた。`,
      },
      {
        kind: "trivia",
        heading: null,
        body: `- 入場は**無料**（寄付制）。かつては見学料を取っていたので、古い案内に£6前後と書かれていることがある
- 月〜土は10:00〜17:00、日曜は礼拝の合間に入れる
- ロンドンでもっとも撮影に使われる教会のひとつ。「フォー・ウェディング」「恋におちたシェイクスピア」ほか多数
- ウィリアム・ホガースは1697年にこの教会で洗礼を受けている
- スミスフィールド市場と、2026年11月開館のロンドン・ミュージアムがすぐ隣。ポストマンズ・パークまでも徒歩7分`,
      },
    ],
  },
];

const APPLY = process.argv.includes("--apply");
const ONLY = process.argv.find((a) => a.startsWith("--slug="))?.slice(7);

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
      select: { id: true, name: true },
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
    spot.stories.forEach((s) =>
      console.log(`    ${s.kind.padEnd(9)} ${s.heading ?? "(既定ラベル)"}  ${s.body.length}字`),
    );

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

if (process.argv[1]?.includes("add-attractions-2026-09-3")) {
  main()
    .catch((e) => {
      console.error(e);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

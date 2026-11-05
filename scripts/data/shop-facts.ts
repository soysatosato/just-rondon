/**
 * 店のページ(/restaurants/<店>)に出す事実。seed-dishes.ts が読み込む。
 *
 * ここに書くのは、公式サイト・公式メニューで確かめたことだけ。
 * 確かめた日を factsCheckedAt に、確かめたページを sources に置く。
 * 公式に書かれていない項目は省く(推測で埋めない)。省いた欄は画面に出ない。
 *
 * 店のページを出すかどうかは lib/restaurants/shop.ts の公開基準で決まる
 * (所在地の座標・入り方・公式価格つきの注文品2品・出典つきの写真・出典・確認日)。
 * ここに載せても基準を満たさなければページは作られない。
 *
 * 座標は所在地の郵便番号から postcodes.io で引いた中心点(2026-11-05)。
 * フォートナム&メイソンの公式住所の郵便番号 W1A 1ER は郵便局の大口用で、
 * 地図にすると別の地区に落ちるので、公式が地図アプリ用に案内している
 * W1J 9LE で引いている。
 *
 * 写真は Commons のもの。カード用の1枚は seed-dishes.ts の commonsFile
 * (Restaurant.image)に置き、ここの photos にはそれ以外(料理・店内など)だけを足す。
 *
 * 価格は seed-menu-picks.ts の officialPrice。予算の例(budgetExamples)は
 * そこにある品の名前を並べるだけで、合計は表示時に計算する。
 */

export type ShopSource = { label: string; url: string };

export type ShopBranchSeed = {
  name: string;
  /** 公式サイトの表記のまま。 */
  address: string;
  postcode?: string;
  lat?: number;
  lng?: number;
  note?: string;
};

export type ShopPhotoSeed = {
  commonsFile: string;
  kind: "food" | "interior" | "exterior";
  /** 何が写っているか。撮影年を添える(内装やメニューは変わるため)。 */
  caption: string;
};

export type ShopFacts = {
  cuisine: string;
  /** markdown。公式で確かめた入り方だけ。 */
  bookingNote: string;
  walkIn?: boolean;
  breakfast?: boolean;
  /** 休みの曜日(0=日〜6=土)。毎日開いている店は []。 */
  closedWeekdays?: number[];
  dressCode?: string;
  serviceChargePercent?: number;
  /** YYYY-MM-DD */
  factsCheckedAt: string;
  sources: ShopSource[];
  budgetExamples?: { label: string; picks: string[] }[];
  branches: ShopBranchSeed[];
  photos?: ShopPhotoSeed[];
};

const CHECKED = "2026-11-05";

export const SHOP_FACTS: Record<string, ShopFacts> = {
  // ── アフタヌーンティー ──
  "the-ritz-afternoon-tea": {
    cuisine: "アフタヌーンティー",
    bookingNote: `- 予約は公式サイトの予約ページか電話で受け付けています
- 時間帯は毎日 **11:30・13:30・15:30・17:30・19:30** の5回です
- 何日前から予約できるかは、公式サイトに書かれていません`,
    closedWeekdays: [],
    dressCode:
      "男性はジャケットとネクタイ。ジーンズとスポーツウェアは男女とも不可(16歳未満は対象外)",
    factsCheckedAt: CHECKED,
    sources: [
      {
        label: "The Ritz London — Afternoon Tea(公式。時間帯・価格)",
        url: "https://www.theritzlondon.com/dine-with-us/afternoon-tea/",
      },
      {
        label: "The Ritz London — よくある質問(公式。服装)",
        url: "https://www.theritzlondon.com/faqs/",
      },
    ],
    budgetExamples: [
      { label: "アフタヌーンティー(大人1人)", picks: ["Traditional Afternoon Tea"] },
      {
        label: "シャンパンを1杯つける",
        picks: ["Traditional Afternoon Tea", "A Glass of Champagne"],
      },
    ],
    branches: [
      {
        name: "ザ・リッツ・ロンドン(パーム・コート)",
        address: "150 Piccadilly, London W1J 9BR",
        postcode: "W1J 9BR",
        lat: 51.507168,
        lng: -0.141399,
      },
    ],
    photos: [
      {
        commonsFile: "File:Ritz Hotel London Palm Court.JPG",
        kind: "interior",
        caption: "アフタヌーンティーを出すパーム・コート(2010年撮影)",
      },
    ],
  },

  "fortnum-and-mason-tea-salon": {
    cuisine: "アフタヌーンティー",
    bookingNote: `- 予約は公式サイトの予約ページから。大人数は電話かメールで受け付けています
- **最後の予約は閉店の2時間前まで**です
- 何日前から予約できるかは、公式サイトに書かれていません`,
    closedWeekdays: [],
    serviceChargePercent: 12.5,
    factsCheckedAt: CHECKED,
    sources: [
      {
        label: "Fortnum & Mason — The Diamond Jubilee Tea Salon(公式。予約・営業日)",
        url: "https://www.fortnumandmason.com/diamond-jubilee-tea-salon",
      },
      {
        label: "Fortnum & Mason — Afternoon Tea(公式。£84からの案内)",
        url: "https://www.fortnumandmason.com/afternoon-tea",
      },
      {
        label: "Classic Afternoon Tea のメニュー(公式PDF、2026年のクリスマスの期間)",
        url: "https://www.fortnumandmason.com/media/fortnums/blogpost/pdf/DJTS_Classic_Afternoon_Tea_Christmas_2026.pdf",
      },
      {
        label: "Savoury Afternoon Tea のメニュー(公式PDF)",
        url: "https://www.fortnumandmason.com/media/fortnums/blogpost/pdf/DJTS_Savoury_Afternoon_Tea_Christmas_2026.pdf",
      },
      {
        label: "High Tea のメニュー(公式PDF)",
        url: "https://www.fortnumandmason.com/media/fortnums/blogpost/pdf/DJTS_High_Tea_Christmas_2026.pdf",
      },
    ],
    budgetExamples: [
      { label: "アフタヌーンティー(1人)", picks: ["Classic Afternoon Tea"] },
      {
        label: "シャンパンを1杯つける",
        picks: ["Classic Afternoon Tea", "A Glass of Blanc de Blancs"],
      },
    ],
    branches: [
      {
        name: "ダイヤモンド・ジュビリー・ティーサロン(本店4階)",
        address:
          "Fourth Floor, Fortnum & Mason, 181 Piccadilly, St. James's, London W1A 1ER",
        postcode: "W1J 9LE",
        lat: 51.508408,
        lng: -0.137947,
      },
    ],
  },

  // ── インドカレー ──
  dishoom: {
    cuisine: "インド料理(ボンベイのカフェ)",
    bookingNote: `- **17時45分までは人数を問わず予約できます。** それ以降は6名以上のときだけ予約できます(マンチェスターとバーミンガムの店は例外)
- 予約できる席は **4か月先まで** 見られます
- **席の大半は予約なしの客のために空けてあります。** 予約がなくても、並べば入れます
- 朝食は平日 8:00〜11:45、週末 9:00〜11:45 です`,
    walkIn: true,
    breakfast: true,
    closedWeekdays: [],
    serviceChargePercent: 12.5,
    factsCheckedAt: CHECKED,
    sources: [
      {
        label: "Dishoom — よくある質問(公式。予約の条件)",
        url: "https://www.dishoom.com/frequently-asked-questions-faq/",
      },
      {
        label: "Dishoom — 店舗の一覧(公式)",
        url: "https://www.dishoom.com/locations/",
      },
      {
        label: "Dishoom — All Day のメニュー(公式)",
        url: "https://www.dishoom.com/menu/all-day-main/",
      },
      {
        label: "Dishoom — Breakfast のメニュー(公式。朝食の時間)",
        url: "https://www.dishoom.com/menu/breakfast/",
      },
    ],
    budgetExamples: [
      { label: "朝食(1人)", picks: ["Bacon Naan Roll", "House Chai"] },
      { label: "昼・夜(1人)", picks: ["Chicken Ruby", "House Chai"] },
    ],
    branches: [
      {
        name: "コヴェント・ガーデン店",
        address: "12 Upper St. Martin's Lane, London, WC2H 9FB",
        postcode: "WC2H 9FB",
        lat: 51.512539,
        lng: -0.126897,
      },
      {
        name: "カーナビー店",
        address: "22 Kingly Street, London, W1B 5QP",
        postcode: "W1B 5QP",
        lat: 51.513039,
        lng: -0.139646,
      },
      {
        name: "キングス・クロス店",
        address: "5 Stable Street, London, N1C 4AB",
        postcode: "N1C 4AB",
        lat: 51.536498,
        lng: -0.125322,
      },
      {
        name: "ショーディッチ店",
        address: "7 Boundary Street, London, E2 7JE",
        postcode: "E2 7JE",
        lat: 51.525878,
        lng: -0.076469,
      },
      {
        name: "ケンジントン店",
        address: "4 Derry Street, London, W8 5SE",
        postcode: "W8 5SE",
        lat: 51.501578,
        lng: -0.191091,
      },
      {
        name: "ボロー店",
        // 公式の一覧に郵便番号が無いので、地図には置かない。
        address: "The Hop Exchange, 11–13 Park Street, London",
      },
      {
        name: "バタシー店",
        address: "42 Electric Boulevard, London, SW11 8BJ",
        postcode: "SW11 8BJ",
        lat: 51.480402,
        lng: -0.14459,
      },
      {
        name: "カナリー・ワーフ店",
        address: "13 Water Street, London, E14 5GX",
        postcode: "E14 5GX",
        lat: 51.502783,
        lng: -0.014907,
      },
    ],
    photos: [
      {
        commonsFile: "File:Dishoom breakfast.jpg",
        kind: "food",
        caption: "朝食の皿(2014年撮影)",
      },
    ],
  },

  // ── 「絶対行くべき店」だけに出る店 ──
  "the-devonshire": {
    cuisine: "パブとグリル(イギリス料理)",
    bookingNote: `- **1階のパブは予約を受けていません。** 先着順です
- **屋上テラスも予約なしの客専用です**
- 2〜3階の食堂は予約制で、**毎週木曜の10時30分に、3週間先までの分が開きます**
- キャンセル待ちの受付はしていません
- 子どもは、平日の17時以降と週末はパブに入れません

木曜10時30分はロンドン時間です。日本時間では、英国が夏時間の時期は18時30分、冬時間の時期は19時30分になります。`,
    walkIn: true,
    breakfast: false,
    closedWeekdays: [],
    dressCode: "なし(公式のよくある質問)",
    serviceChargePercent: 12.5,
    factsCheckedAt: CHECKED,
    sources: [
      {
        label: "The Devonshire(公式。予約・ウォークイン・服装)",
        url: "https://www.devonshiresoho.co.uk/",
      },
      {
        label: "The Devonshire — 食堂のメニュー(公式PDF)",
        url: "https://www.devonshiresoho.co.uk/menus/restaurant-menu.pdf",
      },
      {
        label: "The Devonshire — バーのメニュー(公式PDF)",
        url: "https://www.devonshiresoho.co.uk/menus/bar-menu.pdf",
      },
      {
        label: "Estrella Damm Top 50 Gastropubs 2026 — The Devonshire が1位(Morning Advertiser)",
        url: "https://www.morningadvertiser.co.uk/Article/2026/01/27/devonshire-in-soho-named-no1-on-2026-estrella-damm-top-50-gastropubs-list/",
      },
    ],
    budgetExamples: [
      { label: "1階のパブで軽く", picks: ["Steak Sandwich", "Sausage Roll"] },
      {
        label: "食堂で1皿",
        picks: ["Beef Cheek and Guinness Suet Pudding"],
      },
    ],
    branches: [
      {
        name: "ザ・デヴォンシャー",
        address: "17 Denman St, Soho, London W1D 7HW",
        postcode: "W1D 7HW",
        lat: 51.510668,
        lng: -0.135304,
      },
    ],
  },

  padella: {
    cuisine: "パスタ(イタリア料理)",
    bookingNote: `### ボロー・マーケット店
- **予約は受けていません。** 店頭のQRコードか、Dojo というアプリで仮想の行列に並びます
- 昼は11時から(11時30分以降の席)。アプリからの遠隔登録は11時45分から
- 夜は16時30分から(17時以降の席)。アプリからの遠隔登録は17時15分から
- 1組6名まで

### ソーホー店・ショーディッチ店
- **4週間前から予約できます**
- 予約がなくても、**店から2km以内ならスマホで遠隔で並べます**
- 7名以上は3品のセットメニューになります`,
    walkIn: true,
    closedWeekdays: [],
    factsCheckedAt: CHECKED,
    sources: [
      {
        label: "Padella Borough Market(公式。仮想の行列・メニュー)",
        url: "https://www.padella.co/borough-market/",
      },
      {
        label: "Padella Soho(公式。予約・遠隔の行列)",
        url: "https://www.padella.co/soho/",
      },
      {
        label: "Padella Shoreditch(公式)",
        url: "https://www.padella.co/shoreditch/",
      },
    ],
    budgetExamples: [
      { label: "ボロー・マーケット店で1人1皿", picks: ["Pici cacio & pepe"] },
      {
        label: "2人で2皿を分ける(1人あたりは半分)",
        picks: [
          "Pici cacio & pepe",
          "Pappardelle with 8 hours Hereford beef shin ragu",
        ],
      },
    ],
    branches: [
      {
        name: "ボロー・マーケット店",
        address: "6 Southwark St, London, SE1 1TQ",
        postcode: "SE1 1TQ",
        lat: 51.505127,
        lng: -0.089938,
        note: "予約不可。仮想の行列に並ぶ",
      },
      {
        name: "ソーホー店",
        address: "2 Kingly St, London, W1B 5PB",
        postcode: "W1B 5PB",
        lat: 51.512203,
        lng: -0.138556,
        note: "4週間前から予約可",
      },
      {
        name: "ショーディッチ店",
        address: "1 Phipp Street, London, EC2A 4PS",
        postcode: "EC2A 4PS",
        lat: 51.523557,
        lng: -0.081915,
        note: "4週間前から予約可",
      },
    ],
  },

  "st-john-smithfield": {
    cuisine: "イギリス料理",
    bookingNote: `- 予約は公式サイトから。1〜20名で時間を選べます
- 昼は月〜土 12:00〜15:00、日曜 12:00〜16:00。夜は月〜土 18:00〜22:30
- **日曜の夜は休み**です
- メニューは毎日変わり、昼の分は11時、夜の分は17時に公式サイトに出ます`,
    breakfast: false,
    closedWeekdays: [],
    serviceChargePercent: 12.5,
    factsCheckedAt: CHECKED,
    sources: [
      {
        label: "St. JOHN Smithfield(公式。営業・サービス料)",
        url: "https://stjohnrestaurant.com/a/restaurants/smithfield",
      },
      {
        label: "St. JOHN Smithfield — 昼のメニュー(公式。2026年11月4日の分)",
        url: "https://stjohnrestaurant.com/a/menus/1",
      },
      {
        label: "St. JOHN — 予約(公式)",
        url: "https://stjohnrestaurant.com/pages/reservations",
      },
    ],
    budgetExamples: [
      {
        label: "名物とデザート(1人)",
        picks: [
          "Roast Bone Marrow and Parsley Salad",
          "Eccles Cake and Lancashire Cheese",
        ],
      },
    ],
    branches: [
      {
        name: "セント・ジョン(スミスフィールド)",
        address: "26 St. John Street, London, EC1M 4AY",
        postcode: "EC1M 4AY",
        lat: 51.520322,
        lng: -0.101425,
      },
    ],
    photos: [
      {
        commonsFile: "File:St John Restaurant, Smithfield, London (4409854983).jpg",
        kind: "food",
        caption: "店の料理(2010年撮影。メニューは毎日変わる)",
      },
    ],
  },

  "simpsons-in-the-strand": {
    cuisine: "イギリス料理(ローストビーフ)",
    bookingNote: `- 予約は公式サイト(大広間グランド・ディヴァンと、上階のロマーノズ)、電話、メールで受け付けています
- **シンプソンズ・バーは予約を受けていません**
- 1卓は6名までです
- 取り消しは24時間前まで。それを過ぎると、グランド・ディヴァンは1人あたり朝食£25・昼と夜£40の取消料がかかります
- 朝食は平日 7:00〜11:00、週末 8:00〜11:00(最終注文)`,
    walkIn: true,
    breakfast: true,
    closedWeekdays: [],
    dressCode: "決まりはないが、きちんとした服装を勧めている(公式)",
    serviceChargePercent: 15,
    factsCheckedAt: CHECKED,
    sources: [
      {
        label: "Simpson's in the Strand — 予約(公式。バーは予約不可・朝食の時間)",
        url: "https://www.simpsonsinthestrand.co.uk/reservations/",
      },
      {
        label: "Simpson's in the Strand — Visit us(公式。服装・サービス料・取消料)",
        url: "https://www.simpsonsinthestrand.co.uk/visit-us/",
      },
      {
        label: "Grand Divan のメニュー(公式PDF、2026年8月版)",
        url: "https://www.simpsonsinthestrand.co.uk/wp-content/uploads/2026/09/00362_Simpsons_Grand_Divan_MAIN_Menu_AUGUST_2026.pdf",
      },
      {
        label: "Grand Divan の朝食メニュー(公式PDF、2026年8月版)",
        url: "https://www.simpsonsinthestrand.co.uk/wp-content/uploads/2026/09/00362_Simpsons_Grand_Divan_BREAKFAST_Menu_A5_4pp_AUGUST_2026.pdf",
      },
    ],
    budgetExamples: [
      { label: "ローストビーフ(1人)", picks: ["Roast Rib of Devonshire Beef"] },
      {
        label: "朝食(1人)",
        picks: ["The English Gambit", "English Breakfast tea"],
      },
    ],
    branches: [
      {
        name: "シンプソンズ・イン・ザ・ストランド",
        address: "100 Strand, London WC2R 0EZ",
        postcode: "WC2R 0EZ",
        lat: 51.510342,
        lng: -0.121079,
      },
    ],
    photos: [
      {
        commonsFile: "File:Simpson's-in-the-Strand 2023-12-04.jpg",
        kind: "exterior",
        caption: "ストランドに面した入口(2023年撮影。再開前)",
      },
    ],
  },
};

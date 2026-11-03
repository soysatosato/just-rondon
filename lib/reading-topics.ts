/**
 * 読み物のテーマと、記事から先へ進むサイト内のページ。手で選んだ対応表。
 *
 * 2つの使い道がある。
 *
 *   1. 読み物トップ(/reading)の「テーマで読む」。コラム・イギリス英語・
 *      英国のいま・通史を、セクションではなく話題で束ねる。ロンドン塔の
 *      話を読んだ人が次に読みたいのは「次の日のコラム」ではなく
 *      「ロンドン塔のほかの話」なので、入口を話題の側にも作る。
 *   2. 記事末尾の「関連する読み物」の選び方(lib/reading-related.ts)で、
 *      同じテーマの記事を強く足す。文字の重なりだけで選ぶと、
 *      「1952年」が同じだけの記事が並ぶ。
 *
 * READING_LINKS は記事から観光以外のページ(ブランド・料理・おみやげ・
 * 美術館・実用ガイド・通史の章)への導線。観光スポットは DB の
 * ContentAttraction が持っていて、ここには書かない(二重に出る)。
 *
 * 載せる基準は ContentAttraction と同じ: その記事の主題がそのページの
 * 対象そのものであるときだけ。名前が出てくるだけ・目印として出てくるだけの
 * ページは載せない。新しい記事は DB にだけ入るので、ここに無い記事は
 * テーマ無し・導線無しで描かれ、関連する読み物は文字の重なりだけで選ばれる。
 *
 * パスはすべて実在するページ。scripts/check-reading-links.ts で
 * ビルド結果と照らし合わせて確かめる。
 */

export type ReadingTheme = {
  key: string;
  label: string;
  blurb: string;
  /** 記事のパス(/column/<slug> など)。並びは読む順のおすすめ。 */
  members: readonly string[];
  /** そのテーマの実用ページ。テーマの束の下に出す。 */
  guides: readonly { href: string; label: string }[];
};

export type ReadingLinkKind =
  | "guide"
  | "museum"
  | "brand"
  | "food"
  | "souvenir"
  | "area"
  | "event"
  | "history";

export const READING_LINK_KIND_LABEL: Record<ReadingLinkKind, string> = {
  guide: "ガイド",
  museum: "美術館・博物館",
  brand: "ブランド",
  food: "料理と店",
  souvenir: "おみやげ",
  area: "エリア",
  event: "行事",
  history: "通史",
};

export type ReadingLink = {
  kind: ReadingLinkKind;
  href: string;
  label: string;
};

export const READING_THEMES: readonly ReadingTheme[] = [
  {
    key: "tower-and-crown",
    label: "ロンドン塔と王室のしきたり",
    blurb: "鍵の儀式、ワタリガラス、白鳥の調査、郵便ポストの刻印。王室にまつわる決まりごとの、たいてい意外に新しい起源。",
    members: [
      "/column/why-not-even-a-nazi-bomb-could-stop-the-tower-of-londons-ceremony-of-the-keys",
      "/column/the-tower-of-london-s-ravens-arrived-in-1883-and-the-prophecy-was-invented-in-1944",
      "/column/why-swans-on-the-thames-are-still-counted-as-the-king-s-property-inside-800-years-of-swan-upping",
      "/column/why-british-postboxes-change-their-letters-with-every-monarch-and-the-one-that-got-blown-up",
      "/column/the-royal-warrant-is-not-a-medal-but-a-five-year-contract-how-cadbury-lost-170-years-in-a-letter-that-gave-no-reason",
      "/column/god-save-the-king-the-national-anthem-no-law-ever-adopted",
      "/column/the-beatles-mbes-in-1965-and-the-medals-sent-back-to-the-palace",
      "/column/the-bank-picquet-193-years-of-soldiers-marching-to-guard-a-bank-that-was-never-robbed-again",
      "/column/the-quit-rents-ceremony-paying-eight-centuries-of-rent-on-land-nobody-can-find",
      "/column/the-trial-where-the-defendant-is-a-coin-744-years-of-the-trial-of-the-pyx-and-the-verdict-isaac-newton-refused-to-accept",
      "/history/norman-conquest",
      "/history/tudors",
    ],
    guides: [
      { href: "/sightseeing/tower-of-london", label: "ロンドン塔の見どころと料金" },
      { href: "/sightseeing/royal-london", label: "王室ゆかりのロンドン" },
    ],
  },
  {
    key: "parliament-and-law",
    label: "議会と法律の不思議",
    blurb: "国王を締め出す議会、辞職できない議員、20年で生まれる日照の権利。いまも動いている古い決まりの話。",
    members: [
      "/column/the-door-slammed-in-the-king-s-face-how-one-day-in-1642-still-choreographs-british-parliament",
      "/column/a-man-once-duly-chosen-cannot-relinquish-why-british-mps-still-resign-by-becoming-a-medieval-bailiff",
      "/column/the-grocer-who-voted-ignatius-sancho-the-westminster-poll-books-and-a-ballot-we-can-still-read-246-years-later",
      "/column/the-ancient-lights-signs-on-london-walls-and-the-20-year-rule-that-still-shapes-the-skyline",
      "/column/speakers-corner-was-never-a-place-where-anything-goes-the-hyde-park-crowds-who-won-rules-not-rights",
      "/column/guy-fawkes-night-and-the-1606-act",
      "/column/when-parliament-abolished-christmas-in-1647",
      "/column/when-the-british-government-owned-the-pubs-57-years-of-nationalised-beer-and-the-law-that-made-buying-a-round-a-crime",
      "/column/will-the-cows-give-their-milk-earlier-because-of-mr-willett-the-eight-years-parliament-laughed-at-william-willett-and-the-twenty-one-days-after-germany-that-made-it-law",
      "/modern-britain/burnham-s-election-bill-adds-bank-cards-to-voter-id-as-the-lords-take-it-up",
      "/modern-britain/londoners-want-sadiq-khan-to-step-down-but-he-might-run-anyway",
      "/modern-britain/reform-s-jenrick-blames-migration-for-the-french-riots-as-britain-s-budget-looms",
      "/modern-britain/uk-supreme-court-hears-the-palestine-action-ban-after-325-arrests-at-the-us-embassy",
      "/history/civil-war",
      "/history/modern-britain",
    ],
    guides: [
      { href: "/sightseeing/houses-of-parliament-self-guided-audio-tour", label: "国会議事堂の見学" },
    ],
  },
  {
    key: "thames",
    label: "テムズ川と橋",
    blurb: "下水道の上の遊歩道、砂漠に売られたロンドン橋、300年続くボートレース。川から見たロンドンの歴史。",
    members: [
      "/column/the-pleasant-riverside-walk-that-is-actually-the-roof-of-a-sewer",
      "/column/london-bridge-was-sold-to-the-arizona-desert-in-1968-did-the-buyer-really-think-it-was-tower-bridge",
      "/column/doggett-s-coat-and-badge-the-world-s-oldest-boat-race-and-the-vanished-trade-that-still-rows-it",
      "/column/why-swans-on-the-thames-are-still-counted-as-the-king-s-property-inside-800-years-of-swan-upping",
      "/column/the-white-posts-that-ring-london-how-a-tax-nobody-paid-at-the-post-built-the-embankment",
      "/column/the-lion-that-never-weathered-eleanor-coade-and-the-stone-she-baked-in-a-kiln",
      "/column/why-britain-drives-on-the-left",
      "/history/roman-britain",
      "/history/industrial-revolution",
    ],
    guides: [
      { href: "/sightseeing/thames-cruise", label: "テムズ川クルーズの選び方" },
      { href: "/sightseeing/london-tower-bridge", label: "タワーブリッジ" },
    ],
  },
  {
    key: "transport",
    label: "地下鉄・タクシー・交通",
    blurb: "蒸気で始まった地下鉄、失業中の製図工が描いた路線図、4年かけて道を覚えるタクシー運転手。",
    members: [
      "/column/london-underground-story-1-steam-1863",
      "/column/london-underground-story-2-first-electric-tube-1890",
      "/column/london-underground-story-3-yerkes-and-pick",
      "/column/london-underground-story-4-bethnal-green-1943",
      "/column/the-tube-map-was-drawn-by-an-unemployed-draughtsman-ten-guineas-and-ten-years-before-his-name-was-printed-on-it",
      "/column/the-last-station-that-still-says-mind-the-gap-in-oswald-laurence-s-voice-a-widow-at-embankment-and-the-tape-london-underground-went-looking-for",
      "/column/the-knowledge-why-london-cabbies-spend-four-years-memorising-the-city",
      "/column/no-bigger-than-a-horse-and-cart-how-thirteen-green-huts-survived-150-years-on-london-s-roads",
      "/column/why-britain-drives-on-the-left",
      "/column/the-london-necropolis-railway-87-years-of-first-second-and-third-class-coffins",
      "/modern-britain/angel-station-escalators",
      "/modern-britain/tube-inspector-disciplined",
      "/modern-britain/one-day-of-training-a-lifetime-on-the-road-london-l-plate-delivery-riders",
    ],
    guides: [
      { href: "/sightseeing/transport/tube", label: "地下鉄の乗り方" },
      { href: "/sightseeing/transport/taxi", label: "タクシーとUber" },
      { href: "/museums/london-transport-museum", label: "ロンドン交通博物館" },
    ],
  },
  {
    key: "street-furniture",
    label: "街角にあるもの",
    blurb: "赤い電話ボックス、郵便ポスト、青い銘板、白い鉄柱、緑の小屋。見慣れた街角の物ひとつずつの来歴。",
    members: [
      "/column/london-s-red-telephone-box-was-born-from-a-tomb",
      "/column/why-british-postboxes-change-their-letters-with-every-monarch-and-the-one-that-got-blown-up",
      "/column/the-blue-plaque-and-the-three-in-four-it-turns-away",
      "/column/the-white-posts-that-ring-london-how-a-tax-nobody-paid-at-the-post-built-the-embankment",
      "/column/no-bigger-than-a-horse-and-cart-how-thirteen-green-huts-survived-150-years-on-london-s-roads",
      "/column/the-lion-that-never-weathered-eleanor-coade-and-the-stone-she-baked-in-a-kiln",
      "/column/the-tree-that-sheds-its-soot-why-the-london-plane-alone-survived-the-air-of-the-industrial-revolution",
      "/column/the-ancient-lights-signs-on-london-walls-and-the-20-year-rule-that-still-shapes-the-skyline",
      "/column/britain-never-put-its-name-on-the-penny-black-in-1840-and-in-1874-the-world-let-it-stay-that-way",
    ],
    guides: [
      { href: "/sightseeing/blue-plaques", label: "ブルー・プラークを歩く" },
      { href: "/museums/postal-museum", label: "郵便博物館" },
    ],
  },
  {
    key: "fire-and-health",
    label: "大火・疫病・スモッグ",
    blurb: "1666年の大火、コレラの井戸ポンプ、1952年のスモッグ、NHSの誕生。災害と公衆衛生がロンドンを作り直した話。",
    members: [
      "/column/a-woman-might-piss-it-out-the-five-days-that-burned-london-the-great-fire-story-part-1",
      "/column/the-man-everyone-knew-was-innocent-robert-hubert-and-the-lie-carved-into-london-for-150-years-the-great-fire-story-part-2",
      "/column/the-court-built-only-to-decide-who-pays-for-a-burnt-house-insurance-fire-brigades-and-the-rules-that-rebuilt-london-the-great-fire-story-part-3-final",
      "/column/john-snow-and-the-broad-street-pump-1854",
      "/column/great-smog-of-london-1952",
      "/column/the-pleasant-riverside-walk-that-is-actually-the-roof-of-a-sewer",
      "/column/london-underground-story-4-bethnal-green-1943",
      "/column/999-the-worlds-first-emergency-number-london-1937",
      "/column/the-nhs-story-1-the-beveridge-report-1942",
      "/column/the-nhs-story-2-the-appointed-day-5-july-1948",
      "/column/the-nhs-story-3-teeth-spectacles-and-bevan-s-resignation-1951",
      "/column/the-nhs-story-4-overseas-visitors-and-the-nhs",
      "/column/marmite-cured-bombay-s-anaemic-mothers-in-1931-how-folic-acid-was-found-in-a-jar-of-brown-paste",
      "/modern-britain/cabinet-office-s-be-ready-campaign-asks-every-household-for-three-days-of-supplies",
      "/history/postwar",
    ],
    guides: [
      { href: "/sightseeing/monument-to-the-great-fire-of-london", label: "ロンドン大火記念塔" },
      { href: "/health/gp-registration", label: "GP(かかりつけ医)の登録" },
    ],
  },
  {
    key: "food-and-tea",
    label: "紅茶・パブ・食べもの",
    blurb: "配給されなかったフィッシュ&チップス、ミルクの先か後か、国営パブ、アールグレイの由来。",
    members: [
      "/column/fish-and-chips-was-never-rationed-what-the-1942-hansard-actually-says",
      "/column/milk-in-first-or-tea-in-first-the-six-page-british-standard-that-won-an-ig-nobel-prize",
      "/column/where-the-name-earl-grey-tea-came-from",
      "/column/the-earl-of-sandwich-and-the-gaming-table-story",
      "/column/marmite-cured-bombay-s-anaemic-mothers-in-1931-how-folic-acid-was-found-in-a-jar-of-brown-paste",
      "/column/when-the-british-government-owned-the-pubs-57-years-of-nationalised-beer-and-the-law-that-made-buying-a-round-a-crime",
      "/column/fortnum-and-mason-began-in-1707-with-the-queen-s-leftover-candles-the-london-department-store-story-part-4-final",
      "/column/parliament-cut-the-price-of-tea-to-save-a-bankrupt-company-seven-months-later-it-was-floating-in-boston-harbour-the-east-india-company-story-part-2",
      "/british-english/tea",
      "/british-english/pudding",
      "/british-english/easy-peelers",
      "/british-english/cheers",
      "/modern-britain/nitrite-free-bacon-eu-food-deal",
      "/modern-britain/healey-raises-alcohol-duty-and-widens-pub-business-rates-relief",
    ],
    guides: [
      { href: "/restaurants/fish-and-chips", label: "フィッシュ&チップスの店" },
      { href: "/restaurants/afternoon-tea", label: "アフタヌーンティーの店" },
      { href: "/restaurants/pub-etiquette", label: "パブの頼み方" },
    ],
  },
  {
    key: "shops-and-brands",
    label: "百貨店とブランド",
    blurb: "ハロッズ、セルフリッジズ、リバティ、フォートナム&メイソン、ヴィヴィアン・ウエストウッド。店の始まりと、王室御用達の仕組み。",
    members: [
      "/column/the-founder-of-harrods-was-convicted-over-stolen-currants-in-1836-the-london-department-store-story-part-1",
      "/column/selfridges-put-the-channel-crossing-aeroplane-on-show-in-1909-the-london-department-store-story-part-2",
      "/column/liberty-london-began-in-1875-selling-goods-from-japan-the-store-built-from-two-warships-the-london-department-store-story-part-3",
      "/column/fortnum-and-mason-began-in-1707-with-the-queen-s-leftover-candles-the-london-department-store-story-part-4-final",
      "/column/the-royal-warrant-is-not-a-medal-but-a-five-year-contract-how-cadbury-lost-170-years-in-a-letter-that-gave-no-reason",
      "/column/the-primary-school-teacher-who-sewed-punk-s-uniform-nine-years-at-430-king-s-road-the-vivienne-westwood-story-part-1",
      "/column/she-dug-up-the-clothes-feminism-hated-the-punk-who-haunted-the-wallace-collection-the-vivienne-westwood-story-part-2",
      "/column/the-dame-who-rode-a-tank-from-the-palace-twirl-to-a-quiet-house-in-clapham-the-vivienne-westwood-story-part-3-final",
      "/modern-britain/poundland-files-to-appoint-administrators-as-rivals-circle-its-stores",
    ],
    guides: [
      { href: "/brands", label: "英国ブランド" },
      { href: "/souvenirs", label: "おみやげ" },
    ],
  },
  {
    key: "books-and-stage",
    label: "本・物語・劇場",
    blurb: "ベーカー街221B、プーさんのクマ、ペンギン・ブックス、『ねずみとり』、グローブ座。物語が生まれた場所と事情。",
    members: [
      "/column/the-address-that-did-not-exist-seventy-years-of-the-secretary-to-sherlock-holmes-at-221b-baker-street",
      "/column/winnie-the-pooh-was-named-after-a-real-bear-at-london-zoo-the-cub-a-canadian-army-vet-bought-at-a-station-for-20-in-1914",
      "/column/how-penguin-books-began-in-1935-the-sixpenny-paperback-that-booksellers-refused-and-orwell-wanted-suppressed",
      "/column/the-oxford-english-dictionary-s-greatest-contributor-was-a-murderer-12-000-slips-from-broadmoor-asylum",
      "/column/beatrix-potter-studied-fungi-the-1897-linnean-society-paper",
      "/column/the-guinness-book-of-records-began-with-a-1951-argument-about-europe-s-fastest-game-bird-a-question-the-book-never-answered",
      "/column/the-mousetrap-since-1952-christie-gave-it-eight-months-and-gave-the-rights-to-her-grandson",
      "/column/the-globe-s-timbers-were-carried-off-in-1598-while-the-landlord-was-away-twelve-men-with-swords-and-axes-the-globe-theatre-story-part-1",
      "/column/the-globe-burned-down-in-1613-from-a-stage-cannon-the-man-who-put-out-his-breeches-with-bottle-ale-and-the-ban-on-plays-the-globe-theatre-story-part-2",
      "/column/the-demolished-globe-vanished-under-a-brewery-the-1909-plaque-and-the-scholar-who-said-it-was-on-the-wrong-side-of-the-street-the-globe-theatre-story-part-3",
      "/column/rebuilding-the-globe-began-with-a-blackened-plaque-in-1949-the-real-theatre-turned-up-under-a-car-park-mid-construction-the-globe-theatre-story-part-4-final",
    ],
    guides: [
      { href: "/musicals/first-time-theatre", label: "はじめての観劇" },
      { href: "/museums/sherlock-holmes-museum", label: "シャーロック・ホームズ博物館" },
    ],
  },
  {
    key: "music-and-fashion",
    label: "ビートルズとパンク",
    blurb: "デッカのオーディション、MBE勲章、アビー・ロードの10分、屋上ライブ。キングス・ロードの店から始まったパンク。",
    members: [
      "/column/the-beatles-failed-their-decca-audition-on-new-year-s-day-1962",
      "/column/the-beatles-mbes-in-1965-and-the-medals-sent-back-to-the-palace",
      "/column/ten-minutes-on-the-abbey-road-zebra-crossing-in-august-1969",
      "/column/the-beatles-last-live-show-on-the-roof-of-3-savile-row-in-1969",
      "/column/the-primary-school-teacher-who-sewed-punk-s-uniform-nine-years-at-430-king-s-road-the-vivienne-westwood-story-part-1",
      "/column/she-dug-up-the-clothes-feminism-hated-the-punk-who-haunted-the-wallace-collection-the-vivienne-westwood-story-part-2",
      "/column/the-dame-who-rode-a-tank-from-the-palace-twirl-to-a-quiet-house-in-clapham-the-vivienne-westwood-story-part-3-final",
    ],
    guides: [
      { href: "/sightseeing/abbey-road-beatles", label: "アビー・ロードの横断歩道" },
    ],
  },
  {
    key: "sport",
    label: "スポーツの起源",
    blurb: "芝ローラーの修理代で始まったウィンブルドン、ウィンザー城で決まった42.195km、マンチェスターの2クラブ。",
    members: [
      "/column/wimbledon-began-in-1877-to-pay-for-a-broken-pony-roller-the-first-champion-later-called-lawn-tennis-monotonous",
      "/column/why-the-marathon-is-42-195-km-the-1908-windsor-start-and-the-royal-myth-that-never-was",
      "/column/manchester-united-was-a-railway-works-team-the-lost-st-bernard-that-saved-it-from-bankruptcy-in-1902-the-two-clubs-of-manchester-part-1",
      "/column/did-a-rector-s-daughter-found-manchester-city-the-1880-church-club-built-to-stop-the-scuttlers-the-two-clubs-of-manchester-part-2",
      "/column/doggett-s-coat-and-badge-the-world-s-oldest-boat-race-and-the-vanished-trade-that-still-rows-it",
      "/modern-britain/why-english-football-still-blacks-out-saturday-3pm",
      "/modern-britain/uae-warns-uk-over-investment-as-manchester-city-await-sanctions",
    ],
    guides: [
      { href: "/sightseeing/football", label: "ロンドンでサッカーを観る" },
      { href: "/museums/wimbledon-lawn-tennis-museum", label: "ウィンブルドン・ローンテニス博物館" },
    ],
  },
  {
    key: "museums",
    label: "大英博物館と収蔵品",
    blurb: "宝くじで生まれた博物館、戦利品のロゼッタ・ストーン、議会が買ったエルギン・マーブル、2023年の盗難。",
    members: [
      "/column/not-twenty-thousand-pounds-in-the-treasury-the-rigged-lottery-that-founded-the-british-museum-in-1753-the-british-museum-story-part-1",
      "/column/captured-in-egypt-by-the-british-army-in-1801-how-the-rosetta-stone-became-a-prize-of-war-the-british-museum-story-part-2",
      "/column/the-nation-bought-the-parthenon-marbles-for-35-000-pounds-in-1816-while-lord-elgin-had-spent-74-240-the-british-museum-story-part-3",
      "/column/found-on-ebay-the-british-museum-thefts-of-2023-and-the-warning-it-answered-with-all-accounted-for-the-british-museum-story-part-4",
      "/column/a-salisbury-man-ought-to-buy-it-the-1915-auction-of-stonehenge-and-the-three-years-one-man-owned-it",
      "/modern-britain/v-and-a-voluntary-exit-scheme-while-museums-stay-free",
    ],
    guides: [
      { href: "/museums/british-museum", label: "大英博物館の回り方" },
    ],
  },
  {
    key: "empire",
    label: "帝国と世界",
    blurb: "東インド会社の274年、ボストン茶会事件の茶、泰緬鉄道の枕木、1910年の日英博覧会。",
    members: [
      "/column/the-company-that-met-in-a-tavern-lemon-juice-pepper-and-the-right-to-make-war-the-east-india-company-story-part-1",
      "/column/parliament-cut-the-price-of-tea-to-save-a-bankrupt-company-seven-months-later-it-was-floating-in-boston-harbour-the-east-india-company-story-part-2",
      "/column/nobody-was-punished-and-the-shareholders-were-paid-198-pounds-in-cash-for-every-100-the-east-india-company-quietly-died-on-1-june-1874-the-east-india-company-story-part-3",
      "/column/captured-in-egypt-by-the-british-army-in-1801-how-the-rosetta-stone-became-a-prize-of-war-the-british-museum-story-part-2",
      "/column/the-nation-bought-the-parthenon-marbles-for-35-000-pounds-in-1816-while-lord-elgin-had-spent-74-240-the-british-museum-story-part-3",
      "/column/two-pieces-of-teak-in-a-glass-case-on-trafalgar-square-what-london-celebrated-on-15-august-1945",
      "/column/the-grocer-who-voted-ignatius-sancho-the-westminster-poll-books-and-a-ballot-we-can-still-read-246-years-later",
      "/column/japan-matsuri-and-the-1910-japan-british-exhibition",
      "/column/liberty-london-began-in-1875-selling-goods-from-japan-the-store-built-from-two-warships-the-london-department-store-story-part-3",
      "/column/marmite-cured-bombay-s-anaemic-mothers-in-1931-how-folic-acid-was-found-in-a-jar-of-brown-paste",
      "/history/union-and-empire",
      "/history/world-wars",
    ],
    guides: [
    ],
  },
  {
    key: "time-and-greenwich",
    label: "時間とグリニッジ",
    blurb: "102メートルずれた本初子午線、時刻を売り歩いた親子、サマータイムの発明者、硬貨1枚で合わせるビッグベン。",
    members: [
      "/column/the-102-metres-between-greenwich-and-zero-why-the-prime-meridian-moved-and-why-nobody-moves-it-back",
      "/column/the-woman-who-sold-time-104-years-of-carrying-a-single-pocket-watch-across-london",
      "/column/will-the-cows-give-their-milk-earlier-because-of-mr-willett-the-eight-years-parliament-laughed-at-william-willett-and-the-twenty-one-days-after-germany-that-made-it-law",
      "/column/why-a-single-old-penny-keeps-big-ben-on-time",
      "/column/big-ben-cracked-in-1859-and-still-rings-with-the-crack",
      "/column/the-scientist-who-injected-a-dog-with-opium-later-redesigned-london-s-skyline-the-christopher-wren-story-part-1",
    ],
    guides: [
      { href: "/sightseeing/areas/greenwich", label: "グリニッジを歩く" },
      { href: "/museums/royal-observatory-greenwich", label: "グリニッジ天文台" },
    ],
  },
  {
    key: "wren-and-buildings",
    label: "建築と教会",
    blurb: "天文学者だったレン、ウェディングケーキの尖塔、二重のドーム、焼いた石のライオン、墓を真似た電話ボックス。",
    members: [
      "/column/the-scientist-who-injected-a-dog-with-opium-later-redesigned-london-s-skyline-the-christopher-wren-story-part-1",
      "/column/how-a-london-church-steeple-gave-the-wedding-cake-its-shape-the-christopher-wren-story-part-2",
      "/column/a-dome-hidden-inside-the-dome-the-35-year-secret-of-st-paul-s-cathedral-the-christopher-wren-story-part-3-final",
      "/column/london-s-red-telephone-box-was-born-from-a-tomb",
      "/column/the-lion-that-never-weathered-eleanor-coade-and-the-stone-she-baked-in-a-kiln",
      "/column/big-ben-cracked-in-1859-and-still-rings-with-the-crack",
      "/column/rebuilding-the-globe-began-with-a-blackened-plaque-in-1949-the-real-theatre-turned-up-under-a-car-park-mid-construction-the-globe-theatre-story-part-4-final",
    ],
    guides: [
      { href: "/sightseeing/st-pauls-cathedral", label: "セント・ポール大聖堂" },
    ],
  },
  {
    key: "seasons",
    label: "季節の行事",
    blurb: "ガイ・フォークス・ナイト、赤いポピー、クリスマスカード、議会が禁じたクリスマス、ボクシングデー。",
    members: [
      "/column/guy-fawkes-night-and-the-1606-act",
      "/column/the-remembrance-poppy-came-to-britain-from-france-in-1921",
      "/column/the-first-christmas-card-in-1843-was-a-flop-henry-cole-a-toasting-child-and-the-temperance-critics",
      "/column/when-parliament-abolished-christmas-in-1647",
      "/column/boxing-day-and-the-christmas-box",
      "/column/why-swans-on-the-thames-are-still-counted-as-the-king-s-property-inside-800-years-of-swan-upping",
    ],
    guides: [
      { href: "/events/bonfire-night", label: "ボンファイア・ナイトの行き方" },
      { href: "/events/christmas", label: "ロンドンのクリスマス" },
    ],
  },
  {
    key: "animals",
    label: "ロンドンの動物たち",
    blurb: "ワタリガラス、国王の白鳥、プーさんのモデルのクマ、象のジャンボ、政府に雇われた猫。",
    members: [
      "/column/the-tower-of-london-s-ravens-arrived-in-1883-and-the-prophecy-was-invented-in-1944",
      "/column/why-swans-on-the-thames-are-still-counted-as-the-king-s-property-inside-800-years-of-swan-upping",
      "/column/winnie-the-pooh-was-named-after-a-real-bear-at-london-zoo-the-cub-a-canadian-army-vet-bought-at-a-station-for-20-in-1914",
      "/column/the-jumbo-in-jumbo-jet-was-a-london-zoo-elephant-the-1882-sale-that-broke-britain-s-heart",
      "/column/before-larry-the-civil-service-cats-britain-paid-a-penny-a-day-from-1929",
    ],
    guides: [
      { href: "/sightseeing/london-zoo", label: "ロンドン動物園" },
    ],
  },
  {
    key: "wartime",
    label: "戦争の時代",
    blurb: "爆撃下の鍵の儀式、配給されなかったフィッシュ&チップス、ベスナル・グリーン駅の惨事、ベヴァリッジ報告。",
    members: [
      "/column/why-not-even-a-nazi-bomb-could-stop-the-tower-of-londons-ceremony-of-the-keys",
      "/column/fish-and-chips-was-never-rationed-what-the-1942-hansard-actually-says",
      "/column/london-underground-story-4-bethnal-green-1943",
      "/column/two-pieces-of-teak-in-a-glass-case-on-trafalgar-square-what-london-celebrated-on-15-august-1945",
      "/column/the-nhs-story-1-the-beveridge-report-1942",
      "/column/the-remembrance-poppy-came-to-britain-from-france-in-1921",
      "/column/will-the-cows-give-their-milk-earlier-because-of-mr-willett-the-eight-years-parliament-laughed-at-william-willett-and-the-twenty-one-days-after-germany-that-made-it-law",
      "/history/world-wars",
    ],
    guides: [
      { href: "/museums/imperial-war-museum", label: "帝国戦争博物館" },
      { href: "/sightseeing/churchill-war-rooms", label: "チャーチル戦争指令室" },
    ],
  },
  {
    key: "daily-life",
    label: "暮らしの仕組み",
    blurb: "ヒューズ入りのプラグ、2本の蛇口、999番、左側通行、NHS。住むと最初に戸惑うものの理由。",
    members: [
      "/column/why-every-british-plug-has-a-fuse-built-inside",
      "/column/why-british-basins-still-have-two-taps-the-tank-in-the-loft-and-the-law-that-outlived-it",
      "/column/999-the-worlds-first-emergency-number-london-1937",
      "/column/why-britain-drives-on-the-left",
      "/column/will-the-cows-give-their-milk-earlier-because-of-mr-willett-the-eight-years-parliament-laughed-at-william-willett-and-the-twenty-one-days-after-germany-that-made-it-law",
      "/column/the-nhs-story-4-overseas-visitors-and-the-nhs",
      "/modern-britain/uk-electricity-vat-cut",
      "/modern-britain/cabinet-office-s-be-ready-campaign-asks-every-household-for-three-days-of-supplies",
      "/modern-britain/poundland-files-to-appoint-administrators-as-rivals-circle-its-stores",
    ],
    guides: [
      { href: "/living", label: "ロンドン生活ガイド" },
      { href: "/sightseeing/travel-tips", label: "旅行の準備と現地の常識" },
    ],
  },
  {
    key: "be-feelings",
    label: "気持ちを言うイギリス英語",
    blurb: "嬉しい chuffed、がっかり gutted、くたくた knackered、金欠 skint。教科書に出ない感情の言葉。",
    members: [
      "/british-english/chuffed",
      "/british-english/gutted",
      "/british-english/knackered",
      "/british-english/skint",
      "/british-english/pissed",
      "/british-english/faff",
      "/british-english/cheeky",
      "/british-english/brave",
    ],
    guides: [
      { href: "/british-english/scenes", label: "場面別フレーズ集" },
    ],
  },
  {
    key: "be-politeness",
    label: "遠回しな言い方",
    blurb: "quite good は褒めていない、sorry は謝っていない、brave は止めている。言葉の裏を読むための単語。",
    members: [
      "/british-english/quite",
      "/british-english/sorry",
      "/british-english/brave",
      "/british-english/i-m-not-being-funny-but",
      "/british-english/fair-enough",
      "/british-english/pardon",
      "/british-english/you-alright",
      "/british-english/fancy",
      "/british-english/yours-faithfully",
      "/british-english/cheers",
      "/british-english/love",
    ],
    guides: [
      { href: "/british-english/scenes", label: "場面別フレーズ集" },
    ],
  },
  {
    key: "be-uk-us",
    label: "アメリカ英語と意味が違う語",
    blurb: "pants は下着、first floor は2階、rubber は消しゴム。アメリカ英語のつもりで使うと通じない語。",
    members: [
      "/british-english/pants",
      "/british-english/first-floor",
      "/british-english/rubber",
      "/british-english/homely",
      "/british-english/pissed",
      "/british-english/pudding",
      "/british-english/tea",
      "/british-english/half-seven",
      "/british-english/fortnight",
    ],
    guides: [
    ],
  },
  {
    key: "be-idioms",
    label: "由来のある慣用句",
    blurb: "Bob's your uncle、raining cats and dogs、brass monkeys、sent to Coventry。語源の通説と、記録で確かめられること。",
    members: [
      "/british-english/bob-s-your-uncle",
      "/british-english/it-s-raining-cats-and-dogs",
      "/british-english/brass-monkeys",
      "/british-english/sent-to-coventry",
      "/british-english/all-mouth-and-no-trousers",
      "/british-english/pear-shaped",
      "/british-english/porkies",
      "/british-english/spend-a-penny",
      "/british-english/taking-the-piss",
      "/british-english/codswallop",
      "/british-english/waffle",
      "/british-english/nick",
      "/british-english/posh",
    ],
    guides: [
    ],
  },
  {
    key: "be-street",
    label: "ロンドンの話し言葉",
    blurb: "innit、wagwan、You alright?、love。街やレジで毎日聞くのに、教科書には出てこない言い方。",
    members: [
      "/british-english/innit",
      "/british-english/wagwan",
      "/british-english/you-alright",
      "/british-english/love",
      "/british-english/cheers",
      "/british-english/easy-peelers",
    ],
    guides: [
      { href: "/british-english/scenes", label: "場面別フレーズ集" },
    ],
  },
];

export const READING_LINKS: Readonly<Record<string, readonly ReadingLink[]>> = {
  "/british-english/cheers": [
    { kind: "guide", href: "/restaurants/pub-etiquette", label: "パブの頼み方" },
  ],
  "/british-english/easy-peelers": [
    { kind: "guide", href: "/food/where-to-buy", label: "スーパーの使い分け" },
  ],
  "/british-english/first-floor": [
    { kind: "guide", href: "/housing", label: "ロンドンの部屋探し" },
  ],
  "/british-english/pissed": [
    { kind: "guide", href: "/restaurants/pub-etiquette", label: "パブの頼み方" },
  ],
  "/british-english/pudding": [
    { kind: "food", href: "/restaurants/sunday-roast", label: "サンデーローストの店" },
  ],
  "/british-english/tea": [
    { kind: "food", href: "/restaurants/afternoon-tea", label: "アフタヌーンティーの店" },
  ],
  "/column/999-the-worlds-first-emergency-number-london-1937": [
    { kind: "guide", href: "/trouble", label: "トラブル時の連絡先と対処" },
  ],
  "/column/a-dome-hidden-inside-the-dome-the-35-year-secret-of-st-paul-s-cathedral-the-christopher-wren-story-part-3-final": [
    { kind: "history", href: "/history/civil-war", label: "通史 第5章 内戦と名誉革命" },
  ],
  "/column/a-salisbury-man-ought-to-buy-it-the-1915-auction-of-stonehenge-and-the-three-years-one-man-owned-it": [
    { kind: "guide", href: "/beyond-london/bath-stonehenge", label: "バースとストーンヘンジへの日帰り" },
  ],
  "/column/a-woman-might-piss-it-out-the-five-days-that-burned-london-the-great-fire-story-part-1": [
    { kind: "history", href: "/history/civil-war", label: "通史 第5章 内戦と名誉革命" },
    { kind: "area", href: "/sightseeing/areas/city", label: "シティのエリアガイド" },
  ],
  "/column/boxing-day-and-the-christmas-box": [
    { kind: "event", href: "/events/christmas", label: "ロンドンのクリスマス" },
  ],
  "/column/britain-never-put-its-name-on-the-penny-black-in-1840-and-in-1874-the-world-let-it-stay-that-way": [
    { kind: "museum", href: "/museums/postal-museum", label: "郵便博物館" },
  ],
  "/column/captured-in-egypt-by-the-british-army-in-1801-how-the-rosetta-stone-became-a-prize-of-war-the-british-museum-story-part-2": [
    { kind: "museum", href: "/museums/british-museum", label: "大英博物館の回り方" },
  ],
  "/column/did-a-rector-s-daughter-found-manchester-city-the-1880-church-club-built-to-stop-the-scuttlers-the-two-clubs-of-manchester-part-2": [
    { kind: "guide", href: "/sightseeing/football", label: "ロンドンでサッカーを観る" },
  ],
  "/column/doggett-s-coat-and-badge-the-world-s-oldest-boat-race-and-the-vanished-trade-that-still-rows-it": [
    { kind: "guide", href: "/sightseeing/thames-cruise", label: "テムズ川クルーズの選び方" },
  ],
  "/column/fish-and-chips-was-never-rationed-what-the-1942-hansard-actually-says": [
    { kind: "guide", href: "/restaurants/pub-etiquette", label: "パブの頼み方" },
    { kind: "food", href: "/restaurants/fish-and-chips", label: "フィッシュ&チップスの店" },
  ],
  "/column/fortnum-and-mason-began-in-1707-with-the-queen-s-leftover-candles-the-london-department-store-story-part-4-final": [
    { kind: "guide", href: "/shopping", label: "ロンドンの買い物ガイド" },
    { kind: "brand", href: "/brands/fortnum-and-mason", label: "フォートナム&メイソン" },
    { kind: "souvenir", href: "/souvenirs/fortnum-and-mason-tea", label: "フォートナム&メイソンの紅茶" },
    { kind: "food", href: "/restaurants/afternoon-tea", label: "アフタヌーンティーの店" },
  ],
  "/column/found-on-ebay-the-british-museum-thefts-of-2023-and-the-warning-it-answered-with-all-accounted-for-the-british-museum-story-part-4": [
    { kind: "museum", href: "/museums/british-museum", label: "大英博物館の回り方" },
  ],
  "/column/great-smog-of-london-1952": [
    { kind: "history", href: "/history/postwar", label: "通史 第9章 戦後" },
  ],
  "/column/guy-fawkes-night-and-the-1606-act": [
    { kind: "event", href: "/events/bonfire-night", label: "ボンファイア・ナイトの行き方" },
    { kind: "history", href: "/history/civil-war", label: "通史 第5章 内戦と名誉革命" },
  ],
  "/column/how-a-london-church-steeple-gave-the-wedding-cake-its-shape-the-christopher-wren-story-part-2": [
    { kind: "history", href: "/history/civil-war", label: "通史 第5章 内戦と名誉革命" },
  ],
  "/column/liberty-london-began-in-1875-selling-goods-from-japan-the-store-built-from-two-warships-the-london-department-store-story-part-3": [
    { kind: "guide", href: "/shopping", label: "ロンドンの買い物ガイド" },
  ],
  "/column/london-bridge-was-sold-to-the-arizona-desert-in-1968-did-the-buyer-really-think-it-was-tower-bridge": [
    { kind: "guide", href: "/sightseeing/thames-cruise", label: "テムズ川クルーズの選び方" },
  ],
  "/column/london-s-red-telephone-box-was-born-from-a-tomb": [
    { kind: "museum", href: "/museums/sir-john-soanes-museum", label: "サー・ジョン・ソーンズ博物館" },
  ],
  "/column/london-underground-story-1-steam-1863": [
    { kind: "guide", href: "/sightseeing/transport/tube", label: "地下鉄の乗り方" },
    { kind: "museum", href: "/museums/london-transport-museum", label: "ロンドン交通博物館" },
  ],
  "/column/london-underground-story-2-first-electric-tube-1890": [
    { kind: "guide", href: "/sightseeing/transport/tube", label: "地下鉄の乗り方" },
    { kind: "museum", href: "/museums/london-transport-museum", label: "ロンドン交通博物館" },
  ],
  "/column/london-underground-story-3-yerkes-and-pick": [
    { kind: "guide", href: "/sightseeing/transport/tube", label: "地下鉄の乗り方" },
    { kind: "museum", href: "/museums/london-transport-museum", label: "ロンドン交通博物館" },
  ],
  "/column/london-underground-story-4-bethnal-green-1943": [
    { kind: "guide", href: "/sightseeing/transport/tube", label: "地下鉄の乗り方" },
    { kind: "museum", href: "/museums/london-transport-museum", label: "ロンドン交通博物館" },
  ],
  "/column/manchester-united-was-a-railway-works-team-the-lost-st-bernard-that-saved-it-from-bankruptcy-in-1902-the-two-clubs-of-manchester-part-1": [
    { kind: "guide", href: "/sightseeing/football", label: "ロンドンでサッカーを観る" },
  ],
  "/column/marmite-cured-bombay-s-anaemic-mothers-in-1931-how-folic-acid-was-found-in-a-jar-of-brown-paste": [
    { kind: "souvenir", href: "/souvenirs/marmite", label: "マーマイト" },
  ],
  "/column/milk-in-first-or-tea-in-first-the-six-page-british-standard-that-won-an-ig-nobel-prize": [
    { kind: "food", href: "/restaurants/afternoon-tea", label: "アフタヌーンティーの店" },
    { kind: "souvenir", href: "/souvenirs/brown-betty-teapot", label: "ブラウンベティのティーポット" },
  ],
  "/column/no-bigger-than-a-horse-and-cart-how-thirteen-green-huts-survived-150-years-on-london-s-roads": [
    { kind: "guide", href: "/sightseeing/transport/taxi", label: "ロンドンのタクシーの乗り方" },
  ],
  "/column/nobody-was-punished-and-the-shareholders-were-paid-198-pounds-in-cash-for-every-100-the-east-india-company-quietly-died-on-1-june-1874-the-east-india-company-story-part-3": [
    { kind: "history", href: "/history/union-and-empire", label: "通史 第6章 連合王国と帝国" },
  ],
  "/column/not-twenty-thousand-pounds-in-the-treasury-the-rigged-lottery-that-founded-the-british-museum-in-1753-the-british-museum-story-part-1": [
    { kind: "museum", href: "/museums/british-museum", label: "大英博物館の回り方" },
  ],
  "/column/parliament-cut-the-price-of-tea-to-save-a-bankrupt-company-seven-months-later-it-was-floating-in-boston-harbour-the-east-india-company-story-part-2": [
    { kind: "history", href: "/history/union-and-empire", label: "通史 第6章 連合王国と帝国" },
  ],
  "/column/selfridges-put-the-channel-crossing-aeroplane-on-show-in-1909-the-london-department-store-story-part-2": [
    { kind: "guide", href: "/shopping", label: "ロンドンの買い物ガイド" },
  ],
  "/column/she-dug-up-the-clothes-feminism-hated-the-punk-who-haunted-the-wallace-collection-the-vivienne-westwood-story-part-2": [
    { kind: "brand", href: "/brands/vivienne-westwood", label: "ヴィヴィアン・ウエストウッドの店" },
    { kind: "museum", href: "/museums/the-wallace-collection", label: "ウォレス・コレクション" },
  ],
  "/column/the-102-metres-between-greenwich-and-zero-why-the-prime-meridian-moved-and-why-nobody-moves-it-back": [
    { kind: "museum", href: "/museums/royal-observatory-greenwich", label: "グリニッジ天文台" },
    { kind: "area", href: "/sightseeing/areas/greenwich", label: "グリニッジのエリアガイド" },
  ],
  "/column/the-address-that-did-not-exist-seventy-years-of-the-secretary-to-sherlock-holmes-at-221b-baker-street": [
    { kind: "museum", href: "/museums/sherlock-holmes-museum", label: "シャーロック・ホームズ博物館" },
  ],
  "/column/the-bank-picquet-193-years-of-soldiers-marching-to-guard-a-bank-that-was-never-robbed-again": [
    { kind: "museum", href: "/museums/bank-of-england-museum", label: "イングランド銀行博物館" },
  ],
  "/column/the-blue-plaque-and-the-three-in-four-it-turns-away": [
    { kind: "guide", href: "/sightseeing/blue-plaques", label: "ブルー・プラークを地区ごとに歩く" },
  ],
  "/column/the-company-that-met-in-a-tavern-lemon-juice-pepper-and-the-right-to-make-war-the-east-india-company-story-part-1": [
    { kind: "history", href: "/history/union-and-empire", label: "通史 第6章 連合王国と帝国" },
  ],
  "/column/the-court-built-only-to-decide-who-pays-for-a-burnt-house-insurance-fire-brigades-and-the-rules-that-rebuilt-london-the-great-fire-story-part-3-final": [
    { kind: "history", href: "/history/civil-war", label: "通史 第5章 内戦と名誉革命" },
    { kind: "area", href: "/sightseeing/areas/city", label: "シティのエリアガイド" },
  ],
  "/column/the-dame-who-rode-a-tank-from-the-palace-twirl-to-a-quiet-house-in-clapham-the-vivienne-westwood-story-part-3-final": [
    { kind: "brand", href: "/brands/vivienne-westwood", label: "ヴィヴィアン・ウエストウッドの店" },
  ],
  "/column/the-door-slammed-in-the-king-s-face-how-one-day-in-1642-still-choreographs-british-parliament": [
    { kind: "history", href: "/history/civil-war", label: "通史 第5章 内戦と名誉革命" },
  ],
  "/column/the-first-christmas-card-in-1843-was-a-flop-henry-cole-a-toasting-child-and-the-temperance-critics": [
    { kind: "museum", href: "/museums/victoria-and-albert-museum", label: "ヴィクトリア&アルバート博物館" },
    { kind: "event", href: "/events/christmas", label: "ロンドンのクリスマス" },
  ],
  "/column/the-founder-of-harrods-was-convicted-over-stolen-currants-in-1836-the-london-department-store-story-part-1": [
    { kind: "guide", href: "/shopping", label: "ロンドンの買い物ガイド" },
  ],
  "/column/the-knowledge-why-london-cabbies-spend-four-years-memorising-the-city": [
    { kind: "guide", href: "/sightseeing/transport/taxi", label: "ロンドンのタクシーの乗り方" },
  ],
  "/column/the-last-station-that-still-says-mind-the-gap-in-oswald-laurence-s-voice-a-widow-at-embankment-and-the-tape-london-underground-went-looking-for": [
    { kind: "guide", href: "/sightseeing/transport/tube", label: "地下鉄の乗り方" },
    { kind: "museum", href: "/museums/london-transport-museum", label: "ロンドン交通博物館" },
  ],
  "/column/the-lion-that-never-weathered-eleanor-coade-and-the-stone-she-baked-in-a-kiln": [
    { kind: "area", href: "/sightseeing/areas/southbank", label: "サウスバンクのエリアガイド" },
  ],
  "/column/the-man-everyone-knew-was-innocent-robert-hubert-and-the-lie-carved-into-london-for-150-years-the-great-fire-story-part-2": [
    { kind: "history", href: "/history/civil-war", label: "通史 第5章 内戦と名誉革命" },
    { kind: "area", href: "/sightseeing/areas/city", label: "シティのエリアガイド" },
  ],
  "/column/the-nation-bought-the-parthenon-marbles-for-35-000-pounds-in-1816-while-lord-elgin-had-spent-74-240-the-british-museum-story-part-3": [
    { kind: "museum", href: "/museums/british-museum", label: "大英博物館の回り方" },
  ],
  "/column/the-nhs-story-1-the-beveridge-report-1942": [
    { kind: "guide", href: "/health/gp-registration", label: "GP(かかりつけ医)の登録" },
    { kind: "history", href: "/history/postwar", label: "通史 第9章 戦後" },
  ],
  "/column/the-nhs-story-2-the-appointed-day-5-july-1948": [
    { kind: "guide", href: "/health/gp-registration", label: "GP(かかりつけ医)の登録" },
    { kind: "history", href: "/history/postwar", label: "通史 第9章 戦後" },
  ],
  "/column/the-nhs-story-3-teeth-spectacles-and-bevan-s-resignation-1951": [
    { kind: "guide", href: "/health/gp-registration", label: "GP(かかりつけ医)の登録" },
    { kind: "history", href: "/history/postwar", label: "通史 第9章 戦後" },
  ],
  "/column/the-nhs-story-4-overseas-visitors-and-the-nhs": [
    { kind: "guide", href: "/health/ihs-and-entitlement", label: "IHS(移民医療付加金)と無料診療の範囲" },
    { kind: "guide", href: "/health/when-you-are-ill", label: "旅行中・滞在中に具合が悪くなったら" },
  ],
  "/column/the-pleasant-riverside-walk-that-is-actually-the-roof-of-a-sewer": [
    { kind: "history", href: "/history/industrial-revolution", label: "通史 第7章 産業革命" },
    { kind: "guide", href: "/sightseeing/thames-cruise", label: "テムズ川クルーズの選び方" },
  ],
  "/column/the-primary-school-teacher-who-sewed-punk-s-uniform-nine-years-at-430-king-s-road-the-vivienne-westwood-story-part-1": [
    { kind: "brand", href: "/brands/vivienne-westwood", label: "ヴィヴィアン・ウエストウッドの店" },
  ],
  "/column/the-royal-warrant-is-not-a-medal-but-a-five-year-contract-how-cadbury-lost-170-years-in-a-letter-that-gave-no-reason": [
    { kind: "souvenir", href: "/souvenirs/cadbury-dairy-milk", label: "キャドバリーのチョコレート" },
    { kind: "brand", href: "/brands", label: "英国ブランド一覧" },
  ],
  "/column/the-scientist-who-injected-a-dog-with-opium-later-redesigned-london-s-skyline-the-christopher-wren-story-part-1": [
    { kind: "history", href: "/history/civil-war", label: "通史 第5章 内戦と名誉革命" },
  ],
  "/column/the-tower-of-london-s-ravens-arrived-in-1883-and-the-prophecy-was-invented-in-1944": [
    { kind: "history", href: "/history/norman-conquest", label: "通史 第3章 ノルマン征服" },
  ],
  "/column/the-tree-that-sheds-its-soot-why-the-london-plane-alone-survived-the-air-of-the-industrial-revolution": [
    { kind: "history", href: "/history/industrial-revolution", label: "通史 第7章 産業革命" },
  ],
  "/column/the-tube-map-was-drawn-by-an-unemployed-draughtsman-ten-guineas-and-ten-years-before-his-name-was-printed-on-it": [
    { kind: "guide", href: "/sightseeing/transport/tube", label: "地下鉄の乗り方" },
    { kind: "museum", href: "/museums/london-transport-museum", label: "ロンドン交通博物館" },
    { kind: "souvenir", href: "/souvenirs/london-underground-goods", label: "ロンドン地下鉄のグッズ" },
  ],
  "/column/the-white-posts-that-ring-london-how-a-tax-nobody-paid-at-the-post-built-the-embankment": [
    { kind: "history", href: "/history/industrial-revolution", label: "通史 第7章 産業革命" },
  ],
  "/column/the-woman-who-sold-time-104-years-of-carrying-a-single-pocket-watch-across-london": [
    { kind: "museum", href: "/museums/royal-observatory-greenwich", label: "グリニッジ天文台" },
    { kind: "area", href: "/sightseeing/areas/greenwich", label: "グリニッジのエリアガイド" },
  ],
  "/column/two-pieces-of-teak-in-a-glass-case-on-trafalgar-square-what-london-celebrated-on-15-august-1945": [
    { kind: "history", href: "/history/world-wars", label: "通史 第8章 二つの世界大戦" },
  ],
  "/column/when-parliament-abolished-christmas-in-1647": [
    { kind: "event", href: "/events/christmas", label: "ロンドンのクリスマス" },
  ],
  "/column/when-the-british-government-owned-the-pubs-57-years-of-nationalised-beer-and-the-law-that-made-buying-a-round-a-crime": [
    { kind: "guide", href: "/restaurants/pub-etiquette", label: "パブの頼み方" },
  ],
  "/column/where-the-name-earl-grey-tea-came-from": [
    { kind: "brand", href: "/brands/twinings", label: "トワイニング" },
    { kind: "souvenir", href: "/souvenirs/twinings-tea", label: "トワイニングの紅茶" },
  ],
  "/column/why-britain-drives-on-the-left": [
    { kind: "guide", href: "/sightseeing/transport", label: "ロンドンの交通ガイド" },
  ],
  "/column/why-british-basins-still-have-two-taps-the-tank-in-the-loft-and-the-law-that-outlived-it": [
    { kind: "guide", href: "/housing", label: "ロンドンの部屋探し" },
  ],
  "/column/why-british-postboxes-change-their-letters-with-every-monarch-and-the-one-that-got-blown-up": [
    { kind: "museum", href: "/museums/postal-museum", label: "郵便博物館" },
  ],
  "/column/why-every-british-plug-has-a-fuse-built-inside": [
    { kind: "guide", href: "/sightseeing/travel-tips", label: "変換プラグと電圧(旅の準備)" },
  ],
  "/column/why-swans-on-the-thames-are-still-counted-as-the-king-s-property-inside-800-years-of-swan-upping": [
    { kind: "guide", href: "/sightseeing/thames-cruise", label: "テムズ川クルーズの選び方" },
  ],
  "/column/why-the-marathon-is-42-195-km-the-1908-windsor-start-and-the-royal-myth-that-never-was": [
    { kind: "guide", href: "/beyond-london/windsor", label: "ウィンザーへの日帰り" },
  ],
  "/column/wimbledon-began-in-1877-to-pay-for-a-broken-pony-roller-the-first-champion-later-called-lawn-tennis-monotonous": [
    { kind: "museum", href: "/museums/wimbledon-lawn-tennis-museum", label: "ウィンブルドン・ローンテニス博物館" },
  ],
  "/modern-britain/angel-station-escalators": [
    { kind: "guide", href: "/sightseeing/transport/tube", label: "地下鉄の乗り方" },
  ],
  "/modern-britain/cabinet-office-s-be-ready-campaign-asks-every-household-for-three-days-of-supplies": [
    { kind: "guide", href: "/trouble", label: "トラブル時の連絡先と対処" },
  ],
  "/modern-britain/healey-raises-alcohol-duty-and-widens-pub-business-rates-relief": [
    { kind: "guide", href: "/restaurants/pub-etiquette", label: "パブの頼み方" },
    { kind: "guide", href: "/prices", label: "ロンドンの物価ボード" },
  ],
  "/modern-britain/nitrite-free-bacon-eu-food-deal": [
    { kind: "food", href: "/restaurants/full-english-breakfast", label: "イングリッシュ・ブレックファストの店" },
  ],
  "/modern-britain/poundland-files-to-appoint-administrators-as-rivals-circle-its-stores": [
    { kind: "guide", href: "/food/where-to-buy", label: "スーパーの使い分け" },
  ],
  "/modern-britain/tube-inspector-disciplined": [
    { kind: "guide", href: "/sightseeing/transport/tube", label: "地下鉄の乗り方" },
  ],
  "/modern-britain/uae-warns-uk-over-investment-as-manchester-city-await-sanctions": [
    { kind: "guide", href: "/sightseeing/football", label: "ロンドンでサッカーを観る" },
  ],
  "/modern-britain/uk-electricity-vat-cut": [
    { kind: "guide", href: "/bills", label: "光熱費と家の請求書" },
  ],
  "/modern-britain/v-and-a-voluntary-exit-scheme-while-museums-stay-free": [
    { kind: "museum", href: "/museums/victoria-and-albert-museum", label: "ヴィクトリア&アルバート博物館" },
  ],
  "/modern-britain/why-english-football-still-blacks-out-saturday-3pm": [
    { kind: "guide", href: "/sightseeing/football/pub-watching", label: "パブでサッカーを観る" },
  ],
};

const THEMES_BY_PATH = new Map<string, string[]>();
for (const theme of READING_THEMES) {
  for (const path of theme.members) {
    const list = THEMES_BY_PATH.get(path) ?? [];
    list.push(theme.key);
    THEMES_BY_PATH.set(path, list);
  }
}

/** 記事のパスが属するテーマの key。 */
export function themesOf(path: string): string[] {
  return THEMES_BY_PATH.get(path) ?? [];
}

/** 記事のパスから先へ進むサイト内のページ。 */
export function readingLinksOf(path: string): readonly ReadingLink[] {
  return READING_LINKS[path] ?? [];
}

export function getReadingTheme(key: string): ReadingTheme | null {
  return READING_THEMES.find((t) => t.key === key) ?? null;
}

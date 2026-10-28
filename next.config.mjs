import renamedSlugs from "./lib/sightseeing/renamed-slugs.js";
import museumPairs from "./lib/museum-attraction-pairs.js";

const { RENAMED_ATTRACTION_SLUGS } = renamedSlugs;
const { MUSEUM_ATTRACTION_PAIRS } = museumPairs;

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // /lyrixplorer は just-lyrics.com へ転送していたが、2026-10 にやめて
      // app/lyrixplorer/[[...rest]]/route.ts で 410 を返すようにした。
      // 歌詞全文を載せるサイトとの結びつきを AdSense の審査対象から外すため。
      // ここに転送を戻さないこと。

      // 旧ビザ記事。/visa をハブ化した際に slug を整理した。
      // uk-visa-guide-2025 は URL に年が入っており、毎年 slug を作り直すか
      // 古い年のまま放置するかの二択になるため、年を落として恒久 URL にした。
      {
        source: "/visa/uk-visa-guide-2025",
        destination: "/visa/uk-visa-guide",
        permanent: true,
      },
      {
        source: "/visa/uk-youth-mobility-visa",
        destination: "/visa/youth-mobility-scheme",
        permanent: true,
      },

      // 旅行プラン作成。観光の配下に置いていたが、サイトの中心に据える
      // 道具なのでトップレベルに上げた。公開直後の移動で外部リンクは
      // まだ無いが、共有リンクを送ったあとの人が旧URLを開きうる。
      {
        source: "/sightseeing/plan",
        destination: "/plan",
        permanent: true,
      },

      // 観光パス4種。もともと観光スポットDB(Attraction)に1件ずつ入れて
      // いたが、パスは場所ではなく買い方なので、場所前提の機能
      // (近くのスポット・旅程の移動時間・エリア・着いてからの歩き方)を
      // 足すたびに除外リストが1行増える状態になっていた。
      //
      // より効いたのは、商品ページが4枚に割れている限りどのページも
      // 単体で「お得です」と書くしかなかったこと。損得は比較でしか出ない。
      // 判定を1本にまとめて /sightseeing/passes に置き、旧URLはそこへ送る。
      // DB側の4行は削除せず isPublished:false で伏せてある。
      {
        source: "/sightseeing/the-london-pass",
        destination: "/sightseeing/passes",
        permanent: true,
      },
      {
        source: "/sightseeing/golden-pass-london",
        destination: "/sightseeing/passes",
        permanent: true,
      },
      {
        source: "/sightseeing/merlin-london-attractions-pass",
        destination: "/sightseeing/passes",
        permanent: true,
      },
      {
        source: "/sightseeing/royal-museums-greenwich-day-pass",
        destination: "/sightseeing/passes",
        permanent: true,
      },

      // 旧「美術館25選」。recommendLevel>=4 の26館を並べるページだったが、
      // うち10館は10選ページと丸ごと重複していた。全館一覧に
      // 「おすすめ度が高い」絞り込みを入れて吸収したのでそちらへ送る。
      {
        source: "/museums/best-25-museums",
        destination: "/museums/all-museums",
        permanent: true,
      },

      // ウォーキー・トーキーはスカイガーデンと同じ建物・同じ訪問体験で、
      // 2件のスポットとして重複登録されていた。スカイガーデン側に統合し、
      // 建物名の URL はそちらへ送る。予約サイトもスカイガーデンの名前で
      // 出ているため、読者が探しているのは実質こちら。
      {
        source: "/sightseeing/20-fenchurch-street-walkie-talkie",
        destination: "/sightseeing/sky-garden-london",
        permanent: true,
      },

      // 季節の催しの slug から年号を外した。理由と対応表は
      // lib/sightseeing/renamed-slugs.js(旅行プランの読み替えも同じ表を読む)。
      ...Object.entries(RENAMED_ATTRACTION_SLUGS).map(([from, to]) => ({
        source: `/sightseeing/${from}`,
        destination: `/sightseeing/${to}`,
        permanent: true,
      })),

      // 観光と美術館の両方にページがあった21館は、美術館側の1本にまとめた
      // (2026-10)。理由と、行を両方残している訳は lib/museum-attraction-pairs.js。
      // 検索に出ていたのは観光側なので、評価を引き継ぐために恒久転送で送る
      // (permanent は 308。Google は 301 と同じに扱う)。
      ...MUSEUM_ATTRACTION_PAIRS.map((pair) => ({
        source: `/sightseeing/${pair.attractionSlug}`,
        destination: `/museums/${pair.museumSlug}`,
        permanent: true,
      })),

      // ウィンター・ワンダーランドは、スポット版とクリスマスマーケット版の
      // 2ページが同じ催しを別々に書いていた。検索の実績(過去1年でクリック
      // 55対0)も、旅行プラン・スタンプ・回り方もスポット版にあるので、
      // そちらへ1本にまとめる。マーケット一覧のカードは残し、リンク先だけ
      // スポット版にしてある(lib/christmas/markets.ts の spotSlug)。
      {
        source: "/sightseeing/christmas-markets/winter-wonderland",
        destination: "/sightseeing/hyde-park-winter-wonderland",
        permanent: true,
      },

      // 残りのマーケットの詳細ページ9本は、一覧の各節にまとめた(2026-10)。
      // どれも同じ型の約500字で、会期は「例年◯月」しか書けていなかった。
      // 比べて選ぶための情報は一覧に並べないと出てこない。理由の詳細は
      // lib/christmas/markets.ts の冒頭。
      // 節のアンカーは旧 slug と同じにしてあるので、そのまま #slug へ送る。
      ...[
        "covent-garden-christmas-market",
        "southbank-centre-winter-market",
        "winter-by-the-river",
        "trafalgar-square-christmas-market",
        "leicester-square-christmas-market",
        "battersea-power-christmas-market",
        "kings-cross-christmas-market",
        "spitalfields-christmas-market",
        "kingston-christmas-market",
      ].map((slug) => ({
        source: `/sightseeing/christmas-markets/${slug}`,
        destination: `/sightseeing/christmas-markets#${slug}`,
        permanent: true,
      })),

      // 月別イベントカレンダーの URL から年号を外した。年が替わるたびに
      // URL が一から出直すのをやめ、同じ月の検索を毎年同じ URL で受ける。
      // どの年の分を出すかは /events/[slug] が決める(fetchMonthlyEvents)。
      {
        source:
          "/events/london-events-2026-:month(january|february|march|april|may|june|july|august|september|october|november|december)",
        destination: "/events/:month",
        permanent: true,
      },

      // その他は apex -> www
      {
        source: "/:path*",
        has: [{ type: "host", value: "just-rondon.com" }],
        destination: "https://www.just-rondon.com/:path*",
        permanent: true,
      },
    ];
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  /**
   * Content-Security-Policy は意図的に設定していない。
   * AdSense は配信時に列挙不可能な第三者オリジンを動的に読み込むため、
   * CSP が少しでも合っていないと広告配信そのものを止めてしまう。
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // public/ はコンテンツハッシュの無い固定パスなので immutable にはしない。
        // OG画像などを差し替えても既存クライアントに永久に届かなくなるため。
        source: "/:all*(jpg|jpeg|png|webp|avif|ico|svg)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, must-revalidate",
          },
        ],
      },
    ];
  },

  images: {
    // 2026-08: Vercel Image Optimization の枠を使い切り、最適化エンドポイントが
    // 402 (OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED) を返したので unoptimized に
    // していた。その間、80px の枠にも Wikimedia の1280px画像や原本がそのまま
    // 配られていた。
    //
    // いまは自前のローダーで、Wikimedia 自身が配る幅つきサムネイルに差し替える
    // (lib/image-loader.ts)。Vercel の最適化は通らないので課金は発生しない。
    // 幅を変えられない画像(Supabase など)は呼び出し側で unoptimized にする。
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "vuovopzkzwmgvlxjtykw.supabase.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
    ],
  },
};
export default nextConfig;

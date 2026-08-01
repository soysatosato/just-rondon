/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/lyrixplorer",
        has: [{ type: "host", value: "just-rondon.com" }],
        destination: "https://just-lyrics.com",
        permanent: true,
      },
      {
        source: "/lyrixplorer/:path*",
        has: [{ type: "host", value: "just-rondon.com" }],
        destination: "https://just-lyrics.com/:path*",
        permanent: true,
      },

      // www domain
      {
        source: "/lyrixplorer",
        has: [{ type: "host", value: "www.just-rondon.com" }],
        destination: "https://just-lyrics.com",
        permanent: true,
      },
      {
        source: "/lyrixplorer/:path*",
        has: [{ type: "host", value: "www.just-rondon.com" }],
        destination: "https://just-lyrics.com/:path*",
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
    formats: ["image/avif", "image/webp"],
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

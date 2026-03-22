/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      // 1. 旧 lyrixplorer を新ドメインへ移行
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

      // 2. それ以外は just-rondon.com → www.just-rondon.com
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

  images: {
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

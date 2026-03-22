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

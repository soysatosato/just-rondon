import "./globals.css";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import { defaultMetadata } from "./metadata";
import MainFooter from "@/components/home/MainFooter";
import Navbar from "@/components/navbar/Navbar";
import Script from "next/script";

export const metadata = defaultMetadata;
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="ja" className="dark">
        <head>
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXX"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        </head>
        <body className="bg-background text-foreground transition-colors duration-300">
          <Providers>
            <Navbar />
            <main className="container py-4">{children}</main>
            <MainFooter />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}

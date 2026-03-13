import "./globals.css";
import Providers from "./providers";
// import { ClerkProvider } from "@clerk/nextjs";
import { defaultMetadata } from "./metadata";
import MainFooter from "@/components/home/MainFooter";
import Navbar from "@/components/navbar/Navbar";

export const metadata = defaultMetadata;
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <html lang="ja" suppressHydrationWarning>
        <head>
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7128094501931852"
            crossOrigin="anonymous"
          ></script>
        </head>
        <body className="bg-background text-foreground transition-colors duration-300">
          <Providers>
            <Navbar />
            <main className="container py-4">{children}</main>
            <MainFooter />
          </Providers>
        </body>
      </html>
    </>
  );
}

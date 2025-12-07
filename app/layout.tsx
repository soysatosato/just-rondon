import "./globals.css";
import Providers from "./providers";
import { ClerkProvider } from "@clerk/nextjs";
import MainNav from "@/components/navbar/MainNav";
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
    <ClerkProvider>
      <html lang="ja" className="dark">
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

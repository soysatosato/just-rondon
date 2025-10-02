"use client";

import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "./theme-provider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Toaster はアプリのルートに近いところで一度だけ配置すればOK。 */}
      <Toaster />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </>
  );
}

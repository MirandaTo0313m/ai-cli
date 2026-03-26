import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ai-cli",
  description: "Minimal terminal AI assistant",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body
        className="font-sans antialiased bg-[#0a0a0a] text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}

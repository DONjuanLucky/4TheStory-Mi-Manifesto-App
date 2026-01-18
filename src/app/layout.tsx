import type { Metadata } from "next";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mi Manifesto | Your Voice, Your Book",
  description: "Turn your voice into a published book. A voice-first writing companion for storytellers.",
  manifest: "/manifest.json",
  themeColor: "#d4a574",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mi Manifesto",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

import { Providers } from "@/components/providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={cn(
          sans.variable,
          serif.variable,
          mono.variable,
          "antialiased bg-paper text-ink font-serif"
        )}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

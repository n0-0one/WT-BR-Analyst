import type { Metadata, Viewport } from "next";
import { Inter, Space_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#11161D",
};

export const metadata: Metadata = {
  title: "WAR THUNDER // BR ANALYST — Ecosystem, Matchmaker & Lineup Intelligence",
  description:
    "Authoritative War Thunder Battle Rating Ecosystem Analyzer. Track decompression waves, threats escaped vs added, Ground RB split BRs, 3,380+ vehicles across 10 nations, and lineup survival.",
  keywords: [
    "War Thunder",
    "Battle Rating",
    "BR Changes",
    "Lineup Builder",
    "Lineup Survival",
    "Matchmaker Decompression",
    "Ground RB Split BR",
    "Datamine",
  ],
  authors: [{ name: "WT BR Analyst Team" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceMono.variable} dark`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[#11161D] text-slate-100 min-h-screen selection:bg-[#E65100] selection:text-white">
        {children}
      </body>
    </html>
  );
}

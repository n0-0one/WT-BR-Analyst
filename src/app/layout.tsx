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
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "WT // NOTHING — War Thunder Battle Rating & Lineup Intelligence",
  description:
    "Autonomous, datamine-verified War Thunder Battle Rating Intelligence platform. Track patch decompressions, matchmaker black holes, and anchor-preserving lineup survival in pure Nothing OS minimalism.",
  keywords: [
    "War Thunder",
    "Battle Rating",
    "BR Changes",
    "Lineup Builder",
    "Matchmaker Black Holes",
    "Nothing OS",
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
        <link
          href="https://fonts.googleapis.com/css2?family=DotGothic16&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-white min-h-screen selection:bg-nothing-red selection:text-white">
        {children}
      </body>
    </html>
  );
}

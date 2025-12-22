import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Find a Wedding Officiant in Ontario | Ontario Officiant Finder",
  description:
    "Search 22,000+ registered wedding officiants across Ontario. Find the perfect match for your ceremony by location, affiliation, and style.",
  keywords: [
    "wedding officiant",
    "Ontario",
    "marriage commissioner",
    "wedding ceremony",
    "find officiant",
  ],
  openGraph: {
    title: "Find a Wedding Officiant in Ontario",
    description:
      "Search 22,000+ registered wedding officiants across Ontario. Find the perfect match for your ceremony.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}

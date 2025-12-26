import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://onweddingofficiants.ca";

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
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Find a Wedding Officiant in Ontario",
    description:
      "Search 22,000+ registered wedding officiants across Ontario. Find the perfect match for your ceremony.",
    type: "website",
    siteName: "Ontario Wedding Officiant Finder",
    locale: "en_CA",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Find a Wedding Officiant in Ontario",
    description:
      "Search 22,000+ registered wedding officiants across Ontario. Find the perfect match for your ceremony.",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

// Script to prevent flash of unstyled content
const themeScript = `
  (function() {
    try {
      const theme = localStorage.getItem('theme') || 'system';
      const isDark = theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.className} antialiased`}>
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--primary)] focus:text-white focus:rounded-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

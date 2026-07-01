import type { Metadata } from "next";
import "../styles/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import { ScrollToTop } from "@/components/ui/ScrollToTop";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – #1 Indian Movie Database | Films, Songs & Box Office`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "The Cinema Verse is India's premier Indian movie encyclopedia. Discover films, actors, songs, box office collections, OTT releases, reviews, and the latest news across multiple regional industries — all in one place.",
  keywords: [
    "indian movies", "movies", "indian cinema", "actors",
    "movie songs", "movie news", "movie reviews", "film database",
    "box office", "upcoming movies", "OTT releases",
    "new films 2026", "movie cast", "blockbuster movies", "multi-language movies"
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5823659147566885"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="grain min-h-screen flex flex-col bg-[#0F0F10]">
        <ScrollToTop />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#222225",
              color: "#FFFFFF",
              border: "1px solid #36363B",
            },
          }}
        />
      </body>
    </html>
  );
}
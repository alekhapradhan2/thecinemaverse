import type { Metadata } from "next";
import "../styles/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "react-hot-toast";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – The Hindi Film Encyclopedia`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "The Cinema Verse is the ultimate encyclopedia for Bollywood cinema. Discover movies, actors, songs, reviews, box office, and news from the Hindi film industry.",
  keywords: [
    "hindi movies", "bollywood", "hindi films", "hindi cinema", "bollywood actors",
    "bollywood songs", "bollywood news", "hindi movie reviews", "hindi film database",
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
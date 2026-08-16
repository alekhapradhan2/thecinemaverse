// src/lib/seo/boxOfficeSeo.ts
// ─────────────────────────────────────────────────────────────────────────────
// Box Office page SEO — metadata for /box-office and /box-office/[slug] pages.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { buildBoxOfficeCanonical, buildBoxOfficeDetailCanonical } from "@/lib/seoUtils/canonical";
import { SITE_NAME }                                               from "@/lib/seoUtils/metadata";

const SITE_ORIGIN = "https://thecinemaverses.in";

/**
 * Generate Metadata for the Box Office listing page (/box-office or /box-office?year=YYYY).
 * Canonical: /box-office (current year) or /box-office?year=YYYY (past years).
 */
export function generateBoxOfficeListingMetadata(params: {
  year?: number;
  langAdjective?: string;   // e.g. "Bollywood", "Bengali"
  langShort?: string;       // e.g. "Hindi", "Bengali"
  langIndustry?: string;    // e.g. "Bollywood", "Bengali Cinema"
  langKey?: string;         // URL key e.g. "hindi", "bengali"
}): Metadata {
  const currentYear   = new Date().getFullYear();
  const year          = params.year || currentYear;
  const isCurrentYear = year === currentYear;
  const adj           = params.langAdjective || "Bollywood";
  const short         = params.langShort      || "Indian";
  const industry      = params.langIndustry   || "Bollywood";
  const canonical     = buildBoxOfficeCanonical(isCurrentYear ? undefined : year);

  const title = isCurrentYear
    ? `${adj} Box Office Collection ${year}`
    : `${adj} Box Office Collection ${year} – Hit & Flop List`;

  const description = isCurrentYear
    ? `Complete ${adj} box office collection report ${year}. Day-wise net and gross earnings for all ${short.toLowerCase()} movies — updated daily on ${SITE_NAME}.`
    : `${adj} box office collection ${year} — all movies, hit & flop verdict, day-wise net and gross earnings. Complete ${industry} ${year} trade report on ${SITE_NAME}.`;

  const keywords = [
    `${adj.toLowerCase()} box office`,
    `${adj.toLowerCase()} collection ${year}`,
    `${short.toLowerCase()} movie collection ${year}`,
    `${short.toLowerCase()} cinema box office`,
    `${adj.toLowerCase()} box office ${year}`,
    `${short.toLowerCase()} film earnings`,
    `${adj.toLowerCase()} hit flop verdict`,
    `${short.toLowerCase()} movie first day collection`,
    `${adj.toLowerCase()} movie verdict ${year}`,
    `${short.toLowerCase()} film box office report`,
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_IN",
      images: [{
        url: `${SITE_ORIGIN}/og-box-office.jpg`,
        width: 1200,
        height: 630,
        alt: `${adj} Box Office Collection ${year} — ${SITE_NAME}`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: `Day-wise net & gross earnings for all ${adj.toLowerCase()} movies ${year}. Updated daily.`,
      images: [`${SITE_ORIGIN}/og-box-office.jpg`],
    },
  };
}

/**
 * Generate Metadata for a movie's box office detail page (/box-office/[slug]).
 * This page is distinct from the movie detail page — it focuses on collection data.
 */
export function generateBoxOfficeDetailMetadata(movie: {
  title: string;
  slug?: string;
  _id?: string;
  language?: string;
  releaseDate?: string;
  verdict?: string;
  boxOffice?: { opening?: string; firstWeek?: string; total?: string };
}): Metadata {
  const slugOrId  = movie.slug || String(movie._id);
  const canonical = buildBoxOfficeDetailCanonical(slugOrId);
  const year      = movie.releaseDate ? ` (${new Date(movie.releaseDate).getFullYear()})` : "";
  const lang      = movie.language || "Indian";
  const verdict   = movie.verdict && movie.verdict !== "Upcoming" ? ` Verdict: ${movie.verdict}.` : "";

  const total   = movie.boxOffice?.total   && movie.boxOffice.total   !== "TBA" ? movie.boxOffice.total   : "";
  const opening = movie.boxOffice?.opening && movie.boxOffice.opening !== "TBA" ? movie.boxOffice.opening : "";

  const title = `${movie.title}${year} Box Office Collection`;
  const description = (
    total
      ? `${movie.title}${year} box office collection: Total ₹${total}.${verdict} Day-wise net & gross earnings, first day collection and complete trade report on ${SITE_NAME}.`
      : opening
      ? `${movie.title}${year} opening day collection: ₹${opening}.${verdict} Complete day-wise box office breakdown on ${SITE_NAME}.`
      : `Complete box office collection report for ${lang} film ${movie.title}${year}.${verdict} Day-wise earnings and trade analysis on ${SITE_NAME}.`
  ).slice(0, 160);

  const keywords = [
    `${movie.title} box office`,
    `${movie.title} box office collection`,
    `${movie.title} collection`,
    `${movie.title} total collection`,
    `${movie.title} first day collection`,
    `${movie.title} hit or flop`,
    movie.verdict ? `${movie.title} ${movie.verdict.toLowerCase()}` : null,
    `${lang.toLowerCase()} box office`,
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

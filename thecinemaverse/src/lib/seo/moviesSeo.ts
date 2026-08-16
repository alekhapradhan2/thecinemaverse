// src/lib/seo/moviesSeo.ts
// ─────────────────────────────────────────────────────────────────────────────
// Movies listing page SEO — metadata for /movies, /movies/year/[year],
// and /movies/genre/[genre] pages.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import {
  buildMoviesCanonical,
  buildYearCanonical,
  buildGenreCanonical,
} from "@/lib/seoUtils/canonical";
import { SITE_NAME } from "@/lib/seoUtils/metadata";

const SITE_ORIGIN = "https://thecinemaverses.in";

export interface LangInfo {
  key: string;
  adjective: string;  // "Bollywood", "Bengali"
  short: string;      // "Hindi", "Bengali"
  industry: string;   // "Bollywood", "Bengali Cinema"
  locale?: string;    // "hi-IN"
}

/**
 * Generate Metadata for the main /movies listing page.
 * Adapts to active language filter.
 */
export function generateMoviesListingMetadata(lang: LangInfo, genre?: string): Metadata {
  const adj      = lang.adjective;
  const short    = lang.short;
  const industry = lang.industry;
  const canonical = buildMoviesCanonical(lang.key !== "hindi" ? lang.key : undefined);

  const title = genre
    ? `${genre} ${adj} Movies – Complete ${genre} Film List`
    : `${adj} Movies – Complete ${industry} Film Database`;

  const description = genre
    ? `Browse all ${genre.toLowerCase()} ${short.toLowerCase()} movies. Find your favourite ${adj.toLowerCase()} ${genre.toLowerCase()} films with cast, songs, box office collection and reviews on ${SITE_NAME}.`
    : `Browse the complete list of ${adj.toLowerCase()} movies. Filter by genre, year, verdict. Find ${short.toLowerCase()} films with full cast, songs, box office collection and reviews on ${SITE_NAME}.`;

  const keywords = [
    `${short.toLowerCase()} movies list`,
    `${adj} films`,
    `${short.toLowerCase()} cinema database`,
    `best ${short.toLowerCase()} movies`,
    `new ${short.toLowerCase()} movies`,
    `upcoming ${short.toLowerCase()} movies`,
    `${adj} blockbuster movies`,
    `latest ${adj} films`,
    genre ? `${genre.toLowerCase()} ${short.toLowerCase()} movies` : null,
  ].filter(Boolean) as string[];

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title, description, url: canonical,
      siteName: SITE_NAME, type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Generate Metadata for /movies/year/[year] pages.
 */
export function generateYearMoviesMetadata(year: number, lang?: LangInfo): Metadata {
  const adj        = lang?.adjective || "Indian";
  const short      = lang?.short     || "Indian";
  const industry   = lang?.industry  || "Indian Cinema";
  const canonical  = buildYearCanonical(year);
  const currentYear = new Date().getFullYear();
  const isRecent   = year >= currentYear - 1;

  const title = `${adj} Movies ${year} – Complete Film List & Box Office`;
  const description = isRecent
    ? `Complete list of all ${adj.toLowerCase()} movies releasing in ${year}. Latest ${short.toLowerCase()} films with cast, songs, release dates, box office collection and reviews on ${SITE_NAME}.`
    : `All ${adj.toLowerCase()} movies released in ${year}. Full ${industry} ${year} film list with cast, songs, box office collections and verdicts on ${SITE_NAME}.`;

  const keywords = [
    `${short.toLowerCase()} movies ${year}`,
    `${adj} movies ${year}`,
    `${adj} films ${year}`,
    `${short.toLowerCase()} box office ${year}`,
    `${industry} ${year}`,
    `movies list ${year}`,
    `${adj} upcoming movies ${year}`,
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title, description, url: canonical,
      siteName: SITE_NAME, type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/**
 * Generate Metadata for /movies/genre/[genre] pages.
 */
export function generateGenreMoviesMetadata(genre: string, lang?: LangInfo): Metadata {
  const adj      = lang?.adjective || "Indian";
  const short    = lang?.short     || "Indian";
  const canonical = buildGenreCanonical(genre);
  const title     = `${genre} ${adj} Movies – Best ${genre} Films`;
  const description = `Explore the best ${genre.toLowerCase()} ${short.toLowerCase()} movies. Complete list with cast, songs, box office collections, reviews and more on ${SITE_NAME}.`;

  const keywords = [
    `${genre.toLowerCase()} ${short.toLowerCase()} movies`,
    `${genre.toLowerCase()} ${adj} films`,
    `best ${genre.toLowerCase()} Indian movies`,
    `Indian ${genre.toLowerCase()} cinema`,
    `${genre.toLowerCase()} movie list`,
  ];

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title, description, url: canonical,
      siteName: SITE_NAME, type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

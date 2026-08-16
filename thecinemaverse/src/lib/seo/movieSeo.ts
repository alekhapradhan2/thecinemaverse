// src/lib/seo/movieSeo.ts
// ─────────────────────────────────────────────────────────────────────────────
// Movie page SEO — metadata generation for /movie/[slug] pages.
// Imports shared utilities from seoUtils/ for BCP47, canonical, and schema.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { buildMovieCanonical }         from "@/lib/seoUtils/canonical";
import { toOGLocale }                   from "@/lib/seoUtils/language";
import { isSynopsisUsable, SITE_NAME }  from "@/lib/seoUtils/metadata";

const SITE_ORIGIN = "https://thecinemaverses.in";

// ─── Bad synopsis guard ───────────────────────────────────────────────────────

const BAD_SYNOPSIS_PATTERNS: RegExp[] = [
  /^the following is a list/i,
  /^this is a list of/i,
  /^wikipedia/i,
  /^this article/i,
  /^this page/i,
  /^for other uses/i,
  /^may refer to/i,
  /^refers to/i,
];

function isCleanSynopsis(synopsis?: string | null): boolean {
  if (!synopsis || synopsis.trim().length < 40) return false;
  return !BAD_SYNOPSIS_PATTERNS.some(p => p.test(synopsis.trim()));
}

// ─── Title builder ────────────────────────────────────────────────────────────

/**
 * Build a unique, natural movie page title.
 * Does NOT append "| The Cinema Verse" — layout.tsx template handles that.
 *
 * Format: {Movie Name} ({Year}) – Cast, Songs & Box Office[ | OTT info]
 */
export function buildMovieTitle(movie: {
  title: string;
  releaseDate?: string;
  streamingOn?: string;
  ottReleaseDate?: string;
}): string {
  const year    = movie.releaseDate ? ` (${new Date(movie.releaseDate).getFullYear()})` : "";
  const now     = new Date();
  const ottDate = movie.ottReleaseDate;

  let ottSuffix = "";
  if (movie.streamingOn) {
    const isTBA     = ottDate === "TBA";
    const isLive    = !isTBA && (!ottDate || new Date(ottDate) <= now);
    const isComing  = !isTBA && !!ottDate && new Date(ottDate) > now;
    if (isLive)   ottSuffix = ` | Now on ${movie.streamingOn}`;
    if (isComing) {
      const fmtDate = new Date(ottDate!).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      ottSuffix = ` | OTT ${fmtDate}`;
    }
    if (isTBA)    ottSuffix = " | OTT Release Soon";
  }

  return `${movie.title}${year} – Cast, Songs & Box Office${ottSuffix}`;
}

// ─── Description builder ──────────────────────────────────────────────────────

/**
 * Build a unique meta description for a movie page.
 * Uses the synopsis if it is clean. Falls back to a structured description
 * built from real available data fields.
 */
export function buildMovieDescription(movie: {
  title: string;
  synopsis?: string;
  language?: string;
  releaseDate?: string;
  genre?: string[];
  director?: string;
  streamingOn?: string;
  ottReleaseDate?: string;
}): string {
  const year    = movie.releaseDate ? ` (${new Date(movie.releaseDate).getFullYear()})` : "";
  const lang    = movie.language || "Indian";
  const now     = new Date();
  const ottDate = movie.ottReleaseDate;

  let ottPart = "";
  if (movie.streamingOn) {
    const isTBA    = ottDate === "TBA";
    const isLive   = !isTBA && (!ottDate || new Date(ottDate) <= now);
    const isComing = !isTBA && !!ottDate && new Date(ottDate) > now;
    if (isLive)   ottPart = ` Now streaming on ${movie.streamingOn}.`;
    if (isComing) {
      const fmtDate = new Date(ottDate!).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      ottPart = ` OTT release on ${movie.streamingOn} from ${fmtDate}.`;
    }
    if (isTBA)    ottPart = ` OTT release on ${movie.streamingOn} — date to be announced.`;
  }

  if (isCleanSynopsis(movie.synopsis)) {
    return (movie.synopsis!.slice(0, 130) + ottPart).slice(0, 160);
  }

  // Structured fallback
  const genrePart = movie.genre?.length ? `${movie.genre.slice(0, 2).join("/")} ` : "";
  const dirPart   = movie.director ? ` Directed by ${movie.director}.` : "";
  return (
    `Complete info about ${genrePart}${lang} film ${movie.title}${year}.${dirPart}${ottPart} Cast, songs, box office collection & reviews on The Cinema Verse.`
  ).slice(0, 160);
}

// ─── Full metadata builder ────────────────────────────────────────────────────

/**
 * Generate Next.js Metadata for a movie detail page.
 * Call from generateMetadata() in app/movie/[slug]/page.tsx.
 */
export function generateMovieMetadata(
  movie: any,
  keywords: string[]
): Metadata {
  const title       = buildMovieTitle(movie);
  const description = buildMovieDescription(movie);
  const canonical   = buildMovieCanonical(movie.slug || movie._id);
  const ogLocale    = toOGLocale(movie.language);
  const image       = movie.posterUrl || movie.thumbnailUrl || `${SITE_ORIGIN}/default.jpg`;

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(SITE_ORIGIN),
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-snippet": -1,
        "max-image-preview": "large",
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "video.movie",
      locale: ogLocale,
      images: [{
        url: movie.bannerUrl || image,
        width: 1200,
        height: 630,
        alt: `${movie.title} — ${SITE_NAME}`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

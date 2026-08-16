// src/lib/seo/songSeo.ts
// ─────────────────────────────────────────────────────────────────────────────
// Song page SEO — metadata generation for /songs/[movieSlug]/[songIndex] pages.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { buildSongCanonical } from "@/lib/seoUtils/canonical";
import { SITE_NAME }          from "@/lib/seoUtils/metadata";

const SITE_ORIGIN = "https://thecinemaverses.in";

/**
 * Build a unique, natural title for a song detail page.
 * Format: {Song} by {Singer} – {Movie} ({Year}) {Industry} Song
 */
export function buildSongTitle(song: {
  title: string;
  singer?: string;
}, movie: {
  title: string;
  releaseDate?: string;
  language?: string;
}): string {
  const year      = movie.releaseDate ? ` (${new Date(movie.releaseDate).getFullYear()})` : "";
  const lang      = movie.language || "Hindi";
  const industry  = lang === "Hindi" ? "Bollywood" : lang;
  const singerStr = song.singer ? ` by ${song.singer}` : "";
  return `${song.title}${singerStr} – ${movie.title}${year} ${industry} Song`;
}

/**
 * Build a meta description for a song detail page.
 */
export function buildSongDescription(song: {
  title: string;
  singer?: string;
  musicDirector?: string;
  lyrics?: string;
  description?: string;
}, movie: {
  title: string;
  releaseDate?: string;
  language?: string;
}): string {
  const year     = movie.releaseDate ? ` (${new Date(movie.releaseDate).getFullYear()})` : "";
  const lang     = movie.language || "Hindi";
  const industry = lang === "Hindi" ? "Bollywood" : lang;

  const parts: string[] = [
    `Listen to "${song.title}"${song.singer ? ` by ${song.singer}` : ""} from the ${lang.toLowerCase()} film "${movie.title}"${year}.`,
  ];
  if (song.lyrics?.trim()) parts.push("Read the full lyrics.");
  if (song.description?.trim()) parts.push(song.description.slice(0, 80));
  parts.push(`Watch on YouTube, explore the full playlist and related ${industry.toLowerCase()} songs on ${SITE_NAME}.`);

  return parts.join(" ").replace(/\s+/g, " ").trim().slice(0, 160);
}

/**
 * Generate Next.js Metadata for a song detail page.
 */
export function generateSongMetadata(
  song: any,
  movie: any,
  songIndex: number
): Metadata {
  const title     = buildSongTitle(song, movie);
  const desc      = buildSongDescription(song, movie);
  const canonical = buildSongCanonical(movie.slug || movie._id, songIndex);
  const lang      = movie.language || "Hindi";
  const industry  = lang === "Hindi" ? "Bollywood" : lang;
  const year      = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "";

  const thumb =
    song.thumbnailUrl ||
    (song.ytId ? `https://img.youtube.com/vi/${song.ytId}/hqdefault.jpg` : null) ||
    movie.posterUrl ||
    `${SITE_ORIGIN}/default.jpg`;

  const keywords = [
    song.title,
    `${song.title} lyrics`,
    `${song.title} song`,
    song.singer && `${song.singer} songs`,
    song.musicDirector && `${song.musicDirector} music`,
    `${movie.title} songs`,
    `${movie.title} album`,
    `${industry.toLowerCase()} song`,
    year && `${industry.toLowerCase()} songs ${year}`,
    ...(movie.genre || []).map((g: string) => `${g} ${lang.toLowerCase()} film`),
  ].filter(Boolean) as string[];

  return {
    title,
    description: desc,
    keywords,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: desc,
      url: canonical,
      siteName: SITE_NAME,
      type: "music.song",
      images: [{ url: thumb, width: 1280, height: 720, alt: `${song.title} – ${movie.title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [thumb],
    },
  };
}

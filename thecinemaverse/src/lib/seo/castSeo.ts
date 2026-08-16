// src/lib/seo/castSeo.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cast/Actor page SEO — metadata generation for /cast/[id] pages.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { buildCastCanonical }   from "@/lib/seoUtils/canonical";
import { SITE_NAME }            from "@/lib/seoUtils/metadata";

const SITE_ORIGIN = "https://thecinemaverses.in";

/**
 * Build a unique title for a cast profile page.
 * Does NOT append "| The Cinema Verse" — layout.tsx handles that.
 *
 * Format: {Name} – Indian {Role} | Biography, Films & Career
 */
export function buildCastTitle(person: {
  name: string;
  roles?: string[];
  type?: string;
}, derivedRoles?: string[]): string {
  const roleArr = derivedRoles || person.roles || [person.type || "Artist"];
  const roles   = roleArr.filter(r => r.toLowerCase() !== "other").slice(0, 2).join(" & ");
  return `${person.name} – Indian ${roles || "Artist"} | Biography, Films & Career`;
}

/**
 * Build a meta description for a cast/actor profile.
 * Uses bio if available; builds from facts otherwise.
 */
export function buildCastDescription(person: {
  name: string;
  bio?: string;
  type?: string;
}, derivedRoles: string[], movies: any[]): string {
  if (person.bio && person.bio.trim().length > 60) {
    return person.bio.trim().slice(0, 160);
  }

  const roles      = derivedRoles.filter(r => r.toLowerCase() !== "other").join(" and ");
  const movieCount = movies.length;
  const debutYear  = movieCount
    ? new Date(movies[movies.length - 1].releaseDate || Date.now()).getFullYear()
    : null;

  return (
    `${person.name} is an Indian ${roles || "artist"}${debutYear ? `, active in Indian cinema since ${debutYear}` : ""} with ${movieCount} film${movieCount !== 1 ? "s" : ""}. Discover full biography, filmography, songs and career on The Cinema Verse.`
  ).slice(0, 160);
}

/**
 * Generate Next.js Metadata for a cast profile page.
 */
export function generateCastMetadata(
  person: any,
  movies: any[],
  derivedRoles: string[]
): Metadata {
  const title       = buildCastTitle(person, derivedRoles);
  const description = buildCastDescription(person, derivedRoles, movies);
  const canonical   = buildCastCanonical(String(person._id));
  const roles       = derivedRoles.join(", ");
  const genres      = [...new Set(movies.flatMap((m: any) => m.genre || []))].slice(0, 3).join(", ");

  const keywords = [
    person.name,
    `${person.name} movies`,
    `${person.name} biography`,
    `${person.name} filmography`,
    `${person.name} Indian film`,
    `Indian ${(person.type || "artist").toLowerCase()}`,
    "Indian cinema cast",
    genres,
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "profile",
      images: person.photo
        ? [{ url: person.photo, width: 800, height: 1000, alt: person.name }]
        : [{ url: `${SITE_ORIGIN}/default.jpg`, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [person.photo || `${SITE_ORIGIN}/default.jpg`],
    },
  };
}

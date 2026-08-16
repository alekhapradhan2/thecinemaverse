// src/lib/seoUtils/metadata.ts
// ─────────────────────────────────────────────────────────────────────────────
// Title and description sanitizers for all page types.
// These prevent common SEO catastrophes: duplicate site names, null/undefined
// in meta tags, Wikipedia-sourced text in descriptions, over-length titles.
// ─────────────────────────────────────────────────────────────────────────────

import { SITE_ORIGIN } from "./canonical";

export const SITE_NAME = "The Cinema Verse";

// ─── Bad content pattern guards ───────────────────────────────────────────────

/**
 * Patterns that indicate a synopsis is NOT a real movie description.
 * These are typically Wikipedia disambiguation page snippets that ended up
 * in the movie.synopsis field via bad data import.
 */
export const BAD_SYNOPSIS_PATTERNS: RegExp[] = [
  /^the following is a list/i,
  /^this is a list of/i,
  /^wikipedia/i,
  /^this article/i,
  /^this page/i,
  /^for other uses/i,
  /^may refer to/i,
  /^is a \d{4} indian/i, // extremely thin auto-generated stubs
  /^refers to/i,
  /^\s*$/,
];

/** Minimum character length for a synopsis to be considered usable */
export const MIN_SYNOPSIS_LENGTH = 40;

/**
 * Returns true if the synopsis is a genuine, usable movie description.
 * Returns false if the synopsis is empty, too short, or matches a bad pattern.
 */
export function isSynopsisUsable(synopsis?: string | null): boolean {
  if (!synopsis) return false;
  const trimmed = synopsis.trim();
  if (trimmed.length < MIN_SYNOPSIS_LENGTH) return false;
  return !BAD_SYNOPSIS_PATTERNS.some(p => p.test(trimmed));
}

// ─── Title sanitizers ────────────────────────────────────────────────────────

/**
 * Strips the site name suffix from a raw title string.
 * Prevents double-appended site names like "Movie | The Cinema Verse | The Cinema Verse".
 * Safe to call multiple times — idempotent.
 */
export function stripSiteName(title: string): string {
  return title
    .replace(/\s*\|\s*The Cinema Verse\s*$/i, "")
    .replace(/\s*–\s*The Cinema Verse\s*$/i, "")
    .trim();
}

/**
 * Sanitize and truncate a page title.
 * - Strips site name suffix (the template in layout.tsx auto-appends it)
 * - Collapses extra whitespace
 * - Truncates at maxLen characters (Google truncates at ~60 chars)
 */
export function sanitizeTitle(
  raw: string,
  maxLen = 60
): string {
  if (!raw) return "";
  const clean = stripSiteName(raw)
    .replace(/\s{2,}/g, " ")
    .trim();
  return clean.length > maxLen ? clean.slice(0, maxLen - 1).trimEnd() + "…" : clean;
}

// ─── Description sanitizers ──────────────────────────────────────────────────

/**
 * Sanitize a meta description.
 * - Removes null/undefined tokens
 * - Collapses whitespace
 * - Truncates at maxLen (Google truncates at ~160 chars)
 * - Falls back to fallback if raw is empty/bad
 */
export function sanitizeDescription(
  raw: string | null | undefined,
  fallback: string,
  maxLen = 160
): string {
  const source = (raw || "").trim();
  // Reject null/undefined/object tokens that leaked into metadata
  if (!source || source === "null" || source === "undefined" || source === "[object Object]") {
    return sanitizeDescription(fallback, fallback, maxLen);
  }
  const clean = source.replace(/\s{2,}/g, " ").trim();
  if (clean.length < 10) return sanitizeDescription(fallback, fallback, maxLen);
  return clean.length > maxLen ? clean.slice(0, maxLen - 1).trimEnd() + "…" : clean;
}

/**
 * Build a clean, SEO-safe description for a movie page.
 * Tries synopsis first, falls back to a structured description built from
 * available movie fields.
 */
export function buildMovieDescription(movie: {
  title: string;
  synopsis?: string;
  language?: string;
  releaseDate?: string;
  genre?: string[];
  director?: string;
  verdict?: string;
}): string {
  const year = movie.releaseDate
    ? ` (${new Date(movie.releaseDate).getFullYear()})`
    : "";
  const lang = movie.language || "Indian";

  if (isSynopsisUsable(movie.synopsis)) {
    return sanitizeDescription(movie.synopsis, "", 160);
  }

  // Structured fallback built from real data
  const parts: string[] = [
    `Complete info about ${lang} film ${movie.title}${year}.`,
  ];
  if (movie.genre?.length) {
    parts.push(`${movie.genre.slice(0, 2).join("/")} ${lang.toLowerCase()} movie.`);
  }
  if (movie.director) {
    parts.push(`Directed by ${movie.director}.`);
  }
  parts.push("Cast, songs, box office collection & reviews on The Cinema Verse.");

  return sanitizeDescription(parts.join(" "), parts[0], 160);
}

/**
 * Build a clean SEO description for a cast/actor page.
 */
export function buildCastDescription(person: {
  name: string;
  bio?: string;
  roles?: string[];
  movieCount?: number;
  debutYear?: number | null;
}): string {
  if (person.bio && person.bio.trim().length > 60) {
    return sanitizeDescription(person.bio, "", 160);
  }
  const roles = (person.roles || ["Artist"]).join(" and ");
  const moviePart = person.movieCount ? ` Known for ${person.movieCount} films.` : "";
  const debutPart = person.debutYear ? ` Active since ${person.debutYear}.` : "";
  return sanitizeDescription(
    `${person.name} is an Indian ${roles.toLowerCase()}.${moviePart}${debutPart} Full biography, filmography & career on The Cinema Verse.`,
    `${person.name} — Indian ${roles.toLowerCase()}. Filmography, biography & career on The Cinema Verse.`,
    160
  );
}

/**
 * Build a clean SEO description for a blog article.
 */
export function buildBlogDescription(blog: {
  title: string;
  excerpt?: string;
  seoDesc?: string;
  content?: string;
}): string {
  const best = blog.seoDesc || blog.excerpt || "";
  if (best.trim().length > 40) {
    return sanitizeDescription(best, "", 160);
  }
  // Extract first sentence from content if HTML
  if (blog.content) {
    const stripped = blog.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (stripped.length > 40) {
      return sanitizeDescription(stripped, blog.title, 160);
    }
  }
  return sanitizeDescription(blog.title, blog.title, 160);
}

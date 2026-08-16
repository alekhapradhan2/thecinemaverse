// src/lib/seoUtils/canonical.ts
// ─────────────────────────────────────────────────────────────────────────────
// Single canonical URL builder for all page types.
// Every canonical in the app must use these functions to ensure consistency
// between: <link rel="canonical">, sitemap URLs, JSON-LD urls, and OG urls.
// ─────────────────────────────────────────────────────────────────────────────

export const SITE_ORIGIN = "https://thecinemaverses.in";

/**
 * Build an absolute canonical URL from a relative path.
 * Always returns https:// canonical without trailing slash (except root "/").
 * @param path - e.g. "/movie/some-slug" or "movie/some-slug"
 */
export function buildCanonical(path: string): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Remove trailing slash except for root
  const normalized = cleanPath === "/" ? cleanPath : cleanPath.replace(/\/$/, "");
  return `${SITE_ORIGIN}${normalized}`;
}

/** Canonical URL for a movie detail page */
export function buildMovieCanonical(slugOrId: string): string {
  return buildCanonical(`/movie/${slugOrId}`);
}

/** Canonical URL for a cast/actor detail page */
export function buildCastCanonical(id: string): string {
  return buildCanonical(`/cast/${id}`);
}

/** Canonical URL for a blog article */
export function buildBlogCanonical(slug: string): string {
  return buildCanonical(`/blog/${slug}`);
}

/** Canonical URL for a song detail page */
export function buildSongCanonical(movieSlug: string, songIndex: number): string {
  return buildCanonical(`/songs/${movieSlug}/${songIndex}`);
}

/** Canonical URL for a box office movie detail page */
export function buildBoxOfficeDetailCanonical(movieSlug: string): string {
  return buildCanonical(`/box-office/${movieSlug}`);
}

/** Canonical URL for the box office listing page (with optional year) */
export function buildBoxOfficeCanonical(year?: number | string): string {
  return year
    ? buildCanonical(`/box-office?year=${year}`)
    : buildCanonical("/box-office");
}

/** Canonical URL for a genre page */
export function buildGenreCanonical(genre: string): string {
  return buildCanonical(`/movies/genre/${encodeURIComponent(genre.toLowerCase())}`);
}

/** Canonical URL for a year page */
export function buildYearCanonical(year: number | string): string {
  return buildCanonical(`/movies/year/${year}`);
}

/** Canonical URL for the movies listing page (with optional lang filter) */
export function buildMoviesCanonical(lang?: string): string {
  return lang ? buildCanonical(`/movies?lang=${lang}`) : buildCanonical("/movies");
}

/** Canonical URL for a blog category page */
export function buildBlogCategoryCanonical(category: string): string {
  return buildCanonical(`/blog?category=${encodeURIComponent(category)}`);
}

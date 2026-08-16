// src/lib/seo.ts
// ─────────────────────────────────────────────────────────────────────────────
// SHARED SEO utilities — only common/reusable helpers live here.
// Page-specific SEO logic lives in the corresponding module:
//   src/lib/seo/movieSeo.ts    — movie detail pages
//   src/lib/seo/castSeo.ts     — cast/actor profile pages
//   src/lib/seo/songSeo.ts     — song detail pages
//   src/lib/seo/blogSeo.ts     — blog/article pages
//   src/lib/seo/boxOfficeSeo.ts — box office pages
//   src/lib/seo/moviesSeo.ts   — movies listing/genre/year pages
//
// Schema builders → src/lib/seoUtils/schemaBuilder.ts
// Canonical URLs → src/lib/seoUtils/canonical.ts
// Language codes → src/lib/seoUtils/language.ts
// Validation     → src/lib/seoUtils/validation.ts
// ─────────────────────────────────────────────────────────────────────────────

import { LANGUAGES, DEFAULT_LANGUAGE, LanguageConfig } from "@/lib/languages";

export const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  || "https://thecinemaverses.in";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "The Cinema Verse";

// ─── Title builder ────────────────────────────────────────────────────────────

/**
 * Build a page <title>.
 * NOTE: The root layout.tsx already uses template: `%s | The Cinema Verse`.
 * This helper is for page-specific titles only — do NOT append site name here.
 * Use this when you want to set a standalone title without the template suffix.
 */
export function buildTitle(pageTitle: string): string {
  return `${pageTitle} | ${SITE_NAME}`;
}

// ─── Shared metadata builder ──────────────────────────────────────────────────

/**
 * Build a standard metadata object for simpler pages (about, contact, etc.).
 * For complex pages (movie, cast, blog), use the page-specific SEO modules.
 *
 * NOTE: Does NOT generate ?lang= hreflang alternates.
 * ?lang= pages are filter pages, not true language translations.
 * Generating hreflang for them creates incorrect signals for Google.
 */
export function buildMeta({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  locale = "en_IN",
}: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  locale?: string;
  /** @deprecated Use the specific SEO modules instead of passing activeLang here */
  activeLang?: LanguageConfig;
}) {
  const baseUrl    = SITE_URL.replace(/\/$/, "");
  const cleanUrl   = url ? url.replace(/^\//, "") : "";
  const ogImage    = image || `${baseUrl}/og-default.jpg`;
  const canonical  = url ? `${baseUrl}/${cleanUrl}` : baseUrl;

  return {
    title,
    description,
    keywords: keywords?.join(", "),
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type,
      locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

// ─── Language SEO copy helper ────────────────────────────────────────────────

/**
 * Returns language-aware SEO copy strings for use in generateMetadata().
 * Safe to call with any LanguageConfig from src/lib/languages.ts.
 * Defaults to Bollywood terms if lang is not provided.
 */
export function getLangMeta(lang?: {
  adjective: string;
  industry: string;
  locale?: string;
}) {
  const adj      = lang?.adjective ?? "Bollywood";
  const industry = lang?.industry  ?? "Bollywood";
  const loc      = lang?.locale    ?? "en_IN";
  return {
    adj,
    industry,
    loc,
    movies:          `${adj} Movies`,
    actors:          `${adj} Actors`,
    actresses:       `${adj} Actresses`,
    songs:           `${adj} Songs`,
    boxOffice:       `${adj} Box Office`,
    news:            `${adj} News`,
    latestMovies:    `Latest ${adj} Movies`,
    upcomingMovies:  `Upcoming ${adj} Movies`,
    currentRunning:  `Currently Running ${adj} Movies`,
  };
}

// ─── Legacy schema builders (kept for backwards compatibility) ────────────────
// These are deprecated in favour of src/lib/seoUtils/schemaBuilder.ts.
// Existing callers will continue to work. New code should use schemaBuilder.ts.

/** @deprecated Use buildMovieSchema() from @/lib/seoUtils/schemaBuilder */
export function movieJsonLd(movie: any) {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const langMap: Record<string, string> = {
    Hindi: "hi", Bengali: "bn", Telugu: "te", Tamil: "ta",
    Malayalam: "ml", Marathi: "mr", Kannada: "kn", Punjabi: "pa",
    Odia: "or", Gujarati: "gu",
  };
  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.synopsis,
    url: `${baseUrl}/movie/${movie.slug}`,
    image: movie.posterUrl || movie.thumbnailUrl,
    datePublished: movie.releaseDate,
    inLanguage: langMap[movie.language] || "hi",
    director: movie.director ? { "@type": "Person", name: movie.director } : undefined,
    genre: movie.genre,
    duration: movie.runtime,
    aggregateRating:
      movie.reviews?.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: (
              movie.reviews.reduce((s: number, r: any) => s + (r.rating || 0), 0) /
              movie.reviews.length
            ).toFixed(1),
            reviewCount: movie.reviews.length,
            bestRating: 10,
          }
        : undefined,
  };
}

/** @deprecated Use buildArticleSchema() from @/lib/seoUtils/schemaBuilder */
export function articleJsonLd(blog: any) {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.excerpt || blog.seoDesc,
    url: `${baseUrl}/blog/${blog.slug}`,
    image: blog.coverImage,
    inLanguage: blog.language || "hi",
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt,
    author: { "@type": "Organization", name: blog.author || SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${baseUrl}/logo.png` },
    },
  };
}

/** @deprecated Use buildPersonSchema() from @/lib/seoUtils/schemaBuilder */
export function personJsonLd(cast: any) {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: cast.name,
    description: cast.bio,
    url: `${baseUrl}/cast/${cast._id}`,
    image: cast.photo,
    jobTitle: cast.type || (cast.roles || []).join(", "),
    sameAs: [cast.website, cast.instagram].filter(Boolean),
  };
}

/** @deprecated Use buildBreadcrumbSchema() from @/lib/seoUtils/schemaBuilder */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => {
      const cleanUrl = item.url ? item.url.replace(/^\//, "") : "";
      // If already absolute, use as-is
      const href = item.url.startsWith("http") ? item.url : `${baseUrl}/${cleanUrl}`;
      return {
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: href,
      };
    }),
  };
}

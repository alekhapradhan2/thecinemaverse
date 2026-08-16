// src/lib/seoUtils/schemaBuilder.ts
// ─────────────────────────────────────────────────────────────────────────────
// Centralized JSON-LD structured data builders for all page types.
// All schema functions:
//   - Use valid schema.org types and properties
//   - Output valid BCP47 for inLanguage
//   - Never invent or fabricate data
//   - Gracefully handle missing fields
//   - Are pure functions (no side effects)
// ─────────────────────────────────────────────────────────────────────────────

import { toBCP47 } from "./language";
import { SITE_ORIGIN, buildMovieCanonical, buildCastCanonical, buildBlogCanonical } from "./canonical";
import { SITE_NAME } from "./metadata";

// ─── Website & Organization ───────────────────────────────────────────────────

/** schema.org/WebSite — enables Google Sitelinks Search Box */
export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_ORIGIN,
    description: "India's most complete online encyclopedia for Indian movies, cast, songs, and box office collections.",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_ORIGIN}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

/** schema.org/Organization — publisher/brand signal */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_ORIGIN,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_ORIGIN}/logo.png`,
      width: 280,
      height: 60,
    },
    sameAs: [
      "https://www.facebook.com/thecinemaverse",
      "https://twitter.com/thecinemaverse",
      "https://www.instagram.com/thecinemaverse",
    ],
  };
}

// ─── BreadcrumbList ───────────────────────────────────────────────────────────

export interface BreadcrumbItem { name: string; url: string }

/**
 * Build a schema.org/BreadcrumbList.
 * Every item URL must be absolute. Relative paths are resolved against SITE_ORIGIN.
 */
export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => {
      const url = item.url.startsWith("http")
        ? item.url
        : `${SITE_ORIGIN}${item.url.startsWith("/") ? item.url : `/${item.url}`}`;
      return {
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: url,
      };
    }),
  };
}

// ─── Movie ────────────────────────────────────────────────────────────────────

export interface MovieSchemaOptions {
  movie: {
    title: string;
    slug?: string;
    _id?: string;
    synopsis?: string;
    language?: string;
    releaseDate?: string;
    genre?: string[];
    posterUrl?: string;
    thumbnailUrl?: string;
    runtime?: string;
    contentRating?: string;
    imdbRating?: string;
    imdbVotes?: string;
    reviews?: { rating?: number }[];
    cast?: { name: string; castId?: string; role?: string; type?: string }[];
    streamingOn?: string;
    streamingUrl?: string;
    ottReleaseDate?: string;
    _allProductionNames?: string[];
  };
  directorName?: string;
  producerName?: string;
  avgRating?: number | null;
}

/**
 * Build an enriched schema.org/Movie object.
 * - Uses BCP47 for inLanguage
 * - Only includes aggregateRating if there are real reviews
 * - Only includes WatchAction if the movie is actually streaming
 */
export function buildMovieSchema({ movie, directorName, producerName, avgRating }: MovieSchemaOptions) {
  const canonical = buildMovieCanonical(movie.slug || String(movie._id));
  const bcp47     = toBCP47(movie.language);

  // Actor objects — only non-crew members, max 10
  const actorObjects = (movie.cast || [])
    .filter(m => {
      const r = ((m.role || "") + " " + (m.type || "")).toLowerCase();
      const crewKeywords = ["director", "producer", "writer", "cinematographer", "editor", "music"];
      const actingKeywords = ["actor", "actress", "lead", "hero", "heroine", "supporting", "cameo"];
      if (actingKeywords.some(k => r.includes(k))) return true;
      if (crewKeywords.some(k => r.includes(k))) return false;
      return true; // Default: treat as actor
    })
    .slice(0, 10)
    .map(m => ({
      "@type": "Person",
      name: m.name,
      ...(m.castId ? { url: buildCastCanonical(String(m.castId)) } : {}),
    }));

  // Director object
  const directorObj = directorName
    ? (() => {
        const dirEntry = (movie.cast || []).find(c =>
          (c.role || c.type || "").toLowerCase().includes("director") &&
          !(c.role || c.type || "").toLowerCase().includes("music") &&
          !(c.role || c.type || "").toLowerCase().includes("art") &&
          !(c.role || c.type || "").toLowerCase().includes("action")
        );
        return [{
          "@type": "Person",
          name: directorName,
          ...(dirEntry?.castId ? { url: buildCastCanonical(String(dirEntry.castId)) } : {}),
        }];
      })()
    : undefined;

  // AggregateRating — only if there are real user reviews with numeric ratings
  const ratedReviews = (movie.reviews || []).filter(r => typeof r.rating === "number" && r.rating > 0);
  const aggregateRating = (avgRating !== null && avgRating !== undefined && ratedReviews.length > 0)
    ? {
        "@type": "AggregateRating",
        ratingValue: (avgRating as number).toFixed(1),
        bestRating: "10",
        worstRating: "1",
        reviewCount: String(ratedReviews.length),
      }
    : undefined;

  // WatchAction — only if a streaming URL is present and OTT date has passed
  const now = new Date();
  const ottDate = movie.ottReleaseDate;
  const isOttLive = ottDate !== "TBA" && (!ottDate || new Date(ottDate) <= now);
  const watchAction = (movie.streamingOn && movie.streamingUrl && isOttLive)
    ? {
        "@type": "WatchAction",
        target: movie.streamingUrl,
        actionAccessibilityRequirement: {
          "@type": "ActionAccessSpecification",
          category: "subscription",
          availabilityStarts: ottDate && ottDate !== "TBA"
            ? new Date(ottDate).toISOString()
            : now.toISOString(),
          eligibleRegion: { "@type": "Country", name: "IN" },
          requiresSubscription: { "@type": "MediaSubscription", name: movie.streamingOn },
        },
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    url: canonical,
    ...(movie.posterUrl || movie.thumbnailUrl ? { image: movie.posterUrl || movie.thumbnailUrl } : {}),
    ...(movie.synopsis?.trim() ? { description: movie.synopsis.slice(0, 300) } : {}),
    ...(movie.releaseDate ? { datePublished: movie.releaseDate } : {}),
    inLanguage: bcp47,
    countryOfOrigin: { "@type": "Country", name: "India" },
    ...(movie.contentRating ? { contentRating: movie.contentRating } : {}),
    ...(movie.genre?.length ? { genre: movie.genre } : {}),
    ...(actorObjects.length ? { actor: actorObjects } : {}),
    ...(directorObj ? { director: directorObj } : {}),
    ...(producerName ? { producer: { "@type": "Person", name: producerName } } : {}),
    ...(aggregateRating ? { aggregateRating } : {}),
    ...(movie._allProductionNames?.length
      ? { productionCompany: movie._allProductionNames.map(name => ({ "@type": "Organization", name })) }
      : {}),
    ...(watchAction ? { potentialAction: watchAction } : {}),
  };
}

// ─── Person (Cast/Actor) ──────────────────────────────────────────────────────

export interface PersonSchemaOptions {
  person: {
    _id: string;
    name: string;
    bio?: string;
    photo?: string;
    dob?: string;
    location?: string;
    website?: string;
    instagram?: string;
    type?: string;
    roles?: string[];
  };
  derivedRoles?: string[];
  movies?: { title: string; slug?: string; _id?: string }[];
}

/** Build a schema.org/Person object for a cast/actor profile page */
export function buildPersonSchema({ person, derivedRoles, movies }: PersonSchemaOptions) {
  const canonical = buildCastCanonical(String(person._id));
  const roles     = derivedRoles || person.roles || [person.type || "Artist"];

  const knownFor = (movies || []).slice(0, 5).map(m => ({
    "@type": "Movie",
    name: m.title,
    url: `${SITE_ORIGIN}/movie/${m.slug || m._id}`,
  }));

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: person.name,
    url: canonical,
    ...(person.bio?.trim() ? { description: person.bio.slice(0, 300) } : {}),
    ...(person.photo ? { image: person.photo } : {}),
    ...(person.dob ? { birthDate: person.dob } : {}),
    ...(person.location ? { birthPlace: { "@type": "Place", name: person.location } } : {}),
    jobTitle: roles.join(", "),
    sameAs: [person.website, person.instagram].filter(Boolean),
    ...(knownFor.length ? { knowsAbout: knownFor } : {}),
  };
}

// ─── Article (Blog) ───────────────────────────────────────────────────────────

export interface ArticleSchemaOptions {
  blog: {
    title: string;
    slug: string;
    excerpt?: string;
    seoDesc?: string;
    content?: string;
    coverImage?: string;
    language?: string;
    author?: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
    category?: string;
  };
}

/** Build a schema.org/Article + NewsArticle dual-type for blog posts */
export function buildArticleSchema({ blog }: ArticleSchemaOptions) {
  const canonical = buildBlogCanonical(blog.slug);
  const bcp47     = toBCP47(blog.language);
  const headline  = blog.title.slice(0, 110); // schema.org max for headline
  const description = (blog.seoDesc || blog.excerpt || "").slice(0, 300);

  return {
    "@context": "https://schema.org",
    "@type": ["Article", "NewsArticle"],
    headline,
    ...(description ? { description } : {}),
    url: canonical,
    ...(blog.coverImage ? { image: { "@type": "ImageObject", url: blog.coverImage } } : {}),
    inLanguage: bcp47,
    ...(blog.createdAt ? { datePublished: new Date(blog.createdAt as string).toISOString() } : {}),
    ...(blog.updatedAt ? { dateModified: new Date(blog.updatedAt as string).toISOString() } : {}),
    author: {
      "@type": "Organization",
      name: blog.author || SITE_NAME,
      url: SITE_ORIGIN,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_ORIGIN,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_ORIGIN}/logo.png`,
        width: 280,
        height: 60,
      },
    },
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_ORIGIN },
    ...(blog.category ? { articleSection: blog.category } : {}),
  };
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────

export interface FaqItem { question: string; answer: string }

/** Build a schema.org/FAQPage from an array of Q&A pairs */
export function buildFaqSchema(items: FaqItem[]) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(item => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

// ─── ItemList ─────────────────────────────────────────────────────────────────

export interface ListItem { name: string; url: string; position?: number }

/** Build a schema.org/ItemList (for related movies, blog lists, etc.) */
export function buildItemListSchema(name: string, items: ListItem[]) {
  if (!items.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: item.position ?? i + 1,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${SITE_ORIGIN}${item.url}`,
    })),
  };
}

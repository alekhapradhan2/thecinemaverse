import { LANGUAGES, DEFAULT_LANGUAGE, LanguageConfig } from "@/lib/languages";

export const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  || "https://thecinemaverses.in";
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "The Cinema Verse";

/**
 * Build a page <title>. The subtitle defaults to the site name only;
 * each page supplies its own language-specific subtitle via the title string.
 */
export function buildTitle(pageTitle: string) {
  return `${pageTitle} | ${SITE_NAME}`;
}

export function buildMeta({
  title,
  description,
  keywords,
  image,
  url,
  type = "website",
  activeLang,
}: {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  activeLang?: LanguageConfig;
}) {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  const cleanUrl = url ? url.replace(/^\//, "") : "";
  const ogImage = image || `${baseUrl}/og-default.jpg`;
  
  let canonical = url ? `${baseUrl}/${cleanUrl}` : baseUrl;
  if (activeLang && activeLang.key !== DEFAULT_LANGUAGE.key && !canonical.includes("lang=")) {
    canonical += canonical.includes("?") ? `&lang=${activeLang.key}` : `?lang=${activeLang.key}`;
  }

  const alternates: any = { canonical };
  
  if (activeLang && url !== undefined) {
    alternates.languages = {};
    alternates.languages["x-default"] = `${baseUrl}/${cleanUrl}`;
    LANGUAGES.forEach(lang => {
      const char = url.includes("?") ? "&" : "?";
      const langParam = lang.key === DEFAULT_LANGUAGE.key ? "" : `${char}lang=${lang.key}`;
      alternates.languages[lang.locale] = `${baseUrl}/${cleanUrl}${langParam}`;
    });
  }

  const locale = activeLang?.locale || "en_IN";

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
    alternates,
    robots: { index: true, follow: true },
  };
}

// JSON-LD structured data generators
export function movieJsonLd(movie: any) {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    description: movie.synopsis,
    url: `${baseUrl}/movie/${movie.slug}`,
    image: movie.posterUrl || movie.thumbnailUrl,
    datePublished: movie.releaseDate,
    inLanguage: movie.language || DEFAULT_LANGUAGE.dbValue,
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

export function articleJsonLd(blog: any) {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: blog.title,
    description: blog.excerpt || blog.seoDesc,
    url: `${baseUrl}/blog/${blog.slug}`,
    image: blog.coverImage,
    inLanguage: blog.language || DEFAULT_LANGUAGE.dbValue,
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

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  const baseUrl = SITE_URL.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => {
      const cleanUrl = item.url ? item.url.replace(/^\//, "") : "";
      return {
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        item: `${baseUrl}/${cleanUrl}`,
      };
    }),
  };
}

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
  const adj = lang?.adjective ?? "Bollywood";
  const industry = lang?.industry  ?? "Bollywood";
  const loc = lang?.locale    ?? "en_IN";
  return {
    adj,
    industry,
    loc,
    movies:    `${adj} Movies`,
    actors:    `${adj} Actors`,
    actresses: `${adj} Actresses`,
    songs:     `${adj} Songs`,
    boxOffice: `${adj} Box Office`,
    news:      `${adj} News`,
    /** e.g. "Latest Bollywood Movies" section heading */
    latestMovies:   `Latest ${adj} Movies`,
    upcomingMovies: `Upcoming ${adj} Movies`,
    currentRunning: `Currently Running ${adj} Movies`,
  };
}

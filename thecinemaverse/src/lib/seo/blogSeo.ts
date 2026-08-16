// src/lib/seo/blogSeo.ts
// ─────────────────────────────────────────────────────────────────────────────
// Blog/Article page SEO — metadata generation for /blog/[slug] pages.
// ─────────────────────────────────────────────────────────────────────────────

import type { Metadata } from "next";
import { buildBlogCanonical, buildBlogCategoryCanonical } from "@/lib/seoUtils/canonical";
import { toBCP47, toOGLocale }                            from "@/lib/seoUtils/language";
import { SITE_NAME }                                      from "@/lib/seoUtils/metadata";

const SITE_ORIGIN = "https://thecinemaverses.in";

/**
 * Build a unique title for a blog post.
 * Uses seoTitle if available; falls back to post title.
 * Does NOT append site name — layout.tsx template handles that.
 */
export function buildBlogTitle(blog: {
  title: string;
  seoTitle?: string;
}): string {
  const raw = (blog.seoTitle?.trim() || blog.title?.trim() || "").slice(0, 60);
  return raw;
}

/**
 * Build a meta description for a blog post.
 * Priority: seoDesc > excerpt > first 160 chars of stripped content
 */
export function buildBlogDescription(blog: {
  title: string;
  excerpt?: string;
  seoDesc?: string;
  content?: string;
}): string {
  const best = (blog.seoDesc || blog.excerpt || "").trim();
  if (best.length > 40) return best.slice(0, 160);

  if (blog.content) {
    const stripped = blog.content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (stripped.length > 40) return stripped.slice(0, 160);
  }

  return blog.title.slice(0, 160);
}

/**
 * Generate Next.js Metadata for a blog detail page.
 */
export function generateBlogMetadata(blog: any, relatedMovie?: any): Metadata {
  const title       = buildBlogTitle(blog);
  const description = buildBlogDescription(blog);
  const canonical   = buildBlogCanonical(blog.slug);
  const bcp47       = toBCP47(blog.language);
  const ogLocale    = toOGLocale(blog.language);
  const coverImg    = blog.coverImage || relatedMovie?.posterUrl || `${SITE_ORIGIN}/og-default.jpg`;

  // Robots: noindex for non-indexable blog entries (e.g. day-wise box office stubs)
  const isIndexable = blog.indexed !== false;

  const keywords = [
    blog.title,
    blog.category,
    ...(blog.tags || []),
    blog.movieTitle,
    "Indian cinema", "Bollywood", "film",
  ].filter(Boolean);

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    robots: isIndexable
      ? { index: true,  follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } }
      : { index: false, follow: false },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "article",
      locale: ogLocale,
      images: [{ url: coverImg, width: 1200, height: 630, alt: title }],
      publishedTime:  blog.createdAt ? new Date(blog.createdAt).toISOString() : undefined,
      modifiedTime:   blog.updatedAt ? new Date(blog.updatedAt).toISOString() : undefined,
      section:        blog.category,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImg],
    },
  };
}

/**
 * Generate Metadata for a blog category listing page.
 * e.g. /blog?category=Box+Office
 */
export function generateBlogCategoryMetadata(category: string): Metadata {
  const canonical = buildBlogCategoryCanonical(category);
  const titles: Record<string, string> = {
    "Box Office": "Box Office Collection Reports",
    Reviews:      "Indian Movie Reviews",
    Actor:        "Indian Actor News & Profiles",
    Songs:        "Indian Film Song Articles",
    News:         "Indian Cinema News",
    "Top Lists":  "Top Lists – Indian Cinema",
  };
  const title = titles[category] || `${category} – ${SITE_NAME}`;
  const description = `Read all ${category} articles on The Cinema Verse. In-depth coverage of Indian cinema.`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      type: "website",
    },
  };
}

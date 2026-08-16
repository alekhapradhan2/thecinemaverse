// app/sitemap.xml/route.ts
// ── Changelog ─────────────────────────────────────────────────────────────────
// v5 — SEO Architecture Overhaul (2026-08)
//  ✅ CRITICAL FIX: Removed all LANGUAGES.forEach ?lang= loops that were generating
//     3,000+ duplicate URLs. ?lang= pages are filter pages (same content), not
//     true language translations. Submitting them burns crawl budget on duplicates
//     and sends conflicting signals about the canonical. Only canonical URLs are
//     now in the sitemap.
//  ✅ FIX: Removed /search from statics — /search is blocked in robots.txt.
//     Submitting a blocked URL to the sitemap causes GSC "Submitted but blocked"
//     errors and wastes crawl quota.
//  ✅ FIX: Year range tightened to current year - 5 (was back to 2000).
//     Pages from 2000-2020 get negligible crawl attention and dilute crawl budget
//     for the high-value recent pages.
//  ✅ FIX: Genre sitemap entries now use /movies/genre/[genre] (canonical).
//     Previously also included /movies?genre= variants (blocked in robots.txt).
//  ✅ All previous fixes preserved (box-office, blog categories, song pages).

import { connectDB } from "@/lib/db";
import Movie         from "@/models/Movie";
import Cast          from "@/models/Cast";
import Blog          from "@/models/Blog";

// Hardcoded to non-www canonical — must exactly match the origin this sitemap is
// served from. Do NOT use SITE_URL from @/lib/seo — that may contain "www." and
// Google treats www and non-www as different origins ("URL not allowed" error).
const CANONICAL_ORIGIN = "https://thecinemaverses.in";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function xmlEsc(s: string) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function safeDate(value: unknown): string {
  const today = new Date().toISOString().split("T")[0];
  if (!value) return today;
  const d = new Date(value as any);
  if (isNaN(d.getTime())) return today;
  const year = d.getFullYear();
  if (year < 2000 || year > new Date().getFullYear() + 1) return today;
  return d.toISOString().split("T")[0];
}

function toSlug(str?: string): string {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function urlEntry(loc: string, lastmod: string, freq = "monthly", pri = "0.7") {
  return `  <url>
    <loc>${xmlEsc(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${pri}</priority>
  </url>`;
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  // ── Static pages ──────────────────────────────────────────────────────────
  // Only canonical, indexable pages. No blocked URLs. No ?lang= duplicates.
  const statics: [string, string, string][] = [
    ["",                    "daily",   "1.0"],
    ["/movies",             "daily",   "0.9"],
    ["/movies/upcoming",    "daily",   "0.9"],
    ["/movies/latest",      "daily",   "0.85"],
    ["/movies/blockbuster", "weekly",  "0.8"],
    ["/box-office",         "daily",   "0.9"],
    ["/songs",              "weekly",  "0.8"],
    ["/cast",               "weekly",  "0.8"],
    ["/blog",               "daily",   "0.8"],
    ["/about",              "monthly", "0.4"],
    ["/contact",            "monthly", "0.4"],
    ["/privacy",            "monthly", "0.3"],
    ["/disclaimer",         "monthly", "0.3"],
    // NOTE: /search is intentionally excluded — it is blocked in robots.txt.
    // Submitting blocked URLs to the sitemap causes GSC "Submitted but blocked" errors.
  ];

  const entries: string[] = [];

  statics.forEach(([p, f, pr]) => {
    entries.push(urlEntry(`${CANONICAL_ORIGIN}${p}`, today, f, pr));
  });

  // ── Genre pages ────────────────────────────────────────────────────────────
  // Canonical genre URL: /movies/genre/[genre] (NOT /movies?genre= which is blocked)
  const genres = [
    "Action", "Romance", "Comedy", "Drama", "Family",
    "Thriller", "Mythological", "Horror", "Social", "Devotional",
    "Historical",
  ];
  genres.forEach((g) => {
    entries.push(urlEntry(
      `${CANONICAL_ORIGIN}/movies/genre/${encodeURIComponent(g.toLowerCase())}`,
      today, "weekly", "0.75"
    ));
  });

  // ── Blog category pages ────────────────────────────────────────────────────
  // These use /blog?category= which is explicitly allowed in robots.txt.
  const blogCategories: [string, string, string][] = [
    ["Box Office", "daily",   "0.9"],
    ["Reviews",    "weekly",  "0.75"],
    ["Actor",      "weekly",  "0.7"],
    ["Songs",      "weekly",  "0.7"],
    ["News",       "daily",   "0.75"],
    ["Top Lists",  "monthly", "0.7"],
  ];

  blogCategories.forEach(([cat, freq, pri]) => {
    entries.push(
      urlEntry(
        `${CANONICAL_ORIGIN}/blog?category=${encodeURIComponent(cat)}`,
        today,
        freq,
        pri
      )
    );
  });

  // ── Songs category pages ───────────────────────────────────────────────────
  const songCategories: [string, string][] = [
    ["2026",     "0.8"],
    ["latest",   "0.8"],
    ["trending", "0.8"],
    ["classics", "0.7"],
    ["singers",  "0.7"],
  ];

  songCategories.forEach(([cat, pri]) => {
    entries.push(urlEntry(`${CANONICAL_ORIGIN}/songs/category/${cat}`, today, "weekly", pri));
  });

  // ── Movies by year pages ───────────────────────────────────────────────────
  // Limited to current year - 5. Pages older than 5 years receive negligible
  // crawl and dilute budget for high-value current-year pages.
  const CURRENT_YEAR = new Date().getFullYear();
  const YEAR_START   = CURRENT_YEAR - 5;

  for (let yr = CURRENT_YEAR; yr >= YEAR_START; yr--) {
    const freq = yr >= CURRENT_YEAR     ? "daily"   : yr >= CURRENT_YEAR - 2 ? "monthly" : "yearly";
    const pri  = yr >= CURRENT_YEAR     ? "0.85"    : yr >= CURRENT_YEAR - 2 ? "0.75"    : "0.6";
    entries.push(urlEntry(`${CANONICAL_ORIGIN}/movies/year/${yr}`, today, freq, pri));
  }

  // ── Box office by year pages ───────────────────────────────────────────────
  const BOX_OFFICE_YEAR_START = CURRENT_YEAR - 5;
  for (let yr = CURRENT_YEAR - 1; yr >= BOX_OFFICE_YEAR_START; yr--) {
    entries.push(urlEntry(
      `${CANONICAL_ORIGIN}/box-office?year=${yr}`,
      today, "weekly", "0.75"
    ));
  }

  try {
    await connectDB();

    // ── Movies + Songs ─────────────────────────────────────────────────────
    const movies = await Movie.find(
      {},
      "slug _id releaseDate updatedAt createdAt media.songs boxOfficeDays"
    ).lean() as any[];

    movies.forEach((m) => {
      const movieSlug    = m.slug || String(m._id);
      const lastmod      = safeDate(m.updatedAt ?? m.createdAt ?? m.releaseDate);
      const hasBoxOffice = m.boxOfficeDays?.length > 0;

      entries.push(urlEntry(
        `${CANONICAL_ORIGIN}/movie/${movieSlug}`,
        lastmod,
        hasBoxOffice ? "daily"  : "weekly",
        hasBoxOffice ? "0.85"   : "0.8"
      ));

      if (hasBoxOffice) {
        entries.push(urlEntry(
          `${CANONICAL_ORIGIN}/box-office/${movieSlug}`,
          lastmod,
          "daily",
          "0.9"
        ));
      }

      if (m.media?.songs?.length) {
        m.media.songs.forEach((s: any, i: number) => {
          if (!s?.title?.trim()) return;
          const songSlug = s.slug || toSlug(s.title);
          if (!songSlug) return;
          entries.push(
            urlEntry(`${CANONICAL_ORIGIN}/songs/${movieSlug}/${i}/${songSlug}`, lastmod, "weekly", "0.7")
          );
        });
      }
    });

    // ── Cast ───────────────────────────────────────────────────────────────
    const casts = await Cast.find({}, "_id slug name updatedAt createdAt").lean() as any[];

    casts.forEach((c) => {
      if (!c.name?.trim()) return;
      const lastmod = safeDate(c.updatedAt ?? c.createdAt);
      entries.push(urlEntry(`${CANONICAL_ORIGIN}/cast/${String(c._id)}`, lastmod, "monthly", "0.7"));
    });

    // ── Blogs ──────────────────────────────────────────────────────────────
    const blogs = await Blog.find(
      { published: true, indexed: { $ne: false } },
      "slug category featured updatedAt createdAt"
    ).lean() as any[];

    blogs.forEach((b) => {
      if (!b.slug?.trim()) return;
      const lastmod     = safeDate(b.updatedAt ?? b.createdAt);
      const isBoxOffice = b.category === "Box Office";
      const isFeatured  = !!b.featured;
      const freq        = isBoxOffice ? "daily"  : "weekly";
      const pri         = isBoxOffice ? "0.9"    : isFeatured ? "0.85" : "0.75";
      entries.push(urlEntry(`${CANONICAL_ORIGIN}/blog/${b.slug}`, lastmod, freq, pri));
    });

  } catch (err) {
    console.error("Sitemap generation error:", err);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type":  "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=600",
    },
  });
}
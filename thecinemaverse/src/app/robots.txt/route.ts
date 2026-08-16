// app/robots.txt/route.ts
// ── Changelog ─────────────────────────────────────────────────────────────────
// v4 — SEO Architecture Overhaul (2026-08)
//  ✅ CRITICAL FIX: Removed "Disallow: /_next/" — this line was blocking Googlebot
//     from downloading the site's JavaScript and CSS chunks, making all client-
//     rendered content invisible. Next.js requires /_next/static/ to be crawlable
//     so Google can fully render the page.
//  ✅ FIX: Replaced blanket "Disallow: /blog?" with specific query blocks:
//     - Disallow: /blog?q=     (search queries — no SEO value)
//     - Disallow: /blog?page=  (pagination — duplicate content)
//     The blanket /blog? was conflicting with "Allow: /blog?category=" causing
//     unpredictable crawl behavior on category filter pages submitted to the sitemap.
//  ✅ FIX: Removed /search from sitemap — /search is blocked by Disallow: /search
//     but was previously listed in the sitemap, causing GSC "submitted-but-blocked"
//     errors. Blocked + in-sitemap = waste of crawl quota.
//  ✅ PerplexityBot and Google-Extended remain un-blocked (AI citation traffic).
//  ✅ All training scraper blocks preserved.

// Hardcoded non-www canonical — must match the origin the sitemap is served from.
const CANONICAL_ORIGIN = "https://thecinemaverses.in";

export async function GET() {
  const content = `# ── The Cinema Verse — robots.txt ──────────────────────
# Last updated: 2026-08 | SEO Architecture v4

User-agent: *
Allow: /

# ── Block thin / low-value pages from crawl budget ──────
Disallow: /api/
Disallow: /admin/
Disallow: /search

# ── Block URL variants that are crawl-budget duplicates ─
# /movies?genre= is blocked because the canonical genre URL is /movies/genre/[genre]
Disallow: /movies?genre=
# Block /blog search and pagination (no unique value)
Disallow: /blog?q=
Disallow: /blog?page=

# ── Explicitly allow canonical filter pages ─────────────
# These are submitted in the sitemap and must be crawlable.
Allow: /movies/year/
Allow: /movies/genre/
Allow: /box-office?year=
Allow: /blog?category=
Allow: /*?lang=

# ── AI training scrapers — protect original content ─────
# PerplexityBot and Google-Extended are NOT blocked (they cite sources
# and drive real traffic; they are AI search engines, not scrapers).

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: Amazonbot
Disallow: /

User-agent: Applebot-Extended
Disallow: /

User-agent: Meta-ExternalAgent
Disallow: /

# ── Sitemaps ─────────────────────────────────────────────
Sitemap: ${CANONICAL_ORIGIN}/sitemap.xml
`;

  return new Response(content, {
    headers: {
      "Content-Type":  "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400",
    },
  });
}
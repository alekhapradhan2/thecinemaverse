// app/movies/year/[year]/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie";
import Cast from "@/models/Cast";
import { buildMeta, getLangMeta } from "@/lib/seo";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { resolveLanguage, getLanguageFilter } from "@/lib/languages";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { YearSelector } from "@/components/ui/YearSelector";
import {
  Film, Calendar, ChevronRight, Clapperboard,
  TrendingUp, Star, Flame, Clock, Zap, User, ExternalLink,
  BookOpen, HelpCircle, Globe, Award, Sparkles,
} from "lucide-react";

export const revalidate = 600;

// ─── Valid years ───────────────────────────────────────────────────────────────
const _OLDEST_YEAR = 2010;
const _NOW_YEAR = new Date().getFullYear();
const VALID_YEARS: number[] = Array.from(
  { length: _NOW_YEAR - _OLDEST_YEAR + 1 },
  (_, i) => _NOW_YEAR - i,
);

// ─── Generate static params ────────────────────────────────────────────────────
export async function generateStaticParams() {
  return VALID_YEARS.map((year) => ({ year: String(year) }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata(
  props: {
    params: Promise<{ year: string }>;
    searchParams: Promise<{ lang?: string }>;
  }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const year = Number(params.year);
  const lang = resolveLanguage(searchParams.lang);
  const s    = getLangMeta(lang);
  return buildMeta({
    title: `${lang.short} Movies ${year} A to Z – Complete ${lang.industry} Films List | The Cinema Verse`,
    description: `${year} ${lang.short} Movies A to Z full list – Browse all ${lang.industry} films released in ${year} with movie names, directors, release dates, box office collection, cast, songs, and reviews.`,
    keywords: [
      `${lang.short.toLowerCase()} movies ${year} A to Z`,
      `${year} ${lang.short.toLowerCase()} movies list`,
      `${year} ${lang.short.toLowerCase()} films list`,
      `${s.adj} movies ${year} list`,
      `all ${lang.short.toLowerCase()} movies ${year}`,
      `${lang.short.toLowerCase()} movies ${year}`,
      `${s.adj} ${year}`,
      `${lang.short.toLowerCase()} films ${year}`,
      `new ${lang.short.toLowerCase()} movies ${year}`,
      `${s.boxOffice.toLowerCase()} ${year}`,
      `upcoming ${lang.short.toLowerCase()} movies ${year}`,
    ],
    url: searchParams.lang ? `/movies/year/${year}?lang=${searchParams.lang}` : `/movies/year/${year}`,
  });
}

// ─── JSON-LD structured data ────────────────────────────────────────────────────
function MovieListJsonLd({ movies, year, langShort, indStr }: { movies: any[]; year: number; langShort: string; indStr: string }) {
  const itemList = movies.slice(0, 50).map((m, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Movie",
      name: m.title,
      url: `https://thecinemaverses.in/movie/${m.slug}`,
      datePublished: m.releaseDate,
      director: m.director
        ? { "@type": "Person", name: m.director }
        : undefined,
    },
  }));

  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${langShort} Movies ${year}`,
    description: `Complete list of ${langShort.toLowerCase()} (${indStr}) films released in ${year}`,
    url: `https://thecinemaverses.in/movies/year/${year}`,
    numberOfItems: movies.length,
    itemListElement: itemList,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── WebPage JSON-LD (enhances Google sitelinks / knowledge panel) ─────────────
function WebPageJsonLd({ year, total, langShort, indStr, langDb }: { year: number; total: number; langShort: string; indStr: string; langDb: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${langShort} Movies ${year} – Complete A to Z ${indStr} Films List`,
    description: `Full list of ${total} ${langShort.toLowerCase()} movies released in ${year}. Browse all ${indStr.toLowerCase()} films with director, release date, box office verdict, cast and songs.`,
    url: `https://thecinemaverses.in/movies/year/${year}`,
    inLanguage: "en-IN",
    isPartOf: { "@type": "WebSite", name: "The Cinema Verse", url: "https://thecinemaverses.in" },
    about: {
      "@type": "Thing",
      name: indStr,
      description: `${langDb}-language film industry based in India`,
    },
    dateModified: new Date().toISOString(),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── BreadcrumbList JSON-LD ────────────────────────────────────────────────────
function BreadcrumbJsonLd({ year, langShort }: { year: number; langShort: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://thecinemaverses.in" },
      { "@type": "ListItem", position: 2, name: "Movies", item: "https://thecinemaverses.in/movies" },
      { "@type": "ListItem", position: 3, name: `${langShort} Movies ${year}`, item: `https://thecinemaverses.in/movies/year/${year}` },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ─── Data fetch ────────────────────────────────────────────────────────────────
async function getMoviesByYear(year: number, langKey?: string) {
  await connectDB();

  const startDate = new Date(`${year}-01-01`);
  const endDate   = new Date(`${year}-12-31T23:59:59`);
  const currentYear = new Date().getFullYear();

  // Optional language filter
  const langDbValue = getLanguageFilter(langKey);

  // For the current year we also include TBA movies (releaseTBA:true or
  // releaseDate:"") that are marked Upcoming — they have no date yet but
  // clearly belong to this year's slate.
  const dateMatch =
    year === currentYear
      ? {
          $or: [
            {
              releaseDate: {
                $gte: startDate.toISOString().split("T")[0],
                $lte: endDate.toISOString().split("T")[0],
              },
            },
            { releaseTBA: true },
            {
              $and: [
                { $or: [{ releaseDate: "" }, { releaseDate: null }, { releaseDate: { $exists: false } }] },
                { $or: [{ verdict: "Upcoming" }, { status: "Upcoming" }] },
              ],
            },
          ],
        }
      : {
          releaseDate: {
            $gte: startDate.toISOString().split("T")[0],
            $lte: endDate.toISOString().split("T")[0],
          },
        };

  // Merge language filter if present
  const matchStage = langDbValue
    ? { $and: [dateMatch, { language: { $regex: new RegExp(`^${langDbValue}$`, "i") } }] }
    : dateMatch;

  const movies = await Movie.aggregate([
    { $match: matchStage },
    { $project: { reviews: 0 } },
    {
      $addFields: {
        // Guard against empty/null releaseDate (TBA movies) — sort them to the bottom
        _releaseDateObj: {
          $cond: {
            if: { $and: [{ $ifNull: ["$releaseDate", false] }, { $ne: ["$releaseDate", ""] }] },
            then: { $toDate: "$releaseDate" },
            else: new Date("9999-12-31"),
          },
        },
        // Resolve director: use top-level field first, then fall back to
        // the first cast/crew entry whose role contains "director" (case-insensitive)
        director: {
          $cond: {
            if: { $and: [{ $ifNull: ["$director", false] }, { $ne: ["$director", ""] }] },
            then: "$director",
            else: {
              $let: {
                vars: {
                  directorEntry: {
                    $first: {
                      $filter: {
                        input: { $ifNull: ["$cast", []] },
                        as: "member",
                        cond: {
                          $regexMatch: {
                            input: { $ifNull: ["$$member.role", ""] },
                            regex: "director",
                            options: "i",
                          },
                        },
                      },
                    },
                  },
                },
                in: { $ifNull: ["$$directorEntry.name", null] },
              },
            },
          },
        },
      },
    },
    { $sort: { _releaseDateObj: -1, _id: -1 } },
  ]);

  return JSON.parse(JSON.stringify(movies));
}

// ─── Fetch top cast members who appear most in that year's movies ──────────────
async function getTopCastByYear(movies: any[], limit = 12) {
  // Count how many movies each castId appears in
  const countMap: Record<string, number> = {};
  for (const movie of movies) {
    for (const entry of movie.cast || []) {
      const id = String(entry.castId);
      if (id && id.length === 24) countMap[id] = (countMap[id] || 0) + 1;
    }
  }
  // Sort by frequency, take top N
  const topIds = Object.entries(countMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (!topIds.length) return [];

  const castMembers = await Cast.find(
    { _id: { $in: topIds } },
    "_id name type roles photo"
  ).lean();

  // Preserve frequency order
  const ordered = topIds
    .map(id => castMembers.find((c: any) => String(c._id) === id))
    .filter(Boolean) as any[];

  return JSON.parse(JSON.stringify(ordered));
}
const VERDICT_CONFIG: Record<string, { color: string; icon: React.ElementType }> = {
  Blockbuster: { color: "text-brand-400 bg-brand-500/15 border-brand-500/30", icon: Flame },
  Superhit:    { color: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30", icon: Star  },
  Hit:         { color: "text-green-400  bg-green-500/15  border-green-500/30",  icon: TrendingUp },
  Average:     { color: "text-blue-400   bg-blue-500/15   border-blue-500/30",   icon: Zap   },
  Flop:        { color: "text-red-400    bg-red-500/15    border-red-500/30",    icon: Clock },
  Upcoming:    { color: "text-sky-400    bg-sky-500/15    border-sky-500/30",    icon: Calendar },
};

// ─── Format release date ────────────────────────────────────────────────────────
function formatReleaseDate(dateStr: string, isTBA?: boolean): string {
  if (isTBA || !dateStr || dateStr.trim() === "") return "TBA";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "TBA";
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "TBA";
  }
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function MoviesByYearPage(
  props: {
    params: Promise<{ year: string }>;
    searchParams: Promise<{ lang?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const year       = Number(params.year);
  const lang       = searchParams.lang;
  const activeLang = resolveLanguage(lang);
  const s          = getLangMeta(activeLang);

  if (isNaN(year) || !VALID_YEARS.includes(year)) {
    notFound();
  }

  const movies  = await getMoviesByYear(year, lang);
  const total   = movies.length;
  const topCast = await getTopCastByYear(movies);

  const verdictCounts: Record<string, number> = {};
  for (const m of movies) {
    const v = m.verdict || "Upcoming";
    verdictCounts[v] = (verdictCounts[v] || 0) + 1;
  }

  const currentYear = new Date().getFullYear();
  const prevYear    = VALID_YEARS[VALID_YEARS.indexOf(year) + 1];
  const nextYear    = VALID_YEARS[VALID_YEARS.indexOf(year) - 1];

  return (
    <>
      {/* ── JSON-LD Structured Data ── */}
      <BreadcrumbJsonLd year={year} langShort={activeLang.short} />
      <WebPageJsonLd year={year} total={total} langShort={activeLang.short} indStr={s.industry} langDb={activeLang.dbValue} />
      {total > 0 && <MovieListJsonLd movies={movies} year={year} langShort={activeLang.short} indStr={s.industry} />}

      <div className="min-h-screen bg-[#0a0a0a]">

        {/* ══════════════════════════════════════════════════════════
            HERO BANNER
        ══════════════════════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden bg-gradient-to-b from-[#0d0d0d] to-[#0a0a0a] border-b border-[#1f1f1f]"
          aria-label={`${activeLang.short} movies from ${year}`}
        >
          {/* Decorative glows */}
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/6 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-600/4 rounded-full blur-2xl" />
            <div className="absolute inset-0"
              style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #f9731608 0%, transparent 60%)" }} />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5 flex-wrap" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-brand-400 transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/movies" className="hover:text-brand-400 transition-colors">Movies</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-brand-400 font-medium">Movies of {year}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-brand-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-brand-500" />
                  </div>
                  {/* H1 — primary SEO heading */}
                  <h1 className="font-display text-3xl md:text-4xl font-black text-white leading-tight">
                    {activeLang.short} Movies {year} – A to Z {activeLang.industry} Films List
                  </h1>
                </div>
                {/* Language selector */}
                <div className="mb-3">
                  <LanguageSelector activeLang={lang} />
                </div>
                <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
                  {year === currentYear
                    ? `Complete A to Z list of all ${activeLang.industry} films released in ${year}. Every ${year} ${activeLang.short.toLowerCase()} film listed with movie name, director, and release date — updated regularly as new films hit theatres.`
                    : `Complete A to Z list of all ${activeLang.industry} films released in ${year}. Find every ${activeLang.short.toLowerCase()} film from ${year} with director names, release dates, box office verdict, cast details, and reviews.`}
                </p>
              </div>

              {/* Movie count pill */}
              <div className="flex items-center gap-2 bg-[#111] border border-[#1f1f1f] rounded-xl px-5 py-3 self-start md:self-auto flex-shrink-0">
                <Film className="w-4 h-4 text-brand-500" />
                <span className="text-2xl font-black text-white font-display">{total}</span>
                <span className="text-xs text-gray-500 leading-tight">{activeLang.short}<br />films</span>
              </div>
            </div>

            {/* Year navigator */}
            <YearSelector
              validYears={VALID_YEARS}
              currentYear={year}
              lang={lang}
              activeLangShort={activeLang.short}
            />
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

          {/* ══════════════════════════════════════════════════════════
              VERDICT BREAKDOWN STATS
          ══════════════════════════════════════════════════ */}
          {total > 0 && Object.keys(verdictCounts).length > 0 && (
            <section aria-label="Box office verdict breakdown">
              <div className="flex flex-wrap gap-2">
                {Object.entries(verdictCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([verdict, count]) => {
                    const cfg = VERDICT_CONFIG[verdict];
                    if (!cfg) return null;
                    const Icon = cfg.icon;
                    return (
                      <div
                        key={verdict}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${cfg.color}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {verdict} <span className="opacity-60 ml-0.5">({count})</span>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════
              MOVIES TABLE
          ══════════════════════════════════════════════════════ */}
          <section aria-labelledby="movies-table-heading">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-brand-500/15 rounded-lg flex items-center justify-center">
                <Clapperboard className="w-4 h-4 text-brand-500" />
              </div>
              <div>
                <h2 id="movies-table-heading" className="font-display text-lg font-bold text-white">
                  {total > 0
                    ? `${total} Hindi Films Released in ${year}`
                    : `No Movies Found for ${year}`}
                </h2>
                {total > 0 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    Sorted by release date — newest first. Click a movie name to view full details.
                  </p>
                )}
              </div>
            </div>

            {total === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 bg-[#141414] border border-[#222] rounded-2xl flex items-center justify-center mb-4">
                  <Film className="w-7 h-7 text-gray-600" />
                </div>
                <p className="text-gray-300 font-semibold text-lg mb-1">No movies found for {year}</p>
                <p className="text-gray-600 text-sm mb-5">
                  We may not have data for this year yet. Check back later or browse another year.
                </p>
                <Link
                  href="/movies"
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors"
                >
                  Browse All Movies
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#1f1f1f] overflow-hidden bg-[#0d0d0d]">
                {/* min-w keeps all 5 cols visible; on very small screens a subtle scroll appears */}
                <div className="w-full overflow-x-auto -webkit-overflow-scrolling-touch">
                  <table
                    className="w-full min-w-[480px] text-sm"
                    role="table"
                    aria-label={`hindi movies list ${year}`}
                  >
                    <thead>
                      <tr className="border-b border-[#1f1f1f] bg-[#111]">
                        <th scope="col" className="text-left px-2 sm:px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 w-7">
                          #
                        </th>
                        <th scope="col" className="text-left px-2 sm:px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Movie Name
                        </th>
                        <th scope="col" className="text-left px-2 sm:px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3 flex-shrink-0" />
                            Director
                          </span>
                        </th>
                        <th scope="col" className="text-left px-2 sm:px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 whitespace-nowrap">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            Release
                          </span>
                        </th>
                        <th scope="col" className="text-left px-2 sm:px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                          Verdict
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {movies.map((movie: any, index: number) => {
                        const verdictCfg = movie.verdict ? VERDICT_CONFIG[movie.verdict] : null;
                        const VerdictIcon = verdictCfg?.icon;
                        return (
                          <tr
                            key={String(movie._id)}
                            className="border-b border-[#161616] last:border-0 hover:bg-[#111] transition-colors group"
                          >
                            {/* # */}
                            <td className="px-2 sm:px-4 py-3 text-gray-600 text-[11px] tabular-nums align-top">
                              {index + 1}
                            </td>

                            {/* Movie name */}
                            <td className="px-2 sm:px-4 py-3 align-top">
                              <TransitionLink
                                href={`/movie/${movie.slug}`}
                                className="font-semibold text-white hover:text-brand-400 transition-colors inline-flex items-start gap-1 group/link"
                                title={`${movie.title} – Hindi Movie ${year}`}
                              >
                                <span className="leading-snug">{movie.title}</span>
                                <ExternalLink className="w-3 h-3 mt-0.5 opacity-0 group-hover/link:opacity-50 transition-opacity flex-shrink-0" />
                              </TransitionLink>
                            </td>

                            {/* Director */}
                            <td className="px-2 sm:px-4 py-3 text-gray-400 text-xs align-top leading-snug">
                              {movie.director ?? <span className="text-gray-700">—</span>}
                            </td>

                            {/* Release date */}
                            <td className="px-2 sm:px-4 py-3 text-gray-400 text-[11px] tabular-nums whitespace-nowrap align-top">
                              <time dateTime={movie.releaseDate || ""}>
                                {formatReleaseDate(movie.releaseDate, movie.releaseTBA)}
                              </time>
                            </td>

                            {/* Verdict */}
                            <td className="px-2 sm:px-4 py-3 align-top">
                              {verdictCfg && VerdictIcon ? (
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-semibold whitespace-nowrap ${verdictCfg.color}`}>
                                  <VerdictIcon className="w-2.5 h-2.5 flex-shrink-0" />
                                  {movie.verdict}
                                </span>
                              ) : (
                                <span className="text-gray-700 text-xs">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table footer */}
                <div className="px-4 py-3 bg-[#111] border-t border-[#1a1a1a] flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    Showing <span className="text-gray-400 font-semibold">{total}</span> hindi films from {year}
                  </p>
                  <Link
                    href="/movies"
                    className="text-xs text-brand-400 hover:text-brand-300 font-semibold transition-colors flex items-center gap-1"
                  >
                    View all years <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* ══════════════════════════════════════════════════════════
              YEAR NAVIGATION — prev / next (directly after table)
          ══════════════════════════════════════════════════════ */}
          <nav
            aria-label="Navigate between years"
            className="flex items-center justify-between py-2"
          >
            <div>
              {prevYear && (
                <Link
                  href={`/movies/year/${prevYear}`}
                  aria-label={`hindi movies of ${prevYear}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111] border border-[#222] text-sm font-semibold text-gray-400 hover:text-brand-400 hover:border-brand-500/30 transition-all group"
                >
                  <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
                  {prevYear} Films
                </Link>
              )}
            </div>

            <Link
              href="/movies"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-sm font-semibold text-brand-400 hover:bg-brand-500/20 transition-all"
            >
              <Film className="w-3.5 h-3.5" />
              All Movies
            </Link>

            <div>
              {nextYear && (
                <Link
                  href={`/movies/year/${nextYear}`}
                  aria-label={`hindi movies of ${nextYear}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#111] border border-[#222] text-sm font-semibold text-gray-400 hover:text-brand-400 hover:border-brand-500/30 transition-all group"
                >
                  {nextYear} Films
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              )}
            </div>
          </nav>

          {total > 0 && (
            <>
              {/* ══════════════════════════════════════════════════════════
                  SECTION 1 — OVERVIEW EDITORIAL
              ══════════════════════════════════════════════════════ */}
              <section
                aria-labelledby="seo-overview-heading"
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 md:p-8 space-y-4"
              >
                <h2
                  id="seo-overview-heading"
                  className="font-display text-lg font-bold text-white flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  Hindi Movies {year} – Complete bollywood Overview
                </h2>
                <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
                  <p>
                    The year <strong className="text-gray-200">{year}</strong> is a landmark chapter
                    in <strong className="text-gray-200">hindi cinema</strong>, also known as{" "}
                    <strong className="text-gray-200">bollywood</strong>. A total of{" "}
                    <strong className="text-gray-200">{total} hindi films</strong> were produced and
                    released in {year}, spanning a wide range of genres including action, romance,
                    family drama, comedy, mythology, thriller, and social issue-based narratives.
                    These films were shot predominantly in the bollywood language and released across
                    Odisha and among bollywood-speaking audiences globally.
                  </p>
                  <p>
                    hindi cinema has its roots dating back to 1936 with the release of{" "}
                    <em>Sita Bibaha</em>, the first bollywood-language film. Over the decades, bollywood
                    has grown into a thriving regional film industry, producing commercially
                    successful and critically acclaimed films each year. The {year} slate reflects
                    that continued growth, with films targeting multiplex audiences as well as
                    traditional single-screen theatres across Odisha.
                  </p>
                  {(verdictCounts["Blockbuster"] || verdictCounts["Superhit"] || verdictCounts["Hit"]) && (
                    <p>
                      In terms of box office performance, the {year} bollywood season saw{" "}
                      {[
                        verdictCounts["Blockbuster"] && (
                          <strong key="bb" className="text-brand-400">
                            {verdictCounts["Blockbuster"]} Blockbuster{verdictCounts["Blockbuster"] > 1 ? "s" : ""}
                          </strong>
                        ),
                        verdictCounts["Superhit"] && (
                          <strong key="sh" className="text-yellow-400">
                            {verdictCounts["Superhit"]} Superhit{verdictCounts["Superhit"] > 1 ? "s" : ""}
                          </strong>
                        ),
                        verdictCounts["Hit"] && (
                          <strong key="h" className="text-green-400">
                            {verdictCounts["Hit"]} Hit{verdictCounts["Hit"] > 1 ? "s" : ""}
                          </strong>
                        ),
                      ]
                        .filter(Boolean)
                        .reduce<React.ReactNode[]>((acc, el, i, arr) => {
                          acc.push(el);
                          if (i < arr.length - 1) acc.push(i === arr.length - 2 ? " and " : ", ");
                          return acc;
                        }, [])}{" "}
                      — demonstrating the strong appetite of bollywood audiences for quality regional
                      content. These successes helped boost confidence among producers and
                      distributors to invest further in the bollywood ecosystem.
                    </p>
                  )}
                  {verdictCounts["Upcoming"] > 0 && (
                    <p>
                      Additionally, <strong className="text-sky-400">{verdictCounts["Upcoming"]} upcoming hindi films</strong>{" "}
                      are currently in production or post-production, with release dates yet to be
                      officially announced. These films are expected to release in theatres soon —
                      stay tuned to The Cinema Verse for the latest updates on cast, crew, trailers, and
                      release date announcements.
                    </p>
                  )}
                  <p>
                    Each movie listed in the table above has a dedicated page on The Cinema Verse featuring
                    the complete cast and crew, synopsis, songs, trailer, box office collection, and
                    audience reviews. Click any movie name to explore the full details.
                  </p>
                </div>
              </section>

              {/* ══════════════════════════════════════════════════════════
                  KEYWORD TAGS — visible to Google, subtle on-page
              ══════════════════════════════════════════════════════ */}
              <section aria-label={`Search tags for hindi movies ${year}`} className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl px-5 py-4">
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-3">Related Searches</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    `Hindi Movies ${year}`,
                    `${year} Hindi Movies A to Z`,
                    `bollywood ${year}`,
                    `${year} Hindi Films List`,
                    `New Hindi Movies ${year}`,
                    `Upcoming Hindi Movies ${year}`,
                    `${year} bollywood Blockbuster`,
                    `${year} bollywood Hit Movies`,
                    `Hindi Movies ${year} Full List`,
                    `${year} bollywood Box Office`,
                    `${year} Hindi Movie Cast`,
                    `${year} Hindi Movie Release Date`,
                    `Best Hindi Movies ${year}`,
                    `Latest Hindi Movies ${year}`,
                    `All Hindi Movies ${year}`,
                    `${year} Hindi Movie Download`,
                    `${year} Hindi Movie Watch Online`,
                    `Hindi Cinema ${year}`,
                    `Bollywood Films ${year}`,
                    `${year} Bollywood Romantic Movies`,
                    `${year} Bollywood Action Movies`,
                    `${year} Bollywood Comedy Movies`,
                    `${year} Bollywood Family Movies`,
                    `Hindi Movie Director ${year}`,
                    `Hindi Film Industry ${year}`,
                    `Shah Rukh Khan Movies ${year}`,
                    `Salman Khan Movies ${year}`,
                    `Deepika Padukone Movies ${year}`,
                    `Bollywood Blockbuster ${year}`,
                    `Amazon Prime Hindi Movies ${year}`,
                    `Netflix Hindi Movies ${year}`,
                    `Disney Plus Hotstar Hindi Movies ${year}`,
                    `Hindi Films ${year} IMDb`,
                    `${year} Bollywood Mythological Movies`,
                    `${year} Bollywood Thriller Movies`,
                    `Pritam Music ${year}`,
                    `${year} Bollywood Superhit`,
                    `Hindi Movie Trailer ${year}`,
                    `${year} Hindi Film Songs`,
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-[11px] rounded-full border border-[#1f1f1f] bg-[#111] text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </section>

              {/* ══════════════════════════════════════════════════════════
                  SECTION 2 — BOX OFFICE VERDICT BREAKDOWN
              ══════════════════════════════════════════════════════ */}
              {Object.keys(verdictCounts).length > 0 && (
                <section
                  aria-labelledby="verdict-breakdown-heading"
                  className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 md:p-8"
                >
                  <h2
                    id="verdict-breakdown-heading"
                    className="font-display text-lg font-bold text-white flex items-center gap-2 mb-4"
                  >
                    <Award className="w-4 h-4 text-brand-500 flex-shrink-0" />
                    {year} bollywood Box Office Verdict Breakdown
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-5">
                    {Object.entries(verdictCounts)
                      .sort((a, b) => b[1] - a[1])
                      .map(([verdict, count]) => {
                        const cfg = VERDICT_CONFIG[verdict];
                        if (!cfg) return null;
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={verdict}
                            className={`flex flex-col items-center justify-center gap-1 py-4 px-3 rounded-xl border text-center ${cfg.color}`}
                          >
                            <Icon className="w-5 h-5 mb-1" />
                            <span className="text-lg font-black">{count}</span>
                            <span className="text-[11px] font-semibold opacity-80">{verdict}</span>
                          </div>
                        );
                      })}
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Out of <strong className="text-gray-300">{total} Hindi movies in {year}</strong>,
                    the box office verdicts above reflect audience turnout and theatrical collection
                    across India. Blockbuster and Superhit films typically run for 4–8 weeks in
                    theatres, while Average and Flop films have shorter runs. Upcoming films have
                    not yet been released and their verdict will be updated post-release.
                  </p>
                </section>
              )}

              {/* ══════════════════════════════════════════════════════════
                  SECTION 3 — ABOUT BOLLYWOOD
              ══════════════════════════════════════════════════════ */}
              <section
                aria-labelledby="about-bollywood-heading"
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 md:p-8 space-y-3"
              >
                <h2
                  id="about-bollywood-heading"
                  className="font-display text-lg font-bold text-white flex items-center gap-2"
                >
                  <Globe className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  About bollywood – Hindi Film Industry
                </h2>
                <div className="space-y-3 text-sm text-gray-400 leading-relaxed">
                  <p>
                    <strong className="text-gray-200">Bollywood</strong> is the colloquial name for
                    the <strong className="text-gray-200">Hindi-language film industry</strong> based
                    in <strong className="text-gray-200">Mumbai</strong>, India.
                    The industry produces over 300–400 films annually and has a dedicated
                    audience base of over a billion Hindi speakers across India as well as
                    diaspora communities worldwide.
                  </p>
                  <p>
                    Bollywood films are exhibited in single-screen and multiplex theatres
                    across India, with major centres in Mumbai, Delhi, Chennai,
                    Bangalore, Hyderabad, and Kolkata. Popular Bollywood stars include actors such
                    as Shah Rukh Khan, Salman Khan, Aamir Khan, Deepika Padukone,
                    Ranveer Singh, and Alia Bhatt, among many others.
                  </p>
                  <p>
                    Major Hindi film production houses active in {year} include Dharma Productions,
                    Yash Raj Films, T-Series, and many independent producers who collaborate with leading OTT platforms —{" "}
                    <strong className="text-gray-200">Netflix</strong>,{" "}
                    <strong className="text-gray-200">Amazon Prime Video</strong>, and{" "}
                    <strong className="text-gray-200">Disney+ Hotstar</strong> — for digital releases
                    following their theatrical run.
                  </p>
                  <p>
                    <strong className="text-gray-200">The Cinema Verse</strong> is the most comprehensive
                    online encyclopedia for hindi cinema, covering every film from{" "}
                    {Math.min(...VALID_YEARS)} to {Math.max(...VALID_YEARS)} with detailed
                    information on cast, crew, songs, trailers, box office performance, and audience
                    reviews — all in one place.
                  </p>
                </div>
              </section>

              {/* ══════════════════════════════════════════════════════════
                  SECTION 4 — FAQ (triggers Google FAQ rich results)
              ══════════════════════════════════════════════════════ */}
              <section
                aria-labelledby="faq-heading"
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 md:p-8"
              >
                <h2
                  id="faq-heading"
                  className="font-display text-lg font-bold text-white flex items-center gap-2 mb-5"
                >
                  <HelpCircle className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  Frequently Asked Questions – Hindi Movies {year}
                </h2>

                {/* FAQ JSON-LD for Google rich results */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "FAQPage",
                      mainEntity: [
                        {
                          "@type": "Question",
                          name: `What is the A to Z list of hindi movies in ${year}?`,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: `The complete A to Z list of ${year} hindi movies includes all ${total} bollywood films released in ${year}, listed with movie name, director, release date, and box office verdict. The full list is available on The Cinema Verse.`,
                          },
                        },
                        {
                          "@type": "Question",
                          name: `How many hindi movies were released in ${year}?`,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: `A total of ${total} bollywood movies were released in ${year}. These films span a range of genres including action, romance, drama, comedy, mythology, and thriller.`,
                          },
                        },
                        {
                          "@type": "Question",
                          name: `Which is the best hindi movie of ${year}?`,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: `The best hindi movies of ${year} include films that earned Blockbuster and Superhit verdicts at the box office. Visit The Cinema Verse's ${year} hindi movies list to see all films ranked by performance.`,
                          },
                        },
                        {
                          "@type": "Question",
                          name: `What are the new hindi movies releasing in ${year}?`,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: `New hindi movies releasing in ${year} are updated regularly on The Cinema Verse. Several upcoming bollywood films have TBA release dates. Visit the ${year} hindi movies page on The Cinema Verse for the latest announcements.`,
                          },
                        },
                        {
                          "@type": "Question",
                          name: `Which is the biggest bollywood blockbuster of ${year}?`,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: `The Cinema Verse tracks box office verdicts for all ${year} hindi films. Visit individual movie pages on The Cinema Verse to check which films earned the Blockbuster verdict in ${year}.`,
                          },
                        },
                        {
                          "@type": "Question",
                          name: `Where can I watch hindi movies of ${year} online?`,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: `${year} Hindi movies are available to stream on OTT platforms including Netflix, Amazon Prime Video, and Disney+ Hotstar following their theatrical release. Check individual movie pages on The Cinema Verse for streaming availability.`,
                          },
                        },
                        {
                          "@type": "Question",
                          name: `Which upcoming hindi movies are releasing in ${year}?`,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: `Several hindi films are upcoming in ${year} with TBA (To Be Announced) release dates. Visit The Cinema Verse's ${year} hindi movies page for the latest list of upcoming bollywood films with their announced cast and directors.`,
                          },
                        },
                        {
                          "@type": "Question",
                          name: `What is bollywood?`,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: `Bollywood is the informal name for the Hindi-language film industry based in Mumbai, India. It produces films primarily in the Hindi language for audiences across India and the global Hindi diaspora.`,
                          },
                        },
                        {
                          "@type": "Question",
                          name: `Which OTT platform has the most ${year} hindi movies?`,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: `The leading Bollywood OTT platforms for ${year} Hindi movies are Netflix, Amazon Prime Video, and Disney+ Hotstar. These platforms carry the most complete catalogues of ${year} Hindi films after theatrical release.`,
                          },
                        },
                        {
                          "@type": "Question",
                          name: `Who are the top bollywood actors of ${year}?`,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: `Leading Bollywood actors in ${year} include Shah Rukh Khan, Salman Khan, Aamir Khan, and Ranveer Singh. Top actresses include Deepika Padukone, Alia Bhatt, Katrina Kaif, and Priyanka Chopra.`,
                          },
                        },
                        {
                          "@type": "Question",
                          name: `What genres are popular in ${year} hindi cinema?`,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: `The most popular genres in ${year} hindi cinema are action, romance, family drama, and comedy. Mythological, thriller, and social-issue films are also widely produced in bollywood.`,
                          },
                        },
                        {
                          "@type": "Question",
                          name: `How many hindi films were Blockbusters in ${year}?`,
                          acceptedAnswer: {
                            "@type": "Answer",
                            text: `The Cinema Verse tracks the box office verdict for every ${year} hindi film. Visit the ${year} hindi movies page on The Cinema Verse to see the exact count of Blockbuster, Superhit, Hit, Average, and Flop verdicts for that year.`,
                          },
                        },
                      ],
                    }),
                  }}
                />

                <div className="space-y-4">
                  {[
                    {
                      q: `What is the A to Z list of hindi movies in ${year}?`,
                      a: `The complete A to Z list of ${year} hindi movies is available in the table above. All ${total} bollywood films released in ${year} are listed alphabetically by title, along with their director, release date, and box office verdict.`,
                    },
                    {
                      q: `How many hindi movies were released in ${year}?`,
                      a: `A total of ${total} bollywood (bollywood) movies were released in ${year}, spanning genres like action, romance, family drama, comedy, mythology, and thriller. The full list with release dates and directors is available in the table above.`,
                    },
                    {
                      q: `Which is the best hindi movie of ${year}?`,
                      a: `The best hindi movies of ${year} are determined by box office performance and audience ratings. The Cinema Verse tracks verdicts like Blockbuster, Superhit, and Hit for all ${year} hindi films. Click any movie in the list above to see its full ratings, reviews, and verdict.`,
                    },
                    {
                      q: `Which is the biggest bollywood blockbuster of ${year}?`,
                      a: `The Cinema Verse tracks box office verdicts for all ${year} hindi films. Click on any movie name in the table above to see its full box office collection, verdict, and audience response.`,
                    },
                    {
                      q: `What are the new hindi movies releasing in ${year}?`,
                      a: `New hindi movies releasing in ${year} are listed at the top of the table above, with upcoming films marked "TBA" for release date. The Cinema Verse updates the ${year} hindi movies list regularly as new films are announced and released.`,
                    },
                    {
                      q: `Where can I watch hindi movies of ${year} online?`,
                      a: `Most ${year} Hindi movies are available to stream on Netflix, Amazon Prime Video, and Disney+ Hotstar after their theatrical run. Individual movie pages on The Cinema Verse include direct streaming links where available.`,
                    },
                    {
                      q: `Which upcoming hindi movies are releasing in ${year}?`,
                      a: `Several hindi films have TBA (To Be Announced) release dates in ${year}. These are shown at the top of the table above marked as "Upcoming". The Cinema Verse updates this list regularly as official release dates are announced.`,
                    },
                    {
                      q: `What is bollywood?`,
                      a: `Bollywood is the name for the Hindi-language film industry based in Mumbai, India. It produces 300–400 films annually for Hindi-speaking audiences across India and the global diaspora.`,
                    },
                    {
                      q: `Which OTT platform has the most ${year} hindi movies?`,
                      a: `The leading OTT platforms for ${year} Hindi movies are Netflix, Amazon Prime Video, and Disney+ Hotstar. These platforms carry the most complete catalogues of ${year} Hindi films. Visit individual movie pages on The Cinema Verse for direct streaming links.`,
                    },
                    {
                      q: `Who are the top bollywood actors of ${year}?`,
                      a: `Leading Bollywood actors in ${year} include Shah Rukh Khan, Salman Khan, Aamir Khan, and Ranveer Singh. Top actresses include Deepika Padukone, Alia Bhatt, Katrina Kaif, and Priyanka Chopra. See all cast details on individual movie pages on The Cinema Verse.`,
                    },
                    {
                      q: `What genres are popular in ${year} hindi cinema?`,
                      a: `The most popular genres in ${year} hindi cinema include action, romance, family drama, and comedy. Mythological, thriller, and social-issue films also have strong followings. The full ${year} hindi movies list on The Cinema Verse is filterable by genre.`,
                    },
                    {
                      q: `How many hindi films were Blockbusters in ${year}?`,
                      a: `The Cinema Verse tracks the box office verdict — Blockbuster, Superhit, Hit, Average, or Flop — for every ${year} hindi film. See the verdict breakdown section above for the exact number of ${year} bollywood Blockbusters and Superhits.`,
                    },
                  ].map(({ q, a }, i) => (
                    <details
                      key={i}
                      className="group border border-[#1f1f1f] rounded-xl overflow-hidden"
                    >
                      <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none bg-[#111] hover:bg-[#161616] transition-colors">
                        <span className="text-sm font-semibold text-gray-200">{q}</span>
                        <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0 transition-transform group-open:rotate-90" />
                      </summary>
                      <div className="px-4 py-3 text-sm text-gray-400 leading-relaxed border-t border-[#1a1a1a] bg-[#0d0d0d]">
                        {a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              {/* ══════════════════════════════════════════════════════════
                  SECTION 5 — EXPLORE BY YEAR (internal links)
              ══════════════════════════════════════════════════════ */}
              <section
                aria-labelledby="browse-years-heading"
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 md:p-8"
              >
                <h2
                  id="browse-years-heading"
                  className="font-display text-base font-bold text-white flex items-center gap-2 mb-4"
                >
                  <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  Explore Hindi Movies by Year
                </h2>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  The Cinema Verse covers the complete history of bollywood films from{" "}
                  {Math.min(...VALID_YEARS)} to {Math.max(...VALID_YEARS)}. Browse any year below to
                  see the full list of hindi movies with directors, release dates, and box office verdicts.
                </p>
                <div className="flex flex-wrap gap-2">
                  {VALID_YEARS.filter((yr) => yr !== year).map((yr) => (
                    <Link
                      key={yr}
                      href={`/movies/year/${yr}`}
                      title={`hindi movies released in ${yr}`}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#222] bg-[#111] text-gray-400 hover:border-brand-500/40 hover:text-brand-400 transition-all"
                    >
                      Hindi Movies {yr}
                    </Link>
                  ))}
                </div>
              </section>

              {/* ══════════════════════════════════════════════════════════
                  SECTION 6 — BROWSE BY GENRE (internal link hub)
              ══════════════════════════════════════════════════ */}
              <section
                aria-labelledby="browse-genre-heading"
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 md:p-8"
              >
                <h2
                  id="browse-genre-heading"
                  className="font-display text-base font-bold text-white flex items-center gap-2 mb-4"
                >
                  <Film className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  Browse {year} Hindi Movies by Genre
                </h2>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  bollywood produces films across every genre. Filter {year} hindi movies by genre to find the exact type of film you are looking for.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: `${year} bollywood Action Movies`,    href: `/movies/genre/action`    },
                    { label: `${year} bollywood Romance Movies`,   href: `/movies/genre/romance`   },
                    { label: `${year} bollywood Comedy Movies`,    href: `/movies/genre/comedy`    },
                    { label: `${year} bollywood Drama Movies`,     href: `/movies/genre/drama`     },
                    { label: `${year} bollywood Family Movies`,    href: `/movies/genre/family`    },
                    { label: `${year} bollywood Thriller Movies`,  href: `/movies/genre/thriller`  },
                    { label: `${year} bollywood Mythological Films`, href: `/movies/genre/mythological` },
                    { label: `${year} bollywood Horror Movies`,   href: `/movies/genre/horror`    },
                    { label: `${year} bollywood Social Films`,    href: `/movies/genre/social`    },
                    { label: `${year} bollywood Devotional Films`, href: `/movies/genre/devotional` },
                  ].map(({ label, href }) => (
                    <Link
                      key={label}
                      href={href}
                      title={label}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#222] bg-[#111] text-gray-400 hover:border-brand-500/40 hover:text-brand-400 transition-all"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </section>

              {/* ══════════════════════════════════════════════════════════
                  SECTION 7 — POPULAR BOLLYWOOD ACTORS & ACTRESSES
              ══════════════════════════════════════════════════ */}
              {topCast.length > 0 && (
              <section
                aria-labelledby="popular-stars-heading"
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 md:p-8"
              >
                <h2
                  id="popular-stars-heading"
                  className="font-display text-base font-bold text-white flex items-center gap-2 mb-2"
                >
                  <Star className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  Popular bollywood Stars in {year}
                </h2>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  Leading cast members who appeared in the most {year} bollywood films. Click a name to see their full profile and filmography on The Cinema Verse.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {topCast.map((member: any) => {
                    const role = member.roles?.[0] || member.type || "Artist";
                    return (
                      <Link
                        key={String(member._id)}
                        href={`/cast/${String(member._id)}`}
                        title={`${member.name} – bollywood ${role}`}
                        className="flex flex-col px-3 py-2.5 rounded-xl border border-[#1f1f1f] bg-[#111] hover:border-brand-500/30 hover:bg-[#161616] transition-all group"
                      >
                        <span className="text-xs font-semibold text-gray-300 group-hover:text-brand-400 transition-colors leading-snug">
                          {member.name}
                        </span>
                        <span className="text-[10px] text-gray-600 mt-0.5">{role}</span>
                      </Link>
                    );
                  })}
                </div>
              </section>
              )}

              {/* ══════════════════════════════════════════════════════════
                  SECTION 8 — OTT STREAMING PLATFORMS
              ══════════════════════════════════════════════════ */}
              <section
                aria-labelledby="ott-heading"
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 md:p-8"
              >
                <h2
                  id="ott-heading"
                  className="font-display text-base font-bold text-white flex items-center gap-2 mb-2"
                >
                  <Globe className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  Watch {year} Hindi Movies Online – OTT Platforms
                </h2>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                  After their theatrical run, most {year} hindi movies are available to stream on popular OTT platforms. Here is where you can watch bollywood films online:
                </p>
                <div className="space-y-2 text-sm text-gray-400 leading-relaxed">
                  {[
                    {
                      platform: "Aao NXT",
                      url: "https://aaonxt.com/",
                      desc: `Aao NXT is a dedicated bollywood OTT platform streaming ${year} bollywood movies, web series, and exclusive bollywood content. The go-to destination for bollywood digital entertainment.`,
                    },
                    {
                      platform: "Kanccha Lannka",
                      url: "https://www.kancchalannka.com/",
                      desc: `Kanccha Lannka is a popular bollywood streaming platform featuring ${year} bollywood releases, classic hindi films, and original bollywood content not available elsewhere.`,
                    },
                    {
                      platform: "Tarang Plus",
                      url: "https://tarangplus.in/",
                      desc: `Tarang Plus is the official OTT platform of Tarang TV, offering ${year} hindi movies, bollywood serials, and live TV. One of the most trusted names in bollywood digital streaming.`,
                    },
                  ].map(({ platform, url, desc }) => (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Watch hindi movies on ${platform}`}
                      className="flex gap-3 p-3 rounded-xl bg-[#111] border border-[#1a1a1a] hover:border-brand-500/30 hover:bg-[#161616] transition-all group"
                    >
                      <ExternalLink className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5 group-hover:text-brand-400" />
                      <div>
                        <span className="text-gray-200 font-semibold group-hover:text-brand-400 transition-colors">{platform} ↗</span>
                        <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                      </div>
                    </a>
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Availability varies by title. Visit individual movie pages on The Cinema Verse for direct streaming links where available.
                </p>
              </section>

              {/* ══════════════════════════════════════════════════════════
                  SECTION 9 — YEAR COMPARISON (boosts dwell time & links)
              ══════════════════════════════════════════════════ */}
              <section
                aria-labelledby="year-compare-heading"
                className="bg-[#0d0d0d] border border-[#1a1a1a] rounded-2xl p-6 md:p-8"
              >
                <h2
                  id="year-compare-heading"
                  className="font-display text-base font-bold text-white flex items-center gap-2 mb-2"
                >
                  <TrendingUp className="w-4 h-4 text-brand-500 flex-shrink-0" />
                  How Does {year} Compare to Other bollywood Years?
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed mb-4">
                  The hindi film industry has grown steadily year on year. In {year}, bollywood released{" "}
                  <strong className="text-gray-200">{total} films</strong> — spanning action, romance,
                  drama, comedy, and more. Compare with recent years:
                </p>
                <div className="flex flex-wrap gap-2">
                  {VALID_YEARS.filter((yr) => yr !== year).slice(0, 8).map((yr) => (
                    <Link
                      key={yr}
                      href={`/movies/year/${yr}`}
                      title={`Compare ${year} vs ${yr} hindi movies`}
                      className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-[#222] bg-[#111] text-gray-400 hover:border-brand-500/40 hover:text-brand-400 transition-all"
                    >
                      {yr} Hindi Movies
                    </Link>
                  ))}
                </div>
              </section>
            </>
          )}

        </div>
      </div>
    </>
  );
}
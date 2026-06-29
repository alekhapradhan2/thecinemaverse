import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie";
import { MovieCard } from "@/components/movie/MovieCard";
import { MoviesFilter } from "./MoviesFilter";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { buildMeta } from "@/lib/seo";
import {
  Film, Star, TrendingUp, Calendar, Filter, Award,
  ChevronRight, Clapperboard, Globe, Users, Zap,
  Clock, Flame, PlayCircle, BookOpen, Mic2,
} from "lucide-react";

export const revalidate = 600;

export const metadata: Metadata = buildMeta({
  title: "Hindi Movies – Complete bollywood Film Database | The Cinema Verse",
  description:
    "Browse the complete list of bollywood (bollywood) movies. Filter by genre, year, verdict and more. Find your favourite hindi films with full cast, songs, box office collection, trailers and reviews.",
  keywords: [
    "hindi movies list", "bollywood films", "hindi movies 2024", "hindi movies 2025",
    "hindi cinema database", "bollywood box office", "hindi film reviews",
    "best hindi movies", "new hindi movies", "hindi movie cast",
    "upcoming hindi movies", "bollywood blockbuster movies", "latest bollywood films",
  ],
  url: "/movies",
});

/* ─── CONSTANTS ──────────────────────────────────────────── */
const GENRES   = ["Action", "Romance", "Drama", "Comedy", "Thriller", "Horror", "Devotional", "Family", "Historical"];
const VERDICTS = ["Hit", "Superhit", "Blockbuster", "Average", "Flop", "Upcoming"];

const GENRE_META: Record<string, { emoji: string; desc: string; color: string }> = {
  Action:     { emoji: "⚔️",  desc: "High-octane bollywood action films",        color: "from-red-500/20 to-brand-500/10"   },
  Romance:    { emoji: "❤️",  desc: "Romantic bollywood love stories",        color: "from-pink-500/20 to-rose-500/10"    },
  Drama:      { emoji: "🎭",  desc: "Emotional bollywood drama films",            color: "from-purple-500/20 to-violet-500/10"},
  Comedy:     { emoji: "😄",  desc: "Fun bollywood comedy movies",                color: "from-yellow-500/20 to-amber-500/10" },
  Thriller:   { emoji: "🔍",  desc: "Suspenseful bollywood thrillers",            color: "from-cyan-500/20 to-sky-500/10"     },
  Horror:     { emoji: "👻",  desc: "Scary bollywood horror films",               color: "from-gray-700/40 to-zinc-800/10"    },
  Devotional: { emoji: "🪔",  desc: "Spiritual & devotional hindi films",     color: "from-amber-500/20 to-yellow-400/10" },
  Family:     { emoji: "👨‍👩‍👧",  desc: "Family entertainer hindi movies",       color: "from-green-500/20 to-emerald-500/10"},
  Historical: { emoji: "🏛️",  desc: "Historical bollywood period films",          color: "from-stone-500/20 to-slate-500/10"  },
};

const bollywood_FILM_FACTS = [
  { icon: Film,     stat: "1936",  label: "First Hindi Film",   note: "Sita Bibaha — the first ever bollywood feature film" },
  { icon: Globe,    stat: "40–60", label: "Films Per Year",    note: "bollywood produces 40–60 hindi films annually" },
  { icon: Users,    stat: "1000+", label: "Cast & Crew",       note: "Actors, directors & technicians in our database" },
  { icon: Calendar, stat: "85+",   label: "Years of Cinema",   note: "hindi cinema has a rich heritage of over 85 years" },
];

const VERDICT_TABS = [
  { label: "All",         value: null,         icon: Film,      color: "text-gray-300"  },
  { label: "Upcoming",    value: "Upcoming",   icon: Calendar,  color: "text-sky-400"   },
  { label: "Blockbuster", value: "Blockbuster",icon: Flame,     color: "text-brand-400"},
  { label: "Superhit",    value: "Superhit",   icon: Star,      color: "text-yellow-400"},
  { label: "Hit",         value: "Hit",        icon: TrendingUp,color: "text-green-400" },
  { label: "Average",     value: "Average",    icon: Zap,       color: "text-blue-400"  },
  { label: "Flop",        value: "Flop",       icon: Clock,     color: "text-red-400"   },
];

/* ─── HELPERS ────────────────────────────────────────────── */
function hasRealDate(releaseDate: any) {
  return { $and: [{ $ifNull: [releaseDate, false] }, { $ne: [releaseDate, ""] }] };
}

async function getMovies({ genre, verdict, sort, page }: {
  genre?: string; verdict?: string; sort?: string; page?: number;
}) {
  await connectDB();
  const LIMIT = 20;
  const skip  = ((page || 1) - 1) * LIMIT;
  const filter: any = {};
  if (genre) filter.genre = { $in: [genre] };

  if (verdict) {
    if (verdict === "Upcoming") {
      filter.$or = [{ verdict: "Upcoming" }, { verdict: { $exists: false } }, { verdict: null }];
    } else {
      filter.verdict = verdict;
    }
  }

  const sortMap: Record<string, any> = {
    oldest: { releaseDate:  1 },
    az:     { title:        1 },
    za:     { title:       -1 },
    rating: { imdbRating:  -1 },
  };

  if (verdict === "Upcoming" && (!sort || sort === "latest")) {
    const [movies, total] = await Promise.all([
      Movie.aggregate([
        { $match: filter },
        { $project: { reviews: 0 } },
        {
          $addFields: {
            _hasDated: { $cond: [hasRealDate("$releaseDate"), 1, 0] },
            _releaseDateObj: {
              $toDate: { $cond: [hasRealDate("$releaseDate"), "$releaseDate", "9999-12-31"] },
            },
          },
        },
        { $sort: { _hasDated: -1, _releaseDateObj: 1 } },
        { $skip: skip },
        { $limit: LIMIT },
      ]),
      Movie.countDocuments(filter),
    ]);
    return { movies, total, pages: Math.ceil(total / LIMIT) };
  }

  if (!sort || sort === "latest") {
    const [movies, total] = await Promise.all([
      Movie.aggregate([
        { $match: filter },
        { $project: { reviews: 0 } },
        {
          $addFields: {
            _releaseDateObj: {
              $toDate: { $cond: [hasRealDate("$releaseDate"), "$releaseDate", "1900-01-01"] },
            },
          },
        },
        { $sort: { _releaseDateObj: -1, _id: -1 } },
        { $skip: skip },
        { $limit: LIMIT },
      ]),
      Movie.countDocuments(filter),
    ]);
    return { movies, total, pages: Math.ceil(total / LIMIT) };
  }

  const sortBy = sortMap[sort] || sortMap.az;
  const [movies, total] = await Promise.all([
    Movie.find(filter, "-reviews").sort(sortBy).skip(skip).limit(LIMIT).lean(),
    Movie.countDocuments(filter),
  ]);

  return { movies, total, pages: Math.ceil(total / LIMIT) };
}

/* ─── ADSENSE COMPONENT (replace data-ad-slot with real slot IDs) ── */
function AdBanner({ slot, format = "auto", className = "" }: {
  slot: string; format?: string; className?: string;
}) {
  return (
    <div className={`adsense-container overflow-hidden rounded-xl ${className}`} aria-hidden="true">
      {/* Replace the ins tag below with your real AdSense code */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      {/* Script to push AdSense — add once in _document.tsx instead of inline */}
      {/* <script>(adsbygoogle = window.adsbygoogle || []).push({});</script> */}
    </div>
  );
}

/* ─── PAGE ───────────────────────────────────────────────── */
export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { genre?: string; verdict?: string; sort?: string; page?: string };
}) {
  const { genre, verdict, sort, page } = searchParams;
  const { movies, total, pages } = await getMovies({
    genre, verdict, sort, page: Number(page) || 1,
  });

  const currentPage = Number(page) || 1;
  const isFiltered  = !!(genre || verdict || sort);

  const activeVerdictLabel = verdict
    ? VERDICT_TABS.find((t) => t.value === verdict)?.label || verdict
    : "All";

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* ══════════════════════════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden bg-gradient-to-b from-[#0d0d0d] to-[#0a0a0a] border-b border-[#1f1f1f]"
        aria-label="hindi movies database hero"
      >
        {/* Decorative glows */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/6 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-600/4 rounded-full blur-2xl" />
          <div className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle at 70% 50%, #f9731608 0%, transparent 60%)" }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative z-10">
          {/* Breadcrumb — SEO canonical trail */}
          <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-5" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-brand-400 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/movies" className="hover:text-brand-400 transition-colors text-gray-300">Movies</Link>
            {genre && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-brand-400">{genre}</span>
              </>
            )}
            {verdict && !genre && (
              <>
                <ChevronRight className="w-3 h-3" />
                <span className="text-brand-400">{activeVerdictLabel} Films</span>
              </>
            )}
          </nav>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-brand-500/15 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clapperboard className="w-5 h-5 text-brand-500" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-black text-white leading-tight">
                  {genre
                    ? `${genre} Hindi Movies`
                    : verdict
                      ? `${activeVerdictLabel} Hindi Movies`
                      : "Hindi Movies — bollywood Film Database"}
                </h1>
              </div>
              <p className="text-gray-400 text-sm md:text-base max-w-xl leading-relaxed">
                {genre
                  ? `${GENRE_META[genre]?.desc || `Browse ${genre} films from bollywood`}. Discover the best ${genre.toLowerCase()} hindi movies with cast, box office and reviews.`
                  : verdict === "Upcoming"
                    ? "All confirmed upcoming hindi movies with release dates, cast details and trailers. Stay ahead of every new bollywood release."
                    : "The most complete bollywood film database — browse every hindi movie with cast, songs, box office collection, trailers and reviews."}
              </p>
            </div>

            {/* Live count pill */}
            <div className="flex items-center gap-2 bg-[#111] border border-[#1f1f1f] rounded-xl px-5 py-3 self-start md:self-auto flex-shrink-0">
              <Film className="w-4 h-4 text-brand-500" />
              <span className="text-2xl font-black text-white font-display">{total}</span>
              <span className="text-xs text-gray-500 leading-tight">bollywood<br />films</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          VERDICT TABS — "Section" navigation (Upcoming / Blockbuster / etc.)
      ══════════════════════════════════════════════════════════ */}
      <section
        className="sticky top-0 z-30 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1a1a1a]"
        aria-label="Browse movies by verdict"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3">
            {VERDICT_TABS.map(({ label, value, icon: Icon, color }) => {
              const isActive = (value === null && !verdict) || value === verdict;
              const href     = value ? `/movies?verdict=${value}` : "/movies";
              return (
                <Link
                  key={label}
                  href={href}
                  className={[
                    "flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                    isActive
                      ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20"
                      : `bg-[#141414] border border-[#222] ${color} hover:border-brand-500/30`,
                  ].join(" ")}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              );
            })}

            {/* Genre pills — compact */}
            <div className="w-px h-5 bg-[#2a2a2a] mx-2 flex-shrink-0" aria-hidden="true" />
            {GENRES.map((g) => (
              <Link
                key={g}
                href={`/movies?genre=${g}`}
                className={[
                  "flex-shrink-0 flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                  genre === g
                    ? "bg-brand-500/20 border border-brand-500/50 text-brand-300"
                    : "bg-[#141414] border border-[#222] text-gray-400 hover:border-brand-500/30 hover:text-brand-400",
                ].join(" ")}
              >
                {GENRE_META[g]?.emoji} {g}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          AD BANNER — Top leaderboard (728×90 / responsive)
          AdSense approval note: place after meaningful content,
          not at very top of page. This position is after nav.
      ══════════════════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <AdBanner slot="1234567890" format="horizontal" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-12">

        {/* ══════════════════════════════════════════════════════
            FILTER & SORT BAR
        ══════════════════════════════════════════════════════ */}
        <div className="bg-[#111] border border-[#1f1f1f] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-brand-500" />
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Refine Results</span>
            {isFiltered && (
              <Link href="/movies" className="ml-auto text-xs text-brand-400 hover:text-brand-300 transition-colors">
                Clear all filters
              </Link>
            )}
          </div>
          <MoviesFilter
            genres={GENRES}
            verdicts={VERDICTS}
            active={{ genre, verdict, sort, page: currentPage }}
            totalPages={pages}
          />
        </div>

        {/* ══════════════════════════════════════════════════════
            UPCOMING MOVIES SECTION (shown when no verdict filter active)
        ══════════════════════════════════════════════════════ */}
        {!verdict && !genre && (
          <section aria-labelledby="upcoming-heading">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sky-500/15 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h2 id="upcoming-heading" className="font-display text-lg font-bold text-white">
                    Upcoming Hindi Movies 2026
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Confirmed & announced bollywood releases</p>
                </div>
              </div>
              <Link
                href="/movies?verdict=Upcoming"
                className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 font-semibold transition-colors"
              >
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            {/* Upcoming preview strip — horizontal scroll on mobile */}
            <UpcomingStrip />
          </section>
        )}

        {/* ══════════════════════════════════════════════════════
            SECTION HEADER — dynamic title for current filter
        ══════════════════════════════════════════════════════ */}
        <section aria-label={`${genre || activeVerdictLabel || "bollywood"} movies list`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-6 bg-brand-500 rounded-full" aria-hidden="true" />
              <h2 className="font-display text-xl font-bold text-white">
                {verdict === "Upcoming"
                  ? "All Upcoming Hindi Films"
                  : verdict === "Blockbuster"
                    ? "bollywood Blockbusters"
                    : genre
                      ? `${genre} Hindi Movies`
                      : "Latest Hindi Movies"}
              </h2>
            </div>
            <p className="text-sm text-gray-500">
              <span className="text-white font-semibold">
                {(currentPage - 1) * 20 + 1}–{Math.min(currentPage * 20, total)}
              </span>{" "}
              of{" "}
              <span className="text-white font-semibold">{total}</span>
            </p>
          </div>

          {movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {movies.map((m: any, idx: number) => (
                <React.Fragment key={String(m._id)}>
                  <LoadingCard borderRadius={12}>
                    <MovieCard movie={m} />
                  </LoadingCard>

                  {/* ── In-grid AdSense unit after every 10th card ── */}
                  {(idx + 1) % 10 === 0 && (
                    <div
                      className="col-span-2 sm:col-span-3 md:col-span-4 lg:col-span-5 my-2"
                    >
                      <AdBanner slot="0987654321" format="auto" />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#111] border border-[#1f1f1f] rounded-2xl">
              <Film className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">No movies found</h3>
              <p className="text-gray-500 text-sm mb-6">Try a different filter or browse all hindi films.</p>
              <Link href="/movies" className="inline-flex items-center gap-2 text-brand-400 hover:text-brand-300 text-sm font-semibold transition-colors">
                View all movies <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </section>

        {/* ══════════════════════════════════════════════════════
            AD BANNER — Mid-page rectangle (300×250 / responsive)
        ══════════════════════════════════════════════════════ */}
        <AdBanner slot="1122334455" format="rectangle" />

        {/* ══════════════════════════════════════════════════════
            SEO BLOCK 1 — Browse by Genre (link grid)
        ══════════════════════════════════════════════════════ */}
        <section aria-labelledby="genre-browse-heading">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-brand-500 rounded-full" />
            <h2 id="genre-browse-heading" className="font-display text-xl font-bold text-white">
              Browse Hindi Movies by Genre
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {GENRES.map((g) => (
              <Link
                key={g}
                href={`/movies?genre=${g}`}
                title={`${GENRE_META[g]?.desc} — The Cinema Verse`}
                className={`group bg-gradient-to-br ${GENRE_META[g]?.color} border border-[#1f1f1f] hover:border-brand-500/40 rounded-xl p-4 transition-all hover:-translate-y-0.5 text-center`}
              >
                <div className="text-2xl mb-2">{GENRE_META[g]?.emoji}</div>
                <p className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">{g}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{GENRE_META[g]?.desc}</p>
                <div className="flex items-center justify-center gap-0.5 mt-2 text-brand-400 text-[10px] font-semibold group-hover:gap-1 transition-all">
                  Browse <ChevronRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SEO BLOCK 2 — Explore more (internal link hub)
            Strong internal linking = better crawl & PageRank flow
        ══════════════════════════════════════════════════════ */}
        <section aria-labelledby="explore-heading">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-brand-500 rounded-full" />
            <h2 id="explore-heading" className="font-display text-xl font-bold text-white">
              Explore More on The Cinema Verse
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: TrendingUp, href: "/box-office",
                title: "bollywood Box Office Collection",
                desc: "Day-wise net and gross collection for every hindi film — opening day figures, total earnings and verdict breakdowns.",
                cta: "View Box Office",
              },
              {
                icon: Users, href: "/cast",
                title: "bollywood Cast & Crew Profiles",
                desc: "Detailed profiles of bollywood actors, actresses, directors, producers and music directors with complete filmographies.",
                cta: "Browse Cast",
              },
              {
                icon: Mic2, href: "/songs",
                title: "Hindi Film Songs & Lyrics",
                desc: "Every song from every hindi film — YouTube videos, lyrics, singer credits and music director information.",
                cta: "Find Songs",
              },
              {
                icon: BookOpen, href: "/blog",
                title: "Hindi Film Reviews & Blog",
                desc: "In-depth reviews, top 10 lists, actor spotlights, behind-the-scenes stories and opinion pieces about bollywood.",
                cta: "Read Blog",
              },
            ].map(({ icon: Icon, href, title, desc, cta }) => (
              <Link
                key={title}
                href={href}
                title={`${title} — The Cinema Verse`}
                className="group bg-[#111] border border-[#1f1f1f] hover:border-brand-500/30 rounded-xl p-5 transition-all hover:-translate-y-0.5 flex flex-col"
              >
                <div className="w-9 h-9 bg-brand-500/10 rounded-xl flex items-center justify-center mb-3 group-hover:bg-brand-500/20 transition-colors">
                  <Icon className="w-4 h-4 text-brand-500" />
                </div>
                <h3 className="font-bold text-white text-sm mb-1.5">{title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed flex-1">{desc}</p>
                <div className="flex items-center gap-1 mt-4 text-brand-400 text-xs font-semibold group-hover:gap-2 transition-all">
                  {cta} <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            AD BANNER — Bottom rectangle before footer content
        ══════════════════════════════════════════════════════ */}
        <AdBanner slot="5566778899" format="auto" />

        {/* ══════════════════════════════════════════════════════
            SEO BLOCK 3 — About bollywood (rich editorial text)
        ══════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="about-bollywood-heading"
          className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-8 md:p-10"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-brand-500 rounded-full" />
            <h2 id="about-bollywood-heading" className="font-display text-xl md:text-2xl font-bold text-white">
              About Hindi Cinema — The bollywood Film Industry
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>
                <strong className="text-white">bollywood</strong> is the popular name for the{" "}
                <strong className="text-white">bollywood language film industry</strong>, based in Bhubaneswar,
                the capital of Odisha, India. It is one of India's oldest regional film industries,
                with its roots tracing back to <strong className="text-white">1936</strong> when{" "}
                <em>Sita Bibaha</em> became the first bollywood feature film ever produced.
              </p>
              <p>
                Today, Bollywood produces between <strong className="text-white">300 to 400 Hindi films every year</strong>,
                spanning genres like action, romance, drama, comedy, devotional, thriller and historical.
                The industry is deeply connected to India's culture — featuring stories rooted in
                traditions, mythology, folklore, and the everyday life of millions.
              </p>
              <p>
                Some of the biggest <strong className="text-white">Hindi movie stars</strong> include{", "}
                <strong className="text-white">Shah Rukh Khan</strong>, the reigning king of Bollywood,
                alongside <strong className="text-white">Salman Khan</strong>,{", "}
                <strong className="text-white">Aamir Khan</strong>,{", "}
                <strong className="text-white">Deepika Padukone</strong>,{", "}
                <strong className="text-white">Ranveer Singh</strong>, and{", "}
                <strong className="text-white">Alia Bhatt</strong>.
              </p>
            </div>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>
                The <strong className="text-white">box office performance</strong> of hindi films has grown
                significantly over the past decade. Modern bollywood blockbusters regularly collect over
                ₹1 crore in their opening week, with top hits like <em>Daman</em>, <em>Khusi</em>, and{" "}
                <em>Love Station</em> setting new records for hindi cinema.
              </p>
              <p>
                The Cinema Verse tracks every aspect of hindi cinema — from{" "}
                <strong className="text-white">day-wise box office collection</strong> to complete cast and
                crew details, song lyrics, YouTube trailers, and audience reviews. Our database currently
                features <strong className="text-white">{total}+ hindi films</strong>, making it the most
                comprehensive hindi movie database available online.
              </p>
              <p>
                Whether you're looking for <strong className="text-white">new hindi movies</strong> released
                in 2025, classic hindi films from the 1990s, or upcoming bollywood releases — The Cinema Verse is
                your one-stop destination for everything hindi cinema.
              </p>
            </div>
          </div>

          {/* Fact grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-[#1f1f1f]">
            {bollywood_FILM_FACTS.map(({ icon: Icon, stat, label, note }) => (
              <div key={label} className="text-center">
                <div className="w-9 h-9 bg-brand-500/10 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Icon className="w-4 h-4 text-brand-500" />
                </div>
                <p className="text-xl font-black text-white font-display">{stat}</p>
                <p className="text-xs font-semibold text-gray-300 mt-0.5">{label}</p>
                <p className="text-[10px] text-gray-600 mt-1 leading-tight">{note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SEO BLOCK 4 — FAQ (JSON-LD FAQ schema handled by buildMeta)
        ══════════════════════════════════════════════════════ */}
        <section
          aria-labelledby="faq-heading"
          className="bg-[#111] border border-[#1f1f1f] rounded-2xl p-8 md:p-10"
          itemScope
          itemType="https://schema.org/FAQPage"
        >
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-brand-500 rounded-full" />
            <h2 id="faq-heading" className="font-display text-xl md:text-2xl font-bold text-white">
              Frequently Asked Questions — Hindi Movies
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {[
              {
                q: "Where can I find a complete list of hindi movies?",
                a: "The Cinema Verse maintains the most complete database of bollywood (bollywood) films online. You can browse all hindi movies by genre, year, verdict, or alphabetically. Each movie page includes cast, songs, box office, synopsis and reviews.",
              },
              {
                q: "What are the latest hindi movies of 2025?",
                a: "The Cinema Verse regularly updates its database with the latest hindi films. Use the 'Latest' sort on this page to see the newest bollywood releases of 2025, complete with release dates, verdicts and box office figures.",
              },
              {
                q: "Which hindi movies are upcoming?",
                a: "Click the 'Upcoming' tab at the top of this page to see all announced and confirmed upcoming hindi movies with expected release dates, cast announcements and official trailer links.",
              },
              {
                q: "Which hindi movies are blockbusters?",
                a: "Filter by 'Blockbuster' verdict on this page to see all hindi films that achieved blockbuster status. The Cinema Verse calculates verdicts based on box office performance relative to the film's budget and screen count.",
              },
              {
                q: "How can I watch hindi movies online?",
                a: "Many hindi films are available on OTT platforms like Amazon Prime Video, Disney+ Hotstar, Zee5, and SunNXT. Each movie page on The Cinema Verse includes trailer links and OTT streaming information where available.",
              },
              {
                q: "What genres are popular in bollywood?",
                a: "hindi cinema is diverse — Action, Romance and Drama are the most popular genres. Devotional films set around the Jagannath Temple in Puri have a dedicated audience. Comedy and family entertainers also perform well at the bollywood box office.",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="border-b border-[#1f1f1f] pb-5 last:border-0"
                itemScope
                itemProp="mainEntity"
                itemType="https://schema.org/Question"
              >
                <h3 className="font-bold text-white text-sm mb-2 flex items-start gap-2" itemProp="name">
                  <span className="text-brand-500 mt-0.5 flex-shrink-0">Q.</span>
                  {q}
                </h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p className="text-gray-400 text-sm leading-relaxed pl-5" itemProp="text">{a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SEO BLOCK 5 — Year-based navigation links
            Helps Google discover year-filtered URLs
        ══════════════════════════════════════════════════════ */}
        <section aria-labelledby="year-nav-heading">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-brand-500 rounded-full" />
            <h2 id="year-nav-heading" className="font-display text-lg font-bold text-white">
              Hindi Movies by Year
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: new Date().getFullYear() - 2014 + 1 }, (_, i) => new Date().getFullYear() - i).map((yr) => (
              <Link
                key={yr}
                href={`/movies/year/${yr}`}
                title={`hindi movies released in ${yr}`}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-[#222] bg-[#111] text-gray-400 hover:border-brand-500/40 hover:text-brand-400 transition-all"
              >
                {yr}
              </Link>
            ))}

          </div>
        </section>

      </div>
    </div>
  );
}

/* ─── UPCOMING STRIP (server component placeholder) ─────── */
/**
 * UpcomingStrip: shows a horizontal scroll row of upcoming movies.
 * Replace this with real data fetch if you want it independent of the
 * main filter query — e.g. a separate `getUpcoming()` function.
 */
async function UpcomingStrip() {
  await connectDB();
  const upcoming = await Movie.aggregate([
    {
      $match: {
        $or: [{ verdict: "Upcoming" }, { verdict: { $exists: false } }, { verdict: null }],
      },
    },
    { $project: { reviews: 0 } },
    {
      $addFields: {
        _hasDated: {
          $cond: [
            { $and: [{ $ifNull: ["$releaseDate", false] }, { $ne: ["$releaseDate", ""] }] },
            1, 0,
          ],
        },
        _releaseDateObj: {
          $toDate: {
            $cond: [
              { $and: [{ $ifNull: ["$releaseDate", false] }, { $ne: ["$releaseDate", ""] }] },
              "$releaseDate", "9999-12-31",
            ],
          },
        },
      },
    },
    { $sort: { _hasDated: -1, _releaseDateObj: 1 } },
    { $limit: 10 },
  ]);

  if (!upcoming.length) return null;

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {upcoming.map((m: any) => (
          <div key={String(m._id)} className="flex-shrink-0 w-32 sm:w-36">
            <LoadingCard borderRadius={10}>
              <MovieCard movie={m} />
            </LoadingCard>
          </div>
        ))}
        <Link
          href="/movies?verdict=Upcoming"
          className="flex-shrink-0 w-32 sm:w-36 bg-[#111] border border-[#1f1f1f] rounded-xl flex flex-col items-center justify-center gap-2 text-center p-4 hover:border-brand-500/30 transition-all group"
        >
          <PlayCircle className="w-8 h-8 text-brand-500 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-semibold text-gray-400 group-hover:text-brand-400 transition-colors">
            View All Upcoming
          </span>
        </Link>
      </div>
      {/* Right fade gradient */}
      <div className="absolute right-0 top-0 bottom-2 w-16 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />
    </div>
  );
}
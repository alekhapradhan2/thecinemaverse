import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie";
import { MovieCard } from "@/components/movie/MovieCard";
import { MoviesFilter } from "./MoviesFilter";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { buildMeta, getLangMeta } from "@/lib/seo";
import { resolveLanguage, getLanguageFilter } from "@/lib/languages";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import { InfiniteMovieList } from "@/components/movie/InfiniteMovieList";
import { AdBanner } from "@/components/ui/AdBanner";
import { getMovies } from "./actions";
import {
  Film, Star, TrendingUp, Calendar, Filter, Award,
  ChevronRight, Clapperboard, Globe, Users, Zap,
  Clock, Flame, PlayCircle, BookOpen, Mic2,
} from "lucide-react";

export const revalidate = 600;

// Dynamic metadata — reflects active language
export async function generateMetadata({
  searchParams,
}: {
  searchParams: { lang?: string; genre?: string; verdict?: string };
}): Promise<Metadata> {
  const lang = resolveLanguage(searchParams.lang);
  const s    = getLangMeta(lang);
  return buildMeta({
    title: `${s.movies} – Complete ${s.industry} Film Database | The Cinema Verse`,
    description:
      `Browse the complete list of ${s.movies.toLowerCase()}. Filter by genre, year, verdict and more. Find your favourite ${lang.short.toLowerCase()} films with full cast, songs, box office collection, trailers and reviews.`,
    keywords: [
      `${lang.short.toLowerCase()} movies list`, `${s.adj} films`,
      `${lang.short.toLowerCase()} cinema database`, `${s.boxOffice.toLowerCase()}`,
      `best ${lang.short.toLowerCase()} movies`, `new ${lang.short.toLowerCase()} movies`,
      `upcoming ${lang.short.toLowerCase()} movies`, `${s.adj} blockbuster movies`,
      `latest ${s.adj} films`,
    ],
    url: searchParams.lang ? `/movies?lang=${searchParams.lang}` : "/movies",
  });
}

/* ─── CONSTANTS ──────────────────────────────────────────── */
const GENRES   = ["Action", "Romance", "Drama", "Comedy", "Thriller", "Horror", "Devotional", "Family", "Historical"];
const VERDICTS = ["Hit", "Superhit", "Blockbuster", "Average", "Flop", "Upcoming"];

const GENRE_META: Record<string, { emoji: string; desc: string; color: string }> = {
  Action:     { emoji: "⚔️",  desc: "High-octane action films",        color: "from-red-500/20 to-brand-500/10"   },
  Romance:    { emoji: "❤️",  desc: "Romantic love stories",        color: "from-pink-500/20 to-rose-500/10"    },
  Drama:      { emoji: "🎭",  desc: "Emotional drama films",            color: "from-purple-500/20 to-violet-500/10"},
  Comedy:     { emoji: "😄",  desc: "Fun comedy movies",                color: "from-yellow-500/20 to-amber-500/10" },
  Thriller:   { emoji: "🔍",  desc: "Suspenseful thrillers",            color: "from-cyan-500/20 to-sky-500/10"     },
  Horror:     { emoji: "👻",  desc: "Scary horror films",               color: "from-gray-700/40 to-zinc-800/10"    },
  Devotional: { emoji: "🪔",  desc: "Spiritual & devotional films",     color: "from-amber-500/20 to-yellow-400/10" },
  Family:     { emoji: "👨‍👩‍👧",  desc: "Family entertainer movies",       color: "from-green-500/20 to-emerald-500/10"},
  Historical: { emoji: "🏛️",  desc: "Historical period films",          color: "from-stone-500/20 to-slate-500/10"  },
};

const getFilmFacts = (lang: any, total: number) => [
  { icon: Globe,    stat: "Multi-regional", label: "Films Database",    note: `Comprehensive coverage of ${lang.industry} and Indian cinema` },
  { icon: Users,    stat: "1000+", label: "Cast & Crew",       note: "Actors, directors & technicians in our database" },
  { icon: Calendar, stat: "Updated",   label: "Daily",   note: `Regularly updated with new ${lang.short.toLowerCase()} releases` },
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

/* ─── CONSTANTS ──────────────────────────────────────────── */

/* ─── PAGE ───────────────────────────────────────────────── */
export default async function MoviesPage({
  searchParams,
}: {
  searchParams: { genre?: string; verdict?: string; sort?: string; page?: string; lang?: string };
}) {
  const { genre, verdict, sort, page, lang } = searchParams;
  const activeLang = resolveLanguage(lang);
  const s          = getLangMeta(activeLang);
  const { movies, total, pages } = await getMovies({
    genre, verdict, sort, page: Number(page) || 1, langKey: lang,
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
                    ? `${genre} ${activeLang.short} Movies`
                    : verdict
                      ? `${activeVerdictLabel} ${activeLang.short} Movies`
                      : `${activeLang.short} Movies — ${activeLang.industry} Film Database`}
                </h1>
              </div>
              {/* Language selector */}
              <div className="mb-3">
                <LanguageSelector activeLang={lang} />
              </div>
              <p className="text-gray-400 text-sm md:text-base max-w-xl leading-relaxed">
                {genre
                  ? `${GENRE_META[genre]?.desc || `Browse ${genre} films from ${activeLang.industry}`}. Discover the best ${genre.toLowerCase()} ${activeLang.short.toLowerCase()} movies with cast, box office and reviews.`
                  : verdict === "Upcoming"
                    ? `All confirmed upcoming ${activeLang.short.toLowerCase()} movies with release dates, cast details and trailers. Stay ahead of every new ${activeLang.industry} release.`
                    : `The most complete ${activeLang.industry} film database — browse every ${activeLang.short.toLowerCase()} movie with cast, songs, box office collection, trailers and reviews.`}
              </p>
            </div>

            {/* Live count pill */}
            <div className="flex items-center gap-2 bg-[#111] border border-[#1f1f1f] rounded-xl px-5 py-3 self-start md:self-auto flex-shrink-0">
              <Film className="w-4 h-4 text-brand-500" />
              <span className="text-2xl font-black text-white font-display">{total}</span>
              <span className="text-xs text-gray-500 leading-tight">{activeLang.short}<br />films</span>
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
                    Upcoming {activeLang.short} Movies 2026
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Confirmed & announced {s.industry.toLowerCase()} releases</p>
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
                  ? `All Upcoming ${activeLang.short} Films`
                  : verdict === "Blockbuster"
                    ? `${activeLang.short} Blockbusters`
                    : genre
                      ? `${genre} ${activeLang.short} Movies`
                      : `Latest ${activeLang.short} Movies`}
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
            <InfiniteMovieList 
              initialMovies={movies}
              initialPage={currentPage}
              totalPages={pages}
              genre={genre}
              verdict={verdict}
              sort={sort}
              langKey={lang}
            />
          ) : (
            <div className="text-center py-20 bg-[#111] border border-[#1f1f1f] rounded-2xl">
              <Film className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h3 className="text-white font-bold text-lg mb-2">No movies found</h3>
              <p className="text-gray-500 text-sm mb-6">Try a different filter or browse all {activeLang.short.toLowerCase()} films.</p>
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
              Browse {activeLang.short} Movies by Genre
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
                icon: TrendingUp, href: lang ? `/box-office?lang=${lang}` : "/box-office",
                title: `${activeLang.short} Box Office Collection`,
                desc: `Day-wise net and gross collection for every ${activeLang.short.toLowerCase()} film — opening day figures, total earnings and verdict breakdowns.`,
                cta: "View Box Office",
              },
              {
                icon: Users, href: lang ? `/cast?lang=${lang}` : "/cast",
                title: `${activeLang.short} Cast & Crew Profiles`,
                desc: `Detailed profiles of ${activeLang.short.toLowerCase()} actors, actresses, directors, producers and music directors with complete filmographies.`,
                cta: "Browse Cast",
              },
              {
                icon: Mic2, href: lang ? `/songs?lang=${lang}` : "/songs",
                title: `${activeLang.short} Film Songs & Lyrics`,
                desc: `Every song from every ${activeLang.short.toLowerCase()} film — YouTube videos, lyrics, singer credits and music director information.`,
                cta: "Find Songs",
              },
              {
                icon: BookOpen, href: "/blog",
                title: `${activeLang.short} Film Reviews & Blog`,
                desc: `In-depth reviews, top 10 lists, actor spotlights, behind-the-scenes stories and opinion pieces about ${s.industry}.`,
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
              About {s.industry}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>
                The <strong className="text-white">{s.industry}</strong> is one of the most vibrant film industries in India. 
                Producing highly entertaining movies across genres like action, romance, drama, comedy, and thriller, 
                <strong className="text-white"> {activeLang.short} films</strong> are deeply connected to the culture and everyday life of millions.
              </p>
              <p>
                The industry continues to grow with modern blockbusters regularly breaking box office records.
                The Cinema Verse tracks every aspect of <strong className="text-white">{s.industry}</strong> — from
                day-wise box office collection to complete cast and crew details, song lyrics, YouTube trailers, and audience reviews.
              </p>
              <p>
                Our database currently features <strong className="text-white">{total}+ {activeLang.short.toLowerCase()} films</strong>, making it the most
                comprehensive {activeLang.short.toLowerCase()} movie database available online.
              </p>
            </div>
            <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
              <p>
                Whether you're looking for <strong className="text-white">new {activeLang.short.toLowerCase()} movies</strong> released
                recently, classic films from the past, or upcoming releases — The Cinema Verse is
                your one-stop destination for everything <strong className="text-white">{s.industry}</strong>.
              </p>
              <p>
                Use the filters above to explore {activeLang.short} movies by year, genre, or box office verdict. 
                Stay tuned for regular updates, trailer releases, and in-depth movie information.
              </p>
            </div>
          </div>

          {/* Fact grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-[#1f1f1f]">
            {getFilmFacts(activeLang, total).map(({ icon: Icon, stat, label, note }) => (
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
              Frequently Asked Questions — {activeLang.short} Movies
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
            {[
              {
                q: `Where can I find a complete list of ${activeLang.short.toLowerCase()} movies?`,
                a: `The Cinema Verse maintains a complete database of ${s.industry} films online. You can browse all ${activeLang.short.toLowerCase()} movies by genre, year, verdict, or alphabetically. Each movie page includes cast, songs, box office, synopsis and reviews.`,
              },
              {
                q: `What are the latest ${activeLang.short.toLowerCase()} movies?`,
                a: `The Cinema Verse regularly updates its database with the latest ${activeLang.short.toLowerCase()} films. Use the 'Latest' sort on this page to see the newest ${s.industry} releases, complete with release dates, verdicts and box office figures.`,
              },
              {
                q: `Which ${activeLang.short.toLowerCase()} movies are upcoming?`,
                a: `Click the 'Upcoming' tab at the top of this page to see all announced and confirmed upcoming ${activeLang.short.toLowerCase()} movies with expected release dates, cast announcements and official trailer links.`,
              },
              {
                q: `Which ${activeLang.short.toLowerCase()} movies are blockbusters?`,
                a: `Filter by 'Blockbuster' verdict on this page to see all ${activeLang.short.toLowerCase()} films that achieved blockbuster status. The Cinema Verse calculates verdicts based on box office performance relative to the film's budget and screen count.`,
              },
              {
                q: `How can I watch ${activeLang.short.toLowerCase()} movies online?`,
                a: "Many films are available on OTT platforms like Amazon Prime Video, Disney+ Hotstar, Zee5, and SunNXT. Each movie page on The Cinema Verse includes trailer links and OTT streaming information where available.",
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
              {activeLang.short} Movies by Year
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: new Date().getFullYear() - 2014 + 1 }, (_, i) => new Date().getFullYear() - i).map((yr) => (
              <Link
                key={yr}
                href={lang ? `/movies/year/${yr}?lang=${lang}` : `/movies/year/${yr}`}
                title={`${activeLang.short.toLowerCase()} movies released in ${yr}`}
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
  const serialize = (arr: any[]) => JSON.parse(JSON.stringify(arr));
  const serializedUpcoming = serialize(upcoming);

  return (
    <div className="relative">
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {serializedUpcoming.map((m: any) => (
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
// src/app/movies/[category]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NotFound from "@/app/not-found";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Star, Calendar, TrendingUp } from "lucide-react";
import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie"; // ← same pattern as your Blog model
import { buildMeta, getLangMeta } from "@/lib/seo";
import { resolveLanguage } from "@/lib/languages";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

// ─── Types ────────────────────────────────────────────────────────────────────
interface MovieDoc {
  _id: string;
  title: string;
  slug: string;
  releaseDate: string;
  releaseYear: number;
  posterUrl: string;
  rating: number;
  views: number;
  songCount?: number;
}

// ─── Category Config ──────────────────────────────────────────────────────────
function getCategoryConfig(adj: string, industry: string, key?: string): Record<
  string,
  {
    title: string;
    metaTitle: string;
    metaDesc: string;
    h1: string;
    intro: string;
    keywords: string[];
  }
> {
  const isHindi = !key || key.toLowerCase() === "hindi";
  // For Hindi we use "bollywood" for SEO if appropriate, otherwise just the adj/industry
  const seoIndustry = isHindi ? "bollywood" : industry.toLowerCase();

  return {
    "2026": {
      title: `${adj} Movies 2026`,
      metaTitle: `${adj} Movies 2026 List | Upcoming & Latest ${seoIndustry} Films`,
      metaDesc:
        `Explore all ${adj.toLowerCase()} movies released in 2026 including upcoming films, cast, songs, and trailers. Complete ${seoIndustry} 2026 movie list with ratings and reviews.`,
      h1: `${adj} Movies 2026 — Complete ${seoIndustry} Film List`,
      intro:
        `The year 2026 is shaping up to be a landmark chapter in ${seoIndustry}. From action blockbusters to heartfelt family dramas, ${adj.toLowerCase()} cinema in 2026 continues to push creative boundaries. Browse the full 2026 release list with cast details, ratings, and official songs.`,
      keywords: [`${adj.toLowerCase()} movies 2026`, `${seoIndustry} 2026`, `new ${adj.toLowerCase()} films 2026`],
    },
    "2025": {
      title: `${adj} Movies 2025`,
      metaTitle: `${adj} Movies 2025 — Full ${seoIndustry} Film List with Ratings`,
      metaDesc:
        `Complete list of ${adj.toLowerCase()} movies released in 2025. Browse ${seoIndustry} films by genre, cast, and rating.`,
      h1: `${adj} Movies 2025 — Full ${seoIndustry} Release List`,
      intro:
        `2025 brought a rich and varied slate to ${seoIndustry}, with filmmakers exploring genres from supernatural thrillers to romantic musicals. This page compiles every ${adj.toLowerCase()} movie released in 2025 with ratings, cast details, and song listings.`,
      keywords: [`${adj.toLowerCase()} movies 2025`, `${seoIndustry} 2025`, `${adj.toLowerCase()} films 2025`],
    },
    "2024": {
      title: `${adj} Movies 2024`,
      metaTitle: `${adj} Movies 2024 — ${seoIndustry} Hits, Flops & Reviews`,
      metaDesc:
        `Browse all ${adj.toLowerCase()} movies of 2024 with cast, songs, box office, and reviews. The definitive ${seoIndustry} 2024 archive.`,
      h1: `${adj} Movies 2024 — Complete ${seoIndustry} Archive`,
      intro:
        `2024 was a watershed year for ${adj.toLowerCase()} cinema, with several films achieving mainstream recognition. This comprehensive archive covers every ${adj.toLowerCase()} movie released in 2024 — from blockbusters to indie gems.`,
      keywords: [`${adj.toLowerCase()} movies 2024`, `${seoIndustry} 2024`, `${adj.toLowerCase()} films list 2024`],
    },
    upcoming: {
      title: `Upcoming ${adj} Movies`,
      metaTitle: `Upcoming ${adj} Movies 2026 | Next ${seoIndustry} Releases & Trailers`,
      metaDesc:
        `Get the latest updates on upcoming ${adj.toLowerCase()} movies in 2026. Release dates, cast, trailers and songs for all announced ${seoIndustry} films.`,
      h1: `Upcoming ${adj} Movies — Next ${seoIndustry} Releases`,
      intro:
        `${seoIndustry}'s upcoming slate is packed with anticipated releases across every genre. This page tracks every announced and scheduled ${adj.toLowerCase()} movie yet to hit screens, updated in real-time with release dates, first-look posters, and pre-release song details.`,
      keywords: [`upcoming ${adj.toLowerCase()} movies`, `new ${seoIndustry} releases`, `${adj.toLowerCase()} movies 2026 upcoming`],
    },
    latest: {
      title: `Latest ${adj} Movies`,
      metaTitle: `Latest ${adj} Movies 2026 | Newest ${seoIndustry} Releases This Week`,
      metaDesc:
        `Watch the latest ${adj.toLowerCase()} movies released this week and month. Stay updated with the newest ${seoIndustry} films, songs, and reviews.`,
      h1: `Latest ${adj} Movies — Newest ${seoIndustry} Releases`,
      intro:
        `Stay ahead of the curve with The Cinema Verse's real-time tracker of the latest ${adj.toLowerCase()} movie releases. Updated every week, this page surfaces the freshest ${seoIndustry} content from theatrical releases to OTT premieres.`,
      keywords: [`latest ${adj.toLowerCase()} movies`, `new ${adj.toLowerCase()} films`, `${seoIndustry} new release`],
    },
    blockbuster: {
      title: `Blockbuster ${adj} Movies`,
      metaTitle: `Blockbuster ${adj} Movies | Top-Rated ${seoIndustry} Hits of All Time`,
      metaDesc:
        `Discover the biggest blockbuster ${adj.toLowerCase()} movies with top ratings and box office records. The ultimate list of hit ${seoIndustry} films.`,
      h1: `Blockbuster ${adj} Movies — ${seoIndustry}'s Greatest Hits`,
      intro:
        `These are the films that defined generations of ${adj.toLowerCase()} moviegoers — blockbusters that smashed box-office records, produced timeless songs, and created cultural moments that resonate to this day.`,
      keywords: [`blockbuster ${adj.toLowerCase()} movies`, `best ${seoIndustry} films`, `top rated ${adj.toLowerCase()} movies`],
    },
  };
}

export const revalidate = 600; // Revalidate every hour to keep data fresh

// ─── DB Query — mirrors your getBlog() pattern exactly ───────────────────────
async function getMovies(category: string): Promise<MovieDoc[]> {
  await connectDB();
  const today = new Date().toISOString();

const queryMap: Record<string, any> = {
  "2026": {
    releaseDate: {
      $regex: "^2026"   // ✅ matches "2026-01-01"
    }
  },
  "2025": {
    releaseDate: {
      $regex: "^2025"
    }
  },
  "2024": {
    releaseDate: {
      $regex: "^2024"
    }
  },
  upcoming: {
    releaseDate: { $gt: new Date().toISOString() }
  },
  latest: {
  releaseDate: { $lte: new Date().toISOString() }
    },
blockbuster: {
  $or: [
    { rating: { $gte: 7 } },     // lower threshold
    { views: { $gte: 1000 } }    // realistic
  ]
}
};

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    latest:   { releaseDate: -1 },
    upcoming: { releaseDate: 1 },
    default:  { rating: -1 },
  };

  const filter = queryMap[category] ?? queryMap["2026"];
  const sort   = sortMap[category] ?? sortMap["default"];

  const docs = await Movie.find(filter)
    .select("title slug releaseDate releaseYear posterUrl rating views songCount")
    .sort(sort)
    .limit(48)
    .lean();

  return (docs as any[]).map((d) => ({ ...d, _id: String(d._id) }));
}

// ─── Metadata — uses your existing buildMeta helper ──────────────────────────
export async function generateMetadata(
  props: {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ lang?: string }>;
  }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const activeLang = resolveLanguage(searchParams?.lang);
  const langMeta = getLangMeta(activeLang);
  const cfgMap = getCategoryConfig(langMeta.adj, langMeta.industry, activeLang.key);
  const cfg = cfgMap[params.category];

  if (!cfg) return {};
  return buildMeta({
    title:       cfg.metaTitle,
    description: cfg.metaDesc,
    keywords:    cfg.keywords,
    url:         `/movies/${params.category}`,
    activeLang,
  });
}

// ─── JSON-LD ──────────────────────────────────────────────────────────────────
function JsonLd({
  movies,
  category,
  cfg,
}: {
  movies: MovieDoc[];
  category: string;
  cfg: ReturnType<typeof getCategoryConfig>[string];
}) {
  const base = "https://thecinemaverses.in";

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: cfg.h1,
    url: `${base}/movies/${category}`,
    numberOfItems: movies.length,
    itemListElement: movies.slice(0, 10).map((m, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${base}/movie/${m.slug}`,
      name: m.title,
    })),
  };

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",    item: base },
      { "@type": "ListItem", position: 2, name: "Movies",  item: `${base}/movies` },
      { "@type": "ListItem", position: 3, name: cfg.title, item: `${base}/movies/${category}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}

// ─── Movie Card ───────────────────────────────────────────────────────────────
function MovieCard({ movie }: { movie: MovieDoc }) {
  return (
    <Link
      href={`/movie/${movie.slug}`}
      className="group block card overflow-hidden hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative aspect-[2/3] bg-[#1a1a1a]">
        <Image
          src={movie.posterUrl || "/placeholder-poster.jpg"}
          alt={`${movie.title} poster`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {movie.rating > 0 && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm text-brand-400 text-xs font-bold px-2 py-1 rounded-full">
            <Star className="w-3 h-3 fill-brand-400" />
            {movie.rating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-white text-sm font-semibold line-clamp-1 group-hover:text-brand-400 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-gray-500 text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {movie.releaseYear}
          </span>
          {(movie.songCount ?? 0) > 0 && (
            <span className="text-gray-500 text-xs">{movie.songCount} songs</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function MovieCategoryPage(
  props: {
    params: Promise<{ category: string }>;
    searchParams: Promise<{ lang?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const activeLang = resolveLanguage(searchParams?.lang);
  const langMeta = getLangMeta(activeLang);
  const cfgMap = getCategoryConfig(langMeta.adj, langMeta.industry, activeLang.key);
  const cfg = cfgMap[params.category];

  if (!cfg) return <NotFound />;

  const movies = await getMovies(params.category);

  const YEAR_LINKS  = ["2026", "2025", "2024"];
  const OTHER_LINKS = [
    { key: "upcoming",    label: "📅 Upcoming" },
    { key: "latest",      label: "🆕 Latest" },
    { key: "blockbuster", label: "🔥 Blockbusters" },
  ];

  return (
    <>
      <JsonLd movies={movies} category={params.category} cfg={cfg} />

      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Reuse your existing Breadcrumb component */}
          <Breadcrumb
            crumbs={[
              { label: "Movies", href: "/movies" },
              { label: cfg.title },
            ]}
          />

          {/* Header */}
          <div className="mb-8 mt-6">
            <h1 className="font-display text-3xl md:text-4xl font-black text-white leading-tight mb-4">
              {cfg.h1}
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-4xl">
              {cfg.intro}
            </p>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {YEAR_LINKS.map((yr) => (
              <Link
                key={yr}
                href={`/movies/${yr}`}
                className={`text-xs px-4 py-2 rounded-full border transition-all ${
                  params.category === yr
                    ? "bg-brand-500 border-brand-500 text-white"
                    : "border-[#2a2a2a] text-gray-400 hover:border-brand-500/40 hover:text-brand-400"
                }`}
              >
                {yr} Movies
              </Link>
            ))}
            {OTHER_LINKS.map(({ key, label }) => (
              <Link
                key={key}
                href={`/movies/${key}`}
                className={`text-xs px-4 py-2 rounded-full border transition-all ${
                  params.category === key
                    ? "bg-brand-500 border-brand-500 text-white"
                    : "border-[#2a2a2a] text-gray-400 hover:border-brand-500/40 hover:text-brand-400"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Results */}
          {movies.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-5">
                <p className="text-gray-500 text-sm">
                  <span className="text-white font-semibold">{movies.length}</span> movies found
                </p>
                <Link href="/movies" className="text-brand-400 text-xs hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="mt-12 text-gray-400 text-sm leading-relaxed max-w-4xl">
  <h2 className="text-lg font-semibold text-white mb-3">
    About {cfg.title}
  </h2>

  <p className="mb-3">
    {cfg.title} is a curated collection of {langMeta.industry} ({langMeta.adj}) films including
    latest releases, upcoming movies, and blockbuster hits. Each movie
    includes detailed information such as cast, release date, songs,
    ratings, and storyline.
  </p>

  <p>
    Stay updated with the latest trends in {langMeta.industry} cinema, discover new
    movies, and explore top-rated films all in one place on The Cinema Verse.
  </p>
</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {movies.map((movie) => (
                  <MovieCard key={movie._id} movie={movie} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No movies found yet. Check back soon!</p>
            </div>
          )}

          {/* Internal links */}
          <div className="mt-16 p-6 bg-[#111] border border-[#1e1e1e] rounded-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">Explore More {langMeta.industry} Content</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { label: `${langMeta.adj} Movies 2025`,       href: "/movies/2025" },
                { label: `${langMeta.adj} Movies 2024`,       href: "/movies/2024" },
                { label: "Upcoming Movies",        href: "/movies/upcoming" },
                { label: "Latest Songs",           href: "/songs/latest" },
                { label: "Trending Songs",         href: "/songs/trending" },
                { label: `${langMeta.adj} Songs 2026`,        href: "/songs/2026" },
                { label: "Top Singers",            href: "/songs/singers" },
                { label: "Cast & Crew",            href: "/cast" },
                { label: `${langMeta.adj} News`,          href: "/news" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-xs text-gray-400 hover:text-brand-400 bg-[#181818] hover:bg-brand-500/10 border border-[#222] hover:border-brand-500/30 px-3 py-1.5 rounded-full transition-all"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}


// ─── Static Params ────────────────────────────────────────────────────────────
export function generateStaticParams() {
  return Object.keys(getCategoryConfig("Hindi", "Bollywood")).map((category) => ({ category }));
}
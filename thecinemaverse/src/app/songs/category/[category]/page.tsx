// src/app/songs/category/[category]/page.tsx
//
// Route: /songs/category/2026, /songs/category/trending, etc.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Music, Play, TrendingUp } from "lucide-react";
import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie";
import { buildMeta } from "@/lib/seo";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

interface SongDoc {
  _id: string;
  title: string;
  singer: string;
  movieSlug: string;
  movieTitle: string;
  movieYear?: string;
  thumbnailUrl: string;
  ytId: string;
  songIndex: number;
}

const CATEGORY_CONFIG: Record<string, any> = {
  "2026": {
    title: "bollywood Songs 2026",
    metaTitle: "bollywood Songs 2026 | Latest bollywood Music & Video Songs",
    metaDesc: "Listen to all bollywood songs released in 2026. Full list of bollywood songs with singer details, movie names, and lyrics.",
    h1: "bollywood Songs 2026 — Latest bollywood Music",
    intro: "The 2026 bollywood music scene blends traditional folk rhythms with contemporary production. Browse every bollywood song from 2026 films, complete with singer credits and movie links.",
    keywords: ["bollywood songs 2026", "bollywood songs 2026", "new bollywood songs"],
    seoBody: "The year 2026 has brought a fresh wave of hindi film music, with composers experimenting across folk, romantic, and high-energy dance numbers. Every song listed here is sourced directly from 2026 bollywood releases, giving you a complete picture of this year's soundtrack landscape. Each entry includes the singer's name, the parent movie, and a direct link to the full song page — making this the definitive index for bollywood songs 2026.",
  },
  latest: {
    title: "Latest bollywood Songs",
    metaTitle: "Latest bollywood Songs 2026 | Newest bollywood Music This Week",
    metaDesc: "Discover the latest bollywood songs released this week. Fresh bollywood music with artist details and movie names.",
    h1: "Latest bollywood Songs — Freshest bollywood Tracks",
    intro: "Never miss a new bollywood release. Updated weekly as new soundtracks drop, this tracker surfaces the freshest bollywood songs first.",
    keywords: ["latest bollywood songs", "new bollywood songs 2026", "fresh bollywood music"],
    seoBody: "This page is refreshed whenever a new bollywood movie or single releases. You'll find the most recently added songs at the top, each linking to a dedicated song page with full lyrics, singer credits, and the original YouTube video. Bookmark this page if you want to stay current with the latest bollywood songs as they drop.",
  },
  trending: {
    title: "Trending bollywood Songs",
    metaTitle: "Trending bollywood Songs 2026 | Most Popular bollywood Hits Right Now",
    metaDesc: "See which bollywood songs are trending right now. Most-viewed and most-shared bollywood songs this week.",
    h1: "Trending bollywood Songs — What's Hot in bollywood",
    intro: "These are the bollywood songs everyone is listening to right now — ranked by streaming views and social shares, updated weekly.",
    keywords: ["trending bollywood songs", "popular bollywood songs", "viral bollywood songs"],
    seoBody: "Trending bollywood songs are determined by a combination of YouTube view counts and social sharing activity across platforms. Whether it's a romantic number from a new release or a viral folk dance track, you'll find it here. Check back regularly — this list is updated as audience attention shifts and new songs capture the spotlight in bollywood.",
  },
  classics: {
    title: "Old Hit bollywood Songs",
    metaTitle: "Old Hit bollywood Songs | Classic bollywood Songs of All Time",
    metaDesc: "Revisit the greatest classic bollywood songs from bollywood history. Timeless hits that defined generations.",
    h1: "Classic Old Hit bollywood Songs — Timeless bollywood Melodies",
    intro: "This archive celebrates the golden era of bollywood music, featuring legendary compositions and iconic singers from decades past.",
    keywords: ["old bollywood songs", "classic bollywood songs", "old hit bollywood songs"],
    seoBody: "Classic bollywood songs from the pre-2010 era represent some of the most beloved compositions in bollywood history. From the soulful melodies of the 1980s and 90s to the chart-toppers of the early 2000s, this collection is a tribute to the artists and composers who shaped the sound of hindi cinema. Each song links to its original movie page so you can explore the full context.",
  },
  singers: {
    title: "Top bollywood Singers",
    metaTitle: "Top bollywood Singers | Best bollywood Playback Artists & Voices",
    metaDesc: "Discover the top bollywood singers in bollywood. Profiles of the best playback artists with song lists and discographies.",
    h1: "Top bollywood Singers — The Voices of bollywood",
    intro: "From golden-era legends to rising contemporary stars — browse the most popular songs by each of bollywood's top singers.",
    keywords: ["top bollywood singers", "bollywood singers", "best bollywood playback singers"],
    seoBody: "bollywood's playback singing tradition runs deep, with artists spanning multiple generations lending their voices to iconic film songs. This section groups songs by singer, making it easy to discover an artist's full catalogue. Whether you're a fan of legendary veterans or curious about the newest voices in hindi cinema, this is your starting point.",
  },
};

// ── Data fetching (working query logic preserved exactly) ────────────────────
async function getSongs(category: string): Promise<SongDoc[]> {
  await connectDB();

  const today = new Date().toISOString();

  const movieMatchMap: Record<string, any> = {
    "2026":   { "media.songs.0": { $exists: true }, releaseDate: { $regex: "^2026" } },
    latest:   { "media.songs.0": { $exists: true }, releaseDate: { $lte: today } },
    trending: { "media.songs.0": { $exists: true } },
    classics: { "media.songs.0": { $exists: true }, releaseDate: { $regex: "^(19|20[0-1][0-9])" } },
    singers:  { "media.songs.0": { $exists: true } },
  };

  const sortMap: Record<string, any> = {
    latest:   { releaseDate: -1 },
    trending: { views: -1 },
    classics: { releaseDate: -1 },
    singers:  { "media.songs.singer": 1 },
    default:  { releaseDate: -1 },
  };

  const match = movieMatchMap[category] || { "media.songs.0": { $exists: true } };
  const sort  = sortMap[category] || sortMap.default;

  const docs = await Movie.find(match)
    .select("title slug releaseDate media.songs posterUrl")
    .sort(sort)
    .limit(24)
    .lean() as any[];

  const songs: SongDoc[] = [];

  for (const m of docs) {
    const year = m.releaseDate?.slice(0, 4);

    for (let i = 0; i < (m.media?.songs || []).length; i++) {
      const s = m.media.songs[i];
      if (!s?.title) continue;

      songs.push({
        _id: `${m._id}_${i}`,
        title: s.title,
        singer: s.singer || "",
        movieSlug: m.slug,
        movieTitle: m.title,
        movieYear: year,
        thumbnailUrl:
          s.thumbnailUrl ||
          (s.ytId ? `https://img.youtube.com/vi/${s.ytId}/mqdefault.jpg` : m.posterUrl) ||
          "",
        ytId: s.ytId || "",
        songIndex: i,
      });

      if (songs.length >= 48) break;
    }
    if (songs.length >= 48) break;
  }

  return songs;
}

// ── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const cfg = CATEGORY_CONFIG[params.category];
  if (!cfg) return {};
  return buildMeta({
    title: cfg.metaTitle,
    description: cfg.metaDesc,
    keywords: cfg.keywords,
    url: `/songs/category/${params.category}`,
  });
}

// ── JSON-LD ───────────────────────────────────────────────────────────────────
function JsonLd({ songs, category, cfg }: { songs: SongDoc[]; category: string; cfg: any }) {
  const base = "https://thecinemaverse.com";
  const itemList = {
    "@context": "https://schema.org", "@type": "ItemList",
    name: cfg.h1, url: `${base}/songs/category/${category}`, numberOfItems: songs.length,
    itemListElement: songs.slice(0, 10).map((s, i) => ({
      "@type": "ListItem", position: i + 1,
      url: `${base}/songs/${s.movieSlug}/${s.songIndex}`, name: s.title,
    })),
  };
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",  item: base },
      { "@type": "ListItem", position: 2, name: "Songs", item: `${base}/songs` },
      { "@type": "ListItem", position: 3, name: cfg.title, item: `${base}/songs/category/${category}` },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}

// ── Song Card (UI from doc 1) ─────────────────────────────────────────────────
function SongCard({ song }: { song: SongDoc }) {
  return (
    <Link
      href={`/songs/${song.movieSlug}/${song.songIndex}`}
      className="group flex gap-3 items-center card p-3 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#1a1a1a]">
        <Image
          src={song.thumbnailUrl || "/placeholder-song.jpg"}
          alt={song.title}
          fill sizes="64px"
          className="object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-white text-sm font-semibold truncate group-hover:text-brand-400 transition-colors">
          {song.title}
        </h3>
        <p className="text-gray-500 text-xs mt-0.5 truncate">
          {song.singer}{song.singer && song.movieTitle ? " · " : ""}{song.movieTitle}
          {song.movieYear ? ` (${song.movieYear})` : ""}
        </p>
        {song.ytId && <p className="text-gray-600 text-xs mt-0.5">▶ YouTube</p>}
      </div>
      <Music className="w-4 h-4 text-gray-600 group-hover:text-brand-500 transition-colors flex-shrink-0" />
    </Link>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function SongCategoryPage({ params }: any) {
  const cfg = CATEGORY_CONFIG[params.category];
  if (!cfg) notFound();

  const songs = await getSongs(params.category);

  return (
    <>
      <JsonLd songs={songs} category={params.category} cfg={cfg} />
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <Breadcrumb crumbs={[{ label: "Songs", href: "/songs" }, { label: cfg.title }]} />

          <div className="mb-8 mt-6">
            <h1 className="font-display text-3xl md:text-4xl font-black text-white leading-tight mb-4">
              {cfg.h1}
            </h1>
            <p className="text-gray-400 text-sm md:text-base leading-relaxed max-w-4xl">{cfg.intro}</p>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { key: "2026",     label: "2026 Songs" },
              { key: "latest",   label: "🆕 Latest" },
              { key: "trending", label: "🔥 Trending" },
              { key: "classics", label: "🎵 Classics" },
              { key: "singers",  label: "🎤 Top Singers" },
            ].map(({ key, label }) => (
              <Link
                key={key}
                href={`/songs/category/${key}`}
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

          {songs.length > 0 ? (
            <>
              <p className="text-gray-500 text-sm mb-5">
                <span className="text-white font-semibold">{songs.length}</span> songs found
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {songs.map((s) => <SongCard key={s._id} song={s} />)}
              </div>

              {/* SEO content block */}
              <div className="mt-12 p-6 bg-[#111] border border-[#1e1e1e] rounded-2xl">
                <h2 className="text-lg font-semibold text-white mb-3">About {cfg.title}</h2>
                <p className="text-gray-400 text-sm leading-relaxed max-w-4xl">{cfg.seoBody}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No songs found yet. Check back soon!</p>
            </div>
          )}

          {/* Explore more */}
          <div className="mt-8 p-6 bg-[#111] border border-[#1e1e1e] rounded-2xl">
            <h2 className="text-lg font-semibold text-white mb-4">Explore More bollywood</h2>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Hindi Movies 2026",   href: "/movies/2026" },
                { label: "Hindi Movies 2025",   href: "/movies/2025" },
                { label: "Upcoming Movies",    href: "/movies/upcoming" },
                { label: "Blockbuster Movies", href: "/movies/blockbuster" },
                { label: "Latest Movies",      href: "/movies/latest" },
                { label: "bollywood News",      href: "/news" },
                { label: "Cast & Crew",        href: "/cast" },
                { label: "Best bollywood Songs",    href: "/blog/bollywood-guides/best-bollywood-songs" },
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

export function generateStaticParams() {
  return Object.keys(CATEGORY_CONFIG).map((category) => ({ category }));
}
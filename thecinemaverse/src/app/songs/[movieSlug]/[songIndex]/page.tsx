import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NotFound from "@/app/not-found";
import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie";
import { buildMeta } from "@/lib/seo";
import { SongDetailClient } from "./SongDetailClient";
import type { MovieData, SongData } from "./types";

export const revalidate = 600;
export const dynamicParams = true;

export async function generateStaticParams() {
  return [];
}

export type { MovieData, SongData };

function toSlug(str?: string): string {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function getMovieWithSongs(movieSlug: string): Promise<MovieData | null> {
  await connectDB();
  const isObjectId = /^[a-f0-9]{24}$/i.test(movieSlug);
  const query = isObjectId ? { _id: movieSlug } : { slug: movieSlug };
  const movie = await (Movie as any).findOne(query).lean();
  if (!movie) return null;
  return JSON.parse(JSON.stringify(movie)) as MovieData;
}

async function getRelatedMovies(movie: MovieData): Promise<MovieData[]> {
  if (!movie.genre?.length) return [];
  const related = await (Movie as any)
    .find({ _id: { $ne: movie._id }, genre: { $in: movie.genre } })
    .select("title slug posterUrl thumbnailUrl releaseDate genre verdict media.songs")
    .limit(20)
    .lean();
  return JSON.parse(JSON.stringify(related)) as MovieData[];
}

export async function generateMetadata(
  props: {
    params: Promise<{ movieSlug: string; songIndex: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const movie = await getMovieWithSongs(params.movieSlug);
  const idx   = parseInt(params.songIndex, 10) || 0;
  const song  = movie?.media?.songs?.[idx];

  if (!movie || !song) {
    return buildMeta({
      title: "Song Not Found – The Cinema Verse",
      description: "The requested song could not be found.",
      url: `/songs/${params.movieSlug}/${params.songIndex}`,
    });
  }

  const year      = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "";
  const singerStr = song.singer ? ` by ${song.singer}` : "";
  const mdStr     = song.musicDirector ? ` | Music: ${song.musicDirector}` : "";
  const thumb     = song.thumbnailUrl
    || (song.ytId ? `https://img.youtube.com/vi/${song.ytId}/hqdefault.jpg` : null)
    || movie.posterUrl;

  const langStr = movie.language || "Hindi";
  const indStr  = langStr === "Hindi" ? "Bollywood" : langStr;

  const title       = `${song.title}${singerStr} – ${movie.title}${year ? ` (${year})` : ""} ${indStr} Song`;
  const description = [
    `Listen to "${song.title}"${singerStr} from the ${langStr.toLowerCase()} film "${movie.title}"${year ? ` (${year})` : ""}.`,
    song.lyrics?.trim() ? " Read the full lyrics." : "",
    song.description ? ` ${song.description.slice(0, 120)}` : "",
    ` ${mdStr}. Watch on YouTube, explore the full playlist and related ${indStr.toLowerCase()} songs on The Cinema Verse.`,
  ].join("").replace(/\s+/g, " ").trim();

  const keywords = [
    song.title,
    `${song.title} lyrics`,
    `${song.title} song`,
    song.singer && `${song.singer} songs`,
    song.musicDirector && `${song.musicDirector} music`,
    `${movie.title} songs`,
    `${movie.title} album`,
    `${indStr.toLowerCase()} song`,
    `${langStr.toLowerCase()} film song`,
    year && `${indStr.toLowerCase()} songs ${year}`,
    ...(movie.genre || []).map((g: string) => `${g} ${langStr.toLowerCase()} film`),
  ].filter(Boolean) as string[];

  const stableSlug = toSlug(song.title) || String(idx);
  const canonical  = `https://thecinemaverses.in/songs/${movie.slug}/${idx}/${stableSlug}`;

  return {
    ...buildMeta({ title, description, keywords, url: `/songs/${movie.slug}/${idx}/${stableSlug}` }),
    openGraph: {
      title,
      description,
      url: canonical,
      type: "music.song",
      images: thumb ? [{ url: thumb, width: 1280, height: 720, alt: song.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: thumb ? [thumb] : [],
    },
    alternates: {
      canonical,
    },
  };
}

export default async function SongDetailPage(
  props: {
    params: Promise<{ movieSlug: string; songIndex: string }>;
  }
) {
  const params = await props.params;
  const movie = await getMovieWithSongs(params.movieSlug);
  const idx   = parseInt(params.songIndex, 10) || 0;

  if (!movie || !movie.media?.songs?.length) return <NotFound />;

  const song = movie.media.songs[idx] ?? movie.media.songs[0];
  if (!song) return <NotFound />;

  const relatedMovies = await getRelatedMovies(movie);

  const thumb = song.thumbnailUrl
    || (song.ytId ? `https://img.youtube.com/vi/${song.ytId}/hqdefault.jpg` : null)
    || movie.posterUrl;
  const year  = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : undefined;
  const langStr = movie.language || "Hindi";
  const stableSlug = toSlug(song.title) || String(idx);
  const canonical  = `https://thecinemaverses.in/songs/${movie.slug}/${idx}/${stableSlug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MusicRecording",
        "@id": `${canonical}#song`,
        "name": song.title,
        "description": song.description || `${song.title} is a song from the ${langStr.toLowerCase()} film ${movie.title}${year ? ` (${year})` : ""}.`,
        ...(song.singer && { "byArtist": { "@type": "MusicGroup", "name": song.singer } }),
        ...(thumb && { "thumbnailUrl": thumb }),
        ...(song.ytId && {
          "url": `https://www.youtube.com/watch?v=${song.ytId}`,
          "sameAs": `https://www.youtube.com/watch?v=${song.ytId}`,
        }),
        "inAlbum": {
          "@type": "MusicAlbum",
          "name": `${movie.title} Original Soundtrack`,
          "byArtist": song.musicDirector
            ? { "@type": "Person", "name": song.musicDirector }
            : undefined,
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home",      "item": "https://thecinemaverses.in/" },
          { "@type": "ListItem", "position": 2, "name": "Songs",     "item": "https://thecinemaverses.in/songs" },
          { "@type": "ListItem", "position": 3, "name": movie.title, "item": `https://thecinemaverses.in/movie/${movie.slug}` },
          { "@type": "ListItem", "position": 4, "name": song.title,  "item": canonical },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SongDetailClient
        movie={movie}
        initialSongIndex={idx}
        relatedMovies={relatedMovies}
      />
    </>
  );
}
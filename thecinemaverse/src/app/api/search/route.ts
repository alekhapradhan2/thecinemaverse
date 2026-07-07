export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie";
import Cast from "@/models/Cast";
import Blog from "@/models/Blog";

import { getLanguageFilter } from "@/lib/languages";

// ─── Regex builders ───────────────────────────────────────────────────────────

// Exact substring match (fast, highest priority)
function exactRegex(q: string) {
  return { $regex: q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
}

// Character-sequence fuzzy: "avngers" → /a.*v.*n.*g.*e.*r.*s/i
// Good for missing / reordered chars. Only used for queries ≥ 3 chars.
function fuzzyRegex(q: string) {
  const s = q.trim();
  if (s.length < 3) return exactRegex(s);
  const escaped = s
    .split("")
    .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return { $regex: escaped, $options: "i" };
}

// Drop-ONE-char variants only (not every char optional — that matches everything)
// For each position we build a regex with that ONE character dropped.
// We OR them all together at the MongoDB level.
function dropOneRegexes(q: string): Record<string, any>[] {
  const s = q.trim();
  if (s.length <= 3) return [];
  const variants: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const dropped = s.slice(0, i) + s.slice(i + 1);
    variants.push(dropped.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  }
  // Return as array of $regex objects to be used in $or
  return variants.map((v) => ({ $regex: v, $options: "i" }));
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q) {
      return NextResponse.json({ movies: [], cast: [], blogs: [], songs: [], boxOffice: [] });
    }

    // Optional language boost
    const langKey     = searchParams.get("lang");
    const langDbValue = getLanguageFilter(langKey);

    const exact    = exactRegex(q);
    const fuzzy    = fuzzyRegex(q);
    const dropOnes = dropOneRegexes(q); // array of {$regex,...}

    // Build an OR filter across the given fields, combining all match strategies
    function orFilter(...fields: string[]) {
      const conditions: Record<string, any>[] = [];
      for (const f of fields) {
        conditions.push({ [f]: exact });
        conditions.push({ [f]: fuzzy });
        for (const d of dropOnes) {
          conditions.push({ [f]: d });
        }
      }
      return { $or: conditions };
    }

    const [movies, cast, blogs, songMovies] = await Promise.all([
      Movie.find(
        orFilter("title", "director"),
        "title slug posterUrl thumbnailUrl releaseDate genre verdict language"
      )
        .limit(langDbValue ? 12 : 8)
        .lean(),

      Cast.find(
        orFilter("name"),
        "name photo type roles slug"
      )
        .limit(5)
        .lean(),

      Blog.find(
        { published: true, ...orFilter("title", "excerpt", "tags") },
        "title slug excerpt coverImage category createdAt"
      )
        .limit(4)
        .lean(),

      Movie.find(
        { $or: [{ "media.songs.title": exact }, { "media.songs.title": fuzzy }] },
        "title slug media.songs posterUrl"
      )
        .limit(5)
        .lean(),
    ]);

    // Language boost: sort matching-language movies first
    let sortedMovies = movies as any[];
    if (langDbValue) {
      sortedMovies = [
        ...sortedMovies.filter((m: any) => m.language === langDbValue),
        ...sortedMovies.filter((m: any) => m.language !== langDbValue),
      ].slice(0, 8);
    }

    // Flatten matching songs from movie documents using fuzzy regex in JS
    const fuzzyRe = new RegExp(
      q.split("").map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*"),
      "i"
    );
    const exactRe = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

    const songs = (songMovies as any[]).flatMap((m: any) =>
      (m.media?.songs || [])
        .filter((s: any) => exactRe.test(s.title || "") || fuzzyRe.test(s.title || ""))
        .slice(0, 2)
        .map((s: any, i: number) => ({
          title: s.title,
          singer: s.singer,
          movieTitle: m.title,
          movieSlug: m.slug,
          songIndex: i,
          thumbnailUrl: s.thumbnailUrl || (s.ytId ? `https://img.youtube.com/vi/${s.ytId}/mqdefault.jpg` : m.posterUrl),
        }))
    ).slice(0, 5);

    return NextResponse.json({ movies: sortedMovies, cast, blogs, songs, query: q });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
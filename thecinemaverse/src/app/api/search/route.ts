import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie";
import Cast from "@/models/Cast";
import Blog from "@/models/Blog";
import { getLanguageFilter } from "@/lib/languages";

// ─── Build a fuzzy regex from the query ──────────────────────────────────────
// "avngers" → /a.*v.*n.*g.*e.*r.*s/i  so typos/missing chars still match
function fuzzyRegex(q: string) {
  const escaped = q
    .trim()
    .split("")
    .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");
  return { $regex: escaped, $options: "i" };
}

// Exact-prefix / contains regex (fast, used alongside fuzzy on OR)
function exactRegex(q: string) {
  return { $regex: q.trim(), $options: "i" };
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    if (!q) {
      return NextResponse.json({ movies: [], cast: [], blogs: [], songs: [], boxOffice: [] });
    }

    // Optional language boost — if provided, prioritize that language in results
    const langKey      = searchParams.get("lang");
    const langDbValue  = getLanguageFilter(langKey);

    const exact = exactRegex(q);
    const fuzzy = fuzzyRegex(q);

    // Helper: build an OR filter that checks both exact and fuzzy on every field
    function orFilter(...fields: string[]) {
      return {
        $or: fields.flatMap((f) => [{ [f]: exact }, { [f]: fuzzy }]),
      };
    }

    const [movies, cast, blogs, songMovies] = await Promise.all([
      Movie.find(
        orFilter("title", "director", "genre"),
        "title slug posterUrl thumbnailUrl releaseDate genre verdict language"
      )
        .limit(langDbValue ? 12 : 6) // fetch more when language-boosting so we can sort
        .lean(),

      Cast.find(
        orFilter("name", "type"),
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
        { "media.songs.title": exact },
        "title slug media.songs posterUrl"
      )
        .limit(5)
        .lean(),
    ]);

    // Language boost: if lang param present, sort matching-language movies first
    let sortedMovies = movies as any[];
    if (langDbValue) {
      sortedMovies = [
        ...sortedMovies.filter((m: any) => m.language === langDbValue),
        ...sortedMovies.filter((m: any) => m.language !== langDbValue),
      ].slice(0, 6);
    }

    // Flatten matching songs from movie documents
    const songs = (songMovies as any[]).flatMap((m: any) =>
      (m.media?.songs || [])
        .filter((s: any) => new RegExp(q, "i").test(s.title || ""))
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
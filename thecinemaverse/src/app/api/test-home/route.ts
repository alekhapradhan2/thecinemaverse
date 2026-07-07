import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie";
import Blog from "@/models/Blog";
import { resolveLanguage, getLanguageFilter } from "@/lib/languages";

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await connectDB();
    const langDbValue = getLanguageFilter("hindi");
    const movieQuery = langDbValue ? { language: langDbValue } : {};

    const [allMoviesRaw, upcomingMoviesRaw, latestBlogsRaw] = await Promise.all([
      Movie.find(movieQuery, "-reviews -media.songs").sort({ releaseDate: -1 }).limit(80).lean(),
      Movie.aggregate([
        { $match: { $and: [ movieQuery, { $or: [{ verdict: "Upcoming" }, { verdict: { $exists: false } }, { verdict: null }] }] } },
        { $project: { reviews: 0, "media.songs": 0 } },
        {
          $addFields: {
            _hasDated: { $cond: [ { $and: [{ $ifNull: ["$releaseDate", false] }, { $ne: ["$releaseDate", ""] }] }, 1, 0 ] },
            _releaseDateObj: { $toDate: { $cond: [ { $and: [{ $ifNull: ["$releaseDate", false] }, { $ne: ["$releaseDate", ""] }] }, "$releaseDate", "9999-12-31" ] } },
          },
        },
        { $sort: { _hasDated: -1, _releaseDateObj: 1 } },
        { $limit: 6 },
      ]),
      Blog.find({ published: true }, "-content -reviews").sort({ createdAt: -1 }).limit(3).lean(),
    ]);

    return NextResponse.json({ 
      success: true, 
      moviesCount: allMoviesRaw.length, 
      upcomingCount: upcomingMoviesRaw.length, 
      blogsCount: latestBlogsRaw.length 
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message, stack: err.stack });
  }
}

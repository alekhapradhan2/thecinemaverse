"use server";

import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie";
import { getLanguageFilter } from "@/lib/languages";

function hasRealDate(releaseDate: any) {
  return { $and: [{ $ifNull: [releaseDate, false] }, { $ne: [releaseDate, ""] }] };
}

export async function getMovies({ genre, verdict, sort, page, langKey }: {
  genre?: string; verdict?: string; sort?: string; page?: number; langKey?: string;
}) {
  await connectDB();
  const LIMIT = 20;
  const skip  = ((page || 1) - 1) * LIMIT;
  const filter: any = {};
  if (genre) filter.genre = { $in: [genre] };

  // Language filter — apply only when a specific language is requested
  const langDbValue = getLanguageFilter(langKey);
  if (langDbValue) filter.language = langDbValue;

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
    const serialize = (arr: any[]) => JSON.parse(JSON.stringify(arr));
    return { movies: serialize(movies), total, pages: Math.ceil(total / LIMIT) };
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
    const serialize = (arr: any[]) => JSON.parse(JSON.stringify(arr));
    return { movies: serialize(movies), total, pages: Math.ceil(total / LIMIT) };
  }

  const sortBy = sortMap[sort] || sortMap.az;
  const [movies, total] = await Promise.all([
    Movie.find(filter, "-reviews").sort(sortBy).skip(skip).limit(LIMIT).lean(),
    Movie.countDocuments(filter),
  ]);

  const serialize = (arr: any[]) => JSON.parse(JSON.stringify(arr));
  return { movies: serialize(movies), total, pages: Math.ceil(total / LIMIT) };
}

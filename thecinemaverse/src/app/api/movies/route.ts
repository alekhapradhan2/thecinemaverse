export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Movie from "@/models/Movie";
import { getLanguageFilter } from "@/lib/languages";


export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const page    = parseInt(searchParams.get("page")  || "1");
    const limit   = parseInt(searchParams.get("limit") || "20");
    const genre   = searchParams.get("genre");
    const verdict = searchParams.get("verdict");
    const sort    = searchParams.get("sort") || "-createdAt";
    const lang    = searchParams.get("language") || searchParams.get("lang");
    const skip    = (page - 1) * limit;

    const filter: any = {};
    if (genre)   filter.genre   = { $in: [genre] };
    if (verdict) filter.verdict = verdict;

    // Language filter — optional; if absent, returns all languages (backward-compat)
    const langDbValue = getLanguageFilter(lang);
    if (langDbValue) filter.language = langDbValue;

    const [movies, total] = await Promise.all([
      Movie.find(filter, "-reviews")
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("productionId", "name logo")
        .lean(),
      Movie.countDocuments(filter),
    ]);

    return NextResponse.json({
      movies,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


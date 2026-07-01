"use client";

import React, { useState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { MovieCard } from "@/components/movie/MovieCard";
import { LoadingCard } from "@/components/ui/LoadingCard";
import { AdBanner } from "@/components/ui/AdBanner";
import { getMovies } from "@/app/movies/actions";

interface InfiniteMovieListProps {
  initialMovies: any[];
  initialPage: number;
  totalPages: number;
  genre?: string;
  verdict?: string;
  sort?: string;
  langKey?: string;
}

export function InfiniteMovieList({
  initialMovies,
  initialPage,
  totalPages,
  genre,
  verdict,
  sort,
  langKey,
}: InfiniteMovieListProps) {
  const [movies, setMovies] = useState(initialMovies);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialPage < totalPages);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state if initialMovies changes (e.g. filters changed)
    setMovies(initialMovies);
    setPage(initialPage);
    setHasMore(initialPage < totalPages);
  }, [initialMovies, initialPage, totalPages, genre, verdict, sort, langKey]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, loading]);

  const loadMore = async () => {
    setLoading(true);
    try {
      const nextPage = page + 1;
      const data = await getMovies({ genre, verdict, sort, page: nextPage, langKey });

      setMovies((prev) => [...prev, ...data.movies]);
      setPage(nextPage);

      if (nextPage >= data.pages) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch more movies", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movies.map((m: any, idx: number) => (
          <React.Fragment key={String(m._id) + idx}>
            <LoadingCard borderRadius={12}>
              <MovieCard movie={m} />
            </LoadingCard>

            {/* ── In-grid AdSense unit after every 10th card ── */}
            {(idx + 1) % 10 === 0 && (
              <div className="col-span-2 sm:grid-cols-3 md:col-span-4 lg:col-span-5 my-2">
                <AdBanner slot="0987654321" format="auto" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {hasMore && (
        <div
          ref={observerTarget}
          className="w-full flex flex-col items-center justify-center py-12 mt-4"
        >
          {loading && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
              <p className="text-sm text-brand-400 font-medium tracking-wide">
                🎬 Loading cinematic magic...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

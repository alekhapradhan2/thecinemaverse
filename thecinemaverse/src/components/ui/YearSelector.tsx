"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface YearSelectorProps {
  validYears: number[];
  currentYear: number;
  lang?: string;
  activeLangShort: string;
}

export function YearSelector({
  validYears,
  currentYear,
  lang,
  activeLangShort,
}: YearSelectorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingYear, setLoadingYear] = useState<number | null>(null);

  const handleNav = (e: React.MouseEvent, yr: number) => {
    e.preventDefault();
    if (yr === currentYear) return;
    
    setLoadingYear(yr);
    const href = lang ? `/movies/year/${yr}?lang=${lang}` : `/movies/year/${yr}`;
    
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <div className="flex items-center gap-2 mt-6 flex-wrap">
      <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mr-1">
        Browse year:
      </span>
      {validYears.map((yr) => {
        const isCurrent = yr === currentYear;
        const isLoading = isPending && loadingYear === yr;

        return (
          <a
            key={yr}
            href={lang ? `/movies/year/${yr}?lang=${lang}` : `/movies/year/${yr}`}
            onClick={(e) => handleNav(e, yr)}
            aria-label={`${activeLangShort} movies of ${yr}`}
            aria-current={isCurrent ? "page" : undefined}
            className={clsx(
              "px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
              isCurrent
                ? "bg-brand-500 text-white shadow-md shadow-brand-500/25"
                : "bg-[#141414] border border-[#222] text-gray-400 hover:border-brand-500/40 hover:text-brand-400",
              isLoading && "opacity-50 pointer-events-none cursor-not-allowed"
            )}
          >
            {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
            {yr}
          </a>
        );
      })}
    </div>
  );
}

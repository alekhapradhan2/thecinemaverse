"use client";
// components/ui/LanguageSelector.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Reusable language selector pill bar.
// Reads/writes ?lang= query param in the URL.
// Used on: homepage, /movies, /movies/year/[year], /box-office, /cast.
// All languages come from LANGUAGES config — no hardcoding.
// ─────────────────────────────────────────────────────────────────────────────

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { LANGUAGES, DEFAULT_LANGUAGE } from "@/lib/languages";

interface LanguageSelectorProps {
  /** Currently selected language key (from searchParams). Defaults to DEFAULT_LANGUAGE.key */
  activeLang?: string | null;
  /** Whether to show an "All" option (e.g. on box office page). Default: false */
  showAll?: boolean;
  /** Custom className for the wrapper div */
  className?: string;
}

export function LanguageSelector({
  activeLang,
  showAll = false,
  className = "",
}: LanguageSelectorProps) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const current = activeLang ?? searchParams.get("lang") ?? DEFAULT_LANGUAGE.key;

  const handleSelect = useCallback(
    (key: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      // Reset pagination when language changes
      params.delete("page");
      if (key && key !== "all") {
        params.set("lang", key);
      } else {
        params.delete("lang");
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div
      className={`flex items-center gap-1.5 flex-wrap ${className}`}
      role="tablist"
      aria-label="Filter by language"
    >
      {showAll && (
        <button
          role="tab"
          aria-selected={!current || current === "all"}
          onClick={() => handleSelect("all")}
          className={`
            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            transition-all duration-150 border
            ${(!current || current === "all")
              ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
              : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15]"
            }
          `}
        >
          <span>🌐</span>
          All Languages
        </button>
      )}

      {LANGUAGES.map((lang) => {
        const isActive = current === lang.key;
        return (
          <button
            key={lang.key}
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(lang.key)}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
              transition-all duration-150 border
              ${isActive
                ? "bg-brand-500/20 border-brand-500/40 text-brand-300"
                : "bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.08] hover:border-white/[0.15]"
              }
            `}
          >
            <span aria-hidden="true">{lang.flag}</span>
            {lang.short}
          </button>
        );
      })}
    </div>
  );
}

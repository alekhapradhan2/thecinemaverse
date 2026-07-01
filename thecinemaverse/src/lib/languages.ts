// src/lib/languages.ts
// -----------------------------------------------------------------------------
// Single source of truth for all supported languages.
// To add a new language: append ONE entry to LANGUAGES.
// No other frontend code changes required.
// -----------------------------------------------------------------------------

export interface LanguageConfig {
  /** URL-safe key used in ?lang= query param */
  key: string;
  /** Full display label shown in UI */
  label: string;
  /** Short label for compact selectors */
  short: string;
  /** Industry name used in SEO copy ("Bollywood", "Bengali Cinema".) */
  industry: string;
  /** Adjective form used in SEO copy ("Bollywood", "Bengali", "Tamil".) */
  adjective: string;
  /** Exact value stored in MongoDB Movie.language field */
  dbValue: string;
  /** BCP-47 locale code for hreflang / schema inLanguage */
  locale: string;
  /** ISO 3166-1 country of origin */
  country: string;
  /** Flag emoji for compact UI */
  flag: string;
}

export const LANGUAGES: LanguageConfig[] = [
  {
    key:       "hindi",
    label:     "Hindi (Bollywood)",
    short:     "Hindi",
    industry:  "Bollywood",
    adjective: "Bollywood",
    dbValue:   "Hindi",
    locale:    "hi-IN",
    country:   "IN",
    flag:      "IN",
  },
  {
    key:       "bengali",
    label:     "Bengali",
    short:     "Bengali",
    industry:  "Bengali Cinema",
    adjective: "Bengali",
    dbValue:   "Bengali",
    locale:    "bn-IN",
    country:   "IN",
    flag:      "IN",
  },
  // -- Future languages - uncomment & fill dbValue to activate -------------
  // { key: "tamil",     label: "Tamil",     short: "Tamil",     industry: "Kollywood",     adjective: "Tamil",     dbValue: "Tamil",    locale: "ta-IN", country: "IN", flag: "IN" },
  // { key: "telugu",    label: "Telugu",    short: "Telugu",    industry: "Tollywood",     adjective: "Telugu",    dbValue: "Telugu",   locale: "te-IN", country: "IN", flag: "IN" },
  // { key: "malayalam", label: "Malayalam", short: "Malayalam", industry: "Mollywood",     adjective: "Malayalam", dbValue: "Malayalam",locale: "ml-IN", country: "IN", flag: "IN" },
  // { key: "kannada",   label: "Kannada",   short: "Kannada",   industry: "Sandalwood",    adjective: "Kannada",   dbValue: "Kannada",  locale: "kn-IN", country: "IN", flag: "IN" },
  // { key: "marathi",   label: "Marathi",   short: "Marathi",   industry: "Marathi Cinema",adjective: "Marathi",   dbValue: "Marathi",  locale: "mr-IN", country: "IN", flag: "IN" },
  // { key: "punjabi",   label: "Punjabi",   short: "Punjabi",   industry: "Punjabi Cinema",adjective: "Punjabi",   dbValue: "Punjabi",  locale: "pa-IN", country: "IN", flag: "IN" },
  // { key: "odia",      label: "Odia",      short: "Odia",      industry: "Ollywood",      adjective: "Odia",      dbValue: "odia",     locale: "or-IN", country: "IN", flag: "IN" },
  // { key: "gujarati",  label: "Gujarati",  short: "Gujarati",  industry: "Gujarati Cinema",adjective:"Gujarati",  dbValue: "Gujarati", locale: "gu-IN", country: "IN", flag: "IN" },
];

/** Default language (Hindi/Bollywood) */
export const DEFAULT_LANGUAGE = LANGUAGES[0];

/**
 * Resolve a LanguageConfig from a ?lang= query param string.
 * Returns DEFAULT_LANGUAGE if key is not found / null / undefined.
 */
export function resolveLanguage(key: string | null | undefined): LanguageConfig {
  if (!key) return DEFAULT_LANGUAGE;
  return LANGUAGES.find((l) => l.key === key.toLowerCase()) ?? DEFAULT_LANGUAGE;
}

/**
 * Get the MongoDB filter value for a given language key.
 * Returns undefined (no filter) when key is "all" or not found.
 */
export function getLanguageFilter(key: string | null | undefined): string | undefined {
  if (!key || key === "all") return undefined;
  const lang = LANGUAGES.find((l) => l.key === key.toLowerCase());
  return lang?.dbValue;
}

/**
 * SEO helper - returns dynamic copy strings based on the language config.
 * Falls back to Hindi/Bollywood terms for unknown languages.
 */
export function getLangSeo(lang: LanguageConfig) {
  return {
    industry:  lang.industry,
    adjective: lang.adjective,
    movies:    `${lang.adjective} Movies`,
    actors:    `${lang.adjective} Actors`,
    actresses: `${lang.adjective} Actresses`,
    songs:     `${lang.adjective} Songs`,
    boxOffice: `${lang.adjective} Box Office`,
    news:      `${lang.adjective} News`,
    locale:    lang.locale,
    country:   lang.country,
  };
}

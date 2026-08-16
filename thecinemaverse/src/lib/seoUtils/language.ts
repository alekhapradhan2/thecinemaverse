// src/lib/seoUtils/language.ts
// ─────────────────────────────────────────────────────────────────────────────
// BCP47 language code mapping and related SEO helpers.
// Used by all schema builders to set inLanguage correctly.
// "Indian" is NOT a valid BCP47 code — this module enforces valid codes.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map from MongoDB movie.language field value → BCP47 language tag.
 * schema.org requires BCP47 for inLanguage.
 * https://schema.org/inLanguage
 */
export const LANGUAGE_TO_BCP47: Record<string, string> = {
  Hindi:     "hi",
  Bengali:   "bn",
  Telugu:    "te",
  Tamil:     "ta",
  Malayalam: "ml",
  Marathi:   "mr",
  Kannada:   "kn",
  Punjabi:   "pa",
  Odia:      "or",
  Gujarati:  "gu",
  Assamese:  "as",
  Bhojpuri:  "bho",
  English:   "en",
  Sanskrit:  "sa",
  Maithili:  "mai",
  Tulu:      "tcy",
  Konkani:   "kok",
  Nepali:    "ne",
};

/**
 * Map from MongoDB movie.language → Open Graph locale string.
 * Used for og:locale in social metadata.
 */
export const LANGUAGE_TO_OG_LOCALE: Record<string, string> = {
  Hindi:     "hi_IN",
  Bengali:   "bn_IN",
  Telugu:    "te_IN",
  Tamil:     "ta_IN",
  Malayalam: "ml_IN",
  Marathi:   "mr_IN",
  Kannada:   "kn_IN",
  Punjabi:   "pa_IN",
  Odia:      "or_IN",
  Gujarati:  "gu_IN",
  Assamese:  "as_IN",
  Bhojpuri:  "bho_IN",
  English:   "en_IN",
};

/**
 * Map from MongoDB movie.language → industry name for SEO copy.
 * e.g. "Hindi" → "Bollywood", "Telugu" → "Tollywood"
 */
export const LANGUAGE_TO_INDUSTRY: Record<string, string> = {
  Hindi:     "Bollywood",
  Bengali:   "Bengali Cinema",
  Telugu:    "Tollywood",
  Tamil:     "Kollywood",
  Malayalam: "Mollywood",
  Marathi:   "Marathi Cinema",
  Kannada:   "Sandalwood",
  Punjabi:   "Punjabi Cinema",
  Odia:      "Ollywood",
  Gujarati:  "Gujarati Cinema",
  Assamese:  "Assamese Cinema",
  Bhojpuri:  "Bhojpuri Cinema",
};

/**
 * Convert a movie.language db value to a valid BCP47 code.
 * Falls back to "hi" (Hindi) if the language is not mapped.
 * Never returns "Indian" or undefined.
 */
export function toBCP47(language?: string | null): string {
  if (!language) return "hi";
  return LANGUAGE_TO_BCP47[language] ?? LANGUAGE_TO_BCP47[language.trim()] ?? "hi";
}

/**
 * Convert a movie.language db value to an OG locale string.
 * Falls back to "en_IN" if not mapped.
 */
export function toOGLocale(language?: string | null): string {
  if (!language) return "en_IN";
  return LANGUAGE_TO_OG_LOCALE[language] ?? "en_IN";
}

/**
 * Get the industry name for a given language (for SEO copy).
 * e.g. getIndustry("Hindi") → "Bollywood"
 */
export function getIndustry(language?: string | null): string {
  if (!language) return "Bollywood";
  return LANGUAGE_TO_INDUSTRY[language] ?? `${language} Cinema`;
}

/**
 * Returns true if the language string is a valid, supported Indian film language.
 */
export function isKnownLanguage(language?: string | null): boolean {
  return !!language && language in LANGUAGE_TO_BCP47;
}

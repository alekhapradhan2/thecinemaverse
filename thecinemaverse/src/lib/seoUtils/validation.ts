// src/lib/seoUtils/validation.ts
// ─────────────────────────────────────────────────────────────────────────────
// SEO Validation Script — run before every production deployment.
// Detects common SEO regressions that would otherwise only be caught in GSC.
//
// Usage:
//   npx ts-node -e "import('./src/lib/seoUtils/validation').then(m => m.runSeoAudit())"
// Or add to package.json scripts:
//   "seo:check": "ts-node src/lib/seoUtils/validation.ts"
// ─────────────────────────────────────────────────────────────────────────────

export interface SeoIssue {
  severity: "error" | "warn" | "info";
  rule:     string;
  page:     string;
  detail:   string;
}

export interface PageSeoPayload {
  /** Page URL or identifier (e.g. /movie/some-slug) */
  url: string;
  title?: string;
  description?: string;
  canonical?: string;
  robots?: { index?: boolean; follow?: boolean };
  h1Count?: number;
  hasStructuredData?: boolean;
  ogImage?: string;
  inLanguage?: string;
}

// ─── Individual rule validators ───────────────────────────────────────────────

function checkTitle(page: PageSeoPayload): SeoIssue[] {
  const issues: SeoIssue[] = [];
  if (!page.title) {
    issues.push({ severity: "error", rule: "MISSING_TITLE", page: page.url, detail: "Page has no <title>" });
    return issues;
  }
  if (page.title.length < 10) {
    issues.push({ severity: "warn", rule: "TITLE_TOO_SHORT", page: page.url, detail: `Title is only ${page.title.length} chars: "${page.title}"` });
  }
  if (page.title.length > 70) {
    issues.push({ severity: "warn", rule: "TITLE_TOO_LONG", page: page.url, detail: `Title is ${page.title.length} chars (Google truncates at ~60): "${page.title.slice(0, 80)}..."` });
  }
  // Detect double site name
  const siteNameMatches = (page.title.match(/The Cinema Verse/gi) || []).length;
  if (siteNameMatches > 1) {
    issues.push({ severity: "error", rule: "DUPLICATE_SITE_NAME", page: page.url, detail: `Title contains "The Cinema Verse" ${siteNameMatches} times: "${page.title}"` });
  }
  // Detect null/undefined leaked into title
  if (/\b(null|undefined|\[object Object\])\b/i.test(page.title)) {
    issues.push({ severity: "error", rule: "NULL_IN_TITLE", page: page.url, detail: `Title contains null/undefined: "${page.title}"` });
  }
  return issues;
}

function checkDescription(page: PageSeoPayload): SeoIssue[] {
  const issues: SeoIssue[] = [];
  if (!page.description) {
    issues.push({ severity: "error", rule: "MISSING_DESCRIPTION", page: page.url, detail: "Page has no meta description" });
    return issues;
  }
  if (page.description.length < 50) {
    issues.push({ severity: "warn", rule: "DESCRIPTION_TOO_SHORT", page: page.url, detail: `Description is only ${page.description.length} chars` });
  }
  if (page.description.length > 165) {
    issues.push({ severity: "warn", rule: "DESCRIPTION_TOO_LONG", page: page.url, detail: `Description is ${page.description.length} chars (truncated at ~160)` });
  }
  // Detect null/undefined
  if (/\b(null|undefined|\[object Object\])\b/i.test(page.description)) {
    issues.push({ severity: "error", rule: "NULL_IN_DESCRIPTION", page: page.url, detail: `Description contains null/undefined: "${page.description.slice(0, 80)}..."` });
  }
  // Detect known bad synopsis patterns (Wikipedia text)
  const badPatterns = [
    /^the following is a list/i,
    /^this is a list of/i,
    /^wikipedia/i,
    /^for other uses/i,
    /^may refer to/i,
  ];
  if (badPatterns.some(p => p.test(page.description!))) {
    issues.push({ severity: "error", rule: "WIKIPEDIA_DESCRIPTION", page: page.url, detail: `Description appears to be Wikipedia boilerplate: "${page.description!.slice(0, 80)}..."` });
  }
  return issues;
}

function checkCanonical(page: PageSeoPayload): SeoIssue[] {
  const issues: SeoIssue[] = [];
  if (!page.canonical) {
    issues.push({ severity: "error", rule: "MISSING_CANONICAL", page: page.url, detail: "Page has no canonical URL" });
    return issues;
  }
  if (!page.canonical.startsWith("https://thecinemaverses.in")) {
    issues.push({ severity: "error", rule: "CANONICAL_WRONG_ORIGIN", page: page.url, detail: `Canonical points to wrong origin: ${page.canonical}` });
  }
  if (page.canonical.endsWith("/") && page.canonical !== "https://thecinemaverses.in/") {
    issues.push({ severity: "warn", rule: "CANONICAL_TRAILING_SLASH", page: page.url, detail: `Canonical has trailing slash: ${page.canonical}` });
  }
  // Canonical should match the page URL pattern
  const urlPath  = page.url.startsWith("/") ? page.url : `/${page.url}`;
  const expected = `https://thecinemaverses.in${urlPath}`;
  if (page.canonical !== expected && !page.canonical.includes("?")) {
    issues.push({ severity: "warn", rule: "CANONICAL_MISMATCH", page: page.url, detail: `Canonical "${page.canonical}" != expected "${expected}"` });
  }
  return issues;
}

function checkRobots(page: PageSeoPayload): SeoIssue[] {
  const issues: SeoIssue[] = [];
  if (page.robots?.index === false) {
    issues.push({ severity: "warn", rule: "NOINDEX", page: page.url, detail: "Page is marked noindex — verify this is intentional" });
  }
  return issues;
}

function checkH1(page: PageSeoPayload): SeoIssue[] {
  const issues: SeoIssue[] = [];
  if (page.h1Count === undefined) return issues;
  if (page.h1Count === 0) {
    issues.push({ severity: "error", rule: "MISSING_H1", page: page.url, detail: "Page has no H1 heading" });
  } else if (page.h1Count > 1) {
    issues.push({ severity: "warn", rule: "MULTIPLE_H1", page: page.url, detail: `Page has ${page.h1Count} H1 headings (should have exactly 1)` });
  }
  return issues;
}

function checkStructuredData(page: PageSeoPayload): SeoIssue[] {
  const issues: SeoIssue[] = [];
  if (page.hasStructuredData === false) {
    issues.push({ severity: "warn", rule: "MISSING_STRUCTURED_DATA", page: page.url, detail: "Page has no JSON-LD structured data" });
  }
  return issues;
}

function checkLanguage(page: PageSeoPayload): SeoIssue[] {
  const issues: SeoIssue[] = [];
  if (page.inLanguage === "Indian") {
    issues.push({ severity: "error", rule: "INVALID_LANGUAGE_CODE", page: page.url, detail: `inLanguage="Indian" is not a valid BCP47 code. Use "hi", "bn", "te" etc.` });
  }
  if (page.inLanguage && page.inLanguage.length > 10) {
    issues.push({ severity: "warn", rule: "INVALID_LANGUAGE_CODE", page: page.url, detail: `inLanguage="${page.inLanguage}" looks incorrect. Should be a BCP47 code like "hi" or "bn".` });
  }
  return issues;
}

// ─── Full audit ───────────────────────────────────────────────────────────────

/**
 * Run all SEO checks on a list of page payloads.
 * Returns all issues sorted by severity (errors first).
 */
export function auditPages(pages: PageSeoPayload[]): SeoIssue[] {
  const allIssues: SeoIssue[] = [];

  for (const page of pages) {
    allIssues.push(
      ...checkTitle(page),
      ...checkDescription(page),
      ...checkCanonical(page),
      ...checkRobots(page),
      ...checkH1(page),
      ...checkStructuredData(page),
      ...checkLanguage(page),
    );
  }

  // Sort: errors first, then warns, then info
  return allIssues.sort((a, b) => {
    const order = { error: 0, warn: 1, info: 2 };
    return order[a.severity] - order[b.severity];
  });
}

/**
 * Format and print an SEO audit report to the console.
 */
export function printAuditReport(issues: SeoIssue[]): void {
  const errors = issues.filter(i => i.severity === "error");
  const warns  = issues.filter(i => i.severity === "warn");
  const infos  = issues.filter(i => i.severity === "info");

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  THE CINEMA VERSE — SEO Validation Report");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  🔴 Errors:   ${errors.length}`);
  console.log(`  🟡 Warnings: ${warns.length}`);
  console.log(`  ℹ️  Info:     ${infos.length}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  if (errors.length) {
    console.log("🔴 ERRORS (must fix before deployment):\n");
    errors.forEach(i => console.log(`  [${i.rule}] ${i.page}\n  → ${i.detail}\n`));
  }
  if (warns.length) {
    console.log("🟡 WARNINGS (should fix soon):\n");
    warns.forEach(i => console.log(`  [${i.rule}] ${i.page}\n  → ${i.detail}\n`));
  }
  if (infos.length) {
    console.log("ℹ️  INFO:\n");
    infos.forEach(i => console.log(`  [${i.rule}] ${i.page}\n  → ${i.detail}\n`));
  }

  if (issues.length === 0) {
    console.log("✅ All SEO checks passed! No issues found.\n");
  }
}

/**
 * Quick validation helpers for use in page-level tests.
 * Import these into Jest/Vitest test files.
 */
export const seoAssertions = {
  /** Assert a title does not contain the site name (layout.tsx handles it) */
  titleHasNoSiteName: (title: string) =>
    !title.toLowerCase().includes("the cinema verse"),

  /** Assert a description does not contain null/undefined */
  descriptionIsClean: (desc: string) =>
    !/\b(null|undefined|\[object Object\])\b/i.test(desc),

  /** Assert a canonical URL is well-formed and uses https */
  canonicalIsValid: (url: string) =>
    url.startsWith("https://thecinemaverses.in") && !url.endsWith("/"),

  /** Assert BCP47 language code is valid */
  languageIsValidBCP47: (lang: string) =>
    lang !== "Indian" && /^[a-z]{2,3}(-[A-Z]{2})?$/.test(lang),
};

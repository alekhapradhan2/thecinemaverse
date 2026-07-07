// app/cast/page.tsx
// AdSense-ready: semantic HTML5, proper headings, breadcrumbs, structured content
// SEO: JSON-LD schema, keyword-rich intro, internal links, meta tags

import type { Metadata } from "next";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Cast from "@/models/Cast";
import { buildMeta, getLangMeta } from "@/lib/seo";
import { resolveLanguage, getLanguageFilter, DEFAULT_LANGUAGE } from "@/lib/languages";
import { LanguageSelector } from "@/components/ui/LanguageSelector";
import CastSearchBar from "@/components/cast/CastSearchBar";
import CastCard      from "@/components/cast/CastCard";


export const revalidate = 600;

const SECTION_LIMIT = 20;

const ROLES = [
  "Actor", "Actress", "Director", "Singer",
  "Music Director", "Producer", "Lyricist",
  "Cinematographer", "Choreographer", "Editor",
];

const ROLE_ICON: Record<string, string> = {
  Director: "🎬", Producer: "🎥", "Music Director": "🎵",
  Cinematographer: "📷", Choreographer: "💃", Lyricist: "✍️",
  Actor: "🎭", Actress: "🎭", Singer: "🎤", Editor: "✂️",
};

// SEO descriptions per role — boosts AdSense content quality signals
const getRoleSeo = (type: string, lang: any) => {
  const map: Record<string, { title: string; description: string }> = {
    Actor:           { title: `${lang.adj} Actors`,          description: `Browse complete profiles of film actors starring in ${lang.adj} movies.` },
    Actress:         { title: `${lang.adj} Actresses`,        description: `Discover leading actresses and their filmographies in ${lang.industry}.` },
    Director:        { title: `${lang.adj} Directors`,    description: `Explore film directors who have shaped the story of ${lang.industry}.` },
    Singer:          { title: `${lang.adj} Singers`,          description: `Find playback singers and their hit songs from ${lang.adj} films.` },
    "Music Director":{ title: "Music Directors",       description: `Discover music directors behind the best ${lang.adj} film soundtracks.` },
    Producer:        { title: `${lang.adj} Producers`,    description: `Browse producers who have backed ${lang.adj} films and shaped the industry.` },
    Lyricist:        { title: `${lang.adj} Lyricists`,        description: `Find lyricists who wrote the memorable songs of ${lang.industry}.` },
    Cinematographer: { title: "Cinematographers",      description: `Explore the cinematographers behind the visual storytelling of ${lang.industry}.` },
    Choreographer:   { title: "Choreographers",        description: `Browse dance choreographers from ${lang.adj} films and their career highlights.` },
    Editor:          { title: "Film Editors",          description: `Discover editors who brought ${lang.adj} films to life in post-production.` },
  };
  return map[type];
};

// ── Types ──────────────────────────────────────────────────────────────────────

export interface PlainPerson {
  _id:       string;
  name:      string;
  photo:     string | null;
  type:      string | null;
  filmCount: number;
}

function serialise(docs: any[]): PlainPerson[] {
  return docs.map((d) => ({
    _id:       String(d._id),
    name:      d.name  ?? "",
    photo:     d.photo ?? null,
    type:      d.type  ?? null,
    filmCount: Array.isArray(d.movies) ? d.movies.length : 0,
  }));
}

// ── Metadata ───────────────────────────────────────────────────────────────────

export async function generateMetadata(
  props: {
    searchParams: Promise<{ type?: string; lang?: string }>;
  }
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const { type, lang } = searchParams;
  const activeLang = resolveLanguage(lang);
  const s = getLangMeta(activeLang);
  const seo = type ? getRoleSeo(type, activeLang) : null;

  return buildMeta({
    title: seo
      ? `${seo.title} – ${s.industry} Directory | The Cinema Verse`
      : `${s.actors}, Actresses & Crew – Complete ${s.industry} Cast Directory | The Cinema Verse`,
    description: seo
      ? `${seo.description} View complete filmographies, biographies and career highlights on The Cinema Verse.`
      : `Explore the complete directory of ${s.adj.toLowerCase()} film actors, actresses, directors, singers and crew. Browse profiles with filmographies and career stats of ${s.industry} celebrities.`,
    url: searchParams.lang 
      ? `/cast?${type ? `type=${type}&` : ''}lang=${searchParams.lang}` 
      : (type ? `/cast?type=${type}` : "/cast"),
  });
}


// ── Data fetching ──────────────────────────────────────────────────────────────

async function getPageData(type?: string, langKey?: string) {
  await connectDB();
  const proj = "name photo type movies roles";
  const langDbValue = getLanguageFilter(langKey);

  // If a language is selected, we need an aggregation to filter by movie language
  if (langDbValue) {
    const buildPipeline = (matchConditions: any, sortLimit: any) => [
      { $match: matchConditions },
      // Lookup the movies array to get the full movie docs
      {
        $lookup: {
          from: "movies", // Assuming the collection is named 'movies'
          localField: "movies",
          foreignField: "_id",
          as: "movieDocs"
        }
      },
      // Keep only casts where at least one movie matches the language
      { $match: { "movieDocs.language": langDbValue } },
      // Project back to normal shape (exclude large movieDocs)
      { $project: { name: 1, photo: 1, type: 1, movies: 1, roles: 1 } },
      ...sortLimit
    ];

    if (type) {
      const match = { $or: [{ type }, { roles: type }] };
      const raw = await Cast.aggregate(buildPipeline(match, [{ $sort: { name: 1 } }, { $limit: 48 }]));
      return { mode: "filtered" as const, cast: serialise(raw), total: raw.length };
    }

    const actorFilter = { type: { $in: ["Actor", "Actress"] } };
    
    // For homepage sections, run the aggregations
    const [topStars, directors, veterans, musicians, risingNew, crew] = await Promise.all([
      Cast.aggregate(buildPipeline(actorFilter, [{ $addFields: { movieCount: { $size: { $ifNull: ["$movies", []] } } } }, { $sort: { movieCount: -1 } }, { $limit: SECTION_LIMIT }])),
      Cast.aggregate(buildPipeline({ type: "Director" }, [{ $sort: { name: 1 } }, { $limit: SECTION_LIMIT }])),
      Cast.aggregate(buildPipeline({ $expr: { $gte: [{ $size: { $ifNull: ["$movies", []] } }, 5] } }, [{ $sort: { name: 1 } }, { $limit: SECTION_LIMIT }])),
      Cast.aggregate(buildPipeline({ type: { $in: ["Music Director", "Singer", "Lyricist"] } }, [{ $sort: { name: 1 } }, { $limit: SECTION_LIMIT }])),
      Cast.aggregate(buildPipeline({ $expr: { $eq: [{ $size: { $ifNull: ["$movies", []] } }, 1] } }, [{ $sort: { name: 1 } }, { $limit: SECTION_LIMIT }])),
      Cast.aggregate(buildPipeline({ type: { $in: ["Producer", "Cinematographer", "Choreographer", "Editor"] } }, [{ $sort: { name: 1 } }, { $limit: SECTION_LIMIT }])),
    ]);

    return {
      mode:      "trending" as const,
      topStars:  serialise(topStars),
      directors: serialise(directors),
      veterans:  serialise(veterans),
      musicians: serialise(musicians),
      risingNew: serialise(risingNew),
      crew:      serialise(crew),
      total:     topStars.length + directors.length + veterans.length + musicians.length + risingNew.length + crew.length,
    };
  }

  // --- Fast path for "All" languages (default) ---
  if (type) {
    const filter = { $or: [{ type }, { roles: type }] };
    const [raw, total] = await Promise.all([
      Cast.find(filter, proj).sort({ name: 1 }).limit(48).lean(),
      Cast.countDocuments(filter),
    ]);
    return { mode: "filtered" as const, cast: serialise(raw), total };
  }

  const actorFilter = { type: { $in: ["Actor", "Actress"] } };

  const [topStars, directors, veterans, musicians, risingNew, crew, totalCount] =
    await Promise.all([
      Cast.find(actorFilter, proj).sort({ "movies.length": -1 }).limit(SECTION_LIMIT).lean(),
      Cast.find({ type: "Director" }, proj).sort({ name: 1 }).limit(SECTION_LIMIT).lean(),
      Cast.find({ $expr: { $gte: [{ $size: { $ifNull: ["$movies", []] } }, 5] } }, proj)
        .sort({ name: 1 }).limit(SECTION_LIMIT).lean(),
      Cast.find({ type: { $in: ["Music Director", "Singer", "Lyricist"] } }, proj)
        .sort({ name: 1 }).limit(SECTION_LIMIT).lean(),
      Cast.find({ $expr: { $eq: [{ $size: { $ifNull: ["$movies", []] } }, 1] } }, proj)
        .sort({ name: 1 }).limit(SECTION_LIMIT).lean(),
      Cast.find({ type: { $in: ["Producer", "Cinematographer", "Choreographer", "Editor"] } }, proj)
        .sort({ name: 1 }).limit(SECTION_LIMIT).lean(),
      Cast.estimatedDocumentCount(),
    ]);

  return {
    mode:      "trending" as const,
    topStars:  serialise(topStars),
    directors: serialise(directors),
    veterans:  serialise(veterans),
    musicians: serialise(musicians),
    risingNew: serialise(risingNew),
    crew:      serialise(crew),
    total:     totalCount,
  };
}

// ── Section Row component ──────────────────────────────────────────────────────

function CastSection({
  title, tag, people, viewAllHref, isFirst = false,
}: {
  title: string; tag?: string; people: PlainPerson[];
  viewAllHref?: string; isFirst?: boolean;
}) {
  if (!people.length) return null;

  return (
    <section aria-labelledby={`section-${title.replace(/\s+/g, "-").toLowerCase()}`} className="mb-2">
      {/* Section header */}
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <h2
            id={`section-${title.replace(/\s+/g, "-").toLowerCase()}`}
            className="text-sm font-black text-white m-0 leading-none"
          >
            {title}
          </h2>
          {tag && (
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-950 text-brand-400 flex-shrink-0">
              {tag}
            </span>
          )}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 flex-shrink-0">
            {people.length}
          </span>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex-shrink-0 text-[11px] font-bold text-brand-400 no-underline border border-brand-900 px-3 py-1 rounded-lg hover:bg-brand-950 transition-colors whitespace-nowrap"
          >
            View All →
          </Link>
        )}
      </div>
      {/* Horizontal scroll row */}
      <div className="max-w-7xl mx-auto">
      <div
        className="flex gap-3 overflow-x-auto px-4 sm:px-6 pb-3"
        style={{ scrollbarWidth: "none" }}
      >
        {people.map((p, i) => (
          <div key={p._id} className="flex-shrink-0">
            <CastCard person={p} priority={isFirst && i < 4} />
          </div>
        ))}
      </div>
      </div>
    </section>
  );
}

// ── JSON-LD Schema ─────────────────────────────────────────────────────────────

function CastSchema({ type, total, activeLang }: { type?: string; total: number; activeLang: any }) {
  const s = getLangMeta(activeLang);
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",        item: "https://thecinemaverses.in" },
      { "@type": "ListItem", position: 2, name: "Cast & Crew", item: "https://thecinemaverses.in/cast" },
      ...(type ? [{ "@type": "ListItem", position: 3, name: `${type}s`, item: `https://thecinemaverses.in/cast?type=${type}` }] : []),
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: type ? `${s.adj} ${type}s in ${s.industry}` : `${s.industry} Cast & Crew Directory`,
    description: type
      ? `Complete list of ${s.adj.toLowerCase()} ${type}s in ${s.industry} cinema`
      : `Complete directory of actors, actresses, directors and crew in ${s.adj.toLowerCase()} cinema`,
    numberOfItems: total,
    url: type ? `https://thecinemaverses.in/cast?type=${type}` : "https://thecinemaverses.in/cast",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
    </>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function CastPage(
  props: {
    searchParams: Promise<{ type?: string; lang?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const { type, lang } = searchParams;
  const data = await getPageData(type, lang);
  const activeLang = resolveLanguage(lang);
  const seo  = type ? getRoleSeo(type, activeLang) : null;
  const s = getLangMeta(activeLang);

  return (
    <>
      <CastSchema type={type} total={data.total} activeLang={activeLang} />
      <main className="min-h-screen bg-[#0a0a0a] text-white">

        {/* ── HERO HEADER ───────────────────────────────────────────── */}
        <header
          className="relative overflow-hidden border-b border-zinc-800"
          style={{
            background: "linear-gradient(to bottom, rgba(201,151,58,0.07) 0%, transparent 100%)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-0">

            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-5">
              <ol
                className="flex items-center gap-1.5 text-xs text-zinc-500"
                itemScope itemType="https://schema.org/BreadcrumbList"
              >
                <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                  <a href="/" itemProp="item" className="hover:text-brand-400 transition-colors">
                    <span itemProp="name">Home</span>
                  </a>
                  <meta itemProp="position" content="1" />
                </li>
                <span aria-hidden className="text-zinc-700">/</span>
                <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                  {type ? (
                    <a href="/cast" itemProp="item" className="hover:text-brand-400 transition-colors">
                      <span itemProp="name">Cast & Crew</span>
                    </a>
                  ) : (
                    <span itemProp="name" className="text-brand-400">Cast & Crew</span>
                  )}
                  <meta itemProp="position" content="2" />
                </li>
                {type && (
                  <>
                    <span aria-hidden className="text-zinc-700">/</span>
                    <li itemScope itemType="https://schema.org/ListItem" itemProp="itemListElement">
                      <span itemProp="name" className="text-brand-400">{type}s</span>
                      <meta itemProp="position" content="3" />
                    </li>
                  </>
                )}
              </ol>
            </nav>

            {/* Title + search */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {type
                    ? <>{ROLE_ICON[type] || "🎭"} <span className="text-brand-400">{type}s</span></>
                    : <>{activeLang.short} Cast <span className="text-brand-400">&amp;</span> Crew</>
                  }
                </h1>
                
                {/* Language Selector */}
                <div className="mb-4">
                  <LanguageSelector activeLang={lang} showAll={true} />
                </div>

                <p className="text-zinc-400 text-sm max-w-xl leading-relaxed">
                  {seo
                    ? seo.description
                    : `Complete directory of ${s.adj.toLowerCase()} film actors, actresses, directors, singers and crew from ${s.industry}.`
                  }
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300">
                    {data.total.toLocaleString()} profiles
                  </span>
                  {type && (
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-brand-950 border border-brand-900 text-brand-400">
                      {type}s only
                    </span>
                  )}
                </div>
              </div>

              {/* Search */}
              <div className="w-full md:w-80">
                <CastSearchBar />
              </div>
            </div>

            {/* Role filter tabs */}
            <nav
              className="flex border-b border-zinc-800 overflow-x-auto"
              style={{ scrollbarWidth: "none" }}
              aria-label="Filter by role"
            >
              <Link
                href="/cast"
                className={`px-4 py-2.5 text-xs font-black whitespace-nowrap no-underline border-b-2 transition-colors ${
                  !type
                    ? "text-brand-400 border-brand-400"
                    : "text-zinc-500 border-transparent hover:text-zinc-300"
                }`}
              >
                🔥 All
              </Link>
              {ROLES.map((r) => (
                <Link
                  key={r}
                  href={`/cast?type=${r}`}
                  className={`px-4 py-2.5 text-xs font-black whitespace-nowrap no-underline border-b-2 transition-colors ${
                    type === r
                      ? "text-brand-400 border-brand-400"
                      : "text-zinc-500 border-transparent hover:text-zinc-300"
                  }`}
                >
                  {ROLE_ICON[r]} {r}s
                </Link>
              ))}
            </nav>
          </div>
        </header>

        {/* ── CONTENT ───────────────────────────────────────────────── */}
        <div className="pt-5 pb-16">

          {data.mode === "filtered" ? (
            // Filtered grid view
            (data.cast.length === 0 ? (<div className="text-center py-24 px-4">
              <div className="w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center mx-auto mb-4 text-3xl">
                👤
              </div>
              <p className="text-zinc-400 text-lg font-semibold mb-1">No {type}s found</p>
              <p className="text-zinc-600 text-sm mb-4">We couldn't find any {type}s in our database.</p>
              <Link
                href="/cast"
                className="inline-block text-xs font-bold px-4 py-2 rounded-lg border border-brand-900 text-brand-400 hover:bg-brand-950 transition-colors no-underline"
              >
                Browse All Cast
              </Link>
            </div>) : (<section className="max-w-7xl mx-auto px-4 sm:px-6" aria-labelledby="filtered-heading">
              <div className="flex items-center justify-between mb-4">
                <h2 id="filtered-heading" className="text-sm font-black text-white">
                  {ROLE_ICON[type!]} All {type}s
                </h2>
                <span className="text-xs text-zinc-500">{data.total} profiles</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {data.cast.map((p, i) => (
                  <CastCard key={p._id} person={p} priority={i < 8} />
                ))}
              </div>
            </section>))
          ) : (
            // Trending home view with sections
            (<>
              <CastSection title="⭐ Top Stars"          tag="Popular"  people={data.topStars}  viewAllHref="/cast?type=Actor"    isFirst />
              <CastSection title="🎬 Directors"                         people={data.directors} viewAllHref="/cast?type=Director"         />
              <CastSection title="🏆 Veteran Artists"    tag="5+ Films" people={data.veterans}                                            />
              <CastSection title="🎵 Music &amp; Songs"                 people={data.musicians} viewAllHref="/cast?type=Singer"           />
              <CastSection title="🌟 Rising Talents"     tag="New"      people={data.risingNew}                                           />
              <CastSection title="🎥 Crew &amp; Production"             people={data.crew}      viewAllHref="/cast?type=Producer"         />
            </>)
          )}

          {/* ── SEO CONTENT SECTION ─────────────────────────────────── */}
          {!type && (
            <section
              aria-labelledby="about-cast-heading"
              className="mt-12 pt-8 border-t border-zinc-800"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
                <div>
                  <h2 id="about-cast-heading" className="text-lg font-bold text-white mb-3">
                    About {s.industry} Cast &amp; Crew
                  </h2>
                  <div className="space-y-3 text-zinc-400 text-sm leading-relaxed">
                    <p>
                      The Cinema Verse's <strong className="text-zinc-200">Cast &amp; Crew directory</strong> is the most comprehensive
                      database of <strong className="text-zinc-200">{activeLang.short.toLowerCase()} film artists</strong> on the internet. From legendary
                      actors who defined the industry's golden era to rising stars making their mark today, every profile is
                      backed with filmography data, career highlights, and biographical details.
                    </p>
                    <p>
                      Whether you're looking for celebrated <strong className="text-zinc-200">{activeLang.short} actors</strong>
                      or iconic <strong className="text-zinc-200">{activeLang.short} actresses</strong>, 
                      along with the talented directors and music composers behind {s.industry}'s
                      biggest hits — you'll find them all here.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white mb-3">Browse by Category</h3>
                  <div className="space-y-3 text-zinc-400 text-sm leading-relaxed">
                    <p>
                      Use the role filters above to explore <strong className="text-zinc-200">{activeLang.short.toLowerCase()} directors</strong> who have
                      shaped the art of storytelling, <strong className="text-zinc-200">playback singers</strong> behind
                      your favourite songs, and the crew members working behind the scenes.
                    </p>
                    <p>
                      Each profile includes complete movie listings, role details, and links to related films — making
                      The Cinema Verse the go-to resource for everything about <strong className="text-zinc-200">{s.industry}'s
                      artists and technicians</strong>.
                    </p>
                  </div>

                  {/* Internal links */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      { label: `${activeLang.short} Actors`,    href: lang ? `/cast?type=Actor&lang=${lang}` : "/cast?type=Actor"    },
                      { label: `${activeLang.short} Actresses`, href: lang ? `/cast?type=Actress&lang=${lang}` : "/cast?type=Actress"  },
                      { label: "Directors",      href: lang ? `/cast?type=Director&lang=${lang}` : "/cast?type=Director" },
                      { label: "Singers",        href: lang ? `/cast?type=Singer&lang=${lang}` : "/cast?type=Singer"   },
                      { label: "Blog",           href: "/blog"               },
                    ].map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-brand-400 hover:border-brand-900 transition-all no-underline"
                      >
                        {link.label} →
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
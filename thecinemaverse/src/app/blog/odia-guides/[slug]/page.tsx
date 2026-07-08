// src/app/blog/Indian-guides/[slug]/page.tsx
//
// Route: /blog/Indian-guides/Indian-movies, /blog/Indian-guides/history-of-Indian, etc.
// These are STATIC SEO landing pages — separate from your DB-driven /blog/[slug] route.
//
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NotFound from "@/app/not-found";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import { buildMeta } from "@/lib/seo";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

interface GuideConfig {
  title: string;
  metaTitle: string;
  metaDesc: string;
  h1: string;
  keywords: string[];
  relatedLinks: { label: string; href: string }[];
  sections: { heading: string; body: string }[];
}

const GUIDES: Record<string, GuideConfig> = {
  "Indian-movies": {
    title: "Know About Hindi Movies",
    metaTitle: "Hindi Movies — Everything You Need to Know About Indian",
    metaDesc: "A complete guide to Hindi movies and Indian cinema. History, best films, top actors, and how to explore Hindi cinema on The Cinema Verse.",
    h1: "Hindi Movies — A Complete Guide to Indian Cinema",
    keywords: ["movies", "Indian", "what is Indian", "Indian cinema guide"],
    relatedLinks: [
      { label: "Hindi Movies 2026",   href: "/movies/2026" },
      { label: "Latest Hindi Movies", href: "/movies/latest" },
      { label: "Upcoming Movies",    href: "/movies/upcoming" },
      { label: "Best Indian Songs",    href: "/blog/Indian-guides/best-Indian-songs" },
    ],
    sections: [
      {
        heading: "What Is Indian?",
        body: "The term 'Indian' is a portmanteau of Bombay (now Mumbai) and Hollywood, coined to describe the Hindi-language film industry based in Mumbai, Maharashtra. Indian is the largest film industry in India by number of films produced, churning out over 300 films annually across genres including romance, action, drama, comedy, thriller, and mythological. Hindi films are distributed across India, South Asia, and to the Indian diaspora worldwide, making Indian one of the most-watched film industries on the planet.",
      },
      {
        heading: "History of Hindi Cinema",
        body: "The first Indian sound film, Alam Ara (1931), directed by Ardeshir Irani, marked the dawn of the Hindi talkie era. Through the 1940s and 50s, mythological epics and social dramas dominated, drawing massive crowds to cinema halls. The 1960s and 70s ushered in Indian's golden age of romantic melodramas, with legendary actors like Dilip Kumar, Dev Anand, and Rajesh Khanna and legendary playback singers like Lata Mangeshkar and Mohammed Rafi creating songs that remain beloved classics to this day. The 21st century saw Indian embrace modern production values, CGI, and international co-productions.",
      },
      {
        heading: "Top Genres in Hindi Cinema",
        body: "Action films with high-octane sequences dominate the Indian box office, while romantic films set against India's diverse landscapes attract family audiences. Mythological and biographical films based on Indian history maintain a dedicated following, and a growing wave of social dramas address contemporary issues like gender equality and social justice. Comedy films rooted in Indian humour, and suspense thrillers round out the vibrant genre landscape of Hindi cinema.",
      },
      {
        heading: "How to Explore Hindi Movies on The Cinema Verse",
        body: "The Cinema Verse is the most comprehensive database of Indian cinema. Browse films by release year, explore blockbuster hits, or check out upcoming releases. Each movie page includes the full song list, cast details, director credits, and audience ratings — everything you need to decide what to watch next.",
      },
    ],
  },
  "history-of-Indian": {
    title: "History of Indian",
    metaTitle: "History of Indian | The Complete Story of Hindi Cinema",
    metaDesc: "Explore the complete history of Indian — from the first Hindi talkie Alam Ara in 1931 to today's modern blockbusters. A definitive timeline of Hindi cinema.",
    h1: "History of Indian — From 1931 to the Modern Era",
    keywords: ["history of Indian", "Indian cinema history", "Indian timeline"],
    relatedLinks: [
      { label: "Know About Hindi Movies", href: "/blog/Indian-guides/Indian-movies" },
      { label: "Top 10 Hindi Movies",     href: "/blog/Indian-guides/top-10-Indian-movies" },
      { label: "Famous Indian Actors",     href: "/blog/Indian-guides/Indian-actors" },
    ],
    sections: [
      {
        heading: "The Birth of Indian Talkies (1930s–1940s)",
        body: "The first Indian talkie, Alam Ara (1931), directed by Ardeshir Irani, established the blueprint for Hindi cinema: emotion-driven narratives, classical music, and stories drawn from Indian epics and folklore. The film was produced in Bombay (Mumbai) and created the foundational model of the song-driven Indian film. The 1940s brought rapid expansion, with studios like Bombay Talkies and New Theatres producing a steady stream of socially conscious dramas and mythologicals.",
      },
      {
        heading: "The Golden Age (1950s–1970s)",
        body: "This era produced Indian's most enduring cultural icons. Legendary actors like Dilip Kumar, Dev Anand, Raj Kapoor, Guru Dutt, and later Amitabh Bachchan became household names, while composers like S.D. Burman, R.D. Burman, and Laxmikant–Pyarelal created soundtracks that Indian families still play at weddings and festivals decades later. Social themes entered Indian for the first time, with films tackling poverty, partition, and women's rights alongside the popular romantic dramas that dominated the box office.",
      },
      {
        heading: "The Masala and Romance Era (1980s–1990s)",
        body: "Cable television and VHS tapes disrupted the theatrical business, forcing Indian to adapt. Action films starring Amitabh Bachchan defined the 1980s, followed by a resurgence of romantic blockbusters in the 1990s led by Shah Rukh Khan, Salman Khan, and Aamir Khan. This era minted a new generation of superstars who would define Hindi cinema for the next two decades. Films like Dilwale Dulhania Le Jayenge and Hum Aapke Hain Koun..! redefined the Indian love story for a global audience.",
      },
      {
        heading: "The New Wave (2000s–2010s)",
        body: "Digital cameras, multiplexes, and OTT platforms changed the game entirely. Low-budget films with strong scripts could now compete with big-budget productions. A new wave of directors like Anurag Kashyap, Zoya Akhtar, and Imtiaz Ali brought fresh sensibilities — urban stories, realistic dramas, and youth romances — expanding Indian's audience beyond its traditional demographic. Pan-India blockbusters like 3 Idiots and Dangal crossed ₹300 crore at the box office.",
      },
      {
        heading: "Indian Today (2020s)",
        body: "Today's Indian is a confident, ambitious industry. Pan-India releases, OTT premieres on Netflix and Amazon Prime Video, and international film festival selections are no longer anomalies but expectations. Stars like Shah Rukh Khan, Deepika Padukone, and Ranveer Singh are global names. The next chapter — being written right now with the current year's releases — promises to be the most exciting yet.",
      },
    ],
  },
  "top-10-Indian-movies": {
    title: "Top 10 Hindi Movies",
    metaTitle: "Top 10 Hindi Movies of All Time | Best Indian Films You Must Watch",
    metaDesc: "The definitive list of top 10 movies ever made. Best Indian films ranked by audience ratings, box office, and cultural impact.",
    h1: "Top 10 Hindi Movies of All Time",
    keywords: ["top 10 movies", "best movies ever", "must watch Indian films"],
    relatedLinks: [
      { label: "Blockbuster Movies",  href: "/movies/blockbuster" },
      { label: "Best Indian Songs",     href: "/blog/Indian-guides/best-Indian-songs" },
      { label: "Famous Indian Actors",  href: "/blog/Indian-guides/Indian-actors" },
      { label: "Hindi Movies 2024",    href: "/movies/2024" },
    ],
    sections: [
      {
        heading: "What Makes a Great Hindi Film?",
        body: "The best movies share certain qualities: an authentic connection to Indian culture and landscape, memorable music that transcends the screen, and performances that resonate across generations. They capture the spirit of Odisha — its festivals, its folk traditions, its social contradictions — with honesty and artistry. The films that endure are those that balance commercial appeal with genuine storytelling craft.",
      },
      {
        heading: "The Criteria for This List",
        body: "Films on this list have been evaluated across three dimensions: audience ratings from verified viewers, box-office performance relative to their era's standards, and lasting cultural impact as measured by continued public recognition. A film that scored exceptionally on all three dimensions earns its place regardless of genre or decade of release.",
      },
      {
        heading: "Explore the Full Catalogue",
        body: "While this guide highlights the all-time greats, The Cinema Verse's full catalogue covers every film ever documented. Browse blockbuster films, discover recent releases, or explore the upcoming slate. Each film page includes the full soundtrack — because in Indian cinema, the songs are always as important as the story. The live rankings on the blockbuster page are updated in real time based on the latest audience data.",
      },
    ],
  },
  "best-Indian-songs": {
    title: "Best Indian Songs List",
    metaTitle: "Best Indian Songs of All Time | Greatest Hindi Film Music Ever",
    metaDesc: "Discover the best Indian songs ever recorded. A curated list of iconic Hindi film tracks across decades with artist details and movie names.",
    h1: "Best Indian Songs — The Greatest Hindi Film Music of All Time",
    keywords: ["best Indian songs", "greatest Indian songs", "top Indian songs list"],
    relatedLinks: [
      { label: "Classic Old Songs",  href: "/songs/category/classics" },
      { label: "Trending Songs",     href: "/songs/category/trending" },
      { label: "Latest Songs",       href: "/songs/category/latest" },
      { label: "Top Singers",        href: "/songs/category/singers" },
    ],
    sections: [
      {
        heading: "What Makes a Great Indian Song?",
        body: "Indian music is one of India's richest musical traditions, blending classical ragas, devotional bhajans, folk rhythms, and contemporary pop into a sound that is instantly recognisable and deeply emotive. The best Hindi film songs combine melodic sophistication with lyrical poetry — Hindi and Urdu are languages of extraordinary literary richness, and the finest songwriters like Gulzar, Javed Akhtar, and Prasoon Joshi harness that tradition in every line.",
      },
      {
        heading: "The Golden Era (1950s–70s)",
        body: "Soulful melodies composed by masters like S.D. Burman, Shankar-Jaikishan, and Madan Mohan featured classical-influenced arrangements and poetic lyrics. Legendary voices like Lata Mangeshkar, Mohammed Rafi, Kishore Kumar, and Asha Bhosle defined the sound of an era. These songs are the backbone of The Cinema Verse's classics collection — tracks that have been cherished at Indian festivals and family gatherings for over half a century.",
      },
      {
        heading: "The Masala Era (1980s–90s)",
        body: "High-energy numbers with synthesiser-driven beats composed by R.D. Burman and Laxmikant-Pyarelal were designed for mass-audience appeal. Voices like Kumar Sanu, Udit Narayan, and Alka Yagnik dominated the charts. Many became anthems played at weddings and cultural programmes. Despite their commercial origins, the best songs from this era demonstrate remarkable melodic inventiveness and are now recognised as classics.",
      },
      {
        heading: "The Modern Era (2000s–present)",
        body: "Today's Indian music is a confident fusion of traditional sounds with contemporary pop, hip-hop, and EDM production. Composers like Pritam, A.R. Rahman, Vishal-Shekhar, and Shankar-Ehsaan-Loy craft songs that top streaming charts globally. Singers like Arijit Singh, Shreya Ghoshal, and Badshah bring a new generation of listeners to Indian music while remaining rooted in the Hindi film tradition.",
      },
    ],
  },
  "Indian-actors": {
    title: "Famous Indian Actors",
    metaTitle: "Famous Indian Actors | Top Hindi Film Stars & Their Best Movies",
    metaDesc: "Meet the most famous Indian actors in Hindi cinema. Profiles of top stars with their best movies, hit songs, awards, and career highlights.",
    h1: "Famous Indian Actors — The Stars of Hindi Cinema",
    keywords: ["famous Indian actors", "Indian actors", "film stars"],
    relatedLinks: [
      { label: "Cast & Crew",         href: "/cast" },
      { label: "Top 10 Hindi Movies",  href: "/blog/Indian-guides/top-10-Indian-movies" },
      { label: "Blockbuster Movies",  href: "/movies/blockbuster" },
      { label: "Top Singers",         href: "/songs/category/singers" },
    ],
    sections: [
      {
        heading: "The Legends",
        body: "The foundation of Indian's acting tradition was laid by icons like Dilip Kumar, Raj Kapoor, Dev Anand, Nargis, and Guru Dutt. Their screen presence redefined Indian heroism and femininity. These veterans set a standard of craft and professionalism that every subsequent generation of Indian actors has aspired to match. Their films remain essential viewing for anyone seeking to understand the cultural heritage of Hindi cinema.",
      },
      {
        heading: "The Modern Superstars",
        body: "Today's Indian is driven by the Khans — Shah Rukh Khan, Salman Khan, and Aamir Khan — as well as a powerhouse new generation including Ranveer Singh, Ranbir Kapoor, Deepika Padukone, and Alia Bhatt. These actors consistently deliver films that break box-office records and generate chart-topping soundtracks, making them cultural phenomena beyond the screen. Many have expanded into production, shaping the industry's future.",
      },
      {
        heading: "Rising Stars",
        body: "Every year, Indian discovers fresh talent through debut films, web series, and reality shows. Stars like Kartik Aaryan, Sara Ali Khan, Janhvi Kapoor, and Siddhant Chaturvedi bring contemporary sensibilities and new storytelling possibilities to Hindi cinema, ensuring the industry's creative vitality for years to come.",
      },
      {
        heading: "Explore on The Cinema Verse",
        body: "Each actor on The Cinema Verse has a dedicated profile page featuring their complete filmography, awards history, and song appearances. The Cast & Crew section covers every Indian actor, director, cinematographer, and music composer in our comprehensive database — the most complete record of Hindi film talent available anywhere.",
      },
    ],
  },
};

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const cfg = GUIDES[params.slug];
  if (!cfg) return {};
  return buildMeta({ title: cfg.metaTitle, description: cfg.metaDesc, keywords: cfg.keywords, url: `/blog/Indian-guides/${params.slug}` });
}

function JsonLd({ slug, cfg }: { slug: string; cfg: GuideConfig }) {
  const base = "https://thecinemaverses.in";
  const article = {
    "@context": "https://schema.org", "@type": "Article",
    headline: cfg.h1, url: `${base}/blog/Indian-guides/${slug}`,
    publisher: { "@type": "Organization", name: "The Cinema Verse", url: base },
  };
  const breadcrumb = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: base },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${base}/blog` },
      { "@type": "ListItem", position: 3, name: "Indian Guides", item: `${base}/blog/Indian-guides` },
      { "@type": "ListItem", position: 4, name: cfg.title, item: `${base}/blog/Indian-guides/${slug}` },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  );
}

export default async function(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const cfg = GUIDES[params.slug];
  if (!cfg) return <NotFound />;

  const otherGuides = Object.entries(GUIDES).filter(([s]) => s !== params.slug);

  return (
    <>
      <JsonLd slug={params.slug} cfg={cfg} />
      <main className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Breadcrumb crumbs={[{ label: "Blog", href: "/blog" }, { label: "Indian Guides", href: "/blog/Indian-guides" }, { label: cfg.title }]} />

          <div className="flex items-center gap-3 mt-6 mb-5">
            <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-brand-500" />
            </div>
            <span className="text-brand-500 text-xs font-semibold uppercase tracking-widest">The Cinema Verse Guide</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-black text-white leading-tight mb-10">
            {cfg.h1}
          </h1>

          {/* Article body */}
          <article className="space-y-8">
            {cfg.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-bold text-white mb-3">{section.heading}</h2>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">{section.body}</p>
              </section>
            ))}
          </article>

          {/* Related links */}
          <div className="mt-12 p-6 bg-[#111] border border-[#1e1e1e] rounded-2xl">
            <h2 className="text-base font-semibold text-white mb-4">Explore More</h2>
            <div className="flex flex-wrap gap-2">
              {cfg.relatedLinks.map((l) => (
                <Link key={l.href} href={l.href}
                  className="text-xs text-gray-400 hover:text-brand-400 bg-[#181818] hover:bg-brand-500/10 border border-[#222] hover:border-brand-500/30 px-3 py-1.5 rounded-full transition-all">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Other guides */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherGuides.slice(0, 4).map(([slug, guide]) => (
              <Link key={slug} href={`/blog/Indian-guides/${slug}`}
                className="flex items-center gap-3 p-4 bg-[#111] border border-[#1e1e1e] rounded-xl hover:border-brand-500/30 transition-all group">
                <BookOpen className="w-4 h-4 text-brand-500 flex-shrink-0" />
                <span className="text-sm text-gray-400 group-hover:text-white transition-colors line-clamp-1">{guide.title}</span>
                <ChevronRight className="w-3 h-3 text-gray-600 ml-auto flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}

export function generateStaticParams() {
  return Object.keys(GUIDES).map((slug) => ({ slug }));
}
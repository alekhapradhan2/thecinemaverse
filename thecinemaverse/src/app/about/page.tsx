// src/app/about/page.tsx
// Comprehensive E-E-A-T rich About Us page for The Cinema Verse

import type { Metadata } from "next";
import Link from "next/link";
import { buildMeta, SITE_NAME } from "@/lib/seo";
import { Film, Award, Users, Globe, ShieldCheck, CheckCircle2, BookOpen, Compass, Mail, Sparkles } from "lucide-react";

export const metadata: Metadata = buildMeta({
  title: "About The Cinema Verse – The Indian Cinema Encyclopedia & Editorial Hub",
  description:
    "Discover the mission, editorial standards, research team, and review methodology behind The Cinema Verse — India's dedicated cinema encyclopedia and film archive.",
  url: "/about",
});

export default function AboutPage() {
  return (
    <main className="bg-[#080809] min-h-screen text-white pb-20">
      
      {/* ── Hero Section ── */}
      <section className="relative border-b border-[#1c1c1f] overflow-hidden py-16 sm:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: "radial-gradient(ellipse 65% 50% at 50% -15%, rgba(249,115,22,0.12) 0%, transparent 70%)",
          }}
        />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/25 text-brand-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            About Our Publication &amp; Database
          </div>
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Documenting the Soul of <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-orange-400 to-amber-300">
              Indian Cinema
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-xl max-w-3xl mx-auto mt-6 leading-relaxed">
            The Cinema Verse is an independent film encyclopedia, cultural archive, and editorial publication dedicated
            to preserving, celebrating, and chronicling India&apos;s rich cinematic heritage.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        
        {/* ── Key Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { icon: Film, label: "Documented Films", value: "1,500+" },
            { icon: Users, label: "Cast & Crew Profiles", value: "2,000+" },
            { icon: Globe, label: "Curated Songs", value: "5,000+" },
            { icon: Award, label: "Years of Film History", value: "88+ Years" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-[#111114] border border-[#1f1f23] rounded-2xl p-5 text-center shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mx-auto mb-3 text-brand-400">
                <Icon className="w-5 h-5" />
              </div>
              <p className="font-display text-2xl sm:text-3xl font-black text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Mission & Vision ── */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#0e0e11] border border-[#1c1c20] rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-white">Our Mission</h2>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed space-y-3">
                Indian cinema boasts one of the most prolific and culturally vibrant film ecosystems in the world. Yet, much of its
                historical catalog, playback music history, and regional film records have remained scattered and unorganized.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed mt-3">
                Our mission at The Cinema Verse is to build the internet&apos;s most exhaustive, meticulously curated, and accessible
                repository for cinema lovers, historians, researchers, and creators worldwide.
              </p>
            </div>

            <div className="bg-[#0e0e11] border border-[#1c1c20] rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-brand-500/10 text-brand-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h2 className="text-xl font-bold text-white">What We Chronicle</h2>
              </div>
              <ul className="text-gray-400 text-sm leading-relaxed space-y-2.5">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Comprehensive Filmography:</strong> Cast, crew, directors, producers, synopses, and verified release dates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Musical Archives:</strong> Verified lyricists, playback singers, music directors, and official music streaming links.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Box Office Tracking:</strong> Day-wise theatrical collections, opening trends, and historic box office milestones.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Editorial Standards & Review Methodology (E-E-A-T) ── */}
        <section className="mb-16 bg-[#0e0e11] border border-[#1c1c20] rounded-2xl p-6 sm:p-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">Editorial &amp; Fact-Checking Standards</h2>
              <p className="text-xs text-gray-500">How we ensure reliability, depth, and impartiality</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="space-y-2 bg-[#141418] p-5 rounded-xl border border-[#222228]">
              <h3 className="font-bold text-brand-400 text-base">1. Multi-Source Fact Checking</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Before publishing any movie entry, artist biography, or box office tally, our research team cross-references historical newspaper archives, producer press releases, distributor receipts, and verified industry databases.
              </p>
            </div>

            <div className="space-y-2 bg-[#141418] p-5 rounded-xl border border-[#222228]">
              <h3 className="font-bold text-brand-400 text-base">2. Objective Film Critique</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Our reviews and editorial articles are written independently without sponsorship, PR studio bias, or commercial influence. We evaluate storytelling, technical direction, cinematography, performances, and cultural resonance.
              </p>
            </div>

            <div className="space-y-2 bg-[#141418] p-5 rounded-xl border border-[#222228]">
              <h3 className="font-bold text-brand-400 text-base">3. Transparent Corrections</h3>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Accuracy is our highest priority. When an error or unverified credit is identified by our team or submitted by our readership, it is vetted promptly and corrected within 24 to 48 hours.
              </p>
            </div>
          </div>
        </section>

        {/* ── Editorial Team / Authorship ── */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white">Editorial Team &amp; Leadership</h2>
            <p className="text-gray-400 text-sm mt-1">The passionate cinephiles and researchers behind The Cinema Verse</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-[#0e0e11] border border-[#1c1c20] rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-amber-600 flex items-center justify-center font-bold text-2xl text-white flex-shrink-0 shadow-lg">
                AP
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">Alekha Pradhan</h3>
                <p className="text-xs font-semibold text-brand-400 mb-2">Founder &amp; Editor-in-Chief</p>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Cinema archivist, technologist, and passionate researcher of Indian film heritage. Alekha oversees the editorial direction, database architecture, and accuracy standards across the platform.
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-brand-400" /> alekhpradhan3305@gmail.com</span>
                </div>
              </div>
            </div>

            <div className="bg-[#0e0e11] border border-[#1c1c20] rounded-2xl p-6 flex flex-col sm:flex-row gap-5 items-start">
              <div className="w-16 h-16 rounded-2xl bg-[#1f1f26] border border-[#2a2a34] flex items-center justify-center font-bold text-2xl text-gray-300 flex-shrink-0">
                CV
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white">The Cinema Verse Editorial Desk</h3>
                <p className="text-xs font-semibold text-brand-400 mb-2">Research &amp; Film Review Panel</p>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  Our collective of regional cinema enthusiasts, trade analysts, and music researchers who contribute in-depth retrospective essays, actor spotlights, and box office updates.
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                  <span>Specialization: Indian Regional &amp; Indian Cinema</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Contact & Location ── */}
        <section className="bg-gradient-to-br from-[#121216] to-[#0a0a0c] border border-[#1f1f24] rounded-2xl p-6 sm:p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Have Insights, Corrections, or Questions?</h2>
          <p className="text-gray-400 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            We actively welcome contributions from filmmakers, artists, historians, and fans. If you have archival information, corrections, or feedback, get in touch with our team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 font-bold text-sm text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              Contact Editorial Desk
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-bold text-sm text-gray-300 hover:text-white transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Read Our Articles
            </Link>
          </div>
          <p className="text-xs text-gray-600 mt-6">
            Headquarters: Bhubaneswar, Odisha, India • The Cinema Verse Encyclopedia
          </p>
        </section>

      </div>
    </main>
  );
}

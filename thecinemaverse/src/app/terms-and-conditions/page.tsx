// src/app/terms-and-conditions/page.tsx
// Comprehensive Terms & Conditions compliant with Google AdSense and publisher network guidelines

import type { Metadata } from "next";
import Link from "next/link";
import { Film, ChevronRight, Shield, Eye, FileText, AlertCircle, Scale, Mail, Cookie } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Conditions | The Cinema Verse",
  description:
    "Read the Terms and Conditions for using The Cinema Verse, the online encyclopedia for Indian movies, songs, cast profiles, reviews, and box office information.",
  keywords: [
    "terms and conditions",
    "the cinema verse terms",
    "user agreement",
    "movie database terms",
    "privacy and terms",
  ],
  alternates: {
    canonical: "https://thecinemaverses.in/terms-and-conditions",
  },
  openGraph: {
    title: "Terms & Conditions | The Cinema Verse",
    description:
      "Terms & Conditions governing the use of The Cinema Verse encyclopedia, editorial content, and services.",
    url: "https://thecinemaverses.in/terms-and-conditions",
    siteName: "The Cinema Verse",
    type: "website",
  },
};

const sections = [
  {
    id: "acceptance",
    icon: FileText,
    title: "1. Acceptance of Terms",
    content: [
      "By accessing and browsing The Cinema Verse (thecinemaverses.in), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any part of these terms, please discontinue use of the website.",
      "These terms apply to all visitors, users, and others who access or use our services. We reserve the right to revise or modify these terms at any time; your continued use of the website following any changes signifies your acceptance of the updated terms.",
    ],
  },
  {
    id: "privacy-and-cookies",
    icon: Cookie,
    title: "2. Privacy, Cookies & Third-Party Advertising",
    highlight: true,
    content: [
      "The Cinema Verse respects user privacy. We do not require you to create an account or provide sensitive personal data to access our publicly accessible encyclopedia entries, reviews, box office tracking, or song databases.",
      "To fund and support the continuous maintenance and free availability of our database, The Cinema Verse partners with third-party advertising networks, including Google AdSense. Third-party vendors, including Google, use cookies (such as the DART cookie) to serve ads based on a user's prior visits to our website or other websites on the Internet.",
      "Users can manage their cookie preferences or opt out of personalized advertising by visiting Google's Ads Settings (https://adssettings.google.com) or the Network Advertising Initiative opt-out page (https://www.aboutads.info/choices/). Please review our Privacy Policy for full details.",
    ],
  },
  {
    id: "content-use",
    icon: Eye,
    title: "3. Use of Content & Fair Use",
    content: [
      "All text, editorial reviews, curated compilations, rankings, box office estimates, and analyses published on The Cinema Verse are authored for informational, educational, and entertainment purposes.",
      "You are welcome to read, share, and reference our content for personal, non-commercial use with appropriate attribution. Systematic extraction, automated scraping, bulk republishing, or commercial reproduction of our database or written articles without prior written permission is prohibited.",
      "Movie posters, promotional trailers, song thumbnails, and still images displayed on this site are the intellectual property of their respective copyright holders, studios, and music labels. They are displayed under fair use doctrine for the purposes of commentary, critique, news reporting, and encyclopedic reference.",
    ],
  },
  {
    id: "intellectual-property",
    icon: Scale,
    title: "4. Intellectual Property",
    content: [
      "The The Cinema Verse name, logos, original branding, web architecture, and proprietary editorial articles are protected by applicable intellectual property laws.",
      "Factual film metadata (such as release dates, director names, track listings, and cast members) are compiled as public factual references. Editorial verdicts, in-depth film retrospectives, and original reviews remain the intellectual property of The Cinema Verse and its contributing authors.",
      "If you believe any content on The Cinema Verse infringes upon your copyright, please reach out through our contact page or email alekhpradhan3305@gmail.com with relevant details for immediate review and resolution.",
    ],
  },
  {
    id: "accuracy",
    icon: AlertCircle,
    title: "5. Information Accuracy & Box Office Disclaimer",
    content: [
      "While we endeavor to provide the most accurate and up-to-date information regarding Indian cinema, we make no express or implied warranties regarding the completeness or absolute accuracy of all historical records, cast listings, or box office figures.",
      "Box office collections, theatrical verdicts, and revenue projections published on this website are estimates synthesized from industry reports, trade analysts, and public data. They should not be considered certified commercial financial audits or investment advice.",
      "The Cinema Verse contains links to third-party platforms (such as YouTube for music videos and trailers). We do not control or endorse external websites and are not responsible for their content or operational policies.",
    ],
  },
  {
    id: "conduct",
    icon: FileText,
    title: "6. Acceptable Use Policy",
    content: [
      "You agree to use The Cinema Verse solely for lawful purposes. You must not attempt to interfere with the proper working of the site, compromise security, inject harmful code, or place an unreasonable load on our hosting infrastructure.",
      "Legitimate search engine crawlers and indexing bots are welcomed for public discovery in compliance with our robots.txt directives.",
    ],
  },
  {
    id: "changes",
    icon: AlertCircle,
    title: "7. Modifications & Governing Law",
    content: [
      "We reserve the right to amend these Terms and Conditions at our discretion. Any modifications take effect immediately upon publication on this page with the updated revision date.",
      "These terms shall be governed by and interpreted in accordance with the laws of India, subject to the jurisdiction of the competent courts of Odisha, India.",
    ],
  },
  {
    id: "contact",
    icon: Mail,
    title: "8. Contact & Inquiries",
    content: [
      "If you have questions, feedback, or legal inquiries regarding these Terms and Conditions, please contact us through our official channels.",
    ],
    cta: true,
  },
];

export default function TermsAndConditionsPage() {
  const lastUpdated = "June 16, 2026";

  return (
    <main className="bg-[#0a0a0a] min-h-screen text-white pb-20">
      
      {/* ── Hero ── */}
      <div className="relative overflow-hidden border-b border-[#1c1c1c]">
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background: "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(249,115,22,0.10) 0%, transparent 70%)",
          }}
        />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12 sm:pt-20 sm:pb-16 relative">
          <nav aria-label="Breadcrumb" className="mb-6 sm:mb-8">
            <ol className="flex items-center gap-1.5 text-[11px] text-gray-500 flex-wrap">
              <li>
                <Link href="/" className="hover:text-brand-400 transition-colors flex items-center gap-1">
                  <Film className="w-3 h-3" aria-hidden="true" />
                  The Cinema Verse
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="w-3 h-3 text-gray-700" />
              </li>
              <li className="text-gray-400">Terms &amp; Conditions</li>
            </ol>
          </nav>

          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl flex items-center justify-center mt-1 bg-brand-500/10 border border-brand-500/20 text-brand-400"
              aria-hidden="true"
            >
              <Scale className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.20em] text-brand-500 mb-2">
                Legal Framework
              </p>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                Terms &amp; Conditions
              </h1>
              <p className="text-gray-400 text-sm mt-2">
                Last updated: <time dateTime="2026-06-16">{lastUpdated}</time>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table of Contents & Content ── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          
          {/* Sidebar TOC */}
          <aside className="lg:w-52 xl:w-60 flex-shrink-0" aria-label="Table of contents">
            <div className="lg:sticky lg:top-24">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-500 mb-3">
                Sections
              </p>
              <nav>
                <ol className="space-y-1">
                  {sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="group flex items-center gap-2 text-[12px] text-gray-500 hover:text-brand-400 transition-colors py-1"
                      >
                        <span
                          className="w-1 h-1 rounded-full bg-gray-700 group-hover:bg-brand-500 transition-colors flex-shrink-0"
                          aria-hidden="true"
                        />
                        {s.title.replace(/^\d+\.\s/, "")}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <div className="mt-8 pt-6 border-t border-[#1c1c1c] space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-600 mb-2">
                  Related Policies
                </p>
                <Link
                  href="/privacy"
                  className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-brand-400 transition-colors"
                >
                  <ChevronRight className="w-2.5 h-2.5" aria-hidden="true" />
                  Privacy Policy
                </Link>
                <Link
                  href="/disclaimer"
                  className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-brand-400 transition-colors"
                >
                  <ChevronRight className="w-2.5 h-2.5" aria-hidden="true" />
                  Disclaimer
                </Link>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <article className="flex-1 min-w-0">
            <div className="space-y-10 sm:space-y-12">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <section key={section.id} id={section.id} aria-labelledby={`heading-${section.id}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-brand-500/10 border border-brand-500/20 text-brand-400"
                        aria-hidden="true"
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <h2 id={`heading-${section.id}`} className="text-base sm:text-lg font-semibold text-white">
                        {section.title}
                      </h2>
                    </div>

                    <div className="h-px mb-5 bg-gradient-to-r from-[#222] to-transparent" aria-hidden="true" />

                    <div className="space-y-3.5">
                      {section.content.map((para, idx) => (
                        <p key={idx} className="text-[13px] sm:text-sm text-gray-400 leading-relaxed">
                          {para}
                        </p>
                      ))}
                    </div>

                    {section.cta && (
                      <div className="mt-5">
                        <Link
                          href="/contact"
                          className="inline-flex items-center gap-2 text-[13px] font-medium text-brand-400 hover:text-brand-300 border border-brand-500/25 hover:border-brand-400/50 bg-brand-500/10 hover:bg-brand-500/20 px-4 py-2 rounded-xl transition-all"
                        >
                          <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                          Contact Us
                        </Link>
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            <div className="mt-12 sm:mt-14 rounded-2xl px-6 py-5 bg-[#111113] border border-[#1f1f22]">
              <p className="text-[12px] text-gray-400 leading-relaxed">
                These Terms &amp; Conditions constitute the entire agreement between you and <strong className="text-white">The Cinema Verse</strong> regarding your use of this website.
              </p>
              <p className="text-[11px] text-gray-500 mt-2">
                The Cinema Verse • Bhubaneswar, Odisha, India • Contact: alekhpradhan3305@gmail.com
              </p>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
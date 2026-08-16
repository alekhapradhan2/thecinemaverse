// src/app/privacy/page.tsx
// Comprehensive Google AdSense-compliant Privacy Policy

import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Eye, FileText, CheckCircle2, Globe, Cookie, HelpCircle, Mail, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | The Cinema Verse",
  description:
    "Read The Cinema Verse's Privacy Policy to understand how we collect, use, and protect your information, including our Google AdSense, cookies, GDPR, and CCPA disclosures.",
  alternates: {
    canonical: "https://thecinemaverses.in/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "June 16, 2026";

  return (
    <main className="bg-black min-h-screen text-white pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        
        {/* ── Page Header ── */}
        <div className="mb-10 sm:mb-12 border-b border-[#1c1c1c] pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <Shield className="w-3.5 h-3.5" />
            Official Compliance Policy
          </div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm sm:text-base mt-3 leading-relaxed max-w-3xl">
            At <strong className="text-white">The Cinema Verse</strong> (accessible from{" "}
            <span className="text-brand-400 font-mono text-xs sm:text-sm">https://thecinemaverses.in</span>), the privacy of our
            visitors is of utmost importance to us. This Privacy Policy document outlines the types of information that is
            collected and recorded by The Cinema Verse and how we use and safeguard it.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-4">
            <span>Last Updated: <strong className="text-gray-300">{lastUpdated}</strong></span>
            <span>•</span>
            <span>Applies to: <strong className="text-gray-300">All Visitors & Readers</strong></span>
          </div>
        </div>

        {/* ── Main Content Sections ── */}
        <div className="space-y-10 sm:space-y-12">
          
          {/* Section 1: Introduction */}
          <section className="bg-[#0c0c0d] border border-[#1c1c1f] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <FileText className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">1. General Information & Scope</h2>
            </div>
            <div className="text-gray-400 text-sm leading-relaxed space-y-3">
              <p>
                The Cinema Verse is an independent digital encyclopedia and entertainment publication dedicated to Indian cinema,
                covering films, actor and crew profiles, songs, reviews, and box office tracking.
              </p>
              <p>
                If you have additional questions or require more information about our Privacy Policy, please do not hesitate to contact us
                at <a href="mailto:alekhpradhan3305@gmail.com" className="text-brand-400 hover:underline font-medium">alekhpradhan3305@gmail.com</a>.
              </p>
              <p>
                This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information
                that they shared and/or collect in The Cinema Verse. This policy is not applicable to any information collected offline or via channels other than this website.
              </p>
            </div>
          </section>

          {/* Section 2: Google AdSense & DoubleClick Cookie (CRITICAL ADSENSE CLAUSE) */}
          <section className="bg-[#0c0c0d] border border-brand-500/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_30px_rgba(249,115,22,0.05)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
                <Globe className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">2. Google AdSense & DoubleClick DART Cookies</h2>
            </div>
            <div className="text-gray-400 text-sm leading-relaxed space-y-4">
              <p>
                Google is one of our third-party vendors on our site. It also uses cookies, known as <strong className="text-white">DART cookies</strong>,
                to serve ads to our site visitors based upon their visit to <strong className="text-white">thecinemaverses.in</strong> and other sites on the internet.
              </p>
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 text-xs sm:text-sm text-brand-200 space-y-2">
                <p className="font-semibold text-white">How to Opt Out of Google Personalized Ads:</p>
                <p>
                  Visitors may choose to decline or opt out of the use of DART cookies and personalized advertising by visiting the Google Ad and Content Network Privacy Policy at the following URL:
                </p>
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-semibold underline break-all mt-1"
                >
                  https://policies.google.com/technologies/ads <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p>
                You may also customize or opt out of personalized advertisements across Google services at{" "}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-400 hover:underline font-medium"
                >
                  Google Ads Settings (https://adssettings.google.com)
                </a>.
              </p>
            </div>
          </section>

          {/* Section 3: Third-Party Advertising Partners & Tracking */}
          <section className="bg-[#0c0c0d] border border-[#1c1c1f] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <Cookie className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">3. Third-Party Advertising Partners</h2>
            </div>
            <div className="text-gray-400 text-sm leading-relaxed space-y-3">
              <p>
                Some advertisers on our site may use cookies and web beacons. Our advertising partners include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-300 pl-2">
                <li><strong className="text-white">Google AdSense</strong> (<a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">Google Privacy &amp; Terms</a>)</li>
              </ul>
              <p>
                Third-party ad servers or ad networks use technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on The Cinema Verse, which are sent directly to users&apos; browsers. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.
              </p>
              <p className="text-xs text-gray-500">
                Note that The Cinema Verse has no access to or control over these cookies that are used by third-party advertisers.
              </p>
              <div className="pt-2">
                <p className="text-xs text-gray-400">
                  You can opt out of interest-based advertising from multiple networks by visiting the Digital Advertising Alliance at{" "}
                  <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
                    https://www.aboutads.info/choices/
                  </a>{" "}
                  or the Network Advertising Initiative at{" "}
                  <a href="https://www.networkadvertising.org/choices/" target="_blank" rel="noopener noreferrer" className="text-brand-400 hover:underline">
                    https://www.networkadvertising.org/choices/
                  </a>.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Log Files */}
          <section className="bg-[#0c0c0d] border border-[#1c1c1f] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">4. Log Files</h2>
            </div>
            <div className="text-gray-400 text-sm leading-relaxed space-y-3">
              <p>
                The Cinema Verse follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services&apos; analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks.
              </p>
              <p>
                These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users&apos; movement on the website, and gathering demographic information to ensure site reliability and performance.
              </p>
            </div>
          </section>

          {/* Section 5: Cookies and Browser Settings */}
          <section className="bg-[#0c0c0d] border border-[#1c1c1f] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <Cookie className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">5. Cookies and Web Beacons</h2>
            </div>
            <div className="text-gray-400 text-sm leading-relaxed space-y-3">
              <p>
                Like any other website, The Cinema Verse uses &apos;cookies&apos;. These cookies are used to store information including visitors&apos; preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users&apos; experience by customizing our web page content based on visitors&apos; browser type and/or other information.
              </p>
              <p>
                You can choose to disable cookies through your individual browser options. Detailed information about cookie management with specific web browsers can be found at the browsers&apos; respective websites (e.g. Google Chrome, Mozilla Firefox, Safari, Microsoft Edge).
              </p>
            </div>
          </section>

          {/* Section 6: CCPA Privacy Rights */}
          <section className="bg-[#0c0c0d] border border-[#1c1c1f] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">6. CCPA Privacy Rights (Do Not Sell My Personal Information)</h2>
            </div>
            <div className="text-gray-400 text-sm leading-relaxed space-y-3">
              <p>
                Under the California Consumer Privacy Act (CCPA), California consumers have the following rights:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-300 pl-2">
                <li><strong className="text-white">Right to Know:</strong> Request that a business disclose the categories and specific pieces of personal data collected about consumers.</li>
                <li><strong className="text-white">Right to Delete:</strong> Request that a business delete any personal data about the consumer that a business collected.</li>
                <li><strong className="text-white">Right to Opt-Out:</strong> Request that a business that sells or shares a consumer&apos;s personal data, not sell or share that data.</li>
              </ul>
              <p>
                If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.
              </p>
            </div>
          </section>

          {/* Section 7: GDPR Data Protection Rights */}
          <section className="bg-[#0c0c0d] border border-[#1c1c1f] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <Shield className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">7. GDPR Data Protection Rights</h2>
            </div>
            <div className="text-gray-400 text-sm leading-relaxed space-y-3">
              <p>
                We want to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-gray-300 pl-2">
                <li><strong className="text-white">The right to access:</strong> You have the right to request copies of your personal data.</li>
                <li><strong className="text-white">The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate or incomplete.</li>
                <li><strong className="text-white">The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
                <li><strong className="text-white">The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data, under certain conditions.</li>
                <li><strong className="text-white">The right to object to processing:</strong> You have the right to object to our processing of your personal data, under certain conditions.</li>
                <li><strong className="text-white">The right to data portability:</strong> You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</li>
              </ul>
              <p>
                If you make a request, we have one month to respond to you. To exercise any of these rights, please contact our privacy desk.
              </p>
            </div>
          </section>

          {/* Section 8: Children's Information (COPPA) */}
          <section className="bg-[#0c0c0d] border border-[#1c1c1f] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <HelpCircle className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">8. Children&apos;s Information</h2>
            </div>
            <div className="text-gray-400 text-sm leading-relaxed space-y-3">
              <p>
                Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
              </p>
              <p>
                The Cinema Verse does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
              </p>
            </div>
          </section>

          {/* Section 9: Consent & Contact */}
          <section className="bg-[#0c0c0d] border border-[#1c1c1f] rounded-2xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                <Mail className="w-4 h-4" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">9. Consent &amp; Contact Information</h2>
            </div>
            <div className="text-gray-400 text-sm leading-relaxed space-y-3">
              <p>
                By using our website, you hereby consent to our Privacy Policy and agree to its Terms and Conditions.
              </p>
              <div className="p-4 bg-[#141416] border border-[#222226] rounded-xl text-xs sm:text-sm text-gray-300 space-y-1 mt-3">
                <p><strong className="text-white">Website:</strong> The Cinema Verse (https://thecinemaverses.in)</p>
                <p><strong className="text-white">Data Controller:</strong> Alekha Pradhan</p>
                <p><strong className="text-white">Email:</strong> <a href="mailto:alekhpradhan3305@gmail.com" className="text-brand-400 hover:underline">alekhpradhan3305@gmail.com</a></p>
                <p><strong className="text-white">Location:</strong> Bhubaneswar, Odisha, India</p>
              </div>
            </div>
          </section>

        </div>

        {/* ── Related Legal Links ── */}
        <div className="mt-12 pt-6 border-t border-[#1c1c1c] flex flex-wrap gap-4 text-xs text-gray-500">
          <Link href="/terms-and-conditions" className="hover:text-brand-400 transition-colors">Terms &amp; Conditions</Link>
          <span>•</span>
          <Link href="/disclaimer" className="hover:text-brand-400 transition-colors">Disclaimer</Link>
          <span>•</span>
          <Link href="/about" className="hover:text-brand-400 transition-colors">About Us</Link>
          <span>•</span>
          <Link href="/contact" className="hover:text-brand-400 transition-colors">Contact Us</Link>
        </div>

      </div>
    </main>
  );
}
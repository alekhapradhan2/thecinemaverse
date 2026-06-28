/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fcf9f2",
          100: "#f8eedb",
          200: "#f0dfb7",
          300: "#e5c589",
          400: "#dca759",
          500: "#d4af37", // Gold
          600: "#b58428",
          700: "#916023",
          800: "#794f24",
          900: "#644122",
        },
        highlight: {
          500: "#B71C1C", // Crimson Red
        },
        dark: {
          900: "#0F0F10", // Matte Black
          800: "#1B1B1D", // Charcoal
          700: "#222225",
          600: "#2C2C30",
          500: "#36363B",
          400: "#48484F",
        },
        silver: "#BFC3C9", // Secondary Text
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body:    ["var(--font-body)", "sans-serif"],
        mono:    ["var(--font-mono)", "monospace"],
      },
      animation: {
        "fade-in":     "fadeIn 0.5s ease-in-out",
        "slide-up":    "slideUp 0.4s ease-out",
        "pulse-slow":  "pulse 3s infinite",
        shimmer:       "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(20px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        shimmer: { "0%": { backgroundPosition: "-200% 0" }, "100%": { backgroundPosition: "200% 0" } },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        shimmer:           "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
      },
      typography: {
        invert: {
          css: {
            color: "#BFC3C9",
            "h1,h2,h3,h4": { color: "#FFFFFF" },
            a: { color: "#d4af37" },
            strong: { color: "#FFFFFF" },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

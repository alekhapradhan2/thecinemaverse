/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // TMDB (movie posters / backdrops from scraper)
      { protocol: "https", hostname: "image.tmdb.org" },
      // Wikipedia / Wikimedia (cast photos, movie images)
      { protocol: "https", hostname: "upload.wikimedia.org" },
      // Google user content (profile pics, Drive images)
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      // YouTube thumbnails (trailers, song videos)
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      // Google encrypted thumbnails
      { protocol: "https", hostname: "encrypted-tbn0.gstatic.com" },
      // Wakelet (OTT logos)
      { protocol: "https", hostname: "images.wakelet.com" },
      // Catch-all for user-uploaded or external poster URLs
      { protocol: "https", hostname: "**" },
    ],
  },
};

module.exports = nextConfig;

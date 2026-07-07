// instrumentation.ts
// Keep-alive was only needed on Render (free tier sleeps after inactivity).
// Cloudflare Pages runs on-demand and never suspends — no keep-alive needed.
export async function register() {
  // No-op on Cloudflare Pages
}
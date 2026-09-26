/**
 * Static export for GitHub Pages (social.demo.arqentia.com). No server, no API:
 * the page renders a baked analytics snapshot (data/snapshot.json).
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  // /x/index.html etc. — GitHub Pages serves folder indexes.
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;

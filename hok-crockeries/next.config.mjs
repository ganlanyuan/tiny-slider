import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // PGlite ships a WASM build that loads its own assets from disk. Bundling it
  // rewrites those paths and breaks the loader, so it stays a real node module.
  // The Neon driver used in production is unaffected either way.
  serverExternalPackages: ['@electric-sql/pglite'],
  // This app lives in a subdirectory of a larger repo, so pin the trace root
  // here rather than letting Next walk up and find the parent's lockfile.
  outputFileTracingRoot: here,
  transpilePackages: ['three'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;

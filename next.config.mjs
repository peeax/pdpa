import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Security headers applied by the dev server.
// For production (static export), set these at your CDN or web server instead -
// Next.js cannot inject HTTP headers into static .html files.
// A `public/_headers` file is provided for Netlify / Cloudflare Pages hosting.
const SECURITY_HEADERS = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-XSS-Protection', value: '0' },
];

/** @type {(phase: string) => import('next').NextConfig} */
export default (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    // Static export (like the original Gatsby build) for production only.
    // In dev we omit it so dynamic [slug] routes render on demand.
    ...(isDev ? {} : { output: 'export' }),
    ...(isDev
      ? {
          // Security headers (dev server only - see comment above).
          async headers() {
            return [{ source: '/(.*)', headers: SECURITY_HEADERS }];
          },
        }
      : {}),
    images: { unoptimized: true },
    turbopack: { root: __dirname },
    // Emit /slug/index.html so static hosts serve clean URLs.
    trailingSlash: true,
  };
};

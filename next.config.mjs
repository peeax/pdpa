import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** @type {(phase: string) => import('next').NextConfig} */
export default (phase) => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  return {
    // Static export (like the original Gatsby build) for production only.
    // In dev we omit it so dynamic [slug] routes render on demand.
    ...(isDev ? {} : { output: 'export' }),
    images: { unoptimized: true },
    // Emit /slug/index.html so static hosts serve clean URLs.
    trailingSlash: true,
  };
};

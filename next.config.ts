import type { NextConfig } from 'next';

// A static export for GitHub Pages: every page is prerendered into out/, served as plain files.
// Pages cannot set response headers, so the referrer policy is a <meta> tag in the layout and
// microphone access relies on the browser's own permission prompt.
const config: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  agentRules: false,
  experimental: { cpus: 2 },
  devIndicators: false,
};
export default config;

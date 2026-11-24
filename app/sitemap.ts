import type { MetadataRoute } from 'next';
export const dynamic = 'force-static';
import { site } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap {
  if (!site.SITE_URL) return [];
  const base = site.SITE_URL.replace(/\/$/, '');
  return [
    '',
    '/docs',
    '/docs/wake-word',
    '/docs/nodejs',
    '/docs/python',
    '/docs/c',
    '/docs/android',
    '/docs/custom-wake-words',
    '/docs/audio-lifecycle',
    '/docs/esp32',
    '/generator',
    '/contact',
    '/privacy',
  ].map((path) => ({ url: `${base}${path}/` }));
}

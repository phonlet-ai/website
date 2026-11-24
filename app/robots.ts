import type { MetadataRoute } from 'next';
export const dynamic = 'force-static';
import { site } from '@/lib/site';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    ...(site.SITE_URL ? { sitemap: `${site.SITE_URL.replace(/\/$/, '')}/sitemap.xml` } : {}),
  };
}

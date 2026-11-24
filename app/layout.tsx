import type { Metadata } from 'next';
import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import './globals.css';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { site } from '@/lib/site';
import { themeScript } from '@/lib/theme';
import { SiteFrame } from '@/components/site-frame';
import { Motion } from '@/components/motion';

export const metadata: Metadata = {
  metadataBase: new URL(site.SITE_URL || 'http://localhost:3002'),
  title: {
    default: 'Phonlet Wake — custom wake words from text, on-device',
    template: '%s · Phonlet Wake',
  },
  description:
    'Type any phrase and get a calibrated on-device wake word in seconds. No recordings, no per-word training, no cloud. In the browser and on ESP32-S3.',
  keywords: [
    'custom wake word',
    'wake word detection',
    'offline wake word',
    'on-device keyword spotting',
    'ESP32-S3 wake word',
    'hotword detection',
  ],
  icons: { icon: '/icon.svg' },
  referrer: 'strict-origin-when-cross-origin',
  openGraph: {
    title: 'Phonlet Wake — Any wake word. Typed, not trained.',
    description:
      'Calibrated, on-device wake words from text in seconds. No recordings, no training runs, no cloud.',
    type: 'website',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'Phonlet Wake: any wake word, typed, not trained.',
      },
    ],
  },
  twitter: { card: 'summary_large_image', images: ['/og.png'] },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteFrame navigation={<Navigation />} footer={<Footer />}>
          {children}
        </SiteFrame>
        <Motion />
      </body>
    </html>
  );
}

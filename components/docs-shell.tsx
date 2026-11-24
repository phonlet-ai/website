import Link from 'next/link';
import { docPages, DocsContent } from './docs-content';
import { SectionLabel } from './brand';
import { sdkDocs } from '@/lib/sdk-docs';
export function DocsShell({ slug }: { slug: string }) {
  const page = docPages.find((p) => p.slug === slug)!;
  return (
    <div className="page-width docs-layout">
      <aside className="docs-sidebar" aria-label="Documentation navigation">
        <span className="mono">DEVELOPER GUIDE</span>
        {docPages.map((p) => (
          <Link
            key={p.slug}
            href={p.slug === 'getting-started' ? '/docs' : `/docs/${p.slug}`}
            aria-current={p.slug === slug ? 'page' : undefined}
          >
            {
              (
                {
                  'getting-started': 'Getting started',
                  'wake-word': 'Browser quickstart',
                  ...Object.fromEntries(sdkDocs.map((doc) => [doc.slug, doc.label])),
                  'custom-wake-words': 'Custom wake words',
                  'audio-lifecycle': 'Audio lifecycle',
                  esp32: 'ESP32-S3',
                } as Record<string, string>
              )[p.slug]
            }
          </Link>
        ))}
      </aside>
      <article>
        <SectionLabel>PHONLET / DOCUMENTATION</SectionLabel>
        <h1 className="doc-title" style={{ marginTop: 22 }}>
          {page.title}
        </h1>
        <p className="doc-lead">{page.description}</p>
        <div className="prose">
          <DocsContent slug={slug} />
        </div>
      </article>
    </div>
  );
}

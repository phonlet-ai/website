import { notFound } from 'next/navigation';
import { docPages } from '@/components/docs-content';
import { DocsShell } from '@/components/docs-shell';
export function generateStaticParams() {
  return docPages.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  return { title: docPages.find((d) => d.slug === slug)?.title };
}
export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  if (!docPages.some((d) => d.slug === slug)) notFound();
  return <DocsShell slug={slug} />;
}

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { SectionLabel } from '@/components/brand';
export default function NotFound() {
  return (
    <div className="page-width not-found">
      <SectionLabel>404 / SIGNAL NOT FOUND</SectionLabel>
      <h1>
        A little <span className="serif-word">silence.</span>
      </h1>
      <p>We couldn’t find that page. There’s plenty more to explore.</p>
      <Link href="/" className="button button-orange">
        Back to Phonlet <ArrowRight size={16} />
      </Link>
    </div>
  );
}

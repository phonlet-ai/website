import Link from 'next/link';

export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 34 34" fill="none" aria-hidden="true">
      <path d="M3 13h5v9H3zM10.7 5h5v25h-5zM18.4 9h5v17h-5zM26.1 13h5v9h-5z" fill="currentColor" />
    </svg>
  );
}
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className={`brand ${light ? 'brand-light' : ''}`} aria-label="Phonlet home">
      <Mark />
      <span>
        phonlet<span className="brand-dot">.</span>
      </span>
    </Link>
  );
}
export function SectionLabel({ children, index }: { children: React.ReactNode; index?: string }) {
  return (
    <div className="section-label">
      <span className="tiny-cross">+</span>
      {children}
      {index && <span className="section-index">/{index}</span>}
    </div>
  );
}

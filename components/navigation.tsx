'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { Brand } from './brand';
import { ThemeToggle } from './theme-toggle';

const links = [
  ['/#lab', 'Try it'],
  ['/#how', 'How it works'],
  ['/#developers', 'Developers'],
  ['/#esp32', 'ESP32-S3'],
  ['/generator', 'Generator'],
  ['/docs', 'Docs'],
];

export function Navigation() {
  const [mobile, setMobile] = useState(false);
  const path = usePathname();
  const nav = useRef<HTMLElement>(null);
  useEffect(() => {
    setMobile(false);
  }, [path]);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node)) setMobile(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobile(false);
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => {
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
    };
  }, []);
  return (
    <header className="site-header" ref={nav}>
      <div className="nav-inner">
        <Brand />
        <nav className={`nav-links ${mobile ? 'is-open' : ''}`} aria-label="Main navigation">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? 'page' : undefined}
              onClick={() => setMobile(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          <Link href="/docs" className="button button-small button-dark">
            Get started <ArrowUpRight size={15} />
          </Link>
          <button
            className="mobile-toggle icon-button"
            onClick={() => setMobile(!mobile)}
            aria-label={mobile ? 'Close navigation' : 'Open navigation'}
            aria-expanded={mobile}
          >
            {mobile ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  );
}

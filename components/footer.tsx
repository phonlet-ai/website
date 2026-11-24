import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Brand, Mark } from './brand';
import { HF_ORG, repoUrl } from '@/lib/release';
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <Brand light />
          <p>
            Any wake word.
            <br />
            Typed, not trained.
          </p>
          <Link href="/docs" className="text-link">
            Get started <ArrowRight size={15} />
          </Link>
        </div>
        <div className="footer-column">
          <span>Phonlet Wake</span>
          <Link href="/#lab">Try it live</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#esp32">ESP32-S3</Link>
          <Link href="/#licence">Licence</Link>
        </div>
        <div className="footer-column">
          <span>For developers</span>
          <Link href="/generator">Generator</Link>
          <Link href="/docs">Documentation</Link>
          <Link href="/docs/wake-word">Browser quickstart</Link>
          <a href="/agents.md">Instructions for AI agents</a>
          <a href="/llms.txt">Docs index for AI (llms.txt)</a>
          <a href={repoUrl}>Source on GitHub</a>
          <a href={HF_ORG}>Hugging Face</a>
        </div>
        <div className="footer-column">
          <span>Phonlet</span>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <a href="/wake/LICENSE">Licence text</a>
          <a href="/wake/THIRD_PARTY_NOTICES.md">Third-party notices</a>
        </div>
      </div>
      <div className="footer-wordmark" aria-hidden="true">
        Typed, not trained.
        <Mark />
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Phonlet AI</span>
        <span>
          <span className="tiny-dot" /> Made for the edge.
        </span>
        <Link href="/privacy">
          Privacy <ArrowRight size={12} />
        </Link>
      </div>
    </footer>
  );
}

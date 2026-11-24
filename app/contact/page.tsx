import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SectionLabel } from '@/components/brand';
import { ContactForm } from '@/components/contact-form';
import { site } from '@/lib/site';
export const metadata = {
  title: 'Contact',
  description:
    'Phonlet Wake is free for non-commercial use. Contact us for a commercial licence, custom wake words, or ESP32-S3 hardware access.',
};
export default function ContactPage() {
  return (
    <div className="page-width">
      <header className="page-hero">
        <SectionLabel>PHONLET WAKE / CONTACT</SectionLabel>
        <h1>
          What should your
          <br />
          product <span className="serif-word">answer to?</span>
        </h1>
        <p>
          Tell us the phrase, the platform, and roughly how many devices. We answer with a
          commercial licence that fits, and help for your phrase and your hardware.
        </p>
      </header>
      <div className="contact-grid">
        <div className="contact-copy">
          <h2>What helps us most.</h2>
          <p>
            The phrase you want, where it runs (browser, app, Linux, ESP32-S3), the microphone and
            setting, and your expected volume. The form turns that into a short brief you can send.
          </p>
          <aside className="info-box">
            <h3>Free for non-commercial use</h3>
            <p>
              Personal projects, study, research with no commercial aim, charities, schools, public
              research and government need no licence (PolyForm Noncommercial 1.0.0). A product you
              sell, a device you ship or a service your company runs needs a commercial licence.
            </p>
            <Link href="/#licence" className="text-link">
              How the licence works <ArrowUpRight size={15} />
            </Link>
          </aside>
        </div>
        <ContactForm email={site.CONTACT_EMAIL} />
      </div>
    </div>
  );
}

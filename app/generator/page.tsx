import { SignalCanvas } from '@/components/signal-canvas';
import { Generator } from '@/features/generator/generator';
import '../home.css';

export const metadata = {
  title: 'Phrase generator',
  description:
    'Type wake phrases and get their pronunciations and calibrated thresholds as one keyword file for every Phonlet Wake SDK. Runs in your browser.',
};

export default function GeneratorPage() {
  return (
    <section className="stage tool" aria-labelledby="tool-title">
      <SignalCanvas />
      <div className="page-width tool-inner">
        <header className="tool-head">
          <p className="eyebrow mono">
            <span className="eyebrow-dot" /> PHONLET WAKE · GENERATOR
          </p>
          <h1 id="tool-title" className="tool-title">
            Many phrases. <em>One file.</em>
          </h1>
          <p className="hero-lede">
            Type every phrase your product should answer to. Each one is calibrated in your browser
            and written into the keyword file every Phonlet Wake SDK reads. Nothing you type leaves
            this tab.
          </p>
        </header>
        <Generator />
        <p className="generator-legal">
          The generator and the engine on this page are licensed under the{' '}
          <a href="/generator/LICENSE">PolyForm Noncommercial License 1.0.0</a>; see the{' '}
          <a href="/generator/THIRD_PARTY_NOTICES.md">generator</a> and{' '}
          <a href="/wake/THIRD_PARTY_NOTICES.md">engine</a> third-party notices.
        </p>
      </div>
    </section>
  );
}

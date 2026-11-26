import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Braces,
  ChevronDown,
  CircuitBoard,
  Cpu,
  Globe2,
  Smartphone,
  Terminal,
  Workflow,
} from 'lucide-react';
import { SectionLabel } from '@/components/brand';
import { SignalCanvas } from '@/components/signal-canvas';
import { Footprint } from '@/components/footprint';
import { CodeTabs, type CodeTab } from '@/components/code-tabs';
import { CodeBlock } from '@/components/code-block';
import { WakeLab } from '@/features/lab/wake-lab';
import {
  androidCode,
  cCode,
  espCode,
  keywordFileCode,
  nodeCode,
  pythonCode,
  wakeCode,
} from '@/lib/samples';
import './home.css';
import { benchmarkMethodUrl, benchmarkRows } from '@/lib/benchmark';

const codeTabs: CodeTab[] = [
  {
    id: 'web',
    label: 'Web',
    title: 'wake.js',
    code: wakeCode,
    note: 'Runs on this page, unchanged.',
  },
  {
    id: 'node',
    label: 'Node.js',
    title: 'wake.mjs',
    code: nodeCode,
    note: 'Phonlet Wake Node.js SDK.',
  },
  {
    id: 'python',
    label: 'Python',
    title: 'wake.py',
    code: pythonCode,
    note: 'Phonlet Wake Python SDK.',
  },
  {
    id: 'c',
    label: 'C / C++',
    title: 'wake.c',
    code: cCode,
    note: 'Public C API, phonlet_wake.h.',
  },
  {
    id: 'android',
    label: 'Android',
    title: 'Wake.kt',
    code: androidCode,
    note: 'Phonlet Wake for Android.',
  },
  { id: 'esp32', label: 'ESP32-S3', title: 'main.c', code: espCode, note: 'ESP-IDF component.' },
];

const platforms: { icon: React.ReactNode; name: string; ships: string }[] = [
  {
    icon: <Globe2 size={18} />,
    name: 'Browser',
    ships: 'WebAssembly in a worker, scalar and SIMD',
  },
  {
    icon: <Cpu size={18} />,
    name: 'C / C++',
    ships: 'One header; Linux x64 and Windows x64 libraries',
  },
  { icon: <Terminal size={18} />, name: 'Python', ships: 'Wheel with NumPy' },
  { icon: <Braces size={18} />, name: 'Node.js', ships: 'Native add-on' },
  { icon: <Smartphone size={18} />, name: 'Android · Java', ships: 'AAR, tested on a phone' },
  { icon: <Workflow size={18} />, name: '.NET', ships: 'Tested on Windows x64' },
  { icon: <CircuitBoard size={18} />, name: 'ESP32-S3', ships: 'ESP-IDF component, vector unit' },
];

const marquee = [
  'hey nova',
  'okay kettle',
  'computer',
  'hey marvin',
  'hello robot',
  'lights on',
  'hey barista',
  'wake up atlas',
  'okay garden',
  'hey captain',
];

const faq = [
  [
    'How can a wake word work without recordings?',
    'The model hears the sounds of English speech, not one fixed phrase. A wake word is a list of pronunciations plus two calibrated thresholds, so adding one never changes the model.',
  ],
  [
    'What about words that are not in the dictionary?',
    'Names and made-up words get a pronunciation predicted from their spelling, marked “Predicted” in the lab. You can also write the sounds yourself, for example zorblax=Z AO R B L AE K S.',
  ],
  [
    'How accurate is it?',
    'On Picovoice’s public wake-word benchmark Phonlet Wake detects 92.2% of the test words in 10 dB noise at 0.1 false alarms per hour, with phrases typed as text, and 98.6% without noise. Every phrase is calibrated to a false-alarm target, from about 10 per hour of speech at full sensitivity to 0.1.',
  ],
  [
    'How is it different from openWakeWord and microWakeWord?',
    'Both train a small model for each wake word from synthetic speech: openWakeWord runs on Linux-class CPUs, microWakeWord on the ESP32-S3. Phonlet Wake needs no training run. One model hears the sounds of English, so a new phrase is ready in seconds, many phrases share one 1 MB model, and the same file runs from a browser to an ESP32-S3.',
  ],
  [
    'Does my audio leave the device?',
    'No. The engine runs where the microphone is. On this page it runs in a WebAssembly worker in your tab: nothing is uploaded, stored or recorded.',
  ],
  [
    'What makes a good wake word?',
    'Two to four syllables with sounds that are rare in everyday speech. “Hey barista” works well; “the” never will. The generator warns when a phrase is too short, too long or too common.',
  ],
];

// Facts from each project's own README and the Home Assistant blog (checked 2026-11-24); no
// accuracy comparison before a published benchmark.
const compared = [
  {
    name: 'Phonlet Wake',
    tag: 'TYPED, NOT TRAINED',
    hot: true,
    facts: [
      [
        'A new wake word',
        'Type it. Thresholds are calibrated from text in seconds, in your browser or on the command line.',
      ],
      ['Models', 'One 1 MB model for every phrase; it listens for several phrases at once.'],
      ['Runs on', 'Linux, Windows, browsers (WebAssembly), Android and ESP32-S3.'],
      ['Licence', 'PolyForm Noncommercial 1.0.0; commercial licence on request.'],
    ],
  },
  {
    name: 'openWakeWord',
    tag: 'A MODEL PER WORD',
    source: 'https://github.com/dscripka/openWakeWord',
    facts: [
      [
        'A new wake word',
        'Train a model for it on synthetic speech, plus negative audio; a basic model takes under an hour in a notebook.',
      ],
      ['Models', 'One small model per word, on a shared feature extractor.'],
      [
        'Runs on',
        'Linux-class CPUs: 15 to 20 models on one Raspberry Pi 3 core. Too large for microcontrollers.',
      ],
      ['Licence', 'Code Apache 2.0; the pretrained models CC BY-NC-SA 4.0 (non-commercial).'],
    ],
  },
  {
    name: 'microWakeWord',
    tag: 'A MODEL PER WORD',
    source: 'https://github.com/kahrendt/microWakeWord',
    facts: [
      [
        'A new wake word',
        'Train a model for it on synthetic speech; training is meant for advanced users.',
      ],
      ['Models', 'One model per word, for TensorFlow Lite for Microcontrollers.'],
      ['Runs on', 'ESP32-S3 devices with ESPHome.'],
      ['Licence', 'Apache 2.0.'],
    ],
  },
];

export default function Home() {
  return (
    <>
      <section className="stage hero" id="lab" aria-labelledby="hero-title">
        <SignalCanvas />
        <div className="hero-grid page-width">
          <div className="hero-copy">
            <p className="eyebrow mono">
              <span className="eyebrow-dot" /> PHONLET WAKE · CUSTOM WAKE WORDS, ON-DEVICE
            </p>
            <h1 id="hero-title" className="hero-title">
              <span className="line">
                <span>Any wake word.</span>
              </span>
              <span className="line">
                <span>
                  Typed, <em>not trained.</em>
                </span>
              </span>
            </h1>
            <p className="hero-lede">
              Type a phrase. Seconds later it has calibrated thresholds and your browser is
              listening for it. No recordings, no training runs, no cloud.
            </p>
            <dl className="hero-specs" aria-label="Footprint on the device">
              <div>
                <dt>
                  1<small>MB</small>
                </dt>
                <dd>one model for every phrase</dd>
              </div>
              <div>
                <dt>
                  1.05<small>MB</small>
                </dt>
                <dd>of memory while it listens</dd>
              </div>
              <div>
                <dt>
                  0.7<small>%</small>
                </dt>
                <dd>of one laptop core</dd>
              </div>
              <div>
                <dt>
                  19<small>%</small>
                </dt>
                <dd>of an ESP32-S3 core</dd>
              </div>
            </dl>
            <p className="hero-platforms mono">
              Browser · C / C++ · Python · Node.js · Android · .NET · ESP32-S3
            </p>
          </div>
          <WakeLab />
        </div>
        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {[...marquee, ...marquee].map((p, i) => (
              <span key={i}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="section page-width" id="how" aria-labelledby="how-title">
        <div className="section-head" data-reveal>
          <SectionLabel index="01">HOW IT WORKS</SectionLabel>
          <h2 id="how-title">
            From text to trigger. <em>In seconds.</em>
          </h2>
          <p>
            Phonlet Wake listens for sounds, not for one memorised phrase. That is why a new wake
            word needs no new model.
          </p>
        </div>
        <ol className="pipeline">
          <li className="step spot" data-reveal style={{ ['--d' as string]: 0 }}>
            <div className="step-art art-type" aria-hidden="true">
              <span>hey nova</span>
            </div>
            <span className="step-index mono">01 / TYPE</span>
            <h3>Write the phrase.</h3>
            <p>Any English words, names included. Unknown words get a predicted pronunciation.</p>
          </li>
          <li className="step spot" data-reveal style={{ ['--d' as string]: 1 }}>
            <div className="step-art art-phones" aria-hidden="true">
              {['HH', 'EY', 'N', 'OW', 'V', 'AH'].map((p, i) => (
                <span key={p} style={{ ['--i' as string]: i }}>
                  {p}
                </span>
              ))}
            </div>
            <span className="step-index mono">02 / PRONOUNCE</span>
            <h3>Hear it as sounds.</h3>
            <p>The phrase becomes phonemes, the units the model already knows.</p>
          </li>
          <li className="step spot" data-reveal style={{ ['--d' as string]: 2 }}>
            <div className="step-art art-curve" aria-hidden="true">
              <svg viewBox="0 0 200 90" preserveAspectRatio="none">
                <path className="curve-grid" d="M0 30H200M0 60H200" />
                <path className="curve-line" d="M4 8 C 50 12, 80 40, 110 56 S 170 80, 196 84" />
                <circle className="curve-dot dot-loose" cx="38" cy="12" r="4" />
                <circle className="curve-dot dot-strict" cx="166" cy="78" r="4" />
              </svg>
              <span className="mono curve-label label-loose">10 / h</span>
              <span className="mono curve-label label-strict">0.1 / h</span>
            </div>
            <span className="step-index mono">03 / CALIBRATE</span>
            <h3>Thresholds, calibrated.</h3>
            <p>Two thresholds set from the phrase’s predicted false alarms. No tuning by hand.</p>
          </li>
          <li className="step spot" data-reveal style={{ ['--d' as string]: 3 }}>
            <div className="step-art art-wake" aria-hidden="true">
              {Array.from({ length: 28 }, (_, i) => (
                <i key={i} style={{ ['--i' as string]: i }} />
              ))}
              <b className="mono">WAKE</b>
            </div>
            <span className="step-index mono">04 / LISTEN</span>
            <h3>One model wakes.</h3>
            <p>The same 1 MB model listens for every phrase, offline, on the device.</p>
          </li>
        </ol>
      </section>

      <section className="section page-width" id="footprint" aria-labelledby="footprint-title">
        <div className="section-head" data-reveal>
          <SectionLabel index="02">FOOTPRINT</SectionLabel>
          <h2 id="footprint-title">
            Small enough for a <em>microcontroller.</em>
          </h2>
          <p>
            One int8 acoustic model of about 1 MB listens for every phrase, and a phrase is only
            data. The engine streams audio in 32 ms frames and keeps a small state between them, so
            the whole thing runs in about 1 MB of memory, on a laptop or on a microcontroller.
          </p>
        </div>
        <div data-reveal>
          <Footprint />
        </div>
      </section>

      <section className="section page-width" id="developers" aria-labelledby="dev-title">
        <div className="section-head" data-reveal>
          <SectionLabel index="03">FOR DEVELOPERS</SectionLabel>
          <h2 id="dev-title">
            One file. <em>Every platform.</em>
          </h2>
          <p>
            The lab’s download is the whole wake word: pronunciations, thresholds and the model they
            belong to. Every SDK reads it as it is.
          </p>
        </div>
        <div className="dev-grid">
          <div className="keyword-card spot" data-reveal>
            <CodeBlock code={keywordFileCode} title="keywords.json" />
          </div>
          <ul className="platform-list" data-reveal style={{ ['--d' as string]: 1 }}>
            {platforms.map((p) => (
              <li key={p.name}>
                <span className="platform-icon">{p.icon}</span>
                <strong>{p.name}</strong>
                <span>{p.ships}</span>
              </li>
            ))}
            <li className="platform-more">
              <Link href="/docs">
                Read the docs <ArrowUpRight size={15} />
              </Link>
            </li>
          </ul>
        </div>
        <div className="dev-code" data-reveal>
          <CodeTabs tabs={codeTabs} label="Code examples by platform" />
        </div>
      </section>

      <section className="stage esp" id="esp32" aria-labelledby="esp-title">
        <div className="page-width esp-grid">
          <div className="esp-copy" data-reveal>
            <SectionLabel index="04">ESP32-S3</SectionLabel>
            <h2 id="esp-title">
              Wakes on a chip, <em>not a server.</em>
            </h2>
            <p>
              The same model and the same keyword file run on the ESP32-S3. The ESP-IDF component
              works on the chip’s vector unit and leaves the second core to your product. Tested on
              an ESP32-S3-N16R8 with an INMP441 microphone: phrases spoken in the room, detected by
              name.
            </p>
            <dl className="esp-facts">
              <div>
                <dt>19%</dt>
                <dd>of one core at the default setting</dd>
              </div>
              <div>
                <dt>16–46%</dt>
                <dd>your choice: less CPU for up to 224 ms of delay</dd>
              </div>
              <div>
                <dt>75 KB</dt>
                <dd>internal RAM, plus 934 KB PSRAM</dd>
              </div>
            </dl>
            <Link href="/docs/esp32" className="button button-orange">
              Read the ESP32-S3 guide <ArrowRight size={17} />
            </Link>
          </div>
          <div className="chip-art" aria-hidden="true" data-reveal>
            <svg viewBox="0 0 400 400">
              <defs>
                <linearGradient id="die" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#2a2a28" />
                  <stop offset="1" stopColor="#141413" />
                </linearGradient>
              </defs>
              {Array.from({ length: 10 }, (_, i) => {
                const p = 92 + i * 24;
                return (
                  <g key={i} className="pins">
                    <path d={`M${p} 60V100M${p} 300V340M60 ${p}H100M300 ${p}H340`} />
                  </g>
                );
              })}
              <path className="trace t1" d="M20 140H70Q80 140 80 150V200H100" />
              <path className="trace t2" d="M380 260H330Q320 260 320 250V200H300" />
              <path className="trace t3" d="M200 380V350Q200 340 190 340H160V300" />
              <rect
                x="100"
                y="100"
                width="200"
                height="200"
                rx="10"
                fill="url(#die)"
                className="die"
              />
              <rect x="128" y="128" width="144" height="144" rx="4" className="core" />
              <text x="200" y="196" className="chip-name">
                ESP32-S3
              </text>
              <text x="200" y="222" className="chip-sub">
                wake · 19%
              </text>
            </svg>
          </div>
        </div>
      </section>

      <section className="section page-width" id="compare" aria-labelledby="compare-title">
        <div className="section-head" data-reveal>
          <SectionLabel index="05">COMPARED</SectionLabel>
          <h2 id="compare-title">
            openWakeWord, microWakeWord <em>and Phonlet Wake.</em>
          </h2>
          <p>
            openWakeWord and microWakeWord are good open-source wake-word engines, and both train a
            small model for each word. Phonlet Wake skips the training run: one model hears the
            sounds of English, so a new phrase is only its pronunciations and two thresholds.
          </p>
        </div>
        <div className="compare-grid">
          {compared.map((engine, i) => (
            <article
              key={engine.name}
              className={`licence-card compare-card spot${engine.hot ? ' is-hot' : ''}`}
              data-reveal
              style={{ ['--d' as string]: i }}
            >
              <span className="mono">{engine.tag}</span>
              <h3>{engine.name}</h3>
              <dl>
                {engine.facts.map(([term, detail]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{detail}</dd>
                  </div>
                ))}
              </dl>
              {engine.source ? (
                <a href={engine.source} className="text-link">
                  {engine.name} on GitHub <ArrowUpRight size={15} />
                </a>
              ) : (
                <Link href="/#lab" className="text-link">
                  Try it above <ArrowUpRight size={15} />
                </Link>
              )}
            </article>
          ))}
        </div>
        <div className="bench" data-reveal>
          <h3>On Picovoice’s wake-word benchmark</h3>
          <p>Hit rate at 0.1 false alarms per hour, 10 dB noise, six words. Higher is better.</p>
          <table className="bench-table" aria-label="Benchmark hit rates by engine">
            <thead>
              <tr>
                <th scope="col">Engine</th>
                <th scope="col">How a word is made</th>
                <th scope="col">Hit rate</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkRows.map((row) => (
                <tr key={row.engine} className={row.ours ? 'is-ours' : undefined}>
                  <th scope="row">{row.engine}</th>
                  <td>{row.kind}</td>
                  <td>
                    <span className="bench-bar" style={{ ['--v' as string]: `${row.hit}%` }} />
                    <span className="bench-value">{row.hit.toFixed(1)}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="bench-note">
            Phonlet Wake measured by us, phrases typed as text; other engines as published.{' '}
            <a href={benchmarkMethodUrl}>Full results and sources</a>.
          </p>
        </div>
        <p className="licence-note mono" data-reveal>
          From each project’s README and the{' '}
          <a href="https://www.home-assistant.io/blog/2024/02/21/voice-chapter-6/">
            Home Assistant blog
          </a>
          , November 2026.
        </p>
      </section>

      <section className="section page-width" id="licence" aria-labelledby="licence-title">
        <div className="section-head" data-reveal>
          <SectionLabel index="06">LICENCE</SectionLabel>
          <h2 id="licence-title">
            Free to build with. <em>Fair when you sell.</em>
          </h2>
        </div>
        <div className="licence-grid">
          <article className="licence-card spot" data-reveal>
            <span className="mono">FREE</span>
            <h3>Non-commercial use</h3>
            <p>
              The engine, the model and the generator, under the PolyForm Noncommercial License
              1.0.0.
            </p>
            <ul>
              <li>Personal projects and study</li>
              <li>Research with no commercial aim</li>
              <li>Charities, schools, public research and government</li>
            </ul>
            <Link href="/docs" className="text-link">
              Start building <ArrowUpRight size={15} />
            </Link>
          </article>
          <article
            className="licence-card is-hot spot"
            data-reveal
            style={{ ['--d' as string]: 1 }}
          >
            <span className="mono">COMMERCIAL LICENCE</span>
            <h3>Products and services</h3>
            <p>
              A product you sell, a device you ship or a service your company runs needs a
              commercial licence. Tell us about it and we keep it simple.
            </p>
            <ul>
              <li>Devices, apps and websites</li>
              <li>Custom wake words for your brand</li>
              <li>Help bringing it to your hardware</li>
            </ul>
            <Link href="/contact" className="button button-orange">
              Contact us <ArrowRight size={17} />
            </Link>
          </article>
        </div>
        <p className="licence-note mono" data-reveal>
          No licence keys. No online checks. The engine never phones home.
        </p>
      </section>

      <section className="section page-width faq" aria-labelledby="faq-title">
        <div className="section-head" data-reveal>
          <SectionLabel index="07">QUESTIONS</SectionLabel>
          <h2 id="faq-title">
            Curious? <em>Good.</em>
          </h2>
        </div>
        <div className="faq-list" data-reveal>
          {faq.map(([q, a], i) => (
            <details key={q}>
              <summary>
                <span className="mono muted">0{i + 1}</span>
                {q}
                <ChevronDown size={17} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="closing" aria-labelledby="closing-title">
        <div className="page-width" data-reveal>
          <h2 id="closing-title">
            What should your product <em>answer to?</em>
          </h2>
          <div className="closing-actions">
            <Link href="#lab" className="button button-orange">
              Try your phrase <ArrowUpRight size={17} />
            </Link>
            <Link href="/docs" className="button button-outline">
              Start building <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

'use client';
import { useEffect, useRef, useState } from 'react';

// Measured figures, each with its measurement:
// - model: resources/wake/model.pwake, 1,013,825 bytes (int8 weights).
// - laptop: the C API on Linux x64 (AMD Ryzen 7 7735HS), en-1 with this site's four phrases:
//   1,044 KB for a session, 1,076 KB after 5 s of audio; each extra phrase about 1.5 KB
//   (8 phrases 1,043 KB, 64 phrases 1,126 KB); 327 s of speech in 2.25 s (0.7% of a core).
// - ESP32-S3-N16R8 at 240 MHz, ESP-IDF 5.4.4, 2026-10-31: weights 75 KB internal RAM + 934 KB
//   PSRAM, 28 KB of tables and buffers in internal RAM, 6.2 ms per 32 ms frame (19%).
const KB = 1024;
const MODEL = 1013825;
const SCALE = 1100 * KB;

type Segment = { label: string; bytes: number; tone: 'hot' | 'warm' | 'cool' };
const memory: { title: string; note: string; total: string; segments: Segment[] }[] = [
  {
    title: 'Laptop, Linux x64',
    note: 'C API, four phrases',
    total: '1.05 MB',
    segments: [
      { label: 'model weights', bytes: MODEL, tone: 'hot' },
      { label: 'audio and state', bytes: 1076 * KB - MODEL - 6 * KB, tone: 'warm' },
      { label: 'four phrases', bytes: 6 * KB, tone: 'cool' },
    ],
  },
  {
    title: 'ESP32-S3 microcontroller',
    note: '240 MHz, external PSRAM',
    total: '1.01 MB',
    segments: [
      { label: 'weights in PSRAM', bytes: 934 * KB, tone: 'hot' },
      { label: 'hot weights in SRAM', bytes: 75 * KB, tone: 'warm' },
      { label: 'tables and buffers', bytes: 28 * KB, tone: 'cool' },
    ],
  },
];

/** Times the browser engine on synthetic audio in a worker: share of one core, or null. */
function useBrowserLoad(start: boolean) {
  const [load, setLoad] = useState<number | null>(null);
  const [state, setState] = useState<'idle' | 'running' | 'done' | 'failed'>('idle');
  useEffect(() => {
    if (!start || state !== 'idle') return;
    setState('running');
    const origin = window.location.origin;
    const source = `
      const { load } = await import('${origin}/wake/js/kws.mjs');
      const [bytes, file] = await Promise.all([
        fetch('${origin}/wake/model.pwake').then((r) => r.arrayBuffer()),
        fetch('${origin}/wake/keywords.json').then((r) => r.json()),
      ]);
      const engine = await load({ simd: false });
      const model = engine.loadModel(new Uint8Array(bytes));
      const session = engine.session(model, { keywords: file.keywords, outputs: { events: true } });
      const pcm = Int16Array.from({ length: 16000 * 4 }, (_, i) => (((i * 7919) % 65536) - 32768) >> 3);
      for (let i = 0; i < 16000; i += 512) session.pushPcm(pcm.subarray(i, i + 512));
      const t = performance.now();
      for (let i = 16000; i < pcm.length; i += 512) session.pushPcm(pcm.subarray(i, i + 512));
      const ms = performance.now() - t;
      session.close(); model.close();
      postMessage(ms / 3 / 10);
    `;
    const url = URL.createObjectURL(new Blob([source], { type: 'text/javascript' }));
    const worker = new Worker(url, { type: 'module' });
    const timer = setTimeout(() => {
      worker.terminate();
      setState('failed');
    }, 20000);
    worker.onmessage = ({ data }) => {
      clearTimeout(timer);
      setLoad(Number(data));
      setState('done');
      worker.terminate();
    };
    worker.onerror = () => {
      clearTimeout(timer);
      setState('failed');
      worker.terminate();
    };
    return () => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);
  return { load, state };
}

export function Footprint() {
  const root = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const browser = useBrowserLoad(seen);
  const cpu: { title: string; note: string; percent: number | null; status?: string }[] = [
    { title: 'Laptop core', note: 'Ryzen 7 7735HS, native', percent: 0.7 },
    { title: 'ESP32-S3 core', note: '240 MHz, default setting', percent: 19 },
    {
      title: 'This browser tab',
      note: 'WebAssembly, measured just now',
      percent: browser.load,
      status:
        browser.state === 'failed'
          ? 'could not measure'
          : browser.state === 'done'
            ? undefined
            : 'measuring…',
    },
  ];
  return (
    <div className={`footprint ${seen ? 'is-seen' : ''}`} ref={root}>
      <div className="footprint-block">
        <h3 className="mono">MEMORY WHILE IT LISTENS</h3>
        {memory.map((m) => (
          <div className="meter" key={m.title}>
            <div className="meter-head">
              <strong>{m.title}</strong>
              <span>{m.note}</span>
              <b>{m.total}</b>
            </div>
            <div className="meter-bar" role="img" aria-label={`${m.title}: ${m.total}`}>
              {m.segments.map((s, i) => (
                <i
                  key={s.label}
                  className={`tone-${s.tone}`}
                  style={{
                    ['--w' as string]: `${Math.max(0.6, (s.bytes / SCALE) * 100)}%`,
                    ['--i' as string]: i,
                  }}
                />
              ))}
            </div>
            <ul className="meter-legend">
              {m.segments.map((s) => (
                <li key={s.label} className={`tone-${s.tone}`}>
                  {s.label}{' '}
                  <span className="mono">
                    {s.bytes < KB
                      ? `${s.bytes} B`
                      : `${Math.round(s.bytes / KB).toLocaleString('en')} KB`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footprint-block">
        <h3 className="mono">SHARE OF ONE CPU CORE</h3>
        {cpu.map((c) => (
          <div className="meter" key={c.title}>
            <div className="meter-head">
              <strong>{c.title}</strong>
              <span>{c.note}</span>
              <b aria-live={c.status ? 'polite' : undefined}>
                {c.percent === null
                  ? (c.status ?? '')
                  : `${c.percent < 1 ? c.percent.toFixed(1) : Math.round(c.percent)}%`}
              </b>
            </div>
            <div
              className="meter-bar meter-cpu"
              role="img"
              aria-label={`${c.title}: ${c.percent === null ? c.status : `${c.percent.toFixed(1)}% of one core`}`}
            >
              <i
                className="tone-hot"
                style={{
                  ['--w' as string]: `${c.percent === null ? 0 : Math.max(0.8, Math.min(100, c.percent))}%`,
                }}
              />
            </div>
          </div>
        ))}
        <p className="footprint-note">
          Every 32 ms frame is scored for all phrases at once. Each extra phrase adds about 1.5 KB
          of memory: sixty-four wake words still fit in 1.1 MB.
        </p>
      </div>
    </div>
  );
}

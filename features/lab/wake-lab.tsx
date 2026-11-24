'use client';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Download, LoaderCircle, Mic, Plus, Square, X } from 'lucide-react';
import { pulse } from '@/lib/pulse';
import { keywordFile, labPhrases, SOURCES, type KeywordFile, type LabPhrase } from './keywords';
import { useGenerator } from './use-generator';
import { useListener, type Heard } from './use-listener';

const MAX_PHRASES = 6;
const SITE_KEYWORDS = '/wake/keywords.json';

// The calibration policy: sensitivity 1 aims at 10 false alarms per hour of speech, 0 at 0.1.
const falseAlarms = (s: number) => 0.1 * 100 ** s;
const formatRate = (r: number) => (r >= 1 ? r.toFixed(r < 3 ? 1 : 0) : r.toFixed(r < 0.3 ? 2 : 1));
const normalize = (text: string) => text.trim().replace(/\s+/g, ' ').toLowerCase();
const megabytes = (bytes: number) => (bytes / 1048576).toFixed(1);

export function WakeLab() {
  const [base, setBase] = useState<KeywordFile | null>(null);
  const [phrases, setPhrases] = useState<LabPhrase[]>([]);
  const [pending, setPending] = useState<string[]>([]);
  const [selected, setSelected] = useState('');
  const [draft, setDraft] = useState('');
  const [sensitivity, setSensitivity] = useState(0.5);
  const [notice, setNotice] = useState('');
  const [heard, setHeard] = useState<Heard[]>([]);
  const [flash, setFlash] = useState<Heard | null>(null);
  const generator = useGenerator();
  const onHeard = useCallback((h: Heard) => {
    setHeard((list) => [h, ...list].slice(0, 5));
    setFlash(h);
  }, []);
  const listener = useListener(onHeard);

  useEffect(() => {
    fetch(SITE_KEYWORDS)
      .then((r) => r.json())
      .then((file: KeywordFile) => {
        setBase(file);
        const ready = labPhrases(file);
        setPhrases(ready);
        setSelected(ready[0]?.name ?? '');
      })
      .catch(() => setNotice('The starting phrases could not be loaded. Reload the page.'));
  }, []);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 1800);
    return () => clearTimeout(timer);
  }, [flash]);

  const file = useMemo(() => (base ? keywordFile(base.model, phrases) : null), [base, phrases]);

  // Changing the phrases or the sensitivity while listening starts a fresh session with them.
  const fileKey = file ? JSON.stringify(file.keywords.map((k) => k.name)) : '';
  const listening = listener.state === 'listening';
  const restart = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settings = useRef({ fileKey, sensitivity });
  useEffect(() => {
    const changed =
      settings.current.fileKey !== fileKey || settings.current.sensitivity !== sensitivity;
    settings.current = { fileKey, sensitivity };
    if (!changed || !listening || !file) return;
    if (restart.current) clearTimeout(restart.current);
    restart.current = setTimeout(() => {
      if (file.keywords.length) void listener.start(file, sensitivity);
      else void listener.stop();
    }, 350);
  }, [fileKey, sensitivity, listening, file, listener]);
  useEffect(() => () => void (restart.current && clearTimeout(restart.current)), []);

  const add = async (event: FormEvent) => {
    event.preventDefault();
    const name = normalize(draft);
    if (!name) return;
    setDraft('');
    setNotice('');
    if (phrases.some((p) => p.name === name) || pending.includes(name)) {
      setSelected(name);
      return;
    }
    if (phrases.length + pending.length >= MAX_PHRASES) {
      setNotice(
        `Up to ${MAX_PHRASES} phrases at once here. Remove one, or use the full generator.`,
      );
      return;
    }
    const known = base && labPhrases(base).find((p) => p.name === name);
    if (known) {
      setPhrases((list) => [...list, known]);
      setSelected(name);
      pulse({ kind: 'calibrated' });
      return;
    }
    setPending((list) => [...list, name]);
    try {
      const result = await generator.request<KeywordFile>({ command: 'enroll', phrases: [name] });
      const [made] = labPhrases(result);
      if (made) {
        setPhrases((list) => [...list, made]);
        setSelected(made.name);
        pulse({ kind: 'calibrated', label: made.name });
        const warnings = made.entry.metadata?.warnings ?? [];
        if (warnings.length) setNotice(`“${made.name}”: ${warnings[0].message}.`);
      } else {
        setNotice(result.metadata.unknown?.[0]?.error ?? `“${name}” could not be enrolled.`);
      }
    } catch (e) {
      setNotice(e instanceof Error ? e.message : String(e));
    } finally {
      setPending((list) => list.filter((n) => n !== name));
    }
  };

  const remove = (name: string) => {
    setPhrases((list) => list.filter((p) => p.name !== name));
    if (selected === name) setSelected(phrases.find((p) => p.name !== name)?.name ?? '');
  };

  const download = () => {
    if (!file) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(file, null, 2) + '\n'], { type: 'application/json' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'keywords.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const current = phrases.find((p) => p.name === selected) ?? phrases[0];
  const working = pending.length > 0;
  const loadingBytes = working && !generator.ready && generator.progress;
  const status = listener.error
    ? listener.error
    : working
      ? loadingBytes
        ? `Loading the calibrator · ${megabytes(loadingBytes[0])} of ${megabytes(loadingBytes[1])} MB, once`
        : `Calibrating “${pending[0]}”…`
      : listener.state === 'starting'
        ? 'Starting the engine…'
        : listening
          ? `Listening. Say ${phrases
              .slice(0, 3)
              .map((p) => `“${p.name}”`)
              .join(', ')}${phrases.length > 3 ? '…' : '.'}`
          : 'Type any phrase and press Enter. Then start listening.';

  return (
    <div className={`lab ${listening ? 'is-listening' : ''} ${flash ? 'is-woken' : ''}`}>
      <div className="lab-bar">
        <span className="lab-live">
          <i aria-hidden="true" /> {listening ? 'LISTENING' : 'LIVE IN YOUR BROWSER'}
        </span>
        <span className="lab-meta mono">en-1 · 1 MB · on-device</span>
      </div>

      <div className="lab-phrases" role="group" aria-label="Wake phrases">
        {phrases.map((p) => (
          <span
            key={p.name}
            className={`chip ${p.name === current?.name ? 'is-selected' : ''} ${flash?.keyword === p.name ? 'is-fired' : ''}`}
          >
            <button
              type="button"
              aria-pressed={p.name === current?.name}
              onClick={() => setSelected(p.name)}
            >
              {p.name}
            </button>
            <button
              type="button"
              className="chip-remove"
              aria-label={`Remove ${p.name}`}
              onClick={() => remove(p.name)}
            >
              <X size={13} />
            </button>
          </span>
        ))}
        {pending.map((name) => (
          <span key={name} className="chip is-pending" aria-busy="true">
            <LoaderCircle size={13} className="spin" aria-hidden="true" /> {name}
          </span>
        ))}
        <form className="lab-add" onSubmit={add}>
          <label className="sr-only" htmlFor="lab-phrase">
            Type a wake phrase
          </label>
          <input
            id="lab-phrase"
            value={draft}
            maxLength={60}
            autoComplete="off"
            spellCheck={false}
            placeholder="type your own…"
            onChange={(e) => {
              setDraft(e.target.value);
              pulse({ kind: 'type' });
            }}
          />
          <button type="submit" aria-label="Add and calibrate the phrase" disabled={!draft.trim()}>
            <Plus size={16} />
          </button>
        </form>
      </div>

      {current ? (
        <div className="lab-detail" key={current.name}>
          <div className="lab-phones" aria-label={`Pronunciation of ${current.name}`}>
            {current.spoken[0].split(' ').map((phone, i) => (
              <span key={i} style={{ ['--i' as string]: i }}>
                {phone}
              </span>
            ))}
            {current.spoken.length > 1 && (
              <em className="mono">+{current.spoken.length - 1} more</em>
            )}
          </div>
          <dl className="lab-facts">
            <div>
              <dt>From</dt>
              <dd>{SOURCES[current.source] ?? current.source}</dd>
            </div>
            <div>
              <dt>Thresholds</dt>
              <dd className="mono">
                {current.entry.threshold_loose.toFixed(2)} /{' '}
                {current.entry.threshold_strict.toFixed(2)}
              </dd>
            </div>
            <div>
              <dt>Calibration</dt>
              <dd className={current.entry.metadata?.flag ? 'is-warn' : ''}>
                {current.entry.metadata?.flag ? 'Uncertain, test it' : 'Reliable'}
              </dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="lab-detail lab-empty">Add a phrase to give your product a name.</div>
      )}

      <div className="lab-tune">
        <label htmlFor="lab-sensitivity">
          <span>Sensitivity</span>
          <output htmlFor="lab-sensitivity" className="mono">
            {sensitivity.toFixed(2)}
          </output>
        </label>
        <input
          id="lab-sensitivity"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={sensitivity}
          style={{ ['--fill' as string]: `${sensitivity * 100}%` }}
          onChange={(e) => setSensitivity(Number(e.target.value))}
        />
        <span className="lab-rate">
          ≈ {formatRate(falseAlarms(sensitivity))} false alarms per hour of speech
        </span>
      </div>

      <Scope analyser={listener.analyser} active={listening} />

      <div className="lab-actions">
        {listener.state === 'idle' ? (
          <button
            type="button"
            className="button button-orange"
            disabled={!file || phrases.length === 0}
            onClick={() => file && void listener.start(file, sensitivity)}
          >
            <Mic size={17} /> Start listening
          </button>
        ) : (
          <button
            type="button"
            className="button button-light"
            onClick={() => void listener.stop()}
          >
            {listener.state === 'starting' ? (
              <LoaderCircle size={17} className="spin" aria-hidden="true" />
            ) : (
              <Square size={15} />
            )}
            Stop listening
          </button>
        )}
        <button
          type="button"
          className="button button-ghost"
          disabled={!file || !phrases.length}
          onClick={download}
        >
          <Download size={16} /> keywords.json
        </button>
        <span className="lab-count mono" aria-label={`${heard.length} detections`}>
          {String(heard.length).padStart(2, '0')} HEARD
        </span>
      </div>

      <p className="lab-status" role="status">
        {status}
      </p>
      {notice && <p className="lab-notice">{notice}</p>}
      <ol className="lab-heard" aria-live="polite">
        {heard.map((h) => (
          <li key={h.at + h.keyword}>
            <strong>“{h.keyword}”</strong>
            <span className="mono">{h.timeSeconds.toFixed(2)} s</span>
          </li>
        ))}
      </ol>
      <p className="lab-foot">
        Audio never leaves this tab.{' '}
        <Link href="/generator">
          Many phrases at once <ArrowUpRight size={13} />
        </Link>
      </p>

      {flash && (
        <div className="lab-burst" aria-hidden="true" key={flash.at}>
          <span className="mono">WAKE WORD</span>
          <strong>“{flash.keyword}”</strong>
        </div>
      )}
    </div>
  );
}

/** The microphone's waveform while listening; a calm line otherwise. */
function Scope({
  analyser,
  active,
}: {
  analyser: React.RefObject<AnalyserNode | null>;
  active: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext('2d');
    if (!element || !ctx) return;
    let frame = 0;
    const data = new Float32Array(1024);
    const draw = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const w = element.clientWidth,
        h = element.clientHeight;
      if (element.width !== Math.round(w * ratio)) {
        element.width = Math.round(w * ratio);
        element.height = Math.round(h * ratio);
      }
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const node = analyser.current;
      if (node) node.getFloatTimeDomainData(data);
      else data.fill(0);
      ctx.lineWidth = 1.6;
      ctx.strokeStyle = node ? '#ff6a3d' : 'rgba(255,255,255,.22)';
      ctx.shadowColor = '#ff5a2b';
      ctx.shadowBlur = node ? 12 : 0;
      ctx.beginPath();
      const step = data.length / w;
      for (let x = 0; x <= w; x++) {
        const v = data[Math.min(data.length - 1, Math.floor(x * step))];
        const y = h / 2 - Math.max(-1, Math.min(1, v * 3)) * (h / 2 - 2);
        if (x) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      }
      ctx.stroke();
      if (node) frame = requestAnimationFrame(draw);
    };
    draw();
    const resize = new ResizeObserver(() => draw());
    resize.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      resize.disconnect();
    };
  }, [analyser, active]);
  return <canvas ref={canvas} className="lab-scope" aria-hidden="true" />;
}

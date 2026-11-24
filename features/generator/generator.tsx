'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, Download, LoaderCircle, Mic, Sparkles, Square } from 'lucide-react';
import { useGenerator } from '@/features/lab/use-generator';
import { pulse } from '@/lib/pulse';

// The keyword file the generator writes; every Phonlet Wake SDK reads it as it is.
type Warning = { code: string; message: string };
type Phrase = {
  name: string;
  pronunciations: number[][];
  threshold_loose: number;
  threshold_strict: number;
  endpoint: boolean;
  metadata: { source: string; flag: boolean; warnings: Warning[] };
};
type KeywordFile = {
  model: { id: string; sha256: string };
  keywords: Phrase[];
  metadata: {
    generator: string;
    unknown: { text: string; error: string }[];
    resolved: { text: string; pronunciations: string[] }[];
  };
};
type Detection = { keyword: string; timeSeconds: number; at: number };
type Manager = { start(): Promise<void>; stop(): Promise<void>; close(): Promise<void> };

// The browser SDK and the en-1 model, served next to the page (see asset-hashes.json).
const SDK = '/wake';
const MODEL = '/wake/model.pwake';
const SOURCES: Record<string, string> = {
  lexicon: 'Dictionary',
  g2p: 'Predicted',
  explicit: 'Your phones',
};

export function Generator() {
  const { request: generate, progress, ready } = useGenerator();
  const [text, setText] = useState('hey kettle\nok computer');
  const [endpoint, setEndpoint] = useState(false);
  const [status, setStatus] = useState<'idle' | 'working'>('idle');
  const [file, setFile] = useState<KeywordFile | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const run = async () => {
    const phrases = text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    if (!phrases.length) return setError('Type at least one phrase.');
    setStatus('working');
    setError('');
    try {
      const result = (await generate({ command: 'enroll', phrases, endpoint })) as KeywordFile;
      setFile(result);
      pulse({ kind: 'calibrated' });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setStatus('idle');
    }
  };

  const json = file ? JSON.stringify(file, null, 2) + '\n' : '';
  const download = () => {
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'keywords.json';
    link.click();
    URL.revokeObjectURL(url);
  };
  const copy = async () => {
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="generator">
      <section className="generator-panel" aria-labelledby="generator-input">
        <h2 id="generator-input">Your phrases</h2>
        <label className="field-label" htmlFor="phrases">
          One phrase per line
        </label>
        <textarea
          id="phrases"
          rows={4}
          value={text}
          spellCheck={false}
          onChange={(e) => setText(e.target.value)}
        />
        <p className="generator-hint">
          Words the dictionary does not know get a predicted pronunciation. To set it yourself,
          write the phones: <code>zorblax=Z AO R B L AE K S</code>.
        </p>
        <label className="generator-check">
          <input
            type="checkbox"
            checked={endpoint}
            onChange={(e) => setEndpoint(e.target.checked)}
          />
          Report a phrase only after the speaker pauses
        </label>
        <div className="generator-actions">
          <button
            type="button"
            className="button button-orange"
            onClick={run}
            disabled={status === 'working'}
          >
            {status === 'working' ? (
              <LoaderCircle size={17} className="spin" aria-hidden />
            ) : (
              <Sparkles size={17} aria-hidden />
            )}
            {status === 'working' ? 'Generating' : 'Generate thresholds'}
          </button>
          <span className="generator-status" role="status">
            {status === 'working' && !ready
              ? progress
                ? `Loading the calibrator · ${(progress[0] / 1048576).toFixed(1)} of ${(progress[1] / 1048576).toFixed(1)} MB, once`
                : 'Loading the calibrator (about 18 MB, once)…'
              : status === 'working'
                ? 'Calibrating…'
                : ''}
          </span>
        </div>
        {error && (
          <p className="generator-error" role="alert">
            {error}
          </p>
        )}
      </section>

      {file && (
        <section className="generator-panel" aria-labelledby="generator-result">
          <h2 id="generator-result">Keyword file</h2>
          <div className="generator-table-wrap">
            <table className="generator-table">
              <thead>
                <tr>
                  <th scope="col">Phrase</th>
                  <th scope="col">Pronunciation</th>
                  <th scope="col">From</th>
                  <th scope="col">Loose</th>
                  <th scope="col">Strict</th>
                  <th scope="col">Notes</th>
                </tr>
              </thead>
              <tbody>
                {file.keywords.map((kw, i) => (
                  <tr key={kw.name + i}>
                    <th scope="row">{kw.name}</th>
                    <td className="mono">
                      {(file.metadata.resolved[i]?.pronunciations ?? []).map((p) => (
                        <div key={p}>{p}</div>
                      ))}
                    </td>
                    <td>{SOURCES[kw.metadata.source] ?? kw.metadata.source}</td>
                    <td className="mono">{kw.threshold_loose}</td>
                    <td className="mono">{kw.threshold_strict}</td>
                    <td>
                      {kw.metadata.warnings.length
                        ? kw.metadata.warnings.map((w) => <div key={w.code}>{w.message}</div>)
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {file.metadata.unknown.length > 0 && (
            <ul className="generator-unknown">
              {file.metadata.unknown.map((u) => (
                <li key={u.text}>
                  <strong>{u.text || '(empty)'}</strong>: {u.error}
                </li>
              ))}
            </ul>
          )}
          <div className="generator-actions">
            <button type="button" className="button button-dark" onClick={download}>
              <Download size={17} aria-hidden /> Download keywords.json
            </button>
            <button type="button" className="button button-outline" onClick={copy}>
              <Copy size={17} aria-hidden /> {copied ? 'Copied' : 'Copy JSON'}
            </button>
          </div>
          <details className="generator-json">
            <summary>Show the JSON</summary>
            <pre>
              <code>{json}</code>
            </pre>
          </details>
          {file.keywords.length > 0 && <TryIt file={file} />}
        </section>
      )}
    </div>
  );
}

function TryIt({ file }: { file: KeywordFile }) {
  const [sensitivity, setSensitivity] = useState(0.5);
  const [state, setState] = useState<'idle' | 'starting' | 'listening'>('idle');
  const [detections, setDetections] = useState<Detection[]>([]);
  const [error, setError] = useState('');
  const manager = useRef<Manager | null>(null);

  const stop = useCallback(async () => {
    const current = manager.current;
    manager.current = null;
    setState('idle');
    await current?.close();
  }, []);
  // A new keyword file or leaving the page ends the session.
  useEffect(() => () => void stop(), [file, stop]);

  const start = async () => {
    setError('');
    setDetections([]);
    setState('starting');
    try {
      const { WakeManager } = await import(/* webpackIgnore: true */ `${SDK}/capture.mjs`);
      const next: Manager = new WakeManager({
        wake: { model: MODEL, keywords: file, sensitivity },
        onDetection: (event: { keyword: string; timeSeconds: number }) =>
          setDetections((list) =>
            [
              { keyword: event.keyword, timeSeconds: event.timeSeconds, at: Date.now() },
              ...list,
            ].slice(0, 8),
          ),
        onError: (e: Error) => {
          setError(e.message);
          void stop();
        },
      });
      manager.current = next;
      await next.start();
      setState('listening');
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      await stop();
    }
  };

  return (
    <div className="generator-try" aria-labelledby="generator-try">
      <h3 id="generator-try">Try it with your microphone</h3>
      <p>
        Runs the Phonlet Wake engine in your browser with these phrases. Audio stays on this device.
      </p>
      <label className="field-label" htmlFor="try-sensitivity">
        Sensitivity <output htmlFor="try-sensitivity">{sensitivity.toFixed(2)}</output>
      </label>
      <input
        id="try-sensitivity"
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={sensitivity}
        disabled={state !== 'idle'}
        onChange={(e) => setSensitivity(Number(e.target.value))}
      />
      <div className="generator-actions">
        {state === 'idle' ? (
          <button type="button" className="button button-orange" onClick={start}>
            <Mic size={17} aria-hidden /> Start listening
          </button>
        ) : (
          <button type="button" className="button button-dark" onClick={() => void stop()}>
            {state === 'starting' ? (
              <LoaderCircle size={17} className="spin" aria-hidden />
            ) : (
              <Square size={17} aria-hidden />
            )}
            Stop
          </button>
        )}
        <span className="generator-status" role="status">
          {state === 'listening' ? 'Listening. Say one of your phrases.' : ''}
        </span>
      </div>
      {error && (
        <p className="generator-error" role="alert">
          {error}
        </p>
      )}
      <ol className="generator-detections" aria-live="polite">
        {detections.map((d) => (
          <li key={d.at + d.keyword}>
            <strong>{d.keyword}</strong> at {d.timeSeconds.toFixed(2)} s
          </li>
        ))}
      </ol>
    </div>
  );
}

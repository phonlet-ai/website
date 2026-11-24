'use client';
import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
// Whole-line comments: // in JS, C and Kotlin; "# " in Python and specs (not C's #include).
const isComment = (line: string) => {
  const text = line.trim();
  return text.startsWith('//') || text === '#' || text.startsWith('# ');
};

export function CodeBlock({
  code,
  title = 'wake.js',
  note,
}: {
  code: string;
  title?: string;
  note?: string;
}) {
  const [copied, setCopied] = useState(false),
    [error, setError] = useState('');
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setError('');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Select the code below to copy it.');
    }
  };
  return (
    <div className="code-window">
      <div className="code-title">
        <span>
          <Terminal size={14} />
          {title}
        </span>
        <button onClick={copy} aria-label="Copy code">
          {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {/* Focusable so keyboard users can scroll long lines on narrow screens. */}
      <pre tabIndex={0} role="region" aria-label={`${title} code`}>
        <code>
          {code.split('\n').map((line, i) => (
            <span className={`code-line ${isComment(line) ? 'code-comment' : ''}`} key={i}>
              <span className="line-number" aria-hidden="true">
                {i + 1}
              </span>
              <span>{line || ' '}</span>
            </span>
          ))}
        </code>
      </pre>
      {(note || error) && (
        <div className="code-note" role="status">
          {error || note}
        </div>
      )}
    </div>
  );
}
export const espSpec = `# Phonlet Wake on ESP32-S3 (measured 2026-10-31)
board      ESP32-S3-N16R8, 240 MHz, 8 MB octal PSRAM
framework  ESP-IDF 5.4 component
audio      I2S MEMS microphone, 16 kHz mono
model      en-1, int8 weights, ~1 MB
memory     75 KB internal RAM + 934 KB PSRAM
cpu        19% of one core (6.2 ms per 32 ms frame)
delay      +96 ms by default, configurable 0-224 ms
keywords   any phrase, enrolled from text`;

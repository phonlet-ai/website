// Picovoice's public wake-word benchmark: hit rate at 0.1 false alarms per hour, 10 dB noise, mean of
// six words. Phonlet Wake measured by us (wake repository, research/benchmark/, run of 2026-11-27);
// the other engines as published, with sources in the wake repository's docs/benchmark.md.
import { repoUrl } from '@/lib/release';

export type BenchmarkRow = {
  engine: string;
  kind: string;
  /** Hit rate in percent. */
  hit: number;
  ours?: boolean;
};

export const benchmarkMethodUrl = `${repoUrl}/blob/main/docs/benchmark.md`;

export const benchmarkRows: BenchmarkRow[] = [
  { engine: 'Picovoice Porcupine v4', kind: 'closed, a model per word', hit: 97.3 },
  { engine: 'Phonlet Wake 0.1.0', kind: 'typed, no training', hit: 94.9, ours: true },
  { engine: 'Hark v0.3', kind: 'typed, no training', hit: 78.1 },
  { engine: 'Kitt.ai Snowboy', kind: 'recorded templates', hit: 68.1 },
  { engine: 'sherpa-onnx KWS 3.3M', kind: 'typed, no training', hit: 66.0 },
  { engine: 'CMU PocketSphinx 5.1.1', kind: 'dictionary lookup', hit: 48.0 },
  { engine: 'Vosk 0.3.45', kind: 'speech recognizer grammar', hit: 32.7 },
];

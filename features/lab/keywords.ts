// The Phonlet Wake keyword file, as the threshold generator writes it and every SDK reads it.
export type Warning = { code: string; message: string };
export type Phrase = {
  name: string;
  pronunciations: number[][];
  threshold_loose: number;
  threshold_strict: number;
  endpoint: boolean;
  metadata?: {
    source?: string;
    flag?: boolean;
    warnings?: Warning[];
    expected_error?: { threshold_loose: number; threshold_strict: number; default: number };
    fa_factor_at_default?: number;
  };
};
export type Resolved = { text: string; source: string; pronunciations: string[] };
export type KeywordFile = {
  model: { id: string; sha256: string };
  keywords: Phrase[];
  metadata: {
    generator?: string;
    rate_loose?: number;
    rate_strict?: number;
    unknown?: { text: string; error: string }[];
    resolved?: Resolved[];
    [key: string]: unknown;
  };
};

/** One phrase in the lab: its keyword entry and how it is pronounced, in ARPAbet. */
export type LabPhrase = {
  name: string;
  entry: Phrase;
  spoken: string[];
  source: string;
};

// The engine's phone inventory: id i is PHONES[i] (0 is the blank).
// prettier-ignore
export const PHONES = [
  'blank', 'AA', 'AE', 'AH', 'AO', 'AW', 'AY', 'B', 'CH', 'D', 'DH', 'EH', 'ER', 'EY', 'F', 'G',
  'HH', 'IH', 'IY', 'JH', 'K', 'L', 'M', 'N', 'NG', 'OW', 'OY', 'P', 'R', 'S', 'SH', 'T', 'TH',
  'UH', 'UW', 'V', 'W', 'Y', 'Z', 'ZH',
] as const;

export const spell = (ids: number[]) => ids.map((id) => PHONES[id] ?? '?').join(' ');

export const SOURCES: Record<string, string> = {
  lexicon: 'Dictionary',
  g2p: 'Predicted',
  explicit: 'Your phones',
};

/** The phrases of a keyword file, paired with their resolved pronunciations. */
export function labPhrases(file: KeywordFile): LabPhrase[] {
  return file.keywords.map((entry, i) => {
    const resolved = file.metadata.resolved?.[i];
    return {
      name: entry.name,
      entry,
      spoken: resolved?.pronunciations ?? entry.pronunciations.map(spell),
      source: entry.metadata?.source ?? resolved?.source ?? 'lexicon',
    };
  });
}

/** A keyword file for the given phrases, bound to the model. */
export function keywordFile(model: KeywordFile['model'], phrases: LabPhrase[]): KeywordFile {
  return {
    model,
    keywords: phrases.map((p) => p.entry),
    metadata: {
      generator: 'phonletai.com',
      resolved: phrases.map((p) => ({ text: p.name, source: p.source, pronunciations: p.spoken })),
    },
  };
}

// /llms.txt: the docs as plain Markdown for AI assistants (llmstxt.org), built from the same
// page list, platform text, and examples as the site, so it cannot drift from the pages.
import { docPages } from '@/components/docs-content';
import { site } from '@/lib/site';
import { sdkDocs } from '@/lib/sdk-docs';
import { espCode, keywordFileCode, wakeCode } from '@/lib/samples';

export const dynamic = 'force-static';

const fence = (language: string, code: string) => '```' + language + '\n' + code + '\n```';

export function GET() {
  const base = (site.SITE_URL ?? '').replace(/\/$/, '');
  const url = (slug: string) => `${base}/docs/${slug === 'getting-started' ? '' : `${slug}/`}`;
  const languages: Record<string, string> = {
    nodejs: 'js',
    python: 'python',
    c: 'c',
    android: 'kotlin',
  };
  const text = [
    '# Phonlet Wake',
    '',
    '> Custom wake words from text, on the device. Type a phrase and get a wake word with calibrated thresholds and a predicted false-alarm rate. One English model of about 1 MB runs every phrase offline: in the browser (WebAssembly), Node.js, Python, C / C++, Android, and on ESP32-S3.',
    '',
    'Licence: PolyForm Noncommercial License 1.0.0 (personal, study, noncommercial research, charities, schools, public research, government); a product, device or service needs a commercial licence, by contact. No licence keys or online checks.',
    '',
    `Make a wake word: type phrases at ${base}/generator/ (runs in the browser) and download keywords.json, the keyword file every SDK reads as it is:`,
    '',
    fence('json', keywordFileCode),
    '',
    'Audio for every SDK: mono, 16 kHz, signed 16-bit PCM, in chunks of any size (frames are 512 samples, 32 ms).',
    '',
    'Footprint: the en-1 model is 1,013,825 bytes (int8 weights) for every phrase. Memory while listening: about 1.05 MB (C API, Linux x64, four phrases); each extra phrase adds about 1.5 KB. CPU: 0.7% of one laptop core (AMD Ryzen 7 7735HS, native), about 8% in a browser (WebAssembly), 19% of one ESP32-S3 core at 240 MHz (weights 75 KB internal RAM + 934 KB PSRAM, 28 KB of tables and buffers).',
    '',
    `Adding Phonlet Wake to a project? Follow the step-by-step instructions at ${base}/agents.md.`,
    '',
    '## Docs',
    '',
    ...docPages.map((page) => `- [${page.title}](${url(page.slug)}): ${page.description}`),
    '',
    '## Examples',
    '',
    '### Web (the browser SDK served by this website at /wake/)',
    '',
    fence('js', wakeCode),
    '',
    ...sdkDocs.flatMap((doc) => [
      `### ${doc.label}`,
      '',
      doc.intro,
      '',
      fence(languages[doc.slug] ?? '', doc.code),
      '',
      ...doc.steps.map((step) => `- ${step}`),
      ...doc.notes.map((note) => `- ${note}`),
      '',
    ]),
    '### ESP32-S3',
    '',
    'ESP-IDF component; about 19% of one core at the default setting (measured on an ESP32-S3-N16R8, ESP-IDF 5.4, six phrases).',
    '',
    fence('c', espCode),
    '',
    '## Optional',
    '',
    `- [Contact](${base}/contact/): commercial licences, help with phrases and hardware.`,
    '',
  ].join('\n');
  return new Response(text, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}

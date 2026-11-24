// /agents.md: instructions for AI coding agents that add Phonlet Wake to someone's project. Built
// from the same samples, platform text and release facts as the site, so it cannot drift from the
// pages. /llms.txt indexes the docs; this file is the step-by-step recipe.
import { site } from '@/lib/site';
import { sdkDocs } from '@/lib/sdk-docs';
import { espCode, keywordFileCode, quickstartCode, wakeCode } from '@/lib/samples';
import {
  GENERATOR_FILE,
  HF_MODEL,
  HF_SPACE,
  KEYWORDS_FILE,
  MODEL_FILE,
  RELEASE,
  assetUrl,
  installs,
  releaseUrl,
  repoUrl,
} from '@/lib/release';

export const dynamic = 'force-static';

const fence = (language: string, code: string) => '```' + language + '\n' + code + '\n```';
// The install command and model note for one SDK, as Markdown lines.
const install = (slug: string) => {
  const entry = installs[slug];
  if (!entry) return [];
  return [
    'Install:',
    '',
    ...(entry.command ? [fence('sh', entry.command), ''] : []),
    entry.text,
    '',
  ];
};
const MODEL_SHA256 = '8be3687d060f953d0069480cf53d1fd0aa66e04551c2a4b600823a992a864af8';

export function GET() {
  const base = (site.SITE_URL ?? '').replace(/\/$/, '');
  const repo = repoUrl;
  const asset = assetUrl;
  const languages: Record<string, string> = {
    nodejs: 'js',
    python: 'python',
    c: 'c',
    android: 'kotlin',
  };
  const text = [
    '# Phonlet Wake: instructions for AI coding agents',
    '',
    'Use this file when a person asks you to add a wake word (a hotword or voice trigger such as "hey nova") to their app, website, service or device with Phonlet Wake. It tells you how to make the phrase, which files to download and the code for each platform.',
    '',
    '## What Phonlet Wake is',
    '',
    `- On-device wake-word detection for any phrase you can type. One English acoustic model, \`en-1\` (1,013,825 bytes, int8 weights, SHA-256 \`${MODEL_SHA256}\`), listens for several phrases at once, offline.`,
    '- A phrase is data, not a model: its pronunciations (phone ids) and two calibrated thresholds, made from text in seconds by the threshold generator. Nothing is recorded or trained.',
    '- Footprint: about 1.05 MB of memory while listening (each extra phrase about 1.5 KB); 0.7% of one laptop core natively, about 8% in a browser tab (WebAssembly), 19% of one 240 MHz ESP32-S3 core.',
    '- Runs entirely on the device: no network, no account, no API key.',
    '',
    '## Rules that matter',
    '',
    '1. **Audio**: mono, 16 kHz, signed 16-bit PCM, in chunks of any size. The engine works in 512-sample (32 ms) frames. Resample to 16 kHz before the engine; the SDKs never resample.',
    '2. **Never invent thresholds or phone ids.** Every phrase comes from the generator (step 1). Thresholds belong to one model; a keyword file made for another model is refused.',
    '3. **Sensitivity** is 0 to 1 per phrase: 1 aims at about 10 false alarms per hour of speech, 0.5 at about 1, 0 at about 0.1. Start at 0.5.',
    '4. **Good phrases** have two to four syllables and sounds that are rare in everyday speech ("hey nova", "okay kettle"). Short common words ("the", "read") fire too often. Read the warnings the generator writes into each phrase\'s `metadata.warnings`.',
    `5. **Licence**: PolyForm Noncommercial 1.0.0. Personal projects, study, research with no commercial aim, charities, schools, public research and government may use it freely. A product someone sells, a device they ship or a service their company runs needs a commercial licence: tell the person and point them to ${base}/contact/ before you ship it into a commercial product.`,
    '',
    '## Step 1: make the keyword file',
    '',
    `Either ask the person to type their phrases at ${base}/generator/ (it runs in the browser) and download \`keywords.json\`, or run the command-line generator yourself (static Linux x64 binary):`,
    '',
    fence(
      'sh',
      [
        `curl -LO ${asset(GENERATOR_FILE)}`,
        `chmod +x ${GENERATOR_FILE}`,
        `./${GENERATOR_FILE} "hey nova" "okay kettle" --out keywords.json`,
      ].join('\n'),
    ),
    '',
    'Words missing from the 394,000-word dictionary get a predicted pronunciation (`metadata.source` is `g2p`); to set it yourself write the phones: `"zorblax=Z AO R B L AE K S"`, several separated by `|`. `--strict` rejects phrases with quality warnings; exit status 0 means at least one phrase was enrolled. The keyword file looks like this (metadata shortened):',
    '',
    fence('json', keywordFileCode),
    '',
    '## Step 2: get the model and the SDK',
    '',
    `Release ${RELEASE}: ${releaseUrl} (every file is listed in \`SHA256SUMS\`).`,
    '',
    '| Platform | Files | Install |',
    '| --- | --- | --- |',
    `| Python (CPython 3.11+, Linux x64) | \`phonlet_wake-0.1.0-py3-none-linux_x86_64.whl\`, \`phonlet_wake_model_en-0.1.0-py3-none-any.whl\` | \`pip install ${asset('phonlet_wake-0.1.0-py3-none-linux_x86_64.whl')} ${asset('phonlet_wake_model_en-0.1.0-py3-none-any.whl')}\` |`,
    `| Node.js (Linux x64) | \`phonlet-ai-wake-node-0.1.0.tgz\`, \`phonlet-ai-wake-node-linux-x64-gnu-0.1.0.tgz\`, \`phonlet-ai-wake-model-en-0.1.0.tgz\` | \`npm install --ignore-scripts ${asset('phonlet-ai-wake-node-0.1.0.tgz')} ${asset('phonlet-ai-wake-node-linux-x64-gnu-0.1.0.tgz')} ${asset('phonlet-ai-wake-model-en-0.1.0.tgz')}\` |`,
    `| Browser | \`phonlet-ai-wake-web-0.1.0.tgz\` (React hook: \`phonlet-ai-wake-react-0.1.0.tgz\`) | Serve the package's files from your origin; the SDK runs the engine in a Web Worker |`,
    '| C / C++ | `wake-native-0.1.0-linux-x64-gnu.tar.gz`, `wake-native-0.1.0-windows-x64.zip` | Include `phonlet_wake.h`, link `kws_engine` |',
    '| Android | `phonlet-wake-android-0.1.0.aar` | Add the AAR to the app module |',
    '| .NET | `kws_engine.dll` from the Windows zip | Use `sdk/dotnet` from the repository |',
    '| ESP32-S3 | The ESP-IDF component in `sdk/esp32/wake` of the repository | Embed the model and the keyword file in flash |',
    `| Any | \`${MODEL_FILE}\` (the model), \`${KEYWORDS_FILE}\` (five English phrases) | ${asset(MODEL_FILE)} |`,
    '',
    'macOS and other targets build from source: see the repository README. The Linux x64 native libraries (C, Python, Node.js) need glibc 2.32 and the libstdc++ of GCC 11 or newer (Ubuntu 22.04, Debian 12, RHEL 9 or later); the generator binary is static.',
    '',
    '## Step 3: the code',
    '',
    'Every SDK takes the keyword file as a path (or URL in the browser), as the parsed object, or as the list of phrases written in code.',
    '',
    'The examples below load the model from `en-1.pwake` and write one phrase inline; replace both with your files. The model is in the model packages: Python `from phonlet_wake_model_en import english` then `english["model"]`; Node.js `import { english } from \'@phonlet-ai/wake-model-en\'` then `english.model`. Anywhere else use the path where you saved `phonlet-wake-en-1.pwake`.',
    '',
    '### Browser (microphone, in a worker)',
    '',
    `These run as written on ${base}, which serves the SDK, the model and a keyword file at \`/wake/\`; in your project, serve the browser package and your own files the same way.`,
    '',
    fence('js', wakeCode),
    '',
    'Processing your own audio instead of the microphone:',
    '',
    fence('js', quickstartCode),
    '',
    ...sdkDocs.flatMap((doc) => [
      `### ${doc.label}`,
      '',
      doc.intro,
      '',
      fence(languages[doc.slug] ?? '', doc.code),
      '',
      ...doc.steps.map((step) => `- ${step}`),
      '',
      ...install(doc.slug),
    ]),
    '### ESP32-S3',
    '',
    "ESP-IDF component with its own engine for the chip's vector unit; about 19% of one core at the default setting. Needs PSRAM (the weights take 934 KB of it plus 75 KB of internal RAM) and an I2S microphone at 16 kHz.",
    '',
    fence('c', espCode),
    '',
    ...install('esp32'),
    '## When it does not work',
    '',
    '- `INCOMPATIBLE_ARTIFACT` / "made for model …": the keyword file belongs to another model. Use the `en-1` model from the same release, or regenerate the file.',
    "- Nothing fires: check the audio really is 16 kHz mono 16-bit (a 44.1 or 48 kHz stream must be resampled first), raise the sensitivity a step (0.6 to 0.7), and read the phrase's `metadata.warnings`.",
    '- Too many false alarms: lower the sensitivity, or choose a longer, more distinctive phrase.',
    '- Browser: use HTTPS or localhost; ask for the microphone only after a click; close the manager when done so tracks, the audio context and the worker stop.',
    '',
    '## More',
    '',
    `- Documentation index for AI assistants: ${base}/llms.txt`,
    `- Docs: ${base}/docs/`,
    `- Keyword file reference: ${repo}/blob/main/docs/keywords.md`,
    `- Source and releases: ${repo}`,
    `- The model on Hugging Face: ${HF_MODEL}; the lab as a Space: ${HF_SPACE}`,
    `- Commercial licences: ${base}/contact/`,
    '',
  ].join('\n');
  return new Response(text, { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
}

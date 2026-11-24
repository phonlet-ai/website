import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CodeBlock, espSpec } from './code-block';
import { GetSdk } from './get-sdk';
import { releaseUrl } from '@/lib/release';
import { espCode, quickstartCode } from '@/lib/samples';
import { sdkDocs, type SdkDoc } from '@/lib/sdk-docs';
export const docPages = [
  {
    slug: 'getting-started',
    title: 'Start with a sound.',
    description: 'What Phonlet Wake is, what you can try today, and how to get your own phrase.',
  },
  {
    slug: 'wake-word',
    title: 'Your first wake word.',
    description: 'Use the WebAssembly runtime and model bundled with this website.',
  },
  ...sdkDocs.map(({ slug, title, description }) => ({ slug, title, description })),
  {
    slug: 'esp32',
    title: 'Phonlet Wake on ESP32-S3.',
    description: 'The ESP-IDF component: measured CPU, memory and delay, and how to build it in.',
  },
  {
    slug: 'custom-wake-words',
    title: 'Custom wake words from text.',
    description:
      'How a typed phrase becomes pronunciations and calibrated thresholds, and what makes a good one.',
  },
  {
    slug: 'audio-lifecycle',
    title: 'Own the audio lifecycle.',
    description:
      'Capture deliberately, process predictably, and clean up when the interaction ends.',
  },
];
const platformRows = [
  ['/docs/wake-word', 'Browser (WebAssembly, scalar and SIMD)', 'Live on this website'],
  ['/docs/nodejs', 'Node.js', 'Native add-on; tested on Linux x64'],
  ['/docs/python', 'Python', 'Wheel; tested on Linux x64'],
  ['/docs/c', 'C / C++', 'One header; libraries for Linux x64 and Windows x64'],
  ['/docs/android', 'Android', 'AAR and a demo app; tested on a phone'],
  ['/docs/esp32', 'ESP32-S3', 'ESP-IDF component; tested on the board'],
] as const;
// One platform page: what ships, the example, how to use it, and how to get it.
function SdkDocContent({ doc }: { doc: SdkDoc }) {
  return (
    <>
      <p>{doc.intro}</p>
      <h2>Example</h2>
      <CodeBlock code={doc.code} title={doc.codeTitle} />
      <h2>How it works</h2>
      <ol>
        {doc.steps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <h2>Good to know</h2>
      <ul>
        {doc.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
      <h2>Get the {doc.label} SDK</h2>
      <GetSdk label={doc.label} slug={doc.slug} />
    </>
  );
}
const keywordCode = `{
  "name": "hey barista",
  "pronunciations": [[16, 13, 7, 1, 28, 18, 29, 31, 3]],
  "threshold_loose": -1.3955078125,
  "threshold_strict": -1.0380859375,
  "endpoint": true,
  "metadata": {
    "source": "lexicon",
    "expected_error": { "threshold_loose": 40.1, "threshold_strict": 43.2, "default": 41.7 },
    "fa_factor_at_default": 1.7,
    "flag": false,
    "warnings": []
  }
}`;
export function DocsContent({ slug }: { slug: string }) {
  const sdk = sdkDocs.find((doc) => doc.slug === slug);
  if (sdk) return <SdkDocContent doc={sdk} />;
  if (slug === 'getting-started')
    return (
      <>
        <p>
          Phonlet Wake detects wake words on the device. One acoustic model recognises the sounds of
          English speech; each wake word is a small entry of pronunciations and thresholds made from
          text. You can try it now without an account, API key, or download.
        </p>
        <div className="docs-grid">
          <Link href="/#lab">
            <strong>
              1. Try your phrase <ArrowUpRight size={15} />
            </strong>
            <p>Type it in the lab, start listening, and say it out loud.</p>
          </Link>
          <Link href="/docs/wake-word">
            <strong>
              2. Follow the code <ArrowUpRight size={15} />
            </strong>
            <p>Load the SDK with the model and a keyword file, then pass it audio.</p>
          </Link>
          <Link href="/docs/custom-wake-words">
            <strong>
              3. Understand your phrase <ArrowUpRight size={15} />
            </strong>
            <p>Pronunciations, calibrated thresholds, sensitivity, and quality checks.</p>
          </Link>
          <Link href="/generator">
            <strong>
              4. Make your keyword file <ArrowUpRight size={15} />
            </strong>
            <p>Every phrase you need in one file, made in your browser, for every SDK.</p>
          </Link>
        </div>
        <h2>Where it runs</h2>
        <table className="availability-table">
          <thead>
            <tr>
              <th>Platform</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {platformRows.map(([href, name, status]) => (
              <tr key={href}>
                <td>
                  <Link href={href}>{name}</Link>
                </td>
                <td>{status}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h2>What you need for the lab</h2>
        <p>
          A current browser with WebAssembly, AudioWorklet, and microphone support. Microphone
          capture requires HTTPS or localhost.
        </p>
        <h2>Licence</h2>
        <p>
          The engine, the model and the generator are licensed under the PolyForm Noncommercial
          License 1.0.0: free for personal projects, study, research with no commercial aim,
          charities, schools, public research and government. A product you sell, a device you ship
          or a service your company runs needs a commercial licence.{' '}
          <Link href="/contact">Contact us</Link> and we will keep it simple.
        </p>
      </>
    );
  if (slug === 'wake-word')
    return (
      <>
        <p>
          The browser SDK, the <code>en-1</code> model and a keyword file are served from{' '}
          <code>/wake/</code> on this website, so the example below runs as written on this origin.
        </p>
        <h2>Load, listen, release.</h2>
        <CodeBlock code={quickstartCode} title="wake.js" />
        <p>
          The engine runs in a Web Worker; <code>process</code> resolves after the worker has scored
          the audio. For the microphone, <code>WakeManager</code> from{' '}
          <code>/wake/capture.mjs</code> captures 16 kHz audio and calls you on each detection. No
          audio is processed on a server.
        </p>
        <h2>Try a complete example</h2>
        <p>
          The <Link href="/#lab">lab</Link> on the home page runs this SDK live. For a project to
          start from, download <code>wake-demo-web-0.1.0.tar.gz</code> from the{' '}
          <a href={releaseUrl}>release</a>: a page with the SDK, the model and a keyword file, ready
          to serve from your own origin.
        </p>
        <h2>Choose your phrases</h2>
        <p>
          A keyword file holds each phrase’s pronunciations and calibrated thresholds. Make one in
          the <Link href="/#lab">lab</Link> or the <Link href="/generator">generator</Link>: both
          run the threshold generator in your browser and download <code>keywords.json</code>. Pass
          its URL, the parsed file, or the phrases themselves as <code>keywords</code>. The model is
          fixed; a new phrase never retrains anything.
        </p>
        <h2>Keep the boundaries explicit</h2>
        <ul>
          <li>Request microphone permission after a deliberate user action.</li>
          <li>Give the engine 16 kHz mono signed 16-bit PCM.</li>
          <li>
            Close the manager (or the <code>Wake</code>) when finished: tracks stop, the audio
            context closes and the worker ends.
          </li>
        </ul>
        <h2>Source and verification</h2>
        <p>
          <code>/wake/</code> serves the Phonlet Wake browser SDK 0.1.0 (frontend{' '}
          <code>3f047efa</code>, scalar and SIMD WebAssembly) and the <code>en-1</code> model,
          SHA-256 <code>8be3687d060f953d0069480cf53d1fd0aa66e04551c2a4b600823a992a864af8</code>. The
          keyword file names that hash, and the SDK refuses it with any other model.
        </p>
      </>
    );
  if (slug === 'custom-wake-words')
    return (
      <>
        <p>
          A Phonlet wake word is not a model. It is a short entry that tells the engine which sound
          sequences to listen for and how strict to be. Making one takes about a second.
        </p>
        <h2>1. Pronunciations</h2>
        <p>
          Each word is looked up in a 394,409-word pronunciation lexicon. Words it does not know,
          such as product names, get a pronunciation from a grapheme-to-phoneme model. You can also
          spell a phrase out yourself in ARPAbet phonemes, for example{' '}
          <code>snowboy = S N OW B OY</code>.
        </p>
        <h2>2. Calibration</h2>
        <p>
          Phonlet Wake predicts how often the phrase would fire by accident and turns that into two
          thresholds:
        </p>
        <ul>
          <li>
            <code>threshold_loose</code>: the loose end, about 10 false alarms per hour at
            sensitivity 1.
          </li>
          <li>
            <code>threshold_strict</code>: the strict end, about 0.1 false alarms per hour at
            sensitivity 0.
          </li>
        </ul>
        <p>
          The sensitivity slider moves between them. The result also reports the expected threshold
          error, so you know how much to trust the calibration for that phrase.
        </p>
        <CodeBlock code={keywordCode} title="keywords.json" />
        <h2>3. Several pronunciations</h2>
        <p>
          A wake word can list more than one pronunciation, for regional accents or alternative
          spellings. It fires when any of them matches, so their false alarms add up and the shared
          thresholds become stricter. Add only the pronunciations people actually say.
        </p>
        <h2>4. Quality checks</h2>
        <table className="availability-table">
          <thead>
            <tr>
              <th>Warning</th>
              <th>Means</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Too short</td>
              <td>Fewer than 4 phonemes: it occurs inside ordinary words and speech.</td>
            </tr>
            <tr>
              <td>Too long</td>
              <td>More than 12 phonemes: beyond the calibration phrases.</td>
            </tr>
            <tr>
              <td>Too common</td>
              <td>So frequent in speech that it would fire whenever it is said.</td>
            </tr>
            <tr>
              <td>Uncertain</td>
              <td>The calibration error for this phrase is high; test it before you ship.</td>
            </tr>
          </tbody>
        </table>
        <h2>Make yours</h2>
        <p>
          Type your phrases in the <Link href="/#lab">lab</Link> or the{' '}
          <Link href="/generator">generator</Link>: both run the threshold generator in your browser
          and download <code>keywords.json</code>, the file every SDK reads as it is. On Linux, the{' '}
          <code>wake-threshold</code> command does the same from a terminal.
        </p>
      </>
    );
  if (slug === 'audio-lifecycle')
    return (
      <>
        <h2>Make permission a deliberate step.</h2>
        <p>
          Do not open the microphone as a side effect of page loading. Explain what will happen,
          then request permission after a click. A rejected permission request should leave the
          interface in a state that can be retried.
        </p>
        <h2>Handle the interrupted paths.</h2>
        <p>
          A person can leave while a model loads or while a permission dialog is open. The lab on
          the home page counts its starts, discards asynchronous work from an earlier one and stops
          microphone streams that arrive late. Stop works while the engine is still starting.
        </p>
        <h2>Give every resource an owner.</h2>
        <ul>
          <li>The component owns its media stream and stops every track.</li>
          <li>The AudioContext owns the source and worklet graph.</li>
          <li>The worker owns the model and inference session.</li>
          <li>Effect cleanup removes listeners and cancels timers.</li>
        </ul>
        <h2>Be honest about the visual signal.</h2>
        <p>
          The lab’s waveform is the microphone’s real signal. The terrain behind the hero is
          decorative until you listen; then it follows the measured level. Reduced-motion
          preferences stop decorative animation.
        </p>
        <h2>Respect navigation and visibility.</h2>
        <p>
          The lab stops listening when you leave the page and releases every track, audio context
          and worker, so it never keeps listening in the background.
        </p>
      </>
    );
  return (
    <>
      <p>
        Phonlet Wake runs on ESP32-S3. The engine ships as an ESP-IDF component with its own code
        for the chip’s vector instructions, and a demo firmware streams an I2S microphone through
        it. Any phrase you type becomes a wake word on the device, with no recordings and no
        per-word training.
      </p>
      <CodeBlock code={espSpec} title="esp32-s3" />
      <h2>Example</h2>
      <p>
        Embed the model in flash, describe your phrases as JSON (each phrase’s pronunciations and
        two calibrated thresholds), start the engine once, and pass every I2S read to it:
      </p>
      <CodeBlock code={espCode} title="main.c" />
      <h2>Measured on hardware</h2>
      <p>
        An ESP32-S3-N16R8 at 240 MHz with 8 MB of octal PSRAM, an INMP441 microphone, ESP-IDF 5.4,
        and six phrases listening at once (31 October 2026). In the first live test on this board,
        each of the six phrases was detected when spoken.
      </p>
      <p>
        The engine works through a few 32 ms frames at a time to save memory traffic. One
        configuration setting trades CPU for response time; it changes when a detection is reported,
        not which phrases are detected:
      </p>
      <table className="availability-table">
        <thead>
          <tr>
            <th>Setting</th>
            <th>Added delay</th>
            <th>CPU (one core)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Fastest response</td>
            <td>0 ms</td>
            <td>46%</td>
          </tr>
          <tr>
            <td>Balanced</td>
            <td>32 ms</td>
            <td>28%</td>
          </tr>
          <tr>
            <td>Default</td>
            <td>96 ms</td>
            <td>19%</td>
          </tr>
          <tr>
            <td>Lowest CPU</td>
            <td>224 ms</td>
            <td>16%</td>
          </tr>
        </tbody>
      </table>
      <p>The second core stays free for your application, Wi-Fi, or audio playback.</p>
      <h2>What your board needs</h2>
      <ul>
        <li>
          An ESP32-S3 with PSRAM. The model’s weights take about 1 MB: 75 KB in internal RAM, the
          rest in PSRAM.
        </li>
        <li>An I2S MEMS microphone, read at 16 kHz.</li>
        <li>
          One mono audio stream. Microphone arrays, voice activity detection, and noise suppression
          stay in your own audio pipeline, in front of the engine.
        </li>
      </ul>
      <h2>Get the component</h2>
      <GetSdk label="ESP32-S3" slug="esp32" />
    </>
  );
}

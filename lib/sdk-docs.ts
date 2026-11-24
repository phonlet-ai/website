// Platform pages of the docs, as plain text so /llms.txt can reuse them. Facts come from each
// SDK's README in the wake repository; the examples are the ones in lib/samples.ts, each run as
// published against its SDK.
import { androidCode, cCode, nodeCode, pythonCode } from './samples';

export type SdkDoc = {
  slug: string;
  label: string;
  title: string;
  description: string;
  intro: string;
  codeTitle: string;
  code: string;
  steps: string[];
  notes: string[];
};

const audio =
  'Audio is mono, 16 kHz, signed 16-bit PCM. Push chunks of any size; the engine buffers them into 512-sample (32 ms) frames.';
const thresholds =
  'A phrase always comes with its thresholds: they are calibrated for that phrase and that model, and the engine needs them to decide when it was said. The generator makes them from text (phonletai.com/generator, or the wake-threshold command) and writes them into your keyword file.';

export const sdkDocs: SdkDoc[] = [
  {
    slug: 'nodejs',
    label: 'Node.js',
    title: 'Phonlet Wake for Node.js.',
    description: 'A native add-on with the engine built in, for services, tools, and Linux apps.',
    intro:
      'The Node.js SDK is a Node-API add-on with the engine compiled in. Installing it compiles nothing and downloads nothing. It is tested on Node 24 on Linux x64.',
    codeTitle: 'wake.mjs',
    code: nodeCode,
    steps: [
      'Make a keyword file for your phrases with the generator: each phrase gets its pronunciations and its loose and strict thresholds, calibrated for this model.',
      'Create one Wake with the model and your phrases, each with its own sensitivity if you like. Pass the keyword file from the generator as a path, as the parsed object, or as phrases written in code; a file that names its model is checked against it by SHA-256.',
      'Call process() with Int16Array chunks; it returns the detections in that chunk.',
      'Call close() when you are done. finish() and close() are safe to call twice.',
    ],
    notes: [
      audio,
      thresholds,
      'process() is synchronous. Run the instance in a worker thread if your application cannot block the event loop.',
      'Each detection carries the phrase, its index, the frame, and a timestamp at the end of the frame.',
      'CommonJS and ES modules expose the same exports, with TypeScript declarations included.',
    ],
  },
  {
    slug: 'python',
    label: 'Python',
    title: 'Phonlet Wake for Python.',
    description: 'A wheel with the engine built in, for prototypes, research, and Linux devices.',
    intro:
      'The Python SDK is a wheel that bundles the engine and uses NumPy. It needs no compiler, lexicon, or network at runtime. It is tested on CPython 3.12 on Linux x64.',
    codeTitle: 'wake.py',
    code: pythonCode,
    steps: [
      'Make a keyword file for your phrases with the generator: each phrase gets its pronunciations and its loose and strict thresholds, calibrated for this model.',
      'Create a Wake with the model and your phrases, inside a with block so it closes on success and on errors. Pass the keyword file from the generator as a path, as the parsed dict, or as phrases written in code; a file that names its model is checked against it by SHA-256.',
      'Pass int16 NumPy arrays to process(); it returns the detections in that chunk.',
      'Call finish() at the end of a stream to see how many trailing samples did not fill a frame.',
    ],
    notes: [
      audio,
      thresholds,
      'Each detection has keyword_id, keyword, keyword_index, frame_index, sample_index, time_seconds, and the sensitivity used.',
      'Microphone input is an optional extra (sounddevice with PortAudio); detection itself has no audio dependency.',
    ],
  },
  {
    slug: 'c',
    label: 'C / C++',
    title: 'Phonlet Wake in C and C++.',
    description: 'One header and one library for native apps, embedded Linux, and your own SDK.',
    intro:
      'The C API is one header, phonlet_wake.h, and one library: the supported, stable public interface of the engine. It is tested on Linux x64; the Android and ESP32-S3 SDKs are built on it.',
    codeTitle: 'wake.c',
    code: cCode,
    steps: [
      'phonlet_wake_init() loads the model from a path; phonlet_wake_init_bytes() takes it from memory, for example from flash.',
      'Pass the keyword file from the generator as JSON text (or just its phrase array); phonlet_wake_keyword_count() tells you how many phrases it holds. Give one sensitivity per phrase, from 0 (fewest false alarms) to 1 (most responsive).',
      'phonlet_wake_process() reports the index of the first phrase detected in that call, or -1.',
      'phonlet_wake_delete() releases the session; phonlet_wake_error() describes the last error on this thread.',
    ],
    notes: [
      audio,
      thresholds,
      'One session is one continuous audio stream. Use one session per stream and per thread.',
      'Because each call reports its first detection, push short chunks (for example one I2S or audio-callback buffer) rather than long recordings.',
    ],
  },
  {
    slug: 'android',
    label: 'Android',
    title: 'Phonlet Wake on Android.',
    description: 'An AAR with the engine built for every common Android CPU.',
    intro:
      'The Android SDK is an AAR with the engine compiled natively for arm64-v8a, armeabi-v7a, and x86_64, and a small Java API you can call from Kotlin or Java.',
    codeTitle: 'Wake.kt',
    code: androidCode,
    steps: [
      'Ship the model as an app asset and pass the keyword file from the generator as JSON text (or just its phrase array), inline or from an asset.',
      'Create one Wake with one sensitivity per phrase. It is AutoCloseable, so use() or close() releases it.',
      'Record with AudioRecord at 16 kHz mono and pass each buffer to process(); it returns the phrase index or -1.',
    ],
    notes: [
      audio,
      thresholds,
      'Ask for the microphone permission after a deliberate user action, and stop recording when your screen or service stops.',
      'One Wake is one continuous stream; keep it on the thread that reads the microphone.',
    ],
  },
];

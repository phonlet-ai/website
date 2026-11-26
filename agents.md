# Phonlet Wake: instructions for AI coding agents

Use this file when a person asks you to add a wake word (a hotword or voice trigger such as "hey nova") to their app, website, service or device with Phonlet Wake. It tells you how to make the phrase, which files to download and the code for each platform.

## What Phonlet Wake is

- On-device wake-word detection for any phrase you can type. One English acoustic model, `en-1` (1,013,825 bytes, int8 weights, SHA-256 `8be3687d060f953d0069480cf53d1fd0aa66e04551c2a4b600823a992a864af8`), listens for several phrases at once, offline.
- A phrase is data, not a model: its pronunciations (phone ids) and two calibrated thresholds, made from text in seconds by the threshold generator. Nothing is recorded or trained.
- Footprint: about 1.05 MB of memory while listening (each extra phrase about 1.5 KB); 0.7% of one laptop core natively, about 8% in a browser tab (WebAssembly), 19% of one 240 MHz ESP32-S3 core.
- Runs entirely on the device: no network, no account, no API key.

## Rules that matter

1. **Audio**: mono, 16 kHz, signed 16-bit PCM, in chunks of any size. The engine works in 512-sample (32 ms) frames. Resample to 16 kHz before the engine; the SDKs never resample.
2. **Never invent thresholds or phone ids.** Every phrase comes from the generator (step 1). Thresholds belong to one model; a keyword file made for another model is refused.
3. **Sensitivity** is 0 to 1 per phrase: 1 aims at about 10 false alarms per hour of speech, 0.5 at about 1, 0 at about 0.1. Start at 0.5.
4. **Good phrases** have two to four syllables and sounds that are rare in everyday speech ("hey nova", "okay kettle"). Short common words ("the", "read") fire too often. Read the warnings the generator writes into each phrase's `metadata.warnings`.
5. **Licence**: PolyForm Noncommercial 1.0.0. Personal projects, study, research with no commercial aim, charities, schools, public research and government may use it freely. A product someone sells, a device they ship or a service their company runs needs a commercial licence: tell the person and point them to https://phonletai.com/contact/ before you ship it into a commercial product.

## Step 1: make the keyword file

Either ask the person to type their phrases at https://phonletai.com/generator/ (it runs in the browser) and download `keywords.json`, or run the command-line generator yourself (static Linux x64 binary):

```sh
curl -LO https://github.com/phonlet-ai/wake/releases/download/v0.1.0/wake-threshold-0.2.0-x86_64-unknown-linux-musl
chmod +x wake-threshold-0.2.0-x86_64-unknown-linux-musl
./wake-threshold-0.2.0-x86_64-unknown-linux-musl "hey nova" "okay kettle" --out keywords.json
```

Words missing from the 394,000-word dictionary get a predicted pronunciation (`metadata.source` is `g2p`); to set it yourself write the phones: `"zorblax=Z AO R B L AE K S"`, several separated by `|`. `--strict` rejects phrases with quality warnings; exit status 0 means at least one phrase was enrolled. The keyword file looks like this (metadata shortened):

```json
{
  "model": {
    "id": "en-1",
    "sha256": "8be3687d060f953d0069480cf53d1fd0aa66e04551c2a4b600823a992a864af8"
  },
  "keywords": [
    {
      "name": "hey nova",
      "pronunciations": [[16, 13, 23, 25, 35, 3]],
      "threshold_loose": -1.267578125,
      "threshold_strict": -0.9033203125,
      "endpoint": false,
      "metadata": { "source": "lexicon", "warnings": [] }
    }
  ]
}
```

## Step 2: get the model and the SDK

Release v0.1.0: https://github.com/phonlet-ai/wake/releases/tag/v0.1.0 (every file is listed in `SHA256SUMS`).

| Platform | Files | Install |
| --- | --- | --- |
| Python (CPython 3.11+, Linux x64) | `phonlet_wake-0.1.0-py3-none-linux_x86_64.whl`, `phonlet_wake_model_en-0.1.0-py3-none-any.whl` | `pip install https://github.com/phonlet-ai/wake/releases/download/v0.1.0/phonlet_wake-0.1.0-py3-none-linux_x86_64.whl https://github.com/phonlet-ai/wake/releases/download/v0.1.0/phonlet_wake_model_en-0.1.0-py3-none-any.whl` |
| Node.js (Linux x64) | `phonlet-ai-wake-node-0.1.0.tgz`, `phonlet-ai-wake-node-linux-x64-gnu-0.1.0.tgz`, `phonlet-ai-wake-model-en-0.1.0.tgz` | `npm install --ignore-scripts https://github.com/phonlet-ai/wake/releases/download/v0.1.0/phonlet-ai-wake-node-0.1.0.tgz https://github.com/phonlet-ai/wake/releases/download/v0.1.0/phonlet-ai-wake-node-linux-x64-gnu-0.1.0.tgz https://github.com/phonlet-ai/wake/releases/download/v0.1.0/phonlet-ai-wake-model-en-0.1.0.tgz` |
| Browser | `phonlet-ai-wake-web-0.1.0.tgz` (React hook: `phonlet-ai-wake-react-0.1.0.tgz`) | Serve the package's files from your origin; the SDK runs the engine in a Web Worker |
| C / C++ | `wake-native-0.1.0-linux-x64-gnu.tar.gz`, `wake-native-0.1.0-windows-x64.zip` | Include `phonlet_wake.h`, link `kws_engine` |
| Android | `phonlet-wake-android-0.1.0.aar` | Add the AAR to the app module |
| .NET | `kws_engine.dll` from the Windows zip | Use `sdk/dotnet` from the repository |
| ESP32-S3 | The ESP-IDF component in `sdk/esp32/wake` of the repository | Embed the model and the keyword file in flash |
| Any | `phonlet-wake-en-1.pwake` (the model), `phonlet-wake-en-1-keywords.json` (five English phrases) | https://github.com/phonlet-ai/wake/releases/download/v0.1.0/phonlet-wake-en-1.pwake |

macOS and other targets build from source: see the repository README. The Linux x64 native libraries (C, Python, Node.js) need glibc 2.32 and the libstdc++ of GCC 11 or newer (Ubuntu 22.04, Debian 12, RHEL 9 or later); the generator binary is static.

## Step 3: the code

Every SDK takes the keyword file as a path (or URL in the browser), as the parsed object, or as the list of phrases written in code.

The examples below load the model from `en-1.pwake` and write one phrase inline; replace both with your files. The model is in the model packages: Python `from phonlet_wake_model_en import english` then `english["model"]`; Node.js `import { english } from '@phonlet-ai/wake-model-en'` then `english.model`. Anywhere else use the path where you saved `phonlet-wake-en-1.pwake`.

### Browser (microphone, in a worker)

These run as written on https://phonletai.com, which serves the SDK, the model and a keyword file at `/wake/`; in your project, serve the browser package and your own files the same way.

```js
import { WakeManager } from '/wake/capture.mjs';

// The en-1 model and a keyword file from the generator.
const wake = new WakeManager({
  wake: { model: '/wake/model.pwake', keywords: '/wake/keywords.json' },
  onDetection: (event) => console.log('Wake word:', event.keyword),
  onError: (error) => console.error(error),
});

// Asks for the microphone; detection runs in a worker.
export const start = () => wake.start();
export const stop = () => wake.close();
```

Processing your own audio instead of the microphone:

```js
import { Wake } from '/wake/index.mjs';

// 1. One model, and your phrases: a keyword file from the generator
//    (its URL, the parsed file, or phrases written in code).
const wake = await Wake.create({
  model: '/wake/model.pwake',
  keywords: '/wake/keywords.json',
  sensitivity: 0.5, // 0 = fewest false alarms, 1 = most responsive
});

// 2. Push 16 kHz mono Int16 PCM, up to 4096 samples at a time.
export async function onAudio(pcm) {
  for (const event of await wake.process(pcm)) {
    console.log('Wake word:', event.keyword, event.timeSeconds);
  }
}

// 3. Release the worker when you are done.
export const close = () => wake.close();
```

### Node.js

The Node.js SDK is a Node-API add-on with the engine compiled in. Installing it compiles nothing and downloads nothing. It is tested on Node 24 on Linux x64.

```js
import { Wake } from '@phonlet-ai/wake-node';

// A phrase is its pronunciations and two calibrated thresholds.
const heyKettle = {
  name: 'hey kettle',
  pronunciations: [[16, 13, 20, 11, 31, 3, 21]],
  threshold_loose: -1.21875,
  threshold_strict: -0.8740234375,
  endpoint: true,
};

// One engine and one model for every phrase.
const wake = await Wake.create({
  model: 'en-1.pwake',
  keywords: [heyKettle],
  sensitivity: 0.5,
});

// Push 16 kHz mono Int16 PCM in chunks of any size.
export function onAudio(pcm) {
  for (const hit of wake.process(pcm)) {
    console.log('Wake word:', hit.keyword);
  }
}

// Release native memory when you are done.
export function close() {
  wake.close();
}
```

- Make a keyword file for your phrases with the generator: each phrase gets its pronunciations and its loose and strict thresholds, calibrated for this model.
- Create one Wake with the model and your phrases, each with its own sensitivity if you like. Pass the keyword file from the generator as a path, as the parsed object, or as phrases written in code; a file that names its model is checked against it by SHA-256.
- Call process() with Int16Array chunks; it returns the detections in that chunk.
- Call close() when you are done. finish() and close() are safe to call twice.

Install:

```sh
npm install --ignore-scripts \
  https://github.com/phonlet-ai/wake/releases/download/v0.1.0/phonlet-ai-wake-node-0.1.0.tgz \
  https://github.com/phonlet-ai/wake/releases/download/v0.1.0/phonlet-ai-wake-node-linux-x64-gnu-0.1.0.tgz \
  https://github.com/phonlet-ai/wake/releases/download/v0.1.0/phonlet-ai-wake-model-en-0.1.0.tgz
```

The SDK, its Linux x64 add-on and the model package. In the example, `en-1.pwake` is the model: `english.model` from `@phonlet-ai/wake-model-en`, or `phonlet-wake-en-1.pwake` from the release.

### Python

The Python SDK is a wheel that bundles the engine and uses NumPy. It needs no compiler, lexicon, or network at runtime. It is tested on CPython 3.12 on Linux x64.

```python
from phonlet_wake import Wake

# A phrase is its pronunciations and two calibrated thresholds.
hey_kettle = {
    "name": "hey kettle",
    "pronunciations": [[16, 13, 20, 11, 31, 3, 21]],
    "threshold_loose": -1.21875,
    "threshold_strict": -0.8740234375,
    "endpoint": True,
}

# One engine and one model for every phrase.
with Wake.create(model="en-1.pwake", keywords=[hey_kettle],
                 sensitivity=0.5) as wake:
    # Push 16 kHz mono int16 NumPy arrays in chunks of any size.
    for pcm in audio_chunks():  # your microphone or file
        for hit in wake.process(pcm):
            print("Wake word:", hit.keyword)
```

- Make a keyword file for your phrases with the generator: each phrase gets its pronunciations and its loose and strict thresholds, calibrated for this model.
- Create a Wake with the model and your phrases, inside a with block so it closes on success and on errors. Pass the keyword file from the generator as a path, as the parsed dict, or as phrases written in code; a file that names its model is checked against it by SHA-256.
- Pass int16 NumPy arrays to process(); it returns the detections in that chunk.
- Call finish() at the end of a stream to see how many trailing samples did not fill a frame.

Install:

```sh
pip install \
  https://github.com/phonlet-ai/wake/releases/download/v0.1.0/phonlet_wake-0.1.0-py3-none-linux_x86_64.whl \
  https://github.com/phonlet-ai/wake/releases/download/v0.1.0/phonlet_wake_model_en-0.1.0-py3-none-any.whl
```

The SDK wheel and the model wheel. In the example, `en-1.pwake` is the model: `english["model"]` from `phonlet_wake_model_en`, or `phonlet-wake-en-1.pwake` from the release.

### C / C++

The C API is one header, phonlet_wake.h, and one library: the supported, stable public interface of the engine. It is tested on Linux x64; the Android and ESP32-S3 SDKs are built on it.

```c
#include <stdio.h>
#include "phonlet_wake.h"

// A phrase is its pronunciations and two calibrated thresholds.
static const char *keywords =
    "[{\"name\": \"hey kettle\","
    "  \"pronunciations\": [[16, 13, 20, 11, 31, 3, 21]],"
    "  \"threshold_loose\": -1.21875,"
    "  \"threshold_strict\": -0.8740234375,"
    "  \"endpoint\": true}]";

static pw_wake *wake;

// One engine and one model for every phrase.
int start(void) {
  const double sensitivity[] = {0.5}; // one per phrase
  return phonlet_wake_init("en-1.pwake", keywords, sensitivity, 1,
                           &wake);
}

// Push 16 kHz mono int16 PCM in chunks of any size.
void on_audio(const int16_t *pcm, int32_t samples) {
  int32_t fired = -1;
  if (phonlet_wake_process(wake, pcm, samples, &fired) == PW_OK
      && fired >= 0)
    printf("Wake word: %d\n", fired);
}

// Release the session when you are done.
void stop(void) { phonlet_wake_delete(wake); }
```

- phonlet_wake_init() loads the model from a path; phonlet_wake_init_bytes() takes it from memory, for example from flash.
- Pass the keyword file from the generator as JSON text (or just its phrase array); phonlet_wake_keyword_count() tells you how many phrases it holds. Give one sensitivity per phrase, from 0 (fewest false alarms) to 1 (most responsive).
- phonlet_wake_process() reports the index of the first phrase detected in that call, or -1.
- phonlet_wake_delete() releases the session; phonlet_wake_error() describes the last error on this thread.

Install:

```sh
curl -LO https://github.com/phonlet-ai/wake/releases/download/v0.1.0/wake-native-0.1.0-linux-x64-gnu.tar.gz
tar xzf wake-native-0.1.0-linux-x64-gnu.tar.gz
# CMake: find_package(Wake) and link Wake::engine,
# configured with -DCMAKE_PREFIX_PATH=$PWD/wake-native-0.1.0
```

Linux x64: `wake-native-0.1.0-linux-x64-gnu.tar.gz` (header, `libkws_engine.so`, CMake package). Windows x64: `wake-native-0.1.0-windows-x64.zip` (`kws_engine.dll` and its import library). In the example, `en-1.pwake` is `phonlet-wake-en-1.pwake` from the release.

### Android

The Android SDK is an AAR with the engine compiled natively for arm64-v8a, armeabi-v7a, and x86_64, and a small Java API you can call from Kotlin or Java.

```kotlin
// A phrase is its pronunciations and two calibrated thresholds.
val keywords = """
    [{"name": "hey kettle",
      "pronunciations": [[16, 13, 20, 11, 31, 3, 21]],
      "threshold_loose": -1.21875,
      "threshold_strict": -0.8740234375,
      "endpoint": true}]
""".trimIndent()

// One engine and one model for every phrase.
val model = assets.open("en-1.pwake").readBytes()
val wake = Wake.create(model, keywords, 0.5) // one per phrase

// Push 16 kHz mono PCM from AudioRecord in chunks of any size.
fun onAudio(pcm: ShortArray, samples: Int) {
    val fired = wake.process(pcm, 0, samples) // -1: nothing
    if (fired >= 0) Log.i("Wake", "Wake word: $fired")
}

// Release native memory when you are done.
fun close() = wake.close()
```

- Ship the model as an app asset and pass the keyword file from the generator as JSON text (or just its phrase array), inline or from an asset.
- Create one Wake with one sensitivity per phrase. It is AutoCloseable, so use() or close() releases it.
- Record with AudioRecord at 16 kHz mono and pass each buffer to process(); it returns the phrase index or -1.

Install:

Download `phonlet-wake-android-0.1.0.aar` into your app module's `libs/` and add `implementation(files("libs/phonlet-wake-android-0.1.0.aar"))`. In the example, `en-1.pwake` is `phonlet-wake-en-1.pwake` from the release, saved in the app's assets.

### ESP32-S3

ESP-IDF component with its own engine for the chip's vector unit; about 19% of one core at the default setting. Needs PSRAM (the weights take 934 KB of it plus 75 KB of internal RAM) and an I2S microphone at 16 kHz.

```c
#include <stdio.h>
#include "esp_wake.h"

// A phrase is its pronunciations and two calibrated thresholds.
static const char keywords[] =
    "[{\"name\": \"hey kettle\","
    "  \"pronunciations\": [[16, 13, 20, 11, 31, 3, 21]],"
    "  \"threshold_loose\": -1.21875,"
    "  \"threshold_strict\": -0.8740234375,"
    "  \"endpoint\": true}]";

// The model, embedded in flash.
extern const uint8_t model[] asm("_binary_model_pwake_start");
extern const uint8_t model_end[] asm("_binary_model_pwake_end");

static pw_wake *wake;

void start(void) {
  if (esp_wake_begin(model, model_end - model, keywords, 0.5f,
                     &wake) != PW_OK)
    printf("Wake init failed: %s\n", phonlet_wake_error());
}

// Push 16 kHz mono int16 PCM from the I2S microphone.
void on_audio(const int16_t *pcm, int32_t samples) {
  int32_t fired;
  esp_wake_feed(wake, pcm, samples, &fired);
  if (fired >= 0)
    printf("Wake word: %s\n", esp_wake_keyword_name(fired));
}
```

Install:

```sh
git clone --depth 1 --branch v0.1.0 https://github.com/phonlet-ai/wake.git
curl -L -o main/model.pwake https://github.com/phonlet-ai/wake/releases/download/v0.1.0/phonlet-wake-en-1.pwake
# In your project CMakeLists.txt, before project():
#   set(EXTRA_COMPONENT_DIRS path/to/wake/sdk/esp32/wake)
```

The component builds the engine from the repository checkout, so clone it and point `EXTRA_COMPONENT_DIRS` at `sdk/esp32/wake`. Embed the model as `model.pwake` (`EMBED_FILES` in `main/CMakeLists.txt`) and your keyword file with `EMBED_TXTFILES`; `demos/esp32` in the repository is a complete project.

## When it does not work

- `INCOMPATIBLE_ARTIFACT` / "made for model …": the keyword file belongs to another model. Use the `en-1` model from the same release, or regenerate the file.
- Nothing fires: check the audio really is 16 kHz mono 16-bit (a 44.1 or 48 kHz stream must be resampled first), raise the sensitivity a step (0.6 to 0.7), and read the phrase's `metadata.warnings`.
- Too many false alarms: lower the sensitivity, or choose a longer, more distinctive phrase.
- Browser: use HTTPS or localhost; ask for the microphone only after a click; close the manager when done so tracks, the audio context and the worker stop.

## More

- Documentation index for AI assistants: https://phonletai.com/llms.txt
- Docs: https://phonletai.com/docs/
- Keyword file reference: https://github.com/phonlet-ai/wake/blob/main/docs/keywords.md
- Source and releases: https://github.com/phonlet-ai/wake
- The model on Hugging Face: https://huggingface.co/phonletai/wake-en-1; the lab as a Space: https://huggingface.co/spaces/phonletai/wake
- Commercial licences: https://phonletai.com/contact/

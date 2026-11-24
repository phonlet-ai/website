// Code samples shown on the site. tests/browser/samples.spec.ts runs the browser samples
// unchanged against the SDK this site serves at /wake/, so every published sample is known to work.
export const wakeCode = `import { WakeManager } from '/wake/capture.mjs';

// The en-1 model and a keyword file from the generator.
const wake = new WakeManager({
  wake: { model: '/wake/model.pwake', keywords: '/wake/keywords.json' },
  onDetection: (event) => console.log('Wake word:', event.keyword),
  onError: (error) => console.error(error),
});

// Asks for the microphone; detection runs in a worker.
export const start = () => wake.start();
export const stop = () => wake.close();`;

export const quickstartCode = `import { Wake } from '/wake/index.mjs';

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
export const close = () => wake.close();`;

// One phrase of the site's keyword file (public/wake/keywords.json), metadata shortened.
export const keywordFileCode = `{
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
}`;

// The SDK examples below run against the Phonlet Wake SDKs, not this website, so the browser
// test cannot run them. Each was run as shown (with real audio) before publishing; see PLAN.md.
export const nodeCode = `import { Wake } from '@phonlet-ai/wake-node';

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
}`;

export const pythonCode = `from phonlet_wake import Wake

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
            print("Wake word:", hit.keyword)`;

export const cCode = `#include <stdio.h>
#include "phonlet_wake.h"

// A phrase is its pronunciations and two calibrated thresholds.
static const char *keywords =
    "[{\\"name\\": \\"hey kettle\\","
    "  \\"pronunciations\\": [[16, 13, 20, 11, 31, 3, 21]],"
    "  \\"threshold_loose\\": -1.21875,"
    "  \\"threshold_strict\\": -0.8740234375,"
    "  \\"endpoint\\": true}]";

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
    printf("Wake word: %d\\n", fired);
}

// Release the session when you are done.
void stop(void) { phonlet_wake_delete(wake); }`;

export const androidCode = `// A phrase is its pronunciations and two calibrated thresholds.
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
fun close() = wake.close()`;

export const espCode = `#include <stdio.h>
#include "esp_wake.h"

// A phrase is its pronunciations and two calibrated thresholds.
static const char keywords[] =
    "[{\\"name\\": \\"hey kettle\\","
    "  \\"pronunciations\\": [[16, 13, 20, 11, 31, 3, 21]],"
    "  \\"threshold_loose\\": -1.21875,"
    "  \\"threshold_strict\\": -0.8740234375,"
    "  \\"endpoint\\": true}]";

// The model, embedded in flash.
extern const uint8_t model[] asm("_binary_model_pwake_start");
extern const uint8_t model_end[] asm("_binary_model_pwake_end");

static pw_wake *wake;

void start(void) {
  if (esp_wake_begin(model, model_end - model, keywords, 0.5f,
                     &wake) != PW_OK)
    printf("Wake init failed: %s\\n", phonlet_wake_error());
}

// Push 16 kHz mono int16 PCM from the I2S microphone.
void on_audio(const int16_t *pcm, int32_t samples) {
  int32_t fired;
  esp_wake_feed(wake, pcm, samples, &fired);
  if (fired >= 0)
    printf("Wake word: %s\\n", esp_wake_keyword_name(fired));
}`;

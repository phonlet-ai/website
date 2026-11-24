// The Phonlet Wake release the site points at: its file names, the install command for each SDK
// and where each SDK finds the model. The docs pages and /agents.md both read this, so they agree.
import { site } from '@/lib/site';

export const RELEASE = 'v0.1.0';
export const MODEL_FILE = 'phonlet-wake-en-1.pwake';
export const KEYWORDS_FILE = 'phonlet-wake-en-1-keywords.json';
export const GENERATOR_FILE = 'wake-threshold-0.2.0-x86_64-unknown-linux-musl';

const repo = (site.REPO_URL ?? 'https://github.com/phonlet-ai/wake').replace(/\/$/, '');
export const repoUrl = repo;
export const releaseUrl = `${repo}/releases/tag/${RELEASE}`;
export const assetUrl = (name: string) => `${repo}/releases/download/${RELEASE}/${name}`;

export type Install = {
  /** Shell commands that install the SDK, when there is one to copy. */
  command?: string;
  /** What to download and where the examples' `en-1.pwake` comes from; `code` in backticks. */
  text: string;
};

const NODE = [
  'phonlet-ai-wake-node-0.1.0.tgz',
  'phonlet-ai-wake-node-linux-x64-gnu-0.1.0.tgz',
  'phonlet-ai-wake-model-en-0.1.0.tgz',
];
const PYTHON = [
  'phonlet_wake-0.1.0-py3-none-linux_x86_64.whl',
  'phonlet_wake_model_en-0.1.0-py3-none-any.whl',
];

export const installs: Record<string, Install> = {
  nodejs: {
    command: ['npm install --ignore-scripts', ...NODE.map(assetUrl)].join(' \\\n  '),
    text: `The SDK, its Linux x64 add-on and the model package. In the example, \`en-1.pwake\` is the model: \`english.model\` from \`@phonlet-ai/wake-model-en\`, or \`${MODEL_FILE}\` from the release.`,
  },
  python: {
    command: ['pip install', ...PYTHON.map(assetUrl)].join(' \\\n  '),
    text: `The SDK wheel and the model wheel. In the example, \`en-1.pwake\` is the model: \`english["model"]\` from \`phonlet_wake_model_en\`, or \`${MODEL_FILE}\` from the release.`,
  },
  c: {
    command: [
      `curl -LO ${assetUrl('wake-native-0.1.0-linux-x64-gnu.tar.gz')}`,
      'tar xzf wake-native-0.1.0-linux-x64-gnu.tar.gz',
      '# CMake: find_package(Wake) and link Wake::engine,',
      '# configured with -DCMAKE_PREFIX_PATH=$PWD/wake-native-0.1.0',
    ].join('\n'),
    text: `Linux x64: \`wake-native-0.1.0-linux-x64-gnu.tar.gz\` (header, \`libkws_engine.so\`, CMake package). Windows x64: \`wake-native-0.1.0-windows-x64.zip\` (\`kws_engine.dll\` and its import library). In the example, \`en-1.pwake\` is \`${MODEL_FILE}\` from the release.`,
  },
  android: {
    text: `Download \`phonlet-wake-android-0.1.0.aar\` into your app module's \`libs/\` and add \`implementation(files("libs/phonlet-wake-android-0.1.0.aar"))\`. In the example, \`en-1.pwake\` is \`${MODEL_FILE}\` from the release, saved in the app's assets.`,
  },
  esp32: {
    command: [
      `git clone --depth 1 --branch ${RELEASE} ${repo}.git`,
      `curl -L -o main/model.pwake ${assetUrl(MODEL_FILE)}`,
      '# In your project CMakeLists.txt, before project():',
      '#   set(EXTRA_COMPONENT_DIRS path/to/wake/sdk/esp32/wake)',
    ].join('\n'),
    text: `The component builds the engine from the repository checkout, so clone it and point \`EXTRA_COMPONENT_DIRS\` at \`sdk/esp32/wake\`. Embed the model as \`model.pwake\` (\`EMBED_FILES\` in \`main/CMakeLists.txt\`) and your keyword file with \`EMBED_TXTFILES\`; \`demos/esp32\` in the repository is a complete project.`,
  },
};
